// ============================================================================
// GUÍA DE ESTUDIO - SEGUNDO PARCIAL: PROGRAMACIÓN IV
// Archivo: app/(sistema)/ventas/page.tsx
// Código comentado con explicaciones sencillas y claras para la defensa oral.
// ============================================================================

// Pantalla de LISTADO DE FACTURAS (/ventas). RF-V8.
import Link from "next/link";
import { ShoppingCart, Eye } from "lucide-react";
// Acá importamos la conexión y definición de tablas de la base de datos
import { db } from "@/basedatos/conexion";
// Acá importamos la conexión y definición de tablas de la base de datos
import { usuarios } from "@/basedatos/esquema";
// Acá importamos las funciones para leer y validar la sesión del usuario conectado
import { exigirUsuarioPagina } from "@/lib/sesion";
// Acá importamos funciones de la capa de servicios donde reside la lógica de negocio
import { listarFacturas } from "@/servicios/facturas";
// Acá importamos funciones de la capa de servicios donde reside la lógica de negocio
import { listarClientes } from "@/servicios/clientes";
// Acá importamos formateadores de moneda (pesos argentinos $), fechas y números
import { formatearFechaHora, formatearMoneda } from "@/lib/formato";
// Acá importamos componentes visuales de la interfaz de usuario
import { Button } from "@/componentes/ui/button";
// Acá importamos componentes visuales de la interfaz de usuario
import { Card } from "@/componentes/ui/card";
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
// Acá importamos componentes visuales de la interfaz de usuario
import { BarraFiltrosUrl } from "@/componentes/comunes/filtros-url";
// Acá importamos componentes visuales de la interfaz de usuario
import { InsigniaEstadoFactura, InsigniaFormaPago } from "@/componentes/comunes/insignias";
// Acá importamos componentes visuales de la interfaz de usuario
import { Paginador } from "@/componentes/comunes/paginador";
// Acá importamos componentes visuales de la interfaz de usuario
import { EstadoVacio } from "@/componentes/comunes/estados";
// Acá importamos componentes visuales de la interfaz de usuario
import { Alinear, Pagina, Texto } from "@/componentes/primitivas/maquetacion";

type Props = { searchParams: Promise<Record<string, string | undefined>> };

// Componente principal de página 'PaginaFacturas' (Server Component: se ejecuta en el servidor)
export default async function PaginaFacturas({ searchParams }: Props) {
  const usuario = await exigirUsuarioPagina();
  const parametros = await searchParams;

  const [listado, clientesRes, listaVendedores] = await Promise.all([
    listarFacturas(usuario, parametros),
    listarClientes(usuario, { pageSize: "100" }),
    db.select({ id: usuarios.id, nombre: usuarios.nombre }).from(usuarios),
  ]);

  // Renderizamos la interfaz visual de este componente:
  return (
    <Pagina>
      <EncabezadoPagina
        titulo="Facturas"
        subtitulo="Historial de comprobantes emitidos y anulados"
        acciones={
          <Link href="/ventas/nueva">
            <Button>
              <ShoppingCart className="size-4" />
              Nueva venta
            </Button>
          </Link>
        }
      />

      <BarraFiltrosUrl
        placeholderBusqueda="Buscar por número o nombre del cliente..."
        filtros={[
          { nombre: "desde", etiqueta: "Desde fecha", tipo: "fecha" },
          { nombre: "hasta", etiqueta: "Hasta fecha", tipo: "fecha" },
          {
            nombre: "clienteId",
            etiqueta: "Todos los clientes",
            opciones: clientesRes.data.map((c) => ({ valor: String(c.id), texto: c.nombre })),
          },
          {
            nombre: "forma",
            etiqueta: "Todas las formas de pago",
            opciones: [
              { valor: "contado", texto: "Contado" },
              { valor: "tarjeta", texto: "Tarjeta" },
              { valor: "cuenta_corriente", texto: "Cuenta corriente" },
            ],
          },
          {
            nombre: "vendedorId",
            etiqueta: "Todos los vendedores",
            opciones: listaVendedores.map((v) => ({ valor: String(v.id), texto: v.nombre })),
          },
          {
            nombre: "estado",
            etiqueta: "Todos los estados",
            opciones: [
              { valor: "emitida", texto: "Emitidas" },
              { valor: "anulada", texto: "Anuladas" },
            ],
          },
        ]}
      />

      <Card className="p-3 bg-secondary/40">
        <Alinear className="justify-between">
          <Texto tamano="sm" tono="suave">
            Total emitido según filtros actuales ({listado.total} comprobantes):
          </Texto>
          <Texto mono negrita tamano="base" className="text-primary">
            {formatearMoneda(listado.totalEmitido)}
          </Texto>
        </Alinear>
      </Card>

      {listado.data.length === 0 ? (
        <EstadoVacio
          titulo="No se encontraron facturas"
          descripcion="Probá cambiando el rango de fechas o los filtros seleccionados."
        />
      ) : (
        <>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Número</TableHead>
                <TableHead>Fecha y hora</TableHead>
                <TableHead>Cliente</TableHead>
                <TableHead>Vendedor</TableHead>
                <TableHead>Forma de pago</TableHead>
                <TableHead>Estado</TableHead>
                <TableHead className="text-right">Total</TableHead>
                <TableHead className="text-right">Comprobante</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {listado.data.map((fac) => (
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
                    {fac.cliente ? (
                      <Link
                        href={`/clientes/${fac.cliente.id}`}
                        className="font-medium hover:text-primary hover:underline"
                      >
                        {fac.cliente.nombre}
                      </Link>
                    ) : (
                      <Texto tono="suave">Consumidor final</Texto>
                    )}
                  </TableCell>
                  <TableCell>{fac.vendedor.nombre}</TableCell>
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

          <Paginador page={listado.page} pageSize={listado.pageSize} total={listado.total} />
        </>
      )}
    </Pagina>
  );
}
