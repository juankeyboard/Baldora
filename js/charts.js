/**
 * CHARTS.JS - Configuración de gráficas con Chart.js
 * Baldora
 */

const ChartsManager = {
    charts: {},
    contexts: {}, // ⚡ Bolt: Cache canvas 2D contexts to avoid expensive DOM queries during re-renders

    colors: {
        primary: '#6366f1',
        secondary: '#8b5cf6',
        success: '#22c55e',
        warning: '#f59e0b',
        error: '#ef4444',
        text: '#a0a0b0',
        grid: 'rgba(255, 255, 255, 0.1)'
    },

    defaultOptions: {
        responsive: true,
        maintainAspectRatio: false,
        plugins: {
            legend: {
                labels: { color: '#a0a0b0', font: { family: 'Outfit' } }
            }
        }
    },

    destroyAll() {
        Object.values(this.charts).forEach(chart => chart.destroy());
        this.charts = {};
        // ⚡ Note: We don't clear contexts here as the DOM elements persist
    },

    // ⚡ Bolt: Helper to get or create canvas context, minimizing document.getElementById calls
    _getContext(id) {
        if (!this.contexts[id]) {
            const el = document.getElementById(id);
            if (el) {
                this.contexts[id] = el.getContext('2d');
            }
        }
        return this.contexts[id];
    },

    renderPieChart(correct, wrong) {
        const ctx = this._getContext('chart-pie');
        if (!ctx) return;

        if (this.charts.pie) this.charts.pie.destroy();

        this.charts.pie = new Chart(ctx, {
            type: 'doughnut',
            data: {
                labels: ['Correctas', 'Incorrectas'],
                datasets: [{
                    data: [correct, wrong],
                    backgroundColor: [this.colors.success, this.colors.warning],
                    borderWidth: 0,
                    hoverOffset: 10
                }]
            },
            options: {
                ...this.defaultOptions,
                cutout: '60%',
                plugins: {
                    ...this.defaultOptions.plugins,
                    legend: { position: 'bottom', labels: { color: this.colors.text } }
                }
            }
        });
    },

    renderErrorsByTable(errorsByTable) {
        const ctx = this._getContext('chart-bar-tables');
        if (!ctx) return;

        if (this.charts.tables) this.charts.tables.destroy();

        const labels = Object.keys(errorsByTable).map(k => `Tabla ${k}`);
        const data = Object.values(errorsByTable);

        this.charts.tables = new Chart(ctx, {
            type: 'bar',
            data: {
                labels,
                datasets: [{
                    label: 'Errores',
                    data,
                    backgroundColor: this.colors.warning,
                    borderRadius: 4
                }]
            },
            options: {
                ...this.defaultOptions,
                scales: {
                    x: { ticks: { color: this.colors.text }, grid: { display: false } },
                    y: { ticks: { color: this.colors.text }, grid: { color: this.colors.grid } }
                }
            }
        });
    },

    renderTopErrors(topErrors) {
        const ctx = this._getContext('chart-bar-top');
        if (!ctx) return;

        if (this.charts.top) this.charts.top.destroy();

        const labels = topErrors.map(e => e.operation);
        const data = topErrors.map(e => e.count);

        this.charts.top = new Chart(ctx, {
            type: 'bar',
            data: {
                labels,
                datasets: [{
                    label: 'Fallos',
                    data,
                    backgroundColor: this.colors.error,
                    borderRadius: 4
                }]
            },
            options: {
                ...this.defaultOptions,
                indexAxis: 'y',
                scales: {
                    x: { ticks: { color: this.colors.text }, grid: { color: this.colors.grid } },
                    y: { ticks: { color: this.colors.text }, grid: { display: false } }
                }
            }
        });
    },

    renderHistogram(distribution) {
        const ctx = this._getContext('chart-histogram');
        if (!ctx) return;

        if (this.charts.histogram) this.charts.histogram.destroy();

        this.charts.histogram = new Chart(ctx, {
            type: 'bar',
            data: {
                labels: distribution.labels,
                datasets: [{
                    label: 'Respuestas',
                    data: distribution.counts,
                    backgroundColor: this.colors.primary,
                    borderRadius: 4
                }]
            },
            options: {
                ...this.defaultOptions,
                scales: {
                    x: { ticks: { color: this.colors.text }, grid: { display: false } },
                    y: { ticks: { color: this.colors.text }, grid: { color: this.colors.grid } }
                }
            }
        });
    },

    renderAll() {
        const { correct, wrong } = DataManager.getAccuracyDistribution();
        this.renderPieChart(correct, wrong);
        this.renderErrorsByTable(DataManager.getErrorsByTable());
        this.renderTopErrors(DataManager.getTopErrors(5));
        this.renderHistogram(DataManager.getResponseTimeDistribution());
    }
};

window.ChartsManager = ChartsManager;
