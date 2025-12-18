# Documento Maestro de Ingeniería: Integración AI (Firebase AI Logic)

| Campo         | Valor                                      |
|---------------|--------------------------------------------|
| **Versión**   | 1.9 (Integración Oficial SDK AI Logic)     |
| **Fecha**     | 18 de Diciembre, 2025                      |
| **Proyecto**  | Baldora                                    |
| **Módulo**    | AI Coach / Análisis Cognitivo              |
| **Dependencias** | Firebase SDK v11.0+, Firebase AI Logic  |
| **Estado**    | ✅ Implementación Completada               |

---

## 1. Visión General y Requisitos

Este módulo utiliza **Firebase AI Logic** para conectar la aplicación web con la **Gemini Developer API**. Según la documentación técnica oficial:

- Se permite el acceso a modelos como **Gemini 1.5 Flash** de forma segura.
- Se utiliza una arquitectura híbrida donde Firebase gestiona la autenticación y el ruteo hacia la IA.

---

## 2. Directriz de Seguridad Crítica (Paso 2 PDF)

> ⚠️ **REGLA DE ORO:** *"No agregues la clave de API de Gemini directamente a la base de código de tu app"*.

Al usar Firebase AI Logic, la seguridad se maneja mediante:

1. El aprovisionamiento de la clave en la consola de Firebase (**Secret Manager**).
2. El uso opcional de **Firebase App Check** para mitigar el tráfico abusivo y asegurar que solo tu dominio (`baldorajuego.web.app`) acceda al modelo.

---

## 3. Configuración del Backend

Para que los fragmentos de código del Paso 5 funcionen, se debe haber completado en la consola:

1. **Pestaña AI Logic:** Clic en "Comenzar".
2. **Proveedor:** Seleccionar "Gemini API" (para usar el plan Spark sin costo obligatorio inicial).
3. **APIs:** La consola habilitará automáticamente **Generative Language API**.

---

## 4. Ingeniería del Prompt (Contexto Pedagógico)

El prompt debe inyectar los datos en un formato que el modelo entienda como una secuencia de eventos de aprendizaje:

```text
Actúa como un experto en neuroeducación.
Contexto: Usuario entrenando tablas de multiplicar.
Datos: [HISTORIAL_SESION]

Instrucciones:
- Responde en 3 párrafos cortos (Máximo 150 palabras total).
- Párrafo 1: Refuerzo positivo del progreso.
- Párrafo 2: Identificación de "puntos de fricción" (ej. tabla del 7).
- Párrafo 3: Prescripción de ejercicios de ESCRITURA MANUAL.
```

---

## 5. Implementación Técnica (SDK Modular Web)

Siguiendo el **Paso 3 y 4** del documento técnico, esta es la implementación optimizada para el entorno de Baldora.

### 5.1. Servicio de IA (`GeminiService.js`)

```javascript
// Importaciones modulares oficiales (CDN para Antigravity)
import { initializeApp } from "https://www.gstatic.com/firebasejs/11.0.0/firebase-app.js";
import { getAI, getGenerativeModel, GoogleAIBackend } from "https://www.gstatic.com/firebasejs/11.0.0/firebase-ai.js";

const GeminiService = {
    model: null,

    // Inicializa el servicio usando el objeto config de Firebase
    init(firebaseConfig) {
        const app = initializeApp(firebaseConfig);
        
        // Inicializa el backend de Gemini API para desarrolladores
        const ai = getAI(app, { 
            backend: new GoogleAIBackend() 
        });

        // Crea la instancia del modelo (Gemini 1.5 Flash recomendado por velocidad/costo)
        this.model = getGenerativeModel(ai, { 
            model: "gemini-1.5-flash" 
        });
    },

    async triggerAnalysis(sessionData) {
        this.setUIState('loading');
        
        const prompt = this.buildPrompt(sessionData);

        try {
            // Llamada oficial al SDK: generateContent
            const result = await this.model.generateContent(prompt);
            const response = await result.response;
            const text = response.text();

            this.showResult(text);
        } catch (error) {
            console.error('Análisis de depuración - Error SDK AI Logic:', error);
            this.handleError(error);
        }
    },

    setUIState(state) {
        const divs = ['idle', 'loading', 'success'];
        divs.forEach(s => {
            const el = document.getElementById(`ai-state-${s}`);
            if (el) el.style.display = (s === state) ? 'block' : 'none';
        });
    },

    showResult(text) {
        const output = document.getElementById('ai-response-text');
        if (output) output.innerText = text;
        
        this.setUIState('success');

        // Revelación de gráficas (Regla de negocio Baldora)
        const charts = document.getElementById('dashboard-charts-area');
        if (charts) {
            charts.classList.remove('charts-hidden');
            charts.classList.add('charts-visible');
        }
    },

    buildPrompt(data) {
        const historyStr = data.map(h => `${h.fA}x${h.fB}:${h.ok?'Si':'No'}`).join(', ');
        return `Neuro-coach: Analiza ${historyStr}. 3 párrafos. Enfócate en escritura manual. No emojis.`;
    }
};

export default GeminiService;
```

---

## 6. Análisis de Depuración (Preventivo)

| Problema                    | Descripción                                                                                                              |
|-----------------------------|--------------------------------------------------------------------------------------------------------------------------|
| **Versiones Incompatibles** | Si usas `firebase-app.js` v11, no intentes usar `firebase-ai.js` v10. El SDK de AI Logic es nuevo y requiere versiones recientes. |
| **Carga de Módulos**        | Asegúrate de que tu archivo HTML cargue el script como `type="module"`.                                                  |
| **App Check**               | Si habilitas App Check, el SDK fallará en localhost a menos que configures un **token de depuración** (Debug Token).    |

---

## 7. Checklist de Implementación Final

- [x] Eliminar claves de API de Google AI Studio del código fuente.
- [x] Confirmar que el plan de Firebase es compatible con la API (Spark es suficiente para Gemini Developer API).
- [x] Implementar `GeminiService.init()` en el punto de entrada de la aplicación.
- [x] Validar la transición de estados visuales en el Dashboard tras el análisis.

---

## 8. Archivos Modificados

| Archivo | Cambio |
|---------|--------|
| `index.html` | Actualizado Firebase SDK a v11.0.0, agregado firebase-ai-compat.js, gráficas inician ocultas |
| `js/gemini-service.js` | Reescrito para usar Firebase AI Logic SDK con fallback a API REST |
| `js/api-config.js` | Documentación de seguridad, solo para desarrollo local |
| `js/app.js` | Agregada inicialización de GeminiService en `App.init()` |