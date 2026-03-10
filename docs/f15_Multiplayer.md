# Documento Maestro de IngenierÃ­a: Modalidad Multijugador (Duelo de CavernÃ­colas AsÃ­ncrono - "Ghosts")

**VersiÃ³n:** 1.1 (SelecciÃ³n en Pantalla Completa)  
**Proyecto:** Baldora  
**Fecha:** 10 de Marzo, 2026  
**Estado:** âœ… EspecificaciÃ³n Actualizada e Implementada

---

## 1. Paradigma de SelecciÃ³n: Vista Dedicada ("Hall of Fame")

El modo "Duelo VS" evoluciona de un simple modal a una vista completa de selecciÃ³n para mejorar la inmersiÃ³n y la claridad competitiva.

### 1.1. Flujo de NavegaciÃ³n
1. **ConfiguraciÃ³n:** El usuario elige sus tablas en el menÃº principal.
2. **TransiciÃ³n:** Al pulsar "COMENZAR" en modo VS, la app navega a `ghost-selection-view`.
3. **SelecciÃ³n:** El usuario ve el listado completo de la comunidad organizado por prestigio.
4. **Batalla:** Al elegir un oponente, se inicia la arena de "La Cinchada".

### 1.2. OrganizaciÃ³n del Listado
- **CategorizaciÃ³n por Ligas:** DIAMANTE, PLATINO, ORO, PLATA, BRONCE, MADERA.
- **Orden Interno:** De mayor a menor puntaje (Correctas) y menor tiempo promedio.
- **Acceso Directo:** OpciÃ³n destacada para retar a "Mi Propio Fantasma".

---

## 2. MecÃ¡nica de SimulaciÃ³n (Ghost Engine)

El oponente (CavernÃ­cola Amarillo) es controlado por el motor local que interpreta los registros histÃ³ricos del usuario seleccionado.

### 2.1. Adaptabilidad de Datos
- **Coincidencia Total:** Si el jugador elige las mismas tablas que el fantasma, el bot replica el comportamiento exacto.
- **Coincidencia Parcial:** Si las tablas difieren, el bot usa el `avg_time_ms` global del fantasma para disparar aciertos periÃ³dicos.
- **Reserva Aleatoria:** Si la partida actual excede los registros del fantasma, se seleccionan tiempos aleatorios de su historial para mantener la presiÃ³n.

---

## 3. Arquitectura TÃ©cnica

### 3.1. Nuevos Estados de Vista (SPA)
- `GHOST_SELECTION`: Vista de listado de oponentes.
- `BATTLE`: Vista de combate (La Cinchada).

### 3.2. SincronizaciÃ³n de Resultados
Al finalizar cualquier duelo, el sistema debe:
1. Registrar la sesiÃ³n en `users/{uid}/games`.
2. Actualizar los promedios en `users/{uid}/stats`.
3. Evaluar si se ha creado un nuevo "Mejor Fantasma" (`best_session_ghost`).
4. Recalcular el Tier y Liga del jugador en el Leaderboard.

---

## 4. Checklist de DiseÃ±o Visual
- [x] Fondo coherente con la temÃ¡tica prehistÃ³rica.
- [x] Headers de liga con colores distintivos.
- [x] Botones de reto ("RETAR") con feedback visual.
- [x] BotÃ³n de "Volver" en color verde esmeralda.
`n---`n# Reporte de Sesión y Estado Actual (10 de Marzo, 2026)`n`n## ??? Trabajo Realizado`n1. **Cambio de Paradigma (Asíncrono):** Se eliminó el sistema de matchmaking en tiempo real (Firebase Invites) en favor de un sistema de \\\"Fantasmas\\\" (Ghosts) basado en partidas guardadas.`n2. **Arquitectura de Vistas (SPA):** Evolución del selector de oponentes de un modal emergente a una vista de pantalla completa integrada en el flujo de la aplicación (\`GHOST_SELECTION\`).`n3. **Motor de Simulación (Ghost Engine):** Implementación de un bot en \`battleManager.js\` que replica exactamente los tiempos de respuesta del oponente seleccionado.`n4. **Ingeniería de Ligas y Tiers:** `n   - Implementación de un cálculo atómico de \`community_score\` (Aciertos + Velocidad + Precisión).`n   - Corrección de bugs de sobreescritura en transacciones de Firebase.`n   - Implementación de \\\"Arquitectura Segura\\\" para evitar errores de permisos (\`PERMISSION_DENIED\`) al intentar actualizar a otros jugadores.`n5. **Auto-Migración de Datos:** Creación de un script en \`CloudSync.js\` que promueve automáticamente la mejor de las partidas antiguas (legacy) a una \\\"Sesión Fantasma\\\" retable en el Salón de la Fama.`n`n## ?? Problemas Actuales y Pendientes`n1. **Consistencia de Datos (Fantasmas):** A pesar de la migración, algunos usuarios reportan que el listado del Salón de la Fama aparece vacío (\`leaderboard/ghosts\`). Se sospecha de una latencia en la propagación de datos tras el borrado masivo previo.`n2. **Fuga de Recursos SFX:** Errores 404 detectados en la consola para los archivos \`audio/sfx/baldora_sfx_win.mp3\` y \`gameover.mp3\`. Los nombres de los archivos en el servidor no coinciden con las llamadas en \`audio.js\`.`n3. **Latencia de App Check:** Se detectan errores 403 intermitentes en la validación de tokens de Firebase App Check, lo que puede retrasar la carga de estadísticas en el primer inicio de sesión.`n4. **Visualización de Ligas:** Persistencia intermitente del estado \\\"SIN LIGA\\\" en el perfil de usuario debido a la falta de récords globales (\`community_benchmarks\`) cuando el sistema se reinicia desde cero (efecto \\\"Huevo o Gallina\\\").`n`n## ?? Próximos Pasos Sugeridos`n- Verificar manualmente en la consola de Firebase si el nodo \`leaderboard/ghosts\` contiene datos después de una partida.`n- Renombrar los archivos de audio para corregir los errores 404.`n- Ajustar las reglas de seguridad de Firebase para permitir el incremento de benchmarks globales de forma anónima o controlada.
