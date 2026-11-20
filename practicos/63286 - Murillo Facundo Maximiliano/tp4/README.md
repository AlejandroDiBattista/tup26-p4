# TP4: MiniCRM

Aplicación para gestionar clientes y sus actividades. El proyecto se desarrolla por etapas para mantener separadas la configuración, los datos, las reglas de negocio, la API y la interfaz.

## Requisitos

- Node.js 22.19 o superior.
- npm 10 o superior.

## Instalación y comandos

```sh
npm install
npm run typecheck
npm test
```

En PowerShell, copiá el archivo de ejemplo y prepará la base local antes de iniciar el servidor:

```powershell
Copy-Item .env.example .env
npm run db:setup
npm run dev
```

La configuración de dependencias y scripts está en `package.json`; TypeScript compila desde `src/` hacia `dist/`. `npm test` también compila antes de ejecutar las comprobaciones.

## Base de datos

Durante el desarrollo se usa SQLite local mediante `TURSO_DATABASE_URL=file:./local.db`. Para producción, definir `TURSO_DATABASE_URL` y `TURSO_AUTH_TOKEN` en el entorno de ejecución con los valores de una base Turso. No guardar credenciales reales en el repositorio. La variable `PORT` permite elegir el puerto HTTP y vale `3000` por defecto.

La primera migración está versionada en `drizzle/`. Para preparar la base local, aplicar migraciones y cargar los datos iniciales:

```sh
npm run db:setup
```

Cuando cambie el esquema, generar una nueva migración con `npm run db:generate` y luego aplicarla con `npm run db:migrate`.

`db:setup` carga clientes y actividades de demostración y es idempotente. En producción, aplicar las migraciones con `npm run build` y `npm run db:migrate`; ejecutar `npm run db:seed` solo si también se quieren cargar esos datos ficticios.

## Estructura prevista

- `src/config/`: configuración de la aplicación.
- `src/db/`: conexión, esquema y semilla de la base de datos.
- `src/services/`: reglas de negocio.
- `src/controllers/`: traducción entre HTTP y servicios.
- `src/routes/`: endpoints de la API.
- `public/`: interfaz web `MiniCRM.html` y estilos.
- `drizzle/`: migraciones generadas.
- `tests/`: verificación de integración HTTP con SQLite en memoria.

## API REST

La API devuelve JSON con la forma `{ "data": ..., "error": null }`. Si ocurre un error, devuelve `{ "data": null, "error": { "code": "...", "message": "..." } }`.

| Método | Ruta | Uso |
| --- | --- | --- |
| `GET` | `/api/health` | Comprobar que la API está activa. |
| `GET` | `/api/clientes?q=texto` | Listar o buscar clientes y sus actividades. |
| `GET` | `/api/clientes/:id` | Consultar la ficha y las actividades del cliente. |
| `POST` | `/api/clientes` | Crear un cliente. |
| `PATCH` | `/api/clientes/:id` | Actualizar campos de un cliente. |
| `DELETE` | `/api/clientes/:id` | Eliminar un cliente y sus actividades. |
| `GET` | `/api/clientes/:id/actividades` | Listar actividades de un cliente. |
| `POST` | `/api/clientes/:id/actividades` | Crear una actividad pendiente. |
| `PATCH` | `/api/actividades/:id` | Actualizar una actividad pendiente. |
| `POST` | `/api/actividades/:id/completar` | Marcar una actividad como completada. |
| `DELETE` | `/api/actividades/:id` | Eliminar una actividad pendiente. |

Los errores de validación responden con HTTP 400, los recursos inexistentes con 404 y las operaciones en conflicto con 409.

## Mapa de la aplicación

```text
Navegador (React y JSX) → Express router → controlador → servicio Clientes → Drizzle → SQLite/Turso
```

Las rutas definen los endpoints, los controladores convierten HTTP a llamadas del servicio y el servicio aplica las reglas de negocio. El esquema Drizzle relaciona cada actividad con su cliente; la clave foránea y el borrado transaccional mantienen la integridad de los datos.

`npm test` compila TypeScript y ejecuta una prueba de integración con el runner nativo de Node.js. La prueba crea una base SQLite en memoria, aplica las migraciones y elimina el servidor al finalizar; no modifica `local.db`.

## Interfaz

Con el servidor activo, abrí `http://localhost:3000/` o `http://localhost:3000/MiniCRM.html`. Express sirve la página y sus estilos desde `public/`. La pantalla carga React 18.3.1, ReactDOM 18.3.1 y Babel 7.25.9 desde CDN; la búsqueda, la ficha y los formularios de clientes y actividades consultan la API real. Las actividades completadas se muestran sin acciones de edición o borrado. Para cargar los recursos externos, el navegador necesita conexión a internet.

## Verificación realizada

- `npm run typecheck` y `npm run build`: correctos.
- `npm test`: una prueba de integración aprobada; cubre la página servida, validación, normalización, búsqueda, CRUD de clientes y actividades, finalización y rechazo de cambios a actividades completadas.
- `npm run db:setup` seguido de otra ejecución de `npm run db:seed`: sin duplicados. La base de demostración quedó con 10 clientes, 24 actividades, 8 actividades sin fecha de compromiso y ninguna actividad huérfana.
- Se verificó por HTTP que Express sirve `/`, `MiniCRM.html`, `MiniCRM.css` y la API.

La revisión visual final en un navegador debe hacerse localmente, porque el entorno de desarrollo usado para estas comprobaciones no incluye navegador gráfico.
