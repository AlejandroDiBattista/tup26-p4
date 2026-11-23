/* ==========================================================================
   COMPONENTE INTERACTIVO DE NUEVA VENTA (TERMINAL PUNTO DE VENTA / MOSTRADOR)
   Cumple con los requisitos funcionales RF-V1 a RF-V6 del sistema de ferretería:
   - RF-V1: Cálculo de subtotales, IVA y total acumulado en tiempo real.
   - RF-V2: Selección ágil de cliente (por defecto Consumidor Final) y alta rápida sin salir.
   - RF-V3: Búsqueda de productos por código o descripción con atajos de teclado (↑, ↓, Enter).
   - RF-V4: Control de stock en vivo: impide vender productos agotados o superar existencias.
   - RF-V5: Selector de forma de pago (Efectivo con cálculo de vuelto, Tarjeta, Cuenta Corriente con tope de crédito).
   - RF-V6: Envío seguro a la API (POST /api/facturas) donde el servidor ejecuta la transacción atómica.
   ========================================================================== */

/* "use client" marca este archivo como un Componente de Cliente en Next.js.
   Es indispensable porque esta pantalla es un Punto de Venta súper interactivo:
   maneja estado local en React (useState), referencias al DOM (useRef), atajos de teclado y llamadas fetch */
"use client";

/* los import son declaraciones que traen componentes, funciones y herramientas externas:
   - useState y useRef de React para manejar el estado dinámico y el foco del cursor
   - useRouter de Next.js para redirigir al usuario al comprobante una vez emitida la factura
   - iconos visuales de lucide-react para ilustrar botones y campos
   - toast de sonner para mostrar alertas flotantes bonitas de éxito o error
   - MARCAS_TARJETA: lista de marcas válidas (Visa, Mastercard, etc.) definida en los esquemas
   - utilidades de formato: centavosATextoPesos, formatearMoneda y pesosACentavos para trabajar importes
   - componentes de interfaz visual (Button, Input, Select, Badge, Card, Table, etc.)
   - tipos de datos TypeScript de productos y clientes */
import { useState, useRef } from "react";
import { useRouter } from "next/navigation";
import {
  Search,
  UserCheck,
  UserX,
  Trash2,
  Plus,
  Minus,
  CheckCircle2,
  Banknote,
  CreditCard,
  BookOpen,
} from "lucide-react";
import { toast } from "sonner";
import { MARCAS_TARJETA } from "@/esquemas/facturas";
import { centavosATextoPesos, formatearMoneda, pesosACentavos } from "@/lib/formato";
import { Button } from "@/componentes/ui/button";
import { Input } from "@/componentes/ui/input";
import { Select } from "@/componentes/ui/select";
import { Badge } from "@/componentes/ui/badge";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/componentes/ui/card";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/componentes/ui/table";
import { CampoFormulario, CampoImporte } from "@/componentes/comunes/campo-formulario";
import { BotonNuevoCliente } from "@/componentes/dominio/acciones-clientes";
import { Alinear, Apilar, Caja, Grilla, Texto } from "@/componentes/primitivas/maquetacion";
import type { ProductoPublico } from "@/servicios/productos";
import type { ClientePublico } from "@/servicios/clientes";

/* definimos el tipo de datos RenglonVenta para representar cada producto cargado en el carrito de compras en memoria */
type RenglonVenta = {
  productoId: number;          /* id único del producto en la base de datos */
  codigo: string;              /* código alfanumérico visible (ej: 'HE-001') */
  descripcion: string;         /* nombre o detalle del producto */
  precioUnitario: number;      /* precio unitario en centavos enteros */
  existenciaDisponible: number;/* stock máximo disponible en el depósito */
  cantidad: number;            /* cantidad de unidades que lleva el cliente */
};

/* exportamos el componente principal PantallaNuevaVenta que recibe como propiedades iniciales:
   - productosIniciales: catálogo de productos activos traídos desde el servidor
   - clientesIniciales: listado de clientes registrados
   - proximoNumeroInformativo: texto con el número preliminar estimado de la factura */
export function PantallaNuevaVenta({
  productosIniciales,
  clientesIniciales,
  proximoNumeroInformativo,
}: {
  productosIniciales: ProductoPublico[];
  clientesIniciales: ClientePublico[];
  proximoNumeroInformativo: string;
}) {
  /* router nos permite navegar programáticamente entre pantallas del lado del cliente */
  const router = useRouter();

  /* guardamos en el estado local el catálogo de productos y clientes para poder agregar nuevos sin recargar la página */
  const [catalogoProductos] = useState<ProductoPublico[]>(productosIniciales);
  const [listaClientes, setListaClientes] = useState<ClientePublico[]>(clientesIniciales);

  /* ----------------------------------------------------------------------
     1. ESTADO DEL COMPRADOR (RF-V2)
     - clienteSeleccionado: objeto con los datos del cliente elegido, o null si es Consumidor Final.
     - busquedaCliente: texto ingresado en el buscador para filtrar clientes por nombre o DNI.
     ---------------------------------------------------------------------- */
  const [clienteSeleccionado, setClienteSeleccionado] = useState<ClientePublico | null>(null);
  const [busquedaCliente, setBusquedaCliente] = useState("");

  /* ----------------------------------------------------------------------
     2. ESTADO DEL BUSCADOR DE PRODUCTOS Y DEL CARRITO DE COMPRA (RF-V3 y RF-V4)
     - busquedaProducto: texto ingresado para buscar por código o descripción.
     - cantidadParaAgregar: cuántas unidades sumar (por defecto "1").
     - indiceSugerencia: posición del producto resaltado en la lista desplegable con las flechas del teclado.
     - renglonesCompra: arreglo con los productos que el cliente va a comprar.
     - refInputProducto: referencia directa al campo de texto para devolverle el foco automáticamente.
     ---------------------------------------------------------------------- */
  const [busquedaProducto, setBusquedaProducto] = useState("");
  const [cantidadParaAgregar, setCantidadParaAgregar] = useState("1");
  const [indiceSugerencia, setIndiceSugerencia] = useState(0);
  const [renglonesCompra, setRenglonesCompra] = useState<RenglonVenta[]>([]);
  const refInputProducto = useRef<HTMLInputElement>(null);

  /* ----------------------------------------------------------------------
     3. ESTADO DE LA FORMA DE PAGO (RF-V5)
     - formaPago: 'contado' (efectivo), 'tarjeta' o 'cuenta_corriente'.
     - montoRecibidoTexto: texto de cuánto dinero entrega el cliente en efectivo.
     - tarjetaTipo, tarjetaMarca, tarjetaUltimos4: datos para el cobro con tarjeta.
     - confirmando: booleano que se pone en true mientras se envía la factura a la API para deshabilitar botones.
     ---------------------------------------------------------------------- */
  const [formaPago, setFormaPago] = useState<"contado" | "tarjeta" | "cuenta_corriente">("contado");
  const [montoRecibidoTexto, setMontoRecibidoTexto] = useState("");
  const [tarjetaTipo, setTarjetaTipo] = useState<"debito" | "credito">("debito");
  const [tarjetaMarca, setTarjetaMarca] = useState<string>(MARCAS_TARJETA[0]);
  const [tarjetaUltimos4, setTarjetaUltimos4] = useState("");
  const [confirmando, setConfirmando] = useState(false);

  /* calculamos el total general de la compra en tiempo real sumando (precioUnitario * cantidad) de cada renglón con .reduce() */
  const totalCompra = renglonesCompra.reduce(
    (acumulado, r) => acumulado + r.precioUnitario * r.cantidad,
    0,
  );

  /* filtramos la lista de clientes en memoria a medida que el usuario tipea su nombre o documento */
  const clientesFiltrados = busquedaCliente.trim()
    ? listaClientes
        .filter((c) => {
          const q = busquedaCliente.toLowerCase();
          const qDigitos = busquedaCliente.replace(/\D/g, "");
          return (
            c.nombre.toLowerCase().includes(q) ||
            (qDigitos.length > 0 && c.nroDoc.replace(/\D/g, "").includes(qDigitos))
          );
        })
        .slice(0, 6) /* limitamos a 6 sugerencias para que no tape la pantalla */
    : [];

  /* filtramos el catálogo de productos activos buscando coincidencias en el código o en la descripción */
  const productosFiltrados = busquedaProducto.trim()
    ? catalogoProductos
        .filter((p) => {
          const q = busquedaProducto.toLowerCase();
          return (
            p.activo &&
            (p.codigo.toLowerCase().includes(q) || p.descripcion.toLowerCase().includes(q))
          );
        })
        .slice(0, 8) /* limitamos a 8 sugerencias */
    : [];

  /* función para agregar un producto seleccionado al carrito de compras:
     - verifica que haya stock disponible (> 0).
     - si el producto ya estaba en la compra, suma las cantidades sin duplicar la fila.
     - valida que la cantidad total no supere la existencia real en depósito.
     - limpia el buscador y devuelve el foco al input para seguir cargando rápido sin usar el mouse */
  function agregarProductoAVenta(producto: ProductoPublico, cantidadDeseada?: number) {
    const unidades = Math.max(1, Math.floor(cantidadDeseada ?? (Number(cantidadParaAgregar) || 1)));
    if (producto.existencia <= 0) {
      toast.error(`"${producto.descripcion}" no tiene stock disponible.`);
      return;
    }

    const renglonExistente = renglonesCompra.find((r) => r.productoId === producto.id);
    const cantidadFinal = (renglonExistente?.cantidad ?? 0) + unidades;

    /* control de stock en cliente: si quiere agregar más de lo que hay, mostramos toast de advertencia */
    if (cantidadFinal > producto.existencia) {
      toast.error(
        `Stock insuficiente de "${producto.descripcion}". Disponible: ${producto.existencia} u.`,
      );
      return;
    }

    if (renglonExistente) {
      /* si ya existía el producto en la tabla, actualizamos únicamente su cantidad */
      setRenglonesCompra((actuales) =>
        actuales.map((r) =>
          r.productoId === producto.id ? { ...r, cantidad: cantidadFinal } : r,
        ),
      );
    } else {
      /* si es un producto nuevo en la venta, creamos un nuevo renglón */
      setRenglonesCompra((actuales) => [
        ...actuales,
        {
          productoId: producto.id,
          codigo: producto.codigo,
          descripcion: producto.descripcion,
          precioUnitario: producto.precio,
          existenciaDisponible: producto.existencia,
          cantidad: unidades,
        },
      ]);
    }

    /* reseteamos los campos del buscador y enfocamos el cursor nuevamente */
    setBusquedaProducto("");
    setCantidadParaAgregar("1");
    setIndiceSugerencia(0);
    refInputProducto.current?.focus();
  }

  /* función para modificar directamente la cantidad de un producto ya cargado en la tabla */
  function cambiarCantidadRenglon(productoId: number, nuevaCantidad: number) {
    setRenglonesCompra((actuales) =>
      actuales.map((r) => {
        if (r.productoId !== productoId) return r;
        if (nuevaCantidad < 1) return r;
        /* si intenta poner más unidades del stock disponible, lo topamos al máximo permitido */
        if (nuevaCantidad > r.existenciaDisponible) {
          toast.error(`Máximo disponible de ${r.codigo}: ${r.existenciaDisponible} unidades.`);
          return { ...r, cantidad: r.existenciaDisponible };
        }
        return { ...r, cantidad: nuevaCantidad };
      }),
    );
  }

  /* elimina un renglón del carrito según el id del producto usando .filter() */
  function quitarRenglon(productoId: number) {
    setRenglonesCompra((actuales) => actuales.filter((r) => r.productoId !== productoId));
  }

  /* navegación ágil por teclado en el buscador de productos:
     - Flecha abajo (ArrowDown): baja una posición en la lista de sugerencias.
     - Flecha arriba (ArrowUp): sube una posición.
     - Enter: selecciona e inserta el producto destacado de forma inmediata sin tocar el mouse */
  function manejarTecladoBuscador(e: React.KeyboardEvent<HTMLInputElement>) {
    if (productosFiltrados.length === 0) return;

    if (e.key === "ArrowDown") {
      e.preventDefault();
      setIndiceSugerencia((actual) => (actual + 1) % productosFiltrados.length);
    } else if (e.key === "ArrowUp") {
      e.preventDefault();
      setIndiceSugerencia(
        (actual) => (actual - 1 + productosFiltrados.length) % productosFiltrados.length,
      );
    } else if (e.key === "Enter") {
      e.preventDefault();
      const elegido = productosFiltrados[indiceSugerencia] ?? productosFiltrados[0];
      if (elegido) agregarProductoAVenta(elegido);
    }
  }

  /* asigna el cliente seleccionado y valida si se debe reajustar la forma de pago */
  function seleccionarCliente(cliente: ClientePublico | null) {
    setClienteSeleccionado(cliente);
    setBusquedaCliente("");
    /* si el cliente no tiene cuenta corriente y esa opción estaba seleccionada, volvemos a contado */
    if ((!cliente || !cliente.cuentaCorriente) && formaPago === "cuenta_corriente") {
      setFormaPago("contado");
    }
  }

  /* cálculo del vuelto en efectivo:
     convertimos el texto a centavos; si está vacío, asumimos que pagó el total exacto */
  const montoRecibidoCentavos =
    montoRecibidoTexto.trim() === "" ? totalCompra : (pesosACentavos(montoRecibidoTexto) ?? 0);
  const vueltoCentavos = montoRecibidoCentavos - totalCompra;

  /* cálculo de proyección de cuenta corriente:
     evaluamos si sumando esta compra la deuda del cliente superaría su límite de crédito autorizado */
  const nuevoSaldoProyectado = (clienteSeleccionado?.saldo ?? 0) + totalCompra;
  const superaLimiteCredito =
    formaPago === "cuenta_corriente" &&
    clienteSeleccionado !== null &&
    clienteSeleccionado.limiteCredito !== null &&
    nuevoSaldoProyectado > clienteSeleccionado.limiteCredito;

  /* ==========================================================================
     RF-V6: CONFIRMAR Y EMITIR FACTURA
     Envía la orden de compra a la ruta POST /api/facturas.
     Importante: el cliente solo envía los id de los productos y sus cantidades;
     los precios oficiales los toma el servidor directamente de la base de datos para máxima seguridad.
     ========================================================================== */
  async function confirmarVenta() {
    /* validaciones preventivas en el frontend antes de disparar la petición HTTP */
    if (renglonesCompra.length === 0) {
      toast.error("Agregá al menos un producto a la venta.");
      return;
    }

    if (formaPago === "contado" && montoRecibidoCentavos < totalCompra) {
      toast.error("El monto recibido en efectivo no alcanza para cubrir el total.");
      return;
    }

    if (formaPago === "tarjeta" && !/^\d{4}$/.test(tarjetaUltimos4)) {
      toast.error("Ingresá los últimos 4 dígitos de la tarjeta.");
      return;
    }

    if (formaPago === "cuenta_corriente") {
      if (!clienteSeleccionado || !clienteSeleccionado.cuentaCorriente) {
        toast.error("Elegí un cliente habilitado para vender en cuenta corriente.");
        return;
      }
      if (superaLimiteCredito) {
        toast.error("La venta supera el límite de crédito disponible del cliente.");
        return;
      }
    }

    /* armamos el objeto de pago según la opción seleccionada */
    const cuerpoPago =
      formaPago === "contado"
        ? { forma: "contado", montoRecibido: montoRecibidoCentavos }
        : formaPago === "tarjeta"
          ? {
              forma: "tarjeta",
              tarjeta: {
                tipo: tarjetaTipo,
                marca: tarjetaMarca,
                ultimos4: tarjetaUltimos4,
              },
            }
          : { forma: "cuenta_corriente" };

    /* activamos el indicador de carga */
    setConfirmando(true);
    try {
      /* enviamos la solicitud POST a la API con los datos en formato JSON */
      const respuesta = await fetch("/api/facturas", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          clienteId: clienteSeleccionado ? clienteSeleccionado.id : null,
          items: renglonesCompra.map((r) => ({
            productoId: r.productoId,
            cantidad: r.cantidad,
          })),
          pago: cuerpoPago,
        }),
      });

      const json = await respuesta.json();
      
      /* si el servidor devolvió un error (ej: falta de stock o límite excedido), mostramos la alerta */
      if (!respuesta.ok) {
        toast.error(json.error?.message ?? "No se pudo confirmar la factura.");
        return;
      }

      /* si la venta fue exitosa, notificamos y redirigimos a la pantalla de detalle e impresión */
      toast.success(`Factura ${json.numeroFormateado} emitida con éxito`);
      router.push(`/ventas/${json.id}`);
      router.refresh();
    } finally {
      setConfirmando(false);
    }
  }

  return (
    /* grilla principal responsiva: 2 columnas a la izquierda para comprador y productos, y 1 columna a la derecha para cobro */
    <Grilla className="grid-cols-1 lg:grid-cols-3 items-start">
      {/* Columna izquierda (2/3 de pantalla): 1) Comprador y 2) Ítems de la venta */}
      <Apilar className="lg:col-span-2 gap-5">
        
        {/* PARTE 1: SELECCIÓN DEL COMPRADOR (RF-V2) */}
        <Card>
          <CardHeader>
            <Alinear className="justify-between">
              <Apilar className="gap-0.5">
                <CardTitle>1. Comprador</CardTitle>
                <CardDescription>
                  Por defecto es Consumidor final. Podés buscar un cliente o darlo de alta ahora.
                </CardDescription>
              </Apilar>
              {/* botón para registrar un cliente nuevo al instante sin perder los productos ya cargados */}
              <BotonNuevoCliente
                textoBoton="Alta rápida de cliente"
                alCrear={(nuevoCliente) => {
                  setListaClientes((prev) => [nuevoCliente, ...prev]);
                  seleccionarCliente(nuevoCliente);
                }}
              />
            </Alinear>
          </CardHeader>

          <CardContent>
            {clienteSeleccionado ? (
              /* vista cuando hay un cliente asignado con sus insignias de cuenta corriente y límites */
              <Alinear className="justify-between rounded-xl border border-emerald-200 bg-emerald-50/70 p-3.5">
                <Alinear className="gap-3">
                  <UserCheck className="size-5 text-emerald-700" />
                  <Apilar className="gap-0.5">
                    <Alinear className="gap-2">
                      <Texto negrita>{clienteSeleccionado.nombre}</Texto>
                      <Badge variant="outline">
                        {clienteSeleccionado.tipoDoc} {clienteSeleccionado.nroDoc}
                      </Badge>
                      {clienteSeleccionado.cuentaCorriente ? (
                        <Badge variant="success">Cta. cte. habilitada</Badge>
                      ) : (
                        <Badge variant="secondary">Sin cta. cte.</Badge>
                      )}
                    </Alinear>
                    {clienteSeleccionado.cuentaCorriente && (
                      <Texto tamano="xs" tono="suave">
                        Saldo actual: {formatearMoneda(clienteSeleccionado.saldo)} ·{" "}
                        {clienteSeleccionado.limiteCredito !== null
                          ? `Límite: ${formatearMoneda(clienteSeleccionado.limiteCredito)} (Disponible: ${formatearMoneda(clienteSeleccionado.disponible)})`
                          : "Sin tope de crédito"}
                      </Texto>
                    )}
                  </Apilar>
                </Alinear>

                {/* botón para desvincular el cliente y volver a Consumidor final */}
                <Button
                  variant="outline"
                  size="xs"
                  onClick={() => seleccionarCliente(null)}
                >
                  <UserX className="size-3.5" />
                  Pasar a Consumidor final
                </Button>
              </Alinear>
            ) : (
              /* vista cuando es Consumidor final con el campo de búsqueda de clientes */
              <Apilar className="gap-2">
                <Alinear className="justify-between rounded-lg border border-border bg-secondary/40 px-3 py-2">
                  <Texto tamano="sm">
                    Comprador actual: <Texto negrita>Consumidor final</Texto>
                  </Texto>
                  <Badge variant="secondary">Contado / Tarjeta</Badge>
                </Alinear>

                <Caja className="relative">
                  <Search className="pointer-events-none absolute top-1/2 left-3 size-4 -translate-y-1/2 text-muted-foreground" />
                  <Input
                    value={busquedaCliente}
                    onChange={(e) => setBusquedaCliente(e.target.value)}
                    placeholder="Buscar cliente registrado por nombre, DNI o CUIT..."
                    className="pl-9"
                  />

                  {/* lista desplegable flotante con las coincidencias de clientes */}
                  {clientesFiltrados.length > 0 && (
                    <Caja className="absolute z-20 mt-1 w-full rounded-xl border border-border bg-card p-1.5 shadow-lg">
                      {clientesFiltrados.map((c) => (
                        <button
                          key={c.id}
                          type="button"
                          onClick={() => seleccionarCliente(c)}
                          className="flex w-full items-center justify-between rounded-lg px-3 py-2 text-left text-sm hover:bg-secondary cursor-pointer"
                        >
                          <Apilar className="gap-0">
                            <Texto negrita>{c.nombre}</Texto>
                            <Texto tamano="xs" tono="suave">
                              {c.tipoDoc} {c.nroDoc}
                            </Texto>
                          </Apilar>
                          <Alinear className="gap-2">
                            {c.cuentaCorriente && (
                              <Badge variant="success">Cta. Cte.</Badge>
                            )}
                            <Texto mono tamano="xs">
                              Saldo: {formatearMoneda(c.saldo)}
                            </Texto>
                          </Alinear>
                        </button>
                      ))}
                    </Caja>
                  )}
                </Caja>
              </Apilar>
            )}
          </CardContent>
        </Card>

        {/* PARTE 2: ÍTEMS DE LA VENTA (RF-V3 Y RF-V4) */}
        <Card>
          <CardHeader>
            <CardTitle>2. Productos de la venta</CardTitle>
            <CardDescription>
              Buscá por código o descripción. Usá las flechas ↑ ↓ y presioná Enter para agregar con
              el teclado.
            </CardDescription>
          </CardHeader>

          <CardContent className="gap-4">
            {/* barra de búsqueda y selector de cantidad rápida */}
            <Alinear className="gap-2 items-end">
              <Caja className="relative flex-1 min-w-56">
                <Search className="pointer-events-none absolute top-1/2 left-3 size-4 -translate-y-1/2 text-muted-foreground" />
                <Input
                  ref={refInputProducto}
                  value={busquedaProducto}
                  onChange={(e) => {
                    setBusquedaProducto(e.target.value);
                    setIndiceSugerencia(0);
                  }}
                  onKeyDown={manejarTecladoBuscador}
                  placeholder="Escribí código (ej. HE-001) o descripción (ej. Martillo) y pulsá Enter..."
                  className="pl-9"
                  autoFocus
                />

                {/* menú flotante con las sugerencias de productos coincidentes */}
                {productosFiltrados.length > 0 && (
                  <Caja className="absolute z-20 mt-1 w-full rounded-xl border border-border bg-card p-1.5 shadow-xl">
                    {productosFiltrados.map((prod, idx) => {
                      const resaltado = idx === indiceSugerencia;
                      return (
                        <button
                          key={prod.id}
                          type="button"
                          onClick={() => agregarProductoAVenta(prod)}
                          className={`flex w-full items-center justify-between rounded-lg px-3 py-2 text-left text-sm cursor-pointer ${
                            resaltado ? "bg-accent text-accent-foreground font-medium" : "hover:bg-secondary"
                          }`}
                        >
                          <Alinear className="gap-2">
                            <Badge variant="outline" className="font-mono">
                              {prod.codigo}
                            </Badge>
                            <Texto>{prod.descripcion}</Texto>
                          </Alinear>
                          <Alinear className="gap-3">
                            <Badge
                              variant={
                                prod.existencia === 0
                                  ? "destructive"
                                  : prod.bajoMinimo
                                    ? "warning"
                                    : "secondary"
                              }
                            >
                              Stock: {prod.existencia}
                            </Badge>
                            <Texto mono negrita>
                              {formatearMoneda(prod.precio)}
                            </Texto>
                          </Alinear>
                        </button>
                      );
                    })}
                  </Caja>
                )}
              </Caja>

              {/* campo para ingresar cantidad antes de presionar Enter */}
              <Caja className="w-24">
                <Input
                  type="number"
                  min={1}
                  aria-label="Cantidad"
                  value={cantidadParaAgregar}
                  onChange={(e) => setCantidadParaAgregar(e.target.value)}
                  onKeyDown={manejarTecladoBuscador}
                />
              </Caja>
            </Alinear>

            {/* tabla de productos agregados al carrito */}
            {renglonesCompra.length === 0 ? (
              <Caja className="rounded-xl border border-dashed border-border py-10 text-center">
                <Texto tono="suave">
                  Todavía no agregaste productos. Buscá arriba por código o descripción.
                </Texto>
              </Caja>
            ) : (
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Código</TableHead>
                    <TableHead>Descripción</TableHead>
                    <TableHead className="text-center">Cantidad</TableHead>
                    <TableHead className="text-right">Precio unit.</TableHead>
                    <TableHead className="text-right">Subtotal</TableHead>
                    <TableHead className="text-right">Quitar</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {renglonesCompra.map((renglon) => (
                    <TableRow key={renglon.productoId}>
                      <TableCell className="font-mono text-xs">{renglon.codigo}</TableCell>
                      <TableCell>
                        <Apilar className="gap-0">
                          <Texto negrita>{renglon.descripcion}</Texto>
                          <Texto tamano="xs" tono="suave">
                            Disponible: {renglon.existenciaDisponible} u.
                          </Texto>
                        </Apilar>
                      </TableCell>
                      {/* columna de cantidad con botones rápidos de más (+) y menos (-) */}
                      <TableCell>
                        <Alinear className="justify-center gap-1">
                          <Button
                            variant="outline"
                            size="xs"
                            onClick={() =>
                              cambiarCantidadRenglon(renglon.productoId, renglon.cantidad - 1)
                            }
                            disabled={renglon.cantidad <= 1}
                          >
                            <Minus className="size-3" />
                          </Button>
                          <Input
                            type="number"
                            min={1}
                            max={renglon.existenciaDisponible}
                            value={renglon.cantidad}
                            onChange={(e) =>
                              cambiarCantidadRenglon(
                                renglon.productoId,
                                Number(e.target.value) || 1,
                              )
                            }
                            className="w-16 text-center font-mono"
                          />
                          <Button
                            variant="outline"
                            size="xs"
                            onClick={() =>
                              cambiarCantidadRenglon(renglon.productoId, renglon.cantidad + 1)
                            }
                            disabled={renglon.cantidad >= renglon.existenciaDisponible}
                          >
                            <Plus className="size-3" />
                          </Button>
                        </Alinear>
                      </TableCell>
                      <TableCell className="text-right font-mono">
                        {formatearMoneda(renglon.precioUnitario)}
                      </TableCell>
                      <TableCell className="text-right font-mono font-semibold">
                        {formatearMoneda(renglon.precioUnitario * renglon.cantidad)}
                      </TableCell>
                      {/* botón para quitar el ítem completo */}
                      <TableCell className="text-right">
                        <Button
                          variant="ghost"
                          size="xs"
                          onClick={() => quitarRenglon(renglon.productoId)}
                          aria-label="Quitar renglón"
                        >
                          <Trash2 className="size-4 text-red-600" />
                        </Button>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            )}
          </CardContent>
        </Card>
      </Apilar>

      {/* Columna derecha (1/3 de pantalla): 3) Forma de pago y Confirmación (RF-V5 y RF-V6) */}
      <Card className="sticky top-20">
        <CardHeader>
          <Alinear className="justify-between">
            <CardTitle>3. Pago y confirmación</CardTitle>
            <Badge variant="outline" className="font-mono">
              Nº est. {proximoNumeroInformativo}
            </Badge>
          </Alinear>
          <CardDescription>Elegí una forma de pago para emitir el comprobante.</CardDescription>
        </CardHeader>

        <CardContent className="gap-4">
          {/* selector visual de las 3 formas de pago disponibles */}
          <Grilla className="grid-cols-3 gap-2">
            <Button
              variant={formaPago === "contado" ? "default" : "outline"}
              size="sm"
              onClick={() => {
                setFormaPago("contado");
                setMontoRecibidoTexto(centavosATextoPesos(totalCompra));
              }}
              className="flex-col h-auto py-2.5 gap-1"
            >
              <Banknote className="size-4" />
              <Texto tamano="xs">Contado</Texto>
            </Button>

            <Button
              variant={formaPago === "tarjeta" ? "default" : "outline"}
              size="sm"
              onClick={() => setFormaPago("tarjeta")}
              className="flex-col h-auto py-2.5 gap-1"
            >
              <CreditCard className="size-4" />
              <Texto tamano="xs">Tarjeta</Texto>
            </Button>

            <Button
              variant={formaPago === "cuenta_corriente" ? "default" : "outline"}
              size="sm"
              disabled={!clienteSeleccionado || !clienteSeleccionado.cuentaCorriente}
              title={
                !clienteSeleccionado
                  ? "Seleccioná un cliente registrado para habilitar cuenta corriente"
                  : !clienteSeleccionado.cuentaCorriente
                    ? "Este cliente no tiene cuenta corriente habilitada"
                    : undefined
              }
              onClick={() => setFormaPago("cuenta_corriente")}
              className="flex-col h-auto py-2.5 gap-1"
            >
              <BookOpen className="size-4" />
              <Texto tamano="xs">Cta. Cte.</Texto>
            </Button>
          </Grilla>

          {/* campos específicos para pago en efectivo: monto entregado y vuelto calculado en vivo */}
          {formaPago === "contado" && (
            <Apilar className="gap-3 rounded-xl border border-border bg-secondary/30 p-3.5">
              <CampoImporte
                etiqueta="Monto recibido en efectivo"
                valorTexto={montoRecibidoTexto}
                alCambiar={setMontoRecibidoTexto}
                placeholder={centavosATextoPesos(totalCompra) || "0,00"}
                ayuda="Si se deja vacío se toma el total exacto"
              />
              <Alinear className="justify-between border-t border-border pt-2">
                <Texto tamano="sm" tono="suave">
                  Vuelto a entregar:
                </Texto>
                <Texto
                  mono
                  negrita
                  tono={vueltoCentavos < 0 ? "peligro" : "exito"}
                >
                  {vueltoCentavos < 0
                    ? `Faltan ${formatearMoneda(-vueltoCentavos)}`
                    : formatearMoneda(vueltoCentavos)}
                </Texto>
              </Alinear>
            </Apilar>
          )}

          {/* campos específicos para pago con tarjeta: débito/crédito, marca y últimos 4 dígitos */}
          {formaPago === "tarjeta" && (
            <Apilar className="gap-3 rounded-xl border border-border bg-secondary/30 p-3.5">
              <Grilla className="grid-cols-2 gap-2">
                <CampoFormulario etiqueta="Tipo">
                  <Select
                    value={tarjetaTipo}
                    onChange={(e) => setTarjetaTipo(e.target.value as "debito" | "credito")}
                  >
                    <option value="debito">Débito</option>
                    <option value="credito">Crédito</option>
                  </Select>
                </CampoFormulario>

                <CampoFormulario etiqueta="Marca">
                  <Select
                    value={tarjetaMarca}
                    onChange={(e) => setTarjetaMarca(e.target.value)}
                  >
                    {MARCAS_TARJETA.map((m) => (
                      <option key={m} value={m}>
                        {m}
                      </option>
                    ))}
                  </Select>
                </CampoFormulario>
              </Grilla>

              <CampoFormulario
                etiqueta="Últimos 4 dígitos"
                ayuda="Nunca se pide ni se guarda el número completo de la tarjeta."
              >
                <Input
                  maxLength={4}
                  value={tarjetaUltimos4}
                  onChange={(e) => setTarjetaUltimos4(e.target.value.replace(/\D/g, ""))}
                  placeholder="1234"
                  className="font-mono"
                />
              </CampoFormulario>
            </Apilar>
          )}

          {/* información de cuenta corriente y control de límite de crédito */}
          {formaPago === "cuenta_corriente" && clienteSeleccionado && (
            <Apilar className="gap-2 rounded-xl border border-border bg-secondary/30 p-3.5">
              <Alinear className="justify-between">
                <Texto tamano="xs" tono="suave">
                  Saldo actual:
                </Texto>
                <Texto mono tamano="xs">
                  {formatearMoneda(clienteSeleccionado.saldo)}
                </Texto>
              </Alinear>
              <Alinear className="justify-between">
                <Texto tamano="xs" tono="suave">
                  Límite de crédito:
                </Texto>
                <Texto mono tamano="xs">
                  {clienteSeleccionado.limiteCredito !== null
                    ? formatearMoneda(clienteSeleccionado.limiteCredito)
                    : "Sin límite"}
                </Texto>
              </Alinear>
              <Alinear className="justify-between border-t border-border pt-2">
                <Texto tamano="xs" negrita>
                  Nuevo saldo tras la venta:
                </Texto>
                <Texto
                  mono
                  negrita
                  tamano="sm"
                  tono={superaLimiteCredito ? "peligro" : "normal"}
                >
                  {formatearMoneda(nuevoSaldoProyectado)}
                </Texto>
              </Alinear>
              {superaLimiteCredito && (
                <Texto tamano="xs" tono="peligro" negrita>
                  Excede el límite de crédito disponible.
                </Texto>
              )}
            </Apilar>
          )}

          {/* resumen general con cantidad de renglones, unidades y total final */}
          <Apilar className="gap-1 rounded-xl bg-primary/10 p-4 border border-primary/20">
            <Alinear className="justify-between">
              <Texto tamano="sm" tono="suave">
                Renglones: {renglonesCompra.length}
              </Texto>
              <Texto tamano="sm" tono="suave">
                Unidades: {renglonesCompra.reduce((acc, r) => acc + r.cantidad, 0)}
              </Texto>
            </Alinear>
            <Alinear className="justify-between pt-1">
              <Texto negrita tamano="base">
                TOTAL A COBRAR
              </Texto>
              <Texto mono negrita tamano="2xl" className="text-primary">
                {formatearMoneda(totalCompra)}
              </Texto>
            </Alinear>
          </Apilar>

          {/* botón principal de confirmación que dispara la transacción atómica en el backend */}
          <Button
            size="lg"
            onClick={confirmarVenta}
            disabled={confirmando || renglonesCompra.length === 0 || superaLimiteCredito}
            className="w-full"
          >
            <CheckCircle2 className="size-5" />
            {confirmando ? "Emitiendo factura..." : "Confirmar y emitir factura"}
          </Button>
        </CardContent>
      </Card>
    </Grilla>
  );
}
