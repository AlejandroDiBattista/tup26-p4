// Pantalla de CATEGORÍAS DE PRODUCTOS (/productos/categorias). RF-P7.
import Link from "next/link";
import { ArrowLeft } from "lucide-react";
import { exigirUsuarioPagina } from "@/lib/sesion";
import { listarCategorias } from "@/servicios/categorias";
import { Button } from "@/componentes/ui/button";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/componentes/ui/table";
import { EncabezadoPagina } from "@/componentes/comunes/encabezado-pagina";
import { InsigniaActivo } from "@/componentes/comunes/insignias";
import { EstadoVacio } from "@/componentes/comunes/estados";
import {
  AccionesFilaCategoria,
  BotonNuevaCategoria,
} from "@/componentes/dominio/acciones-categorias";
import { Alinear, Pagina } from "@/componentes/primitivas/maquetacion";

export default async function PaginaCategorias() {
  const usuario = await exigirUsuarioPagina();
  const esAdmin = usuario.rol === "admin";
  const categorias = await listarCategorias(usuario, { todas: esAdmin ? "true" : "false" });

  return (
    <Pagina>
      <EncabezadoPagina
        titulo="Categorías de productos"
        subtitulo="Clasificación del catálogo comercial"
        acciones={
          <Alinear className="gap-2">
            <Link href="/productos">
              <Button variant="outline">
                <ArrowLeft className="size-4" />
                Volver a productos
              </Button>
            </Link>
            {esAdmin && <BotonNuevaCategoria />}
          </Alinear>
        }
      />

      {categorias.length === 0 ? (
        <EstadoVacio titulo="No hay categorías registradas" />
      ) : (
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Nombre de la categoría</TableHead>
              <TableHead className="text-right">Productos activos</TableHead>
              <TableHead>Estado</TableHead>
              {esAdmin && <TableHead className="text-right">Acciones</TableHead>}
            </TableRow>
          </TableHeader>
          <TableBody>
            {categorias.map((cat) => (
              <TableRow key={cat.id}>
                <TableCell className="font-medium">
                  <Link
                    href={`/productos?categoriaId=${cat.id}`}
                    className="hover:text-primary hover:underline"
                  >
                    {cat.nombre}
                  </Link>
                </TableCell>
                <TableCell className="text-right font-mono">{cat.cantidadProductos}</TableCell>
                <TableCell>
                  <InsigniaActivo activo={cat.activa} textoInactivo="Inactiva" />
                </TableCell>
                {esAdmin && (
                  <TableCell className="text-right">
                    <AccionesFilaCategoria categoria={cat} />
                  </TableCell>
                )}
              </TableRow>
            ))}
          </TableBody>
        </Table>
      )}
    </Pagina>
  );
}
