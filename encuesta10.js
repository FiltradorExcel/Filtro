/* ============================================================
   FILTRADOR INDEPENDIENTE
   ENCUESTA: EFECTO DEL ESTRÉS ACADÉMICO
   UNMSM - SEDE CHILCA
   CICLO 2026-2

   ESTE ARCHIVO NO MODIFICA:
   - datosOriginales
   - datosValidos
   - datosExcluidos
   - encabezadosOriginales
   - archivoActual
   - ninguna función del app.js existente
   ============================================================ */


/* ============================================================
   VARIABLES PROPIAS DEL NUEVO FILTRO
   ============================================================ */

let encuesta10Datos = [];
let encuesta10Encabezados = [];
let encuesta10Resultados = [];
let encuesta10Columnas = {};

let encuesta10Archivo = null;


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

        nombre: "Género",

        posibles: [
            "2. ¿Cuál es tu género?",
            "2. cual es tu genero",
            "¿Cuál es tu género?",
            "cual es tu genero",
            "género",
            "genero",
            "sexo"
        ]
    },


    {
        numero: 2,

        nombre: "Edad",

        posibles: [
            "3. ¿Cuál es tu edad actual?",
            "3. cual es tu edad actual",
            "¿Cuál es tu edad actual?",
            "cual es tu edad actual",
            "edad"
        ]
    },


    {
        numero: 3,

        nombre: "Carrera",

        posibles: [
            "4. ¿Qué carrera estudias actualmente?",
            "4. que carrera estudias actualmente",
            "¿Qué carrera estudias actualmente?",
            "que carrera estudias actualmente",
            "¿A qué carrera perteneces?",
            "a que carrera perteneces"
        ]
    },


    {
        numero: 4,

        nombre: "Ciclo de estudios",

        posibles: [
            "5. ¿A qué ciclo de estudios perteneces actualmente?",
            "5. a que ciclo de estudios perteneces actualmente",
            "¿A qué ciclo de estudios perteneces actualmente?",
            "a que ciclo de estudios perteneces actualmente",
            "¿A qué ciclo de estudios perteneces?",
            "a que ciclo de estudios perteneces"
        ]
    },


    {
        numero: 5,

        nombre: "Cantidad de cursos",

        posibles: [
            "7. ¿Cuántos cursos estás llevando actualmente?",
            "7. cuantos cursos estas llevando actualmente",
            "¿Cuántos cursos estás llevando actualmente?",
            "cuantos cursos estas llevando actualmente",
            "¿Cuántos cursos llevas?",
            "cuantos cursos llevas"
        ]
    },


    {
        numero: 6,

        nombre: "Horas diarias de sueño",

        posibles: [
            "8. ¿Cuántas horas duermes en promedio por noche?",
            "8. cuantas horas duermes en promedio por noche",
            "¿Cuántas horas duermes en promedio por noche?",
            "cuantas horas duermes en promedio por noche",
            "¿Cuántas horas diarias duermes?",
            "cuantas horas diarias duermes"
        ]
    },


    {
        numero: 7,

        nombre: "¿Trabajas?",

        posibles: [
            "9. ¿Trabajas actualmente?",
            "9. trabajas actualmente",
            "¿Trabajas actualmente?",
            "trabajas actualmente"
        ]
    },


    {
        numero: 8,

        nombre: "Alimentación",

        posibles: [
            "10. ¿Cómo calificarías tu alimentación habitual?",
            "10. como calificarias tu alimentacion habitual",
            "¿Cómo calificarías tu alimentación habitual?",
            "como calificarias tu alimentacion habitual"
        ]
    },


    {
        numero: 9,

        nombre: "Frecuencia de procrastinación",

        posibles: [
            "16. ¿Con qué frecuencia procrastinas...?",
            "16. con que frecuencia procrastinas",
            "¿Con qué frecuencia procrastinas?",
            "con que frecuencia procrastinas",
            "frecuencia procrastinas"
        ]
    },


    {
        numero: 10,

        nombre: "Síntomas durante los exámenes",

        posibles: [
            "18. Durante los períodos de exámenes...",
            "18. durante los periodos de examenes",
            "Durante los períodos de exámenes",
            "durante los periodos de examenes",
            "Durante los exámenes",
            "durante los examenes"
        ]
    }

];


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

        .replace(
            /[\u0300-\u036f]/g,
            ""
        )

        .toLowerCase()

        .replace(
            /\s+/g,
            " "
        )

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
   BUSCAR COLUMNA
   ============================================================ */

function buscarColumnaEncuesta10(
    encabezados,
    posibles
) {

    const encabezadosNormalizados =
        encabezados.map(
            encabezado =>
                normalizarTextoEncuesta10(
                    encabezado
                )
        );


    /* --------------------------------------------------------
       PRIMERO:
       Coincidencia exacta
       -------------------------------------------------------- */

    for (
        const posible of posibles
    ) {

        const objetivo =
            normalizarTextoEncuesta10(
                posible
            );


        const indice =
            encabezadosNormalizados.indexOf(
                objetivo
            );


        if (
            indice !== -1
        ) {

            return indice;
        }
    }


    /* --------------------------------------------------------
       SEGUNDO:
       Coincidencia parcial controlada
       -------------------------------------------------------- */

    for (
        const posible of posibles
    ) {

        const objetivo =
            normalizarTextoEncuesta10(
                posible
            );


        if (
            !objetivo
        ) {

            continue;
        }


        const indice =
            encabezadosNormalizados.findIndex(
                encabezado => {

                    /*
                       El encabezado contiene
                       exactamente la expresión buscada.
                    */

                    if (
                        encabezado.includes(
                            objetivo
                        )
                    ) {

                        return true;
                    }


                    /*
                       La expresión configurada contiene
                       el encabezado.

                       Se exige una longitud mínima para
                       evitar coincidencias accidentales.
                    */

                    if (
                        objetivo.length >= 5 &&
                        encabezado.length >= 5 &&
                        objetivo.includes(
                            encabezado
                        )
                    ) {

                        return true;
                    }


                    return false;
                }
            );


        if (
            indice !== -1
        ) {

            return indice;
        }
    }


    return -1;
}


/* ============================================================
   BUSCAR COLUMNA DE PERTENENCIA A CHILCA
   ============================================================ */

function buscarColumnaChilcaEncuesta10(
    encabezados
) {

    const posibles = [

        "1. ¿Actualmente eres estudiante de la sede Chilca de la Universidad Nacional Mayor de San Marcos (UNMSM)?",

        "1. actualmente eres estudiante de la sede chilca de la universidad nacional mayor de san marcos (unmsm)",

        "¿Actualmente eres estudiante de la sede Chilca de la Universidad Nacional Mayor de San Marcos (UNMSM)?",

        "actualmente eres estudiante de la sede chilca",

        "estudiante de la sede chilca",

        "sede chilca"

    ];


    const indice =
        buscarColumnaEncuesta10(
            encabezados,
            posibles
        );


    return indice;
}


/* ============================================================
   DETECTAR LAS 10 COLUMNAS
   ============================================================ */

function detectarColumnasEncuesta10(
    encabezados
) {

    const columnas = {};


    CONFIG_ENCUESTA_10.forEach(
        pregunta => {

            const indice =
                buscarColumnaEncuesta10(
                    encabezados,
                    pregunta.posibles
                );


            columnas[
                pregunta.numero
            ] = indice;
        }
    );


    return columnas;
}


/* ============================================================
   VERIFICAR SI ES ESTUDIANTE CHILCA
   ============================================================ */

function esEstudianteChilcaEncuesta10(
    fila,
    columnaChilca
) {

    if (
        columnaChilca === -1 ||
        columnaChilca === undefined
    ) {

        return false;
    }


    const respuesta =
        normalizarTextoEncuesta10(
            fila[columnaChilca]
        );


    /*
       Como normalizarTextoEncuesta10()
       elimina las tildes, "sí" se convierte
       automáticamente en "si".
    */

    return (
        respuesta === "si" ||
        respuesta === "si, soy estudiante" ||
        respuesta.includes(
            "si, soy estudiante"
        )
    );
}


/* ============================================================
   OBTENER VALOR
   ============================================================ */

function obtenerValorEncuesta10(
    fila,
    columna
) {

    if (
        columna === -1 ||
        columna === undefined ||
        columna >= fila.length
    ) {

        return "";
    }


    return repararTextoEncuesta10(
        fila[columna]
    );
}


/* ============================================================
   CONSTRUIR LAS 10 PREGUNTAS
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
   PROCESAR ENCUESTA
   ============================================================ */

function procesarEncuesta10(
    texto
) {

    /* --------------------------------------------------------
       Detectar separador
       -------------------------------------------------------- */

    const separador =
        detectarSeparadorEncuesta10(
            texto
        );


    /* --------------------------------------------------------
       Parsear CSV
       -------------------------------------------------------- */

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


    /* --------------------------------------------------------
       Encabezados
       -------------------------------------------------------- */

    encuesta10Encabezados =
        filas[0].map(
            encabezado =>
                repararTextoEncuesta10(
                    encabezado
                )
        );


    const filasDatos =
        filas.slice(1);


    encuesta10Datos =
        filasDatos;


    /* --------------------------------------------------------
       Detectar las 10 preguntas
       -------------------------------------------------------- */

    encuesta10Columnas =
        detectarColumnasEncuesta10(
            encuesta10Encabezados
        );


    /* --------------------------------------------------------
       Detectar columna de pertenencia a Chilca
       -------------------------------------------------------- */

    const columnaChilca =
        buscarColumnaChilcaEncuesta10(
            encuesta10Encabezados
        );


    /* --------------------------------------------------------
       DIAGNÓSTICO EN CONSOLA
       -------------------------------------------------------- */

    console.log(
        "========== ENCUESTA 10 =========="
    );

    console.log(
        "Separador detectado:",
        separador
    );

    console.log(
        "Total de columnas:",
        encuesta10Encabezados.length
    );

    console.log(
        "Columna de Chilca:",
        columnaChilca
    );

    if (
        columnaChilca !== -1
    ) {

        console.log(
            "Encabezado Chilca:",
            encuesta10Encabezados[columnaChilca]
        );
    }


    console.log(
        "Columnas de las 10 preguntas:",
        encuesta10Columnas
    );


    /* --------------------------------------------------------
       Contar preguntas encontradas
       -------------------------------------------------------- */

    const cantidadDetectadas =
        Object.values(
            encuesta10Columnas
        )
        .filter(
            indice =>
                indice !== -1
        )
        .length;


    preguntasDetectadas10.textContent =
        `${cantidadDetectadas}/10`;


    /* --------------------------------------------------------
       Mostrar columnas detectadas
       -------------------------------------------------------- */

    CONFIG_ENCUESTA_10.forEach(
        pregunta => {

            const columna =
                encuesta10Columnas[
                    pregunta.numero
                ];

            if (
                columna !== -1 &&
                columna !== undefined
            ) {

                console.log(
                    `Pregunta ${pregunta.numero}:`,
                    pregunta.nombre,
                    "=> columna",
                    columna,
                    "=>",
                    encuesta10Encabezados[columna]
                );

            } else {

                console.warn(
                    `Pregunta ${pregunta.numero} NO encontrada:`,
                    pregunta.nombre
                );
            }
        }
    );


    /* --------------------------------------------------------
       Verificar las 10 preguntas
       -------------------------------------------------------- */

    if (
        cantidadDetectadas < 10
    ) {

        const faltantes =
            CONFIG_ENCUESTA_10

                .filter(
                    pregunta =>
                        encuesta10Columnas[
                            pregunta.numero
                        ] === -1
                )

                .map(
                    pregunta =>
                        `${pregunta.numero}. ${pregunta.nombre}`
                );


        throw new Error(
            "No se pudieron detectar todas las 10 preguntas.\n\n" +
            "Preguntas faltantes:\n" +
            faltantes.join("\n")
        );
    }


    /* --------------------------------------------------------
       Verificar columna Chilca
       -------------------------------------------------------- */

    if (
        columnaChilca === -1
    ) {

        throw new Error(
            "No se pudo encontrar la columna que identifica " +
            "a los estudiantes de la sede Chilca."
        );
    }


   /* ============================================================
   OBTENER ÚNICAMENTE RESPUESTAS COMPLETAS DE CHILCA
   ============================================================ */

encuesta10Resultados = [];

let estudiantesChilca = 0;
let respuestasIncompletas = 0;


filasDatos.forEach(
    function (
        fila,
        indice
    ) {

        /* ----------------------------------------------------
           Primero verificamos que sea estudiante de Chilca
           ---------------------------------------------------- */

        if (
            !esEstudianteChilcaEncuesta10(
                fila,
                columnaChilca
            )
        ) {

            return;
        }


        estudiantesChilca++;


        /* ----------------------------------------------------
           Verificar que LAS 10 preguntas tengan respuesta
           ---------------------------------------------------- */

        let filaCompleta = true;


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


            /*
             * Si alguna de las 10 preguntas está vacía,
             * descartamos toda la fila.
             */

            if (
                !valor ||
                valor.trim() === ""
            ) {

                filaCompleta = false;

                break;
            }
        }


        /* ----------------------------------------------------
           Si está incompleta, NO se exporta
           ---------------------------------------------------- */

        if (
            !filaCompleta
        ) {

            respuestasIncompletas++;

            return;
        }


        /* ----------------------------------------------------
           Si las 10 preguntas están completas,
           agregamos la respuesta.
           ---------------------------------------------------- */

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


/* ============================================================
   DIAGNÓSTICO
   ============================================================ */

console.log(
    "Total de respuestas leídas:",
    filasDatos.length
);

console.log(
    "Estudiantes de Chilca:",
    estudiantesChilca
);

console.log(
    "Respuestas incompletas descartadas:",
    respuestasIncompletas
);

console.log(
    "Respuestas completas de Chilca:",
    encuesta10Resultados.length
);


    /* --------------------------------------------------------
       Mostrar resultado del filtro
       -------------------------------------------------------- */

    console.log(
        "Total de respuestas leídas:",
        filasDatos.length
    );

    console.log(
        "Estudiantes de Chilca encontrados:",
        encuesta10Resultados.length
    );


    console.log(
        "Resultados:",
        encuesta10Resultados
    );


    /* --------------------------------------------------------
       Actualizar estadísticas
       -------------------------------------------------------- */

    if (
        totalEncuesta10
    ) {

        totalEncuesta10.textContent =
            filasDatos.length;
    }


    if (
        respuestasChilca10
    ) {

        respuestasChilca10.textContent =
            encuesta10Resultados.length;
    }


    if (
        respuestasCompletas10
    ) {

        respuestasCompletas10.textContent =
            encuesta10Resultados.length;
    }


    /* --------------------------------------------------------
       Mostrar preview
       -------------------------------------------------------- */

    mostrarPreviewEncuesta10();


    /* --------------------------------------------------------
       Habilitar descarga
       -------------------------------------------------------- */

    if (
        btnExportarEncuesta10
    ) {

        btnExportarEncuesta10.disabled =
            encuesta10Resultados.length === 0;
    }


    /* --------------------------------------------------------
       Mensaje
       -------------------------------------------------------- */

    if (
        mensajeEncuesta10
    ) {

        mensajeEncuesta10.textContent =
            "Encuesta procesada correctamente. " +
            encuesta10Resultados.length +
            " respuestas de estudiantes de la sede Chilca encontradas.";
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

       Mostramos como máximo 100 filas.
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
                    registro[encabezado] || "";


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
            "No existen respuestas de la encuesta para exportar."
        );

        return;
    }


    /* --------------------------------------------------------
       Verificar XLSX
       -------------------------------------------------------- */

    if (
        typeof XLSX === "undefined"
    ) {

        alert(
            "La librería XLSX no está cargada."
        );

        return;
    }


    /* --------------------------------------------------------
       Crear libro
       -------------------------------------------------------- */

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
       HOJA DE DIAGNÓSTICO
       -------------------------------------------------------- */

    const diagnostico = [

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
                "SE CONSERVAN"
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
       Ajustar columnas
       -------------------------------------------------------- */

    ajustarAnchoEncuesta10(
        hoja
    );


    ajustarAnchoEncuesta10(
        hojaDiagnostico
    );


    /* --------------------------------------------------------
       Descargar
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
   EVENTO: SELECCIONAR ARCHIVO
   ============================================================ */

if (
    inputEncuesta10
) {

    inputEncuesta10.addEventListener(
        "change",
        function () {

            const archivo =
                this.files[0];


            if (
                !archivo
            ) {

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
               Limpiar resultados anteriores
               ------------------------------------------------ */

            encuesta10Datos = [];
            encuesta10Encabezados = [];
            encuesta10Resultados = [];
            encuesta10Columnas = {};


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
                            "Error Encuesta 10:",
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
                        "No se pudo leer el archivo."
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
   FIN DEL FILTRADOR ENCUESTA 10
   ============================================================ */