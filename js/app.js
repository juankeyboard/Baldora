/**
 * APP.JS - Lógica principal del juego (Game Loop, State Machine)
 * Fast Math Game
 */

const App = {
    // Estado del juego
    state: 'CONFIG', // CONFIG, PLAYING, DASHBOARD
    gameMode: 'TIMER',
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
            btnNewGame: document.getElementById('btn-new-game')
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
        this.elements.timerConfig.classList.toggle('hidden', !isTimer);
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

        // Validar que hay al menos una tabla seleccionada
        if (this.selectedTables.length === 0) {
            alert('Por favor selecciona al menos una tabla para practicar');
            return;
        }

        // Configurar modo
        this.gameMode = this.elements.modeTimer.checked ? 'TIMER' : 'FREE';
        this.timeLimit = parseInt(this.elements.timeLimit.value) * 60 * 1000;

        // Inicializar managers con las tablas seleccionadas
        DataManager.init(nickname);
        GridManager.init(this.selectedTables);

        // Reset stats
        this.correctCount = 0;
        this.wrongCount = 0;
        this.updateStats();

        // Configurar timer
        if (this.gameMode === 'TIMER') {
            this.remainingTime = this.timeLimit;
            this.elements.timerLabel.textContent = 'Tiempo Restante';
        } else {
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
            } else {
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
     * Carga la siguiente operación
     */
    loadNextOperation() {
        const op = GridManager.getNextOperation();

        if (!op) {
            // Grilla completa
            this.endGame();
            return;
        }

        this.currentOperation = op;
        this.operationStartTime = Date.now();

        // Actualizar UI
        this.elements.factorA.textContent = op.row;
        this.elements.factorB.textContent = op.col;
        this.elements.answerInput.value = '';

        // Marcar celda activa
        GridManager.setActive(op.row, op.col);

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

        // Actualizar stats
        this.updateStats();
        GridManager.updateProgress();

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
     */
    startInactivityTimer() {
        this.clearInactivityTimer();
        this.inactivityTimeout = setTimeout(() => {
            this.handleInactivity();
        }, this.INACTIVITY_LIMIT);
    },

    /**
     * Resetea el temporizador de inactividad
     */
    resetInactivityTimer() {
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
    }
};

// Inicializar cuando el DOM esté listo
document.addEventListener('DOMContentLoaded', () => {
    App.init();
});
