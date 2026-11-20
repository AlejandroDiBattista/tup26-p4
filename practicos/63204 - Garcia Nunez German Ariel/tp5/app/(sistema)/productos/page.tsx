// Pantalla de PRODUCTOS (/productos) con dos pestañas (sección 4):
// 1. "Catálogo": listado paginado con búsqueda, filtro por categoría y marca de bajo mínimo (RF-P1).
// 2. "Existencias y movimientos": historial de todos los movimientos de stock (RF-P6).
import Link from "next/link";
import { Eye, Tags } from "lucide-react";
import { exigirUsuarioPagina } from "@/lib/sesion";
import { listarProductos } from "@/servicios/productos";
import { listarCategorias } from "@/servicios/categorias";
import { listarMovimientosStock } from "@/servicios/stock";
import { formatearFechaHora, formatearMoneda } from "@/lib/formato";
import { Button } from "@/componentes/ui/button";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/componentes/ui/table";
import { EncabezadoPagina } from "@/componentes/comunes/encabezado-pagina";
import { BarraFiltrosUrl } from "@/componentes/comunes/filtros-url";
import {
  InsigniaActivo,
  InsigniaStock,
  InsigniaTipoMovimiento,
} from "@/componentes/comunes/insignias";
import { Paginador } from "@/componentes/comunes/paginador";
import { EstadoVacio } from "@/componentes/comunes/estados";
import {
  BotonNuevoProducto,
  BotonesEditarProducto,
  BotonesMovimientoStock,
} from "@/componentes/dominio/acciones-productos";
import { Alinear, Pagina, Texto } from "@/componentes/primitivas/maquetacion";

type Props = { searchParams: Promise<Record<string, string | undefined>> };

export default async function PaginaProductos({ searchParams }: Props) {
  const usuario = await exigirUsuarioPagina();
  const parametros = await searchParams;
  const esAdmin = usuario.rol === "admin";
  const pestana = parametros.vista === "existencias" ? "existencias" : "catalogo";

  const listaCategorias = await listarCategorias(usuario);

  if (pestana === "existencias") {
    const [movimientos, todosLosProductos] = await Promise.all([
      listarMovimientosStock(usuario, parametros),
      listarProductos(usuario, { pageSize: "100" }),
    ]);

    return (
      <Pagina>
        <EncabezadoPagina
          titulo="Productos y existencias"
          subtitulo="Auditoría de ingresos, egresos, ventas y anulaciones de stock"
          acciones={
            <Alinear className="gap-2">
              <Link href="/productos/categorias">
                <Button variant="outline">
                  <Tags className="size-4" />
                  Categorías
                </Button>
              </Link>
              {esAdmin && <BotonNuevoProducto categorias={listaCategorias} />}
            </Alinear>
          }
        />

        {/* Pestañas Catálogo / Existencias */}
        <Alinear className="gap-2 border-b border-border pb-2">
          <Link href="/productos">
            <Button variant="ghost" size="sm">
              Catálogo de productos
            </Button>
          </Link>
          <Link href="/productos?vista=existencias">
            <Button variant="default" size="sm">
              Existencias y movimientos
            </Button>
          </Link>
        </Alinear>

        <BarraFiltrosUrl
          mostrarBusqueda={false}
          filtros={[
            {
              nombre: "productoId",
              etiqueta: "Todos los productos",
              opciones: todosLosProductos.data.map((p) => ({
                valor: String(p.id),
                texto: `${p.codigo} · ${p.descripcion}`,
              })),
            },
            {
              nombre: "tipo",
              etiqueta: "Todos los tipos",
              opciones: [
                { valor: "venta", texto: "Venta" },
                { valor: "anulacion", texto: "Anulación" },
                { valor: "ingreso", texto: "Ingreso manual" },
                { valor: "egreso", texto: "Egreso manual" },
              ],
            },
            { nombre: "desde", etiqueta: "Desde fecha", tipo: "fecha" },
            { nombre: "hasta", etiqueta: "Hasta fecha", tipo: "fecha" },
          ]}
        />

        {movimientos.data.length === 0 ? (
          <EstadoVacio
            titulo="No hay movimientos de stock para este filtro"
            descripcion="Probá cambiando el producto, tipo o rango de fechas."
          />
        ) : (
          <>
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Fecha y hora</TableHead>
                  <TableHead>Producto</TableHead>
                  <TableHead>Tipo</TableHead>
                  <TableHead className="text-right">Cantidad</TableHead>
                  <TableHead className="text-right">Existencia result.</TableHead>
                  <TableHead>Motivo / Observación</TableHead>
                  <TableHead>Factura</TableHead>
                  <TableHead>Usuario</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {movimientos.data.map((mov) => (
                  <TableRow key={mov.id}>
                    <TableCell className="text-xs text-muted-foreground">
                      {formatearFechaHora(mov.fecha)}
                    </TableCell>
                    <TableCell>
                      <Link
                        href={`/productos/${mov.producto.id}`}
                        className="font-medium hover:text-primary hover:underline"
                      >
                        <Texto mono tamano="xs">
                          {mov.producto.codigo}
                        </Texto>{" "}
                        · {mov.producto.descripcion}
                      </Link>
                    </TableCell>
                    <TableCell>
                      <InsigniaTipoMovimiento tipo={mov.tipo} />
                    </TableCell>
                    <TableCell className="text-right font-mono font-semibold">
                      <Texto tono={mov.cantidad > 0 ? "exito" : "peligro"}>
                        {mov.cantidad > 0 ? `+${mov.cantidad}` : mov.cantidad}
                      </Texto>
                    </TableCell>
                    <TableCell className="text-right font-mono">
                      {mov.existenciaResultante}
                    </TableCell>
                    <TableCell className="text-xs">
                      {mov.motivo}
                      {mov.observacion ? ` (${mov.observacion})` : ""}
                    </TableCell>
                    <TableCell>
                      {mov.referencia ? (
                        <Link
                          href={`/ventas/${mov.referencia.facturaId}`}
                          className="font-mono text-xs text-primary hover:underline"
                        >
                          {mov.referencia.numero}
                        </Link>
                      ) : (
                        <Texto tono="suave" tamano="xs">
                          —
                        </Texto>
                      )}
                    </TableCell>
                    <TableCell className="text-xs">{mov.usuario.nombre}</TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>

            <Paginador
              page={movimientos.page}
              pageSize={movimientos.pageSize}
              total={movimientos.total}
            />
          </>
        )}
      </Pagina>
    );
  }

  // Vista por defecto: Catálogo de productos (RF-P1).
  const catalogo = await listarProductos(usuario, parametros);

  return (
    <Pagina>
      <EncabezadoPagina
        titulo="Catálogo de productos"
        subtitulo="Precios finales, existencias actuales y control de stock mínimo"
        acciones={
          <Alinear className="gap-2">
            <Link href="/productos/categorias">
              <Button variant="outline">
                <Tags className="size-4" />
                Categorías
              </Button>
            </Link>
            {esAdmin && <BotonNuevoProducto categorias={listaCategorias} />}
          </Alinear>
        }
      />

      {/* Pestañas Catálogo / Existencias */}
      <Alinear className="gap-2 border-b border-border pb-2">
        <Link href="/productos">
          <Button variant="default" size="sm">
            Catálogo de productos
          </Button>
        </Link>
        <Link href="/productos?vista=existencias">
          <Button variant="ghost" size="sm">
            Existencias y movimientos
          </Button>
        </Link>
      </Alinear>

      <BarraFiltrosUrl
        placeholderBusqueda="Buscar producto por código o descripción..."
        filtros={[
          {
            nombre: "categoriaId",
            etiqueta: "Todas las categorías",
            opciones: listaCategorias.map((c) => ({ valor: String(c.id), texto: c.nombre })),
          },
          {
            nombre: "bajoMinimo",
            etiqueta: "Nivel de stock",
            opciones: [{ valor: "true", texto: "Solo bajo stock mínimo" }],
          },
          ...(esAdmin
            ? [
                {
                  nombre: "activo",
                  etiqueta: "Solo activos",
                  opciones: [
                    { valor: "todos", texto: "Activos e inactivos" },
                    { valor: "false", texto: "Solo dados de baja" },
                  ],
                },
              ]
            : []),
        ]}
      />

      {catalogo.data.length === 0 ? (
        <EstadoVacio
          titulo="No se encontraron productos"
          descripcion="Probá cambiando el texto de búsqueda o quitando los filtros."
        />
      ) : (
        <>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Código</TableHead>
                <TableHead>Descripción</TableHead>
                <TableHead>Categoría</TableHead>
                <TableHead className="text-right">Precio</TableHead>
                <TableHead className="text-right">Existencia</TableHead>
                <TableHead className="text-right">Mínimo</TableHead>
                <TableHead>Estado stock</TableHead>
                {esAdmin && <TableHead>Activo</TableHead>}
                <TableHead className="text-right">Acciones</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {catalogo.data.map((prod) => (
                <TableRow key={prod.id}>
                  <TableCell className="font-mono font-medium">
                    <Link
                      href={`/productos/${prod.id}`}
                      className="hover:text-primary hover:underline"
                    >
                      {prod.codigo}
                    </Link>
                  </TableCell>
                  <TableCell>
                    <Link
                      href={`/productos/${prod.id}`}
                      className="font-medium hover:text-primary hover:underline"
                    >
                      {prod.descripcion}
                    </Link>
                  </TableCell>
                  <TableCell>{prod.categoria.nombre}</TableCell>
                  <TableCell className="text-right font-mono">
                    {formatearMoneda(prod.precio)}
                  </TableCell>
                  <TableCell className="text-right font-mono font-semibold">
                    {prod.existencia}
                  </TableCell>
                  <TableCell className="text-right font-mono text-muted-foreground">
                    {prod.stockMinimo}
                  </TableCell>
                  <TableCell>
                    <InsigniaStock existencia={prod.existencia} stockMinimo={prod.stockMinimo} />
                  </TableCell>
                  {esAdmin && (
                    <TableCell>
                      <InsigniaActivo activo={prod.activo} textoInactivo="Baja" />
                    </TableCell>
                  )}
                  <TableCell className="text-right">
                    <Alinear className="justify-end gap-1.5">
                      <Link href={`/productos/${prod.id}`}>
                        <Button variant="outline" size="xs">
                          <Eye className="size-3.5" />
                          Ficha
                        </Button>
                      </Link>
                      {esAdmin && (
                        <>
                          <BotonesMovimientoStock producto={prod} />
                          <BotonesEditarProducto producto={prod} categorias={listaCategorias} />
                        </>
                      )}
                    </Alinear>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>

          <Paginador page={catalogo.page} pageSize={catalogo.pageSize} total={catalogo.total} />
        </>
      )}
    </Pagina>
  );
}
