// ============================================================================
// ARCHIVO COMENTADO LÍNEA POR LÍNEA PARA ESTUDIO Y DEFENSA DEL SEGUNDO PARCIAL
// ============================================================================
// Pantalla de NUEVA VENTA (/ventas/nueva). RF-V1 a RF-V6.
// [Línea 2] Importa elementos desde 'next/link'.
import Link from "next/link";
// [Línea 3] Importa elementos desde 'lucide-react'.
import { FileText } from "lucide-react";
// [Línea 4] Importa elementos desde '@/lib/sesion'.
import { exigirUsuarioPagina } from "@/lib/sesion";
// [Línea 5] Importa elementos desde '@/servicios/productos'.
import { listarProductos } from "@/servicios/productos";
// [Línea 6] Importa elementos desde '@/servicios/clientes'.
import { listarClientes } from "@/servicios/clientes";
// [Línea 7] Importa elementos desde '@/servicios/facturas'.
import { obtenerProximoNumeroFactura } from "@/servicios/facturas";
// [Línea 8] Importa elementos desde '@/componentes/ui/button'.
import { Button } from "@/componentes/ui/button";
// [Línea 9] Importa elementos desde '@/componentes/comunes/encabezado-pagina'.
import { EncabezadoPagina } from "@/componentes/comunes/encabezado-pagina";
// [Línea 10] Importa elementos desde '@/componentes/dominio/nueva-venta'.
import { PantallaNuevaVenta } from "@/componentes/dominio/nueva-venta";
// [Línea 11] Importa elementos desde '@/componentes/primitivas/maquetacion'.
import { Pagina } from "@/componentes/primitivas/maquetacion";

// [Línea 13] Server Component principal 'PaginaNuevaVenta': se ejecuta en el servidor, consulta los servicios y devuelve el HTML.
export default async function PaginaNuevaVenta() {
  // [Línea 14] Espera el resultado de la consulta/operación asíncrona y lo asigna a 'usuario'.
  const usuario = await exigirUsuarioPagina();
  // [Línea 15] Espera el resultado de la consulta/operación asíncrona y lo asigna a '[catalogo, clientes, proximo]'.
  const [catalogo, clientes, proximo] = await Promise.all([
    // [Línea 16] Ejecuta o evalúa: listarProductos(usuario, { pageSize: "100", activo: "true" }),
    listarProductos(usuario, { pageSize: "100", activo: "true" }),
    // [Línea 17] Ejecuta o evalúa: listarClientes(usuario, { pageSize: "100", activo: "true" }),
    listarClientes(usuario, { pageSize: "100", activo: "true" }),
    // [Línea 18] Ejecuta o evalúa: obtenerProximoNumeroFactura(usuario),
    obtenerProximoNumeroFactura(usuario),
  // [Línea 19] Cierra el bloque o estructura (]);).
  ]);

  // [Línea 21] Devuelve la interfaz JSX que renderiza este componente.
  return (
    <Pagina> // [Línea 22] Abre o renderiza el componente visual <Pagina>.
      <EncabezadoPagina // [Línea 23] Abre o renderiza el componente visual <EncabezadoPagina>.
        // [Línea 24] Ejecuta o evalúa: titulo="Nueva venta de mostrador"
        titulo="Nueva venta de mostrador"
        // [Línea 25] Ejecuta o evalúa: subtitulo="Identificá al comprador, agregá los productos y seleccioná la forma d
        subtitulo="Identificá al comprador, agregá los productos y seleccioná la forma de pago"
        // [Línea 26] Ejecuta o evalúa: acciones={
        acciones={
          <Link href="/ventas"> // [Línea 27] Abre o renderiza el componente visual <Link>.
            <Button variant="outline"> // [Línea 28] Abre o renderiza el componente visual <Button>.
              <FileText className="size-4" /> // [Línea 29] Abre o renderiza el componente visual <FileText>.
              // [Línea 30] Ejecuta o evalúa: Ver facturas emitidas
              Ver facturas emitidas
            </Button> // [Línea 31] Cierra el componente visual </Button>.
          </Link> // [Línea 32] Cierra el componente visual </Link>.
        // [Línea 33] Cierra el bloque o estructura (}).
        }
      // [Línea 34] Ejecuta o evalúa: />
      />

      <PantallaNuevaVenta // [Línea 36] Abre o renderiza el componente visual <PantallaNuevaVenta>.
        // [Línea 37] Ejecuta o evalúa: productosIniciales={catalogo.data}
        productosIniciales={catalogo.data}
        // [Línea 38] Ejecuta o evalúa: clientesIniciales={clientes.data}
        clientesIniciales={clientes.data}
        // [Línea 39] Ejecuta o evalúa: proximoNumeroInformativo={proximo.numeroFormateado}
        proximoNumeroInformativo={proximo.numeroFormateado}
      // [Línea 40] Ejecuta o evalúa: />
      />
    </Pagina> // [Línea 41] Cierra el componente visual </Pagina>.
  // [Línea 42] Cierra el bloque o estructura ();).
  );
// [Línea 43] Cierra el bloque o estructura (}).
}
