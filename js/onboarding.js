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
        CONFIG:   'baldora_tour_config_seen',
        PROFILE:  'baldora_tour_profile_seen'
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

        // Inicializar instancia de Driver.js (textos i18n se aplican al iniciar cada tour)
        this.driver = this._createDriver();

        // Verificar y lanzar tour de configuración si es primera visita
        this.checkAndStartConfigTour();
    },

    /**
     * Crea una instancia de Driver.js con los textos del idioma actual.
     * Se llama al inicio de cada tour para reflejar el idioma seleccionado.
     */
    _createDriver() {
        const t = (key) => (typeof I18n !== 'undefined') ? I18n.t(key) : key;
        return window.driver.js.driver({
            animate: true,
            overlayColor: 'rgba(255, 255, 255, 0.15)',
            allowClose: true,
            showProgress: true,
            showButtons: ['next', 'previous', 'close'],
            doneBtnText: t('onboarding.done'),
            nextBtnText: t('onboarding.next'),
            prevBtnText: t('onboarding.prev'),
            closeBtnText: '✕',
            progressText: t('onboarding.progress'),
            popoverClass: 'baldora-popover'
        });
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
        this.driver = this._createDriver();
        const t = (key) => (typeof I18n !== 'undefined') ? I18n.t(key) : key;

        this.driver.setSteps([
            {
                element: '.logo-section',
                popover: {
                    title: t('onboarding.config.t1'),
                    description: t('onboarding.config.d1'),
                    side: 'bottom',
                    align: 'center'
                }
            },
            {
                element: '.config-form-content',
                popover: {
                    title: t('onboarding.config.t2'),
                    description: t('onboarding.config.d2'),
                    side: 'right',
                    align: 'start'
                }
            },
            {
                element: '.factors-selection-container',
                popover: {
                    title: t('onboarding.config.t3'),
                    description: t('onboarding.config.d3'),
                    side: 'top',
                    align: 'center'
                }
            }
        ]);

        this.driver.drive();
        localStorage.setItem(this.STORAGE_KEYS.CONFIG, 'true');
    },

    /**
     * Verifica si debe mostrar el tour de perfil y lo lanza (primera visita).
     */
    checkAndStartProfileTour() {
        const seen = localStorage.getItem(this.STORAGE_KEYS.PROFILE);
        if (!seen) {
            setTimeout(() => this.startProfileTour(), 600);
        }
    },

    /**
     * Tour de la Vista de Perfil de Usuario
     */
    startProfileTour() {
        this.driver = this._createDriver();
        const t = (key) => (typeof I18n !== 'undefined') ? I18n.t(key) : key;

        this.driver.setSteps([
            {
                element: '.profile-user-info',
                popover: {
                    title: t('onboarding.profile.t1'),
                    description: t('onboarding.profile.d1'),
                    side: 'bottom',
                    align: 'start'
                }
            },
            {
                element: '.profile-stats-grid',
                popover: {
                    title: t('onboarding.profile.t2'),
                    description: t('onboarding.profile.d2'),
                    side: 'bottom',
                    align: 'center'
                }
            },
            {
                element: '.profile-filters',
                popover: {
                    title: t('onboarding.profile.t3'),
                    description: t('onboarding.profile.d3'),
                    side: 'top',
                    align: 'center'
                }
            },
            {
                element: '.profile-table-wrapper',
                popover: {
                    title: t('onboarding.profile.t4'),
                    description: t('onboarding.profile.d4'),
                    side: 'top',
                    align: 'center'
                }
            }
        ]);

        this.driver.drive();
        localStorage.setItem(this.STORAGE_KEYS.PROFILE, 'true');
    },

    /**
     * Reinicia los tours (para testing o por petición del usuario)
     */
    resetAllTours() {
        localStorage.removeItem(this.STORAGE_KEYS.CONFIG);
        localStorage.removeItem(this.STORAGE_KEYS.PROFILE);
        console.log('✅ Todos los tours reiniciados.');
    },

    /**
     * Permite al usuario volver a ver un tour específico
     */
    replayTour(tourName) {
        if (tourName === 'config') {
            localStorage.removeItem(this.STORAGE_KEYS.CONFIG);
            this.startConfigTour();
        } else if (tourName === 'profile') {
            localStorage.removeItem(this.STORAGE_KEYS.PROFILE);
            this.startProfileTour();
        } else {
            console.warn('Tour no disponible:', tourName);
        }
    }
};
