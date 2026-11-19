// ============================================================================
// ARCHIVO COMENTADO LÍNEA POR LÍNEA PARA ESTUDIO Y DEFENSA DEL SEGUNDO PARCIAL
// ============================================================================
// Pantalla de GESTIÓN DE USUARIOS (/usuarios). RF-U4 y RF-U5 (solo administrador).
// [Línea 2] Importa elementos desde 'next/navigation'.
import { redirect } from "next/navigation";
// [Línea 3] Importa elementos desde '@/lib/sesion'.
import { exigirUsuarioPagina } from "@/lib/sesion";
// [Línea 4] Importa elementos desde '@/servicios/usuarios'.
import { listarUsuarios } from "@/servicios/usuarios";
// [Línea 5] Inicia un bloque de importación de dependencias.
import {
  // [Línea 6] Importa 'Table' desde el módulo.
  Table,
  // [Línea 7] Importa 'TableBody' desde el módulo.
  TableBody,
  // [Línea 8] Importa 'TableCell' desde el módulo.
  TableCell,
  // [Línea 9] Importa 'TableHead' desde el módulo.
  TableHead,
  // [Línea 10] Importa 'TableHeader' desde el módulo.
  TableHeader,
  // [Línea 11] Importa 'TableRow' desde el módulo.
  TableRow,
// [Línea 12] Cierra la lista de importaciones provenientes del módulo '@/componentes/ui/table'.
} from "@/componentes/ui/table";
// [Línea 13] Importa elementos desde '@/componentes/comunes/encabezado-pagina'.
import { EncabezadoPagina } from "@/componentes/comunes/encabezado-pagina";
// [Línea 14] Importa elementos desde '@/componentes/comunes/filtros-url'.
import { BarraFiltrosUrl } from "@/componentes/comunes/filtros-url";
// [Línea 15] Importa elementos desde '@/componentes/comunes/insignias'.
import { InsigniaActivo, InsigniaRol } from "@/componentes/comunes/insignias";
// [Línea 16] Importa elementos desde '@/componentes/comunes/paginador'.
import { Paginador } from "@/componentes/comunes/paginador";
// [Línea 17] Importa elementos desde '@/componentes/comunes/estados'.
import { EstadoVacio } from "@/componentes/comunes/estados";
// [Línea 18] Inicia un bloque de importación de dependencias.
import {
  // [Línea 19] Importa 'AccionesFilaUsuario' desde el módulo.
  AccionesFilaUsuario,
  // [Línea 20] Importa 'BotonNuevoUsuario' desde el módulo.
  BotonNuevoUsuario,
// [Línea 21] Cierra la lista de importaciones provenientes del módulo '@/componentes/dominio/acciones-usuarios'.
} from "@/componentes/dominio/acciones-usuarios";
// [Línea 22] Importa elementos desde '@/componentes/primitivas/maquetacion'.
import { Pagina } from "@/componentes/primitivas/maquetacion";

// [Línea 24] Define el tipo de datos 'Props' en TypeScript.
type Props = { searchParams: Promise<Record<string, string | undefined>> };

// [Línea 26] Server Component principal 'PaginaUsuarios': se ejecuta en el servidor, consulta los servicios y devuelve el HTML.
export default async function PaginaUsuarios({ searchParams }: Props) {
  // [Línea 27] Espera el resultado de la consulta/operación asíncrona y lo asigna a 'usuario'.
  const usuario = await exigirUsuarioPagina();
  // [Línea 28] Verifica la condición: if (usuario.rol !== "admin") redirect("/");
  if (usuario.rol !== "admin") redirect("/");

  // [Línea 30] Espera el resultado de la consulta/operación asíncrona y lo asigna a 'parametros'.
  const parametros = await searchParams;
  // [Línea 31] Espera el resultado de la consulta/operación asíncrona y lo asigna a 'listado'.
  const listado = await listarUsuarios(usuario, parametros);

  // [Línea 33] Devuelve la interfaz JSX que renderiza este componente.
  return (
    <Pagina> // [Línea 34] Abre o renderiza el componente visual <Pagina>.
      <EncabezadoPagina // [Línea 35] Abre o renderiza el componente visual <EncabezadoPagina>.
        // [Línea 36] Ejecuta o evalúa: titulo="Usuarios y permisos"
        titulo="Usuarios y permisos"
        // [Línea 37] Ejecuta o evalúa: subtitulo="Administración de cuentas del personal, asignación de roles y contras
        subtitulo="Administración de cuentas del personal, asignación de roles y contraseñas"
        // [Línea 38] Ejecuta o evalúa: acciones={<BotonNuevoUsuario />}
        acciones={<BotonNuevoUsuario />}
      // [Línea 39] Ejecuta o evalúa: />
      />

      <BarraFiltrosUrl // [Línea 41] Abre o renderiza el componente visual <BarraFiltrosUrl>.
        // [Línea 42] Ejecuta o evalúa: placeholderBusqueda="Buscar usuario por nombre o email..."
        placeholderBusqueda="Buscar usuario por nombre o email..."
        // [Línea 43] Ejecuta o evalúa: filtros={[
        filtros={[
          // [Línea 44] Ejecuta o evalúa: {
          {
            // [Línea 45] Define o asigna el campo/parámetro 'nombre'.
            nombre: "activo",
            // [Línea 46] Define o asigna el campo/parámetro 'etiqueta'.
            etiqueta: "Todos los usuarios",
            // [Línea 47] Define o asigna el campo/parámetro 'opciones'.
            opciones: [
              // [Línea 48] Ejecuta o evalúa: { valor: "true", texto: "Solo activos" },
              { valor: "true", texto: "Solo activos" },
              // [Línea 49] Ejecuta o evalúa: { valor: "false", texto: "Solo desactivados" },
              { valor: "false", texto: "Solo desactivados" },
            // [Línea 50] Ejecuta o evalúa: ],
            ],
          // [Línea 51] Cierra el bloque o estructura (},).
          },
        // [Línea 52] Ejecuta o evalúa: ]}
        ]}
      // [Línea 53] Ejecuta o evalúa: />
      />

      // [Línea 55] Ejecuta o evalúa: {listado.data.length === 0 ? (
      {listado.data.length === 0 ? (
        <EstadoVacio titulo="No se encontraron usuarios" /> // [Línea 56] Abre o renderiza el componente visual <EstadoVacio>.
      // [Línea 57] Ejecuta o evalúa: ) : (
      ) : (
        <> // [Línea 58] Abre o renderiza el componente visual <elemento>.
          <Table> // [Línea 59] Abre o renderiza el componente visual <Table>.
            <TableHeader> // [Línea 60] Abre o renderiza el componente visual <TableHeader>.
              <TableRow> // [Línea 61] Abre o renderiza el componente visual <TableRow>.
                <TableHead>Nombre</TableHead> // [Línea 62] Abre o renderiza el componente visual <TableHead>.
                <TableHead>Email</TableHead> // [Línea 63] Abre o renderiza el componente visual <TableHead>.
                <TableHead>Rol</TableHead> // [Línea 64] Abre o renderiza el componente visual <TableHead>.
                <TableHead>Estado</TableHead> // [Línea 65] Abre o renderiza el componente visual <TableHead>.
                <TableHead className="text-right">Acciones</TableHead> // [Línea 66] Abre o renderiza el componente visual <TableHead>.
              </TableRow> // [Línea 67] Cierra el componente visual </TableRow>.
            </TableHeader> // [Línea 68] Cierra el componente visual </TableHeader>.
            <TableBody> // [Línea 69] Abre o renderiza el componente visual <TableBody>.
              // [Línea 70] Ejecuta o evalúa: {listado.data.map((u) => (
              {listado.data.map((u) => (
                <TableRow key={u.id}> // [Línea 71] Abre o renderiza el componente visual <TableRow>.
                  <TableCell className="font-medium">{u.nombre}</TableCell> // [Línea 72] Abre o renderiza el componente visual <TableCell>.
                  <TableCell className="font-mono text-xs">{u.email}</TableCell> // [Línea 73] Abre o renderiza el componente visual <TableCell>.
                  <TableCell> // [Línea 74] Abre o renderiza el componente visual <TableCell>.
                    <InsigniaRol rol={u.rol} /> // [Línea 75] Abre o renderiza el componente visual <InsigniaRol>.
                  </TableCell> // [Línea 76] Cierra el componente visual </TableCell>.
                  <TableCell> // [Línea 77] Abre o renderiza el componente visual <TableCell>.
                    <InsigniaActivo activo={u.activo} textoInactivo="Desactivado" /> // [Línea 78] Abre o renderiza el componente visual <InsigniaActivo>.
                  </TableCell> // [Línea 79] Cierra el componente visual </TableCell>.
                  <TableCell className="text-right"> // [Línea 80] Abre o renderiza el componente visual <TableCell>.
                    <AccionesFilaUsuario usuario={u} idUsuarioActual={usuario.id} /> // [Línea 81] Abre o renderiza el componente visual <AccionesFilaUsuario>.
                  </TableCell> // [Línea 82] Cierra el componente visual </TableCell>.
                </TableRow> // [Línea 83] Cierra el componente visual </TableRow>.
              // [Línea 84] Ejecuta o evalúa: ))}
              ))}
            </TableBody> // [Línea 85] Cierra el componente visual </TableBody>.
          </Table> // [Línea 86] Cierra el componente visual </Table>.

          <Paginador page={listado.page} pageSize={listado.pageSize} total={listado.total} /> // [Línea 88] Abre o renderiza el componente visual <Paginador>.
        </> // [Línea 89] Cierra el componente visual </elemento>.
      // [Línea 90] Ejecuta o evalúa: )}
      )}
    </Pagina> // [Línea 91] Cierra el componente visual </Pagina>.
  // [Línea 92] Cierra el bloque o estructura ();).
  );
// [Línea 93] Cierra el bloque o estructura (}).
}
