# La API de OpenAI

Un modelo de lenguaje como el de ChatGPT también se puede usar desde un programa. OpenAI lo ofrece como un servicio web: el programa manda un texto por HTTP y recibe otro texto como respuesta.

Este apunte muestra cómo es ese intercambio, cómo escribirlo en JavaScript con `fetch` y cómo convertirlo en funciones con un propósito concreto: traducir, interpretar fechas, escribir números en letras, extraer teléfonos, leer los datos de una factura a partir de una imagen, generar una imagen a partir de una descripción y transformar una foto, por ejemplo en una foto carnet.

## Qué hace falta

Para usar la API necesitás:

- una cuenta en la plataforma de desarrolladores de OpenAI (platform.openai.com) con saldo cargado
- una clave de API, que se crea en la sección API keys de esa plataforma
- Node.js 20 o posterior, que ya trae `fetch` incluido

La API se cobra por uso. Cada pedido se mide en tokens, que son los fragmentos en que el modelo divide el texto. Un token equivale, en promedio, a unas 4 letras de texto en inglés; en español cada palabra suele ocupar algo más. Se pagan tanto los tokens que enviás como los que el modelo genera.

### La clave es secreta

La clave identifica tu cuenta. Quien la tenga puede gastar tu saldo. Por eso nunca va escrita en el código, nunca se sube a un repositorio y nunca llega al navegador.

La forma habitual de guardarla es un archivo `.env` en la carpeta del proyecto:

```bash
OPENAI_API_KEY=sk-proj-xxxxxxxxxxxxxxxx
```

Ese archivo se agrega a `.gitignore`. Node lo lee si lo indicás al ejecutar el programa, y la clave queda disponible en `process.env.OPENAI_API_KEY`:

```bash
node --env-file=.env programa.mjs
```

Todo el código que corre en el navegador es visible para quien usa la página. Por eso, en una aplicación web, la llamada a la API se hace siempre desde el servidor. El navegador le pide algo a tu servidor, y tu servidor le pide a OpenAI.

## Chat Completions

Al principio la API tenía un servicio llamado Completions. Recibía el comienzo de un texto y el modelo lo continuaba. Con los modelos de chat apareció Chat Completions: en lugar de un texto suelto, recibe una lista de mensajes. La idea sigue siendo la misma, el modelo completa, pero lo que completa es el siguiente mensaje de una conversación.

Hoy OpenAI ofrece también la API de Responses, que recomienda para proyectos nuevos. Suma herramientas propias, como búsqueda web o ejecución de código, y manejo de estado, y las funciones más nuevas aparecen primero ahí. En este apunte usamos Chat Completions por 2 razones. Es más simple. Y su formato se volvió un estándar: servicios como Gemini, OpenRouter u Ollama aceptan los mismos pedidos cambiando solo la dirección y el nombre del modelo. Lo que aprendas acá te sirve para todos.

### Un servicio REST

Chat Completions es un servicio REST. Cada pedido tiene estas partes:

- método: `POST`
- dirección: `https://api.openai.com/v1/chat/completions`
- encabezado `Authorization`: la palabra `Bearer`, un espacio y la clave
- encabezado `Content-Type`: `application/json`
- cuerpo: un objeto JSON con el modelo y los mensajes

### El pedido

Así se ve un pedido completo en HTTP:

```http
POST /v1/chat/completions HTTP/1.1
Host: api.openai.com
Authorization: Bearer sk-proj-xxxxxxxxxxxxxxxx
Content-Type: application/json

{
  "model": "gpt-6-luna",
  "messages": [
    { "role": "developer", "content": "Respondé en una sola oración." },
    { "role": "user", "content": "¿Qué es HTTP?" }
  ]
}
```

El mismo pedido se puede probar desde la terminal con `curl`, sin escribir código:

```bash
curl https://api.openai.com/v1/chat/completions \
  -H "Authorization: Bearer $OPENAI_API_KEY" \
  -H "Content-Type: application/json" \
  -d '{
    "model": "gpt-6-luna",
    "messages": [
      { "role": "developer", "content": "Respondé en una sola oración." },
      { "role": "user", "content": "¿Qué es HTTP?" }
    ]
  }'
```

El cuerpo tiene 2 campos obligatorios.

`model` indica qué modelo responde. A fines de septiembre de 2026, la familia actual de OpenAI es GPT-6, con 3 modelos:

- `gpt-6-astra`: el más capaz, pensado para trabajos largos y complejos
- `gpt-6-sol`: pensado para programación compleja y agentes; cuesta 2 dólares por millón de tokens de entrada y 10 por millón de salida
- `gpt-6-luna`: el más rápido y barato; cuesta 0,10 dólares por millón de tokens de entrada y 0,50 por millón de salida

En este apunte usamos `gpt-6-luna`, que alcanza de sobra para tareas bien definidas como las de los ejemplos. Los nombres y los precios cambian seguido, así que conviene revisar el catálogo de modelos y el registro de cambios (changelog) en la documentación de OpenAI.

`messages` es un arreglo de mensajes. Cada mensaje tiene un rol (`role`) y un contenido (`content`). Hay 3 roles:

- `developer`: las instrucciones del programador sobre cómo debe comportarse el modelo; en modelos anteriores se llamaba `system`, y la API sigue aceptando ese nombre
- `user`: lo que se le pide al modelo
- `assistant`: respuestas anteriores del modelo, cuando se envía una conversación

Además hay campos opcionales. Estos son los más usados:

- `reasoning_effort`: cuánto razona el modelo antes de responder; en GPT-6 Luna acepta `none`, `low`, `medium` (el valor por defecto), `high`, `xhigh` y `max`, y menos esfuerzo significa respuestas más rápidas y baratas
- `max_completion_tokens`: el máximo de tokens que el modelo puede generar
- `response_format`: pide que la respuesta sea JSON válido; lo usamos más adelante

Los modelos actuales razonan antes de responder, y ese razonamiento también consume tokens. El límite de `max_completion_tokens` los incluye. Si el límite es muy bajo, el modelo puede agotarlo razonando y devolver una respuesta vacía.

En modelos más viejos existía también `temperature`, que controlaba cuánto varían las respuestas. Los modelos de razonamiento en general no lo aceptan; GPT-6 Astra, por ejemplo, lo rechaza con un error.

### La respuesta

El servicio responde con un objeto JSON como este:

```json
{
  "id": "chatcmpl-AbC123",
  "object": "chat.completion",
  "created": 1790000000,
  "model": "gpt-6-luna",
  "choices": [
    {
      "index": 0,
      "message": {
        "role": "assistant",
        "content": "HTTP es el protocolo que usan navegadores y servidores para intercambiar pedidos y respuestas en la web.",
        "refusal": null
      },
      "finish_reason": "stop"
    }
  ],
  "usage": {
    "prompt_tokens": 24,
    "completion_tokens": 85,
    "total_tokens": 109,
    "completion_tokens_details": { "reasoning_tokens": 64 }
  }
}
```

El texto generado está en `choices[0].message.content`. El campo `choices` es un arreglo porque se pueden pedir varias respuestas alternativas, pero lo habitual es pedir una sola.

`finish_reason` explica por qué terminó la respuesta:

- `stop`: el modelo terminó normalmente
- `length`: se alcanzó el límite de tokens y la respuesta quedó cortada
- `content_filter`: el filtro de contenido bloqueó la respuesta

`usage` informa los tokens consumidos, que son los que se cobran. En el ejemplo, el modelo generó 85 tokens, pero 64 fueron de razonamiento: se pagan aunque no aparezcan en la respuesta.

### Los errores

Cuando algo falla, la API responde con un código de estado HTTP distinto de 200 y un cuerpo que describe el problema:

```json
{
  "error": {
    "message": "Incorrect API key provided: sk-proj-****xxxx.",
    "type": "invalid_request_error",
    "code": "invalid_api_key"
  }
}
```

Los códigos más frecuentes son:

- 400: el pedido está mal armado, por ejemplo con JSON inválido o un parámetro que el modelo no acepta
- 401: la clave falta o es inválida
- 429: se enviaron demasiados pedidos seguidos, se alcanzó el límite de gasto o la cuenta no tiene saldo
- 500 a 503: falla del lado de OpenAI; el 503 con el código `server_is_overloaded` indica que el modelo está saturado por un momento

Dentro del 429 hay causas muy distintas, y el campo `code` del error las distingue. `insufficient_quota` indica que la cuenta no tiene saldo o que el proyecto alcanzó su límite de gasto; `slow_down` indica que el tráfico creció demasiado rápido, y se resuelve esperando. Por eso conviene mostrar el mensaje y el código que envía la API, en lugar de un mensaje genérico.

Algunos errores 429 y 503 traen el encabezado `Retry-After`, que indica cuántos segundos esperar antes de reintentar. Si no viene, lo habitual es esperar cada vez más entre un intento y el siguiente: 1 segundo, después 2, después 4.

### La API no recuerda

Cada pedido es independiente. El servicio no guarda nada entre un pedido y el siguiente. Para continuar una conversación hay que enviar la conversación entera, incluidas las respuestas anteriores del modelo con el rol `assistant`:

```json
{
  "model": "gpt-6-luna",
  "messages": [
    { "role": "user", "content": "¿Qué es HTTP?" },
    { "role": "assistant", "content": "HTTP es el protocolo que usan navegadores y servidores para intercambiar pedidos y respuestas en la web." },
    { "role": "user", "content": "¿Y HTTPS?" }
  ]
}
```

Así funciona cualquier chat construido sobre esta API. La consecuencia es que cada mensaje nuevo cuesta más que el anterior, porque se vuelve a enviar todo lo previo.

## Una función para completar texto

Ahora escribimos el pedido en JavaScript. La función `completar` recibe el texto del usuario y, opcionalmente, las instrucciones para el modelo. Devuelve el texto de la respuesta.

Todo el código de este apunte va en un módulo llamado `ia.mjs`:

```js
// ia.mjs
const URL_API = "https://api.openai.com/v1/chat/completions";
const MODELO = "gpt-6-luna";

export async function completar(texto, instrucciones = "", opciones = {}) {
  const mensajes = [];
  if (instrucciones) {
    mensajes.push({ role: "developer", content: instrucciones });
  }
  mensajes.push({ role: "user", content: texto });

  const cuerpo = {
    model: MODELO,
    messages: mensajes,
    reasoning_effort: "low",
  };
  if (opciones.json) {
    cuerpo.response_format = { type: "json_object" };
  }

  const respuesta = await fetch(URL_API, {
    method: "POST",
    headers: {
      "Authorization": `Bearer ${process.env.OPENAI_API_KEY}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify(cuerpo),
  });

  if (!respuesta.ok) {
    const detalle = await respuesta.text();
    throw new Error(`La API respondió ${respuesta.status}: ${detalle}`);
  }

  const datos = await respuesta.json();
  return (datos.choices[0].message.content ?? "").trim();
}
```

La función es asincrónica porque espera una respuesta por la red. `fetch` devuelve una promesa, y `await` detiene la función hasta que llega la respuesta.

`fetch` solo lanza una excepción cuando no puede conectarse. Si el servidor responde con un error, como 401 o 429, `fetch` lo considera una respuesta válida. Por eso hay que revisar `respuesta.ok`, que vale `true` solo para códigos entre 200 y 299. En caso de error, la función lanza una excepción con el código y el detalle que envió la API.

El contenido puede venir en `null`, por ejemplo cuando el modelo se niega a responder. El operador `??` lo reemplaza por una cadena vacía, y `trim` quita los espacios y saltos de línea sobrantes.

La opción `json` la usamos más adelante, en `fechaAbsoluta` y `extraerTelefono`.

Para probar la función:

```js
// demo.mjs
import { completar } from "./ia.mjs";

const respuesta = await completar("¿Qué es HTTP?", "Respondé en una sola oración.");
console.log(respuesta);
```

```bash
node --env-file=.env demo.mjs
```

## De una función general a funciones específicas

`completar` puede hacer cualquier cosa, y ese es su problema. Quien la usa tiene que escribir instrucciones cada vez e interpretar una respuesta en texto libre. Una función específica esconde ese trabajo: recibe un dato concreto y devuelve un dato concreto.

Todas las funciones que siguen se construyen con la misma receta:

1. Escribir instrucciones precisas: qué hacer y en qué formato devolver el resultado.
2. Preparar la entrada con todo el contexto que el modelo necesita.
3. Validar la salida en JavaScript antes de devolverla.

El tercer paso importa. El modelo no es determinista: ante el mismo pedido puede responder distinto, y a veces se aparta del formato pedido. La función no debe confiar a ciegas en lo que recibe.

### traducir

```js
export async function traducir(texto, idioma = "inglés") {
  const instrucciones = `
    Traducí el texto que te paso al ${idioma}.
    Conservá el tono, los nombres propios y el formato.
    Respondé solo con la traducción, sin comillas ni comentarios.
  `;
  return completar(texto, instrucciones);
}
```

Las instrucciones son una plantilla de texto: una cadena entre acentos graves (`` ` ``), que admite varias líneas e intercala valores con `${...}`. La plantilla conserva los saltos de línea y los espacios tal como están escritos. Por eso las líneas siguientes empiezan en el margen izquierdo y no con sangría: si tuvieran sangría, esos espacios también viajarían en el pedido. Al modelo no le molestarían, pero así la cadena es exactamente lo que se ve en el código.

La frase "respondé solo con la traducción" evita que el modelo agregue introducciones como "Aquí está la traducción:". Sin esa indicación, el resultado no se podría usar directamente en un programa.

El parámetro `idioma` acepta cualquier descripción que entienda una persona: `"francés"`, `"portugués de Brasil"` o `"español rioplatense"`.

### Ida y vuelta

Traducir un texto a otro idioma y después volverlo al original es una técnica conocida para revisar traducciones. Si el sentido sobrevive el viaje, la traducción probablemente es buena.

```js
import { traducir } from "./ia.mjs";

const original = "Mañana a primera hora te paso el presupuesto, así lo mirás con calma.";
const ingles = await traducir(original, "inglés");
const vuelta = await traducir(ingles, "español");

console.log("Original:", original);
console.log("Inglés:  ", ingles);
console.log("Vuelta:  ", vuelta);
```

Una ejecución posible:

```text
Original: Mañana a primera hora te paso el presupuesto, así lo mirás con calma.
Inglés:   I'll send you the quote first thing tomorrow so you can look it over calmly.
Vuelta:   Mañana a primera hora te envío el presupuesto para que puedas revisarlo con calma.
```

El sentido se mantiene, pero se pierden los rasgos locales: el voseo y la expresión "te paso". El inglés no los distingue, así que la vuelta usa un español neutro. Si se pide `"español rioplatense"` como idioma de destino, el modelo los recupera. Cada ejecución puede producir textos algo distintos.

### fechaAbsoluta

Las personas mencionan fechas dentro de frases y de forma relativa: "nos vemos la próxima semana", "pasado mañana te llamo", "entregá el TP dentro de 3 semanas". Un programa necesita 2 cosas de esas frases: encontrar la parte que habla de una fecha y convertirla en una fecha concreta, como `05/10/2026`. El modelo entiende el lenguaje, pero no sabe qué día es hoy. Hay que decírselo.

La función devuelve las 2 cosas: la expresión tal como aparece en el texto y la fecha absoluta. Como son 2 datos, los pedimos en JSON con la opción `json` de `completar`. Esa opción agrega `response_format: { type: "json_object" }` al pedido, y la API garantiza que la respuesta sea JSON válido. Exige que la palabra JSON aparezca en los mensajes; si no aparece, la API responde con un error.

```js
function formatearFecha(fecha) {
  const dia = String(fecha.getDate()).padStart(2, "0");
  const mes = String(fecha.getMonth() + 1).padStart(2, "0");
  const anio = fecha.getFullYear();
  return `${dia}/${mes}/${anio}`;
}

export async function fechaAbsoluta(texto, hoy = new Date()) {
  const diaSemana = hoy.toLocaleDateString("es-AR", { weekday: "long" });
  const instrucciones = `
    Hoy es ${diaSemana} ${formatearFecha(hoy)}. Las fechas se escriben DD/MM/AAAA.
    Buscá en el texto que te paso la primera mención de una fecha, absoluta o relativa, y convertila en una fecha absoluta.
    Si la mención es una semana, usá su lunes: "la próxima semana" es el lunes de la semana siguiente.
    Si la mención es un mes, usá su primer día.
    Respondé en JSON con esta forma:

    { "expresion": "la próxima semana", "fecha": "DD/MM/AAAA" }

    En "expresion" copiá las palabras tal como aparecen en el texto.
    Si el texto no menciona ninguna fecha, respondé { "expresion": null, "fecha": null }.`;

  const respuesta = await completar(texto, instrucciones, { json: true });
  const { expresion, fecha } = JSON.parse(respuesta);
  if (!/^\d{2}\/\d{2}\/\d{4}$/.test(fecha ?? "")) return null;
  return { expresion, fecha };
}
```

Las instrucciones incluyen el día de la semana además de la fecha. Calcular qué día de la semana cae una fecha es una operación en la que el modelo se equivoca con facilidad; JavaScript la resuelve sin error.

Las instrucciones también aclaran el formato `DD/MM/AAAA`. Sin esa aclaración, `05/10/2026` es ambiguo: en Estados Unidos se lee como 10 de mayo.

`formatearFecha` arma la fecha a mano en lugar de usar `toISOString`. El motivo es que `toISOString` convierte la hora a UTC. En Argentina, 3 horas detrás de UTC, después de las 21:00 devolvería la fecha del día siguiente.

Las expresiones que hablan de un período, como "la próxima semana" o "en noviembre", no indican un día. Las instrucciones fijan el criterio: el lunes de esa semana o el primer día de ese mes. Sin un criterio, el modelo elegiría uno distinto en cada pedido.

La validación final comprueba que la fecha tenga la forma `DD/MM/AAAA`. Si el texto no menciona ninguna fecha, o si el modelo respondió otra cosa, la función devuelve `null`.

El parámetro `hoy` permite fijar la fecha de referencia, lo que hace las pruebas reproducibles. Los meses de `Date` empiezan en 0, así que septiembre es el 8:

```js
const hoy = new Date(2026, 8, 28); // lunes 28 de septiembre de 2026

await fechaAbsoluta("Nos vemos la próxima semana", hoy);
// { expresion: "la próxima semana", fecha: "05/10/2026" }

await fechaAbsoluta("Pasado mañana te llamo", hoy);
// { expresion: "Pasado mañana", fecha: "30/09/2026" }

await fechaAbsoluta("El turno es el viernes que viene a las 10", hoy);
// { expresion: "el viernes que viene", fecha: "02/10/2026" }

await fechaAbsoluta("Entregá el TP dentro de 3 semanas", hoy);
// { expresion: "dentro de 3 semanas", fecha: "19/10/2026" }

await fechaAbsoluta("El 9 de julio cerramos", hoy);
// { expresion: "El 9 de julio", fecha: "09/07/2027" }

await fechaAbsoluta("Te aviso cuando pueda", hoy);
// null
```

"El viernes que viene" también es ambiguo: puede ser el de esta semana o el de la próxima. El modelo elige una interpretación. Si la diferencia importa, las instrucciones deben definir el criterio, igual que hicimos con las semanas y los meses.

### convertirNumeroALetra

Escribir un número en letras es habitual en cheques, recibos y facturas.

```js
export async function convertirNumeroALetra(numero) {
  if (!Number.isFinite(numero)) {
    throw new TypeError("Se esperaba un número");
  }
  const instrucciones = `
    Escribí en palabras, en español, el número que te paso.
    Usá minúsculas y la palabra coma para los decimales.
    Respondé solo con el número escrito, sin punto final.
  `;
  return completar(String(numero), instrucciones);
}
```

```js
await convertirNumeroALetra(21);      // "veintiuno"
await convertirNumeroALetra(1234);    // "mil doscientos treinta y cuatro"
await convertirNumeroALetra(1000000); // "un millón"
await convertirNumeroALetra(3.5);     // "tres coma cinco"
```

La función valida la entrada antes de llamar a la API: no tiene sentido pagar un pedido para procesar un dato que no es un número.

Este problema, sin embargo, tiene una solución exacta con código: unos arreglos con unidades, decenas y centenas, y unas pocas reglas. Esa solución no cuesta dinero, responde al instante y nunca se equivoca. El modelo, en cambio, puede fallar con números largos. Está acá como ejemplo del patrón, no como la mejor herramienta para esta tarea. El modelo aporta valor cuando las reglas son difíciles de escribir, como en el caso siguiente.

### extraerTelefono

Un texto libre puede contener teléfonos escritos de muchas formas y, además, otros números que no son teléfonos: documentos, precios, fechas. Distinguirlos exige entender el texto. Una expresión regular encuentra secuencias de dígitos, pero no sabe que `30.123.456` es un DNI.

Como el resultado es una lista, conviene pedirlo en JSON, igual que en `fechaAbsoluta`.

```js
export async function extraerTelefono(texto) {
  const instrucciones = `
    Encontrá todos los números de teléfono que aparecen en el texto.
    Ignorá otros números, como documentos, precios o fechas.
    Respondé en JSON con la forma {"telefonos": ["..."]}, copiando cada teléfono tal como aparece en el texto.
    Si no hay ninguno, respondé {"telefonos": []}.
    `;
  const respuesta = await completar(texto, instrucciones, { json: true });

  let datos;
  try {
    datos = JSON.parse(respuesta);
  } catch {
    return [];
  }
  if (!Array.isArray(datos.telefonos)) {
    return [];
  }

  return datos.telefonos.map((telefono) => ({
    original: telefono,
    normalizado: telefono.replace(/[^\d+]/g, ""),
  }));
}
```

La función reparte el trabajo. El modelo hace lo que requiere entender el texto: encontrar los teléfonos y descartar el resto. JavaScript hace lo que tiene reglas fijas: quitar espacios, guiones y paréntesis para dejar solo dígitos y el signo `+`. No hay motivo para pagarle al modelo por algo que una línea de código resuelve sin error.

Aunque la API garantiza JSON válido, la función igual comprueba que exista el arreglo `telefonos`. Que el JSON sea válido no asegura que tenga la forma pedida.

```js
const texto = `Hola, soy Laura. Mi celular es 381 15-555-1234 y el fijo de la oficina
es (0381) 421-5678. Mi DNI es 30.123.456 y el alquiler sale $450.000.`;

console.log(await extraerTelefono(texto));
```

```text
[
  { original: '381 15-555-1234', normalizado: '381155551234' },
  { original: '(0381) 421-5678', normalizado: '03814215678' }
]
```

Si se necesita un control más estricto de la forma, la API admite `response_format` con `type: "json_schema"`. En ese modo se envía un esquema que describe exactamente los campos y sus tipos, y el modelo queda obligado a respetarlo.

## Enviar una imagen

Los modelos actuales, como GPT-6 Luna, también reciben imágenes. Pueden describirlas, responder preguntas sobre ellas y leer el texto que contienen. Esto último se llama OCR, reconocimiento óptico de caracteres.

### El contenido como arreglo de partes

Hasta ahora, el campo `content` de cada mensaje fue una cadena. También puede ser un arreglo de partes, donde cada parte es un texto o una imagen:

```json
{
  "model": "gpt-6-luna",
  "messages": [
    {
      "role": "user",
      "content": [
        { 
            "type": "text", 
            "text": "¿Qué dice este cartel?" 
        },
        {
            "type": "image_url",
            "image_url": { "url": "data:image/jpeg;base64,/9j/4AAQSkZJRgABAQ..." }
        }
      ]
    }
  ]
}
```

Una parte de imagen tiene el tipo `image_url` y una dirección. La dirección puede ser una URL pública, que el servicio descarga por su cuenta. Pero una imagen que está en tu computadora no tiene URL pública. En ese caso se envía la imagen misma dentro del JSON.

### Qué es base64

JSON es texto, y una imagen es una secuencia de bytes que no se puede escribir como texto tal cual. Base64 resuelve eso: convierte cualquier secuencia de bytes en texto usando solo 64 caracteres seguros, que son las letras mayúsculas y minúsculas, los dígitos, `+` y `/`.

Cada 3 bytes se convierten en 4 caracteres. Por eso una imagen en base64 ocupa un tercio más que el archivo original: un JPG de 300 KB viaja como unos 400 KB de texto.

El texto en base64 se envía como una URL de datos (data URL). Una URL de datos lleva el contenido adentro en lugar de apuntar a otro lugar, y tiene esta forma:

```text
data:<tipo MIME>;base64,<contenido en base64>
```

El tipo MIME le indica al servicio qué clase de archivo es: `image/jpeg`, `image/png`, `image/webp` o `image/gif`, que son los formatos que acepta.

### Leer la imagen desde un archivo

En Node, `readFile` lee un archivo como un `Buffer`, que es una secuencia de bytes. El método `toString("base64")` lo convierte a base64. Agregá esta importación al principio de `ia.mjs`:

```js
import { readFile } from "node:fs/promises";
import { extname } from "node:path";
```

Y esta función, que arma la URL de datos a partir de la ruta del archivo:

```js
const TIPOS_IMAGEN = {
  ".jpg": "image/jpeg",
  ".jpeg": "image/jpeg",
  ".png": "image/png",
  ".webp": "image/webp",
  ".gif": "image/gif",
};

async function leerImagen(ruta) {
  const tipo = TIPOS_IMAGEN[extname(ruta).toLowerCase()];
  if (!tipo) {
    throw new Error(`Formato de imagen no admitido: ${ruta}`);
  }
  const bytes = await readFile(ruta);
  return `data:${tipo};base64,${bytes.toString("base64")}`;
}
```

`extname` devuelve la extensión del archivo, con el punto incluido. La función busca en `TIPOS_IMAGEN` el tipo MIME correspondiente y rechaza cualquier otro formato antes de gastar un pedido.

`completar` no necesita cambios. Su primer parámetro va directo al campo `content` del mensaje, así que acepta tanto una cadena como un arreglo de partes.

### extraerFactura

Como ejemplo, leemos una foto o un escaneo de una factura y obtenemos sus datos de venta como un objeto de JavaScript.

```js
export async function extraerFactura(ruta) {
  const imagen = await leerImagen(ruta);

  const instrucciones = `
    Extraé los datos de la factura de la imagen.
    Respondé en JSON con esta forma:
    
    {
      "tipo": "A",
      "numero": "0001-00001234",
      "fecha": "AAAA-MM-DD",
      "emisor": { "nombre": "", "cuit": "" },
      "cliente": { "nombre": "", "cuit": "" },
      "items": [{ "descripcion": "", "cantidad": 0, "precioUnitario": 0, "subtotal": 0 }],
      "neto": 0,
      "iva": 0,
      "total": 0
    }
    
    Los importes van como números JSON, con punto decimal y sin separador de miles.
    Si un dato no aparece o no se puede leer, usá null.
  `;

  const contenido = [
    { type: "text", text: "Esta es la factura." },
    { type: "image_url", image_url: { url: imagen, detail: "high" } },
  ];

  const respuesta = await completar(contenido, instrucciones, { json: true });
  const factura = JSON.parse(respuesta);
  factura.advertencias = revisarFactura(factura);
  return factura;
}
```

Las instrucciones muestran la forma exacta del JSON esperado, con un ejemplo de cada campo. Como son una plantilla de texto de varias líneas, el JSON se puede escribir con sangría y un campo por línea, igual que en un archivo. Es la manera más directa de que el modelo respete los nombres y los tipos.

La indicación sobre los importes es necesaria. En una factura argentina, mil doscientos pesos con cincuenta centavos se escribe `1.234,50`. En JSON y en JavaScript, en cambio, el punto es el separador decimal y la coma no existe dentro de un número. Sin esa indicación, el modelo podría devolver `1.234` y el programa lo leería como uno coma dos.

`detail: "high"` le pide al servicio que analice la imagen en alta resolución. Consume más tokens, pero en una factura los números son chicos y un dígito mal leído cambia el resultado. Con `"low"` el análisis es más barato y alcanza para describir una foto, no para leer una factura.

### Revisar lo que leyó el modelo

El OCR con un modelo es muy bueno, pero no infalible. Una mancha, un pliegue o una foto torcida pueden hacer que lea un 8 donde hay un 3. Una factura tiene una ventaja: sus números tienen que cerrar. Los subtotales suman el neto, y el neto más el IVA da el total. Esa comprobación la hace JavaScript sin costo.

```js
function revisarFactura(factura) {
  const advertencias = [];
  const cerca = (a, b) => Math.abs(a - b) < 0.01;

  for (const item of factura.items ?? []) {
    if (!cerca(item.cantidad * item.precioUnitario, item.subtotal)) {
      advertencias.push(`El subtotal de "${item.descripcion}" no coincide con cantidad por precio`);
    }
  }

  const sumaItems = (factura.items ?? []).reduce((suma, item) => suma + item.subtotal, 0);
  if (!cerca(sumaItems, factura.neto)) {
    advertencias.push("La suma de los ítems no coincide con el neto");
  }

  if (!cerca(factura.neto + factura.iva, factura.total)) {
    advertencias.push("El neto más el IVA no coincide con el total");
  }

  return advertencias;
}
```

Los importes se comparan con una tolerancia de un centavo, porque las operaciones con decimales en JavaScript acumulan pequeños errores de redondeo: `0.1 + 0.2` da `0.30000000000000004`.

Esta revisión no corrige nada. Solo avisa. Si hay advertencias, la factura debe pasar por una persona antes de usarse. En las facturas B y C el IVA no aparece discriminado; en ese caso el modelo devuelve `null` y la última comprobación falla, así que un sistema real debería tratar cada tipo por separado.

### Probar la función

```js
import { extraerFactura } from "./ia.mjs";

const factura = await extraerFactura("factura.jpg");
console.log(factura);
```

Con la foto de una factura A, un resultado posible es:

```text
{
  tipo: 'A',
  numero: '0003-00004512',
  fecha: '2026-09-15',
  emisor: { nombre: 'Librería El Aula SRL', cuit: '30-71234567-8' },
  cliente: { nombre: 'Estudio Contable Norte SA', cuit: '30-70987654-3' },
  items: [
    { descripcion: 'Resma A4 75 g', cantidad: 10, precioUnitario: 8500, subtotal: 85000 },
    { descripcion: 'Tóner HP 105A', cantidad: 2, precioUnitario: 42000, subtotal: 84000 }
  ],
  neto: 169000,
  iva: 35490,
  total: 204490,
  advertencias: []
}
```

La lista de advertencias vacía indica que todas las cuentas cierran. Eso no garantiza que cada dato sea correcto, por ejemplo un CUIT mal leído, pero descarta los errores más costosos: los de los importes.

Una imagen consume bastantes más tokens que un texto corto, y en alta resolución todavía más. Antes de procesar cientos de facturas conviene probar con unas pocas y mirar el campo `usage` de las respuestas para estimar el costo.

## Generar una imagen

La sección anterior envió una imagen al modelo. Ahora hacemos el camino inverso: le damos una descripción en texto, que en este contexto se llama prompt, y recibimos una imagen.

### Un servicio distinto

Las imágenes no se generan con Chat Completions. OpenAI tiene un servicio aparte con modelos propios para esta tarea:

- método: `POST`
- dirección: `https://api.openai.com/v1/images/generations`
- encabezados: los mismos que antes, `Authorization` y `Content-Type`

A fines de septiembre de 2026, los modelos actuales son 2 variantes de GPT Image 2.5:

- `gpt-image-2.5-flare`: el más rápido, pensado para la generación de todos los días
- `gpt-image-2.5-sunburst`: más lento, pensado para cuando importa la precisión al editar imágenes

Para generar imágenes desde cero alcanza con `gpt-image-2.5-flare`.

### El pedido

```bash
curl https://api.openai.com/v1/images/generations \
  -H "Authorization: Bearer $OPENAI_API_KEY" \
  -H "Content-Type: application/json" \
  -d '{
    "model": "gpt-image-2.5-flare",
    "prompt": "Ilustración plana de una computadora antigua con una lupa encima, colores pastel, fondo liso, sin texto",
    "size": "1536x1024",
    "quality": "medium",
    "output_format": "png"
  }'
```

`prompt` es la descripción de la imagen. Funciona en español. Conviene describir el tema, el estilo, los colores y la composición. Si no querés letras en la imagen, hay que pedirlo: estos modelos escriben texto con bastante precisión y a veces lo agregan por su cuenta.

`size` son las dimensiones en píxeles, con la forma `ANCHOxALTO`. Los tamaños estándar son `1024x1024`, `1536x1024` y `1024x1536`. Estos modelos aceptan también otros tamaños, con 2 condiciones: el ancho y el alto tienen que ser múltiplos de 16, y la proporción tiene que estar entre 1:3 y 3:1. El máximo es `3840x2160`, y por encima de `2560x1440` el resultado se considera experimental.

`quality` elige la calidad: `low`, `medium`, `high`, `xhigh` o `max`. Si no se indica, vale `auto` y el modelo decide. A mayor calidad, más tiempo y más costo; `low` sirve para probar prompts rápido y barato.

`output_format` elige el formato del archivo: `png` (el valor por defecto), `jpeg` o `webp`. JPEG se genera más rápido que PNG.

### La respuesta

```json
{
  "created": 1790000000,
  "data": [
    { "b64_json": "iVBORw0KGgoAAAANSUhEUgAABgAAAAQACAIAAAD..." }
  ],
  "usage": {
    "input_tokens": 31,
    "output_tokens": 4160,
    "total_tokens": 4191
  }
}
```

La imagen llega en `data[0].b64_json`, codificada en base64. Es el mismo formato de la sección anterior, pero en sentido contrario: antes convertíamos bytes a base64 para enviarlos; ahora convertimos base64 a bytes para guardarlos. Esta vez el texto viene solo, sin el prefijo `data:image/png;base64,` de las URL de datos.

La generación se cobra por tokens, como el texto, pero una imagen produce miles de tokens de salida. El campo `usage` permite saber cuánto costó cada una.

### generarImagen

`generarImagen` recibe el prompt y la ruta del archivo donde guardar la imagen. El formato sale de la extensión de esa ruta. Primero, ampliá la importación de `node:fs/promises` al principio de `ia.mjs` para incluir `writeFile`:

```js
import { readFile, writeFile } from "node:fs/promises";
```

Y agregá la función:

```js
const URL_IMAGENES = "https://api.openai.com/v1/images/generations";
const MODELO_IMAGEN = "gpt-image-2.5-flare";

const FORMATOS_SALIDA = {
  ".png": "png",
  ".jpg": "jpeg",
  ".jpeg": "jpeg",
  ".webp": "webp",
};

export async function generarImagen(prompt, ruta, opciones = {}) {
  const formato = FORMATOS_SALIDA[extname(ruta).toLowerCase()];
  if (!formato) {
    throw new Error(`Formato de salida no admitido: ${ruta}`);
  }

  const respuesta = await fetch(URL_IMAGENES, {
    method: "POST",
    headers: {
      "Authorization": `Bearer ${process.env.OPENAI_API_KEY}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      model: MODELO_IMAGEN,
      prompt,
      size: opciones.dimensiones ?? "1024x1024",
      quality: opciones.calidad ?? "medium",
      output_format: formato,
    }),
  });

  if (!respuesta.ok) {
    const detalle = await respuesta.text();
    throw new Error(`La API respondió ${respuesta.status}: ${detalle}`);
  }

  const datos = await respuesta.json();
  const bytes = Buffer.from(datos.data[0].b64_json, "base64");
  await writeFile(ruta, bytes);
  return ruta;
}
```

Esta función no usa `completar`, porque el servicio es otro: cambian la dirección, los campos del pedido y la forma de la respuesta. Lo que se repite es el patrón: `fetch` con la clave en el encabezado, revisión de `respuesta.ok` y extracción del dato que interesa.

`Buffer.from` con `"base64"` hace la conversión inversa a `toString("base64")`: recibe el texto y devuelve los bytes originales. `writeFile` los guarda en el archivo. `Buffer` está disponible en Node sin importarlo.

Las opciones tienen valores por defecto razonables: una imagen cuadrada de calidad media. Quien necesita otra cosa las indica; quien no, no tiene que pensar en ellas.

### Probar la función

```js
import { generarImagen } from "./ia.mjs";

await generarImagen(
  "Ilustración plana de una computadora antigua con una lupa encima, colores pastel, fondo liso, sin texto",
  "portada.png",
  { dimensiones: "1536x1024" }
);
console.log("Imagen guardada en portada.png");
```

Generar una imagen tarda bastante más que responder un texto: entre algunos segundos y cerca de un minuto, según el tamaño y la calidad. Si el prompt pide algo que infringe las políticas de contenido de OpenAI, la API rechaza el pedido con un error 400 y un mensaje que lo explica.

Una forma útil de trabajar es probar variantes del prompt con `calidad: "low"`, que es rápida y barata, y generar la versión final con `"high"` recién cuando el prompt da el resultado buscado.

## Transformar una imagen

`generarImagen` parte de cero. Muchas veces conviene partir de una imagen existente y pedir un cambio: quitar el fondo, cambiar el estilo o, como en el ejemplo de esta sección, convertir una selfie en una foto carnet.

### El servicio de edición

La edición usa otro servicio, con la misma idea que la generación:

- método: `POST`
- dirección: `https://api.openai.com/v1/images/edits`
- encabezados: los mismos de siempre

El cuerpo lleva los mismos campos que la generación (`model`, `prompt`, `size`, `quality`, `output_format`) y uno más, `images`: un arreglo con las imágenes de partida. Cada una se indica con una URL, y esa URL puede ser una URL de datos en base64, la misma que arma `leerImagen` para el OCR de facturas:

```json
{
  "model": "gpt-image-2.5-sunburst",
  "prompt": "Convertí esta selfie en una foto carnet con fondo blanco liso.",
  "images": [
    { "image_url": "data:image/jpeg;base64,/9j/4AAQSkZJRgABAQ..." }
  ],
  "size": "1024x1024",
  "quality": "high",
  "output_format": "jpeg"
}
```

El arreglo admite hasta 16 imágenes. Con más de una, el prompt puede combinarlas: por ejemplo, poner el producto de una foto sobre el fondo de otra. La respuesta tiene la misma forma que en la generación: la imagen nueva llega en `data[0].b64_json`.

Para editar conviene `gpt-image-2.5-sunburst`, la variante pensada para cuando importa la precisión: es la que mejor conserva los detalles de la imagen original.

`size` acepta además el valor `auto`, que deja que el modelo elija un tamaño cercano a la proporción de la imagen de partida.

### transformarImagen

La función recibe la imagen original, el prompt y la ruta donde guardar el resultado. Reutiliza `leerImagen` y `FORMATOS_SALIDA`, que ya están en `ia.mjs`:

```js
const URL_EDICIONES  = "https://api.openai.com/v1/images/edits";
const MODELO_EDICION = "gpt-image-2.5-sunburst";

export async function transformarImagen(rutaOriginal, prompt, rutaNueva, opciones = {}) {
  const formato = FORMATOS_SALIDA[extname(rutaNueva).toLowerCase()];
  if (!formato) {
    throw new Error(`Formato de salida no admitido: ${rutaNueva}`);
  }
  const original = await leerImagen(rutaOriginal);

  const respuesta = await fetch(URL_EDICIONES, {
    method: "POST",
    headers: {
      "Authorization": `Bearer ${process.env.OPENAI_API_KEY}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      model: MODELO_EDICION,
      prompt,
      images: [{ image_url: original }],
      size: opciones.dimensiones ?? "auto",
      quality: opciones.calidad ?? "medium",
      output_format: formato,
    }),
  });

  if (!respuesta.ok) {
    const detalle = await respuesta.text();
    throw new Error(`La API respondió ${respuesta.status}: ${detalle}`);
  }

  const datos = await respuesta.json();
  await writeFile(rutaNueva, Buffer.from(datos.data[0].b64_json, "base64"));
  return rutaNueva;
}
```

La función junta las 2 direcciones de base64 que vimos en el apunte. `leerImagen` convierte la foto en base64 para enviarla, igual que en el OCR, y `Buffer.from` convierte la respuesta de base64 a bytes para guardarla, igual que en `generarImagen`.

El servicio de edición acepta imágenes PNG, JPEG y WEBP. `leerImagen` también deja pasar GIF, que acá la API rechazaría con un error 400.

### fotoCarnet

`transformarImagen` es tan general como `completar`: sirve para cualquier cambio, y quien la usa tiene que escribir el prompt cada vez. Igual que hicimos con `traducir` a partir de `completar`, armamos una función específica que esconde el prompt:

```js
export async function fotoCarnet(rutaSelfie, rutaFoto) {
  const prompt = `
    Convertí esta selfie en una foto carnet.
    Fondo blanco liso y uniforme.
    Encuadre de frente, centrado, desde los hombros hasta un poco arriba de la cabeza.
    Iluminación pareja, sin sombras en la cara ni en el fondo.
    Expresión neutra, mirada a la cámara.
    Sin anteojos de sol, gorra ni otros accesorios que tapen la cara.
    Conservá la ropa que tiene puesta.
    Conservá exactamente los rasgos de la cara, el color de piel, el peinado y la edad aparente.
  `;

  return transformarImagen(rutaSelfie, prompt, rutaFoto, {
    dimensiones: "1024x1024",
    calidad: "high",
  });
}
```

El prompt describe el resultado con los requisitos habituales de una foto carnet, uno por línea. La última oración es la más importante: sin ella, el modelo tiende a "mejorar" la cara, y una foto carnet que no se parece a la persona no sirve.

La foto sale cuadrada porque el formato habitual de una foto carnet es de 4 × 4 cm. Para imprimirla, alcanza con ajustar el tamaño al imprimir: 1024 píxeles en 4 cm dan una resolución de sobra.

```js
import { fotoCarnet } from "./ia.mjs";

await fotoCarnet("selfie.jpg", "foto-carnet.jpg");
console.log("Foto carnet guardada en foto-carnet.jpg");
```

### Lo que hay que tener en cuenta

El resultado no es una foto: es una imagen generada a partir de una foto. Aunque el prompt pida conservar los rasgos, el modelo puede cambiar detalles de la cara. Conviene mirar el resultado con atención antes de usarlo, y generar otra versión si no se parece.

Por eso sirve para usos informales, como una credencial de estudiante, un carnet de club o la foto de un currículum. No sirve para documentos oficiales: en Argentina, la foto del DNI y del pasaporte la toma el Registro Nacional de las Personas en el momento del trámite.

Por último, la foto de una cara es un dato personal. Al usar la función, la selfie viaja a los servidores de OpenAI. Hacelo solo con fotos tuyas o de personas que estén de acuerdo.

## Un chat en el navegador

Un chat es la aplicación más conocida de esta API, y la que mejor muestra que la API no recuerda nada. En esta sección armamos una página web autocontenida con un chat. La página guarda la conversación y la envía completa en cada pedido, y tiene un panel que muestra exactamente qué viaja en cada pedido.

La interfaz usa ArrowJS, una biblioteca de interfaz muy chica que no necesita compilación: se importa desde un CDN y funciona con JavaScript común.

### Una excepción a la regla de la clave

Al principio del apunte dijimos que la clave nunca llega al navegador. Esta página rompe esa regla a propósito: pide la clave la primera vez, la guarda en `localStorage` y la usa desde el navegador para llamar a la API.

Es aceptable solo porque la página corre en tu computadora, con tu propia clave, y nadie más la usa. `localStorage` guarda datos en el navegador, asociados al origen de la página, y los conserva al cerrarla. Cualquier programa que corra en esa página puede leerlos, incluidas las extensiones del navegador y cualquier código ajeno que se cuele en ella.

En una aplicación publicada para otras personas, la página le habla a tu servidor y el servidor le habla a OpenAI. La función `enviarChat` de esta página pasaría al servidor casi sin cambios.

### La historia de mensajes

La página guarda la conversación en un arreglo llamado `historia`. Cada vez que el usuario envía un mensaje, pasan 3 cosas:

1. La página agrega el mensaje del usuario al final de la historia.
2. La página envía la historia completa a la API.
3. La página agrega la respuesta del modelo, con el rol `assistant`, al final de la historia.

En el tercer mensaje de una conversación, el pedido lleva los 2 intercambios anteriores y la pregunta nueva:

```json
[
  { "role": "developer", "content": "Sos un asistente amable. Respondé en español, en pocas oraciones y sin formato Markdown." },
  { "role": "user",      "content": "¿Cuál es la capital de Francia?" },
  { "role": "assistant", "content": "La capital de Francia es París." },
  { "role": "user",      "content": "¿Y cuántos habitantes tiene?" },
  { "role": "assistant", "content": "París tiene unos 2 millones de habitantes, y su área metropolitana, más de 12 millones." },
  { "role": "user",      "content": "¿Y la de Italia?" }
]
```

La última pregunta no se entiende sola. "¿Y la de Italia?" tiene sentido porque el modelo ve la primera pregunta, que habla de capitales. Si la página enviara solo el último mensaje, el modelo no sabría de qué se habla.

El mensaje `developer` no forma parte de la historia. La función `armarMensajes` lo agrega al principio de cada pedido. Así las instrucciones se envían siempre, pero no se muestran como un mensaje más ni se guardan en la conversación.

### ArrowJS en 3 ideas

Para leer la página alcanza con 3 ideas de ArrowJS.

`reactive` recibe un objeto y devuelve un objeto reactivo: un objeto que avisa cada vez que cambia una de sus propiedades.

```js
const estado = reactive({ historia: [], esperando: false, error: "" });
```

`html` es una función que se usa con plantillas de texto. Devuelve una plantilla que se dibuja dentro de un elemento de la página:

```js
html`<h1>Chat</h1>`(document.getElementById("app"));
```

Dentro de la plantilla, un valor común se dibuja una sola vez. Una función, en cambio, se vuelve a ejecutar cada vez que cambia algún dato reactivo que usó. Esta es la regla central de ArrowJS:

```js
html`<p>${estado.error}</p>`       // se dibuja una vez y no cambia
html`<p>${() => estado.error}</p>` // se actualiza cada vez que cambia estado.error
```

Por último, los atributos que empiezan con `@` asocian un evento con una función, como `@click` o `@submit`.

### El programa

La página es un solo archivo, `chat.html`, que se abre directamente en el navegador. Además del programa, el archivo tiene la hoja de estilos: la tipografía, los colores claros y oscuros según la preferencia del sistema, y la adaptación a pantallas chicas. Acá mostramos solo el programa, que es lo que importa para entender el chat:

```js
import { html, reactive } from "https://esm.sh/@arrow-js/core@1";

const URL_API = "https://api.openai.com/v1/chat/completions";
const MODELO = "gpt-6-luna";
const INSTRUCCIONES = "Sos un asistente amable. Respondé en español, en pocas oraciones y sin formato Markdown.";
const NOMBRE_CLAVE  = "openai-api-key";
const SUGERENCIAS   = [
  "¿Cuál es la capital de Francia?",
  "Explicame qué es un token",
  "Dame una idea para un proyecto web",
];

// La clave de API

function leerClave() {
  return localStorage.getItem(NOMBRE_CLAVE) ?? "";
}

function guardarClave(clave) {
  localStorage.setItem(NOMBRE_CLAVE, clave);
}

function olvidarClave() {
  localStorage.removeItem(NOMBRE_CLAVE);
}

// La llamada a la API

function armarMensajes(historia) {
  return [{ role: "developer", content: INSTRUCCIONES }, ...historia];
}

async function enviarChat(historia, clave) {
  const datos = await llamarApi({
    model: MODELO,
    messages: armarMensajes(historia),
    reasoning_effort: "low",
  }, clave);
  return (datos.choices[0].message.content ?? "").trim();
}

const MAX_REINTENTOS = 3;

async function llamarApi(cuerpo, clave, senal) {
  for (let intento = 0; ; intento++) {
    const respuesta = await fetch(URL_API, {
      method: "POST",
      signal: senal,
      headers: {
        "Content-Type":  "application/json",
        "Authorization": `Bearer ${clave}`,
      },
      body: JSON.stringify(cuerpo),
    });
    if (respuesta.ok) return respuesta.json();

    const error = await leerError(respuesta);
    if (!esReintentable(error) || intento === MAX_REINTENTOS) throw error;
    await esperar(segundosDeEspera(respuesta, intento), senal);
  }
}

async function leerError(respuesta) {
  let detalle = {};
  try {
    detalle = (await respuesta.json()).error ?? {};
  } catch {
    // la respuesta no trae JSON
  }
  const error = new Error(describirError(respuesta.status, detalle));
  error.status = respuesta.status;
  error.code   = detalle.code;
  return error;
}

function describirError(status, { message, code }) {
  if (status === 401) return "La clave guardada no es válida. Ingresá otra.";
  if (code === "insufficient_quota") return "La cuenta no tiene saldo o el proyecto alcanzó su límite de gasto.";
  const texto = message || `La API respondió con el código ${status}.`;
  return code ? `${texto} (${status}, ${code})` : `${texto} (${status})`;
}

function esReintentable(error) {
  if (error.status === 429) return error.code !== "insufficient_quota";
  return error.status >= 500;
}

function segundosDeEspera(respuesta, intento) {
  const indicado = Number(respuesta.headers.get("retry-after"));
  return indicado > 0 ? indicado : 2 ** intento;
}

function esperar(segundos, senal) {
  return new Promise((resolver, rechazar) => {
    const temporizador = setTimeout(resolver, segundos * 1000);
    senal?.addEventListener("abort", () => {
      clearTimeout(temporizador);
      rechazar(new DOMException("Detenido", "AbortError"));
    }, { once: true });
  });
}

// El estado

const estado = reactive({
  clave: leerClave(),
  historia: [],
  esperando: false,
  error: "",
  verHistoria: false,
});

function historiaPlana() {
  return estado.historia.map(({ role, content }) => ({ role, content }));
}

// Las acciones

async function responder() {
  estado.esperando = true;
  estado.error     = "";
  desplazarAlFinal();

  try {
    const contenido = await enviarChat(historiaPlana(), estado.clave);
    estado.historia = [...historiaPlana(), { role: "assistant", content: contenido }];
  } catch (error) {
    estado.error = error.message;
    if (error.status === 401) {
      olvidarClave();
      estado.clave = "";
    }
  } finally {
    estado.esperando = false;
    desplazarAlFinal();
  }
}

function enviarTexto(texto) {
  texto = texto.trim();
  if (!texto || estado.esperando) return false;
  estado.historia = [...historiaPlana(), { role: "user", content: texto }];
  responder();
  return true;
}

function alEnviar(evento) {
  evento.preventDefault();
  const entrada = evento.target.elements.entrada;
  if (enviarTexto(entrada.value)) {
    entrada.value = "";
    ajustarAltura(entrada);
  }
  entrada.focus();
}

function alTeclear(evento) {
  if (evento.key === "Enter" && !evento.shiftKey && !evento.isComposing) {
    evento.preventDefault();
    evento.target.form.requestSubmit();
  }
}

function alGuardarClave(evento) {
  evento.preventDefault();
  const clave = evento.target.elements.clave.value.trim();
  if (!clave) return;
  guardarClave(clave);
  estado.clave = clave;
  estado.error = "";
}

function nuevaConversacion() {
  estado.historia = [];
  estado.error = "";
  document.getElementById("entrada")?.focus();
}

function cambiarClave() {
  olvidarClave();
  estado.clave = "";
}

function alternarHistoria() {
  estado.verHistoria = !estado.verHistoria;
}

// Ayudas de la interfaz

function ajustarAltura(entrada) {
  entrada.style.height = "auto";
  entrada.style.height = `${entrada.scrollHeight}px`;
}

function desplazarAlFinal() {
  requestAnimationFrame(() => {
    const conversacion = document.getElementById("conversacion");
    if (conversacion) conversacion.scrollTop = conversacion.scrollHeight;
  });
}

function resumenPedido() {
  const mensajes = armarMensajes(historiaPlana());
  const caracteres = mensajes.reduce((total, m) => total + m.content.length, 0);
  return `El próximo pedido lleva ${mensajes.length} mensajes y ${caracteres} caracteres.`;
}

// Las vistas

function vistaClave() {
  return html`
    <main class="bienvenida">
      <h1>Chat</h1>
      <p>Para conversar hace falta una clave de API de OpenAI. Se guarda solo en este navegador.</p>
      ${() => estado.error ? html`<div class="aviso"><p>${estado.error}</p></div>` : ""}
      <form class="form-clave" @submit="${alGuardarClave}">
        <label for="clave">Clave de API</label>
        <input id="clave" name="clave" type="password" placeholder="sk-proj-…" autocomplete="off" required>
        <button class="primario">Guardar clave</button>
      </form>
    </main>
  `;
}

function vistaVacia() {
  return html`
    <div class="vacio">
      <h2>¿De qué querés hablar?</h2>
      <p>Cada pedido lleva la conversación entera. Abrí Historia para ver cómo crece.</p>
      <div class="sugerencias">
        ${SUGERENCIAS.map((texto) => html`
          <button class="sugerencia" @click="${() => enviarTexto(texto)}">${texto}</button>
        `)}
      </div>
    </div>
  `;
}

function vistaHistoria() {
  return html`
    <aside class="historia" aria-label="Historia enviada">
      <header>
        <h2>Lo que viaja en cada pedido</h2>
        <button class="boton" @click="${alternarHistoria}">Cerrar</button>
      </header>
      <p>${() => resumenPedido()}</p>
      <pre>${() => JSON.stringify(armarMensajes(historiaPlana()), null, 2)}</pre>
    </aside>
  `;
}

function vistaChat() {
  return html`
    <div class="${() => estado.verHistoria ? "app con-historia" : "app"}">
      <header class="barra">
        <div class="marca">
          <h1>Chat</h1>
          <span>${MODELO}</span>
        </div>
        <nav class="acciones">
          <button class="boton" aria-pressed="${() => String(estado.verHistoria)}" @click="${alternarHistoria}">
            Historia<span class="cuenta">${() => estado.historia.length}</span>
          </button>
          <button class="boton" disabled="${() => estado.historia.length === 0 || estado.esperando}" @click="${nuevaConversacion}">
            Nueva conversación
          </button>
          <button class="boton" @click="${cambiarClave}">Cambiar clave</button>
        </nav>
      </header>

      <main class="conversacion" id="conversacion">
        <div class="hilo" aria-live="polite">
          ${() => estado.historia.length === 0 && !estado.esperando ? vistaVacia() : ""}
          ${() => estado.historia.map((mensaje) => html`
            <div class="${"mensaje " + mensaje.role}">${mensaje.content}</div>
          `)}
          ${() => estado.esperando ? html`
            <div class="mensaje assistant escribiendo" aria-label="El asistente está escribiendo">
              <span></span><span></span><span></span>
            </div>
          ` : ""}
          ${() => estado.error ? html`
            <div class="aviso">
              <p>${estado.error}</p>
              <button class="boton" @click="${responder}">Reintentar</button>
            </div>
          ` : ""}
        </div>
      </main>

      <div>
        <form class="compositor" @submit="${alEnviar}">
          <textarea id="entrada" name="entrada" rows="1" placeholder="Escribí un mensaje" aria-label="Mensaje"
            @keydown="${alTeclear}" @input="${(evento) => ajustarAltura(evento.target)}"></textarea>
          <button class="enviar" aria-label="Enviar" disabled="${() => estado.esperando}">
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">
              <path d="M12 19V5M5 12l7-7 7 7"/>
            </svg>
          </button>
        </form>
        <p class="ayuda">Enter envía. Mayúscula + Enter agrega una línea.</p>
      </div>

      ${() => estado.verHistoria ? vistaHistoria() : ""}
    </div>
  `;
}

html`${() => estado.clave ? vistaChat() : vistaClave()}`(document.getElementById("app"));
```

### Cómo funciona

El programa está dividido en partes: la clave, la llamada a la API, el estado, las acciones, algunas ayudas de la interfaz y las vistas.

La clave se maneja con 3 funciones chicas que leen, guardan y borran la clave en `localStorage`. El estado arranca con la clave guardada, si existe. La última línea del programa decide qué se muestra: si hay clave, el chat; si no, un formulario para ingresarla. Por eso la clave se pide solo la primera vez. El botón Cambiar clave la borra, y el formulario vuelve a aparecer.

`enviarChat` es la abstracción de la llamada. Recibe la historia y la clave, y devuelve el texto de la respuesta, igual que `completar` pero con una conversación en lugar de un texto suelto. Quien la usa no sabe nada de URLs, encabezados ni del formato de la respuesta.

El trabajo con la red lo hace `llamarApi`, que recibe el cuerpo del pedido y devuelve la respuesta ya convertida desde JSON. Además, se ocupa de los errores:

- `leerError` lee el cuerpo del error y arma una excepción con el código de estado (`status`) y el código de error de OpenAI (`code`).
- `describirError` arma el mensaje que ve el usuario. Traduce los casos conocidos, como la clave inválida o la falta de saldo, y en el resto muestra el mensaje original de la API con sus códigos. Un mensaje genérico esconde la causa real; el original, aunque esté en inglés, permite diagnosticarla.
- `esReintentable` decide si vale la pena volver a intentar. Un 429 por exceso de pedidos o un error 500 a 503 suelen ser pasajeros; un 429 con el código `insufficient_quota` significa que no hay saldo, y reintentar no lo arregla.
- `segundosDeEspera` usa el encabezado `Retry-After` si está disponible y, si no, espera 1, 2 y 4 segundos en los intentos sucesivos. Desde el navegador ese encabezado casi nunca se puede leer: por la política CORS, el navegador solo le muestra al programa los encabezados que el servidor declara expresamente como visibles.
- `esperar` es una pausa que se puede cancelar: si llega la señal de detener, corta la espera en lugar de completarla.

Si después de 3 reintentos el error persiste, `llamarApi` lanza la excepción. Si el código es 401, la clave guardada no sirve: `responder` la borra y la página vuelve a pedirla, sin perder la conversación.

Las acciones siguen los 3 pasos de la historia. `enviarTexto` agrega el mensaje del usuario y llama a `responder`, que envía la historia y agrega la respuesta. Las separamos para que Reintentar pueda llamar solo a `responder`: el mensaje del usuario ya está en la historia y no hay que agregarlo de nuevo. Mientras espera, `estado.esperando` vale `true`, lo que muestra la animación de escritura y deshabilita el botón de enviar. El bloque `finally` lo vuelve a `false` tanto si el pedido salió bien como si falló.

`alEnviar` responde al envío del formulario. `preventDefault` evita que el navegador recargue la página, que es lo que hace un formulario por defecto. `alTeclear` hace que Enter envíe el mensaje y que Mayúscula más Enter agregue una línea nueva. La condición `isComposing` evita enviar mientras se escribe un carácter compuesto, como una letra con tilde en algunos teclados.

La historia nunca se modifica con `push`. Cada cambio arma un arreglo nuevo y lo asigna a `estado.historia`. Asignar una propiedad es el cambio que un objeto reactivo detecta con más claridad, y así la vista se actualiza siempre. `historiaPlana` copia cada mensaje en un objeto común con solo `role` y `content`, para que a la API viajen datos simples, sin nada agregado por la biblioteca.

Las ayudas de la interfaz resuelven 2 detalles de uso. `ajustarAltura` hace crecer la caja de texto a medida que se escribe. `desplazarAlFinal` baja la conversación hasta el último mensaje. Usa `requestAnimationFrame` para esperar a que ArrowJS termine de dibujar antes de medir la altura.

Cada vista es una función que devuelve una plantilla. `vistaChat` arma la barra superior, la conversación y la caja de texto. Cuando la conversación está vacía muestra `vistaVacia`, con sugerencias que envían una pregunta con un clic. En la lista de mensajes, la clase de cada uno es su rol, `user` o `assistant`, y la hoja de estilos usa esa clase para darle a cada rol su aspecto. Cuando el atributo `disabled` recibe `false`, ArrowJS lo quita del botón, y cuando recibe `true`, lo agrega.

`vistaHistoria` es el panel lateral que se abre con el botón Historia. Muestra el arreglo `messages` tal como viaja en el próximo pedido, con las instrucciones incluidas, y cuántos mensajes y caracteres lleva. Conviene tenerlo abierto mientras se conversa: se ve cómo el arreglo crece con cada intercambio y, con él, lo que se paga en cada pedido.

## Un asistente de programación

Hasta ahora, el modelo solo producía texto. Con herramientas puede hacer cosas: leer un archivo, consultar una base de datos, enviar un correo. En esta sección armamos `asistente.html`, una página que accede a una carpeta de tu computadora y le da al modelo 3 herramientas: listar, leer y escribir archivos. Con eso alcanza para un asistente de programación que explora un proyecto, lo entiende y lo modifica.

### El modelo no ejecuta nada

La idea central de las herramientas es esta: el modelo no ejecuta nada. Solo pide. El programa le describe qué herramientas existen; el modelo, en lugar de responder con texto, puede responder con un pedido del tipo "ejecutá `leer_archivo` con la ruta `index.js`". El programa ejecuta la función, le devuelve el resultado y vuelve a llamar a la API. El modelo decide qué hacer; el programa lo hace.

Esto tiene 2 consecuencias. El modelo solo puede hacer lo que el programa le permite. Y el programa controla cada acción: puede validarla, limitarla o pedirle permiso al usuario antes de ejecutarla.

### Cómo se declara una herramienta

Las herramientas viajan en el campo `tools` del pedido, junto a `model` y `messages`. Cada una se describe con un nombre, una explicación y los parámetros que recibe:

```json
{
  "type": "function",
  "function": {
    "name": "leer_archivo",
    "description": "Devuelve el contenido de un archivo de texto del proyecto.",
    "parameters": {
      "type": "object",
      "properties": {
        "ruta": { "type": "string", "description": "Ruta del archivo, relativa al proyecto." }
      },
      "required": ["ruta"],
      "additionalProperties": false
    },
    "strict": true
  }
}
```

Los parámetros se describen con JSON Schema, un formato estándar para describir la forma de un objeto JSON. Este esquema dice que los argumentos son un objeto con una propiedad `ruta` de tipo texto, obligatoria, y ninguna otra.

`strict: true` obliga al modelo a respetar el esquema al pie de la letra. A cambio, exige 2 condiciones: todas las propiedades deben figurar en `required` y `additionalProperties` debe valer `false`. Por eso, en `listar_archivos`, la ruta es obligatoria y la raíz del proyecto se indica con una cadena vacía.

Las descripciones importan tanto como el código. El modelo decide cuándo y cómo usar cada herramienta leyendo solo su nombre y su descripción. Una descripción vaga produce un uso torpe.

### La respuesta con un pedido de herramienta

Cuando el modelo quiere usar una herramienta, la respuesta trae el campo `tool_calls` en lugar de texto:

```json
{
  "role": "assistant",
  "content": null,
  "tool_calls": [
    {
      "id": "call_Xy12",
      "type": "function",
      "function": { "name": "leer_archivo", "arguments": "{\"ruta\":\"index.js\"}" }
    }
  ]
}
```

En este caso, `finish_reason` vale `tool_calls`. El campo `arguments` es una cadena con JSON adentro, no un objeto, así que hay que convertirlo con `JSON.parse`. Una sola respuesta puede pedir varias herramientas a la vez; por ejemplo, leer 3 archivos.

### El resultado de la herramienta

El programa ejecuta cada pedido y agrega a la historia 2 cosas. Primero, el mensaje del modelo con sus `tool_calls`, tal como llegó. Después, un mensaje con el rol `tool` por cada pedido, con el resultado:

```json
{ "role": "tool", "tool_call_id": "call_Xy12", "content": "import fs from 'node:fs';\n..." }
```

`tool_call_id` indica a qué pedido responde el resultado. La API exige que cada pedido tenga su respuesta: si falta alguna, rechaza el siguiente pedido con un error 400.

El resultado es siempre texto. Si la herramienta falla, el resultado describe el error, por ejemplo `Error: no existe ese archivo o carpeta.`. No conviene lanzar una excepción, porque cortaría el trabajo. Es mejor informarle el error al modelo: casi siempre lo corrige solo, por ejemplo listando la carpeta para encontrar la ruta correcta.

### El ciclo del agente

Un programa que llama al modelo, ejecuta las herramientas que pide y repite hasta que el modelo responde con texto se llama agente. El ciclo tiene estos pasos:

1. El programa envía la historia y la lista de herramientas.
2. Si la respuesta es texto, el trabajo terminó.
3. Si la respuesta pide herramientas, el programa las ejecuta y agrega los resultados a la historia.
4. El programa vuelve al paso 1.

En la página, el ciclo es la función `responder`:

```js
async function responder() {
  estado.trabajando = true;
  estado.error = "";
  controlador = new AbortController();

  try {
    for (let paso = 0; paso < MAX_PASOS; paso++) {
      const mensaje = await pedirPaso(historiaPlana(), estado.clave, controlador.signal);
      agregar(mensaje);
      if (!mensaje.tool_calls) return;

      for (const llamada of mensaje.tool_calls) {
        const resultado = await ejecutarHerramienta(llamada);
        agregar({ role: "tool", tool_call_id: llamada.id, content: resultado });
      }
      if (controlador.signal.aborted) {
        estado.error = "Detuviste al asistente.";
        return;
      }
    }
    estado.error = `El asistente llegó al límite de ${MAX_PASOS} pasos sin terminar.`;
  } catch (error) {
    // manejo de errores de la API y de la detención
  } finally {
    estado.trabajando = false;
    controlador = null;
  }
}
```

El ciclo tiene un límite de pasos, `MAX_PASOS`. Sin límite, un modelo confundido podría llamar herramientas para siempre, y cada paso se paga.

`pedirPaso` es la abstracción de la llamada, igual que `enviarChat` en el chat, con 2 diferencias: envía también `tools` y devuelve el mensaje completo en lugar de solo el texto, porque el ciclo necesita saber si trae `tool_calls`. Por debajo usa la misma `llamarApi` del chat, con sus reintentos y sus mensajes de error, y le pasa la señal del `AbortController` para que el botón Detener corte también las esperas entre reintentos.

Hay una restricción de los modelos actuales. En Chat Completions, GPT-6 Luna y GPT-6 Sol solo aceptan herramientas con `reasoning_effort` en `none`, y GPT-6 Astra directamente no las acepta. Por eso `pedirPaso` envía `reasoning_effort: "none"`. El modelo sigue siendo capaz de encadenar herramientas, pero no razona antes de cada paso. Para combinar herramientas con razonamiento, OpenAI pide usar la API de Responses. El ciclo del agente es el mismo en las 2 APIs: cambian los nombres de los campos, no la idea. Para tareas de programación más exigentes, se puede cambiar `MODELO` por `gpt-6-sol`, con la misma restricción y a un costo 20 veces mayor.

`ejecutarHerramienta` busca la función que corresponde a cada nombre en un objeto y le pasa los argumentos convertidos:

```js
const IMPLEMENTACIONES = {
  listar_archivos: ({ ruta }) => listarArchivos(ruta),
  leer_archivo:    ({ ruta }) => leerArchivo(ruta),
  escribir_archivo: async ({ ruta, contenido }) => {
    const aprobado = await pedirAprobacion(ruta, contenido);
    if (!aprobado) return `El usuario rechazó escribir ${ruta}.`;
    return escribirArchivo(ruta, contenido);
  },
};

async function ejecutarHerramienta(llamada) {
  const implementacion = IMPLEMENTACIONES[llamada.function.name];
  if (!implementacion) {
    return `Error: no existe la herramienta ${llamada.function.name}.`;
  }
  try {
    const argumentos = JSON.parse(llamada.function.arguments);
    return await implementacion(argumentos);
  } catch (error) {
    return `Error: ${describirErrorDeArchivo(error)}`;
  }
}
```

### El acceso a la carpeta

Por seguridad, una página web no puede leer los archivos de tu computadora. La API de acceso al sistema de archivos (File System Access API) abre una puerta controlada: la página le pide al navegador una carpeta, el navegador le pregunta al usuario cuál y, si el usuario la elige, la página obtiene acceso a esa carpeta y a nada más.

```js
carpeta = await window.showDirectoryPicker({ mode: "readwrite" });
```

`showDirectoryPicker` abre el diálogo del sistema para elegir una carpeta. Solo se puede llamar como respuesta a una acción del usuario, como un clic; por eso la página muestra el botón Elegir carpeta. El modo `readwrite` pide permiso para leer y escribir. Esta API existe en Chrome y Edge, pero no en Firefox ni en Safari; la página lo detecta y avisa.

La función devuelve un manejador de carpeta (`FileSystemDirectoryHandle`): un objeto que representa la carpeta y permite recorrerla. Para llegar a un archivo se recorre la ruta parte por parte:

```js
async function abrirArchivo(ruta, crear = false) {
  const partes = partesDeRuta(ruta);
  const nombre = partes.pop();
  if (!nombre) throw new Error("Falta el nombre del archivo.");
  const contenedora = await abrirCarpeta(partes, crear);
  return contenedora.getFileHandle(nombre, { create: crear });
}
```

`abrirCarpeta` baja por cada carpeta de la ruta con `getDirectoryHandle`, y `getFileHandle` obtiene el archivo. Con `create: true`, las 2 crean lo que falte, que es lo que necesita la escritura.

Leer y escribir usan el manejador del archivo:

```js
const texto = await (await manejador.getFile()).text();

const escritor = await manejador.createWritable();
await escritor.write(contenido);
await escritor.close();
```

`getFile` devuelve un objeto `File`, el mismo tipo que entrega un campo de subida de archivos, y `text` lee su contenido. `createWritable` abre el archivo para escribir. Los cambios se guardan recién al llamar a `close`; si algo falla antes, el archivo queda como estaba.

El manejador de la carpeta se guarda en una variable común, `carpeta`, y no en el estado reactivo. ArrowJS envuelve los objetos del estado en un intermediario que vigila sus cambios, y los métodos de un manejador dejan de funcionar si se los llama a través de ese intermediario. El estado guarda solo el nombre de la carpeta, que es lo que muestra la interfaz.

### Las instrucciones del proyecto: AGENTS.md

Cada proyecto tiene sus propias reglas: cómo se ejecuta, qué convenciones de nombres sigue, qué carpetas no hay que tocar. Los asistentes de programación adoptaron una convención para escribirlas una sola vez: un archivo `AGENTS.md` en la raíz del proyecto, escrito en Markdown y dirigido al asistente en lugar de a las personas. Herramientas como Codex, de OpenAI, lo leen al empezar a trabajar.

Un `AGENTS.md` típico es corto y concreto:

```markdown
# Instrucciones para el asistente

- El proyecto es un CLI en Node. Se ejecuta con `node index.js`.
- Usá ES modules (`import`), nunca `require`.
- Los nombres de variables y funciones van en español.
- No modifiques `contactos.csv`: son datos reales.
```

La página lo lee apenas se elige la carpeta. `leerAgentes` recorre la raíz buscando un archivo con ese nombre, sin distinguir mayúsculas de minúsculas, y lo lee con la misma `leerArchivo` que usa la herramienta:

```js
async function leerAgentes() {
  for await (const [nombre, manejador] of carpeta.entries()) {
    if (manejador.kind === "file" && nombre.toLowerCase() === "agents.md") {
      return leerArchivo(nombre);
    }
  }
  return "";
}
```

El contenido se guarda en `estado.agentes` y se suma al mensaje `developer` de cada pedido:

```js
function armarMensajes(historia) {
  let instrucciones = INSTRUCCIONES;
  if (estado.agentes) {
    instrucciones += `

El proyecto tiene un archivo AGENTS.md con instrucciones para vos.
Seguilas en todo lo que no contradiga lo anterior:

${estado.agentes}`;
  }
  return [{ role: "developer", content: instrucciones }, ...historia];
}
```

`AGENTS.md` complementa las instrucciones de la página; no las reemplaza. Las instrucciones propias de la página definen cómo funciona el asistente: qué herramientas tiene, que lea antes de escribir, que escriba los archivos completos. Si el proyecto las pisara, el asistente podría dejar de funcionar. Por eso el texto le indica al modelo que siga `AGENTS.md` en todo lo que no contradiga lo anterior.

Las instrucciones van en el mensaje `developer` y no como un mensaje más de la historia. Así se envían en cada pedido, aunque la conversación sea larga, y no aparecen en pantalla como si alguien las hubiera escrito.

El archivo se vuelve a leer al empezar una conversación nueva. Si lo editás mientras usás el asistente, alcanza con tocar Nueva conversación para que tome los cambios. La barra superior muestra una etiqueta `AGENTS.md` junto al nombre de la carpeta cuando el archivo está en uso, y el panel Historia muestra el mensaje `developer` completo, con el archivo incluido.

### Los límites que pone el programa

El modelo puede equivocarse, y un asistente que escribe archivos puede hacer daño. Por eso el programa pone varios límites.

La ruta no puede salir de la carpeta. `partesDeRuta` rechaza cualquier ruta con `..`. El propio navegador tampoco lo permitiría, pero el control explícito deja el error claro.

Cada escritura necesita aprobación. `pedirAprobacion` devuelve una promesa que no se resuelve hasta que el usuario elige. Mientras tanto, la página muestra el archivo que se va a escribir, si es nuevo o reemplaza a uno existente y cuántas líneas tiene antes y después. Si el usuario rechaza, el modelo recibe ese resultado y puede proponer otra cosa.

```js
function pedirAprobacion(ruta, contenido) {
  return lineasActuales(ruta).then((antes) => new Promise((resolver) => {
    resolverAprobacion = resolver;
    estado.pendiente = { ruta, contenido, antes };
  }));
}

function decidir(aprobado) {
  estado.pendiente = null;
  resolverAprobacion?.(aprobado);
  resolverAprobacion = null;
}
```

La promesa guarda su función `resolver` en una variable. Los botones Aplicar cambio y Rechazar llaman a `decidir`, que la ejecuta con `true` o `false`. Así, el ciclo del agente queda en pausa dentro de `await`, esperando un clic, sin ningún código especial.

El trabajo se puede detener. Mientras el asistente trabaja, el botón de enviar se convierte en Detener, que cancela el pedido en curso con un `AbortController`. `fetch` recibe su `signal`, y al llamar a `abort` la promesa de `fetch` falla con un error de nombre `AbortError`. Si había una escritura esperando aprobación, se rechaza.

La lectura tiene un tope de caracteres, `MAX_CARACTERES`, y el listado omite carpetas como `node_modules` y `.git`. Sin esos topes, un solo archivo enorme o una carpeta de dependencias podría llenar el pedido.

### Lo que se ve en pantalla

La conversación no muestra los mensajes `tool` ni los argumentos en crudo. En su lugar, cada pedido de herramienta se muestra como una línea de actividad: "Leyendo `index.js`" mientras se ejecuta, "Leyó `index.js`" cuando termina y, en rojo, "No pudo leer" con el motivo si falló. Para saber en qué estado está cada pedido, `resultadosPorLlamada` busca en la historia el mensaje `tool` con el mismo `tool_call_id`.

El panel Historia muestra los mensajes tal como viajan y, en una sección aparte, la declaración de las herramientas. Conviene abrirlo durante una tarea: se ve cómo cada archivo leído queda en la historia y se vuelve a enviar en todos los pasos siguientes. Por eso un agente consume muchos más tokens que un chat, y por eso conviene pedirle tareas concretas.
