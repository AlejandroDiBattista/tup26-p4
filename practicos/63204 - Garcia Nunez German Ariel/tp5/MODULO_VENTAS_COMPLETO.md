# Módulo de Ventas Completo - Sistema de Gestión Comercial

> **Ferretería El Yunque** · TP5 / Segundo Parcial Programación IV
> En este documento se recopila el **100% del código fuente íntegro** de todos los archivos que componen el módulo de ventas, exactamente con la misma distribución y nombres de carpetas que en el proyecto.

## 📁 Estructura del Módulo en el Proyecto

```text
tp5/
├── app/
│   ├── (sistema)/
│   │   └── ventas/
│   │       ├── nueva/
│   │       │   └── page.tsx        <-- Pantalla de mostrador (Server Component)
│   │       ├── page.tsx            <-- Listado general de facturas con filtros
│   │       └── [id]/
│   │           └── page.tsx        <-- Detalle de factura y vista de impresión
│   └── api/
│       └── facturas/
│           ├── route.ts            <-- GET (listar) y POST (emitir factura)
│           ├── proximo-numero/
│           │   └── route.ts        <-- GET /api/facturas/proximo-numero
│           └── [id]/
│               ├── route.ts        <-- GET /api/facturas/{id}
│               └── anulacion/
│                   └── route.ts    <-- POST /api/facturas/{id}/anulacion
├── componentes/
│   └── dominio/
│       ├── nueva-venta.tsx         <-- Componente interactivo del Punto de Venta (778 líneas)
│       └── modal-anular-factura.tsx <-- Modal interactivo de anulación con motivo
├── esquemas/
│   └── facturas.ts                 <-- Esquemas de validación Zod (frontend y backend)
└── servicios/
    └── facturas.ts                 <-- Lógica de negocio y transacciones Drizzle (548 líneas)
```

---

## 📄 Archivo: `app/(sistema)/ventas/nueva/page.tsx`

**Ubicación:** `app/(sistema)/ventas/nueva/page.tsx`  

```tsx
// Pantalla de NUEVA VENTA (/ventas/nueva). RF-V1 a RF-V6.
import Link from "next/link";
import { FileText } from "lucide-react";
import { exigirUsuarioPagina } from "@/lib/sesion";
import { listarProductos } from "@/servicios/productos";
import { listarClientes } from "@/servicios/clientes";
import { obtenerProximoNumeroFactura } from "@/servicios/facturas";
import { Button } from "@/componentes/ui/button";
import { EncabezadoPagina } from "@/componentes/comunes/encabezado-pagina";
import { PantallaNuevaVenta } from "@/componentes/dominio/nueva-venta";
import { Pagina } from "@/componentes/primitivas/maquetacion";

export default async function PaginaNuevaVenta() {
  const usuario = await exigirUsuarioPagina();
  const [catalogo, clientes, proximo] = await Promise.all([
    listarProductos(usuario, { pageSize: "100", activo: "true" }),
    listarClientes(usuario, { pageSize: "100", activo: "true" }),
    obtenerProximoNumeroFactura(usuario),
  ]);

  return (
    <Pagina>
      <EncabezadoPagina
        titulo="Nueva venta de mostrador"
        subtitulo="Identificá al comprador, agregá los productos y seleccioná la forma de pago"
        acciones={
          <Link href="/ventas">
            <Button variant="outline">
              <FileText className="size-4" />
              Ver facturas emitidas
            </Button>
          </Link>
        }
      />

      <PantallaNuevaVenta
        productosIniciales={catalogo.data}
        clientesIniciales={clientes.data}
        proximoNumeroInformativo={proximo.numeroFormateado}
      />
    </Pagina>
  );
}

```

---

## 📄 Archivo: `app/(sistema)/ventas/page.tsx`

**Ubicación:** `app/(sistema)/ventas/page.tsx`  

```tsx
// Pantalla de LISTADO DE FACTURAS (/ventas). RF-V8.
import Link from "next/link";
import { ShoppingCart, Eye } from "lucide-react";
import { db } from "@/basedatos/conexion";
import { usuarios } from "@/basedatos/esquema";
import { exigirUsuarioPagina } from "@/lib/sesion";
import { listarFacturas } from "@/servicios/facturas";
import { listarClientes } from "@/servicios/clientes";
import { formatearFechaHora, formatearMoneda } from "@/lib/formato";
import { Button } from "@/componentes/ui/button";
import { Card } from "@/componentes/ui/card";
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
import { InsigniaEstadoFactura, InsigniaFormaPago } from "@/componentes/comunes/insignias";
import { Paginador } from "@/componentes/comunes/paginador";
import { EstadoVacio } from "@/componentes/comunes/estados";
import { Alinear, Pagina, Texto } from "@/componentes/primitivas/maquetacion";

type Props = { searchParams: Promise<Record<string, string | undefined>> };

export default async function PaginaFacturas({ searchParams }: Props) {
  const usuario = await exigirUsuarioPagina();
  const parametros = await searchParams;

  const [listado, clientesRes, listaVendedores] = await Promise.all([
    listarFacturas(usuario, parametros),
    listarClientes(usuario, { pageSize: "100" }),
    db.select({ id: usuarios.id, nombre: usuarios.nombre }).from(usuarios),
  ]);

  return (
    <Pagina>
      <EncabezadoPagina
        titulo="Facturas"
        subtitulo="Historial de comprobantes emitidos y anulados"
        acciones={
          <Link href="/ventas/nueva">
            <Button>
              <ShoppingCart className="size-4" />
              Nueva venta
            </Button>
          </Link>
        }
      />

      <BarraFiltrosUrl
        placeholderBusqueda="Buscar por número o nombre del cliente..."
        filtros={[
          { nombre: "desde", etiqueta: "Desde fecha", tipo: "fecha" },
          { nombre: "hasta", etiqueta: "Hasta fecha", tipo: "fecha" },
          {
            nombre: "clienteId",
            etiqueta: "Todos los clientes",
            opciones: clientesRes.data.map((c) => ({ valor: String(c.id), texto: c.nombre })),
          },
          {
            nombre: "forma",
            etiqueta: "Todas las formas de pago",
            opciones: [
              { valor: "contado", texto: "Contado" },
              { valor: "tarjeta", texto: "Tarjeta" },
              { valor: "cuenta_corriente", texto: "Cuenta corriente" },
            ],
          },
          {
            nombre: "vendedorId",
            etiqueta: "Todos los vendedores",
            opciones: listaVendedores.map((v) => ({ valor: String(v.id), texto: v.nombre })),
          },
          {
            nombre: "estado",
            etiqueta: "Todos los estados",
            opciones: [
              { valor: "emitida", texto: "Emitidas" },
              { valor: "anulada", texto: "Anuladas" },
            ],
          },
        ]}
      />

      <Card className="p-3 bg-secondary/40">
        <Alinear className="justify-between">
          <Texto tamano="sm" tono="suave">
            Total emitido según filtros actuales ({listado.total} comprobantes):
          </Texto>
          <Texto mono negrita tamano="base" className="text-primary">
            {formatearMoneda(listado.totalEmitido)}
          </Texto>
        </Alinear>
      </Card>

      {listado.data.length === 0 ? (
        <EstadoVacio
          titulo="No se encontraron facturas"
          descripcion="Probá cambiando el rango de fechas o los filtros seleccionados."
        />
      ) : (
        <>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Número</TableHead>
                <TableHead>Fecha y hora</TableHead>
                <TableHead>Cliente</TableHead>
                <TableHead>Vendedor</TableHead>
                <TableHead>Forma de pago</TableHead>
                <TableHead>Estado</TableHead>
                <TableHead className="text-right">Total</TableHead>
                <TableHead className="text-right">Comprobante</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {listado.data.map((fac) => (
                <TableRow key={fac.id}>
                  <TableCell className="font-mono font-medium">
                    <Link
                      href={`/ventas/${fac.id}`}
                      className="hover:text-primary hover:underline"
                    >
                      {fac.numeroFormateado}
                    </Link>
                  </TableCell>
                  <TableCell className="text-xs text-muted-foreground">
                    {formatearFechaHora(fac.fecha)}
                  </TableCell>
                  <TableCell>
                    {fac.cliente ? (
                      <Link
                        href={`/clientes/${fac.cliente.id}`}
                        className="font-medium hover:text-primary hover:underline"
                      >
                        {fac.cliente.nombre}
                      </Link>
                    ) : (
                      <Texto tono="suave">Consumidor final</Texto>
                    )}
                  </TableCell>
                  <TableCell>{fac.vendedor.nombre}</TableCell>
                  <TableCell>
                    <InsigniaFormaPago forma={fac.formaPago} />
                  </TableCell>
                  <TableCell>
                    <InsigniaEstadoFactura estado={fac.estado} />
                  </TableCell>
                  <TableCell className="text-right font-mono font-semibold">
                    {formatearMoneda(fac.total)}
                  </TableCell>
                  <TableCell className="text-right">
                    <Link href={`/ventas/${fac.id}`}>
                      <Button variant="outline" size="xs">
                        <Eye className="size-3.5" />
                        Ver
                      </Button>
                    </Link>
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

```

---

## 📄 Archivo: `app/(sistema)/ventas/[id]/page.tsx`

**Ubicación:** `app/(sistema)/ventas/[id]/page.tsx`  

```tsx
// Pantalla de COMPROBANTE DE FACTURA (/ventas/[id]). RF-V7 y RF-V9.
// - Vista imprimible con datos del comercio, número, fecha y hora, vendedor, comprador,
//   detalle de renglones, total y forma de pago.
// - Si está anulada muestra el aviso con fecha, usuario y motivo.
// - Si el usuario es administrador y la factura está emitida, muestra el botón Anular factura.
import Link from "next/link";
import { ArrowLeft, Ban, Store } from "lucide-react";
import { exigirUsuarioPagina } from "@/lib/sesion";
import { obtenerFactura } from "@/servicios/facturas";
import { formatearFechaHora, formatearMoneda, NOMBRES_FORMA_PAGO } from "@/lib/formato";
import { Button } from "@/componentes/ui/button";
import { Card } from "@/componentes/ui/card";
import { Separator } from "@/componentes/ui/select";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/componentes/ui/table";
import { EncabezadoPagina } from "@/componentes/comunes/encabezado-pagina";
import { InsigniaEstadoFactura } from "@/componentes/comunes/insignias";
import { BotonImprimir } from "@/componentes/comunes/boton-imprimir";
import { BotonAnularFactura } from "@/componentes/dominio/modal-anular-factura";
import { Alinear, Apilar, Caja, Grilla, Pagina, Texto, Titulo } from "@/componentes/primitivas/maquetacion";

type Props = { params: Promise<{ id: string }> };

export default async function PaginaDetalleFactura({ params }: Props) {
  const usuario = await exigirUsuarioPagina();
  const { id } = await params;
  const factura = await obtenerFactura(usuario, Number(id));

  return (
    <Pagina>
      <EncabezadoPagina
        titulo={`Factura ${factura.numeroFormateado}`}
        subtitulo={`Emitida el ${formatearFechaHora(factura.fecha)} por ${factura.vendedor.nombre}`}
        acciones={
          <Alinear className="gap-2">
            <Link href="/ventas">
              <Button variant="outline">
                <ArrowLeft className="size-4" />
                Volver a facturas
              </Button>
            </Link>
            <BotonImprimir />
            {usuario.rol === "admin" && factura.estado === "emitida" && (
              <BotonAnularFactura
                idFactura={factura.id}
                numeroFormateado={factura.numeroFormateado}
              />
            )}
          </Alinear>
        }
      />

      {/* Aviso de factura anulada (regla 5 y RF-V9) */}
      {"anulacion" in factura && factura.anulacion && (
        <Card className="border-red-300 bg-red-50 p-4">
          <Alinear className="gap-3">
            <Ban className="size-5 text-red-600 shrink-0" />
            <Apilar className="gap-0.5">
              <Texto tono="peligro" negrita>
                FACTURA ANULADA · {formatearFechaHora(factura.anulacion.fecha)}
                {factura.anulacion.usuario ? ` por ${factura.anulacion.usuario.nombre}` : ""}
              </Texto>
              <Texto tamano="sm" tono="peligro">
                Motivo: {factura.anulacion.motivo}
              </Texto>
            </Apilar>
          </Alinear>
        </Card>
      )}

      {/* Comprobante imprimible */}
      <Card className="p-6 md:p-8 max-w-4xl">
        <Alinear className="justify-between items-start gap-4">
          <Alinear className="gap-3">
            <Caja className="flex size-11 items-center justify-center rounded-xl bg-primary text-primary-foreground">
              <Store className="size-6" />
            </Caja>
            <Apilar className="gap-0.5">
              <Titulo nivel={2}>Ferretería El Yunque</Titulo>
              <Texto tamano="xs" tono="suave">
                Av. Belgrano 1850 · San Miguel de Tucumán · Tel: (0381) 432-1100
              </Texto>
              <Texto tamano="xs" tono="suave">
                Comprobante interno de venta (no válido como factura fiscal)
              </Texto>
            </Apilar>
          </Alinear>

          <Apilar className="items-end gap-1">
            <Alinear className="gap-2">
              <Texto mono negrita tamano="lg">
                Nº {factura.numeroFormateado}
              </Texto>
              <InsigniaEstadoFactura estado={factura.estado} />
            </Alinear>
            <Texto tamano="xs" tono="suave">
              Fecha y hora: {formatearFechaHora(factura.fecha)}
            </Texto>
            <Texto tamano="xs" tono="suave">
              Atendió: {factura.vendedor.nombre}
            </Texto>
          </Apilar>
        </Alinear>

        <Separator />

        {/* Datos del comprador y forma de pago */}
        <Grilla className="grid-cols-1 sm:grid-cols-2">
          <Apilar className="gap-1">
            <Texto tamano="xs" tono="suave" negrita>
              DATOS DEL COMPRADOR
            </Texto>
            {factura.cliente ? (
              <>
                <Texto negrita>{factura.cliente.nombre}</Texto>
                <Texto tamano="xs" tono="suave">
                  {factura.cliente.tipoDoc}: {factura.cliente.nroDoc}
                </Texto>
                {factura.cliente.domicilio && (
                  <Texto tamano="xs" tono="suave">
                    Domicilio: {factura.cliente.domicilio}
                  </Texto>
                )}
              </>
            ) : (
              <Texto negrita>Consumidor final</Texto>
            )}
          </Apilar>

          <Apilar className="gap-1">
            <Texto tamano="xs" tono="suave" negrita>
              CONDICIÓN Y FORMA DE PAGO
            </Texto>
            <Texto negrita>{NOMBRES_FORMA_PAGO[factura.pago.forma]}</Texto>
            {factura.pago.forma === "contado" && (
              <Texto tamano="xs" tono="suave">
                Recibido: {formatearMoneda(factura.pago.montoRecibido)} · Vuelto:{" "}
                {formatearMoneda(factura.pago.vuelto)}
              </Texto>
            )}
            {factura.pago.forma === "tarjeta" && (
              <Texto tamano="xs" tono="suave">
                Tarjeta de {factura.pago.tarjeta.tipo === "debito" ? "débito" : "crédito"}{" "}
                {factura.pago.tarjeta.marca} terminada en {factura.pago.tarjeta.ultimos4}
              </Texto>
            )}
            {factura.pago.forma === "cuenta_corriente" && "saldoCliente" in factura && (
              <Texto tamano="xs" tono="suave">
                Cargado en cuenta corriente · Saldo actual del cliente:{" "}
                {formatearMoneda(factura.saldoCliente)}
              </Texto>
            )}
          </Apilar>
        </Grilla>

        {/* Detalle de renglones */}
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Código</TableHead>
              <TableHead>Descripción</TableHead>
              <TableHead className="text-right">Cant.</TableHead>
              <TableHead className="text-right">Precio unit.</TableHead>
              <TableHead className="text-right">Subtotal</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {factura.items.map((item) => (
              <TableRow key={item.productoId}>
                <TableCell className="font-mono text-xs">{item.codigo}</TableCell>
                <TableCell className="font-medium">{item.descripcion}</TableCell>
                <TableCell className="text-right font-mono">{item.cantidad}</TableCell>
                <TableCell className="text-right font-mono">
                  {formatearMoneda(item.precioUnitario)}
                </TableCell>
                <TableCell className="text-right font-mono font-semibold">
                  {formatearMoneda(item.subtotal)}
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>

        <Alinear className="justify-end border-t border-border pt-4">
          <Alinear className="gap-6">
            <Texto negrita tamano="base">
              TOTAL
            </Texto>
            <Texto mono negrita tamano="2xl" className="text-primary">
              {formatearMoneda(factura.total)}
            </Texto>
          </Alinear>
        </Alinear>
      </Card>
    </Pagina>
  );
}

```

---

## 📄 Archivo: `componentes/dominio/nueva-venta.tsx`

**Ubicación:** `componentes/dominio/nueva-venta.tsx`  

```tsx
"use client";
// Pantalla interactiva de NUEVA VENTA en mostrador (RF-V1 a RF-V6).
// - Tres partes en una sola vista: 1) Comprador, 2) Ítems con búsqueda por teclado, 3) Forma de pago.
// - Soporta navegación completa por teclado en el buscador de productos: ↑ y ↓ eligen y Enter agrega.
// - Alta rápida de cliente en ventana modal sin perder la venta en curso.
// - Confirma llamando a POST /api/facturas (el cliente solo envía ids y cantidades; los precios los calcula el servidor).
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

type RenglonVenta = {
  productoId: number;
  codigo: string;
  descripcion: string;
  precioUnitario: number;
  existenciaDisponible: number;
  cantidad: number;
};

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
  const [listaClientes, setListaClientes] = useState<ClientePublico[]>(clientesIniciales);

  // 1. Estado del comprador (null = Consumidor final).
  const [clienteSeleccionado, setClienteSeleccionado] = useState<ClientePublico | null>(null);
  const [busquedaCliente, setBusquedaCliente] = useState("");

  // 2. Estado de búsqueda de productos y renglones de la compra.
  const [busquedaProducto, setBusquedaProducto] = useState("");
  const [cantidadParaAgregar, setCantidadParaAgregar] = useState("1");
  const [indiceSugerencia, setIndiceSugerencia] = useState(0);
  const [renglonesCompra, setRenglonesCompra] = useState<RenglonVenta[]>([]);
  const refInputProducto = useRef<HTMLInputElement>(null);

  // 3. Estado de la forma de pago.
  const [formaPago, setFormaPago] = useState<"contado" | "tarjeta" | "cuenta_corriente">("contado");
  const [montoRecibidoTexto, setMontoRecibidoTexto] = useState("");
  const [tarjetaTipo, setTarjetaTipo] = useState<"debito" | "credito">("debito");
  const [tarjetaMarca, setTarjetaMarca] = useState<string>(MARCAS_TARJETA[0]);
  const [tarjetaUltimos4, setTarjetaUltimos4] = useState("");

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
    if (producto.existencia <= 0) {
      toast.error(`"${producto.descripcion}" no tiene stock disponible.`);
      return;
    }

    const renglonExistente = renglonesCompra.find((r) => r.productoId === producto.id);
    const cantidadFinal = (renglonExistente?.cantidad ?? 0) + unidades;

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

```

---

## 📄 Archivo: `componentes/dominio/modal-anular-factura.tsx`

**Ubicación:** `componentes/dominio/modal-anular-factura.tsx`  

```tsx
"use client";
// Modal para anular una factura emitida (RF-V9, solo administrador, motivo obligatorio).
// Al confirmar revierte el stock de todos los renglones y acredita la cuenta corriente si corresponde.
import { useState } from "react";
import { Ban } from "lucide-react";
import { accionAnularFactura } from "@/acciones/comercial";
import { esquemaAnulacion } from "@/esquemas/facturas";
import { usarFormulario } from "@/hooks/usar-formulario";
import { Button } from "@/componentes/ui/button";
import { Textarea } from "@/componentes/ui/select";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/componentes/ui/dialog";
import { CampoFormulario } from "@/componentes/comunes/campo-formulario";

export function BotonAnularFactura({
  idFactura,
  numeroFormateado,
}: {
  idFactura: number;
  numeroFormateado: string;
}) {
  const [abierto, setAbierto] = useState(false);
  const [motivoAnulacion, setMotivoAnulacion] = useState("");

  const { errores, enviando, enviar, limpiarErrores } = usarFormulario({
    esquema: esquemaAnulacion,
    accion: (datos) => accionAnularFactura(idFactura, datos),
    mensajeExito: `Factura ${numeroFormateado} anulada correctamente`,
    alTerminar: () => setAbierto(false),
  });

  function abrir() {
    limpiarErrores();
    setMotivoAnulacion("");
    setAbierto(true);
  }

  function manejarSubmit(e: React.FormEvent) {
    e.preventDefault();
    enviar({ motivo: motivoAnulacion });
  }

  return (
    <>
      <Button variant="destructive" onClick={abrir} className="no-imprimir">
        <Ban className="size-4" />
        Anular factura
      </Button>

      <Dialog open={abierto} onOpenChange={setAbierto}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Anular factura {numeroFormateado}</DialogTitle>
            <DialogDescription>
              Esta acción es irreversible: reingresará las unidades al stock y, si fue en cuenta
              corriente, acreditará el importe en el saldo del cliente. La factura quedará visible
              con estado Anulada.
            </DialogDescription>
          </DialogHeader>

          <form onSubmit={manejarSubmit} className="flex flex-col gap-4">
            <CampoFormulario etiqueta="Motivo de anulación (obligatorio)" error={errores.motivo}>
              <Textarea
                value={motivoAnulacion}
                onChange={(e) => setMotivoAnulacion(e.target.value)}
                placeholder="Ej. Error en la carga de cantidades / Devolución en mostrador"
                autoFocus
              />
            </CampoFormulario>

            <DialogFooter>
              <Button variant="outline" onClick={() => setAbierto(false)}>
                Cancelar
              </Button>
              <Button type="submit" variant="destructive" disabled={enviando}>
                {enviando ? "Anulando..." : "Confirmar anulación"}
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>
    </>
  );
}

```

---

## 📄 Archivo: `esquemas/facturas.ts`

**Ubicación:** `esquemas/facturas.ts`  

```ts
// Esquemas de validación de facturas (venta y anulación).
// El cliente NUNCA manda precios ni totales: solo productos y cantidades.
import { z } from "zod";

export const FORMAS_PAGO = ["contado", "tarjeta", "cuenta_corriente"] as const;
export const MARCAS_TARJETA = ["Visa", "Mastercard", "American Express", "Cabal", "Naranja"] as const;

// Datos de la tarjeta: solo tipo, marca y últimos 4 dígitos (regla 9).
// Es strict: si llega un campo "numero" con la tarjeta completa, se rechaza con 422.
const esquemaTarjeta = z.strictObject({
  tipo: z.enum(["debito", "credito"], "Elegí débito o crédito."),
  marca: z.string().trim().min(1, "Elegí la marca."),
  ultimos4: z.string().regex(/^\d{4}$/, "Deben ser exactamente 4 dígitos."),
});

// La forma de pago define qué datos extra se piden.
const esquemaPagoFactura = z.discriminatedUnion("forma", [
  z.strictObject({
    forma: z.literal("contado"),
    montoRecibido: z.number().int().positive("El monto debe ser mayor que cero.").optional(),
  }),
  z.strictObject({
    forma: z.literal("tarjeta"),
    tarjeta: esquemaTarjeta,
  }),
  z.strictObject({
    forma: z.literal("cuenta_corriente"),
  }),
]);

const esquemaItem = z.strictObject({
  productoId: z.number().int().positive(),
  cantidad: z.number().int("La cantidad debe ser entera.").positive("La cantidad debe ser mayor que cero."),
});

// POST /api/facturas
export const esquemaFacturaNueva = z.strictObject({
  clienteId: z.number().int().positive().nullable(), // null = consumidor final
  items: z
    .array(esquemaItem)
    .min(1, "La venta debe tener al menos un producto.")
    .refine(
      (items) => new Set(items.map((item) => item.productoId)).size === items.length,
      "Hay productos repetidos.",
    ),
  pago: esquemaPagoFactura,
});

// POST /api/facturas/{id}/anulacion
export const esquemaAnulacion = z.strictObject({
  motivo: z.string("El motivo es obligatorio.").trim().min(1, "El motivo es obligatorio."),
});

export type DatosFacturaNueva = z.infer<typeof esquemaFacturaNueva>;

```

---

## 📄 Archivo: `servicios/facturas.ts`

**Ubicación:** `servicios/facturas.ts`  

```ts
// Servicio de FACTURAS (ventas, consulta y anulación).
// RF-V1 a RF-V9. Reglas 1, 2, 3, 4, 5, 6, 7 y 9.
import { and, count, desc, eq, gte, inArray, like, lte, or, sql } from "drizzle-orm";
import { db, type Conexion } from "@/basedatos/conexion";
import {
  clientes,
  facturaItems,
  facturas,
  movimientosCuenta,
  productos,
  usuarios,
} from "@/basedatos/esquema";
import { esquemaAnulacion, esquemaFacturaNueva } from "@/esquemas/facturas";
import {
  finDelDia,
  formatearDocumento,
  formatearNumeroFactura,
  inicioDelDia,
  PUNTO_DE_VENTA,
} from "@/lib/formato";
import { ApiError, noEncontrado } from "./errores";
import {
  exigirAdmin,
  leerPaginacion,
  respuestaPaginada,
  validar,
  type UsuarioSesion,
} from "./comunes";
import { moverStock } from "./stock";
import { saldoDeCliente } from "./clientes";

// RF-V1: devuelve el próximo número informativo para mostrar en la pantalla de Nueva venta.
// El número definitivo se asigna recién al confirmar dentro de la transacción (regla 4).
export async function obtenerProximoNumeroFactura(_usuario: UsuarioSesion) {
  const proximo = await calcularProximoNumero(db);
  return {
    puntoVenta: PUNTO_DE_VENTA,
    numero: proximo,
    numeroFormateado: formatearNumeroFactura(PUNTO_DE_VENTA, proximo),
  };
}

// RF-V1 a RF-V6: emite una factura completa en UNA SOLA TRANSACCIÓN ATÓMICA.
// Si cualquier paso falla, no se graba ni factura, ni descuento de stock, ni deuda.
export async function emitirFactura(
  usuarioVendedor: UsuarioSesion,
  datosSinValidar: unknown,
  opciones: { fecha?: Date } = {},
) {
  const compraCliente = validar(esquemaFacturaNueva, datosSinValidar);

  const idFacturaCreada = await db.transaction(async (tx) => {
    // Paso 1: buscar todos los productos pedidos y verificar que existan y estén activos.
    const idsProductosPedidos = compraCliente.items.map((item) => item.productoId);
    const productosEncontrados = await tx
      .select()
      .from(productos)
      .where(inArray(productos.id, idsProductosPedidos));

    const mapaProductos = new Map(productosEncontrados.map((prod) => [prod.id, prod]));

    for (const itemPedido of compraCliente.items) {
      const productoCatalogo = mapaProductos.get(itemPedido.productoId);
      if (!productoCatalogo) throw noEncontrado(`El producto #${itemPedido.productoId}`);
      if (!productoCatalogo.activo) {
        throw new ApiError(
          422,
          "PRODUCTO_INACTIVO",
          `El producto "${productoCatalogo.descripcion}" está dado de baja y no se puede vender.`,
        );
      }
    }

    // Paso 2: verificar al cliente comprador y las reglas de cuenta corriente (regla 6).
    let clienteComprador = null;
    if (compraCliente.clienteId !== null) {
      clienteComprador = await tx
        .select()
        .from(clientes)
        .where(eq(clientes.id, compraCliente.clienteId))
        .get();
      if (!clienteComprador || !clienteComprador.activo) {
        throw noEncontrado("El cliente");
      }
    }

    if (compraCliente.pago.forma === "cuenta_corriente") {
      if (!clienteComprador || !clienteComprador.cuentaCorriente) {
        throw new ApiError(
          422,
          "CUENTA_CORRIENTE_NO_HABILITADA",
          "Para vender en cuenta corriente el comprador debe ser un cliente registrado y habilitado.",
        );
      }
    }

    // Paso 3: comprobar que la existencia alcance para todos los renglones (regla 1).
    const faltantesDeStock = [];
    for (const itemPedido of compraCliente.items) {
      const productoCatalogo = mapaProductos.get(itemPedido.productoId)!;
      if (productoCatalogo.existencia < itemPedido.cantidad) {
        faltantesDeStock.push({
          productoId: productoCatalogo.id,
          codigo: productoCatalogo.codigo,
          descripcion: productoCatalogo.descripcion,
          solicitado: itemPedido.cantidad,
          disponible: productoCatalogo.existencia,
        });
      }
    }
    if (faltantesDeStock.length > 0) {
      throw new ApiError(
        409,
        "STOCK_INSUFICIENTE",
        "No hay existencia suficiente para completar la venta.",
        faltantesDeStock,
      );
    }

    // Paso 4: congelar el precio actual del catálogo y calcular subtotales y total (regla 3).
    const renglonesCalculados = compraCliente.items.map((itemPedido) => {
      const productoCatalogo = mapaProductos.get(itemPedido.productoId)!;
      const precioUnitario = productoCatalogo.precio;
      const subtotalRenglon = precioUnitario * itemPedido.cantidad;
      return {
        productoId: productoCatalogo.id,
        codigo: productoCatalogo.codigo,
        descripcion: productoCatalogo.descripcion,
        cantidad: itemPedido.cantidad,
        precioUnitario,
        subtotal: subtotalRenglon,
      };
    });

    const totalFactura = renglonesCalculados.reduce((suma, r) => suma + r.subtotal, 0);

    // Paso 5: validar el monto recibido (en contado) o el límite de crédito (en cuenta corriente).
    let montoRecibidoContado: number | null = null;
    if (compraCliente.pago.forma === "contado") {
      montoRecibidoContado = compraCliente.pago.montoRecibido ?? totalFactura;
      if (montoRecibidoContado < totalFactura) {
        throw new ApiError(
          422,
          "MONTO_INSUFICIENTE",
          "El monto recibido no alcanza para cubrir el total de la venta.",
        );
      }
    }

    if (compraCliente.pago.forma === "cuenta_corriente" && clienteComprador) {
      const saldoActualCliente = await saldoDeCliente(tx, clienteComprador.id);
      const nuevoSaldoCliente = saldoActualCliente + totalFactura;
      if (
        clienteComprador.limiteCredito !== null &&
        nuevoSaldoCliente > clienteComprador.limiteCredito
      ) {
        const excedente = nuevoSaldoCliente - clienteComprador.limiteCredito;
        throw new ApiError(
          422,
          "LIMITE_CREDITO_EXCEDIDO",
          "La venta supera el límite de crédito disponible del cliente.",
          [
            {
              saldoActual: saldoActualCliente,
              limite: clienteComprador.limiteCredito,
              excedente,
            },
          ],
        );
      }
    }

    // Paso 6: asignar el próximo número correlativo sin huecos (regla 4).
    const numeroAsignado = await calcularProximoNumero(tx);
    const fechaEmision = opciones.fecha ?? new Date();
    const numeroFormateado = formatearNumeroFactura(PUNTO_DE_VENTA, numeroAsignado);

    // Paso 7: insertar la cabecera de la factura y sus renglones con precios congelados.
    const datosTarjeta =
      compraCliente.pago.forma === "tarjeta" ? compraCliente.pago.tarjeta : null;

    const [facturaInsertada] = await tx
      .insert(facturas)
      .values({
        puntoVenta: PUNTO_DE_VENTA,
        numero: numeroAsignado,
        fecha: fechaEmision,
        clienteId: compraCliente.clienteId,
        usuarioId: usuarioVendedor.id,
        total: totalFactura,
        formaPago: compraCliente.pago.forma,
        montoRecibido: montoRecibidoContado,
        tarjetaTipo: datosTarjeta ? datosTarjeta.tipo : null,
        tarjetaMarca: datosTarjeta ? datosTarjeta.marca : null,
        tarjetaUltimos4: datosTarjeta ? datosTarjeta.ultimos4 : null,
        estado: "emitida",
      })
      .returning();

    await tx.insert(facturaItems).values(
      renglonesCalculados.map((renglon) => ({
        facturaId: facturaInsertada.id,
        productoId: renglon.productoId,
        codigo: renglon.codigo,
        descripcion: renglon.descripcion,
        cantidad: renglon.cantidad,
        precioUnitario: renglon.precioUnitario,
        subtotal: renglon.subtotal,
      })),
    );

    // Paso 8: descontar la existencia de cada producto de forma atómica con moverStock (reglas 1 y 2).
    for (const renglon of renglonesCalculados) {
      await moverStock(tx, {
        productoId: renglon.productoId,
        cantidad: -renglon.cantidad,
        tipo: "venta",
        motivo: `Venta ${numeroFormateado}`,
        usuarioId: usuarioVendedor.id,
        facturaId: facturaInsertada.id,
        fecha: fechaEmision,
      });
    }

    // Paso 9: si la venta es en cuenta corriente, registrar el débito en la cuenta del cliente.
    if (compraCliente.pago.forma === "cuenta_corriente" && clienteComprador) {
      await tx.insert(movimientosCuenta).values({
        clienteId: clienteComprador.id,
        facturaId: facturaInsertada.id,
        pagoId: null,
        tipo: "debito",
        importe: totalFactura,
        descripcion: `Factura ${numeroFormateado}`,
        fecha: fechaEmision,
      });
    }

    return facturaInsertada.id;
  });

  return obtenerFactura(usuarioVendedor, idFacturaCreada);
}

// RF-V9: anula una factura (solo administrador, motivo obligatorio). Regla 5.
// Reingresa el stock y, si fue en cuenta corriente, registra un crédito en la cuenta del cliente.
export async function anularFactura(
  usuarioAdmin: UsuarioSesion,
  idFactura: number,
  datosSinValidar: unknown,
  opciones: { fecha?: Date } = {},
) {
  exigirAdmin(usuarioAdmin);
  const datosAnulacion = validar(esquemaAnulacion, datosSinValidar);

  await db.transaction(async (tx) => {
    const facturaExistente = await tx
      .select()
      .from(facturas)
      .where(eq(facturas.id, idFactura))
      .get();

    if (!facturaExistente) throw noEncontrado("La factura");
    if (facturaExistente.estado === "anulada") {
      throw new ApiError(409, "FACTURA_ANULADA", "La factura ya se encuentra anulada.");
    }

    const fechaAnulacion = opciones.fecha ?? new Date();
    const numeroFormateado = formatearNumeroFactura(
      facturaExistente.puntoVenta,
      facturaExistente.numero,
    );

    // 1. Marcar la factura como anulada conservando su historial.
    await tx
      .update(facturas)
      .set({
        estado: "anulada",
        motivoAnulacion: datosAnulacion.motivo,
        fechaAnulacion,
        usuarioAnulacionId: usuarioAdmin.id,
      })
      .where(eq(facturas.id, idFactura));

    // 2. Reingresar la existencia de cada renglón con un movimiento de tipo "anulacion".
    const renglones = await tx
      .select()
      .from(facturaItems)
      .where(eq(facturaItems.facturaId, idFactura));

    for (const renglon of renglones) {
      await moverStock(tx, {
        productoId: renglon.productoId,
        cantidad: renglon.cantidad, // positivo: vuelve a entrar al stock
        tipo: "anulacion",
        motivo: `Anulación ${numeroFormateado}: ${datosAnulacion.motivo}`,
        usuarioId: usuarioAdmin.id,
        facturaId: idFactura,
        fecha: fechaAnulacion,
      });
    }

    // 3. Si la venta fue en cuenta corriente, acreditar el importe en la cuenta del cliente.
    if (
      facturaExistente.formaPago === "cuenta_corriente" &&
      facturaExistente.clienteId !== null
    ) {
      await tx.insert(movimientosCuenta).values({
        clienteId: facturaExistente.clienteId,
        facturaId: idFactura,
        pagoId: null,
        tipo: "credito",
        importe: facturaExistente.total,
        descripcion: `Anulación factura ${numeroFormateado}`,
        fecha: fechaAnulacion,
      });
    }
  });

  return obtenerFactura(usuarioAdmin, idFactura);
}

type FiltrosFacturas = {
  q?: string;
  desde?: string;
  hasta?: string;
  clienteId?: string;
  vendedorId?: string;
  forma?: string;
  estado?: string;
  page?: string;
  pageSize?: string;
};

// RF-V8: listado paginado de facturas con filtros y suma del total emitido.
export async function listarFacturas(_usuario: UsuarioSesion, parametros: FiltrosFacturas) {
  const { pagina, tamanoPagina, salto } = leerPaginacion(parametros);

  const condiciones = [];
  if (parametros.desde) condiciones.push(gte(facturas.fecha, inicioDelDia(parametros.desde)));
  if (parametros.hasta) condiciones.push(lte(facturas.fecha, finDelDia(parametros.hasta)));
  if (parametros.clienteId) condiciones.push(eq(facturas.clienteId, Number(parametros.clienteId)));
  if (parametros.vendedorId) condiciones.push(eq(facturas.usuarioId, Number(parametros.vendedorId)));
  if (
    parametros.forma === "contado" ||
    parametros.forma === "tarjeta" ||
    parametros.forma === "cuenta_corriente"
  ) {
    condiciones.push(eq(facturas.formaPago, parametros.forma));
  }
  if (parametros.estado === "emitida" || parametros.estado === "anulada") {
    condiciones.push(eq(facturas.estado, parametros.estado));
  }
  if (parametros.q) {
    const textoBuscado = parametros.q.trim();
    const soloDigitos = Number(textoBuscado.replace(/\D/g, ""));
    if (!Number.isNaN(soloDigitos) && soloDigitos > 0) {
      condiciones.push(
        or(
          eq(facturas.numero, soloDigitos),
          like(clientes.nombre, `%${textoBuscado}%`),
        ),
      );
    } else {
      condiciones.push(like(clientes.nombre, `%${textoBuscado}%`));
    }
  }

  const filtro = and(...condiciones);

  const filas = await db
    .select({
      factura: facturas,
      nombreCliente: clientes.nombre,
      tipoDocCliente: clientes.tipoDoc,
      nroDocCliente: clientes.nroDoc,
      nombreVendedor: usuarios.nombre,
    })
    .from(facturas)
    .leftJoin(clientes, eq(facturas.clienteId, clientes.id))
    .innerJoin(usuarios, eq(facturas.usuarioId, usuarios.id))
    .where(filtro)
    .orderBy(desc(facturas.fecha), desc(facturas.id))
    .limit(tamanoPagina)
    .offset(salto);

  const [{ total }] = await db
    .select({ total: count() })
    .from(facturas)
    .leftJoin(clientes, eq(facturas.clienteId, clientes.id))
    .where(filtro);

  // Suma de las facturas EMITIDAS que cumplen con el filtro actual.
  const filtroEmitidas = and(filtro, eq(facturas.estado, "emitida"));
  const [{ totalEmitido }] = await db
    .select({ totalEmitido: sql<number>`coalesce(sum(${facturas.total}), 0)` })
    .from(facturas)
    .leftJoin(clientes, eq(facturas.clienteId, clientes.id))
    .where(filtroEmitidas);

  const datos = filas.map((fila) => ({
    id: fila.factura.id,
    puntoVenta: fila.factura.puntoVenta,
    numero: fila.factura.numero,
    numeroFormateado: formatearNumeroFactura(fila.factura.puntoVenta, fila.factura.numero),
    fecha: fila.factura.fecha.toISOString(),
    estado: fila.factura.estado,
    cliente:
      fila.factura.clienteId && fila.nombreCliente
        ? {
            id: fila.factura.clienteId,
            nombre: fila.nombreCliente,
            tipoDoc: fila.tipoDocCliente!,
            nroDoc: formatearDocumento(fila.tipoDocCliente!, fila.nroDocCliente!),
          }
        : null,
    vendedor: { id: fila.factura.usuarioId, nombre: fila.nombreVendedor },
    total: fila.factura.total,
    formaPago: fila.factura.formaPago,
  }));

  return {
    ...respuestaPaginada(datos, pagina, tamanoPagina, total),
    totalEmitido: Number(totalEmitido),
  };
}

// RF-V7: obtiene una factura completa con sus renglones, forma de pago y datos de anulación.
export async function obtenerFactura(_usuario: UsuarioSesion, idFactura: number) {
  const fila = await db
    .select({
      factura: facturas,
      nombreCliente: clientes.nombre,
      tipoDocCliente: clientes.tipoDoc,
      nroDocCliente: clientes.nroDoc,
      domicilioCliente: clientes.domicilio,
      nombreVendedor: usuarios.nombre,
    })
    .from(facturas)
    .leftJoin(clientes, eq(facturas.clienteId, clientes.id))
    .innerJoin(usuarios, eq(facturas.usuarioId, usuarios.id))
    .where(eq(facturas.id, idFactura))
    .get();

  if (!fila) throw noEncontrado("La factura");

  const { factura } = fila;
  const renglones = await db
    .select()
    .from(facturaItems)
    .where(eq(facturaItems.facturaId, idFactura));

  // Si es pago contado devolvemos montoRecibido y vuelto; si es tarjeta, los datos seguros.
  let detallePago:
    | { forma: "contado"; montoRecibido: number; vuelto: number }
    | {
        forma: "tarjeta";
        tarjeta: { tipo: "debito" | "credito"; marca: string; ultimos4: string };
      }
    | { forma: "cuenta_corriente" };

  if (factura.formaPago === "contado") {
    const recibido = factura.montoRecibido ?? factura.total;
    detallePago = {
      forma: "contado",
      montoRecibido: recibido,
      vuelto: recibido - factura.total,
    };
  } else if (factura.formaPago === "tarjeta") {
    detallePago = {
      forma: "tarjeta",
      tarjeta: {
        tipo: factura.tarjetaTipo ?? "debito",
        marca: factura.tarjetaMarca ?? "Visa",
        ultimos4: factura.tarjetaUltimos4 ?? "0000",
      },
    };
  } else {
    detallePago = { forma: "cuenta_corriente" };
  }

  let datosAnulacion = null;
  if (factura.estado === "anulada") {
    let usuarioAnulacion = null;
    if (factura.usuarioAnulacionId) {
      const filaAdmin = await db
        .select({ id: usuarios.id, nombre: usuarios.nombre })
        .from(usuarios)
        .where(eq(usuarios.id, factura.usuarioAnulacionId))
        .get();
      if (filaAdmin) usuarioAnulacion = filaAdmin;
    }
    datosAnulacion = {
      fecha: (factura.fechaAnulacion ?? factura.fecha).toISOString(),
      motivo: factura.motivoAnulacion ?? "",
      usuario: usuarioAnulacion,
    };
  }

  const respuestaBase = {
    id: factura.id,
    puntoVenta: factura.puntoVenta,
    numero: factura.numero,
    numeroFormateado: formatearNumeroFactura(factura.puntoVenta, factura.numero),
    fecha: factura.fecha.toISOString(),
    estado: factura.estado,
    cliente:
      factura.clienteId && fila.nombreCliente
        ? {
            id: factura.clienteId,
            nombre: fila.nombreCliente,
            tipoDoc: fila.tipoDocCliente!,
            nroDoc: formatearDocumento(fila.tipoDocCliente!, fila.nroDocCliente!),
            domicilio: fila.domicilioCliente,
          }
        : null,
    vendedor: { id: factura.usuarioId, nombre: fila.nombreVendedor },
    items: renglones.map((r) => ({
      productoId: r.productoId,
      codigo: r.codigo,
      descripcion: r.descripcion,
      cantidad: r.cantidad,
      precioUnitario: r.precioUnitario,
      subtotal: r.subtotal,
    })),
    total: factura.total,
    pago: detallePago,
    ...(datosAnulacion ? { anulacion: datosAnulacion } : {}),
  };

  if (factura.formaPago === "cuenta_corriente" && factura.clienteId) {
    const saldoCliente = await saldoDeCliente(db, factura.clienteId);
    return { ...respuestaBase, saldoCliente };
  }

  return respuestaBase;
}

export type FacturaCompleta = Awaited<ReturnType<typeof obtenerFactura>>;

// Calcula el siguiente número correlativo dentro del punto de venta actual.
async function calcularProximoNumero(conexion: Conexion): Promise<number> {
  const fila = await conexion
    .select({ ultimo: sql<number>`coalesce(max(${facturas.numero}), 0)` })
    .from(facturas)
    .where(eq(facturas.puntoVenta, PUNTO_DE_VENTA))
    .get();
  return Number(fila?.ultimo ?? 0) + 1;
}

```

---

## 📄 Archivo: `app/api/facturas/route.ts`

**Ubicación:** `app/api/facturas/route.ts`  

```ts
// GET y POST /api/facturas (RF-V1 a RF-V6, RF-V8).
import { NextResponse, type NextRequest } from "next/server";
import { conSesionApi, leerJsonPedido, leerParametrosUrl } from "@/lib/adaptadores";
import { emitirFactura, listarFacturas } from "@/servicios/facturas";

export async function GET(pedido: NextRequest) {
  return conSesionApi(async (usuario) => {
    const resultado = await listarFacturas(usuario, leerParametrosUrl(pedido));
    return NextResponse.json(resultado, { status: 200 });
  });
}

export async function POST(pedido: NextRequest) {
  return conSesionApi(async (usuario) => {
    const cuerpo = await leerJsonPedido(pedido);
    const facturaCreada = await emitirFactura(usuario, cuerpo);
    return NextResponse.json(facturaCreada, { status: 201 });
  });
}

```

---

## 📄 Archivo: `app/api/facturas/proximo-numero/route.ts`

**Ubicación:** `app/api/facturas/proximo-numero/route.ts`  

```ts
// GET /api/facturas/proximo-numero (RF-V1).
import { NextResponse } from "next/server";
import { conSesionApi } from "@/lib/adaptadores";
import { obtenerProximoNumeroFactura } from "@/servicios/facturas";

export async function GET() {
  return conSesionApi(async (usuario) => {
    const resultado = await obtenerProximoNumeroFactura(usuario);
    return NextResponse.json(resultado, { status: 200 });
  });
}

```

---

## 📄 Archivo: `app/api/facturas/[id]/route.ts`

**Ubicación:** `app/api/facturas/[id]/route.ts`  

```ts
// GET /api/facturas/{id} (RF-V7).
import { NextResponse, type NextRequest } from "next/server";
import { conSesionApi } from "@/lib/adaptadores";
import { obtenerFactura } from "@/servicios/facturas";

type ContextoRuta = { params: Promise<{ id: string }> };

export async function GET(_pedido: NextRequest, contexto: ContextoRuta) {
  return conSesionApi(async (usuario) => {
    const { id } = await contexto.params;
    const factura = await obtenerFactura(usuario, Number(id));
    return NextResponse.json(factura, { status: 200 });
  });
}

```

---

## 📄 Archivo: `app/api/facturas/[id]/anulacion/route.ts`

**Ubicación:** `app/api/facturas/[id]/anulacion/route.ts`  

```ts
// POST /api/facturas/{id}/anulacion (RF-V9, solo administrador).
import { NextResponse, type NextRequest } from "next/server";
import { conSesionApi, leerJsonPedido } from "@/lib/adaptadores";
import { anularFactura } from "@/servicios/facturas";

type ContextoRuta = { params: Promise<{ id: string }> };

export async function POST(pedido: NextRequest, contexto: ContextoRuta) {
  return conSesionApi(async (usuario) => {
    const { id } = await contexto.params;
    const cuerpo = await leerJsonPedido(pedido);
    const facturaAnulada = await anularFactura(usuario, Number(id), cuerpo);
    return NextResponse.json(facturaAnulada, { status: 200 });
  });
}

```

---

