# MiniCRM

Gestión de clientes y sus actividades con **Node.js**, **TypeScript**, **Drizzle ORM** y **SQLite** (local) o **Turso** (producción).

> TP4 — Cuellar Elias Eduardo (58755). Ver [enunciado.md](enunciado.md).

## Requisitos

- Node.js 20.6 o superior (se usa `--env-file-if-exists`).
- npm.

## Instalación

```bash
npm install
```

## Configuración

La conexión se define con variables de entorno. Sin configurar nada, se usa el archivo local `minicrm.db`.

Para personalizarla, copie el ejemplo y edítelo:

```bash
cp .env.example .env
```

| Variable              | Descripción                                               | Por defecto        |
| --------------------- | --------------------------------------------------------- | ------------------ |
| `DATABASE_URL`        | `file:<archivo>.db` (SQLite) o `libsql://...` (Turso)     | `file:minicrm.db`  |
| `DATABASE_AUTH_TOKEN` | Token de Turso. No hace falta en local.                   | —                  |
| `NODE_ENV`            | Con `production`, `DATABASE_URL` pasa a ser obligatoria.  | —                  |

### Producción con Turso

```bash
turso db create minicrm
turso db show minicrm --url        # -> DATABASE_URL
turso db tokens create minicrm     # -> DATABASE_AUTH_TOKEN
```

Cargue esos valores en `.env` (o en las variables del servidor) con `NODE_ENV=production`.

## Base de datos

Crear las tablas y cargar los datos de ejemplo en un solo paso:

```bash
npm run db:setup
```

O por separado:

```bash
npm run db:migrate
```

```bash
npm run db:seed
```

El seed carga 10 clientes ficticios con actividades completadas, pendientes con fecha y pendientes sin fecha. Es **idempotente**: puede ejecutarse varias veces sin duplicar datos (los clientes se identifican por `email` y las actividades por cliente + descripción).

Para empezar de cero, borre `minicrm.db` y vuelva a ejecutar `npm run db:setup`.

## Scripts

| Script                | Acción                                                         |
| --------------------- | -------------------------------------------------------------- |
| `npm run db:generate` | Genera una nueva migración en `drizzle/` tras cambiar el esquema. |
| `npm run db:migrate`  | Aplica las migraciones pendientes.                             |
| `npm run db:seed`     | Carga los datos de ejemplo (sin duplicar).                     |
| `npm run db:setup`    | `db:migrate` + `db:seed`.                                      |
| `npm run db:studio`   | Abre Drizzle Studio para explorar la base.                     |
| `npm run typecheck`   | Verifica los tipos con TypeScript (modo estricto).             |

## Modelo de datos

```
clientes 1 ──── N actividades
```

**clientes**

| Campo       | Tipo    | Notas                 |
| ----------- | ------- | --------------------- |
| `id`        | integer | PK autoincremental    |
| `nombre`    | text    | obligatorio           |
| `apellido`  | text    | obligatorio           |
| `email`     | text    | obligatorio, único    |
| `domicilio` | text    | opcional              |
| `localidad` | text    | opcional              |
| `telefono`  | text    | opcional              |

**actividades**

| Campo               | Tipo    | Notas                                                   |
| ------------------- | ------- | ------------------------------------------------------- |
| `id`                | integer | PK autoincremental                                      |
| `clienteId`         | integer | FK a `clientes.id`, se borra en cascada con el cliente  |
| `descripcion`       | text    | obligatoria, única por cliente                          |
| `fechaCompromiso`   | text    | opcional, `YYYY-MM-DD`                                  |
| `fechaFinalizacion` | text    | `null` = pendiente; con valor = completada              |

## Capa de servicio

Las reglas de negocio viven en la clase `Clientes` ([src/servicios/clientes.ts](src/servicios/clientes.ts)), con métodos estáticos. No conoce HTTP: ante un problema lanza errores de dominio que la API traducirá a un status.

### Clientes

| Método                        | Descripción                                                     |
| ----------------------------- | --------------------------------------------------------------- |
| `listar(busqueda?)`           | Lista ordenada por apellido y nombre, con búsqueda flexible.    |
| `obtener(id)`                 | Ficha del cliente con sus actividades (con estado y ordenadas). |
| `crear(datos)`                | Alta con normalización y email único.                           |
| `actualizar(id, cambios)`     | Modifica solo los campos enviados.                              |
| `eliminar(id)`                | Borra el cliente y todas sus actividades.                       |

**Búsqueda:** cada palabra debe aparecer en algún campo, sin distinguir mayúsculas ni acentos (`jose tucuman`). Con `campo:valor` se limita a un campo (`localidad:salta`, `email:gmail`). El teléfono también se encuentra sin separadores (`3815550101`).

### Actividades

| Método                                   | Descripción                                         |
| ---------------------------------------- | --------------------------------------------------- |
| `listarActividades(clienteId)`           | Actividades del cliente con su estado.              |
| `agregarActividad(clienteId, datos)`     | Alta (descripción única por cliente).               |
| `actualizarActividad(id, cambios)`       | Edita descripción o fecha de compromiso.            |
| `completarActividad(id, fecha?)`         | Registra la finalización (hoy por defecto).         |
| `eliminarActividad(id)`                  | Borra una actividad pendiente.                      |

Cada actividad se devuelve con `estado`, `completada` y `vencida`:

- **completada:** tiene `fechaFinalizacion`.
- **vencida:** no está completada y su `fechaCompromiso` es anterior a hoy.
- **pendiente:** el resto, incluidas las que no tienen fecha.

Las actividades **completadas no se pueden editar, volver a completar ni borrar individualmente**; solo desaparecen al eliminar su cliente. La regla se aplica en la propia consulta (`WHERE fecha_finalizacion IS NULL`), así que tampoco se rompe con dos operaciones simultáneas.

### Normalización

Se aplica antes de guardar ([src/servicios/normalizar.ts](src/servicios/normalizar.ts)):

| Campo                 | Regla                                                                   | Ejemplo                                        |
| --------------------- | ----------------------------------------------------------------------- | ---------------------------------------------- |
| nombre, apellido      | Espacios recortados, mayúscula inicial, partículas en minúscula         | `maría JOSÉ de la vega` → `María José de la Vega` |
| localidad             | Igual que los nombres                                                   | `san miguel de tucumán` → `San Miguel de Tucumán` |
| email                 | Minúsculas y formato válido                                             | ` Ana@Mail.COM ` → `ana@mail.com`              |
| teléfono              | Separadores unificados con `-`, 6 a 15 dígitos, conserva `+` inicial    | `(381) 555 0101` → `381-555-0101`              |
| descripción           | Espacios recortados y mayúscula inicial                                 | `  enviar   mail ` → `Enviar mail`             |
| fechas                | `AAAA-MM-DD` de un día real; la finalización no puede ser futura        | `2026-02-30` → error                           |

Un campo opcional enviado vacío se guarda como `null`.

### Errores

| Clase               | Código          | Cuándo                                           |
| ------------------- | --------------- | ------------------------------------------------ |
| `ErrorValidacion`   | `VALIDACION`    | Datos con formato inválido o faltantes.          |
| `ErrorNoEncontrado` | `NO_ENCONTRADO` | El cliente o la actividad no existen.            |
| `ErrorConflicto`    | `CONFLICTO`     | Email o descripción repetidos.                   |
| `ErrorReglaNegocio` | `REGLA_NEGOCIO` | Editar, completar o borrar una actividad completada. |

## Estructura

```
tp4/
├── drizzle/              # Migraciones SQL generadas por drizzle-kit
├── src/
│   ├── config.ts         # Lectura y validación de variables de entorno
│   ├── servicios/
│   │   ├── clientes.ts   # Clase Clientes: reglas de negocio de clientes y actividades
│   │   ├── normalizar.ts # Validación y normalización de entradas
│   │   ├── fechas.ts     # Fecha de hoy y validación de fechas ISO
│   │   └── errores.ts    # Errores de dominio
│   └── db/
│       ├── schema.ts     # Tablas, relaciones y tipos
│       ├── client.ts     # Conexión (libSQL) e instancia de Drizzle
│       ├── migrate.ts    # Aplica migraciones
│       ├── seed-data.ts  # Datos ficticios
│       └── seed.ts       # Carga idempotente
├── drizzle.config.ts
├── tsconfig.json
└── package.json
```
