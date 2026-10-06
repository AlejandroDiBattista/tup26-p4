# De una imagen a una agenda: clase práctica con IA

Vamos a construir progresivamente [solucion-tp3.html](solucion-tp3.html). Trabajamos en un HTML nuevo dentro de `clase`, junto a [alumnos.json](alumnos.json), usando un servidor local y un navegador actualizado. Antes de comenzar, preparamos tres capturas de la solución: una ficha, la página completa y el formulario abierto.

La dinámica es **pedir un cambio pequeño, explicar el resultado y probarlo**. Podemos iniciar la conversación con: «Actuá como docente. Ayudame paso a paso; explicá brevemente cada decisión y mostrá solamente el fragmento que necesito incorporar». Los ejemplos siguientes son parciales: conservamos lo anterior salvo que se indique reemplazarlo. Todo el CSS va en `<style>` y todo el JavaScript en el mismo módulo, con el montaje de la página al final.

## 1. Preparar la página

Vamos a separar los lugares donde escribiremos la estructura, la presentación y el comportamiento.

> **A la IA:** Creá un HTML mínimo en español, con CSS incrustado y un módulo JavaScript al final que importe ArrowJS desde un CDN.

```html
<!DOCTYPE html>
<html lang="es">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Agenda</title>
  <style>/* Aquí construiremos el CSS. */</style>
</head>
<body>
  <main id="app"></main>
  <script type="module">
    import { html, reactive, watch } from 'https://esm.sh/@arrow-js/core'
    const app = document.getElementById('app')
  </script>
</body>
</html>
```

Abrimos la página desde el servidor y comprobamos que la consola no muestre errores.

## 2. Escribir una ficha semántica

Vamos a representar un alumno con datos fijos. Adjuntamos la captura de la ficha y resolvemos primero el significado de su contenido.

> **A la IA:** Proponé solamente el markup semántico de esta ficha: apellido, nombre, contacto, comisión, legajo y botón favorito. Explicá las etiquetas elegidas.

Dentro de `<main>` escribimos:

```html
<article class="alumno">
  <button class="favorito" type="button">☆</button>
  <header><h2>Pérez</h2><p>Ana</p></header>
  <address><span>(381) 555-0100</span><span>@anaperez</span></address>
  <footer>C1 · 12345</footer>
</article>
```

`article` agrupa una ficha independiente; `header` presenta al alumno, `address` contiene su contacto y `footer` sus datos académicos. El apellido usa `h2`: reservamos `h1` para el título de la agenda.

## 3. Darle aspecto a la ficha

Vamos a reproducir la imagen usando el HTML anterior. Le damos a la IA la captura y nuestro markup.

> **A la IA:** Generá CSS nativo con reglas anidadas y selectores que sigan esta estructura. Usá `.alumno` como raíz; explicá espaciado, tipografía y posición de la estrella.

Incorporamos la base y las reglas de la ficha; este es el núcleo que discutimos:

```css
* { box-sizing: border-box; }
body { margin: 0; padding: 32px; font: 1rem/1.5 system-ui; background: #f6f7f5; color: #252a28; }
button, input { font: inherit; }
button { cursor: pointer; }
:focus-visible { outline: 2px solid #2d4034; outline-offset: 3px; }
.alumno {
  position: relative; display: flex; flex-direction: column;
  min-width: 0; min-height: 200px; padding: 20px;
  border: 1px solid #d9e0da; border-radius: 16px; background: #fffefa;
  & > header {
    display: flex; align-items: baseline; flex-wrap: wrap; gap: 6px; padding-right: 24px;
    & > h2 { margin: 0; font: 600 24px Georgia; color: #2d4034; }
    & > p { margin: 0; color: #627066; }
  }
  & > address { display: grid; gap: 7px; margin: auto 0 14px; font-style: normal; }
  & > footer { border-top: 1px solid #d9e0da; padding-top: 12px; font-size: 12px; }
  & > .favorito {
    position: absolute; top: 10px; right: 10px;
    border: 0; background: none; color: #8b7950; font-size: 22px;
    &:hover { background: #f6f7f5; }
  }
  & h2, & p, & span { overflow-wrap: anywhere; }
}
```

`&` representa el selector que contiene la regla; `>` selecciona sus hijos directos. Así, el estilo del encabezado de una ficha queda acotado a ella. Es [anidamiento CSS nativo](https://developer.mozilla.org/en-US/docs/Web/CSS/Guides/Nesting/Using).

Comparamos con la captura y pedimos ajustes puntuales hasta reconocer el diseño.

## 4. Construir el layout

Vamos a ubicar las fichas bajo una cabecera con título, búsqueda y botón. Adjuntamos la captura de la página completa.

> **A la IA:** Primero enseñame el markup semántico de este layout. Después agregá CSS estructural anidado: cabecera horizontal y grilla de tres columnas, adaptable a pantallas pequeñas.

Reorganizamos el contenido de `<main>` y movemos la ficha a la lista. La duplicamos seis veces para evaluar la grilla.

```html
<header class="cabecera">
  <h1>Agenda</h1>
  <div class="acciones">
    <input class="buscador" type="search" placeholder="Buscar alumno…">
    <button class="agregar" type="button">+ Agregar</button>
  </div>
</header>
<div id="lista-alumnos"><!-- Aquí van las fichas estáticas. --></div>
```

```css
main {
  max-width: 1104px; margin: auto;
  & > .cabecera {
    display: flex; justify-content: space-between; align-items: center;
    flex-wrap: wrap; gap: 16px; margin-bottom: 28px;
    & > h1 { margin: 0; }
    & > .acciones {
      display: flex; flex-wrap: wrap; gap: 10px;
      & > input, & > button { padding: 12px 18px; border: 1px solid #d9e0da; border-radius: 99px; }
      & > input { min-width: 0; max-width: 100%; }
      & > button { background: #2d4034; color: white; }
    }
  }
  & > #lista-alumnos {
    display: grid; grid-template-columns: repeat(3, minmax(0, 1fr)); gap: 12px;
    @media (max-width: 900px) { grid-template-columns: repeat(2, minmax(0, 1fr)); }
    @media (max-width: 600px) { grid-template-columns: 1fr; }
  }
}
```

Achicamos la ventana: deben verse tres, dos y una columna. Conservamos el nombre `.acciones` tanto en el HTML como en el CSS.

## 5. Leer los datos y generar las fichas

Vamos a reemplazar las copias manuales por una ficha por alumno. Al iniciar, preferimos los datos guardados; si no existen o no se pueden leer, usamos el JSON.

> **A la IA:** Cargá alumnos desde localStorage o desde `./alumnos.json`. Convertí la ficha en una función `Alumno(alumno)` y explicame cómo montarla con ArrowJS.

Agregamos al módulo:

```js
import alumnos from './alumnos.json' with { type: 'json' }
const claveAlumnos = 'tp3-alumnos'

function CargarAlumnos() {
  try {
    const guardados = JSON.parse(localStorage.getItem(claveAlumnos))
    return Array.isArray(guardados) ? guardados : alumnos
  } catch { return alumnos }
}
const estado = reactive({
  busqueda: '',
  alumnos: CargarAlumnos().map(alumno => reactive(alumno))
})
```

El JSON se importa como datos iniciales; `localStorage` tendrá prioridad incluso si contiene una lista vacía. La importación usa el atributo [`with { type: 'json' }`](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Statements/import/with).

Movemos la ficha a una plantilla, conservando su estructura y sustituyendo los textos:

```js
function Alumno(alumno) {
  return html`
    <article class="alumno">
      <button class="favorito" type="button">☆</button>
      <header><h2>${() => alumno.apellido}</h2><p>${() => alumno.nombre}</p></header>
      <address><span>${() => alumno.telefono}</span><span>@${() => alumno.github}</span></address>
      <footer>${() => alumno.comision} · ${() => alumno.legajo}</footer>
    </article>`
}
```

Dejamos vacío `<main id="app"></main>` y trasladamos **toda la cabecera del paso 4** al lugar indicado en esta plantilla, al final del módulo:

```js
html`
  <!-- Pegar aquí la cabecera completa del paso 4. -->
  <div id="lista-alumnos">
    ${() => estado.alumnos.map(alumno => Alumno(alumno).key(alumno.id))}
  </div>
`(app)
```

`html` crea la plantilla y `(app)` la monta. `.key(alumno.id)` identifica cada ficha; las expresiones `() => …` permiten actualizar sus datos. Véase la [API de ArrowJS](https://arrow-js.com/api/).

Recargamos: deben aparecer los alumnos del archivo.

## 6. Buscar mientras escribimos

Vamos a conectar el buscador con el estado. La lista visible será un resultado calculado a partir de los alumnos y del texto ingresado.

> **A la IA:** Agregá búsqueda en caliente con ArrowJS. Explicá `@input`, `.value` y cómo ignorar mayúsculas y tildes.

Reemplazamos el buscador dentro de la plantilla principal:

```html
<input class="buscador" type="search" placeholder="Buscar alumno…"
  .value="${() => estado.busqueda}"
  @input="${e => estado.busqueda = e.target.value}">
```

Definimos antes del montaje:

```js
const normalizar = texto => texto.normalize('NFD').replace(/[\u0300-\u036f]/g, '').toLowerCase()
const filtrados = () => {
  const busqueda = normalizar(estado.busqueda.trim())
  return estado.alumnos.filter(alumno =>
    normalizar(Object.values(alumno).join(' ')).includes(busqueda))
}
```

En `#lista-alumnos`, reemplazamos la expresión anterior por:

```js
${() => {
  const lista = filtrados()
  return lista.length
    ? lista.map(alumno => Alumno(alumno).key(alumno.id))
    : [html`<p>No se encontraron alumnos.</p>`.key('sin-resultados')]
}}
```

`@input` modifica el estado; `.value` mantiene el valor del campo sincronizado. La plantilla lee `filtrados()` dentro de una función y reacciona a esos cambios. Probamos un apellido, un legajo y una búsqueda sin resultados.

## 7. Marcar y desmarcar favoritos

Vamos a cambiar una propiedad del alumno desde su ficha y mostrar los favoritos primero.

> **A la IA:** Hacé reactiva la estrella y ordená por favorito, apellido y nombre. Conservá la búsqueda.

Reemplazamos el botón de `Alumno`:

```html
<button class="favorito" type="button"
  @click="${() => alumno.favorito = !alumno.favorito}">
  ${() => alumno.favorito ? '★' : '☆'}
</button>
```

Agregamos el comparador y encadenamos `.sort(CompararAlumnos)` después de `.filter(...)` en `filtrados`:

```js
function CompararAlumnos(a, b) {
  return Number(b.favorito) - Number(a.favorito)
    || a.apellido.localeCompare(b.apellido, 'es', { sensitivity: 'base' })
    || a.nombre.localeCompare(b.nombre, 'es', { sensitivity: 'base' })
}
```

`filter` entrega un arreglo nuevo que podemos ordenar. Marcamos y desmarcamos: cambian la estrella y la ubicación de la ficha.

## 8. Guardar automáticamente con `watch`

Vamos a conservar los cambios al recargar. Centralizamos el almacenamiento en un observador del estado.

> **A la IA:** Usá `watch` para guardar los alumnos automáticamente. Explicá por qué `JSON.stringify` debe ejecutarse dentro de la función observada.

Inmediatamente después de crear `estado`, agregamos:

```js
watch(() => JSON.stringify(estado.alumnos), datos => {
  try { localStorage.setItem(claveAlumnos, datos) }
  catch (error) { console.warn('No se pudieron guardar los alumnos.', error) }
})
```

Al serializar se leen también las propiedades de cada alumno: `watch` registra esas dependencias y vuelve a guardar cuando cambian. Este mismo observador cubrirá altas, ediciones y bajas. Su funcionamiento está documentado en [ArrowJS: `watch`](https://arrow-js.com/api/#watch).

Marcamos un favorito y recargamos: debe conservarse. El archivo JSON permanece como fuente inicial; los cambios se guardan en este navegador.

## 9. Diseñar el formulario y mostrarlo como diálogo

Vamos a construir primero el formulario estático. Adjuntamos la tercera captura y repetimos el recorrido: estructura semántica, luego presentación.

> **A la IA:** A partir de esta imagen, enseñame el markup de un formulario dentro de `dialog`. Después generá CSS estructural anidado, con campos en dos columnas y acciones al pie.

Agregamos el diálogo entre `main` y `script`:

```html
<dialog id="editor">
  <form>
    <header><h2 id="titulo-editor">Agregar alumno</h2><p>Completá los datos.</p></header>
    <div class="campos">
      <label>Apellido<input name="apellido" required></label>
      <label>Nombre  <input name="nombre"   required></label>
      <label>Legajo  <input name="legajo"   required></label>
      <label>Comisión<input name="comision" required></label>
      <label>Teléfono<input name="telefono" type="tel" required></label>
      <label>GitHub  <input name="github"   required></label>
    </div>
    <footer><button type="submit">Agregar</button><button type="button">Cancelar</button></footer>
  </form>
</dialog>
```

```css
dialog {
  width: min(620px, calc(100% - 24px)); max-height: calc(100dvh - 24px);
  padding: 0; border: 8px solid #d9e0da; border-radius: 24px; background: #fffefa;
  &::backdrop { background: #2d403480; }
  & > form {
    & > header, & > .campos, & > footer { padding: 16px; }
    & > header > h2 { margin: 0; }
    & > .campos {
      display: grid; grid-template-columns: repeat(2, minmax(0, 1fr)); gap: 12px;
      & > label { display: grid; gap: 5px; }
      & input { width: 100%; min-width: 0; padding: 9px; border: 1px solid #d9e0da; border-radius: 9px; }
      @media (max-width: 520px) { grid-template-columns: 1fr; }
    }
    & > footer { display: flex; justify-content: flex-end; gap: 8px; border-top: 1px solid #d9e0da; }
    & button { padding: 8px 14px; border: 1px solid #d9e0da; border-radius: 10px; }
    & button[type="submit"] { background: #2d4034; color: white; }
  }
}
```

En el módulo declaramos `const editor = document.getElementById('editor')`. Para revisar el aspecto, ejecutamos temporalmente `editor.showModal()` al final y cerramos con Escape. Luego retiramos esa llamada. `showModal()` abre un modal y `close()` lo cierra: [referencia de `dialog`](https://developer.mozilla.org/en-US/docs/Web/HTML/Reference/Elements/dialog).

## 10. Conectar «+ Agregar» y dar de alta

Vamos a conectar el formulario con los datos. El evento `submit` recogerá un borrador y avisará a la agenda mediante `onGuardar`, una función recibida como argumento.

> **A la IA:** Convertí el formulario en `Formulario({ onGuardar })`. Usá un borrador reactivo y notificá el alta al enviar; después cerrá el diálogo.

Dejamos vacío el contenido de `dialog` y trasladamos su formulario a esta función:

```js
function Formulario({ onGuardar }) {
  const borrador = reactive({ 
    apellido: '', nombre:   '', 
    legajo:   '', comision: '', 
    telefono: '', github:   '' 
  })
    
  const Campo = (nombre, etiqueta) => html`
    <label>${etiqueta}<input name="${nombre}" required
      type  ="${nombre === 'telefono' ? 'tel' : 'text'}"
      .value="${() => borrador[nombre]}"
      @input="${e => borrador[nombre] = e.target.value}"></label>`
  
  function alGuardar(e) {
    e.preventDefault()
    onGuardar({ ...borrador })
    alCerrar(e)
  }

  function alCerrar(e) { 
    e.currentTarget.closest('dialog').close() 
  }

  return html`
    <form @submit="${alGuardar}">
      <header><h2 id="titulo-editor">Agregar alumno</h2><p>Completá los datos.</p></header>
      <div class="campos">
        ${Campo('apellido', 'Apellido')} ${Campo('nombre', 'Nombre')}
        ${Campo('legajo', 'Legajo')} ${Campo('comision', 'Comisión')}
        ${Campo('telefono', 'Teléfono')} ${Campo('github', 'GitHub')}
      </div>
      <footer>
        <button type="submit">Agregar</button>
        <button type="button" @click="${alCerrar}">Cancelar</button>
      </footer>
    </form>`
}

function Agregar(datos) {
  const id = Math.max(0, ...estado.alumnos.map(alumno => alumno.id)) + 1
  estado.alumnos = [...estado.alumnos, reactive({ ...datos, id, favorito: false })]
  estado.busqueda = ''
}

function Editar() {
  editor.replaceChildren()
  Formulario({ onGuardar: Agregar })(editor)
  editor.showModal()
}
```

En la plantilla principal, agregamos al botón `+ Agregar` el atributo `@click="${() => Editar()}"`. Reservamos el nombre `Editar` para que esta función también abra alumnos existentes en el próximo paso.

`preventDefault()` evita navegar al enviar; `required` activa la validación del navegador. Agregamos un alumno y recargamos: la ficha aparece y `watch` conserva el alta. Cancelar debe cerrar sin agregar.

## 11. Reutilizar el formulario para editar

Vamos a abrir el mismo formulario desde una ficha. Editamos una copia para que Cancelar conserve los datos originales.

> **A la IA:** Adaptá el formulario para alta y edición. Recibí un alumno opcional, precargá un borrador y actualizá el original solamente al guardar.

Cambiamos la firma a `Formulario(alumno, { onGuardar })` y reemplazamos la inicialización del borrador por:

```js
const esNuevo  = !alumno
const borrador = reactive({
  id: alumno?.id,
  apellido: alumno?.apellido ?? '', nombre:   alumno?.nombre   ?? '',
  legajo:   alumno?.legajo   ?? '', comision: alumno?.comision ?? '',
  telefono: alumno?.telefono ?? '', github:   alumno?.github   ?? ''
})
```

En su plantilla, el título pasa a `${esNuevo ? 'Agregar' : 'Editar'} alumno`, la ayuda a `${esNuevo ? 'Completá' : 'Actualizá'} los datos.` y el botón de envío a `${esNuevo ? 'Agregar' : 'Guardar'}`. Conservamos `Campo`, `alGuardar` y `alCerrar`.

Agregamos `Guardar` y reemplazamos `Editar`:

```js
function Guardar({ id, ...datos }) {
  const alumno = estado.alumnos.find(alumno => alumno.id === id)
  if (alumno) Object.assign(alumno, datos)
  else Agregar(datos)
}

function Editar(alumno) {
  editor.replaceChildren()
  Formulario(alumno, { onGuardar: Guardar })(editor)
  editor.showModal()
}
```

Dentro de `Alumno`, antes de su `return`, incorporamos:

```js
function alEditar(e) {
  if (!e.target.closest('button')) Editar(alumno)
}

function alEditarConTeclado(e) {
  if (e.target === e.currentTarget && e.key === 'Enter') {
    e.preventDefault()
    Editar(alumno)
  }
}
```

Su etiqueta de apertura queda así:

```html
<article class="alumno" tabindex="0" @click="${alEditar}" @keydown="${alEditarConTeclado}">
```

El clic de la estrella también llega al artículo; por eso excluimos los botones al abrir la edición. Probamos editar, cancelar, guardar y abrir con Enter. El favorito debe conservarse al guardar.

## 12. Eliminar desde la edición

Vamos a incorporar la última operación: el formulario notificará qué alumno eliminar y la agenda actualizará su lista.

> **A la IA:** Mostrá Eliminar solamente al editar. Gestioná su clic mediante `onEliminar` y dejá que el `watch` existente persista el cambio.

Agregamos la operación y, dentro de `Editar`, reemplazamos la llamada al formulario:

```js
function Eliminar({ id }) {
  estado.alumnos = estado.alumnos.filter(alumno => alumno.id !== id)
}
// Dentro de Editar:
Formulario(alumno, { onGuardar: Guardar, onEliminar: Eliminar })(editor)
```

La firma pasa a `Formulario(alumno, { onGuardar, onEliminar })`. Dentro agregamos:

```js
function alEliminar(e) {
  onEliminar({ id: alumno.id })
  alCerrar(e)
}
```

Al comienzo del `footer` del formulario insertamos:

```js
${!esNuevo && html`<button class="eliminar" type="button" @click="${alEliminar}">Eliminar</button>`}
```

Dentro de la regla `& > footer` de `dialog > form`, agregamos `& > .eliminar { margin-right: auto; color: #b42318; }`.

Eliminamos el alumno de prueba y recargamos. Recorremos la aplicación completa: buscar, marcar favorito, agregar, editar, cancelar y eliminar. Cada acción modifica el estado; las plantillas actualizan la pantalla y `watch` guarda los datos.
