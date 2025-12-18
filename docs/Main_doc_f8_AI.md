# Guía de Configuración: Análisis de CSV con Gemini y Firebase AI Logic

Esta guía detalla el proceso técnico para integrar la API de Gemini en tu juego utilizando los SDKs de Firebase AI Logic, permitiendo el análisis de archivos `.csv` generados al final de la partida.

---

## 1. Requisitos Previos

- Un entorno de desarrollo para aplicaciones Web (JavaScript/Node.js).
- Una cuenta de Google con acceso a Firebase Console.
- El archivo `.csv` generado por tu juego debe ser accesible como cadena de texto (string) o buffer para ser enviado al modelo.

---

## 2. Configuración del Proyecto en Firebase

### Paso 1: Crear y conectar el proyecto
1. Accede a la consola de Firebase y selecciona tu proyecto.
2. Ve a la sección **AI Logic** en el menú lateral.
3. Haz clic en **Comenzar** para habilitar las APIs necesarias.
4. Selecciona el proveedor **Gemini API**.
   - *Recomendación:* Usa **Gemini Developer API** (disponible en el plan Spark sin costo) para pruebas iniciales.
5. Registra tu aplicación web para obtener el objeto `firebaseConfig`.

### Paso 2: Seguridad (App Check)
Se recomienda configurar **Firebase App Check** antes de pasar a producción para proteger tus llamadas a la API de Gemini de usos no autorizados.

---

## 3. Instalación e Inicialización del SDK

### Instalación
Instala el SDK de Firebase mediante npm (si usas bundler) o usa CDN:

```bash
npm install firebase
```

### Inicialización técnica
Configura el backend de AI Logic en tu código principal:

```javascript
import { initializeApp } from "firebase/app";
import { getAI, getGenerativeModel, GoogleAIBackend } from "firebase/ai";

// Configuración de tu app (obtenida en la consola de Firebase)
const firebaseConfig = {
  apiKey: "TU_API_KEY",
  authDomain: "tu-app.firebaseapp.com",
  projectId: "tu-app",
  storageBucket: "tu-app.appspot.com",
  messagingSenderId: "ID_SENDER",
  appId: "ID_APP"
};

// Inicializar Firebase
const firebaseApp = initializeApp(firebaseConfig);

// Inicializar el servicio de backend de Gemini
const ai = getAI(firebaseApp, { backend: new GoogleAIBackend() });

// Crear instancia del modelo (se recomienda gemini-2.5-flash por su velocidad y costo)
const model = getGenerativeModel(ai, { model: "gemini-2.5-flash" });
```

---

## 4. Lógica de Análisis del archivo .csv

Para procesar el archivo `.csv` de tu juego, debes leer el contenido del archivo y enviarlo como parte del prompt. Gemini es excelente procesando datos estructurados en texto.

### Función de análisis:

```javascript
async function analizarResultadosJuego(contenidoCSV) {
  try {
    // Definir el prompt de contexto para Gemini
    const prompt = `
      Actúa como un analista de datos de videojuegos. 
      A continuación te proporciono un archivo CSV con los resultados de la partida actual. 
      Por favor, analiza el desempeño del jugador y devuelve un resumen con:
      1. Puntuación final y ranking.
      2. Áreas de mejora detectadas.
      3. Un mensaje motivador personalizado.

      Datos del CSV:
      ${contenidoCSV}
    `;

    // Llamada a la API de Gemini
    const result = await model.generateContent(prompt);
    const response = result.response;
    const textoResultado = response.text();

    console.log("Análisis de Gemini:", textoResultado);
    return textoResultado;
    
  } catch (error) {
    console.error("Error al analizar el CSV:", error);
    // Implementar reintentos con backoff exponencial si es necesario
  }
}
```

---

## 5. Detalles Técnicos Importantes

### Modelos Disponibles
- **Gemini 2.5 Flash:** Optimizado para velocidad y eficiencia. Ideal para análisis rápidos de fin de juego.
- **Gemini 1.5 Pro:** Mayor capacidad de razonamiento para análisis complejos o archivos CSV muy extensos.

### Parámetros de Generación (Opcional)
Puedes ajustar la "creatividad" del análisis configurando la temperatura:

```javascript
const model = getGenerativeModel(ai, { 
  model: "gemini-2.5-flash",
  generationConfig: {
    temperature: 0.7, // Ajusta entre 0 (preciso) y 1 (creativo)
    maxOutputTokens: 1000
  }
});
```

### Manejo de Errores y Depuración
Siguiendo las mejores prácticas de desarrollo:
- **Validación:** Asegúrate de que el CSV no esté vacío antes de enviarlo.
- **Backoff:** Si la API devuelve un error de cuota, implementa una espera de 1s, 2s, 4s antes de reintentar.
- **Privacidad:** No incluyas datos personales sensibles del usuario en el CSV enviado a la API pública.

---
*Documentación generada a partir del manual de Firebase AI Logic - Diciembre 2025.*