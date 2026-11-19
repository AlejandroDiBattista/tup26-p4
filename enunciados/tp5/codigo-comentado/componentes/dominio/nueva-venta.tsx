// ============================================================================
// GUÍA DE ESTUDIO - SEGUNDO PARCIAL: PROGRAMACIÓN IV
// Archivo: componentes/dominio/nueva-venta.tsx
// Código comentado con explicaciones sencillas y claras para la defensa oral.
// ============================================================================

// Directiva 'use client': indica que este componente tiene interactividad en el navegador
"use client";
// Pantalla interactiva de NUEVA VENTA en mostrador (RF-V1 a RF-V6).
// - Tres partes en una sola vista: 1) Comprador, 2) Ítems con búsqueda por teclado, 3) Forma de pago.
// - Soporta navegación completa por teclado en el buscador de productos: ↑ y ↓ eligen y Enter agrega.
// - Alta rápida de cliente en ventana modal sin perder la venta en curso.
// - Confirma llamando a POST /api/facturas (el cliente solo envía ids y cantidades; los precios los calcula el servidor).
import { useState, useRef } from "react";
// Acá importamos funciones de navegación de Next.js (como redirect para cambiar de página)
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
// Acá importamos esquemas de validación
import { MARCAS_TARJETA } from "@/esquemas/facturas";
// Acá importamos formateadores de moneda (pesos argentinos $), fechas y números
import { centavosATextoPesos, formatearMoneda, pesosACentavos } from "@/lib/formato";
// Acá importamos componentes visuales de la interfaz de usuario
import { Button } from "@/componentes/ui/button";
// Acá importamos componentes visuales de la interfaz de usuario
import { Input } from "@/componentes/ui/input";
// Acá importamos componentes visuales de la interfaz de usuario
import { Select } from "@/componentes/ui/select";
// Acá importamos componentes visuales de la interfaz de usuario
import { Badge } from "@/componentes/ui/badge";
// Acá importamos componentes visuales de la interfaz de usuario
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/componentes/ui/card";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/componentes/ui/table";
// Acá importamos componentes visuales de la interfaz de usuario
import { CampoFormulario, CampoImporte } from "@/componentes/comunes/campo-formulario";
// Acá importamos componentes visuales de la interfaz de usuario
import { BotonNuevoCliente } from "@/componentes/dominio/acciones-clientes";
// Acá importamos componentes visuales de la interfaz de usuario
import { Alinear, Apilar, Caja, Grilla, Texto } from "@/componentes/primitivas/maquetacion";
// Acá importamos funciones de la capa de servicios donde reside la lógica de negocio
import type { ProductoPublico } from "@/servicios/productos";
// Acá importamos funciones de la capa de servicios donde reside la lógica de negocio
import type { ClientePublico } from "@/servicios/clientes";

type RenglonVenta = {
  productoId: number;
  codigo: string;
  descripcion: string;
  precioUnitario: number;
  existenciaDisponible: number;
  cantidad: number;
};

// Componente o función exportada 'PantallaNuevaVenta'
export function PantallaNuevaVenta({
  productosIniciales,
  clientesIniciales,
  proximoNumeroInformativo,
}: {
  productosIniciales: ProductoPublico[];
  clientesIniciales: ClientePublico[];
  proximoNumeroInformativo: string;
}) {
  const router = useRouter();

  // Catálogo y clientes en memoria (se actualizan si se da de alta un cliente en el momento).
  const [catalogoProductos] = useState<ProductoPublico[]>(productosIniciales);
  // Definimos una variable de estado React 'listaClientes' para controlar la interfaz
  const [listaClientes, setListaClientes] = useState<ClientePublico[]>(clientesIniciales);

  // 1. Estado del comprador (null = Consumidor final).
  // Definimos una variable de estado React 'clienteSeleccionado' para controlar la interfaz
  const [clienteSeleccionado, setClienteSeleccionado] = useState<ClientePublico | null>(null);
  // Definimos una variable de estado React 'busquedaCliente' para controlar la interfaz
  const [busquedaCliente, setBusquedaCliente] = useState("");

  // 2. Estado de búsqueda de productos y renglones de la compra.
  // Definimos una variable de estado React 'busquedaProducto' para controlar la interfaz
  const [busquedaProducto, setBusquedaProducto] = useState("");
  // Definimos una variable de estado React 'cantidadParaAgregar' para controlar la interfaz
  const [cantidadParaAgregar, setCantidadParaAgregar] = useState("1");
  // Definimos una variable de estado React 'indiceSugerencia' para controlar la interfaz
  const [indiceSugerencia, setIndiceSugerencia] = useState(0);
  // Definimos una variable de estado React 'renglonesCompra' para controlar la interfaz
  const [renglonesCompra, setRenglonesCompra] = useState<RenglonVenta[]>([]);
  const refInputProducto = useRef<HTMLInputElement>(null);

  // 3. Estado de la forma de pago.
  // Definimos una variable de estado React 'formaPago' para controlar la interfaz
  const [formaPago, setFormaPago] = useState<"contado" | "tarjeta" | "cuenta_corriente">("contado");
  // Definimos una variable de estado React 'montoRecibidoTexto' para controlar la interfaz
  const [montoRecibidoTexto, setMontoRecibidoTexto] = useState("");
  // Definimos una variable de estado React 'tarjetaTipo' para controlar la interfaz
  const [tarjetaTipo, setTarjetaTipo] = useState<"debito" | "credito">("debito");
  // Definimos una variable de estado React 'tarjetaMarca' para controlar la interfaz
  const [tarjetaMarca, setTarjetaMarca] = useState<string>(MARCAS_TARJETA[0]);
  // Definimos una variable de estado React 'tarjetaUltimos4' para controlar la interfaz
  const [tarjetaUltimos4, setTarjetaUltimos4] = useState("");

  // Definimos una variable de estado React 'confirmando' para controlar la interfaz
  const [confirmando, setConfirmando] = useState(false);

  // Total de la factura calculado en vivo en cada cambio (RF-V1).
  const totalCompra = renglonesCompra.reduce(
    (acumulado, r) => acumulado + r.precioUnitario * r.cantidad,
    0,
  );

  // Sugerencias de clientes filtradas por nombre o documento.
  const clientesFiltrados = busquedaCliente.trim()
    ? listaClientes
        .filter((c) => {
          const q = busquedaCliente.toLowerCase();
          const qDigitos = busquedaCliente.replace(/\D/g, "");
          // Renderizamos la interfaz visual de este componente:
          return (
            c.nombre.toLowerCase().includes(q) ||
            (qDigitos.length > 0 && c.nroDoc.replace(/\D/g, "").includes(qDigitos))
          );
        })
        .slice(0, 6)
    : [];

  // Sugerencias de productos filtradas por código o descripción.
  const productosFiltrados = busquedaProducto.trim()
    ? catalogoProductos
        .filter((p) => {
          const q = busquedaProducto.toLowerCase();
          // Renderizamos la interfaz visual de este componente:
          return (
            p.activo &&
            (p.codigo.toLowerCase().includes(q) || p.descripcion.toLowerCase().includes(q))
          );
        })
        .slice(0, 8)
    : [];

  // RF-V3 y RF-V4: agrega un producto o suma la cantidad si ya estaba en la venta,
  // verificando no superar la existencia disponible.
  function agregarProductoAVenta(producto: ProductoPublico, cantidadDeseada?: number) {
    const unidades = Math.max(1, Math.floor(cantidadDeseada ?? (Number(cantidadParaAgregar) || 1)));
    // Verificamos si hay suficiente stock disponible para realizar la venta
    if (producto.existencia <= 0) {
      toast.error(`"${producto.descripcion}" no tiene stock disponible.`);
      return;
    }

    const renglonExistente = renglonesCompra.find((r) => r.productoId === producto.id);
    const cantidadFinal = (renglonExistente?.cantidad ?? 0) + unidades;

    // Verificamos si hay suficiente stock disponible para realizar la venta
    if (cantidadFinal > producto.existencia) {
      toast.error(
        `Stock insuficiente de "${producto.descripcion}". Disponible: ${producto.existencia} u.`,
      );
      return;
    }

    if (renglonExistente) {
      setRenglonesCompra((actuales) =>
        actuales.map((r) =>
          r.productoId === producto.id ? { ...r, cantidad: cantidadFinal } : r,
        ),
      );
    } else {
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

    setBusquedaProducto("");
    setCantidadParaAgregar("1");
    setIndiceSugerencia(0);
    refInputProducto.current?.focus();
  }

  function cambiarCantidadRenglon(productoId: number, nuevaCantidad: number) {
    setRenglonesCompra((actuales) =>
      actuales.map((r) => {
        if (r.productoId !== productoId) return r;
        if (nuevaCantidad < 1) return r;
        // Verificamos si hay suficiente stock disponible para realizar la venta
        if (nuevaCantidad > r.existenciaDisponible) {
          toast.error(`Máximo disponible de ${r.codigo}: ${r.existenciaDisponible} unidades.`);
          return { ...r, cantidad: r.existenciaDisponible };
        }
        return { ...r, cantidad: nuevaCantidad };
      }),
    );
  }

  function quitarRenglon(productoId: number) {
    setRenglonesCompra((actuales) => actuales.filter((r) => r.productoId !== productoId));
  }

  // Navegación con teclado en el buscador de productos: ↑ ↓ eligen, Enter agrega (sección 8).
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

  function seleccionarCliente(cliente: ClientePublico | null) {
    setClienteSeleccionado(cliente);
    setBusquedaCliente("");
    // Comprobamos si el registro solicitado existe en el sistema
    if ((!cliente || !cliente.cuentaCorriente) && formaPago === "cuenta_corriente") {
      setFormaPago("contado");
    }
  }

  // Cálculo de vuelto en contado y crédito disponible en cuenta corriente.
  const montoRecibidoCentavos =
    montoRecibidoTexto.trim() === "" ? totalCompra : (pesosACentavos(montoRecibidoTexto) ?? 0);
  const vueltoCentavos = montoRecibidoCentavos - totalCompra;

  const nuevoSaldoProyectado = (clienteSeleccionado?.saldo ?? 0) + totalCompra;
  const superaLimiteCredito =
    formaPago === "cuenta_corriente" &&
    clienteSeleccionado !== null &&
    clienteSeleccionado.limiteCredito !== null &&
    nuevoSaldoProyectado > clienteSeleccionado.limiteCredito;

  // RF-V6: envía la venta a POST /api/facturas para que se procese en una única transacción.
  async function confirmarVenta() {
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
      // Comprobamos si el registro solicitado existe en el sistema
      if (!clienteSeleccionado || !clienteSeleccionado.cuentaCorriente) {
        toast.error("Elegí un cliente habilitado para vender en cuenta corriente.");
        return;
      }
      if (superaLimiteCredito) {
        toast.error("La venta supera el límite de crédito disponible del cliente.");
        return;
      }
    }

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

    setConfirmando(true);
    // Usamos un bloque try/catch para capturar cualquier error y evitar que la aplicación falle
    try {
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
      if (!respuesta.ok) {
        toast.error(json.error?.message ?? "No se pudo confirmar la factura.");
        return;
      }

      toast.success(`Factura ${json.numeroFormateado} emitida con éxito`);
      router.push(`/ventas/${json.id}`);
      router.refresh();
    } finally {
      setConfirmando(false);
    }
  }

  // Renderizamos la interfaz visual de este componente:
  return (
    <Grilla className="grid-cols-1 lg:grid-cols-3 items-start">
      {/* Columna izquierda (2/3): 1) Comprador y 2) Ítems de la venta */}
      <Apilar className="lg:col-span-2 gap-5">
        {/* Parte 1: Comprador (RF-V2) */}
        <Card>
          <CardHeader>
            <Alinear className="justify-between">
              <Apilar className="gap-0.5">
                <CardTitle>1. Comprador</CardTitle>
                <CardDescription>
                  Por defecto es Consumidor final. Podés buscar un cliente o darlo de alta ahora.
                </CardDescription>
              </Apilar>
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

        {/* Parte 2: Ítems de la venta (RF-V3 y RF-V4) */}
        <Card>
          <CardHeader>
            <CardTitle>2. Productos de la venta</CardTitle>
            <CardDescription>
              Buscá por código o descripción. Usá las flechas ↑ ↓ y presioná Enter para agregar con
              el teclado.
            </CardDescription>
          </CardHeader>

          <CardContent className="gap-4">
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

                {productosFiltrados.length > 0 && (
                  <Caja className="absolute z-20 mt-1 w-full rounded-xl border border-border bg-card p-1.5 shadow-xl">
                    {productosFiltrados.map((prod, idx) => {
                      const resaltado = idx === indiceSugerencia;
                      // Renderizamos la interfaz visual de este componente:
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

      {/* Columna derecha (1/3): 3) Forma de pago y Confirmación (RF-V5 y RF-V6) */}
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
          {/* Selector de las 3 formas de pago */}
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

          {/* Datos específicos según la forma de pago elegida */}
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

          {/* Resumen del Total */}
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
