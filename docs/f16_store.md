# Baldora - Ideas de la Seccion Tienda

**Estado:** En definicion
**Ultima actualizacion:** 2026-03-09

---

## Objetivo

Documentar ideas de la seccion **Tienda** por iteracion para facilitar priorizacion, refinamiento y seguimiento.

---

## Como usar este documento

- Agregar una nueva iteracion cuando aparezca un bloque de ideas consistente.
- Mantener ideas cortas, evaluables y orientadas a producto.
- Marcar decisiones cuando una idea pase de exploracion a definicion.

---

## Iteracion 0 - Idea inicial

**Fecha:** 2026-03-09
**Estado:** Abierta

### Objetivo de la iteracion

Definir primeras ideas para la experiencia de tienda dentro de Baldora.

### Ideas

- Pendiente por completar.

### Preguntas abiertas

- Que tipo de productos o servicios va a vender la tienda.
- Si la tienda sera una seccion independiente o una extension del flujo principal.
- Que informacion minima necesita cada producto.

### Decisiones

- Sin decisiones registradas todavia.

---

## Iteracion 1 - Definicion funcional inicial

**Fecha:** 2026-03-09
**Estado:** Abierta

### Objetivo de la iteracion

Definir el acceso, la presentacion visual y la integracion base de la tienda con Shopify dentro de la experiencia de usuario registrado.

### Ideas

- La tienda debe estar disponible solo para usuarios registrados dentro de su vista autenticada.
- El acceso a la tienda se realiza desde un boton flotante fijo al lado derecho de la interfaz.
- El boton flotante debe usar un icono de tienda con referencia visual tipo Google.
- El icono debe incluir un destello purpura cada 12 segundos con una duracion de 3 segundos para llamar la atencion sin ser invasivo.
- La pagina de tienda debe usar contenedores con el mismo lenguaje visual del resto de la plataforma.
- Cada contenedor debe incluir un boton de compra en color verde.
- El boton de compra debe abrir directamente el enlace externo de compra.
- Los enlaces de compra se completaran mas adelante.
- El destino de compra sera una pagina de Shopify por producto.
- El usuario debe poder consultar su historial de compra ordenado o filtrado por fecha.
- La tienda debe obtener imagenes e informacion del producto desde el enlace o integracion de Shopify.
- La informacion importada desde Shopify debe adaptarse automaticamente al estilo visual de Baldora.

### Requisitos funcionales

- Mostrar acceso a tienda solo en sesion autenticada.
- Ocultar o bloquear por completo el acceso en vistas publicas.
- Renderizar productos en cards o contenedores consistentes con el sistema visual actual.
- Permitir redireccion directa al checkout o pagina del producto en Shopify.
- Exponer una vista de historial de compras asociada al usuario.
- Organizar el historial con criterio de fecha.

### Requisitos visuales y de interaccion

- Boton flotante fijo en lateral derecho.
- Icono de tienda claramente reconocible.
- Animacion de destello purpura cada 12 segundos.
- Duracion del destello: 3 segundos.
- Boton de compra verde y visible dentro de cada contenedor.
- Adaptacion del contenido de Shopify al estilo de la pagina, no embebido con apariencia externa sin ajustar.

### Dependencias e integraciones

- Shopify como fuente de enlaces de compra.
- Shopify como posible fuente de imagenes, nombre, descripcion, precio y metadata del producto.
- Sistema de autenticacion de Baldora para restringir acceso.
- Fuente de datos para historial de compras por usuario y fecha.

### Preguntas abiertas

- Si el historial de compras vendra desde Shopify, desde un backend propio o desde ambos.
- Si el boton flotante debe mostrarse en todas las vistas autenticadas o solo en ciertas secciones.
- Que campos exactos del producto se van a consumir desde Shopify.
- Si la compra abre una nueva pestana o reemplaza la vista actual.
- Si el historial mostrara solo compras completadas o tambien ordenes pendientes, canceladas o reembolsadas.

### Decisiones

- La tienda no sera publica.
- El acceso principal sera un boton flotante lateral derecho.
- La compra saldra hacia Shopify.
- El catalogo debe mantener el estilo visual de Baldora aunque los datos vengan de Shopify.

---

## Iteracion 2 - Ajustes visuales y de layout

**Fecha:** 2026-03-09
**Estado:** Cerrada

### Objetivo de la iteracion

Corregir detalles visuales, mejorar legibilidad de los paneles de contenido y unificar el lenguaje visual del boton flotante con el del boton de Patreon.

### Cambios implementados

- **Footer siempre al fondo:** Se agrego `display: flex` y `flex-direction: column` al body en `store.css` (aditivo) para que el footer con `margin-top: auto` funcione correctamente y se mantenga al fondo de la pagina independientemente del contenido.
- **Fondo blanco en paneles de catalogo e historial:** Las secciones `.store-catalog-section` y `.store-history-section` ahora tienen fondo blanco (`#FFFFFF`), border-radius y padding para mejorar la legibilidad. Incluye soporte para modo oscuro.
- **Cabeceras de columna del historial siempre visibles:** Se agrego un header fijo (`.store-history-header`) con las columnas Producto, Fecha, Estado y Detalle que se renderiza siempre, incluso cuando el historial esta vacio. Se oculta en movil (<600px) donde las filas se apilan verticalmente.
- **Icono de tienda en color gris:** El SVG del boton flotante cambio de `var(--clr-ink-900)` a `#9CA3AF` (gris), consistente con el color del icono de Patreon.
- **Destello amarillo igual que Patreon:** La animacion `store-sparkle` se reemplazo con los mismos keyframes y colores de `patreon-glow`: dorado `rgba(255, 215, 0, 0.6)` y `border-color: #FFD700`.

### Decisiones

- El layout del footer es aditivo: no se modifico `styles.css`, se agrego la regla en `store.css`.
- El gris del icono (`#9CA3AF`) es el mismo que usa el boton de Patreon.
- En movil, el header del historial se oculta porque las filas se apilan como cards individuales.

---

## Plantilla de nueva iteracion

```md
## Iteracion X - Nombre corto

**Fecha:** YYYY-MM-DD
**Estado:** Abierta | En revision | Cerrada

### Objetivo de la iteracion

Descripcion breve del foco de esta iteracion.

### Ideas

- Idea 1
- Idea 2

### Preguntas abiertas

- Pregunta 1
- Pregunta 2

### Decisiones

- Decision 1
```
