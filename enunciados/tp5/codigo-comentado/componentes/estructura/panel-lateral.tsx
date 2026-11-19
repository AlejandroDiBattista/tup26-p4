// ============================================================================
// GUÍA DE ESTUDIO - SEGUNDO PARCIAL: PROGRAMACIÓN IV
// Archivo: componentes/estructura/panel-lateral.tsx
// Código comentado con explicaciones sencillas y claras para la defensa oral.
// ============================================================================

// Directiva 'use client': indica que este componente tiene interactividad en el navegador
"use client";
// Panel lateral fijo y barra superior compartidos por todas las pantallas autenticadas (sección 4 y 8).
// - En pantallas chicas (desde 360 px) el panel lateral se colapsa en un menú desplegable.
// - Resalta el módulo activo.
// - Oculta el módulo "Usuarios" si el rol es vendedor (y además el servidor verifica el rol).
import * as React from "react";
import { useState } from "react";
import Link from "next/link";
// Acá importamos funciones de navegación de Next.js (como redirect para cambiar de página)
import { usePathname, useRouter } from "next/navigation";
import {
  LayoutDashboard,
  ShoppingCart,
  FileText,
  Package,
  Tags,
  Users,
  Wallet,
  UserCog,
  KeyRound,
  LogOut,
  Menu,
  X,
  Store,
} from "lucide-react";
import { toast } from "sonner";
// Acá importamos componentes visuales de la interfaz de usuario
import { Button } from "@/componentes/ui/button";
// Acá importamos componentes visuales de la interfaz de usuario
import { InsigniaRol } from "@/componentes/comunes/insignias";
// Acá importamos componentes visuales de la interfaz de usuario
import { Alinear, Apilar, Caja, Texto } from "@/componentes/primitivas/maquetacion";
import { cn } from "@/lib/utils";
// Acá importamos funciones de la capa de servicios donde reside la lógica de negocio
import type { UsuarioSesion } from "@/servicios/comunes";

type ItemNavegacion = {
  etiqueta: string;
  ruta: string;
  icono: React.ComponentType<{ className?: string }>;
  soloAdmin?: boolean;
  coincidenciaExacta?: boolean;
};

const ITEMS_MENU: ItemNavegacion[] = [
  { etiqueta: "Inicio", ruta: "/", icono: LayoutDashboard, coincidenciaExacta: true },
  { etiqueta: "Nueva venta", ruta: "/ventas/nueva", icono: ShoppingCart, coincidenciaExacta: true },
  { etiqueta: "Facturas", ruta: "/ventas", icono: FileText, coincidenciaExacta: true },
  { etiqueta: "Productos", ruta: "/productos", icono: Package, coincidenciaExacta: true },
  { etiqueta: "Categorías", ruta: "/productos/categorias", icono: Tags, coincidenciaExacta: true },
  { etiqueta: "Clientes", ruta: "/clientes", icono: Users, coincidenciaExacta: true },
  { etiqueta: "Saldos", ruta: "/clientes/saldos", icono: Wallet, coincidenciaExacta: true },
  { etiqueta: "Usuarios", ruta: "/usuarios", icono: UserCog, soloAdmin: true },
];

// Componente o función exportada 'EstructuraAplicacion'
export function EstructuraAplicacion({
  usuario,
  children,
}: {
  usuario: UsuarioSesion;
  children: React.ReactNode;
}) {
  const pathname = usePathname();
  const router = useRouter();
  // Definimos una variable de estado React 'menuMovilAbierto' para controlar la interfaz
  const [menuMovilAbierto, setMenuMovilAbierto] = useState(false);

  const itemsVisibles = ITEMS_MENU.filter(
    (item) => !item.soloAdmin || usuario.rol === "admin",
  );

  function estaActivo(item: ItemNavegacion) {
    if (item.coincidenciaExacta) {
      if (item.ruta === "/ventas" && pathname.startsWith("/ventas/") && pathname !== "/ventas/nueva") {
        return true;
      }
      if (
        item.ruta === "/productos" &&
        pathname.startsWith("/productos/") &&
        !pathname.startsWith("/productos/categorias")
      ) {
        return true;
      }
      if (
        item.ruta === "/clientes" &&
        pathname.startsWith("/clientes/") &&
        !pathname.startsWith("/clientes/saldos")
      ) {
        return true;
      }
      return pathname === item.ruta;
    }
    return pathname.startsWith(item.ruta);
  }

  async function cerrarSesion() {
    await fetch("/api/auth/logout", { method: "POST" });
    toast.success("Sesión cerrada");
    router.push("/login");
    router.refresh();
  }

  const contenidoMenu = (
    <Apilar className="h-full justify-between p-4">
      <Apilar className="gap-6">
        <Alinear className="gap-2.5 px-2">
          <Caja className="flex size-9 items-center justify-center rounded-lg bg-primary text-primary-foreground shadow-xs">
            <Store className="size-5" />
          </Caja>
          <Apilar className="gap-0">
            <Texto negrita tamano="base">
              Ferretería El Yunque
            </Texto>
            <Texto tamano="xs" tono="suave">
              Gestión comercial
            </Texto>
          </Apilar>
        </Alinear>

        <nav className="flex flex-col gap-1" aria-label="Menú principal">
          {itemsVisibles.map((item) => {
            const Icono = item.icono;
            const activo = estaActivo(item);
            // Renderizamos la interfaz visual de este componente:
            return (
              <Link
                key={item.ruta}
                href={item.ruta}
                onClick={() => setMenuMovilAbierto(false)}
                className={cn(
                  "flex items-center gap-3 rounded-lg px-3 py-2 text-sm font-medium transition-colors",
                  activo
                    ? "bg-primary text-primary-foreground shadow-xs"
                    : "text-foreground/80 hover:bg-secondary hover:text-foreground",
                )}
              >
                <Icono className="size-4 shrink-0" />
                {item.etiqueta}
              </Link>
            );
          })}
        </nav>
      </Apilar>

      <Apilar className="gap-2 border-t border-border pt-3">
        <Link
          href="/perfil"
          onClick={() => setMenuMovilAbierto(false)}
          className={cn(
            "flex items-center gap-3 rounded-lg px-3 py-2 text-sm font-medium transition-colors",
            pathname === "/perfil"
              ? "bg-primary text-primary-foreground"
              : "text-foreground/80 hover:bg-secondary",
          )}
        >
          <KeyRound className="size-4" />
          Mi perfil
        </Link>
      </Apilar>
    </Apilar>
  );

  // Renderizamos la interfaz visual de este componente:
  return (
    <Caja className="min-h-screen flex bg-background">
      {/* Panel lateral fijo en escritorio */}
      <aside className="hidden md:flex md:w-60 md:shrink-0 md:flex-col border-r border-border bg-card no-imprimir">
        {contenidoMenu}
      </aside>

      {/* Menú colapsable en pantallas chicas (360px+) */}
      {menuMovilAbierto && (
        <Caja className="fixed inset-0 z-50 flex md:hidden no-imprimir">
          <Caja
            className="fixed inset-0 bg-slate-950/50"
            onClick={() => setMenuMovilAbierto(false)}
          />
          <aside className="relative z-10 flex w-64 flex-col bg-card shadow-xl">
            <Button
              variant="ghost"
              size="icon"
              aria-label="Cerrar menú"
              onClick={() => setMenuMovilAbierto(false)}
              className="absolute top-3 right-3"
            >
              <X className="size-5" />
            </Button>
            {contenidoMenu}
          </aside>
        </Caja>
      )}

      {/* Columna principal: barra superior + contenido */}
      <Caja className="flex flex-1 flex-col min-w-0">
        <header className="sticky top-0 z-30 flex h-14 items-center justify-between border-b border-border bg-card/95 px-4 backdrop-blur-xs md:px-6 no-imprimir">
          <Alinear className="gap-2">
            <Button
              variant="ghost"
              size="icon"
              aria-label="Abrir menú"
              onClick={() => setMenuMovilAbierto(true)}
              className="md:hidden"
            >
              <Menu className="size-5" />
            </Button>
            <Texto tamano="sm" tono="suave" className="hidden sm:inline">
              Punto de venta · Mostrador
            </Texto>
          </Alinear>

          <Alinear className="gap-3">
            <Alinear className="gap-2">
              <Texto negrita tamano="sm">
                {usuario.nombre}
              </Texto>
              <InsigniaRol rol={usuario.rol} />
            </Alinear>
            <Button variant="outline" size="sm" onClick={cerrarSesion}>
              <LogOut className="size-4" />
              <Texto tamano="xs" className="hidden sm:inline">
                Salir
              </Texto>
            </Button>
          </Alinear>
        </header>

        <main className="flex-1 p-4 md:p-6 max-w-7xl w-full mx-auto">{children}</main>
      </Caja>
    </Caja>
  );
}
