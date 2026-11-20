# Agenda de contactos con React, Vite y Zustand

Tutorial paso a paso para construir una aplicación **maestro/detalle** como un proyecto profesional: con Vite, dependencias instaladas con npm y la interfaz dividida en muchos componentes chicos, cada uno en su archivo y en su carpeta.

La aplicación terminada permite:

- ver la lista de contactos ordenada y agrupada por letra (el **maestro**);
- seleccionar un contacto y ver sus datos (el **detalle**);
- buscar por nombre, apellido, teléfono o email, sin importar acentos ni mayúsculas;
- crear, modificar y eliminar contactos, con validación;
- conservar los datos al recargar la página, gracias a `localStorage`;
- adaptarse a pantallas angostas mostrando un panel por vez.

De React usamos **solo dos hooks: `useState` y `useEffect`**. Con ellos construimos dos hooks propios: `useForm` para el formulario y `usePersistencia` para guardar los datos.

---

## Contenido

1. [Configuración](#paso-1-configuración)
2. [El módulo agenda: datos y reglas](#paso-2-el-módulo-agenda-datos-y-reglas)
3. [La interfaz: componentes comunes y estructura](#paso-3-la-interfaz-componentes-comunes-y-estructura)
4. [La lista](#paso-4-la-lista)
5. [Mostrar el detalle](#paso-5-mostrar-el-detalle)
6. [Búsqueda](#paso-6-búsqueda)
7. [Edición: alta, modificación y baja con `useForm`](#paso-7-edición-alta-modificación-y-baja-con-useform)
8. [Persistencia con hooks](#paso-8-persistencia-con-hooks)
9. [Pantallas angostas](#paso-9-pantallas-angostas)
10. [Versión de producción y resumen](#paso-10-versión-de-producción-y-resumen)

---

## Qué vamos a construir

```text
┌───────────────────────────────────────────────────────────────────┐
│ [o] Agenda   11 contactos                             [+ Nuevo]   │  ← Encabezado
├──────────────────────────┬────────────────────────────────────────┤
│ [ Buscar...           ]  │                                        │
│ 11 contactos             │    ┌──────────────────────────────┐    │
│ A                        │    │ (LB)  Lucía Bustos           │    │
│ (MÁ) Martín Álvarez      │    │                              │    │
│ B                        │    │ Teléfono  +54 381 555-0142   │    │
│ (LB) Lucía Bustos  ◀─────┼────│ Email     lucia.bustos@...   │    │
│ D                        │    │ Notas     Compañera de...    │    │
│ (BD) Bruno Díaz          │    │                              │    │
│ ...                      │    │ [Editar]  [Eliminar]         │    │
│ Se guarda...  [Restaurar]│    └──────────────────────────────┘    │
└──────────────────────────┴────────────────────────────────────────┘
     PanelLista                         PanelDetalle
```

## Los problemas y las herramientas

Antes de escribir código conviene tener claro **qué problema resuelve cada pieza**. Si una herramienta no resuelve un problema concreto, sobra.

| Problema                                                                                                 | Herramienta                                            | Cómo lo resuelve                                                                                                                   |
| -------------------------------------------------------------------------------------------------------- | ------------------------------------------------------ | ---------------------------------------------------------------------------------------------------------------------------------- |
| Descargar e instalar librerías con sus versiones exactas                                                 | **npm**                                                | Lee `package.json`, baja los paquetes a `node_modules` y anota las versiones en `package-lock.json`                                |
| El navegador no entiende JSX ni sabe encontrar `import ... from "react"`                                 | **Vite**                                               | En desarrollo traduce cada archivo al vuelo y resuelve los imports; al publicar, empaqueta todo en unos pocos archivos optimizados |
| Ver los cambios sin recargar ni perder lo que estaba en pantalla                                         | **Vite + `@vitejs/plugin-react`**                      | Recarga en caliente: reemplaza solo el componente modificado                                                                       |
| Mantener la pantalla sincronizada con los datos sin tocar el DOM a mano                                  | **React**                                              | Describimos *cómo se ve* la interfaz para un estado dado; React calcula qué cambiar en el DOM                                      |
| Escribir esa descripción de forma legible                                                                | **JSX**                                                | Sintaxis parecida a HTML dentro de JavaScript                                                                                      |
| Que el código no sea un único archivo gigante                                                            | **Módulos ES** (`import` / `export`) y **componentes** | Cada pieza en su archivo, cada archivo en la carpeta de su área                                                                    |
| La lista y el detalle necesitan los mismos datos, pero están en ramas distintas del árbol de componentes | **Zustand**                                            | Un *store*: estado compartido fuera de los componentes, al que cada uno se suscribe                                                |
| Recordar datos propios de un componente                                                                  | **`useState`**                                         | Guarda un valor entre dibujos y vuelve a dibujar cuando cambia                                                                     |
| Hablar con el mundo exterior (por ejemplo, `localStorage`)                                               | **`useEffect`**                                        | Ejecuta código después de dibujar, y lo limpia cuando hace falta                                                                   |
| Manejar un formulario sin repetir código en cada campo                                                   | **`useForm`** (hook propio)                            | Guarda valores y errores, y conecta cada campo con una sola línea                                                                  |
| Que los datos sobrevivan a una recarga                                                                   | **`usePersistencia`** (hook propio)                    | Lee al arrancar y guarda cada vez que los contactos cambian                                                                        |
| Que un formulario arranque "limpio" al cambiar de contacto                                               | **`key`**                                              | Una `key` distinta hace que React descarte el componente y cree uno nuevo                                                          |

---

## Paso 1. Configuración

### 1.1 El problema

Queremos escribir código como este:

```jsx
import { useState } from "react";

export function Contador() {
  const [valor, setValor] = useState(0);
  return <>
      <button onClick={() => setValor(valor + 1)}>
        {valor}
      </button>
    </>;
}
```

repartido en decenas de archivos, y que el navegador lo ejecute. Hay varios obstáculos:

1. **JSX no es JavaScript.** `<button>` dentro de una función no es algo que el navegador entienda.
2. **`"react"` no es una dirección.** El navegador solo sabe importar desde URLs (`https://...`, `./archivo.js`). React está en la carpeta `node_modules`, y un nombre suelto como `"react"` no le dice dónde buscarlo.
3. **Muchos archivos, muchas descargas.** Con cuarenta archivos, publicar la aplicación así significaría cuarenta pedidos al servidor, más los de las librerías.
4. **Cada cambio, una recarga.** Al desarrollar queremos ver el resultado al guardar, sin perder lo que estaba en pantalla (por ejemplo, un formulario a medio llenar).

### 1.2 Qué hace Vite

**Vite** es la herramienta que resuelve los cuatro. Trabaja en dos modos:

```text
Desarrollo (npm run dev)                          Producción (npm run build)
────────────────────────                          ──────────────────────────
navegador pide /src/App.jsx                       Vite lee TODOS los archivos
        │                                                 │
        ▼                                                 ▼
Vite traduce el JSX, reescribe                    traduce, une y comprime
import "react" → /node_modules/...                        │
        │                                                 ▼
        ▼                                         dist/index.html
navegador ejecuta el módulo                       dist/assets/index-xxxx.js   (uno)
                                                  dist/assets/index-xxxx.css  (uno)
al guardar un archivo: Vite avisa al
navegador y reemplaza solo ese módulo
```

- En **desarrollo**, Vite es un servidor web. Cuando el navegador le pide un archivo, lo traduce en ese momento (JSX a JavaScript) y reescribe los imports para que apunten a archivos reales. Como cada archivo se procesa recién cuando se pide, arranca en menos de un segundo aunque el proyecto sea grande.
- Al guardar un cambio, Vite le avisa al navegador cuál módulo cambió, y este lo reemplaza **sin recargar la página**. Se llama *recarga en caliente* (*Hot Module Replacement*, HMR).
- Para **producción**, Vite une todos los archivos en unos pocos, los comprime y les pone nombres con un código que cambia con el contenido (para que el navegador no use una copia vieja). El resultado queda en la carpeta `dist/`, lista para subir a cualquier servidor.

Vite necesita **Node.js** versión 20.19 o posterior (o 22.12 o posterior). Comprobalo con:

```bash
node --version
```

### 1.3 Crear el proyecto

Vite trae un generador (`npm create vite@latest`) que arma todo de una vez. Lo vamos a hacer a mano, archivo por archivo, para entender qué hace cada uno. Son cinco.

Creá una carpeta `agenda` y, adentro, el archivo `package.json`:

```json
{
  "name": "agenda",
  "private": true,
  "version": "1.0.0",
  "type": "module",
  "scripts": {
    "dev": "vite",
    "build": "vite build",
    "preview": "vite preview"
  },
  "dependencies": {
    "react": "^19.3.1",
    "react-dom": "^19.3.1",
    "zustand": "^5.0.16"
  },
  "devDependencies": {
    "@vitejs/plugin-react": "^6.1.2",
    "vite": "^8.3.5"
  }
}
```

`package.json` es la ficha del proyecto:

- **`"type": "module"`** indica que los archivos `.js` usan `import` y `export` (módulos ES), y no la sintaxis antigua de Node (`require`).
- **`scripts`** son atajos. `npm run dev` ejecuta `vite`, `npm run build` ejecuta `vite build`, y así.
- **`dependencies`** son las librerías que forman parte de la aplicación: React, ReactDOM y Zustand.
- **`devDependencies`** son herramientas que solo se usan para desarrollar y compilar: Vite y su plugin para React. No llegan al navegador.
- **`^19.3.1`** significa "la 19.3.1 o cualquier versión posterior que no cambie el primer número". Las versiones con el mismo número principal no deberían romper nada.

Desde la carpeta `agenda`, instalá todo:

```bash
npm install
```

npm descarga los paquetes (y los paquetes que esos paquetes necesitan) a la carpeta `node_modules`, y crea `package-lock.json` con la **versión exacta** que instaló de cada uno. Si otra persona clona el proyecto y ejecuta `npm install`, obtiene exactamente las mismas versiones. `node_modules` se puede borrar y regenerar en cualquier momento; nunca se sube a un repositorio.

### 1.4 La configuración de Vite

```js
// vite.config.js
import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";

export default defineConfig({
  plugins: [react()],
});
```

Vite, por sí solo, sabe servir y empaquetar JavaScript, CSS y HTML. El **plugin de React** le agrega dos cosas: traducir JSX y la *recarga en caliente* especial para componentes (*Fast Refresh*), que conserva el estado de los componentes al guardar un cambio. `defineConfig` no hace nada en tiempo de ejecución: solo le permite al editor sugerir las opciones disponibles.

### 1.5 La página

En la raíz del proyecto (no en `src`), el archivo `index.html`:

```html
<!doctype html>
<html lang="es">
  <head>
    <meta charset="UTF-8" />
    <meta name="viewport" content="width=device-width, initial-scale=1.0" />
    <title>Agenda · React + Zustand</title>
  </head>
  <body>
    <div id="root"></div>
    <script type="module" src="/src/main.jsx"></script>
  </body>
</html>
```

Es la única página de la aplicación. Tiene un `<div id="root">` vacío, donde React va a dibujar todo, y un único script: el **punto de entrada**, `src/main.jsx`. Ese archivo importa otros, que importan otros, y así se arma el árbol completo. Vite sigue ese árbol de imports: lo que no se importa desde algún lado, no existe para la aplicación.

`type="module"` le indica al navegador que el script usa `import` y `export`.

### 1.6 El punto de entrada y el primer componente

Creá la carpeta `src` y, adentro, dos archivos:

```jsx
// src/main.jsx  ·  versión provisoria: la completamos en el paso 3
import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import { App } from "./App.jsx";

createRoot(document.getElementById("root")).render(
  <StrictMode>
    <App />
  </StrictMode>
);
```

```jsx
// src/App.jsx  ·  versión provisoria: la reemplazamos en el paso 2
export function App() {
  return <h1>¡Hola, agenda!</h1>;
}
```

- `createRoot` toma un elemento del DOM y lo convierte en la **raíz** de una aplicación React. `render(<App />)` dibuja el componente `App` adentro.
- `StrictMode` no dibuja nada visible: en desarrollo, activa comprobaciones extra que avisan de errores comunes. Una de ellas la vamos a ver en el paso 8.
- `export function App` exporta el componente con su nombre (*export con nombre*), y `import { App } from "./App.jsx"` lo importa con ese mismo nombre. Usamos siempre esta forma: si un componente cambia de nombre, el editor encuentra todos los lugares donde se usa.
- Escribimos la extensión en los imports propios (`./App.jsx`). Vite la encuentra aunque no la pongamos, pero así se ve de un vistazo qué tipo de archivo es.

Por convención, los archivos que contienen JSX llevan la extensión `.jsx`, y los de JavaScript puro, `.js`.

### 1.7 Probar

```bash
npm run dev
```

Vite muestra una dirección, normalmente `http://localhost:5173/`. Abrila en el navegador: deberías ver **¡Hola, agenda!**.

Ahora, **sin cerrar el navegador**, cambiá el texto del `<h1>` y guardá. El cambio aparece al instante, sin recargar. Esa es la recarga en caliente. Dejá `npm run dev` corriendo durante todo el tutorial; para detenerlo, Ctrl+C en la terminal.

Si algo falla, mirá dos lugares: la **terminal** donde corre Vite (errores de sintaxis o de imports) y la **consola del navegador** (F12, errores al ejecutar). Vite además muestra los errores de compilación sobre la página misma.

### 1.8 La organización de las carpetas

Al terminar, el proyecto va a tener esta forma. Conviene verla ahora para saber dónde va cada cosa:

```text
agenda/
├── index.html                 la página
├── package.json               dependencias y scripts
├── vite.config.js             configuración de Vite
└── src/
    ├── main.jsx               punto de entrada
    ├── App.jsx                el componente raíz: arma la pantalla
    ├── App.css
    ├── estilos/
    │   └── base.css           colores, tipografía y reglas generales
    ├── agenda/                el dominio: datos y reglas, sin interfaz
    │   ├── contacto.js
    │   ├── ejemplos.js
    │   ├── texto.js
    │   ├── orden.js
    │   ├── busqueda.js
    │   └── validacion.js
    ├── store/
    │   └── useAgenda.js       el estado compartido (Zustand)
    ├── hooks/                 hooks propios
    │   ├── useForm.js
    │   └── usePersistencia.js
    └── componentes/
        ├── comunes/           piezas reutilizables, sin lógica de la agenda
        │   ├── Acciones.jsx · Avatar.jsx · Boton.jsx · Campo.jsx · Tarjeta.jsx
        │   └── comunes.css
        ├── encabezado/        la barra superior
        │   ├── Encabezado.jsx · Marca.jsx · Contador.jsx
        │   └── encabezado.css
        ├── lista/             el panel maestro
        │   ├── PanelLista.jsx · CajaBusqueda.jsx · ListaContactos.jsx
        │   ├── GrupoLetra.jsx · ItemContacto.jsx · PieLista.jsx
        │   └── lista.css
        ├── detalle/           el panel de detalle
        │   ├── PanelDetalle.jsx · FichaContacto.jsx · CabeceraContacto.jsx
        │   ├── DatosContacto.jsx · Dato.jsx · AccionesFicha.jsx
        │   ├── SinSeleccion.jsx · BotonVolver.jsx
        │   └── detalle.css
        └── formulario/        alta y edición
            ├── FormularioContacto.jsx
            └── formulario.css
```

Las reglas que seguimos:

- **Separar por responsabilidad.** `agenda/` tiene las reglas del negocio, `store/` el estado compartido, `hooks/` la lógica reutilizable de React y `componentes/` lo que se ve.
- **Los componentes se agrupan por área de la pantalla**: todo lo del panel de la lista va en `lista/`, todo lo del detalle en `detalle/`. Lo que se usa en varias áreas va en `comunes/`.
- **Un componente por archivo**, con el mismo nombre que el componente y en *PascalCase* (`ItemContacto.jsx` exporta `ItemContacto`). React exige que los componentes empiecen con mayúscula: así distingue `<ItemContacto>` (un componente nuestro) de `<li>` (una etiqueta HTML).
- **Una hoja de estilos por carpeta**, importada por los componentes de esa carpeta.
- **Los hooks se llaman `useAlgo`.** Es una convención que React exige: así reconoce qué funciones siguen las reglas de los hooks.

### 1.9 Las reglas del juego: solo `useState` y `useEffect`

React trae una docena de hooks. Los dos fundamentales son:

- **`useState`**: un componente **recuerda** un valor entre dibujos, y se vuelve a dibujar cuando ese valor cambia;
- **`useEffect`**: un componente **actúa sobre el mundo exterior** (el navegador, el almacenamiento, la red) después de dibujarse.

La mayoría de los otros son atajos u optimizaciones. En este tutorial usamos solo esos dos, y cada vez que aparezca una situación donde se suele usar otro, vamos a ver cómo resolverla sin él:

| Necesidad                                               | Hook que se suele usar | Cómo lo resolvemos                                                                     |
| ------------------------------------------------------- | ---------------------- | -------------------------------------------------------------------------------------- |
| No recalcular la lista filtrada en cada dibujo          | `useMemo`              | La calculamos en cada dibujo: es rapidísimo (paso 4)                                   |
| Dar foco a un campo                                     | `useRef`               | `document.getElementById` dentro de un evento, o el atributo `autoFocus` (pasos 6 y 7) |
| Identificadores únicos para vincular etiquetas y campos | `useId`                | Los derivamos del nombre del campo (paso 7)                                            |
| Compartir estado entre componentes lejanos              | `useContext`           | Zustand (paso 2)                                                                       |

`useAgenda`, el hook del store, no es de React sino de Zustand. Y `useForm` y `usePersistencia` son nuestros: los vamos a construir con `useState` y `useEffect`.

---

## Paso 2. El módulo agenda: datos y reglas

### 2.1 Separar las reglas de la interfaz

Antes de dibujar cualquier botón vamos a escribir **toda la funcionalidad** de la agenda: cómo es un contacto, cómo se ordena, cómo se busca, qué datos son válidos, cómo se agrega, modifica o elimina. Todo eso va en la carpeta `src/agenda/` (el dominio) y en `src/store/` (el estado), y cumple una regla: **no sabe nada de la interfaz**. No usa JSX, no toca el DOM, no menciona componentes.

¿Por qué separar?

- **Se puede probar sin pantalla.** Al final de este paso vamos a usar la agenda completa con una página de prueba, antes de tener la interfaz.
- **La interfaz queda simple.** Un componente que muestra la lista no necesita saber cómo se comparan dos nombres con tilde; llama a una función.
- **Las reglas viven en un solo lugar.** Si la validación está en el store, ningún formulario puede saltearla.

Cada archivo es un **módulo**: lo que no se exporta queda privado. Así, cada archivo muestra hacia afuera solo lo que los demás necesitan.

### 2.2 La forma de un contacto

```js
// src/agenda/contacto.js
export const CONTACTO_VACIO = { nombre: "", apellido: "", telefono: "", email: "", notas: "" };

export function crearId() {
  return globalThis.crypto?.randomUUID?.()
      ?? `${Date.now().toString(36)}-${Math.random().toString(36).slice(2, 8)}`;
}

export function nombreCompleto(contacto) {
  return `${contacto.nombre} ${contacto.apellido}`.trim();
}
```

`CONTACTO_VACIO` cumple dos funciones: es el **molde** de un contacto (qué campos tiene) y el **valor inicial** del formulario de alta. Además de estos cinco campos, cada contacto guardado tiene un `id` único.

**`crearId`.** El `id` no cambia aunque se edite el nombre: es lo que usamos para seleccionar un contacto y para que React identifique cada elemento de la lista. `crypto.randomUUID()` genera identificadores del tipo `"3b241101-e2bb-4255-8caf-4136c566a962"`, pero solo existe en *contextos seguros* (`https` o `localhost`). Los `?.` encadenados devuelven `undefined` si no está disponible, y en ese caso `??` usa un plan B: la fecha actual y un número al azar, escritos en base 36.

**`nombreCompleto`** une nombre y apellido; `trim()` evita un espacio colgando si falta el apellido.

### 2.3 Datos de ejemplo

Para no arrancar con la agenda vacía:

```js
// src/agenda/ejemplos.js
export const EJEMPLOS = [
  { id: "e01", nombre: "Lucía"    , apellido: "Bustos" , telefono: "+54 381 555-0142", email: "lucia.bustos@ejemplo.com", notas: "Compañera de la facultad." },
  { id: "e02", nombre: "Martín"   , apellido: "Álvarez", telefono: "+54 381 555-0178", email: ""                        , notas: "" },
  { id: "e03", nombre: "Sofía"    , apellido: "Medina" , telefono: ""                , email: "sofi.medina@ejemplo.com" , notas: "Diseñadora gráfica. Prefiere que le escriban por mail." },
  { id: "e04", nombre: "Joaquín"  , apellido: "Ríos"   , telefono: "+54 11 5555-0190", email: "jrios@ejemplo.com"       , notas: "" },
  { id: "e05", nombre: "Valentina", apellido: "Gómez"  , telefono: "+54 381 555-0111", email: "vale.gomez@ejemplo.com"  , notas: "Cumpleaños: 14 de marzo." },
  { id: "e06", nombre: "Tomás"    , apellido: "Herrera", telefono: "+54 381 555-0165", email: ""                        , notas: "Plomero. Atiende de 8 a 13." },
  { id: "e07", nombre: "Camila"   , apellido: "Ñañez"  , telefono: "+54 381 555-0123", email: "camila.nanez@ejemplo.com", notas: "" },
  { id: "e08", nombre: "Agustín"  , apellido: "Paz"    , telefono: "+54 381 555-0187", email: "agus.paz@ejemplo.com"    , notas: "Club de ajedrez, los jueves." },
  { id: "e09", nombre: "Florencia", apellido: "Juárez" , telefono: ""                , email: "flor.juarez@ejemplo.com" , notas: "" },
  { id: "e10", nombre: "Bruno"    , apellido: "Díaz"   , telefono: "+54 381 555-0199", email: "bruno.diaz@ejemplo.com"  , notas: "" },
  { id: "e11", nombre: "Nicolás"  , apellido: "Navarro", telefono: "+54 381 555-0134", email: ""                        , notas: "" },
];
```

Los ejemplos están elegidos a propósito: hay apellidos con tilde (Álvarez, Gómez), uno con eñe (Ñañez), contactos sin teléfono y otros sin email. Cada caso pone a prueba alguna regla.

### 2.4 Normalizar texto

Problema: si el usuario busca `gomez`, esperamos encontrar a "Gómez". Para el programa son textos distintos: `ó` y `o` son caracteres diferentes.

```js
// src/agenda/texto.js
export function quitarAcentos(texto) {
  return texto.normalize("NFD").replace(/[̀-ͯ]/g, "");
}

export function normalizar(texto) {
  return quitarAcentos(String(texto ?? "")).toLowerCase().trim();
}
```

El truco está en `normalize("NFD")`. Unicode permite escribir "ó" de dos maneras: como un único carácter, o como una "o" seguida de un **acento combinable** (un carácter que se dibuja encima del anterior). La forma NFD *descompone*: separa cada letra de sus marcas. Después, la expresión regular `[̀-ͯ]` borra el rango donde viven esas marcas.

```text
"Gómez"  ──normalize("NFD")──►  G o ́ m e z  ──replace──►  "Gomez"  ──toLowerCase──►  "gomez"
```

`normalizar` agrega tres protecciones: `String(texto ?? "")` evita errores si llega `null` o `undefined`, `toLowerCase()` ignora mayúsculas y `trim()` quita espacios en los extremos.

### 2.5 Ordenar y agrupar como en una agenda

Problema: el orden por defecto de `sort()` compara **códigos de carácter**, y en esos códigos todas las letras con tilde van después de la "z". "Álvarez" quedaría al final de la lista.

```js
// src/agenda/orden.js
import { quitarAcentos } from "./texto.js";

const comparador = new Intl.Collator("es", { sensitivity: "base" });

export function compararContactos(a, b) {
  return comparador.compare(a.apellido || a.nombre, b.apellido || b.nombre)
      || comparador.compare(a.nombre, b.nombre);
}

export function letraInicial(contacto) {
  const letra = (contacto.apellido || contacto.nombre).charAt(0).toLocaleUpperCase("es");
  if (letra === "Ñ") return "Ñ";
  const simple = quitarAcentos(letra);
  return /[A-Z]/.test(simple) ? simple : "#";
}

export function agruparPorLetra(lista) {
  const grupos = [];
  for (const contacto of lista) {
    const letra = letraInicial(contacto);
    const ultimo = grupos.at(-1);
    if (ultimo && ultimo.letra === letra) ultimo.contactos.push(contacto);
    else grupos.push({ letra, contactos: [contacto] });
  }
  return grupos;
}
```

**Ordenar.** `Intl.Collator` es el comparador de textos que trae el navegador para cada idioma:

- Con `"es"`, conoce las reglas del español: "Álvarez" va con la A y la "ñ" va después de la "n".
- `sensitivity: "base"` ignora tildes y mayúsculas al comparar, pero no confunde la ñ con la n, porque en español son letras distintas.
- `compare` devuelve un número negativo, cero o positivo, que es exactamente lo que espera `sort()`.
- El `||` encadena criterios: si los apellidos empatan (`0`, que es *falsy*), desempata por nombre.
- `a.apellido || a.nombre`: un contacto sin apellido se ordena por su nombre.

El comparador se crea **una vez**, fuera de la función: crearlo tiene un costo, y `compararContactos` se llama muchas veces en cada ordenamiento. Como no se exporta, es privado del módulo.

**La letra de cada contacto.** La "Á" debe ir al grupo "A", pero la "Ñ" tiene su propio grupo. `quitarAcentos("Ñ")` devolvería "N" (la virgulilla también es una marca combinable), por eso la tratamos antes. Cualquier inicial que no sea una letra va al grupo "#". Fijate que `orden.js` **importa** `quitarAcentos` de `texto.js`: los módulos del dominio se usan entre sí.

**Agrupar.** `agruparPorLetra` recorre una lista **ya ordenada** una sola vez: si el contacto tiene la misma letra que el último grupo, va a ese grupo; si no, abre uno nuevo. `grupos.at(-1)` devuelve el último elemento (o `undefined` si el arreglo está vacío). El resultado tiene esta forma:

```js
[
  { letra: "A", contactos: [ /* Álvarez */ ] },
  { letra: "B", contactos: [ /* Bustos  */ ] },
  // ...
]
```

### 2.6 Buscar

```js
// src/agenda/busqueda.js
import { normalizar } from "./texto.js";
import { compararContactos } from "./orden.js";

export function coincide(contacto, consulta) {
  const palabras = normalizar(consulta)
                     .split(/\s+/)
                     .filter(Boolean);

  if (palabras.length === 0) return true;

  const soloDigitos = contacto.telefono.replace(/\D/g, "");
  const texto = normalizar(`${contacto.nombre} ${contacto.apellido} ${contacto.email} ${contacto.telefono} ${soloDigitos}`);
  return palabras.every(palabra => texto.includes(palabra));
}

export function filtrarYOrdenar(contactos, consulta) {
  // filter() devuelve un arreglo nuevo, así que sort() no toca el original
  return contactos
    .filter(c => coincide(c, consulta))
    .sort(compararContactos);
}
```

Decisiones de diseño de `coincide`:

- **Por palabras y en cualquier orden.** La consulta "gómez vale" se parte en `["gomez", "vale"]`, y el contacto coincide si **todas** (`every`) aparecen en algún lado. Encuentra a "Valentina Gómez" aunque el orden esté invertido.
- **`filter(Boolean)`** descarta las cadenas vacías que aparecen si hay espacios dobles.
- **Consulta vacía, coinciden todos.** Así la misma función sirve con o sin búsqueda.
- **Teléfono sin formato.** Agregamos al texto el teléfono con y sin separadores (`\D` es "todo lo que no sea dígito"). Así funciona buscar "555-0142", "381 555" o "5550142".

El comentario de `filtrarYOrdenar` no es decorativo. `sort()` **modifica** el arreglo sobre el que se llama. Si hiciéramos `contactos.sort(...)` estaríamos alterando el arreglo guardado en el estado de la aplicación, y como veremos, el estado nunca se modifica en el lugar. Como `filter()` siempre crea un arreglo nuevo, el `sort()` trabaja sobre esa copia.

### 2.7 Limpiar y validar

Problema: lo que llega de un formulario puede tener espacios de más, emails en mayúsculas, campos vacíos o datos inválidos. Lo resolvemos en dos etapas: **limpiar** (corregir lo que se puede corregir) y **validar** (rechazar lo que no).

```js
// src/agenda/validacion.js
import { CONTACTO_VACIO } from "./contacto.js";

const PATRON_EMAIL    = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
const PATRON_TELEFONO = /^\+?[\d\s()-]{6,20}$/;

export function limpiar(datos) {
  const limpio = {};
  for (const campo of Object.keys(CONTACTO_VACIO)) {
    limpio[campo] = String(datos[campo] ?? "").trim();
  }
  limpio.email = limpio.email.toLowerCase();
  return limpio;
}

export function validar(datos) {
  const errores = {};
  if (!datos.nombre) {
    errores.nombre = "El nombre es obligatorio.";
  }
  if (datos.telefono && !PATRON_TELEFONO.test(datos.telefono)) {
    errores.telefono = "Usá solo dígitos, espacios, guiones, paréntesis y un + inicial.";
  }
  if (datos.email && !PATRON_EMAIL.test(datos.email)) {
    errores.email = "El email no tiene un formato válido.";
  }
  if (!datos.telefono && !datos.email) {
    errores.telefono = "Cargá al menos un teléfono o un email.";
  }
  return errores;
}
```

`limpiar` recorre los campos del molde. Eso tiene un efecto extra: **cualquier propiedad que no esté en el molde se descarta**. Si llega un objeto con `id` o con un campo inventado, no pasa.

`validar` devuelve un objeto con un mensaje por cada campo con problemas. Si está vacío, los datos son válidos. Esta forma es cómoda para la interfaz: el formulario mostrará `errores.nombre` debajo del campo nombre, y así con cada uno.

Los patrones, en palabras:

- **Email**: algo sin espacios ni arrobas, una `@`, algo, un punto y algo más. No intenta validar todos los emails posibles (eso es imposible con una expresión regular razonable); filtra los errores de tipeo evidentes.
- **Teléfono**: un `+` opcional al principio y después entre 6 y 20 caracteres que sean dígitos, espacios, paréntesis o guiones.

La última regla mira **dos campos a la vez**: un contacto sin teléfono ni email no sirve para contactar a nadie.

### 2.8 El problema del estado compartido

Hasta acá escribimos **funciones puras**: reciben datos y devuelven resultados, sin modificar nada. Falta lo más importante: **dónde viven los datos** y cómo se cambian.

Pensemos en la interfaz terminada:

```text
App
├── Encabezado
│   ├── Contador          ← lee cuántos contactos hay
│   └── Boton "Nuevo"     ← abre el formulario de alta
├── PanelLista
│   ├── CajaBusqueda      ← escribe la consulta
│   └── ItemContacto ×N   ← lee cuál está seleccionado; al tocarlo, lo selecciona
└── PanelDetalle          ← lee el seleccionado; agrega, modifica y elimina
```

Casi todos los componentes necesitan los mismos datos, y están en ramas distintas del árbol. Con `useState`, la solución sería guardar todo en `App` (el antepasado común) y **pasarlo hacia abajo por props**, nivel por nivel, junto con funciones para modificarlo. Esto se conoce como *prop drilling*: componentes intermedios reciben datos que no usan, solo para entregárselos a sus hijos. Con tantos componentes chicos, cada dato nuevo obligaría a tocar cinco o seis archivos.

**Zustand** propone otra cosa: sacar el estado **fuera** de los componentes, a un objeto llamado ***store***. Cualquier componente, en cualquier nivel, se conecta directamente a la parte del store que le interesa, y se vuelve a dibujar solo cuando esa parte cambia.

```text
                 ┌──────────── store (Zustand) ─────────────────┐
                 │ contactos · seleccionadoId · modo · consulta │
                 │ agregar() · actualizar() · eliminar() ...    │
                 └──▲──────────────▲──────────────▲─────────────┘
                    │              │              │
                Contador      ItemContacto    PanelDetalle
```

### 2.9 El store con Zustand

```js
// src/store/useAgenda.js
import { create } from "zustand";
import { crearId } from "../agenda/contacto.js";
import { EJEMPLOS } from "../agenda/ejemplos.js";
import { limpiar, validar } from "../agenda/validacion.js";

export const useAgenda = create(set => ({
  
  // Estado
  
  contactos:      [],
  seleccionadoId: null,
  modo:           "ver", // "ver" | "nuevo" | "editar"
  consulta:       "",

  // Acciones sobre los datos
  
  agregar(datos) {
    const limpio  = limpiar(datos);
    const errores = validar(limpio);
    if (Object.keys(errores).length > 0) {
        return { ok: false, errores
    }

    const nuevo = { id: crearId(), ...limpio };
    set(estado => ({
      contactos: [...estado.contactos, nuevo],
      seleccionadoId: nuevo.id,
      modo: "ver",
    }));

    return { ok: true, contacto: nuevo };
  },

  actualizar(id, cambios) {
    const limpio  = limpiar(cambios);
    const errores = validar(limpio);
    if (Object.keys(errores).length > 0) {
      return { ok: false, errores };
    }
    set(estado => ({
      contactos: estado.contactos.map(c => (c.id === id ? { ...c, ...limpio } : c)),
      modo: "ver",
    }));
    return { ok: true };
  },

  eliminar(id) {
    set(estado => ({
      contactos: estado.contactos.filter(c => c.id !== id),
      seleccionadoId: estado.seleccionadoId === id ? null : estado.seleccionadoId,
      modo: "ver",
    }));
  },

  reemplazarTodo(contactos) {
    set({ contactos });
  },

  restaurarEjemplos() {
    set({ contactos: EJEMPLOS, seleccionadoId: null, modo: "ver", consulta: "" });
  },

  // Acciones sobre la interfaz

  seleccionar(id)  { 
    set({ seleccionadoId: id, modo: "ver" }); 
  },

  buscar(consulta) { 
    set({ consulta }); 
  },
  
  empezarAlta() { 
    set({ modo: "nuevo" }); 
  },
  
  empezarEdicion() { 
    set({ modo: "editar" }); 
  },
  
  cancelar() { 
    set({ modo: "ver" }); 
  },
}));

// Selector: deriva un dato a partir del estado
export function contactoSeleccionado(estado) {
  return estado.contactos.find(c => c.id === estado.seleccionadoId) ?? null;
}
```

Vamos por partes.

**`create(set => ({ ... }))`.** Le pasamos a `create` una función que recibe `set` y devuelve el **estado inicial**: un objeto que mezcla datos y funciones. A esas funciones las llamamos **acciones**: son la única forma prevista de modificar el estado.

**`create` devuelve un hook.** `useAgenda` es a la vez:

- un **hook**, para usar dentro de componentes: `useAgenda(estado => estado.contactos)`;
- un objeto con métodos para usar **fuera** de React: `useAgenda.getState()`, `useAgenda.setState()` y `useAgenda.subscribe()`.

Por eso el archivo y la constante se llaman `useAgenda`: por convención, el nombre de todo hook empieza con `use`.

**`set` mezcla, no reemplaza.** `set({ consulta })` cambia solo `consulta`; el resto del estado queda igual. La mezcla es *superficial*: actúa sobre las propiedades de primer nivel.

**Dos formas de llamar a `set`:**

- con un objeto, cuando el valor nuevo no depende del anterior: `set({ modo: "nuevo" })`;
- con una función, cuando sí depende: `set(estado => ({ contactos: [...estado.contactos, nuevo] }))`. La función recibe el estado actual y devuelve los cambios.

**Inmutabilidad.** Nunca hacemos `estado.contactos.push(nuevo)`. Siempre creamos arreglos y objetos **nuevos**:

| Operación | En lugar de...            | Hacemos...                                          |
| --------- | ------------------------- | --------------------------------------------------- |
| Agregar   | `push`                    | `[...anterior, nuevo]`                              |
| Modificar | `contacto.nombre = "..."` | `map` y `{ ...c, ...cambios }` para el que coincide |
| Eliminar  | `splice`                  | `filter` con los que no coinciden                   |

La razón es práctica: Zustand y React detectan cambios **comparando referencias** (`anterior === nuevo`). Comparar referencias es instantáneo, pero si modificamos el arreglo en el lugar, la referencia sigue siendo la misma y nadie se entera del cambio: la pantalla no se actualiza.

**Las acciones validan.** `agregar` y `actualizar` pasan los datos por `limpiar` y `validar` antes de tocar el estado, y **devuelven un resultado**: `{ ok: true }` o `{ ok: false, errores }`. El formulario no necesita conocer las reglas; muestra lo que la acción le responde. Y como la validación está en el store, ningún camino puede guardar datos inválidos.

**Estado de datos y estado de interfaz.** El store guarda dos tipos de información:

- **datos**: `contactos`, lo que querríamos guardar en disco;
- **interfaz**: `seleccionadoId` (cuál se está mirando), `modo` (si estamos viendo, creando o editando) y `consulta` (qué dice la caja de búsqueda).

`modo` y `seleccionadoId` están en el store porque varios componentes los necesitan: el botón "Nuevo contacto" está en el encabezado, pero el formulario aparece en el panel de detalle.

Fijate también en las **consecuencias** que cada acción resuelve sola: al agregar, el contacto nuevo queda seleccionado; al eliminar el seleccionado, la selección se limpia; al seleccionar otro, se sale del modo edición. Si estas reglas estuvieran repartidas en los componentes, sería fácil olvidar alguna.

**Selectores: derivar en lugar de duplicar.** ¿Por qué guardamos `seleccionadoId` y no el contacto seleccionado completo? Porque tendríamos **dos copias** del mismo contacto: una en `contactos` y otra en `seleccionado`. Al editar, habría que acordarse de actualizar las dos. En cambio, guardamos el `id` y **derivamos** el contacto cuando hace falta, con `contactoSeleccionado`. Una función que recibe el estado y devuelve una parte, o algo calculado a partir de él, se llama **selector**, y se puede pasar directamente al hook: `useAgenda(contactoSeleccionado)`.

### 2.10 Probar el módulo con una página de prueba

Un módulo que nadie importa no se ejecuta. Para cargar el store y probarlo antes de tener la interfaz, armamos un `App` provisorio: una página de prueba con tres botones que llaman a las acciones y muestran lo que responden.

```jsx
// src/App.jsx  ·  versión provisoria: la reemplazamos en el paso 3
import { useState } from "react";
import { useAgenda } from "./store/useAgenda.js";

export function App() {
  const total   = useAgenda(estado => estado.contactos.length);
  const agregar = useAgenda(estado => estado.agregar);
  const restaurarEjemplos = useAgenda(estado => estado.restaurarEjemplos);
  const [respuesta, setRespuesta] = useState(null);

  return (
    <main>
      <h1>La agenda tiene {total} contactos</h1>
      <button onClick={() => setRespuesta(agregar({ nombre: "Ana" }))}>
        Agregar sin teléfono ni email
      </button>
      <button onClick={() => setRespuesta(agregar({ nombre: "  Ana ", email: "ANA@EJEMPLO.COM", color: "rojo" }))}>
        Agregar con datos desprolijos
      </button>
      <button onClick={restaurarEjemplos}>Restaurar ejemplos</button>
      <pre>{JSON.stringify(respuesta, null, 2)}</pre>
    </main>
  );
}
```

La página usa dos hooks: `useAgenda`, el del store, y el primero de los dos de React.

**`useState`: estado local.** La última respuesta de una acción es algo que solo le interesa a esta página: no hace falta llevarla al store. `useState(null)` devuelve un par: el valor actual (al principio, `null`) y una función para cambiarlo. Al llamar a `setRespuesta`, React vuelve a ejecutar `App` y el valor nuevo aparece en la variable `respuesta`.

La regla para decidir dónde guardar un dato: **si lo usa un solo componente (y quizás sus hijos directos), estado local con `useState`. Si lo usan componentes de distintas ramas, store.**

Otros detalles:

- `onClick={restaurarEjemplos}` pasa **la función**, no la ejecuta. Escribir `onClick={restaurarEjemplos()}` la ejecutaría en cada dibujo.
- Cuando hay que pasar argumentos, se envuelve la llamada en una función flecha: `onClick={() => setRespuesta(agregar({ nombre: "Ana" }))}`. La flecha se ejecuta recién con el clic.
- `<pre>{JSON.stringify(respuesta, null, 2)}</pre>` muestra cualquier objeto con sangría, ideal para inspeccionar datos.

Probá los tres botones, en orden:

1. **Agregar sin teléfono ni email.** La acción rechaza los datos y responde `{ "ok": false, "errores": { "telefono": "Cargá al menos un teléfono o un email." } }`. El título sigue diciendo 0 contactos.
2. **Agregar con datos desprolijos.** Responde `ok: true` con el contacto guardado: espacios recortados, email en minúsculas, la propiedad `color` descartada y un `id` nuevo. El título pasa a decir 1 contactos.
3. **Restaurar ejemplos.** El título pasa a decir 11 contactos.

La agenda **ya funciona entera**: agrega, valida, limpia, restaura. Y fijate que nadie le avisa al título que cambió el total: **se actualiza solo**. `App` está suscripto a `contactos.length` mediante `useAgenda`; cada vez que una acción llama a `set`, Zustand vuelve a ejecutar los selectores de sus suscriptores y redibuja los componentes cuyo resultado cambió.

Si recargás la página, los datos se pierden: el store vive en memoria. Lo resolvemos en el paso 8.

---

## Paso 3.
 La interfaz: componentes comunes y estructura

### 3.1 Pensar en componentes

Un **componente** de React es una función que recibe datos (*props*) y devuelve JSX. La interfaz completa es un árbol de componentes, y cada uno vive en la carpeta de su área:

```text
App                                       src/App.jsx
├── Encabezado                            componentes/encabezado/
│   ├── Marca
│   ├── Contador
│   └── Boton                             componentes/comunes/
├── PanelLista                            componentes/lista/
│   ├── CajaBusqueda
│   ├── ListaContactos
│   │   └── GrupoLetra ×N
│   │       └── ItemContacto ×N
│   │           └── Avatar                componentes/comunes/
│   └── PieLista
└── PanelDetalle                          componentes/detalle/
    ├── BotonVolver
    ├── SinSeleccion           ─┐
    ├── FichaContacto           ├ uno solo, según el modo
    │   ├── CabeceraContacto    │
    │   ├── DatosContacto       │
    │   │   └── Dato ×3         │
    │   └── AccionesFicha       │
    └── FormularioContacto     ─┘         componentes/formulario/
        └── Campo ×5                      componentes/comunes/
```

¿Por qué tantos componentes chicos? Porque cada uno se entiende de un vistazo, tiene un nombre que dice qué es, y se puede cambiar sin miedo a romper el resto. `FichaContacto` se lee casi como una descripción: una tarjeta con cabecera, datos y acciones.

En este paso armamos los estilos generales, los componentes comunes y el encabezado. En los siguientes completamos cada panel.

### 3.2 Estilos generales

Los estilos que valen para toda la página van en `src/estilos/base.css`:

```css
/* src/estilos/base.css */
:root {
  --fondo: #f4f3ef;
  --superficie: #ffffff;
  --tinta: #1c1c1e;
  --suave: #67676d;
  --linea: #e2e0d9;
  --acento: #1f6f5c;
  --acento-hover: #185a4a;
  --acento-suave: #e1efe9;
  --peligro: #b42318;
  --peligro-suave: #fdecea;
  --sombra: 0 1px 2px rgb(0 0 0 / .04), 0 6px 20px rgb(0 0 0 / .05);
  font-family: system-ui, -apple-system, "Segoe UI", Roboto, sans-serif;
  font-size: 16px;
  line-height: 1.45;
  color: var(--tinta);
  background: var(--fondo);
}
* { box-sizing: border-box; }
html, body, #root { height: 100%; margin: 0; }
button, input, textarea { font: inherit; color: inherit; }
a { color: var(--acento); }
h2, h3, p { margin: 0; }
```

Los colores se definen una sola vez como **variables CSS** (`--acento`, `--linea`…), y el resto de las hojas los usan con `var(--acento)`. Cambiar el tema es cambiar unas pocas líneas.

¿Cómo llega un `.css` a la página? **Importándolo desde JavaScript.** Completá el punto de entrada:

```jsx
// src/main.jsx
import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import { App } from "./App.jsx";
import "./estilos/base.css";

createRoot(document.getElementById("root")).render(
  <StrictMode>
    <App />
  </StrictMode>
);
```

`import "./estilos/base.css"` no trae ningún valor: le avisa a Vite que este módulo **necesita** esa hoja de estilos. En desarrollo, Vite la inserta en la página como un `<style>`; en producción, junta todas las hojas importadas en un único archivo `.css`.

Con la misma idea, cada carpeta de componentes tiene su hoja, y la importan los componentes que la usan. Si varios archivos importan la misma hoja, Vite la incluye una sola vez. Tené en cuenta que **las clases siguen siendo globales**: importar una hoja desde un componente organiza el código, pero no impide que sus reglas afecten a otros. Por eso usamos nombres de clase claros y específicos. (Vite también admite *CSS Modules*, archivos `.module.css` cuyas clases quedan aisladas por componente; no los usamos para mantener el CSS simple).

### 3.3 La grilla de la página

`App` arma la grilla general:

```css
/* src/App.css  ·  versión provisoria: la completamos en el paso 9 */
.app { height: 100dvh; display: grid; grid-template-rows: auto 1fr; }
.paneles { display: grid; grid-template-columns: minmax(280px, 380px) 1fr; min-height: 0; }
```

- **La página ocupa exactamente la pantalla.** `.app` mide `100dvh` (el alto visible, que en celulares descuenta las barras del navegador) y es una grilla de dos filas: el encabezado (`auto`, lo que necesite) y los paneles (`1fr`, todo lo que sobra).
- **Dos columnas.** `.paneles` asigna a la lista entre 280 y 380 píxeles, y el resto al detalle.
- **`min-height: 0`.** Sin esta línea, un elemento de grilla no puede ser más bajo que su contenido, y una lista larga estiraría toda la página en lugar de mostrar su propia barra de desplazamiento.

### 3.4 Componentes comunes

Los componentes de `comunes/` son **piezas de construcción**: no saben nada de contactos ni del store. Reciben todo por props. Primero, su hoja de estilos:

```css
/* src/componentes/comunes/comunes.css */

/* ── Boton ── */
.boton {
  display: inline-flex; align-items: center; gap: 8px;
  padding: 9px 16px;
  border: 1px solid var(--linea); border-radius: 10px;
  background: var(--superficie);
  cursor: pointer; font-weight: 600;
  transition: background .15s, border-color .15s;
}
.boton:hover { background: var(--fondo); }
.boton:focus-visible { outline: 2px solid var(--acento); outline-offset: 2px; }
.boton-primario { background: var(--acento); border-color: var(--acento); color: #fff; }
.boton-primario:hover { background: var(--acento-hover); }
.boton-peligro { background: var(--peligro); border-color: var(--peligro); color: #fff; }
.boton-peligro:hover { background: #8f1c13; }
.boton-peligro-suave { color: var(--peligro); }
.boton-peligro-suave:hover { background: var(--peligro-suave); border-color: #f5c2bd; }
.boton-fantasma { border-color: transparent; background: none; }
.boton-chico { padding: 4px 10px; font-size: .8rem; font-weight: 500; }

/* ── Avatar ── */
.avatar {
  flex: none;
  width: 40px; height: 40px; border-radius: 50%;
  display: grid; place-items: center;
  background: hsl(var(--tono) 42% 44%); color: #fff;
  font-weight: 700; font-size: .95rem;
}
.avatar.grande { width: 84px; height: 84px; font-size: 1.8rem; }

/* ── Tarjeta y Acciones ── */
.tarjeta {
  max-width: 680px; margin: 0 auto; padding: 28px;
  background: var(--superficie);
  border: 1px solid var(--linea); border-radius: 16px;
  box-shadow: var(--sombra);
}
.acciones {
  display: flex; flex-wrap: wrap; align-items: center; gap: 10px;
  margin-top: 28px; padding-top: 20px;
  border-top: 1px solid var(--linea);
}

/* ── Campo ── */
.campo { display: flex; flex-direction: column; gap: 6px; margin-bottom: 16px; }
.campo label { font-size: .85rem; font-weight: 600; }
.campo input, .campo textarea {
  padding: 10px 12px;
  border: 1px solid var(--linea); border-radius: 10px;
  background: #fff;
}
.campo input:focus, .campo textarea:focus { outline: 2px solid var(--acento); outline-offset: -1px; }
.campo textarea { min-height: 96px; resize: vertical; }
.campo.con-error input, .campo.con-error textarea { border-color: var(--peligro); background: var(--peligro-suave); }
.campo .error { font-size: .8rem; color: var(--peligro); }
.campo .obligatorio { color: var(--peligro); }
```

(Los estilos de `Campo` los usamos recién en el paso 7, pero conviene tener la hoja completa en un solo lugar).

**`Boton`.** Todos los botones de la aplicación se parecen: mismo borde, mismo espaciado, a veces un ícono. En lugar de repetir clases en cada lugar, un componente:

```jsx
// src/componentes/comunes/Boton.jsx
import "./comunes.css";

// variante: "normal" | "primario" | "peligro" | "peligro-suave" | "fantasma"
export function Boton({ variante = "normal", icono, className = "", children, ...resto }) {
  return (
    <button type="button" className={`boton boton-${variante} ${className}`} {...resto}>
      {icono && <span>{icono}</span>}
      {children}
    </button>
  );
}
```

Primeras observaciones sobre JSX:

- **Las props se reciben desestructuradas**: `function Boton({ variante = "normal", icono, ... })`. React llama a la función con un único objeto (`{ variante: "primario", icono: "✏️", ... }`); la desestructuración saca sus propiedades y permite valores por defecto.
- **Las llaves `{}` insertan JavaScript**: `{icono}`, `{children}`, y también en los atributos: `className={...}`.
- **Los atributos se escriben como propiedades de JavaScript**: `className` en lugar de `class` (que es palabra reservada), y en *camelCase*: `onClick`, `autoComplete`.

Y cuatro recursos que vamos a usar mucho:

- **Variantes por prop.** `variante="primario"` se convierte en la clase `boton-primario`. Quien usa el botón dice *qué tipo* de botón quiere, no qué clases lleva.
- **`children`** es lo que se escribe **entre** las etiquetas: en `<Boton>Guardar</Boton>`, `children` es `"Guardar"`. Puede ser texto, otros componentes o una mezcla.
- **`...resto`** junta todas las props que no nombramos (`onClick`, `type`, `title`…) y `{...resto}` las pasa al `<button>`. `Boton` no necesita conocerlas todas: cualquier atributo de un botón HTML funciona.
- **`type="button"` por defecto.** Dentro de un formulario, un `<button>` sin tipo es de tipo `submit` y lo envía. Como `{...resto}` va después, quien necesite un botón de envío escribe `<Boton type="submit">` y lo reemplaza.

**Íconos con emojis.** El ícono es un texto cualquiera: un emoji (`icono="✏️"`) o un carácter común (`icono="+"`). No hace falta un componente ni archivos de imágenes. `{icono && <span ...>{icono}</span>}` es la forma habitual de mostrar algo condicionalmente: si no hay ícono, `&&` devuelve `undefined` y React no dibuja nada. `aria-hidden="true"` le indica a los lectores de pantalla que ignoren el ícono: es decorativo, el texto del botón ya dice qué hace.

Los emojis tienen dos particularidades:

- **Tienen sus propios colores**: no toman el color del texto que los rodea. Sobre un fondo de color pueden perderse; por eso en el botón verde de "Nuevo contacto" usamos `+`, un carácter común que sí se pinta de blanco como el texto. Lo mismo con `←` (volver) y `✕` (limpiar la búsqueda).
- **Cada sistema los dibuja a su manera**: el 🗑️ de Windows no es idéntico al de un Mac o un celular. Se reconocen igual, pero no se ven exactamente iguales en todos lados.

Como son texto, su tamaño se ajusta con `font-size`, como cualquier letra.

**`Avatar`.** Un círculo con las iniciales, de un color que depende del contacto:

```jsx
// src/componentes/comunes/Avatar.jsx
import "./comunes.css";

function iniciales(contacto) {
  return `${contacto.nombre.charAt(0)}${contacto.apellido.charAt(0)}`.toUpperCase() || "?";
}

// Convierte un texto en un ángulo del círculo cromático (0 a 359), siempre el mismo
function tono(texto) {
  let hash = 0;
  for (const caracter of texto) hash = (hash * 31 + caracter.codePointAt(0)) | 0;
  return Math.abs(hash * 137) % 360;
}

export function Avatar({ contacto, grande = false }) {
  return (
    <span className={grande ? "avatar grande" : "avatar"}
          style={{ "--tono": tono(contacto.id) }} aria-hidden="true">
      {iniciales(contacto)}
    </span>
  );
}
```

`tono` es un **hash**: el mismo texto siempre da el mismo número, y textos parecidos dan números muy distintos. Usamos el `id` porque no cambia al editar: el avatar mantiene su color para siempre. El `| 0` mantiene el número dentro de los enteros de 32 bits, y la multiplicación por 137 separa los resultados de ids parecidos ("e01", "e02").

`style={{ "--tono": ... }}` tiene llaves dobles: las de afuera insertan JavaScript y las de adentro forman el objeto de estilos. Definimos una variable CSS en el propio elemento, y la hoja la usa en `hsl(var(--tono) 42% 44%)`: saturación y luminosidad fijas, así que todos los colores combinan y tienen buen contraste con el texto blanco.

`iniciales` y `tono` no se exportan: son detalles internos del avatar.

**`Tarjeta` y `Acciones`.** Dos contenedores mínimos:

```jsx
// src/componentes/comunes/Tarjeta.jsx
import "./comunes.css";

export function Tarjeta({ children }) {
  return <article className="tarjeta">{children}</article>;
}
```

```jsx
// src/componentes/comunes/Acciones.jsx
import "./comunes.css";

export function Acciones({ children }) {
  return <footer className="acciones">{children}</footer>;
}
```

Parecen demasiado simples para merecer un archivo, pero tienen dos ventajas. Primero, **dan nombre** a una idea: quien lee `<Tarjeta>` entiende más que quien lee `<article className="tarjeta">`. Segundo, si mañana la tarjeta necesita un título o un borde de color, se cambia en un solo lugar. Este patrón, en el que un componente envuelve lo que recibe en `children`, se llama **composición**.

### 3.5 El encabezado

Su hoja de estilos:

```css
/* src/componentes/encabezado/encabezado.css */
.encabezado {
  display: flex; align-items: center; gap: 14px;
  padding: 12px 20px;
  background: var(--superficie);
  border-bottom: 1px solid var(--linea);
}
.marca { display: flex; align-items: center; gap: 10px; font-weight: 700; font-size: 1.2rem; }
.marca-icono {
  width: 36px; height: 36px; border-radius: 10px;
  display: grid; place-items: center;
  background: var(--acento-suave); font-size: 1.2rem;
}
.contador { color: var(--suave); font-size: .9rem; }
.espacio { flex: 1; }

/* Pantallas angostas: botones solo con ícono */
@media (max-width: 720px) {
  .encabezado .boton-texto, .contador { display: none; }
}
```

(La regla para pantallas angostas la explicamos en el paso 9.)

La marca, un componente sin props:

```jsx
// src/componentes/encabezado/Marca.jsx
export function Marca() {
  return (
    <div className="marca">
      <span className="marca-icono">📇</span>
      Agenda
    </div>
  );
}
```

El contador es el primer componente **conectado al store**:

```jsx
// src/componentes/encabezado/Contador.jsx
import { useAgenda } from "../../store/useAgenda.js";

export function Contador() {
  const total = useAgenda(estado => estado.contactos.length);
  return <span className="contador">{total} {total === 1 ? "contacto" : "contactos"}</span>;
}
```

```jsx
const total = useAgenda(estado => estado.contactos.length);
```

Esta es la forma central de usar Zustand. La función que pasamos es un **selector**: Zustand la ejecuta con el estado actual y nos devuelve el resultado. Además, **suscribe** el componente: cada vez que el store cambia, vuelve a ejecutar el selector y compara el resultado nuevo con el anterior. **Solo si es distinto**, vuelve a dibujar el componente. El contador depende de un número: si cambia la consulta o la selección, ese número no cambia y el contador no se redibuja.

Dentro de las llaves del JSX va cualquier **expresión**; para elegir entre dos valores se usa el operador ternario (`total === 1 ? "contacto" : "contactos"`).

Y el encabezado los reúne:

```jsx
// src/componentes/encabezado/Encabezado.jsx
import { useAgenda } from "../../store/useAgenda.js";
import { Boton } from "../comunes/Boton.jsx";
import { Marca } from "./Marca.jsx";
import { Contador } from "./Contador.jsx";
import "./encabezado.css";

export function Encabezado() {
  const empezarAlta = useAgenda(estado => estado.empezarAlta);

  return (
    <header className="encabezado">
      <Marca />
      <Contador />
      <div className="espacio" />
      <Boton variante="primario" icono="+" onClick={empezarAlta}>
        <span className="boton-texto">Nuevo contacto</span>
      </Boton>
    </header>
  );
}
```

- **Las acciones se leen igual que los datos**: `useAgenda(estado => estado.empezarAlta)`. Una acción es una función que se creó una sola vez y nunca cambia, así que leerla no provoca redibujos.
- `onClick={empezarAlta}` pasa la acción tal cual: al hacer clic, se ejecuta y el store cambia el modo.

Fijate en la división del trabajo: `Contador` lee del store lo que necesita, sin que `Encabezado` tenga que pasárselo. `Encabezado` ni siquiera sabe cuántos contactos hay.

### 3.6 App y paneles provisorios

Los dos paneles todavía no existen. Creamos versiones mínimas para que la grilla tenga algo que mostrar:

```jsx
// src/componentes/lista/PanelLista.jsx  ·  versión provisoria: la reemplazamos en el paso 4
export function PanelLista() {
  return <section className="panel-lista">
            <p>Acá va la lista</p>
         </section>;
}
```

```jsx
// src/componentes/detalle/PanelDetalle.jsx  ·  versión provisoria: la reemplazamos en el paso 5
export function PanelDetalle() {
  return <section className="panel-detalle">
            <p>Acá va el detalle</p>
         </section>;
}
```

Y `App` arma la pantalla:

```jsx
// src/App.jsx  ·  versión provisoria: la reemplazamos en el paso 8
import { useEffect } from "react";
import { useAgenda } from "./store/useAgenda.js";
import { EJEMPLOS } from "./agenda/ejemplos.js";
import { Encabezado } from "./componentes/encabezado/Encabezado.jsx";
import { PanelLista } from "./componentes/lista/PanelLista.jsx";
import { PanelDetalle } from "./componentes/detalle/PanelDetalle.jsx";
import "./App.css";

export function App() {
  const reemplazarTodo = useAgenda(estado => estado.reemplazarTodo);

  // Mientras no haya persistencia, cargamos los ejemplos al arrancar
  useEffect(() => reemplazarTodo(EJEMPLOS), [reemplazarTodo]);

  return (
    <div className="app">
      <Encabezado />
      <main className="paneles">
        <PanelLista />
        <PanelDetalle />
      </main>
    </div>
  );
}
```

Aparece el segundo hook de React que vamos a usar.

**`useEffect`: código que corre después de dibujar.** El cuerpo de un componente debe limitarse a *calcular* qué mostrar. Cualquier cosa que actúe sobre el mundo exterior, o que cambie el estado como consecuencia de que el componente apareció, se llama **efecto secundario** y va dentro de `useEffect`. React lo ejecuta **después** de actualizar la pantalla.

El segundo argumento, `[reemplazarTodo]`, es la **lista de dependencias**: el efecto se vuelve a ejecutar solo cuando alguno de esos valores cambia. `reemplazarTodo` es una acción del store, que nunca cambia, así que en la práctica el efecto corre una sola vez, cuando `App` aparece. La declaramos igual porque **todo valor externo que usa un efecto va en su lista de dependencias**; es la regla que evita errores sutiles.

¿Por qué no llamar a `reemplazarTodo(EJEMPLOS)` directamente en el cuerpo de `App`? Porque cambiaría el store **mientras React está dibujando**, lo que provoca otro dibujo, que vuelve a cambiar el store… El cuerpo calcula; los efectos actúan.

### 3.7 Probar

En el navegador deberías ver el encabezado con "11 contactos" y los textos provisorios de los paneles. El botón **Nuevo contacto** ya cambia el modo en el store, pero todavía no se ve nada: el formulario llega en el paso 7.

Probá también la recarga en caliente: cambiá el texto "Agenda" en `Marca.jsx` y guardá. El cambio aparece sin recargar la página: Vite reemplazó solo el módulo de `Marca`.

---

## Paso 4. La lista

### 4.1 Estilos

```css
/* src/componentes/lista/lista.css */
.panel-lista {
  display: flex; flex-direction: column; min-height: 0;
  background: var(--superficie);
  border-right: 1px solid var(--linea);
}

/* ── Búsqueda ── */
.busqueda { padding: 14px; border-bottom: 1px solid var(--linea); }
.busqueda-caja { position: relative; }
.busqueda input {
  width: 100%;
  padding: 10px 36px;
  border: 1px solid var(--linea); border-radius: 10px;
  background: var(--fondo);
}
.busqueda input:focus { outline: 2px solid var(--acento); outline-offset: -1px; background: #fff; }
.busqueda input::-webkit-search-cancel-button { display: none; }
.busqueda-lupa, .busqueda-limpiar {
  position: absolute; top: 50%; translate: 0 -50%;
  display: grid; place-items: center; color: var(--suave);
}
.busqueda-lupa { left: 12px; pointer-events: none; font-size: .85rem; }
.busqueda-limpiar {
  right: 8px; width: 24px; height: 24px;
  border: 0; border-radius: 50%; background: var(--linea); cursor: pointer; font-size: .7rem;
}
.busqueda-info { margin-top: 8px; font-size: .8rem; color: var(--suave); }

/* ── Lista agrupada por letra ── */
.lista { flex: 1; overflow: auto; padding: 0 8px 12px; }
.lista ul { list-style: none; margin: 0; padding: 0; }
.grupo-letra {
  position: sticky; top: 0; z-index: 1;
  padding: 12px 10px 4px;
  background: var(--superficie);
  color: var(--acento); font-size: .75rem; letter-spacing: .08em;
}
.item {
  width: 100%;
  display: flex; align-items: center; gap: 12px;
  padding: 8px 10px;
  border: 0; border-radius: 10px; background: none;
  text-align: left; cursor: pointer;
}
.item:hover { background: var(--fondo); }
.item[aria-current="true"] { background: var(--acento-suave); }
.item:focus-visible { outline: 2px solid var(--acento); outline-offset: -2px; }
.item-texto { display: flex; flex-direction: column; min-width: 0; }
.item-sub {
  font-size: .85rem; color: var(--suave);
  white-space: nowrap; overflow: hidden; text-overflow: ellipsis;
}
.lista-vacia { flex: 1; padding: 32px 20px; text-align: center; color: var(--suave); }

/* ── Pie ── */
.pie-lista {
  display: flex; justify-content: space-between; align-items: center;
  padding: 8px 14px; border-top: 1px solid var(--linea);
  font-size: .8rem; color: var(--suave);
}
```

La hoja incluye los estilos de la caja de búsqueda, que agregamos en el paso 6. Tres recursos interesantes:

- **`position: sticky`** en las letras: mientras se recorre el grupo, su letra queda fija arriba; cuando llega el grupo siguiente, la empuja.
- **`.item[aria-current="true"]`**: el ítem seleccionado se pinta según un atributo de accesibilidad, no según una clase extra. Un mismo dato sirve a la vez para el lector de pantalla y para el estilo.
- **`.panel-lista`** es una columna flexible: la búsqueda y el pie miden lo que necesitan, y la lista (`flex: 1`) ocupa el resto con su propia barra de desplazamiento.

### 4.2 Un ítem de la lista

```jsx
// src/componentes/lista/ItemContacto.jsx
import { useAgenda } from "../../store/useAgenda.js";
import { Avatar } from "../comunes/Avatar.jsx";

export function ItemContacto({ contacto }) {
  const activo      = useAgenda(estado => estado.seleccionadoId === contacto.id);
  const seleccionar = useAgenda(estado => estado.seleccionar);

  return (
    <button className="item" aria-current={activo} onClick={() => seleccionar(contacto.id)}>
      <Avatar contacto={contacto} />
      <span className="item-texto">
        <span>{contacto.nombre} <strong>{contacto.apellido}</strong></span>
        <span className="item-sub">{contacto.telefono || contacto.email}</span>
      </span>
    </button>
  );
}
```

Mirá el primer selector:

```jsx
const activo = useAgenda(estado => estado.seleccionadoId === contacto.id);
```

Cada ítem le pregunta al store **una sola cosa**: "¿estoy seleccionado?". El resultado es un booleano. Cuando el usuario elige otro contacto, Zustand vuelve a ejecutar el selector de cada ítem, pero solo **dos** respuestas cambian: la del que estaba seleccionado (de `true` a `false`) y la del nuevo (de `false` a `true`). Solo esos dos ítems se vuelven a dibujar; los otros nueve, no. Un selector bien elegido hace que cada componente se actualice exactamente cuando debe.

Cada ítem es un `<button>` y no un `<div>` con `onClick`: un botón se puede alcanzar con Tab y activar con Enter o Espacio sin escribir nada extra. La función `() => seleccionar(contacto.id)` "recuerda" el `id` de su contacto gracias a la **clausura**.

La segunda línea muestra el teléfono o, si no hay, el email: `||` devuelve el primer valor *truthy*.

### 4.3 Un grupo

```jsx
// src/componentes/lista/GrupoLetra.jsx
import { ItemContacto } from "./ItemContacto.jsx";

export function GrupoLetra({ letra, contactos }) {
  return (
    <section>
      <h3 className="grupo-letra">{letra}</h3>
      <ul>
        {contactos.map(contacto => (
          <li key={contacto.id}>
            <ItemContacto contacto={contacto} />
          </li>
        ))}
      </ul>
    </section>
  );
}
```

**Listas con `map`.** JSX no tiene un `for`. Para dibujar una colección transformamos cada dato en un elemento con `map`: un arreglo de elementos JSX se dibuja como hermanos.

**La `key`.** Cada elemento de una lista lleva una `key` única entre sus hermanos. React la usa para saber **cuál es cuál** de un dibujo al siguiente. Si se elimina "Bustos", React compara las claves, ve que falta `e01` y quita solo ese elemento; el resto queda intacto. Por eso usamos el `id`, que nunca cambia, y no la posición en el arreglo: si usáramos la posición, al eliminar el primero todos los demás "cambiarían de identidad".

### 4.4 La lista agrupada

```jsx
// src/componentes/lista/ListaContactos.jsx
import { agruparPorLetra } from "../../agenda/orden.js";
import { GrupoLetra } from "./GrupoLetra.jsx";

export function ListaContactos({ contactos, total, consulta }) {
  if (total === 0) {
    return <p className="lista-vacia">La agenda está vacía.<br />Usá <strong>Nuevo contacto</strong> para empezar.</p>;
  }
  if (contactos.length === 0) {
    return <p className="lista-vacia">Ningún contacto coincide con <strong>«{consulta}»</strong>.</p>;
  }

  const grupos = agruparPorLetra(contactos);
  return (
    <nav className="lista" aria-label="Contactos">
      {grupos.map(grupo => (
        <GrupoLetra key={grupo.letra} letra={grupo.letra} contactos={grupo.contactos} />
      ))}
    </nav>
  );
}
```

`ListaContactos` **no usa el store**: recibe la lista ya filtrada y ordenada, y se ocupa de agruparla y dibujarla. Es un componente de presentación: dados unos contactos, los muestra.

**Retornos tempranos.** Antes de la lista resolvemos los casos especiales: agenda vacía y búsqueda sin resultados. Cada uno devuelve su propio JSX. Un buen mensaje para el caso vacío es parte de una interfaz cuidada.

### 4.5 El pie

```jsx
// src/componentes/lista/PieLista.jsx
import { useAgenda } from "../../store/useAgenda.js";
import { Boton } from "../comunes/Boton.jsx";

export function PieLista() {
  const restaurarEjemplos = useAgenda(estado => estado.restaurarEjemplos);

  function confirmarYRestaurar() {
    if (confirm("¿Reemplazar todos los contactos por los datos de ejemplo?")) restaurarEjemplos();
  }

  return (
    <footer className="pie-lista">
      <span>Se guarda en este navegador</span>
      <Boton className="boton-chico" onClick={confirmarYRestaurar}>Restaurar ejemplos</Boton>
    </footer>
  );
}
```

Un botón para volver a empezar, muy útil mientras se prueba. Usamos `confirm()`, el diálogo del navegador: es una acción de mantenimiento, poco frecuente, y no justifica diseñar una confirmación propia. (El texto "Se guarda en este navegador" se vuelve verdad en el paso 8).

`className="boton-chico"` muestra para qué sirve la prop `className` de `Boton`: agregar una clase extra sin crear una variante nueva.

### 4.6 El panel de la lista

Reemplazá el `PanelLista` provisorio:

```jsx
// src/componentes/lista/PanelLista.jsx  ·  versión provisoria: la completamos en el paso 6
import { useAgenda } from "../../store/useAgenda.js";
import { filtrarYOrdenar } from "../../agenda/busqueda.js";
import { ListaContactos } from "./ListaContactos.jsx";
import { PieLista } from "./PieLista.jsx";
import "./lista.css";

export function PanelLista() {
  const contactos = useAgenda(estado => estado.contactos);
  const visibles  = filtrarYOrdenar(contactos, "");

  return (
    <section className="panel-lista">
      <ListaContactos contactos={visibles} total={contactos.length} consulta="" />
      <PieLista />
    </section>
  );
}
```

`PanelLista` lee la lista completa del store y la ordena con la función del módulo (con consulta vacía, `filtrarYOrdenar` solo ordena).

### 4.7 Calcular en cada dibujo, sin `useMemo`

`filtrarYOrdenar` se ejecuta **cada vez** que `PanelLista` se dibuja. ¿No es un desperdicio? React ofrece `useMemo` para recordar un resultado y no recalcularlo, pero acá no lo necesitamos:

- **Es barato.** Ordenar once contactos lleva microsegundos. Incluso con mil, sigue siendo imperceptible.
- **No se dibuja tan seguido.** `PanelLista` está suscripto a `contactos` (y en el paso 6, a la consulta). Pasar de un contacto seleccionado a otro **no** lo redibuja: solo se redibujan los dos `ItemContacto` afectados.
- **Es más simple.** Sin `useMemo` no hay lista de dependencias que mantener.

La regla general: primero, código simple y correcto; las optimizaciones, cuando se mide un problema real.

### 4.8 Por qué no ordenar dentro del selector

Sería tentador escribir:

```jsx
// Alternativa INCORRECTA: no usar
const visibles = useAgenda(estado => filtrarYOrdenar(estado.contactos, ""));
```

Esto rompe la aplicación. Zustand decide si redibujar comparando el resultado del selector con el anterior usando `===`. Este selector crea un **arreglo nuevo cada vez** que se ejecuta, aunque el contenido sea idéntico, así que la comparación siempre da "distinto". React detecta que el valor nunca se estabiliza y corta con un error: *"Maximum update depth exceeded"* (en desarrollo, además, avisa *"The result of getSnapshot should be cached to avoid an infinite loop"*).

La regla: **los selectores deben devolver valores que ya existen en el estado** (un arreglo, un objeto) **o valores simples** (un número, un booleano, un texto), que se comparan por su valor. Las estructuras nuevas se calculan en el cuerpo del componente, como hicimos.

`useAgenda(contactoSeleccionado)` no tiene este problema: `find` devuelve un objeto que **ya existe** dentro del arreglo, no uno nuevo. Y el selector de `ItemContacto` devuelve un booleano.

### 4.9 Probar

La lista aparece ordenada por apellido y agrupada: A, B, D, G, H, J, M, N, Ñ, P, R. "Álvarez" va bajo la A y "Ñañez" después de "Navarro". Tocá un contacto: se pinta. El detalle todavía no responde.

---

## Paso 5. Mostrar el detalle

### 5.1 El problema: dos componentes, un dato

La lista **escribe** la selección (con `seleccionar`) y el detalle la **lee**. Ninguno conoce al otro: se comunican a través del store. Ese desacople es la ventaja principal de un estado compartido.

```text
ItemContacto ──seleccionar(id)──► store.seleccionadoId ──contactoSeleccionado──► PanelDetalle
```

### 5.2 Estilos

```css
/* src/componentes/detalle/detalle.css */
.panel-detalle { min-height: 0; overflow: auto; padding: 32px; }

.detalle-cabecera { display: flex; align-items: center; gap: 20px; margin-bottom: 26px; }
.detalle-cabecera h2 { font-size: 1.6rem; line-height: 1.2; }
.datos { display: grid; grid-template-columns: 110px 1fr; gap: 14px 16px; margin: 0; }
.datos dt { color: var(--suave); font-size: .85rem; padding-top: 2px; }
.datos dd { margin: 0; white-space: pre-wrap; overflow-wrap: anywhere; }
.sin-dato { color: #b5b4ae; }
.confirmar-texto { flex-basis: 100%; font-weight: 600; color: var(--peligro); }

.vacio { height: 100%; display: grid; place-content: center; justify-items: center; gap: 10px; text-align: center; color: var(--suave); }
.vacio-icono {
  width: 84px; height: 84px; border-radius: 50%;
  display: grid; place-items: center;
  background: var(--acento-suave); font-size: 2.6rem;
}
.vacio h2 { color: var(--tinta); }

/* El botón para volver a la lista solo aparece en pantallas angostas */
.panel-detalle .volver { display: none; margin-bottom: 12px; }
@media (max-width: 720px) {
  .panel-detalle .volver { display: inline-flex; }
  .panel-detalle { padding: 16px; }
}
```

`.datos` es una grilla de dos columnas: etiquetas a la izquierda, valores a la derecha. `white-space: pre-wrap` respeta los saltos de línea de las notas, y `overflow-wrap: anywhere` corta los emails largos en lugar de desbordar la tarjeta. Las reglas de `.confirmar-texto` y `.volver` las usamos en los pasos 7 y 9.

### 5.3 Una fila de datos

```jsx
// src/componentes/detalle/Dato.jsx
export function Dato({ etiqueta, children }) {
  return (
    <>
      <dt>{etiqueta}</dt>
      <dd>{children || <span className="sin-dato">—</span>}</dd>
    </>
  );
}
```

**`<>...</>`** es un **fragmento**: agrupa varios elementos sin agregar un nodo al DOM. Un componente debe devolver un solo elemento, pero dentro de una lista de definiciones (`<dl>`) los `<dt>` y `<dd>` tienen que ser hijos directos; un `<div>` de por medio rompería la estructura (y la grilla CSS).

Si el dato está vacío, se muestra una raya gris: es mejor que un hueco, porque deja claro que el dato **no existe** y no que no cargó.

### 5.4 Los datos, la cabecera y la ficha

```jsx
// src/componentes/detalle/DatosContacto.jsx
import { Dato } from "./Dato.jsx";

export function DatosContacto({ contacto }) {
  const { telefono, email, notas } = contacto;
  return (
    <dl className="datos">
      <Dato etiqueta="Teléfono">
        {telefono && <a href={`tel:${telefono.replace(/[^\d+]/g, "")}`}>{telefono}</a>}
      </Dato>
      <Dato etiqueta="Email">
        {email && <a href={`mailto:${email}`}>{email}</a>}
      </Dato>
      <Dato etiqueta="Notas">{notas}</Dato>
    </dl>
  );
}
```

Los enlaces `tel:` y `mailto:` hacen que, en un celular, tocar el número abra el marcador. En el `href` el teléfono va sin espacios ni guiones (`tel:+543815550142`), aunque se **muestra** con formato.

`{telefono && <a ...>}`: si el teléfono es una cadena vacía, `&&` devuelve esa cadena vacía, que React no dibuja; entonces `Dato` recibe un `children` *falsy* y muestra la raya.

```jsx
// src/componentes/detalle/CabeceraContacto.jsx
import { nombreCompleto } from "../../agenda/contacto.js";
import { Avatar } from "../comunes/Avatar.jsx";

export function CabeceraContacto({ contacto }) {
  return (
    <header className="detalle-cabecera">
      <Avatar contacto={contacto} grande />
      <h2>{nombreCompleto(contacto)}</h2>
    </header>
  );
}
```

`<Avatar contacto={contacto} grande />`: una prop sin valor vale `true`.

```jsx
// src/componentes/detalle/FichaContacto.jsx  ·  versión provisoria: la completamos en el paso 7
import { Tarjeta } from "../comunes/Tarjeta.jsx";
import { CabeceraContacto } from "./CabeceraContacto.jsx";
import { DatosContacto } from "./DatosContacto.jsx";

export function FichaContacto({ contacto }) {
  return (
    <Tarjeta>
      <CabeceraContacto contacto={contacto} />
      <DatosContacto contacto={contacto} />
    </Tarjeta>
  );
}
```

`FichaContacto` se lee como una frase: una tarjeta con la cabecera y los datos del contacto. Ninguno de estos tres componentes usa el store: reciben el contacto por props.

### 5.5 Cuando no hay selección

```jsx
// src/componentes/detalle/SinSeleccion.jsx
import { useAgenda } from "../../store/useAgenda.js";

export function SinSeleccion() {
  const total = useAgenda(estado => estado.contactos.length);
  return (
    <div className="vacio">
      <div className="vacio-icono" aria-hidden="true">👤</div>
      <h2>{total > 0 ? "Elegí un contacto" : "Agenda vacía"}</h2>
      <p>{total > 0 ? "Seleccioná un contacto de la lista para ver sus datos." : "Creá el primer contacto con el botón «Nuevo contacto»."}</p>
    </div>
  );
}
```

El **estado vacío** también se diseña: le dice al usuario qué hacer a continuación.

### 5.6 El panel de detalle

Reemplazá el `PanelDetalle` provisorio:

```jsx
// src/componentes/detalle/PanelDetalle.jsx  ·  versión provisoria: la reemplazamos en el paso 7
import { useAgenda, contactoSeleccionado } from "../../store/useAgenda.js";
import { FichaContacto } from "./FichaContacto.jsx";
import { SinSeleccion } from "./SinSeleccion.jsx";
import "./detalle.css";

export function PanelDetalle() {
  const contacto = useAgenda(contactoSeleccionado);
  return (
    <section className="panel-detalle">
      {contacto ? <FichaContacto key={contacto.id} contacto={contacto} /> : <SinSeleccion />}
    </section>
  );
}
```

`useAgenda(contactoSeleccionado)`: le pasamos al hook el selector del store, tal cual. Si el contacto seleccionado se modifica (paso 7), `find` devuelve el objeto nuevo y el panel se redibuja; si cambia otro contacto, el seleccionado sigue siendo el mismo objeto y el panel no se toca.

La `key={contacto.id}` todavía no tiene efecto visible. En el paso 7 vamos a ver por qué es importante.

### 5.7 Probar

Tocá distintos contactos: el detalle cambia al instante. Fijate en Sofía Medina (sin teléfono) y Tomás Herrera (sin email): el dato faltante aparece como "—".

---

## Paso 6. Búsqueda

### 6.1 Dónde vive la consulta

La búsqueda involucra dos componentes: la caja donde se escribe y la lista que se filtra. Guardamos la consulta en el store (ya tiene el campo `consulta` y la acción `buscar`): así cualquier componente puede leerla o cambiarla; por ejemplo, `restaurarEjemplos` la limpia.

El filtrado propiamente dicho ya está escrito: es `coincide` y `filtrarYOrdenar`, del módulo. Falta la caja.

### 6.2 La caja de búsqueda

```jsx
// src/componentes/lista/CajaBusqueda.jsx
import { useAgenda } from "../../store/useAgenda.js";

export function CajaBusqueda({ visibles, total }) {
  const consulta = useAgenda(estado => estado.consulta);
  const buscar   = useAgenda(estado => estado.buscar);

  function limpiarBusqueda() {
    buscar("");
    document.getElementById("buscar").focus();
  }

  return (
    <div className="busqueda">
      <div className="busqueda-caja">
        <span className="busqueda-lupa" aria-hidden="true">🔍</span>
        <input id="buscar" type="search" value={consulta}
               placeholder="Buscar por nombre, teléfono o email"
               aria-label ="Buscar contactos"
               onChange   ={evento => buscar(evento.target.value)}
               onKeyDown  ={evento => { if (evento.key === "Escape") buscar(""); }} />
        {consulta && (
          <button className="busqueda-limpiar" onClick={limpiarBusqueda} aria-label="Limpiar búsqueda">
            ✕
          </button>
        )}
      </div>
      <p className="busqueda-info">
        {consulta ? `${visibles} de ${total} contactos` : `${total} contactos`}
      </p>
    </div>
  );
}
```

**Input controlado.** El campo tiene `value={consulta}` y un `onChange` que llama a `buscar`. El valor que se ve no lo decide el navegador sino el estado: cada tecla dispara `onChange`, `buscar` actualiza el store, el componente se redibuja y el `input` muestra el valor nuevo. Parece una vuelta larga, pero tiene una ventaja enorme: **el estado es la única fuente de verdad**. Si otro código cambia la consulta (Escape, el botón de limpiar, `restaurarEjemplos`), el campo se actualiza solo.

**Escape** dentro del campo vacía la consulta: `onKeyDown` recibe cada tecla y `evento.key` dice cuál es.

**Dar foco sin `useRef`.** Al tocar la "x", la búsqueda se vacía y conviene devolver el foco al campo para seguir escribiendo. Para eso hace falta el `<input>` real del DOM. Lo habitual en React es `useRef`; nosotros le damos al campo un `id` y lo buscamos con `document.getElementById`. Es seguro porque cumplimos dos condiciones:

- solo lo hacemos **dentro de un evento** (el clic en la "x"), nunca mientras React dibuja; para entonces el elemento ya existe en la página;
- el `id` es **único**: hay una sola caja de búsqueda.

### 6.3 Conectar la búsqueda a la lista

Reemplazá `PanelLista` por su versión final:

```jsx
// src/componentes/lista/PanelLista.jsx
import { useAgenda } from "../../store/useAgenda.js";
import { filtrarYOrdenar } from "../../agenda/busqueda.js";
import { CajaBusqueda } from "./CajaBusqueda.jsx";
import { ListaContactos } from "./ListaContactos.jsx";
import { PieLista } from "./PieLista.jsx";
import "./lista.css";

export function PanelLista() {
  const contactos = useAgenda(estado => estado.contactos);
  const consulta  = useAgenda(estado => estado.consulta);

  // Dato derivado: se calcula en cada dibujo a partir del estado
  const visibles = filtrarYOrdenar(contactos, consulta);

  return (
    <section className="panel-lista">
      <CajaBusqueda visibles={visibles.length} total={contactos.length} />
      <ListaContactos contactos={visibles} total={contactos.length} consulta={consulta} />
      <PieLista />
    </section>
  );
}
```

`visibles` es un **dato derivado**: no se guarda en ningún lado, se calcula a partir de dos datos que sí están guardados (`contactos` y `consulta`). Guardarlo sería duplicar información y arriesgarse a que quede desactualizada.

Observá el flujo completo de una tecla:

```text
tecla "g" ─► onChange ─► buscar("g") ─► store.consulta = "g"
                                            │
           ┌────────────────────────────────┴──────────────────┐
           ▼                                                   ▼
  CajaBusqueda (value="g")              PanelLista: recalcula visibles
                                                   ▼
                                        ListaContactos dibuja el resultado
```

### 6.4 Probar

- Escribí `nanez`: aparece Camila Ñañez, sin haber escrito la eñe.
- Escribí `gómez vale`: aparece Valentina Gómez (dos palabras, en cualquier orden).
- Escribí `5550142`: aparece Lucía Bustos (dígitos del teléfono, sin separadores).
- Escribí `zzz`: aparece el mensaje "Ningún contacto coincide con «zzz»".
- Escape o la "x" limpian la búsqueda; con la "x", el foco vuelve al campo.
- Seleccioná un contacto y después buscá otra cosa: el detalle se mantiene aunque el contacto ya no figure en la lista. La selección y el filtro son independientes.

---

## Paso 7. Edición: alta, modificación y baja con `useForm`

### 7.1 El modo

El panel de detalle tiene tres formas de verse, según el campo `modo` del store:

| `modo`     | Contacto seleccionado | Se muestra                            |
| ---------- | --------------------- | ------------------------------------- |
| `"nuevo"`  | no importa            | Formulario vacío                      |
| `"editar"` | sí                    | Formulario con los datos del contacto |
| `"ver"`    | sí                    | Ficha del contacto                    |
| `"ver"`    | no                    | Estado vacío                          |

Las acciones del store ya cambian el modo: `empezarAlta`, `empezarEdicion` y `cancelar` lo ponen explícitamente; `agregar`, `actualizar`, `eliminar` y `seleccionar` vuelven a `"ver"`.

### 7.2 El problema de los formularios

Un formulario con cinco campos necesita, para cada uno: guardar su valor, actualizarlo con cada tecla, mostrar su error y borrar el error cuando el usuario corrige. Escrito a mano, son cinco `useState`, cinco funciones de cambio y cinco expresiones para los errores, casi idénticas. Y el formulario de alta y el de edición repetirían todo.

La solución es sacar ese comportamiento a un **hook propio**, `useForm`, y dejar que cada campo se conecte con una sola línea. Un hook propio es una función común cuyo nombre empieza con `use` y que usa otros hooks adentro: sirve para darle nombre a un comportamiento y reutilizarlo.

### 7.3 El hook `useForm`

```js
// src/hooks/useForm.js
import { useState } from "react";

export function useForm(valoresIniciales, alEnviar) {
  const [valores, setValores] = useState(valoresIniciales);
  const [errores, setErrores] = useState({});

  function cambiar(evento) {
    const { name, value } = evento.target;
    setValores(previos => ({ ...previos, [name]: value }));
    setErrores(previos => ({ ...previos, [name]: undefined }));
  }

  function enviar(evento) {
    evento.preventDefault();               // evita que el navegador recargue la página
    const resultado = alEnviar(valores);
    if (resultado && !resultado.ok) setErrores(resultado.errores);
  }

  // Todo lo que un campo necesita para estar conectado al formulario
  function registrar(nombre) {
    return { name: nombre, value: valores[nombre] ?? "", onChange: cambiar, error: errores[nombre] };
  }

  return { valores, errores, registrar, enviar };
}
```

`useForm` recibe los valores iniciales y la función a ejecutar al enviar. Devuelve lo que el formulario necesita. Pieza por pieza:

**Dos estados.** Un solo objeto `valores` para todos los campos (`{ nombre: "...", apellido: "...", ... }`) y un objeto `errores` con la misma forma. Así, agregar un campo al formulario no exige agregar un `useState`.

**Un único `cambiar` para todos los campos.** El truco está en el atributo `name` de cada `<input>`: cuando el usuario escribe, `evento.target` es el campo que cambió, y `evento.target.name` dice **cuál** es. Con una *propiedad calculada* (`[name]: value`) actualizamos justo esa propiedad: si `name` es `"email"`, queda `{ ...previos, email: value }`. Al mismo tiempo borramos el error de ese campo: el mensaje rojo no se queda acusando algo que el usuario ya está corrigiendo.

Usamos la forma con función (`setValores(previos => ...)`) porque el valor nuevo depende del anterior.

**`enviar` no valida: pregunta.** Evita el comportamiento original de un `<form>` (enviar los datos a un servidor y recargar la página) y le entrega los valores a `alEnviar`. Si la respuesta es `{ ok: false, errores }`, los muestra. `useForm` no conoce las reglas de la agenda: se adapta a nuestras acciones del store, que ya validan y responden con esa forma. Así, las reglas siguen en un solo lugar.

**`registrar(nombre)`** devuelve, en un objeto, todo lo que un campo necesita: su `name`, su `value`, el `onChange` y su `error`. El formulario lo usa con el operador de propagación:

```jsx
<Campo etiqueta="Email" {...registrar("email")} />
// equivale a:
<Campo etiqueta="Email" name="email" value={valores.email} onChange={cambiar} error={errores.email} />
```

Una línea por campo, y es imposible olvidarse de conectar alguna de las cuatro piezas. (Librerías populares de formularios, como React Hook Form, usan este mismo nombre y esta misma idea).

`valores[nombre] ?? ""` garantiza que el `value` nunca sea `undefined`: React distingue entre un campo *controlado* (con `value`) y uno *no controlado* (sin él), y avisa si un campo pasa de uno a otro.

**Los valores iniciales se usan una sola vez.** `useState(valoresIniciales)` toma el valor inicial **en el primer dibujo** y después lo ignora. Si el formulario recibe otros valores iniciales más tarde, no los ve. Lo resolvemos con `key` en 7.7.

### 7.4 Un campo reutilizable

```jsx
// src/componentes/comunes/Campo.jsx
import "./comunes.css";

export function Campo({ etiqueta, name, error, obligatorio = false, multilinea = false, ...resto }) {
  const id = `campo-${name}`;
  const Control = multilinea ? "textarea" : "input";

  return (
    <div className={error ? "campo con-error" : "campo"}>
      <label htmlFor={id}>
        {etiqueta}{obligatorio && <span className="obligatorio"> *</span>}
      </label>
      <Control id={id} name={name}
               aria-invalid={Boolean(error)}
               aria-describedby={error ? `${id}-error` : undefined}
               {...resto} />
      {error && <span className="error" id={`${id}-error`}>{error}</span>}
    </div>
  );
}
```

`Campo` está en `comunes/` porque no sabe nada de contactos: sirve para cualquier formulario. Detalles:

- **El `id` se deriva del `name`.** La etiqueta y el control se vinculan con `htmlFor` / `id`: así, tocar la etiqueta enfoca el campo y el lector de pantalla anuncia "Nombre" al entrar. React tiene `useId` para generar identificadores únicos; acá no hace falta porque hay un solo formulario en pantalla y cada campo tiene un `name` distinto.
- **Etiqueta dinámica.** `const Control = multilinea ? "textarea" : "input"` guarda **el nombre de un elemento** en una variable. Al escribir `<Control ...>`, JSX lo trata como ese elemento. La variable **debe empezar con mayúscula**: JSX interpreta las minúsculas como etiquetas HTML literales.
- **`...resto`** recibe `value`, `onChange` (que vienen de `registrar`), y también `type`, `placeholder`, `autoComplete` o `autoFocus`, y los pasa al control.
- **Accesibilidad.** `aria-invalid` marca el campo con error, y `aria-describedby` vincula el mensaje, de modo que el lector de pantalla lo lee al entrar en el campo.

### 7.5 El formulario

```css
/* src/componentes/formulario/formulario.css */
.formulario h2 { margin-bottom: 20px; font-size: 1.4rem; }
.fila { display: grid; grid-template-columns: 1fr 1fr; gap: 0 16px; }
.ayuda { margin-left: auto; font-size: .8rem; color: var(--suave); }

/* Pantallas angostas: un campo por fila */
@media (max-width: 720px) {
  .fila { grid-template-columns: 1fr; }
}
```

```jsx
// src/componentes/formulario/FormularioContacto.jsx
import { CONTACTO_VACIO } from "../../agenda/contacto.js";
import { useForm } from "../../hooks/useForm.js";
import { Tarjeta } from "../comunes/Tarjeta.jsx";
import { Campo } from "../comunes/Campo.jsx";
import { Acciones } from "../comunes/Acciones.jsx";
import { Boton } from "../comunes/Boton.jsx";
import "./formulario.css";

export function FormularioContacto({ titulo, inicial, alGuardar, alCancelar }) {
  const { registrar, enviar } = useForm({ ...CONTACTO_VACIO, ...inicial }, alGuardar);

  function alPresionarTecla(evento) {
    if (evento.key === "Escape") alCancelar();
  }

  return (
    <Tarjeta>
      <form className="formulario" onSubmit={enviar} onKeyDown={alPresionarTecla} noValidate>
        <h2>{titulo}</h2>
        <div className="fila">
          <Campo etiqueta="Nombre" obligatorio autoFocus autoComplete="off" {...registrar("nombre")} />
          <Campo etiqueta="Apellido" autoComplete="off" {...registrar("apellido")} />
        </div>
        <div className="fila">
          <Campo etiqueta="Teléfono" type="tel" autoComplete="off" placeholder="+54 381 555-0000" {...registrar("telefono")} />
          <Campo etiqueta="Email" type="email" autoComplete="off" placeholder="nombre@dominio.com" {...registrar("email")} />
        </div>
        <Campo etiqueta="Notas" multilinea {...registrar("notas")} />

        <Acciones>
          <Boton type="submit" variante="primario">Guardar</Boton>
          <Boton onClick={alCancelar}>Cancelar</Boton>
          <span className="ayuda">Enter guarda · Esc cancela</span>
        </Acciones>
      </form>
    </Tarjeta>
  );
}
```

Gracias a `useForm`, el componente casi no tiene lógica: describe qué campos hay y cómo se ordenan.

- **El borrador es estado local.** Mientras el usuario escribe, los datos **no** van al store: viven en el `useState` de `useForm`. Recién al guardar se entregan, enteros, a la acción. Si el usuario cancela, el store nunca se enteró de los cambios a medio hacer, y la lista no muestra un nombre a medio escribir.
- **`{ ...CONTACTO_VACIO, ...inicial }`** asegura que estén los cinco campos aunque `inicial` traiga menos. En el alta, `inicial` es `CONTACTO_VACIO`; en la edición, el contacto completo (el `id` que trae de más lo descarta `limpiar` en el store).
- **`autoFocus`** en el primer campo hace que React le dé foco cuando el formulario aparece, sin necesidad de `useRef`.
- **`noValidate`** desactiva los globos de validación del navegador, para mostrar los nuestros.
- **`<Boton type="submit">`** hace que Enter, en cualquier campo de una línea, guarde. El de Cancelar es `type="button"` (el valor por defecto de `Boton`), así no envía el formulario.
- **Escape**, dentro del formulario, cancela.
- **Nombres de las props de eventos.** Las props que llevan funciones para avisar de algo las nombramos con el prefijo `al`: `alGuardar`, `alCancelar`. Es el equivalente en castellano del `on` de los eventos nativos (`onClick`) y deja claro, desde el nombre, que la prop es "lo que hay que hacer cuando…".

### 7.6 Las acciones de la ficha: modificar y eliminar

La ficha necesita dos botones: "Editar" y "Eliminar". Eliminar es la única operación que no se puede deshacer, así que pide confirmación **dentro de la misma tarjeta**, en lugar de un `confirm()` del navegador, que bloquea la página y no se puede diseñar:

```jsx
// src/componentes/detalle/AccionesFicha.jsx
import { useState } from "react";
import { useAgenda } from "../../store/useAgenda.js";
import { nombreCompleto } from "../../agenda/contacto.js";
import { Acciones } from "../comunes/Acciones.jsx";
import { Boton } from "../comunes/Boton.jsx";

export function AccionesFicha({ contacto }) {
  const empezarEdicion = useAgenda(estado => estado.empezarEdicion);
  const eliminar = useAgenda(estado => estado.eliminar);
  const [confirmando, setConfirmando] = useState(false);

  if (confirmando) {
    return (
      <Acciones>
        <span className="confirmar-texto">¿Eliminar a {nombreCompleto(contacto)}? No se puede deshacer.</span>
        <Boton variante="peligro" onClick={() => eliminar(contacto.id)}>Sí, eliminar</Boton>
        <Boton onClick={() => setConfirmando(false)}>Cancelar</Boton>
      </Acciones>
    );
  }

  return (
    <Acciones>
      <Boton variante="primario" icono="✏️" onClick={empezarEdicion}>Editar</Boton>
      <Boton variante="peligro-suave" icono="🗑️" onClick={() => setConfirmando(true)}>Eliminar</Boton>
    </Acciones>
  );
}
```

La confirmación es estado local (`confirmando`): solo le importa a este componente. Con un retorno temprano, el componente muestra una de dos barras de acciones.

Completá la ficha:

```jsx
// src/componentes/detalle/FichaContacto.jsx
import { Tarjeta } from "../comunes/Tarjeta.jsx";
import { CabeceraContacto } from "./CabeceraContacto.jsx";
import { DatosContacto } from "./DatosContacto.jsx";
import { AccionesFicha } from "./AccionesFicha.jsx";

export function FichaContacto({ contacto }) {
  return (
    <Tarjeta>
      <CabeceraContacto contacto={contacto} />
      <DatosContacto contacto={contacto} />
      <AccionesFicha contacto={contacto} />
    </Tarjeta>
  );
}
```

### 7.7 La `key` que reinicia el estado

Supongamos que estamos editando a Lucía y, sin guardar, el formulario pasa a mostrar a Bruno. Es **el mismo componente** `FormularioContacto` en el mismo lugar del árbol; solo cambiaron sus props. React lo reutiliza y **conserva su estado**, y el `useState` de `useForm` ya tomó los valores de Lucía: veríamos los datos de Lucía con el título de Bruno.

La solución es darle una `key` distinta para cada contacto:

```jsx
<FormularioContacto key={contacto.id} ... />
```

Cuando la `key` cambia, React considera que es **otro componente**: descarta el anterior (con todo su estado, incluido el de sus hijos) y crea uno nuevo, que toma sus valores iniciales desde cero. La `key` no es solo para listas: es la forma de decirle a React "esto es otra cosa".

Lo mismo pasa con la confirmación de baja. Sin la `key={contacto.id}` en `FichaContacto` que pusimos en el paso 5: tocás "Eliminar" en Lucía, aparece "¿Eliminar a Lucía Bustos?", y antes de responder elegís a Bruno en la lista. React reutilizaría `AccionesFicha` con `confirmando` en `true` y mostraría "¿Eliminar a Bruno Díaz?", una pregunta que nadie hizo, a un clic de borrar al contacto equivocado. Con la `key`, cambiar de contacto descarta la ficha entera, y con ella la confirmación pendiente.

### 7.8 El panel de detalle con los tres modos

Reemplazá `PanelDetalle`:

```jsx
// src/componentes/detalle/PanelDetalle.jsx  ·  versión provisoria: la completamos en el paso 9
import { useAgenda, contactoSeleccionado } from "../../store/useAgenda.js";
import { CONTACTO_VACIO } from "../../agenda/contacto.js";
import { FormularioContacto } from "../formulario/FormularioContacto.jsx";
import { FichaContacto } from "./FichaContacto.jsx";
import { SinSeleccion } from "./SinSeleccion.jsx";
import "./detalle.css";

export function PanelDetalle() {
  const modo       = useAgenda(estado => estado.modo);
  const contacto   = useAgenda(contactoSeleccionado);
  const agregar    = useAgenda(estado => estado.agregar);
  const actualizar = useAgenda(estado => estado.actualizar);
  const cancelar   = useAgenda(estado => estado.cancelar);

  let contenido;
  if (modo === "nuevo") {
    contenido = <FormularioContacto key="nuevo" titulo="Nuevo contacto"
                                    inicial={CONTACTO_VACIO} alGuardar={agregar} alCancelar={cancelar} />;
  } else if (modo === "editar" && contacto) {
    contenido = <FormularioContacto key={contacto.id} titulo="Editar contacto"
                                    inicial={contacto} alGuardar={datos => actualizar(contacto.id, datos)}
                                    alCancelar={cancelar} />;
  } else if (contacto) {
    contenido = <FichaContacto key={contacto.id} contacto={contacto} />;
  } else {
    contenido = <SinSeleccion />;
  }

  return <section className="panel-detalle">{contenido}</section>;
}
```

Con cuatro casos, un `if`/`else if` sobre una variable es más legible que ternarios anidados dentro del JSX. Los elementos JSX son valores comunes: se pueden guardar en una variable y usar después.

El mismo `FormularioContacto` sirve para alta y edición; solo cambian las props:

- en el alta, `alGuardar` es directamente `agregar`;
- en la edición, `alGuardar` es una flecha que **agrega el `id`**: `datos => actualizar(contacto.id, datos)`. El formulario no sabe qué contacto edita ni le importa.

Ambas acciones devuelven `{ ok, errores }`, que es justo lo que espera `useForm`.

### 7.9 Probar

- **Alta.** Tocá "Nuevo contacto". El foco va al nombre. Tocá "Guardar" sin escribir nada: aparecen dos errores (nombre obligatorio, y teléfono o email). Escribí un nombre: su error desaparece. Completá un email con mayúsculas y espacios y apretá Enter: el contacto aparece en la lista, en su lugar alfabético, seleccionado, con el email en minúsculas.
- **Modificación.** Tocá "Editar", cambiá el teléfono por `abc` y guardá: error. Corregilo y guardá. Probá también cambiar el apellido: el contacto se mueve de grupo en la lista.
- **Cancelación.** Editá, cambiá algo y apretá Escape: los datos originales siguen intactos.
- **Baja.** "Eliminar" pide confirmación. Elegí otro contacto antes de confirmar: la confirmación desaparece. Volvé, confirmá: el contacto se va y el panel muestra el estado vacío.

Falta un problema evidente: **recargá la página y todo vuelve a los ejemplos**.

---

## Paso 8. Persistencia con hooks

### 8.1 El problema

El store vive en la memoria de la página. Al recargar, todo se pierde. Necesitamos guardarlo en algún lugar que sobreviva.

`localStorage` es un almacenamiento del navegador que guarda pares **clave → texto**, separados por sitio, sin vencimiento. Tiene una interfaz mínima:

```js
localStorage.setItem("clave", "valor");
localStorage.getItem("clave");      // → "valor"
localStorage.getItem("no-existe");  // → null
```

Solo guarda texto, así que los contactos se convierten con `JSON.stringify` al guardar y se reconstruyen con `JSON.parse` al leer.

Hablar con `localStorage` es un **efecto secundario**, así que lo resolvemos con `useEffect`, dentro de un hook propio que encapsula todo el comportamiento: `App` lo usa con una línea.

### 8.2 El hook `usePersistencia`

```js
// src/hooks/usePersistencia.js
import { useState, useEffect } from "react";
import { useAgenda } from "../store/useAgenda.js";
import { EJEMPLOS } from "../agenda/ejemplos.js";

const CLAVE = "agenda.contactos.v1";

function leerGuardados() {
  try {
    const texto = localStorage.getItem(CLAVE);
    if (texto === null) return null;
    const datos = JSON.parse(texto);
    return Array.isArray(datos) ? datos : null;
  } catch {
    return null;   // JSON roto o almacenamiento bloqueado
  }
}

export function usePersistencia() {
  const contactos      = useAgenda(estado => estado.contactos);
  const reemplazarTodo = useAgenda(estado => estado.reemplazarTodo);
  const [cargado, setCargado] = useState(false);

  // a) Al montar: leer lo guardado (o usar los ejemplos la primera vez)
  useEffect(() => {
    reemplazarTodo(leerGuardados() ?? EJEMPLOS);
    setCargado(true);
  }, [reemplazarTodo]);

  // b) Cada vez que cambian los contactos: guardar
  useEffect(() => {
    if (!cargado) return;
    localStorage.setItem(CLAVE, JSON.stringify(contactos));
  }, [cargado, contactos]);

  return cargado;
}
```

**Leer de forma segura.** Lo que viene de afuera **no es confiable**. Puede no existir (primera visita), estar roto (alguien lo editó a mano) o no ser accesible (algunos navegadores bloquean el almacenamiento en modo privado). Ante cualquier problema, `leerGuardados` devuelve `null`, que significa "no hay nada utilizable", y la aplicación sigue funcionando. La clave lleva un **número de versión** (`v1`): si algún día cambia la forma de los contactos, una clave nueva (`v2`) evita leer datos con el formato viejo.

`CLAVE` y `leerGuardados` no se exportan: son detalles internos del hook.

Son dos efectos, cada uno con una responsabilidad:

**a) Cargar, una vez.** Lee lo guardado; si no hay nada (primera visita), usa los ejemplos. Reemplaza al efecto provisorio que teníamos en `App`.

**b) Guardar, en cada cambio.** Depende de `contactos`: cada vez que una acción produce un arreglo nuevo (y por la inmutabilidad, cualquier cambio produce uno nuevo), el efecto vuelve a correr y guarda. Cambiar la selección o la consulta **no** dispara el guardado, porque `contactos` sigue siendo el mismo arreglo. Persistimos los datos, no el estado de la interfaz.

### 8.3 Por qué la bandera `cargado`

¿Para qué sirve `if (!cargado) return;` en el efecto de guardado? Sigamos la secuencia **sin** esa línea:

```text
1. Primer dibujo: contactos = []  (el valor inicial del store)
2. Efecto a): reemplazarTodo(datos guardados)   ← pide un cambio para el próximo dibujo
3. Efecto b): guarda contactos... que en ESTE dibujo todavía valen []
              ⚠ se acaba de escribir [] encima de la agenda guardada
4. Segundo dibujo: contactos = datos guardados
5. Efecto b): vuelve a guardar los datos correctos
```

Los efectos de un mismo dibujo ven los valores **de ese dibujo**. En el paso 3, el efecto b) guarda el arreglo vacío del primer dibujo, aunque el a) ya haya pedido el cambio. El paso 5 lo arregla, pero mientras tanto la agenda guardada estuvo vacía: si algo fallara entre los pasos 3 y 5 (un error, la pestaña que se cierra), los datos se perderían.

La bandera `cargado` impide guardar hasta que la carga haya ocurrido. El hook la devuelve, y `App` la usa para no dibujar nada hasta tener los datos, evitando un parpadeo de "agenda vacía" al arrancar.

### 8.4 StrictMode: los efectos se ejecutan dos veces

Con `npm run dev`, `StrictMode` monta cada componente, lo desmonta y lo vuelve a montar enseguida. Lo hace a propósito, solo en desarrollo, para descubrir efectos que no limpian bien: si un efecto se suscribe y no se da de baja, el doble montaje deja dos suscripciones y el error salta a la vista.

Nuestros efectos lo soportan: cargar dos veces da el mismo resultado, y guardar dos veces también. Si un efecto se suscribiera a algo externo (por ejemplo, a un evento de la ventana con `window.addEventListener`), tendría que devolver una **función de limpieza** que se dé de baja: `return () => window.removeEventListener(...)`. React la ejecuta antes de volver a correr el efecto y cuando el componente desaparece; sin ella, el doble montaje dejaría dos suscripciones activas.

Podés comprobar el doble montaje agregando un `console.log` dentro de un efecto: en desarrollo aparece dos veces; con `npm run build` (paso 10), una.

### 8.5 App con persistencia

Reemplazá `App`. El efecto provisorio del paso 3 desaparece: su trabajo ahora lo hace `usePersistencia`, y mejor.

```jsx
// src/App.jsx  ·  versión provisoria: la completamos en el paso 9
import { usePersistencia } from "./hooks/usePersistencia.js";
import { Encabezado } from "./componentes/encabezado/Encabezado.jsx";
import { PanelLista } from "./componentes/lista/PanelLista.jsx";
import { PanelDetalle } from "./componentes/detalle/PanelDetalle.jsx";
import "./App.css";

export function App() {
  const cargado = usePersistencia();

  if (!cargado) return null;

  return (
    <div className="app">
      <Encabezado />
      <main className="paneles">
        <PanelLista />
        <PanelDetalle />
      </main>
    </div>
  );
}
```

`return null` significa "no dibujar nada". Fijate que el `return` temprano está **después** de todos los hooks. Es una regla obligatoria: **los hooks se llaman siempre, en el mismo orden, en cada dibujo**. React los identifica por su posición; si un `return` anterior hiciera que en un dibujo se salteara un hook, React confundiría los estados de unos con otros.

### 8.6 Otra forma: el middleware `persist`

Zustand trae un *middleware* que hace lo mismo sin escribir el hook:

```js
// Alternativa (no la usamos en este tutorial)
import { create } from "zustand";
import { persist } from "zustand/middleware";

export const useAgenda = create(persist(set => ({ /* ...el mismo store... */ }), {
  name: "agenda.contactos.v1",
  partialize: estado => ({ contactos: estado.contactos }),
}));
```

Es la opción habitual en proyectos reales. Acá elegimos escribir el hook porque muestra **cómo** se sincroniza un sistema externo con React: cargar al montar, guardar cuando cambian las dependencias, escuchar eventos y limpiar. Ese patrón se repite con cualquier recurso externo (una API, un WebSocket, un temporizador).

### 8.7 Probar

- Agregá un contacto, modificá otro y eliminá un tercero. Recargá: todo sigue igual.
- Mirá lo guardado en las herramientas de desarrollo del navegador (F12): pestaña **Aplicación** (*Application*) en Chrome o **Almacenamiento** (*Storage*) en Firefox, sección *Local Storage*. Ahí está la clave `agenda.contactos.v1` con los contactos en JSON.
- Rompé el dato a propósito: en esa misma pestaña, reemplazá el valor por `{roto` y recargá. La agenda arranca con los ejemplos, sin errores.
- Tocá "Restaurar ejemplos".

---

## Paso 9. Pantallas angostas

### 9.1 El problema

En un celular no entran dos columnas. El patrón habitual de maestro/detalle en pantallas chicas es mostrar **un panel por vez**: la lista; al elegir un contacto, el detalle ocupa toda la pantalla, con un botón para volver.

La interfaz necesita saber "¿hay algo que mostrar en el detalle?": un contacto seleccionado o un alta en curso. Esa condición sale del store; el resto lo resuelve CSS.

### 9.2 Cada hoja se ocupa de lo suyo

Varias hojas ya traían reglas para pantallas de menos de 720 píxeles, dentro de un `@media (max-width: 720px)`:

| Hoja             | Qué cambia en pantallas angostas                             |
| ---------------- | ------------------------------------------------------------ |
| `encabezado.css` | Los botones quedan solo con su ícono y se oculta el contador |
| `formulario.css` | Un campo por fila en lugar de dos                            |
| `detalle.css`    | Menos margen, y aparece el botón para volver                 |

Cada carpeta decide cómo se adapta su parte de la pantalla. Falta lo que le corresponde a `App`: decidir qué panel se ve. Completá `App.css`:

```css
/* src/App.css */
.app { height: 100dvh; display: grid; grid-template-rows: auto 1fr; }

.paneles { display: grid; grid-template-columns: minmax(280px, 380px) 1fr; min-height: 0; }

/* Pantallas angostas: un panel por vez */
@media (max-width: 720px) {
  .paneles { grid-template-columns: 1fr; }
  .paneles.con-detalle .panel-lista { display: none; }
  .paneles:not(.con-detalle) .panel-detalle { display: none; }
}
```

La grilla pasa a una columna, y la clase `con-detalle` decide cuál de los dos paneles se oculta.

### 9.3 El botón para volver

```jsx
// src/componentes/detalle/BotonVolver.jsx
import { useAgenda } from "../../store/useAgenda.js";
import { Boton } from "../comunes/Boton.jsx";

export function BotonVolver() {
  const seleccionar = useAgenda(estado => estado.seleccionar);
  return (
    <Boton variante="fantasma" icono="←" className="volver" onClick={() => seleccionar(null)}>
      Contactos
    </Boton>
  );
}
```

Volver es deseleccionar: `seleccionar(null)` también sale del modo edición o alta. El botón siempre está en la página; `detalle.css` lo oculta en pantallas anchas con `.panel-detalle .volver { display: none; }`. El selector incluye `.panel-detalle` a propósito: `.boton` (de `comunes.css`) también define `display`, y un selector más específico gana sin depender del orden en que se cargan las hojas.

### 9.4 Panel de detalle y App finales

```jsx
// src/componentes/detalle/PanelDetalle.jsx
import { useAgenda, contactoSeleccionado } from "../../store/useAgenda.js";
import { CONTACTO_VACIO } from "../../agenda/contacto.js";
import { FormularioContacto } from "../formulario/FormularioContacto.jsx";
import { FichaContacto } from "./FichaContacto.jsx";
import { SinSeleccion } from "./SinSeleccion.jsx";
import { BotonVolver } from "./BotonVolver.jsx";
import "./detalle.css";

export function PanelDetalle() {
  const modo = useAgenda(estado => estado.modo);
  const contacto = useAgenda(contactoSeleccionado);
  const agregar = useAgenda(estado => estado.agregar);
  const actualizar = useAgenda(estado => estado.actualizar);
  const cancelar = useAgenda(estado => estado.cancelar);

  let contenido;
  if (modo === "nuevo") {
    contenido = <FormularioContacto key="nuevo" titulo="Nuevo contacto"
                                    inicial={CONTACTO_VACIO} alGuardar={agregar} alCancelar={cancelar} />;
  } else if (modo === "editar" && contacto) {
    contenido = <FormularioContacto key={contacto.id} titulo="Editar contacto"
                                    inicial={contacto} alGuardar={datos => actualizar(contacto.id, datos)}
                                    alCancelar={cancelar} />;
  } else if (contacto) {
    contenido = <FichaContacto key={contacto.id} contacto={contacto} />;
  } else {
    contenido = <SinSeleccion />;
  }

  return (
    <section className="panel-detalle">
      <BotonVolver />
      {contenido}
    </section>
  );
}
```

```jsx
// src/App.jsx
import { useAgenda } from "./store/useAgenda.js";
import { usePersistencia } from "./hooks/usePersistencia.js";
import { Encabezado } from "./componentes/encabezado/Encabezado.jsx";
import { PanelLista } from "./componentes/lista/PanelLista.jsx";
import { PanelDetalle } from "./componentes/detalle/PanelDetalle.jsx";
import "./App.css";

export function App() {
  const cargado = usePersistencia();
  const hayDetalle = useAgenda(estado => estado.seleccionadoId !== null || estado.modo === "nuevo");

  if (!cargado) return null;

  return (
    <div className="app">
      <Encabezado />
      <main className={hayDetalle ? "paneles con-detalle" : "paneles"}>
        <PanelLista />
        <PanelDetalle />
      </main>
    </div>
  );
}
```

El selector `hayDetalle` **calcula** un booleano a partir del estado. A diferencia del ejemplo incorrecto del paso 4, esto no trae problemas: un booleano se compara por valor, así que `true === true` y el componente solo se redibuja cuando la condición realmente cambia.

### 9.5 Probar

Achicá la ventana del navegador (o usá el modo dispositivo de las herramientas de desarrollo, Ctrl+Shift+M). Se ve solo la lista; al tocar un contacto, solo el detalle; "Contactos" vuelve a la lista. "Nuevo contacto" abre el formulario a pantalla completa, con un campo por fila.

---

## Paso 10. Versión de producción y resumen

### 10.1 Compilar

```bash
npm run build
```

Vite lee el árbol de imports desde `index.html`, traduce el JSX, une todos los módulos y todas las hojas, elimina lo que no se usa y comprime el resultado:

```text
dist/index.html                   0.41 kB
dist/assets/index-Dt83j5X2.css    6.17 kB │ gzip:  1.88 kB
dist/assets/index-EqbqVYGg.js   233.31 kB │ gzip: 73.32 kB
```

Más de cuarenta archivos quedan en uno de JavaScript y uno de CSS. El código en el nombre (`EqbqVYGg`; en tu máquina va a ser otro) cambia cada vez que cambia el contenido: así el navegador nunca usa una copia vieja guardada. La carpeta `dist/` es lo único que hay que subir a un servidor web.

Para ver la versión compilada antes de publicarla:

```bash
npm run preview
```

Comprobá que todo funciona igual.

### 10.2 Quién usa qué

```text
src/agenda/        funciones puras ─────────────────┐
                                                    ▼
src/store/         useAgenda (Zustand) ◄──── usa las reglas del dominio
                        ▲         ▲
src/hooks/         usePersistencia   useForm
                        ▲              ▲
src/App.jsx  ───────────┘              │
src/componentes/   leen el store con selectores, usan los hooks,
                   y se componen entre sí  (comunes/ ← todas las áreas)
```

Las flechas apuntan siempre hacia el dominio: los componentes conocen al store, el store conoce a las reglas, y las reglas no conocen a nadie. Por eso se podrían reutilizar `src/agenda/` en un programa de consola o en un servidor sin cambiar una línea.

### 10.3 Lista de comprobación

- [ ] `npm run dev` arranca sin errores en la terminal ni en la consola.
- [ ] La lista está ordenada por apellido, con Álvarez en la A y Ñañez después de Navarro.
- [ ] Al tocar un contacto se ve su ficha y el ítem queda marcado.
- [ ] La búsqueda ignora tildes y mayúsculas, acepta varias palabras y dígitos de teléfono.
- [ ] El alta valida nombre obligatorio y teléfono o email.
- [ ] La edición se guarda; Escape la cancela.
- [ ] La baja pide confirmación, y la confirmación no se traslada a otro contacto.
- [ ] Los cambios sobreviven a una recarga.
- [ ] Con datos corruptos en `localStorage`, la agenda arranca con los ejemplos.
- [ ] En pantallas angostas se ve un panel por vez.
- [ ] `npm run build` termina sin errores y `npm run preview` muestra la misma aplicación.

### 10.4 Qué resolvió cada herramienta

| Herramienta                              | Problema que resolvió en esta aplicación                                                                                             |
| ---------------------------------------- | ------------------------------------------------------------------------------------------------------------------------------------ |
| **npm** y `package.json`                 | Instalar React, ReactDOM, Zustand y Vite con versiones reproducibles                                                                 |
| **Vite**                                 | Traducir JSX, resolver los imports, recargar en caliente y compilar la versión de producción                                         |
| **Módulos ES**                           | Repartir el código en archivos con dependencias explícitas (`import` / `export`)                                                     |
| **React**                                | Describir cada parte de la pantalla como función del estado; React actualiza el DOM                                                  |
| **JSX**                                  | Escribir esa descripción con sintaxis de etiquetas, mezclada con expresiones                                                         |
| **Componentes chicos por carpeta**       | Que cada pieza se entienda de un vistazo y se pueda cambiar sin tocar las demás                                                      |
| **Composición** (`children`, `...resto`) | Construir piezas genéricas (`Boton`, `Tarjeta`, `Campo`) que se combinan en pantallas                                                |
| **Funciones puras del dominio**          | Ordenar, agrupar, buscar y validar, probables sin interfaz                                                                           |
| **Zustand** (`create`, selectores)       | Compartir datos entre componentes lejanos sin pasar props por toda la jerarquía, y redibujar solo lo necesario                       |
| **`useState`**                           | Estado que pertenece a un componente: la respuesta en la página de prueba, la confirmación de baja, valores y errores del formulario |
| **`useEffect`**                          | Hablar con el mundo exterior: leer y guardar en `localStorage`                                                                       |
| **`useForm`**                            | Manejar cualquier cantidad de campos con un objeto de valores, uno de errores y una línea por campo                                  |
| **`usePersistencia`**                    | Encapsular la persistencia completa y usarla con una línea                                                                           |
| **`key`**                                | Identificar elementos de listas y reiniciar el estado de formularios y confirmaciones                                                |

### 10.5 Para seguir

- **Pasar a TypeScript.** Vite lo soporta sin configuración: renombrar los archivos a `.ts` y `.tsx` y describir la forma de un contacto con un tipo.
- **Usar el middleware `persist`** de Zustand en lugar de `usePersistencia`, y comparar.
- **Validar en el formulario.** `useForm` podría recibir una función `validar` opcional para avisar de errores mientras se escribe, sin esperar a guardar.
- **Agregar campos** (empresa, fecha de cumpleaños): el molde `CONTACTO_VACIO` y `limpiar` los incorporan solos, y `useForm` también; falta validarlos y mostrarlos.
- **Favoritos**: un campo booleano, una acción `alternarFavorito` y un grupo especial al principio de la lista.
- **Pruebas automáticas** de las funciones de `src/agenda/` con Vitest, que usa la misma configuración de Vite.
- **Llevar los datos a un servidor**: reemplazar `localStorage` por llamadas a una API REST. El hook de persistencia es el único lugar que cambia.
