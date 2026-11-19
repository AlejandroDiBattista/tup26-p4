// ============================================================================
// GUÍA DE ESTUDIO - SEGUNDO PARCIAL: PROGRAMACIÓN IV
// Archivo: app/(sistema)/perfil/page.tsx
// Código comentado con explicaciones sencillas y claras para la defensa oral.
// ============================================================================

// Pantalla de MI PERFIL (/perfil). RF-U5.
// Muestra los datos del usuario conectado y le permite cambiar su propia contraseña.
// Acá importamos las funciones para leer y validar la sesión del usuario conectado
import { exigirUsuarioPagina } from "@/lib/sesion";
// Acá importamos componentes visuales de la interfaz de usuario
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/componentes/ui/card";
// Acá importamos componentes visuales de la interfaz de usuario
import { EncabezadoPagina } from "@/componentes/comunes/encabezado-pagina";
// Acá importamos componentes visuales de la interfaz de usuario
import { InsigniaRol } from "@/componentes/comunes/insignias";
// Acá importamos componentes visuales de la interfaz de usuario
import { FormularioCambiarContrasena } from "@/componentes/dominio/formulario-perfil";
// Acá importamos componentes visuales de la interfaz de usuario
import { Alinear, Apilar, Grilla, Pagina, Texto } from "@/componentes/primitivas/maquetacion";

// Componente principal de página 'PaginaPerfil' (Server Component: se ejecuta en el servidor)
export default async function PaginaPerfil() {
  const usuario = await exigirUsuarioPagina();

  // Renderizamos la interfaz visual de este componente:
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
