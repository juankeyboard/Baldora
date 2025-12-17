# Documento Maestro de Ingeniería: Sistema de Exportación de Resultados

| **Campo** | **Valor** |
|-----------|-----------|
| **Versión** | 2.1 (Final - Layout Carta + Modal Selección) |
| **Fecha** | 17 de Diciembre, 2025 |
| **Proyecto** | Baldora |
| **Módulo** | Analíticas / Reportes |
| **Dependencias** | html2pdf.js |
| **Estado** | 📝 Especificación Técnica |

---

## 1. Visión General

Este módulo expande la capacidad de análisis del juego permitiendo al usuario exportar sus resultados finales. Se reemplaza la descarga directa por un flujo de decisión mediante una ventana modal central.

### Flujo de Usuario (UX)

1. **Dashboard**: El usuario termina la sesión y visualiza sus gráficas en pantalla.
2. **Clic**: Presiona el botón renombrado "Descargar Resultados".
3. **Decisión**: Se abre una ventana modal en el centro de la pantalla.
4. **Selección**: El usuario elige entre CSV (Datos crudos) o PDF (Reporte visual ejecutivo con análisis AI).

---

## 2. Especificación de UI: El Modal de Selección

Este componente actúa como distribuidor de tráfico. Debe ser consistente con el sistema de diseño "Acuarela Digital" (Main_doc_f3.md).

### 2.1. Diseño del Modal

| Elemento | Especificación |
|----------|----------------|
| **Título** | "Descargar Resultados" (Fuente Oswald, Color Rose-500) |
| **Disposición** | Grid de 2 columnas (Botón PDF a la izquierda, CSV a la derecha) |
| **Estilo Botones** | Botones grandes (Cards clickeables), rectangulares verticales |

### 2.2. Opciones de Exportación

| Atributo | Opción A: Reporte PDF | Opción B: Datos CSV |
|----------|----------------------|---------------------|
| **Icono** | 📄 (Documento) | 📊 (Gráfica) |
| **Texto Principal** | "Reporte Visual" | "Datos CSV" |
| **Subtexto** | "PDF tamaño carta con gráficas y análisis de IA." | "Formato hoja de cálculo para análisis propio." |
| **Acción** | Genera PDF visual | Descarga archivo .csv |
| **Estilo** | btn-primary (Destacado) | btn-secondary (Neutro) |

---

## 3. Especificación del Reporte PDF (Layout Estricto)

El PDF se genera renderizando un contenedor HTML oculto (`#pdf-wrapper`) con dimensiones fijas para asegurar que todo quepa en una sola hoja sin desbordes.

### 3.1. Configuración de Hoja

| Parámetro | Valor |
|-----------|-------|
| **Formato** | Carta (Letter) |
| **Dimensiones** | 215.9mm x 279.4mm |
| **Márgenes** | 15mm internos (padding del contenedor) |
| **Fondo** | baldora_background.png con Opacidad 9% (Marca de agua sutil) |

### 3.2. Estructura de Contenido (De arriba a abajo)

1. **Cabecera**: Logo del menú y Título "Analíticas de Sesión".
2. **Métricas**: Fila horizontal con Jugador, Fecha, Modo y Puntaje.
3. **Análisis AI**: Bloque destacado para el comentario del entrenador virtual (Simulado o generado).
4. **Gráficas**: Grid 2x2 compacto con las 4 gráficas del dashboard (Performance, Críticas, Errores, Velocidad).
5. **Pie de Página**: Footer Institucional idéntico al sitio web (JCG Games + Instagram).

---

## 4. Implementación Técnica

### 4.1. Librería Requerida

Agregar en `index.html` (antes de cerrar el body):

```html
<script src="https://cdnjs.cloudflare.com/ajax/libs/html2pdf.js/0.10.1/html2pdf.bundle.min.js"></script>
```

### 4.2. HTML: Estructura del Modal y Plantilla Oculta

Agregar al final del body en `index.html`.

```html
<!-- 1. MODAL DE SELECCIÓN (La ventana central visible) -->
<div id="modal-export" class="modal-overlay">
    <div class="modal-content panel-base" style="text-align: center; max-width: 550px;">
        <h2 style="font-family: var(--font-display); color: var(--clr-rose-500); margin-bottom: 10px;">
            Descargar Resultados
        </h2>
        <p style="margin-bottom: 25px; color: var(--clr-rock-500);">
            Elige el formato de tu reporte:
        </p>
        
        <!-- Grid de Botones de Selección -->
        <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 20px; margin-bottom: 30px;">
            
            <!-- OPCIÓN 1: PDF -->
            <button onclick="ExportManager.downloadPDF()" class="btn-primary" 
                    style="display: flex; flex-direction: column; align-items: center; justify-content: center; gap: 10px; padding: 30px 20px; height: auto;">
                <span style="font-size: 2.5rem;">📄</span>
                <span style="font-size: 1.1rem; font-weight: 800;">Reporte PDF</span>
                <span style="font-size: 0.8rem; opacity: 0.9; font-weight: normal;">Con gráficas y análisis</span>
            </button>

            <!-- OPCIÓN 2: CSV -->
            <button onclick="ExportManager.downloadCSV()" class="btn-secondary" 
                    style="display: flex; flex-direction: column; align-items: center; justify-content: center; gap: 10px; padding: 30px 20px; height: auto;">
                <span style="font-size: 2.5rem;">📊</span>
                <span style="font-size: 1.1rem; font-weight: 800;">Datos CSV</span>
                <span style="font-size: 0.8rem; opacity: 0.9; font-weight: normal;">Para Excel / Datos crudos</span>
            </button>
        </div>

        <button onclick="closeModal('modal-export')" style="background: none; border: none; text-decoration: underline; cursor: pointer; color: var(--clr-rock-500);">
            Cancelar y volver
        </button>
    </div>
</div>

<!-- 2. PLANTILLA OCULTA PARA PDF (Strict Letter Layout) -->
<!-- Posicionada fuera de la pantalla para que el usuario no la vea, pero el JS pueda capturarla -->
<div id="pdf-wrapper" style="position: absolute; left: -9999px; top: 0;">
    <div id="pdf-template" class="pdf-letter-container">
        
        <!-- HEADER -->
        <header class="pdf-header">
            <!-- Usa imagen local para evitar problemas de CORS en PDF -->
            <img src="images/logo_menu.png" alt="Baldora Logo" class="pdf-logo">
            <div class="header-text">
                <h1 class="pdf-title">Analíticas de Sesión</h1>
                <p class="pdf-subtitle">Reporte de Rendimiento Aritmético</p>
            </div>
        </header>

        <!-- MÉTRICAS -->
        <section class="pdf-metrics-bar">
            <div class="metric-item"><span class="label">JUGADOR</span><span class="value" id="pdf-nick">--</span></div>
            <div class="metric-item"><span class="label">FECHA</span><span class="value" id="pdf-date">--</span></div>
            <div class="metric-item"><span class="label">MODO</span><span class="value" id="pdf-mode">--</span></div>
            <div class="metric-item"><span class="label">ACIERTOS</span><span class="value" id="pdf-score">--</span></div>
        </section>

        <!-- INSIGHT IA (Contenido dinámico) -->
        <section class="pdf-ai-insight">
            <div class="ai-icon-box">🧠</div>
            <div class="ai-content">
                <h3 class="ai-title">Análisis de Entrenador Virtual</h3>
                <p id="pdf-ai-comment" class="ai-text">Generando análisis...</p>
            </div>
        </section>

        <!-- GRÁFICAS (Grid 2x2) -->
        <section class="pdf-charts-area">
            <div class="chart-wrapper"><h4>Rendimiento</h4><div id="slot-chart-1" class="img-slot"></div></div>
            <div class="chart-wrapper"><h4>Tablas Críticas</h4><div id="slot-chart-2" class="img-slot"></div></div>
            <div class="chart-wrapper"><h4>Top Errores</h4><div id="slot-chart-3" class="img-slot"></div></div>
            <div class="chart-wrapper"><h4>Velocidad</h4><div id="slot-chart-4" class="img-slot"></div></div>
        </section>

        <!-- FOOTER -->
        <footer class="pdf-footer">
            <div class="footer-left">
                <img src="images/jcg_logo.png" class="footer-logo"> <span>JCG Games</span>
            </div>
            <div class="footer-center"><small>Generado por Baldora Math Engine</small></div>
            <div class="footer-right">
                <img src="images/icon_instagram_black.png" class="footer-social-icon"> <span>@baldoragame</span>
            </div>
        </footer>
    </div>
</div>
```

### 4.3. Estilos CSS (Strict Layout & Branding)

Agregar a `styles.css`. Estas reglas aseguran que el PDF tenga exactamente el tamaño de una hoja carta y que los elementos no se desborden.

```css
/* --- PDF LETTER LAYOUT --- */
.pdf-letter-container {
    width: 215.9mm; 
    height: 279.4mm; /* Carta Exacto */
    padding: 15mm;
    background-color: white;
    position: relative;
    font-family: var(--font-main);
    color: var(--clr-ink-900);
    box-sizing: border-box;
    display: flex; 
    flex-direction: column; 
    gap: 15px;
    overflow: hidden; /* CRÍTICO: Corta cualquier desborde */
}

/* Marca de Agua 9% Opacidad */
.pdf-letter-container::before {
    content: ''; 
    position: absolute; 
    inset: 0;
    background-image: url('../images/baldora_background.png');
    background-size: cover; 
    opacity: 0.09; /* Transparencia exacta solicitada */
    z-index: 0; 
    pointer-events: none;
}

/* Elevar contenido sobre la marca de agua */
.pdf-letter-container > * { position: relative; z-index: 1; }

/* --- Componentes Internos del PDF --- */

/* Header */
.pdf-header { display: flex; align-items: center; gap: 20px; border-bottom: 2px solid var(--clr-rose-500); padding-bottom: 10px; }
.pdf-logo { height: 50px; }
.pdf-title { font-family: var(--font-display); color: var(--clr-rose-500); font-size: 1.8rem; margin: 0; line-height: 1; }
.pdf-subtitle { margin: 0; color: var(--clr-rock-500); font-size: 0.9rem; }

/* Barra de Métricas */
.pdf-metrics-bar { display: flex; justify-content: space-between; background: #f0f0f0; padding: 10px 20px; border-radius: 8px; font-size: 0.9rem; }
.metric-item { display: flex; flex-direction: column; }
.metric-item .label { font-size: 0.7rem; color: var(--clr-rock-500); font-weight: bold; }
.metric-item .value { font-weight: 800; font-size: 1.1rem; }

/* Caja de Análisis AI */
.pdf-ai-insight { display: flex; gap: 15px; background: rgba(209, 107, 165, 0.1); border: 1px solid var(--clr-rose-500); border-radius: 12px; padding: 15px; min-height: 70px; }
.ai-title { margin: 0 0 5px 0; font-size: 1rem; color: var(--clr-rose-700); font-weight: 800; }
.ai-text { margin: 0; font-size: 0.9rem; line-height: 1.3; font-style: italic; }
.ai-icon-box { font-size: 1.5rem; display: flex; align-items: center; }

/* Gráficas (Núcleo Visual) */
.pdf-charts-area { display: grid; grid-template-columns: 1fr 1fr; grid-template-rows: 1fr 1fr; gap: 15px; flex-grow: 1; min-height: 0; }
.chart-wrapper { border: 1px solid var(--clr-sand-300); border-radius: 8px; padding: 8px; display: flex; flex-direction: column; background: rgba(255,255,255,0.8); }
.chart-wrapper h4 { margin: 0 0 5px 0; font-size: 0.8rem; text-align: center; color: var(--clr-rock-500); font-family: var(--font-display); }
/* Ajuste de imagen para evitar desproporción */
.img-slot { flex-grow: 1; display: flex; align-items: center; justify-content: center; overflow: hidden; }
.img-slot img { max-width: 100%; max-height: 140px; object-fit: contain; }

/* Footer */
.pdf-footer { border-top: 1px solid var(--clr-sand-300); padding-top: 10px; display: flex; justify-content: space-between; align-items: center; font-size: 0.75rem; color: var(--clr-rock-500); }
.footer-logo, .footer-social-icon { height: 16px; margin-right: 5px; vertical-align: middle; }
```

### 4.4. Lógica JavaScript (js/exportManager.js)

Crear este objeto o integrarlo en `app.js`.

```javascript
const ExportManager = {
    // 1. Abrir Modal (Conectado al botón "Descargar Resultados")
    openModal() {
        document.getElementById('modal-export').classList.add('active');
    },

    // 2. Opción CSV (Lógica existente)
    downloadCSV() {
        if (typeof generateCSV === 'function') generateCSV(); 
        closeModal('modal-export');
    },

    // 3. Opción PDF (Lógica nueva)
    async downloadPDF() {
        // A. Poblar Datos de Sesión
        document.getElementById('pdf-nick').innerText = currentState.nickname || "Invitado";
        document.getElementById('pdf-date').innerText = new Date().toLocaleDateString();
        document.getElementById('pdf-mode').innerText = (currentState.mode || "Modo Libre").toUpperCase();
        
        const total = currentState.history.length;
        const correct = currentState.history.filter(h => h.isCorrect).length;
        document.getElementById('pdf-score').innerText = `${correct} / ${total}`;

        // B. Inyectar AI (Placeholder o función real)
        const aiText = typeof getAIAnalysis === 'function' 
            ? getAIAnalysis() 
            : "¡Gran trabajo! Mantén el ritmo en tus sesiones diarias para dominar las tablas altas.";
        document.getElementById('pdf-ai-comment').innerText = `"${aiText}"`;

        // C. Clonar Gráficas (Canvas -> Imagen)
        // IDs de los canvas originales del Dashboard
        const chartIDs = ['chart-performance', 'chart-critical', 'chart-errors', 'chart-speed'];
        // IDs de los contenedores en el PDF
        const slotIDs = ['slot-chart-1', 'slot-chart-2', 'slot-chart-3', 'slot-chart-4'];
        
        chartIDs.forEach((id, i) => {
            const canvas = document.getElementById(id);
            const slot = document.getElementById(slotIDs[i]);
            if (canvas && slot) {
                // Convertir a imagen de alta calidad
                const img = new Image();
                img.src = canvas.toDataURL('image/png', 1.0);
                slot.innerHTML = ''; // Limpiar slot previo
                slot.appendChild(img);
            }
        });

        // D. Configurar y Generar
        // Seleccionamos el contenedor interno 'pdf-template', no el wrapper
        const element = document.getElementById('pdf-template');
        
        const opt = {
            margin: 0, // Márgenes ya definidos en CSS (padding)
            filename: `Baldora_Reporte_${currentState.nickname}_${Date.now()}.pdf`,
            image: { type: 'jpeg', quality: 0.98 },
            html2canvas: { 
                scale: 2, // Doble resolución para nitidez (Retina)
                useCORS: true, // Permitir imágenes locales/externas
                letterRendering: true 
            },
            jsPDF: { unit: 'mm', format: 'letter', orientation: 'portrait' }
        };

        try {
            // Mostrar un indicador de carga si se desea...
            await html2pdf().set(opt).from(element).save();
        } catch (e) { 
            console.error("Error PDF:", e);
            alert("Error generando el reporte. Verifique la consola.");
        }
        
        closeModal('modal-export');
    }
};
```

---

## 5. Checklist de Integración

- [ ] **Dependencia**: Verificar que el script de html2pdf esté cargado.
- [ ] **Assets**: Asegurar que `logo_menu.png`, `jcg_logo.png` y `icon_instagram_black.png` existan en la carpeta `/images`.
- [ ] **HTML**: Copiar el bloque del modal y el bloque del template oculto al `index.html`.
- [ ] **CSS**: Copiar los estilos PDF al `styles.css`.
- [ ] **JS**: Implementar ExportManager y conectar el botón del dashboard a `ExportManager.openModal()`.
- [ ] **Prueba**: Verificar que el PDF generado se vea nítido, encaje en una hoja y tenga la transparencia correcta.