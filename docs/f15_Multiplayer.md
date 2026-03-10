# Documento Maestro de Ingeniería: Modalidad Multijugador (Duelo de Cavernícolas Asíncrono - "Ghosts")

**Versión:** 1.1 (Selección en Pantalla Completa)  
**Proyecto:** Baldora  
**Fecha:** 10 de Marzo, 2026  
**Estado:** ✅ Especificación Actualizada e Implementada

---

## 1. Paradigma de Selección: Vista Dedicada ("Hall of Fame")

El modo "Duelo VS" evoluciona de un simple modal a una vista completa de selección para mejorar la inmersión y la claridad competitiva.

### 1.1. Flujo de Navegación
1. **Configuración:** El usuario elige sus tablas en el menú principal.
2. **Transición:** Al pulsar "COMENZAR" en modo VS, la app navega a `ghost-selection-view`.
3. **Selección:** El usuario ve el listado completo de la comunidad organizado por prestigio.
4. **Batalla:** Al elegir un oponente, se inicia la arena de "La Cinchada".

### 1.2. Organización del Listado
- **Categorización por Ligas:** DIAMANTE, PLATINO, ORO, PLATA, BRONCE, MADERA.
- **Orden Interno:** De mayor a menor puntaje (Correctas) y menor tiempo promedio.
- **Acceso Directo:** Opción destacada para retar a "Mi Propio Fantasma".

---

## 2. Mecánica de Simulación (Ghost Engine)

El oponente (Cavernícola Amarillo) es controlado por el motor local que interpreta los registros históricos del usuario seleccionado.

### 2.1. Adaptabilidad de Datos
- **Coincidencia Total:** Si el jugador elige las mismas tablas que el fantasma, el bot replica el comportamiento exacto.
- **Coincidencia Parcial:** Si las tablas difieren, el bot usa el `avg_time_ms` global del fantasma para disparar aciertos periódicos.
- **Reserva Aleatoria:** Si la partida actual excede los registros del fantasma, se seleccionan tiempos aleatorios de su historial para mantener la presión.

---

## 3. Arquitectura Técnica

### 3.1. Nuevos Estados de Vista (SPA)
- `GHOST_SELECTION`: Vista de listado de oponentes.
- `BATTLE`: Vista de combate (La Cinchada).

### 3.2. Sincronización de Resultados
Al finalizar cualquier duelo, el sistema debe:
1. Registrar la sesión en `users/{uid}/games`.
2. Actualizar los promedios en `users/{uid}/stats`.
3. Evaluar si se ha creado un nuevo "Mejor Fantasma" (`best_session_ghost`).
4. Recalcular el Tier y Liga del jugador en el Leaderboard.

---

## 4. Checklist de Diseño Visual
- [x] Fondo coherente con la temática prehistórica.
- [x] Headers de liga con colores distintivos.
- [x] Botones de reto ("RETAR") con feedback visual.
- [x] Botón de "Volver" en color verde esmeralda.
`n---`n# Reporte de Sesi�n y Estado Actual (10 de Marzo, 2026)`n`n## ??? Trabajo Realizado`n1. **Cambio de Paradigma (As�ncrono):** Se elimin� el sistema de matchmaking en tiempo real (Firebase Invites) en favor de un sistema de \\\"Fantasmas\\\" (Ghosts) basado en partidas guardadas.`n2. **Arquitectura de Vistas (SPA):** Evoluci�n del selector de oponentes de un modal emergente a una vista de pantalla completa integrada en el flujo de la aplicaci�n (\`GHOST_SELECTION\`).`n3. **Motor de Simulaci�n (Ghost Engine):** Implementaci�n de un bot en \`battleManager.js\` que replica exactamente los tiempos de respuesta del oponente seleccionado.`n4. **Ingenier�a de Ligas y Tiers:** `n   - Implementaci�n de un c�lculo at�mico de \`community_score\` (Aciertos + Velocidad + Precisi�n).`n   - Correcci�n de bugs de sobreescritura en transacciones de Firebase.`n   - Implementaci�n de \\\"Arquitectura Segura\\\" para evitar errores de permisos (\`PERMISSION_DENIED\`) al intentar actualizar a otros jugadores.`n5. **Auto-Migraci�n de Datos:** Creaci�n de un script en \`CloudSync.js\` que promueve autom�ticamente la mejor de las partidas antiguas (legacy) a una \\\"Sesi�n Fantasma\\\" retable en el Sal�n de la Fama.`n`n## ?? Problemas Actuales y Pendientes`n1. **Consistencia de Datos (Fantasmas):** A pesar de la migraci�n, algunos usuarios reportan que el listado del Sal�n de la Fama aparece vac�o (\`leaderboard/ghosts\`). Se sospecha de una latencia en la propagaci�n de datos tras el borrado masivo previo.`n2. **Fuga de Recursos SFX:** Errores 404 detectados en la consola para los archivos \`audio/sfx/baldora_sfx_win.mp3\` y \`gameover.mp3\`. Los nombres de los archivos en el servidor no coinciden con las llamadas en \`audio.js\`.`n3. **Latencia de App Check:** Se detectan errores 403 intermitentes en la validaci�n de tokens de Firebase App Check, lo que puede retrasar la carga de estad�sticas en el primer inicio de sesi�n.`n4. **Visualizaci�n de Ligas:** Persistencia intermitente del estado \\\"SIN LIGA\\\" en el perfil de usuario debido a la falta de r�cords globales (\`community_benchmarks\`) cuando el sistema se reinicia desde cero (efecto \\\"Huevo o Gallina\\\").`n`n## ?? Pr�ximos Pasos Sugeridos`n- Verificar manualmente en la consola de Firebase si el nodo \`leaderboard/ghosts\` contiene datos despu�s de una partida.`n- Renombrar los archivos de audio para corregir los errores 404.`n- Ajustar las reglas de seguridad de Firebase para permitir el incremento de benchmarks globales de forma an�nima o controlada.

---

## 5. Historial de Implementacion y Correcciones (2026-03-10)

### 5.1 Problemas encontrados durante implementacion

| # | Problema | Causa raiz | Solucion |
|---|----------|-----------|---------|
| 1 | Listado de oponentes siempre vacio | Se leia de `leaderboard/ghosts` que estaba vacio por reset previo del servidor | Cambiar fuente a `leaderboard/players` (se actualiza en cada partida) |
| 2 | Flag `ghost_available` nunca escrito en players existentes | `_ensureGhostExists` creaba el ghost pero no marcaba el flag en `leaderboard/players` | Agregar `leaderboard/players/{uid}/ghost_available: true` en la migracion |
| 3 | Filtro `ghost_available === true` bloqueaba a todos | El flag solo se escribia en partidas nuevas post-deploy, no para usuarios historicos | Cambiar filtro a `community_score !== undefined` (cualquier jugador que haya guardado una partida) |
| 4 | Tier/league en `leaderboard/ghosts` siempre en DIAMANTE | `saveGame` hardcodeaba `tier:1, league:'DIAMANTE'`; `_recalculateMyTier` no actualizaba ghosts | `_recalculateMyTier` ahora tambien actualiza `leaderboard/ghosts/{uid}` |
| 5 | Update multi-ruta fallaba silenciosamente por permisos Firebase | `db.ref().update(paths)` desde la raiz falla completo si cualquier ruta tiene permiso denegado | Separado en 2 llamadas independientes con `.catch()` para la publica |

### 5.2 Flujo de datos actual (estado funcional)

```
saveGame()
  |-- users/{uid}/games/{gameId}          <- partida completa
  |-- users/{uid}/stats                   <- acumulados + community_score
  |-- users/{uid}/best_session_ghost      <- respuestas del mejor ghost
  |-- leaderboard/players/{uid}           <- displayName, score, last_played, ghost_available
  |-- leaderboard/ghosts/{uid}            <- nickname, score, avg_time_ms (solo si es mejor ghost)
  |-- _recalculateMyTier()
        |-- users/{uid}/stats             <- community_tier, community_league, community_rank
        |-- leaderboard/players/{uid}     <- tier, league, rank
        |-- leaderboard/ghosts/{uid}      <- tier, league (sincronizado)
```

### 5.3 Fuente de datos del Hall of Fame

El listado de oponentes lee de **`leaderboard/players`** (fuente de verdad), enriquecido con datos de `leaderboard/ghosts` cuando existen (aciertos y tiempo del mejor ghost). Se muestran todos los jugadores con `community_score` definido.

### 5.4 Pendientes de la funcionalidad multijugador

Ver `PENDIENTES.md` -- el flujo completo de extremo a extremo (seleccion -> duelo -> guardado de resultado) aun requiere validacion integral.
