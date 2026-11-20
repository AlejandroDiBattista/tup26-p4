# Una app mínima: foto carnet con IA

Vamos a estudiar una página que transforma una foto en un retrato tipo carnet. La persona puede **sacar una foto con la cámara** o **elegir una imagen que ya tiene**. La aplicación prepara esa imagen, se la envía a un modelo y muestra el resultado. Cuando está listo, permite **descargarlo**.

La aplicación completa está en [35.camara-imagen.html](../apuntes/35.camara-imagen.html). Es una sola página: el HTML, el CSS y el JavaScript están en el mismo archivo. No tiene servidor propio ni usa librerías externas.

Este apunte explica el funcionamiento. Los estilos y los dibujos SVG de los botones están en el archivo, pero no son el centro de la explicación.

## El recorrido completo

```text
                      ┌── cámara → video → captura cuadrada ──┐
                      │                                       │
                      └── archivo → imagen completa ──────────┤
                                                              ↓
                                                  canvas → JPEG en base64
                                                              ↓
                                                  modelo de imágenes
                                                              ↓
                                                  foto carnet → pantalla
                                                              ↓
                                                         descarga
```

Las dos entradas llegan al mismo lugar: una imagen preparada en memoria. Desde ahí se usa el mismo código para enviarla, mostrar el resultado y habilitar la descarga.

La pantalla tiene tres controles: subir una imagen, capturar con la cámara y descargar. El punto verde indica que la cámara está encendida; el rojo intermitente indica que se está procesando. Si está activada la preferencia de movimiento reducido, el rojo queda fijo.

## Los elementos de la página

Estos son los elementos que intervienen en el funcionamiento; se omiten aquí los SVG que dibujan los iconos:

```html
<video id="camara" autoplay playsinline muted></video>
<img id="foto" alt="" hidden>

<button id="subir" type="button" aria-label="Subir foto">...</button>
<button id="boton" type="button" aria-label="Sacar foto">...</button>
<button id="descargar" type="button" aria-label="Descargar foto" disabled>...</button>
<input id="archivo" type="file" accept="image/*" hidden>
```

- `<video>` muestra la cámara en vivo. `autoplay` intenta reproducirla automáticamente, `playsinline` permite mostrarla dentro de la página en dispositivos compatibles y `muted` la mantiene sin sonido.
- `<img>` muestra la imagen elegida o capturada y, después, la generada. Empieza con `hidden`, porque al abrir la página se muestra el video.
- El `<input type="file">` permite elegir un archivo. Está oculto porque la selección se abre desde el botón de subir.
- El botón de descarga empieza con `disabled`: todavía no hay un resultado para guardar.

En JavaScript se obtienen referencias a esos elementos con `document.querySelector`. Por ejemplo:

```js
const camara  = document.querySelector('#camara')
const foto    = document.querySelector('#foto')
const subir   = document.querySelector('#subir')
const archivo = document.querySelector('#archivo')
```

Las referencias permiten conectar la página con las acciones: leer el archivo elegido, mostrar una imagen, cambiar un botón o conectar la cámara al video.

## 1. Subir una imagen

Subir una imagen comienza eligiendo un archivo del dispositivo. En esta aplicación, elegirlo **no lo envía inmediatamente al modelo**: primero el navegador lo abre y el programa lo prepara. Después se envía en la llamada que estudiaremos más adelante.

### Abrir el selector de archivos

El control que sabe elegir archivos es el `input`:

```html
<input id="archivo" type="file" accept="image/*" hidden>
```

`type="file"` le pide al navegador un selector de archivos. `accept="image/*"` le indica que se buscan imágenes; no convierte el archivo a otro formato. El navegador o el sistema operativo deciden cómo mostrar las opciones disponibles.

Como queremos usar nuestro propio botón, el `input` está oculto y se abre desde JavaScript:

```js
subir.onclick = () => archivo.click()
```

Al tocar el botón, `archivo.click()` activa el selector del `input`. Es el usuario quien elige el archivo en la ventana del navegador.

### Obtener el archivo elegido

Cuando cambia la selección se ejecuta `onchange`:

```js
archivo.onchange = async () => {
  const elegido = archivo.files[0]
  if (!elegido) return
  archivo.value = ''

  // Cargar y preparar la imagen...
}
```

`archivo.files` contiene los archivos seleccionados. Como se elige uno, tomamos el primero con `[0]`. Ese valor es un objeto `File`: representa el archivo y permite trabajar con sus datos desde el navegador.

Si no hay archivo, la función termina. Después se limpia el valor del control para que elegir nuevamente el mismo archivo pueda producir otro cambio.

### Abrir el archivo como imagen

Para dibujar el archivo, necesitamos que el navegador lo interprete como una imagen y conozca sus dimensiones. La aplicación crea un objeto `Image` en memoria, sin agregarlo a la página, y una dirección temporal que apunta al archivo elegido.

Al asignar esa dirección a `imagen.src`, el navegador comienza a cargar la imagen. Como la carga puede tardar, definimos una función en `imagen.onload`: el navegador la ejecuta cuando la imagen está lista. Recién entonces podemos conocer sus dimensiones, prepararla y enviarla al procesamiento.

```text
Archivo elegido → dirección temporal → objeto Image → carga del navegador
                                                          ↓
                                                  onload → procesamiento
```

El código es este:

```js
const direccion = URL.createObjectURL(elegido)
const imagen = new Image()

imagen.onload = async () => {
  URL.revokeObjectURL(direccion)
  const captura = prepararImagen(
    imagen,
    imagen.naturalWidth,
    imagen.naturalHeight,
  )
  await generarFoto(captura)
}

imagen.onerror = () => {
  URL.revokeObjectURL(direccion)
}
imagen.src = direccion
```

`URL.createObjectURL(elegido)` crea una **dirección temporal del navegador** que apunta al archivo. Asignarla a `imagen.src` inicia su carga. No es una dirección pública ni envía el archivo a internet.

`onload` se ejecuta cuando la imagen terminó de cargar. En ese momento `naturalWidth` y `naturalHeight` indican su ancho y alto originales en píxeles. Con esos datos, `prepararImagen` puede dibujarla.

`URL.revokeObjectURL(direccion)` libera la dirección temporal cuando deja de ser necesaria. Si la imagen no se puede abrir, `onerror` también la libera. En esta versión el fallo no muestra un mensaje.

### Conservar la imagen completa

La rama de `prepararImagen` para archivos elegidos hace esto:

```js
const escala = Math.min(1, LADO / Math.max(ancho, alto))
lienzo.width = Math.round(ancho * escala)
lienzo.height = Math.round(alto * escala)
lienzo.getContext('2d').drawImage(origen, 0, 0, lienzo.width, lienzo.height)
```

`LADO` vale `1024`. Se busca el lado más largo y se calcula una escala para que no supere ese tamaño. El `Math.min(1, ...)` evita agrandar una imagen que ya es menor.

Por ejemplo, una imagen de **1200 × 1800** se dibuja aproximadamente a **683 × 1024**. Una de **600 × 800** conserva su tamaño. En ambos casos se mantiene la proporción y se envía la imagen completa, sin recortarla a un cuadrado. El modelo recibe así todo el contexto disponible para componer el retrato.

## 2. Capturar una foto con la cámara

En lugar de leer un archivo existente, podemos obtener una imagen desde un flujo de video. El navegador intermedia entre la página y la cámara del dispositivo.

### Encender la cámara

La página llama a `mostrarCamara()` al abrirse. Esa función prepara la vista y llama a:

```js
async function iniciarCamara() {
  camara.srcObject = await navigator.mediaDevices.getUserMedia({
    video: { facingMode: 'user' },
  })
  mostrarLuzCamara(true)
}
```

`getUserMedia` solicita acceso a un dispositivo multimedia. El navegador puede pedir permiso a la persona. La opción `video` pide una cámara y `facingMode: 'user'` solicita preferentemente la cámara frontal.

Si se concede el acceso, la promesa devuelve un **flujo multimedia**: una fuente de imágenes que llegan continuamente. Al asignarlo a `camara.srcObject`, el elemento `<video>` muestra ese flujo en vivo. Luego se enciende la luz verde de la página.

Para usar la cámara, la página debe ejecutarse en un **contexto seguro**, normalmente mediante HTTPS o `localhost`, y el navegador debe contar con permiso para acceder al dispositivo.

### Capturar un cuadro del video

El botón central tiene dos comportamientos:

```js
boton.onclick = async () => {
  if (camara.hidden || !camara.srcObject) return mostrarCamara()

  const captura = prepararImagen(camara, camara.videoWidth, camara.videoHeight)
  await generarFoto(captura)
}
```

Si se está viendo una imagen o no hay un flujo conectado, el botón intenta volver a la cámara. Si la cámara está activa, toma un cuadro del video.

`videoWidth` y `videoHeight` son las dimensiones reales del video, no las dimensiones a las que se ve en la pantalla. Se pasan junto con el elemento `<video>` a `prepararImagen`.

Un video es una sucesión de cuadros. Dibujar el `<video>` en un canvas toma el cuadro disponible en ese momento: así se obtiene una foto fija.

### Recortar el cuadrado central

A diferencia del archivo elegido, la captura se recorta a un cuadrado. El CSS hace que el video llene un recuadro cuadrado con `object-fit: cover`; el programa toma el cuadrado central para que la captura corresponda a esa vista.

```js
const lado = Math.min(ancho, alto)
const x = (ancho - lado) / 2
const y = (alto  - lado) / 2

lienzo.width  = LADO
lienzo.height = LADO
lienzo.getContext('2d').drawImage(
  origen, x, y, lado, lado,
  0, 0, LADO, LADO,
)
```

Se usa el lado más corto para encontrar el cuadrado más grande que entra en el video. `x` e `y` calculan dónde empieza ese cuadrado para que quede centrado.

Por ejemplo, en un video de **1920 × 1080**, el cuadrado es de **1080 × 1080**. Se dejan 420 píxeles a cada lado:

```text
               1920 px
┌────────┬─────────────────┬────────┐
│ 420 px │                 │ 420 px │
│        │  cuadrado       │        │ 1080 px
│        │  1080 × 1080    │        │
└────────┴─────────────────┴────────┘
```

`drawImage` toma ese cuadrado del video y lo dibuja en el lienzo de **1024 × 1024**. En una sola operación recorta y cambia el tamaño. La persona debe ubicarse dentro del cuadrado visible: lo que queda fuera de él no llega al modelo.

### Apagar la cámara

Después de preparar la captura, `generarFoto` llama a:

```js
function apagarCamara() {
  camara.srcObject?.getTracks().forEach((pista) => pista.stop())
  camara.srcObject = null
  mostrarLuzCamara(false)
}
```

El flujo está compuesto por *pistas*; en este ejemplo se solicitó video. `getTracks()` las obtiene y `stop()` detiene cada una. `?.` permite que la expresión no falle si no hay un flujo conectado, por ejemplo cuando la persona eligió un archivo y la cámara no está activa.

Ocultar el video no detiene la cámara. Por eso se detienen sus pistas, se desconecta el flujo y se apaga la luz verde. Para tomar otra foto se solicita un flujo nuevo mediante `mostrarCamara()`.

## 3. Preparar la imagen para enviarla

Tanto la captura como el archivo pasan por `prepararImagen`. Ya vimos que se dibujan de manera diferente: la cámara se recorta; el archivo se conserva completo. En ambos casos se usa un **canvas**, un lienzo en memoria:

```js
const lienzo = document.createElement('canvas')
```

No hace falta agregarlo a la página. El contexto `2d` permite dibujar el cuadro del video o la imagen elegida y cambiar su tamaño. Una vez dibujada, `toDataURL` genera una dirección con la imagen JPEG codificada en Base64:

```js
return lienzo.toDataURL('image/jpeg', 0.9)
```

El `0.9` solicita una calidad JPEG alta dentro del rango de 0 a 1. El resultado es una cadena que comienza con `data:image/jpeg;base64,` y contiene los datos de la imagen. `toDataURL` devuelve la cadena directamente: en este caso no hace falta una promesa ni usar `await` para preparar la imagen.

La misma data URL sirve para mostrar la imagen de entrada y para enviarla en JSON. Es distinta de la URL temporal `blob:` que se usa al abrir un archivo elegido.

## 4. Enviar la imagen al modelo

La función `generarFoto` recibe la data URL del JPEG preparado tanto si proviene de la cámara como de un archivo. Primero detiene la cámara, muestra la imagen de entrada y cambia la interfaz al estado de espera. Después llama a `procesar`:

```js
async function generarFoto(captura) {
  apagarCamara()
  mostrarProcesando(captura)

  try {
    const resultado = await procesar(captura)
    mostrarResultado(resultado)
  } catch {}

  terminarProcesamiento()
}
```

La data URL permite mostrar el JPEG de entrada directamente. Cuando llega el resultado, se muestra en su lugar. Los bloques `catch` vacíos hacen que esta versión no informe el error; `terminarProcesamiento` vuelve a habilitar los controles al terminar el intento.

### La instrucción

La constante `INSTRUCCION` describe el resultado que se busca: conservar la identidad, mostrar la cabeza y los hombros, usar iluminación suave y un fondo gris cálido. También pide evitar filtros y poses publicitarias.

Es una indicación al modelo, no una garantía. Conviene comparar el resultado con la imagen original: una imagen generada puede cambiar rasgos o detalles aunque la instrucción pida conservarlos.

### El pedido JSON

`procesar` envía la instrucción, la imagen y las opciones como un objeto JSON:

```js
const respuesta = await fetch(DIRECCION, {
  method: 'POST',
  headers: {
    Authorization: `Bearer ${clave()}`,
    'Content-Type': 'application/json',
  },
  body: JSON.stringify({
    model: MODELO,
    images: [{ image_url: captura }],
    prompt: INSTRUCCION,
    size: SALIDA,
    quality: 'low',
  }),
})
```

- `model`: el nombre configurado para el modelo.
- `images`: una lista con la imagen de entrada. `image_url` recibe la data URL del JPEG.
- `prompt`: la instrucción que describe el retrato.
- `size`: el tamaño solicitado para la salida, configurado como `1024x1024`.
- `quality`: la calidad solicitada; en este ejemplo es `low`.

`JSON.stringify` convierte el objeto a texto para enviarlo. El encabezado `Content-Type` indica que el cuerpo contiene JSON, mientras que `Authorization` lleva la clave. La imagen de entrada puede ser rectangular: `SALIDA` define el tamaño solicitado para la imagen **generada**.

Una alternativa es enviar el JPEG como archivo con `FormData`. En JSON, Base64 ocupa aproximadamente un tercio más de bytes que el JPEG binario y puede requerir memoria adicional para las cadenas. `toDataURL` además trabaja de forma sincrónica. Para este ejemplo, enviar JSON permite seguir el mismo formato usado para otros pedidos a la API.

### La clave

La función `clave()` busca primero un valor guardado en `localStorage`. Si no lo encuentra, lo solicita con `prompt` y lo guarda para usarlo en llamadas posteriores. Para borrarlo desde la consola:

```js
localStorage.removeItem('openai_key')
```

Esto es una simplificación para aprender, no una forma de publicar una aplicación con una clave compartida: el código que se ejecuta en la página puede acceder a ella. En una aplicación real, la llamada con la clave se realiza desde un servidor.

### La respuesta

```js
const json = await respuesta.json()
return `data:image/png;base64,${json.data[0].b64_json}`
```

La aplicación espera que la respuesta contenga la imagen codificada en Base64 dentro de `data[0].b64_json`. Construye una **data URL**: una cadena que contiene tanto el tipo de imagen como sus datos.

```text
data:image/png;base64,iVBORw0KGgo...
```

Esa cadena puede usarse como `src` de un `<img>`. No hace falta guardar primero un archivo en el dispositivo para verla.

## 5. Mostrar los estados de la aplicación

Las operaciones de interfaz están separadas en funciones auxiliares. Así el recorrido principal puede llamar a `mostrarProcesando`, `mostrarResultado` y `terminarProcesamiento` sin repetir todos los cambios visuales.

La función básica para mostrar una imagen es:

```js
function mostrarImagen(direccion) {
  foto.src = direccion
  foto.hidden = false
  camara.hidden = true
}
```

La dirección contiene el JPEG de entrada o el PNG generado como data URL. En los dos casos se usa el mismo elemento `<img>`.

El recorrido visible es:

1. **Cámara:** se muestra el video y el punto verde indica que se conectó el flujo.
2. **Procesamiento:** se muestra la imagen de entrada, el punto parpadea en rojo y se desactivan los botones durante la espera.
3. **Resultado:** se muestra la imagen generada y se habilita la descarga.
4. **Otra foto:** el botón central vuelve a pedir la cámara.

Si el intento de procesamiento falla, esta versión no muestra un mensaje: termina la espera, mantiene visible la imagen de entrada y permite volver a intentar. La descarga queda deshabilitada.

## 6. Descargar la imagen generada

El tercer botón guarda el resultado cuando está listo. No solicita otra imagen al modelo ni necesita volver a comunicarse con él: usa la dirección que ya está en `foto.src`.

### Habilitar la descarga

El botón empieza deshabilitado:

```html
<button id="descargar" type="button" disabled>...</button>
```

Solo se habilita cuando `procesar` devuelve una imagen y se llama a `mostrarResultado`:

```js
function mostrarResultado(direccion) {
  mostrarImagen(direccion)
  descargar.disabled = false
}
```

Al volver a la cámara o comenzar otro procesamiento se deshabilita otra vez. De esa forma el botón corresponde al resultado generado y no a la imagen de entrada.

### Crear un enlace de descarga

```js
descargar.onclick = () => {
  const enlace = document.createElement('a')
  enlace.href = foto.src
  enlace.download = 'foto-carnet.png'
  enlace.click()
}
```

El programa crea un enlace `<a>` en memoria. Le asigna como `href` la data URL que contiene la imagen y usa `download` para proponer el nombre `foto-carnet.png`. Luego llama a `click()` para activar el enlace, como si la persona lo hubiera pulsado.

El navegador decide cómo completar la operación: puede descargar el archivo o presentarlo de otra manera según el dispositivo y su configuración. Crear este enlace no vuelve a enviar la foto al modelo.

## Cómo probar la página

En una computadora, desde la carpeta `apuntes` podés iniciar un servidor local:

```bash
pnpm dlx serve
```

Abrí la dirección local que indique el servidor y entrá a `35.camara-imagen.html`. En un celular, para acceder a la cámara necesitás abrir la página desde un contexto seguro, normalmente una dirección HTTPS.

Al abrirla, el navegador puede pedir permiso para la cámara. La primera vez que se envía una imagen, la página solicita la clave de API si todavía no está guardada. Cada generación realiza una llamada al servicio y puede tener costo.

Para probar los dos caminos:

1. Encuadrar una persona en la cámara y pulsar el botón central.
2. Esperar el resultado y usar el botón de descarga.
3. Elegir una imagen vertical desde el dispositivo y comprobar que se muestra completa mientras se procesa.
4. Comparar las dos fotos generadas con sus imágenes de entrada.

## Para seguir experimentando

- Probar una foto vertical y una horizontal: observar cómo la cámara recorta al cuadrado y cómo el archivo conserva toda su imagen.
- Cambiar una indicación del fondo o de la iluminación y comparar los resultados.
- Cambiar `quality` y observar la diferencia en la imagen y el tiempo de espera.
- Agregar mensajes para distinguir un permiso de cámara denegado, un archivo que no se pudo abrir y un pedido al modelo que falló. La versión actual falla silenciosamente.
- Comparar los detalles del rostro original con los de la imagen generada. Un retrato generado no debe confundirse con una fotografía original y puede no ser adecuado para trámites que exijan una foto real.
