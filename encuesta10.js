/* ============================================================
   FILTRADOR INDEPENDIENTE
   ENCUESTA: EFECTO DEL ESTRÉS ACADÉMICO
   UNMSM - SEDE CHILCA
   CICLO 2026-2

   FUENTES:
   1. Google Sheets mediante datosGoogle.js
   2. CSV como respaldo manual

   ESTE ARCHIVO NO MODIFICA:
   - datosOriginales
   - datosValidos
   - datosExcluidos
   - encabezadosOriginales
   - archivoActual
   - ninguna función del app.js existente

   ============================================================ */


/* ============================================================
   VARIABLES PROPIAS DEL FILTRO
   ============================================================ */

let encuesta10Datos = [];
let encuesta10Encabezados = [];
let encuesta10Resultados = [];
let encuesta10Columnas = {};
let encuesta10Archivo = null;

let encuesta10Fuente = "";
let encuesta10CargaGoogleEnCurso = false;


/* ============================================================
   ELEMENTOS HTML
   ============================================================ */

const inputEncuesta10 =
    document.getElementById("archivoEncuesta10");

const nombreArchivoEncuesta10 =
    document.getElementById("nombreArchivoEncuesta10");

const totalEncuesta10 =
    document.getElementById("totalEncuesta10");

const respuestasChilca10 =
    document.getElementById("respuestasChilca10");

const respuestasCompletas10 =
    document.getElementById("respuestasCompletas10");

const preguntasDetectadas10 =
    document.getElementById("preguntasDetectadas10");

const mensajeEncuesta10 =
    document.getElementById("mensajeEncuesta10");

const tablaEncuesta10 =
    document.getElementById("tablaEncuesta10");

const btnExportarEncuesta10 =
    document.getElementById("btnExportarEncuesta10");


/* ============================================================
   CONFIGURACIÓN DE LAS 10 PREGUNTAS
   ============================================================ */

const CONFIG_ENCUESTA_10 = [

    {
        numero: 1,
        nombre: "Género"
    },

    {
        numero: 2,
        nombre: "Edad"
    },

    {
        numero: 3,
        nombre: "Carrera"
    },

    {
        numero: 4,
        nombre: "Ciclo de estudios"
    },

    {
        numero: 5,
        nombre: "Cantidad de cursos"
    },

    {
        numero: 6,
        nombre: "Horas diarias de sueño"
    },

    {
        numero: 7,
        nombre: "¿Trabajas?"
    },

    {
        numero: 8,
        nombre: "Alimentación"
    },

    {
        numero: 9,
        nombre: "Frecuencia de procrastinación"
    },

    {
        numero: 10,
        nombre: "Síntomas durante los exámenes"
    }

];


/* ============================================================
   COLUMNAS REALES DE GOOGLE SHEETS
   ============================================================

   Índices JavaScript = columnas de Google Sheets - 1

   0  Marca temporal

   1  Pertenencia a Chilca

   BLOQUE CHILCA
   2  Género
   3  Edad
   4  Carrera
   5  Ciclo

   BLOQUE NO CHILCA
   6  Universidad
   7  Otra universidad
   8  Género
   9  Edad
   10 Carrera
   11 Ciclo

   CAMPOS COMPARTIDOS
   12 Cursos
   13 Sueño
   14 Trabajo
   15 Alimentación
   16 Estrés 1
   17 Estrés 2
   18 Estrés 3
   19 Estrés 4
   20 Estrés 5
   21 Procrastinación
   22 Estrés 7
   23 Síntomas

   ============================================================ */

const COLUMNAS_CHILCA_ENCUESTA10 = {

    pertenencia: 1,

    genero: 2,

    edad: 3,

    carrera: 4,

    ciclo: 5,

    cursos: 12,

    sueno: 13,

    trabajo: 14,

    alimentacion: 15,

    procrastinacion: 21,

    sintomas: 23

};


/* ============================================================
   NORMALIZAR TEXTO
   ============================================================ */

function normalizarTextoEncuesta10(valor) {

    if (
        valor === null ||
        valor === undefined
    ) {
        return "";
    }

    return String(valor)
        .replace(/^\uFEFF/, "")
        .replace(/\r/g, "")
        .replace(/\u00A0/g, " ")
        .normalize("NFD")
        .replace(/[\u0300-\u036f]/g, "")
        .toLowerCase()
        .replace(/\s+/g, " ")
        .trim();

}


/* ============================================================
   REPARAR MOJIBAKE
   ============================================================ */

function repararTextoEncuesta10(valor) {

    if (
        valor === null ||
        valor === undefined
    ) {
        return "";
    }

    let texto =
        String(valor)
            .replace(/^\uFEFF/, "")
            .replace(/\r/g, "")
            .trim();

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
            new TextDecoder("utf-8")
                .decode(bytes);

        if (
            reparado &&
            reparado !== texto &&
            !reparado.includes("�")
        ) {
            return reparado;
        }

    } catch (error) {

        console.warn(
            "No se pudo reparar texto:",
            texto
        );

    }

    return texto;

}


/* ============================================================
   DETECTAR SEPARADOR CSV
   ============================================================ */

function detectarSeparadorEncuesta10(texto) {

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

    if (puntoComas > comas) {
        return ";";
    }

    return ",";

}


/* ============================================================
   PARSER CSV
   ============================================================ */

function parsearCSVEncuesta10(
    texto,
    separador
) {

    const filas = [];

    let fila = [];

    let campo = "";

    let dentroComillas = false;


    for (
        let i = 0;
        i < texto.length;
        i++
    ) {

        const caracter =
            texto[i];

        const siguiente =
            texto[i + 1];


        /* ----------------------------------------------------
           COMILLAS
           ---------------------------------------------------- */

        if (caracter === '"') {

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


        /* ----------------------------------------------------
           SEPARADOR
           ---------------------------------------------------- */

        if (
            caracter === separador &&
            !dentroComillas
        ) {

            fila.push(
                repararTextoEncuesta10(
                    campo
                )
            );

            campo = "";

            continue;

        }


        /* ----------------------------------------------------
           SALTO DE LÍNEA
           ---------------------------------------------------- */

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
                repararTextoEncuesta10(
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

                filas.push(fila);

            }

            fila = [];

            continue;

        }

        campo += caracter;

    }


    /* --------------------------------------------------------
       ÚLTIMA FILA
       -------------------------------------------------------- */

    if (
        campo !== "" ||
        fila.length > 0
    ) {

        fila.push(
            repararTextoEncuesta10(
                campo
            )
        );

        if (
            fila.some(
                valor =>
                    valor !== ""
            )
        ) {

            filas.push(fila);

        }

    }


    return filas;

}


/* ============================================================
   OBTENER VALOR DE UNA COLUMNA
   ============================================================ */

function obtenerValorEncuesta10(
    fila,
    columna
) {

    if (
        !Array.isArray(fila) ||
        columna === undefined ||
        columna === null ||
        columna < 0 ||
        columna >= fila.length
    ) {
        return "";
    }

    return repararTextoEncuesta10(
        fila[columna]
    );

}


/* ============================================================
   VERIFICAR SI ES ESTUDIANTE DE CHILCA
   ============================================================ */

function esEstudianteChilcaEncuesta10(
    fila
) {

    const respuesta =
        normalizarTextoEncuesta10(
            fila[
                COLUMNAS_CHILCA_ENCUESTA10
                    .pertenencia
            ]
        );


    return (
        respuesta === "si" ||
        respuesta === "si, soy estudiante" ||
        respuesta.includes(
            "si, soy estudiante"
        )
    );

}


/* ============================================================
   DETECTAR COLUMNAS
   ============================================================

   Para Google Sheets conocemos exactamente las posiciones.

   Para CSV también usamos las mismas posiciones porque
   corresponde al mismo formulario.

   ============================================================ */

function detectarColumnasEncuesta10(
    encabezados
) {

    if (
        !Array.isArray(encabezados)
    ) {
        return {};
    }


    return {

        1:
            COLUMNAS_CHILCA_ENCUESTA10
                .genero,

        2:
            COLUMNAS_CHILCA_ENCUESTA10
                .edad,

        3:
            COLUMNAS_CHILCA_ENCUESTA10
                .carrera,

        4:
            COLUMNAS_CHILCA_ENCUESTA10
                .ciclo,

        5:
            COLUMNAS_CHILCA_ENCUESTA10
                .cursos,

        6:
            COLUMNAS_CHILCA_ENCUESTA10
                .sueno,

        7:
            COLUMNAS_CHILCA_ENCUESTA10
                .trabajo,

        8:
            COLUMNAS_CHILCA_ENCUESTA10
                .alimentacion,

        9:
            COLUMNAS_CHILCA_ENCUESTA10
                .procrastinacion,

        10:
            COLUMNAS_CHILCA_ENCUESTA10
                .sintomas

    };

}


/* ============================================================
   CONSTRUIR RESPUESTA DE LAS 10 PREGUNTAS
   ============================================================ */

function construirRespuestaEncuesta10(
    fila,
    numeroFila
) {

    return {

        "N.º respuesta":
            numeroFila,

        "Género":
            obtenerValorEncuesta10(
                fila,
                encuesta10Columnas[1]
            ),

        "Edad":
            obtenerValorEncuesta10(
                fila,
                encuesta10Columnas[2]
            ),

        "Carrera":
            obtenerValorEncuesta10(
                fila,
                encuesta10Columnas[3]
            ),

        "Ciclo de estudios":
            obtenerValorEncuesta10(
                fila,
                encuesta10Columnas[4]
            ),

        "Cantidad de cursos":
            obtenerValorEncuesta10(
                fila,
                encuesta10Columnas[5]
            ),

        "Horas diarias de sueño":
            obtenerValorEncuesta10(
                fila,
                encuesta10Columnas[6]
            ),

        "¿Trabajas?":
            obtenerValorEncuesta10(
                fila,
                encuesta10Columnas[7]
            ),

        "Alimentación":
            obtenerValorEncuesta10(
                fila,
                encuesta10Columnas[8]
            ),

        "Frecuencia de procrastinación":
            obtenerValorEncuesta10(
                fila,
                encuesta10Columnas[9]
            ),

        "Síntomas durante los exámenes":
            obtenerValorEncuesta10(
                fila,
                encuesta10Columnas[10]
            )

    };

}


/* ============================================================
   PROCESADOR COMÚN
   ============================================================

   Recibe:

   filas       → datos puros
   encabezados → encabezados puros
   fuente      → Google Sheets / CSV

   ============================================================ */

function procesarFilasEncuesta10(
    filas,
    encabezados,
    fuente
) {

    if (
        !Array.isArray(filas) ||
        !Array.isArray(encabezados)
    ) {

        throw new Error(
            "Los datos recibidos no tienen un formato válido."
        );

    }


    if (filas.length === 0) {

        throw new Error(
            "No existen respuestas para procesar."
        );

    }


    /* --------------------------------------------------------
       GUARDAR DATOS ORIGINALES DEL FILTRO
       -------------------------------------------------------- */

    encuesta10Datos =
        filas;

    encuesta10Encabezados =
        encabezados.map(
            encabezado =>
                repararTextoEncuesta10(
                    encabezado
                )
        );

    encuesta10Fuente =
        fuente;


    /* --------------------------------------------------------
       DETECTAR COLUMNAS
       -------------------------------------------------------- */

    encuesta10Columnas =
        detectarColumnasEncuesta10(
            encuesta10Encabezados
        );


    /* --------------------------------------------------------
       DIAGNÓSTICO
       -------------------------------------------------------- */

    console.log(
        "================================================"
    );

    console.log(
        " ENCUESTA 10 - UNMSM SEDE CHILCA"
    );

    console.log(
        "================================================"
    );

    console.log(
        "Fuente:",
        encuesta10Fuente
    );

    console.log(
        "Total de filas:",
        filas.length
    );

    console.log(
        "Total de columnas:",
        encuesta10Encabezados.length
    );

    console.log(
        "Columnas utilizadas:",
        encuesta10Columnas
    );


    /* --------------------------------------------------------
       VERIFICAR QUE EXISTAN LAS 10 COLUMNAS
       -------------------------------------------------------- */

    const cantidadDetectadas =
        Object.values(
            encuesta10Columnas
        )
        .filter(
            indice =>
                indice !== -1 &&
                indice !== undefined
        )
        .length;


    if (
        preguntasDetectadas10
    ) {

        preguntasDetectadas10.textContent =
            `${cantidadDetectadas}/10`;

    }


    console.log(
        "Preguntas detectadas:",
        `${cantidadDetectadas}/10`
    );


    CONFIG_ENCUESTA_10.forEach(
        pregunta => {

            const columna =
                encuesta10Columnas[
                    pregunta.numero
                ];

            console.log(
                `Pregunta ${pregunta.numero}:`,
                pregunta.nombre,
                "=> índice",
                columna,
                "=>",
                encuesta10Encabezados[columna]
            );

        }
    );


    if (
        cantidadDetectadas < 10
    ) {

        throw new Error(
            "No se pudieron localizar las 10 preguntas."
        );

    }


    /* --------------------------------------------------------
       PROCESAR SOLO ESTUDIANTES CHILCA
       -------------------------------------------------------- */

    encuesta10Resultados = [];

    let estudiantesChilca = 0;

    let respuestasIncompletas = 0;


    filas.forEach(
        (
            fila,
            indice
        ) => {


            /* ------------------------------------------------
               VERIFICAR PERTENENCIA
               ------------------------------------------------ */

            if (
                !esEstudianteChilcaEncuesta10(
                    fila
                )
            ) {

                return;

            }


            estudiantesChilca++;


            /* ------------------------------------------------
               VERIFICAR LAS 10 PREGUNTAS
               ------------------------------------------------ */

            let filaCompleta = true;

            let camposFaltantes = [];


            for (
                let numeroPregunta = 1;
                numeroPregunta <= 10;
                numeroPregunta++
            ) {

                const columna =
                    encuesta10Columnas[
                        numeroPregunta
                    ];


                const valor =
                    obtenerValorEncuesta10(
                        fila,
                        columna
                    );


                if (
                    !valor ||
                    valor.trim() === ""
                ) {

                    filaCompleta = false;

                    camposFaltantes.push(
                        CONFIG_ENCUESTA_10[
                            numeroPregunta - 1
                        ].nombre
                    );

                }

            }


            /* ------------------------------------------------
               DESCARTAR INCOMPLETA
               ------------------------------------------------ */

            if (
                !filaCompleta
            ) {

                respuestasIncompletas++;


                console.warn(
                    "⚠️ Respuesta Chilca incompleta:",
                    {
                        fila: indice + 2,
                        camposFaltantes:
                            camposFaltantes
                    }
                );


                return;

            }


            /* ------------------------------------------------
               CONSTRUIR RESPUESTA
               ------------------------------------------------ */

            const respuesta =
                construirRespuestaEncuesta10(
                    fila,
                    indice + 2
                );


            encuesta10Resultados.push(
                respuesta
            );

        }
    );


    /* ========================================================
       DIAGNÓSTICO FINAL
       ======================================================== */

    console.log(
        "================================================"
    );

    console.log(
        " RESULTADO ENCUESTA 10"
    );

    console.log(
        "================================================"
    );

    console.log(
        "Fuente:",
        encuesta10Fuente
    );

    console.log(
        "Total de filas:",
        filas.length
    );

    console.log(
        "Estudiantes de Chilca:",
        estudiantesChilca
    );

    console.log(
        "Respuestas incompletas:",
        respuestasIncompletas
    );

    console.log(
        "Respuestas completas:",
        encuesta10Resultados.length
    );

    console.log(
        "================================================"
    );


    /* --------------------------------------------------------
       ESTADÍSTICAS HTML
       -------------------------------------------------------- */

    if (
        totalEncuesta10
    ) {

        totalEncuesta10.textContent =
            filas.length;

    }


    if (
        respuestasChilca10
    ) {

        respuestasChilca10.textContent =
            estudiantesChilca;

    }


    if (
        respuestasCompletas10
    ) {

        respuestasCompletas10.textContent =
            encuesta10Resultados.length;

    }


    /* --------------------------------------------------------
       NOMBRE DE FUENTE
       -------------------------------------------------------- */

    if (
        nombreArchivoEncuesta10
    ) {

        if (
            encuesta10Fuente ===
            "Google Sheets"
        ) {

            nombreArchivoEncuesta10.textContent =
                "Datos cargados automáticamente desde Google Sheets";

        } else {

            nombreArchivoEncuesta10.textContent =
                "Archivo seleccionado: " +
                (
                    encuesta10Archivo?.name ||
                    "CSV"
                );

        }

    }


    /* --------------------------------------------------------
       PREVIEW
       -------------------------------------------------------- */

    mostrarPreviewEncuesta10();


    /* --------------------------------------------------------
       BOTÓN EXPORTAR
       -------------------------------------------------------- */

    if (
        btnExportarEncuesta10
    ) {

        btnExportarEncuesta10.disabled =
            encuesta10Resultados.length === 0;

    }


    /* --------------------------------------------------------
       MENSAJE
       -------------------------------------------------------- */

    if (
        mensajeEncuesta10
    ) {

        mensajeEncuesta10.textContent =
            "Encuesta procesada correctamente. " +
            encuesta10Resultados.length +
            " respuestas completas de estudiantes " +
            "de la sede Chilca.";

    }


    /* --------------------------------------------------------
       MOSTRAR PRIMER RESULTADO
       -------------------------------------------------------- */

    if (
        encuesta10Resultados.length > 0
    ) {

        console.log(
            "📋 Primera respuesta filtrada:",
            encuesta10Resultados[0]
        );

    }

}


/* ============================================================
   PROCESAR CSV
   ============================================================ */

function procesarEncuesta10(
    texto
) {

    const separador =
        detectarSeparadorEncuesta10(
            texto
        );


    const filas =
        parsearCSVEncuesta10(
            texto,
            separador
        );


    if (
        filas.length < 2
    ) {

        throw new Error(
            "El archivo no contiene suficientes datos."
        );

    }


    const encabezados =
        filas[0];


    const filasDatos =
        filas.slice(1);


    procesarFilasEncuesta10(
        filasDatos,
        encabezados,
        "CSV"
    );

}


/* ============================================================
   CARGAR DESDE GOOGLE SHEETS
   ============================================================ */

async function cargarEncuesta10DesdeGoogle() {

    if (
        encuesta10CargaGoogleEnCurso
    ) {

        console.log(
            "⏳ Ya existe una carga de Google en curso."
        );

        return;

    }


    encuesta10CargaGoogleEnCurso = true;


    try {

        console.log(
            "🌐 Cargando Encuesta 10 desde Google Sheets..."
        );


        let datosGoogle;


        /* ----------------------------------------------------
           SI datosGoogle.js YA CARGÓ LOS DATOS
           ---------------------------------------------------- */

        if (
            Array.isArray(
                window.FILAS_GOOGLE
            ) &&
            Array.isArray(
                window.ENCABEZADOS_GOOGLE
            )
        ) {

            console.log(
                "📦 Usando datos Google ya disponibles."
            );


            datosGoogle = {

                filas:
                    window.FILAS_GOOGLE,

                encabezados:
                    window.ENCABEZADOS_GOOGLE

            };

        }


        /* ----------------------------------------------------
           SI TODAVÍA NO ESTÁN CARGADOS
           ---------------------------------------------------- */

        else {

            if (
                typeof obtenerDatosGoogle !==
                "function"
            ) {

                throw new Error(
                    "No se encontró obtenerDatosGoogle(). " +
                    "Verifica que datosGoogle.js esté cargado antes de encuesta10.js."
                );

            }


            datosGoogle =
                await obtenerDatosGoogle();

        }


        /* ----------------------------------------------------
           VALIDAR RESPUESTA
           ---------------------------------------------------- */

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
                "Google Sheets no devolvió una estructura válida."
            );

        }


        console.log(
            "📊 Filas recibidas:",
            datosGoogle.filas.length
        );

        console.log(
            "📋 Columnas recibidas:",
            datosGoogle.encabezados.length
        );


        /* ----------------------------------------------------
           ARCHIVO VIRTUAL
           ---------------------------------------------------- */

        encuesta10Archivo = {

            name:
                "Google_Sheets_Encuesta_Estres_2026-2"

        };


        /* ----------------------------------------------------
           PROCESAR
           ---------------------------------------------------- */

        procesarFilasEncuesta10(
            datosGoogle.filas,
            datosGoogle.encabezados,
            "Google Sheets"
        );


        console.log(
            "✅ Encuesta 10 Chilca cargada desde Google."
        );


    } catch (error) {

        console.error(
            "❌ Error cargando Encuesta 10 desde Google:",
            error
        );


        if (
            mensajeEncuesta10
        ) {

            mensajeEncuesta10.textContent =
                "Error al cargar Google Sheets: " +
                error.message;

        }


        if (
            btnExportarEncuesta10
        ) {

            btnExportarEncuesta10.disabled =
                true;

        }


    } finally {

        encuesta10CargaGoogleEnCurso =
            false;

    }

}


/* ============================================================
   MOSTRAR PREVIEW
   ============================================================ */

function mostrarPreviewEncuesta10() {

    if (
        !tablaEncuesta10
    ) {
        return;
    }


    const thead =
        tablaEncuesta10.querySelector(
            "thead"
        );

    const tbody =
        tablaEncuesta10.querySelector(
            "tbody"
        );


    if (
        !thead ||
        !tbody
    ) {
        return;
    }


    thead.innerHTML = "";

    tbody.innerHTML = "";


    if (
        encuesta10Resultados.length === 0
    ) {
        return;
    }


    const encabezados =
        Object.keys(
            encuesta10Resultados[0]
        );


    /* --------------------------------------------------------
       ENCABEZADOS
       -------------------------------------------------------- */

    const filaEncabezado =
        document.createElement(
            "tr"
        );


    encabezados.forEach(
        encabezado => {

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


    /* --------------------------------------------------------
       DATOS
       -------------------------------------------------------- */

    const limite =
        Math.min(
            encuesta10Resultados.length,
            100
        );


    for (
        let i = 0;
        i < limite;
        i++
    ) {

        const registro =
            encuesta10Resultados[i];


        const tr =
            document.createElement(
                "tr"
            );


        encabezados.forEach(
            encabezado => {

                const td =
                    document.createElement(
                        "td"
                    );


                td.textContent =
                    registro[
                        encabezado
                    ] || "";


                tr.appendChild(
                    td
                );

            }
        );


        tbody.appendChild(
            tr
        );

    }

}


/* ============================================================
   EXPORTAR EXCEL
   ============================================================ */

function exportarEncuesta10() {

    if (
        encuesta10Resultados.length === 0
    ) {

        alert(
            "No existen respuestas completas de la encuesta para exportar."
        );

        return;

    }


    if (
        typeof XLSX === "undefined"
    ) {

        alert(
            "La librería XLSX no está cargada."
        );

        return;

    }


    const libro =
        XLSX.utils.book_new();


    /* --------------------------------------------------------
       HOJA PRINCIPAL
       -------------------------------------------------------- */

    const hoja =
        XLSX.utils.json_to_sheet(
            encuesta10Resultados
        );


    XLSX.utils.book_append_sheet(
        libro,
        hoja,
        "Encuesta_10_Preguntas"
    );


    /* --------------------------------------------------------
       HOJA DIAGNÓSTICO
       -------------------------------------------------------- */

    const diagnostico = [

        {
            "Indicador":
                "Fuente",

            "Resultado":
                encuesta10Fuente
        },

        {
            "Indicador":
                "Total de respuestas leídas",

            "Resultado":
                encuesta10Datos.length
        },

        {
            "Indicador":
                "Estudiantes sede Chilca",

            "Resultado":
                contarEstudiantesChilcaEncuesta10()
        },

        {
            "Indicador":
                "Respuestas completas",

            "Resultado":
                encuesta10Resultados.length
        },

        {
            "Indicador":
                "Preguntas detectadas",

            "Resultado":
                "10/10"
        },

        {
            "Indicador":
                "Columnas originales",

            "Resultado":
                encuesta10Encabezados.length
        },

        {
            "Indicador":
                "Filas cruzadas",

            "Resultado":
                "NO"
        },

        {
            "Indicador":
                "Campos vacíos",

            "Resultado":
                "SE DESCARTAN"
        },

        {
            "Indicador":
                "Columnas exportadas",

            "Resultado":
                "10 preguntas"
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


    /* --------------------------------------------------------
       AJUSTAR COLUMNAS
       -------------------------------------------------------- */

    ajustarAnchoEncuesta10(
        hoja
    );

    ajustarAnchoEncuesta10(
        hojaDiagnostico
    );


    /* --------------------------------------------------------
       DESCARGAR
       -------------------------------------------------------- */

    XLSX.writeFile(
        libro,
        "Encuesta_Estres_Academico_UNMSM_Chilca_2026-2.xlsx"
    );


    if (
        mensajeEncuesta10
    ) {

        mensajeEncuesta10.textContent =
            "Excel generado correctamente. " +
            encuesta10Resultados.length +
            " respuestas exportadas.";

    }

}


/* ============================================================
   CONTAR ESTUDIANTES CHILCA
   ============================================================ */

function contarEstudiantesChilcaEncuesta10() {

    return encuesta10Datos.filter(
        fila =>
            esEstudianteChilcaEncuesta10(
                fila
            )
    ).length;

}


/* ============================================================
   AJUSTAR COLUMNAS
   ============================================================ */

function ajustarAnchoEncuesta10(
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
        let columna = rango.s.c;
        columna <= rango.e.c;
        columna++
    ) {

        let maximo = 10;


        for (
            let fila = rango.s.r;
            fila <= rango.e.r;
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

                maximo =
                    Math.max(
                        maximo,
                        Math.min(
                            String(
                                celda.v
                            ).length,
                            50
                        )
                    );

            }

        }


        anchos.push({
            wch: maximo + 2
        });

    }


    hoja["!cols"] =
        anchos;

}


/* ============================================================
   EVENTO: SELECCIONAR CSV
   ============================================================

   El CSV sigue disponible como respaldo manual.

   ============================================================ */

if (
    inputEncuesta10
) {

    inputEncuesta10.addEventListener(
        "change",
        function () {

            const archivo =
                this.files[0];


            if (!archivo) {
                return;
            }


            encuesta10Archivo =
                archivo;


            if (
                nombreArchivoEncuesta10
            ) {

                nombreArchivoEncuesta10.textContent =
                    "Archivo seleccionado: " +
                    archivo.name;

            }


            /* ------------------------------------------------
               LIMPIAR RESULTADOS ANTERIORES
               ------------------------------------------------ */

            encuesta10Datos = [];

            encuesta10Encabezados = [];

            encuesta10Resultados = [];

            encuesta10Columnas = {};

            encuesta10Fuente = "CSV";


            if (
                btnExportarEncuesta10
            ) {

                btnExportarEncuesta10.disabled =
                    true;

            }


            if (
                preguntasDetectadas10
            ) {

                preguntasDetectadas10.textContent =
                    "0/10";

            }


            if (
                respuestasChilca10
            ) {

                respuestasChilca10.textContent =
                    "0";

            }


            if (
                respuestasCompletas10
            ) {

                respuestasCompletas10.textContent =
                    "0";

            }


            const lector =
                new FileReader();


            lector.onload =
                function (evento) {

                    try {

                        procesarEncuesta10(
                            evento.target.result
                        );

                    } catch (error) {

                        console.error(
                            "❌ Error Encuesta 10:",
                            error
                        );


                        if (
                            mensajeEncuesta10
                        ) {

                            mensajeEncuesta10.textContent =
                                "Error: " +
                                error.message;

                        }


                        if (
                            btnExportarEncuesta10
                        ) {

                            btnExportarEncuesta10.disabled =
                                true;

                        }

                    }

                };


            lector.onerror =
                function () {

                    console.error(
                        "❌ No se pudo leer el archivo."
                    );


                    if (
                        mensajeEncuesta10
                    ) {

                        mensajeEncuesta10.textContent =
                            "Error: no se pudo leer el archivo.";

                    }

                };


            lector.readAsText(
                archivo,
                "UTF-8"
            );

        }
    );

}


/* ============================================================
   EVENTO: EXPORTAR
   ============================================================ */

if (
    btnExportarEncuesta10
) {

    btnExportarEncuesta10.addEventListener(
        "click",
        exportarEncuesta10
    );

}


/* ============================================================
   CARGA AUTOMÁTICA DESDE GOOGLE
   ============================================================ */

function iniciarEncuesta10Google() {

    cargarEncuesta10DesdeGoogle();

}


/* ============================================================
   INICIALIZACIÓN SEGURA
   ============================================================ */

if (
    document.readyState === "loading"
) {

    document.addEventListener(
        "DOMContentLoaded",
        iniciarEncuesta10Google,
        {
            once: true
        }
    );

} else {

    iniciarEncuesta10Google();

}


/* ============================================================
   FIN DEL FILTRADOR ENCUESTA 10
   ============================================================ */

console.log(
    "================================================"
);

console.log(
    " encuesta10.js cargado correctamente"
);

console.log(
    " Fuente principal: Google Sheets"
);

console.log(
    " CSV disponible como respaldo"
);

console.log(
    " Solo UNMSM - Sede Chilca"
);

console.log(
    " 10 preguntas obligatorias"
);

console.log(
    "================================================"
);
