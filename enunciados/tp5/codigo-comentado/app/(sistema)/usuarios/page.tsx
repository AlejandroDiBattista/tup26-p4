// ============================================================================
// GUÍA DE ESTUDIO - SEGUNDO PARCIAL: PROGRAMACIÓN IV
// Archivo: app/(sistema)/usuarios/page.tsx
// Código comentado con explicaciones sencillas y claras para la defensa oral.
// ============================================================================

// Pantalla de GESTIÓN DE USUARIOS (/usuarios). RF-U4 y RF-U5 (solo administrador).
// Acá importamos funciones de navegación de Next.js (como redirect para cambiar de página)
import { redirect } from "next/navigation";
// Acá importamos las funciones para leer y validar la sesión del usuario conectado
import { exigirUsuarioPagina } from "@/lib/sesion";
// Acá importamos funciones de la capa de servicios donde reside la lógica de negocio
import { listarUsuarios } from "@/servicios/usuarios";
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
import { InsigniaActivo, InsigniaRol } from "@/componentes/comunes/insignias";
// Acá importamos componentes visuales de la interfaz de usuario
import { Paginador } from "@/componentes/comunes/paginador";
// Acá importamos componentes visuales de la interfaz de usuario
import { EstadoVacio } from "@/componentes/comunes/estados";
import {
  AccionesFilaUsuario,
  BotonNuevoUsuario,
} from "@/componentes/dominio/acciones-usuarios";
// Acá importamos componentes visuales de la interfaz de usuario
import { Pagina } from "@/componentes/primitivas/maquetacion";

type Props = { searchParams: Promise<Record<string, string | undefined>> };

// Componente principal de página 'PaginaUsuarios' (Server Component: se ejecuta en el servidor)
export default async function PaginaUsuarios({ searchParams }: Props) {
  const usuario = await exigirUsuarioPagina();
  // Verificamos si el usuario tiene el rol y permisos requeridos para esta acción
  if (usuario.rol !== "admin") redirect("/");

  const parametros = await searchParams;
  const listado = await listarUsuarios(usuario, parametros);

  // Renderizamos la interfaz visual de este componente:
  return (
    <Pagina>
      <EncabezadoPagina
        titulo="Usuarios y permisos"
        subtitulo="Administración de cuentas del personal, asignación de roles y contraseñas"
        acciones={<BotonNuevoUsuario />}
      />

      <BarraFiltrosUrl
        placeholderBusqueda="Buscar usuario por nombre o email..."
        filtros={[
          {
            nombre: "activo",
            etiqueta: "Todos los usuarios",
            opciones: [
              { valor: "true", texto: "Solo activos" },
              { valor: "false", texto: "Solo desactivados" },
            ],
          },
        ]}
      />

      {listado.data.length === 0 ? (
        <EstadoVacio titulo="No se encontraron usuarios" />
      ) : (
        <>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Nombre</TableHead>
                <TableHead>Email</TableHead>
                <TableHead>Rol</TableHead>
                <TableHead>Estado</TableHead>
                <TableHead className="text-right">Acciones</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {listado.data.map((u) => (
                <TableRow key={u.id}>
                  <TableCell className="font-medium">{u.nombre}</TableCell>
                  <TableCell className="font-mono text-xs">{u.email}</TableCell>
                  <TableCell>
                    <InsigniaRol rol={u.rol} />
                  </TableCell>
                  <TableCell>
                    <InsigniaActivo activo={u.activo} textoInactivo="Desactivado" />
                  </TableCell>
                  <TableCell className="text-right">
                    <AccionesFilaUsuario usuario={u} idUsuarioActual={usuario.id} />
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
