// ============================================================================
// ARCHIVO COMENTADO LÍNEA POR LÍNEA PARA ESTUDIO Y DEFENSA DEL SEGUNDO PARCIAL
// ============================================================================
// [Línea 1] Directiva de Next.js: marca este archivo como Client Component (se ejecuta en el navegador con estado e interactividad).
"use client";
// Hook común para resolver todos los formularios (sección 10.6):
// 1. Valida primero en el cliente con el mismo esquema de Zod del servidor.
// 2. Si pasa, ejecuta la acción o llamada al servidor.
// 3. Si el servidor devuelve errores por campo ("details"), los ubica junto a cada campo.
// 4. Muestra un aviso (toast) con el resultado.
// [Línea 7] Importa elementos desde 'react'.
import { useState } from "react";
// [Línea 8] Importa elementos desde 'sonner'.
import { toast } from "sonner";
// [Línea 9] Importa tipos de TypeScript (solo para chequeo al compilar): import type { z } from "zod";
import type { z } from "zod";
// [Línea 10] Importa tipos de TypeScript (solo para chequeo al compilar): import type { ResultadoAccion } from "@/lib/adaptadores";
import type { ResultadoAccion } from "@/lib/adaptadores";

// [Línea 12] Define el tipo de datos 'ErroresPorCampo' en TypeScript.
export type ErroresPorCampo = Record<string, string>;

// [Línea 14] Declara la función o componente 'usarFormulario'.
export function usarFormulario<TEntrada, TSalida>({
  // [Línea 15] Ejecuta o evalúa: esquema,
  esquema,
  // [Línea 16] Ejecuta o evalúa: accion,
  accion,
  // [Línea 17] Ejecuta o evalúa: mensajeExito,
  mensajeExito,
  // [Línea 18] Ejecuta o evalúa: alTerminar,
  alTerminar,
// [Línea 19] Ejecuta o evalúa: }: {
}: {
  // [Línea 20] Define o asigna el campo/parámetro 'esquema'.
  esquema: z.ZodType<TEntrada>;
  // [Línea 21] Define o asigna el campo/parámetro 'accion'.
  accion: (datosValidados: TEntrada) => Promise<ResultadoAccion<TSalida>>;
  // [Línea 22] Ejecuta o evalúa: mensajeExito?: string;
  mensajeExito?: string;
  // [Línea 23] Ejecuta o evalúa: alTerminar?: (resultado: TSalida) => void;
  alTerminar?: (resultado: TSalida) => void;
// [Línea 24] Ejecuta o evalúa: }) {
}) {
  // [Línea 25] Estado reactivo de React [errores, setErrores]: guarda el valor actual y la función para actualizarlo.
  const [errores, setErrores] = useState<ErroresPorCampo>({});
  // [Línea 26] Estado reactivo de React [errorGeneral, setErrorGeneral]: guarda el valor actual y la función para actualizarlo.
  const [errorGeneral, setErrorGeneral] = useState<string | null>(null);
  // [Línea 27] Estado reactivo de React [enviando, setEnviando]: guarda el valor actual y la función para actualizarlo.
  const [enviando, setEnviando] = useState(false);

  // [Línea 29] Declara la función o componente 'limpiarErrores'.
  function limpiarErrores() {
    // [Línea 30] Ejecuta o evalúa: setErrores({});
    setErrores({});
    // [Línea 31] Ejecuta o evalúa: setErrorGeneral(null);
    setErrorGeneral(null);
  // [Línea 32] Cierra el bloque o estructura (}).
  }

  // [Línea 34] Declara la función asíncrona 'enviar'.
  async function enviar(datosCrudos: unknown): Promise<TSalida | null> {
    // [Línea 35] Ejecuta o evalúa: limpiarErrores();
    limpiarErrores();

    // 1. Validación en el cliente con el esquema compartido de Zod.
    // [Línea 38] Declara 'validacion' y le asigna el valor resultante.
    const validacion = esquema.safeParse(datosCrudos);
    // [Línea 39] Verifica la condición: if (!validacion.success) {
    if (!validacion.success) {
      // [Línea 40] Declara 'mapaErrores: ErroresPorCampo' y le asigna el valor resultante.
      const mapaErrores: ErroresPorCampo = {};
      // [Línea 41] Recorre cada elemento en un bucle: for (const issue of validacion.error.issues) {
      for (const issue of validacion.error.issues) {
        // [Línea 42] Declara 'nombreCampo' y le asigna el valor resultante.
        const nombreCampo = issue.path.join(".") || "general";
        // [Línea 43] Verifica la condición: if (!mapaErrores[nombreCampo]) mapaErrores[nombreCampo] = issue.message;
        if (!mapaErrores[nombreCampo]) mapaErrores[nombreCampo] = issue.message;
      // [Línea 44] Cierra el bloque o estructura (}).
      }
      // [Línea 45] Ejecuta o evalúa: setErrores(mapaErrores);
      setErrores(mapaErrores);
      // [Línea 46] Devuelve el valor: null;
      return null;
    // [Línea 47] Cierra el bloque o estructura (}).
    }

    // 2. Envío al servidor.
    // [Línea 50] Ejecuta o evalúa: setEnviando(true);
    setEnviando(true);
    // [Línea 51] Inicia bloque try para capturar errores durante la operación.
    try {
      // [Línea 52] Espera el resultado de la consulta/operación asíncrona y lo asigna a 'respuesta'.
      const respuesta = await accion(validacion.data);
      // [Línea 53] Verifica la condición: if (!respuesta.ok) {
      if (!respuesta.ok) {
        // [Línea 54] Declara 'mapaServidor: ErroresPorCampo' y le asigna el valor resultante.
        const mapaServidor: ErroresPorCampo = {};
        // [Línea 55] Verifica la condición: if (respuesta.error.details) {
        if (respuesta.error.details) {
          // [Línea 56] Recorre cada elemento en un bucle: for (const d of respuesta.error.details) {
          for (const d of respuesta.error.details) {
            // [Línea 57] Verifica la condición: if (typeof d.campo === "string" && typeof d.mensaje === "string") {
            if (typeof d.campo === "string" && typeof d.mensaje === "string") {
              // [Línea 58] Ejecuta o evalúa: mapaServidor[d.campo] = d.mensaje;
              mapaServidor[d.campo] = d.mensaje;
            // [Línea 59] Cierra el bloque o estructura (}).
            }
          // [Línea 60] Cierra el bloque o estructura (}).
          }
        // [Línea 61] Cierra el bloque o estructura (}).
        }
        // [Línea 62] Ejecuta o evalúa: setErrores(mapaServidor);
        setErrores(mapaServidor);
        // [Línea 63] Ejecuta o evalúa: setErrorGeneral(respuesta.error.message);
        setErrorGeneral(respuesta.error.message);
        // [Línea 64] Muestra un aviso emergente en pantalla: toast.error(respuesta.error.message);
        toast.error(respuesta.error.message);
        // [Línea 65] Devuelve el valor: null;
        return null;
      // [Línea 66] Cierra el bloque o estructura (}).
      }

      // [Línea 68] Verifica la condición: if (mensajeExito) toast.success(mensajeExito);
      if (mensajeExito) toast.success(mensajeExito);
      // [Línea 69] Ejecuta o evalúa: alTerminar?.(respuesta.data);
      alTerminar?.(respuesta.data);
      // [Línea 70] Devuelve el valor: respuesta.data;
      return respuesta.data;
    // [Línea 71] Bloque finally: se ejecuta siempre al terminar el try/catch.
    } finally {
      // [Línea 72] Ejecuta o evalúa: setEnviando(false);
      setEnviando(false);
    // [Línea 73] Cierra el bloque o estructura (}).
    }
  // [Línea 74] Cierra el bloque o estructura (}).
  }

  // [Línea 76] Devuelve el valor: {
  return {
    // [Línea 77] Ejecuta o evalúa: errores,
    errores,
    // [Línea 78] Ejecuta o evalúa: errorGeneral,
    errorGeneral,
    // [Línea 79] Ejecuta o evalúa: enviando,
    enviando,
    // [Línea 80] Ejecuta o evalúa: enviar,
    enviar,
    // [Línea 81] Ejecuta o evalúa: limpiarErrores,
    limpiarErrores,
    // [Línea 82] Ejecuta o evalúa: setErrores,
    setErrores,
    // [Línea 83] Ejecuta o evalúa: setErrorGeneral,
    setErrorGeneral,
  // [Línea 84] Cierra el bloque o estructura (};).
  };
// [Línea 85] Cierra el bloque o estructura (}).
}
