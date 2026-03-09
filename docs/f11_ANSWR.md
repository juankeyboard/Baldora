# Implementación de Respuesta API y Visualización de Resultados

> **⚠️ NOTA IMPORTANTE:** La implementación de estas nuevas funcionalidades debe realizarse con estricto cuidado de NO alterar ni interrumpir las características actuales del proyecto. El código nuevo (HTML, CSS y JS) debe ser aditivo y modular.

## 1. Prompt de Consulta a la API (Actualizado)

Se debe estructurar el mensaje a la API para obtener 4 bloques de información narrativa fluida.

**Role: System**
```text
Actúa como un experto en aprendizaje acelerado y análisis de datos educativos. Tu objetivo es analizar resultados de ejercicios de multiplicaciones y generar un reporte pedagógico positivo y motivador, formateado EXCLUSIVAMENTE como un objeto JSON válido.

Reglas:
1. TONO: SIEMPRE positivo, pedagógico y motivador.
2. FORMATO: Texto corrido en párrafos simples. 
3. PROHIBIDO: Usar negritas (**texto**), viñetas, listas, dos puntos (:) para separar ideas o saltos de línea excesivos.
4. ESTRUCTURA: Redacta la respuesta narrativa en exactamente 4 párrafos fluidos (uno por cada clave del JSON).
5. FORMATO DE SALIDA: Entrega SOLAMENTE el objeto JSON crudo.

El JSON debe tener exactamente esta estructura:
{
  "resumen_general": "Párrafo narrativo describiendo el desempeño general, mencionando la operación más rápida, la más lenta y el promedio de velocidad y asertividad de forma integrada en el texto.",
  "patron_errores": "Párrafo narrativo con el diagnóstico de errores.",
  "plan_accion": "Párrafo narrativo con el plan de acción (ejercicios y mnemotecnias).",
  "sugerencia_entrenamiento": "Párrafo narrativo sugiriendo una configuración específica de Factores A (Filas) y Factores B (Columnas) para la próxima sesión, basándose en las debilidades detectadas."
}
```

**Role: User**
```text
Examina mis resultados de multiplicaciones en CSV:

[INSERTAR_DATOS_DE_LA_SESION_AQUI]

Genera el reporte JSON cumpliendo estrictamente con las reglas de formato (solo párrafos, sin negritas ni listas).
```

## 2. Estructura HTML

Se añaden 4 tarjetas dentro del contenedor de resultados.

```html
<div id="api-results-container" class="results-grid hidden">
  
  <!-- Bloque 1: Resumen General -->
  <div class="result-card blue-theme">
    <h3>📊 Resumen General</h3>
    <p id="res-general-text" class="result-text">Analizando...</p>
  </div>

  <!-- Bloque 2: Patrón de Errores -->
  <div class="result-card blue-theme">
    <h3>⚠️ Patrón de Errores</h3>
    <p id="res-patterns" class="result-text">Analizando...</p>
  </div>

  <!-- Bloque 3: Plan de Acción -->
  <div class="result-card blue-theme">
    <h3>🚀 Plan de Acción</h3>
    <p id="res-plan" class="result-text">Generando...</p>
  </div>

  <!-- Bloque 4: Sugerencia de Entrenamiento (NUEVO) -->
  <div class="result-card blue-theme">
    <h3>⚙️ Sugerencia de Entrenamiento</h3>
    <p id="res-training" class="result-text">Calculando configuración óptima...</p>
  </div>

</div>
```

## 3. Estilos CSS (Actualizado: Azul Suave)

Se cambia el amarillo por un tono azul suave (`#e3f2fd` o similar) y se eliminan estilos de negrita en los textos de resultado.

```css
/* Tema Azul Suave (Solicitado) */
.result-card.blue-theme {
    background-color: #e3f2fd; /* Azul muy suave */
    border-color: #bbdefb;
    color: var(--clr-ink-900);
}

.result-card h3 {
    color: var(--clr-sky-900); /* Azul más oscuro para títulos */
    border-bottom: 2px solid rgba(74, 144, 164, 0.2);
}

.result-text {
    font-size: 1rem;
    line-height: 1.6;
    color: var(--clr-ink-900);
    font-weight: 400; /* Asegurar que no haya negrita */
}
```

## 4. Lógica JS

Actualizar `renderApiResults` para manejar los 4 campos de texto plano.

```javascript
renderApiResults(data) {
    if (data.resumen_general) setText('res-general-text', data.resumen_general);
    if (data.patron_errores) setText('res-patterns', data.patron_errores);
    if (data.plan_accion) setText('res-plan', data.plan_accion);
    if (data.sugerencia_entrenamiento) setText('res-training', data.sugerencia_entrenamiento);
}
```
