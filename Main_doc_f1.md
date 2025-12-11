# Documento Maestro de Ingeniería: Proyecto "Fast Math Game"

**Versión:** 1.0 (Final)  
**Fecha:** 09 de Diciembre, 2025  
**Proyecto:** Fast Math Game  
**Propósito:** Videojuego educativo para aprender y practicar la multiplicación.  
**Plataforma Objetivo:** Web (HTML5/WebGL/JS)  
**Motor/Contexto:** Antigravity Engine  
**Formato de Salida:** .md (Markdown)

## 1. Visión General del Proyecto

Fast Math Game es una aplicación web interactiva diseñada como una herramienta de entrenamiento diario para estudiantes y entusiastas de las matemáticas. Su objetivo principal es facilitar la práctica, memorización y agilidad mental en las tablas de multiplicar, extendiendo el desafío estándar hasta una matriz de 15 x 15.

El sistema gamifica el proceso de aprendizaje mediante retroalimentación visual inmediata y un sistema robusto de análisis de datos que permite al usuario visualizar su progreso a lo largo del tiempo.

## 2. Mecánicas Centrales (Core Loop)

El bucle principal de interacción durante una sesión de juego se define de la siguiente manera:

*   **Selección Aleatoria:** El sistema selecciona una operación matemática (ej: $12 \times 14$) al azar dentro de la matriz de 15x15 que aún no haya sido resuelta correctamente.
*   **Visualización:** La operación se resalta en la grilla visual y el foco se sitúa en el campo de entrada.
*   **Input del Jugador:** El jugador digita el resultado numérico y presiona la tecla ENTER.
*   **Validación y Feedback:**
    *   **Acierto (Correcto):** La celda correspondiente en la matriz se colorea permanentemente de VERDE.
    *   **Fallo (Incorrecto):** La celda correspondiente se colorea de AMARILLO.
*   **Registro:** El sistema guarda internamente los datos del intento (tiempo, resultado, acierto/fallo).
*   **Iteración:** El juego pasa inmediatamente a la siguiente operación aleatoria.

## 3. Modos de Juego y Configuración

Al iniciar, el jugador configura la sesión mediante las siguientes opciones:

*   **Identidad:** Ingreso de Nickname (o carga automática al subir un CSV histórico).
*   **Carga de Datos:** Posibilidad de subir un archivo .csv previo para continuar el registro histórico y ver gráficas de progreso.
*   **Selección de Modo:**
    *   **Contrarreloj (Time Attack):** El jugador define un tiempo límite (Máx. 15 minutos). El juego termina cuando el contador llega a cero.
    *   **Práctica Libre (Free Mode):** Uso de un cronómetro ascendente sin límite de tiempo, enfocado en completar la grilla a ritmo propio.
*   **Selección de Tablas:** El jugador puede elegir practicar tablas específicas seleccionando botones del 1 al 15 para el factor A (Filas) y botones del 1 al 15 para el factor B (Columnas).
    *   Botones individuales para cada factor A y B (1-15) que pueden activarse/desactivarse.
    *   Botón "Seleccionar Todo" para cada uno de los factores A y B.
    *   La matriz se ajusta visualmente, oscureciendo las celdas de tablas no seleccionadas.
    *   El contador de progreso refleja el total de operaciones según las tablas seleccionadas.

## 4. Condiciones de Fin de Juego (Game Over)

La sesión finaliza cuando ocurre uno de los siguientes eventos:

*   **Tiempo Agotado:** En modo Contrarreloj, el temporizador llega a 00:00.
*   **Matriz Completa:** El jugador acierta las 225 operaciones posibles.
*   **Finalización Manual:** El jugador presiona el botón "Terminar Sesión".

**Acción al Finalizar:**
*   Se detiene el registro de tiempo.
*   Se muestra el panel de Analíticas (Dashboard).
*   El usuario puede descargar manualmente el archivo .csv con el botón "Descargar CSV".

## 5. Arquitectura de Visualización y UI

El juego funcionará como una Single Page Application (SPA) con tres vistas principales:

### 5.1. Vista de Configuración (Inicio)
*   Formulario de entrada de datos (Nickname, Tiempo).
*   Zona de "Drag & Drop" o botón para subir archivo .csv.
*   Botón "COMENZAR".

### 5.2. Vista de Juego (Gameplay)
*   **Panel Izquierdo (La Matriz):** Una grilla CSS (display: grid) de 15 columnas por 15 filas. Las celdas cambian de color dinámicamente.
*   **Panel Derecho (Controles):**
    *   Display grande del Temporizador/Cronómetro.
    *   Visualización clara de la operación actual (ej: "$7 \times 8$").
    *   Input de texto para la respuesta.
    *   Indicadores de estado (Aciertos/Errores).

### 5.3. Vista de Analíticas (Dashboard)
Utilizando librerías de gráficos (ej: Chart.js), se mostrarán cuatro visualizaciones clave basadas en los datos (histórico + sesión actual):
*   **Distribución de Rendimiento (Pie Chart):** Porcentaje total de Aciertos vs. Errores.
*   **Tablas Críticas (Bar Chart - Agrupado):** Cantidad de errores agrupados por tabla (del 1 al 15). Permite ver qué número base es el más difícil para el usuario.
*   **Top Errores (Bar Chart - Ranking):** Las 5 operaciones específicas (ej: "$13 \times 14$") con mayor tasa de fallo.
*   **Velocidad de Respuesta (Campana de Gauss / Histograma):** Distribución de los tiempos de respuesta en milisegundos para analizar la fluidez cognitiva.

## 6. Estructura de Datos (Persistencia .csv)

El archivo .csv es la base de datos portátil del usuario. Cada fila representa un intento individual de una operación.

**Formato del Archivo:** `FastMathGame_[Nickname]_[YYYYMMDD]_[HHMMSS].csv`

**Método de Descarga:**
El sistema utiliza la **File System Access API** (estándar moderno y seguro) que abre un diálogo nativo de "Guardar como..." permitiendo al usuario elegir la ubicación del archivo. Incluye fallback con FileSaver.js para navegadores sin soporte.

**Campos (Columnas):**

| Campo | Tipo | Descripción |
| :--- | :--- | :--- |
| timestamp | String (ISO) | Fecha y hora del intento. |
| nickname | String | Identificador del jugador. |
| game_mode | String | "TIMER" o "FREE". |
| factor_a | Integer | Primer número (1-15). |
| factor_b | Integer | Segundo número (1-15). |
| user_input | Integer | Respuesta digitada. |
| correct_result| Integer | Resultado matemático real. |
| is_correct | Boolean | TRUE (1) o FALSE (0). |
| response_time | Integer | Tiempo en milisegundos (ms). |

## 7. Especificaciones Técnicas de Implementación

### 7.1. Estructura de Archivos Sugerida
```
FastMathGame/
│
├── index.html          # Estructura DOM única
├── css/
│   └── styles.css      # CSS Grid para la matriz 15x15 y diseño responsive
├── js/
│   ├── app.js          # Lógica principal (Game Loop, State Machine)
│   ├── grid.js         # Renderizado y manipulación de la matriz
│   ├── data.js         # Parsing CSV (PapaParse) y generación de descarga
│   └── charts.js       # Configuración de gráficas (Chart.js)
└── assets/             # Recursos estáticos
```

### 7.2. Dependencias Externas (CDN)
*   **Chart.js:** Para la renderización de las gráficas estadísticas.
*   **PapaParse:** Para el procesamiento robusto de lectura/escritura de archivos CSV.
*   **FileSaver.js:** Para descarga de archivos compatible con múltiples navegadores (fallback).
*   **(Opcional) Google Fonts:** Para tipografía clara y legible.

## 8. Notas de Ingeniería para Desarrollo
*   **Optimización Web:** La matriz de 225 elementos debe ser ligera. Se recomienda manipular el DOM mínimamente, cambiando solo clases CSS (.correct, .wrong, .active) en lugar de re-renderizar todo.
*   **Validación de Input:** El campo de respuesta debe aceptar solo números y prevenir el envío si está vacío.
*   **Accesibilidad:** Asegurar alto contraste entre los colores de fondo (Verde/Amarillo) y el texto de las operaciones.