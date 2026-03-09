# Formato, Sintaxis y Ejemplos de Plantillas | Firebase AI Logic

> **Nota de Versión:** Los modelos Gemini 3 Pro & Flash, Gemini 3 Pro Image (nano banana pro) y los modelos nativos de audio Gemini Live ya están disponibles. Los modelos Gemini 2.0 Flash y Flash-Lite se retirarán el 3 de marzo de 2026.

---

## Introducción

Las plantillas de comandos del servidor (**Server Prompt Templates**) utilizan una sintaxis basada en **Dotprompt**. Se componen de dos partes principales:

1. **Frontmatter (YAML):** Configuración del modelo, validación de entrada y esquemas.
2. **Cuerpo:** El prompt propiamente dicho, con instrucciones de sistema, valores de entrada y lógica (Handlebars).

### Componentes Clave

| Componente | Descripción |
|------------|-------------|
| **Modelo** | Especificado en el frontmatter (ej. `model: 'gemini-2.5-flash'`) |
| **Roles** | Uso de `{{role "system"}}` y `{{role "user"}}` para guiar el comportamiento |
| **Variables** | Uso de `{{variableName}}` para datos dinámicos |

---

## 1. Ejemplos de Gemini

### Hello World

Una plantilla mínima para empezar.

**Configuración (Frontmatter):**
```yaml
model: 'gemini-2.5-flash'
```

**Prompt:**
```
Write a story about a magic backpack.
```

---

### Configuración del Modelo

Controla parámetros como temperatura y tokens máximos.

**Configuración (Frontmatter):**
```yaml
model: 'gemini-2.5-flash'
config:
  candidateCount: 1
  temperature: 0.9
  topP: 0.1
  topK: 16
  maxOutputTokens: 200
  stopSequences: ["red"]
```

---

### Configuración de Pensamiento (Thinking)

Para modelos que soportan razonamiento extendido.

**Para Gemini 3 (Niveles):**
```yaml
model: 'gemini-3-flash-preview'
config:
  thinkingConfig:
    thinkingLevel: medium
    includeThoughts: true
```

**Para Gemini 2.5 (Presupuesto/Budget):**
```yaml
model: 'gemini-2.5-flash'
config:
  thinkingConfig:
    thinkingBudget: 1024
    includeThoughts: true
```

---

## 2. Instrucciones de Sistema y Variables

### Instrucciones de Sistema

```handlebars
{{role "system"}}
All output must be a clearly structured invoice document.
Use a tabular or clearly delineated list format for line items.

{{role "user"}}
Create an example customer invoice for a customer.
```

---

### Flujos de Control (Loops y Condicionales)

Soporta `#if`, `else`, `#unless` y `#each`.

**Ejemplo de Prompt:**
```handlebars
Create an example customer invoice for a customer named {{customerName}}.

{{#each productNames}}
  {{#if @first}}
    Include line items for the following purchases:
  {{/if}}
  - {{this}}
{{/each}}

{{#if isVipCustomer}}
  Give the customer a 5% discount.
{{/if}}
```

---

## 3. Esquemas de Entrada y Salida

### Validación de Entrada (Input Schema)

Se recomienda definir esquemas para protegerse contra inyecciones de prompts.

**Frontmatter:**
```yaml
model: 'gemini-2.5-flash'
input:
  default:
    isVipCustomer: false
  schema:
    customerName: string, the customers name
    productNames?(array, list of products): string
    isVipCustomer?: boolean
```

---

### Esquema de Salida (Output Schema - JSON)

Fuerza al modelo a responder con un JSON estructurado.

**Frontmatter:**
```yaml
model: gemini-2.5-flash
output:
  format: json
  schema:
    invoiceId: string
    invoiceFile(object):
      url?: string
      contents: string
      mimeType: string
```

---

## 4. Entrada Multimodal

Permite incluir imágenes, PDFs, audio y video.

| Tipo | Sintaxis |
|------|----------|
| URL | `{{media url="http://..."}}` |
| Inline (Base64) | `{{media type="image/png" data="base64_string"}}` |

**Ejemplo de Prompt Comparativo:**
```handlebars
{{role "system"}}
Use the following image as the basis for comparisons:
{{media url="http://example.com/reference_img.bmp"}}

{{role "user"}}
What do the following images have in common?
{{#each image_urls}}
  {{media url=this}}
{{/each}}
```

---

## 5. Imagen (Generación de Imágenes)

### Básico

**Frontmatter:**
```yaml
model: 'imagen-4.0-generate-001'
input:
  schema:
    prompt: 'string'
```

**Prompt:**
```
Create an image containing {{prompt}}
```

---

### Avanzado (Configuración de Modelo)

**Frontmatter:**
```yaml
model: 'imagen-4.0-fast-generate-001'
config:
  sampleCount: 1
  aspectRatio: "16:9"
  personGeneration: dont_allow
  includeRaiReason: true
  safetySetting: block_medium_and_above
input:
  schema:
    style(enum): [photo, sketch, painting]
    subject: string
    context?: string
  default:
    style: photo
```

**Prompt:**
```handlebars
A {{style}} of {{subject}}{{#if context}} in {{context}}{{/if}}.
```

---

## 6. Ejemplo para Baldora (Plantilla `baldora`)

### Configuración Recomendada para Firebase Console

**Template ID:** `baldora`

**Frontmatter:**
```yaml
model: 'gemini-2.5-flash-lite'
config:
  temperature: 0.7
  maxOutputTokens: 2048
input:
  schema:
    csv_data: string, datos CSV con resultados del juego de multiplicaciones
```

**Prompt:**
```handlebars
{{role "system"}}
Actúa como un experto en aprendizaje acelerado y análisis de datos educativos. Tu objetivo es analizar resultados de ejercicios de multiplicaciones y generar un reporte pedagógico positivo y motivador.

Reglas de Tono y Formato:
1. TONO: Debe ser SIEMPRE positivo, pedagógico y motivador.
2. NO uses emoticones ni emojis.
3. Responde en español.
4. Sé conciso pero profundo.

{{role "user"}}
Examina mis resultados de multiplicaciones (adjuntos en CSV), generando un reporte que inicie con un diagnóstico ejecutivo de mi estado actual, comparando mi precisión y velocidad frente a estándares de maestría.

Datos del CSV:
{{csv_data}}

Continúa con observaciones detalladas que identifiquen la causa raíz de mis patrones de error, buscando 'cables cruzados' o fallos por velocidad para señalar mis tablas débiles, y concluye con un plan de acción práctico que incluya:
- Tres ejercicios breves de escritura y mnemotecnia
- Una rima para mi error más frecuente
- Una regla de oro mental para aplicar
```

---

*Última actualización: 2026-01-27 UTC. Basado en documentación oficial de Firebase AI Logic.*