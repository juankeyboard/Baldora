# Documento Maestro de Ingeniería: Modalidad Práctica Libre (Arcade Mode - "El Río")

**Versión:** 2.0 (Evolución Arcade)  
**Proyecto:** Baldora  
**Fecha:** 11 de Marzo, 2026  
**Estado:** 🔄 En fase de rediseño técnico (Especificación)

---

## 1. Concepto Visual y Entorno

La **Práctica Libre** evoluciona de una matriz estática a una experiencia dinámica y fluida denominada "El Río".

- **Fondo:** Se utiliza el fondo general del sitio web (acuarela/watercolor) para dar una sensación de amplitud y limpieza.
- **Atmósfera:** Los elementos de la UI tradicional (paneles rígidos) se minimizan para priorizar el área de juego.
- **La Silueta del Río:** En la parte inferior de la pantalla se define una silueta gráfica que representa un río, la cual actúa como el límite crítico para las operaciones.

---

## 2. Dinámica de Juego (Mecánica de Caída)

### 2.1. Generación de Operaciones
- Las operaciones se generan aleatoriamente basándose **estrictamente en los filtros de tablas** (filas y columnas) seleccionados por el usuario en el menú de configuración.
- Se presentan dentro de **pequeños contenedores flotantes** (burbujas o pergaminos) que aparecen en la parte superior y descienden verticalmente.

### 2.2. Velocidades y Desafío
- Existen **3 niveles de velocidad** asignados aleatoriamente a cada contenedor que aparece.
- Esto obliga al jugador a priorizar aquellas operaciones que caen más rápido o que están más cerca del río.

### 2.3. Interacción y Resolución
- **Multitarea:** El jugador puede resolver **cualquiera** de las operaciones que estén visibles en pantalla. No hay un orden lineal.
- **Input:** Al escribir el resultado correcto de una operación presente, el sistema identifica el contenedor correspondiente.

---

## 3. Lógica de Puntuación y Feedback

### 3.1. Aciertos (Correctas)
- **Condición:** El jugador resuelve la operación antes de que toque el río.
- **Efecto Visual:** El contenedor **explota** (animación de partículas o desvanecimiento rápido).
- **Puntuación:** Suma +1 al contador de "Correctas".
- **Sonido:** Ejecuta `baldora_sfx_right.mp3`.

### 3.2. Errores (Incorrectas)
- **Condición:** El contenedor toca la silueta del río sin haber sido resuelto.
- **Puntuación:** Suma +1 al contador de "Incorrectas".
- **Sonido:** Ejecuta `baldora_sfx_wrong.mp3`.
- **Nota:** Escribir un resultado incorrecto no resta puntos ni detiene el flujo, simplemente no "explota" el contenedor.

---

## 4. Especificaciones Técnicas (Propuesta)

### 4.1. Animaciones (CSS/JS)
- Uso de `requestAnimationFrame` para un movimiento fluido de los contenedores.
- Propiedades de transformación (`translateY`) para el descenso.

### 4.2. Colisiones (Lógica)
- Verificación constante de la posición `Y` de cada contenedor respecto a la posición `Y` de la silueta del río.

### 4.3. Gestión de Input
- Un único `input` global que se limpia tras cada acierto y verifica continuamente contra todos los contenedores activos en el DOM.

---

## 5. Checklist de Implementación

- [x] Definir silueta del río en `index.html` (div con CSS gradient + onda).
- [x] Crear generador de contenedores dinámicos en `js/lineMode.js` (módulo independiente para `FREE` mode).
- [x] Implementar motor de caída con 3 velocidades (80/140/200 px/s).
- [x] Integrar lógica de "explosión" (acertar) y "hundimiento" (fallar) con actualización de marcadores.
- [x] Asegurar que el fondo del sitio sea visible durante toda la sesión (arena transparente).
- [x] Input global con Enter para resolver, match por resultado más cercano al río.
- [x] Integración con App.js (startGame, endGame, resetGame) estrictamente aditiva.
- [x] Registro de intentos con DataManager.recordAttempt para estadísticas y dashboard.
- [x] Soporte dark mode.

---

## 6. Cambios v2.1 (13 de Marzo, 2026)

### 6.1. Input de respuesta — Tamaño y forma
- **Antes:** `width: 3.5ch` — input estrecho, apenas 3 dígitos de ancho.
- **Ahora:** `width: clamp(200px, 45vw, 520px)` — input rectangular prominente, ~500% más ancho.
- **Forma:** Padding asimétrico (`0.4rem 2.5rem`) para reforzar la orientación horizontal (más ancha que alta).
- **Archivo:** `css/styles.css` selector `#line-input.line-input`.

### 6.2. Comportamiento al tocar la línea final
- **Antes:** Al tocar `#line-limit`, el contenedor llamaba `_drown()` — contaba como error, reproducía sonido incorrecto y mostraba animación de hundimiento.
- **Ahora:** Llama `_erase()` — el contenedor desaparece con fade-out de 200ms, sin contar error, sin sonido, sin penalización.
- **Efecto en puntuación:** Las operaciones que pasan la línea ya no incrementan el contador de "Incorrectas".
- **Archivo:** `js/lineMode.js` métodos `_checkCollisions()` y `_erase()`.

---
*Última actualización: 13 de Marzo, 2026 - v2.1*
