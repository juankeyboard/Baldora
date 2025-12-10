/**
 * GRID.JS - Renderizado y manipulación de la matriz 15x15
 * Fast Math Game
 */

const GridManager = {
    container: null,
    cells: {},
    activeCell: null,
    cellStates: {},
    pendingOperations: [],
    selectedTables: [1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12, 13, 14, 15],
    totalOperations: 225,

    init(tables = null) {
        this.container = document.getElementById('matrix-grid');
        this.cells = {};
        this.cellStates = {};
        this.activeCell = null;
        this.pendingOperations = [];
        this.selectedTables = tables || [1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12, 13, 14, 15];
        this.render();
        this.initPendingOperations();
        this.updateProgress();
    },

    render() {
        this.container.innerHTML = '';

        const cornerCell = document.createElement('div');
        cornerCell.className = 'matrix-cell header';
        cornerCell.textContent = '×';
        this.container.appendChild(cornerCell);

        for (let i = 1; i <= 15; i++) {
            const headerCell = document.createElement('div');
            headerCell.className = 'matrix-cell header';
            headerCell.textContent = i;
            this.container.appendChild(headerCell);
        }

        for (let row = 1; row <= 15; row++) {
            const rowHeader = document.createElement('div');
            rowHeader.className = 'matrix-cell header';
            // Marcar headers de filas deshabilitadas
            if (!this.selectedTables.includes(row)) {
                rowHeader.classList.add('disabled');
            }
            rowHeader.textContent = row;
            this.container.appendChild(rowHeader);

            for (let col = 1; col <= 15; col++) {
                const cell = document.createElement('div');
                cell.className = 'matrix-cell';
                cell.dataset.row = row;
                cell.dataset.col = col;
                cell.textContent = `${row}×${col}`;

                // Marcar celdas fuera de las tablas seleccionadas (solo se verifica la fila)
                const isRowSelected = this.selectedTables.includes(row);
                if (!isRowSelected) {
                    cell.classList.add('disabled');
                }

                const key = `${row}-${col}`;
                this.cells[key] = cell;
                this.cellStates[key] = null;
                this.container.appendChild(cell);
            }
        }
    },

    initPendingOperations() {
        this.pendingOperations = [];
        // Generar operaciones: para cada tabla seleccionada, incluir toda la fila (de 1 a 15)
        for (const row of this.selectedTables) {
            for (let col = 1; col <= 15; col++) {
                this.pendingOperations.push({ row, col });
            }
        }
        this.totalOperations = this.pendingOperations.length;
        this.shuffleOperations();
    },

    shuffleOperations() {
        for (let i = this.pendingOperations.length - 1; i > 0; i--) {
            const j = Math.floor(Math.random() * (i + 1));
            [this.pendingOperations[i], this.pendingOperations[j]] =
                [this.pendingOperations[j], this.pendingOperations[i]];
        }
    },

    getNextOperation() {
        return this.pendingOperations.length === 0 ? null : this.pendingOperations[0];
    },

    setActive(row, col) {
        if (this.activeCell) this.activeCell.classList.remove('active');
        const key = `${row}-${col}`;
        const cell = this.cells[key];
        if (cell) {
            cell.classList.add('active');
            this.activeCell = cell;
            cell.scrollIntoView({ behavior: 'smooth', block: 'center' });
        }
    },

    markCorrect(row, col) {
        const key = `${row}-${col}`;
        const cell = this.cells[key];
        if (cell) {
            cell.classList.remove('active', 'wrong');
            cell.classList.add('correct');
            this.cellStates[key] = 'correct';
            this.pendingOperations = this.pendingOperations.filter(op => !(op.row === row && op.col === col));
        }
    },

    markWrong(row, col) {
        const key = `${row}-${col}`;
        const cell = this.cells[key];
        if (cell) {
            cell.classList.remove('active');
            cell.classList.add('wrong');
            this.cellStates[key] = 'wrong';
            const index = this.pendingOperations.findIndex(op => op.row === row && op.col === col);
            if (index !== -1) {
                const [op] = this.pendingOperations.splice(index, 1);
                this.pendingOperations.push(op);
            }
        }
    },

    getCorrectCount() {
        return Object.values(this.cellStates).filter(state => state === 'correct').length;
    },

    getWrongCount() {
        return Object.values(this.cellStates).filter(state => state === 'wrong').length;
    },

    isComplete() {
        return this.pendingOperations.length === 0;
    },

    updateProgress() {
        const progressEl = document.getElementById('matrix-progress');
        progressEl.textContent = `${this.getCorrectCount()} / ${this.totalOperations}`;
    },

    reset() {
        Object.keys(this.cells).forEach(key => {
            this.cells[key].classList.remove('active', 'correct', 'wrong', 'mastered', 'weakness', 'hidden-adaptive');
            this.cellStates[key] = null;
        });
        this.activeCell = null;
        this.initPendingOperations();
        this.updateProgress();
    },

    /**
     * Filtra el grid para mostrar solo las operaciones de entrenamiento
     * @param {Array} trainingQueue - Array de {row, col} a entrenar
     */
    filterForTraining(trainingQueue) {
        // Crear set de claves para búsqueda rápida
        const trainingKeys = new Set(trainingQueue.map(op => `${op.row}-${op.col}`));

        // Ocultar todas las celdas excepto las de entrenamiento
        Object.keys(this.cells).forEach(key => {
            const cell = this.cells[key];
            cell.classList.remove('correct', 'wrong', 'active');

            if (trainingKeys.has(key)) {
                // Celda de entrenamiento - resaltarla
                cell.classList.add('weakness');
                cell.classList.remove('hidden-adaptive', 'mastered');
                this.cellStates[key] = null;
            } else {
                // Celda dominada - atenuarla
                cell.classList.add('hidden-adaptive');
                cell.classList.remove('weakness');
            }
        });

        // Reiniciar operaciones pendientes con solo las de entrenamiento
        this.pendingOperations = [...trainingQueue];
        this.totalOperations = trainingQueue.length;
        this.shuffleOperations();
        this.updateProgress();
    },

    /**
     * Marca una celda como dominada (salio de la cola de entrenamiento)
     */
    markCellMastered(row, col) {
        const key = `${row}-${col}`;
        const cell = this.cells[key];
        if (cell) {
            cell.classList.remove('weakness', 'active', 'wrong');
            cell.classList.add('mastered');
            this.cellStates[key] = 'mastered';
        }
    },

    /**
     * Muestra la respuesta en una celda (ayuda visual)
     */
    showAnswerInCell(row, col, answer) {
        const key = `${row}-${col}`;
        const cell = this.cells[key];
        if (cell) {
            // Guardar contenido original
            cell.dataset.originalContent = cell.textContent;
            cell.textContent = answer;
            cell.classList.add('showing-help');
        }
    },

    /**
     * Oculta la respuesta de una celda (vuelve al estado normal)
     */
    hideAnswerFromCell(row, col) {
        const key = `${row}-${col}`;
        const cell = this.cells[key];
        if (cell && cell.dataset.originalContent) {
            cell.textContent = cell.dataset.originalContent;
            cell.classList.remove('showing-help');
            delete cell.dataset.originalContent;
        }
    }
};

window.GridManager = GridManager;
