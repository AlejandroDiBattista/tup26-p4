# Un React en miniatura: `useState` y `useEffect` desde cero

## La idea que hay detrás de React

React se apoya en una sola idea: **la interfaz es una función del estado**. Escribimos funciones que, a partir de ciertos datos, describen cómo tiene que verse la pantalla. Cuando los datos cambian, React vuelve a llamar a esas funciones y la pantalla se actualiza. Nosotros nunca tocamos el DOM a mano.

Todo lo demás que se suele escuchar sobre React (DOM virtual, reconciliación, fibras) son optimizaciones de esa idea. Son importantes en una aplicación grande, pero tapan lo esencial cuando uno está aprendiendo.

En este apunte vamos a construir un framework de unas cien líneas con cuatro piezas:

| Pieza | Para qué sirve |
|---|---|
| `createElement` | Describir la interfaz con llamadas a funciones, sin JSX. |
| `render` | Dibujar la aplicación dentro de un elemento de la página. |
| `useState` | Darle memoria a un componente entre un dibujo y el siguiente. |
| `useEffect` | Ejecutar código después de dibujar: arrancar un reloj, por ejemplo. |

Vamos a tomar una decisión deliberadamente ingenua: **cada vez que algo cambia, tiramos la pantalla entera y la construimos de nuevo**. No comparamos nada, no reutilizamos nodos. Así el mecanismo queda a la vista, y al final vamos a poder ver con claridad qué problema resuelve el DOM virtual.

## La aplicación que vamos a construir

Una planilla de conteo de tránsito para una esquina. Una persona se para en la vereda, toca **▶** para empezar y, cada vez que pasa un vehículo, toca el contador de su tipo: moto, auto o camioneta. La aplicación:

- registra la hora de inicio y mide el tiempo transcurrido;
- lleva la cuenta de cada tipo de vehículo y el total;
- muestra el **flujo total**: cuántos vehículos pasarían en una hora al ritmo observado.

El flujo no se cuenta: se calcula. Si en 10 minutos pasaron 50 vehículos, el flujo es 50 × 60 / 10 = 300 vehículos por hora. En general, `total × 3600 / segundos transcurridos`.

### Los componentes

```text
App            inicio, ahora, total  (el contador global)
├── Cronometro
├── Contador   "Motos"       cantidad  (su contador interno)
├── Contador   "Autos"       cantidad
├── Contador   "Camionetas"  cantidad
└── Resumen
    └── Dato × 2
```

Hay dos clases de contador:

- Cada `Contador` es **autocontenido**: guarda su propia cuenta con `useState` y la incrementa cuando se toca su botón.
- `App` lleva el **contador global**: el total de vehículos.

Lo que queremos mostrar en clase es cómo se conectan. Cuando se toca un contador, el contador incrementa su cuenta interna y además **avisa a su padre**, que incrementa el total. Un solo clic cambia el estado de dos componentes distintos, y la pantalla completa se vuelve a dibujar una sola vez.

### Qué se guarda y qué se calcula

Conviene guardar solo lo que no se puede obtener a partir de otra cosa:

| Dato | Dónde vive |
|---|---|
| Hora de inicio (`null` si está detenido) | Estado de `App` |
| Hora actual | Estado de `App` (es lo que hace avanzar el reloj, nivel 6) |
| Total de vehículos | Estado de `App` |
| Cantidad de cada tipo | Estado de cada `Contador` |
| ¿Está contando? | Se calcula: hay hora de inicio |
| Segundos transcurridos | Se calcula: hora actual menos hora de inicio |
| Flujo total | Se calcula con la fórmula |

## Nivel 1: describir la interfaz con funciones

En React casi siempre se escribe JSX:

```jsx
<button className="registrar" onClick={registrar}>+1</button>
```

JSX no es JavaScript. Antes de ejecutarse, una herramienta lo transforma en una llamada común:

```js
createElement("button", { className: "registrar", onClick: registrar }, "+1");
```

Nosotros vamos a escribir directamente esa llamada. Recibe tres cosas:

1. **El tipo**: el nombre de una etiqueta HTML (`"button"`, `"div"`).
2. **Las props**: un objeto con atributos y manejadores de eventos, o `null` si no hay.
3. **Los hijos**: todo lo que va adentro. Pueden ser textos, números u otros elementos.

Una primera versión crea directamente el nodo real del DOM:

```js
function createElement(tipo, props, ...hijos) {
  props = props ?? {};
  const elemento = document.createElement(tipo);

  for (const [nombre, valor] of Object.entries(props)) {
    asignarPropiedad(elemento, nombre, valor);
  }

  for (const hijo of hijos.flat(Infinity)) {
    if (hijo === null || hijo === undefined || typeof hijo === "boolean") continue;
    elemento.append(hijo instanceof Node ? hijo : String(hijo));
  }
  return elemento;
}
```

Hay tres detalles en el recorrido de los hijos:

- `...hijos` junta todos los argumentos que vienen después de las props en un arreglo.
- `flat(Infinity)` aplana arreglos anidados. Eso permite pasar el resultado de un `map` como hijo, que es como se dibujan listas.
- Se saltean `null`, `undefined`, `true` y `false`. Eso permite escribir `condicion && createElement(...)`: si la condición es falsa, no se dibuja nada.

Las props se aplican según su nombre:

```js
function asignarPropiedad(elemento, nombre, valor) {
  if (nombre.startsWith("on") && typeof valor === "function") {
    elemento.addEventListener(nombre.slice(2).toLowerCase(), valor);  // onClick → "click"
  } else if (nombre === "className") {
    elemento.className = valor;            // class es palabra reservada en JS
  } else if (nombre === "style" && typeof valor === "object") {
    Object.assign(elemento.style, valor);  // { fontSize: "2rem" }
  } else if (typeof valor === "boolean") {
    elemento.toggleAttribute(nombre, valor);  // disabled: true / false
  } else if (valor !== null && valor !== undefined) {
    elemento.setAttribute(nombre, valor);
  }
}
```

Como vamos a escribir `createElement` muchas veces, le ponemos un nombre corto. La convención es `h`, por *hyperscript*:

```js
const h = createElement;

const tarjeta = h("section", { className: "contador" },
  h("h2", null, "Autos"),
  h("p", { className: "cantidad" }, 0),
  h("button", { onClick: () => alert("¡Pasó un auto!") }, "+1"),
);
document.body.append(tarjeta);
```

> **Diferencia con React.** El `createElement` de React no crea nodos del DOM. Devuelve un objeto común que *describe* el nodo (`{ type: "button", props: {...} }`). Ese objeto es el famoso «DOM virtual»: React lo usa para comparar lo que había con lo que tiene que haber. Como nosotros no vamos a comparar nada, nos salteamos ese paso y creamos el nodo real de entrada.

## Nivel 2: componentes

Un componente es una función que recibe props y devuelve un elemento. Nada más:

```js
function Dato({ titulo, valor }) {
  return h("div", { className: "dato" },
    h("p", { className: "titulo" }, titulo),
    h("p", { className: "valor" }, valor),
  );
}
```

Para poder usarlo con `h(Dato, { titulo: "Total", valor: 12 })`, `createElement` tiene que distinguir entre una etiqueta y un componente. Si el tipo es una función, la llama con las props (y con los hijos dentro de `children`) y devuelve lo que ella devuelva:

```js
function createElement(tipo, props, ...hijos) {
  props = props ?? {};

  if (typeof tipo === "function") {
    return tipo({ ...props, children: hijos });
  }

  // ...lo mismo que antes para las etiquetas HTML
}
```

Con esto ya se puede componer la interfaz con piezas reutilizables:

```js
function Resumen({ total, flujo }) {
  return h("section", { className: "resumen" },
    h(Dato, { titulo: "Total de vehículos", valor: total }),
    h(Dato, { titulo: "Flujo total", valor: flujo }),
  );
}
```

Las props son **entradas de solo lectura**. El componente no las modifica; quien decide qué valores recibe es el componente padre.

Hay algo importante para más adelante: el orden en que se ejecutan los componentes. En JavaScript, los argumentos de una función se evalúan antes de llamarla y de izquierda a derecha. Entonces, en `h("section", null, h(Dato, a), h(Dato, b))` se ejecuta primero el `Dato` de `a`, después el de `b`, y recién después se crea la `section`. Para un mismo árbol de componentes, **el orden de ejecución es siempre el mismo**. Vamos a aprovechar eso en el nivel 4.

## Nivel 3: dibujar y volver a dibujar

Dibujar una aplicación es ejecutar el componente raíz y poner el resultado en la página. Volver a dibujarla es exactamente lo mismo:

```js
function render(componente, contenedor) {
  contenedor.replaceChildren(h(componente));
}
```

`replaceChildren` borra todo lo que había dentro del contenedor y pone el árbol nuevo. Esa es nuestra «reconstrucción total».

Ya se puede hacer una aplicación que cambia, guardando el dato en una variable y redibujando a mano:

```js
let clics = 0;

function App() {
  return h("button", {
    onClick: () => {
      clics++;
      render(App, raiz);   // hay que acordarse de redibujar
    },
  }, `Clics: ${clics}`);
}

const raiz = document.getElementById("raiz");
render(App, raiz);
```

Funciona: cada clic incrementa la variable, se descarta el botón viejo y se crea uno nuevo con el texto actualizado. Pero tiene dos problemas:

1. **El dato vive afuera del componente.** Si queremos tres contadores necesitamos tres variables globales, y el componente deja de ser reutilizable: no puede haber dos instancias con cuentas distintas.
2. **Hay que acordarse de redibujar** después de cada cambio. Si nos olvidamos en un solo lugar, la pantalla queda desactualizada.

`useState` resuelve las dos cosas.

## Nivel 4: `useState`, memoria fuera de la función

El problema de fondo es este: un componente es una función, y las variables locales de una función desaparecen cuando termina. Si queremos que un contador recuerde cuántos autos pasaron entre un dibujo y el siguiente, ese número tiene que guardarse **afuera** del componente, en el framework.

Pero ¿cómo sabe el framework qué valor le corresponde a cada componente? Los tres contadores son *la misma función* `Contador`, llamada tres veces con props distintas.

La respuesta es **por la posición**. En cada dibujo los componentes se ejecutan siempre en el mismo orden, y dentro de cada componente los `useState` se llaman siempre en el mismo orden. Entonces el framework puede guardar los valores en un arreglo y repartirlos en orden, como quien reparte números en una fila:

```js
const hooks = [];   // la memoria del framework; sobrevive entre dibujos
let indice = 0;     // cuál es la próxima ranura a entregar

function useState(valorInicial) {
  const i = indice++;
  if (hooks[i] === undefined) {
    hooks[i] = { valor: valorInicial };   // primera vez: se crea la ranura
  }
  const ranura = hooks[i];

  function setValor(nuevoValor) {
    ranura.valor = nuevoValor;
    renderizar();                         // cambió el estado: se redibuja solo
  }

  return [ranura.valor, setValor];
}

function renderizar() {
  indice = 0;                             // cada dibujo empieza a repartir desde cero
  contenedor.replaceChildren(h(componenteRaiz));
}
```

`useState` devuelve un par: el valor actual y una función para cambiarlo. Por convención se desestructura así:

```js
function Contador({ nombre }) {
  const [cantidad, setCantidad] = useState(0);
  return h("section", null,
    h("h2", null, nombre),
    h("p", null, cantidad),
    h("button", { onClick: () => setCantidad(cantidad + 1) }, "+1"),
  );
}
```

Fijate qué pasa con el valor inicial: solo se usa la primera vez, cuando la ranura todavía no existe. En los dibujos siguientes, `useState(0)` ignora el `0` y devuelve lo que haya en la ranura.

La función `setValor` es una clausura: recuerda *su* ranura. Por eso el botón de cada contador modifica la cuenta correcta aunque los tres sean la misma función.

### Cómo queda la memoria en nuestra aplicación

Con la aplicación completa (la vamos a ver en el nivel 7), el arreglo `hooks` queda así. `App` usa tres estados y un efecto; cada `Contador`, un estado y un efecto. Los efectos también ocupan una ranura: ahí guardan sus dependencias y su limpieza, como vamos a ver en el nivel 6.

| Ranura | Componente | Hook |
|---|---|---|
| 0 | `App` | `inicio` |
| 1 | `App` | `ahora` |
| 2 | `App` | `total` |
| 3 | `App` | efecto del reloj |
| 4 y 5 | `Contador` Motos | `cantidad`, efecto de reinicio |
| 6 y 7 | `Contador` Autos | `cantidad`, efecto de reinicio |
| 8 y 9 | `Contador` Camionetas | `cantidad`, efecto de reinicio |

Los contadores no tienen nombre ni identificador en el framework. La ranura 6 es «la cuenta de autos» solamente porque el contador de autos es el segundo y `cantidad` es su primer hook. La página final muestra esta tabla en vivo.

### Las reglas de los hooks

De aquí sale la regla más famosa de React: **los hooks se llaman siempre, en el mismo orden, en el nivel superior del componente**. Nunca dentro de un `if`, de un bucle o después de un `return` temprano.

Veamos por qué con un ejemplo que rompe la regla:

```js
function Contador({ conHistorial }) {
  const [cantidad, setCantidad] = useState(0);   // ranura 4
  if (conHistorial) {
    const [lista, setLista] = useState([]);      // ranura 5... a veces
  }
  useEffect(/* ... */);                          // ranura 6 o 5 (!)
  // ...
}
```

Si `conHistorial` cambia de `true` a `false`, el `useEffect` pasa a recibir la ranura 5, que tenía la lista. Y todos los hooks de los componentes siguientes quedan corridos un lugar: el contador de autos lee las ranuras del contador de motos. El framework no se entera: reparte ranuras en orden y confía en que el orden no cambió.

## Nivel 5: muchos cambios, un solo dibujo

La versión anterior de `setValor` redibuja en el acto. Miremos qué pasa cuando se registra un auto en la aplicación real:

```js
function registrar() {
  setCantidad((c) => c + 1);   // el contador interno
  alRegistrar();               // el padre hace setTotal
}
```

Son dos cambios de estado, así que la pantalla se construiría dos veces. Peor: el primer dibujo ocurre en el medio del manejador, cuando el padre todavía no se enteró del auto nuevo. Por un instante, la pantalla mostraría el contador incrementado y el total viejo.

La solución es **agendar** el dibujo en lugar de hacerlo en el acto. Si ya hay uno agendado, no se agenda otro:

```js
let renderPendiente = false;

function programarRender() {
  if (renderPendiente) return;
  renderPendiente = true;
  queueMicrotask(renderizar);
}
```

`queueMicrotask` ejecuta la función apenas termina el código que está corriendo, en este caso el manejador del clic, y **antes** de que el navegador pinte la pantalla. Entonces los dos `setState` modifican sus ranuras, el manejador termina, se dibuja una sola vez con todos los valores nuevos, y el usuario nunca ve un estado intermedio. React hace lo mismo y lo llama *batching* (agrupar actualizaciones).

Agrupar trae un problema nuevo. Supongamos que en un mismo manejador hacemos esto:

```js
setTotal(total + 1);
setTotal(total + 1);
```

`total` es una constante que se leyó al dibujar, así que las dos líneas calculan el mismo valor y el total sube uno, no dos. Por eso el *setter* también acepta una función, que recibe el valor más reciente de la ranura:

```js
setTotal((t) => t + 1);
setTotal((t) => t + 1);   // ahora sí suma dos
```

Con eso, la versión definitiva de `useState` queda así:

```js
function useState(valorInicial) {
  const i = indice++;
  if (hooks[i] === undefined) {
    hooks[i] = { tipo: "estado", valor: valorInicial };
  }
  const ranura = hooks[i];

  function setValor(nuevoValor) {
    const valor = typeof nuevoValor === "function"
      ? nuevoValor(ranura.valor)
      : nuevoValor;
    if (Object.is(valor, ranura.valor)) return;   // no cambió: no hay nada que dibujar
    ranura.valor = valor;
    programarRender();
  }

  return [ranura.valor, setValor];
}
```

La comparación con `Object.is` evita redibujar cuando el valor nuevo es igual al anterior. Vamos a necesitarla en el nivel siguiente.

## Nivel 6: `useEffect`, lo que pasa después de dibujar

Un componente debería limitarse a calcular qué se ve en pantalla. Si dentro del componente arrancamos un reloj, ese reloj se arrancaría de nuevo en cada dibujo; y en nuestra aplicación se dibuja todo una vez por segundo.

Pero las aplicaciones necesitan hacer cosas que no son dibujar: arrancar y detener temporizadores, pedir datos a un servidor, reaccionar a un cambio. Se llaman **efectos secundarios**, y para eso está `useEffect`. Recibe dos cosas:

- una función con el efecto, que se ejecuta **después** de que la pantalla nueva está en su lugar;
- un arreglo de **dependencias**: el efecto solo se vuelve a ejecutar si alguna cambió desde el dibujo anterior.

Además, el efecto puede devolver una **función de limpieza**, que el framework ejecuta antes de volver a correr el efecto. Sirve para deshacer lo que el efecto hizo: detener un reloj, cerrar una conexión.

El arreglo de dependencias tiene tres formas de uso:

| Llamada | Cuándo se ejecuta el efecto |
|---|---|
| `useEffect(fn)` | Después de cada dibujo. |
| `useEffect(fn, [])` | Solo después del primer dibujo. |
| `useEffect(fn, [a, b])` | En el primer dibujo y cada vez que cambie `a` o `b`. |

La implementación usa la misma técnica de ranuras. Un efecto también necesita recordar cosas entre un dibujo y el siguiente: las **dependencias** del dibujo anterior, para saber si cambiaron, y la **limpieza** que devolvió, para ejecutarla antes de la próxima vez. Por eso ocupa su propia ranura. Durante el dibujo no ejecuta nada: solo decide si el efecto tiene que correr y, si es así, lo anota en una lista de pendientes:

```js
let efectosPendientes = [];

function useEffect(efecto, dependencias) {
  const i = indice++;
  const primeraVez = hooks[i] === undefined;
  if (primeraVez) {
    hooks[i] = { tipo: "efecto", dependencias: undefined, limpieza: undefined };
  }
  const ranura = hooks[i];

  const cambiaron = primeraVez
    || dependencias === undefined
    || dependencias.some((dep, k) => !Object.is(dep, ranura.dependencias[k]));

  if (cambiaron) {
    ranura.dependencias = dependencias;
    efectosPendientes.push({ ranura, efecto });
  }
}
```

Y `renderizar` gana un tercer paso: una vez que la pantalla está armada, recorre los pendientes, limpia lo anterior y ejecuta cada efecto, guardando su limpieza para la próxima vez:

```js
function renderizar() {
  renderPendiente = false;
  indice = 0;

  const arbol = h(componenteRaiz);        // 1. ejecutar todos los componentes
  contenedor.replaceChildren(arbol);      // 2. reemplazar la pantalla entera

  for (const { ranura, efecto } of efectosPendientes) {   // 3. efectos
    if (typeof ranura.limpieza === "function") ranura.limpieza();
    ranura.limpieza = efecto();
  }
  efectosPendientes = [];
}
```

### Primer ejemplo: el reloj

```js
useEffect(() => {
  if (!corriendo) return;
  const id = setInterval(() => setAhora(Date.now()), 1000);
  return () => clearInterval(id);
}, [corriendo]);
```

Sigamos la secuencia completa:

1. Al principio `corriendo` es `false`. El efecto corre una vez y sale sin hacer nada. Su ranura guarda `[false]`.
2. Se toca **▶** y `corriendo` pasa a `true`. Cambió la dependencia, así que el efecto corre, arranca un intervalo y devuelve la función que lo detiene. La ranura guarda `[true]` y esa limpieza.
3. Cada segundo, el intervalo llama a `setAhora`. Eso provoca un dibujo completo, pero `corriendo` sigue en `true`: el efecto no se toca y el intervalo sigue andando.
4. Se toca **⏹** y `corriendo` vuelve a `false`. Cambió la dependencia: primero se ejecuta la limpieza guardada (`clearInterval`) y después el efecto, que sale sin hacer nada.

Sin la limpieza, cada vez que se iniciara una medición se sumaría un intervalo nuevo a los anteriores, y el reloj avanzaría cada vez más rápido.

### ¿Hace falta guardar la hora actual?

Los segundos transcurridos se podrían calcular con `Date.now() - inicio` directamente al dibujar, sin guardar `ahora`. El problema es que el framework solo dibuja cuando cambia un estado: si nada cambia, nadie vuelve a ejecutar `App` y el reloj queda congelado en pantalla.

Por eso `ahora` es estado: es el único dato que cambia solo, con el paso del tiempo, y el efecto del reloj lo actualiza una vez por segundo. Tiene una ventaja adicional: el componente queda **puro**, porque con el mismo estado dibuja siempre la misma pantalla.

### Segundo ejemplo: volver a cero

Cuando empieza una medición nueva, cada contador tiene que volver a cero. El padre no puede tocar el estado de un hijo, pero el hijo sí puede reaccionar a una prop: cuando pasa a estar habilitado, se pone en cero.

```js
useEffect(() => {
  if (habilitado) setCantidad(0);
}, [habilitado]);
```

En el primer dibujo `habilitado` es `false` y no hace nada. Al tocar **▶** pasa a `true` y la cuenta vuelve a cero. Si la cuenta ya estaba en cero, `Object.is` detecta que no hay cambio y no se agenda ningún dibujo. Si había cuentas de una medición anterior, el reinicio provoca un segundo dibujo inmediato; como ocurre en una microtarea, el usuario nunca llega a ver los números viejos.

## Nivel 7: la aplicación completa

Con el framework terminado, la aplicación se escribe como en React, cambiando JSX por `h`.

### Funciones auxiliares

```js
const h = MiniReact.createElement;
const { useState, useEffect } = MiniReact;

function formatearDuracion(segundos) {
  const horas = String(Math.floor(segundos / 3600)).padStart(2, "0");
  const minutos = String(Math.floor((segundos % 3600) / 60)).padStart(2, "0");
  const resto = String(segundos % 60).padStart(2, "0");
  return `${horas}:${minutos}:${resto}`;
}

// Flujo: cuántos vehículos pasarían en una hora al ritmo observado.
function calcularFlujo(cantidad, segundos) {
  if (segundos === 0) return "—";
  return `${Math.round((cantidad * 3600) / segundos)} v/h`;
}
```

### Componentes de presentación

`Dato`, `Cronometro` y `Resumen` no tienen estado. Reciben valores por props y los muestran. `Resumen` no guarda el flujo: lo **calcula** en cada dibujo a partir del total y los segundos. Como el reloj provoca un dibujo por segundo, el flujo se va ajustando solo aunque no pase ningún vehículo.

```js
function Dato({ titulo, valor }) {
  return h("div", { className: "componente dato" },
    h("p", { className: "titulo" }, titulo),
    h("p", { className: "valor" }, valor),
  );
}

function Cronometro({ segundos }) {
  return h("div", { className: "componente cronometro" }, formatearDuracion(segundos));
}

function Resumen({ total, segundos }) {
  const flujo = calcularFlujo(total, segundos);
  return h("section", { className: "componente resumen" },
    h(Dato, { titulo: "Total de vehículos", valor: total }),
    h(Dato, { titulo: "Flujo total", valor: flujo }),
  );
}
```

### El contador autocontenido

Cada `Contador` guarda su cantidad con `useState`. Todo el contador es un botón: se toca en cualquier parte para registrar un vehículo. Del padre recibe su nombre, con el emoji incluido, y dos props más: `habilitado`, que dice si se está contando, y `alRegistrar`, una función que el contador llama cada vez que registra un vehículo. El contador no sabe qué hace el padre con ese aviso.

```js
function Contador({ nombre, habilitado, alRegistrar }) {
  const [cantidad, setCantidad] = useState(0);

  // Al empezar una medición, el contador arranca de cero.
  useEffect(() => {
    if (habilitado) setCantidad(0);
  }, [habilitado]);

  function registrar() {
    setCantidad((c) => c + 1);   // el contador interno
    alRegistrar();               // el aviso al padre
  }

  // Todo el contador es el botón.
  return h("button", { className: "componente contador", disabled: !habilitado, onClick: registrar },
    h("span", { className: "nombre" }, nombre),
    h("span", { className: "cantidad" }, cantidad),
  );
}
```

### La aplicación y el contador global

`App` guarda la hora de inicio, la hora actual y el total, y calcula si se está contando y cuántos segundos pasaron.

```js
function App() {
  const [inicio, setInicio] = useState(null);       // null: detenido
  const [ahora, setAhora] = useState(Date.now());
  const [total, setTotal] = useState(0);            // el contador global

  const corriendo = inicio !== null;
  const segundos = corriendo ? Math.floor((ahora - inicio) / 1000) : 0;

  // Mientras se cuenta, el reloj avanza una vez por segundo.
  useEffect(() => {
    if (!corriendo) return;
    const id = setInterval(() => setAhora(Date.now()), 1000);
    return () => clearInterval(id);
  }, [corriendo]);

  function iniciar() {
    const instante = Date.now();
    setInicio(instante);
    setAhora(instante);
    setTotal(0);
  }

  function detener() {
    setInicio(null);
  }

  function registrarVehiculo() {
    setTotal((t) => t + 1);
  }

  // Las props que reciben los tres contadores.
  const comunes = { habilitado: corriendo, alRegistrar: registrarVehiculo };

  return h("main", { className: "componente app" },
    h("h1", null, "Conteo de tránsito"),
    h("div", { className: "control" },
      h("button", {
        className: "principal",
        title: corriendo ? "Detener" : "Iniciar",
        onClick: corriendo ? detener : iniciar,
      }, corriendo ? "⏹" : "▶"),
      h(Cronometro, { segundos }),
    ),
    h("div", { className: "contadores" },
      h(Contador, { nombre: "🏍️ Motos", ...comunes }),
      h(Contador, { nombre: "🚗 Autos", ...comunes }),
      h(Contador, { nombre: "🛻 Camionetas", ...comunes }),
    ),
    h(Resumen, { total, segundos }),
  );
}

MiniReact.render(App, document.getElementById("raiz"));
```

Dos detalles de este código:

- Un solo botón, a la izquierda del cronómetro, sirve para iniciar (▶) y detener (⏹). Su símbolo, su título y su manejador se calculan a partir de `corriendo`, como cualquier otro dato de la pantalla.
- Los tres contadores reciben las mismas props `habilitado` y `alRegistrar`, así que se juntan en el objeto `comunes` y se esparcen con `...comunes`.

Al detener, `inicio` vuelve a `null`, el reloj se apaga y el flujo muestra «—»; las cuentas quedan en pantalla hasta el próximo inicio.

### Los datos bajan, los avisos suben

Esta es la forma en que se comunican los componentes en React:

- **Del padre al hijo** viajan datos, como props: `habilitado`.
- **Del hijo al padre** viajan avisos, a través de funciones que el padre le pasó como props: `alRegistrar`.

El hijo nunca modifica el estado del padre directamente. Llama a una función, y es el padre el que decide cómo se modifica su propio estado.

### Anatomía de un clic

Veamos qué pasa, paso a paso, cuando el observador toca el contador de autos. Los números de ranura son los de la tabla del nivel 4.

1. El navegador ejecuta `registrar` del contador de autos.
2. `setCantidad((c) => c + 1)` cambia la ranura 6 de 0 a 1 y agenda un dibujo.
3. `alRegistrar()` ejecuta `registrarVehiculo` de `App`, que cambia la ranura 2 (`total`). Ya hay un dibujo agendado; no se agenda otro.
4. Termina el manejador del clic y corre la microtarea: `renderizar` pone `indice` en cero y ejecuta `App`, que lee sus ranuras 0 a 3 con los valores nuevos. Después se ejecutan `Cronometro`, los tres `Contador` (ranuras 4 a 9) y `Resumen`, que recalcula el flujo.
5. Se reemplaza la pantalla entera por el árbol nuevo.
6. Se revisan los efectos. Ninguna dependencia cambió: el reloj sigue andando y ningún contador se reinicia.

Dos cambios de estado en dos componentes distintos, un solo dibujo.

## El framework completo

Este es el framework tal como está en la página. Tiene dos agregados respecto de lo que vimos, que solo sirven para el panel lateral de la clase:

- `componenteActual` anota el nombre del componente que se está ejecutando, para mostrar en el panel a quién pertenece cada ranura.
- `alRenderizar` permite registrar una función que se llama al terminar cada dibujo con el número de dibujos y el arreglo `hooks`.

```js
const MiniReact = (() => {
  let componenteRaiz = null;     // la función App
  let contenedor = null;         // el nodo del DOM donde se dibuja
  const hooks = [];              // memoria que sobrevive entre renders
  let indice = 0;                // próxima ranura a usar en este render
  let componenteActual = null;   // solo para mostrar en el panel
  let efectosPendientes = [];    // efectos a correr después de dibujar
  let renderPendiente = false;   // ¿ya hay un render agendado?
  let cantidadRenders = 0;
  const oyentes = [];

  // ---------- Describir la interfaz ----------
  function createElement(tipo, props, ...hijos) {
    props = props ?? {};

    // Un componente es una función: la ejecutamos y devolvemos lo que dibuja.
    if (typeof tipo === "function") {
      const anterior = componenteActual;
      componenteActual = tipo.name;
      const resultado = tipo({ ...props, children: hijos });
      componenteActual = anterior;
      return resultado;
    }

    // Una etiqueta HTML: creamos el nodo real.
    const elemento = document.createElement(tipo);
    for (const [nombre, valor] of Object.entries(props)) {
      asignarPropiedad(elemento, nombre, valor);
    }
    for (const hijo of hijos.flat(Infinity)) {
      if (hijo === null || hijo === undefined || typeof hijo === "boolean") continue;
      elemento.append(hijo instanceof Node ? hijo : String(hijo));
    }
    return elemento;
  }

  function asignarPropiedad(elemento, nombre, valor) {
    if (nombre.startsWith("on") && typeof valor === "function") {
      elemento.addEventListener(nombre.slice(2).toLowerCase(), valor);
    } else if (nombre === "className") {
      elemento.className = valor;
    } else if (nombre === "style" && typeof valor === "object") {
      Object.assign(elemento.style, valor);
    } else if (typeof valor === "boolean") {
      elemento.toggleAttribute(nombre, valor);
    } else if (valor !== null && valor !== undefined) {
      elemento.setAttribute(nombre, valor);
    }
  }

  // ---------- Estado ----------
  function useState(valorInicial) {
    const i = indice++;
    if (hooks[i] === undefined) {
      hooks[i] = { tipo: "estado", componente: componenteActual, valor: valorInicial };
    }
    const ranura = hooks[i];

    function setValor(nuevoValor) {
      const valor = typeof nuevoValor === "function"
        ? nuevoValor(ranura.valor)
        : nuevoValor;
      if (Object.is(valor, ranura.valor)) return;   // no cambió: no hay nada que dibujar
      ranura.valor = valor;
      programarRender();
    }

    return [ranura.valor, setValor];
  }

  // ---------- Efectos ----------
  function useEffect(efecto, dependencias) {
    const i = indice++;
    const primeraVez = hooks[i] === undefined;
    if (primeraVez) {
      hooks[i] = { tipo: "efecto", componente: componenteActual, dependencias: undefined, limpieza: undefined };
    }
    const ranura = hooks[i];

    const cambiaron = primeraVez
      || dependencias === undefined
      || dependencias.some((dep, k) => !Object.is(dep, ranura.dependencias[k]));

    if (cambiaron) {
      ranura.dependencias = dependencias;
      efectosPendientes.push({ ranura, efecto });
    }
  }

  // ---------- Dibujar ----------
  function render(componente, elemento) {
    componenteRaiz = componente;
    contenedor = elemento;
    renderizar();
  }

  function programarRender() {
    if (renderPendiente) return;
    renderPendiente = true;
    queueMicrotask(renderizar);
  }

  function renderizar() {
    renderPendiente = false;
    indice = 0;

    // 1. Ejecutar todos los componentes y construir un DOM nuevo.
    const arbol = createElement(componenteRaiz);

    // 2. Tirar la pantalla anterior y poner la nueva.
    contenedor.replaceChildren(arbol);
    cantidadRenders++;

    // 3. Con la pantalla ya armada, correr los efectos.
    for (const { ranura, efecto } of efectosPendientes) {
      if (typeof ranura.limpieza === "function") ranura.limpieza();
      ranura.limpieza = efecto();
    }
    efectosPendientes = [];

    for (const oyente of oyentes) oyente({ renders: cantidadRenders, hooks });
  }

  // Instrumentación para la clase: avisa cada vez que termina un render.
  function alRenderizar(oyente) {
    oyentes.push(oyente);
  }

  return { createElement, useState, useEffect, render, alRenderizar };
})();
```

Todo el framework está envuelto en una función que se ejecuta en el acto. Las variables internas (`hooks`, `indice`, etc.) quedan encerradas en esa clausura, y desde afuera solo se ve lo que devuelve el `return`.

## Hasta dónde llega la reconstrucción total

Nuestro framework se comporta como React en lo esencial, pero la decisión de tirar todo y volver a construirlo tiene costos. Conviene verlos, porque son exactamente los problemas que resuelve el DOM virtual.

**Costo.** Con el reloj andando, la aplicación crea unos cuarenta nodos nuevos por segundo y descarta los anteriores. Para cuarenta nodos no se nota. Para una tabla de cinco mil filas, sí.

**Se pierde todo lo que el DOM recuerda por su cuenta.** Un nodo del DOM guarda cosas que no están en nuestro estado: si tiene el foco, dónde está el cursor dentro de un campo de texto, cuánto se desplazó una lista, en qué punto va una animación. Al reemplazar el nodo, todo eso se pierde. Si la aplicación tuviera un `<input>` controlado por estado (por ejemplo, para escribir el nombre de la esquina), cada tecla provocaría un dibujo, el campo se reemplazaría por uno nuevo y el usuario perdería el foco después de cada letra. Peor aún: con el reloj andando, perdería el foco una vez por segundo aunque no escribiera nada. React evita esto con la **reconciliación**: compara la descripción nueva con la anterior y modifica solo los nodos que cambiaron, dejando el resto intacto.

**El estado está atado a la posición.** Si los contadores aparecieran de forma condicional o se pudieran reordenar, las ranuras quedarían corridas y cada contador mostraría la cuenta de otro. React identifica cada componente por su tipo y su lugar en el árbol, y para las listas acepta una prop `key` que le dice cuál es cuál aunque cambien de orden.

**Nunca se desmonta nada.** Como el árbol siempre tiene la misma forma, ningún componente desaparece. Si desapareciera, sus ranuras quedarían huérfanas y la limpieza de sus efectos no se ejecutaría nunca. React lleva la cuenta de qué componentes dejaron de estar y limpia sus efectos.

**El orden de los efectos.** Nosotros ejecutamos los efectos en el orden en que se registraron, así que los del padre corren antes que los de los hijos. React los ejecuta al revés, de los hijos hacia el padre. En esta aplicación no cambia nada.

Estos límites son la motivación del paso siguiente: que `createElement` devuelva objetos en lugar de nodos, y que `render` compare el árbol de objetos nuevo con el anterior para decidir qué tocar en el DOM real.

## Otra forma de repartir el estado

En nuestra aplicación hay información duplicada: cada contador lleva su cuenta y el padre lleva el total. Se eligió así para mostrar cómo un cambio en el hijo provoca un cambio en el padre, pero conviene discutir la alternativa.

Se llama **levantar el estado**: las tres cuentas se guardan en el padre, y los contadores pasan a ser componentes sin estado que reciben su cantidad por props.

```js
function App() {
  const [conteos, setConteos] = useState({ Motos: 0, Autos: 0, Camionetas: 0 });

  function registrarVehiculo(nombre) {
    setConteos((c) => ({ ...c, [nombre]: c[nombre] + 1 }));
  }

  const total = Object.values(conteos).reduce((a, b) => a + b, 0);   // calculado, no guardado
  // ...
  // h(Contador, { nombre, cantidad: conteos[nombre], alRegistrar: () => registrarVehiculo(nombre) })
}
```

Con esta forma el total no se guarda, se calcula, y no puede quedar desincronizado con las cuentas. Reiniciar es asignar un objeto en cero, sin efecto en los hijos. A cambio, los contadores pierden autonomía: ya no se pueden usar en otra pantalla sin que alguien les lleve la cuenta.

La pregunta que guía la decisión es **quién necesita el dato**. Si solo lo usa un componente, que lo guarde él. Si lo usan varios, se guarda en el ancestro común más cercano y se reparte por props.

## La página de la clase

El archivo `mini-react-transito.html` tiene todo lo anterior en un solo archivo, sin dependencias externas. Además de la aplicación, incluye:

- un **panel lateral** que muestra el arreglo `hooks` en vivo, ranura por ranura, con el componente al que pertenece cada una y resaltadas en amarillo las que cambiaron en el último dibujo;
- un **contador de dibujos**, para ver que un clic en un contador produce un solo dibujo, y que iniciar una medición después de otra produce dos (el segundo, por el reinicio de los contadores);
- un **resaltado de componentes**: cada dibujo crea nodos nuevos, así que una animación CSS vuelve a arrancar en todos ellos y se ve cómo la pantalla entera se reconstruye una vez por segundo;
- el **código fuente** del framework y de la aplicación, leído de la misma página.
