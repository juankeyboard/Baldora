/**
 * ExportManager - Sistema de Exportación de Resultados
 * Permite exportar los resultados de la sesión en formato PDF o CSV
 * Versión: 2.1
 */

const ExportManager = {
    // 1. Abrir Modal de selección de formato
    openModal() {
        document.getElementById('modal-export').classList.add('active');
    },

    // 2. Cerrar Modal
    closeModal() {
        document.getElementById('modal-export').classList.remove('active');
    },

    // 3. Opción CSV (Usa la lógica existente de DataManager)
    downloadCSV() {
        if (typeof DataManager !== 'undefined' && typeof DataManager.downloadCSV === 'function') {
            DataManager.downloadCSV();
        } else {
            console.warn('DataManager.downloadCSV no está disponible');
            alert('Error: No se pudo generar el archivo CSV');
        }
        this.closeModal();
    },

    // Almacenar las instancias de Chart.js del PDF para destruirlas después
    pdfCharts: {},

    // 4. Opción PDF (Genera reporte visual usando jsPDF directamente)
    async downloadPDF() {
        // Verificar que jsPDF esté disponible (viene incluido en html2pdf bundle)
        if (!window.jspdf) {
            alert('Error: La librería jsPDF no está cargada');
            return;
        }

        // Obtener jsPDF del bundle de html2pdf
        const { jsPDF } = window.jspdf;

        // A. Recopilar datos de sesión
        const nickname = DataManager.nickname || 'Invitado';
        const mode = App.gameMode || 'TIMER';
        const history = DataManager.sessionData || [];
        const modeNames = { 'TIMER': 'Contrarreloj', 'FREE': 'Práctica Libre', 'ADAPTIVE': 'Adaptativo' };
        const modeName = modeNames[mode] || mode;
        const total = history.length;
        const correct = history.filter(h => h.is_correct === 1).length;
        const accuracy = total > 0 ? (correct / total * 100).toFixed(0) : 0;
        const aiText = this.generateAIAnalysis(accuracy, total, correct);

        // B. Mostrar indicador de carga
        const btnPDF = document.querySelector('#modal-export .btn-export-option');
        const originalText = btnPDF ? btnPDF.innerHTML : '';
        if (btnPDF) {
            btnPDF.innerHTML = '<span style="font-size: 2.5rem;">⏳</span><span>Generando...</span>';
            btnPDF.disabled = true;
        }

        try {
            // C. Crear documento PDF (tamaño carta: 215.9 x 279.4 mm)
            const doc = new jsPDF({
                orientation: 'portrait',
                unit: 'mm',
                format: 'letter'
            });

            const pageWidth = 215.9;
            const pageHeight = 279.4;
            const margin = 15;
            let y = margin;

            // D. HEADER
            doc.setFillColor(209, 107, 165); // Rosa Baldora
            doc.rect(0, 0, pageWidth, 25, 'F');

            doc.setFont('helvetica', 'bold');
            doc.setFontSize(24);
            doc.setTextColor(255, 255, 255);
            doc.text('BALDORA', margin, 16);

            doc.setFontSize(10);
            doc.setFont('helvetica', 'normal');
            doc.text('Analiticas de Sesion', pageWidth - margin, 12, { align: 'right' });
            doc.text('Reporte de Rendimiento Aritmetico', pageWidth - margin, 18, { align: 'right' });

            y = 35;

            // E. MÉTRICAS
            doc.setFillColor(240, 240, 240);
            doc.roundedRect(margin, y, pageWidth - (margin * 2), 20, 3, 3, 'F');

            doc.setTextColor(100, 100, 100);
            doc.setFontSize(8);
            doc.setFont('helvetica', 'bold');

            const metricsY = y + 8;
            const col1 = margin + 10;
            const col2 = col1 + 45;
            const col3 = col2 + 45;
            const col4 = col3 + 45;

            doc.text('JUGADOR', col1, metricsY);
            doc.text('FECHA', col2, metricsY);
            doc.text('MODO', col3, metricsY);
            doc.text('ACIERTOS', col4, metricsY);

            doc.setTextColor(30, 30, 30);
            doc.setFontSize(11);
            doc.text(nickname, col1, metricsY + 6);
            doc.text(new Date().toLocaleDateString('es-CO'), col2, metricsY + 6);
            doc.text(modeName, col3, metricsY + 6);
            doc.text(`${correct} / ${total}`, col4, metricsY + 6);

            y += 28;

            // F. ANÁLISIS AI
            doc.setFillColor(252, 236, 246); // Rosa claro
            doc.setDrawColor(209, 107, 165);
            doc.roundedRect(margin, y, pageWidth - (margin * 2), 28, 3, 3, 'FD');

            doc.setFontSize(10);
            doc.setFont('helvetica', 'bold');
            doc.setTextColor(150, 60, 120);
            doc.text('Analisis de Entrenador Virtual', margin + 5, y + 8);

            doc.setFont('helvetica', 'italic');
            doc.setFontSize(9);
            doc.setTextColor(80, 80, 80);

            // Dividir texto largo en líneas
            const splitAI = doc.splitTextToSize('"' + aiText + '"', pageWidth - (margin * 2) - 10);
            doc.text(splitAI, margin + 5, y + 16);

            y += 36;

            // G. GRÁFICOS (usando los canvas del dashboard)
            const chartHeight = 70;
            const chartWidth = (pageWidth - (margin * 2) - 10) / 2;

            // Títulos de gráficos
            const chartTitles = ['Rendimiento', 'Errores por Tabla', 'Top Errores', 'Velocidad'];
            const chartCanvasIds = ['chart-pie', 'chart-bar-tables', 'chart-bar-top', 'chart-histogram'];

            // Esperar un momento para asegurar que los gráficos están renderizados
            await new Promise(resolve => setTimeout(resolve, 100));

            // Posiciones de las 4 gráficas (2x2)
            const positions = [
                { x: margin, y: y },
                { x: margin + chartWidth + 10, y: y },
                { x: margin, y: y + chartHeight + 15 },
                { x: margin + chartWidth + 10, y: y + chartHeight + 15 }
            ];

            for (let i = 0; i < 4; i++) {
                const pos = positions[i];
                const canvas = document.getElementById(chartCanvasIds[i]);

                // Marco del gráfico
                doc.setDrawColor(200, 200, 200);
                doc.setFillColor(255, 255, 255);
                doc.roundedRect(pos.x, pos.y, chartWidth, chartHeight, 2, 2, 'FD');

                // Título del gráfico
                doc.setFont('helvetica', 'bold');
                doc.setFontSize(9);
                doc.setTextColor(100, 100, 100);
                doc.text(chartTitles[i], pos.x + chartWidth / 2, pos.y + 7, { align: 'center' });

                // Intentar agregar el gráfico como imagen
                if (canvas) {
                    try {
                        const imgData = canvas.toDataURL('image/png', 1.0);
                        doc.addImage(imgData, 'PNG', pos.x + 3, pos.y + 10, chartWidth - 6, chartHeight - 15);
                    } catch (e) {
                        // Si falla toDataURL, mostrar mensaje alternativo
                        console.warn('No se pudo exportar el grafico ' + chartTitles[i] + ':', e);
                        doc.setFontSize(8);
                        doc.setTextColor(150, 150, 150);
                        doc.text('Grafico no disponible', pos.x + chartWidth / 2, pos.y + chartHeight / 2, { align: 'center' });
                    }
                } else {
                    doc.setFontSize(8);
                    doc.setTextColor(150, 150, 150);
                    doc.text('Sin datos', pos.x + chartWidth / 2, pos.y + chartHeight / 2, { align: 'center' });
                }
            }

            y += (chartHeight * 2) + 30;

            // H. FOOTER
            const footerY = pageHeight - 15;
            doc.setDrawColor(200, 200, 200);
            doc.line(margin, footerY - 5, pageWidth - margin, footerY - 5);

            doc.setFontSize(8);
            doc.setTextColor(120, 120, 120);
            doc.setFont('helvetica', 'normal');
            doc.text('JCG Games', margin, footerY);
            doc.text('Generado por Baldora', pageWidth / 2, footerY, { align: 'center' });
            doc.text('@baldoragame', pageWidth - margin, footerY, { align: 'right' });

            // I. GUARDAR PDF
            doc.save('Baldora_Reporte_' + nickname + '_' + Date.now() + '.pdf');

            console.log('PDF generado exitosamente');
        } catch (e) {
            console.error("Error generando PDF:", e);
            alert("Error generando el reporte. Verifique la consola.");
        }

        // Restaurar botón
        if (btnPDF) {
            btnPDF.innerHTML = originalText;
            btnPDF.disabled = false;
        }

        this.closeModal();
    },

    // Renderizar los 4 gráficos directamente en los canvas del template PDF
    renderPDFCharts() {
        // Destruir gráficos previos si existen
        this.destroyPDFCharts();

        // Colores para los gráficos (versión para fondo claro/PDF)
        const colors = {
            primary: '#6366f1',
            success: '#22c55e',
            warning: '#f59e0b',
            error: '#ef4444',
            text: '#4a5568',
            grid: 'rgba(0, 0, 0, 0.1)'
        };

        // Opciones base para gráficos del PDF (fondo claro)
        const pdfOptions = {
            responsive: true,
            maintainAspectRatio: false,
            animation: false, // Sin animación para PDF
            plugins: {
                legend: {
                    labels: { color: colors.text, font: { family: 'Nunito', size: 10 } }
                }
            }
        };

        // 1. Gráfico de Rendimiento (Pie/Doughnut)
        const { correct, wrong } = DataManager.getAccuracyDistribution();
        const ctxPie = document.getElementById('pdf-chart-pie');
        if (ctxPie) {
            this.pdfCharts.pie = new Chart(ctxPie.getContext('2d'), {
                type: 'doughnut',
                data: {
                    labels: ['Correctas', 'Incorrectas'],
                    datasets: [{
                        data: [correct, wrong],
                        backgroundColor: [colors.success, colors.warning],
                        borderWidth: 0
                    }]
                },
                options: {
                    ...pdfOptions,
                    cutout: '60%',
                    plugins: {
                        ...pdfOptions.plugins,
                        legend: { position: 'bottom', labels: { color: colors.text, font: { size: 9 } } }
                    }
                }
            });
        }

        // 2. Gráfico de Errores por Tabla (Bar)
        const errorsByTable = DataManager.getErrorsByTable();
        const tablesLabels = Object.keys(errorsByTable).map(k => `T${k}`);
        const tablesData = Object.values(errorsByTable);
        const ctxTables = document.getElementById('pdf-chart-tables');
        if (ctxTables) {
            this.pdfCharts.tables = new Chart(ctxTables.getContext('2d'), {
                type: 'bar',
                data: {
                    labels: tablesLabels,
                    datasets: [{
                        label: 'Errores',
                        data: tablesData,
                        backgroundColor: colors.warning,
                        borderRadius: 3
                    }]
                },
                options: {
                    ...pdfOptions,
                    scales: {
                        x: { ticks: { color: colors.text, font: { size: 8 } }, grid: { display: false } },
                        y: { ticks: { color: colors.text, font: { size: 8 } }, grid: { color: colors.grid } }
                    }
                }
            });
        }

        // 3. Gráfico de Top Errores (Bar Horizontal)
        const topErrors = DataManager.getTopErrors(5);
        const topLabels = topErrors.map(e => e.operation);
        const topData = topErrors.map(e => e.count);
        const ctxTop = document.getElementById('pdf-chart-top');
        if (ctxTop) {
            this.pdfCharts.top = new Chart(ctxTop.getContext('2d'), {
                type: 'bar',
                data: {
                    labels: topLabels,
                    datasets: [{
                        label: 'Fallos',
                        data: topData,
                        backgroundColor: colors.error,
                        borderRadius: 3
                    }]
                },
                options: {
                    ...pdfOptions,
                    indexAxis: 'y',
                    scales: {
                        x: { ticks: { color: colors.text, font: { size: 8 } }, grid: { color: colors.grid } },
                        y: { ticks: { color: colors.text, font: { size: 8 } }, grid: { display: false } }
                    }
                }
            });
        }

        // 4. Gráfico de Velocidad (Histograma)
        const distribution = DataManager.getResponseTimeDistribution();
        const ctxHistogram = document.getElementById('pdf-chart-histogram');
        if (ctxHistogram) {
            this.pdfCharts.histogram = new Chart(ctxHistogram.getContext('2d'), {
                type: 'bar',
                data: {
                    labels: distribution.labels,
                    datasets: [{
                        label: 'Respuestas',
                        data: distribution.counts,
                        backgroundColor: colors.primary,
                        borderRadius: 3
                    }]
                },
                options: {
                    ...pdfOptions,
                    scales: {
                        x: { ticks: { color: colors.text, font: { size: 8 } }, grid: { display: false } },
                        y: { ticks: { color: colors.text, font: { size: 8 } }, grid: { color: colors.grid } }
                    }
                }
            });
        }
    },

    // Destruir los gráficos del PDF para liberar memoria
    destroyPDFCharts() {
        Object.values(this.pdfCharts).forEach(chart => {
            if (chart && typeof chart.destroy === 'function') {
                chart.destroy();
            }
        });
        this.pdfCharts = {};
    },

    // 5. Generador de análisis AI (Simulado)
    generateAIAnalysis(accuracy, total, correct) {
        if (total === 0) {
            return "No hay suficientes datos para generar un análisis. ¡Completa una sesión primero!";
        }

        const accNum = parseFloat(accuracy);

        if (accNum >= 95) {
            return "¡Extraordinario! Tu dominio de las tablas es excepcional. Mantén este nivel de excelencia practicando las operaciones más complejas.";
        } else if (accNum >= 85) {
            return "¡Excelente rendimiento! Tienes una sólida comprensión de las tablas. Enfócate en reducir tu tiempo de respuesta para alcanzar la maestría total.";
        } else if (accNum >= 70) {
            return "¡Buen trabajo! Vas por buen camino. Te recomiendo practicar más las tablas del 7, 8 y 9 que suelen ser las más desafiantes.";
        } else if (accNum >= 50) {
            return "Estás progresando. Dedica sesiones cortas pero frecuentes para reforzar las tablas que más te cuestan. ¡La práctica hace al maestro!";
        } else {
            return "¡No te desanimes! Cada sesión es una oportunidad de mejora. Comienza con las tablas más sencillas y ve aumentando la dificultad gradualmente.";
        }
    }
};

// Función global para cerrar modales (compatible con otros modales del sistema)
function closeModal(modalId) {
    const modal = document.getElementById(modalId);
    if (modal) {
        modal.classList.remove('active');
    }
}
