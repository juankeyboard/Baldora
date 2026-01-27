# Guía de Implementación: Entrenador Virtual con Firebase AI Logic

Este documento detalla la arquitectura y configuración para el "Entrenador Virtual" de Baldora, utilizando **Firebase AI Logic** (Gemini Developer API) para analizar el rendimiento del jugador de forma segura y escalable.

---

## 1. Arquitectura y Seguridad

### ¿Por qué Firebase AI Logic?

Utilizamos el SDK de cliente de Firebase (`firebase/ai`) que actúa como un puente seguro hacia los modelos de Gemini.

1. **Abstracción de Credenciales:** No se requiere hardcodear la API Key. El SDK utiliza la configuración del proyecto Firebase.
2. **Seguridad:** Integra **Firebase App Check** con reCAPTCHA v3 para validar peticiones legítimas.
3. **Integración:** Se conecta nativamente con la instancia de `firebaseApp`.

### Flujo de Datos

1. **Juego:** Recopila métricas (aciertos, errores, tiempos) en `DataManager`.
2. **Frontend:** `GeminiService` convierte el historial a formato CSV.
3. **SDK Firebase AI:** Envía el prompt + CSV a la infraestructura de Google.
4. **Gemini:** Procesa la información y devuelve un diagnóstico pedagógico.

---

## 2. Configuración del Proyecto

### Requisitos en Firebase Console

1. Habilitar **AI Logic (Vertex AI in Firebase)** en la consola de Firebase.
2. Asegurar que la **Gemini Developer API** esté habilitada.
3. Configurar **App Check** con reCAPTCHA v3.

### Inicialización Global (index.html)

```javascript
const firebaseConfig = {
  apiKey: "...",
  authDomain: "...",
  projectId: "baldora-89866",
  // ...
};
const firebaseApp = firebase.initializeApp(firebaseConfig);
window.firebaseConfig = firebaseConfig;
window.firebaseApp = firebaseApp;
```

---

## 3. Implementación del Servicio (GeminiService) - v15.0 FINAL

### Import Map (index.html)

```html
<script type="importmap">
  {
    "imports": {
      "firebase/app": "https://www.gstatic.com/firebasejs/12.8.0/firebase-app.js",
      "firebase/app-check": "https://www.gstatic.com/firebasejs/12.8.0/firebase-app-check.js",
      "firebase/ai": "https://www.gstatic.com/firebasejs/12.8.0/firebase-ai.js"
    }
  }
</script>
```

### Importaciones (gemini-service.js)

```javascript
import { initializeApp } from "firebase/app";
import { initializeAppCheck, ReCaptchaV3Provider } from "firebase/app-check";
import { getAI, getGenerativeModel, GoogleAIBackend } from "firebase/ai";
```

### Inicialización con App Check

```javascript
const firebaseApp = initializeApp(firebaseConfig, "GeminiModularApp");

// App Check con reCAPTCHA v3
const RECAPTCHA_SITE_KEY = '6LdHG1gsAAAAAHfo4psSdnoXJobJZL0byWyj0eSV';

if (location.hostname === 'localhost') {
    self.FIREBASE_APPCHECK_DEBUG_TOKEN = true;
}

const appCheck = initializeAppCheck(firebaseApp, {
    provider: new ReCaptchaV3Provider(RECAPTCHA_SITE_KEY),
    isTokenAutoRefreshEnabled: true
});
```

### Inicialización del Modelo

```javascript
const ai = getAI(firebaseApp, { backend: new GoogleAIBackend() });
const model = getGenerativeModel(ai, { model: "gemini-2.5-flash-lite" });
```

> **IMPORTANTE:** Se usa `getGenerativeModel` con el nombre del modelo, NO `getTemplateGenerativeModel`.

---

## 4. Ingeniería del Prompt

El prompt está integrado directamente en el código:

```javascript
buildPrompt(csvContent) {
    return `Actúa como un experto en aprendizaje acelerado para examinar mis resultados de multiplicaciones (CSV adjunto).

Datos del CSV:
${csvContent}

Genera:
1. Diagnóstico ejecutivo de mi estado actual
2. Observaciones de patrones de error
3. Plan de acción con ejercicios y mnemotecnias

Reglas:
- Tono SIEMPRE positivo y motivador
- Sin emojis
- Responde en español
- Sé conciso pero profundo`;
}
```

### Llamada a la API

```javascript
const result = await model.generateContent(prompt);
const text = result.response.text();
```

---

## 5. Manejo de Estados UI

| Estado | Descripción |
|--------|-------------|
| **Idle** | Botón "Analizar mis Resultados" visible |
| **Loading** | Spinner con mensajes de carga |
| **Success** | Respuesta renderizada del modelo |
| **Error** | Mensaje amigable + botón reintentar |

---

## 6. Resumen de Implementación Final

| Componente | Configuración |
|------------|---------------|
| **SDK Version** | Firebase 12.8.0 |
| **Backend** | `GoogleAIBackend()` |
| **Modelo** | `gemini-2.5-flash-lite` |
| **App Check** | reCAPTCHA v3 habilitado |
| **Site Key** | `6LdHG1gs...` |
| **Versión** | v15.0 |

---

*Documento de Diseño Técnico - Baldora 2026 - Última actualización: 2026-01-27*