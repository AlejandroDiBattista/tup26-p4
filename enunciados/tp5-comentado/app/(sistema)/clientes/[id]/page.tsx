// ============================================================================
// ARCHIVO COMENTADO LÍNEA POR LÍNEA PARA ESTUDIO Y DEFENSA DEL SEGUNDO PARCIAL
// ============================================================================
// Pantalla de FICHA DEL CLIENTE y CUENTA CORRIENTE (/clientes/[id]). RF-C3, RF-C4, RF-C5.
// - Muestra datos del cliente, saldo actual, límite de crédito y crédito disponible.
// - Pestaña "Cuenta corriente": movimientos en orden cronológico con saldo acumulado renglón a renglón.
// - Pestaña "Últimas facturas": las últimas facturas emitidas al cliente.
// [Línea 5] Importa elementos desde 'next/link'.
import Link from "next/link";
// [Línea 6] Importa elementos desde 'lucide-react'.
import { ArrowLeft, Eye } from "lucide-react";
// [Línea 7] Importa elementos desde '@/lib/sesion'.
import { exigirUsuarioPagina } from "@/lib/sesion";
// [Línea 8] Importa elementos desde '@/servicios/clientes'.
import { obtenerCliente, obtenerCuentaCorriente } from "@/servicios/clientes";
// [Línea 9] Importa elementos desde '@/lib/formato'.
import { formatearFechaHora, formatearMoneda } from "@/lib/formato";
// [Línea 10] Importa elementos desde '@/componentes/ui/button'.
import { Button } from "@/componentes/ui/button";
// [Línea 11] Importa elementos desde '@/componentes/ui/badge'.
import { Badge } from "@/componentes/ui/badge";
// [Línea 12] Importa elementos desde '@/componentes/ui/card'.
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/componentes/ui/card";
// [Línea 13] Inicia un bloque de importación de dependencias.
import {
  // [Línea 14] Importa 'Table' desde el módulo.
  Table,
  // [Línea 15] Importa 'TableBody' desde el módulo.
  TableBody,
  // [Línea 16] Importa 'TableCell' desde el módulo.
  TableCell,
  // [Línea 17] Importa 'TableHead' desde el módulo.
  TableHead,
  // [Línea 18] Importa 'TableHeader' desde el módulo.
  TableHeader,
  // [Línea 19] Importa 'TableRow' desde el módulo.
  TableRow,
// [Línea 20] Cierra la lista de importaciones provenientes del módulo '@/componentes/ui/table'.
} from "@/componentes/ui/table";
// [Línea 21] Importa elementos desde '@/componentes/comunes/encabezado-pagina'.
import { EncabezadoPagina } from "@/componentes/comunes/encabezado-pagina";
// [Línea 22] Importa elementos desde '@/componentes/comunes/filtros-url'.
import { BarraFiltrosUrl } from "@/componentes/comunes/filtros-url";
// [Línea 23] Inicia un bloque de importación de dependencias.
import {
  // [Línea 24] Importa 'InsigniaActivo' desde el módulo.
  InsigniaActivo,
  // [Línea 25] Importa 'InsigniaEstadoFactura' desde el módulo.
  InsigniaEstadoFactura,
  // [Línea 26] Importa 'InsigniaFormaPago' desde el módulo.
  InsigniaFormaPago,
// [Línea 27] Cierra la lista de importaciones provenientes del módulo '@/componentes/comunes/insignias'.
} from "@/componentes/comunes/insignias";
// [Línea 28] Importa elementos desde '@/componentes/comunes/estados'.
import { EstadoVacio } from "@/componentes/comunes/estados";
// [Línea 29] Inicia un bloque de importación de dependencias.
import {
  // [Línea 30] Importa 'BotonesEditarCliente' desde el módulo.
  BotonesEditarCliente,
  // [Línea 31] Importa 'BotonRegistrarPago' desde el módulo.
  BotonRegistrarPago,
// [Línea 32] Cierra la lista de importaciones provenientes del módulo '@/componentes/dominio/acciones-clientes'.
} from "@/componentes/dominio/acciones-clientes";
// [Línea 33] Importa elementos desde '@/componentes/primitivas/maquetacion'.
import { Alinear, Grilla, Pagina, Texto } from "@/componentes/primitivas/maquetacion";

// [Línea 35] Define el tipo de datos 'Props' en TypeScript.
type Props = {
  // [Línea 36] Define o asigna el campo/parámetro 'params'.
  params: Promise<{ id: string }>;
  // [Línea 37] Define o asigna el campo/parámetro 'searchParams'.
  searchParams: Promise<Record<string, string | undefined>>;
// [Línea 38] Cierra el bloque o estructura (};).
};

// [Línea 40] Server Component principal 'PaginaFichaCliente': se ejecuta en el servidor, consulta los servicios y devuelve el HTML.
export default async function PaginaFichaCliente({ params, searchParams }: Props) {
  // [Línea 41] Espera el resultado de la consulta/operación asíncrona y lo asigna a 'usuario'.
  const usuario = await exigirUsuarioPagina();
  // [Línea 42] Espera el resultado de la consulta/operación asíncrona y lo asigna a '{ id }'.
  const { id } = await params;
  // [Línea 43] Espera el resultado de la consulta/operación asíncrona y lo asigna a 'parametros'.
  const parametros = await searchParams;
  // [Línea 44] Declara 'idCliente' y le asigna el valor resultante.
  const idCliente = Number(id);
  // [Línea 45] Declara 'pestana' y le asigna el valor resultante.
  const pestana = parametros.vista === "facturas" ? "facturas" : "cuenta";

  // [Línea 47] Espera el resultado de la consulta/operación asíncrona y lo asigna a '[cliente, cuenta]'.
  const [cliente, cuenta] = await Promise.all([
    // [Línea 48] Ejecuta o evalúa: obtenerCliente(usuario, idCliente),
    obtenerCliente(usuario, idCliente),
    // [Línea 49] Ejecuta o evalúa: obtenerCuentaCorriente(usuario, idCliente, {
    obtenerCuentaCorriente(usuario, idCliente, {
      // [Línea 50] Define o asigna el campo/parámetro 'desde'.
      desde: parametros.desde,
      // [Línea 51] Define o asigna el campo/parámetro 'hasta'.
      hasta: parametros.hasta,
    // [Línea 52] Ejecuta o evalúa: }),
    }),
  // [Línea 53] Cierra el bloque o estructura (]);).
  ]);

  // [Línea 55] Devuelve la interfaz JSX que renderiza este componente.
  return (
    <Pagina> // [Línea 56] Abre o renderiza el componente visual <Pagina>.
      <EncabezadoPagina // [Línea 57] Abre o renderiza el componente visual <EncabezadoPagina>.
        // [Línea 58] Ejecuta o evalúa: titulo={cliente.nombre}
        titulo={cliente.nombre}
        // [Línea 59] Ejecuta o evalúa: subtitulo={`${cliente.tipoDoc} ${cliente.nroDoc} · ${cliente.domicilio ?? "Sin d
        subtitulo={`${cliente.tipoDoc} ${cliente.nroDoc} · ${cliente.domicilio ?? "Sin domicilio"} · Tel: ${cliente.telefono ?? "—"}`}
        // [Línea 60] Ejecuta o evalúa: acciones={
        acciones={
          <Alinear className="gap-2"> // [Línea 61] Abre o renderiza el componente visual <Alinear>.
            <Link href="/clientes"> // [Línea 62] Abre o renderiza el componente visual <Link>.
              <Button variant="outline"> // [Línea 63] Abre o renderiza el componente visual <Button>.
                <ArrowLeft className="size-4" /> // [Línea 64] Abre o renderiza el componente visual <ArrowLeft>.
                // [Línea 65] Ejecuta o evalúa: Volver a clientes
                Volver a clientes
              </Button> // [Línea 66] Cierra el componente visual </Button>.
            </Link> // [Línea 67] Cierra el componente visual </Link>.
            <BotonRegistrarPago cliente={cliente} /> // [Línea 68] Abre o renderiza el componente visual <BotonRegistrarPago>.
            <BotonesEditarCliente cliente={cliente} /> // [Línea 69] Abre o renderiza el componente visual <BotonesEditarCliente>.
          </Alinear> // [Línea 70] Cierra el componente visual </Alinear>.
        // [Línea 71] Cierra el bloque o estructura (}).
        }
      // [Línea 72] Ejecuta o evalúa: />
      />

      // [Línea 74] Ejecuta o evalúa: {/* Resumen financiero del cliente */}
      {/* Resumen financiero del cliente */}
      <Grilla className="grid-cols-1 sm:grid-cols-4"> // [Línea 75] Abre o renderiza el componente visual <Grilla>.
        <Card> // [Línea 76] Abre o renderiza el componente visual <Card>.
          <CardHeader> // [Línea 77] Abre o renderiza el componente visual <CardHeader>.
            <CardDescription>Saldo actual (deuda)</CardDescription> // [Línea 78] Abre o renderiza el componente visual <CardDescription>.
            <CardTitle className="text-2xl font-mono"> // [Línea 79] Abre o renderiza el componente visual <CardTitle>.
              <Texto tamano="2xl" mono negrita tono={cliente.saldo > 0 ? "peligro" : "exito"}> // [Línea 80] Abre o renderiza el componente visual <Texto>.
                // [Línea 81] Ejecuta o evalúa: {formatearMoneda(cliente.saldo)}
                {formatearMoneda(cliente.saldo)}
              </Texto> // [Línea 82] Cierra el componente visual </Texto>.
            </CardTitle> // [Línea 83] Cierra el componente visual </CardTitle>.
          </CardHeader> // [Línea 84] Cierra el componente visual </CardHeader>.
        </Card> // [Línea 85] Cierra el componente visual </Card>.

        <Card> // [Línea 87] Abre o renderiza el componente visual <Card>.
          <CardHeader> // [Línea 88] Abre o renderiza el componente visual <CardHeader>.
            <CardDescription>Límite de crédito</CardDescription> // [Línea 89] Abre o renderiza el componente visual <CardDescription>.
            <CardTitle className="text-2xl font-mono"> // [Línea 90] Abre o renderiza el componente visual <CardTitle>.
              // [Línea 91] Ejecuta o evalúa: {cliente.cuentaCorriente
              {cliente.cuentaCorriente
                // [Línea 92] Ejecuta o evalúa: ? cliente.limiteCredito !== null
                ? cliente.limiteCredito !== null
                  // [Línea 93] Ejecuta o evalúa: ? formatearMoneda(cliente.limiteCredito)
                  ? formatearMoneda(cliente.limiteCredito)
                  // [Línea 94] Ejecuta o evalúa: : "Sin tope"
                  : "Sin tope"
                // [Línea 95] Ejecuta o evalúa: : "No habilitada"}
                : "No habilitada"}
            </CardTitle> // [Línea 96] Cierra el componente visual </CardTitle>.
          </CardHeader> // [Línea 97] Cierra el componente visual </CardHeader>.
        </Card> // [Línea 98] Cierra el componente visual </Card>.

        <Card> // [Línea 100] Abre o renderiza el componente visual <Card>.
          <CardHeader> // [Línea 101] Abre o renderiza el componente visual <CardHeader>.
            <CardDescription>Crédito disponible</CardDescription> // [Línea 102] Abre o renderiza el componente visual <CardDescription>.
            <CardTitle className="text-2xl font-mono"> // [Línea 103] Abre o renderiza el componente visual <CardTitle>.
              // [Línea 104] Ejecuta o evalúa: {cliente.cuentaCorriente
              {cliente.cuentaCorriente
                // [Línea 105] Ejecuta o evalúa: ? cliente.disponible !== null
                ? cliente.disponible !== null
                  // [Línea 106] Ejecuta o evalúa: ? formatearMoneda(cliente.disponible)
                  ? formatearMoneda(cliente.disponible)
                  // [Línea 107] Ejecuta o evalúa: : "Sin tope"
                  : "Sin tope"
                // [Línea 108] Ejecuta o evalúa: : "—"}
                : "—"}
            </CardTitle> // [Línea 109] Cierra el componente visual </CardTitle>.
          </CardHeader> // [Línea 110] Cierra el componente visual </CardHeader>.
        </Card> // [Línea 111] Cierra el componente visual </Card>.

        <Card> // [Línea 113] Abre o renderiza el componente visual <Card>.
          <CardHeader> // [Línea 114] Abre o renderiza el componente visual <CardHeader>.
            <CardDescription>Condición</CardDescription> // [Línea 115] Abre o renderiza el componente visual <CardDescription>.
            <CardContent className="pt-1"> // [Línea 116] Abre o renderiza el componente visual <CardContent>.
              <Alinear className="gap-2"> // [Línea 117] Abre o renderiza el componente visual <Alinear>.
                // [Línea 118] Ejecuta o evalúa: {cliente.cuentaCorriente ? (
                {cliente.cuentaCorriente ? (
                  <Badge variant="success">Cta. Cte. activa</Badge> // [Línea 119] Abre o renderiza el componente visual <Badge>.
                // [Línea 120] Ejecuta o evalúa: ) : (
                ) : (
                  <Badge variant="secondary">Solo contado/tarjeta</Badge> // [Línea 121] Abre o renderiza el componente visual <Badge>.
                // [Línea 122] Ejecuta o evalúa: )}
                )}
                <InsigniaActivo activo={cliente.activo} textoInactivo="Dado de baja" /> // [Línea 123] Abre o renderiza el componente visual <InsigniaActivo>.
              </Alinear> // [Línea 124] Cierra el componente visual </Alinear>.
            </CardContent> // [Línea 125] Cierra el componente visual </CardContent>.
          </CardHeader> // [Línea 126] Cierra el componente visual </CardHeader>.
        </Card> // [Línea 127] Cierra el componente visual </Card>.
      </Grilla> // [Línea 128] Cierra el componente visual </Grilla>.

      // [Línea 130] Ejecuta o evalúa: {/* Pestañas Cuenta corriente / Últimas facturas (sección 4) */}
      {/* Pestañas Cuenta corriente / Últimas facturas (sección 4) */}
      <Alinear className="gap-2 border-b border-border pb-2"> // [Línea 131] Abre o renderiza el componente visual <Alinear>.
        <Link href={`/clientes/${cliente.id}?vista=cuenta`}> // [Línea 132] Abre o renderiza el componente visual <Link>.
          <Button variant={pestana === "cuenta" ? "default" : "ghost"} size="sm"> // [Línea 133] Abre o renderiza el componente visual <Button>.
            // [Línea 134] Ejecuta o evalúa: Cuenta corriente ({cuenta.movimientos.length} movimientos)
            Cuenta corriente ({cuenta.movimientos.length} movimientos)
          </Button> // [Línea 135] Cierra el componente visual </Button>.
        </Link> // [Línea 136] Cierra el componente visual </Link>.
        <Link href={`/clientes/${cliente.id}?vista=facturas`}> // [Línea 137] Abre o renderiza el componente visual <Link>.
          <Button variant={pestana === "facturas" ? "default" : "ghost"} size="sm"> // [Línea 138] Abre o renderiza el componente visual <Button>.
            // [Línea 139] Ejecuta o evalúa: Últimas facturas ({cliente.ultimasFacturas.length})
            Últimas facturas ({cliente.ultimasFacturas.length})
          </Button> // [Línea 140] Cierra el componente visual </Button>.
        </Link> // [Línea 141] Cierra el componente visual </Link>.
      </Alinear> // [Línea 142] Cierra el componente visual </Alinear>.

      // [Línea 144] Ejecuta o evalúa: {pestana === "cuenta" ? (
      {pestana === "cuenta" ? (
        <Card> // [Línea 145] Abre o renderiza el componente visual <Card>.
          <CardHeader> // [Línea 146] Abre o renderiza el componente visual <CardHeader>.
            <CardTitle>Movimientos de cuenta corriente</CardTitle> // [Línea 147] Abre o renderiza el componente visual <CardTitle>.
            <CardDescription> // [Línea 148] Abre o renderiza el componente visual <CardDescription>.
              // [Línea 149] Ejecuta o evalúa: Orden cronológico con saldo acumulado en cada renglón (débitos por ventas menos
              Orden cronológico con saldo acumulado en cada renglón (débitos por ventas menos
              // [Línea 150] Ejecuta o evalúa: créditos por pagos y anulaciones)
              créditos por pagos y anulaciones)
            </CardDescription> // [Línea 151] Cierra el componente visual </CardDescription>.
          </CardHeader> // [Línea 152] Cierra el componente visual </CardHeader>.
          <CardContent className="gap-4"> // [Línea 153] Abre o renderiza el componente visual <CardContent>.
            <BarraFiltrosUrl // [Línea 154] Abre o renderiza el componente visual <BarraFiltrosUrl>.
              // [Línea 155] Ejecuta o evalúa: mostrarBusqueda={false}
              mostrarBusqueda={false}
              // [Línea 156] Ejecuta o evalúa: filtros={[
              filtros={[
                // [Línea 157] Ejecuta o evalúa: { nombre: "desde", etiqueta: "Desde fecha", tipo: "fecha" },
                { nombre: "desde", etiqueta: "Desde fecha", tipo: "fecha" },
                // [Línea 158] Ejecuta o evalúa: { nombre: "hasta", etiqueta: "Hasta fecha", tipo: "fecha" },
                { nombre: "hasta", etiqueta: "Hasta fecha", tipo: "fecha" },
              // [Línea 159] Ejecuta o evalúa: ]}
              ]}
            // [Línea 160] Ejecuta o evalúa: />
            />

            // [Línea 162] Ejecuta o evalúa: {parametros.desde && (
            {parametros.desde && (
              <Alinear className="justify-between rounded-lg border border-border bg-secondary/40 px-4 py-2"> // [Línea 163] Abre o renderiza el componente visual <Alinear>.
                <Texto tamano="xs" tono="suave"> // [Línea 164] Abre o renderiza el componente visual <Texto>.
                  // [Línea 165] Ejecuta o evalúa: Saldo anterior acumulado hasta {parametros.desde}:
                  Saldo anterior acumulado hasta {parametros.desde}:
                </Texto> // [Línea 166] Cierra el componente visual </Texto>.
                <Texto mono negrita tamano="sm"> // [Línea 167] Abre o renderiza el componente visual <Texto>.
                  // [Línea 168] Ejecuta o evalúa: {formatearMoneda(cuenta.saldoAnterior)}
                  {formatearMoneda(cuenta.saldoAnterior)}
                </Texto> // [Línea 169] Cierra el componente visual </Texto>.
              </Alinear> // [Línea 170] Cierra el componente visual </Alinear>.
            // [Línea 171] Ejecuta o evalúa: )}
            )}

            // [Línea 173] Ejecuta o evalúa: {cuenta.movimientos.length === 0 ? (
            {cuenta.movimientos.length === 0 ? (
              <EstadoVacio // [Línea 174] Abre o renderiza el componente visual <EstadoVacio>.
                // [Línea 175] Ejecuta o evalúa: titulo="No hay movimientos en la cuenta corriente"
                titulo="No hay movimientos en la cuenta corriente"
                // [Línea 176] Ejecuta o evalúa: descripcion="Las ventas en cuenta corriente y los recibos de pago aparecerán aqu
                descripcion="Las ventas en cuenta corriente y los recibos de pago aparecerán aquí."
              // [Línea 177] Ejecuta o evalúa: />
              />
            // [Línea 178] Ejecuta o evalúa: ) : (
            ) : (
              <Table> // [Línea 179] Abre o renderiza el componente visual <Table>.
                <TableHeader> // [Línea 180] Abre o renderiza el componente visual <TableHeader>.
                  <TableRow> // [Línea 181] Abre o renderiza el componente visual <TableRow>.
                    <TableHead>Fecha y hora</TableHead> // [Línea 182] Abre o renderiza el componente visual <TableHead>.
                    <TableHead>Concepto / Comprobante</TableHead> // [Línea 183] Abre o renderiza el componente visual <TableHead>.
                    <TableHead>Tipo</TableHead> // [Línea 184] Abre o renderiza el componente visual <TableHead>.
                    <TableHead className="text-right">Débito (+)</TableHead> // [Línea 185] Abre o renderiza el componente visual <TableHead>.
                    <TableHead className="text-right">Crédito (−)</TableHead> // [Línea 186] Abre o renderiza el componente visual <TableHead>.
                    <TableHead className="text-right">Saldo acumulado</TableHead> // [Línea 187] Abre o renderiza el componente visual <TableHead>.
                    <TableHead className="text-right">Ver</TableHead> // [Línea 188] Abre o renderiza el componente visual <TableHead>.
                  </TableRow> // [Línea 189] Cierra el componente visual </TableRow>.
                </TableHeader> // [Línea 190] Cierra el componente visual </TableHeader>.
                <TableBody> // [Línea 191] Abre o renderiza el componente visual <TableBody>.
                  // [Línea 192] Ejecuta o evalúa: {cuenta.movimientos.map((mov, indice) => (
                  {cuenta.movimientos.map((mov, indice) => (
                    <TableRow key={`${mov.fecha}-${indice}`}> // [Línea 193] Abre o renderiza el componente visual <TableRow>.
                      <TableCell className="text-xs text-muted-foreground"> // [Línea 194] Abre o renderiza el componente visual <TableCell>.
                        // [Línea 195] Ejecuta o evalúa: {formatearFechaHora(mov.fecha)}
                        {formatearFechaHora(mov.fecha)}
                      </TableCell> // [Línea 196] Cierra el componente visual </TableCell>.
                      <TableCell className="font-medium">{mov.descripcion}</TableCell> // [Línea 197] Abre o renderiza el componente visual <TableCell>.
                      <TableCell> // [Línea 198] Abre o renderiza el componente visual <TableCell>.
                        <Badge variant={mov.tipo === "debito" ? "warning" : "success"}> // [Línea 199] Abre o renderiza el componente visual <Badge>.
                          // [Línea 200] Ejecuta o evalúa: {mov.tipo === "debito" ? "Débito" : "Crédito"}
                          {mov.tipo === "debito" ? "Débito" : "Crédito"}
                        </Badge> // [Línea 201] Cierra el componente visual </Badge>.
                      </TableCell> // [Línea 202] Cierra el componente visual </TableCell>.
                      <TableCell className="text-right font-mono"> // [Línea 203] Abre o renderiza el componente visual <TableCell>.
                        // [Línea 204] Ejecuta o evalúa: {mov.tipo === "debito" ? formatearMoneda(mov.importe) : "—"}
                        {mov.tipo === "debito" ? formatearMoneda(mov.importe) : "—"}
                      </TableCell> // [Línea 205] Cierra el componente visual </TableCell>.
                      <TableCell className="text-right font-mono text-emerald-700"> // [Línea 206] Abre o renderiza el componente visual <TableCell>.
                        // [Línea 207] Ejecuta o evalúa: {mov.tipo === "credito" ? formatearMoneda(mov.importe) : "—"}
                        {mov.tipo === "credito" ? formatearMoneda(mov.importe) : "—"}
                      </TableCell> // [Línea 208] Cierra el componente visual </TableCell>.
                      <TableCell className="text-right font-mono font-semibold"> // [Línea 209] Abre o renderiza el componente visual <TableCell>.
                        // [Línea 210] Ejecuta o evalúa: {formatearMoneda(mov.saldo)}
                        {formatearMoneda(mov.saldo)}
                      </TableCell> // [Línea 211] Cierra el componente visual </TableCell>.
                      <TableCell className="text-right"> // [Línea 212] Abre o renderiza el componente visual <TableCell>.
                        // [Línea 213] Ejecuta o evalúa: {mov.facturaId && (
                        {mov.facturaId && (
                          <Link href={`/ventas/${mov.facturaId}`}> // [Línea 214] Abre o renderiza el componente visual <Link>.
                            <Button variant="outline" size="xs"> // [Línea 215] Abre o renderiza el componente visual <Button>.
                              <Eye className="size-3.5" /> // [Línea 216] Abre o renderiza el componente visual <Eye>.
                              // [Línea 217] Ejecuta o evalúa: Factura
                              Factura
                            </Button> // [Línea 218] Cierra el componente visual </Button>.
                          </Link> // [Línea 219] Cierra el componente visual </Link>.
                        // [Línea 220] Ejecuta o evalúa: )}
                        )}
                        // [Línea 221] Ejecuta o evalúa: {mov.pagoId && (
                        {mov.pagoId && (
                          <Link href={`/clientes/recibos/${mov.pagoId}`}> // [Línea 222] Abre o renderiza el componente visual <Link>.
                            <Button variant="outline" size="xs"> // [Línea 223] Abre o renderiza el componente visual <Button>.
                              <Eye className="size-3.5" /> // [Línea 224] Abre o renderiza el componente visual <Eye>.
                              // [Línea 225] Ejecuta o evalúa: Recibo
                              Recibo
                            </Button> // [Línea 226] Cierra el componente visual </Button>.
                          </Link> // [Línea 227] Cierra el componente visual </Link>.
                        // [Línea 228] Ejecuta o evalúa: )}
                        )}
                      </TableCell> // [Línea 229] Cierra el componente visual </TableCell>.
                    </TableRow> // [Línea 230] Cierra el componente visual </TableRow>.
                  // [Línea 231] Ejecuta o evalúa: ))}
                  ))}
                </TableBody> // [Línea 232] Cierra el componente visual </TableBody>.
              </Table> // [Línea 233] Cierra el componente visual </Table>.
            // [Línea 234] Ejecuta o evalúa: )}
            )}
          </CardContent> // [Línea 235] Cierra el componente visual </CardContent>.
        </Card> // [Línea 236] Cierra el componente visual </Card>.
      // [Línea 237] Ejecuta o evalúa: ) : (
      ) : (
        <Card> // [Línea 238] Abre o renderiza el componente visual <Card>.
          <CardHeader> // [Línea 239] Abre o renderiza el componente visual <CardHeader>.
            <CardTitle>Últimas facturas del cliente</CardTitle> // [Línea 240] Abre o renderiza el componente visual <CardTitle>.
            <CardDescription>Las 6 facturas más recientes registradas a su nombre</CardDescription> // [Línea 241] Abre o renderiza el componente visual <CardDescription>.
          </CardHeader> // [Línea 242] Cierra el componente visual </CardHeader>.
          <CardContent> // [Línea 243] Abre o renderiza el componente visual <CardContent>.
            // [Línea 244] Ejecuta o evalúa: {cliente.ultimasFacturas.length === 0 ? (
            {cliente.ultimasFacturas.length === 0 ? (
              <EstadoVacio titulo="El cliente aún no tiene facturas emitidas" /> // [Línea 245] Abre o renderiza el componente visual <EstadoVacio>.
            // [Línea 246] Ejecuta o evalúa: ) : (
            ) : (
              <Table> // [Línea 247] Abre o renderiza el componente visual <Table>.
                <TableHeader> // [Línea 248] Abre o renderiza el componente visual <TableHeader>.
                  <TableRow> // [Línea 249] Abre o renderiza el componente visual <TableRow>.
                    <TableHead>Número</TableHead> // [Línea 250] Abre o renderiza el componente visual <TableHead>.
                    <TableHead>Fecha y hora</TableHead> // [Línea 251] Abre o renderiza el componente visual <TableHead>.
                    <TableHead>Forma de pago</TableHead> // [Línea 252] Abre o renderiza el componente visual <TableHead>.
                    <TableHead>Estado</TableHead> // [Línea 253] Abre o renderiza el componente visual <TableHead>.
                    <TableHead className="text-right">Total</TableHead> // [Línea 254] Abre o renderiza el componente visual <TableHead>.
                    <TableHead className="text-right">Comprobante</TableHead> // [Línea 255] Abre o renderiza el componente visual <TableHead>.
                  </TableRow> // [Línea 256] Cierra el componente visual </TableRow>.
                </TableHeader> // [Línea 257] Cierra el componente visual </TableHeader>.
                <TableBody> // [Línea 258] Abre o renderiza el componente visual <TableBody>.
                  // [Línea 259] Ejecuta o evalúa: {cliente.ultimasFacturas.map((fac) => (
                  {cliente.ultimasFacturas.map((fac) => (
                    <TableRow key={fac.id}> // [Línea 260] Abre o renderiza el componente visual <TableRow>.
                      <TableCell className="font-mono font-medium"> // [Línea 261] Abre o renderiza el componente visual <TableCell>.
                        <Link // [Línea 262] Abre o renderiza el componente visual <Link>.
                          // [Línea 263] Ejecuta o evalúa: href={`/ventas/${fac.id}`}
                          href={`/ventas/${fac.id}`}
                          // [Línea 264] Ejecuta o evalúa: className="hover:text-primary hover:underline"
                          className="hover:text-primary hover:underline"
                        // [Línea 265] Ejecuta o evalúa: >
                        >
                          // [Línea 266] Ejecuta o evalúa: {fac.numeroFormateado}
                          {fac.numeroFormateado}
                        </Link> // [Línea 267] Cierra el componente visual </Link>.
                      </TableCell> // [Línea 268] Cierra el componente visual </TableCell>.
                      <TableCell className="text-xs text-muted-foreground"> // [Línea 269] Abre o renderiza el componente visual <TableCell>.
                        // [Línea 270] Ejecuta o evalúa: {formatearFechaHora(fac.fecha)}
                        {formatearFechaHora(fac.fecha)}
                      </TableCell> // [Línea 271] Cierra el componente visual </TableCell>.
                      <TableCell> // [Línea 272] Abre o renderiza el componente visual <TableCell>.
                        <InsigniaFormaPago forma={fac.formaPago} /> // [Línea 273] Abre o renderiza el componente visual <InsigniaFormaPago>.
                      </TableCell> // [Línea 274] Cierra el componente visual </TableCell>.
                      <TableCell> // [Línea 275] Abre o renderiza el componente visual <TableCell>.
                        <InsigniaEstadoFactura estado={fac.estado} /> // [Línea 276] Abre o renderiza el componente visual <InsigniaEstadoFactura>.
                      </TableCell> // [Línea 277] Cierra el componente visual </TableCell>.
                      <TableCell className="text-right font-mono font-semibold"> // [Línea 278] Abre o renderiza el componente visual <TableCell>.
                        // [Línea 279] Ejecuta o evalúa: {formatearMoneda(fac.total)}
                        {formatearMoneda(fac.total)}
                      </TableCell> // [Línea 280] Cierra el componente visual </TableCell>.
                      <TableCell className="text-right"> // [Línea 281] Abre o renderiza el componente visual <TableCell>.
                        <Link href={`/ventas/${fac.id}`}> // [Línea 282] Abre o renderiza el componente visual <Link>.
                          <Button variant="outline" size="xs"> // [Línea 283] Abre o renderiza el componente visual <Button>.
                            <Eye className="size-3.5" /> // [Línea 284] Abre o renderiza el componente visual <Eye>.
                            // [Línea 285] Ejecuta o evalúa: Ver
                            Ver
                          </Button> // [Línea 286] Cierra el componente visual </Button>.
                        </Link> // [Línea 287] Cierra el componente visual </Link>.
                      </TableCell> // [Línea 288] Cierra el componente visual </TableCell>.
                    </TableRow> // [Línea 289] Cierra el componente visual </TableRow>.
                  // [Línea 290] Ejecuta o evalúa: ))}
                  ))}
                </TableBody> // [Línea 291] Cierra el componente visual </TableBody>.
              </Table> // [Línea 292] Cierra el componente visual </Table>.
            // [Línea 293] Ejecuta o evalúa: )}
            )}
          </CardContent> // [Línea 294] Cierra el componente visual </CardContent>.
        </Card> // [Línea 295] Cierra el componente visual </Card>.
      // [Línea 296] Ejecuta o evalúa: )}
      )}
    </Pagina> // [Línea 297] Cierra el componente visual </Pagina>.
  // [Línea 298] Cierra el bloque o estructura ();).
  );
// [Línea 299] Cierra el bloque o estructura (}).
}
