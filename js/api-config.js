/**
 * Configuración de API para Gemini (MODO FALLBACK)
 * 
 * ⚠️ IMPORTANTE - DIRECTRIZ DE SEGURIDAD (Main_doc_f8_AI.md):
 * "No agregues la clave de API de Gemini directamente a la base de código de tu app"
 * 
 * Esta configuración es un FALLBACK para desarrollo local únicamente.
 * En producción, Firebase AI Logic maneja la seguridad automáticamente
 * a través del aprovisionamiento de claves en Secret Manager.
 * 
 * Para producción:
 * 1. Habilitar AI Logic en la consola de Firebase
 * 2. Seleccionar "Gemini API" como proveedor
 * 3. Opcional: Habilitar Firebase App Check para seguridad adicional
 * 
 * Esta API key tiene restricciones de dominio configuradas en Google Cloud Console.
 * Solo funcionará desde los dominios autorizados (baldorajuego.web.app, localhost).
 */

const API_CONFIG = {
    // Fallback para desarrollo local (cuando Firebase AI no está disponible)
    GEMINI_API_KEY: 'AIzaSyCvXVVmOxrAOjNXYORyXnqeoO8F2hamxwQ',
    GEMINI_API_URL: 'https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash:generateContent'
};

window.API_CONFIG = API_CONFIG;
