/* ============================================================
   LIMPIADOR DE ENCUESTA UNMSM - VERSIÓN CORREGIDA
   ============================================================

   REGLA DEFINITIVA:

   - Filas originales 2 a 19:
       EXCLUIDAS

   - Filas originales 20 en adelante:
       VÁLIDAS

   IMPORTANTE:
   - No se cruzan respuestas entre filas.
   - No se reconstruyen respuestas.
   - No se combinan datos de diferentes estudiantes.
   - Se trabaja directamente con las posiciones originales
     de las 31 columnas del CSV de Google Forms.

   ESTRUCTURA ESPERADA DEL CSV:

   0  Marca temporal
   1  Q1
   2  Q2 Chilca
   3  Q3 Chilca
   4  Q4 Chilca
   5  Q5 Chilca
   6  Q2B universidad
   7  Otra universidad
   8  Q3B sexo
   9  Q4B edad
   10 Q5B carrera
   11 Q6B ciclo
   12 Q7 cursos
   13 Q8 sueño
   14 Q9 trabajo
   15 Q10 alimentación
   16 Q11 estrés
   17 Q12 estrés
   18 Q13 estrés
   19 Q14 estrés
   20 Q15 estrés
   21 Q16 estrés
   22 Q17 estrés
   23 Q18 síntomas
   24 Q19 rendimiento
   25 Q20 comparación
   26 Q21 afecta estudio
   27 Q22 afecta notas
   28 Q23 no entrega
   29 Q24 nivel estrés
   30 Q25 percepción

   ============================================================ */


/* ============================================================
   VARIABLES
============================================================ */

let datosOriginales = [];
let datosValidos = [];
let datosExcluidos = [];

let encabezadosOriginales = [];

let archivoActual = null;


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
   EVENTO: SELECCIONAR ARCHIVO
============================================================ */

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

        nombreArchivo.textContent =
            "Archivo seleccionado: " +
            archivo.name;

        leerCSV(archivo);
    }
);


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

                mensaje.textContent =
                    "Error al procesar el archivo: " +
                    error.message;

                btnExportar.disabled =
                    true;
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


    /* -----------------------------------------
       ENCABEZADOS
    ----------------------------------------- */

    encabezadosOriginales =
        filas[0].map(
            encabezado =>
                repararTexto(
                    encabezado
                )
        );


    /* -----------------------------------------
       RESPUESTAS
    ----------------------------------------- */

    const filasDatos =
        filas.slice(1);


    datosOriginales = [];

    datosValidos = [];

    datosExcluidos = [];


    /* -----------------------------------------
       PROCESAR CADA FILA
    ----------------------------------------- */

    filasDatos.forEach(
        function (
            fila,
            indice
        ) {

            /*
               La fila 1 de Excel contiene
               los encabezados.

               Por eso la primera respuesta
               está en la fila 2.
            */

            const filaExcel =
                indice + 2;


            const filaNormalizada =
                normalizarNumeroColumnas(
                    fila,
                    encabezadosOriginales.length
                );


            /*
               Cada registro conserva únicamente
               sus propios valores.
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


            /*
               =====================================
               REGLA DEFINITIVA
               =====================================
            */

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


    actualizarEstadisticas();

    mostrarPreview();


    mensaje.textContent =
        "Archivo procesado correctamente. " +
        datosValidos.length +
        " respuestas válidas encontradas.";


    btnExportar.disabled =
        datosValidos.length === 0;
}


/* ============================================================
   ESTADÍSTICAS
============================================================ */

function actualizarEstadisticas() {

    totalRespuestas.textContent =
        datosOriginales.length;


    respuestasValidas.textContent =
        datosValidos.length;


    respuestasExcluidas.textContent =
        datosExcluidos.length;


    columnasDetectadas.textContent =
        encabezadosOriginales.length;
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
       ESTA ES LA PARTE CLAVE.

       "fila" pertenece exclusivamente a este
       registro.

       Nunca se consulta datosValidos[n]
       ni datosOriginales[n].

       Por tanto no puede existir cruce
       entre estudiantes.
    */

    const fila =
        registro.valores;


    /*
       -----------------------------------------
       DATOS GENERALES
       -----------------------------------------
    */

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


    /*
       -----------------------------------------
       UNMSM CHILCA
       -----------------------------------------
    */

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


    /*
       -----------------------------------------
       OTRAS UNIVERSIDADES
       -----------------------------------------
    */

    else if (
        grupo ===
        "Otras universidades"
    ) {

        universidad =
            valorColumna(
                fila,
                6
            );


        /*
           Si Google Forms utiliza "Otra",
           tomamos la especificación de
           la columna 7.
        */

        const otraUniversidad =
            valorColumna(
                fila,
                7
            );


        if (
            (
                universidad
                    .toLowerCase()
                    .trim() === "otra"
            ) &&
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


    /*
       -----------------------------------------
       CARGA ACADÉMICA Y ESTILO DE VIDA
       -----------------------------------------
    */

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


    /*
       -----------------------------------------
       ESTRÉS ACADÉMICO
       -----------------------------------------
    */

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


    /*
       -----------------------------------------
       SÍNTOMAS
       -----------------------------------------
    */

    const sintomas =
        valorColumna(
            fila,
            23
        );


    /*
       -----------------------------------------
       RENDIMIENTO
       -----------------------------------------
    */

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


    /*
       -----------------------------------------
       PERCEPCIÓN
       -----------------------------------------
    */

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


    /*
       -----------------------------------------
       OBJETO FINAL
       -----------------------------------------
    */

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

    const thead =
        tablaPreview.querySelector(
            "thead"
        );


    const tbody =
        tablaPreview.querySelector(
            "tbody"
        );


    thead.innerHTML = "";

    tbody.innerHTML = "";


    /*
       Encabezados que mostraremos
       en la vista previa.
    */

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


    /*
       Crear encabezados
    */

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


    /*
       ========================================================
       CORRECCIÓN DEL ERROR
       ========================================================

       Antes se hacía:

           datos.slice(...)

       Pero "datos" era un objeto.

       Ahora obtenemos directamente el objeto
       unificado y usamos los encabezados para
       recuperar cada valor.

       ========================================================
    */

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

btnExportar.addEventListener(
    "click",
    exportarExcel
);


function exportarExcel() {

    if (
        datosValidos.length === 0
    ) {

        alert(
            "No existen respuestas válidas para exportar."
        );

        return;
    }


    /*
       Crear libro
    */

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


    mensaje.textContent =
        "Excel generado correctamente. " +
        datosValidos.length +
        " respuestas válidas exportadas.";
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