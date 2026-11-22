// ============================================================================
// GUÍA DE ESTUDIO - SEGUNDO PARCIAL: PROGRAMACIÓN IV
// Archivo: app/(sistema)/clientes/recibos/[id]/page.tsx
// Código comentado con explicaciones sencillas y claras para la defensa oral.
// ============================================================================

// Pantalla de RECIBO DE PAGO (/clientes/recibos/[id]). RF-C5.
// Comprobante numerado e imprimible de un pago registrado en cuenta corriente.
import Link from "next/link";
import { ArrowLeft, Store } from "lucide-react";
// Acá importamos las funciones para leer y validar la sesión del usuario conectado
import { exigirUsuarioPagina } from "@/lib/sesion";
// Acá importamos funciones de la capa de servicios donde reside la lógica de negocio
import { obtenerPago } from "@/servicios/pagos";
import {
  formatearDocumento,
  formatearFechaHora,
  formatearMoneda,
  NOMBRES_MEDIO_PAGO,
} from "@/lib/formato";
// Acá importamos componentes visuales de la interfaz de usuario
import { Button } from "@/componentes/ui/button";
// Acá importamos componentes visuales de la interfaz de usuario
import { Card } from "@/componentes/ui/card";
// Acá importamos componentes visuales de la interfaz de usuario
import { Separator } from "@/componentes/ui/select";
// Acá importamos componentes visuales de la interfaz de usuario
import { EncabezadoPagina } from "@/componentes/comunes/encabezado-pagina";
// Acá importamos componentes visuales de la interfaz de usuario
import { BotonImprimir } from "@/componentes/comunes/boton-imprimir";
// Acá importamos componentes visuales de la interfaz de usuario
import { InsigniaMedioPago } from "@/componentes/comunes/insignias";
// Acá importamos componentes visuales de la interfaz de usuario
import { Alinear, Apilar, Caja, Grilla, Pagina, Texto, Titulo } from "@/componentes/primitivas/maquetacion";

type Props = { params: Promise<{ id: string }> };

// Componente principal de página 'PaginaReciboPago' (Server Component: se ejecuta en el servidor)
export default async function PaginaReciboPago({ params }: Props) {
  const usuario = await exigirUsuarioPagina();
  const { id } = await params;
  const recibo = await obtenerPago(usuario, Number(id));

  // Renderizamos la interfaz visual de este componente:
  return (
    <Pagina>
      <EncabezadoPagina
        titulo={`Recibo ${recibo.numeroRecibo}`}
        subtitulo={`Registrado el ${formatearFechaHora(recibo.fecha)} por ${recibo.usuario.nombre}`}
        acciones={
          <Alinear className="gap-2">
            <Link href={`/clientes/${recibo.cliente.id}?vista=cuenta`}>
              <Button variant="outline">
                <ArrowLeft className="size-4" />
                Volver a la cuenta del cliente
              </Button>
            </Link>
            <BotonImprimir texto="Imprimir recibo" />
          </Alinear>
        }
      />

      <Card className="p-6 md:p-8 max-w-3xl">
        <Alinear className="justify-between items-start gap-4">
          <Alinear className="gap-3">
            <Caja className="flex size-11 items-center justify-center rounded-xl bg-primary text-primary-foreground">
              <Store className="size-6" />
            </Caja>
            <Apilar className="gap-0.5">
              <Titulo nivel={2}>Ferretería El Yunque</Titulo>
              <Texto tamano="xs" tono="suave">
                Av. Belgrano 1850 · San Miguel de Tucumán
              </Texto>
              <Texto tamano="xs" tono="suave">
                Recibo de pago en cuenta corriente
              </Texto>
            </Apilar>
          </Alinear>

          <Apilar className="items-end gap-1">
            <Texto mono negrita tamano="lg">
              {recibo.numeroRecibo}
            </Texto>
            <Texto tamano="xs" tono="suave">
              Fecha: {formatearFechaHora(recibo.fecha)}
            </Texto>
            <Texto tamano="xs" tono="suave">
              Cobró: {recibo.usuario.nombre}
            </Texto>
          </Apilar>
        </Alinear>

        <Separator />

        <Grilla className="grid-cols-1 sm:grid-cols-2">
          <Apilar className="gap-1">
            <Texto tamano="xs" tono="suave" negrita>
              RECIBIMOS DE
            </Texto>
            <Texto negrita>{recibo.cliente.nombre}</Texto>
            <Texto tamano="xs" tono="suave">
              {recibo.cliente.tipoDoc}:{" "}
              {formatearDocumento(recibo.cliente.tipoDoc, recibo.cliente.nroDoc)}
            </Texto>
            {recibo.cliente.domicilio && (
              <Texto tamano="xs" tono="suave">
                Domicilio: {recibo.cliente.domicilio}
              </Texto>
            )}
          </Apilar>

          <Apilar className="gap-1">
            <Texto tamano="xs" tono="suave" negrita>
              MEDIO DE PAGO
            </Texto>
            <Alinear className="gap-2">
              <InsigniaMedioPago medio={recibo.medio} />
              <Texto tamano="sm">{NOMBRES_MEDIO_PAGO[recibo.medio]}</Texto>
            </Alinear>
            {recibo.observacion && (
              <Texto tamano="xs" tono="suave">
                Observación: {recibo.observacion}
              </Texto>
            )}
          </Apilar>
        </Grilla>

        <Separator />

        <Alinear className="justify-between rounded-xl bg-emerald-50/80 border border-emerald-200 p-4">
          <Apilar className="gap-0.5">
            <Texto negrita>IMPORTE ABONADO A CUENTA CORRIENTE</Texto>
            <Texto tamano="xs" tono="suave">
              Saldo restante del cliente tras este pago: {formatearMoneda(recibo.saldoCliente)}
            </Texto>
          </Apilar>
          <Texto mono negrita tamano="2xl" tono="exito">
            {formatearMoneda(recibo.importe)}
          </Texto>
        </Alinear>
      </Card>
    </Pagina>
  );
}
