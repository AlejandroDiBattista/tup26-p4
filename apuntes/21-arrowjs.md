# Arrow.js: del contador al inventario

**Una interfaz reactiva refleja el estado de la aplicación: los eventos cambian los datos y Arrow.js actualiza el HTML que depende de ellos.**

Vamos a construir un inventario para contar objetos de un local. Cada producto tendrá nombre, cantidad y botones para sumar o restar. Después incorporaremos búsqueda mientras escribimos, un formulario de alta y eliminación.

| Paso | Resultado                     | Concepto                          |
| ---- | ----------------------------- | --------------------------------- |
| 1    | Una tarjeta que cuenta        | Estado, plantilla y eventos       |
| 2    | Una tarjeta reutilizable      | Componentes                       |
| 3    | Tres productos independientes | Arrays, `map` e identidad         |
| 4    | Búsqueda en caliente          | Binding y `filter`                |
| 5    | Alta desde un diálogo         | Formularios y estado del borrador |
| 6    | Eliminación de productos      | Actualización de la colección     |

Trabajaremos siempre sobre **un único archivo `inventario.html`**, con el CSS y el JavaScript de la aplicación incrustados. La única dependencia externa es **Arrow.js 1.0.6**, cargada desde un CDN: hace falta conexión. Los datos viven en memoria; al recargar la página se recuperan los valores iniciales.

## 1. Un contador reactivo

Necesitamos mostrar una cantidad y modificarla al tocar dos botones.

Creá `inventario.html`, copiá este código y abrilo en el navegador:

```html
<!doctype html>
<html lang="es">
<meta charset="utf-8">
<meta name="viewport" content="width=device-width, initial-scale=1">
<title>Inventario con Arrow.js</title>
<style>
* { box-sizing: border-box; }
body { max-width: 520px; margin: 24px auto; padding: 0 12px; font: 16px system-ui; background: #f4f6f8; color: #243042; }
button, input { font: inherit; min-height: 44px; border-radius: 8px; }
button { min-width: 44px; border: 0; background: #e4eaf2; color: inherit; cursor: pointer; touch-action: manipulation; flex-shrink: 0; }
button:disabled { opacity: .4; cursor: default; }
.tarjeta { display: flex; align-items: center; gap: 8px; margin: 10px 0; padding: 12px; border-radius: 12px; background: white; }
.tarjeta strong { flex: 1; min-width: 0; overflow-wrap: anywhere; }
output { min-width: 2ch; text-align: center; font-variant-numeric: tabular-nums; }
</style>
<body>
  <h1>Inventario</h1>
  <main id="app"></main>

<script type="module">
import { reactive, html } from 'https://cdn.jsdelivr.net/npm/@arrow-js/core@1.0.6/dist/index.mjs';

const producto = reactive({ nombre: 'Tornillos', cantidad: 3 });

html`
<article class="tarjeta">
  <strong>${() => producto.nombre}</strong>
  <output>${() => producto.cantidad}</output>
  <button disabled="${() => producto.cantidad === 0}"
    @click="${() => producto.cantidad--}">−</button>
  <button @click="${() => producto.cantidad++}">+</button>
</article>
`(document.getElementById('app'));
</script>
</body>
</html>
```

Si tu entorno no permite abrir módulos desde un archivo local, serví la carpeta con Live Server o un servidor HTTP local.

**El estado** está en `producto`. `reactive` permite observar sus cambios. Aunque usamos `const`, las propiedades del objeto se pueden modificar: lo que no podemos hacer es reasignar la variable `producto`.

**La plantilla** describe los elementos de la tarjeta. La sintaxis `html` seguida de comillas invertidas es una *plantilla etiquetada* de JavaScript: `html` recibe las partes del texto y las expresiones `${...}`. En Arrow, el resultado es una plantilla que podemos montar en un elemento. [Plantillas etiquetadas en MDN](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Template_literals#tagged_templates).

La llamada del final la monta dentro de `<main id="app">`:

```js
(document.getElementById('app'));
```

Esa línea continúa la expresión `html` anterior; no se ejecuta por separado.

**La lectura reactiva** aparece dentro de una función:

```js
${() => producto.cantidad}
```

Arrow registra la lectura de `producto.cantidad` y actualiza esa parte de la plantilla cuando cambia. En cambio, `${producto.cantidad}` entrega el valor leído en ese momento, sin establecer esa lectura reactiva. [Plantillas de Arrow.js](https://arrow-js.com/#templates).

**El evento** cambia el dato:

```html
@click="${() => producto.cantidad++}"
```

`@click` conecta el botón con una función. La función se ejecuta al hacer clic o tocarlo. El número se actualiza como consecuencia del cambio en el estado.

El atributo `disabled` también depende del estado: cuando la cantidad llega a cero, el botón de restar queda deshabilitado.

## 2. Convertir la tarjeta en un componente

Necesitamos reutilizar la tarjeta con distintos productos. Encapsulamos su plantilla en `Contador`, que recibe un producto.

Conservá el HTML y el CSS. **Reemplazá todo el contenido de `<script type="module">`** por lo siguiente:

```js
import { reactive, html, component } from 'https://cdn.jsdelivr.net/npm/@arrow-js/core@1.0.6/dist/index.mjs';

const producto = reactive({ nombre: 'Tornillos', cantidad: 3 });

const Contador = component(producto => html`
<article class="tarjeta">
  <strong>${() => producto.nombre}</strong>
  <output>${() => producto.cantidad}</output>
  <button
    disabled="${() => producto.cantidad === 0}"
    @click="${() => producto.cantidad--}">−</button>
  <button
    @click="${() => producto.cantidad++}">+</button>
</article>
`);

html`${Contador(producto)}`(document.getElementById('app'));
```

`component` convierte la función en un componente de Arrow. La función recibe sus datos y devuelve una plantilla; `Contador(producto)` se incorpora dentro de otra plantilla. [Componentes de Arrow.js](https://arrow-js.com/api/#component).

En este ejemplo, el estado vive fuera del componente. La tarjeta recibe ese producto y sus botones modifican su cantidad. No crea una copia ni vuelve a poner el contador en cero.

## 3. Una lista de contadores

Ahora necesitamos contar varios tipos de objetos.

Conservá el `import` y el componente `Contador`. **Reemplazá la declaración de `producto`** por este estado:

```js
const estado = reactive({
  productos: [
    { id: 1, nombre: 'Tornillos', cantidad: 3 },
    { id: 2, nombre: 'Tuercas',   cantidad: 8 },
    { id: 3, nombre: 'Arandelas', cantidad: 0 }
  ]
});
```

**Reemplazá el montaje del final del script** por este:

```js
html`
  <section>
    ${() => estado.productos.map(p => Contador(p).key(p.id))}
  </section>
`(document.getElementById('app'));
```

`map` recorre el array y produce un componente por producto. Por ejemplo, el objeto de Tornillos se transforma en `Contador(p)`; el de Tuercas, en otro contador.

La función exterior, `${() => ...}`, permite actualizar la lista cuando cambie la colección. Los objetos anidados del estado también son reactivos: cada tarjeta puede observar la cantidad de su producto.

`key(p.id)` identifica a cada producto durante las actualizaciones de la lista. Usamos un identificador estable; su posición puede cambiar cuando filtremos o eliminemos elementos.

## 4. Búsqueda en caliente

Con muchos productos necesitamos encontrar uno mientras escribimos. El texto buscado será otra propiedad del estado.

**Agregá `busqueda: '',` como primera propiedad del objeto que pasás a `reactive`.** El estado completo queda así:

```js
const estado = reactive({
  busqueda: '',
  productos: [
    { id: 1, nombre: 'Tornillos', cantidad: 3 },
    { id: 2, nombre: 'Tuercas',   cantidad: 8 },
    { id: 3, nombre: 'Arandelas', cantidad: 0 }
  ]
});
```

**Después de `Contador`, agregá esta función:**

```js
function visibles() {
  const texto = estado.busqueda.trim().toLowerCase();
  return estado.productos.filter(p => p.nombre.toLowerCase().includes(texto));
}
```

`filter` obtiene los productos cuyo nombre contiene el texto buscado. `trim` quita espacios de los extremos y `toLowerCase` permite buscar sin distinguir mayúsculas. La búsqueda sigue distinguiendo las tildes.

**Reemplazá el montaje final por este:**

```js
html`
<input type="search"
  placeholder="Buscar productos"
  .value="${() => estado.busqueda}"
  @input="${e => estado.busqueda = e.target.value}">
<section>
  ${() => visibles().map(p => Contador(p).key(p.id))}
</section>
<p role="status">${() => visibles().length ? '' : 'No hay productos para mostrar.'}</p>
`(document.getElementById('app'));
```

**Agregá estas reglas al final de `<style>`:**

```css
input { width: 100%; min-width: 0; padding: 10px; border: 1px solid #b8c2ce; }
.barra { display: flex; gap: 8px; }
```

El campo tiene dos conexiones explícitas:

| Conexión                                            | Dirección      | Efecto                                             |
| --------------------------------------------------- | -------------- | -------------------------------------------------- |
| `.value="${() => estado.busqueda}"`                 | Estado → campo | El campo refleja el texto del estado.              |
| `@input="${e => estado.busqueda = e.target.value}"` | Campo → estado | Cada edición del campo actualiza el texto buscado. |

El punto de `.value` indica una vinculación con la **propiedad** del elemento. Usamos esa propiedad para sincronizar el valor actual del campo, incluso después de que el usuario lo haya editado. Las conexiones de propiedades y eventos están documentadas en la [API de Arrow.js](https://arrow-js.com/api/#html).

La lista llama a `visibles()` dentro de una expresión reactiva. Durante esa llamada se leen la búsqueda y los productos; sus cambios actualizan el resultado mostrado.

Filtrar no elimina productos de `estado.productos`. La lista filtrada contiene referencias a los mismos objetos: sus cantidades se conservan cuando una tarjeta desaparece y vuelve a mostrarse.

## 5. Agregar productos desde un diálogo

Necesitamos ingresar un nombre y una cantidad inicial sin abandonar la lista. El botón **Nuevo**, junto al buscador, abrirá un formulario.

Vamos a encapsular los campos y sus acciones en el componente `Formulario`. Su estado `borrador` será local: escribir no modifica el inventario. Al confirmar, el componente entrega los datos mediante la función `onAgregar`.

**Después de `estado`, agregá:**

```js
let siguienteId = 4;
```

Los identificadores 1, 2 y 3 ya pertenecen a los productos iniciales. `siguienteId` asignará los siguientes sin reutilizar los de productos eliminados durante esta sesión.

**Antes del montaje de la aplicación, definí el componente:**

```js
const Formulario = component(acciones => {
  const borrador = reactive({ nombre: '', cantidad: '0' });

  function guardar(evento) {
    evento.preventDefault();
    const nombre = borrador.nombre.trim();
    if (!nombre) return;

    acciones.onAgregar({ nombre, cantidad: Number(borrador.cantidad) });
    cerrar(evento);
  }

  function cerrar(evento) {
    evento.currentTarget.closest('dialog').close();
  }

  return html`
  <form @submit="${guardar}">
    <h2 id="titulo-alta">Nuevo producto</h2>
    <label>Nombre
      <input required autofocus
        .value="${() => borrador.nombre}"
        @input="${e => borrador.nombre = e.target.value}">
    </label>
    <label>Cantidad inicial
      <input type="number" min="0" step="1" required inputmode="numeric"
        .value="${() => borrador.cantidad}"
        @input="${e => borrador.cantidad = e.target.value}">
    </label>
    <div class="barra">
      <button type="button" @click="${cerrar}">Cancelar</button>
      <button class="primario" type="submit"
        disabled="${() => !borrador.nombre.trim()}">Agregar</button>
    </div>
  </form>
  `;
});
```

`Formulario` recibe un objeto `acciones` con la función `onAgregar`. `guardar` prepara los datos y llama a esa función; `cerrar` encuentra el diálogo que contiene al formulario y lo cierra. Cancelar solo cierra, sin enviar datos. El componente no accede a `estado.productos` ni asigna identificadores.

**Después del componente, agregá estas funciones de la aplicación:**

```js
function abrir() {
  dialogo.replaceChildren();
  html`${Formulario({ onAgregar: agregar })}`(dialogo);
  dialogo.showModal();
}

function agregar(datos) {
  estado.productos.push({ id: siguienteId++, ...datos });
  estado.busqueda = '';
}
```

`abrir` vacía el diálogo y monta una nueva instancia de `Formulario`, con nombre vacío y cantidad cero. Le pasa `agregar` como `onAgregar` y luego abre el diálogo. `agregar` recibe los datos, asigna el identificador, incorpora el producto con `push` y vacía la búsqueda. El componente se encarga de cerrar el diálogo.

Los valores leídos mediante `e.target.value` son texto. Por eso el borrador empieza con `'0'` y `Number` convierte la cantidad antes de guardarla.

**Reemplazá el montaje final por este bloque completo, incluida la declaración de `dialogo` del final:**

```js
html`
<div class="barra">
  <input type="search"
    placeholder="Buscar productos"
    .value="${() => estado.busqueda}"
    @input="${e  => estado.busqueda = e.target.value}">
  <button class="primario" @click="${abrir}">Nuevo</button>
</div>
<section>
  ${() => visibles().map(p => Contador(p).key(p.id))}
</section>
<p role="status">${() => visibles().length ? '' : 'No hay productos para mostrar.'}</p>
<dialog></dialog>
`(document.getElementById('app'));

const dialogo = document.querySelector('dialog');
```

`dialogo` se busca después del montaje, cuando el elemento ya existe. Los eventos que usan esa variable se ejecutan más tarde, al interactuar con la aplicación.

`showModal()` abre el diálogo sobre la página y bloquea la interacción con el fondo. `close()` lo cierra; el navegador también admite Escape. `autofocus` señala el campo inicial. [El elemento `dialog` en MDN](https://developer.mozilla.org/en-US/docs/Web/HTML/Reference/Elements/dialog).

El formulario usa el mismo binding que el buscador. `.value` muestra el borrador local y `@input` lo actualiza. Como el borrador se crea dentro de `component`, cada nueva instancia tiene su propio estado.

La cantidad es obligatoria, entera y no negativa mediante `required`, `step="1"` y `min="0"`. Al intentar enviar el formulario, el navegador comprueba esas restricciones. El botón Agregar permanece deshabilitado si el nombre está vacío o solo tiene espacios.

**Agregá estas reglas al CSS:**

```css
.primario { background: #245ac2; color: white; padding: 0 14px; }
dialog { width: min(92vw, 380px); border: 0; border-radius: 14px; padding: 20px; }
dialog::backdrop { background: #0006; }
label { display: grid; gap: 6px; margin: 12px 0; }
```

## 6. Eliminar un producto

Nos falta quitar los productos que cargamos por error. Cada tarjeta tendrá una `×` al comienzo.

**Antes del montaje, agregá esta función:**

```js
function eliminar(id) {
  estado.productos = estado.productos.filter(p => p.id !== id);
}
```

`filter` produce un array con todos los productos excepto el que tiene ese identificador. Al asignarlo a `estado.productos`, la lista se actualiza.

**Dentro de la plantilla de `Contador`, inmediatamente después de `<article class="tarjeta">`, agregá:**

```html
  <button class="eliminar"
    @click="${() => eliminar(producto.id)}">×</button>
```

**Agregá esta regla al CSS:**

```css
.eliminar { background: #fde9e7; color: #9a2823; }
```

El botón envía el identificador del producto. Dos productos pueden tener el mismo nombre y seguir siendo elementos diferentes.

## Código final completo

Este es el contenido final de `inventario.html`:

```html
<!doctype html>
<html lang="es">
<meta charset="utf-8">
<meta name="viewport" content="width=device-width, initial-scale=1">
<title>Inventario con Arrow.js</title>
<style>
* { box-sizing: border-box; }
body { max-width: 520px; margin: 24px auto; padding: 0 12px; font: 16px system-ui; background: #f4f6f8; color: #243042; }
button, input { font: inherit; min-height: 44px; border-radius: 8px; }
button { min-width: 44px; border: 0; background: #e4eaf2; color: inherit; cursor: pointer; touch-action: manipulation; flex-shrink: 0; }
button:disabled { opacity: .4; cursor: default; }
.tarjeta { display: flex; align-items: center; gap: 8px; margin: 10px 0; padding: 12px; border-radius: 12px; background: white; }
.tarjeta strong { flex: 1; min-width: 0; overflow-wrap: anywhere; }
output { min-width: 2ch; text-align: center; font-variant-numeric: tabular-nums; }
input { width: 100%; min-width: 0; padding: 10px; border: 1px solid #b8c2ce; }
.barra { display: flex; gap: 8px; }
.primario { background: #245ac2; color: white; padding: 0 14px; }
dialog { width: min(92vw, 380px); border: 0; border-radius: 14px; padding: 20px; }
dialog::backdrop { background: #0006; }
label { display: grid; gap: 6px; margin: 12px 0; }
.eliminar { background: #fde9e7; color: #9a2823; }
</style>
<body>
  <h1>Inventario</h1>
  <main id="app"></main>

<script type="module">
import { reactive, html, component } from 'https://cdn.jsdelivr.net/npm/@arrow-js/core@1.0.6/dist/index.mjs';

const estado = reactive({
  busqueda: '',
  productos: [
    { id: 1, nombre: 'Tornillos', cantidad: 3 },
    { id: 2, nombre: 'Tuercas',   cantidad: 8 },
    { id: 3, nombre: 'Arandelas', cantidad: 0 }
  ]
});

let siguienteId = 4;

const Contador = component(producto => html`
<article class="tarjeta">
  <button class="eliminar"
    @click="${() => eliminar(producto.id)}">×</button>
  <strong>${() => producto.nombre}</strong>
  <output>${() => producto.cantidad}</output>
  <button disabled="${() => producto.cantidad === 0}"
    @click="${() => producto.cantidad--}">−</button>
  <button
    @click="${() => producto.cantidad++}">+</button>
</article>
`);

const Formulario = component(acciones => {
  const borrador = reactive({ nombre: '', cantidad: '0' });

  function guardar(evento) {
    evento.preventDefault();
    const nombre = borrador.nombre.trim();
    if (!nombre) return;

    acciones.onAgregar({ nombre, cantidad: Number(borrador.cantidad) });
    cerrar(evento);
  }

  function cerrar(evento) {
    evento.currentTarget.closest('dialog').close();
  }

  return html`
  <form @submit="${guardar}">
    <h2 id="titulo-alta">Nuevo producto</h2>
    <label>Nombre
      <input required autofocus
        .value="${() => borrador.nombre}"
        @input="${e  => borrador.nombre = e.target.value}">
    </label>
    <label>Cantidad inicial
      <input type="number" min="0" step="1" required inputmode="numeric"
        .value="${() => borrador.cantidad}"
        @input="${e  => borrador.cantidad = e.target.value}">
    </label>
    <div class="barra">
      <button type="button" @click="${cerrar}">Cancelar</button>
      <button class="primario" type="submit"
        disabled="${() => !borrador.nombre.trim()}">Agregar</button>
    </div>
  </form>
  `;
});

function visibles() {
  const texto = estado.busqueda.trim().toLowerCase();
  return estado.productos.filter(p => p.nombre.toLowerCase().includes(texto));
}

function abrir() {
  dialogo.replaceChildren();
  html`${Formulario({ onAgregar: agregar })}`(dialogo);
  dialogo.showModal();
}

function agregar(datos) {
  estado.productos.push({ id: siguienteId++, ...datos });
  estado.busqueda = '';
}

function eliminar(id) {
  estado.productos = estado.productos.filter(p => p.id !== id);
}

html`
<div class="barra">
  <input type="search"
    placeholder="Buscar productos"
    .value="${() => estado.busqueda}"
    @input="${e  => estado.busqueda = e.target.value}">
  <button class="primario" @click="${abrir}">Nuevo</button>
</div>
<section>
  ${() => visibles().map(p => Contador(p).key(p.id))}
</section>
<p role="status">${() => visibles().length ? '' : 'No hay productos para mostrar.'}</p>
<dialog></dialog>
`(document.getElementById('app'));

const dialogo = document.querySelector('dialog');
</script>
</body>
</html>
```

## Patrones para reutilizar

| Necesidad                               | Patrón del inventario                       |
| --------------------------------------- | ------------------------------------------- |
| Guardar datos que modifican la pantalla | `reactive({ ... })`                         |
| Mostrar un dato que cambia              | `${() => producto.cantidad}`                |
| Responder a un evento                   | `@click="${funcion}"`                       |
| Vincular un campo con el estado         | `.value` y `@input`                         |
| Reutilizar una parte de la interfaz     | `component(funcionQueDevuelveUnaPlantilla)` |
| Encapsular una edición pendiente        | `borrador` local dentro de `Formulario`     |
| Comunicar datos a la aplicación         | `acciones.onAgregar(datos)`                 |
| Mostrar una colección                   | `map(p => Contador(p).key(p.id))`           |
| Obtener una vista filtrada              | `filter` dentro de una lectura reactiva     |
| Agregar un elemento                     | `estado.productos.push(nuevoProducto)`      |
| Quitar un elemento                      | Reasignar el array con `filter`             |
