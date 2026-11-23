// Pantalla de FICHA DEL PRODUCTO con sus movimientos (/productos/[id]). RF-P4, RF-P5, RF-P6.
import Link from "next/link";
import { notFound } from "next/navigation";
import { ArrowLeft } from "lucide-react";
import { exigirUsuarioPagina } from "@/lib/sesion";
import { obtenerProducto } from "@/servicios/productos";
import { listarMovimientosDeProducto } from "@/servicios/stock";
import { listarCategorias } from "@/servicios/categorias";
import { ApiError } from "@/servicios/errores";
import { formatearFechaHora, formatearMoneda } from "@/lib/formato";
import { Button } from "@/componentes/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/componentes/ui/card";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/componentes/ui/table";
import { EncabezadoPagina } from "@/componentes/comunes/encabezado-pagina";
import {
  InsigniaActivo,
  InsigniaStock,
  InsigniaTipoMovimiento,
} from "@/componentes/comunes/insignias";
import { Paginador } from "@/componentes/comunes/paginador";
import { EstadoVacio } from "@/componentes/comunes/estados";
import {
  BotonesEditarProducto,
  BotonesMovimientoStock,
} from "@/componentes/dominio/acciones-productos";
import { Alinear, Grilla, Pagina, Texto } from "@/componentes/primitivas/maquetacion";

type Props = {
  params: Promise<{ id: string }>;
  searchParams: Promise<Record<string, string | undefined>>;
};

export default async function PaginaFichaProducto({ params, searchParams }: Props) {
  const usuario = await exigirUsuarioPagina();
  const { id } = await params;
  const parametros = await searchParams;
  const idProducto = Number(id);
  const esAdmin = usuario.rol === "admin";

  let producto;
  let movimientos;
  let categorias;

  try {
    [producto, movimientos, categorias] = await Promise.all([
      obtenerProducto(usuario, idProducto),
      listarMovimientosDeProducto(usuario, idProducto, parametros),
      listarCategorias(usuario),
    ]);
  } catch (error) {
    if (error instanceof ApiError && error.status === 404) {
      notFound();
    }
    throw error;
  }

  return (
    <Pagina>
      <EncabezadoPagina
        titulo={`${producto.codigo} · ${producto.descripcion}`}
        subtitulo={`Categoría: ${producto.categoria.nombre}`}
        acciones={
          <Alinear className="gap-2">
            <Link href="/productos">
              <Button variant="outline">
                <ArrowLeft className="size-4" />
                Volver al catálogo
              </Button>
            </Link>
            {esAdmin && (
              <>
                <BotonesMovimientoStock producto={producto} />
                <BotonesEditarProducto producto={producto} categorias={categorias} />
              </>
            )}
          </Alinear>
        }
      />

      {/* Tarjetas de resumen del producto */}
      <Grilla className="grid-cols-1 sm:grid-cols-4">
        <Card>
          <CardHeader>
            <CardDescription>Precio de venta</CardDescription>
            <CardTitle className="text-2xl font-mono">
              {formatearMoneda(producto.precio)}
            </CardTitle>
          </CardHeader>
        </Card>

        <Card>
          <CardHeader>
            <CardDescription>Existencia actual</CardDescription>
            <CardTitle className="text-2xl font-mono">{producto.existencia} u.</CardTitle>
          </CardHeader>
        </Card>

        <Card>
          <CardHeader>
            <CardDescription>Stock mínimo</CardDescription>
            <CardTitle className="text-2xl font-mono">{producto.stockMinimo} u.</CardTitle>
          </CardHeader>
        </Card>

        <Card>
          <CardHeader>
            <CardDescription>Estado</CardDescription>
            <CardContent className="pt-1">
              <Alinear className="gap-2">
                <InsigniaStock
                  existencia={producto.existencia}
                  stockMinimo={producto.stockMinimo}
                />
                <InsigniaActivo activo={producto.activo} textoInactivo="Dado de baja" />
              </Alinear>
            </CardContent>
          </CardHeader>
        </Card>
      </Grilla>

      {/* RF-P6: Movimientos del producto */}
      <Card>
        <CardHeader>
          <CardTitle>Historial de movimientos de stock</CardTitle>
          <CardDescription>
            La suma de todos los movimientos coincide siempre con la existencia actual ({producto.existencia} u.)
          </CardDescription>
        </CardHeader>
        <CardContent>
          {movimientos.data.length === 0 ? (
            <EstadoVacio titulo="Este producto aún no registra movimientos de stock" />
          ) : (
            <>
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Fecha y hora</TableHead>
                    <TableHead>Tipo</TableHead>
                    <TableHead className="text-right">Cantidad</TableHead>
                    <TableHead className="text-right">Existencia resultante</TableHead>
                    <TableHead>Motivo y observación</TableHead>
                    <TableHead>Factura asociada</TableHead>
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
                        {mov.observacion ? ` · ${mov.observacion}` : ""}
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
        </CardContent>
      </Card>
    </Pagina>
  );
}
