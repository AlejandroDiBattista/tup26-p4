# MiniCRM didáctico

Base del proyecto para la demostración de Node.js, TypeScript, Drizzle y SQLite.
En desarrollo usa SQLite en el archivo `local.db`; en producción conecta con Turso.

## Requisitos

- Node.js 22 o posterior
- npm

## Instalación

```sh
npm install
cp .env.example .env
```

La base local se crea en `local.db` al aplicar la primera migración.

## Comandos

```sh
npm run dev
npm start
npm run typecheck
npm run db:generate
npm run db:migrate
npm run db:migrate:production
npm run db:studio
npm run db:seed
```

`db:generate` crea migraciones desde el esquema; `db:migrate` las aplica a la
base elegida por el entorno. Para producción, configura `NODE_ENV=production`,
`TURSO_DATABASE_URL` y `TURSO_AUTH_TOKEN` antes de ejecutar
`npm run db:migrate:production`.

## Esquema

El modelo está en `src/esquema.ts`: un cliente tiene actividades; cada
actividad requiere un cliente y se elimina junto con él. Las fechas se guardan
como texto para usar valores de calendario (`AAAA-MM-DD`) y fecha y hora cuando
corresponda.

Genera y aplica la migración inicial con:

```sh
npm run db:generate
npm run db:migrate
```

## Servicio de clientes

`src/servicios/Clientes.ts` exporta la clase estática `Clientes`, con métodos
para listar, buscar por id o email, buscar texto en los campos, crear,
actualizar y eliminar clientes. También administra las actividades a través
del cliente (`listarActividades`, `crearActividad`, `actualizarActividad`,
`completarActividad` y `eliminarActividad`). Al completar una actividad, el
servicio registra la fecha y hora actual en `fechaFinalizacion`. Las
actividades completadas no se pueden editar ni eliminar individualmente.
Todas las operaciones de una actividad reciben el id del cliente y quedan
limitadas a sus actividades. Al guardar clientes, el servicio normaliza
nombres, emails y teléfonos argentinos (en formato internacional E.164).
El servicio usa tipos de inserción inferidos del esquema de Drizzle.

## API REST

Inicia el servidor con `npm start` (o `npm run dev` durante el desarrollo).
La API escucha en el puerto `3000` por defecto; puedes cambiarlo con `PORT`.
Las respuestas y errores usan JSON.

La página de clientes está en `http://localhost:3000/clientes.html` y también
se abre en `http://localhost:3000/`. Muestra un directorio maestro con búsqueda
en vivo por cualquier campo y una ficha de solo lectura con sus actividades;
la búsqueda, ficha e interfaz ocupan la altura de la ventana y las listas
tienen desplazamiento interno.

| Método | Ruta | Acción |
| --- | --- | --- |
| GET | `/api/clientes` | Lista clientes; admite `?buscar=texto` o `?email=correo` |
| POST | `/api/clientes` | Crea un cliente |
| GET | `/api/clientes/:clienteId` | Obtiene un cliente |
| PATCH | `/api/clientes/:clienteId` | Actualiza un cliente |
| DELETE | `/api/clientes/:clienteId` | Elimina un cliente y sus actividades |
| GET | `/api/clientes/:clienteId/actividades` | Lista sus actividades |
| POST | `/api/clientes/:clienteId/actividades` | Crea una actividad |
| GET | `/api/clientes/:clienteId/actividades/:actividadId` | Obtiene una actividad |
| PATCH | `/api/clientes/:clienteId/actividades/:actividadId` | Actualiza una actividad pendiente |
| PATCH | `/api/clientes/:clienteId/actividades/:actividadId/completar` | Completa y registra fecha y hora |
| DELETE | `/api/clientes/:clienteId/actividades/:actividadId` | Elimina una actividad pendiente |

Los datos se envían en JSON. Los campos de fecha usan `AAAA-MM-DD`; al crear o
actualizar una actividad, la fecha de finalización se asigna únicamente al
llamar la ruta para completarla. Los errores tienen la forma
`{"error":{"mensaje":"..."}}`.

## Semilla de ejemplo

Después de aplicar las migraciones, ejecuta `npm run db:seed`. Carga 10
contactos ficticios con cuatro actividades cada uno: completadas, pendientes
sin compromiso, vencidas y futuras. Puedes volver a ejecutarla; actualiza los
contactos de ejemplo y agrega solo las actividades que falten.

## Estado de la demostración

El proyecto incluye la configuración inicial, el modelo y el servicio de
clientes y actividades, la API REST y una página maestro-detalle de consulta.
Los siguientes pasos de la demostración están pendientes.
