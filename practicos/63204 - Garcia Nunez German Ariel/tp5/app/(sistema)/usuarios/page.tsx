// Pantalla de GESTIÓN DE USUARIOS (/usuarios). RF-U4 y RF-U5 (solo administrador).
import { redirect } from "next/navigation";
import { exigirUsuarioPagina } from "@/lib/sesion";
import { listarUsuarios } from "@/servicios/usuarios";
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
import { InsigniaActivo, InsigniaRol } from "@/componentes/comunes/insignias";
import { Paginador } from "@/componentes/comunes/paginador";
import { EstadoVacio } from "@/componentes/comunes/estados";
import {
  AccionesFilaUsuario,
  BotonNuevoUsuario,
} from "@/componentes/dominio/acciones-usuarios";
import { Pagina } from "@/componentes/primitivas/maquetacion";

type Props = { searchParams: Promise<Record<string, string | undefined>> };

export default async function PaginaUsuarios({ searchParams }: Props) {
  const usuario = await exigirUsuarioPagina();
  if (usuario.rol !== "admin") redirect("/");

  const parametros = await searchParams;
  const listado = await listarUsuarios(usuario, parametros);

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
