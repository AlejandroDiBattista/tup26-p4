/* ==========================================================================
   PANTALLA DE DETALLE DE COMPROBANTE DE FACTURA (/ventas/[id])
   En esta pantalla mostramos toda la información detallada de una venta emitida.
   Cumple con los requerimientos RF-V7 (consulta e impresión de comprobante) y 
   RF-V9 (anulación de comprobante por parte de un usuario administrador).
   Es un Server Component de Next.js que se ejecuta en el servidor.
   ========================================================================== */

/* los import son declaraciones que traen codigos externos, como librerías de Next.js, iconos visuales, 
   funciones de sesión y formato, componentes visuales de UI y servicios de base de datos para armar la página */
import Link from "next/link";
import { notFound } from "next/navigation";
import { ArrowLeft, Ban, Store } from "lucide-react";
import { exigirUsuarioPagina } from "@/lib/sesion";
import { obtenerFactura } from "@/servicios/facturas";
import { ApiError } from "@/servicios/errores";
import { formatearFechaHora, formatearMoneda, NOMBRES_FORMA_PAGO } from "@/lib/formato";
import { Button } from "@/componentes/ui/button";
import { Card } from "@/componentes/ui/card";
import { Separator } from "@/componentes/ui/select";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/componentes/ui/table";
import { EncabezadoPagina } from "@/componentes/comunes/encabezado-pagina";
import { InsigniaEstadoFactura } from "@/componentes/comunes/insignias";
import { BotonImprimir } from "@/componentes/comunes/boton-imprimir";
import { BotonAnularFactura } from "@/componentes/dominio/modal-anular-factura";
import { Alinear, Apilar, Caja, Grilla, Pagina, Texto, Titulo } from "@/componentes/primitivas/maquetacion";

/* definimos el tipo de datos Props para esta pantalla.
   en las rutas dinamicas de Next.js como [id], la carpeta entre corchetes indica un parametro de url.
   en las ultimas versiones de Next.js, 'params' es una promesa que al resolverse entrega el objeto con el id capturado en formato string */
type Props = { params: Promise<{ id: string }> };

/* export permite que Next.js cargue esta función como la página principal de la ruta /ventas/[id].
   default indica que es la exportación por defecto de este archivo.
   async nos permite pausar la ejecución con await mientras esperamos la base de datos o la sesión sin bloquear la aplicación */
export default async function PaginaDetalleFactura({ params }: Props) {
  /* atrapamos el usuario que inició sesión. Si no hay sesión válida o activa, esta función redirige al login automáticamente */
  const usuario = await exigirUsuarioPagina();

  /* esperamos a que se resuelva la promesa de params para extraer el 'id' de la factura que viene en la url del navegador */
  const { id } = await params;

  let factura;
  try {
    factura = await obtenerFactura(usuario, Number(id));
  } catch (error) {
    if (error instanceof ApiError && error.status === 404) {
      notFound();
    }
    throw error;
  }

  return (
    /* componente base que envuelve la pantalla con márgenes estandarizados */
    <Pagina>
      {/* encabezado de la página con el título dinámico, fecha de emisión y botones de acción */}
      <EncabezadoPagina
        titulo={`Factura ${factura.numeroFormateado}`}
        subtitulo={`Emitida el ${formatearFechaHora(factura.fecha)} por ${factura.vendedor.nombre}`}
        acciones={
          /* contenedor que alinea horizontalmente los botones de volver, imprimir y anular */
          <Alinear className="gap-2">
            {/* enlace para regresar al listado general de ventas */}
            <Link href="/ventas">
              <Button variant="outline">
                <ArrowLeft className="size-4" />
                Volver a facturas
              </Button>
            </Link>

            {/* botón que dispara la ventana de impresión nativa del navegador mediante window.print() */}
            <BotonImprimir />

            {/* renderizado condicional: solo si el usuario tiene rol de administrador ('admin')
                y la factura está en estado 'emitida', le mostramos el botón rojo para anular la factura.
                si la factura ya está anulada o el usuario es vendedor común, este botón no se muestra */}
            {usuario.rol === "admin" && factura.estado === "emitida" && (
              <BotonAnularFactura
                idFactura={factura.id}
                numeroFormateado={factura.numeroFormateado}
              />
            )}
          </Alinear>
        }
      />

      {/* aviso visual destacado si la factura se encuentra anulada.
          verificamos si existe la propiedad 'anulacion' en el objeto factura para mostrar la tarjeta de advertencia roja */}
      {"anulacion" in factura && factura.anulacion && (
        <Card className="border-red-300 bg-red-50 p-4">
          <Alinear className="gap-3">
            {/* icono de prohibido en color rojo */}
            <Ban className="size-5 text-red-600 shrink-0" />
            <Apilar className="gap-0.5">
              {/* fecha exacta de la anulación y el nombre del usuario administrador que la realizó */}
              <Texto tono="peligro" negrita>
                FACTURA ANULADA · {formatearFechaHora(factura.anulacion.fecha)}
                {factura.anulacion.usuario ? ` por ${factura.anulacion.usuario.nombre}` : ""}
              </Texto>
              {/* motivo obligatorio que se ingresó al anular la factura */}
              <Texto tamano="sm" tono="peligro">
                Motivo: {factura.anulacion.motivo}
              </Texto>
            </Apilar>
          </Alinear>
        </Card>
      )}

      {/* tarjeta contenedora del comprobante imprimible con formato de factura tradicional */}
      <Card className="p-6 md:p-8 max-w-4xl">
        {/* cabecera del comprobante con los datos del comercio a la izquierda y número de factura a la derecha */}
        <Alinear className="justify-between items-start gap-4">
          <Alinear className="gap-3">
            {/* icono estilizado del local de la ferretería */}
            <Caja className="flex size-11 items-center justify-center rounded-xl bg-primary text-primary-foreground">
              <Store className="size-6" />
            </Caja>
            <Apilar className="gap-0.5">
              <Titulo nivel={2}>Ferretería El Yunque</Titulo>
              <Texto tamano="xs" tono="suave">
                Av. Belgrano 1850 · San Miguel de Tucumán · Tel: (0381) 432-1100
              </Texto>
              <Texto tamano="xs" tono="suave">
                Comprobante interno de venta (no válido como factura fiscal)
              </Texto>
            </Apilar>
          </Alinear>

          {/* columna derecha de la cabecera: número correlativo, insignia de estado, fecha y vendedor */}
          <Apilar className="items-end gap-1">
            <Alinear className="gap-2">
              <Texto mono negrita tamano="lg">
                Nº {factura.numeroFormateado}
              </Texto>
              {/* insignia visual que muestra en verde si está 'emitida' o en rojo si está 'anulada' */}
              <InsigniaEstadoFactura estado={factura.estado} />
            </Alinear>
            <Texto tamano="xs" tono="suave">
              Fecha y hora: {formatearFechaHora(factura.fecha)}
            </Texto>
            <Texto tamano="xs" tono="suave">
              Atendió: {factura.vendedor.nombre}
            </Texto>
          </Apilar>
        </Alinear>

        {/* línea divisoria horizontal */}
        <Separator />

        {/* grilla de dos columnas con los datos del cliente y las condiciones de pago */}
        <Grilla className="grid-cols-1 sm:grid-cols-2">
          {/* columna 1: datos del comprador */}
          <Apilar className="gap-1">
            <Texto tamano="xs" tono="suave" negrita>
              DATOS DEL COMPRADOR
            </Texto>
            {/* si se registró un cliente mostramos nombre, documento y domicilio; si es nulo, mostramos Consumidor final */}
            {factura.cliente ? (
              <>
                <Texto negrita>{factura.cliente.nombre}</Texto>
                <Texto tamano="xs" tono="suave">
                  {factura.cliente.tipoDoc}: {factura.cliente.nroDoc}
                </Texto>
                {factura.cliente.domicilio && (
                  <Texto tamano="xs" tono="suave">
                    Domicilio: {factura.cliente.domicilio}
                  </Texto>
                )}
              </>
            ) : (
              <Texto negrita>Consumidor final</Texto>
            )}
          </Apilar>

          {/* columna 2: detalles de la forma de pago utilizada */}
          <Apilar className="gap-1">
            <Texto tamano="xs" tono="suave" negrita>
              CONDICIÓN Y FORMA DE PAGO
            </Texto>
            {/* convertimos el código de pago ('contado', 'tarjeta', 'cuenta_corriente') a un texto legible para el usuario */}
            <Texto negrita>{NOMBRES_FORMA_PAGO[factura.pago.forma]}</Texto>
            
            {/* si pagó en contado, mostramos cuánto dinero entregó y el vuelto entregado */}
            {factura.pago.forma === "contado" && (
              <Texto tamano="xs" tono="suave">
                Recibido: {formatearMoneda(factura.pago.montoRecibido)} · Vuelto:{" "}
                {formatearMoneda(factura.pago.vuelto)}
              </Texto>
            )}

            {/* si pagó con tarjeta, mostramos si fue débito o crédito, la marca (Visa, Mastercard) y los últimos 4 dígitos */}
            {factura.pago.forma === "tarjeta" && (
              <Texto tamano="xs" tono="suave">
                Tarjeta de {factura.pago.tarjeta.tipo === "debito" ? "débito" : "crédito"}{" "}
                {factura.pago.tarjeta.marca} terminada en {factura.pago.tarjeta.ultimos4}
              </Texto>
            )}

            {/* si pagó con cuenta corriente, mostramos el saldo actualizado que le queda al cliente */}
            {factura.pago.forma === "cuenta_corriente" && "saldoCliente" in factura && (
              <Texto tamano="xs" tono="suave">
                Cargado en cuenta corriente · Saldo actual del cliente:{" "}
                {formatearMoneda(factura.saldoCliente)}
              </Texto>
            )}
          </Apilar>
        </Grilla>

        {/* tabla detallada con cada uno de los productos vendidos en esta factura */}
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Código</TableHead>
              <TableHead>Descripción</TableHead>
              <TableHead className="text-right">Cant.</TableHead>
              <TableHead className="text-right">Precio unit.</TableHead>
              <TableHead className="text-right">Subtotal</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {/* recorremos el arreglo de renglones con .map para renderizar una fila por cada producto vendido */}
            {factura.items.map((item) => (
              <TableRow key={item.productoId}>
                <TableCell className="font-mono text-xs">{item.codigo}</TableCell>
                <TableCell className="font-medium">{item.descripcion}</TableCell>
                <TableCell className="text-right font-mono">{item.cantidad}</TableCell>
                {/* el precio unitario guardado en el renglón está congelado históricamente al momento de la venta */}
                <TableCell className="text-right font-mono">
                  {formatearMoneda(item.precioUnitario)}
                </TableCell>
                <TableCell className="text-right font-mono font-semibold">
                  {formatearMoneda(item.subtotal)}
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>

        {/* pie del comprobante con el importe total a pagar destacado en tamaño grande */}
        <Alinear className="justify-end border-t border-border pt-4">
          <Alinear className="gap-6">
            <Texto negrita tamano="base">
              TOTAL
            </Texto>
            <Texto mono negrita tamano="2xl" className="text-primary">
              {formatearMoneda(factura.total)}
            </Texto>
          </Alinear>
        </Alinear>
      </Card>
    </Pagina>
  );
}
