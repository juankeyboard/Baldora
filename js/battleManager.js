/**
 * BATTLEMANAGER.JS - Multijugador Asíncrono ("Ghosts") (Feature 15)
 * Baldora – "La Cinchada: Duelo de Fantasmas"
 */

const BattleManager = (() => {
    // --- Referencias Firebase ---
    let db = null;
    let myUid = null;

    // --- Estado de la Batalla ---
    let gameActive = false;
    let myColor = 'blue';
    let oponentGhost = null; // Datos de la sesión fantasma
    let ghostResponses = []; // Array de respuestas del bot
    let ghostIndex = 0;
    let ghostTimer = null;

    // --- Configuración de Sesión ---
    let currentRows = [];
    let currentCols = [];
    let currentTimeLimit = 60000;

    // --- Game Logic ---
    let markerPosition = 50; 
    let blueScore = 0;
    let yellowScore = 0;
    let currentOp = null;
    let myAnswerBuffer = '';
    let operationStartTime = null;

    /**
     * Inicializa el Manager
     */
    function init() {
        if (typeof firebase === 'undefined') return;
        db = firebase.database();

        firebase.auth().onAuthStateChanged(user => {
            if (user) {
                myUid = user.uid;
            } else {
                myUid = null;
            }
        });
    }

    /**
     * Muestra la vista de pantalla completa para selección de oponentes
     */
    async function showGhostSelection(rows, cols, timeLimit) {
        currentRows = rows;
        currentCols = cols;
        currentTimeLimit = timeLimit;

        // Cambiar a la vista de selección en el sistema SPA
        if (typeof App !== 'undefined') {
            App.showView('GHOST_SELECTION');
        } else {
            document.querySelectorAll('.view').forEach(v => v.classList.remove('active'));
            const selectionView = document.getElementById('ghost-selection-view');
            if (selectionView) selectionView.classList.add('active');
        }

        const listContainer = document.getElementById('ghost-list');
        const loader = document.getElementById('ghost-list-loading');

        if (loader) loader.style.display = 'block';
        if (listContainer) listContainer.innerHTML = '';

        try {
            // Leer de leaderboard/players (fuente de verdad con tier/league actualizados)
            // y enricher con datos de ghosts si existen (score, avg_time_ms)
            const [playersSnap, ghostsSnap] = await Promise.all([
                db.ref('leaderboard/players').once('value'),
                db.ref('leaderboard/ghosts').once('value')
            ]);

            // Mapa de datos de ghosts para enricher con score/tiempo
            const ghostsData = {};
            ghostsSnap.forEach(snap => {
                ghostsData[snap.key] = snap.val();
            });

            // Construir lista de todos los jugadores registrados en la comunidad
            // (ghost_available es opcional — startGhostBattle verifica si hay datos reales)
            const players = [];
            playersSnap.forEach(snap => {
                const d = snap.val();
                if (d && d.community_score !== undefined) {
                    const ghostInfo = ghostsData[snap.key] || {};
                    players.push({
                        uid: snap.key,
                        nickname: d.displayName || ghostInfo.nickname || 'Cavernícola',
                        community_score: d.community_score || 0,
                        tier: d.tier || 100,
                        league: d.league || 'MADERA',
                        rank: d.rank || null,
                        // Usar ?? para manejar score=0, con fallback a los campos de respaldo en players
                        score: ghostInfo.score ?? d.best_correct ?? null,
                        avg_time_ms: ghostInfo.avg_time_ms ?? d.best_avg_time_ms ?? null,
                        last_played: d.last_played || null
                    });
                }
            });

            if (loader) loader.style.display = 'none';

            if (players.length === 0) {
                listContainer.innerHTML = '<p class="modal-message">No hay oponentes disponibles aun. Juega una partida para ser el primero en el Salon!</p>';
                return;
            }

            // Ordenar todos los players por rank asc (o score desc si no hay rank)
            players.sort((a, b) => {
                if (a.rank && b.rank) return a.rank - b.rank;
                return (b.score || b.community_score) - (a.score || a.community_score);
            });

            const leagueIcons = {
                'DIAMANTE': '\uD83D\uDC8E', 'PLATINO': '\uD83C\uDFC5', 'ORO': '\uD83E\uDD47',
                'PLATA': '\uD83E\uDD48', 'BRONCE': '\uD83E\uDD49', 'MADERA': '\uD83E\uDEB5'
            };

            const rows = players.map((player, i) => {
                const isMe = player.uid === myUid;
                const statsText = player.score !== null ? player.score : '\u2014';
                const timeText = player.avg_time_ms !== null ? `${player.avg_time_ms}ms` : '\u2014';
                const icon = leagueIcons[player.league] || '\uD83C\uDFAE';
                const rankDisplay = player.rank ? `#${player.rank}` : `#${i + 1}`;

                return `
                    <tr class="${isMe ? 'ghost-row-me' : ''}">
                        <td class="ghost-td-rank">${rankDisplay}</td>
                        <td class="ghost-td-name">${player.nickname}${isMe ? ' <span class="ghost-you-tag">(T\u00fa)</span>' : ''}</td>
                        <td class="ghost-td-league">
                            <span class="ghost-league-pill league-${(player.league || 'madera').toLowerCase()}">
                                ${icon} ${player.league || 'MADERA'}
                            </span>
                        </td>
                        <td class="ghost-td-score">${statsText}</td>
                        <td class="ghost-td-time">${timeText}</td>
                        <td class="ghost-td-action">
                            <button class="btn-challenge${isMe ? ' btn-challenge-self' : ''}"
                                onclick="BattleManager.startGhostBattle('${player.uid}')">
                                ${isMe ? 'SUPERAR' : 'RETAR'}
                            </button>
                        </td>
                    </tr>
                `;
            }).join('');

            // Contador de jugadores + tabla HTML
            listContainer.innerHTML = `
                <p class="ghost-count-msg">${players.length} cavern\u00edcola${players.length !== 1 ? 's' : ''} en la comunidad</p>
                <div class="ghost-table-wrapper">
                    <table class="ghost-table">
                        <thead>
                            <tr>
                                <th>#</th>
                                <th>Jugador</th>
                                <th>Liga</th>
                                <th>Aciertos</th>
                                <th>Tiempo avg</th>
                                <th>Acci\u00f3n</th>
                            </tr>
                        </thead>
                        <tbody>${rows}</tbody>
                    </table>
                </div>
            `;

        } catch (err) {
            console.error('Error cargando oponentes:', err);
            if (loader) loader.style.display = 'none';
            if (listContainer) listContainer.innerHTML = '<p class="modal-message">Error al conectar con la comunidad. Verifica tu conexion.</p>';
        }
    }

    /**
     * Regresa al menú de configuración
     */
    function hideGhostSelection() {
        if (typeof App !== 'undefined') {
            App.showView('CONFIG');
        } else {
            document.querySelectorAll('.view').forEach(v => v.classList.remove('active'));
            const configView = document.getElementById('config-view');
            if (configView) configView.classList.add('active');
        }
    }

    /**
     * Inicia el duelo contra un Fantasma específico
     */
    async function startGhostBattle(opponentUid) {
        try {
            // Leer ghost público (incluye responses si ya fueron guardadas)
            const [ghostSnap, playerSnap] = await Promise.all([
                db.ref(`leaderboard/ghosts/${opponentUid}`).once('value'),
                db.ref(`leaderboard/players/${opponentUid}`).once('value')
            ]);

            let ghostData = ghostSnap.val();
            const playerData = playerSnap.val();

            // Si no hay responses exactas, construir ghost sintético con avg_time_ms (f15 §2.1 Coincidencia Parcial)
            if (!ghostData || !ghostData.responses || ghostData.responses.length === 0) {
                const avgTime = (ghostData && ghostData.avg_time_ms) || (playerData && playerData.best_avg_time_ms);

                if (!avgTime) {
                    alert('Este cavernícola aún no tiene partida registrada. ¡Invítalo a jugar!');
                    return;
                }

                // Generar 60 respuestas sintéticas con variación natural (±30%) basadas en su promedio
                const syntheticResponses = Array.from({ length: 60 }, () => ({
                    time_ms: Math.round(avgTime * (0.7 + Math.random() * 0.6)),
                    is_correct: true
                }));

                ghostData = {
                    nickname: (ghostData && ghostData.nickname) || (playerData && playerData.displayName) || 'Cavernícola',
                    score: (ghostData && ghostData.score) || (playerData && playerData.best_correct) || 0,
                    avg_time_ms: avgTime,
                    responses: syntheticResponses
                };
            }

            oponentGhost = ghostData;
            ghostResponses = ghostData.responses;
            ghostIndex = 0;

            _startBattle();
        } catch (err) {
            console.error('Error iniciando batalla ghost:', err);
            alert('Error al conectar con la comunidad.');
        }
    }

    function _startBattle() {
        gameActive = true;
        myColor = 'blue';
        
        // Inicializar DataManager para registrar esta sesión de duelo (Aporta a las ligas)
        if (typeof DataManager !== 'undefined') {
            const user = AuthManager.getUser();
            DataManager.init(user ? user.displayName : 'Cavernícola');
        }

        _showBattleView();
        _generateNewOp();
        _startGhostEngine();
        _startBattleTimer();
        
        if (typeof AudioManager !== 'undefined') {
            AudioManager.playStart();
        }
    }

    function _showBattleView() {
        if (typeof App !== 'undefined' && typeof App.showView === 'function') {
            App.showView('BATTLE');
        }

        // Paso 5: Limpiar overlay de resultado anterior
        const prevOverlay = document.getElementById('battle-result-overlay');
        if (prevOverlay) prevOverlay.classList.remove('active');

        // Reset UI
        blueScore = 0;
        yellowScore = 0;
        markerPosition = 50;
        document.getElementById('battle-score-blue').textContent = '0';
        document.getElementById('battle-score-yellow').textContent = '0';
        document.getElementById('battle-rope-indicator').style.left = '50%';
        
        // Nombres
        document.getElementById('battle-player-blue-name').textContent = 'Tú';
        document.getElementById('battle-player-yellow-name').textContent = oponentGhost ? oponentGhost.nickname : 'Fantasma';
    }

    /**
     * El "Motor Ghost": Simula al oponente basado en sus tiempos grabados
     */
    function _startGhostEngine() {
        if (!gameActive) return;

        let responseData = ghostResponses[ghostIndex];
        if (!responseData) {
            responseData = ghostResponses[Math.floor(Math.random() * ghostResponses.length)];
        }

        const delay = responseData ? responseData.time_ms : 2000;

        ghostTimer = setTimeout(() => {
            if (!gameActive) return;
            _handleGhostHit();
            ghostIndex++;
            _startGhostEngine();
        }, delay);
    }

    function _handleGhostHit() {
        yellowScore++;
        document.getElementById('battle-score-yellow').textContent = yellowScore;
        markerPosition += 5;
        markerPosition = Math.min(100, markerPosition);
        _updateRopeUI();
        if (markerPosition >= 95) _endBattle('ko_yellow');
    }

    function _generateNewOp() {
        const r = currentRows[Math.floor(Math.random() * currentRows.length)];
        const c = currentCols[Math.floor(Math.random() * currentCols.length)];
        currentOp = { row: r, col: c };
        operationStartTime = Date.now(); // Reset cronómetro de operación
        
        document.getElementById('battle-factor-a').textContent = r;
        document.getElementById('battle-factor-b').textContent = c;
        document.getElementById('battle-answer-display').textContent = '?';
        myAnswerBuffer = '';
    }

    function onDialPress(num) {
        if (!gameActive || !currentOp) return;
        
        myAnswerBuffer += num.toString();
        document.getElementById('battle-answer-display').textContent = myAnswerBuffer;
        
        const result = parseInt(myAnswerBuffer);
        const correct = currentOp.row * currentOp.col;
        
        if (result === correct) {
            const responseTime = Date.now() - operationStartTime;
            if (typeof DataManager !== 'undefined') {
                DataManager.recordAttempt(currentOp.row, currentOp.col, result, true, responseTime, 'BATTLE');
            }
            _handlePlayerHit();
        } else if (myAnswerBuffer.length >= correct.toString().length) {
            const responseTime = Date.now() - operationStartTime;
            if (typeof DataManager !== 'undefined') {
                DataManager.recordAttempt(currentOp.row, currentOp.col, result, false, responseTime, 'BATTLE');
            }
            myAnswerBuffer = '';
            document.getElementById('battle-answer-display').textContent = '?';
            if (typeof AudioManager !== 'undefined') AudioManager.playWrong();
        }
    }

    function onDialClear() {
        myAnswerBuffer = '';
        document.getElementById('battle-answer-display').textContent = '?';
    }

    function _handlePlayerHit() {
        if (typeof AudioManager !== 'undefined') AudioManager.playCorrect();
        blueScore++;
        document.getElementById('battle-score-blue').textContent = blueScore;
        markerPosition -= 5;
        markerPosition = Math.max(0, markerPosition);
        _updateRopeUI();

        if (markerPosition <= 5) {
            _endBattle('ko_blue');
        } else {
            _generateNewOp();
        }
    }

    function _updateRopeUI() {
        const indicator = document.getElementById('battle-rope-indicator');
        if (indicator) indicator.style.left = `${markerPosition}%`;
        const blueCave = document.getElementById('battle-cave-blue');
        const yellowCave = document.getElementById('battle-cave-yellow');
        if (blueCave && yellowCave) {
            blueCave.style.transform = `translateX(${(markerPosition-50)*0.5}px)`;
            yellowCave.style.transform = `translateX(${(markerPosition-50)*0.5}px)`;
        }
    }

    function _startBattleTimer() {
        // Paso 2: Usar currentTimeLimit (ms) en vez de hardcodear 60s
        let timeLeft = Math.floor(currentTimeLimit / 1000);
        const timerEl = document.getElementById('battle-timer-display');
        const interval = setInterval(() => {
            if (!gameActive) { clearInterval(interval); return; }
            timeLeft--;
            // Paso 2: Formato M:SS correcto para cualquier duración
            const mins = Math.floor(timeLeft / 60);
            const secs = timeLeft % 60;
            if (timerEl) timerEl.textContent = `${mins}:${String(secs).padStart(2, '0')}`;
            if (timeLeft <= 0) { clearInterval(interval); _endBattle('timeout'); }
        }, 1000);
    }

    function _endBattle(reason) {
        if (!gameActive) return;
        gameActive = false;
        if (ghostTimer) clearTimeout(ghostTimer);
        
        let winner = 'tie';
        if (markerPosition <= 10) winner = 'blue';
        else if (markerPosition >= 90) winner = 'yellow';
        else {
            if (blueScore > yellowScore) winner = 'blue';
            else if (yellowScore > blueScore) winner = 'yellow';
        }
        
        _showResultOverlay(winner);

        // SYNC: Guardar el duelo para que cuente en las Ligas de la Comunidad
        if (typeof CloudSync !== 'undefined' && AuthManager.isLoggedIn()) {
            console.log('[Battle] Sincronizando resultados del duelo...');
            CloudSync.saveGame();
        }

        // Paso 3: Limpiar sesión de DataManager para no contaminar partidas futuras
        if (typeof DataManager !== 'undefined') {
            DataManager.resetSession();
        }
    }

    function _showResultOverlay(winner) {
        const overlay = document.getElementById('battle-result-overlay');
        const titleEl = document.getElementById('battle-result-title');
        const msgEl = document.getElementById('battle-result-msg');
        if (!overlay) return;
        
        if (winner === 'blue') {
            titleEl.textContent = '¡VICTORIA!';
            titleEl.style.color = '#76c442';
            msgEl.textContent = 'Has derrotado al fantasma con tu agilidad mental.';
        } else if (winner === 'yellow') {
            titleEl.textContent = 'DERROTA';
            titleEl.style.color = '#e91e63';
            msgEl.textContent = 'El fantasma ha sido más rápido esta vez.';
        } else {
            titleEl.textContent = 'EMPATE';
            msgEl.textContent = 'Fuerzas igualadas en la arena.';
        }
        // Paso 4: Usar clase CSS para activar transición de opacidad
        overlay.classList.add('active');
    }

    function closeBattleResult() {
        const overlay = document.getElementById('battle-result-overlay');
        // Paso 4: Usar clase CSS para desactivar con transición
        if (overlay) overlay.classList.remove('active');
        if (typeof App !== 'undefined') App.showView('CONFIG');
    }

    return {
        init,
        showGhostSelection,
        hideGhostSelection,
        startGhostBattle,
        onDialPress,
        onDialClear,
        closeBattleResult
    };
})();

document.addEventListener('DOMContentLoaded', () => {
    setTimeout(() => BattleManager.init(), 900);
});

// ─── Teclado numérico (PC) ────────────────────────────────
document.addEventListener('keydown', (e) => {
    // Solo activo durante la batalla
    if (!document.body.classList.contains('battle-mode')) return;

    if (e.key >= '0' && e.key <= '9') {
        e.preventDefault();
        BattleManager.onDialPress(parseInt(e.key));
    } else if (e.key === 'Backspace' || e.key === 'Delete') {
        e.preventDefault();
        BattleManager.onDialClear();
    }
});
