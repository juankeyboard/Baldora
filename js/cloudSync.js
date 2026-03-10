/**
 * CLOUDSYNC.JS - Sincronización de datos con Firebase (Feature 14)
 * Baldora - Guarda partidas, actualiza stats y leaderboard
 * Módulo estrictamente aditivo, no modifica data.js ni app.js
 */

const CloudSync = {
    db: null,

    /**
     * Inicializa la referencia a la base de datos
     */
    init() {
        if (typeof firebase !== 'undefined' && firebase.database) {
            this.db = firebase.database();
        }
    },

    /**
     * Guarda la partida actual en Firebase.
     * Llamado desde el hook en app.js endGame() solo si el usuario está autenticado.
     */
    async saveGame() {
        if (!this.db) this.init();
        if (!this.db) return;
        if (!AuthManager.isLoggedIn()) return;

        const user = AuthManager.getUser();
        const uid = user.uid;
        const sessionData = DataManager.sessionData;

        if (!sessionData || sessionData.length === 0) return;

        // Calcular estadísticas de la partida
        const stats = DataManager.getSessionStats();
        const correctAttempts = sessionData.filter(a => a.is_correct === 1);
        const avgCorrectTime = correctAttempts.length > 0
            ? Math.round(correctAttempts.reduce((s, a) => s + a.response_time, 0) / correctAttempts.length)
            : 0;

        const gameMode = sessionData[0]?.game_mode || 'UNKNOWN';
        const tables = {
            rows: [...new Set(sessionData.map(a => a.factor_a))].sort((a, b) => a - b),
            cols: [...new Set(sessionData.map(a => a.factor_b))].sort((a, b) => a - b)
        };

        // Calcular duración de la sesión (diferencia entre primer y último timestamp)
        const timestamps = sessionData.map(a => new Date(a.timestamp).getTime());
        const durationMs = timestamps.length > 1
            ? timestamps[timestamps.length - 1] - timestamps[0]
            : 0;

        // Datos de la partida
        const gameData = {
            timestamp: new Date().toISOString(),
            game_mode: gameMode,
            duration_ms: durationMs,
            total_operations: stats.total,
            correct_operations: stats.correct,
            accuracy: stats.accuracy,
            avg_response_time: avgCorrectTime || stats.avgTime,
            tables_used: tables,
            ai_analysis: null,
            attempts: sessionData.map((a, i) => ({
                index: i,
                factor_a: a.factor_a,
                factor_b: a.factor_b,
                user_input: a.user_input,
                correct_result: a.correct_result,
                is_correct: a.is_correct === 1,
                response_time: a.response_time
            }))
        };

        try {
            // Guardar partida
            const gameRef = this.db.ref(`users/${uid}/games`);
            const newGameRef = await gameRef.push(gameData);
            const gameId = newGameRef.key;

            // Guardar gameId en window para que GeminiService lo use al guardar análisis
            window.lastCloudGameId = gameId;
            window.lastCloudUid = uid;

            // Actualizar stats agregados del usuario
            await this._updateUserStats(uid, stats, avgCorrectTime || stats.avgTime);

            // Actualizar leaderboard
            await this._updateLeaderboard(uid, user);

            // Recalcular tiers y ligas de todos los jugadores
            await this._recalculateAllTiers();

            console.log('Partida guardada en la nube:', gameId);
        } catch (err) {
            console.error('Error al guardar partida en la nube:', err);
        }
    },

    /**
     * Guarda el análisis de IA de la última partida en la DB
     */
    async saveAiAnalysis(analysisData) {
        if (!this.db || !window.lastCloudGameId || !window.lastCloudUid) return;

        const ref = this.db.ref(`users/${window.lastCloudUid}/games/${window.lastCloudGameId}/ai_analysis`);
        await ref.set({
            generated_at: new Date().toISOString(),
            ...analysisData
        }).catch(err => console.error('Error al guardar análisis IA:', err));
    },

    /**
     * Actualiza las estadísticas agregadas del jugador
     */
    async _updateUserStats(uid, sessionStats, avgCorrectTime) {
        const statsRef = this.db.ref(`users/${uid}/stats`);

        await statsRef.transaction(current => {
            const s = current || {
                total_games: 0,
                total_operations: 0,
                total_correct: 0,
                global_accuracy: 0,
                avg_response_time: 0,
                best_accuracy: 0,
                best_avg_time: Infinity
            };

            const newTotalGames = s.total_games + 1;
            const newTotalOps = s.total_operations + sessionStats.total;
            const newTotalCorrect = s.total_correct + sessionStats.correct;
            const newGlobalAccuracy = newTotalOps > 0
                ? Math.round((newTotalCorrect / newTotalOps) * 100 * 10) / 10
                : 0;

            // Promedio ponderado del tiempo de respuesta
            const newAvgTime = s.total_operations > 0
                ? Math.round((s.avg_response_time * s.total_operations + avgCorrectTime * sessionStats.total) / newTotalOps)
                : avgCorrectTime;

            return {
                total_games: newTotalGames,
                total_operations: newTotalOps,
                total_correct: newTotalCorrect,
                global_accuracy: newGlobalAccuracy,
                avg_response_time: newAvgTime,
                best_accuracy: Math.max(s.best_accuracy || 0, sessionStats.accuracy),
                best_avg_time: Math.min(s.best_avg_time === Infinity ? avgCorrectTime : s.best_avg_time, avgCorrectTime),
                community_score: 0, // Se recalcula después
                last_updated: new Date().toISOString()
            };
        });

        // Recalcular community score después de actualizar stats
        await this._recalculateCommunityScore(uid);
    },

    /**
     * Actualiza los benchmarks de la comunidad y la entrada del jugador en el leaderboard
     */
    async _updateLeaderboard(uid, user) {
        const statsSnap = await this.db.ref(`users/${uid}/stats`).once('value');
        const stats = statsSnap.val();
        if (!stats) return;

        // Actualizar entrada del jugador en leaderboard
        await this.db.ref(`leaderboard/players/${uid}`).set({
            displayName: user.displayName || '',
            photoURL: user.photoURL || '',
            community_score: stats.community_score || 0,
            total_correct: stats.total_correct || 0,
            avg_response_time: stats.avg_response_time || 0,
            global_accuracy: stats.global_accuracy || 0,
            total_games: stats.total_games || 0,
            last_played: new Date().toISOString()
        });

        // Actualizar benchmarks de la comunidad
        await this._updateCommunityBenchmarks(stats);
    },

    /**
     * Actualiza los benchmarks globales de la comunidad
     */
    async _updateCommunityBenchmarks(playerStats) {
        const benchRef = this.db.ref('leaderboard/community_benchmarks');
        await benchRef.transaction(current => {
            const b = current || {
                max_total_correct: 0,
                min_response_time: 99999,
                max_response_time: 0,
                min_accuracy: 100,
                max_accuracy: 0
            };

            return {
                max_total_correct: Math.max(b.max_total_correct || 0, playerStats.total_correct || 0),
                min_response_time: Math.min(b.min_response_time || 99999, playerStats.avg_response_time || 99999),
                max_response_time: Math.max(b.max_response_time || 0, playerStats.avg_response_time || 0),
                min_accuracy: Math.min(b.min_accuracy || 100, playerStats.global_accuracy || 100),
                max_accuracy: Math.max(b.max_accuracy || 0, playerStats.global_accuracy || 0)
            };
        });
    },

    /**
     * Recalcula el community score del jugador basado en benchmarks actuales
     */
    async _recalculateCommunityScore(uid) {
        const [statsSnap, benchSnap] = await Promise.all([
            this.db.ref(`users/${uid}/stats`).once('value'),
            this.db.ref('leaderboard/community_benchmarks').once('value')
        ]);

        const stats = statsSnap.val();
        const bench = benchSnap.val();
        if (!stats || !bench) return;

        // Pesos iguales: volumen, velocidad y asertividad con igual importancia
        const W1 = 1/3, W2 = 1/3, W3 = 1/3;

        // Score_C: Operaciones correctas vs máximo de la comunidad
        const scoreC = bench.max_total_correct > 0
            ? (stats.total_correct / bench.max_total_correct) * 100
            : 0;

        // Score_T: Tiempo promedio normalizado entre min y max de la comunidad
        const timeRange = (bench.max_response_time || 0) - (bench.min_response_time || 0);
        const scoreT = timeRange > 0
            ? ((bench.max_response_time - stats.avg_response_time) / timeRange) * 100
            : 50;

        // Score_A: Accuracy normalizada entre min y max de la comunidad
        const accRange = (bench.max_accuracy || 0) - (bench.min_accuracy || 0);
        const scoreA = accRange > 0
            ? ((stats.global_accuracy - bench.min_accuracy) / accRange) * 100
            : 50;

        const communityScore = Math.round((W1 * scoreC + W2 * scoreT + W3 * scoreA) * 10) / 10;

        // Actualizar score en stats y leaderboard
        // ⚡ Bolt Optimization: Batched update to avoid 5 sequential network roundtrips
        const updates = {};
        updates[`users/${uid}/stats/community_score`] = communityScore;
        updates[`users/${uid}/stats/score_correctas`] = Math.round(scoreC * 10) / 10;
        updates[`users/${uid}/stats/score_tiempo`] = Math.round(scoreT * 10) / 10;
        updates[`users/${uid}/stats/score_accuracy`] = Math.round(scoreA * 10) / 10;
        updates[`leaderboard/players/${uid}/community_score`] = communityScore;

        await this.db.ref().update(updates);
    },

    /**
     * Recalcula el tier y la liga de todos los jugadores del leaderboard.
     * Se llama cada vez que alguien guarda una práctica.
     * Tier = ceil(rank / total * 100), donde rank es posición por community_score desc.
     */
    async _recalculateAllTiers() {
        const playersSnap = await this.db.ref('leaderboard/players').once('value');
        const players = [];
        playersSnap.forEach(snap => {
            players.push({ uid: snap.key, ...snap.val() });
        });

        if (players.length === 0) return;

        // Ordenar por community_score descendente
        players.sort((a, b) => (b.community_score || 0) - (a.community_score || 0));

        const total = players.length;
        const updates = {};

        players.forEach((player, index) => {
            const rank = index + 1;
            const tier = Math.floor((rank - 1) / total * 100) + 1;
            const league = this._tierToLeague(tier);
            updates[`leaderboard/players/${player.uid}/tier`] = tier;
            updates[`leaderboard/players/${player.uid}/league`] = league;
        });

        await this.db.ref().update(updates);
    },

    /**
     * Convierte un tier (1-100) en nombre de liga
     */
    _tierToLeague(tier) {
        if (tier <= 5)  return 'DIAMANTE';
        if (tier <= 15) return 'PLATINO';
        if (tier <= 30) return 'ORO';
        if (tier <= 50) return 'PLATA';
        if (tier <= 70) return 'BRONCE';
        return 'MADERA';
    }
};

// Inicializar cuando el DOM esté listo
document.addEventListener('DOMContentLoaded', () => {
    setTimeout(() => {
        CloudSync.init();
    }, 600);
});
