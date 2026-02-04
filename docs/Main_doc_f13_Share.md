# Feature 13: Compartir Resultados en Redes Sociales

## 📋 Descripción General

Esta funcionalidad permite a los usuarios generar y compartir una imagen atractiva de sus resultados de juego en redes sociales (principalmente Instagram). La imagen se genera dinámicamente utilizando Canvas HTML5, combinando una plantilla de fondo con estadísticas del jugador.

---

## 🎯 Objetivo

Crear un botón "Instagram" en la sección de descarga de resultados que genere una imagen compartible con las estadísticas de la partida completada.

---

## 📐 Especificaciones de Diseño

### 1. Botón de Compartir

**Ubicación:**
- Dentro del modal de "Descargar Resultados"
- Al mismo nivel que los botones existentes: "Reporte PDF" y "Datos CSV"

**Estilo:**
- Mantener la misma estructura y estilo visual que los botones PDF y CSV
- Color de fondo: Similar al tema de la aplicación
- Icono: Alusivo a redes sociales (Instagram/compartir)
- Text: "Instagram" o "Compartir"
- Efectos hover: Consistentes con los demás botones de descarga

### 2. Plantilla de Imagen

**Especificaciones:**
- **Nombre del archivo:** `Baldora_share.png`
- **Ubicación:** `/assets/` o `/images/`
- **Dimensiones:** 1920px (ancho) × 1080px (alto)
- **Formato:** PNG con transparencia (si es necesario)
- **Uso:** Imagen de fondo sobre la cual se renderizarán las estadísticas

### 3. Datos a Mostrar

La imagen generada debe incluir los siguientes cuatro datos estadísticos:

1. **Operaciones** 
   - Total de operaciones completadas
   - Icono: 🎯 (o el icono actual usado en resultados)

2. **Correctas**
   - Número de respuestas correctas
   - Icono: ✓ (o el icono actual usado en resultados)

3. **Tiempo Promedio**
   - Promedio de tiempo por operación
   - Icono: ⏱️ (o el icono actual usado en resultados)
   - Formato: "X.X segundos"

4. **Precisión**
   - Porcentaje de precisión
   - Icono: 📊 (o el icono actual usado en resultados)
   - Formato: "XX%"

### 4. Estética de los Contenedores de Datos

**Diseño:**
- Contenedores más pequeños que los mostrados en la pantalla de resultados final
- **Bordes redondeados** (border-radius considerablemente mayor)
- Mantener la paleta de colores actual de la aplicación
- Incluir los mismos iconos que se muestran en la pantalla de resultados
- Diseño compacto y visualmente atractivo para redes sociales

**Distribución:**
- Disposición armoniosa sobre la plantilla (puede ser en grid 2×2, en fila, etc.)
- Posicionamiento que no interfiera con elementos importantes de la plantilla de fondo
- Espaciado uniforme entre elementos

---

## 🛠️ Implementación Técnica

### Archivos a Modificar/Crear

1. **HTML (`index.html`)**
   - Agregar botón "Instagram" en el modal de descarga
   - Mantener la estructura existente del modal

2. **CSS (`css/styles.css`)**
   - Estilos para el nuevo botón de compartir
   - Asegurar consistencia visual con botones PDF y CSV

3. **JavaScript (nuevo archivo o `js/main.js`)**
   - Función para generar la imagen usando Canvas API
   - Lógica para renderizar estadísticas sobre la plantilla
   - Función para descargar la imagen generada

4. **Assets**
   - Agregar `Baldora_share.png` en la carpeta de recursos

### Tecnologías a Utilizar

1. **Canvas HTML5**
   - Para renderizar la imagen de fondo
   - Para dibujar texto y contenedores sobre la plantilla
   - Para exportar el resultado final

2. **Context 2D API**
   - `drawImage()`: Para cargar la plantilla de fondo
   - `fillRect()` y `strokeRect()`: Para crear contenedores
   - `fillText()`: Para renderizar texto
   - `font`, `fillStyle`, `textAlign`: Para estilizar texto

### Pseudocódigo de Implementación

```javascript
// Función principal para generar imagen compartible
async function generateShareImage() {
    // 1. Crear elemento canvas
    const canvas = document.createElement('canvas');
    canvas.width = 1920;
    canvas.height = 1080;
    const ctx = canvas.getContext('2d');
    
    // 2. Cargar imagen de plantilla
    const backgroundImage = new Image();
    backgroundImage.src = 'assets/Baldora_share.png';
    
    await new Promise((resolve) => {
        backgroundImage.onload = resolve;
    });
    
    // 3. Dibujar plantilla de fondo
    ctx.drawImage(backgroundImage, 0, 0, 1920, 1080);
    
    // 4. Obtener estadísticas del juego
    const stats = {
        operations: gameState.totalQuestions,
        correct: gameState.correctAnswers,
        avgTime: (gameState.totalTime / gameState.totalQuestions).toFixed(1),
        accuracy: ((gameState.correctAnswers / gameState.totalQuestions) * 100).toFixed(0)
    };
    
    // 5. Definir posiciones y estilos para los contenedores
    const containerStyle = {
        width: 280,
        height: 120,
        borderRadius: 20,
        backgroundColor: 'rgba(255, 255, 255, 0.9)',
        padding: 15
    };
    
    // 6. Renderizar cada estadística en su contenedor
    drawStatContainer(ctx, stats.operations, 'Operaciones', x1, y1);
    drawStatContainer(ctx, stats.correct, 'Correctas', x2, y2);
    drawStatContainer(ctx, stats.avgTime + 's', 'Tiempo Promedio', x3, y3);
    drawStatContainer(ctx, stats.accuracy + '%', 'Precisión', x4, y4);
    
    // 7. Convertir canvas a blob y descargar
    canvas.toBlob((blob) => {
        const url = URL.createObjectURL(blob);
        const link = document.createElement('a');
        link.download = 'FastMath_Resultados.png';
        link.href = url;
        link.click();
        URL.revokeObjectURL(url);
    }, 'image/png');
}

// Función auxiliar para dibujar contenedor de estadística
function drawStatContainer(ctx, value, label, x, y) {
    // Dibujar contenedor con borde redondeado
    ctx.fillStyle = 'rgba(255, 255, 255, 0.9)';
    roundRect(ctx, x, y, width, height, borderRadius);
    ctx.fill();
    
    // Agregar borde
    ctx.strokeStyle = '#color-from-palette';
    ctx.lineWidth = 3;
    ctx.stroke();
    
    // Renderizar icono (puede usar emoji o cargar imagen)
    ctx.font = '48px Arial';
    ctx.fillText(icon, x + iconX, y + iconY);
    
    // Renderizar valor
    ctx.font = 'bold 56px "Poppins", sans-serif';
    ctx.fillStyle = '#333333';
    ctx.textAlign = 'center';
    ctx.fillText(value, x + width/2, y + valueY);
    
    // Renderizar etiqueta
    ctx.font = '24px "Poppins", sans-serif';
    ctx.fillStyle = '#666666';
    ctx.fillText(label, x + width/2, y + labelY);
}

// Función auxiliar para dibujar rectángulo con bordes redondeados
function roundRect(ctx, x, y, width, height, radius) {
    ctx.beginPath();
    ctx.moveTo(x + radius, y);
    ctx.lineTo(x + width - radius, y);
    ctx.quadraticCurveTo(x + width, y, x + width, y + radius);
    ctx.lineTo(x + width, y + height - radius);
    ctx.quadraticCurveTo(x + width, y + height, x + width - radius, y + height);
    ctx.lineTo(x + radius, y + height);
    ctx.quadraticCurveTo(x, y + height, x, y + height - radius);
    ctx.lineTo(x, y + radius);
    ctx.quadraticCurveTo(x, y, x + radius, y);
    ctx.closePath();
}
```

---

## 🎨 Layout de Contenedores (Propuesta)

### Opción 1: Grid 2×2
```
┌────────────────────────────────────┐
│                                    │
│     [Plantilla Baldora_share]     │
│                                    │
│   ┌──────────┐    ┌──────────┐   │
│   │    🎯    │    │    ✓     │   │
│   │   XXX    │    │   XXX    │   │
│   │Operaciones│   │Correctas │   │
│   └──────────┘    └──────────┘   │
│                                    │
│   ┌──────────┐    ┌──────────┐   │
│   │    ⏱️    │    │    📊    │   │
│   │  X.Xs    │    │   XX%    │   │
│   │  Tiempo  │    │ Precisión│   │
│   └──────────┘    └──────────┘   │
│                                    │
└────────────────────────────────────┘
```

### Opción 2: Fila Horizontal
```
┌────────────────────────────────────┐
│                                    │
│     [Plantilla Baldora_share]     │
│                                    │
│  ┌────┐  ┌────┐  ┌────┐  ┌────┐  │
│  │ 🎯 │  │ ✓  │  │ ⏱️ │  │ 📊 │  │
│  │XXX │  │XXX │  │X.Xs│  │XX% │  │
│  │Oper│  │Corr│  │Tiem│  │Prec│  │
│  └────┘  └────┘  └────┘  └────┘  │
│                                    │
└────────────────────────────────────┘
```

---

## 📝 Pasos de Implementación

### Fase 1: Preparación
- [ ] Obtener/crear la plantilla `Baldora_share.png` (1920×1080)
- [ ] Definir paleta de colores para los contenedores
- [ ] Determinar posiciones exactas (coordenadas x, y) para cada contenedor

### Fase 2: HTML
- [ ] Agregar botón "Instagram" en el modal de descarga
- [ ] Asignar ID único al botón
- [ ] Agregar icono de red social

### Fase 3: CSS
- [ ] Estilizar el botón de compartir
- [ ] Asegurar responsive design
- [ ] Agregar efectos hover/active

### Fase 4: JavaScript
- [ ] Crear función `generateShareImage()`
- [ ] Implementar carga de plantilla de fondo
- [ ] Implementar renderizado de contenedores
- [ ] Implementar renderizado de íconos y texto
- [ ] Implementar descarga de imagen
- [ ] Vincular función al botón

### Fase 5: Testing
- [ ] Verificar que la imagen se genere correctamente
- [ ] Probar en diferentes navegadores
- [ ] Verificar calidad de la imagen descargada
- [ ] Validar que todos los datos se muestren correctamente

### Fase 6: Optimización
- [ ] Optimizar rendimiento de generación
- [ ] Agregar loading state durante generación
- [ ] Agregar mensajes de error si falla la carga de plantilla

---

## 🎯 Consideraciones Adicionales

### Accesibilidad
- Agregar atributos `aria-label` al botón
- Proporcionar feedback visual durante la generación de imagen

### UX
- Mostrar un loader/spinner mientras se genera la imagen
- Mensaje de confirmación cuando la descarga se complete
- Opción de previsualizar antes de descargar (opcional)

### Performance
- Cachear la imagen de plantilla después de la primera carga
- Considerar lazy loading de la plantilla

### Compatibilidad
- Verificar soporte de Canvas API en navegadores objetivo
- Proveer fallback o mensaje para navegadores no compatibles

### Extensibilidad Futura
- Diseño modular que permita agregar más plantillas
- Posibilidad de compartir directamente a Instagram Web API (si disponible)
- Opción de personalizar colores o temas

---

## 📚 Referencias

### APIs y Documentación
- [Canvas API - MDN](https://developer.mozilla.org/es/docs/Web/API/Canvas_API)
- [CanvasRenderingContext2D - MDN](https://developer.mozilla.org/es/docs/Web/API/CanvasRenderingContext2D)
- [HTML Canvas Tutorial](https://www.w3schools.com/html/html5_canvas.asp)

### Ejemplos de Código
- Renderizado de texto en canvas
- Carga de imágenes en canvas
- Exportación de canvas a imagen

---

## ✅ Criterios de Aceptación

1. ✓ El botón "Instagram" aparece en el modal de descarga
2. ✓ El botón tiene el mismo estilo que PDF y CSV
3. ✓ Al hacer clic, se genera una imagen de 1920×1080
4. ✓ La imagen incluye la plantilla de fondo correctamente
5. ✓ Los 4 datos estadísticos se muestran correctamente
6. ✓ Los contenedores tienen bordes redondeados
7. ✓ Los colores e iconos coinciden con la pantalla de resultados
8. ✓ La imagen se descarga automáticamente
9. ✓ Funciona en Chrome, Firefox, Safari y Edge
10. ✓ No hay errores en consola

---

## 🐛 Posibles Problemas y Soluciones

### Problema 1: CORS al cargar imagen
**Solución:** Asegurar que la plantilla esté en el mismo dominio o configurar CORS headers

### Problema 2: Calidad baja en la imagen generada
**Solución:** Ajustar dimensiones del canvas y usar `canvas.toBlob()` con calidad alta

### Problema 3: Fonts no se cargan correctamente
**Solución:** Pre-cargar fonts usando CSS Font Loading API antes de renderizar

### Problema 4: Rendimiento lento
**Solución:** Optimizar número de operaciones de dibujo, usar requestAnimationFrame si es necesario

---

## 📅 Estimación de Tiempo

- **Preparación de assets:** 1-2 horas
- **Implementación HTML/CSS:** 1 hora
- **Implementación JavaScript:** 3-4 horas
- **Testing y ajustes:** 2 horas
- **Total estimado:** 7-9 horas

---

**Fecha de creación:** 2026-02-04  
**Versión:** 1.0  
**Estado:** Planificación
