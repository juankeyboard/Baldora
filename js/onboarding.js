/**
 * ONBOARDING.JS - Sistema de Tours Guiados
 * Baldora - Onboarding Contextual con Driver.js
 * 
 * NOTA: El onboarding solo está activo en la pantalla de configuración (menú).
 * Los tours de gameplay y modo adaptativo han sido deshabilitados.
 */

const Onboarding = {
    driver: null,

    // Claves de localStorage para persistencia
    STORAGE_KEYS: {
        CONFIG: 'baldora_tour_config_seen'
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
            overlayColor: 'rgba(255, 255, 255, 0.15)', // Overlay blanco semitransparente
            allowClose: true,
            showProgress: true,
            showButtons: ['next', 'previous', 'close'],
            doneBtnText: '¡Entendido!',
            nextBtnText: 'Siguiente →',
            prevBtnText: '← Atrás',
            closeBtnText: '✕',
            progressText: '{{current}} de {{total}}',
            popoverClass: 'baldora-popover'
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
     * Tour de Bienvenida y Configuración (único tour activo)
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
                element: '.config-form-content',
                popover: {
                    title: '⚙️ Configura tu sesión',
                    description: 'Ingresa tu nickname y elige un modo de juego.',
                    side: 'right',
                    align: 'start'
                }
            },
            {
                element: '.factors-selection-container',
                popover: {
                    title: '🔢 Diseña tu ejercicio!',
                    description: 'Selecciona los factores de las operaciones que quieres practicar. Presiona comenzar a entrenar tu habilidad matemática.',
                    side: 'top',
                    align: 'center'
                }
            }
        ]);

        this.driver.drive();
        localStorage.setItem(this.STORAGE_KEYS.CONFIG, 'true');
    },

    /**
     * Reinicia el tour de configuración (para testing o por petición del usuario)
     */
    resetAllTours() {
        localStorage.removeItem(this.STORAGE_KEYS.CONFIG);
        console.log('✅ Tour de configuración reiniciado.');
    },

    /**
     * Permite al usuario volver a ver el tour de configuración
     */
    replayTour(tourName) {
        if (tourName === 'config') {
            localStorage.removeItem(this.STORAGE_KEYS.CONFIG);
            this.startConfigTour();
        } else {
            console.warn('Tour no disponible:', tourName);
        }
    }
};
