# Documento Maestro de Ingeniería: Sistema de Usuario con Google

| Campo | Valor |
|-------|-------|
| **Versión** | 1.1 (Iteración 1) |
| **Fecha** | 4 de Marzo, 2026 |
| **Proyecto** | Baldora |
| **Módulo** | Autenticación, Persistencia de Datos, Analíticas de Usuario |
| **Dependencias** | Firebase Auth, Firebase Realtime Database, Firebase AI Logic |
| **Estado** | Documento de diseño - En iteración |

---

> **REGLA GENERAL DE IMPLEMENTACIÓN:** Todo el código de este módulo (HTML, CSS, JS) debe ser **estrictamente aditivo y modular**. BAJO NINGUNA CIRCUNSTANCIA se debe alterar, reemplazar o interferir con las funciones, diseño, flujos y comportamientos ya implementados en el proyecto. El sistema de usuario con Google es una capa opcional que se superpone al funcionamiento existente sin modificarlo.

---

## 1. Visión General

Este módulo introduce un sistema de usuario **opcional** basado en **Firebase Authentication con Google Sign-In**. Permite a los jugadores registrarse/iniciar sesión con su cuenta de Google, persistir su historial de partidas en la nube, visualizar su rendimiento histórico con filtros avanzados, recibir análisis personalizado de IA y conocer su posición dentro de la comunidad Baldora.

El sistema de nickname manual existente se mantiene intacto como la experiencia por defecto. El registro con Google es una funcionalidad adicional que coexiste con el flujo actual.

### Objetivos

1. **Identidad persistente (opcional):** Agregar la opción de cuenta Google verificada. El nickname manual existente se mantiene disponible como experiencia por defecto.
2. **Historial en la nube:** Cada partida se guarda automáticamente en Firebase Realtime Database (solo para usuarios autenticados).
3. **Analíticas personales:** Dashboard con filtros de fecha, operaciones, tiempo y asertividad.
4. **Análisis IA:** Gemini analiza el progreso histórico del jugador (no solo la sesión actual).
5. **Comunidad:** Sistema de puntaje compuesto y posición relativa entre jugadores.

---

## 2. Autenticación con Google

### 2.1. Infraestructura

Se utiliza **Firebase Authentication** con el proveedor `GoogleAuthProvider`, integrado al proyecto Firebase existente (`baldora-89866`).

| Componente | Valor |
|------------|-------|
| **SDK** | Firebase Auth Compat v12.8.0 |
| **Proveedor** | `firebase.auth.GoogleAuthProvider` |
| **Método** | `signInWithPopup()` (Desktop) / `signInWithRedirect()` (Mobile) |
| **Persistencia** | `firebase.auth.Auth.Persistence.LOCAL` (sesión sobrevive cierre de pestaña) |

### 2.2. SDK Requerido

Agregar al `index.html` junto a los SDKs existentes:

```html
<!-- Firebase Auth SDK -->
<script src="https://www.gstatic.com/firebasejs/12.8.0/firebase-auth-compat.js"></script>
```

### 2.3. Configuración en Firebase Console

1. En Firebase Console > Authentication > Sign-in method, habilitar **Google** como proveedor.
2. Configurar el dominio autorizado (`baldora-89866.web.app` y dominio personalizado si existe).
3. Verificar que el `authDomain` en `firebaseConfig` sea correcto: `baldora-89866.firebaseapp.com`.

### 2.4. Datos del Usuario Disponibles

Al autenticarse, Firebase provee el siguiente objeto `user`:

| Propiedad | Descripción | Uso en Baldora |
|-----------|-------------|----------------|
| `uid` | ID único del usuario | Clave primaria en la base de datos |
| `displayName` | Nombre completo de Google | Mostrar en UI y rankings |
| `email` | Correo electrónico | Identificación secundaria |
| `photoURL` | URL de la foto de perfil | Avatar en el header y rankings |

### 2.5. Flujo de Autenticación (UX)

```
1. Usuario abre Baldora
2. La página se carga con el flujo normal (nickname manual, configuración, etc.)
3. En la esquina superior derecha ve el botón "Iniciar sesión con Google"
4. Si decide loguearse → Clic → signInWithPopup() → Autorización Google
5. Retorno → onAuthStateChanged() detecta usuario
6. El botón cambia a mostrar avatar + nombre + opción "Cerrar sesión"
7. El campo nickname se autocompleta con displayName (pero sigue siendo editable)
8. Si NO se loguea → Todo funciona exactamente como antes (nickname manual)
```

> **Importante:** El login con Google NO es un paso obligatorio ni un prerequisito para jugar. Es una acción independiente que el usuario puede realizar en cualquier momento desde cualquier vista.

### 2.6. Componente UI: Botón de Google (Header Global)

El botón de autenticación con Google vive en la **esquina superior derecha de la página**, como un componente fijo global, visible en todas las vistas. Se ubica junto al botón de audio existente.

#### Estado: No Logueado

| Elemento | Especificación |
|----------|----------------|
| **Posición** | `position: fixed; top: 20px; right: 80px;` (a la izquierda del botón de audio) |
| **z-index** | 1500 (mismo nivel que el botón de audio) |
| **Estilo** | Botón blanco con borde `var(--clr-sand-300)`, border-radius redondeado |
| **Contenido** | Logo de Google (SVG inline 18px) + texto "Iniciar sesión" |
| **Hover** | Sombra sutil, misma transición que botones existentes |
| **Visible en** | Todas las vistas (config, juego, dashboard) |

#### Estado: Logueado

| Elemento | Especificación |
|----------|----------------|
| **Posición** | Misma posición fija superior derecha |
| **Contenido** | Avatar circular (28px, foto de Google) + nombre corto (primer nombre) |
| **Clic** | Despliega mini dropdown con: "Mi Perfil", "Cerrar sesión" |
| **Dropdown** | Panel pequeño debajo del avatar, mismo estilo panel-base |

#### Adaptación Responsive

| Breakpoint | Comportamiento |
|------------|---------------|
| `> 600px` | Logo Google + "Iniciar sesión" (texto visible) |
| `< 600px` | Solo logo Google (sin texto) para ahorrar espacio |
| Logueado `> 600px` | Avatar + primer nombre |
| Logueado `< 600px` | Solo avatar circular |

#### Coexistencia con Botón de Audio

```
┌─────────────────────────────────────────────────────────────┐
│                                    [Google btn] [Audio btn] │
│                                    right: 80px  right: 20px │
└─────────────────────────────────────────────────────────────┘
```

El botón de audio existente (`.audio-toggle-btn`) NO se modifica. El botón de Google se posiciona a su izquierda con suficiente separación.

### 2.7. Gestión de Estado de Sesión

```javascript
firebase.auth().onAuthStateChanged((user) => {
    if (user) {
        // Usuario logueado
        // → Actualizar botón header (mostrar avatar + nombre)
        // → Cargar perfil desde DB
        // → Sugerir displayName como nickname (sin forzar)
        // → Habilitar guardado en nube
        // → Habilitar acceso a "Mi Perfil"
    } else {
        // Usuario no logueado
        // → Mostrar botón "Iniciar sesión con Google"
        // → Todo funciona exactamente como antes
        // → No guardar en nube
        // → Ocultar opción "Mi Perfil"
    }
});
```

> **Nota:** El `onAuthStateChanged` NO interfiere con ningún flujo existente. Solo actualiza el componente del header y habilita/deshabilita las funcionalidades de nube.

---

## 3. Persistencia de Datos (Firebase Realtime Database)

### 3.1. Estructura de Base de Datos

Se aprovecha la instancia existente de Firebase Realtime Database (ya usada por `VisitorCounter`).

```
baldora-89866-default-rtdb/
├── visits/                     ← Existente (visitor counter)
│   └── count: 12345
├── users/                      ← NUEVO
│   └── {uid}/
│       ├── profile/
│       │   ├── displayName: "Juan García"
│       │   ├── email: "juan@gmail.com"
│       │   ├── photoURL: "https://..."
│       │   ├── createdAt: "2026-03-04T..."
│       │   └── lastLogin: "2026-03-04T..."
│       ├── games/
│       │   └── {gameId}/           ← Auto-generated push key
│       │       ├── timestamp: "2026-03-04T10:30:00Z"
│       │       ├── game_mode: "TIMER" | "FREE" | "ADAPTIVE"
│       │       ├── duration_ms: 180000
│       │       ├── total_operations: 45
│       │       ├── correct_operations: 38
│       │       ├── accuracy: 84.4
│       │       ├── avg_response_time: 2340
│       │       ├── tables_used: { rows: [1,2,3...], cols: [1,2,3...] }
│       │       └── attempts/
│       │           └── {index}/
│       │               ├── factor_a: 7
│       │               ├── factor_b: 8
│       │               ├── user_input: 56
│       │               ├── correct_result: 56
│       │               ├── is_correct: true
│       │               └── response_time: 1250
│       └── stats/                  ← Agregados calculados
│           ├── total_games: 15
│           ├── total_operations: 890
│           ├── total_correct: 756
│           ├── global_accuracy: 84.9
│           ├── avg_response_time: 2100
│           ├── best_accuracy: 97.2
│           ├── best_avg_time: 1450
│           └── community_score: 0    ← Ver sección 6
└── leaderboard/                ← NUEVO (datos públicos para ranking)
    └── {uid}/
        ├── displayName: "Juan García"
        ├── photoURL: "https://..."
        ├── community_score: 8450
        ├── total_games: 15
        ├── global_accuracy: 84.9
        └── last_played: "2026-03-04T..."
```

### 3.2. Reglas de Seguridad

```json
{
  "rules": {
    "visits": {
      ".read": true,
      ".write": true
    },
    "users": {
      "$uid": {
        ".read": "$uid === auth.uid",
        ".write": "$uid === auth.uid",
        "profile": {
          ".read": "$uid === auth.uid"
        },
        "games": {
          ".read": "$uid === auth.uid",
          ".write": "$uid === auth.uid"
        },
        "stats": {
          ".read": "$uid === auth.uid",
          ".write": "$uid === auth.uid"
        }
      }
    },
    "leaderboard": {
      ".read": true,
      "$uid": {
        ".write": "$uid === auth.uid"
      }
    }
  }
}
```

### 3.3. Guardado Automático de Partida

Al finalizar cada partida (`endGame()`), si el usuario está autenticado:

1. Se genera un `gameId` con `push()`.
2. Se guardan los datos de la partida en `users/{uid}/games/{gameId}`.
3. Se recalculan y actualizan `users/{uid}/stats/`.
4. Se actualiza `leaderboard/{uid}/` con los nuevos agregados.

### 3.4. Integración con DataManager

El `DataManager` existente se extiende (no se reemplaza) con capacidad de nube:

| Método Nuevo | Descripción |
|-------------|-------------|
| `saveGameToCloud(uid, gameData)` | Guarda partida completa en Realtime DB |
| `loadGamesFromCloud(uid, filters)` | Carga partidas con filtros opcionales |
| `updateUserStats(uid)` | Recalcula agregados del usuario |
| `updateLeaderboard(uid, stats)` | Actualiza posición en el leaderboard |

---

## 4. Visualización de Datos del Usuario (Dashboard Personal)

### 4.1. Nueva Vista: Perfil del Jugador

Se agrega una cuarta vista a la SPA: `#profile-view`.

| Vista | ID | Acceso |
|-------|----|--------|
| Configuración | `#config-view` | Siempre |
| Juego | `#game-view` | Durante partida |
| Dashboard (sesión) | `#dashboard-view` | Post-partida |
| **Perfil (historial)** | `#profile-view` | **Desde menú de usuario** |

### 4.2. Filtros Disponibles

El usuario puede filtrar su historial de partidas con los siguientes controles:

| Filtro | Tipo de Control | Descripción |
|--------|----------------|-------------|
| **Fecha** | Date Range Picker (desde - hasta) | Filtra partidas por rango de fechas |
| **Modo de Juego** | Select / Chips | TIMER, FREE, ADAPTIVE o Todos |
| **Preguntas (cantidad)** | Range Slider (min - max) | Filtra por total de operaciones en la partida |
| **Operaciones Correctas** | Range Slider (min - max) | Filtra por cantidad de aciertos |
| **Tiempo Promedio** | Range Slider (min - max ms) | Filtra por velocidad promedio de respuesta |
| **Asertividad** | Range Slider (0% - 100%) | Filtra por porcentaje de aciertos |

### 4.3. Visualizaciones del Perfil

#### 4.3.1. Tarjetas de Resumen (Summary Cards)

Fila horizontal con métricas agregadas (respetan los filtros activos):

| Tarjeta | Dato | Icono |
|---------|------|-------|
| Total Partidas | Cantidad de partidas jugadas | Controlador de juego |
| Total Operaciones | Suma de todas las operaciones | Calculadora |
| Asertividad Global | % promedio de aciertos | Diana/Target |
| Velocidad Promedio | Tiempo medio de respuesta (ms) | Reloj |
| Mejor Partida | Mayor % de accuracy en una partida | Trofeo |

#### 4.3.2. Gráficas de Progreso Histórico

| Gráfica | Tipo | Descripción |
|---------|------|-------------|
| **Progreso de Asertividad** | Line Chart | Accuracy (%) por partida a lo largo del tiempo |
| **Velocidad de Respuesta** | Line Chart | Tiempo promedio (ms) por partida a lo largo del tiempo |
| **Distribución por Modo** | Doughnut Chart | Proporción de partidas por modo (Timer/Free/Adaptive) |
| **Tablas Más Practicadas** | Horizontal Bar Chart | Frecuencia de práctica por tabla (1-15) |
| **Mapa de Calor de Errores** | Heatmap (matrix) | Grid 15x15 coloreado por frecuencia de error acumulada |

#### 4.3.3. Tabla de Historial de Partidas

Tabla paginada con las partidas del usuario (ordenada por fecha descendente):

| Columna | Dato |
|---------|------|
| Fecha | Timestamp formateado |
| Modo | Icono + nombre del modo |
| Operaciones | Total de la partida |
| Correctas | Cantidad de aciertos |
| Asertividad | % con barra visual |
| Tiempo Prom. | Velocidad promedio (ms) |
| Puntaje | Puntaje compuesto de esa partida |
| Acciones | Botón "Ver detalle" → expande intentos individuales |

---

## 5. Análisis de IA (Histórico)

### 5.1. Análisis por Sesión (Existente)

El análisis actual con Gemini (GeminiService) se mantiene sin cambios. Analiza la sesión que acaba de terminar.

### 5.2. Análisis Histórico (Nuevo)

Desde el perfil del jugador, se agrega un botón "Analizar mi progreso" que envía el historial completo (o filtrado) a Gemini para un diagnóstico longitudinal.

| Aspecto | Especificación |
|---------|----------------|
| **Trigger** | Botón en `#profile-view` |
| **Datos enviados** | Resumen agregado de las partidas filtradas (no el CSV crudo completo) |
| **Modelo** | `gemini-2.5-flash-lite` (mismo que sesión) |
| **Contexto adicional** | Incluye tendencias: mejorando / estancado / empeorando |

### 5.3. Prompt para Análisis Histórico

```
Role: System
Actúa como un entrenador experto en aprendizaje de multiplicaciones. Analiza el PROGRESO HISTÓRICO de un estudiante a lo largo de múltiples sesiones. Tu análisis debe ser longitudinal, no de una sesión aislada.

Role: User
Datos del estudiante:
- Nombre: {displayName}
- Total de partidas: {total_games}
- Período: {fecha_primera_partida} a {fecha_última_partida}
- Asertividad promedio: {global_accuracy}%
- Tendencia de accuracy: {trend_accuracy} (mejorando/estancado/empeorando)
- Velocidad promedio: {avg_time}ms
- Tendencia de velocidad: {trend_speed}
- Tablas más débiles: {weak_tables}
- Operaciones con más errores acumulados: {top_errors}
- Mejor partida: {best_game_accuracy}% accuracy
- Peor partida: {worst_game_accuracy}% accuracy

Genera un diagnóstico de evolución que incluya:
1. Evaluación del progreso general
2. Patrones de mejora o estancamiento
3. Recomendaciones personalizadas para las próximas sesiones
4. Reconocimiento de logros alcanzados
```

---

## 6. Sistema de Puntaje y Posición en la Comunidad

### 6.1. Puntaje Compuesto (Community Score)

El puntaje de cada jugador se calcula a partir de 3 variables principales, cada una con un peso específico y una transformación interna.

#### Variables y Pesos

| Variable | Peso | Rango de Entrada | Transformación Interna | Descripción |
|----------|------|-------------------|----------------------|-------------|
| **Operaciones Correctas** | **W1** = 0.30 | 0 - N | `log10(total_correct + 1) * 100` | Escala logarítmica para premiar volumen sin que sea dominante. Un jugador con 1000 correctas no tiene 10x más puntaje que uno con 100. |
| **Tiempo Promedio de Respuesta** | **W2** = 0.35 | ms (menor = mejor) | `max(0, 100 - (avg_time / 100))` | Inversión lineal: respuestas más rápidas = mayor puntaje. Capped a 100 puntos. Un promedio de 1000ms = 90pts, 3000ms = 70pts. |
| **Asertividad (Accuracy)** | **W3** = 0.35 | 0% - 100% | `accuracy` (valor directo) | Porcentaje de aciertos global. Se usa directamente ya que está en escala 0-100. |

#### Fórmula del Puntaje

```
Community_Score = (W1 * Score_Correctas) + (W2 * Score_Tiempo) + (W3 * Score_Accuracy)

Donde:
  Score_Correctas = log10(total_correct + 1) * 100
  Score_Tiempo    = max(0, 100 - (avg_response_time / 100))
  Score_Accuracy  = global_accuracy
```

> **Nota:** Los pesos (W1, W2, W3) son configurables y serán iterados en versiones futuras del documento. Los valores actuales (0.30, 0.35, 0.35) priorizan la velocidad y precisión por igual, con una contribución menor pero significativa del volumen de práctica.

#### Ejemplo de Cálculo

| Jugador | Correctas | Tiempo Prom. | Accuracy | Score_C | Score_T | Score_A | **Total** |
|---------|-----------|-------------|----------|---------|---------|---------|-----------|
| Ana | 500 | 1800ms | 92% | 2.70*100=270 | 82 | 92 | 0.30(270)+0.35(82)+0.35(92) = 81+28.7+32.2 = **141.9** |
| Pedro | 200 | 2500ms | 78% | 2.30*100=230 | 75 | 78 | 0.30(230)+0.35(75)+0.35(78) = 69+26.25+27.3 = **122.55** |

### 6.2. Posición en la Comunidad

#### Visualización en el Perfil del Jugador

| Elemento | Descripción |
|----------|-------------|
| **Puntaje personal** | Número grande con el Community Score |
| **Posición** | "#5 de 120 jugadores" |
| **Percentil** | "Estás en el top 4% de la comunidad" |
| **Barra de progreso** | Barra visual mostrando posición relativa |

#### Top Jugadores (Leaderboard)

Tabla visible desde el perfil que muestra los mejores jugadores de la comunidad:

| Columna | Dato |
|---------|------|
| Posición | # ranking |
| Avatar | Foto de Google |
| Nombre | displayName |
| Puntaje | Community Score |
| Partidas | Total de partidas jugadas |
| Asertividad | % accuracy global |
| Última actividad | Hace cuánto jugó |

**Reglas del Leaderboard:**
- Se muestran los top 20 jugadores.
- El jugador actual siempre aparece en la tabla (aunque no esté en top 20), con su posición real.
- Mínimo 5 partidas jugadas para aparecer en el leaderboard.
- Los datos son de solo lectura para otros usuarios (ver reglas de seguridad en sección 3.2).

---

## 7. Flujo Completo del Usuario

### 7.1. Usuario Sin Login (Experiencia por Defecto - SIN CAMBIOS)

```
┌─────────────────────────────────────────────────────┐
│            EXPERIENCIA POR DEFECTO                  │
│         (Idéntica a la actual, sin cambios)         │
├─────────────────────────────────────────────────────┤
│ 1. Abre Baldora                                     │
│ 2. Escribe su nickname manualmente                  │
│ 3. Configura modo, tablas, tiempo                   │
│ 4. Juega la partida                                 │
│ 5. Ve dashboard de sesión + análisis IA             │
│ 6. Descarga CSV/PDF si desea                        │
│ 7. NO tiene: historial en nube, perfil, ranking     │
│ 8. En header ve botón "Iniciar sesión con Google"   │
│ 9. Puede loguearse en cualquier momento             │
└─────────────────────────────────────────────────────┘
```

### 7.2. Usuario con Google (Primera Vez)

```
┌─────────────────────────────────────────────────────┐
│              PRIMER LOGIN CON GOOGLE                │
├─────────────────────────────────────────────────────┤
│ 1. Abre Baldora (todo carga normal)                 │
│ 2. Clic en botón Google del header (esquina sup.)   │
│ 3. Popup Google → Autoriza                          │
│ 4. onAuthStateChanged → Crea profile en DB          │
│ 5. Header cambia: avatar + nombre                   │
│ 6. Nickname se sugiere con displayName (editable)   │
│ 7. Juega partida (flujo normal sin cambios)         │
│ 8. endGame() → Guarda en nube automáticamente       │
│ 9. Ve dashboard de sesión (igual que siempre)       │
│ 10. Puede acceder a "Mi Perfil" desde el header     │
└─────────────────────────────────────────────────────┘
```

### 7.3. Usuario con Google (Visitas Posteriores)

```
┌─────────────────────────────────────────────────────┐
│                VISITAS POSTERIORES                  │
├─────────────────────────────────────────────────────┤
│ 1. Abre Baldora                                     │
│ 2. onAuthStateChanged → Detecta sesión activa       │
│ 3. Header muestra avatar + nombre automáticamente   │
│ 4. Nickname sugerido con displayName                │
│ 5. Juega normalmente, partidas se acumulan          │
│ 6. Puntaje y ranking se actualizan                  │
│ 7. Accede a "Mi Perfil" cuando quiera               │
└─────────────────────────────────────────────────────┘
```

---

## 8. Consideraciones Técnicas

### 8.1. Principio de No Interferencia

> **REGLA CRÍTICA:** Ninguna línea de código de este módulo debe modificar, eliminar o alterar el comportamiento de funciones, estilos o flujos ya implementados. Toda la implementación debe ser puramente aditiva.

#### Qué NO se debe hacer:
- NO modificar el flujo de `startGame()`, `endGame()`, `submitAnswer()` ni ninguna función existente en `app.js`
- NO alterar estilos CSS existentes ni cambiar posiciones de elementos actuales
- NO modificar `DataManager` existente; los métodos cloud se agregan como extensión separada
- NO condicionar funcionalidades actuales al estado de autenticación
- NO cambiar la posición ni comportamiento del botón de audio
- NO alterar el sistema de onboarding, exportación, ni vistas existentes

#### Qué SÍ se puede hacer:
- Agregar nuevos archivos JS, nuevos bloques HTML y nuevas reglas CSS
- Agregar llamadas adicionales después de funciones existentes (ej: hook post-endGame)
- Agregar nuevas vistas que coexistan con las existentes
- Leer datos de `DataManager` para guardar en nube (sin modificar el flujo de DataManager)

### 8.2. Impacto en Código Existente

| Archivo | Cambio | Tipo | Detalle |
|---------|--------|------|---------|
| `index.html` | Agregar SDK Auth, botón Google en header, vista profile | Aditivo | Se agregan scripts y HTML nuevos sin tocar los existentes |
| `js/app.js` | Agregar hook post-endGame para guardado en nube | Mínimo | Solo 1 llamada condicional al final de `endGame()`: `if (AuthManager.isLoggedIn()) CloudSync.saveGame(...)` |
| `js/data.js` | **Sin cambios** | Ninguno | Se lee `DataManager.sessionData` desde el módulo cloud, sin modificar `data.js` |
| `css/styles.css` | Estilos para botón Google header, perfil, filtros, leaderboard | Aditivo | Nuevas clases que no colisionan con las existentes |
| `js/auth.js` | **Nuevo archivo** - Gestión de autenticación y botón header | Nuevo | - |
| `js/cloudSync.js` | **Nuevo archivo** - Sincronización de datos con Firebase | Nuevo | - |
| `js/userProfile.js` | **Nuevo archivo** - Vista de perfil e historial | Nuevo | - |
| `js/leaderboard.js` | **Nuevo archivo** - Sistema de ranking | Nuevo | - |

### 8.3. Compatibilidad con Flujo Existente (Modo Sin Login)

Todo el sistema es aditivo. El flujo sin login debe seguir funcionando **exactamente** como funciona hoy. La autenticación es opcional y no bloquea ninguna funcionalidad existente. Un usuario que nunca toque el botón de Google jamás notará diferencia alguna en su experiencia.

### 8.3. Privacidad y GDPR

| Aspecto | Implementación |
|---------|----------------|
| Datos almacenados | Solo datos de juego + perfil público de Google |
| Eliminación de cuenta | Botón "Eliminar mi cuenta" que borra todos los datos del usuario |
| Datos públicos | Solo displayName, photoURL y puntaje en el leaderboard |
| Datos privados | Historial de partidas, intentos individuales, análisis IA |

---

## 9. Checklist de Implementación

### Fase 1: Autenticación
- [ ] Agregar Firebase Auth SDK al `index.html`
- [ ] Habilitar proveedor Google en Firebase Console
- [ ] Crear `js/auth.js` con lógica de login/logout
- [ ] Agregar botón Google en header fijo (esquina superior derecha, junto al botón de audio)
- [ ] Implementar `onAuthStateChanged` para gestión de estado del header
- [ ] Mostrar avatar + nombre y dropdown al estar logueado
- [ ] Verificar que botón de audio NO se mueva ni cambie de comportamiento
- [ ] Verificar que TODO el flujo existente funcione igual sin login

### Fase 2: Persistencia de Datos
- [ ] Definir estructura de datos en Realtime Database
- [ ] Configurar reglas de seguridad
- [ ] Crear `js/cloudSync.js` (módulo separado, NO modificar `data.js`)
- [ ] Agregar hook mínimo en `endGame()` para guardado condicional en nube
- [ ] Calcular y actualizar stats agregados
- [ ] Actualizar leaderboard al guardar partida

### Fase 3: Perfil y Visualización
- [ ] Crear vista `#profile-view` con HTML/CSS
- [ ] Implementar sistema de filtros
- [ ] Crear gráficas de progreso histórico (Chart.js)
- [ ] Implementar tabla de historial con paginación
- [ ] Crear tarjetas de resumen con métricas agregadas

### Fase 4: Análisis IA Histórico
- [ ] Crear prompt para análisis longitudinal
- [ ] Implementar cálculo de tendencias (mejorando/estancado/empeorando)
- [ ] Conectar botón "Analizar mi progreso" con GeminiService
- [ ] Renderizar resultado en el perfil

### Fase 5: Comunidad y Ranking
- [ ] Implementar fórmula de Community Score
- [ ] Crear vista de leaderboard
- [ ] Mostrar posición personal y percentil
- [ ] Crear componente de top 20 jugadores

---

## 10. Documentos Relacionados

| Documento | Relevancia |
|-----------|------------|
| `Main_doc_f1_vision.md` | Arquitectura base del proyecto |
| `Main_doc_f3_diseño.md` | Design System para UI consistente |
| `Main_doc_f8_AI.md` | Integración con Firebase AI Logic / Gemini |
| `Main_doc_f9_SDK.md` | Referencia del SDK de Firebase AI |
| `Main_doc_f11_ANSWR.md` | Formato de respuesta de la API para análisis |

---

*Documento en iteración. Última actualización: 4 de Marzo, 2026 - v1.1*
