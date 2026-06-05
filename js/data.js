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
     * OPTIMIZATION: Usar single-pass loop en lugar de chains (filter/map/reduce)
     * para evitar allocations intermedios y acelerar grandes arrays de data
     */
    getSessionStats() {
        const total = this.sessionData.length;
        let correct = 0;
        let timeSum = 0;

        for (let i = 0; i < total; i++) {
            const attempt = this.sessionData[i];
            if (attempt.is_correct === 1) correct++;
            timeSum += attempt.response_time;
        }

        const wrong = total - correct;
        const avgTime = total > 0 ? Math.round(timeSum / total) : 0;
        const accuracy = total > 0 ? Math.round((correct / total) * 100) : 0;

        return { total, correct, wrong, avgTime, accuracy };
    },

    /**
     * Obtiene errores agrupados por tabla (factor_a o factor_b)
     * OPTIMIZATION: Loop unico sobre history en lugar de .filter().forEach()
     */
    getErrorsByTable() {
        const errors = {};

        // Inicializar todas las tablas del 1 al 15
        for (let i = 1; i <= 15; i++) {
            errors[i] = 0;
        }

        // Contar errores
        const len = this.history.length;
        for (let i = 0; i < len; i++) {
            const a = this.history[i];
            if (a.is_correct === 0) {
                errors[a.factor_a] = (errors[a.factor_a] || 0) + 1;
                errors[a.factor_b] = (errors[a.factor_b] || 0) + 1;
            }
        }

        return errors;
    },

    /**
     * Obtiene las operaciones con más errores
     * OPTIMIZATION: Loop unico sobre history en lugar de .filter().forEach()
     */
    getTopErrors(limit = 5) {
        const errorCounts = {};
        const len = this.history.length;

        for (let i = 0; i < len; i++) {
            const a = this.history[i];
            if (a.is_correct === 0) {
                const key = `${a.factor_a}×${a.factor_b}`;
                errorCounts[key] = (errorCounts[key] || 0) + 1;
            }
        }

        return Object.entries(errorCounts)
            .map(([op, count]) => ({ operation: op, count }))
            .sort((a, b) => b.count - a.count)
            .slice(0, limit);
    },

    /**
     * Obtiene distribución de tiempos de respuesta para histograma
     * OPTIMIZATION: Usar loop en vez de map, y evitar el spread over map
     * en Math.max que produce "Maximum call stack size exceeded" con large data
     */
    getResponseTimeDistribution() {
        const len = this.history.length;

        if (len === 0) {
            return { labels: [], counts: [] };
        }

        let maxTimeVal = 0;
        for (let i = 0; i < len; i++) {
            const time = this.history[i].response_time;
            if (time > maxTimeVal) maxTimeVal = time;
        }

        // Crear bins de 500ms
        const binSize = 500;
        const maxTime = Math.min(maxTimeVal, 10000); // Cap at 10s

        // Use object keys dynamically exactly as previous logic
        const bins = {};
        for (let i = 0; i <= maxTime; i += binSize) {
            bins[`${i / 1000}-${(i + binSize) / 1000}s`] = 0;
        }

        for (let i = 0; i < len; i++) {
            const cappedTime = Math.min(this.history[i].response_time, maxTime);
            const binIndex = Math.floor(cappedTime / binSize) * binSize;
            const label = `${binIndex / 1000}-${(binIndex + binSize) / 1000}s`;
            bins[label] = (bins[label] || 0) + 1;
        }

        return {
            labels: Object.keys(bins),
            counts: Object.values(bins)
        };
    },

    /**
     * Obtiene distribución de aciertos vs errores
     * OPTIMIZATION: Simple for loop en lugar de dos filtrados separados
     */
    getAccuracyDistribution() {
        let correct = 0;
        let wrong = 0;
        const len = this.history.length;

        for (let i = 0; i < len; i++) {
            if (this.history[i].is_correct === 1) {
                correct++;
            } else {
                wrong++;
            }
        }

        return { correct, wrong };
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
