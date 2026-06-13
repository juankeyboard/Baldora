/**
 * DATA.JS - Manejo de datos CSV y persistencia
 * Baldora
 */

const DataManager = {
    // Historial de intentos (sesión actual + cargado)
    history: [],

    // Datos de la sesión actual
    sessionData: [],

    // Nickname del jugador
    nickname: '',

    /**
     * Inicializa el DataManager con un nickname
     * Reinicia todos los datos para una nueva partida
     */
    init(nickname) {
        this.nickname = nickname;
        this.sessionData = [];
        this.history = []; // Reiniciar historial para nueva partida
    },

    /**
     * Registra un intento de operación
     */
    recordAttempt(factorA, factorB, userInput, isCorrect, responseTime, gameMode) {
        const attempt = {
            timestamp: new Date().toISOString(),
            nickname: this.nickname,
            game_mode: gameMode,
            factor_a: factorA,
            factor_b: factorB,
            user_input: userInput,
            correct_result: factorA * factorB,
            is_correct: isCorrect ? 1 : 0,
            response_time: responseTime
        };

        this.sessionData.push(attempt);
        this.history.push(attempt);

        return attempt;
    },

    /**
     * Parsea un archivo CSV y lo carga en el historial
     */
    loadCSV(file) {
        return new Promise((resolve, reject) => {
            Papa.parse(file, {
                header: true,
                skipEmptyLines: true,
                dynamicTyping: true,
                complete: (results) => {
                    if (results.errors.length > 0) {
                        reject(results.errors);
                        return;
                    }

                    // Validar estructura del CSV
                    const requiredFields = [
                        'timestamp', 'nickname', 'game_mode',
                        'factor_a', 'factor_b', 'user_input',
                        'correct_result', 'is_correct', 'response_time'
                    ];

                    const headers = Object.keys(results.data[0] || {});
                    const hasAllFields = requiredFields.every(f => headers.includes(f));

                    if (!hasAllFields) {
                        reject(new Error('El archivo CSV no tiene el formato correcto'));
                        return;
                    }

                    // Cargar datos en el historial
                    this.history = [...results.data];

                    // Extraer nickname del primer registro si existe
                    if (results.data.length > 0 && results.data[0].nickname) {
                        this.nickname = results.data[0].nickname;
                    }

                    resolve({
                        recordsLoaded: results.data.length,
                        nickname: this.nickname
                    });
                },
                error: (error) => {
                    reject(error);
                }
            });
        });
    },

    /**
     * Genera y descarga el archivo CSV con todo el historial
     * Usa File System Access API (moderna y segura) con fallback
     */
    async downloadCSV() {
        const csv = Papa.unparse(this.history, {
            header: true,
            columns: [
                'timestamp', 'nickname', 'game_mode',
                'factor_a', 'factor_b', 'user_input',
                'correct_result', 'is_correct', 'response_time'
            ]
        });

        // Crear nombre del archivo con fecha y hora
        const now = new Date();
        const year = now.getFullYear();
        const month = String(now.getMonth() + 1).padStart(2, '0');
        const day = String(now.getDate()).padStart(2, '0');
        const hours = String(now.getHours()).padStart(2, '0');
        const minutes = String(now.getMinutes()).padStart(2, '0');
        const seconds = String(now.getSeconds()).padStart(2, '0');
        const datetime = `${year}${month}${day}_${hours}${minutes}${seconds}`;
        const filename = `Baldora_${this.nickname}_${datetime}.csv`;

        // Contenido con BOM para UTF-8
        const BOM = '\uFEFF';
        const content = BOM + csv;

        // Intentar usar File System Access API (moderna y segura)
        if ('showSaveFilePicker' in window) {
            try {
                const handle = await window.showSaveFilePicker({
                    suggestedName: filename,
                    types: [{
                        description: 'Archivo CSV',
                        accept: { 'text/csv': ['.csv'] }
                    }]
                });
                const writable = await handle.createWritable();
                await writable.write(content);
                await writable.close();
                return;
            } catch (err) {
                // Usuario canceló o error - continuar con fallback
                if (err.name === 'AbortError') return;
            }
        }

        // Fallback: descargar usando Blob y FileSaver
        const blob = new Blob([content], { type: 'text/csv;charset=utf-8' });
        saveAs(blob, filename);
    },

    /**
     * Obtiene estadísticas de la sesión actual
     */
    getSessionStats() {
        const total = this.sessionData.length;
        let correct = 0;
        let sumTime = 0;

        // ⚡ Bolt: Use a single pass instead of chained filter().map().reduce()
        // to avoid unnecessary array allocations and improve large dataset performance
        for (let i = 0; i < total; i++) {
            if (this.sessionData[i].is_correct === 1) {
                correct++;
            }
            sumTime += this.sessionData[i].response_time;
        }

        const wrong = total - correct;
        const avgTime = total > 0 ? Math.round(sumTime / total) : 0;
        const accuracy = total > 0 ? Math.round((correct / total) * 100) : 0;

        return { total, correct, wrong, avgTime, accuracy };
    },

    /**
     * Obtiene errores agrupados por tabla (factor_a o factor_b)
     */
    getErrorsByTable() {
        const errors = {};

        // Inicializar todas las tablas del 1 al 15
        for (let i = 1; i <= 15; i++) {
            errors[i] = 0;
        }

        // Contar errores
        this.history
            .filter(a => a.is_correct === 0)
            .forEach(a => {
                errors[a.factor_a] = (errors[a.factor_a] || 0) + 1;
                errors[a.factor_b] = (errors[a.factor_b] || 0) + 1;
            });

        return errors;
    },

    /**
     * Obtiene las operaciones con más errores
     */
    getTopErrors(limit = 5) {
        const errorCounts = {};

        this.history
            .filter(a => a.is_correct === 0)
            .forEach(a => {
                const key = `${a.factor_a}×${a.factor_b}`;
                errorCounts[key] = (errorCounts[key] || 0) + 1;
            });

        return Object.entries(errorCounts)
            .map(([op, count]) => ({ operation: op, count }))
            .sort((a, b) => b.count - a.count)
            .slice(0, limit);
    },

    /**
     * Obtiene distribución de tiempos de respuesta para histograma
     */
    getResponseTimeDistribution() {
        const history = this.history;
        const total = history.length;

        if (total === 0) {
            return { labels: [], counts: [] };
        }

        // ⚡ Bolt: Use a single-pass loop with integer binning to avoid memory
        // allocations (map) and "Maximum call stack size exceeded" (Math.max(...))
        const binSize = 500;
        const maxTimeCap = 10000;
        const numBins = (maxTimeCap / binSize) + 1;
        const binCounts = new Array(numBins).fill(0);

        let maxTime = 0;

        for (let i = 0; i < total; i++) {
            const t = history[i].response_time;
            if (t > maxTime) maxTime = t;

            const cappedTime = t > maxTimeCap ? maxTimeCap : t;
            const binIndex = Math.floor(cappedTime / binSize);
            binCounts[binIndex]++;
        }

        const cappedMax = maxTime > maxTimeCap ? maxTimeCap : maxTime;
        const maxBinIndex = Math.floor(cappedMax / binSize);

        const labels = [];
        const counts = [];

        // Generate labels and counts only for valid bins up to the max observed time (or cap)
        for (let i = 0; i <= maxBinIndex; i++) {
            const startStr = (i * binSize) / 1000;
            const endStr = ((i + 1) * binSize) / 1000;
            labels.push(`${startStr}-${endStr}s`);
            counts.push(binCounts[i]);
        }

        return { labels, counts };
    },

    /**
     * Obtiene distribución de aciertos vs errores
     */
    getAccuracyDistribution() {
        let correct = 0;
        const history = this.history;
        const total = history.length;

        // ⚡ Bolt: Use a single pass instead of two .filter() calls to avoid double iteration and allocations
        for (let i = 0; i < total; i++) {
            if (history[i].is_correct === 1) {
                correct++;
            }
        }

        return { correct, wrong: total - correct };
    },

    /**
     * Reinicia los datos de la sesión actual
     */
    resetSession() {
        this.sessionData = [];
    }
};

// Exportar para uso global
window.DataManager = DataManager;
