/**
 * APP.JS - Lógica principal del juego (Game Loop, State Machine)
 * Fast Math Game
 */

const App = {
    // Estado del juego
    state: 'CONFIG', // CONFIG, PLAYING, PLAYING_DIAGNOSIS, PLAYING_TRAINING, DASHBOARD
    gameMode: 'TIMER', // TIMER, FREE, ADAPTIVE

    timeLimit: 1 * 60 * 1000, // 1 minuto en ms

    // Tablas seleccionadas (por defecto solo la tabla 1)
    selectedTables: [1],

    // Timer/Cronómetro
    timerInterval: null,
    startTime: null,
    elapsedTime: 0,
    remainingTime: 0,

    // Inactividad
    inactivityTimeout: null,
    INACTIVITY_LIMIT: 30000, // 30 segundos en ms

    // Operación actual
    currentOperation: null,
    operationStartTime: null,

    // Estadísticas de sesión
    correctCount: 0,
    wrongCount: 0,

    // === MODO ADAPTATIVO ===
    adaptivePhase: 'DIAGNOSIS', // DIAGNOSIS, TRAINING
    sessionMetrics: [], // { row, col, isCorrect, responseTime }
    trainingQueue: [], // Operaciones a entrenar
    initialWeaknessCount: 0,
    trainingRounds: 0,
    SLOW_THRESHOLD_MULTIPLIER: 1.2, // 20% mas lento que el promedio

    // Ayuda visual en entrenamiento
    avgDiagnosisTime: 0, // Tiempo promedio del diagnostico
    helpCheckInterval: null, // Intervalo para verificar si mostrar ayuda
    helpShown: false, // Si ya se mostro la ayuda para esta operacion
    helpIsVisible: false, // Si la ayuda está actualmente visible
    HELP_DISPLAY_DURATION: 2000, // 2 segundos de ayuda visual
    HELP_CYCLE_INTERVAL: 10000, // 10 segundos entre ciclos de ayuda
    helpUsedCount: 0, // Contador de veces que se usó la ayuda visual

    // Timer por operación en diagnóstico
    DIAGNOSIS_OP_TIME: 30000, // 30 segundos por operación en diagnóstico
    diagnosisOpTimer: null, // Timer para cada operación en diagnóstico

    // Elementos DOM
    elements: {},


    /**
     * Inicializa la aplicación
     */
    init() {
        this.cacheElements();
        this.bindEvents();
        this.showView('CONFIG');
    },

    /**
     * Cachea referencias a elementos DOM
     */
    cacheElements() {
        this.elements = {
            // Views
            configView: document.getElementById('config-view'),
            gameView: document.getElementById('game-view'),
            dashboardView: document.getElementById('dashboard-view'),

            // Config
            configForm: document.getElementById('config-form'),
            nicknameInput: document.getElementById('nickname'),
            modeTimer: document.getElementById('mode-timer'),
            modeFree: document.getElementById('mode-free'),
            timerConfig: document.getElementById('timer-config'),
            timeLimit: document.getElementById('time-limit'),
            timeDisplay: document.getElementById('time-display'),


            // Tables selector
            tablesGrid: document.getElementById('tables-grid'),

            // Game
            timerLabel: document.getElementById('timer-label'),
            timerValue: document.getElementById('timer-value'),
            timerDisplayEl: document.getElementById('timer-display'),
            factorA: document.getElementById('factor-a'),
            factorB: document.getElementById('factor-b'),
            answerInput: document.getElementById('answer-input'),
            statCorrect: document.getElementById('stat-correct'),
            statWrong: document.getElementById('stat-wrong'),
            btnEndSession: document.getElementById('btn-end-session'),

            // Dashboard
            summaryTotal: document.getElementById('summary-total'),
            summaryCorrect: document.getElementById('summary-correct'),
            summaryAvgTime: document.getElementById('summary-avg-time'),
            summaryAccuracy: document.getElementById('summary-accuracy'),
            btnDownloadCsv: document.getElementById('btn-download-csv'),
            btnNewGame: document.getElementById('btn-new-game'),

            // Modo Adaptativo
            modeAdaptive: document.getElementById('mode-adaptive'),
            tablesConfig: document.getElementById('tables-config'),
            adaptiveInfo: document.getElementById('adaptive-info'),
            adaptivePhaseIndicator: document.getElementById('adaptive-phase'),
            matrixTitle: document.getElementById('matrix-title'),
            weaknessesCounter: document.getElementById('weaknesses-counter'),
            weaknessesValue: document.getElementById('weaknesses-value'),
            adaptiveTransitionModal: document.getElementById('adaptive-transition-modal'),
            weaknessCount: document.getElementById('weakness-count'),
            adaptiveVictoryModal: document.getElementById('adaptive-victory-modal'),
            victoryInitial: document.getElementById('victory-initial'),
            victoryRounds: document.getElementById('victory-rounds'),
            victoryHelpCount: document.getElementById('victory-help-count')
        };
    },

    /**
     * Vincula eventos
     */
    bindEvents() {
        // Config form
        this.elements.configForm.addEventListener('submit', (e) => {
            e.preventDefault();
            this.startGame();
        });

        // Mode toggle
        this.elements.modeTimer.addEventListener('change', () => this.updateModeUI());
        this.elements.modeFree.addEventListener('change', () => this.updateModeUI());
        this.elements.modeAdaptive.addEventListener('change', () => this.updateModeUI());

        // Time slider
        this.elements.timeLimit.addEventListener('input', (e) => {
            this.elements.timeDisplay.textContent = `${e.target.value} min`;
        });



        // Answer input - detectar actividad
        this.elements.answerInput.addEventListener('input', () => {
            this.resetInactivityTimer();
        });

        this.elements.answerInput.addEventListener('keypress', (e) => {
            this.resetInactivityTimer();
            if (e.key === 'Enter') {
                this.submitAnswer();
            }
        });

        // End session
        this.elements.btnEndSession.addEventListener('click', () => {
            this.endGame();
        });

        // Download CSV
        this.elements.btnDownloadCsv.addEventListener('click', () => {
            if (DataManager.history.length > 0) {
                DataManager.downloadCSV();
            }
        });

        // New game
        this.elements.btnNewGame.addEventListener('click', () => {
            this.resetGame();
        });

        // Tables selection
        this.elements.tablesGrid.addEventListener('click', (e) => {
            const btn = e.target.closest('.table-btn');
            if (btn && btn.dataset.table) {
                this.toggleTable(parseInt(btn.dataset.table));
            }
        });
    },

    /**
     * Muestra una vista específica
     */
    showView(view) {
        this.state = view;

        this.elements.configView.classList.remove('active');
        this.elements.gameView.classList.remove('active');
        this.elements.dashboardView.classList.remove('active');

        switch (view) {
            case 'CONFIG':
                this.elements.configView.classList.add('active');
                break;
            case 'PLAYING':
                this.elements.gameView.classList.add('active');
                break;
            case 'DASHBOARD':
                this.elements.dashboardView.classList.add('active');
                break;
        }
    },

    /**
     * Actualiza UI según el modo seleccionado
     */
    updateModeUI() {
        const isTimer = this.elements.modeTimer.checked;
        const isAdaptive = this.elements.modeAdaptive.checked;

        // Mostrar/ocultar config de tiempo
        this.elements.timerConfig.classList.toggle('hidden', !isTimer);

        // El selector de tablas está disponible en TODOS los modos (incluyendo adaptativo)
        this.elements.tablesConfig.hidden = false;

        // Mostrar/ocultar info del modo adaptativo
        this.elements.adaptiveInfo.hidden = !isAdaptive;

        // Si es modo adaptativo, seleccionar todas las tablas por defecto
        if (isAdaptive && this.selectedTables.length === 1 && this.selectedTables[0] === 1) {
            this.selectAllTables();
        }
    },

    /**
     * Selecciona todas las tablas
     */
    selectAllTables() {
        this.selectedTables = [1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12, 13, 14, 15];
        document.querySelectorAll('.table-btn').forEach(btn => {
            btn.classList.add('active');
        });
    },

    /**
     * Alterna la selección de una tabla específica
     */
    toggleTable(tableNum) {
        const index = this.selectedTables.indexOf(tableNum);
        const btn = document.querySelector(`.table-btn[data-table="${tableNum}"]`);

        if (index === -1) {
            // Agregar tabla
            this.selectedTables.push(tableNum);
            this.selectedTables.sort((a, b) => a - b);
            btn.classList.add('active');
        } else {
            // Quitar tabla
            this.selectedTables.splice(index, 1);
            btn.classList.remove('active');
        }
    },



    /**
     * Inicia el juego
     */
    startGame() {
        const nickname = this.elements.nicknameInput.value.trim();
        if (!nickname) {
            alert('Por favor ingresa tu nickname');
            return;
        }

        // Configurar modo
        if (this.elements.modeAdaptive.checked) {
            this.gameMode = 'ADAPTIVE';
        } else if (this.elements.modeTimer.checked) {
            this.gameMode = 'TIMER';
        } else {
            this.gameMode = 'FREE';
        }

        // Validar que hay al menos una tabla seleccionada (aplica para todos los modos)
        if (this.selectedTables.length === 0) {
            alert('Por favor selecciona al menos una tabla para practicar');
            return;
        }

        this.timeLimit = parseInt(this.elements.timeLimit.value) * 60 * 1000;

        // Inicializar managers
        DataManager.init(nickname);

        // Para modo adaptativo: usar las tablas seleccionadas por el usuario
        if (this.gameMode === 'ADAPTIVE') {
            this.adaptivePhase = 'DIAGNOSIS';
            this.sessionMetrics = [];
            this.trainingQueue = [];
            this.trainingRounds = 0;
            this.initialWeaknessCount = 0;

            // Usar las tablas seleccionadas por el usuario
            GridManager.init(this.selectedTables);

            // Calcular total de operaciones para el título
            const totalOps = this.selectedTables.length * 15;

            // Mostrar indicador de fase
            this.elements.adaptivePhaseIndicator.hidden = false;
            this.elements.adaptivePhaseIndicator.innerHTML = '<span class="phase-badge phase-diagnosis">📋 Fase Diagnóstico</span>';
            this.elements.matrixTitle.textContent = `Diagnóstico - ${totalOps} operaciones`;
            this.elements.weaknessesCounter.hidden = true;
        } else {
            GridManager.init(this.selectedTables);
            this.elements.adaptivePhaseIndicator.hidden = true;
            this.elements.matrixTitle.textContent = 'Tabla de Multiplicar';
            this.elements.weaknessesCounter.hidden = true;
        }

        // Reset stats
        this.correctCount = 0;
        this.wrongCount = 0;
        this.updateStats();

        // Configurar timer
        if (this.gameMode === 'TIMER') {
            this.remainingTime = this.timeLimit;
            this.elements.timerLabel.textContent = 'Tiempo Restante';
        } else if (this.gameMode === 'ADAPTIVE') {
            // Modo adaptativo: cuenta regresiva de 30 segundos por operación en diagnostico
            this.remainingTime = this.DIAGNOSIS_OP_TIME;
            this.elements.timerLabel.textContent = 'Tiempo Operación';
            this.helpUsedCount = 0; // Reset contador de ayudas
        } else {
            // FREE usa cronometro
            this.elapsedTime = 0;
            this.elements.timerLabel.textContent = 'Tiempo';
        }

        // Mostrar vista de juego
        this.showView('PLAYING');

        // Iniciar timer
        this.startTime = Date.now();
        this.startTimer();

        // Iniciar timer de inactividad
        this.startInactivityTimer();

        // Cargar primera operación
        this.loadNextOperation();

        // Focus en input
        this.elements.answerInput.focus();
    },

    /**
     * Inicia el timer/cronómetro
     */
    startTimer() {
        this.timerInterval = setInterval(() => {
            if (this.gameMode === 'TIMER') {
                // Modo contrarreloj: cuenta regresiva
                this.remainingTime = this.timeLimit - (Date.now() - this.startTime);

                if (this.remainingTime <= 0) {
                    this.remainingTime = 0;
                    this.endGame();
                    return;
                }

                // Warning cuando queda poco tiempo
                if (this.remainingTime < 60000) {
                    this.elements.timerDisplayEl.classList.add('warning');
                }

                this.updateTimerDisplay(this.remainingTime);
            } else if (this.gameMode === 'ADAPTIVE' && this.adaptivePhase === 'DIAGNOSIS') {
                // Modo adaptativo fase diagnostico: cuenta regresiva de 30s por operación
                this.remainingTime = this.DIAGNOSIS_OP_TIME - (Date.now() - this.operationStartTime);

                if (this.remainingTime <= 0) {
                    this.remainingTime = 0;
                    // Tiempo agotado para esta operación - registrar como timeout y pasar a siguiente
                    this.handleDiagnosisTimeout();
                    return;
                }

                // Warning cuando queda poco tiempo (menos de 10 segundos)
                if (this.remainingTime < 10000) {
                    this.elements.timerDisplayEl.classList.add('warning');
                } else {
                    this.elements.timerDisplayEl.classList.remove('warning');
                }

                this.updateTimerDisplay(this.remainingTime);
            } else if (this.gameMode === 'ADAPTIVE' && this.adaptivePhase === 'TRAINING') {
                // Modo adaptativo fase entrenamiento: cronometro (sin limite)
                this.elapsedTime = Date.now() - this.startTime;
                this.updateTimerDisplay(this.elapsedTime);
            } else {
                // Modo FREE: cronometro
                this.elapsedTime = Date.now() - this.startTime;
                this.updateTimerDisplay(this.elapsedTime);
            }
        }, 100);
    },

    /**
     * Actualiza el display del timer
     */
    updateTimerDisplay(ms) {
        const totalSeconds = Math.floor(ms / 1000);
        const minutes = Math.floor(totalSeconds / 60);
        const seconds = totalSeconds % 60;
        this.elements.timerValue.textContent =
            `${String(minutes).padStart(2, '0')}:${String(seconds).padStart(2, '0')}`;
    },

    /**
     * Carga la siguiente operacion
     */
    loadNextOperation() {
        // Limpiar intervalo de ayuda visual anterior
        this.clearHelpCheck();

        const op = GridManager.getNextOperation();

        if (!op) {
            // Grilla completa
            this.endGame();
            return;
        }

        this.currentOperation = op;
        this.operationStartTime = Date.now();
        this.helpShown = false;

        // Actualizar UI
        this.elements.factorA.textContent = op.row;
        this.elements.factorB.textContent = op.col;
        this.elements.answerInput.value = '';

        // Marcar celda activa
        GridManager.setActive(op.row, op.col);

        // Iniciar chequeo de ayuda visual en fase de entrenamiento
        if (this.gameMode === 'ADAPTIVE' && this.adaptivePhase === 'TRAINING') {
            this.startHelpCheck();
        }

        // Focus
        this.elements.answerInput.focus();
    },

    /**
     * Envía la respuesta del jugador
     */
    submitAnswer() {
        const userInput = parseInt(this.elements.answerInput.value);

        if (isNaN(userInput)) {
            return;
        }

        const { row, col } = this.currentOperation;
        const correctResult = row * col;
        const isCorrect = userInput === correctResult;
        const responseTime = Date.now() - this.operationStartTime;

        // Registrar intento
        DataManager.recordAttempt(row, col, userInput, isCorrect, responseTime, this.gameMode);

        // Actualizar grilla
        if (isCorrect) {
            GridManager.markCorrect(row, col);
            this.correctCount++;
        } else {
            GridManager.markWrong(row, col);
            this.wrongCount++;
        }

        // === MODO ADAPTATIVO: Guardar métricas ===
        if (this.gameMode === 'ADAPTIVE') {
            if (this.adaptivePhase === 'DIAGNOSIS') {
                // Guardar métrica para análisis posterior
                this.sessionMetrics.push({
                    row,
                    col,
                    isCorrect,
                    responseTime
                });
            } else if (this.adaptivePhase === 'TRAINING') {
                // En fase de entrenamiento, solo las correctas salen de la cola
                if (isCorrect) {
                    // Remover de la cola de entrenamiento
                    this.trainingQueue = this.trainingQueue.filter(
                        op => !(op.row === row && op.col === col)
                    );
                    // Marcar celda como dominada
                    GridManager.markCellMastered(row, col);
                }
                // Actualizar contador de debilidades
                this.elements.weaknessesValue.textContent = this.trainingQueue.length;
            }
        }

        // Actualizar stats
        this.updateStats();
        GridManager.updateProgress();

        // Verificar si terminó la fase de diagnóstico
        if (this.gameMode === 'ADAPTIVE' && this.adaptivePhase === 'DIAGNOSIS') {
            if (GridManager.isComplete()) {
                this.showAdaptiveTransition();
                return;
            }
        }

        // Verificar si terminó la fase de entrenamiento
        if (this.gameMode === 'ADAPTIVE' && this.adaptivePhase === 'TRAINING') {
            if (this.trainingQueue.length === 0) {
                this.showAdaptiveVictory();
                return;
            }
        }

        // Siguiente operación
        this.loadNextOperation();
    },

    /**
     * Actualiza las estadísticas en pantalla
     */
    updateStats() {
        this.elements.statCorrect.textContent = this.correctCount;
        this.elements.statWrong.textContent = this.wrongCount;
    },

    /**
     * Finaliza el juego
     */
    endGame() {
        // Detener timer
        if (this.timerInterval) {
            clearInterval(this.timerInterval);
            this.timerInterval = null;
        }

        // Detener timer de inactividad
        this.clearInactivityTimer();

        // Obtener estadísticas
        const stats = DataManager.getSessionStats();

        // Actualizar dashboard
        this.elements.summaryTotal.textContent = stats.total;
        this.elements.summaryCorrect.textContent = stats.correct;
        this.elements.summaryAvgTime.textContent = `${stats.avgTime}ms`;
        this.elements.summaryAccuracy.textContent = `${stats.accuracy}%`;

        // Mostrar dashboard
        this.showView('DASHBOARD');

        // Renderizar gráficas
        setTimeout(() => {
            ChartsManager.renderAll();
        }, 100);
    },

    /**
     * Reinicia el juego
     */
    resetGame() {
        this.clearInactivityTimer();
        this.elements.timerDisplayEl.classList.remove('warning');
        DataManager.resetSession();
        ChartsManager.destroyAll();
        this.showView('CONFIG');
    },

    /**
     * Inicia el temporizador de inactividad
     * NOTA: Desactivado durante fase de entrenamiento adaptativo
     */
    startInactivityTimer() {
        // No activar inactividad durante fase de entrenamiento
        if (this.gameMode === 'ADAPTIVE' && this.adaptivePhase === 'TRAINING') {
            return;
        }

        this.clearInactivityTimer();
        this.inactivityTimeout = setTimeout(() => {
            this.handleInactivity();
        }, this.INACTIVITY_LIMIT);
    },

    /**
     * Resetea el temporizador de inactividad
     */
    resetInactivityTimer() {
        // No activar inactividad durante fase de entrenamiento
        if (this.gameMode === 'ADAPTIVE' && this.adaptivePhase === 'TRAINING') {
            return;
        }

        if (this.state === 'PLAYING') {
            this.startInactivityTimer();
        }
    },

    /**
     * Limpia el temporizador de inactividad
     */
    clearInactivityTimer() {
        if (this.inactivityTimeout) {
            clearTimeout(this.inactivityTimeout);
            this.inactivityTimeout = null;
        }
    },

    /**
     * Maneja la inactividad del usuario
     */
    handleInactivity() {
        // Detener timer del juego
        if (this.timerInterval) {
            clearInterval(this.timerInterval);
            this.timerInterval = null;
        }

        // Mostrar modal de inactividad
        this.showInactivityModal();
    },

    /**
     * Muestra el modal de inactividad
     */
    showInactivityModal() {
        const modal = document.getElementById('inactivity-modal');
        if (modal) {
            modal.classList.add('active');
        }
    },

    /**
     * Cierra el modal de inactividad y reinicia
     */
    closeInactivityModal() {
        const modal = document.getElementById('inactivity-modal');
        if (modal) {
            modal.classList.remove('active');
        }
        this.resetGame();
    },

    // ========================================
    // === FUNCIONES DEL MODO ADAPTATIVO ===
    // ========================================

    /**
     * Muestra el modal de transición después del diagnóstico
     */
    showAdaptiveTransition() {
        // Detener timers
        if (this.timerInterval) {
            clearInterval(this.timerInterval);
            this.timerInterval = null;
        }
        this.clearInactivityTimer();

        // Generar cola de entrenamiento
        this.generateTrainingQueue();

        // Mostrar conteo de debilidades
        this.elements.weaknessCount.textContent = this.trainingQueue.length;
        this.initialWeaknessCount = this.trainingQueue.length;

        // Si no hay debilidades, ir directo a victoria
        if (this.trainingQueue.length === 0) {
            this.showAdaptiveVictory();
            return;
        }

        // Mostrar modal de transición
        this.elements.adaptiveTransitionModal.classList.add('active');
    },

    /**
     * Genera la cola de entrenamiento basada en errores y respuestas lentas
     */
    generateTrainingQueue() {
        // Calcular tiempo promedio
        const totalTime = this.sessionMetrics.reduce((acc, m) => acc + m.responseTime, 0);
        const avgTime = totalTime / this.sessionMetrics.length;
        const speedThreshold = avgTime * this.SLOW_THRESHOLD_MULTIPLIER;

        // Guardar avgTime para ayuda visual en entrenamiento
        this.avgDiagnosisTime = avgTime;

        // Filtrar operaciones problematicas
        this.trainingQueue = this.sessionMetrics.filter(m => {
            const isWrong = !m.isCorrect;
            const isSlow = m.responseTime > speedThreshold;
            return isWrong || isSlow;
        }).map(m => ({ row: m.row, col: m.col }));

        console.log(`[Adaptativo] Promedio: ${Math.round(avgTime)}ms, Umbral: ${Math.round(speedThreshold)}ms`);
        console.log(`[Adaptativo] Debilidades detectadas: ${this.trainingQueue.length}`);
    },

    /**
     * Inicia la fase de entrenamiento
     */
    startTrainingPhase() {
        // Cerrar modal de transición
        this.elements.adaptiveTransitionModal.classList.remove('active');

        // Cambiar a fase de entrenamiento
        this.adaptivePhase = 'TRAINING';
        this.trainingRounds = 1;

        // Actualizar UI
        this.elements.adaptivePhaseIndicator.innerHTML = '<span class="phase-badge phase-training">🎯 Fase Entrenamiento</span>';
        this.elements.matrixTitle.textContent = 'Entrenamiento - Dominando Debilidades';
        this.elements.timerLabel.textContent = 'Entrenamiento';

        // Mostrar contador de debilidades
        this.elements.weaknessesCounter.hidden = false;
        this.elements.weaknessesValue.textContent = this.trainingQueue.length;

        // Filtrar el grid para mostrar solo las debilidades
        GridManager.filterForTraining(this.trainingQueue);

        // Reset stats para la fase de entrenamiento
        this.correctCount = 0;
        this.wrongCount = 0;
        this.updateStats();

        // Reiniciar timer (ahora es cronometro sin limite)
        if (this.timerInterval) {
            clearInterval(this.timerInterval);
        }
        this.elements.timerDisplayEl.classList.remove('warning');
        this.elapsedTime = 0;
        this.startTime = Date.now();
        this.startTimer();
        // NO iniciar timer de inactividad en fase de entrenamiento

        // Cargar primera operación de entrenamiento
        this.loadNextOperation();
        this.elements.answerInput.focus();
    },

    /**
     * Muestra el modal de victoria del modo adaptativo
     */
    showAdaptiveVictory() {
        // Detener timers
        if (this.timerInterval) {
            clearInterval(this.timerInterval);
            this.timerInterval = null;
        }
        this.clearInactivityTimer();

        // Actualizar estadísticas de victoria
        this.elements.victoryInitial.textContent = this.initialWeaknessCount;
        this.elements.victoryRounds.textContent = this.trainingRounds;
        this.elements.victoryHelpCount.textContent = this.helpUsedCount;

        // Mostrar modal
        this.elements.adaptiveVictoryModal.classList.add('active');
    },

    /**
     * Finaliza el modo adaptativo y muestra el dashboard
     */
    finishAdaptiveMode() {
        // Cerrar modal
        this.elements.adaptiveVictoryModal.classList.remove('active');

        // Ir al dashboard normal
        this.endGame();
    },

    // ========================================
    // === FUNCIONES DE AYUDA VISUAL ===
    // ========================================

    /**
     * Maneja el timeout de una operación en fase de diagnóstico
     * Registra la operación como "no respondida" y pasa a la siguiente
     */
    handleDiagnosisTimeout() {
        if (!this.currentOperation) return;

        const { row, col } = this.currentOperation;
        const responseTime = this.DIAGNOSIS_OP_TIME; // Tiempo máximo

        // Registrar como error (timeout)
        this.sessionMetrics.push({
            row,
            col,
            isCorrect: false,
            responseTime,
            isTimeout: true
        });

        // Marcar como error en la grilla
        GridManager.markWrong(row, col);
        this.wrongCount++;
        this.updateStats();
        GridManager.updateProgress();

        // Quitar de pendientes (no volver a preguntar en diagnóstico)
        GridManager.pendingOperations = GridManager.pendingOperations.filter(
            op => !(op.row === row && op.col === col)
        );

        // Verificar si terminó el diagnóstico
        if (GridManager.isComplete()) {
            this.showAdaptiveTransition();
            return;
        }

        // Reset timer para siguiente operación
        this.elements.timerDisplayEl.classList.remove('warning');

        // Cargar siguiente operación
        this.loadNextOperation();
    },

    /**
     * Inicia el intervalo de chequeo para mostrar ayuda visual (cíclica)
     * Se muestra por 2 segundos cada 10 segundos
     */
    startHelpCheck() {
        this.clearHelpCheck();
        this.helpShown = false;
        this.helpIsVisible = false;
        this.nextHelpTime = 0; // Permitir mostrar ayuda inmediatamente si cumple el tiempo promedio

        // Verificar cada 500ms si hay que mostrar la ayuda
        this.helpCheckInterval = setInterval(() => {
            if (this.currentOperation && !this.helpIsVisible) {
                const elapsed = Date.now() - this.operationStartTime;

                const now = Date.now();
                // Si superó el tiempo promedio del diagnóstico Y ya pasó el cooldown
                if (elapsed > this.avgDiagnosisTime && now >= this.nextHelpTime) {
                    this.showVisualHelp();
                }
            }
        }, 500);
    },

    /**
     * Limpia el intervalo de chequeo de ayuda
     */
    clearHelpCheck() {
        if (this.helpCheckInterval) {
            clearInterval(this.helpCheckInterval);
            this.helpCheckInterval = null;
        }
    },

    /**
     * Muestra la ayuda visual en la celda de la matriz (cíclica)
     * Se muestra por 2 segundos, luego se oculta por 1 segundo, y se repite
     */
    showVisualHelp() {
        if (!this.currentOperation || this.helpIsVisible) return;

        this.helpIsVisible = true;

        // Solo contar la primera vez que se muestra para esta operación
        if (!this.helpShown) {
            this.helpShown = true;
            this.helpUsedCount++;
            console.log(`[Ayuda Visual] Primera ayuda para esta operación. Total: ${this.helpUsedCount}`);
        }

        const { row, col } = this.currentOperation;
        const result = row * col;

        // Mostrar respuesta en la celda
        GridManager.showAnswerInCell(row, col, result);

        console.log(`[Ayuda Visual] Mostrando ${row} x ${col} = ${result}`);

        // Ocultar despues de 2 segundos
        setTimeout(() => {
            if (this.currentOperation && this.currentOperation.row === row && this.currentOperation.col === col) {
                GridManager.hideAnswerFromCell(row, col);
                this.helpIsVisible = false;
                // Establecer cooldown de 10 segundos antes de la próxima ayuda
                this.nextHelpTime = Date.now() + this.HELP_CYCLE_INTERVAL;
            }
        }, this.HELP_DISPLAY_DURATION);
    }
};

// Inicializar cuando el DOM esté listo
document.addEventListener('DOMContentLoaded', () => {
    App.init();
});
