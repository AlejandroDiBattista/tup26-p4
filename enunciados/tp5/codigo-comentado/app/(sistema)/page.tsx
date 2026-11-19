// ============================================================================
// ARCHIVO COMENTADO LÍNEA POR LÍNEA PARA ESTUDIO Y DEFENSA DEL SEGUNDO PARCIAL
// ============================================================================
// Pantalla de INICIO · Tablero de control (/). RF-T1, RF-T2, RF-T3.
// Server Component que llama directamente a los servicios (sección 10.6).
// [Línea 3] Importa elementos desde 'next/link'.
import Link from "next/link";
// [Línea 4] Importa elementos desde 'lucide-react'.
import { ShoppingCart, AlertTriangle, TrendingUp, Wallet, PackageCheck } from "lucide-react";
// [Línea 5] Importa elementos desde '@/lib/sesion'.
import { exigirUsuarioPagina } from "@/lib/sesion";
// [Línea 6] Importa elementos desde '@/servicios/tablero'.
import { obtenerTablero } from "@/servicios/tablero";
// [Línea 7] Importa elementos desde '@/servicios/productos'.
import { listarProductos } from "@/servicios/productos";
// [Línea 8] Importa elementos desde '@/lib/formato'.
import { formatearMoneda } from "@/lib/formato";
// [Línea 9] Importa elementos desde '@/componentes/ui/button'.
import { Button } from "@/componentes/ui/button";
// [Línea 10] Importa elementos desde '@/componentes/ui/badge'.
import { Badge } from "@/componentes/ui/badge";
// [Línea 11] Importa elementos desde '@/componentes/ui/card'.
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/componentes/ui/card";
// [Línea 12] Inicia un bloque de importación de dependencias.
import {
  // [Línea 13] Importa 'Table' desde el módulo.
  Table,
  // [Línea 14] Importa 'TableBody' desde el módulo.
  TableBody,
  // [Línea 15] Importa 'TableCell' desde el módulo.
  TableCell,
  // [Línea 16] Importa 'TableHead' desde el módulo.
  TableHead,
  // [Línea 17] Importa 'TableHeader' desde el módulo.
  TableHeader,
  // [Línea 18] Importa 'TableRow' desde el módulo.
  TableRow,
// [Línea 19] Cierra la lista de importaciones provenientes del módulo '@/componentes/ui/table'.
} from "@/componentes/ui/table";
// [Línea 20] Importa elementos desde '@/componentes/comunes/encabezado-pagina'.
import { EncabezadoPagina } from "@/componentes/comunes/encabezado-pagina";
// [Línea 21] Importa elementos desde '@/componentes/comunes/estados'.
import { EstadoVacio } from "@/componentes/comunes/estados";
// [Línea 22] Importa elementos desde '@/componentes/dominio/tablero-graficos'.
import { GraficosTablero } from "@/componentes/dominio/tablero-graficos";
// [Línea 23] Importa elementos desde '@/componentes/primitivas/maquetacion'.
import { Alinear, Apilar, Grilla, Pagina, Texto } from "@/componentes/primitivas/maquetacion";

// [Línea 25] Server Component principal 'PaginaTablero': se ejecuta en el servidor, consulta los servicios y devuelve el HTML.
export default async function PaginaTablero() {
  // [Línea 26] Espera el resultado de la consulta/operación asíncrona y lo asigna a 'usuario'.
  const usuario = await exigirUsuarioPagina();
  // [Línea 27] Espera el resultado de la consulta/operación asíncrona y lo asigna a 'datosTablero'.
  const datosTablero = await obtenerTablero(usuario);
  // [Línea 28] Espera el resultado de la consulta/operación asíncrona y lo asigna a 'productosBajoMinimo'.
  const productosBajoMinimo = await listarProductos(usuario, {
    // [Línea 29] Define o asigna el campo/parámetro 'bajoMinimo'.
    bajoMinimo: "true",
    // [Línea 30] Define o asigna el campo/parámetro 'pageSize'.
    pageSize: "6",
  // [Línea 31] Cierra el bloque o estructura (});).
  });

  // [Línea 33] Devuelve la interfaz JSX que renderiza este componente.
  return (
    <Pagina> // [Línea 34] Abre o renderiza el componente visual <Pagina>.
      <EncabezadoPagina // [Línea 35] Abre o renderiza el componente visual <EncabezadoPagina>.
        // [Línea 36] Ejecuta o evalúa: titulo="Tablero comercial"
        titulo="Tablero comercial"
        // [Línea 37] Ejecuta o evalúa: subtitulo="Resumen en tiempo real de ventas, cuentas corrientes y existencias cr
        subtitulo="Resumen en tiempo real de ventas, cuentas corrientes y existencias críticas"
        // [Línea 38] Ejecuta o evalúa: acciones={
        acciones={
          <Link href="/ventas/nueva"> // [Línea 39] Abre o renderiza el componente visual <Link>.
            <Button> // [Línea 40] Abre o renderiza el componente visual <Button>.
              <ShoppingCart className="size-4" /> // [Línea 41] Abre o renderiza el componente visual <ShoppingCart>.
              // [Línea 42] Ejecuta o evalúa: Nueva venta
              Nueva venta
            </Button> // [Línea 43] Cierra el componente visual </Button>.
          </Link> // [Línea 44] Cierra el componente visual </Link>.
        // [Línea 45] Cierra el bloque o estructura (}).
        }
      // [Línea 46] Ejecuta o evalúa: />
      />

      // [Línea 48] Ejecuta o evalúa: {/* RF-T1: 4 tarjetas de indicadores principales */}
      {/* RF-T1: 4 tarjetas de indicadores principales */}
      <Grilla className="grid-cols-1 sm:grid-cols-2 lg:grid-cols-4"> // [Línea 49] Abre o renderiza el componente visual <Grilla>.
        <Card> // [Línea 50] Abre o renderiza el componente visual <Card>.
          <CardHeader> // [Línea 51] Abre o renderiza el componente visual <CardHeader>.
            <Alinear className="justify-between"> // [Línea 52] Abre o renderiza el componente visual <Alinear>.
              <CardDescription>Ventas de hoy</CardDescription> // [Línea 53] Abre o renderiza el componente visual <CardDescription>.
              <TrendingUp className="size-4 text-primary" /> // [Línea 54] Abre o renderiza el componente visual <TrendingUp>.
            </Alinear> // [Línea 55] Cierra el componente visual </Alinear>.
            <CardTitle className="text-2xl font-mono"> // [Línea 56] Abre o renderiza el componente visual <CardTitle>.
              // [Línea 57] Ejecuta o evalúa: {formatearMoneda(datosTablero.hoy.importe)}
              {formatearMoneda(datosTablero.hoy.importe)}
            </CardTitle> // [Línea 58] Cierra el componente visual </CardTitle>.
          </CardHeader> // [Línea 59] Cierra el componente visual </CardHeader>.
          <CardContent> // [Línea 60] Abre o renderiza el componente visual <CardContent>.
            <Texto tamano="xs" tono="suave"> // [Línea 61] Abre o renderiza el componente visual <Texto>.
              // [Línea 62] Ejecuta o evalúa: {datosTablero.hoy.cantidad} facturas emitidas en el día
              {datosTablero.hoy.cantidad} facturas emitidas en el día
            </Texto> // [Línea 63] Cierra el componente visual </Texto>.
          </CardContent> // [Línea 64] Cierra el componente visual </CardContent>.
        </Card> // [Línea 65] Cierra el componente visual </Card>.

        <Card> // [Línea 67] Abre o renderiza el componente visual <Card>.
          <CardHeader> // [Línea 68] Abre o renderiza el componente visual <CardHeader>.
            <Alinear className="justify-between"> // [Línea 69] Abre o renderiza el componente visual <Alinear>.
              <CardDescription>Ventas del mes</CardDescription> // [Línea 70] Abre o renderiza el componente visual <CardDescription>.
              <PackageCheck className="size-4 text-primary" /> // [Línea 71] Abre o renderiza el componente visual <PackageCheck>.
            </Alinear> // [Línea 72] Cierra el componente visual </Alinear>.
            <CardTitle className="text-2xl font-mono"> // [Línea 73] Abre o renderiza el componente visual <CardTitle>.
              // [Línea 74] Ejecuta o evalúa: {formatearMoneda(datosTablero.mes.importe)}
              {formatearMoneda(datosTablero.mes.importe)}
            </CardTitle> // [Línea 75] Cierra el componente visual </CardTitle>.
          </CardHeader> // [Línea 76] Cierra el componente visual </CardHeader>.
          <CardContent> // [Línea 77] Abre o renderiza el componente visual <CardContent>.
            <Texto tamano="xs" tono="suave"> // [Línea 78] Abre o renderiza el componente visual <Texto>.
              // [Línea 79] Ejecuta o evalúa: {datosTablero.mes.cantidad} ventas · Ticket prom.{" "}
              {datosTablero.mes.cantidad} ventas · Ticket prom.{" "}
              // [Línea 80] Ejecuta o evalúa: {formatearMoneda(datosTablero.mes.ticketPromedio)}
              {formatearMoneda(datosTablero.mes.ticketPromedio)}
            </Texto> // [Línea 81] Cierra el componente visual </Texto>.
          </CardContent> // [Línea 82] Cierra el componente visual </CardContent>.
        </Card> // [Línea 83] Cierra el componente visual </Card>.

        <Card> // [Línea 85] Abre o renderiza el componente visual <Card>.
          <CardHeader> // [Línea 86] Abre o renderiza el componente visual <CardHeader>.
            <Alinear className="justify-between"> // [Línea 87] Abre o renderiza el componente visual <Alinear>.
              <CardDescription>Total adeudado (Cta. Cte.)</CardDescription> // [Línea 88] Abre o renderiza el componente visual <CardDescription>.
              <Wallet className="size-4 text-amber-600" /> // [Línea 89] Abre o renderiza el componente visual <Wallet>.
            </Alinear> // [Línea 90] Cierra el componente visual </Alinear>.
            <CardTitle className="text-2xl font-mono"> // [Línea 91] Abre o renderiza el componente visual <CardTitle>.
              // [Línea 92] Ejecuta o evalúa: {formatearMoneda(datosTablero.cuentasCorrientes.totalAdeudado)}
              {formatearMoneda(datosTablero.cuentasCorrientes.totalAdeudado)}
            </CardTitle> // [Línea 93] Cierra el componente visual </CardTitle>.
          </CardHeader> // [Línea 94] Cierra el componente visual </CardHeader>.
          <CardContent> // [Línea 95] Abre o renderiza el componente visual <CardContent>.
            <Alinear className="justify-between"> // [Línea 96] Abre o renderiza el componente visual <Alinear>.
              <Texto tamano="xs" tono="suave"> // [Línea 97] Abre o renderiza el componente visual <Texto>.
                // [Línea 98] Ejecuta o evalúa: {datosTablero.cuentasCorrientes.clientesConSaldo} clientes con saldo
                {datosTablero.cuentasCorrientes.clientesConSaldo} clientes con saldo
              </Texto> // [Línea 99] Cierra el componente visual </Texto>.
              <Link href="/clientes/saldos"> // [Línea 100] Abre o renderiza el componente visual <Link>.
                <Texto tamano="xs" negrita className="text-primary hover:underline"> // [Línea 101] Abre o renderiza el componente visual <Texto>.
                  // [Línea 102] Ejecuta o evalúa: Ver saldos →
                  Ver saldos →
                </Texto> // [Línea 103] Cierra el componente visual </Texto>.
              </Link> // [Línea 104] Cierra el componente visual </Link>.
            </Alinear> // [Línea 105] Cierra el componente visual </Alinear>.
          </CardContent> // [Línea 106] Cierra el componente visual </CardContent>.
        </Card> // [Línea 107] Cierra el componente visual </Card>.

        <Card> // [Línea 109] Abre o renderiza el componente visual <Card>.
          <CardHeader> // [Línea 110] Abre o renderiza el componente visual <CardHeader>.
            <Alinear className="justify-between"> // [Línea 111] Abre o renderiza el componente visual <Alinear>.
              <CardDescription>Productos bajo mínimo</CardDescription> // [Línea 112] Abre o renderiza el componente visual <CardDescription>.
              <AlertTriangle className="size-4 text-red-600" /> // [Línea 113] Abre o renderiza el componente visual <AlertTriangle>.
            </Alinear> // [Línea 114] Cierra el componente visual </Alinear>.
            <CardTitle className="text-2xl font-mono"> // [Línea 115] Abre o renderiza el componente visual <CardTitle>.
              // [Línea 116] Ejecuta o evalúa: {datosTablero.bajoMinimo.cantidad}
              {datosTablero.bajoMinimo.cantidad}
            </CardTitle> // [Línea 117] Cierra el componente visual </CardTitle>.
          </CardHeader> // [Línea 118] Cierra el componente visual </CardHeader>.
          <CardContent> // [Línea 119] Abre o renderiza el componente visual <CardContent>.
            <Alinear className="justify-between"> // [Línea 120] Abre o renderiza el componente visual <Alinear>.
              <Texto tamano="xs" tono="suave"> // [Línea 121] Abre o renderiza el componente visual <Texto>.
                // [Línea 122] Ejecuta o evalúa: Requieren reposición de stock
                Requieren reposición de stock
              </Texto> // [Línea 123] Cierra el componente visual </Texto>.
              <Link href="/productos?bajoMinimo=true"> // [Línea 124] Abre o renderiza el componente visual <Link>.
                <Texto tamano="xs" negrita className="text-primary hover:underline"> // [Línea 125] Abre o renderiza el componente visual <Texto>.
                  // [Línea 126] Ejecuta o evalúa: Ver catálogo →
                  Ver catálogo →
                </Texto> // [Línea 127] Cierra el componente visual </Texto>.
              </Link> // [Línea 128] Cierra el componente visual </Link>.
            </Alinear> // [Línea 129] Cierra el componente visual </Alinear>.
          </CardContent> // [Línea 130] Cierra el componente visual </CardContent>.
        </Card> // [Línea 131] Cierra el componente visual </Card>.
      </Grilla> // [Línea 132] Cierra el componente visual </Grilla>.

      // [Línea 134] Ejecuta o evalúa: {/* RF-T2: Gráficos de ventas de los últimos 30 días y ventas por forma de pago 
      {/* RF-T2: Gráficos de ventas de los últimos 30 días y ventas por forma de pago */}
      <GraficosTablero // [Línea 135] Abre o renderiza el componente visual <GraficosTablero>.
        // [Línea 136] Ejecuta o evalúa: ventasDiarias={datosTablero.ventasDiarias}
        ventasDiarias={datosTablero.ventasDiarias}
        // [Línea 137] Ejecuta o evalúa: porFormaDePago={datosTablero.porFormaDePago}
        porFormaDePago={datosTablero.porFormaDePago}
      // [Línea 138] Ejecuta o evalúa: />
      />

      // [Línea 140] Ejecuta o evalúa: {/* RF-T3: Los 5 productos más vendidos del mes + Productos para reponer */}
      {/* RF-T3: Los 5 productos más vendidos del mes + Productos para reponer */}
      <Grilla className="grid-cols-1 lg:grid-cols-2"> // [Línea 141] Abre o renderiza el componente visual <Grilla>.
        <Card> // [Línea 142] Abre o renderiza el componente visual <Card>.
          <CardHeader> // [Línea 143] Abre o renderiza el componente visual <CardHeader>.
            <CardTitle>5 productos más vendidos del mes</CardTitle> // [Línea 144] Abre o renderiza el componente visual <CardTitle>.
            <CardDescription>Ordenados por cantidad de unidades vendidas</CardDescription> // [Línea 145] Abre o renderiza el componente visual <CardDescription>.
          </CardHeader> // [Línea 146] Cierra el componente visual </CardHeader>.
          <CardContent> // [Línea 147] Abre o renderiza el componente visual <CardContent>.
            // [Línea 148] Ejecuta o evalúa: {datosTablero.masVendidos.length === 0 ? (
            {datosTablero.masVendidos.length === 0 ? (
              <EstadoVacio titulo="Sin ventas registradas en el mes" /> // [Línea 149] Abre o renderiza el componente visual <EstadoVacio>.
            // [Línea 150] Ejecuta o evalúa: ) : (
            ) : (
              <Table> // [Línea 151] Abre o renderiza el componente visual <Table>.
                <TableHeader> // [Línea 152] Abre o renderiza el componente visual <TableHeader>.
                  <TableRow> // [Línea 153] Abre o renderiza el componente visual <TableRow>.
                    <TableHead>Código</TableHead> // [Línea 154] Abre o renderiza el componente visual <TableHead>.
                    <TableHead>Producto</TableHead> // [Línea 155] Abre o renderiza el componente visual <TableHead>.
                    <TableHead className="text-right">Unidades</TableHead> // [Línea 156] Abre o renderiza el componente visual <TableHead>.
                    <TableHead className="text-right">Importe</TableHead> // [Línea 157] Abre o renderiza el componente visual <TableHead>.
                  </TableRow> // [Línea 158] Cierra el componente visual </TableRow>.
                </TableHeader> // [Línea 159] Cierra el componente visual </TableHeader>.
                <TableBody> // [Línea 160] Abre o renderiza el componente visual <TableBody>.
                  // [Línea 161] Ejecuta o evalúa: {datosTablero.masVendidos.map((item) => (
                  {datosTablero.masVendidos.map((item) => (
                    <TableRow key={item.productoId}> // [Línea 162] Abre o renderiza el componente visual <TableRow>.
                      <TableCell className="font-mono text-xs">{item.codigo}</TableCell> // [Línea 163] Abre o renderiza el componente visual <TableCell>.
                      <TableCell> // [Línea 164] Abre o renderiza el componente visual <TableCell>.
                        <Link // [Línea 165] Abre o renderiza el componente visual <Link>.
                          // [Línea 166] Ejecuta o evalúa: href={`/productos/${item.productoId}`}
                          href={`/productos/${item.productoId}`}
                          // [Línea 167] Ejecuta o evalúa: className="font-medium hover:text-primary hover:underline"
                          className="font-medium hover:text-primary hover:underline"
                        // [Línea 168] Ejecuta o evalúa: >
                        >
                          // [Línea 169] Ejecuta o evalúa: {item.descripcion}
                          {item.descripcion}
                        </Link> // [Línea 170] Cierra el componente visual </Link>.
                      </TableCell> // [Línea 171] Cierra el componente visual </TableCell>.
                      <TableCell className="text-right font-mono font-semibold"> // [Línea 172] Abre o renderiza el componente visual <TableCell>.
                        // [Línea 173] Ejecuta o evalúa: {item.unidades}
                        {item.unidades}
                      </TableCell> // [Línea 174] Cierra el componente visual </TableCell>.
                      <TableCell className="text-right font-mono"> // [Línea 175] Abre o renderiza el componente visual <TableCell>.
                        // [Línea 176] Ejecuta o evalúa: {formatearMoneda(item.importe)}
                        {formatearMoneda(item.importe)}
                      </TableCell> // [Línea 177] Cierra el componente visual </TableCell>.
                    </TableRow> // [Línea 178] Cierra el componente visual </TableRow>.
                  // [Línea 179] Ejecuta o evalúa: ))}
                  ))}
                </TableBody> // [Línea 180] Cierra el componente visual </TableBody>.
              </Table> // [Línea 181] Cierra el componente visual </Table>.
            // [Línea 182] Ejecuta o evalúa: )}
            )}
          </CardContent> // [Línea 183] Cierra el componente visual </CardContent>.
        </Card> // [Línea 184] Cierra el componente visual </Card>.

        <Card> // [Línea 186] Abre o renderiza el componente visual <Card>.
          <CardHeader> // [Línea 187] Abre o renderiza el componente visual <CardHeader>.
            <Alinear className="justify-between"> // [Línea 188] Abre o renderiza el componente visual <Alinear>.
              <Apilar className="gap-0.5"> // [Línea 189] Abre o renderiza el componente visual <Apilar>.
                <CardTitle>Alertas de stock bajo mínimo</CardTitle> // [Línea 190] Abre o renderiza el componente visual <CardTitle>.
                <CardDescription> // [Línea 191] Abre o renderiza el componente visual <CardDescription>.
                  // [Línea 192] Ejecuta o evalúa: Productos cuya existencia actual está por debajo del mínimo configurado
                  Productos cuya existencia actual está por debajo del mínimo configurado
                </CardDescription> // [Línea 193] Cierra el componente visual </CardDescription>.
              </Apilar> // [Línea 194] Cierra el componente visual </Apilar>.
              <Link href="/productos?bajoMinimo=true"> // [Línea 195] Abre o renderiza el componente visual <Link>.
                <Button variant="outline" size="xs"> // [Línea 196] Abre o renderiza el componente visual <Button>.
                  // [Línea 197] Ejecuta o evalúa: Ver todos
                  Ver todos
                </Button> // [Línea 198] Cierra el componente visual </Button>.
              </Link> // [Línea 199] Cierra el componente visual </Link>.
            </Alinear> // [Línea 200] Cierra el componente visual </Alinear>.
          </CardHeader> // [Línea 201] Cierra el componente visual </CardHeader>.
          <CardContent> // [Línea 202] Abre o renderiza el componente visual <CardContent>.
            // [Línea 203] Ejecuta o evalúa: {productosBajoMinimo.data.length === 0 ? (
            {productosBajoMinimo.data.length === 0 ? (
              <EstadoVacio // [Línea 204] Abre o renderiza el componente visual <EstadoVacio>.
                // [Línea 205] Ejecuta o evalúa: titulo="Todo el catálogo tiene stock suficiente"
                titulo="Todo el catálogo tiene stock suficiente"
                // [Línea 206] Ejecuta o evalúa: descripcion="Ningún producto activo se encuentra bajo el stock mínimo."
                descripcion="Ningún producto activo se encuentra bajo el stock mínimo."
              // [Línea 207] Ejecuta o evalúa: />
              />
            // [Línea 208] Ejecuta o evalúa: ) : (
            ) : (
              <Table> // [Línea 209] Abre o renderiza el componente visual <Table>.
                <TableHeader> // [Línea 210] Abre o renderiza el componente visual <TableHeader>.
                  <TableRow> // [Línea 211] Abre o renderiza el componente visual <TableRow>.
                    <TableHead>Código</TableHead> // [Línea 212] Abre o renderiza el componente visual <TableHead>.
                    <TableHead>Descripción</TableHead> // [Línea 213] Abre o renderiza el componente visual <TableHead>.
                    <TableHead className="text-right">Existencia</TableHead> // [Línea 214] Abre o renderiza el componente visual <TableHead>.
                    <TableHead className="text-right">Mínimo</TableHead> // [Línea 215] Abre o renderiza el componente visual <TableHead>.
                  </TableRow> // [Línea 216] Cierra el componente visual </TableRow>.
                </TableHeader> // [Línea 217] Cierra el componente visual </TableHeader>.
                <TableBody> // [Línea 218] Abre o renderiza el componente visual <TableBody>.
                  // [Línea 219] Ejecuta o evalúa: {productosBajoMinimo.data.map((prod) => (
                  {productosBajoMinimo.data.map((prod) => (
                    <TableRow key={prod.id}> // [Línea 220] Abre o renderiza el componente visual <TableRow>.
                      <TableCell className="font-mono text-xs">{prod.codigo}</TableCell> // [Línea 221] Abre o renderiza el componente visual <TableCell>.
                      <TableCell> // [Línea 222] Abre o renderiza el componente visual <TableCell>.
                        <Link // [Línea 223] Abre o renderiza el componente visual <Link>.
                          // [Línea 224] Ejecuta o evalúa: href={`/productos/${prod.id}`}
                          href={`/productos/${prod.id}`}
                          // [Línea 225] Ejecuta o evalúa: className="font-medium hover:text-primary hover:underline"
                          className="font-medium hover:text-primary hover:underline"
                        // [Línea 226] Ejecuta o evalúa: >
                        >
                          // [Línea 227] Ejecuta o evalúa: {prod.descripcion}
                          {prod.descripcion}
                        </Link> // [Línea 228] Cierra el componente visual </Link>.
                      </TableCell> // [Línea 229] Cierra el componente visual </TableCell>.
                      <TableCell className="text-right"> // [Línea 230] Abre o renderiza el componente visual <TableCell>.
                        <Badge variant="warning" className="font-mono"> // [Línea 231] Abre o renderiza el componente visual <Badge>.
                          // [Línea 232] Ejecuta o evalúa: {prod.existencia}
                          {prod.existencia}
                        </Badge> // [Línea 233] Cierra el componente visual </Badge>.
                      </TableCell> // [Línea 234] Cierra el componente visual </TableCell>.
                      <TableCell className="text-right font-mono text-muted-foreground"> // [Línea 235] Abre o renderiza el componente visual <TableCell>.
                        // [Línea 236] Ejecuta o evalúa: {prod.stockMinimo}
                        {prod.stockMinimo}
                      </TableCell> // [Línea 237] Cierra el componente visual </TableCell>.
                    </TableRow> // [Línea 238] Cierra el componente visual </TableRow>.
                  // [Línea 239] Ejecuta o evalúa: ))}
                  ))}
                </TableBody> // [Línea 240] Cierra el componente visual </TableBody>.
              </Table> // [Línea 241] Cierra el componente visual </Table>.
            // [Línea 242] Ejecuta o evalúa: )}
            )}
          </CardContent> // [Línea 243] Cierra el componente visual </CardContent>.
        </Card> // [Línea 244] Cierra el componente visual </Card>.
      </Grilla> // [Línea 245] Cierra el componente visual </Grilla>.
    </Pagina> // [Línea 246] Cierra el componente visual </Pagina>.
  // [Línea 247] Cierra el bloque o estructura ();).
  );
// [Línea 248] Cierra el bloque o estructura (}).
}
