# Documento Maestro de Ingenieria: Fase 3 - Modo Entrenamiento Adaptativo

**Proyecto:** Fast Math Game (Feature Expansion)  
**Fecha:** 10 de Diciembre, 2025  
**Dependencias:** Requiere la implementacion de la Fase 1 (Core) y Fase 2 (Auth/Data).

---

## Objetivo

Implementar un sistema de aprendizaje inteligente que detecta debilidades y personaliza la matriz de juego.

---

## 1. Descripcion del Feature

El **Modo Entrenamiento Adaptativo** es una tercera modalidad de juego seleccionable desde el menu principal. A diferencia de los modos "Contrarreloj" o "Libre", este modo no busca completar la matriz una sola vez, sino **purificar el conocimiento** del usuario mediante un proceso de *Filtrado y Repeticion*.

### Flujo de Fases

El flujo se divide en dos fases secuenciales:

1. **Fase de Diagnostico (Test):** Barrido completo de operaciones seleccionadas.
2. **Fase de Entrenamiento (Loop):** Repeticion aislada de errores y respuestas lentas hasta lograr la maestria (100% efectividad).

---

## 2. Reglas de Negocio Especificas

### 2.1. Restriccion de Inactividad

| Aspecto | Descripcion |
|---------|-------------|
| **Fase Diagnostico** | El "Kill Switch" de 30 segundos esta ACTIVO y el timer es en cuenta regresiva |
| **Fase Entrenamiento** | El "Kill Switch" de 30 segundos esta **DESACTIVADO** |
| **Razon** | Durante el entrenamiento, el usuario puede necesitar mas tiempo para pensar y aprender |

### 2.2. Temporizador en Modo Adaptativo

| Fase | Comportamiento del Timer |
|------|--------------------------|
| **Fase Diagnostico** | Timer cuenta y se visualiza en cuenta regresiva de **30 segundos** por cada operación, si se agota el tiempo pasa a otra operación |
| **Fase Entrenamiento** | Timer cuenta hacia arriba (cronometro) sin limite |
| **Si se agota el tiempo** | En fase diagnostico, se pasa a otra operación hasta terminar de ver todas las operaciones y mostrar resultados parciales |
| **Razon** | La presion del tiempo durante el diagnostico ayuda a detectar debilidades reales bajo estres cognitivo |

### 2.2. Criterios de Seleccion de "Debilidades"

Al finalizar la Fase de Test, el sistema clasifica una operacion como **"Objetivo de Entrenamiento"** si cumple cualquiera de estas dos condiciones:

- **Error de Precision:** El resultado ingresado fue incorrecto (`isCorrect === false`)
- **Lentitud Cognitiva:** El tiempo de respuesta (`rt`) de esa operacion especifica fue superior a la media de la sesion + un umbral de tolerancia

#### Formula del Umbral

```
Threshold = Avg_Session_Time + (Avg_Session_Time * 0.20)
```

> **Ejemplo:** Si el usuario promedia 2000ms, cualquier respuesta sobre 2400ms se marca para revision, aunque sea correcta.

### 2.3. Seleccion de Tablas a Entrenar

El modo adaptativo permite al usuario **seleccionar que tablas desea practicar** antes de iniciar el diagnostico:

| Aspecto | Descripcion |
|---------|-------------|
| **Selector de Tablas** | El mismo grid de seleccion (1-15) disponible en los otros modos |
| **Por defecto** | Todas las tablas seleccionadas (matriz completa 15x15) |
| **Minimo** | Al menos 1 tabla debe estar seleccionada |
| **Operaciones generadas** | Solo las filas correspondientes a las tablas seleccionadas |

> **Beneficio:** Permite al usuario enfocarse en tablas especificas donde sabe que tiene debilidades.

### 2.4. Inicio del Protocolo de Entrenamiento

El protocolo de entrenamiento **solo inicia** cuando se cumple la siguiente condicion:

| Requisito | Descripcion |
|-----------|-------------|
| **Condicion** | El usuario debe responder **al menos una vez** todas las operaciones seleccionadas |
| **Verificacion** | `sessionMetrics.length >= totalSelectedOperations` |
| **Resultado** | Se calcula el promedio y umbral, luego se genera la `trainingQueue` |

### 2.5. Herramienta de Ayuda Visual (Solo en Entrenamiento)

Durante la Fase de Entrenamiento, se activa una **ayuda visual automatica**:

| Aspecto | Descripcion |
|---------|-------------|
| **Activacion** | Cuando el tiempo de respuesta actual supera el tiempo promedio de la sesion de diagnostico |
| **Accion** | Se muestra el resultado correcto de la operacion en la celda de la matriz |
| **Duracion** | La ayuda se muestra por **2 segundos** cada 10 segundos |
| **Despues** | La operacion vuelve a presentarse para que el usuario la responda |
| **Objetivo** | Reforzar el aprendizaje mediante visualizacion antes de requerir la respuesta |

#### Flujo de la Ayuda Visual

```
1. Usuario ve operacion (ej: 7 x 8)
2. Tiempo transcurrido > avgTime de diagnostico
3. Sistema muestra "56" en la celda de la matriz (2 segundos)
4. Sistema oculta la ayuda
5. Usuario debe responder la operacion
```

---

## 3. Especificaciones Tecnicas del Flujo

### 3.1. Fase 1: El Diagnostico (Full Grid)

| Paso | Descripcion |
|------|-------------|
| **Inicializacion** | Se carga la matriz con las operaciones seleccionadas |
| **Gameplay** | El usuario debe resolver todas las operaciones. El orden es aleatorio |
| **Feedback Visual** | Durante el test, se muestra feedback minimo (verde/rojo) sin detener el avance |
| **Recoleccion de Datos** | Se crea un array temporal `sessionMetrics` con `{ row, col, isCorrect, responseTime }` |
| **Inactividad** | El timer de 30 segundos esta ACTIVO |

### 3.2. Transicion: El Algoritmo de Filtrado

Al completar todas las operaciones seleccionadas:

1. El sistema calcula el `Avg_Session_Time`
2. El sistema itera sobre `sessionMetrics`
3. Genera un nuevo array: `trainingQueue`
4. Guarda el `avgTime` para usarlo como umbral de ayuda visual

**Efecto Visual (UI):** La matriz visual se "limpia". Las celdas dominadas se atenuan, dejando visibles solo las celdas problematicas.

### 3.3. Fase 2: El Bucle de Entrenamiento (Shrinking Matrix)

Esta fase es **iterativa**:

- **Operaciones:** El usuario juega solo las operaciones en `trainingQueue`
- **Ayuda Visual:** Si supera el `avgTime`, se muestra el resultado por 2 segundos
- **Evaluacion:**
  - Si acierta -> La operacion se elimina de la cola
  - Si falla -> La operacion se mantiene en la cola
- **Inactividad:** El timer de 30 segundos esta **DESACTIVADO**
- **Condicion de Victoria:** Cuando `trainingQueue.length === 0`

---

## 4. Algoritmos y Pseudocodigo

### 4.1. Logica de Seleccion de Objetivos

```javascript
function generateTrainingSet(fullSessionData) {
    // 1. Calcular promedio de tiempo de la sesion de prueba
    const totalTime = fullSessionData.reduce((acc, curr) => acc + curr.responseTime, 0);
    const avgTime = totalTime / fullSessionData.length;
    
    // 2. Definir umbral de lentitud (20% mas lento que el promedio)
    const speedThreshold = avgTime * 1.2;

    // 3. Filtrar operaciones problema
    const trainingSet = fullSessionData.filter(op => {
        const isWrong = !op.isCorrect;
        const isSlow = op.responseTime > speedThreshold;
        return isWrong || isSlow;
    });

    return {
        queue: trainingSet,
        stats: { avgTime, threshold: speedThreshold }
    };
}
```

### 4.2. Logica de Ayuda Visual

```javascript
function checkVisualHelp(operationStartTime, avgDiagnosisTime) {
    const elapsed = Date.now() - operationStartTime;
    
    if (elapsed > avgDiagnosisTime && !helpShown) {
        // Mostrar resultado en la celda
        showAnswerInCell(currentOperation);
        helpShown = true;
        
        // Ocultar despues de 2 segundos
        setTimeout(() => {
            hideAnswerFromCell(currentOperation);
        }, 2000);
    }
}
```

### 4.3. Logica de Reduccion (Fase Entrenamiento)

```javascript
function processTrainingAnswer(operation, isCorrect) {
    if (isCorrect) {
        // Se "cura" la celda, sale de la matriz
        trainingQueue = trainingQueue.filter(op => 
            !(op.row === operation.row && op.col === operation.col)
        );
        markCellMastered(operation);
    }
    // Si falla, la operacion permanece en la cola
    
    if (trainingQueue.length === 0) {
        triggerVictory();
    } else {
        loadNextTrainingOperation();
    }
}
```

---

## 5. Interfaz de Usuario (UI) y Feedback

### 5.1. Selector de Modo

En el menu principal se muestra un tercer boton:

```
[Button] MODO ADAPTATIVO
Icono: Cerebro
Descripcion: "Entrena debilidades"
```

### 5.2. Panel de Juego (Adaptaciones)

| Elemento | Descripcion |
|----------|-------------|
| **Indicador de Fase** | Badge que muestra "Fase Diagnostico" o "Fase Entrenamiento" |
| **Barra de Progreso** | Muestra "Operacion X / Total" |
| **Transicion** | Modal que informa cuantas debilidades se detectaron |
| **Contador de Restantes** | En fase de entrenamiento, muestra debilidades restantes |
| **Ayuda Visual** | La celda de la matriz muestra el resultado cuando se activa |

### 5.3. Ayuda Visual en la Matriz

| Estado | Apariencia |
|--------|------------|
| **Normal** | Celda muestra "7x8" (la operacion) |
| **Ayuda Activa** | Celda muestra "56" con efecto de pulso/brillo |
| **Despues de Ayuda** | Vuelve a mostrar "7x8" |

---

## 6. Persistencia y Reportes

### 6.1. Guardado en Base de Datos

Este modo genera un tipo de reporte especial:

- Flag: `type: "ADAPTIVE_TRAINING"`
- `initial_error_count`: Cuantas fallo en el test
- `rounds_to_complete`: Cuantas vueltas le tomo limpiar la matriz
- `help_used_count`: Cuantas veces se activo la ayuda visual

---

## 7. Plan de Implementacion

| Paso | Tarea |
|------|-------|
| 1 | Actualizar `app.js`: Crear estados `PLAYING_DIAGNOSIS` y `PLAYING_TRAINING` |
| 2 | Modificar `grid.js`: Agregar metodo `showAnswerInCell()` para ayuda visual |
| 3 | Implementar timer de ayuda visual con setTimeout de 2 segundos |
| 4 | Desactivar `inactivityTimer` durante fase de entrenamiento |
| 5 | Agregar contador de usos de ayuda visual para estadisticas |
