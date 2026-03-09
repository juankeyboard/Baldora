# REQ-001: Mejora de Botones Flotantes - Idioma con Banderas, Patreon y Alineacion

> Generado por: web_requirements_agent
> Fecha: 2026-03-09
> Proyecto: Baldora
> Estado: Listo para implementacion

---

## 1. Resumen Ejecutivo

Tres mejoras interrelacionadas sobre el sistema de botones flotantes globales de Baldora:

1. **Reemplazo del selector de idioma** (dropdown ES/EN) por un boton flotante circular con iconos de bandera.
2. **Nuevo boton flotante de Patreon** con animacion de destello periodico.
3. **Reagrupacion y alineacion** de todos los botones flotantes en el lado derecho de la pantalla, apilados verticalmente.

---

## 2. User Stories

### US-001: Boton de idioma con banderas
**Como** usuario de Baldora,
**quiero** ver un boton flotante con la bandera del idioma actual (ES/EN),
**para que** sea visualmente intuitivo y consistente con los demas botones flotantes.

### US-002: Boton flotante de Patreon
**Como** usuario de Baldora,
**quiero** ver un boton flotante con el logo de Patreon que tenga un efecto de destello periodico,
**para que** pueda acceder facilmente a la pagina de apoyo del proyecto.

### US-003: Alineacion de botones flotantes
**Como** usuario de Baldora,
**quiero** que todos los botones flotantes esten agrupados ordenadamente en el lado derecho de la pantalla,
**para que** la interfaz se vea limpia y consistente tanto en movil como en desktop.

---

## 3. Criterios de Aceptacion

### US-001: Boton de idioma con banderas

| # | Criterio | Verificacion |
|---|----------|-------------|
| AC-1.1 | El `<select>` actual (`#lang-selector-wrapper`) se reemplaza por un `<button>` circular flotante | Inspeccionar DOM |
| AC-1.2 | El boton muestra un icono SVG de bandera: bandera de Espana cuando `lang=es`, bandera de USA cuando `lang=en` | Visual en ambos idiomas |
| AC-1.3 | Al hacer clic, el idioma cambia (invocando `I18n.setLanguage()`) y el icono de bandera se actualiza | Clic y verificar cambio |
| AC-1.4 | El boton tiene las mismas dimensiones (48x48px), forma circular y estilo visual que `#btn-audio-toggle` y `#btn-help-tour` | Comparar visualmente |
| AC-1.5 | Funciona correctamente en desktop (>768px) y movil (<=768px) | Probar ambos viewports |
| AC-1.6 | El idioma seleccionado persiste en `localStorage` (comportamiento existente de `I18n`) | Recargar pagina y verificar |
| AC-1.7 | El atributo `title` muestra "Cambiar idioma" / "Change language" segun el idioma activo | Hover sobre el boton |

### US-002: Boton flotante de Patreon

| # | Criterio | Verificacion |
|---|----------|-------------|
| AC-2.1 | Nuevo boton flotante circular (48x48px) con el logo SVG de Patreon | Inspeccionar DOM |
| AC-2.2 | Al hacer clic, abre `https://www.patreon.com/15270903/join` en una nueva pestana | Clic y verificar URL |
| AC-2.3 | El boton tiene un efecto de "destello" (glow/flash) que se activa cada 12 segundos | Observar durante 30+ segundos |
| AC-2.4 | La animacion de destello es sutil (no molesta), usando colores del brand Patreon (#FF424D) | Visual |
| AC-2.5 | El boton es consistente en estilo con los demas botones flotantes | Comparar visualmente |
| AC-2.6 | Tiene `target="_blank"` y `rel="noopener noreferrer"` | Inspeccionar HTML |
| AC-2.7 | Tiene `aria-label="Apoyanos en Patreon"` | Inspeccionar HTML |
| AC-2.8 | Funciona correctamente en desktop y movil | Probar ambos viewports |

### US-003: Alineacion de botones flotantes

| # | Criterio | Verificacion |
|---|----------|-------------|
| AC-3.1 | Todos los botones flotantes estan agrupados en un contenedor `position: fixed` en el lado derecho | Inspeccionar CSS |
| AC-3.2 | Orden de arriba a abajo: Audio, Idioma, Ayuda (?), Patreon | Visual |
| AC-3.3 | Separacion uniforme entre botones (8-12px gap) | Inspeccionar CSS |
| AC-3.4 | En movil (<=768px): los botones se reducen a 40x40px y el margen right se reduce a 12px | Probar viewport movil |
| AC-3.5 | Los botones no se superponen con el boton de autenticacion Google (`#auth-header-btn`) | Visual en ambos viewports |
| AC-3.6 | Los botones no interfieren con el contenido del juego durante la partida | Jugar una partida completa |
| AC-3.7 | El z-index del grupo es consistente (1500, igual que los botones actuales) | Inspeccionar CSS |

---

## 4. Especificaciones Tecnicas de Implementacion

### 4.1 Arquitectura HTML

#### Estado actual de los botones flotantes (index.html lineas 79-92):

```html
<!-- Linea 80: Audio toggle - position: fixed, top: 20px, right: 20px -->
<button id="btn-audio-toggle" class="audio-toggle-btn" ...>

<!-- Lineas 84-89: Selector de idioma - position: fixed, top: 24px, LEFT: 20px (LADO IZQUIERDO) -->
<div id="lang-selector-wrapper" class="lang-selector-wrapper">
    <select id="lang-selector" class="lang-selector" ...>

<!-- Linea 92: Boton ayuda - position: fixed, top: 76px, right: 20px -->
<button id="btn-help-tour" class="btn-help-tour" ...>
```

#### Implementacion propuesta:

**Paso 1: Crear contenedor de botones flotantes**

Reemplazar los tres elementos individuales (lineas 79-92 del `index.html`) por un contenedor flex vertical:

```html
<!-- ===== BOTONES FLOTANTES (Grupo Derecho) ===== -->
<div id="floating-buttons-group" class="floating-buttons-group">

    <!-- 1. Audio Toggle -->
    <button type="button" id="btn-audio-toggle" class="floating-btn audio-toggle-btn"
        onclick="AudioManager.toggleMute()" title="Silenciar">&#128266;</button>

    <!-- 2. Idioma Toggle (NUEVO - reemplaza select) -->
    <button type="button" id="btn-lang-toggle" class="floating-btn lang-toggle-btn"
        onclick="I18n.toggleLanguage()" title="Cambiar idioma">
        <!-- SVG de bandera se inyecta via JS -->
    </button>

    <!-- 3. Ayuda Tour -->
    <button type="button" id="btn-help-tour" class="floating-btn btn-help-tour"
        title="Ver tutorial">?</button>

    <!-- 4. Patreon (NUEVO) -->
    <a href="https://www.patreon.com/15270903/join" target="_blank" rel="noopener noreferrer"
       id="btn-patreon-float" class="floating-btn patreon-float-btn"
       aria-label="Apoyanos en Patreon">
        <svg viewBox="0 0 24 24" width="22" height="22" fill="currentColor">
            <path d="M15.386.524c-4.764 0-8.64 3.876-8.64 8.64 0 4.75 3.876 8.613 8.64 8.613 4.75 0 8.614-3.864 8.614-8.613C24 4.4 20.136.524 15.386.524zM.003 23.476h4.22V.524H.003v22.952z"/>
        </svg>
    </a>

</div>
```

**IMPORTANTE**: Eliminar el elemento `<div id="lang-selector-wrapper">` completo (lineas 84-89) y el `<select>` interno. El nuevo boton `#btn-lang-toggle` lo reemplaza funcionalmente.

**Paso 2: SVGs de banderas para el boton de idioma**

Usar SVGs inline minificados (no emojis, ya que los emojis de bandera no se renderizan bien en Windows):

**Bandera de Espana (ES):**
```html
<svg viewBox="0 0 36 36" width="24" height="24">
    <rect fill="#C60A1D" width="36" height="36" rx="4"/>
    <rect fill="#FFC400" y="9" width="36" height="18"/>
</svg>
```

**Bandera de USA (EN):**
```html
<svg viewBox="0 0 36 36" width="24" height="24">
    <rect fill="#B22234" width="36" height="36" rx="4"/>
    <rect fill="#FFF" y="2.77" width="36" height="2.77"/>
    <rect fill="#FFF" y="8.31" width="36" height="2.77"/>
    <rect fill="#FFF" y="13.85" width="36" height="2.77"/>
    <rect fill="#FFF" y="19.38" width="36" height="2.77"/>
    <rect fill="#FFF" y="24.92" width="36" height="2.77"/>
    <rect fill="#FFF" y="30.46" width="36" height="2.77"/>
    <rect fill="#3C3B6E" width="14.4" height="19.38"/>
</svg>
```

### 4.2 Especificaciones CSS

#### 4.2.1 Contenedor del grupo flotante (NUEVO)

```css
/* ===== GRUPO DE BOTONES FLOTANTES (Derecha) ===== */
.floating-buttons-group {
    position: fixed;
    top: 20px;
    right: 20px;
    display: flex;
    flex-direction: column;
    gap: 10px;
    z-index: 1500;
}
```

#### 4.2.2 Estilo base compartido para botones flotantes (NUEVO)

```css
.floating-btn {
    width: 48px;
    height: 48px;
    border-radius: 50%;
    background: var(--clr-surface-high);
    border: 2px solid var(--clr-sand-300);
    cursor: pointer;
    display: flex;
    align-items: center;
    justify-content: center;
    box-shadow: 0 4px 12px rgba(0, 0, 0, 0.15);
    transition: all var(--transition-fast);
    text-decoration: none;
    color: var(--clr-rock-500);
}

.floating-btn:hover {
    transform: scale(1.1);
    box-shadow: 0 6px 16px rgba(0, 0, 0, 0.2);
}

.floating-btn:active {
    transform: scale(0.95);
}
```

#### 4.2.3 Modificaciones a estilos existentes

Los estilos existentes de `.audio-toggle-btn` y `.btn-help-tour` deben **conservarse** pero se les debe **remover** las propiedades `position`, `top`, `right` ya que ahora el posicionamiento lo controla el contenedor padre `.floating-buttons-group`. Las demas propiedades (colores, estados) se mantienen intactas.

Propiedades a remover de `.audio-toggle-btn` (linea 1751):
- `position: fixed;`
- `top: 20px;`
- `right: 20px;`
- `z-index: 1500;`

Propiedades a remover de `.btn-help-tour` (linea 1938):
- `position: fixed;`
- `top: 76px;`
- `right: 20px;`
- `z-index: 1400;`

Propiedades a remover completamente (se pueden eliminar los bloques):
- `.lang-selector-wrapper` (linea 1910) - ya no se usa
- `.lang-selector` (linea 1917) - ya no se usa
- `.lang-selector:hover, .lang-selector:focus` (linea 1931) - ya no se usa

#### 4.2.4 Boton de idioma (NUEVO)

```css
/* Boton de idioma con bandera */
.lang-toggle-btn {
    font-size: 1.3rem;
    padding: 0;
    overflow: hidden;
}

.lang-toggle-btn svg {
    width: 24px;
    height: 24px;
    border-radius: 3px;
}
```

#### 4.2.5 Boton de Patreon con destello (NUEVO)

```css
/* Boton flotante Patreon */
.patreon-float-btn {
    color: #FF424D; /* Brand color Patreon */
}

.patreon-float-btn:hover {
    border-color: #FF424D;
    color: #FF424D;
}

/* Animacion de destello cada 12 segundos */
@keyframes patreon-glow {
    0%, 90% {
        box-shadow: 0 4px 12px rgba(0, 0, 0, 0.15);
        border-color: var(--clr-sand-300);
    }
    95% {
        box-shadow: 0 0 20px rgba(255, 66, 77, 0.6), 0 0 40px rgba(255, 66, 77, 0.3);
        border-color: #FF424D;
    }
    100% {
        box-shadow: 0 4px 12px rgba(0, 0, 0, 0.15);
        border-color: var(--clr-sand-300);
    }
}

.patreon-float-btn {
    animation: patreon-glow 12s ease-in-out infinite;
}
```

#### 4.2.6 Responsive (movil)

```css
@media (max-width: 768px) {
    .floating-buttons-group {
        top: 12px;
        right: 12px;
        gap: 8px;
    }

    .floating-btn {
        width: 40px;
        height: 40px;
    }

    .lang-toggle-btn svg {
        width: 20px;
        height: 20px;
    }

    .patreon-float-btn svg {
        width: 18px;
        height: 18px;
    }

    .btn-help-tour {
        font-size: 1.1rem;
    }

    .audio-toggle-btn {
        font-size: 1.2rem;
    }
}
```

### 4.3 Especificaciones JavaScript

#### 4.3.1 Nuevo metodo en I18n: `toggleLanguage()` (en `js/i18n.js`)

Agregar este metodo al objeto `I18n`:

```javascript
/**
 * Alterna entre 'es' y 'en' y actualiza el icono de bandera
 */
toggleLanguage() {
    const newLang = this.currentLang === 'es' ? 'en' : 'es';
    this.setLanguage(newLang);
    this.updateFlagIcon();
},

/**
 * Actualiza el SVG de bandera en el boton de idioma
 */
updateFlagIcon() {
    const btn = document.getElementById('btn-lang-toggle');
    if (!btn) return;

    const flagES = `<svg viewBox="0 0 36 36" width="24" height="24">
        <rect fill="#C60A1D" width="36" height="36" rx="4"/>
        <rect fill="#FFC400" y="9" width="36" height="18"/>
    </svg>`;

    const flagEN = `<svg viewBox="0 0 36 36" width="24" height="24">
        <rect fill="#B22234" width="36" height="36" rx="4"/>
        <rect fill="#FFF" y="2.77" width="36" height="2.77"/>
        <rect fill="#FFF" y="8.31" width="36" height="2.77"/>
        <rect fill="#FFF" y="13.85" width="36" height="2.77"/>
        <rect fill="#FFF" y="19.38" width="36" height="2.77"/>
        <rect fill="#FFF" y="24.92" width="36" height="2.77"/>
        <rect fill="#FFF" y="30.46" width="36" height="2.77"/>
        <rect fill="#3C3B6E" width="14.4" height="19.38"/>
    </svg>`;

    btn.innerHTML = this.currentLang === 'es' ? flagES : flagEN;
    btn.title = this.currentLang === 'es' ? 'Cambiar idioma' : 'Change language';
},
```

**Modificacion a `I18n.init()`**: Agregar llamada a `this.updateFlagIcon()` al final del metodo `init()` existente.

**Modificacion a `I18n.setLanguage()`**: Agregar llamada a `this.updateFlagIcon()` despues de aplicar traducciones. NO modificar la logica existente del selector `<select>` — simplemente agregar al final del metodo. Si el `<select>` ya no existe en el DOM, las lineas que lo referencian no causaran errores (usar optional chaining o null check).

#### 4.3.2 Limpieza de referencia al selector antiguo

En `I18n.setLanguage()` o `I18n.init()`, si hay lineas que establecen `document.getElementById('lang-selector').value = ...`, deben protegerse con un null check:

```javascript
const langSelect = document.getElementById('lang-selector');
if (langSelect) langSelect.value = code;
```

Esto asegura compatibilidad si el `<select>` se elimina del HTML.

#### 4.3.3 Sin cambios en `app.js`

El archivo `app.js` NO necesita modificaciones. La inicializacion de `I18n.init()` ya existe en `App.init()` (linea 74-76).

---

## 5. Ubicacion de la URL de Patreon

La URL de Patreon actualmente se encuentra en el footer del `index.html`:

- **Archivo**: `index.html`
- **Linea**: 801
- **URL exacta**: `https://www.patreon.com/15270903/join`
- **Contexto HTML**: Dentro de `.footer-social` junto a iconos de Instagram y LinkedIn

---

## 6. Notas de Compatibilidad con el Design System

### Design System "Baldor Watercolor"

| Aspecto | Especificacion |
|---------|---------------|
| **Variables CSS** | Usar `var(--clr-surface-high)`, `var(--clr-sand-300)`, `var(--clr-rock-500)`, `var(--transition-fast)` |
| **Bordes** | `2px solid var(--clr-sand-300)` — consistente con botones existentes |
| **Sombras** | `box-shadow: 0 4px 12px rgba(0, 0, 0, 0.15)` — identico a audio toggle |
| **Hover** | `transform: scale(1.1)` + sombra ampliada — patron existente |
| **Active** | `transform: scale(0.95)` — patron existente |
| **Forma** | Circular (`border-radius: 50%`) |
| **Tamano** | 48x48px desktop, 40x40px movil |
| **Modo oscuro** | Los botones heredan `var(--clr-surface-high)` y `var(--clr-sand-300)` que ya tienen valores dark mode definidos |
| **Boton Patreon** | Usar color brand `#FF424D` para el icono y el glow, no los colores del design system |

### Regla critica del proyecto

Todo el codigo nuevo es **estrictamente aditivo**:
- Se agrega un contenedor wrapper para los botones existentes (no se altera su funcionalidad).
- Se agregan nuevos metodos a `I18n` (no se modifican los existentes).
- Se agregan nuevas clases CSS (las existentes solo pierden propiedades de posicionamiento que ahora maneja el padre).
- El footer de Patreon permanece intacto — el boton flotante es un acceso adicional.

---

## 7. Archivos a Modificar

| Archivo | Tipo de cambio |
|---------|---------------|
| `index.html` | Reemplazar lineas 79-92 con grupo flotante, agregar boton Patreon, eliminar `<select>` de idioma |
| `css/styles.css` | Agregar estilos del grupo flotante, boton idioma, boton Patreon, animacion glow. Ajustar `.audio-toggle-btn` y `.btn-help-tour` removiendo position/top/right. Eliminar `.lang-selector-wrapper` y `.lang-selector`. |
| `js/i18n.js` | Agregar `toggleLanguage()`, `updateFlagIcon()`. Modificar `init()` y `setLanguage()` para llamar a `updateFlagIcon()`. Proteger referencias al `<select>` eliminado. |

---

## 8. Riesgos y Mitigaciones

| Riesgo | Mitigacion |
|--------|-----------|
| Los emojis de bandera no se renderizan bien en Windows | Usar SVG inline en lugar de emojis Unicode |
| El boton de ayuda (?) se oculta/muestra dinamicamente via JS (`helpBtn.style.display`) | Asegurar que el contenedor flex no colapse cuando un hijo tiene `display: none` — los demas botones deben mantener su posicion |
| La animacion de glow del Patreon podria ser molesta | El keyframe esta disenado para que el 90% del tiempo sea estado normal, con un flash muy breve al 95% |
| El boton de autenticacion Google (`#auth-header-btn`) podria superponerse | El auth button esta posicionado de forma independiente — verificar que no colisione con el grupo flotante en movil |
| El `<select>` de idioma se referencia en `I18n` | Proteger con null check para evitar errores |

---

## 9. Plan de Testing

1. **Desktop (1920x1080)**: Verificar alineacion visual de los 4 botones en el lado derecho.
2. **Tablet (768px)**: Verificar transicion de tamanos y que no se superponga con el auth button.
3. **Movil (375px)**: Verificar que los botones se reducen a 40x40px y no obstruyen el contenido.
4. **Cambio de idioma**: Clic en bandera -> cambia idioma -> bandera cambia -> persistencia en localStorage.
5. **Patreon link**: Clic -> abre nueva pestana con URL correcta.
6. **Patreon glow**: Observar 30+ segundos -> flash cada 12 segundos.
7. **Modo oscuro**: Toggle dark mode -> botones mantienen coherencia visual.
8. **Juego completo**: Jugar una partida en los 3 modos -> botones no interfieren con gameplay.
9. **Tour de ayuda**: El boton (?) se muestra/oculta correctamente segun la vista activa.

---

*Reporte generado por web_requirements_agent para ejecucion por web_engineer_agent.*
