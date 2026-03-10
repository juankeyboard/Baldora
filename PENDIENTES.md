# Lista de Pendientes - Proyecto Baldora

Este documento centraliza las tareas pendientes, errores detectados y mejoras planificadas para el proyecto.

## 🔴 Prioridad Alta (Errores y Bloqueos)
- [ ] **Flujo Multijugador completo — No implementado funcional.** El modo VS debe completar el siguiente flujo de extremo a extremo:
    1. **Modo de juego:** El jugador selecciona modo VS desde la pantalla de configuración.
    2. **Variables de factores y tiempo:** El jugador elige sus tablas (filas/columnas) y el tiempo límite del duelo.
    3. **Selección de oponente:** Se muestra el Hall of Fame con los jugadores de la comunidad (nickname, liga, mejor partida). El jugador elige contra quién competir.
    4. **Simulación del oponente (Ghost Engine):** La mejor partida guardada del oponente actúa como rival en vivo. Las operaciones que no coincidan con las tablas seleccionadas se omiten; para esas posiciones, el bot responde usando tiempos aleatorios tomados del historial del oponente, simulando presencia en tiempo real.
    5. **Guardado del resultado:** Al finalizar el duelo se registra victoria o derrota en el historial del jugador y se actualiza su posición en el leaderboard de la comunidad.
- [x] **Reparar cálculo de posición:** El update multi-ruta desde la raíz de Firebase bloqueaba si algún nodo no tenía permiso. Separado en 2 llamadas independientes en `cloudSync.js` (`_recalculateMyTier`). *(Resuelto: 2026-03-10)*
- [x] **Flujo de Inicio:** Botón "COMENZAR" en modo VS sin login ahora dispara automáticamente Google Sign-In y retoma el flujo VS tras autenticarse (`app.js` + `auth.js`). *(Resuelto: 2026-03-10)*
- [x] **Configuración Multijugador:** Al seleccionar modo VS, ahora SIEMPRE se fuerzan todas las 15 tablas activas (independiente del estado previo) en `app.js updateModeUI()`. *(Resuelto: 2026-03-10)*

## 🟡 Prioridad Media (UI/UX y Ajustes Visuales)
- [ ] **Estandarización de Botones:** Cambiar el estilo de todos los botones "Volver" (o equivalentes de retroceso) para que sean de color VERDE.
- [ ] **Localización:** Cambiar la bandera representativa del idioma inglés (actualmente USA o genérica) por la bandera Británica (Union Jack).
- [ ] **Duelo de Cavernícolas (Multijugador):** Finalizar la implementación de la mecánica de "Tira y Afloja" (desplazamiento de la cuerda) y sincronización síncrona (< 250ms).

## 🟢 Prioridad Baja (Nuevas Funcionalidades y Marketing)
- [ ] **Email Marketing:** Implementar sistema de envío de correos de recordatorio para usuarios registrados que incluya:
    - Enlace de apoyo a **Patreon**.
    - Enlace a la **Tienda** oficial.
    - Invitación a la **Práctica** diaria.
- [ ] **Análisis Histórico Global:** Finalizar el motor de Gemini para diagnósticos longitudinales de progreso (más de una sesión).
- [ ] **Hub Social:** Implementar la búsqueda de amigos por Nickname y el historial de duelos ganados/perdidos.

## 📝 Notas de Seguimiento
- Todas las implementaciones deben seguir la **Regla de Oro**: Código estrictamente aditivo y modular en `js/` y `css/`.
- Consultar `docs/f14_UserSystem.md` y `docs/f15_Multiplayer.md` para especificaciones técnicas detalladas.

---
*Última actualización: 10 de marzo de 2026 — Pendiente multijugador completo agregado.*
