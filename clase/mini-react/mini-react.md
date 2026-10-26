# Mini React: del JSX a la pantalla

En este tutorial armamos, en una sola página HTML, las tres piezas que hacen funcionar una aplicación React:

- un traductor que convierte JSX en JavaScript
- un mini React con `h`, `render`, `useState` y `useEffect`
- una aplicación escrita con JSX que usa las dos piezas anteriores

Cada pieza es corta: el traductor tiene unas 50 líneas y el mini React, unas 80. La idea no es reemplazar a React. La idea es ver que no hay magia: el JSX es una llamada a función y los hooks son casilleros en un arreglo.

## La aplicación de ejemplo

Una persona está parada en una esquina y cuenta los vehículos que pasan. Tiene un botón para las motos y otro para los autos. Cada toque suma uno.

Debajo de los botones, la aplicación muestra 3 datos:

- vehículos: la cantidad total contada
- tiempo: los minutos y segundos desde que se abrió la página
- flujo: los vehículos por hora, calculados con el total y el tiempo

Si en 2 segundos pasaron 3 vehículos, el flujo es 3 × 3600 / 2 = 5400 v/h.

## Cómo está armada la página

La página tiene un `<div>` vacío y tres scripts, en este orden:

```html
<div id="raiz"></div>

<!-- 1. El traductor de JSX (podría ir como <script src="mini-babel.js">) -->
<script> ... </script>

<!-- 2. Mini React: h, render, useState y useEffect (podría ir como <script src="mini-react.js">) -->
<script> ... </script>

<!-- 3. La aplicación, escrita con JSX -->
<script type="text/jsx"> ... </script>
```

El navegador ejecuta los dos primeros scripts apenas los lee. El tercero no lo ejecuta, porque no conoce el tipo `text/jsx`: lo deja en la página como texto. Cuando termina de cargar la página, el traductor busca ese texto, lo convierte en JavaScript y lo ejecuta.

Es el mismo mecanismo que usa Babel cuando se incluye en una página con `<script type="text/babel">`.

# Parte 1. El traductor de JSX

## El JSX es una llamada a función

El navegador no entiende JSX. Antes de ejecutarlo, alguien tiene que traducirlo a JavaScript común. Este componente de la aplicación:

```js
function Dato({ etiqueta, valor }) {
  return <p class="dato"><span>{etiqueta}</span><span class="valor">{valor}</span></p>
}
```

queda así después de pasar por el traductor:

```js
function Dato({ etiqueta, valor }) {
  return h("p", { class: "dato" }, h("span", null, etiqueta, ), h("span", { class: "valor" }, valor, ), )
}
```

Cada etiqueta se convierte en una llamada a `h` con 3 partes:

1. El tipo: un texto como `"p"` para una etiqueta HTML, o la función misma para un componente.
2. Las props: un objeto con los atributos, o `null` si no hay ninguno.
3. Los hijos: todo lo que va entre la etiqueta de apertura y la de cierre, separado por comas.

La coma que queda antes de cada `)` es válida en JavaScript desde 2017. El traductor la deja porque sacarla complicaría el código.

## Una expresión regular corta el código en pedazos

El traductor no analiza el código como un compilador. Supone que el JSX está bien escrito y hace una traducción directa, como un buscar y reemplazar.

Una sola expresión regular reconoce 6 tipos de pedazos:

```js
const TOKEN    = /<(\w+)((?:\s+\w+=(?:"[^"]*"|\{[^}]*\}))*)\s*(\/?)>|<\/\w+\s*>|\{|\}|[^<{}]+|</g
const ATRIBUTO = /(\w+)=(?:("[^"]*")|\{([^}]*)\})/g
const TEXTO    = /^(\s*\n\s*)?([\s\S]*?)(\s*\n\s*)?$/
```

Las alternativas de `TOKEN`, separadas por `|`, son:

| Alternativa | Reconoce | Ejemplo |
|---|---|---|
| `<(\w+)(...)\s*(\/?)>` | una etiqueta de apertura, con o sin `/` final | `<p class="dato">`, `<Contador icono="🛵" />` |
| `<\/\w+\s*>` | una etiqueta de cierre | `</p>` |
| `\{` | una llave que abre | `{` |
| `\}` | una llave que cierra | `}` |
| `[^<{}]+` | cualquier texto sin `<` ni llaves | `Mini React`, `const minutos = ` |
| `<` | un `<` suelto, como en una comparación | `a < b` |

La primera alternativa guarda 3 grupos: el nombre de la etiqueta, los atributos y la barra de autocierre. `ATRIBUTO` separa después cada atributo en nombre y valor. `TEXTO` se usa para separar la indentación del texto real.

## Una pila recuerda dónde estamos

El mismo `{` significa cosas distintas según dónde aparece:

- dentro de una etiqueta JSX, abre una expresión hija, como en `<strong>{n}</strong>`
- en el código común, es una llave de JavaScript, como en `function App() {`

Para distinguirlos, el traductor lleva una pila. Cada vez que se abre algo, apila qué es:

- `'jsx'` cuando se abre una etiqueta
- `'expr'` cuando se abre una expresión dentro de una etiqueta
- `'llave'` cuando se abre una llave común

Cada vez que algo se cierra, desapila. Lo que esté arriba de la pila dice dónde estamos.

```js
function transformar(codigo, h = 'h') {
  const pila  = []                                 // 'jsx' | 'expr' | 'llave'
  const enJSX = () => pila.at(-1) === 'jsx'
  const coma  = () => enJSX() ? ', ' : ''          // un hijo se separa con coma
```

`coma()` resuelve la separación entre hijos. Si un elemento termina dentro de otra etiqueta, es un hijo y lleva una coma después. Si termina en el código común, como el `<App />` de `render`, no lleva coma.

`String.replace` recorre todos los pedazos y, para cada uno, usa lo que devuelva la función:

```js
  const salida = codigo.replace(TOKEN, (token, tag, atributos, autocierre) => {
```

## Qué hace con cada pedazo

Una etiqueta de apertura se convierte en el comienzo de una llamada a `h`:

```js
    // <tag ...>  o  <tag ... />
    if (tag) {
      const tipo  = /^[A-Z]/.test(tag) ? tag : `"${tag}"`   // componente o etiqueta HTML
      const lista = [...atributos.matchAll(ATRIBUTO)].map(([, nombre, texto, expr]) => `${nombre}: ${texto ?? expr}`)
      const props = lista.length ? `{ ${lista.join(', ')} }` : 'null'

      if (autocierre) return `${h}(${tipo}, ${props})${coma()}`
      pila.push('jsx')
      return `${h}(${tipo}, ${props}, `
    }
```

Si el nombre empieza con mayúscula, es un componente y se pasa sin comillas: `<Contador>` se convierte en `h(Contador, ...)`, con la función. Si empieza con minúscula, es una etiqueta HTML y se pasa como texto: `<p>` se convierte en `h("p", ...)`. React sigue la misma regla.

Cada atributo se convierte en una propiedad del objeto:

- `class="dato"` queda `class: "dato"`
- `onClick={() => ...}` queda `onClick: () => ...`

Una etiqueta con autocierre, como `<Dato ... />`, se cierra en el momento. Una etiqueta abierta apila `'jsx'` y deja la llamada abierta, esperando a sus hijos.

Una etiqueta de cierre cierra la llamada:

```js
    // </tag>
    if (token.startsWith('</')) {
      pila.pop()
      return `)${coma()}`
    }
```

Las llaves usan la pila para saber qué son:

```js
    // { : dentro de JSX abre una expresión hija; afuera es una llave común
    if (token === '{') {
      if (enJSX()) { pila.push('expr'); return '' }
      pila.push('llave')
      return '{'
    }

    // } : cierra lo último que se abrió
    if (token === '}') {
      return pila.pop() === 'expr' ? ', ' : '}'
    }
```

Dentro de una etiqueta, `{n}` se convierte en `n, `. Las llaves desaparecen y la expresión queda como un hijo más. Afuera, las llaves quedan como estaban.

El texto dentro de una etiqueta se convierte en un string:

```js
    // Texto dentro de JSX: se convierte en string. Los saltos de línea
    // del principio y del final son solo indentación: se dejan afuera.
    if (enJSX()) {
      const [, antes = '', texto, despues = ''] = token.match(TEXTO)
      if (texto === '') return token
      return `${antes}${JSON.stringify(texto.replace(/\s*\n\s*/g, ' '))}, ${despues}`
    }
```

`TEXTO` separa el pedazo en 3 partes. Los saltos de línea y espacios del principio y del final son indentación: quedan afuera del string, así el código traducido conserva la forma del original. Si no queda texto, el pedazo era solo indentación y se devuelve tal cual. `JSON.stringify` agrega las comillas y escapa los caracteres especiales.

Todo lo demás es JavaScript común y queda igual:

```js
    // Código JavaScript común: queda igual
    return token
  })

  return salida
}
```

## Un ejemplo pedazo por pedazo

Así se traduce `<p class="dato"><span>{etiqueta}</span></p>`:

| Pedazo | Pila después | Se escribe |
|---|---|---|
| `<p class="dato">` | jsx | `h("p", { class: "dato" }, ` |
| `<span>` | jsx, jsx | `h("span", null, ` |
| `{` | jsx, jsx, expr | nada |
| `etiqueta` | jsx, jsx, expr | `etiqueta` |
| `}` | jsx, jsx | `, ` |
| `</span>` | jsx | `), ` |
| `</p>` | vacía | `)` |

Resultado: `h("p", { class: "dato" }, h("span", null, etiqueta, ), )`.

El texto `etiqueta` no se convierte en string porque, cuando aparece, arriba de la pila hay `'expr'` y no `'jsx'`.

## Las restricciones

El traductor es corto porque acepta una versión reducida de JSX:

- los atributos siempre llevan valor: `nombre="texto"` o `nombre={expresión}`
- las expresiones de los atributos no llevan llaves, así que `style={{ color: "red" }}` no funciona
- los nombres son simples: `<div>` o `<Dato>`, pero no `<a.b>`, `aria-label` ni los fragmentos `<> </>`
- las comparaciones llevan espacios: `a < b` funciona, pero `a<b>` se confunde con una etiqueta
- dentro del JSX no puede haber llaves ni `<` en strings ni en comentarios

Dentro de esos límites, el JSX anidado funciona en cualquier lugar, también dentro de una expresión como `{lista.map(x => <li>{x}</li>)}`.

## Cómo se ejecuta en la página

Al final del primer script, el traductor espera a que la página termine de cargar y procesa los scripts de tipo `text/jsx`:

```js
// ---------------------------------------------------------------------------
// En el navegador: traduce y ejecuta los <script type="text/jsx"> de la página,
// reemplazándolos por <script> normales.
document.addEventListener('DOMContentLoaded', () => {
  for (const original of document.querySelectorAll('script[type="text/jsx"]')) {
    const traducido = document.createElement('script')
    traducido.textContent = transformar(original.textContent)
    original.replaceWith(traducido)          // al insertarlo, el navegador lo ejecuta
  }
})
```

Para cada uno, crea un `<script>` nuevo con el código traducido y lo pone en su lugar. El navegador ejecuta un script en cuanto se inserta en la página.

# Parte 2. El mini React, nivel por nivel

El segundo script empieza con las reglas del juego:

```js
// mini-react.js
// Una versión mínima de React: h, render, useState y useEffect.
//
// Simplificaciones:
//  - Cada cambio de estado redibuja toda la app desde cero.
//  - Los hooks de toda la app viven en una sola lista, en el orden en que se
//    llaman. Por eso el árbol no puede cambiar de forma: nada de componentes
//    que aparecen o desaparecen, y nada de hooks dentro de un if.
//  - Una sola raíz por página.
```

## Nivel 1. h describe la interfaz

El traductor convierte cada etiqueta en una llamada a `h`. Esta es la función:

```js
// h() es nuestro React.createElement: lo que genera el JSX.
// No dibuja nada, solo describe el elemento.
function h(tipo, props, ...children) {
  return { tipo, props: props ?? {}, children }
}
```

`h` no crea nada en la pantalla. Devuelve un objeto que describe lo que habría que dibujar. Por ejemplo, `h("p", { class: "dato" }, "Hola")` devuelve:

```js
{ tipo: "p", props: { class: "dato" }, children: ["Hola"] }
```

Tampoco ejecuta los componentes. `h(Dato, { etiqueta: "Tiempo" })` devuelve un objeto con `tipo: Dato`, la función sin ejecutar.

Separar la descripción del dibujo tiene una ventaja: podemos guardar la descripción de la app y volver a dibujarla cuantas veces queramos. React hace lo mismo con `React.createElement`.

## Nivel 2. crearDOM convierte la descripción en nodos

`crearDOM` recibe lo que devolvió `h` y crea los nodos reales del navegador:

```js
// Convierte la descripción que arma h() en nodos reales del DOM
function crearDOM(nodo) {
  if (nodo == null || typeof nodo === 'boolean') return document.createTextNode('')
  if (typeof nodo !== 'object') return document.createTextNode(nodo)

  const { tipo, props, children } = nodo

  // Componente: se ejecuta la función y se dibuja lo que devuelve
  if (typeof tipo === 'function') return crearDOM(tipo({ ...props, children }))

  // Etiqueta HTML
  const el = document.createElement(tipo)
  for (const [nombre, valor] of Object.entries(props)) {
    if (nombre.startsWith('on')) {
      el.addEventListener(nombre.slice(2).toLowerCase(), valor)
    } else if (nombre in el) {
      el[nombre] = valor        // value, checked, disabled...
    } else {
      el.setAttribute(nombre, valor)              // class, data-..., etc.
    }
  }
  el.append(...children.flat(Infinity).map(crearDOM))  // flat: por las listas de un .map()
  return el
}
```

Hay 4 casos posibles:

- nada para mostrar: `null`, `undefined`, `true` o `false` dan un nodo de texto vacío, así funciona `{condicion && <p>...</p>}`
- texto o número: se convierte en un nodo de texto
- un componente: se ejecuta la función con sus props y se dibuja lo que devuelve
- una etiqueta HTML: se crea el elemento, se le asignan las props y se le agregan los hijos

Las props de una etiqueta se asignan de 3 formas:

- si empiezan con `on`, son eventos: `onClick` se registra como el evento `click`
- si el elemento tiene una propiedad con ese nombre, como `value` o `checked`, se asigna directo
- si no, se agrega como atributo HTML, como `class`

Un componente es una función que recibe props y devuelve JSX. Es lo único que hace falta para tener componentes: `crearDOM` lo ejecuta y sigue con lo que devolvió.

Los hijos se aplanan con `flat(Infinity)`. Hace falta porque una expresión como `{lista.map(...)}` devuelve un arreglo, que queda como un hijo dentro de los hijos.

## Nivel 3. render dibuja y redibuja

`render` recibe la descripción de la app y el elemento de la página donde dibujarla:

```js
const hooks = []         // los hooks de toda la app, en orden
let actual  =  0         // índice del próximo hook
let efectos = []         // useEffect que esperan a que el DOM esté listo
let actualizar

function render(nodo, elemento) {
  let pendiente = false

  function dibujar() {
    actual  =  0
    efectos = []
    elemento.replaceChildren(crearDOM(nodo))
    efectos.forEach(efecto => efecto())
  }

  actualizar = () => {
    if (pendiente) return
    pendiente = true
    queueMicrotask(() => {
      dibujar()
      pendiente = false
    })
  }

  dibujar()
}
```

`dibujar` hace 4 cosas:

1. Pone `actual` en cero, para que los hooks empiecen a leerse desde la primera ranura.
2. Vacía la lista de efectos pendientes.
3. Crea todo el árbol de nodos y reemplaza con él el contenido del elemento.
4. Ejecuta los efectos que se juntaron mientras se dibujaba.

`render` dibuja una vez al empezar. Después, cada vez que cambie un estado, alguien llama a `actualizar` y se vuelve a dibujar todo desde cero. `actualizar` se explica en el nivel 5.

`dibujar` guarda en su closure el `nodo` y el `elemento` que recibió `render`. `actualizar` queda en una variable global para que los hooks puedan llamarla.

Redibujar todo es la decisión que más simplifica el mini React. React real no lo hace: compara el árbol nuevo con el anterior y cambia solo los nodos que cambiaron. Las consecuencias de esta decisión están en «Los límites de redibujar todo».

## Nivel 4. useState guarda datos en ranuras

Un componente es una función. Cada vez que se dibuja, se ejecuta de nuevo y sus variables locales empiezan de cero. Para que un dato sobreviva entre dibujos, tiene que guardarse afuera de la función.

El mini React lo guarda en el arreglo `hooks`. Cada llamada a un hook usa una ranura del arreglo, en orden:

```js
// ---------------------------------------------------------------------------
// Hooks

function useState(inicial) {
  const i = actual++
  hooks[i] ??= { valor: inicial }

  const setEstado = nuevo => {
    if (nuevo === hooks[i].valor) return     // si no cambió, no se redibuja
    hooks[i].valor = nuevo
    actualizar()
  }
  return [hooks[i].valor, setEstado]
}
```

Paso a paso:

1. `useState` toma la ranura siguiente y avanza `actual`, así el próximo hook usa la de al lado.
2. Si la ranura está vacía, es la primera vez: guarda el valor inicial. Las veces siguientes, `??=` no hace nada y se conserva el valor anterior.
3. Devuelve el valor actual y una función para cambiarlo.
4. `setEstado` compara el valor nuevo con el guardado. Si es el mismo, no hace nada. Si cambió, lo guarda y pide un nuevo dibujo.

Comparar evita dibujos inútiles: `setN(n)` no cambia nada, así que no redibuja. React hace lo mismo.

La comparación usa `===`. Para números y textos compara el valor. Para arreglos y objetos compara si son el mismo objeto, no su contenido. Por eso, si se agrega un elemento a un arreglo con `push` y se pasa el mismo arreglo, no se redibuja: hay que pasar un arreglo nuevo, por ejemplo `setLista([...lista, nuevo])`.

Las ranuras no tienen nombre. El hook sabe cuál es la suya solo por el orden de llamada. Funciona porque cada dibujo ejecuta los mismos componentes, en el mismo orden, y cada uno llama a sus hooks en el mismo orden.

## Nivel 5. Un solo dibujo para varios cambios

Un clic puede cambiar varios estados. En la aplicación, un clic en un contador cambia el número del contador y el total de `App`. Si cada `setEstado` dibujara en el momento, un clic produciría 2 dibujos, y el primero mostraría un estado a medio actualizar.

Por eso `setEstado` no dibuja: llama a `actualizar`, que agenda un dibujo para más tarde.

```js
  actualizar = () => {
    if (pendiente) return
    pendiente = true
    queueMicrotask(() => {
      dibujar()
      pendiente = false
    })
  }
```

`queueMicrotask` ejecuta una función en cuanto termina el código que está corriendo, por ejemplo el manejador del clic. El primer `setEstado` agenda el dibujo y marca `pendiente`. Los siguientes ven la marca y no agendan otro. Cuando termina el manejador, se dibuja una sola vez, con todos los cambios hechos.

React hace lo mismo y lo llama agrupar actualizaciones (batching).

## Nivel 6. useEffect corre código después de dibujar

Algunas cosas no son parte del dibujo: iniciar un reloj, pedir datos a un servidor o cambiar el título de la pestaña. Para eso está `useEffect`:

```js
function useEffect(efecto, deps) {
  const i = actual++
  const anterior = hooks[i]

  // Si ya corrió y ninguna dependencia cambió, no se hace nada
  if (anterior && deps && deps.every((d, k) => d === anterior.deps[k])) return

  efectos.push(() => {
    anterior?.limpiar?.()
    hooks[i] = { deps, limpiar: efecto() }
  })
}
```

Como `useState`, ocupa una ranura. En ella guarda 2 cosas: la lista de dependencias de la última vez que corrió y la función de limpieza que devolvió el efecto.

Cada vez que se dibuja, `useEffect` decide si el efecto tiene que correr:

- si es la primera vez, corre
- si no se pasó lista de dependencias, corre siempre
- si alguna dependencia cambió desde la última vez, corre
- si todas son iguales, no hace nada

El efecto no corre en el momento. Se agrega a `efectos` y `dibujar` lo ejecuta después de poner los nodos en la página. Antes de correr de nuevo, ejecuta la limpieza que dejó la vez anterior, si había una.

Con estas 4 funciones tenemos todo lo que necesita la aplicación.

# Parte 3. La aplicación

## Dato muestra una etiqueta y un valor

```js
function Dato({ etiqueta, valor }) {
  return <p class="dato"><span>{etiqueta}</span><span class="valor">{valor}</span></p>
}
```

Es el componente más simple posible: recibe props y devuelve JSX. No tiene estado ni efectos. La aplicación lo usa 3 veces, para el total, el tiempo y el flujo.

## Contador cuenta y avisa

```js
function Contador({ etiqueta, icono, alRegistrar }) {
  const [n, setN] = useState(0)

  return <button class="contador" onClick={() => (setN(n + 1), alRegistrar())}>
            <span><span class="contador-icono">{icono}</span><span class="contador-etiqueta">{etiqueta}</span></span><strong class="valor">{n}</strong>
         </button>
}
```

Todo el contador es un botón. Cada contador guarda su propia cantidad `n` con `useState`. Al tocarlo hace 2 cosas:

1. Suma uno a su propia cantidad con `setN(n + 1)`.
2. Avisa al componente que lo contiene, llamando a la función que recibió en `alRegistrar`.

El manejador usa el operador coma de JavaScript: `(a, b)` ejecuta `a`, después `b`. Así entra en una expresión sin llaves, que el traductor no permite en los atributos.

## Funciones que calculan valores

```js
function formatoFlujo({ total, segundos }) {
  const flujo = segundos === 0 ? 0 : Math.round(total * 3600 / segundos)
  return `${flujo} v/h`
}
function formatoTiempo({ segundos }) {
  const minutos = Math.floor(segundos / 60)
  const resto  = segundos % 60
  return `${minutos}:${String(resto).padStart(2, "0")}`
}
```

Son funciones comunes: reciben datos y devuelven un texto. El tiempo y el flujo no se guardan como estado. Se calculan en cada dibujo a partir de `total` y `segundos`. Guardarlos sería duplicar información que puede quedar desactualizada.

El flujo divide por los segundos. En el segundo cero devuelve 0 para no dividir por cero.

## App guarda el estado de toda la aplicación

```js
function App() {
  const [total, setTotal] = useState(0)
  const [segundos, setSegundos] = useState(0)
  const incrementarTotal = () => setTotal(total + 1)

  useEffect(() => {
    const id = setInterval(() => setSegundos(segundos + 1), 1_000)
    return () => clearInterval(id)
  }, [segundos])

  const tiempo = formatoTiempo({ segundos })
  const flujoTexto = formatoFlujo({ total, segundos })

  return (
    <main>
      <h1>Mini React</h1>
      <div class="contadores">
        <Contador icono="🛵" etiqueta="Motos" alRegistrar={incrementarTotal} />
        <Contador icono="🚗" etiqueta="Autos" alRegistrar={incrementarTotal} />
      </div>
      <div class="tarjeta resultados">
        <Dato etiqueta="Vehículos" valor={total} />
        <Dato etiqueta="Tiempo"    valor={tiempo} />
        <Dato etiqueta="Flujo"     valor={flujoTexto} />
      </div>
    </main>
  )
}

render(<App />, document.getElementById("raiz"))
```

`App` guarda 2 estados: el total de vehículos y los segundos transcurridos. Con ellos calcula el tiempo y el flujo, y arma la pantalla.

La última línea arranca todo: dibuja `App` dentro del `<div id="raiz">`.

## Por qué el efecto depende de segundos

El efecto crea un intervalo que suma un segundo cada 1000 milisegundos. La función del intervalo usa `segundos`, y esa variable queda fija con el valor que tenía cuando se creó la función.

Si la lista de dependencias fuera `[]`, el efecto correría una sola vez, con `segundos` en 0. El intervalo llamaría siempre a `setSegundos(0 + 1)` y el reloj quedaría clavado en 0:01.

Con `[segundos]`, el efecto vuelve a correr cada vez que cambian los segundos. Primero ejecuta la limpieza, que detiene el intervalo anterior. Después crea uno nuevo, que ve el valor actualizado. En la práctica, cada intervalo dispara una sola vez antes de ser reemplazado.

La limpieza también importa por otra razón: sin `clearInterval`, cada segundo se sumaría un intervalo nuevo sin detener los anteriores, y el reloj se aceleraría.

## Los datos bajan, los avisos suben

`App` le pasa datos a sus hijos a través de las props: el ícono, la etiqueta y el valor de cada `Dato`.

Un hijo no puede cambiar el estado de su padre. Lo que sí puede hacer es llamar a una función que el padre le pasó. `App` le da a cada `Contador` la función `incrementarTotal` en la prop `alRegistrar`. El contador la llama sin saber qué hace, y es `App` quien decide cómo cambia su propio estado.

Los datos bajan por las props y los avisos suben por las funciones. Es el mismo patrón que se usa en React.

En esta aplicación el dato está duplicado a propósito: cada contador guarda su cantidad y `App` guarda el total por separado. Más adelante vemos otra forma de hacerlo, en «Otra forma: levantar el estado».

## La memoria de la aplicación

Al dibujar, los componentes se ejecutan en este orden: `App`, el contador de motos, el contador de autos y los 3 `Dato`. Cada hook ocupa la ranura siguiente:

| Ranura | Componente | Hook | Guarda |
|---|---|---|---|
| 0 | `App` | `useState` | `total` |
| 1 | `App` | `useState` | `segundos` |
| 2 | `App` | `useEffect` | las dependencias `[segundos]` y la limpieza del intervalo |
| 3 | `Contador` de motos | `useState` | `n` de las motos |
| 4 | `Contador` de autos | `useState` | `n` de los autos |

`Dato` no usa hooks, así que no ocupa ranuras.

Por ejemplo, con 1 moto y 2 autos a los 2 segundos, el arreglo `hooks` tiene:

```js
[
  { valor: 3 },                          // total
  { valor: 2 },                          // segundos
  { deps: [2], limpiar: () => ... },     // efecto del reloj
  { valor: 1 },                          // motos
  { valor: 2 },                          // autos
]
```

## Anatomía de un clic

Esto es lo que pasa cuando la persona toca el contador de autos:

1. El navegador ejecuta el manejador del botón: `() => (setN(n + 1), alRegistrar())`.
2. `setN(n + 1)` cambia la ranura 4 de 0 a 1 y llama a `actualizar`, que agenda un dibujo y marca `pendiente`.
3. `alRegistrar()` ejecuta `incrementarTotal` de `App`, que cambia la ranura 0. Llama a `actualizar`, que ve la marca y no agenda otro dibujo.
4. Termina el manejador y corre la microtarea agendada.
5. `dibujar` pone `actual` en cero y ejecuta `App`, que lee las ranuras 0 y 1 con los valores nuevos y recalcula el tiempo y el flujo.
6. En la ranura 2, `useEffect` compara `[segundos]` con lo que tenía guardado. Los segundos no cambiaron, así que no agenda nada y el intervalo sigue andando.
7. `crearDOM` ejecuta los dos contadores, que leen las ranuras 3 y 4, y los 3 `Dato`.
8. El árbol nuevo reemplaza al anterior en la pantalla.

Fueron 2 cambios de estado en 2 componentes distintos, y un solo dibujo.

## Anatomía de un segundo

Esto es lo que pasa cada vez que el intervalo dispara:

1. El intervalo llama a `setSegundos(segundos + 1)`, que cambia la ranura 1 y agenda un dibujo.
2. `dibujar` ejecuta `App`, que lee los segundos nuevos y recalcula el tiempo y el flujo.
3. En la ranura 2, `useEffect` ve que `segundos` cambió y agrega el efecto a la lista.
4. Se dibujan los contadores y los datos, y el árbol nuevo reemplaza al anterior.
5. Corre el efecto: ejecuta la limpieza anterior, que detiene el intervalo viejo, y crea un intervalo nuevo.

Aunque nadie toque nada, la aplicación entera se redibuja una vez por segundo.

# Lo que conviene saber

## Las reglas de los hooks

La tabla de ranuras explica las dos reglas que React exige para los hooks:

- se llaman siempre en el mismo orden
- se llaman solo en el cuerpo de un componente, no dentro de un `if`, un `for` ni una función anidada

Si un hook está dentro de un `if`, en algunos dibujos se llama y en otros no. Cuando no se llama, todos los hooks siguientes se corren una ranura y cada uno lee el dato de otro:

```js
const [n, setN] = useState(0)          // ranura 3
if (mostrarHistorial) {
  const [lista, setLista] = useState([])  // ranura 4... a veces
}
```

En el mini React la restricción es más fuerte que en React: las ranuras son de toda la aplicación, no de cada componente. Por eso tampoco puede haber componentes que aparecen y desaparecen, como `{visible ? <Contador ... /> : null}`. React guarda los hooks de cada componente por separado y no tiene este problema.

## Los límites de redibujar todo

Reconstruir toda la pantalla en cada cambio hace corto el mini React, pero tiene costos:

- se pierde el estado propio del navegador: si hubiera un `<input>`, perdería el foco y lo escrito no confirmado, y con el reloj andando eso pasaría una vez por segundo
- se rehace trabajo: cada segundo se crean de nuevo todos los nodos, aunque solo cambien 2 textos
- el árbol no puede cambiar de forma, por las ranuras compartidas
- varios cambios antes de un dibujo leen el mismo valor viejo: si se llama 2 veces a `setTotal(total + 1)` sin dibujar en el medio, el total sube uno solo

React resuelve los 3 primeros con la reconciliación: compara el árbol nuevo con el anterior y cambia solo los nodos que cambiaron. Resuelve el último permitiendo pasar una función al setter: `setTotal(t => t + 1)` siempre parte del valor más reciente.

## Otra forma: levantar el estado

En la aplicación, el total se guarda 2 veces: en cada contador y en `App`. Funciona, pero los números podrían quedar desparejos si alguien cambia uno y se olvida del otro.

La alternativa es levantar el estado: guardar las cantidades solo en `App` y que los contadores las reciban por props. El total deja de ser estado y pasa a ser un cálculo:

```js
function Contador({ etiqueta, icono, n, alRegistrar }) {
  return <button class="contador" onClick={alRegistrar}>
            <span><span class="contador-icono">{icono}</span><span class="contador-etiqueta">{etiqueta}</span></span><strong class="valor">{n}</strong>
         </button>
}

function App() {
  const [motos, setMotos] = useState(0)
  const [autos, setAutos] = useState(0)
  const total = motos + autos
  // ...
        <Contador icono="🛵" etiqueta="Motos" n={motos} alRegistrar={() => setMotos(motos + 1)} />
        <Contador icono="🚗" etiqueta="Autos" n={autos} alRegistrar={() => setAutos(autos + 1)} />
  // ...
}
```

Ahora `Contador` no tiene estado: muestra lo que recibe y avisa cuando lo tocan. Los datos viven en un solo lugar.

Las dos versiones son válidas. Conviene levantar el estado cuando más de un componente necesita el mismo dato.

## Del mini React al React real

El código de la aplicación casi no cambia al pasar a React:

| En el mini React | En React |
|---|---|
| `h(tipo, props, ...children)` | `React.createElement(tipo, props, ...children)` |
| `render(<App />, elemento)` | `ReactDOM.createRoot(elemento).render(<App />)` |
| `class="dato"` | `className="dato"` |
| `useState` y `useEffect` globales | `import { useState, useEffect } from "react"` |
| `setEstado(valor)` | `setEstado(valor)` o `setEstado(anterior => nuevo)` |
| redibuja todo | cambia solo los nodos que cambiaron |
| ranuras de toda la aplicación | ranuras de cada componente |
| `<script type="text/jsx">` y el traductor | Babel o Vite traducen el JSX antes de publicar |

Lo que vimos en este tutorial es lo esencial: el JSX es una llamada a función, un componente es una función que devuelve una descripción de la pantalla, y los hooks son ranuras que sobreviven entre una ejecución y la siguiente.
