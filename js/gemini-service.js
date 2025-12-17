/**
 * GEMINI SERVICE - Integración con Gemini 1.5 Flash
 * Baldora - AI Coach / Análisis Cognitivo
 * Versión: 1.1
 * 
 * NOTA: La API Key debe configurarse en js/api-config.js (archivo gitignored)
 * Para producción en Firebase, usar Cloud Functions
 */

const GeminiService = {
    // API Configuration - Se carga desde api-config.js (no incluido en Git)
    get apiKey() {
        return (window.API_CONFIG && window.API_CONFIG.GEMINI_API_KEY) || null;
    },
    get apiUrl() {
        return (window.API_CONFIG && window.API_CONFIG.GEMINI_API_URL) ||
            'https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash:generateContent';
    },

    // Estado actual del servicio
    currentState: 'idle', // idle, loading, success, error

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
        const promptText = `
Actúa como un experto en neuroeducación y memoria.
Analiza los siguientes datos de una sesión de entrenamiento de tablas de multiplicar:

${promptData}

Instrucciones de Respuesta (Estrictas):
1. La respuesta debe tener EXACTAMENTE 3 párrafos cortos.
   - Párrafo 1: Resumen general del rendimiento (máximo 2 oraciones).
   - Párrafo 2: Análisis específico de las fallas (si las hay).
   - Párrafo 3: Recomendaciones concretas de mejora, incluyendo obligatoriamente ejercicios de escritura a mano alzada para reforzar la memoria.

Reglas de Tono y Formato:
1. TONO: Debe ser SIEMPRE positivo, pedagógico y motivador. Nunca uses lenguaje negativo o crítico. Si hay errores, enfócalos como oportunidades de mejora.
2. NO uses emoticones ni emojis.
3. Responde en español.
4. Limita la respuesta total a máximo 150 palabras.
`;

        try {
            const response = await fetch(`${this.apiUrl}?key=${this.apiKey}`, {
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
                throw new Error(`HTTP Error: ${response.status}`);
            }

            const data = await response.json();

            if (!data.candidates || data.candidates.length === 0) {
                throw new Error("No se recibió respuesta del modelo");
            }

            const aiText = data.candidates[0].content.parts[0].text;

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
        console.error('Error Gemini API:', errorMessage);

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
                    🔄 Reintentar
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

        // Estadísticas generales
        let prompt = `ESTADÍSTICAS GENERALES:\n`;
        prompt += `- Total de operaciones: ${stats.total}\n`;
        prompt += `- Respuestas correctas: ${stats.correct}\n`;
        prompt += `- Respuestas incorrectas: ${stats.total - stats.correct}\n`;
        prompt += `- Precisión: ${stats.accuracy}%\n`;
        prompt += `- Tiempo promedio de respuesta: ${stats.avgTime}ms\n\n`;

        // Errores específicos
        const errors = history.filter(h => h.is_correct === 0);
        if (errors.length > 0) {
            prompt += `OPERACIONES CON ERRORES:\n`;
            errors.forEach(e => {
                const correctAnswer = e.factor_a * e.factor_b;
                prompt += `- ${e.factor_a} × ${e.factor_b} = ${correctAnswer} (el jugador respondió: ${e.user_input})\n`;
            });
        } else {
            prompt += `OPERACIONES CON ERRORES: Ninguna - ¡Sesión perfecta!\n`;
        }

        // Operaciones más lentas
        const sortedByTime = [...history].sort((a, b) => b.response_time - a.response_time);
        const slowest = sortedByTime.slice(0, 3);

        prompt += `\nOPERACIONES MÁS LENTAS:\n`;
        slowest.forEach(s => {
            prompt += `- ${s.factor_a} × ${s.factor_b}: ${s.response_time}ms\n`;
        });

        return prompt;
    }
};

// Exponer globalmente
window.GeminiService = GeminiService;
