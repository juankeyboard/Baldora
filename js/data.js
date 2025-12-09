/**
 * DATA.JS - Manejo de datos CSV y persistencia
 * Fast Math Game
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
     */
    init(nickname) {
        this.nickname = nickname;
        this.sessionData = [];
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
     */
    downloadCSV() {
        const csv = Papa.unparse(this.history, {
            header: true,
            columns: [
                'timestamp', 'nickname', 'game_mode', 
                'factor_a', 'factor_b', 'user_input', 
                'correct_result', 'is_correct', 'response_time'
            ]
        });
        
        // Crear nombre del archivo
        const date = new Date().toISOString().split('T')[0];
        const filename = `FastMath_${this.nickname}_${date}.csv`;
        
        // Crear blob y descargar
        const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' });
        const url = URL.createObjectURL(blob);
        
        const link = document.createElement('a');
        link.href = url;
        link.download = filename;
        link.style.display = 'none';
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
        URL.revokeObjectURL(url);
    },
    
    /**
     * Obtiene estadísticas de la sesión actual
     */
    getSessionStats() {
        const total = this.sessionData.length;
        const correct = this.sessionData.filter(a => a.is_correct === 1).length;
        const wrong = total - correct;
        
        const responseTimes = this.sessionData.map(a => a.response_time);
        const avgTime = total > 0 
            ? Math.round(responseTimes.reduce((a, b) => a + b, 0) / total)
            : 0;
        
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
        const times = this.history.map(a => a.response_time);
        
        if (times.length === 0) {
            return { labels: [], counts: [] };
        }
        
        // Crear bins de 500ms
        const binSize = 500;
        const maxTime = Math.min(Math.max(...times), 10000); // Cap at 10s
        const bins = {};
        
        for (let i = 0; i <= maxTime; i += binSize) {
            bins[`${i/1000}-${(i+binSize)/1000}s`] = 0;
        }
        
        times.forEach(t => {
            const cappedTime = Math.min(t, maxTime);
            const binIndex = Math.floor(cappedTime / binSize) * binSize;
            const label = `${binIndex/1000}-${(binIndex+binSize)/1000}s`;
            bins[label] = (bins[label] || 0) + 1;
        });
        
        return {
            labels: Object.keys(bins),
            counts: Object.values(bins)
        };
    },
    
    /**
     * Obtiene distribución de aciertos vs errores
     */
    getAccuracyDistribution() {
        const correct = this.history.filter(a => a.is_correct === 1).length;
        const wrong = this.history.filter(a => a.is_correct === 0).length;
        
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
