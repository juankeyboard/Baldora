/**
 * AudioManager - Controlador de Audio para Fast Math Game
 * Versión: 1.0 (Piloto)
 * 
 * Características:
 * - Carga previa (preload) de archivos de audio
 * - Sistema de loop para música de fondo
 * - Polifonía para efectos de sonido
 * - Persistencia de estado mute en localStorage
 * - Tolerancia a fallos (graceful degradation)
 */

const AudioManager = (() => {
    // ===== ESTADO PRIVADO =====
    let isMuted = false;
    const STORAGE_KEY = 'fastMathGame_audioMuted';

    // ===== CONFIGURACIÓN DE AUDIO =====
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
            click: 'audio/sfx/baldora_sfx_ui_click.mp3',
            win: 'audio/sfx/baldora_sfx_win.mp3',
            gameover: 'audio/sfx/baldora_sfx_gameover.mp3'
        }
    };

    // ===== INSTANCIAS DE AUDIO =====
    const bgmTracks = {};
    const sfxSounds = {};
    let currentBGM = null;

    // ===== INICIALIZACIÓN =====

    /**
     * Inicializa el AudioManager
     * Carga el estado de mute desde localStorage y precarga los audios
     */
    function init() {
        // Cargar estado de mute desde localStorage
        const savedMuteState = localStorage.getItem(STORAGE_KEY);
        if (savedMuteState !== null) {
            isMuted = savedMuteState === 'true';
        }

        // Precargar música de fondo
        for (const [key, path] of Object.entries(audioConfig.bgm)) {
            preloadBGM(key, path);
        }

        // Precargar efectos de sonido
        for (const [key, path] of Object.entries(audioConfig.sfx)) {
            preloadSFX(key, path);
        }

        // Actualizar UI del botón de mute
        updateMuteButtonUI();

        console.log('[AudioManager] Inicializado. Mute:', isMuted);
    }

    /**
     * Precarga un archivo de música de fondo
     */
    function preloadBGM(key, path) {
        try {
            const audio = new Audio();
            audio.src = path;
            audio.loop = true;
            audio.volume = 0.3; // Volumen reducido para BGM
            audio.preload = 'auto';

            // Manejar errores de carga silenciosamente
            audio.onerror = () => {
                console.warn(`[AudioManager] BGM no encontrado: ${path}`);
            };

            bgmTracks[key] = audio;
        } catch (error) {
            console.warn(`[AudioManager] Error al precargar BGM ${key}:`, error);
        }
    }

    /**
     * Precarga un archivo de efecto de sonido
     */
    function preloadSFX(key, path) {
        try {
            const audio = new Audio();
            audio.src = path;
            audio.volume = 0.5;
            audio.preload = 'auto';

            // Manejar errores de carga silenciosamente
            audio.onerror = () => {
                console.warn(`[AudioManager] SFX no encontrado: ${path}`);
            };

            sfxSounds[key] = audio;
        } catch (error) {
            console.warn(`[AudioManager] Error al precargar SFX ${key}:`, error);
        }
    }

    // ===== REPRODUCCIÓN DE MÚSICA DE FONDO =====

    /**
     * Reproduce una pista de música de fondo
     * @param {string} trackName - Nombre de la pista (gameplay, menu)
     */
    function playBGM(trackName) {
        if (isMuted) return;

        const track = bgmTracks[trackName];
        if (!track) {
            console.warn(`[AudioManager] BGM no disponible: ${trackName}`);
            return;
        }

        // Detener BGM actual si existe
        stopBGM();

        try {
            currentBGM = track;
            track.currentTime = 0;
            track.play().catch(err => {
                // El navegador puede bloquear autoplay sin interacción del usuario
                console.warn('[AudioManager] Autoplay bloqueado:', err.message);
            });
        } catch (error) {
            console.warn('[AudioManager] Error al reproducir BGM:', error);
        }
    }

    /**
     * Detiene la música de fondo actual
     */
    function stopBGM() {
        if (currentBGM) {
            try {
                currentBGM.pause();
                currentBGM.currentTime = 0;
            } catch (error) {
                console.warn('[AudioManager] Error al detener BGM:', error);
            }
            currentBGM = null;
        }
    }

    /**
     * Pausa la música de fondo actual
     */
    function pauseBGM() {
        if (currentBGM) {
            try {
                currentBGM.pause();
            } catch (error) {
                console.warn('[AudioManager] Error al pausar BGM:', error);
            }
        }
    }

    /**
     * Reanuda la música de fondo pausada
     */
    function resumeBGM() {
        if (isMuted) return;

        if (currentBGM) {
            try {
                currentBGM.play().catch(err => {
                    console.warn('[AudioManager] Error al reanudar BGM:', err.message);
                });
            } catch (error) {
                console.warn('[AudioManager] Error al reanudar BGM:', error);
            }
        }
    }

    // ===== REPRODUCCIÓN DE EFECTOS DE SONIDO =====

    /**
     * Reproduce un efecto de sonido
     * Usa cloneNode para permitir polifonía (múltiples instancias simultáneas)
     * @param {string} sfxName - Nombre del efecto (correct, wrong, click, win, gameover)
     */
    function playSFX(sfxName) {
        if (isMuted) return;

        const sound = sfxSounds[sfxName];
        if (!sound) {
            console.warn(`[AudioManager] SFX no disponible: ${sfxName}`);
            return;
        }

        try {
            // Clonar el audio para permitir superposición
            const clone = sound.cloneNode();
            clone.volume = sound.volume;
            clone.play().catch(err => {
                console.warn('[AudioManager] Error al reproducir SFX:', err.message);
            });

            // Limpiar el clon después de que termine
            clone.onended = () => {
                clone.remove();
            };
        } catch (error) {
            console.warn('[AudioManager] Error al reproducir SFX:', error);
        }
    }

    // ===== CONTROL DE MUTE =====

    /**
     * Alterna el estado de mute
     * @returns {boolean} - Nuevo estado de mute
     */
    function toggleMute() {
        isMuted = !isMuted;

        // Guardar en localStorage
        localStorage.setItem(STORAGE_KEY, isMuted.toString());

        // Aplicar mute/unmute a la música actual
        if (isMuted) {
            pauseBGM();
        } else {
            resumeBGM();
        }

        // Actualizar UI
        updateMuteButtonUI();

        console.log('[AudioManager] Mute:', isMuted);
        return isMuted;
    }

    /**
     * Obtiene el estado actual de mute
     * @returns {boolean}
     */
    function getMuteState() {
        return isMuted;
    }

    /**
     * Actualiza la UI del botón de mute
     */
    function updateMuteButtonUI() {
        const muteBtn = document.getElementById('btn-audio-toggle');
        if (muteBtn) {
            muteBtn.innerHTML = isMuted ? '&#128263;' : '&#128266;'; // 🔇 o 🔊
            muteBtn.title = isMuted ? 'Activar sonido' : 'Silenciar';
            muteBtn.classList.toggle('muted', isMuted);
        }
    }

    // ===== ATAJOS PARA EFECTOS COMUNES =====

    function playCorrect() {
        playSFX('correct');
    }

    function playWrong() {
        playSFX('wrong');
    }

    function playClick() {
        playSFX('click');
    }

    function playWin() {
        playSFX('win');
    }

    function playGameover() {
        playSFX('gameover');
    }

    function playStart() {
        playSFX('start');
    }

    // ===== API PÚBLICA =====
    return {
        init,
        playBGM,
        stopBGM,
        pauseBGM,
        resumeBGM,
        playSFX,
        playCorrect,
        playWrong,
        playClick,
        playWin,
        playGameover,
        playStart,
        toggleMute,
        getMuteState
    };
})();

// Inicializar cuando el DOM esté listo
document.addEventListener('DOMContentLoaded', () => {
    AudioManager.init();
});
