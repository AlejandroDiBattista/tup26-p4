/* ==========================================================================
   HOOK PERSONALIZADO PARA FORMULARIOS REACT (HOOKS/USAR-FORMULARIO.TS)
   Este hook encapsula toda la complejidad de los formularios en una sola función:
   1. Validación previa en el navegador con el mismo esquema Zod que usa el servidor.
   2. Control automático del estado de carga (enviando = true/false para deshabilitar botones).
   3. Mapeo de errores por campo: si el servidor rechaza un campo (ej: "DNI duplicado"),
      el mensaje se coloca automáticamente debajo del input correspondiente.
   4. Feedback visual inmediato con alertas flotantes (toast de sonner).
   5. Ejecución de callback al finalizar (alTerminar) para cerrar modales o limpiar pantallas.
   ========================================================================== */

/* "use client" le indica a Next.js que este archivo contiene código interactivo para el cliente */
"use client";

/* importamos useState de React para manejar los estados locales del formulario */
import { useState } from "react";

/* importamos la utilidad de alertas flotantes toast */
import { toast } from "sonner";

/* importamos el tipo ZodType para tipar el validador */
import type { z } from "zod";

/* importamos el tipo ResultadoAccion que describe las respuestas de Server Actions */
import type { ResultadoAccion } from "@/lib/adaptadores";

/* tipo de datos que asocia el nombre de un campo con su mensaje de error (ej: { nroDoc: "Ya existe" }) */
export type ErroresPorCampo = Record<string, string>;

/* ==========================================================================
   HOOK: usarFormulario
   Parámetros:
   - esquema: el esquema Zod utilizado para validar los datos
   - accion: la función o Server Action que envía los datos al backend
   - mensajeExito: texto opcional para mostrar en el cartel verde de éxito
   - alTerminar: función de retorno que se dispara cuando la operación concluye con éxito
   ========================================================================== */
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
  /* estado que guarda el diccionario de errores específicos por campo */
  const [errores, setErrores] = useState<ErroresPorCampo>({});

  /* estado para un error global que no pertenezca a ningún campo particular */
  const [errorGeneral, setErrorGeneral] = useState<string | null>(null);

  /* estado booleano que indica si la petición está viajando al servidor */
  const [enviando, setEnviando] = useState(false);

  /* función para resetear y limpiar todos los mensajes de error */
  function limpiarErrores() {
    setErrores({});
    setErrorGeneral(null);
  }

  /* ==========================================================================
     FUNCIÓN: enviar
     Se ejecuta al hacer submit en el formulario.
     ========================================================================== */
  async function enviar(datosCrudos: unknown): Promise<TSalida | null> {
    /* 1. Limpiamos errores previos antes de empezar */
    limpiarErrores();

    /* 2. Validación local en el cliente con Zod:
          si los datos no son válidos, evitamos enviar la petición HTTP por la red ahorrando ancho de banda */
    const validacion = esquema.safeParse(datosCrudos);
    if (!validacion.success) {
      const mapaErrores: ErroresPorCampo = {};
      /* recorremos cada problema detectado por Zod y lo guardamos asociado a su campo */
      for (const issue of validacion.error.issues) {
        const nombreCampo = issue.path.join(".") || "general";
        if (!mapaErrores[nombreCampo]) mapaErrores[nombreCampo] = issue.message;
      }
      setErrores(mapaErrores);
      return null;
    }

    /* 3. Activamos el indicador de carga */
    setEnviando(true);
    try {
      /* llamamos a la acción del backend pasándole los datos ya validados */
      const respuesta = await accion(validacion.data);

      /* si el backend devolvió un error (ok: false) */
      if (!respuesta.ok) {
        const mapaServidor: ErroresPorCampo = {};
        /* si vinieron detalles por campo, los vinculamos al formulario */
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

      /* si la operación fue exitosa, mostramos el cartel verde y ejecutamos el callback final */
      if (mensajeExito) toast.success(mensajeExito);
      alTerminar?.(respuesta.data);
      return respuesta.data;
    } finally {
      /* desactivamos el indicador de carga */
      setEnviando(false);
    }
  }

  /* devolvemos los estados y funciones para que el componente React los consuma */
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
