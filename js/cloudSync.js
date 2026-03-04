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

        // Pesos (por definir en próxima iteración, distribución equitativa por ahora)
        const W1 = 0.34, W2 = 0.33, W3 = 0.33;

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
        await this.db.ref(`users/${uid}/stats/community_score`).set(communityScore);
        await this.db.ref(`users/${uid}/stats/score_correctas`).set(Math.round(scoreC * 10) / 10);
        await this.db.ref(`users/${uid}/stats/score_tiempo`).set(Math.round(scoreT * 10) / 10);
        await this.db.ref(`users/${uid}/stats/score_accuracy`).set(Math.round(scoreA * 10) / 10);
        await this.db.ref(`leaderboard/players/${uid}/community_score`).set(communityScore);
    }
};

// Inicializar cuando el DOM esté listo
document.addEventListener('DOMContentLoaded', () => {
    setTimeout(() => {
        CloudSync.init();
    }, 600);
});
