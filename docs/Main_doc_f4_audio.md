# Documento Maestro de Ingeniería: Sistema de Audio

**Versión:** 4.3 (Actualizado)  
**Fecha:** 15 de Diciembre, 2025  
**Proyecto:** Baldora  
**Estado:** ✅ Implementado y Funcional

---

## 1. Visión General

Este documento define la implementación de la capa sonora del juego. El sistema de audio está completamente funcional con música de fondo, efectos de sonido sincronizados con las acciones del juego, y persistencia del estado de mute.

---

## 2. Estándares Técnicos

| Aspecto | Especificación |
|---------|----------------|
| **Formato Maestro** | `.mp3` |
| **Frecuencia** | 44100 Hz (44.1 kHz) |
| **Licencia** | CC0 (Creative Commons Zero - Dominio Público) |
| **Prefijo de Archivos** | `baldora_` (identificador del proyecto) |

### Estructura de Directorios

```
Baldora/
├── js/
│   └── audioManager.js  ← Controlador de Audio
├── audio/
│   ├── bgm/             ← Música de Fondo (Background Music)
│   │   ├── baldora_bgm_gameplay.mp3  ✅
│   │   ├── baldora_bgm_menu.mp3      ✅
│   │   └── baldora_bgm_stats.mp3     ✅
│   └── sfx/             ← Efectos de Sonido (Sound Effects)
│       ├── baldora_sfx_right.mp3     ✅ (acierto)
│       ├── baldora_sfx_wrong.mp3     ✅ (error)
│       ├── baldora_sfx_start.mp3     ✅ (inicio de juego)
│       ├── baldora_sfx_click.mp3     ✅ (clic en botones)
│       ├── baldora_sfx_hover.mp3     ✅ (hover en elementos)
│       ├── baldora_sfx_win.mp3       ✅ (victoria)
│       ├── baldora_sfx_gameover.mp3  ✅ (game over)
│       └── baldora_sfx_hint.mp3      ✅ (ayuda visual)
```

---

## 3. Archivos de Audio

### 3.1. Música de Fondo (BGM)

| Archivo | Clave | Propósito | Integración |
|---------|-------|-----------|-------------|
| `baldora_bgm_gameplay.mp3` | `gameplay` | Música durante el juego (loop) | `startGame()` |
| `baldora_bgm_menu.mp3` | `menu` | Música en pantalla de configuración | `showView('CONFIG')` |
| `baldora_bgm_stats.mp3` | `stats` | Música en pantalla de estadísticas | `endGame()` |

### 3.2. Efectos de Sonido (SFX)

| Archivo | Clave | Propósito | Integración |
|---------|-------|-----------|-------------|
| `baldora_sfx_right.mp3` | `correct` | Respuesta correcta | `submitAnswer()` cuando `isCorrect` |
| `baldora_sfx_wrong.mp3` | `wrong` | Respuesta incorrecta | `submitAnswer()` cuando `!isCorrect` |
| `baldora_sfx_start.mp3` | `start` | Inicio de juego | `startGame()` |
| `baldora_sfx_click.mp3` | `click` | Clic en botones de UI | Event listeners de botones |
| `baldora_sfx_hover.mp3` | `hover` | Hover en elementos interactivos | `mouseenter` en botones y celdas |
| `baldora_sfx_win.mp3` | `win` | Victoria | Disponible vía `playWin()` |
| `baldora_sfx_gameover.mp3` | `gameover` | Game over | Disponible vía `playGameover()` |
| `baldora_sfx_hint.mp3` | `hint` | Ayuda visual mostrada | `showAnswerInCell()`, `showResultOnClick()` |

---

## 4. Integración con el Juego

### 4.1. Eventos de Audio Implementados

| Evento del Juego | Función | Llamada de Audio |
|------------------|---------|------------------|
| Iniciar juego | `startGame()` | `playStart()` + `playBGM('gameplay')` |
| Respuesta correcta | `submitAnswer()` | `playCorrect()` |
| Respuesta incorrecta | `submitAnswer()` | `playWrong()` |
| Timeout en diagnóstico | `handleDiagnosisTimeout()` | `playWrong()` |
| Terminar juego | `endGame()` | `stopBGM()` + `playBGM('stats')` |
| Reiniciar juego | `resetGame()` | `stopBGM()` |
| Cambiar a CONFIG | `showView('CONFIG')` | `playBGM('menu')` |
| Clic en botones | Event listeners | `playClick()` |
| Hover en elementos | `mouseenter` | `playHover()` |
| Ayuda visual automática | `showAnswerInCell()` | `playHint()` |
| Clic en celda (ver resultado) | `showResultOnClick()` | `playHint()` |

### 4.2. Características Técnicas

| Característica | Descripción | Estado |
|----------------|-------------|--------|
| **Carga Previa (Preload)** | Instancia `new Audio()` al iniciar la app | ✅ |
| **Loop Infinito** | BGM se reproduce en bucle continuo | ✅ |
| **Sin Reinicio** | BGM no se reinicia al cambiar de operación | ✅ |
| **Polifonía (Overlap)** | SFX usa `.cloneNode()` para superposición | ✅ |
| **Persistencia de Mute** | Estado guardado en `localStorage` | ✅ |
| **Tolerancia a Fallos** | Captura errores sin romper el juego | ✅ |
| **Botón Mute/Unmute** | UI global en esquina superior derecha | ✅ |
| **Limpieza de Intervalos** | Se detienen al cambiar de pantalla | ✅ |

---

## 5. AudioManager - API Pública

### Archivo: `js/audioManager.js`

```javascript
AudioManager = {
    // Inicialización
    init(),                    // Inicializa y precarga audios
    
    // Música de Fondo
    playBGM(trackName),        // Reproduce BGM ('gameplay', 'menu', 'stats')
    stopBGM(),                 // Detiene BGM actual
    pauseBGM(),                // Pausa BGM
    resumeBGM(),               // Reanuda BGM pausado
    
    // Efectos de Sonido
    playSFX(sfxName),          // Reproduce SFX genérico
    playCorrect(),             // Atajo: sonido de acierto
    playWrong(),               // Atajo: sonido de error
    playClick(),               // Atajo: sonido de clic en UI
    playStart(),               // Atajo: sonido de inicio
    playHover(),               // Atajo: sonido de hover
    playHint(),                // Atajo: sonido de ayuda/hint
    playWin(),                 // Atajo: sonido de victoria
    playGameover(),            // Atajo: sonido de game over
    
    // Control de Mute
    toggleMute(),              // Alterna mute/unmute
    getMuteState()             // Retorna estado actual de mute
}
```

---

## 6. Configuración de Rutas de Audio

En `audioManager.js`:

```javascript
const audioConfig = {
    bgm: {
        gameplay: 'audio/bgm/baldora_bgm_gameplay.mp3',
        menu: 'audio/bgm/baldora_bgm_menu.mp3',
        stats: 'audio/bgm/baldora_bgm_stats.mp3'
    },
    sfx: {
        correct: 'audio/sfx/baldora_sfx_right.mp3',
        wrong: 'audio/sfx/baldora_sfx_wrong.mp3',
        start: 'audio/sfx/baldora_sfx_start.mp3',
        click: 'audio/sfx/baldora_sfx_click.mp3',
        hover: 'audio/sfx/baldora_sfx_hover.mp3',
        win: 'audio/sfx/baldora_sfx_win.mp3',
        gameover: 'audio/sfx/baldora_sfx_gameover.mp3',
        hint: 'audio/sfx/baldora_sfx_hint.mp3'
    }
};
```

### Volúmenes Predeterminados

| Tipo | Volumen | Razón |
|------|---------|-------|
| BGM | 0.2 (20%) | Música de fondo sutil |
| SFX | 0.7 (70%) | Efectos audibles pero no intrusivos |

---

## 7. UI del Botón de Audio

### HTML (`index.html`)

```html
<button type="button" id="btn-audio-toggle" class="audio-toggle-btn" 
        onclick="AudioManager.toggleMute()" title="Silenciar">&#128266;</button>
```

### Iconos

| Estado | Icono | Código HTML |
|--------|-------|-------------|
| Sonido activo | 🔊 | `&#128266;` |
| Silenciado | 🔇 | `&#128263;` |

### Posición

Esquina superior derecha de la pantalla, siempre visible (z-index: 1500).

---

## 8. Persistencia del Estado de Mute

```javascript
const STORAGE_KEY = 'baldora_audioMuted';

// Guardar
localStorage.setItem(STORAGE_KEY, isMuted.toString());

// Cargar
const savedMuteState = localStorage.getItem(STORAGE_KEY);
if (savedMuteState !== null) {
    isMuted = savedMuteState === 'true';
}
```

---

## 9. Notas Técnicas

### 9.1. Autoplay en Navegadores

Los navegadores modernos bloquean el autoplay de audio hasta que el usuario interactúe con la página. Por esta razón:
- La música **solo comienza después de hacer clic** en "COMENZAR"
- No es posible reproducir audio automáticamente al cargar la página

### 9.2. Manejo de Errores

Todos los métodos de reproducción están envueltos en try-catch y capturan promesas rechazadas sin romper el juego:

```javascript
audio.play().catch(err => {
    console.warn('[AudioManager] Autoplay bloqueado:', err.message);
});
```

### 9.3. Limpieza de Recursos

Los clones de audio SFX se eliminan automáticamente después de reproducirse:

```javascript
clone.onended = () => {
    clone.remove();
};
```

---

## 10. Checklist de Implementación

### Infraestructura
- [x] Crear estructura de carpetas `audio/bgm/` y `audio/sfx/`
- [x] Crear `js/audioManager.js` con la clase AudioManager
- [x] Agregar botón de mute/unmute a la UI
- [x] Integrar AudioManager en `app.js`
- [x] Agregar estilos CSS para el botón de audio

### Música de Fondo
- [x] `baldora_bgm_gameplay.mp3` - Música durante el juego
- [x] `baldora_bgm_menu.mp3` - Música en configuración
- [x] `baldora_bgm_stats.mp3` - Música en estadísticas

### Efectos de Sonido
- [x] `baldora_sfx_right.mp3` - Sonido de acierto
- [x] `baldora_sfx_wrong.mp3` - Sonido de error
- [x] `baldora_sfx_start.mp3` - Sonido de inicio
- [x] `baldora_sfx_click.mp3` - Sonido de clic
- [x] `baldora_sfx_hover.mp3` - Sonido de hover
- [x] `baldora_sfx_hint.mp3` - Sonido de ayuda visual
- [x] `baldora_sfx_win.mp3` - Sonido de victoria
- [x] `baldora_sfx_gameover.mp3` - Sonido de game over

### Integraciones
- [x] Sonido de inicio al comenzar juego
- [x] Sonido de acierto/error en respuestas
- [x] Sonido de hint en ayuda visual
- [x] Música de fondo según pantalla
- [x] Persistencia de estado mute
- [x] Limpieza de intervalos al cambiar pantalla

---

**Última actualización:** 15 de Diciembre, 2025
