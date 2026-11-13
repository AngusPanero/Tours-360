/**
 * legalInfo — datos de Umbral que usan la política de privacidad y los términos
 * ---------------------------------------------------------
 * Todo lo que diga PENDIENTE se ve resaltado en la página (componente <Dato />)
 * para que no se publique así. Completalo antes de salir a producción.
 */

export const PENDIENTE = "PENDIENTE";

/** true si el dato todavía no se completó */
export const esPendiente = (valor: string) => valor.trim().toUpperCase().startsWith(PENDIENTE);

// Cada cambio de texto: subí la versión y la fecha.
export const VERSION = "1.0";
export const FECHA_ACTUALIZACION = "13 de noviembre de 2026";

// Rutas (tienen que coincidir con el AppRouter, el Footer, Contact y RegisterMinimal)
export const RUTA_PRIVACIDAD = "/policy-privacy";
export const RUTA_TERMINOS = "/policy-terms";
export const RUTA_COOKIES = "/policy-cookies";
export const RUTA_PROCESO = "/proceso";
export const RUTA_CONTACTO = "/contact";

// TODO (Angus): datos del titular (persona humana o sociedad que factura).
export const TITULAR = {
  nombre: "PENDIENTE: nombre y apellido o razón social",
  cuit: "PENDIENTE: CUIT",
  condicionFiscal: "PENDIENTE: monotributo / responsable inscripto",
  domicilio: "PENDIENTE: domicilio legal",
  email: "hola@umbral.studio", // TODO (Angus): mismo mail que el Footer
  telefono: "+54 9 11 7118 7463",
};

export const MARCA = {
  nombreComercial: "Umbral",
  web: "umbral.studio", // TODO (Angus): dominio real
  zona: "Ciudad de Buenos Aires y Gran Buenos Aires", // TODO (Angus): zona de cobertura
};

// TODO (Angus): número de inscripción en el Registro Nacional de Bases de Datos (AAIP).
export const REGISTRO_BASE_DATOS = "PENDIENTE: nº de inscripción en el Registro Nacional de Bases de Datos";

// TODO (Angus): condiciones comerciales. Ajustalas a lo que realmente cobrás.
export const SERVICIO = {
  validezPresupuestoDias: 15,
  senaPorcentaje: 50,
  entregaDiasHabiles: 5,
  reprogramacionHoras: 48,
  alojamientoMeses: 12,
  conservacionOriginalesDias: 90,
};

// Plazos de conservación de datos
export const CONSERVACION = {
  consultasMeses: 12,
};