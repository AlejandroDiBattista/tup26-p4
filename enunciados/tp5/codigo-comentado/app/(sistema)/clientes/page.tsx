// ============================================================================
// GUÍA DE ESTUDIO - SEGUNDO PARCIAL: PROGRAMACIÓN IV
// Archivo: app/(sistema)/clientes/page.tsx
// Código comentado con explicaciones sencillas y claras para la defensa oral.
// ============================================================================

// Pantalla de CLIENTES (/clientes). RF-C1, RF-C2, RF-C7.
import Link from "next/link";
import { Eye, Wallet } from "lucide-react";
// Acá importamos las funciones para leer y validar la sesión del usuario conectado
import { exigirUsuarioPagina } from "@/lib/sesion";
// Acá importamos funciones de la capa de servicios donde reside la lógica de negocio
import { listarClientes } from "@/servicios/clientes";
// Acá importamos formateadores de moneda (pesos argentinos $), fechas y números
import { formatearMoneda } from "@/lib/formato";
// Acá importamos componentes visuales de la interfaz de usuario
import { Button } from "@/componentes/ui/button";
// Acá importamos componentes visuales de la interfaz de usuario
import { Badge } from "@/componentes/ui/badge";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/componentes/ui/table";
// Acá importamos componentes visuales de la interfaz de usuario
import { EncabezadoPagina } from "@/componentes/comunes/encabezado-pagina";
// Acá importamos componentes visuales de la interfaz de usuario
import { BarraFiltrosUrl } from "@/componentes/comunes/filtros-url";
// Acá importamos componentes visuales de la interfaz de usuario
import { InsigniaActivo } from "@/componentes/comunes/insignias";
// Acá importamos componentes visuales de la interfaz de usuario
import { Paginador } from "@/componentes/comunes/paginador";
// Acá importamos componentes visuales de la interfaz de usuario
import { EstadoVacio } from "@/componentes/comunes/estados";
import {
  BotonNuevoCliente,
  BotonesEditarCliente,
  BotonRegistrarPago,
} from "@/componentes/dominio/acciones-clientes";
// Acá importamos componentes visuales de la interfaz de usuario
import { Alinear, Pagina, Texto } from "@/componentes/primitivas/maquetacion";

type Props = { searchParams: Promise<Record<string, string | undefined>> };

// Componente principal de página 'PaginaClientes' (Server Component: se ejecuta en el servidor)
export default async function PaginaClientes({ searchParams }: Props) {
  const usuario = await exigirUsuarioPagina();
  const parametros = await searchParams;
  const listado = await listarClientes(usuario, parametros);

  // Renderizamos la interfaz visual de este componente:
  return (
    <Pagina>
      <EncabezadoPagina
        titulo="Clientes"
        subtitulo="Padrón de clientes registrados, condición de cuenta corriente y saldo actual"
        acciones={
          <Alinear className="gap-2">
            <Link href="/clientes/saldos">
              <Button variant="outline">
                <Wallet className="size-4" />
                Ver clientes con deuda
              </Button>
            </Link>
            <BotonNuevoCliente />
          </Alinear>
        }
      />

      <BarraFiltrosUrl
        placeholderBusqueda="Buscar cliente por nombre, DNI o CUIT (con o sin puntos)..."
        filtros={[
          {
            nombre: "orden",
            etiqueta: "Ordenar por nombre",
            opciones: [{ valor: "saldo", texto: "Ordenar por mayor saldo" }],
          },
          {
            nombre: "activo",
            etiqueta: "Solo clientes activos",
            opciones: [{ valor: "todos", texto: "Activos y dados de baja" }],
          },
        ]}
      />

      {listado.data.length === 0 ? (
        <EstadoVacio
          titulo="No se encontraron clientes"
          descripcion="Probá cambiando el texto de búsqueda o registrá un cliente nuevo."
        />
      ) : (
        <>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Nombre o razón social</TableHead>
                <TableHead>Documento</TableHead>
                <TableHead>Teléfono / Email</TableHead>
                <TableHead>Cuenta corriente</TableHead>
                <TableHead className="text-right">Límite crédito</TableHead>
                <TableHead className="text-right">Saldo actual</TableHead>
                <TableHead>Estado</TableHead>
                <TableHead className="text-right">Acciones</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {listado.data.map((cli) => (
                <TableRow key={cli.id}>
                  <TableCell>
                    <Link
                      href={`/clientes/${cli.id}`}
                      className="font-medium hover:text-primary hover:underline"
                    >
                      {cli.nombre}
                    </Link>
                  </TableCell>
                  <TableCell className="font-mono text-xs">
                    {cli.tipoDoc} {cli.nroDoc}
                  </TableCell>
                  <TableCell className="text-xs text-muted-foreground">
                    {cli.telefono ?? "—"}
                    {cli.email ? ` · ${cli.email}` : ""}
                  </TableCell>
                  <TableCell>
                    {cli.cuentaCorriente ? (
                      <Badge variant="success">Habilitada</Badge>
                    ) : (
                      <Badge variant="secondary">No habilitada</Badge>
                    )}
                  </TableCell>
                  <TableCell className="text-right font-mono text-xs">
                    {cli.cuentaCorriente
                      ? cli.limiteCredito !== null
                        ? formatearMoneda(cli.limiteCredito)
                        : "Sin límite"
                      : "—"}
                  </TableCell>
                  <TableCell className="text-right font-mono font-semibold">
                    <Texto tono={cli.saldo > 0 ? "peligro" : "normal"}>
                      {formatearMoneda(cli.saldo)}
                    </Texto>
                  </TableCell>
                  <TableCell>
                    <InsigniaActivo activo={cli.activo} textoInactivo="Baja" />
                  </TableCell>
                  <TableCell className="text-right">
                    <Alinear className="justify-end gap-1.5">
                      <Link href={`/clientes/${cli.id}`}>
                        <Button variant="outline" size="xs">
                          <Eye className="size-3.5" />
                          Ficha / Cta.
                        </Button>
                      </Link>
                      <BotonRegistrarPago cliente={cli} />
                      <BotonesEditarCliente cliente={cli} />
                    </Alinear>
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
