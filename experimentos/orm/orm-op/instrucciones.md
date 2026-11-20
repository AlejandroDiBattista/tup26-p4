# Instrucciones: Drizzle ORM + SQLite + Turso (Clase)

## Objetivo de la clase
Aprender a usar **Drizzle ORM** con **SQLite** a través de **@libsql/client** (Turso) de forma sencilla. Trabajaremos con una base de datos local y veremos las operaciones más comunes.

## 1. Proyecto Node.js configurado

Este proyecto usa:
- **drizzle-orm**: ORM para consultas SQL
- **@libsql/client**: Cliente de Turso para SQLite (trabaja con bases locales o en la nube Turso)
- **drizzle-kit**: Para generar y ejecutar migraciones
- **typescript + tsx**: Para escribir y ejecutar TypeScript directamente

### Archivos clave

| Archivo | Qué hace |
|---------|----------|
| `src/schema.ts` | Define las tablas y estructura de la base de datos |
| `src/db.ts` | Configura la conexión a la base de datos |
| `src/index.ts` | Ejemplos de uso (insertar, seleccionar) |
| `drizzle.config.ts` | Configuración de drizzle-kit |
| `.env.example` | Variables de entorno de ejemplo |

## 2. Esquema de la base de datos

El proyecto usa dos tablas simples: **clientes** y **actividades**.

### Tabla `clientes`

| Campo | Tipo | Descripción |
|-------|------|-------------|
| `id` | integer | Identificador único, se auto-incrementa |
| `nombre` | text | Nombre del cliente (obligatorio) |
| `apellido` | text | Apellido del cliente (obligatorio) |
| `email` | text | Email único (obligatorio) |
| `telefono` | text | Teléfono (opcional) |

### Tabla `actividades`

| Campo | Tipo | Descripción |
|-------|------|-------------|
| `id` | integer | Identificador único, se auto-incrementa |
| `clienteId` | integer | Referencia al cliente dueño |
| `titulo` | text | Título/descripción de la actividad (obligatorio) |
| `fechaCompromiso` | text | Fecha de compromiso (opcional) |
| `completada` | boolean | ¿Está completa? (opcional, default: false) |

**Relación**: Un cliente puede tener muchas actividades (N:1).

### Código en `src/schema.ts`:

```typescript
import { integer, sqliteTable, text } from 'drizzle-orm/sqlite-core'

export const clientes = sqliteTable('clientes', {
  id: integer('id').primaryKey({ autoIncrement: true }),
  nombre: text('nombre').notNull(),
  apellido: text('apellido').notNull(),
  email: text('email').notNull().unique(),
  telefono: text('telefono'),
})

export const actividades = sqliteTable('actividades', {
  id: integer('id').primaryKey({ autoIncrement: true }),
  clienteId: integer('cliente_id').notNull().references(() => clientes.id),
  titulo: text('titulo').notNull(),
  fechaCompromiso: text('fecha_compromiso'), // opcional
  completada: integer('completada', { mode: 'boolean' }).notNull().default(false),
})
```

## 3. Configurar la conexión (`src/db.ts`)

```typescript
import 'dotenv/config'
import { drizzle } from 'drizzle-orm/libsql'
import { createClient } from '@libsql/client'

const client = createClient({
  url: process.env.TURSO_DATABASE_URL || 'file:local.db',
  authToken: process.env.TURSO_AUTH_TOKEN,
})

export const db = drizzle(client)
```

- Si no defines `TURSO_DATABASE_URL` ni `TURSO_AUTH_TOKEN`, usará `file:local.db` (SQLite local).
- Para usar Turso nube, setea esas variables de entorno.

## 4. Scripts disponibles

En `package.json`:

| Script | Descripción |
|--------|-------------|
| `db:generate` | Genera migraciones basadas en el esquema |
| `db:migrate` | Ejecuta migraciones contra la base de datos |
| `db:studio` | Abre Drizzle Studio (visualizador visual) |
| `start` | Ejecuta `tsx src/index.ts` |
| `typecheck` | Verifica tipos TypeScript |

## 5. Flujo de trabajo típico

1. **Definir o modificar el esquema** en `src/schema.ts`
2. **Generar migración**: `npm run db:generate`
3. **Revisar migración** en la carpeta `drizzle/`
4. **Ejecutar migración**: `npm run db:migrate`
5. **Usar la base de datos** en tu código
6. **Ver en studio**: `npm run db:studio`

## 6. Uso básico (ejemplos)

### Insertar un cliente y actividades

```typescript
import { db } from './db.ts'
import { clientes, actividades, eq } from './schema.ts'

// 1. Insertar un nuevo cliente
const [cliente] = await db.insert(clientes)
  .values({ nombre: 'Juan', apellido: 'Pérez', email: 'juan@test.com' })
  .returning()

console.log('Cliente creado:', cliente)

// 2. Insertar una actividad con fecha
const [actividad1] = await db.insert(actividades)
  .values({ clienteId: cliente.id, titulo: 'Llamar al cliente', fechaCompromiso: '2026-12-01', completada: false })
  .returning()

console.log('Actividad creada:', actividad1)

// 3. Insertar actividad sin fecha (pendiente simple)
const [actividad2] = await db.insert(actividades)
  .values({ clienteId: cliente.id, titulo: 'Enviar correo de seguimiento', completada: false })
  .returning()

console.log('Actividad sin fecha:', actividad2)

// 4. Seleccionar todas las actividades de un cliente
const todasLasActividades = await db.select().from(actividades).where(eq(actividades.clienteId, cliente.id))
console.log('Actividades de', cliente.nombre, ':', todasLasActividades)

// 5. Seleccionar todos los clientes
console.log('Clientes registrados:', await db.select().from(clientes))
```

## 7. Modo local vs Turso

- **Modo local** (por defecto): Si no hay variables de entorno, usa `file:local.db`
- **Modo Turso**: Proporciona `TURSO_DATABASE_URL` y `TURSO_AUTH_TOKEN` para conectarte a una base remota

## 8. Solución de problemas

- Si hay errores de conexión, verifica `TURSO_DATABASE_URL`
- Los archivos `*.db` y `*.sqlite` están en `.gitignore` (no hacer commit)
- Para ejecutar: `npm install tsx`
- Para verificar tipos: `npm run typecheck`