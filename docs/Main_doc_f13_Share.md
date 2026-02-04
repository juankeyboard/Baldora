# Feature 13: Compartir Resultados en Redes Sociales

## 📋 Descripción General

Esta funcionalidad permite a los usuarios generar y compartir una imagen atractiva de sus resultados de juego en redes sociales (principalmente Instagram). La imagen se genera dinámicamente utilizando Canvas HTML5, combinando una plantilla de fondo con estadísticas del jugador.

---

## 🎯 Objetivo

Crear un botón "Instagram" en la sección de descarga de resultados que genere una imagen compartible con las estadísticas de la partida completada.

**Especificaciones de la Imagen Final:**
- **Formato:** Imagen PNG descargable
- **Dimensiones exactas:** 
  - Ancho: **1080px**
  - Alto: **1920px**
- **Orientación:** Vertical (Portrait) - Ratio 9:16
- **Uso:** Optimizada para Instagram Stories
- **Nombre de descarga:** `FastMath_Resultados.png`

---

## ⚠️ ADVERTENCIA CRÍTICA DE SEGURIDAD

### 🔒 Prioridad Máxima: No Afectar Código Existente

**Esta implementación debe ser completamente aislada y auto-contenida.**

#### Reglas de Seguridad Obligatorias:

1. **NO MODIFICAR código existente que ya funciona**
   - No cambiar funciones existentes en `js/main.js`
   - No alterar funciones de descarga de PDF o CSV
   - No modificar la lógica del juego existente
   - No tocar el sistema de puntuación actual

2. **NO CAMBIAR dependencias actuales**
   - No actualizar versiones de librerías existentes
   - No modificar imports/scripts que funcionan
   - No reemplazar jsPDF u otras dependencias estables
   - Mantener todas las configuraciones actuales intactas

3. **SOLO AGREGAR nuevo código**
   - Crear función completamente nueva: `generateShareImage()`
   - Agregar nuevo botón en el modal (no modificar los existentes)
   - Agregar nuevos estilos CSS (no cambiar los actuales)
   - Todo el código debe ser independiente y modular

4. **VERIFICAR compatibilidad**
   - Testear que PDF y CSV sigan funcionando después de agregar Instagram
   - Asegurar que el modal de descarga no se rompa
   - Verificar que no haya conflictos de nombres de funciones
   - Confirmar que no afecte el flujo del juego

5. **ENCAPSULAR la nueva funcionalidad**
   - Usar nombres de funciones únicos y específicos
   - No usar variables globales que puedan causar conflictos
   - Mantener el scope aislado
   - Comentar claramente el nuevo código

#### ✅ Enfoque Seguro de Implementación:

```
✓ AGREGAR nuevo botón HTML con ID único
✓ AGREGAR nuevos estilos CSS aislados
✓ CREAR nueva función generateShareImage()
✓ CREAR funciones auxiliares específicas (drawStatContainer, roundRect)
✓ MANTENER todo el código existente sin modificaciones
✓ TESTEAR que nada se rompa
```

#### ❌ Lo que NUNCA debe hacerse:

```
✗ Modificar botones existentes de PDF/CSV
✗ Cambiar la función showExportModal() existente
✗ Alterar el flujo de renderResults()
✗ Modificar variables globales del gameState
✗ Cambiar dependencias o scripts cargados
✗ Refactorizar código que funciona
```

### 📌 Principio Fundamental:

> **"Si no es explícitamente necesario para la funcionalidad de compartir en Instagram, NO SE TOCA."**

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

**IMPORTANTE:** La imagen plantilla **`Baldora_share.png`** es un asset existente que YA CONTIENE el diseño completo de fondo (header BALDORA, cielo azul, tigre, etc.). 

**La implementación solo debe:**
1. Cargar la plantilla `Baldora_share.png` en el canvas
2. Renderizar los 4 contenedores amarillos de estadísticas SOBRE la plantilla
3. Exportar la imagen resultante

**Especificaciones de la Plantilla:**
- **Nombre del archivo:** `Baldora_share.png`
- **Ubicación sugerida:** `/assets/` o `/images/`
- **Dimensiones:** 1080px (ancho) × 1920px (alto) - Formato vertical (9:16) para Instagram Stories
- **Formato:** PNG
- **Estado:** Asset existente (no generar, solo usar)

**Contenido de la Plantilla Existente:**
- Header con el logo "BALDORA" y subtítulo "Aritmética en línea"
- Fondo de cielo azul en la parte superior
- Imagen decorativa del tigre dientes de sable en la parte inferior
- Paisaje de playa y naturaleza
- **Zona central despejada** donde se renderizarán dinámicamente los 4 contenedores de estadísticas

### 3. Datos a Mostrar

La imagen generada debe incluir los siguientes elementos:

#### 3.1 Contenedor de Nombre del Jugador (NUEVO - 2026-02-04)

**Ubicación:** Zona superior central, debajo del header "BALDORA - Aritmética en línea"

**Especificaciones Visuales:**

- **Posición en Canvas:**
  - X: **180px** (centrado horizontalmente)
  - Y: **265px** (debajo del header principal)
  
- **Dimensiones:**
  - Ancho: **225px**
  - Alto: **85px**
  - Border Radius: **42px** (bordes muy redondeados, casi elíptico)

- **Colores:**
  - Fondo: `#5FA052` (verde medio)
  - Borde: `#4A8240` (verde oscuro) - Grosor: **3px**
  - Texto: `#FFFFFF` (blanco)

- **Tipografía:**
  - Fuente: **Arial** (sans-serif)
  - Peso: **Bold**
  - Tamaño: **28px**
  - Alineación: **Centrado** (horizontal y vertical)
  - Text Transform: Capitalize (primera letra mayúscula)

- **Efectos:**
  - **Sombra del contenedor:**
    ```javascript
    ctx.shadowColor = 'rgba(0, 0, 0, 0.2)';
    ctx.shadowBlur = 8;
    ctx.shadowOffsetX = 0;
    ctx.shadowOffsetY = 3;
    ```
  - **Sombra del texto (text shadow):**
    ```javascript
    // Sombra sutil para mejorar legibilidad
    ctx.shadowColor = 'rgba(0, 0, 0, 0.3)';
    ctx.shadowBlur = 4;
    ctx.shadowOffsetX = 1;
    ctx.shadowOffsetY = 1;
    ```

**Fuente de datos:**
- Obtener de `localStorage.getItem('playerName')` o 
- Campo input en el modal si existe
- Valor por defecto: `"Jugador"` si no hay nombre guardado

**Ejemplo de Renderizado:**
```
┌─────────────────────────────────┐
│                                 │  ← Fondo verde #5FA052
│         Juan Pérez              │  ← Texto blanco Arial Bold 28px
│                                 │  ← Bordes redondeados 42px
└─────────────────────────────────┘  ← Borde verde oscuro 3px
        Con sombra sutil
```

---

#### 3.2 Contenedores de Estadísticas

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

### 4. Especificaciones Detalladas de los Contenedores

Basado en el análisis de la imagen de referencia, los 4 contenedores tienen las siguientes características:

**Estilo:**
- **Color de fondo:** Verde (igual a PDF y CSV) - `var(--clr-green-500)`
- **Estructura:** Idéntica a los otros botones (borde inferior sólido)
- - Icono: Alusivo a redes sociales (Cámara/Instagram)
- - Text: "Instagram"
- - Efectos hover: Consistentes con los demás botones de descarga

### 2. Plantilla de Imagen
...

#### 📏 Dimensiones Generales de cada Contenedor
- **Ancho:** **510px** (Aumentado para llenar el ancho)
- **Alto:** 195px
- **Border Radius:** 35px
- **Color de fondo:** `#FFF9C4` (Amarillo pastel suave)
- **Padding interno:** 20px

#### 📍 Posiciones en Canvas (1080×1920px)

**Grid 2×2 - Centrado:**
*Márgenes laterales de 20px y gap central de 20px*

```
Contenedor Superior Izquierdo (Operaciones):
- X: 20px
- Y: 490px

Contenedor Superior Derecho (Correctas):
- X: 550px
- Y: 490px

Contenedor Inferior Izquierdo (Tiempo Promedio):
- X: 20px
- Y: 720px

Contenedor Inferior Derecho (Precisión):
- X: 550px
- Y: 720px
```

**Espaciado:**
- Gap horizontal entre contenedores: 20px
- Gap vertical entre filas: 35px
- Margen desde el borde izquierdo: 20px
- Margen desde el borde derecho: 20px

#### 🎨 Estructura Visual de cada Contenedor

Cada contenedor sigue esta jerarquía visual (de arriba hacia abajo):

1. **Icono** (parte superior)
   - Tamaño: 52px × 52px
   - Posición: Centrado horizontalmente
   - Margen superior: 25px desde el borde del contenedor
   - Iconos específicos:
     - Operaciones: 🎯 (diana roja/naranja)
     - Correctas: ✓ (check verde #4CAF50)
     - Tiempo Promedio: ⚡ (rayo naranja #FF9800)
     - Precisión: 📊 (gráfico morado/magenta #E91E63)

2. **Valor Numérico** (centro del contenedor)
   - Font: "Poppins", sans-serif (bold)
   - Tamaño de fuente: 48px
   - Color: `#2C2C2C` (negro oscuro)
   - Posición Y: +95px desde el top del contenedor
   - Alineación: Centrado
   - Ejemplos de valores:
     - Operaciones: "0", "10", "20"
     - Correctas: "0", "15", "18"
     - Tiempo: "0ms", "2.5s", "3.2s"
     - Precisión: "0%", "85%", "95%"

3. **Etiqueta Descriptiva** (parte inferior)
   - Font: "Poppins", sans-serif (regular)
   - Tamaño de fuente: 16px
   - Color: `#A8A8A8` (gris claro)
   - Posición Y: +160px desde el top del contenedor
   - Alineación: Centrado
   - Etiquetas:
     - "Operaciones"
     - "Correctas"
     - "Tiempo Promedio"
     - "Precisión"

#### 🌟 Detalles Adicionales de Estilo

**Sombra del contenedor:**
```css
box-shadow: 0px 4px 12px rgba(0, 0, 0, 0.1);
```

**Efecto visual en canvas:**
- Usar `ctx.shadowColor = 'rgba(0, 0, 0, 0.1)'`
- `ctx.shadowBlur = 12`
- `ctx.shadowOffsetX = 0`
- `ctx.shadowOffsetY = 4`

#### 📊 Resumen de Colores

| Elemento | Color Hex | Uso |
|----------|-----------|-----|
| **Contenedor Nombre Jugador** | `#5FA052` | Fondo verde del nombre |
| **Borde Nombre Jugador** | `#4A8240` | Borde verde oscuro (3px) |
| **Texto Nombre Jugador** | `#FFFFFF` | Texto blanco |
| Fondo contenedor | `#FFF9C4` | Background de los 4 contenedores |
| Icono Operaciones | `#FF6B6B` | Diana roja |
| Icono Correctas | `#4CAF50` | Check verde |
| Icono Tiempo | `#FF9800` | Rayo naranja |
| Icono Precisión | `#E91E63` | Gráfico magenta |
| Valor numérico | `#2C2C2C` | Texto principal |
| Etiqueta | `#A8A8A8` | Texto secundario |



---

## 🛠️ Implementación Técnica

### ⚠️ Recordatorio de Seguridad

**ANTES de modificar cualquier archivo, recordar:**
- ✓ Solo AGREGAR código nuevo, nunca modificar existente
- ✓ Verificar compatibilidad con funcionalidad actual
- ✓ Mantener el código aislado y auto-contenido
- ✓ No tocar dependencias o scripts existentes

---

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
//==============================================================================
// FEATURE 13: COMPARTIR EN INSTAGRAM - CÓDIGO NUEVO E INDEPENDIENTE
// ⚠️ ADVERTENCIA: Esta es una funcionalidad completamente nueva.
// NO modificar código existente. Solo AGREGAR este código nuevo.
//==============================================================================

// Función principal para generar imagen compartible
// NOTA: Esta función es completamente independiente y no afecta otras funcionalidades
async function generateShareImage() {
    // 1. Crear elemento canvas con dimensiones de Instagram Stories
    // OBJETIVO FINAL: Imagen descargable de 1080px (ancho) × 1920px (alto)
    const canvas = document.createElement('canvas');
    canvas.width = 1080;  // Ancho: 1080 píxeles
    canvas.height = 1920; // Alto: 1920 píxeles (formato vertical 9:16)
    const ctx = canvas.getContext('2d');
    
    // 2. Cargar imagen de plantilla
    const backgroundImage = new Image();
    backgroundImage.src = 'assets/Baldora_share.png';
    
    await new Promise((resolve) => {
        backgroundImage.onload = resolve;
    });
    
    // 3. Dibujar plantilla de fondo
    ctx.drawImage(backgroundImage, 0, 0, 1080, 1920);
    
    // 4. Obtener estadísticas del juego
    const stats = {
        operations: gameState.totalQuestions,
        correct: gameState.correctAnswers,
        avgTime: (gameState.totalTime / gameState.totalQuestions).toFixed(1),
        accuracy: ((gameState.correctAnswers / gameState.totalQuestions) * 100).toFixed(0)
    };
    
    // 5. Definir posiciones y estilos exactos para los contenedores
    const containerConfig = {
        width: 210,
        height: 195,
        borderRadius: 35,
        backgroundColor: '#FFF9C4', // Amarillo pastel
        shadowColor: 'rgba(0, 0, 0, 0.1)',
        shadowBlur: 12,
        shadowOffsetX: 0,
        shadowOffsetY: 4
    };
    
    // 6. Definir posiciones específicas para cada contenedor
    const positions = {
        operations: { x: 60, y: 490 },
        correct: { x: 310, y: 490 },
        avgTime: { x: 60, y: 720 },
        accuracy: { x: 310, y: 720 }
    };
    
    // 7. Definir iconos y colores específicos
    const statDetails = {
        operations: {
            icon: '🎯',
            iconColor: '#FF6B6B',
            value: stats.operations.toString(),
            label: 'Operaciones'
        },
        correct: {
            icon: '✓',
            iconColor: '#4CAF50',
            value: stats.correct.toString(),
            label: 'Correctas'
        },
        avgTime: {
            icon: '⚡',
            iconColor: '#FF9800',
            value: stats.avgTime + 's',
            label: 'Tiempo Promedio'
        },
        accuracy: {
            icon: '📊',
            iconColor: '#E91E63',
            value: stats.accuracy + '%',
            label: 'Precisión'
        }
    };
    
    // 8. Renderizar cada estadística en su posición específica
    drawStatContainer(ctx, containerConfig, positions.operations, statDetails.operations);
    drawStatContainer(ctx, containerConfig, positions.correct, statDetails.correct);
    drawStatContainer(ctx, containerConfig, positions.avgTime, statDetails.avgTime);
    drawStatContainer(ctx, containerConfig, positions.accuracy, statDetails.accuracy);
    
    // 9. Convertir canvas a blob y descargar
    canvas.toBlob((blob) => {
        const url = URL.createObjectURL(blob);
        const link = document.createElement('a');
        link.download = 'FastMath_Resultados.png';
        link.href = url;
        link.click();
        URL.revokeObjectURL(url);
    }, 'image/png', 1.0); // Calidad máxima
}

// Función auxiliar para dibujar contenedor de estadística
function drawStatContainer(ctx, config, position, details) {
    // Configurar sombra
    ctx.shadowColor = config.shadowColor;
    ctx.shadowBlur = config.shadowBlur;
    ctx.shadowOffsetX = config.shadowOffsetX;
    ctx.shadowOffsetY = config.shadowOffsetY;
    
    // Dibujar contenedor con borde redondeado
    ctx.fillStyle = config.backgroundColor;
    roundRect(ctx, position.x, position.y, config.width, config.height, config.borderRadius);
    ctx.fill();
    
    // Resetear sombra para evitar que afecte a otros elementos
    ctx.shadowColor = 'transparent';
    ctx.shadowBlur = 0;
    
    // Renderizar icono (emoji) en la parte superior
    ctx.font = '52px Arial';
    ctx.textAlign = 'center';
    ctx.textBaseline = 'top';
    ctx.fillText(details.icon, position.x + config.width / 2, position.y + 25);
    
    // Renderizar valor numérico (centro)
    ctx.font = 'bold 48px "Poppins", sans-serif';
    ctx.fillStyle = '#2C2C2C';
    ctx.textAlign = 'center';
    ctx.textBaseline = 'top';
    ctx.fillText(details.value, position.x + config.width / 2, position.y + 95);
    
    // Renderizar etiqueta descriptiva (parte inferior)
    ctx.font = '16px "Poppins", sans-serif';
    ctx.fillStyle = '#A8A8A8';
    ctx.textAlign = 'center';
    ctx.textBaseline = 'top';
    ctx.fillText(details.label, position.x + config.width / 2, position.y + 160);
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

## 🎨 Layout Final - Diseño de Instagram Stories

### Formato Vertical (1080×1920px)

```
┌──────────────────────────────────────────┐
│          CIELO AZUL - Parte Superior     │ ← 0-100px
├──────────────────────────────────────────┤
│                                          │
│            ╔════════════════╗            │ ← 120px
│            ║    BALDORA     ║            │
│            ║ Aritmética en  ║            │ ← 240px
│            ║      Línea     ║            │
│            ╚════════════════╝            │
├──────────────────────────────────────────┤
│          CIELO AZUL - Separador          │ ← 245-490px
├──────────────────────────────────────────┤
│                                          │
│   ┌────────────────┐  ┌────────────────┐│
│   │      🎯        │  │       ✓        ││ ← 490px
│   │                │  │                ││
│   │       0        │  │       0        ││ ← Y: 490px
│   │  Operaciones   │  │   Correctas    ││
│   └────────────────┘  └────────────────┘│ ← 685px
│    X: 60px              X: 310px         │
│                                          │ ← Gap: 35px
│   ┌────────────────┐  ┌────────────────┐│
│   │      ⚡        │  │       📊       ││ ← 720px
│   │                │  │                ││
│   │      0ms       │  │       0%       ││ ← Y: 720px
│   │Tiempo Promedio │  │   Precisión    ││
│   └────────────────┘  └────────────────┘│ ← 915px
│    X: 60px              X: 310px         │
│                                          │
├──────────────────────────────────────────┤
│                                          │ ← 920-1920px
│    🦁 TIGRE DIENTES DE SABLE            │
│       [Imagen decorativa]                │
│    Fondo: Playa y naturaleza             │
│                                          │
│                                          │
│                                          │
└──────────────────────────────────────────┘ ← 1920px
```

### Distribución de Elementos por Altura (Y)

| Elemento | Y Inicio | Y Fin | Altura |
|----------|----------|-------|--------|
| Header "BALDORA" | 120px | 240px | ~120px |
| Separador cielo | 245px | 490px | 245px |
| Fila superior contenedores | 490px | 685px | 195px |
| Gap entre filas | 685px | 720px | 35px |
| Fila inferior contenedores | 720px | 915px | 195px |
| Zona imagen tigre | 920px | 1920px | 1000px |

### Distribución por Anchura (X)

| Elemento | X Inicio | X Fin | Ancho |
|----------|----------|-------|-------|
| Margen izquierdo | 0px | 60px | 60px |
| Contenedor izquierdo | 60px | 270px | 210px |
| Gap horizontal | 270px | 310px | 40px |
| Contenedor derecho | 310px | 520px | 210px |
| Margen derecho | 520px | 1080px | 560px |

### Coordenadas Exactas de cada Contenedor

```javascript
const containers = {
    operations: {
        x: 60,
        y: 490,
        width: 210,
        height: 195,
        icon: '🎯',
        color: '#FF6B6B'
    },
    correct: {
        x: 310,
        y: 490,
        width: 210,
        height: 195,
        icon: '✓',
        color: '#4CAF50'
    },
    avgTime: {
        x: 60,
        y: 720,
        width: 210,
        height: 195,
        icon: '⚡',
        color: '#FF9800'
    },
    accuracy: {
        x: 310,
        y: 720,
        width: 210,
        height: 195,
        icon: '📊',
        color: '#E91E63'
    }
};
```



---

## 📝 Pasos de Implementación

### Fase 1: Preparación
- [x] La plantilla `Baldora_share.png` (1080×1920) YA EXISTE
- [ ] Verificar que la plantilla esté en la ubicación correcta (assets/ o images/)
- [ ] Confirmar paleta de colores para los contenedores (#FFF9C4)
- [ ] Verificar coordenadas exactas (x, y) para cada contenedor según la imagen de referencia

### Fase 2: HTML
- [ ] Agregar botón "Instagram" en el modal de descarga
- [ ] Asignar ID único al botón
- [ ] Agregar icono de red social

### Fase 3: CSS
- [ ] Estilizar el botón de compartir
- [ ] Asegurar responsive design
- [ ] Agregar efectos hover/active

### Fase 4: JavaScript
- [ ] Crear función `generateShareImage()` (NUEVA, no modificar funciones existentes)
- [ ] Implementar carga de plantilla de fondo
- [ ] Implementar renderizado de contenedores
- [ ] Implementar renderizado de íconos y texto
- [ ] Implementar descarga de imagen
- [ ] Vincular función al botón usando addEventListener (no inline onclick)
- [ ] ✅ **VERIFICAR:** No se modificaron funciones existentes de PDF/CSV

### Fase 5: Testing
- [ ] Verificar que la imagen se genere correctamente
- [ ] Probar en diferentes navegadores
- [ ] Verificar calidad de la imagen descargada
- [ ] Validar que todos los datos se muestren correctamente
- [ ] ✅ **CRÍTICO:** Confirmar que PDF sigue funcionando
- [ ] ✅ **CRÍTICO:** Confirmar que CSV sigue funcionando
- [ ] ✅ **CRÍTICO:** Confirmar que el juego no se ve afectado

### Fase 6: Optimización
- [ ] Optimizar rendimiento de generación
- [ ] Agregar loading state durante generación
- [ ] Agregar mensajes de error si falla la carga de plantilla
- [ ] ✅ **VERIFICAR:** No se introdujeron conflictos o efectos secundarios

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
- **🌟 Web Share API (Recomendado):** Permitir compartir directamente en Instagram/redes sociales usando el menú nativo del dispositivo
  - Sin dependencias externas
  - Experiencia nativa del sistema operativo
  - Funciona en iOS y Android (requiere HTTPS)
  - Abre directamente Instagram Stories si está instalado
- Opción de personalizar colores o temas
- Preview de imagen antes de compartir/descargar

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

---

## 📸 Referencia Visual

### Imagen de Referencia Proporcionada por el Usuario

La imagen de referencia muestra exactamente cómo deben verse los 4 contenedores amarillos de estadísticas que se renderizarán sobre la plantilla `Baldora_share.png`.

**Flujo de Implementación Correcto:**

```
1. Cargar Baldora_share.png (plantilla existente 1080×1920)
                ↓
2. Crear canvas con dimensiones exactas:
   - width: 1080px
   - height: 1920px
                ↓
3. Dibujar la plantilla en el canvas
                ↓
4. Renderizar los 4 contenedores amarillos SOBRE la plantilla
   (usando Canvas 2D API)
                ↓
5. Exportar imagen final como PNG (1080×1920px)
   Nombre: FastMath_Resultados.png
```

**Elementos Visuales de los Contenedores (a renderizar):**
1. **Fondo amarillo pastel (#FFF9C4)** con bordes redondeados de 35px
2. **Sombra sutil** (shadowBlur: 12px)
3. **Iconos coloridos** en cada contenedor:
   - 🎯 Diana roja (#FF6B6B) - Operaciones
   - ✓ Check verde (#4CAF50) - Correctas
   - ⚡ Rayo naranja (#FF9800) - Tiempo Promedio
   - 📊 Gráfico magenta (#E91E63) - Precisión
4. **Valores numéricos grandes** en Poppins Bold 48px, color #2C2C2C
5. **Etiquetas descriptivas** en Poppins Regular 16px, color #A8A8A8

### Checklist de Fidelidad Visual

Antes de dar por completada la implementación, verificar que:

**Dimensiones y Canvas:**
- [ ] La plantilla `Baldora_share.png` se carga correctamente en el canvas
- [ ] Las dimensiones del canvas son exactamente: width=1080px, height=1920px
- [ ] La imagen descargada tiene exactamente 1080px de ancho × 1920px de alto
- [ ] El formato de descarga es PNG de alta calidad
- [ ] El nombre del archivo descargado es `FastMath_Resultados.png`

**Contenedores de Estadísticas:**
- [ ] Los contenedores se renderizan SOBRE la plantilla (no la reemplazan)
- [ ] Los contenedores tienen 210×195px con border-radius de 35px
- [ ] El color de fondo de los contenedores es #FFF9C4
- [ ] Las posiciones X,Y son exactas según la especificación

**Tipografía y Estilos:**
- [ ] Los iconos tienen 52px de tamaño
- [ ] El valor numérico usa Poppins Bold 48px
- [ ] La etiqueta usa Poppins Regular 16px
- [ ] Hay sombra sutil en los contenedores (shadowBlur: 12)
- [ ] El espaciado entre contenedores es de 40px horizontal y 35px vertical

**Resultado Final:**
- [ ] La imagen final combina la plantilla existente + los 4 contenedores renderizados
- [ ] La imagen se descarga automáticamente al hacer clic en el botón
- [ ] La calidad de la imagen es adecuada para compartir en redes sociales

---

---

# 📋 GUÍA DE IMPLEMENTACIÓN PASO A PASO

## 🎯 Objetivo de esta Guía

Esta guía proporciona una **secuencia lógica y ordenada** para implementar la funcionalidad de compartir en Instagram **sin romper nada existente**. Cada paso debe completarse en orden y verificarse antes de continuar.

---

## ⚠️ REGLA FUNDAMENTAL

**🔒 ANTES DE EMPEZAR:** Hacer backup o commit del código actual. Esta implementación solo AGREGA código nuevo, NO modifica existente.

---

## 🚀 PASO 1: Preparación y Verificación Inicial

### 1.1 Verificar Asset de Plantilla
```bash
# Verificar que existe Baldora_share.png
# Ubicación esperada: /assets/Baldora_share.png o /images/Baldora_share.png
```

**Checklist:**
- [ ] La plantilla `Baldora_share.png` existe en el proyecto
- [ ] Las dimensiones son exactamente 1080×1920px
- [ ] El archivo está en formato PNG
- [ ] La ruta del archivo es accesible desde JavaScript

**Si falta la plantilla:**
- DETENER implementación
- Obtener/crear la plantilla primero
- Verificar dimensiones correctas

---

## 🚀 PASO 2: Agregar Botón en HTML (Solo Agregar, No Modificar)

### 2.1 Localizar el Modal de Exportación

**Archivo:** `index.html`

**Buscar:** El modal que contiene los botones "Reporte PDF" y "Datos CSV"

```html
<!-- Ejemplo de estructura existente (NO MODIFICAR) -->
<div id="exportModal">
    <button id="exportPDF">Reporte PDF</button>
    <button id="exportCSV">Datos CSV</button>
    <!-- AQUÍ se agregará el nuevo botón -->
</div>
```

### 2.2 Agregar Nuevo Botón Instagram

**⚠️ IMPORTANTE:** Usar un ID único que no exista en el código actual

```html
<!-- CÓDIGO NUEVO A AGREGAR (después de los botones existentes) -->
<button id="exportInstagram" class="export-button export-button-instagram">
    <i class="icon-instagram"></i> <!-- O usar emoji 📷 si no hay iconos -->
    <span>Instagram</span>
</button>
```

**Checklist:**
- [ ] Botón agregado DESPUÉS de los botones existentes
- [ ] ID único: `exportInstagram`
- [ ] Clase base igual a los otros botones para mantener consistencia
- [ ] Icono o emoji agregado
- [ ] NO se modificaron los botones de PDF o CSV

**Verificación:**
```bash
# Abrir la aplicación en el navegador
# Verificar que aparezcan 3 botones: PDF, CSV, Instagram
# Verificar que PDF y CSV sigan funcionando
```

---

## 🚀 PASO 3: Agregar Estilos CSS (Solo Agregar, No Modificar)

### 3.1 Localizar Archivo de Estilos

**Archivo:** `css/styles.css`

### 3.2 Agregar Estilos para el Botón Instagram

**⚠️ IMPORTANTE:** Agregar al FINAL del archivo CSS

```css
/* ============================================================
   FEATURE 13: Botón Compartir Instagram - NUEVO
   ============================================================ */

/* Botón Instagram - Mantiene consistencia con PDF y CSV */
.export-button-instagram {
    /* Heredar estilos base de .export-button */
    background: linear-gradient(135deg, #833ab4, #fd1d1d, #fcb045);
    color: white;
    padding: 12px 24px;
    border-radius: 8px;
    border: none;
    cursor: pointer;
    font-family: 'Poppins', sans-serif;
    font-size: 16px;
    font-weight: 500;
    display: flex;
    align-items: center;
    gap: 8px;
    transition: all 0.3s ease;
    min-width: 180px;
    justify-content: center;
}

.export-button-instagram:hover {
    transform: translateY(-2px);
    box-shadow: 0 4px 12px rgba(131, 58, 180, 0.4);
}

.export-button-instagram:active {
    transform: translateY(0);
}

.export-button-instagram .icon-instagram {
    width: 20px;
    height: 20px;
}

/* Responsive */
@media (max-width: 768px) {
    .export-button-instagram {
        min-width: 100%;
        margin-top: 10px;
    }
}
```

**Checklist:**
- [ ] Estilos agregados al final del archivo CSS
- [ ] NO se modificaron estilos existentes
- [ ] Estilos son consistentes con botones PDF y CSV
- [ ] Responsive design incluido

**Verificación:**
```bash
# Recargar la página
# Verificar que el botón Instagram tenga el estilo correcto
# Verificar hover y active states
# Probar en móvil (responsive)
```

---

## 🚀 PASO 4: Crear Funciones JavaScript (Código Completamente Nuevo)

### 4.1 Decidir Ubicación del Código

**Opciones:**
- **Opción A:** Crear nuevo archivo `js/share-instagram.js` (RECOMENDADO)
- **Opción B:** Agregar al final de `js/main.js`

**Recomendación:** Opción A para máximo aislamiento

### 4.2 Crear Archivo JavaScript Nuevo (Si se elige Opción A)

**Archivo nuevo:** `js/share-instagram.js`

### 4.3 Agregar Código Completo

```javascript
//==============================================================================
// FEATURE 13: COMPARTIR EN INSTAGRAM
// Archivo: share-instagram.js
// Fecha: 2026-02-04
// Descripción: Genera imagen compartible con estadísticas del juego
// ⚠️ IMPORTANTE: Código completamente nuevo e independiente
//==============================================================================

/**
 * Función principal para generar y descargar imagen de resultados
 * @returns {Promise<void>}
 */
async function generateShareImage() {
    try {
        // PASO 1: Crear canvas con dimensiones exactas
        const canvas = document.createElement('canvas');
        canvas.width = 1080;  // Ancho
        canvas.height = 1920; // Alto
        const ctx = canvas.getContext('2d');
        
        if (!ctx) {
            throw new Error('No se pudo obtener el contexto 2D del canvas');
        }
        
        // PASO 2: Cargar plantilla de fondo
        const templateImage = await loadTemplateImage();
        
        // PASO 3: Dibujar plantilla en el canvas
        ctx.drawImage(templateImage, 0, 0, 1080, 1920);
        
        // PASO 4: Obtener estadísticas del juego
        const stats = getGameStatistics();
        
        // PASO 5: Configurar estilos de contenedores
        const containerConfig = {
            width: 210,
            height: 195,
            borderRadius: 35,
            backgroundColor: '#FFF9C4',
            shadowColor: 'rgba(0, 0, 0, 0.1)',
            shadowBlur: 12,
            shadowOffsetX: 0,
            shadowOffsetY: 4
        };
        
        // PASO 6: Definir posiciones
        const positions = {
            operations: { x: 60, y: 490 },
            correct: { x: 310, y: 490 },
            avgTime: { x: 60, y: 720 },
            accuracy: { x: 310, y: 720 }
        };
        
        // PASO 7: Definir detalles de cada estadística
        const statDetails = createStatDetails(stats);
        
        // PASO 8: Renderizar cada contenedor
        drawStatContainer(ctx, containerConfig, positions.operations, statDetails.operations);
        drawStatContainer(ctx, containerConfig, positions.correct, statDetails.correct);
        drawStatContainer(ctx, containerConfig, positions.avgTime, statDetails.avgTime);
        drawStatContainer(ctx, containerConfig, positions.accuracy, statDetails.accuracy);
        
        // PASO 9: Convertir a blob y descargar
        await downloadCanvasAsImage(canvas);
        
        console.log('✅ Imagen generada y descargada exitosamente');
        
    } catch (error) {
        console.error('❌ Error al generar imagen:', error);
        alert('Error al generar la imagen. Por favor, intenta nuevamente.');
    }
}

/**
 * Carga la plantilla de imagen de fondo
 * @returns {Promise<HTMLImageElement>}
 */
function loadTemplateImage() {
    return new Promise((resolve, reject) => {
        const img = new Image();
        
        img.onload = () => resolve(img);
        img.onerror = () => reject(new Error('No se pudo cargar la plantilla Baldora_share.png'));
        
        // Intentar diferentes rutas
        img.src = 'assets/Baldora_share.png'; // Ajustar si está en otra ubicación
        
        // Timeout de seguridad
        setTimeout(() => {
            if (!img.complete) {
                reject(new Error('Timeout al cargar la plantilla'));
            }
        }, 5000);
    });
}

/**
 * Obtiene las estadísticas del juego actual
 * @returns {Object} Estadísticas del juego
 */
function getGameStatistics() {
    // IMPORTANTE: Ajustar según la estructura de datos de tu aplicación
    // Acceder a las variables globales del juego (sin modificarlas)
    
    const totalQuestions = window.gameState?.totalQuestions || 0;
    const correctAnswers = window.gameState?.correctAnswers || 0;
    const totalTime = window.gameState?.totalTime || 0;
    
    const avgTime = totalQuestions > 0 
        ? (totalTime / totalQuestions).toFixed(1) 
        : '0';
    
    const accuracy = totalQuestions > 0 
        ? ((correctAnswers / totalQuestions) * 100).toFixed(0) 
        : '0';
    
    return {
        operations: totalQuestions,
        correct: correctAnswers,
        avgTime: avgTime,
        accuracy: accuracy
    };
}

/**
 * Crea los detalles visuales de cada estadística
 * @param {Object} stats - Estadísticas del juego
 * @returns {Object} Detalles formateados
 */
function createStatDetails(stats) {
    return {
        operations: {
            icon: '🎯',
            iconColor: '#FF6B6B',
            value: stats.operations.toString(),
            label: 'Operaciones'
        },
        correct: {
            icon: '✓',
            iconColor: '#4CAF50',
            value: stats.correct.toString(),
            label: 'Correctas'
        },
        avgTime: {
            icon: '⚡',
            iconColor: '#FF9800',
            value: stats.avgTime + 's',
            label: 'Tiempo Promedio'
        },
        accuracy: {
            icon: '📊',
            iconColor: '#E91E63',
            value: stats.accuracy + '%',
            label: 'Precisión'
        }
    };
}

/**
 * Dibuja un contenedor de estadística en el canvas
 * @param {CanvasRenderingContext2D} ctx - Contexto del canvas
 * @param {Object} config - Configuración del contenedor
 * @param {Object} position - Posición {x, y}
 * @param {Object} details - Detalles visuales
 */
function drawStatContainer(ctx, config, position, details) {
    // Guardar estado del contexto
    ctx.save();
    
    // Configurar sombra
    ctx.shadowColor = config.shadowColor;
    ctx.shadowBlur = config.shadowBlur;
    ctx.shadowOffsetX = config.shadowOffsetX;
    ctx.shadowOffsetY = config.shadowOffsetY;
    
    // Dibujar contenedor con bordes redondeados
    ctx.fillStyle = config.backgroundColor;
    drawRoundedRect(ctx, position.x, position.y, config.width, config.height, config.borderRadius);
    ctx.fill();
    
    // Resetear sombra
    ctx.shadowColor = 'transparent';
    ctx.shadowBlur = 0;
    
    // Renderizar icono
    ctx.font = '52px Arial';
    ctx.textAlign = 'center';
    ctx.textBaseline = 'top';
    ctx.fillText(details.icon, position.x + config.width / 2, position.y + 25);
    
    // Renderizar valor numérico
    ctx.font = 'bold 48px "Poppins", sans-serif';
    ctx.fillStyle = '#2C2C2C';
    ctx.fillText(details.value, position.x + config.width / 2, position.y + 95);
    
    // Renderizar etiqueta
    ctx.font = '16px "Poppins", sans-serif';
    ctx.fillStyle = '#A8A8A8';
    ctx.fillText(details.label, position.x + config.width / 2, position.y + 160);
    
    // Restaurar estado del contexto
    ctx.restore();
}

/**
 * Dibuja un rectángulo con bordes redondeados
 * @param {CanvasRenderingContext2D} ctx - Contexto del canvas
 * @param {number} x - Posición X
 * @param {number} y - Posición Y
 * @param {number} width - Ancho
 * @param {number} height - Alto
 * @param {number} radius - Radio de las esquinas
 */
function drawRoundedRect(ctx, x, y, width, height, radius) {
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

/**
 * Descarga el canvas como imagen PNG
 * @param {HTMLCanvasElement} canvas - Canvas a descargar
 * @returns {Promise<void>}
 */
function downloadCanvasAsImage(canvas) {
    return new Promise((resolve, reject) => {
        canvas.toBlob((blob) => {
            if (!blob) {
                reject(new Error('No se pudo crear el blob de la imagen'));
                return;
            }
            
            const url = URL.createObjectURL(blob);
            const link = document.createElement('a');
            link.download = 'FastMath_Resultados.png';
            link.href = url;
            link.click();
            
            // Limpiar URL después de un breve delay
            setTimeout(() => {
                URL.revokeObjectURL(url);
                resolve();
            }, 100);
            
        }, 'image/png', 1.0); // Calidad máxima
    });
}

/**
 * Inicializa el botón de compartir Instagram
 * Se ejecuta cuando el DOM está listo
 */
function initializeInstagramButton() {
    const button = document.getElementById('exportInstagram');
    
    if (!button) {
        console.warn('⚠️ Botón exportInstagram no encontrado en el DOM');
        return;
    }
    
    // Agregar event listener al botón
    button.addEventListener('click', async function(e) {
        e.preventDefault();
        
        // Deshabilitar botón durante la generación
        button.disabled = true;
        button.textContent = 'Generando...';
        
        try {
            await generateShareImage();
        } finally {
            // Rehabilitar botón
            button.disabled = false;
            button.innerHTML = '<i class="icon-instagram"></i> <span>Instagram</span>';
        }
    });
    
    console.log('✅ Botón Instagram inicializado correctamente');
}

// Auto-inicializar cuando el DOM esté listo
if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', initializeInstagramButton);
} else {
    initializeInstagramButton();
}

//==============================================================================
// FIN DEL CÓDIGO FEATURE 13
//==============================================================================
```

**Checklist Paso 4:**
- [ ] Archivo JavaScript creado
- [ ] Todo el código está encapsulado en funciones
- [ ] Comentarios claros y descriptivos
- [ ] Manejo de errores implementado
- [ ] NO se modificó código existente

---

## 🚀 PASO 5: Vincular el Script JavaScript a HTML

### 5.1 Agregar Script al HTML

**Archivo:** `index.html`

**Ubicación:** Antes del cierre de `</body>` tags

```html
<!-- CÓDIGO NUEVO A AGREGAR (antes de </body>) -->
<script src="js/share-instagram.js"></script>
```

**⚠️ IMPORTANTE:** Agregar DESPUÉS de los scripts existentes

**Checklist:**
- [ ] Script agregado al final del HTML
- [ ] Ruta del script es correcta
- [ ] Se carga DESPUÉS de otros scripts necesarios
- [ ] NO se modificaron otros script tags

---

## 🚀 PASO 6: Verificación y Testing Completo

### 6.1 Pruebas de Funcionalidad Nueva

**Abrir Consola del Navegador** (F12)

**Ejecutar pruebas:**

```javascript
// 1. Verificar que las funciones existan
console.log(typeof generateShareImage); // Debe mostrar 'function'

// 2. Verificar que el botón esté vinculado
const btn = document.getElementById('exportInstagram');
console.log(btn); // Debe mostrar el elemento

// 3. Hacer clic en el botón Instagram
// Verificar que se descargue la imagen
```

**Checklist de Testing:**
- [ ] El botón Instagram aparece en el modal
- [ ] Al hacer clic, se genera la imagen
- [ ] La imagen se descarga automáticamente
- [ ] El nombre del archivo es `FastMath_Resultados.png`
- [ ] La imagen tiene dimensiones 1080×1920
- [ ] Los 4 contenedores aparecen correctamente
- [ ] Los datos son correctos
- [ ] No hay errores en la consola

### 6.2 Pruebas de No Regresión (CRÍTICO)

**⚠️ MUY IMPORTANTE:** Verificar que nada se rompió

**Checklist de No Regresión:**
- [ ] ✅ El botón "Reporte PDF" sigue funcionando
- [ ] ✅ El botón "Datos CSV" sigue funcionando
- [ ] ✅ El juego funciona normalmente
- [ ] ✅ El modal de descarga abre y cierra correctamente
- [ ] ✅ No hay errores nuevos en consola
- [ ] ✅ Los estilos no se rompieron
- [ ] ✅ La aplicación se ve igual que antes (excepto nuevo botón)

### 6.3 Pruebas en Diferentes Navegadores

- [ ] Chrome/Edge
- [ ] Firefox
- [ ] Safari (si es posible)

### 6.4 Pruebas Responsive

- [ ] Desktop (1920×1080)
- [ ] Tablet (768px)
- [ ] Mobile (375px)

---

## 🚀 PASO 7: Ajustes y Optimización

### 7.1 Ajustar Ruta de Plantilla (Si es necesario)

Si la plantilla no se carga, ajustar la ruta en el código:

```javascript
// En la función loadTemplateImage(), cambiar:
img.src = 'assets/Baldora_share.png'; // O la ruta correcta
```

### 7.2 Ajustar Acceso a Estadísticas (Si es necesario)

Si `gameState` no existe como variable global, ajustar en `getGameStatistics()`:

```javascript
// Ejemplo si las variables tienen otros nombres:
const totalQuestions = totalOperations || 0;
const correctAnswers = answersCorrect || 0;
```

### 7.3 Agregar Loading State (Opcional pero Recomendado)

Agregar un spinner o indicador visual mientras se genera la imagen.

---

## � PASO 8: Mejora con Web Share API (OPCIONAL - Altamente Recomendado)

### 8.1 ¿Qué es Web Share API?

La Web Share API permite compartir la imagen directamente usando el **menú nativo del sistema operativo** del dispositivo. Si el usuario tiene Instagram instalado, aparecerá como opción para compartir directamente en Instagram Stories.

**Ventajas:**
- ✅ Experiencia nativa del usuario
- ✅ Sin dependencias externas
- ✅ Funciona en iOS y Android
- ✅ Instagram Stories aparece automáticamente si está instalado
- ✅ Más intuitivo para usuarios móviles

**Requisitos:**
- El sitio debe correr bajo **HTTPS**
- Navegador compatible (Chrome, Safari, Edge móvil)

### 8.2 Decisión de Implementación

**Dos opciones:**

**Opción A: Botón Dual (RECOMENDADO)**
- En desktop: Descarga la imagen
- En móvil: Abre el menú de compartir nativo

**Opción B: Dos Botones Separados**
- Un botón "Descargar"
- Un botón "Compartir" (solo visible en móvil)

### 8.3 Implementación - Opción A (Botón Inteligente)

Actualizar el código en `js/share-instagram.js`:

```javascript
//==============================================================================
// MEJORA: Web Share API - Botón inteligente
//==============================================================================

/**
 * Detecta si el dispositivo soporta Web Share API para archivos
 * @returns {boolean}
 */
function canUseWebShare() {
    return navigator.share && navigator.canShare && 'files' in Navigator.prototype;
}

/**
 * Detecta si es un dispositivo móvil
 * @returns {boolean}
 */
function isMobileDevice() {
    return /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(navigator.userAgent);
}

/**
 * Comparte la imagen usando Web Share API
 * @param {Blob} imageBlob - Blob de la imagen generada
 * @returns {Promise<boolean>} - True si se compartió exitosamente
 */
async function shareImageNative(imageBlob) {
    try {
        // Crear archivo desde blob
        const file = new File([imageBlob], 'FastMath_Resultados.png', { 
            type: 'image/png' 
        });

        // Verificar si se puede compartir
        if (navigator.canShare({ files: [file] })) {
            await navigator.share({
                files: [file],
                title: 'Mis Resultados - Baldora',
                text: '¡Mira mis resultados en Baldora - Aritmética en línea! 🎯'
            });
            
            console.log('✅ Imagen compartida exitosamente');
            return true;
        } else {
            console.warn('⚠️ No se pueden compartir archivos en este navegador');
            return false;
        }
    } catch (error) {
        // Usuario canceló o error
        if (error.name === 'AbortError') {
            console.log('ℹ️ Usuario canceló compartir');
        } else {
            console.error('❌ Error al compartir:', error);
        }
        return false;
    }
}

/**
 * Descarga el canvas como imagen PNG (versión mejorada)
 * @param {HTMLCanvasElement} canvas - Canvas a descargar
 * @param {boolean} returnBlob - Si true, retorna el blob en lugar de descargar
 * @returns {Promise<Blob|void>}
 */
async function downloadCanvasAsImage(canvas, returnBlob = false) {
    return new Promise((resolve, reject) => {
        canvas.toBlob(async (blob) => {
            if (!blob) {
                reject(new Error('No se pudo crear el blob de la imagen'));
                return;
            }
            
            if (returnBlob) {
                resolve(blob);
                return;
            }
            
            // Intentar compartir primero si es móvil y está disponible
            const isMobile = isMobileDevice();
            const canShare = canUseWebShare();
            
            if (isMobile && canShare) {
                const shared = await shareImageNative(blob);
                if (shared) {
                    resolve();
                    return;
                }
                // Si falla o cancela, continuar con descarga
            }
            
            // Descarga tradicional
            const url = URL.createObjectURL(blob);
            const link = document.createElement('a');
            link.download = 'FastMath_Resultados.png';
            link.href = url;
            link.click();
            
            setTimeout(() => {
                URL.revokeObjectURL(url);
                resolve();
            }, 100);
            
        }, 'image/png', 1.0);
    });
}

/**
 * Función principal mejorada con detección automática
 */
async function generateShareImage() {
    try {
        const canvas = document.createElement('canvas');
        canvas.width = 1080;
        canvas.height = 1920;
        const ctx = canvas.getContext('2d');
        
        if (!ctx) {
            throw new Error('No se pudo obtener el contexto 2D del canvas');
        }
        
        const templateImage = await loadTemplateImage();
        ctx.drawImage(templateImage, 0, 0, 1080, 1920);
        
        const stats = getGameStatistics();
        const containerConfig = {
            width: 210,
            height: 195,
            borderRadius: 35,
            backgroundColor: '#FFF9C4',
            shadowColor: 'rgba(0, 0, 0, 0.1)',
            shadowBlur: 12,
            shadowOffsetX: 0,
            shadowOffsetY: 4
        };
        
        const positions = {
            operations: { x: 60, y: 490 },
            correct: { x: 310, y: 490 },
            avgTime: { x: 60, y: 720 },
            accuracy: { x: 310, y: 720 }
        };
        
        const statDetails = createStatDetails(stats);
        
        drawStatContainer(ctx, containerConfig, positions.operations, statDetails.operations);
        drawStatContainer(ctx, containerConfig, positions.correct, statDetails.correct);
        drawStatContainer(ctx, containerConfig, positions.avgTime, statDetails.avgTime);
        drawStatContainer(ctx, containerConfig, positions.accuracy, statDetails.accuracy);
        
        // Automático: Compartir en móvil, descargar en desktop
        await downloadCanvasAsImage(canvas);
        
        console.log('✅ Imagen procesada exitosamente');
        
    } catch (error) {
        console.error('❌ Error al generar imagen:', error);
        alert('Error al generar la imagen. Por favor, intenta nuevamente.');
    }
}

/**
 * Inicializa el botón con texto dinámico según dispositivo
 */
function initializeInstagramButton() {
    const button = document.getElementById('exportInstagram');
    
    if (!button) {
        console.warn('⚠️ Botón exportInstagram no encontrado en el DOM');
        return;
    }
    
    // Cambiar texto del botón según dispositivo
    const isMobile = isMobileDevice();
    const canShare = canUseWebShare();
    
    if (isMobile && canShare) {
        button.innerHTML = '<i class="icon-share"></i> <span>Compartir</span>';
        button.setAttribute('aria-label', 'Compartir en redes sociales');
    } else {
        button.innerHTML = '<i class="icon-instagram"></i> <span>Instagram</span>';
        button.setAttribute('aria-label', 'Descargar imagen para Instagram');
    }
    
    button.addEventListener('click', async function(e) {
        e.preventDefault();
        
        button.disabled = true;
        const originalHTML = button.innerHTML;
        button.textContent = 'Generando...';
        
        try {
            await generateShareImage();
        } finally {
            button.disabled = false;
            button.innerHTML = originalHTML;
        }
    });
    
    console.log('✅ Botón Instagram inicializado correctamente');
    console.log(`   Modo: ${isMobile && canShare ? 'Compartir (Móvil)' : 'Descargar (Desktop)'}`);
}
```

### 8.4 Actualizar HTML (Opcional - Icono Compartir)

Si quieres tener un icono diferente para compartir, agregar en `index.html`:

```html
<!-- Agregar emoji o SVG para compartir -->
<button id="exportInstagram" class="export-button export-button-instagram">
    📤 <!-- Emoji compartir, se cambiará dinámicamente -->
    <span>Instagram</span>
</button>
```

### 8.5 Testing de Web Share API

**Checklist de Testing:**

**En Desktop:**
- [ ] El botón muestra "Instagram" o "Descargar"
- [ ] Al hacer clic, descarga la imagen directamente
- [ ] No hay errores en consola

**En Móvil (HTTPS requerido):**
- [ ] El botón muestra "Compartir"
- [ ] Al hacer clic, abre el menú nativo de compartir
- [ ] Instagram Stories aparece en las opciones (si está instalado)
- [ ] Se puede compartir la imagen correctamente
- [ ] Si se cancela, no hay errores

**Verificación de Compatibilidad:**

```javascript
// En consola del navegador móvil:
console.log('Web Share soportado:', !!navigator.share);
console.log('Puede compartir archivos:', navigator.canShare && 'files' in Navigator.prototype);
```

### 8.6 Fallback Automático

El código ya incluye fallback automático:

```
┌─────────────────────────────────┐
│   Usuario hace clic en botón   │
└─────────────────┬───────────────┘
                  │
                  ▼
          ┌───────────────┐
          │  ¿Es móvil?   │
          └───┬───────┬───┘
              │       │
         NO   │       │   SÍ
              │       │
              ▼       ▼
         ┌─────┐  ┌──────────────────┐
         │     │  │ ¿Soporta Web     │
         │  D  │  │ Share API?       │
         │  E  │  └───┬──────────┬───┘
         │  S  │      │          │
         │  C  │  SÍ  │          │  NO
         │  A  │      │          │
         │  R  │      ▼          ▼
         │  G  │  ┌────────┐  ┌────────┐
         │  A  │  │Compartir│ │Descarga│
         │  R  │  │ Nativo  │ │        │
         │     │  └────────┘  └────────┘
         └─────┘
```

### 8.7 Beneficios de Esta Implementación

✅ **Experiencia Óptima:**
- Desktop: Descarga directa (uso tradicional)
- Móvil: Menú nativo de compartir (más natural)

✅ **Sin Configuración Adicional:**
- Detección automática del dispositivo
- Fallback transparente si no está disponible

✅ **Instagram Stories Directo:**
- En móvil, Instagram Stories aparece como opción
- Usuario solo tiene que seleccionarlo del menú

✅ **Compatible:**
- Funciona en ambos modos (compartir y descargar)
- No rompe funcionalidad existente

### 8.8 Requisitos para Web Share

**IMPORTANTE:**

1. **HTTPS Obligatorio**
   ```
   ❌ http://localhost:3000  → No funciona
   ✅ https://localhost:3000 → Funciona
   ✅ https://tu-dominio.com → Funciona
   ```

2. **Dominios permitidos:**
   - Cualquier dominio con HTTPS
   - localhost con HTTPS
   - Tunnel services (ngrok, etc.)

3. **Navegadores compatibles:**
   - ✅ Chrome/Edge (Android)
   - ✅ Safari (iOS/iPadOS)
   - ❌ Firefox (limitado)
   - ❌ Desktop browsers (varían)

### 8.9 Checklist Final - Paso 8

- [ ] Código de Web Share API agregado
- [ ] Funciones de detección implementadas
- [ ] Botón se adapta según dispositivo
- [ ] Testeado en desktop (descarga)
- [ ] Testeado en móvil con HTTPS (compartir)
- [ ] Instagram Stories aparece en menú móvil
- [ ] Fallback funciona correctamente
- [ ] No hay errores en consola

---

## 🐛 Troubleshooting - Problemas Comunes

### ⚠️ PROBLEMA CRÍTICO IDENTIFICADO - 2026-02-04

### Problema 0: "Error al generar imagen: No se pudo cargar la plantilla Baldora_share.png" (EN PRODUCCIÓN)

**Síntomas:**
- ✅ La funcionalidad funciona perfectamente en PC local (development)
- ❌ Al desplegar, aparece error: `Error: No se pudo cargar la plantilla Baldora_share.png` en consola
- ❌ Alert muestra: "Error al generar la imagen. Por favor, intenta nuevamente."
- 📍 Error ocurre en: `share-instagram.js:173` (línea del `img.onerror`)
- 📍 Error se reporta en: `share-instagram.js:159` (línea del `console.error`)

**Análisis del Problema Realizado:**

1. **Problema Principal: Doble Extensión en el Archivo**
   ```
   ❌ Nombre actual del archivo: Baldora_share.png.png
   ✅ Nombre esperado por el código: Baldora_share.png
   ```
   - El archivo fue guardado con extensión duplicada `.png.png`
   - En Windows, si la extensión está visible, al guardar como "Baldora_share.png" el sistema agrega `.png` resultando en `.png.png`

2. **Problema Secundario: Ruta Relativa**
   ```javascript
   // Línea 176 en share-instagram.js
   img.src = 'images/Baldora_share.png';
   ```
   - Esta ruta funciona en local porque el servidor de desarrollo resuelve rutas relativas correctamente
   - En producción (Firebase Hosting, GitHub Pages, etc.) las rutas relativas pueden fallar dependiendo del contexto de ejecución
   - Falta la barra inicial `/` para indicar ruta absoluta desde el root del dominio

3. **Por qué funciona en local pero no en producción:**
   - **Local (Development Server):** 
     - Servidor local (Live Server, http-server, etc.) tiene directorio raíz bien definido
     - Rutas relativas se resuelven desde el contexto del archivo HTML
     - El navegador puede cargar recursos con rutas flexibles
   
   - **Producción (Deployed):**
     - Servidor web (Firebase, Apache, Nginx) tiene configuración estricta de rutas
     - Puede haber reescritura de URLs, CDN, o configuración de caché
     - Las rutas relativas sin `/` inicial pueden resolverse incorrectamente
     - Si el script se ejecuta desde un contexto diferente, la ruta relativa apunta al lugar equivocado

**Verificación del Problema:**

```bash
# 1. Verificar el nombre real del archivo
# Resultado de find_by_name:
# Found: images\Baldora_share.png.png
# ❌ CONFIRMADO: El archivo tiene extensión duplicada

# 2. Verificar qué busca el código
# Línea 176 de share-instagram.js:
# img.src = 'images/Baldora_share.png';
# ❌ El código busca: Baldora_share.png
# ❌ Pero el archivo es: Baldora_share.png.png
# RESULTADO: 404 Not Found (archivo no existe con ese nombre)
```

**Soluciones Implementadas:**

#### ✅ SOLUCIÓN 1: Renombrar el archivo (RECOMENDADO)
```bash
# Eliminar la extensión duplicada
# Antes: Baldora_share.png.png
# Después: Baldora_share.png

# Windows PowerShell:
Rename-Item "images/Baldora_share.png.png" "Baldora_share.png"

# Windows CMD:
ren "images\Baldora_share.png.png" "Baldora_share.png"

# Git Bash / Linux / Mac:
mv images/Baldora_share.png.png images/Baldora_share.png
```

#### ✅ SOLUCIÓN 2: Actualizar la ruta en el código para mayor robustez
```javascript
// Antes (línea 176):
img.src = 'images/Baldora_share.png';

// Después (RUTA ABSOLUTA desde root del dominio):
img.src = '/images/Baldora_share.png';
//         ^
//         └── Barra inicial indica ruta absoluta desde el dominio raíz
//             Funciona consistentemente en local y producción
```

#### ✅ SOLUCIÓN 3: Implementar sistema de fallback robusto (IMPLEMENTADO)
```javascript
// Sistema de múltiples rutas en orden de prioridad
function loadTemplateImage() {
    return new Promise((resolve, reject) => {
        const img = new Image();
        
        // Array de rutas posibles (orden de prioridad)
        const possiblePaths = [
            '/images/Baldora_share.png',      // Ruta absoluta (producción)
            'images/Baldora_share.png',       // Ruta relativa (local)
            './images/Baldora_share.png',     // Ruta relativa explícita
            '../images/Baldora_share.png'     // Ruta relativa nivel superior
        ];
        
        let currentPathIndex = 0;
        
        function tryNextPath() {
            if (currentPathIndex >= possiblePaths.length) {
                reject(new Error('No se pudo cargar la plantilla desde ninguna ruta'));
                return;
            }
            
            const currentPath = possiblePaths[currentPathIndex];
            console.log(`🔍 Intentando cargar plantilla desde: ${currentPath}`);
            
            img.src = currentPath;
            currentPathIndex++;
        }
        
        img.onload = () => {
            console.log(`✅ Plantilla cargada exitosamente desde: ${img.src}`);
            resolve(img);
        };
        
        img.onerror = () => {
            console.warn(`⚠️ Fallo al cargar desde: ${possiblePaths[currentPathIndex - 1]}`);
            tryNextPath();
        };
        
        // Iniciar primer intento
        tryNextPath();
        
        // Timeout de seguridad
        setTimeout(() => {
            if (!img.complete) {
                reject(new Error('Timeout al cargar la plantilla'));
            }
        }, 10000);
    });
}
```

**Pasos de Implementación de la Solución:**

1. ✅ **PASO 1:** Renombrar archivo en el sistema de archivos
   ```bash
   # Eliminar extensión duplicada
   mv images/Baldora_share.png.png images/Baldora_share.png
   ```

2. ✅ **PASO 2:** Actualizar ruta en `share-instagram.js` línea 176
   ```javascript
   // Cambiar de:
   img.src = 'images/Baldora_share.png';
   
   // A:
   img.src = '/images/Baldora_share.png';
   ```

3. ✅ **PASO 3:** Agregar logging para debug
   ```javascript
   // Agregar después de la línea 176
   console.log('🔍 Intentando cargar plantilla desde:', img.src);
   console.log('📍 URL base del documento:', window.location.origin);
   console.log('📍 Ruta completa esperada:', new URL(img.src, window.location.href).href);
   ```

4. ✅ **PASO 4:** Mejorar el mensaje de error
   ```javascript
   // Línea 173, reemplazar:
   img.onerror = () => reject(new Error('No se pudo cargar la plantilla Baldora_share.png'));
   
   // Por:
   img.onerror = () => {
       const attemptedUrl = new URL(img.src, window.location.href).href;
       console.error('❌ Error al cargar plantilla');
       console.error('   Ruta intentada:', attemptedUrl);
       console.error('   Verificar que el archivo existe en:', '/images/Baldora_share.png');
       reject(new Error(`No se pudo cargar la plantilla desde: ${attemptedUrl}`));
   };
   ```

5. ✅ **PASO 5:** Testear en producción
   - Desplegar cambios
   - Abrir DevTools → Network → Filtrar por "Baldora_share"
   - Verificar que el status sea 200 OK (no 404)
   - Confirmar que la imagen se descarga correctamente

**Verificación Post-Implementación:**

```javascript
// En la consola del navegador (producción):
// 1. Verificar que el archivo existe
fetch('/images/Baldora_share.png')
  .then(r => console.log('✅ Archivo encontrado:', r.status))
  .catch(e => console.error('❌ Archivo no encontrado:', e));

// 2. Verificar dimensiones de la imagen
const testImg = new Image();
testImg.onload = () => console.log(`✅ Dimensiones: ${testImg.width}x${testImg.height}`);
testImg.src = '/images/Baldora_share.png';

// 3. Probar la función completa
generateShareImage();
// Debe descargar la imagen sin errores
```

**Prevención de Futuros Problemas:**

1. **📝 Documentar rutas en README:**
   ```markdown
   ## Assets de la Aplicación
   
   - Plantilla de compartir: `/images/Baldora_share.png` (1080x1920px)
   - Siempre usar rutas absolutas desde root (`/images/...`)
   - NO usar rutas relativas sin barra inicial
   ```

2. **🔧 Agregar validación en build:**
   ```javascript
   // scripts/validate-assets.js
   const fs = require('fs');
   const requiredAssets = [
       'images/Baldora_share.png'
   ];
   
   requiredAssets.forEach(asset => {
       if (!fs.existsSync(asset)) {
           console.error(`❌ Asset faltante: ${asset}`);
           process.exit(1);
       }
   });
   ```

3. **📋 Checklist pre-deploy:**
   - [ ] Verificar que `images/Baldora_share.png` existe (sin extensión duplicada)
   - [ ] Verificar que todas las rutas en JavaScript usan `/images/...` (con barra inicial)
   - [ ] Testear en ambiente de staging antes de producción
   - [ ] Revisar Network tab para confirmar que recursos se cargan con status 200

---

### Problema 1: "Botón no aparece"
**Causa:** HTML no agregado correctamente
**Solución:** Verificar que el HTML se agregó en el modal correcto

### Problema 2: "No se carga la plantilla"
**Causa:** Ruta incorrecta
**Solución:** 
```javascript
// Probar diferentes rutas:
img.src = './assets/Baldora_share.png';
img.src = '../assets/Baldora_share.png';
img.src = '/assets/Baldora_share.png';
```

### Problema 3: "Error CORS"
**Causa:** Plantilla en servidor externo
**Solución:** Asegurar que la plantilla esté en el mismo dominio

### Problema 4: "Datos no aparecen correctamente"
**Causa:** Variables de gameState incorrectas
**Solución:** Abrir consola y escribir `console.log(window.gameState)` para ver estructura

### Problema 5: "Fuente Poppins no se renderiza"
**Causa:** Fuente no cargada antes de renderizar
**Solución:** Asegurar que Poppins esté cargada en el HTML o usar fuente de respaldo

### Problema 6: "Se rompió PDF o CSV"
**Causa:** Modificación accidental de código existente
**Solución:** Revertir cambios y solo AGREGAR código nuevo

### Problema 7: "Web Share API no funciona en móvil"
**Causa:** Sitio no corre bajo HTTPS
**Solución:** 
```javascript
// Verificar protocolo
console.log('Protocolo:', window.location.protocol); // Debe ser 'https:'

// Opciones para desarrollo local:
// 1. Usar ngrok o similar para túnel HTTPS
// 2. Configurar HTTPS en servidor local
// 3. Testear en hosting con HTTPS
```

**Alternativa temporal:** La funcionalidad de descarga seguirá funcionando como fallback

---

## ✅ Checklist Final de Implementación Completa

### Código Agregado:
- [ ] Botón HTML agregado al modal
- [ ] Estilos CSS agregados al archivo de estilos
- [ ] Archivo JavaScript creado con todas las funciones
- [ ] Script vinculado en HTML

### Funcionalidad:
- [ ] Botón Instagram visible y estilizado
- [ ] Click en botón genera imagen
- [ ] Imagen se descarga automáticamente
- [ ] Imagen tiene dimensiones correctas (1080×1920)
- [ ] Los 4 contenedores aparecen con datos correctos
- [ ] Plantilla de fondo se carga correctamente

### Seguridad (No Regresión):
- [ ] PDF sigue funcionando
- [ ] CSV sigue funcionando
- [ ] Juego no afectado
- [ ] Modal funciona correctamente
- [ ] Sin errores en consola

### Calidad:
- [ ] Código comentado y documentado
- [ ] Manejo de errores implementado
- [ ] Funciona en múltiples navegadores
- [ ] Responsive en móvil y tablet

### Web Share API (Opcional):
- [ ] Código de Web Share API agregado (Paso 8)
- [ ] Botón cambia dinámicamente según dispositivo
- [ ] En desktop: descarga imagen
- [ ] En móvil con HTTPS: abre menú compartir nativo
- [ ] Instagram Stories aparece en opciones móvil
- [ ] Fallback funciona si Web Share no disponible

---

## 🎉 Implementación Completada

Si todos los checkpoints están marcados, **¡felicitaciones!** Has implementado exitosamente la funcionalidad de compartir en Instagram sin afectar el código existente.

**Próximos pasos opcionales:**
- Agregar animaciones al botón
- Implementar preview antes de descargar
- Cachear la plantilla para mejor rendimiento
- Agregar más plantillas o temas

---

**Fin de la Guía de Implementación**

