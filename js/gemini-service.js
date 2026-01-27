/**
 * GEMINI SERVICE - Integración con Firebase AI Logic (Prompt Templates)
 * Baldora - AI Coach / Análisis Cognitivo
 * Versión: 12.0 (Con App Check habilitado)
 */

import { initializeApp } from "firebase/app";
import { initializeAppCheck, ReCaptchaV3Provider } from "firebase/app-check";
import { getAI, getTemplateGenerativeModel, GoogleAIBackend } from "firebase/ai";

// Configuración de Firebase (obtenida de window.firebaseConfig definida en index.html)
const firebaseConfig = window.firebaseConfig;

if (!firebaseConfig) {
    console.error("[GeminiService] Firebase Config no encontrada. Verifique index.html");
}

// Initialize FirebaseApp
let firebaseApp;
try {
    firebaseApp = initializeApp(firebaseConfig, "GeminiModularApp");
} catch (e) {
    // Si ya existe, usar esa instancia
    firebaseApp = initializeApp(firebaseConfig);
}

// Inicializar App Check con reCAPTCHA v3
// IMPORTANTE: Reemplaza 'TU_SITE_KEY_AQUI' con tu Site Key de reCAPTCHA v3 de Firebase Console
const RECAPTCHA_SITE_KEY = '6LdHG1gsAAAAAHfo4psSdnoXJobJZL0byWyj0eSV';

// En desarrollo local, habilitar modo debug
if (location.hostname === 'localhost' || location.hostname === '127.0.0.1') {
    self.FIREBASE_APPCHECK_DEBUG_TOKEN = true;
}

const appCheck = initializeAppCheck(firebaseApp, {
    provider: new ReCaptchaV3Provider(RECAPTCHA_SITE_KEY),
    isTokenAutoRefreshEnabled: true
});

console.log("[GeminiService] App Check inicializado correctamente.");

// Initialize the Gemini Developer API backend service
const ai = getAI(firebaseApp, { backend: new GoogleAIBackend() });

// Create a TemplateGenerativeModel using the "baldora" template ID from Firebase Console
const model = getTemplateGenerativeModel(ai, { templateId: "baldora" });

console.log("[GeminiService] Plantilla 'baldora' inicializada correctamente.");

const GeminiService = {
    currentState: 'idle',

    async triggerAnalysis() {
        console.log('[GeminiService] Trigger analysis solicitado.');

        // Confirmación visual inmediata en el botón
        const btn = document.querySelector('.ai-action-btn');
        if (btn) {
            btn.innerText = 'Procesando...';
            btn.disabled = true;
            btn.style.opacity = '0.7';
            btn.style.cursor = 'wait';
        }

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

        try {
            console.log('[GeminiService] Enviando datos a la plantilla Baldora...');

            // Llamar a generateContent pasando las variables del template
            const result = await model.generateContent({
                csv_data: csvContent
            });

            const response = result.response;
            const text = response.text();

            console.log('[GeminiService] Respuesta recibida.');
            this.showResult(text);
            window.lastAIAnalysis = text;

        } catch (error) {
            console.error('[GeminiService] Error:', error);
            this.handleError(error);
        }
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

        // Restaurar botón
        const btn = document.querySelector('.ai-action-btn');
        if (btn) {
            btn.innerText = 'Analizar mis Resultados';
            btn.disabled = false;
            btn.style.opacity = '1';
            btn.style.cursor = 'pointer';
        }
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

        // Restaurar botón
        const btn = document.querySelector('.ai-action-btn');
        if (btn) {
            btn.innerText = 'Analizar mis Resultados';
            btn.disabled = false;
            btn.style.opacity = '1';
            btn.style.cursor = 'pointer';
        }
    },

    reset() {
        this.setUIState('idle');
        const textContainer = document.getElementById('ai-response-text');
        if (textContainer) textContainer.innerText = '';
        window.lastAIAnalysis = null;
    }
};

// EXPOSICIÓN GLOBAL
window.GeminiService = GeminiService;

console.log('[GeminiService] Script cargado. Usando plantilla "baldora" con App Check habilitado.');
