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
     * @optimized Usa un solo bucle for en lugar de chains de filter, map y reduce
     */
    getSessionStats() {
        const total = this.sessionData.length;
        let correct = 0;
        let totalResponseTime = 0;

        for (let i = 0; i < total; i++) {
            const attempt = this.sessionData[i];
            if (attempt.is_correct === 1) {
                correct++;
            }
            totalResponseTime += attempt.response_time;
        }

        const wrong = total - correct;
        const avgTime = total > 0 ? Math.round(totalResponseTime / total) : 0;
        const accuracy = total > 0 ? Math.round((correct / total) * 100) : 0;

        return { total, correct, wrong, avgTime, accuracy };
    },

    /**
     * Obtiene errores agrupados por tabla (factor_a o factor_b)
     * @optimized Usa un bucle for sin filter
     */
    getErrorsByTable() {
        const errors = {
            1: 0, 2: 0, 3: 0, 4: 0, 5: 0,
            6: 0, 7: 0, 8: 0, 9: 0, 10: 0,
            11: 0, 12: 0, 13: 0, 14: 0, 15: 0
        };

        const total = this.history.length;
        for (let i = 0; i < total; i++) {
            const attempt = this.history[i];
            if (attempt.is_correct === 0) {
                errors[attempt.factor_a]++;
                errors[attempt.factor_b]++;
            }
        }

        return errors;
    },

    /**
     * Obtiene las operaciones con más errores
     * @optimized Usa un bucle for sin filter
     */
    getTopErrors(limit = 5) {
        const errorCounts = {};
        const total = this.history.length;

        for (let i = 0; i < total; i++) {
            const attempt = this.history[i];
            if (attempt.is_correct === 0) {
                const key = attempt.factor_a + '×' + attempt.factor_b;
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
     * @optimized Usa bucle de una pasada, evita Math.max(...array) y string alloc en bucle
     */
    getResponseTimeDistribution() {
        const total = this.history.length;
        if (total === 0) {
            return { labels: [], counts: [] };
        }

        const binSize = 500;
        const absoluteMax = 10000; // Cap at 10s
        let maxObservedTime = 0;

        // 10000 / 500 = 20 bins + 1 for exact 10000
        const maxBins = Math.floor(absoluteMax / binSize) + 1;
        const binCounts = new Array(maxBins).fill(0);

        for (let i = 0; i < total; i++) {
            let t = this.history[i].response_time;
            if (t > maxObservedTime) {
                maxObservedTime = t;
            }
            if (t > absoluteMax) {
                t = absoluteMax;
            }

            const binIndex = Math.floor(t / binSize);
            binCounts[binIndex]++;
        }

        // Determinar cuántos bins necesitamos realmente
        const maxTime = Math.min(maxObservedTime, absoluteMax);
        const numBins = Math.floor(maxTime / binSize) + 1;

        const labels = new Array(numBins);
        const counts = new Array(numBins);

        for (let i = 0; i < numBins; i++) {
            const startSec = (i * binSize) / 1000;
            const endSec = ((i + 1) * binSize) / 1000;
            labels[i] = startSec + '-' + endSec + 's';
            counts[i] = binCounts[i];
        }

        return {
            labels,
            counts
        };
    },

    /**
     * Obtiene distribución de aciertos vs errores
     * @optimized Usa un bucle for en lugar de dos llamadas a filter
     */
    getAccuracyDistribution() {
        let correct = 0;
        let wrong = 0;
        const total = this.history.length;

        for (let i = 0; i < total; i++) {
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
