/* =============================================
   LEGAL MODULE — BaldoraLegal
   REQ-002: Politica de Privacidad + Terminos y Condiciones
   Aditivo: No modifica ningun modulo JS existente
   ============================================= */

const BaldoraLegal = {

    previousView: 'CONFIG',
    consentVersion: '1.0',

    // ---- Inicializacion ----
    init() {
        this._setupFooterLinks();
        this._setupBackButtons();
        this._setupConsentModal();
        this._listenAuthForConsent();
    },

    // ---- Navegacion a vistas legales ----
    showPrivacy() {
        this._savePreviousView();
        this._switchToView('privacy-view');
    },

    showTerms() {
        this._savePreviousView();
        this._switchToView('terms-view');
    },

    goBack() {
        const viewName = this.previousView || 'CONFIG';
        if (typeof App !== 'undefined' && typeof App.showView === 'function') {
            App.showView(viewName);
        } else {
            document.querySelectorAll('.view').forEach(v => v.classList.remove('active'));
            const viewMap = {
                'config': 'config-view',
                'playing': 'game-view',
                'dashboard': 'dashboard-view',
                'profile': 'profile-view',
                'store': 'store-view'
            };
            const target = document.getElementById(viewMap[viewName.toLowerCase()] || 'config-view');
            if (target) target.classList.add('active');
        }
    },

    _savePreviousView() {
        const activeView = document.querySelector('.view.active');
        if (activeView && activeView.id !== 'privacy-view' && activeView.id !== 'terms-view') {
            this.previousView = activeView.id.replace('-view', '').toUpperCase();
        }
    },

    _switchToView(viewId) {
        document.querySelectorAll('.view').forEach(v => v.classList.remove('active'));
        const target = document.getElementById(viewId);
        if (target) target.classList.add('active');
        // Scroll al inicio
        window.scrollTo(0, 0);
    },

    // ---- Footer Links ----
    _setupFooterLinks() {
        const privacyLink = document.getElementById('footer-link-privacy');
        const termsLink = document.getElementById('footer-link-terms');

        if (privacyLink) {
            privacyLink.addEventListener('click', (e) => {
                e.preventDefault();
                this.showPrivacy();
            });
        }

        if (termsLink) {
            termsLink.addEventListener('click', (e) => {
                e.preventDefault();
                this.showTerms();
            });
        }
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
                document.querySelectorAll('.view').forEach(v => v.classList.remove('active'));
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
