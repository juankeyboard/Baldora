/**
 * CHARTS.JS - Configuración de gráficas con Chart.js
 * Fast Math Game
 */

const ChartsManager = {
    charts: {},

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
    },

    renderPieChart(correct, wrong) {
        const ctx = document.getElementById('chart-pie').getContext('2d');

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
        const ctx = document.getElementById('chart-bar-tables').getContext('2d');

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
        const ctx = document.getElementById('chart-bar-top').getContext('2d');

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
        const ctx = document.getElementById('chart-histogram').getContext('2d');

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
