# Documento Maestro de Ingeniería: UX/UI Design System

**Versión:** 3.5 (Actualizado)  
**Proyecto:** Baldora  
**Fecha:** 15 de Diciembre, 2025  
**Concepto:** "Baldor Watercolor" - Acuarela Digital  
**Estado:** ✅ Implementado

---

## 1. Manifiesto de Diseño

Fusionamos la autoridad clásica del texto "Aritmética de Baldor" con la suavidad moderna de una interfaz gamificada. El concepto "Acuarela Digital" utiliza fondos blancos limpios, acentos en rosa magenta, y volúmenes suaves con sombras azuladas.

### Principios UX

| Principio | Implementación |
|-----------|----------------|
| **Carga Cognitiva Reducida** | Fondos blancos, paleta limitada, espaciado generoso |
| **Accesibilidad (a11y)** | Contraste AA/AAA, textos siempre oscuros sobre fondos claros |
| **Touch-First** | Botones mínimo 48px, áreas de clic amplias |
| **Modo Oscuro** | Soporte via `[data-theme="dark"]` |
| **Imagen de Fondo** | `images/baldora_background.png` con 60% opacidad |

---

## 2. Sistema Cromático

### 2.1. Paleta Base (Modo Día)

```css
:root {
    /* --- CIELO & VOLUMEN --- */
    --clr-sky-100:  #A2D9EF;  /* Sombras azuladas */
    --clr-sky-500:  #7EC8E3;  /* Azul Baldor */
    --clr-sky-900:  #4A90A4;  /* Azul profundo */

    /* --- SUPERFICIE --- */
    --clr-sand-100: #FAF9F6;  /* Blanco hueso */
    --clr-sand-300: #E6DCC3;  /* Beige arena (bordes) */
    --clr-rock-500: #8B7E66;  /* Marrón roca (texto secundario) */
    --clr-surface-high: #FFFFFF;  /* Fondo principal */

    /* --- ACENTO --- */
    --clr-rose-500: #D16BA5;  /* Rosa Aritmética */
    --clr-rose-700: #A84B82;  /* Rosa oscuro */

    /* --- FEEDBACK --- */
    --clr-gold-500: #DAA520;  /* Dorado (advertencias/errores) */
    --clr-green-500:#6E8C38;  /* Verde oliva (éxito) */
    --clr-ink-900:  #2C241B;  /* Negro tinta (texto principal) */
    --clr-ink-100:  #4A4A4A;  /* Gris oscuro */
}
```

### 2.2. Paleta Modo Oscuro

```css
[data-theme="dark"] {
    --clr-sky-100:  #1e293b;
    --clr-sky-500:  #0f172a;
    --clr-sky-900:  #020617;
    --clr-sand-100: #1e293b;
    --clr-sand-300: #334155;
    --clr-rock-500: #64748b;
    --clr-surface-high: #0f172a;
    --clr-rose-500: #F472B6;
    --clr-rose-700: #DB2777;
    --clr-gold-500: #FACC15;
    --clr-green-500:#86EFAC;
    --clr-ink-900:  #F1F5F9;
    --clr-ink-100:  #94a3b8;
}
```

---

## 3. Tipografía

| Uso | Fuente | Peso | Fallback |
|-----|--------|------|----------|
| **Display/Títulos** | Oswald | 400-700 | sans-serif |
| **Body/UI** | Nunito | 400-800 | sans-serif |
| **Números** | Nunito | 700-800 | sans-serif |

```css
--font-main: 'Nunito', sans-serif;
--font-display: 'Oswald', sans-serif;
```

---

## 4. Espaciado y Radios

```css
/* Spacing (8px base) */
--space-xs: 0.25rem;   /* 4px */
--space-sm: 0.5rem;    /* 8px */
--space-md: 1rem;      /* 16px */
--space-lg: 1.5rem;    /* 24px */
--space-xl: 2rem;      /* 32px */

/* Border Radius */
--radius-sm: 8px;
--radius-md: 12px;
--radius-lg: 20px;
--radius-full: 50px;
```

---

## 5. Componentes UI

### 5.1. Contenedores

Todos los paneles principales usan el mismo estilo base:

```css
.panel-base {
    background: var(--clr-surface-high);  /* Blanco */
    border: 2px solid var(--clr-sand-300);  /* Borde arena */
    border-radius: var(--radius-lg);  /* 20px */
    padding: var(--space-xl);  /* 32px */
    box-shadow: 0 10px 40px rgba(126, 200, 227, 0.15);  /* Sombra azulada */
}
```

**Clases que usan este estilo:**
- `.config-form`
- `.matrix-panel`
- `.controls-panel` (con fondo amarillo claro #fdf6b4)
- `.modal-content`
- `.chart-card`

### 5.2. Botones

#### Botón Primario (CTA)
```css
.btn-start, .btn-primary, .btn-modal {
    background: linear-gradient(to bottom, var(--clr-rose-500), var(--clr-rose-700));
    color: white;
    border: none;
    border-bottom: 4px solid #8B3A62;  /* Volumen 3D */
    border-radius: var(--radius-full);
    padding: var(--space-md) var(--space-xl);
    font-weight: 800;
    text-transform: uppercase;
    letter-spacing: 2px;
}
```

#### Estados Interactivos
```css
:hover { transform: translateY(-2px); box-shadow: 0 10px 25px rgba(209, 107, 165, 0.4); }
:active { transform: translateY(2px); border-bottom-width: 2px; }
```

#### Botón Secundario
```css
.btn-secondary, .btn-end {
    background: var(--clr-sand-100);
    border: 2px solid var(--clr-sand-300);
    color: var(--clr-rock-500);
}
```

### 5.3. Selectores de Tabla

```css
.table-btn {
    background: white;
    border: 2px solid var(--clr-sand-300);
    border-radius: var(--radius-sm);
    color: var(--clr-ink-900);
    min-width: 48px;
    min-height: 48px;
}

.table-btn.active {
    background: var(--clr-rose-500);
    border-color: var(--clr-rose-500);
    color: white;
}
```

#### Botón "Todas"
```css
.btn-select-all {
    background: var(--clr-sand-100);
    border: 2px solid var(--clr-sand-300);
    border-radius: var(--radius-sm);
    height: 36px;  /* Reducido a 3/4 */
    width: 100%;
    font-weight: 600;
}
```

### 5.4. Matriz de Juego

```css
.matrix-grid {
    display: grid;
    grid-template-columns: repeat(16, minmax(32px, 1fr));
    gap: 3px;
}

.matrix-cell {
    background: white;
    border: 1px solid var(--clr-sand-300);
    border-radius: var(--radius-sm);
    color: var(--clr-ink-900);
    aspect-ratio: 1;
    min-width: 32px;
    cursor: pointer;
    font-size: 0.65rem;
    display: flex;
    align-items: center;
    justify-content: center;
}
```

#### Estados de Celda

| Clase | Apariencia | Uso |
|-------|------------|-----|
| `.active` | Borde rosa, escala 1.15 | Operación actual |
| `.correct` | Fondo verde | Respondida correctamente |
| `.wrong` | Fondo dorado + shake | Respondida incorrectamente |
| `.show-answer` | Fondo blanco, borde negro | Mostrando resultado al clic |
| `.header` | Transparente, sin borde | Encabezados de fila/columna |
| `.disabled` | Gris atenuado | Fuera de tablas seleccionadas |
| `.weakness` | Dorado + pulse | Debilidad en modo adaptativo |
| `.hidden-adaptive` | Opacidad 0.4 | Dominada en diagnóstico |
| `.mastered` | Verde | Dominada en entrenamiento |

### 5.5. Interacción de Celdas

Al hacer clic en cualquier celda de la matriz:
1. Se reproduce sonido de hint (`baldora_sfx_hint.mp3`)
2. Se muestra el **resultado de la operación** en blanco y negro
3. El resultado permanece visible por **3 segundos**
4. Luego restaura el estado original de la celda

### 5.6. Modales

```css
.modal-overlay {
    position: fixed;
    inset: 0;
    background: rgba(0, 0, 0, 0.6);
    display: none;  /* .active para mostrar */
    z-index: 2000;
}

.modal-content {
    /* Usa .panel-base */
    max-width: 450px;
    animation: modalSlideIn 0.3s ease;
}
```

---

## 6. Imagen de Fondo

La aplicación usa una imagen de fondo con transparencia controlable:

```css
body::before {
    content: '';
    position: fixed;
    top: 0;
    left: 0;
    width: 100%;
    height: 100%;
    background-image: url('../images/baldora_background.png');
    background-size: cover;
    background-position: center;
    background-repeat: no-repeat;
    opacity: 0.6;  /* Ajustable: 0.0 - 1.0 */
    z-index: -1;
    pointer-events: none;
}

/* Modo oscuro - reducir más la opacidad */
[data-theme="dark"] body::before {
    opacity: 0.2;
}
```

---

## 7. Layout Responsive

### 7.1. Breakpoints

| Breakpoint | Descripción |
|------------|-------------|
| `> 900px` | Desktop: Grid de 2 columnas (matriz + controles) |
| `600-900px` | Tablet: Columna única, controles arriba |
| `< 600px` | Mobile: Todo apilado, celdas más pequeñas |

### 7.2. Game Layout

```css
.game-container {
    display: grid;
    grid-template-columns: 1fr 350px;
    gap: var(--space-lg);
}

@media (max-width: 900px) {
    .game-container {
        grid-template-columns: 1fr;
    }
    .controls-panel { order: -1; }
}
```

---

## 8. Transiciones

```css
--transition-fast: 0.15s ease;
--transition-normal: 0.3s cubic-bezier(0.25, 0.8, 0.25, 1);
--transition-slow: 0.5s ease;
```

Usadas en:
- Hover de botones
- Animación de modales
- Cambio de tema (colores)
- Estado de celdas

---

## 9. Animaciones Implementadas

| Animación | Uso |
|-----------|-----|
| `shake` | Celda incorrecta |
| `pulse` | Celda de debilidad (modo adaptativo) |
| `modalSlideIn` | Entrada de modales |

```css
@keyframes shake {
    0%, 100% { transform: translateX(0); }
    25% { transform: translateX(-4px); }
    75% { transform: translateX(4px); }
}

@keyframes pulse {
    0%, 100% { transform: scale(1); }
    50% { transform: scale(1.05); }
}
```

---

## 10. Estructura de Vistas

| Vista | ID | Clases Principales |
|-------|----|-------------------|
| **Configuración** | `#config-view` | `.config-container`, `.config-form` |
| **Juego** | `#game-view` | `.game-container`, `.matrix-panel`, `.controls-panel` |
| **Dashboard** | `#dashboard-view` | `.dashboard-container`, `.summary-cards`, `.charts-grid` |

### Sistema de Navegación

```css
.view { display: none; }
.view.active { display: block; }
```

---

## 11. Botón de Audio

```css
.audio-toggle-btn {
    position: fixed;
    top: 20px;
    right: 20px;
    width: 48px;
    height: 48px;
    border-radius: 50%;
    background: var(--clr-surface-high);
    border: 2px solid var(--clr-sand-300);
    font-size: 1.5rem;
    cursor: pointer;
    z-index: 1500;
}

.audio-toggle-btn.muted {
    background: var(--clr-sand-300);
    opacity: 0.7;
}
```

| Estado | Icono |
|--------|-------|
| Sonido activo | 🔊 |
| Silenciado | 🔇 |

---

## 12. Checklist de Implementación

- [x] Variables CSS definidas
- [x] Tipografía configurada (Oswald, Nunito)
- [x] Contenedores con bordes y sombras azuladas
- [x] Botones con efecto 3D (borde inferior)
- [x] Matriz responsive con scroll
- [x] Celdas muestran operación (ej: "7×8")
- [x] Modales con overlay y animación
- [x] Modo oscuro funcional
- [x] Toggle de tema persistente
- [x] Layout responsive (3 breakpoints)
- [x] Dashboard con gráficos
- [x] Imagen de fondo con opacidad configurable (60%)
- [x] Botón de audio global
- [x] Interacción de clic en celdas (mostrar resultado 3s)
