# Lista de Pendientes - Proyecto Baldora

Este documento centraliza las tareas pendientes, errores detectados y mejoras planificadas para el proyecto.

## 🔴 Prioridad Alta (Errores y Bloqueos)
- [ ] **Reparar cálculo de posición:** El sistema de "Posición en la Comunidad" (Tiers/Ligas) se averió tras el último despliegue. Revisar `cloudSync.js` y las reglas de Firebase.
- [ ] **Flujo de Inicio:** El botón "COMENZAR" no avanza correctamente hacia la pantalla de selección de multijugador cuando este modo está seleccionado.
- [ ] **Configuración Multijugador:** Al entrar a la selección de multijugador, todas las opciones en las tablas de factores deben aparecer seleccionadas por defecto.

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
*Última actualización: 9 de marzo de 2026*
