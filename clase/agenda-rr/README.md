# CRUD de contactos

React + React Router (modo declarativo) + json-server, con Vite.

## Requisitos

- Node.js 20 o superior

## Instalación

```bash
npm install
```

## Ejecución

Levantar la API y el front a la vez:

```bash
npm start
```

O en dos terminales separadas:

```bash
npm run api   # json-server en http://localhost:3001
npm run dev   # Vite en http://localhost:5173
```

Abrir http://localhost:5173.

El front pide siempre a `/api/contactos`; el proxy de Vite (ver `vite.config.js`) quita el prefijo `/api` y redirige a json-server. Si el puerto 3001 está ocupado, cambiarlo en el script `api` de `package.json` y en `vite.config.js`.

## Rutas

| Ruta          | Pantalla                          |
| ------------- | --------------------------------- |
| `/`           | Lista buscable (`?q=texto`)       |
| `/nuevo`      | Formulario para agregar           |
| `/editar/:id` | Formulario para editar o eliminar |

## Estructura

- `db.json`: 20 contactos de ejemplo (los cambios se guardan acá).
- `src/hooks/useApiREST.js`: acceso a la API (`datos`, `cargando`, `error`, `guardar`, `borrar`).
- `src/hooks/useForm.js`: estado del formulario (`campo`, `enviar`).
- `src/paginas/`: `Lista.jsx` y `Formulario.jsx`.
- `src/index.css`: estilos.

## Otros comandos

```bash
npm run build     # build de producción en dist/
npm run preview   # servir el build
```
