// ============================================================================
// ARCHIVO COMENTADO LÍNEA POR LÍNEA PARA ESTUDIO Y DEFENSA DEL SEGUNDO PARCIAL
// ============================================================================
// [Línea 1] Directiva de Next.js: marca este archivo como Client Component (se ejecuta en el navegador con estado e interactividad).
"use client";
// Modales de gestión de usuarios (RF-U4 y RF-U5, solo administrador):
// - Alta con contraseña temporal
// - Edición de nombre, email y rol
// - Restablecimiento de contraseña mostrando la clave temporal UNA SOLA VEZ
// - Desactivación / reactivación con confirmación
// [Línea 7] Importa elementos desde 'react'.
import { useState } from "react";
// [Línea 8] Importa elementos desde 'lucide-react'.
import { Plus, Pencil, KeyRound, Power, Copy, Check } from "lucide-react";
// [Línea 9] Importa elementos desde 'sonner'.
import { toast } from "sonner";
// [Línea 10] Inicia un bloque de importación de dependencias.
import {
  // [Línea 11] Importa 'accionCrearUsuario' desde el módulo.
  accionCrearUsuario,
  // [Línea 12] Importa 'accionEditarUsuario' desde el módulo.
  accionEditarUsuario,
  // [Línea 13] Importa 'accionRestablecerContrasena' desde el módulo.
  accionRestablecerContrasena,
// [Línea 14] Cierra la lista de importaciones provenientes del módulo '@/acciones/comercial'.
} from "@/acciones/comercial";
// [Línea 15] Importa elementos desde '@/esquemas/usuarios'.
import { esquemaUsuarioEdicion, esquemaUsuarioNuevo } from "@/esquemas/usuarios";
// [Línea 16] Importa elementos desde '@/hooks/usar-formulario'.
import { usarFormulario } from "@/hooks/usar-formulario";
// [Línea 17] Importa elementos desde '@/componentes/ui/button'.
import { Button } from "@/componentes/ui/button";
// [Línea 18] Importa elementos desde '@/componentes/ui/input'.
import { Input } from "@/componentes/ui/input";
// [Línea 19] Importa elementos desde '@/componentes/ui/select'.
import { Select } from "@/componentes/ui/select";
// [Línea 20] Inicia un bloque de importación de dependencias.
import {
  // [Línea 21] Importa 'Dialog' desde el módulo.
  Dialog,
  // [Línea 22] Importa 'DialogContent' desde el módulo.
  DialogContent,
  // [Línea 23] Importa 'DialogDescription' desde el módulo.
  DialogDescription,
  // [Línea 24] Importa 'DialogFooter' desde el módulo.
  DialogFooter,
  // [Línea 25] Importa 'DialogHeader' desde el módulo.
  DialogHeader,
  // [Línea 26] Importa 'DialogTitle' desde el módulo.
  DialogTitle,
// [Línea 27] Cierra la lista de importaciones provenientes del módulo '@/componentes/ui/dialog'.
} from "@/componentes/ui/dialog";
// [Línea 28] Importa elementos desde '@/componentes/comunes/campo-formulario'.
import { CampoFormulario } from "@/componentes/comunes/campo-formulario";
// [Línea 29] Importa elementos desde '@/componentes/comunes/confirmar-accion'.
import { ModalConfirmacion } from "@/componentes/comunes/confirmar-accion";
// [Línea 30] Importa elementos desde '@/componentes/primitivas/maquetacion'.
import { Alinear, Apilar, Caja, Texto } from "@/componentes/primitivas/maquetacion";

// [Línea 32] Define el tipo de datos 'UsuarioItem' en TypeScript.
type UsuarioItem = {
  // [Línea 33] Define o asigna el campo/parámetro 'id'.
  id: number;
  // [Línea 34] Define o asigna el campo/parámetro 'nombre'.
  nombre: string;
  // [Línea 35] Define o asigna el campo/parámetro 'email'.
  email: string;
  // [Línea 36] Define o asigna el campo/parámetro 'rol'.
  rol: "admin" | "vendedor";
  // [Línea 37] Define o asigna el campo/parámetro 'activo'.
  activo: boolean;
// [Línea 38] Cierra el bloque o estructura (};).
};

// ---------- Alta de usuario ----------
// [Línea 41] Declara la función o componente 'BotonNuevoUsuario'.
export function BotonNuevoUsuario() {
  // [Línea 42] Estado reactivo de React [abierto, setAbierto]: guarda el valor actual y la función para actualizarlo.
  const [abierto, setAbierto] = useState(false);
  // [Línea 43] Estado reactivo de React [nombreUsuario, setNombreUsuario]: guarda el valor actual y la función para actualizarlo.
  const [nombreUsuario, setNombreUsuario] = useState("");
  // [Línea 44] Estado reactivo de React [emailUsuario, setEmailUsuario]: guarda el valor actual y la función para actualizarlo.
  const [emailUsuario, setEmailUsuario] = useState("");
  // [Línea 45] Estado reactivo de React [rolUsuario, setRolUsuario]: guarda el valor actual y la función para actualizarlo.
  const [rolUsuario, setRolUsuario] = useState<"admin" | "vendedor">("vendedor");
  // [Línea 46] Estado reactivo de React [passwordTemporal, setPasswordTemporal]: guarda el valor actual y la función para actualizarlo.
  const [passwordTemporal, setPasswordTemporal] = useState("");

  // [Línea 48] Declara '{ errores, enviando, enviar, limpiarErrores }' y le asigna el valor resultante.
  const { errores, enviando, enviar, limpiarErrores } = usarFormulario({
    // [Línea 49] Define o asigna el campo/parámetro 'esquema'.
    esquema: esquemaUsuarioNuevo,
    // [Línea 50] Define o asigna el campo/parámetro 'accion'.
    accion: (datos) => accionCrearUsuario(datos),
    // [Línea 51] Define o asigna el campo/parámetro 'mensajeExito'.
    mensajeExito: "Usuario creado con éxito",
    // [Línea 52] Define o asigna el campo/parámetro 'alTerminar'.
    alTerminar: () => setAbierto(false),
  // [Línea 53] Cierra el bloque o estructura (});).
  });

  // [Línea 55] Declara la función o componente 'abrir'.
  function abrir() {
    // [Línea 56] Ejecuta o evalúa: limpiarErrores();
    limpiarErrores();
    // [Línea 57] Ejecuta o evalúa: setNombreUsuario("");
    setNombreUsuario("");
    // [Línea 58] Ejecuta o evalúa: setEmailUsuario("");
    setEmailUsuario("");
    // [Línea 59] Ejecuta o evalúa: setRolUsuario("vendedor");
    setRolUsuario("vendedor");
    // [Línea 60] Ejecuta o evalúa: setPasswordTemporal("temporal123");
    setPasswordTemporal("temporal123");
    // [Línea 61] Ejecuta o evalúa: setAbierto(true);
    setAbierto(true);
  // [Línea 62] Cierra el bloque o estructura (}).
  }

  // [Línea 64] Devuelve la interfaz JSX que renderiza este componente.
  return (
    <> // [Línea 65] Abre o renderiza el componente visual <elemento>.
      <Button onClick={abrir}> // [Línea 66] Abre o renderiza el componente visual <Button>.
        <Plus className="size-4" /> // [Línea 67] Abre o renderiza el componente visual <Plus>.
        // [Línea 68] Ejecuta o evalúa: Nuevo usuario
        Nuevo usuario
      </Button> // [Línea 69] Cierra el componente visual </Button>.

      <Dialog open={abierto} onOpenChange={setAbierto}> // [Línea 71] Abre o renderiza el componente visual <Dialog>.
        <DialogContent> // [Línea 72] Abre o renderiza el componente visual <DialogContent>.
          <DialogHeader> // [Línea 73] Abre o renderiza el componente visual <DialogHeader>.
            <DialogTitle>Nuevo usuario</DialogTitle> // [Línea 74] Abre o renderiza el componente visual <DialogTitle>.
            <DialogDescription> // [Línea 75] Abre o renderiza el componente visual <DialogDescription>.
              // [Línea 76] Ejecuta o evalúa: Asignale su rol y una contraseña temporal de al menos 8 caracteres.
              Asignale su rol y una contraseña temporal de al menos 8 caracteres.
            </DialogDescription> // [Línea 77] Cierra el componente visual </DialogDescription>.
          </DialogHeader> // [Línea 78] Cierra el componente visual </DialogHeader>.

          <form // [Línea 80] Abre o renderiza el componente visual <form>.
            // [Línea 81] Ejecuta o evalúa: onSubmit={(e) => {
            onSubmit={(e) => {
              // [Línea 82] Ejecuta o evalúa: e.preventDefault();
              e.preventDefault();
              // [Línea 83] Ejecuta o evalúa: enviar({
              enviar({
                // [Línea 84] Define o asigna el campo/parámetro 'nombre'.
                nombre: nombreUsuario,
                // [Línea 85] Define o asigna el campo/parámetro 'email'.
                email: emailUsuario,
                // [Línea 86] Define o asigna el campo/parámetro 'rol'.
                rol: rolUsuario,
                // [Línea 87] Define o asigna el campo/parámetro 'password'.
                password: passwordTemporal,
              // [Línea 88] Cierra el bloque o estructura (});).
              });
            // [Línea 89] Ejecuta o evalúa: }}
            }}
            // [Línea 90] Ejecuta o evalúa: className="flex flex-col gap-4"
            className="flex flex-col gap-4"
          // [Línea 91] Ejecuta o evalúa: >
          >
            <CampoFormulario etiqueta="Nombre completo" error={errores.nombre}> // [Línea 92] Abre o renderiza el componente visual <CampoFormulario>.
              <Input // [Línea 93] Abre o renderiza el componente visual <Input>.
                // [Línea 94] Ejecuta o evalúa: value={nombreUsuario}
                value={nombreUsuario}
                // [Línea 95] Ejecuta o evalúa: onChange={(e) => setNombreUsuario(e.target.value)}
                onChange={(e) => setNombreUsuario(e.target.value)}
                // [Línea 96] Ejecuta o evalúa: placeholder="Ej. Martín Gómez"
                placeholder="Ej. Martín Gómez"
                // [Línea 97] Ejecuta o evalúa: autoFocus
                autoFocus
              // [Línea 98] Ejecuta o evalúa: />
              />
            </CampoFormulario> // [Línea 99] Cierra el componente visual </CampoFormulario>.

            <CampoFormulario etiqueta="Correo electrónico" error={errores.email}> // [Línea 101] Abre o renderiza el componente visual <CampoFormulario>.
              <Input // [Línea 102] Abre o renderiza el componente visual <Input>.
                // [Línea 103] Ejecuta o evalúa: type="email"
                type="email"
                // [Línea 104] Ejecuta o evalúa: value={emailUsuario}
                value={emailUsuario}
                // [Línea 105] Ejecuta o evalúa: onChange={(e) => setEmailUsuario(e.target.value)}
                onChange={(e) => setEmailUsuario(e.target.value)}
                // [Línea 106] Ejecuta o evalúa: placeholder="martin@ferreteria.test"
                placeholder="martin@ferreteria.test"
              // [Línea 107] Ejecuta o evalúa: />
              />
            </CampoFormulario> // [Línea 108] Cierra el componente visual </CampoFormulario>.

            <CampoFormulario etiqueta="Rol en el sistema" error={errores.rol}> // [Línea 110] Abre o renderiza el componente visual <CampoFormulario>.
              <Select // [Línea 111] Abre o renderiza el componente visual <Select>.
                // [Línea 112] Ejecuta o evalúa: value={rolUsuario}
                value={rolUsuario}
                // [Línea 113] Ejecuta o evalúa: onChange={(e) => setRolUsuario(e.target.value as "admin" | "vendedor")}
                onChange={(e) => setRolUsuario(e.target.value as "admin" | "vendedor")}
              // [Línea 114] Ejecuta o evalúa: >
              >
                <option value="vendedor">Vendedor (Mostrador, clientes y pagos)</option> // [Línea 115] Abre o renderiza el componente visual <option>.
                <option value="admin">Administrador (Acceso completo)</option> // [Línea 116] Abre o renderiza el componente visual <option>.
              </Select> // [Línea 117] Cierra el componente visual </Select>.
            </CampoFormulario> // [Línea 118] Cierra el componente visual </CampoFormulario>.

            <CampoFormulario // [Línea 120] Abre o renderiza el componente visual <CampoFormulario>.
              // [Línea 121] Ejecuta o evalúa: etiqueta="Contraseña temporal"
              etiqueta="Contraseña temporal"
              // [Línea 122] Ejecuta o evalúa: error={errores.password}
              error={errores.password}
              // [Línea 123] Ejecuta o evalúa: ayuda="Mínimo 8 caracteres. El usuario podrá cambiarla desde Mi perfil."
              ayuda="Mínimo 8 caracteres. El usuario podrá cambiarla desde Mi perfil."
            // [Línea 124] Ejecuta o evalúa: >
            >
              <Input // [Línea 125] Abre o renderiza el componente visual <Input>.
                // [Línea 126] Ejecuta o evalúa: value={passwordTemporal}
                value={passwordTemporal}
                // [Línea 127] Ejecuta o evalúa: onChange={(e) => setPasswordTemporal(e.target.value)}
                onChange={(e) => setPasswordTemporal(e.target.value)}
              // [Línea 128] Ejecuta o evalúa: />
              />
            </CampoFormulario> // [Línea 129] Cierra el componente visual </CampoFormulario>.

            <DialogFooter> // [Línea 131] Abre o renderiza el componente visual <DialogFooter>.
              <Button variant="outline" onClick={() => setAbierto(false)}> // [Línea 132] Abre o renderiza el componente visual <Button>.
                // [Línea 133] Ejecuta o evalúa: Cancelar
                Cancelar
              </Button> // [Línea 134] Cierra el componente visual </Button>.
              <Button type="submit" disabled={enviando}> // [Línea 135] Abre o renderiza el componente visual <Button>.
                // [Línea 136] Ejecuta o evalúa: {enviando ? "Creando..." : "Crear usuario"}
                {enviando ? "Creando..." : "Crear usuario"}
              </Button> // [Línea 137] Cierra el componente visual </Button>.
            </DialogFooter> // [Línea 138] Cierra el componente visual </DialogFooter>.
          </form> // [Línea 139] Cierra el componente visual </form>.
        </DialogContent> // [Línea 140] Cierra el componente visual </DialogContent>.
      </Dialog> // [Línea 141] Cierra el componente visual </Dialog>.
    </> // [Línea 142] Cierra el componente visual </elemento>.
  // [Línea 143] Cierra el bloque o estructura ();).
  );
// [Línea 144] Cierra el bloque o estructura (}).
}

// ---------- Acciones por fila de usuario ----------
// [Línea 147] Declara la función o componente 'AccionesFilaUsuario'.
export function AccionesFilaUsuario({
  // [Línea 148] Ejecuta o evalúa: usuario,
  usuario,
  // [Línea 149] Ejecuta o evalúa: idUsuarioActual,
  idUsuarioActual,
// [Línea 150] Ejecuta o evalúa: }: {
}: {
  // [Línea 151] Define o asigna el campo/parámetro 'usuario'.
  usuario: UsuarioItem;
  // [Línea 152] Define o asigna el campo/parámetro 'idUsuarioActual'.
  idUsuarioActual: number;
// [Línea 153] Ejecuta o evalúa: }) {
}) {
  // [Línea 154] Estado reactivo de React [modalEditar, setModalEditar]: guarda el valor actual y la función para actualizarlo.
  const [modalEditar, setModalEditar] = useState(false);
  // [Línea 155] Estado reactivo de React [modalEstado, setModalEstado]: guarda el valor actual y la función para actualizarlo.
  const [modalEstado, setModalEstado] = useState(false);
  // [Línea 156] Estado reactivo de React [modalResetConfirmar, setModalResetConfirmar]: guarda el valor actual y la función para actualizarlo.
  const [modalResetConfirmar, setModalResetConfirmar] = useState(false);
  // [Línea 157] Estado reactivo de React [claveGenerada, setClaveGenerada]: guarda el valor actual y la función para actualizarlo.
  const [claveGenerada, setClaveGenerada] = useState<string | null>(null);
  // [Línea 158] Estado reactivo de React [copiado, setCopiado]: guarda el valor actual y la función para actualizarlo.
  const [copiado, setCopiado] = useState(false);

  // [Línea 160] Estado reactivo de React [nombreUsuario, setNombreUsuario]: guarda el valor actual y la función para actualizarlo.
  const [nombreUsuario, setNombreUsuario] = useState(usuario.nombre);
  // [Línea 161] Estado reactivo de React [emailUsuario, setEmailUsuario]: guarda el valor actual y la función para actualizarlo.
  const [emailUsuario, setEmailUsuario] = useState(usuario.email);
  // [Línea 162] Estado reactivo de React [rolUsuario, setRolUsuario]: guarda el valor actual y la función para actualizarlo.
  const [rolUsuario, setRolUsuario] = useState<"admin" | "vendedor">(usuario.rol);

  // [Línea 164] Declara 'esElMismo' y le asigna el valor resultante.
  const esElMismo = usuario.id === idUsuarioActual;

  // [Línea 166] Declara '{ errores, enviando, enviar, limpiarErrores }' y le asigna el valor resultante.
  const { errores, enviando, enviar, limpiarErrores } = usarFormulario({
    // [Línea 167] Define o asigna el campo/parámetro 'esquema'.
    esquema: esquemaUsuarioEdicion,
    // [Línea 168] Define o asigna el campo/parámetro 'accion'.
    accion: (datos) => accionEditarUsuario(usuario.id, datos),
    // [Línea 169] Define o asigna el campo/parámetro 'mensajeExito'.
    mensajeExito: "Usuario actualizado",
    // [Línea 170] Define o asigna el campo/parámetro 'alTerminar'.
    alTerminar: () => setModalEditar(false),
  // [Línea 171] Cierra el bloque o estructura (});).
  });

  // [Línea 173] Declara la función asíncrona 'cambiarActivo'.
  async function cambiarActivo() {
    // [Línea 174] Espera el resultado de la consulta/operación asíncrona y lo asigna a 'res'.
    const res = await accionEditarUsuario(usuario.id, { activo: !usuario.activo });
    // [Línea 175] Verifica la condición: if (!res.ok) {
    if (!res.ok) {
      // [Línea 176] Muestra un aviso emergente en pantalla: toast.error(res.error.message);
      toast.error(res.error.message);
      // [Línea 177] Ejecuta o evalúa: return;
      return;
    // [Línea 178] Cierra el bloque o estructura (}).
    }
    // [Línea 179] Muestra un aviso emergente en pantalla: toast.success(usuario.activo ? "Usuario desactivado" : "Usuario activado");
    toast.success(usuario.activo ? "Usuario desactivado" : "Usuario activado");
  // [Línea 180] Cierra el bloque o estructura (}).
  }

  // [Línea 182] Declara la función asíncrona 'ejecutarReset'.
  async function ejecutarReset() {
    // [Línea 183] Espera el resultado de la consulta/operación asíncrona y lo asigna a 'res'.
    const res = await accionRestablecerContrasena(usuario.id);
    // [Línea 184] Verifica la condición: if (!res.ok) {
    if (!res.ok) {
      // [Línea 185] Muestra un aviso emergente en pantalla: toast.error(res.error.message);
      toast.error(res.error.message);
      // [Línea 186] Ejecuta o evalúa: return;
      return;
    // [Línea 187] Cierra el bloque o estructura (}).
    }
    // [Línea 188] Ejecuta o evalúa: setClaveGenerada(res.data.passwordTemporal);
    setClaveGenerada(res.data.passwordTemporal);
    // [Línea 189] Ejecuta o evalúa: setCopiado(false);
    setCopiado(false);
    // [Línea 190] Muestra un aviso emergente en pantalla: toast.success("Contraseña temporal generada");
    toast.success("Contraseña temporal generada");
  // [Línea 191] Cierra el bloque o estructura (}).
  }

  // [Línea 193] Devuelve la interfaz JSX que renderiza este componente.
  return (
    <Alinear className="justify-end gap-1.5"> // [Línea 194] Abre o renderiza el componente visual <Alinear>.
      <Button // [Línea 195] Abre o renderiza el componente visual <Button>.
        // [Línea 196] Ejecuta o evalúa: variant="outline"
        variant="outline"
        // [Línea 197] Ejecuta o evalúa: size="xs"
        size="xs"
        // [Línea 198] Ejecuta o evalúa: onClick={() => {
        onClick={() => {
          // [Línea 199] Ejecuta o evalúa: limpiarErrores();
          limpiarErrores();
          // [Línea 200] Ejecuta o evalúa: setNombreUsuario(usuario.nombre);
          setNombreUsuario(usuario.nombre);
          // [Línea 201] Ejecuta o evalúa: setEmailUsuario(usuario.email);
          setEmailUsuario(usuario.email);
          // [Línea 202] Ejecuta o evalúa: setRolUsuario(usuario.rol);
          setRolUsuario(usuario.rol);
          // [Línea 203] Ejecuta o evalúa: setModalEditar(true);
          setModalEditar(true);
        // [Línea 204] Ejecuta o evalúa: }}
        }}
      // [Línea 205] Ejecuta o evalúa: >
      >
        <Pencil className="size-3.5" /> // [Línea 206] Abre o renderiza el componente visual <Pencil>.
        // [Línea 207] Ejecuta o evalúa: Editar
        Editar
      </Button> // [Línea 208] Cierra el componente visual </Button>.

      <Button variant="outline" size="xs" onClick={() => setModalResetConfirmar(true)}> // [Línea 210] Abre o renderiza el componente visual <Button>.
        <KeyRound className="size-3.5" /> // [Línea 211] Abre o renderiza el componente visual <KeyRound>.
        // [Línea 212] Ejecuta o evalúa: Restablecer clave
        Restablecer clave
      </Button> // [Línea 213] Cierra el componente visual </Button>.

      <Button // [Línea 215] Abre o renderiza el componente visual <Button>.
        // [Línea 216] Ejecuta o evalúa: variant={usuario.activo ? "ghost" : "secondary"}
        variant={usuario.activo ? "ghost" : "secondary"}
        // [Línea 217] Ejecuta o evalúa: size="xs"
        size="xs"
        // [Línea 218] Ejecuta o evalúa: disabled={esElMismo}
        disabled={esElMismo}
        // [Línea 219] Ejecuta o evalúa: title={esElMismo ? "No podés desactivar tu propio usuario" : undefined}
        title={esElMismo ? "No podés desactivar tu propio usuario" : undefined}
        // [Línea 220] Ejecuta o evalúa: onClick={() => setModalEstado(true)}
        onClick={() => setModalEstado(true)}
      // [Línea 221] Ejecuta o evalúa: >
      >
        <Power className="size-3.5" /> // [Línea 222] Abre o renderiza el componente visual <Power>.
        // [Línea 223] Ejecuta o evalúa: {usuario.activo ? "Desactivar" : "Activar"}
        {usuario.activo ? "Desactivar" : "Activar"}
      </Button> // [Línea 224] Cierra el componente visual </Button>.

      // [Línea 226] Ejecuta o evalúa: {/* Modal Editar */}
      {/* Modal Editar */}
      <Dialog open={modalEditar} onOpenChange={setModalEditar}> // [Línea 227] Abre o renderiza el componente visual <Dialog>.
        <DialogContent> // [Línea 228] Abre o renderiza el componente visual <DialogContent>.
          <DialogHeader> // [Línea 229] Abre o renderiza el componente visual <DialogHeader>.
            <DialogTitle>Editar usuario</DialogTitle> // [Línea 230] Abre o renderiza el componente visual <DialogTitle>.
            <DialogDescription>Modificá los datos o el rol asignado.</DialogDescription> // [Línea 231] Abre o renderiza el componente visual <DialogDescription>.
          </DialogHeader> // [Línea 232] Cierra el componente visual </DialogHeader>.

          <form // [Línea 234] Abre o renderiza el componente visual <form>.
            // [Línea 235] Ejecuta o evalúa: onSubmit={(e) => {
            onSubmit={(e) => {
              // [Línea 236] Ejecuta o evalúa: e.preventDefault();
              e.preventDefault();
              // [Línea 237] Ejecuta o evalúa: enviar({
              enviar({
                // [Línea 238] Define o asigna el campo/parámetro 'nombre'.
                nombre: nombreUsuario,
                // [Línea 239] Define o asigna el campo/parámetro 'email'.
                email: emailUsuario,
                // [Línea 240] Define o asigna el campo/parámetro 'rol'.
                rol: rolUsuario,
              // [Línea 241] Cierra el bloque o estructura (});).
              });
            // [Línea 242] Ejecuta o evalúa: }}
            }}
            // [Línea 243] Ejecuta o evalúa: className="flex flex-col gap-4"
            className="flex flex-col gap-4"
          // [Línea 244] Ejecuta o evalúa: >
          >
            <CampoFormulario etiqueta="Nombre" error={errores.nombre}> // [Línea 245] Abre o renderiza el componente visual <CampoFormulario>.
              <Input value={nombreUsuario} onChange={(e) => setNombreUsuario(e.target.value)} /> // [Línea 246] Abre o renderiza el componente visual <Input>.
            </CampoFormulario> // [Línea 247] Cierra el componente visual </CampoFormulario>.

            <CampoFormulario etiqueta="Email" error={errores.email}> // [Línea 249] Abre o renderiza el componente visual <CampoFormulario>.
              <Input // [Línea 250] Abre o renderiza el componente visual <Input>.
                // [Línea 251] Ejecuta o evalúa: type="email"
                type="email"
                // [Línea 252] Ejecuta o evalúa: value={emailUsuario}
                value={emailUsuario}
                // [Línea 253] Ejecuta o evalúa: onChange={(e) => setEmailUsuario(e.target.value)}
                onChange={(e) => setEmailUsuario(e.target.value)}
              // [Línea 254] Ejecuta o evalúa: />
              />
            </CampoFormulario> // [Línea 255] Cierra el componente visual </CampoFormulario>.

            <CampoFormulario // [Línea 257] Abre o renderiza el componente visual <CampoFormulario>.
              // [Línea 258] Ejecuta o evalúa: etiqueta="Rol"
              etiqueta="Rol"
              // [Línea 259] Ejecuta o evalúa: error={errores.rol}
              error={errores.rol}
              // [Línea 260] Ejecuta o evalúa: ayuda={esElMismo ? "No podés quitarte el rol de administrador a vos mismo." : un
              ayuda={esElMismo ? "No podés quitarte el rol de administrador a vos mismo." : undefined}
            // [Línea 261] Ejecuta o evalúa: >
            >
              <Select // [Línea 262] Abre o renderiza el componente visual <Select>.
                // [Línea 263] Ejecuta o evalúa: value={rolUsuario}
                value={rolUsuario}
                // [Línea 264] Ejecuta o evalúa: disabled={esElMismo}
                disabled={esElMismo}
                // [Línea 265] Ejecuta o evalúa: onChange={(e) => setRolUsuario(e.target.value as "admin" | "vendedor")}
                onChange={(e) => setRolUsuario(e.target.value as "admin" | "vendedor")}
              // [Línea 266] Ejecuta o evalúa: >
              >
                <option value="vendedor">Vendedor</option> // [Línea 267] Abre o renderiza el componente visual <option>.
                <option value="admin">Administrador</option> // [Línea 268] Abre o renderiza el componente visual <option>.
              </Select> // [Línea 269] Cierra el componente visual </Select>.
            </CampoFormulario> // [Línea 270] Cierra el componente visual </CampoFormulario>.

            <DialogFooter> // [Línea 272] Abre o renderiza el componente visual <DialogFooter>.
              <Button variant="outline" onClick={() => setModalEditar(false)}> // [Línea 273] Abre o renderiza el componente visual <Button>.
                // [Línea 274] Ejecuta o evalúa: Cancelar
                Cancelar
              </Button> // [Línea 275] Cierra el componente visual </Button>.
              <Button type="submit" disabled={enviando}> // [Línea 276] Abre o renderiza el componente visual <Button>.
                // [Línea 277] Ejecuta o evalúa: {enviando ? "Guardando..." : "Guardar cambios"}
                {enviando ? "Guardando..." : "Guardar cambios"}
              </Button> // [Línea 278] Cierra el componente visual </Button>.
            </DialogFooter> // [Línea 279] Cierra el componente visual </DialogFooter>.
          </form> // [Línea 280] Cierra el componente visual </form>.
        </DialogContent> // [Línea 281] Cierra el componente visual </DialogContent>.
      </Dialog> // [Línea 282] Cierra el componente visual </Dialog>.

      // [Línea 284] Ejecuta o evalúa: {/* Confirmación de desactivación */}
      {/* Confirmación de desactivación */}
      <ModalConfirmacion // [Línea 285] Abre o renderiza el componente visual <ModalConfirmacion>.
        // [Línea 286] Ejecuta o evalúa: abierto={modalEstado}
        abierto={modalEstado}
        // [Línea 287] Ejecuta o evalúa: alCambiarAbierto={setModalEstado}
        alCambiarAbierto={setModalEstado}
        // [Línea 288] Ejecuta o evalúa: titulo={usuario.activo ? "Desactivar usuario" : "Reactivar usuario"}
        titulo={usuario.activo ? "Desactivar usuario" : "Reactivar usuario"}
        // [Línea 289] Ejecuta o evalúa: descripcion={
        descripcion={
          // [Línea 290] Ejecuta o evalúa: usuario.activo
          usuario.activo
            // [Línea 291] Ejecuta o evalúa: ? `¿Seguro que querés desactivar a "${usuario.nombre}"? Perderá el acceso de inm
            ? `¿Seguro que querés desactivar a "${usuario.nombre}"? Perderá el acceso de inmediato aunque tenga sesión abierta.`
            // [Línea 292] Ejecuta o evalúa: : `¿Querés volver a activar a "${usuario.nombre}"?`
            : `¿Querés volver a activar a "${usuario.nombre}"?`
        // [Línea 293] Cierra el bloque o estructura (}).
        }
        // [Línea 294] Ejecuta o evalúa: textoConfirmar={usuario.activo ? "Desactivar" : "Reactivar"}
        textoConfirmar={usuario.activo ? "Desactivar" : "Reactivar"}
        // [Línea 295] Ejecuta o evalúa: variante={usuario.activo ? "destructive" : "default"}
        variante={usuario.activo ? "destructive" : "default"}
        // [Línea 296] Ejecuta o evalúa: alConfirmar={cambiarActivo}
        alConfirmar={cambiarActivo}
      // [Línea 297] Ejecuta o evalúa: />
      />

      // [Línea 299] Ejecuta o evalúa: {/* Confirmación de restablecimiento de contraseña */}
      {/* Confirmación de restablecimiento de contraseña */}
      <ModalConfirmacion // [Línea 300] Abre o renderiza el componente visual <ModalConfirmacion>.
        // [Línea 301] Ejecuta o evalúa: abierto={modalResetConfirmar}
        abierto={modalResetConfirmar}
        // [Línea 302] Ejecuta o evalúa: alCambiarAbierto={setModalResetConfirmar}
        alCambiarAbierto={setModalResetConfirmar}
        // [Línea 303] Ejecuta o evalúa: titulo="Restablecer contraseña"
        titulo="Restablecer contraseña"
        // [Línea 304] Ejecuta o evalúa: descripcion={`Se generará una nueva contraseña temporal para "${usuario.nombre}"
        descripcion={`Se generará una nueva contraseña temporal para "${usuario.nombre}" (${usuario.email}).`}
        // [Línea 305] Ejecuta o evalúa: textoConfirmar="Generar clave temporal"
        textoConfirmar="Generar clave temporal"
        // [Línea 306] Ejecuta o evalúa: variante="default"
        variante="default"
        // [Línea 307] Ejecuta o evalúa: alConfirmar={ejecutarReset}
        alConfirmar={ejecutarReset}
      // [Línea 308] Ejecuta o evalúa: />
      />

      // [Línea 310] Ejecuta o evalúa: {/* Muestra la contraseña temporal UNA SOLA VEZ */}
      {/* Muestra la contraseña temporal UNA SOLA VEZ */}
      <Dialog open={claveGenerada !== null} onOpenChange={(o) => !o && setClaveGenerada(null)}> // [Línea 311] Abre o renderiza el componente visual <Dialog>.
        <DialogContent> // [Línea 312] Abre o renderiza el componente visual <DialogContent>.
          <DialogHeader> // [Línea 313] Abre o renderiza el componente visual <DialogHeader>.
            <DialogTitle>Contraseña temporal generada</DialogTitle> // [Línea 314] Abre o renderiza el componente visual <DialogTitle>.
            <DialogDescription> // [Línea 315] Abre o renderiza el componente visual <DialogDescription>.
              // [Línea 316] Ejecuta o evalúa: Copiá esta contraseña y entregásela a {usuario.nombre}. Por seguridad se muestra
              Copiá esta contraseña y entregásela a {usuario.nombre}. Por seguridad se muestra una sola vez.
            </DialogDescription> // [Línea 317] Cierra el componente visual </DialogDescription>.
          </DialogHeader> // [Línea 318] Cierra el componente visual </DialogHeader>.
          <Apilar className="gap-3"> // [Línea 319] Abre o renderiza el componente visual <Apilar>.
            <Alinear className="justify-between rounded-lg border border-border bg-secondary p-3"> // [Línea 320] Abre o renderiza el componente visual <Alinear>.
              <Texto mono negrita tamano="lg"> // [Línea 321] Abre o renderiza el componente visual <Texto>.
                // [Línea 322] Ejecuta o evalúa: {claveGenerada}
                {claveGenerada}
              </Texto> // [Línea 323] Cierra el componente visual </Texto>.
              <Button // [Línea 324] Abre o renderiza el componente visual <Button>.
                // [Línea 325] Ejecuta o evalúa: variant="outline"
                variant="outline"
                // [Línea 326] Ejecuta o evalúa: size="sm"
                size="sm"
                // [Línea 327] Ejecuta o evalúa: onClick={() => {
                onClick={() => {
                  // [Línea 328] Verifica la condición: if (claveGenerada) {
                  if (claveGenerada) {
                    // [Línea 329] Ejecuta o evalúa: navigator.clipboard.writeText(claveGenerada);
                    navigator.clipboard.writeText(claveGenerada);
                    // [Línea 330] Ejecuta o evalúa: setCopiado(true);
                    setCopiado(true);
                  // [Línea 331] Cierra el bloque o estructura (}).
                  }
                // [Línea 332] Ejecuta o evalúa: }}
                }}
              // [Línea 333] Ejecuta o evalúa: >
              >
                // [Línea 334] Ejecuta o evalúa: {copiado ? <Check className="size-4 text-emerald-700" /> : <Copy className="size
                {copiado ? <Check className="size-4 text-emerald-700" /> : <Copy className="size-4" />}
                // [Línea 335] Ejecuta o evalúa: {copiado ? "Copiada" : "Copiar"}
                {copiado ? "Copiada" : "Copiar"}
              </Button> // [Línea 336] Cierra el componente visual </Button>.
            </Alinear> // [Línea 337] Cierra el componente visual </Alinear>.
          </Apilar> // [Línea 338] Cierra el componente visual </Apilar>.
          <DialogFooter> // [Línea 339] Abre o renderiza el componente visual <DialogFooter>.
            <Button onClick={() => setClaveGenerada(null)}>Entendido</Button> // [Línea 340] Abre o renderiza el componente visual <Button>.
          </DialogFooter> // [Línea 341] Cierra el componente visual </DialogFooter>.
        </DialogContent> // [Línea 342] Cierra el componente visual </DialogContent>.
      </Dialog> // [Línea 343] Cierra el componente visual </Dialog>.
    </Alinear> // [Línea 344] Cierra el componente visual </Alinear>.
  // [Línea 345] Cierra el bloque o estructura ();).
  );
// [Línea 346] Cierra el bloque o estructura (}).
}
