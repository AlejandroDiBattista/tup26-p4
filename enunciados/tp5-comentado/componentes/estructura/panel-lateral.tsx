// ============================================================================
// ARCHIVO COMENTADO LÍNEA POR LÍNEA PARA ESTUDIO Y DEFENSA DEL SEGUNDO PARCIAL
// ============================================================================
// [Línea 1] Directiva de Next.js: marca este archivo como Client Component (se ejecuta en el navegador con estado e interactividad).
"use client";
// Panel lateral fijo y barra superior compartidos por todas las pantallas autenticadas (sección 4 y 8).
// - En pantallas chicas (desde 360 px) el panel lateral se colapsa en un menú desplegable.
// - Resalta el módulo activo.
// - Oculta el módulo "Usuarios" si el rol es vendedor (y además el servidor verifica el rol).
// [Línea 6] Importa elementos desde 'react'.
import * as React from "react";
// [Línea 7] Importa elementos desde 'next/link'.
import Link from "next/link";
// [Línea 8] Importa elementos desde 'next/navigation'.
import { usePathname, useRouter } from "next/navigation";
// [Línea 9] Inicia un bloque de importación de dependencias.
import {
  // [Línea 10] Importa 'LayoutDashboard' desde el módulo.
  LayoutDashboard,
  // [Línea 11] Importa 'ShoppingCart' desde el módulo.
  ShoppingCart,
  // [Línea 12] Importa 'FileText' desde el módulo.
  FileText,
  // [Línea 13] Importa 'Package' desde el módulo.
  Package,
  // [Línea 14] Importa 'Tags' desde el módulo.
  Tags,
  // [Línea 15] Importa 'Users' desde el módulo.
  Users,
  // [Línea 16] Importa 'Wallet' desde el módulo.
  Wallet,
  // [Línea 17] Importa 'UserCog' desde el módulo.
  UserCog,
  // [Línea 18] Importa 'KeyRound' desde el módulo.
  KeyRound,
  // [Línea 19] Importa 'LogOut' desde el módulo.
  LogOut,
  // [Línea 20] Importa 'Menu' desde el módulo.
  Menu,
  // [Línea 21] Importa 'X' desde el módulo.
  X,
  // [Línea 22] Importa 'Store' desde el módulo.
  Store,
// [Línea 23] Cierra la lista de importaciones provenientes del módulo 'lucide-react'.
} from "lucide-react";
// [Línea 24] Importa elementos desde 'sonner'.
import { toast } from "sonner";
// [Línea 25] Importa elementos desde '@/componentes/ui/button'.
import { Button } from "@/componentes/ui/button";
// [Línea 26] Importa elementos desde '@/componentes/comunes/insignias'.
import { InsigniaRol } from "@/componentes/comunes/insignias";
// [Línea 27] Importa elementos desde '@/componentes/primitivas/maquetacion'.
import { Alinear, Apilar, Caja, Texto } from "@/componentes/primitivas/maquetacion";
// [Línea 28] Importa elementos desde '@/lib/utils'.
import { cn } from "@/lib/utils";
// [Línea 29] Importa tipos de TypeScript (solo para chequeo al compilar): import type { UsuarioSesion } from "@/servicios/comunes";
import type { UsuarioSesion } from "@/servicios/comunes";

// [Línea 31] Define el tipo de datos 'ItemNavegacion' en TypeScript.
type ItemNavegacion = {
  // [Línea 32] Define o asigna el campo/parámetro 'etiqueta'.
  etiqueta: string;
  // [Línea 33] Define o asigna el campo/parámetro 'ruta'.
  ruta: string;
  // [Línea 34] Define o asigna el campo/parámetro 'icono'.
  icono: React.ComponentType<{ className?: string }>;
  // [Línea 35] Ejecuta o evalúa: soloAdmin?: boolean;
  soloAdmin?: boolean;
  // [Línea 36] Ejecuta o evalúa: coincidenciaExacta?: boolean;
  coincidenciaExacta?: boolean;
// [Línea 37] Cierra el bloque o estructura (};).
};

// [Línea 39] Declara 'ITEMS_MENU: ItemNavegacion[]' y le asigna el valor resultante.
const ITEMS_MENU: ItemNavegacion[] = [
  // [Línea 40] Ejecuta o evalúa: { etiqueta: "Inicio", ruta: "/", icono: LayoutDashboard, coincidenciaExacta: tru
  { etiqueta: "Inicio", ruta: "/", icono: LayoutDashboard, coincidenciaExacta: true },
  // [Línea 41] Ejecuta o evalúa: { etiqueta: "Nueva venta", ruta: "/ventas/nueva", icono: ShoppingCart, coinciden
  { etiqueta: "Nueva venta", ruta: "/ventas/nueva", icono: ShoppingCart, coincidenciaExacta: true },
  // [Línea 42] Ejecuta o evalúa: { etiqueta: "Facturas", ruta: "/ventas", icono: FileText, coincidenciaExacta: tr
  { etiqueta: "Facturas", ruta: "/ventas", icono: FileText, coincidenciaExacta: true },
  // [Línea 43] Ejecuta o evalúa: { etiqueta: "Productos", ruta: "/productos", icono: Package, coincidenciaExacta:
  { etiqueta: "Productos", ruta: "/productos", icono: Package, coincidenciaExacta: true },
  // [Línea 44] Ejecuta o evalúa: { etiqueta: "Categorías", ruta: "/productos/categorias", icono: Tags, coincidenc
  { etiqueta: "Categorías", ruta: "/productos/categorias", icono: Tags, coincidenciaExacta: true },
  // [Línea 45] Ejecuta o evalúa: { etiqueta: "Clientes", ruta: "/clientes", icono: Users, coincidenciaExacta: tru
  { etiqueta: "Clientes", ruta: "/clientes", icono: Users, coincidenciaExacta: true },
  // [Línea 46] Ejecuta o evalúa: { etiqueta: "Saldos", ruta: "/clientes/saldos", icono: Wallet, coincidenciaExact
  { etiqueta: "Saldos", ruta: "/clientes/saldos", icono: Wallet, coincidenciaExacta: true },
  // [Línea 47] Ejecuta o evalúa: { etiqueta: "Usuarios", ruta: "/usuarios", icono: UserCog, soloAdmin: true },
  { etiqueta: "Usuarios", ruta: "/usuarios", icono: UserCog, soloAdmin: true },
// [Línea 48] Ejecuta o evalúa: ];
];

// [Línea 50] Declara la función o componente 'EstructuraAplicacion'.
export function EstructuraAplicacion({
  // [Línea 51] Ejecuta o evalúa: usuario,
  usuario,
  // [Línea 52] Ejecuta o evalúa: children,
  children,
// [Línea 53] Ejecuta o evalúa: }: {
}: {
  // [Línea 54] Define o asigna el campo/parámetro 'usuario'.
  usuario: UsuarioSesion;
  // [Línea 55] Define o asigna el campo/parámetro 'children'.
  children: React.ReactNode;
// [Línea 56] Ejecuta o evalúa: }) {
}) {
  // [Línea 57] Declara 'pathname' y le asigna el valor resultante.
  const pathname = usePathname();
  // [Línea 58] Declara 'router' y le asigna el valor resultante.
  const router = useRouter();
  // [Línea 59] Estado reactivo de React [menuMovilAbierto, setMenuMovilAbierto]: guarda el valor actual y la función para actualizarlo.
  const [menuMovilAbierto, setMenuMovilAbierto] = useState(false);

  // [Línea 61] Declara 'itemsVisibles' y le asigna el valor resultante.
  const itemsVisibles = ITEMS_MENU.filter(
    // [Línea 62] Ejecuta o evalúa: (item) => !item.soloAdmin || usuario.rol === "admin",
    (item) => !item.soloAdmin || usuario.rol === "admin",
  // [Línea 63] Cierra el bloque o estructura ();).
  );

  // [Línea 65] Declara la función o componente 'estaActivo'.
  function estaActivo(item: ItemNavegacion) {
    // [Línea 66] Verifica la condición: if (item.coincidenciaExacta) {
    if (item.coincidenciaExacta) {
      // [Línea 67] Verifica la condición: if (item.ruta === "/ventas" && pathname.startsWith("/ventas/") && pathname !== "/ventas/nueva") {
      if (item.ruta === "/ventas" && pathname.startsWith("/ventas/") && pathname !== "/ventas/nueva") {
        // [Línea 68] Devuelve el valor: true;
        return true;
      // [Línea 69] Cierra el bloque o estructura (}).
      }
      // [Línea 70] Verifica la condición: if (
      if (
        // [Línea 71] Ejecuta o evalúa: item.ruta === "/productos" &&
        item.ruta === "/productos" &&
        // [Línea 72] Ejecuta o evalúa: pathname.startsWith("/productos/") &&
        pathname.startsWith("/productos/") &&
        // [Línea 73] Ejecuta o evalúa: !pathname.startsWith("/productos/categorias")
        !pathname.startsWith("/productos/categorias")
      // [Línea 74] Ejecuta o evalúa: ) {
      ) {
        // [Línea 75] Devuelve el valor: true;
        return true;
      // [Línea 76] Cierra el bloque o estructura (}).
      }
      // [Línea 77] Verifica la condición: if (
      if (
        // [Línea 78] Ejecuta o evalúa: item.ruta === "/clientes" &&
        item.ruta === "/clientes" &&
        // [Línea 79] Ejecuta o evalúa: pathname.startsWith("/clientes/") &&
        pathname.startsWith("/clientes/") &&
        // [Línea 80] Ejecuta o evalúa: !pathname.startsWith("/clientes/saldos")
        !pathname.startsWith("/clientes/saldos")
      // [Línea 81] Ejecuta o evalúa: ) {
      ) {
        // [Línea 82] Devuelve el valor: true;
        return true;
      // [Línea 83] Cierra el bloque o estructura (}).
      }
      // [Línea 84] Devuelve el valor: pathname === item.ruta;
      return pathname === item.ruta;
    // [Línea 85] Cierra el bloque o estructura (}).
    }
    // [Línea 86] Devuelve el valor: pathname.startsWith(item.ruta);
    return pathname.startsWith(item.ruta);
  // [Línea 87] Cierra el bloque o estructura (}).
  }

  // [Línea 89] Declara la función asíncrona 'cerrarSesion'.
  async function cerrarSesion() {
    // [Línea 90] Espera a que se complete la operación asíncrona: await fetch("/api/auth/logout", { method: "POST" });
    await fetch("/api/auth/logout", { method: "POST" });
    // [Línea 91] Muestra un aviso emergente en pantalla: toast.success("Sesión cerrada");
    toast.success("Sesión cerrada");
    // [Línea 92] Ejecuta o evalúa: router.push("/login");
    router.push("/login");
    // [Línea 93] Ejecuta o evalúa: router.refresh();
    router.refresh();
  // [Línea 94] Cierra el bloque o estructura (}).
  }

  // [Línea 96] Declara 'contenidoMenu' y le asigna el valor resultante.
  const contenidoMenu = (
    <Apilar className="h-full justify-between p-4"> // [Línea 97] Abre o renderiza el componente visual <Apilar>.
      <Apilar className="gap-6"> // [Línea 98] Abre o renderiza el componente visual <Apilar>.
        <Alinear className="gap-2.5 px-2"> // [Línea 99] Abre o renderiza el componente visual <Alinear>.
          <Caja className="flex size-9 items-center justify-center rounded-lg bg-primary text-primary-foreground shadow-xs"> // [Línea 100] Abre o renderiza el componente visual <Caja>.
            <Store className="size-5" /> // [Línea 101] Abre o renderiza el componente visual <Store>.
          </Caja> // [Línea 102] Cierra el componente visual </Caja>.
          <Apilar className="gap-0"> // [Línea 103] Abre o renderiza el componente visual <Apilar>.
            <Texto negrita tamano="base"> // [Línea 104] Abre o renderiza el componente visual <Texto>.
              // [Línea 105] Ejecuta o evalúa: Ferretería El Yunque
              Ferretería El Yunque
            </Texto> // [Línea 106] Cierra el componente visual </Texto>.
            <Texto tamano="xs" tono="suave"> // [Línea 107] Abre o renderiza el componente visual <Texto>.
              // [Línea 108] Ejecuta o evalúa: Gestión comercial
              Gestión comercial
            </Texto> // [Línea 109] Cierra el componente visual </Texto>.
          </Apilar> // [Línea 110] Cierra el componente visual </Apilar>.
        </Alinear> // [Línea 111] Cierra el componente visual </Alinear>.

        <nav className="flex flex-col gap-1" aria-label="Menú principal"> // [Línea 113] Abre o renderiza el componente visual <nav>.
          // [Línea 114] Ejecuta o evalúa: {itemsVisibles.map((item) => {
          {itemsVisibles.map((item) => {
            // [Línea 115] Declara 'Icono' y le asigna el valor resultante.
            const Icono = item.icono;
            // [Línea 116] Declara 'activo' y le asigna el valor resultante.
            const activo = estaActivo(item);
            // [Línea 117] Devuelve la interfaz JSX que renderiza este componente.
            return (
              <Link // [Línea 118] Abre o renderiza el componente visual <Link>.
                // [Línea 119] Ejecuta o evalúa: key={item.ruta}
                key={item.ruta}
                // [Línea 120] Ejecuta o evalúa: href={item.ruta}
                href={item.ruta}
                // [Línea 121] Ejecuta o evalúa: onClick={() => setMenuMovilAbierto(false)}
                onClick={() => setMenuMovilAbierto(false)}
                // [Línea 122] Ejecuta o evalúa: className={cn(
                className={cn(
                  // [Línea 123] Ejecuta o evalúa: "flex items-center gap-3 rounded-lg px-3 py-2 text-sm font-medium transition-col
                  "flex items-center gap-3 rounded-lg px-3 py-2 text-sm font-medium transition-colors",
                  // [Línea 124] Ejecuta o evalúa: activo
                  activo
                    // [Línea 125] Ejecuta o evalúa: ? "bg-primary text-primary-foreground shadow-xs"
                    ? "bg-primary text-primary-foreground shadow-xs"
                    // [Línea 126] Ejecuta o evalúa: : "text-foreground/80 hover:bg-secondary hover:text-foreground",
                    : "text-foreground/80 hover:bg-secondary hover:text-foreground",
                // [Línea 127] Ejecuta o evalúa: )}
                )}
              // [Línea 128] Ejecuta o evalúa: >
              >
                <Icono className="size-4 shrink-0" /> // [Línea 129] Abre o renderiza el componente visual <Icono>.
                // [Línea 130] Ejecuta o evalúa: {item.etiqueta}
                {item.etiqueta}
              </Link> // [Línea 131] Cierra el componente visual </Link>.
            // [Línea 132] Cierra el bloque o estructura ();).
            );
          // [Línea 133] Ejecuta o evalúa: })}
          })}
        </nav> // [Línea 134] Cierra el componente visual </nav>.
      </Apilar> // [Línea 135] Cierra el componente visual </Apilar>.

      <Apilar className="gap-2 border-t border-border pt-3"> // [Línea 137] Abre o renderiza el componente visual <Apilar>.
        <Link // [Línea 138] Abre o renderiza el componente visual <Link>.
          // [Línea 139] Ejecuta o evalúa: href="/perfil"
          href="/perfil"
          // [Línea 140] Ejecuta o evalúa: onClick={() => setMenuMovilAbierto(false)}
          onClick={() => setMenuMovilAbierto(false)}
          // [Línea 141] Ejecuta o evalúa: className={cn(
          className={cn(
            // [Línea 142] Ejecuta o evalúa: "flex items-center gap-3 rounded-lg px-3 py-2 text-sm font-medium transition-col
            "flex items-center gap-3 rounded-lg px-3 py-2 text-sm font-medium transition-colors",
            // [Línea 143] Ejecuta o evalúa: pathname === "/perfil"
            pathname === "/perfil"
              // [Línea 144] Ejecuta o evalúa: ? "bg-primary text-primary-foreground"
              ? "bg-primary text-primary-foreground"
              // [Línea 145] Ejecuta o evalúa: : "text-foreground/80 hover:bg-secondary",
              : "text-foreground/80 hover:bg-secondary",
          // [Línea 146] Ejecuta o evalúa: )}
          )}
        // [Línea 147] Ejecuta o evalúa: >
        >
          <KeyRound className="size-4" /> // [Línea 148] Abre o renderiza el componente visual <KeyRound>.
          // [Línea 149] Ejecuta o evalúa: Mi perfil
          Mi perfil
        </Link> // [Línea 150] Cierra el componente visual </Link>.
      </Apilar> // [Línea 151] Cierra el componente visual </Apilar>.
    </Apilar> // [Línea 152] Cierra el componente visual </Apilar>.
  // [Línea 153] Cierra el bloque o estructura ();).
  );

  // [Línea 155] Devuelve la interfaz JSX que renderiza este componente.
  return (
    <Caja className="min-h-screen flex bg-background"> // [Línea 156] Abre o renderiza el componente visual <Caja>.
      // [Línea 157] Ejecuta o evalúa: {/* Panel lateral fijo en escritorio */}
      {/* Panel lateral fijo en escritorio */}
      <aside className="hidden md:flex md:w-60 md:shrink-0 md:flex-col border-r border-border bg-card no-imprimir"> // [Línea 158] Abre o renderiza el componente visual <aside>.
        // [Línea 159] Ejecuta o evalúa: {contenidoMenu}
        {contenidoMenu}
      </aside> // [Línea 160] Cierra el componente visual </aside>.

      // [Línea 162] Ejecuta o evalúa: {/* Menú colapsable en pantallas chicas (360px+) */}
      {/* Menú colapsable en pantallas chicas (360px+) */}
      // [Línea 163] Ejecuta o evalúa: {menuMovilAbierto && (
      {menuMovilAbierto && (
        <Caja className="fixed inset-0 z-50 flex md:hidden no-imprimir"> // [Línea 164] Abre o renderiza el componente visual <Caja>.
          <Caja // [Línea 165] Abre o renderiza el componente visual <Caja>.
            // [Línea 166] Ejecuta o evalúa: className="fixed inset-0 bg-slate-950/50"
            className="fixed inset-0 bg-slate-950/50"
            // [Línea 167] Ejecuta o evalúa: onClick={() => setMenuMovilAbierto(false)}
            onClick={() => setMenuMovilAbierto(false)}
          // [Línea 168] Ejecuta o evalúa: />
          />
          <aside className="relative z-10 flex w-64 flex-col bg-card shadow-xl"> // [Línea 169] Abre o renderiza el componente visual <aside>.
            <Button // [Línea 170] Abre o renderiza el componente visual <Button>.
              // [Línea 171] Ejecuta o evalúa: variant="ghost"
              variant="ghost"
              // [Línea 172] Ejecuta o evalúa: size="icon"
              size="icon"
              // [Línea 173] Ejecuta o evalúa: aria-label="Cerrar menú"
              aria-label="Cerrar menú"
              // [Línea 174] Ejecuta o evalúa: onClick={() => setMenuMovilAbierto(false)}
              onClick={() => setMenuMovilAbierto(false)}
              // [Línea 175] Ejecuta o evalúa: className="absolute top-3 right-3"
              className="absolute top-3 right-3"
            // [Línea 176] Ejecuta o evalúa: >
            >
              <X className="size-5" /> // [Línea 177] Abre o renderiza el componente visual <X>.
            </Button> // [Línea 178] Cierra el componente visual </Button>.
            // [Línea 179] Ejecuta o evalúa: {contenidoMenu}
            {contenidoMenu}
          </aside> // [Línea 180] Cierra el componente visual </aside>.
        </Caja> // [Línea 181] Cierra el componente visual </Caja>.
      // [Línea 182] Ejecuta o evalúa: )}
      )}

      // [Línea 184] Ejecuta o evalúa: {/* Columna principal: barra superior + contenido */}
      {/* Columna principal: barra superior + contenido */}
      <Caja className="flex flex-1 flex-col min-w-0"> // [Línea 185] Abre o renderiza el componente visual <Caja>.
        <header className="sticky top-0 z-30 flex h-14 items-center justify-between border-b border-border bg-card/95 px-4 backdrop-blur-xs md:px-6 no-imprimir"> // [Línea 186] Abre o renderiza el componente visual <header>.
          <Alinear className="gap-2"> // [Línea 187] Abre o renderiza el componente visual <Alinear>.
            <Button // [Línea 188] Abre o renderiza el componente visual <Button>.
              // [Línea 189] Ejecuta o evalúa: variant="ghost"
              variant="ghost"
              // [Línea 190] Ejecuta o evalúa: size="icon"
              size="icon"
              // [Línea 191] Ejecuta o evalúa: aria-label="Abrir menú"
              aria-label="Abrir menú"
              // [Línea 192] Ejecuta o evalúa: onClick={() => setMenuMovilAbierto(true)}
              onClick={() => setMenuMovilAbierto(true)}
              // [Línea 193] Ejecuta o evalúa: className="md:hidden"
              className="md:hidden"
            // [Línea 194] Ejecuta o evalúa: >
            >
              <Menu className="size-5" /> // [Línea 195] Abre o renderiza el componente visual <Menu>.
            </Button> // [Línea 196] Cierra el componente visual </Button>.
            <Texto tamano="sm" tono="suave" className="hidden sm:inline"> // [Línea 197] Abre o renderiza el componente visual <Texto>.
              // [Línea 198] Ejecuta o evalúa: Punto de venta · Mostrador
              Punto de venta · Mostrador
            </Texto> // [Línea 199] Cierra el componente visual </Texto>.
          </Alinear> // [Línea 200] Cierra el componente visual </Alinear>.

          <Alinear className="gap-3"> // [Línea 202] Abre o renderiza el componente visual <Alinear>.
            <Alinear className="gap-2"> // [Línea 203] Abre o renderiza el componente visual <Alinear>.
              <Texto negrita tamano="sm"> // [Línea 204] Abre o renderiza el componente visual <Texto>.
                // [Línea 205] Ejecuta o evalúa: {usuario.nombre}
                {usuario.nombre}
              </Texto> // [Línea 206] Cierra el componente visual </Texto>.
              <InsigniaRol rol={usuario.rol} /> // [Línea 207] Abre o renderiza el componente visual <InsigniaRol>.
            </Alinear> // [Línea 208] Cierra el componente visual </Alinear>.
            <Button variant="outline" size="sm" onClick={cerrarSesion}> // [Línea 209] Abre o renderiza el componente visual <Button>.
              <LogOut className="size-4" /> // [Línea 210] Abre o renderiza el componente visual <LogOut>.
              <Texto tamano="xs" className="hidden sm:inline"> // [Línea 211] Abre o renderiza el componente visual <Texto>.
                // [Línea 212] Ejecuta o evalúa: Salir
                Salir
              </Texto> // [Línea 213] Cierra el componente visual </Texto>.
            </Button> // [Línea 214] Cierra el componente visual </Button>.
          </Alinear> // [Línea 215] Cierra el componente visual </Alinear>.
        </header> // [Línea 216] Cierra el componente visual </header>.

        <main className="flex-1 p-4 md:p-6 max-w-7xl w-full mx-auto">{children}</main> // [Línea 218] Abre o renderiza el componente visual <main>.
      </Caja> // [Línea 219] Cierra el componente visual </Caja>.
    </Caja> // [Línea 220] Cierra el componente visual </Caja>.
  // [Línea 221] Cierra el bloque o estructura ();).
  );
// [Línea 222] Cierra el bloque o estructura (}).
}

// [Línea 224] Declara '{ useState }' y le asigna el valor resultante.
const { useState } = React;
