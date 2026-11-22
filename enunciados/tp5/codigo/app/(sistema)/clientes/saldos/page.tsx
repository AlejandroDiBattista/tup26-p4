// Pantalla de SALDOS DE CUENTAS CORRIENTES (/clientes/saldos). RF-C6.
// Clientes con deuda ordenados de mayor a menor, con el total adeudado.
import Link from "next/link";
import { ArrowLeft, Eye } from "lucide-react";
import { exigirUsuarioPagina } from "@/lib/sesion";
import { listarClientes } from "@/servicios/clientes";
import { formatearMoneda } from "@/lib/formato";
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
import { EstadoVacio } from "@/componentes/comunes/estados";
import { Paginador } from "@/componentes/comunes/paginador";
import { BotonRegistrarPago } from "@/componentes/dominio/acciones-clientes";
import { Alinear, Pagina, Texto } from "@/componentes/primitivas/maquetacion";

type Props = { searchParams: Promise<Record<string, string | undefined>> };

export default async function PaginaSaldosClientes({ searchParams }: Props) {
  const usuario = await exigirUsuarioPagina();
  const parametros = await searchParams;
  const listado = await listarClientes(usuario, {
    ...parametros,
    conDeuda: "true",
    orden: "saldo",
  });

  const totalAdeudado = "totalAdeudado" in listado ? listado.totalAdeudado : 0;

  return (
    <Pagina>
      <EncabezadoPagina
        titulo="Saldos de cuentas corrientes"
        subtitulo="Clientes con deuda pendiente ordenados de mayor a menor saldo"
        acciones={
          <Link href="/clientes">
            <Button variant="outline">
              <ArrowLeft className="size-4" />
              Ver todos los clientes
            </Button>
          </Link>
        }
      />

      <Card className="p-4 bg-amber-50/70 border-amber-200">
        <Alinear className="justify-between">
          <Texto negrita>
            Total adeudado en cuentas corrientes ({listado.total} clientes con deuda):
          </Texto>
          <Texto mono negrita tamano="2xl" tono="peligro">
            {formatearMoneda(totalAdeudado)}
          </Texto>
        </Alinear>
      </Card>

      {listado.data.length === 0 ? (
        <EstadoVacio
          titulo="No hay clientes con deuda pendiente"
          descripcion="Todas las cuentas corrientes se encuentran al día."
        />
      ) : (
        <>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Cliente</TableHead>
                <TableHead>Documento</TableHead>
                <TableHead>Teléfono</TableHead>
                <TableHead className="text-right">Límite de crédito</TableHead>
                <TableHead className="text-right">Disponible</TableHead>
                <TableHead className="text-right">Saldo adeudado</TableHead>
                <TableHead className="text-right">Acciones</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {listado.data.map((cli) => (
                <TableRow key={cli.id}>
                  <TableCell>
                    <Link
                      href={`/clientes/${cli.id}?vista=cuenta`}
                      className="font-medium hover:text-primary hover:underline"
                    >
                      {cli.nombre}
                    </Link>
                  </TableCell>
                  <TableCell className="font-mono text-xs">
                    {cli.tipoDoc} {cli.nroDoc}
                  </TableCell>
                  <TableCell className="text-xs">{cli.telefono ?? "—"}</TableCell>
                  <TableCell className="text-right font-mono text-xs">
                    {cli.limiteCredito !== null ? formatearMoneda(cli.limiteCredito) : "Sin límite"}
                  </TableCell>
                  <TableCell className="text-right font-mono text-xs">
                    {cli.disponible !== null ? formatearMoneda(cli.disponible) : "Sin límite"}
                  </TableCell>
                  <TableCell className="text-right font-mono font-semibold">
                    <Texto tono="peligro">{formatearMoneda(cli.saldo)}</Texto>
                  </TableCell>
                  <TableCell className="text-right">
                    <Alinear className="justify-end gap-1.5">
                      <Link href={`/clientes/${cli.id}?vista=cuenta`}>
                        <Button variant="outline" size="xs">
                          <Eye className="size-3.5" />
                          Ver cuenta
                        </Button>
                      </Link>
                      <BotonRegistrarPago cliente={cli} />
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
