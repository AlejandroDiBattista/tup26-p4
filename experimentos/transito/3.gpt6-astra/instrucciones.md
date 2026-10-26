# Aforo · Conteo de tránsito

Instalado en esta carpeta siguiendo la [guía solicitada](https://shadcnstudio.com/blog/how-to-set-up-shadcn-with-tailwind-4-using-vite/) y la [documentación oficial de shadcn](https://ui.shadcn.com/docs/installation/vite).

## Ejecutar

```sh
npm install
npm run dev
```

Abrir la URL que muestra Vite. La pantalla permite contar motos, autos y camionetas en un punto de observación.

## Agregar componentes

```sh
npx shadcn@latest add card input label dialog
```

Los componentes se generan en `src/components/ui`. Se importan con el alias `@/`, que apunta a `src`:

```tsx
import { Button } from '@/components/ui/button'
```

## Configuración realizada

- Plantilla `react-ts` de Vite, con npm y `package-lock.json`.
- Tailwind CSS 4 mediante el plugin `@tailwindcss/vite` en `vite.config.ts`.
- Alias `@/*` en `tsconfig.json`, `tsconfig.app.json` y Vite. Se usan rutas relativas sin `baseUrl` para la plantilla actual de TypeScript.
- shadcn/ui inicializado con Base UI, preset Nova y color neutral. El inicializador actual ya genera el componente `Button`.
- Tema y variables CSS en `src/index.css`; opciones de shadcn en `components.json`.
- Aplicación en `src/App.tsx`, estilos en `src/App.css` y lógica de tiempo y conteo en `src/lib/transito.ts`.

Comandos de instalación utilizados después de crear la plantilla:

```sh
npm install tailwindcss@4 @tailwindcss/vite@4
npx shadcn@latest init --template vite --base base --preset nova --yes --no-monorepo
```

La plantilla ya incluye `@types/node`. Antes de inicializar shadcn se configuraron el plugin, el alias y el import de Tailwind en CSS.

## Comprobar y compilar

```sh
npm run lint
npm run build
npm run preview
```

La compilación de producción se genera en `dist/`.

## Usar el contador

1. Escribir el punto de observación (por ejemplo, una intersección).
2. Pulsar **Iniciar conteo**. Cada botón **Sumar** registra un vehículo de su categoría.
3. Usar **−** para corregir un toque equivocado. Las cantidades nunca son negativas.
4. Pulsar **Pausar** cuando no se esté observando y **Continuar** para retomar. Durante una pausa no se agregan vehículos; se permiten correcciones.
5. **Exportar CSV** descarga el punto, inicio (fecha ISO), cantidades, segundos observados y flujo por categoría y total.
6. **Nuevo conteo** pide confirmar antes de borrar cantidades y tiempo; conserva el nombre del punto.

Atajos: `1` motos, `2` autos, `3` camionetas. `Espacio` inicia o pausa cuando no hay un botón o campo enfocado. En un botón, Espacio conserva su funcionamiento normal. Los atajos de conteo no actúan mientras se escribe en el campo.

### Cálculo del flujo

```text
flujo (v/h) = cantidad de vehículos × 3.600 / segundos observados
```

Ejemplo: 60 vehículos en 300 segundos → 720 v/h.

Se usa el tiempo efectivo con precisión de milisegundos, excluyendo las pausas. El reloj visible muestra horas, minutos y segundos completos. Antes del primer segundo aparece `—`; luego el flujo se muestra redondeado a vehículos por hora enteros. El CSV conserva dos decimales. El flujo es una estimación, no una predicción del tráfico futuro; una muestra muy corta puede producir valores altos.

### Guardado

La sesión se conserva en `localStorage` con la clave `aforo-conteo-v1`, sin enviar información a un servidor. El reloj usa marcas de tiempo y sigue transcurriendo al cambiar de pestaña o cerrar la página si no se pausó. Usar una sola pestaña para contar y pausar cuando se interrumpa la observación. Borrar los datos del navegador elimina la sesión; el CSV permite conservar una copia.

### Pruebas

```sh
npm test
npm run lint
npm run build
```

Las pruebas verifican el flujo, las pausas y reanudaciones, las correcciones, la recuperación de datos y el formato del reloj. Requieren Node.js 22.12 o posterior, como el proyecto Vite.

## Organización en componentes

`App.tsx` compone la pantalla y conecta las propiedades y eventos de cada sección con una única sesión de conteo.

```text
src/
├── App.tsx
├── App.css
├── components/
│   ├── transito/
│   │   ├── Encabezado.tsx       # Marca, presentación y botón de exportación
│   │   ├── Observacion.tsx      # Punto, cronómetro y pausa/continuación
│   │   ├── Contadores.tsx       # Lista de categorías
│   │   ├── ContadorVehiculo.tsx # Contador reutilizado para cada vehículo
│   │   ├── ResumenTransito.tsx  # Flujo total, distribución y explicación
│   │   └── ControlesSesion.tsx # Guardado, reinicio, confirmación y atajos visibles
│   └── ui/                    # Componentes base de shadcn
├── hooks/
│   └── useConteo.ts           # Estado, persistencia, reloj, acciones y teclado
└── lib/
    ├── transito.ts            # Reglas y cálculos de tránsito
    ├── categorias.ts         # Categorías y teclas compartidas
    ├── formato.ts            # Presentación de cantidades y flujo
    └── exportarConteo.ts      # Generación y descarga del CSV
```

Los componentes reciben datos y callbacks tipados; no modifican directamente el almacenamiento. `useConteo` mantiene una sola fuente de estado para toda la pantalla. Los cálculos siguen en funciones independientes de React, verificadas por las pruebas existentes. Se conservan las clases CSS, los controles, la clave de almacenamiento y el formato del CSV.
