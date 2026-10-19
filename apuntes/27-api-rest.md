# API REST con Express: la agenda en la web

En el apunte anterior armamos la capa de datos de la agenda con Drizzle: clientes, tareas y etiquetas guardados en SQLite o en Turso. Esas funciones solo se pueden usar desde un programa de Node en la misma máquina.

En este apunte las ponemos en la web. Construimos una API REST con Express: un servidor que recibe pedidos por HTTP, como "dame las tareas pendientes" o "creá este cliente", y responde con datos en JSON. Cualquier programa que hable HTTP puede usarla: una página web, una app de celular u otro servidor.

El apunte da por sabido cómo funciona HTTP: peticiones y respuestas, métodos, encabezados, códigos de estado y cadena de consulta. La primera parte explica qué es una API, cómo usar HTTP para que esa API sea REST, qué aporta Express y cómo organizar el código en capas. La segunda construye la API completa, archivo por archivo, y la prueba.

## Parte 1: la base teórica

### Qué es una API

Una API (interfaz de programación de aplicaciones) es la puerta de entrada que un programa ofrece a otros programas. Define qué pedidos acepta, qué datos hay que mandar en cada uno y qué devuelve.

La idea no es nueva para vos. Las funciones de la agenda del apunte anterior ya son una API: `Agenda.verCliente(id)` promete devolver la ficha de un cliente a quien la llame, sin que tenga que saber cómo está guardada. La diferencia es que solo se puede usar desde un programa de JavaScript que importe el módulo.

Una API web ofrece lo mismo a través de la red, usando HTTP. Quien la usa no necesita saber en qué lenguaje está hecho el servidor ni qué base de datos tiene. Solo necesita conocer el contrato: qué direcciones existen, qué método usar en cada una y qué forma tienen los datos que van y vienen.

Ese contrato es lo que permite separar el trabajo. La página web de la agenda, una app de celular y un script que manda recordatorios pueden usar la misma API. Y el servidor puede cambiar por dentro, por ejemplo pasar de SQLite a Turso, sin que ninguno de ellos se entere, mientras respete el contrato.

### Qué es REST

HTTP permite diseñar una API de muchas formas. Podrías mandar todo por `POST` a una sola dirección, con un campo `accion` en el cuerpo, y funcionaría. Pero cada API sería un idioma distinto que hay que aprender desde cero.

REST es un estilo de diseño que propone usar HTTP como fue pensado, sin inventar mecanismos propios. No es una librería ni un estándar con reglas estrictas, sino un conjunto de convenciones. Una API que las respeta es predecible: si sabés usar una API REST, ya sabés más o menos cómo se usa cualquier otra.

Las convenciones se resumen en cinco ideas:

- los datos se organizan en recursos, y cada recurso tiene su URL
- la acción sobre un recurso la indica el método HTTP, siempre con el mismo significado
- los recursos viajan como representaciones, en nuestro caso JSON
- el resultado se comunica con el código de estado
- el servidor no guarda estado de la conversación entre un pedido y otro

Las secciones siguientes desarrollan cada una sobre la agenda.

### Recursos y URL

Un recurso es una cosa sobre la que trabaja la aplicación. En la agenda, los recursos son los clientes y las tareas.

Cada recurso aparece de dos formas: como colección, el conjunto de todos, y como elemento, uno en particular. Las dos tienen su URL:

- `/api/clientes` es la colección de clientes
- `/api/clientes/4` es el cliente 4

Las URL nombran cosas, no acciones. Se escriben con sustantivos en plural y en minúscula. Rutas como `/api/borrarCliente?id=4` o `/api/clientes/4/eliminar` rompen la convención: la acción no va en la URL, la pone el método.

Cuando un recurso pertenece a otro, la URL puede reflejar esa jerarquía: `/api/clientes/4/tareas` son las tareas del cliente 4. Conviene no anidar más de un nivel. Una vez creada, la tarea tiene su propia dirección, `/api/tareas/6`, para no obligar a conocer su cliente cada vez que se la quiere ver o modificar.

Filtrar, ordenar o paginar no crea un recurso nuevo: es otra forma de mirar la misma colección. Por eso va en la cadena de consulta y no en la ruta. Las tareas pendientes de octubre son `/api/tareas?estado=pendiente&hasta=2026-10-31`, no `/api/tareas/pendientes/octubre`.

Todas las rutas empiezan con `/api`. Así quedan separadas de las páginas que el mismo servidor pueda servir más adelante. Algunas API agregan además una versión, como `/api/v1`, para poder cambiar el contrato sin romper a quienes usan la versión anterior.

### Los métodos: qué se hace con el recurso

Combinando la URL con el método se obtienen todas las operaciones básicas, sin rutas adicionales:

| Método | Sobre la colección `/api/clientes` | Sobre el elemento `/api/clientes/4` |
|---|---|---|
| `GET` | listar los clientes | leer el cliente 4 |
| `POST` | crear un cliente nuevo | no se usa |
| `PUT` | no se usa | reemplazar el cliente 4 completo |
| `PATCH` | no se usa | modificar algunos campos del cliente 4 |
| `DELETE` | no se usa | borrar el cliente 4 |

`POST` va sobre la colección porque el cliente todavía no tiene `id`: lo asigna el servidor. El resto de las modificaciones van sobre el elemento, que ya tiene su dirección.

Una API REST tiene que respetar lo que cada método promete, porque los clientes, los navegadores y los intermediarios actúan en base a eso:

- `GET` es seguro: no cambia nada, así que se puede repetir o guardar en caché sin consecuencias; nunca debe borrar ni modificar
- `PUT` y `DELETE` son idempotentes: repetirlos deja el mismo estado final, así que se pueden reintentar si falla la red
- `POST` no es idempotente: repetirlo crea dos recursos

`PUT` y `PATCH` modifican, pero de distinta manera. `PUT` reemplaza el recurso entero: lo que no mandás, se pierde. `PATCH` cambia solo los campos que mandás. Para corregir el teléfono de un cliente, `PATCH` con `{"telefono": "..."}` es lo natural. En la agenda usamos `PATCH`.

Algunas operaciones parecen acciones, como completar una tarea. En REST se piensan como un cambio de estado del recurso: completar es poner `completada` en `true`, así que se hace con `PATCH /api/tareas/4` y el cuerpo `{"completada": true}`. No hace falta una ruta `/api/tareas/4/completar`.

### Representaciones en JSON

El servidor nunca entrega el recurso en sí, que es una fila en una base de datos. Entrega una representación: una descripción del recurso en un formato de texto. En nuestra API, ese formato es JSON en las dos direcciones.

Al crear o modificar, el cliente manda el JSON en el cuerpo y avisa el formato con el encabezado `Content-Type: application/json`. Al responder, el servidor devuelve el recurso tal como quedó:

```http
POST /api/clientes HTTP/1.1
Content-Type: application/json

{"nombre": "Diego Ruiz", "email": "diego@correo.com"}
```

```http
HTTP/1.1 201 Created
Location: /api/clientes/4
Content-Type: application/json; charset=utf-8

{"id":4,"nombre":"Diego Ruiz","email":"diego@correo.com","telefono":null,"creadoEn":"2026-10-15 19:42:05"}
```

La respuesta trae el cliente completo, con los datos que agregó el servidor: el `id` y la fecha de creación. Así quien lo creó no necesita pedirlo de nuevo. El encabezado `Location` indica la URL del recurso nuevo.

La representación no tiene por qué ser igual a la tabla. `GET /api/clientes/4` devuelve el cliente con sus tareas adentro, y `GET /api/clientes` agrega a cada cliente la cantidad de tareas pendientes. La API muestra los datos de la forma que le sirve a quien los usa.

Conviene que los mismos campos tengan siempre el mismo nombre y formato. En la agenda, las fechas viajan como texto `AAAA-MM-DD`, porque JSON no tiene un tipo fecha.

### Los códigos de estado en una API REST

El código de estado es la forma en que la API dice cómo terminó la operación. Quien la usa decide qué hacer mirando el código, sin interpretar el texto del cuerpo.

Cada operación tiene un código de éxito propio:

| Operación | Código | Cuerpo |
|---|---|---|
| leer o listar | 200 OK | el recurso o la colección |
| crear | 201 Created | el recurso creado, con encabezado `Location` |
| modificar | 200 OK | el recurso modificado |
| borrar | 204 No Content | vacío |

Y los errores se distinguen según de quién es el problema:

| Código | Cuándo |
|---|---|
| 400 Bad Request | los datos enviados no son válidos |
| 404 Not Found | el recurso o la ruta no existen |
| 409 Conflict | el pedido choca con el estado actual, por ejemplo un email repetido |
| 500 Internal Server Error | falló algo inesperado en el servidor |

Un error común es responder siempre 200 y poner `{"ok": false}` en el cuerpo. Eso obliga a quien usa la API a leer cada respuesta para saber si funcionó, y engaña a cualquier herramienta que confíe en el código.

Los errores también llevan un cuerpo, y conviene que tenga siempre la misma forma. En la agenda es un objeto con `error`, un mensaje para leer, y `detalles`, opcional, con información por campo:

```json
{
  "error": "Datos inválidos",
  "detalles": { "nombre": "no puede estar vacío", "email": "no es un email válido" }
}
```

### Sin estado

El servidor no guarda nada de la conversación entre un pedido y otro. Cada petición trae todo lo necesario para atenderla. El servidor no recuerda que "este usuario estaba viendo la página 2": si lo necesita, la petición lo dice con `?pagina=2`.

Lo que sí persiste son los recursos, en la base de datos. Lo que no persiste es el contexto de quien pregunta.

Esto tiene una consecuencia práctica: cualquier pedido puede atenderlo cualquier copia del servidor. Si la agenda crece y hacen falta tres servidores, los pedidos se reparten entre ellos sin que nada se pierda.

### El diseño de la API de la agenda

Con esas ideas, la API queda así:

| Método y ruta | Acción | Éxito |
|---|---|---|
| `GET /api/clientes?buscar=` | listar clientes con su cantidad de pendientes | 200 |
| `POST /api/clientes` | crear un cliente | 201 |
| `GET /api/clientes/:id` | ver un cliente con sus tareas | 200 |
| `PATCH /api/clientes/:id` | modificar un cliente | 200 |
| `DELETE /api/clientes/:id` | borrar un cliente y sus tareas | 204 |
| `GET /api/clientes/:id/tareas` | listar las tareas de un cliente | 200 |
| `POST /api/clientes/:id/tareas` | crear una tarea para un cliente | 201 |
| `GET /api/tareas?estado=&hasta=&prioridad=` | listar tareas con filtros | 200 |
| `GET /api/tareas/:id` | ver una tarea con su cliente y etiquetas | 200 |
| `PATCH /api/tareas/:id` | modificar una tarea, por ejemplo completarla | 200 |
| `DELETE /api/tareas/:id` | borrar una tarea | 204 |

`:id` marca una parte variable de la ruta: el número del cliente o la tarea.

Las tareas se crean bajo su cliente, `POST /api/clientes/4/tareas`, porque una tarea no existe sin él. Desde ahí, se leen, modifican y borran por su propia dirección.

Esta tabla es el contrato. Todo lo que sigue es la forma de cumplirlo.

### Qué es Express

Node puede atender pedidos HTTP solo, con su módulo `http`. Pero ese módulo da lo mínimo: recibís la petición como un flujo de bytes y tenés que decidir a mano qué hacer según el método y la ruta, leer el cuerpo y convertirlo de JSON.

Express es una librería que se apoya en ese módulo y resuelve lo repetitivo:

- asocia cada combinación de método y ruta con una función
- extrae los parámetros de la ruta y de la cadena de consulta
- convierte el cuerpo JSON en un objeto
- ofrece métodos cómodos para responder
- permite encadenar funciones que procesan cada pedido, llamadas middleware

### La aplicación, las rutas y los manejadores

Todo empieza creando una aplicación y diciéndole qué hacer con cada ruta:

```js
import express from 'express';

const app = express();

app.get('/api/salud', (req, res) => {
  res.json({ estado: 'ok' });
});

app.listen(3000);
```

`app.get` dice: cuando llegue un `GET` a `/api/salud`, ejecutá esta función. Hay un método por cada verbo HTTP: `app.post`, `app.patch`, `app.delete`.

La función se llama manejador. Recibe dos objetos:

- `req` (request) representa la petición: `req.params` tiene los parámetros de la ruta, `req.query` los de la cadena de consulta, `req.body` el cuerpo ya convertido y `req.method` el método
- `res` (response) sirve para armar la respuesta: `res.status(201)` fija el código, `res.json(datos)` manda JSON y `res.end()` cierra la respuesta sin cuerpo

Los métodos de `res` se encadenan: `res.status(201).json(cliente)`.

Con `/api/clientes/:id`, Express pone en `req.params.id` lo que venga en esa posición. Siempre es texto: para `/api/clientes/4` vale `'4'`, no `4`.

### Middleware: la cadena de procesamiento

Un middleware es una función que recibe la petición antes que el manejador. Puede hacer algo con ella y pasarla a la siguiente función, o responder y cortar la cadena.

Recibe un tercer parámetro, `next`, que es la función para pasar al siguiente eslabón:

```js
app.use((req, res, next) => {
  console.log(req.method, req.url);
  next();
});
```

`app.use` registra un middleware para todas las rutas. Express arma una fila con todo lo registrado, en el orden en que aparece en el código, y cada pedido la recorre de arriba hacia abajo:

```text
petición
   │
   ▼
registro ──► cors ──► express.json() ──► router de /api ──► ruta no encontrada
                                              │                     │
                                       controlador                  │
                                              │ (lanza un error)    │
                                              ▼                     ▼
                                      manejador de errores ◄────────┘
                                              │
                                              ▼
                                          respuesta
```

El orden importa. `express.json()` es el middleware que lee el cuerpo y lo convierte en `req.body`. Si lo registrás después de las rutas, los controladores reciben `req.body` vacío.

Un middleware con cuatro parámetros, `(error, req, res, next)`, es especial: es un manejador de errores. Express lo saltea mientras todo va bien. Cuando alguna función lanza un error o llama `next(error)`, Express salta directamente al primer manejador de errores que encuentre. Va al final de la cadena.

### Express 5 y las funciones asíncronas

Los controladores consultan la base, así que son funciones `async`. Si una lanza un error, la promesa que devuelve se rechaza.

Desde la versión 5, Express espera esas promesas y, si se rechazan, manda el error al manejador de errores. Eso permite escribir `throw` en un controlador asíncrono y confiar en que la respuesta de error sale sola.

En Express 4 no era así: un error dentro de una función `async` quedaba sin atender y el pedido nunca recibía respuesta. Vas a ver tutoriales viejos con envoltorios como `asyncHandler(...)` alrededor de cada controlador. Con Express 5 no hacen falta.

### Arquitectura en capas

Podríamos escribir toda la API en un archivo: cada `app.get` con su consulta a la base, su validación y su respuesta adentro. Con 11 rutas, ese archivo mezcla tres preocupaciones distintas y se vuelve difícil de leer, de probar y de cambiar.

La solución es repartir el trabajo en capas, cada una con una sola responsabilidad:

```text
          HTTP                                                   SQL
petición ──► router ──► controlador ──► servicio ──► Drizzle ──► base
              │             │               │
         qué URL va     traduce HTTP    lógica de datos;
         a qué función  a datos y       no sabe nada
                        datos a HTTP    de HTTP
```

El router es el índice de la API. Asocia cada método y ruta con un controlador, y nada más. Leyéndolo, ves todas las rutas de un recurso de un vistazo.

El controlador es el traductor entre HTTP y la aplicación. Saca los datos de `req`, los valida, llama al servicio y convierte el resultado en una respuesta con el código adecuado. Es la única capa que conoce `req` y `res`.

El servicio hace el trabajo con los datos: consultas, altas, cambios y bajas con Drizzle. Recibe y devuelve objetos comunes de JavaScript. No sabe que existe HTTP.

Esta separación tiene tres ventajas concretas.

Cada archivo es corto y hace una sola cosa. Para cambiar una URL, vas al router. Para cambiar un mensaje de error, al controlador. Para optimizar una consulta, al servicio.

Los servicios se pueden reutilizar. Un script de línea de comandos o un proceso que manda recordatorios por mail puede llamar a `tareas.listar({ completada: false })` sin pasar por HTTP.

Los cambios no se propagan. Si mañana la agenda deja Drizzle por otra librería, solo cambian los servicios. Si la API pasa de Express a otro framework, los servicios no se tocan.

Alrededor de las capas hay piezas compartidas: la validación de datos, una clase para los errores con código HTTP y los middlewares propios.

## Parte 2: la implementación

### Estructura del proyecto

Partimos del proyecto del apunte de Drizzle y le agregamos la API:

```text
agenda/
├── .env
├── drizzle.config.js
├── drizzle/
├── package.json
└── src/
    ├── server.js                    arranca el servidor
    ├── app.js                       arma la aplicación de Express
    ├── db/                          del apunte anterior
    │   ├── schema.js
    │   ├── relations.js
    │   ├── index.js
    │   └── seed.js
    ├── routes/
    │   ├── index.js                 junta los routers bajo /api
    │   ├── clientes.routes.js
    │   └── tareas.routes.js
    ├── controllers/
    │   ├── clientes.controller.js
    │   └── tareas.controller.js
    ├── services/
    │   ├── clientes.service.js
    │   └── tareas.service.js
    ├── middlewares/
    │   ├── registro.js              muestra cada pedido en consola
    │   ├── parametros.js            convierte y valida el :id
    │   └── errores.js               ruta no encontrada y manejo de errores
    └── utils/
        ├── http-error.js            error con código HTTP
        ├── validar.js               validador genérico y reglas básicas
        └── reglas.js                reglas de cada recurso
```

Las carpetas se organizan por capa y los archivos por recurso. El sufijo `.routes`, `.controller` o `.service` deja claro qué es cada archivo aunque esté abierto fuera de su carpeta.

### Instalación

```bash
npm i express cors
```

Agregamos dos atajos en `package.json`:

```json
"scripts": {
  "start": "node src/server.js",
  "dev": "node --watch src/server.js"
}
```

`--watch` reinicia el servidor cada vez que guardás un archivo. Es el que usás mientras desarrollás.

### Los servicios: los datos sin HTTP

Empezamos por la capa más baja. Los servicios son las funciones de la agenda del apunte anterior, repartidas por recurso.

```js
// src/services/clientes.service.js
import { eq, and, asc, count, like } from 'drizzle-orm';
import { db } from '../db/index.js';
import { clientes, tareas } from '../db/schema.js';

export function listar({ buscar } = {}) {
  return db
    .select({
      id: clientes.id,
      nombre: clientes.nombre,
      email: clientes.email,
      pendientes: count(tareas.id),
    })
    .from(clientes)
    .leftJoin(tareas, and(eq(tareas.clienteId, clientes.id), eq(tareas.completada, false)))
    .where(buscar ? like(clientes.nombre, `%${buscar}%`) : undefined)
    .groupBy(clientes.id)
    .orderBy(asc(clientes.nombre));
}

export function obtener(id) {
  return db.query.clientes.findFirst({
    where: { id },
    with: { tareas: { orderBy: { vence: 'asc' } } },
  });
}

export async function existe(id) {
  return (await db.$count(clientes, eq(clientes.id, id))) > 0;
}

export async function crear(datos) {
  const [cliente] = await db.insert(clientes).values(datos).returning();
  return cliente;
}

export async function actualizar(id, cambios) {
  const [cliente] = await db.update(clientes).set(cambios).where(eq(clientes.id, id)).returning();
  return cliente;
}

export async function eliminar(id) {
  const borrados = await db.delete(clientes).where(eq(clientes.id, id)).returning();
  return borrados.length > 0;
}
```

En `listar`, el `where` recibe `undefined` cuando no hay búsqueda. Drizzle interpreta eso como "sin condición", lo que permite un filtro opcional sin duplicar la consulta.

Ninguna función decide qué hacer si el cliente no existe. `obtener` y `actualizar` devuelven `undefined` y `eliminar` devuelve `false`. Qué significa eso para el usuario lo decide el controlador.

```js
// src/services/tareas.service.js
import { eq } from 'drizzle-orm';
import { db } from '../db/index.js';
import { tareas } from '../db/schema.js';

export function listar({ completada, hasta, prioridad } = {}) {
  const where = {};
  if (completada !== undefined) where.completada = completada;
  if (hasta) where.vence = { lte: hasta };
  if (prioridad) where.prioridad = prioridad;

  return db.query.tareas.findMany({
    where,
    orderBy: { vence: 'asc' },
    with: { cliente: { columns: { id: true, nombre: true } } },
  });
}

export function listarDeCliente(clienteId) {
  return db.query.tareas.findMany({
    where: { clienteId },
    orderBy: { vence: 'asc' },
    with: { etiquetas: { columns: { nombre: true } } },
  });
}

export function obtener(id) {
  return db.query.tareas.findFirst({
    where: { id },
    with: {
      cliente: { columns: { id: true, nombre: true } },
      etiquetas: { columns: { nombre: true } },
    },
  });
}

export async function crear(clienteId, datos) {
  const [tarea] = await db.insert(tareas).values({ ...datos, clienteId }).returning();
  return tarea;
}

export async function actualizar(id, cambios) {
  const [tarea] = await db.update(tareas).set(cambios).where(eq(tareas.id, id)).returning();
  return tarea;
}

export async function eliminar(id) {
  const borradas = await db.delete(tareas).where(eq(tareas.id, id)).returning();
  return borradas.length > 0;
}
```

`listar` arma el filtro de a poco. Como las consultas relacionales reciben el `where` como objeto, agregar una condición es agregar una propiedad.

### Errores con significado

Cuando un controlador detecta un problema, necesita decir qué código HTTP corresponde. Para eso creamos una clase de error que lleva el código:

```js
// src/utils/http-error.js
export class HttpError extends Error {
  constructor(status, mensaje, detalles) {
    super(mensaje);
    this.status = status;
    this.detalles = detalles;
  }
}

export const noEncontrado = (recurso) => new HttpError(404, `${recurso} no encontrado`);
```

`HttpError` extiende `Error`, así que se lanza con `throw` como cualquier error. El manejador de errores la reconoce con `instanceof` y usa su `status` para la respuesta.

`noEncontrado` es un atajo para el caso más frecuente: `throw noEncontrado('Cliente')`.

### Validación

Nunca hay que confiar en lo que manda el cliente. Puede faltar un campo, venir un número donde se esperaba texto o llegar campos que no deberían tocarse, como el `id`.

La validación tiene dos trabajos: rechazar datos inválidos con un mensaje claro y quedarse solo con los campos permitidos. El segundo protege de la asignación masiva: si pasáramos `req.body` directo al servicio, alguien podría mandar `{"id": 500}` o `{"clienteId": 9}` y cambiar campos que no corresponden.

Escribimos un validador genérico que recibe el objeto a revisar y un conjunto de reglas:

```js
// src/utils/validar.js
import { HttpError } from './http-error.js';

// Revisa un objeto contra un conjunto de reglas.
// Devuelve solo los campos conocidos y válidos; si hay errores, lanza un 400.
export function validar(cuerpo, reglas, { parcial = false } = {}) {
  const datos = {};
  const errores = {};

  for (const [campo, regla] of Object.entries(reglas)) {
    const valor = cuerpo?.[campo];

    if (valor === undefined) {
      if (regla.requerido && !parcial) errores[campo] = 'es obligatorio';
      continue;
    }

    const error = regla.validar(valor);
    if (error) errores[campo] = error;
    else datos[campo] = valor;
  }

  if (Object.keys(errores).length > 0) {
    throw new HttpError(400, 'Datos inválidos', errores);
  }
  if (parcial && Object.keys(datos).length === 0) {
    throw new HttpError(400, 'No se indicó ningún campo para modificar');
  }
  return datos;
}
```

El bucle recorre las reglas, no el cuerpo. Por eso un campo que no tiene regla nunca llega a `datos`: queda descartado sin error.

El modo `parcial` es para `PATCH`. En una modificación, ningún campo es obligatorio, pero tiene que venir al menos uno.

Cada regla es una función que recibe un valor y devuelve un mensaje de error, o `null` si el valor es válido. Algunas se fabrican con parámetros:

```js
// src/utils/validar.js (continuación)
export const texto = (min, max) => (v) =>
  typeof v !== 'string' ? 'debe ser texto'
  : v.trim().length < min ? (min === 1 ? 'no puede estar vacío' : `debe tener al menos ${min} caracteres`)
  : v.length > max ? `debe tener como máximo ${max} caracteres`
  : null;

export const email = (v) =>
  typeof v === 'string' && /^[^@\s]+@[^@\s]+\.[^@\s]+$/.test(v) ? null : 'no es un email válido';

export const fecha = (v) =>
  typeof v === 'string' && /^\d{4}-\d{2}-\d{2}$/.test(v) && !isNaN(Date.parse(v))
    ? null : 'debe ser una fecha AAAA-MM-DD';

export const unoDe = (opciones) => (v) =>
  opciones.includes(v) ? null : `debe ser uno de: ${opciones.join(', ')}`;

export const booleano = (v) => (typeof v === 'boolean' ? null : 'debe ser true o false');

export const nulable = (regla) => (v) => (v === null ? null : regla(v));
```

`texto(1, 100)` devuelve una función que valida textos de 1 a 100 caracteres. Es una función que fabrica funciones, gracias a la clausura sobre `min` y `max`.

`nulable` envuelve otra regla para aceptar además `null`. Así un cliente puede borrar su teléfono mandando `{"telefono": null}`.

Las reglas de cada recurso quedan en un archivo aparte, como datos:

```js
// src/utils/reglas.js
import { texto, email, fecha, unoDe, booleano, nulable } from './validar.js';

export const reglasCliente = {
  nombre:   { requerido: true, validar: texto(1, 100) },
  email:    { requerido: true, validar: email },
  telefono: { validar: nulable(texto(0, 30)) },
};

export const PRIORIDADES = ['baja', 'media', 'alta'];

export const reglasTarea = {
  titulo:     { requerido: true, validar: texto(1, 200) },
  vence:      { validar: nulable(fecha) },
  prioridad:  { validar: unoDe(PRIORIDADES) },
  completada: { validar: booleano },
};

export const reglasFiltroTareas = {
  estado:    { validar: unoDe(['pendiente', 'completada', 'todas']) },
  hasta:     { validar: fecha },
  prioridad: { validar: unoDe(PRIORIDADES) },
};
```

`reglasFiltroTareas` muestra que el mismo validador sirve para la cadena de consulta. `req.query` también es un objeto con datos que vienen del cliente.

La base sigue teniendo sus restricciones: `NOT NULL`, `UNIQUE`, el `check` de prioridad. La validación de la API no las reemplaza. Las adelanta para dar mensajes claros, y la base queda como última barrera.

### Los controladores

Con los servicios, los errores y la validación listos, los controladores quedan cortos. Cada uno sigue el mismo patrón: tomar datos de `req`, validar, llamar al servicio y responder.

```js
// src/controllers/clientes.controller.js
import * as clientes from '../services/clientes.service.js';
import { validar } from '../utils/validar.js';
import { reglasCliente } from '../utils/reglas.js';
import { noEncontrado } from '../utils/http-error.js';

// GET /api/clientes?buscar=texto
export async function listar(req, res) {
  const { buscar } = req.query;
  res.json(await clientes.listar({ buscar }));
}

// GET /api/clientes/:id
export async function obtener(req, res) {
  const cliente = await clientes.obtener(req.id);
  if (!cliente) throw noEncontrado('Cliente');
  res.json(cliente);
}

// POST /api/clientes
export async function crear(req, res) {
  const datos = validar(req.body, reglasCliente);
  const cliente = await clientes.crear(datos);
  res.status(201).location(`/api/clientes/${cliente.id}`).json(cliente);
}

// PATCH /api/clientes/:id
export async function actualizar(req, res) {
  const cambios = validar(req.body, reglasCliente, { parcial: true });
  const cliente = await clientes.actualizar(req.id, cambios);
  if (!cliente) throw noEncontrado('Cliente');
  res.json(cliente);
}

// DELETE /api/clientes/:id
export async function eliminar(req, res) {
  const borrado = await clientes.eliminar(req.id);
  if (!borrado) throw noEncontrado('Cliente');
  res.status(204).end();
}
```

`import * as clientes` junta todas las funciones del servicio en un objeto. Así el código dice `clientes.obtener(...)`, que se lee como una oración, y no hay choque de nombres con las funciones del controlador.

El comentario sobre cada función indica qué ruta atiende. Es la conexión con el router.

`req.id` no es una propiedad estándar de Express. La pone un middleware que convierte el `:id` de la ruta en número, que vemos más adelante.

Ningún controlador tiene `try` y `catch`. Si el servicio falla o la validación lanza un `HttpError`, Express 5 lleva el error al manejador central. El controlador describe solo el camino feliz y los casos de negocio, como "no existe".

```js
// src/controllers/tareas.controller.js
import * as tareas from '../services/tareas.service.js';
import * as clientes from '../services/clientes.service.js';
import { validar } from '../utils/validar.js';
import { reglasTarea, reglasFiltroTareas } from '../utils/reglas.js';
import { noEncontrado } from '../utils/http-error.js';

const ESTADOS = { pendiente: false, completada: true, todas: undefined };

// GET /api/tareas?estado=pendiente&hasta=2026-10-31&prioridad=alta
export async function listar(req, res) {
  const { estado = 'todas', hasta, prioridad } = validar(req.query, reglasFiltroTareas);
  res.json(await tareas.listar({ completada: ESTADOS[estado], hasta, prioridad }));
}

// GET /api/clientes/:id/tareas
export async function listarDeCliente(req, res) {
  if (!(await clientes.existe(req.id))) throw noEncontrado('Cliente');
  res.json(await tareas.listarDeCliente(req.id));
}

// GET /api/tareas/:id
export async function obtener(req, res) {
  const tarea = await tareas.obtener(req.id);
  if (!tarea) throw noEncontrado('Tarea');
  res.json(tarea);
}

// POST /api/clientes/:id/tareas
export async function crear(req, res) {
  const datos = validar(req.body, reglasTarea);
  if (!(await clientes.existe(req.id))) throw noEncontrado('Cliente');
  const tarea = await tareas.crear(req.id, datos);
  res.status(201).location(`/api/tareas/${tarea.id}`).json(tarea);
}

// PATCH /api/tareas/:id
export async function actualizar(req, res) {
  const cambios = validar(req.body, reglasTarea, { parcial: true });
  const tarea = await tareas.actualizar(req.id, cambios);
  if (!tarea) throw noEncontrado('Tarea');
  res.json(tarea);
}

// DELETE /api/tareas/:id
export async function eliminar(req, res) {
  const borrada = await tareas.eliminar(req.id);
  if (!borrada) throw noEncontrado('Tarea');
  res.status(204).end();
}
```

`ESTADOS` traduce el lenguaje de la API al del servicio. Quien usa la API piensa en "pendiente" o "completada"; el servicio trabaja con el booleano `completada`. Esa traducción es trabajo del controlador.

En `listarDeCliente` y `crear` verificamos que el cliente exista. Sin esa verificación, pedir las tareas del cliente 99 devolvería un arreglo vacío, como si existiera y no tuviera tareas. Y crear una tarea para él fallaría por la clave foránea con un error poco claro.

### Los routers

Un router es una mini aplicación de Express con sus propias rutas. Se crea con `Router()` y después se monta en la aplicación bajo un prefijo.

```js
// src/routes/clientes.routes.js
import { Router } from 'express';
import * as clientes from '../controllers/clientes.controller.js';
import * as tareas from '../controllers/tareas.controller.js';
import { parsearId } from '../middlewares/parametros.js';

const router = Router();

router.param('id', parsearId);

router.route('/')
  .get(clientes.listar)
  .post(clientes.crear);

router.route('/:id')
  .get(clientes.obtener)
  .patch(clientes.actualizar)
  .delete(clientes.eliminar);

router.route('/:id/tareas')
  .get(tareas.listarDeCliente)
  .post(tareas.crear);

export default router;
```

Las rutas son relativas al prefijo donde se monte el router. Si se monta en `/api/clientes`, la ruta `/:id` atiende `/api/clientes/4`.

`router.route(ruta)` agrupa todos los métodos de una misma ruta. Se lee como una tabla: para `/:id`, `GET` va a `obtener`, `PATCH` a `actualizar` y `DELETE` a `eliminar`.

`router.param('id', parsearId)` registra un middleware que corre antes de cualquier ruta de este router que tenga `:id`. Lo vemos en la próxima sección.

```js
// src/routes/tareas.routes.js
import { Router } from 'express';
import * as tareas from '../controllers/tareas.controller.js';
import { parsearId } from '../middlewares/parametros.js';

const router = Router();

router.param('id', parsearId);

router.get('/', tareas.listar);

router.route('/:id')
  .get(tareas.obtener)
  .patch(tareas.actualizar)
  .delete(tareas.eliminar);

export default router;
```

Un router índice junta los de cada recurso:

```js
// src/routes/index.js
import { Router } from 'express';
import clientes from './clientes.routes.js';
import tareas from './tareas.routes.js';

const router = Router();

router.use('/clientes', clientes);
router.use('/tareas', tareas);

export default router;
```

Agregar un recurso nuevo, por ejemplo etiquetas, es crear su router y sumar una línea acá.

### Middlewares propios

#### Convertir el id

Todas las rutas con `:id` necesitan lo mismo: convertir el texto en número y rechazar valores como `abc` o `-3`. En lugar de repetirlo en cada controlador, lo hace un middleware de parámetro:

```js
// src/middlewares/parametros.js
import { HttpError } from '../utils/http-error.js';

// Se ejecuta antes de cualquier ruta que tenga :id.
// Convierte el texto de la URL en número y lo deja en req.id.
export function parsearId(req, res, next, valor) {
  const id = Number(valor);
  if (!Number.isInteger(id) || id <= 0) {
    throw new HttpError(400, 'El id debe ser un número entero positivo');
  }
  req.id = id;
  next();
}
```

Un middleware de parámetro recibe un cuarto argumento: el valor del parámetro en la URL. Si es válido, guarda el número en `req.id` y llama `next()`. Si no, lanza un error y la petición nunca llega al controlador.

Agregar propiedades a `req` es la forma habitual en que un middleware le pasa información a los siguientes.

#### Registrar los pedidos

```js
// src/middlewares/registro.js
// Muestra en consola cada petición con su resultado y su duración
export function registro(req, res, next) {
  const inicio = performance.now();
  res.on('finish', () => {
    const ms = (performance.now() - inicio).toFixed(1);
    console.log(`${req.method} ${req.originalUrl} → ${res.statusCode} (${ms} ms)`);
  });
  next();
}
```

Este middleware no puede saber el código de estado cuando recibe la petición, porque todavía no se respondió. Por eso se suscribe al evento `finish` de la respuesta, que ocurre cuando ya se envió, y recién ahí escribe la línea.

`req.originalUrl` es la URL completa. Dentro de un router, `req.url` muestra solo la parte relativa al prefijo.

#### Manejar los errores

```js
// src/middlewares/errores.js
import { HttpError } from '../utils/http-error.js';

// Ninguna ruta coincidió con la petición
export function rutaNoEncontrada(req, res, next) {
  next(new HttpError(404, `No existe la ruta ${req.method} ${req.originalUrl}`));
}

// Último eslabón: traduce cualquier error a una respuesta JSON
export function manejarErrores(error, req, res, next) {
  if (error instanceof HttpError) {
    return res.status(error.status).json({ error: error.message, detalles: error.detalles });
  }

  if (error.type === 'entity.parse.failed') {
    return res.status(400).json({ error: 'El cuerpo no es un JSON válido' });
  }

  const motivo = error.cause?.message ?? '';
  if (motivo.includes('UNIQUE constraint failed')) {
    return res.status(409).json({ error: 'Ya existe un registro con ese valor', detalles: motivo });
  }

  console.error(error);
  res.status(500).json({ error: 'Error interno del servidor' });
}
```

`rutaNoEncontrada` es un middleware común que se registra después de todas las rutas. Si un pedido llega hasta él, es porque ninguna ruta coincidió. Sin él, Express respondería con una página HTML, que no es lo que espera quien usa una API.

`manejarErrores` concentra en un solo lugar la traducción de errores a respuestas. Distingue cuatro casos:

- un `HttpError` lanzado a propósito: se responde con su código y su mensaje
- un cuerpo que no es JSON válido: `express.json()` lanza un error con `type` igual a `'entity.parse.failed'`
- un email repetido: la base rechaza el insert por la restricción `UNIQUE` y respondemos 409
- cualquier otra cosa: es un error inesperado, se registra completo en la consola y al cliente solo le llega un 500 genérico

Ese último punto es una medida de seguridad. El detalle de un error interno puede revelar la estructura de la base o rutas de archivos. Se muestra en la consola del servidor, no en la respuesta.

### La aplicación

`app.js` arma la cadena completa en el orden correcto:

```js
// src/app.js
import express from 'express';
import cors from 'cors';
import rutas from './routes/index.js';
import { registro } from './middlewares/registro.js';
import { rutaNoEncontrada, manejarErrores } from './middlewares/errores.js';

const app = express();

app.use(registro);
app.use(cors({ origin: 'http://localhost:5173' }));
app.use(express.json());

app.get('/api/salud', (req, res) => res.json({ estado: 'ok' }));
app.use('/api', rutas);

app.use(rutaNoEncontrada);
app.use(manejarErrores);

export default app;
```

Primero los middlewares que preparan la petición, después las rutas y al final los que atienden lo que quedó sin resolver.

`/api/salud` es una ruta mínima para comprobar que el servidor está vivo sin tocar la base. Los servicios de alojamiento la usan para saber si la aplicación arrancó bien.

`cors` lo explicamos en la sección "Usar la API desde una página web".

```js
// src/server.js
import 'dotenv/config';
import app from './app.js';

const PUERTO = process.env.PORT ?? 3000;

app.listen(PUERTO, () => {
  console.log(`API escuchando en http://localhost:${PUERTO}`);
});
```

Separar `app.js` de `server.js` tiene una razón práctica: `app.js` arma la aplicación sin ponerla a escuchar. Las pruebas automáticas pueden importarla y mandarle pedidos sin ocupar un puerto.

El puerto sale de la variable de entorno `PORT` porque los servicios de alojamiento suelen asignarlo ellos.

### Probar la API

Arrancá el servidor con la base sembrada:

```bash
npm run db:sembrar
npm run dev
```

Desde otra terminal, `curl` manda pedidos HTTP. `-X` elige el método, `-H` agrega un encabezado y `-d` manda un cuerpo.

Listar los clientes:

```bash
curl http://localhost:3000/api/clientes
```

```json
[
  { "id": 1, "nombre": "Ana Pérez", "email": "ana@correo.com", "pendientes": 2 },
  { "id": 2, "nombre": "Bruno Díaz", "email": "bruno@correo.com", "pendientes": 2 },
  { "id": 3, "nombre": "Carla Gómez", "email": "carla@correo.com", "pendientes": 0 }
]
```

Crear un cliente. Mandamos también un `id`, que la validación descarta:

```bash
curl -i -X POST http://localhost:3000/api/clientes \
  -H "Content-Type: application/json" \
  -d '{"nombre": "Diego Ruiz", "email": "diego@correo.com", "id": 500}'
```

```http
HTTP/1.1 201 Created
Location: /api/clientes/4

{"id":4,"nombre":"Diego Ruiz","email":"diego@correo.com","telefono":null,"creadoEn":"2026-10-15 19:42:05"}
```

`-i` muestra el código y los encabezados de la respuesta; acá dejamos solo los que importan. El cliente quedó con el `id` 4, el que asignó la base, y no con el 500.

Datos inválidos:

```bash
curl -X POST http://localhost:3000/api/clientes \
  -H "Content-Type: application/json" \
  -d '{"nombre": "", "email": "no-es-mail"}'
```

```json
{
  "error": "Datos inválidos",
  "detalles": { "nombre": "no puede estar vacío", "email": "no es un email válido" }
}
```

La respuesta trae todos los errores juntos, campo por campo. Un formulario puede mostrar cada mensaje junto a su campo.

Email repetido:

```bash
curl -X POST http://localhost:3000/api/clientes \
  -H "Content-Type: application/json" \
  -d '{"nombre": "Otra Ana", "email": "ana@correo.com"}'
```

```json
{
  "error": "Ya existe un registro con ese valor",
  "detalles": "SQLITE_CONSTRAINT: UNIQUE constraint failed: clientes.email"
}
```

Código 409. Pasó la validación, porque el email tiene formato correcto, y la rechazó la base.

Crear una tarea para Diego:

```bash
curl -X POST http://localhost:3000/api/clientes/4/tareas \
  -H "Content-Type: application/json" \
  -d '{"titulo": "Primera visita", "vence": "2026-10-22", "prioridad": "alta"}'
```

```json
{ "id": 6, "clienteId": 4, "titulo": "Primera visita", "vence": "2026-10-22",
  "prioridad": "alta", "completada": false }
```

Tareas pendientes de prioridad alta hasta fin de mes:

```bash
curl "http://localhost:3000/api/tareas?estado=pendiente&hasta=2026-10-31&prioridad=alta"
```

```json
[
  { "id": 4, "clienteId": 2, "titulo": "Agendar reunión", "vence": "2026-10-18",
    "prioridad": "alta", "completada": false, "cliente": { "id": 2, "nombre": "Bruno Díaz" } },
  { "id": 1, "clienteId": 1, "titulo": "Enviar presupuesto", "vence": "2026-10-20",
    "prioridad": "alta", "completada": false, "cliente": { "id": 1, "nombre": "Ana Pérez" } },
  { "id": 6, "clienteId": 4, "titulo": "Primera visita", "vence": "2026-10-22",
    "prioridad": "alta", "completada": false, "cliente": { "id": 4, "nombre": "Diego Ruiz" } }
]
```

La URL va entre comillas porque `&` tiene un significado especial en la terminal.

Un filtro mal escrito:

```bash
curl "http://localhost:3000/api/tareas?estado=raro&hasta=ayer"
```

```json
{
  "error": "Datos inválidos",
  "detalles": {
    "estado": "debe ser uno de: pendiente, completada, todas",
    "hasta": "debe ser una fecha AAAA-MM-DD"
  }
}
```

Completar una tarea:

```bash
curl -X PATCH http://localhost:3000/api/tareas/4 \
  -H "Content-Type: application/json" \
  -d '{"completada": true}'
```

```json
{ "id": 4, "clienteId": 2, "titulo": "Agendar reunión", "vence": "2026-10-18",
  "prioridad": "alta", "completada": true }
```

Borrar una tarea, y volver a intentarlo:

```bash
curl -i -X DELETE http://localhost:3000/api/tareas/5   # HTTP/1.1 204 No Content
curl -i -X DELETE http://localhost:3000/api/tareas/5   # HTTP/1.1 404 Not Found
```

El estado final es el mismo después de uno o dos intentos: la tarea no existe. Eso es lo que significa que `DELETE` sea idempotente. El código de respuesta cambia, pero la base no.

Un id inválido y una ruta inexistente:

```bash
curl http://localhost:3000/api/clientes/abc
# {"error":"El id debe ser un número entero positivo"}

curl http://localhost:3000/api/nada
# {"error":"No existe la ruta GET /api/nada"}
```

Mientras tanto, la consola del servidor muestra cada pedido:

```text
API escuchando en http://localhost:3000
GET /api/clientes → 200 (5.3 ms)
POST /api/clientes → 201 (10.6 ms)
POST /api/clientes → 400 (0.9 ms)
POST /api/clientes → 409 (1.9 ms)
POST /api/clientes/4/tareas → 201 (3.0 ms)
GET /api/tareas?estado=pendiente&hasta=2026-10-31&prioridad=alta → 200 (1.8 ms)
GET /api/tareas?estado=raro&hasta=ayer → 400 (0.9 ms)
PATCH /api/tareas/4 → 200 (2.6 ms)
DELETE /api/tareas/5 → 204 (2.5 ms)
DELETE /api/tareas/5 → 404 (1.0 ms)
GET /api/clientes/abc → 400 (0.8 ms)
GET /api/nada → 404 (1.1 ms)
```

Los pedidos rechazados por validación tardan menos de un milisegundo porque nunca llegan a la base.

### El recorrido completo de un pedido

Seguir un pedido de punta a punta muestra cómo encajan las piezas. Tomemos `PATCH /api/tareas/4` con `{"completada": true}`:

1. `registro` anota la hora de inicio y se suscribe al fin de la respuesta.
2. `cors` agrega los encabezados que autorizan al navegador.
3. `express.json()` lee el cuerpo y deja `{ completada: true }` en `req.body`.
4. El router índice ve el prefijo `/tareas` y pasa el pedido a `tareas.routes.js`.
5. `parsearId` convierte `'4'` en `4` y lo guarda en `req.id`.
6. La ruta `/:id` con `PATCH` llama a `tareas.actualizar` del controlador.
7. El controlador valida el cuerpo en modo parcial y obtiene `{ completada: true }`.
8. El servicio ejecuta el `UPDATE` con Drizzle y devuelve la tarea modificada.
9. El controlador responde con `res.json(tarea)` y código 200.
10. Se dispara `finish` y `registro` escribe la línea en la consola.

Si la tarea no existiera, en el paso 8 el servicio devolvería `undefined`. El controlador lanzaría `noEncontrado('Tarea')` y Express saltaría a `manejarErrores`, que respondería 404.

### Usar la API desde una página web

Desde una página, la API se consume con `fetch`:

```js
const respuesta = await fetch('http://localhost:3000/api/tareas/4', {
  method: 'PATCH',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify({ completada: true }),
});

if (!respuesta.ok) {
  const { error, detalles } = await respuesta.json();
  console.log(error, detalles);
} else {
  const tarea = await respuesta.json();
}
```

`fetch` no lanza error por un 400 o un 404: la petición llegó y hubo respuesta. Hay que revisar `respuesta.ok`, que es `true` para los códigos 2xx.

Hay un detalle. Por seguridad, el navegador no deja que una página lea respuestas de otro origen, es decir, de otro dominio o puerto, salvo que el servidor lo autorice. Una página servida en `http://localhost:5173`, el puerto habitual de un servidor de desarrollo de React con Vite, no puede usar una API en `http://localhost:3000` sin esa autorización.

El mecanismo se llama CORS (intercambio de recursos entre orígenes). El servidor responde con el encabezado `Access-Control-Allow-Origin` indicando qué orígenes acepta. Para métodos como `PATCH` o `DELETE`, el navegador además manda antes un pedido `OPTIONS` de consulta, y el servidor tiene que responder qué métodos permite.

El paquete `cors` resuelve las dos cosas. En `app.js` lo configuramos para aceptar solo el origen de nuestra página:

```js
app.use(cors({ origin: 'http://localhost:5173' }));
```

`curl` no aplica esta regla: es una protección del navegador. Por eso todas las pruebas anteriores funcionaron igual.

## Resumen

- una API es el contrato que un programa ofrece a otros: qué pedidos acepta y qué devuelve
- REST es un estilo para usar HTTP como fue pensado, así toda API REST se usa de la misma manera
- los datos se organizan en recursos con URL en plural, como colección y como elemento; filtros y paginado van en la cadena de consulta
- el método indica la acción: `GET` lee, `POST` crea, `PATCH` modifica en parte, `PUT` reemplaza y `DELETE` borra
- los recursos viajan como JSON y las respuestas devuelven el recurso tal como quedó
- el código de estado dice cómo terminó la operación; los errores tienen siempre la misma forma
- el servidor no guarda estado entre pedidos
- Express asocia rutas con funciones y procesa cada pedido con una cadena de middlewares, en el orden en que se registran
- un middleware con 4 parámetros maneja errores; Express 5 le envía también los errores de las funciones `async`
- el router asocia rutas con controladores, el controlador traduce entre HTTP y datos, y el servicio trabaja con la base sin saber de HTTP
- la validación rechaza datos inválidos y deja pasar solo los campos permitidos
- un error de negocio se lanza como `HttpError` y un solo middleware lo convierte en respuesta
- los errores inesperados se registran en el servidor y al cliente solo le llega un 500 genérico
