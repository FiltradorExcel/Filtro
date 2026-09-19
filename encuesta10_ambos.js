/* ============================================================
   ENCUESTA 10 - ESTRÉS ACADÉMICO 2026-2

   FILTRO PARA AMBOS GRUPOS:
   - ESTUDIANTES DE CHILCA
   - NO ESTUDIANTES DE CHILCA

   REGLA:
   - No se excluye por responder Sí o No en Chilca.
   - Las 10 preguntas deben estar completas.
   - Si falta una sola respuesta, se descarta toda la fila.

   IMPORTANTE:
   La estructura del CSV tiene dos ramas:

   SI pertenece a Chilca:
   Columna 1  = Sí/No Chilca
   Columna 2  = Género
   Columna 3  = Edad
   Columna 4  = Carrera
   Columna 5  = Ciclo

   SI NO pertenece a Chilca:
   Columna 6  = Universidad
   Columna 7  = Otra universidad
   Columna 8  = Género
   Columna 9  = Edad
   Columna 10 = Carrera
   Columna 11 = Ciclo

   Preguntas compartidas:
   Columna 12 = Cantidad de cursos
   Columna 13 = Horas de sueño
   Columna 14 = Trabajo
   Columna 15 = Alimentación
   Columna 21 = Procrastinación
   Columna 23 = Síntomas durante evaluaciones
   ============================================================ */

"use strict";


/* ============================================================
   VARIABLES GLOBALES
   ============================================================ */

let encuesta10AmbosDatos = [];
let encuesta10AmbosEncabezados = [];
let encuesta10AmbosResultados = [];
let encuesta10AmbosArchivo = null;


/* ============================================================
   ELEMENTOS DEL DOM
   ============================================================ */

const archivoEncuesta10Ambos =
    document.getElementById("archivoEncuesta10Ambos");

const nombreArchivoEncuesta10Ambos =
    document.getElementById("nombreArchivoEncuesta10Ambos");

const totalEncuesta10Ambos =
    document.getElementById("totalEncuesta10Ambos");

const respuestasChilca10Ambos =
    document.getElementById("respuestasChilca10Ambos");

const respuestasNoChilca10Ambos =
    document.getElementById("respuestasNoChilca10Ambos");

const respuestasCompletas10Ambos =
    document.getElementById("respuestasCompletas10Ambos");

const respuestasDescartadas10Ambos =
    document.getElementById("respuestasDescartadas10Ambos");

const preguntasDetectadas10Ambos =
    document.getElementById("preguntasDetectadas10Ambos");

const mensajeEncuesta10Ambos =
    document.getElementById("mensajeEncuesta10Ambos");

const tablaEncuesta10Ambos =
    document.getElementById("tablaEncuesta10Ambos");

const btnExportarEncuesta10Ambos =
    document.getElementById("btnExportarEncuesta10Ambos");


/* ============================================================
   CONFIGURACIÓN DE LAS 10 PREGUNTAS LÓGICAS
   ============================================================ */

const CONFIG_ENCUESTA_10_AMBOS = [

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
        nombre: "Ciclo"
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
   ESTRUCTURA REAL DEL CSV

   Índices JavaScript (comienzan en 0)

   0  = Marca temporal
   1  = Pregunta identificación Chilca

   RAMA CHILCA
   2  = Género
   3  = Edad
   4  = Carrera
   5  = Ciclo

   RAMA NO CHILCA
   6  = Universidad
   7  = Otra universidad
   8  = Género
   9  = Edad
   10 = Carrera
   11 = Ciclo

   CAMPOS COMPARTIDOS
   12 = Cantidad de cursos
   13 = Horas de sueño
   14 = Trabajo
   15 = Alimentación

   16 = Estrés 1
   17 = Estrés 2
   18 = Estrés 3
   19 = Estrés 4
   20 = Estrés 5
   21 = Estrés 6 - Procrastinación
   22 = Estrés 7

   23 = Síntomas
   ============================================================ */


/* ============================================================
   ÍNDICES DE COLUMNAS
   ============================================================ */

const INDICES_ENCUESTA_10_AMBOS = {

    chilca: {
        identificacion: 1,
        genero: 2,
        edad: 3,
        carrera: 4,
        ciclo: 5
    },

    noChilca: {
        universidad: 6,
        otraUniversidad: 7,
        genero: 8,
        edad: 9,
        carrera: 10,
        ciclo: 11
    },

    compartidas: {
        cursos: 12,
        sueno: 13,
        trabajo: 14,
        alimentacion: 15,
        procrastinacion: 21,
        sintomas: 23
    }

};


/* ============================================================
   NORMALIZAR TEXTO
   ============================================================ */

function normalizarTextoEncuesta10Ambos(texto) {

    return String(texto ?? "")
        .normalize("NFD")
        .replace(/[\u0300-\u036f]/g, "")
        .toLowerCase()
        .replace(/\s+/g, " ")
        .trim();

}


/* ============================================================
   REPARAR TEXTO MAL CODIFICADO
   ============================================================ */

function repararTextoEncuesta10Ambos(texto) {

    if (texto === null || texto === undefined) {
        return "";
    }

    let valor = String(texto);

    const reemplazos = {

        "Ã¡": "á",
        "Ã©": "é",
        "Ã­": "í",
        "Ã³": "ó",
        "Ãº": "ú",
        "Ã±": "ñ",

        "Ã": "Á",
        "Ã‰": "É",
        "Ã": "Í",
        "Ã“": "Ó",
        "Ãš": "Ú",
        "Ã‘": "Ñ",

        "Â¿": "¿",
        "Â¡": "¡",

        "â": "'",
        "â": "–",
        "â": "—",
        "â": "“",
        "â": "”",

        "Â": ""
    };

    Object.keys(reemplazos).forEach(clave => {

        valor = valor
            .split(clave)
            .join(reemplazos[clave]);

    });

    return valor;

}


/* ============================================================
   DETECTAR SEPARADOR CSV
   ============================================================ */

function detectarSeparadorEncuesta10Ambos(texto) {

    const primeraLinea =
        texto.split(/\r?\n/)[0] || "";

    const separadores = [
        ",",
        ";",
        "\t"
    ];

    let mejorSeparador = ",";
    let mayorCantidad = -1;

    separadores.forEach(separador => {

        const cantidad =
            primeraLinea.split(separador).length - 1;

        if (cantidad > mayorCantidad) {

            mayorCantidad = cantidad;
            mejorSeparador = separador;

        }

    });

    return mejorSeparador;

}


/* ============================================================
   PARSEAR CSV
   ============================================================ */

function parsearCSVEncuesta10Ambos(texto, separador) {

    const filas = [];

    let filaActual = [];
    let campoActual = "";
    let dentroComillas = false;

    for (let i = 0; i < texto.length; i++) {

        const caracter = texto[i];
        const siguiente = texto[i + 1];

        /* ---------------------------------------------
           COMILLAS
           --------------------------------------------- */

        if (caracter === '"') {

            if (
                dentroComillas &&
                siguiente === '"'
            ) {

                campoActual += '"';
                i++;

            } else {

                dentroComillas = !dentroComillas;

            }

            continue;

        }


        /* ---------------------------------------------
           SEPARADOR
           --------------------------------------------- */

        if (
            caracter === separador &&
            !dentroComillas
        ) {

            filaActual.push(campoActual);
            campoActual = "";

            continue;

        }


        /* ---------------------------------------------
           SALTO DE LÍNEA
           --------------------------------------------- */

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

            filaActual.push(campoActual);
            campoActual = "";

            if (
                filaActual.length > 1 ||
                filaActual.some(
                    valor =>
                        String(valor).trim() !== ""
                )
            ) {

                filas.push(filaActual);

            }

            filaActual = [];

            continue;

        }


        /* ---------------------------------------------
           CARÁCTER NORMAL
           --------------------------------------------- */

        campoActual += caracter;

    }


    /* ---------------------------------------------
       ÚLTIMA FILA
       --------------------------------------------- */

    if (
        campoActual !== "" ||
        filaActual.length > 0
    ) {

        filaActual.push(campoActual);

        if (
            filaActual.length > 1 ||
            filaActual.some(
                valor =>
                    String(valor).trim() !== ""
            )
        ) {

            filas.push(filaActual);

        }

    }

    return filas;

}


/* ============================================================
   OBTENER VALOR DE UNA COLUMNA
   ============================================================ */

function obtenerValorEncuesta10Ambos(fila, indice) {

    if (
        indice === undefined ||
        indice === null ||
        indice < 0
    ) {

        return "";

    }

    return repararTextoEncuesta10Ambos(
        fila[indice] ?? ""
    ).trim();

}


/* ============================================================
   DETERMINAR GRUPO

   SI  -> Chilca
   NO  -> No Chilca

   No se excluye ningún grupo.
   ============================================================ */

function determinarGrupoEncuesta10Ambos(fila) {

    const valor = normalizarTextoEncuesta10Ambos(

        obtenerValorEncuesta10Ambos(
            fila,
            INDICES_ENCUESTA_10_AMBOS.chilca.identificacion
        )

    );


    if (
        valor === "si" ||
        valor === "sí"
    ) {

        return "Chilca";

    }


    if (valor === "no") {

        return "No Chilca";

    }


    return "No identificado";

}


/* ============================================================
   CONSTRUIR RESPUESTA UNIFICADA

   ESTA ES LA PARTE IMPORTANTE:

   Para Chilca:
      género = columna 2
      edad   = columna 3
      carrera= columna 4
      ciclo  = columna 5

   Para No Chilca:
      género = columna 8
      edad   = columna 9
      carrera= columna 10
      ciclo  = columna 11

   Los demás campos son compartidos.
   ============================================================ */

function construirRespuestaEncuesta10Ambos(fila) {

    const grupo =
        determinarGrupoEncuesta10Ambos(fila);

    let indiceGenero;
    let indiceEdad;
    let indiceCarrera;
    let indiceCiclo;

    /* ---------------------------------------------
       RAMA CHILCA
       --------------------------------------------- */

    if (grupo === "Chilca") {

        indiceGenero =
            INDICES_ENCUESTA_10_AMBOS.chilca.genero;

        indiceEdad =
            INDICES_ENCUESTA_10_AMBOS.chilca.edad;

        indiceCarrera =
            INDICES_ENCUESTA_10_AMBOS.chilca.carrera;

        indiceCiclo =
            INDICES_ENCUESTA_10_AMBOS.chilca.ciclo;

    }

    /* ---------------------------------------------
       RAMA NO CHILCA
       --------------------------------------------- */

    else if (grupo === "No Chilca") {

        indiceGenero =
            INDICES_ENCUESTA_10_AMBOS.noChilca.genero;

        indiceEdad =
            INDICES_ENCUESTA_10_AMBOS.noChilca.edad;

        indiceCarrera =
            INDICES_ENCUESTA_10_AMBOS.noChilca.carrera;

        indiceCiclo =
            INDICES_ENCUESTA_10_AMBOS.noChilca.ciclo;

    }

    else {

        return null;

    }


    /* ---------------------------------------------
       UNIVERSIDAD

       Para Chilca:
       UNMSM - Sede Chilca

       Para No Chilca:
       se utiliza la universidad seleccionada.
       Si dice "Otra", se usa el campo
       "Otra universidad".
       --------------------------------------------- */

    let universidad = "";

    if (grupo === "Chilca") {

        universidad = "UNMSM - Sede Chilca";

    }

    else if (grupo === "No Chilca") {

        const universidadSeleccionada =
            obtenerValorEncuesta10Ambos(
                fila,
                INDICES_ENCUESTA_10_AMBOS.noChilca.universidad
            );

        const otraUniversidad =
            obtenerValorEncuesta10Ambos(
                fila,
                INDICES_ENCUESTA_10_AMBOS.noChilca.otraUniversidad
            );

        const universidadNormalizada =
            normalizarTextoEncuesta10Ambos(
                universidadSeleccionada
            );

        if (
            universidadNormalizada === "otra" &&
            otraUniversidad
        ) {

            universidad = otraUniversidad;

        }

        else {

            universidad =
                universidadSeleccionada;

        }

    }


    /* ---------------------------------------------
       CAMPOS COMPARTIDOS
       --------------------------------------------- */

    const indicesCompartidos =
        INDICES_ENCUESTA_10_AMBOS.compartidas;


    const respuesta = {

        "Género":
            obtenerValorEncuesta10Ambos(
                fila,
                indiceGenero
            ),

        "Edad":
            obtenerValorEncuesta10Ambos(
                fila,
                indiceEdad
            ),

        "Carrera":
            obtenerValorEncuesta10Ambos(
                fila,
                indiceCarrera
            ),

        "Ciclo":
            obtenerValorEncuesta10Ambos(
                fila,
                indiceCiclo
            ),

        "Cantidad de cursos":
            obtenerValorEncuesta10Ambos(
                fila,
                indicesCompartidos.cursos
            ),

        "Horas diarias de sueño":
            obtenerValorEncuesta10Ambos(
                fila,
                indicesCompartidos.sueno
            ),

        "¿Trabajas?":
            obtenerValorEncuesta10Ambos(
                fila,
                indicesCompartidos.trabajo
            ),

        "Alimentación":
            obtenerValorEncuesta10Ambos(
                fila,
                indicesCompartidos.alimentacion
            ),

        "Frecuencia de procrastinación":
            obtenerValorEncuesta10Ambos(
                fila,
                indicesCompartidos.procrastinacion
            ),

        "Síntomas durante los exámenes":
            obtenerValorEncuesta10Ambos(
                fila,
                indicesCompartidos.sintomas
            ),

        "Sede Chilca":
            grupo === "Chilca"
                ? "Sí"
                : "No",

        "Universidad":
            universidad

    };


    return respuesta;

}


/* ============================================================
   VERIFICAR SI UNA RESPUESTA ESTÁ COMPLETA

   IMPORTANTE:

   La comprobación se realiza DESPUÉS de construir
   la respuesta unificada.

   De esta forma:

   Chilca:
      se revisan columnas 2-5

   No Chilca:
      se revisan columnas 8-11

   Y ambos utilizan las mismas columnas
   para las preguntas restantes.

   Si falta UNA sola respuesta:
      la fila completa se descarta.
   ============================================================ */

function respuestaCompletaEncuesta10Ambos(respuesta) {

    if (!respuesta) {

        return false;

    }


    for (
        let numeroPregunta = 1;
        numeroPregunta <= 10;
        numeroPregunta++
    ) {

        const pregunta =
            CONFIG_ENCUESTA_10_AMBOS.find(
                item =>
                    item.numero === numeroPregunta
            );


        if (!pregunta) {

            return false;

        }


        const valor =
            respuesta[pregunta.nombre];


        if (
            valor === undefined ||
            valor === null ||
            String(valor).trim() === ""
        ) {

            return false;

        }

    }


    return true;

}


/* ============================================================
   PROCESAR ENCUESTA
   ============================================================ */

function procesarEncuesta10Ambos(texto) {

    try {

        /* ---------------------------------------------
           DETECTAR SEPARADOR
           --------------------------------------------- */

        const separador =
            detectarSeparadorEncuesta10Ambos(texto);


        /* ---------------------------------------------
           PARSEAR CSV
           --------------------------------------------- */

        const filas =
            parsearCSVEncuesta10Ambos(
                texto,
                separador
            );


        if (!filas.length) {

            throw new Error(
                "No se encontraron datos en el archivo."
            );

        }


        /* ---------------------------------------------
           ENCABEZADOS
           --------------------------------------------- */

        encuesta10AmbosEncabezados =
            filas[0].map(encabezado =>

                repararTextoEncuesta10Ambos(
                    encabezado
                ).trim()

            );


        /* ---------------------------------------------
           DATOS
           --------------------------------------------- */

        encuesta10AmbosDatos =
            filas.slice(1);


        totalEncuesta10Ambos.textContent =
            encuesta10AmbosDatos.length;


        /* ---------------------------------------------
           VALIDAR ESTRUCTURA MÍNIMA

           Necesitamos como mínimo 24 columnas
           para llegar hasta síntomas (índice 23).
           --------------------------------------------- */

        const cantidadColumnas =
            encuesta10AmbosEncabezados.length;


        if (cantidadColumnas < 24) {

            throw new Error(

                "La estructura del CSV no coincide con la encuesta esperada. " +

                "Se detectaron " +

                cantidadColumnas +

                " columnas y se necesitan al menos 24."

            );

        }


        /* ---------------------------------------------
           YA NO HACEMOS DETECCIÓN DINÁMICA

           La estructura real del CSV está definida
           por posiciones, igual que app.js.
           --------------------------------------------- */

        preguntasDetectadas10Ambos.textContent =
            "10/10";


        /* ---------------------------------------------
           CONTADORES
           --------------------------------------------- */

        let cantidadChilca = 0;
        let cantidadNoChilca = 0;
        let cantidadNoIdentificada = 0;
        let cantidadDescartadas = 0;


        encuesta10AmbosResultados = [];


        /* ---------------------------------------------
           PROCESAR TODAS LAS FILAS
           --------------------------------------------- */

        encuesta10AmbosDatos.forEach(
            (fila, indiceFila) => {

                /* -----------------------------------------
                   EVITAR FILAS TOTALMENTE VACÍAS
                   ----------------------------------------- */

                const filaTieneDatos =
                    fila.some(
                        valor =>
                            String(valor ?? "").trim() !== ""
                    );


                if (!filaTieneDatos) {

                    return;

                }


                /* -----------------------------------------
                   DETERMINAR GRUPO
                   ----------------------------------------- */

                const grupo =
                    determinarGrupoEncuesta10Ambos(
                        fila
                    );


                /* -----------------------------------------
                   CONTABILIZAR GRUPO
                   ----------------------------------------- */

                if (grupo === "Chilca") {

                    cantidadChilca++;

                }

                else if (grupo === "No Chilca") {

                    cantidadNoChilca++;

                }

                else {

                    cantidadNoIdentificada++;

                    /*
                     * Si no podemos determinar si la persona
                     * respondió Sí o No, no podemos asignar
                     * correctamente las columnas condicionales.
                     *
                     * Por seguridad, se descarta.
                     */

                    cantidadDescartadas++;

                    console.warn(
                        "Fila descartada: grupo no identificado.",
                        {
                            filaCSV:
                                indiceFila + 2,
                            valor:
                                fila[
                                    INDICES_ENCUESTA_10_AMBOS
                                        .chilca
                                        .identificacion
                                ]
                        }
                    );

                    return;

                }


                /* -----------------------------------------
                   CONSTRUIR RESPUESTA UNIFICADA
                   ----------------------------------------- */

                const respuesta =
                    construirRespuestaEncuesta10Ambos(
                        fila
                    );


                /* -----------------------------------------
                   COMPROBAR LAS 10 PREGUNTAS
                   ----------------------------------------- */

                const completa =
                    respuestaCompletaEncuesta10Ambos(
                        respuesta
                    );


                /* -----------------------------------------
                   SI FALTA UNA RESPUESTA:

                   DESCARTAR TODA LA FILA
                   ----------------------------------------- */

                if (!completa) {

                    cantidadDescartadas++;

                    console.warn(
                        "Fila descartada por datos incompletos.",
                        {
                            filaCSV:
                                indiceFila + 2,
                            grupo:
                                grupo,
                            respuesta:
                                respuesta
                        }
                    );

                    return;

                }


                /* -----------------------------------------
                   GUARDAR RESPUESTA
                   ----------------------------------------- */

                respuesta["Fila original"] =
                    indiceFila + 2;


                encuesta10AmbosResultados.push(
                    respuesta
                );

            }
        );


        /* ---------------------------------------------
           ACTUALIZAR ESTADÍSTICAS
           --------------------------------------------- */

        respuestasChilca10Ambos.textContent =
            cantidadChilca;

        respuestasNoChilca10Ambos.textContent =
            cantidadNoChilca;

        respuestasCompletas10Ambos.textContent =
            encuesta10AmbosResultados.length;

        respuestasDescartadas10Ambos.textContent =
            cantidadDescartadas;


        /* ---------------------------------------------
           MENSAJE
           --------------------------------------------- */

        mensajeEncuesta10Ambos.textContent =

            "Proceso completado. Se encontraron " +

            encuesta10AmbosResultados.length +

            " respuestas completas de ambos grupos. " +

            "Se descartaron " +

            cantidadDescartadas +

            " respuestas con datos incompletos.";


        /* ---------------------------------------------
           MOSTRAR TABLA
           --------------------------------------------- */

        mostrarPreviewEncuesta10Ambos();


        /* ---------------------------------------------
           BOTÓN EXPORTAR
           --------------------------------------------- */

        btnExportarEncuesta10Ambos.disabled =
            encuesta10AmbosResultados.length === 0;


        /* ---------------------------------------------
           DIAGNÓSTICO EN CONSOLA
           --------------------------------------------- */

        console.log(
            "================================================"
        );

        console.log(
            " ENCUESTA 10 - AMBOS GRUPOS"
        );

        console.log(
            "================================================"
        );

        console.log(
            "Total de filas:",
            encuesta10AmbosDatos.length
        );

        console.log(
            "Estudiantes de Chilca:",
            cantidadChilca
        );

        console.log(
            "No estudiantes de Chilca:",
            cantidadNoChilca
        );

        console.log(
            "No identificadas:",
            cantidadNoIdentificada
        );

        console.log(
            "Respuestas completas:",
            encuesta10AmbosResultados.length
        );

        console.log(
            "Respuestas descartadas:",
            cantidadDescartadas
        );

        console.log(
            "================================================"
        );


        /* ---------------------------------------------
           DIAGNÓSTICO DETALLADO

           Contamos cuántas respuestas completas
           existen por grupo.
           --------------------------------------------- */

        const completasChilca =
            encuesta10AmbosResultados.filter(
                respuesta =>
                    respuesta["Sede Chilca"] === "Sí"
            ).length;


        const completasNoChilca =
            encuesta10AmbosResultados.filter(
                respuesta =>
                    respuesta["Sede Chilca"] === "No"
            ).length;


        console.log(
            "Completas Chilca:",
            completasChilca
        );

        console.log(
            "Completas No Chilca:",
            completasNoChilca
        );


    }

    catch (error) {

        console.error(
            "Error Encuesta 10 Ambos:",
            error
        );


        mensajeEncuesta10Ambos.textContent =
            "Error: " + error.message;


        encuesta10AmbosResultados = [];


        respuestasCompletas10Ambos.textContent =
            "0";


        respuestasDescartadas10Ambos.textContent =
            "0";


        btnExportarEncuesta10Ambos.disabled =
            true;


        mostrarPreviewEncuesta10Ambos();

    }

}


/* ============================================================
   MOSTRAR PREVIEW
   ============================================================ */

function mostrarPreviewEncuesta10Ambos() {

    if (!tablaEncuesta10Ambos) {

        return;

    }


    const thead =
        tablaEncuesta10Ambos.querySelector("thead");

    const tbody =
        tablaEncuesta10Ambos.querySelector("tbody");


    thead.innerHTML = "";
    tbody.innerHTML = "";


    /* ---------------------------------------------
       SIN RESULTADOS
       --------------------------------------------- */

    if (!encuesta10AmbosResultados.length) {

        tbody.innerHTML = `

            <tr>

                <td colspan="12">

                    No existen respuestas completas.

                </td>

            </tr>

        `;

        return;

    }


    /* ---------------------------------------------
       ENCABEZADOS
       --------------------------------------------- */

    const trHead =
        document.createElement("tr");


    CONFIG_ENCUESTA_10_AMBOS.forEach(
        pregunta => {

            const th =
                document.createElement("th");

            th.textContent =
                pregunta.nombre;

            trHead.appendChild(th);

        }
    );


    /* ---------------------------------------------
       COLUMNA SEDE
       --------------------------------------------- */

    const thSede =
        document.createElement("th");

    thSede.textContent =
        "Sede Chilca";

    trHead.appendChild(thSede);


    /* ---------------------------------------------
       COLUMNA UNIVERSIDAD
       --------------------------------------------- */

    const thUniversidad =
        document.createElement("th");

    thUniversidad.textContent =
        "Universidad";

    trHead.appendChild(thUniversidad);


    thead.appendChild(trHead);


    /* ---------------------------------------------
       FILAS
       --------------------------------------------- */

    encuesta10AmbosResultados.forEach(
        respuesta => {

            const tr =
                document.createElement("tr");


            CONFIG_ENCUESTA_10_AMBOS.forEach(
                pregunta => {

                    const td =
                        document.createElement("td");

                    td.textContent =
                        respuesta[pregunta.nombre] ?? "";

                    tr.appendChild(td);

                }
            );


            /* -----------------------------------------
               SEDE
               ----------------------------------------- */

            const tdSede =
                document.createElement("td");

            tdSede.textContent =
                respuesta["Sede Chilca"] ?? "";

            tr.appendChild(tdSede);


            /* -----------------------------------------
               UNIVERSIDAD
               ----------------------------------------- */

            const tdUniversidad =
                document.createElement("td");

            tdUniversidad.textContent =
                respuesta["Universidad"] ?? "";

            tr.appendChild(tdUniversidad);


            tbody.appendChild(tr);

        }
    );


    ajustarAnchoEncuesta10Ambos();

}


/* ============================================================
   EXPORTAR A EXCEL
   ============================================================ */

function exportarEncuesta10Ambos() {

    if (!encuesta10AmbosResultados.length) {

        alert(
            "No existen respuestas completas para exportar."
        );

        return;

    }


    if (typeof XLSX === "undefined") {

        alert(
            "No se encontró la librería XLSX."
        );

        return;

    }


    /* ---------------------------------------------
       HOJA PRINCIPAL

       Se exportan las 10 preguntas + grupo +
       universidad + fila original.
       --------------------------------------------- */

    const datosExcel =
        encuesta10AmbosResultados.map(
            respuesta => {

                const fila = {};


                CONFIG_ENCUESTA_10_AMBOS.forEach(
                    pregunta => {

                        fila[pregunta.nombre] =
                            respuesta[pregunta.nombre];

                    }
                );


                fila["Sede Chilca"] =
                    respuesta["Sede Chilca"];


                fila["Universidad"] =
                    respuesta["Universidad"];


                fila["Fila original"] =
                    respuesta["Fila original"];


                return fila;

            }
        );


    const hojaPreguntas =
        XLSX.utils.json_to_sheet(
            datosExcel
        );


    /* ---------------------------------------------
       AJUSTAR ANCHO DE COLUMNAS
       --------------------------------------------- */

    hojaPreguntas["!cols"] =
        calcularAnchosExcelEncuesta10Ambos(
            datosExcel
        );


    /* ---------------------------------------------
       DIAGNÓSTICO
       --------------------------------------------- */

    const cantidadChilca =
        encuesta10AmbosResultados.filter(
            respuesta =>
                respuesta["Sede Chilca"] === "Sí"
        ).length;


    const cantidadNoChilca =
        encuesta10AmbosResultados.filter(
            respuesta =>
                respuesta["Sede Chilca"] === "No"
        ).length;


    const diagnostico = [

        {
            "Indicador":
                "Total de respuestas leídas",

            "Cantidad":
                encuesta10AmbosDatos.length
        },

        {
            "Indicador":
                "Estudiantes de Chilca",

            "Cantidad":
                document.getElementById(
                    "respuestasChilca10Ambos"
                ).textContent
        },

        {
            "Indicador":
                "No estudiantes de Chilca",

            "Cantidad":
                document.getElementById(
                    "respuestasNoChilca10Ambos"
                ).textContent
        },

        {
            "Indicador":
                "Respuestas completas incluidas",

            "Cantidad":
                encuesta10AmbosResultados.length
        },

        {
            "Indicador":
                "Completas de Chilca",

            "Cantidad":
                cantidadChilca
        },

        {
            "Indicador":
                "Completas No Chilca",

            "Cantidad":
                cantidadNoChilca
        },

        {
            "Indicador":
                "Respuestas descartadas por datos vacíos",

            "Cantidad":
                document.getElementById(
                    "respuestasDescartadas10Ambos"
                ).textContent
        },

        {
            "Indicador":
                "Preguntas utilizadas",

            "Cantidad":
                "10/10"
        }

    ];


    const hojaDiagnostico =
        XLSX.utils.json_to_sheet(
            diagnostico
        );


    hojaDiagnostico["!cols"] = [

        {
            wch: 45
        },

        {
            wch: 20
        }

    ];


    /* ---------------------------------------------
       CREAR LIBRO
       --------------------------------------------- */

    const libro =
        XLSX.utils.book_new();


    XLSX.utils.book_append_sheet(

        libro,

        hojaPreguntas,

        "Encuesta_10_Preguntas"

    );


    XLSX.utils.book_append_sheet(

        libro,

        hojaDiagnostico,

        "Diagnostico"

    );


    /* ---------------------------------------------
       DESCARGAR
       --------------------------------------------- */

    const nombreArchivo =

        encuesta10AmbosArchivo

            ? encuesta10AmbosArchivo.name
                .replace(/\.[^/.]+$/, "")

            : "encuesta_estres_2026_2";


    XLSX.writeFile(

        libro,

        `${nombreArchivo}_10_preguntas_completas.xlsx`

    );

}


/* ============================================================
   CALCULAR ANCHOS PARA EXCEL
   ============================================================ */

function calcularAnchosExcelEncuesta10Ambos(
    datos
) {

    if (!datos.length) {

        return [];

    }


    const encabezados =
        Object.keys(datos[0]);


    return encabezados.map(
        encabezado => {

            let maximo =
                encabezado.length;


            datos.forEach(
                fila => {

                    const valor =
                        String(
                            fila[encabezado] ?? ""
                        );


                    if (
                        valor.length > maximo
                    ) {

                        maximo =
                            valor.length;

                    }

                }
            );


            return {

                wch: Math.min(

                    Math.max(
                        maximo + 2,
                        12
                    ),

                    50

                )

            };

        }
    );

}


/* ============================================================
   AJUSTAR ANCHO DE COLUMNAS DE LA TABLA HTML
   ============================================================ */

function ajustarAnchoEncuesta10Ambos() {

    if (
        !tablaEncuesta10Ambos ||
        !encuesta10AmbosResultados.length
    ) {

        return;

    }


    const filas =
        encuesta10AmbosResultados;


    const encabezados = [

        ...CONFIG_ENCUESTA_10_AMBOS.map(
            pregunta =>
                pregunta.nombre
        ),

        "Sede Chilca",

        "Universidad"

    ];


    const anchos =
        encabezados.map(
            encabezado => {

                let maximo =
                    encabezado.length;


                filas.forEach(
                    fila => {

                        const valor =
                            String(
                                fila[encabezado] ?? ""
                            );


                        if (
                            valor.length > maximo
                        ) {

                            maximo =
                                valor.length;

                        }

                    }
                );


                return {

                    wch: Math.min(

                        Math.max(
                            maximo + 2,
                            12
                        ),

                        45

                    )

                };

            }
        );


    /* ---------------------------------------------
       Aplicar ancho visual aproximado a la tabla
       --------------------------------------------- */

    const ths =
        tablaEncuesta10Ambos
            .querySelectorAll("thead th");


    ths.forEach(
        (th, indice) => {

            if (anchos[indice]) {

                th.style.minWidth =
                    `${Math.min(
                        anchos[indice].wch * 7,
                        320
                    )}px`;

            }

        }
    );

}


/* ============================================================
   EVENTO: SELECCIONAR ARCHIVO
   ============================================================ */

if (archivoEncuesta10Ambos) {

    archivoEncuesta10Ambos.addEventListener(

        "change",

        function (evento) {

            const archivo =
                evento.target.files[0];


            if (!archivo) {

                nombreArchivoEncuesta10Ambos.textContent =
                    "Ningún archivo seleccionado.";

                return;

            }


            encuesta10AmbosArchivo =
                archivo;


            nombreArchivoEncuesta10Ambos.textContent =
                archivo.name;


            mensajeEncuesta10Ambos.textContent =
                "Leyendo archivo...";


            const lector =
                new FileReader();


            lector.onload =
                function (eventoLectura) {

                    const contenido =
                        eventoLectura.target.result;


                    procesarEncuesta10Ambos(
                        contenido
                    );

                };


            lector.onerror =
                function () {

                    mensajeEncuesta10Ambos.textContent =
                        "No se pudo leer el archivo.";

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

if (btnExportarEncuesta10Ambos) {

    btnExportarEncuesta10Ambos.addEventListener(

        "click",

        exportarEncuesta10Ambos

    );

}


/* ============================================================
   INICIO
   ============================================================ */

console.log(
    "================================================"
);

console.log(
    "Encuesta 10 - Filtro de ambos grupos"
);

console.log(
    "Estructura condicional basada en app.js"
);

console.log(
    "Chilca: columnas 2-5"
);

console.log(
    "No Chilca: columnas 8-11"
);

console.log(
    "Campos compartidos: columnas 12-15, 21 y 23"
);

console.log(
    "================================================"
);