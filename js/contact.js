/* =============================================
   CONTACT MODULE — BaldoraContact
   f20: Vista de Contacto con formulario seguro
   Destino: juankeyboard@gmail.com
   Cumplimiento: Ley 1581/2012 (Colombia)
   Aditivo: No modifica ningun modulo JS existente
   ============================================= */

const BaldoraContact = {

    // ─── Configuracion EmailJS ────────────────────────────────────────────
    // Para activar el envio de email:
    //   1. Crear cuenta gratuita en https://www.emailjs.com/
    //   2. Conectar servicio Gmail con juankeyboard@gmail.com
    //   3. Crear plantilla con variables: {{from_name}}, {{from_email}},
    //      {{subject}}, {{message}}
    //   4. Llenar los tres campos de abajo con tus credenciales
    EMAILJS_CONFIG: {
        PUBLIC_KEY:  '',   // ej. 'user_xxxxxxxxxxxx'
        SERVICE_ID:  '',   // ej. 'service_gmail'
        TEMPLATE_ID: '',   // ej. 'template_contacto'
    },

    RECIPIENT_EMAIL: 'juankeyboard@gmail.com',

    // Vista previa para volver al cerrar
    previousView: 'CONFIG',

    _viewCache: null,
    /**
     * Cachea las vistas para mejor rendimiento (⚡ Bolt optimization)
     */
    _getViewCache() {
        if (!this._viewCache) {
            this._viewCache = Array.from(document.querySelectorAll('.view'));
        }
        return this._viewCache;
    },

    // ─── Inicializacion ───────────────────────────────────────────────────
    init() {
        this._setupFooterLink();
        this._setupForm();
        this._initEmailJS();
    },

    _initEmailJS() {
        const { PUBLIC_KEY } = this.EMAILJS_CONFIG;
        if (PUBLIC_KEY && typeof emailjs !== 'undefined') {
            emailjs.init(PUBLIC_KEY);
        }
    },

    // ─── Navegacion ───────────────────────────────────────────────────────
    show() {
        // Guardar vista actual antes de navegar
        const activeView = document.querySelector('.view.active');
        if (activeView && activeView.id !== 'contact-view') {
            this.previousView = activeView.id
                .replace('-view', '')
                .toUpperCase();
        }

        // Activar vista de contacto
        this._getViewCache().forEach(v => v.classList.remove('active'));
        const view = document.getElementById('contact-view');
        if (view) view.classList.add('active');

        // Ocultar boton de ayuda
        const helpBtn = document.getElementById('btn-help-tour');
        if (helpBtn) helpBtn.style.display = 'none';

        window.scrollTo(0, 0);
        this._resetStatus();
    },

    hide() {
        if (typeof App !== 'undefined') {
            App.showView(this.previousView || 'CONFIG');
        } else {
            // Fallback si App no esta disponible
            this._getViewCache().forEach(v => v.classList.remove('active'));
            const configView = document.getElementById('config-view');
            if (configView) configView.classList.add('active');
        }
    },

    // Navegar a privacidad recordando que venimos de contacto
    _showPrivacy() {
        this.previousView = 'CONTACT';
        if (typeof BaldoraLegal !== 'undefined') {
            BaldoraLegal.showPrivacy();
        }
    },

    // ─── Setup de listeners ───────────────────────────────────────────────
    _setupFooterLink() {
        const link = document.getElementById('footer-link-contact');
        if (!link) return;
        link.addEventListener('click', (e) => {
            e.preventDefault();
            this.show();
        });
    },

    _setupForm() {
        const form = document.getElementById('contact-form');
        if (!form) return;

        // Contador de caracteres del textarea
        const textarea = document.getElementById('contact-message');
        const counter  = document.getElementById('contact-char-counter');
        if (textarea && counter) {
            textarea.addEventListener('input', () => {
                const len = textarea.value.length;
                counter.textContent = `${len} / 2000`;
                counter.classList.toggle('char-limit', len >= 1900);
            });
        }

        // Submit
        form.addEventListener('submit', (e) => {
            e.preventDefault();
            this._handleSubmit();
        });
    },

    // ─── Manejo del envio ─────────────────────────────────────────────────
    _handleSubmit() {
        this._resetStatus();

        if (!this._validate()) return;

        const data = this._collectData();
        this._setLoading(true);

        // 1) Guardar en Firebase (siempre, sin importar EmailJS)
        this._saveToFirebase(data)
            .then(() => {
                // 2) Intentar envio por email (solo si EmailJS esta configurado)
                return this._sendEmail(data);
            })
            .then(() => {
                this._setLoading(false);
                this._showSuccess();
                this._resetForm();
            })
            .catch((err) => {
                console.error('[BaldoraContact] Error al enviar:', err);
                this._setLoading(false);
                this._showError('Hubo un problema al enviar tu mensaje. Intenta de nuevo.');
            });
    },

    _validate() {
        const name    = document.getElementById('contact-name').value.trim();
        const email   = document.getElementById('contact-email').value.trim();
        const subject = document.getElementById('contact-subject').value;
        const message = document.getElementById('contact-message').value.trim();
        const consent = document.getElementById('contact-consent-required').checked;

        if (!name || !email || !subject || !message) {
            this._showError('Por favor completa todos los campos obligatorios.');
            return false;
        }

        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        if (!emailRegex.test(email)) {
            this._showError('El correo electronico no es valido.');
            return false;
        }

        if (!consent) {
            this._showError('Debes autorizar el tratamiento de tus datos para enviar el mensaje.');
            return false;
        }

        return true;
    },

    _collectData() {
        return {
            from_name:        document.getElementById('contact-name').value.trim(),
            from_email:       document.getElementById('contact-email').value.trim(),
            subject:          document.getElementById('contact-subject').value,
            message:          document.getElementById('contact-message').value.trim(),
            marketing_consent: document.getElementById('contact-consent-marketing').checked,
            to_email:         this.RECIPIENT_EMAIL,
            timestamp:        new Date().toISOString(),
        };
    },

    // ─── Firebase ─────────────────────────────────────────────────────────
    _saveToFirebase(data) {
        if (typeof firebase === 'undefined' || !firebase.database) {
            return Promise.resolve();
        }

        const entry = {
            nombre:           data.from_name,
            email:            data.from_email,
            motivo:           data.subject,
            mensaje:          data.message,
            marketingConsent: data.marketing_consent,
            timestamp:        data.timestamp,
            source:           'web_contact_form',
        };

        return firebase.database().ref('contacts').push(entry);
    },

    // ─── EmailJS ──────────────────────────────────────────────────────────
    _sendEmail(data) {
        const { PUBLIC_KEY, SERVICE_ID, TEMPLATE_ID } = this.EMAILJS_CONFIG;

        // Sin credenciales: modo Firebase-only, se considera exito
        if (!PUBLIC_KEY || !SERVICE_ID || !TEMPLATE_ID) {
            return Promise.resolve();
        }

        if (typeof emailjs === 'undefined') {
            console.warn('[BaldoraContact] EmailJS SDK no cargado.');
            return Promise.resolve();
        }

        return emailjs.send(SERVICE_ID, TEMPLATE_ID, {
            from_name:  data.from_name,
            from_email: data.from_email,
            subject:    data.subject,
            message:    data.message,
            to_email:   data.to_email,
        });
    },

    // ─── Helpers de UI ────────────────────────────────────────────────────
    _setLoading(loading) {
        const btn     = document.getElementById('btn-contact-submit');
        const btnText = btn ? btn.querySelector('.btn-text') : null;
        const spinner = btn ? btn.querySelector('.btn-spinner') : null;

        if (!btn) return;
        btn.disabled = loading;
        if (btnText) btnText.hidden = loading;
        if (spinner) spinner.hidden = !loading;
    },

    _showSuccess() {
        const success = document.getElementById('contact-success');
        const error   = document.getElementById('contact-error');
        if (success) success.hidden = false;
        if (error)   error.hidden   = true;
    },

    _showError(msg) {
        const error    = document.getElementById('contact-error');
        const errText  = document.getElementById('contact-error-text');
        const success  = document.getElementById('contact-success');
        if (errText) errText.textContent = msg;
        if (error)   error.hidden   = false;
        if (success) success.hidden = true;
    },

    _resetStatus() {
        const success = document.getElementById('contact-success');
        const error   = document.getElementById('contact-error');
        if (success) success.hidden = true;
        if (error)   error.hidden   = true;
    },

    _resetForm() {
        const form    = document.getElementById('contact-form');
        const counter = document.getElementById('contact-char-counter');
        if (form)    form.reset();
        if (counter) counter.textContent = '0 / 2000';
    },

};

// Auto-inicializacion al cargar el DOM
document.addEventListener('DOMContentLoaded', () => {
    BaldoraContact.init();
});
