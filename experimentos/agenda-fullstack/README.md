# Agenda mínima: Arrow.js + Express + Drizzle + SQLite

Una aplicación maestro/detalle para demostrar tres límites claros:

```text
index.html                  server.mjs                       agenda.db
┌─────────────────┐         ┌──────────────────────────┐     ┌─────────────┐
│ Arrow.js        │  HTTP   │ Express → Drizzle         │ SQL │ contactos   │
│ Estado + vista  │ ──────► │ API + validación          │ ──► │ direcciones │
│ Formulario CRUD │ ◄────── │ Transacciones + consultas │ ◄── │ FK 1:N      │
└─────────────────┘  JSON   └──────────────────────────┘     └─────────────┘
```

No hay autenticación, compilación del frontend ni servicios externos. Todo el código propio del frontend está en un HTML y todo el código propio del servidor en un módulo JavaScript.

## 1. Ejecutar

Necesitás **Node.js 22 o posterior** y npm. Descomprimí el ZIP, abrí una terminal en su carpeta y ejecutá:

```bash
npm install
npm start
```

Abrí en el navegador:

```text
http://127.0.0.1:3000
```

**No abras `index.html` con doble clic.** La página tiene que comunicarse con el servidor HTTP. El HTML incluye un aviso cuando se abre mediante `file:`.

En el primer arranque se crea `agenda.db` junto al servidor y se agregan cuatro contactos ficticios. Los datos permanecen al reiniciar. La semilla no vuelve a insertarse en un archivo existente, aunque hayas eliminado todos sus contactos.

Para detener el servidor: `Ctrl+C`.

### Archivos

| Archivo | Función |
|---|---|
| `index.html` | HTML, CSS, runtime Arrow.js y lógica de la interfaz, sin CDN. |
| `server.mjs` | Esquema, creación inicial, persistencia, validación y rutas REST. |
| `package.json` | Dependencias y comandos npm. |
| `test-api.mjs` | Pruebas de la API y de la relación 1:N. |
| `VERIFICACION.md` | Alcance exacto de la verificación realizada. |
| `ARROW-LICENSE.txt` | Licencia MIT de la biblioteca incluida en el HTML. |
| `.gitignore` | Excluye dependencias y bases de datos del versionado. |

`agenda.db`, `node_modules/` y `package-lock.json` los genera la ejecución/instalación; no se incluyen en el ZIP. Guardá el lockfile que genere tu instalación para reproducir también las dependencias transitivas.

“Autocontenido” significa aquí **un archivo de código por lado**, no un ejecutable que traiga Node.js y SQLite empaquetados. Las dependencias del servidor se instalan con npm. El frontend sí contiene su biblioteca y sus estilos: no descarga nada desde un CDN.

Versiones fijadas: Arrow.js 1.0.6, Express 5.2.1, Drizzle ORM 0.45.3 y better-sqlite3 13.0.3.

## 2. Qué hace la interfaz

A la izquierda están la búsqueda activa, el listado y el botón **Nuevo**. A la derecha se editan nombre, apellido, domicilio y la colección de direcciones. **Agregar** incorpora una fila; **×** la quita del borrador; **Guardar** persiste el conjunto; **Cancelar** restaura los datos cargados; **Eliminar** borra el contacto completo, previa confirmación.

La búsqueda espera 220 ms desde la última pulsación y consulta al backend. Busca por nombre, apellido, domicilio y valores de las direcciones, ignorando mayúsculas y tildes. Una respuesta atrasada no reemplaza un resultado de búsqueda más nuevo.

Filtrar el listado no descarta el contacto abierto ni sus cambios. Por eso el detalle puede seguir mostrando un contacto que ya no coincide con el filtro. Cambiar de contacto o crear otro pide confirmación si hay modificaciones sin guardar.

El panel **Ver comunicación REST** muestra método, URL, cuerpo enviado, código HTTP y JSON recibido. Después de guardar conserva la traza del POST/PUT en lugar de reemplazarla por el GET de actualización del listado.

## 3. El modelo 1:N

“Domicilio” es la dirección postal del contacto. “Direcciones” son sus vías de comunicación.

```text
contactos                         direcciones
──────────────────────           ─────────────────────────────
id          PK                   id           PK interno
nombre                           contacto_id  FK → contactos.id
apellido                         tipo         telefono | celular | email
domicilio                        valor

             un contacto ────────────── cero o muchas direcciones
```

No se guardan teléfonos separados por comas ni una cadena JSON dentro de la tabla del padre. Cada dirección ocupa una fila en `direcciones`, vinculada mediante `contacto_id`.

La demostración admite de **0 a 20 direcciones por contacto**. Nombre y apellido son obligatorios. El domicilio puede ser `""`. Cada dirección necesita un tipo admitido y un valor no vacío; los emails tienen una validación básica de formato.

La relación de integridad se declara en Drizzle:

```js
contactoId: integer('contacto_id')
  .notNull()
  .references(() => contactos.id, { onDelete: 'cascade' })
```

Y se materializa en el SQL inicial como:

```sql
contacto_id INTEGER NOT NULL
  REFERENCES contactos(id) ON DELETE CASCADE
```

Se activa `PRAGMA foreign_keys = ON` en la conexión. SQLite impide insertar direcciones huérfanas y elimina las hijas cuando se elimina su padre. Además hay un índice sobre la clave foránea y restricciones `CHECK` para el tipo y el valor.

## 4. Contrato de la API

La API representa un contacto como **un recurso compuesto**. No hace falta publicar una ruta por cada tabla.

| Método | Ruta | Respuesta satisfactoria |
|---|---|---|
| GET | `/api/contactos?q=texto` | 200: arreglo de resúmenes para el maestro. |
| GET | `/api/contactos/:id` | 200: contacto completo con direcciones. |
| POST | `/api/contactos` | 201: contacto creado y cabecera `Location`. |
| PUT | `/api/contactos/:id` | 200: contacto y colección reemplazados. |
| DELETE | `/api/contactos/:id` | 204: sin cuerpo. |

GET del listado devuelve, por ejemplo:

```json
[
  {
    "id": 1,
    "nombre": "Ana",
    "apellido": "García",
    "domicilio": "Calle de Prueba 100",
    "cantidadDirecciones": 2
  }
]
```

GET del detalle devuelve:

```json
{
  "id": 1,
  "nombre": "Ana",
  "apellido": "García",
  "domicilio": "Calle de Prueba 100",
  "direcciones": [
    { "tipo": "celular", "valor": "+54 381 000-0001" },
    { "tipo": "email", "valor": "ana@example.test" }
  ]
}
```

POST y PUT reciben el mismo objeto **sin necesidad de enviar `id`**. Deben incluir `nombre`, `apellido`, `domicilio` y `direcciones`, aunque estos dos últimos sean `""` y `[]`.

PUT no es PATCH: **reemplaza el estado completo editable**. Enviar `direcciones: []` elimina todas las direcciones. Omitir la propiedad produce un error, no significa conservarlas.

Los errores tienen la forma:

```json
{ "error": "El contacto no existe." }
```

Se usan 400 para entradas inválidas, 404 para recursos/rutas inexistentes, 413 para cuerpos excesivos, 415 para un Content-Type incorrecto y 500 para fallos internos. Los errores internos no exponen SQL ni detalles de la base al cliente.

## 5. Cómo se guarda el agregado

Al presionar Guardar, el frontend construye solamente datos:

```js
{
  nombre,
  apellido,
  domicilio,
  direcciones: [{ tipo, valor }, ...]
}
```

El backend valida y ejecuta una transacción:

```text
BEGIN
  INSERT o UPDATE del contacto
  DELETE de las direcciones anteriores de ese contacto
  INSERT de la colección recibida, asignando contacto_id
COMMIT
```

Si falla una operación dentro de la transacción, se revierte el conjunto. No debe quedar actualizado el nombre con la mitad de sus direcciones guardadas.

### La simplificación deliberada

Para evitar reconciliación fila por fila, el PUT **borra y reinserta la colección**. Los identificadores de las direcciones son internos y pueden cambiar. La API solo expone sus valores y su orden. Repetir el mismo PUT conserva la representación pública aunque cambien esas claves internas.

Este diseño es apropiado para una colección pequeña que se edita junto al padre. No lo usaríamos sin cambios si otras entidades necesitaran referenciar una dirección individual. En ese caso habría que exponer IDs estables y actualizar diferencialmente, o añadir rutas de subrecursos como `/api/contactos/:id/direcciones/:direccionId`.

## 6. Dónde está cada responsabilidad

**En `index.html`:** `reactive()` mantiene el estado; las plantillas `html` presentan maestro, detalle y filas; `api()` encapsula `fetch`; `listar`, `seleccionar`, `guardar` y `eliminar` expresan las acciones del usuario. No hay consultas SQL ni acceso al archivo de la base.

**En `server.mjs`:** el esquema define las tablas; `validar()` controla las entradas; `leerContacto()` recompone el agregado; `guardarContacto()` aplica la transacción; Express traduce métodos/rutas HTTP en esas operaciones. Drizzle construye las consultas y better-sqlite3 las ejecuta sobre SQLite.

El backend usa consultas Drizzle explícitas. Para leer el detalle realiza una selección del padre y otra de sus hijas. La relación 1:N no depende de utilizar la API `relations()` de Drizzle.

El listado usa LEFT JOIN y COUNT; la búsqueda por una dirección usa EXISTS para no duplicar contactos y para contar todas sus direcciones, no solo las que coinciden.

### Por qué Express también entrega el HTML

La ruta `/` solo envía `index.html`; no genera el formulario en el servidor ni incrusta datos. Eso ahorra arrancar dos servidores para la primera demostración. Las responsabilidades siguen separadas y toda lectura/escritura del navegador utiliza la API.

Para mostrar también separación de orígenes, mantené la API en el puerto 3000 y serví **una copia de solo `index.html`** desde otra carpeta con Live Server en el puerto 5500. Abrí:

```text
http://127.0.0.1:5500/index.html?api=http://127.0.0.1:3000/api
```

El servidor admite CORS desde puertos HTTP de `localhost` y `127.0.0.1`. No admite `file:` ni orígenes externos. No publiques toda la carpeta del backend con un servidor estático: expondrías archivos que no corresponden.

## 7. Secuencia sugerida para demostrarlo

1. Abrir la agenda y expandir **Ver comunicación REST**. Seleccionar un contacto y observar el GET del detalle.
2. Buscar `garcia` y después `example.test`. Mostrar que se realizan peticiones GET al servidor y que las direcciones participan de la búsqueda.
3. Crear un contacto con un celular y dos emails. Guardar y observar un solo POST con un arreglo anidado.
4. Cambiar el nombre y quitar una dirección. Guardar y observar PUT con la colección restante.
5. Vaciar todas sus direcciones, guardar y comprobar que el contacto permanece. Luego eliminarlo y observar DELETE/204.
6. Revisar `guardarContacto()` y la clave foránea. Reiniciar el servidor para comprobar persistencia.

## 8. Comandos adicionales

```bash
# Reinicio automático al editar el servidor:
npm run dev

# Mostrar el SQL generado (macOS/Linux):
LOG_SQL=1 npm start

# Otro puerto:
PORT=3001 npm start

# Otra base, sin datos de demostración:
DB_FILE=otra-agenda.db SEED=0 npm start

# Pruebas de API con SQLite temporal:
npm test
```

Las pruebas no usan ni modifican `agenda.db`. Incluyen un trigger deliberado que provoca un fallo al insertar una hija, para comprobar rollback real dentro de una transacción.

## 9. Decisiones y límites

**Creación inicial, no migraciones evolutivas.** Para conservar un solo archivo de servidor, el DDL inicial está explícito junto al esquema de Drizzle. Cambiar la declaración de una tabla no modifica automáticamente una base ya creada. En una aplicación que evoluciona, el siguiente paso es extraer el esquema y usar migraciones versionadas con Drizzle Kit. Para reiniciar esta demo, detené el servidor y mové/respaldá `agenda.db` antes de crear otro archivo; no borres datos que necesites conservar.

**No es una aplicación para publicar tal cual.** Escucha únicamente en `127.0.0.1`, sin usuarios ni permisos. CORS no sustituye autenticación. No incluye auditoría, copias de seguridad, paginación ni resolución de conflictos entre ediciones simultáneas: prevalece el último guardado.

**Carga pequeña.** La búsqueda por subcadenas y la normalización de texto pueden recorrer muchas filas. better-sqlite3 es síncrono; consultas largas bloquean el hilo que las ejecuta. El reemplazo completo de direcciones prioriza claridad sobre eficiencia para colecciones grandes.

**Verificación.** Consultá `VERIFICACION.md`: la interfaz se probó con respuestas simuladas; la suite del backend se entrega, pero no pudo ejecutarse íntegramente en el entorno de preparación.

## Documentación de referencia

- [Arrow.js: estado reactivo, plantillas y eventos](https://arrow-js.com/api/)
- [Drizzle: SQLite](https://orm.drizzle.team/docs/get-started-sqlite)
- [Drizzle: transacciones](https://orm.drizzle.team/docs/transactions)
- [Express: API 5.x](https://expressjs.com/en/5x/api/)
- [SQLite: claves foráneas y acciones en cascada](https://www.sqlite.org/foreignkeys.html)

El proyecto fija Drizzle 0.45.3. Algunos ejemplos actuales de la documentación pertenecen a ramas posteriores y no deben mezclarse sin revisar la versión.
