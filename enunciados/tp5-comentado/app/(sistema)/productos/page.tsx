// ============================================================================
// ARCHIVO COMENTADO LÍNEA POR LÍNEA PARA ESTUDIO Y DEFENSA DEL SEGUNDO PARCIAL
// ============================================================================
// Pantalla de PRODUCTOS (/productos) con dos pestañas (sección 4):
// 1. "Catálogo": listado paginado con búsqueda, filtro por categoría y marca de bajo mínimo (RF-P1).
// 2. "Existencias y movimientos": historial de todos los movimientos de stock (RF-P6).
// [Línea 4] Importa elementos desde 'next/link'.
import Link from "next/link";
// [Línea 5] Importa elementos desde 'lucide-react'.
import { Eye, Tags } from "lucide-react";
// [Línea 6] Importa elementos desde '@/lib/sesion'.
import { exigirUsuarioPagina } from "@/lib/sesion";
// [Línea 7] Importa elementos desde '@/servicios/productos'.
import { listarProductos } from "@/servicios/productos";
// [Línea 8] Importa elementos desde '@/servicios/categorias'.
import { listarCategorias } from "@/servicios/categorias";
// [Línea 9] Importa elementos desde '@/servicios/stock'.
import { listarMovimientosStock } from "@/servicios/stock";
// [Línea 10] Importa elementos desde '@/lib/formato'.
import { formatearFechaHora, formatearMoneda } from "@/lib/formato";
// [Línea 11] Importa elementos desde '@/componentes/ui/button'.
import { Button } from "@/componentes/ui/button";
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
// [Línea 21] Importa elementos desde '@/componentes/comunes/filtros-url'.
import { BarraFiltrosUrl } from "@/componentes/comunes/filtros-url";
// [Línea 22] Inicia un bloque de importación de dependencias.
import {
  // [Línea 23] Importa 'InsigniaActivo' desde el módulo.
  InsigniaActivo,
  // [Línea 24] Importa 'InsigniaStock' desde el módulo.
  InsigniaStock,
  // [Línea 25] Importa 'InsigniaTipoMovimiento' desde el módulo.
  InsigniaTipoMovimiento,
// [Línea 26] Cierra la lista de importaciones provenientes del módulo '@/componentes/comunes/insignias'.
} from "@/componentes/comunes/insignias";
// [Línea 27] Importa elementos desde '@/componentes/comunes/paginador'.
import { Paginador } from "@/componentes/comunes/paginador";
// [Línea 28] Importa elementos desde '@/componentes/comunes/estados'.
import { EstadoVacio } from "@/componentes/comunes/estados";
// [Línea 29] Inicia un bloque de importación de dependencias.
import {
  // [Línea 30] Importa 'BotonNuevoProducto' desde el módulo.
  BotonNuevoProducto,
  // [Línea 31] Importa 'BotonesEditarProducto' desde el módulo.
  BotonesEditarProducto,
  // [Línea 32] Importa 'BotonesMovimientoStock' desde el módulo.
  BotonesMovimientoStock,
// [Línea 33] Cierra la lista de importaciones provenientes del módulo '@/componentes/dominio/acciones-productos'.
} from "@/componentes/dominio/acciones-productos";
// [Línea 34] Importa elementos desde '@/componentes/primitivas/maquetacion'.
import { Alinear, Pagina, Texto } from "@/componentes/primitivas/maquetacion";

// [Línea 36] Define el tipo de datos 'Props' en TypeScript.
type Props = { searchParams: Promise<Record<string, string | undefined>> };

// [Línea 38] Server Component principal 'PaginaProductos': se ejecuta en el servidor, consulta los servicios y devuelve el HTML.
export default async function PaginaProductos({ searchParams }: Props) {
  // [Línea 39] Espera el resultado de la consulta/operación asíncrona y lo asigna a 'usuario'.
  const usuario = await exigirUsuarioPagina();
  // [Línea 40] Espera el resultado de la consulta/operación asíncrona y lo asigna a 'parametros'.
  const parametros = await searchParams;
  // [Línea 41] Declara 'esAdmin' y le asigna el valor resultante.
  const esAdmin = usuario.rol === "admin";
  // [Línea 42] Declara 'pestana' y le asigna el valor resultante.
  const pestana = parametros.vista === "existencias" ? "existencias" : "catalogo";

  // [Línea 44] Espera el resultado de la consulta/operación asíncrona y lo asigna a 'listaCategorias'.
  const listaCategorias = await listarCategorias(usuario);

  // [Línea 46] Verifica la condición: if (pestana === "existencias") {
  if (pestana === "existencias") {
    // [Línea 47] Espera el resultado de la consulta/operación asíncrona y lo asigna a '[movimientos, todosLosProductos]'.
    const [movimientos, todosLosProductos] = await Promise.all([
      // [Línea 48] Ejecuta o evalúa: listarMovimientosStock(usuario, parametros),
      listarMovimientosStock(usuario, parametros),
      // [Línea 49] Ejecuta o evalúa: listarProductos(usuario, { pageSize: "100" }),
      listarProductos(usuario, { pageSize: "100" }),
    // [Línea 50] Cierra el bloque o estructura (]);).
    ]);

    // [Línea 52] Devuelve la interfaz JSX que renderiza este componente.
    return (
      <Pagina> // [Línea 53] Abre o renderiza el componente visual <Pagina>.
        <EncabezadoPagina // [Línea 54] Abre o renderiza el componente visual <EncabezadoPagina>.
          // [Línea 55] Ejecuta o evalúa: titulo="Productos y existencias"
          titulo="Productos y existencias"
          // [Línea 56] Ejecuta o evalúa: subtitulo="Auditoría de ingresos, egresos, ventas y anulaciones de stock"
          subtitulo="Auditoría de ingresos, egresos, ventas y anulaciones de stock"
          // [Línea 57] Ejecuta o evalúa: acciones={
          acciones={
            <Alinear className="gap-2"> // [Línea 58] Abre o renderiza el componente visual <Alinear>.
              <Link href="/productos/categorias"> // [Línea 59] Abre o renderiza el componente visual <Link>.
                <Button variant="outline"> // [Línea 60] Abre o renderiza el componente visual <Button>.
                  <Tags className="size-4" /> // [Línea 61] Abre o renderiza el componente visual <Tags>.
                  // [Línea 62] Ejecuta o evalúa: Categorías
                  Categorías
                </Button> // [Línea 63] Cierra el componente visual </Button>.
              </Link> // [Línea 64] Cierra el componente visual </Link>.
              // [Línea 65] Ejecuta o evalúa: {esAdmin && <BotonNuevoProducto categorias={listaCategorias} />}
              {esAdmin && <BotonNuevoProducto categorias={listaCategorias} />}
            </Alinear> // [Línea 66] Cierra el componente visual </Alinear>.
          // [Línea 67] Cierra el bloque o estructura (}).
          }
        // [Línea 68] Ejecuta o evalúa: />
        />

        // [Línea 70] Ejecuta o evalúa: {/* Pestañas Catálogo / Existencias */}
        {/* Pestañas Catálogo / Existencias */}
        <Alinear className="gap-2 border-b border-border pb-2"> // [Línea 71] Abre o renderiza el componente visual <Alinear>.
          <Link href="/productos"> // [Línea 72] Abre o renderiza el componente visual <Link>.
            <Button variant="ghost" size="sm"> // [Línea 73] Abre o renderiza el componente visual <Button>.
              // [Línea 74] Ejecuta o evalúa: Catálogo de productos
              Catálogo de productos
            </Button> // [Línea 75] Cierra el componente visual </Button>.
          </Link> // [Línea 76] Cierra el componente visual </Link>.
          <Link href="/productos?vista=existencias"> // [Línea 77] Abre o renderiza el componente visual <Link>.
            <Button variant="default" size="sm"> // [Línea 78] Abre o renderiza el componente visual <Button>.
              // [Línea 79] Ejecuta o evalúa: Existencias y movimientos
              Existencias y movimientos
            </Button> // [Línea 80] Cierra el componente visual </Button>.
          </Link> // [Línea 81] Cierra el componente visual </Link>.
        </Alinear> // [Línea 82] Cierra el componente visual </Alinear>.

        <BarraFiltrosUrl // [Línea 84] Abre o renderiza el componente visual <BarraFiltrosUrl>.
          // [Línea 85] Ejecuta o evalúa: mostrarBusqueda={false}
          mostrarBusqueda={false}
          // [Línea 86] Ejecuta o evalúa: filtros={[
          filtros={[
            // [Línea 87] Ejecuta o evalúa: {
            {
              // [Línea 88] Define o asigna el campo/parámetro 'nombre'.
              nombre: "productoId",
              // [Línea 89] Define o asigna el campo/parámetro 'etiqueta'.
              etiqueta: "Todos los productos",
              // [Línea 90] Define o asigna el campo/parámetro 'opciones'.
              opciones: todosLosProductos.data.map((p) => ({
                // [Línea 91] Define o asigna el campo/parámetro 'valor'.
                valor: String(p.id),
                // [Línea 92] Define o asigna el campo/parámetro 'texto'.
                texto: `${p.codigo} · ${p.descripcion}`,
              // [Línea 93] Ejecuta o evalúa: })),
              })),
            // [Línea 94] Cierra el bloque o estructura (},).
            },
            // [Línea 95] Ejecuta o evalúa: {
            {
              // [Línea 96] Define o asigna el campo/parámetro 'nombre'.
              nombre: "tipo",
              // [Línea 97] Define o asigna el campo/parámetro 'etiqueta'.
              etiqueta: "Todos los tipos",
              // [Línea 98] Define o asigna el campo/parámetro 'opciones'.
              opciones: [
                // [Línea 99] Ejecuta o evalúa: { valor: "venta", texto: "Venta" },
                { valor: "venta", texto: "Venta" },
                // [Línea 100] Ejecuta o evalúa: { valor: "anulacion", texto: "Anulación" },
                { valor: "anulacion", texto: "Anulación" },
                // [Línea 101] Ejecuta o evalúa: { valor: "ingreso", texto: "Ingreso manual" },
                { valor: "ingreso", texto: "Ingreso manual" },
                // [Línea 102] Ejecuta o evalúa: { valor: "egreso", texto: "Egreso manual" },
                { valor: "egreso", texto: "Egreso manual" },
              // [Línea 103] Ejecuta o evalúa: ],
              ],
            // [Línea 104] Cierra el bloque o estructura (},).
            },
            // [Línea 105] Ejecuta o evalúa: { nombre: "desde", etiqueta: "Desde fecha", tipo: "fecha" },
            { nombre: "desde", etiqueta: "Desde fecha", tipo: "fecha" },
            // [Línea 106] Ejecuta o evalúa: { nombre: "hasta", etiqueta: "Hasta fecha", tipo: "fecha" },
            { nombre: "hasta", etiqueta: "Hasta fecha", tipo: "fecha" },
          // [Línea 107] Ejecuta o evalúa: ]}
          ]}
        // [Línea 108] Ejecuta o evalúa: />
        />

        // [Línea 110] Ejecuta o evalúa: {movimientos.data.length === 0 ? (
        {movimientos.data.length === 0 ? (
          <EstadoVacio // [Línea 111] Abre o renderiza el componente visual <EstadoVacio>.
            // [Línea 112] Ejecuta o evalúa: titulo="No hay movimientos de stock para este filtro"
            titulo="No hay movimientos de stock para este filtro"
            // [Línea 113] Ejecuta o evalúa: descripcion="Probá cambiando el producto, tipo o rango de fechas."
            descripcion="Probá cambiando el producto, tipo o rango de fechas."
          // [Línea 114] Ejecuta o evalúa: />
          />
        // [Línea 115] Ejecuta o evalúa: ) : (
        ) : (
          <> // [Línea 116] Abre o renderiza el componente visual <elemento>.
            <Table> // [Línea 117] Abre o renderiza el componente visual <Table>.
              <TableHeader> // [Línea 118] Abre o renderiza el componente visual <TableHeader>.
                <TableRow> // [Línea 119] Abre o renderiza el componente visual <TableRow>.
                  <TableHead>Fecha y hora</TableHead> // [Línea 120] Abre o renderiza el componente visual <TableHead>.
                  <TableHead>Producto</TableHead> // [Línea 121] Abre o renderiza el componente visual <TableHead>.
                  <TableHead>Tipo</TableHead> // [Línea 122] Abre o renderiza el componente visual <TableHead>.
                  <TableHead className="text-right">Cantidad</TableHead> // [Línea 123] Abre o renderiza el componente visual <TableHead>.
                  <TableHead className="text-right">Existencia result.</TableHead> // [Línea 124] Abre o renderiza el componente visual <TableHead>.
                  <TableHead>Motivo / Observación</TableHead> // [Línea 125] Abre o renderiza el componente visual <TableHead>.
                  <TableHead>Factura</TableHead> // [Línea 126] Abre o renderiza el componente visual <TableHead>.
                  <TableHead>Usuario</TableHead> // [Línea 127] Abre o renderiza el componente visual <TableHead>.
                </TableRow> // [Línea 128] Cierra el componente visual </TableRow>.
              </TableHeader> // [Línea 129] Cierra el componente visual </TableHeader>.
              <TableBody> // [Línea 130] Abre o renderiza el componente visual <TableBody>.
                // [Línea 131] Ejecuta o evalúa: {movimientos.data.map((mov) => (
                {movimientos.data.map((mov) => (
                  <TableRow key={mov.id}> // [Línea 132] Abre o renderiza el componente visual <TableRow>.
                    <TableCell className="text-xs text-muted-foreground"> // [Línea 133] Abre o renderiza el componente visual <TableCell>.
                      // [Línea 134] Ejecuta o evalúa: {formatearFechaHora(mov.fecha)}
                      {formatearFechaHora(mov.fecha)}
                    </TableCell> // [Línea 135] Cierra el componente visual </TableCell>.
                    <TableCell> // [Línea 136] Abre o renderiza el componente visual <TableCell>.
                      <Link // [Línea 137] Abre o renderiza el componente visual <Link>.
                        // [Línea 138] Ejecuta o evalúa: href={`/productos/${mov.producto.id}`}
                        href={`/productos/${mov.producto.id}`}
                        // [Línea 139] Ejecuta o evalúa: className="font-medium hover:text-primary hover:underline"
                        className="font-medium hover:text-primary hover:underline"
                      // [Línea 140] Ejecuta o evalúa: >
                      >
                        <Texto mono tamano="xs"> // [Línea 141] Abre o renderiza el componente visual <Texto>.
                          // [Línea 142] Ejecuta o evalúa: {mov.producto.codigo}
                          {mov.producto.codigo}
                        </Texto>{" "} // [Línea 143] Cierra el componente visual </Texto>.
                        // [Línea 144] Ejecuta o evalúa: · {mov.producto.descripcion}
                        · {mov.producto.descripcion}
                      </Link> // [Línea 145] Cierra el componente visual </Link>.
                    </TableCell> // [Línea 146] Cierra el componente visual </TableCell>.
                    <TableCell> // [Línea 147] Abre o renderiza el componente visual <TableCell>.
                      <InsigniaTipoMovimiento tipo={mov.tipo} /> // [Línea 148] Abre o renderiza el componente visual <InsigniaTipoMovimiento>.
                    </TableCell> // [Línea 149] Cierra el componente visual </TableCell>.
                    <TableCell className="text-right font-mono font-semibold"> // [Línea 150] Abre o renderiza el componente visual <TableCell>.
                      <Texto tono={mov.cantidad > 0 ? "exito" : "peligro"}> // [Línea 151] Abre o renderiza el componente visual <Texto>.
                        // [Línea 152] Ejecuta o evalúa: {mov.cantidad > 0 ? `+${mov.cantidad}` : mov.cantidad}
                        {mov.cantidad > 0 ? `+${mov.cantidad}` : mov.cantidad}
                      </Texto> // [Línea 153] Cierra el componente visual </Texto>.
                    </TableCell> // [Línea 154] Cierra el componente visual </TableCell>.
                    <TableCell className="text-right font-mono"> // [Línea 155] Abre o renderiza el componente visual <TableCell>.
                      // [Línea 156] Ejecuta o evalúa: {mov.existenciaResultante}
                      {mov.existenciaResultante}
                    </TableCell> // [Línea 157] Cierra el componente visual </TableCell>.
                    <TableCell className="text-xs"> // [Línea 158] Abre o renderiza el componente visual <TableCell>.
                      // [Línea 159] Ejecuta o evalúa: {mov.motivo}
                      {mov.motivo}
                      // [Línea 160] Ejecuta o evalúa: {mov.observacion ? ` (${mov.observacion})` : ""}
                      {mov.observacion ? ` (${mov.observacion})` : ""}
                    </TableCell> // [Línea 161] Cierra el componente visual </TableCell>.
                    <TableCell> // [Línea 162] Abre o renderiza el componente visual <TableCell>.
                      // [Línea 163] Ejecuta o evalúa: {mov.referencia ? (
                      {mov.referencia ? (
                        <Link // [Línea 164] Abre o renderiza el componente visual <Link>.
                          // [Línea 165] Ejecuta o evalúa: href={`/ventas/${mov.referencia.facturaId}`}
                          href={`/ventas/${mov.referencia.facturaId}`}
                          // [Línea 166] Ejecuta o evalúa: className="font-mono text-xs text-primary hover:underline"
                          className="font-mono text-xs text-primary hover:underline"
                        // [Línea 167] Ejecuta o evalúa: >
                        >
                          // [Línea 168] Ejecuta o evalúa: {mov.referencia.numero}
                          {mov.referencia.numero}
                        </Link> // [Línea 169] Cierra el componente visual </Link>.
                      // [Línea 170] Ejecuta o evalúa: ) : (
                      ) : (
                        <Texto tono="suave" tamano="xs"> // [Línea 171] Abre o renderiza el componente visual <Texto>.
                          // [Línea 172] Ejecuta o evalúa: —
                          —
                        </Texto> // [Línea 173] Cierra el componente visual </Texto>.
                      // [Línea 174] Ejecuta o evalúa: )}
                      )}
                    </TableCell> // [Línea 175] Cierra el componente visual </TableCell>.
                    <TableCell className="text-xs">{mov.usuario.nombre}</TableCell> // [Línea 176] Abre o renderiza el componente visual <TableCell>.
                  </TableRow> // [Línea 177] Cierra el componente visual </TableRow>.
                // [Línea 178] Ejecuta o evalúa: ))}
                ))}
              </TableBody> // [Línea 179] Cierra el componente visual </TableBody>.
            </Table> // [Línea 180] Cierra el componente visual </Table>.

            <Paginador // [Línea 182] Abre o renderiza el componente visual <Paginador>.
              // [Línea 183] Ejecuta o evalúa: page={movimientos.page}
              page={movimientos.page}
              // [Línea 184] Ejecuta o evalúa: pageSize={movimientos.pageSize}
              pageSize={movimientos.pageSize}
              // [Línea 185] Ejecuta o evalúa: total={movimientos.total}
              total={movimientos.total}
            // [Línea 186] Ejecuta o evalúa: />
            />
          </> // [Línea 187] Cierra el componente visual </elemento>.
        // [Línea 188] Ejecuta o evalúa: )}
        )}
      </Pagina> // [Línea 189] Cierra el componente visual </Pagina>.
    // [Línea 190] Cierra el bloque o estructura ();).
    );
  // [Línea 191] Cierra el bloque o estructura (}).
  }

  // Vista por defecto: Catálogo de productos (RF-P1).
  // [Línea 194] Espera el resultado de la consulta/operación asíncrona y lo asigna a 'catalogo'.
  const catalogo = await listarProductos(usuario, parametros);

  // [Línea 196] Devuelve la interfaz JSX que renderiza este componente.
  return (
    <Pagina> // [Línea 197] Abre o renderiza el componente visual <Pagina>.
      <EncabezadoPagina // [Línea 198] Abre o renderiza el componente visual <EncabezadoPagina>.
        // [Línea 199] Ejecuta o evalúa: titulo="Catálogo de productos"
        titulo="Catálogo de productos"
        // [Línea 200] Ejecuta o evalúa: subtitulo="Precios finales, existencias actuales y control de stock mínimo"
        subtitulo="Precios finales, existencias actuales y control de stock mínimo"
        // [Línea 201] Ejecuta o evalúa: acciones={
        acciones={
          <Alinear className="gap-2"> // [Línea 202] Abre o renderiza el componente visual <Alinear>.
            <Link href="/productos/categorias"> // [Línea 203] Abre o renderiza el componente visual <Link>.
              <Button variant="outline"> // [Línea 204] Abre o renderiza el componente visual <Button>.
                <Tags className="size-4" /> // [Línea 205] Abre o renderiza el componente visual <Tags>.
                // [Línea 206] Ejecuta o evalúa: Categorías
                Categorías
              </Button> // [Línea 207] Cierra el componente visual </Button>.
            </Link> // [Línea 208] Cierra el componente visual </Link>.
            // [Línea 209] Ejecuta o evalúa: {esAdmin && <BotonNuevoProducto categorias={listaCategorias} />}
            {esAdmin && <BotonNuevoProducto categorias={listaCategorias} />}
          </Alinear> // [Línea 210] Cierra el componente visual </Alinear>.
        // [Línea 211] Cierra el bloque o estructura (}).
        }
      // [Línea 212] Ejecuta o evalúa: />
      />

      // [Línea 214] Ejecuta o evalúa: {/* Pestañas Catálogo / Existencias */}
      {/* Pestañas Catálogo / Existencias */}
      <Alinear className="gap-2 border-b border-border pb-2"> // [Línea 215] Abre o renderiza el componente visual <Alinear>.
        <Link href="/productos"> // [Línea 216] Abre o renderiza el componente visual <Link>.
          <Button variant="default" size="sm"> // [Línea 217] Abre o renderiza el componente visual <Button>.
            // [Línea 218] Ejecuta o evalúa: Catálogo de productos
            Catálogo de productos
          </Button> // [Línea 219] Cierra el componente visual </Button>.
        </Link> // [Línea 220] Cierra el componente visual </Link>.
        <Link href="/productos?vista=existencias"> // [Línea 221] Abre o renderiza el componente visual <Link>.
          <Button variant="ghost" size="sm"> // [Línea 222] Abre o renderiza el componente visual <Button>.
            // [Línea 223] Ejecuta o evalúa: Existencias y movimientos
            Existencias y movimientos
          </Button> // [Línea 224] Cierra el componente visual </Button>.
        </Link> // [Línea 225] Cierra el componente visual </Link>.
      </Alinear> // [Línea 226] Cierra el componente visual </Alinear>.

      <BarraFiltrosUrl // [Línea 228] Abre o renderiza el componente visual <BarraFiltrosUrl>.
        // [Línea 229] Ejecuta o evalúa: placeholderBusqueda="Buscar producto por código o descripción..."
        placeholderBusqueda="Buscar producto por código o descripción..."
        // [Línea 230] Ejecuta o evalúa: filtros={[
        filtros={[
          // [Línea 231] Ejecuta o evalúa: {
          {
            // [Línea 232] Define o asigna el campo/parámetro 'nombre'.
            nombre: "categoriaId",
            // [Línea 233] Define o asigna el campo/parámetro 'etiqueta'.
            etiqueta: "Todas las categorías",
            // [Línea 234] Define o asigna el campo/parámetro 'opciones'.
            opciones: listaCategorias.map((c) => ({ valor: String(c.id), texto: c.nombre })),
          // [Línea 235] Cierra el bloque o estructura (},).
          },
          // [Línea 236] Ejecuta o evalúa: {
          {
            // [Línea 237] Define o asigna el campo/parámetro 'nombre'.
            nombre: "bajoMinimo",
            // [Línea 238] Define o asigna el campo/parámetro 'etiqueta'.
            etiqueta: "Nivel de stock",
            // [Línea 239] Define o asigna el campo/parámetro 'opciones'.
            opciones: [{ valor: "true", texto: "Solo bajo stock mínimo" }],
          // [Línea 240] Cierra el bloque o estructura (},).
          },
          // [Línea 241] Ejecuta o evalúa: ...(esAdmin
          ...(esAdmin
            // [Línea 242] Ejecuta o evalúa: ? [
            ? [
                // [Línea 243] Ejecuta o evalúa: {
                {
                  // [Línea 244] Define o asigna el campo/parámetro 'nombre'.
                  nombre: "activo",
                  // [Línea 245] Define o asigna el campo/parámetro 'etiqueta'.
                  etiqueta: "Solo activos",
                  // [Línea 246] Define o asigna el campo/parámetro 'opciones'.
                  opciones: [
                    // [Línea 247] Ejecuta o evalúa: { valor: "todos", texto: "Activos e inactivos" },
                    { valor: "todos", texto: "Activos e inactivos" },
                    // [Línea 248] Ejecuta o evalúa: { valor: "false", texto: "Solo dados de baja" },
                    { valor: "false", texto: "Solo dados de baja" },
                  // [Línea 249] Ejecuta o evalúa: ],
                  ],
                // [Línea 250] Cierra el bloque o estructura (},).
                },
              // [Línea 251] Cierra el bloque o estructura (]).
              ]
            // [Línea 252] Ejecuta o evalúa: : []),
            : []),
        // [Línea 253] Ejecuta o evalúa: ]}
        ]}
      // [Línea 254] Ejecuta o evalúa: />
      />

      // [Línea 256] Ejecuta o evalúa: {catalogo.data.length === 0 ? (
      {catalogo.data.length === 0 ? (
        <EstadoVacio // [Línea 257] Abre o renderiza el componente visual <EstadoVacio>.
          // [Línea 258] Ejecuta o evalúa: titulo="No se encontraron productos"
          titulo="No se encontraron productos"
          // [Línea 259] Ejecuta o evalúa: descripcion="Probá cambiando el texto de búsqueda o quitando los filtros."
          descripcion="Probá cambiando el texto de búsqueda o quitando los filtros."
        // [Línea 260] Ejecuta o evalúa: />
        />
      // [Línea 261] Ejecuta o evalúa: ) : (
      ) : (
        <> // [Línea 262] Abre o renderiza el componente visual <elemento>.
          <Table> // [Línea 263] Abre o renderiza el componente visual <Table>.
            <TableHeader> // [Línea 264] Abre o renderiza el componente visual <TableHeader>.
              <TableRow> // [Línea 265] Abre o renderiza el componente visual <TableRow>.
                <TableHead>Código</TableHead> // [Línea 266] Abre o renderiza el componente visual <TableHead>.
                <TableHead>Descripción</TableHead> // [Línea 267] Abre o renderiza el componente visual <TableHead>.
                <TableHead>Categoría</TableHead> // [Línea 268] Abre o renderiza el componente visual <TableHead>.
                <TableHead className="text-right">Precio</TableHead> // [Línea 269] Abre o renderiza el componente visual <TableHead>.
                <TableHead className="text-right">Existencia</TableHead> // [Línea 270] Abre o renderiza el componente visual <TableHead>.
                <TableHead className="text-right">Mínimo</TableHead> // [Línea 271] Abre o renderiza el componente visual <TableHead>.
                <TableHead>Estado stock</TableHead> // [Línea 272] Abre o renderiza el componente visual <TableHead>.
                // [Línea 273] Ejecuta o evalúa: {esAdmin && <TableHead>Activo</TableHead>}
                {esAdmin && <TableHead>Activo</TableHead>}
                <TableHead className="text-right">Acciones</TableHead> // [Línea 274] Abre o renderiza el componente visual <TableHead>.
              </TableRow> // [Línea 275] Cierra el componente visual </TableRow>.
            </TableHeader> // [Línea 276] Cierra el componente visual </TableHeader>.
            <TableBody> // [Línea 277] Abre o renderiza el componente visual <TableBody>.
              // [Línea 278] Ejecuta o evalúa: {catalogo.data.map((prod) => (
              {catalogo.data.map((prod) => (
                <TableRow key={prod.id}> // [Línea 279] Abre o renderiza el componente visual <TableRow>.
                  <TableCell className="font-mono font-medium"> // [Línea 280] Abre o renderiza el componente visual <TableCell>.
                    <Link // [Línea 281] Abre o renderiza el componente visual <Link>.
                      // [Línea 282] Ejecuta o evalúa: href={`/productos/${prod.id}`}
                      href={`/productos/${prod.id}`}
                      // [Línea 283] Ejecuta o evalúa: className="hover:text-primary hover:underline"
                      className="hover:text-primary hover:underline"
                    // [Línea 284] Ejecuta o evalúa: >
                    >
                      // [Línea 285] Ejecuta o evalúa: {prod.codigo}
                      {prod.codigo}
                    </Link> // [Línea 286] Cierra el componente visual </Link>.
                  </TableCell> // [Línea 287] Cierra el componente visual </TableCell>.
                  <TableCell> // [Línea 288] Abre o renderiza el componente visual <TableCell>.
                    <Link // [Línea 289] Abre o renderiza el componente visual <Link>.
                      // [Línea 290] Ejecuta o evalúa: href={`/productos/${prod.id}`}
                      href={`/productos/${prod.id}`}
                      // [Línea 291] Ejecuta o evalúa: className="font-medium hover:text-primary hover:underline"
                      className="font-medium hover:text-primary hover:underline"
                    // [Línea 292] Ejecuta o evalúa: >
                    >
                      // [Línea 293] Ejecuta o evalúa: {prod.descripcion}
                      {prod.descripcion}
                    </Link> // [Línea 294] Cierra el componente visual </Link>.
                  </TableCell> // [Línea 295] Cierra el componente visual </TableCell>.
                  <TableCell>{prod.categoria.nombre}</TableCell> // [Línea 296] Abre o renderiza el componente visual <TableCell>.
                  <TableCell className="text-right font-mono"> // [Línea 297] Abre o renderiza el componente visual <TableCell>.
                    // [Línea 298] Ejecuta o evalúa: {formatearMoneda(prod.precio)}
                    {formatearMoneda(prod.precio)}
                  </TableCell> // [Línea 299] Cierra el componente visual </TableCell>.
                  <TableCell className="text-right font-mono font-semibold"> // [Línea 300] Abre o renderiza el componente visual <TableCell>.
                    // [Línea 301] Ejecuta o evalúa: {prod.existencia}
                    {prod.existencia}
                  </TableCell> // [Línea 302] Cierra el componente visual </TableCell>.
                  <TableCell className="text-right font-mono text-muted-foreground"> // [Línea 303] Abre o renderiza el componente visual <TableCell>.
                    // [Línea 304] Ejecuta o evalúa: {prod.stockMinimo}
                    {prod.stockMinimo}
                  </TableCell> // [Línea 305] Cierra el componente visual </TableCell>.
                  <TableCell> // [Línea 306] Abre o renderiza el componente visual <TableCell>.
                    <InsigniaStock existencia={prod.existencia} stockMinimo={prod.stockMinimo} /> // [Línea 307] Abre o renderiza el componente visual <InsigniaStock>.
                  </TableCell> // [Línea 308] Cierra el componente visual </TableCell>.
                  // [Línea 309] Ejecuta o evalúa: {esAdmin && (
                  {esAdmin && (
                    <TableCell> // [Línea 310] Abre o renderiza el componente visual <TableCell>.
                      <InsigniaActivo activo={prod.activo} textoInactivo="Baja" /> // [Línea 311] Abre o renderiza el componente visual <InsigniaActivo>.
                    </TableCell> // [Línea 312] Cierra el componente visual </TableCell>.
                  // [Línea 313] Ejecuta o evalúa: )}
                  )}
                  <TableCell className="text-right"> // [Línea 314] Abre o renderiza el componente visual <TableCell>.
                    <Alinear className="justify-end gap-1.5"> // [Línea 315] Abre o renderiza el componente visual <Alinear>.
                      <Link href={`/productos/${prod.id}`}> // [Línea 316] Abre o renderiza el componente visual <Link>.
                        <Button variant="outline" size="xs"> // [Línea 317] Abre o renderiza el componente visual <Button>.
                          <Eye className="size-3.5" /> // [Línea 318] Abre o renderiza el componente visual <Eye>.
                          // [Línea 319] Ejecuta o evalúa: Ficha
                          Ficha
                        </Button> // [Línea 320] Cierra el componente visual </Button>.
                      </Link> // [Línea 321] Cierra el componente visual </Link>.
                      // [Línea 322] Ejecuta o evalúa: {esAdmin && (
                      {esAdmin && (
                        <> // [Línea 323] Abre o renderiza el componente visual <elemento>.
                          <BotonesMovimientoStock producto={prod} /> // [Línea 324] Abre o renderiza el componente visual <BotonesMovimientoStock>.
                          <BotonesEditarProducto producto={prod} categorias={listaCategorias} /> // [Línea 325] Abre o renderiza el componente visual <BotonesEditarProducto>.
                        </> // [Línea 326] Cierra el componente visual </elemento>.
                      // [Línea 327] Ejecuta o evalúa: )}
                      )}
                    </Alinear> // [Línea 328] Cierra el componente visual </Alinear>.
                  </TableCell> // [Línea 329] Cierra el componente visual </TableCell>.
                </TableRow> // [Línea 330] Cierra el componente visual </TableRow>.
              // [Línea 331] Ejecuta o evalúa: ))}
              ))}
            </TableBody> // [Línea 332] Cierra el componente visual </TableBody>.
          </Table> // [Línea 333] Cierra el componente visual </Table>.

          <Paginador page={catalogo.page} pageSize={catalogo.pageSize} total={catalogo.total} /> // [Línea 335] Abre o renderiza el componente visual <Paginador>.
        </> // [Línea 336] Cierra el componente visual </elemento>.
      // [Línea 337] Ejecuta o evalúa: )}
      )}
    </Pagina> // [Línea 338] Cierra el componente visual </Pagina>.
  // [Línea 339] Cierra el bloque o estructura ();).
  );
// [Línea 340] Cierra el bloque o estructura (}).
}
