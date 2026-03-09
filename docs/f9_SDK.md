# Referencia de la API de JavaScript de Firebase: Paquete AI

El SDK de Firebase AI para la web permite la integración de modelos generativos (Gemini, Imagen) directamente en aplicaciones web.

---

## Funciones Principales

### `getAI(app, options)`

Devuelve la instancia predeterminada de AI asociada con la `FirebaseApp` proporcionada.

**Parámetros:**
- `app` (FirebaseApp): La aplicación de Firebase.
- `options` (AIOptions): Opciones que configuran la instancia de AI.

**Retorno:** `AI`

**Ejemplo:**
```javascript
const ai = getAI(app);

// O configurar un backend específico
const aiGoogle = getAI(app, { backend: new GoogleAIBackend() });
```

---

### `getGenerativeModel(ai, modelParams, requestOptions)`

Devuelve una clase `GenerativeModel` con métodos para inferencia.

**Parámetros:**
- `ai` (AI): Instancia de AI.
- `modelParams` (ModelParams): Parámetros del modelo (nombre, configuración).

**Retorno:** `GenerativeModel`

**Ejemplo (Implementación Baldora v15.0):**
```javascript
// Configurar backend de Gemini Developer API
const ai = getAI(firebaseApp, { backend: new GoogleAIBackend() });

// Modelo directo - ESTA ES LA FORMA QUE FUNCIONA
const model = getGenerativeModel(ai, { model: "gemini-2.5-flash-lite" });

// Llamar al modelo con un prompt
const result = await model.generateContent("Tu prompt aquí");
const text = result.response.text();
```

---

### `getTemplateGenerativeModel(ai, templateParams)`

Devuelve un modelo basado en una **plantilla de prompt** de Firebase Console.

**Parámetros:**
- `ai` (AI): Instancia de AI.
- `templateParams` (TemplateParams): Parámetros que incluyen el `templateId`.

**Retorno:** `TemplateGenerativeModel`

> **NOTA:** Las plantillas requieren configuración adicional en Firebase Console y pueden no estar disponibles en todos los proyectos. Para Baldora, usamos `getGenerativeModel` directamente.

---

### `getImagenModel(ai, modelParams, requestOptions)`

Devuelve una clase `ImagenModel` para generar imágenes. Soporta Imagen 3 (`imagen-3.0-*`).

**Retorno:** `ImagenModel`

---

## Clases

| Clase | Descripción |
|-------|-------------|
| `AIError` | Clase de error específica para el SDK de Firebase AI. |
| `AIModel` | Clase base para los modelos de Firebase AI. |
| `ChatSession` | Gestiona el historial de mensajes enviados y recibidos. |
| `GenerativeModel` | Clase principal para interactuar con modelos de lenguaje. |
| `ImagenModel` | Clase para generar imágenes usando Imagen. |
| `GoogleAIBackend` | Configuración para usar la API de Gemini Developer. |
| `VertexAIBackend` | Configuración para usar la API de Vertex AI. |
| `Schema` | Clase base para definir esquemas de datos. |

---

## Interfaces Clave

### `GenerationConfig`

| Propiedad | Descripción |
|-----------|-------------|
| `stopSequences` | Secuencias que detienen la generación. |
| `maxOutputTokens` | Límite máximo de tokens de salida. |
| `temperature` | Controla la aleatoriedad (0.0 - 2.0). |
| `topP`, `topK` | Parámetros de muestreo. |

### `Content`

| Propiedad | Descripción |
|-----------|-------------|
| `role` | El rol del emisor (`user`, `model`, `system`, `function`). |
| `parts` | Un arreglo de `Part` (texto, datos inline, funciones). |

---

## Implementación Baldora (FUNCIONAL)

### Configuración Final v15.0

```javascript
import { initializeApp } from "firebase/app";
import { initializeAppCheck, ReCaptchaV3Provider } from "firebase/app-check";
import { getAI, getGenerativeModel, GoogleAIBackend } from "firebase/ai";

// Inicializar Firebase
const firebaseApp = initializeApp(firebaseConfig, "GeminiModularApp");

// App Check con reCAPTCHA v3
const appCheck = initializeAppCheck(firebaseApp, {
    provider: new ReCaptchaV3Provider('6LdHG1gsAAAAAHfo4psSdnoXJobJZL0byWyj0eSV'),
    isTokenAutoRefreshEnabled: true
});

// Inicializar AI con Gemini Developer API
const ai = getAI(firebaseApp, { backend: new GoogleAIBackend() });
const model = getGenerativeModel(ai, { model: "gemini-2.5-flash-lite" });

// Llamar al modelo
const result = await model.generateContent(prompt);
const text = result.response.text();
```

### Resumen de Configuración

| Componente | Valor |
|------------|-------|
| SDK Version | `12.8.0` |
| Backend | `GoogleAIBackend()` |
| Modelo | `gemini-2.5-flash-lite` |
| App Check | reCAPTCHA v3 |
| Versión | v15.0 |

---

## Variables y Enums

### `AIErrorCode`
- `ERROR`, `REQUEST_ERROR`, `RESPONSE_ERROR`, `FETCH_ERROR`, `SESSION_CLOSED`, `UNSUPPORTED`

### `HarmCategory`
- `HARM_CATEGORY_HATE_SPEECH`, `HARM_CATEGORY_SEXUALLY_EXPLICIT`, `HARM_CATEGORY_HARASSMENT`, `HARM_CATEGORY_DANGEROUS_CONTENT`

### `HarmBlockThreshold`
- `BLOCK_LOW_AND_ABOVE`, `BLOCK_MEDIUM_AND_ABOVE`, `BLOCK_ONLY_HIGH`, `BLOCK_NONE`, `OFF`

---

*Última actualización: 2026-01-27 UTC. Basado en la referencia oficial de Firebase AI Web SDK e implementación Baldora.*