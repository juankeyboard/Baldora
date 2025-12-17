# Documento Maestro de Ingeniería: Integración AI (Gemini 1.5 Flash)

| Campo | Valor |
|-------|-------|
| **Versión** | 1.6 (Enfoque en Escritura Manual) |
| **Fecha** | 17 de Diciembre, 2025 |
| **Proyecto** | Baldora |
| **Módulo** | AI Coach / Análisis Cognitivo |
| **Dependencias** | Google Generative AI SDK (o Fetch directo) |
| **Estado** | 📝 Especificación Técnica |

---

## 1. Visión General

Este módulo transforma el Dashboard en una experiencia de revelación de resultados.

Para evitar la sobrecarga cognitiva inmediata, el sistema **oculta las gráficas estadísticas** al finalizar la partida. En su lugar, presenta al personaje "Baldora" ofreciendo un análisis. El usuario debe activar este análisis para desbloquear sus estadísticas completas.

---

## 2. Flujo de Datos y UI (Máquina de Estados)

El componente de AI maneja **3 estados visuales** dentro del Dashboard:

### Estado IDLE (En espera)
- **Visible:** Personaje + Botón "Analizar mis Resultados"
- **Gráficas:** Ocultas (`display: none`)

### Estado LOADING (Analizando)
- **Visible:** Personaje + Animación de "Pensando..."
- **Gráficas:** Ocultas

### Estado SUCCESS (Resultado)
- **Visible:** Personaje + Burbuja de texto con el consejo
- **Gráficas:** Visibles (Se revelan en este momento)

---

## 3. Ingeniería del Prompt

Se ha refinado el prompt para garantizar un **tono pedagógico positivo** y un enfoque específico en la **escritura a mano** como herramienta de aprendizaje.

### Estructura del Prompt

```
Actúa como un experto en neuroeducación y memoria.
Analiza los siguientes datos de una sesión de entrenamiento de tablas de multiplicar:
[DATOS_CSV]

Instrucciones de Respuesta (Estrictas):
1. La respuesta debe tener EXACTAMENTE 3 párrafos cortos.
   - Párrafo 1: Resumen general del rendimiento.
   - Párrafo 2: Análisis específico de las fallas (si las hay).
   - Párrafo 3: Recomendaciones concretas de mejora, incluyendo obligatoriamente 
     ejercicios de escritura a mano alzada para reforzar la memoria.

Reglas de Tono y Formato:
1. TONO: Debe ser SIEMPRE positivo, pedagógico y motivador. Nunca uses lenguaje 
   negativo o crítico. Si hay errores, enfócalos como oportunidades de mejora 
   ("¡Casi lo tienes!", "Vamos a reforzar el 7", etc.).
2. NO uses emoticones ni emojis.
3. Responde en español.
```

---

## 4. Especificación de UI (Dashboard)

### 4.1. Estructura HTML

Insertar en `index.html` dentro de `#dashboard-view`. Es fundamental que el contenedor de gráficas tenga un ID para poder ocultarlo/mostrarlo.

```html
<!-- Contenedor del Análisis AI -->
<div id="ai-analysis-container" class="panel-base ai-panel">
    <div class="ai-header">
        <span class="ai-icon">🧠</span>
        <h3 class="ai-title">Entrenador Virtual</h3>
        <span class="ai-model-badge">Gemini 1.5 Flash</span>
    </div>
    
    <div class="ai-content-layout">
        <!-- COLUMNA IZQUIERDA: Personaje -->
        <div class="ai-character-col">
            <div class="character-avatar-wrapper">
                <img src="images/baldora_personaje.png" alt="Entrenador Baldora" class="ai-character-img">
            </div>
        </div>

        <!-- COLUMNA DERECHA: Estados Dinámicos -->
        <div class="ai-text-col">
            
            <!-- ESTADO 1: IDLE (Botón de Acción) -->
            <div id="ai-state-idle" class="ai-state-box">
                <p class="ai-prompt-text">¡Sesión finalizada! ¿Quieres que analice tu rendimiento y desbloquee tus gráficas?</p>
                <button onclick="GeminiService.triggerAnalysis()" class="btn-primary ai-action-btn">
                    ✨ Analizar mis Resultados
                </button>
            </div>

            <!-- ESTADO 2: LOADING -->
            <div id="ai-state-loading" class="ai-state-box" style="display: none;">
                <div class="pulse-ring"></div>
                <p class="ai-loading-text">Conectando sinapsis... Analizando patrones...</p>
            </div>
            
            <!-- ESTADO 3: SUCCESS (Respuesta) -->
            <div id="ai-state-success" class="ai-state-box" style="display: none;">
                <div id="ai-response-text" class="ai-text-bubble">
                    <!-- Respuesta inyectada aquí -->
                </div>
            </div>

        </div>
    </div>
</div>

<!-- IMPORTANTE: El contenedor de gráficas comienza OCULTO por CSS -->
<!-- Debe tener la clase 'charts-hidden' inicialmente -->
<div id="dashboard-charts-area" class="charts-grid charts-hidden">
    <!-- ... (Aquí van los canvas de las gráficas ya existentes) ... -->
</div>
```

### 4.2. Estilos CSS

Actualizar en `styles.css`:

```css
/* --- AI PANEL STYLES --- */
.ai-panel {
    background: linear-gradient(135deg, #fff 0%, #fdf2f8 100%);
    border: 2px solid var(--clr-rose-500);
    margin-bottom: var(--space-lg);
    min-height: 180px; /* Altura mínima para evitar saltos */
}

/* Ocultamiento de Gráficas */
.charts-grid.charts-hidden {
    display: none !important;
}

/* Animación de entrada para las gráficas cuando se revelan */
.charts-grid.charts-visible {
    display: grid !important;
    animation: slideUpFade 0.8s ease-out;
}

@keyframes slideUpFade {
    from { opacity: 0; transform: translateY(20px); }
    to { opacity: 1; transform: translateY(0); }
}

/* Botón de Acción AI */
.ai-action-btn {
    font-size: 0.9rem !important;
    padding: 10px 20px !important;
    margin-top: 10px;
    display: inline-flex;
    align-items: center;
    gap: 8px;
    box-shadow: 0 4px 15px rgba(209, 107, 165, 0.3);
}

.ai-prompt-text {
    color: var(--clr-rock-500);
    font-size: 1rem;
    margin-bottom: 5px;
}

/* Ajustes de Layout (Heredados de v1.2) */
.ai-content-layout { 
    display: flex; 
    gap: 20px; 
    align-items: flex-start; 
}

.ai-character-col { 
    flex-shrink: 0; 
}

.character-avatar-wrapper {
    width: 100px; 
    height: 100px; 
    border-radius: 50%;
    border: 3px solid var(--clr-rose-500);
    overflow: hidden;
    background: white;
}

.ai-character-img { 
    width: 100%; 
    height: 100%; 
    object-fit: cover; 
}

.ai-text-col { 
    flex-grow: 1; 
    padding-top: 10px; 
}

/* Burbuja de Texto Final */
.ai-text-bubble {
    background: rgba(255, 255, 255, 0.8);
    padding: 15px;
    border-radius: 0 15px 15px 15px;
    border: 1px dashed var(--clr-rose-500);
    font-family: var(--font-main);
    line-height: 1.5;
}

/* Loading */
.ai-loading-text { 
    font-style: italic; 
    color: var(--clr-rose-700); 
}

.pulse-ring { 
    width: 30px; 
    height: 30px; 
    border: 3px solid var(--clr-rose-500); 
    border-radius: 50%; 
    animation: pulse-ring 1.5s infinite; 
    margin: 0 auto 10px auto; 
}
```

---

## 5. Implementación Técnica (JavaScript)

### 5.1. GeminiService Actualizado

El servicio ahora envía el prompt con las restricciones de formato solicitadas.

```javascript
const GeminiService = {
    // ⚠️ Configurar en Firebase Hosting (No subir a Git)
    apiKey: 'TU_API_KEY_AQUI', 
    apiUrl: 'https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash:generateContent',

    // Método llamado por el botón "Analizar"
    async triggerAnalysis() {
        // 1. Cambiar a estado LOADING
        this.setUIState('loading');

        const sessionHistory = currentState.history;
        const csvData = this.formatDataForPrompt(sessionHistory);
        
        // PROMPT ESTRICTO
        const promptText = `
            Actúa como un experto en neuroeducación y memoria. 
            Analiza estos datos de entrenamiento: ${csvData}.
            
            Responde estrictamente con la siguiente estructura en 3 párrafos cortos:
            1. Párrafo general sobre el rendimiento.
            2. Párrafo analítico sobre las fallas específicas detectadas.
            3. Párrafo con consejos de mejora, incluyendo obligatoriamente 
               ejercicios de escritura a mano alzada para reforzar la memoria.
            
            Reglas de Tono:
            - Tono SIEMPRE positivo y motivador.
            - NO uses emoticones ni emojis.
            - Responde en español.
        `;

        try {
            const response = await fetch(`${this.apiUrl}?key=${this.apiKey}`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ 
                    contents: [{ parts: [{ text: promptText }] }] 
                })
            });

            const data = await response.json();
            
            if (!data.candidates || data.candidates.length === 0) {
                throw new Error("API Error");
            }

            const aiText = data.candidates[0].content.parts[0].text;
            
            // 2. Éxito: Mostrar texto y REVELAR GRÁFICAS
            this.showResult(aiText);
            
            // Guardar para PDF
            window.lastAIAnalysis = aiText; 

        } catch (error) {
            console.error('Error Gemini:', error);
            // 3. Error: Volver a estado IDLE (permitir reintentar)
            alert("Hubo un problema conectando con el entrenador. Intenta de nuevo.");
            this.setUIState('idle'); 
        }
    },

    // Manejo de Estados Visuales
    setUIState(state) {
        const idleDiv = document.getElementById('ai-state-idle');
        const loadingDiv = document.getElementById('ai-state-loading');
        const successDiv = document.getElementById('ai-state-success');
        
        // Ocultar todo primero
        idleDiv.style.display = 'none';
        loadingDiv.style.display = 'none';
        successDiv.style.display = 'none';

        if (state === 'idle') {
            idleDiv.style.display = 'block';
        } else if (state === 'loading') {
            loadingDiv.style.display = 'block';
        } else if (state === 'success') {
            successDiv.style.display = 'block';
        }
    },

    showResult(text) {
        // A. Mostrar Texto
        const textContainer = document.getElementById('ai-response-text');
        textContainer.innerText = text;
        this.setUIState('success');

        // B. REVELAR GRÁFICAS (La parte clave de la solicitud)
        const chartsArea = document.getElementById('dashboard-charts-area');
        if (chartsArea) {
            chartsArea.classList.remove('charts-hidden');
            chartsArea.classList.add('charts-visible');
            
            // Forzar repintado de gráficas si es necesario
            // window.dispatchEvent(new Event('resize')); 
        }
    },

    // Resetear para nueva partida
    reset() {
        this.setUIState('idle');
        const chartsArea = document.getElementById('dashboard-charts-area');
        if (chartsArea) {
            chartsArea.classList.add('charts-hidden');
            chartsArea.classList.remove('charts-visible');
        }
        document.getElementById('ai-response-text').innerText = '';
    },

    formatDataForPrompt(history) {
        const errors = history
            .filter(h => !h.isCorrect)
            .map(h => `${h.factorA}x${h.factorB}:ERROR`);
        return `Errores: [${errors.join(', ')}]`; 
    }
};
```

### 5.2. Modificación en App.js (endGame)

Ya no llamamos al análisis automáticamente. Solo reseteamos la vista.

```javascript
function endGame() {
    // ... lógica existente ...
    
    // Preparar UI de AI (Estado Idle + Ocultar Gráficas)
    GeminiService.reset();
    
    showView('DASHBOARD');
}
```

---

## 6. Diagrama de Flujo

```
┌─────────────────────────────────────────────────────────────────┐
│                      FIN DE PARTIDA                              │
└─────────────────────────────────────────────────────────────────┘
                              │
                              ▼
┌─────────────────────────────────────────────────────────────────┐
│  DASHBOARD - Estado IDLE                                         │
│  ┌──────────────────┐  ┌────────────────────────────────────┐  │
│  │  🎯 Personaje    │  │  "¿Quieres que analice tu          │  │
│  │     Baldora      │  │   rendimiento?"                    │  │
│  │                  │  │                                     │  │
│  └──────────────────┘  │  [✨ Analizar mis Resultados]      │  │
│                         └────────────────────────────────────┘  │
│                                                                  │
│  ┌──────────────────────────────────────────────────────────┐  │
│  │               GRÁFICAS OCULTAS                            │  │
│  └──────────────────────────────────────────────────────────┘  │
└─────────────────────────────────────────────────────────────────┘
                              │
                    Usuario hace clic
                              │
                              ▼
┌─────────────────────────────────────────────────────────────────┐
│  DASHBOARD - Estado LOADING                                      │
│  ┌──────────────────┐  ┌────────────────────────────────────┐  │
│  │  🎯 Personaje    │  │  ⏳ "Conectando sinapsis..."       │  │
│  │     Baldora      │  │                                     │  │
│  └──────────────────┘  └────────────────────────────────────┘  │
└─────────────────────────────────────────────────────────────────┘
                              │
                      API responde
                              │
                              ▼
┌─────────────────────────────────────────────────────────────────┐
│  DASHBOARD - Estado SUCCESS                                      │
│  ┌──────────────────┐  ┌────────────────────────────────────┐  │
│  │  🎯 Personaje    │  │  "Tu rendimiento fue excelente..." │  │
│  │     Baldora      │  │  "Para reforzar, escribe a mano..."│  │
│  └──────────────────┘  └────────────────────────────────────┘  │
│                                                                  │
│  ┌──────────────────────────────────────────────────────────┐  │
│  │          📊 GRÁFICAS REVELADAS (con animación)           │  │
│  │   ┌─────────┐  ┌─────────┐  ┌─────────┐  ┌─────────┐    │  │
│  │   │  Pie    │  │  Bar    │  │  Top    │  │  Hist   │    │  │
│  │   └─────────┘  └─────────┘  └─────────┘  └─────────┘    │  │
│  └──────────────────────────────────────────────────────────┘  │
└─────────────────────────────────────────────────────────────────┘
```

---

## 7. Notas de Seguridad

> ⚠️ **IMPORTANTE**: La API Key de Gemini **NO debe subirse a Git**.
> 
> Opciones seguras:
> 1. Usar variables de entorno en Firebase Hosting
> 2. Implementar un proxy en Cloud Functions
> 3. Usar Firebase App Check para proteger las llamadas

---

## 8. Checklist de Implementación

- [ ] Agregar HTML del contenedor AI en `index.html`
- [ ] Agregar estilos CSS en `styles.css`
- [ ] Crear archivo `js/gemini-service.js`
- [ ] Modificar `endGame()` en `app.js` para llamar a `GeminiService.reset()`
- [ ] Agregar imagen del personaje `images/baldora_personaje.png`
- [ ] Configurar API Key de forma segura
- [ ] Probar flujo completo: IDLE → LOADING → SUCCESS
- [ ] Verificar animación de revelación de gráficas
