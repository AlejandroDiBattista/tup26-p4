// ============================================================================
// ARCHIVO COMENTADO LÍNEA POR LÍNEA PARA ESTUDIO Y DEFENSA DEL SEGUNDO PARCIAL
// ============================================================================
// [Línea 1] Directiva de Next.js: marca este archivo como Client Component (se ejecuta en el navegador con estado e interactividad).
"use client";
// Modales de alta y edición de clientes, baja lógica y registro de pagos en cuenta corriente
// (RF-C2, RF-C5, RF-C7).
// [Línea 4] Importa elementos desde 'react'.
import { useState } from "react";
// [Línea 5] Importa elementos desde 'next/navigation'.
import { useRouter } from "next/navigation";
// [Línea 6] Importa elementos desde 'lucide-react'.
import { Plus, Pencil, Banknote, Power } from "lucide-react";
// [Línea 7] Importa elementos desde 'sonner'.
import { toast } from "sonner";
// [Línea 8] Inicia un bloque de importación de dependencias.
import {
  // [Línea 9] Importa 'accionCrearCliente' desde el módulo.
  accionCrearCliente,
  // [Línea 10] Importa 'accionEditarCliente' desde el módulo.
  accionEditarCliente,
  // [Línea 11] Importa 'accionRegistrarPago' desde el módulo.
  accionRegistrarPago,
// [Línea 12] Cierra la lista de importaciones provenientes del módulo '@/acciones/comercial'.
} from "@/acciones/comercial";
// [Línea 13] Inicia un bloque de importación de dependencias.
import {
  // [Línea 14] Importa 'esquemaClienteEdicion' desde el módulo.
  esquemaClienteEdicion,
  // [Línea 15] Importa 'esquemaClienteNuevo' desde el módulo.
  esquemaClienteNuevo,
  // [Línea 16] Importa 'esquemaPagoNuevo' desde el módulo.
  esquemaPagoNuevo,
  // [Línea 17] Importa 'MEDIOS_PAGO' desde el módulo.
  MEDIOS_PAGO,
// [Línea 18] Cierra la lista de importaciones provenientes del módulo '@/esquemas/clientes'.
} from "@/esquemas/clientes";
// [Línea 19] Importa elementos desde '@/hooks/usar-formulario'.
import { usarFormulario } from "@/hooks/usar-formulario";
// [Línea 20] Inicia un bloque de importación de dependencias.
import {
  // [Línea 21] Importa 'centavosATextoPesos' desde el módulo.
  centavosATextoPesos,
  // [Línea 22] Importa 'formatearMoneda' desde el módulo.
  formatearMoneda,
  // [Línea 23] Importa 'NOMBRES_MEDIO_PAGO' desde el módulo.
  NOMBRES_MEDIO_PAGO,
  // [Línea 24] Importa 'pesosACentavos' desde el módulo.
  pesosACentavos,
// [Línea 25] Cierra la lista de importaciones provenientes del módulo '@/lib/formato'.
} from "@/lib/formato";
// [Línea 26] Importa elementos desde '@/componentes/ui/button'.
import { Button } from "@/componentes/ui/button";
// [Línea 27] Importa elementos desde '@/componentes/ui/input'.
import { Input } from "@/componentes/ui/input";
// [Línea 28] Importa elementos desde '@/componentes/ui/select'.
import { Select, Textarea } from "@/componentes/ui/select";
// [Línea 29] Inicia un bloque de importación de dependencias.
import {
  // [Línea 30] Importa 'Dialog' desde el módulo.
  Dialog,
  // [Línea 31] Importa 'DialogContent' desde el módulo.
  DialogContent,
  // [Línea 32] Importa 'DialogDescription' desde el módulo.
  DialogDescription,
  // [Línea 33] Importa 'DialogFooter' desde el módulo.
  DialogFooter,
  // [Línea 34] Importa 'DialogHeader' desde el módulo.
  DialogHeader,
  // [Línea 35] Importa 'DialogTitle' desde el módulo.
  DialogTitle,
// [Línea 36] Cierra la lista de importaciones provenientes del módulo '@/componentes/ui/dialog'.
} from "@/componentes/ui/dialog";
// [Línea 37] Importa elementos desde '@/componentes/comunes/campo-formulario'.
import { CampoFormulario, CampoImporte } from "@/componentes/comunes/campo-formulario";
// [Línea 38] Importa elementos desde '@/componentes/comunes/confirmar-accion'.
import { ModalConfirmacion } from "@/componentes/comunes/confirmar-accion";
// [Línea 39] Importa elementos desde '@/componentes/primitivas/maquetacion'.
import { Alinear, Apilar, Grilla, Texto } from "@/componentes/primitivas/maquetacion";
// [Línea 40] Importa tipos de TypeScript (solo para chequeo al compilar): import type { ClientePublico } from "@/servicios/clientes";
import type { ClientePublico } from "@/servicios/clientes";

// ---------- Alta de cliente ----------
// [Línea 43] Declara la función o componente 'BotonNuevoCliente'.
export function BotonNuevoCliente({
  // [Línea 44] Ejecuta o evalúa: alCrear,
  alCrear,
  // [Línea 45] Ejecuta o evalúa: textoBoton = "Nuevo cliente",
  textoBoton = "Nuevo cliente",
// [Línea 46] Ejecuta o evalúa: }: {
}: {
  // [Línea 47] Ejecuta o evalúa: alCrear?: (cliente: ClientePublico) => void;
  alCrear?: (cliente: ClientePublico) => void;
  // [Línea 48] Ejecuta o evalúa: textoBoton?: string;
  textoBoton?: string;
// [Línea 49] Ejecuta o evalúa: }) {
}) {
  // [Línea 50] Estado reactivo de React [abierto, setAbierto]: guarda el valor actual y la función para actualizarlo.
  const [abierto, setAbierto] = useState(false);
  // [Línea 51] Estado reactivo de React [tipoDoc, setTipoDoc]: guarda el valor actual y la función para actualizarlo.
  const [tipoDoc, setTipoDoc] = useState<"DNI" | "CUIT">("DNI");
  // [Línea 52] Estado reactivo de React [nroDoc, setNroDoc]: guarda el valor actual y la función para actualizarlo.
  const [nroDoc, setNroDoc] = useState("");
  // [Línea 53] Estado reactivo de React [nombreCliente, setNombreCliente]: guarda el valor actual y la función para actualizarlo.
  const [nombreCliente, setNombreCliente] = useState("");
  // [Línea 54] Estado reactivo de React [domicilioCliente, setDomicilioCliente]: guarda el valor actual y la función para actualizarlo.
  const [domicilioCliente, setDomicilioCliente] = useState("");
  // [Línea 55] Estado reactivo de React [telefonoCliente, setTelefonoCliente]: guarda el valor actual y la función para actualizarlo.
  const [telefonoCliente, setTelefonoCliente] = useState("");
  // [Línea 56] Estado reactivo de React [emailCliente, setEmailCliente]: guarda el valor actual y la función para actualizarlo.
  const [emailCliente, setEmailCliente] = useState("");
  // [Línea 57] Estado reactivo de React [cuentaCorriente, setCuentaCorriente]: guarda el valor actual y la función para actualizarlo.
  const [cuentaCorriente, setCuentaCorriente] = useState(false);
  // [Línea 58] Estado reactivo de React [limiteTexto, setLimiteTexto]: guarda el valor actual y la función para actualizarlo.
  const [limiteTexto, setLimiteTexto] = useState("");

  // [Línea 60] Declara '{ errores, enviando, enviar, limpiarErrores }' y le asigna el valor resultante.
  const { errores, enviando, enviar, limpiarErrores } = usarFormulario({
    // [Línea 61] Define o asigna el campo/parámetro 'esquema'.
    esquema: esquemaClienteNuevo,
    // [Línea 62] Define o asigna el campo/parámetro 'accion'.
    accion: (datos) => accionCrearCliente(datos),
    // [Línea 63] Define o asigna el campo/parámetro 'mensajeExito'.
    mensajeExito: "Cliente registrado con éxito",
    // [Línea 64] Define o asigna el campo/parámetro 'alTerminar'.
    alTerminar: (creado) => {
      // [Línea 65] Ejecuta o evalúa: setAbierto(false);
      setAbierto(false);
      // [Línea 66] Ejecuta o evalúa: alCrear?.(creado);
      alCrear?.(creado);
    // [Línea 67] Cierra el bloque o estructura (},).
    },
  // [Línea 68] Cierra el bloque o estructura (});).
  });

  // [Línea 70] Declara la función o componente 'abrir'.
  function abrir() {
    // [Línea 71] Ejecuta o evalúa: limpiarErrores();
    limpiarErrores();
    // [Línea 72] Ejecuta o evalúa: setTipoDoc("DNI");
    setTipoDoc("DNI");
    // [Línea 73] Ejecuta o evalúa: setNroDoc("");
    setNroDoc("");
    // [Línea 74] Ejecuta o evalúa: setNombreCliente("");
    setNombreCliente("");
    // [Línea 75] Ejecuta o evalúa: setDomicilioCliente("");
    setDomicilioCliente("");
    // [Línea 76] Ejecuta o evalúa: setTelefonoCliente("");
    setTelefonoCliente("");
    // [Línea 77] Ejecuta o evalúa: setEmailCliente("");
    setEmailCliente("");
    // [Línea 78] Ejecuta o evalúa: setCuentaCorriente(false);
    setCuentaCorriente(false);
    // [Línea 79] Ejecuta o evalúa: setLimiteTexto("");
    setLimiteTexto("");
    // [Línea 80] Ejecuta o evalúa: setAbierto(true);
    setAbierto(true);
  // [Línea 81] Cierra el bloque o estructura (}).
  }

  // [Línea 83] Declara la función o componente 'manejarSubmit'.
  function manejarSubmit(e: React.FormEvent) {
    // [Línea 84] Ejecuta o evalúa: e.preventDefault();
    e.preventDefault();
    // [Línea 85] Ejecuta o evalúa: enviar({
    enviar({
      // [Línea 86] Ejecuta o evalúa: tipoDoc,
      tipoDoc,
      // [Línea 87] Ejecuta o evalúa: nroDoc,
      nroDoc,
      // [Línea 88] Define o asigna el campo/parámetro 'nombre'.
      nombre: nombreCliente,
      // [Línea 89] Define o asigna el campo/parámetro 'domicilio'.
      domicilio: domicilioCliente || undefined,
      // [Línea 90] Define o asigna el campo/parámetro 'telefono'.
      telefono: telefonoCliente || undefined,
      // [Línea 91] Define o asigna el campo/parámetro 'email'.
      email: emailCliente || "",
      // [Línea 92] Ejecuta o evalúa: cuentaCorriente,
      cuentaCorriente,
      // [Línea 93] Define o asigna el campo/parámetro 'limiteCredito'.
      limiteCredito: cuentaCorriente ? pesosACentavos(limiteTexto) : null,
    // [Línea 94] Cierra el bloque o estructura (});).
    });
  // [Línea 95] Cierra el bloque o estructura (}).
  }

  // [Línea 97] Devuelve la interfaz JSX que renderiza este componente.
  return (
    <> // [Línea 98] Abre o renderiza el componente visual <elemento>.
      <Button onClick={abrir}> // [Línea 99] Abre o renderiza el componente visual <Button>.
        <Plus className="size-4" /> // [Línea 100] Abre o renderiza el componente visual <Plus>.
        // [Línea 101] Ejecuta o evalúa: {textoBoton}
        {textoBoton}
      </Button> // [Línea 102] Cierra el componente visual </Button>.

      <Dialog open={abierto} onOpenChange={setAbierto}> // [Línea 104] Abre o renderiza el componente visual <Dialog>.
        <DialogContent> // [Línea 105] Abre o renderiza el componente visual <DialogContent>.
          <DialogHeader> // [Línea 106] Abre o renderiza el componente visual <DialogHeader>.
            <DialogTitle>Registrar nuevo cliente</DialogTitle> // [Línea 107] Abre o renderiza el componente visual <DialogTitle>.
            <DialogDescription> // [Línea 108] Abre o renderiza el componente visual <DialogDescription>.
              // [Línea 109] Ejecuta o evalúa: Completá los datos del cliente y si tiene cuenta corriente habilitada.
              Completá los datos del cliente y si tiene cuenta corriente habilitada.
            </DialogDescription> // [Línea 110] Cierra el componente visual </DialogDescription>.
          </DialogHeader> // [Línea 111] Cierra el componente visual </DialogHeader>.

          <form onSubmit={manejarSubmit} className="flex flex-col gap-4"> // [Línea 113] Abre o renderiza el componente visual <form>.
            <Grilla className="grid-cols-1 sm:grid-cols-3"> // [Línea 114] Abre o renderiza el componente visual <Grilla>.
              <CampoFormulario etiqueta="Tipo doc." error={errores.tipoDoc}> // [Línea 115] Abre o renderiza el componente visual <CampoFormulario>.
                <Select // [Línea 116] Abre o renderiza el componente visual <Select>.
                  // [Línea 117] Ejecuta o evalúa: value={tipoDoc}
                  value={tipoDoc}
                  // [Línea 118] Ejecuta o evalúa: onChange={(e) => setTipoDoc(e.target.value as "DNI" | "CUIT")}
                  onChange={(e) => setTipoDoc(e.target.value as "DNI" | "CUIT")}
                // [Línea 119] Ejecuta o evalúa: >
                >
                  <option value="DNI">DNI</option> // [Línea 120] Abre o renderiza el componente visual <option>.
                  <option value="CUIT">CUIT</option> // [Línea 121] Abre o renderiza el componente visual <option>.
                </Select> // [Línea 122] Cierra el componente visual </Select>.
              </CampoFormulario> // [Línea 123] Cierra el componente visual </CampoFormulario>.

              <Apilar className="sm:col-span-2"> // [Línea 125] Abre o renderiza el componente visual <Apilar>.
                <CampoFormulario // [Línea 126] Abre o renderiza el componente visual <CampoFormulario>.
                  // [Línea 127] Ejecuta o evalúa: etiqueta="Número de documento"
                  etiqueta="Número de documento"
                  // [Línea 128] Ejecuta o evalúa: error={errores.nroDoc}
                  error={errores.nroDoc}
                  // [Línea 129] Ejecuta o evalúa: ayuda={tipoDoc === "DNI" ? "7 u 8 dígitos" : "11 dígitos"}
                  ayuda={tipoDoc === "DNI" ? "7 u 8 dígitos" : "11 dígitos"}
                // [Línea 130] Ejecuta o evalúa: >
                >
                  <Input // [Línea 131] Abre o renderiza el componente visual <Input>.
                    // [Línea 132] Ejecuta o evalúa: value={nroDoc}
                    value={nroDoc}
                    // [Línea 133] Ejecuta o evalúa: onChange={(e) => setNroDoc(e.target.value)}
                    onChange={(e) => setNroDoc(e.target.value)}
                    // [Línea 134] Ejecuta o evalúa: placeholder={tipoDoc === "DNI" ? "28.456.123" : "20-28456123-9"}
                    placeholder={tipoDoc === "DNI" ? "28.456.123" : "20-28456123-9"}
                    // [Línea 135] Ejecuta o evalúa: autoFocus
                    autoFocus
                  // [Línea 136] Ejecuta o evalúa: />
                  />
                </CampoFormulario> // [Línea 137] Cierra el componente visual </CampoFormulario>.
              </Apilar> // [Línea 138] Cierra el componente visual </Apilar>.
            </Grilla> // [Línea 139] Cierra el componente visual </Grilla>.

            <CampoFormulario etiqueta="Nombre o razón social" error={errores.nombre}> // [Línea 141] Abre o renderiza el componente visual <CampoFormulario>.
              <Input // [Línea 142] Abre o renderiza el componente visual <Input>.
                // [Línea 143] Ejecuta o evalúa: value={nombreCliente}
                value={nombreCliente}
                // [Línea 144] Ejecuta o evalúa: onChange={(e) => setNombreCliente(e.target.value)}
                onChange={(e) => setNombreCliente(e.target.value)}
                // [Línea 145] Ejecuta o evalúa: placeholder="Ej. Mariana López"
                placeholder="Ej. Mariana López"
              // [Línea 146] Ejecuta o evalúa: />
              />
            </CampoFormulario> // [Línea 147] Cierra el componente visual </CampoFormulario>.

            <Grilla className="grid-cols-1 sm:grid-cols-2"> // [Línea 149] Abre o renderiza el componente visual <Grilla>.
              <CampoFormulario etiqueta="Teléfono" error={errores.telefono}> // [Línea 150] Abre o renderiza el componente visual <CampoFormulario>.
                <Input // [Línea 151] Abre o renderiza el componente visual <Input>.
                  // [Línea 152] Ejecuta o evalúa: value={telefonoCliente}
                  value={telefonoCliente}
                  // [Línea 153] Ejecuta o evalúa: onChange={(e) => setTelefonoCliente(e.target.value)}
                  onChange={(e) => setTelefonoCliente(e.target.value)}
                  // [Línea 154] Ejecuta o evalúa: placeholder="381 455-2210"
                  placeholder="381 455-2210"
                // [Línea 155] Ejecuta o evalúa: />
                />
              </CampoFormulario> // [Línea 156] Cierra el componente visual </CampoFormulario>.

              <CampoFormulario etiqueta="Email" error={errores.email}> // [Línea 158] Abre o renderiza el componente visual <CampoFormulario>.
                <Input // [Línea 159] Abre o renderiza el componente visual <Input>.
                  // [Línea 160] Ejecuta o evalúa: type="email"
                  type="email"
                  // [Línea 161] Ejecuta o evalúa: value={emailCliente}
                  value={emailCliente}
                  // [Línea 162] Ejecuta o evalúa: onChange={(e) => setEmailCliente(e.target.value)}
                  onChange={(e) => setEmailCliente(e.target.value)}
                  // [Línea 163] Ejecuta o evalúa: placeholder="cliente@correo.test"
                  placeholder="cliente@correo.test"
                // [Línea 164] Ejecuta o evalúa: />
                />
              </CampoFormulario> // [Línea 165] Cierra el componente visual </CampoFormulario>.
            </Grilla> // [Línea 166] Cierra el componente visual </Grilla>.

            <CampoFormulario etiqueta="Domicilio" error={errores.domicilio}> // [Línea 168] Abre o renderiza el componente visual <CampoFormulario>.
              <Input // [Línea 169] Abre o renderiza el componente visual <Input>.
                // [Línea 170] Ejecuta o evalúa: value={domicilioCliente}
                value={domicilioCliente}
                // [Línea 171] Ejecuta o evalúa: onChange={(e) => setDomicilioCliente(e.target.value)}
                onChange={(e) => setDomicilioCliente(e.target.value)}
                // [Línea 172] Ejecuta o evalúa: placeholder="Las Heras 455"
                placeholder="Las Heras 455"
              // [Línea 173] Ejecuta o evalúa: />
              />
            </CampoFormulario> // [Línea 174] Cierra el componente visual </CampoFormulario>.

            <Alinear className="gap-2 rounded-lg border border-border bg-secondary/40 p-3"> // [Línea 176] Abre o renderiza el componente visual <Alinear>.
              <input // [Línea 177] Abre o renderiza el componente visual <input>.
                // [Línea 178] Ejecuta o evalúa: id="chk-cuenta-nueva"
                id="chk-cuenta-nueva"
                // [Línea 179] Ejecuta o evalúa: type="checkbox"
                type="checkbox"
                // [Línea 180] Ejecuta o evalúa: checked={cuentaCorriente}
                checked={cuentaCorriente}
                // [Línea 181] Ejecuta o evalúa: onChange={(e) => setCuentaCorriente(e.target.checked)}
                onChange={(e) => setCuentaCorriente(e.target.checked)}
                // [Línea 182] Ejecuta o evalúa: className="size-4 accent-primary"
                className="size-4 accent-primary"
              // [Línea 183] Ejecuta o evalúa: />
              />
              <label htmlFor="chk-cuenta-nueva" className="text-sm font-medium cursor-pointer"> // [Línea 184] Abre o renderiza el componente visual <label>.
                // [Línea 185] Ejecuta o evalúa: Habilitar cuenta corriente para compras a crédito
                Habilitar cuenta corriente para compras a crédito
              </label> // [Línea 186] Cierra el componente visual </label>.
            </Alinear> // [Línea 187] Cierra el componente visual </Alinear>.

            // [Línea 189] Ejecuta o evalúa: {cuentaCorriente && (
            {cuentaCorriente && (
              <CampoImporte // [Línea 190] Abre o renderiza el componente visual <CampoImporte>.
                // [Línea 191] Ejecuta o evalúa: etiqueta="Límite de crédito (opcional)"
                etiqueta="Límite de crédito (opcional)"
                // [Línea 192] Ejecuta o evalúa: valorTexto={limiteTexto}
                valorTexto={limiteTexto}
                // [Línea 193] Ejecuta o evalúa: alCambiar={setLimiteTexto}
                alCambiar={setLimiteTexto}
                // [Línea 194] Ejecuta o evalúa: error={errores.limiteCredito}
                error={errores.limiteCredito}
                // [Línea 195] Ejecuta o evalúa: ayuda="Dejar vacío si no tiene tope de crédito"
                ayuda="Dejar vacío si no tiene tope de crédito"
              // [Línea 196] Ejecuta o evalúa: />
              />
            // [Línea 197] Ejecuta o evalúa: )}
            )}

            <DialogFooter> // [Línea 199] Abre o renderiza el componente visual <DialogFooter>.
              <Button variant="outline" onClick={() => setAbierto(false)}> // [Línea 200] Abre o renderiza el componente visual <Button>.
                // [Línea 201] Ejecuta o evalúa: Cancelar
                Cancelar
              </Button> // [Línea 202] Cierra el componente visual </Button>.
              <Button type="submit" disabled={enviando}> // [Línea 203] Abre o renderiza el componente visual <Button>.
                // [Línea 204] Ejecuta o evalúa: {enviando ? "Guardando..." : "Guardar cliente"}
                {enviando ? "Guardando..." : "Guardar cliente"}
              </Button> // [Línea 205] Cierra el componente visual </Button>.
            </DialogFooter> // [Línea 206] Cierra el componente visual </DialogFooter>.
          </form> // [Línea 207] Cierra el componente visual </form>.
        </DialogContent> // [Línea 208] Cierra el componente visual </DialogContent>.
      </Dialog> // [Línea 209] Cierra el componente visual </Dialog>.
    </> // [Línea 210] Cierra el componente visual </elemento>.
  // [Línea 211] Cierra el bloque o estructura ();).
  );
// [Línea 212] Cierra el bloque o estructura (}).
}

// ---------- Registrar pago en cuenta corriente (RF-C5) ----------
// [Línea 215] Declara la función o componente 'BotonRegistrarPago'.
export function BotonRegistrarPago({ cliente }: { cliente: ClientePublico }) {
  // [Línea 216] Declara 'router' y le asigna el valor resultante.
  const router = useRouter();
  // [Línea 217] Estado reactivo de React [abierto, setAbierto]: guarda el valor actual y la función para actualizarlo.
  const [abierto, setAbierto] = useState(false);
  // [Línea 218] Estado reactivo de React [importeTexto, setImporteTexto]: guarda el valor actual y la función para actualizarlo.
  const [importeTexto, setImporteTexto] = useState("");
  // [Línea 219] Estado reactivo de React [medioPago, setMedioPago]: guarda el valor actual y la función para actualizarlo.
  const [medioPago, setMedioPago] = useState<(typeof MEDIOS_PAGO)[number]>("efectivo");
  // [Línea 220] Estado reactivo de React [observacionPago, setObservacionPago]: guarda el valor actual y la función para actualizarlo.
  const [observacionPago, setObservacionPago] = useState("");

  // [Línea 222] Declara '{ errores, enviando, enviar, limpiarErrores }' y le asigna el valor resultante.
  const { errores, enviando, enviar, limpiarErrores } = usarFormulario({
    // [Línea 223] Define o asigna el campo/parámetro 'esquema'.
    esquema: esquemaPagoNuevo,
    // [Línea 224] Define o asigna el campo/parámetro 'accion'.
    accion: (datos) => accionRegistrarPago(cliente.id, datos),
    // [Línea 225] Define o asigna el campo/parámetro 'mensajeExito'.
    mensajeExito: "Pago registrado y recibo emitido",
    // [Línea 226] Define o asigna el campo/parámetro 'alTerminar'.
    alTerminar: (recibo) => {
      // [Línea 227] Ejecuta o evalúa: setAbierto(false);
      setAbierto(false);
      // [Línea 228] Ejecuta o evalúa: router.push(`/clientes/recibos/${recibo.id}`);
      router.push(`/clientes/recibos/${recibo.id}`);
    // [Línea 229] Cierra el bloque o estructura (},).
    },
  // [Línea 230] Cierra el bloque o estructura (});).
  });

  // [Línea 232] Verifica la condición: if (!cliente.cuentaCorriente || cliente.saldo <= 0) return null;
  if (!cliente.cuentaCorriente || cliente.saldo <= 0) return null;

  // [Línea 234] Declara la función o componente 'abrir'.
  function abrir() {
    // [Línea 235] Ejecuta o evalúa: limpiarErrores();
    limpiarErrores();
    // [Línea 236] Ejecuta o evalúa: setImporteTexto(centavosATextoPesos(cliente.saldo));
    setImporteTexto(centavosATextoPesos(cliente.saldo));
    // [Línea 237] Ejecuta o evalúa: setMedioPago("efectivo");
    setMedioPago("efectivo");
    // [Línea 238] Ejecuta o evalúa: setObservacionPago("");
    setObservacionPago("");
    // [Línea 239] Ejecuta o evalúa: setAbierto(true);
    setAbierto(true);
  // [Línea 240] Cierra el bloque o estructura (}).
  }

  // [Línea 242] Declara la función o componente 'manejarSubmit'.
  function manejarSubmit(e: React.FormEvent) {
    // [Línea 243] Ejecuta o evalúa: e.preventDefault();
    e.preventDefault();
    // [Línea 244] Ejecuta o evalúa: enviar({
    enviar({
      // [Línea 245] Define o asigna el campo/parámetro 'importe'.
      importe: pesosACentavos(importeTexto) ?? -1,
      // [Línea 246] Define o asigna el campo/parámetro 'medio'.
      medio: medioPago,
      // [Línea 247] Define o asigna el campo/parámetro 'observacion'.
      observacion: observacionPago || undefined,
    // [Línea 248] Cierra el bloque o estructura (});).
    });
  // [Línea 249] Cierra el bloque o estructura (}).
  }

  // [Línea 251] Devuelve la interfaz JSX que renderiza este componente.
  return (
    <> // [Línea 252] Abre o renderiza el componente visual <elemento>.
      <Button variant="default" size="sm" onClick={abrir}> // [Línea 253] Abre o renderiza el componente visual <Button>.
        <Banknote className="size-4" /> // [Línea 254] Abre o renderiza el componente visual <Banknote>.
        // [Línea 255] Ejecuta o evalúa: Registrar pago
        Registrar pago
      </Button> // [Línea 256] Cierra el componente visual </Button>.

      <Dialog open={abierto} onOpenChange={setAbierto}> // [Línea 258] Abre o renderiza el componente visual <Dialog>.
        <DialogContent> // [Línea 259] Abre o renderiza el componente visual <DialogContent>.
          <DialogHeader> // [Línea 260] Abre o renderiza el componente visual <DialogHeader>.
            <DialogTitle>Registrar pago en cuenta corriente</DialogTitle> // [Línea 261] Abre o renderiza el componente visual <DialogTitle>.
            <DialogDescription> // [Línea 262] Abre o renderiza el componente visual <DialogDescription>.
              // [Línea 263] Define o asigna el campo/parámetro 'Cliente'.
              Cliente: {cliente.nombre} · Deuda actual: {formatearMoneda(cliente.saldo)}
            </DialogDescription> // [Línea 264] Cierra el componente visual </DialogDescription>.
          </DialogHeader> // [Línea 265] Cierra el componente visual </DialogHeader>.

          <form onSubmit={manejarSubmit} className="flex flex-col gap-4"> // [Línea 267] Abre o renderiza el componente visual <form>.
            <Grilla className="grid-cols-1 sm:grid-cols-2"> // [Línea 268] Abre o renderiza el componente visual <Grilla>.
              <CampoImporte // [Línea 269] Abre o renderiza el componente visual <CampoImporte>.
                // [Línea 270] Ejecuta o evalúa: etiqueta="Importe a abonar"
                etiqueta="Importe a abonar"
                // [Línea 271] Ejecuta o evalúa: valorTexto={importeTexto}
                valorTexto={importeTexto}
                // [Línea 272] Ejecuta o evalúa: alCambiar={setImporteTexto}
                alCambiar={setImporteTexto}
                // [Línea 273] Ejecuta o evalúa: error={errores.importe}
                error={errores.importe}
                // [Línea 274] Ejecuta o evalúa: ayuda={`Máximo permitido: ${formatearMoneda(cliente.saldo)}`}
                ayuda={`Máximo permitido: ${formatearMoneda(cliente.saldo)}`}
              // [Línea 275] Ejecuta o evalúa: />
              />

              <CampoFormulario etiqueta="Medio de pago" error={errores.medio}> // [Línea 277] Abre o renderiza el componente visual <CampoFormulario>.
                <Select // [Línea 278] Abre o renderiza el componente visual <Select>.
                  // [Línea 279] Ejecuta o evalúa: value={medioPago}
                  value={medioPago}
                  // [Línea 280] Ejecuta o evalúa: onChange={(e) => setMedioPago(e.target.value as (typeof MEDIOS_PAGO)[number])}
                  onChange={(e) => setMedioPago(e.target.value as (typeof MEDIOS_PAGO)[number])}
                // [Línea 281] Ejecuta o evalúa: >
                >
                  // [Línea 282] Ejecuta o evalúa: {MEDIOS_PAGO.map((m) => (
                  {MEDIOS_PAGO.map((m) => (
                    <option key={m} value={m}> // [Línea 283] Abre o renderiza el componente visual <option>.
                      // [Línea 284] Ejecuta o evalúa: {NOMBRES_MEDIO_PAGO[m]}
                      {NOMBRES_MEDIO_PAGO[m]}
                    </option> // [Línea 285] Cierra el componente visual </option>.
                  // [Línea 286] Ejecuta o evalúa: ))}
                  ))}
                </Select> // [Línea 287] Cierra el componente visual </Select>.
              </CampoFormulario> // [Línea 288] Cierra el componente visual </CampoFormulario>.
            </Grilla> // [Línea 289] Cierra el componente visual </Grilla>.

            <CampoFormulario etiqueta="Observación (opcional)" error={errores.observacion}> // [Línea 291] Abre o renderiza el componente visual <CampoFormulario>.
              <Textarea // [Línea 292] Abre o renderiza el componente visual <Textarea>.
                // [Línea 293] Ejecuta o evalúa: value={observacionPago}
                value={observacionPago}
                // [Línea 294] Ejecuta o evalúa: onChange={(e) => setObservacionPago(e.target.value)}
                onChange={(e) => setObservacionPago(e.target.value)}
                // [Línea 295] Ejecuta o evalúa: placeholder="Ej. Pago total / Comprobante transferencia #..."
                placeholder="Ej. Pago total / Comprobante transferencia #..."
              // [Línea 296] Ejecuta o evalúa: />
              />
            </CampoFormulario> // [Línea 297] Cierra el componente visual </CampoFormulario>.

            <DialogFooter> // [Línea 299] Abre o renderiza el componente visual <DialogFooter>.
              <Button variant="outline" onClick={() => setAbierto(false)}> // [Línea 300] Abre o renderiza el componente visual <Button>.
                // [Línea 301] Ejecuta o evalúa: Cancelar
                Cancelar
              </Button> // [Línea 302] Cierra el componente visual </Button>.
              <Button type="submit" disabled={enviando}> // [Línea 303] Abre o renderiza el componente visual <Button>.
                // [Línea 304] Ejecuta o evalúa: {enviando ? "Emitiendo recibo..." : "Confirmar pago y ver recibo"}
                {enviando ? "Emitiendo recibo..." : "Confirmar pago y ver recibo"}
              </Button> // [Línea 305] Cierra el componente visual </Button>.
            </DialogFooter> // [Línea 306] Cierra el componente visual </DialogFooter>.
          </form> // [Línea 307] Cierra el componente visual </form>.
        </DialogContent> // [Línea 308] Cierra el componente visual </DialogContent>.
      </Dialog> // [Línea 309] Cierra el componente visual </Dialog>.
    </> // [Línea 310] Cierra el componente visual </elemento>.
  // [Línea 311] Cierra el bloque o estructura ();).
  );
// [Línea 312] Cierra el bloque o estructura (}).
}

// ---------- Edición y Baja lógica del cliente ----------
// [Línea 315] Declara la función o componente 'BotonesEditarCliente'.
export function BotonesEditarCliente({ cliente }: { cliente: ClientePublico }) {
  // [Línea 316] Estado reactivo de React [modalEditar, setModalEditar]: guarda el valor actual y la función para actualizarlo.
  const [modalEditar, setModalEditar] = useState(false);
  // [Línea 317] Estado reactivo de React [modalBaja, setModalBaja]: guarda el valor actual y la función para actualizarlo.
  const [modalBaja, setModalBaja] = useState(false);

  // [Línea 319] Estado reactivo de React [tipoDoc, setTipoDoc]: guarda el valor actual y la función para actualizarlo.
  const [tipoDoc, setTipoDoc] = useState<"DNI" | "CUIT">(cliente.tipoDoc);
  // [Línea 320] Estado reactivo de React [nroDoc, setNroDoc]: guarda el valor actual y la función para actualizarlo.
  const [nroDoc, setNroDoc] = useState(cliente.nroDoc);
  // [Línea 321] Estado reactivo de React [nombreCliente, setNombreCliente]: guarda el valor actual y la función para actualizarlo.
  const [nombreCliente, setNombreCliente] = useState(cliente.nombre);
  // [Línea 322] Estado reactivo de React [domicilioCliente, setDomicilioCliente]: guarda el valor actual y la función para actualizarlo.
  const [domicilioCliente, setDomicilioCliente] = useState(cliente.domicilio ?? "");
  // [Línea 323] Estado reactivo de React [telefonoCliente, setTelefonoCliente]: guarda el valor actual y la función para actualizarlo.
  const [telefonoCliente, setTelefonoCliente] = useState(cliente.telefono ?? "");
  // [Línea 324] Estado reactivo de React [emailCliente, setEmailCliente]: guarda el valor actual y la función para actualizarlo.
  const [emailCliente, setEmailCliente] = useState(cliente.email ?? "");
  // [Línea 325] Estado reactivo de React [cuentaCorriente, setCuentaCorriente]: guarda el valor actual y la función para actualizarlo.
  const [cuentaCorriente, setCuentaCorriente] = useState(cliente.cuentaCorriente);
  // [Línea 326] Estado reactivo de React [limiteTexto, setLimiteTexto]: guarda el valor actual y la función para actualizarlo.
  const [limiteTexto, setLimiteTexto] = useState(centavosATextoPesos(cliente.limiteCredito));

  // [Línea 328] Declara '{ errores, enviando, enviar, limpiarErrores }' y le asigna el valor resultante.
  const { errores, enviando, enviar, limpiarErrores } = usarFormulario({
    // [Línea 329] Define o asigna el campo/parámetro 'esquema'.
    esquema: esquemaClienteEdicion,
    // [Línea 330] Define o asigna el campo/parámetro 'accion'.
    accion: (datos) => accionEditarCliente(cliente.id, datos),
    // [Línea 331] Define o asigna el campo/parámetro 'mensajeExito'.
    mensajeExito: "Datos del cliente actualizados",
    // [Línea 332] Define o asigna el campo/parámetro 'alTerminar'.
    alTerminar: () => setModalEditar(false),
  // [Línea 333] Cierra el bloque o estructura (});).
  });

  // [Línea 335] Declara la función o componente 'abrirEdicion'.
  function abrirEdicion() {
    // [Línea 336] Ejecuta o evalúa: limpiarErrores();
    limpiarErrores();
    // [Línea 337] Ejecuta o evalúa: setTipoDoc(cliente.tipoDoc);
    setTipoDoc(cliente.tipoDoc);
    // [Línea 338] Ejecuta o evalúa: setNroDoc(cliente.nroDoc);
    setNroDoc(cliente.nroDoc);
    // [Línea 339] Ejecuta o evalúa: setNombreCliente(cliente.nombre);
    setNombreCliente(cliente.nombre);
    // [Línea 340] Ejecuta o evalúa: setDomicilioCliente(cliente.domicilio ?? "");
    setDomicilioCliente(cliente.domicilio ?? "");
    // [Línea 341] Ejecuta o evalúa: setTelefonoCliente(cliente.telefono ?? "");
    setTelefonoCliente(cliente.telefono ?? "");
    // [Línea 342] Ejecuta o evalúa: setEmailCliente(cliente.email ?? "");
    setEmailCliente(cliente.email ?? "");
    // [Línea 343] Ejecuta o evalúa: setCuentaCorriente(cliente.cuentaCorriente);
    setCuentaCorriente(cliente.cuentaCorriente);
    // [Línea 344] Ejecuta o evalúa: setLimiteTexto(centavosATextoPesos(cliente.limiteCredito));
    setLimiteTexto(centavosATextoPesos(cliente.limiteCredito));
    // [Línea 345] Ejecuta o evalúa: setModalEditar(true);
    setModalEditar(true);
  // [Línea 346] Cierra el bloque o estructura (}).
  }

  // [Línea 348] Declara la función asíncrona 'cambiarEstadoActivo'.
  async function cambiarEstadoActivo() {
    // [Línea 349] Espera el resultado de la consulta/operación asíncrona y lo asigna a 'res'.
    const res = await accionEditarCliente(cliente.id, { activo: !cliente.activo });
    // [Línea 350] Verifica la condición: if (!res.ok) {
    if (!res.ok) {
      // [Línea 351] Muestra un aviso emergente en pantalla: toast.error(res.error.message);
      toast.error(res.error.message);
      // [Línea 352] Ejecuta o evalúa: return;
      return;
    // [Línea 353] Cierra el bloque o estructura (}).
    }
    // [Línea 354] Muestra un aviso emergente en pantalla: toast.success(cliente.activo ? "Cliente dado de baja" : "Cliente reactivado");
    toast.success(cliente.activo ? "Cliente dado de baja" : "Cliente reactivado");
  // [Línea 355] Cierra el bloque o estructura (}).
  }

  // [Línea 357] Devuelve la interfaz JSX que renderiza este componente.
  return (
    <Alinear className="gap-1.5"> // [Línea 358] Abre o renderiza el componente visual <Alinear>.
      <Button variant="outline" size="xs" onClick={abrirEdicion}> // [Línea 359] Abre o renderiza el componente visual <Button>.
        <Pencil className="size-3.5" /> // [Línea 360] Abre o renderiza el componente visual <Pencil>.
        // [Línea 361] Ejecuta o evalúa: Editar
        Editar
      </Button> // [Línea 362] Cierra el componente visual </Button>.
      <Button // [Línea 363] Abre o renderiza el componente visual <Button>.
        // [Línea 364] Ejecuta o evalúa: variant={cliente.activo ? "ghost" : "secondary"}
        variant={cliente.activo ? "ghost" : "secondary"}
        // [Línea 365] Ejecuta o evalúa: size="xs"
        size="xs"
        // [Línea 366] Ejecuta o evalúa: onClick={() => setModalBaja(true)}
        onClick={() => setModalBaja(true)}
      // [Línea 367] Ejecuta o evalúa: >
      >
        <Power className="size-3.5" /> // [Línea 368] Abre o renderiza el componente visual <Power>.
        // [Línea 369] Ejecuta o evalúa: {cliente.activo ? "Baja" : "Activar"}
        {cliente.activo ? "Baja" : "Activar"}
      </Button> // [Línea 370] Cierra el componente visual </Button>.

      <Dialog open={modalEditar} onOpenChange={setModalEditar}> // [Línea 372] Abre o renderiza el componente visual <Dialog>.
        <DialogContent> // [Línea 373] Abre o renderiza el componente visual <DialogContent>.
          <DialogHeader> // [Línea 374] Abre o renderiza el componente visual <DialogHeader>.
            <DialogTitle>Editar cliente</DialogTitle> // [Línea 375] Abre o renderiza el componente visual <DialogTitle>.
            <DialogDescription> // [Línea 376] Abre o renderiza el componente visual <DialogDescription>.
              // [Línea 377] Ejecuta o evalúa: Modificá los datos de contacto o las condiciones de cuenta corriente.
              Modificá los datos de contacto o las condiciones de cuenta corriente.
            </DialogDescription> // [Línea 378] Cierra el componente visual </DialogDescription>.
          </DialogHeader> // [Línea 379] Cierra el componente visual </DialogHeader>.

          <form // [Línea 381] Abre o renderiza el componente visual <form>.
            // [Línea 382] Ejecuta o evalúa: onSubmit={(e) => {
            onSubmit={(e) => {
              // [Línea 383] Ejecuta o evalúa: e.preventDefault();
              e.preventDefault();
              // [Línea 384] Ejecuta o evalúa: enviar({
              enviar({
                // [Línea 385] Ejecuta o evalúa: tipoDoc,
                tipoDoc,
                // [Línea 386] Ejecuta o evalúa: nroDoc,
                nroDoc,
                // [Línea 387] Define o asigna el campo/parámetro 'nombre'.
                nombre: nombreCliente,
                // [Línea 388] Define o asigna el campo/parámetro 'domicilio'.
                domicilio: domicilioCliente,
                // [Línea 389] Define o asigna el campo/parámetro 'telefono'.
                telefono: telefonoCliente,
                // [Línea 390] Define o asigna el campo/parámetro 'email'.
                email: emailCliente || "",
                // [Línea 391] Ejecuta o evalúa: cuentaCorriente,
                cuentaCorriente,
                // [Línea 392] Define o asigna el campo/parámetro 'limiteCredito'.
                limiteCredito: cuentaCorriente ? pesosACentavos(limiteTexto) : null,
              // [Línea 393] Cierra el bloque o estructura (});).
              });
            // [Línea 394] Ejecuta o evalúa: }}
            }}
            // [Línea 395] Ejecuta o evalúa: className="flex flex-col gap-4"
            className="flex flex-col gap-4"
          // [Línea 396] Ejecuta o evalúa: >
          >
            <Grilla className="grid-cols-1 sm:grid-cols-3"> // [Línea 397] Abre o renderiza el componente visual <Grilla>.
              <CampoFormulario etiqueta="Tipo doc." error={errores.tipoDoc}> // [Línea 398] Abre o renderiza el componente visual <CampoFormulario>.
                <Select // [Línea 399] Abre o renderiza el componente visual <Select>.
                  // [Línea 400] Ejecuta o evalúa: value={tipoDoc}
                  value={tipoDoc}
                  // [Línea 401] Ejecuta o evalúa: onChange={(e) => setTipoDoc(e.target.value as "DNI" | "CUIT")}
                  onChange={(e) => setTipoDoc(e.target.value as "DNI" | "CUIT")}
                // [Línea 402] Ejecuta o evalúa: >
                >
                  <option value="DNI">DNI</option> // [Línea 403] Abre o renderiza el componente visual <option>.
                  <option value="CUIT">CUIT</option> // [Línea 404] Abre o renderiza el componente visual <option>.
                </Select> // [Línea 405] Cierra el componente visual </Select>.
              </CampoFormulario> // [Línea 406] Cierra el componente visual </CampoFormulario>.

              <Apilar className="sm:col-span-2"> // [Línea 408] Abre o renderiza el componente visual <Apilar>.
                <CampoFormulario etiqueta="Número de documento" error={errores.nroDoc}> // [Línea 409] Abre o renderiza el componente visual <CampoFormulario>.
                  <Input value={nroDoc} onChange={(e) => setNroDoc(e.target.value)} /> // [Línea 410] Abre o renderiza el componente visual <Input>.
                </CampoFormulario> // [Línea 411] Cierra el componente visual </CampoFormulario>.
              </Apilar> // [Línea 412] Cierra el componente visual </Apilar>.
            </Grilla> // [Línea 413] Cierra el componente visual </Grilla>.

            <CampoFormulario etiqueta="Nombre o razón social" error={errores.nombre}> // [Línea 415] Abre o renderiza el componente visual <CampoFormulario>.
              <Input // [Línea 416] Abre o renderiza el componente visual <Input>.
                // [Línea 417] Ejecuta o evalúa: value={nombreCliente}
                value={nombreCliente}
                // [Línea 418] Ejecuta o evalúa: onChange={(e) => setNombreCliente(e.target.value)}
                onChange={(e) => setNombreCliente(e.target.value)}
              // [Línea 419] Ejecuta o evalúa: />
              />
            </CampoFormulario> // [Línea 420] Cierra el componente visual </CampoFormulario>.

            <Grilla className="grid-cols-1 sm:grid-cols-2"> // [Línea 422] Abre o renderiza el componente visual <Grilla>.
              <CampoFormulario etiqueta="Teléfono" error={errores.telefono}> // [Línea 423] Abre o renderiza el componente visual <CampoFormulario>.
                <Input // [Línea 424] Abre o renderiza el componente visual <Input>.
                  // [Línea 425] Ejecuta o evalúa: value={telefonoCliente}
                  value={telefonoCliente}
                  // [Línea 426] Ejecuta o evalúa: onChange={(e) => setTelefonoCliente(e.target.value)}
                  onChange={(e) => setTelefonoCliente(e.target.value)}
                // [Línea 427] Ejecuta o evalúa: />
                />
              </CampoFormulario> // [Línea 428] Cierra el componente visual </CampoFormulario>.

              <CampoFormulario etiqueta="Email" error={errores.email}> // [Línea 430] Abre o renderiza el componente visual <CampoFormulario>.
                <Input // [Línea 431] Abre o renderiza el componente visual <Input>.
                  // [Línea 432] Ejecuta o evalúa: type="email"
                  type="email"
                  // [Línea 433] Ejecuta o evalúa: value={emailCliente}
                  value={emailCliente}
                  // [Línea 434] Ejecuta o evalúa: onChange={(e) => setEmailCliente(e.target.value)}
                  onChange={(e) => setEmailCliente(e.target.value)}
                // [Línea 435] Ejecuta o evalúa: />
                />
              </CampoFormulario> // [Línea 436] Cierra el componente visual </CampoFormulario>.
            </Grilla> // [Línea 437] Cierra el componente visual </Grilla>.

            <CampoFormulario etiqueta="Domicilio" error={errores.domicilio}> // [Línea 439] Abre o renderiza el componente visual <CampoFormulario>.
              <Input // [Línea 440] Abre o renderiza el componente visual <Input>.
                // [Línea 441] Ejecuta o evalúa: value={domicilioCliente}
                value={domicilioCliente}
                // [Línea 442] Ejecuta o evalúa: onChange={(e) => setDomicilioCliente(e.target.value)}
                onChange={(e) => setDomicilioCliente(e.target.value)}
              // [Línea 443] Ejecuta o evalúa: />
              />
            </CampoFormulario> // [Línea 444] Cierra el componente visual </CampoFormulario>.

            <Alinear className="gap-2 rounded-lg border border-border bg-secondary/40 p-3"> // [Línea 446] Abre o renderiza el componente visual <Alinear>.
              <input // [Línea 447] Abre o renderiza el componente visual <input>.
                // [Línea 448] Ejecuta o evalúa: id="chk-cuenta-edicion"
                id="chk-cuenta-edicion"
                // [Línea 449] Ejecuta o evalúa: type="checkbox"
                type="checkbox"
                // [Línea 450] Ejecuta o evalúa: checked={cuentaCorriente}
                checked={cuentaCorriente}
                // [Línea 451] Ejecuta o evalúa: onChange={(e) => setCuentaCorriente(e.target.checked)}
                onChange={(e) => setCuentaCorriente(e.target.checked)}
                // [Línea 452] Ejecuta o evalúa: className="size-4 accent-primary"
                className="size-4 accent-primary"
              // [Línea 453] Ejecuta o evalúa: />
              />
              <label htmlFor="chk-cuenta-edicion" className="text-sm font-medium cursor-pointer"> // [Línea 454] Abre o renderiza el componente visual <label>.
                // [Línea 455] Ejecuta o evalúa: Habilitado para cuenta corriente
                Habilitado para cuenta corriente
              </label> // [Línea 456] Cierra el componente visual </label>.
            </Alinear> // [Línea 457] Cierra el componente visual </Alinear>.

            // [Línea 459] Ejecuta o evalúa: {cuentaCorriente && (
            {cuentaCorriente && (
              <CampoImporte // [Línea 460] Abre o renderiza el componente visual <CampoImporte>.
                // [Línea 461] Ejecuta o evalúa: etiqueta="Límite de crédito (opcional)"
                etiqueta="Límite de crédito (opcional)"
                // [Línea 462] Ejecuta o evalúa: valorTexto={limiteTexto}
                valorTexto={limiteTexto}
                // [Línea 463] Ejecuta o evalúa: alCambiar={setLimiteTexto}
                alCambiar={setLimiteTexto}
                // [Línea 464] Ejecuta o evalúa: error={errores.limiteCredito}
                error={errores.limiteCredito}
                // [Línea 465] Ejecuta o evalúa: ayuda="Dejar vacío para sin límite"
                ayuda="Dejar vacío para sin límite"
              // [Línea 466] Ejecuta o evalúa: />
              />
            // [Línea 467] Ejecuta o evalúa: )}
            )}

            <DialogFooter> // [Línea 469] Abre o renderiza el componente visual <DialogFooter>.
              <Button variant="outline" onClick={() => setModalEditar(false)}> // [Línea 470] Abre o renderiza el componente visual <Button>.
                // [Línea 471] Ejecuta o evalúa: Cancelar
                Cancelar
              </Button> // [Línea 472] Cierra el componente visual </Button>.
              <Button type="submit" disabled={enviando}> // [Línea 473] Abre o renderiza el componente visual <Button>.
                // [Línea 474] Ejecuta o evalúa: {enviando ? "Guardando..." : "Guardar cambios"}
                {enviando ? "Guardando..." : "Guardar cambios"}
              </Button> // [Línea 475] Cierra el componente visual </Button>.
            </DialogFooter> // [Línea 476] Cierra el componente visual </DialogFooter>.
          </form> // [Línea 477] Cierra el componente visual </form>.
        </DialogContent> // [Línea 478] Cierra el componente visual </DialogContent>.
      </Dialog> // [Línea 479] Cierra el componente visual </Dialog>.

      <ModalConfirmacion // [Línea 481] Abre o renderiza el componente visual <ModalConfirmacion>.
        // [Línea 482] Ejecuta o evalúa: abierto={modalBaja}
        abierto={modalBaja}
        // [Línea 483] Ejecuta o evalúa: alCambiarAbierto={setModalBaja}
        alCambiarAbierto={setModalBaja}
        // [Línea 484] Ejecuta o evalúa: titulo={cliente.activo ? "Dar de baja al cliente" : "Reactivar cliente"}
        titulo={cliente.activo ? "Dar de baja al cliente" : "Reactivar cliente"}
        // [Línea 485] Ejecuta o evalúa: descripcion={
        descripcion={
          // [Línea 486] Ejecuta o evalúa: cliente.activo
          cliente.activo
            // [Línea 487] Ejecuta o evalúa: ? `¿Querés dar de baja a "${cliente.nombre}"? Solo se permite si no registra deu
            ? `¿Querés dar de baja a "${cliente.nombre}"? Solo se permite si no registra deuda pendiente.`
            // [Línea 488] Ejecuta o evalúa: : `¿Querés reactivar al cliente "${cliente.nombre}"?`
            : `¿Querés reactivar al cliente "${cliente.nombre}"?`
        // [Línea 489] Cierra el bloque o estructura (}).
        }
        // [Línea 490] Ejecuta o evalúa: textoConfirmar={cliente.activo ? "Dar de baja" : "Reactivar"}
        textoConfirmar={cliente.activo ? "Dar de baja" : "Reactivar"}
        // [Línea 491] Ejecuta o evalúa: variante={cliente.activo ? "destructive" : "default"}
        variante={cliente.activo ? "destructive" : "default"}
        // [Línea 492] Ejecuta o evalúa: alConfirmar={cambiarEstadoActivo}
        alConfirmar={cambiarEstadoActivo}
      // [Línea 493] Ejecuta o evalúa: />
      />
    </Alinear> // [Línea 494] Cierra el componente visual </Alinear>.
  // [Línea 495] Cierra el bloque o estructura ();).
  );
// [Línea 496] Cierra el bloque o estructura (}).
}
