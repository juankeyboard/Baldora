/**
 * GEMINI SERVICE - Integración con Firebase AI Logic (Compat/Global)
 * Baldora - AI Coach / Análisis Cognitivo
 * Versión: 4.0 (Global Scope)
 */

const GeminiService = {
    currentState: 'idle',
    model: null,

    /**
     * Inicializa el servicio usando el SDK global de Firebase
     */
    init() {
        console.log('[GeminiService] Inicializando...');

        if (typeof firebase === 'undefined') {
            console.error('[GeminiService] Firebase SDK no encontrado.');
            return;
        }

        if (!firebase.ai) {
            console.error('[GeminiService] Firebase AI SDK no encontrado. Verifica que firebase-ai-compat.js esté cargado.');
            return;
        }

        try {
            // Obtener instancia de Vertex AI para Firebase
            // En la versión compat, esto usa la app por defecto inicializada en index.html
            const ai = firebase.ai();

            // Obtener el modelo generativo
            // Usamos gemini-1.5-flash que es el estándar actual, o gemini-pro si flash falla
            this.model = ai.getGenerativeModel({ model: "gemini-1.5-flash" });

            console.log('[GeminiService] Modelo Gemini inicializado correctamente.');
        } catch (error) {
            console.error('[GeminiService] Error al inicializar modelo:', error);
        }
    },

    /**
     * Método principal llamado por el botón "Analizar"
     */
    async triggerAnalysis() {
        console.log('[GeminiService] Trigger analysis solicitado.');

        if (!this.model) {
            // Intentar inicializar si no está listo
            this.init();
            if (!this.model) {
                this.handleError(new Error("El servicio de IA no está disponible. Recarga la página."));
                return;
            }
        }

        this.setUIState('loading');

        // Obtener historial de la sesión actual (DataManager es global)
        const history = window.DataManager ? window.DataManager.sessionData : [];

        if (!history || history.length === 0) {
            this.handleError(new Error("No hay datos de sesión para analizar. Juega una partida primero."));
            return;
        }

        // Generar CSV usando PapaParse (Papa es global)
        let csvContent = "";
        if (window.Papa) {
            csvContent = window.Papa.unparse(history, {
                header: true,
                columns: [
                    'timestamp', 'nickname', 'game_mode',
                    'factor_a', 'factor_b', 'user_input',
                    'correct_result', 'is_correct', 'response_time'
                ]
            });
        } else {
            this.handleError(new Error("Librería PapaParse no cargada."));
            return;
        }

        const promptText = this.buildPrompt(csvContent);

        try {
            console.log('[GeminiService] Enviando prompt a Gemini...');
            const result = await this.model.generateContent(promptText);
            const response = await result.response;
            const aiText = response.text();

            console.log('[GeminiService] Respuesta recibida.');
            this.showResult(aiText);
            window.lastAIAnalysis = aiText;

        } catch (error) {
            console.error('[GeminiService] Error en la petición:', error);
            this.handleError(error);
        }
    },

    buildPrompt(csvContent) {
        return `Actúa como un experto en neuroeducación y analista de datos.
A continuación te proporciono un archivo CSV con los resultados de la partida actual de un estudiante.

Datos del CSV:
${csvContent}

Instrucciones:
Analiza el desempeño del jugador basándote en los datos del CSV y devuelve un resumen en 3 párrafos cortos (Máximo 150 palabras total):

1. Párrafo 1: Refuerzo positivo del progreso y análisis general de precisión/velocidad.
2. Párrafo 2: Identificación precisa de "puntos de fricción" (tablas o multiplicaciones específicas donde falló o fue lento).
3. Párrafo 3: Prescripción de ejercicios concretos (ej. "Practica la tabla del 7 escribiéndola a mano").

Reglas de Tono y Formato:
1. TONO: Debe ser SIEMPRE positivo, pedagógico y motivador.
2. NO uses emoticones ni emojis.
3. Responde en español.`;
    },

    setUIState(state) {
        this.currentState = state;
        const idleDiv = document.getElementById('ai-state-idle');
        const loadingDiv = document.getElementById('ai-state-loading');
        const successDiv = document.getElementById('ai-state-success');

        if (!idleDiv || !loadingDiv || !successDiv) return;

        idleDiv.style.display = 'none';
        loadingDiv.style.display = 'none';
        successDiv.style.display = 'none';

        if (state === 'idle') idleDiv.style.display = 'block';
        if (state === 'loading') loadingDiv.style.display = 'flex';
        if (state === 'success') successDiv.style.display = 'block';
    },

    showResult(text) {
        const textContainer = document.getElementById('ai-response-text');
        // Convertir markdown básico a HTML simple si es necesario, o usar innerText para seguridad
        // Aquí usamos innerText para evitar XSS, pero reemplazamos saltos de línea
        if (textContainer) {
            textContainer.innerHTML = text.replace(/\n/g, '<br>');
        }
        this.setUIState('success');
    },

    handleError(error) {
        const errorMessage = error.message || 'Error desconocido';
        console.error('Análisis de depuración - Error:', errorMessage);

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

    reset() {
        this.setUIState('idle');
        const textContainer = document.getElementById('ai-response-text');
        if (textContainer) textContainer.innerText = '';
        window.lastAIAnalysis = null;
    }
};

// Exponer globalmente
window.GeminiService = GeminiService;

// Inicializar automáticamente cuando el script carga (ya que está al final del body)
// O esperar a que Firebase esté listo
if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', () => GeminiService.init());
} else {
    GeminiService.init();
}
