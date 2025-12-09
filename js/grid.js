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

    init() {
        this.container = document.getElementById('matrix-grid');
        this.cells = {};
        this.cellStates = {};
        this.activeCell = null;
        this.pendingOperations = [];
        this.render();
        this.initPendingOperations();
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
            rowHeader.textContent = row;
            this.container.appendChild(rowHeader);

            for (let col = 1; col <= 15; col++) {
                const cell = document.createElement('div');
                cell.className = 'matrix-cell';
                cell.dataset.row = row;
                cell.dataset.col = col;
                cell.textContent = row * col;

                const key = `${row}-${col}`;
                this.cells[key] = cell;
                this.cellStates[key] = null;
                this.container.appendChild(cell);
            }
        }
    },

    initPendingOperations() {
        this.pendingOperations = [];
        for (let row = 1; row <= 15; row++) {
            for (let col = 1; col <= 15; col++) {
                this.pendingOperations.push({ row, col });
            }
        }
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
        progressEl.textContent = `${this.getCorrectCount()} / 225`;
    },

    reset() {
        Object.keys(this.cells).forEach(key => {
            this.cells[key].classList.remove('active', 'correct', 'wrong');
            this.cellStates[key] = null;
        });
        this.activeCell = null;
        this.initPendingOperations();
        this.updateProgress();
    }
};

window.GridManager = GridManager;
