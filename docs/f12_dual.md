# Implementación de Vista Dual Móvil (Solo Controles)

Este documento describe la implementación de una funcionalidad específica para dispositivos móviles, donde se debe ocultar el "Panel Izquierdo: Matriz" (grid de operaciones) y mostrar exclusivamente el "Panel Derecho: Controles" para optimizar el espacio y la experiencia de usuario en pantallas pequeñas.

> **⚠️ NOTA CRÍTICA:** La implementación de esta funcionalidad debe ser puramente visual (CSS/Media Queries) o lógica de presentación ligera. **BAJO NINGUNA CIRCUNSTANCIA** se debe alterar la lógica interna del juego, el cálculo de puntajes, el flujo de datos o la funcionalidad en escritorio. El juego debe seguir funcionando exactamente igual "por debajo", solo cambia lo que ve el usuario en móvil.

## Objetivos
1.  Detectar dispositivos móviles o pantallas estrechas (viewport width).
2.  Ocultar el contenedor `.matrix-panel` si es un celular o tablet.
3.  Asegurar que `.controls-panel` ocupe el ancho disponible y esté centrado.
4.  Mantener la vista de dos paneles (Matriz y Controles) en pantallas más grandes (Escritorio/Tablet).

## Detalles Técnicos
*   **Target:** Dispositivos móviles.
*   **Elemento a ocultar:** `.matrix-panel`.
*   **Elemento principal:** `.controls-panel`.

Esta documentación será iterada para refinar los estilos y breakpoints específicos.
