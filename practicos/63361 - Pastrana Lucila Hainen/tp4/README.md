# MiniCRM

Mini CRM para gestionar clientes y sus actividades. Está hecho con Node.js, TypeScript, Express, Drizzle ORM y SQLite
(Turso en producción), con una interfaz web en React ubicada en `public/MiniCRM.html`.

## Guía de ejecución paso a paso

Requisitos: Node.js 20.11 o superior (se desarrolló con Node 24) y npm. Todos los comandos se ejecutan desde esta carpeta.

### 1. Instalar dependencias

```bash
npm install
```

### 2. Configurar la base de datos (opcional)

Sin configuración se usa el archivo SQLite local `minicrm.db`, que se crea solo.

Para usar Turso en producción, copiar `.env.example` a `.env` y completar `TURSO_DATABASE_URL` y `TURSO_AUTH_TOKEN`.

### 3. Crear las tablas (migraciones)

Hay dos formas. Sobre una misma base hay que usar siempre la misma.

- Migraciones versionadas, recomendadas para producción. Aplican los archivos SQL de la carpeta `drizzle/`:

  ```bash
  npm run db:migrate
  ```

  Si se modifica `src/db/schema.ts`, primero se genera la nueva migración con `npm run db:generate` y después se aplica con
  `npm run db:migrate`.

- Sincronización directa, práctica para desarrollo. Crea o ajusta las tablas según `schema.ts`, sin archivos de migración:

  ```bash
  npm run db:push
  ```

### 4. Cargar los datos de ejemplo (seed)

```bash
npm run db:seed
```

Carga 10 clientes ficticios con actividades pendientes (con y sin fecha, algunas vencidas) y completadas. Las fechas se
calculan a partir del día actual. Se puede ejecutar varias veces sin duplicar datos, porque reconoce a cada cliente por su email.

Atajo para desarrollo: `npm run db:setup` hace `db:push` y `db:seed` juntos. Para empezar de cero en local, borrar `minicrm.db`
y volver a ejecutar `npm run db:setup`.

### 5. Arrancar el servidor

En desarrollo (se reinicia solo al guardar cambios):

```bash
npm run dev
```

En producción (sin reinicio automático; el puerto se cambia con la variable `PORT` y la base con las variables de Turso):

```bash
npm start
```

Con el servidor en marcha:

- Interfaz web: http://localhost:3000/MiniCRM.html
- API REST: http://localhost:3000/api/clientes

### Scripts disponibles

- `npm run dev`: servidor en modo desarrollo.
- `npm start`: servidor en modo producción.
- `npm run db:generate`: genera una migración SQL a partir de `schema.ts`.
- `npm run db:migrate`: aplica las migraciones de `drizzle/`.
- `npm run db:push`: sincroniza las tablas sin migraciones.
- `npm run db:seed`: carga los datos de ejemplo.
- `npm run db:setup`: `db:push` y `db:seed` juntos.
- `npm run db:studio`: abre Drizzle Studio para ver la base.
- `npm run typecheck`: verifica los tipos de TypeScript.

## Pruebas

El proyecto no tiene pruebas automáticas. Para comprobar que todo funciona:

1. Verificar los tipos. Debe terminar sin errores:

   ```bash
   npm run typecheck
   ```

2. Probar la API con el servidor en marcha (`npm run dev`):

   ```bash
   curl "http://localhost:3000/api/clientes?q=tucuman"
   ```

   Devuelve los clientes que tienen "tucuman" en cualquier campo, sin importar acentos ni mayúsculas.

   ```bash
   curl -X POST http://localhost:3000/api/clientes -H "Content-Type: application/json" -d '{"nombre":"  juan ","apellido":"PEREZ","email":"Juan@Mail.com","telefono":"(381) 555-1234"}'
   ```

   Crea un cliente normalizado: "Juan", "Perez", "juan@mail.com" y "3815551234". Si se repite, responde 400 porque el email
   ya existe.

3. Probar la interfaz en http://localhost:3000/MiniCRM.html:
   - Escribir en el buscador filtra la lista en el momento.
   - Al elegir un cliente se ven su ficha, sus compromisos y sus actividades completadas.
   - Agregar y Editar abren el formulario en el detalle. Al guardar se actualizan la lista y la ficha.
   - En el subformulario se agrega un compromiso. El lápiz lo carga para editarlo y la papelera lo borra.
   - Al tildar un compromiso pasa a "Actividades completadas", que no tienen botones para editar ni borrar.
   - Eliminar borra el cliente con todas sus actividades.
   - La página nunca se desplaza: solo tienen scroll la lista de clientes y las listas de actividades.

## Arquitectura

El proyecto está separado en capas. Cada una usa solo la capa de abajo.

Capa de datos (`src/db/`). En `schema.ts` se definen las tablas con Drizzle: `clientes` y `actividades`, unidas por
`clienteId` (cada cliente tiene muchas actividades). De ahí salen los tipos de TypeScript que usa el resto del proyecto.
`index.ts` crea la conexión: usa el archivo local `minicrm.db` o Turso si están las variables de entorno. `seed.ts` carga los
datos de ejemplo usando el servicio, así que también se normalizan.

Capa de negocio (`src/services/`). La clase `Clientes` de `clientes.service.ts` tiene métodos estáticos con todas las
operaciones: listar y buscar clientes, obtener la ficha, crear, editar y eliminar clientes, y crear, editar, completar y
eliminar actividades. Todas las reglas están acá:

- Al guardar se normalizan los nombres ("juan PEREZ" pasa a "Juan Perez"), los emails (en minúsculas) y los teléfonos (solo dígitos y un "+" inicial). Las funciones están en `normalizar.ts`.
- La búsqueda flexible busca el texto en cualquier campo, palabra por palabra, sin distinguir acentos ni mayúsculas.
- Una actividad se completa guardando su fecha de finalización. Las completadas no se pueden editar ni borrar individualmente.
- Una actividad está vencida si está pendiente y su fecha de compromiso es anterior a hoy.
- Los compromisos se ordenan así: primero los que no tienen fecha, después los vencidos y por último los de hoy o futuros, por fecha ascendente.
- Si una regla no se cumple, el servicio lanza un error con su código HTTP (`errores.ts`): 400 para datos inválidos, 404 si no existe y 409 si se intenta modificar una actividad completada.

Capa de presentación (API REST). `src/routes/` define las rutas y `src/controllers/` las atiende: cada controlador lee la
petición, llama al método del servicio y devuelve la respuesta, sin reglas de negocio. Las actividades se publican como
subrecurso del cliente. `src/middlewares/errores.ts` convierte los errores en respuestas JSON con la forma
`{ "error": { "status", "tipo", "mensaje" } }` (los errores inesperados devuelven 500). `src/app.ts` arma Express: sirve la
carpeta `public/`, monta la API en `/api` y agrega el manejo de errores. `src/index.ts` arranca el servidor.

Interfaz web (`public/MiniCRM.html`). Es una sola página con React, JSX embebido y CSS propio. React, ReactDOM y Babel se
cargan desde CDN con versiones fijas, y Babel está configurado con runtime classic para usar React global. La página usa
solo la API REST. Está organizada en componentes reutilizables: `Layout` y `Panel` para la estructura, `Boton` e `Icono`
para los controles, `Campo` y `FormCliente` para el formulario, `Maestro` para la lista con búsqueda, `Ficha` para los
datos del cliente y `Actividades` para el subformulario y las listas de compromisos y completadas.

### Endpoints de la API REST

- `GET /api/clientes?q=texto`: lista o busca clientes por cualquier campo (también acepta un campo puntual, por ejemplo `?localidad=...`).
- `POST /api/clientes`: crea un cliente.
- `GET /api/clientes/:id`: devuelve la ficha del cliente con sus actividades.
- `PUT /api/clientes/:id`: modifica un cliente.
- `DELETE /api/clientes/:id`: elimina el cliente y sus actividades.
- `GET /api/clientes/:clienteId/actividades`: lista las actividades del cliente.
- `POST /api/clientes/:clienteId/actividades`: crea una actividad.
- `PUT /api/clientes/:clienteId/actividades/:actividadId`: edita una actividad pendiente.
- `PATCH /api/clientes/:clienteId/actividades/:actividadId/completar`: completa una actividad (acepta `{ "fecha": "YYYY-MM-DD" }`; por defecto, hoy).
- `DELETE /api/clientes/:clienteId/actividades/:actividadId`: elimina una actividad pendiente.

## Informe final de métricas

### Líneas de código

Se contó solo el código fuente escrito para el proyecto: backend en TypeScript, frontend en `public/MiniCRM.html` y scripts
de base de datos. Se excluyen `node_modules/`, las bibliotecas externas (React, ReactDOM, Babel y modern-normalize se cargan
desde CDN), los archivos de configuración (`package.json`, `tsconfig.json`, `drizzle.config.ts`, `.env.example`,
`.gitignore`), las migraciones generadas automáticamente en `drizzle/` y este README.

"Totales" cuenta todas las líneas de los archivos. "Código" descuenta las líneas en blanco y las de comentarios.

| Área | Archivos | Totales | Código |
|---|---|---:|---:|
| Backend: servicio y reglas de negocio | `services/` (3 archivos) | 313 | 238 |
| Backend: API REST con Express | `app.ts`, `index.ts`, `routes/` (3), `controllers/` (3), `middlewares/` (1) | 173 | 132 |
| Subtotal Backend | 12 archivos | 486 | 370 |
| Frontend: CSS | bloque `<style>` de `MiniCRM.html` | 161 | 143 |
| Frontend: React con JSX | componentes y llamadas a la API | 484 | 423 |
| Frontend: HTML y configuración de Babel | resto de `MiniCRM.html` | 34 | 27 |
| Subtotal Frontend | 1 archivo | 679 | 593 |
| Base de datos y seed | `db/schema.ts`, `db/index.ts`, `db/seed.ts` | 159 | 143 |
| Total | 16 archivos | 1.324 | 1.106 |

Del código sin blancos ni comentarios, el 54 % es frontend, el 33 % backend y el 13 % base de datos y seed.

### Tiempo neto de desarrollo

El proyecto se desarrolló el 23/10/2026 con asistencia de IA (Claude Code), siguiendo la secuencia de prompts de la guía.
El tiempo total se tomó de las fechas de creación de los archivos. El reparto por etapa es una estimación, e incluye escribir
el código, probarlo y corregirlo.

| Etapa | Contenido | Tiempo estimado |
|---|---|---:|
| 1. Proyecto, modelo y servicio | Configuración, esquema Drizzle, conexión SQLite/Turso, seed y clase `Clientes` | 20 min |
| 2. API REST | Rutas, controladores, manejo de errores y prueba de los endpoints | 12 min |
| 3. Página maestro y detalle | Layout de pantalla completa, búsqueda en vivo, alta, edición y baja de clientes | 18 min |
| 4. Compromisos y actividades | Subformulario, orden de compromisos, completar, editar y borrar | 15 min |
| 5. Revisión final | Control contra el enunciado, ajustes, documentación y métricas | 30 min |
| Total | | 1 h 35 min |

No incluye unos 20 minutos dedicados a una funcionalidad opcional que finalmente se descartó, ni el tiempo de revisión y
commits hecho por la autora fuera de las sesiones.
