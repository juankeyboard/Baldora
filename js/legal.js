/* =============================================
   LEGAL MODULE — BaldoraLegal
   REQ-002: Politica de Privacidad + Terminos y Condiciones
   Aditivo: No modifica ningun modulo JS existente
   ============================================= */

const BaldoraLegal = {

    previousView: 'CONFIG',
    consentVersion: '1.0',
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

    // ---- Inicializacion ----
    init() {
        this._setupFooterLinks();
        this._setupBackButtons();
        this._setupConsentModal();
        this._listenAuthForConsent();
    },

    // ---- Navegacion a vistas legales ----
    showPrivacy() {
        if (typeof App !== 'undefined') {
            App.showView('PRIVACY');
            window.scrollTo(0, 0);
        }
    },

    showTerms() {
        if (typeof App !== 'undefined') {
            App.showView('TERMS');
            window.scrollTo(0, 0);
        }
    },

    goBack() {
        if (typeof App !== 'undefined') {
            const viewName = App.previousView || 'CONFIG';
            App.showView(viewName);
        } else {
            // Fallback si App no esta disponible
            this._switchToView('config-view');
        }
    },

    _savePreviousView() {
        const activeView = document.querySelector('.view.active');
        if (activeView && activeView.id !== 'privacy-view' && activeView.id !== 'terms-view') {
            this.previousView = activeView.id.replace('-view', '').toUpperCase();
        }
    },

    _switchToView(viewId) {
        this._getViewCache().forEach(v => v.classList.remove('active'));
        const target = document.getElementById(viewId);
        if (target) target.classList.add('active');
        // Scroll al inicio
        window.scrollTo(0, 0);
    },

    // ---- Footer & Modal Links ----
    _setupFooterLinks() {
        const privacyLinks = [
            document.getElementById('footer-link-privacy'),
            document.getElementById('consent-link-privacy')
        ];
        const termsLinks = [
            document.getElementById('footer-link-terms'),
            document.getElementById('consent-link-terms')
        ];

        privacyLinks.forEach(link => {
            if (link) {
                link.addEventListener('click', (e) => {
                    e.preventDefault();
                    this.showPrivacy();
                });
            }
        });

        termsLinks.forEach(link => {
            if (link) {
                link.addEventListener('click', (e) => {
                    e.preventDefault();
                    this.showTerms();
                });
            }
        });
    },

    // ---- Back Buttons ----
    _setupBackButtons() {
        document.querySelectorAll('.btn-back-legal').forEach(btn => {
            btn.addEventListener('click', () => this.goBack());
        });
    },

    // ---- Modal de Consentimiento ----
    _setupConsentModal() {
        const checkbox = document.getElementById('consent-check');
        const acceptBtn = document.getElementById('btn-consent-accept');
        const declineBtn = document.getElementById('btn-consent-decline');

        if (checkbox && acceptBtn) {
            checkbox.addEventListener('change', () => {
                acceptBtn.disabled = !checkbox.checked;
            });
        }

        if (acceptBtn) {
            acceptBtn.addEventListener('click', () => this._acceptConsent());
        }

        if (declineBtn) {
            declineBtn.addEventListener('click', () => this._declineConsent());
        }
    },

    _listenAuthForConsent() {
        if (typeof firebase === 'undefined' || !firebase.auth) return;

        firebase.auth().onAuthStateChanged((user) => {
            if (user) {
                this._checkConsentStatus(user.uid);
            }
        });
    },

    _checkConsentStatus(userId) {
        const dbRef = firebase.database().ref('users/' + userId + '/consent');

        dbRef.once('value').then(snapshot => {
            const consent = snapshot.val();
            if (!consent || !consent.accepted) {
                this._showConsentModal();
            }
        }).catch(() => {
            // En caso de error, mostrar modal por precaucion
            this._showConsentModal();
        });
    },

    _showConsentModal() {
        const modal = document.getElementById('consent-modal');
        if (!modal) return;

        // Reset estado
        const checkbox = document.getElementById('consent-check');
        const acceptBtn = document.getElementById('btn-consent-accept');
        if (checkbox) checkbox.checked = false;
        if (acceptBtn) acceptBtn.disabled = true;

        modal.classList.add('active');
    },

    _hideConsentModal() {
        const modal = document.getElementById('consent-modal');
        if (modal) modal.classList.remove('active');
    },

    _acceptConsent() {
        if (typeof firebase === 'undefined' || !firebase.auth || !firebase.auth().currentUser) return;

        const userId = firebase.auth().currentUser.uid;
        const consentData = {
            accepted: true,
            timestamp: new Date().toISOString(),
            version: this.consentVersion
        };

        firebase.database().ref('users/' + userId + '/consent').set(consentData)
            .then(() => {
                this._hideConsentModal();
            })
            .catch((err) => {
                console.error('Error guardando consentimiento:', err);
                // Cerrar modal de todas formas para no bloquear
                this._hideConsentModal();
            });
    },

    _declineConsent() {
        this._hideConsentModal();

        // Cerrar sesion si el usuario no acepta
        if (typeof firebase !== 'undefined' && firebase.auth) {
            firebase.auth().signOut().then(() => {
                // Redirigir a config
                this._getViewCache().forEach(v => v.classList.remove('active'));
                const configView = document.getElementById('config-view');
                if (configView) configView.classList.add('active');
            });
        }
    }
};

// Inicializar cuando el DOM este listo
document.addEventListener('DOMContentLoaded', () => {
    BaldoraLegal.init();
});
