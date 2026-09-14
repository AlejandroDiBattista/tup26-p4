# Desarrollo Web desde los fundamentos
## De HTML y CSS a una aplicación dinámica con JavaScript

> **Objetivo del curso:** entender cómo funciona la web desde sus cimientos y, con esa comprensión, construir paso a paso una aplicación real: el usuario escribe una ciudad y la página muestra su clima actual y el pronóstico.

---


---

# Parte 1 — HTML: la estructura del contenido

## 1.1 De dónde viene

A fines de los años 80, en el CERN (el laboratorio europeo de física de partículas, en Ginebra) había un problema concreto: miles de científicos, con computadoras distintas, sistemas operativos distintos y formatos de documento distintos, necesitaban compartir información. Un informe escrito en una máquina no se podía abrir en otra. Los documentos se referenciaban entre sí, pero seguir esas referencias significaba buscar a mano.

En 1989, **Tim Berners-Lee**, un físico e ingeniero que trabajaba allí, propuso una solución con tres piezas:

1. **Un formato de documento universal**, tan simple que cualquier máquina pudiera interpretarlo: eso es **HTML** (*HyperText Markup Language*).
2. **Un protocolo para pedir y enviar esos documentos** por la red: **HTTP** (*HyperText Transfer Protocol*).
3. **Una forma de identificar cada documento** con una dirección única: la **URL**.

La palabra clave es *hipertexto*: texto que contiene enlaces a otro texto. La idea no era nueva (Vannevar Bush la imaginó en 1945, Ted Nelson acuñó el término en los 60), pero Berners-Lee la hizo práctica y, sobre todo, **abierta**: nadie tenía que pagar ni pedir permiso para publicar o leer.

HTML no se inventó desde cero. Se basó en **SGML**, un estándar de marcado ya existente en la industria editorial, y tomó de él la idea de etiquetas entre `<` y `>`. La primera versión tenía unas 20 etiquetas. Hoy hay más de cien, pero el principio no cambió.

### Línea de tiempo esencial

| Año | Hito |
|---|---|
| 1991 | Primera página web publicada. HTML "1.0" informal |
| 1995 | HTML 2.0, primer estándar formal (IETF) |
| 1997 | HTML 3.2 y 4.0 (W3C). Se incorporan tablas, scripts y hojas de estilo |
| 2000 | XHTML: intento de hacer HTML más estricto (sintaxis XML) |
| 2008–2014 | HTML5: nueva generación, orientado a aplicaciones. Audio, video, canvas, etiquetas semánticas |
| Hoy | "HTML Living Standard": el estándar evoluciona continuamente, sin números de versión |

## 1.2 El problema que resuelve

Pensá en un documento cualquiera: un artículo, un manual, un informe. Tiene un título, secciones, párrafos, listas, quizás una tabla, alguna imagen. Cuando lo leés en papel, reconocés cada parte por su aspecto: el título está en letra grande, los párrafos separados por espacio, los ítems de una lista con viñetas.

Una computadora no puede "ver" eso. Para ella un texto es solo una secuencia de caracteres. Si queremos que un programa (por ejemplo, un navegador) sepa qué es título, qué es párrafo y qué es lista, hay que **decírselo explícitamente**. Eso es el **marcado**: anotaciones dentro del texto que describen su estructura.

HTML resuelve exactamente eso: es un vocabulario compartido para describir la **estructura y el significado** de un documento, de forma que cualquier programa que lo lea pueda interpretarlo.

## 1.3 Contenido y presentación son cosas distintas

Este es el concepto más importante de toda la Parte 1, y uno de los principios más profundos del diseño de la web.

Cuando decimos `<h1>Clima en Tucumán</h1>` no estamos diciendo "poné este texto en grande y en negrita". Estamos diciendo "**este texto es el título principal del documento**". Que se vea grande y en negrita es una decisión de presentación que tomará el navegador (por defecto) o el diseñador (con CSS).

¿Por qué separar ambas cosas?

- **El mismo contenido puede presentarse de muchas maneras.** En una pantalla grande, en un celular, impreso, leído en voz alta por un lector de pantalla para una persona ciega, indexado por un buscador. Cada uno necesita la estructura, no los colores.
- **La presentación puede cambiar sin tocar el contenido.** Rediseñar un sitio con miles de páginas no debería implicar editar miles de archivos.
- **El significado es información valiosa.** Un buscador que sabe qué es el título de tu página puede indexarla mejor. Un lector de pantalla que sabe qué es una lista puede anunciar "lista de 5 elementos".

En los primeros años de la web este principio se violó sistemáticamente: existían etiquetas como `<font>` y `<center>`, y las tablas se usaban para maquetar. El resultado eran documentos frágiles, imposibles de mantener e inaccesibles. CSS (Parte 2) nació justamente para corregir eso.

> **Regla práctica:** HTML dice **qué es** cada cosa. CSS dice **cómo se ve**. JavaScript dice **cómo se comporta**.

## 1.4 Sintaxis: elementos, etiquetas y atributos

### El elemento

La unidad básica de HTML es el **elemento**. Un elemento típico tiene tres partes:

```html
<p>Este es un párrafo.</p>
```

- `<p>` es la **etiqueta de apertura**.
- `Este es un párrafo.` es el **contenido**.
- `</p>` es la **etiqueta de cierre** (la misma, con una barra).

El nombre de la etiqueta (`p`, de *paragraph*) es una palabra reservada del vocabulario HTML. No se inventan etiquetas; se usan las que existen.

### Elementos vacíos

Algunos elementos no tienen contenido, y por eso no llevan etiqueta de cierre:

```html
<br>          <!-- salto de línea -->
<hr>          <!-- línea horizontal (separador temático) -->
<img src="foto.jpg" alt="Una foto">
<input type="text">
```

### Atributos

Los atributos dan información adicional sobre un elemento. Van dentro de la etiqueta de apertura, con la forma `nombre="valor"`:

```html
<a href="https://www.utn.edu.ar" target="_blank">Sitio de la UTN</a>
```

Aquí `href` indica adónde apunta el enlace y `target` indica que se abra en una pestaña nueva. Cada etiqueta tiene sus atributos propios, pero hay algunos **globales** que sirven para cualquier elemento:

| Atributo | Para qué sirve |
|---|---|
| `id` | Identificador único del elemento en la página. Lo vamos a usar mucho desde JavaScript |
| `class` | Una o más "categorías" del elemento. Lo vamos a usar mucho desde CSS |
| `style` | Estilos en línea (los evitaremos; para eso está CSS) |
| `title` | Texto de ayuda que aparece al pasar el mouse |
| `lang` | Idioma del contenido |
| `hidden` | Oculta el elemento |

### Anidamiento

Los elementos se pueden meter unos dentro de otros, formando un **árbol**:

```html
<ul>
  <li>Primer ítem</li>
  <li>Segundo ítem con <strong>énfasis</strong></li>
</ul>
```

La regla de oro: **el que abre último, cierra primero**. Esto está mal:

```html
<p><strong>Texto</p></strong>   <!-- ❌ mal anidado -->
```

Y esto está bien:

```html
<p><strong>Texto</strong></p>   <!-- ✅ -->
```

El navegador es tolerante y muchas veces "arregla" errores de anidamiento, pero lo hace adivinando, y el resultado es impredecible. Escribí HTML bien formado.

### Comentarios

```html
<!-- Esto es un comentario. El navegador lo ignora. -->
```

### Espacios en blanco

HTML colapsa los espacios en blanco: varios espacios, tabulaciones o saltos de línea consecutivos se muestran como un único espacio. Esto significa que podés indentar tu código libremente sin afectar el resultado. Para forzar un salto de línea usás `<br>`; para preservar espacios, `<pre>`.

### Entidades

Algunos caracteres tienen significado especial en HTML y hay que escribirlos con un código:

| Querés mostrar | Escribís |
|---|---|
| `<` | `&lt;` |
| `>` | `&gt;` |
| `&` | `&amp;` |
| `"` | `&quot;` |
| espacio que no se colapsa | `&nbsp;` |
| `°` | `&deg;` (o directamente `°` si el archivo está en UTF-8) |

## 1.5 Estructura de un documento

Todo documento HTML tiene el mismo esqueleto. Creá el archivo `index.html` con este contenido:

```html
<!DOCTYPE html>
<html lang="es">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Mi primera página</title>
</head>
<body>
  <h1>Hola, mundo</h1>
  <p>Esta es mi primera página web.</p>
</body>
</html>
```

Abrilo en el navegador (doble clic sobre el archivo alcanza). Analicemos línea por línea:

- `<!DOCTYPE html>` — Le dice al navegador "esto es HTML moderno". Sin esta línea, el navegador entra en *modo de compatibilidad* y emula errores de los años 90. Siempre va primero.
- `<html lang="es">` — El elemento raíz. Todo lo demás está adentro. `lang` declara el idioma; ayuda a lectores de pantalla y a la corrección ortográfica del navegador.
- `<head>` — **Metadatos**: información *sobre* el documento que no se muestra en la página. Aquí van el título, la codificación, los enlaces a hojas de estilo, etc.
- `<meta charset="UTF-8">` — Codificación de caracteres. Sin esto, las tildes y la ñ pueden aparecer como símbolos raros. Siempre incluirlo.
- `<meta name="viewport" ...>` — Le indica a los navegadores móviles que no simulen una pantalla de escritorio. Sin esto, tu página se ve diminuta en un celular.
- `<title>` — El texto que aparece en la pestaña del navegador y en los resultados de búsqueda.
- `<body>` — **El contenido visible**. Todo lo que el usuario ve está acá.

## 1.6 Los componentes básicos

Vamos a recorrer las etiquetas que vas a usar el 95% del tiempo, agrupadas por función. Para cada una, lo que importa es **qué significa**, no cómo se ve.

### Texto

```html
<h1>Título principal</h1>
<h2>Sección</h2>
<h3>Subsección</h3>
<!-- hasta h6, pero rara vez se pasa de h3 -->

<p>Un párrafo. Es la unidad básica de texto corrido.</p>

<p>Dentro de un párrafo podés marcar <strong>importancia</strong>,
<em>énfasis</em>, <code>código</code>, y <small>texto secundario</small>.</p>
```

Sobre los encabezados: forman el **esquema** del documento, como el índice de un libro. Debe haber un solo `<h1>` por página, y los niveles no se saltean (después de un `<h1>` viene un `<h2>`, no un `<h4>`). Nunca elijas un encabezado por su tamaño; elegilo por su nivel jerárquico. El tamaño lo ajustás con CSS.

### Listas

```html
<!-- Lista no ordenada (viñetas) -->
<ul>
  <li>Temperatura</li>
  <li>Humedad</li>
  <li>Viento</li>
</ul>

<!-- Lista ordenada (numerada) -->
<ol>
  <li>Escribir la ciudad</li>
  <li>Presionar Buscar</li>
  <li>Leer el resultado</li>
</ol>

<!-- Lista de definiciones (término + descripción) -->
<dl>
  <dt>Humedad</dt>
  <dd>Porcentaje de vapor de agua en el aire.</dd>
</dl>
```

### Enlaces

El enlace es *el* elemento que define a la web. `a` viene de *anchor* (ancla).

```html
<a href="https://open-meteo.com">Open-Meteo</a>            <!-- absoluto -->
<a href="acerca.html">Acerca de</a>                          <!-- relativo -->
<a href="#pronostico">Ir al pronóstico</a>                   <!-- a una sección de la misma página (por id) -->
<a href="mailto:alguien@ejemplo.com">Escribinos</a>
```

### Imágenes

```html
<img src="sol.png" alt="Ícono de sol" width="64" height="64">
```

El atributo `alt` **no es opcional**: describe la imagen para quien no puede verla (lector de pantalla, imagen que no cargó, buscador). Si la imagen es puramente decorativa, se pone `alt=""`.

### Contenedores genéricos

A veces necesitás agrupar cosas sin que el grupo tenga un significado particular. Para eso están:

```html
<div>Bloque genérico. Ocupa todo el ancho disponible.</div>
<span>Fragmento genérico dentro de una línea de texto.</span>
```

`div` y `span` no significan nada por sí mismos. Son el recurso cuando no existe una etiqueta más específica. Un HTML lleno de `div` anidados ("*divitis*") es señal de que no se están usando las etiquetas semánticas que siguen.

### Etiquetas semánticas de estructura

HTML5 introdujo etiquetas para las partes típicas de una página:

```html
<body>
  <header>
    <h1>Clima</h1>
    <nav>
      <a href="#">Inicio</a>
      <a href="#">Acerca de</a>
    </nav>
  </header>

  <main>
    <section>
      <h2>Buscar ciudad</h2>
      <!-- ... -->
    </section>
    <section>
      <h2>Resultado</h2>
      <article>
        <!-- un bloque de contenido autocontenido -->
      </article>
    </section>
  </main>

  <aside>
    <!-- contenido lateral, relacionado pero no central -->
  </aside>

  <footer>
    <p>Datos provistos por Open-Meteo</p>
  </footer>
</body>
```

Visualmente, un `<header>` es idéntico a un `<div>`. La diferencia está en el significado: un lector de pantalla puede saltar directamente al `<main>`, un buscador entiende qué es navegación y qué es contenido, y vos, al leer el código, entendés la estructura de un vistazo.

### Tablas

Para datos tabulares (y **solo** para datos tabulares, nunca para maquetar):

```html
<table>
  <thead>
    <tr>
      <th>Día</th>
      <th>Máxima</th>
      <th>Mínima</th>
    </tr>
  </thead>
  <tbody>
    <tr>
      <td>Lunes</td>
      <td>28°</td>
      <td>17°</td>
    </tr>
    <tr>
      <td>Martes</td>
      <td>30°</td>
      <td>19°</td>
    </tr>
  </tbody>
</table>
```

`tr` = fila (*table row*), `th` = celda de encabezado, `td` = celda de datos.

### Formularios

Los formularios son la forma en que el usuario **le da información a la página**. Son centrales para nuestra app: necesitamos que el usuario escriba una ciudad.

```html
<form id="buscador">
  <label for="ciudad">Ciudad</label>
  <input type="text" id="ciudad" name="ciudad" placeholder="Ej: San Miguel de Tucumán" required>
  <button type="submit">Buscar</button>
</form>
```

Desglosemos:

- `<form>` agrupa los controles. Cuando se "envía" (Enter o botón *submit*), por defecto el navegador recarga la página mandando los datos a la URL indicada en `action`. Nosotros vamos a interceptar ese envío con JavaScript.
- `<label>` es el texto que describe un control. El atributo `for` apunta al `id` del `input`. Esto hace que al hacer clic en la etiqueta se enfoque el campo, y que un lector de pantalla anuncie "Ciudad, campo de texto". Siempre asociá un `label` a cada `input`.
- `<input>` es el control. El atributo `type` cambia radicalmente su comportamiento:

| `type` | Qué es |
|---|---|
| `text` | Texto de una línea |
| `number` | Número, con flechitas |
| `email`, `url`, `tel` | Texto con validación y teclado apropiado en móvil |
| `password` | Texto oculto |
| `checkbox` | Casilla |
| `radio` | Opción excluyente dentro de un grupo |
| `date` | Selector de fecha |
| `range` | Deslizador |
| `submit` | Botón de envío |

- `placeholder` es el texto gris de ejemplo. No reemplaza al `label`.
- `required` impide enviar el formulario si está vacío. El navegador lo valida solo.
- `<button type="submit">` envía el formulario. Con `type="button"` es un botón que no hace nada por sí solo (útil cuando el comportamiento lo pone JavaScript).

Otros controles:

```html
<select id="unidad">
  <option value="c">Celsius</option>
  <option value="f">Fahrenheit</option>
</select>

<textarea id="comentario" rows="4"></textarea>
```

## 1.7 Cómo funciona: del texto a la pantalla

Vale la pena detenerse a entender qué hace el navegador cuando abre tu `index.html`, porque esto explica todo lo que viene después.

1. **Descarga** el archivo (desde disco o desde un servidor por HTTP).
2. **Lo analiza** (*parsing*) carácter por carácter, reconociendo etiquetas, atributos y texto.
3. **Construye un árbol** en memoria con esa estructura: el **DOM** (*Document Object Model*). Cada elemento HTML se convierte en un *nodo* del árbol, con su padre, sus hijos y sus atributos.
4. **Descarga y analiza el CSS**, y calcula para cada nodo qué estilos le corresponden.
5. **Calcula la geometría** (*layout*): dónde va cada cosa y qué tamaño tiene.
6. **Pinta** el resultado en pantalla.
7. **Ejecuta el JavaScript**, que puede modificar el DOM. Cada modificación puede disparar de nuevo los pasos 4–6.

El punto 3 es el que conecta las tres partes del curso. El DOM es el árbol que CSS decora y que JavaScript manipula. Cuando en la Parte 3 escribamos `document.querySelector("#ciudad")`, estaremos buscando un nodo en ese árbol.

Para verlo: abrí tu página, apretá `F12` y andá a la pestaña *Elements* (o *Inspector*). Lo que ves ahí **no es tu archivo**: es el DOM que el navegador construyó a partir de él. Podés expandir nodos, editarlos en vivo y ver cómo la página cambia al instante.

## 1.8 Práctica: la estructura de nuestra app

Con lo visto, ya podemos escribir el HTML completo de la aplicación del clima. Todavía no va a hacer nada ni va a verse bien, pero va a tener **toda la estructura correcta**. Guardalo como `index.html`:

```html
<!DOCTYPE html>
<html lang="es">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>¿Qué clima hace?</title>
  <link rel="stylesheet" href="estilos.css">
</head>
<body>
  <header>
    <h1>¿Qué clima hace?</h1>
    <p>Escribí una ciudad y te contamos.</p>
  </header>

  <main>
    <form id="buscador">
      <label for="ciudad">Ciudad</label>
      <input type="text" id="ciudad" name="ciudad"
             placeholder="Ej: San Miguel de Tucumán"
             autocomplete="off" required>
      <button type="submit">Buscar</button>
    </form>

    <p id="estado" hidden></p>

    <section id="resultado" hidden>
      <h2 id="nombre-ciudad"></h2>
      <p id="temperatura"></p>
      <p id="descripcion"></p>
      <dl id="detalles">
        <dt>Sensación térmica</dt>
        <dd id="sensacion"></dd>
        <dt>Humedad</dt>
        <dd id="humedad"></dd>
        <dt>Viento</dt>
        <dd id="viento"></dd>
      </dl>

      <h3>Próximos días</h3>
      <ul id="pronostico"></ul>
    </section>
  </main>

  <footer>
    <p>Datos: <a href="https://open-meteo.com" target="_blank">Open-Meteo</a></p>
  </footer>

  <script src="app.js"></script>
</body>
</html>
```

Observaciones:

- `<link rel="stylesheet" href="estilos.css">` en el `head` conecta la hoja de estilos externa. Por ahora el archivo no existe; el navegador lo ignora en silencio.
- `<script src="app.js">` va **al final del body**. Así, cuando el script corra, todos los elementos ya existen en el DOM. Si lo pusiéramos en el `head`, el script se ejecutaría antes de que exista el formulario, y `querySelector` devolvería `null`.
- Casi todos los elementos que van a cambiar tienen un `id`. Ese `id` es el "gancho" que JavaScript va a usar para encontrarlos.
- `#estado` y `#resultado` empiezan con `hidden`: no hay nada que mostrar hasta que el usuario busque.
- `<dl>` para los detalles: es una lista de pares término–valor, exactamente lo que son "Humedad: 60%".
- `<ul id="pronostico">` está vacío a propósito: JavaScript va a llenarlo con un `<li>` por día.

Abrí el archivo. Vas a ver un formulario feo y funcional (si escribís algo y das Enter, la página se recarga con `?ciudad=...` en la URL: ese es el envío por defecto del formulario, que en la Parte 3 vamos a interceptar).


---

# Parte 2 — CSS: la presentación

## 2.1 De dónde viene

Hacia 1994 la web crecía rápido y con ella un problema: los autores querían controlar cómo se veían sus páginas, y HTML no ofrecía forma de hacerlo. Los navegadores respondieron agregando etiquetas de presentación (`<font>`, `<center>`, atributos como `bgcolor`), cada uno las suyas, incompatibles entre sí. Las páginas se llenaban de marcado que no describía contenido sino apariencia, y cambiar el color de todos los títulos de un sitio implicaba editar cada título de cada página.

**Håkon Wium Lie**, que trabajaba con Berners-Lee en el CERN, propuso en octubre de 1994 las *Cascading Style Sheets*: un lenguaje separado, dedicado exclusivamente a la presentación, que se aplicaría *sobre* el HTML sin mezclarse con él. Junto con **Bert Bos** desarrolló la especificación, y en diciembre de 1996 el W3C publicó **CSS1**.

La palabra *cascading* (en cascada) es la idea central y original de la propuesta: varios orígenes de estilo (el navegador, el usuario, el autor) pueden opinar sobre el mismo elemento, y hay reglas claras para decidir quién gana. Volveremos sobre esto.

### Línea de tiempo esencial

| Año | Hito |
|---|---|
| 1996 | CSS1: fuentes, colores, márgenes, alineación básica |
| 1998 | CSS2: posicionamiento, tipos de medio (pantalla, impresión), z-index |
| 2000s | La "guerra de navegadores" deja implementaciones incompatibles. Años oscuros |
| 2011 | CSS 2.1 se estabiliza. Comienza CSS3, ya no como una versión sino como **módulos** independientes |
| 2012–2017 | Flexbox y Grid: por primera vez CSS tiene herramientas de layout diseñadas para eso |
| Hoy | Variables, funciones matemáticas, consultas de contenedor, anidamiento. Evolución continua por módulos |

## 2.2 El problema que resuelve

CSS resuelve tres problemas a la vez:

1. **Separación de responsabilidades.** El HTML describe el contenido; CSS, la apariencia. Cada uno se puede cambiar sin tocar al otro.
2. **Reutilización.** Una regla como "todos los títulos de nivel 2 son azules" se escribe una vez y aplica a todo el sitio.
3. **Adaptación al contexto.** El mismo documento puede verse distinto en un celular, un monitor, una impresora, o para un usuario que prefiere modo oscuro.

## 2.3 Sintaxis: reglas, selectores y declaraciones

Una hoja de estilos es una lista de **reglas**. Cada regla tiene esta forma:

```css
selector {
  propiedad: valor;
  propiedad: valor;
}
```

Por ejemplo:

```css
h1 {
  color: navy;
  font-size: 2rem;
}
```

- `h1` es el **selector**: dice *a qué elementos* se aplica la regla.
- Todo lo que está entre llaves es el **bloque de declaraciones**.
- `color: navy;` es una **declaración**: una **propiedad** (`color`) con un **valor** (`navy`). Termina en punto y coma.

Comentarios:

```css
/* Esto es un comentario en CSS */
```

### Tres maneras de aplicar CSS

```html
<!-- 1. En línea (atributo style). Evitar: mezcla presentación con contenido. -->
<p style="color: red;">Texto</p>

<!-- 2. Interno (elemento <style> en el head). Útil para pruebas rápidas. -->
<style>
  p { color: red; }
</style>

<!-- 3. Externo (archivo .css enlazado). La forma correcta. -->
<link rel="stylesheet" href="estilos.css">
```

Vamos a usar la tercera. Creá `estilos.css` en la misma carpeta que `index.html`.

## 2.4 Selectores

El selector es la mitad del poder de CSS: cuanto más preciso podés ser al decir *a qué* aplicar un estilo, menos clases y más limpio queda el HTML.

### Selectores básicos

```css
/* Por tipo de elemento */
p { }

/* Por clase (atributo class). El más usado. */
.destacado { }

/* Por id. Único en la página. */
#resultado { }

/* Universal (todos los elementos). Se usa poco, típicamente para resets. */
* { }

/* Por atributo */
input[type="text"] { }
a[target="_blank"] { }
```

Un elemento puede tener varias clases: `<p class="destacado grande">`. Y un selector puede exigir varias: `.destacado.grande` (sin espacio).

### Combinadores: relaciones en el árbol

```css
/* Descendiente: cualquier <a> dentro de un <nav>, a cualquier profundidad */
nav a { }

/* Hijo directo: solo <li> que son hijos inmediatos de <ul> */
ul > li { }

/* Hermano adyacente: un <p> que viene inmediatamente después de un <h2> */
h2 + p { }

/* Hermanos generales: todo <p> posterior a un <h2>, con el mismo padre */
h2 ~ p { }
```

### Agrupación

Varios selectores separados por coma comparten el bloque:

```css
h1, h2, h3 {
  font-family: Georgia, serif;
}
```

### Pseudoclases: estados y posiciones

Una pseudoclase selecciona elementos según un **estado** o una **posición** que no está escrito en el HTML:

```css
a:hover { }           /* el mouse está encima */
a:visited { }         /* ya fue visitado */
input:focus { }       /* tiene el foco del teclado */
button:disabled { }   /* está deshabilitado */
input:invalid { }     /* no cumple su validación (required, type=email...) */

li:first-child { }    /* es el primer hijo de su padre */
li:last-child { }
li:nth-child(odd) { } /* hijos impares: útil para rayar tablas */
li:nth-child(3) { }

p:not(.intro) { }     /* párrafos que NO tienen la clase intro */
section:has(h2) { }   /* secciones que contienen un h2 (moderno) */
```

### Pseudoelementos: partes de un elemento

Un pseudoelemento (doble dos puntos) permite estilizar una **parte** de un elemento, o insertar contenido antes o después:

```css
p::first-line { }
p::first-letter { }
li::before { content: "→ "; }    /* inserta una flecha antes de cada ítem */
input::placeholder { color: gray; }
```

## 2.5 La cascada: quién gana

Cuando varias reglas apuntan al mismo elemento y a la misma propiedad, hay que decidir cuál se aplica. El algoritmo tiene tres criterios, en orden:

### 1. Origen e importancia

Los estilos del **autor** (los tuyos) ganan a los del **usuario** y a los del **navegador** (la hoja de estilos por defecto que hace que `h1` sea grande). Una declaración marcada `!important` invierte ese orden. Evitá `!important`: es un martillo que rompe la cascada y después no se puede deshacer.

### 2. Especificidad

Si dos reglas del mismo origen compiten, gana la del selector **más específico**. La especificidad se calcula como una terna `(a, b, c)`:

- `a` = cantidad de **ids** en el selector
- `b` = cantidad de **clases**, atributos y pseudoclases
- `c` = cantidad de **tipos** de elemento y pseudoelementos

Se compara primero `a`; si empatan, `b`; si empatan, `c`.

| Selector | Especificidad |
|---|---|
| `p` | (0, 0, 1) |
| `.destacado` | (0, 1, 0) |
| `p.destacado` | (0, 1, 1) |
| `#resultado p` | (1, 0, 1) |
| `nav ul li a` | (0, 0, 4) |
| `a:hover` | (0, 1, 1) |

Un id siempre gana a cualquier cantidad de clases; una clase siempre gana a cualquier cantidad de tipos. Por eso, en la práctica, **estilizar con clases** es lo más manejable: todas tienen la misma especificidad y es fácil razonar.

### 3. Orden

Si la especificidad también empata, gana la regla que aparece **más abajo** en el código. Por eso el orden de tus reglas (y el orden de los `<link>`) importa.

### Herencia

Independiente de la cascada: algunas propiedades se **heredan** de padre a hijo. Si ponés `color: navy` en `body`, todo el texto de la página será azul salvo que algo lo sobrescriba. Se heredan las propiedades de texto (color, fuente, tamaño, alineación) y no se heredan las de caja (márgenes, bordes, fondos, ancho). Es una elección sensata: querés que la fuente se propague, no que cada párrafo herede el borde de su sección.

Podés forzar herencia con `inherit` y volver al valor por defecto con `initial`.

## 2.6 Unidades y valores

Antes de recorrer las propiedades, conviene conocer los tipos de valor que reciben.

### Longitudes

| Unidad | Qué es | Cuándo usarla |
|---|---|---|
| `px` | Píxel CSS (no siempre coincide con un píxel físico) | Bordes, sombras, cosas pequeñas y fijas |
| `rem` | Múltiplo del tamaño de fuente de la **raíz** (`html`), normalmente 16px | Tamaños de fuente, espaciado. **La unidad por defecto recomendada** |
| `em` | Múltiplo del tamaño de fuente del **elemento actual** | Espaciado relativo al texto (padding de un botón) |
| `%` | Porcentaje del valor del padre | Anchos |
| `vw`, `vh` | 1% del ancho / alto de la ventana | Secciones a pantalla completa |

¿Por qué `rem` y no `px` para las fuentes? Porque si un usuario configuró su navegador con letra más grande, `rem` lo respeta y `px` lo ignora.

### Colores

```css
color: red;                    /* nombre (hay ~150) */
color: #1e3a8a;                /* hexadecimal RRGGBB */
color: #1e3a8a80;              /* con transparencia (alpha) */
color: rgb(30 58 138);         /* rojo verde azul, 0–255 */
color: rgb(30 58 138 / 50%);   /* con transparencia */
color: hsl(224 64% 33%);       /* tono, saturación, luminosidad: más intuitivo para variar */
```

### Otros

- **Palabras clave:** `auto`, `none`, `inherit`, `bold`, `center`...
- **Funciones:** `calc(100% - 2rem)`, `min()`, `max()`, `clamp(1rem, 2.5vw, 2rem)`, `var(--nombre)`.

## 2.7 Propiedades por categoría

Aquí está el vocabulario. No hace falta memorizarlo: hace falta saber que existe cada categoría y qué resuelve, para saber qué buscar.

### A. Tipografía y texto

```css
p {
  font-family: system-ui, -apple-system, "Segoe UI", Roboto, sans-serif;
  font-size: 1rem;
  font-weight: 400;          /* 100–900; 400 normal, 700 bold */
  font-style: italic;
  line-height: 1.5;          /* sin unidad: múltiplo del font-size. Recomendado */
  text-align: center;        /* left | right | center | justify */
  text-decoration: none;     /* quita el subrayado de los enlaces */
  text-transform: uppercase;
  letter-spacing: 0.05em;
  color: #222;
}
```

**`font-family`** es una lista de alternativas: el navegador usa la primera que tenga instalada. Termina siempre con una familia genérica (`serif`, `sans-serif`, `monospace`). `system-ui` usa la fuente del sistema operativo: rápido y familiar para el usuario.

**`line-height`** sin unidad es la forma correcta: `1.5` significa "1.5 veces el tamaño de fuente del elemento" y se hereda como factor, no como valor fijo.

### B. El modelo de caja

Este es el concepto estructural más importante de CSS. **Todo elemento es una caja rectangular** compuesta por cuatro capas, de adentro hacia afuera:

```
┌─────────────────────────────────────┐
│              margin                 │   ← espacio exterior (transparente)
│  ┌───────────────────────────────┐  │
│  │           border              │  │   ← borde
│  │  ┌─────────────────────────┐  │  │
│  │  │        padding          │  │  │   ← relleno interior (toma el fondo)
│  │  │  ┌───────────────────┐  │  │  │
│  │  │  │      content      │  │  │  │   ← el contenido en sí
│  │  │  └───────────────────┘  │  │  │
│  │  └─────────────────────────┘  │  │
│  └───────────────────────────────┘  │
└─────────────────────────────────────┘
```

```css
.tarjeta {
  width: 300px;
  height: auto;              /* por defecto: lo que necesite el contenido */
  padding: 1rem;             /* los 4 lados */
  padding: 1rem 2rem;        /* vertical horizontal */
  padding: 1rem 2rem 0 2rem; /* arriba derecha abajo izquierda (sentido horario) */
  border: 1px solid #ccc;    /* grosor estilo color */
  border-radius: 8px;        /* esquinas redondeadas */
  margin: 1rem auto;         /* auto horizontal = centrar un bloque con ancho fijo */
}
```

Hay una trampa histórica: por defecto, `width` se refiere **solo al contenido**. Si ponés `width: 300px` y `padding: 20px`, la caja mide 340px. Esto es contraintuitivo, y por eso prácticamente todo el mundo empieza sus hojas de estilo con:

```css
*, *::before, *::after {
  box-sizing: border-box;   /* ahora width incluye padding y borde */
}
```

Otro detalle: los **márgenes verticales se colapsan**. Si un párrafo tiene `margin-bottom: 1rem` y el siguiente `margin-top: 1rem`, la separación entre ambos es 1rem, no 2rem. Es una regla pensada para texto, y conviene conocerla para no sorprenderse.

### C. Fondo y bordes

```css
.hero {
  background-color: #f0f4ff;
  background-image: url("cielo.jpg");
  background-size: cover;            /* cubre toda la caja recortando si hace falta */
  background-position: center;
  background: linear-gradient(to bottom, #93c5fd, #1e3a8a);   /* degradado */

  border: 2px dashed #1e3a8a;
  border-bottom: none;
  border-radius: 50%;                /* círculo, si la caja es cuadrada */
  box-shadow: 0 4px 12px rgb(0 0 0 / 15%);   /* x y desenfoque color */
  outline: 2px solid orange;         /* como border pero no ocupa espacio; se usa para :focus */
}
```

### D. Display: cómo participa la caja en el flujo

Cada elemento tiene un `display` por defecto que define cómo se ubica respecto a sus vecinos:

- **`block`** (`div`, `p`, `h1`, `section`, `ul`...): ocupa todo el ancho disponible y empieza en línea nueva. Acepta `width`, `height`, márgenes verticales.
- **`inline`** (`span`, `a`, `strong`, `em`...): fluye dentro del texto, ocupa solo lo que necesita. **Ignora** `width`, `height` y márgenes verticales.
- **`inline-block`**: fluye como inline pero acepta dimensiones. Útil para botones.
- **`none`**: el elemento desaparece por completo (no ocupa espacio). Es lo que hace el atributo `hidden`.
- **`flex`** y **`grid`**: convierten al elemento en un contenedor de layout. Los vemos ahora.

```css
span.etiqueta { display: inline-block; padding: 0.25rem 0.5rem; }
.oculto { display: none; }
```

### E. Layout con Flexbox

Durante 15 años no hubo en CSS una herramienta pensada para distribuir cajas. Se usaban tablas, luego `float` (diseñado para que el texto rodee imágenes), con resultados frágiles. **Flexbox** (2012) fue la primera solución real.

Flexbox distribuye los hijos de un contenedor **a lo largo de un eje** (horizontal o vertical), y resuelve solo los problemas clásicos: centrar, repartir espacio, alinear alturas.

```css
.contenedor {
  display: flex;
  flex-direction: row;         /* row (horizontal, por defecto) | column */
  justify-content: space-between;  /* distribución en el eje principal */
  align-items: center;         /* alineación en el eje perpendicular */
  gap: 1rem;                   /* espacio entre hijos */
  flex-wrap: wrap;             /* permite que los hijos pasen a otra línea */
}

.contenedor > .hijo {
  flex: 1;                     /* crece para ocupar el espacio disponible en partes iguales */
}
```

Valores de `justify-content`: `flex-start`, `flex-end`, `center`, `space-between`, `space-around`, `space-evenly`.
Valores de `align-items`: `stretch` (por defecto), `flex-start`, `flex-end`, `center`, `baseline`.

El caso de uso más famoso, centrar algo vertical y horizontalmente (que antes era un problema famoso por su dificultad):

```css
.centrado {
  display: flex;
  justify-content: center;
  align-items: center;
  min-height: 100vh;
}
```

### F. Layout con Grid

**Grid** (2017) es la herramienta para layouts **bidimensionales**: filas y columnas a la vez. Donde Flexbox piensa en una línea, Grid piensa en una cuadrícula.

```css
.galeria {
  display: grid;
  grid-template-columns: 1fr 1fr 1fr;            /* tres columnas iguales */
  grid-template-columns: repeat(3, 1fr);         /* lo mismo */
  grid-template-columns: 200px 1fr;              /* barra lateral fija + resto */
  grid-template-columns: repeat(auto-fit, minmax(150px, 1fr));  /* tantas como quepan, de al menos 150px */
  gap: 1rem;
}
```

La unidad `fr` (*fraction*) significa "una parte del espacio libre". `1fr 2fr` reparte en proporción 1:2.

La última forma (`auto-fit` + `minmax`) es oro puro: genera una cuadrícula que se adapta sola al ancho disponible, sin media queries. La vamos a usar para los días del pronóstico.

**¿Flexbox o Grid?** Regla práctica: Flexbox cuando distribuís cosas en **una** dirección (una barra de navegación, un formulario en línea, centrar). Grid cuando el layout tiene **dos** dimensiones (una galería, la estructura general de la página). Se combinan sin problema: una página en Grid con componentes en Flexbox.

### G. Posicionamiento

`position` saca a un elemento del flujo normal, o lo desplaza respecto de él:

```css
.normal   { position: static; }     /* por defecto: en el flujo, top/left no hacen nada */
.relativo { position: relative; top: 4px; }   /* se desplaza desde donde estaría, sin afectar a los demás */
.absoluto { position: absolute; top: 0; right: 0; }  /* sale del flujo; se ubica respecto al ancestro posicionado más cercano */
.fijo     { position: fixed; bottom: 1rem; right: 1rem; }  /* respecto a la ventana; no scrollea */
.pegajoso { position: sticky; top: 0; }  /* fluye normal hasta que llega al borde; ahí se pega */
```

El patrón clásico: un padre `position: relative` (sin desplazamiento, solo para servir de referencia) y un hijo `position: absolute` para ubicar un ícono en una esquina. `z-index` controla qué queda encima cuando se superponen.

Usá `position` para casos puntuales (badges, tooltips, encabezados fijos). Para el layout general, Flexbox y Grid.

### H. Transiciones y animaciones

```css
button {
  background: #1e3a8a;
  transition: background 0.2s ease, transform 0.1s;   /* propiedad duración curva */
}
button:hover {
  background: #1e40af;
  transform: translateY(-1px);
}
```

`transition` hace que un cambio de valor (por ejemplo, al pasar el mouse) sea gradual en vez de instantáneo. `transform` (`translate`, `scale`, `rotate`) mueve o deforma sin afectar el layout de los demás elementos, y es muy eficiente.

Para animaciones más complejas hay `@keyframes` + `animation`:

```css
@keyframes girar {
  to { transform: rotate(360deg); }
}
.cargando { animation: girar 1s linear infinite; }
```

### I. Diseño adaptable (responsive)

Una **media query** aplica reglas solo cuando se cumple una condición sobre el dispositivo:

```css
/* Base: celular (diseñar primero para lo chico: "mobile first") */
.contenedor { padding: 1rem; }

/* A partir de 640px de ancho: tablet y más */
@media (min-width: 640px) {
  .contenedor { padding: 2rem; max-width: 640px; margin: 0 auto; }
}

/* Modo oscuro del sistema operativo */
@media (prefers-color-scheme: dark) {
  body { background: #0f172a; color: #e2e8f0; }
}

/* Impresión */
@media print {
  nav, footer { display: none; }
}
```

La estrategia *mobile first* (escribir primero los estilos para pantalla chica y agregar complejidad con `min-width`) suele dar CSS más simple que la inversa.

### J. Variables (propiedades personalizadas)

Podés definir tus propios valores y reutilizarlos:

```css
:root {                          /* :root = el elemento html; así las variables son globales */
  --color-primario: #1e3a8a;
  --color-fondo: #f8fafc;
  --radio: 12px;
  --espacio: 1rem;
}

button {
  background: var(--color-primario);
  border-radius: var(--radio);
}
```

Las variables se heredan y se pueden redefinir en un contexto (por ejemplo, dentro de `@media (prefers-color-scheme: dark)`), lo que hace trivial implementar temas.

## 2.8 Buenas prácticas

- **Un reset mínimo** al principio (`box-sizing`, márgenes de `body`) para partir de una base predecible.
- **Clases con nombres que describan el rol, no la apariencia.** `.tarjeta-clima` envejece bien; `.caja-azul` deja de tener sentido cuando cambia a verde.
- **Evitá los ids como selectores de estilo.** Reservalos para JavaScript y anclas. Su especificidad alta hace difícil sobrescribirlos.
- **Evitá selectores muy largos** (`main section div ul li a`). Son frágiles: cualquier cambio de estructura los rompe.
- **`rem` para tamaños, `em` para espaciado relativo al texto, `px` para bordes.**
- **Usá las herramientas de desarrollador.** La pestaña *Styles* muestra qué reglas aplican a un elemento, cuáles fueron sobrescritas (tachadas) y te deja editarlas en vivo. La pestaña *Computed* muestra el modelo de caja con sus medidas reales.

## 2.9 Práctica: darle presentación a la app

Ahora sí, creá `estilos.css` con el siguiente contenido. Está comentado sección por sección para que reconozcas cada concepto:

```css
/* ============================================================
   1. Variables y base
   ============================================================ */
:root {
  --color-fondo: #eff6ff;
  --color-superficie: #ffffff;
  --color-texto: #1e293b;
  --color-texto-suave: #64748b;
  --color-primario: #2563eb;
  --color-primario-oscuro: #1d4ed8;
  --color-error: #dc2626;
  --radio: 12px;
  --sombra: 0 4px 16px rgb(15 23 42 / 8%);
}

*, *::before, *::after {
  box-sizing: border-box;
}

body {
  margin: 0;
  font-family: system-ui, -apple-system, "Segoe UI", Roboto, sans-serif;
  line-height: 1.5;
  color: var(--color-texto);
  background: var(--color-fondo);
  padding: 1rem;
}

/* ============================================================
   2. Layout general
   ============================================================ */
header, main, footer {
  max-width: 560px;
  margin: 0 auto;           /* centra el bloque */
}

header {
  text-align: center;
  padding-block: 2rem 1rem;
}

header h1 {
  margin: 0;
  font-size: 2rem;
}

header p {
  margin: 0.25rem 0 0;
  color: var(--color-texto-suave);
}

footer {
  margin-top: 3rem;
  text-align: center;
  font-size: 0.875rem;
  color: var(--color-texto-suave);
}

/* ============================================================
   3. Formulario (Flexbox en una dirección)
   ============================================================ */
#buscador {
  display: flex;
  gap: 0.5rem;
  flex-wrap: wrap;
}

#buscador label {
  flex-basis: 100%;         /* la etiqueta ocupa toda la línea */
  font-weight: 600;
  font-size: 0.875rem;
}

#buscador input {
  flex: 1;                  /* el campo toma todo el espacio sobrante */
  min-width: 0;             /* permite que se achique en pantallas chicas */
  padding: 0.75rem 1rem;
  font: inherit;            /* los controles no heredan la fuente por defecto; se la forzamos */
  border: 1px solid #cbd5e1;
  border-radius: var(--radio);
  background: var(--color-superficie);
}

#buscador input:focus {
  outline: 2px solid var(--color-primario);
  outline-offset: 2px;
}

#buscador button {
  padding: 0.75rem 1.25rem;
  font: inherit;
  font-weight: 600;
  color: white;
  background: var(--color-primario);
  border: none;
  border-radius: var(--radio);
  cursor: pointer;
  transition: background 0.15s;
}

#buscador button:hover { background: var(--color-primario-oscuro); }
#buscador button:disabled { opacity: 0.6; cursor: wait; }

/* ============================================================
   4. Mensajes de estado
   ============================================================ */
#estado {
  margin: 1rem 0 0;
  padding: 0.75rem 1rem;
  border-radius: var(--radio);
  background: var(--color-superficie);
  color: var(--color-texto-suave);
}

#estado.error {
  color: var(--color-error);
  background: #fef2f2;
}

/* ============================================================
   5. Tarjeta de resultado
   ============================================================ */
#resultado {
  margin-top: 1.5rem;
  padding: 1.5rem;
  background: var(--color-superficie);
  border-radius: var(--radio);
  box-shadow: var(--sombra);
}

#nombre-ciudad {
  margin: 0;
  font-size: 1.25rem;
}

#temperatura {
  margin: 0.25rem 0 0;
  font-size: 4rem;
  font-weight: 200;
  line-height: 1;
}

#descripcion {
  margin: 0.5rem 0 0;
  font-size: 1.125rem;
  color: var(--color-texto-suave);
}

/* Lista de definiciones como fila de tres columnas (Grid) */
#detalles {
  display: grid;
  grid-template-columns: repeat(3, 1fr);
  gap: 0.25rem 1rem;
  margin: 1.5rem 0 0;
  padding-top: 1rem;
  border-top: 1px solid #e2e8f0;
}

#detalles dt {
  grid-row: 1;              /* todos los términos en la primera fila */
  font-size: 0.75rem;
  text-transform: uppercase;
  letter-spacing: 0.05em;
  color: var(--color-texto-suave);
}

#detalles dd {
  grid-row: 2;              /* todos los valores en la segunda */
  margin: 0;
  font-weight: 600;
}

/* ============================================================
   6. Pronóstico (Grid adaptable)
   ============================================================ */
#resultado h3 {
  margin: 1.5rem 0 0.75rem;
  font-size: 0.875rem;
  text-transform: uppercase;
  letter-spacing: 0.05em;
  color: var(--color-texto-suave);
}

#pronostico {
  list-style: none;         /* sin viñetas */
  margin: 0;
  padding: 0;
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(90px, 1fr));
  gap: 0.5rem;
}

#pronostico li {
  padding: 0.75rem 0.5rem;
  text-align: center;
  background: var(--color-fondo);
  border-radius: var(--radio);
}

#pronostico .dia {
  display: block;
  font-size: 0.75rem;
  font-weight: 600;
  text-transform: uppercase;
}

#pronostico .icono {
  display: block;
  font-size: 1.75rem;
  margin: 0.25rem 0;
}

#pronostico .max { font-weight: 600; }
#pronostico .min { color: var(--color-texto-suave); }

/* ============================================================
   7. Modo oscuro
   ============================================================ */
@media (prefers-color-scheme: dark) {
  :root {
    --color-fondo: #0f172a;
    --color-superficie: #1e293b;
    --color-texto: #f1f5f9;
    --color-texto-suave: #94a3b8;
    --sombra: 0 4px 16px rgb(0 0 0 / 40%);
  }
  #buscador input { border-color: #334155; }
  #detalles { border-color: #334155; }
  #estado.error { background: #450a0a; }
}
```

Recargá `index.html`. El formulario ahora es una barra presentable; la tarjeta de resultado sigue oculta porque tiene `hidden`. Para verla, quitale el atributo desde las herramientas de desarrollador y escribí algún texto de prueba en los elementos vacíos.

Cosas para notar:

- Las **variables** en `:root` concentran todas las decisiones de color. El modo oscuro solo redefine variables; el resto del CSS no se toca.
- `#buscador` usa **Flexbox**: la etiqueta ocupa una línea completa (`flex-basis: 100%` + `wrap`), y debajo el input crece (`flex: 1`) mientras el botón mantiene su tamaño natural.
- `#detalles` usa **Grid** con un truco: `grid-row: 1` para todos los `dt` y `grid-row: 2` para todos los `dd`. El HTML sigue siendo una lista de definiciones semánticamente correcta (término, valor, término, valor), pero se ve como una tabla de tres columnas. Esto es exactamente la separación contenido/presentación en acción.
- `#pronostico` usa `auto-fit` + `minmax`: en un celular angosto mostrará 3 columnas; en una pantalla ancha, 5 o 7. Sin una sola media query.
- `font: inherit` en `input` y `button`: los controles de formulario, por razones históricas, no heredan la fuente de la página. Hay que pedírselo.


---

# Parte 3 — JavaScript y el DOM: el comportamiento

## 3.1 De dónde viene

En 1995 Netscape, que dominaba el mercado de navegadores, quería que las páginas hicieran algo más que mostrarse: validar un formulario antes de enviarlo, reaccionar a un clic, mostrar la hora. Le encargaron a **Brendan Eich** diseñar un lenguaje de scripting para el navegador. Lo hizo en **diez días**.

El lenguaje se llamó primero Mocha, luego LiveScript, y finalmente **JavaScript**, un nombre elegido por marketing para subirse a la popularidad de Java, con el que no tiene relación técnica. Para evitar que Microsoft y Netscape divergieran en implementaciones incompatibles, el lenguaje se estandarizó en 1997 bajo el nombre **ECMAScript** (por la organización ECMA). "JavaScript" es el nombre coloquial; "ECMAScript 2015" (ES6), "ES2020", etc., son las versiones del estándar.

Durante años JavaScript fue considerado un lenguaje de juguete. Dos cosas cambiaron eso: en 2005, la técnica **AJAX** (pedir datos al servidor sin recargar la página, popularizada por Gmail y Google Maps) mostró que se podían hacer aplicaciones reales en el navegador; y en 2008, el motor **V8** de Google Chrome lo hizo rápido. En 2009 V8 salió del navegador y nació **Node.js**: JavaScript en el servidor. Hoy es el lenguaje más usado del mundo.

## 3.2 El problema que resuelve

HTML y CSS son **declarativos**: describen un estado. Una página hecha solo con ellos es estática: se ve igual hasta que se recarga con otro contenido. Para que la página **reaccione** (a un clic, a lo que el usuario escribe, al paso del tiempo, a datos que llegan de un servidor) hace falta un lenguaje **imperativo** que ejecute instrucciones. JavaScript es ese lenguaje, y su trabajo principal en el navegador es **modificar el DOM en respuesta a eventos**.

## 3.3 El entorno de ejecución

Este punto se pasa por alto con frecuencia y genera mucha confusión. Vale la pena entenderlo bien.

### Qué es "el navegador" para JavaScript

Cuando tu código JavaScript corre en una página, no corre solo. Corre dentro de un entorno que le da tres cosas:

1. **El motor** (V8 en Chrome/Edge, SpiderMonkey en Firefox, JavaScriptCore en Safari): interpreta y ejecuta el lenguaje en sí. Variables, funciones, objetos, arrays, operaciones. Esto es "JavaScript puro" y es lo mismo en cualquier entorno.

2. **Las APIs del navegador** (*Web APIs*): objetos que el navegador pone a disposición del código para interactuar con la página y el mundo exterior. **No son parte del lenguaje**; son parte del navegador. Las principales:
   - `document`: el DOM. Acceso al árbol de la página.
   - `window`: la ventana. Tamaño, URL, historial, temporizadores.
   - `fetch`: hacer peticiones HTTP.
   - `console`: la consola de desarrollador.
   - `localStorage`: guardar datos en el navegador.
   - Y decenas más: geolocalización, audio, canvas, cámara...

3. **El bucle de eventos** (*event loop*): el mecanismo que decide *cuándo* se ejecuta cada pedazo de código.

Cuando escribís `document.querySelector(...)`, `document` no es JavaScript: es una API del navegador. En Node.js no existe. Por eso decimos que JavaScript "corre en el navegador": el lenguaje es el mismo, pero el entorno le da herramientas distintas.

### Un solo hilo y el bucle de eventos

JavaScript en el navegador ejecuta **una sola cosa a la vez**. No hay dos funciones corriendo en paralelo. Esto tiene una consecuencia enorme: si tu código tarda 5 segundos en un cálculo, la página queda congelada 5 segundos. No responde a clics, no se redibuja, nada.

¿Cómo es posible, entonces, que una página espere una respuesta de un servidor (que puede tardar segundos) sin congelarse? Con el **bucle de eventos**:

```
   ┌──────────────────────────┐
   │   Cola de tareas         │  ← aquí se encolan: un clic, la respuesta de fetch,
   │  [clic] [respuesta] [..] │     un temporizador que venció, ...
   └───────────┬──────────────┘
               │ el bucle toma una tarea cuando la pila está vacía
               ▼
   ┌──────────────────────────┐
   │   Pila de ejecución      │  ← corre la función asociada a la tarea, hasta el final
   └──────────────────────────┘
```

El modelo es:

1. Tu script se ejecuta de arriba abajo. Registra *manejadores* ("cuando pase X, ejecutá esta función") y termina.
2. El navegador queda a la espera. Cuando ocurre un evento (el usuario hace clic, llega una respuesta de red), pone una tarea en la cola.
3. El bucle de eventos toma la primera tarea de la cola y ejecuta su función **completa, sin interrupción**.
4. Vuelve al paso 2.

Las operaciones lentas (red, temporizadores, lectura de archivos) **no las hace JavaScript**: las delega al navegador, que las resuelve en segundo plano y, cuando terminan, encola una tarea con el resultado. Por eso se dice que JavaScript es **asíncrono y no bloqueante**: no espera; pide y sigue, y le avisan cuando está listo.

Entender esto explica por qué el código para pedir el clima no puede ser simplemente `let datos = pedirClima()`: la función no puede devolver el dato porque el dato todavía no llegó. Lo vemos en 3.6.

### Cómo incluir JavaScript

```html
<!-- Externo: la forma correcta. Al final del body para que el DOM ya exista. -->
<script src="app.js"></script>

<!-- Alternativa moderna: en el head, con defer. Se descarga en paralelo y se ejecuta cuando el DOM está listo. -->
<script src="app.js" defer></script>

<!-- Interno: para pruebas -->
<script>
  console.log("Hola");
</script>
```

### La consola

Tu mejor amiga para aprender. `F12` → pestaña *Console*. Ahí:

- Ves lo que imprime `console.log(...)`.
- Ves los errores, con el archivo y la línea.
- Podés escribir JavaScript y ejecutarlo al instante sobre la página actual. Probá: `document.title`, `document.querySelector("h1").textContent = "Hola"`.

## 3.4 El DOM

Volvamos al árbol que el navegador construyó en la Parte 1. El **DOM** es la representación en memoria de la página, y también la **API** para consultarla y modificarla. Cada etiqueta HTML es un objeto (`Element`) con propiedades y métodos. `document` es la raíz.

```
document
└── html
    ├── head
    │   ├── meta
    │   └── title
    └── body
        ├── header
        │   ├── h1
        │   └── p
        ├── main
        │   ├── form#buscador
        │   │   ├── label
        │   │   ├── input#ciudad
        │   │   └── button
        │   ├── p#estado
        │   └── section#resultado
        │       └── ...
        └── footer
```

Modificar el DOM es modificar la página: si cambiás el texto de un nodo, la pantalla se actualiza. Ese es el mecanismo central de toda aplicación web.

### Seleccionar elementos

Los dos métodos que vas a usar aceptan **selectores CSS**, los mismos de la Parte 2. Esto es una elección de diseño elegante: no hay que aprender otro lenguaje de consulta.

```js
// Devuelve el PRIMER elemento que coincide (o null si no hay)
const input = document.querySelector("#ciudad");
const primerLi = document.querySelector("#pronostico li");
const boton = document.querySelector("#buscador button[type=submit]");

// Devuelve TODOS los que coinciden (una NodeList, recorrible con forEach)
const items = document.querySelectorAll("#pronostico li");
items.forEach((li) => console.log(li));

// Se puede buscar dentro de un elemento, no solo desde document
const resultado = document.querySelector("#resultado");
const titulo = resultado.querySelector("h2");
```

Existen métodos más antiguos (`getElementById`, `getElementsByClassName`). Funcionan, pero `querySelector` los cubre a todos.

> **Error clásico:** `querySelector` devuelve `null` y luego `null.textContent = ...` explota con *"Cannot set properties of null"*. Causas habituales: el selector está mal escrito, o el script corre antes de que el elemento exista (script en el `head` sin `defer`).

### Leer y modificar contenido

```js
const titulo = document.querySelector("#nombre-ciudad");

titulo.textContent            // leer el texto
titulo.textContent = "Tucumán, Argentina";   // escribir texto (seguro: se muestra literal)

titulo.innerHTML = "Tucumán, <em>Argentina</em>";   // escribir HTML (interpreta etiquetas)
```

**`textContent` vs `innerHTML`:** usá `textContent` por defecto. `innerHTML` interpreta lo que le pasás como HTML; si ese texto viene del usuario o de una API, alguien podría inyectar un `<script>` u otro contenido malicioso (ataque **XSS**). Solo usá `innerHTML` con HTML que vos escribiste.

### Atributos y propiedades

```js
const input = document.querySelector("#ciudad");

input.value                        // lo que el usuario escribió (propiedad, cambia en vivo)
input.value = "";                  // vaciar el campo
input.placeholder = "Otra ciudad";
input.disabled = true;

input.getAttribute("placeholder"); // acceso genérico a atributos
input.setAttribute("aria-busy", "true");
input.removeAttribute("required");

// Mostrar / ocultar (el atributo hidden de HTML es una propiedad booleana)
const seccion = document.querySelector("#resultado");
seccion.hidden = false;            // mostrar
seccion.hidden = true;             // ocultar
```

### Clases y estilos

La forma correcta de cambiar la apariencia desde JavaScript es **cambiar clases**, no estilos directos. Así la decisión de cómo se ve algo sigue en CSS.

```js
const estado = document.querySelector("#estado");

estado.classList.add("error");
estado.classList.remove("error");
estado.classList.toggle("error");        // alterna
estado.classList.contains("error");      // true/false

// Estilos en línea: para valores calculados (por ejemplo, una posición dinámica)
estado.style.color = "red";              // equivale al atributo style="color: red"
estado.style.marginTop = "1rem";         // las propiedades con guion pasan a camelCase
```

### Crear y eliminar elementos

```js
const lista = document.querySelector("#pronostico");

// Crear
const li = document.createElement("li");
li.textContent = "Lunes: 30° / 18°";
li.classList.add("dia");

// Insertar
lista.append(li);                        // al final
lista.prepend(li);                       // al principio
lista.insertBefore(li, lista.firstChild);

// Eliminar
li.remove();

// Vaciar un contenedor
lista.innerHTML = "";                    // rápido y aceptable para vaciar
// o: lista.replaceChildren();
```

### Navegar el árbol

```js
const li = document.querySelector("#pronostico li");
li.parentElement          // el ul
li.nextElementSibling     // el siguiente li
li.previousElementSibling
li.children               // sus hijos (elementos)
li.closest("section")     // el ancestro más cercano que coincida con el selector
```

## 3.5 Eventos

Un **evento** es algo que ocurre: el usuario hace clic, escribe, mueve el mouse, envía un formulario; la página termina de cargar; llega una respuesta de red. Programar en el navegador es, en gran medida, **decidir qué hacer cuando ocurre cada evento**.

### Escuchar eventos

```js
const boton = document.querySelector("button");

boton.addEventListener("click", (evento) => {
  console.log("Hiciste clic");
});
```

`addEventListener(tipo, función)`: "cuando ocurra `tipo` sobre este elemento, ejecutá `función`". La función recibe un objeto **evento** con información sobre lo ocurrido.

Eventos comunes:

| Evento | Sobre | Cuándo |
|---|---|---|
| `click` | cualquier elemento | clic (o tap, o Enter sobre un botón) |
| `submit` | `form` | se envía el formulario (Enter en un campo, o clic en submit) |
| `input` | `input`, `textarea`, `select` | cada vez que el valor cambia (tecla a tecla) |
| `change` | `input`, `select` | cuando el valor cambió y el control perdió el foco |
| `keydown` | cualquier elemento enfocable | se presiona una tecla |
| `focus` / `blur` | controles | gana / pierde el foco |
| `DOMContentLoaded` | `document` | el DOM terminó de construirse |
| `load` | `window` | todo cargó, incluidas imágenes |

### El objeto evento

```js
formulario.addEventListener("submit", (evento) => {
  evento.preventDefault();   // ¡clave! cancela el comportamiento por defecto
  console.log(evento.type);          // "submit"
  console.log(evento.target);        // el elemento donde ocurrió
});

input.addEventListener("keydown", (evento) => {
  console.log(evento.key);           // "Enter", "a", "Escape"...
});
```

**`preventDefault()`** es fundamental para nuestra app. Recordá de la Parte 1: cuando un formulario se envía, el navegador por defecto recarga la página con los datos en la URL. Nosotros no queremos eso: queremos capturar la ciudad y pedir el clima sin salir de la página. `preventDefault()` le dice al navegador "yo me encargo".

### ¿Por qué `submit` y no `click` en el botón?

Porque el formulario se puede enviar de varias maneras: clic en el botón, Enter en el campo de texto, o (en un móvil) el botón "Ir" del teclado. Escuchar `submit` en el `<form>` captura todas. Escuchar `click` en el botón, solo una. Además, `submit` respeta la validación (`required`): si el campo está vacío, el navegador muestra su mensaje y el evento ni siquiera se dispara.

### Propagación

Cuando hacés clic en un `<li>` dentro de un `<ul>` dentro de una `<section>`, el evento "burbujea": primero lo recibe el `li`, luego el `ul`, luego la `section`, y así hasta `document`. Esto permite un patrón muy útil, la **delegación**: en vez de poner un listener en cada uno de 100 `li`, ponés uno en el `ul` y preguntás `evento.target` para saber cuál se clickeó.

```js
lista.addEventListener("click", (evento) => {
  const li = evento.target.closest("li");
  if (li) console.log("Clic en", li.textContent);
});
```

## 3.6 Asincronía: pedir datos al mundo exterior

Llegamos al punto que separa una página interactiva de una **aplicación**: obtener datos de un servidor.

### El problema

Como vimos en 3.3, JavaScript no espera. Si escribimos:

```js
const datos = pedirDatos("https://api.ejemplo.com/clima");   // ❌ esto no puede funcionar así
mostrar(datos);
```

la función `pedirDatos` tendría que bloquear todo el navegador hasta que llegue la respuesta. En cambio, el modelo es: **iniciá la petición y decime qué hacer cuando termine**.

### Promesas

Una **promesa** (`Promise`) es un objeto que representa un valor que **todavía no está disponible** pero lo estará (o fallará). Tiene tres estados: pendiente, cumplida (con un valor), rechazada (con un error).

```js
const promesa = fetch("https://api.ejemplo.com/clima");
// promesa está "pendiente". El código sigue sin esperar.

promesa
  .then((respuesta) => respuesta.json())    // cuando llegue, convertir a objeto (otra promesa)
  .then((datos) => mostrar(datos))          // cuando esté convertido, mostrar
  .catch((error) => console.error(error));  // si algo falla en cualquier paso
```

`.then` registra "qué hacer cuando se cumpla" y devuelve una nueva promesa, lo que permite encadenar. Funciona, pero se lee al revés de cómo pensamos.

### async / await

Desde 2017, JavaScript tiene azúcar sintáctico que hace que el código asíncrono **se lea como síncrono**:

```js
async function cargarClima() {
  try {
    const respuesta = await fetch("https://api.ejemplo.com/clima");
    const datos = await respuesta.json();
    mostrar(datos);
  } catch (error) {
    console.error("Falló:", error);
  }
}
```

- `async` marca a la función como asíncrona: siempre devuelve una promesa.
- `await` **pausa la función** (no el navegador; solo esta función) hasta que la promesa se resuelva, y devuelve su valor. Mientras tanto, el bucle de eventos sigue atendiendo clics y redibujando.
- Los errores se capturan con `try/catch` normal.

Lo que hay que internalizar: `await` no bloquea la página. La función se "suspende", el navegador atiende otras cosas, y cuando la respuesta llega, la función se reanuda desde donde estaba. Es el bucle de eventos de 3.3, con una sintaxis cómoda.

### fetch en detalle

`fetch(url, opciones)` hace una petición HTTP y devuelve una promesa de `Response`:

```js
const respuesta = await fetch("https://api.ejemplo.com/clima?ciudad=tucuman");

respuesta.ok         // true si el status es 200–299
respuesta.status     // 200, 404, 500...
await respuesta.json()   // parsea el cuerpo como JSON (es una promesa: el cuerpo también llega asíncrono)
await respuesta.text()   // o como texto plano
```

Un detalle importante: **`fetch` no rechaza la promesa por un error HTTP** (404, 500). Solo la rechaza si la petición no pudo hacerse (sin red, dominio inexistente). Por eso hay que verificar `respuesta.ok` a mano:

```js
const respuesta = await fetch(url);
if (!respuesta.ok) {
  throw new Error(`Error HTTP ${respuesta.status}`);
}
const datos = await respuesta.json();
```

### Qué es una API web

Una **API** (*Application Programming Interface*) web es un servidor que, en vez de devolver páginas HTML para personas, devuelve **datos** (normalmente JSON) para programas. Se le pide con una URL, igual que a una página:

```
https://api.open-meteo.com/v1/forecast?latitude=-26.82&longitude=-65.22&current=temperature_2m
```

- `https://api.open-meteo.com` es el servidor.
- `/v1/forecast` es el **recurso** o *endpoint*: qué se pide.
- Lo que sigue a `?` son los **parámetros de consulta** (*query string*): `clave=valor` separados por `&`. Detallan la petición.

Probá pegar esa URL en el navegador: vas a ver el JSON crudo. Eso es lo que `fetch` recibe.

### CORS: un obstáculo que vas a encontrar

Por seguridad, el navegador **no permite** que una página en `sitio-a.com` pida datos a `sitio-b.com` con `fetch`, **salvo que** `sitio-b.com` lo autorice explícitamente con un encabezado HTTP (`Access-Control-Allow-Origin`). Esto se llama **CORS** (*Cross-Origin Resource Sharing*).

Las APIs públicas pensadas para usarse desde el navegador (como Open-Meteo) envían ese encabezado. Muchas otras no, y vas a ver en la consola un error rojo que dice "blocked by CORS policy". No es un error de tu código: es el servidor que no autoriza. La solución en esos casos es un servidor intermedio propio (que vas a ver en materias de backend).

## 3.7 Práctica: un primer script

Antes del proyecto integrador, una práctica breve que junta todo. Creá `app.js` con este contenido y recargá la página:

```js
// 1. Seleccionar los elementos que vamos a usar
const formulario = document.querySelector("#buscador");
const input = document.querySelector("#ciudad");
const estado = document.querySelector("#estado");

// 2. Escuchar el envío del formulario
formulario.addEventListener("submit", (evento) => {
  // 3. Evitar la recarga de página
  evento.preventDefault();

  // 4. Leer lo que escribió el usuario
  const ciudad = input.value.trim();

  // 5. Modificar el DOM
  estado.textContent = `Buscando "${ciudad}"...`;
  estado.hidden = false;

  console.log("Ciudad ingresada:", ciudad);
});
```

Escribí una ciudad, dá Enter. La página no se recarga, aparece el mensaje debajo del formulario y en la consola queda el registro. Con esas 15 líneas ya están los cuatro pilares: **seleccionar, escuchar, leer, modificar**.


---

# Parte 4 — Proyecto integrador: la aplicación del clima

Todo lo anterior converge acá. Vamos a construir la aplicación en **ocho pasos**, cada uno agregando una capacidad sobre la anterior, y en cada uno vas a poder ejecutar y ver el resultado. Al final está el código completo.

## 4.1 Paso 0: entender la fuente de datos

Antes de escribir código hay que conocer la API. Usamos **Open-Meteo** (https://open-meteo.com), un servicio gratuito, sin registro ni clave, que permite peticiones desde el navegador (CORS habilitado). Ofrece dos endpoints que necesitamos:

### Geocodificación: de nombre a coordenadas

El servicio de pronóstico no entiende "Tucumán"; entiende latitud y longitud. Primero hay que traducir el nombre:

```
https://geocoding-api.open-meteo.com/v1/search?name=Tucuman&count=5&language=es&format=json
```

Pegalo en el navegador. Devuelve algo así (recortado):

```json
{
  "results": [
    {
      "id": 3836873,
      "name": "San Miguel de Tucumán",
      "latitude": -26.80833,
      "longitude": -65.2175,
      "country": "Argentina",
      "admin1": "Tucumán",
      "timezone": "America/Argentina/Tucuman"
    },
    { "name": "Tucumán", "latitude": -26.9, "longitude": -65.3, "country": "Argentina", "admin1": "Tucumán" }
  ]
}
```

Si no encuentra nada, **la clave `results` directamente no existe**. Hay que tenerlo en cuenta.

Parámetros: `name` (lo que busca), `count` (cuántos resultados como máximo), `language` (idioma de los nombres).

### Pronóstico: de coordenadas a clima

```
https://api.open-meteo.com/v1/forecast?latitude=-26.81&longitude=-65.22&current=temperature_2m,relative_humidity_2m,apparent_temperature,weather_code,wind_speed_10m&daily=weather_code,temperature_2m_max,temperature_2m_min&timezone=auto
```

Devuelve (recortado):

```json
{
  "timezone": "America/Argentina/Tucuman",
  "current_units": { "temperature_2m": "°C", "wind_speed_10m": "km/h", "relative_humidity_2m": "%" },
  "current": {
    "time": "2026-09-14T15:00",
    "temperature_2m": 27.4,
    "relative_humidity_2m": 41,
    "apparent_temperature": 26.1,
    "weather_code": 1,
    "wind_speed_10m": 14.8
  },
  "daily": {
    "time": ["2026-09-14", "2026-09-15", "2026-09-16", "2026-09-17", "2026-09-18", "2026-09-19", "2026-09-20"],
    "weather_code": [1, 3, 61, 2, 0, 0, 1],
    "temperature_2m_max": [29.1, 27.5, 22.0, 25.3, 28.8, 30.2, 31.0],
    "temperature_2m_min": [15.2, 16.0, 14.1, 12.5, 13.9, 15.5, 17.0]
  }
}
```

Observaciones para el diseño:

- `current` es un objeto con los valores actuales. Pedimos exactamente las variables que listamos en el parámetro `current`.
- `daily` tiene una estructura **columnar**: no es una lista de días, sino varias listas paralelas. El día `i` tiene fecha `daily.time[i]`, código `daily.weather_code[i]`, etc. Vamos a tener que recorrer por índice.
- `weather_code` es un número según el estándar **WMO**: 0 = despejado, 1–3 = nubosidad, 45–48 = niebla, 51–67 = llovizna/lluvia, 71–77 = nieve, 80–82 = chaparrones, 95–99 = tormenta. Tendremos que traducirlo a texto e ícono.
- `timezone=auto` hace que las horas vengan en la zona horaria de la ciudad.

Con esto claro, el flujo de la aplicación es:

```
usuario escribe ciudad
        │
        ▼
[1] geocoding: nombre → { lat, lon, nombre completo }
        │
        ▼
[2] forecast: lat, lon → { current, daily }
        │
        ▼
[3] traducir códigos, formatear → escribir en el DOM
```

## 4.2 Paso 1: el esqueleto del script

Reemplazá `app.js` por esto. Solo prepara el terreno: selecciona los elementos y define dos funciones auxiliares para los mensajes de estado.

```js
// ---------- Referencias al DOM ----------
const formulario = document.querySelector("#buscador");
const input = document.querySelector("#ciudad");
const boton = formulario.querySelector("button");
const estado = document.querySelector("#estado");
const resultado = document.querySelector("#resultado");

// ---------- Helpers de estado ----------
function mostrarEstado(mensaje, esError = false) {
  estado.textContent = mensaje;
  estado.classList.toggle("error", esError);
  estado.hidden = false;
}

function ocultarEstado() {
  estado.hidden = true;
}

// ---------- Evento principal ----------
formulario.addEventListener("submit", (evento) => {
  evento.preventDefault();
  const ciudad = input.value.trim();
  if (!ciudad) return;

  mostrarEstado(`Buscando ${ciudad}...`);
});
```

`classList.toggle("error", esError)` con segundo argumento es una forma compacta de "agregá la clase si es `true`, quitala si es `false`". La regla CSS `#estado.error` de la Parte 2 hace el resto.

## 4.3 Paso 2: geocodificar

Agregamos una función que dado un nombre devuelva la primera coincidencia. Es `async` porque adentro hay un `await`:

```js
// ---------- Servicios: hablar con la API ----------
async function buscarCiudad(nombre) {
  const url = new URL("https://geocoding-api.open-meteo.com/v1/search");
  url.searchParams.set("name", nombre);
  url.searchParams.set("count", "1");
  url.searchParams.set("language", "es");
  url.searchParams.set("format", "json");

  const respuesta = await fetch(url);
  if (!respuesta.ok) {
    throw new Error(`Error del servicio de geocodificación (${respuesta.status})`);
  }

  const datos = await respuesta.json();
  if (!datos.results || datos.results.length === 0) {
    throw new Error(`No encontré ninguna ciudad llamada "${nombre}".`);
  }

  const lugar = datos.results[0];
  return {
    nombre: lugar.name,
    region: lugar.admin1 ?? "",
    pais: lugar.country ?? "",
    latitud: lugar.latitude,
    longitud: lugar.longitude,
  };
}
```

Notas:

- **`new URL(...)` + `searchParams.set`** construye la URL de forma segura. Si el usuario escribe "São Paulo" o "Río Cuarto", los caracteres especiales se codifican solos. Concatenar strings a mano (`"...?name=" + nombre`) es la fuente de muchos bugs.
- **`throw new Error(...)`** para las situaciones anormales. Quien llame a esta función va a capturarlas con `try/catch` en un solo lugar. Esta función no sabe nada del DOM: solo trae datos o falla. Esa separación (servicios que traen datos vs. código que actualiza la pantalla) es la que hace que el código sea legible y probable.
- **`??`** (fusión de nulos) devuelve el lado derecho si el izquierdo es `null` o `undefined`. Algunos lugares no tienen `admin1`.
- Devolvemos **nuestro propio objeto**, con nombres en español y solo lo que necesitamos, en vez de pasar el objeto crudo de la API. Si mañana cambiamos de API, solo cambia esta función.

Conectalo en el evento para probar:

```js
formulario.addEventListener("submit", async (evento) => {
  evento.preventDefault();
  const ciudad = input.value.trim();
  if (!ciudad) return;

  try {
    mostrarEstado(`Buscando ${ciudad}...`);
    const lugar = await buscarCiudad(ciudad);
    mostrarEstado(`Encontré ${lugar.nombre}, ${lugar.pais} (${lugar.latitud}, ${lugar.longitud})`);
  } catch (error) {
    mostrarEstado(error.message, true);
  }
});
```

El manejador ahora es `async` para poder usar `await` adentro. Probá con "Tucumán", con "Berlin", con "xyzxyz" (error controlado) y, desconectando la red, con cualquier cosa (error de `fetch`).

## 4.4 Paso 3: obtener el pronóstico

Segunda función de servicio, con la misma forma que la anterior:

```js
async function obtenerClima(latitud, longitud) {
  const url = new URL("https://api.open-meteo.com/v1/forecast");
  url.searchParams.set("latitude", latitud);
  url.searchParams.set("longitude", longitud);
  url.searchParams.set("current", "temperature_2m,relative_humidity_2m,apparent_temperature,weather_code,wind_speed_10m");
  url.searchParams.set("daily", "weather_code,temperature_2m_max,temperature_2m_min");
  url.searchParams.set("timezone", "auto");

  const respuesta = await fetch(url);
  if (!respuesta.ok) {
    throw new Error(`Error del servicio meteorológico (${respuesta.status})`);
  }
  return respuesta.json();
}
```

Acá devolvemos el JSON crudo, porque la transformación a nuestro formato la haremos en el paso siguiente (es más interesante hacerla junto con la traducción de códigos).

En el manejador, encadená las dos llamadas:

```js
    const lugar = await buscarCiudad(ciudad);
    const clima = await obtenerClima(lugar.latitud, lugar.longitud);
    console.log(clima);
    mostrarEstado(`Ahora en ${lugar.nombre}: ${clima.current.temperature_2m}°C`);
```

Mirá el objeto en la consola. Ya tenés todos los datos; falta presentarlos.

## 4.5 Paso 4: traducir los códigos meteorológicos

Un pequeño **diccionario** que mapea el código WMO a descripción e ícono. Los códigos son muchos, así que los agrupamos por rango:

```js
// ---------- Traducción de códigos WMO ----------
const CODIGOS_CLIMA = [
  { codigos: [0],              descripcion: "Despejado",           icono: "☀️" },
  { codigos: [1],              descripcion: "Mayormente despejado", icono: "🌤️" },
  { codigos: [2],              descripcion: "Parcialmente nublado", icono: "⛅" },
  { codigos: [3],              descripcion: "Nublado",             icono: "☁️" },
  { codigos: [45, 48],         descripcion: "Niebla",              icono: "🌫️" },
  { codigos: [51, 53, 55],     descripcion: "Llovizna",            icono: "🌦️" },
  { codigos: [56, 57],         descripcion: "Llovizna helada",     icono: "🌧️" },
  { codigos: [61, 63, 65],     descripcion: "Lluvia",              icono: "🌧️" },
  { codigos: [66, 67],         descripcion: "Lluvia helada",       icono: "🌧️" },
  { codigos: [71, 73, 75, 77], descripcion: "Nieve",               icono: "🌨️" },
  { codigos: [80, 81, 82],     descripcion: "Chaparrones",         icono: "🌦️" },
  { codigos: [85, 86],         descripcion: "Chaparrones de nieve", icono: "🌨️" },
  { codigos: [95],             descripcion: "Tormenta",            icono: "⛈️" },
  { codigos: [96, 99],         descripcion: "Tormenta con granizo", icono: "⛈️" },
];

function describirCodigo(codigo) {
  const entrada = CODIGOS_CLIMA.find((e) => e.codigos.includes(codigo));
  return entrada ?? { descripcion: "Desconocido", icono: "❔" };
}
```

`Array.find` con `includes`: busca la primera entrada cuyo array de códigos contiene el código pedido. Si ninguna coincide, `find` devuelve `undefined` y `??` entrega el valor por defecto.

## 4.6 Paso 5: mostrar el clima actual

Ahora la función que **escribe en el DOM**. Es la única (junto con la del paso 7) que toca la página.

```js
// ---------- Presentación: escribir en el DOM ----------
const nombreCiudad = document.querySelector("#nombre-ciudad");
const temperatura = document.querySelector("#temperatura");
const descripcion = document.querySelector("#descripcion");
const sensacion = document.querySelector("#sensacion");
const humedad = document.querySelector("#humedad");
const viento = document.querySelector("#viento");

function mostrarActual(lugar, clima) {
  const actual = clima.current;
  const unidades = clima.current_units;
  const { descripcion: texto, icono } = describirCodigo(actual.weather_code);

  const ubicacion = [lugar.nombre, lugar.region, lugar.pais].filter(Boolean).join(", ");
  nombreCiudad.textContent = ubicacion;

  temperatura.textContent = `${Math.round(actual.temperature_2m)}${unidades.temperature_2m}`;
  descripcion.textContent = `${icono} ${texto}`;
  sensacion.textContent = `${Math.round(actual.apparent_temperature)}${unidades.apparent_temperature}`;
  humedad.textContent = `${actual.relative_humidity_2m}${unidades.relative_humidity_2m}`;
  viento.textContent = `${Math.round(actual.wind_speed_10m)} ${unidades.wind_speed_10m}`;
}
```

Detalles:

- `[a, b, c].filter(Boolean).join(", ")` es un idioma frecuente: arma "San Miguel de Tucumán, Tucumán, Argentina" pero, si la región viene vacía, omite el elemento en vez de dejar una coma doble. `filter(Boolean)` descarta los valores "falsos" (`""`, `null`, `undefined`).
- Tomamos las **unidades de la respuesta** (`current_units`) en lugar de escribir `°C` a mano. Si mañana pedimos Fahrenheit (Open-Meteo lo permite con `temperature_unit=fahrenheit`), la presentación se ajusta sola.
- `Math.round` para no mostrar "27.4°C": el decimal no aporta.
- La desestructuración con renombre (`descripcion: texto`) evita que la variable pise la referencia al elemento `descripcion` del DOM.

En el manejador, después de obtener el clima:

```js
    mostrarActual(lugar, clima);
    ocultarEstado();
    resultado.hidden = false;
```

Recargá y probá. La tarjeta aparece con datos reales. Falta la lista de días.

## 4.7 Paso 6: mostrar el pronóstico

Aquí creamos elementos dinámicamente. Por cada día, un `<li>` con tres `<span>` (día, ícono, temperaturas), que son los que la CSS de la Parte 2 ya sabe estilizar (`.dia`, `.icono`, `.max`, `.min`).

```js
const pronostico = document.querySelector("#pronostico");

function nombreDia(fechaISO, indice) {
  if (indice === 0) return "Hoy";
  // La fecha viene como "2026-09-15". Agregamos hora para que se interprete como local, no UTC.
  const fecha = new Date(`${fechaISO}T12:00:00`);
  return fecha.toLocaleDateString("es-AR", { weekday: "short" });   // "lun", "mar"...
}

function mostrarPronostico(clima) {
  const diario = clima.daily;
  pronostico.innerHTML = "";                 // limpiar resultados de una búsqueda anterior

  diario.time.forEach((fecha, i) => {
    const { icono } = describirCodigo(diario.weather_code[i]);

    const li = document.createElement("li");

    const dia = document.createElement("span");
    dia.className = "dia";
    dia.textContent = nombreDia(fecha, i);

    const ico = document.createElement("span");
    ico.className = "icono";
    ico.textContent = icono;

    const max = document.createElement("span");
    max.className = "max";
    max.textContent = `${Math.round(diario.temperature_2m_max[i])}°`;

    const min = document.createElement("span");
    min.className = "min";
    min.textContent = ` ${Math.round(diario.temperature_2m_min[i])}°`;

    li.append(dia, ico, max, min);
    pronostico.append(li);
  });
}
```

Notas:

- La estructura columnar de `daily` se recorre con `forEach` sobre `time`, usando el índice `i` para leer los otros arrays en paralelo.
- `toLocaleDateString("es-AR", { weekday: "short" })` le pide al navegador el nombre del día en español. Sin librerías.
- El truco de `T12:00:00`: `new Date("2026-09-15")` se interpreta como medianoche **UTC**, que en Argentina es las 21:00 del día anterior. Al agregar una hora, se interpreta como hora local. Es un clásico de los bugs con fechas.
- Creamos cada nodo con `createElement` y `textContent`. Es más verboso que armar un string HTML con `innerHTML`, pero es seguro (nada de lo que viene de la API se interpreta como HTML) y explícito. Más adelante, si preferís, podés usar `innerHTML` con una plantilla porque acá los datos son números e íconos que nosotros controlamos; pero la disciplina de `textContent` es la que hay que tener por defecto.

En el manejador:

```js
    mostrarActual(lugar, clima);
    mostrarPronostico(clima);
```

## 4.8 Paso 7: estados de la interfaz

Una aplicación se siente "terminada" cuando comunica bien lo que está pasando. Tres cosas que faltan:

1. **Mientras carga**, deshabilitar el botón para que no se envíe dos veces.
2. **Si hay error**, ocultar el resultado anterior (no dejar el clima de otra ciudad a la vista).
3. **Siempre**, volver a habilitar el botón, aunque haya fallado. Para eso está `finally`.

El manejador completo:

```js
formulario.addEventListener("submit", async (evento) => {
  evento.preventDefault();
  const ciudad = input.value.trim();
  if (!ciudad) return;

  boton.disabled = true;
  resultado.hidden = true;
  mostrarEstado(`Buscando ${ciudad}...`);

  try {
    const lugar = await buscarCiudad(ciudad);
    mostrarEstado(`Consultando el clima en ${lugar.nombre}...`);
    const clima = await obtenerClima(lugar.latitud, lugar.longitud);

    mostrarActual(lugar, clima);
    mostrarPronostico(clima);

    ocultarEstado();
    resultado.hidden = false;
  } catch (error) {
    mostrarEstado(error.message, true);
  } finally {
    boton.disabled = false;
  }
});
```

Observá la forma del bloque: **preparar → intentar → si falla, informar → siempre, restaurar**. Es el patrón de cualquier operación asíncrona con interfaz.

## 4.9 Paso 8: un toque final

Dos mejoras pequeñas que mejoran mucho la experiencia:

**Recordar la última ciudad.** `localStorage` guarda pares clave–valor (strings) que persisten al cerrar el navegador:

```js
// Al buscar con éxito:
localStorage.setItem("ultimaCiudad", ciudad);

// Al cargar la página (al final del archivo):
const ultima = localStorage.getItem("ultimaCiudad");
if (ultima) {
  input.value = ultima;
  formulario.requestSubmit();     // dispara el evento submit como si el usuario hubiera dado Enter
}
```

**Enfocar el campo al cargar**, para que el usuario pueda escribir directamente:

```js
input.focus();
```

## 4.10 El código completo

### `index.html`

```html
<!DOCTYPE html>
<html lang="es">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>¿Qué clima hace?</title>
  <link rel="stylesheet" href="estilos.css">
</head>
<body>
  <header>
    <h1>¿Qué clima hace?</h1>
    <p>Escribí una ciudad y te contamos.</p>
  </header>

  <main>
    <form id="buscador">
      <label for="ciudad">Ciudad</label>
      <input type="text" id="ciudad" name="ciudad"
             placeholder="Ej: San Miguel de Tucumán"
             autocomplete="off" required>
      <button type="submit">Buscar</button>
    </form>

    <p id="estado" hidden></p>

    <section id="resultado" hidden>
      <h2 id="nombre-ciudad"></h2>
      <p id="temperatura"></p>
      <p id="descripcion"></p>
      <dl id="detalles">
        <dt>Sensación térmica</dt>
        <dd id="sensacion"></dd>
        <dt>Humedad</dt>
        <dd id="humedad"></dd>
        <dt>Viento</dt>
        <dd id="viento"></dd>
      </dl>

      <h3>Próximos días</h3>
      <ul id="pronostico"></ul>
    </section>
  </main>

  <footer>
    <p>Datos: <a href="https://open-meteo.com" target="_blank">Open-Meteo</a></p>
  </footer>

  <script src="app.js"></script>
</body>
</html>
```

### `estilos.css`

El de la sección 2.9, sin cambios.

### `app.js`

```js
// =====================================================================
//  ¿Qué clima hace? — app.js
//  Estructura:
//    1. Referencias al DOM
//    2. Helpers de estado
//    3. Traducción de códigos WMO
//    4. Servicios (hablan con la API, no tocan el DOM)
//    5. Presentación (escriben en el DOM, no hablan con la API)
//    6. Evento principal (orquesta todo)
//    7. Inicialización
// =====================================================================

// ---------- 1. Referencias al DOM ----------
const formulario = document.querySelector("#buscador");
const input = document.querySelector("#ciudad");
const boton = formulario.querySelector("button");
const estado = document.querySelector("#estado");
const resultado = document.querySelector("#resultado");

const nombreCiudad = document.querySelector("#nombre-ciudad");
const temperatura = document.querySelector("#temperatura");
const descripcion = document.querySelector("#descripcion");
const sensacion = document.querySelector("#sensacion");
const humedad = document.querySelector("#humedad");
const viento = document.querySelector("#viento");
const pronostico = document.querySelector("#pronostico");

// ---------- 2. Helpers de estado ----------
function mostrarEstado(mensaje, esError = false) {
  estado.textContent = mensaje;
  estado.classList.toggle("error", esError);
  estado.hidden = false;
}

function ocultarEstado() {
  estado.hidden = true;
}

// ---------- 3. Traducción de códigos WMO ----------
const CODIGOS_CLIMA = [
  { codigos: [0],              descripcion: "Despejado",            icono: "☀️" },
  { codigos: [1],              descripcion: "Mayormente despejado", icono: "🌤️" },
  { codigos: [2],              descripcion: "Parcialmente nublado", icono: "⛅" },
  { codigos: [3],              descripcion: "Nublado",              icono: "☁️" },
  { codigos: [45, 48],         descripcion: "Niebla",               icono: "🌫️" },
  { codigos: [51, 53, 55],     descripcion: "Llovizna",             icono: "🌦️" },
  { codigos: [56, 57],         descripcion: "Llovizna helada",      icono: "🌧️" },
  { codigos: [61, 63, 65],     descripcion: "Lluvia",               icono: "🌧️" },
  { codigos: [66, 67],         descripcion: "Lluvia helada",        icono: "🌧️" },
  { codigos: [71, 73, 75, 77], descripcion: "Nieve",                icono: "🌨️" },
  { codigos: [80, 81, 82],     descripcion: "Chaparrones",          icono: "🌦️" },
  { codigos: [85, 86],         descripcion: "Chaparrones de nieve", icono: "🌨️" },
  { codigos: [95],             descripcion: "Tormenta",             icono: "⛈️" },
  { codigos: [96, 99],         descripcion: "Tormenta con granizo", icono: "⛈️" },
];

function describirCodigo(codigo) {
  const entrada = CODIGOS_CLIMA.find((e) => e.codigos.includes(codigo));
  return entrada ?? { descripcion: "Desconocido", icono: "❔" };
}

// ---------- 4. Servicios ----------
async function buscarCiudad(nombre) {
  const url = new URL("https://geocoding-api.open-meteo.com/v1/search");
  url.searchParams.set("name", nombre);
  url.searchParams.set("count", "1");
  url.searchParams.set("language", "es");
  url.searchParams.set("format", "json");

  const respuesta = await fetch(url);
  if (!respuesta.ok) {
    throw new Error(`Error del servicio de geocodificación (${respuesta.status})`);
  }

  const datos = await respuesta.json();
  if (!datos.results || datos.results.length === 0) {
    throw new Error(`No encontré ninguna ciudad llamada "${nombre}".`);
  }

  const lugar = datos.results[0];
  return {
    nombre: lugar.name,
    region: lugar.admin1 ?? "",
    pais: lugar.country ?? "",
    latitud: lugar.latitude,
    longitud: lugar.longitude,
  };
}

async function obtenerClima(latitud, longitud) {
  const url = new URL("https://api.open-meteo.com/v1/forecast");
  url.searchParams.set("latitude", latitud);
  url.searchParams.set("longitude", longitud);
  url.searchParams.set("current", "temperature_2m,relative_humidity_2m,apparent_temperature,weather_code,wind_speed_10m");
  url.searchParams.set("daily", "weather_code,temperature_2m_max,temperature_2m_min");
  url.searchParams.set("timezone", "auto");

  const respuesta = await fetch(url);
  if (!respuesta.ok) {
    throw new Error(`Error del servicio meteorológico (${respuesta.status})`);
  }
  return respuesta.json();
}

// ---------- 5. Presentación ----------
function mostrarActual(lugar, clima) {
  const actual = clima.current;
  const unidades = clima.current_units;
  const { descripcion: texto, icono } = describirCodigo(actual.weather_code);

  nombreCiudad.textContent = [lugar.nombre, lugar.region, lugar.pais].filter(Boolean).join(", ");
  temperatura.textContent = `${Math.round(actual.temperature_2m)}${unidades.temperature_2m}`;
  descripcion.textContent = `${icono} ${texto}`;
  sensacion.textContent = `${Math.round(actual.apparent_temperature)}${unidades.apparent_temperature}`;
  humedad.textContent = `${actual.relative_humidity_2m}${unidades.relative_humidity_2m}`;
  viento.textContent = `${Math.round(actual.wind_speed_10m)} ${unidades.wind_speed_10m}`;
}

function nombreDia(fechaISO, indice) {
  if (indice === 0) return "Hoy";
  const fecha = new Date(`${fechaISO}T12:00:00`);
  return fecha.toLocaleDateString("es-AR", { weekday: "short" });
}

function mostrarPronostico(clima) {
  const diario = clima.daily;
  pronostico.innerHTML = "";

  diario.time.forEach((fecha, i) => {
    const { icono } = describirCodigo(diario.weather_code[i]);

    const li = document.createElement("li");

    const dia = document.createElement("span");
    dia.className = "dia";
    dia.textContent = nombreDia(fecha, i);

    const ico = document.createElement("span");
    ico.className = "icono";
    ico.textContent = icono;

    const max = document.createElement("span");
    max.className = "max";
    max.textContent = `${Math.round(diario.temperature_2m_max[i])}°`;

    const min = document.createElement("span");
    min.className = "min";
    min.textContent = ` ${Math.round(diario.temperature_2m_min[i])}°`;

    li.append(dia, ico, max, min);
    pronostico.append(li);
  });
}

// ---------- 6. Evento principal ----------
formulario.addEventListener("submit", async (evento) => {
  evento.preventDefault();
  const ciudad = input.value.trim();
  if (!ciudad) return;

  boton.disabled = true;
  resultado.hidden = true;
  mostrarEstado(`Buscando ${ciudad}...`);

  try {
    const lugar = await buscarCiudad(ciudad);
    mostrarEstado(`Consultando el clima en ${lugar.nombre}...`);
    const clima = await obtenerClima(lugar.latitud, lugar.longitud);

    mostrarActual(lugar, clima);
    mostrarPronostico(clima);

    ocultarEstado();
    resultado.hidden = false;
    localStorage.setItem("ultimaCiudad", ciudad);
  } catch (error) {
    mostrarEstado(error.message, true);
  } finally {
    boton.disabled = false;
  }
});

// ---------- 7. Inicialización ----------
input.focus();

const ultima = localStorage.getItem("ultimaCiudad");
if (ultima) {
  input.value = ultima;
  formulario.requestSubmit();
}
```

## 4.11 Qué aprendiste, visto desde el código

Mirá el archivo final y ubicá cada concepto del curso:

| Concepto | Dónde está |
|---|---|
| HTML semántico, `label`+`input`, `form`, `dl`, `ul` vacío para llenar | `index.html` |
| Contenido vs presentación: `dl` que se ve como tabla, `ul` sin viñetas en grid | `estilos.css` + `index.html` sin cambios |
| Variables CSS y modo oscuro | `:root` y `@media (prefers-color-scheme)` |
| Flexbox (una dimensión) | `#buscador` |
| Grid (dos dimensiones, adaptable) | `#detalles`, `#pronostico` |
| Selección por selector CSS | Sección 1 de `app.js` |
| Eventos y `preventDefault` | Sección 6 |
| Modificar el DOM: `textContent`, `hidden`, `classList`, `createElement`, `append` | Secciones 2 y 5 |
| Asincronía: `async`/`await`, `fetch`, `try/catch/finally` | Secciones 4 y 6 |
| APIs web, query strings, JSON | Sección 4 |
| Separación servicios / presentación / orquestación | La estructura entera |

---

## Apéndice: glosario

- **API** — Interfaz que un programa expone para que otros programas la usen. Una API web se consume por HTTP y suele devolver JSON.
- **Asíncrono** — Que no espera: inicia una operación y continúa; el resultado llega más tarde.
- **Atributo** — Par nombre="valor" dentro de una etiqueta HTML que la configura.
- **Cascada** — Algoritmo de CSS para decidir qué regla gana cuando varias aplican al mismo elemento.
- **CORS** — Mecanismo por el cual un servidor autoriza a páginas de otros orígenes a pedirle datos.
- **DOM** — Árbol en memoria que representa la página y la API para manipularlo.
- **Elemento** — Unidad básica de HTML: etiqueta de apertura, contenido, etiqueta de cierre.
- **Endpoint** — URL específica de una API que atiende un tipo de petición.
- **Especificidad** — Peso de un selector CSS; determina prioridad en la cascada.
- **Evento** — Suceso al que el código puede reaccionar: clic, tecla, envío, respuesta de red.
- **Event loop** — Mecanismo del navegador que ejecuta, de a una, las tareas encoladas por los eventos.
- **fetch** — API del navegador para hacer peticiones HTTP.
- **Flexbox / Grid** — Sistemas de layout de CSS para una y dos dimensiones respectivamente.
- **HTTP** — Protocolo con el que navegador y servidor intercambian peticiones y respuestas.
- **JSON** — Formato de texto para datos estructurados, basado en la sintaxis de objetos de JavaScript.
- **Modelo de caja** — Contenido + padding + borde + margen: la geometría de todo elemento.
- **Promesa** — Objeto que representa un valor futuro; se resuelve o se rechaza.
- **Query string** — Parte de la URL después de `?`, con parámetros `clave=valor`.
- **Selector** — Expresión que indica a qué elementos aplica una regla CSS (o una búsqueda en el DOM).
- **Semántica** — Significado de una etiqueta, independiente de su apariencia.
