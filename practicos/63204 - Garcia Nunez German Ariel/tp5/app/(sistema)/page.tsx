// Pantalla de INICIO · Tablero de control (/). RF-T1, RF-T2, RF-T3.
// Server Component que llama directamente a los servicios (sección 10.6).
import Link from "next/link";
import { ShoppingCart, AlertTriangle, TrendingUp, Wallet, PackageCheck } from "lucide-react";
import { exigirUsuarioPagina } from "@/lib/sesion";
import { obtenerTablero } from "@/servicios/tablero";
import { listarProductos } from "@/servicios/productos";
import { formatearMoneda } from "@/lib/formato";
import { Button } from "@/componentes/ui/button";
import { Badge } from "@/componentes/ui/badge";
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
import { EstadoVacio } from "@/componentes/comunes/estados";
import { GraficosTablero } from "@/componentes/dominio/tablero-graficos";
import { Alinear, Apilar, Grilla, Pagina, Texto } from "@/componentes/primitivas/maquetacion";

export default async function PaginaTablero() {
  const usuario = await exigirUsuarioPagina();
  const datosTablero = await obtenerTablero(usuario);
  const productosBajoMinimo = await listarProductos(usuario, {
    bajoMinimo: "true",
    pageSize: "6",
  });

  return (
    <Pagina>
      <EncabezadoPagina
        titulo="Tablero comercial"
        subtitulo="Resumen en tiempo real de ventas, cuentas corrientes y existencias críticas"
        acciones={
          <Link href="/ventas/nueva">
            <Button>
              <ShoppingCart className="size-4" />
              Nueva venta
            </Button>
          </Link>
        }
      />

      {/* RF-T1: 4 tarjetas de indicadores principales */}
      <Grilla className="grid-cols-1 sm:grid-cols-2 lg:grid-cols-4">
        <Card>
          <CardHeader>
            <Alinear className="justify-between">
              <CardDescription>Ventas de hoy</CardDescription>
              <TrendingUp className="size-4 text-primary" />
            </Alinear>
            <CardTitle className="text-2xl font-mono">
              {formatearMoneda(datosTablero.hoy.importe)}
            </CardTitle>
          </CardHeader>
          <CardContent>
            <Texto tamano="xs" tono="suave">
              {datosTablero.hoy.cantidad} facturas emitidas en el día
            </Texto>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <Alinear className="justify-between">
              <CardDescription>Ventas del mes</CardDescription>
              <PackageCheck className="size-4 text-primary" />
            </Alinear>
            <CardTitle className="text-2xl font-mono">
              {formatearMoneda(datosTablero.mes.importe)}
            </CardTitle>
          </CardHeader>
          <CardContent>
            <Texto tamano="xs" tono="suave">
              {datosTablero.mes.cantidad} ventas · Ticket prom.{" "}
              {formatearMoneda(datosTablero.mes.ticketPromedio)}
            </Texto>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <Alinear className="justify-between">
              <CardDescription>Total adeudado (Cta. Cte.)</CardDescription>
              <Wallet className="size-4 text-amber-600" />
            </Alinear>
            <CardTitle className="text-2xl font-mono">
              {formatearMoneda(datosTablero.cuentasCorrientes.totalAdeudado)}
            </CardTitle>
          </CardHeader>
          <CardContent>
            <Alinear className="justify-between">
              <Texto tamano="xs" tono="suave">
                {datosTablero.cuentasCorrientes.clientesConSaldo} clientes con saldo
              </Texto>
              <Link href="/clientes/saldos">
                <Texto tamano="xs" negrita className="text-primary hover:underline">
                  Ver saldos →
                </Texto>
              </Link>
            </Alinear>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <Alinear className="justify-between">
              <CardDescription>Productos bajo mínimo</CardDescription>
              <AlertTriangle className="size-4 text-red-600" />
            </Alinear>
            <CardTitle className="text-2xl font-mono">
              {datosTablero.bajoMinimo.cantidad}
            </CardTitle>
          </CardHeader>
          <CardContent>
            <Alinear className="justify-between">
              <Texto tamano="xs" tono="suave">
                Requieren reposición de stock
              </Texto>
              <Link href="/productos?bajoMinimo=true">
                <Texto tamano="xs" negrita className="text-primary hover:underline">
                  Ver catálogo →
                </Texto>
              </Link>
            </Alinear>
          </CardContent>
        </Card>
      </Grilla>

      {/* RF-T2: Gráficos de ventas de los últimos 30 días y ventas por forma de pago */}
      <GraficosTablero
        ventasDiarias={datosTablero.ventasDiarias}
        porFormaDePago={datosTablero.porFormaDePago}
      />

      {/* RF-T3: Los 5 productos más vendidos del mes + Productos para reponer */}
      <Grilla className="grid-cols-1 lg:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle>5 productos más vendidos del mes</CardTitle>
            <CardDescription>Ordenados por cantidad de unidades vendidas</CardDescription>
          </CardHeader>
          <CardContent>
            {datosTablero.masVendidos.length === 0 ? (
              <EstadoVacio titulo="Sin ventas registradas en el mes" />
            ) : (
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Código</TableHead>
                    <TableHead>Producto</TableHead>
                    <TableHead className="text-right">Unidades</TableHead>
                    <TableHead className="text-right">Importe</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {datosTablero.masVendidos.map((item) => (
                    <TableRow key={item.productoId}>
                      <TableCell className="font-mono text-xs">{item.codigo}</TableCell>
                      <TableCell>
                        <Link
                          href={`/productos/${item.productoId}`}
                          className="font-medium hover:text-primary hover:underline"
                        >
                          {item.descripcion}
                        </Link>
                      </TableCell>
                      <TableCell className="text-right font-mono font-semibold">
                        {item.unidades}
                      </TableCell>
                      <TableCell className="text-right font-mono">
                        {formatearMoneda(item.importe)}
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            )}
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <Alinear className="justify-between">
              <Apilar className="gap-0.5">
                <CardTitle>Alertas de stock bajo mínimo</CardTitle>
                <CardDescription>
                  Productos cuya existencia actual está por debajo del mínimo configurado
                </CardDescription>
              </Apilar>
              <Link href="/productos?bajoMinimo=true">
                <Button variant="outline" size="xs">
                  Ver todos
                </Button>
              </Link>
            </Alinear>
          </CardHeader>
          <CardContent>
            {productosBajoMinimo.data.length === 0 ? (
              <EstadoVacio
                titulo="Todo el catálogo tiene stock suficiente"
                descripcion="Ningún producto activo se encuentra bajo el stock mínimo."
              />
            ) : (
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Código</TableHead>
                    <TableHead>Descripción</TableHead>
                    <TableHead className="text-right">Existencia</TableHead>
                    <TableHead className="text-right">Mínimo</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {productosBajoMinimo.data.map((prod) => (
                    <TableRow key={prod.id}>
                      <TableCell className="font-mono text-xs">{prod.codigo}</TableCell>
                      <TableCell>
                        <Link
                          href={`/productos/${prod.id}`}
                          className="font-medium hover:text-primary hover:underline"
                        >
                          {prod.descripcion}
                        </Link>
                      </TableCell>
                      <TableCell className="text-right">
                        <Badge variant="warning" className="font-mono">
                          {prod.existencia}
                        </Badge>
                      </TableCell>
                      <TableCell className="text-right font-mono text-muted-foreground">
                        {prod.stockMinimo}
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            )}
          </CardContent>
        </Card>
      </Grilla>
    </Pagina>
  );
}
