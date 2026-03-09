# Documento Maestro de Ingeniería: Modalidad Multijugador (Duelo de Cavernícolas: Tira y Afloja)

**Versión:** 0.5 (Refinamiento Técnico y Criterios de Aceptación)  
**Proyecto:** Baldora  
**Fecha:** 9 de Marzo, 2026  
**Estado:** 📝 Especificación Técnica Final para Implementación

> **⚠️ NOTA CRÍTICA DE INGENIERÍA:** Todas las nuevas implementaciones deben ser modulares y aditivas, siguiendo el Design System "Baldor Watercolor". La integración del modo multijugador no debe interferir con la lógica de persistencia o el motor de juego de los modos individuales (Contrarreloj, Libre, Adaptativo).

---

## 1. Identidad del Jugador y Gestión de Perfiles

### 1.1. Registro y Nicknames
Al ejecutar el `signUp` en **Firebase Auth**, el sistema debe disparar un trigger para inicializar el perfil:
- **Generación de Nickname:** Algoritmo de concatenación aleatoria `[Adjetivo_Matemático] + [_] + [Sustantivo_Científico]`.
- **Persistencia:** Almacenado en `users/{uid}/nickname`. El usuario puede editarlo desde su perfil, validando unicidad mediante una función de búsqueda previa.
- **Sistema de Presencia:** Implementación de `onDisconnect()` en Firebase RTDB para conmutar el estado `online: false` y registrar el `last_login_at` (ISO 8601) automáticamente.

---

## 2. Integración de UI y Configuración Inicial

- **Selector de Modo:** La opción de Multijugador se debe integrar directamente en la cuadrícula de "Modos de Juego" (junto a Contrarreloj, Práctica Libre y Adaptativo), compartiendo el mismo diseño de botón (estilo visual, colores, hover, iconografía).
- **Ajustes de la Partida:** Si se selecciona la modalidad Multijugador, la partida se rige por las mismas configuraciones globales:
    - **Selección de Tablas:** El jugador decide las tablas a jugar (Factor A y Factor B).
    - **Límite de Tiempo:** El jugador define el tiempo límite del duelo a través del slider.
- **Transición Visual:** Al iniciar el duelo, se debe pasar a una pantalla diseñada específicamente para el multijugador ("La Cinchada"). Todas las implementaciones de esta nueva vista deben conservar de manera estricta el mismo estilo, tipografías y colores que la vista principal de cuadrícula para mantener la coherencia del *Design System*.

---

## 3. Mecánica de Juego: "La Cinchada" (Tug-of-War)

Duelo síncrono de agilidad mental basado en el procesamiento de una operación única compartida.

### 3.1. El Campo de Batalla Visual
- **Personajes:** Cavernícola Azul (Jugador 1) vs. Cavernícola Amarillo (Jugador 2).
- **Lógica de Desplazamiento:** 
    - El eje central representa el punto 0. Los extremos de victoria están en +50 y -50 unidades.
    - **Acierto Síncrono:** El primer jugador en enviar la respuesta correcta a la RTDB desplaza el marcador 5 unidades hacia su territorio.
- **Condiciones de Victoria:** 
    - **Tiempo Límite:** Al finalizar el tiempo límite seleccionado por los jugadores, gana quien tenga el marcador en su territorio (o el que haya empujado más).
    - **KO Técnico:** Si un jugador alcanza el límite de unidades (+50/-50) antes del tiempo, la partida termina instantáneamente ganando por aplastamiento.

### 3.2. Interfaz de Control (Dial Numérico)
- **Diseño:** Dos contenedores laterales (Azul y Magenta) con botones del 0 al 9 dispuestos en un arco ergonómico para pulgares.
- **Layout Adaptativo:** 
    - **Desktop:** Diales fijos en los extremos `viewport` izquierdo/derecho.
    - **Mobile (Horizontal):** Optimización tipo "Gamepad" con botones de gran tamaño (min 44px).
    - **Mobile (Vertical):** Stack vertical de diales con área central reducida para la animación.

---

## 4. Matchmaking y Notificaciones Live

### 4.1. Algoritmo de Emparejamiento Aleatorio
1.  **Query:** Filtrar `users` con `online: true` y `current_status: idle`.
2.  **Match:** La configuración del host (Tablas seleccionadas y Tiempo Limit) se impone en la base de datos para la Room (`battles/{roomId}/config`).
3.  **Dispatch:** Envío de un nodo `incoming_duel` al UID seleccionado.

### 4.2. Notificación Preemptiva (Interruptiva)
- **Comportamiento:** Un modal `DuelOverlay` de alta prioridad se monta sobre la UI global.
- **Interrupción de Sesión Activa:** Si el usuario acepta el reto mientras tiene una partida en curso (`game_state: active`), se ejecuta un `forceReset()` del motor de juego local. **IMPORTANTE:** Los datos de la sesión interrumpida NO se guardan para evitar corrupción de estadísticas históricas.

---

## 5. Hub Social y Gestión de Contactos

### 5.1. Panel de Usuario
- **Búsqueda:** Búsqueda indexada por Nickname (case-insensitive) o Email exacto.
- **Lista de Amigos:** Tabla con indicadores de estado (`online` / `busy` / `offline`).
- **Historial de Duelos:** Lista de resultados `Winner_UID | Loser_UID | Ops_Total | Timestamp`.

---

## 6. Especificaciones Técnicas (Firebase RTDB)

```json
{
  "presence": {
    "uid_123": {
      "online": true,
      "last_login_at": 1741530000000,
      "current_status": "idle|playing|searching"
    }
  },
  "battles": {
    "room_id_xyz": {
      "config": { "time_limit_ms": 60000, "tables": "1,2,3...10" },
      "state": { "marker_position": 0, "current_op_index": 5, "start_time": 1741530005000 },
      "players": {
        "uid_1": { "score": 3, "last_response_ms": 850 },
        "uid_2": { "score": 2, "last_response_ms": 1100 }
      }
    }
  }
}
```

---

## 7. Criterios de Aceptación (QA)

1.  **CA-01:** La generación de nickname aleatorio no debe producir duplicados en una muestra de 1000 iteraciones.
2.  **CA-02:** El retardo entre el envío de la respuesta y el movimiento visual de la cuerda en el oponente debe ser < 250ms en condiciones normales de red.
3.  **CA-03:** Aceptar un duelo debe limpiar todos los `intervals` y `timeouts` de una sesión individual activa antes de cargar la vista de batalla.
4.  **CA-04:** El Dial Numérico debe prevenir el "doble-tap" accidental mediante un debounce de 100ms.
5.  **CA-05:** Al finalizar un duelo, los jugadores deben ver el botón "Añadir a Amigos" si el oponente no está ya en su lista.

---

## 8. Checklist de Implementación

- [ ] Integración de botón en UI (Selector de 4 modos: Contrarreloj, Libre, Adaptativo, Multijugador).
- [ ] Script de generación de Nicknames (`utils/nicknames.js`).
- [ ] Componente `DialControl.vue/js` con soporte táctil (coherente con UI principal).
- [ ] Lógica de sincronización `BattleManager.js` para Firebase RTDB respetando el tiempo límite seleccionado.
- [ ] Animación CSS/Canvas para el desplazamiento de cavernícolas y cuerda.
- [ ] Pantalla de Multijugador que conserve exactamente los mismos estilos, botones y tipografías que el modo individual.
