//==============================================================================
// FEATURE 13: COMPARTIR EN INSTAGRAM
// Archivo: share-instagram.js
// Fecha: 2026-02-04
// Descripción: Genera imagen compartible con estadísticas del juego
// ⚠️ IMPORTANTE: Código completamente nuevo e independiente
//==============================================================================

/**
 * Detecta si el dispositivo soporta Web Share API para archivos
 * @returns {boolean}
 */
function canUseWebShare() {
    return navigator.share && navigator.canShare && 'files' in Navigator.prototype;
}

/**
 * Detecta si es un dispositivo móvil
 * @returns {boolean}
 */
function isMobileDevice() {
    return /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(navigator.userAgent);
}

/**
 * Comparte la imagen usando Web Share API
 * @param {Blob} imageBlob - Blob de la imagen generada
 * @returns {Promise<boolean>} - True si se compartió exitosamente
 */
async function shareImageNative(imageBlob) {
    try {
        // Crear archivo desde blob
        const file = new File([imageBlob], 'FastMath_Resultados.png', {
            type: 'image/png'
        });

        // Verificar si se puede compartir
        if (navigator.canShare({ files: [file] })) {
            await navigator.share({
                files: [file],
                title: 'Mis Resultados - Baldora',
                text: '¡Mira mis resultados en Baldora - Aritmética en línea! 🎯'
            });

            console.log('✅ Imagen compartida exitosamente');
            return true;
        } else {
            console.warn('⚠️ No se pueden compartir archivos en este navegador');
            return false;
        }
    } catch (error) {
        // Usuario canceló o error
        if (error.name === 'AbortError') {
            console.log('ℹ️ Usuario canceló compartir');
        } else {
            console.error('❌ Error al compartir:', error);
        }
        return false;
    }
}

/**
 * Descarga el canvas como imagen PNG (versión mejorada)
 * @param {HTMLCanvasElement} canvas - Canvas a descargar
 * @param {boolean} returnBlob - Si true, retorna el blob en lugar de descargar
 * @returns {Promise<Blob|void>}
 */
async function downloadCanvasAsImage(canvas, returnBlob = false) {
    return new Promise((resolve, reject) => {
        canvas.toBlob(async (blob) => {
            if (!blob) {
                reject(new Error('No se pudo crear el blob de la imagen'));
                return;
            }

            if (returnBlob) {
                resolve(blob);
                return;
            }

            // Intentar compartir primero si es móvil y está disponible
            const isMobile = isMobileDevice();
            const canShare = canUseWebShare();

            if (isMobile && canShare) {
                const shared = await shareImageNative(blob);
                if (shared) {
                    resolve();
                    return;
                }
                // Si falla o cancela, continuar con descarga
            }

            // Descarga tradicional
            const url = URL.createObjectURL(blob);
            const link = document.createElement('a');
            link.download = 'FastMath_Resultados.png';
            link.href = url;
            link.click();

            setTimeout(() => {
                URL.revokeObjectURL(url);
                resolve();
            }, 100);

        }, 'image/png', 1.0);
    });
}

/**
 * Función principal mejorada con detección automática
 */
async function generateShareImage() {
    try {
        const canvas = document.createElement('canvas');
        canvas.width = 1080;
        canvas.height = 1920;
        const ctx = canvas.getContext('2d');

        if (!ctx) {
            throw new Error('No se pudo obtener el contexto 2D del canvas');
        }

        const templateImage = await loadTemplateImage();
        ctx.drawImage(templateImage, 0, 0, 1080, 1920);

        const stats = getGameStatistics();
        const containerConfig = {
            width: 510,
            height: 195,
            borderRadius: 35,
            backgroundColor: '#FFF9C4',
            shadowColor: 'rgba(0, 0, 0, 0.1)',
            shadowBlur: 12,
            shadowOffsetX: 0,
            shadowOffsetY: 4
        };

        const positions = {
            operations: { x: 20, y: 690 },
            correct: { x: 550, y: 690 },
            avgTime: { x: 20, y: 920 },
            accuracy: { x: 550, y: 920 }
        };

        const statDetails = createStatDetails(stats);

        drawStatContainer(ctx, containerConfig, positions.operations, statDetails.operations);
        drawStatContainer(ctx, containerConfig, positions.correct, statDetails.correct);
        drawStatContainer(ctx, containerConfig, positions.avgTime, statDetails.avgTime);
        drawStatContainer(ctx, containerConfig, positions.accuracy, statDetails.accuracy);

        // Automático: Compartir en móvil, descargar en desktop
        await downloadCanvasAsImage(canvas);

        console.log('✅ Imagen procesada exitosamente');

    } catch (error) {
        console.error('❌ Error al generar imagen:', error);
        alert('Error al generar la imagen. Por favor, intenta nuevamente.');
    }
}

/**
 * Carga la plantilla de imagen de fondo
 * @returns {Promise<HTMLImageElement>}
 */
function loadTemplateImage() {
    return new Promise((resolve, reject) => {
        const img = new Image();

        img.onload = () => {
            console.log('✅ Plantilla cargada exitosamente desde:', img.src);
            resolve(img);
        };

        img.onerror = () => {
            const attemptedUrl = new URL(img.src, window.location.href).href;
            console.error('❌ Error al cargar plantilla');
            console.error('   Ruta intentada:', attemptedUrl);
            console.error('   Verificar que el archivo existe en: /images/Baldora_share.png');
            console.error('   Extensión del archivo debe ser .png (NO .png.png)');
            reject(new Error(`No se pudo cargar la plantilla desde: ${attemptedUrl}`));
        };

        // CORRECCIÓN CRÍTICA: Usar ruta absoluta para que funcione en producción
        // Ruta absoluta (con / inicial) funciona consistentemente en local Y producción
        img.src = '/images/Baldora_share.png';

        // Logging para debugging en producción
        console.log('🔍 Intentando cargar plantilla desde:', img.src);
        console.log('📍 URL base del documento:', window.location.origin);
        console.log('📍 Ruta completa esperada:', new URL(img.src, window.location.href).href);

        // Timeout de seguridad
        setTimeout(() => {
            if (!img.complete) {
                reject(new Error('Timeout al cargar la plantilla'));
            }
        }, 5000);
    });
}

/**
 * Obtiene las estadísticas del juego actual
 * @returns {Object} Estadísticas del juego
 */
function getGameStatistics() {
    // Intentar obtener gameState globalmente (asumiendo window.gameState o similar)
    // Si no existe, usar valores de prueba o buscar en el DOM

    // Obtener valores del DOM si gameState no está disponible
    const domTotal = document.getElementById('summary-total')?.textContent || '0';
    const domCorrect = document.getElementById('summary-correct')?.textContent || '0';
    const domAvgTime = document.getElementById('summary-avg-time')?.textContent || '0ms';
    const domAccuracy = document.getElementById('summary-accuracy')?.textContent || '0%';

    // Intentar parsear números
    const totalQuestions = parseInt(domTotal) || 0;
    const correctAnswers = parseInt(domCorrect) || 0;

    // Limpiar texto (quitar 's', 'ms', '%')
    const avgTimeClean = domAvgTime.replace(/[^\d.]/g, '');
    const accuracyClean = domAccuracy.replace(/[^\d.]/g, '');

    return {
        operations: totalQuestions,
        correct: correctAnswers,
        avgTime: avgTimeClean,
        accuracy: accuracyClean
    };
}

/**
 * Crea los detalles visuales de cada estadística
 * @param {Object} stats - Estadísticas del juego
 * @returns {Object} Detalles formateados
 */
function createStatDetails(stats) {
    return {
        operations: {
            icon: '🎯',
            iconColor: '#FF6B6B',
            value: stats.operations.toString(),
            label: 'Operaciones'
        },
        correct: {
            icon: '✓',
            iconColor: '#4CAF50',
            value: stats.correct.toString(),
            label: 'Correctas'
        },
        avgTime: {
            icon: '⚡',
            iconColor: '#FF9800',
            value: stats.avgTime.toString().includes('s') ? stats.avgTime : stats.avgTime + 's', // Asegurar sufijo 's' si falta
            label: 'Tiempo Promedio'
        },
        accuracy: {
            icon: '📊',
            iconColor: '#E91E63',
            value: stats.accuracy.toString().includes('%') ? stats.accuracy : stats.accuracy + '%', // Asegurar sufijo '%' si falta
            label: 'Precisión'
        }
    };
}

/**
 * Dibuja un contenedor de estadística en el canvas
 * @param {CanvasRenderingContext2D} ctx - Contexto del canvas
 * @param {Object} config - Configuración del contenedor
 * @param {Object} position - Posición {x, y}
 * @param {Object} details - Detalles visuales
 */
function drawStatContainer(ctx, config, position, details) {
    // Guardar estado del contexto
    ctx.save();

    // Configurar sombra
    ctx.shadowColor = config.shadowColor;
    ctx.shadowBlur = config.shadowBlur;
    ctx.shadowOffsetX = config.shadowOffsetX;
    ctx.shadowOffsetY = config.shadowOffsetY;

    // Dibujar contenedor con bordes redondeados
    ctx.fillStyle = config.backgroundColor;
    drawRoundedRect(ctx, position.x, position.y, config.width, config.height, config.borderRadius);
    ctx.fill();

    // Resetear sombra para textos
    ctx.shadowColor = 'transparent';
    ctx.shadowBlur = 0;

    // Renderizar icono (emoji)
    ctx.font = '52px Arial'; // Emojis se renderizan mejor con fuentes estándar
    ctx.textAlign = 'center';
    ctx.textBaseline = 'top';
    ctx.fillText(details.icon, position.x + config.width / 2, position.y + 25);

    // Renderizar valor numérico
    ctx.font = 'bold 48px "Poppins", sans-serif';
    ctx.fillStyle = '#2C2C2C';
    ctx.fillText(details.value, position.x + config.width / 2, position.y + 95);

    // Renderizar etiqueta
    ctx.font = '16px "Poppins", sans-serif';
    ctx.fillStyle = '#A8A8A8';
    ctx.fillText(details.label, position.x + config.width / 2, position.y + 160);

    // Restaurar estado del contexto
    ctx.restore();
}

/**
 * Dibuja un rectángulo con bordes redondeados
 * @param {CanvasRenderingContext2D} ctx - Contexto del canvas
 * @param {number} x - Posición X
 * @param {number} y - Posición Y
 * @param {number} width - Ancho
 * @param {number} height - Alto
 * @param {number} radius - Radio de las esquinas
 */
function drawRoundedRect(ctx, x, y, width, height, radius) {
    ctx.beginPath();
    ctx.moveTo(x + radius, y);
    ctx.lineTo(x + width - radius, y);
    ctx.quadraticCurveTo(x + width, y, x + width, y + radius);
    ctx.lineTo(x + width, y + height - radius);
    ctx.quadraticCurveTo(x + width, y + height, x + width - radius, y + height);
    ctx.lineTo(x + radius, y + height);
    ctx.quadraticCurveTo(x, y + height, x, y + height - radius);
    ctx.lineTo(x, y + radius);
    ctx.quadraticCurveTo(x, y, x + radius, y);
    ctx.closePath();
}

/**
 * Inicializa el botón con texto dinámico según dispositivo
 */
function initializeInstagramButton() {
    const button = document.getElementById('exportInstagram');

    if (!button) {
        console.warn('⚠️ Botón exportInstagram no encontrado en el DOM');
        return;
    }

    // Cambiar texto del botón según dispositivo
    const isMobile = isMobileDevice();
    const canShare = canUseWebShare();

    if (isMobile && canShare) {
        button.innerHTML = '<span class="export-icon">📤</span><span class="export-title">Compartir</span><span class="export-desc">En redes sociales</span>';
        button.setAttribute('aria-label', 'Compartir en redes sociales');
    } else {
        // En desktop mantenemos el icono original
        // No cambiamos el HTML si ya está bien, solo verificamos
    }

    button.addEventListener('click', async function (e) {
        e.preventDefault();

        button.disabled = true;
        const originalHTML = button.innerHTML;
        button.innerHTML = '<span class="export-icon">⏳</span><span class="export-title">Generando...</span><span class="export-desc">Por favor espere</span>';

        try {
            await generateShareImage();
        } finally {
            button.disabled = false;
            button.innerHTML = originalHTML;
        }
    });

    console.log('✅ Botón Instagram inicializado correctamente');
    console.log(`   Modo: ${isMobile && canShare ? 'Compartir (Móvil)' : 'Descargar (Desktop)'}`);
}

// Auto-inicializar cuando el DOM esté listo
if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', initializeInstagramButton);
} else {
    initializeInstagramButton();
}
