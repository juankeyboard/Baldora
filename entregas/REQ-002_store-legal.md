# REQ-002: Tienda y Paginas Legales

**Tipo:** Reporte de Requerimientos
**Fecha:** 2026-03-09
**Origen:** `docs/f16_store.md` (Iteracion 1) + `docs/f17_legal.md`
**Autor:** web_requirements_agent
**Estado:** Listo para implementacion

---

## 1. Resumen Ejecutivo

Este reporte especifica dos bloques funcionales nuevos para Baldora:

1. **Tienda (Store):** Seccion accesible solo para usuarios autenticados, con boton flotante, catalogo de productos con estilo Baldora, botones de compra que redirigen a Shopify, y vista de historial de compras.
2. **Paginas Legales:** Politica de Privacidad y Terminos y Condiciones, accesibles desde el footer y en puntos clave de aceptacion.

Ambos bloques son **estrictamente aditivos** y no deben alterar ninguna funcion, vista, flujo o estilo existente.

---

## 2. User Stories â€” Tienda

### US-STORE-01: Boton flotante de tienda

**Como** usuario autenticado
**Quiero** ver un boton flotante de tienda en el lateral derecho de la interfaz
**Para** acceder rapidamente al catalogo de productos sin abandonar mi flujo actual

**Criterios de Aceptacion:**

- [ ] El boton se muestra SOLO cuando el usuario esta autenticado (Google Sign-In activo)
- [ ] El boton esta completamente oculto (no renderizado o `display:none`) cuando no hay sesion
- [ ] Se posiciona como boton flotante fijo en el lateral derecho, integrandose al grupo `#floating-buttons-group` existente
- [ ] Usa un icono de tienda tipo storefront, claramente reconocible (SVG inline consistente con los iconos existentes)
- [ ] Incluye una animacion de destello purpura que se ejecuta cada 12 segundos con duracion de 3 segundos
- [ ] La animacion no interfiere con el rendimiento ni con otras animaciones del sistema
- [ ] Al hacer clic, navega a la vista de tienda (`#store-view`)
- [ ] Es touch-friendly: minimo 48x48px de area de interaccion

### US-STORE-02: Vista de catalogo de productos

**Como** usuario autenticado
**Quiero** ver un catalogo de productos presentados en cards con el estilo visual de Baldora
**Para** explorar lo que esta disponible para compra sin sentir que salgo de la plataforma

**Criterios de Aceptacion:**

- [ ] La vista de tienda es una nueva `<section id="store-view" class="view">` que sigue el patron SPA existente (`.view` / `.view.active`)
- [ ] Incluye un boton "Volver" que regresa a la vista anterior (CONFIG por defecto)
- [ ] Los productos se renderizan en cards/contenedores que usan `.panel-base` del design system (fondo blanco, borde arena, border-radius 20px, sombra azulada)
- [ ] Cada card muestra: imagen del producto, nombre, descripcion breve y precio
- [ ] Cada card incluye un boton de compra en color verde (`--clr-green-500` / `#6E8C38`) con estilo consistente con los botones del sistema
- [ ] El boton de compra abre el enlace de Shopify en una nueva pestana (`target="_blank"`)
- [ ] El catalogo es responsive: grid de multiples columnas en desktop, columna unica en mobile
- [ ] Los datos de productos se cargan desde un array/objeto JavaScript configurable (estructura lista para futura integracion con Shopify API)
- [ ] Si no hay productos disponibles, se muestra un estado vacio amigable

### US-STORE-03: Historial de compras

**Como** usuario autenticado
**Quiero** consultar mi historial de compras ordenado por fecha
**Para** tener control y seguimiento de mis adquisiciones

**Criterios de Aceptacion:**

- [ ] La seccion de historial es accesible desde la vista de tienda (tab o seccion interna)
- [ ] Muestra una lista de compras con: fecha, nombre del producto, estado y enlace al pedido
- [ ] El historial se ordena por fecha descendente (mas reciente primero)
- [ ] Si no hay compras registradas, se muestra un estado vacio con mensaje amigable
- [ ] La fuente de datos es un modulo JavaScript independiente preparado para consumir datos de Shopify o backend propio
- [ ] La estructura visual de cada item del historial es consistente con el design system

### US-STORE-04: Proteccion de acceso

**Como** sistema
**Quiero** que la tienda este completamente inaccesible para usuarios no autenticados
**Para** garantizar que solo usuarios registrados interactuen con funciones comerciales

**Criterios de Aceptacion:**

- [ ] No existe ningun enlace, boton o ruta que permita a un usuario no autenticado acceder a `#store-view`
- [ ] Si por manipulacion de DOM se intenta mostrar la vista, el modulo valida el estado de autenticacion y redirige a CONFIG
- [ ] El boton flotante de tienda no se inyecta en el DOM hasta que `firebase.auth().currentUser` sea valido

---

## 3. User Stories â€” Paginas Legales

### US-LEGAL-01: Pagina de Politica de Privacidad

**Como** usuario de Baldora
**Quiero** poder leer la politica de privacidad de la plataforma
**Para** saber que datos se recopilan, como se usan y cuales son mis derechos

**Criterios de Aceptacion:**

- [ ] Existe una nueva vista `<section id="privacy-view" class="view">` con el contenido de la seccion 1 de `docs/f17_legal.md`
- [ ] El contenido se presenta en formato legible con el estilo visual de Baldora (tipografia Nunito, colores del design system)
- [ ] Incluye boton "Volver" que regresa a la vista anterior
- [ ] La fecha de ultima actualizacion es visible al inicio del documento
- [ ] Es accesible desde el footer principal (`<footer class="main-footer">`)

### US-LEGAL-02: Pagina de Terminos y Condiciones

**Como** usuario de Baldora
**Quiero** poder leer los terminos y condiciones del servicio
**Para** entender las reglas de uso, compras y responsabilidades

**Criterios de Aceptacion:**

- [ ] Existe una nueva vista `<section id="terms-view" class="view">` con el contenido de la seccion 2 de `docs/f17_legal.md`
- [ ] Mismo estilo visual que la politica de privacidad
- [ ] Incluye boton "Volver"
- [ ] Fecha de ultima actualizacion visible
- [ ] Accesible desde el footer principal

### US-LEGAL-03: Enlaces en el footer

**Como** usuario
**Quiero** encontrar enlaces a las paginas legales en el footer
**Para** poder consultarlas en cualquier momento

**Criterios de Aceptacion:**

- [ ] Se agregan dos enlaces al bloque `.footer-legal` existente: "Politica de Privacidad" y "Terminos y Condiciones"
- [ ] Los enlaces usan `<a>` con estilo consistente (mismo tratamiento que el enlace "MIT License" existente)
- [ ] Al hacer clic, navegan a las vistas correspondientes (`#privacy-view`, `#terms-view`)
- [ ] Se mantiene el separador visual (`<span class="separator">`) entre elementos del footer

### US-LEGAL-04: Consentimiento en primer login

**Como** sistema
**Quiero** mostrar un aviso de aceptacion de terminos y privacidad al usuario durante su primer login con Google
**Para** cumplir con la Ley 1581 de 2012 y el principio de consentimiento informado

**Criterios de Aceptacion:**

- [ ] Al completar el primer login exitoso, se muestra un modal de consentimiento
- [ ] El modal contiene un resumen breve con enlaces a las paginas completas
- [ ] El usuario debe aceptar explicitamente (checkbox + boton "Aceptar") para continuar
- [ ] La aceptacion se registra en Firebase Realtime Database bajo el nodo del usuario con timestamp
- [ ] Si el usuario no acepta, se cierra la sesion y se muestra un mensaje informativo
- [ ] En logins subsecuentes, si ya existe registro de aceptacion, no se vuelve a mostrar
- [ ] El modal usa `.modal-overlay` y `.modal-content` del design system existente

---

## 4. Especificaciones Tecnicas

### 4.1 Archivos nuevos a crear

| Archivo | Responsabilidad |
|---------|----------------|
| `js/store.js` | Modulo de tienda: renderizado de catalogo, manejo de productos, historial, proteccion de acceso |
| `js/legal.js` | Modulo de paginas legales: renderizado de contenido, navegacion, modal de consentimiento |
| `css/store.css` | Estilos especificos de la tienda (cards, boton flotante, animacion destello) |
| `css/legal.css` | Estilos especificos de paginas legales |

### 4.2 Archivos existentes a modificar (solo adiciones)

| Archivo | Modificacion |
|---------|-------------|
| `index.html` | Agregar `<section id="store-view">`, `<section id="privacy-view">`, `<section id="terms-view">`, boton flotante de tienda en `#floating-buttons-group`, enlaces legales en footer, `<link>` a CSS nuevos, `<script>` de JS nuevos, modal de consentimiento |

### 4.3 Estructura del modulo store.js

```javascript
const BaldoraStore = {
    // Configuracion
    products: [], // Array de productos (estructura preparada para Shopify)
    purchaseHistory: [], // Historial de compras del usuario

    // Inicializacion
    init() {},

    // Renderizado
    renderCatalog() {},
    renderProductCard(product) {},
    renderHistory() {},
    renderEmptyState(type) {},

    // Navegacion
    show() {},
    hide() {},

    // Proteccion
    checkAuth() {},

    // Datos
    loadProducts() {},
    loadHistory(userId) {},
};
```

### 4.4 Estructura de datos de producto

```javascript
{
    id: "prod_001",
    name: "Nombre del producto",
    description: "Descripcion breve",
    price: "29.900 COP",
    image: "images/store/product_001.jpg",
    shopifyUrl: "https://tienda.shopify.com/products/xxx",
    available: true
}
```

### 4.5 Estructura de datos de historial de compra

```javascript
{
    id: "order_001",
    productName: "Nombre del producto",
    date: "2026-03-09T14:30:00Z",
    status: "completed", // "completed" | "pending" | "cancelled"
    shopifyOrderUrl: "https://tienda.shopify.com/orders/xxx"
}
```

### 4.6 Animacion de destello purpura (CSS)

```css
@keyframes store-sparkle {
    0%, 80%, 100% { box-shadow: 0 0 0 0 rgba(161, 75, 130, 0); }
    90% { box-shadow: 0 0 12px 4px rgba(161, 75, 130, 0.6); }
}

.store-float-btn {
    animation: store-sparkle 12s ease-in-out infinite;
}
```

Nota: La animacion tiene un ciclo de 12s donde el destello ocupa el rango del 80% al 100% (equivalente a ~2.4s de efecto visual, ajustable para alcanzar los 3s requeridos). El valor exacto del timing se ajustara en implementacion.

### 4.7 Boton flotante â€” posicionamiento

El boton se integra al grupo `#floating-buttons-group` existente (linea 80 del index.html), que ya contiene:
1. Google Sign-In / Avatar
2. Idioma
3. Audio
4. Patreon
5. Ayuda/Tour

El boton de tienda se agrega como un elemento mas del grupo, visible solo cuando `auth.currentUser` existe. Debe respetar la clase `.floating-btn` existente.

### 4.8 Patron SPA â€” navegacion

Las vistas nuevas siguen el patron existente:

```css
.view { display: none; }
.view.active { display: block; }
```

La funcion `App.showView()` (en `app.js`) maneja el cambio de vistas. Los modulos nuevos deben usar este patron sin modificar la funcion existente. Si se necesita extender la navegacion, hacerlo de forma aditiva mediante hooks o llamadas desde los modulos nuevos.

### 4.9 Modal de consentimiento legal

```html
<div id="consent-modal" class="modal-overlay">
    <div class="modal-content">
        <h3>Terminos y Privacidad</h3>
        <p>Al continuar, aceptas nuestra
            <a href="#" onclick="Legal.showPrivacy()">Politica de Privacidad</a> y
            <a href="#" onclick="Legal.showTerms()">Terminos y Condiciones</a>.
        </p>
        <label class="consent-checkbox">
            <input type="checkbox" id="consent-check">
            He leido y acepto los terminos y la politica de privacidad
        </label>
        <div class="consent-actions">
            <button class="btn-primary" id="btn-consent-accept" disabled>Aceptar</button>
            <button class="btn-secondary" id="btn-consent-decline">Cancelar</button>
        </div>
    </div>
</div>
```

### 4.10 Registro de consentimiento en Firebase

```
/users/{userId}/consent: {
    accepted: true,
    timestamp: "2026-03-09T14:30:00Z",
    version: "1.0"
}
```

---

## 5. Compatibilidad con Design System "Baldor Watercolor"

### Paleta de colores a usar

| Elemento | Variable CSS | Valor |
|----------|-------------|-------|
| Card de producto (fondo) | `--clr-surface-high` | #FFFFFF |
| Card de producto (borde) | `--clr-sand-300` | #E6DCC3 |
| Card de producto (sombra) | Sombra azulada | rgba(126, 200, 227, 0.15) |
| Boton de compra (fondo) | `--clr-green-500` | #6E8C38 |
| Boton de compra (texto) | Blanco | #FFFFFF |
| Destello del boton flotante | Purpura derivado de rose | rgba(161, 75, 130, 0.6) |
| Texto principal | `--clr-ink-900` | #2C241B |
| Texto secundario | `--clr-rock-500` | #8B7E66 |
| Precio | `--clr-rose-500` | #D16BA5 |

### Tipografia

- Titulos de seccion: `Oswald`, 400-700
- Nombres de producto y body: `Nunito`, 400-800
- Precios: `Nunito`, 700-800

### Componentes reutilizables

- Cards de producto: Basadas en `.panel-base`
- Boton de compra: Estilo nuevo verde, pero con el mismo patron 3D (border-bottom) de `.btn-primary`
- Modal de consentimiento: Usa `.modal-overlay` + `.modal-content` existentes
- Boton "Volver": Mismo estilo que `.btn-back-profile` existente en profile-view

### Modo oscuro

Todos los componentes nuevos deben respetar `[data-theme="dark"]` usando las variables CSS del design system. No hardcodear colores.

### Responsive

- Desktop (>900px): Grid de 3 columnas para cards de producto
- Tablet (600-900px): Grid de 2 columnas
- Mobile (<600px): Columna unica

---

## 6. Integracion con Arquitectura SPA

### Vistas actuales del sistema

```
CONFIG (config-view) --> PLAYING (game-view) --> DASHBOARD (dashboard-view)
                    \--> PROFILE (profile-view)
```

### Vistas nuevas (aditivas)

```
CONFIG --> PLAYING --> DASHBOARD
  |  \--> PROFILE
  |  \--> STORE (store-view)        [solo autenticado]
  \----> PRIVACY (privacy-view)     [publico, desde footer]
  \----> TERMS (terms-view)         [publico, desde footer]
```

### Reglas de navegacion

- `store-view`: Solo accesible via boton flotante, solo si hay sesion activa
- `privacy-view` y `terms-view`: Accesibles desde cualquier vista via footer
- Al salir de store/privacy/terms, se regresa a la vista desde la que se llego (o CONFIG por defecto)

---

## 7. Preguntas Abiertas (documentadas en f16_store.md)

Estas preguntas quedan registradas para decision futura. La implementacion actual debe preparar la estructura para que cualquier respuesta sea integrable sin reescribir:

1. Fuente del historial de compras: Shopify API, backend propio o ambos
2. Visibilidad del boton flotante: todas las vistas autenticadas o solo ciertas secciones
3. Campos exactos del producto desde Shopify
4. Compra en nueva pestana (recomendado y especificado) vs. reemplazar vista
5. Historial: solo compras completadas vs. todos los estados

---

## 8. Prioridad de Implementacion

| Orden | Componente | Justificacion |
|-------|-----------|---------------|
| 1 | Paginas legales (privacy-view, terms-view) + enlaces en footer | Requisito legal base, no depende de autenticacion |
| 2 | Boton flotante de tienda | Punto de entrada, depende de auth |
| 3 | Vista de catalogo (store-view) + cards de producto | Funcionalidad principal de tienda |
| 4 | Modal de consentimiento legal | Depende de paginas legales + auth |
| 5 | Historial de compras | Depende de estructura de datos de tienda |

---

## 9. Criterios de Completitud

El requerimiento se considera implementado cuando:

- [ ] Todas las vistas nuevas renderizan correctamente en modo claro y oscuro
- [ ] El boton flotante de tienda aparece/desaparece segun estado de autenticacion
- [ ] La animacion de destello purpura funciona con el timing especificado
- [ ] Las cards de producto siguen el design system Baldor Watercolor
- [ ] Los botones de compra redirigen correctamente (nueva pestana)
- [ ] Las paginas legales son accesibles desde el footer
- [ ] El modal de consentimiento se muestra en primer login y registra aceptacion
- [ ] La navegacion SPA funciona sin romper el flujo CONFIG/PLAYING/DASHBOARD
- [ ] El responsive funciona en los 3 breakpoints (mobile, tablet, desktop)
- [ ] Ningun archivo JS/CSS existente fue modificado (solo index.html recibe adiciones)

