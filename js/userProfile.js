/**
 * USERPROFILE.JS - Vista de Perfil e Historial (Feature 14)
 * Baldora - Módulo estrictamente aditivo
 */

const UserProfile = {
    games: [],
    filteredGames: [],

    /**
     * Muestra la vista de perfil y carga los datos
     */
    show() {
        if (!AuthManager.isLoggedIn()) return;
        if (typeof App !== 'undefined') App.showView('PROFILE');
        this.load();
        // Onboarding de perfil: se dispara solo en la primera visita
        if (typeof Onboarding !== 'undefined') {
            Onboarding.checkAndStartProfileTour();
        }
    },

    /**
     * Carga los datos del perfil desde Firebase
     */
    async load() {
        const uid = AuthManager.getUid();
        if (!uid || !firebase.database) return;

        const db = firebase.database();

        // Mostrar loading
        this._setLoading(true);

        try {
            // Cargar perfil y stats en paralelo
            const [profileSnap, statsSnap, gamesSnap] = await Promise.all([
                db.ref(`users/${uid}/profile`).once('value'),
                db.ref(`users/${uid}/stats`).once('value'),
                db.ref(`users/${uid}/games`).orderByChild('timestamp').once('value')
            ]);

            const profile = profileSnap.val() || {};
            const stats = statsSnap.val() || {};

            // Convertir games snapshot a array (más recientes primero)
            this.games = [];
            gamesSnap.forEach(snap => {
                this.games.unshift({ id: snap.key, ...snap.val() });
            });
            this.filteredGames = [...this.games];

            // Contar todas las prácticas reales (no desde stats, que puede estar desactualizado por eliminaciones)
            const actualGameCount = gamesSnap.numChildren();

            // Auto-rellenar fechas de filtro con el rango real de prácticas
            this._setDefaultDateFilters();

            // Renderizar
            this._renderProfileHeader(profile, stats, actualGameCount);
            this._renderStats(stats);
            this._renderGamesTable(this.filteredGames);
            await this._renderCommunityScore(uid, stats);

        } catch (err) {
            console.error('Error al cargar perfil:', err);
        } finally {
            this._setLoading(false);
        }
    },

    /**
     * Aplica filtros a la lista de prácticas
     */
    applyFilters() {
        const modeFilter = document.getElementById('filter-mode')?.value || 'ALL';
        const dateFromFilter = document.getElementById('filter-date-from')?.value || '';
        const dateToFilter = document.getElementById('filter-date-to')?.value || '';

        this.filteredGames = this.games.filter(game => {
            // Filtro por modo
            if (modeFilter !== 'ALL' && game.game_mode !== modeFilter) return false;

            // Filtro por fecha desde
            if (dateFromFilter) {
                const gameDate = new Date(game.timestamp);
                const fromDate = new Date(dateFromFilter);
                if (gameDate < fromDate) return false;
            }

            // Filtro por fecha hasta
            if (dateToFilter) {
                const gameDate = new Date(game.timestamp);
                const toDate = new Date(dateToFilter);
                toDate.setHours(23, 59, 59);
                if (gameDate > toDate) return false;
            }

            return true;
        });

        this._renderGamesTable(this.filteredGames);
    },

    /**
     * Reinicia los filtros
     */
    resetFilters() {
        const modeFilter = document.getElementById('filter-mode');
        const dateFrom = document.getElementById('filter-date-from');
        const dateTo = document.getElementById('filter-date-to');
        if (modeFilter) modeFilter.value = 'ALL';
        if (dateFrom) dateFrom.value = '';
        if (dateTo) dateTo.value = '';
        this.filteredGames = [...this.games];
        this._renderGamesTable(this.filteredGames);
    },

    // ============================================================
    // RENDERIZADO
    // ============================================================

    _renderProfileHeader(profile, stats, actualCount) {
        const user = AuthManager.getUser();
        if (!user) return;

        const photoEl = document.getElementById('profile-avatar');
        if (photoEl) photoEl.src = user.photoURL || '';

        const nameEl = document.getElementById('profile-name');
        if (nameEl) nameEl.textContent = user.displayName || 'Usuario';

        const emailEl = document.getElementById('profile-email');
        if (emailEl) emailEl.textContent = user.email || '';

        // Usar el conteo real desde la DB (no desde stats, que no descuenta eliminadas)
        const gamesEl = document.getElementById('profile-total-games');
        if (gamesEl) gamesEl.textContent = actualCount !== undefined ? actualCount : (stats.total_games || 0);

        const memberEl = document.getElementById('profile-member-since');
        if (memberEl && profile.createdAt) {
            const date = new Date(profile.createdAt);
            memberEl.textContent = date.toLocaleDateString('es-ES', { year: 'numeric', month: 'long' });
        }
    },

    _renderStats(stats) {
        const fields = {
            'pstat-total-correct': stats.total_correct || 0,
            'pstat-accuracy': `${stats.global_accuracy || 0}%`,
            'pstat-avg-time': `${stats.avg_response_time || 0}ms`,
            'pstat-best-accuracy': `${stats.best_accuracy || 0}%`,
            'pstat-community-score': stats.community_score || 0
        };

        for (const [id, val] of Object.entries(fields)) {
            const el = document.getElementById(id);
            if (el) el.textContent = val;
        }
    },

    _renderGamesTable(games) {
        const tbody = document.getElementById('profile-games-tbody');
        if (!tbody) return;

        if (games.length === 0) {
            tbody.innerHTML = '<tr><td colspan="7" class="profile-empty-row">No hay prácticas con los filtros seleccionados</td></tr>';
            return;
        }

        tbody.innerHTML = games.map((game, index) => {
            const date = new Date(game.timestamp);
            const dateStr = date.toLocaleDateString('es-ES', {
                day: '2-digit', month: '2-digit', year: 'numeric'
            });
            const timeStr = date.toLocaleTimeString('es-ES', {
                hour: '2-digit', minute: '2-digit'
            });

            const modeLabel = {
                'TIMER': 'Contrarreloj',
                'FREE': 'Práctica Libre',
                'ADAPTIVE': 'Adaptativo',
                'BATTLE': 'Duelo VS'
            }[game.game_mode] || game.game_mode;

            const aiCell = game.ai_analysis
                ? `<button class="btn-ai-view" onclick="UserProfile.toggleAiAnalysis('row-ai-${index}')">&#129504; Ver análisis</button>`
                : `<button class="btn-analyze-game" onclick="UserProfile.analyzeGame('${game.id}', ${index})">Analizar</button>`;

            return `
                <tr>
                    <td>${dateStr}<br><small>${timeStr}</small></td>
                    <td><span class="mode-badge mode-${game.game_mode?.toLowerCase()}">${modeLabel}</span></td>
                    <td>${game.total_operations || 0}</td>
                    <td>${game.correct_operations || 0}</td>
                    <td>${game.accuracy || 0}%</td>
                    <td>${game.avg_response_time || 0}ms</td>
                    <td class="game-actions-cell">
                        ${aiCell}
                        <button class="btn-delete-game" title="Eliminar registro"
                            onclick="UserProfile.showDeleteConfirm('${game.id}')">&#128465;</button>
                    </td>
                </tr>
                <tr id="row-ai-${index}" class="ai-analysis-row" style="display:none;">
                    <td colspan="7">
                        <div class="ai-analysis-content">
                            ${game.ai_analysis ? this._renderAiContent(game.ai_analysis) : '<p>Cargando análisis...</p>'}
                        </div>
                    </td>
                </tr>
            `;
        }).join('');
    },

    _renderAiContent(analysis) {
        return `
            <div class="ai-history-cards">
                ${analysis.resumen_general ? `<div class="ai-history-card"><strong>&#128202; Resumen</strong><p>${analysis.resumen_general}</p></div>` : ''}
                ${analysis.patron_errores ? `<div class="ai-history-card"><strong>&#9888;&#65039; Patrones</strong><p>${analysis.patron_errores}</p></div>` : ''}
                ${analysis.plan_accion ? `<div class="ai-history-card"><strong>&#128640; Plan</strong><p>${analysis.plan_accion}</p></div>` : ''}
                ${analysis.sugerencia_entrenamiento ? `<div class="ai-history-card"><strong>&#9881;&#65039; Entrenamiento</strong><p>${analysis.sugerencia_entrenamiento}</p></div>` : ''}
            </div>
        `;
    },

    async _renderCommunityScore(uid, stats) {
        const badgeEl = document.getElementById('community-badge-container');
        if (!badgeEl) return;

        const t = (key) => (typeof I18n !== 'undefined') ? I18n.t(key) : key;

        try {
            // 1. Intentar usar datos ya presentes en el objeto stats
            let tier = stats.community_tier;
            let league = stats.community_league;

            // 2. Si no están en stats (legacy o delay), intentar buscarlos en el leaderboard directamente para este UID
            if (!tier || !league) {
                const db = firebase.database();
                const playerSnap = await db.ref(`leaderboard/players/${uid}`).once('value');
                const playerData = playerSnap.val();
                if (playerData) {
                    tier = playerData.tier;
                    league = playerData.league;
                }
            }

            // 3. Renderizar según disponibilidad de datos
            if (tier && league) {
                const icon = this._leagueToIcon(league);
                badgeEl.className = `community-badge league-${league.toLowerCase()}`;
                badgeEl.innerHTML = `
                    <span class="community-league-icon">${icon}</span>
                    <div class="community-position-wrap">
                        <span class="community-position-label">${t('league.position')}</span>
                        <span class="community-position-number">${tier}</span>
                    </div>
                    <span class="community-league-name">${t('league.' + league)}</span>
                    <span class="community-badge-label">${t('league.badge')}</span>
                `;
            } else {
                // Estado: Sin clasificar (el usuario aún no ha guardado partidas competitivas)
                badgeEl.className = `community-badge league-madera`;
                badgeEl.innerHTML = `
                    <span class="community-league-icon">🎮</span>
                    <div class="community-position-wrap">
                        <span class="community-position-label">${t('league.position')}</span>
                        <span class="community-position-number">—</span>
                    </div>
                    <span class="community-league-name">SIN LIGA</span>
                    <span class="community-badge-label">Guarda una partida para calificar</span>
                `;
            }

        } catch (err) {
            console.error('Error al renderizar posición en comunidad:', err);
            badgeEl.innerHTML = `<span class="community-badge-label">Error al cargar datos</span>`;
        }
    },

    _leagueToIcon(league) {
        const icons = {
            'DIAMANTE': '💎',
            'PLATINO':  '🏅',
            'ORO':      '🥇',
            'PLATA':    '🥈',
            'BRONCE':   '🥉',
            'MADERA':   '🪵'
        };
        return icons[league] || '🎮';
    },

    _tierToLeague(tier) {
        if (tier <= 5)  return 'DIAMANTE';
        if (tier <= 15) return 'PLATINO';
        if (tier <= 30) return 'ORO';
        if (tier <= 50) return 'PLATA';
        if (tier <= 70) return 'BRONCE';
        return 'MADERA';
    },

    // ============================================================
    // ACCIONES
    // ============================================================

    toggleAiAnalysis(rowId) {
        const row = document.getElementById(rowId);
        if (!row) return;
        row.style.display = row.style.display === 'none' ? 'table-row' : 'none';
    },

    /**
     * Analiza una práctica específica del historial usando GeminiService
     */
    async analyzeGame(gameId, rowIndex) {
        const game = this.games.find(g => g.id === gameId);
        if (!game || !game.attempts) return;

        const btn = document.querySelector(`button[onclick="UserProfile.analyzeGame('${gameId}', ${rowIndex})"]`);
        if (btn) {
            btn.textContent = 'Analizando...';
            btn.disabled = true;
        }

        // Preparar CSV para GeminiService
        const csvRows = game.attempts.map(a =>
            `${a.factor_a},${a.factor_b},${a.user_input},${a.correct_result},${a.is_correct ? 1 : 0},${a.response_time}`
        ).join('\n');
        const csvData = `factor_a,factor_b,user_input,correct_result,is_correct,response_time\n${csvRows}`;

        try {
            if (typeof GeminiService === 'undefined') throw new Error('GeminiService no disponible');

            // Usar GeminiService para analizar
            const result = await GeminiService.analyzeHistoricalGame(csvData, game);

            if (result) {
                // Guardar análisis en la DB
                const db = firebase.database();
                const uid = AuthManager.getUid();
                await db.ref(`users/${uid}/games/${gameId}/ai_analysis`).set({
                    generated_at: new Date().toISOString(),
                    ...result
                });

                // Actualizar en memoria y re-renderizar
                game.ai_analysis = { generated_at: new Date().toISOString(), ...result };
                this._renderGamesTable(this.filteredGames);
            }
        } catch (err) {
            console.error('Error al analizar práctica:', err);
            if (btn) {
                btn.textContent = 'Error - Reintentar';
                btn.disabled = false;
            }
        }
    },

    // ── Eliminación de prácticas ──

    _pendingDeleteId: null,

    showDeleteConfirm(gameId) {
        this._pendingDeleteId = gameId;
        const check = document.getElementById('delete-confirm-check');
        const btn = document.getElementById('btn-confirm-delete');
        const modal = document.getElementById('delete-game-modal');
        if (check) check.checked = false;
        if (btn) btn.disabled = true;
        if (modal) modal.style.display = 'flex';
    },

    cancelDelete() {
        this._pendingDeleteId = null;
        const modal = document.getElementById('delete-game-modal');
        if (modal) modal.style.display = 'none';
    },

    _toggleDeleteBtn() {
        const check = document.getElementById('delete-confirm-check');
        const btn = document.getElementById('btn-confirm-delete');
        if (check && btn) btn.disabled = !check.checked;
    },

    async confirmDelete() {
        const gameId = this._pendingDeleteId;
        if (!gameId) return;
        this.cancelDelete();
        await this._deleteGame(gameId);
    },

    async _deleteGame(gameId) {
        const uid = AuthManager.getUid();
        if (!uid) return;
        try {
            const db = firebase.database();
            await db.ref(`users/${uid}/games/${gameId}`).remove();
            // Mantener stats.total_games sincronizado con las prácticas reales
            await db.ref(`users/${uid}/stats/total_games`).transaction(count => Math.max(0, (count || 1) - 1));
            // Recargar perfil para recalcular stats y comunidad
            await this.load();
        } catch (err) {
            console.error('Error al eliminar práctica:', err);
        }
    },

    _setDefaultDateFilters() {
        if (this.games.length === 0) return;
        // games está ordenado más-reciente primero; el último elemento es el más antiguo
        const oldest = this.games[this.games.length - 1];
        const newest = this.games[0];
        const dateFrom = document.getElementById('filter-date-from');
        const dateTo = document.getElementById('filter-date-to');
        if (dateFrom && oldest.timestamp) {
            dateFrom.value = new Date(oldest.timestamp).toISOString().split('T')[0];
        }
        if (dateTo && newest.timestamp) {
            dateTo.value = new Date(newest.timestamp).toISOString().split('T')[0];
        }
    },

    _setLoading(isLoading) {
        const loader = document.getElementById('profile-loading');
        const content = document.getElementById('profile-content');
        if (loader) loader.style.display = isLoading ? 'flex' : 'none';
        if (content) content.style.display = isLoading ? 'none' : 'block';
    }
};

