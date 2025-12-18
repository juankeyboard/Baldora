/**
 * GEMINI SERVICE - Integración con Firebase AI Logic (Modular - Gemini Developer API)
 * Baldora - AI Coach / Análisis Cognitivo
 * Versión: 6.0 (Modular ES6 - Strict Documentation Compliance)
 */

import { initializeApp } from "https://www.gstatic.com/firebasejs/11.0.0/firebase-app.js";
import { getAI, getGenerativeModel, GoogleAIBackend } from "https://www.gstatic.com/firebasejs/11.0.0/firebase-ai.js";

// Configuración de Firebase
const firebaseConfig = {
    apiKey: "AIzaSyDe9UK69r-s0ZiFIb2fNtS_AOouv2bWBhE",
    authDomain: "baldora-89866.firebaseapp.com",
    databaseURL: "https://baldora-89866-default-rtdb.firebaseio.com",
    projectId: "baldora-89866",
    storageBucket: "baldora-89866.firebasestorage.app",
    messagingSenderId: "801097863804",
    appId: "1:801097863804:web:6526f17db5b8443d27eff9",
    measurementId: "G-RHWK9J2Z3S"
};

// 1. Initialize FirebaseApp
// Usamos un nombre único para evitar conflictos con la app global si existe
let app;
try {
    app = initializeApp(firebaseConfig, "GeminiModularApp");
} catch (e) {
    // Si falla (ej. nombre duplicado), intentamos inicializar sin nombre o reusar
    app = initializeApp(firebaseConfig);
}

// 2. Initialize the Gemini Developer API backend service
const ai = getAI(app, { backend: new GoogleAIBackend() });

// 3. Create a `GenerativeModel` instance
// Usamos gemini-1.5-flash como modelo principal
const model = getGenerativeModel(ai, { model: "gemini-1.5-flash" });

const GeminiService = {
    currentState: 'idle',

    async triggerAnalysis() {
        console.log('[GeminiService Modular] Trigger analysis solicitado.');
        this.setUIState('loading');

        // Obtener historial (DataManager es global)
        const history = window.DataManager ? window.DataManager.sessionData : [];

        if (!history || history.length === 0) {
            this.handleError(new Error("No hay datos de sesión para analizar."));
            return;
        }

        // Generar CSV
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
            console.log('[GeminiService Modular] Enviando prompt a Gemini...');
            const result = await model.generateContent(promptText);
            const response = await result.response;
            const aiText = response.text();

            console.log('[GeminiService Modular] Respuesta recibida.');
            this.showResult(aiText);
            window.lastAIAnalysis = aiText;

        } catch (error) {
            console.error('[GeminiService Modular] Error:', error);
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

// EXPOSICIÓN GLOBAL CRÍTICA
// Al ser un módulo, GeminiService es local. Debemos asignarlo a window explícitamente
// para que el onclick="GeminiService.triggerAnalysis()" del HTML funcione.
window.GeminiService = GeminiService;
console.log('[GeminiService Modular] Servicio registrado globalmente.');
