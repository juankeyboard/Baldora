/**
 * GEMINI SERVICE - Integración con Firebase AI Logic
 * Baldora - AI Coach / Análisis Cognitivo
 * Versión: 1.9 (Integración Oficial SDK AI Logic)
 * 
 * Implementación según Main_doc_f8_AI.md
 * Usa Firebase AI Logic para acceso seguro a Gemini Developer API
 */

const GeminiService = {
    // Modelo de IA (se inicializa con Firebase AI Logic)
    model: null,

    // Estado actual del servicio
    currentState: 'idle', // idle, loading, success, error

    /**
     * Inicializa el servicio usando Firebase AI Logic
     * @param {Object} firebaseApp - Instancia de Firebase App ya inicializada
     */
    async init(firebaseApp) {
        try {
            // Verificar si el SDK de Firebase AI está disponible
            if (typeof firebase !== 'undefined' && firebase.ai) {
                // Usar Firebase AI Logic SDK
                const ai = firebase.ai(firebaseApp);
                this.model = ai.getGenerativeModel({ model: "gemini-1.5-flash" });
                console.log('[GeminiService] Inicializado con Firebase AI Logic SDK');
            } else {
                // Fallback: Usar API REST directa (para desarrollo local)
                console.log('[GeminiService] Firebase AI no disponible, usando API REST');
                this.model = null;
            }
        } catch (error) {
            console.warn('[GeminiService] Error al inicializar:', error);
            this.model = null;
        }
    },

    /**
     * Método principal llamado por el botón "Analizar"
     */
    async triggerAnalysis() {
        // 1. Cambiar a estado LOADING
        this.setUIState('loading');

        // Obtener datos de la sesión
        const history = DataManager.sessionData || [];
        const stats = DataManager.getSessionStats();

        // Formatear datos para el prompt
        const promptData = this.formatDataForPrompt(history, stats);

        // Construir el prompt completo
        const promptText = this.buildPrompt(promptData);

        try {
            let aiText;

            if (this.model && typeof this.model.generateContent === 'function') {
                // Usar Firebase AI Logic SDK
                const result = await this.model.generateContent(promptText);
                const response = await result.response;
                aiText = response.text();
            } else {
                // Fallback: API REST directa
                aiText = await this.callRestAPI(promptText);
            }

            // 2. Éxito: Mostrar texto y REVELAR GRÁFICAS
            this.showResult(aiText);

            // Guardar para el PDF
            window.lastAIAnalysis = aiText;

        } catch (error) {
            console.error('Error Gemini:', error);
            // 3. Error: Mostrar mensaje de error y permitir reintentar
            this.handleError(error);
        }
    },

    /**
     * Fallback: Llamar a la API REST directamente
     * NOTA: Solo para desarrollo local. En producción usar Firebase AI Logic.
     */
    async callRestAPI(promptText) {
        const apiKey = (window.API_CONFIG && window.API_CONFIG.GEMINI_API_KEY) || null;
        const apiUrl = (window.API_CONFIG && window.API_CONFIG.GEMINI_API_URL) ||
            'https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash:generateContent';

        if (!apiKey) {
            throw new Error('API Key no configurada. Ver js/api-config.js');
        }

        const response = await fetch(`${apiUrl}?key=${apiKey}`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
                contents: [{ parts: [{ text: promptText }] }],
                generationConfig: {
                    temperature: 0.7,
                    maxOutputTokens: 300
                }
            })
        });

        if (!response.ok) {
            const errorBody = await response.text();
            console.error('Análisis de depuración - Error HTTP:', response.status, errorBody);
            throw new Error(`HTTP Error: ${response.status}`);
        }

        const data = await response.json();

        if (!data.candidates || data.candidates.length === 0) {
            throw new Error("No se recibió respuesta del modelo");
        }

        return data.candidates[0].content.parts[0].text;
    },

    /**
     * Construye el prompt completo con contexto pedagógico
     */
    buildPrompt(promptData) {
        return `Actúa como un experto en neuroeducación.
Contexto: Usuario entrenando tablas de multiplicar.
Datos: ${promptData}

Instrucciones:
- Responde en 3 párrafos cortos (Máximo 150 palabras total).
- Párrafo 1: Refuerzo positivo del progreso.
- Párrafo 2: Identificación de "puntos de fricción" (ej. tabla del 7).
- Párrafo 3: Prescripción de ejercicios de ESCRITURA MANUAL.

Reglas de Tono y Formato:
1. TONO: Debe ser SIEMPRE positivo, pedagógico y motivador. Nunca uses lenguaje negativo o crítico. Si hay errores, enfócalos como oportunidades de mejora.
2. NO uses emoticones ni emojis.
3. Responde en español.`;
    },

    /**
     * Manejo de Estados Visuales (UI)
     */
    setUIState(state) {
        this.currentState = state;

        const idleDiv = document.getElementById('ai-state-idle');
        const loadingDiv = document.getElementById('ai-state-loading');
        const successDiv = document.getElementById('ai-state-success');

        // Si los elementos no existen, salir
        if (!idleDiv || !loadingDiv || !successDiv) {
            console.warn('Elementos de UI de AI no encontrados');
            return;
        }

        // Ocultar todo primero
        idleDiv.style.display = 'none';
        loadingDiv.style.display = 'none';
        successDiv.style.display = 'none';

        switch (state) {
            case 'idle':
                idleDiv.style.display = 'block';
                break;
            case 'loading':
                loadingDiv.style.display = 'flex';
                break;
            case 'success':
                successDiv.style.display = 'block';
                break;
        }
    },

    /**
     * Muestra el resultado del análisis
     */
    showResult(text) {
        // Mostrar Texto en la burbuja
        const textContainer = document.getElementById('ai-response-text');
        if (textContainer) {
            textContainer.innerText = text;
        }
        this.setUIState('success');
    },

    /**
     * Maneja errores de la API - muestra mensaje de error con opción de reintentar
     */
    handleError(error) {
        const errorMessage = error.message || 'Error desconocido';
        console.error('Análisis de depuración - Error SDK AI Logic:', errorMessage);

        // Mostrar mensaje de error con opción de reintentar
        const textContainer = document.getElementById('ai-response-text');
        if (textContainer) {
            textContainer.innerHTML = `
                <p style="color: #c0392b; margin-bottom: 10px; font-weight: 500;">
                    No se pudo conectar con el entrenador virtual.
                </p>
                <p style="font-size: 0.85rem; color: var(--clr-rock-500); margin-bottom: 15px;">
                    ${errorMessage}
                </p>
                <button onclick="GeminiService.triggerAnalysis()" class="btn-secondary" style="font-size: 0.9rem;">
                    Reintentar
                </button>
            `;
        }
        this.setUIState('success');
    },

    /**
     * Resetea el estado para una nueva partida
     */
    reset() {
        this.setUIState('idle');

        // Limpiar texto de respuesta
        const textContainer = document.getElementById('ai-response-text');
        if (textContainer) {
            textContainer.innerText = '';
        }

        // Limpiar análisis guardado
        window.lastAIAnalysis = null;
    },

    /**
     * Formatea los datos de sesión para el prompt
     */
    formatDataForPrompt(history, stats) {
        if (!history || history.length === 0) {
            return 'Sin datos de sesión.';
        }

        // Formato compacto para el prompt según documentación
        const historyStr = history.map(h =>
            `${h.factor_a}x${h.factor_b}:${h.is_correct ? 'Si' : 'No'}`
        ).join(', ');

        // Estadísticas adicionales
        let prompt = `Historial: ${historyStr}\n`;
        prompt += `ESTADÍSTICAS: Total=${stats.total}, Correctas=${stats.correct}, `;
        prompt += `Precisión=${stats.accuracy}%, TiempoPromedio=${stats.avgTime}ms\n`;

        // Errores específicos
        const errors = history.filter(h => h.is_correct === 0);
        if (errors.length > 0) {
            prompt += `ERRORES: `;
            prompt += errors.map(e => {
                const correctAnswer = e.factor_a * e.factor_b;
                return `${e.factor_a}x${e.factor_b}=${correctAnswer}(respondió:${e.user_input})`;
            }).join(', ');
        }

        return prompt;
    }
};

// Exponer globalmente
window.GeminiService = GeminiService;
