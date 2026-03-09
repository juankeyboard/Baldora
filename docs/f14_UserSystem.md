# Documento Maestro de IngenierÃ­a: Sistema de Usuario con Google

| Campo | Valor |
|-------|-------|
| **VersiÃ³n** | 1.5 (IteraciÃ³n 5 - Sistema de Ligas Comunitarias) |
| **Fecha** | 4 de Marzo, 2026 |
| **Proyecto** | Baldora |
| **MÃ³dulo** | AutenticaciÃ³n, Persistencia de Datos, AnalÃ­ticas de Usuario |
| **Dependencias** | Firebase Auth, Firebase Realtime Database, Firebase AI Logic |
| **Estado** | Documento de diseÃ±o - En iteraciÃ³n |

---

> **REGLA GENERAL DE IMPLEMENTACIÃ“N:** Todo el cÃ³digo de este mÃ³dulo (HTML, CSS, JS) debe ser **estrictamente aditivo y modular**. BAJO NINGUNA CIRCUNSTANCIA se debe alterar, reemplazar o interferir con las funciones, diseÃ±o, flujos y comportamientos ya implementados en el proyecto. El sistema de usuario con Google es una capa opcional que se superpone al funcionamiento existente sin modificarlo.

---

## 1. VisiÃ³n General

Este mÃ³dulo introduce un sistema de usuario **opcional** basado en **Firebase Authentication con Google Sign-In**. Permite a los jugadores registrarse/iniciar sesiÃ³n con su cuenta de Google, persistir su historial de partidas en la nube, visualizar su rendimiento histÃ³rico con filtros avanzados, recibir anÃ¡lisis personalizado de IA y conocer su posiciÃ³n dentro de la comunidad Baldora.

El sistema de nickname manual existente se mantiene intacto para usuarios no autenticados. Cuando el usuario inicia sesiÃ³n con Google, el campo de nickname desaparece y todos los registros quedan asociados al nombre de la cuenta de Google.

### Objetivos

1. **Identidad persistente (opcional):** Agregar la opciÃ³n de cuenta Google verificada. Sin login, el flujo de nickname manual no cambia. Con login, el nombre de Google reemplaza al nickname y el campo desaparece de la UI.
2. **Historial en la nube:** Cada partida se guarda automÃ¡ticamente en Firebase Realtime Database (solo para usuarios autenticados).
3. **AnalÃ­ticas personales:** Dashboard con filtros de fecha, operaciones, tiempo y asertividad.
4. **AnÃ¡lisis IA:** Gemini analiza el progreso histÃ³rico del jugador (no solo la sesiÃ³n actual).
5. **Comunidad:** Sistema de puntaje compuesto y posiciÃ³n relativa entre jugadores.

---

## 2. AutenticaciÃ³n con Google

### 2.1. Infraestructura

Se utiliza **Firebase Authentication** con el proveedor `GoogleAuthProvider`, integrado al proyecto Firebase existente (`baldora-89866`).

| Componente | Valor |
|------------|-------|
| **SDK** | Firebase Auth Compat v12.8.0 |
| **Proveedor** | `firebase.auth.GoogleAuthProvider` |
| **MÃ©todo** | `signInWithPopup()` (Desktop) / `signInWithRedirect()` (Mobile) |
| **Persistencia** | `firebase.auth.Auth.Persistence.LOCAL` (sesiÃ³n sobrevive cierre de pestaÃ±a) |

### 2.2. SDK Requerido

Agregar al `index.html` junto a los SDKs existentes:

```html
<!-- Firebase Auth SDK -->
<script src="https://www.gstatic.com/firebasejs/12.8.0/firebase-auth-compat.js"></script>
```

### 2.3. ConfiguraciÃ³n en Firebase Console

1. En Firebase Console > Authentication > Sign-in method, habilitar **Google** como proveedor.
2. Configurar los dominios autorizados en Authentication > Settings > Authorized domains:
   - `localhost` (desarrollo local)
   - `baldora-89866.firebaseapp.com` (dominio por defecto de Firebase)
   - `baldora-89866.web.app` (dominio por defecto de Firebase Hosting)
   - **`baldora.org`** (dominio personalizado/oficial del sitio â€” **CRÃTICO para producciÃ³n**)
3. Verificar que el `authDomain` en `firebaseConfig` sea: `baldora.org` (dominio personalizado para que el popup de Google muestre "Ir a baldora.org").
4. **Registrar URI de redirecciÃ³n en Google Cloud Console:**
   - Ir a [Google Cloud Console > APIs & Services > Credentials](https://console.cloud.google.com/apis/credentials?project=baldora-89866)
   - Editar el OAuth 2.0 Client ("Web client (auto created by Google Service)")
   - En "Authorized redirect URIs" agregar: `https://baldora.org/__/auth/handler`
   - Guardar cambios (puede tardar 5 min a unas horas en propagarse)

> **âš ï¸ LECCIÃ“N APRENDIDA (Deploy 4-Mar-2026):**
> - El `authDomain` puede cambiarse a un **dominio personalizado** (ej: `baldora.org`) SIEMPRE QUE se registre `https://{dominio}/__/auth/handler` como redirect URI en Google Cloud Console > Credentials > OAuth Client.
> - Si se cambia `authDomain` SIN registrar la redirect URI, se obtiene `Error 400: redirect_uri_mismatch`.
> - Si el sitio usa un **dominio personalizado** (ej: `baldora.org`), ese dominio DEBE agregarse tambiÃ©n a la lista de dominios autorizados en Firebase Console > Authentication > Settings. Sin esto, `signInWithPopup()` falla con `auth/unauthorized-domain`.
> - URIs de redirecciÃ³n actualmente registradas:
>   1. `https://baldora-89866.firebaseapp.com/__/auth/handler` (por defecto)
>   2. `https://baldora.org/__/auth/handler` (dominio personalizado)

### 2.3.1. ConfiguraciÃ³n de Firebase Hosting para OAuth (firebase.json)

Firebase Hosting aplica headers de seguridad `Cross-Origin-Opener-Policy: same-origin` por defecto, los cuales **bloquean la comunicaciÃ³n** entre el popup de Google OAuth y la ventana principal de la app. Para que `signInWithPopup()` funcione en producciÃ³n, se debe agregar el siguiente header en `firebase.json`:

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

> **Nota:** Sin este header, el popup de Google se abre y se cierra inmediatamente sin completar la autenticaciÃ³n. El error en consola es: `Cross-Origin-Opener-Policy policy would block the window.closed call`.

### 2.3.2. Reglas de Seguridad de Realtime Database

Las reglas de Realtime Database deben incluir las rutas de `users` y `leaderboard` para que el sistema de usuario funcione. Sin estas reglas, Firebase rechaza la escritura con `permission_denied` al intentar crear el perfil del usuario post-autenticaciÃ³n.

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

| Propiedad | DescripciÃ³n | Uso en Baldora |
|-----------|-------------|----------------|
| `uid` | ID Ãºnico del usuario | Clave primaria en la base de datos |
| `displayName` | Nombre completo de Google | Mostrar en UI y rankings |
| `email` | Correo electrÃ³nico | IdentificaciÃ³n secundaria |
| `photoURL` | URL de la foto de perfil | Avatar en el header y rankings |

### 2.5. Flujo de AutenticaciÃ³n (UX)

```
1. Usuario abre Baldora
2. La pÃ¡gina se carga con el flujo normal
3. En la vista de configuraciÃ³n ve el label "Tu nickname o Inicia sesiÃ³n"
   y debajo del campo nickname un botÃ³n "Iniciar sesiÃ³n con Google"
4. TambiÃ©n hay un botÃ³n de Google en la esquina superior derecha (header)
5. Si decide loguearse â†’ Clic en cualquier botÃ³n â†’ signInWithPopup() â†’ AutorizaciÃ³n Google
6. Retorno â†’ onAuthStateChanged() detecta usuario
7. El botÃ³n del header cambia: avatar + nombre + dropdown
8. El campo nickname DESAPARECE (incluido el botÃ³n de sign-in dentro del grupo)
9. Todos los registros quedan asociados al nombre de Google
10. Si NO se loguea â†’ Todo funciona como antes (campo nickname + botÃ³n sign-in visibles)
```

> **Importante:** El login con Google NO es un paso obligatorio ni un prerequisito para jugar. El botÃ³n de sign-in en la vista config se oculta automÃ¡ticamente al iniciar sesiÃ³n (junto con el `#nickname-field-group`).

#### Comportamiento del Campo Nickname segÃºn Estado de Auth

| Estado | Campo Nickname | BotÃ³n Sign-In Config | Nombre en Registros |
|--------|---------------|----------------------|---------------------|
| **Sin login** | Visible y editable | Visible bajo el input | El que el usuario escriba |
| **Logueado con Google** | Oculto | Oculto (mismo grupo) | `user.displayName` de Google |

### 2.6. Componente UI: Botones de Google

El sistema tiene **dos puntos de acceso al login** para maximizar la visibilidad y accesibilidad:

#### 2.6.1. BotÃ³n en Header Global (todas las vistas)
El botÃ³n de autenticaciÃ³n con Google vive en la **esquina superior derecha de la pÃ¡gina**, como un componente fijo global, visible en todas las vistas. Se ubica junto al botÃ³n de audio existente.

#### 2.6.2. BotÃ³n en Vista de ConfiguraciÃ³n (solo primera vista)
Debajo del campo de nickname (dentro de `#nickname-field-group`) se muestra un botÃ³n secundario "Iniciar sesiÃ³n con Google". Este botÃ³n:
- Solo es visible en la primera vista (config) cuando el usuario **no** estÃ¡ logueado
- Se oculta automÃ¡ticamente cuando el usuario inicia sesiÃ³n (junto con el grupo de nickname)
- Invoca el mismo flujo de autenticaciÃ³n que el botÃ³n del header (`signInWithPopup`)
- El label del campo nickname dice "Tu nickname o Inicia sesiÃ³n" para guiar al usuario

#### Estado: No Logueado

| Elemento | EspecificaciÃ³n |
|----------|----------------|
| **PosiciÃ³n** | `position: fixed; top: 20px; right: 80px;` (a la izquierda del botÃ³n de audio) |
| **z-index** | 1500 (mismo nivel que el botÃ³n de audio) |
| **Estilo** | BotÃ³n blanco con borde `var(--clr-sand-300)`, border-radius redondeado |
| **Contenido** | Logo de Google (SVG inline 18px) + texto "Iniciar sesiÃ³n" |
| **Hover** | Sombra sutil, misma transiciÃ³n que botones existentes |
| **Visible en** | Todas las vistas (config, juego, dashboard) |

#### Estado: Logueado

| Elemento | EspecificaciÃ³n |
|----------|----------------|
| **PosiciÃ³n** | Misma posiciÃ³n fija superior derecha |
| **Contenido** | Avatar circular (28px, foto de Google) + nombre corto (primer nombre) |
| **Clic** | Despliega mini dropdown con: "Mi Perfil", "Cerrar sesiÃ³n" |
| **Dropdown** | Panel pequeÃ±o debajo del avatar, mismo estilo panel-base |

#### AdaptaciÃ³n Responsive

| Breakpoint | Comportamiento |
|------------|---------------|
| `> 600px` | Logo Google + "Iniciar sesiÃ³n" (texto visible) |
| `< 600px` | Solo logo Google (sin texto) para ahorrar espacio |
| Logueado `> 600px` | Avatar + primer nombre |
| Logueado `< 600px` | Solo avatar circular |

#### Coexistencia con BotÃ³n de Audio

```
â”Œâ”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”
â”‚                                    [Google btn] [Audio btn] â”‚
â”‚                                    right: 80px  right: 20px â”‚
â””â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”˜
```

El botÃ³n de audio existente (`.audio-toggle-btn`) NO se modifica. El botÃ³n de Google se posiciona a su izquierda con suficiente separaciÃ³n.

### 2.7. GestiÃ³n de Estado de SesiÃ³n

```javascript
firebase.auth().onAuthStateChanged((user) => {
    if (user) {
        // Usuario logueado
        // â†’ Actualizar botÃ³n header (mostrar avatar + nombre)
        // â†’ Cargar perfil desde DB
        // â†’ OCULTAR el campo de nickname en la vista de configuraciÃ³n
        // â†’ Usar user.displayName en todos los registros de partidas
        // â†’ Habilitar guardado en nube
        // â†’ Habilitar acceso a "Mi Perfil"
    } else {
        // Usuario no logueado
        // â†’ Mostrar botÃ³n "Iniciar sesiÃ³n con Google"
        // â†’ MOSTRAR el campo de nickname (comportamiento actual)
        // â†’ No guardar en nube
        // â†’ Ocultar opciÃ³n "Mi Perfil"
    }
});
```

> **Nota:** El `onAuthStateChanged` solo agrega comportamiento. El campo nickname se oculta/muestra mediante una clase CSS (ej: `.nickname-wrapper.hidden { display: none; }`), sin modificar el input ni su lÃ³gica interna.

---

## 3. Persistencia de Datos (Firebase Realtime Database)

### 3.1. Estructura de Base de Datos

Se aprovecha la instancia existente de Firebase Realtime Database (ya usada por `VisitorCounter`).

```
baldora-89866-default-rtdb/
â”œâ”€â”€ visits/                     â† Existente (visitor counter)
â”‚   â””â”€â”€ count: 12345
â”œâ”€â”€ users/                      â† NUEVO
â”‚   â””â”€â”€ {uid}/
â”‚       â”œâ”€â”€ profile/
â”‚       â”‚   â”œâ”€â”€ displayName: "Juan GarcÃ­a"
â”‚       â”‚   â”œâ”€â”€ email: "juan@gmail.com"
â”‚       â”‚   â”œâ”€â”€ photoURL: "https://..."
â”‚       â”‚   â”œâ”€â”€ createdAt: "2026-03-04T..."
â”‚       â”‚   â””â”€â”€ lastLogin: "2026-03-04T..."
â”‚       â”œâ”€â”€ games/
â”‚       â”‚   â””â”€â”€ {gameId}/           â† Auto-generated push key
â”‚       â”‚       â”œâ”€â”€ timestamp: "2026-03-04T10:30:00Z"
â”‚       â”‚       â”œâ”€â”€ game_mode: "TIMER" | "FREE" | "ADAPTIVE"
â”‚       â”‚       â”œâ”€â”€ duration_ms: 180000
â”‚       â”‚       â”œâ”€â”€ total_operations: 45
â”‚       â”‚       â”œâ”€â”€ correct_operations: 38
â”‚       â”‚       â”œâ”€â”€ accuracy: 84.4
â”‚       â”‚       â”œâ”€â”€ avg_response_time: 2340
â”‚       â”‚       â”œâ”€â”€ game_score: 72.3         â† Puntaje individual vs. comunidad
â”‚       â”‚       â”œâ”€â”€ tables_used: { rows: [1,2,3...], cols: [1,2,3...] }
â”‚       â”‚       â”œâ”€â”€ ai_analysis/             â† null si no se ha analizado
â”‚       â”‚       â”‚   â”œâ”€â”€ generated_at: "2026-03-04T11:00:00Z"
â”‚       â”‚       â”‚   â”œâ”€â”€ resumen_general: "..."
â”‚       â”‚       â”‚   â”œâ”€â”€ patron_errores: "..."
â”‚       â”‚       â”‚   â”œâ”€â”€ plan_accion: "..."
â”‚       â”‚       â”‚   â””â”€â”€ sugerencia_entrenamiento: "..."
â”‚       â”‚       â””â”€â”€ attempts/
â”‚       â”‚           â””â”€â”€ {index}/
â”‚       â”‚               â”œâ”€â”€ factor_a: 7
â”‚       â”‚               â”œâ”€â”€ factor_b: 8
â”‚       â”‚               â”œâ”€â”€ user_input: 56
â”‚       â”‚               â”œâ”€â”€ correct_result: 56
â”‚       â”‚               â”œâ”€â”€ is_correct: true
â”‚       â”‚               â””â”€â”€ response_time: 1250
â”‚       â””â”€â”€ stats/                  â† Agregados calculados
â”‚           â”œâ”€â”€ total_games: 15
â”‚           â”œâ”€â”€ total_operations: 890
â”‚           â”œâ”€â”€ total_correct: 756
â”‚           â”œâ”€â”€ global_accuracy: 84.9
â”‚           â”œâ”€â”€ avg_response_time: 2100
â”‚           â”œâ”€â”€ best_accuracy: 97.2
â”‚           â”œâ”€â”€ best_avg_time: 1450
â”‚           â””â”€â”€ community_score: 0    â† Ver secciÃ³n 6
â””â”€â”€ leaderboard/                â† NUEVO (datos pÃºblicos para ranking)
    â”œâ”€â”€ community_benchmarks/   â† Valores extremos de la comunidad
    â”‚   â”œâ”€â”€ max_total_correct: 3500
    â”‚   â”œâ”€â”€ min_response_time: 620
    â”‚   â”œâ”€â”€ max_response_time: 9800
    â”‚   â”œâ”€â”€ min_accuracy: 42.0
    â”‚   â””â”€â”€ max_accuracy: 99.1
    â””â”€â”€ players/
        â””â”€â”€ {uid}/
            â”œâ”€â”€ displayName: "Juan GarcÃ­a"
            â”œâ”€â”€ photoURL: "https://..."
            â”œâ”€â”€ community_score: 78.4
            â”œâ”€â”€ score_correctas: 34.3
            â”œâ”€â”€ score_tiempo: 86.6
            â”œâ”€â”€ score_accuracy: 87.6
            â”œâ”€â”€ total_correct: 1200
            â”œâ”€â”€ avg_response_time: 1800
            â”œâ”€â”€ global_accuracy: 84.9
            â”œâ”€â”€ total_games: 15
            â””â”€â”€ last_played: "2026-03-04T..."
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

### 3.3. Guardado AutomÃ¡tico de Partida

Al finalizar cada partida (`endGame()`), si el usuario estÃ¡ autenticado:

1. Se genera un `gameId` con `push()`.
2. Se guardan los datos de la partida en `users/{uid}/games/{gameId}`.
3. Se recalculan y actualizan `users/{uid}/stats/`.
4. Se actualiza `leaderboard/{uid}/` con los nuevos agregados.

### 3.4. IntegraciÃ³n con DataManager

El `DataManager` existente se extiende (no se reemplaza) con capacidad de nube:

| MÃ©todo Nuevo | DescripciÃ³n |
|-------------|-------------|
| `saveGameToCloud(uid, gameData)` | Guarda partida completa en Realtime DB |
| `loadGamesFromCloud(uid, filters)` | Carga partidas con filtros opcionales |
| `updateUserStats(uid)` | Recalcula agregados del usuario |
| `updateLeaderboard(uid, stats)` | Actualiza posiciÃ³n en el leaderboard |

---

## 4. VisualizaciÃ³n de Datos del Usuario (Dashboard Personal)

### 4.1. Nueva Vista: Perfil del Jugador

Se agrega una cuarta vista a la SPA: `#profile-view`.

| Vista | ID | Acceso |
|-------|----|--------|
| ConfiguraciÃ³n | `#config-view` | Siempre |
| Juego | `#game-view` | Durante partida |
| Dashboard (sesiÃ³n) | `#dashboard-view` | Post-partida |
| **Perfil (historial)** | `#profile-view` | **Desde menÃº de usuario** |

### 4.2. Filtros Disponibles

El usuario puede filtrar su historial de partidas con los siguientes controles:

| Filtro | Tipo de Control | DescripciÃ³n |
|--------|----------------|-------------|
| **Fecha** | Date Range Picker (desde - hasta) | Filtra partidas por rango de fechas |
| **Modo de Juego** | Select / Chips | TIMER, FREE, ADAPTIVE o Todos |
| **Preguntas (cantidad)** | Range Slider (min - max) | Filtra por total de operaciones en la partida |
| **Operaciones Correctas** | Range Slider (min - max) | Filtra por cantidad de aciertos |
| **Tiempo Promedio** | Range Slider (min - max ms) | Filtra por velocidad promedio de respuesta |
| **Asertividad** | Range Slider (0% - 100%) | Filtra por porcentaje de aciertos |

### 4.3. Visualizaciones del Perfil

#### 4.3.1. Tarjetas de Resumen (Summary Cards)

Fila horizontal con mÃ©tricas agregadas (respetan los filtros activos):

| Tarjeta | Dato | Icono |
|---------|------|-------|
| Total Partidas | Cantidad de partidas jugadas | Controlador de juego |
| Total Operaciones | Suma de todas las operaciones | Calculadora |
| Asertividad Global | % promedio de aciertos | Diana/Target |
| Velocidad Promedio | Tiempo medio de respuesta (ms) | Reloj |
| Mejor Partida | Mayor % de accuracy en una partida | Trofeo |

#### 4.3.2. GrÃ¡ficas de Progreso HistÃ³rico

| GrÃ¡fica | Tipo | DescripciÃ³n |
|---------|------|-------------|
| **Progreso de Asertividad** | Line Chart | Accuracy (%) por partida a lo largo del tiempo |
| **Velocidad de Respuesta** | Line Chart | Tiempo promedio (ms) por partida a lo largo del tiempo |
| **DistribuciÃ³n por Modo** | Doughnut Chart | ProporciÃ³n de partidas por modo (Timer/Free/Adaptive) |
| **Tablas MÃ¡s Practicadas** | Horizontal Bar Chart | Frecuencia de prÃ¡ctica por tabla (1-15) |
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
| Acciones | BotÃ³n "Ver detalle" â†’ expande intentos individuales |

---

## 5. AnÃ¡lisis de IA (HistÃ³rico)

### 5.1. AnÃ¡lisis por SesiÃ³n (Existente)

El anÃ¡lisis actual con Gemini (GeminiService) se mantiene sin cambios. Analiza la sesiÃ³n que acaba de terminar. Este anÃ¡lisis se guarda en la base de datos asociado a esa partida si el usuario estÃ¡ autenticado.

### 5.2. Persistencia y VisualizaciÃ³n de AnÃ¡lisis en la Tabla de Historial

El resultado del anÃ¡lisis IA de cada partida se guarda en la base de datos bajo `users/{uid}/games/{gameId}/ai_analysis/`. En la tabla de historial de partidas:

- Si una partida **tiene** anÃ¡lisis guardado: se muestra un icono indicador (ej: ðŸ§ ) y el usuario puede expandirlo para leerlo.
- Si una partida **no tiene** anÃ¡lisis: se muestra un botÃ³n "Analizar" con el **mismo diseÃ±o del botÃ³n de anÃ¡lisis existente en el dashboard de sesiÃ³n**. Al hacer clic, genera el anÃ¡lisis de esa partida especÃ­fica y lo guarda en la DB.

| Elemento | EspecificaciÃ³n |
|----------|----------------|
| **Indicador con anÃ¡lisis** | Icono ðŸ§  + texto "Ver anÃ¡lisis" (expandible inline) |
| **BotÃ³n sin anÃ¡lisis** | Mismo estilo que el botÃ³n actual de anÃ¡lisis en el dashboard de sesiÃ³n |
| **Texto del botÃ³n** | "Analizar partida" |
| **Datos enviados** | Los intentos individuales de esa partida especÃ­fica (mismo formato CSV actual) |
| **Al completarse** | El anÃ¡lisis se guarda en DB y el botÃ³n se reemplaza por el indicador ðŸ§  |

### 5.3. AnÃ¡lisis HistÃ³rico Global (Nuevo)

Desde el perfil del jugador, se agrega un botÃ³n "Analizar mi progreso" separado de la tabla, que envÃ­a el historial completo (o filtrado) a Gemini para un diagnÃ³stico longitudinal que considera mÃºltiples sesiones.

| Aspecto | EspecificaciÃ³n |
|---------|----------------|
| **Trigger** | BotÃ³n en la secciÃ³n superior de `#profile-view`, fuera de la tabla |
| **Estilo** | Mismo diseÃ±o que el botÃ³n de anÃ¡lisis del dashboard de sesiÃ³n |
| **Datos enviados** | Resumen agregado de las partidas filtradas (no el CSV crudo) |
| **Modelo** | `gemini-2.5-flash-lite` (mismo que sesiÃ³n) |
| **Contexto adicional** | Incluye tendencias: mejorando / estancado / empeorando |
| **Resultado** | Se muestra debajo del botÃ³n, en las mismas tarjetas de resultado del dashboard |

### 5.4. Prompt para AnÃ¡lisis HistÃ³rico Global

```
Role: System
ActÃºa como un entrenador experto en aprendizaje de multiplicaciones. Analiza el PROGRESO HISTÃ“RICO de un estudiante a lo largo de mÃºltiples sesiones. Tu anÃ¡lisis debe ser longitudinal, no de una sesiÃ³n aislada.

Role: User
Datos del estudiante:
- Nombre: {displayName}
- Total de partidas: {total_games}
- PerÃ­odo: {fecha_primera_partida} a {fecha_Ãºltima_partida}
- Asertividad promedio: {global_accuracy}%
- Tendencia de accuracy: {trend_accuracy} (mejorando/estancado/empeorando)
- Velocidad promedio: {avg_time}ms
- Tendencia de velocidad: {trend_speed}
- Tablas mÃ¡s dÃ©biles: {weak_tables}
- Operaciones con mÃ¡s errores acumulados: {top_errors}
- Mejor partida: {best_game_accuracy}% accuracy
- Peor partida: {worst_game_accuracy}% accuracy

Genera un diagnÃ³stico de evoluciÃ³n que incluya:
1. EvaluaciÃ³n del progreso general
2. Patrones de mejora o estancamiento
3. Recomendaciones personalizadas para las prÃ³ximas sesiones
4. Reconocimiento de logros alcanzados
```

---

## 6. Sistema de Puntaje y PosiciÃ³n en la Comunidad

### 6.1. Principio de NormalizaciÃ³n por Comunidad

Las tres variables del puntaje se normalizan **relativamente** a los valores extremos de la comunidad, no en escalas fijas. Esto garantiza que el sistema sea justo y dinÃ¡mico: conforme la comunidad mejora, los puntajes se recalibran.

Los valores de referencia de la comunidad se almacenan en:
```
leaderboard/community_benchmarks/
â”œâ”€â”€ max_total_correct: 3500      â† Total de correctas del jugador con mÃ¡s aciertos
â”œâ”€â”€ min_response_time: 620       â† Tiempo (ms) de la operaciÃ³n correcta mÃ¡s rÃ¡pida
â”œâ”€â”€ max_response_time: 9800      â† Tiempo (ms) de la operaciÃ³n correcta mÃ¡s lenta
â”œâ”€â”€ min_accuracy: 42.0           â† Accuracy mÃ¡s baja de la comunidad
â””â”€â”€ max_accuracy: 99.1           â† Accuracy mÃ¡s alta de la comunidad
```

Estos benchmarks se recalculan y actualizan cada vez que un jugador guarda una partida.

---

### 6.2. Variables, NormalizaciÃ³n y Pesos

#### Variable 1: Operaciones Correctas (Volumen)

| Aspecto | DescripciÃ³n |
|---------|-------------|
| **Dato de entrada** | `total_correct` del jugador (suma de todas sus partidas) |
| **Referencia** | `community_benchmarks.max_total_correct` = total del jugador con mÃ¡s aciertos en la comunidad |
| **NormalizaciÃ³n** | `Score_C = (total_correct / max_total_correct) * 100` |
| **Rango de salida** | 0 a 100 |
| **LÃ³gica** | El jugador con mÃ¡s operaciones correctas obtiene 100. El resto se mide proporcionalmente respecto a ese mÃ¡ximo. |
| **Peso** | **W1** (por definir en prÃ³xima iteraciÃ³n) |

#### Variable 2: Tiempo Promedio de Respuesta (Velocidad)

| Aspecto | DescripciÃ³n |
|---------|-------------|
| **Dato de entrada** | `avg_response_time` del jugador (promedio de todas sus operaciones correctas) |
| **Referencia min** | `community_benchmarks.min_response_time` = operaciÃ³n correcta mÃ¡s rÃ¡pida de toda la comunidad |
| **Referencia max** | `community_benchmarks.max_response_time` = operaciÃ³n correcta mÃ¡s lenta de toda la comunidad |
| **NormalizaciÃ³n** | `Score_T = (max_time - avg_time) / (max_time - min_time) * 100` |
| **Rango de salida** | 0 a 100 |
| **LÃ³gica** | El jugador con el tiempo promedio igual al mÃ­nimo de la comunidad obtiene 100. El que tiene el tiempo promedio igual al mÃ¡ximo obtiene 0. La posiciÃ³n dentro del rango define el puntaje. |
| **Peso** | **W2** (por definir en prÃ³xima iteraciÃ³n) |

> **Nota:** Se usa el tiempo promedio del jugador (sobre todas sus operaciones correctas) comparado contra los extremos absolutos de la comunidad (operaciÃ³n individual mÃ¡s rÃ¡pida y mÃ¡s lenta). Esto premia la consistencia en la velocidad.

#### Variable 3: Asertividad (Accuracy)

| Aspecto | DescripciÃ³n |
|---------|-------------|
| **Dato de entrada** | `global_accuracy` del jugador (promedio de accuracy de todas sus partidas) |
| **Referencia min** | `community_benchmarks.min_accuracy` = accuracy mÃ¡s baja de la comunidad |
| **Referencia max** | `community_benchmarks.max_accuracy` = accuracy mÃ¡s alta de la comunidad |
| **NormalizaciÃ³n** | `Score_A = (player_accuracy - min_accuracy) / (max_accuracy - min_accuracy) * 100` |
| **Rango de salida** | 0 a 100 |
| **LÃ³gica** | El jugador con la accuracy mÃ¡s alta de la comunidad obtiene 100. El de la mÃ¡s baja obtiene 0. La posiciÃ³n dentro del rango define el puntaje. |
| **Peso** | **W3** (por definir en prÃ³xima iteraciÃ³n) |

---

### 6.3. FÃ³rmula del Puntaje Compuesto

```
Community_Score = (W1 * Score_C) + (W2 * Score_T) + (W3 * Score_A)

Donde:
  Score_C = (total_correct / max_total_correct) * 100
  Score_T = (max_response_time - avg_response_time) / (max_response_time - min_response_time) * 100
  Score_A = (player_accuracy - min_accuracy) / (max_accuracy - min_accuracy) * 100

  W1 = W2 = W3 = 1/3  â‰ˆ 0.3333  (distribuciÃ³n equitativa entre las tres dimensiones)
```

> **DecisiÃ³n de pesos (IteraciÃ³n 5):** Se eligieron pesos iguales W1=W2=W3=1/3 para que ninguna dimensiÃ³n (volumen, velocidad, asertividad) tenga ventaja sobre las demÃ¡s. El sistema premia a jugadores equilibrados sobre los que destacan solo en una variable.

#### Ejemplo de CÃ¡lculo (con benchmarks hipotÃ©ticos)

Benchmarks de comunidad: `max_correct=3500`, `min_time=620ms`, `max_time=9800ms`, `min_accuracy=42%`, `max_accuracy=99.1%`

| Jugador | Correctas | Tiempo Prom. | Accuracy | Score_C | Score_T | Score_A |
|---------|-----------|-------------|----------|---------|---------|---------|
| Ana | 1200 | 1800ms | 92% | (1200/3500)*100 = **34.3** | (9800-1800)/(9800-620)*100 = **86.6** | (92-42)/(99.1-42)*100 = **87.6** |
| Pedro | 3500 | 2500ms | 78% | (3500/3500)*100 = **100** | (9800-2500)/(9800-620)*100 = **79.5** | (78-42)/(99.1-42)*100 = **63.0** |
| Luis | 400 | 890ms | 99.1% | (400/3500)*100 = **11.4** | (9800-890)/(9800-620)*100 = **97.0** | (99.1-42)/(99.1-42)*100 = **100** |

---

### 6.4. Puntaje por Partida vs. Comunidad

Cada partida individual tambiÃ©n puede obtener su propio puntaje relativo, comparado contra el **promedio de la comunidad** en las mismas 3 variables. Esto permite mostrar en la tabla de historial si esa partida estuvo por encima o por debajo del nivel general.

| Elemento | DescripciÃ³n |
|----------|-------------|
| **Score de la partida** | Calculado con los datos de esa sesiÃ³n individual vs. benchmarks de comunidad |
| **ComparaciÃ³n** | Indicador visual: por encima / en la media / por debajo del promedio comunitario |
| **Visible en** | Columna "Puntaje" en la tabla de historial de partidas |

La **posiciÃ³n en el leaderboard** se determina Ãºnicamente por el puntaje compuesto global del jugador (acumulado de todas sus partidas), no por el puntaje de una partida individual.

---

### 6.5. Sistema de Ligas Comunitarias (IteraciÃ³n 5)

El posicionamiento en la comunidad se expresa como una **liga** dentro de 100 grupos percentÃ­licos dinÃ¡micos, no como un nÃºmero de posiciÃ³n fijo.

#### FÃ³rmula de Tier (Grupo PercentÃ­lico)

```
Tier = floor((rank - 1) / total_jugadores Ã— 100) + 1

Donde:
  rank    = posiciÃ³n del jugador ordenando todos los jugadores por Community_Score desc (1 = mejor)
  total   = nÃºmero total de jugadores con al menos 1 prÃ¡ctica guardada
  Tier    = grupo del 1 al 100 (1 = Ã©lite, 100 = base)
```

**Por quÃ© `floor((rank-1)/totalÃ—100)+1` y no `ceil(rank/totalÃ—100)`:**
La segunda fÃ³rmula produce Tier=100 (MADERA) para el Ãºnico jugador o el mejor de todos (`rank=1, total=1` â†’ `ceil(100)=100`). La fÃ³rmula correcta garantiza que el jugador con rank=1 siempre obtiene Tier=1 independientemente del total.

**Ejemplo:** 200 jugadores, el jugador ocupa la posiciÃ³n 31 por Community_Score:
`Tier = floor(30/200 Ã— 100) + 1 = floor(15) + 1 = 16` â†’ Liga **Oro**

**Caso especial (jugador Ãºnico):**
`Tier = floor(0/1 Ã— 100) + 1 = 0 + 1 = 1` â†’ Liga **Diamante** âœ“

#### Ligas y Rangos de Tier

| Liga | Tier | % de la Comunidad | Color |
|------|------|-------------------|-------|
| **DIAMANTE** | 1 â€“ 5 | Top 5% | Cyan (#00c8ff) |
| **PLATINO** | 6 â€“ 15 | Siguiente 10% | Plateado (#b8d0e0) |
| **ORO** | 16 â€“ 30 | Siguiente 15% | Dorado (#f5a623) |
| **PLATA** | 31 â€“ 50 | Siguiente 20% | Plata (#8ea7b8) |
| **BRONCE** | 51 â€“ 70 | Siguiente 20% | Bronce (#cd7f32) |
| **MADERA** | 71 â€“ 100 | 30% restante | Tierra (#8b6042) |

#### Reglas del Sistema de Ligas

- **MÃ­nimo para entrar:** 1 prÃ¡ctica guardada.
- **RecÃ¡lculo:** Cada vez que cualquier jugador guarda una prÃ¡ctica, se recalculan los tiers de **todos** los jugadores activos.
- **Dinamismo:** Si otros jugadores mejoran, tu tier puede cambiar aunque tÃº no hayas jugado.
- **Empates:** Jugadores con el mismo Community_Score comparten rank. Si N jugadores empatan en rank R, todos obtienen `Tier = ceil(R / total Ã— 100)`.

#### VisualizaciÃ³n en el Perfil del Jugador

El badge de comunidad se muestra en el header del perfil, **a la derecha de los datos del usuario**, alineado visualmente sobre los contenedores de "Tiempo promedio" y "Mejor precisiÃ³n".

| Elemento | DescripciÃ³n |
|----------|-------------|
| **PosiciÃ³n relativa** | Header del perfil, columna derecha (grid `1fr 1fr`) |
| **Contenido principal** | Nombre de la liga en grande (ej. `ORO`) con color de liga |
| **SubtÃ­tulo** | NÃºmero de tier (ej. `Tier 22`) |
| **Label** | "TU POSICIÃ“N EN LA COMUNIDAD" en texto pequeÃ±o |
| **Fondo** | `var(--clr-surface-high)` â€” consistente con el resto de la pÃ¡gina |
| **Color** | Cada liga tiene un color de acento distinto aplicado al nombre |

#### Datos en Firebase

Tras cada recÃ¡lculo, se escriben en `leaderboard/players/{uid}`:
```
leaderboard/players/{uid}/
â”œâ”€â”€ tier: 22              â† grupo percentÃ­lico (1-100)
â””â”€â”€ league: "ORO"         â† nombre de la liga
```

---

## 7. Flujo Completo del Usuario

### 7.1. Usuario Sin Login (Experiencia por Defecto - SIN CAMBIOS)

```
â”Œâ”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”
â”‚            EXPERIENCIA POR DEFECTO                  â”‚
â”‚         (IdÃ©ntica a la actual, sin cambios)         â”‚
â”œâ”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”¤
â”‚ 1. Abre Baldora                                     â”‚
â”‚ 2. Campo nickname visible y editable (como siempre) â”‚
â”‚ 3. Configura modo, tablas, tiempo                   â”‚
â”‚ 4. Juega la partida                                 â”‚
â”‚ 5. Ve dashboard de sesiÃ³n + anÃ¡lisis IA             â”‚
â”‚ 6. Descarga CSV/PDF si desea                        â”‚
â”‚ 7. NO tiene: historial en nube, perfil, ranking     â”‚
â”‚ 8. En header ve botÃ³n "Iniciar sesiÃ³n con Google"   â”‚
â”‚ 9. Puede loguearse en cualquier momento             â”‚
â””â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”˜
```

### 7.2. Usuario con Google (Primera Vez)

```
â”Œâ”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”
â”‚              PRIMER LOGIN CON GOOGLE                â”‚
â”œâ”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”¤
â”‚ 1. Abre Baldora (todo carga normal)                 â”‚
â”‚ 2. Clic en botÃ³n Google del header (esquina sup.)   â”‚
â”‚ 3. Popup Google â†’ Autoriza                          â”‚
â”‚ 4. onAuthStateChanged â†’ Crea profile en DB          â”‚
â”‚ 5. Header cambia: avatar + nombre del header        â”‚
â”‚ 6. Campo nickname DESAPARECE de la configuraciÃ³n    â”‚
â”‚ 7. Todos los registros usan el nombre de Google     â”‚
â”‚ 8. Juega partida (flujo de juego sin cambios)       â”‚
â”‚ 9. endGame() â†’ Guarda en nube automÃ¡ticamente       â”‚
â”‚ 10. Ve dashboard de sesiÃ³n (igual que siempre)      â”‚
â”‚ 11. AnÃ¡lisis IA de esa sesiÃ³n se guarda en la DB    â”‚
â”‚ 12. Puede acceder a "Mi Perfil" desde el header     â”‚
â””â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”˜
```

### 7.3. Usuario con Google (Visitas Posteriores)

```
â”Œâ”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”
â”‚                VISITAS POSTERIORES                  â”‚
â”œâ”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”¤
â”‚ 1. Abre Baldora                                     â”‚
â”‚ 2. onAuthStateChanged â†’ Detecta sesiÃ³n activa       â”‚
â”‚ 3. Header muestra avatar + nombre automÃ¡ticamente   â”‚
â”‚ 4. Nickname sugerido con displayName                â”‚
â”‚ 5. Juega normalmente, partidas se acumulan          â”‚
â”‚ 6. Puntaje y ranking se actualizan                  â”‚
â”‚ 7. Accede a "Mi Perfil" cuando quiera               â”‚
â””â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”˜
```

---

## 8. Consideraciones TÃ©cnicas

### 8.1. Principio de No Interferencia

> **REGLA CRÃTICA:** Ninguna lÃ­nea de cÃ³digo de este mÃ³dulo debe modificar, eliminar o alterar el comportamiento de funciones, estilos o flujos ya implementados. Toda la implementaciÃ³n debe ser puramente aditiva.

#### QuÃ© NO se debe hacer:
- NO modificar el flujo de `startGame()`, `endGame()`, `submitAnswer()` ni ninguna funciÃ³n existente en `app.js`
- NO alterar estilos CSS existentes ni cambiar posiciones de elementos actuales
- NO modificar `DataManager` existente; los mÃ©todos cloud se agregan como extensiÃ³n separada
- NO condicionar funcionalidades actuales al estado de autenticaciÃ³n
- NO cambiar la posiciÃ³n ni comportamiento del botÃ³n de audio
- NO alterar el sistema de onboarding, exportaciÃ³n, ni vistas existentes

#### QuÃ© SÃ se puede hacer:
- Agregar nuevos archivos JS, nuevos bloques HTML y nuevas reglas CSS
- Agregar llamadas adicionales despuÃ©s de funciones existentes (ej: hook post-endGame)
- Agregar nuevas vistas que coexistan con las existentes
- Leer datos de `DataManager` para guardar en nube (sin modificar el flujo de DataManager)

### 8.2. Impacto en CÃ³digo Existente

| Archivo | Cambio | Tipo | Detalle |
|---------|--------|------|---------|
| `index.html` | Agregar SDK Auth, botÃ³n Google en header, vista profile | Aditivo | Se agregan scripts y HTML nuevos sin tocar los existentes |
| `js/app.js` | Agregar hook post-endGame para guardado en nube | MÃ­nimo | Solo 1 llamada condicional al final de `endGame()`: `if (AuthManager.isLoggedIn()) CloudSync.saveGame(...)` |
| `js/data.js` | **Sin cambios** | Ninguno | Se lee `DataManager.sessionData` desde el mÃ³dulo cloud, sin modificar `data.js` |
| `css/styles.css` | Estilos para botÃ³n Google header, perfil, filtros, leaderboard | Aditivo | Nuevas clases que no colisionan con las existentes |
| `js/auth.js` | **Nuevo archivo** - GestiÃ³n de autenticaciÃ³n y botÃ³n header | Nuevo | - |
| `js/cloudSync.js` | **Nuevo archivo** - SincronizaciÃ³n de datos con Firebase | Nuevo | - |
| `js/userProfile.js` | **Nuevo archivo** - Vista de perfil e historial | Nuevo | - |
| `js/leaderboard.js` | **Nuevo archivo** - Sistema de ranking | Nuevo | - |

### 8.3. Compatibilidad con Flujo Existente (Modo Sin Login)

Todo el sistema es aditivo. El flujo sin login debe seguir funcionando **exactamente** como funciona hoy. La autenticaciÃ³n es opcional y no bloquea ninguna funcionalidad existente. Un usuario que nunca toque el botÃ³n de Google jamÃ¡s notarÃ¡ diferencia alguna en su experiencia.

### 8.3. Privacidad y GDPR

| Aspecto | ImplementaciÃ³n |
|---------|----------------|
| Datos almacenados | Solo datos de juego + perfil pÃºblico de Google |
| EliminaciÃ³n de cuenta | BotÃ³n "Eliminar mi cuenta" que borra todos los datos del usuario |
| Datos pÃºblicos | Solo displayName, photoURL y puntaje en el leaderboard |
| Datos privados | Historial de partidas, intentos individuales, anÃ¡lisis IA |

---

## 9. Checklist de ImplementaciÃ³n

### Fase 1: AutenticaciÃ³n
- [ ] Agregar Firebase Auth SDK al `index.html`
- [ ] Habilitar proveedor Google en Firebase Console
- [ ] Crear `js/auth.js` con lÃ³gica de login/logout
- [ ] Agregar botÃ³n Google en header fijo (esquina superior derecha, junto al botÃ³n de audio)
- [ ] Implementar `onAuthStateChanged` para gestiÃ³n de estado del header
- [ ] Mostrar avatar + nombre y dropdown al estar logueado
- [ ] Verificar que botÃ³n de audio NO se mueva ni cambie de comportamiento
- [ ] Verificar que TODO el flujo existente funcione igual sin login

### Fase 2: Persistencia de Datos
- [ ] Definir estructura de datos en Realtime Database
- [ ] Configurar reglas de seguridad
- [ ] Crear `js/cloudSync.js` (mÃ³dulo separado, NO modificar `data.js`)
- [ ] Agregar hook mÃ­nimo en `endGame()` para guardado condicional en nube
- [ ] Calcular y actualizar stats agregados
- [ ] Actualizar leaderboard al guardar partida

### Fase 3: Perfil y VisualizaciÃ³n
- [ ] Crear vista `#profile-view` con HTML/CSS
- [ ] Implementar sistema de filtros
- [ ] Crear grÃ¡ficas de progreso histÃ³rico (Chart.js)
- [ ] Implementar tabla de historial con paginaciÃ³n
- [ ] Agregar columna de anÃ¡lisis IA en tabla (indicador ðŸ§  o botÃ³n "Analizar partida")
- [ ] Implementar guardado de anÃ¡lisis IA por partida en DB
- [ ] Crear tarjetas de resumen con mÃ©tricas agregadas

### Fase 4: AnÃ¡lisis IA HistÃ³rico
- [ ] Guardar automÃ¡ticamente anÃ¡lisis de sesiÃ³n en DB al generarse (si usuario logueado)
- [ ] Mostrar anÃ¡lisis guardados en tabla de historial (expandible)
- [ ] Crear botÃ³n "Analizar partida" con mismo diseÃ±o del botÃ³n existente
- [ ] Crear prompt para anÃ¡lisis longitudinal global
- [ ] Implementar cÃ¡lculo de tendencias (mejorando/estancado/empeorando)
- [ ] Conectar botÃ³n "Analizar mi progreso" con GeminiService
- [ ] Renderizar resultado global en el perfil

### Fase 5: Comunidad y Ranking
- [ ] Implementar cÃ¡lculo y guardado de benchmarks de comunidad en DB
- [ ] Actualizar benchmarks al guardar cada partida
- [ ] Implementar fÃ³rmula de Community Score normalizada por comunidad
- [ ] Calcular puntaje individual por partida (vs. comunidad)
- [ ] Crear vista de leaderboard (top 100)
- [ ] Mostrar posiciÃ³n personal y percentil
- [ ] Resaltar al jugador actual si estÃ¡ en top 100

---

## 10. Documentos Relacionados

| Documento | Relevancia |
|-----------|------------|
| `f1_vision.md` | Arquitectura base del proyecto |
| `f3_diseÃ±o.md` | Design System para UI consistente |
| `f8_AI.md` | IntegraciÃ³n con Firebase AI Logic / Gemini |
| `f9_SDK.md` | Referencia del SDK de Firebase AI |
| `f11_ANSWR.md` | Formato de respuesta de la API para anÃ¡lisis |

---

## 11. Registro de Incidencias de Deploy (Post-ImplementaciÃ³n)

> Esta secciÃ³n documenta problemas encontrados durante el despliegue a producciÃ³n y sus soluciones, para referencia en futuras implementaciones.

### 11.1. Incidencia: `auth/unauthorized-domain` en producciÃ³n

| Campo | Detalle |
|-------|--------|
| **Fecha** | 4 de Marzo, 2026 |
| **Entorno** | ProducciÃ³n (`baldora.org`) |
| **Error** | `FirebaseError: This domain is not authorized for OAuth operations for your Firebase project (auth/unauthorized-domain)` |
| **Causa** | El dominio personalizado `baldora.org` no estaba en la lista de dominios autorizados de Firebase Authentication |
| **SÃ­ntoma** | El popup de Google se abre pero la autenticaciÃ³n falla. Funciona en `localhost` pero no en producciÃ³n |
| **SoluciÃ³n** | Agregar `baldora.org` en Firebase Console > Authentication > Settings > Authorized domains |
| **Requiere deploy** | NO â€” cambio de configuraciÃ³n en consola, efecto inmediato |

### 11.2. Incidencia: Popup de Google se cierra inmediatamente (COOP)

| Campo | Detalle |
|-------|--------|
| **Fecha** | 4 de Marzo, 2026 |
| **Entorno** | ProducciÃ³n |
| **Error** | `Cross-Origin-Opener-Policy policy would block the window.closed call` |
| **Causa** | Firebase Hosting envÃ­a headers COOP estrictos (`same-origin`) que bloquean la comunicaciÃ³n popup â†” ventana principal |
| **SÃ­ntoma** | El popup de Google se abre y se cierra casi inmediatamente sin permitir seleccionar cuenta |
| **SoluciÃ³n** | Agregar header `Cross-Origin-Opener-Policy: same-origin-allow-popups` en `firebase.json` (ver secciÃ³n 2.3.1) |
| **Requiere deploy** | SÃ â€” cambio en `firebase.json` |

### 11.3. Incidencia: `Error 400: redirect_uri_mismatch`

| Campo | Detalle |
|-------|--------|
| **Fecha** | 4 de Marzo, 2026 |
| **Entorno** | ProducciÃ³n |
| **Error** | `Access blocked: This app's request is invalid. Error 400: redirect_uri_mismatch` |
| **Causa** | Se cambiÃ³ `authDomain` de `baldora-89866.firebaseapp.com` a `baldora-89866.web.app`, pero Google OAuth solo tiene registrado `firebaseapp.com/__/auth/handler` como redirect URI vÃ¡lida |
| **SÃ­ntoma** | Google muestra pÃ¡gina de error "Access blocked" al intentar autenticarse |
| **SoluciÃ³n** | Revertir `authDomain` a `baldora-89866.firebaseapp.com` en `firebaseConfig` |
| **Requiere deploy** | SÃ â€” cambio en `index.html` |
| **LecciÃ³n** | NUNCA cambiar `authDomain` de `.firebaseapp.com` a menos que se reconfigure manualmente el OAuth Client en Google Cloud Console |

### 11.4. Incidencia: `permission_denied` al crear perfil

| Campo | Detalle |
|-------|--------|
| **Fecha** | 4 de Marzo, 2026 |
| **Entorno** | ProducciÃ³n |
| **Error** | `FIREBASE WARNING: transaction at /users/{uid}/profile failed: permission_denied` |
| **Causa** | Las reglas de Realtime Database solo tenÃ­an la ruta `visits`, no incluÃ­an las rutas `users` ni `leaderboard` |
| **SÃ­ntoma** | El login con Google funciona pero falla al guardar el perfil del usuario |
| **SoluciÃ³n** | Agregar reglas de seguridad para `users` y `leaderboard` (ver secciÃ³n 2.3.2) |
| **Requiere deploy** | NO â€” cambio de configuraciÃ³n en consola, efecto inmediato |

### Checklist de Deploy para Google Auth

- [x] Google habilitado como proveedor en Firebase Console > Authentication > Sign-in method
- [x] Dominio `baldora.org` agregado en Authentication > Settings > Authorized domains
- [x] `authDomain` en `firebaseConfig` = `baldora-89866.firebaseapp.com` (NO cambiar)
- [x] Header COOP `same-origin-allow-popups` en `firebase.json`
- [x] Reglas de Realtime Database incluyen rutas `users/$uid` y `leaderboard`
- [x] Deploy ejecutado despuÃ©s de cambios en `firebase.json` e `index.html`

---

---

## 12. Registro de Cambios de DiseÃ±o UI (IteraciÃ³n 4)

### 12.1. Footer siempre al fondo en vista Mi Perfil

| Cambio | Detalle |
|--------|---------|
| **Problema** | El footer podÃ­a quedar en medio de la vista si el contenido era corto |
| **SoluciÃ³n** | `#profile-view.active { display: flex; flex-direction: column; }` + `.profile-container { flex: 1; }` â€” crea una cadena flex que garantiza que el footer con `margin-top: auto` siempre se ancle al fondo del viewport |

### 12.2. Fondo consistente con el resto de la pÃ¡gina

| Cambio | Detalle |
|--------|---------|
| **Problema** | Las tarjetas de stats y el badge de comunidad usaban `rgba(255,255,255,0.85)` con `backdrop-filter: blur(10px)` (glassmorphism), visualmente diferente al resto de la app |
| **SoluciÃ³n** | Cambiado a `background: var(--clr-surface-high)` en `.profile-stat-card`, `.community-badge` y `.profile-footer p` â€” consistente con el sistema de diseÃ±o global |

### 12.3. Community badge reposicionado

| Cambio | Detalle |
|--------|---------|
| **Cambio** | `.profile-header-row` cambiado de `display: flex; justify-content: space-between` a `display: grid; grid-template-columns: 1fr 1fr` |
| **Resultado** | El badge ocupa exactamente el 50% derecho del header, alineÃ¡ndose visualmente con las cards de "Tiempo promedio" y "Mejor precisiÃ³n" del grid de stats |
| **Badge simplificado** | Eliminado el Ã­cono de trofeo; solo muestra `0/100` + label "COMUNIDAD" |

### 12.4. BotÃ³n de login en vista de configuraciÃ³n

| Cambio | Detalle |
|--------|---------|
| **Nuevo elemento** | `#btn-config-google-signin` dentro de `#nickname-field-group` |
| **Comportamiento** | Se oculta automÃ¡ticamente al login (junto con el grupo de nickname vÃ­a clase `.nickname-hidden`). Al ocultar, se elimina el atributo `required` del input para no bloquear el submit del formulario; se restaura al cerrar sesiÃ³n. |
| **Label actualizado** | `"Tu Nickname"` â†’ `"Tu nickname o Inicia sesiÃ³n"` |

---

### 12.5. Sistema de Ligas Comunitarias (IteraciÃ³n 5)

| Cambio | Detalle |
|--------|---------|
| **Pesos finalizados** | W1=W2=W3=1/3 â€” distribuciÃ³n equitativa entre volumen, velocidad y asertividad |
| **Grupos percentÃ­licos** | 100 grupos dinÃ¡micos: `PosiciÃ³n = ceil(rank / total Ã— 100)` |
| **Ligas** | 6 ligas con icono y color propio: ðŸ’Ž Diamante (1â€“5), ðŸ… Platino (6â€“15), ðŸ¥‡ Oro (16â€“30), ðŸ¥ˆ Plata (31â€“50), ðŸ¥‰ Bronce (51â€“70), ðŸªµ Madera (71â€“100) |
| **RecÃ¡lculo global** | Cada vez que alguien guarda una prÃ¡ctica, `_recalculateAllTiers()` recalcula y escribe tier+league para todos los jugadores |
| **MÃ­nimo de entrada** | 1 prÃ¡ctica (antes el leaderboard exigÃ­a 5 â€” reducido para inclusividad) |
| **Archivos modificados** | `cloudSync.js` (pesos, `_recalculateAllTiers()`), `userProfile.js` (`_renderCommunityScore()`), `index.html` (badge HTML), `css/styles.css` (estilos de liga) |

---

### 12.6. Mejoras de diseÃ±o y datos en Vista de Perfil (IteraciÃ³n 6)

| Cambio | Detalle |
|--------|---------|
| **"Tier" â†’ "PosiciÃ³n"** | La palabra "Tier" se reemplazÃ³ por "PosiciÃ³n" en el badge de la comunidad |
| **IconografÃ­a de ligas** | Cada liga ahora se muestra con un emoji representativo: ðŸ’Ž Diamante, ðŸ… Platino, ðŸ¥‡ Oro, ðŸ¥ˆ Plata, ðŸ¥‰ Bronce, ðŸªµ Madera. Gestionado por `_leagueToIcon()` en `userProfile.js` |
| **NÃºmero grande** | El nÃºmero de posiciÃ³n se muestra en 3.6rem (antes era texto de 0.82rem), siendo ahora el elemento visual principal del badge |
| **Badge rediseÃ±ado** | Nueva estructura: icono (emoji) â†’ nÃºmero grande "PosiciÃ³n N" â†’ nombre de liga â†’ label. Inyectado via `innerHTML` en `_renderCommunityScore()` |
| **Borde coloreado por liga** | El borde del badge cambia de color segÃºn la liga activa |
| **Contador real de prÃ¡cticas** | `profile-total-games` usa `gamesSnap.numChildren()` (conteo real desde la DB), no `stats.total_games`. La query a `/games` ya no usa `limitToLast(50)` para garantizar conteo exacto y historial completo en filtros |
| **Decremento al eliminar** | `_deleteGame()` ahora decrementa `stats.total_games` en Firebase con una transaction, manteniendo el stat sincronizado con la realidad |

---

*Documento en iteraciÃ³n. Ãšltima actualizaciÃ³n: 4 de Marzo, 2026 - v1.6 (DiseÃ±o badge + contador real de prÃ¡cticas)*

