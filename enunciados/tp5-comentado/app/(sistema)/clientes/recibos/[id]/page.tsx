// ============================================================================
// ARCHIVO COMENTADO LÍNEA POR LÍNEA PARA ESTUDIO Y DEFENSA DEL SEGUNDO PARCIAL
// ============================================================================
// Pantalla de RECIBO DE PAGO (/clientes/recibos/[id]). RF-C5.
// Comprobante numerado e imprimible de un pago registrado en cuenta corriente.
// [Línea 3] Importa elementos desde 'next/link'.
import Link from "next/link";
// [Línea 4] Importa elementos desde 'lucide-react'.
import { ArrowLeft, Store } from "lucide-react";
// [Línea 5] Importa elementos desde '@/lib/sesion'.
import { exigirUsuarioPagina } from "@/lib/sesion";
// [Línea 6] Importa elementos desde '@/servicios/pagos'.
import { obtenerPago } from "@/servicios/pagos";
// [Línea 7] Inicia un bloque de importación de dependencias.
import {
  // [Línea 8] Importa 'formatearDocumento' desde el módulo.
  formatearDocumento,
  // [Línea 9] Importa 'formatearFechaHora' desde el módulo.
  formatearFechaHora,
  // [Línea 10] Importa 'formatearMoneda' desde el módulo.
  formatearMoneda,
  // [Línea 11] Importa 'NOMBRES_MEDIO_PAGO' desde el módulo.
  NOMBRES_MEDIO_PAGO,
// [Línea 12] Cierra la lista de importaciones provenientes del módulo '@/lib/formato'.
} from "@/lib/formato";
// [Línea 13] Importa elementos desde '@/componentes/ui/button'.
import { Button } from "@/componentes/ui/button";
// [Línea 14] Importa elementos desde '@/componentes/ui/card'.
import { Card } from "@/componentes/ui/card";
// [Línea 15] Importa elementos desde '@/componentes/ui/select'.
import { Separator } from "@/componentes/ui/select";
// [Línea 16] Importa elementos desde '@/componentes/comunes/encabezado-pagina'.
import { EncabezadoPagina } from "@/componentes/comunes/encabezado-pagina";
// [Línea 17] Importa elementos desde '@/componentes/comunes/boton-imprimir'.
import { BotonImprimir } from "@/componentes/comunes/boton-imprimir";
// [Línea 18] Importa elementos desde '@/componentes/comunes/insignias'.
import { InsigniaMedioPago } from "@/componentes/comunes/insignias";
// [Línea 19] Importa elementos desde '@/componentes/primitivas/maquetacion'.
import { Alinear, Apilar, Caja, Grilla, Pagina, Texto, Titulo } from "@/componentes/primitivas/maquetacion";

// [Línea 21] Define el tipo de datos 'Props' en TypeScript.
type Props = { params: Promise<{ id: string }> };

// [Línea 23] Server Component principal 'PaginaReciboPago': se ejecuta en el servidor, consulta los servicios y devuelve el HTML.
export default async function PaginaReciboPago({ params }: Props) {
  // [Línea 24] Espera el resultado de la consulta/operación asíncrona y lo asigna a 'usuario'.
  const usuario = await exigirUsuarioPagina();
  // [Línea 25] Espera el resultado de la consulta/operación asíncrona y lo asigna a '{ id }'.
  const { id } = await params;
  // [Línea 26] Espera el resultado de la consulta/operación asíncrona y lo asigna a 'recibo'.
  const recibo = await obtenerPago(usuario, Number(id));

  // [Línea 28] Devuelve la interfaz JSX que renderiza este componente.
  return (
    <Pagina> // [Línea 29] Abre o renderiza el componente visual <Pagina>.
      <EncabezadoPagina // [Línea 30] Abre o renderiza el componente visual <EncabezadoPagina>.
        // [Línea 31] Ejecuta o evalúa: titulo={`Recibo ${recibo.numeroRecibo}`}
        titulo={`Recibo ${recibo.numeroRecibo}`}
        // [Línea 32] Ejecuta o evalúa: subtitulo={`Registrado el ${formatearFechaHora(recibo.fecha)} por ${recibo.usuar
        subtitulo={`Registrado el ${formatearFechaHora(recibo.fecha)} por ${recibo.usuario.nombre}`}
        // [Línea 33] Ejecuta o evalúa: acciones={
        acciones={
          <Alinear className="gap-2"> // [Línea 34] Abre o renderiza el componente visual <Alinear>.
            <Link href={`/clientes/${recibo.cliente.id}?vista=cuenta`}> // [Línea 35] Abre o renderiza el componente visual <Link>.
              <Button variant="outline"> // [Línea 36] Abre o renderiza el componente visual <Button>.
                <ArrowLeft className="size-4" /> // [Línea 37] Abre o renderiza el componente visual <ArrowLeft>.
                // [Línea 38] Ejecuta o evalúa: Volver a la cuenta del cliente
                Volver a la cuenta del cliente
              </Button> // [Línea 39] Cierra el componente visual </Button>.
            </Link> // [Línea 40] Cierra el componente visual </Link>.
            <BotonImprimir texto="Imprimir recibo" /> // [Línea 41] Abre o renderiza el componente visual <BotonImprimir>.
          </Alinear> // [Línea 42] Cierra el componente visual </Alinear>.
        // [Línea 43] Cierra el bloque o estructura (}).
        }
      // [Línea 44] Ejecuta o evalúa: />
      />

      <Card className="p-6 md:p-8 max-w-3xl"> // [Línea 46] Abre o renderiza el componente visual <Card>.
        <Alinear className="justify-between items-start gap-4"> // [Línea 47] Abre o renderiza el componente visual <Alinear>.
          <Alinear className="gap-3"> // [Línea 48] Abre o renderiza el componente visual <Alinear>.
            <Caja className="flex size-11 items-center justify-center rounded-xl bg-primary text-primary-foreground"> // [Línea 49] Abre o renderiza el componente visual <Caja>.
              <Store className="size-6" /> // [Línea 50] Abre o renderiza el componente visual <Store>.
            </Caja> // [Línea 51] Cierra el componente visual </Caja>.
            <Apilar className="gap-0.5"> // [Línea 52] Abre o renderiza el componente visual <Apilar>.
              <Titulo nivel={2}>Ferretería El Yunque</Titulo> // [Línea 53] Abre o renderiza el componente visual <Titulo>.
              <Texto tamano="xs" tono="suave"> // [Línea 54] Abre o renderiza el componente visual <Texto>.
                // [Línea 55] Ejecuta o evalúa: Av. Belgrano 1850 · San Miguel de Tucumán
                Av. Belgrano 1850 · San Miguel de Tucumán
              </Texto> // [Línea 56] Cierra el componente visual </Texto>.
              <Texto tamano="xs" tono="suave"> // [Línea 57] Abre o renderiza el componente visual <Texto>.
                // [Línea 58] Ejecuta o evalúa: Recibo de pago en cuenta corriente
                Recibo de pago en cuenta corriente
              </Texto> // [Línea 59] Cierra el componente visual </Texto>.
            </Apilar> // [Línea 60] Cierra el componente visual </Apilar>.
          </Alinear> // [Línea 61] Cierra el componente visual </Alinear>.

          <Apilar className="items-end gap-1"> // [Línea 63] Abre o renderiza el componente visual <Apilar>.
            <Texto mono negrita tamano="lg"> // [Línea 64] Abre o renderiza el componente visual <Texto>.
              // [Línea 65] Ejecuta o evalúa: {recibo.numeroRecibo}
              {recibo.numeroRecibo}
            </Texto> // [Línea 66] Cierra el componente visual </Texto>.
            <Texto tamano="xs" tono="suave"> // [Línea 67] Abre o renderiza el componente visual <Texto>.
              // [Línea 68] Define o asigna el campo/parámetro 'Fecha'.
              Fecha: {formatearFechaHora(recibo.fecha)}
            </Texto> // [Línea 69] Cierra el componente visual </Texto>.
            <Texto tamano="xs" tono="suave"> // [Línea 70] Abre o renderiza el componente visual <Texto>.
              // [Línea 71] Ejecuta o evalúa: Cobró: {recibo.usuario.nombre}
              Cobró: {recibo.usuario.nombre}
            </Texto> // [Línea 72] Cierra el componente visual </Texto>.
          </Apilar> // [Línea 73] Cierra el componente visual </Apilar>.
        </Alinear> // [Línea 74] Cierra el componente visual </Alinear>.

        <Separator /> // [Línea 76] Abre o renderiza el componente visual <Separator>.

        <Grilla className="grid-cols-1 sm:grid-cols-2"> // [Línea 78] Abre o renderiza el componente visual <Grilla>.
          <Apilar className="gap-1"> // [Línea 79] Abre o renderiza el componente visual <Apilar>.
            <Texto tamano="xs" tono="suave" negrita> // [Línea 80] Abre o renderiza el componente visual <Texto>.
              // [Línea 81] Ejecuta o evalúa: RECIBIMOS DE
              RECIBIMOS DE
            </Texto> // [Línea 82] Cierra el componente visual </Texto>.
            <Texto negrita>{recibo.cliente.nombre}</Texto> // [Línea 83] Abre o renderiza el componente visual <Texto>.
            <Texto tamano="xs" tono="suave"> // [Línea 84] Abre o renderiza el componente visual <Texto>.
              // [Línea 85] Ejecuta o evalúa: {recibo.cliente.tipoDoc}:{" "}
              {recibo.cliente.tipoDoc}:{" "}
              // [Línea 86] Ejecuta o evalúa: {formatearDocumento(recibo.cliente.tipoDoc, recibo.cliente.nroDoc)}
              {formatearDocumento(recibo.cliente.tipoDoc, recibo.cliente.nroDoc)}
            </Texto> // [Línea 87] Cierra el componente visual </Texto>.
            // [Línea 88] Ejecuta o evalúa: {recibo.cliente.domicilio && (
            {recibo.cliente.domicilio && (
              <Texto tamano="xs" tono="suave"> // [Línea 89] Abre o renderiza el componente visual <Texto>.
                // [Línea 90] Define o asigna el campo/parámetro 'Domicilio'.
                Domicilio: {recibo.cliente.domicilio}
              </Texto> // [Línea 91] Cierra el componente visual </Texto>.
            // [Línea 92] Ejecuta o evalúa: )}
            )}
          </Apilar> // [Línea 93] Cierra el componente visual </Apilar>.

          <Apilar className="gap-1"> // [Línea 95] Abre o renderiza el componente visual <Apilar>.
            <Texto tamano="xs" tono="suave" negrita> // [Línea 96] Abre o renderiza el componente visual <Texto>.
              // [Línea 97] Ejecuta o evalúa: MEDIO DE PAGO
              MEDIO DE PAGO
            </Texto> // [Línea 98] Cierra el componente visual </Texto>.
            <Alinear className="gap-2"> // [Línea 99] Abre o renderiza el componente visual <Alinear>.
              <InsigniaMedioPago medio={recibo.medio} /> // [Línea 100] Abre o renderiza el componente visual <InsigniaMedioPago>.
              <Texto tamano="sm">{NOMBRES_MEDIO_PAGO[recibo.medio]}</Texto> // [Línea 101] Abre o renderiza el componente visual <Texto>.
            </Alinear> // [Línea 102] Cierra el componente visual </Alinear>.
            // [Línea 103] Ejecuta o evalúa: {recibo.observacion && (
            {recibo.observacion && (
              <Texto tamano="xs" tono="suave"> // [Línea 104] Abre o renderiza el componente visual <Texto>.
                // [Línea 105] Ejecuta o evalúa: Observación: {recibo.observacion}
                Observación: {recibo.observacion}
              </Texto> // [Línea 106] Cierra el componente visual </Texto>.
            // [Línea 107] Ejecuta o evalúa: )}
            )}
          </Apilar> // [Línea 108] Cierra el componente visual </Apilar>.
        </Grilla> // [Línea 109] Cierra el componente visual </Grilla>.

        <Separator /> // [Línea 111] Abre o renderiza el componente visual <Separator>.

        <Alinear className="justify-between rounded-xl bg-emerald-50/80 border border-emerald-200 p-4"> // [Línea 113] Abre o renderiza el componente visual <Alinear>.
          <Apilar className="gap-0.5"> // [Línea 114] Abre o renderiza el componente visual <Apilar>.
            <Texto negrita>IMPORTE ABONADO A CUENTA CORRIENTE</Texto> // [Línea 115] Abre o renderiza el componente visual <Texto>.
            <Texto tamano="xs" tono="suave"> // [Línea 116] Abre o renderiza el componente visual <Texto>.
              // [Línea 117] Ejecuta o evalúa: Saldo restante del cliente tras este pago: {formatearMoneda(recibo.saldoCliente)
              Saldo restante del cliente tras este pago: {formatearMoneda(recibo.saldoCliente)}
            </Texto> // [Línea 118] Cierra el componente visual </Texto>.
          </Apilar> // [Línea 119] Cierra el componente visual </Apilar>.
          <Texto mono negrita tamano="2xl" tono="exito"> // [Línea 120] Abre o renderiza el componente visual <Texto>.
            // [Línea 121] Ejecuta o evalúa: {formatearMoneda(recibo.importe)}
            {formatearMoneda(recibo.importe)}
          </Texto> // [Línea 122] Cierra el componente visual </Texto>.
        </Alinear> // [Línea 123] Cierra el componente visual </Alinear>.
      </Card> // [Línea 124] Cierra el componente visual </Card>.
    </Pagina> // [Línea 125] Cierra el componente visual </Pagina>.
  // [Línea 126] Cierra el bloque o estructura ();).
  );
// [Línea 127] Cierra el bloque o estructura (}).
}
