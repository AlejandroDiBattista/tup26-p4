# Orden de Comprensión — MiniCRM

> Guía paso a paso para entender cómo se desarrolló el MiniCRM,
> la lógica detrás de cada decisión y los conceptos involucrados.

---

## 📋 Índice

1. [Visión general de la arquitectura](#1-visión-general-de-la-arquitectura)
2. [Paso 1: Configuración del proyecto](#2-paso-1-configuración-del-proyecto)
3. [Paso 2: Esquema de la base de datos (Drizzle + SQLite)](#3-paso-2-esquema-de-la-base-de-datos)
4. [Paso 3: Conexión a la base de datos](#4-paso-3-conexión-a-la-base-de-datos)
5. [Paso 4: Servicio (capa de negocio)](#5-paso-4-servicio-capa-de-negocio)
6. [Paso 5: Controladores (capa HTTP)](#6-paso-5-controladores-capa-http)
7. [Paso 6: Rutas (Router)](#7-paso-6-rutas-router)
8. [Paso 7: Servidor Express](#8-paso-7-servidor-express)
9. [Paso 8: Frontend React](#9-paso-8-frontend-react)
10. [Glosario de conceptos](#10-glosario-de-conceptos)
11. [Cómo pedirle a la IA que haga esto](#11-cómo-pedirle-a-la-ia-que-haga-esto)

---

## 1. Visión general de la arquitectura

```
┌─────────────────────────────────────────────────────────┐
│                    NAVEGADOR (Chrome)                    │
│  ┌───────────────────────────────────────────────────┐  │
│  │       public/MiniCRM.html                         │  │
│  │       React + JSX embebido + CSS                  │  │
│  │                                                   │  │
│  │   Hace llamadas fetch() a la API REST ──────┐     │  │
│  └──────────────────────────────────────────────┼────┘  │
└─────────────────────────────────────────────────┼───────┘
                                                  │ HTTP
┌─────────────────────────────────────────────────┼───────┐
│                 SERVIDOR (Node.js)              │       │
│                                                 ▼       │
│  ┌─────────────┐   ┌──────────────┐   ┌─────────────┐  │
│  │   Routes    │──▶│ Controllers  │──▶│  Services   │  │
│  │  (rutas)    │   │(controladores│   │ (negocio)   │  │
│  └─────────────┘   └──────────────┘   └──────┬──────┘  │
│                                              │         │
│                                    ┌─────────▼───────┐  │
│                                    │   Drizzle ORM   │  │
│                                    │   (consultas)   │  │
│                                    └─────────┬───────┘  │
│                                              │         │
│                                    ┌─────────▼───────┐  │
│                                    │     SQLite      │  │
│                                    │  (minicrm.db)   │  │
│                                    └─────────────────┘  │
└─────────────────────────────────────────────────────────┘
```

**¿Por qué esta arquitectura?**

Se llama **arquitectura en capas** (layered architecture). Cada capa tiene una responsabilidad clara:

| Capa | Archivo | Responsabilidad |
|------|---------|-----------------|
| **Rutas** | `routes/clientes.ts` | Mapear URLs a funciones |
| **Controladores** | `controllers/clientes.ts` | Leer HTTP, validar, responder |
| **Servicios** | `services/clientes.ts` | Lógica de negocio + consultas BD |
| **Base de datos** | `db/schema.ts + index.ts` | Definir y conectar a SQLite |

La ventaja: si mañana queremos cambiar SQLite por PostgreSQL, solo modificamos la capa de BD. Los controladores y las rutas no se tocan.

---

## 2. Paso 1: Configuración del proyecto

### Archivos creados: `package.json` y `tsconfig.json`

**¿Qué es `package.json`?**
Es el "DNI" del proyecto Node.js. Contiene:
- **Nombre y versión** del proyecto
- **scripts**: comandos que podemos correr con `npm run <nombre>`
- **dependencies**: librerías que la app necesita para funcionar
- **devDependencies**: librerías que solo se necesitan para desarrollar

```
Dependencias principales:
├── express          → Framework web para crear el servidor HTTP
├── better-sqlite3   → Driver nativo para SQLite
└── drizzle-orm      → ORM para escribir consultas en TypeScript

Dependencias de desarrollo:
├── typescript       → Compilador de TypeScript
├── tsx              → Ejecuta TypeScript directamente (sin compilar)
├── drizzle-kit      → Herramienta CLI para migraciones de BD
└── @types/*         → Tipos de TypeScript para las librerías
```

**¿Qué es `tsconfig.json`?**
Configuración del compilador TypeScript. Le dice:
- `target: ES2022` → Qué versión de JavaScript generar
- `module: commonjs` → Formato de módulos (require/exports)
- `strict: true` → Activar verificación estricta de tipos
- `outDir: ./dist` → Dónde poner el JavaScript compilado

### Concepto clave: TypeScript
TypeScript es JavaScript con **tipos**. En vez de:
```javascript
function sumar(a, b) { return a + b; }  // ¿son números? ¿strings?
```
Escribimos:
```typescript
function sumar(a: number, b: number): number { return a + b; }
```
El compilador nos avisa si pasamos un tipo incorrecto. Esto previene errores.

---

## 3. Paso 2: Esquema de la base de datos

### Archivo: `src/db/schema.ts`

**¿Qué es un ORM (Object-Relational Mapping)?**
Un ORM traduce entre el mundo de los objetos (TypeScript) y el mundo relacional (SQL). En vez de escribir SQL puro:
```sql
CREATE TABLE clientes (id INTEGER PRIMARY KEY, nombre TEXT NOT NULL);
```
Escribimos en TypeScript:
```typescript
export const clientes = sqliteTable("clientes", {
    id:     integer("id").primaryKey({ autoIncrement: true }),
    nombre: text("nombre").notNull(),
});
```

**¿Por qué Drizzle y no SQL puro?**
1. **Tipado**: TypeScript sabe qué columnas tiene cada tabla
2. **Autocompletado**: El IDE sugiere `clientes.nombre`, `clientes.email`, etc.
3. **Seguridad**: Previene inyección SQL automáticamente
4. **Portabilidad**: El mismo código funciona con SQLite, PostgreSQL, MySQL

**Relación entre tablas:**
```
┌─────────────┐       ┌──────────────────┐
│  clientes   │       │   actividades    │
├─────────────┤       ├──────────────────┤
│ id (PK)     │◄──────│ cliente_id (FK)  │
│ nombre      │  1:N  │ id (PK)          │
│ email       │       │ descripcion      │
│ telefono    │       │ fecha            │
│ direccion   │       │ completada_el    │
│ ciudad      │       └──────────────────┘
└─────────────┘
```

- **PK (Primary Key)**: Identificador único de cada fila
- **FK (Foreign Key)**: Referencia a otra tabla. `cliente_id` apunta al `id` de clientes
- **1:N**: Un cliente tiene muchas actividades, pero cada actividad pertenece a un solo cliente
- **ON DELETE CASCADE**: Si borramos un cliente, se borran TODAS sus actividades automáticamente

---

## 4. Paso 3: Conexión a la base de datos

### Archivos: `src/db/config.ts` y `src/db/index.ts`

**Patrón Singleton:**
Creamos UNA sola conexión a la BD y la reutilizamos en toda la app:
```typescript
const sqlite = new Database(RUTA_BD);   // Crear conexión
export const bd = drizzle(sqlite);       // Envolver con Drizzle
```
Si cada archivo creara su propia conexión, tendríamos problemas de rendimiento y bloqueos.

**Pragmas de SQLite:**
- `journal_mode = WAL`: Write-Ahead Logging. Permite lecturas y escrituras simultáneas. Sin esto, SQLite bloquea toda la BD durante una escritura.
- `foreign_keys = ON`: Activa la verificación de claves foráneas. Sin esto, SQLite permite insertar actividades con un `cliente_id` que no existe.

---

## 5. Paso 4: Servicio (capa de negocio)

### Archivo: `src/services/clientes.ts`

**¿Qué es un Servicio?**
Es un módulo que concentra TODA la lógica de negocio. Las reglas como "una actividad completada no se puede borrar" viven aquí, no en los controladores ni en la BD.

**¿Por qué métodos estáticos?**
```typescript
// CON métodos estáticos (lo que usamos):
Clientes.listar();

// SIN métodos estáticos (habría que crear instancia):
const servicio = new Clientes();
servicio.listar();
```
Usamos estáticos porque el servicio no tiene estado propio (no guarda datos internos). Es simplemente un contenedor de funciones relacionadas.

**CRUD — Las 4 operaciones básicas:**

| Operación | Método | SQL equivalente |
|-----------|--------|-----------------|
| **C**reate | `Clientes.crear(datos)` | `INSERT INTO clientes VALUES (...)` |
| **R**ead | `Clientes.listar()` / `obtener(id)` | `SELECT * FROM clientes` |
| **U**pdate | `Clientes.actualizar(id, datos)` | `UPDATE clientes SET ... WHERE id = ?` |
| **D**elete | `Clientes.eliminar(id)` | `DELETE FROM clientes WHERE id = ?` |

**Búsqueda flexible con LIKE:**
```sql
SELECT * FROM clientes
WHERE nombre LIKE '%ana%'
   OR email LIKE '%ana%'
   OR telefono LIKE '%ana%'
   OR direccion LIKE '%ana%'
   OR ciudad LIKE '%ana%'
```
El `%` es un comodín que significa "cualquier cosa antes o después".
Así, buscar "ana" encuentra "Ana García", "diana@mail.com", etc.

**Tipos de TypeScript usados:**
- `Omit<Tipo, "campo">`: Crea un nuevo tipo quitando un campo. Ejemplo: `Omit<Cliente, "id">` es un Cliente sin id (porque el id se autogenera).
- `Partial<Tipo>`: Hace que todos los campos sean opcionales. Útil para updates donde solo enviamos los campos que cambiaron.
- `Pick<Tipo, "a" | "b">`: Crea un tipo con solo los campos seleccionados.

---

## 6. Paso 5: Controladores (capa HTTP)

### Archivo: `src/controllers/clientes.ts`

**¿Qué hace un controlador?**
Es el intermediario entre HTTP y el servicio. Su trabajo:
1. **Recibir** la solicitud HTTP (Request)
2. **Extraer** datos del request (params, query, body)
3. **Validar** datos básicos de entrada
4. **Llamar** al servicio con esos datos
5. **Responder** con el resultado y el código HTTP adecuado

**Códigos HTTP usados:**

| Código | Significado | Cuándo se usa |
|--------|-------------|---------------|
| `200` | OK | Lectura o actualización exitosa |
| `201` | Created | Se creó un recurso nuevo (POST) |
| `400` | Bad Request | Datos de entrada inválidos |
| `404` | Not Found | El recurso no existe |

**¿Por qué separar controladores del servicio?**
Si el servicio hiciera `res.json(...)`, estaría acoplado a Express.
Al separar, podemos reusar el servicio desde:
- Un test automatizado
- Una tarea programada (cron)
- Otra interfaz (CLI, WebSocket, etc.)

---

## 7. Paso 6: Rutas (Router)

### Archivo: `src/routes/clientes.ts`

**¿Qué es un Router?**
Un Router mapea pares (verbo HTTP + URL) a funciones controladoras.
Es como una "tabla de direcciones":

```
GET    /                        → listarClientes
GET    /:id                     → obtenerCliente
POST   /                        → crearCliente
PUT    /:id                     → actualizarCliente
DELETE /:id                     → eliminarCliente
GET    /:id/actividades         → listarActividades
POST   /:id/actividades         → crearActividad
PUT    /:id/actividades/:actId  → actualizarActividad
PATCH  /:id/actividades/:actId/completar → completarActividad
DELETE /:id/actividades/:actId  → eliminarActividad
```

**Verbos HTTP y cuándo usar cada uno:**

| Verbo | Acción | Ejemplo |
|-------|--------|---------|
| `GET` | Leer datos | Obtener lista de clientes |
| `POST` | Crear nuevo | Crear un cliente nuevo |
| `PUT` | Reemplazar/actualizar completo | Editar todos los datos de un cliente |
| `PATCH` | Actualizar parcial | Solo marcar como completada |
| `DELETE` | Eliminar | Borrar un cliente |

**Parámetros dinámicos (`:id` y `:actId`):**
El `:` indica un segmento variable en la URL. Express lo captura:
- URL: `/api/clientes/5/actividades/12`
- `req.params.id` → `"5"`
- `req.params.actId` → `"12"`

**Rutas anidadas:**
Las actividades están anidadas bajo clientes porque PERTENECEN a un cliente.
Esto refleja la relación 1:N en la URL.

---

## 8. Paso 7: Servidor Express

### Archivo: `src/server.ts`

Este es el **punto de entrada**: el primer archivo que se ejecuta.

**¿Qué hace paso a paso?**

```
1. Crear tablas (CREATE TABLE IF NOT EXISTS)
   ↓
2. Crear la app Express
   ↓
3. Configurar middlewares:
   ├── express.json()     → Parsear JSON del body
   └── express.static()   → Servir archivos estáticos
   ↓
4. Montar el router en /api/clientes
   ↓
5. Configurar fallback SPA
   ↓
6. Escuchar en puerto 3000
```

**¿Qué es un Middleware?**
Es una función que se ejecuta ANTES de que la solicitud llegue a la ruta final.
Son como filtros en cadena:

```
Solicitud HTTP
    ↓
express.json()     → "Si el body es JSON, parsealo"
    ↓
express.static()   → "Si piden un archivo estático, servilo"
    ↓
Router             → "Buscá la ruta que coincida"
    ↓
Controlador        → "Procesá la solicitud"
    ↓
Respuesta HTTP
```

**¿Qué es el fallback SPA?**
```typescript
aplicacion.get("*", (_solicitud, respuesta) => {
    respuesta.sendFile("public/MiniCRM.html");
});
```
Si el usuario navega a una URL que no es de la API (ej: `/algo`), le devolvemos el HTML principal. React se encarga de manejar la navegación internamente.

---

## 9. Paso 8: Frontend React

### Archivo: `public/MiniCRM.html`

**¿Por qué todo en un solo archivo?**
El enunciado pide "React con JSX embebido". Esto significa:
- React y ReactDOM se cargan desde CDN (no hay `npm` en el frontend)
- Babel transforma el JSX a JavaScript directamente en el navegador
- Todo el CSS está en un `<style>` dentro del HTML
- Todo el JavaScript está en un `<script type="text/babel">`

**Concepto: JSX**
JSX parece HTML pero es JavaScript. Babel lo transforma:
```jsx
// Esto (JSX):
<div className="boton">Hola</div>

// Se convierte en esto (JavaScript):
React.createElement("div", { className: "boton" }, "Hola")
```

**Concepto: Hooks (useState, useEffect, useCallback)**

| Hook | ¿Qué hace? | Ejemplo |
|------|-------------|---------|
| `useState` | Crea una variable reactiva. Cuando cambia, React re-renderiza | `const [nombre, setNombre] = useState("")` |
| `useEffect` | Ejecuta código cuando algo cambia (efecto secundario) | `useEffect(() => { cargar() }, [dependencia])` |
| `useCallback` | Memoriza una función para evitar recrearla en cada render | `const fn = useCallback(() => {...}, [deps])` |

**Flujo de datos en la interfaz:**
```
1. El usuario escribe en el buscador
   ↓
2. onChange actualiza el estado "terminoBusqueda"
   ↓
3. React re-renderiza el componente
   ↓
4. useEffect detecta que cambió terminoBusqueda
   ↓
5. Llama a cargarClientes() → fetch GET /api/clientes?q=texto
   ↓
6. La API responde con los clientes filtrados
   ↓
7. setListaClientes actualiza el estado
   ↓
8. React re-renderiza la lista con los nuevos datos
```

**Layout Maestro-Detalle:**
```
┌──────────────────────────────────────────────────┐
│ Encabezado (MiniCRM)                             │
├──────────────┬───────────────────────────────────┤
│              │                                   │
│   MAESTRO    │          DETALLE                  │
│              │                                   │
│ ┌──────────┐ │  ┌─────────────────────────────┐  │
│ │ Búsqueda │ │  │ Ficha del cliente           │  │
│ └──────────┘ │  │ (nombre, email, tel, dir)   │  │
│              │  └─────────────────────────────┘  │
│ ┌──────────┐ │                                   │
│ │ Lista de │ │  ┌─────────────────────────────┐  │
│ │ clientes │ │  │ Subformulario de actividad  │  │
│ │ (scroll) │ │  ├─────────────────────────────┤  │
│ │          │ │  │ Compromisos (pendientes)    │  │
│ │          │ │  │ (scroll interno)            │  │
│ │          │ │  ├─────────────────────────────┤  │
│ │          │ │  │ Actividades completadas     │  │
│ │          │ │  │ (solo lectura, sin botones) │  │
│ └──────────┘ │  └─────────────────────────────┘  │
└──────────────┴───────────────────────────────────┘
```

**¿Cómo se logra "sin desplazamiento de página"?**
- `height: 100vh` en `.aplicacion` → ocupa exactamente la ventana
- `overflow: hidden` en `html, body` → sin scroll global
- `overflow-y: auto` en `.lista-clientes` y `.lista-actividades` → scroll INTERNO

---

## 10. Glosario de conceptos

### Base de datos y ORM
| Concepto | Explicación |
|----------|-------------|
| **SQLite** | Base de datos embebida en un archivo (.db). No necesita servidor separado. |
| **ORM** | Traduce entre objetos de TypeScript y tablas SQL. |
| **Drizzle** | ORM moderno para TypeScript, ligero y tipado. |
| **Esquema** | Definición de la estructura de las tablas (columnas, tipos, relaciones). |
| **Migración** | Script que modifica la estructura de la BD de forma controlada. |
| **FK (Foreign Key)** | Columna que referencia el ID de otra tabla. |
| **CASCADE** | Regla que propaga eliminaciones: borrar padre = borrar hijos. |
| **WAL** | Write-Ahead Logging: mejora el rendimiento de SQLite. |

### API REST y Express
| Concepto | Explicación |
|----------|-------------|
| **API REST** | Interfaz que usa HTTP (GET/POST/PUT/DELETE) para operar sobre recursos. |
| **Express** | Framework minimalista de Node.js para crear servidores HTTP. |
| **Router** | Objeto que agrupa rutas relacionadas. |
| **Controlador** | Función que maneja una solicitud HTTP específica. |
| **Middleware** | Función que se ejecuta entre la solicitud y la respuesta. |
| **Body** | Datos enviados en el cuerpo de una solicitud POST/PUT. |
| **Params** | Valores dinámicos en la URL (`:id`). |
| **Query** | Parámetros en la URL después del `?` (`?q=texto`). |

### Frontend React
| Concepto | Explicación |
|----------|-------------|
| **React** | Librería para construir interfaces de usuario con componentes. |
| **JSX** | Sintaxis que mezcla HTML con JavaScript. Babel la transforma. |
| **Componente** | Función que retorna JSX. Es un bloque reutilizable de UI. |
| **Estado (State)** | Datos que, al cambiar, hacen que React re-renderice. |
| **Hook** | Función especial de React (empieza con `use`) para usar estado y efectos. |
| **Renderizado** | Proceso de convertir los componentes React en HTML real. |
| **CDN** | Servidor externo que distribuye librerías (unpkg.com). |
| **SPA** | Single Page Application: una sola página HTML que se actualiza dinámicamente. |
| **Maestro-Detalle** | Layout con lista a la izquierda y ficha de detalle a la derecha. |

### TypeScript
| Concepto | Explicación |
|----------|-------------|
| **TypeScript** | JavaScript con tipos. Detecta errores antes de ejecutar. |
| **Tipo** | Describe la forma de un dato: `string`, `number`, `{ nombre: string }`. |
| **Omit<T, K>** | Tipo que quita campos. `Omit<Cliente, "id">` = Cliente sin id. |
| **Partial<T>** | Tipo con todos los campos opcionales. |
| **Pick<T, K>** | Tipo con solo los campos elegidos. |
| **Interface** | Define la forma de un objeto (similar a type). |

---

## 11. Cómo pedirle a la IA que haga esto

### Estructura del prompt ideal

Para pedirle a una IA que desarrolle un proyecto como este, usá esta estructura:

```
1. OBJETIVO CLARO
   "Desarrollar un mini CRM con [tecnologías específicas]"

2. STACK TECNOLÓGICO EXACTO
   "Usar Node.js, TypeScript, Drizzle ORM, SQLite, Express, React desde CDN"

3. ARQUITECTURA
   "Separar en capas: servicio con clase estática, controladores, routers"

4. MODELO DE DATOS
   "Dos entidades: clientes (nombre, email, tel, dir, ciudad)
    y actividades (descripción, fecha, completada_el)"

5. FUNCIONALIDAD
   "CRUD de clientes, CRUD de actividades, búsqueda flexible,
    completar actividades, eliminar clientes"

6. REGLAS DE NEGOCIO
   "Las actividades completadas no se pueden editar ni borrar"

7. INTERFAZ
   "Maestro-detalle, sin scroll de página, búsqueda en vivo,
    subformulario de actividades dentro del detalle"

8. ARCHIVO ESPECÍFICO
   "Toda la interfaz en public/MiniCRM.html con React embebido"
```

### Ejemplo de prompt que genera este proyecto:

> "Desarrollar un MiniCRM con Node.js, TypeScript, Drizzle y SQLite.
> Implementar una clase Clientes con métodos estáticos para CRUD
> incluyendo búsqueda flexible por cualquier campo.
> Exponer mediante API REST con Express separando controladores y routers.
> Interfaz web en public/MiniCRM.html con React JSX embebido y CSS,
> cargando las bibliotecas desde CDN con versiones fijas.
> Layout maestro-detalle sin scroll de página.
> Agregar clientes y actividades, completar actividades, eliminar clientes.
> Las actividades completadas no se pueden editar ni borrar.
> El formulario de cliente se edita en el detalle.
> Las actividades se gestionan en un subformulario dentro del detalle."

### Consejos para prompts efectivos:

1. **Sé específico con las tecnologías**: "Drizzle ORM" es mejor que "un ORM"
2. **Menciona la arquitectura**: "separar controladores y routers" evita que todo quede en un archivo
3. **Define las reglas de negocio**: "completadas no se pueden editar" evita ambigüedades
4. **Describe el layout**: "maestro-detalle sin scroll de página" da una instrucción visual clara
5. **Nombra archivos**: "en public/MiniCRM.html" evita que cree otra estructura

---

## 📂 Orden de desarrollo (cómo se construyó)

```
 1. package.json + tsconfig.json    → Configurar el proyecto
 2. src/db/schema.ts                → Definir las tablas
 3. src/db/config.ts                → Configurar ruta de la BD
 4. src/db/index.ts                 → Crear conexión a SQLite
 5. src/services/clientes.ts        → Implementar lógica de negocio
 6. src/controllers/clientes.ts     → Crear manejadores HTTP
 7. src/routes/clientes.ts          → Mapear URLs a controladores
 8. src/server.ts                   → Armar y levantar el servidor
 9. public/MiniCRM.html             → Construir la interfaz React
10. npm install + npm run dev       → Instalar y ejecutar
```

**¿Por qué este orden?**
Se construye de **abajo hacia arriba** (bottom-up):
1. Primero la base (BD) porque todo depende de los datos
2. Después el servicio que opera sobre esos datos
3. Luego los controladores que exponen el servicio por HTTP
4. Las rutas que conectan URLs con controladores
5. El servidor que lo une todo
6. Finalmente la interfaz que consume la API

Cada capa depende solo de la anterior, nunca al revés.
