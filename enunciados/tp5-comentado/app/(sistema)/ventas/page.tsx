// ============================================================================
// ARCHIVO COMENTADO LÍNEA POR LÍNEA PARA ESTUDIO Y DEFENSA DEL SEGUNDO PARCIAL
// ============================================================================
// Pantalla de LISTADO DE FACTURAS (/ventas). RF-V8.
// [Línea 2] Importa elementos desde 'next/link'.
import Link from "next/link";
// [Línea 3] Importa elementos desde 'lucide-react'.
import { ShoppingCart, Eye } from "lucide-react";
// [Línea 4] Importa elementos desde '@/basedatos/conexion'.
import { db } from "@/basedatos/conexion";
// [Línea 5] Importa elementos desde '@/basedatos/esquema'.
import { usuarios } from "@/basedatos/esquema";
// [Línea 6] Importa elementos desde '@/lib/sesion'.
import { exigirUsuarioPagina } from "@/lib/sesion";
// [Línea 7] Importa elementos desde '@/servicios/facturas'.
import { listarFacturas } from "@/servicios/facturas";
// [Línea 8] Importa elementos desde '@/servicios/clientes'.
import { listarClientes } from "@/servicios/clientes";
// [Línea 9] Importa elementos desde '@/lib/formato'.
import { formatearFechaHora, formatearMoneda } from "@/lib/formato";
// [Línea 10] Importa elementos desde '@/componentes/ui/button'.
import { Button } from "@/componentes/ui/button";
// [Línea 11] Importa elementos desde '@/componentes/ui/card'.
import { Card } from "@/componentes/ui/card";
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
// [Línea 22] Importa elementos desde '@/componentes/comunes/insignias'.
import { InsigniaEstadoFactura, InsigniaFormaPago } from "@/componentes/comunes/insignias";
// [Línea 23] Importa elementos desde '@/componentes/comunes/paginador'.
import { Paginador } from "@/componentes/comunes/paginador";
// [Línea 24] Importa elementos desde '@/componentes/comunes/estados'.
import { EstadoVacio } from "@/componentes/comunes/estados";
// [Línea 25] Importa elementos desde '@/componentes/primitivas/maquetacion'.
import { Alinear, Pagina, Texto } from "@/componentes/primitivas/maquetacion";

// [Línea 27] Define el tipo de datos 'Props' en TypeScript.
type Props = { searchParams: Promise<Record<string, string | undefined>> };

// [Línea 29] Server Component principal 'PaginaFacturas': se ejecuta en el servidor, consulta los servicios y devuelve el HTML.
export default async function PaginaFacturas({ searchParams }: Props) {
  // [Línea 30] Espera el resultado de la consulta/operación asíncrona y lo asigna a 'usuario'.
  const usuario = await exigirUsuarioPagina();
  // [Línea 31] Espera el resultado de la consulta/operación asíncrona y lo asigna a 'parametros'.
  const parametros = await searchParams;

  // [Línea 33] Espera el resultado de la consulta/operación asíncrona y lo asigna a '[listado, clientesRes, listaVendedores]'.
  const [listado, clientesRes, listaVendedores] = await Promise.all([
    // [Línea 34] Ejecuta o evalúa: listarFacturas(usuario, parametros),
    listarFacturas(usuario, parametros),
    // [Línea 35] Ejecuta o evalúa: listarClientes(usuario, { pageSize: "100" }),
    listarClientes(usuario, { pageSize: "100" }),
    // [Línea 36] Ejecuta o evalúa: db.select({ id: usuarios.id, nombre: usuarios.nombre }).from(usuarios),
    db.select({ id: usuarios.id, nombre: usuarios.nombre }).from(usuarios),
  // [Línea 37] Cierra el bloque o estructura (]);).
  ]);

  // [Línea 39] Devuelve la interfaz JSX que renderiza este componente.
  return (
    <Pagina> // [Línea 40] Abre o renderiza el componente visual <Pagina>.
      <EncabezadoPagina // [Línea 41] Abre o renderiza el componente visual <EncabezadoPagina>.
        // [Línea 42] Ejecuta o evalúa: titulo="Facturas"
        titulo="Facturas"
        // [Línea 43] Ejecuta o evalúa: subtitulo="Historial de comprobantes emitidos y anulados"
        subtitulo="Historial de comprobantes emitidos y anulados"
        // [Línea 44] Ejecuta o evalúa: acciones={
        acciones={
          <Link href="/ventas/nueva"> // [Línea 45] Abre o renderiza el componente visual <Link>.
            <Button> // [Línea 46] Abre o renderiza el componente visual <Button>.
              <ShoppingCart className="size-4" /> // [Línea 47] Abre o renderiza el componente visual <ShoppingCart>.
              // [Línea 48] Ejecuta o evalúa: Nueva venta
              Nueva venta
            </Button> // [Línea 49] Cierra el componente visual </Button>.
          </Link> // [Línea 50] Cierra el componente visual </Link>.
        // [Línea 51] Cierra el bloque o estructura (}).
        }
      // [Línea 52] Ejecuta o evalúa: />
      />

      <BarraFiltrosUrl // [Línea 54] Abre o renderiza el componente visual <BarraFiltrosUrl>.
        // [Línea 55] Ejecuta o evalúa: placeholderBusqueda="Buscar por número o nombre del cliente..."
        placeholderBusqueda="Buscar por número o nombre del cliente..."
        // [Línea 56] Ejecuta o evalúa: filtros={[
        filtros={[
          // [Línea 57] Ejecuta o evalúa: { nombre: "desde", etiqueta: "Desde fecha", tipo: "fecha" },
          { nombre: "desde", etiqueta: "Desde fecha", tipo: "fecha" },
          // [Línea 58] Ejecuta o evalúa: { nombre: "hasta", etiqueta: "Hasta fecha", tipo: "fecha" },
          { nombre: "hasta", etiqueta: "Hasta fecha", tipo: "fecha" },
          // [Línea 59] Ejecuta o evalúa: {
          {
            // [Línea 60] Define o asigna el campo/parámetro 'nombre'.
            nombre: "clienteId",
            // [Línea 61] Define o asigna el campo/parámetro 'etiqueta'.
            etiqueta: "Todos los clientes",
            // [Línea 62] Define o asigna el campo/parámetro 'opciones'.
            opciones: clientesRes.data.map((c) => ({ valor: String(c.id), texto: c.nombre })),
          // [Línea 63] Cierra el bloque o estructura (},).
          },
          // [Línea 64] Ejecuta o evalúa: {
          {
            // [Línea 65] Define o asigna el campo/parámetro 'nombre'.
            nombre: "forma",
            // [Línea 66] Define o asigna el campo/parámetro 'etiqueta'.
            etiqueta: "Todas las formas de pago",
            // [Línea 67] Define o asigna el campo/parámetro 'opciones'.
            opciones: [
              // [Línea 68] Ejecuta o evalúa: { valor: "contado", texto: "Contado" },
              { valor: "contado", texto: "Contado" },
              // [Línea 69] Ejecuta o evalúa: { valor: "tarjeta", texto: "Tarjeta" },
              { valor: "tarjeta", texto: "Tarjeta" },
              // [Línea 70] Ejecuta o evalúa: { valor: "cuenta_corriente", texto: "Cuenta corriente" },
              { valor: "cuenta_corriente", texto: "Cuenta corriente" },
            // [Línea 71] Ejecuta o evalúa: ],
            ],
          // [Línea 72] Cierra el bloque o estructura (},).
          },
          // [Línea 73] Ejecuta o evalúa: {
          {
            // [Línea 74] Define o asigna el campo/parámetro 'nombre'.
            nombre: "vendedorId",
            // [Línea 75] Define o asigna el campo/parámetro 'etiqueta'.
            etiqueta: "Todos los vendedores",
            // [Línea 76] Define o asigna el campo/parámetro 'opciones'.
            opciones: listaVendedores.map((v) => ({ valor: String(v.id), texto: v.nombre })),
          // [Línea 77] Cierra el bloque o estructura (},).
          },
          // [Línea 78] Ejecuta o evalúa: {
          {
            // [Línea 79] Define o asigna el campo/parámetro 'nombre'.
            nombre: "estado",
            // [Línea 80] Define o asigna el campo/parámetro 'etiqueta'.
            etiqueta: "Todos los estados",
            // [Línea 81] Define o asigna el campo/parámetro 'opciones'.
            opciones: [
              // [Línea 82] Ejecuta o evalúa: { valor: "emitida", texto: "Emitidas" },
              { valor: "emitida", texto: "Emitidas" },
              // [Línea 83] Ejecuta o evalúa: { valor: "anulada", texto: "Anuladas" },
              { valor: "anulada", texto: "Anuladas" },
            // [Línea 84] Ejecuta o evalúa: ],
            ],
          // [Línea 85] Cierra el bloque o estructura (},).
          },
        // [Línea 86] Ejecuta o evalúa: ]}
        ]}
      // [Línea 87] Ejecuta o evalúa: />
      />

      <Card className="p-3 bg-secondary/40"> // [Línea 89] Abre o renderiza el componente visual <Card>.
        <Alinear className="justify-between"> // [Línea 90] Abre o renderiza el componente visual <Alinear>.
          <Texto tamano="sm" tono="suave"> // [Línea 91] Abre o renderiza el componente visual <Texto>.
            // [Línea 92] Ejecuta o evalúa: Total emitido según filtros actuales ({listado.total} comprobantes):
            Total emitido según filtros actuales ({listado.total} comprobantes):
          </Texto> // [Línea 93] Cierra el componente visual </Texto>.
          <Texto mono negrita tamano="base" className="text-primary"> // [Línea 94] Abre o renderiza el componente visual <Texto>.
            // [Línea 95] Ejecuta o evalúa: {formatearMoneda(listado.totalEmitido)}
            {formatearMoneda(listado.totalEmitido)}
          </Texto> // [Línea 96] Cierra el componente visual </Texto>.
        </Alinear> // [Línea 97] Cierra el componente visual </Alinear>.
      </Card> // [Línea 98] Cierra el componente visual </Card>.

      // [Línea 100] Ejecuta o evalúa: {listado.data.length === 0 ? (
      {listado.data.length === 0 ? (
        <EstadoVacio // [Línea 101] Abre o renderiza el componente visual <EstadoVacio>.
          // [Línea 102] Ejecuta o evalúa: titulo="No se encontraron facturas"
          titulo="No se encontraron facturas"
          // [Línea 103] Ejecuta o evalúa: descripcion="Probá cambiando el rango de fechas o los filtros seleccionados."
          descripcion="Probá cambiando el rango de fechas o los filtros seleccionados."
        // [Línea 104] Ejecuta o evalúa: />
        />
      // [Línea 105] Ejecuta o evalúa: ) : (
      ) : (
        <> // [Línea 106] Abre o renderiza el componente visual <elemento>.
          <Table> // [Línea 107] Abre o renderiza el componente visual <Table>.
            <TableHeader> // [Línea 108] Abre o renderiza el componente visual <TableHeader>.
              <TableRow> // [Línea 109] Abre o renderiza el componente visual <TableRow>.
                <TableHead>Número</TableHead> // [Línea 110] Abre o renderiza el componente visual <TableHead>.
                <TableHead>Fecha y hora</TableHead> // [Línea 111] Abre o renderiza el componente visual <TableHead>.
                <TableHead>Cliente</TableHead> // [Línea 112] Abre o renderiza el componente visual <TableHead>.
                <TableHead>Vendedor</TableHead> // [Línea 113] Abre o renderiza el componente visual <TableHead>.
                <TableHead>Forma de pago</TableHead> // [Línea 114] Abre o renderiza el componente visual <TableHead>.
                <TableHead>Estado</TableHead> // [Línea 115] Abre o renderiza el componente visual <TableHead>.
                <TableHead className="text-right">Total</TableHead> // [Línea 116] Abre o renderiza el componente visual <TableHead>.
                <TableHead className="text-right">Comprobante</TableHead> // [Línea 117] Abre o renderiza el componente visual <TableHead>.
              </TableRow> // [Línea 118] Cierra el componente visual </TableRow>.
            </TableHeader> // [Línea 119] Cierra el componente visual </TableHeader>.
            <TableBody> // [Línea 120] Abre o renderiza el componente visual <TableBody>.
              // [Línea 121] Ejecuta o evalúa: {listado.data.map((fac) => (
              {listado.data.map((fac) => (
                <TableRow key={fac.id}> // [Línea 122] Abre o renderiza el componente visual <TableRow>.
                  <TableCell className="font-mono font-medium"> // [Línea 123] Abre o renderiza el componente visual <TableCell>.
                    <Link // [Línea 124] Abre o renderiza el componente visual <Link>.
                      // [Línea 125] Ejecuta o evalúa: href={`/ventas/${fac.id}`}
                      href={`/ventas/${fac.id}`}
                      // [Línea 126] Ejecuta o evalúa: className="hover:text-primary hover:underline"
                      className="hover:text-primary hover:underline"
                    // [Línea 127] Ejecuta o evalúa: >
                    >
                      // [Línea 128] Ejecuta o evalúa: {fac.numeroFormateado}
                      {fac.numeroFormateado}
                    </Link> // [Línea 129] Cierra el componente visual </Link>.
                  </TableCell> // [Línea 130] Cierra el componente visual </TableCell>.
                  <TableCell className="text-xs text-muted-foreground"> // [Línea 131] Abre o renderiza el componente visual <TableCell>.
                    // [Línea 132] Ejecuta o evalúa: {formatearFechaHora(fac.fecha)}
                    {formatearFechaHora(fac.fecha)}
                  </TableCell> // [Línea 133] Cierra el componente visual </TableCell>.
                  <TableCell> // [Línea 134] Abre o renderiza el componente visual <TableCell>.
                    // [Línea 135] Ejecuta o evalúa: {fac.cliente ? (
                    {fac.cliente ? (
                      <Link // [Línea 136] Abre o renderiza el componente visual <Link>.
                        // [Línea 137] Ejecuta o evalúa: href={`/clientes/${fac.cliente.id}`}
                        href={`/clientes/${fac.cliente.id}`}
                        // [Línea 138] Ejecuta o evalúa: className="font-medium hover:text-primary hover:underline"
                        className="font-medium hover:text-primary hover:underline"
                      // [Línea 139] Ejecuta o evalúa: >
                      >
                        // [Línea 140] Ejecuta o evalúa: {fac.cliente.nombre}
                        {fac.cliente.nombre}
                      </Link> // [Línea 141] Cierra el componente visual </Link>.
                    // [Línea 142] Ejecuta o evalúa: ) : (
                    ) : (
                      <Texto tono="suave">Consumidor final</Texto> // [Línea 143] Abre o renderiza el componente visual <Texto>.
                    // [Línea 144] Ejecuta o evalúa: )}
                    )}
                  </TableCell> // [Línea 145] Cierra el componente visual </TableCell>.
                  <TableCell>{fac.vendedor.nombre}</TableCell> // [Línea 146] Abre o renderiza el componente visual <TableCell>.
                  <TableCell> // [Línea 147] Abre o renderiza el componente visual <TableCell>.
                    <InsigniaFormaPago forma={fac.formaPago} /> // [Línea 148] Abre o renderiza el componente visual <InsigniaFormaPago>.
                  </TableCell> // [Línea 149] Cierra el componente visual </TableCell>.
                  <TableCell> // [Línea 150] Abre o renderiza el componente visual <TableCell>.
                    <InsigniaEstadoFactura estado={fac.estado} /> // [Línea 151] Abre o renderiza el componente visual <InsigniaEstadoFactura>.
                  </TableCell> // [Línea 152] Cierra el componente visual </TableCell>.
                  <TableCell className="text-right font-mono font-semibold"> // [Línea 153] Abre o renderiza el componente visual <TableCell>.
                    // [Línea 154] Ejecuta o evalúa: {formatearMoneda(fac.total)}
                    {formatearMoneda(fac.total)}
                  </TableCell> // [Línea 155] Cierra el componente visual </TableCell>.
                  <TableCell className="text-right"> // [Línea 156] Abre o renderiza el componente visual <TableCell>.
                    <Link href={`/ventas/${fac.id}`}> // [Línea 157] Abre o renderiza el componente visual <Link>.
                      <Button variant="outline" size="xs"> // [Línea 158] Abre o renderiza el componente visual <Button>.
                        <Eye className="size-3.5" /> // [Línea 159] Abre o renderiza el componente visual <Eye>.
                        // [Línea 160] Ejecuta o evalúa: Ver
                        Ver
                      </Button> // [Línea 161] Cierra el componente visual </Button>.
                    </Link> // [Línea 162] Cierra el componente visual </Link>.
                  </TableCell> // [Línea 163] Cierra el componente visual </TableCell>.
                </TableRow> // [Línea 164] Cierra el componente visual </TableRow>.
              // [Línea 165] Ejecuta o evalúa: ))}
              ))}
            </TableBody> // [Línea 166] Cierra el componente visual </TableBody>.
          </Table> // [Línea 167] Cierra el componente visual </Table>.

          <Paginador page={listado.page} pageSize={listado.pageSize} total={listado.total} /> // [Línea 169] Abre o renderiza el componente visual <Paginador>.
        </> // [Línea 170] Cierra el componente visual </elemento>.
      // [Línea 171] Ejecuta o evalúa: )}
      )}
    </Pagina> // [Línea 172] Cierra el componente visual </Pagina>.
  // [Línea 173] Cierra el bloque o estructura ();).
  );
// [Línea 174] Cierra el bloque o estructura (}).
}
