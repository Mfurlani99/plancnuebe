// ======================================================
// CONFIGURACIÓN SOLO PARA DESARROLLADOR
// true  = incluye fotos en el PDF
// false = NO incluye fotos (queda espacio en blanco)
// ======================================================
const INCLUIR_FOTOS_EN_PDF = false;

function loadImage(url) {
    return new Promise(resolve => {
        const xhr = new XMLHttpRequest();
        xhr.open('GET', url, true);
        xhr.responseType = "blob";

        xhr.onload = function () {
            const reader = new FileReader();

            reader.onload = function (event) {
                resolve(event.target.result);
            };

            reader.readAsDataURL(this.response);
        };

        xhr.send();
    });
}

let signaturePad = null;

window.addEventListener('load', async () => {

    const canvas = document.querySelector("canvas");

    canvas.height = canvas.offsetHeight;
    canvas.width = canvas.offsetWidth;

    signaturePad = new SignaturePad(canvas, {});

    const form = document.querySelector('#form');

    form.addEventListener('submit', (e) => {

        e.preventDefault();

        let fecha = document.getElementById('fecha').value;
        let aviso = document.getElementById('aviso').value;
        let arme = document.getElementById('arme').value;
        let especie = document.getElementById('especie').value;
        let calle = document.getElementById('calle').value;
        let numero = document.getElementById('numero').value;
        let Altura = document.getElementById('Altura').value;
        let DAP = document.getElementById('DAP').value;
        let Cavidad = document.getElementById('Cavidad').value;
        let Espesor = document.getElementById('Espesor').value;
        let SíntomasE = document.getElementById('SíntomasE').value;
        let OBSERVACIONES = document.getElementById('OBSERVACIONES').value;
        let Informe = document.getElementById('Informe').value;
        let Calle2 = document.getElementById('Calle2').value;
        let NYP = document.getElementById('NYP').value;
        let DNI = document.getElementById('DNI').value;

        var secoRadio = document.querySelector('input[name="Seco"]:checked');
        var edadRadio = document.querySelector('input[name="Edad"]:checked');
        var inclinacionRadio = document.querySelector('input[name="inclinacion"]:checked');

        var opcionesSeleccionadas = document.querySelectorAll('input[name="opciones"]:checked');
        var seleccionesFructificaciones = document.querySelectorAll('input[name="selecciones"]:checked');
        var opciones = document.querySelectorAll('input[name="opciones"]:checked');
        var opcionesramas = document.querySelectorAll('input[name="opcionesramas"]:checked');
        var opcioneshojas = document.querySelectorAll('input[name="opcioneshojas"]:checked');
        var opcionesReducción = document.querySelectorAll('input[name="opcionesReducción"]:checked');
        var opcionesOBJETIVOS = document.querySelectorAll('input[name="opcionesOBJETIVOS"]:checked');

        var fisurasSeleccionadas = document.querySelector('input[name="provoca_fisuras"]:checked');

        var pequenasSeleccion = document.querySelectorAll('input[name^="pequenas"]:checked');
        var grandesSeleccion = document.querySelectorAll('input[name^="grandes"]:checked');

        generatePDF(
            fecha,
            aviso,
            arme,
            Cavidad,
            especie,
            numero,
            calle,
            secoRadio,
            edadRadio,
            Altura,
            inclinacionRadio,
            DAP,
            pequenasSeleccion,
            grandesSeleccion,
            opcionesSeleccionadas,
            seleccionesFructificaciones,
            Espesor,
            opciones,
            fisurasSeleccionadas,
            opcionesramas,
            opcioneshojas,
            SíntomasE,
            opcionesOBJETIVOS,
            opcionesReducción,
            OBSERVACIONES,
            Calle2,
            Informe,
            NYP,
            DNI
        );
    });
});

async function generatePDF(
    fecha,
    aviso,
    arme,
    Cavidad,
    especie,
    numero,
    calle,
    secoRadio,
    edadRadio,
    Altura,
    inclinacionRadio,
    DAP,
    pequenasSeleccion,
    grandesSeleccion,
    opcionesSeleccionadas,
    seleccionesFructificaciones,
    Espesor,
    opciones,
    fisurasSeleccionadas,
    opcionesramas,
    opcioneshojas,
    SíntomasE,
    opcionesOBJETIVOS,
    opcionesReducción,
    OBSERVACIONES,
    Calle2,
    Informe,
    NYP,
    DNI
) {

    const imageBackground = await loadImage("Planilla de inspección_page-0001.jpg");
    const segundaPagina = await loadImage("Planilla de inspección_page-0002.jpg");

    const signatureImage = signaturePad.toDataURL();

    // ======================================================
    // INPUTS DE IMÁGENES
    // ======================================================

    const inputImagen = document.getElementById('imagen');
    const inputImagen2 = document.getElementById('imagenD');

    const imagenFile = inputImagen ? inputImagen.files[0] : null;
    const imagenFile2 = inputImagen2 ? inputImagen2.files[0] : null;

    let imagenDataURL = null;
    let imagenDataURL2 = null;

    // ======================================================
    // CARGAR FOTOS SOLO SI ESTÁ ACTIVADO
    // ======================================================

    if (INCLUIR_FOTOS_EN_PDF === true) {

        if (imagenFile) {
            imagenDataURL = await loadImage(
                URL.createObjectURL(imagenFile)
            );
        }

        if (imagenFile2) {
            imagenDataURL2 = await loadImage(
                URL.createObjectURL(imagenFile2)
            );
        }
    }

    const img = new Image();

    img.src = imageBackground;

    img.onload = function () {

        const imgWidth = img.width;
        const imgHeight = img.height;

        const pdf = new jsPDF('p', 'pt', [imgWidth, imgHeight]);

        // ======================================================
        // PÁGINA 1
        // ======================================================

        pdf.addImage(imageBackground, 'PNG', 0, 0, imgWidth, imgHeight);

        pdf.addImage(
            signatureImage,
            'PNG',
            imgWidth * 0.36,
            imgHeight * 0.950,
            imgWidth * 0.25,
            imgHeight * 0.05
        );

        pdf.setFontSize(20);

        pdf.text(aviso, imgWidth * 0.11, imgHeight * 0.102);
        pdf.text(fecha, imgWidth * 0.88, imgHeight * 0.087);
        pdf.text(especie, imgWidth * 0.43, imgHeight * 0.156);
        pdf.text(calle, imgWidth * 0.10, imgHeight * 0.182);
        pdf.text(numero, imgWidth * 0.50, imgHeight * 0.182);
        pdf.text(arme, imgWidth * 0.59, imgHeight * 0.110);
        pdf.text(Altura, imgWidth * 0.18, imgHeight * 0.235);
        pdf.text(DAP, imgWidth * 0.41, imgHeight * 0.235);
        pdf.text(Cavidad, imgWidth * 0.65, imgHeight * 0.345);
        pdf.text(Espesor, imgWidth * 0.65, imgHeight * 0.370);
        pdf.text(SíntomasE, imgWidth * 0.46, imgHeight * 0.537);
        pdf.text(NYP, imgWidth * 0.10, imgHeight * 0.985);
        pdf.text(DNI, imgWidth * 0.75, imgHeight * 0.985);

        // ======================================================
        // OBSERVACIONES
        // ======================================================

        var maxWidth = 700;
        var fontSize = 12;
        var lineHeight = 50;

        function renderTextWithOverflow(text, x, y, maxWidth, lineHeight) {

            var words = text.split(' ');
            var line = '';
            var lines = [];

            for (var i = 0; i < words.length; i++) {

                var testLine = line + words[i] + ' ';

                var testWidth =
                    pdf.getStringUnitWidth(testLine) * fontSize;

                if (testWidth > maxWidth && i > 0) {

                    lines.push(line);
                    line = words[i] + ' ';

                } else {

                    line = testLine;
                }
            }

            lines.push(line);

            for (var j = 0; j < lines.length; j++) {

                pdf.text(lines[j], x, y);

                y += lineHeight;
            }
        }

        renderTextWithOverflow(
            OBSERVACIONES,
            imgWidth * 0.05,
            imgHeight * 0.730,
            maxWidth,
            lineHeight
        );

        // ======================================================
        // PÁGINA 2
        // ======================================================

        pdf.addPage([imgWidth, imgHeight]);

        pdf.addImage(
            segundaPagina,
            'PNG',
            0,
            0,
            imgWidth,
            imgHeight
        );

        // ======================================================
        // AGREGAR FOTOS SOLO SI ESTÁ HABILITADO
        // ======================================================

        if (INCLUIR_FOTOS_EN_PDF === true) {

            if (imagenDataURL) {

                pdf.addImage(
                    imagenDataURL,
                    'PNG',
                    imgWidth * 0.25,
                    imgHeight * 0.1,
                    imgWidth * 0.50,
                    imgHeight * 0.30
                );
            }

            if (imagenDataURL2) {

                pdf.addImage(
                    imagenDataURL2,
                    'PNG',
                    imgWidth * 0.25,
                    imgHeight * 0.5,
                    imgWidth * 0.50,
                    imgHeight * 0.30
                );
            }
        }

        pdf.text(Calle2, imgWidth * 0.15, imgHeight * 0.070);

        pdf.text(Informe, imgWidth * 0.64, imgHeight * 0.916);

        // ======================================================
        // GUARDAR PDF
        // ======================================================

        if (calle !== null && calle !== "") {

            pdf.save(calle + numero + ".pdf");

        } else {

            pdf.save("example.pdf");
        }

        // ======================================================
        // LIMPIAR FORMULARIO
        // ======================================================

        resetForm();
    };
}

function resetForm() {

    document.querySelector('#form').reset();

    signaturePad.clear();
}

// ======================================================
// BORRAR FIRMA
// ======================================================

document.getElementById('borrarFirma')
    .addEventListener('click', function () {

        clearSignature();
    });

function clearSignature() {

    signaturePad.clear();
}