// ============================================================================
// GUÍA DE ESTUDIO - SEGUNDO PARCIAL: PROGRAMACIÓN IV
// Archivo: app/(sistema)/ventas/nueva/page.tsx
// Código comentado con explicaciones sencillas y claras para la defensa oral.
// ============================================================================

// Pantalla de NUEVA VENTA (/ventas/nueva). RF-V1 a RF-V6.
import Link from "next/link";
import { FileText } from "lucide-react";
// Acá importamos las funciones para leer y validar la sesión del usuario conectado
import { exigirUsuarioPagina } from "@/lib/sesion";
// Acá importamos funciones de la capa de servicios donde reside la lógica de negocio
import { listarProductos } from "@/servicios/productos";
// Acá importamos funciones de la capa de servicios donde reside la lógica de negocio
import { listarClientes } from "@/servicios/clientes";
// Acá importamos funciones de la capa de servicios donde reside la lógica de negocio
import { obtenerProximoNumeroFactura } from "@/servicios/facturas";
// Acá importamos componentes visuales de la interfaz de usuario
import { Button } from "@/componentes/ui/button";
// Acá importamos componentes visuales de la interfaz de usuario
import { EncabezadoPagina } from "@/componentes/comunes/encabezado-pagina";
// Acá importamos componentes visuales de la interfaz de usuario
import { PantallaNuevaVenta } from "@/componentes/dominio/nueva-venta";
// Acá importamos componentes visuales de la interfaz de usuario
import { Pagina } from "@/componentes/primitivas/maquetacion";

// Componente principal de página 'PaginaNuevaVenta' (Server Component: se ejecuta en el servidor)
export default async function PaginaNuevaVenta() {
  const usuario = await exigirUsuarioPagina();
  const [catalogo, clientes, proximo] = await Promise.all([
    listarProductos(usuario, { pageSize: "100", activo: "true" }),
    listarClientes(usuario, { pageSize: "100", activo: "true" }),
    obtenerProximoNumeroFactura(usuario),
  ]);

  // Renderizamos la interfaz visual de este componente:
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
