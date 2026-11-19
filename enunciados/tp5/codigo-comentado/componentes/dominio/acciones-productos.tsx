// ============================================================================
// ARCHIVO COMENTADO LÍNEA POR LÍNEA PARA ESTUDIO Y DEFENSA DEL SEGUNDO PARCIAL
// ============================================================================
// [Línea 1] Directiva de Next.js: marca este archivo como Client Component (se ejecuta en el navegador con estado e interactividad).
"use client";
// Modales de alta y edición de productos, baja lógica e ingresos/egresos de stock (RF-P2, RF-P3, RF-P4, RF-P5).
// [Línea 3] Importa elementos desde 'react'.
import { useState } from "react";
// [Línea 4] Importa elementos desde 'lucide-react'.
import { Plus, Pencil, ArrowUpCircle, ArrowDownCircle, Power } from "lucide-react";
// [Línea 5] Importa elementos desde 'sonner'.
import { toast } from "sonner";
// [Línea 6] Inicia un bloque de importación de dependencias.
import {
  // [Línea 7] Importa 'accionCrearProducto' desde el módulo.
  accionCrearProducto,
  // [Línea 8] Importa 'accionEditarProducto' desde el módulo.
  accionEditarProducto,
  // [Línea 9] Importa 'accionRegistrarMovimientoStock' desde el módulo.
  accionRegistrarMovimientoStock,
// [Línea 10] Cierra la lista de importaciones provenientes del módulo '@/acciones/comercial'.
} from "@/acciones/comercial";
// [Línea 11] Inicia un bloque de importación de dependencias.
import {
  // [Línea 12] Importa 'esquemaMovimientoStock' desde el módulo.
  esquemaMovimientoStock,
  // [Línea 13] Importa 'esquemaProductoEdicion' desde el módulo.
  esquemaProductoEdicion,
  // [Línea 14] Importa 'esquemaProductoNuevo' desde el módulo.
  esquemaProductoNuevo,
  // [Línea 15] Importa 'MOTIVOS_EGRESO' desde el módulo.
  MOTIVOS_EGRESO,
  // [Línea 16] Importa 'MOTIVOS_INGRESO' desde el módulo.
  MOTIVOS_INGRESO,
// [Línea 17] Cierra la lista de importaciones provenientes del módulo '@/esquemas/productos'.
} from "@/esquemas/productos";
// [Línea 18] Importa elementos desde '@/hooks/usar-formulario'.
import { usarFormulario } from "@/hooks/usar-formulario";
// [Línea 19] Importa elementos desde '@/lib/formato'.
import { centavosATextoPesos, pesosACentavos } from "@/lib/formato";
// [Línea 20] Importa elementos desde '@/componentes/ui/button'.
import { Button } from "@/componentes/ui/button";
// [Línea 21] Importa elementos desde '@/componentes/ui/input'.
import { Input } from "@/componentes/ui/input";
// [Línea 22] Importa elementos desde '@/componentes/ui/select'.
import { Select, Textarea } from "@/componentes/ui/select";
// [Línea 23] Inicia un bloque de importación de dependencias.
import {
  // [Línea 24] Importa 'Dialog' desde el módulo.
  Dialog,
  // [Línea 25] Importa 'DialogContent' desde el módulo.
  DialogContent,
  // [Línea 26] Importa 'DialogDescription' desde el módulo.
  DialogDescription,
  // [Línea 27] Importa 'DialogFooter' desde el módulo.
  DialogFooter,
  // [Línea 28] Importa 'DialogHeader' desde el módulo.
  DialogHeader,
  // [Línea 29] Importa 'DialogTitle' desde el módulo.
  DialogTitle,
// [Línea 30] Cierra la lista de importaciones provenientes del módulo '@/componentes/ui/dialog'.
} from "@/componentes/ui/dialog";
// [Línea 31] Importa elementos desde '@/componentes/comunes/campo-formulario'.
import { CampoFormulario, CampoImporte } from "@/componentes/comunes/campo-formulario";
// [Línea 32] Importa elementos desde '@/componentes/comunes/confirmar-accion'.
import { ModalConfirmacion } from "@/componentes/comunes/confirmar-accion";
// [Línea 33] Importa elementos desde '@/componentes/primitivas/maquetacion'.
import { Alinear, Grilla } from "@/componentes/primitivas/maquetacion";
// [Línea 34] Importa tipos de TypeScript (solo para chequeo al compilar): import type { ProductoPublico } from "@/servicios/productos";
import type { ProductoPublico } from "@/servicios/productos";

// [Línea 36] Define el tipo de datos 'CategoriaOpcion' en TypeScript.
type CategoriaOpcion = { id: number; nombre: string };

// ---------- Alta de nuevo producto ----------
// [Línea 39] Declara la función o componente 'BotonNuevoProducto'.
export function BotonNuevoProducto({ categorias }: { categorias: CategoriaOpcion[] }) {
  // [Línea 40] Estado reactivo de React [abierto, setAbierto]: guarda el valor actual y la función para actualizarlo.
  const [abierto, setAbierto] = useState(false);
  // [Línea 41] Estado reactivo de React [codigoProducto, setCodigoProducto]: guarda el valor actual y la función para actualizarlo.
  const [codigoProducto, setCodigoProducto] = useState("");
  // [Línea 42] Estado reactivo de React [descripcionProducto, setDescripcionProducto]: guarda el valor actual y la función para actualizarlo.
  const [descripcionProducto, setDescripcionProducto] = useState("");
  // [Línea 43] Estado reactivo de React [categoriaId, setCategoriaId]: guarda el valor actual y la función para actualizarlo.
  const [categoriaId, setCategoriaId] = useState(String(categorias[0]?.id ?? ""));
  // [Línea 44] Estado reactivo de React [precioTexto, setPrecioTexto]: guarda el valor actual y la función para actualizarlo.
  const [precioTexto, setPrecioTexto] = useState("");
  // [Línea 45] Estado reactivo de React [stockMinimo, setStockMinimo]: guarda el valor actual y la función para actualizarlo.
  const [stockMinimo, setStockMinimo] = useState("5");
  // [Línea 46] Estado reactivo de React [stockInicial, setStockInicial]: guarda el valor actual y la función para actualizarlo.
  const [stockInicial, setStockInicial] = useState("0");

  // [Línea 48] Declara '{ errores, enviando, enviar, limpiarErrores }' y le asigna el valor resultante.
  const { errores, enviando, enviar, limpiarErrores } = usarFormulario({
    // [Línea 49] Define o asigna el campo/parámetro 'esquema'.
    esquema: esquemaProductoNuevo,
    // [Línea 50] Define o asigna el campo/parámetro 'accion'.
    accion: (datos) => accionCrearProducto(datos),
    // [Línea 51] Define o asigna el campo/parámetro 'mensajeExito'.
    mensajeExito: "Producto agregado al catálogo",
    // [Línea 52] Define o asigna el campo/parámetro 'alTerminar'.
    alTerminar: () => setAbierto(false),
  // [Línea 53] Cierra el bloque o estructura (});).
  });

  // [Línea 55] Declara la función o componente 'abrirModal'.
  function abrirModal() {
    // [Línea 56] Ejecuta o evalúa: limpiarErrores();
    limpiarErrores();
    // [Línea 57] Ejecuta o evalúa: setCodigoProducto("");
    setCodigoProducto("");
    // [Línea 58] Ejecuta o evalúa: setDescripcionProducto("");
    setDescripcionProducto("");
    // [Línea 59] Ejecuta o evalúa: setCategoriaId(String(categorias[0]?.id ?? ""));
    setCategoriaId(String(categorias[0]?.id ?? ""));
    // [Línea 60] Ejecuta o evalúa: setPrecioTexto("");
    setPrecioTexto("");
    // [Línea 61] Ejecuta o evalúa: setStockMinimo("5");
    setStockMinimo("5");
    // [Línea 62] Ejecuta o evalúa: setStockInicial("0");
    setStockInicial("0");
    // [Línea 63] Ejecuta o evalúa: setAbierto(true);
    setAbierto(true);
  // [Línea 64] Cierra el bloque o estructura (}).
  }

  // [Línea 66] Declara la función o componente 'manejarSubmit'.
  function manejarSubmit(e: React.FormEvent) {
    // [Línea 67] Ejecuta o evalúa: e.preventDefault();
    e.preventDefault();
    // [Línea 68] Ejecuta o evalúa: enviar({
    enviar({
      // [Línea 69] Define o asigna el campo/parámetro 'codigo'.
      codigo: codigoProducto,
      // [Línea 70] Define o asigna el campo/parámetro 'descripcion'.
      descripcion: descripcionProducto,
      // [Línea 71] Define o asigna el campo/parámetro 'categoriaId'.
      categoriaId: Number(categoriaId),
      // [Línea 72] Define o asigna el campo/parámetro 'precio'.
      precio: pesosACentavos(precioTexto) ?? -1,
      // [Línea 73] Define o asigna el campo/parámetro 'stockMinimo'.
      stockMinimo: Number(stockMinimo),
      // [Línea 74] Define o asigna el campo/parámetro 'stockInicial'.
      stockInicial: Number(stockInicial || 0),
    // [Línea 75] Cierra el bloque o estructura (});).
    });
  // [Línea 76] Cierra el bloque o estructura (}).
  }

  // [Línea 78] Devuelve la interfaz JSX que renderiza este componente.
  return (
    <> // [Línea 79] Abre o renderiza el componente visual <elemento>.
      <Button onClick={abrirModal}> // [Línea 80] Abre o renderiza el componente visual <Button>.
        <Plus className="size-4" /> // [Línea 81] Abre o renderiza el componente visual <Plus>.
        // [Línea 82] Ejecuta o evalúa: Nuevo producto
        Nuevo producto
      </Button> // [Línea 83] Cierra el componente visual </Button>.

      <Dialog open={abierto} onOpenChange={setAbierto}> // [Línea 85] Abre o renderiza el componente visual <Dialog>.
        <DialogContent> // [Línea 86] Abre o renderiza el componente visual <DialogContent>.
          <DialogHeader> // [Línea 87] Abre o renderiza el componente visual <DialogHeader>.
            <DialogTitle>Nuevo producto</DialogTitle> // [Línea 88] Abre o renderiza el componente visual <DialogTitle>.
            <DialogDescription> // [Línea 89] Abre o renderiza el componente visual <DialogDescription>.
              // [Línea 90] Ejecuta o evalúa: El stock inicial se registrará automáticamente como un movimiento de ingreso.
              El stock inicial se registrará automáticamente como un movimiento de ingreso.
            </DialogDescription> // [Línea 91] Cierra el componente visual </DialogDescription>.
          </DialogHeader> // [Línea 92] Cierra el componente visual </DialogHeader>.
          <form onSubmit={manejarSubmit} className="flex flex-col gap-4"> // [Línea 93] Abre o renderiza el componente visual <form>.
            <Grilla className="grid-cols-1 sm:grid-cols-2"> // [Línea 94] Abre o renderiza el componente visual <Grilla>.
              <CampoFormulario etiqueta="Código único" error={errores.codigo}> // [Línea 95] Abre o renderiza el componente visual <CampoFormulario>.
                <Input // [Línea 96] Abre o renderiza el componente visual <Input>.
                  // [Línea 97] Ejecuta o evalúa: value={codigoProducto}
                  value={codigoProducto}
                  // [Línea 98] Ejecuta o evalúa: onChange={(e) => setCodigoProducto(e.target.value.toUpperCase())}
                  onChange={(e) => setCodigoProducto(e.target.value.toUpperCase())}
                  // [Línea 99] Ejecuta o evalúa: placeholder="Ej. HE-010"
                  placeholder="Ej. HE-010"
                  // [Línea 100] Ejecuta o evalúa: autoFocus
                  autoFocus
                // [Línea 101] Ejecuta o evalúa: />
                />
              </CampoFormulario> // [Línea 102] Cierra el componente visual </CampoFormulario>.

              <CampoFormulario etiqueta="Categoría" error={errores.categoriaId}> // [Línea 104] Abre o renderiza el componente visual <CampoFormulario>.
                <Select value={categoriaId} onChange={(e) => setCategoriaId(e.target.value)}> // [Línea 105] Abre o renderiza el componente visual <Select>.
                  <option value="">Seleccionar...</option> // [Línea 106] Abre o renderiza el componente visual <option>.
                  // [Línea 107] Ejecuta o evalúa: {categorias.map((cat) => (
                  {categorias.map((cat) => (
                    <option key={cat.id} value={cat.id}> // [Línea 108] Abre o renderiza el componente visual <option>.
                      // [Línea 109] Ejecuta o evalúa: {cat.nombre}
                      {cat.nombre}
                    </option> // [Línea 110] Cierra el componente visual </option>.
                  // [Línea 111] Ejecuta o evalúa: ))}
                  ))}
                </Select> // [Línea 112] Cierra el componente visual </Select>.
              </CampoFormulario> // [Línea 113] Cierra el componente visual </CampoFormulario>.
            </Grilla> // [Línea 114] Cierra el componente visual </Grilla>.

            <CampoFormulario etiqueta="Descripción" error={errores.descripcion}> // [Línea 116] Abre o renderiza el componente visual <CampoFormulario>.
              <Input // [Línea 117] Abre o renderiza el componente visual <Input>.
                // [Línea 118] Ejecuta o evalúa: value={descripcionProducto}
                value={descripcionProducto}
                // [Línea 119] Ejecuta o evalúa: onChange={(e) => setDescripcionProducto(e.target.value)}
                onChange={(e) => setDescripcionProducto(e.target.value)}
                // [Línea 120] Ejecuta o evalúa: placeholder="Ej. Taladro percutor 750 W"
                placeholder="Ej. Taladro percutor 750 W"
              // [Línea 121] Ejecuta o evalúa: />
              />
            </CampoFormulario> // [Línea 122] Cierra el componente visual </CampoFormulario>.

            <Grilla className="grid-cols-1 sm:grid-cols-3"> // [Línea 124] Abre o renderiza el componente visual <Grilla>.
              <CampoImporte // [Línea 125] Abre o renderiza el componente visual <CampoImporte>.
                // [Línea 126] Ejecuta o evalúa: etiqueta="Precio de venta"
                etiqueta="Precio de venta"
                // [Línea 127] Ejecuta o evalúa: valorTexto={precioTexto}
                valorTexto={precioTexto}
                // [Línea 128] Ejecuta o evalúa: alCambiar={setPrecioTexto}
                alCambiar={setPrecioTexto}
                // [Línea 129] Ejecuta o evalúa: error={errores.precio}
                error={errores.precio}
              // [Línea 130] Ejecuta o evalúa: />
              />

              <CampoFormulario etiqueta="Stock mínimo" error={errores.stockMinimo}> // [Línea 132] Abre o renderiza el componente visual <CampoFormulario>.
                <Input // [Línea 133] Abre o renderiza el componente visual <Input>.
                  // [Línea 134] Ejecuta o evalúa: type="number"
                  type="number"
                  // [Línea 135] Ejecuta o evalúa: min={0}
                  min={0}
                  // [Línea 136] Ejecuta o evalúa: value={stockMinimo}
                  value={stockMinimo}
                  // [Línea 137] Ejecuta o evalúa: onChange={(e) => setStockMinimo(e.target.value)}
                  onChange={(e) => setStockMinimo(e.target.value)}
                // [Línea 138] Ejecuta o evalúa: />
                />
              </CampoFormulario> // [Línea 139] Cierra el componente visual </CampoFormulario>.

              <CampoFormulario // [Línea 141] Abre o renderiza el componente visual <CampoFormulario>.
                // [Línea 142] Ejecuta o evalúa: etiqueta="Stock inicial"
                etiqueta="Stock inicial"
                // [Línea 143] Ejecuta o evalúa: error={errores.stockInicial}
                error={errores.stockInicial}
                // [Línea 144] Ejecuta o evalúa: ayuda="Genera ingreso inicial"
                ayuda="Genera ingreso inicial"
              // [Línea 145] Ejecuta o evalúa: >
              >
                <Input // [Línea 146] Abre o renderiza el componente visual <Input>.
                  // [Línea 147] Ejecuta o evalúa: type="number"
                  type="number"
                  // [Línea 148] Ejecuta o evalúa: min={0}
                  min={0}
                  // [Línea 149] Ejecuta o evalúa: value={stockInicial}
                  value={stockInicial}
                  // [Línea 150] Ejecuta o evalúa: onChange={(e) => setStockInicial(e.target.value)}
                  onChange={(e) => setStockInicial(e.target.value)}
                // [Línea 151] Ejecuta o evalúa: />
                />
              </CampoFormulario> // [Línea 152] Cierra el componente visual </CampoFormulario>.
            </Grilla> // [Línea 153] Cierra el componente visual </Grilla>.

            <DialogFooter> // [Línea 155] Abre o renderiza el componente visual <DialogFooter>.
              <Button variant="outline" onClick={() => setAbierto(false)}> // [Línea 156] Abre o renderiza el componente visual <Button>.
                // [Línea 157] Ejecuta o evalúa: Cancelar
                Cancelar
              </Button> // [Línea 158] Cierra el componente visual </Button>.
              <Button type="submit" disabled={enviando}> // [Línea 159] Abre o renderiza el componente visual <Button>.
                // [Línea 160] Ejecuta o evalúa: {enviando ? "Guardando..." : "Crear producto"}
                {enviando ? "Guardando..." : "Crear producto"}
              </Button> // [Línea 161] Cierra el componente visual </Button>.
            </DialogFooter> // [Línea 162] Cierra el componente visual </DialogFooter>.
          </form> // [Línea 163] Cierra el componente visual </form>.
        </DialogContent> // [Línea 164] Cierra el componente visual </DialogContent>.
      </Dialog> // [Línea 165] Cierra el componente visual </Dialog>.
    </> // [Línea 166] Cierra el componente visual </elemento>.
  // [Línea 167] Cierra el bloque o estructura ();).
  );
// [Línea 168] Cierra el bloque o estructura (}).
}

// ---------- Ingreso o Egreso manual de stock (RF-P4 y RF-P5) ----------
// [Línea 171] Declara la función o componente 'BotonesMovimientoStock'.
export function BotonesMovimientoStock({
  // [Línea 172] Ejecuta o evalúa: producto,
  producto,
// [Línea 173] Ejecuta o evalúa: }: {
}: {
  // [Línea 174] Define o asigna el campo/parámetro 'producto'.
  producto: { id: number; codigo: string; descripcion: string; existencia: number };
// [Línea 175] Ejecuta o evalúa: }) {
}) {
  // [Línea 176] Estado reactivo de React [tipoAbierto, setTipoAbierto]: guarda el valor actual y la función para actualizarlo.
  const [tipoAbierto, setTipoAbierto] = useState<"ingreso" | "egreso" | null>(null);
  // [Línea 177] Estado reactivo de React [cantidadMovimiento, setCantidadMovimiento]: guarda el valor actual y la función para actualizarlo.
  const [cantidadMovimiento, setCantidadMovimiento] = useState("1");
  // [Línea 178] Estado reactivo de React [motivoMovimiento, setMotivoMovimiento]: guarda el valor actual y la función para actualizarlo.
  const [motivoMovimiento, setMotivoMovimiento] = useState("");
  // [Línea 179] Estado reactivo de React [observacionMovimiento, setObservacionMovimiento]: guarda el valor actual y la función para actualizarlo.
  const [observacionMovimiento, setObservacionMovimiento] = useState("");

  // [Línea 181] Declara '{ errores, enviando, enviar, limpiarErrores }' y le asigna el valor resultante.
  const { errores, enviando, enviar, limpiarErrores } = usarFormulario({
    // [Línea 182] Define o asigna el campo/parámetro 'esquema'.
    esquema: esquemaMovimientoStock,
    // [Línea 183] Define o asigna el campo/parámetro 'accion'.
    accion: (datos) => accionRegistrarMovimientoStock(producto.id, datos),
    // [Línea 184] Define o asigna el campo/parámetro 'mensajeExito'.
    mensajeExito: "Movimiento de stock registrado",
    // [Línea 185] Define o asigna el campo/parámetro 'alTerminar'.
    alTerminar: () => setTipoAbierto(null),
  // [Línea 186] Cierra el bloque o estructura (});).
  });

  // [Línea 188] Declara la función o componente 'abrir'.
  function abrir(tipo: "ingreso" | "egreso") {
    // [Línea 189] Ejecuta o evalúa: limpiarErrores();
    limpiarErrores();
    // [Línea 190] Ejecuta o evalúa: setCantidadMovimiento("1");
    setCantidadMovimiento("1");
    // [Línea 191] Ejecuta o evalúa: setMotivoMovimiento(tipo === "ingreso" ? MOTIVOS_INGRESO[0] : MOTIVOS_EGRESO[0])
    setMotivoMovimiento(tipo === "ingreso" ? MOTIVOS_INGRESO[0] : MOTIVOS_EGRESO[0]);
    // [Línea 192] Ejecuta o evalúa: setObservacionMovimiento("");
    setObservacionMovimiento("");
    // [Línea 193] Ejecuta o evalúa: setTipoAbierto(tipo);
    setTipoAbierto(tipo);
  // [Línea 194] Cierra el bloque o estructura (}).
  }

  // [Línea 196] Declara la función o componente 'manejarSubmit'.
  function manejarSubmit(e: React.FormEvent) {
    // [Línea 197] Ejecuta o evalúa: e.preventDefault();
    e.preventDefault();
    // [Línea 198] Verifica la condición: if (!tipoAbierto) return;
    if (!tipoAbierto) return;
    // [Línea 199] Ejecuta o evalúa: enviar({
    enviar({
      // [Línea 200] Define o asigna el campo/parámetro 'tipo'.
      tipo: tipoAbierto,
      // [Línea 201] Define o asigna el campo/parámetro 'cantidad'.
      cantidad: Number(cantidadMovimiento),
      // [Línea 202] Define o asigna el campo/parámetro 'motivo'.
      motivo: motivoMovimiento,
      // [Línea 203] Define o asigna el campo/parámetro 'observacion'.
      observacion: observacionMovimiento || undefined,
    // [Línea 204] Cierra el bloque o estructura (});).
    });
  // [Línea 205] Cierra el bloque o estructura (}).
  }

  // [Línea 207] Declara 'listaMotivos' y le asigna el valor resultante.
  const listaMotivos = tipoAbierto === "ingreso" ? MOTIVOS_INGRESO : MOTIVOS_EGRESO;

  // [Línea 209] Devuelve la interfaz JSX que renderiza este componente.
  return (
    <> // [Línea 210] Abre o renderiza el componente visual <elemento>.
      <Button variant="outline" size="xs" onClick={() => abrir("ingreso")}> // [Línea 211] Abre o renderiza el componente visual <Button>.
        <ArrowUpCircle className="size-3.5 text-emerald-700" /> // [Línea 212] Abre o renderiza el componente visual <ArrowUpCircle>.
        // [Línea 213] Ejecuta o evalúa: Ingreso
        Ingreso
      </Button> // [Línea 214] Cierra el componente visual </Button>.
      <Button variant="outline" size="xs" onClick={() => abrir("egreso")}> // [Línea 215] Abre o renderiza el componente visual <Button>.
        <ArrowDownCircle className="size-3.5 text-amber-700" /> // [Línea 216] Abre o renderiza el componente visual <ArrowDownCircle>.
        // [Línea 217] Ejecuta o evalúa: Egreso
        Egreso
      </Button> // [Línea 218] Cierra el componente visual </Button>.

      <Dialog open={tipoAbierto !== null} onOpenChange={(o) => !o && setTipoAbierto(null)}> // [Línea 220] Abre o renderiza el componente visual <Dialog>.
        <DialogContent> // [Línea 221] Abre o renderiza el componente visual <DialogContent>.
          <DialogHeader> // [Línea 222] Abre o renderiza el componente visual <DialogHeader>.
            <DialogTitle> // [Línea 223] Abre o renderiza el componente visual <DialogTitle>.
              // [Línea 224] Ejecuta o evalúa: {tipoAbierto === "ingreso" ? "Ingreso manual de stock" : "Egreso manual de stock
              {tipoAbierto === "ingreso" ? "Ingreso manual de stock" : "Egreso manual de stock"}
            </DialogTitle> // [Línea 225] Cierra el componente visual </DialogTitle>.
            <DialogDescription> // [Línea 226] Abre o renderiza el componente visual <DialogDescription>.
              // [Línea 227] Ejecuta o evalúa: {producto.codigo} · {producto.descripcion} (Existencia actual: {producto.existen
              {producto.codigo} · {producto.descripcion} (Existencia actual: {producto.existencia})
            </DialogDescription> // [Línea 228] Cierra el componente visual </DialogDescription>.
          </DialogHeader> // [Línea 229] Cierra el componente visual </DialogHeader>.

          <form onSubmit={manejarSubmit} className="flex flex-col gap-4"> // [Línea 231] Abre o renderiza el componente visual <form>.
            <Grilla className="grid-cols-1 sm:grid-cols-2"> // [Línea 232] Abre o renderiza el componente visual <Grilla>.
              <CampoFormulario etiqueta="Cantidad de unidades" error={errores.cantidad}> // [Línea 233] Abre o renderiza el componente visual <CampoFormulario>.
                <Input // [Línea 234] Abre o renderiza el componente visual <Input>.
                  // [Línea 235] Ejecuta o evalúa: type="number"
                  type="number"
                  // [Línea 236] Ejecuta o evalúa: min={1}
                  min={1}
                  // [Línea 237] Ejecuta o evalúa: max={tipoAbierto === "egreso" ? Math.max(1, producto.existencia) : undefined}
                  max={tipoAbierto === "egreso" ? Math.max(1, producto.existencia) : undefined}
                  // [Línea 238] Ejecuta o evalúa: value={cantidadMovimiento}
                  value={cantidadMovimiento}
                  // [Línea 239] Ejecuta o evalúa: onChange={(e) => setCantidadMovimiento(e.target.value)}
                  onChange={(e) => setCantidadMovimiento(e.target.value)}
                  // [Línea 240] Ejecuta o evalúa: autoFocus
                  autoFocus
                // [Línea 241] Ejecuta o evalúa: />
                />
              </CampoFormulario> // [Línea 242] Cierra el componente visual </CampoFormulario>.

              <CampoFormulario etiqueta="Motivo obligatorio" error={errores.motivo}> // [Línea 244] Abre o renderiza el componente visual <CampoFormulario>.
                <Select // [Línea 245] Abre o renderiza el componente visual <Select>.
                  // [Línea 246] Ejecuta o evalúa: value={motivoMovimiento}
                  value={motivoMovimiento}
                  // [Línea 247] Ejecuta o evalúa: onChange={(e) => setMotivoMovimiento(e.target.value)}
                  onChange={(e) => setMotivoMovimiento(e.target.value)}
                // [Línea 248] Ejecuta o evalúa: >
                >
                  // [Línea 249] Ejecuta o evalúa: {listaMotivos.map((mot) => (
                  {listaMotivos.map((mot) => (
                    <option key={mot} value={mot}> // [Línea 250] Abre o renderiza el componente visual <option>.
                      // [Línea 251] Ejecuta o evalúa: {mot}
                      {mot}
                    </option> // [Línea 252] Cierra el componente visual </option>.
                  // [Línea 253] Ejecuta o evalúa: ))}
                  ))}
                </Select> // [Línea 254] Cierra el componente visual </Select>.
              </CampoFormulario> // [Línea 255] Cierra el componente visual </CampoFormulario>.
            </Grilla> // [Línea 256] Cierra el componente visual </Grilla>.

            <CampoFormulario etiqueta="Observación (opcional)" error={errores.observacion}> // [Línea 258] Abre o renderiza el componente visual <CampoFormulario>.
              <Textarea // [Línea 259] Abre o renderiza el componente visual <Textarea>.
                // [Línea 260] Ejecuta o evalúa: value={observacionMovimiento}
                value={observacionMovimiento}
                // [Línea 261] Ejecuta o evalúa: onChange={(e) => setObservacionMovimiento(e.target.value)}
                onChange={(e) => setObservacionMovimiento(e.target.value)}
                // [Línea 262] Ejecuta o evalúa: placeholder="Detalle adicional del movimiento..."
                placeholder="Detalle adicional del movimiento..."
              // [Línea 263] Ejecuta o evalúa: />
              />
            </CampoFormulario> // [Línea 264] Cierra el componente visual </CampoFormulario>.

            <DialogFooter> // [Línea 266] Abre o renderiza el componente visual <DialogFooter>.
              <Button variant="outline" onClick={() => setTipoAbierto(null)}> // [Línea 267] Abre o renderiza el componente visual <Button>.
                // [Línea 268] Ejecuta o evalúa: Cancelar
                Cancelar
              </Button> // [Línea 269] Cierra el componente visual </Button>.
              <Button // [Línea 270] Abre o renderiza el componente visual <Button>.
                // [Línea 271] Ejecuta o evalúa: type="submit"
                type="submit"
                // [Línea 272] Ejecuta o evalúa: variant={tipoAbierto === "egreso" ? "destructive" : "default"}
                variant={tipoAbierto === "egreso" ? "destructive" : "default"}
                // [Línea 273] Ejecuta o evalúa: disabled={enviando}
                disabled={enviando}
              // [Línea 274] Ejecuta o evalúa: >
              >
                // [Línea 275] Ejecuta o evalúa: {enviando
                {enviando
                  // [Línea 276] Ejecuta o evalúa: ? "Registrando..."
                  ? "Registrando..."
                  // [Línea 277] Ejecuta o evalúa: : tipoAbierto === "ingreso"
                  : tipoAbierto === "ingreso"
                    // [Línea 278] Ejecuta o evalúa: ? "Confirmar ingreso"
                    ? "Confirmar ingreso"
                    // [Línea 279] Ejecuta o evalúa: : "Confirmar egreso"}
                    : "Confirmar egreso"}
              </Button> // [Línea 280] Cierra el componente visual </Button>.
            </DialogFooter> // [Línea 281] Cierra el componente visual </DialogFooter>.
          </form> // [Línea 282] Cierra el componente visual </form>.
        </DialogContent> // [Línea 283] Cierra el componente visual </DialogContent>.
      </Dialog> // [Línea 284] Cierra el componente visual </Dialog>.
    </> // [Línea 285] Cierra el componente visual </elemento>.
  // [Línea 286] Cierra el bloque o estructura ();).
  );
// [Línea 287] Cierra el bloque o estructura (}).
}

// ---------- Edición y Baja lógica del producto ----------
// [Línea 290] Declara la función o componente 'BotonesEditarProducto'.
export function BotonesEditarProducto({
  // [Línea 291] Ejecuta o evalúa: producto,
  producto,
  // [Línea 292] Ejecuta o evalúa: categorias,
  categorias,
// [Línea 293] Ejecuta o evalúa: }: {
}: {
  // [Línea 294] Define o asigna el campo/parámetro 'producto'.
  producto: ProductoPublico;
  // [Línea 295] Define o asigna el campo/parámetro 'categorias'.
  categorias: CategoriaOpcion[];
// [Línea 296] Ejecuta o evalúa: }) {
}) {
  // [Línea 297] Estado reactivo de React [modalEditar, setModalEditar]: guarda el valor actual y la función para actualizarlo.
  const [modalEditar, setModalEditar] = useState(false);
  // [Línea 298] Estado reactivo de React [modalBaja, setModalBaja]: guarda el valor actual y la función para actualizarlo.
  const [modalBaja, setModalBaja] = useState(false);

  // [Línea 300] Estado reactivo de React [codigoProducto, setCodigoProducto]: guarda el valor actual y la función para actualizarlo.
  const [codigoProducto, setCodigoProducto] = useState(producto.codigo);
  // [Línea 301] Estado reactivo de React [descripcionProducto, setDescripcionProducto]: guarda el valor actual y la función para actualizarlo.
  const [descripcionProducto, setDescripcionProducto] = useState(producto.descripcion);
  // [Línea 302] Estado reactivo de React [categoriaId, setCategoriaId]: guarda el valor actual y la función para actualizarlo.
  const [categoriaId, setCategoriaId] = useState(String(producto.categoria.id));
  // [Línea 303] Estado reactivo de React [precioTexto, setPrecioTexto]: guarda el valor actual y la función para actualizarlo.
  const [precioTexto, setPrecioTexto] = useState(centavosATextoPesos(producto.precio));
  // [Línea 304] Estado reactivo de React [stockMinimo, setStockMinimo]: guarda el valor actual y la función para actualizarlo.
  const [stockMinimo, setStockMinimo] = useState(String(producto.stockMinimo));

  // [Línea 306] Declara '{ errores, enviando, enviar, limpiarErrores }' y le asigna el valor resultante.
  const { errores, enviando, enviar, limpiarErrores } = usarFormulario({
    // [Línea 307] Define o asigna el campo/parámetro 'esquema'.
    esquema: esquemaProductoEdicion,
    // [Línea 308] Define o asigna el campo/parámetro 'accion'.
    accion: (datos) => accionEditarProducto(producto.id, datos),
    // [Línea 309] Define o asigna el campo/parámetro 'mensajeExito'.
    mensajeExito: "Producto actualizado",
    // [Línea 310] Define o asigna el campo/parámetro 'alTerminar'.
    alTerminar: () => setModalEditar(false),
  // [Línea 311] Cierra el bloque o estructura (});).
  });

  // [Línea 313] Declara la función o componente 'abrirEdicion'.
  function abrirEdicion() {
    // [Línea 314] Ejecuta o evalúa: limpiarErrores();
    limpiarErrores();
    // [Línea 315] Ejecuta o evalúa: setCodigoProducto(producto.codigo);
    setCodigoProducto(producto.codigo);
    // [Línea 316] Ejecuta o evalúa: setDescripcionProducto(producto.descripcion);
    setDescripcionProducto(producto.descripcion);
    // [Línea 317] Ejecuta o evalúa: setCategoriaId(String(producto.categoria.id));
    setCategoriaId(String(producto.categoria.id));
    // [Línea 318] Ejecuta o evalúa: setPrecioTexto(centavosATextoPesos(producto.precio));
    setPrecioTexto(centavosATextoPesos(producto.precio));
    // [Línea 319] Ejecuta o evalúa: setStockMinimo(String(producto.stockMinimo));
    setStockMinimo(String(producto.stockMinimo));
    // [Línea 320] Ejecuta o evalúa: setModalEditar(true);
    setModalEditar(true);
  // [Línea 321] Cierra el bloque o estructura (}).
  }

  // [Línea 323] Declara la función asíncrona 'cambiarEstadoActivo'.
  async function cambiarEstadoActivo() {
    // [Línea 324] Espera el resultado de la consulta/operación asíncrona y lo asigna a 'res'.
    const res = await accionEditarProducto(producto.id, { activo: !producto.activo });
    // [Línea 325] Verifica la condición: if (!res.ok) {
    if (!res.ok) {
      // [Línea 326] Muestra un aviso emergente en pantalla: toast.error(res.error.message);
      toast.error(res.error.message);
      // [Línea 327] Ejecuta o evalúa: return;
      return;
    // [Línea 328] Cierra el bloque o estructura (}).
    }
    // [Línea 329] Muestra un aviso emergente en pantalla: toast.success(producto.activo ? "Producto dado de baja" : "Producto reactivado");
    toast.success(producto.activo ? "Producto dado de baja" : "Producto reactivado");
  // [Línea 330] Cierra el bloque o estructura (}).
  }

  // [Línea 332] Devuelve la interfaz JSX que renderiza este componente.
  return (
    <Alinear className="gap-1.5"> // [Línea 333] Abre o renderiza el componente visual <Alinear>.
      <Button variant="outline" size="xs" onClick={abrirEdicion}> // [Línea 334] Abre o renderiza el componente visual <Button>.
        <Pencil className="size-3.5" /> // [Línea 335] Abre o renderiza el componente visual <Pencil>.
        // [Línea 336] Ejecuta o evalúa: Editar
        Editar
      </Button> // [Línea 337] Cierra el componente visual </Button>.
      <Button // [Línea 338] Abre o renderiza el componente visual <Button>.
        // [Línea 339] Ejecuta o evalúa: variant={producto.activo ? "ghost" : "secondary"}
        variant={producto.activo ? "ghost" : "secondary"}
        // [Línea 340] Ejecuta o evalúa: size="xs"
        size="xs"
        // [Línea 341] Ejecuta o evalúa: onClick={() => setModalBaja(true)}
        onClick={() => setModalBaja(true)}
      // [Línea 342] Ejecuta o evalúa: >
      >
        <Power className="size-3.5" /> // [Línea 343] Abre o renderiza el componente visual <Power>.
        // [Línea 344] Ejecuta o evalúa: {producto.activo ? "Baja" : "Activar"}
        {producto.activo ? "Baja" : "Activar"}
      </Button> // [Línea 345] Cierra el componente visual </Button>.

      <Dialog open={modalEditar} onOpenChange={setModalEditar}> // [Línea 347] Abre o renderiza el componente visual <Dialog>.
        <DialogContent> // [Línea 348] Abre o renderiza el componente visual <DialogContent>.
          <DialogHeader> // [Línea 349] Abre o renderiza el componente visual <DialogHeader>.
            <DialogTitle>Editar producto</DialogTitle> // [Línea 350] Abre o renderiza el componente visual <DialogTitle>.
            <DialogDescription> // [Línea 351] Abre o renderiza el componente visual <DialogDescription>.
              // [Línea 352] Ejecuta o evalúa: La existencia actual ({producto.existencia}) solo se modifica mediante movimient
              La existencia actual ({producto.existencia}) solo se modifica mediante movimientos de stock.
            </DialogDescription> // [Línea 353] Cierra el componente visual </DialogDescription>.
          </DialogHeader> // [Línea 354] Cierra el componente visual </DialogHeader>.

          <form // [Línea 356] Abre o renderiza el componente visual <form>.
            // [Línea 357] Ejecuta o evalúa: onSubmit={(e) => {
            onSubmit={(e) => {
              // [Línea 358] Ejecuta o evalúa: e.preventDefault();
              e.preventDefault();
              // [Línea 359] Ejecuta o evalúa: enviar({
              enviar({
                // [Línea 360] Define o asigna el campo/parámetro 'codigo'.
                codigo: codigoProducto,
                // [Línea 361] Define o asigna el campo/parámetro 'descripcion'.
                descripcion: descripcionProducto,
                // [Línea 362] Define o asigna el campo/parámetro 'categoriaId'.
                categoriaId: Number(categoriaId),
                // [Línea 363] Define o asigna el campo/parámetro 'precio'.
                precio: pesosACentavos(precioTexto) ?? -1,
                // [Línea 364] Define o asigna el campo/parámetro 'stockMinimo'.
                stockMinimo: Number(stockMinimo),
              // [Línea 365] Cierra el bloque o estructura (});).
              });
            // [Línea 366] Ejecuta o evalúa: }}
            }}
            // [Línea 367] Ejecuta o evalúa: className="flex flex-col gap-4"
            className="flex flex-col gap-4"
          // [Línea 368] Ejecuta o evalúa: >
          >
            <Grilla className="grid-cols-1 sm:grid-cols-2"> // [Línea 369] Abre o renderiza el componente visual <Grilla>.
              <CampoFormulario etiqueta="Código único" error={errores.codigo}> // [Línea 370] Abre o renderiza el componente visual <CampoFormulario>.
                <Input // [Línea 371] Abre o renderiza el componente visual <Input>.
                  // [Línea 372] Ejecuta o evalúa: value={codigoProducto}
                  value={codigoProducto}
                  // [Línea 373] Ejecuta o evalúa: onChange={(e) => setCodigoProducto(e.target.value.toUpperCase())}
                  onChange={(e) => setCodigoProducto(e.target.value.toUpperCase())}
                // [Línea 374] Ejecuta o evalúa: />
                />
              </CampoFormulario> // [Línea 375] Cierra el componente visual </CampoFormulario>.

              <CampoFormulario etiqueta="Categoría" error={errores.categoriaId}> // [Línea 377] Abre o renderiza el componente visual <CampoFormulario>.
                <Select value={categoriaId} onChange={(e) => setCategoriaId(e.target.value)}> // [Línea 378] Abre o renderiza el componente visual <Select>.
                  // [Línea 379] Ejecuta o evalúa: {categorias.map((cat) => (
                  {categorias.map((cat) => (
                    <option key={cat.id} value={cat.id}> // [Línea 380] Abre o renderiza el componente visual <option>.
                      // [Línea 381] Ejecuta o evalúa: {cat.nombre}
                      {cat.nombre}
                    </option> // [Línea 382] Cierra el componente visual </option>.
                  // [Línea 383] Ejecuta o evalúa: ))}
                  ))}
                </Select> // [Línea 384] Cierra el componente visual </Select>.
              </CampoFormulario> // [Línea 385] Cierra el componente visual </CampoFormulario>.
            </Grilla> // [Línea 386] Cierra el componente visual </Grilla>.

            <CampoFormulario etiqueta="Descripción" error={errores.descripcion}> // [Línea 388] Abre o renderiza el componente visual <CampoFormulario>.
              <Input // [Línea 389] Abre o renderiza el componente visual <Input>.
                // [Línea 390] Ejecuta o evalúa: value={descripcionProducto}
                value={descripcionProducto}
                // [Línea 391] Ejecuta o evalúa: onChange={(e) => setDescripcionProducto(e.target.value)}
                onChange={(e) => setDescripcionProducto(e.target.value)}
              // [Línea 392] Ejecuta o evalúa: />
              />
            </CampoFormulario> // [Línea 393] Cierra el componente visual </CampoFormulario>.

            <Grilla className="grid-cols-1 sm:grid-cols-2"> // [Línea 395] Abre o renderiza el componente visual <Grilla>.
              <CampoImporte // [Línea 396] Abre o renderiza el componente visual <CampoImporte>.
                // [Línea 397] Ejecuta o evalúa: etiqueta="Precio de venta"
                etiqueta="Precio de venta"
                // [Línea 398] Ejecuta o evalúa: valorTexto={precioTexto}
                valorTexto={precioTexto}
                // [Línea 399] Ejecuta o evalúa: alCambiar={setPrecioTexto}
                alCambiar={setPrecioTexto}
                // [Línea 400] Ejecuta o evalúa: error={errores.precio}
                error={errores.precio}
              // [Línea 401] Ejecuta o evalúa: />
              />

              <CampoFormulario etiqueta="Stock mínimo" error={errores.stockMinimo}> // [Línea 403] Abre o renderiza el componente visual <CampoFormulario>.
                <Input // [Línea 404] Abre o renderiza el componente visual <Input>.
                  // [Línea 405] Ejecuta o evalúa: type="number"
                  type="number"
                  // [Línea 406] Ejecuta o evalúa: min={0}
                  min={0}
                  // [Línea 407] Ejecuta o evalúa: value={stockMinimo}
                  value={stockMinimo}
                  // [Línea 408] Ejecuta o evalúa: onChange={(e) => setStockMinimo(e.target.value)}
                  onChange={(e) => setStockMinimo(e.target.value)}
                // [Línea 409] Ejecuta o evalúa: />
                />
              </CampoFormulario> // [Línea 410] Cierra el componente visual </CampoFormulario>.
            </Grilla> // [Línea 411] Cierra el componente visual </Grilla>.

            <DialogFooter> // [Línea 413] Abre o renderiza el componente visual <DialogFooter>.
              <Button variant="outline" onClick={() => setModalEditar(false)}> // [Línea 414] Abre o renderiza el componente visual <Button>.
                // [Línea 415] Ejecuta o evalúa: Cancelar
                Cancelar
              </Button> // [Línea 416] Cierra el componente visual </Button>.
              <Button type="submit" disabled={enviando}> // [Línea 417] Abre o renderiza el componente visual <Button>.
                // [Línea 418] Ejecuta o evalúa: {enviando ? "Guardando..." : "Guardar cambios"}
                {enviando ? "Guardando..." : "Guardar cambios"}
              </Button> // [Línea 419] Cierra el componente visual </Button>.
            </DialogFooter> // [Línea 420] Cierra el componente visual </DialogFooter>.
          </form> // [Línea 421] Cierra el componente visual </form>.
        </DialogContent> // [Línea 422] Cierra el componente visual </DialogContent>.
      </Dialog> // [Línea 423] Cierra el componente visual </Dialog>.

      <ModalConfirmacion // [Línea 425] Abre o renderiza el componente visual <ModalConfirmacion>.
        // [Línea 426] Ejecuta o evalúa: abierto={modalBaja}
        abierto={modalBaja}
        // [Línea 427] Ejecuta o evalúa: alCambiarAbierto={setModalBaja}
        alCambiarAbierto={setModalBaja}
        // [Línea 428] Ejecuta o evalúa: titulo={producto.activo ? "Dar de baja el producto" : "Reactivar producto"}
        titulo={producto.activo ? "Dar de baja el producto" : "Reactivar producto"}
        // [Línea 429] Ejecuta o evalúa: descripcion={
        descripcion={
          // [Línea 430] Ejecuta o evalúa: producto.activo
          producto.activo
            // [Línea 431] Ejecuta o evalúa: ? `El producto "${producto.descripcion}" quedará inactivo y dejará de ofrecerse 
            ? `El producto "${producto.descripcion}" quedará inactivo y dejará de ofrecerse en nuevas ventas, conservando su historial.`
            // [Línea 432] Ejecuta o evalúa: : `El producto "${producto.descripcion}" volverá a ofrecerse en el catálogo de v
            : `El producto "${producto.descripcion}" volverá a ofrecerse en el catálogo de ventas.`
        // [Línea 433] Cierra el bloque o estructura (}).
        }
        // [Línea 434] Ejecuta o evalúa: textoConfirmar={producto.activo ? "Dar de baja" : "Reactivar"}
        textoConfirmar={producto.activo ? "Dar de baja" : "Reactivar"}
        // [Línea 435] Ejecuta o evalúa: variante={producto.activo ? "destructive" : "default"}
        variante={producto.activo ? "destructive" : "default"}
        // [Línea 436] Ejecuta o evalúa: alConfirmar={cambiarEstadoActivo}
        alConfirmar={cambiarEstadoActivo}
      // [Línea 437] Ejecuta o evalúa: />
      />
    </Alinear> // [Línea 438] Cierra el componente visual </Alinear>.
  // [Línea 439] Cierra el bloque o estructura ();).
  );
// [Línea 440] Cierra el bloque o estructura (}).
}
