// true  = incluye fotos en el PDF
// false = NO incluye fotos
const INCLUIR_FOTOS_EN_PDF = true;
const DRAFT_KEY = 'planilla-inspeccion-arboles-borrador';

let signaturePad = null;
let signatureCanvas = null;

document.addEventListener('DOMContentLoaded', initApp);

function initApp() {
    const form = document.querySelector('#form');
    const submitButton = document.querySelector('#generarPDF');
    const clearSignatureButton = document.querySelector('#borrarFirma');
    const saveDraftButton = document.querySelector('#guardarBorrador');
    const restoreDraftButton = document.querySelector('#restaurarBorrador');
    const clearDraftButton = document.querySelector('#limpiarBorrador');

    signatureCanvas = document.querySelector('#signature-canvas');
    setupSignaturePad();
    restoreDraft();
    updateProgress();

    form.addEventListener('submit', async (event) => {
        event.preventDefault();
        setStatus('Generando PDF, espere un momento...');
        submitButton.disabled = true;

        try {
            await generatePDF(collectFormData());
            localStorage.removeItem(DRAFT_KEY);
            resetForm();
            setStatus('PDF generado correctamente. El formulario quedó limpio.');
        } catch (error) {
            console.error(error);
            setStatus('No se pudo generar el PDF. Revise que las plantillas e imágenes existan.');
            alert('No se pudo generar el PDF. Revise las imágenes cargadas y vuelva a intentar.');
        } finally {
            submitButton.disabled = false;
        }
    });

    form.addEventListener('input', () => {
        saveDraft(false);
        updateProgress();
    });

    form.addEventListener('change', () => {
        saveDraft(false);
        updateProgress();
    });

    clearSignatureButton.addEventListener('click', clearSignature);
    saveDraftButton.addEventListener('click', () => saveDraft(true));
    restoreDraftButton.addEventListener('click', () => {
        restoreDraft();
        setStatus('Borrador restaurado.');
    });
    clearDraftButton.addEventListener('click', clearDraft);
    window.addEventListener('resize', resizeSignatureCanvas);
}

function setupSignaturePad() {
    if (!signatureCanvas || typeof SignaturePad === 'undefined') {
        setStatus('La firma digital no está disponible. Revise la conexión a internet.');
        return;
    }

    signaturePad = new SignaturePad(signatureCanvas, {
        backgroundColor: 'rgba(255, 255, 255, 0)',
        penColor: '#111'
    });

    resizeSignatureCanvas();
}

function resizeSignatureCanvas() {
    if (!signatureCanvas || !signaturePad) return;

    const ratio = Math.max(window.devicePixelRatio || 1, 1);
    const data = signaturePad.isEmpty() ? null : signaturePad.toData();

    signatureCanvas.width = signatureCanvas.offsetWidth * ratio;
    signatureCanvas.height = signatureCanvas.offsetHeight * ratio;
    signatureCanvas.getContext('2d').scale(ratio, ratio);
    signaturePad.clear();

    if (data) signaturePad.fromData(data);
}

function collectFormData() {
    return {
        fecha: valueOf('fecha'),
        aviso: valueOf('aviso'),
        arme: valueOf('arme'),
        especie: valueOf('especie'),
        calle: valueOf('calle'),
        numero: valueOf('numero'),
        altura: valueOf('Altura'),
        dap: valueOf('DAP'),
        cavidad: valueOf('Cavidad'),
        espesor: valueOf('Espesor'),
        sintomas: valueOf('SintomasE'),
        observaciones: valueOf('OBSERVACIONES'),
        informe: valueOf('Informe'),
        calle2: valueOf('Calle2'),
        nyp: valueOf('NYP'),
        dni: valueOf('DNI'),
        seco: checkedValue('Seco'),
        edad: checkedValue('Edad'),
        inclinacion: checkedValue('inclinacion'),
        fisuras: checkedValue('provoca_fisuras'),
        orientacion: checkedValues('orientacion'),
        cavidadesPequenas: checkedValues('cavidades_pequenas'),
        cavidadesGrandes: checkedValues('cavidades_grandes'),
        fuste: checkedValues('fuste'),
        raiz: checkedValues('raiz'),
        ramas: checkedValues('ramas'),
        hojas: checkedValues('hojas'),
        objetivosPoda: checkedValues('objetivos_poda'),
        tiposPoda: checkedValues('tipos_poda'),
        acciones: checkedValues('acciones'),
        corteRaices: checkedValues('corte_raices')
    };
}

async function generatePDF(data) {
    const imageBackground = await loadDataUrl('Planilla de inspección_page-0001.jpg');
    const segundaPagina = await loadDataUrl('Planilla de inspección_page-0002.jpg');
    const templateSize = await getImageSize(imageBackground);
    const imgWidth = templateSize.width;
    const imgHeight = templateSize.height;

    const signatureImage = signaturePad && !signaturePad.isEmpty()
        ? signaturePad.toDataURL('image/png')
        : null;

    const photos = INCLUIR_FOTOS_EN_PDF
        ? await loadSelectedPhotos()
        : [];

    const pdf = new jsPDF('p', 'pt', [imgWidth, imgHeight]);
    pdf.addImage(imageBackground, formatFromDataUrl(imageBackground), 0, 0, imgWidth, imgHeight);

    renderFirstPage(pdf, data, signatureImage, imgWidth, imgHeight);

    pdf.addPage([imgWidth, imgHeight]);
    pdf.addImage(segundaPagina, formatFromDataUrl(segundaPagina), 0, 0, imgWidth, imgHeight);
    renderSecondPage(pdf, data, photos, imgWidth, imgHeight);

    pdf.save(buildFileName(data.calle, data.numero));
}

function renderFirstPage(pdf, data, signatureImage, imgWidth, imgHeight) {
    pdf.setTextColor(0, 0, 0);
    pdf.setFontSize(20);

    text(pdf, data.aviso, imgWidth * 0.11, imgHeight * 0.102);
    text(pdf, data.fecha, imgWidth * 0.88, imgHeight * 0.087);
    text(pdf, data.especie, imgWidth * 0.43, imgHeight * 0.156);
    text(pdf, data.calle, imgWidth * 0.10, imgHeight * 0.182);
    text(pdf, data.numero, imgWidth * 0.50, imgHeight * 0.182);
    text(pdf, data.arme, imgWidth * 0.59, imgHeight * 0.110);
    text(pdf, data.altura, imgWidth * 0.18, imgHeight * 0.235);
    text(pdf, data.dap, imgWidth * 0.41, imgHeight * 0.235);
    text(pdf, data.cavidad, imgWidth * 0.65, imgHeight * 0.345);
    text(pdf, data.espesor, imgWidth * 0.65, imgHeight * 0.370);
    text(pdf, data.sintomas, imgWidth * 0.46, imgHeight * 0.537);
    text(pdf, data.nyp, imgWidth * 0.10, imgHeight * 0.985);
    text(pdf, data.dni, imgWidth * 0.75, imgHeight * 0.985);

    renderSelections(pdf, data, imgWidth, imgHeight);
    renderObservaciones(pdf, data.observaciones, imgWidth, imgHeight);

    if (signatureImage) {
        pdf.addImage(signatureImage, 'PNG', imgWidth * 0.36, imgHeight * 0.950, imgWidth * 0.25, imgHeight * 0.05);
    }
}

function renderSecondPage(pdf, data, photos, imgWidth, imgHeight) {
    pdf.setFontSize(20);
    text(pdf, data.calle2 || data.calle, imgWidth * 0.15, imgHeight * 0.070);
    text(pdf, data.informe, imgWidth * 0.64, imgHeight * 0.916);

    if (!photos.length) return;

    pdf.setFontSize(16);
    if (photos.length === 1) {
        text(pdf, photos[0].label, imgWidth * 0.10, imgHeight * 0.17);
        drawContainedImage(pdf, photos[0], imgWidth * 0.08, imgHeight * 0.18, imgWidth * 0.84, imgHeight * 0.63);
        return;
    }

    text(pdf, photos[0].label, imgWidth * 0.10, imgHeight * 0.17);
    drawContainedImage(pdf, photos[0], imgWidth * 0.10, imgHeight * 0.18, imgWidth * 0.80, imgHeight * 0.29);
    text(pdf, photos[1].label, imgWidth * 0.10, imgHeight * 0.50);
    drawContainedImage(pdf, photos[1], imgWidth * 0.10, imgHeight * 0.51, imgWidth * 0.80, imgHeight * 0.29);
}

function renderSelections(pdf, data, imgWidth, imgHeight) {
    const radioMarks = {
        seco: {
            seco: [0.669, 0.174],
            semi: [0.803, 0.174]
        },
        edad: {
            mayor40: [0.718, 0.230],
            menor40: [0.832, 0.230]
        },
        inclinacion: {
            si: [0.687, 0.232],
            no: [0.720, 0.232]
        },
        fisuras: {
            si: [0.843, 0.397],
            no: [0.906, 0.397]
        }
    };

    markSelected(pdf, radioMarks.seco[data.seco], imgWidth, imgHeight);
    markSelected(pdf, radioMarks.edad[data.edad], imgWidth, imgHeight);
    markSelected(pdf, radioMarks.inclinacion[data.inclinacion], imgWidth, imgHeight, 10);
    markSelected(pdf, radioMarks.fisuras[data.fisuras], imgWidth, imgHeight);

    markMany(pdf, data.orientacion, {
        hacia_calle: [0.284, 0.252],
        hacia_propiedad: [0.433, 0.252],
        largo_vereda: [0.650, 0.252],
        descopado: [0.284, 0.276],
        descopado_brotado: [0.433, 0.276],
        copa_desbalanceada: [0.650, 0.276]
    }, imgWidth, imgHeight);

    markMany(pdf, data.cavidadesPequenas, {
        basal: [0.177, 0.346],
        media: [0.248, 0.346],
        alto: [0.317, 0.346]
    }, imgWidth, imgHeight, 10);

    markMany(pdf, data.cavidadesGrandes, {
        basal: [0.177, 0.365],
        media: [0.248, 0.365],
        alto: [0.317, 0.365]
    }, imgWidth, imgHeight, 10);

    markMany(pdf, data.fuste, {
        descortezamiento: [0.183, 0.309],
        fructificaciones: [0.376, 0.309],
        codominancias: [0.630, 0.309],
        chorreados: [0.788, 0.309]
    }, imgWidth, imgHeight);

    markMany(pdf, data.raiz, {
        expuesta: [0.153, 0.398],
        levanta_vereda: [0.280, 0.398]
    }, imgWidth, imgHeight);

    markMany(pdf, data.ramas, {
        tocones: [0.172, 0.432],
        quebradas_fisuradas: [0.061, 0.456],
        codominancias: [0.061, 0.477],
        excesivas_cruzadas: [0.326, 0.432],
        secas_puntas: [0.326, 0.456],
        cavidades_tumores_cancros: [0.326, 0.477],
        mal_angulo: [0.665, 0.432],
        bajas: [0.665, 0.456],
        invaden_espacio: [0.665, 0.477]
    }, imgWidth, imgHeight);

    markMany(pdf, data.hojas, {
        coloracion_anormal: [0.164, 0.510],
        defoliacion_total: [0.376, 0.510],
        insectos: [0.550, 0.510],
        manchas_foliares: [0.769, 0.510],
        defoliacion_parcial: [0.061, 0.533]
    }, imgWidth, imgHeight);

    markMany(pdf, data.objetivosPoda, {
        reduccion_riesgo: [0.061, 0.602],
        eliminar_interferencias: [0.061, 0.623],
        adecuacion_sitio: [0.061, 0.645],
        regulacion_estructura: [0.061, 0.666]
    }, imgWidth, imgHeight);

    markMany(pdf, data.tiposPoda, {
        formacion: [0.330, 0.602],
        limpieza: [0.330, 0.623],
        aclareo: [0.330, 0.645],
        refaldado: [0.330, 0.666],
        terciado: [0.330, 0.687],
        balanceo: [0.512, 0.602]
    }, imgWidth, imgHeight);

    markMany(pdf, data.acciones, {
        extraccion: [0.512, 0.618],
        trasplante: [0.512, 0.645],
        tratamiento_sanitario: [0.512, 0.668]
    }, imgWidth, imgHeight);

    markMany(pdf, data.corteRaices, {
        superficial: [0.801, 0.623],
        profunda: [0.801, 0.645]
    }, imgWidth, imgHeight);
}

function renderObservaciones(pdf, observaciones, imgWidth, imgHeight) {
    if (!observaciones) return;

    const fontSize = 12;
    const lineHeight = 30;
    const x = imgWidth * 0.05;
    let y = imgHeight * 0.728;
    const maxWidth = imgWidth * 0.88;

    pdf.setFontSize(fontSize);
    const lines = pdf.splitTextToSize(observaciones, maxWidth).slice(0, 10);

    lines.forEach((line) => {
        pdf.text(line, x, y);
        y += lineHeight;
    });
}

function markMany(pdf, selectedValues, marks, imgWidth, imgHeight, size) {
    selectedValues.forEach((value) => markSelected(pdf, marks[value], imgWidth, imgHeight, size));
}

function markSelected(pdf, position, imgWidth, imgHeight, size = 14) {
    if (!position) return;

    const x = position[0] * imgWidth;
    const y = position[1] * imgHeight;

    pdf.setDrawColor(0, 0, 0);
    pdf.setLineWidth(4);
    pdf.line(x - size, y - size, x + size, y + size);
    pdf.line(x + size, y - size, x - size, y + size);
}

async function loadSelectedPhotos() {
    const files = [
        { input: document.getElementById('imagen'), label: 'IMAGEN ANTES' },
        { input: document.getElementById('imagenD'), label: 'IMAGEN DESPUES' }
    ];

    const photos = [];
    for (const item of files) {
        const file = item.input && item.input.files ? item.input.files[0] : null;
        if (file) photos.push(await fileToOptimizedImage(file, item.label));
    }

    return photos;
}

function fileToOptimizedImage(file, label) {
    return new Promise((resolve, reject) => {
        const reader = new FileReader();
        reader.onerror = () => reject(new Error('No se pudo leer la imagen.'));
        reader.onload = () => {
            const image = new Image();
            image.onerror = () => reject(new Error('La imagen seleccionada no es válida.'));
            image.onload = () => {
                const maxSide = 1600;
                const scale = Math.min(1, maxSide / Math.max(image.width, image.height));
                const width = Math.round(image.width * scale);
                const height = Math.round(image.height * scale);
                const canvas = document.createElement('canvas');
                const context = canvas.getContext('2d');

                canvas.width = width;
                canvas.height = height;
                context.fillStyle = '#fff';
                context.fillRect(0, 0, width, height);
                context.drawImage(image, 0, 0, width, height);

                resolve({
                    dataUrl: canvas.toDataURL('image/jpeg', 0.86),
                    format: 'JPEG',
                    width,
                    height,
                    label
                });
            };
            image.src = reader.result;
        };
        reader.readAsDataURL(file);
    });
}

function drawContainedImage(pdf, image, x, y, boxWidth, boxHeight) {
    const scale = Math.min(boxWidth / image.width, boxHeight / image.height);
    const width = image.width * scale;
    const height = image.height * scale;
    const offsetX = x + (boxWidth - width) / 2;
    const offsetY = y + (boxHeight - height) / 2;

    pdf.addImage(image.dataUrl, image.format, offsetX, offsetY, width, height);
}

function loadDataUrl(url) {
    return new Promise((resolve, reject) => {
        const xhr = new XMLHttpRequest();
        xhr.open('GET', encodeURI(url), true);
        xhr.responseType = 'blob';
        xhr.onerror = () => reject(new Error(`No se pudo cargar ${url}`));
        xhr.onload = function () {
            if (xhr.status && xhr.status >= 400) {
                reject(new Error(`No se pudo cargar ${url}`));
                return;
            }

            const reader = new FileReader();
            reader.onerror = () => reject(new Error(`No se pudo leer ${url}`));
            reader.onload = (event) => resolve(event.target.result);
            reader.readAsDataURL(this.response);
        };
        xhr.send();
    });
}

function getImageSize(dataUrl) {
    return new Promise((resolve, reject) => {
        const image = new Image();
        image.onload = () => resolve({ width: image.width, height: image.height });
        image.onerror = () => reject(new Error('No se pudo leer el tamaño de la plantilla.'));
        image.src = dataUrl;
    });
}

function formatFromDataUrl(dataUrl) {
    if (dataUrl.indexOf('image/png') === 5) return 'PNG';
    return 'JPEG';
}

function valueOf(id) {
    const element = document.getElementById(id);
    return element ? element.value.trim() : '';
}

function checkedValue(name) {
    const element = document.querySelector(`input[name="${name}"]:checked`);
    return element ? element.value : '';
}

function checkedValues(name) {
    return Array.from(document.querySelectorAll(`input[name="${name}"]:checked`)).map((element) => element.value);
}

function text(pdf, value, x, y) {
    if (value) pdf.text(String(value), x, y);
}

function buildFileName(calle, numero) {
    const baseName = `${calle || 'planilla'}${numero || ''}`
        .normalize('NFD')
        .replace(/[\u0300-\u036f]/g, '')
        .replace(/[^a-zA-Z0-9_-]+/g, '_')
        .replace(/^_+|_+$/g, '');

    return `${baseName || 'planilla'}.pdf`;
}

function resetForm() {
    document.querySelector('#form').reset();
    clearSignature();
    updateProgress();
}

function clearSignature() {
    if (signaturePad) signaturePad.clear();
}

function saveDraft(showMessage) {
    const form = document.querySelector('#form');
    const data = {};

    Array.from(form.elements).forEach((element) => {
        if (!element.name && !element.id) return;
        if (element.type === 'file' || element.type === 'submit' || element.type === 'button') return;

        const key = element.name || element.id;
        if (element.type === 'checkbox') {
            data[key] = data[key] || [];
            if (element.checked) data[key].push(element.value);
            return;
        }

        if (element.type === 'radio') {
            if (element.checked) data[key] = element.value;
            return;
        }

        data[key] = element.value;
    });

    localStorage.setItem(DRAFT_KEY, JSON.stringify(data));
    if (showMessage) setStatus('Borrador guardado en este navegador.');
}

function restoreDraft() {
    const savedDraft = localStorage.getItem(DRAFT_KEY);
    if (!savedDraft) return;

    const data = JSON.parse(savedDraft);
    Object.keys(data).forEach((key) => {
        const elements = document.querySelectorAll(`[name="${key}"], #${escapeSelector(key)}`);
        elements.forEach((element) => {
            if (element.type === 'checkbox') {
                element.checked = Array.isArray(data[key]) && data[key].includes(element.value);
                return;
            }

            if (element.type === 'radio') {
                element.checked = data[key] === element.value;
                return;
            }

            element.value = data[key];
        });
    });

    updateProgress();
}

function clearDraft() {
    localStorage.removeItem(DRAFT_KEY);
    setStatus('Borrador eliminado.');
}

function updateProgress() {
    const progress = document.getElementById('formProgress');
    if (!progress) return;

    const fields = Array.from(document.querySelectorAll('#form input:not([type="file"]):not([type="button"]):not([type="submit"]), #form textarea'));
    const filled = fields.filter((field) => {
        if (field.type === 'checkbox' || field.type === 'radio') return field.checked;
        return field.value.trim() !== '';
    }).length;

    progress.textContent = `${filled} datos cargados`;
}

function setStatus(message) {
    const status = document.getElementById('formStatus');
    if (status) status.textContent = message;
}

function escapeSelector(value) {
    if (window.CSS && typeof window.CSS.escape === 'function') return window.CSS.escape(value);
    return String(value).replace(/[^a-zA-Z0-9_-]/g, '\\$&');
}
