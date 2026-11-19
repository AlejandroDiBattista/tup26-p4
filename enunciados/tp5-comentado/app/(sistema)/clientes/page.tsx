// ============================================================================
// ARCHIVO COMENTADO LÍNEA POR LÍNEA PARA ESTUDIO Y DEFENSA DEL SEGUNDO PARCIAL
// ============================================================================
// Pantalla de CLIENTES (/clientes). RF-C1, RF-C2, RF-C7.
// [Línea 2] Importa elementos desde 'next/link'.
import Link from "next/link";
// [Línea 3] Importa elementos desde 'lucide-react'.
import { Eye, Wallet } from "lucide-react";
// [Línea 4] Importa elementos desde '@/lib/sesion'.
import { exigirUsuarioPagina } from "@/lib/sesion";
// [Línea 5] Importa elementos desde '@/servicios/clientes'.
import { listarClientes } from "@/servicios/clientes";
// [Línea 6] Importa elementos desde '@/lib/formato'.
import { formatearMoneda } from "@/lib/formato";
// [Línea 7] Importa elementos desde '@/componentes/ui/button'.
import { Button } from "@/componentes/ui/button";
// [Línea 8] Importa elementos desde '@/componentes/ui/badge'.
import { Badge } from "@/componentes/ui/badge";
// [Línea 9] Inicia un bloque de importación de dependencias.
import {
  // [Línea 10] Importa 'Table' desde el módulo.
  Table,
  // [Línea 11] Importa 'TableBody' desde el módulo.
  TableBody,
  // [Línea 12] Importa 'TableCell' desde el módulo.
  TableCell,
  // [Línea 13] Importa 'TableHead' desde el módulo.
  TableHead,
  // [Línea 14] Importa 'TableHeader' desde el módulo.
  TableHeader,
  // [Línea 15] Importa 'TableRow' desde el módulo.
  TableRow,
// [Línea 16] Cierra la lista de importaciones provenientes del módulo '@/componentes/ui/table'.
} from "@/componentes/ui/table";
// [Línea 17] Importa elementos desde '@/componentes/comunes/encabezado-pagina'.
import { EncabezadoPagina } from "@/componentes/comunes/encabezado-pagina";
// [Línea 18] Importa elementos desde '@/componentes/comunes/filtros-url'.
import { BarraFiltrosUrl } from "@/componentes/comunes/filtros-url";
// [Línea 19] Importa elementos desde '@/componentes/comunes/insignias'.
import { InsigniaActivo } from "@/componentes/comunes/insignias";
// [Línea 20] Importa elementos desde '@/componentes/comunes/paginador'.
import { Paginador } from "@/componentes/comunes/paginador";
// [Línea 21] Importa elementos desde '@/componentes/comunes/estados'.
import { EstadoVacio } from "@/componentes/comunes/estados";
// [Línea 22] Inicia un bloque de importación de dependencias.
import {
  // [Línea 23] Importa 'BotonNuevoCliente' desde el módulo.
  BotonNuevoCliente,
  // [Línea 24] Importa 'BotonesEditarCliente' desde el módulo.
  BotonesEditarCliente,
  // [Línea 25] Importa 'BotonRegistrarPago' desde el módulo.
  BotonRegistrarPago,
// [Línea 26] Cierra la lista de importaciones provenientes del módulo '@/componentes/dominio/acciones-clientes'.
} from "@/componentes/dominio/acciones-clientes";
// [Línea 27] Importa elementos desde '@/componentes/primitivas/maquetacion'.
import { Alinear, Pagina, Texto } from "@/componentes/primitivas/maquetacion";

// [Línea 29] Define el tipo de datos 'Props' en TypeScript.
type Props = { searchParams: Promise<Record<string, string | undefined>> };

// [Línea 31] Server Component principal 'PaginaClientes': se ejecuta en el servidor, consulta los servicios y devuelve el HTML.
export default async function PaginaClientes({ searchParams }: Props) {
  // [Línea 32] Espera el resultado de la consulta/operación asíncrona y lo asigna a 'usuario'.
  const usuario = await exigirUsuarioPagina();
  // [Línea 33] Espera el resultado de la consulta/operación asíncrona y lo asigna a 'parametros'.
  const parametros = await searchParams;
  // [Línea 34] Espera el resultado de la consulta/operación asíncrona y lo asigna a 'listado'.
  const listado = await listarClientes(usuario, parametros);

  // [Línea 36] Devuelve la interfaz JSX que renderiza este componente.
  return (
    <Pagina> // [Línea 37] Abre o renderiza el componente visual <Pagina>.
      <EncabezadoPagina // [Línea 38] Abre o renderiza el componente visual <EncabezadoPagina>.
        // [Línea 39] Ejecuta o evalúa: titulo="Clientes"
        titulo="Clientes"
        // [Línea 40] Ejecuta o evalúa: subtitulo="Padrón de clientes registrados, condición de cuenta corriente y saldo
        subtitulo="Padrón de clientes registrados, condición de cuenta corriente y saldo actual"
        // [Línea 41] Ejecuta o evalúa: acciones={
        acciones={
          <Alinear className="gap-2"> // [Línea 42] Abre o renderiza el componente visual <Alinear>.
            <Link href="/clientes/saldos"> // [Línea 43] Abre o renderiza el componente visual <Link>.
              <Button variant="outline"> // [Línea 44] Abre o renderiza el componente visual <Button>.
                <Wallet className="size-4" /> // [Línea 45] Abre o renderiza el componente visual <Wallet>.
                // [Línea 46] Ejecuta o evalúa: Ver clientes con deuda
                Ver clientes con deuda
              </Button> // [Línea 47] Cierra el componente visual </Button>.
            </Link> // [Línea 48] Cierra el componente visual </Link>.
            <BotonNuevoCliente /> // [Línea 49] Abre o renderiza el componente visual <BotonNuevoCliente>.
          </Alinear> // [Línea 50] Cierra el componente visual </Alinear>.
        // [Línea 51] Cierra el bloque o estructura (}).
        }
      // [Línea 52] Ejecuta o evalúa: />
      />

      <BarraFiltrosUrl // [Línea 54] Abre o renderiza el componente visual <BarraFiltrosUrl>.
        // [Línea 55] Ejecuta o evalúa: placeholderBusqueda="Buscar cliente por nombre, DNI o CUIT (con o sin puntos)...
        placeholderBusqueda="Buscar cliente por nombre, DNI o CUIT (con o sin puntos)..."
        // [Línea 56] Ejecuta o evalúa: filtros={[
        filtros={[
          // [Línea 57] Ejecuta o evalúa: {
          {
            // [Línea 58] Define o asigna el campo/parámetro 'nombre'.
            nombre: "orden",
            // [Línea 59] Define o asigna el campo/parámetro 'etiqueta'.
            etiqueta: "Ordenar por nombre",
            // [Línea 60] Define o asigna el campo/parámetro 'opciones'.
            opciones: [{ valor: "saldo", texto: "Ordenar por mayor saldo" }],
          // [Línea 61] Cierra el bloque o estructura (},).
          },
          // [Línea 62] Ejecuta o evalúa: {
          {
            // [Línea 63] Define o asigna el campo/parámetro 'nombre'.
            nombre: "activo",
            // [Línea 64] Define o asigna el campo/parámetro 'etiqueta'.
            etiqueta: "Solo clientes activos",
            // [Línea 65] Define o asigna el campo/parámetro 'opciones'.
            opciones: [{ valor: "todos", texto: "Activos y dados de baja" }],
          // [Línea 66] Cierra el bloque o estructura (},).
          },
        // [Línea 67] Ejecuta o evalúa: ]}
        ]}
      // [Línea 68] Ejecuta o evalúa: />
      />

      // [Línea 70] Ejecuta o evalúa: {listado.data.length === 0 ? (
      {listado.data.length === 0 ? (
        <EstadoVacio // [Línea 71] Abre o renderiza el componente visual <EstadoVacio>.
          // [Línea 72] Ejecuta o evalúa: titulo="No se encontraron clientes"
          titulo="No se encontraron clientes"
          // [Línea 73] Ejecuta o evalúa: descripcion="Probá cambiando el texto de búsqueda o registrá un cliente nuevo."
          descripcion="Probá cambiando el texto de búsqueda o registrá un cliente nuevo."
        // [Línea 74] Ejecuta o evalúa: />
        />
      // [Línea 75] Ejecuta o evalúa: ) : (
      ) : (
        <> // [Línea 76] Abre o renderiza el componente visual <elemento>.
          <Table> // [Línea 77] Abre o renderiza el componente visual <Table>.
            <TableHeader> // [Línea 78] Abre o renderiza el componente visual <TableHeader>.
              <TableRow> // [Línea 79] Abre o renderiza el componente visual <TableRow>.
                <TableHead>Nombre o razón social</TableHead> // [Línea 80] Abre o renderiza el componente visual <TableHead>.
                <TableHead>Documento</TableHead> // [Línea 81] Abre o renderiza el componente visual <TableHead>.
                <TableHead>Teléfono / Email</TableHead> // [Línea 82] Abre o renderiza el componente visual <TableHead>.
                <TableHead>Cuenta corriente</TableHead> // [Línea 83] Abre o renderiza el componente visual <TableHead>.
                <TableHead className="text-right">Límite crédito</TableHead> // [Línea 84] Abre o renderiza el componente visual <TableHead>.
                <TableHead className="text-right">Saldo actual</TableHead> // [Línea 85] Abre o renderiza el componente visual <TableHead>.
                <TableHead>Estado</TableHead> // [Línea 86] Abre o renderiza el componente visual <TableHead>.
                <TableHead className="text-right">Acciones</TableHead> // [Línea 87] Abre o renderiza el componente visual <TableHead>.
              </TableRow> // [Línea 88] Cierra el componente visual </TableRow>.
            </TableHeader> // [Línea 89] Cierra el componente visual </TableHeader>.
            <TableBody> // [Línea 90] Abre o renderiza el componente visual <TableBody>.
              // [Línea 91] Ejecuta o evalúa: {listado.data.map((cli) => (
              {listado.data.map((cli) => (
                <TableRow key={cli.id}> // [Línea 92] Abre o renderiza el componente visual <TableRow>.
                  <TableCell> // [Línea 93] Abre o renderiza el componente visual <TableCell>.
                    <Link // [Línea 94] Abre o renderiza el componente visual <Link>.
                      // [Línea 95] Ejecuta o evalúa: href={`/clientes/${cli.id}`}
                      href={`/clientes/${cli.id}`}
                      // [Línea 96] Ejecuta o evalúa: className="font-medium hover:text-primary hover:underline"
                      className="font-medium hover:text-primary hover:underline"
                    // [Línea 97] Ejecuta o evalúa: >
                    >
                      // [Línea 98] Ejecuta o evalúa: {cli.nombre}
                      {cli.nombre}
                    </Link> // [Línea 99] Cierra el componente visual </Link>.
                  </TableCell> // [Línea 100] Cierra el componente visual </TableCell>.
                  <TableCell className="font-mono text-xs"> // [Línea 101] Abre o renderiza el componente visual <TableCell>.
                    // [Línea 102] Ejecuta o evalúa: {cli.tipoDoc} {cli.nroDoc}
                    {cli.tipoDoc} {cli.nroDoc}
                  </TableCell> // [Línea 103] Cierra el componente visual </TableCell>.
                  <TableCell className="text-xs text-muted-foreground"> // [Línea 104] Abre o renderiza el componente visual <TableCell>.
                    // [Línea 105] Ejecuta o evalúa: {cli.telefono ?? "—"}
                    {cli.telefono ?? "—"}
                    // [Línea 106] Ejecuta o evalúa: {cli.email ? ` · ${cli.email}` : ""}
                    {cli.email ? ` · ${cli.email}` : ""}
                  </TableCell> // [Línea 107] Cierra el componente visual </TableCell>.
                  <TableCell> // [Línea 108] Abre o renderiza el componente visual <TableCell>.
                    // [Línea 109] Ejecuta o evalúa: {cli.cuentaCorriente ? (
                    {cli.cuentaCorriente ? (
                      <Badge variant="success">Habilitada</Badge> // [Línea 110] Abre o renderiza el componente visual <Badge>.
                    // [Línea 111] Ejecuta o evalúa: ) : (
                    ) : (
                      <Badge variant="secondary">No habilitada</Badge> // [Línea 112] Abre o renderiza el componente visual <Badge>.
                    // [Línea 113] Ejecuta o evalúa: )}
                    )}
                  </TableCell> // [Línea 114] Cierra el componente visual </TableCell>.
                  <TableCell className="text-right font-mono text-xs"> // [Línea 115] Abre o renderiza el componente visual <TableCell>.
                    // [Línea 116] Ejecuta o evalúa: {cli.cuentaCorriente
                    {cli.cuentaCorriente
                      // [Línea 117] Ejecuta o evalúa: ? cli.limiteCredito !== null
                      ? cli.limiteCredito !== null
                        // [Línea 118] Ejecuta o evalúa: ? formatearMoneda(cli.limiteCredito)
                        ? formatearMoneda(cli.limiteCredito)
                        // [Línea 119] Ejecuta o evalúa: : "Sin límite"
                        : "Sin límite"
                      // [Línea 120] Ejecuta o evalúa: : "—"}
                      : "—"}
                  </TableCell> // [Línea 121] Cierra el componente visual </TableCell>.
                  <TableCell className="text-right font-mono font-semibold"> // [Línea 122] Abre o renderiza el componente visual <TableCell>.
                    <Texto tono={cli.saldo > 0 ? "peligro" : "normal"}> // [Línea 123] Abre o renderiza el componente visual <Texto>.
                      // [Línea 124] Ejecuta o evalúa: {formatearMoneda(cli.saldo)}
                      {formatearMoneda(cli.saldo)}
                    </Texto> // [Línea 125] Cierra el componente visual </Texto>.
                  </TableCell> // [Línea 126] Cierra el componente visual </TableCell>.
                  <TableCell> // [Línea 127] Abre o renderiza el componente visual <TableCell>.
                    <InsigniaActivo activo={cli.activo} textoInactivo="Baja" /> // [Línea 128] Abre o renderiza el componente visual <InsigniaActivo>.
                  </TableCell> // [Línea 129] Cierra el componente visual </TableCell>.
                  <TableCell className="text-right"> // [Línea 130] Abre o renderiza el componente visual <TableCell>.
                    <Alinear className="justify-end gap-1.5"> // [Línea 131] Abre o renderiza el componente visual <Alinear>.
                      <Link href={`/clientes/${cli.id}`}> // [Línea 132] Abre o renderiza el componente visual <Link>.
                        <Button variant="outline" size="xs"> // [Línea 133] Abre o renderiza el componente visual <Button>.
                          <Eye className="size-3.5" /> // [Línea 134] Abre o renderiza el componente visual <Eye>.
                          // [Línea 135] Ejecuta o evalúa: Ficha / Cta.
                          Ficha / Cta.
                        </Button> // [Línea 136] Cierra el componente visual </Button>.
                      </Link> // [Línea 137] Cierra el componente visual </Link>.
                      <BotonRegistrarPago cliente={cli} /> // [Línea 138] Abre o renderiza el componente visual <BotonRegistrarPago>.
                      <BotonesEditarCliente cliente={cli} /> // [Línea 139] Abre o renderiza el componente visual <BotonesEditarCliente>.
                    </Alinear> // [Línea 140] Cierra el componente visual </Alinear>.
                  </TableCell> // [Línea 141] Cierra el componente visual </TableCell>.
                </TableRow> // [Línea 142] Cierra el componente visual </TableRow>.
              // [Línea 143] Ejecuta o evalúa: ))}
              ))}
            </TableBody> // [Línea 144] Cierra el componente visual </TableBody>.
          </Table> // [Línea 145] Cierra el componente visual </Table>.

          <Paginador page={listado.page} pageSize={listado.pageSize} total={listado.total} /> // [Línea 147] Abre o renderiza el componente visual <Paginador>.
        </> // [Línea 148] Cierra el componente visual </elemento>.
      // [Línea 149] Ejecuta o evalúa: )}
      )}
    </Pagina> // [Línea 150] Cierra el componente visual </Pagina>.
  // [Línea 151] Cierra el bloque o estructura ();).
  );
// [Línea 152] Cierra el bloque o estructura (}).
}
