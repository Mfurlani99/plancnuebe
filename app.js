function loadImage(url) {
    return new Promise(resolve => {
        const xhr = new XMLHttpRequest();
        xhr.open('GET', url, true);
        xhr.responseType = "blob";
        xhr.onload = function (e) {
            const reader = new FileReader();
            reader.onload = function (event) {
                const res = event.target.result;
                resolve(res);
            }
            const file = this.response;
            reader.readAsDataURL(file);
        }
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
        let OBSERVACIONES = document.getElementById('OBSERVACIONES').value
        let Informe = document.getElementById('Informe').value
        let Calle2 = document.getElementById('Calle2').value
        let NYP = document.getElementById('NYP').value
        let DNI = document.getElementById('DNI').value
        var secoRadio = document.querySelector('input[name="Seco"]:checked');
        var edadRadio = document.querySelector('input[name="Edad"]:checked');
        var inclinacionRadio = document.querySelector('input[name="inclinacion"]:checked');
        var pequenasSeleccion = document.querySelector('input[name="pequenas"]:checked');
        var grandesSeleccion = document.querySelector('input[name="grandes"]:checked');
        var opcionesSeleccionadas = document.querySelectorAll('input[name="opciones"]:checked');
        var seleccionesFructificaciones = document.querySelectorAll('input[name="selecciones"]:checked');
        var opciones = document.querySelectorAll('input[name="opciones"]:checked');
        var opcionesramas = document.querySelectorAll('input[name="opcionesramas"]:checked');
        var opcioneshojas = document.querySelectorAll('input[name="opcioneshojas"]:checked');
        var opcionesReducción = document.querySelectorAll('input[name="opcionesReducción"]:checked');
        var opcionesOBJETIVOS = document.querySelectorAll('input[name="opcionesOBJETIVOS"]:checked');
        var fisurasSeleccionadas = document.querySelector('input[name="provoca_fisuras"]:checked');
        var secoRadio = document.querySelector('input[name="Seco"]:checked');


        generatePDF(fecha, aviso, arme, Cavidad, especie, numero, calle, secoRadio, edadRadio, Altura,
            inclinacionRadio, DAP, pequenasSeleccion, grandesSeleccion, opcionesSeleccionadas, seleccionesFructificaciones, Espesor,
            opciones, fisurasSeleccionadas, opcionesramas, opcioneshojas, SíntomasE, opcionesOBJETIVOS, opcionesReducción, OBSERVACIONES, Calle2, Informe, NYP, DNI);
    });
});

async function generatePDF(fecha, aviso, arme, Cavidad, especie, numero, calle, secoRadio, edadRadio, Altura, inclinacionRadio, DAP, pequenasSeleccion,
    grandesSeleccion, opcionesSeleccionadas, seleccionesFructificaciones, Espesor, opciones, fisurasSeleccionadas, opcionesramas, opcioneshojas,
    SíntomasE, opcionesOBJETIVOS, opcionesReducción, OBSERVACIONES, Calle2, Informe, NYP, DNI) {
    const imageBackground = await loadImage("Planilla de inspección_page-0001.jpg");
    const signatureImage = signaturePad.toDataURL();
    const inputImagen = document.getElementById('imagen');
    const inputImagen2 = document.getElementById('imagenD');
    const imagenFile2 = inputImagen2.files[0];
    const imagenFile = inputImagen.files[0];
    const imagenDataURL = await loadImage(URL.createObjectURL(imagenFile));
    const imagenDataURL2 = await loadImage(URL.createObjectURL(imagenFile2));
    const segundaPagina = await loadImage("Planilla de inspección_page-0002.jpg");

    const img = new Image();
    img.src = imageBackground;
    img.onload = function () {
        const imgWidth = img.width;
        const imgHeight = img.height;
        const pdf = new jsPDF('p', 'pt', [imgWidth, imgHeight]);

        // Página 1
        pdf.addImage(imageBackground, 'PNG', 0, 0, imgWidth, imgHeight);
        pdf.addImage(signatureImage, 'PNG', imgWidth * 0.36, imgHeight * 0.950, imgWidth * 0.25, imgHeight * 0.05);

        pdf.setFontSize(20);
        pdf.text(aviso, imgWidth * 0.11, imgHeight * 0.102); //listo
        pdf.text(fecha, imgWidth * 0.88, imgHeight * 0.087); //listo
        pdf.text(especie, imgWidth * 0.43, imgHeight * 0.156); //listo
        pdf.text(calle, imgWidth * 0.10, imgHeight * 0.182); //listo
        pdf.text(numero, imgWidth * 0.50, imgHeight * 0.182); //listo
        pdf.text(arme, imgWidth * 0.59, imgHeight * 0.110); //listo
        pdf.text(Altura, imgWidth * 0.18, imgHeight * 0.235);//listo
        pdf.text(DAP, imgWidth * 0.41, imgHeight * 0.235);//listo
        pdf.text(Cavidad, imgWidth * 0.65, imgHeight * 0.345);//listo
        pdf.text(Espesor, imgWidth * 0.65, imgHeight * 0.370);//listo
        pdf.text(SíntomasE, imgWidth * 0.46, imgHeight * 0.537);//listo
        pdf.text(NYP, imgWidth * 0.10, imgHeight * 0.985);//listo
        pdf.text(DNI, imgWidth * 0.75, imgHeight * 0.985);//listo
        // Define la variable maxWidth
        var maxWidth = 700; // Duplicado del valor original (200 * 2)

        // Definir la función para renderizar texto con manejo de desbordamiento
        function renderTextWithOverflow(text, x, y, maxWidth, lineHeight) {
            var words = text.split(' ');
            var line = '';
            var lines = [];

            for (var i = 0; i < words.length; i++) {
                var testLine = line + words[i] + ' ';
                var testWidth = pdf.getStringUnitWidth(testLine) * fontSize; // Ajusta fontSize según tus necesidades

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

        // Aquí defines fontSize y lineHeight
        var fontSize = 12; // Cambia este valor según tus necesidades
        var lineHeight = 50; // Cambia este valor según tus necesidades

        // Llamar a la función con el texto y las coordenadas
        renderTextWithOverflow(OBSERVACIONES, imgWidth * 0.05, imgHeight * 0.730, maxWidth, lineHeight);





        if (secoRadio) {
            var secoValue = parseInt(secoRadio.value);
            if (secoValue === 1) {
                pdf.circle(833, 305, 10, 'FD');
            } else if (secoValue === 2) {
                pdf.circle(1000, 305, 10, 'FD');
            }
        } else {
            // Manejar el caso en que no se haya seleccionado ninguna opción
        }

        if (edadRadio) {
            var edadValue = parseInt(edadRadio.value);
            if (edadValue === 1) {
                pdf.circle(890, 400, 10, 'FD');
            } else if (edadValue === 2) {
                pdf.circle(1050, 400, 10, 'FD');
            }
        } else {
            // Manejar el caso en que no se haya seleccionado ninguna opción
        }

        if (inclinacionRadio) {
            var inclinacionValue = parseInt(inclinacionRadio.value);
            if (inclinacionValue === 1) {
                // Hacer algo si la inclinación es "Sí"
                pdf.circle(800, 400, 8, 'FD')
            } else if (inclinacionValue === 0) {
                // Hacer algo si la inclinación es "No"
                pdf.circle(840, 400, 8, 'FD')
            }
        } else {
            // Manejar el caso en que no se haya seleccionado ninguna opción
        }

        opcionesSeleccionadas.forEach(function (opcion) {
            var valorOpcion = opcion.value;
            console.log('Opción seleccionada: ' + valorOpcion);

            // Realizar alguna acción, por ejemplo, marcar en la planilla
            if (valorOpcion === 'hacia_la_calle') {
                pdf.circle(354, 442, 10, 'FD'); // Ejemplo de acción
            } else if (valorOpcion === 'descopado') {
                pdf.circle(354, 482, 10, 'FD');
            } else if (valorOpcion === 'hacia_la_propiedad') {
                pdf.circle(534, 442, 10, 'FD');
            } else if (valorOpcion === 'descopado_y_brotado') {
                pdf.circle(534, 482, 10, 'FD');
            } else if (valorOpcion === 'hacia_el_largo_de_la_vereda') {
                pdf.circle(804, 442, 10, 'FD');
            } else if (valorOpcion === 'copa_desbalanceada') {
                pdf.circle(804, 482, 10, 'FD');
            }
        });

        if (opcionesSeleccionadas.length === 0) {
            console.log('No se ha seleccionado ninguna opción.');
        }

        //RAIZ

        opciones.forEach(function (opcion) {
            var valorOpcion = opcion.value;
            console.log('Opción seleccionada: ' + valorOpcion);

            // Realizar alguna acción para las opciones seleccionadas
            if (valorOpcion === 'expuesta') {
                // Pintar un círculo para "Expuesta"
                pdf.circle(192, 700, 10, 'FD');
            } else if (valorOpcion === 'levanta_vereda_m2') {
                // Pintar un círculo para "Levanta vereda m2"
                pdf.circle(350, 700, 10, 'FD');
            }
        });

        if (fisurasSeleccionadas) {
            var valorFisuras = fisurasSeleccionadas.value;
            console.log('Provoca fisuras en el frente de la propiedad: ' + valorFisuras);
            // Realizar alguna acción basada en si provoca fisuras o no
            if (valorFisuras === 'si') {
                // Pintar un círculo si provoca fisuras
                pdf.circle(1048, 700, 10, 'FD');
            } if (valorFisuras === 'no') {
                pdf.circle(1130, 700, 10, 'FD');
            }
        } else {
            console.log('No se ha seleccionado la opción de fisuras.');
        }

        if (opciones.length === 0 && !fisurasSeleccionadas) {
            console.log('No se ha seleccionado ninguna opción.');
        }

        //RAMA

        opcionesramas.forEach(function (opcionesramas) {
            var valorramas = opcionesramas.value;
            console.log('Opción seleccionada: ' + opcionesramas);

            // Realizar alguna acción, por ejemplo, marcar en la planilla
            if (valorramas === 'Tocones') {
                pdf.circle(214, 755, 10, 'FD'); // Ejemplo de acción
            } else if (valorramas === 'Quebradasf') {
                pdf.circle(78, 800, 10, 'FD');
            } else if (valorramas === 'Codominancias') {
                pdf.circle(78, 838, 10, 'FD');
            } else if (valorramas === 'ExcesivasC') {
                pdf.circle(408, 760, 10, 'FD');
            } else if (valorramas === 'secasP') {
                pdf.circle(408, 800, 10, 'FD');
            } else if (valorramas === 'cavidadesTC') {
                pdf.circle(408, 838, 10, 'FD');
            } else if (valorramas === 'anguloI') {
                pdf.circle(825, 760, 10, 'FD');
            } else if (valorramas === 'Bajas') {
                pdf.circle(825, 800, 10, 'FD');
            } else if (valorramas === 'espacio_aereo') {
                pdf.circle(825, 838, 10, 'FD');
            }

        });

        if (opcionesramas.length === 0) {
            console.log('No se ha seleccionado ninguna opción.');
        }


        //HOJAS
        opcioneshojas.forEach(function (opcioneshojas) {
            var valorhojas = opcioneshojas.value;
            console.log('Opción seleccionada: ' + opcioneshojas);

            // Realizar alguna acción, por ejemplo, marcar en la planilla
            if (valorhojas === 'coloración') {
                pdf.circle(204, 895, 10, 'FD');
            } else if (valorhojas === 'DefoliaciónT') {
                pdf.circle(467, 895, 10, 'FD');
            } else if (valorhojas === 'signosInsectos') {
                pdf.circle(685, 895, 10, 'FD');
            } else if (valorhojas === 'manchasFol') {
                pdf.circle(955, 895, 10, 'FD');
            } else if (valorhojas === 'Defoliaciónp') {
                pdf.circle(78, 938, 10, 'FD');
            }
        });

        if (opcionesramas.length === 0) {
            console.log('No se ha seleccionado ninguna opción.');
        }

        //fuste

        seleccionesFructificaciones.forEach(function (opcion) {
            var valorOpcion = opcion.value;
            console.log('Opción seleccionada: ' + valorOpcion);

            // Realizar alguna acción, por ejemplo, marcar en la planilla
            if (valorOpcion === 'fructificaciones') {
                pdf.circle(469, 541, 10, 'FD'); // Ejemplo de acción
            } else if (valorOpcion === 'chorreados') {
                pdf.circle(785, 541, 10, 'FD');
            } else if (valorOpcion === 'codominancias') {
                pdf.circle(980, 541, 10, 'FD');
            }
        });

        if (seleccionesFructificaciones.length === 0) {
            console.log('No se ha seleccionado ninguna opción.');
        }

        if (pequenasSeleccion) {
            console.log('Pequeñas: ' + pequenasSeleccion.value);
            // Realizar alguna acción, por ejemplo, marcar en la planilla
            if (pequenasSeleccion.value === 'basal') {
                pdf.circle(220, 605, 10, 'FD'); // Ejemplo de acción
            } else if (pequenasSeleccion.value === 'media') {
                pdf.circle(300, 605, 10, 'FD');
            } else if (pequenasSeleccion.value === 'alto') {
                pdf.circle(400, 605, 10, 'FD');
            }
        } else {
            console.log('No se ha seleccionado ninguna opción para "Pequeñas".');
        }

        if (grandesSeleccion) {
            console.log('Grandes: ' + grandesSeleccion.value);
            // Realizar alguna acción, por ejemplo, marcar en la planilla
            if (grandesSeleccion.value === 'basal') {
                pdf.circle(220, 640, 10, 'FD'); // Ejemplo de acción
            } else if (grandesSeleccion.value === 'media') {
                pdf.circle(300, 640, 10, 'FD');
            } else if (grandesSeleccion.value === 'alto') {
                pdf.circle(400, 640, 10, 'FD');
            }
        } else {
            console.log('No se ha seleccionado ninguna opción para "Grandes".');
        }

        //RECOMENDACIONES DEL INSPECTOR

        opcionesOBJETIVOS.forEach(function (opcionesOBJETIVOS) {
            var valorobjetivos = opcionesOBJETIVOS.value;
            console.log('Opción seleccionada: ' + opcionesOBJETIVOS);

            // Realizar alguna acción, por ejemplo, marcar en la planilla
            if (valorobjetivos === 'RegulaciónE') {
                pdf.circle(75, 1160, 10, 'FD'); // Ejemplo de acción
            } else if (valorobjetivos === 'ReducciónR') {
                pdf.circle(75, 1055, 10, 'FD');
            } else if (valorobjetivos === 'Einterferencias') {
                pdf.circle(75, 1093, 10, 'FD');
            } else if (valorobjetivos === 'AdecuaciónS') {
                pdf.circle(75, 1127, 10, 'FD');
            }
        });

        if (opcionesramas.length === 0) {
            console.log('No se ha seleccionado ninguna opción.');
        }

        if (opcionesramas.length === 0) {
            console.log('No se ha seleccionado ninguna opción.');
        }


        opcionesReducción.forEach(function (opcionesReducción) {
            var valorreduccion = opcionesReducción.value;
            console.log('Opción seleccionada: ' + opcionesReducción);

            // Realizar alguna acción, por ejemplo, marcar en la planilla
            if (valorreduccion === 'Formación') {
                pdf.circle(409, 1058, 10, 'FD'); // Ejemplo de acción
            } else if (valorreduccion === 'Limpieza') {
                pdf.circle(409, 1093, 10, 'FD');
            } else if (valorreduccion === 'Aclareo') {
                pdf.circle(409, 1127, 10, 'FD');
            } else if (valorreduccion === 'Refaldado') {
                pdf.circle(409, 1160, 10, 'FD');
            } else if (valorreduccion === 'Terciado') {
                pdf.circle(409, 1195, 10, 'FD');
            } else if (valorreduccion === 'BalanceoO') {
                pdf.circle(635, 1058, 10, 'FD');
            } else if (valorreduccion === 'CEXTRACCIÓN') {
                pdf.circle(635, 1085, 10, 'FD');
            } else if (valorreduccion === 'ETRASPLANTE') {
                pdf.circle(635, 1128, 10, 'FD');
            } else if (valorreduccion === 'DTRATAMIENTO') {
                pdf.circle(635, 1173, 10, 'FD');
            } else if (valorreduccion === 'SuperficialF') {
                pdf.circle(995, 1090, 10, 'FD');
            } else if (valorreduccion === 'ProfundaF') {
                pdf.circle(995, 1128, 10, 'FD');
            }
        });



        if (opcionesramas.length === 0) {
            console.log('No se ha seleccionado ninguna opción.');
        }


        // Página 2
        pdf.addPage([imgWidth, imgHeight]);
        pdf.addImage(segundaPagina, 'PNG', 0, 0, imgWidth, imgHeight);
        pdf.addImage(imagenDataURL, 'PNG', imgWidth * 0.25, imgHeight * 0.1, imgWidth * 0.50, imgHeight * 0.30);
        pdf.addImage(imagenDataURL2, 'PNG', imgWidth * 0.25, imgHeight * 0.5, imgWidth * 0.50, imgHeight * 0.30);

        pdf.text(Calle2, imgWidth * 0.15, imgHeight * 0.070);
        pdf.text(Informe, imgWidth * 0.64, imgHeight * 0.916);

        if (calle !== null) {
            pdf.save(calle + numero + ".pdf");
        } if (calle == null) {
            pdf.save("example.pdf");
        }


        // Reinicia el formulario y la firma
        resetForm();
    };
}

function resetForm() {
    // Limpiar los campos del formulario
    document.querySelector('#form').reset();

    // Limpiar la firma en el lienzo
    signaturePad.clear();
}

// Agregar un event listener al botón de borrar firma
document.getElementById('borrarFirma').addEventListener('click', function() {
    // Llamar a la función para limpiar la firma
    clearSignature();
});

// Función para limpiar la firma
function clearSignature() {
    // Limpiar la firma en el lienzo
    signaturePad.clear();
}
