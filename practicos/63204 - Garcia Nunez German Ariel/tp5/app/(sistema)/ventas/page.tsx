// Pantalla de LISTADO DE FACTURAS (/ventas). RF-V8.
import Link from "next/link";    /* llamamos a next */                                           
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

/* los import son declaraciones que tran codigos externos, como herramientas de react, componentes visuales, o funciones de negocio, para que el archivo tenga todos los recursos necesarios para funcionar */

/* definimos el tipo de dato para las propiedades de la pagina, establece que search es una promesa que al resolverse da un objeto cuyos valores son de tipo string o indefinido */
type Props = { searchParams: Promise<Record<string, string | undefined>> };

/* export permite que otros archivos importen y utilicen esa funcion, marcandola como el componente principal que next cargara para esa ruta */
/* default designa la funcion como el elemento principal del modulo, permitiendo que se importe sin llaves en otros archivos */
/* asymc marca la funcion para que pueda pausar la ejecucion sin bloquear el hilo principal */
/* declaramos la funcion asyncrona para que espere la respuesta, le ponemos export para que la funcion se pueda exportar y utilizar en otros archivos, -> funcion paginaFacturas que recibe los parametros de tipo sting o indefinido que vienen de props una url */
export default async function PaginaFacturas({ searchParams }: Props) {
  /* creamos la variable usuario que atrapa el usuario registrado que viene desde lib/sesion (valida la sesion activa) garantizando que solo usuarios con permisos vean el contenido */
  const usuario = await exigirUsuarioPagina();
  /* esperamos que la promesa de los parametros se resualva para obetener el objeto real con los filtros de la url */
  const parametros = await searchParams;


  /* primise.all es un metodo global de js que permite ejecutar multiples promesas en paralelo y espera a que todas se resuelvan, optimizando el tiempo de carga 
      pidiendo listar las facturas y listar los clientes con los nombres de los vendedores para completar la pagina, la consulta se realiza a la db   
  */
  const [listado, clientesRes, listaVendedores] = await Promise.all([
    listarFacturas(usuario, parametros),

    /* PAGESIZE dice que solo debe traer como maximo 100 datos */
    listarClientes(usuario, { pageSize: "100" }),
    db.select({ id: usuarios.id, nombre: usuarios.nombre }).from(usuarios),
  ]);

  return (
    /* pagina -> componente creado para que todas las pantallas tengan los mismo margenes y estructura base */
    <Pagina>
      <EncabezadoPagina
        titulo="Facturas"
        subtitulo="Historial de comprobantes emitidos y anulados"
        acciones={
          // boton que utilizamos para cambiar de pagina, redirigiendonos a pantalla para registrar una venta
          <Link href="/ventas/nueva">
            <Button>
              <ShoppingCart className="size-4" />
              Nueva venta
            </Button>
          </Link>
        }
      />

      {/* barra de filtros que sincroniza las opciones elegidas con los parametros de la url para que no se pierdan al recargar */}
      <BarraFiltrosUrl
        placeholderBusqueda="Buscar por número o nombre del cliente..."
        filtros={[
          { nombre: "desde", etiqueta: "Desde fecha", tipo: "fecha" },
          { nombre: "hasta", etiqueta: "Hasta fecha", tipo: "fecha" },
          {
            nombre: "clienteId",
            etiqueta: "Todos los clientes",
            /* usamos .map para transformar la lista de clientes que vino de la db en un formato de opciones con valor y texto para el menu desplegable */
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
            /* transformamos la lista de vendedores de la tabla usuarios en opciones para filtrar quien hizo la venta */
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

      {/* tarjeta resumen que muestra la suma total de dinero de las facturas que coinciden con los filtros aplicados */}
      <Card className="p-3 bg-secondary/40">
        <Alinear className="justify-between">
          <Texto tamano="sm" tono="suave">
            Total emitido según filtros actuales ({listado.total} comprobantes):
          </Texto>
          {/* formatearMoneda toma los centavos guardados en la db y los convierte en pesos con formato argentino $ 12.345,00 */}
          <Texto mono negrita tamano="base" className="text-primary">
            {formatearMoneda(listado.totalEmitido)}
          </Texto>
        </Alinear>
      </Card>

      {/* usamos un operador ternario: si el arreglo de facturas esta vacio muestra el cartel de estado vacio, si tiene datos dibuja la tabla */}
      {listado.data.length === 0 ? (
        /* componente visual que avisa al usuario que no hay resultados para los filtros que selecciono */
        <EstadoVacio
          titulo="No se encontraron facturas"
          descripcion="Probá cambiando el rango de fechas o los filtros seleccionados."
        />
      ) : (
        <>
          {/* tabla principal con el listado de comprobantes */}
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
              {/* recorremos cada factura con .map para renderizar una fila de la tabla por cada comprobante */}
              {listado.data.map((fac) => (
                /* key={fac.id} es obligatorio en react para identificar cada fila de manera unica en el dom */
                <TableRow key={fac.id}>
                  {/* numero formateado con el punto de venta y ocho digitos correlativos ej: 0001-00000023 */}
                  <TableCell className="font-mono font-medium">
                    <Link
                      href={`/ventas/${fac.id}`}
                      className="hover:text-primary hover:underline"
                    >
                      {fac.numeroFormateado}
                    </Link>
                  </TableCell>
                  {/* fecha y hora formateada en formato legible DD/MM/AAAA HH:mm */}
                  <TableCell className="text-xs text-muted-foreground">
                    {formatearFechaHora(fac.fecha)}
                  </TableCell>
                  {/* verificamos si la factura tiene un cliente asociado o si es consumidor final */}
                  <TableCell>
                    {fac.cliente ? (
                      /* si tiene cliente mostramos un link directo a su ficha personal y cuenta corriente */
                      <Link
                        href={`/clientes/${fac.cliente.id}`}
                        className="font-medium hover:text-primary hover:underline"
                      >
                        {fac.cliente.nombre}
                      </Link>
                    ) : (
                      /* si clienteId es null significa que fue venta a consumidor final sin registrar */
                      <Texto tono="suave">Consumidor final</Texto>
                    )}
                  </TableCell>
                  {/* nombre del vendedor o usuario que emitio la factura */}
                  <TableCell>{fac.vendedor.nombre}</TableCell>
                  {/* insignia visual con color segun forma de pago (contado, tarjeta o cuenta corriente) */}
                  <TableCell>
                    <InsigniaFormaPago forma={fac.formaPago} />
                  </TableCell>
                  {/* insignia visual con color segun el estado (verde para emitida, rojo para anulada) */}
                  <TableCell>
                    <InsigniaEstadoFactura estado={fac.estado} />
                  </TableCell>
                  {/* total de la factura formateado en pesos */}
                  <TableCell className="text-right font-mono font-semibold">
                    {formatearMoneda(fac.total)}
                  </TableCell>
                  {/* boton para ir al detalle completo de la factura y poder imprimirla */}
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

          {/* paginador al pie de la tabla que maneja los botones de pagina anterior y siguiente */}
          <Paginador page={listado.page} pageSize={listado.pageSize} total={listado.total} />
        </>
      )}
    </Pagina>
  );
}
