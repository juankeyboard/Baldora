# Documento Maestro de Ingeniería: Sistema de Usuario con Google

| Campo | Valor |
|-------|-------|
| **Versión** | 1.5 (Iteración 5 - Sistema de Ligas Comunitarias) |
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

El sistema de nickname manual existente se mantiene intacto para usuarios no autenticados. Cuando el usuario inicia sesión con Google, el campo de nickname desaparece y todos los registros quedan asociados al nombre de la cuenta de Google.

### Objetivos

1. **Identidad persistente (opcional):** Agregar la opción de cuenta Google verificada. Sin login, el flujo de nickname manual no cambia. Con login, el nombre de Google reemplaza al nickname y el campo desaparece de la UI.
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
2. Configurar los dominios autorizados en Authentication > Settings > Authorized domains:
   - `localhost` (desarrollo local)
   - `baldora-89866.firebaseapp.com` (dominio por defecto de Firebase)
   - `baldora-89866.web.app` (dominio por defecto de Firebase Hosting)
   - **`baldora.org`** (dominio personalizado/oficial del sitio — **CRÍTICO para producción**)
3. Verificar que el `authDomain` en `firebaseConfig` sea: `baldora.org` (dominio personalizado para que el popup de Google muestre "Ir a baldora.org").
4. **Registrar URI de redirección en Google Cloud Console:**
   - Ir a [Google Cloud Console > APIs & Services > Credentials](https://console.cloud.google.com/apis/credentials?project=baldora-89866)
   - Editar el OAuth 2.0 Client ("Web client (auto created by Google Service)")
   - En "Authorized redirect URIs" agregar: `https://baldora.org/__/auth/handler`
   - Guardar cambios (puede tardar 5 min a unas horas en propagarse)

> **⚠️ LECCIÓN APRENDIDA (Deploy 4-Mar-2026):**
> - El `authDomain` puede cambiarse a un **dominio personalizado** (ej: `baldora.org`) SIEMPRE QUE se registre `https://{dominio}/__/auth/handler` como redirect URI en Google Cloud Console > Credentials > OAuth Client.
> - Si se cambia `authDomain` SIN registrar la redirect URI, se obtiene `Error 400: redirect_uri_mismatch`.
> - Si el sitio usa un **dominio personalizado** (ej: `baldora.org`), ese dominio DEBE agregarse también a la lista de dominios autorizados en Firebase Console > Authentication > Settings. Sin esto, `signInWithPopup()` falla con `auth/unauthorized-domain`.
> - URIs de redirección actualmente registradas:
>   1. `https://baldora-89866.firebaseapp.com/__/auth/handler` (por defecto)
>   2. `https://baldora.org/__/auth/handler` (dominio personalizado)

### 2.3.1. Configuración de Firebase Hosting para OAuth (firebase.json)

Firebase Hosting aplica headers de seguridad `Cross-Origin-Opener-Policy: same-origin` por defecto, los cuales **bloquean la comunicación** entre el popup de Google OAuth y la ventana principal de la app. Para que `signInWithPopup()` funcione en producción, se debe agregar el siguiente header en `firebase.json`:

```json
{
  "hosting": {
    "headers": [
      {
        "source": "/**",
        "headers": [
          {
            "key": "Cross-Origin-Opener-Policy",
            "value": "same-origin-allow-popups"
          }
        ]
      }
    ]
  }
}
```

> **Nota:** Sin este header, el popup de Google se abre y se cierra inmediatamente sin completar la autenticación. El error en consola es: `Cross-Origin-Opener-Policy policy would block the window.closed call`.

### 2.3.2. Reglas de Seguridad de Realtime Database

Las reglas de Realtime Database deben incluir las rutas de `users` y `leaderboard` para que el sistema de usuario funcione. Sin estas reglas, Firebase rechaza la escritura con `permission_denied` al intentar crear el perfil del usuario post-autenticación.

Reglas requeridas (en Firebase Console > Realtime Database > Rules):

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
        ".write": "$uid === auth.uid"
      }
    },
    "leaderboard": {
      ".read": true,
      "community_benchmarks": {
        ".write": "auth != null"
      },
      "players": {
        "$uid": {
          ".write": "$uid === auth.uid"
        }
      }
    }
  }
}
```

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
2. La página se carga con el flujo normal
3. En la vista de configuración ve el label "Tu nickname o Inicia sesión"
   y debajo del campo nickname un botón "Iniciar sesión con Google"
4. También hay un botón de Google en la esquina superior derecha (header)
5. Si decide loguearse → Clic en cualquier botón → signInWithPopup() → Autorización Google
6. Retorno → onAuthStateChanged() detecta usuario
7. El botón del header cambia: avatar + nombre + dropdown
8. El campo nickname DESAPARECE (incluido el botón de sign-in dentro del grupo)
9. Todos los registros quedan asociados al nombre de Google
10. Si NO se loguea → Todo funciona como antes (campo nickname + botón sign-in visibles)
```

> **Importante:** El login con Google NO es un paso obligatorio ni un prerequisito para jugar. El botón de sign-in en la vista config se oculta automáticamente al iniciar sesión (junto con el `#nickname-field-group`).

#### Comportamiento del Campo Nickname según Estado de Auth

| Estado | Campo Nickname | Botón Sign-In Config | Nombre en Registros |
|--------|---------------|----------------------|---------------------|
| **Sin login** | Visible y editable | Visible bajo el input | El que el usuario escriba |
| **Logueado con Google** | Oculto | Oculto (mismo grupo) | `user.displayName` de Google |

### 2.6. Componente UI: Botones de Google

El sistema tiene **dos puntos de acceso al login** para maximizar la visibilidad y accesibilidad:

#### 2.6.1. Botón en Header Global (todas las vistas)
El botón de autenticación con Google vive en la **esquina superior derecha de la página**, como un componente fijo global, visible en todas las vistas. Se ubica junto al botón de audio existente.

#### 2.6.2. Botón en Vista de Configuración (solo primera vista)
Debajo del campo de nickname (dentro de `#nickname-field-group`) se muestra un botón secundario "Iniciar sesión con Google". Este botón:
- Solo es visible en la primera vista (config) cuando el usuario **no** está logueado
- Se oculta automáticamente cuando el usuario inicia sesión (junto con el grupo de nickname)
- Invoca el mismo flujo de autenticación que el botón del header (`signInWithPopup`)
- El label del campo nickname dice "Tu nickname o Inicia sesión" para guiar al usuario

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
        // → OCULTAR el campo de nickname en la vista de configuración
        // → Usar user.displayName en todos los registros de partidas
        // → Habilitar guardado en nube
        // → Habilitar acceso a "Mi Perfil"
    } else {
        // Usuario no logueado
        // → Mostrar botón "Iniciar sesión con Google"
        // → MOSTRAR el campo de nickname (comportamiento actual)
        // → No guardar en nube
        // → Ocultar opción "Mi Perfil"
    }
});
```

> **Nota:** El `onAuthStateChanged` solo agrega comportamiento. El campo nickname se oculta/muestra mediante una clase CSS (ej: `.nickname-wrapper.hidden { display: none; }`), sin modificar el input ni su lógica interna.

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
│       │       ├── game_score: 72.3         ← Puntaje individual vs. comunidad
│       │       ├── tables_used: { rows: [1,2,3...], cols: [1,2,3...] }
│       │       ├── ai_analysis/             ← null si no se ha analizado
│       │       │   ├── generated_at: "2026-03-04T11:00:00Z"
│       │       │   ├── resumen_general: "..."
│       │       │   ├── patron_errores: "..."
│       │       │   ├── plan_accion: "..."
│       │       │   └── sugerencia_entrenamiento: "..."
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
    ├── community_benchmarks/   ← Valores extremos de la comunidad
    │   ├── max_total_correct: 3500
    │   ├── min_response_time: 620
    │   ├── max_response_time: 9800
    │   ├── min_accuracy: 42.0
    │   └── max_accuracy: 99.1
    └── players/
        └── {uid}/
            ├── displayName: "Juan García"
            ├── photoURL: "https://..."
            ├── community_score: 78.4
            ├── score_correctas: 34.3
            ├── score_tiempo: 86.6
            ├── score_accuracy: 87.6
            ├── total_correct: 1200
            ├── avg_response_time: 1800
            ├── global_accuracy: 84.9
            ├── total_games: 15
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

El análisis actual con Gemini (GeminiService) se mantiene sin cambios. Analiza la sesión que acaba de terminar. Este análisis se guarda en la base de datos asociado a esa partida si el usuario está autenticado.

### 5.2. Persistencia y Visualización de Análisis en la Tabla de Historial

El resultado del análisis IA de cada partida se guarda en la base de datos bajo `users/{uid}/games/{gameId}/ai_analysis/`. En la tabla de historial de partidas:

- Si una partida **tiene** análisis guardado: se muestra un icono indicador (ej: 🧠) y el usuario puede expandirlo para leerlo.
- Si una partida **no tiene** análisis: se muestra un botón "Analizar" con el **mismo diseño del botón de análisis existente en el dashboard de sesión**. Al hacer clic, genera el análisis de esa partida específica y lo guarda en la DB.

| Elemento | Especificación |
|----------|----------------|
| **Indicador con análisis** | Icono 🧠 + texto "Ver análisis" (expandible inline) |
| **Botón sin análisis** | Mismo estilo que el botón actual de análisis en el dashboard de sesión |
| **Texto del botón** | "Analizar partida" |
| **Datos enviados** | Los intentos individuales de esa partida específica (mismo formato CSV actual) |
| **Al completarse** | El análisis se guarda en DB y el botón se reemplaza por el indicador 🧠 |

### 5.3. Análisis Histórico Global (Nuevo)

Desde el perfil del jugador, se agrega un botón "Analizar mi progreso" separado de la tabla, que envía el historial completo (o filtrado) a Gemini para un diagnóstico longitudinal que considera múltiples sesiones.

| Aspecto | Especificación |
|---------|----------------|
| **Trigger** | Botón en la sección superior de `#profile-view`, fuera de la tabla |
| **Estilo** | Mismo diseño que el botón de análisis del dashboard de sesión |
| **Datos enviados** | Resumen agregado de las partidas filtradas (no el CSV crudo) |
| **Modelo** | `gemini-2.5-flash-lite` (mismo que sesión) |
| **Contexto adicional** | Incluye tendencias: mejorando / estancado / empeorando |
| **Resultado** | Se muestra debajo del botón, en las mismas tarjetas de resultado del dashboard |

### 5.4. Prompt para Análisis Histórico Global

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

### 6.1. Principio de Normalización por Comunidad

Las tres variables del puntaje se normalizan **relativamente** a los valores extremos de la comunidad, no en escalas fijas. Esto garantiza que el sistema sea justo y dinámico: conforme la comunidad mejora, los puntajes se recalibran.

Los valores de referencia de la comunidad se almacenan en:
```
leaderboard/community_benchmarks/
├── max_total_correct: 3500      ← Total de correctas del jugador con más aciertos
├── min_response_time: 620       ← Tiempo (ms) de la operación correcta más rápida
├── max_response_time: 9800      ← Tiempo (ms) de la operación correcta más lenta
├── min_accuracy: 42.0           ← Accuracy más baja de la comunidad
└── max_accuracy: 99.1           ← Accuracy más alta de la comunidad
```

Estos benchmarks se recalculan y actualizan cada vez que un jugador guarda una partida.

---

### 6.2. Variables, Normalización y Pesos

#### Variable 1: Operaciones Correctas (Volumen)

| Aspecto | Descripción |
|---------|-------------|
| **Dato de entrada** | `total_correct` del jugador (suma de todas sus partidas) |
| **Referencia** | `community_benchmarks.max_total_correct` = total del jugador con más aciertos en la comunidad |
| **Normalización** | `Score_C = (total_correct / max_total_correct) * 100` |
| **Rango de salida** | 0 a 100 |
| **Lógica** | El jugador con más operaciones correctas obtiene 100. El resto se mide proporcionalmente respecto a ese máximo. |
| **Peso** | **W1** (por definir en próxima iteración) |

#### Variable 2: Tiempo Promedio de Respuesta (Velocidad)

| Aspecto | Descripción |
|---------|-------------|
| **Dato de entrada** | `avg_response_time` del jugador (promedio de todas sus operaciones correctas) |
| **Referencia min** | `community_benchmarks.min_response_time` = operación correcta más rápida de toda la comunidad |
| **Referencia max** | `community_benchmarks.max_response_time` = operación correcta más lenta de toda la comunidad |
| **Normalización** | `Score_T = (max_time - avg_time) / (max_time - min_time) * 100` |
| **Rango de salida** | 0 a 100 |
| **Lógica** | El jugador con el tiempo promedio igual al mínimo de la comunidad obtiene 100. El que tiene el tiempo promedio igual al máximo obtiene 0. La posición dentro del rango define el puntaje. |
| **Peso** | **W2** (por definir en próxima iteración) |

> **Nota:** Se usa el tiempo promedio del jugador (sobre todas sus operaciones correctas) comparado contra los extremos absolutos de la comunidad (operación individual más rápida y más lenta). Esto premia la consistencia en la velocidad.

#### Variable 3: Asertividad (Accuracy)

| Aspecto | Descripción |
|---------|-------------|
| **Dato de entrada** | `global_accuracy` del jugador (promedio de accuracy de todas sus partidas) |
| **Referencia min** | `community_benchmarks.min_accuracy` = accuracy más baja de la comunidad |
| **Referencia max** | `community_benchmarks.max_accuracy` = accuracy más alta de la comunidad |
| **Normalización** | `Score_A = (player_accuracy - min_accuracy) / (max_accuracy - min_accuracy) * 100` |
| **Rango de salida** | 0 a 100 |
| **Lógica** | El jugador con la accuracy más alta de la comunidad obtiene 100. El de la más baja obtiene 0. La posición dentro del rango define el puntaje. |
| **Peso** | **W3** (por definir en próxima iteración) |

---

### 6.3. Fórmula del Puntaje Compuesto

```
Community_Score = (W1 * Score_C) + (W2 * Score_T) + (W3 * Score_A)

Donde:
  Score_C = (total_correct / max_total_correct) * 100
  Score_T = (max_response_time - avg_response_time) / (max_response_time - min_response_time) * 100
  Score_A = (player_accuracy - min_accuracy) / (max_accuracy - min_accuracy) * 100

  W1 = W2 = W3 = 1/3  ≈ 0.3333  (distribución equitativa entre las tres dimensiones)
```

> **Decisión de pesos (Iteración 5):** Se eligieron pesos iguales W1=W2=W3=1/3 para que ninguna dimensión (volumen, velocidad, asertividad) tenga ventaja sobre las demás. El sistema premia a jugadores equilibrados sobre los que destacan solo en una variable.

#### Ejemplo de Cálculo (con benchmarks hipotéticos)

Benchmarks de comunidad: `max_correct=3500`, `min_time=620ms`, `max_time=9800ms`, `min_accuracy=42%`, `max_accuracy=99.1%`

| Jugador | Correctas | Tiempo Prom. | Accuracy | Score_C | Score_T | Score_A |
|---------|-----------|-------------|----------|---------|---------|---------|
| Ana | 1200 | 1800ms | 92% | (1200/3500)*100 = **34.3** | (9800-1800)/(9800-620)*100 = **86.6** | (92-42)/(99.1-42)*100 = **87.6** |
| Pedro | 3500 | 2500ms | 78% | (3500/3500)*100 = **100** | (9800-2500)/(9800-620)*100 = **79.5** | (78-42)/(99.1-42)*100 = **63.0** |
| Luis | 400 | 890ms | 99.1% | (400/3500)*100 = **11.4** | (9800-890)/(9800-620)*100 = **97.0** | (99.1-42)/(99.1-42)*100 = **100** |

---

### 6.4. Puntaje por Partida vs. Comunidad

Cada partida individual también puede obtener su propio puntaje relativo, comparado contra el **promedio de la comunidad** en las mismas 3 variables. Esto permite mostrar en la tabla de historial si esa partida estuvo por encima o por debajo del nivel general.

| Elemento | Descripción |
|----------|-------------|
| **Score de la partida** | Calculado con los datos de esa sesión individual vs. benchmarks de comunidad |
| **Comparación** | Indicador visual: por encima / en la media / por debajo del promedio comunitario |
| **Visible en** | Columna "Puntaje" en la tabla de historial de partidas |

La **posición en el leaderboard** se determina únicamente por el puntaje compuesto global del jugador (acumulado de todas sus partidas), no por el puntaje de una partida individual.

---

### 6.5. Sistema de Ligas Comunitarias (Iteración 5)

El posicionamiento en la comunidad se expresa como una **liga** dentro de 100 grupos percentílicos dinámicos, no como un número de posición fijo.

#### Fórmula de Tier (Grupo Percentílico)

```
Tier = floor((rank - 1) / total_jugadores × 100) + 1

Donde:
  rank    = posición del jugador ordenando todos los jugadores por Community_Score desc (1 = mejor)
  total   = número total de jugadores con al menos 1 práctica guardada
  Tier    = grupo del 1 al 100 (1 = élite, 100 = base)
```

**Por qué `floor((rank-1)/total×100)+1` y no `ceil(rank/total×100)`:**
La segunda fórmula produce Tier=100 (MADERA) para el único jugador o el mejor de todos (`rank=1, total=1` → `ceil(100)=100`). La fórmula correcta garantiza que el jugador con rank=1 siempre obtiene Tier=1 independientemente del total.

**Ejemplo:** 200 jugadores, el jugador ocupa la posición 31 por Community_Score:
`Tier = floor(30/200 × 100) + 1 = floor(15) + 1 = 16` → Liga **Oro**

**Caso especial (jugador único):**
`Tier = floor(0/1 × 100) + 1 = 0 + 1 = 1` → Liga **Diamante** ✓

#### Ligas y Rangos de Tier

| Liga | Tier | % de la Comunidad | Color |
|------|------|-------------------|-------|
| **DIAMANTE** | 1 – 5 | Top 5% | Cyan (#00c8ff) |
| **PLATINO** | 6 – 15 | Siguiente 10% | Plateado (#b8d0e0) |
| **ORO** | 16 – 30 | Siguiente 15% | Dorado (#f5a623) |
| **PLATA** | 31 – 50 | Siguiente 20% | Plata (#8ea7b8) |
| **BRONCE** | 51 – 70 | Siguiente 20% | Bronce (#cd7f32) |
| **MADERA** | 71 – 100 | 30% restante | Tierra (#8b6042) |

#### Reglas del Sistema de Ligas

- **Mínimo para entrar:** 1 práctica guardada.
- **Recálculo:** Cada vez que cualquier jugador guarda una práctica, se recalculan los tiers de **todos** los jugadores activos.
- **Dinamismo:** Si otros jugadores mejoran, tu tier puede cambiar aunque tú no hayas jugado.
- **Empates:** Jugadores con el mismo Community_Score comparten rank. Si N jugadores empatan en rank R, todos obtienen `Tier = ceil(R / total × 100)`.

#### Visualización en el Perfil del Jugador

El badge de comunidad se muestra en el header del perfil, **a la derecha de los datos del usuario**, alineado visualmente sobre los contenedores de "Tiempo promedio" y "Mejor precisión".

| Elemento | Descripción |
|----------|-------------|
| **Posición relativa** | Header del perfil, columna derecha (grid `1fr 1fr`) |
| **Contenido principal** | Nombre de la liga en grande (ej. `ORO`) con color de liga |
| **Subtítulo** | Número de tier (ej. `Tier 22`) |
| **Label** | "TU POSICIÓN EN LA COMUNIDAD" en texto pequeño |
| **Fondo** | `var(--clr-surface-high)` — consistente con el resto de la página |
| **Color** | Cada liga tiene un color de acento distinto aplicado al nombre |

#### Datos en Firebase

Tras cada recálculo, se escriben en `leaderboard/players/{uid}`:
```
leaderboard/players/{uid}/
├── tier: 22              ← grupo percentílico (1-100)
└── league: "ORO"         ← nombre de la liga
```

---

## 7. Flujo Completo del Usuario

### 7.1. Usuario Sin Login (Experiencia por Defecto - SIN CAMBIOS)

```
┌─────────────────────────────────────────────────────┐
│            EXPERIENCIA POR DEFECTO                  │
│         (Idéntica a la actual, sin cambios)         │
├─────────────────────────────────────────────────────┤
│ 1. Abre Baldora                                     │
│ 2. Campo nickname visible y editable (como siempre) │
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
│ 5. Header cambia: avatar + nombre del header        │
│ 6. Campo nickname DESAPARECE de la configuración    │
│ 7. Todos los registros usan el nombre de Google     │
│ 8. Juega partida (flujo de juego sin cambios)       │
│ 9. endGame() → Guarda en nube automáticamente       │
│ 10. Ve dashboard de sesión (igual que siempre)      │
│ 11. Análisis IA de esa sesión se guarda en la DB    │
│ 12. Puede acceder a "Mi Perfil" desde el header     │
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
- [ ] Agregar columna de análisis IA en tabla (indicador 🧠 o botón "Analizar partida")
- [ ] Implementar guardado de análisis IA por partida en DB
- [ ] Crear tarjetas de resumen con métricas agregadas

### Fase 4: Análisis IA Histórico
- [ ] Guardar automáticamente análisis de sesión en DB al generarse (si usuario logueado)
- [ ] Mostrar análisis guardados en tabla de historial (expandible)
- [ ] Crear botón "Analizar partida" con mismo diseño del botón existente
- [ ] Crear prompt para análisis longitudinal global
- [ ] Implementar cálculo de tendencias (mejorando/estancado/empeorando)
- [ ] Conectar botón "Analizar mi progreso" con GeminiService
- [ ] Renderizar resultado global en el perfil

### Fase 5: Comunidad y Ranking
- [ ] Implementar cálculo y guardado de benchmarks de comunidad en DB
- [ ] Actualizar benchmarks al guardar cada partida
- [ ] Implementar fórmula de Community Score normalizada por comunidad
- [ ] Calcular puntaje individual por partida (vs. comunidad)
- [ ] Crear vista de leaderboard (top 100)
- [ ] Mostrar posición personal y percentil
- [ ] Resaltar al jugador actual si está en top 100

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

## 11. Registro de Incidencias de Deploy (Post-Implementación)

> Esta sección documenta problemas encontrados durante el despliegue a producción y sus soluciones, para referencia en futuras implementaciones.

### 11.1. Incidencia: `auth/unauthorized-domain` en producción

| Campo | Detalle |
|-------|--------|
| **Fecha** | 4 de Marzo, 2026 |
| **Entorno** | Producción (`baldora.org`) |
| **Error** | `FirebaseError: This domain is not authorized for OAuth operations for your Firebase project (auth/unauthorized-domain)` |
| **Causa** | El dominio personalizado `baldora.org` no estaba en la lista de dominios autorizados de Firebase Authentication |
| **Síntoma** | El popup de Google se abre pero la autenticación falla. Funciona en `localhost` pero no en producción |
| **Solución** | Agregar `baldora.org` en Firebase Console > Authentication > Settings > Authorized domains |
| **Requiere deploy** | NO — cambio de configuración en consola, efecto inmediato |

### 11.2. Incidencia: Popup de Google se cierra inmediatamente (COOP)

| Campo | Detalle |
|-------|--------|
| **Fecha** | 4 de Marzo, 2026 |
| **Entorno** | Producción |
| **Error** | `Cross-Origin-Opener-Policy policy would block the window.closed call` |
| **Causa** | Firebase Hosting envía headers COOP estrictos (`same-origin`) que bloquean la comunicación popup ↔ ventana principal |
| **Síntoma** | El popup de Google se abre y se cierra casi inmediatamente sin permitir seleccionar cuenta |
| **Solución** | Agregar header `Cross-Origin-Opener-Policy: same-origin-allow-popups` en `firebase.json` (ver sección 2.3.1) |
| **Requiere deploy** | SÍ — cambio en `firebase.json` |

### 11.3. Incidencia: `Error 400: redirect_uri_mismatch`

| Campo | Detalle |
|-------|--------|
| **Fecha** | 4 de Marzo, 2026 |
| **Entorno** | Producción |
| **Error** | `Access blocked: This app's request is invalid. Error 400: redirect_uri_mismatch` |
| **Causa** | Se cambió `authDomain` de `baldora-89866.firebaseapp.com` a `baldora-89866.web.app`, pero Google OAuth solo tiene registrado `firebaseapp.com/__/auth/handler` como redirect URI válida |
| **Síntoma** | Google muestra página de error "Access blocked" al intentar autenticarse |
| **Solución** | Revertir `authDomain` a `baldora-89866.firebaseapp.com` en `firebaseConfig` |
| **Requiere deploy** | SÍ — cambio en `index.html` |
| **Lección** | NUNCA cambiar `authDomain` de `.firebaseapp.com` a menos que se reconfigure manualmente el OAuth Client en Google Cloud Console |

### 11.4. Incidencia: `permission_denied` al crear perfil

| Campo | Detalle |
|-------|--------|
| **Fecha** | 4 de Marzo, 2026 |
| **Entorno** | Producción |
| **Error** | `FIREBASE WARNING: transaction at /users/{uid}/profile failed: permission_denied` |
| **Causa** | Las reglas de Realtime Database solo tenían la ruta `visits`, no incluían las rutas `users` ni `leaderboard` |
| **Síntoma** | El login con Google funciona pero falla al guardar el perfil del usuario |
| **Solución** | Agregar reglas de seguridad para `users` y `leaderboard` (ver sección 2.3.2) |
| **Requiere deploy** | NO — cambio de configuración en consola, efecto inmediato |

### Checklist de Deploy para Google Auth

- [x] Google habilitado como proveedor en Firebase Console > Authentication > Sign-in method
- [x] Dominio `baldora.org` agregado en Authentication > Settings > Authorized domains
- [x] `authDomain` en `firebaseConfig` = `baldora-89866.firebaseapp.com` (NO cambiar)
- [x] Header COOP `same-origin-allow-popups` en `firebase.json`
- [x] Reglas de Realtime Database incluyen rutas `users/$uid` y `leaderboard`
- [x] Deploy ejecutado después de cambios en `firebase.json` e `index.html`

---

---

## 12. Registro de Cambios de Diseño UI (Iteración 4)

### 12.1. Footer siempre al fondo en vista Mi Perfil

| Cambio | Detalle |
|--------|---------|
| **Problema** | El footer podía quedar en medio de la vista si el contenido era corto |
| **Solución** | `#profile-view.active { display: flex; flex-direction: column; }` + `.profile-container { flex: 1; }` — crea una cadena flex que garantiza que el footer con `margin-top: auto` siempre se ancle al fondo del viewport |

### 12.2. Fondo consistente con el resto de la página

| Cambio | Detalle |
|--------|---------|
| **Problema** | Las tarjetas de stats y el badge de comunidad usaban `rgba(255,255,255,0.85)` con `backdrop-filter: blur(10px)` (glassmorphism), visualmente diferente al resto de la app |
| **Solución** | Cambiado a `background: var(--clr-surface-high)` en `.profile-stat-card`, `.community-badge` y `.profile-footer p` — consistente con el sistema de diseño global |

### 12.3. Community badge reposicionado

| Cambio | Detalle |
|--------|---------|
| **Cambio** | `.profile-header-row` cambiado de `display: flex; justify-content: space-between` a `display: grid; grid-template-columns: 1fr 1fr` |
| **Resultado** | El badge ocupa exactamente el 50% derecho del header, alineándose visualmente con las cards de "Tiempo promedio" y "Mejor precisión" del grid de stats |
| **Badge simplificado** | Eliminado el ícono de trofeo; solo muestra `0/100` + label "COMUNIDAD" |

### 12.4. Botón de login en vista de configuración

| Cambio | Detalle |
|--------|---------|
| **Nuevo elemento** | `#btn-config-google-signin` dentro de `#nickname-field-group` |
| **Comportamiento** | Se oculta automáticamente al login (junto con el grupo de nickname vía clase `.nickname-hidden`). Al ocultar, se elimina el atributo `required` del input para no bloquear el submit del formulario; se restaura al cerrar sesión. |
| **Label actualizado** | `"Tu Nickname"` → `"Tu nickname o Inicia sesión"` |

---

### 12.5. Sistema de Ligas Comunitarias (Iteración 5)

| Cambio | Detalle |
|--------|---------|
| **Pesos finalizados** | W1=W2=W3=1/3 — distribución equitativa entre volumen, velocidad y asertividad |
| **Grupos percentílicos** | 100 grupos dinámicos: `Posición = ceil(rank / total × 100)` |
| **Ligas** | 6 ligas con icono y color propio: 💎 Diamante (1–5), 🏅 Platino (6–15), 🥇 Oro (16–30), 🥈 Plata (31–50), 🥉 Bronce (51–70), 🪵 Madera (71–100) |
| **Recálculo global** | Cada vez que alguien guarda una práctica, `_recalculateAllTiers()` recalcula y escribe tier+league para todos los jugadores |
| **Mínimo de entrada** | 1 práctica (antes el leaderboard exigía 5 — reducido para inclusividad) |
| **Archivos modificados** | `cloudSync.js` (pesos, `_recalculateAllTiers()`), `userProfile.js` (`_renderCommunityScore()`), `index.html` (badge HTML), `css/styles.css` (estilos de liga) |

---

### 12.6. Mejoras de diseño y datos en Vista de Perfil (Iteración 6)

| Cambio | Detalle |
|--------|---------|
| **"Tier" → "Posición"** | La palabra "Tier" se reemplazó por "Posición" en el badge de la comunidad |
| **Iconografía de ligas** | Cada liga ahora se muestra con un emoji representativo: 💎 Diamante, 🏅 Platino, 🥇 Oro, 🥈 Plata, 🥉 Bronce, 🪵 Madera. Gestionado por `_leagueToIcon()` en `userProfile.js` |
| **Número grande** | El número de posición se muestra en 3.6rem (antes era texto de 0.82rem), siendo ahora el elemento visual principal del badge |
| **Badge rediseñado** | Nueva estructura: icono (emoji) → número grande "Posición N" → nombre de liga → label. Inyectado via `innerHTML` en `_renderCommunityScore()` |
| **Borde coloreado por liga** | El borde del badge cambia de color según la liga activa |
| **Contador real de prácticas** | `profile-total-games` usa `gamesSnap.numChildren()` (conteo real desde la DB), no `stats.total_games`. La query a `/games` ya no usa `limitToLast(50)` para garantizar conteo exacto y historial completo en filtros |
| **Decremento al eliminar** | `_deleteGame()` ahora decrementa `stats.total_games` en Firebase con una transaction, manteniendo el stat sincronizado con la realidad |

---

*Documento en iteración. Última actualización: 4 de Marzo, 2026 - v1.6 (Diseño badge + contador real de prácticas)*
