# Documento Maestro de Ingeniería: Footer Institucional y Branding

**Versión:** 1.1 (Actualizado - Inclusión de Logo Gráfico)  
**Fecha:** 16 de Diciembre, 2025  
**Proyecto:** Baldora  
**Módulo:** UI/UX - Componentes Globales  
**Estado:** 📝 Especificación Técnica

---

## 1. Visión General

El Pie de Página (Footer) actúa como el ancla institucional de la aplicación "Baldora". Su propósito es validar la autoría del proyecto (JCG Games), establecer el marco legal de distribución (Licencia MIT) y proporcionar un canal de contacto directo con la comunidad (Instagram).

Este componente debe ser consistente con el lenguaje de diseño "Acuarela Digital" definido en `Main_doc_f3.md`, manteniendo una presencia sutil que no distraiga de la experiencia de juego principal.

---

## 2. Especificaciones de Contenido

El footer se dividirá en tres bloques lógicos de información:

### 2.1. Bloque de Identidad (Izquierda)

| Propiedad | Valor |
|-----------|-------|
| **Elemento Visual** | Logotipo gráfico de JCG Games |
| **Formato** | PNG (con transparencia) o SVG |
| **Ruta** | `images/jcg_logo.png` |
| **Dimensiones** | Altura máxima de 32px para mantener la sutileza |
| **Texto de Marca** | "JCG Games" (Opcional si el logo ya incluye texto, pero recomendado para SEO/Accesibilidad) |
| **Tipografía** | Oswald (Bold, 700) |

### 2.2. Bloque Legal (Centro)

| Propiedad | Valor |
|-----------|-------|
| **Declaración** | "Open Source Project" |
| **Licencia** | "Licensed under MIT License" |
| **Año** | "© 2025" |
| **Estilo** | Texto discreto para cumplimiento técnico y transparencia |

### 2.3. Bloque de Comunidad (Derecha)

| Propiedad | Valor |
|-----------|-------|
| **Plataforma** | Instagram |
| **Handle/URL** | https://www.instagram.com/baldoragame |
| **Icono** | SVG Inline de Instagram (vectorizado para evitar cargas externas) |
| **Call to Action** | Cambio de color en hover (`--clr-rose-500`) |

---

## 3. Especificaciones de Diseño (UI)

Siguiendo estrictamente el `Main_doc_f3.md` (Design System):

### 3.1. Estructura y Color

| Propiedad | Valor | Descripción |
|-----------|-------|-------------|
| **Contenedor** | Etiqueta semántica `<footer>` | - |
| **Fondo** | `var(--clr-sand-100)` (`#FAF9F6`) | Usamos "Blanco Hueso" para diferenciarlo sutilmente del fondo principal de la app, creando una base visual sólida ("tierra") |
| **Borde Superior** | `2px sólido var(--clr-sand-300)` (`#E6DCC3`) | Mantiene la estética de "papel" y "bordes definidos" |
| **Padding** | `var(--space-lg)` (24px) vertical, `var(--space-xl)` (32px) horizontal | - |

### 3.2. Tipografía y Color de Texto

| Propiedad | Valor | Razón |
|-----------|-------|-------|
| **Fuente Principal** | `var(--font-main)` (Nunito) | - |
| **Fuente Marca** | `var(--font-display)` (Oswald) | - |
| **Color Base** | `var(--clr-rock-500)` (`#8B7E66` - Marrón roca) | El negro puro (`--clr-ink-900`) competiría con el juego. El tono roca lo hace ver como información secundaria o "impresa al pie" |
| **Color Hover (Enlaces)** | `var(--clr-rose-500)` (`#D16BA5` - Rosa Aritmética) | - |

### 3.3. Comportamiento Responsive

| Dispositivo | Breakpoint | Layout | Alineación |
|-------------|------------|--------|------------|
| **Desktop** | `> 600px` | Flexbox (`space-between`) | Izquierda - Centro - Derecha |
| **Mobile** | `< 600px` | Flexbox (`column`) | Todo Centrado con `gap: 16px` |

---

## 4. Implementación Técnica

### 4.1. Estructura HTML (Snippet)

El footer debe colocarse fuera de las vistas dinámicas (`#game-view`, etc.) para ser persistente.

> **Nota:** Se asume que el archivo de imagen existe en `images/jcg_logo.png`.

```html
<footer class="main-footer">
    <div class="footer-content">
        <!-- Marca con Logo -->
        <div class="footer-brand">
            <img src="images/jcg_logo.png" alt="JCG Games Logo" class="brand-logo">
            <span class="brand-name">JCG Games</span>
        </div>

        <!-- Legal -->
        <div class="footer-legal">
            <span>© 2025 Baldora Project.</span>
            <span class="separator">•</span>
            <a href="https://opensource.org/licenses/MIT" target="_blank" rel="noopener noreferrer">MIT License</a>
        </div>

        <!-- Social -->
        <div class="footer-social">
            <a href="https://www.instagram.com/baldoragame" target="_blank" rel="noopener noreferrer" aria-label="Síguenos en Instagram">
                <svg class="icon-instagram" viewBox="0 0 24 24" width="24" height="24" stroke="currentColor" fill="none" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                    <rect x="2" y="2" width="20" height="20" rx="5" ry="5"></rect>
                    <path d="M16 11.37A4 4 0 1 1 12.63 8 4 4 0 0 1 16 11.37z"></path>
                    <line x1="17.5" y1="6.5" x2="17.51" y2="6.5"></line>
                </svg>
            </a>
        </div>
    </div>
</footer>
```

### 4.2. Estilos CSS (Snippet)

Se añaden estilos específicos para la clase `.brand-logo`.

```css
.main-footer {
    width: 100%;
    background-color: var(--clr-sand-100);
    border-top: 2px solid var(--clr-sand-300);
    padding: var(--space-lg) var(--space-xl);
    margin-top: auto; /* Push to bottom if flex container */
    font-family: var(--font-main);
    color: var(--clr-rock-500);
    font-size: 0.9rem;
}

.footer-content {
    max-width: 1200px;
    margin: 0 auto;
    display: flex;
    justify-content: space-between;
    align-items: center;
}

/* --- BLOQUE DE MARCA --- */
.footer-brand {
    display: flex;
    align-items: center;
    gap: var(--space-sm); /* Espacio entre logo y texto */
}

.brand-logo {
    height: 32px; /* Altura controlada */
    width: auto;  /* Ancho automático para mantener proporción */
    display: block;
}

.brand-name {
    font-family: var(--font-display);
    font-weight: 700;
    font-size: 1.1rem;
    letter-spacing: 1px;
    color: var(--clr-ink-100);
}

/* --- BLOQUE LEGAL --- */
.footer-legal a {
    color: var(--clr-rock-500);
    text-decoration: none;
    border-bottom: 1px dotted var(--clr-rock-500);
    transition: color 0.2s ease;
}

.footer-legal a:hover,
.footer-social a:hover {
    color: var(--clr-rose-500);
    border-color: var(--clr-rose-500);
}

.separator {
    margin: 0 var(--space-sm);
    opacity: 0.5;
}

/* Mobile Responsive */
@media (max-width: 600px) {
    .footer-content {
        flex-direction: column;
        gap: var(--space-md);
        text-align: center;
    }
    
    .footer-brand {
        flex-direction: column; /* Apila logo sobre texto en móvil */
        gap: 4px;
    }
}
```

### 4.3. Accesibilidad y Modo Oscuro

- **Enlaces Seguros:** Todos los enlaces externos incluyen `rel="noopener noreferrer"`.
- **Texto Alternativo:** La imagen incluye `alt="JCG Games Logo"`.

**Adaptación Dark Mode:**

```css
[data-theme="dark"] .main-footer {
    background-color: var(--clr-surface-high);
    border-color: var(--clr-sand-300);
    color: var(--clr-rock-500);
}

[data-theme="dark"] .brand-name {
    color: var(--clr-ink-900);
}

/* Si el logo es oscuro, podría necesitar un filtro en modo oscuro */
[data-theme="dark"] .brand-logo {
    /* filter: brightness(0) invert(1); Descomentar si el logo es negro y necesita ser blanco */
}
```

---

## 5. Checklist de Integración

- [ ] Subir el archivo de imagen a `images/jcg_logo.png`.
- [ ] Insertar HTML del footer antes de cerrar el body.
- [ ] Agregar variables CSS y media queries al `styles.css`.
- [ ] Verificar que el SVG de Instagram se renderice correctamente.
- [ ] Verificar alineación vertical (flex) entre logo e imagen.