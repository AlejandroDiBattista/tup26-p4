# 🏗️ Tutorial Completo: MiniCRM

> **Trabajo Práctico 4 — Programación 4**
> Alumno: Manca Mariano (63140)
> Stack: Node.js + TypeScript + Express + Drizzle ORM + SQLite + React (CDN)

---

## 📋 Índice

1. [¿Qué es el MiniCRM?](#1-qué-es-el-minicrm)
2. [Arquitectura del Proyecto](#2-arquitectura-del-proyecto)
3. [Estructura de Archivos](#3-estructura-de-archivos)
4. [Flujo Completo: Del Click al Dato](#4-flujo-completo-del-click-al-dato)
5. [Paso a Paso: Cómo se Construyó](#5-paso-a-paso-cómo-se-construyó)
6. [Capa 1: Base de Datos (db/)](#6-capa-1-base-de-datos)
7. [Capa 2: Servicios (services/)](#7-capa-2-servicios)
8. [Capa 3: Controladores (controllers/)](#8-capa-3-controladores)
9. [Capa 4: Rutas (routes/)](#9-capa-4-rutas)
10. [Capa 5: Servidor (server.ts)](#10-capa-5-servidor)
11. [Capa 6: Frontend React (MiniCRM.html)](#11-capa-6-frontend-react)
12. [Tabla de Endpoints de la API](#12-tabla-de-endpoints-de-la-api)
13. [Cómo Ejecutar el Proyecto](#13-cómo-ejecutar-el-proyecto)
14. [Conceptos Clave Explicados](#14-conceptos-clave-explicados)

---

## 1. ¿Qué es el MiniCRM?

Es una aplicación web de **gestión de clientes** (Customer Relationship Management) que permite:

- ✅ **Crear, editar y eliminar clientes** con sus datos de contacto
- ✅ **Buscar clientes** en vivo por cualquier campo (nombre, email, teléfono, etc.)
- ✅ **Agregar actividades** (compromisos) a cada cliente
- ✅ **Completar actividades** (marcarlas como finalizadas)
- ✅ **Eliminar actividades** pendientes
- ✅ **Diseño Maestro-Detalle**: lista de clientes a la izquierda, ficha del seleccionado a la derecha

---

## 2. Arquitectura del Proyecto

El proyecto sigue una **arquitectura en capas**, donde cada capa tiene una responsabilidad específica:

```
┌─────────────────────────────────────────────────────────────────┐
│                    🌐 NAVEGADOR (Frontend)                      │
│               public/MiniCRM.html (React + JSX)                 │
│                                                                 │
│  ┌───────────────┐  ┌──────────────┐  ┌──────────────────────┐  │
│  │ Panel Maestro │  │ Panel Detalle│  │   Modal (formulario) │  │
│  │ (lista cltes) │  │ (ficha+acts) │  │   Nuevo/Editar clie. │  │
│  └───────────────┘  └──────────────┘  └──────────────────────┘  │
│                          │                                      │
│             fetch() → llamarApi() → /api/clientes               │
└────────────────────────────┬────────────────────────────────────┘
                             │ HTTP (JSON)
                             ▼
┌─────────────────────────────────────────────────────────────────┐
│                    🖥️ SERVIDOR (Backend)                        │
│                       src/server.ts                              │
│                                                                 │
│  ┌─────────────────────────────────────────────────────────────┐ │
│  │  CAPA 4: RUTAS (routes/clientes.ts)                        │ │
│  │  Mapea URLs + verbos HTTP → funciones controladoras         │ │
│  │  GET /api/clientes → listarClientes()                       │ │
│  │  POST /api/clientes → crearCliente()                        │ │
│  │  ...                                                        │ │
│  └──────────────────────────┬──────────────────────────────────┘ │
│                              │                                   │
│  ┌──────────────────────────▼──────────────────────────────────┐ │
│  │  CAPA 3: CONTROLADORES (controllers/clientes.ts)           │ │
│  │  Reciben Request/Response de Express                        │ │
│  │  Validan datos de entrada                                   │ │
│  │  Llaman al servicio                                         │ │
│  │  Devuelven la respuesta HTTP                                │ │
│  └──────────────────────────┬──────────────────────────────────┘ │
│                              │                                   │
│  ┌──────────────────────────▼──────────────────────────────────┐ │
│  │  CAPA 2: SERVICIOS (services/clientes.ts)                  │ │
│  │  Lógica de negocio (reglas, consultas, transformaciones)    │ │
│  │  Clase Clientes con métodos estáticos                       │ │
│  │  Clientes.listar(), Clientes.crear(), etc.                  │ │
│  └──────────────────────────┬──────────────────────────────────┘ │
│                              │                                   │
│  ┌──────────────────────────▼──────────────────────────────────┐ │
│  │  CAPA 1: BASE DE DATOS (db/)                               │ │
│  │  config.ts → ruta del archivo SQLite                        │ │
│  │  schema.ts → estructura de tablas (Drizzle ORM)             │ │
│  │  index.ts  → conexión Singleton a SQLite                    │ │
│  └──────────────────────────┬──────────────────────────────────┘ │
│                              │                                   │
└──────────────────────────────┼───────────────────────────────────┘
                               ▼
                    ┌──────────────────┐
                    │  📦 minicrm.db   │
                    │     (SQLite)     │
                    └──────────────────┘
```

---

## 3. Estructura de Archivos

```
tp4/
├── 📄 package.json          ← Dependencias y scripts de npm
├── 📄 tsconfig.json          ← Configuración del compilador TypeScript
├── 📄 drizzle.config.ts      ← Config de Drizzle Kit (migraciones)
├── 📦 minicrm.db             ← Archivo de base de datos SQLite
│
├── 📁 public/
│   └── 📄 MiniCRM.html      ← FRONTEND: React + JSX + CSS (todo en 1 archivo)
│
└── 📁 src/                   ← BACKEND: código TypeScript del servidor
    ├── 📄 server.ts          ← Punto de entrada: crea Express y arranca el server
    │
    ├── 📁 db/                ← Capa de Base de Datos
    │   ├── 📄 config.ts      ← Ruta al archivo .db + config de Drizzle Kit
    │   ├── 📄 schema.ts      ← Definición de tablas (clientes, actividades)
    │   └── 📄 index.ts       ← Conexión singleton a SQLite con Drizzle
    │
    ├── 📁 services/          ← Capa de Lógica de Negocio
    │   └── 📄 clientes.ts    ← Clase Clientes con CRUD (listar, crear, buscar...)
    │
    ├── 📁 controllers/       ← Capa de Presentación HTTP
    │   └── 📄 clientes.ts    ← Funciones que manejan Request/Response
    │
    └── 📁 routes/            ← Capa de Enrutamiento
        └── 📄 clientes.ts    ← Define qué URL llama a qué controlador
```

### ¿Por qué esta separación?

| Capa | Responsabilidad | ¿Qué sabe? |
|------|----------------|-------------|
| **Routes** | Mapear URLs a funciones | Solo URLs y verbos HTTP |
| **Controllers** | Leer request, validar, responder | HTTP (req/res), no sabe de BD |
| **Services** | Reglas de negocio, queries | Drizzle/SQLite, no sabe de HTTP |
| **DB** | Conexión y esquema | Solo la estructura de datos |

> **Beneficio**: Si mañana cambiaras Express por otro framework, solo cambian controllers y routes. Si cambiaras SQLite por PostgreSQL, solo cambia db/. El servicio queda intacto.

---

## 4. Flujo Completo: Del Click al Dato

### Ejemplo: El usuario busca "García" en la barra de búsqueda

```
 FRONTEND (navegador)                         BACKEND (servidor)
 ═══════════════════                         ═══════════════════

 1. El usuario escribe "García"
    en el <input> de búsqueda
            │
            ▼
 2. onChange → setTerminoBusqueda("García")
    React actualiza el estado
            │
            ▼
 3. useEffect detecta que cambió
    terminoBusqueda → ejecuta
    cargarClientes()
            │
            ▼
 4. fetch("GET /api/clientes?q=García")  ──────►  5. Express recibe la request
                                                       │
                                                       ▼
                                                  6. Router: GET "/" →
                                                     listarClientes()
                                                       │
                                                       ▼
                                                  7. Controller lee req.query.q
                                                     → "García"
                                                     → llama Clientes.buscar("García")
                                                       │
                                                       ▼
                                                  8. Service ejecuta:
                                                     SELECT * FROM clientes
                                                     WHERE nombre LIKE '%García%'
                                                     OR email LIKE '%García%'
                                                     OR ...
                                                       │
                                                       ▼
                                                  9. Devuelve array de resultados
                                                       │
 10. fetch recibe JSON  ◄─────────────────────────  respuesta.json(resultado)

 11. setListaClientes(datos)
     → React re-renderiza la lista
     → Solo se muestran los clientes
       que matchean "García"
```

### Ejemplo: El usuario crea un nuevo cliente

```
 1. Click en "Agregar"
    → abrirNuevoCliente()
    → setModalActivo("nuevo")
    → Se muestra el modal con formulario vacío

 2. El usuario llena: nombre="Ana López", email="ana@mail.com"...
    → Cada onChange actualiza datosFormulario

 3. Click en "Crear"
    → guardarCliente()
    → fetch("POST /api/clientes", { body: datosFormulario })

 4. Backend:
    Router → POST "/" → crearCliente()
    Controller → valida que haya nombre → Clientes.crear(datos)
    Service → INSERT INTO clientes (...) VALUES (...) RETURNING *
    → Devuelve el cliente con su ID generado

 5. Frontend recibe el cliente creado:
    → setClienteSeleccionado(clienteCreado)  ← selecciona el nuevo
    → cargarClientes()  ← recarga la lista
    → setModalActivo(null)  ← cierra el modal
```

### Ejemplo: El usuario completa una actividad

```
 1. Click en el checkbox □ de una actividad pendiente
    → completarActividad(idActividad)

 2. fetch("PATCH /api/clientes/5/actividades/12/completar")

 3. Backend:
    Router → PATCH "/:id/actividades/:actId/completar"
    → completarActividad()
    Controller → Clientes.completarActividad(12)
    Service → UPDATE actividades SET completada_el = '2026-10-22'
              WHERE id = 12

 4. Frontend:
    → cargarActividades()  ← recarga la lista
    → La actividad pasa de "Compromisos" a "Completadas"
    → Se muestra con fondo verde y check ✓
    → Ya NO tiene botones de editar/eliminar (solo lectura)
```

---

## 5. Paso a Paso: Cómo se Construyó

### Paso 1: Inicializar el proyecto

```bash
mkdir tp4
cd tp4
npm init -y                    # Crea package.json
```

Se editó `package.json` con nombre "minicrm" y se agregaron los scripts.

### Paso 2: Instalar dependencias

```bash
# Dependencias de producción
npm install express            # Framework web HTTP
npm install better-sqlite3     # Motor de base de datos SQLite
npm install drizzle-orm        # ORM para hacer queries con TypeScript

# Dependencias de desarrollo
npm install -D typescript      # Compilador TypeScript
npm install -D tsx             # Ejecutar TypeScript directamente (sin compilar)
npm install -D drizzle-kit     # CLI para migraciones de base de datos
npm install -D @types/express  # Tipos de TypeScript para Express
npm install -D @types/better-sqlite3  # Tipos para better-sqlite3
npm install -D @types/node     # Tipos para Node.js
```

### Paso 3: Configurar TypeScript (`tsconfig.json`)

```json
{
  "compilerOptions": {
    "target": "ES2022",          // Versión de JS de salida
    "module": "commonjs",        // Sistema de módulos (require/exports)
    "outDir": "./dist",          // Donde va el JS compilado
    "rootDir": "./src",          // Donde está el código fuente
    "strict": true,              // Chequeos estrictos de tipos
    "esModuleInterop": true      // Compatibilidad import/require
  },
  "include": ["src/**/*"],       // Solo compila archivos en src/
  "exclude": ["node_modules"]    // Ignora node_modules
}
```

### Paso 4: Crear la base de datos (capa db/)

Se crearon 3 archivos en orden:

1. **`config.ts`** → define la ruta del archivo `.db` y la config de Drizzle Kit
2. **`schema.ts`** → define las tablas `clientes` y `actividades` con Drizzle
3. **`index.ts`** → crea la conexión y exporta la instancia `bd`

### Paso 5: Crear el servicio (capa services/)

Se creó `services/clientes.ts` con la clase `Clientes` y todos los métodos CRUD como métodos estáticos.

### Paso 6: Crear los controladores (capa controllers/)

Se creó `controllers/clientes.ts` con funciones que reciben `Request` y `Response`, leen datos del request, llaman al servicio y devuelven la respuesta HTTP.

### Paso 7: Crear las rutas (capa routes/)

Se creó `routes/clientes.ts` con un Router de Express que mapea cada URL+verbo a su controlador.

### Paso 8: Crear el servidor (server.ts)

Se creó `server.ts` que:
- Crea las tablas si no existen
- Configura Express (JSON, archivos estáticos)
- Monta las rutas en `/api/clientes`
- Arranca el servidor en puerto 3000

### Paso 9: Crear el frontend (public/MiniCRM.html)

Se creó un único archivo HTML que contiene:
- CSS embebido con variables CSS y diseño responsive
- React cargado desde CDN
- Babel para transformar JSX en el navegador
- Un componente `Aplicacion` que maneja todo el estado

### Paso 10: Ejecutar

```bash
npm run dev    # Arranca el servidor con hot-reload (tsx watch)
```

---

## 6. Capa 1: Base de Datos

### `db/config.ts` — Configuración

```
¿Qué hace?
→ Define DÓNDE se guarda la base de datos (archivo minicrm.db)
→ Configura Drizzle Kit para poder generar migraciones
```

| Exportación | Tipo | Uso |
|-------------|------|-----|
| `RUTA_BD` | `string` | Ruta absoluta al archivo `minicrm.db` |
| `configuracionDrizzle` | `Config` | Configuración para `drizzle-kit` CLI |

**Flujo de la ruta**: `path.join(__dirname, "..", "..", "minicrm.db")`
- `__dirname` = `src/db/`
- `..` = `src/`
- `..` = `tp4/` (raíz del proyecto)
- Resultado: `tp4/minicrm.db`

---

### `db/schema.ts` — Esquema de Tablas

```
¿Qué hace?
→ Define la ESTRUCTURA de las tablas usando TypeScript
→ Drizzle traduce esto a SQL automáticamente
```

#### Tabla `clientes`

| Columna | Tipo | Restricción | Descripción |
|---------|------|-------------|-------------|
| `id` | INTEGER | PRIMARY KEY AUTOINCREMENT | Identificador único, se genera solo |
| `nombre` | TEXT | NOT NULL | Nombre completo (obligatorio) |
| `email` | TEXT | NOT NULL DEFAULT '' | Correo electrónico |
| `telefono` | TEXT | NOT NULL DEFAULT '' | Número de teléfono |
| `direccion` | TEXT | NOT NULL DEFAULT '' | Dirección postal |
| `ciudad` | TEXT | NOT NULL DEFAULT '' | Ciudad de residencia |

#### Tabla `actividades`

| Columna | Tipo | Restricción | Descripción |
|---------|------|-------------|-------------|
| `id` | INTEGER | PRIMARY KEY AUTOINCREMENT | Identificador único |
| `cliente_id` | INTEGER | NOT NULL, FK → clientes(id) ON DELETE CASCADE | Cliente dueño |
| `descripcion` | TEXT | NOT NULL | Texto de la actividad |
| `fecha` | TEXT | nullable | Fecha programada (YYYY-MM-DD) |
| `completada_el` | TEXT | nullable | Fecha de completado (null = pendiente) |

> **ON DELETE CASCADE**: Si se borra un cliente, se borran automáticamente todas sus actividades.

#### Diagrama Entidad-Relación

```
┌──────────────────┐         ┌──────────────────────┐
│    CLIENTES       │         │    ACTIVIDADES        │
├──────────────────┤         ├──────────────────────┤
│ id (PK)          │◄────────│ cliente_id (FK)       │
│ nombre           │   1:N   │ id (PK)               │
│ email            │         │ descripcion           │
│ telefono         │         │ fecha                 │
│ direccion        │         │ completada_el         │
│ ciudad           │         └──────────────────────┘
└──────────────────┘
         Un cliente tiene MUCHAS actividades
```

---

### `db/index.ts` — Conexión (Singleton)

```
¿Qué hace?
→ Crea UNA ÚNICA conexión a SQLite (patrón Singleton)
→ Configura WAL y claves foráneas
→ Exporta la instancia "bd" que usan todos los demás módulos
```

**Pragmas importantes:**
| Pragma | Valor | Efecto |
|--------|-------|--------|
| `journal_mode` | `WAL` | Write-Ahead Logging: mejora rendimiento en escrituras concurrentes |
| `foreign_keys` | `ON` | Activa verificación de claves foráneas (necesario para CASCADE) |

---

## 7. Capa 2: Servicios

### `services/clientes.ts` — Lógica de Negocio

```
¿Qué hace?
→ Contiene TODA la lógica de negocio
→ Clase "Clientes" con métodos estáticos
→ Cada método ejecuta una consulta a la BD usando Drizzle ORM
```

#### Métodos de Clientes

| Método | Equivalente SQL | Descripción |
|--------|----------------|-------------|
| `Clientes.listar()` | `SELECT * FROM clientes` | Todos los clientes |
| `Clientes.obtener(id)` | `SELECT * FROM clientes WHERE id = ?` | Un cliente por ID |
| `Clientes.buscar(termino)` | `SELECT * FROM clientes WHERE nombre LIKE '%t%' OR email LIKE '%t%' OR ...` | Búsqueda flexible |
| `Clientes.crear(datos)` | `INSERT INTO clientes (...) VALUES (...) RETURNING *` | Nuevo cliente |
| `Clientes.actualizar(id, datos)` | `UPDATE clientes SET ... WHERE id = ? RETURNING *` | Editar cliente |
| `Clientes.eliminar(id)` | `DELETE FROM clientes WHERE id = ? RETURNING *` | Borrar cliente + sus actividades |

#### Métodos de Actividades

| Método | Equivalente SQL | Descripción |
|--------|----------------|-------------|
| `Clientes.listarActividades(idCliente)` | `SELECT * FROM actividades WHERE cliente_id = ?` | Actividades de un cliente |
| `Clientes.crearActividad(datos)` | `INSERT INTO actividades (...) VALUES (...) RETURNING *` | Nueva actividad |
| `Clientes.actualizarActividad(id, datos)` | `UPDATE actividades SET ... WHERE id = ? RETURNING *` | Editar actividad |
| `Clientes.completarActividad(id)` | `UPDATE actividades SET completada_el = 'HOY' WHERE id = ?` | Marcar como completada |
| `Clientes.eliminarActividad(id)` | `DELETE FROM actividades WHERE id = ? RETURNING *` | Borrar actividad |

#### Tipos de TypeScript usados

```typescript
// Omit<T, K> → Tipo T sin la propiedad K
Omit<DatosNuevoCliente, "id">
// = { nombre, email, telefono, direccion, ciudad }  (sin "id")
// → Porque el id se autogenera

// Partial<T> → Todas las propiedades de T se vuelven opcionales
Partial<Omit<DatosNuevoCliente, "id">>
// = { nombre?, email?, telefono?, direccion?, ciudad? }
// → Para actualizar, solo se envían los campos que cambian

// Pick<T, K> → Solo las propiedades K de T
Pick<DatosNuevaActividad, "descripcion" | "fecha">
// = { descripcion, fecha }
// → Al editar actividad, solo se puede cambiar descripción y fecha
```

---

## 8. Capa 3: Controladores

### `controllers/clientes.ts` — Presentación HTTP

```
¿Qué hace?
→ Recibe Request y Response de Express
→ Lee datos del request (params, query, body)
→ Valida datos de entrada
→ Llama al servicio (Clientes.xxx)
→ Devuelve la respuesta HTTP con el código correcto
→ NUNCA toca la base de datos directamente
```

#### Flujo de cada controlador

```
listarClientes:
  solicitud.query.q → ¿tiene "q"? → Sí: Clientes.buscar(q)
                                   → No: Clientes.listar()
  → respuesta.json(resultado)

obtenerCliente:
  solicitud.params.id → Number() → Clientes.obtener(id)
  → ¿null? → Sí: respuesta.status(404).json({error: "..."})
           → No: respuesta.json(cliente)

crearCliente:
  solicitud.body → { nombre, email, ... }
  → ¿nombre vacío? → Sí: respuesta.status(400).json({error: "..."})
                    → No: Clientes.crear(datos) → respuesta.status(201).json(cliente)

actualizarCliente:
  solicitud.params.id + solicitud.body → Clientes.actualizar(id, datos)
  → ¿null? → 404 : respuesta.json(cliente)

eliminarCliente:
  solicitud.params.id → Clientes.eliminar(id)
  → ¿null? → 404 : respuesta.json({ ok: true })
```

#### Códigos HTTP usados

| Código | Significado | Cuándo se usa |
|--------|------------|--------------|
| `200` | OK (por defecto) | Lectura exitosa, actualización exitosa |
| `201` | Created | Recurso creado (POST) |
| `400` | Bad Request | Datos inválidos (falta nombre o descripción) |
| `404` | Not Found | El cliente o actividad no existe |

---

## 9. Capa 4: Rutas

### `routes/clientes.ts` — Enrutamiento

```
¿Qué hace?
→ Crea un Router de Express (mini-app de rutas)
→ Mapea cada combinación URL + verbo HTTP a un controlador
→ Se monta bajo /api/clientes en server.ts
```

#### Tabla completa de rutas

```
RUTAS DE CLIENTES (montadas en /api/clientes):
──────────────────────────────────────────────────
Verbo     Ruta          →  Controlador            Descripción
────────  ────────────  →  ───────────────────    ──────────────────
GET       /             →  listarClientes         Listar/buscar todos
GET       /:id          →  obtenerCliente         Obtener uno por ID
POST      /             →  crearCliente           Crear nuevo
PUT       /:id          →  actualizarCliente      Actualizar existente
DELETE    /:id          →  eliminarCliente        Eliminar (+ CASCADE)

RUTAS DE ACTIVIDADES (anidadas bajo un cliente):
──────────────────────────────────────────────────
Verbo     Ruta                           →  Controlador
────────  ─────────────────────────────  →  ───────────────────
GET       /:id/actividades               →  listarActividades
POST      /:id/actividades               →  crearActividad
PUT       /:id/actividades/:actId        →  actualizarActividad
PATCH     /:id/actividades/:actId/completar → completarActividad
DELETE    /:id/actividades/:actId        →  eliminarActividad
```

> **`:id`** y **`:actId`** son parámetros dinámicos. Express los captura y los pone en `req.params.id` y `req.params.actId`.

---

## 10. Capa 5: Servidor

### `server.ts` — Punto de Entrada

```
¿Qué hace?
→ Paso 1: Crea las tablas si no existen (SQL puro)
→ Paso 2: Crea la app Express
→ Paso 3: Configura middlewares (JSON, archivos estáticos)
→ Paso 4: Monta las rutas de la API
→ Paso 5: Fallback SPA (sirve el HTML para cualquier ruta)
→ Paso 6: Arranca el servidor en el puerto 3000
```

#### Middlewares configurados

| Middleware | Función |
|------------|---------|
| `express.json()` | Parsea el body de requests POST/PUT como JSON → `req.body` |
| `express.static("public")` | Sirve archivos estáticos (HTML, CSS, imágenes) |

#### ¿Por qué crea tablas con SQL puro y no con Drizzle?

El `CREATE TABLE IF NOT EXISTS` es una manera rápida y segura de asegurar que las tablas existan al arrancar. Drizzle Kit también puede hacerlo (`drizzle-kit push`), pero el SQL directo es más explícito y no requiere un paso extra de CLI.

#### ¿Qué es el fallback SPA?

```typescript
aplicacion.get("*", (_solicitud, respuesta) => {
    respuesta.sendFile(path.join(__dirname, "..", "public", "MiniCRM.html"));
});
```

Si el navegador pide una ruta que no coincide con la API ni con archivos estáticos (ej: `/clientes/5`), Express sirve `MiniCRM.html`. Esto es necesario porque React maneja las "rutas" del lado del cliente (Single Page Application).

---

## 11. Capa 6: Frontend React

### `public/MiniCRM.html` — Interfaz de Usuario

Este archivo contiene **todo el frontend** en un solo archivo:

```
MiniCRM.html
├── <style>       → CSS: diseño visual completo
├── <div id="root"> → Punto de montaje de React
├── <script> CDN  → React 18 + ReactDOM + Babel
└── <script type="text/babel"> → Código React/JSX
```

### Estructura del CSS

```css
/* Variables CSS → Colores y valores reutilizables */
:root { --primario: #3b82f6; ... }

/* Layout principal → Flex columna: header + contenido */
.aplicacion { display: flex; flex-direction: column; height: 100vh; }

/* Panel Maestro → Izquierda, ancho fijo 360px */
.panel-maestro { width: 360px; }
  .lista-clientes { overflow-y: auto; }   /* ← Scroll interno */

/* Panel Detalle → Derecha, ocupa el resto */
.panel-detalle { flex: 1; overflow-y: auto; }

/* Modal → Overlay oscuro + ventana centrada */
.fondo-modal { position: fixed; inset: 0; background: rgba(0,0,0,.35); }
```

### Estado de React (useState)

La aplicación usa **8 variables de estado**:

| Variable | Tipo | Propósito |
|----------|------|-----------|
| `listaClientes` | `Array` | Todos los clientes cargados |
| `clienteSeleccionado` | `Object / null` | Cliente actualmente seleccionado |
| `listaActividades` | `Array` | Actividades del cliente seleccionado |
| `terminoBusqueda` | `string` | Texto del input de búsqueda |
| `modalActivo` | `"nuevo" / "editar" / null` | Controla si se muestra el modal |
| `datosFormulario` | `Object` | Datos del formulario de cliente |
| `formActividad` | `Object / null` | Datos del subformulario de actividad |
| `idActividadEditando` | `number / null` | ID de la actividad en edición |

### Efectos (useEffect + useCallback)

```
terminoBusqueda cambia
   → useCallback recrea cargarClientes()
      → useEffect detecta el cambio y ejecuta cargarClientes()
         → fetch GET /api/clientes?q=xxx
            → setListaClientes(resultado)
               → React re-renderiza la lista

clienteSeleccionado cambia
   → useCallback recrea cargarActividades()
      → useEffect detecta el cambio y ejecuta cargarActividades()
         → fetch GET /api/clientes/:id/actividades
            → setListaActividades(resultado)
               → React re-renderiza actividades
```

### Componentes visuales del HTML

```
┌─────────────────────────────────────────────────────────┐
│  🔵 MiniCRM                               (encabezado)  │
├──────────────────┬──────────────────────────────────────┤
│  Clientes [+]    │  Juan Pérez                    #1    │
│  ─────────────── │  ✏️ Editar  🗑️ Eliminar             │
│  🔍 Buscar...    │                                      │
│  ─────────────── │  📧 juan@mail.com                    │
│                  │  📍 Córdoba, Argentina               │
│  🔵 JG J. García│  📞 +54 351 1234567                  │
│  🟣 AP A. Pérez │                                      │
│  🟠 MC M. Castro│  ┌─────────────────────────────────┐  │
│                  │  │ 📝 Agregar actividad     [+]   │  │
│  (scroll ↕)     │  └─────────────────────────────────┘  │
│                  │                                      │
│                  │  📋 Compromisos                      │
│                  │  ┌─ □ Llamar al cliente (16 oct) ─┐  │
│                  │  │    ✏️  🗑️                      │  │
│                  │  └────────────────────────────────┘  │
│                  │                                      │
│                  │  ✅ Actividades completadas           │
│                  │  ┌─ ✓ Enviar presupuesto ──────────┐│
│                  │  │   Completada el 15 oct 2026     ││
│                  │  └─────────────────────────────────┘│
└──────────────────┴──────────────────────────────────────┘
```

### Funciones auxiliares del frontend

| Función | Qué hace |
|---------|----------|
| `llamarApi(ruta, opciones)` | Centraliza todas las llamadas `fetch()` al backend |
| `colorAvatar(nombre)` | Calcula un color determinístico para el avatar basado en el nombre |
| `obtenerIniciales(nombre)` | "Juan García" → "JG" |
| `formatearFecha(fechaISO)` | "2026-10-16" → "16 oct 2026" |
| `estaVencida(fechaISO)` | Retorna `true` si la fecha ya pasó |

---

## 12. Tabla de Endpoints de la API

| # | Método | Endpoint | Body (JSON) | Respuesta | Código |
|---|--------|----------|-------------|-----------|--------|
| 1 | `GET` | `/api/clientes` | — | `[{id, nombre, ...}]` | 200 |
| 2 | `GET` | `/api/clientes?q=texto` | — | `[{id, nombre, ...}]` (filtrado) | 200 |
| 3 | `GET` | `/api/clientes/:id` | — | `{id, nombre, ...}` | 200/404 |
| 4 | `POST` | `/api/clientes` | `{nombre, email?, ...}` | `{id, nombre, ...}` | 201/400 |
| 5 | `PUT` | `/api/clientes/:id` | `{nombre?, email?, ...}` | `{id, nombre, ...}` | 200/404 |
| 6 | `DELETE` | `/api/clientes/:id` | — | `{ok: true}` | 200/404 |
| 7 | `GET` | `/api/clientes/:id/actividades` | — | `[{id, descripcion, ...}]` | 200 |
| 8 | `POST` | `/api/clientes/:id/actividades` | `{descripcion, fecha?}` | `{id, descripcion, ...}` | 201/400 |
| 9 | `PUT` | `/api/clientes/:id/actividades/:actId` | `{descripcion?, fecha?}` | `{id, descripcion, ...}` | 200/404 |
| 10 | `PATCH` | `/api/clientes/:id/actividades/:actId/completar` | — | `{id, ..., completadaEl}` | 200/404 |
| 11 | `DELETE` | `/api/clientes/:id/actividades/:actId` | — | `{ok: true}` | 200/404 |

---

## 13. Cómo Ejecutar el Proyecto

### Requisitos previos
- **Node.js** v18 o superior
- **npm** (viene con Node.js)

### Pasos

```bash
# 1. Ir a la carpeta del proyecto
cd tp4

# 2. Instalar dependencias
npm install

# 3. Arrancar el servidor en modo desarrollo (con hot-reload)
npm run dev

# 4. Abrir en el navegador
# → http://localhost:3000
```

### Scripts disponibles

| Script | Comando | Qué hace |
|--------|---------|----------|
| `dev` | `npm run dev` | Arranca con `tsx watch` (hot-reload, recarga al guardar) |
| `build` | `npm run build` | Compila TypeScript a JavaScript en `dist/` |
| `start` | `npm start` | Ejecuta el JS compilado (`node dist/server.js`) |
| `db:generate` | `npm run db:generate` | Genera archivos de migración con Drizzle Kit |
| `db:push` | `npm run db:push` | Aplica el esquema directamente a la BD |

---

## 14. Conceptos Clave Explicados

### ¿Qué es un ORM?

**ORM** = Object-Relational Mapping. En vez de escribir SQL puro:
```sql
SELECT * FROM clientes WHERE id = 5
```
Escribimos TypeScript con autocompletado y verificación de tipos:
```typescript
bd.select().from(clientes).where(eq(clientes.id, 5)).get()
```

Drizzle traduce eso a SQL automáticamente.

### ¿Qué es el patrón Singleton?

Significa que solo existe **una única instancia** de algo en toda la aplicación. En nuestro caso, solo hay **una conexión** a la base de datos (`bd`), y todos los módulos la importan y comparten.

### ¿Qué es REST?

**REST** = Representational State Transfer. Es una convención para diseñar APIs web:

| Acción | Verbo HTTP | URL |
|--------|-----------|-----|
| Listar | GET | /api/clientes |
| Obtener | GET | /api/clientes/5 |
| Crear | POST | /api/clientes |
| Actualizar | PUT | /api/clientes/5 |
| Actualizar parcial | PATCH | /api/clientes/5/... |
| Eliminar | DELETE | /api/clientes/5 |

### ¿Qué es JSX?

**JSX** es una extensión de JavaScript que parece HTML. Babel lo transforma a `React.createElement()`:

```jsx
// Esto (JSX):
<div className="app"><h1>Hola</h1></div>

// Se transforma a esto (JavaScript):
React.createElement("div", {className: "app"},
  React.createElement("h1", null, "Hola")
)
```

### ¿Qué es el patrón Maestro-Detalle?

Es un patrón de interfaz donde:
- **Maestro** (izquierda): lista resumida de items (clientes)
- **Detalle** (derecha): vista completa del item seleccionado (ficha + actividades)

Al seleccionar un item del maestro, el detalle se actualiza mostrando toda la información.

### ¿Por qué variables en español?

Es una decisión deliberada del código. Todas las variables (`listarClientes`, `enrutador`, `solicitud`, `respuesta`, etc.) están en español para facilitar la comprensión. En un proyecto profesional suelen estar en inglés, pero para fines didácticos se usan en español.

---

> 📝 **Nota final**: Este proyecto demuestra la separación de responsabilidades en una aplicación web moderna. Cada capa tiene un propósito claro y no conoce los detalles de implementación de las otras capas. Esto hace que el código sea más fácil de mantener, testear y escalar.
