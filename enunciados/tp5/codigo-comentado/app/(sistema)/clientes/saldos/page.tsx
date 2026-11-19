// ============================================================================
// ARCHIVO COMENTADO LÍNEA POR LÍNEA PARA ESTUDIO Y DEFENSA DEL SEGUNDO PARCIAL
// ============================================================================
// Pantalla de SALDOS DE CUENTAS CORRIENTES (/clientes/saldos). RF-C6.
// Clientes con deuda ordenados de mayor a menor, con el total adeudado.
// [Línea 3] Importa elementos desde 'next/link'.
import Link from "next/link";
// [Línea 4] Importa elementos desde 'lucide-react'.
import { ArrowLeft, Eye } from "lucide-react";
// [Línea 5] Importa elementos desde '@/lib/sesion'.
import { exigirUsuarioPagina } from "@/lib/sesion";
// [Línea 6] Importa elementos desde '@/servicios/clientes'.
import { listarClientes } from "@/servicios/clientes";
// [Línea 7] Importa elementos desde '@/lib/formato'.
import { formatearMoneda } from "@/lib/formato";
// [Línea 8] Importa elementos desde '@/componentes/ui/button'.
import { Button } from "@/componentes/ui/button";
// [Línea 9] Importa elementos desde '@/componentes/ui/card'.
import { Card } from "@/componentes/ui/card";
// [Línea 10] Inicia un bloque de importación de dependencias.
import {
  // [Línea 11] Importa 'Table' desde el módulo.
  Table,
  // [Línea 12] Importa 'TableBody' desde el módulo.
  TableBody,
  // [Línea 13] Importa 'TableCell' desde el módulo.
  TableCell,
  // [Línea 14] Importa 'TableHead' desde el módulo.
  TableHead,
  // [Línea 15] Importa 'TableHeader' desde el módulo.
  TableHeader,
  // [Línea 16] Importa 'TableRow' desde el módulo.
  TableRow,
// [Línea 17] Cierra la lista de importaciones provenientes del módulo '@/componentes/ui/table'.
} from "@/componentes/ui/table";
// [Línea 18] Importa elementos desde '@/componentes/comunes/encabezado-pagina'.
import { EncabezadoPagina } from "@/componentes/comunes/encabezado-pagina";
// [Línea 19] Importa elementos desde '@/componentes/comunes/estados'.
import { EstadoVacio } from "@/componentes/comunes/estados";
// [Línea 20] Importa elementos desde '@/componentes/comunes/paginador'.
import { Paginador } from "@/componentes/comunes/paginador";
// [Línea 21] Importa elementos desde '@/componentes/dominio/acciones-clientes'.
import { BotonRegistrarPago } from "@/componentes/dominio/acciones-clientes";
// [Línea 22] Importa elementos desde '@/componentes/primitivas/maquetacion'.
import { Alinear, Pagina, Texto } from "@/componentes/primitivas/maquetacion";

// [Línea 24] Define el tipo de datos 'Props' en TypeScript.
type Props = { searchParams: Promise<Record<string, string | undefined>> };

// [Línea 26] Server Component principal 'PaginaSaldosClientes': se ejecuta en el servidor, consulta los servicios y devuelve el HTML.
export default async function PaginaSaldosClientes({ searchParams }: Props) {
  // [Línea 27] Espera el resultado de la consulta/operación asíncrona y lo asigna a 'usuario'.
  const usuario = await exigirUsuarioPagina();
  // [Línea 28] Espera el resultado de la consulta/operación asíncrona y lo asigna a 'parametros'.
  const parametros = await searchParams;
  // [Línea 29] Espera el resultado de la consulta/operación asíncrona y lo asigna a 'listado'.
  const listado = await listarClientes(usuario, {
    // [Línea 30] Ejecuta o evalúa: ...parametros,
    ...parametros,
    // [Línea 31] Define o asigna el campo/parámetro 'conDeuda'.
    conDeuda: "true",
    // [Línea 32] Define o asigna el campo/parámetro 'orden'.
    orden: "saldo",
  // [Línea 33] Cierra el bloque o estructura (});).
  });

  // [Línea 35] Declara 'totalAdeudado' y le asigna el valor resultante.
  const totalAdeudado = "totalAdeudado" in listado ? listado.totalAdeudado : 0;

  // [Línea 37] Devuelve la interfaz JSX que renderiza este componente.
  return (
    <Pagina> // [Línea 38] Abre o renderiza el componente visual <Pagina>.
      <EncabezadoPagina // [Línea 39] Abre o renderiza el componente visual <EncabezadoPagina>.
        // [Línea 40] Ejecuta o evalúa: titulo="Saldos de cuentas corrientes"
        titulo="Saldos de cuentas corrientes"
        // [Línea 41] Ejecuta o evalúa: subtitulo="Clientes con deuda pendiente ordenados de mayor a menor saldo"
        subtitulo="Clientes con deuda pendiente ordenados de mayor a menor saldo"
        // [Línea 42] Ejecuta o evalúa: acciones={
        acciones={
          <Link href="/clientes"> // [Línea 43] Abre o renderiza el componente visual <Link>.
            <Button variant="outline"> // [Línea 44] Abre o renderiza el componente visual <Button>.
              <ArrowLeft className="size-4" /> // [Línea 45] Abre o renderiza el componente visual <ArrowLeft>.
              // [Línea 46] Ejecuta o evalúa: Ver todos los clientes
              Ver todos los clientes
            </Button> // [Línea 47] Cierra el componente visual </Button>.
          </Link> // [Línea 48] Cierra el componente visual </Link>.
        // [Línea 49] Cierra el bloque o estructura (}).
        }
      // [Línea 50] Ejecuta o evalúa: />
      />

      <Card className="p-4 bg-amber-50/70 border-amber-200"> // [Línea 52] Abre o renderiza el componente visual <Card>.
        <Alinear className="justify-between"> // [Línea 53] Abre o renderiza el componente visual <Alinear>.
          <Texto negrita> // [Línea 54] Abre o renderiza el componente visual <Texto>.
            // [Línea 55] Ejecuta o evalúa: Total adeudado en cuentas corrientes ({listado.total} clientes con deuda):
            Total adeudado en cuentas corrientes ({listado.total} clientes con deuda):
          </Texto> // [Línea 56] Cierra el componente visual </Texto>.
          <Texto mono negrita tamano="2xl" tono="peligro"> // [Línea 57] Abre o renderiza el componente visual <Texto>.
            // [Línea 58] Ejecuta o evalúa: {formatearMoneda(totalAdeudado)}
            {formatearMoneda(totalAdeudado)}
          </Texto> // [Línea 59] Cierra el componente visual </Texto>.
        </Alinear> // [Línea 60] Cierra el componente visual </Alinear>.
      </Card> // [Línea 61] Cierra el componente visual </Card>.

      // [Línea 63] Ejecuta o evalúa: {listado.data.length === 0 ? (
      {listado.data.length === 0 ? (
        <EstadoVacio // [Línea 64] Abre o renderiza el componente visual <EstadoVacio>.
          // [Línea 65] Ejecuta o evalúa: titulo="No hay clientes con deuda pendiente"
          titulo="No hay clientes con deuda pendiente"
          // [Línea 66] Ejecuta o evalúa: descripcion="Todas las cuentas corrientes se encuentran al día."
          descripcion="Todas las cuentas corrientes se encuentran al día."
        // [Línea 67] Ejecuta o evalúa: />
        />
      // [Línea 68] Ejecuta o evalúa: ) : (
      ) : (
        <> // [Línea 69] Abre o renderiza el componente visual <elemento>.
          <Table> // [Línea 70] Abre o renderiza el componente visual <Table>.
            <TableHeader> // [Línea 71] Abre o renderiza el componente visual <TableHeader>.
              <TableRow> // [Línea 72] Abre o renderiza el componente visual <TableRow>.
                <TableHead>Cliente</TableHead> // [Línea 73] Abre o renderiza el componente visual <TableHead>.
                <TableHead>Documento</TableHead> // [Línea 74] Abre o renderiza el componente visual <TableHead>.
                <TableHead>Teléfono</TableHead> // [Línea 75] Abre o renderiza el componente visual <TableHead>.
                <TableHead className="text-right">Límite de crédito</TableHead> // [Línea 76] Abre o renderiza el componente visual <TableHead>.
                <TableHead className="text-right">Disponible</TableHead> // [Línea 77] Abre o renderiza el componente visual <TableHead>.
                <TableHead className="text-right">Saldo adeudado</TableHead> // [Línea 78] Abre o renderiza el componente visual <TableHead>.
                <TableHead className="text-right">Acciones</TableHead> // [Línea 79] Abre o renderiza el componente visual <TableHead>.
              </TableRow> // [Línea 80] Cierra el componente visual </TableRow>.
            </TableHeader> // [Línea 81] Cierra el componente visual </TableHeader>.
            <TableBody> // [Línea 82] Abre o renderiza el componente visual <TableBody>.
              // [Línea 83] Ejecuta o evalúa: {listado.data.map((cli) => (
              {listado.data.map((cli) => (
                <TableRow key={cli.id}> // [Línea 84] Abre o renderiza el componente visual <TableRow>.
                  <TableCell> // [Línea 85] Abre o renderiza el componente visual <TableCell>.
                    <Link // [Línea 86] Abre o renderiza el componente visual <Link>.
                      // [Línea 87] Ejecuta o evalúa: href={`/clientes/${cli.id}?vista=cuenta`}
                      href={`/clientes/${cli.id}?vista=cuenta`}
                      // [Línea 88] Ejecuta o evalúa: className="font-medium hover:text-primary hover:underline"
                      className="font-medium hover:text-primary hover:underline"
                    // [Línea 89] Ejecuta o evalúa: >
                    >
                      // [Línea 90] Ejecuta o evalúa: {cli.nombre}
                      {cli.nombre}
                    </Link> // [Línea 91] Cierra el componente visual </Link>.
                  </TableCell> // [Línea 92] Cierra el componente visual </TableCell>.
                  <TableCell className="font-mono text-xs"> // [Línea 93] Abre o renderiza el componente visual <TableCell>.
                    // [Línea 94] Ejecuta o evalúa: {cli.tipoDoc} {cli.nroDoc}
                    {cli.tipoDoc} {cli.nroDoc}
                  </TableCell> // [Línea 95] Cierra el componente visual </TableCell>.
                  <TableCell className="text-xs">{cli.telefono ?? "—"}</TableCell> // [Línea 96] Abre o renderiza el componente visual <TableCell>.
                  <TableCell className="text-right font-mono text-xs"> // [Línea 97] Abre o renderiza el componente visual <TableCell>.
                    // [Línea 98] Ejecuta o evalúa: {cli.limiteCredito !== null ? formatearMoneda(cli.limiteCredito) : "Sin límite"}
                    {cli.limiteCredito !== null ? formatearMoneda(cli.limiteCredito) : "Sin límite"}
                  </TableCell> // [Línea 99] Cierra el componente visual </TableCell>.
                  <TableCell className="text-right font-mono text-xs"> // [Línea 100] Abre o renderiza el componente visual <TableCell>.
                    // [Línea 101] Ejecuta o evalúa: {cli.disponible !== null ? formatearMoneda(cli.disponible) : "Sin límite"}
                    {cli.disponible !== null ? formatearMoneda(cli.disponible) : "Sin límite"}
                  </TableCell> // [Línea 102] Cierra el componente visual </TableCell>.
                  <TableCell className="text-right font-mono font-semibold"> // [Línea 103] Abre o renderiza el componente visual <TableCell>.
                    <Texto tono="peligro">{formatearMoneda(cli.saldo)}</Texto> // [Línea 104] Abre o renderiza el componente visual <Texto>.
                  </TableCell> // [Línea 105] Cierra el componente visual </TableCell>.
                  <TableCell className="text-right"> // [Línea 106] Abre o renderiza el componente visual <TableCell>.
                    <Alinear className="justify-end gap-1.5"> // [Línea 107] Abre o renderiza el componente visual <Alinear>.
                      <Link href={`/clientes/${cli.id}?vista=cuenta`}> // [Línea 108] Abre o renderiza el componente visual <Link>.
                        <Button variant="outline" size="xs"> // [Línea 109] Abre o renderiza el componente visual <Button>.
                          <Eye className="size-3.5" /> // [Línea 110] Abre o renderiza el componente visual <Eye>.
                          // [Línea 111] Ejecuta o evalúa: Ver cuenta
                          Ver cuenta
                        </Button> // [Línea 112] Cierra el componente visual </Button>.
                      </Link> // [Línea 113] Cierra el componente visual </Link>.
                      <BotonRegistrarPago cliente={cli} /> // [Línea 114] Abre o renderiza el componente visual <BotonRegistrarPago>.
                    </Alinear> // [Línea 115] Cierra el componente visual </Alinear>.
                  </TableCell> // [Línea 116] Cierra el componente visual </TableCell>.
                </TableRow> // [Línea 117] Cierra el componente visual </TableRow>.
              // [Línea 118] Ejecuta o evalúa: ))}
              ))}
            </TableBody> // [Línea 119] Cierra el componente visual </TableBody>.
          </Table> // [Línea 120] Cierra el componente visual </Table>.

          <Paginador page={listado.page} pageSize={listado.pageSize} total={listado.total} /> // [Línea 122] Abre o renderiza el componente visual <Paginador>.
        </> // [Línea 123] Cierra el componente visual </elemento>.
      // [Línea 124] Ejecuta o evalúa: )}
      )}
    </Pagina> // [Línea 125] Cierra el componente visual </Pagina>.
  // [Línea 126] Cierra el bloque o estructura ();).
  );
// [Línea 127] Cierra el bloque o estructura (}).
}
