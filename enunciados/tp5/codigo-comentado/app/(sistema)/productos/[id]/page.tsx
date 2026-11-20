// ============================================================================
// GUÍA DE ESTUDIO - SEGUNDO PARCIAL: PROGRAMACIÓN IV
// Archivo: app/(sistema)/productos/[id]/page.tsx
// Código comentado con explicaciones sencillas y claras para la defensa oral.
// ============================================================================

// Pantalla de FICHA DEL PRODUCTO con sus movimientos (/productos/[id]). RF-P4, RF-P5, RF-P6.
import Link from "next/link";
import { ArrowLeft } from "lucide-react";
// Acá importamos las funciones para leer y validar la sesión del usuario conectado
import { exigirUsuarioPagina } from "@/lib/sesion";
// Acá importamos funciones de la capa de servicios donde reside la lógica de negocio
import { obtenerProducto } from "@/servicios/productos";
// Acá importamos funciones de la capa de servicios donde reside la lógica de negocio
import { listarMovimientosDeProducto } from "@/servicios/stock";
// Acá importamos funciones de la capa de servicios donde reside la lógica de negocio
import { listarCategorias } from "@/servicios/categorias";
// Acá importamos formateadores de moneda (pesos argentinos $), fechas y números
import { formatearFechaHora, formatearMoneda } from "@/lib/formato";
// Acá importamos componentes visuales de la interfaz de usuario
import { Button } from "@/componentes/ui/button";
// Acá importamos componentes visuales de la interfaz de usuario
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/componentes/ui/card";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/componentes/ui/table";
// Acá importamos componentes visuales de la interfaz de usuario
import { EncabezadoPagina } from "@/componentes/comunes/encabezado-pagina";
import {
  InsigniaActivo,
  InsigniaStock,
  InsigniaTipoMovimiento,
} from "@/componentes/comunes/insignias";
// Acá importamos componentes visuales de la interfaz de usuario
import { Paginador } from "@/componentes/comunes/paginador";
// Acá importamos componentes visuales de la interfaz de usuario
import { EstadoVacio } from "@/componentes/comunes/estados";
import {
  BotonesEditarProducto,
  BotonesMovimientoStock,
} from "@/componentes/dominio/acciones-productos";
// Acá importamos componentes visuales de la interfaz de usuario
import { Alinear, Grilla, Pagina, Texto } from "@/componentes/primitivas/maquetacion";

type Props = {
  params: Promise<{ id: string }>;
  searchParams: Promise<Record<string, string | undefined>>;
};

// Componente principal de página 'PaginaFichaProducto' (Server Component: se ejecuta en el servidor)
export default async function PaginaFichaProducto({ params, searchParams }: Props) {
  const usuario = await exigirUsuarioPagina();
  const { id } = await params;
  const parametros = await searchParams;
  const idProducto = Number(id);
  const esAdmin = usuario.rol === "admin";

  const [producto, movimientos, categorias] = await Promise.all([
    obtenerProducto(usuario, idProducto),
    listarMovimientosDeProducto(usuario, idProducto, parametros),
    listarCategorias(usuario),
  ]);

  // Renderizamos la interfaz visual de este componente:
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
