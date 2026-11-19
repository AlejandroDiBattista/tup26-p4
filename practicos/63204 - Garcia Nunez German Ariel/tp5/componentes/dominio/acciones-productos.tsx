"use client";
// Modales de alta y edición de productos, baja lógica e ingresos/egresos de stock (RF-P2, RF-P3, RF-P4, RF-P5).
import { useState } from "react";
import { Plus, Pencil, ArrowUpCircle, ArrowDownCircle, Power } from "lucide-react";
import { toast } from "sonner";
import {
  accionCrearProducto,
  accionEditarProducto,
  accionRegistrarMovimientoStock,
} from "@/acciones/comercial";
import {
  esquemaMovimientoStock,
  esquemaProductoEdicion,
  esquemaProductoNuevo,
  MOTIVOS_EGRESO,
  MOTIVOS_INGRESO,
} from "@/esquemas/productos";
import { usarFormulario } from "@/hooks/usar-formulario";
import { centavosATextoPesos, pesosACentavos } from "@/lib/formato";
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
import { Alinear, Grilla } from "@/componentes/primitivas/maquetacion";
import type { ProductoPublico } from "@/servicios/productos";

type CategoriaOpcion = { id: number; nombre: string };

// ---------- Alta de nuevo producto ----------
export function BotonNuevoProducto({ categorias }: { categorias: CategoriaOpcion[] }) {
  const [abierto, setAbierto] = useState(false);
  const [codigoProducto, setCodigoProducto] = useState("");
  const [descripcionProducto, setDescripcionProducto] = useState("");
  const [categoriaId, setCategoriaId] = useState(String(categorias[0]?.id ?? ""));
  const [precioTexto, setPrecioTexto] = useState("");
  const [stockMinimo, setStockMinimo] = useState("5");
  const [stockInicial, setStockInicial] = useState("0");

  const { errores, enviando, enviar, limpiarErrores } = usarFormulario({
    esquema: esquemaProductoNuevo,
    accion: (datos) => accionCrearProducto(datos),
    mensajeExito: "Producto agregado al catálogo",
    alTerminar: () => setAbierto(false),
  });

  function abrirModal() {
    limpiarErrores();
    setCodigoProducto("");
    setDescripcionProducto("");
    setCategoriaId(String(categorias[0]?.id ?? ""));
    setPrecioTexto("");
    setStockMinimo("5");
    setStockInicial("0");
    setAbierto(true);
  }

  function manejarSubmit(e: React.FormEvent) {
    e.preventDefault();
    enviar({
      codigo: codigoProducto,
      descripcion: descripcionProducto,
      categoriaId: Number(categoriaId),
      precio: pesosACentavos(precioTexto) ?? -1,
      stockMinimo: Number(stockMinimo),
      stockInicial: Number(stockInicial || 0),
    });
  }

  return (
    <>
      <Button onClick={abrirModal}>
        <Plus className="size-4" />
        Nuevo producto
      </Button>

      <Dialog open={abierto} onOpenChange={setAbierto}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Nuevo producto</DialogTitle>
            <DialogDescription>
              El stock inicial se registrará automáticamente como un movimiento de ingreso.
            </DialogDescription>
          </DialogHeader>
          <form onSubmit={manejarSubmit} className="flex flex-col gap-4">
            <Grilla className="grid-cols-1 sm:grid-cols-2">
              <CampoFormulario etiqueta="Código único" error={errores.codigo}>
                <Input
                  value={codigoProducto}
                  onChange={(e) => setCodigoProducto(e.target.value.toUpperCase())}
                  placeholder="Ej. HE-010"
                  autoFocus
                />
              </CampoFormulario>

              <CampoFormulario etiqueta="Categoría" error={errores.categoriaId}>
                <Select value={categoriaId} onChange={(e) => setCategoriaId(e.target.value)}>
                  <option value="">Seleccionar...</option>
                  {categorias.map((cat) => (
                    <option key={cat.id} value={cat.id}>
                      {cat.nombre}
                    </option>
                  ))}
                </Select>
              </CampoFormulario>
            </Grilla>

            <CampoFormulario etiqueta="Descripción" error={errores.descripcion}>
              <Input
                value={descripcionProducto}
                onChange={(e) => setDescripcionProducto(e.target.value)}
                placeholder="Ej. Taladro percutor 750 W"
              />
            </CampoFormulario>

            <Grilla className="grid-cols-1 sm:grid-cols-3">
              <CampoImporte
                etiqueta="Precio de venta"
                valorTexto={precioTexto}
                alCambiar={setPrecioTexto}
                error={errores.precio}
              />

              <CampoFormulario etiqueta="Stock mínimo" error={errores.stockMinimo}>
                <Input
                  type="number"
                  min={0}
                  value={stockMinimo}
                  onChange={(e) => setStockMinimo(e.target.value)}
                />
              </CampoFormulario>

              <CampoFormulario
                etiqueta="Stock inicial"
                error={errores.stockInicial}
                ayuda="Genera ingreso inicial"
              >
                <Input
                  type="number"
                  min={0}
                  value={stockInicial}
                  onChange={(e) => setStockInicial(e.target.value)}
                />
              </CampoFormulario>
            </Grilla>

            <DialogFooter>
              <Button variant="outline" onClick={() => setAbierto(false)}>
                Cancelar
              </Button>
              <Button type="submit" disabled={enviando}>
                {enviando ? "Guardando..." : "Crear producto"}
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>
    </>
  );
}

// ---------- Ingreso o Egreso manual de stock (RF-P4 y RF-P5) ----------
export function BotonesMovimientoStock({
  producto,
}: {
  producto: { id: number; codigo: string; descripcion: string; existencia: number };
}) {
  const [tipoAbierto, setTipoAbierto] = useState<"ingreso" | "egreso" | null>(null);
  const [cantidadMovimiento, setCantidadMovimiento] = useState("1");
  const [motivoMovimiento, setMotivoMovimiento] = useState("");
  const [observacionMovimiento, setObservacionMovimiento] = useState("");

  const { errores, enviando, enviar, limpiarErrores } = usarFormulario({
    esquema: esquemaMovimientoStock,
    accion: (datos) => accionRegistrarMovimientoStock(producto.id, datos),
    mensajeExito: "Movimiento de stock registrado",
    alTerminar: () => setTipoAbierto(null),
  });

  function abrir(tipo: "ingreso" | "egreso") {
    limpiarErrores();
    setCantidadMovimiento("1");
    setMotivoMovimiento(tipo === "ingreso" ? MOTIVOS_INGRESO[0] : MOTIVOS_EGRESO[0]);
    setObservacionMovimiento("");
    setTipoAbierto(tipo);
  }

  function manejarSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!tipoAbierto) return;
    enviar({
      tipo: tipoAbierto,
      cantidad: Number(cantidadMovimiento),
      motivo: motivoMovimiento,
      observacion: observacionMovimiento || undefined,
    });
  }

  const listaMotivos = tipoAbierto === "ingreso" ? MOTIVOS_INGRESO : MOTIVOS_EGRESO;

  return (
    <>
      <Button variant="outline" size="xs" onClick={() => abrir("ingreso")}>
        <ArrowUpCircle className="size-3.5 text-emerald-700" />
        Ingreso
      </Button>
      <Button variant="outline" size="xs" onClick={() => abrir("egreso")}>
        <ArrowDownCircle className="size-3.5 text-amber-700" />
        Egreso
      </Button>

      <Dialog open={tipoAbierto !== null} onOpenChange={(o) => !o && setTipoAbierto(null)}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>
              {tipoAbierto === "ingreso" ? "Ingreso manual de stock" : "Egreso manual de stock"}
            </DialogTitle>
            <DialogDescription>
              {producto.codigo} · {producto.descripcion} (Existencia actual: {producto.existencia})
            </DialogDescription>
          </DialogHeader>

          <form onSubmit={manejarSubmit} className="flex flex-col gap-4">
            <Grilla className="grid-cols-1 sm:grid-cols-2">
              <CampoFormulario etiqueta="Cantidad de unidades" error={errores.cantidad}>
                <Input
                  type="number"
                  min={1}
                  max={tipoAbierto === "egreso" ? Math.max(1, producto.existencia) : undefined}
                  value={cantidadMovimiento}
                  onChange={(e) => setCantidadMovimiento(e.target.value)}
                  autoFocus
                />
              </CampoFormulario>

              <CampoFormulario etiqueta="Motivo obligatorio" error={errores.motivo}>
                <Select
                  value={motivoMovimiento}
                  onChange={(e) => setMotivoMovimiento(e.target.value)}
                >
                  {listaMotivos.map((mot) => (
                    <option key={mot} value={mot}>
                      {mot}
                    </option>
                  ))}
                </Select>
              </CampoFormulario>
            </Grilla>

            <CampoFormulario etiqueta="Observación (opcional)" error={errores.observacion}>
              <Textarea
                value={observacionMovimiento}
                onChange={(e) => setObservacionMovimiento(e.target.value)}
                placeholder="Detalle adicional del movimiento..."
              />
            </CampoFormulario>

            <DialogFooter>
              <Button variant="outline" onClick={() => setTipoAbierto(null)}>
                Cancelar
              </Button>
              <Button
                type="submit"
                variant={tipoAbierto === "egreso" ? "destructive" : "default"}
                disabled={enviando}
              >
                {enviando
                  ? "Registrando..."
                  : tipoAbierto === "ingreso"
                    ? "Confirmar ingreso"
                    : "Confirmar egreso"}
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>
    </>
  );
}

// ---------- Edición y Baja lógica del producto ----------
export function BotonesEditarProducto({
  producto,
  categorias,
}: {
  producto: ProductoPublico;
  categorias: CategoriaOpcion[];
}) {
  const [modalEditar, setModalEditar] = useState(false);
  const [modalBaja, setModalBaja] = useState(false);

  const [codigoProducto, setCodigoProducto] = useState(producto.codigo);
  const [descripcionProducto, setDescripcionProducto] = useState(producto.descripcion);
  const [categoriaId, setCategoriaId] = useState(String(producto.categoria.id));
  const [precioTexto, setPrecioTexto] = useState(centavosATextoPesos(producto.precio));
  const [stockMinimo, setStockMinimo] = useState(String(producto.stockMinimo));

  const { errores, enviando, enviar, limpiarErrores } = usarFormulario({
    esquema: esquemaProductoEdicion,
    accion: (datos) => accionEditarProducto(producto.id, datos),
    mensajeExito: "Producto actualizado",
    alTerminar: () => setModalEditar(false),
  });

  function abrirEdicion() {
    limpiarErrores();
    setCodigoProducto(producto.codigo);
    setDescripcionProducto(producto.descripcion);
    setCategoriaId(String(producto.categoria.id));
    setPrecioTexto(centavosATextoPesos(producto.precio));
    setStockMinimo(String(producto.stockMinimo));
    setModalEditar(true);
  }

  async function cambiarEstadoActivo() {
    const res = await accionEditarProducto(producto.id, { activo: !producto.activo });
    if (!res.ok) {
      toast.error(res.error.message);
      return;
    }
    toast.success(producto.activo ? "Producto dado de baja" : "Producto reactivado");
  }

  return (
    <Alinear className="gap-1.5">
      <Button variant="outline" size="xs" onClick={abrirEdicion}>
        <Pencil className="size-3.5" />
        Editar
      </Button>
      <Button
        variant={producto.activo ? "ghost" : "secondary"}
        size="xs"
        onClick={() => setModalBaja(true)}
      >
        <Power className="size-3.5" />
        {producto.activo ? "Baja" : "Activar"}
      </Button>

      <Dialog open={modalEditar} onOpenChange={setModalEditar}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Editar producto</DialogTitle>
            <DialogDescription>
              La existencia actual ({producto.existencia}) solo se modifica mediante movimientos de stock.
            </DialogDescription>
          </DialogHeader>

          <form
            onSubmit={(e) => {
              e.preventDefault();
              enviar({
                codigo: codigoProducto,
                descripcion: descripcionProducto,
                categoriaId: Number(categoriaId),
                precio: pesosACentavos(precioTexto) ?? -1,
                stockMinimo: Number(stockMinimo),
              });
            }}
            className="flex flex-col gap-4"
          >
            <Grilla className="grid-cols-1 sm:grid-cols-2">
              <CampoFormulario etiqueta="Código único" error={errores.codigo}>
                <Input
                  value={codigoProducto}
                  onChange={(e) => setCodigoProducto(e.target.value.toUpperCase())}
                />
              </CampoFormulario>

              <CampoFormulario etiqueta="Categoría" error={errores.categoriaId}>
                <Select value={categoriaId} onChange={(e) => setCategoriaId(e.target.value)}>
                  {categorias.map((cat) => (
                    <option key={cat.id} value={cat.id}>
                      {cat.nombre}
                    </option>
                  ))}
                </Select>
              </CampoFormulario>
            </Grilla>

            <CampoFormulario etiqueta="Descripción" error={errores.descripcion}>
              <Input
                value={descripcionProducto}
                onChange={(e) => setDescripcionProducto(e.target.value)}
              />
            </CampoFormulario>

            <Grilla className="grid-cols-1 sm:grid-cols-2">
              <CampoImporte
                etiqueta="Precio de venta"
                valorTexto={precioTexto}
                alCambiar={setPrecioTexto}
                error={errores.precio}
              />

              <CampoFormulario etiqueta="Stock mínimo" error={errores.stockMinimo}>
                <Input
                  type="number"
                  min={0}
                  value={stockMinimo}
                  onChange={(e) => setStockMinimo(e.target.value)}
                />
              </CampoFormulario>
            </Grilla>

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
        titulo={producto.activo ? "Dar de baja el producto" : "Reactivar producto"}
        descripcion={
          producto.activo
            ? `El producto "${producto.descripcion}" quedará inactivo y dejará de ofrecerse en nuevas ventas, conservando su historial.`
            : `El producto "${producto.descripcion}" volverá a ofrecerse en el catálogo de ventas.`
        }
        textoConfirmar={producto.activo ? "Dar de baja" : "Reactivar"}
        variante={producto.activo ? "destructive" : "default"}
        alConfirmar={cambiarEstadoActivo}
      />
    </Alinear>
  );
}
