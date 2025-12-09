/**
 * APP.JS - Lógica principal del juego (Game Loop, State Machine)
 * Fast Math Game
 */

const App = {
    // Estado del juego
    state: 'CONFIG', // CONFIG, PLAYING, DASHBOARD
    gameMode: 'TIMER',
    timeLimit: 5 * 60 * 1000, // 5 minutos en ms

    // Timer/Cronómetro
    timerInterval: null,
    startTime: null,
    elapsedTime: 0,
    remainingTime: 0,

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
            fileDropZone: document.getElementById('file-drop-zone'),
            csvUpload: document.getElementById('csv-upload'),
            fileLoaded: document.getElementById('file-loaded'),
            loadedFileName: document.getElementById('loaded-file-name'),

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

        // File upload
        this.elements.fileDropZone.addEventListener('click', () => {
            this.elements.csvUpload.click();
        });

        this.elements.csvUpload.addEventListener('change', (e) => {
            if (e.target.files.length > 0) {
                this.handleFileUpload(e.target.files[0]);
            }
        });

        // Drag & Drop
        this.elements.fileDropZone.addEventListener('dragover', (e) => {
            e.preventDefault();
            this.elements.fileDropZone.classList.add('dragover');
        });

        this.elements.fileDropZone.addEventListener('dragleave', () => {
            this.elements.fileDropZone.classList.remove('dragover');
        });

        this.elements.fileDropZone.addEventListener('drop', (e) => {
            e.preventDefault();
            this.elements.fileDropZone.classList.remove('dragover');
            if (e.dataTransfer.files.length > 0) {
                this.handleFileUpload(e.dataTransfer.files[0]);
            }
        });

        // Answer input
        this.elements.answerInput.addEventListener('keypress', (e) => {
            if (e.key === 'Enter') {
                this.submitAnswer();
            }
        });

        // End session
        this.elements.btnEndSession.addEventListener('click', () => {
            this.endGame();
        });

        // New game
        this.elements.btnNewGame.addEventListener('click', () => {
            this.resetGame();
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
     * Maneja la carga de archivo CSV
     */
    async handleFileUpload(file) {
        if (!file.name.endsWith('.csv')) {
            alert('Por favor selecciona un archivo CSV válido');
            return;
        }

        try {
            const result = await DataManager.loadCSV(file);

            // Mostrar indicador de archivo cargado
            this.elements.fileDropZone.querySelector('.drop-content').hidden = true;
            this.elements.fileLoaded.hidden = false;
            this.elements.loadedFileName.textContent = file.name;

            // Auto-fill nickname si se encontró
            if (result.nickname) {
                this.elements.nicknameInput.value = result.nickname;
            }

            console.log(`Cargados ${result.recordsLoaded} registros`);
        } catch (error) {
            alert('Error al cargar el archivo: ' + error.message);
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
        this.gameMode = this.elements.modeTimer.checked ? 'TIMER' : 'FREE';
        this.timeLimit = parseInt(this.elements.timeLimit.value) * 60 * 1000;

        // Inicializar managers
        DataManager.init(nickname);
        GridManager.init();

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

        // Descargar CSV
        if (DataManager.history.length > 0) {
            DataManager.downloadCSV();
        }
    },

    /**
     * Reinicia el juego
     */
    resetGame() {
        this.elements.timerDisplayEl.classList.remove('warning');
        DataManager.resetSession();
        ChartsManager.destroyAll();
        this.showView('CONFIG');
    }
};

// Inicializar cuando el DOM esté listo
document.addEventListener('DOMContentLoaded', () => {
    App.init();
});
