/* ============================================================
   LIMPIADOR DE ENCUESTA UNMSM - VERSIÓN GOOGLE + CSV
   ============================================================

   FUENTES DE DATOS:

   Google Forms
        ↓
   Google Sheets
        ↓
   datosGoogle.js
        ↓
   app.js

   CSV
        ↓
   app.js

   REGLA DEFINITIVA DE APP.JS:

   - Filas originales 2 a 19:
       EXCLUIDAS

   - Filas originales 20 en adelante:
       VÁLIDAS

   IMPORTANTE:

   - No se cruzan respuestas entre filas.
   - No se reconstruyen respuestas.
   - No se combinan datos de diferentes estudiantes.
   - Cada estudiante conserva exclusivamente sus propios valores.
   - Se trabaja con las posiciones originales de las 31 columnas.
   - datosGoogle.js SOLO descarga los datos.
   - app.js realiza su propio filtrado y normalización.

   ============================================================ */


/* ============================================================
   VARIABLES
   ============================================================ */

let datosOriginales = [];
let datosValidos = [];
let datosExcluidos = [];

let encabezadosOriginales = [];

let archivoActual = null;

let fuenteActual = "";

let cargaGoogleEnCurso = false;


/* ============================================================
   ELEMENTOS HTML
   ============================================================ */

const inputArchivo =
    document.getElementById("archivoCSV");

const nombreArchivo =
    document.getElementById("nombreArchivo");

const totalRespuestas =
    document.getElementById("totalRespuestas");

const respuestasValidas =
    document.getElementById("respuestasValidas");

const respuestasExcluidas =
    document.getElementById("respuestasExcluidas");

const columnasDetectadas =
    document.getElementById("columnasDetectadas");

const mensaje =
    document.getElementById("mensaje");

const btnExportar =
    document.getElementById("btnExportar");

const tablaPreview =
    document.getElementById("tablaPreview");


/* ============================================================
   EVENTO: SELECCIONAR ARCHIVO CSV
   ============================================================ */

if (inputArchivo) {

    inputArchivo.addEventListener(
        "change",
        function () {

            const archivo =
                this.files[0];

            if (!archivo) {
                return;
            }

            archivoActual =
                archivo;

            fuenteActual =
                "CSV";

            if (nombreArchivo) {
                nombreArchivo.textContent =
                    "Archivo seleccionado: " +
                    archivo.name;
            }

            leerCSV(archivo);
        }
    );
}


/* ============================================================
   LEER CSV
   ============================================================ */

function leerCSV(archivo) {

    const lector =
        new FileReader();

    lector.onload =
        function (evento) {

            try {

                const contenido =
                    evento.target.result;

                procesarCSV(
                    contenido
                );

            } catch (error) {

                console.error(
                    error
                );

                if (mensaje) {
                    mensaje.textContent =
                        "Error al procesar el archivo: " +
                        error.message;
                }

                if (btnExportar) {
                    btnExportar.disabled =
                        true;
                }
            }
        };

    lector.readAsText(
        archivo,
        "UTF-8"
    );
}


/* ============================================================
   LIMPIAR TEXTO
   ============================================================ */

function limpiarTexto(valor) {

    if (
        valor === null ||
        valor === undefined
    ) {
        return "";
    }

    return String(valor)
        .replace(/^\uFEFF/, "")
        .replace(/\u00A0/g, " ")
        .replace(/\r/g, "")
        .trim();
}


/* ============================================================
   REPARAR CARACTERES MAL CODIFICADOS
   ============================================================ */

function repararTexto(valor) {

    let texto =
        limpiarTexto(valor);

    if (!texto) {
        return "";
    }

    const pareceMojibake =
        /Ã|Â|â€|â€™|â€œ|â€|â€“|â€”|�/
            .test(texto);

    if (!pareceMojibake) {
        return texto;
    }

    try {

        const bytes =
            new Uint8Array(
                [...texto].map(
                    caracter =>
                        caracter.charCodeAt(0) & 0xFF
                )
            );

        const reparado =
            new TextDecoder(
                "utf-8"
            ).decode(bytes);

        if (
            reparado &&
            reparado !== texto &&
            !reparado.includes("�")
        ) {
            return reparado;
        }

    } catch (error) {

        console.warn(
            "No se pudo reparar:",
            texto
        );
    }

    return texto;
}


/* ============================================================
   DETECTAR SEPARADOR
   ============================================================ */

function detectarSeparador(texto) {

    const primeraLinea =
        texto.split("\n")[0];

    const comas =
        (
            primeraLinea.match(/,/g) ||
            []
        ).length;

    const puntoComas =
        (
            primeraLinea.match(/;/g) ||
            []
        ).length;

    if (
        puntoComas > comas
    ) {
        return ";";
    }

    return ",";
}


/* ============================================================
   PARSER CSV
   ============================================================ */

function parsearCSV(
    texto,
    separador
) {

    const filas = [];

    let fila = [];

    let campo = "";

    let dentroComillas =
        false;

    for (
        let i = 0;
        i < texto.length;
        i++
    ) {

        const caracter =
            texto[i];

        const siguiente =
            texto[i + 1];


        /* -----------------------------------------
           COMILLAS
           ----------------------------------------- */

        if (
            caracter === '"'
        ) {

            if (
                dentroComillas &&
                siguiente === '"'
            ) {

                campo += '"';

                i++;

                continue;
            }

            dentroComillas =
                !dentroComillas;

            continue;
        }


        /* -----------------------------------------
           SEPARADOR
           ----------------------------------------- */

        if (
            caracter === separador &&
            !dentroComillas
        ) {

            fila.push(
                repararTexto(
                    campo
                )
            );

            campo = "";

            continue;
        }


        /* -----------------------------------------
           SALTO DE LÍNEA
           ----------------------------------------- */

        if (
            (
                caracter === "\n" ||
                caracter === "\r"
            ) &&
            !dentroComillas
        ) {

            if (
                caracter === "\r" &&
                siguiente === "\n"
            ) {
                i++;
            }

            fila.push(
                repararTexto(
                    campo
                )
            );

            campo = "";

            if (
                fila.some(
                    valor =>
                        valor !== ""
                )
            ) {

                filas.push(
                    fila
                );
            }

            fila = [];

            continue;
        }

        campo += caracter;
    }


    /* -----------------------------------------
       ÚLTIMA FILA
       ----------------------------------------- */

    if (
        campo !== "" ||
        fila.length > 0
    ) {

        fila.push(
            repararTexto(
                campo
            )
        );

        if (
            fila.some(
                valor =>
                    valor !== ""
            )
        ) {

            filas.push(
                fila
            );
        }
    }

    return filas;
}


/* ============================================================
   NORMALIZAR CANTIDAD DE COLUMNAS
   ============================================================ */

function normalizarNumeroColumnas(
    fila,
    cantidadColumnas
) {

    const resultado = [];

    for (
        let i = 0;
        i < cantidadColumnas;
        i++
    ) {

        if (
            i < fila.length
        ) {

            resultado.push(
                repararTexto(
                    fila[i]
                )
            );

        } else {

            resultado.push("");
        }
    }

    return resultado;
}


/* ============================================================
   PROCESADOR CENTRAL
   ============================================================

   Esta función es utilizada tanto por:

   - CSV
   - Google Sheets

   IMPORTANTE:

   Aquí NO se mezclan respuestas.

   Cada fila recibida se convierte en un registro
   independiente.

   ============================================================ */

function procesarFilasEncuesta(
    encabezados,
    filasDatos,
    fuente = "Desconocida"
) {

    if (
        !Array.isArray(encabezados)
    ) {

        throw new Error(
            "Los encabezados no tienen un formato válido."
        );
    }

    if (
        !Array.isArray(filasDatos)
    ) {

        throw new Error(
            "Las filas de datos no tienen un formato válido."
        );
    }


    /* -----------------------------------------
       ENCABEZADOS
       ----------------------------------------- */

    encabezadosOriginales =
        encabezados.map(
            encabezado =>
                repararTexto(
                    encabezado
                )
        );


    /* -----------------------------------------
       REINICIAR DATOS
       ----------------------------------------- */

    datosOriginales = [];

    datosValidos = [];

    datosExcluidos = [];

    fuenteActual =
        fuente;


    /* -----------------------------------------
       PROCESAR CADA FILA
       ----------------------------------------- */

    filasDatos.forEach(
        function (
            fila,
            indice
        ) {

            /*
             * La primera fila de la hoja/CSV
             * corresponde a los encabezados.
             *
             * Por eso:
             *
             * indice 0 → fila original 2
             * indice 1 → fila original 3
             * ...
             */

            const filaExcel =
                indice + 2;


            /*
             * Cada fila es normalizada
             * individualmente.
             */

            const filaNormalizada =
                normalizarNumeroColumnas(
                    Array.isArray(fila)
                        ? fila
                        : [],
                    encabezadosOriginales.length
                );


            /*
             * Registro independiente.
             */

            const registro = {

                filaOriginal:
                    filaExcel,

                valores:
                    filaNormalizada
            };


            datosOriginales.push(
                registro
            );


            /* -----------------------------------------
               REGLA DEFINITIVA
               ----------------------------------------- */

            if (
                filaExcel >= 20
            ) {

                datosValidos.push(
                    registro
                );

            } else {

                datosExcluidos.push(
                    registro
                );
            }
        }
    );


    /* -----------------------------------------
       ACTUALIZAR INTERFAZ
       ----------------------------------------- */

    actualizarEstadisticas();

    mostrarPreview();


    if (mensaje) {

        mensaje.textContent =
            (
                fuente === "Google Sheets"

                    ? "Datos obtenidos automáticamente desde Google Sheets. "

                    : "Archivo procesado correctamente. "
            ) +

            datosValidos.length +

            " respuestas válidas encontradas.";
    }


    if (btnExportar) {

        btnExportar.disabled =
            datosValidos.length === 0;
    }


    console.log(
        "=========================================="
    );

    console.log(
        "APP.JS - DATOS PROCESADOS"
    );

    console.log(
        "Fuente:",
        fuenteActual
    );

    console.log(
        "Total de respuestas:",
        datosOriginales.length
    );

    console.log(
        "Respuestas válidas:",
        datosValidos.length
    );

    console.log(
        "Respuestas excluidas:",
        datosExcluidos.length
    );

    console.log(
        "Columnas:",
        encabezadosOriginales.length
    );

    console.log(
        "=========================================="
    );
}


/* ============================================================
   PROCESAR CSV
   ============================================================ */

function procesarCSV(texto) {

    const separador =
        detectarSeparador(
            texto
        );

    const filas =
        parsearCSV(
            texto,
            separador
        );

    if (
        filas.length < 2
    ) {

        throw new Error(
            "El CSV no contiene suficientes datos."
        );
    }


    const encabezados =
        filas[0];


    const filasDatos =
        filas.slice(1);


    procesarFilasEncuesta(
        encabezados,
        filasDatos,
        "CSV"
    );
}


/* ============================================================
   CARGAR DATOS DESDE GOOGLE SHEETS
   ============================================================

   datosGoogle.js debe estar cargado antes que app.js.

   datosGoogle.js NO filtra.

   app.js recibe:

       window.ENCABEZADOS_GOOGLE
       window.FILAS_GOOGLE

   y realiza su propio procesamiento.

   ============================================================ */

async function cargarDatosDesdeGoogle() {

    if (cargaGoogleEnCurso) {
        console.log(
            "⏳ Ya existe una carga de Google en curso."
        );
        return;
    }

    cargaGoogleEnCurso = true;


    try {

        console.log(
            "🌐 APP.JS: solicitando datos de Google Sheets..."
        );


        /*
         * Si datosGoogle.js todavía no ha descargado
         * los datos, utilizamos su función.
         */

        if (
            typeof obtenerDatosGoogle !==
            "function"
        ) {

            throw new Error(
                "No se encontró obtenerDatosGoogle(). Verifica que datosGoogle.js esté cargado antes de app.js."
            );
        }


        let datosGoogle;


        /*
         * Si ya existen datos descargados,
         * los reutilizamos.
         */

        if (
            Array.isArray(
                window.FILAS_GOOGLE
            ) &&
            Array.isArray(
                window.ENCABEZADOS_GOOGLE
            ) &&
            window.FILAS_GOOGLE.length > 0
        ) {

            console.log(
                "♻️ APP.JS: reutilizando datos de Google ya descargados."
            );

            datosGoogle = {

                filas:
                    window.FILAS_GOOGLE,

                encabezados:
                    window.ENCABEZADOS_GOOGLE
            };

        } else {

            datosGoogle =
                await obtenerDatosGoogle();
        }


        /* -----------------------------------------
           VALIDAR RESPUESTA
           ----------------------------------------- */

        if (
            !datosGoogle ||
            !Array.isArray(
                datosGoogle.filas
            ) ||
            !Array.isArray(
                datosGoogle.encabezados
            )
        ) {

            throw new Error(
                "Google no devolvió una estructura válida de datos."
            );
        }


        /* -----------------------------------------
           GUARDAR DATOS CRUDOS
           ----------------------------------------- */

        window.FILAS_GOOGLE =
            datosGoogle.filas;

        window.ENCABEZADOS_GOOGLE =
            datosGoogle.encabezados;


        /*
         * IMPORTANTE:
         *
         * Aquí NO se normaliza.
         *
         * app.js recibe directamente
         * las filas originales.
         */

        procesarFilasEncuesta(

            datosGoogle.encabezados,

            datosGoogle.filas,

            "Google Sheets"
        );


        /*
         * Nombre virtual de la fuente.
         */

        archivoActual = {

            name:
                "Google_Sheets_Encuesta_Estres_2026_2"
        };


        if (nombreArchivo) {

            nombreArchivo.textContent =
                "Fuente: Google Sheets | " +
                datosGoogle.filas.length +
                " respuestas";
        }


        console.log(
            "✅ APP.JS: Google Sheets procesado correctamente."
        );

        console.log(
            "📊 Filas recibidas:",
            datosGoogle.filas.length
        );

        console.log(
            "📋 Columnas recibidas:",
            datosGoogle.encabezados.length
        );


    } catch (error) {

        console.error(
            "❌ APP.JS: error cargando Google Sheets:",
            error
        );


        /*
         * No deshabilitamos necesariamente
         * el sistema completo.
         *
         * El CSV continúa disponible como
         * mecanismo de respaldo.
         */

        if (mensaje) {

            mensaje.textContent =
                "No se pudieron cargar automáticamente los datos de Google Sheets. Puedes utilizar el CSV como respaldo.";
        }


    } finally {

        cargaGoogleEnCurso =
            false;
    }
}


/* ============================================================
   ESTADÍSTICAS
   ============================================================ */

function actualizarEstadisticas() {

    if (totalRespuestas) {

        totalRespuestas.textContent =
            datosOriginales.length;
    }


    if (respuestasValidas) {

        respuestasValidas.textContent =
            datosValidos.length;
    }


    if (respuestasExcluidas) {

        respuestasExcluidas.textContent =
            datosExcluidos.length;
    }


    if (columnasDetectadas) {

        columnasDetectadas.textContent =
            encabezadosOriginales.length;
    }
}


/* ============================================================
   OBTENER VALOR POR POSICIÓN
   ============================================================ */

function valorColumna(
    fila,
    posicion
) {

    if (
        !fila ||
        posicion < 0 ||
        posicion >= fila.length
    ) {

        return "";
    }

    return repararTexto(
        fila[posicion]
    );
}


/* ============================================================
   NORMALIZAR GRUPO
   ============================================================ */

function normalizarGrupo(
    valor
) {

    const texto =
        repararTexto(
            valor
        )
        .toLowerCase()
        .normalize("NFD")
        .replace(
            /[\u0300-\u036f]/g,
            ""
        )
        .trim();


    if (
        texto === "si"
    ) {

        return "UNMSM - Sede Chilca";
    }


    if (
        texto === "no"
    ) {

        return "Otras universidades";
    }


    return texto;
}


/* ============================================================
   CONSTRUIR FILA UNIFICADA
   ============================================================ */

function construirFilaUnificada(
    registro
) {

    /*
     * La fila pertenece exclusivamente
     * a este registro.
     *
     * Nunca se consulta otra fila.
     *
     * No se cruzan estudiantes.
     */

    const fila =
        registro.valores;


    /* -----------------------------------------
       DATOS GENERALES
       ----------------------------------------- */

    const marcaTemporal =
        valorColumna(
            fila,
            0
        );

    const respuestaGrupo =
        valorColumna(
            fila,
            1
        );

    const grupo =
        normalizarGrupo(
            respuestaGrupo
        );


    let universidad = "";

    let sexo = "";

    let edad = "";

    let carrera = "";

    let ciclo = "";


    /* -----------------------------------------
       UNMSM CHILCA
       ----------------------------------------- */

    if (
        grupo ===
        "UNMSM - Sede Chilca"
    ) {

        universidad =
            "UNMSM - Sede Chilca";

        sexo =
            valorColumna(
                fila,
                2
            );

        edad =
            valorColumna(
                fila,
                3
            );

        carrera =
            valorColumna(
                fila,
                4
            );

        ciclo =
            valorColumna(
                fila,
                5
            );
    }


    /* -----------------------------------------
       OTRAS UNIVERSIDADES
       ----------------------------------------- */

    else if (
        grupo ===
        "Otras universidades"
    ) {

        universidad =
            valorColumna(
                fila,
                6
            );


        const otraUniversidad =
            valorColumna(
                fila,
                7
            );


        if (
            universidad
                .toLowerCase()
                .trim() === "otra"
            &&
            otraUniversidad
        ) {

            universidad =
                otraUniversidad;
        }


        sexo =
            valorColumna(
                fila,
                8
            );

        edad =
            valorColumna(
                fila,
                9
            );

        carrera =
            valorColumna(
                fila,
                10
            );

        ciclo =
            valorColumna(
                fila,
                11
            );
    }


    /* -----------------------------------------
       CARGA ACADÉMICA Y ESTILO DE VIDA
       ----------------------------------------- */

    const cursos =
        valorColumna(
            fila,
            12
        );

    const horasSueno =
        valorColumna(
            fila,
            13
        );

    const trabajo =
        valorColumna(
            fila,
            14
        );

    const alimentacion =
        valorColumna(
            fila,
            15
        );


    /* -----------------------------------------
       ESTRÉS ACADÉMICO
       ----------------------------------------- */

    const estres1 =
        valorColumna(
            fila,
            16
        );

    const estres2 =
        valorColumna(
            fila,
            17
        );

    const estres3 =
        valorColumna(
            fila,
            18
        );

    const estres4 =
        valorColumna(
            fila,
            19
        );

    const estres5 =
        valorColumna(
            fila,
            20
        );

    const estres6 =
        valorColumna(
            fila,
            21
        );

    const estres7 =
        valorColumna(
            fila,
            22
        );


    /* -----------------------------------------
       SÍNTOMAS
       ----------------------------------------- */

    const sintomas =
        valorColumna(
            fila,
            23
        );


    /* -----------------------------------------
       RENDIMIENTO
       ----------------------------------------- */

    const rendimiento =
        valorColumna(
            fila,
            24
        );

    const comparacion =
        valorColumna(
            fila,
            25
        );

    const afectaEstudio =
        valorColumna(
            fila,
            26
        );

    const afectaNotas =
        valorColumna(
            fila,
            27
        );

    const noEntrega =
        valorColumna(
            fila,
            28
        );


    /* -----------------------------------------
       PERCEPCIÓN
       ----------------------------------------- */

    const nivelEstres =
        valorColumna(
            fila,
            29
        );

    const percepcion =
        valorColumna(
            fila,
            30
        );


    /* -----------------------------------------
       OBJETO FINAL
       ----------------------------------------- */

    return {

        "Fila original":
            registro.filaOriginal,

        "Marca temporal":
            marcaTemporal,

        "Grupo":
            grupo,

        "Universidad":
            universidad,

        "Sexo":
            sexo,

        "Edad":
            edad,

        "Carrera":
            carrera,

        "Ciclo":
            ciclo,

        "Cantidad de cursos":
            cursos,

        "Horas de sueño":
            horasSueno,

        "Trabajo actualmente":
            trabajo,

        "Alimentación":
            alimentacion,

        "Estrés 1 - Sentirse abrumado":
            estres1,

        "Estrés 2 - Preocupación por calificaciones":
            estres2,

        "Estrés 3 - Presión académica":
            estres3,

        "Estrés 4 - Dificultad para concentrarse":
            estres4,

        "Estrés 5 - Agotamiento emocional":
            estres5,

        "Estrés 6 - Procrastinación":
            estres6,

        "Estrés 7 - Dificultad para iniciar tareas":
            estres7,

        "Síntomas durante evaluaciones":
            sintomas,

        "Rendimiento académico actual":
            rendimiento,

        "Comparación con ciclos anteriores":
            comparacion,

        "El estrés afecta mi capacidad para estudiar":
            afectaEstudio,

        "El estrés afecta negativamente mis calificaciones":
            afectaNotas,

        "No entregó actividades por estrés o cansancio":
            noEntrega,

        "Nivel de estrés percibido (1-10)":
            nivelEstres,

        "Percepción: el estrés afecta negativamente el rendimiento":
            percepcion
    };
}


/* ============================================================
   OBTENER DATOS LIMPIOS
   ============================================================ */

function obtenerDatosLimpios() {

    return datosValidos.map(
        function (
            registro
        ) {

            return construirFilaUnificada(
                registro
            );
        }
    );
}


/* ============================================================
   PREVISUALIZACIÓN
   ============================================================ */

function mostrarPreview() {

    if (!tablaPreview) {
        return;
    }


    const thead =
        tablaPreview.querySelector(
            "thead"
        );

    const tbody =
        tablaPreview.querySelector(
            "tbody"
        );


    if (!thead || !tbody) {
        return;
    }


    thead.innerHTML = "";

    tbody.innerHTML = "";


    const encabezadosPreview = [

        "Fila original",

        "Marca temporal",

        "Grupo",

        "Universidad",

        "Sexo",

        "Edad",

        "Carrera",

        "Ciclo",

        "Cantidad de cursos",

        "Horas de sueño",

        "Trabajo actualmente"
    ];


    /* -----------------------------------------
       ENCABEZADOS
       ----------------------------------------- */

    const filaEncabezado =
        document.createElement(
            "tr"
        );


    encabezadosPreview.forEach(
        function (
            encabezado
        ) {

            const th =
                document.createElement(
                    "th"
                );

            th.textContent =
                encabezado;

            filaEncabezado.appendChild(
                th
            );
        }
    );


    thead.appendChild(
        filaEncabezado
    );


    /* -----------------------------------------
       DATOS
       ----------------------------------------- */

    datosValidos.forEach(
        function (
            registro
        ) {

            const datos =
                construirFilaUnificada(
                    registro
                );


            const tr =
                document.createElement(
                    "tr"
                );


            encabezadosPreview.forEach(
                function (
                    encabezado
                ) {

                    const td =
                        document.createElement(
                            "td"
                        );

                    td.textContent =
                        datos[encabezado] || "";

                    tr.appendChild(
                        td
                    );
                }
            );


            tbody.appendChild(
                tr
            );
        }
    );
}


/* ============================================================
   EXPORTAR EXCEL
   ============================================================ */

if (btnExportar) {

    btnExportar.addEventListener(
        "click",
        exportarExcel
    );
}


function exportarExcel() {

    if (
        datosValidos.length === 0
    ) {

        alert(
            "No existen respuestas válidas para exportar."
        );

        return;
    }


    if (
        typeof XLSX === "undefined"
    ) {

        alert(
            "No se encontró la biblioteca XLSX."
        );

        return;
    }


    /* -----------------------------------------
       CREAR LIBRO
       ----------------------------------------- */

    const libro =
        XLSX.utils.book_new();


    /* ========================================================
       HOJA 1
       DATOS LIMPIOS
       ======================================================== */

    const datosLimpios =
        obtenerDatosLimpios();


    const hojaLimpia =
        XLSX.utils.json_to_sheet(
            datosLimpios
        );


    XLSX.utils.book_append_sheet(
        libro,
        hojaLimpia,
        "Datos_Limpios"
    );


    /* ========================================================
       HOJA 2
       DATOS ORIGINALES
       ======================================================== */

    const datosOriginalesExcel =
        datosOriginales.map(
            function (
                registro
            ) {

                const objeto = {

                    "Fila original":
                        registro.filaOriginal
                };


                encabezadosOriginales.forEach(
                    function (
                        encabezado,
                        indice
                    ) {

                        objeto[
                            encabezado
                        ] =
                            registro.valores[
                                indice
                            ] || "";
                    }
                );


                return objeto;
            }
        );


    const hojaOriginal =
        XLSX.utils.json_to_sheet(
            datosOriginalesExcel
        );


    XLSX.utils.book_append_sheet(
        libro,
        hojaOriginal,
        "Datos_Originales"
    );


    /* ========================================================
       HOJA 3
       RESPUESTAS EXCLUIDAS
       ======================================================== */

    const datosRevision =
        datosExcluidos.map(
            function (
                registro
            ) {

                const objeto = {

                    "Fila original":
                        registro.filaOriginal,

                    "Estado":
                        "EXCLUIDA",

                    "Motivo":
                        "Fila anterior a la 20"
                };


                encabezadosOriginales.forEach(
                    function (
                        encabezado,
                        indice
                    ) {

                        objeto[
                            encabezado
                        ] =
                            registro.valores[
                                indice
                            ] || "";
                    }
                );


                return objeto;
            }
        );


    const hojaRevision =
        XLSX.utils.json_to_sheet(
            datosRevision
        );


    XLSX.utils.book_append_sheet(
        libro,
        hojaRevision,
        "Datos_Revision"
    );


    /* ========================================================
       HOJA 4
       DIAGNÓSTICO
       ======================================================== */

    const primeraFilaValida =
        datosValidos.length > 0
            ? datosValidos[0].filaOriginal
            : "";


    const ultimaFilaValida =
        datosValidos.length > 0
            ? datosValidos[
                datosValidos.length - 1
            ].filaOriginal
            : "";


    const diagnostico = [

        {

            "Indicador":
                "Fuente de datos",

            "Resultado":
                fuenteActual
        },

        {

            "Indicador":
                "Total de respuestas leídas",

            "Resultado":
                datosOriginales.length
        },

        {

            "Indicador":
                "Respuestas válidas",

            "Resultado":
                datosValidos.length
        },

        {

            "Indicador":
                "Respuestas excluidas",

            "Resultado":
                datosExcluidos.length
        },

        {

            "Indicador":
                "Primera fila válida",

            "Resultado":
                primeraFilaValida
        },

        {

            "Indicador":
                "Última fila válida",

            "Resultado":
                ultimaFilaValida
        },

        {

            "Indicador":
                "Regla de selección",

            "Resultado":
                "Filas 20 en adelante"
        },

        {

            "Indicador":
                "Cruce entre respuestas",

            "Resultado":
                "NO"
        },

        {

            "Indicador":
                "Normalización desde datosGoogle.js",

            "Resultado":
                "NO"
        },

        {

            "Indicador":
                "Columnas originales",

            "Resultado":
                encabezadosOriginales.length
        }
    ];


    const hojaDiagnostico =
        XLSX.utils.json_to_sheet(
            diagnostico
        );


    XLSX.utils.book_append_sheet(
        libro,
        hojaDiagnostico,
        "Diagnostico"
    );


    /* ========================================================
       AJUSTAR ANCHOS
       ======================================================== */

    ajustarAnchoColumnas(
        hojaLimpia
    );

    ajustarAnchoColumnas(
        hojaOriginal
    );

    ajustarAnchoColumnas(
        hojaRevision
    );

    ajustarAnchoColumnas(
        hojaDiagnostico
    );


    /* ========================================================
       DESCARGAR
       ======================================================== */

    XLSX.writeFile(
        libro,
        "Encuesta_UNMSM_CORREGIDA.xlsx"
    );


    if (mensaje) {

        mensaje.textContent =
            "Excel generado correctamente. " +
            datosValidos.length +
            " respuestas válidas exportadas desde " +
            fuenteActual +
            ".";
    }
}


/* ============================================================
   AJUSTAR ANCHO DE COLUMNAS
   ============================================================ */

function ajustarAnchoColumnas(
    hoja
) {

    if (
        !hoja ||
        !hoja["!ref"]
    ) {

        return;
    }


    const rango =
        XLSX.utils.decode_range(
            hoja["!ref"]
        );


    const anchos = [];


    for (
        let columna =
            rango.s.c;

        columna <=
            rango.e.c;

        columna++
    ) {

        let maximo =
            10;


        for (
            let fila =
                rango.s.r;

            fila <=
                rango.e.r;

            fila++
        ) {

            const celda =
                hoja[
                    XLSX.utils.encode_cell({
                        r: fila,
                        c: columna
                    })
                ];


            if (
                celda &&
                celda.v !== undefined
            ) {

                const longitud =
                    String(
                        celda.v
                    ).length;


                maximo =
                    Math.max(
                        maximo,
                        Math.min(
                            longitud,
                            50
                        )
                    );
            }
        }


        anchos.push({

            wch:
                maximo + 2
        });
    }


    hoja["!cols"] =
        anchos;
}


/* ============================================================
   INICIALIZACIÓN AUTOMÁTICA
   ============================================================

   IMPORTANTE:

   datosGoogle.js debe aparecer ANTES de app.js:

       <script src="datosGoogle.js"></script>
       <script src="app.js"></script>

   XLSX también debe cargarse antes de app.js.

   ============================================================ */

function iniciarAppEncuesta() {

    console.log(
        "🚀 APP.JS iniciado."
    );

    console.log(
        "🌐 Intentando cargar datos automáticamente desde Google Sheets..."
    );


    cargarDatosDesdeGoogle();
}


/* ============================================================
   ESPERAR A QUE EL DOM ESTÉ LISTO
   ============================================================ */

if (
    document.readyState === "loading"
) {

    document.addEventListener(
        "DOMContentLoaded",
        iniciarAppEncuesta,
        {
            once: true
        }
    );

} else {

    iniciarAppEncuesta();
}
