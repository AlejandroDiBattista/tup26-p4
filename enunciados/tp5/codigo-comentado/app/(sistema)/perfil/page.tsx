// ============================================================================
// ARCHIVO COMENTADO LÍNEA POR LÍNEA PARA ESTUDIO Y DEFENSA DEL SEGUNDO PARCIAL
// ============================================================================
// Pantalla de MI PERFIL (/perfil). RF-U5.
// Muestra los datos del usuario conectado y le permite cambiar su propia contraseña.
// [Línea 3] Importa elementos desde '@/lib/sesion'.
import { exigirUsuarioPagina } from "@/lib/sesion";
// [Línea 4] Importa elementos desde '@/componentes/ui/card'.
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/componentes/ui/card";
// [Línea 5] Importa elementos desde '@/componentes/comunes/encabezado-pagina'.
import { EncabezadoPagina } from "@/componentes/comunes/encabezado-pagina";
// [Línea 6] Importa elementos desde '@/componentes/comunes/insignias'.
import { InsigniaRol } from "@/componentes/comunes/insignias";
// [Línea 7] Importa elementos desde '@/componentes/dominio/formulario-perfil'.
import { FormularioCambiarContrasena } from "@/componentes/dominio/formulario-perfil";
// [Línea 8] Importa elementos desde '@/componentes/primitivas/maquetacion'.
import { Alinear, Apilar, Grilla, Pagina, Texto } from "@/componentes/primitivas/maquetacion";

// [Línea 10] Server Component principal 'PaginaPerfil': se ejecuta en el servidor, consulta los servicios y devuelve el HTML.
export default async function PaginaPerfil() {
  // [Línea 11] Espera el resultado de la consulta/operación asíncrona y lo asigna a 'usuario'.
  const usuario = await exigirUsuarioPagina();

  // [Línea 13] Devuelve la interfaz JSX que renderiza este componente.
  return (
    <Pagina> // [Línea 14] Abre o renderiza el componente visual <Pagina>.
      <EncabezadoPagina // [Línea 15] Abre o renderiza el componente visual <EncabezadoPagina>.
        // [Línea 16] Ejecuta o evalúa: titulo="Mi perfil"
        titulo="Mi perfil"
        // [Línea 17] Ejecuta o evalúa: subtitulo="Información de tu cuenta y cambio de contraseña"
        subtitulo="Información de tu cuenta y cambio de contraseña"
      // [Línea 18] Ejecuta o evalúa: />
      />

      <Grilla className="grid-cols-1 lg:grid-cols-2 items-start"> // [Línea 20] Abre o renderiza el componente visual <Grilla>.
        <Card> // [Línea 21] Abre o renderiza el componente visual <Card>.
          <CardHeader> // [Línea 22] Abre o renderiza el componente visual <CardHeader>.
            <CardTitle>Datos de la sesión actual</CardTitle> // [Línea 23] Abre o renderiza el componente visual <CardTitle>.
            <CardDescription>Identidad verificada en el servidor</CardDescription> // [Línea 24] Abre o renderiza el componente visual <CardDescription>.
          </CardHeader> // [Línea 25] Cierra el componente visual </CardHeader>.
          <CardContent className="gap-3"> // [Línea 26] Abre o renderiza el componente visual <CardContent>.
            <Apilar className="gap-1"> // [Línea 27] Abre o renderiza el componente visual <Apilar>.
              <Texto tamano="xs" tono="suave"> // [Línea 28] Abre o renderiza el componente visual <Texto>.
                // [Línea 29] Ejecuta o evalúa: Nombre completo
                Nombre completo
              </Texto> // [Línea 30] Cierra el componente visual </Texto>.
              <Texto negrita tamano="base"> // [Línea 31] Abre o renderiza el componente visual <Texto>.
                // [Línea 32] Ejecuta o evalúa: {usuario.nombre}
                {usuario.nombre}
              </Texto> // [Línea 33] Cierra el componente visual </Texto>.
            </Apilar> // [Línea 34] Cierra el componente visual </Apilar>.

            <Apilar className="gap-1"> // [Línea 36] Abre o renderiza el componente visual <Apilar>.
              <Texto tamano="xs" tono="suave"> // [Línea 37] Abre o renderiza el componente visual <Texto>.
                // [Línea 38] Ejecuta o evalúa: Correo electrónico
                Correo electrónico
              </Texto> // [Línea 39] Cierra el componente visual </Texto>.
              <Texto mono>{usuario.email}</Texto> // [Línea 40] Abre o renderiza el componente visual <Texto>.
            </Apilar> // [Línea 41] Cierra el componente visual </Apilar>.

            <Apilar className="gap-1"> // [Línea 43] Abre o renderiza el componente visual <Apilar>.
              <Texto tamano="xs" tono="suave"> // [Línea 44] Abre o renderiza el componente visual <Texto>.
                // [Línea 45] Ejecuta o evalúa: Rol y nivel de acceso
                Rol y nivel de acceso
              </Texto> // [Línea 46] Cierra el componente visual </Texto>.
              <Alinear> // [Línea 47] Abre o renderiza el componente visual <Alinear>.
                <InsigniaRol rol={usuario.rol} /> // [Línea 48] Abre o renderiza el componente visual <InsigniaRol>.
              </Alinear> // [Línea 49] Cierra el componente visual </Alinear>.
            </Apilar> // [Línea 50] Cierra el componente visual </Apilar>.
          </CardContent> // [Línea 51] Cierra el componente visual </CardContent>.
        </Card> // [Línea 52] Cierra el componente visual </Card>.

        <FormularioCambiarContrasena /> // [Línea 54] Abre o renderiza el componente visual <FormularioCambiarContrasena>.
      </Grilla> // [Línea 55] Cierra el componente visual </Grilla>.
    </Pagina> // [Línea 56] Cierra el componente visual </Pagina>.
  // [Línea 57] Cierra el bloque o estructura ();).
  );
// [Línea 58] Cierra el bloque o estructura (}).
}
