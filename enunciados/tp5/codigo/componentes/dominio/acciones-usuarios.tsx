"use client";
// Modales de gestión de usuarios (RF-U4 y RF-U5, solo administrador):
// - Alta con contraseña temporal
// - Edición de nombre, email y rol
// - Restablecimiento de contraseña mostrando la clave temporal UNA SOLA VEZ
// - Desactivación / reactivación con confirmación
import { useState } from "react";
import { Plus, Pencil, KeyRound, Power, Copy, Check } from "lucide-react";
import { toast } from "sonner";
import {
  accionCrearUsuario,
  accionEditarUsuario,
  accionRestablecerContrasena,
} from "@/acciones/comercial";
import { esquemaUsuarioEdicion, esquemaUsuarioNuevo } from "@/esquemas/usuarios";
import { usarFormulario } from "@/hooks/usar-formulario";
import { Button } from "@/componentes/ui/button";
import { Input } from "@/componentes/ui/input";
import { Select } from "@/componentes/ui/select";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/componentes/ui/dialog";
import { CampoFormulario } from "@/componentes/comunes/campo-formulario";
import { ModalConfirmacion } from "@/componentes/comunes/confirmar-accion";
import { Alinear, Apilar, Caja, Texto } from "@/componentes/primitivas/maquetacion";

type UsuarioItem = {
  id: number;
  nombre: string;
  email: string;
  rol: "admin" | "vendedor";
  activo: boolean;
};

// ---------- Alta de usuario ----------
export function BotonNuevoUsuario() {
  const [abierto, setAbierto] = useState(false);
  const [nombreUsuario, setNombreUsuario] = useState("");
  const [emailUsuario, setEmailUsuario] = useState("");
  const [rolUsuario, setRolUsuario] = useState<"admin" | "vendedor">("vendedor");
  const [passwordTemporal, setPasswordTemporal] = useState("");

  const { errores, enviando, enviar, limpiarErrores } = usarFormulario({
    esquema: esquemaUsuarioNuevo,
    accion: (datos) => accionCrearUsuario(datos),
    mensajeExito: "Usuario creado con éxito",
    alTerminar: () => setAbierto(false),
  });

  function abrir() {
    limpiarErrores();
    setNombreUsuario("");
    setEmailUsuario("");
    setRolUsuario("vendedor");
    setPasswordTemporal("temporal123");
    setAbierto(true);
  }

  return (
    <>
      <Button onClick={abrir}>
        <Plus className="size-4" />
        Nuevo usuario
      </Button>

      <Dialog open={abierto} onOpenChange={setAbierto}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Nuevo usuario</DialogTitle>
            <DialogDescription>
              Asignale su rol y una contraseña temporal de al menos 8 caracteres.
            </DialogDescription>
          </DialogHeader>

          <form
            onSubmit={(e) => {
              e.preventDefault();
              enviar({
                nombre: nombreUsuario,
                email: emailUsuario,
                rol: rolUsuario,
                password: passwordTemporal,
              });
            }}
            className="flex flex-col gap-4"
          >
            <CampoFormulario etiqueta="Nombre completo" error={errores.nombre}>
              <Input
                value={nombreUsuario}
                onChange={(e) => setNombreUsuario(e.target.value)}
                placeholder="Ej. Martín Gómez"
                autoFocus
              />
            </CampoFormulario>

            <CampoFormulario etiqueta="Correo electrónico" error={errores.email}>
              <Input
                type="email"
                value={emailUsuario}
                onChange={(e) => setEmailUsuario(e.target.value)}
                placeholder="martin@ferreteria.test"
              />
            </CampoFormulario>

            <CampoFormulario etiqueta="Rol en el sistema" error={errores.rol}>
              <Select
                value={rolUsuario}
                onChange={(e) => setRolUsuario(e.target.value as "admin" | "vendedor")}
              >
                <option value="vendedor">Vendedor (Mostrador, clientes y pagos)</option>
                <option value="admin">Administrador (Acceso completo)</option>
              </Select>
            </CampoFormulario>

            <CampoFormulario
              etiqueta="Contraseña temporal"
              error={errores.password}
              ayuda="Mínimo 8 caracteres. El usuario podrá cambiarla desde Mi perfil."
            >
              <Input
                value={passwordTemporal}
                onChange={(e) => setPasswordTemporal(e.target.value)}
              />
            </CampoFormulario>

            <DialogFooter>
              <Button variant="outline" onClick={() => setAbierto(false)}>
                Cancelar
              </Button>
              <Button type="submit" disabled={enviando}>
                {enviando ? "Creando..." : "Crear usuario"}
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>
    </>
  );
}

// ---------- Acciones por fila de usuario ----------
export function AccionesFilaUsuario({
  usuario,
  idUsuarioActual,
}: {
  usuario: UsuarioItem;
  idUsuarioActual: number;
}) {
  const [modalEditar, setModalEditar] = useState(false);
  const [modalEstado, setModalEstado] = useState(false);
  const [modalResetConfirmar, setModalResetConfirmar] = useState(false);
  const [claveGenerada, setClaveGenerada] = useState<string | null>(null);
  const [copiado, setCopiado] = useState(false);

  const [nombreUsuario, setNombreUsuario] = useState(usuario.nombre);
  const [emailUsuario, setEmailUsuario] = useState(usuario.email);
  const [rolUsuario, setRolUsuario] = useState<"admin" | "vendedor">(usuario.rol);

  const esElMismo = usuario.id === idUsuarioActual;

  const { errores, enviando, enviar, limpiarErrores } = usarFormulario({
    esquema: esquemaUsuarioEdicion,
    accion: (datos) => accionEditarUsuario(usuario.id, datos),
    mensajeExito: "Usuario actualizado",
    alTerminar: () => setModalEditar(false),
  });

  async function cambiarActivo() {
    const res = await accionEditarUsuario(usuario.id, { activo: !usuario.activo });
    if (!res.ok) {
      toast.error(res.error.message);
      return;
    }
    toast.success(usuario.activo ? "Usuario desactivado" : "Usuario activado");
  }

  async function ejecutarReset() {
    const res = await accionRestablecerContrasena(usuario.id);
    if (!res.ok) {
      toast.error(res.error.message);
      return;
    }
    setClaveGenerada(res.data.passwordTemporal);
    setCopiado(false);
    toast.success("Contraseña temporal generada");
  }

  return (
    <Alinear className="justify-end gap-1.5">
      <Button
        variant="outline"
        size="xs"
        onClick={() => {
          limpiarErrores();
          setNombreUsuario(usuario.nombre);
          setEmailUsuario(usuario.email);
          setRolUsuario(usuario.rol);
          setModalEditar(true);
        }}
      >
        <Pencil className="size-3.5" />
        Editar
      </Button>

      <Button variant="outline" size="xs" onClick={() => setModalResetConfirmar(true)}>
        <KeyRound className="size-3.5" />
        Restablecer clave
      </Button>

      <Button
        variant={usuario.activo ? "ghost" : "secondary"}
        size="xs"
        disabled={esElMismo}
        title={esElMismo ? "No podés desactivar tu propio usuario" : undefined}
        onClick={() => setModalEstado(true)}
      >
        <Power className="size-3.5" />
        {usuario.activo ? "Desactivar" : "Activar"}
      </Button>

      {/* Modal Editar */}
      <Dialog open={modalEditar} onOpenChange={setModalEditar}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Editar usuario</DialogTitle>
            <DialogDescription>Modificá los datos o el rol asignado.</DialogDescription>
          </DialogHeader>

          <form
            onSubmit={(e) => {
              e.preventDefault();
              enviar({
                nombre: nombreUsuario,
                email: emailUsuario,
                rol: rolUsuario,
              });
            }}
            className="flex flex-col gap-4"
          >
            <CampoFormulario etiqueta="Nombre" error={errores.nombre}>
              <Input value={nombreUsuario} onChange={(e) => setNombreUsuario(e.target.value)} />
            </CampoFormulario>

            <CampoFormulario etiqueta="Email" error={errores.email}>
              <Input
                type="email"
                value={emailUsuario}
                onChange={(e) => setEmailUsuario(e.target.value)}
              />
            </CampoFormulario>

            <CampoFormulario
              etiqueta="Rol"
              error={errores.rol}
              ayuda={esElMismo ? "No podés quitarte el rol de administrador a vos mismo." : undefined}
            >
              <Select
                value={rolUsuario}
                disabled={esElMismo}
                onChange={(e) => setRolUsuario(e.target.value as "admin" | "vendedor")}
              >
                <option value="vendedor">Vendedor</option>
                <option value="admin">Administrador</option>
              </Select>
            </CampoFormulario>

            <DialogFooter>
              <Button variant="outline" onClick={() => setModalEditar(false)}>
                Cancelar
              </Button>
              <Button type="submit" disabled={enviando}>
                {enviando ? "Guardando..." : "Guardar cambios"}
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>

      {/* Confirmación de desactivación */}
      <ModalConfirmacion
        abierto={modalEstado}
        alCambiarAbierto={setModalEstado}
        titulo={usuario.activo ? "Desactivar usuario" : "Reactivar usuario"}
        descripcion={
          usuario.activo
            ? `¿Seguro que querés desactivar a "${usuario.nombre}"? Perderá el acceso de inmediato aunque tenga sesión abierta.`
            : `¿Querés volver a activar a "${usuario.nombre}"?`
        }
        textoConfirmar={usuario.activo ? "Desactivar" : "Reactivar"}
        variante={usuario.activo ? "destructive" : "default"}
        alConfirmar={cambiarActivo}
      />

      {/* Confirmación de restablecimiento de contraseña */}
      <ModalConfirmacion
        abierto={modalResetConfirmar}
        alCambiarAbierto={setModalResetConfirmar}
        titulo="Restablecer contraseña"
        descripcion={`Se generará una nueva contraseña temporal para "${usuario.nombre}" (${usuario.email}).`}
        textoConfirmar="Generar clave temporal"
        variante="default"
        alConfirmar={ejecutarReset}
      />

      {/* Muestra la contraseña temporal UNA SOLA VEZ */}
      <Dialog open={claveGenerada !== null} onOpenChange={(o) => !o && setClaveGenerada(null)}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Contraseña temporal generada</DialogTitle>
            <DialogDescription>
              Copiá esta contraseña y entregásela a {usuario.nombre}. Por seguridad se muestra una sola vez.
            </DialogDescription>
          </DialogHeader>
          <Apilar className="gap-3">
            <Alinear className="justify-between rounded-lg border border-border bg-secondary p-3">
              <Texto mono negrita tamano="lg">
                {claveGenerada}
              </Texto>
              <Button
                variant="outline"
                size="sm"
                onClick={() => {
                  if (claveGenerada) {
                    navigator.clipboard.writeText(claveGenerada);
                    setCopiado(true);
                  }
                }}
              >
                {copiado ? <Check className="size-4 text-emerald-700" /> : <Copy className="size-4" />}
                {copiado ? "Copiada" : "Copiar"}
              </Button>
            </Alinear>
          </Apilar>
          <DialogFooter>
            <Button onClick={() => setClaveGenerada(null)}>Entendido</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </Alinear>
  );
}
