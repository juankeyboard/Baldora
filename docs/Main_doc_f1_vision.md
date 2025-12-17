# Documento Maestro de Ingeniería: Proyecto "Baldora"

**Versión:** 1.1 (Actualizado)  
**Fecha:** 15 de Diciembre, 2025  
**Proyecto:** Baldora  
**Propósito:** Videojuego educativo para aprender y practicar la multiplicación.  
**Plataforma Objetivo:** Web (HTML5/JS)  
**Formato de Salida:** .md (Markdown)

---

## 1. Visión General del Proyecto

Baldora es una aplicación web interactiva diseñada como una herramienta de entrenamiento diario para estudiantes y entusiastas de las matemáticas. Su objetivo principal es facilitar la práctica, memorización y agilidad mental en las tablas de multiplicar, extendiendo el desafío estándar hasta una matriz de 15 x 15.

El sistema gamifica el proceso de aprendizaje mediante retroalimentación visual y auditiva inmediata, y un sistema robusto de análisis de datos que permite al usuario visualizar su progreso.

---

## 2. Mecánicas Centrales (Core Loop)

El bucle principal de interacción durante una sesión de juego se define de la siguiente manera:

*   **Selección Aleatoria:** El sistema selecciona una operación matemática (ej: $12 \times 14$) al azar dentro de la matriz según las tablas seleccionadas que aún no haya sido resuelta correctamente.
*   **Visualización:** La operación se resalta en la grilla visual y el foco se sitúa en el campo de entrada.
*   **Input del Jugador:** El jugador digita el resultado numérico y presiona la tecla ENTER.
*   **Validación y Feedback:**
    *   **Acierto (Correcto):** La celda correspondiente en la matriz se colorea permanentemente de VERDE. Se reproduce sonido de acierto.
    *   **Fallo (Incorrecto):** La celda correspondiente se colorea de AMARILLO. Se reproduce sonido de error.
*   **Registro:** El sistema guarda internamente los datos del intento (tiempo, resultado, acierto/fallo).
*   **Iteración:** El juego pasa inmediatamente a la siguiente operación aleatoria.

---

## 3. Modos de Juego y Configuración

Al iniciar, el jugador configura la sesión mediante las siguientes opciones:

*   **Identidad:** Ingreso de Nickname (o carga automática al subir un CSV histórico).
*   **Carga de Datos:** Posibilidad de subir un archivo .csv previo para ver gráficas de progreso histórico.
*   **Selección de Modo:**
    *   **Contrarreloj (Time Attack):** El jugador define un tiempo límite (Máx. 15 minutos). El juego termina cuando el contador llega a cero. No hay timer de inactividad en este modo.
    *   **Práctica Libre (Free Mode):** Uso de un cronómetro ascendente sin límite de tiempo. El juego termina por inactividad (30 segundos) o manualmente.
    *   **Modo Adaptativo:** Sistema inteligente de 2 fases (diagnóstico + entrenamiento). Ver documento `Main_doc_f2.md`.
*   **Selección de Tablas:** El jugador puede elegir practicar tablas específicas seleccionando botones del 1 al 15 para las Filas y botones del 1 al 15 para las Columnas.
    *   Botones individuales para cada factor (1-15) que pueden activarse/desactivarse.
    *   Botón "Todas" para seleccionar/deseleccionar todas las filas o columnas.
    *   La matriz se ajusta visualmente, oscureciendo las celdas de tablas no seleccionadas.
    *   El contador de progreso refleja el total de operaciones según las tablas seleccionadas.

---

## 4. Condiciones de Fin de Juego (Game Over)

La sesión finaliza cuando ocurre uno de los siguientes eventos:

| Modo | Condición de Fin |
|------|------------------|
| **Contrarreloj** | El temporizador llega a 00:00 |
| **Práctica Libre** | Matriz completa, inactividad de 30s, o botón "Terminar" |
| **Adaptativo (Diagnóstico)** | Todas las operaciones respondidas (con timer de 30s por operación) |
| **Adaptativo (Entrenamiento)** | Cola de debilidades vacía (todas dominadas) |

**Acción al Finalizar:**
*   Se detiene el registro de tiempo.
*   Se detiene la música de gameplay.
*   Se inicia la música de estadísticas.
*   Se muestra el panel de Analíticas (Dashboard).
*   El usuario puede descargar manualmente el archivo .csv con el botón "Descargar CSV".

**Nota:** Cada nueva partida reinicia los datos del CSV. No hay acumulación entre sesiones.

---

## 5. Arquitectura de Visualización y UI

El juego funciona como una Single Page Application (SPA) con tres vistas principales:

### 5.1. Vista de Configuración (Inicio)
*   Formulario de entrada de datos (Nickname, Tiempo).
*   Selector de modo de juego (radio buttons).
*   Grid de selección de tablas (filas y columnas por separado).
*   Zona de "Drag & Drop" o botón para subir archivo .csv.
*   Botón "COMENZAR".

### 5.2. Vista de Juego (Gameplay)
*   **Panel Izquierdo (La Matriz):** Una grilla CSS de 16 columnas por 16 filas (incluyendo encabezados). Las celdas muestran la operación (ej: "7×8") y cambian de color dinámicamente.
*   **Panel Derecho (Controles):**
    *   Display grande del Temporizador/Cronómetro.
    *   Visualización clara de la operación actual.
    *   Input de texto para la respuesta.
    *   Indicadores de estado (Aciertos/Errores).
    *   Botón "Terminar Sesión".

### 5.3. Vista de Analíticas (Dashboard)
Utilizando Chart.js, se muestran cuatro visualizaciones clave basadas en los datos de la sesión actual:
*   **Distribución de Rendimiento (Pie Chart):** Porcentaje total de Aciertos vs. Errores.
*   **Tablas Críticas (Bar Chart):** Cantidad de errores agrupados por tabla (del 1 al 15).
*   **Top Errores (Bar Chart - Ranking):** Las 5 operaciones específicas con mayor tasa de fallo.
*   **Velocidad de Respuesta (Histograma):** Distribución de los tiempos de respuesta en milisegundos.

---

## 6. Estructura de Datos (Persistencia .csv)

El archivo .csv contiene los datos de la sesión actual. Se reinicia en cada nueva partida.

**Formato del Archivo:** `Baldora_[Nickname]_[YYYYMMDD]_[HHMMSS].csv`

**Método de Descarga:**
El sistema utiliza la **File System Access API** (estándar moderno y seguro) que abre un diálogo nativo de "Guardar como..." permitiendo al usuario elegir la ubicación del archivo. Incluye fallback con FileSaver.js para navegadores sin soporte.

**Campos (Columnas):**

| Campo | Tipo | Descripción |
| :--- | :--- | :--- |
| timestamp | String (ISO) | Fecha y hora del intento. |
| nickname | String | Identificador del jugador. |
| game_mode | String | "TIMER", "FREE" o "ADAPTIVE". |
| factor_a | Integer | Primer número (1-15). |
| factor_b | Integer | Segundo número (1-15). |
| user_input | Integer | Respuesta digitada. |
| correct_result| Integer | Resultado matemático real. |
| is_correct | Boolean | TRUE (1) o FALSE (0). |
| response_time | Integer | Tiempo en milisegundos (ms). |

---

## 7. Especificaciones Técnicas de Implementación

### 7.1. Estructura de Archivos

```
Baldora/
│
├── index.html          # Estructura DOM única
├── css/
│   └── styles.css      # Design System "Baldor Watercolor"
├── js/
│   ├── app.js          # Lógica principal (Game Loop, State Machine)
│   ├── grid.js         # Renderizado y manipulación de la matriz
│   ├── data.js         # Parsing CSV (PapaParse) y generación de descarga
│   ├── charts.js       # Configuración de gráficas (Chart.js)
│   └── audioManager.js # Control de música y efectos de sonido
├── audio/
│   ├── bgm/            # Música de fondo
│   └── sfx/            # Efectos de sonido
├── images/
│   └── baldora_background.png  # Fondo visual
└── Docs/               # Documentación del proyecto
```

### 7.2. Dependencias Externas (CDN)
*   **Chart.js:** Renderización de gráficas estadísticas.
*   **PapaParse:** Procesamiento robusto de lectura/escritura de archivos CSV.
*   **FileSaver.js:** Descarga de archivos compatible con múltiples navegadores (fallback).
*   **Google Fonts:** Oswald (títulos) y Nunito (UI).

---

## 8. Notas de Ingeniería para Desarrollo

*   **Optimización Web:** La matriz de 225 elementos es ligera. Se manipula el DOM mínimamente, cambiando solo clases CSS (.correct, .wrong, .active).
*   **Validación de Input:** El campo de respuesta acepta solo números y previene el envío si está vacío.
*   **Accesibilidad:** Alto contraste entre los colores de fondo (Verde/Amarillo) y el texto.
*   **Audio:** Sistema de audio con carga previa, polifonía para SFX, y persistencia de estado mute.
*   **Responsive:** Diseño adaptativo para desktop, tablet y móvil.

---

## 9. Documentos Relacionados

| Documento | Contenido |
|-----------|-----------|
| `Main_doc_f1.md` | Este documento - Visión general del proyecto |
| `Main_doc_f2.md` | Modo Entrenamiento Adaptativo |
| `Main_doc_f3.md` | UX/UI Design System "Baldor Watercolor" |
| `Main_doc_f4.md` | Sistema de Audio |