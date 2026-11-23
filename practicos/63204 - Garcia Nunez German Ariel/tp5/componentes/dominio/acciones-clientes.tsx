"use client";
// Modales de alta y edición de clientes, baja lógica y registro de pagos en cuenta corriente
// (RF-C2, RF-C5, RF-C7).
import { useState } from "react";
import { useRouter } from "next/navigation";
import { Plus, Pencil, Banknote, Power } from "lucide-react";
import { toast } from "sonner";
import {
  accionCrearCliente,
  accionEditarCliente,
  accionRegistrarPago,
} from "@/acciones/comercial";
import {
  esquemaClienteEdicion,
  esquemaClienteNuevo,
  esquemaPagoNuevo,
  MEDIOS_PAGO,
} from "@/esquemas/clientes";
import { usarFormulario } from "@/hooks/usar-formulario";
import {
  centavosATextoPesos,
  formatearMoneda,
  NOMBRES_MEDIO_PAGO,
  pesosACentavos,
} from "@/lib/formato";
import { Button } from "@/componentes/ui/button";
import { Input } from "@/componentes/ui/input";
import { Select, Textarea } from "@/componentes/ui/select";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/componentes/ui/dialog";
import { CampoFormulario, CampoImporte } from "@/componentes/comunes/campo-formulario";
import { ModalConfirmacion } from "@/componentes/comunes/confirmar-accion";
import { Alinear, Apilar, Grilla, Texto } from "@/componentes/primitivas/maquetacion";
import type { ClientePublico } from "@/servicios/clientes";

// ---------- Alta de cliente ----------
export function BotonNuevoCliente({
  alCrear,
  textoBoton = "Nuevo cliente",
}: {
  alCrear?: (cliente: ClientePublico) => void;
  textoBoton?: string;
}) {
  const [abierto, setAbierto] = useState(false);
  const [tipoDoc, setTipoDoc] = useState<"DNI" | "CUIT">("DNI");
  const [nroDoc, setNroDoc] = useState("");
  const [nombreCliente, setNombreCliente] = useState("");
  const [domicilioCliente, setDomicilioCliente] = useState("");
  const [telefonoCliente, setTelefonoCliente] = useState("");
  const [emailCliente, setEmailCliente] = useState("");
  const [cuentaCorriente, setCuentaCorriente] = useState(false);
  const [limiteTexto, setLimiteTexto] = useState("");

  const { errores, enviando, enviar, limpiarErrores } = usarFormulario({
    esquema: esquemaClienteNuevo,
    accion: (datos) => accionCrearCliente(datos),
    mensajeExito: "Cliente registrado con éxito",
    alTerminar: (creado) => {
      setAbierto(false);
      alCrear?.(creado);
    },
  });

  function abrir() {
    limpiarErrores();
    setTipoDoc("DNI");
    setNroDoc("");
    setNombreCliente("");
    setDomicilioCliente("");
    setTelefonoCliente("");
    setEmailCliente("");
    setCuentaCorriente(false);
    setLimiteTexto("");
    setAbierto(true);
  }

  function manejarSubmit(e: React.FormEvent) {
    e.preventDefault();
    enviar({
      tipoDoc,
      nroDoc,
      nombre: nombreCliente,
      domicilio: domicilioCliente || undefined,
      telefono: telefonoCliente || undefined,
      email: emailCliente || "",
      cuentaCorriente,
      limiteCredito: cuentaCorriente ? pesosACentavos(limiteTexto) : null,
    });
  }

  return (
    <>
      <Button onClick={abrir}>
        <Plus className="size-4" />
        {textoBoton}
      </Button>

      <Dialog open={abierto} onOpenChange={setAbierto}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Registrar nuevo cliente</DialogTitle>
            <DialogDescription>
              Completá los datos del cliente y si tiene cuenta corriente habilitada.
            </DialogDescription>
          </DialogHeader>

          <form onSubmit={manejarSubmit} className="flex flex-col gap-4">
            <Grilla className="grid-cols-1 sm:grid-cols-3">
              <CampoFormulario etiqueta="Tipo doc." error={errores.tipoDoc}>
                <Select
                  value={tipoDoc}
                  onChange={(e) => setTipoDoc(e.target.value as "DNI" | "CUIT")}
                >
                  <option value="DNI">DNI</option>
                  <option value="CUIT">CUIT</option>
                </Select>
              </CampoFormulario>

              <Apilar className="sm:col-span-2">
                <CampoFormulario
                  etiqueta="Número de documento"
                  error={errores.nroDoc}
                  ayuda={tipoDoc === "DNI" ? "7 u 8 dígitos" : "11 dígitos"}
                >
                  <Input
                    value={nroDoc}
                    onChange={(e) => setNroDoc(e.target.value)}
                    placeholder={tipoDoc === "DNI" ? "28.456.123" : "20-28456123-9"}
                    autoFocus
                  />
                </CampoFormulario>
              </Apilar>
            </Grilla>

            <CampoFormulario etiqueta="Nombre o razón social" error={errores.nombre}>
              <Input
                value={nombreCliente}
                onChange={(e) => setNombreCliente(e.target.value)}
                placeholder="Ej. Mariana López"
              />
            </CampoFormulario>

            <Grilla className="grid-cols-1 sm:grid-cols-2">
              <CampoFormulario etiqueta="Teléfono" error={errores.telefono}>
                <Input
                  value={telefonoCliente}
                  onChange={(e) => setTelefonoCliente(e.target.value)}
                  placeholder="381 455-2210"
                />
              </CampoFormulario>

              <CampoFormulario etiqueta="Email" error={errores.email}>
                <Input
                  type="email"
                  value={emailCliente}
                  onChange={(e) => setEmailCliente(e.target.value)}
                  placeholder="cliente@correo.test"
                />
              </CampoFormulario>
            </Grilla>

            <CampoFormulario etiqueta="Domicilio" error={errores.domicilio}>
              <Input
                value={domicilioCliente}
                onChange={(e) => setDomicilioCliente(e.target.value)}
                placeholder="Las Heras 455"
              />
            </CampoFormulario>

            <Alinear className="gap-2 rounded-lg border border-border bg-secondary/40 p-3">
              <input
                id="chk-cuenta-nueva"
                type="checkbox"
                checked={cuentaCorriente}
                onChange={(e) => setCuentaCorriente(e.target.checked)}
                className="size-4 accent-primary"
              />
              <label htmlFor="chk-cuenta-nueva" className="text-sm font-medium cursor-pointer">
                Habilitar cuenta corriente para compras a crédito
              </label>
            </Alinear>

            {cuentaCorriente && (
              <CampoImporte
                etiqueta="Límite de crédito (opcional)"
                valorTexto={limiteTexto}
                alCambiar={setLimiteTexto}
                error={errores.limiteCredito}
                ayuda="Dejar vacío si no tiene tope de crédito"
              />
            )}

            <DialogFooter>
              <Button variant="outline" onClick={() => setAbierto(false)}>
                Cancelar
              </Button>
              <Button type="submit" disabled={enviando}>
                {enviando ? "Guardando..." : "Guardar cliente"}
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>
    </>
  );
}

// ---------- Registrar pago en cuenta corriente (RF-C5) ----------
export function BotonRegistrarPago({ cliente }: { cliente: ClientePublico }) {
  const router = useRouter();
  const [abierto, setAbierto] = useState(false);
  const [importeTexto, setImporteTexto] = useState("");
  const [medioPago, setMedioPago] = useState<(typeof MEDIOS_PAGO)[number]>("efectivo");
  const [observacionPago, setObservacionPago] = useState("");

  const { errores, enviando, enviar, limpiarErrores } = usarFormulario({
    esquema: esquemaPagoNuevo,
    accion: (datos) => accionRegistrarPago(cliente.id, datos),
    mensajeExito: "Pago registrado y recibo emitido",
    alTerminar: (recibo) => {
      setAbierto(false);
      router.push(`/clientes/recibos/${recibo.id}`);
      router.refresh();
    },
  });

  if (!cliente.cuentaCorriente || cliente.saldo <= 0) return null;

  function abrir() {
    limpiarErrores();
    setImporteTexto(centavosATextoPesos(cliente.saldo));
    setMedioPago("efectivo");
    setObservacionPago("");
    setAbierto(true);
  }

  function manejarSubmit(e: React.FormEvent) {
    e.preventDefault();
    enviar({
      importe: pesosACentavos(importeTexto) ?? -1,
      medio: medioPago,
      observacion: observacionPago || undefined,
    });
  }

  return (
    <>
      <Button variant="default" size="sm" onClick={abrir}>
        <Banknote className="size-4" />
        Registrar pago
      </Button>

      <Dialog open={abierto} onOpenChange={setAbierto}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Registrar pago en cuenta corriente</DialogTitle>
            <DialogDescription>
              Cliente: {cliente.nombre} · Deuda actual: {formatearMoneda(cliente.saldo)}
            </DialogDescription>
          </DialogHeader>

          <form onSubmit={manejarSubmit} className="flex flex-col gap-4">
            <Grilla className="grid-cols-1 sm:grid-cols-2">
              <CampoImporte
                etiqueta="Importe a abonar"
                valorTexto={importeTexto}
                alCambiar={setImporteTexto}
                error={errores.importe}
                ayuda={`Máximo permitido: ${formatearMoneda(cliente.saldo)}`}
              />

              <CampoFormulario etiqueta="Medio de pago" error={errores.medio}>
                <Select
                  value={medioPago}
                  onChange={(e) => setMedioPago(e.target.value as (typeof MEDIOS_PAGO)[number])}
                >
                  {MEDIOS_PAGO.map((m) => (
                    <option key={m} value={m}>
                      {NOMBRES_MEDIO_PAGO[m]}
                    </option>
                  ))}
                </Select>
              </CampoFormulario>
            </Grilla>

            <CampoFormulario etiqueta="Observación (opcional)" error={errores.observacion}>
              <Textarea
                value={observacionPago}
                onChange={(e) => setObservacionPago(e.target.value)}
                placeholder="Ej. Pago total / Comprobante transferencia #..."
              />
            </CampoFormulario>

            <DialogFooter>
              <Button variant="outline" onClick={() => setAbierto(false)}>
                Cancelar
              </Button>
              <Button type="submit" disabled={enviando}>
                {enviando ? "Emitiendo recibo..." : "Confirmar pago y ver recibo"}
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>
    </>
  );
}

// ---------- Edición y Baja lógica del cliente ----------
export function BotonesEditarCliente({ cliente }: { cliente: ClientePublico }) {
  const [modalEditar, setModalEditar] = useState(false);
  const [modalBaja, setModalBaja] = useState(false);

  const [tipoDoc, setTipoDoc] = useState<"DNI" | "CUIT">(cliente.tipoDoc);
  const [nroDoc, setNroDoc] = useState(cliente.nroDoc);
  const [nombreCliente, setNombreCliente] = useState(cliente.nombre);
  const [domicilioCliente, setDomicilioCliente] = useState(cliente.domicilio ?? "");
  const [telefonoCliente, setTelefonoCliente] = useState(cliente.telefono ?? "");
  const [emailCliente, setEmailCliente] = useState(cliente.email ?? "");
  const [cuentaCorriente, setCuentaCorriente] = useState(cliente.cuentaCorriente);
  const [limiteTexto, setLimiteTexto] = useState(centavosATextoPesos(cliente.limiteCredito));

  const { errores, enviando, enviar, limpiarErrores } = usarFormulario({
    esquema: esquemaClienteEdicion,
    accion: (datos) => accionEditarCliente(cliente.id, datos),
    mensajeExito: "Datos del cliente actualizados",
    alTerminar: () => setModalEditar(false),
  });

  function abrirEdicion() {
    limpiarErrores();
    setTipoDoc(cliente.tipoDoc);
    setNroDoc(cliente.nroDoc);
    setNombreCliente(cliente.nombre);
    setDomicilioCliente(cliente.domicilio ?? "");
    setTelefonoCliente(cliente.telefono ?? "");
    setEmailCliente(cliente.email ?? "");
    setCuentaCorriente(cliente.cuentaCorriente);
    setLimiteTexto(centavosATextoPesos(cliente.limiteCredito));
    setModalEditar(true);
  }

  async function cambiarEstadoActivo() {
    const res = await accionEditarCliente(cliente.id, { activo: !cliente.activo });
    if (!res.ok) {
      toast.error(res.error.message);
      return;
    }
    toast.success(cliente.activo ? "Cliente dado de baja" : "Cliente reactivado");
  }

  return (
    <Alinear className="gap-1.5">
      <Button variant="outline" size="xs" onClick={abrirEdicion}>
        <Pencil className="size-3.5" />
        Editar
      </Button>
      <Button
        variant={cliente.activo ? "ghost" : "secondary"}
        size="xs"
        onClick={() => setModalBaja(true)}
      >
        <Power className="size-3.5" />
        {cliente.activo ? "Baja" : "Activar"}
      </Button>

      <Dialog open={modalEditar} onOpenChange={setModalEditar}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Editar cliente</DialogTitle>
            <DialogDescription>
              Modificá los datos de contacto o las condiciones de cuenta corriente.
            </DialogDescription>
          </DialogHeader>

          <form
            onSubmit={(e) => {
              e.preventDefault();
              enviar({
                tipoDoc,
                nroDoc,
                nombre: nombreCliente,
                domicilio: domicilioCliente,
                telefono: telefonoCliente,
                email: emailCliente || "",
                cuentaCorriente,
                limiteCredito: cuentaCorriente ? pesosACentavos(limiteTexto) : null,
              });
            }}
            className="flex flex-col gap-4"
          >
            <Grilla className="grid-cols-1 sm:grid-cols-3">
              <CampoFormulario etiqueta="Tipo doc." error={errores.tipoDoc}>
                <Select
                  value={tipoDoc}
                  onChange={(e) => setTipoDoc(e.target.value as "DNI" | "CUIT")}
                >
                  <option value="DNI">DNI</option>
                  <option value="CUIT">CUIT</option>
                </Select>
              </CampoFormulario>

              <Apilar className="sm:col-span-2">
                <CampoFormulario etiqueta="Número de documento" error={errores.nroDoc}>
                  <Input value={nroDoc} onChange={(e) => setNroDoc(e.target.value)} />
                </CampoFormulario>
              </Apilar>
            </Grilla>

            <CampoFormulario etiqueta="Nombre o razón social" error={errores.nombre}>
              <Input
                value={nombreCliente}
                onChange={(e) => setNombreCliente(e.target.value)}
              />
            </CampoFormulario>

            <Grilla className="grid-cols-1 sm:grid-cols-2">
              <CampoFormulario etiqueta="Teléfono" error={errores.telefono}>
                <Input
                  value={telefonoCliente}
                  onChange={(e) => setTelefonoCliente(e.target.value)}
                />
              </CampoFormulario>

              <CampoFormulario etiqueta="Email" error={errores.email}>
                <Input
                  type="email"
                  value={emailCliente}
                  onChange={(e) => setEmailCliente(e.target.value)}
                />
              </CampoFormulario>
            </Grilla>

            <CampoFormulario etiqueta="Domicilio" error={errores.domicilio}>
              <Input
                value={domicilioCliente}
                onChange={(e) => setDomicilioCliente(e.target.value)}
              />
            </CampoFormulario>

            <Alinear className="gap-2 rounded-lg border border-border bg-secondary/40 p-3">
              <input
                id="chk-cuenta-edicion"
                type="checkbox"
                checked={cuentaCorriente}
                onChange={(e) => setCuentaCorriente(e.target.checked)}
                className="size-4 accent-primary"
              />
              <label htmlFor="chk-cuenta-edicion" className="text-sm font-medium cursor-pointer">
                Habilitado para cuenta corriente
              </label>
            </Alinear>

            {cuentaCorriente && (
              <CampoImporte
                etiqueta="Límite de crédito (opcional)"
                valorTexto={limiteTexto}
                alCambiar={setLimiteTexto}
                error={errores.limiteCredito}
                ayuda="Dejar vacío para sin límite"
              />
            )}

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

      <ModalConfirmacion
        abierto={modalBaja}
        alCambiarAbierto={setModalBaja}
        titulo={cliente.activo ? "Dar de baja al cliente" : "Reactivar cliente"}
        descripcion={
          cliente.activo
            ? `¿Querés dar de baja a "${cliente.nombre}"? Solo se permite si no registra deuda pendiente.`
            : `¿Querés reactivar al cliente "${cliente.nombre}"?`
        }
        textoConfirmar={cliente.activo ? "Dar de baja" : "Reactivar"}
        variante={cliente.activo ? "destructive" : "default"}
        alConfirmar={cambiarEstadoActivo}
      />
    </Alinear>
  );
}
