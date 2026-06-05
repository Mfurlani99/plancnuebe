document.addEventListener('DOMContentLoaded', initErrorReport);

function initErrorReport() {
    const form = document.getElementById('errorForm');
    const fecha = document.getElementById('errorFecha');
    const submitButton = document.getElementById('generarReporteError');

    if (fecha && !fecha.value) fecha.valueAsDate = new Date();

    form.addEventListener('submit', async (event) => {
        event.preventDefault();

        if (!form.checkValidity()) {
            form.reportValidity();
            setErrorStatus('Complete los campos obligatorios para generar el reporte.');
            return;
        }

        submitButton.disabled = true;
        setErrorStatus('Generando reporte PDF...');

        try {
            await generateErrorPDF(collectErrorData());
            form.reset();
            if (fecha) fecha.valueAsDate = new Date();
            setErrorStatus('Reporte generado correctamente.');
        } catch (error) {
            console.error(error);
            setErrorStatus('No se pudo generar el reporte. Revise la captura adjunta y vuelva a intentar.');
            alert('No se pudo generar el reporte de error.');
        } finally {
            submitButton.disabled = false;
        }
    });
}

function collectErrorData() {
    const now = new Date();

    return {
        id: buildErrorId(now),
        createdAt: formatDateTime(now),
        fecha: valueOf('errorFecha'),
        aviso: valueOf('errorAviso'),
        informe: valueOf('errorInforme'),
        calle: valueOf('errorCalle'),
        numero: valueOf('errorNumero'),
        seccion: valueOf('errorSeccion'),
        campo: valueOf('errorCampo'),
        tipo: checkedValue('errorTipo'),
        cargado: valueOf('errorCargado'),
        esperado: valueOf('errorEsperado'),
        resultado: valueOf('errorResultado'),
        pasos: valueOf('errorPasos'),
        dispositivo: valueOf('errorDispositivo'),
        sistema: valueOf('errorSistema'),
        navegador: valueOf('errorNavegador'),
        urgencia: valueOf('errorUrgencia'),
        screen: `${window.innerWidth} x ${window.innerHeight}`,
        devicePixelRatio: String(window.devicePixelRatio || 1),
        userAgent: navigator.userAgent
    };
}

async function generateErrorPDF(data) {
    const pdf = new jsPDF('p', 'pt', 'a4');
    const pageWidth = pdf.internal.pageSize.getWidth();
    const pageHeight = pdf.internal.pageSize.getHeight();
    const margin = 44;
    let y = 48;

    drawErrorHeader(pdf, data, margin, y, pageWidth);
    y = 150;

    y = drawInfoGrid(pdf, 'Identificación rápida', [
        ['Código', data.id],
        ['Generado', data.createdAt],
        ['Fecha del error', data.fecha || 'Sin completar'],
        ['Urgencia', data.urgencia || 'Sin completar'],
        ['Aviso', data.aviso || 'Sin completar'],
        ['Informe N°', data.informe || 'Sin completar'],
        ['Calle', data.calle || 'Sin completar'],
        ['Número / chapa', data.numero || 'Sin completar']
    ], margin, y, pageWidth, pageHeight);

    y = drawInfoGrid(pdf, 'Ubicación del problema', [
        ['Sección afectada', data.seccion],
        ['Campo o casillero', data.campo],
        ['Tipo de problema', data.tipo]
    ], margin, y + 16, pageWidth, pageHeight);

    y = drawTextBlock(pdf, 'Qué completó o seleccionó', data.cargado, margin, y + 16, pageWidth, pageHeight);
    y = drawTextBlock(pdf, 'Qué debería haber pasado', data.esperado, margin, y + 12, pageWidth, pageHeight);
    y = drawTextBlock(pdf, 'Qué pasó realmente', data.resultado, margin, y + 12, pageWidth, pageHeight);
    y = drawTextBlock(pdf, 'Pasos para repetir el error', data.pasos, margin, y + 12, pageWidth, pageHeight);

    y = drawInfoGrid(pdf, 'Datos técnicos automáticos', [
        ['Dispositivo informado', data.dispositivo || 'Sin completar'],
        ['Sistema informado', data.sistema || 'Sin completar'],
        ['Navegador informado', data.navegador || 'Sin completar'],
        ['Pantalla', data.screen],
        ['Pixel ratio', data.devicePixelRatio],
        ['User agent', data.userAgent]
    ], margin, y + 16, pageWidth, pageHeight);

    const screenshot = await loadScreenshot();
    if (screenshot) drawScreenshotPage(pdf, screenshot, margin, pageWidth, pageHeight);

    pdf.save(`${data.id}.pdf`);
}

function drawErrorHeader(pdf, data, margin, y, pageWidth) {
    pdf.setFillColor(11, 47, 36);
    pdf.roundedRect(margin, y, pageWidth - margin * 2, 78, 16, 16, 'F');
    pdf.setTextColor(255, 248, 237);
    pdf.setFontSize(22);
    pdf.text('Reporte de error - Planilla C9', margin + 22, y + 32);
    pdf.setFontSize(11);
    pdf.text(`Código: ${data.id}`, margin + 22, y + 55);
    pdf.setTextColor(0, 0, 0);
}

function drawInfoGrid(pdf, title, rows, margin, y, pageWidth, pageHeight) {
    const contentWidth = pageWidth - margin * 2;
    const labelWidth = 145;
    const rowPadding = 9;
    const lineHeight = 13;

    y = ensureSpace(pdf, y, 70, margin, pageHeight);
    drawSectionTitle(pdf, title, margin, y);
    y += 22;

    rows.forEach(([label, value]) => {
        const text = String(value || 'Sin completar');
        const lines = pdf.splitTextToSize(text, contentWidth - labelWidth - rowPadding * 3);
        const rowHeight = Math.max(30, lines.length * lineHeight + rowPadding * 2);

        y = ensureSpace(pdf, y, rowHeight + 8, margin, pageHeight);
        pdf.setDrawColor(217, 209, 191);
        pdf.setFillColor(255, 250, 241);
        pdf.roundedRect(margin, y, contentWidth, rowHeight, 8, 8, 'FD');
        pdf.setFontSize(10);
        pdf.setTextColor(104, 116, 107);
        pdf.text(label, margin + rowPadding, y + 19);
        pdf.setTextColor(22, 32, 27);
        pdf.setFontSize(10.5);
        pdf.text(lines, margin + labelWidth, y + 18);
        y += rowHeight + 6;
    });

    return y;
}

function drawTextBlock(pdf, title, value, margin, y, pageWidth, pageHeight) {
    const contentWidth = pageWidth - margin * 2;
    const lines = pdf.splitTextToSize(String(value || 'Sin completar'), contentWidth - 24);
    const blockHeight = Math.max(58, lines.length * 14 + 42);

    y = ensureSpace(pdf, y, blockHeight + 8, margin, pageHeight);
    drawSectionTitle(pdf, title, margin, y);
    y += 22;

    pdf.setDrawColor(217, 209, 191);
    pdf.setFillColor(255, 250, 241);
    pdf.roundedRect(margin, y, contentWidth, blockHeight - 24, 8, 8, 'FD');
    pdf.setTextColor(22, 32, 27);
    pdf.setFontSize(11);
    pdf.text(lines, margin + 12, y + 20);

    return y + blockHeight;
}

function drawSectionTitle(pdf, title, x, y) {
    pdf.setTextColor(11, 47, 36);
    pdf.setFontSize(13);
    pdf.text(title, x, y);
    pdf.setTextColor(0, 0, 0);
}

function ensureSpace(pdf, y, neededHeight, margin, pageHeight) {
    if (y + neededHeight <= pageHeight - margin) return y;
    pdf.addPage();
    return margin;
}

async function loadScreenshot() {
    const input = document.getElementById('errorCaptura');
    const file = input && input.files ? input.files[0] : null;
    if (!file) return null;

    return fileToImage(file);
}

function fileToImage(file) {
    return new Promise((resolve, reject) => {
        const reader = new FileReader();
        reader.onerror = () => reject(new Error('No se pudo leer la captura.'));
        reader.onload = () => {
            const image = new Image();
            image.onerror = () => reject(new Error('La captura seleccionada no es válida.'));
            image.onload = () => resolve({
                dataUrl: reader.result,
                format: reader.result.indexOf('image/png') === 5 ? 'PNG' : 'JPEG',
                width: image.width,
                height: image.height
            });
            image.src = reader.result;
        };
        reader.readAsDataURL(file);
    });
}

function drawScreenshotPage(pdf, image, margin, pageWidth, pageHeight) {
    pdf.addPage();
    drawSectionTitle(pdf, 'Captura o foto adjunta', margin, margin);

    const boxX = margin;
    const boxY = margin + 22;
    const boxWidth = pageWidth - margin * 2;
    const boxHeight = pageHeight - margin * 2 - 22;
    const scale = Math.min(boxWidth / image.width, boxHeight / image.height);
    const width = image.width * scale;
    const height = image.height * scale;
    const x = boxX + (boxWidth - width) / 2;
    const y = boxY + (boxHeight - height) / 2;

    pdf.addImage(image.dataUrl, image.format, x, y, width, height);
}

function buildErrorId(date) {
    const pad = (value) => String(value).padStart(2, '0');
    return `ERROR-${date.getFullYear()}${pad(date.getMonth() + 1)}${pad(date.getDate())}-${pad(date.getHours())}${pad(date.getMinutes())}`;
}

function formatDateTime(date) {
    return date.toLocaleString('es-AR', {
        year: 'numeric',
        month: '2-digit',
        day: '2-digit',
        hour: '2-digit',
        minute: '2-digit'
    });
}

function valueOf(id) {
    const element = document.getElementById(id);
    return element ? element.value.trim() : '';
}

function checkedValue(name) {
    const element = document.querySelector(`input[name="${name}"]:checked`);
    return element ? element.value : '';
}

function setErrorStatus(message) {
    const status = document.getElementById('errorStatus');
    if (status) status.textContent = message;
}
