# Cómo consumir una API REST

Una aplicación web casi nunca trabaja sola. Pide datos a otros programas y les envía datos: el clima, los usuarios, los pagos, un modelo de IA. Esa conversación entre programas ocurre a través de una API, y en la web casi siempre viaja sobre HTTP.

En este apunte vamos a construir la idea desde abajo:

1. Qué es HTTP y cómo son sus mensajes.
2. Qué es una API REST y cómo se organiza.
3. Qué dicen los códigos de estado.
4. Por qué JSON es el formato de intercambio.
5. Cómo probar una API a mano con REST Client en VS Code.
6. Cómo hacer lo mismo desde la terminal con cURL.
7. Cómo consumirla desde JavaScript con `fetch` y `async/await`.
8. Cómo armar una app de terminal con Ink que consulta el clima.

---

## 1. El protocolo HTTP

HTTP (HyperText Transfer Protocol) es un acuerdo sobre cómo se hablan dos programas. Uno pregunta y el otro responde. El que pregunta es el cliente. El que responde es el servidor.

El navegador es un cliente HTTP. También lo son `curl`, la extensión REST Client y la función `fetch` de JavaScript. Todos hablan el mismo idioma, así que el servidor no sabe ni le importa quién le pregunta.

### Pedido y respuesta

Toda conversación HTTP tiene la misma forma:

1. El cliente envía un pedido (request).
2. El servidor lo procesa.
3. El servidor devuelve una respuesta (response).
4. La conversación termina.

No hay otra forma de iniciar una charla. El servidor nunca le habla al cliente por su cuenta: solo responde.

### HTTP no tiene memoria

HTTP es un protocolo sin estado (stateless). Cada pedido es independiente. El servidor no recuerda el pedido anterior.

Si el servidor necesita saber quién sos, cada pedido tiene que decirlo. Por eso existen las cookies y los tokens de autenticación: son datos que el cliente vuelve a enviar en cada pedido.

### La dirección: la URL

Cada pedido apunta a una URL. La URL dice qué recurso querés y dónde está.

```
https://api.ejemplo.com:443/usuarios/7?campos=nombre,email#perfil
└─┬─┘   └──────┬──────┘ └┬┘└───┬─────┘└────────┬─────────┘└──┬──┘
esquema        host   puerto  ruta         query (consulta)  fragmento
```

Cada parte cumple una función:

- esquema: el protocolo; `https` es HTTP cifrado
- host: el nombre del servidor
- puerto: la "puerta" del servidor; si no se escribe, vale 80 para `http` y 443 para `https`
- ruta: qué recurso pedís dentro del servidor
- query: parámetros extra en forma `clave=valor`, separados por `&`
- fragmento: una marca para el navegador; nunca viaja al servidor

### Cómo es un pedido por dentro

Un mensaje HTTP es texto con una estructura fija. Este es un pedido real, tal como viaja:

```http
GET /users/1 HTTP/1.1
Host: jsonplaceholder.typicode.com
Accept: application/json
User-Agent: curl/8.5.0

```

Tiene cuatro partes:

1. La línea de pedido: método (`GET`), ruta (`/users/1`) y versión del protocolo (`HTTP/1.1`).
2. Las cabeceras (headers): una por línea, en forma `Nombre: valor`.
3. Una línea vacía que marca el fin de las cabeceras.
4. El cuerpo (body), opcional. Un `GET` no lleva cuerpo.

Un pedido que envía datos sí lleva cuerpo:

```http
POST /users HTTP/1.1
Host: jsonplaceholder.typicode.com
Content-Type: application/json
Content-Length: 47

{"name": "Ana Pérez", "email": "ana@mail.com"}
```

La cabecera `Content-Type` le avisa al servidor en qué formato viene el cuerpo. Sin ella, el servidor no sabe cómo leerlo.

### Cómo es una respuesta por dentro

La respuesta tiene la misma estructura. Solo cambia la primera línea:

```http
HTTP/1.1 200 OK
Content-Type: application/json; charset=utf-8
Content-Length: 509
Cache-Control: max-age=43200

{
  "id": 1,
  "name": "Leanne Graham",
  "email": "Sincere@april.biz"
}
```

La línea de estado tiene la versión, el código de estado (`200`) y un texto descriptivo (`OK`). El código es para el programa; el texto es para las personas.

### Cabeceras frecuentes

Las cabeceras son metadatos: información sobre el mensaje, no el mensaje en sí.

| Cabecera | Va en | Para qué sirve |
|---|---|---|
| `Host` | pedido | a qué servidor va el pedido; es obligatoria |
| `Accept` | pedido | qué formato de respuesta acepta el cliente |
| `Content-Type` | ambos | en qué formato está el cuerpo |
| `Content-Length` | ambos | cuántos bytes tiene el cuerpo |
| `Authorization` | pedido | credenciales, por ejemplo `Bearer <token>` |
| `User-Agent` | pedido | qué programa hace el pedido |
| `Location` | respuesta | la URL del recurso recién creado o de una redirección |
| `Cache-Control` | respuesta | cuánto tiempo se puede reutilizar la respuesta |

Los nombres de cabecera no distinguen mayúsculas de minúsculas. `content-type` y `Content-Type` son la misma cabecera.

### Versiones de HTTP

HTTP/1.1 manda los mensajes como texto, uno tras otro. HTTP/2 y HTTP/3 los empaquetan en binario y envían varios a la vez por la misma conexión. Lo que cambia es el transporte. Los métodos, las cabeceras y los códigos de estado son los mismos, así que todo lo de este apunte vale para las tres versiones.

---

## 2. Qué es una API REST

Una API (Application Programming Interface) es la forma en que un programa ofrece sus servicios a otros programas. Una API web los ofrece a través de HTTP.

REST (Representational State Transfer) es un estilo para diseñar esas APIs. No es un protocolo ni una librería. Es un conjunto de convenciones que hace que todas las APIs se parezcan, así que si aprendés a usar una, ya sabés usar casi todas.

### Las ideas de REST

REST se apoya en cinco ideas:

1. Todo es un recurso. Un usuario, un producto o un pedido de compra son recursos.
2. Cada recurso tiene una URL. La URL es un sustantivo: `/users/1`, no `/obtenerUsuario?id=1`.
3. El método HTTP es el verbo. `GET /users/1` lee el usuario; `DELETE /users/1` lo borra.
4. Lo que viaja es una representación del recurso, casi siempre en JSON.
5. Cada pedido se entiende solo, sin depender de pedidos anteriores.

### Colecciones y elementos

Las URLs de una API REST forman una jerarquía fácil de adivinar:

| URL | Qué representa |
|---|---|
| `/users` | la colección de todos los usuarios |
| `/users/1` | el usuario con id 1 |
| `/users/1/posts` | los posts del usuario 1 |
| `/posts?userId=1` | los posts filtrados por usuario, con query |

Las colecciones van en plural. Los filtros, el orden y la paginación van en la query.

### Las acciones REST

REST usa los métodos de HTTP como acciones sobre los recursos. Las cuatro operaciones básicas de datos (crear, leer, actualizar, borrar, conocidas como CRUD) se traducen así:

| Acción | Método | URL | Cuerpo del pedido | Respuesta típica |
|---|---|---|---|---|
| listar | `GET` | `/users` | no | `200` con un arreglo |
| leer uno | `GET` | `/users/1` | no | `200` con el objeto |
| crear | `POST` | `/users` | el nuevo recurso | `201` con el recurso creado |
| reemplazar | `PUT` | `/users/1` | el recurso completo | `200` con el recurso |
| modificar | `PATCH` | `/users/1` | solo los campos que cambian | `200` con el recurso |
| borrar | `DELETE` | `/users/1` | no | `200` o `204` sin cuerpo |

La diferencia entre `PUT` y `PATCH` importa. `PUT` reemplaza el recurso entero: si omitís un campo, el servidor lo pierde. `PATCH` cambia solo lo que enviás.

### Seguro e idempotente

Dos propiedades ayudan a razonar sobre cada método:

- seguro: el método no cambia nada en el servidor; solo lee
- idempotente: repetir el pedido deja el servidor igual que hacerlo una vez

| Método | Seguro | Idempotente |
|---|---|---|
| `GET` | sí | sí |
| `PUT` | no | sí |
| `PATCH` | no | no necesariamente |
| `DELETE` | no | sí |
| `POST` | no | no |

Esto tiene consecuencias prácticas. Si un `GET` falla por la red, podés reintentarlo sin miedo. Si un `POST` falla, reintentarlo puede crear el recurso dos veces. Por eso los botones de "Pagar" se desactivan después del primer clic.

---

## 3. Los códigos de estado

El código de estado es un número de 3 cifras. Resume qué pasó con el pedido. El primer dígito indica la familia:

| Familia | Significado | Quién tiene que actuar |
|---|---|---|
| `1xx` | información provisoria | nadie, es raro verlos |
| `2xx` | éxito | nadie, salió bien |
| `3xx` | redirección | el cliente, que debe ir a otra URL |
| `4xx` | error del cliente | el cliente, que pidió algo mal |
| `5xx` | error del servidor | el servidor, que falló |

Los que vas a ver todos los días:

| Código | Texto | Cuándo aparece |
|---|---|---|
| `200` | OK | el pedido salió bien y hay cuerpo |
| `201` | Created | se creó un recurso, típico de `POST` |
| `204` | No Content | salió bien, pero no hay cuerpo, típico de `DELETE` |
| `301` | Moved Permanently | el recurso se mudó para siempre a otra URL |
| `304` | Not Modified | tu copia en caché sigue siendo válida |
| `400` | Bad Request | el pedido está mal formado, por ejemplo JSON inválido |
| `401` | Unauthorized | falta autenticarse o el token no sirve |
| `403` | Forbidden | estás autenticado, pero no tenés permiso |
| `404` | Not Found | el recurso no existe |
| `409` | Conflict | el pedido choca con el estado actual, por ejemplo email repetido |
| `422` | Unprocessable Content | el JSON es válido, pero los datos no pasan la validación |
| `429` | Too Many Requests | hiciste demasiados pedidos; esperá |
| `500` | Internal Server Error | el servidor falló por un error propio |
| `503` | Service Unavailable | el servidor está caído o sobrecargado |

Una regla para leerlos: si es `4xx`, revisá tu pedido; si es `5xx`, el problema no es tuyo.

---

## 4. JSON como formato de intercambio

Cliente y servidor pueden estar escritos en lenguajes distintos. Necesitan un formato de texto que los dos entiendan. Ese formato es JSON (JavaScript Object Notation).

JSON nació de la sintaxis de los objetos de JavaScript, pero hoy lo lee y escribe cualquier lenguaje.

```json
{
  "id": 1,
  "name": "Leanne Graham",
  "activo": true,
  "saldo": 1520.5,
  "telefono": null,
  "roles": ["admin", "editor"],
  "address": {
    "city": "Gwenborough",
    "zipcode": "92998-3874"
  }
}
```

### Los tipos de JSON

JSON tiene solo seis tipos de valor:

- cadena: `"texto"`, siempre con comillas dobles
- número: `42`, `-3.14`, `1e6`
- booleano: `true` o `false`
- nulo: `null`
- arreglo: `[1, 2, 3]`
- objeto: `{"clave": "valor"}`

### Diferencias con un objeto de JavaScript

JSON se parece a JavaScript, pero es más estricto:

- las claves van siempre entre comillas dobles
- las cadenas no aceptan comillas simples ni invertidas
- no se permite una coma después del último elemento
- no hay comentarios
- no existen `undefined`, funciones, `NaN` ni `Infinity`
- no hay tipo fecha; las fechas viajan como cadenas, por ejemplo `"2026-09-23T14:30:00Z"`

### Convertir entre texto y objeto

Por la red solo viaja texto. JavaScript tiene dos funciones para pasar de uno a otro:

```js
const usuario = { name: "Ana", edad: 30 };

// Objeto → texto JSON (para enviar)
const texto = JSON.stringify(usuario);
console.log(texto); // {"name":"Ana","edad":30}

// Con sangría, para leerlo mejor
console.log(JSON.stringify(usuario, null, 2));

// Texto JSON → objeto (al recibir)
const deVuelta = JSON.parse(texto);
console.log(deVuelta.name); // Ana

// Un JSON inválido lanza una excepción
try {
  JSON.parse("{name: 'Ana'}");
} catch (e) {
  console.log("JSON inválido:", e.message);
}
```

A convertir un objeto en texto se lo llama serializar. Al camino inverso, deserializar.

---

## 5. La API de práctica: JSONPlaceholder

JSONPlaceholder es una API REST falsa y gratuita pensada para practicar. Está en `https://jsonplaceholder.typicode.com` y no pide registro.

Ofrece varios recursos: `users`, `posts`, `comments`, `todos`, `albums` y `photos`. Vamos a trabajar con `users`.

Un usuario tiene esta forma:

```json
{
  "id": 1,
  "name": "Leanne Graham",
  "username": "Bret",
  "email": "Sincere@april.biz",
  "address": {
    "street": "Kulas Light",
    "suite": "Apt. 556",
    "city": "Gwenborough",
    "zipcode": "92998-3874",
    "geo": { "lat": "-37.3159", "lng": "81.1496" }
  },
  "phone": "1-770-736-8031 x56442",
  "website": "hildegard.org",
  "company": {
    "name": "Romaguera-Crona",
    "catchPhrase": "Multi-layered client-server neural-net",
    "bs": "harness real-time e-markets"
  }
}
```

Hay un detalle importante. JSONPlaceholder acepta `POST`, `PUT`, `PATCH` y `DELETE`, y responde como si hubiera funcionado. Pero no guarda nada. Si creás un usuario y después lo pedís, no existe. Es perfecto para practicar sin romper nada.

---

## 6. Probar la API con REST Client en VS Code

Antes de escribir código conviene probar la API a mano. Así ves exactamente qué responde y separás los problemas de la API de los problemas de tu programa.

REST Client es una extensión de VS Code que envía pedidos HTTP escritos en un archivo de texto. La ventaja sobre otras herramientas es que el archivo queda en el proyecto, versionado con Git, y sirve como documentación.

### Instalación

1. Abrí la vista de extensiones con `Ctrl+Shift+X`.
2. Buscá "REST Client", del autor Huachao Mao.
3. Instalala.
4. Creá un archivo con extensión `.http`, por ejemplo `usuarios.http`.

### El primer pedido

Escribí esto en el archivo:

```http
GET https://jsonplaceholder.typicode.com/users/1
```

Encima de la línea aparece un enlace **Send Request**. Al usarlo, se abre un panel con la respuesta completa: línea de estado, cabeceras y cuerpo. También podés usar `Ctrl+Alt+R`.

Fijate que el archivo tiene la misma forma que el mensaje HTTP que vimos en la sección 1. REST Client no inventa una sintaxis: escribís HTTP.

### Un archivo completo con las acciones REST

Cada pedido se separa del siguiente con `###`. Las variables se declaran con `@` y se usan con `{{ }}`.

```http
@base = https://jsonplaceholder.typicode.com
@json = application/json

### Listar todos los usuarios
GET {{base}}/users
Accept: {{json}}

### Leer un usuario
GET {{base}}/users/1
Accept: {{json}}

### Usuario que no existe (esperamos 404)
GET {{base}}/users/999

### Filtrar con query: los posts del usuario 1
GET {{base}}/posts?userId=1

### Crear un usuario
POST {{base}}/users
Content-Type: {{json}}

{
  "name": "Ana Pérez",
  "username": "anap",
  "email": "ana@mail.com"
}

### Reemplazar un usuario completo
PUT {{base}}/users/1
Content-Type: {{json}}

{
  "id": 1,
  "name": "Leanne Graham",
  "username": "Bret",
  "email": "nuevo@mail.com"
}

### Modificar solo el email
PATCH {{base}}/users/1
Content-Type: {{json}}

{
  "email": "otro@mail.com"
}

### Borrar un usuario
DELETE {{base}}/users/1
```

Tres reglas de sintaxis que evitan la mayoría de los errores:

- las cabeceras van justo debajo de la línea del pedido, sin líneas vacías en el medio
- entre las cabeceras y el cuerpo va exactamente una línea vacía
- el cuerpo JSON tiene que ser JSON válido, con comillas dobles

### Qué observar en cada respuesta

Probá cada pedido y mirá:

- el `GET` a `/users` devuelve `200` y un arreglo de 10 usuarios
- el `GET` a `/users/999` devuelve `404` y un objeto vacío `{}`
- el `POST` devuelve `201 Created` y el usuario con un `id` nuevo: 11
- el `DELETE` devuelve `200` y un objeto vacío
- todas las respuestas traen `Content-Type: application/json; charset=utf-8`

### Encadenar pedidos

REST Client permite nombrar un pedido y usar su respuesta en el siguiente. Esto sirve, por ejemplo, para crear un recurso y después consultarlo con el id que devolvió el servidor.

```http
# @name nuevo
POST {{base}}/users
Content-Type: {{json}}

{ "name": "Ana Pérez" }

### Usar el id que devolvió el POST
GET {{base}}/users/{{nuevo.response.body.id}}
```

Con JSONPlaceholder este segundo pedido devuelve `404`, porque el usuario 11 nunca se guardó. Con una API real, devolvería el usuario recién creado.

---

## 7. Lo mismo desde la terminal con cURL

cURL es un cliente HTTP de línea de comandos. Viene instalado en Linux, macOS y Windows 10 o posterior. Es la forma universal de compartir un pedido HTTP: casi toda documentación de APIs trae ejemplos con `curl`.

En Windows, usá `curl.exe` en PowerShell. El nombre `curl` solo puede apuntar a otro comando de PowerShell.

### Las opciones que vas a usar

| Opción | Qué hace |
|---|---|
| `-X MÉTODO` | elige el método; si no se indica, es `GET` |
| `-H "Nombre: valor"` | agrega una cabecera |
| `-d 'datos'` | envía un cuerpo; si no indicás método, pasa a ser `POST` |
| `-i` | muestra las cabeceras de la respuesta junto al cuerpo |
| `-I` | pide solo las cabeceras (método `HEAD`) |
| `-v` | muestra todo: pedido y respuesta completos |
| `-s` | modo silencioso, sin barra de progreso |
| `-o archivo` | guarda el cuerpo en un archivo |
| `-w "%{http_code}"` | imprime datos del pedido, como el código de estado |

### Las acciones REST con cURL

```bash
# Listar usuarios
curl https://jsonplaceholder.typicode.com/users

# Leer uno, mostrando las cabeceras de la respuesta
curl -i https://jsonplaceholder.typicode.com/users/1

# Ver el diálogo completo: lo que envía (>) y lo que recibe (<)
curl -v https://jsonplaceholder.typicode.com/users/1

# Crear
curl -X POST https://jsonplaceholder.typicode.com/users \
  -H "Content-Type: application/json" \
  -d '{"name": "Ana Pérez", "email": "ana@mail.com"}'

# Reemplazar
curl -X PUT https://jsonplaceholder.typicode.com/users/1 \
  -H "Content-Type: application/json" \
  -d '{"id": 1, "name": "Leanne Graham", "email": "nuevo@mail.com"}'

# Modificar un campo
curl -X PATCH https://jsonplaceholder.typicode.com/users/1 \
  -H "Content-Type: application/json" \
  -d '{"email": "otro@mail.com"}'

# Borrar, mostrando solo el código de estado
curl -s -o /dev/null -w "%{http_code}\n" \
  -X DELETE https://jsonplaceholder.typicode.com/users/1
```

La barra invertida `\` al final de la línea continúa el comando en la línea siguiente. En PowerShell se usa el acento grave `` ` `` en su lugar.

### Leer el modo detallado

La salida de `curl -v` muestra el mensaje HTTP tal como lo vimos en la sección 1:

```
> GET /users/1 HTTP/2
> Host: jsonplaceholder.typicode.com
> User-Agent: curl/8.5.0
> Accept: */*
>
< HTTP/2 200
< content-type: application/json; charset=utf-8
< cache-control: max-age=43200
<
{
  "id": 1,
  "name": "Leanne Graham",
  ...
```

Las líneas con `>` son lo que envió cURL. Las líneas con `<` son lo que respondió el servidor. Es la mejor forma de ver HTTP "desnudo".

### Formatear el JSON con jq

cURL muestra el cuerpo tal cual llega. Para leerlo mejor o extraer datos se usa `jq`, un procesador de JSON para la terminal:

```bash
# Formatear con colores
curl -s https://jsonplaceholder.typicode.com/users/1 | jq

# Solo el nombre
curl -s https://jsonplaceholder.typicode.com/users/1 | jq '.name'

# Nombre y email de todos los usuarios
curl -s https://jsonplaceholder.typicode.com/users | jq '.[] | {name, email}'
```

---

## 8. Consumir la API desde JavaScript con fetch

`fetch` es la función estándar de JavaScript para hacer pedidos HTTP. Existe en el navegador y en Node.js desde la versión 18, sin instalar nada.

`fetch` devuelve una promesa. Por eso la combinamos con `async/await`.

### El pedido más simple

```js
// usuarios.mjs — ejecutar con: node usuarios.mjs
const respuesta = await fetch("https://jsonplaceholder.typicode.com/users/1");
const usuario = await respuesta.json();

console.log(usuario.name); // Leanne Graham
```

El archivo usa la extensión `.mjs` para que Node lo trate como módulo y permita `await` fuera de una función.

Hay dos `await`, y no es casualidad. Esa es la idea central de esta sección.

### Primero llegan las cabeceras, después el cuerpo

Una respuesta HTTP llega en dos partes: primero la línea de estado y las cabeceras, después el cuerpo. El cuerpo puede ser grande y tardar en llegar. `fetch` refleja esa realidad en dos pasos:

1. `await fetch(url)` se resuelve apenas llegan las cabeceras. Te da un objeto `Response` con el estado y las cabeceras, pero el cuerpo todavía se está descargando.
2. `await respuesta.json()` espera a que llegue el cuerpo completo, lo lee como texto y lo convierte en objeto con `JSON.parse`.

```
cliente                                   servidor
   │  ── GET /users/1 ──────────────────▶     │
   │                                          │
   │  ◀── HTTP/1.1 200 OK ─────────────────   │  ┐
   │  ◀── Content-Type: application/json ──   │  │ primer await: fetch()
   │  ◀── (línea vacía) ───────────────────   │  ┘
   │                                          │
   │  ◀── {"id": 1, "name": "Leanne ...  ──   │  ┐ segundo await: .json()
   │  ◀── ... resto del cuerpo ... }  ─────   │  ┘
```

Esto permite decidir qué hacer antes de descargar el cuerpo. Por ejemplo, si el estado es un error o si el formato no es el esperado.

### Leer el estado y las cabeceras

El objeto `Response` tiene todo lo que llegó antes del cuerpo:

```js
const respuesta = await fetch("https://jsonplaceholder.typicode.com/users/1");

// La línea de estado
console.log(respuesta.status);     // 200
console.log(respuesta.statusText); // OK (en HTTP/2 puede venir vacío)
console.log(respuesta.ok);         // true si el código está entre 200 y 299

// Una cabecera puntual; el nombre no distingue mayúsculas
console.log(respuesta.headers.get("content-type"));
// application/json; charset=utf-8

// Todas las cabeceras
for (const [nombre, valor] of respuesta.headers) {
  console.log(`${nombre}: ${valor}`);
}

// Recién ahora leemos el cuerpo
const usuario = await respuesta.json();
console.log(usuario);
```

### El cuerpo se lee una sola vez

El cuerpo es un flujo de datos (stream). Una vez consumido, no se puede volver a leer.

```js
const respuesta = await fetch("https://jsonplaceholder.typicode.com/users/1");

const datos = await respuesta.json();
console.log(respuesta.bodyUsed); // true

await respuesta.text(); // TypeError: el cuerpo ya fue leído
```

`Response` ofrece varias formas de leer el cuerpo. Elegís una según el `Content-Type`:

- `json()`: parsea JSON y devuelve un objeto
- `text()`: devuelve el cuerpo como cadena
- `blob()`: devuelve datos binarios, por ejemplo una imagen
- `arrayBuffer()`: devuelve los bytes crudos

### fetch no falla con un 404

Esta es la trampa más común. `fetch` solo rechaza la promesa cuando no pudo hablar con el servidor: sin red, dominio inexistente, conexión cortada. Si el servidor responde `404` o `500`, para `fetch` la conversación salió bien. Te toca a vos revisar el estado.

```js
const respuesta = await fetch("https://jsonplaceholder.typicode.com/users/999");

console.log(respuesta.ok);     // false
console.log(respuesta.status); // 404
// No se lanzó ninguna excepción
```

Por eso conviene una función que revise el estado y el formato antes de leer el cuerpo:

```js
async function pedirJSON(url, opciones = {}) {
  const respuesta = await fetch(url, opciones);

  // 1. ¿Salió bien?
  if (!respuesta.ok) {
    throw new Error(`HTTP ${respuesta.status} en ${url}`);
  }

  // 2. ¿Hay cuerpo? Un 204 no trae nada
  if (respuesta.status === 204) return null;

  // 3. ¿Es JSON?
  const tipo = respuesta.headers.get("content-type") ?? "";
  if (!tipo.includes("application/json")) {
    throw new Error(`Esperaba JSON y llegó ${tipo}`);
  }

  // 4. Recién ahora leemos el cuerpo
  return respuesta.json();
}

try {
  const usuario = await pedirJSON("https://jsonplaceholder.typicode.com/users/999");
  console.log(usuario);
} catch (error) {
  console.error("No se pudo obtener el usuario:", error.message);
}
```

### Enviar datos: el segundo parámetro de fetch

Para cualquier método que no sea `GET`, `fetch` recibe un objeto de opciones. Ahí se indican el método, las cabeceras y el cuerpo.

```js
const base = "https://jsonplaceholder.typicode.com";

// Crear
const creado = await pedirJSON(`${base}/users`, {
  method: "POST",
  headers: { "Content-Type": "application/json" },
  body: JSON.stringify({ name: "Ana Pérez", email: "ana@mail.com" }),
});
console.log(creado); // { name: 'Ana Pérez', email: 'ana@mail.com', id: 11 }

// Modificar
const modificado = await pedirJSON(`${base}/users/1`, {
  method: "PATCH",
  headers: { "Content-Type": "application/json" },
  body: JSON.stringify({ email: "otro@mail.com" }),
});
console.log(modificado.email); // otro@mail.com

// Borrar
const borrado = await fetch(`${base}/users/1`, { method: "DELETE" });
console.log(borrado.status); // 200
```

Dos detalles:

- `body` recibe texto, no un objeto; por eso pasamos el objeto por `JSON.stringify`
- la cabecera `Content-Type` le avisa al servidor que ese texto es JSON

### Armar URLs con parámetros

Concatenar la query a mano es frágil: un espacio o una tilde rompen la URL. La clase `URL` se encarga de codificar los valores:

```js
const url = new URL("https://jsonplaceholder.typicode.com/posts");
url.searchParams.set("userId", 1);
url.searchParams.set("_limit", 3);

console.log(url.toString());
// https://jsonplaceholder.typicode.com/posts?userId=1&_limit=3

const posts = await pedirJSON(url);
```

### Varios pedidos a la vez

Si los pedidos no dependen entre sí, no hace falta esperarlos de a uno. `Promise.all` los lanza juntos y espera a que terminen todos:

```js
const [usuario, posts] = await Promise.all([
  pedirJSON(`${base}/users/1`),
  pedirJSON(`${base}/posts?userId=1`),
]);

console.log(`${usuario.name} escribió ${posts.length} posts`);
```

---

## 9. Ejemplo integrador: el clima en la terminal con Ink

Vamos a juntar todo en una app de terminal. El usuario escribe una ciudad y la app muestra el clima actual.

### Las APIs de Open-Meteo

Open-Meteo es un servicio de clima gratuito y sin clave de acceso. Su documentación está en la página de la [API de pronóstico de Open-Meteo](https://open-meteo.com/en/docs). Vamos a usar dos de sus APIs, una detrás de la otra.

La primera convierte un nombre de ciudad en coordenadas. Es la API de geocodificación:

```http
GET https://geocoding-api.open-meteo.com/v1/search?name=Tucumán&count=1&language=es&format=json
```

Devuelve algo así (recortado):

```json
{
  "results": [
    {
      "name": "San Miguel de Tucumán",
      "latitude": -26.82414,
      "longitude": -65.2226,
      "country": "Argentina",
      "admin1": "Tucumán"
    }
  ]
}
```

Si no encuentra la ciudad, la respuesta no trae la propiedad `results`.

La segunda recibe las coordenadas y devuelve el clima. En `current` le pedimos qué variables queremos:

```http
GET https://api.open-meteo.com/v1/forecast?latitude=-26.82&longitude=-65.22&current=temperature_2m,relative_humidity_2m,apparent_temperature,weather_code,wind_speed_10m&daily=temperature_2m_max,temperature_2m_min&timezone=auto&forecast_days=1
```

La respuesta trae los valores en `current` y sus unidades en `current_units`; lo mismo ocurre con `daily` y `daily_units`. Recortada a lo que usa la aplicación:

```json
{
  "current_units": {
    "temperature_2m": "°C",
    "relative_humidity_2m": "%",
    "apparent_temperature": "°C",
    "wind_speed_10m": "km/h"
  },
  "current": {
    "time": "2026-09-23T15:00",
    "temperature_2m": 24.3,
    "relative_humidity_2m": 41,
    "apparent_temperature": 23.1,
    "weather_code": 2,
    "wind_speed_10m": 11.5
  },
  "daily_units": {
    "temperature_2m_max": "°C",
    "temperature_2m_min": "°C"
  },
  "daily": {
    "temperature_2m_max": [27.8],
    "temperature_2m_min": [14.2]
  }
}
```

`weather_code` es un número de la escala de la Organización Meteorológica Mundial. Lo traducimos a texto con una tabla.

Probá los dos pedidos con REST Client o con cURL antes de programar. Así sabés qué forma tienen los datos.

### Qué es Ink

Ink es una librería que usa React para construir interfaces de terminal. En lugar de `<div>` y `<p>`, usás `<Box>` y `<Text>`. El resto es React normal: componentes, props, `useState` y efectos. Cuando el estado cambia, Ink redibuja la terminal.

### Preparar el proyecto

Necesitás Node.js 22 o posterior: es la versión mínima que exige la versión actual de Ink.

```bash
mkdir clima-cli
cd clima-cli
npm init -y
npm install ink react ink-text-input ink-spinner
npm install --save-dev tsx
```

Cada paquete cumple una función:

- `ink` y `react`: la base de la interfaz
- `ink-text-input`: un campo de texto para la terminal
- `ink-spinner`: una animación de "cargando"
- `tsx`: ejecuta archivos `.jsx` directamente, sin paso de compilación

Editá `package.json` para agregar `"type": "module"` y el script de inicio:

```json
{
  "name": "clima-cli",
  "type": "module",
  "scripts": {
    "start": "tsx clima.jsx"
  }
}
```

Dejá las dependencias que `npm install` agregó al archivo.

### El código

La app tiene cuatro estados posibles: pidiendo la ciudad, cargando, mostrando el clima y mostrando un error. Cada estado dibuja una pantalla distinta.

```jsx
// clima.jsx
import React, { useState } from "react";
import { render, Box, Text, useApp, useInput } from "ink";
import TextInput from "ink-text-input";
import Spinner from "ink-spinner";

// ─── Acceso a las APIs ──────────────────────────────────────────

async function pedirJSON(url) {
  const respuesta = await fetch(url);

  if (!respuesta.ok) {
    throw new Error(`El servidor respondió ${respuesta.status}`);
  }

  const tipo = respuesta.headers.get("content-type") ?? "";
  if (!tipo.includes("application/json")) {
    throw new Error(`Esperaba JSON y llegó ${tipo}`);
  }

  return respuesta.json();
}

async function buscarCiudad(nombre) {
  const url = new URL("https://geocoding-api.open-meteo.com/v1/search");
  url.searchParams.set("name", nombre);
  url.searchParams.set("count", 1);
  url.searchParams.set("language", "es");
  url.searchParams.set("format", "json");

  const datos = await pedirJSON(url);

  if (!datos.results?.length) {
    throw new Error(`No encontré ninguna ciudad llamada "${nombre}"`);
  }

  return datos.results[0];
}

async function obtenerClima(latitud, longitud) {
  const url = new URL("https://api.open-meteo.com/v1/forecast");
  url.searchParams.set("latitude", latitud);
  url.searchParams.set("longitude", longitud);
  url.searchParams.set(
    "current",
    "temperature_2m,relative_humidity_2m,apparent_temperature,weather_code,wind_speed_10m"
  );
  url.searchParams.set("daily", "temperature_2m_max,temperature_2m_min");
  url.searchParams.set("timezone", "auto");
  url.searchParams.set("forecast_days", 1);

  return pedirJSON(url);
}

// ─── Traducción del código de clima ─────────────────────────────

const DESCRIPCIONES = {
  0: "☀️  Despejado",
  1: "🌤  Mayormente despejado",
  2: "⛅ Parcialmente nublado",
  3: "☁️  Nublado",
  45: "🌫  Niebla",
  48: "🌫  Niebla con escarcha",
  51: "🌦  Llovizna leve",
  53: "🌦  Llovizna",
  55: "🌦  Llovizna intensa",
  61: "🌧  Lluvia leve",
  63: "🌧  Lluvia",
  65: "🌧  Lluvia intensa",
  71: "🌨  Nevada leve",
  73: "🌨  Nevada",
  75: "🌨  Nevada intensa",
  80: "🌦  Chaparrones leves",
  81: "🌧  Chaparrones",
  82: "⛈  Chaparrones violentos",
  95: "⛈  Tormenta",
  96: "⛈  Tormenta con granizo",
  99: "⛈  Tormenta con granizo fuerte",
};

function describir(codigo) {
  return DESCRIPCIONES[codigo] ?? `Código ${codigo}`;
}

// ─── Componentes ────────────────────────────────────────────────

function Dato({ etiqueta, valor, unidad }) {
  return (
    <Box>
      <Box width={20}>
        <Text dimColor>{etiqueta}</Text>
      </Box>
      <Text>
        {valor} {unidad}
      </Text>
    </Box>
  );
}

function TarjetaClima({ lugar, clima }) {
  const actual = clima.current;
  const u = clima.current_units;
  const region = [lugar.admin1, lugar.country].filter(Boolean).join(", ");

  return (
    <Box flexDirection="column" borderStyle="round" borderColor="cyan" paddingX={2}>
      <Text bold color="cyan">{lugar.name}</Text>
      <Text dimColor>{region}</Text>
      <Text> </Text>
      <Text>{describir(actual.weather_code)}</Text>
      <Text> </Text>
      <Dato etiqueta="Temperatura" valor={actual.temperature_2m} unidad={u.temperature_2m} />
      <Dato etiqueta="Sensación térmica" valor={actual.apparent_temperature} unidad={u.apparent_temperature} />
      <Dato etiqueta="Humedad" valor={actual.relative_humidity_2m} unidad={u.relative_humidity_2m} />
      <Dato etiqueta="Viento" valor={actual.wind_speed_10m} unidad={u.wind_speed_10m} />
      <Dato
        etiqueta="Mín. / Máx. hoy"
        valor={`${clima.daily.temperature_2m_min[0]} / ${clima.daily.temperature_2m_max[0]}`}
        unidad={clima.daily_units.temperature_2m_max}
      />
    </Box>
  );
}

function App() {
  const { exit } = useApp();
  const [ciudad, setCiudad] = useState("");
  const [estado, setEstado] = useState("pidiendo"); // pidiendo | cargando | mostrando | error
  const [resultado, setResultado] = useState(null);
  const [error, setError] = useState("");

  // Después de mostrar un resultado: "q" sale, cualquier otra tecla consulta otra ciudad
  useInput(
    (input, key) => {
      if (input === "q" || key.escape) {
        exit();
        return;
      }
      setCiudad("");
      setEstado("pidiendo");
    },
    { isActive: estado === "mostrando" || estado === "error" }
  );

  async function consultar(nombre) {
    if (!nombre.trim()) return;

    setEstado("cargando");
    try {
      const lugar = await buscarCiudad(nombre.trim());
      const clima = await obtenerClima(lugar.latitude, lugar.longitude);
      setResultado({ lugar, clima });
      setEstado("mostrando");
    } catch (e) {
      setError(e.message);
      setEstado("error");
    }
  }

  return (
    <Box flexDirection="column" padding={1}>
      <Text bold>🌎 Clima actual · datos de Open-Meteo</Text>
      <Text> </Text>

      {estado === "pidiendo" && (
        <Box>
          <Text color="green">Ciudad: </Text>
          <TextInput value={ciudad} onChange={setCiudad} onSubmit={consultar} />
        </Box>
      )}

      {estado === "cargando" && (
        <Text>
          <Text color="yellow"><Spinner type="dots" /></Text>
          {" "}Consultando el clima de {ciudad}...
        </Text>
      )}

      {estado === "mostrando" && <TarjetaClima {...resultado} />}

      {estado === "error" && <Text color="red">✖ {error}</Text>}

      {(estado === "mostrando" || estado === "error") && (
        <Box marginTop={1}>
          <Text dimColor>Tocá cualquier tecla para otra ciudad, o "q" para salir.</Text>
        </Box>
      )}
    </Box>
  );
}

render(<App />);
```

### Ejecutarla

```bash
npm start
```

La salida se ve así:

```
🌎 Clima actual · datos de Open-Meteo

╭──────────────────────────────────────────╮
│  San Miguel de Tucumán                   │
│  Tucumán, Argentina                      │
│                                          │
│  ⛅ Parcialmente nublado                  │
│                                          │
│  Temperatura         24.3 °C             │
│  Sensación térmica   23.1 °C             │
│  Humedad             41 %                │
│  Viento              11.5 km/h           │
│  Mín. / Máx. hoy     14.2 / 27.8 °C      │
╰──────────────────────────────────────────╯

Tocá cualquier tecla para otra ciudad, o "q" para salir.
```

### Qué conceptos del apunte aparecen en la app

Cada parte de la app usa algo que vimos antes:

- `new URL` y `searchParams` arman la query sin errores de codificación
- `pedirJSON` revisa `respuesta.ok` porque `fetch` no falla con un `404`
- `pedirJSON` lee la cabecera `content-type` antes de leer el cuerpo
- el primer `await` trae estado y cabeceras; el segundo, en `.json()`, trae el cuerpo
- los dos pedidos van uno detrás del otro porque el segundo necesita las coordenadas del primero
- las unidades salen de la respuesta (`current_units`), no están escritas en el código
- los errores de red y de datos terminan en el mismo `catch` y se muestran en pantalla

### Ejercicios para seguir

Probá extender la app:

1. Mostrá el pronóstico de los próximos 3 días usando `forecast_days=3` y los arreglos de `daily`.
2. Pedí 5 resultados de geocodificación y dejá que el usuario elija la ciudad correcta con `ink-select-input`.
3. Agregá una opción para ver la temperatura en grados Fahrenheit con el parámetro `temperature_unit=fahrenheit`.
4. Medí cuánto tarda cada pedido con `performance.now()` y mostralo al pie.

---

## Resumen

HTTP es una conversación de pedido y respuesta entre un cliente y un servidor. Los dos mensajes tienen la misma forma: una primera línea, cabeceras, una línea vacía y un cuerpo opcional.

REST organiza una API en recursos con URL propia. Los métodos `GET`, `POST`, `PUT`, `PATCH` y `DELETE` son las acciones sobre esos recursos. Los códigos de estado dicen qué pasó, y JSON es el formato en que viajan los datos.

Para probar una API sin programar, usá REST Client en VS Code o cURL en la terminal. Para consumirla desde JavaScript, usá `fetch` con dos `await`: uno para el estado y las cabeceras, otro para el cuerpo. Y revisá siempre `respuesta.ok`, porque `fetch` no lo hace por vos.
