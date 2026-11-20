# React Router con un CRUD de contactos

Este apunte explica, paso a paso, una pequeña aplicación de contactos hecha con React. El objetivo principal es aprender **React Router**. El resto (la API simulada, los hooks y la interfaz) está para que el ejemplo sea completo y realista.

---

## 1. El problema: una SPA que no se comporta como la web

Una **SPA** (_Single Page Application_) carga una sola página HTML y, a partir de ahí, React dibuja y redibuja la pantalla sin volver a pedir páginas al servidor. Eso la hace rápida, pero rompe algo que en la web damos por sentado: **la URL**.

En un sitio web tradicional la URL cumple tres funciones:

1. **Navegar.** Cada pantalla tiene su dirección: `/contactos`, `/contactos/7/editar`.
2. **Guardar el estado.** La dirección dice qué estamos viendo: `?q=perez` indica que estamos buscando "perez".
3. **Compartir y volver.** Puedo recargar, copiar el enlace, mandarlo por chat, usar los botones Atrás y Adelante, y siempre vuelvo al mismo lugar.

Si hacemos una SPA ingenua, con un `useState` que decide qué pantalla mostrar:

```jsx
function App() {
  const [pantalla, setPantalla] = useState("lista");
  const [idEditado, setIdEditado] = useState(null);

  return pantalla === "lista"
    ? <Lista alEditar={(id) => { setIdEditado(id); setPantalla("editar"); }} />
    : <Formulario id={idEditado} alVolver={() => setPantalla("lista")} />;
}
```

…todo funciona mientras no toquemos el navegador. Pero:

- La URL **no cambia nunca**: siempre es `/`.
- Si recargo la página estando en el formulario, **vuelvo a la lista**.
- El botón **Atrás** sale de la aplicación en lugar de volver a la pantalla anterior.
- No puedo **compartir** el enlace a un contacto o a una búsqueda.

Queremos lo mejor de los dos mundos: la velocidad de la SPA y el comportamiento natural de la web.

## 2. La solución: React Router

**React Router** sincroniza la URL del navegador con lo que React muestra:

- Lee la URL y decide **qué componente dibujar**.
- Cuando el usuario hace clic en un enlace, **cambia la URL sin recargar la página** (usa la History API del navegador).
- Responde a **Atrás, Adelante y recargar** como cualquier sitio web.
- Permite leer **partes de la URL** (`/editar/7` → `id = 7`) y **parámetros de búsqueda** (`?q=perez`).

En esta app usamos el **modo declarativo**: describimos las rutas con componentes JSX (`<Routes>` y `<Route>`). Todo se importa del paquete `react-router`.

### Las rutas de la aplicación

| URL | Pantalla | Qué se lee de la URL |
| --- | --- | --- |
| `/` | Lista de contactos | `?q=` con el texto de búsqueda |
| `/nuevo` | Formulario vacío | nada |
| `/editar/:id` | Formulario con un contacto cargado | `id` del contacto |

Se definen en `src/main.jsx`:

```jsx
import { BrowserRouter, Route, Routes } from "react-router";
import Lista from "./paginas/Lista.jsx";
import Formulario from "./paginas/Formulario.jsx";

createRoot(document.getElementById("root")).render(
  <StrictMode>
    <BrowserRouter>
      <main className="tarjeta">
        <Routes>
          <Route path="/"           element={<Lista />} />
          <Route path="/nuevo"      element={<Formulario />} />
          <Route path="/editar/:id" element={<Formulario />} />
        </Routes>
      </main>
    </BrowserRouter>
  </StrictMode>,
);
```

- `<BrowserRouter>` envuelve toda la app y escucha los cambios de URL.
- `<Routes>` mira la URL actual y elige **una** de sus `<Route>`.
- Cada `<Route>` asocia un `path` con el `element` que se dibuja.
- `:id` es un **parámetro**: coincide con cualquier valor (`/editar/7`, `/editar/abc`) y el componente lo lee con `useParams()`.
- `<main className="tarjeta">` está **fuera** de `<Routes>`, así que se dibuja siempre: es el marco común de todas las pantallas.

Fijate que `/nuevo` y `/editar/:id` usan **el mismo componente**. La diferencia es si la URL trae un `id` o no.

## 3. El servidor simulado: json-server

Para un CRUD necesitamos un servidor que guarde los datos. En lugar de programar uno, usamos **json-server**, que convierte un archivo JSON en una API REST completa.

### Los datos: `db.json`

```json
{
  "contactos": [
    { "id": "1", "nombre": "Juan",  "apellido": "Fernández", "telefono": "381-4100000" },
    { "id": "2", "nombre": "María", "apellido": "Torres",    "telefono": "381-4237919" }
  ]
}
```

Cada clave del objeto raíz (`contactos`) se convierte en un **recurso**. json-server ofrece automáticamente:

| Método | URL | Qué hace |
| --- | --- | --- |
| `GET` | `/contactos` | Devuelve la lista |
| `GET` | `/contactos/7` | Devuelve el contacto 7 |
| `POST` | `/contactos` | Crea un contacto (genera el `id`) |
| `PUT` | `/contactos/7` | Reemplaza el contacto 7 |
| `DELETE` | `/contactos/7` | Borra el contacto 7 |

Los cambios se guardan en el propio `db.json`. Se levanta con:

```bash
npm run api   # json-server --watch db.json --port 3001
```

### El proxy de Vite

El front y la API corren en puertos distintos (Vite en 5173 y json-server en 3001). Para que el front no tenga que conocer ese detalle, **siempre pide a `/api/...`** y Vite redirige esas peticiones. Está en `vite.config.js`:

```js
export default defineConfig({
  plugins: [react()],
  server: {
    proxy: {
      '/api': {
        target: 'http://localhost:3001',
        rewrite: (ruta) => ruta.replace(/^\/api/, ''),
      },
    },
  },
})
```

El recorrido de una petición es:

```
navegador → GET /api/contactos/7 → Vite (5173) → quita "/api" → GET /contactos/7 → json-server (3001)
```

Así también evitamos los problemas de CORS: para el navegador, todo viene del mismo origen.

## 4. Consumir la API con un hook: `useApiREST`

Cada pantalla necesita lo mismo: pedir datos, saber si están cargando, mostrar errores, guardar y borrar. En lugar de repetir `fetch` en cada componente, lo encapsulamos en un **hook propio**.

```js
const { datos, cargando, error, guardar, borrar } = useApiREST(recurso, id);
```

El segundo parámetro decide qué se carga:

| Llamada | Qué carga | `guardar` hace |
| --- | --- | --- |
| `useApiREST("contactos")` | la lista | `POST /api/contactos` |
| `useApiREST("contactos", "7")` | el contacto 7 | `PUT /api/contactos/7` |
| `useApiREST("contactos", null)` | nada | `POST /api/contactos` |

El código completo (`src/hooks/useApiREST.js`):

```js
import { useEffect, useState } from "react";

// Sin id carga la lista, con id carga ese elemento y con null no carga nada.
export function useApiREST(recurso, id) {
  const url = `/api/${recurso}` + (id ? `/${id}` : "");
  const [datos, setDatos] = useState(id === undefined ? [] : null);
  const [cargando, setCargando] = useState(id !== null);
  const [error, setError] = useState(null);

  useEffect(() => {
    if (id === null) return;
    fetch(url)
      .then((res) => res.json())
      .then(setDatos)
      .catch((e) => setError(e.message))
      .finally(() => setCargando(false));
  }, [url, id]);

  const enviar = (metodo, cuerpo) =>
    fetch(url, {
      method: metodo,
      headers: { "Content-Type": "application/json" },
      body: cuerpo && JSON.stringify(cuerpo),
    });

  const guardar = (valores) => enviar(id ? "PUT" : "POST", valores);
  const borrar = () => enviar("DELETE");

  return { datos, cargando, error, guardar, borrar };
}
```

Paso a paso:

1. **Arma la URL.** Con id: `/api/contactos/7`. Sin id: `/api/contactos`.
2. **Valores iniciales.** Si pedimos la lista, `datos` empieza como `[]`, así la pantalla puede hacer `datos.filter(...)` sin esperar. Si pedimos un elemento, empieza en `null`. Con `id === null` no hay nada que cargar, así que `cargando` empieza en `false`.
3. **Carga con `useEffect`.** Se ejecuta al montar el componente y cada vez que cambia la URL. Sigue el camino feliz: `fetch → json → setDatos`. Si algo falla se guarda el mensaje en `error` y, en cualquier caso, se apaga `cargando`.
4. **Escritura.** `enviar` es una función interna que hace el `fetch` con método y cuerpo. `guardar` elige `PUT` si hay id (editar) o `POST` si no (crear). `borrar` hace `DELETE`.

> Es una versión deliberadamente simple. Por ejemplo, no revisa `res.ok`: una respuesta 404 no se trata como error.

## 5. El formulario con `useForm`

En React hay dos maneras de manejar un input:

- **No controlado:** el navegador guarda el valor y React lo lee recién al enviar (por ejemplo, con `new FormData(e.target)`).
- **Controlado:** React guarda el valor en el estado y el input muestra ese estado (`value` + `onChange`).

Lo controlado da más control (podemos precargar los datos de un contacto, validar, transformar), pero obliga a escribir lo mismo en cada campo:

```jsx
const [nombre, setNombre] = useState("");
// …
<input value={nombre} onChange={(e) => setNombre(e.target.value)} />
```

Con tres campos ya es repetitivo, y con diez es insoportable. El hook `useForm` esconde ese trabajo, de modo que escribir un campo controlado sea tan corto como escribir uno no controlado:

```jsx
const { campo, enviar } = useForm(inicial, alEnviar);

<form onSubmit={enviar}>
  <input {...campo("nombre")} />
</form>
```

El código (`src/hooks/useForm.js`):

```js
import { useState } from "react";

export function useForm(inicial, alEnviar) {
  const [valores, setValores] = useState(inicial);

  const campo = (nombre) => ({
    name: nombre,
    value: valores[nombre] ?? "",
    onChange: (e) => setValores((v) => ({ ...v, [nombre]: e.target.value })),
  });

  const enviar = (e) => {
    e.preventDefault();
    alEnviar(valores);
  };

  return { campo, enviar };
}
```

- **Un solo estado** guarda todos los campos en un objeto: `{ nombre, apellido, telefono }`.
- **`campo(nombre)`** devuelve las props que necesita un input: `name`, `value` y `onChange`. Con `{...campo("nombre")}` las "esparcimos" sobre el `<input>`. El `onChange` actualiza solo esa clave del objeto.
- **`enviar`** evita que el navegador recargue la página (`preventDefault`) y le pasa los valores a la función `alEnviar`.

> **Atención:** `useState(inicial)` usa `inicial` **solo en el primer render**. Por eso el formulario de edición espera a tener el contacto cargado antes de llamar a `useForm` (ver la sección siguiente).

## 6. La interfaz de usuario

La interfaz tiene dos pantallas dentro de un mismo marco:

```
main.jsx
└── <BrowserRouter>
    └── <main className="tarjeta">         ← marco común
        └── <Routes>
            ├── "/"           → <Lista />
            ├── "/nuevo"      → <Formulario />
            └── "/editar/:id" → <Formulario />
                                 └── <Campos />  (el formulario en sí)
```

```
src/
├── main.jsx              rutas
├── index.css             estilos
├── hooks/
│   ├── useApiREST.js     acceso a la API
│   └── useForm.js        estado del formulario
└── paginas/
    ├── Lista.jsx
    └── Formulario.jsx
```

### 6.1 La lista (`src/paginas/Lista.jsx`)

```jsx
import { Link, useSearchParams } from "react-router";
import { useApiREST } from "../hooks/useApiREST.js";

export default function Lista() {
  const { datos, cargando, error } = useApiREST("contactos");
  const [params, setParams] = useSearchParams();
  const q = params.get("q") ?? "";

  const buscado = q.toLowerCase();
  const visibles = datos.filter((c) =>
    `${c.nombre} ${c.apellido} ${c.telefono}`.toLowerCase().includes(buscado),
  );

  return (
    <>
      <header>
        <h1>Contactos</h1>
        <Link to="/nuevo" className="boton primario">Agregar</Link>
      </header>
      <input type="search" placeholder="Buscar…"
        value={q}
        onChange={(e) => setParams(e.target.value ? { q: e.target.value } : {}, { replace: true })}
      />
      {/* … tabla con una fila por contacto … */}
      <td><Link to={`/editar/${c.id}`} className="boton">Editar</Link></td>
    </>
  );
}
```

Lo importante desde React Router:

- **La búsqueda vive en la URL, no en un `useState`.** `useSearchParams()` funciona como un `useState`, pero el valor se guarda en `?q=`. Si buscás "perez", la URL pasa a ser `/?q=perez`. Al recargar, compartir el enlace o volver con Atrás, la búsqueda sigue ahí.
- **`{ replace: true }`** reemplaza la entrada del historial en lugar de agregar una nueva. Sin eso, cada letra tecleada sería un paso más para el botón Atrás.
- **Si el texto queda vacío** pasamos `{}`, así la URL vuelve a ser `/` en lugar de `/?q=`.
- **`<Link>`** reemplaza a `<a href>`. Cambia la URL sin recargar la página. "Agregar" va a `/nuevo` y "Editar" a `/editar/7`.

El filtrado se hace en el cliente: la lista completa ya está cargada y `visibles` es un valor derivado, que se recalcula en cada render.

### 6.2 El formulario (`src/paginas/Formulario.jsx`)

Tiene dos componentes. `Formulario` decide qué cargar según la URL y `Campos` dibuja el formulario.

```jsx
import { Link, useNavigate, useParams } from "react-router";
import { useApiREST } from "../hooks/useApiREST.js";
import { useForm } from "../hooks/useForm.js";

const VACIO = { nombre: "", apellido: "", telefono: "" };

export default function Formulario() {
  const { id = null } = useParams();
  const { datos, cargando, error } = useApiREST("contactos", id);

  if (cargando) return <p className="aviso">Cargando…</p>;
  if (error) return <p className="error">{error} <Link to="/">Volver</Link></p>;
  return <Campos id={id} inicial={datos ?? VACIO} />;
}
```

- **`useParams()`** lee el `:id` de la ruta. En `/editar/7` da `{ id: "7" }`. En `/nuevo` no hay parámetro, así que el valor por defecto lo deja en `null`.
- Con `id = null`, `useApiREST` no carga nada y el formulario arranca con `VACIO`. Con un id, carga el contacto y muestra "Cargando…" mientras tanto.
- **`Campos` se monta recién cuando los datos están listos.** Así `useForm` recibe el contacto real como valor inicial (recordá que `useState` solo usa el valor inicial una vez).

```jsx
function Campos({ id, inicial }) {
  const navegar = useNavigate();
  const { guardar, borrar } = useApiREST("contactos", id);
  const { campo, enviar } = useForm(inicial, async (valores) => {
    await guardar(valores);
    navegar("/");
  });

  const eliminar = async () => {
    if (!confirm("¿Eliminar este contacto?")) return;
    await borrar();
    navegar("/");
  };

  return (
    <form onSubmit={enviar}>
      <h1>{id ? "Editar contacto" : "Nuevo contacto"}</h1>
      <label>Nombre  <input required {...campo("nombre")} /></label>
      <label>Apellido<input required {...campo("apellido")} /></label>
      <label>Teléfono<input required type="tel" {...campo("telefono")} /></label>
      <div className="acciones">
        <button className="boton primario">Guardar</button>
        <Link to="/" className="boton">Cancelar</Link>
        {id && <button type="button" className="boton peligro" onClick={eliminar}>Eliminar</button>}
      </div>
    </form>
  );
}
```

- **`useNavigate()`** devuelve una función para navegar **desde código**. La usamos después de guardar o eliminar: esperamos a que el servidor responda y recién entonces volvemos a `/`. La lista se monta de nuevo y pide los datos actualizados.
- **Cancelar** es un `<Link>` común: es navegación iniciada por el usuario, no hace falta código.
- **Eliminar** solo aparece si hay `id`, porque no se puede borrar algo que todavía no existe.
- `useApiREST("contactos", id)` se llama otra vez en `Campos`, pero ahora solo para obtener `guardar` y `borrar`. Con `id = null` no carga nada. Con un id vuelve a pedir el contacto: es una petición de más, aceptada a cambio de mantener el ejemplo simple.

### 6.3 El flujo completo

```
/              → clic en "Editar" (Link)            → /editar/7
/editar/7      → Formulario lee id = "7" (useParams) → GET /api/contactos/7
               → el usuario cambia el teléfono y toca "Guardar"
               → PUT /api/contactos/7 → navegar("/") (useNavigate)
/              → Lista se monta → GET /api/contactos → muestra el cambio
```

### 6.4 El estilo

Hay un único `src/index.css`, sin librerías. La interfaz está pensada para teléfono: la tarjeta ocupa todo el ancho en pantallas chicas y, en pantallas anchas, se limita a 420 px y queda centrada. Cada contacto se muestra como una fila con el nombre y el apellido arriba, el teléfono debajo y el botón Editar a la derecha.

## 7. Cómo ejecutarlo

```bash
npm install
npm start      # levanta json-server y Vite juntos
```

Abrir la dirección que muestra Vite (por defecto http://localhost:5173).

---

## Anexo: receta de React Router en modo declarativo

Esta es una guía práctica, independiente de la app, para usar React Router con componentes (`<Routes>` y `<Route>`).

### Paso 1. Instalar

```bash
npm install react-router
```

Todo se importa de `react-router`.

### Paso 2. Envolver la app con `<BrowserRouter>`

Una sola vez, en la raíz:

```jsx
import { BrowserRouter } from "react-router";

createRoot(document.getElementById("root")).render(
  <BrowserRouter>
    <App />
  </BrowserRouter>,
);
```

Ningún componente de React Router funciona fuera de `<BrowserRouter>`.

### Paso 3. Declarar las rutas

```jsx
import { Routes, Route } from "react-router";

function App() {
  return (
    <Routes>
      <Route path="/"              element={<Inicio />} />
      <Route path="/productos"     element={<Productos />} />
      <Route path="/productos/:id" element={<Producto />} />
      <Route path="*"              element={<NoEncontrado />} />
    </Routes>
  );
}
```

- `path` acepta texto fijo (`/productos`), parámetros (`:id`) y el comodín `*`.
- `path="*"` captura cualquier URL que no coincida con otra ruta: sirve para la página 404.
- El orden no importa: React Router elige la ruta **más específica**.

### Paso 4. Navegar con enlaces

```jsx
import { Link, NavLink } from "react-router";

<Link to="/productos">Ver productos</Link>
<Link to={`/productos/${p.id}`}>{p.nombre}</Link>

// NavLink agrega la clase "active" cuando su ruta es la actual (útil en menús)
<NavLink to="/productos">Productos</NavLink>
```

Usá `<Link>` en lugar de `<a href>`. Con `<a>` el navegador recarga la página entera y se pierde el estado de React.

### Paso 5. Navegar desde código

Para ir a otra pantalla después de una acción (guardar, iniciar sesión, borrar):

```jsx
import { useNavigate } from "react-router";

function Formulario() {
  const navegar = useNavigate();

  const alGuardar = async () => {
    await guardar();
    navegar("/productos");                        // ir a una ruta
    // navegar(-1);                               // equivale a "Atrás"
    // navegar("/login", { replace: true });      // sin dejar rastro en el historial
  };
}
```

Para redirigir **mientras se dibuja** (por ejemplo, si no hay sesión), usá el componente `<Navigate>`:

```jsx
import { Navigate } from "react-router";

if (!usuario) return <Navigate to="/login" replace />;
```

### Paso 6. Leer parámetros de la ruta

```jsx
import { useParams } from "react-router";

// Ruta: /productos/:id   URL: /productos/42
function Producto() {
  const { id } = useParams();   // id === "42" (siempre texto)
}
```

Los parámetros siempre llegan como **texto**. Si necesitás un número, convertilo con `Number(id)`.

### Paso 7. Guardar estado en la URL (`?clave=valor`)

```jsx
import { useSearchParams } from "react-router";

function Productos() {
  const [params, setParams] = useSearchParams();
  const q = params.get("q") ?? "";               // leer
  const orden = params.get("orden") ?? "nombre";

  return (
    <input
      value={q}
      onChange={(e) => setParams({ q: e.target.value, orden }, { replace: true })}  // escribir
    />
  );
}
```

Usalo para todo lo que el usuario querría **compartir o recuperar al recargar**: búsquedas, filtros, orden, página actual, pestaña elegida. `setParams` reemplaza **todos** los parámetros, así que incluí los que quieras conservar.

### Paso 8. Rutas anidadas y layouts con `<Outlet>`

Cuando varias pantallas comparten un marco (menú, encabezado), se anidan las rutas:

```jsx
import { Routes, Route, Outlet, NavLink } from "react-router";

function Layout() {
  return (
    <>
      <nav>
        <NavLink to="/">Inicio</NavLink>
        <NavLink to="/productos">Productos</NavLink>
      </nav>
      <Outlet />   {/* acá se dibuja la ruta hija */}
    </>
  );
}

<Routes>
  <Route element={<Layout />}>
    <Route index element={<Inicio />} />          {/* "/" */}
    <Route path="productos">
      <Route index element={<Productos />} />     {/* "/productos" */}
      <Route path=":id" element={<Producto />} /> {/* "/productos/42" */}
      <Route path="nuevo" element={<Nuevo />} />  {/* "/productos/nuevo" */}
    </Route>
    <Route path="*" element={<NoEncontrado />} />
  </Route>
</Routes>
```

- Una ruta **sin `path`** y con `element` es un layout puro: envuelve a sus hijas sin agregar nada a la URL.
- Las rutas hijas usan paths **relativos** (`":id"`, no `"/productos/:id"`).
- `index` es la ruta que se muestra cuando la URL coincide exactamente con la del padre.
- `<Outlet />` marca dónde se dibuja la ruta hija activa.

### Resumen rápido

| Necesito… | Uso |
| --- | --- |
| Activar el router | `<BrowserRouter>` en la raíz |
| Definir pantallas | `<Routes>` + `<Route path element>` |
| Página 404 | `<Route path="*">` |
| Enlace | `<Link to>` |
| Enlace de menú con estado activo | `<NavLink to>` |
| Navegar tras una acción | `useNavigate()` |
| Redirigir al dibujar | `<Navigate to replace />` |
| Leer `/algo/:id` | `useParams()` |
| Leer y escribir `?clave=valor` | `useSearchParams()` |
| Marco común para varias pantallas | Ruta padre + `<Outlet />` |
