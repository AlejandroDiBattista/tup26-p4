// Pantalla de FICHA DEL CLIENTE y CUENTA CORRIENTE (/clientes/[id]). RF-C3, RF-C4, RF-C5.
// - Muestra datos del cliente, saldo actual, límite de crédito y crédito disponible.
// - Pestaña "Cuenta corriente": movimientos en orden cronológico con saldo acumulado renglón a renglón.
// - Pestaña "Últimas facturas": las últimas facturas emitidas al cliente.
import Link from "next/link";
import { notFound } from "next/navigation";
import { ArrowLeft, Eye } from "lucide-react";
import { exigirUsuarioPagina } from "@/lib/sesion";
import { obtenerCliente, obtenerCuentaCorriente } from "@/servicios/clientes";
import { ApiError } from "@/servicios/errores";
import { formatearFechaHora, formatearMoneda } from "@/lib/formato";
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
import { BarraFiltrosUrl } from "@/componentes/comunes/filtros-url";
import {
  InsigniaActivo,
  InsigniaEstadoFactura,
  InsigniaFormaPago,
} from "@/componentes/comunes/insignias";
import { EstadoVacio } from "@/componentes/comunes/estados";
import {
  BotonesEditarCliente,
  BotonRegistrarPago,
} from "@/componentes/dominio/acciones-clientes";
import { Alinear, Grilla, Pagina, Texto } from "@/componentes/primitivas/maquetacion";

type Props = {
  params: Promise<{ id: string }>;
  searchParams: Promise<Record<string, string | undefined>>;
};

export default async function PaginaFichaCliente({ params, searchParams }: Props) {
  const usuario = await exigirUsuarioPagina();
  const { id } = await params;
  const parametros = await searchParams;
  const idCliente = Number(id);
  const pestana = parametros.vista === "facturas" ? "facturas" : "cuenta";

  let cliente;
  let cuenta;

  try {
    [cliente, cuenta] = await Promise.all([
      obtenerCliente(usuario, idCliente),
      obtenerCuentaCorriente(usuario, idCliente, {
        desde: parametros.desde,
        hasta: parametros.hasta,
      }),
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
        titulo={cliente.nombre}
        subtitulo={`${cliente.tipoDoc} ${cliente.nroDoc} · ${cliente.domicilio ?? "Sin domicilio"} · Tel: ${cliente.telefono ?? "—"}`}
        acciones={
          <Alinear className="gap-2">
            <Link href="/clientes">
              <Button variant="outline">
                <ArrowLeft className="size-4" />
                Volver a clientes
              </Button>
            </Link>
            <BotonRegistrarPago cliente={cliente} />
            <BotonesEditarCliente cliente={cliente} />
          </Alinear>
        }
      />

      {/* Resumen financiero del cliente */}
      <Grilla className="grid-cols-1 sm:grid-cols-4">
        <Card>
          <CardHeader>
            <CardDescription>Saldo actual (deuda)</CardDescription>
            <CardTitle className="text-2xl font-mono">
              <Texto tamano="2xl" mono negrita tono={cliente.saldo > 0 ? "peligro" : "exito"}>
                {formatearMoneda(cliente.saldo)}
              </Texto>
            </CardTitle>
          </CardHeader>
        </Card>

        <Card>
          <CardHeader>
            <CardDescription>Límite de crédito</CardDescription>
            <CardTitle className="text-2xl font-mono">
              {cliente.cuentaCorriente
                ? cliente.limiteCredito !== null
                  ? formatearMoneda(cliente.limiteCredito)
                  : "Sin tope"
                : "No habilitada"}
            </CardTitle>
          </CardHeader>
        </Card>

        <Card>
          <CardHeader>
            <CardDescription>Crédito disponible</CardDescription>
            <CardTitle className="text-2xl font-mono">
              {cliente.cuentaCorriente
                ? cliente.disponible !== null
                  ? formatearMoneda(cliente.disponible)
                  : "Sin tope"
                : "—"}
            </CardTitle>
          </CardHeader>
        </Card>

        <Card>
          <CardHeader>
            <CardDescription>Condición</CardDescription>
            <CardContent className="pt-1">
              <Alinear className="gap-2">
                {cliente.cuentaCorriente ? (
                  <Badge variant="success">Cta. Cte. activa</Badge>
                ) : (
                  <Badge variant="secondary">Solo contado/tarjeta</Badge>
                )}
                <InsigniaActivo activo={cliente.activo} textoInactivo="Dado de baja" />
              </Alinear>
            </CardContent>
          </CardHeader>
        </Card>
      </Grilla>

      {/* Pestañas Cuenta corriente / Últimas facturas (sección 4) */}
      <Alinear className="gap-2 border-b border-border pb-2">
        <Link href={`/clientes/${cliente.id}?vista=cuenta`}>
          <Button variant={pestana === "cuenta" ? "default" : "ghost"} size="sm">
            Cuenta corriente ({cuenta.movimientos.length} movimientos)
          </Button>
        </Link>
        <Link href={`/clientes/${cliente.id}?vista=facturas`}>
          <Button variant={pestana === "facturas" ? "default" : "ghost"} size="sm">
            Últimas facturas ({cliente.ultimasFacturas.length})
          </Button>
        </Link>
      </Alinear>

      {pestana === "cuenta" ? (
        <Card>
          <CardHeader>
            <CardTitle>Movimientos de cuenta corriente</CardTitle>
            <CardDescription>
              Orden cronológico con saldo acumulado en cada renglón (débitos por ventas menos
              créditos por pagos y anulaciones)
            </CardDescription>
          </CardHeader>
          <CardContent className="gap-4">
            <BarraFiltrosUrl
              mostrarBusqueda={false}
              filtros={[
                { nombre: "desde", etiqueta: "Desde fecha", tipo: "fecha" },
                { nombre: "hasta", etiqueta: "Hasta fecha", tipo: "fecha" },
              ]}
            />

            {parametros.desde && (
              <Alinear className="justify-between rounded-lg border border-border bg-secondary/40 px-4 py-2">
                <Texto tamano="xs" tono="suave">
                  Saldo anterior acumulado hasta {parametros.desde}:
                </Texto>
                <Texto mono negrita tamano="sm">
                  {formatearMoneda(cuenta.saldoAnterior)}
                </Texto>
              </Alinear>
            )}

            {cuenta.movimientos.length === 0 ? (
              <EstadoVacio
                titulo="No hay movimientos en la cuenta corriente"
                descripcion="Las ventas en cuenta corriente y los recibos de pago aparecerán aquí."
              />
            ) : (
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Fecha y hora</TableHead>
                    <TableHead>Concepto / Comprobante</TableHead>
                    <TableHead>Tipo</TableHead>
                    <TableHead className="text-right">Débito (+)</TableHead>
                    <TableHead className="text-right">Crédito (−)</TableHead>
                    <TableHead className="text-right">Saldo acumulado</TableHead>
                    <TableHead className="text-right">Ver</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {cuenta.movimientos.map((mov, indice) => (
                    <TableRow key={`${mov.fecha}-${indice}`}>
                      <TableCell className="text-xs text-muted-foreground">
                        {formatearFechaHora(mov.fecha)}
                      </TableCell>
                      <TableCell className="font-medium">{mov.descripcion}</TableCell>
                      <TableCell>
                        <Badge variant={mov.tipo === "debito" ? "warning" : "success"}>
                          {mov.tipo === "debito" ? "Débito" : "Crédito"}
                        </Badge>
                      </TableCell>
                      <TableCell className="text-right font-mono">
                        {mov.tipo === "debito" ? formatearMoneda(mov.importe) : "—"}
                      </TableCell>
                      <TableCell className="text-right font-mono text-emerald-700">
                        {mov.tipo === "credito" ? formatearMoneda(mov.importe) : "—"}
                      </TableCell>
                      <TableCell className="text-right font-mono font-semibold">
                        {formatearMoneda(mov.saldo)}
                      </TableCell>
                      <TableCell className="text-right">
                        {mov.facturaId && (
                          <Link href={`/ventas/${mov.facturaId}`}>
                            <Button variant="outline" size="xs">
                              <Eye className="size-3.5" />
                              Factura
                            </Button>
                          </Link>
                        )}
                        {mov.pagoId && (
                          <Link href={`/clientes/recibos/${mov.pagoId}`}>
                            <Button variant="outline" size="xs">
                              <Eye className="size-3.5" />
                              Recibo
                            </Button>
                          </Link>
                        )}
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            )}
          </CardContent>
        </Card>
      ) : (
        <Card>
          <CardHeader>
            <CardTitle>Últimas facturas del cliente</CardTitle>
            <CardDescription>Las 6 facturas más recientes registradas a su nombre</CardDescription>
          </CardHeader>
          <CardContent>
            {cliente.ultimasFacturas.length === 0 ? (
              <EstadoVacio titulo="El cliente aún no tiene facturas emitidas" />
            ) : (
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Número</TableHead>
                    <TableHead>Fecha y hora</TableHead>
                    <TableHead>Forma de pago</TableHead>
                    <TableHead>Estado</TableHead>
                    <TableHead className="text-right">Total</TableHead>
                    <TableHead className="text-right">Comprobante</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {cliente.ultimasFacturas.map((fac) => (
                    <TableRow key={fac.id}>
                      <TableCell className="font-mono font-medium">
                        <Link
                          href={`/ventas/${fac.id}`}
                          className="hover:text-primary hover:underline"
                        >
                          {fac.numeroFormateado}
                        </Link>
                      </TableCell>
                      <TableCell className="text-xs text-muted-foreground">
                        {formatearFechaHora(fac.fecha)}
                      </TableCell>
                      <TableCell>
                        <InsigniaFormaPago forma={fac.formaPago} />
                      </TableCell>
                      <TableCell>
                        <InsigniaEstadoFactura estado={fac.estado} />
                      </TableCell>
                      <TableCell className="text-right font-mono font-semibold">
                        {formatearMoneda(fac.total)}
                      </TableCell>
                      <TableCell className="text-right">
                        <Link href={`/ventas/${fac.id}`}>
                          <Button variant="outline" size="xs">
                            <Eye className="size-3.5" />
                            Ver
                          </Button>
                        </Link>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            )}
          </CardContent>
        </Card>
      )}
    </Pagina>
  );
}
