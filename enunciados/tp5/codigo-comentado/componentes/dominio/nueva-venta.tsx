// ============================================================================
// ARCHIVO COMENTADO LÍNEA POR LÍNEA PARA ESTUDIO Y DEFENSA DEL SEGUNDO PARCIAL
// ============================================================================
// [Línea 1] Directiva de Next.js: marca este archivo como Client Component (se ejecuta en el navegador con estado e interactividad).
"use client";
// Pantalla interactiva de NUEVA VENTA en mostrador (RF-V1 a RF-V6).
// - Tres partes en una sola vista: 1) Comprador, 2) Ítems con búsqueda por teclado, 3) Forma de pago.
// - Soporta navegación completa por teclado en el buscador de productos: ↑ y ↓ eligen y Enter agrega.
// - Alta rápida de cliente en ventana modal sin perder la venta en curso.
// - Confirma llamando a POST /api/facturas (el cliente solo envía ids y cantidades; los precios los calcula el servidor).
// [Línea 7] Importa elementos desde 'react'.
import { useState, useRef } from "react";
// [Línea 8] Importa elementos desde 'next/navigation'.
import { useRouter } from "next/navigation";
// [Línea 9] Inicia un bloque de importación de dependencias.
import {
  // [Línea 10] Importa 'Search' desde el módulo.
  Search,
  // [Línea 11] Importa 'UserCheck' desde el módulo.
  UserCheck,
  // [Línea 12] Importa 'UserX' desde el módulo.
  UserX,
  // [Línea 13] Importa 'Trash2' desde el módulo.
  Trash2,
  // [Línea 14] Importa 'Plus' desde el módulo.
  Plus,
  // [Línea 15] Importa 'Minus' desde el módulo.
  Minus,
  // [Línea 16] Importa 'CheckCircle2' desde el módulo.
  CheckCircle2,
  // [Línea 17] Importa 'Banknote' desde el módulo.
  Banknote,
  // [Línea 18] Importa 'CreditCard' desde el módulo.
  CreditCard,
  // [Línea 19] Importa 'BookOpen' desde el módulo.
  BookOpen,
// [Línea 20] Cierra la lista de importaciones provenientes del módulo 'lucide-react'.
} from "lucide-react";
// [Línea 21] Importa elementos desde 'sonner'.
import { toast } from "sonner";
// [Línea 22] Importa elementos desde '@/esquemas/facturas'.
import { MARCAS_TARJETA } from "@/esquemas/facturas";
// [Línea 23] Importa elementos desde '@/lib/formato'.
import { centavosATextoPesos, formatearMoneda, pesosACentavos } from "@/lib/formato";
// [Línea 24] Importa elementos desde '@/componentes/ui/button'.
import { Button } from "@/componentes/ui/button";
// [Línea 25] Importa elementos desde '@/componentes/ui/input'.
import { Input } from "@/componentes/ui/input";
// [Línea 26] Importa elementos desde '@/componentes/ui/select'.
import { Select } from "@/componentes/ui/select";
// [Línea 27] Importa elementos desde '@/componentes/ui/badge'.
import { Badge } from "@/componentes/ui/badge";
// [Línea 28] Importa elementos desde '@/componentes/ui/card'.
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/componentes/ui/card";
// [Línea 29] Inicia un bloque de importación de dependencias.
import {
  // [Línea 30] Importa 'Table' desde el módulo.
  Table,
  // [Línea 31] Importa 'TableBody' desde el módulo.
  TableBody,
  // [Línea 32] Importa 'TableCell' desde el módulo.
  TableCell,
  // [Línea 33] Importa 'TableHead' desde el módulo.
  TableHead,
  // [Línea 34] Importa 'TableHeader' desde el módulo.
  TableHeader,
  // [Línea 35] Importa 'TableRow' desde el módulo.
  TableRow,
// [Línea 36] Cierra la lista de importaciones provenientes del módulo '@/componentes/ui/table'.
} from "@/componentes/ui/table";
// [Línea 37] Importa elementos desde '@/componentes/comunes/campo-formulario'.
import { CampoFormulario, CampoImporte } from "@/componentes/comunes/campo-formulario";
// [Línea 38] Importa elementos desde '@/componentes/dominio/acciones-clientes'.
import { BotonNuevoCliente } from "@/componentes/dominio/acciones-clientes";
// [Línea 39] Importa elementos desde '@/componentes/primitivas/maquetacion'.
import { Alinear, Apilar, Caja, Grilla, Texto } from "@/componentes/primitivas/maquetacion";
// [Línea 40] Importa tipos de TypeScript (solo para chequeo al compilar): import type { ProductoPublico } from "@/servicios/productos";
import type { ProductoPublico } from "@/servicios/productos";
// [Línea 41] Importa tipos de TypeScript (solo para chequeo al compilar): import type { ClientePublico } from "@/servicios/clientes";
import type { ClientePublico } from "@/servicios/clientes";

// [Línea 43] Define el tipo de datos 'RenglonVenta' en TypeScript.
type RenglonVenta = {
  // [Línea 44] Define o asigna el campo/parámetro 'productoId'.
  productoId: number;
  // [Línea 45] Define o asigna el campo/parámetro 'codigo'.
  codigo: string;
  // [Línea 46] Define o asigna el campo/parámetro 'descripcion'.
  descripcion: string;
  // [Línea 47] Define o asigna el campo/parámetro 'precioUnitario'.
  precioUnitario: number;
  // [Línea 48] Define o asigna el campo/parámetro 'existenciaDisponible'.
  existenciaDisponible: number;
  // [Línea 49] Define o asigna el campo/parámetro 'cantidad'.
  cantidad: number;
// [Línea 50] Cierra el bloque o estructura (};).
};

// [Línea 52] Declara la función o componente 'PantallaNuevaVenta'.
export function PantallaNuevaVenta({
  // [Línea 53] Ejecuta o evalúa: productosIniciales,
  productosIniciales,
  // [Línea 54] Ejecuta o evalúa: clientesIniciales,
  clientesIniciales,
  // [Línea 55] Ejecuta o evalúa: proximoNumeroInformativo,
  proximoNumeroInformativo,
// [Línea 56] Ejecuta o evalúa: }: {
}: {
  // [Línea 57] Define o asigna el campo/parámetro 'productosIniciales'.
  productosIniciales: ProductoPublico[];
  // [Línea 58] Define o asigna el campo/parámetro 'clientesIniciales'.
  clientesIniciales: ClientePublico[];
  // [Línea 59] Define o asigna el campo/parámetro 'proximoNumeroInformativo'.
  proximoNumeroInformativo: string;
// [Línea 60] Ejecuta o evalúa: }) {
}) {
  // [Línea 61] Declara 'router' y le asigna el valor resultante.
  const router = useRouter();

  // Catálogo y clientes en memoria (se actualizan si se da de alta un cliente en el momento).
  // [Línea 64] Estado reactivo de React [catalogoProductos]: guarda el valor actual y la función para actualizarlo.
  const [catalogoProductos] = useState<ProductoPublico[]>(productosIniciales);
  // [Línea 65] Estado reactivo de React [listaClientes, setListaClientes]: guarda el valor actual y la función para actualizarlo.
  const [listaClientes, setListaClientes] = useState<ClientePublico[]>(clientesIniciales);

  // 1. Estado del comprador (null = Consumidor final).
  // [Línea 68] Estado reactivo de React [clienteSeleccionado, setClienteSeleccionado]: guarda el valor actual y la función para actualizarlo.
  const [clienteSeleccionado, setClienteSeleccionado] = useState<ClientePublico | null>(null);
  // [Línea 69] Estado reactivo de React [busquedaCliente, setBusquedaCliente]: guarda el valor actual y la función para actualizarlo.
  const [busquedaCliente, setBusquedaCliente] = useState("");

  // 2. Estado de búsqueda de productos y renglones de la compra.
  // [Línea 72] Estado reactivo de React [busquedaProducto, setBusquedaProducto]: guarda el valor actual y la función para actualizarlo.
  const [busquedaProducto, setBusquedaProducto] = useState("");
  // [Línea 73] Estado reactivo de React [cantidadParaAgregar, setCantidadParaAgregar]: guarda el valor actual y la función para actualizarlo.
  const [cantidadParaAgregar, setCantidadParaAgregar] = useState("1");
  // [Línea 74] Estado reactivo de React [indiceSugerencia, setIndiceSugerencia]: guarda el valor actual y la función para actualizarlo.
  const [indiceSugerencia, setIndiceSugerencia] = useState(0);
  // [Línea 75] Estado reactivo de React [renglonesCompra, setRenglonesCompra]: guarda el valor actual y la función para actualizarlo.
  const [renglonesCompra, setRenglonesCompra] = useState<RenglonVenta[]>([]);
  // [Línea 76] Declara 'refInputProducto' y le asigna el valor resultante.
  const refInputProducto = useRef<HTMLInputElement>(null);

  // 3. Estado de la forma de pago.
  // [Línea 79] Estado reactivo de React [formaPago, setFormaPago]: guarda el valor actual y la función para actualizarlo.
  const [formaPago, setFormaPago] = useState<"contado" | "tarjeta" | "cuenta_corriente">("contado");
  // [Línea 80] Estado reactivo de React [montoRecibidoTexto, setMontoRecibidoTexto]: guarda el valor actual y la función para actualizarlo.
  const [montoRecibidoTexto, setMontoRecibidoTexto] = useState("");
  // [Línea 81] Estado reactivo de React [tarjetaTipo, setTarjetaTipo]: guarda el valor actual y la función para actualizarlo.
  const [tarjetaTipo, setTarjetaTipo] = useState<"debito" | "credito">("debito");
  // [Línea 82] Estado reactivo de React [tarjetaMarca, setTarjetaMarca]: guarda el valor actual y la función para actualizarlo.
  const [tarjetaMarca, setTarjetaMarca] = useState<string>(MARCAS_TARJETA[0]);
  // [Línea 83] Estado reactivo de React [tarjetaUltimos4, setTarjetaUltimos4]: guarda el valor actual y la función para actualizarlo.
  const [tarjetaUltimos4, setTarjetaUltimos4] = useState("");

  // [Línea 85] Estado reactivo de React [confirmando, setConfirmando]: guarda el valor actual y la función para actualizarlo.
  const [confirmando, setConfirmando] = useState(false);

  // Total de la factura calculado en vivo en cada cambio (RF-V1).
  // [Línea 88] Declara 'totalCompra' y le asigna el valor resultante.
  const totalCompra = renglonesCompra.reduce(
    // [Línea 89] Ejecuta o evalúa: (acumulado, r) => acumulado + r.precioUnitario * r.cantidad,
    (acumulado, r) => acumulado + r.precioUnitario * r.cantidad,
    // [Línea 90] Ejecuta o evalúa: 0,
    0,
  // [Línea 91] Cierra el bloque o estructura ();).
  );

  // Sugerencias de clientes filtradas por nombre o documento.
  // [Línea 94] Declara 'clientesFiltrados' y le asigna el valor resultante.
  const clientesFiltrados = busquedaCliente.trim()
    // [Línea 95] Ejecuta o evalúa: ? listaClientes
    ? listaClientes
        // [Línea 96] Ejecuta o evalúa: .filter((c) => {
        .filter((c) => {
          // [Línea 97] Declara 'q' y le asigna el valor resultante.
          const q = busquedaCliente.toLowerCase();
          // [Línea 98] Declara 'qDigitos' y le asigna el valor resultante.
          const qDigitos = busquedaCliente.replace(/\D/g, "");
          // [Línea 99] Devuelve la interfaz JSX que renderiza este componente.
          return (
            // [Línea 100] Ejecuta o evalúa: c.nombre.toLowerCase().includes(q) ||
            c.nombre.toLowerCase().includes(q) ||
            // [Línea 101] Ejecuta o evalúa: (qDigitos.length > 0 && c.nroDoc.replace(/\D/g, "").includes(qDigitos))
            (qDigitos.length > 0 && c.nroDoc.replace(/\D/g, "").includes(qDigitos))
          // [Línea 102] Cierra el bloque o estructura ();).
          );
        // [Línea 103] Cierra el bloque o estructura (})).
        })
        // [Línea 104] Ejecuta o evalúa: .slice(0, 6)
        .slice(0, 6)
    // [Línea 105] Ejecuta o evalúa: : [];
    : [];

  // Sugerencias de productos filtradas por código o descripción.
  // [Línea 108] Declara 'productosFiltrados' y le asigna el valor resultante.
  const productosFiltrados = busquedaProducto.trim()
    // [Línea 109] Ejecuta o evalúa: ? catalogoProductos
    ? catalogoProductos
        // [Línea 110] Ejecuta o evalúa: .filter((p) => {
        .filter((p) => {
          // [Línea 111] Declara 'q' y le asigna el valor resultante.
          const q = busquedaProducto.toLowerCase();
          // [Línea 112] Devuelve la interfaz JSX que renderiza este componente.
          return (
            // [Línea 113] Ejecuta o evalúa: p.activo &&
            p.activo &&
            // [Línea 114] Ejecuta o evalúa: (p.codigo.toLowerCase().includes(q) || p.descripcion.toLowerCase().includes(q))
            (p.codigo.toLowerCase().includes(q) || p.descripcion.toLowerCase().includes(q))
          // [Línea 115] Cierra el bloque o estructura ();).
          );
        // [Línea 116] Cierra el bloque o estructura (})).
        })
        // [Línea 117] Ejecuta o evalúa: .slice(0, 8)
        .slice(0, 8)
    // [Línea 118] Ejecuta o evalúa: : [];
    : [];

  // RF-V3 y RF-V4: agrega un producto o suma la cantidad si ya estaba en la venta,
  // verificando no superar la existencia disponible.
  // [Línea 122] Declara la función o componente 'agregarProductoAVenta'.
  function agregarProductoAVenta(producto: ProductoPublico, cantidadDeseada?: number) {
    // [Línea 123] Declara 'unidades' y le asigna el valor resultante.
    const unidades = Math.max(1, Math.floor(cantidadDeseada ?? (Number(cantidadParaAgregar) || 1)));
    // [Línea 124] Verifica la condición: if (producto.existencia <= 0) {
    if (producto.existencia <= 0) {
      // [Línea 125] Muestra un aviso emergente en pantalla: toast.error(`"${producto.descripcion}" no tiene stock disponible.`);
      toast.error(`"${producto.descripcion}" no tiene stock disponible.`);
      // [Línea 126] Ejecuta o evalúa: return;
      return;
    // [Línea 127] Cierra el bloque o estructura (}).
    }

    // [Línea 129] Declara 'renglonExistente' y le asigna el valor resultante.
    const renglonExistente = renglonesCompra.find((r) => r.productoId === producto.id);
    // [Línea 130] Declara 'cantidadFinal' y le asigna el valor resultante.
    const cantidadFinal = (renglonExistente?.cantidad ?? 0) + unidades;

    // [Línea 132] Verifica la condición: if (cantidadFinal > producto.existencia) {
    if (cantidadFinal > producto.existencia) {
      // [Línea 133] Muestra un aviso emergente en pantalla: toast.error(
      toast.error(
        // [Línea 134] Ejecuta o evalúa: `Stock insuficiente de "${producto.descripcion}". Disponible: ${producto.existen
        `Stock insuficiente de "${producto.descripcion}". Disponible: ${producto.existencia} u.`,
      // [Línea 135] Cierra el bloque o estructura ();).
      );
      // [Línea 136] Ejecuta o evalúa: return;
      return;
    // [Línea 137] Cierra el bloque o estructura (}).
    }

    // [Línea 139] Verifica la condición: if (renglonExistente) {
    if (renglonExistente) {
      // [Línea 140] Ejecuta o evalúa: setRenglonesCompra((actuales) =>
      setRenglonesCompra((actuales) =>
        // [Línea 141] Ejecuta o evalúa: actuales.map((r) =>
        actuales.map((r) =>
          // [Línea 142] Ejecuta o evalúa: r.productoId === producto.id ? { ...r, cantidad: cantidadFinal } : r,
          r.productoId === producto.id ? { ...r, cantidad: cantidadFinal } : r,
        // [Línea 143] Cierra el bloque o estructura (),).
        ),
      // [Línea 144] Cierra el bloque o estructura ();).
      );
    // [Línea 145] Rama else: se ejecuta si no se cumplió la condición anterior.
    } else {
      // [Línea 146] Ejecuta o evalúa: setRenglonesCompra((actuales) => [
      setRenglonesCompra((actuales) => [
        // [Línea 147] Ejecuta o evalúa: ...actuales,
        ...actuales,
        // [Línea 148] Ejecuta o evalúa: {
        {
          // [Línea 149] Define o asigna el campo/parámetro 'productoId'.
          productoId: producto.id,
          // [Línea 150] Define o asigna el campo/parámetro 'codigo'.
          codigo: producto.codigo,
          // [Línea 151] Define o asigna el campo/parámetro 'descripcion'.
          descripcion: producto.descripcion,
          // [Línea 152] Define o asigna el campo/parámetro 'precioUnitario'.
          precioUnitario: producto.precio,
          // [Línea 153] Define o asigna el campo/parámetro 'existenciaDisponible'.
          existenciaDisponible: producto.existencia,
          // [Línea 154] Define o asigna el campo/parámetro 'cantidad'.
          cantidad: unidades,
        // [Línea 155] Cierra el bloque o estructura (},).
        },
      // [Línea 156] Cierra el bloque o estructura (]);).
      ]);
    // [Línea 157] Cierra el bloque o estructura (}).
    }

    // [Línea 159] Ejecuta o evalúa: setBusquedaProducto("");
    setBusquedaProducto("");
    // [Línea 160] Ejecuta o evalúa: setCantidadParaAgregar("1");
    setCantidadParaAgregar("1");
    // [Línea 161] Ejecuta o evalúa: setIndiceSugerencia(0);
    setIndiceSugerencia(0);
    // [Línea 162] Ejecuta o evalúa: refInputProducto.current?.focus();
    refInputProducto.current?.focus();
  // [Línea 163] Cierra el bloque o estructura (}).
  }

  // [Línea 165] Declara la función o componente 'cambiarCantidadRenglon'.
  function cambiarCantidadRenglon(productoId: number, nuevaCantidad: number) {
    // [Línea 166] Ejecuta o evalúa: setRenglonesCompra((actuales) =>
    setRenglonesCompra((actuales) =>
      // [Línea 167] Ejecuta o evalúa: actuales.map((r) => {
      actuales.map((r) => {
        // [Línea 168] Verifica la condición: if (r.productoId !== productoId) return r;
        if (r.productoId !== productoId) return r;
        // [Línea 169] Verifica la condición: if (nuevaCantidad < 1) return r;
        if (nuevaCantidad < 1) return r;
        // [Línea 170] Verifica la condición: if (nuevaCantidad > r.existenciaDisponible) {
        if (nuevaCantidad > r.existenciaDisponible) {
          // [Línea 171] Muestra un aviso emergente en pantalla: toast.error(`Máximo disponible de ${r.codigo}: ${r.existenciaDisponible} unidades.`);
          toast.error(`Máximo disponible de ${r.codigo}: ${r.existenciaDisponible} unidades.`);
          // [Línea 172] Devuelve el valor: { ...r, cantidad: r.existenciaDisponible };
          return { ...r, cantidad: r.existenciaDisponible };
        // [Línea 173] Cierra el bloque o estructura (}).
        }
        // [Línea 174] Devuelve el valor: { ...r, cantidad: nuevaCantidad };
        return { ...r, cantidad: nuevaCantidad };
      // [Línea 175] Ejecuta o evalúa: }),
      }),
    // [Línea 176] Cierra el bloque o estructura ();).
    );
  // [Línea 177] Cierra el bloque o estructura (}).
  }

  // [Línea 179] Declara la función o componente 'quitarRenglon'.
  function quitarRenglon(productoId: number) {
    // [Línea 180] Ejecuta o evalúa: setRenglonesCompra((actuales) => actuales.filter((r) => r.productoId !== product
    setRenglonesCompra((actuales) => actuales.filter((r) => r.productoId !== productoId));
  // [Línea 181] Cierra el bloque o estructura (}).
  }

  // Navegación con teclado en el buscador de productos: ↑ ↓ eligen, Enter agrega (sección 8).
  // [Línea 184] Declara la función o componente 'manejarTecladoBuscador'.
  function manejarTecladoBuscador(e: React.KeyboardEvent<HTMLInputElement>) {
    // [Línea 185] Verifica la condición: if (productosFiltrados.length === 0) return;
    if (productosFiltrados.length === 0) return;

    // [Línea 187] Verifica la condición: if (e.key === "ArrowDown") {
    if (e.key === "ArrowDown") {
      // [Línea 188] Ejecuta o evalúa: e.preventDefault();
      e.preventDefault();
      // [Línea 189] Ejecuta o evalúa: setIndiceSugerencia((actual) => (actual + 1) % productosFiltrados.length);
      setIndiceSugerencia((actual) => (actual + 1) % productosFiltrados.length);
    // [Línea 190] Verifica la condición: } else if (e.key === "ArrowUp") {
    } else if (e.key === "ArrowUp") {
      // [Línea 191] Ejecuta o evalúa: e.preventDefault();
      e.preventDefault();
      // [Línea 192] Ejecuta o evalúa: setIndiceSugerencia(
      setIndiceSugerencia(
        // [Línea 193] Ejecuta o evalúa: (actual) => (actual - 1 + productosFiltrados.length) % productosFiltrados.length
        (actual) => (actual - 1 + productosFiltrados.length) % productosFiltrados.length,
      // [Línea 194] Cierra el bloque o estructura ();).
      );
    // [Línea 195] Verifica la condición: } else if (e.key === "Enter") {
    } else if (e.key === "Enter") {
      // [Línea 196] Ejecuta o evalúa: e.preventDefault();
      e.preventDefault();
      // [Línea 197] Declara 'elegido' y le asigna el valor resultante.
      const elegido = productosFiltrados[indiceSugerencia] ?? productosFiltrados[0];
      // [Línea 198] Verifica la condición: if (elegido) agregarProductoAVenta(elegido);
      if (elegido) agregarProductoAVenta(elegido);
    // [Línea 199] Cierra el bloque o estructura (}).
    }
  // [Línea 200] Cierra el bloque o estructura (}).
  }

  // [Línea 202] Declara la función o componente 'seleccionarCliente'.
  function seleccionarCliente(cliente: ClientePublico | null) {
    // [Línea 203] Ejecuta o evalúa: setClienteSeleccionado(cliente);
    setClienteSeleccionado(cliente);
    // [Línea 204] Ejecuta o evalúa: setBusquedaCliente("");
    setBusquedaCliente("");
    // [Línea 205] Verifica la condición: if ((!cliente || !cliente.cuentaCorriente) && formaPago === "cuenta_corriente") {
    if ((!cliente || !cliente.cuentaCorriente) && formaPago === "cuenta_corriente") {
      // [Línea 206] Ejecuta o evalúa: setFormaPago("contado");
      setFormaPago("contado");
    // [Línea 207] Cierra el bloque o estructura (}).
    }
  // [Línea 208] Cierra el bloque o estructura (}).
  }

  // Cálculo de vuelto en contado y crédito disponible en cuenta corriente.
  // [Línea 211] Declara 'montoRecibidoCentavos' y le asigna el valor resultante.
  const montoRecibidoCentavos =
    // [Línea 212] Ejecuta o evalúa: montoRecibidoTexto.trim() === "" ? totalCompra : (pesosACentavos(montoRecibidoTe
    montoRecibidoTexto.trim() === "" ? totalCompra : (pesosACentavos(montoRecibidoTexto) ?? 0);
  // [Línea 213] Declara 'vueltoCentavos' y le asigna el valor resultante.
  const vueltoCentavos = montoRecibidoCentavos - totalCompra;

  // [Línea 215] Declara 'nuevoSaldoProyectado' y le asigna el valor resultante.
  const nuevoSaldoProyectado = (clienteSeleccionado?.saldo ?? 0) + totalCompra;
  // [Línea 216] Declara 'superaLimiteCredito' y le asigna el valor resultante.
  const superaLimiteCredito =
    // [Línea 217] Ejecuta o evalúa: formaPago === "cuenta_corriente" &&
    formaPago === "cuenta_corriente" &&
    // [Línea 218] Ejecuta o evalúa: clienteSeleccionado !== null &&
    clienteSeleccionado !== null &&
    // [Línea 219] Ejecuta o evalúa: clienteSeleccionado.limiteCredito !== null &&
    clienteSeleccionado.limiteCredito !== null &&
    // [Línea 220] Ejecuta o evalúa: nuevoSaldoProyectado > clienteSeleccionado.limiteCredito;
    nuevoSaldoProyectado > clienteSeleccionado.limiteCredito;

  // RF-V6: envía la venta a POST /api/facturas para que se procese en una única transacción.
  // [Línea 223] Declara la función asíncrona 'confirmarVenta'.
  async function confirmarVenta() {
    // [Línea 224] Verifica la condición: if (renglonesCompra.length === 0) {
    if (renglonesCompra.length === 0) {
      // [Línea 225] Muestra un aviso emergente en pantalla: toast.error("Agregá al menos un producto a la venta.");
      toast.error("Agregá al menos un producto a la venta.");
      // [Línea 226] Ejecuta o evalúa: return;
      return;
    // [Línea 227] Cierra el bloque o estructura (}).
    }

    // [Línea 229] Verifica la condición: if (formaPago === "contado" && montoRecibidoCentavos < totalCompra) {
    if (formaPago === "contado" && montoRecibidoCentavos < totalCompra) {
      // [Línea 230] Muestra un aviso emergente en pantalla: toast.error("El monto recibido en efectivo no alcanza para cubrir el total.");
      toast.error("El monto recibido en efectivo no alcanza para cubrir el total.");
      // [Línea 231] Ejecuta o evalúa: return;
      return;
    // [Línea 232] Cierra el bloque o estructura (}).
    }

    // [Línea 234] Verifica la condición: if (formaPago === "tarjeta" && !/^\d{4}$/.test(tarjetaUltimos4)) {
    if (formaPago === "tarjeta" && !/^\d{4}$/.test(tarjetaUltimos4)) {
      // [Línea 235] Muestra un aviso emergente en pantalla: toast.error("Ingresá los últimos 4 dígitos de la tarjeta.");
      toast.error("Ingresá los últimos 4 dígitos de la tarjeta.");
      // [Línea 236] Ejecuta o evalúa: return;
      return;
    // [Línea 237] Cierra el bloque o estructura (}).
    }

    // [Línea 239] Verifica la condición: if (formaPago === "cuenta_corriente") {
    if (formaPago === "cuenta_corriente") {
      // [Línea 240] Verifica la condición: if (!clienteSeleccionado || !clienteSeleccionado.cuentaCorriente) {
      if (!clienteSeleccionado || !clienteSeleccionado.cuentaCorriente) {
        // [Línea 241] Muestra un aviso emergente en pantalla: toast.error("Elegí un cliente habilitado para vender en cuenta corriente.");
        toast.error("Elegí un cliente habilitado para vender en cuenta corriente.");
        // [Línea 242] Ejecuta o evalúa: return;
        return;
      // [Línea 243] Cierra el bloque o estructura (}).
      }
      // [Línea 244] Verifica la condición: if (superaLimiteCredito) {
      if (superaLimiteCredito) {
        // [Línea 245] Muestra un aviso emergente en pantalla: toast.error("La venta supera el límite de crédito disponible del cliente.");
        toast.error("La venta supera el límite de crédito disponible del cliente.");
        // [Línea 246] Ejecuta o evalúa: return;
        return;
      // [Línea 247] Cierra el bloque o estructura (}).
      }
    // [Línea 248] Cierra el bloque o estructura (}).
    }

    // [Línea 250] Declara 'cuerpoPago' y le asigna el valor resultante.
    const cuerpoPago =
      // [Línea 251] Ejecuta o evalúa: formaPago === "contado"
      formaPago === "contado"
        // [Línea 252] Ejecuta o evalúa: ? { forma: "contado", montoRecibido: montoRecibidoCentavos }
        ? { forma: "contado", montoRecibido: montoRecibidoCentavos }
        // [Línea 253] Ejecuta o evalúa: : formaPago === "tarjeta"
        : formaPago === "tarjeta"
          // [Línea 254] Ejecuta o evalúa: ? {
          ? {
              // [Línea 255] Define o asigna el campo/parámetro 'forma'.
              forma: "tarjeta",
              // [Línea 256] Define o asigna el campo/parámetro 'tarjeta'.
              tarjeta: {
                // [Línea 257] Define o asigna el campo/parámetro 'tipo'.
                tipo: tarjetaTipo,
                // [Línea 258] Define o asigna el campo/parámetro 'marca'.
                marca: tarjetaMarca,
                // [Línea 259] Define o asigna el campo/parámetro 'ultimos4'.
                ultimos4: tarjetaUltimos4,
              // [Línea 260] Cierra el bloque o estructura (},).
              },
            // [Línea 261] Cierra el bloque o estructura (}).
            }
          // [Línea 262] Ejecuta o evalúa: : { forma: "cuenta_corriente" };
          : { forma: "cuenta_corriente" };

    // [Línea 264] Ejecuta o evalúa: setConfirmando(true);
    setConfirmando(true);
    // [Línea 265] Inicia bloque try para capturar errores durante la operación.
    try {
      // [Línea 266] Espera el resultado de la consulta/operación asíncrona y lo asigna a 'respuesta'.
      const respuesta = await fetch("/api/facturas", {
        // [Línea 267] Define o asigna el campo/parámetro 'method'.
        method: "POST",
        // [Línea 268] Define o asigna el campo/parámetro 'headers'.
        headers: { "Content-Type": "application/json" },
        // [Línea 269] Define o asigna el campo/parámetro 'body'.
        body: JSON.stringify({
          // [Línea 270] Define o asigna el campo/parámetro 'clienteId'.
          clienteId: clienteSeleccionado ? clienteSeleccionado.id : null,
          // [Línea 271] Define o asigna el campo/parámetro 'items'.
          items: renglonesCompra.map((r) => ({
            // [Línea 272] Define o asigna el campo/parámetro 'productoId'.
            productoId: r.productoId,
            // [Línea 273] Define o asigna el campo/parámetro 'cantidad'.
            cantidad: r.cantidad,
          // [Línea 274] Ejecuta o evalúa: })),
          })),
          // [Línea 275] Define o asigna el campo/parámetro 'pago'.
          pago: cuerpoPago,
        // [Línea 276] Ejecuta o evalúa: }),
        }),
      // [Línea 277] Cierra el bloque o estructura (});).
      });

      // [Línea 279] Espera el resultado de la consulta/operación asíncrona y lo asigna a 'json'.
      const json = await respuesta.json();
      // [Línea 280] Verifica la condición: if (!respuesta.ok) {
      if (!respuesta.ok) {
        // [Línea 281] Muestra un aviso emergente en pantalla: toast.error(json.error?.message ?? "No se pudo confirmar la factura.");
        toast.error(json.error?.message ?? "No se pudo confirmar la factura.");
        // [Línea 282] Ejecuta o evalúa: return;
        return;
      // [Línea 283] Cierra el bloque o estructura (}).
      }

      // [Línea 285] Muestra un aviso emergente en pantalla: toast.success(`Factura ${json.numeroFormateado} emitida con éxito`);
      toast.success(`Factura ${json.numeroFormateado} emitida con éxito`);
      // [Línea 286] Ejecuta o evalúa: router.push(`/ventas/${json.id}`);
      router.push(`/ventas/${json.id}`);
      // [Línea 287] Ejecuta o evalúa: router.refresh();
      router.refresh();
    // [Línea 288] Bloque finally: se ejecuta siempre al terminar el try/catch.
    } finally {
      // [Línea 289] Ejecuta o evalúa: setConfirmando(false);
      setConfirmando(false);
    // [Línea 290] Cierra el bloque o estructura (}).
    }
  // [Línea 291] Cierra el bloque o estructura (}).
  }

  // [Línea 293] Devuelve la interfaz JSX que renderiza este componente.
  return (
    <Grilla className="grid-cols-1 lg:grid-cols-3 items-start"> // [Línea 294] Abre o renderiza el componente visual <Grilla>.
      // [Línea 295] Ejecuta o evalúa: {/* Columna izquierda (2/3): 1) Comprador y 2) Ítems de la venta */}
      {/* Columna izquierda (2/3): 1) Comprador y 2) Ítems de la venta */}
      <Apilar className="lg:col-span-2 gap-5"> // [Línea 296] Abre o renderiza el componente visual <Apilar>.
        // [Línea 297] Ejecuta o evalúa: {/* Parte 1: Comprador (RF-V2) */}
        {/* Parte 1: Comprador (RF-V2) */}
        <Card> // [Línea 298] Abre o renderiza el componente visual <Card>.
          <CardHeader> // [Línea 299] Abre o renderiza el componente visual <CardHeader>.
            <Alinear className="justify-between"> // [Línea 300] Abre o renderiza el componente visual <Alinear>.
              <Apilar className="gap-0.5"> // [Línea 301] Abre o renderiza el componente visual <Apilar>.
                <CardTitle>1. Comprador</CardTitle> // [Línea 302] Abre o renderiza el componente visual <CardTitle>.
                <CardDescription> // [Línea 303] Abre o renderiza el componente visual <CardDescription>.
                  // [Línea 304] Ejecuta o evalúa: Por defecto es Consumidor final. Podés buscar un cliente o darlo de alta ahora.
                  Por defecto es Consumidor final. Podés buscar un cliente o darlo de alta ahora.
                </CardDescription> // [Línea 305] Cierra el componente visual </CardDescription>.
              </Apilar> // [Línea 306] Cierra el componente visual </Apilar>.
              <BotonNuevoCliente // [Línea 307] Abre o renderiza el componente visual <BotonNuevoCliente>.
                // [Línea 308] Ejecuta o evalúa: textoBoton="Alta rápida de cliente"
                textoBoton="Alta rápida de cliente"
                // [Línea 309] Ejecuta o evalúa: alCrear={(nuevoCliente) => {
                alCrear={(nuevoCliente) => {
                  // [Línea 310] Ejecuta o evalúa: setListaClientes((prev) => [nuevoCliente, ...prev]);
                  setListaClientes((prev) => [nuevoCliente, ...prev]);
                  // [Línea 311] Ejecuta o evalúa: seleccionarCliente(nuevoCliente);
                  seleccionarCliente(nuevoCliente);
                // [Línea 312] Ejecuta o evalúa: }}
                }}
              // [Línea 313] Ejecuta o evalúa: />
              />
            </Alinear> // [Línea 314] Cierra el componente visual </Alinear>.
          </CardHeader> // [Línea 315] Cierra el componente visual </CardHeader>.

          <CardContent> // [Línea 317] Abre o renderiza el componente visual <CardContent>.
            // [Línea 318] Ejecuta o evalúa: {clienteSeleccionado ? (
            {clienteSeleccionado ? (
              <Alinear className="justify-between rounded-xl border border-emerald-200 bg-emerald-50/70 p-3.5"> // [Línea 319] Abre o renderiza el componente visual <Alinear>.
                <Alinear className="gap-3"> // [Línea 320] Abre o renderiza el componente visual <Alinear>.
                  <UserCheck className="size-5 text-emerald-700" /> // [Línea 321] Abre o renderiza el componente visual <UserCheck>.
                  <Apilar className="gap-0.5"> // [Línea 322] Abre o renderiza el componente visual <Apilar>.
                    <Alinear className="gap-2"> // [Línea 323] Abre o renderiza el componente visual <Alinear>.
                      <Texto negrita>{clienteSeleccionado.nombre}</Texto> // [Línea 324] Abre o renderiza el componente visual <Texto>.
                      <Badge variant="outline"> // [Línea 325] Abre o renderiza el componente visual <Badge>.
                        // [Línea 326] Ejecuta o evalúa: {clienteSeleccionado.tipoDoc} {clienteSeleccionado.nroDoc}
                        {clienteSeleccionado.tipoDoc} {clienteSeleccionado.nroDoc}
                      </Badge> // [Línea 327] Cierra el componente visual </Badge>.
                      // [Línea 328] Ejecuta o evalúa: {clienteSeleccionado.cuentaCorriente ? (
                      {clienteSeleccionado.cuentaCorriente ? (
                        <Badge variant="success">Cta. cte. habilitada</Badge> // [Línea 329] Abre o renderiza el componente visual <Badge>.
                      // [Línea 330] Ejecuta o evalúa: ) : (
                      ) : (
                        <Badge variant="secondary">Sin cta. cte.</Badge> // [Línea 331] Abre o renderiza el componente visual <Badge>.
                      // [Línea 332] Ejecuta o evalúa: )}
                      )}
                    </Alinear> // [Línea 333] Cierra el componente visual </Alinear>.
                    // [Línea 334] Ejecuta o evalúa: {clienteSeleccionado.cuentaCorriente && (
                    {clienteSeleccionado.cuentaCorriente && (
                      <Texto tamano="xs" tono="suave"> // [Línea 335] Abre o renderiza el componente visual <Texto>.
                        // [Línea 336] Ejecuta o evalúa: Saldo actual: {formatearMoneda(clienteSeleccionado.saldo)} ·{" "}
                        Saldo actual: {formatearMoneda(clienteSeleccionado.saldo)} ·{" "}
                        // [Línea 337] Ejecuta o evalúa: {clienteSeleccionado.limiteCredito !== null
                        {clienteSeleccionado.limiteCredito !== null
                          // [Línea 338] Ejecuta o evalúa: ? `Límite: ${formatearMoneda(clienteSeleccionado.limiteCredito)} (Disponible: ${
                          ? `Límite: ${formatearMoneda(clienteSeleccionado.limiteCredito)} (Disponible: ${formatearMoneda(clienteSeleccionado.disponible)})`
                          // [Línea 339] Ejecuta o evalúa: : "Sin tope de crédito"}
                          : "Sin tope de crédito"}
                      </Texto> // [Línea 340] Cierra el componente visual </Texto>.
                    // [Línea 341] Ejecuta o evalúa: )}
                    )}
                  </Apilar> // [Línea 342] Cierra el componente visual </Apilar>.
                </Alinear> // [Línea 343] Cierra el componente visual </Alinear>.

                <Button // [Línea 345] Abre o renderiza el componente visual <Button>.
                  // [Línea 346] Ejecuta o evalúa: variant="outline"
                  variant="outline"
                  // [Línea 347] Ejecuta o evalúa: size="xs"
                  size="xs"
                  // [Línea 348] Ejecuta o evalúa: onClick={() => seleccionarCliente(null)}
                  onClick={() => seleccionarCliente(null)}
                // [Línea 349] Ejecuta o evalúa: >
                >
                  <UserX className="size-3.5" /> // [Línea 350] Abre o renderiza el componente visual <UserX>.
                  // [Línea 351] Ejecuta o evalúa: Pasar a Consumidor final
                  Pasar a Consumidor final
                </Button> // [Línea 352] Cierra el componente visual </Button>.
              </Alinear> // [Línea 353] Cierra el componente visual </Alinear>.
            // [Línea 354] Ejecuta o evalúa: ) : (
            ) : (
              <Apilar className="gap-2"> // [Línea 355] Abre o renderiza el componente visual <Apilar>.
                <Alinear className="justify-between rounded-lg border border-border bg-secondary/40 px-3 py-2"> // [Línea 356] Abre o renderiza el componente visual <Alinear>.
                  <Texto tamano="sm"> // [Línea 357] Abre o renderiza el componente visual <Texto>.
                    // [Línea 358] Ejecuta o evalúa: Comprador actual: <Texto negrita>Consumidor final</Texto>
                    Comprador actual: <Texto negrita>Consumidor final</Texto>
                  </Texto> // [Línea 359] Cierra el componente visual </Texto>.
                  <Badge variant="secondary">Contado / Tarjeta</Badge> // [Línea 360] Abre o renderiza el componente visual <Badge>.
                </Alinear> // [Línea 361] Cierra el componente visual </Alinear>.

                <Caja className="relative"> // [Línea 363] Abre o renderiza el componente visual <Caja>.
                  <Search className="pointer-events-none absolute top-1/2 left-3 size-4 -translate-y-1/2 text-muted-foreground" /> // [Línea 364] Abre o renderiza el componente visual <Search>.
                  <Input // [Línea 365] Abre o renderiza el componente visual <Input>.
                    // [Línea 366] Ejecuta o evalúa: value={busquedaCliente}
                    value={busquedaCliente}
                    // [Línea 367] Ejecuta o evalúa: onChange={(e) => setBusquedaCliente(e.target.value)}
                    onChange={(e) => setBusquedaCliente(e.target.value)}
                    // [Línea 368] Ejecuta o evalúa: placeholder="Buscar cliente registrado por nombre, DNI o CUIT..."
                    placeholder="Buscar cliente registrado por nombre, DNI o CUIT..."
                    // [Línea 369] Ejecuta o evalúa: className="pl-9"
                    className="pl-9"
                  // [Línea 370] Ejecuta o evalúa: />
                  />

                  // [Línea 372] Ejecuta o evalúa: {clientesFiltrados.length > 0 && (
                  {clientesFiltrados.length > 0 && (
                    <Caja className="absolute z-20 mt-1 w-full rounded-xl border border-border bg-card p-1.5 shadow-lg"> // [Línea 373] Abre o renderiza el componente visual <Caja>.
                      // [Línea 374] Ejecuta o evalúa: {clientesFiltrados.map((c) => (
                      {clientesFiltrados.map((c) => (
                        <button // [Línea 375] Abre o renderiza el componente visual <button>.
                          // [Línea 376] Ejecuta o evalúa: key={c.id}
                          key={c.id}
                          // [Línea 377] Ejecuta o evalúa: type="button"
                          type="button"
                          // [Línea 378] Ejecuta o evalúa: onClick={() => seleccionarCliente(c)}
                          onClick={() => seleccionarCliente(c)}
                          // [Línea 379] Ejecuta o evalúa: className="flex w-full items-center justify-between rounded-lg px-3 py-2 text-le
                          className="flex w-full items-center justify-between rounded-lg px-3 py-2 text-left text-sm hover:bg-secondary cursor-pointer"
                        // [Línea 380] Ejecuta o evalúa: >
                        >
                          <Apilar className="gap-0"> // [Línea 381] Abre o renderiza el componente visual <Apilar>.
                            <Texto negrita>{c.nombre}</Texto> // [Línea 382] Abre o renderiza el componente visual <Texto>.
                            <Texto tamano="xs" tono="suave"> // [Línea 383] Abre o renderiza el componente visual <Texto>.
                              // [Línea 384] Ejecuta o evalúa: {c.tipoDoc} {c.nroDoc}
                              {c.tipoDoc} {c.nroDoc}
                            </Texto> // [Línea 385] Cierra el componente visual </Texto>.
                          </Apilar> // [Línea 386] Cierra el componente visual </Apilar>.
                          <Alinear className="gap-2"> // [Línea 387] Abre o renderiza el componente visual <Alinear>.
                            // [Línea 388] Ejecuta o evalúa: {c.cuentaCorriente && (
                            {c.cuentaCorriente && (
                              <Badge variant="success">Cta. Cte.</Badge> // [Línea 389] Abre o renderiza el componente visual <Badge>.
                            // [Línea 390] Ejecuta o evalúa: )}
                            )}
                            <Texto mono tamano="xs"> // [Línea 391] Abre o renderiza el componente visual <Texto>.
                              // [Línea 392] Define o asigna el campo/parámetro 'Saldo'.
                              Saldo: {formatearMoneda(c.saldo)}
                            </Texto> // [Línea 393] Cierra el componente visual </Texto>.
                          </Alinear> // [Línea 394] Cierra el componente visual </Alinear>.
                        </button> // [Línea 395] Cierra el componente visual </button>.
                      // [Línea 396] Ejecuta o evalúa: ))}
                      ))}
                    </Caja> // [Línea 397] Cierra el componente visual </Caja>.
                  // [Línea 398] Ejecuta o evalúa: )}
                  )}
                </Caja> // [Línea 399] Cierra el componente visual </Caja>.
              </Apilar> // [Línea 400] Cierra el componente visual </Apilar>.
            // [Línea 401] Ejecuta o evalúa: )}
            )}
          </CardContent> // [Línea 402] Cierra el componente visual </CardContent>.
        </Card> // [Línea 403] Cierra el componente visual </Card>.

        // [Línea 405] Ejecuta o evalúa: {/* Parte 2: Ítems de la venta (RF-V3 y RF-V4) */}
        {/* Parte 2: Ítems de la venta (RF-V3 y RF-V4) */}
        <Card> // [Línea 406] Abre o renderiza el componente visual <Card>.
          <CardHeader> // [Línea 407] Abre o renderiza el componente visual <CardHeader>.
            <CardTitle>2. Productos de la venta</CardTitle> // [Línea 408] Abre o renderiza el componente visual <CardTitle>.
            <CardDescription> // [Línea 409] Abre o renderiza el componente visual <CardDescription>.
              // [Línea 410] Ejecuta o evalúa: Buscá por código o descripción. Usá las flechas ↑ ↓ y presioná Enter para agrega
              Buscá por código o descripción. Usá las flechas ↑ ↓ y presioná Enter para agregar con
              // [Línea 411] Ejecuta o evalúa: el teclado.
              el teclado.
            </CardDescription> // [Línea 412] Cierra el componente visual </CardDescription>.
          </CardHeader> // [Línea 413] Cierra el componente visual </CardHeader>.

          <CardContent className="gap-4"> // [Línea 415] Abre o renderiza el componente visual <CardContent>.
            <Alinear className="gap-2 items-end"> // [Línea 416] Abre o renderiza el componente visual <Alinear>.
              <Caja className="relative flex-1 min-w-56"> // [Línea 417] Abre o renderiza el componente visual <Caja>.
                <Search className="pointer-events-none absolute top-1/2 left-3 size-4 -translate-y-1/2 text-muted-foreground" /> // [Línea 418] Abre o renderiza el componente visual <Search>.
                <Input // [Línea 419] Abre o renderiza el componente visual <Input>.
                  // [Línea 420] Ejecuta o evalúa: ref={refInputProducto}
                  ref={refInputProducto}
                  // [Línea 421] Ejecuta o evalúa: value={busquedaProducto}
                  value={busquedaProducto}
                  // [Línea 422] Ejecuta o evalúa: onChange={(e) => {
                  onChange={(e) => {
                    // [Línea 423] Ejecuta o evalúa: setBusquedaProducto(e.target.value);
                    setBusquedaProducto(e.target.value);
                    // [Línea 424] Ejecuta o evalúa: setIndiceSugerencia(0);
                    setIndiceSugerencia(0);
                  // [Línea 425] Ejecuta o evalúa: }}
                  }}
                  // [Línea 426] Ejecuta o evalúa: onKeyDown={manejarTecladoBuscador}
                  onKeyDown={manejarTecladoBuscador}
                  // [Línea 427] Ejecuta o evalúa: placeholder="Escribí código (ej. HE-001) o descripción (ej. Martillo) y pulsá En
                  placeholder="Escribí código (ej. HE-001) o descripción (ej. Martillo) y pulsá Enter..."
                  // [Línea 428] Ejecuta o evalúa: className="pl-9"
                  className="pl-9"
                  // [Línea 429] Ejecuta o evalúa: autoFocus
                  autoFocus
                // [Línea 430] Ejecuta o evalúa: />
                />

                // [Línea 432] Ejecuta o evalúa: {productosFiltrados.length > 0 && (
                {productosFiltrados.length > 0 && (
                  <Caja className="absolute z-20 mt-1 w-full rounded-xl border border-border bg-card p-1.5 shadow-xl"> // [Línea 433] Abre o renderiza el componente visual <Caja>.
                    // [Línea 434] Ejecuta o evalúa: {productosFiltrados.map((prod, idx) => {
                    {productosFiltrados.map((prod, idx) => {
                      // [Línea 435] Declara 'resaltado' y le asigna el valor resultante.
                      const resaltado = idx === indiceSugerencia;
                      // [Línea 436] Devuelve la interfaz JSX que renderiza este componente.
                      return (
                        <button // [Línea 437] Abre o renderiza el componente visual <button>.
                          // [Línea 438] Ejecuta o evalúa: key={prod.id}
                          key={prod.id}
                          // [Línea 439] Ejecuta o evalúa: type="button"
                          type="button"
                          // [Línea 440] Ejecuta o evalúa: onClick={() => agregarProductoAVenta(prod)}
                          onClick={() => agregarProductoAVenta(prod)}
                          // [Línea 441] Ejecuta o evalúa: className={`flex w-full items-center justify-between rounded-lg px-3 py-2 text-l
                          className={`flex w-full items-center justify-between rounded-lg px-3 py-2 text-left text-sm cursor-pointer ${
                            // [Línea 442] Ejecuta o evalúa: resaltado ? "bg-accent text-accent-foreground font-medium" : "hover:bg-secondary
                            resaltado ? "bg-accent text-accent-foreground font-medium" : "hover:bg-secondary"
                          // [Línea 443] Ejecuta o evalúa: }`}
                          }`}
                        // [Línea 444] Ejecuta o evalúa: >
                        >
                          <Alinear className="gap-2"> // [Línea 445] Abre o renderiza el componente visual <Alinear>.
                            <Badge variant="outline" className="font-mono"> // [Línea 446] Abre o renderiza el componente visual <Badge>.
                              // [Línea 447] Ejecuta o evalúa: {prod.codigo}
                              {prod.codigo}
                            </Badge> // [Línea 448] Cierra el componente visual </Badge>.
                            <Texto>{prod.descripcion}</Texto> // [Línea 449] Abre o renderiza el componente visual <Texto>.
                          </Alinear> // [Línea 450] Cierra el componente visual </Alinear>.
                          <Alinear className="gap-3"> // [Línea 451] Abre o renderiza el componente visual <Alinear>.
                            <Badge // [Línea 452] Abre o renderiza el componente visual <Badge>.
                              // [Línea 453] Ejecuta o evalúa: variant={
                              variant={
                                // [Línea 454] Ejecuta o evalúa: prod.existencia === 0
                                prod.existencia === 0
                                  // [Línea 455] Ejecuta o evalúa: ? "destructive"
                                  ? "destructive"
                                  // [Línea 456] Ejecuta o evalúa: : prod.bajoMinimo
                                  : prod.bajoMinimo
                                    // [Línea 457] Ejecuta o evalúa: ? "warning"
                                    ? "warning"
                                    // [Línea 458] Ejecuta o evalúa: : "secondary"
                                    : "secondary"
                              // [Línea 459] Cierra el bloque o estructura (}).
                              }
                            // [Línea 460] Ejecuta o evalúa: >
                            >
                              // [Línea 461] Define o asigna el campo/parámetro 'Stock'.
                              Stock: {prod.existencia}
                            </Badge> // [Línea 462] Cierra el componente visual </Badge>.
                            <Texto mono negrita> // [Línea 463] Abre o renderiza el componente visual <Texto>.
                              // [Línea 464] Ejecuta o evalúa: {formatearMoneda(prod.precio)}
                              {formatearMoneda(prod.precio)}
                            </Texto> // [Línea 465] Cierra el componente visual </Texto>.
                          </Alinear> // [Línea 466] Cierra el componente visual </Alinear>.
                        </button> // [Línea 467] Cierra el componente visual </button>.
                      // [Línea 468] Cierra el bloque o estructura ();).
                      );
                    // [Línea 469] Ejecuta o evalúa: })}
                    })}
                  </Caja> // [Línea 470] Cierra el componente visual </Caja>.
                // [Línea 471] Ejecuta o evalúa: )}
                )}
              </Caja> // [Línea 472] Cierra el componente visual </Caja>.

              <Caja className="w-24"> // [Línea 474] Abre o renderiza el componente visual <Caja>.
                <Input // [Línea 475] Abre o renderiza el componente visual <Input>.
                  // [Línea 476] Ejecuta o evalúa: type="number"
                  type="number"
                  // [Línea 477] Ejecuta o evalúa: min={1}
                  min={1}
                  // [Línea 478] Ejecuta o evalúa: aria-label="Cantidad"
                  aria-label="Cantidad"
                  // [Línea 479] Ejecuta o evalúa: value={cantidadParaAgregar}
                  value={cantidadParaAgregar}
                  // [Línea 480] Ejecuta o evalúa: onChange={(e) => setCantidadParaAgregar(e.target.value)}
                  onChange={(e) => setCantidadParaAgregar(e.target.value)}
                  // [Línea 481] Ejecuta o evalúa: onKeyDown={manejarTecladoBuscador}
                  onKeyDown={manejarTecladoBuscador}
                // [Línea 482] Ejecuta o evalúa: />
                />
              </Caja> // [Línea 483] Cierra el componente visual </Caja>.
            </Alinear> // [Línea 484] Cierra el componente visual </Alinear>.

            // [Línea 486] Ejecuta o evalúa: {renglonesCompra.length === 0 ? (
            {renglonesCompra.length === 0 ? (
              <Caja className="rounded-xl border border-dashed border-border py-10 text-center"> // [Línea 487] Abre o renderiza el componente visual <Caja>.
                <Texto tono="suave"> // [Línea 488] Abre o renderiza el componente visual <Texto>.
                  // [Línea 489] Ejecuta o evalúa: Todavía no agregaste productos. Buscá arriba por código o descripción.
                  Todavía no agregaste productos. Buscá arriba por código o descripción.
                </Texto> // [Línea 490] Cierra el componente visual </Texto>.
              </Caja> // [Línea 491] Cierra el componente visual </Caja>.
            // [Línea 492] Ejecuta o evalúa: ) : (
            ) : (
              <Table> // [Línea 493] Abre o renderiza el componente visual <Table>.
                <TableHeader> // [Línea 494] Abre o renderiza el componente visual <TableHeader>.
                  <TableRow> // [Línea 495] Abre o renderiza el componente visual <TableRow>.
                    <TableHead>Código</TableHead> // [Línea 496] Abre o renderiza el componente visual <TableHead>.
                    <TableHead>Descripción</TableHead> // [Línea 497] Abre o renderiza el componente visual <TableHead>.
                    <TableHead className="text-center">Cantidad</TableHead> // [Línea 498] Abre o renderiza el componente visual <TableHead>.
                    <TableHead className="text-right">Precio unit.</TableHead> // [Línea 499] Abre o renderiza el componente visual <TableHead>.
                    <TableHead className="text-right">Subtotal</TableHead> // [Línea 500] Abre o renderiza el componente visual <TableHead>.
                    <TableHead className="text-right">Quitar</TableHead> // [Línea 501] Abre o renderiza el componente visual <TableHead>.
                  </TableRow> // [Línea 502] Cierra el componente visual </TableRow>.
                </TableHeader> // [Línea 503] Cierra el componente visual </TableHeader>.
                <TableBody> // [Línea 504] Abre o renderiza el componente visual <TableBody>.
                  // [Línea 505] Ejecuta o evalúa: {renglonesCompra.map((renglon) => (
                  {renglonesCompra.map((renglon) => (
                    <TableRow key={renglon.productoId}> // [Línea 506] Abre o renderiza el componente visual <TableRow>.
                      <TableCell className="font-mono text-xs">{renglon.codigo}</TableCell> // [Línea 507] Abre o renderiza el componente visual <TableCell>.
                      <TableCell> // [Línea 508] Abre o renderiza el componente visual <TableCell>.
                        <Apilar className="gap-0"> // [Línea 509] Abre o renderiza el componente visual <Apilar>.
                          <Texto negrita>{renglon.descripcion}</Texto> // [Línea 510] Abre o renderiza el componente visual <Texto>.
                          <Texto tamano="xs" tono="suave"> // [Línea 511] Abre o renderiza el componente visual <Texto>.
                            // [Línea 512] Define o asigna el campo/parámetro 'Disponible'.
                            Disponible: {renglon.existenciaDisponible} u.
                          </Texto> // [Línea 513] Cierra el componente visual </Texto>.
                        </Apilar> // [Línea 514] Cierra el componente visual </Apilar>.
                      </TableCell> // [Línea 515] Cierra el componente visual </TableCell>.
                      <TableCell> // [Línea 516] Abre o renderiza el componente visual <TableCell>.
                        <Alinear className="justify-center gap-1"> // [Línea 517] Abre o renderiza el componente visual <Alinear>.
                          <Button // [Línea 518] Abre o renderiza el componente visual <Button>.
                            // [Línea 519] Ejecuta o evalúa: variant="outline"
                            variant="outline"
                            // [Línea 520] Ejecuta o evalúa: size="xs"
                            size="xs"
                            // [Línea 521] Ejecuta o evalúa: onClick={() =>
                            onClick={() =>
                              // [Línea 522] Ejecuta o evalúa: cambiarCantidadRenglon(renglon.productoId, renglon.cantidad - 1)
                              cambiarCantidadRenglon(renglon.productoId, renglon.cantidad - 1)
                            // [Línea 523] Cierra el bloque o estructura (}).
                            }
                            // [Línea 524] Ejecuta o evalúa: disabled={renglon.cantidad <= 1}
                            disabled={renglon.cantidad <= 1}
                          // [Línea 525] Ejecuta o evalúa: >
                          >
                            <Minus className="size-3" /> // [Línea 526] Abre o renderiza el componente visual <Minus>.
                          </Button> // [Línea 527] Cierra el componente visual </Button>.
                          <Input // [Línea 528] Abre o renderiza el componente visual <Input>.
                            // [Línea 529] Ejecuta o evalúa: type="number"
                            type="number"
                            // [Línea 530] Ejecuta o evalúa: min={1}
                            min={1}
                            // [Línea 531] Ejecuta o evalúa: max={renglon.existenciaDisponible}
                            max={renglon.existenciaDisponible}
                            // [Línea 532] Ejecuta o evalúa: value={renglon.cantidad}
                            value={renglon.cantidad}
                            // [Línea 533] Ejecuta o evalúa: onChange={(e) =>
                            onChange={(e) =>
                              // [Línea 534] Ejecuta o evalúa: cambiarCantidadRenglon(
                              cambiarCantidadRenglon(
                                // [Línea 535] Ejecuta o evalúa: renglon.productoId,
                                renglon.productoId,
                                // [Línea 536] Ejecuta o evalúa: Number(e.target.value) || 1,
                                Number(e.target.value) || 1,
                              // [Línea 537] Ejecuta o evalúa: )
                              )
                            // [Línea 538] Cierra el bloque o estructura (}).
                            }
                            // [Línea 539] Ejecuta o evalúa: className="w-16 text-center font-mono"
                            className="w-16 text-center font-mono"
                          // [Línea 540] Ejecuta o evalúa: />
                          />
                          <Button // [Línea 541] Abre o renderiza el componente visual <Button>.
                            // [Línea 542] Ejecuta o evalúa: variant="outline"
                            variant="outline"
                            // [Línea 543] Ejecuta o evalúa: size="xs"
                            size="xs"
                            // [Línea 544] Ejecuta o evalúa: onClick={() =>
                            onClick={() =>
                              // [Línea 545] Ejecuta o evalúa: cambiarCantidadRenglon(renglon.productoId, renglon.cantidad + 1)
                              cambiarCantidadRenglon(renglon.productoId, renglon.cantidad + 1)
                            // [Línea 546] Cierra el bloque o estructura (}).
                            }
                            // [Línea 547] Ejecuta o evalúa: disabled={renglon.cantidad >= renglon.existenciaDisponible}
                            disabled={renglon.cantidad >= renglon.existenciaDisponible}
                          // [Línea 548] Ejecuta o evalúa: >
                          >
                            <Plus className="size-3" /> // [Línea 549] Abre o renderiza el componente visual <Plus>.
                          </Button> // [Línea 550] Cierra el componente visual </Button>.
                        </Alinear> // [Línea 551] Cierra el componente visual </Alinear>.
                      </TableCell> // [Línea 552] Cierra el componente visual </TableCell>.
                      <TableCell className="text-right font-mono"> // [Línea 553] Abre o renderiza el componente visual <TableCell>.
                        // [Línea 554] Ejecuta o evalúa: {formatearMoneda(renglon.precioUnitario)}
                        {formatearMoneda(renglon.precioUnitario)}
                      </TableCell> // [Línea 555] Cierra el componente visual </TableCell>.
                      <TableCell className="text-right font-mono font-semibold"> // [Línea 556] Abre o renderiza el componente visual <TableCell>.
                        // [Línea 557] Ejecuta o evalúa: {formatearMoneda(renglon.precioUnitario * renglon.cantidad)}
                        {formatearMoneda(renglon.precioUnitario * renglon.cantidad)}
                      </TableCell> // [Línea 558] Cierra el componente visual </TableCell>.
                      <TableCell className="text-right"> // [Línea 559] Abre o renderiza el componente visual <TableCell>.
                        <Button // [Línea 560] Abre o renderiza el componente visual <Button>.
                          // [Línea 561] Ejecuta o evalúa: variant="ghost"
                          variant="ghost"
                          // [Línea 562] Ejecuta o evalúa: size="xs"
                          size="xs"
                          // [Línea 563] Ejecuta o evalúa: onClick={() => quitarRenglon(renglon.productoId)}
                          onClick={() => quitarRenglon(renglon.productoId)}
                          // [Línea 564] Ejecuta o evalúa: aria-label="Quitar renglón"
                          aria-label="Quitar renglón"
                        // [Línea 565] Ejecuta o evalúa: >
                        >
                          <Trash2 className="size-4 text-red-600" /> // [Línea 566] Abre o renderiza el componente visual <Trash2>.
                        </Button> // [Línea 567] Cierra el componente visual </Button>.
                      </TableCell> // [Línea 568] Cierra el componente visual </TableCell>.
                    </TableRow> // [Línea 569] Cierra el componente visual </TableRow>.
                  // [Línea 570] Ejecuta o evalúa: ))}
                  ))}
                </TableBody> // [Línea 571] Cierra el componente visual </TableBody>.
              </Table> // [Línea 572] Cierra el componente visual </Table>.
            // [Línea 573] Ejecuta o evalúa: )}
            )}
          </CardContent> // [Línea 574] Cierra el componente visual </CardContent>.
        </Card> // [Línea 575] Cierra el componente visual </Card>.
      </Apilar> // [Línea 576] Cierra el componente visual </Apilar>.

      // [Línea 578] Ejecuta o evalúa: {/* Columna derecha (1/3): 3) Forma de pago y Confirmación (RF-V5 y RF-V6) */}
      {/* Columna derecha (1/3): 3) Forma de pago y Confirmación (RF-V5 y RF-V6) */}
      <Card className="sticky top-20"> // [Línea 579] Abre o renderiza el componente visual <Card>.
        <CardHeader> // [Línea 580] Abre o renderiza el componente visual <CardHeader>.
          <Alinear className="justify-between"> // [Línea 581] Abre o renderiza el componente visual <Alinear>.
            <CardTitle>3. Pago y confirmación</CardTitle> // [Línea 582] Abre o renderiza el componente visual <CardTitle>.
            <Badge variant="outline" className="font-mono"> // [Línea 583] Abre o renderiza el componente visual <Badge>.
              // [Línea 584] Ejecuta o evalúa: Nº est. {proximoNumeroInformativo}
              Nº est. {proximoNumeroInformativo}
            </Badge> // [Línea 585] Cierra el componente visual </Badge>.
          </Alinear> // [Línea 586] Cierra el componente visual </Alinear>.
          <CardDescription>Elegí una forma de pago para emitir el comprobante.</CardDescription> // [Línea 587] Abre o renderiza el componente visual <CardDescription>.
        </CardHeader> // [Línea 588] Cierra el componente visual </CardHeader>.

        <CardContent className="gap-4"> // [Línea 590] Abre o renderiza el componente visual <CardContent>.
          // [Línea 591] Ejecuta o evalúa: {/* Selector de las 3 formas de pago */}
          {/* Selector de las 3 formas de pago */}
          <Grilla className="grid-cols-3 gap-2"> // [Línea 592] Abre o renderiza el componente visual <Grilla>.
            <Button // [Línea 593] Abre o renderiza el componente visual <Button>.
              // [Línea 594] Ejecuta o evalúa: variant={formaPago === "contado" ? "default" : "outline"}
              variant={formaPago === "contado" ? "default" : "outline"}
              // [Línea 595] Ejecuta o evalúa: size="sm"
              size="sm"
              // [Línea 596] Ejecuta o evalúa: onClick={() => {
              onClick={() => {
                // [Línea 597] Ejecuta o evalúa: setFormaPago("contado");
                setFormaPago("contado");
                // [Línea 598] Ejecuta o evalúa: setMontoRecibidoTexto(centavosATextoPesos(totalCompra));
                setMontoRecibidoTexto(centavosATextoPesos(totalCompra));
              // [Línea 599] Ejecuta o evalúa: }}
              }}
              // [Línea 600] Ejecuta o evalúa: className="flex-col h-auto py-2.5 gap-1"
              className="flex-col h-auto py-2.5 gap-1"
            // [Línea 601] Ejecuta o evalúa: >
            >
              <Banknote className="size-4" /> // [Línea 602] Abre o renderiza el componente visual <Banknote>.
              <Texto tamano="xs">Contado</Texto> // [Línea 603] Abre o renderiza el componente visual <Texto>.
            </Button> // [Línea 604] Cierra el componente visual </Button>.

            <Button // [Línea 606] Abre o renderiza el componente visual <Button>.
              // [Línea 607] Ejecuta o evalúa: variant={formaPago === "tarjeta" ? "default" : "outline"}
              variant={formaPago === "tarjeta" ? "default" : "outline"}
              // [Línea 608] Ejecuta o evalúa: size="sm"
              size="sm"
              // [Línea 609] Ejecuta o evalúa: onClick={() => setFormaPago("tarjeta")}
              onClick={() => setFormaPago("tarjeta")}
              // [Línea 610] Ejecuta o evalúa: className="flex-col h-auto py-2.5 gap-1"
              className="flex-col h-auto py-2.5 gap-1"
            // [Línea 611] Ejecuta o evalúa: >
            >
              <CreditCard className="size-4" /> // [Línea 612] Abre o renderiza el componente visual <CreditCard>.
              <Texto tamano="xs">Tarjeta</Texto> // [Línea 613] Abre o renderiza el componente visual <Texto>.
            </Button> // [Línea 614] Cierra el componente visual </Button>.

            <Button // [Línea 616] Abre o renderiza el componente visual <Button>.
              // [Línea 617] Ejecuta o evalúa: variant={formaPago === "cuenta_corriente" ? "default" : "outline"}
              variant={formaPago === "cuenta_corriente" ? "default" : "outline"}
              // [Línea 618] Ejecuta o evalúa: size="sm"
              size="sm"
              // [Línea 619] Ejecuta o evalúa: disabled={!clienteSeleccionado || !clienteSeleccionado.cuentaCorriente}
              disabled={!clienteSeleccionado || !clienteSeleccionado.cuentaCorriente}
              // [Línea 620] Ejecuta o evalúa: title={
              title={
                // [Línea 621] Ejecuta o evalúa: !clienteSeleccionado
                !clienteSeleccionado
                  // [Línea 622] Ejecuta o evalúa: ? "Seleccioná un cliente registrado para habilitar cuenta corriente"
                  ? "Seleccioná un cliente registrado para habilitar cuenta corriente"
                  // [Línea 623] Ejecuta o evalúa: : !clienteSeleccionado.cuentaCorriente
                  : !clienteSeleccionado.cuentaCorriente
                    // [Línea 624] Ejecuta o evalúa: ? "Este cliente no tiene cuenta corriente habilitada"
                    ? "Este cliente no tiene cuenta corriente habilitada"
                    // [Línea 625] Ejecuta o evalúa: : undefined
                    : undefined
              // [Línea 626] Cierra el bloque o estructura (}).
              }
              // [Línea 627] Ejecuta o evalúa: onClick={() => setFormaPago("cuenta_corriente")}
              onClick={() => setFormaPago("cuenta_corriente")}
              // [Línea 628] Ejecuta o evalúa: className="flex-col h-auto py-2.5 gap-1"
              className="flex-col h-auto py-2.5 gap-1"
            // [Línea 629] Ejecuta o evalúa: >
            >
              <BookOpen className="size-4" /> // [Línea 630] Abre o renderiza el componente visual <BookOpen>.
              <Texto tamano="xs">Cta. Cte.</Texto> // [Línea 631] Abre o renderiza el componente visual <Texto>.
            </Button> // [Línea 632] Cierra el componente visual </Button>.
          </Grilla> // [Línea 633] Cierra el componente visual </Grilla>.

          // [Línea 635] Ejecuta o evalúa: {/* Datos específicos según la forma de pago elegida */}
          {/* Datos específicos según la forma de pago elegida */}
          // [Línea 636] Ejecuta o evalúa: {formaPago === "contado" && (
          {formaPago === "contado" && (
            <Apilar className="gap-3 rounded-xl border border-border bg-secondary/30 p-3.5"> // [Línea 637] Abre o renderiza el componente visual <Apilar>.
              <CampoImporte // [Línea 638] Abre o renderiza el componente visual <CampoImporte>.
                // [Línea 639] Ejecuta o evalúa: etiqueta="Monto recibido en efectivo"
                etiqueta="Monto recibido en efectivo"
                // [Línea 640] Ejecuta o evalúa: valorTexto={montoRecibidoTexto}
                valorTexto={montoRecibidoTexto}
                // [Línea 641] Ejecuta o evalúa: alCambiar={setMontoRecibidoTexto}
                alCambiar={setMontoRecibidoTexto}
                // [Línea 642] Ejecuta o evalúa: placeholder={centavosATextoPesos(totalCompra) || "0,00"}
                placeholder={centavosATextoPesos(totalCompra) || "0,00"}
                // [Línea 643] Ejecuta o evalúa: ayuda="Si se deja vacío se toma el total exacto"
                ayuda="Si se deja vacío se toma el total exacto"
              // [Línea 644] Ejecuta o evalúa: />
              />
              <Alinear className="justify-between border-t border-border pt-2"> // [Línea 645] Abre o renderiza el componente visual <Alinear>.
                <Texto tamano="sm" tono="suave"> // [Línea 646] Abre o renderiza el componente visual <Texto>.
                  // [Línea 647] Ejecuta o evalúa: Vuelto a entregar:
                  Vuelto a entregar:
                </Texto> // [Línea 648] Cierra el componente visual </Texto>.
                <Texto // [Línea 649] Abre o renderiza el componente visual <Texto>.
                  // [Línea 650] Ejecuta o evalúa: mono
                  mono
                  // [Línea 651] Ejecuta o evalúa: negrita
                  negrita
                  // [Línea 652] Ejecuta o evalúa: tono={vueltoCentavos < 0 ? "peligro" : "exito"}
                  tono={vueltoCentavos < 0 ? "peligro" : "exito"}
                // [Línea 653] Ejecuta o evalúa: >
                >
                  // [Línea 654] Ejecuta o evalúa: {vueltoCentavos < 0
                  {vueltoCentavos < 0
                    // [Línea 655] Ejecuta o evalúa: ? `Faltan ${formatearMoneda(-vueltoCentavos)}`
                    ? `Faltan ${formatearMoneda(-vueltoCentavos)}`
                    // [Línea 656] Ejecuta o evalúa: : formatearMoneda(vueltoCentavos)}
                    : formatearMoneda(vueltoCentavos)}
                </Texto> // [Línea 657] Cierra el componente visual </Texto>.
              </Alinear> // [Línea 658] Cierra el componente visual </Alinear>.
            </Apilar> // [Línea 659] Cierra el componente visual </Apilar>.
          // [Línea 660] Ejecuta o evalúa: )}
          )}

          // [Línea 662] Ejecuta o evalúa: {formaPago === "tarjeta" && (
          {formaPago === "tarjeta" && (
            <Apilar className="gap-3 rounded-xl border border-border bg-secondary/30 p-3.5"> // [Línea 663] Abre o renderiza el componente visual <Apilar>.
              <Grilla className="grid-cols-2 gap-2"> // [Línea 664] Abre o renderiza el componente visual <Grilla>.
                <CampoFormulario etiqueta="Tipo"> // [Línea 665] Abre o renderiza el componente visual <CampoFormulario>.
                  <Select // [Línea 666] Abre o renderiza el componente visual <Select>.
                    // [Línea 667] Ejecuta o evalúa: value={tarjetaTipo}
                    value={tarjetaTipo}
                    // [Línea 668] Ejecuta o evalúa: onChange={(e) => setTarjetaTipo(e.target.value as "debito" | "credito")}
                    onChange={(e) => setTarjetaTipo(e.target.value as "debito" | "credito")}
                  // [Línea 669] Ejecuta o evalúa: >
                  >
                    <option value="debito">Débito</option> // [Línea 670] Abre o renderiza el componente visual <option>.
                    <option value="credito">Crédito</option> // [Línea 671] Abre o renderiza el componente visual <option>.
                  </Select> // [Línea 672] Cierra el componente visual </Select>.
                </CampoFormulario> // [Línea 673] Cierra el componente visual </CampoFormulario>.

                <CampoFormulario etiqueta="Marca"> // [Línea 675] Abre o renderiza el componente visual <CampoFormulario>.
                  <Select // [Línea 676] Abre o renderiza el componente visual <Select>.
                    // [Línea 677] Ejecuta o evalúa: value={tarjetaMarca}
                    value={tarjetaMarca}
                    // [Línea 678] Ejecuta o evalúa: onChange={(e) => setTarjetaMarca(e.target.value)}
                    onChange={(e) => setTarjetaMarca(e.target.value)}
                  // [Línea 679] Ejecuta o evalúa: >
                  >
                    // [Línea 680] Ejecuta o evalúa: {MARCAS_TARJETA.map((m) => (
                    {MARCAS_TARJETA.map((m) => (
                      <option key={m} value={m}> // [Línea 681] Abre o renderiza el componente visual <option>.
                        // [Línea 682] Ejecuta o evalúa: {m}
                        {m}
                      </option> // [Línea 683] Cierra el componente visual </option>.
                    // [Línea 684] Ejecuta o evalúa: ))}
                    ))}
                  </Select> // [Línea 685] Cierra el componente visual </Select>.
                </CampoFormulario> // [Línea 686] Cierra el componente visual </CampoFormulario>.
              </Grilla> // [Línea 687] Cierra el componente visual </Grilla>.

              <CampoFormulario // [Línea 689] Abre o renderiza el componente visual <CampoFormulario>.
                // [Línea 690] Ejecuta o evalúa: etiqueta="Últimos 4 dígitos"
                etiqueta="Últimos 4 dígitos"
                // [Línea 691] Ejecuta o evalúa: ayuda="Nunca se pide ni se guarda el número completo de la tarjeta."
                ayuda="Nunca se pide ni se guarda el número completo de la tarjeta."
              // [Línea 692] Ejecuta o evalúa: >
              >
                <Input // [Línea 693] Abre o renderiza el componente visual <Input>.
                  // [Línea 694] Ejecuta o evalúa: maxLength={4}
                  maxLength={4}
                  // [Línea 695] Ejecuta o evalúa: value={tarjetaUltimos4}
                  value={tarjetaUltimos4}
                  // [Línea 696] Ejecuta o evalúa: onChange={(e) => setTarjetaUltimos4(e.target.value.replace(/\D/g, ""))}
                  onChange={(e) => setTarjetaUltimos4(e.target.value.replace(/\D/g, ""))}
                  // [Línea 697] Ejecuta o evalúa: placeholder="1234"
                  placeholder="1234"
                  // [Línea 698] Ejecuta o evalúa: className="font-mono"
                  className="font-mono"
                // [Línea 699] Ejecuta o evalúa: />
                />
              </CampoFormulario> // [Línea 700] Cierra el componente visual </CampoFormulario>.
            </Apilar> // [Línea 701] Cierra el componente visual </Apilar>.
          // [Línea 702] Ejecuta o evalúa: )}
          )}

          // [Línea 704] Ejecuta o evalúa: {formaPago === "cuenta_corriente" && clienteSeleccionado && (
          {formaPago === "cuenta_corriente" && clienteSeleccionado && (
            <Apilar className="gap-2 rounded-xl border border-border bg-secondary/30 p-3.5"> // [Línea 705] Abre o renderiza el componente visual <Apilar>.
              <Alinear className="justify-between"> // [Línea 706] Abre o renderiza el componente visual <Alinear>.
                <Texto tamano="xs" tono="suave"> // [Línea 707] Abre o renderiza el componente visual <Texto>.
                  // [Línea 708] Ejecuta o evalúa: Saldo actual:
                  Saldo actual:
                </Texto> // [Línea 709] Cierra el componente visual </Texto>.
                <Texto mono tamano="xs"> // [Línea 710] Abre o renderiza el componente visual <Texto>.
                  // [Línea 711] Ejecuta o evalúa: {formatearMoneda(clienteSeleccionado.saldo)}
                  {formatearMoneda(clienteSeleccionado.saldo)}
                </Texto> // [Línea 712] Cierra el componente visual </Texto>.
              </Alinear> // [Línea 713] Cierra el componente visual </Alinear>.
              <Alinear className="justify-between"> // [Línea 714] Abre o renderiza el componente visual <Alinear>.
                <Texto tamano="xs" tono="suave"> // [Línea 715] Abre o renderiza el componente visual <Texto>.
                  // [Línea 716] Ejecuta o evalúa: Límite de crédito:
                  Límite de crédito:
                </Texto> // [Línea 717] Cierra el componente visual </Texto>.
                <Texto mono tamano="xs"> // [Línea 718] Abre o renderiza el componente visual <Texto>.
                  // [Línea 719] Ejecuta o evalúa: {clienteSeleccionado.limiteCredito !== null
                  {clienteSeleccionado.limiteCredito !== null
                    // [Línea 720] Ejecuta o evalúa: ? formatearMoneda(clienteSeleccionado.limiteCredito)
                    ? formatearMoneda(clienteSeleccionado.limiteCredito)
                    // [Línea 721] Ejecuta o evalúa: : "Sin límite"}
                    : "Sin límite"}
                </Texto> // [Línea 722] Cierra el componente visual </Texto>.
              </Alinear> // [Línea 723] Cierra el componente visual </Alinear>.
              <Alinear className="justify-between border-t border-border pt-2"> // [Línea 724] Abre o renderiza el componente visual <Alinear>.
                <Texto tamano="xs" negrita> // [Línea 725] Abre o renderiza el componente visual <Texto>.
                  // [Línea 726] Ejecuta o evalúa: Nuevo saldo tras la venta:
                  Nuevo saldo tras la venta:
                </Texto> // [Línea 727] Cierra el componente visual </Texto>.
                <Texto // [Línea 728] Abre o renderiza el componente visual <Texto>.
                  // [Línea 729] Ejecuta o evalúa: mono
                  mono
                  // [Línea 730] Ejecuta o evalúa: negrita
                  negrita
                  // [Línea 731] Ejecuta o evalúa: tamano="sm"
                  tamano="sm"
                  // [Línea 732] Ejecuta o evalúa: tono={superaLimiteCredito ? "peligro" : "normal"}
                  tono={superaLimiteCredito ? "peligro" : "normal"}
                // [Línea 733] Ejecuta o evalúa: >
                >
                  // [Línea 734] Ejecuta o evalúa: {formatearMoneda(nuevoSaldoProyectado)}
                  {formatearMoneda(nuevoSaldoProyectado)}
                </Texto> // [Línea 735] Cierra el componente visual </Texto>.
              </Alinear> // [Línea 736] Cierra el componente visual </Alinear>.
              // [Línea 737] Ejecuta o evalúa: {superaLimiteCredito && (
              {superaLimiteCredito && (
                <Texto tamano="xs" tono="peligro" negrita> // [Línea 738] Abre o renderiza el componente visual <Texto>.
                  // [Línea 739] Ejecuta o evalúa: Excede el límite de crédito disponible.
                  Excede el límite de crédito disponible.
                </Texto> // [Línea 740] Cierra el componente visual </Texto>.
              // [Línea 741] Ejecuta o evalúa: )}
              )}
            </Apilar> // [Línea 742] Cierra el componente visual </Apilar>.
          // [Línea 743] Ejecuta o evalúa: )}
          )}

          // [Línea 745] Ejecuta o evalúa: {/* Resumen del Total */}
          {/* Resumen del Total */}
          <Apilar className="gap-1 rounded-xl bg-primary/10 p-4 border border-primary/20"> // [Línea 746] Abre o renderiza el componente visual <Apilar>.
            <Alinear className="justify-between"> // [Línea 747] Abre o renderiza el componente visual <Alinear>.
              <Texto tamano="sm" tono="suave"> // [Línea 748] Abre o renderiza el componente visual <Texto>.
                // [Línea 749] Define o asigna el campo/parámetro 'Renglones'.
                Renglones: {renglonesCompra.length}
              </Texto> // [Línea 750] Cierra el componente visual </Texto>.
              <Texto tamano="sm" tono="suave"> // [Línea 751] Abre o renderiza el componente visual <Texto>.
                // [Línea 752] Define o asigna el campo/parámetro 'Unidades'.
                Unidades: {renglonesCompra.reduce((acc, r) => acc + r.cantidad, 0)}
              </Texto> // [Línea 753] Cierra el componente visual </Texto>.
            </Alinear> // [Línea 754] Cierra el componente visual </Alinear>.
            <Alinear className="justify-between pt-1"> // [Línea 755] Abre o renderiza el componente visual <Alinear>.
              <Texto negrita tamano="base"> // [Línea 756] Abre o renderiza el componente visual <Texto>.
                // [Línea 757] Ejecuta o evalúa: TOTAL A COBRAR
                TOTAL A COBRAR
              </Texto> // [Línea 758] Cierra el componente visual </Texto>.
              <Texto mono negrita tamano="2xl" className="text-primary"> // [Línea 759] Abre o renderiza el componente visual <Texto>.
                // [Línea 760] Ejecuta o evalúa: {formatearMoneda(totalCompra)}
                {formatearMoneda(totalCompra)}
              </Texto> // [Línea 761] Cierra el componente visual </Texto>.
            </Alinear> // [Línea 762] Cierra el componente visual </Alinear>.
          </Apilar> // [Línea 763] Cierra el componente visual </Apilar>.

          <Button // [Línea 765] Abre o renderiza el componente visual <Button>.
            // [Línea 766] Ejecuta o evalúa: size="lg"
            size="lg"
            // [Línea 767] Ejecuta o evalúa: onClick={confirmarVenta}
            onClick={confirmarVenta}
            // [Línea 768] Ejecuta o evalúa: disabled={confirmando || renglonesCompra.length === 0 || superaLimiteCredito}
            disabled={confirmando || renglonesCompra.length === 0 || superaLimiteCredito}
            // [Línea 769] Ejecuta o evalúa: className="w-full"
            className="w-full"
          // [Línea 770] Ejecuta o evalúa: >
          >
            <CheckCircle2 className="size-5" /> // [Línea 771] Abre o renderiza el componente visual <CheckCircle2>.
            // [Línea 772] Ejecuta o evalúa: {confirmando ? "Emitiendo factura..." : "Confirmar y emitir factura"}
            {confirmando ? "Emitiendo factura..." : "Confirmar y emitir factura"}
          </Button> // [Línea 773] Cierra el componente visual </Button>.
        </CardContent> // [Línea 774] Cierra el componente visual </CardContent>.
      </Card> // [Línea 775] Cierra el componente visual </Card>.
    </Grilla> // [Línea 776] Cierra el componente visual </Grilla>.
  // [Línea 777] Cierra el bloque o estructura ();).
  );
// [Línea 778] Cierra el bloque o estructura (}).
}
