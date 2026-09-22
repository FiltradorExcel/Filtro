/*
============================================================
DATOS GOOGLE — ENCUESTA ESTRÉS ACADÉMICO 2026-2
============================================================

RESPONSABILIDAD DE ESTE ARCHIVO:

- Conectarse con Google Apps Script.
- Descargar los datos de Google Sheets.
- Entregar los datos PUROS, exactamente como vienen.
- No filtrar.
- No normalizar.
- No interpretar respuestas.
- No modificar columnas.

Los archivos:
- app.js
- encuesta10.js
- encuesta10_ambos.js

serán responsables de procesar y filtrar los datos.

============================================================
*/

const API_ENCUESTA_URL =
  "https://script.google.com/macros/s/AKfycbw8XPPS35stCLmSQgr0spd6Jv__7dylBUunPfM2TrJCFuZMiViNfw3nvcxyW2XCOSCI/exec";


/*
============================================================
1. DESCARGAR DATOS PUROS DESDE GOOGLE
============================================================
*/

async function obtenerDatosGoogle() {

  try {

    console.log("🌐 Conectando con Google Sheets...");

    const respuesta = await fetch(API_ENCUESTA_URL, {
      method: "GET",
      cache: "no-store"
    });

    console.log(
      "📡 Estado HTTP:",
      respuesta.status
    );

    if (!respuesta.ok) {
      throw new Error(
        `Error HTTP ${respuesta.status}`
      );
    }

    const datos = await respuesta.json();

    if (!datos.ok) {
      throw new Error(
        datos.error ||
        datos.mensaje ||
        "La API devolvió un error."
      );
    }

    console.log(
      "✅ Datos recibidos desde Google."
    );

    console.log(
      "📊 Total de respuestas:",
      datos.totalFilas
    );

    console.log(
      "📋 Total de columnas:",
      datos.encabezados.length
    );


    /*
    --------------------------------------------------------
    GUARDAR RESPUESTA COMPLETA
    --------------------------------------------------------
    */

    window.ULTIMOS_DATOS_GOOGLE = datos;


    /*
    --------------------------------------------------------
    GUARDAR SOLAMENTE LAS FILAS
    --------------------------------------------------------
    */

    window.FILAS_GOOGLE = datos.filas;


    /*
    --------------------------------------------------------
    GUARDAR ENCABEZADOS
    --------------------------------------------------------
    */

    window.ENCABEZADOS_GOOGLE = datos.encabezados;


    console.log(
      "💾 Datos disponibles en:"
    );

    console.log(
      "window.ULTIMOS_DATOS_GOOGLE"
    );

    console.log(
      "window.FILAS_GOOGLE"
    );

    console.log(
      "window.ENCABEZADOS_GOOGLE"
    );


    /*
    --------------------------------------------------------
    DEVOLVER DATOS PUROS
    --------------------------------------------------------
    */

    return datos;

  } catch (error) {

    console.error(
      "❌ Error obteniendo datos de Google:",
      error
    );

    throw error;
  }
}


/*
============================================================
2. OBTENER SOLAMENTE LAS FILAS
============================================================
*/

async function obtenerFilasGoogle() {

  const datos = await obtenerDatosGoogle();

  return datos.filas;
}


/*
============================================================
3. OBTENER SOLAMENTE LOS ENCABEZADOS
============================================================
*/

async function obtenerEncabezadosGoogle() {

  const datos = await obtenerDatosGoogle();

  return datos.encabezados;
}


/*
============================================================
4. DESCARGAR DATOS Y DEJARLOS DISPONIBLES
============================================================

Esta función es útil para los demás archivos.

No modifica absolutamente nada.

============================================================
*/

async function cargarDatosGoogle() {

  const datos = await obtenerDatosGoogle();

  console.log(
    "📥 Datos Google cargados correctamente."
  );

  return datos;
}