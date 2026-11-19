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
