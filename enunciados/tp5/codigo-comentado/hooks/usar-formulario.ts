// ============================================================================
// GUÍA DE ESTUDIO - SEGUNDO PARCIAL: PROGRAMACIÓN IV
// Archivo: hooks/usar-formulario.ts
// Código comentado con explicaciones sencillas y claras para la defensa oral.
// ============================================================================

// Directiva 'use client': indica que este componente tiene interactividad en el navegador
"use client";
// Hook común para resolver todos los formularios (sección 10.6):
// 1. Valida primero en el cliente con el mismo esquema de Zod del servidor.
// 2. Si pasa, ejecuta la acción o llamada al servidor.
// 3. Si el servidor devuelve errores por campo ("details"), los ubica junto a cada campo.
// 4. Muestra un aviso (toast) con el resultado.
import { useState } from "react";
import { toast } from "sonner";
// Acá importamos Zod para crear esquemas de validación de datos en formularios y APIs
import type { z } from "zod";
// Acá importamos los adaptadores conSesionApi y manejo estándar de errores HTTP
import type { ResultadoAccion } from "@/lib/adaptadores";

export type ErroresPorCampo = Record<string, string>;

// Componente o función exportada 'usarFormulario'
export function usarFormulario<TEntrada, TSalida>({
  esquema,
  accion,
  mensajeExito,
  alTerminar,
}: {
  esquema: z.ZodType<TEntrada>;
  accion: (datosValidados: TEntrada) => Promise<ResultadoAccion<TSalida>>;
  mensajeExito?: string;
  alTerminar?: (resultado: TSalida) => void;
}) {
  // Definimos una variable de estado React 'errores' para controlar la interfaz
  const [errores, setErrores] = useState<ErroresPorCampo>({});
  // Definimos una variable de estado React 'errorGeneral' para controlar la interfaz
  const [errorGeneral, setErrorGeneral] = useState<string | null>(null);
  // Definimos una variable de estado React 'enviando' para controlar la interfaz
  const [enviando, setEnviando] = useState(false);

  function limpiarErrores() {
    setErrores({});
    setErrorGeneral(null);
  }

  async function enviar(datosCrudos: unknown): Promise<TSalida | null> {
    limpiarErrores();

    // 1. Validación en el cliente con el esquema compartido de Zod.
    const validacion = esquema.safeParse(datosCrudos);
    if (!validacion.success) {
      const mapaErrores: ErroresPorCampo = {};
      for (const issue of validacion.error.issues) {
        const nombreCampo = issue.path.join(".") || "general";
        if (!mapaErrores[nombreCampo]) mapaErrores[nombreCampo] = issue.message;
      }
      setErrores(mapaErrores);
      return null;
    }

    // 2. Envío al servidor.
    setEnviando(true);
    // Usamos un bloque try/catch para capturar cualquier error y evitar que la aplicación falle
    try {
      const respuesta = await accion(validacion.data);
      if (!respuesta.ok) {
        const mapaServidor: ErroresPorCampo = {};
        if (respuesta.error.details) {
          for (const d of respuesta.error.details) {
            if (typeof d.campo === "string" && typeof d.mensaje === "string") {
              mapaServidor[d.campo] = d.mensaje;
            }
          }
        }
        setErrores(mapaServidor);
        setErrorGeneral(respuesta.error.message);
        toast.error(respuesta.error.message);
        return null;
      }

      if (mensajeExito) toast.success(mensajeExito);
      alTerminar?.(respuesta.data);
      return respuesta.data;
    } finally {
      setEnviando(false);
    }
  }

  return {
    errores,
    errorGeneral,
    enviando,
    enviar,
    limpiarErrores,
    setErrores,
    setErrorGeneral,
  };
}
