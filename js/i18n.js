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

            // Dashboard AI
            'dash.ai_analyze':        'Analizar mis Resultados',
            'dash.ai_analyzing':      'Procesando...',
            'dash.ai_summary':        '\uD83D\uDCC8 Resumen General',
            'dash.ai_errors':         '\u26A0\uFE0F Patr\u00F3n de Errores',
            'dash.ai_plan':           '\uD83D\uDE80 Plan de Acci\u00F3n',
            'dash.ai_suggestion':     '\u2699\uFE0F Sugerencia de Entrenamiento',

            // Dashboard Gráficas
            'dash.chart_performance': 'Distribucion de Rendimiento',
            'dash.chart_errors':      'Errores por Tabla',
            'dash.chart_top5':        'Top 5 Operaciones Dificiles',
            'dash.chart_speed':       'Velocidad de Respuesta',

            // Modales adaptativos
            'modal.inactivity_title': 'Sesion Pausada',
            'modal.inactivity_msg':   'El juego se reinicio por inactividad (30 segundos sin respuesta)',
            'modal.inactivity_btn':   'Volver al Inicio',
            'modal.diagnosis_title':  'Analisis Completado',
            'modal.diagnosis_sub':    'Iniciando protocolo de correccion...',
            'modal.diagnosis_btn':    'Comenzar Entrenamiento',
            'modal.victory_title':    'Entrenamiento Completado!',
            'modal.victory_msg':      'Has dominado todas las operaciones problematicas.',
            'modal.victory_initial':  'Debilidades iniciales',
            'modal.victory_rounds':   'Rondas completadas',
            'modal.victory_help':     'Ayudas visuales',
            'modal.victory_btn':      'Ver Resultados',

            // Juego adaptativo
            'game.phase_diagnosis':   '\uD83D\uDCCB Fase Diagnostico',

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
            'profile.community_badge':'TU POSICIÓN EN LA COMUNIDAD',
            'profile.th_date':        'Fecha',
            'profile.th_mode':        'Modo',
            'profile.th_total':       'Total',
            'profile.th_correct':     'Correctas',
            'profile.th_accuracy':    'Precisión',
            'profile.th_avg_time':    'T. Promedio',
            'profile.th_actions':     'Acciones',
            'profile.delete_title':   'Eliminar registro de práctica',
            'profile.delete_cancel':  'Cancelar',
            'profile.delete_btn':     'Eliminar',

            // Export
            'export.title':           'Descargar Resultados',
            'export.choose':          'Elige el formato de tu reporte:',

            // Onboarding - botones Driver.js
            'onboarding.done':     '¡Entendido!',
            'onboarding.next':     'Siguiente →',
            'onboarding.prev':     '← Atrás',
            'onboarding.progress': '{{current}} de {{total}}',

            // Onboarding - tour de configuración
            'onboarding.config.t1': '🎉 ¡Bienvenido a Baldora!',
            'onboarding.config.d1': 'Entrena tu mente y domina las tablas de multiplicar con nuestro sistema visual interactivo. ¡Aprenderás jugando! (Usa el PC para una mejor experiencia)',
            'onboarding.config.t2': '⚙️ Configura tu sesión',
            'onboarding.config.d2': 'Ingresa tu nickname y elige un modo de juego.',
            'onboarding.config.t3': '🔢 ¡Diseña tu ejercicio!',
            'onboarding.config.d3': 'Selecciona los factores de las operaciones que quieres practicar. Presiona comenzar y empieza a fortalecer tu pensamiento matemático.',

            // Onboarding - tour de perfil
            'onboarding.profile.t1': '👤 Tu Perfil',
            'onboarding.profile.d1': 'Aquí aparece tu información de usuario: nombre, correo y tiempo en la comunidad.',
            'onboarding.profile.t2': '📈 Tus Métricas',
            'onboarding.profile.d2': 'Resumen de tu desempeño global: aciertos totales, precisión, tiempo promedio y tu mejor marca.',
            'onboarding.profile.t3': '🔍 Filtros de Historial',
            'onboarding.profile.d3': 'Filtra tu historial de prácticas por modo de juego y rango de fechas para analizar tu progreso.',
            'onboarding.profile.t4': '📋 Historial Detallado',
            'onboarding.profile.d4': 'Aquí ves cada sesión de práctica con sus resultados. Puedes eliminar registros individualmente.',
            'onboarding.profile.t5': '🏅 Tu Posición en la Comunidad',
            'onboarding.profile.d5': 'Este badge muestra tu liga dentro de Baldora. Se calcula con un <strong>puntaje comunitario</strong> que combina tres métricas:<br><br>• <strong>Corrección</strong> — cuántas operaciones resuelves bien respecto a tu propio máximo.<br>• <strong>Velocidad</strong> — qué tan rápido respondes frente al resto de jugadores.<br>• <strong>Precisión</strong> — tu porcentaje global de aciertos frente al mínimo de la comunidad.<br><br>Tu posición se actualiza en cada práctica y define tu liga:<br>💎 Diamante · 🏅 Platino · 🥇 Oro · 🥈 Plata · 🥉 Bronce · 🪵 Madera',

            // Liga comunidad
            'league.DIAMANTE': 'DIAMANTE',
            'league.PLATINO':  'PLATINO',
            'league.ORO':      'ORO',
            'league.PLATA':    'PLATA',
            'league.BRONCE':   'BRONCE',
            'league.MADERA':   'MADERA',
            'league.position': 'Posición',
            'league.badge':    'Tu posición en la comunidad',

            // Modos de juego (filtro perfil)
            'mode.all':        'Todos',
            'mode.timer':      'Contrarreloj',
            'mode.free':       'Práctica Libre',
            'mode.adaptive':   'Adaptativo',
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

            // Dashboard AI
            'dash.ai_analyze':        'Analyze My Results',
            'dash.ai_analyzing':      'Processing...',
            'dash.ai_summary':        '\uD83D\uDCC8 General Summary',
            'dash.ai_errors':         '\u26A0\uFE0F Error Patterns',
            'dash.ai_plan':           '\uD83D\uDE80 Action Plan',
            'dash.ai_suggestion':     '\u2699\uFE0F Training Suggestion',

            // Dashboard Gráficas
            'dash.chart_performance': 'Performance Distribution',
            'dash.chart_errors':      'Errors by Table',
            'dash.chart_top5':        'Top 5 Difficult Operations',
            'dash.chart_speed':       'Response Speed',

            // Modales adaptativos
            'modal.inactivity_title': 'Session Paused',
            'modal.inactivity_msg':   'The game was reset due to inactivity (30 seconds without answer)',
            'modal.inactivity_btn':   'Back to Start',
            'modal.diagnosis_title':  'Analysis Complete',
            'modal.diagnosis_sub':    'Starting correction protocol...',
            'modal.diagnosis_btn':    'Start Training',
            'modal.victory_title':    'Training Complete!',
            'modal.victory_msg':      'You have mastered all the problem operations.',
            'modal.victory_initial':  'Initial Weaknesses',
            'modal.victory_rounds':   'Rounds Completed',
            'modal.victory_help':     'Visual Aids',
            'modal.victory_btn':      'View Results',

            // Juego adaptativo
            'game.phase_diagnosis':   '\uD83D\uDCCB Diagnosis Phase',

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
            'profile.community_badge':'YOUR COMMUNITY RANK',
            'profile.th_date':        'Date',
            'profile.th_mode':        'Mode',
            'profile.th_total':       'Total',
            'profile.th_correct':     'Correct',
            'profile.th_accuracy':    'Accuracy',
            'profile.th_avg_time':    'Avg. Time',
            'profile.th_actions':     'Actions',
            'profile.delete_title':   'Delete practice record',
            'profile.delete_cancel':  'Cancel',
            'profile.delete_btn':     'Delete',

            // Export
            'export.title':           'Download Results',
            'export.choose':          'Choose your report format:',

            // Onboarding - botones Driver.js
            'onboarding.done':     'Got it!',
            'onboarding.next':     'Next →',
            'onboarding.prev':     '← Back',
            'onboarding.progress': '{{current}} of {{total}}',

            // Onboarding - tour de configuración
            'onboarding.config.t1': '🎉 Welcome to Baldora!',
            'onboarding.config.d1': 'Train your mind and master multiplication tables with our interactive visual system. You will learn while playing! (Best experienced on PC)',
            'onboarding.config.t2': '⚙️ Set up your session',
            'onboarding.config.d2': 'Enter your nickname and choose a game mode.',
            'onboarding.config.t3': '🔢 Design your exercise!',
            'onboarding.config.d3': 'Select the factors for the operations you want to practice. Press start and begin strengthening your mathematical thinking.',

            // Onboarding - tour de perfil
            'onboarding.profile.t1': '👤 Your Profile',
            'onboarding.profile.d1': 'Here you can see your user info: name, email and time in the community.',
            'onboarding.profile.t2': '📈 Your Metrics',
            'onboarding.profile.d2': 'Summary of your global performance: total correct, accuracy, average time and your best score.',
            'onboarding.profile.t3': '🔍 History Filters',
            'onboarding.profile.d3': 'Filter your practice history by game mode and date range to analyze your progress.',
            'onboarding.profile.t4': '📋 Detailed History',
            'onboarding.profile.d4': 'Here you see each practice session with its results. You can delete individual records.',
            'onboarding.profile.t5': '🏅 Your Community Position',
            'onboarding.profile.d5': 'This badge shows your league in Baldora. It is calculated with a <strong>community score</strong> that combines three metrics:<br><br>• <strong>Accuracy</strong> — how many operations you solve correctly relative to your own best.<br>• <strong>Speed</strong> — how fast you respond compared to all players.<br>• <strong>Precision</strong> — your overall accuracy rate relative to the community minimum.<br><br>Your position updates after every practice and defines your league:<br>💎 Diamond · 🏅 Platinum · 🥇 Gold · 🥈 Silver · 🥉 Bronze · 🪵 Wood',

            // Liga comunidad
            'league.DIAMANTE': 'DIAMOND',
            'league.PLATINO':  'PLATINUM',
            'league.ORO':      'GOLD',
            'league.PLATA':    'SILVER',
            'league.BRONCE':   'BRONZE',
            'league.MADERA':   'WOOD',
            'league.position': 'Position',
            'league.badge':    'Your community rank',

            // Modos de juego (filtro perfil)
            'mode.all':        'All',
            'mode.timer':      'Time Attack',
            'mode.free':       'Free Practice',
            'mode.adaptive':   'Adaptive',
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
        this.updateFlagIcon();
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
        this.updateFlagIcon();
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

    // ── Toggle y bandera ────────────────────────────────────────────────────

    /**
     * Alterna entre 'es' y 'en' y actualiza el icono de bandera.
     */
    toggleLanguage() {
        const newLang = this.currentLang === 'es' ? 'en' : 'es';
        this.setLanguage(newLang);
    },

    /**
     * Actualiza el SVG de bandera en el boton de idioma.
     */
    updateFlagIcon() {
        const btn = document.getElementById('btn-lang-toggle');
        if (!btn) return;

        const flagES = '<svg viewBox="0 0 36 36" width="24" height="24">'
            + '<rect fill="#C60A1D" width="36" height="36" rx="4"/>'
            + '<rect fill="#FFC400" y="9" width="36" height="18"/>'
            + '</svg>';

        const flagEN = '<svg viewBox="0 0 36 36" width="24" height="24">'
            + '<rect fill="#012169" width="36" height="36" rx="4"/>'
            + '<path d="m0 0 36 36M36 0 0 36" stroke="#FFF" stroke-width="4"/>'
            + '<path d="m0 0 36 36M36 0 0 36" stroke="#C8102E" stroke-width="2"/>'
            + '<path d="M18 0v36M0 18h36" stroke="#FFF" stroke-width="6"/>'
            + '<path d="M18 0v36M0 18h36" stroke="#C8102E" stroke-width="4"/>'
            + '</svg>';

        btn.innerHTML = this.currentLang === 'es' ? flagES : flagEN;
        btn.title = this.currentLang === 'es' ? 'Cambiar idioma' : 'Change language';
    },

    // ── Internos ──────────────────────────────────────────────────────────────
    _updateSelector() {
        const sel = document.getElementById('lang-selector');
        if (sel) sel.value = this.currentLang;
    }
};
