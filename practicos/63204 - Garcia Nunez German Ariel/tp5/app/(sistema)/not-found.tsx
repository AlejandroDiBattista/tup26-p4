import Link from "next/link";
import { FileQuestion, ArrowLeft, Home } from "lucide-react";
import { Button } from "@/componentes/ui/button";
import { Card } from "@/componentes/ui/card";
import { Alinear, Apilar, Pagina, Texto, Titulo } from "@/componentes/primitivas/maquetacion";

export default function NoEncontrado() {
  return (
    <Pagina>
      <div className="flex min-h-[50vh] items-center justify-center p-4">
        <Card className="max-w-md p-8 text-center">
          <Apilar className="items-center gap-4">
            <div className="flex size-14 items-center justify-center rounded-2xl bg-muted text-muted-foreground">
              <FileQuestion className="size-8" />
            </div>
            <Apilar className="gap-1.5">
              <Titulo className="text-xl font-semibold">Recurso no encontrado</Titulo>
              <Texto className="text-sm text-muted-foreground">
                El comprobante, producto o cliente que buscas no existe, fue eliminado o aún no ha sido sincronizado en esta instancia.
              </Texto>
            </Apilar>
            <Alinear className="gap-3 pt-2">
              <Link href="/">
                <Button variant="default">
                  <Home className="size-4" />
                  Ir al panel principal
                </Button>
              </Link>
              <Link href="/ventas">
                <Button variant="outline">
                  <ArrowLeft className="size-4" />
                  Ver facturas
                </Button>
              </Link>
            </Alinear>
          </Apilar>
        </Card>
      </div>
    </Pagina>
  );
}
