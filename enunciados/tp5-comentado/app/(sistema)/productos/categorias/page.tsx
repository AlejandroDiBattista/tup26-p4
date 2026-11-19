// ============================================================================
// ARCHIVO COMENTADO LÍNEA POR LÍNEA PARA ESTUDIO Y DEFENSA DEL SEGUNDO PARCIAL
// ============================================================================
// Pantalla de CATEGORÍAS DE PRODUCTOS (/productos/categorias). RF-P7.
// [Línea 2] Importa elementos desde 'next/link'.
import Link from "next/link";
// [Línea 3] Importa elementos desde 'lucide-react'.
import { ArrowLeft } from "lucide-react";
// [Línea 4] Importa elementos desde '@/lib/sesion'.
import { exigirUsuarioPagina } from "@/lib/sesion";
// [Línea 5] Importa elementos desde '@/servicios/categorias'.
import { listarCategorias } from "@/servicios/categorias";
// [Línea 6] Importa elementos desde '@/componentes/ui/button'.
import { Button } from "@/componentes/ui/button";
// [Línea 7] Inicia un bloque de importación de dependencias.
import {
  // [Línea 8] Importa 'Table' desde el módulo.
  Table,
  // [Línea 9] Importa 'TableBody' desde el módulo.
  TableBody,
  // [Línea 10] Importa 'TableCell' desde el módulo.
  TableCell,
  // [Línea 11] Importa 'TableHead' desde el módulo.
  TableHead,
  // [Línea 12] Importa 'TableHeader' desde el módulo.
  TableHeader,
  // [Línea 13] Importa 'TableRow' desde el módulo.
  TableRow,
// [Línea 14] Cierra la lista de importaciones provenientes del módulo '@/componentes/ui/table'.
} from "@/componentes/ui/table";
// [Línea 15] Importa elementos desde '@/componentes/comunes/encabezado-pagina'.
import { EncabezadoPagina } from "@/componentes/comunes/encabezado-pagina";
// [Línea 16] Importa elementos desde '@/componentes/comunes/insignias'.
import { InsigniaActivo } from "@/componentes/comunes/insignias";
// [Línea 17] Importa elementos desde '@/componentes/comunes/estados'.
import { EstadoVacio } from "@/componentes/comunes/estados";
// [Línea 18] Inicia un bloque de importación de dependencias.
import {
  // [Línea 19] Importa 'AccionesFilaCategoria' desde el módulo.
  AccionesFilaCategoria,
  // [Línea 20] Importa 'BotonNuevaCategoria' desde el módulo.
  BotonNuevaCategoria,
// [Línea 21] Cierra la lista de importaciones provenientes del módulo '@/componentes/dominio/acciones-categorias'.
} from "@/componentes/dominio/acciones-categorias";
// [Línea 22] Importa elementos desde '@/componentes/primitivas/maquetacion'.
import { Alinear, Pagina } from "@/componentes/primitivas/maquetacion";

// [Línea 24] Server Component principal 'PaginaCategorias': se ejecuta en el servidor, consulta los servicios y devuelve el HTML.
export default async function PaginaCategorias() {
  // [Línea 25] Espera el resultado de la consulta/operación asíncrona y lo asigna a 'usuario'.
  const usuario = await exigirUsuarioPagina();
  // [Línea 26] Declara 'esAdmin' y le asigna el valor resultante.
  const esAdmin = usuario.rol === "admin";
  // [Línea 27] Espera el resultado de la consulta/operación asíncrona y lo asigna a 'categorias'.
  const categorias = await listarCategorias(usuario, { todas: esAdmin ? "true" : "false" });

  // [Línea 29] Devuelve la interfaz JSX que renderiza este componente.
  return (
    <Pagina> // [Línea 30] Abre o renderiza el componente visual <Pagina>.
      <EncabezadoPagina // [Línea 31] Abre o renderiza el componente visual <EncabezadoPagina>.
        // [Línea 32] Ejecuta o evalúa: titulo="Categorías de productos"
        titulo="Categorías de productos"
        // [Línea 33] Ejecuta o evalúa: subtitulo="Clasificación del catálogo comercial"
        subtitulo="Clasificación del catálogo comercial"
        // [Línea 34] Ejecuta o evalúa: acciones={
        acciones={
          <Alinear className="gap-2"> // [Línea 35] Abre o renderiza el componente visual <Alinear>.
            <Link href="/productos"> // [Línea 36] Abre o renderiza el componente visual <Link>.
              <Button variant="outline"> // [Línea 37] Abre o renderiza el componente visual <Button>.
                <ArrowLeft className="size-4" /> // [Línea 38] Abre o renderiza el componente visual <ArrowLeft>.
                // [Línea 39] Ejecuta o evalúa: Volver a productos
                Volver a productos
              </Button> // [Línea 40] Cierra el componente visual </Button>.
            </Link> // [Línea 41] Cierra el componente visual </Link>.
            // [Línea 42] Ejecuta o evalúa: {esAdmin && <BotonNuevaCategoria />}
            {esAdmin && <BotonNuevaCategoria />}
          </Alinear> // [Línea 43] Cierra el componente visual </Alinear>.
        // [Línea 44] Cierra el bloque o estructura (}).
        }
      // [Línea 45] Ejecuta o evalúa: />
      />

      // [Línea 47] Ejecuta o evalúa: {categorias.length === 0 ? (
      {categorias.length === 0 ? (
        <EstadoVacio titulo="No hay categorías registradas" /> // [Línea 48] Abre o renderiza el componente visual <EstadoVacio>.
      // [Línea 49] Ejecuta o evalúa: ) : (
      ) : (
        <Table> // [Línea 50] Abre o renderiza el componente visual <Table>.
          <TableHeader> // [Línea 51] Abre o renderiza el componente visual <TableHeader>.
            <TableRow> // [Línea 52] Abre o renderiza el componente visual <TableRow>.
              <TableHead>Nombre de la categoría</TableHead> // [Línea 53] Abre o renderiza el componente visual <TableHead>.
              <TableHead className="text-right">Productos activos</TableHead> // [Línea 54] Abre o renderiza el componente visual <TableHead>.
              <TableHead>Estado</TableHead> // [Línea 55] Abre o renderiza el componente visual <TableHead>.
              // [Línea 56] Ejecuta o evalúa: {esAdmin && <TableHead className="text-right">Acciones</TableHead>}
              {esAdmin && <TableHead className="text-right">Acciones</TableHead>}
            </TableRow> // [Línea 57] Cierra el componente visual </TableRow>.
          </TableHeader> // [Línea 58] Cierra el componente visual </TableHeader>.
          <TableBody> // [Línea 59] Abre o renderiza el componente visual <TableBody>.
            // [Línea 60] Ejecuta o evalúa: {categorias.map((cat) => (
            {categorias.map((cat) => (
              <TableRow key={cat.id}> // [Línea 61] Abre o renderiza el componente visual <TableRow>.
                <TableCell className="font-medium"> // [Línea 62] Abre o renderiza el componente visual <TableCell>.
                  <Link // [Línea 63] Abre o renderiza el componente visual <Link>.
                    // [Línea 64] Ejecuta o evalúa: href={`/productos?categoriaId=${cat.id}`}
                    href={`/productos?categoriaId=${cat.id}`}
                    // [Línea 65] Ejecuta o evalúa: className="hover:text-primary hover:underline"
                    className="hover:text-primary hover:underline"
                  // [Línea 66] Ejecuta o evalúa: >
                  >
                    // [Línea 67] Ejecuta o evalúa: {cat.nombre}
                    {cat.nombre}
                  </Link> // [Línea 68] Cierra el componente visual </Link>.
                </TableCell> // [Línea 69] Cierra el componente visual </TableCell>.
                <TableCell className="text-right font-mono">{cat.cantidadProductos}</TableCell> // [Línea 70] Abre o renderiza el componente visual <TableCell>.
                <TableCell> // [Línea 71] Abre o renderiza el componente visual <TableCell>.
                  <InsigniaActivo activo={cat.activa} textoInactivo="Inactiva" /> // [Línea 72] Abre o renderiza el componente visual <InsigniaActivo>.
                </TableCell> // [Línea 73] Cierra el componente visual </TableCell>.
                // [Línea 74] Ejecuta o evalúa: {esAdmin && (
                {esAdmin && (
                  <TableCell className="text-right"> // [Línea 75] Abre o renderiza el componente visual <TableCell>.
                    <AccionesFilaCategoria categoria={cat} /> // [Línea 76] Abre o renderiza el componente visual <AccionesFilaCategoria>.
                  </TableCell> // [Línea 77] Cierra el componente visual </TableCell>.
                // [Línea 78] Ejecuta o evalúa: )}
                )}
              </TableRow> // [Línea 79] Cierra el componente visual </TableRow>.
            // [Línea 80] Ejecuta o evalúa: ))}
            ))}
          </TableBody> // [Línea 81] Cierra el componente visual </TableBody>.
        </Table> // [Línea 82] Cierra el componente visual </Table>.
      // [Línea 83] Ejecuta o evalúa: )}
      )}
    </Pagina> // [Línea 84] Cierra el componente visual </Pagina>.
  // [Línea 85] Cierra el bloque o estructura ();).
  );
// [Línea 86] Cierra el bloque o estructura (}).
}
