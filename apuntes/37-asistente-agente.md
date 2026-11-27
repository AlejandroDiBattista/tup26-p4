# Del asistente conversacional al agente de programación

Vamos a construir dos programas de terminal. El primero usa la API REST de OpenAI. El segundo usa el AI SDK de Vercel.

## Asistente, agente y arnés

- **Asistente.** En este tutorial, es el programa al que le pedimos una respuesta. Recibe el mensaje y el historial de la conversación, y nos devuelve texto que podemos usar.
- **Agente.** Es el programa al que le delegamos una tarea. Lo configuramos con un modelo, instrucciones y herramientas. El modelo decide qué pasos seguir y puede usar el resultado de una herramienta para decidir el siguiente paso.
- **Arnés.** Es el código que hace funcionar al agente. Mantiene el historial, llama al modelo, coordina las herramientas y aplica los permisos. En `agente.js`, `ToolLoopAgent` se encarga del ciclo y nuestro código pide confirmación antes de escribir archivos. La interfaz de Ink muestra el pedido de permiso y recibe tu respuesta.

Probemos con el mismo pedido, «Agregá una función `multiplicar` a `calculadora.js`».

- Con `asistente.js`, recibís el código de la función para pegarlo en el archivo.
- Con `agente.js`, el modelo puede leer el archivo, adaptar la función al estilo del proyecto y proponer el cambio. Si lo aprobás, el programa lo guarda.

## Preparación

Necesitás Node.js 22 o superior, pnpm y una clave de la API de OpenAI. Instalá las dependencias desde `clase/agente`:

```bash
pnpm install
```

Si todavía no tenés un archivo `.env`, crealo con tu clave:

```dotenv
OPENAI_API_KEY=tu-clave
```

Podés elegir el modelo con `OPENAI_MODEL`. Los dos ejemplos usan la misma [interfaz de terminal](../clase/agente/interfaz.jsx). Al apretar Enter, la interfaz llama a `alEnviar(pedido, ui)`. El programa usa `ui.texto()` para mostrar una respuesta. Salís con Ctrl+C.

## 1. Asistente conversacional con la API REST

Ejecutá [asistente.js](../clase/agente/asistente.js) con:

```bash
pnpm asistente
```

### Guardar la conversación

Cada mensaje tiene un `role` y un `content`. `user` identifica lo que escribió la persona y `assistant` identifica lo que contestó el modelo. El programa guarda ambos en el arreglo `historial`, que vive en memoria mientras la terminal está abierta.

Al enviar un nuevo pedido, armamos el mensaje y lo agregamos al historial que viaja en esa solicitud:

```js
const mensaje = { role: 'user', content: pedido }

const respuesta = await fetch('https://api.openai.com/v1/responses', {
  method: 'POST',
  headers: {
    'Content-Type': 'application/json',
    Authorization: `Bearer ${process.env.OPENAI_API_KEY}`
  },
  body: JSON.stringify({
    model: MODELO,
    instructions: INSTRUCCIONES,
    input: [...historial, mensaje]
  })
})
```

`fetch` envía un `POST` al endpoint `/v1/responses`. En el encabezado `Authorization` va la clave. En el cuerpo JSON, `model` elige el modelo, `instructions` indica cómo debe responder e `input` contiene la conversación y el pedido nuevo. [Responses API](https://developers.openai.com/api/docs/guides/text)

### Mostrar la respuesta y preparar el siguiente turno

Leemos el JSON con `await respuesta.json()` y comprobamos el estado HTTP. La API devuelve distintos tipos de elementos en `datos.output`. Tomamos los mensajes y reunimos sus partes de texto:

```js
const texto = datos.output
  .filter(item => item.type === 'message')
  .flatMap(item => item.content)
  .map(parte => parte.text ?? parte.refusal ?? '')
  .join('')
```

Cuando hay una respuesta, guardamos los dos mensajes y mostramos el texto:

```js
historial.push(mensaje, { role: 'assistant', content: texto })
ui.texto(texto)
```

En el siguiente turno volvemos a enviar ese historial. Probalo con «Me llamo Ana» y después «¿Cómo me llamo?». El segundo pedido incluye el mensaje anterior donde figura el nombre. [Estado de una conversación](https://developers.openai.com/api/docs/guides/conversation-state)

## 2. Agente de programación con el AI SDK de Vercel

Ejecutá [agente.js](../clase/agente/agente.js) con:

```bash
pnpm agente
```

El agente trabaja en `taller/`. Probá pedirle «¿Qué funciones tiene calculadora.js?». El modelo puede decidir que necesita leer el archivo. El SDK ejecuta la función de lectura y devuelve el contenido al modelo para que pueda contestar. El agente también puede pedirle a OpenAI que genere una imagen y guardar el resultado en esa carpeta.

### Las piezas del AI SDK

- `ToolLoopAgent`, del paquete `ai`, coordina los pasos. Llama al modelo y, si este pide una herramienta, la ejecuta y le devuelve el resultado. Puede repetir el ciclo para encadenar varias acciones en un mismo pedido.
- `openai.responses(MODELO)`, del paquete `@ai-sdk/openai`, conecta el agente con la API Responses de OpenAI.
- `tool()`, del paquete `ai`, ayuda a declarar una herramienta local. La descripción le dice al modelo cuándo usarla, `inputSchema` define los argumentos con Zod y `execute` contiene la función de JavaScript que se ejecuta. [Herramientas y agentes en el AI SDK](https://ai-sdk.dev/docs/agents/building-agents)

### Herramientas que ejecuta nuestro programa

Las herramientas locales de `agente.js` son `listar_archivos`, `leer_archivo` y `escribir_archivo`. Con este código declaramos la lectura de un archivo:

```js
leer_archivo: tool({
  description: 'Lee un archivo de texto de la carpeta de trabajo.',
  inputSchema: z.object({
    ruta: z.string().describe('Ruta relativa, por ejemplo "calculadora.js".')
  }),
  execute: ({ ruta }) => leerArchivo(ruta)
})
```

El modelo pide `leer_archivo` con un argumento como `{ ruta: 'calculadora.js' }`. El SDK valida el argumento y llama a `execute`. La función `leerArchivo()` ya está implementada en [archivos.js](../clase/agente/archivos.js). Para escribir, `execute` espera primero que la persona responda `s` o `n` en la terminal.

### Herramientas que ejecuta OpenAI

El modelo también puede elegir una herramienta integrada, como `image_generation`. En ese caso, OpenAI recibe la llamada, genera la imagen y envía el resultado al programa. En `herramientasPara(ui)` alcanza con configurar la herramienta del proveedor. [Generación de imágenes en el AI SDK](https://ai-sdk.dev/providers/ai-sdk-providers/openai#image-generation-tool)

```js
image_generation: openai.tools.imageGeneration({
  model: 'gpt-image-2.5-flare',
  outputFormat: 'png',
  partialImages: 0
})
```

`MODELO` es el modelo que conversa y decide cuándo pedir una imagen. `gpt-image-2.5-flare` es el que la genera. Con `partialImages: 0` pedimos solo el PNG final. El programa lo recibe codificado en base64 en `parte.output.result`, dentro de un evento `tool-result`. `guardarImagen()` lo convierte en bytes y crea un archivo con un nombre único en `taller/`. La terminal muestra la ruta cuando se guarda. La confirmación del ejemplo corresponde a la herramienta local `escribir_archivo`. [Herramienta de imágenes de la API Responses](https://developers.openai.com/api/docs/guides/tools-image-generation)

La búsqueda web también se ejecuta en OpenAI. Declaramos `web_search: openai.tools.webSearch()` y el modelo decide cuándo usarla. En la respuesta REST, esa llamada aparece como `web_search_call`. El agente usa la búsqueda como apoyo interno y la terminal muestra solo el resultado del pedido. [Búsqueda web en el AI SDK](https://ai-sdk.dev/providers/ai-sdk-providers/openai#web-search-tool)

### Redactar las instrucciones de un asistente general

Para reutilizar el agente en varias carpetas, escribí en JavaScript las reglas que sirven para cualquier proyecto. Empezá por su propósito, indicá cuándo conviene usar cada herramienta y definí cómo debe comunicar el resultado. En `AGENTS.md` escribí el rol específico, qué archivos usa el proyecto y qué convenciones debe seguir para leerlos o actualizarlos.

Este bloque puede reemplazar la carga de `reglas` y la definición de `INSTRUCCIONES` de `agente.js`. Usa las mismas herramientas del ejemplo y deja abierto el tipo de tarea que el asistente puede atender.

```js
const reglas = await leerArchivo('AGENTS.md').catch(() => '')

const INSTRUCCIONES = `Sos un asistente que ayuda a trabajar con los archivos de una carpeta.
- Si necesitás ubicar un archivo, usá listar_archivos.
- Usá leer_archivo para consultar el contenido y antes de modificar un archivo existente.
- Para crear o reemplazar un archivo, usá escribir_archivo con el contenido completo.
- Si el pedido requiere consultar internet, usá web_search como apoyo.
- Si te piden generar una imagen, usá image_generation. El programa guarda el PNG y muestra su ruta.
- Pedí una aclaración puntual si falta un dato indispensable.
- Respondé en español y con brevedad. Indicá qué archivos cambiaste cuando la escritura se complete.

Reglas específicas del proyecto (AGENTS.md):
${reglas || '(no hay)'}`
```

La descripción de cada herramienta y su esquema indican qué acción ofrece y qué argumentos recibe. Las instrucciones del agente orientan la decisión de cuándo usarla. Por ejemplo, el texto indica que se debe enviar el archivo completo y el código de `escribir_archivo` espera la confirmación antes de guardar.

### Cargar las instrucciones específicas de `AGENTS.md`

Guardá `AGENTS.md` en la raíz de la carpeta de trabajo. Al iniciar, `leerArchivo('AGENTS.md')` busca ese archivo y el programa agrega su contenido al final de `INSTRUCCIONES`. Si el archivo no existe, se usa el bloque general con la indicación `(no hay)`. Reiniciá el programa después de editar `AGENTS.md` para que vuelva a cargarlo.

Con `pnpm agente`, la carpeta de trabajo es `taller/`. Para usar otra carpeta, pasala como argumento, como en el ejemplo de la secretaria ejecutiva.

### Crear y ejecutar el agente

Al apretar Enter, `alEnviar(mensaje, ui)` agrega el pedido al historial y crea el agente con el modelo, las instrucciones y las herramientas:

```js
historial.push({ role: 'user', content: mensaje })

const agente = new ToolLoopAgent({
  model: openai.responses(MODELO),
  providerOptions: { openai: { reasoningEffort: ESFUERZO } },
  instructions: INSTRUCCIONES,
  tools: herramientasPara(ui),
  stopWhen: isStepCount(20)
})

const resultado = await agente.stream({ messages: historial })
```

`herramientasPara(ui)` permite que `escribir_archivo` pida confirmación en la terminal. `isStepCount(20)` limita el número de pasos por pedido.

El SDK se ocupa del ciclo de herramientas. Nuestro `for await` lee `resultado.stream` para mostrar los fragmentos de texto y la actividad en la terminal. Al final agregamos `resultado.responseMessages` al historial, incluidos los mensajes y los resultados de las herramientas. Así el próximo pedido puede retomar lo que el agente ya hizo. [Stream de eventos del AI SDK](https://ai-sdk.dev/docs/reference/ai-sdk-core/stream-text)

Probá las herramientas con estos pedidos.

1. Pedile que lea `calculadora.js` y agregue una función `multiplicar`. Mirá el contenido propuesto y respondé `n`. Repetí el pedido y respondé `s` para guardar el cambio.
2. Pedile «Generá una imagen de una calculadora en estilo de dibujo». Abrí el PNG que la terminal indica después de guardarlo automáticamente.
3. Pedile «Consultá la documentación oficial de Node.js y escribí un ejemplo mínimo con `fetch`». La búsqueda sirve de apoyo para preparar el ejemplo.

### Ejemplo de una secretaria ejecutiva

El mismo agente puede consultar y actualizar una agenda de contactos y llevar el registro de compromisos de una oficina. El rol, los nombres de los archivos y las reglas se definen en [AGENTS.md](../clase/agente/secretaria/AGENTS.md). Los datos de práctica están en [AGENDA.md](../clase/agente/secretaria/AGENDA.md) y [TAREA.md](../clase/agente/secretaria/TAREA.md).

```text
secretaria/
├── AGENTS.md   Reglas de la secretaria ejecutiva
├── AGENDA.md   Tabla de contactos
└── TAREA.md    Compromisos pendientes y completados
```

El contenido de `secretaria/AGENTS.md` es el siguiente.

```md
# Secretaria ejecutiva

Actuá como secretaria ejecutiva. Usá `AGENDA.md` para los contactos y `TAREA.md` para los compromisos.

## Contactos en `AGENDA.md`

- Consultá la agenda por nombre u organización. Agregá y actualizá contactos en la tabla existente.
- Conservá los datos que no se pidieron cambiar. Usá `—` para los datos que la persona todavía no informó.
- Antes de agregar una ficha, buscá si el contacto ya existe. Si hay varias coincidencias y el pedido no permite elegir una, preguntá cuál corresponde.

## Compromisos en `TAREA.md`

- Consultá los compromisos registrados. Para agregar uno, escribí una casilla `- [ ]` en **Pendientes** con la descripción, la fecha, la hora y el contacto cuando se hayan indicado.
- Registrá la fecha como `AAAA-MM-DD` y la hora como `HH:mm`. Si reprogramás un compromiso, actualizá su fecha u hora en la misma línea y conservá los demás datos.
- Cuando te indiquen que un compromiso se cumplió, mové su línea a **Completados** y marcala como `- [x]`.

Para cada cambio, leé el archivo correspondiente y proponé el contenido completo con `escribir_archivo`. Indicá que el cambio se guardó cuando la herramienta confirme la escritura.
```

Desde `clase/agente`, iniciá el agente con la carpeta del ejemplo.

```bash
pnpm agente secretaria
```

Probá estos pedidos en orden.

1. «¿Cuál es el correo de Lucía Méndez?». El agente consulta `AGENDA.md` y responde con el correo.
2. «Agregá a Ana Pérez, de Estudio Horizonte, con correo ana@example.com». El agente propone una fila nueva en `AGENDA.md`.
3. «Agendá una reunión con Ana Pérez el 27/11/2026 a las 09:00 para revisar el presupuesto». El agente propone una casilla nueva en **Pendientes** de `TAREA.md`.
4. «Mové la reunión con Ana al 30/11/2026 a las 11:00». El agente propone actualizar la fecha y la hora de ese compromiso. Después podés decirle «La reunión con Ana ya se hizo» para que proponga moverla a **Completados**.

Revisá cada propuesta y presioná `s` para guardarla o `n` para rechazarla. Confirmá el alta de Ana y el registro de la reunión para que los pedidos siguientes puedan encontrarlos en los archivos.
