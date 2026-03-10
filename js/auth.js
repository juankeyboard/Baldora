/**
 * AUTH.JS - Sistema de Autenticación con Google (Feature 14)
 * Baldora - Módulo estrictamente aditivo, no modifica funciones existentes
 */

const AuthManager = {
    currentUser: null,

    /**
     * Inicializa el sistema de autenticación
     */
    init() {
        if (typeof firebase === 'undefined') {
            console.warn('AuthManager: Firebase no disponible');
            return;
        }

        const auth = firebase.auth();
        const provider = new firebase.auth.GoogleAuthProvider();
        provider.setCustomParameters({ prompt: 'select_account' });

        // Botón: Iniciar sesión con Google
        const btnSignin = document.getElementById('btn-google-signin');
        if (btnSignin) {
            btnSignin.addEventListener('click', () => {
                auth.signInWithPopup(provider).catch(err => {
                    if (err.code !== 'auth/popup-closed-by-user') {
                        console.error('Error al iniciar sesión:', err);
                    }
                });
            });
        }

        // Botón: Cerrar sesión
        const btnSignout = document.getElementById('btn-google-signout');
        if (btnSignout) {
            btnSignout.addEventListener('click', () => {
                auth.signOut().then(() => {
                    const dropdown = document.getElementById('auth-dropdown');
                    if (dropdown) dropdown.classList.remove('open');
                }).catch(err => console.error('Error al cerrar sesión:', err));
            });
        }

        // Botón: Avatar (toggle dropdown)
        const btnUserAvatar = document.getElementById('btn-user-avatar');
        if (btnUserAvatar) {
            btnUserAvatar.addEventListener('click', (e) => {
                e.stopPropagation();
                const dropdown = document.getElementById('auth-dropdown');
                if (dropdown) dropdown.classList.toggle('open');
            });
        }

        // Botón: Mi Perfil
        const btnViewProfile = document.getElementById('btn-view-profile');
        if (btnViewProfile) {
            btnViewProfile.addEventListener('click', () => {
                const dropdown = document.getElementById('auth-dropdown');
                if (dropdown) dropdown.classList.remove('open');
                if (typeof UserProfile !== 'undefined') {
                    UserProfile.show();
                }
            });
        }

        // Cerrar dropdown al hacer clic fuera
        document.addEventListener('click', () => {
            const dropdown = document.getElementById('auth-dropdown');
            if (dropdown) dropdown.classList.remove('open');
        });

        // Escuchar cambios de estado de autenticación
        auth.onAuthStateChanged(user => {
            this.currentUser = user;
            if (user) {
                this._onLogin(user);
            } else {
                this._onLogout();
            }
        });
    },

    /**
     * Acciones cuando el usuario inicia sesión
     */
    _onLogin(user) {
        // Actualizar header: mostrar estado logueado
        const loggedOut = document.getElementById('auth-logged-out');
        const loggedIn = document.getElementById('auth-logged-in');
        if (loggedOut) loggedOut.style.display = 'none';
        if (loggedIn) loggedIn.style.display = 'flex';

        // Actualizar avatar
        const avatarImg = document.getElementById('user-avatar-img');
        if (avatarImg) {
            avatarImg.src = user.photoURL || '';
            avatarImg.alt = user.displayName || 'Usuario';
        }

        // Actualizar nombre (solo primer nombre)
        const nameEl = document.getElementById('user-display-name');
        if (nameEl) {
            const firstName = user.displayName ? user.displayName.split(' ')[0] : 'Usuario';
            nameEl.textContent = firstName;
        }

        // Ocultar campo nickname (se usa displayName de Google)
        const nicknameGroup = document.getElementById('nickname-field-group');
        if (nicknameGroup) nicknameGroup.classList.add('nickname-hidden');

        // Quitar 'required' para que el form no bloquee el submit cuando el campo está oculto
        const nicknameInput = document.getElementById('nickname');
        if (nicknameInput) nicknameInput.removeAttribute('required');

        // Actualizar nickname en DataManager para esta sesión
        if (typeof DataManager !== 'undefined') {
            DataManager.nickname = user.displayName || user.email || 'Usuario';
        }

        // Crear/actualizar perfil en la base de datos
        this._ensureUserProfile(user);

        // Si había un intento pendiente de VS, retomar automáticamente
        if (typeof App !== 'undefined' && App._pendingVsStart) {
            App._pendingVsStart = false;
            setTimeout(() => App.startGame(), 300);
        }
    },

    /**
     * Acciones cuando el usuario cierra sesión
     */
    _onLogout() {
        // Actualizar header: mostrar estado no logueado
        const loggedOut = document.getElementById('auth-logged-out');
        const loggedIn = document.getElementById('auth-logged-in');
        if (loggedOut) loggedOut.style.display = 'flex';
        if (loggedIn) loggedIn.style.display = 'none';

        // Mostrar campo nickname
        const nicknameGroup = document.getElementById('nickname-field-group');
        if (nicknameGroup) nicknameGroup.classList.remove('nickname-hidden');

        // Restaurar 'required' al volver al modo sin sesión
        const nicknameInput = document.getElementById('nickname');
        if (nicknameInput) nicknameInput.setAttribute('required', '');

        // Si estaba en perfil o tienda, volver a config (Feature 14/REQ-002)
        const profileView = document.getElementById('profile-view');
        const storeView = document.getElementById('store-view');
        const isProfileActive = profileView && profileView.classList.contains('active');
        const isStoreActive = storeView && storeView.classList.contains('active');

        if (isProfileActive || isStoreActive) {
            if (typeof App !== 'undefined') App.showView('CONFIG');
        }
    },

    /**
     * Crea o actualiza el perfil del usuario en Firebase
     */
    _ensureUserProfile(user) {
        if (!firebase.database) return;
        const db = firebase.database();
        const profileRef = db.ref(`users/${user.uid}/profile`);

        profileRef.transaction(current => {
            if (!current) {
                // Primera vez: crear perfil
                return {
                    uid: user.uid,
                    displayName: user.displayName || '',
                    email: user.email || '',
                    photoURL: user.photoURL || '',
                    createdAt: new Date().toISOString(),
                    lastLoginAt: new Date().toISOString()
                };
            }
            // Ya existe: actualizar último login y foto
            return {
                ...current,
                displayName: user.displayName || current.displayName,
                photoURL: user.photoURL || current.photoURL,
                lastLoginAt: new Date().toISOString()
            };
        }).catch(err => console.error('Error al crear perfil:', err));
    },

    /** Retorna si el usuario está autenticado */
    isLoggedIn() {
        return this.currentUser !== null;
    },

    /** Retorna el usuario actual */
    getUser() {
        return this.currentUser;
    },

    /** Retorna el UID del usuario actual */
    getUid() {
        return this.currentUser ? this.currentUser.uid : null;
    }
};

// Inicializar cuando el DOM esté listo
document.addEventListener('DOMContentLoaded', () => {
    // Delay para asegurar que Firebase esté completamente inicializado
    setTimeout(() => {
        AuthManager.init();
    }, 700);
});
