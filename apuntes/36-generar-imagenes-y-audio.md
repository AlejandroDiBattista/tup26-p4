# Generar imágenes y audio

En la clase de entradas le dimos al modelo una imagen o un audio y obtuvimos texto. Esta clase recorre el camino inverso: le damos un texto y obtenemos una imagen o un audio.

Son tres operaciones, de la más simple a la más útil:

1. **Generar una imagen a partir de una descripción.**
2. **Generar una imagen a partir de otra**, que sirve de referencia.
3. **Generar audio a partir de un texto.**

Las tres comparten una idea que conviene tener presente desde el principio. Acá el modelo no devuelve una descripción que después dibuja un programa, como pasaba con el PDF o el gráfico. Devuelve el archivo terminado. Eso tiene una consecuencia: no hay código que pueda verificar el resultado. Una imagen o un audio se controlan mirando o escuchando.

## Preparación

Usamos la API de OpenAI. Hace falta una clave, que va en un archivo `.env`:

```bash
OPENAI_API_KEY=la-clave-secreta
```

Y la librería:

```bash
pnpm add openai
```

Los programas se corren así, para que lean el `.env`:

```bash
node --env-file=.env programa.js
```

Los modelos de imagen y de voz son distintos de los de texto. Tienen su propio nombre, su propia dirección y su propio precio. OpenAI los renueva seguido y retira los viejos, así que los nombres de este apunte hay que confirmarlos en su documentación antes de dictar la clase.

## Parte 1: una imagen a partir de un texto

### La idea

Un modelo de texto predice la palabra siguiente. Un modelo de imágenes hace algo parecido con pedacitos de imagen: a partir de la descripción, va produciendo la imagen por partes hasta completarla. No busca una foto existente ni arma un collage. Cada imagen es nueva, y la misma descripción da una imagen distinta cada vez.

### La llamada por la API

La dirección es `/images/generations`. El pedido es un JSON, igual que con el texto:

```js
// generar-fetch.js
import { writeFile } from 'node:fs/promises'

const respuesta = await fetch('https://api.openai.com/v1/images/generations', {
  method: 'POST',
  headers: {
    'Content-Type': 'application/json',
    Authorization: `Bearer ${process.env.OPENAI_API_KEY}`,
  },
  body: JSON.stringify({
    model: 'gpt-image-2.6-flare',
    prompt: 'Una caja de cartón cerrada sobre fondo blanco, foto de catálogo, luz suave.',
    size: '1024x1024',
    quality: 'low',
  }),
})

const json = await respuesta.json()
await writeFile('caja.png', Buffer.from(json.data[0].b64_json, 'base64'))
```

### Qué vuelve

```json
{
  "created": 1794800000,
  "data": [ { "b64_json": "iVBORw0KGgoAAAANSUhEUgAA..." } ],
  "usage": { "input_tokens": 24, "output_tokens": 272, "total_tokens": 296 }
}
```

- `data` es una lista, porque se puede pedir más de una imagen por llamada.
- `b64_json` es la imagen codificada en base64.
- `usage` es lo que se cobra. Una imagen también se mide en tokens, y son muchos más que los de la descripción.

La última línea del programa hace el camino inverso al de la clase de entradas. Allá leíamos un archivo y lo pasábamos a base64 para mandarlo. Acá recibimos base64, lo convertimos en bytes con `Buffer.from(..., 'base64')` y lo guardamos.

### Con la librería

```js
// imagenes.js
import { writeFile } from 'node:fs/promises'
import OpenAI from 'openai'

const cliente = new OpenAI()
const MODELO = 'gpt-image-2.6-flare'

export async function generarImagen(descripcion, salida, opciones = {}) {
  const respuesta = await cliente.images.generate({
    model: MODELO,
    prompt: descripcion,
    size: '1024x1024',
    quality: 'low',
    ...opciones,
  })

  await writeFile(salida, Buffer.from(respuesta.data[0].b64_json, 'base64'))
}
```

`new OpenAI()` sin argumentos toma la clave de la variable `OPENAI_API_KEY`. El tercer parámetro permite cambiar cualquier opción sin tocar la función:

```js
import { generarImagen } from './imagenes.js'

await generarImagen('Una caja de cartón cerrada sobre fondo blanco.', 'caja.png')
await generarImagen('Un ícono de una caja, estilo plano.', 'icono.webp', {
  output_format: 'webp',
  background: 'transparent',
})
```

### Las opciones

| Opción | Valores | Para qué |
|---|---|---|
| `size` | `1024x1024`, `1536x1024`, `1024x1536`, `auto` | Cuadrada, apaisada o vertical |
| `quality` | `low`, `medium`, `high`, `auto` | Detalle contra tiempo y costo |
| `output_format` | `png`, `jpeg`, `webp` | Formato del archivo |
| `background` | `opaque`, `transparent`, `auto` | Fondo transparente, solo con `png` o `webp` |
| `n` | de 1 a 10 | Cuántas imágenes devolver |

La que más pesa es `quality`. Entre `low` y `high` cambia varias veces el tiempo de espera y el costo. Para probar y para imágenes que se ven chicas, `low` alcanza. Conviene trabajar en `low` hasta tener la descripción afinada y subir la calidad solo para la versión final.

`n` sirve para pedir variantes y elegir. Se cobra cada una.

### Cómo se escribe la descripción

No hay instrucción y datos separados: hay un solo texto. Una buena descripción cubre cinco cosas:

1. **El sujeto.** Qué se ve, con el detalle que importa.
2. **El contexto.** Dónde está, sobre qué fondo.
3. **El estilo.** Foto, ilustración plana, acuarela, dibujo a lápiz.
4. **El encuadre y la luz.** De frente, desde arriba, primer plano; luz suave, de estudio.
5. **Lo que no debe aparecer.** Sin texto, sin personas, sin logos.

Lo que la descripción no dice, el modelo lo decide. Compará:

```text
Una caja.
```

```text
Una caja de cartón corrugado cerrada con cinta marrón, vista de frente y apenas desde arriba,
sobre fondo blanco liso. Foto de catálogo con luz de estudio suave y una sombra tenue debajo.
Sin texto, etiquetas ni logos.
```

La primera da cualquier caja, en cualquier lugar, en cualquier estilo. La segunda da casi siempre lo mismo. Describir es quitarle decisiones al modelo.

### Encadenar con el modelo de texto

Escribir buenas descripciones a mano no escala. Si hay que ilustrar doscientos productos, la descripción la escribe el modelo de texto a partir de la ficha, con la función `pedir` de la primera clase:

```js
const instruccion = `
Vas a recibir la ficha de un producto.
Escribí la descripción de una foto de catálogo: el producto solo, de frente,
sobre fondo blanco, con luz suave. Dos oraciones. Sin texto en la imagen.
`

const descripcion = await pedir(instruccion, JSON.stringify(producto))
await generarImagen(descripcion, `catalogo/${producto.codigo}.png`)
```

Un modelo prepara la entrada del otro. La instrucción fija el estilo, y por eso todas las imágenes salen parecidas entre sí.

### Decisiones

- **Generar una vez y guardar.** Cada imagen cuesta mucho más que una llamada de texto y no se repite. Se guarda el archivo y se guarda la descripción que lo produjo.
- **Generar o usar una foto real.** Una imagen generada de un producto no es el producto. Para vender, la foto real casi siempre es mejor.
- **Revisión de una persona.** Nadie más puede decir si la imagen es correcta.

### Qué falla

- **El texto dentro de la imagen.** Carteles, etiquetas y precios pueden salir con letras deformadas o palabras inventadas. El texto conviene agregarlo después, con código.
- **Las cantidades y posiciones exactas.** "Siete tornillos en fila" puede dar seis u ocho.
- **Lo específico.** Un logo real, un modelo exacto de producto, un lugar concreto.
- **La consistencia.** Dos imágenes del mismo personaje pueden no parecerse.

### Diez usos

**1. Imagen provisoria para un producto sin foto.**

```text
Una caja de cartón corrugado cerrada, de frente, sobre fondo blanco, foto de catálogo con luz suave. Sin texto ni logos.
```

**2. Ilustración de una categoría de la tienda.**

```text
Ilustración plana, con pocos colores, de herramientas de jardín ordenadas en fila. Fondo verde claro. Sin texto.
```

**3. Fondo para una publicación.**

```text
Fondo abstracto de formas geométricas suaves en azul y blanco, con el tercio superior despejado para agregar texto después.
```

**4. Avatar por defecto.**

```text
Ícono circular con una silueta de persona, estilo plano, un solo color sobre fondo gris claro.
```

**5. Imagen para una lista vacía.**

```text
Ilustración simple de una carpeta abierta y vacía, líneas finas, tonos grises. Sin texto.
```

**6. Portada de un informe.**

```text
Imagen apaisada y sobria de un escritorio con gráficos impresos, visto desde arriba. Tonos neutros. Sin texto legible.
```

**7. Ícono con fondo transparente.** Con `background: 'transparent'`.

```text
Ícono de un camión de reparto, estilo plano, trazo grueso, un solo color oscuro.
```

**8. Boceto de un local.**

```text
Boceto a lápiz de la fachada de una ferretería de barrio con vidriera y toldo. El cartel queda en blanco, sin letras.
```

**9. Imagen para un saludo de fin de año.**

```text
Ilustración cálida de una mesa con un brindis, estilo acuarela, sin personas reconocibles y sin texto.
```

**10. Variantes para elegir.** Con `n: 4`.

```text
Patrón repetible de hojas pequeñas en dos tonos de verde, para usar de fondo en un envoltorio.
```

## Parte 2: una imagen a partir de otra

### La idea

Describir con palabras tiene un techo. No hay forma de escribir "este producto, exactamente este" o "esta persona". Para eso se le da al modelo una imagen de referencia junto con la instrucción.

Hay que entender bien qué hace el modelo con esa imagen, porque no es lo que el nombre de la operación sugiere. La dirección se llama *edits*, pero el modelo no edita:

- **No pasa por una descripción.** No convierte la referencia en palabras para después dibujar. La lee directamente, con mucho más detalle del que entraría en un texto.
- **Tampoco la retoca.** No toma los píxeles originales y cambia algunos. Mira la referencia y produce todos los píxeles de nuevo.

La imagen original es la referencia, no el material. La analogía es un dibujante muy bueno que mira una foto y hace un retrato nuevo siguiendo indicaciones, y no una fotocopia retocada.

De ahí sale la distinción que importa en esta parte:

- **Calidad** es qué tan bien hecha está la imagen: nitidez, luz, ausencia de defectos.
- **Fidelidad** es cuánto coincide con la referencia: que sea ese producto o esa persona, y no uno muy parecido.

Son independientes. Un resultado puede ser impecable y tener una etiqueta cambiada o una nariz un poco distinta. Subir `quality` mejora la primera y no garantiza la segunda.

### La llamada por la API

La dirección es `/images/edits`. Como hay que mandar un archivo, el pedido deja de ser JSON y pasa a ser un formulario con adjunto, igual que con la transcripción de audio:

```js
// editar-fetch.js
import { readFile, writeFile } from 'node:fs/promises'

const formulario = new FormData()
formulario.append('model', 'gpt-image-2.6-flare')
formulario.append('image', new Blob([await readFile('producto.png')], { type: 'image/png' }), 'producto.png')
formulario.append('prompt', 'Mantené el producto sin cambios y reemplazá el fondo por blanco liso.')
formulario.append('size', '1024x1024')
formulario.append('quality', 'low')

const respuesta = await fetch('https://api.openai.com/v1/images/edits', {
  method: 'POST',
  headers: { Authorization: `Bearer ${process.env.OPENAI_API_KEY}` },
  body: formulario,
})

const json = await respuesta.json()
await writeFile('producto-fondo-blanco.png', Buffer.from(json.data[0].b64_json, 'base64'))
```

Tres diferencias con la llamada anterior:

- **`FormData` en lugar de JSON.** Cada campo se agrega con `append`.
- **La imagen es un `Blob`**, un archivo en memoria. El tercer argumento de `append` es el nombre con que lo ve el servidor.
- **No va el encabezado `Content-Type`.** Lo completa `fetch`, porque incluye un separador que genera en el momento.

La respuesta tiene la misma forma que antes.

### Con la librería

```js
// imagenes.js (continuación)
import { createReadStream } from 'node:fs'
import { toFile } from 'openai'

const tipos = { png: 'image/png', jpg: 'image/jpeg', jpeg: 'image/jpeg', webp: 'image/webp' }

function adjunto(ruta) {
  const extension = ruta.split('.').pop().toLowerCase()
  return toFile(createReadStream(ruta), null, { type: tipos[extension] })
}

export async function editarImagen(instruccion, referencias, salida, opciones = {}) {
  const respuesta = await cliente.images.edit({
    model: MODELO,
    image: await Promise.all(referencias.map(adjunto)),
    prompt: instruccion,
    size: '1024x1024',
    quality: 'low',
    ...opciones,
  })

  await writeFile(salida, Buffer.from(respuesta.data[0].b64_json, 'base64'))
}
```

`toFile` prepara el archivo para la librería y le indica de qué tipo es. Las referencias van en una lista, porque puede haber más de una:

```js
import { editarImagen } from './imagenes.js'

await editarImagen(
  'Mantené el producto sin cambios y reemplazá el fondo por blanco liso.',
  ['producto.jpg'],
  'producto-fondo-blanco.png',
)
```

### Varias referencias

El modelo acepta varias imágenes en el mismo pedido y las combina. La instrucción las nombra por su orden:

```js
await editarImagen(
  `La primera imagen es un producto y la segunda es una mesa de cocina.
Poné el producto sobre la mesa, con la luz y la sombra que corresponden a esa escena.
No cambies el producto.`,
  ['termo.jpg', 'mesa.jpg'],
  'termo-en-mesa.png',
)
```

Sirve para poner un producto en un ambiente, vestir un maniquí con una prenda, o aplicar el estilo de una imagen al contenido de otra.

### Cómo se escribe la instrucción

Cambia respecto de la parte 1. Ya no hay que describir el sujeto, porque está en la referencia. Hay que decir dos cosas, y en este orden:

1. **Qué se conserva.** Es la línea más importante. Si no se dice, el modelo se siente libre de mejorar todo.
2. **Qué cambia.** El fondo, la luz, el encuadre, el estilo.

```text
Conservá el producto exactamente como está: forma, colores, etiqueta y proporciones.
Reemplazá el fondo por blanco liso y agregá una sombra tenue debajo.
```

Con personas, la primera línea se vuelve imprescindible. Un modelo de imágenes tiende a embellecer: alisa la piel, cambia la edad, acomoda el pelo. En la app de fotos carnet la instrucción empieza por ahí:

```text
Convertí esta foto en una foto carnet.
Conservá exactamente a la persona: rostro, rasgos, edad, peinado y color de piel, sin retocarlos.
Encuadre de frente, cabeza y hombros centrados, mirada a la cámara.
Fondo blanco liso y luz pareja, sin sombras.
```

### Preparar la referencia

- **Reducirla antes de subirla.** Una foto de celular pesa varios megas y el modelo trabaja alrededor de 1024 píxeles de lado. Mandarla entera tarda más en subir y cuesta más, sin mejorar el resultado.
- **Recortarla a lo que importa.** Si el producto ocupa una esquina de la foto, el modelo tiene poco para leer.
- **Que coincida la proporción.** Una referencia cuadrada con una salida cuadrada evita que el modelo tenga que inventar los costados.

En la app de fotos carnet esto lo hace el `canvas`: recorta el cuadrado central y lo lleva a 1024 por 1024 antes de subirlo.

### Decisiones

- **Editar suele ser mejor que generar.** Cuando existe una foto real, partir de ella da un resultado más fiel que describirla.
- **Guardar el original.** La imagen generada nunca lo reemplaza. Se guardan las dos.
- **Decir que es generada.** Sobre todo si muestra un producto que se vende o a una persona.

### Qué falla

- **Cambia lo que no se le pidió.** No hay una zona intocable: todo es salida nueva. El texto de una etiqueta es lo primero que se rompe.
- **Las caras.** Casi siempre sale alguien reconocible, y cada tanto alguien que se parece mucho. Para un documento oficial no sirve.
- **Los detalles chicos.** Un lunar, un botón, una costura, la forma exacta de un logo.
- **Dos corridas dan dos resultados.** Si uno salió bien, se guarda; repetir la llamada no lo devuelve.

### Diez usos

**1. Fondo blanco para el catálogo.**

```text
Conservá el producto exactamente como está. Reemplazá el fondo por blanco liso con una sombra tenue debajo.
```

**2. Producto en un ambiente.**

```text
Conservá el producto sin cambios. Ubicalo sobre una mesada de cocina luminosa, con el fondo desenfocado.
```

**3. Foto carnet a partir de una foto casual.**

```text
Convertí esta foto en una foto carnet. Conservá exactamente a la persona. De frente, fondo blanco, luz pareja.
```

**4. Mejorar la luz de una foto mal sacada.**

```text
Conservá la escena y los objetos tal como están. Corregí la iluminación para que sea pareja y sin dominante amarilla.
```

**5. Quitar un objeto.**

```text
Quitá el cable que cruza la imagen y completá el fondo de forma natural. No cambies nada más.
```

**6. Variante de color de un producto.**

```text
Conservá la forma, la textura y el encuadre. Cambiá el color del producto a azul marino.
```

**7. Pasar una foto a ilustración.**

```text
Convertí la foto en una ilustración plana de pocos colores, conservando la composición y los elementos principales.
```

**8. Completar los costados de una foto vertical.** Con `size: '1536x1024'`.

```text
Extendé la imagen hacia los costados continuando el fondo de forma natural. No modifiques la parte central.
```

**9. Producto sobre un fondo dado.** Con dos referencias.

```text
La primera imagen es el producto y la segunda es el fondo. Poné el producto sobre ese fondo, con luz y sombra coherentes. No cambies el producto.
```

**10. Aplicar el estilo de la marca.** Con dos referencias.

```text
La primera imagen es una foto y la segunda es una ilustración de referencia. Redibujá la foto con el estilo de la ilustración: mismos trazos y misma paleta.
```

## Parte 3: audio a partir de un texto

### La idea

Un modelo de voz recibe un texto y devuelve un audio de alguien leyéndolo. Es la contracara de la transcripción. No junta grabaciones de palabras sueltas: genera la voz completa, con entonación y pausas, a partir de la frase entera.

### La llamada por la API

La dirección es `/audio/speech`. El pedido es JSON:

```js
// voz-fetch.js
import { writeFile } from 'node:fs/promises'

const respuesta = await fetch('https://api.openai.com/v1/audio/speech', {
  method: 'POST',
  headers: {
    'Content-Type': 'application/json',
    Authorization: `Bearer ${process.env.OPENAI_API_KEY}`,
  },
  body: JSON.stringify({
    model: 'gpt-4o-mini-tts',
    voice: 'coral',
    input: 'Su pedido está listo para retirar.',
  }),
})

await writeFile('aviso.mp3', Buffer.from(await respuesta.arrayBuffer()))
```

Hay una diferencia con todas las llamadas anteriores: **la respuesta no es JSON, es el archivo de audio.** No hay base64 ni campo `data`. Por eso no se usa `respuesta.json()` sino `respuesta.arrayBuffer()`, que devuelve los bytes tal como llegaron, listos para guardar.

Entonces, según qué se pide, la respuesta llega de una de dos formas:

| Operación | El pedido | La respuesta |
|---|---|---|
| Generar imagen | JSON | JSON con la imagen en base64 |
| Editar imagen | Formulario con adjunto | JSON con la imagen en base64 |
| Generar voz | JSON | El archivo de audio |

### Con la librería

```js
// voz.js
import { writeFile } from 'node:fs/promises'
import OpenAI from 'openai'

const cliente = new OpenAI()

export async function decir(texto, salida, opciones = {}) {
  const respuesta = await cliente.audio.speech.create({
    model: 'gpt-4o-mini-tts',
    voice: 'coral',
    input: texto,
    ...opciones,
  })

  await writeFile(salida, Buffer.from(await respuesta.arrayBuffer()))
}
```

```js
import { decir } from './voz.js'

await decir('Su pedido está listo para retirar.', 'aviso.mp3')
```

### Las opciones

| Opción | Valores | Para qué |
|---|---|---|
| `voice` | `alloy`, `ash`, `ballad`, `coral`, `echo`, `fable`, `onyx`, `nova`, `sage`, `shimmer`, `verse`, `marin`, `cedar` | Quién habla |
| `instructions` | un texto | Cómo habla: tono, ritmo, intención |
| `speed` | de 0.25 a 4, por defecto 1 | Velocidad |
| `response_format` | `mp3`, `opus`, `aac`, `flac`, `wav`, `pcm` | Formato del archivo |

`instructions` es la opción más interesante, porque es una instrucción en castellano sobre la forma de decir, separada de lo que se dice:

```js
await decir('Su pedido está listo para retirar.', 'aviso.mp3', {
  instructions: 'Hablá en español rioplatense, con tono amable y pausado, como en una atención al cliente.',
})
```

Es la misma separación de siempre: el `input` son los datos y `instructions` es cómo tratarlos.

Sobre las voces: tienen nombre en inglés, pero hablan en el idioma del texto. No todas suenan igual de naturales en castellano. Hay que escucharlas con frases reales antes de elegir una.

### El texto para hablar no es el texto para leer

Un texto escrito suena mal leído en voz alta. Mirá este:

```text
Su pedido N.º 1234 por $15.500 se entrega el 20/11 de 9 a 13 hs.
```

Una voz puede leer "ene punto", "quince punto quinientos" o "veinte barra once". Antes de pasarlo a voz hay que adaptarlo, y eso lo hace el modelo de texto:

```js
const instruccion = `
Adaptá el texto para que lo lea una voz sintética por teléfono.
Oraciones cortas. Escribí los números, importes, fechas y horas con palabras.
Reemplazá abreviaturas y símbolos por su forma hablada.
No agregues ni quites información.
`

const hablado = await pedir(instruccion, 'Su pedido N.º 1234 por $15.500 se entrega el 20/11 de 9 a 13 hs.')
await decir(hablado, 'aviso.mp3')
```

El resultado de la adaptación es algo como:

```text
Su pedido número mil doscientos treinta y cuatro, por quince mil quinientos pesos,
se entrega el veinte de noviembre, de nueve a trece horas.
```

Es el mismo encadenamiento que con las imágenes: el modelo de texto prepara la entrada del otro. Y acá sí hay algo que el código puede controlar, porque la adaptación es texto: se puede verificar que no falte ningún dato antes de gastar en la voz.

### Textos largos

El texto tiene un máximo de 4096 caracteres por llamada. Un texto más largo se divide, se genera un audio por parte y se reproducen en orden. Conviene cortar por párrafos, para que ninguna oración quede partida:

```js
// voz.js (continuación)
export function partir(texto, maximo = 4000) {
  const trozos = ['']

  for (const parrafo of texto.split('\n\n')) {
    const ultimo = trozos.at(-1)
    if (ultimo && ultimo.length + parrafo.length + 2 > maximo) trozos.push(parrafo)
    else trozos[trozos.length - 1] = ultimo ? `${ultimo}\n\n${parrafo}` : parrafo
  }

  return trozos
}
```

La función va llenando un trozo con párrafos, y cuando el siguiente no entra, empieza otro.

```js
const trozos = partir(informe)

for (const [i, trozo] of trozos.entries()) {
  await decir(trozo, `informe-${i + 1}.mp3`)
}
```

### Decisiones

- **Generar una vez y guardar.** Los avisos fijos se generan al configurar el sistema, no en cada uso.
- **Elegir una voz y mantenerla.** Es parte de la identidad del sistema, como un logo.
- **Avisar que es una voz sintética.** Quien escucha tiene que saber que no es una persona.
- **El formato.** `mp3` sirve para casi todo. `opus` pesa menos y es el que usa WhatsApp para los mensajes de voz.

### Qué falla

- **Nombres propios y siglas.** Apellidos, marcas y palabras en otro idioma.
- **Números sin adaptar.** Un teléfono leído como una cifra, una fecha como una división.
- **La entonación.** Preguntas que suenan a afirmaciones, pausas en lugares raros. Se corrige cambiando la puntuación o partiendo la oración.
- **El acento.** Sin `instructions`, la voz puede sonar neutra o de otro país.

### Un aviso sobre este modelo

Al momento de escribir este apunte, OpenAI marca como obsoletos los modelos de esta dirección, con fecha de baja el 6 de enero de 2027, y recomienda pasar a su API de tiempo real, que está pensada para conversaciones de voz y es bastante más compleja.

Para aprender el concepto, esta llamada es la más simple que existe, y por eso la usamos. Para un sistema que tenga que seguir funcionando, hay que revisar qué ofrece OpenAI en ese momento, o usar otro proveedor de voz. La idea no cambia: texto de entrada, archivo de audio de salida.

### Diez usos

1. **Aviso de pedido listo**, para mandar como audio.
2. **Recordatorio de turno o de vencimiento**, con los datos del cliente.
3. **Mensaje de bienvenida** de la línea telefónica.
4. **Lectura de un informe**, para escucharlo en el auto.
5. **Respuesta hablada a una consulta por audio.** Se transcribe, se responde con texto y se pasa a voz.
6. **Novedades del mes** en versión audio.
7. **Lectura de pantalla** para usuarios con dificultad visual.
8. **Instrucciones de uso** de un producto, paso a paso.
9. **Llamado en una sala de espera:** "Pérez, mostrador dos."
10. **Locución de un video** de producto, a partir del guion.

El uso 5 junta las dos clases: audio que entra, texto que se procesa, audio que sale. Es la base de un asistente de voz.

## Límites que hay que tener presentes

- **No hay control automático.** Una imagen o un audio se revisan mirando o escuchando. Lo que sí se controla con código es el texto que los origina.
- **Generar no es copiar.** Con una imagen de referencia, el resultado se parece al original y no es el original.
- **Cuesta y tarda más que el texto.** Se genera una vez y se guarda el archivo.
- **No se repite.** La misma descripción da otra imagen. Lo que salió bien se guarda.
- **Los modelos cambian.** Los nombres de este apunte pueden dejar de funcionar. Cuando un pedido falla con un modelo que no existe, lo primero es revisar la documentación.
- **Hay usos que no corresponden.** Generar la imagen o la voz de una persona real sin su permiso, o presentar como real algo generado. Los proveedores rechazan parte de esos pedidos, y lo que no rechazan sigue siendo responsabilidad de quien arma el sistema.

## Para hacer en clase

1. Generar tres veces una imagen con la descripción "Una caja" y tres veces con la descripción larga. Anotar antes cuál se espera que varíe más.
2. Generar la misma imagen con `quality` en `low`, `medium` y `high`. Medir el tiempo de cada una y compararlas a tamaño chico y a tamaño completo.
3. Pedir una imagen de un cartel con un texto de cinco palabras. Contar cuántas salen bien escritas en cinco intentos.
4. Tomar la foto de un producto con etiqueta y pedir fondo blanco, primero sin la línea "conservá el producto" y después con ella. Comparar la etiqueta contra el original.
5. Sacar la misma foto casual tres veces, convertirla en foto carnet y comparar los tres resultados con la persona. Anotar qué detalles cambian.
6. Pasar a voz el aviso del pedido tal cual y adaptado. Escuchar las dos versiones.
7. Generar la misma frase con tres voces y con dos `instructions` distintas. Elegir una y justificar.
