/**
 * ONBOARDING.JS - Sistema de Tours Guiados
 * Baldora - Onboarding Contextual con Driver.js
 */

const Onboarding = {
    driver: null,

    // Claves de localStorage para persistencia
    STORAGE_KEYS: {
        CONFIG: 'baldora_tour_config_seen',
        GAME: 'baldora_tour_game_seen',
        ADAPTIVE: 'baldora_tour_adaptive_seen'
    },

    /**
     * Inicializa el sistema de onboarding
     */
    init() {
        // Verificar que Driver.js esté disponible
        if (typeof window.driver === 'undefined') {
            console.warn('Driver.js no está cargado. Onboarding deshabilitado.');
            return;
        }

        // Inicializar instancia de Driver.js con configuración global
        this.driver = window.driver.js.driver({
            animate: true,
            overlayColor: 'rgba(255, 255, 255, 0.5)', // Overlay blanco semitransparente
            allowClose: true,
            showProgress: true,
            showButtons: ['next', 'previous', 'close'],
            doneBtnText: '¡Entendido!',
            nextBtnText: 'Siguiente →',
            prevBtnText: '← Atrás',
            closeBtnText: '✕',
            progressText: '{{current}} de {{total}}',
            popoverClass: 'baldora-popover',
            onHighlightStarted: () => {
                // Pausar el timer del juego al iniciar el tour
                this.pauseGameTimer();
                // Pausar el timer de inactividad
                this.pauseInactivityTimer();
            },
            onDestroyed: () => {
                // Reanudar el timer del juego al terminar el tour
                this.resumeGameTimer();
                // Reiniciar el timer de inactividad
                this.resumeInactivityTimer();

                // Re-enfocar el input si estamos en la vista de juego
                const answerInput = document.getElementById('answer-input');
                if (answerInput && document.getElementById('game-view').classList.contains('active')) {
                    setTimeout(() => answerInput.focus(), 100);
                }
            }
        });

        // Verificar y lanzar tour de configuración si es primera visita
        this.checkAndStartConfigTour();
    },

    /**
     * Verifica si debe mostrar el tour de configuración
     */
    checkAndStartConfigTour() {
        const seen = localStorage.getItem(this.STORAGE_KEYS.CONFIG);
        if (!seen) {
            // Pequeño delay para asegurar que el DOM esté completamente renderizado
            setTimeout(() => this.startConfigTour(), 500);
        }
    },

    /**
     * Tour de Bienvenida y Configuración
     */
    startConfigTour() {
        if (!this.driver) return;

        this.driver.setSteps([
            {
                element: '.logo-section',
                popover: {
                    title: '🎉 ¡Bienvenido a Baldora!',
                    description: 'Entrena tu mente y domina las tablas de multiplicar con nuestro sistema visual interactivo. ¡Aprenderás jugando!',
                    side: 'bottom',
                    align: 'center'
                }
            },
            {
                element: '#nickname',
                popover: {
                    title: '👤 Tu Identidad',
                    description: 'Ingresa un nickname para personalizar tu experiencia. Tus estadísticas se guardarán con este nombre.',
                    side: 'bottom',
                    align: 'start'
                }
            },
            {
                element: '.mode-selector',
                popover: {
                    title: '🎮 Elige tu Desafío',
                    description: '<strong>⏱️ Contrarreloj:</strong> Corre contra el tiempo.<br><strong>🎯 Práctica Libre:</strong> Sin límites, a tu ritmo.<br><strong>🧠 Adaptativo:</strong> El sistema detecta tus debilidades y te entrena.',
                    side: 'bottom',
                    align: 'center'
                }
            },
            {
                element: '#timer-config',
                popover: {
                    title: '⏰ Tiempo Límite',
                    description: 'En modo Contrarreloj, ajusta cuántos minutos quieres jugar (1-15 minutos).',
                    side: 'bottom',
                    align: 'center'
                }
            },
            {
                element: '.factors-selection-container',
                popover: {
                    title: '🔢 Diseña tu Matriz',
                    description: 'Selecciona qué tablas quieres practicar. <strong>Factor A</strong> son las filas y <strong>Factor B</strong> las columnas. ¡Usa "Todas" para seleccionar todas a la vez!',
                    side: 'top',
                    align: 'center'
                }
            },
            {
                element: '.btn-start',
                popover: {
                    title: '🚀 ¡A Jugar!',
                    description: 'Cuando estés listo, presiona este botón para comenzar tu entrenamiento. ¡Buena suerte!',
                    side: 'top',
                    align: 'center'
                }
            }
        ]);

        this.driver.drive();
        localStorage.setItem(this.STORAGE_KEYS.CONFIG, 'true');
    },

    /**
     * Tour de Gameplay (La Matriz)
     */
    startGameplayTour() {
        if (!this.driver) return;

        const seen = localStorage.getItem(this.STORAGE_KEYS.GAME);
        if (seen) return;

        this.driver.setSteps([
            {
                element: '.matrix-panel',
                popover: {
                    title: '📊 Tu Tablero de Juego',
                    description: 'Aquí verás tu progreso en tiempo real.<br>🟢 <strong>Verde:</strong> ¡Respuesta correcta!<br>🟡 <strong>Amarillo:</strong> Esta operación necesita práctica.',
                    side: 'right',
                    align: 'center'
                }
            },
            {
                element: '.timer-display',
                popover: {
                    title: '⏱️ Control de Tiempo',
                    description: 'Aquí verás el tiempo restante (en Contrarreloj) o el tiempo transcurrido (en otros modos).',
                    side: 'left',
                    align: 'start'
                }
            },
            {
                element: '.operation-card',
                popover: {
                    title: '❓ La Operación Actual',
                    description: 'Aquí aparece la multiplicación que debes resolver. ¡Los factores cambian con cada respuesta!',
                    side: 'left',
                    align: 'center'
                }
            },
            {
                element: '#answer-input',
                popover: {
                    title: '✏️ Tu Respuesta',
                    description: 'Escribe el resultado aquí y presiona <strong>ENTER</strong> para enviarlo. ¡Sé rápido y preciso!',
                    side: 'left',
                    align: 'center'
                }
            },
            {
                element: '.stats-row',
                popover: {
                    title: '📈 Tus Estadísticas',
                    description: 'Sigue tu progreso con el contador de aciertos ✓ y errores ✗ en tiempo real.',
                    side: 'left',
                    align: 'center'
                }
            },
            {
                element: '#btn-audio-toggle',
                popover: {
                    title: '🔊 Control de Sonido',
                    description: '¿Necesitas concentración? Puedes silenciar o activar el sonido del juego aquí.',
                    side: 'bottom',
                    align: 'end'
                }
            }
        ]);

        setTimeout(() => {
            this.driver.drive();
            localStorage.setItem(this.STORAGE_KEYS.GAME, 'true');
        }, 600);
    },

    /**
     * Tour Especial: Modo Adaptativo
     */
    startAdaptiveTour() {
        if (!this.driver) return;

        const seen = localStorage.getItem(this.STORAGE_KEYS.ADAPTIVE);
        if (seen) return;

        this.driver.setSteps([
            {
                element: '.adaptive-info-card',
                popover: {
                    title: '🧠 Modo Adaptativo',
                    description: 'Este modo especial tiene <strong>dos fases</strong> diseñadas para optimizar tu aprendizaje.',
                    side: 'bottom',
                    align: 'center'
                }
            },
            {
                popover: {
                    title: '📋 Fase 1: Diagnóstico',
                    description: 'Primero, completarás <strong>todas</strong> las operaciones de las tablas seleccionadas. El sistema medirá tu velocidad y precisión para detectar tus debilidades.',
                    side: 'center',
                    align: 'center'
                }
            },
            {
                popover: {
                    title: '🎯 Fase 2: Entrenamiento',
                    description: 'Después del diagnóstico, el sistema creará un plan personalizado. Te hará practicar las operaciones problemáticas hasta que las domines.',
                    side: 'center',
                    align: 'center'
                }
            },
            {
                popover: {
                    title: '💡 Ayuda Visual',
                    description: 'Si te atascas durante el entrenamiento, el sistema te mostrará brevemente el resultado correcto. ¡Usa estas pistas para memorizar!',
                    side: 'center',
                    align: 'center'
                }
            }
        ]);

        this.driver.drive();
        localStorage.setItem(this.STORAGE_KEYS.ADAPTIVE, 'true');
    },

    /**
     * Reinicia todos los tours (para testing o por petición del usuario)
     */
    resetAllTours() {
        localStorage.removeItem(this.STORAGE_KEYS.CONFIG);
        localStorage.removeItem(this.STORAGE_KEYS.GAME);
        localStorage.removeItem(this.STORAGE_KEYS.ADAPTIVE);
        console.log('✅ Todos los tours han sido reiniciados.');
    },

    /**
     * Permite al usuario volver a ver un tour específico
     */
    replayTour(tourName) {
        switch (tourName) {
            case 'config':
                localStorage.removeItem(this.STORAGE_KEYS.CONFIG);
                this.startConfigTour();
                break;
            case 'game':
                localStorage.removeItem(this.STORAGE_KEYS.GAME);
                this.startGameplayTour();
                break;
            case 'adaptive':
                localStorage.removeItem(this.STORAGE_KEYS.ADAPTIVE);
                this.startAdaptiveTour();
                break;
            default:
                console.warn('Tour no reconocido:', tourName);
        }
    },

    /**
     * Pausa el timer del juego durante el onboarding
     */
    pauseGameTimer() {
        if (typeof App !== 'undefined' && App.timerInterval) {
            // Guardar el tiempo transcurrido para poder reanudarlo
            if (App.gameMode === 'TIMER') {
                App.pausedRemainingTime = App.remainingTime;
            } else {
                App.pausedElapsedTime = App.elapsedTime;
            }

            // Detener el interval del timer
            clearInterval(App.timerInterval);
            App.timerInterval = null;
            App.timerPausedByOnboarding = true;
            console.log('[Onboarding] Timer pausado');
        }
    },

    /**
     * Reanuda el timer del juego después del onboarding
     */
    resumeGameTimer() {
        if (typeof App !== 'undefined' && App.timerPausedByOnboarding) {
            // Restaurar el tiempo de inicio ajustado
            if (App.gameMode === 'TIMER') {
                // Ajustar startTime para que el tiempo restante sea correcto
                App.startTime = Date.now() - (App.timeLimit - App.pausedRemainingTime);
            } else {
                // Ajustar startTime para cronómetro
                App.startTime = Date.now() - App.pausedElapsedTime;
            }

            // Reiniciar el timer
            App.startTimer();
            App.timerPausedByOnboarding = false;
            console.log('[Onboarding] Timer reanudado');
        }
    },

    /**
     * Pausa el timer de inactividad durante el onboarding
     */
    pauseInactivityTimer() {
        if (typeof App !== 'undefined') {
            // Limpiar el timer de inactividad existente
            App.clearInactivityTimer();
            App.inactivityPausedByOnboarding = true;
            console.log('[Onboarding] Timer de inactividad pausado');
        }
    },

    /**
     * Reinicia el timer de inactividad después del onboarding
     */
    resumeInactivityTimer() {
        if (typeof App !== 'undefined' && App.inactivityPausedByOnboarding) {
            // Solo reiniciar si estamos en modo de juego activo
            if (App.state === 'PLAYING' || App.state === 'PLAYING_DIAGNOSIS') {
                App.startInactivityTimer();
            }
            App.inactivityPausedByOnboarding = false;
            console.log('[Onboarding] Timer de inactividad reiniciado');
        }
    }
};
