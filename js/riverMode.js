/**
 * RIVERMODE.JS - Modo Arcade "El Rio" (f19 v2.0)
 * Baldora
 *
 * Motor de caida dinamica para el modo FREE.
 * Contenedores flotantes descienden hacia el rio;
 * el jugador escribe respuestas en un input global.
 */

const RiverMode = {
    // === Estado ===
    containers: [],       // Contenedores activos en pantalla
    inputEl: null,        // Input global
    arenaEl: null,        // Contenedor principal del arena
    layerEl: null,        // Capa donde se renderizan los contenedores
    silhouetteEl: null,   // Silueta del rio
    animFrame: null,      // requestAnimationFrame handle
    spawnTimer: null,      // setInterval handle para spawn
    correctCount: 0,
    wrongCount: 0,
    lastFrameTime: 0,     // Timestamp del ultimo frame
    _running: false,

    // Configuracion
    MAX_CONTAINERS: 5,
    SPAWN_INTERVAL: 2000,  // ms entre spawns
    SPEEDS: [80, 140, 200], // px/s: lenta, media, rapida

    // Tablas seleccionadas (copia local)
    _rows: [],
    _cols: [],

    // Pool de operaciones para no repetir demasiado
    _opPool: [],

    /**
     * Inicia el modo El Rio
     * @param {number[]} rows - Filas seleccionadas
     * @param {number[]} cols - Columnas seleccionadas
     */
    start(rows, cols) {
        this._rows = rows.slice();
        this._cols = cols.slice();
        this._rebuildPool();

        this.correctCount = 0;
        this.wrongCount = 0;
        this.containers = [];
        this._running = true;

        // Cachear elementos DOM
        this.arenaEl = document.getElementById('river-arena');
        this.layerEl = document.getElementById('river-containers-layer');
        this.silhouetteEl = document.getElementById('river-silhouette');
        this.inputEl = document.getElementById('river-input');

        // Limpiar capa
        this.layerEl.innerHTML = '';

        // Ocultar panel de matriz y controles clasicos, mostrar arena
        const matrixPanel = document.querySelector('.matrix-panel');
        const controlsPanel = document.querySelector('.controls-panel');
        if (matrixPanel) matrixPanel.style.display = 'none';
        if (controlsPanel) controlsPanel.style.display = 'none';
        this.arenaEl.style.display = 'flex';

        // Bind input
        this._onKeyDown = this._handleKeyDown.bind(this);
        this.inputEl.addEventListener('keydown', this._onKeyDown);

        // Focus permanente
        this._onBlur = () => {
            if (this._running) {
                setTimeout(() => {
                    if (this._running && this.inputEl) this.inputEl.focus();
                }, 50);
            }
        };
        this.inputEl.addEventListener('blur', this._onBlur);
        this.inputEl.value = '';
        this.inputEl.focus();

        // Primer spawn inmediato, luego cada SPAWN_INTERVAL
        this._spawnContainer();
        this.spawnTimer = setInterval(() => {
            if (this._running) this._spawnContainer();
        }, this.SPAWN_INTERVAL);

        // Iniciar game loop
        this.lastFrameTime = performance.now();
        this._gameLoop();
    },

    /**
     * Detiene todo el modo El Rio y restaura la UI
     */
    stop() {
        this._running = false;

        // Cancelar animacion
        if (this.animFrame) {
            cancelAnimationFrame(this.animFrame);
            this.animFrame = null;
        }

        // Detener spawner
        if (this.spawnTimer) {
            clearInterval(this.spawnTimer);
            this.spawnTimer = null;
        }

        // Limpiar listeners
        if (this.inputEl) {
            this.inputEl.removeEventListener('keydown', this._onKeyDown);
            this.inputEl.removeEventListener('blur', this._onBlur);
        }

        // Limpiar contenedores del DOM
        if (this.layerEl) {
            this.layerEl.innerHTML = '';
        }
        this.containers = [];

        // Restaurar UI clasica
        if (this.arenaEl) this.arenaEl.style.display = 'none';
        const matrixPanel = document.querySelector('.matrix-panel');
        const controlsPanel = document.querySelector('.controls-panel');
        if (matrixPanel) matrixPanel.style.display = '';
        if (controlsPanel) controlsPanel.style.display = '';
    },

    // === Generacion de operaciones ===

    _rebuildPool() {
        this._opPool = [];
        for (const r of this._rows) {
            for (const c of this._cols) {
                this._opPool.push({ row: r, col: c, result: r * c });
            }
        }
        this._shufflePool();
    },

    _shufflePool() {
        for (let i = this._opPool.length - 1; i > 0; i--) {
            const j = Math.floor(Math.random() * (i + 1));
            [this._opPool[i], this._opPool[j]] = [this._opPool[j], this._opPool[i]];
        }
        this._poolIndex = 0;
    },

    _poolIndex: 0,

    _nextOp() {
        if (this._poolIndex >= this._opPool.length) {
            this._shufflePool();
        }
        return this._opPool[this._poolIndex++];
    },

    // === Spawn de contenedores ===

    _spawnContainer() {
        if (this.containers.length >= this.MAX_CONTAINERS) return;
        if (!this.arenaEl || !this.layerEl) return;

        const op = this._nextOp();
        const speed = this.SPEEDS[Math.floor(Math.random() * this.SPEEDS.length)];

        // Crear elemento DOM
        const el = document.createElement('div');
        el.className = 'river-container';
        el.innerHTML = `<span class="river-op">${op.row} &times; ${op.col} =</span>`;

        // Posicion X aleatoria (10%-80% del ancho disponible para evitar desborde)
        const arenaRect = this.arenaEl.getBoundingClientRect();
        const maxX = arenaRect.width - 130; // ancho aprox del contenedor
        const x = Math.max(10, Math.random() * maxX);
        el.style.left = x + 'px';
        el.style.top = '-60px'; // Empieza fuera de pantalla

        this.layerEl.appendChild(el);

        const container = {
            el: el,
            row: op.row,
            col: op.col,
            result: op.result,
            y: -60,
            speed: speed,
            spawnTime: performance.now(),
            dead: false
        };

        this.containers.push(container);
    },

    // === Game Loop ===

    _gameLoop() {
        if (!this._running) return;

        const now = performance.now();
        const dt = (now - this.lastFrameTime) / 1000; // delta en segundos
        this.lastFrameTime = now;

        // Mover contenedores
        for (const c of this.containers) {
            if (c.dead) continue;
            c.y += c.speed * dt;
            c.el.style.transform = `translateY(${c.y}px)`;
        }

        // Verificar colisiones con el rio
        this._checkCollisions();

        // Limpiar contenedores muertos
        this.containers = this.containers.filter(c => !c.dead);

        this.animFrame = requestAnimationFrame(() => this._gameLoop());
    },

    _checkCollisions() {
        if (!this.silhouetteEl) return;

        const silhouetteTop = this.silhouetteEl.offsetTop;

        for (const c of this.containers) {
            if (c.dead) continue;

            // La posicion real del contenedor: top(-60px inicial) + translateY
            // El el tiene style.top fijo y transform:translateY se mueve
            const elTop = c.el.offsetTop + c.y;
            const elBottom = elTop + c.el.offsetHeight;

            if (elBottom >= silhouetteTop) {
                this._drown(c);
            }
        }
    },

    // === Input ===

    _handleKeyDown(e) {
        if (e.key === 'Enter') {
            e.preventDefault();
            const val = parseInt(this.inputEl.value);
            this.inputEl.value = '';

            if (isNaN(val)) return;

            // Buscar contenedor cuyo resultado coincida (el mas cercano al rio primero)
            let match = null;
            let bestY = -Infinity;

            for (const c of this.containers) {
                if (c.dead) continue;
                if (c.result === val) {
                    const currentY = c.el.offsetTop + c.y;
                    if (currentY > bestY) {
                        bestY = currentY;
                        match = c;
                    }
                }
            }

            if (match) {
                this._explode(match);
            }

            // Resetear inactividad de App si existe
            if (typeof App !== 'undefined') {
                App.resetInactivityTimer();
            }
        }
    },

    // === Efectos ===

    _explode(container) {
        container.dead = true;
        const responseTime = performance.now() - container.spawnTime;

        // Registrar acierto
        this.correctCount++;
        if (typeof App !== 'undefined') {
            App.correctCount = this.correctCount;
            App.updateStats();
        }
        if (typeof DataManager !== 'undefined') {
            DataManager.recordAttempt(container.row, container.col, container.result, true, Math.round(responseTime), 'FREE');
        }
        if (typeof AudioManager !== 'undefined') {
            AudioManager.playCorrect();
        }

        // Animacion de explosion
        container.el.classList.add('exploding');
        setTimeout(() => {
            if (container.el.parentNode) {
                container.el.parentNode.removeChild(container.el);
            }
        }, 300);
    },

    _drown(container) {
        container.dead = true;
        const responseTime = performance.now() - container.spawnTime;

        // Registrar error
        this.wrongCount++;
        if (typeof App !== 'undefined') {
            App.wrongCount = this.wrongCount;
            App.updateStats();
        }
        if (typeof DataManager !== 'undefined') {
            DataManager.recordAttempt(container.row, container.col, 0, false, Math.round(responseTime), 'FREE');
        }
        if (typeof AudioManager !== 'undefined') {
            AudioManager.playWrong();
        }

        // Animacion de hundimiento
        container.el.classList.add('drowning');
        setTimeout(() => {
            if (container.el.parentNode) {
                container.el.parentNode.removeChild(container.el);
            }
        }, 400);
    }
};

window.RiverMode = RiverMode;
