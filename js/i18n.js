/**
 * I18N.JS - Sistema de Internacionalización (i18n)
 * Baldora - Módulo estrictamente aditivo
 *
 * API:
 *   I18n.init()                - Inicializa y aplica el idioma guardado (default: 'es')
 *   I18n.setLanguage(code)     - Cambia el idioma y re-renderiza
 *   I18n.t(key)                - Retorna el string traducido para la clave dada
 *   I18n.applyTranslations()   - Re-aplica traducciones al DOM completo
 */

const I18n = {
    currentLang: 'es',
    STORAGE_KEY: 'baldora_lang',

    // ── Diccionarios ──────────────────────────────────────────────────────────
    dict: {
        es: {
            // Auth
            'auth.signin':        'Iniciar sesión',
            'auth.signin_google': 'Iniciar sesión con Google',
            'auth.my_profile':    '\uD83D\uDC64 Mi Perfil',
            'auth.signout':       '\uD83D\uDEAA Cerrar sesión',

            // Config
            'config.nickname_label':   'Tu nickname o Inicia sesión',
            'config.nickname_ph':      'Ingresa tu nombre',
            'config.game_mode':        'Modo de Juego',
            'config.mode_timer':       'Contrarreloj',
            'config.mode_timer_desc':  'Tiempo límite',
            'config.mode_free':        'Práctica Libre',
            'config.mode_free_desc':   'Sin límite',
            'config.mode_adaptive':    'Adaptativo',
            'config.mode_adaptive_desc': 'Entrena debilidades',
            'config.time_limit':       'Tiempo Límite (minutos)',
            'config.factor_a':         'TABLA Factor A (Filas)',
            'config.factor_b':         'TABLA Factor B (Columnas)',
            'config.btn_all':          'Todas',
            'config.btn_start':        'COMENZAR',

            // Game
            'game.time':          'Tiempo',
            'game.end_session':   'Terminar Sesion',
            'game.correct':       'Aciertos',
            'game.wrong':         'Errores',
            'game.weaknesses':    'Debilidades restantes',
            'game.matrix_title':  'Tabla de Multiplicar',

            // Dashboard
            'dash.title':         '\uD83D\uDCC8 Analiticas de Sesion',
            'dash.download':      '\uD83D\uDCE5 Descargar Resultados',
            'dash.new_game':      'Nueva Partida',
            'dash.operations':    'Operaciones',
            'dash.correct':       'Correctas',
            'dash.avg_time':      'Tiempo Promedio',
            'dash.precision':     'Precision',
            'dash.ai_coach':      'Entrenador Virtual',

            // Profile
            'profile.back':           '\u2190 Volver',
            'profile.member_since':   'Miembro desde',
            'profile.practices':      'prácticas',
            'profile.stat_correct':   'Correctas totales',
            'profile.stat_accuracy':  'Precisión global',
            'profile.stat_avg_time':  'Tiempo promedio',
            'profile.stat_best':      'Mejor precisión',
            'profile.history_title':  '\uD83D\uDCC8 Historial de Prácticas',
            'profile.filter_mode':    'Modo',
            'profile.filter_from':    'Desde',
            'profile.filter_to':      'Hasta',
            'profile.apply':          'Aplicar',
            'profile.clear':          'Limpiar',
        },
        en: {
            // Auth
            'auth.signin':        'Sign in',
            'auth.signin_google': 'Sign in with Google',
            'auth.my_profile':    '\uD83D\uDC64 My Profile',
            'auth.signout':       '\uD83D\uDEAA Sign out',

            // Config
            'config.nickname_label':   'Your nickname or Sign in',
            'config.nickname_ph':      'Enter your name',
            'config.game_mode':        'Game Mode',
            'config.mode_timer':       'Time Attack',
            'config.mode_timer_desc':  'Time limit',
            'config.mode_free':        'Free Practice',
            'config.mode_free_desc':   'No limit',
            'config.mode_adaptive':    'Adaptive',
            'config.mode_adaptive_desc': 'Train weaknesses',
            'config.time_limit':       'Time Limit (minutes)',
            'config.factor_a':         'TABLE Factor A (Rows)',
            'config.factor_b':         'TABLE Factor B (Columns)',
            'config.btn_all':          'All',
            'config.btn_start':        'START',

            // Game
            'game.time':          'Time',
            'game.end_session':   'End Session',
            'game.correct':       'Correct',
            'game.wrong':         'Errors',
            'game.weaknesses':    'Remaining Weaknesses',
            'game.matrix_title':  'Multiplication Table',

            // Dashboard
            'dash.title':         '\uD83D\uDCC8 Session Analytics',
            'dash.download':      '\uD83D\uDCE5 Download Results',
            'dash.new_game':      'New Game',
            'dash.operations':    'Operations',
            'dash.correct':       'Correct',
            'dash.avg_time':      'Average Time',
            'dash.precision':     'Accuracy',
            'dash.ai_coach':      'Virtual Coach',

            // Profile
            'profile.back':           '\u2190 Back',
            'profile.member_since':   'Member since',
            'profile.practices':      'practices',
            'profile.stat_correct':   'Total Correct',
            'profile.stat_accuracy':  'Global Accuracy',
            'profile.stat_avg_time':  'Average Time',
            'profile.stat_best':      'Best Accuracy',
            'profile.history_title':  '\uD83D\uDCC8 Practice History',
            'profile.filter_mode':    'Mode',
            'profile.filter_from':    'From',
            'profile.filter_to':      'To',
            'profile.apply':          'Apply',
            'profile.clear':          'Clear',
        }
    },

    // ── API pública ───────────────────────────────────────────────────────────

    /**
     * Inicializa el sistema: carga idioma guardado, actualiza selector y aplica.
     */
    init() {
        const saved = localStorage.getItem(this.STORAGE_KEY);
        this.currentLang = (saved && this.dict[saved]) ? saved : 'es';
        this._updateSelector();
        this.applyTranslations();
    },

    /**
     * Retorna la traducción de una clave. Fallback a la clave si no existe.
     */
    t(key) {
        const d = this.dict[this.currentLang];
        return (d && d[key] !== undefined) ? d[key] : key;
    },

    /**
     * Cambia el idioma, persiste y re-aplica traducciones.
     */
    setLanguage(code) {
        if (!this.dict[code]) return;
        this.currentLang = code;
        localStorage.setItem(this.STORAGE_KEY, code);
        this._updateSelector();
        this.applyTranslations();
    },

    /**
     * Aplica todas las traducciones al DOM.
     * - [data-i18n]             → textContent
     * - [data-i18n-placeholder] → placeholder attribute
     * - [data-i18n-title]       → title attribute
     */
    applyTranslations(root) {
        const scope = root || document;

        scope.querySelectorAll('[data-i18n]').forEach(el => {
            el.textContent = this.t(el.dataset.i18n);
        });
        scope.querySelectorAll('[data-i18n-placeholder]').forEach(el => {
            el.placeholder = this.t(el.dataset.i18nPlaceholder);
        });
        scope.querySelectorAll('[data-i18n-title]').forEach(el => {
            el.title = this.t(el.dataset.i18nTitle);
        });
    },

    // ── Internos ──────────────────────────────────────────────────────────────
    _updateSelector() {
        const sel = document.getElementById('lang-selector');
        if (sel) sel.value = this.currentLang;
    }
};
