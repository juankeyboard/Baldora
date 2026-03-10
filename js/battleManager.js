/**
 * BATTLEMANAGER.JS - Lógica de Sincronización Multijugador (Feature 15)
 * Baldora – "La Cinchada" (Tug-of-War)
 * Módulo aditivo: no interfiere con la lógica de juego individual.
 *
 * Estructura RTDB:
 *  presence/{uid}: { online, last_login_at, current_status }
 *  battles/{roomId}: { config, state, players }
 */

const BattleManager = (() => {
    // ── Estado interno ─────────────────────────────────────────────────────────
    let db = null;
    let currentRoomId = null;
    let myUid = null;
    let opponentUid = null;
    let myColor = null;           // 'blue' | 'yellow'
    let debounceActive = false;   // CA-04: anti doble-tap 100ms
    let roomListener = null;
    let duelInviteListener = null;
    let battleRows = [];          // Tablas (filas) seleccionadas en el formulario
    let battleCols = [];          // Tablas (cols) seleccionadas en el formulario
    let battleTimeLimitMs = 60000; // Tiempo límite en ms
    let battleTimer = null;       // Timer interno de límite de tiempo
    let battleCountdownInterval = null; // Interval para el display del countdown
    let battleStartEpoch = 0;     // Epoch cuando arrancó la batalla
    let currentOpIndex = 0;
    let myScore = 0;
    let markerPosition = 0;       // -50..+50 (+ = azul gana, - = amarillo gana)
    let gameActive = false;
    let currentOp = null;         // { a, b, result }
    let opponentNickname = '';
    let myNickname = '';

    const MARKER_WIN = 50;
    const STEP = 5;

    // ── Inicialización ─────────────────────────────────────────────────────────
    function init() {
        if (!firebase?.database) {
            console.warn('[BattleManager] Firebase RTDB no disponible');
            return;
        }
        db = firebase.database();
        console.log('[BattleManager] Inicializado');
    }

    // ── Presencia ──────────────────────────────────────────────────────────────
    /**
     * Registra al usuario como online con onDisconnect automático.
     * @param {string} uid
     * @param {string} nickname
     */
    function setOnline(uid, nickname) {
        if (!db) return;
        myUid = uid;
        myNickname = nickname;

        const presenceRef = db.ref(`presence/${uid}`);
        const connectedRef = db.ref('.info/connected');

        connectedRef.on('value', snap => {
            if (!snap.val()) return;

            // Al desconectarse, marcar offline y registrar timestamp
            presenceRef.onDisconnect().update({
                online: false,
                last_login_at: firebase.database.ServerValue.TIMESTAMP
            });

            // Actualizar estado online
            presenceRef.update({
                online: true,
                nickname: nickname,
                last_login_at: firebase.database.ServerValue.TIMESTAMP,
                current_status: 'idle'
            });
        });

        // Escuchar invitaciones de duelo entrantes
        _listenForDuelInvite(uid);
    }

    function setOffline(uid) {
        if (!db || !uid) return;
        db.ref(`presence/${uid}`).update({
            online: false,
            current_status: 'offline',
            last_login_at: firebase.database.ServerValue.TIMESTAMP
        });
    }

    function setStatus(uid, status) {
        if (!db || !uid) return;
        db.ref(`presence/${uid}`).update({ current_status: status });
    }

    /**
     * Busca un oponente online (idle) y le envía una invitación de duelo.
     * @param {number[]} rows   - Filas seleccionadas por el jugador en el formulario
     * @param {number[]} cols   - Columnas seleccionadas por el jugador
     * @param {number} timeLimitMs - Tiempo límite del duelo en milisegundos
     */
    async function searchOpponent(rows = [], cols = [], timeLimitMs = 60000) {
        if (!db || !myUid) { _showToast('Debes iniciar sesión para el modo VS'); return; }

        battleRows = rows.length ? rows : [1, 2, 3, 4, 5, 6, 7, 8, 9];
        battleCols = cols.length ? cols : [1, 2, 3, 4, 5, 6, 7, 8, 9];
        battleTimeLimitMs = timeLimitMs || 60000;

        setStatus(myUid, 'searching');
        _updateDuelBtn('Buscando...', true);

        try {
            // Query: usuarios online e idle
            const snap = await db.ref('presence')
                .orderByChild('last_login_at')
                .limitToLast(10)
                .once('value');

            const candidates = [];
            snap.forEach(child => {
                const data = child.val();
                if (
                    child.key !== myUid &&
                    data.online === true &&
                    data.current_status === 'idle'
                ) {
                    candidates.push({ uid: child.key, ...data });
                }
            });

            if (candidates.length === 0) {
                setStatus(myUid, 'idle');
                _updateDuelBtn('Duelo VS', false);
                _showToast('No hay oponentes disponibles. ¡Inténtalo de nuevo!');
                return;
            }

            // Seleccionar el más reciente
            candidates.sort((a, b) => b.last_login_at - a.last_login_at);
            const target = candidates[0];

            // Crear room en RTDB con la config del formulario principal
            const roomRef = db.ref('battles').push();
            currentRoomId = roomRef.key;

            const roomData = {
                config: {
                    time_limit_ms: battleTimeLimitMs,
                    tables: `rows:${battleRows.join(',')};cols:${battleCols.join(',')}`
                },
                state: {
                    marker_position: 0,
                    current_op_index: 0,
                    start_time: firebase.database.ServerValue.TIMESTAMP,
                    status: 'waiting' // waiting | active | finished
                },
                players: {
                    [myUid]: { score: 0, color: 'blue', nickname: myNickname, last_response_ms: 0 },
                    [target.uid]: { score: 0, color: 'yellow', nickname: target.nickname || 'Oponente', last_response_ms: 0 }
                }
            };

            await roomRef.set(roomData);

            // Enviar invitación al oponente
            await db.ref(`presence/${target.uid}/incoming_duel`).set({
                from_uid: myUid,
                from_nickname: myNickname,
                room_id: currentRoomId,
                timestamp: firebase.database.ServerValue.TIMESTAMP
            });

            myColor = 'blue';
            opponentUid = target.uid;
            opponentNickname = target.nickname || 'Oponente';

            // Esperar aceptación (timeout 30s)
            _waitForAcceptance();

        } catch (err) {
            console.error('[BattleManager] searchOpponent error:', err);
            setStatus(myUid, 'idle');
            _updateDuelBtn('Duelo VS', false);
        }
    }

    function _waitForAcceptance() {
        let timeout = setTimeout(() => {
            _showToast('El oponente no respondió. Intenta de nuevo.');
            _cleanupRoom();
        }, 30000);

        const roomRef = db.ref(`battles/${currentRoomId}/state/status`);
        roomRef.on('value', snap => {
            if (snap.val() === 'active') {
                clearTimeout(timeout);
                roomRef.off();
                _startBattle();
            }
        });
    }

    // ── Invitación entrante ───────────────────────────────────────────────────
    function _listenForDuelInvite(uid) {
        if (duelInviteListener) duelInviteListener.off();

        const ref = db.ref(`presence/${uid}/incoming_duel`);
        ref.on('value', snap => {
            if (!snap.exists()) return;
            const invite = snap.val();
            if (!invite?.room_id) return;

            // Mostrar overlay de invitación
            _showDuelOverlay(invite);
        });
        duelInviteListener = ref;
    }

    function _showDuelOverlay(invite) {
        const overlay = document.getElementById('duel-invite-overlay');
        if (!overlay) return;

        document.getElementById('duel-invite-from').textContent = invite.from_nickname || 'Alguien';
        overlay.classList.add('active');

        // Guardar datos de la invitación
        overlay.dataset.roomId = invite.room_id;
        overlay.dataset.fromUid = invite.from_uid;
    }

    /**
     * El usuario acepta el duelo entrante.
     * Si hay una sesión activa, se hace forceReset() (CA-03).
     */
    function acceptDuel() {
        const overlay = document.getElementById('duel-invite-overlay');
        if (!overlay) return;

        const roomId = overlay.dataset.roomId;
        const fromUid = overlay.dataset.fromUid;

        // CA-03: Limpiar sesión individual activa
        if (typeof App !== 'undefined' && App.state === 'PLAYING') {
            _forceResetGame();
        }

        overlay.classList.remove('active');

        currentRoomId = roomId;
        myColor = 'yellow';
        opponentUid = fromUid;

        // Leer nickname del oponente
        db.ref(`presence/${fromUid}/nickname`).once('value').then(snap => {
            opponentNickname = snap.val() || 'Oponente';
        });

        // Leer config de la room (tiempo límite y tablas vienen del host)
        db.ref(`battles/${roomId}/config`).once('value').then(snap => {
            if (snap.exists()) {
                const cfg = snap.val();
                battleTimeLimitMs = cfg.time_limit_ms || 60000;
                // Parsear tablas si vinieron del host
                if (cfg.tables && cfg.tables !== 'all') {
                    try {
                        const parts = cfg.tables.split(';');
                        battleRows = parts[0].replace('rows:', '').split(',').map(Number);
                        battleCols = parts[1].replace('cols:', '').split(',').map(Number);
                    } catch (e) {
                        battleRows = [1, 2, 3, 4, 5, 6, 7, 8, 9];
                        battleCols = [1, 2, 3, 4, 5, 6, 7, 8, 9];
                    }
                }
            }
        });

        // Marcar room como activa
        db.ref(`battles/${roomId}/state/status`).set('active');
        setStatus(myUid, 'playing');

        // Limpiar la invitación entrante
        db.ref(`presence/${myUid}/incoming_duel`).remove();

        _startBattle();
    }

    function declineDuel() {
        const overlay = document.getElementById('duel-invite-overlay');
        if (!overlay) return;
        overlay.classList.remove('active');
        db.ref(`presence/${myUid}/incoming_duel`).remove();
    }

    // ── Batalla ───────────────────────────────────────────────────────────────
    function _startBattle() {
        if (!currentRoomId) return;

        gameActive = true;
        myScore = 0;
        markerPosition = 0;
        currentOpIndex = 0;

        setStatus(myUid, 'playing');

        // Mostrar la vista de batalla
        _showBattleView();

        // Escuchar cambios del estado de la room
        _listenRoomState();

        // Iniciar el temporizador de límite de tiempo (f15 §3.1)
        if (battleTimer) clearTimeout(battleTimer);
        battleTimer = setTimeout(() => {
            if (gameActive) {
                // Al agotar el tiempo, determinar ganador por posición del marcador
                db.ref(`battles/${currentRoomId}/state`).transaction(state => {
                    if (!state || state.status === 'finished') return state;
                    state.status = 'finished';
                    state.winner_uid = markerPosition > 0
                        ? myUid  // azul gana si marcador es positivo
                        : opponentUid; // amarillo gana si es negativo (empate: oponente)
                    return state;
                });
            }
        }, battleTimeLimitMs);

        // Generar primera operación
        _generateOperation();
    }

    function _listenRoomState() {
        if (roomListener) roomListener.off();

        const roomRef = db.ref(`battles/${currentRoomId}`);
        roomRef.on('value', snap => {
            if (!snap.exists()) return;
            const data = snap.val();
            _updateBattleUI(data);

            if (data.state?.status === 'finished') {
                roomRef.off();
                _showBattleResult(data);
            }
        });
        roomListener = roomRef;
    }

    // ── Respuesta del jugador ─────────────────────────────────────────────────
    /**
     * El jugador presiona un número del dial.
     * CA-04: debounce de 100ms para prevenir doble-tap
     * @param {number} digit - Dígito presionado (0-9)
     */
    function onDialPress(digit) {
        if (!gameActive || debounceActive) return;
        debounceActive = true;
        setTimeout(() => { debounceActive = false; }, 100);

        if (!currentOp) return;

        // Acumular dígitos para la respuesta
        const inputEl = document.getElementById('battle-answer-display');
        if (!inputEl) return;

        const current = inputEl.textContent === '?' ? '' : inputEl.textContent;
        const newVal = current + digit;
        inputEl.textContent = newVal;

        // Auto-verificar cuando el número ingresado ya es >= resultado correcto en dígitos
        const digits = String(currentOp.result).length;
        if (newVal.length >= digits) {
            _submitBattleAnswer(parseInt(newVal));
        }
    }

    /**
     * Borra el último dígito ingresado.
     */
    function onDialClear() {
        const inputEl = document.getElementById('battle-answer-display');
        if (!inputEl) return;
        const current = inputEl.textContent;
        if (current === '?' || current.length <= 1) {
            inputEl.textContent = '?';
        } else {
            inputEl.textContent = current.slice(0, -1);
        }
    }

    function _submitBattleAnswer(answer) {
        if (!currentOp || !gameActive) return;

        const isCorrect = answer === currentOp.result;
        const responseMs = Date.now() - currentOp.startTime;

        // Reset display
        const inputEl = document.getElementById('battle-answer-display');
        if (inputEl) inputEl.textContent = '?';

        if (!isCorrect) {
            // Feedback visual de error
            inputEl?.classList.add('wrong-flash');
            setTimeout(() => inputEl?.classList.remove('wrong-flash'), 400);
            return;
        }

        // Enviar acierto a RTDB (transacción para sincronización)
        _sendCorrectAnswer(responseMs);
    }

    function _sendCorrectAnswer(responseMs) {
        if (!db || !currentRoomId || !myUid) return;

        const roomRef = db.ref(`battles/${currentRoomId}`);

        roomRef.transaction(room => {
            if (!room) return room;

            // Registrar tiempo de respuesta
            if (!room.players) room.players = {};
            if (!room.players[myUid]) room.players[myUid] = {};
            room.players[myUid].last_response_ms = responseMs;
            room.players[myUid].score = (room.players[myUid].score || 0) + 1;

            // Mover marcador
            if (myColor === 'blue') {
                room.state.marker_position = Math.min(MARKER_WIN, (room.state.marker_position || 0) + STEP);
            } else {
                room.state.marker_position = Math.max(-MARKER_WIN, (room.state.marker_position || 0) - STEP);
            }

            // Incrementar operación
            room.state.current_op_index = (room.state.current_op_index || 0) + 1;

            // Verificar únicamente KO Técnico (victoria por tiempo la maneja el timer)
            const pos = room.state.marker_position;
            if (Math.abs(pos) >= MARKER_WIN) {
                room.state.status = 'finished';
                room.state.winner_uid = myUid;
            }

            return room;
        });

        // Generar siguiente operación localmente
        currentOpIndex++;
        _generateOperation();
    }

    // ── Operaciones ───────────────────────────────────────────────────────────
    function _generateOperation() {
        // Usar las tablas seleccionadas por el jugador (f15 §2)
        const rowPool = battleRows.length ? battleRows : [1, 2, 3, 4, 5, 6, 7, 8, 9];
        const colPool = battleCols.length ? battleCols : [1, 2, 3, 4, 5, 6, 7, 8, 9];
        const a = rowPool[Math.floor(Math.random() * rowPool.length)];
        const b = colPool[Math.floor(Math.random() * colPool.length)];
        currentOp = { a, b, result: a * b, startTime: Date.now() };

        const factorA = document.getElementById('battle-factor-a');
        const factorB = document.getElementById('battle-factor-b');
        const display = document.getElementById('battle-answer-display');

        if (factorA) factorA.textContent = a;
        if (factorB) factorB.textContent = b;
        if (display) display.textContent = '?';
    }

    // ── UI de Batalla ─────────────────────────────────────────────────────────
    function _showBattleView() {
        // Ocultar todas las vistas
        document.querySelectorAll('.view').forEach(v => v.classList.remove('active'));

        const battleView = document.getElementById('battle-view');
        if (battleView) {
            battleView.classList.add('active');
        }

        // Configurar cabecera de batalla
        const myName = document.getElementById('battle-player-blue-name');
        const oppName = document.getElementById('battle-player-yellow-name');

        if (myColor === 'blue') {
            if (myName) myName.textContent = myNickname || 'Tú';
            if (oppName) oppName.textContent = opponentNickname;
        } else {
            if (myName) myName.textContent = opponentNickname;
            if (oppName) oppName.textContent = myNickname || 'Tú';
        }

        // Iniciar countdown visual en el header
        battleStartEpoch = Date.now();
        if (battleCountdownInterval) clearInterval(battleCountdownInterval);
        battleCountdownInterval = setInterval(() => {
            const remaining = Math.max(0, battleTimeLimitMs - (Date.now() - battleStartEpoch));
            const mins = Math.floor(remaining / 60000);
            const secs = Math.floor((remaining % 60000) / 1000);
            const display = document.getElementById('battle-timer-display');
            if (display) {
                display.textContent = `${mins}:${String(secs).padStart(2, '0')}`;
                if (remaining < 10000) display.style.color = '#ef4444'; // rojo al final
                else display.style.color = '';
            }
            if (remaining <= 0) clearInterval(battleCountdownInterval);
        }, 500);

        // Configurar control: Mis botones son el panel derecho si soy azul, izquierdo si soy amarillo
        _configureDials();
    }

    function _updateBattleUI(data) {
        if (!data) return;

        const pos = data.state?.marker_position || 0;
        const opIdx = data.state?.current_op_index || 0;

        // pos: -50 (amarillo) a +50 (azul). Centro = 0 → izquierda = 50%
        const pct = 50 + pos; // 0..100

        // Actualizar indicador (bola blanca) en la cuerda
        const rope = document.getElementById('battle-rope-indicator');
        if (rope) {
            rope.style.left = `${pct}%`;
        }

        // Actualizar fills de colores (CA-02: transición CSS ≤250ms)
        const fillBlue = document.querySelector('.battle-rope-fill-blue');
        const fillYellow = document.querySelector('.battle-rope-fill-yellow');
        if (fillBlue) fillBlue.style.width = `${pct}%`;
        if (fillYellow) fillYellow.style.width = `${100 - pct}%`;

        // Actualizar posición visual de cavernícolas
        const caveBlue = document.getElementById('battle-cave-blue');
        const caveYellow = document.getElementById('battle-cave-yellow');
        if (caveBlue && caveYellow) {
            const offset = pos * 1.2; // px de desplazamiento visual proporcional
            caveBlue.style.transform = `scaleX(-1) translateX(${-offset}px)`;
            caveYellow.style.transform = `translateX(${offset}px)`;
        }

        // Actualizar contador de operaciones
        const opEl = document.getElementById('battle-current-op');
        if (opEl) opEl.textContent = opIdx;

        // Actualizar scores por color
        if (data.players) {
            Object.entries(data.players).forEach(([uid, player]) => {
                const color = player.color;
                const scoreEl = document.getElementById(`battle-score-${color}`);
                if (scoreEl) scoreEl.textContent = player.score || 0;
            });
        }
    }

    function _showBattleResult(data) {
        gameActive = false;
        const winnerUid = data.state?.winner_uid;
        const didIWin = winnerUid === myUid;

        const resultOverlay = document.getElementById('battle-result-overlay');
        if (!resultOverlay) return;

        const titleEl = document.getElementById('battle-result-title');
        const msgEl = document.getElementById('battle-result-msg');
        const addFriendBtn = document.getElementById('btn-add-friend');

        if (titleEl) titleEl.textContent = didIWin ? '🏆 ¡Victoria!' : '💀 Derrota';
        if (msgEl) {
            const pos = data.state?.marker_position || 0;
            const score = data.players?.[myUid]?.score || 0;
            msgEl.textContent = `Operaciones correctas: ${score} | Posición marcador: ${pos}`;
        }

        // CA-05: Mostrar botón "Añadir a Amigos" si no es ya amigo
        if (addFriendBtn) {
            _checkFriendship(opponentUid).then(isFriend => {
                addFriendBtn.style.display = isFriend ? 'none' : 'flex';
                addFriendBtn.onclick = () => addFriend(opponentUid);
            });
        }

        // Guardar duelo en historial
        _saveDuelHistory(data, didIWin);

        resultOverlay.classList.add('active');
        setStatus(myUid, 'idle');
    }

    // ── Amigos ────────────────────────────────────────────────────────────────
    async function _checkFriendship(uid) {
        if (!db || !myUid || !uid) return false;
        const snap = await db.ref(`users/${myUid}/friends/${uid}`).once('value');
        return snap.exists();
    }

    async function addFriend(targetUid) {
        if (!db || !myUid || !targetUid) return;
        await db.ref(`users/${myUid}/friends/${targetUid}`).set({
            since: new Date().toISOString(),
            nickname: opponentNickname
        });
        const btn = document.getElementById('btn-add-friend');
        if (btn) {
            btn.textContent = '✓ Añadido';
            btn.disabled = true;
        }
    }

    // ── Historial ─────────────────────────────────────────────────────────────
    function _saveDuelHistory(roomData, won) {
        if (!db || !myUid) return;
        const players = roomData.players || {};
        const uids = Object.keys(players);
        db.ref(`duel_history/${currentRoomId}`).set({
            winner_uid: roomData.state?.winner_uid,
            loser_uid: uids.find(u => u !== roomData.state?.winner_uid) || null,
            ops_total: opsTotal,
            timestamp: firebase.database.ServerValue.TIMESTAMP,
            marker_final: roomData.state?.marker_position || 0
        });
    }

    // ── Configurar Diales ─────────────────────────────────────────────────────
    function _configureDials() {
        // Mi panel está a la derecha (azul) o izquierda (amarillo)
        const myPanelId = myColor === 'blue' ? 'dial-right' : 'dial-left';
        const myPanel = document.getElementById(myPanelId);
        if (myPanel) myPanel.classList.add('my-dial');
    }

    // ── Cleanup ───────────────────────────────────────────────────────────────
    function _cleanupRoom() {
        gameActive = false;
        currentRoomId = null;
        opponentUid = null;
        myColor = null;
        if (roomListener) { roomListener.off(); roomListener = null; }
        setStatus(myUid, 'idle');
        _updateDuelBtn('⚔️ Buscar Duelo', false);
    }

    function closeBattleResult() {
        const overlay = document.getElementById('battle-result-overlay');
        if (overlay) overlay.classList.remove('active');

        // Limpiar timer de tiempo límite y countdown
        if (battleTimer) { clearTimeout(battleTimer); battleTimer = null; }
        if (battleCountdownInterval) { clearInterval(battleCountdownInterval); battleCountdownInterval = null; }

        // Volver a CONFIG
        document.querySelectorAll('.view').forEach(v => v.classList.remove('active'));
        document.getElementById('config-view')?.classList.add('active');
        _cleanupRoom();
    }

    // ── Force Reset del juego individual (CA-03) ──────────────────────────────
    function _forceResetGame() {
        if (typeof App === 'undefined') return;
        // Limpiar todos los intervalos y timeouts
        if (App.timerInterval) { clearInterval(App.timerInterval); App.timerInterval = null; }
        if (App.inactivityTimeout) { clearTimeout(App.inactivityTimeout); App.inactivityTimeout = null; }
        if (App.helpCheckInterval) { clearInterval(App.helpCheckInterval); App.helpCheckInterval = null; }
        // IMPORTANTE: NO guardar estadísticas (corrupción de datos)
        if (typeof AudioManager !== 'undefined') AudioManager.stopBGM();
        console.log('[BattleManager] forceReset() ejecutado – sesión individual limpiada sin guardar.');
    }

    // ── Helpers UI ─────────────────────────────────────────────────────────────
    function _showToast(msg) {
        let toast = document.getElementById('battle-toast');
        if (!toast) {
            toast = document.createElement('div');
            toast.id = 'battle-toast';
            toast.className = 'battle-toast';
            document.body.appendChild(toast);
        }
        toast.textContent = msg;
        toast.classList.add('show');
        setTimeout(() => toast.classList.remove('show'), 3500);
    }

    function _updateDuelBtn(text, disabled) {
        // Actualizar el label del modo
        const modeVsLabel = document.querySelector('label[for="mode-vs"]');
        if (modeVsLabel) {
            const descEl = modeVsLabel.querySelector('.mode-desc');
            if (descEl) descEl.textContent = disabled ? text : 'Multijugador';
        }

        // Actualizar el botón principal de inicio (COMENZAR)
        const btnStart = document.querySelector('.btn-start');
        if (btnStart) {
            const spanText = btnStart.querySelector('[data-i18n="config.btn_start"]') || btnStart.querySelector('span');
            if (spanText) {
                if (disabled) {
                    if (!btnStart.dataset.originalText) {
                        btnStart.dataset.originalText = spanText.textContent;
                    }
                    spanText.textContent = text.toUpperCase();
                } else {
                    spanText.textContent = btnStart.dataset.originalText || 'COMENZAR';
                }
            }
            btnStart.disabled = disabled;
            btnStart.classList.toggle('loading', disabled);
        }
    }

    // ── API pública ────────────────────────────────────────────────────────────
    return {
        init,
        setOnline,
        setOffline,
        searchOpponent,
        acceptDuel,
        declineDuel,
        onDialPress,
        onDialClear,
        addFriend,
        closeBattleResult,
        // Exponer para tests / debugging
        _state: () => ({ currentRoomId, myColor, markerPosition, gameActive })
    };
})();

// Auto-init cuando el DOM esté listo
document.addEventListener('DOMContentLoaded', () => {
    setTimeout(() => BattleManager.init(), 900);
});
