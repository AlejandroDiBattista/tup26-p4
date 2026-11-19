// ============================================================================
// ARCHIVO COMENTADO LÍNEA POR LÍNEA PARA ESTUDIO Y DEFENSA DEL SEGUNDO PARCIAL
// ============================================================================
// Pantalla de FICHA DEL PRODUCTO con sus movimientos (/productos/[id]). RF-P4, RF-P5, RF-P6.
// [Línea 2] Importa elementos desde 'next/link'.
import Link from "next/link";
// [Línea 3] Importa elementos desde 'lucide-react'.
import { ArrowLeft } from "lucide-react";
// [Línea 4] Importa elementos desde '@/lib/sesion'.
import { exigirUsuarioPagina } from "@/lib/sesion";
// [Línea 5] Importa elementos desde '@/servicios/productos'.
import { obtenerProducto } from "@/servicios/productos";
// [Línea 6] Importa elementos desde '@/servicios/stock'.
import { listarMovimientosDeProducto } from "@/servicios/stock";
// [Línea 7] Importa elementos desde '@/servicios/categorias'.
import { listarCategorias } from "@/servicios/categorias";
// [Línea 8] Importa elementos desde '@/lib/formato'.
import { formatearFechaHora, formatearMoneda } from "@/lib/formato";
// [Línea 9] Importa elementos desde '@/componentes/ui/button'.
import { Button } from "@/componentes/ui/button";
// [Línea 10] Importa elementos desde '@/componentes/ui/card'.
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/componentes/ui/card";
// [Línea 11] Inicia un bloque de importación de dependencias.
import {
  // [Línea 12] Importa 'Table' desde el módulo.
  Table,
  // [Línea 13] Importa 'TableBody' desde el módulo.
  TableBody,
  // [Línea 14] Importa 'TableCell' desde el módulo.
  TableCell,
  // [Línea 15] Importa 'TableHead' desde el módulo.
  TableHead,
  // [Línea 16] Importa 'TableHeader' desde el módulo.
  TableHeader,
  // [Línea 17] Importa 'TableRow' desde el módulo.
  TableRow,
// [Línea 18] Cierra la lista de importaciones provenientes del módulo '@/componentes/ui/table'.
} from "@/componentes/ui/table";
// [Línea 19] Importa elementos desde '@/componentes/comunes/encabezado-pagina'.
import { EncabezadoPagina } from "@/componentes/comunes/encabezado-pagina";
// [Línea 20] Inicia un bloque de importación de dependencias.
import {
  // [Línea 21] Importa 'InsigniaActivo' desde el módulo.
  InsigniaActivo,
  // [Línea 22] Importa 'InsigniaStock' desde el módulo.
  InsigniaStock,
  // [Línea 23] Importa 'InsigniaTipoMovimiento' desde el módulo.
  InsigniaTipoMovimiento,
// [Línea 24] Cierra la lista de importaciones provenientes del módulo '@/componentes/comunes/insignias'.
} from "@/componentes/comunes/insignias";
// [Línea 25] Importa elementos desde '@/componentes/comunes/paginador'.
import { Paginador } from "@/componentes/comunes/paginador";
// [Línea 26] Importa elementos desde '@/componentes/comunes/estados'.
import { EstadoVacio } from "@/componentes/comunes/estados";
// [Línea 27] Inicia un bloque de importación de dependencias.
import {
  // [Línea 28] Importa 'BotonesEditarProducto' desde el módulo.
  BotonesEditarProducto,
  // [Línea 29] Importa 'BotonesMovimientoStock' desde el módulo.
  BotonesMovimientoStock,
// [Línea 30] Cierra la lista de importaciones provenientes del módulo '@/componentes/dominio/acciones-productos'.
} from "@/componentes/dominio/acciones-productos";
// [Línea 31] Importa elementos desde '@/componentes/primitivas/maquetacion'.
import { Alinear, Grilla, Pagina, Texto } from "@/componentes/primitivas/maquetacion";

// [Línea 33] Define el tipo de datos 'Props' en TypeScript.
type Props = {
  // [Línea 34] Define o asigna el campo/parámetro 'params'.
  params: Promise<{ id: string }>;
  // [Línea 35] Define o asigna el campo/parámetro 'searchParams'.
  searchParams: Promise<Record<string, string | undefined>>;
// [Línea 36] Cierra el bloque o estructura (};).
};

// [Línea 38] Server Component principal 'PaginaFichaProducto': se ejecuta en el servidor, consulta los servicios y devuelve el HTML.
export default async function PaginaFichaProducto({ params, searchParams }: Props) {
  // [Línea 39] Espera el resultado de la consulta/operación asíncrona y lo asigna a 'usuario'.
  const usuario = await exigirUsuarioPagina();
  // [Línea 40] Espera el resultado de la consulta/operación asíncrona y lo asigna a '{ id }'.
  const { id } = await params;
  // [Línea 41] Espera el resultado de la consulta/operación asíncrona y lo asigna a 'parametros'.
  const parametros = await searchParams;
  // [Línea 42] Declara 'idProducto' y le asigna el valor resultante.
  const idProducto = Number(id);
  // [Línea 43] Declara 'esAdmin' y le asigna el valor resultante.
  const esAdmin = usuario.rol === "admin";

  // [Línea 45] Espera el resultado de la consulta/operación asíncrona y lo asigna a '[producto, movimientos, categorias]'.
  const [producto, movimientos, categorias] = await Promise.all([
    // [Línea 46] Ejecuta o evalúa: obtenerProducto(usuario, idProducto),
    obtenerProducto(usuario, idProducto),
    // [Línea 47] Ejecuta o evalúa: listarMovimientosDeProducto(usuario, idProducto, parametros),
    listarMovimientosDeProducto(usuario, idProducto, parametros),
    // [Línea 48] Ejecuta o evalúa: listarCategorias(usuario),
    listarCategorias(usuario),
  // [Línea 49] Cierra el bloque o estructura (]);).
  ]);

  // [Línea 51] Devuelve la interfaz JSX que renderiza este componente.
  return (
    <Pagina> // [Línea 52] Abre o renderiza el componente visual <Pagina>.
      <EncabezadoPagina // [Línea 53] Abre o renderiza el componente visual <EncabezadoPagina>.
        // [Línea 54] Ejecuta o evalúa: titulo={`${producto.codigo} · ${producto.descripcion}`}
        titulo={`${producto.codigo} · ${producto.descripcion}`}
        // [Línea 55] Ejecuta o evalúa: subtitulo={`Categoría: ${producto.categoria.nombre}`}
        subtitulo={`Categoría: ${producto.categoria.nombre}`}
        // [Línea 56] Ejecuta o evalúa: acciones={
        acciones={
          <Alinear className="gap-2"> // [Línea 57] Abre o renderiza el componente visual <Alinear>.
            <Link href="/productos"> // [Línea 58] Abre o renderiza el componente visual <Link>.
              <Button variant="outline"> // [Línea 59] Abre o renderiza el componente visual <Button>.
                <ArrowLeft className="size-4" /> // [Línea 60] Abre o renderiza el componente visual <ArrowLeft>.
                // [Línea 61] Ejecuta o evalúa: Volver al catálogo
                Volver al catálogo
              </Button> // [Línea 62] Cierra el componente visual </Button>.
            </Link> // [Línea 63] Cierra el componente visual </Link>.
            // [Línea 64] Ejecuta o evalúa: {esAdmin && (
            {esAdmin && (
              <> // [Línea 65] Abre o renderiza el componente visual <elemento>.
                <BotonesMovimientoStock producto={producto} /> // [Línea 66] Abre o renderiza el componente visual <BotonesMovimientoStock>.
                <BotonesEditarProducto producto={producto} categorias={categorias} /> // [Línea 67] Abre o renderiza el componente visual <BotonesEditarProducto>.
              </> // [Línea 68] Cierra el componente visual </elemento>.
            // [Línea 69] Ejecuta o evalúa: )}
            )}
          </Alinear> // [Línea 70] Cierra el componente visual </Alinear>.
        // [Línea 71] Cierra el bloque o estructura (}).
        }
      // [Línea 72] Ejecuta o evalúa: />
      />

      // [Línea 74] Ejecuta o evalúa: {/* Tarjetas de resumen del producto */}
      {/* Tarjetas de resumen del producto */}
      <Grilla className="grid-cols-1 sm:grid-cols-4"> // [Línea 75] Abre o renderiza el componente visual <Grilla>.
        <Card> // [Línea 76] Abre o renderiza el componente visual <Card>.
          <CardHeader> // [Línea 77] Abre o renderiza el componente visual <CardHeader>.
            <CardDescription>Precio de venta</CardDescription> // [Línea 78] Abre o renderiza el componente visual <CardDescription>.
            <CardTitle className="text-2xl font-mono"> // [Línea 79] Abre o renderiza el componente visual <CardTitle>.
              // [Línea 80] Ejecuta o evalúa: {formatearMoneda(producto.precio)}
              {formatearMoneda(producto.precio)}
            </CardTitle> // [Línea 81] Cierra el componente visual </CardTitle>.
          </CardHeader> // [Línea 82] Cierra el componente visual </CardHeader>.
        </Card> // [Línea 83] Cierra el componente visual </Card>.

        <Card> // [Línea 85] Abre o renderiza el componente visual <Card>.
          <CardHeader> // [Línea 86] Abre o renderiza el componente visual <CardHeader>.
            <CardDescription>Existencia actual</CardDescription> // [Línea 87] Abre o renderiza el componente visual <CardDescription>.
            <CardTitle className="text-2xl font-mono">{producto.existencia} u.</CardTitle> // [Línea 88] Abre o renderiza el componente visual <CardTitle>.
          </CardHeader> // [Línea 89] Cierra el componente visual </CardHeader>.
        </Card> // [Línea 90] Cierra el componente visual </Card>.

        <Card> // [Línea 92] Abre o renderiza el componente visual <Card>.
          <CardHeader> // [Línea 93] Abre o renderiza el componente visual <CardHeader>.
            <CardDescription>Stock mínimo</CardDescription> // [Línea 94] Abre o renderiza el componente visual <CardDescription>.
            <CardTitle className="text-2xl font-mono">{producto.stockMinimo} u.</CardTitle> // [Línea 95] Abre o renderiza el componente visual <CardTitle>.
          </CardHeader> // [Línea 96] Cierra el componente visual </CardHeader>.
        </Card> // [Línea 97] Cierra el componente visual </Card>.

        <Card> // [Línea 99] Abre o renderiza el componente visual <Card>.
          <CardHeader> // [Línea 100] Abre o renderiza el componente visual <CardHeader>.
            <CardDescription>Estado</CardDescription> // [Línea 101] Abre o renderiza el componente visual <CardDescription>.
            <CardContent className="pt-1"> // [Línea 102] Abre o renderiza el componente visual <CardContent>.
              <Alinear className="gap-2"> // [Línea 103] Abre o renderiza el componente visual <Alinear>.
                <InsigniaStock // [Línea 104] Abre o renderiza el componente visual <InsigniaStock>.
                  // [Línea 105] Ejecuta o evalúa: existencia={producto.existencia}
                  existencia={producto.existencia}
                  // [Línea 106] Ejecuta o evalúa: stockMinimo={producto.stockMinimo}
                  stockMinimo={producto.stockMinimo}
                // [Línea 107] Ejecuta o evalúa: />
                />
                <InsigniaActivo activo={producto.activo} textoInactivo="Dado de baja" /> // [Línea 108] Abre o renderiza el componente visual <InsigniaActivo>.
              </Alinear> // [Línea 109] Cierra el componente visual </Alinear>.
            </CardContent> // [Línea 110] Cierra el componente visual </CardContent>.
          </CardHeader> // [Línea 111] Cierra el componente visual </CardHeader>.
        </Card> // [Línea 112] Cierra el componente visual </Card>.
      </Grilla> // [Línea 113] Cierra el componente visual </Grilla>.

      // [Línea 115] Ejecuta o evalúa: {/* RF-P6: Movimientos del producto */}
      {/* RF-P6: Movimientos del producto */}
      <Card> // [Línea 116] Abre o renderiza el componente visual <Card>.
        <CardHeader> // [Línea 117] Abre o renderiza el componente visual <CardHeader>.
          <CardTitle>Historial de movimientos de stock</CardTitle> // [Línea 118] Abre o renderiza el componente visual <CardTitle>.
          <CardDescription> // [Línea 119] Abre o renderiza el componente visual <CardDescription>.
            // [Línea 120] Ejecuta o evalúa: La suma de todos los movimientos coincide siempre con la existencia actual ({pro
            La suma de todos los movimientos coincide siempre con la existencia actual ({producto.existencia} u.)
          </CardDescription> // [Línea 121] Cierra el componente visual </CardDescription>.
        </CardHeader> // [Línea 122] Cierra el componente visual </CardHeader>.
        <CardContent> // [Línea 123] Abre o renderiza el componente visual <CardContent>.
          // [Línea 124] Ejecuta o evalúa: {movimientos.data.length === 0 ? (
          {movimientos.data.length === 0 ? (
            <EstadoVacio titulo="Este producto aún no registra movimientos de stock" /> // [Línea 125] Abre o renderiza el componente visual <EstadoVacio>.
          // [Línea 126] Ejecuta o evalúa: ) : (
          ) : (
            <> // [Línea 127] Abre o renderiza el componente visual <elemento>.
              <Table> // [Línea 128] Abre o renderiza el componente visual <Table>.
                <TableHeader> // [Línea 129] Abre o renderiza el componente visual <TableHeader>.
                  <TableRow> // [Línea 130] Abre o renderiza el componente visual <TableRow>.
                    <TableHead>Fecha y hora</TableHead> // [Línea 131] Abre o renderiza el componente visual <TableHead>.
                    <TableHead>Tipo</TableHead> // [Línea 132] Abre o renderiza el componente visual <TableHead>.
                    <TableHead className="text-right">Cantidad</TableHead> // [Línea 133] Abre o renderiza el componente visual <TableHead>.
                    <TableHead className="text-right">Existencia resultante</TableHead> // [Línea 134] Abre o renderiza el componente visual <TableHead>.
                    <TableHead>Motivo y observación</TableHead> // [Línea 135] Abre o renderiza el componente visual <TableHead>.
                    <TableHead>Factura asociada</TableHead> // [Línea 136] Abre o renderiza el componente visual <TableHead>.
                    <TableHead>Usuario</TableHead> // [Línea 137] Abre o renderiza el componente visual <TableHead>.
                  </TableRow> // [Línea 138] Cierra el componente visual </TableRow>.
                </TableHeader> // [Línea 139] Cierra el componente visual </TableHeader>.
                <TableBody> // [Línea 140] Abre o renderiza el componente visual <TableBody>.
                  // [Línea 141] Ejecuta o evalúa: {movimientos.data.map((mov) => (
                  {movimientos.data.map((mov) => (
                    <TableRow key={mov.id}> // [Línea 142] Abre o renderiza el componente visual <TableRow>.
                      <TableCell className="text-xs text-muted-foreground"> // [Línea 143] Abre o renderiza el componente visual <TableCell>.
                        // [Línea 144] Ejecuta o evalúa: {formatearFechaHora(mov.fecha)}
                        {formatearFechaHora(mov.fecha)}
                      </TableCell> // [Línea 145] Cierra el componente visual </TableCell>.
                      <TableCell> // [Línea 146] Abre o renderiza el componente visual <TableCell>.
                        <InsigniaTipoMovimiento tipo={mov.tipo} /> // [Línea 147] Abre o renderiza el componente visual <InsigniaTipoMovimiento>.
                      </TableCell> // [Línea 148] Cierra el componente visual </TableCell>.
                      <TableCell className="text-right font-mono font-semibold"> // [Línea 149] Abre o renderiza el componente visual <TableCell>.
                        <Texto tono={mov.cantidad > 0 ? "exito" : "peligro"}> // [Línea 150] Abre o renderiza el componente visual <Texto>.
                          // [Línea 151] Ejecuta o evalúa: {mov.cantidad > 0 ? `+${mov.cantidad}` : mov.cantidad}
                          {mov.cantidad > 0 ? `+${mov.cantidad}` : mov.cantidad}
                        </Texto> // [Línea 152] Cierra el componente visual </Texto>.
                      </TableCell> // [Línea 153] Cierra el componente visual </TableCell>.
                      <TableCell className="text-right font-mono"> // [Línea 154] Abre o renderiza el componente visual <TableCell>.
                        // [Línea 155] Ejecuta o evalúa: {mov.existenciaResultante}
                        {mov.existenciaResultante}
                      </TableCell> // [Línea 156] Cierra el componente visual </TableCell>.
                      <TableCell className="text-xs"> // [Línea 157] Abre o renderiza el componente visual <TableCell>.
                        // [Línea 158] Ejecuta o evalúa: {mov.motivo}
                        {mov.motivo}
                        // [Línea 159] Ejecuta o evalúa: {mov.observacion ? ` · ${mov.observacion}` : ""}
                        {mov.observacion ? ` · ${mov.observacion}` : ""}
                      </TableCell> // [Línea 160] Cierra el componente visual </TableCell>.
                      <TableCell> // [Línea 161] Abre o renderiza el componente visual <TableCell>.
                        // [Línea 162] Ejecuta o evalúa: {mov.referencia ? (
                        {mov.referencia ? (
                          <Link // [Línea 163] Abre o renderiza el componente visual <Link>.
                            // [Línea 164] Ejecuta o evalúa: href={`/ventas/${mov.referencia.facturaId}`}
                            href={`/ventas/${mov.referencia.facturaId}`}
                            // [Línea 165] Ejecuta o evalúa: className="font-mono text-xs text-primary hover:underline"
                            className="font-mono text-xs text-primary hover:underline"
                          // [Línea 166] Ejecuta o evalúa: >
                          >
                            // [Línea 167] Ejecuta o evalúa: {mov.referencia.numero}
                            {mov.referencia.numero}
                          </Link> // [Línea 168] Cierra el componente visual </Link>.
                        // [Línea 169] Ejecuta o evalúa: ) : (
                        ) : (
                          <Texto tono="suave" tamano="xs"> // [Línea 170] Abre o renderiza el componente visual <Texto>.
                            // [Línea 171] Ejecuta o evalúa: —
                            —
                          </Texto> // [Línea 172] Cierra el componente visual </Texto>.
                        // [Línea 173] Ejecuta o evalúa: )}
                        )}
                      </TableCell> // [Línea 174] Cierra el componente visual </TableCell>.
                      <TableCell className="text-xs">{mov.usuario.nombre}</TableCell> // [Línea 175] Abre o renderiza el componente visual <TableCell>.
                    </TableRow> // [Línea 176] Cierra el componente visual </TableRow>.
                  // [Línea 177] Ejecuta o evalúa: ))}
                  ))}
                </TableBody> // [Línea 178] Cierra el componente visual </TableBody>.
              </Table> // [Línea 179] Cierra el componente visual </Table>.

              <Paginador // [Línea 181] Abre o renderiza el componente visual <Paginador>.
                // [Línea 182] Ejecuta o evalúa: page={movimientos.page}
                page={movimientos.page}
                // [Línea 183] Ejecuta o evalúa: pageSize={movimientos.pageSize}
                pageSize={movimientos.pageSize}
                // [Línea 184] Ejecuta o evalúa: total={movimientos.total}
                total={movimientos.total}
              // [Línea 185] Ejecuta o evalúa: />
              />
            </> // [Línea 186] Cierra el componente visual </elemento>.
          // [Línea 187] Ejecuta o evalúa: )}
          )}
        </CardContent> // [Línea 188] Cierra el componente visual </CardContent>.
      </Card> // [Línea 189] Cierra el componente visual </Card>.
    </Pagina> // [Línea 190] Cierra el componente visual </Pagina>.
  // [Línea 191] Cierra el bloque o estructura ();).
  );
// [Línea 192] Cierra el bloque o estructura (}).
}
