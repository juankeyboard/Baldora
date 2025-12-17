# Documento Maestro de Ingeniería: Modo Entrenamiento Adaptativo

**Versión:** 2.1 (Actualizado)  
**Proyecto:** Baldora  
**Fecha:** 15 de Diciembre, 2025  
**Estado:** ✅ Implementado y Funcional

---

## 1. Descripción del Feature

El **Modo Entrenamiento Adaptativo** es una tercera modalidad de juego seleccionable desde el menú principal. A diferencia de los modos "Contrarreloj" o "Libre", este modo no busca completar la matriz una sola vez, sino **purificar el conocimiento** del usuario mediante un proceso de *Filtrado y Repetición*.

### Flujo de Fases

El flujo se divide en dos fases secuenciales:

1. **Fase de Diagnóstico (Test):** Barrido completo de operaciones seleccionadas con timer de 30 segundos por operación.
2. **Fase de Entrenamiento (Loop):** Repetición aislada de errores y respuestas lentas hasta lograr la maestría (100% efectividad).

---

## 2. Reglas de Negocio Implementadas

### 2.1. Restricción de Inactividad

| Modo/Fase | Inactividad (30s) | Timer |
|-----------|-------------------|-------|
| **Contrarreloj** | ❌ Desactivado | Cuenta regresiva (tiempo configurado) |
| **Práctica Libre** | ✅ Activo | Cronómetro ascendente |
| **Adaptativo - Diagnóstico** | ✅ Activo | Cuenta regresiva 30s POR OPERACIÓN |
| **Adaptativo - Entrenamiento** | ❌ Desactivado | Cronómetro ascendente |

**Razón:** Durante el entrenamiento, el usuario puede necesitar más tiempo para pensar y aprender.

### 2.2. Temporizador en Modo Adaptativo

| Fase | Comportamiento del Timer |
|------|--------------------------|
| **Fase Diagnóstico** | Timer en cuenta regresiva de **30 segundos** por cada operación |
| **Si se agota el tiempo** | Se registra como timeout/error y pasa a la siguiente operación |
| **Fase Entrenamiento** | Timer cuenta hacia arriba (cronómetro) sin límite |

### 2.3. Criterios de Selección de "Debilidades"

Al finalizar la Fase de Diagnóstico, el sistema clasifica una operación como **"Objetivo de Entrenamiento"** si cumple cualquiera de estas condiciones:

- **Error de Precisión:** El resultado ingresado fue incorrecto (`isCorrect === false`)
- **Timeout:** El usuario no respondió en los 30 segundos asignados
- **Lentitud Cognitiva:** El tiempo de respuesta fue superior al umbral calculado

#### Fórmula del Umbral

```
Threshold = Avg_Session_Time * 1.2  (20% más lento que el promedio)
```

> **Ejemplo:** Si el usuario promedia 2000ms, cualquier respuesta sobre 2400ms se marca para revisión, aunque sea correcta.

### 2.4. Selección de Tablas a Entrenar

El modo adaptativo permite al usuario **seleccionar qué tablas desea practicar** antes de iniciar el diagnóstico:

| Aspecto | Descripción |
|---------|-------------|
| **Selector de Tablas** | El mismo grid de selección (1-15) disponible en los otros modos |
| **Por defecto** | Todas las tablas seleccionadas (matriz completa 15x15) |
| **Mínimo** | Al menos 1 fila y 1 columna deben estar seleccionadas |
| **Operaciones generadas** | Intersección de filas y columnas seleccionadas |

### 2.5. Herramienta de Ayuda Visual (Solo en Entrenamiento)

Durante la Fase de Entrenamiento, se activa una **ayuda visual automática cíclica**:

| Aspecto | Descripción |
|---------|-------------|
| **Activación** | Cuando el tiempo de respuesta actual supera el tiempo promedio del diagnóstico |
| **Acción** | Se muestra el resultado correcto de la operación en la celda de la matriz |
| **Duración** | La ayuda se muestra por **2 segundos** |
| **Ciclo** | Después de ocultarse, hay un cooldown de **10 segundos** antes de mostrarse nuevamente |
| **Audio** | Se reproduce `baldora_sfx_hint.mp3` cuando se muestra la ayuda |
| **Contador** | Se registra cuántas veces se activó la ayuda para estadísticas |

#### Flujo de la Ayuda Visual

```
1. Usuario ve operación (ej: 7 × 8)
2. Tiempo transcurrido > avgTime de diagnóstico
3. Sistema muestra "56" en la celda de la matriz (2 segundos)
4. Se reproduce sonido de hint
5. Sistema oculta la ayuda
6. Cooldown de 10 segundos antes de poder mostrar otra ayuda
7. Usuario responde cuando quiera
```

---

## 3. Especificaciones Técnicas del Flujo

### 3.1. Fase 1: El Diagnóstico

| Paso | Descripción |
|------|-------------|
| **Inicialización** | Se carga la matriz con las operaciones seleccionadas |
| **Gameplay** | El usuario tiene 30 segundos por operación. El orden es aleatorio |
| **Feedback Visual** | Se muestra feedback verde/amarillo |
| **Timeout** | Si se agota el tiempo, se marca como error y pasa a la siguiente |
| **Recolección de Datos** | Se crea array `sessionMetrics` con `{ row, col, isCorrect, responseTime, isTimeout }` |
| **Inactividad** | Aplica (pero es irrelevante porque cada operación tiene su propio timer) |

### 3.2. Transición: El Algoritmo de Filtrado

Al completar todas las operaciones seleccionadas:

1. El sistema calcula el `Avg_Session_Time`
2. El sistema itera sobre `sessionMetrics`
3. Genera un nuevo array: `trainingQueue`
4. Guarda el `avgDiagnosisTime` para usarlo como umbral de ayuda visual

**Efecto Visual (UI):** 
- Modal informativo muestra cuántas debilidades se detectaron
- Las celdas dominadas se atenúan
- Las celdas de debilidad se resaltan con animación de pulso

### 3.3. Fase 2: El Bucle de Entrenamiento

Esta fase es **iterativa**:

- **Operaciones:** El usuario juega solo las operaciones en `trainingQueue`
- **Ayuda Visual:** Si supera el `avgDiagnosisTime`, se muestra el resultado cíclicamente
- **Evaluación:**
  - Si acierta → La operación se elimina de la cola y se marca como "mastered"
  - Si falla → La operación permanece en la cola
- **Inactividad:** Timer de 30 segundos **DESACTIVADO**
- **Condición de Victoria:** Cuando `trainingQueue.length === 0`

---

## 4. Implementación en Código

### 4.1. Variables de Estado en `app.js`

```javascript
// Fase actual del modo adaptativo
adaptivePhase: null,  // 'DIAGNOSIS' o 'TRAINING'

// Métricas de la sesión de diagnóstico
sessionMetrics: [],

// Cola de operaciones a entrenar
trainingQueue: [],

// Tiempo promedio del diagnóstico (para ayuda visual)
avgDiagnosisTime: 0,

// Contador de ayudas visuales usadas
helpUsedCount: 0,

// Constantes
DIAGNOSIS_OP_TIME: 30000,      // 30 segundos por operación
SLOW_THRESHOLD_MULTIPLIER: 1.2, // 20% más lento que promedio
HELP_DISPLAY_DURATION: 2000,    // Ayuda visible 2 segundos
HELP_CYCLE_INTERVAL: 10000,     // 10 segundos entre ayudas
```

### 4.2. Métodos Clave

| Método | Ubicación | Propósito |
|--------|-----------|-----------|
| `handleDiagnosisTimeout()` | app.js | Maneja timeout de operación en diagnóstico |
| `showAdaptiveTransition()` | app.js | Muestra modal de transición con conteo de debilidades |
| `generateTrainingQueue()` | app.js | Calcula debilidades basadas en errores y lentitud |
| `startTrainingPhase()` | app.js | Inicia fase de entrenamiento |
| `startHelpCheck()` | app.js | Inicia intervalo de verificación de ayuda visual |
| `showVisualHelp()` | app.js | Muestra la ayuda visual cíclica |
| `clearHelpCheck()` | app.js | Limpia intervalos de ayuda (importante al cambiar pantalla) |
| `showAdaptiveVictory()` | app.js | Muestra modal de victoria con estadísticas |
| `filterForTraining()` | grid.js | Filtra la matriz para mostrar solo debilidades |
| `showAnswerInCell()` | grid.js | Muestra respuesta en celda (con sonido hint) |
| `hideAnswerFromCell()` | grid.js | Oculta respuesta de celda |
| `markCellMastered()` | grid.js | Marca celda como dominada |

---

## 5. Interfaz de Usuario Implementada

### 5.1. Selector de Modo

En el menú principal se muestra un tercer radio button:

```html
<label class="mode-option" for="mode-adaptive">
    <input type="radio" name="game-mode" id="mode-adaptive" value="adaptive">
    <span class="mode-icon">🧠</span>
    <span>Adaptativo</span>
</label>
```

### 5.2. Indicadores Durante el Juego

| Elemento | Descripción |
|----------|-------------|
| **Badge de Fase** | Muestra "📋 Fase Diagnóstico" o "🎯 Fase Entrenamiento" |
| **Título de Matriz** | Muestra "Diagnóstico - X operaciones" o "Entrenamiento - Dominando Debilidades" |
| **Contador de Restantes** | En fase de entrenamiento, muestra debilidades restantes |
| **Timer** | Cuenta regresiva en diagnóstico, cronómetro en entrenamiento |

### 5.3. Modales

1. **Modal de Transición:** Informa cuántas debilidades se detectaron
2. **Modal de Victoria:** Muestra estadísticas finales (debilidades iniciales, rondas, ayudas usadas)

---

## 6. Persistencia y Reportes

### 6.1. Datos en CSV

El modo adaptativo usa el mismo formato CSV que los otros modos:
- `game_mode: "ADAPTIVE"`
- Cada intento se registra normalmente

### 6.2. Estadísticas de Victoria

| Estadística | Descripción |
|-------------|-------------|
| `initial_weakness_count` | Cuántas debilidades se detectaron en diagnóstico |
| `training_rounds` | Cuántas vueltas le tomó limpiar la matriz |
| `help_used_count` | Cuántas veces se activó la ayuda visual |

---

## 7. Checklist de Implementación

- [x] Crear estados `DIAGNOSIS` y `TRAINING` en `adaptivePhase`
- [x] Timer de 30 segundos por operación en diagnóstico
- [x] Algoritmo de detección de debilidades (errores + lentos)
- [x] Modal de transición con conteo de debilidades
- [x] Filtrado visual de matriz (solo debilidades visibles)
- [x] Ayuda visual cíclica con audio (2s visible, 10s cooldown)
- [x] Desactivar inactividad en fase de entrenamiento
- [x] Modal de victoria con estadísticas
- [x] Sonido `baldora_sfx_hint.mp3` para ayuda visual
- [x] Limpieza de intervalos al cambiar de pantalla
