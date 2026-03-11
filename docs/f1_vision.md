# Documento Maestro de IngenierÃ­a: Proyecto "Baldora"

**VersiÃ³n:** 1.1 (Actualizado)  
**Fecha:** 15 de Diciembre, 2025  
**Proyecto:** Baldora  
**PropÃ³sito:** Videojuego educativo para aprender y practicar la multiplicaciÃ³n.  
**Plataforma Objetivo:** Web (HTML5/JS)  
**Formato de Salida:** .md (Markdown)

---

## 1. VisiÃ³n General del Proyecto

Baldora es una aplicaciÃ³n web interactiva diseÃ±ada como una herramienta de entrenamiento diario para estudiantes y entusiastas de las matemÃ¡ticas. Su objetivo principal es facilitar la prÃ¡ctica, memorizaciÃ³n y agilidad mental en las tablas de multiplicar, extendiendo el desafÃ­o estÃ¡ndar hasta una matriz de 15 x 15.

El sistema gamifica el proceso de aprendizaje mediante retroalimentaciÃ³n visual y auditiva inmediata, y un sistema robusto de anÃ¡lisis de datos que permite al usuario visualizar su progreso.

---

## 2. MecÃ¡nicas Centrales (Core Loop)

El bucle principal de interacciÃ³n durante una sesiÃ³n de juego se define de la siguiente manera:

*   **SelecciÃ³n Aleatoria:** El sistema selecciona una operaciÃ³n matemÃ¡tica (ej: $12 \times 14$) al azar dentro de la matriz segÃºn las tablas seleccionadas que aÃºn no haya sido resuelta correctamente.
*   **VisualizaciÃ³n:** La operaciÃ³n se resalta en la grilla visual y el foco se sitÃºa en el campo de entrada.
*   **Input del Jugador:** El jugador digita el resultado numÃ©rico y presiona la tecla ENTER.
*   **ValidaciÃ³n y Feedback:**
    *   **Acierto (Correcto):** La celda correspondiente en la matriz se colorea permanentemente de VERDE. Se reproduce sonido de acierto.
    *   **Fallo (Incorrecto):** La celda correspondiente se colorea de AMARILLO. Se reproduce sonido de error.
*   **Registro:** El sistema guarda internamente los datos del intento (tiempo, resultado, acierto/fallo).
*   **IteraciÃ³n:** El juego pasa inmediatamente a la siguiente operaciÃ³n aleatoria.

---

## 3. Modos de Juego y ConfiguraciÃ³n

Al iniciar, el jugador configura la sesiÃ³n mediante las siguientes opciones:

*   **Identidad:** Ingreso de Nickname (o carga automÃ¡tica al subir un CSV histÃ³rico).
*   **Carga de Datos:** Posibilidad de subir un archivo .csv previo para ver grÃ¡ficas de progreso histÃ³rico.
*   **SelecciÃ³n de Modo:**
    *   **Contrarreloj (Time Attack):** El jugador define un tiempo lÃ­mite (MÃ¡x. 15 minutos). El juego termina cuando el contador llega a cero. No hay timer de inactividad en este modo.
    *   **PrÃ¡ctica Libre (Free Mode):** Uso de un cronÃ³metro ascendente sin lÃ­mite de tiempo. El juego termina por inactividad (30 segundos) o manualmente.
    *   **Modo Adaptativo:** Sistema inteligente de 2 fases (diagnÃ³stico + entrenamiento). Ver documento `f2.md`.
    *   **Modo Multijugador (En Desarrollo):** Modalidades Versus y Cooperativo para dos o mÃ¡s jugadores. Ver documento `f15.md`.
*   **SelecciÃ³n de Tablas:** El jugador puede elegir practicar tablas especÃ­ficas seleccionando botones del 1 al 15 para las Filas y botones del 1 al 15 para las Columnas.
    *   Botones individuales para cada factor (1-15) que pueden activarse/desactivarse.
    *   BotÃ³n "Todas" para seleccionar/deseleccionar todas las filas o columnas.
    *   La matriz se ajusta visualmente, oscureciendo las celdas de tablas no seleccionadas.
    *   El contador de progreso refleja el total de operaciones segÃºn las tablas seleccionadas.

---

## 4. Condiciones de Fin de Juego (Game Over)

La sesiÃ³n finaliza cuando ocurre uno de los siguientes eventos:

| Modo | CondiciÃ³n de Fin |
|------|------------------|
| **Contrarreloj** | El temporizador llega a 00:00 |
| **PrÃ¡ctica Libre** | Matriz completa, inactividad de 30s, o botÃ³n "Terminar" |
| **Adaptativo (DiagnÃ³stico)** | Todas las operaciones respondidas (con timer de 30s por operaciÃ³n) |
| **Adaptativo (Entrenamiento)** | Cola de debilidades vacÃ­a (todas dominadas) |

**AcciÃ³n al Finalizar:**
*   Se detiene el registro de tiempo.
*   Se detiene la mÃºsica de gameplay.
*   Se inicia la mÃºsica de estadÃ­sticas.
*   Se muestra el panel de AnalÃ­ticas (Dashboard).
*   El usuario puede descargar manualmente el archivo .csv con el botÃ³n "Descargar CSV".

**Nota:** Cada nueva partida reinicia los datos del CSV. No hay acumulaciÃ³n entre sesiones.

---

## 5. Arquitectura de VisualizaciÃ³n y UI

El juego funciona como una Single Page Application (SPA) con tres vistas principales:

### 5.1. Vista de ConfiguraciÃ³n (Inicio)
*   Formulario de entrada de datos (Nickname, Tiempo).
*   Selector de modo de juego (radio buttons).
*   Grid de selecciÃ³n de tablas (filas y columnas por separado).
*   Zona de "Drag & Drop" o botÃ³n para subir archivo .csv.
*   BotÃ³n "COMENZAR".

### 5.2. Vista de Juego (Gameplay)
*   **Panel Izquierdo (La Matriz):** Una grilla CSS de 16 columnas por 16 filas (incluyendo encabezados). Las celdas muestran la operaciÃ³n (ej: "7Ã—8") y cambian de color dinÃ¡micamente.
*   **Panel Derecho (Controles):**
    *   Display grande del Temporizador/CronÃ³metro.
    *   VisualizaciÃ³n clara de la operaciÃ³n actual.
    *   Input de texto para la respuesta.
    *   Indicadores de estado (Aciertos/Errores).
    *   BotÃ³n "Terminar SesiÃ³n".

### 5.3. Vista de AnalÃ­ticas (Dashboard)
Utilizando Chart.js, se muestran cuatro visualizaciones clave basadas en los datos de la sesiÃ³n actual:
*   **DistribuciÃ³n de Rendimiento (Pie Chart):** Porcentaje total de Aciertos vs. Errores.
*   **Tablas CrÃ­ticas (Bar Chart):** Cantidad de errores agrupados por tabla (del 1 al 15).
*   **Top Errores (Bar Chart - Ranking):** Las 5 operaciones especÃ­ficas con mayor tasa de fallo.
*   **Velocidad de Respuesta (Histograma):** DistribuciÃ³n de los tiempos de respuesta en milisegundos.

---

## 6. Estructura de Datos (Persistencia .csv)

El archivo .csv contiene los datos de la sesiÃ³n actual. Se reinicia en cada nueva partida.

**Formato del Archivo:** `Baldora_[Nickname]_[YYYYMMDD]_[HHMMSS].csv`

**MÃ©todo de Descarga:**
El sistema utiliza la **File System Access API** (estÃ¡ndar moderno y seguro) que abre un diÃ¡logo nativo de "Guardar como..." permitiendo al usuario elegir la ubicaciÃ³n del archivo. Incluye fallback con FileSaver.js para navegadores sin soporte.

**Campos (Columnas):**

| Campo | Tipo | DescripciÃ³n |
| :--- | :--- | :--- |
| timestamp | String (ISO) | Fecha y hora del intento. |
| nickname | String | Identificador del jugador. |
| game_mode | String | "TIMER", "FREE" o "ADAPTIVE". |
| factor_a | Integer | Primer nÃºmero (1-15). |
| factor_b | Integer | Segundo nÃºmero (1-15). |
| user_input | Integer | Respuesta digitada. |
| correct_result| Integer | Resultado matemÃ¡tico real. |
| is_correct | Boolean | TRUE (1) o FALSE (0). |
| response_time | Integer | Tiempo en milisegundos (ms). |

---

## 7. Especificaciones TÃ©cnicas de ImplementaciÃ³n

### 7.1. Estructura de Archivos

```
Baldora/
â”‚
â”œâ”€â”€ index.html          # Estructura DOM Ãºnica
â”œâ”€â”€ css/
â”‚   â””â”€â”€ styles.css      # Design System "Baldor Watercolor"
â”œâ”€â”€ js/
â”‚   â”œâ”€â”€ app.js          # LÃ³gica principal (Game Loop, State Machine)
â”‚   â”œâ”€â”€ grid.js         # Renderizado y manipulaciÃ³n de la matriz
â”‚   â”œâ”€â”€ data.js         # Parsing CSV (PapaParse) y generaciÃ³n de descarga
â”‚   â”œâ”€â”€ charts.js       # ConfiguraciÃ³n de grÃ¡ficas (Chart.js)
â”‚   â””â”€â”€ audioManager.js # Control de mÃºsica y efectos de sonido
â”œâ”€â”€ audio/
â”‚   â”œâ”€â”€ bgm/            # MÃºsica de fondo
â”‚   â””â”€â”€ sfx/            # Efectos de sonido
â”œâ”€â”€ images/
â”‚   â””â”€â”€ baldora_background.png  # Fondo visual
â””â”€â”€ Docs/               # DocumentaciÃ³n del proyecto
```

### 7.2. Dependencias Externas (CDN)
*   **Chart.js:** RenderizaciÃ³n de grÃ¡ficas estadÃ­sticas.
*   **PapaParse:** Procesamiento robusto de lectura/escritura de archivos CSV.
*   **FileSaver.js:** Descarga de archivos compatible con mÃºltiples navegadores (fallback).
*   **Google Fonts:** Oswald (tÃ­tulos) y Nunito (UI).

---

## 8. Notas de IngenierÃ­a para Desarrollo

*   **OptimizaciÃ³n Web:** La matriz de 225 elementos es ligera. Se manipula el DOM mÃ­nimamente, cambiando solo clases CSS (.correct, .wrong, .active).
*   **ValidaciÃ³n de Input:** El campo de respuesta acepta solo nÃºmeros y previene el envÃ­o si estÃ¡ vacÃ­o.
*   **Accesibilidad:** Alto contraste entre los colores de fondo (Verde/Amarillo) y el texto.
*   **Audio:** Sistema de audio con carga previa, polifonÃ­a para SFX, y persistencia de estado mute.
*   **Responsive:** DiseÃ±o adaptativo para desktop, tablet y mÃ³vil.

---

## 9. Documentos Relacionados

| Documento | Contenido |
|-----------|-----------|
| `f1.md` | Este documento - VisiÃ³n general del proyecto |
| `f2.md` | Modo Entrenamiento Adaptativo |
| `f3.md` | UX/UI Design System "Baldor Watercolor" |
| `f4.md` | Sistema de Audio |
| `f5.md` | Sistema de Onboarding |
| `f6.md` | Footer DinÃ¡mico |
| `f7.md` | ExportaciÃ³n a PDF y Reportes |
| `f8.md` | IntegraciÃ³n con IA (Gemini) |
| `f9.md` | SDK y Extensiones |
| `f10.md` | LÃ³gica de Matriz (M) |
| `f11.md` | GestiÃ³n de Respuestas (ANSWR) |
| `f12.md` | Vista Dual MÃ³vil |
| `f13.md` | Funcionalidad de Compartir (Instagram) |
| `f14.md` | Sistema de Usuarios y Comunidad |
| `f15.md` | Modalidad Multijugador |
| `f16_store.md` | GestiÃ³n de Estado Global |
| f17_legal.md | Aspectos Legales y Privacidad |
| f18_captacion-datos-venta.md | Captación de Datos (Colombia) |
| f19_practica_libre.md | Modalidad Práctica Libre |


