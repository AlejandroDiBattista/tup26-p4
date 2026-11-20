// Pantalla de MI PERFIL (/perfil). RF-U5.
// Muestra los datos del usuario conectado y le permite cambiar su propia contraseña.
import { exigirUsuarioPagina } from "@/lib/sesion";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/componentes/ui/card";
import { EncabezadoPagina } from "@/componentes/comunes/encabezado-pagina";
import { InsigniaRol } from "@/componentes/comunes/insignias";
import { FormularioCambiarContrasena } from "@/componentes/dominio/formulario-perfil";
import { Alinear, Apilar, Grilla, Pagina, Texto } from "@/componentes/primitivas/maquetacion";

export default async function PaginaPerfil() {
  const usuario = await exigirUsuarioPagina();

  return (
    <Pagina>
      <EncabezadoPagina
        titulo="Mi perfil"
        subtitulo="Información de tu cuenta y cambio de contraseña"
      />

      <Grilla className="grid-cols-1 lg:grid-cols-2 items-start">
        <Card>
          <CardHeader>
            <CardTitle>Datos de la sesión actual</CardTitle>
            <CardDescription>Identidad verificada en el servidor</CardDescription>
          </CardHeader>
          <CardContent className="gap-3">
            <Apilar className="gap-1">
              <Texto tamano="xs" tono="suave">
                Nombre completo
              </Texto>
              <Texto negrita tamano="base">
                {usuario.nombre}
              </Texto>
            </Apilar>

            <Apilar className="gap-1">
              <Texto tamano="xs" tono="suave">
                Correo electrónico
              </Texto>
              <Texto mono>{usuario.email}</Texto>
            </Apilar>

            <Apilar className="gap-1">
              <Texto tamano="xs" tono="suave">
                Rol y nivel de acceso
              </Texto>
              <Alinear>
                <InsigniaRol rol={usuario.rol} />
              </Alinear>
            </Apilar>
          </CardContent>
        </Card>

        <FormularioCambiarContrasena />
      </Grilla>
    </Pagina>
  );
}
