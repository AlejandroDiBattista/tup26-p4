// ============================================================================
// ARCHIVO COMENTADO LÍNEA POR LÍNEA PARA ESTUDIO Y DEFENSA DEL SEGUNDO PARCIAL
// ============================================================================
// Pantalla de COMPROBANTE DE FACTURA (/ventas/[id]). RF-V7 y RF-V9.
// - Vista imprimible con datos del comercio, número, fecha y hora, vendedor, comprador,
//   detalle de renglones, total y forma de pago.
// - Si está anulada muestra el aviso con fecha, usuario y motivo.
// - Si el usuario es administrador y la factura está emitida, muestra el botón Anular factura.
// [Línea 6] Importa elementos desde 'next/link'.
import Link from "next/link";
// [Línea 7] Importa elementos desde 'lucide-react'.
import { ArrowLeft, Ban, Store } from "lucide-react";
// [Línea 8] Importa elementos desde '@/lib/sesion'.
import { exigirUsuarioPagina } from "@/lib/sesion";
// [Línea 9] Importa elementos desde '@/servicios/facturas'.
import { obtenerFactura } from "@/servicios/facturas";
// [Línea 10] Importa elementos desde '@/lib/formato'.
import { formatearFechaHora, formatearMoneda, NOMBRES_FORMA_PAGO } from "@/lib/formato";
// [Línea 11] Importa elementos desde '@/componentes/ui/button'.
import { Button } from "@/componentes/ui/button";
// [Línea 12] Importa elementos desde '@/componentes/ui/card'.
import { Card } from "@/componentes/ui/card";
// [Línea 13] Importa elementos desde '@/componentes/ui/select'.
import { Separator } from "@/componentes/ui/select";
// [Línea 14] Inicia un bloque de importación de dependencias.
import {
  // [Línea 15] Importa 'Table' desde el módulo.
  Table,
  // [Línea 16] Importa 'TableBody' desde el módulo.
  TableBody,
  // [Línea 17] Importa 'TableCell' desde el módulo.
  TableCell,
  // [Línea 18] Importa 'TableHead' desde el módulo.
  TableHead,
  // [Línea 19] Importa 'TableHeader' desde el módulo.
  TableHeader,
  // [Línea 20] Importa 'TableRow' desde el módulo.
  TableRow,
// [Línea 21] Cierra la lista de importaciones provenientes del módulo '@/componentes/ui/table'.
} from "@/componentes/ui/table";
// [Línea 22] Importa elementos desde '@/componentes/comunes/encabezado-pagina'.
import { EncabezadoPagina } from "@/componentes/comunes/encabezado-pagina";
// [Línea 23] Importa elementos desde '@/componentes/comunes/insignias'.
import { InsigniaEstadoFactura } from "@/componentes/comunes/insignias";
// [Línea 24] Importa elementos desde '@/componentes/comunes/boton-imprimir'.
import { BotonImprimir } from "@/componentes/comunes/boton-imprimir";
// [Línea 25] Importa elementos desde '@/componentes/dominio/modal-anular-factura'.
import { BotonAnularFactura } from "@/componentes/dominio/modal-anular-factura";
// [Línea 26] Importa elementos desde '@/componentes/primitivas/maquetacion'.
import { Alinear, Apilar, Caja, Grilla, Pagina, Texto, Titulo } from "@/componentes/primitivas/maquetacion";

// [Línea 28] Define el tipo de datos 'Props' en TypeScript.
type Props = { params: Promise<{ id: string }> };

// [Línea 30] Server Component principal 'PaginaDetalleFactura': se ejecuta en el servidor, consulta los servicios y devuelve el HTML.
export default async function PaginaDetalleFactura({ params }: Props) {
  // [Línea 31] Espera el resultado de la consulta/operación asíncrona y lo asigna a 'usuario'.
  const usuario = await exigirUsuarioPagina();
  // [Línea 32] Espera el resultado de la consulta/operación asíncrona y lo asigna a '{ id }'.
  const { id } = await params;
  // [Línea 33] Espera el resultado de la consulta/operación asíncrona y lo asigna a 'factura'.
  const factura = await obtenerFactura(usuario, Number(id));

  // [Línea 35] Devuelve la interfaz JSX que renderiza este componente.
  return (
    <Pagina> // [Línea 36] Abre o renderiza el componente visual <Pagina>.
      <EncabezadoPagina // [Línea 37] Abre o renderiza el componente visual <EncabezadoPagina>.
        // [Línea 38] Ejecuta o evalúa: titulo={`Factura ${factura.numeroFormateado}`}
        titulo={`Factura ${factura.numeroFormateado}`}
        // [Línea 39] Ejecuta o evalúa: subtitulo={`Emitida el ${formatearFechaHora(factura.fecha)} por ${factura.vended
        subtitulo={`Emitida el ${formatearFechaHora(factura.fecha)} por ${factura.vendedor.nombre}`}
        // [Línea 40] Ejecuta o evalúa: acciones={
        acciones={
          <Alinear className="gap-2"> // [Línea 41] Abre o renderiza el componente visual <Alinear>.
            <Link href="/ventas"> // [Línea 42] Abre o renderiza el componente visual <Link>.
              <Button variant="outline"> // [Línea 43] Abre o renderiza el componente visual <Button>.
                <ArrowLeft className="size-4" /> // [Línea 44] Abre o renderiza el componente visual <ArrowLeft>.
                // [Línea 45] Ejecuta o evalúa: Volver a facturas
                Volver a facturas
              </Button> // [Línea 46] Cierra el componente visual </Button>.
            </Link> // [Línea 47] Cierra el componente visual </Link>.
            <BotonImprimir /> // [Línea 48] Abre o renderiza el componente visual <BotonImprimir>.
            // [Línea 49] Ejecuta o evalúa: {usuario.rol === "admin" && factura.estado === "emitida" && (
            {usuario.rol === "admin" && factura.estado === "emitida" && (
              <BotonAnularFactura // [Línea 50] Abre o renderiza el componente visual <BotonAnularFactura>.
                // [Línea 51] Ejecuta o evalúa: idFactura={factura.id}
                idFactura={factura.id}
                // [Línea 52] Ejecuta o evalúa: numeroFormateado={factura.numeroFormateado}
                numeroFormateado={factura.numeroFormateado}
              // [Línea 53] Ejecuta o evalúa: />
              />
            // [Línea 54] Ejecuta o evalúa: )}
            )}
          </Alinear> // [Línea 55] Cierra el componente visual </Alinear>.
        // [Línea 56] Cierra el bloque o estructura (}).
        }
      // [Línea 57] Ejecuta o evalúa: />
      />

      // [Línea 59] Ejecuta o evalúa: {/* Aviso de factura anulada (regla 5 y RF-V9) */}
      {/* Aviso de factura anulada (regla 5 y RF-V9) */}
      // [Línea 60] Ejecuta o evalúa: {"anulacion" in factura && factura.anulacion && (
      {"anulacion" in factura && factura.anulacion && (
        <Card className="border-red-300 bg-red-50 p-4"> // [Línea 61] Abre o renderiza el componente visual <Card>.
          <Alinear className="gap-3"> // [Línea 62] Abre o renderiza el componente visual <Alinear>.
            <Ban className="size-5 text-red-600 shrink-0" /> // [Línea 63] Abre o renderiza el componente visual <Ban>.
            <Apilar className="gap-0.5"> // [Línea 64] Abre o renderiza el componente visual <Apilar>.
              <Texto tono="peligro" negrita> // [Línea 65] Abre o renderiza el componente visual <Texto>.
                // [Línea 66] Ejecuta o evalúa: FACTURA ANULADA · {formatearFechaHora(factura.anulacion.fecha)}
                FACTURA ANULADA · {formatearFechaHora(factura.anulacion.fecha)}
                // [Línea 67] Ejecuta o evalúa: {factura.anulacion.usuario ? ` por ${factura.anulacion.usuario.nombre}` : ""}
                {factura.anulacion.usuario ? ` por ${factura.anulacion.usuario.nombre}` : ""}
              </Texto> // [Línea 68] Cierra el componente visual </Texto>.
              <Texto tamano="sm" tono="peligro"> // [Línea 69] Abre o renderiza el componente visual <Texto>.
                // [Línea 70] Define o asigna el campo/parámetro 'Motivo'.
                Motivo: {factura.anulacion.motivo}
              </Texto> // [Línea 71] Cierra el componente visual </Texto>.
            </Apilar> // [Línea 72] Cierra el componente visual </Apilar>.
          </Alinear> // [Línea 73] Cierra el componente visual </Alinear>.
        </Card> // [Línea 74] Cierra el componente visual </Card>.
      // [Línea 75] Ejecuta o evalúa: )}
      )}

      // [Línea 77] Ejecuta o evalúa: {/* Comprobante imprimible */}
      {/* Comprobante imprimible */}
      <Card className="p-6 md:p-8 max-w-4xl"> // [Línea 78] Abre o renderiza el componente visual <Card>.
        <Alinear className="justify-between items-start gap-4"> // [Línea 79] Abre o renderiza el componente visual <Alinear>.
          <Alinear className="gap-3"> // [Línea 80] Abre o renderiza el componente visual <Alinear>.
            <Caja className="flex size-11 items-center justify-center rounded-xl bg-primary text-primary-foreground"> // [Línea 81] Abre o renderiza el componente visual <Caja>.
              <Store className="size-6" /> // [Línea 82] Abre o renderiza el componente visual <Store>.
            </Caja> // [Línea 83] Cierra el componente visual </Caja>.
            <Apilar className="gap-0.5"> // [Línea 84] Abre o renderiza el componente visual <Apilar>.
              <Titulo nivel={2}>Ferretería El Yunque</Titulo> // [Línea 85] Abre o renderiza el componente visual <Titulo>.
              <Texto tamano="xs" tono="suave"> // [Línea 86] Abre o renderiza el componente visual <Texto>.
                // [Línea 87] Ejecuta o evalúa: Av. Belgrano 1850 · San Miguel de Tucumán · Tel: (0381) 432-1100
                Av. Belgrano 1850 · San Miguel de Tucumán · Tel: (0381) 432-1100
              </Texto> // [Línea 88] Cierra el componente visual </Texto>.
              <Texto tamano="xs" tono="suave"> // [Línea 89] Abre o renderiza el componente visual <Texto>.
                // [Línea 90] Ejecuta o evalúa: Comprobante interno de venta (no válido como factura fiscal)
                Comprobante interno de venta (no válido como factura fiscal)
              </Texto> // [Línea 91] Cierra el componente visual </Texto>.
            </Apilar> // [Línea 92] Cierra el componente visual </Apilar>.
          </Alinear> // [Línea 93] Cierra el componente visual </Alinear>.

          <Apilar className="items-end gap-1"> // [Línea 95] Abre o renderiza el componente visual <Apilar>.
            <Alinear className="gap-2"> // [Línea 96] Abre o renderiza el componente visual <Alinear>.
              <Texto mono negrita tamano="lg"> // [Línea 97] Abre o renderiza el componente visual <Texto>.
                // [Línea 98] Ejecuta o evalúa: Nº {factura.numeroFormateado}
                Nº {factura.numeroFormateado}
              </Texto> // [Línea 99] Cierra el componente visual </Texto>.
              <InsigniaEstadoFactura estado={factura.estado} /> // [Línea 100] Abre o renderiza el componente visual <InsigniaEstadoFactura>.
            </Alinear> // [Línea 101] Cierra el componente visual </Alinear>.
            <Texto tamano="xs" tono="suave"> // [Línea 102] Abre o renderiza el componente visual <Texto>.
              // [Línea 103] Ejecuta o evalúa: Fecha y hora: {formatearFechaHora(factura.fecha)}
              Fecha y hora: {formatearFechaHora(factura.fecha)}
            </Texto> // [Línea 104] Cierra el componente visual </Texto>.
            <Texto tamano="xs" tono="suave"> // [Línea 105] Abre o renderiza el componente visual <Texto>.
              // [Línea 106] Ejecuta o evalúa: Atendió: {factura.vendedor.nombre}
              Atendió: {factura.vendedor.nombre}
            </Texto> // [Línea 107] Cierra el componente visual </Texto>.
          </Apilar> // [Línea 108] Cierra el componente visual </Apilar>.
        </Alinear> // [Línea 109] Cierra el componente visual </Alinear>.

        <Separator /> // [Línea 111] Abre o renderiza el componente visual <Separator>.

        // [Línea 113] Ejecuta o evalúa: {/* Datos del comprador y forma de pago */}
        {/* Datos del comprador y forma de pago */}
        <Grilla className="grid-cols-1 sm:grid-cols-2"> // [Línea 114] Abre o renderiza el componente visual <Grilla>.
          <Apilar className="gap-1"> // [Línea 115] Abre o renderiza el componente visual <Apilar>.
            <Texto tamano="xs" tono="suave" negrita> // [Línea 116] Abre o renderiza el componente visual <Texto>.
              // [Línea 117] Ejecuta o evalúa: DATOS DEL COMPRADOR
              DATOS DEL COMPRADOR
            </Texto> // [Línea 118] Cierra el componente visual </Texto>.
            // [Línea 119] Ejecuta o evalúa: {factura.cliente ? (
            {factura.cliente ? (
              <> // [Línea 120] Abre o renderiza el componente visual <elemento>.
                <Texto negrita>{factura.cliente.nombre}</Texto> // [Línea 121] Abre o renderiza el componente visual <Texto>.
                <Texto tamano="xs" tono="suave"> // [Línea 122] Abre o renderiza el componente visual <Texto>.
                  // [Línea 123] Ejecuta o evalúa: {factura.cliente.tipoDoc}: {factura.cliente.nroDoc}
                  {factura.cliente.tipoDoc}: {factura.cliente.nroDoc}
                </Texto> // [Línea 124] Cierra el componente visual </Texto>.
                // [Línea 125] Ejecuta o evalúa: {factura.cliente.domicilio && (
                {factura.cliente.domicilio && (
                  <Texto tamano="xs" tono="suave"> // [Línea 126] Abre o renderiza el componente visual <Texto>.
                    // [Línea 127] Define o asigna el campo/parámetro 'Domicilio'.
                    Domicilio: {factura.cliente.domicilio}
                  </Texto> // [Línea 128] Cierra el componente visual </Texto>.
                // [Línea 129] Ejecuta o evalúa: )}
                )}
              </> // [Línea 130] Cierra el componente visual </elemento>.
            // [Línea 131] Ejecuta o evalúa: ) : (
            ) : (
              <Texto negrita>Consumidor final</Texto> // [Línea 132] Abre o renderiza el componente visual <Texto>.
            // [Línea 133] Ejecuta o evalúa: )}
            )}
          </Apilar> // [Línea 134] Cierra el componente visual </Apilar>.

          <Apilar className="gap-1"> // [Línea 136] Abre o renderiza el componente visual <Apilar>.
            <Texto tamano="xs" tono="suave" negrita> // [Línea 137] Abre o renderiza el componente visual <Texto>.
              // [Línea 138] Ejecuta o evalúa: CONDICIÓN Y FORMA DE PAGO
              CONDICIÓN Y FORMA DE PAGO
            </Texto> // [Línea 139] Cierra el componente visual </Texto>.
            <Texto negrita>{NOMBRES_FORMA_PAGO[factura.pago.forma]}</Texto> // [Línea 140] Abre o renderiza el componente visual <Texto>.
            // [Línea 141] Ejecuta o evalúa: {factura.pago.forma === "contado" && (
            {factura.pago.forma === "contado" && (
              <Texto tamano="xs" tono="suave"> // [Línea 142] Abre o renderiza el componente visual <Texto>.
                // [Línea 143] Define o asigna el campo/parámetro 'Recibido'.
                Recibido: {formatearMoneda(factura.pago.montoRecibido)} · Vuelto:{" "}
                // [Línea 144] Ejecuta o evalúa: {formatearMoneda(factura.pago.vuelto)}
                {formatearMoneda(factura.pago.vuelto)}
              </Texto> // [Línea 145] Cierra el componente visual </Texto>.
            // [Línea 146] Ejecuta o evalúa: )}
            )}
            // [Línea 147] Ejecuta o evalúa: {factura.pago.forma === "tarjeta" && (
            {factura.pago.forma === "tarjeta" && (
              <Texto tamano="xs" tono="suave"> // [Línea 148] Abre o renderiza el componente visual <Texto>.
                // [Línea 149] Ejecuta o evalúa: Tarjeta de {factura.pago.tarjeta.tipo === "debito" ? "débito" : "crédito"}{" "}
                Tarjeta de {factura.pago.tarjeta.tipo === "debito" ? "débito" : "crédito"}{" "}
                // [Línea 150] Ejecuta o evalúa: {factura.pago.tarjeta.marca} terminada en {factura.pago.tarjeta.ultimos4}
                {factura.pago.tarjeta.marca} terminada en {factura.pago.tarjeta.ultimos4}
              </Texto> // [Línea 151] Cierra el componente visual </Texto>.
            // [Línea 152] Ejecuta o evalúa: )}
            )}
            // [Línea 153] Ejecuta o evalúa: {factura.pago.forma === "cuenta_corriente" && "saldoCliente" in factura && (
            {factura.pago.forma === "cuenta_corriente" && "saldoCliente" in factura && (
              <Texto tamano="xs" tono="suave"> // [Línea 154] Abre o renderiza el componente visual <Texto>.
                // [Línea 155] Ejecuta o evalúa: Cargado en cuenta corriente · Saldo actual del cliente:{" "}
                Cargado en cuenta corriente · Saldo actual del cliente:{" "}
                // [Línea 156] Ejecuta o evalúa: {formatearMoneda(factura.saldoCliente)}
                {formatearMoneda(factura.saldoCliente)}
              </Texto> // [Línea 157] Cierra el componente visual </Texto>.
            // [Línea 158] Ejecuta o evalúa: )}
            )}
          </Apilar> // [Línea 159] Cierra el componente visual </Apilar>.
        </Grilla> // [Línea 160] Cierra el componente visual </Grilla>.

        // [Línea 162] Ejecuta o evalúa: {/* Detalle de renglones */}
        {/* Detalle de renglones */}
        <Table> // [Línea 163] Abre o renderiza el componente visual <Table>.
          <TableHeader> // [Línea 164] Abre o renderiza el componente visual <TableHeader>.
            <TableRow> // [Línea 165] Abre o renderiza el componente visual <TableRow>.
              <TableHead>Código</TableHead> // [Línea 166] Abre o renderiza el componente visual <TableHead>.
              <TableHead>Descripción</TableHead> // [Línea 167] Abre o renderiza el componente visual <TableHead>.
              <TableHead className="text-right">Cant.</TableHead> // [Línea 168] Abre o renderiza el componente visual <TableHead>.
              <TableHead className="text-right">Precio unit.</TableHead> // [Línea 169] Abre o renderiza el componente visual <TableHead>.
              <TableHead className="text-right">Subtotal</TableHead> // [Línea 170] Abre o renderiza el componente visual <TableHead>.
            </TableRow> // [Línea 171] Cierra el componente visual </TableRow>.
          </TableHeader> // [Línea 172] Cierra el componente visual </TableHeader>.
          <TableBody> // [Línea 173] Abre o renderiza el componente visual <TableBody>.
            // [Línea 174] Ejecuta o evalúa: {factura.items.map((item) => (
            {factura.items.map((item) => (
              <TableRow key={item.productoId}> // [Línea 175] Abre o renderiza el componente visual <TableRow>.
                <TableCell className="font-mono text-xs">{item.codigo}</TableCell> // [Línea 176] Abre o renderiza el componente visual <TableCell>.
                <TableCell className="font-medium">{item.descripcion}</TableCell> // [Línea 177] Abre o renderiza el componente visual <TableCell>.
                <TableCell className="text-right font-mono">{item.cantidad}</TableCell> // [Línea 178] Abre o renderiza el componente visual <TableCell>.
                <TableCell className="text-right font-mono"> // [Línea 179] Abre o renderiza el componente visual <TableCell>.
                  // [Línea 180] Ejecuta o evalúa: {formatearMoneda(item.precioUnitario)}
                  {formatearMoneda(item.precioUnitario)}
                </TableCell> // [Línea 181] Cierra el componente visual </TableCell>.
                <TableCell className="text-right font-mono font-semibold"> // [Línea 182] Abre o renderiza el componente visual <TableCell>.
                  // [Línea 183] Ejecuta o evalúa: {formatearMoneda(item.subtotal)}
                  {formatearMoneda(item.subtotal)}
                </TableCell> // [Línea 184] Cierra el componente visual </TableCell>.
              </TableRow> // [Línea 185] Cierra el componente visual </TableRow>.
            // [Línea 186] Ejecuta o evalúa: ))}
            ))}
          </TableBody> // [Línea 187] Cierra el componente visual </TableBody>.
        </Table> // [Línea 188] Cierra el componente visual </Table>.

        <Alinear className="justify-end border-t border-border pt-4"> // [Línea 190] Abre o renderiza el componente visual <Alinear>.
          <Alinear className="gap-6"> // [Línea 191] Abre o renderiza el componente visual <Alinear>.
            <Texto negrita tamano="base"> // [Línea 192] Abre o renderiza el componente visual <Texto>.
              // [Línea 193] Ejecuta o evalúa: TOTAL
              TOTAL
            </Texto> // [Línea 194] Cierra el componente visual </Texto>.
            <Texto mono negrita tamano="2xl" className="text-primary"> // [Línea 195] Abre o renderiza el componente visual <Texto>.
              // [Línea 196] Ejecuta o evalúa: {formatearMoneda(factura.total)}
              {formatearMoneda(factura.total)}
            </Texto> // [Línea 197] Cierra el componente visual </Texto>.
          </Alinear> // [Línea 198] Cierra el componente visual </Alinear>.
        </Alinear> // [Línea 199] Cierra el componente visual </Alinear>.
      </Card> // [Línea 200] Cierra el componente visual </Card>.
    </Pagina> // [Línea 201] Cierra el componente visual </Pagina>.
  // [Línea 202] Cierra el bloque o estructura ();).
  );
// [Línea 203] Cierra el bloque o estructura (}).
}
