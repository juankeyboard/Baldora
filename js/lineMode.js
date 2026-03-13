/**
 * LINEMODE.JS - Modo Arcade "Line Mode" (f19 v2.0)
 * Baldora
 *
 * Motor de caida dinamica para el modo FREE.
 * Contenedores flotantes descienden hacia la linea limite;
 * el jugador escribe respuestas en un input global.
 */

const LineMode = {
    // === Estado ===
    containers: [],       // Contenedores activos en pantalla
    inputEl: null,        // Input global
    arenaEl: null,        // Contenedor principal del arena
    layerEl: null,        // Capa donde se renderizan los contenedores
    silhouetteEl: null,   // Silueta del line mode
    animFrame: null,      // requestAnimationFrame handle
    spawnTimer: null,      // setInterval handle para spawn
    correctCount: 0,
    wrongCount: 0,
    lastFrameTime: 0,     // Timestamp del ultimo frame
    _running: false,

    // Configuracion
    baseSpeed: 100,        // px/s: velocidad configurada por el usuario
    _difficulty: 0.3,      // 0.0–1.0: controla cuántas ops simultáneas
    _lastSpawnTime: 0,     // timestamp del último spawn (usado en game loop)

    // Tablas seleccionadas (copia local)
    _rows: [],
    _cols: [],

    // Pool de operaciones para no repetir demasiado
    _opPool: [],

    /**
     * Inicia el line mode
     * @param {number[]} rows - Filas seleccionadas
     * @param {number[]} cols - Columnas seleccionadas
     */
    start(rows, cols, speed = 100, difficulty = 0.3) {
        this._rows = rows.slice();
        this._cols = cols.slice();
        this.baseSpeed = speed;
        this._difficulty = Math.max(0, Math.min(1, difficulty));
        this._rebuildPool();

        this.correctCount = 0;
        this.wrongCount = 0;
        this.containers = [];
        this._running = true;

        // Cachear elementos DOM
        this.arenaEl = document.getElementById('line-arena');
        this.layerEl = document.getElementById('line-containers-layer');
        this.groundEl = document.getElementById('line-limit');
        this.inputEl = document.getElementById('line-input');

        // Limpiar capa
        this.layerEl.innerHTML = '';

        // Ocultar panel de matriz y controles clasicos, mostrar arena
        const matrixPanel = document.querySelector('.matrix-panel');
        const controlsPanel = document.querySelector('.controls-panel');
        if (matrixPanel) matrixPanel.style.display = 'none';
        if (controlsPanel) controlsPanel.style.display = 'none';
        document.getElementById('game-view')?.classList.add('line-active');
        this.arenaEl.style.display = 'flex';

        // Bind input: auto-submit al escribir, sin necesidad de Enter
        this._onInput = this._handleInput.bind(this);
        this.inputEl.addEventListener('input', this._onInput);

        // Enter limpia el campo
        this._onKeyDown = (e) => {
            if (e.key === 'Enter') {
                e.preventDefault();
                this.inputEl.value = '';
            }
        };
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

        // Spawn inicial inmediato
        this._lastSpawnTime = 0;
        this._spawnContainer();

        // Iniciar game loop
        this.lastFrameTime = performance.now();
        this._gameLoop();
    },

    /**
     * Detiene todo el line mode y restaura la UI
     */
    stop() {
        this._running = false;

        // Cancelar animacion
        if (this.animFrame) {
            cancelAnimationFrame(this.animFrame);
            this.animFrame = null;
        }

        // (spawner integrado en game loop, no hay timer separado)

        // Limpiar listeners
        if (this.inputEl) {
            this.inputEl.removeEventListener('input', this._onInput);
            this.inputEl.removeEventListener('keydown', this._onKeyDown);
            this.inputEl.removeEventListener('blur', this._onBlur);
        }

        // Limpiar contenedores del DOM
        if (this.layerEl) {
            this.layerEl.innerHTML = '';
        }
        this.containers = [];

        // Restaurar UI clasica
        document.getElementById('game-view')?.classList.remove('line-active');
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
        // 30% de probabilidad de caer a 1.8x la velocidad base
        const speed = Math.random() < 0.3 ? this.baseSpeed * 1.8 : this.baseSpeed;

        // Crear elemento DOM
        const el = document.createElement('div');
        el.className = 'line-container';
        el.innerHTML = `<span class="line-op">${op.row} &times; ${op.col} =</span>`;

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

    // Calcula cuántas operaciones simultáneas y el intervalo de spawn
    _spawnParams() {
        const maxOps = Math.round(1 + this._difficulty * 4); // 1 a 5
        const arenaH = this.layerEl ? this.layerEl.offsetHeight : 500;
        const fallTime = arenaH / this.baseSpeed; // segundos hasta el suelo

        // difficulty 0: solo cuando no hay contenedores vivos
        // difficulty >0: intervalo = fallTime / maxOps * 1000 ms
        const interval = this._difficulty === 0 ? Infinity : (fallTime / maxOps) * 1000;
        return { maxOps, interval };
    },

    _gameLoop() {
        if (!this._running) return;

        const now = performance.now();
        const dt = (now - this.lastFrameTime) / 1000;
        this.lastFrameTime = now;

        // Mover contenedores
        for (const c of this.containers) {
            if (c.dead) continue;
            c.y += c.speed * dt;
            c.el.style.transform = `translateY(${c.y}px)`;
        }

        // Verificar colisiones con la linea limite
        this._checkCollisions();

        // Limpiar contenedores muertos
        this.containers = this.containers.filter(c => !c.dead);

        // Spawn basado en dificultad
        const { maxOps, interval } = this._spawnParams();
        const alive = this.containers.filter(c => !c.dead).length;
        const shouldSpawn = this._difficulty === 0
            ? alive === 0                          // fácil: solo cuando no hay ninguna
            : (now - this._lastSpawnTime) >= interval && alive < maxOps;

        if (shouldSpawn) {
            this._spawnContainer();
            this._lastSpawnTime = now;
        }

        this.animFrame = requestAnimationFrame(() => this._gameLoop());
    },

    _checkCollisions() {
        if (!this.groundEl) return;

        const groundTop = this.groundEl.offsetTop;

        for (const c of this.containers) {
            if (c.dead) continue;

            const elTop = c.el.offsetTop + c.y;
            const elBottom = elTop + c.el.offsetHeight;

            if (elBottom >= groundTop) {
                this._erase(c);
            }
        }
    },

    // === Input ===

    _handleInput() {
        const val = parseInt(this.inputEl.value);
        if (isNaN(val)) return;

        // Resetear inactividad de App si existe
        if (typeof App !== 'undefined') App.resetInactivityTimer();

        // Buscar contenedor cuyo resultado coincida (el más cercano a la linea limite primero)
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
            this.inputEl.value = '';
            this._explode(match);
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

    _erase(container) {
        container.dead = true;
        container.el.style.transition = 'opacity 0.2s ease-out';
        container.el.style.opacity = '0';
        setTimeout(() => {
            if (container.el.parentNode) {
                container.el.parentNode.removeChild(container.el);
            }
        }, 200);
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

window.LineMode = LineMode;
