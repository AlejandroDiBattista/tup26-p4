# Visor de contactos maestro-detalle con JavaScript puro

## DOM directo, componentes funcionales, Flexbox, filtrado y navegación con teclado

Este tutorial construye, paso a paso, una aplicación pequeña pero conceptualmente rica: un visor de contactos con estructura **maestro-detalle**.

La aplicación permitirá:

- escribir parte del nombre o del apellido;
- filtrar inmediatamente la lista maestra;
- seleccionar un contacto con el mouse;
- presionar `Enter` desde el buscador para entrar a la lista;
- recorrer los contactos con `↑` y `↓`;
- actualizar el detalle en cada cambio de selección;
- mantener visible el contacto seleccionado mediante scroll interno;
- presionar `Escape` para regresar al buscador;
- construir todos los elementos dinámicos como nodos DOM reales, sin `innerHTML`;
- organizar la interfaz mediante pequeñas funciones componente, como preparación conceptual para React.

El objetivo no es fabricar un React casero. El objetivo es comprender, desde primeros principios, qué problemas resuelve una biblioteca de interfaz y cómo puede organizarse una aplicación antes de utilizarla.

---

# 1. El problema completo

Queremos representar una colección de contactos almacenados como datos JSON.

Cada contacto tiene esta forma conceptual:

```js
{
  id: 10,
  nombre: "Juan",
  apellido: "Pérez",
  telefono: "381 555-1010",
  email: "juan.perez@example.com",
  ciudad: "Yerba Buena"
}
```

La pantalla tendrá dos regiones:

```text
┌─────────────────────────────────────────────────────────────┐
│                      VISOR DE CONTACTOS                     │
├──────────────────────┬──────────────────────────────────────┤
│ Buscar...            │                                      │
├──────────────────────┤                                      │
│ García Ana           │        Ana García                    │
│ Acosta Bruno         │                                      │
│ Medina Camila        │        Teléfono: ...                 │
│ Rodríguez Carlos     │        Correo: ...                   │
│ ...                  │        Ciudad: ...                   │
│                      │                                      │
├──────────────────────┤                                      │
│ Enter · ↑/↓ · Escape │                                      │
└──────────────────────┴──────────────────────────────────────┘
          MAESTRO                         DETALLE
```

Aunque la aplicación parece pequeña, contiene varios problemas distintos. Conviene separarlos antes de programar.

## 1.1. Áreas que debemos resolver

1. **Datos:** cómo representar y leer los contactos.
2. **Estructura:** qué partes del HTML son permanentes y cuáles se generan dinámicamente.
3. **Layout:** cómo distribuir maestro y detalle con Flexbox.
4. **Construcción del DOM:** cómo transformar un contacto en un árbol de nodos.
5. **Componentes:** cómo encapsular estructuras repetidas en funciones.
6. **Estado:** cómo recordar la lista filtrada y la selección actual.
7. **Renderizado:** cómo reflejar ese estado en maestro y detalle.
8. **Filtrado:** cómo recalcular los resultados mientras se escribe.
9. **Mouse:** cómo seleccionar un elemento aunque se reconstruya la lista.
10. **Teclado:** cómo coordinar foco, flechas, `Enter` y `Escape`.
11. **Scroll:** cómo mantener visible el elemento seleccionado sin calcular posiciones manualmente.

La estrategia será resolver cada área por separado y recién después conectarlas.

---

# 2. Primera decisión: separar lo permanente de lo dinámico

Una interfaz contiene partes que existen durante toda la vida de la aplicación y partes que dependen de los datos actuales.

En nuestro caso son permanentes:

- la cabecera;
- el buscador;
- el contenedor de la lista maestra;
- el contenedor del detalle;
- la ayuda de teclado.

Son dinámicos:

- los contactos que aparecen en la lista;
- cuál contacto está resaltado;
- el contenido del panel de detalle;
- la cantidad de resultados.

Por eso el HTML inicial no contiene cada contacto. Contiene solamente lugares donde JavaScript podrá colocarlos:

```html
<input id="buscar" type="search">

<div id="maestro" tabindex="0"></div>

<div id="detalle"></div>
```

Esto evita duplicar los datos en dos lugares. Si escribiéramos los contactos a mano en el HTML y también los tuviéramos en JSON, aparecerían inmediatamente problemas de sincronización.

La regla de diseño será:

```text
HTML estático  →  define regiones permanentes
JavaScript     →  construye lo que depende de los datos
CSS            →  decide distribución y aspecto
```

---

# 3. Construir el layout con Flexbox

El layout tiene dos niveles.

## 3.1. Primer Flexbox: cabecera y contenido

La aplicación completa se organiza verticalmente:

```text
cabecera
contenido
```

```css
.app {
  height: 100vh;
  display: flex;
  flex-direction: column;
}
```

`flex-direction: column` cambia el eje principal. Los hijos ya no quedan uno al lado del otro, sino uno debajo del otro.

La cabecera ocupa sólo lo que necesita. El contenido ocupa el resto:

```css
.cabecera {
  flex: 0 0 auto;
}

.layout {
  flex: 1 1 auto;
}
```

## 3.2. Segundo Flexbox: maestro y detalle

Dentro del contenido necesitamos una distribución horizontal:

```css
.layout {
  display: flex;
}
```

Como la dirección predeterminada de Flexbox es `row`, los paneles quedan uno al lado del otro.

Queremos aproximadamente un tercio para el maestro y dos tercios para el detalle:

```css
.panel-maestro {
  flex: 1;
}

.panel-detalle {
  flex: 2;
}
```

La relación es:

```text
maestro : detalle = 1 : 2
```

No estamos diciendo “300 píxeles y 600 píxeles”. Estamos indicando cómo repartir el espacio disponible.

---

# 4. El problema sutil del scroll dentro de Flexbox

La lista puede contener más contactos de los que entran en pantalla. Queremos que sólo la lista maestra tenga scroll, no toda la página.

Una primera aproximación parece suficiente:

```css
#maestro {
  overflow-y: auto;
}
```

Sin embargo, en un layout Flexbox puede ocurrir algo desconcertante: el elemento crece para alojar todo su contenido y el scroll aparece fuera del lugar esperado, o directamente no aparece.

## 4.1. Por qué sucede

Los hijos de un contenedor flex tienen, de manera predeterminada, un tamaño mínimo automático relacionado con su contenido. En términos prácticos, pueden “negarse” a encogerse por debajo de lo que necesitan sus hijos.

Para que una región flexible acepte reducirse y deje que `overflow-y: auto` haga su trabajo, usamos:

```css
.layout {
  min-height: 0;
}

.panel-maestro {
  min-height: 0;
}

#maestro {
  flex: 1;
  min-height: 0;
  overflow-y: auto;
}
```

La combinación tiene una lógica precisa:

- `flex: 1` hace que la lista ocupe el espacio vertical restante;
- `min-height: 0` permite que se reduzca;
- `overflow-y: auto` crea scroll únicamente cuando hace falta.

Éste es uno de los puntos más importantes del CSS. No es un truco decorativo: resuelve una tensión entre el algoritmo de Flexbox y el desbordamiento interno.

---

# 5. Incorporar los datos JSON

Como queremos un único archivo HTML autocontenido, podemos guardar el JSON dentro de un bloque `script` que no se ejecuta:

```html
<script id="datos-contactos" type="application/json">
[
  {
    "id": 1,
    "nombre": "Ana",
    "apellido": "García",
    "telefono": "381 555-1001"
  }
]
</script>
```

El atributo:

```html
type="application/json"
```

le informa al navegador que ese contenido no es código JavaScript ejecutable.

Luego lo leemos y convertimos:

```js
const contactos = JSON.parse(
  document.querySelector("#datos-contactos").textContent
);
```

Hay dos transformaciones:

```text
texto JSON
    │
    │ JSON.parse(...)
    ▼
Array de objetos JavaScript
```

En una aplicación real, el JSON podría estar en otro archivo:

```js
const respuesta = await fetch("contactos.json");
const contactos = await respuesta.json();
```

El resto de la aplicación no debería cambiar. Ésa es una buena señal de diseño: la interfaz consume un array de objetos y no necesita saber si provino de un bloque embebido, un archivo o una API.

---

# 6. Antes de abstraer: construir un contacto manualmente

Supongamos que cada elemento del maestro debe tener esta estructura:

```html
<div class="contacto">
  <strong>Pérez</strong>
  <span>Juan</span>
</div>
```

Podemos construirla directamente con la API DOM:

```js
function crearContacto(contacto) {
  const item = document.createElement("div");
  item.setAttribute("class", "contacto");

  const apellido = document.createElement("strong");
  apellido.append(contacto.apellido);

  const nombre = document.createElement("span");
  nombre.append(contacto.nombre);

  item.append(apellido, nombre);

  return item;
}
```

Esto es importante porque muestra lo que realmente existe en el navegador.

La función no devuelve un string. Devuelve un objeto DOM:

```text
HTMLDivElement
  ├── HTMLElement <strong>
  │      └── Text "Pérez"
  └── HTMLElement <span>
         └── Text "Juan"
```

## 6.1. Aclaración: `innerHTML`, `innerText` y `textContent`

Conviene distinguir conceptos:

- `innerHTML` recibe un string y lo interpreta como marcado HTML;
- `innerText` o `textContent` reemplazan texto, no construyen una estructura HTML compleja;
- `document.createElement`, `append` y `replaceChildren` trabajan directamente con nodos.

En este tutorial evitamos `innerHTML`. Para contenido textual simple, usar `textContent` no sería incorrecto; pero para el árbol dinámico queremos observar explícitamente la creación de nodos.

## 6.2. El problema que aparece

El código manual es claro, pero repetitivo:

```js
document.createElement(...)
setAttribute(...)
append(...)
```

A medida que la estructura crece, la intención visual queda enterrada debajo de instrucciones mecánicas.

Ese problema justifica nuestra siguiente abstracción.

---

# 7. Crear una función `h()` para construir nodos

Vamos a crear una pequeña función con esta forma:

```js
h(tipo, atributos, ...hijos)
```

Por ejemplo:

```js
h("strong", {}, "Pérez")
```

producirá un nodo equivalente a:

```html
<strong>Pérez</strong>
```

Una primera versión puede ser:

```js
function h(tipo, atributos = {}, ...hijos) {
  const elemento = document.createElement(tipo);

  for (const [nombre, valor] of Object.entries(atributos)) {
    elemento.setAttribute(nombre, String(valor));
  }

  elemento.append(...hijos);

  return elemento;
}
```

Ahora el contacto puede describirse así:

```js
function crearContacto(contacto) {
  return h(
    "div",
    { class: "contacto" },
    h("strong", {}, contacto.apellido),
    h("span", {}, contacto.nombre)
  );
}
```

La función sigue creando DOM real, pero el código se parece más a la estructura resultante.

```text
h("div", ...)
  ├── h("strong", ..., apellido)
  └── h("span", ..., nombre)
```

## 7.1. Por qué usamos `append`

`append` acepta tanto nodos como valores textuales:

```js
elemento.append(nodo, "texto", otroNodo);
```

Cuando recibe un string, el navegador crea un nodo de texto. No interpreta ese string como HTML.

Esto significa que un apellido como:

```text
<script>alert("hola")</script>
```

se mostraría como texto y no se ejecutaría. Ésta es una diferencia importante respecto de interpolar datos sin control dentro de `innerHTML`.

## 7.2. Aplanar grupos de hijos

En la versión final permitiremos que los hijos lleguen agrupados en arrays:

```js
const hijosPlanos = hijos
  .flat(Infinity)
  .filter(hijo => hijo !== null && hijo !== undefined && hijo !== false);
```

Esto hace que `h()` tolere resultados opcionales y listas de nodos sin agregar complejidad a cada componente.

---

# 8. Convertir funciones en componentes

Hasta ahora `h()` sabe crear etiquetas HTML. Queremos que también pueda ejecutar una función componente.

La regla será:

```text
si tipo es un string   → document.createElement(tipo)
si tipo es una función → tipo(props)
```

La extensión es mínima:

```js
function h(tipo, atributos = {}, ...hijos) {
  if (typeof tipo === "function") {
    return tipo({ ...atributos, hijos });
  }

  const elemento = document.createElement(tipo);

  for (const [nombre, valor] of Object.entries(atributos)) {
    if (valor !== null && valor !== undefined) {
      elemento.setAttribute(nombre, String(valor));
    }
  }

  elemento.append(...hijos.flat(Infinity));
  return elemento;
}
```

Ahora podemos definir:

```js
function Contacto({ contacto, seleccionado }) {
  return h(
    "div",
    {
      class: seleccionado
        ? "contacto seleccionado"
        : "contacto"
    },
    h("strong", {}, contacto.apellido),
    h("span", {}, contacto.nombre)
  );
}
```

Y utilizarlo de este modo:

```js
h(Contacto, {
  contacto,
  seleccionado: true
});
```

## 8.1. Definición pedagógica de componente

En esta aplicación, un componente es simplemente:

```text
función(datos) → nodo DOM
```

No tiene estado privado, ciclo de vida, hooks ni reconciliación. Es sólo una función que encapsula una estructura visual.

## 8.2. Composición de componentes

El detalle repite la misma estructura para teléfono, correo y ciudad:

```text
ETIQUETA
valor
```

La convertimos en un componente:

```js
function Campo({ etiqueta, valor }) {
  return h(
    "div",
    { class: "campo" },
    h("span", { class: "etiqueta" }, etiqueta),
    h("span", { class: "valor" }, valor)
  );
}
```

Después `Detalle` puede utilizar `Campo`:

```js
function Detalle({ contacto }) {
  return h(
    "article",
    { class: "detalle" },
    h("h2", {}, `${contacto.nombre} ${contacto.apellido}`),
    h(Campo, { etiqueta: "Teléfono", valor: contacto.telefono }),
    h(Campo, { etiqueta: "Correo", valor: contacto.email })
  );
}
```

Aquí aparece la idea central:

> Un componente puede construir su interfaz utilizando componentes más pequeños.

---

# 9. Diseñar el estado mínimo

La aplicación necesita recordar dos cosas:

```js
let filtrados = contactos;
let seleccion = 0;
```

`filtrados` contiene la lista visible. `seleccion` indica la posición del contacto activo dentro de esa lista.

Si tenemos:

```text
filtrados[0] = Ana García
filtrados[1] = María López
filtrados[2] = Juan Pérez
```

entonces:

```js
seleccion = 2;
```

significa que Juan está seleccionado.

## 9.1. Índice e identificador no son lo mismo

Es importante no confundir:

```js
seleccion       // posición dentro de filtrados
contacto.id     // identidad estable del contacto
```

Un contacto puede tener `id: 47` y estar en la posición `1` de la lista filtrada.

Para movernos con flechas, el índice es muy cómodo porque las operaciones son:

```js
seleccion + 1
seleccion - 1
```

Para identificar un contacto fuera del orden de la lista, su `id` es mejor.

## 9.2. Invariantes del estado

Mientras haya resultados, queremos que siempre se cumpla:

```text
0 ≤ seleccion < filtrados.length
```

Si no hay resultados:

```js
seleccion = -1;
```

Esta convención permite obtener el contacto actual de manera segura:

```js
function contactoSeleccionado() {
  return filtrados[seleccion] ?? null;
}
```

Si el índice no existe, el resultado será `null`.

---

# 10. El renderizado como transformación del estado

La interfaz debería ser una representación del estado actual:

```text
filtrados + seleccion
          │
          ▼
       render()
       /      \
      ▼        ▼
 maestro     detalle
```

Dividimos el trabajo:

```js
function render() {
  renderMaestro();
  renderDetalle();
  renderContador();
}
```

## 10.1. Renderizar el maestro

Cada contacto filtrado se transforma en un componente:

```js
const nodos = filtrados.map((contacto, indice) =>
  h(Contacto, {
    contacto,
    indice,
    seleccionado: indice === seleccion
  })
);
```

El flujo es:

```text
Array de objetos
      │ map(...)
      ▼
Array de nodos DOM
```

Luego reemplazamos los hijos actuales de la lista:

```js
maestro.replaceChildren(...nodos);
```

`replaceChildren` expresa exactamente la política elegida:

> La lista visible anterior deja de ser válida. Sustituirla por la representación del estado actual.

No intentamos descubrir qué nodo cambió. Para una lista pequeña, reconstruirla es simple, predecible y suficiente.

## 10.2. Renderizar el detalle

El panel derecho depende exclusivamente del contacto seleccionado:

```js
function renderDetalle() {
  detalle.replaceChildren(
    h(Detalle, { contacto: contactoSeleccionado() })
  );
}
```

El detalle no sabe qué tecla se presionó, ni cómo se filtró la lista. Sólo recibe un contacto y lo representa.

Ésta es una separación valiosa:

```text
eventos modifican estado
componentes representan estado
```

## 10.3. ¿Por qué el foco no se pierde al renderizar?

Reconstruimos los hijos de `#maestro`, pero no reemplazamos el contenedor `#maestro`.

El foco está en el contenedor:

```html
<div id="maestro" tabindex="0"></div>
```

Por eso puede conservarse aunque sus contactos internos sean sustituidos.

Esta decisión simplifica mucho el teclado.

---

# 11. Implementar el filtrado incremental

El evento adecuado es `input`:

```js
buscar.addEventListener("input", aplicarFiltro);
```

`input` se dispara cada vez que cambia el valor, ya sea por teclado, pegado, borrado o dictado.

La función toma el criterio y filtra los datos originales:

```js
function aplicarFiltro() {
  const criterio = buscar.value.toLowerCase();

  filtrados = contactos.filter(contacto => {
    const nombreCompleto = `${contacto.nombre} ${contacto.apellido}`;
    return nombreCompleto.toLowerCase().includes(criterio);
  });

  seleccion = filtrados.length > 0 ? 0 : -1;
  render();
}
```

## 11.1. El problema de los acentos

Con una comparación directa:

```text
alvarez ≠ Álvarez
```

Para que la búsqueda resulte más natural, normalizamos ambos textos:

```js
function normalizar(texto) {
  return texto
    .toLocaleLowerCase("es")
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "");
}
```

El proceso es:

```text
"Álvarez"
    ↓ minúsculas
"álvarez"
    ↓ descomposición Unicode NFD
"a◌́lvarez"
    ↓ eliminar marcas diacríticas
"alvarez"
```

Entonces filtramos así:

```js
const criterio = normalizar(buscar.value.trim());

filtrados = contactos.filter(contacto => {
  const nombreCompleto = `${contacto.nombre} ${contacto.apellido}`;
  return normalizar(nombreCompleto).includes(criterio);
});
```

## 11.2. Qué hacer con la selección al cambiar el filtro

Hay varias políticas posibles:

- conservar el contacto anterior si todavía aparece;
- elegir el contacto más cercano;
- seleccionar siempre el primer resultado.

Para una primera versión elegimos la más fácil de explicar:

```js
seleccion = filtrados.length > 0 ? 0 : -1;
```

Cada búsqueda nueva comienza en el primer resultado.

No es la única decisión válida, pero es explícita y predecible.

---

# 12. Selección con mouse y delegación de eventos

Podríamos agregar un listener a cada contacto durante su creación. Pero como la lista se reconstruye después de cada filtro o movimiento, esos nodos desaparecen y son reemplazados.

Una solución más estable es colocar un único listener en el contenedor permanente:

```js
maestro.addEventListener("click", evento => {
  const item = evento.target.closest(".contacto");

  if (!item || !maestro.contains(item)) return;

  seleccion = Number(item.dataset.indice);
  render();
});
```

## 12.1. Por qué usamos `closest`

El usuario puede hacer clic sobre:

```html
<strong>Pérez</strong>
```

o sobre:

```html
<span>Juan</span>
```

En ese caso, `evento.target` no es el `div.contacto`. Es el nodo interno pulsado.

```js
evento.target.closest(".contacto")
```

sube por el árbol hasta encontrar el contacto correspondiente.

## 12.2. Cómo sabe cada nodo qué índice representa

Al construir el componente guardamos el índice en un atributo `data-*`:

```js
{
  "data-indice": indice
}
```

El resultado será:

```html
<div class="contacto" data-indice="3">
```

Y puede recuperarse con:

```js
item.dataset.indice
```

Los valores de `dataset` son strings, por eso convertimos:

```js
Number(item.dataset.indice)
```

## 12.3. Mantener la continuidad con el teclado

Después del clic enfocamos el maestro:

```js
maestro.focus({ preventScroll: true });
```

Así el usuario puede seleccionar con el mouse y continuar inmediatamente con las flechas.

---

# 13. El foco como parte del modelo de interacción

El teclado sólo tiene sentido si sabemos qué región lo está recibiendo.

La dinámica deseada es:

```text
BUSCADOR
   │ Enter
   ▼
MAESTRO
   │ ↑ / ↓
   ├──────────► cambia selección y detalle
   │ Escape
   ▼
BUSCADOR
```

## 13.1. Hacer enfocable el maestro

Un `div` común no entra en el sistema de foco. Lo habilitamos con:

```html
<div id="maestro" tabindex="0"></div>
```

`tabindex="0"` significa que puede recibir foco y que participa en el orden normal de tabulación.

No necesitamos hacer enfocable cada contacto. El foco permanece en la región maestra y la selección interna se representa con nuestra variable `seleccion`.

Esta técnica se parece al patrón de una lista activa: existe un foco real en el contenedor y una selección lógica dentro de él.

---

# 14. Entrar al maestro con `Enter`

Escuchamos el teclado del buscador:

```js
buscar.addEventListener("keydown", evento => {
  if (evento.key === "Enter" && filtrados.length > 0) {
    evento.preventDefault();
    maestro.focus();
  }
});
```

Comprobamos que haya resultados. No tendría sentido entrar a una lista vacía para recorrer elementos inexistentes.

Usamos `keydown` porque queremos reaccionar en el momento en que se presiona la tecla.

`preventDefault()` evita comportamientos predeterminados que podrían aparecer si el buscador formara parte de un formulario.

---

# 15. Mover la selección con flechas

Primero encapsulamos el cálculo:

```js
function moverSeleccion(desplazamiento) {
  if (filtrados.length === 0) return;

  const ultimoIndice = filtrados.length - 1;

  const nuevaSeleccion = Math.max(
    0,
    Math.min(seleccion + desplazamiento, ultimoIndice)
  );

  if (nuevaSeleccion === seleccion) return;

  seleccion = nuevaSeleccion;
  render();
}
```

Para bajar:

```js
moverSeleccion(1);
```

Para subir:

```js
moverSeleccion(-1);
```

## 15.1. Acotar el índice

Si estamos en el primer elemento y subimos, no queremos obtener `-1`.

Si estamos en el último y bajamos, no queremos salir del array.

La combinación:

```js
Math.max(0, Math.min(valor, ultimoIndice))
```

acota el valor entre dos límites.

Podemos leerla como:

```text
no menor que 0
no mayor que el último índice
```

## 15.2. Capturar las teclas

```js
maestro.addEventListener("keydown", evento => {
  if (evento.key === "ArrowDown") {
    evento.preventDefault();
    moverSeleccion(1);
  }

  if (evento.key === "ArrowUp") {
    evento.preventDefault();
    moverSeleccion(-1);
  }
});
```

Aquí `preventDefault()` es indispensable. Las flechas tienen un comportamiento nativo de scroll. Sin impedirlo, podríamos tener dos movimientos simultáneos:

- nuestra selección cambia;
- el navegador también desplaza el contenedor por su cuenta.

Queremos que el movimiento visual sea consecuencia de la selección, no de dos mecanismos compitiendo.

---

# 16. Regresar al buscador con `Escape`

La implementación es directa:

```js
if (evento.key === "Escape") {
  evento.preventDefault();
  buscar.focus();
}
```

No necesitamos una variable como:

```js
let modo = "busqueda";
```

El propio foco del navegador ya representa qué región está activa.

Ésta es una buena regla de simplicidad:

> No dupliquemos en nuestro estado algo que el navegador ya conoce y administra correctamente.

---

# 17. Mantener visible la selección

El panel maestro puede contener muchos contactos. Cuando la selección baja fuera del área visible, necesitamos ajustar el scroll.

Podríamos calcular:

- altura de cada fila;
- posición superior;
- posición inferior;
- `scrollTop` necesario.

Eso sería frágil e innecesario.

Después de renderizar, buscamos el nodo seleccionado:

```js
const seleccionado = maestro.querySelector(".seleccionado");
```

Y pedimos al navegador:

```js
seleccionado?.scrollIntoView({ block: "nearest" });
```

`block: "nearest"` significa:

> Desplazar sólo lo mínimo necesario para que el elemento quede visible.

Si ya está visible, no se mueve nada. Si quedó por debajo, la lista baja. Si quedó por encima, la lista sube.

## 17.1. Relación entre CSS y JavaScript

El scroll funciona porque ambas partes colaboran:

```text
CSS
  #maestro tiene una altura limitada y overflow-y: auto

JavaScript
  scrollIntoView mantiene visible el elemento seleccionado
```

JavaScript no crea el scroll. El CSS crea una región desplazable. JavaScript sólo solicita que un nodo quede dentro de la ventana visible de esa región.

---

# 18. Renderizado completo frente a actualización incremental

Cada vez que cambia la selección hacemos:

```js
maestro.replaceChildren(...nodos);
```

Eso reconstruye todos los elementos visibles.

¿Es la estrategia más eficiente posible? No.

¿Es adecuada para una lista pequeña y una clase introductoria? Sí.

Nos permite mantener una regla extremadamente clara:

```text
cambia el estado
      ↓
se vuelve a representar la interfaz
```

Más adelante React introducirá una maquinaria de reconciliación para comparar representaciones y aplicar al DOM sólo los cambios necesarios.

En este ejemplo deliberadamente no hacemos eso. La reconstrucción total deja visible el problema que una biblioteca resolverá después.

---

# 19. Recorrido completo de una interacción

Supongamos que el usuario escribe:

```text
lo
```

## Paso 1: ocurre `input`

```js
aplicarFiltro();
```

## Paso 2: se obtiene el criterio normalizado

```text
"lo"
```

## Paso 3: se filtran los contactos originales

Podrían quedar:

```text
Inés López
María López
```

## Paso 4: se reinicia la selección

```js
seleccion = 0;
```

## Paso 5: se llama a `render()`

```text
renderMaestro()
renderDetalle()
renderContador()
```

## Paso 6: el maestro crea dos componentes

```text
Contacto(Inés López, seleccionado = true)
Contacto(María López, seleccionado = false)
```

## Paso 7: el detalle recibe el primer contacto

```text
Detalle(Inés López)
```

## Paso 8: el usuario presiona `Enter`

```js
maestro.focus();
```

## Paso 9: presiona `ArrowDown`

```js
moverSeleccion(1);
```

Ahora:

```js
seleccion = 1;
```

## Paso 10: se vuelve a renderizar

María queda resaltada, el detalle muestra a María y `scrollIntoView` garantiza que su fila permanezca visible.

Toda la interacción se reduce a una idea:

```text
evento → modifica estado → renderiza
```

---

# 20. Cómo conecta este ejemplo con React

Nuestra función:

```js
h(
  "div",
  { class: "contacto" },
  h("strong", {}, contacto.apellido),
  h("span", {}, contacto.nombre)
)
```

se parece conceptualmente a:

```jsx
<div className="contacto">
  <strong>{contacto.apellido}</strong>
  <span>{contacto.nombre}</span>
</div>
```

Y nuestro componente:

```js
function Contacto({ contacto }) {
  return h(...);
}
```

se parece a:

```jsx
function Contacto({ contacto }) {
  return (...);
}
```

Pero hay diferencias fundamentales.

## 20.1. Nuestra implementación

- `h()` crea nodos DOM reales inmediatamente;
- el componente devuelve un nodo real;
- `render()` reemplaza nodos manualmente;
- las variables de estado son variables JavaScript comunes;
- nosotros decidimos cuándo volver a renderizar;
- no existe reconciliación.

## 20.2. React

- JSX produce descripciones de elementos React, no nodos DOM directos;
- React administra el proceso de renderizado;
- el estado utiliza mecanismos específicos;
- React vuelve a ejecutar componentes cuando corresponde;
- compara representaciones y actualiza el DOM;
- administra composición, eventos, efectos y ciclo de vida.

La transición pedagógica puede formularse así:

> Primero construimos nodos y administramos actualizaciones a mano. Luego utilizaremos React para describir la interfaz y delegar la actualización eficiente del DOM.

---

# 21. Errores frecuentes y qué enseñan

## 21.1. Usar `evento.target.dataset.indice`

Puede fallar si se hace clic sobre `strong` o `span`, porque esos nodos no tienen el atributo.

Solución:

```js
const item = evento.target.closest(".contacto");
```

## 21.2. Confundir `id` con índice

Esto es incorrecto:

```js
seleccion = contacto.id;
```

si `seleccion` se utiliza después para acceder a:

```js
filtrados[seleccion]
```

El id no representa una posición.

## 21.3. No reiniciar la selección después del filtro

Si había 18 contactos y estaba seleccionado el índice 15, después de filtrar podrían quedar sólo dos. El índice 15 ya no existe.

Solución simple:

```js
seleccion = filtrados.length > 0 ? 0 : -1;
```

## 21.4. Olvidar `preventDefault()` en las flechas

La selección cambia, pero además el navegador desplaza nativamente la región. El resultado puede sentirse errático.

## 21.5. Colocar el scroll en toda la página

Si no limitamos la altura de la lista, el documento completo crece. La cabecera y el buscador desaparecen al desplazarse.

La solución es construir una cadena de contenedores flexibles con `min-height: 0` y colocar `overflow-y: auto` exactamente en `#maestro`.

## 21.6. Agregar listeners a cada fila y luego reemplazar las filas

Los listeners pertenecen a nodos concretos. Cuando `replaceChildren` elimina esos nodos, también desaparecen sus listeners.

La delegación de eventos evita ese problema porque el listener vive en el contenedor permanente.

## 21.7. Reemplazar también el contenedor maestro

Si se reemplaza `#maestro`, se pierde el foco. Al mantener el contenedor y reemplazar sólo sus hijos, la navegación resulta mucho más sencilla.

---

# 22. Secuencia sugerida para dictar la clase

La aplicación conviene construirla en incrementos ejecutables.

## Etapa 1: layout estático

Mostrar únicamente:

- cabecera;
- panel maestro;
- panel detalle;
- Flexbox 1:2.

Objetivo: entender la estructura visual.

## Etapa 2: un contacto creado manualmente

Usar `document.createElement` y `append`.

Objetivo: observar que el DOM es un árbol de objetos.

## Etapa 3: función `h()`

Reescribir el mismo contacto con `h()`.

Objetivo: separar intención estructural de mecánica repetitiva.

## Etapa 4: componente `Contacto`

Convertir la construcción en una función que recibe datos.

Objetivo: introducir `función(datos) → interfaz`.

## Etapa 5: lista con `map`

```js
filtrados.map(contacto => h(Contacto, { contacto }))
```

Objetivo: transformar datos en nodos.

## Etapa 6: selección y detalle

Agregar `seleccion`, `Detalle` y `render()`.

Objetivo: introducir estado y representación.

## Etapa 7: filtrado

Agregar `input`, `filter` y normalización.

Objetivo: mostrar que los datos derivados también forman parte del estado visible.

## Etapa 8: mouse con delegación

Objetivo: comprender propagación de eventos y nodos reconstruidos.

## Etapa 9: teclado y foco

Agregar `tabindex`, `Enter`, flechas y `Escape`.

Objetivo: distinguir foco real de selección lógica.

## Etapa 10: scroll

Agregar `overflow-y: auto`, `min-height: 0` y `scrollIntoView`.

Objetivo: hacer cooperar layout e interacción.

---

# 23. Ejercicios de ampliación

Una vez terminada la versión base, pueden proponerse extensiones graduales.

## Ejercicio 1: conservar la selección durante el filtro

En lugar de seleccionar siempre el primer resultado, guardar el id anterior y buscarlo en la nueva lista.

## Ejercicio 2: teclas `Home` y `End`

- `Home`: seleccionar el primer contacto;
- `End`: seleccionar el último.

## Ejercicio 3: búsqueda por teléfono y ciudad

Construir un texto de búsqueda más amplio:

```js
const texto = `
  ${contacto.nombre}
  ${contacto.apellido}
  ${contacto.telefono}
  ${contacto.ciudad}
`;
```

## Ejercicio 4: editar el contacto

Reemplazar el detalle de sólo lectura por un formulario.

## Ejercicio 5: agregar un nuevo contacto

Incorporar un formulario y producir un nuevo array sin mutar el anterior.

## Ejercicio 6: persistencia

Guardar los contactos en `localStorage` y recuperarlos al iniciar.

## Ejercicio 7: migración a React

Reimplementar `Contacto`, `Campo` y `Detalle` con JSX y comparar qué responsabilidades desaparecen del código propio.

---

# 24. Código completo autocontenido

Guardá el siguiente contenido como:

```text
visor-contactos-dom-componentes.html
```

Luego abrilo directamente en el navegador.

```html
<!DOCTYPE html>
<html lang="es">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Visor de contactos</title>

  <style>
    /* ============================================================
       1. REGLAS GENERALES
       ============================================================ */

    * {
      box-sizing: border-box;
    }

    html,
    body {
      height: 100%;
    }

    body {
      margin: 0;
      font-family: system-ui, -apple-system, BlinkMacSystemFont, "Segoe UI", sans-serif;
      color: #1f2937;
      background: #eef1f5;
    }

    input {
      font: inherit;
    }

    /* ============================================================
       2. ESTRUCTURA GENERAL

       .app organiza la pantalla verticalmente:

         cabecera
         contenido

       El contenido, a su vez, tendrá otro Flexbox horizontal para
       construir la estructura maestro-detalle.
       ============================================================ */

    .app {
      height: 100vh;
      height: 100dvh;
      display: flex;
      flex-direction: column;
      overflow: hidden;
    }

    .cabecera {
      flex: 0 0 auto;
      display: flex;
      align-items: center;
      justify-content: space-between;
      gap: 1rem;
      padding: 1rem 1.25rem;
      color: white;
      background: #172033;
    }

    .cabecera h1 {
      margin: 0;
      font-size: 1.35rem;
    }

    .sobrelinea {
      margin: 0 0 0.15rem;
      color: #b9c4d8;
      font-size: 0.75rem;
      font-weight: 700;
      letter-spacing: 0.08em;
      text-transform: uppercase;
    }

    .contador {
      flex: 0 0 auto;
      padding: 0.35rem 0.65rem;
      border: 1px solid #52617b;
      border-radius: 999px;
      color: #dce5f4;
      font-size: 0.82rem;
    }

    /* ============================================================
       3. LAYOUT MAESTRO-DETALLE

       .layout es el Flexbox horizontal principal:

         maestro : detalle = 1 : 2

       min-height: 0 es fundamental. Sin esa regla, un hijo flex
       puede negarse a reducir su altura y el scroll interno de la
       lista puede no funcionar como esperamos.
       ============================================================ */

    .layout {
      flex: 1 1 auto;
      min-height: 0;
      display: flex;
    }

    .panel-maestro {
      flex: 1 1 33.333%;
      min-width: 280px;
      max-width: 440px;
      min-height: 0;
      display: flex;
      flex-direction: column;
      background: white;
      border-right: 1px solid #d8dee9;
    }

    .panel-detalle {
      flex: 2 1 66.667%;
      min-width: 0;
      overflow-y: auto;
      display: flex;
      align-items: flex-start;
      justify-content: center;
      padding: clamp(1rem, 4vw, 3rem);
    }

    /* ============================================================
       4. BÚSQUEDA
       ============================================================ */

    .busqueda {
      flex: 0 0 auto;
      padding: 1rem;
      border-bottom: 1px solid #e5e9f0;
    }

    .busqueda label {
      display: block;
      margin-bottom: 0.4rem;
      font-size: 0.82rem;
      font-weight: 700;
    }

    #buscar {
      width: 100%;
      padding: 0.72rem 0.8rem;
      border: 1px solid #b8c1d1;
      border-radius: 0.5rem;
      outline: none;
      background: white;
    }

    #buscar:focus {
      border-color: #315efb;
      box-shadow: 0 0 0 3px rgb(49 94 251 / 15%);
    }

    /* ============================================================
       5. LISTA MAESTRA Y SCROLL INTERNO

       flex: 1 hace que la lista ocupe todo el alto libre del panel.
       min-height: 0 le permite encogerse.
       overflow-y: auto coloca el scroll dentro de la lista.
       ============================================================ */

    #maestro {
      flex: 1 1 auto;
      min-height: 0;
      overflow-y: auto;
      outline: none;
      background: white;
    }

    #maestro:focus-visible {
      box-shadow: inset 0 0 0 3px rgb(49 94 251 / 50%);
    }

    .contacto {
      display: flex;
      align-items: baseline;
      gap: 0.38rem;
      padding: 0.85rem 1rem;
      border-bottom: 1px solid #edf0f5;
      cursor: pointer;
      user-select: none;
    }

    .contacto:hover {
      background: #f5f7fb;
    }

    .contacto.seleccionado {
      color: #10235c;
      background: #e9efff;
      box-shadow: inset 4px 0 0 #315efb;
    }

    .contacto strong {
      font-weight: 750;
    }

    .contacto span {
      color: #586174;
    }

    .contacto.seleccionado span {
      color: inherit;
    }

    .lista-vacia {
      margin: 0;
      padding: 2rem 1rem;
      color: #747d90;
      text-align: center;
    }

    .ayuda {
      flex: 0 0 auto;
      margin: 0;
      padding: 0.65rem 1rem;
      border-top: 1px solid #e5e9f0;
      color: #70798c;
      background: #fafbfc;
      font-size: 0.76rem;
    }

    /* ============================================================
       6. DETALLE
       ============================================================ */

    .detalle {
      width: min(100%, 680px);
      padding: clamp(1.25rem, 3vw, 2rem);
      border: 1px solid #dce2ec;
      border-radius: 0.9rem;
      background: white;
      box-shadow: 0 16px 40px rgb(34 47 73 / 10%);
    }

    .detalle .subtitulo {
      margin: 0 0 0.35rem;
      color: #667085;
      font-size: 0.78rem;
      font-weight: 700;
      letter-spacing: 0.06em;
      text-transform: uppercase;
    }

    .detalle h2 {
      margin: 0 0 1.5rem;
      color: #182033;
      font-size: clamp(1.6rem, 4vw, 2.25rem);
    }

    .campos {
      display: grid;
      grid-template-columns: repeat(2, minmax(0, 1fr));
      gap: 1rem;
    }

    .campo {
      min-width: 0;
      padding: 0.9rem;
      border: 1px solid #e4e8ef;
      border-radius: 0.65rem;
      background: #fafbfc;
    }

    .campo .etiqueta {
      display: block;
      margin-bottom: 0.3rem;
      color: #7a8497;
      font-size: 0.72rem;
      font-weight: 700;
      letter-spacing: 0.06em;
      text-transform: uppercase;
    }

    .campo .valor {
      display: block;
      overflow-wrap: anywhere;
      color: #283044;
    }

    .detalle-vacio {
      color: #737c8f;
      text-align: center;
    }

    .detalle-vacio h2 {
      margin-bottom: 0.5rem;
      font-size: 1.35rem;
    }

    .detalle-vacio p {
      margin: 0;
    }

    /* ============================================================
       7. ADAPTACIÓN A PANTALLAS ESTRECHAS

       Seguimos usando Flexbox, pero cambiamos su dirección.
       ============================================================ */

    @media (max-width: 760px) {
      .layout {
        flex-direction: column;
      }

      .panel-maestro {
        flex: 0 0 48%;
        width: 100%;
        min-width: 0;
        max-width: none;
        border-right: 0;
        border-bottom: 1px solid #d8dee9;
      }

      .panel-detalle {
        flex: 1 1 52%;
      }

      .campos {
        grid-template-columns: 1fr;
      }
    }
  </style>
</head>

<body>
  <!-- ==========================================================
       ESTRUCTURA ESTÁTICA

       El HTML define solamente las regiones permanentes.
       Los contactos y el detalle se crearán desde JavaScript.
       ========================================================== -->

  <div class="app">
    <header class="cabecera">
      <div>
        <p class="sobrelinea">JavaScript puro</p>
        <h1>Visor de contactos</h1>
      </div>

      <div id="contador" class="contador"></div>
    </header>

    <main class="layout">
      <aside class="panel-maestro" aria-label="Maestro de contactos">
        <div class="busqueda">
          <label for="buscar">Buscar contacto</label>
          <input
            id="buscar"
            type="search"
            placeholder="Nombre o apellido..."
            autocomplete="off"
            aria-controls="maestro"
          >
        </div>

        <!-- tabindex="0" permite que el contenedor reciba foco. -->
        <div
          id="maestro"
          tabindex="0"
          role="listbox"
          aria-label="Resultados de contactos"
        ></div>

        <p class="ayuda">
          Enter: entrar a la lista · ↑/↓: recorrer · Escape: volver a buscar
        </p>
      </aside>

      <section class="panel-detalle" aria-label="Detalle del contacto">
        <div id="detalle"></div>
      </section>
    </main>
  </div>

  <!-- ==========================================================
       DATOS JSON EMBEBIDOS

       type="application/json" evita que el navegador intente
       ejecutar este bloque como JavaScript. Luego lo leeremos como
       texto y lo convertiremos con JSON.parse().
       ========================================================== -->

  <script id="datos-contactos" type="application/json">
  [
    {"id": 1,  "nombre": "Ana",       "apellido": "García",     "telefono": "381 555-1001", "email": "ana.garcia@example.com",       "ciudad": "San Miguel de Tucumán"},
    {"id": 2,  "nombre": "Bruno",     "apellido": "Acosta",     "telefono": "381 555-1002", "email": "bruno.acosta@example.com",     "ciudad": "Yerba Buena"},
    {"id": 3,  "nombre": "Camila",    "apellido": "Medina",     "telefono": "381 555-1003", "email": "camila.medina@example.com",    "ciudad": "Tafí Viejo"},
    {"id": 4,  "nombre": "Carlos",    "apellido": "Rodríguez",  "telefono": "381 555-1004", "email": "carlos.rodriguez@example.com", "ciudad": "San Miguel de Tucumán"},
    {"id": 5,  "nombre": "Diego",     "apellido": "Torres",     "telefono": "381 555-1005", "email": "diego.torres@example.com",     "ciudad": "Banda del Río Salí"},
    {"id": 6,  "nombre": "Elena",     "apellido": "Paz",        "telefono": "381 555-1006", "email": "elena.paz@example.com",        "ciudad": "Yerba Buena"},
    {"id": 7,  "nombre": "Federico",  "apellido": "Herrera",    "telefono": "381 555-1007", "email": "federico.herrera@example.com", "ciudad": "Lules"},
    {"id": 8,  "nombre": "Inés",      "apellido": "López",      "telefono": "381 555-1008", "email": "ines.lopez@example.com",       "ciudad": "San Miguel de Tucumán"},
    {"id": 9,  "nombre": "Joaquín",   "apellido": "Sánchez",    "telefono": "381 555-1009", "email": "joaquin.sanchez@example.com",  "ciudad": "Tafí Viejo"},
    {"id": 10, "nombre": "Juan",      "apellido": "Pérez",      "telefono": "381 555-1010", "email": "juan.perez@example.com",       "ciudad": "Yerba Buena"},
    {"id": 11, "nombre": "Julieta",   "apellido": "Rojas",      "telefono": "381 555-1011", "email": "julieta.rojas@example.com",    "ciudad": "San Miguel de Tucumán"},
    {"id": 12, "nombre": "Laura",     "apellido": "Díaz",       "telefono": "381 555-1012", "email": "laura.diaz@example.com",       "ciudad": "Concepción"},
    {"id": 13, "nombre": "Lucía",     "apellido": "Fernández",  "telefono": "381 555-1013", "email": "lucia.fernandez@example.com",  "ciudad": "Yerba Buena"},
    {"id": 14, "nombre": "María",     "apellido": "López",      "telefono": "381 555-1014", "email": "maria.lopez@example.com",      "ciudad": "San Miguel de Tucumán"},
    {"id": 15, "nombre": "Martín",    "apellido": "Moreno",     "telefono": "381 555-1015", "email": "martin.moreno@example.com",    "ciudad": "Monteros"},
    {"id": 16, "nombre": "Nicolás",   "apellido": "Ruiz",       "telefono": "381 555-1016", "email": "nicolas.ruiz@example.com",     "ciudad": "Yerba Buena"},
    {"id": 17, "nombre": "Sofía",     "apellido": "Romero",     "telefono": "381 555-1017", "email": "sofia.romero@example.com",     "ciudad": "San Miguel de Tucumán"},
    {"id": 18, "nombre": "Valentina", "apellido": "Álvarez",    "telefono": "381 555-1018", "email": "valentina.alvarez@example.com", "ciudad": "Tafí Viejo"}
  ]
  </script>

  <script>
    "use strict";

    // ============================================================
    // 1. DATOS
    // ============================================================

    const contactos = JSON.parse(
      document.querySelector("#datos-contactos").textContent
    );

    // ============================================================
    // 2. REFERENCIAS A LOS NODOS PERMANENTES
    // ============================================================

    const buscar = document.querySelector("#buscar");
    const maestro = document.querySelector("#maestro");
    const detalle = document.querySelector("#detalle");
    const contador = document.querySelector("#contador");

    // ============================================================
    // 3. ESTADO MÍNIMO
    //
    // filtrados: los contactos que actualmente cumplen el filtro.
    // seleccion: índice dentro de filtrados, no id del contacto.
    // ============================================================

    let filtrados = contactos;
    let seleccion = filtrados.length > 0 ? 0 : -1;

    // ============================================================
    // 4. h(): PEQUEÑO CONSTRUCTOR DE NODOS Y COMPONENTES
    //
    // h("strong", {}, "Pérez") devuelve un nodo <strong>.
    // h(Contacto, props) ejecuta la función componente Contacto.
    //
    // No crea strings HTML y no utiliza innerHTML.
    // ============================================================

    function h(tipo, atributos = {}, ...hijos) {
      if (typeof tipo === "function") {
        return tipo({ ...atributos, hijos });
      }

      const elemento = document.createElement(tipo);

      for (const [nombre, valor] of Object.entries(atributos)) {
        if (valor !== null && valor !== undefined) {
          elemento.setAttribute(nombre, String(valor));
        }
      }

      const hijosPlanos = hijos
        .flat(Infinity)
        .filter(hijo => hijo !== null && hijo !== undefined && hijo !== false);

      elemento.append(...hijosPlanos);

      return elemento;
    }

    // ============================================================
    // 5. COMPONENTES
    // ============================================================

    function Contacto({ contacto, indice, seleccionado }) {
      const clase = seleccionado
        ? "contacto seleccionado"
        : "contacto";

      return h(
        "div",
        {
          class: clase,
          id: `contacto-${contacto.id}`,
          "data-indice": indice,
          role: "option",
          "aria-selected": seleccionado
        },
        h("strong", {}, contacto.apellido),
        h("span", {}, contacto.nombre)
      );
    }

    function Campo({ etiqueta, valor }) {
      return h(
        "div",
        { class: "campo" },
        h("span", { class: "etiqueta" }, etiqueta),
        h("span", { class: "valor" }, valor)
      );
    }

    function Detalle({ contacto }) {
      if (!contacto) {
        return h(
          "div",
          { class: "detalle detalle-vacio" },
          h("h2", {}, "No hay contactos para mostrar"),
          h("p", {}, "Modificá el texto de búsqueda para obtener resultados.")
        );
      }

      return h(
        "article",
        { class: "detalle" },
        h("p", { class: "subtitulo" }, "Contacto seleccionado"),
        h("h2", {}, `${contacto.nombre} ${contacto.apellido}`),
        h(
          "div",
          { class: "campos" },
          h(Campo, { etiqueta: "Teléfono", valor: contacto.telefono }),
          h(Campo, { etiqueta: "Correo", valor: contacto.email }),
          h(Campo, { etiqueta: "Ciudad", valor: contacto.ciudad }),
          h(Campo, { etiqueta: "Identificador", valor: contacto.id })
        )
      );
    }

    // ============================================================
    // 6. RENDERIZADO
    // ============================================================

    function contactoSeleccionado() {
      return filtrados[seleccion] ?? null;
    }

    function renderMaestro() {
      if (filtrados.length === 0) {
        maestro.replaceChildren(
          h("p", { class: "lista-vacia" }, "No se encontraron contactos.")
        );

        maestro.removeAttribute("aria-activedescendant");
        return;
      }

      const nodos = filtrados.map((contacto, indice) =>
        h(Contacto, {
          contacto,
          indice,
          seleccionado: indice === seleccion
        })
      );

      maestro.replaceChildren(...nodos);

      const actual = contactoSeleccionado();
      maestro.setAttribute(
        "aria-activedescendant",
        `contacto-${actual.id}`
      );

      maestro
        .querySelector(".seleccionado")
        ?.scrollIntoView({ block: "nearest" });
    }

    function renderDetalle() {
      detalle.replaceChildren(
        h(Detalle, { contacto: contactoSeleccionado() })
      );
    }

    function renderContador() {
      const cantidad = filtrados.length;
      contador.textContent = `${cantidad} ${cantidad === 1 ? "contacto" : "contactos"}`;
    }

    function render() {
      renderMaestro();
      renderDetalle();
      renderContador();
    }

    // ============================================================
    // 7. FILTRADO
    // ============================================================

    function normalizar(texto) {
      return texto
        .toLocaleLowerCase("es")
        .normalize("NFD")
        .replace(/[\u0300-\u036f]/g, "");
    }

    function aplicarFiltro() {
      const criterio = normalizar(buscar.value.trim());

      filtrados = contactos.filter(contacto => {
        const nombreCompleto = `${contacto.nombre} ${contacto.apellido}`;
        return normalizar(nombreCompleto).includes(criterio);
      });

      // Política sencilla: después de cada filtro se selecciona
      // el primer resultado, si existe.
      seleccion = filtrados.length > 0 ? 0 : -1;

      render();
    }

    // ============================================================
    // 8. SELECCIÓN
    // ============================================================

    function moverSeleccion(desplazamiento) {
      if (filtrados.length === 0) return;

      const ultimoIndice = filtrados.length - 1;
      const nuevaSeleccion = Math.max(
        0,
        Math.min(seleccion + desplazamiento, ultimoIndice)
      );

      if (nuevaSeleccion === seleccion) return;

      seleccion = nuevaSeleccion;
      render();
    }

    // ============================================================
    // 9. EVENTOS DEL BUSCADOR
    // ============================================================

    buscar.addEventListener("input", aplicarFiltro);

    buscar.addEventListener("keydown", evento => {
      if (evento.key === "Enter" && filtrados.length > 0) {
        evento.preventDefault();
        maestro.focus();
      }
    });

    // ============================================================
    // 10. EVENTOS DEL MAESTRO
    // ============================================================

    maestro.addEventListener("keydown", evento => {
      if (evento.key === "ArrowDown") {
        evento.preventDefault();
        moverSeleccion(1);
      }

      if (evento.key === "ArrowUp") {
        evento.preventDefault();
        moverSeleccion(-1);
      }

      if (evento.key === "Escape") {
        evento.preventDefault();
        buscar.focus();
      }
    });

    // Delegación de eventos: un solo listener en el contenedor.
    maestro.addEventListener("click", evento => {
      const item = evento.target.closest(".contacto");

      if (!item || !maestro.contains(item)) return;

      seleccion = Number(item.dataset.indice);
      render();
      maestro.focus({ preventScroll: true });
    });

    // ============================================================
    // 11. INICIO
    // ============================================================

    render();
    buscar.focus();
  </script>
</body>
</html>

```
