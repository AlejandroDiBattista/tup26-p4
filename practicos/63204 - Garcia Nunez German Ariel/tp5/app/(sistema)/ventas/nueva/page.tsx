// Pantalla de NUEVA VENTA (/ventas/nueva). RF-V1 a RF-V6.

/* los import traen herramientas de next, iconos, funciones de sesion y servicios de backend para armar la pantalla */
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

/* export default async function: define el componente principal que next cargara para la ruta /ventas/nueva. Al ser async se ejecuta en el servidor antes de mandar el html al navegador */
export default async function PaginaNuevaVenta() {
  /* exigirUsuarioPagina valida la cookie de sesion en el servidor; si no hay usuario logueado lo redirige automaticamente a /login */
  const usuario = await exigirUsuarioPagina();

  /* PROMISE.ALL:
     Es un metodo fundamental de JavaScript para optimizar el rendimiento.
     En lugar de esperar a que termine una consulta a la base de datos para recien empezar la siguiente (lo que sumaria tiempos en cascada),
     Promise.all dispara las 3 consultas al mismo tiempo en paralelo:
     1) listarProductos: trae los productos activos del catalogo (hasta 100).
     2) listarClientes: trae los clientes habilitados para poder seleccionarlos en el mostrador.
     3) obtenerProximoNumeroFactura: consulta en la base de datos cual es el siguiente numero correlativo que toca emitir.
     Cuando las 3 promesas se resuelven satisfactoriamente, desempaqueta los resultados en las variables [catalogo, clientes, proximo].
  */
  const [catalogo, clientes, proximo] = await Promise.all([
    listarProductos(usuario, { pageSize: "100", activo: "true" }),
    listarClientes(usuario, { pageSize: "100", activo: "true" }),
    obtenerProximoNumeroFactura(usuario),
  ]);

  return (
    /* componente contenedor que aplica el diseno y margenes estandares de la aplicacion */
    <Pagina>
      {/* encabezado de la pantalla con titulo, descripcion y un boton de accion */}
      <EncabezadoPagina
        titulo="Nueva venta de mostrador"
        subtitulo="Identificá al comprador, agregá los productos y seleccioná la forma de pago"
        acciones={
          /* boton que nos lleva al listado de facturas ya emitidas usando Link de Next para no recargar la pagina entera */
          <Link href="/ventas">
            <Button variant="outline">
              <FileText className="size-4" />
              Ver facturas emitidas
            </Button>
          </Link>
        }
      />

      {/* componente interactivo que contiene toda la logica del mostrador: buscador con atajos de teclado, calculo de subtotales, iva y confirmacion de venta */}
      <PantallaNuevaVenta
        productosIniciales={catalogo.data}
        clientesIniciales={clientes.data}
        proximoNumeroInformativo={proximo.numeroFormateado}
      />
    </Pagina>
  );
}
