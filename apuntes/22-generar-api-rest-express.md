# Construir una API REST con Express

En este apunte vamos a construir, paso a paso, el servidor de la agenda de contactos. Al terminar vas a tener una API que permite listar, buscar, crear, modificar y borrar contactos, guardados en un archivo JSON.

No empezamos por Express. Empezamos por lo que pasa debajo: qué es un servidor, cómo viaja un pedido HTTP y cómo se responde. Después escribimos un servidor con Node solo, vemos dónde se vuelve incómodo y recién ahí sumamos Express. Cada paso agrega una sola idea y deja un servidor que funciona.

## Qué es un servidor web

Un servidor web es un programa que se queda esperando mensajes. Abre un puerto de la computadora, por ejemplo el 3000, y escucha. Cuando llega un mensaje, lo procesa y devuelve otro mensaje como respuesta.

El que envía el mensaje se llama cliente. Puede ser el navegador, una app de celular, otro servidor o un comando en la terminal. Al servidor no le importa quién es: solo le importa que el mensaje respete el protocolo HTTP.

La conversación siempre tiene la misma forma:

1. El cliente abre una conexión con el servidor.
2. El cliente envía un pedido (request).
3. El servidor procesa el pedido.
4. El servidor envía una respuesta (response).

El servidor nunca habla primero. Solo responde.

## Cómo es un mensaje HTTP

HTTP es texto con un formato fijo. Este es un pedido para crear un contacto, tal como viaja por la red:

```http
POST /contactos HTTP/1.1
Host: localhost:3000
Content-Type: application/json
Content-Length: 48

{"nombre":"Ana Díaz","telefono":"381-555-0101"}
```

Tiene 4 partes:

- la línea de pedido, con el método (`POST`), la ruta (`/contactos`) y la versión del protocolo
- los encabezados, pares `nombre: valor` con información sobre el mensaje
- una línea en blanco que separa encabezados y cuerpo
- el cuerpo, con los datos que el cliente envía

La respuesta tiene la misma estructura, pero la primera línea lleva un código de estado:

```http
HTTP/1.1 201 Created
Content-Type: application/json; charset=utf-8
Location: /contactos/3

{"id":3,"nombre":"Ana Díaz","telefono":"381-555-0101"}
```

El encabezado `Content-Type` dice en qué formato está el cuerpo. En una API casi siempre es `application/json`.

El código de estado es un número de 3 cifras que resume qué pasó. La primera cifra indica la familia:

| Familia | Significado | Ejemplos |
|---|---|---|
| 2xx | salió bien | 200 OK, 201 Created, 204 No Content |
| 3xx | el recurso está en otro lado | 301 Moved Permanently, 304 Not Modified |
| 4xx | el cliente se equivocó | 400 Bad Request, 404 Not Found, 409 Conflict |
| 5xx | el servidor falló | 500 Internal Server Error |

La distinción entre 4xx y 5xx importa. Un 4xx le dice al cliente que corrija su pedido. Un 5xx le dice que el problema es nuestro y que reintentar con el mismo pedido puede funcionar más tarde.

## Un servidor con Node solo

Node trae el módulo `http`, que alcanza para escribir un servidor. Este es el más chico posible:

```js
// servidor-minimo.js
import http from 'node:http';

const servidor = http.createServer((req, res) => {
  console.log(req.method, req.url);
  res.writeHead(200, { 'Content-Type': 'text/plain; charset=utf-8' });
  res.end('Hola desde Node');
});

servidor.listen(3000, () => {
  console.log('Escuchando en http://localhost:3000');
});
```

`createServer` recibe una función que Node ejecuta una vez por cada pedido. Esa función recibe 2 objetos:

- `req` representa el pedido: método, ruta, encabezados y cuerpo
- `res` representa la respuesta que vamos a construir

`listen(3000)` abre el puerto. El programa no termina: queda vivo esperando pedidos. Para cortarlo, usá Ctrl+C en la terminal.

Si abrís `http://localhost:3000` en el navegador, ves el texto. Si abrís `http://localhost:3000/lo-que-sea`, ves el mismo texto. El servidor responde igual a todo porque todavía no mira la ruta.

### Atender distintas rutas a mano

Para que el servidor sirva de algo tiene que decidir qué hacer según el método y la ruta. Con `http` solo, eso se escribe con `if`:

```js
// servidor-a-mano.js
import http from 'node:http';

const contactos = [
  { id: 1, nombre: 'Ana Díaz', telefono: '381-555-0101' },
];

const servidor = http.createServer(async (req, res) => {
  const url = new URL(req.url, `http://${req.headers.host}`);

  if (req.method === 'GET' && url.pathname === '/contactos') {
    res.writeHead(200, { 'Content-Type': 'application/json' });
    res.end(JSON.stringify(contactos));
    return;
  }

  const coincidencia = url.pathname.match(/^\/contactos\/(\d+)$/);
  if (req.method === 'GET' && coincidencia) {
    const contacto = contactos.find(c => c.id === Number(coincidencia[1]));
    if (!contacto) {
      res.writeHead(404, { 'Content-Type': 'application/json' });
      res.end(JSON.stringify({ error: 'Contacto inexistente' }));
      return;
    }
    res.writeHead(200, { 'Content-Type': 'application/json' });
    res.end(JSON.stringify(contacto));
    return;
  }

  if (req.method === 'POST' && url.pathname === '/contactos') {
    let texto = '';
    for await (const trozo of req) {
      texto += trozo;
    }
    const datos = JSON.parse(texto);
    const contacto = { id: contactos.length + 1, ...datos };
    contactos.push(contacto);
    res.writeHead(201, { 'Content-Type': 'application/json' });
    res.end(JSON.stringify(contacto));
    return;
  }

  res.writeHead(404, { 'Content-Type': 'application/json' });
  res.end(JSON.stringify({ error: 'Ruta inexistente' }));
});

servidor.listen(3000);
```

Funciona, pero mirá cuánto trabajo repetitivo hay:

- cada ruta es un `if` más, y el orden importa
- para sacar el `id` de la ruta usamos una expresión regular
- el cuerpo no llega entero: llega en trozos y hay que juntarlos con `for await`
- si el cliente envía un JSON mal formado, `JSON.parse` lanza una excepción y el servidor se cae
- cada respuesta repite `writeHead`, `Content-Type` y `JSON.stringify`

Con 6 operaciones sobre contactos y otras tantas sobre empresas o tareas, este archivo se vuelve inmanejable. Express existe para resolver justamente estas tareas repetitivas. No reemplaza al módulo `http`: lo usa por debajo y nos da una forma más ordenada de escribir lo mismo.

## Qué es una API REST

Antes de escribir código con Express, conviene decidir cómo se va a ver la API desde afuera. REST es un estilo para diseñar esa interfaz. No es una librería ni un protocolo: es un conjunto de convenciones sobre cómo usar HTTP.

La idea central es pensar en recursos. Un recurso es una cosa que el sistema maneja: un contacto, una empresa, una tarea. Cada recurso tiene una dirección (URL) y se opera con los métodos de HTTP.

Las URL son sustantivos. Los métodos son los verbos. Por eso no escribimos `/crearContacto` ni `/borrarContacto?id=3`. Escribimos `POST /contactos` y `DELETE /contactos/3`.

Para la agenda, la API queda así:

| Método | Ruta | Qué hace | Respuesta si sale bien |
|---|---|---|---|
| GET | `/contactos` | lista todos los contactos | 200 y un arreglo |
| GET | `/contactos?buscar=ana` | lista los que coinciden | 200 y un arreglo |
| GET | `/contactos/3` | trae el contacto 3 | 200 y un objeto |
| POST | `/contactos` | crea un contacto | 201 y el contacto creado |
| PUT | `/contactos/3` | reemplaza el contacto 3 completo | 200 y el contacto |
| PATCH | `/contactos/3` | cambia algunos campos del contacto 3 | 200 y el contacto |
| DELETE | `/contactos/3` | borra el contacto 3 | 204 sin cuerpo |

Hay 3 lugares donde el cliente puede poner información, y cada uno tiene su uso:

- la ruta identifica el recurso: `/contactos/3`
- la consulta (lo que va después del `?`) filtra, ordena o pagina: `?buscar=ana`
- el cuerpo lleva los datos para crear o modificar

### Propiedades de los métodos

Los métodos HTTP no son intercambiables. Cada uno promete algo al cliente.

Un método seguro no cambia nada en el servidor. `GET` es seguro: pedir un contacto 10 veces no modifica la agenda. Por eso un navegador o un proxy pueden repetir un `GET` sin preguntar.

Un método idempotente deja el mismo resultado si se ejecuta una o muchas veces. `PUT` y `DELETE` son idempotentes: reemplazar el contacto 3 con los mismos datos 2 veces deja lo mismo que hacerlo una vez. `POST` no lo es: enviarlo 2 veces crea 2 contactos.

Esta diferencia explica por qué `POST` crea y `PUT` reemplaza. Si una conexión se corta y el cliente no sabe si su pedido llegó, puede reintentar un `PUT` sin miedo. Un `POST` repetido puede duplicar datos.

### Sin estado

REST pide que cada pedido traiga toda la información necesaria para atenderlo. El servidor no recuerda pedidos anteriores del mismo cliente. Si hace falta saber quién es el usuario, cada pedido lo dice, por ejemplo con un encabezado de autorización.

Esto permite levantar varias copias del servidor y repartir los pedidos entre ellas: cualquier copia puede atender cualquier pedido.

### JSON como formato

El recurso vive en el servidor de la forma que el servidor quiera: en memoria, en un archivo o en una base de datos. Lo que viaja es una representación del recurso. En nuestra API esa representación es JSON:

```json
{
  "id": 3,
  "nombre": "Ana Díaz",
  "telefono": "381-555-0101",
  "email": "ana@mail.com"
}
```

## Preparar el proyecto

Creá una carpeta e iniciá un proyecto de Node:

```bash
mkdir agenda-api
cd agenda-api
npm init -y
npm pkg set type=module
npm install express
```

`npm pkg set type=module` agrega `"type": "module"` al `package.json`. Eso habilita la sintaxis `import` y `export` en los archivos `.js`.

`npm install express` instala la versión 5, que es la actual. Algunos tutoriales en internet usan la versión 4. Las diferencias que nos afectan las vamos a marcar cuando aparezcan.

Agregá 2 scripts al `package.json`:

```json
{
  "type": "module",
  "scripts": {
    "dev": "node --watch src/servidor.js",
    "start": "node src/servidor.js"
  },
  "dependencies": {
    "express": "^5.2.1"
  }
}
```

`node --watch` reinicia el servidor cada vez que guardás un archivo. Durante el desarrollo usás `npm run dev`. En producción, `npm start`.

## El primer servidor con Express

Creá `src/servidor.js`:

```js
// src/servidor.js
import express from 'express';

const app = express();

app.get('/', (req, res) => {
  res.send('Hola desde Express');
});

app.listen(3000, () => {
  console.log('API escuchando en http://localhost:3000');
});
```

`express()` crea una aplicación. La aplicación es un objeto donde registramos qué hacer con cada pedido.

`app.get('/', ...)` registra una ruta. Se lee así: cuando llegue un `GET` a `/`, ejecutá esta función. A la función que atiende una ruta la llamamos manejador.

Hay un método por cada verbo HTTP: `app.get`, `app.post`, `app.put`, `app.patch` y `app.delete`. Si llega un pedido que no coincide con ninguna ruta registrada, Express responde 404 por su cuenta.

`req` y `res` son los mismos objetos del módulo `http`, ampliados con métodos más cómodos. `res.send` arma la respuesta completa: pone el código 200, elige el `Content-Type` según lo que le pases y cierra la respuesta.

## Responder JSON

Para una API, el método que más vas a usar es `res.json`. Convierte el valor a texto JSON y pone el encabezado correcto:

```js
// src/servidor.js
import express from 'express';

const app = express();

const contactos = [
  { id: 1, nombre: 'Ana Díaz', telefono: '381-555-0101' },
  { id: 2, nombre: 'Bruno Paz', telefono: '381-555-0202' },
];

app.get('/contactos', (req, res) => {
  res.json(contactos);
});

app.listen(3000, () => {
  console.log('API escuchando en http://localhost:3000');
});
```

Por ahora los contactos viven en un arreglo en memoria. Cada vez que el servidor se reinicia, vuelven a ser los 2 del principio. Más adelante los vamos a guardar en un archivo.

Para cambiar el código de estado, se encadena `res.status` antes de responder:

```js
res.status(201).json(contacto);
res.status(404).json({ error: 'Contacto inexistente' });
res.status(204).end();
```

`status` no envía nada: solo anota el código. La respuesta sale recién con `json`, `send` o `end`. Una respuesta se envía una sola vez. Si llamás 2 veces a `res.json` en el mismo pedido, Express lanza un error.

## Leer la ruta con parámetros

Para traer un contacto por su identificador, la ruta lleva una parte variable. En Express se marca con dos puntos:

```js
app.get('/contactos/:id', (req, res) => {
  const id = Number(req.params.id);
  const contacto = contactos.find(c => c.id === id);

  if (!contacto) {
    return res.status(404).json({ error: 'Contacto inexistente' });
  }
  res.json(contacto);
});
```

`:id` captura cualquier valor en esa posición de la ruta. Express lo guarda en `req.params.id`. Para `/contactos/2`, `req.params.id` vale `'2'`.

Fijate que el valor es un texto, no un número. Todo lo que llega por HTTP es texto. Por eso lo convertimos con `Number` antes de compararlo con `c.id`. Si comparás `'2' === 2`, el resultado es `false` y el contacto nunca aparece.

El `return` antes de `res.status(404)` corta la función. Sin él, el código seguiría y llegaría a `res.json(contacto)`, que intentaría responder por segunda vez.

## Leer la consulta

Lo que va después del `?` llega en `req.query`, ya separado en un objeto:

```js
app.get('/contactos', (req, res) => {
  const { buscar } = req.query;

  if (typeof buscar !== 'string') {
    return res.json(contactos);
  }

  const texto = buscar.toLowerCase();
  const encontrados = contactos.filter(c =>
    c.nombre.toLowerCase().includes(texto)
  );
  res.json(encontrados);
});
```

Para `/contactos?buscar=ana`, `req.query.buscar` vale `'ana'`. Si el parámetro no está, vale `undefined`.

Preguntamos por `typeof buscar !== 'string'` y no solo por `!buscar` por una razón. Si el cliente escribe `?buscar=a&buscar=b`, Express arma un arreglo `['a', 'b']`, y un arreglo no tiene `toLowerCase`. Nunca supongas la forma de lo que manda el cliente.

## Leer el cuerpo

Para crear un contacto, el cliente envía los datos en el cuerpo. Acá aparece la primera pieza que Express no hace sola: hay que pedirle que interprete el JSON del cuerpo.

```js
app.use(express.json());
```

Esta línea va antes de las rutas. A partir de ahí, cuando llega un pedido con `Content-Type: application/json`, Express junta los trozos del cuerpo, lo interpreta y deja el resultado en `req.body`. Es exactamente lo que hacíamos a mano con `for await` y `JSON.parse`.

Ahora podemos crear contactos:

```js
let siguienteId = 3;

app.post('/contactos', (req, res) => {
  const contacto = { id: siguienteId++, ...req.body };
  contactos.push(contacto);
  res.status(201).location(`/contactos/${contacto.id}`).json(contacto);
});
```

Respondemos 201, que significa creado. El encabezado `Location` le dice al cliente dónde quedó el recurso nuevo.

Esta versión tiene 2 problemas graves. El primero: si el cliente envía `{"id": 99, "nombre": "Ana"}`, el `...req.body` pisa el `id` que generamos. El segundo: acepta cualquier cosa, incluso un contacto sin nombre. Los vamos a resolver con validación.

Un detalle de Express 5: si el pedido no trae cuerpo o no tiene `Content-Type: application/json`, `req.body` vale `undefined`. En Express 4 valía `{}`. Tenelo en cuenta si copiás código de un tutorial viejo.

## Reemplazar, modificar y borrar

Con lo que ya vimos alcanza para completar las operaciones:

```js
app.put('/contactos/:id', (req, res) => {
  const id = Number(req.params.id);
  const indice = contactos.findIndex(c => c.id === id);
  if (indice === -1) {
    return res.status(404).json({ error: 'Contacto inexistente' });
  }
  contactos[indice] = { id, ...req.body };
  res.json(contactos[indice]);
});

app.patch('/contactos/:id', (req, res) => {
  const id = Number(req.params.id);
  const contacto = contactos.find(c => c.id === id);
  if (!contacto) {
    return res.status(404).json({ error: 'Contacto inexistente' });
  }
  Object.assign(contacto, req.body, { id });
  res.json(contacto);
});

app.delete('/contactos/:id', (req, res) => {
  const id = Number(req.params.id);
  const indice = contactos.findIndex(c => c.id === id);
  if (indice === -1) {
    return res.status(404).json({ error: 'Contacto inexistente' });
  }
  contactos.splice(indice, 1);
  res.status(204).end();
});
```

La diferencia entre `PUT` y `PATCH` está en qué pasa con los campos que el cliente no envía.

`PUT` reemplaza el recurso completo. Si el contacto tenía teléfono y el cliente envía solo `{"nombre": "Ana D."}`, el teléfono desaparece. El cliente está diciendo: así tiene que quedar el contacto.

`PATCH` modifica solo lo que viene. Con el mismo cuerpo, cambia el nombre y el teléfono queda como estaba. El cliente está diciendo: cambiá esto.

`DELETE` responde 204, que significa que salió bien y no hay nada que devolver. Una respuesta 204 no lleva cuerpo, por eso usamos `end` y no `json`.

En los 3 casos ponemos `id` al final del objeto. Así el valor de la ruta gana sobre cualquier `id` que venga en el cuerpo.

## Middleware, la idea central de Express

Hasta acá usamos `app.use(express.json())` sin explicar qué es. Es un middleware, y entender este concepto es entender Express.

Un middleware es una función que recibe 3 parámetros: `req`, `res` y `next`. Express organiza todos los middleware y manejadores en una cadena, en el orden en que los registraste. Cada pedido recorre la cadena desde el principio.

Cuando le toca su turno, cada función puede hacer una de 2 cosas:

- responder con `res.json`, `res.send` o `res.end`, y la cadena termina ahí
- llamar a `next()`, y el pedido pasa a la siguiente función

Si una función no responde ni llama a `next`, el pedido queda colgado. El cliente espera hasta que se agota el tiempo.

```text
pedido → registrarPedidos → express.json → rutas de contactos → 404 → respuesta
              next()            next()         responde
```

Los manejadores de rutas que escribimos son middleware que nunca llaman a `next`: siempre responden. `express.json` es un middleware que nunca responde: lee el cuerpo, completa `req.body` y llama a `next`.

### Un middleware propio para registrar pedidos

Escribamos uno que muestre en la terminal cada pedido, con su código de estado y cuánto tardó:

```js
function registrarPedidos(req, res, next) {
  const inicio = Date.now();
  res.on('finish', () => {
    const duracion = Date.now() - inicio;
    console.log(`${req.method} ${req.originalUrl} → ${res.statusCode} (${duracion} ms)`);
  });
  next();
}

app.use(registrarPedidos);
```

`app.use` sin ruta registra el middleware para todos los pedidos. El código de estado todavía no se conoce cuando el pedido pasa por acá, porque la respuesta se arma más adelante en la cadena. Por eso nos suscribimos al evento `finish`, que `res` emite cuando la respuesta terminó de enviarse.

La salida se ve así:

```text
POST /contactos → 201 (13 ms)
GET /contactos?buscar=an → 200 (7 ms)
GET /contactos/50 → 404 (8 ms)
```

### El orden importa

Como la cadena se recorre en orden, dónde registrás cada middleware cambia el resultado. Si ponés `express.json()` después de las rutas, cuando el pedido llega a `app.post('/contactos')` el cuerpo todavía no se leyó y `req.body` vale `undefined`.

La regla práctica es esta:

1. Primero los middleware que preparan el pedido: registro, lectura del cuerpo.
2. Después las rutas.
3. Después el manejador de rutas inexistentes.
4. Al final, el manejador de errores.

### Middleware para una ruta sola

Un middleware también puede aplicarse a una ruta puntual. Se pasa entre la ruta y el manejador:

```js
function cargarContacto(req, res, next) {
  const contacto = contactos.find(c => c.id === Number(req.params.id));
  if (!contacto) {
    return res.status(404).json({ error: 'Contacto inexistente' });
  }
  req.contacto = contacto;
  next();
}

app.get('/contactos/:id', cargarContacto, (req, res) => {
  res.json(req.contacto);
});
```

`cargarContacto` busca el contacto y lo deja colgado de `req` para que lo use la función siguiente. Si no existe, responde 404 y la cadena se corta. El manejador queda en una línea porque ya no se ocupa de buscar.

## Manejar errores en un solo lugar

Revisá las rutas que escribimos: cada una repite la misma respuesta 404. Y si algo falla de forma inesperada, por ejemplo si no se puede leer un archivo, no tenemos ningún plan.

Express tiene un tipo especial de middleware para los errores. Se distingue porque recibe 4 parámetros en lugar de 3:

```js
function manejarErrores(err, req, res, next) {
  const status = err.status ?? 500;
  if (status >= 500) {
    console.error(err);
    return res.status(status).json({ error: 'Error interno del servidor' });
  }
  res.status(status).json({ error: err.message, detalles: err.detalles });
}
```

Cuando un manejador lanza una excepción, Express deja de recorrer la cadena normal y salta directo al primer middleware de errores. Ahí decidimos qué responder.

Express necesita ver los 4 parámetros para reconocer la función como manejador de errores. Aunque no uses `next`, tiene que estar en la firma.

Para los errores 500 escribimos el detalle en la terminal, pero al cliente le mandamos un mensaje genérico. El mensaje interno puede revelar rutas de archivos o detalles de la implementación que no le corresponden al cliente.

### Errores con código de estado

Para lanzar errores que ya traigan su código, creamos una clase propia:

```js
// src/errores.js
export class ErrorHttp extends Error {
  constructor(status, mensaje, detalles) {
    super(mensaje);
    this.status = status;
    this.detalles = detalles;
  }
}
```

Ahora un manejador puede escribir `throw new ErrorHttp(404, 'Contacto inexistente')` y olvidarse de cómo se arma la respuesta.

### Errores en funciones asíncronas

Cuando las rutas lean archivos o consulten una base de datos, los manejadores van a ser funciones `async`. En Express 5, si una función `async` lanza un error, Express lo atrapa y lo envía al manejador de errores. No hace falta escribir `try` y `catch` en cada ruta.

```js
app.get('/contactos/:id', async (req, res) => {
  const contacto = await repositorio.obtener(Number(req.params.id));
  if (!contacto) throw new ErrorHttp(404, 'Contacto inexistente');
  res.json(contacto);
});
```

Esta es la diferencia más importante con Express 4. En la versión 4, un error dentro de una función `async` no llegaba al manejador de errores: el pedido quedaba colgado. Por eso los tutoriales viejos envuelven cada ruta en `try` y `catch` y llaman a `next(error)`.

### JSON mal formado

Si el cliente envía un cuerpo que no es JSON válido, `express.json()` no puede interpretarlo. En ese caso genera un error con `status` 400 y lo pasa al manejador de errores. Nuestro manejador ya lo responde bien porque lee `err.status`.

El mensaje que trae ese error está en inglés y es técnico. Podemos reconocerlo por su propiedad `type` y reemplazarlo:

```js
function manejarErrores(err, req, res, next) {
  if (err.type === 'entity.parse.failed') {
    return res.status(400).json({ error: 'El cuerpo no es un JSON válido' });
  }
  const status = err.status ?? 500;
  if (status >= 500) {
    console.error(err);
    return res.status(status).json({ error: 'Error interno del servidor' });
  }
  res.status(status).json({ error: err.message, detalles: err.detalles });
}
```

### Rutas inexistentes

Express responde 404 por su cuenta cuando ninguna ruta coincide, pero lo hace con una página HTML. Una API debería responder siempre JSON. Lo resolvemos con un middleware al final de la cadena, antes del manejador de errores:

```js
function rutaInexistente(req, res) {
  res.status(404).json({ error: `No existe ${req.method} ${req.originalUrl}` });
}
```

Si un pedido llegó hasta acá, es porque ninguna ruta anterior lo respondió.

## Validar lo que envía el cliente

El servidor no puede confiar en nada de lo que llega. El cliente puede ser nuestro frontend, pero también puede ser cualquier persona con una terminal. Validar significa revisar cada dato antes de usarlo.

Nuestras reglas para un contacto son estas:

- el cuerpo tiene que ser un objeto, no un arreglo ni un valor suelto
- `nombre` es obligatorio y tiene que ser un texto no vacío
- `telefono` es opcional y, si viene, tiene que ser un texto
- `email` es opcional y, si viene, tiene que tener formato de correo
- cualquier otro campo, incluido `id`, se ignora

```js
// src/contactos.validacion.js
import { ErrorHttp } from './errores.js';

const FORMATO_EMAIL = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

export function validarContacto(datos, { parcial = false } = {}) {
  if (typeof datos !== 'object' || datos === null || Array.isArray(datos)) {
    throw new ErrorHttp(400, 'El cuerpo debe ser un objeto JSON');
  }

  const errores = [];
  const limpio = {};

  if (!parcial || 'nombre' in datos) {
    if (typeof datos.nombre !== 'string' || datos.nombre.trim() === '') {
      errores.push('nombre: es obligatorio y debe ser un texto no vacío');
    } else {
      limpio.nombre = datos.nombre.trim();
    }
  }

  if ('telefono' in datos) {
    if (typeof datos.telefono !== 'string') {
      errores.push('telefono: debe ser un texto');
    } else {
      limpio.telefono = datos.telefono.trim();
    }
  }

  if ('email' in datos) {
    if (typeof datos.email !== 'string' || !FORMATO_EMAIL.test(datos.email)) {
      errores.push('email: no tiene un formato válido');
    } else {
      limpio.email = datos.email.trim().toLowerCase();
    }
  }

  if (errores.length > 0) {
    throw new ErrorHttp(400, 'Datos inválidos', errores);
  }
  return limpio;
}
```

La función hace 3 cosas a la vez.

Primero, revisa. Junta todos los errores antes de lanzar, en lugar de cortar en el primero. Así el cliente se entera de todo lo que tiene que corregir en una sola respuesta.

Segundo, limpia. Saca espacios sobrantes y pasa el correo a minúsculas. Lo que se guarda queda uniforme.

Tercero, filtra. Devuelve un objeto nuevo, `limpio`, que solo tiene los campos que conocemos. Si el cliente envió `id` o `esAdmin`, esos campos no pasan. Esto cierra el problema que vimos con el `POST`: el `id` ya no se puede pisar desde afuera.

La opción `parcial` sirve para `PATCH`. En una modificación parcial el nombre no es obligatorio, pero si viene, tiene que ser válido.

La respuesta a un pedido inválido queda así:

```json
{
  "error": "Datos inválidos",
  "detalles": [
    "nombre: es obligatorio y debe ser un texto no vacío",
    "email: no tiene un formato válido"
  ]
}
```

La validación también cubre `req.body` igual a `undefined`, el caso de un pedido sin cuerpo: `typeof undefined` no es `'object'`.

## Guardar los contactos en un archivo

Con el arreglo en memoria, todo se pierde al reiniciar el servidor. El paso siguiente es guardar los contactos en un archivo JSON.

No vamos a escribir código de archivos dentro de las rutas. Vamos a separarlo en un módulo propio, que llamamos repositorio. Las rutas le piden cosas al repositorio, como listar, obtener o crear, y no saben cómo se guardan los datos. Si mañana cambiamos el archivo por una base de datos, reescribimos el repositorio y las rutas no se tocan.

```js
// src/contactos.repositorio.js
import { readFile, writeFile, mkdir } from 'node:fs/promises';

const CARPETA = new URL('../datos/', import.meta.url);
const ARCHIVO = new URL('contactos.json', CARPETA);

async function leerTodos() {
  try {
    const texto = await readFile(ARCHIVO, 'utf-8');
    return JSON.parse(texto);
  } catch (error) {
    if (error.code === 'ENOENT') return [];
    throw error;
  }
}

async function guardarTodos(contactos) {
  await mkdir(CARPETA, { recursive: true });
  await writeFile(ARCHIVO, JSON.stringify(contactos, null, 2));
}

export async function listar() {
  return leerTodos();
}

export async function obtener(id) {
  const contactos = await leerTodos();
  return contactos.find(c => c.id === id) ?? null;
}

export async function crear(datos) {
  const contactos = await leerTodos();
  const id = contactos.reduce((maximo, c) => Math.max(maximo, c.id), 0) + 1;
  const contacto = { id, ...datos };
  contactos.push(contacto);
  await guardarTodos(contactos);
  return contacto;
}

export async function reemplazar(id, datos) {
  const contactos = await leerTodos();
  const indice = contactos.findIndex(c => c.id === id);
  if (indice === -1) return null;
  contactos[indice] = { id, ...datos };
  await guardarTodos(contactos);
  return contactos[indice];
}

export async function modificar(id, cambios) {
  const contactos = await leerTodos();
  const indice = contactos.findIndex(c => c.id === id);
  if (indice === -1) return null;
  contactos[indice] = { ...contactos[indice], ...cambios, id };
  await guardarTodos(contactos);
  return contactos[indice];
}

export async function borrar(id) {
  const contactos = await leerTodos();
  const restantes = contactos.filter(c => c.id !== id);
  if (restantes.length === contactos.length) return false;
  await guardarTodos(restantes);
  return true;
}
```

Algunos detalles de este módulo:

- `new URL('../datos/', import.meta.url)` arma la ruta relativa al archivo del módulo, no a la carpeta desde donde se ejecuta `node`, así el servidor encuentra los datos aunque lo arranques desde otro lado
- si el archivo no existe todavía, `readFile` falla con el código `ENOENT` y lo tratamos como una agenda vacía; cualquier otro error se relanza
- `mkdir` con `recursive: true` crea la carpeta si falta y no hace nada si ya existe
- el nuevo `id` es el mayor existente más uno; contar los elementos no sirve porque, después de borrar, se repetirían identificadores
- el repositorio devuelve `null` o `false` cuando no encuentra algo, y la ruta decide si eso es un 404

Este enfoque tiene un límite que conviene conocer. Si llegan 2 pedidos de creación casi al mismo tiempo, los 2 pueden leer el archivo antes de que el otro escriba, y uno de los contactos se pierde. Para una agenda de práctica no es un problema. Para un sistema real es una de las razones por las que existen las bases de datos: resuelven estos accesos simultáneos.

## Ordenar el proyecto con Router

Con todo junto en `servidor.js`, el archivo crece sin control. Express ofrece `Router`, que es una mini aplicación con sus propias rutas. Agrupamos todas las rutas de contactos en un router y lo montamos en `/contactos`.

```js
// src/contactos.rutas.js
import { Router } from 'express';
import * as repositorio from './contactos.repositorio.js';
import { validarContacto } from './contactos.validacion.js';
import { ErrorHttp } from './errores.js';

export const rutasContactos = Router();

function leerId(req) {
  const id = Number(req.params.id);
  if (!Number.isInteger(id) || id <= 0) {
    throw new ErrorHttp(400, 'El id debe ser un entero positivo');
  }
  return id;
}

rutasContactos.get('/', async (req, res) => {
  let contactos = await repositorio.listar();
  const { buscar } = req.query;
  if (typeof buscar === 'string') {
    const texto = buscar.toLowerCase();
    contactos = contactos.filter(c => c.nombre.toLowerCase().includes(texto));
  }
  res.json(contactos);
});

rutasContactos.get('/:id', async (req, res) => {
  const contacto = await repositorio.obtener(leerId(req));
  if (!contacto) throw new ErrorHttp(404, 'Contacto inexistente');
  res.json(contacto);
});

rutasContactos.post('/', async (req, res) => {
  const datos = validarContacto(req.body);
  const contacto = await repositorio.crear(datos);
  res.status(201).location(`/contactos/${contacto.id}`).json(contacto);
});

rutasContactos.put('/:id', async (req, res) => {
  const id = leerId(req);
  const datos = validarContacto(req.body);
  const contacto = await repositorio.reemplazar(id, datos);
  if (!contacto) throw new ErrorHttp(404, 'Contacto inexistente');
  res.json(contacto);
});

rutasContactos.patch('/:id', async (req, res) => {
  const id = leerId(req);
  const cambios = validarContacto(req.body, { parcial: true });
  const contacto = await repositorio.modificar(id, cambios);
  if (!contacto) throw new ErrorHttp(404, 'Contacto inexistente');
  res.json(contacto);
});

rutasContactos.delete('/:id', async (req, res) => {
  const borrado = await repositorio.borrar(leerId(req));
  if (!borrado) throw new ErrorHttp(404, 'Contacto inexistente');
  res.status(204).end();
});
```

Dentro del router las rutas son relativas: `'/'` y `'/:id'`. El prefijo `/contactos` se pone una sola vez, al montarlo.

`leerId` resuelve un caso que antes ignorábamos. Para `/contactos/abc`, `Number('abc')` da `NaN`, la búsqueda no encuentra nada y respondíamos 404. Pero el problema no es que el contacto no exista: es que el pedido está mal armado. Eso es un 400.

Cada manejador quedó en 3 o 4 líneas, todas con la misma forma:

1. Leer y validar lo que mandó el cliente.
2. Pedirle al repositorio que haga el trabajo.
3. Responder.

Los errores no se manejan acá. Se lanzan, y el manejador de errores se ocupa.

### Los middleware en su propio archivo

```js
// src/middlewares.js
export function registrarPedidos(req, res, next) {
  const inicio = Date.now();
  res.on('finish', () => {
    const duracion = Date.now() - inicio;
    console.log(`${req.method} ${req.originalUrl} → ${res.statusCode} (${duracion} ms)`);
  });
  next();
}

export function rutaInexistente(req, res) {
  res.status(404).json({ error: `No existe ${req.method} ${req.originalUrl}` });
}

export function manejarErrores(err, req, res, next) {
  if (err.type === 'entity.parse.failed') {
    return res.status(400).json({ error: 'El cuerpo no es un JSON válido' });
  }
  const status = err.status ?? 500;
  if (status >= 500) {
    console.error(err);
    return res.status(status).json({ error: 'Error interno del servidor' });
  }
  res.status(status).json({ error: err.message, detalles: err.detalles });
}
```

### Separar la aplicación del arranque

Dividimos el antiguo `servidor.js` en 2 archivos. `app.js` arma la aplicación: registra middleware y rutas. `servidor.js` solo la pone a escuchar.

```js
// src/app.js
import express from 'express';
import { rutasContactos } from './contactos.rutas.js';
import { registrarPedidos, rutaInexistente, manejarErrores } from './middlewares.js';

export const app = express();

app.use(registrarPedidos);
app.use(express.json());

app.use('/contactos', rutasContactos);

app.use(rutaInexistente);
app.use(manejarErrores);
```

```js
// src/servidor.js
import { app } from './app.js';

const PUERTO = process.env.PUERTO ?? 3000;

app.listen(PUERTO, () => {
  console.log(`API escuchando en http://localhost:${PUERTO}`);
});
```

La separación tiene 2 ventajas. En `app.js` se lee de arriba abajo el recorrido completo de un pedido. Y una prueba automática puede importar `app` y enviarle pedidos sin abrir un puerto.

`process.env.PUERTO` permite elegir el puerto desde afuera, sin tocar el código. Por ejemplo: `PUERTO=8080 npm start`.

### La estructura final

```text
agenda-api/
├── package.json
├── datos/
│   └── contactos.json          se crea solo con el primer contacto
└── src/
    ├── servidor.js             arranca la aplicación
    ├── app.js                  arma la cadena de middleware y rutas
    ├── middlewares.js          registro, 404 y errores
    ├── errores.js              la clase ErrorHttp
    ├── contactos.rutas.js      qué responde cada pedido
    ├── contactos.validacion.js qué datos se aceptan
    └── contactos.repositorio.js cómo se guardan los datos
```

Cada archivo responde a una sola pregunta. Cuando haya que sumar empresas o tareas al mini CRM, se agregan sus 3 archivos (rutas, validación y repositorio) y una línea `app.use` en `app.js`.

## Probar la API

El navegador solo sirve para probar pedidos `GET`. Para el resto necesitamos otra herramienta.

### Con curl

`curl` viene instalado en Linux, macOS y Windows 10 en adelante. La opción `-i` muestra también la línea de estado y los encabezados de la respuesta.

```bash
# Crear
curl -i -X POST http://localhost:3000/contactos \
  -H "Content-Type: application/json" \
  -d '{"nombre":"Ana Díaz","telefono":"381-555-0101"}'

# Listar y buscar
curl http://localhost:3000/contactos
curl "http://localhost:3000/contactos?buscar=ana"

# Traer uno
curl http://localhost:3000/contactos/1

# Modificar el correo
curl -X PATCH http://localhost:3000/contactos/1 \
  -H "Content-Type: application/json" \
  -d '{"email":"ana@mail.com"}'

# Borrar
curl -i -X DELETE http://localhost:3000/contactos/1
```

Si olvidás el encabezado `Content-Type`, `express.json()` no lee el cuerpo, `req.body` queda `undefined` y la validación responde que el cuerpo debe ser un objeto JSON. Es el error más común al probar a mano.

En la terminal de Windows (PowerShell), las comillas simples dentro de `-d` se comportan distinto. Lo más simple es usar la extensión que sigue.

### Con un archivo .http

La extensión REST Client de Visual Studio Code permite escribir pedidos en un archivo `.http` y enviarlos con un clic. El archivo queda en el proyecto como documentación ejecutable de la API.

```http
### Listar
GET http://localhost:3000/contactos

### Crear
POST http://localhost:3000/contactos
Content-Type: application/json

{
  "nombre": "Ana Díaz",
  "telefono": "381-555-0101"
}

### Crear con datos inválidos
POST http://localhost:3000/contactos
Content-Type: application/json

{
  "email": "sin-arroba"
}

### Reemplazar
PUT http://localhost:3000/contactos/1
Content-Type: application/json

{
  "nombre": "Ana D."
}

### Borrar
DELETE http://localhost:3000/contactos/1
```

Fijate que el formato es el mismo mensaje HTTP que vimos al principio: línea de pedido, encabezados, línea en blanco y cuerpo.

### Desde JavaScript con fetch

Así es como un frontend va a usar la API. Podés probarlo en un script de Node, que tiene `fetch` incorporado:

```js
// probar.js
const BASE = 'http://localhost:3000';

const respuesta = await fetch(`${BASE}/contactos`, {
  method: 'POST',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify({ nombre: 'Carla Ruiz', telefono: '381-555-0303' }),
});

console.log(respuesta.status);
console.log(respuesta.headers.get('Location'));
console.log(await respuesta.json());
```

`fetch` no lanza una excepción cuando la respuesta es 404 o 400. Solo falla si no pudo conectarse. Para saber si salió bien hay que mirar `respuesta.ok`, que es `true` para los códigos 2xx, o `respuesta.status`.

## Conectar un frontend en otro origen

Cuando el frontend corre en otro puerto, por ejemplo en `http://localhost:5173`, el navegador bloquea las respuestas de la API. No es un error del servidor: es una regla de seguridad del navegador llamada política del mismo origen.

Un origen es la combinación de protocolo, dominio y puerto. `http://localhost:5173` y `http://localhost:3000` son orígenes distintos. Por defecto, una página no puede leer respuestas de otro origen.

Para permitirlo, el servidor tiene que responder con el encabezado `Access-Control-Allow-Origin`, que dice qué orígenes pueden leer sus respuestas. Este mecanismo se llama CORS. Además, antes de un `POST` con JSON, el navegador envía un pedido previo con el método `OPTIONS` para preguntar si está permitido.

El paquete `cors` resuelve las 2 cosas:

```bash
npm install cors
```

```js
// src/app.js
import cors from 'cors';

app.use(cors({ origin: 'http://localhost:5173' }));
```

Va al principio de la cadena, antes de las rutas. Indicá el origen exacto de tu frontend. Usar `cors()` sin opciones permite cualquier origen, lo que está bien para probar pero no para producción.

`curl` y los scripts de Node no aplican esta política. Por eso una API puede funcionar perfecto con `curl` y fallar desde el navegador.

Si el frontend se sirve desde el mismo servidor Express, no hay 2 orígenes y CORS no hace falta. Express puede entregar los archivos de una carpeta con `app.use(express.static('public'))`.

## Resumen del recorrido

Un servidor web escucha en un puerto y responde pedidos HTTP. Un pedido tiene método, ruta, encabezados y cuerpo. Una respuesta tiene código de estado, encabezados y cuerpo.

REST organiza la API alrededor de recursos. Las URL nombran los recursos, los métodos dicen qué hacer con ellos y los códigos de estado dicen cómo salió.

Express ordena el trabajo en una cadena de funciones. Las rutas se registran por método y camino. Los parámetros llegan en `req.params`, la consulta en `req.query` y el cuerpo en `req.body`, siempre como texto o como datos sin validar.

Los middleware preparan el pedido o lo responden, y el orden en que se registran define el comportamiento. Los errores se lanzan desde cualquier lugar y se responden en uno solo.

El código final separa 3 responsabilidades: las rutas deciden qué responder, la validación decide qué se acepta y el repositorio decide cómo se guarda. Esa separación es la que nos va a permitir, más adelante, cambiar el archivo JSON por una base de datos sin reescribir la API.
