# Entradas más allá del texto: imágenes, documentos y audio

En la clase anterior el modelo recibía texto. Pero en una empresa la información casi nunca llega como texto limpio: llega como la foto de una factura, un PDF con una lista de precios, un comprobante de transferencia reenviado por WhatsApp. Hasta hace poco, pasar eso a un sistema lo hacía una persona tipeando.

Los modelos actuales también leen imágenes. Esta clase muestra cómo se les manda una, cómo se resuelve el caso del PDF, por qué conviene pasar los documentos a Markdown, cómo se trabaja con un mensaje de voz y, sobre todo, cómo se controla lo que el modelo dice haber leído.

## Qué cambia en la llamada

Casi nada. Hasta ahora el contenido del mensaje era una cadena:

```js
{ role: 'user', content: 'Buen día, le envío el presupuesto.' }
```

El mismo campo acepta una lista de partes. Cada parte tiene un tipo:

```js
{
  role: 'user',
  content: [
    { type: 'text', text: 'Esta es la factura del proveedor.' },
    { type: 'image_url', image_url: { url: '...' } },
  ],
}
```

La parte de imagen lleva una dirección. Puede ser de dos clases:

- **Una dirección web pública**, como `https://sitio.com/factura.jpg`. El proveedor la descarga.
- **La imagen misma, escrita como texto.** Se usa cuando el archivo está en nuestra máquina o es privado.

### Cómo viaja una imagen dentro de un JSON

Una imagen es una secuencia de bytes y el JSON solo lleva texto. La solución es *base64*, una codificación que representa cualquier byte con 64 caracteres seguros: letras, números, `+` y `/`. Ocupa un tercio más que el original, y a cambio pasa por cualquier canal de texto.

Con eso se arma una *dirección de datos*, que lleva el contenido adentro en lugar de apuntar a otro lado:

```text
data:image/jpeg;base64,/9j/4AAQSkZJRgABAQ...
```

Tiene tres partes: el prefijo `data:`, el tipo de archivo (`image/jpeg`, `image/png`) y los bytes en base64.

## Conectarse por la API

La llamada completa con `fetch`, leyendo la imagen del disco:

```js
// vision-fetch.js
import { readFile } from 'node:fs/promises'

const bytes     = await readFile('factura.jpg')
const direccion = `data:image/jpeg;base64,${bytes.toString('base64')}`

const respuesta = await fetch(`${process.env.LLM_URL}/chat/completions`, {
  method: 'POST',
  headers: {
    'Content-Type': 'application/json',
    Authorization: `Bearer ${process.env.LLM_KEY}`,
  },
  body: JSON.stringify({
    model: process.env.LLM_MODEL,
    messages: [
      { role: 'system', content: 'Indicá el total de la factura. Respondé solo con el número.' },
      { role: 'user',   content: [{ type: 'image_url', image_url: { url: direccion } }] },
    ],
  }),
})

const json = await respuesta.json()
console.log(json.choices[0].message.content)
```

Es la llamada de la clase anterior con un contenido distinto. La dirección, los encabezados y la forma de la respuesta son los mismos.

Hay una condición: el modelo tiene que aceptar imágenes. No todos lo hacen, y el proveedor lo indica en la descripción de cada modelo.

## Conectarse con la librería

La función `pedir` que ya teníamos pasa `datos` directo al campo `content`. Como ese campo acepta una cadena o una lista de partes, `pedir` sirve sin tocarla. Solo agregamos dos ayudantes para armar las partes:

```js
// partes.js
import { readFile } from 'node:fs/promises'

const tipos = { jpg: 'image/jpeg', jpeg: 'image/jpeg', png: 'image/png', webp: 'image/webp' }

export function texto(contenido) {
  return { type: 'text', text: contenido }
}

export async function imagen(ruta) {
  const extension = ruta.split('.').pop().toLowerCase()
  const bytes     = await readFile(ruta)
  const direccion = `data:${tipos[extension]};base64,${bytes.toString('base64')}`
  return { type: 'image_url', image_url: { url: direccion } }
}
```

Y se usa así:

```js
import { pedir } from './llm.js'
import { imagen } from './partes.js'

const instruccion = `
Vas a recibir la foto de una factura.
Devolvé un JSON con numero, fecha (AAAA-MM-DD), cuitEmisor y total.
Si un dato no se lee con claridad, poné null. No lo deduzcas.
`

const datos = JSON.parse(await pedir(instruccion, [await imagen('factura.jpg')]))
```

La instrucción se construye con las mismas cinco preguntas de la clase anterior. Lo único nuevo es la quinta: ahora "no poder" incluye "no se lee".

## Qué ve el modelo y cuánto cuesta

- **La imagen se convierte en tokens.** Cuanto más grande, más tokens, más costo y más demora. Una foto de celular sin reducir puede costar como varias páginas de texto.
- **El proveedor la achica.** Si supera cierto tamaño la reduce antes de procesarla, y la letra chica se vuelve ilegible sin aviso.
- **Lee lo que una persona leería con esfuerzo normal.** Texto impreso derecho y nítido, casi siempre bien. Manuscrita, fotos torcidas, sellos encima del texto y brillo, con errores.

La decisión práctica: recortar la imagen a la zona útil y mandarla a un tamaño en que una persona la lea cómoda en pantalla. Más resolución que esa no mejora el resultado y sí el costo.

## Diez usos con imágenes

**1. Factura de proveedor.**

```text
Vas a recibir la foto de una factura.
Devolvé un JSON con tipo, numero, fecha (AAAA-MM-DD), cuitEmisor, razonSocial, neto, iva y total.
Los importes van como números, con punto decimal y sin separador de miles.
Si un dato no se lee con claridad, poné null.
```

**2. Los ítems de la factura.**

```text
Extraé los renglones de la factura.
Devolvé un JSON con la lista "items"; cada ítem tiene descripcion, cantidad, precioUnitario y subtotal.
Copiá los números tal como figuran. No los calcules ni los corrijas.
```

**3. Tarjeta personal.**

```text
Extraé los datos de la tarjeta.
Devolvé un JSON con nombre, cargo, empresa, telefono, correo y direccion.
Si un dato no figura, poné null.
```

**4. Comprobante de transferencia.**

```text
Vas a recibir la captura de un comprobante de transferencia bancaria.
Devolvé un JSON con fecha, importe, nombreOrdenante y numeroOperacion.
Si la imagen no es un comprobante de transferencia, devolvé {"error": "no es un comprobante"}.
```

**5. Pedido escrito a mano.**

```text
Vas a recibir la foto de un pedido manuscrito.
Devolvé un JSON con la lista "items"; cada ítem tiene producto, cantidad y "dudoso" (true o false).
Marcá dudoso cuando la letra no permita leer con seguridad el producto o la cantidad.
```

**6. Remito firmado.**

```text
Indicá si el remito tiene firma y aclaración del receptor.
Devolvé un JSON con "firmado" (true o false), "aclaracion" (el nombre, o null) y "fecha" (o null).
```

**7. Foto de un producto para el catálogo.**

```text
Describí el producto de la foto en 40 palabras para un catálogo.
Mencioná solo lo que se ve: tipo, color, material aparente, presentación.
No inventes marca, medidas ni precio.
```

**8. Captura de un error.**

```text
Vas a recibir la captura de pantalla de un error del sistema.
Explicá en dos oraciones, para un usuario no técnico, qué pasó y qué puede hacer.
Copiá aparte el código o mensaje de error exacto.
```

**9. Foto de un daño para un reclamo.**

```text
Describí el daño que se ve en el producto.
Devolvé un JSON con "hayDaño" (true o false), "descripcion" y "zona".
Describí solo lo visible. No opines sobre la causa.
```

**10. Dos imágenes: pedido contra remito.** Datos: las dos fotos, en ese orden.

```text
La primera imagen es un pedido y la segunda es el remito de entrega.
Listá las diferencias en productos y cantidades.
Si coinciden, respondé: sin diferencias.
```

El último ejemplo muestra que la lista de partes admite varias imágenes. El modelo las recibe en orden, y la instrucción dice cuál es cuál.

## El PDF

Un PDF puede ser dos cosas muy distintas:

- **Un PDF con texto.** Lo generó un programa. Adentro están las letras, y se pueden seleccionar y copiar.
- **Un PDF escaneado.** Es una foto de un papel, guardada como PDF. Adentro no hay letras, hay una imagen.

Por eso hay tres caminos, y elegir entre ellos es la decisión de esta sección.

| Camino | Sirve para | Costo | Riesgo |
|---|---|---|---|
| Extraer el texto en código y mandarlo como texto | PDF con texto | Bajo | Pierde la forma de las tablas; no sirve para escaneados |
| Convertir cada página en imagen | Cualquier PDF | Alto | Puede leer mal un número |
| Mandar el PDF tal cual | Lo que el proveedor acepte | Medio | No todos los proveedores lo admiten |

### Camino 1: extraer el texto

El texto sale del archivo con una librería, sin modelo de por medio. Es exacto: lo que devuelve es lo que está escrito.

```bash
pnpm add unpdf
```

```js
// pdf.js
import { readFile } from 'node:fs/promises'
import { extractText, getDocumentProxy } from 'unpdf'

export async function textoDePdf(ruta) {
  const bytes     = new Uint8Array(await readFile(ruta))
  const documento = await getDocumentProxy(bytes)
  const { totalPages, text } = await extractText(documento, { mergePages: true })
  return { paginas: totalPages, texto: text }
}
```

A partir de ahí es la clase anterior:

```js
const { texto } = await textoDePdf('lista-de-precios.pdf')
const resultado = await pedir(instruccion, texto)
```

Si `texto` vuelve vacío o con muy pocas letras para la cantidad de páginas, el PDF es escaneado y hay que ir por el camino 2.

### Camino 2: páginas como imágenes

Cada página se convierte en una imagen y se manda como en la primera parte de la clase. Es el único camino para escaneados, y el mejor cuando la disposición importa: tablas complejas, formularios, planos.

Convertir una página en imagen es dibujarla, igual que hace el visor de PDF en la pantalla, pero sobre un lienzo en memoria que después se convierte en PNG.

La función `renderPageAsImage` detecta el ambiente donde se ejecuta. Si se ejecuta en un **navegador**, usa el mecanismo de dibujo con canvas que este proporciona. Si se ejecuta en **Node.js**, necesita que le indiquemos explícitamente una biblioteca que aporte ese mecanismo. En este ejemplo usamos `@napi-rs/canvas`:

```bash
pnpm add unpdf @napi-rs/canvas
```

```js
// pdf-imagenes.js
import { readFile } from 'node:fs/promises'
import { getDocumentProxy, renderPageAsImage } from 'unpdf'
import * as canvas from '@napi-rs/canvas'

export async function paginasComoImagenes(ruta, escala = 2) {
  const bytes = new Uint8Array(await readFile(ruta))
  const documento = await getDocumentProxy(new Uint8Array(bytes))
  const partes = []

  for (let pagina = 1; pagina <= documento.numPages; pagina++) {
    const direccion = await renderPageAsImage(new Uint8Array(bytes), pagina, {
      canvasImport: async () => canvas,
      scale: escala,
      toDataURL: true,
    })
    partes.push({ type: 'image_url', image_url: { url: direccion } })
  }

  return partes
}
```

Algunos detalles:

- **El lienzo se pasa a `unpdf`.** La opción `canvasImport` le entrega la biblioteca `canvas` que importamos al comienzo.
- **`toDataURL: true` devuelve la imagen lista para enviar.** La dirección incluye la imagen PNG codificada en Base64.
- **Devuelve partes listas para el mensaje.** Cada página queda con la misma forma que produce `imagen()`.
- **La escala decide la nitidez.** Con 1, una hoja A4 sale de unos 600 por 840 puntos y la letra chica no se lee. Con 2 sale de 1190 por 1683 y se lee bien. Más que eso casi nunca mejora la lectura y sí el costo.
- **Se pasa una copia de los bytes en cada uso.** La librería se queda con el arreglo que recibe, y por eso se le da uno nuevo cada vez con `new Uint8Array(bytes)`.

Se usa así:

```js
const paginas   = await paginasComoImagenes('formulario-escaneado.pdf')
const resultado = await pedir(instruccion, paginas)
```

Cuesta más que el camino 1 y tiene el riesgo de toda lectura visual. Con documentos largos conviene mandar solo las páginas que hacen falta: `paginas.slice(0, 2)` manda las dos primeras.

### Camino 3: el PDF directo

Algunos proveedores aceptan el archivo como una parte más del mensaje y resuelven adentro los dos caminos anteriores. Es lo más cómodo, pero el formato de esa parte cambia de un proveedor a otro, así que hay que tomarlo de su documentación.

### Cómo elegir

1. Probar el camino 1. Si devuelve texto y la tarea no depende de la disposición, quedarse ahí.
2. Si es escaneado o la tabla sale desordenada, pasar al camino 2 con las páginas necesarias.
3. Usar el camino 3 cuando el proveedor lo ofrezca y el volumen sea chico.

## Markdown, el formato intermedio

Los documentos de una empresa vienen en Word, PDF, páginas web y planillas. Mandarle al modelo cada formato por un camino distinto complica el sistema. Lo habitual es convertir todo a un formato común antes de la llamada, y ese formato es Markdown.

### Por qué Markdown

- **Conserva la estructura.** Títulos, listas, tablas y énfasis sobreviven a la conversión. El texto plano los pierde, y con ellos se pierde sentido: sin títulos, el modelo no sabe a qué sección pertenece una cláusula; sin tabla, no sabe qué precio corresponde a qué producto.
- **Gasta pocos tokens.** Un título en HTML es `<h2 class="titulo">Entregas</h2>`; en Markdown es `## Entregas`. En una página web real, las etiquetas, los estilos y los menús pueden ser más que el contenido. Convertir a Markdown reduce el costo y saca ruido.
- **El modelo lo conoce a fondo.** Aprendió de una cantidad enorme de texto en Markdown. Lo lee sin esfuerzo y es el formato en que escribe por defecto.
- **Es texto.** Se puede leer, comparar entre versiones, guardar en la base, buscar y partir en trozos sin herramientas especiales.
- **Sirve de ida y de vuelta.** El mismo formato que entra es el que sale. Cuando el modelo genera un informe, lo genera en Markdown, y de ahí se pasa a HTML o a PDF.

La consecuencia de diseño: en lugar de un camino por formato, hay un conversor por formato y un solo camino después.

```text
Word ──┐
PDF  ──┤
Web  ──┼──▶ Markdown ──▶ pedir(instruccion, markdown)
Excel ─┘
```

Conviene guardar el Markdown junto al documento original. Convertir cuesta tiempo y a veces dinero, y el resultado se va a usar muchas veces.

### De HTML a Markdown

Es la conversión más directa, porque los dos formatos describen la misma estructura.

```bash
pnpm add turndown turndown-plugin-gfm
```

```js
// markdown.js
import TurndownService from 'turndown'
import { gfm } from 'turndown-plugin-gfm'

const conversor = new TurndownService({ headingStyle: 'atx', bulletListMarker: '-' })
conversor.use(gfm)

export function htmlAMarkdown(html) {
  return conversor.turndown(html)
}
```

El agregado `gfm` es el que convierte las tablas. Con esta entrada:

```html
<h1>Hola</h1>
<p>Un <strong>texto</strong> con <a href="https://x.com">enlace</a>.</p>
```

devuelve:

```markdown
# Hola

Un **texto** con [enlace](https://x.com).
```

En una página web real conviene quedarse primero con la parte del contenido, por ejemplo el elemento `<main>` o `<article>`, y convertir solo eso. Si no, entran el menú, el pie y la publicidad.

### De Word a Markdown

Se hace en dos pasos: de Word a HTML con una librería, y de HTML a Markdown con la función anterior.

```bash
pnpm add mammoth
```

```js
// markdown.js (continuación)
import mammoth from 'mammoth'

export async function docxAMarkdown(ruta) {
  const { value: html } = await mammoth.convertToHtml({ path: ruta })
  return htmlAMarkdown(html)
}
```

Un documento con un título, un subtítulo y una lista queda así:

```markdown
# Condiciones de venta

Los precios no incluyen IVA.

## Entregas

-   Dentro de las 48 horas.
-   Sin cargo en la capital.
```

Dos advertencias:

- **Depende de cómo se escribió el documento.** Si el autor usó los estilos de título de Word, salen como títulos. Si solo agrandó la letra y la puso en negrita, salen como párrafos comunes.
- **Las tablas sin fila de encabezado quedan en HTML.** Markdown exige encabezado en las tablas, y el conversor no lo inventa. El modelo las lee igual, aunque ocupan más.

### De una planilla a Markdown

Una tabla de Markdown es una fila de encabezado, una fila de guiones y las filas de datos. Con las filas ya leídas del CSV o de la base, se arma con una función corta:

```js
export function tablaAMarkdown(filas) {
  const [encabezado, ...datos] = filas
  const linea = (celdas) => `| ${celdas.join(' | ')} |`

  return [linea(encabezado), linea(encabezado.map(() => '---')), ...datos.map(linea)].join('\n')
}
```

```js
tablaAMarkdown([
  ['Producto', 'Precio'],
  ['Caja', 1500],
  ['Bolsa', 300],
])
```

```markdown
| Producto | Precio |
| --- | --- |
| Caja | 1500 |
| Bolsa | 300 |
```

Para tablas grandes conviene mandar solo las columnas y filas que la tarea necesita. Y si la tarea es sumar o filtrar, no se le manda la tabla al modelo: eso lo hace el código.

### De PDF a Markdown

Es el caso difícil, y la razón es de fondo. Un PDF no guarda títulos, párrafos ni tablas. Guarda letras con su posición en la página. Que un texto sea un título es algo que el lector deduce porque está más grande y arriba. Por eso no hay conversión exacta, solo reconstrucciones.

Hay dos formas de hacerlo:

- **Extraer el texto y aceptarlo sin estructura.** Es el camino 1 de la sección anterior. Alcanza para muchos usos, pero no es Markdown de verdad: no trae títulos ni tablas.
- **Pedirle la reconstrucción al modelo.** Se mandan las páginas como imágenes y se le pide que las transcriba a Markdown. El modelo ve la página como la ve una persona y deduce la estructura.

```js
const instruccion = `
Vas a recibir las páginas de un documento.
Transcribilas a Markdown conservando títulos, listas y tablas.
Copiá el texto tal como figura: no resumas, no corrijas y no agregues nada.
Donde algo no se lea, escribí [ilegible].
`

const markdown = await pedir(instruccion, await paginasComoImagenes('contrato.pdf'))
```

Es el camino más caro y tiene el riesgo de siempre: una transcripción hecha por un modelo puede tener un número cambiado. Sirve bien para entender y resumir un documento. Para datos que van a un sistema contable, se aplican los controles de la sección de verificación.

### Herramientas que ya lo resuelven

Existen programas que convierten muchos formatos a Markdown con un solo comando, por ejemplo `pandoc` y `markitdown`. Para un proyecto real suelen ser la opción práctica. Acá armamos las conversiones a mano para ver que no hay nada oculto: cada una es una traducción de estructura, y la del PDF es una reconstrucción.

## Diez usos con documentos

Los ejemplos reciben el documento ya convertido a Markdown, salvo el último.

**1. Lista de precios de un proveedor.**

```text
Vas a recibir el texto de una lista de precios.
Devolvé un JSON con la lista "productos"; cada uno tiene codigo, descripcion y precio.
Ignorá encabezados, pies de página y condiciones comerciales.
```

**2. Contrato.**

```text
Devolvé un JSON con partes (lista de nombres), fechaInicio, fechaFin, montoMensual y moneda.
Si un dato no figura, poné null.
```

**3. Cláusulas de riesgo.**

```text
Listá las cláusulas que hablen de multas, rescisión o renovación automática.
Para cada una indicá el número de cláusula y un resumen de una oración.
```

**4. Resumen de cuenta bancario.**

```text
Extraé los movimientos del resumen.
Devolvé un JSON con la lista "movimientos"; cada uno tiene fecha, descripcion e importe.
Los débitos van con signo negativo.
```

**5. Orden de compra de un cliente.**

```text
Devolvé un JSON con numeroOrden, fechaEntrega, direccionEntrega e items (producto y cantidad).
```

**6. Currículum.**

```text
Devolvé un JSON con nombre, correo, telefono, y la lista "experiencia" con empresa, puesto, desde y hasta.
No evalúes al candidato.
```

**7. Manual de un producto.**

```text
Respondé la pregunta usando únicamente el manual adjunto.
Indicá la sección de donde sale la respuesta.
Si el manual no la contiene, respondé: no figura en el manual.
```

**8. Informe largo.**

```text
Resumí el informe en cinco puntos para un gerente que tiene dos minutos.
Cada punto debe incluir el dato numérico que lo respalda, si el informe lo trae.
```

**9. Dos versiones de un contrato.** Datos: el texto de las dos versiones.

```text
Vas a recibir dos versiones de un contrato, separadas por una línea de guiones.
Listá los cambios entre la primera y la segunda, cláusula por cláusula.
```

**10. Formulario escaneado.** Va por el camino 2.

```text
Vas a recibir la imagen de un formulario de alta de cliente completado a mano.
Devolvé un JSON con cada campo del formulario y el valor escrito.
Si un campo está vacío, poné null. Si no se lee, poné "ilegible".
```

## Leer no es acertar: verificar en código

Cuando el modelo lee mal un texto, la frase suele quedar rara y se nota. Cuando lee mal un número no se nota: `1.500,50` y `1.800,50` son igual de creíbles. Y en una factura lo que importa son los números.

No se soluciona pidiéndole al modelo que tenga cuidado. Se soluciona con controles que escribe el código. Muchos documentos comerciales traen redundancia, datos que tienen que coincidir entre sí, y esa redundancia se puede comprobar.

**Los renglones tienen que sumar el total.**

```js
function totalCoincide(factura) {
  const suma = factura.items.reduce((total, item) => total + item.subtotal, 0)
  return Math.abs(suma - factura.neto) < 0.01
}
```

**El CUIT trae un dígito verificador.** El último dígito se calcula a partir de los diez primeros. Si el modelo leyó mal uno solo, la cuenta no cierra.

```js
function cuitValido(cuit) {
  const digitos = cuit.replace(/\D/g, '')
  if (digitos.length !== 11) return false

  const pesos = [5, 4, 3, 2, 7, 6, 5, 4, 3, 2]
  const suma = pesos.reduce((total, peso, i) => total + peso * Number(digitos[i]), 0)
  const resto = 11 - (suma % 11)
  const verificador = resto === 11 ? 0 : resto

  return verificador === Number(digitos[10])
}
```

**Otros controles del mismo tipo:**

- Neto más IVA es igual al total.
- Cantidad por precio unitario es igual al subtotal de cada renglón.
- La fecha existe y no es futura.
- El proveedor con ese CUIT está en la base.
- El número de factura no fue cargado antes.

Con los controles, el flujo queda así:

1. El modelo extrae.
2. El código verifica.
3. Si todo cierra, se carga solo.
4. Si algo no cierra, pasa a una persona con el dato dudoso señalado.

Es la misma división que vimos con el cálculo: el modelo entiende el documento y el código decide si se le puede creer. Lo que no tiene control posible, como un nombre o una descripción, es lo que conviene que una persona mire.

## Audio como entrada

Buena parte de los pedidos y reclamos de un comercio llegan como mensaje de voz. Para un sistema, un audio es lo más opaco que hay: no se puede buscar, filtrar ni cargar. El primer paso siempre es pasarlo a texto.

### Dos pasos, dos modelos

El camino habitual separa el trabajo:

1. **Transcribir.** Un modelo especializado recibe el audio y devuelve lo que se dijo, como texto.
2. **Procesar.** Ese texto entra a `pedir`, como en la primera clase.

Separarlos tiene una ventaja: la transcripción se guarda. Queda como registro, se puede mostrar al usuario para que la corrija, y se puede volver a procesar con otra instrucción sin pagar la transcripción de nuevo.

### La llamada de transcripción

Es otra dirección del mismo proveedor, `/audio/transcriptions`, y tiene una diferencia con todo lo anterior: el archivo no viaja en base64 dentro de un JSON, viaja como formulario con archivo adjunto, igual que cuando un navegador sube una foto. Por eso no lleva el encabezado `Content-Type`: lo arma `fetch` a partir del formulario.

```js
// audio-fetch.js
import { readFile } from 'node:fs/promises'

const bytes = await readFile('pedido.mp3')

const formulario = new FormData()
formulario.append('file', new Blob([bytes]), 'pedido.mp3')
formulario.append('model', process.env.LLM_MODEL_AUDIO)
formulario.append('language', 'es')

const respuesta = await fetch(`${process.env.LLM_URL}/audio/transcriptions`, {
  method: 'POST',
  headers: { Authorization: `Bearer ${process.env.LLM_KEY}` },
  body: formulario,
})

const json = await respuesta.json()
console.log(json.text)
```

El modelo de transcripción es distinto del de texto, y por eso va en otra variable del `.env`:

```bash
LLM_MODEL_AUDIO=nombre-del-modelo-de-transcripcion
```

No todos los proveedores ofrecen transcripción. Si el que usamos para texto no la tiene, se usa otro para este paso, con su propia dirección y su propia clave.

### Con la librería

```js
// audio.js
import { createReadStream } from 'node:fs'
import OpenAI from 'openai'

const cliente = new OpenAI({
  baseURL: process.env.LLM_URL,
  apiKey: process.env.LLM_KEY,
})

export async function transcribir(ruta) {
  const respuesta = await cliente.audio.transcriptions.create({
    file: createReadStream(ruta),
    model: process.env.LLM_MODEL_AUDIO,
    language: 'es',
  })

  return respuesta.text
}
```

Y los dos pasos juntos:

```js
import { pedir } from './llm.js'
import { transcribir } from './audio.js'

const instruccion = `
Vas a recibir la transcripción de un mensaje de voz de un cliente.
Devolvé un JSON con la lista "items" (producto y cantidad) y "fechaEntrega" (AAAA-MM-DD o null).
La transcripción puede tener palabras mal escritas; interpretalas por el contexto.
Si el mensaje no es un pedido, devolvé {"error": "no es un pedido"}.
`

const dicho = await transcribir('pedido.mp3')
const pedido = JSON.parse(await pedir(instruccion, dicho))
```

### Decisiones

- **Indicar el idioma.** Sin el parámetro `language`, el modelo lo adivina, y con audios cortos puede equivocarse.
- **El formato del archivo.** Los audios de WhatsApp vienen en `.ogg` o `.opus`. Hay que confirmar que el proveedor los acepte; si no, se convierten antes a `.mp3` con una herramienta como `ffmpeg`.
- **El tamaño.** Hay un máximo por archivo. Un audio largo se corta en tramos y se transcribe de a uno.
- **Las palabras propias.** Nombres de productos, marcas y apellidos son lo que peor sale. Algunos proveedores aceptan una lista de términos esperados para orientar al modelo.
- **Un paso o dos.** Algunos modelos de texto reciben el audio directo, como una parte más del mensaje. Es más simple y entiende el tono de voz, pero no deja transcripción guardada y depende del proveedor.

### Qué falla

- **Nombres y números.** "Quince" y "quinientos", "Pérez" y "Paz". Son justo los datos que importan.
- **Ruido y varias voces.** Un audio grabado en la calle o con gente hablando atrás pierde palabras.
- **Silencio.** Con un audio vacío o solo con ruido, algunos modelos devuelven una frase inventada en lugar de nada.
- **No sabe quién habla.** La transcripción común no distingue interlocutores. En una reunión, todo sale como un solo texto.

La defensa es la de siempre: lo que el modelo extrae del audio se verifica contra el sistema. El producto tiene que existir en el catálogo y el cliente en la base; si no, se le pregunta a una persona.

### Diez usos con audio

En todos, los datos son la transcripción.

**1. Pedido por mensaje de voz.**

```text
Vas a recibir la transcripción de un mensaje de voz de un cliente.
Devolvé un JSON con la lista "items" (producto y cantidad) y "fechaEntrega".
Si no es un pedido, devolvé {"error": "no es un pedido"}.
```

**2. Nota de visita dictada por el vendedor.**

```text
Vas a recibir el dictado de un vendedor al salir de una visita.
Escribí una nota ordenada con tres apartados: qué se habló, qué se acordó, próximo paso.
No agregues nada que no se haya dicho.
```

**3. Reclamo por audio.**

```text
Devolvé un JSON con "motivo" (una oración), "producto" (o null), "urgencia" (alta, media o baja)
y "pideDevolucion" (true o false).
```

**4. Minuta de una reunión grabada.**

```text
Vas a recibir la transcripción de una reunión, sin identificación de quién habla.
Resumí los temas tratados y listá los compromisos con su responsable, cuando se lo nombre.
Si no se nombra responsable, poné "sin asignar".
```

**5. Recordatorio dictado.**

```text
Extraé el recordatorio del mensaje.
Devolvé un JSON con "tarea", "fecha" (AAAA-MM-DD) y "hora" (HH:MM o null).
La fecha de hoy es {hoy}. Resolvé expresiones como "mañana" o "el jueves" respecto de esa fecha.
```

**6. Alta de contacto por voz.**

```text
Devolvé un JSON con nombre, empresa, telefono y correo.
Los teléfonos y correos dictados pueden tener errores: copialos como se oyen y agregá "revisar": true.
```

**7. Clasificar mensajes de voz entrantes.**

```text
Clasificá el mensaje en una sola categoría: pedido, reclamo, consulta, otro.
Respondé únicamente con la palabra.
```

**8. Control de calidad de una llamada de atención.**

```text
Vas a recibir la transcripción de una llamada entre un empleado y un cliente.
Evaluá con sí o no: saludó, entendió el problema, ofreció una solución, confirmó el próximo paso.
Devolvé un JSON con los cuatro criterios.
```

**9. Respuesta escrita a un audio.**

```text
Vas a recibir la transcripción de una consulta de un cliente y la política de la empresa.
Redactá una respuesta breve para enviar por escrito, usando solo la política.
```

**10. Subtítulos de un video de producto.**

```text
Vas a recibir la transcripción de un video.
Dividila en líneas de hasta 40 caracteres, sin cortar palabras ni cambiar el texto.
```

El ejemplo 5 muestra algo que vale para cualquier entrada: el modelo no sabe qué día es. Si la tarea depende de la fecha, la fecha va en la instrucción.

## Límites que hay que tener presentes

- **Lee mal sin avisar.** Sobre todo números, letra manuscrita e imágenes de baja calidad.
- **Completa lo que no ve.** Si la foto corta el total, puede devolver uno. Por eso la instrucción siempre prevé el caso "no se lee".
- **Cuesta más que el texto.** Una imagen equivale a muchas palabras.
- **Los documentos traen datos de terceros.** Una factura o un currículum tienen datos personales y se están enviando a un proveedor externo. Hay que saber qué hace ese proveedor con lo que recibe.
- **Una imagen o un audio también pueden traer órdenes.** Un texto dentro de la foto, o una frase en el audio, que diga "ignorá las instrucciones" es un dato, y hay que tratarlo como tal.

## Para hacer en clase

1. Extraer los datos de la misma factura cinco veces y comparar los importes entre corridas.
2. Repetir con la foto reducida a la cuarta parte y con una foto torcida. Anotar antes qué se espera que falle.
3. Tapar el total de la factura y ver qué devuelve con y sin la frase "si un dato no se lee con claridad, poné null".
4. Pasar un PDF con texto por el camino 1 y por el camino 2. Comparar resultado, tiempo y tokens.
5. Agregar los controles de suma y de CUIT, y contar cuántos errores de lectura detectan.
6. Convertir a Markdown una página web con y sin recortar el contenido principal. Comparar la cantidad de caracteres de cada versión con la del HTML original.
7. Grabar el mismo pedido en un lugar silencioso y en uno con ruido. Comparar las dos transcripciones y marcar qué palabras cambiaron.
