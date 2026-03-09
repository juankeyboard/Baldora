/* =============================================
   STORE MODULE — BaldoraStore
   REQ-002: Tienda para usuarios autenticados
   Aditivo: No modifica ningun modulo JS existente
   ============================================= */

const BaldoraStore = {

    // ---- Configuracion ----
    products: [
        // Productos de ejemplo (estructura lista para Shopify)
        // Descomentar y agregar productos reales cuando esten disponibles
        /*
        {
            id: "prod_001",
            name: "Cuaderno Baldora",
            description: "Cuaderno de practica con tablas de multiplicar y ejercicios.",
            price: "29.900 COP",
            image: "images/store/product_001.jpg",
            shopifyUrl: "https://tienda.shopify.com/products/cuaderno-baldora",
            available: true
        },
        */
    ],

    purchaseHistory: [],
    currentTab: 'catalog', // 'catalog' | 'history'
    previousView: 'CONFIG',

    // ---- Inicializacion ----
    init() {
        this._setupFloatingButton();
        this._setupTabs();
        this._listenAuthChanges();
    },

    // ---- Boton Flotante ----
    _setupFloatingButton() {
        const btn = document.getElementById('btn-store-float');
        if (!btn) return;

        btn.addEventListener('click', () => {
            this.show();
        });
    },

    _listenAuthChanges() {
        // Escuchar cambios de autenticacion para mostrar/ocultar boton
        if (typeof firebase !== 'undefined' && firebase.auth) {
            firebase.auth().onAuthStateChanged((user) => {
                this._toggleFloatingButton(!!user);
            });
        }
    },

    _toggleFloatingButton(visible) {
        const btn = document.getElementById('btn-store-float');
        if (!btn) return;

        if (visible) {
            btn.classList.add('visible');
        } else {
            btn.classList.remove('visible');
        }
    },

    // ---- Navegacion ----
    show() {
        if (!this.checkAuth()) return;

        // Guardar vista actual para volver
        const activeView = document.querySelector('.view.active');
        if (activeView && activeView.id !== 'store-view') {
            this.previousView = activeView.id.replace('-view', '').toUpperCase();
        }

        // Ocultar todas las vistas y mostrar tienda
        document.querySelectorAll('.view').forEach(v => v.classList.remove('active'));
        const storeView = document.getElementById('store-view');
        if (storeView) {
            storeView.classList.add('active');
        }

        this.renderCatalog();
        this.switchTab('catalog');
    },

    hide() {
        const viewName = this.previousView || 'CONFIG';
        // Usar App.showView si existe, o hacerlo manualmente
        if (typeof App !== 'undefined' && typeof App.showView === 'function') {
            App.showView(viewName);
        } else {
            document.querySelectorAll('.view').forEach(v => v.classList.remove('active'));
            const targetId = viewName.toLowerCase() + '-view';
            // Mapear nombres a IDs
            const viewMap = {
                'config': 'config-view',
                'playing': 'game-view',
                'dashboard': 'dashboard-view',
                'profile': 'profile-view'
            };
            const target = document.getElementById(viewMap[viewName.toLowerCase()] || 'config-view');
            if (target) target.classList.add('active');
        }
    },

    // ---- Proteccion de Acceso ----
    checkAuth() {
        if (typeof firebase === 'undefined' || !firebase.auth) return false;
        const user = firebase.auth().currentUser;
        if (!user) {
            // Redirigir a config si no hay sesion
            document.querySelectorAll('.view').forEach(v => v.classList.remove('active'));
            const configView = document.getElementById('config-view');
            if (configView) configView.classList.add('active');
            return false;
        }
        return true;
    },

    // ---- Tabs ----
    _setupTabs() {
        const tabCatalog = document.getElementById('store-tab-catalog');
        const tabHistory = document.getElementById('store-tab-history');

        if (tabCatalog) {
            tabCatalog.addEventListener('click', () => this.switchTab('catalog'));
        }
        if (tabHistory) {
            tabHistory.addEventListener('click', () => this.switchTab('history'));
        }
    },

    switchTab(tab) {
        this.currentTab = tab;

        // Actualizar tabs activos
        document.querySelectorAll('.store-tab').forEach(t => t.classList.remove('active'));
        const activeTab = document.getElementById('store-tab-' + tab);
        if (activeTab) activeTab.classList.add('active');

        // Mostrar seccion correspondiente
        const catalogSection = document.querySelector('.store-catalog-section');
        const historySection = document.querySelector('.store-history-section');

        if (catalogSection) {
            catalogSection.classList.toggle('active', tab === 'catalog');
        }
        if (historySection) {
            historySection.classList.toggle('active', tab === 'history');
        }

        if (tab === 'history') {
            this.renderHistory();
        }
    },

    // ---- Renderizado de Catalogo ----
    renderCatalog() {
        const grid = document.querySelector('.store-products-grid');
        if (!grid) return;

        grid.innerHTML = '';

        if (this.products.length === 0) {
            grid.innerHTML = this._emptyStateHTML('catalog');
            return;
        }

        this.products.forEach(product => {
            grid.insertAdjacentHTML('beforeend', this._productCardHTML(product));
        });
    },

    _productCardHTML(product) {
        const imageHTML = product.image
            ? `<img class="store-product-image" src="${product.image}" alt="${product.name}" loading="lazy">`
            : `<div class="store-product-image-placeholder">
                <svg width="48" height="48" viewBox="0 0 24 24" fill="currentColor" opacity="0.4">
                    <path d="M21 19V5c0-1.1-.9-2-2-2H5c-1.1 0-2 .9-2 2v14c0 1.1.9 2 2 2h14c1.1 0 2-.9 2-2zM8.5 13.5l2.5 3.01L14.5 12l4.5 6H5l3.5-4.5z"/>
                </svg>
               </div>`;

        const buyBtnClass = product.available && product.shopifyUrl ? 'btn-store-buy' : 'btn-store-buy disabled';
        const buyHref = product.shopifyUrl || '#';

        return `
            <div class="store-product-card">
                ${imageHTML}
                <div class="store-product-body">
                    <h3 class="store-product-name">${product.name}</h3>
                    <p class="store-product-desc">${product.description}</p>
                    <div class="store-product-footer">
                        <span class="store-product-price">${product.price}</span>
                        <a href="${buyHref}" target="_blank" rel="noopener noreferrer" class="${buyBtnClass}">Comprar</a>
                    </div>
                </div>
            </div>
        `;
    },

    // ---- Renderizado de Historial ----
    renderHistory() {
        const list = document.querySelector('.store-history-list');
        if (!list) return;

        list.innerHTML = '';

        // Cargar historial del usuario actual
        this.loadHistory().then(() => {
            if (this.purchaseHistory.length === 0) {
                list.innerHTML = this._emptyStateHTML('history');
                return;
            }

            // Ordenar por fecha descendente
            const sorted = [...this.purchaseHistory].sort((a, b) =>
                new Date(b.date) - new Date(a.date)
            );

            sorted.forEach(item => {
                list.insertAdjacentHTML('beforeend', this._historyItemHTML(item));
            });
        });
    },

    _historyItemHTML(item) {
        const date = new Date(item.date);
        const dateStr = date.toLocaleDateString('es-CO', {
            year: 'numeric', month: 'short', day: 'numeric'
        });

        const statusLabels = {
            completed: 'Completada',
            pending: 'Pendiente',
            cancelled: 'Cancelada'
        };

        const statusLabel = statusLabels[item.status] || item.status;

        const linkHTML = item.shopifyOrderUrl
            ? `<a href="${item.shopifyOrderUrl}" target="_blank" rel="noopener noreferrer" class="store-history-link">Ver pedido</a>`
            : '';

        return `
            <div class="store-history-item">
                <span class="store-history-product">${item.productName}</span>
                <span class="store-history-date">${dateStr}</span>
                <span class="store-history-status ${item.status}">${statusLabel}</span>
                ${linkHTML}
            </div>
        `;
    },

    // ---- Carga de Datos ----
    loadProducts() {
        // Placeholder: en el futuro, cargar desde Shopify API o Firebase
        // Por ahora usa el array estatico this.products
        return Promise.resolve(this.products);
    },

    loadHistory() {
        // Placeholder: en el futuro, cargar desde Shopify/Firebase
        if (typeof firebase === 'undefined' || !firebase.auth || !firebase.auth().currentUser) {
            this.purchaseHistory = [];
            return Promise.resolve([]);
        }

        const userId = firebase.auth().currentUser.uid;
        const dbRef = firebase.database().ref('users/' + userId + '/purchaseHistory');

        return dbRef.once('value').then(snapshot => {
            const data = snapshot.val();
            if (data) {
                this.purchaseHistory = Array.isArray(data) ? data : Object.values(data);
            } else {
                this.purchaseHistory = [];
            }
            return this.purchaseHistory;
        }).catch(() => {
            this.purchaseHistory = [];
            return [];
        });
    },

    // ---- Estados Vacios ----
    _emptyStateHTML(type) {
        if (type === 'catalog') {
            return `
                <div class="store-empty-state" style="grid-column: 1 / -1;">
                    <div class="empty-icon">
                        <svg width="64" height="64" viewBox="0 0 24 24" fill="currentColor" opacity="0.3">
                            <path d="M7 18c-1.1 0-1.99.9-1.99 2S5.9 22 7 22s2-.9 2-2-.9-2-2-2zM1 2v2h2l3.6 7.59-1.35 2.45c-.16.28-.25.61-.25.96 0 1.1.9 2 2 2h12v-2H7.42c-.14 0-.25-.11-.25-.25l.03-.12.9-1.63h7.45c.75 0 1.41-.41 1.75-1.03l3.58-6.49c.08-.14.12-.31.12-.48 0-.55-.45-1-1-1H5.21l-.94-2H1zm16 16c-1.1 0-1.99.9-1.99 2s.89 2 1.99 2 2-.9 2-2-.9-2-2-2z"/>
                        </svg>
                    </div>
                    <p>Proximamente habra productos disponibles.</p>
                    <p style="font-size: 0.85rem; margin-top: 8px; opacity: 0.7;">Estamos preparando algo especial para ti.</p>
                </div>
            `;
        }

        return `
            <div class="store-empty-state">
                <div class="empty-icon">
                    <svg width="64" height="64" viewBox="0 0 24 24" fill="currentColor" opacity="0.3">
                        <path d="M13 3c-4.97 0-9 4.03-9 9H1l3.89 3.89.07.14L9 12H6c0-3.87 3.13-7 7-7s7 3.13 7 7-3.13 7-7 7c-1.93 0-3.68-.79-4.94-2.06l-1.42 1.42C8.27 19.99 10.51 21 13 21c4.97 0 9-4.03 9-9s-4.03-9-9-9zm-1 5v5l4.28 2.54.72-1.21-3.5-2.08V8H12z"/>
                    </svg>
                </div>
                <p>Aun no tienes compras registradas.</p>
                <p style="font-size: 0.85rem; margin-top: 8px; opacity: 0.7;">Cuando realices una compra, aparecera aqui.</p>
            </div>
        `;
    }
};

// Inicializar cuando el DOM este listo
document.addEventListener('DOMContentLoaded', () => {
    BaldoraStore.init();
});
