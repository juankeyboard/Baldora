/**
 * CLOUDSYNC.JS - Sincronización de datos con Firebase (Feature 14)
 * Baldora - Guarda partidas, actualiza stats y leaderboard
 * Módulo estrictamente aditivo, no modifica data.js ni app.js
 */

const CloudSync = {
    db: null,

    init() {
        if (typeof firebase !== 'undefined' && firebase.database) {
            this.db = firebase.database();
            
            // Auto-migración al detectar login
            firebase.auth().onAuthStateChanged(user => {
                if (user) {
                    setTimeout(() => this._ensureGhostExists(user.uid), 2000);
                }
            });
        }
    },

    /**
     * Verifica si el usuario tiene un ghost y si no, promueve su mejor partida antigua.
     */
    async _ensureGhostExists(uid) {
        try {
            const ghostSnap = await this.db.ref(`users/${uid}/best_session_ghost`).once('value');
            if (ghostSnap.exists()) return;

            console.log('[CloudSync] Buscando mejor partida antigua para promover a Fantasma...');
            const gamesSnap = await this.db.ref(`users/${uid}/games`).limitToLast(50).once('value');
            if (!gamesSnap.exists()) return;

            let bestGame = null;
            let bestScore = -1;
            let bestTime = Infinity;

            gamesSnap.forEach(snap => {
                const game = snap.val();
                if (game.correct_operations > bestScore || (game.correct_operations === bestScore && game.avg_response_time < bestTime)) {
                    bestScore = game.correct_operations;
                    bestTime = game.avg_response_time;
                    bestGame = game;
                }
            });

            if (bestGame) {
                // ⚡ Bolt Optimization: Fetch stats concurrently, but here it's fine as we already have data
                // However, the statsSnap read can be independent of the best_session_ghost write
                const statsSnap = await this.db.ref(`users/${uid}/stats`).once('value');
                const stats = statsSnap.val();

                const ghostData = {
                    timestamp: bestGame.timestamp,
                    total_correct: bestGame.correct_operations,
                    avg_time_ms: bestGame.avg_response_time,
                    responses: bestGame.attempts.map(a => ({
                        time_ms: a.response_time, is_correct: a.is_correct, factor_a: a.factor_a, factor_b: a.factor_b
                    }))
                };
                
                // ⚡ Bolt Optimization: Batch the ghost creation writes
                const ghostWrites = [];
                ghostWrites.push(this.db.ref(`users/${uid}/best_session_ghost`).set(ghostData));
                
                // Actualizar también en el leaderboard de fantasmas
                ghostWrites.push(this.db.ref(`leaderboard/ghosts/${uid}`).update({
                    nickname: firebase.auth().currentUser.displayName || 'Cavernícola',
                    score: bestScore,
                    avg_time_ms: bestTime,
                    tier: stats ? stats.community_tier : 100,
                    league: stats ? stats.community_league : 'MADERA',
                    responses: ghostData.responses
                }));

                // Marcar ghost_available en el leaderboard público
                ghostWrites.push(this.db.ref(`leaderboard/players/${uid}`).update({ ghost_available: true })
                    .catch(e => console.warn('[CloudSync] No se pudo marcar ghost_available:', e)));

                await Promise.all(ghostWrites);

                console.log('%c[CloudSync] ¡Migración exitosa! Tu mejor récord ahora es un Fantasma retable.', "color: #00c8ff; font-weight: bold;");
            }
        } catch (e) {
            console.warn('[CloudSync] Error en auto-migración:', e);
        }
    },

    /**
     * Motor de Guardado Seguro - Solo escribe en rutas permitidas (propiedad del usuario)
     */
    async saveGame() {
        if (!this.db) this.init();
        if (!this.db || !AuthManager.isLoggedIn()) return;

        const user = AuthManager.getUser();
        const uid = user.uid;
        const sessionData = DataManager.sessionData;
        if (!sessionData || sessionData.length === 0) return;

        const stats = DataManager.getSessionStats();
        const correctAttempts = sessionData.filter(a => a.is_correct === 1);
        const avgCorrectTime = correctAttempts.length > 0
            ? Math.round(correctAttempts.reduce((s, a) => s + a.response_time, 0) / correctAttempts.length)
            : 0;

        try {
            // ⚡ Bolt Optimization: Fetch all required data concurrently instead of sequentially later
            // 1. Obtener datos actuales
            const [statsSnap, benchSnap, ghostSnap] = await Promise.all([
                this.db.ref(`users/${uid}/stats`).once('value'),
                this.db.ref('leaderboard/community_benchmarks').once('value'),
                this.db.ref(`users/${uid}/best_session_ghost`).once('value')
            ]);

            const s = statsSnap.val() || { total_games: 0, total_operations: 0, total_correct: 0, global_accuracy: 0, avg_response_time: 0 };
            const b = benchSnap.val() || { max_total_correct: stats.correct, min_response_time: avgCorrectTime, max_response_time: avgCorrectTime, min_accuracy: stats.accuracy, max_accuracy: stats.accuracy };

            // 2. Calcular nuevas estadísticas acumuladas
            const newTotalOps = s.total_operations + stats.total;
            const newTotalCorrect = s.total_correct + stats.correct;
            const newGlobalAccuracy = Math.round((newTotalCorrect / newTotalOps) * 100 * 10) / 10;
            const newAvgTime = s.total_operations > 0
                ? Math.round((s.avg_response_time * s.total_operations + avgCorrectTime * stats.total) / newTotalOps)
                : avgCorrectTime;

            // 3. Benchmarks temporales en memoria
            const newMaxCorrect = Math.max(b.max_total_correct || 0, newTotalCorrect);
            const newMinTime = Math.min(b.min_response_time || 99999, newAvgTime);
            const newMaxTime = Math.max(b.max_response_time || 0, newAvgTime);
            const newMinAcc = Math.min(b.min_accuracy || 100, newGlobalAccuracy);
            const newMaxAcc = Math.max(b.max_accuracy || 0, newGlobalAccuracy);

            // 4. Calcular Score y Liga (Simulación inicial como líder)
            const scoreC = newMaxCorrect > 0 ? (newTotalCorrect / newMaxCorrect) * 100 : 100;
            let scoreT = 100;
            const timeRange = newMaxTime - newMinTime;
            if (timeRange > 0) scoreT = ((newMaxTime - newAvgTime) / timeRange) * 100;
            let scoreA = 100;
            const accRange = newMaxAcc - newMinAcc;
            if (accRange > 0) scoreA = ((newGlobalAccuracy - newMinAcc) / accRange) * 100;

            const communityScore = Math.round((scoreC + scoreT + scoreA) / 3 * 10) / 10;
            
            // Asumimos Diamante inicialmente, _recalculateAllTiers lo ajustará si hay otros
            const initialLeague = 'DIAMANTE';

            // 5. ACTUALIZACIÓN POR NODOS (Evita fallo en raíz /)
            const now = new Date().toISOString();
            const gameId = this.db.ref(`users/${uid}/games`).push().key;

            // ⚡ Bolt Optimization: Batch independent async database operations to eliminate waterfall latency
            const writePromises = [];

            // Guardar partida y stats (Nodo privado: permiso garantizado)
            writePromises.push(this.db.ref(`users/${uid}`).update({
                [`games/${gameId}`]: {
                    timestamp: now,
                    game_mode: sessionData[0]?.game_mode || 'UNKNOWN',
                    total_operations: stats.total,
                    correct_operations: stats.correct,
                    accuracy: stats.accuracy,
                    avg_response_time: avgCorrectTime || stats.avgTime,
                    attempts: sessionData.map(a => ({ factor_a: a.factor_a, factor_b: a.factor_b, is_correct: a.is_correct === 1, response_time: a.response_time }))
                },
                stats: {
                    ...s,
                    total_games: (s.total_games || 0) + 1,
                    total_operations: newTotalOps,
                    total_correct: newTotalCorrect,
                    global_accuracy: newGlobalAccuracy,
                    avg_response_time: newAvgTime,
                    community_score: communityScore,
                    community_league: initialLeague,
                    community_rank: 1,
                    last_updated: now
                }
            }));

            // Actualizar entrada pública (Nodo leaderboard: debe estar permitido)
            const leaderboardUpdate = {
                displayName: user.displayName || 'Cavernícola',
                photoURL: user.photoURL || '',
                community_score: communityScore,
                last_played: now
            };

            // 5.1. ACTUALIZAR GHOST (Feature 15)
            const currentBest = ghostSnap.val();
            let isBetterGhost = !currentBest || stats.correct > currentBest.total_correct || (stats.correct === currentBest.total_correct && avgCorrectTime < currentBest.avg_time_ms);

            if (isBetterGhost) {
                const ghostData = {
                    timestamp: now,
                    total_correct: stats.correct,
                    avg_time_ms: avgCorrectTime || stats.avgTime,
                    responses: sessionData.map(a => ({
                        time_ms: a.response_time, is_correct: a.is_correct === 1, factor_a: a.factor_a, factor_b: a.factor_b
                    }))
                };
                // Guardar en el perfil privado
                writePromises.push(this.db.ref(`users/${uid}/best_session_ghost`).set(ghostData));
                // Inyectar en el listado rápido del Salón de la Fama
                leaderboardUpdate.ghost_available = true; // Flag para búsqueda rápida si fuera necesario
                // Guardar ghost público con responses para que otros jugadores puedan retarlo
                writePromises.push(this.db.ref(`leaderboard/ghosts/${uid}`).update({
                    nickname: user.displayName || 'Cavernícola',
                    score: stats.correct,
                    avg_time_ms: avgCorrectTime || stats.avgTime,
                    tier: 1, // Se actualiza correctamente en _recalculateMyTier
                    league: 'MADERA', // Se actualiza correctamente en _recalculateMyTier
                    responses: ghostData.responses
                }));
            }

            writePromises.push(this.db.ref(`leaderboard/players/${uid}`).update(leaderboardUpdate));

            // Intentar actualizar benchmarks (Solo si las reglas lo permiten)
            writePromises.push(this.db.ref(`leaderboard/community_benchmarks`).update({
                max_total_correct: newMaxCorrect,
                min_response_time: newMinTime,
                max_response_time: newMaxTime,
                min_accuracy: newMinAcc,
                max_accuracy: newMaxAcc
            }).catch(e => console.warn('[CloudSync] No tienes permiso para actualizar Benchmarks, pero tus stats se guardaron.')));

            // ⚡ Await all independent updates concurrently
            await Promise.all(writePromises);

            // 6. RECALCULAR MI POSICIÓN REAL
            await this._recalculateMyTier(uid);

            console.log(`%c[CloudSync] Sincronización terminada con éxito.`, "color: #76c442; font-weight: bold;");

        } catch (err) {
            console.error('[CloudSync] Error de guardado:', err);
        }
    },

    /**
     * Recalcula la posición del usuario actual sin tocar a los demás (Seguro)
     */
    async _recalculateMyTier(uid) {
        try {
            const playersSnap = await this.db.ref('leaderboard/players').once('value');
            if (!playersSnap.exists()) return;

            const players = [];
            playersSnap.forEach(snap => {
                const d = snap.val();
                if (d && typeof d.community_score === 'number') {
                    players.push({ uid: snap.key, score: d.community_score });
                }
            });

            players.sort((a, b) => b.score - a.score);
            const total = players.length;
            const myIndex = players.findIndex(p => p.uid === uid);
            
            if (myIndex === -1) return;

            const rank = myIndex + 1;
            const tier = Math.min(100, Math.floor(((rank - 1) / total) * 100) + 1);
            const league = this._tierToLeague(tier);

            // ⚡ Bolt Optimization: Batch tier updates to avoid sequential database calls
            const tierPromises = [];

            // ACTUALIZAR STATS PRIVADOS (usuario siempre tiene permiso)
            tierPromises.push(this.db.ref(`users/${uid}/stats`).update({
                community_tier: tier,
                community_league: league,
                community_rank: rank
            }));

            // ACTUALIZAR LEADERBOARD PÚBLICO (puede fallar por permisos, no es bloqueante)
            tierPromises.push(this.db.ref(`leaderboard/players/${uid}`).update({
                tier: tier,
                league: league,
                rank: rank
            }).catch(e => console.warn('[CloudSync] No se pudo actualizar el leaderboard público:', e)));

            // ACTUALIZAR GHOST PÚBLICO con tier/league correcto (si existe)
            tierPromises.push(this.db.ref(`leaderboard/ghosts/${uid}`).update({
                tier: tier,
                league: league
            }).catch(e => console.warn('[CloudSync] No se pudo actualizar tier en ghost:', e)));

            await Promise.all(tierPromises);

            console.log(`%c[CloudSync] Tu rango oficial: ${league} (Posición #${rank})`, "color: #00c8ff; font-weight: bold;");
        } catch (e) {
            console.error('[CloudSync] Error al calcular rango:', e);
        }
    },

    _tierToLeague(tier) {
        if (tier <= 5) return 'DIAMANTE';
        if (tier <= 15) return 'PLATINO';
        if (tier <= 30) return 'ORO';
        if (tier <= 50) return 'PLATA';
        if (tier <= 70) return 'BRONCE';
        return 'MADERA';
    }
};

document.addEventListener('DOMContentLoaded', () => {
    setTimeout(() => CloudSync.init(), 600);
});
