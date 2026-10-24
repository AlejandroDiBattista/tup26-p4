# MiniCRM

MiniCRM permite administrar clientes y las actividades pendientes o completadas
de cada uno. El backend usa Node.js, Express, SQLite y Drizzle ORM. La interfaz
está en `public/MiniCRM.html` y utiliza React/JSX y Babel Standalone desde CDN.

## Requisitos

- Node.js 20 o superior.
- npm.
- Conexión a internet para cargar React y Babel desde sus CDN fijados.

## Instalación y ejecución

```sh
npm install
```

Opcionalmente, copia `.env.example` a `.env` y ajusta `PORT` o `DATABASE_URL`.
Por defecto, el servidor usa el puerto `3000` y guarda la base persistente en
`data/minicrm.sqlite`. La carpeta de datos se crea automáticamente y la base no
se incluye en Git.

Inicializa o aplica las migraciones:

```sh
npm run db:migrate
```

Las migraciones también se aplican automáticamente al iniciar el servidor.

```sh
npm start
```

Abre <http://localhost:3000/> (también está disponible en
<http://localhost:3000/MiniCRM.html>). Para desarrollo, `npm run dev` reinicia
el servidor al detectar cambios.

## API REST

| Método | Ruta | Acción |
| --- | --- | --- |
| `GET` | `/api/clientes` | Lista los clientes |
| `GET` | `/api/clientes?busqueda=texto` | Busca por nombre, correo, teléfono o dirección |
| `GET` | `/api/clientes/:id` | Obtiene un cliente |
| `POST` | `/api/clientes` | Crea un cliente |
| `PUT` | `/api/clientes/:id` | Actualiza un cliente |
| `DELETE` | `/api/clientes/:id` | Elimina un cliente y sus actividades |
| `GET` | `/api/clientes/:id/actividades` | Lista sus actividades |
| `POST` | `/api/clientes/:id/actividades` | Crea una actividad |
| `PUT` | `/api/actividades/:id` | Actualiza una actividad pendiente |
| `PATCH` | `/api/actividades/:id/completar` | Marca una actividad como completada |
| `DELETE` | `/api/actividades/:id` | Elimina una actividad pendiente |
| `GET` | `/api/health` | Comprueba el estado del servidor |

Los errores de validación usan `400`, los recursos inexistentes `404` y las
operaciones no permitidas sobre actividades completadas `409`. La validación y
las reglas de negocio se aplican en el servicio, además de la validación de
formularios de la interfaz.

## Pruebas

```sh
npm test
```

Las pruebas usan una base SQLite en memoria; no modifican la base de datos local.
