# Desarrollo web: del documento a una aplicación del clima

**HTML, CSS y JavaScript en el navegador**

Se presuponen conocimientos de JavaScript: valores, variables, funciones, condicionales, objetos y arreglos. El recorrido se concentra en HTML, CSS, el entorno del navegador, el DOM y la integración con servicios web.

**Proyecto final:** una aplicación en la que escribís una ciudad, elegís la ubicación correcta y consultás temperatura, sensación térmica, humedad, viento y condiciones meteorológicas. El proyecto usa archivos sencillos y una API pública; no requiere un framework ni una clave para el uso educativo propuesto.

En lenguaje cotidiano decimos «consultar el clima». Técnicamente mostraremos el **tiempo meteorológico actual**; el clima describe patrones de períodos prolongados. Conservamos «app del clima» como nombre del proyecto.

## Contenido

- [1. Qué ocurre cuando abrimos una página](#1-qué-ocurre-cuando-abrimos-una-página)
- [2. HTML: origen y problema que resuelve](#2-html-origen-y-problema-que-resuelve)
- [3. Sintaxis y estructura de HTML](#3-sintaxis-y-estructura-de-html)
- [4. Componentes básicos y HTML con significado](#4-componentes-básicos-y-html-con-significado)
- [5. CSS: historia y separación de la presentación](#5-css-historia-y-separación-de-la-presentación)
- [6. Sintaxis, selectores, cascada e herencia](#6-sintaxis-selectores-cascada-e-herencia)
- [7. Propiedades CSS por categorías](#7-propiedades-css-por-categorías)
- [8. Distribución y diseño adaptable](#8-distribución-y-diseño-adaptable)
- [9. JavaScript y su entorno de ejecución](#9-javascript-y-su-entorno-de-ejecución)
- [10. DOM, eventos y una primera página dinámica](#10-dom-eventos-y-una-primera-página-dinámica)
- [11. Asincronía, HTTP, JSON y APIs](#11-asincronía-http-json-y-apis)
- [12. Proyecto integrado: estructura y presentación](#12-proyecto-integrado-estructura-y-presentación)
- [13. Proyecto integrado: JavaScript paso a paso](#13-proyecto-integrado-javascript-paso-a-paso)
- [14. Reconstruir una consulta completa](#14-reconstruir-una-consulta-completa)
- [15. Herramientas de diagnóstico](#15-herramientas-de-diagnóstico)
- [16. Glosario breve](#16-glosario-breve)
- [17. Fuentes](#17-fuentes)

## 1. Qué ocurre cuando abrimos una página

**Internet** es la infraestructura que conecta redes de computadoras. La **Web** es uno de los servicios que funciona sobre esa infraestructura: permite acceder a recursos enlazados mediante direcciones y protocolos compartidos. El correo electrónico también puede utilizar Internet; Internet y Web no son sinónimos.

En una visita típica a un sitio:

```text
Usuario escribe una dirección
          ↓
Navegador solicita un recurso por HTTP o HTTPS
          ↓
Servidor responde con HTML
          ↓
Navegador interpreta HTML y solicita CSS, JS e imágenes referenciadas
          ↓
Navegador organiza, dibuja y hace interactiva la página
```

El **cliente** es quien solicita el recurso; en este caso, el navegador. El **servidor** recibe solicitudes y entrega respuestas. No necesariamente es una computadora dedicada: durante el desarrollo tu propia computadora puede cumplir ambos papeles.

Una URL identifica un recurso. En `https://ejemplo.com/apuntes/html.html`, `https` es el esquema, `ejemplo.com` es el nombre del servidor y `/apuntes/html.html` es la ruta. Más adelante agregaremos parámetros de consulta después de `?`.

El navegador no muestra literalmente el archivo HTML: lo interpreta. Construye estructuras internas, determina estilos, calcula tamaños y posiciones y dibuja el resultado. Si JavaScript modifica la página, puede actualizar esa representación sin pedir un documento completo nuevo.

### Las tres responsabilidades

| Tecnología | Responsabilidad | En la app del clima |
| --- | --- | --- |
| HTML | Contenido y significado | Un formulario, un título y una lista de mediciones |
| CSS | Presentación del contenido | Colores, espacios, tipografía y distribución |
| JavaScript | Respuesta a acciones y cambios | Buscar, consultar datos y actualizar resultados |

Esta separación organiza el trabajo, pero no es una frontera absoluta. HTML ya trae comportamientos como navegar con un enlace, enviar un formulario y validar un campo obligatorio. CSS responde a estados como el foco y a condiciones como el ancho disponible. JavaScript permite coordinar lógica más general.

## 2. HTML: origen y problema que resuelve

HTML significa **HyperText Markup Language**, lenguaje de marcado de hipertexto. Un lenguaje de marcado usa señales dentro de un texto para describir su estructura y significado. El hipertexto permite relacionar documentos mediante enlaces.

Tim Berners-Lee propuso la Web en CERN en 1989 para facilitar el intercambio de información. Hacia fines de 1990 ya había implementado sus componentes iniciales, entre ellos HTML, HTTP, direcciones URL, un navegador y un servidor. La necesidad era compartir documentos conectados entre computadoras y equipos de trabajo. [CERN: nacimiento de la Web](https://home.cern/science/computing/the-birth-of-the-web/) y [CERN: componentes iniciales](https://home.cern/world-wide-web-35/).

Imaginá un documento que contiene estas líneas:

```text
El tiempo en Córdoba
La temperatura es de 23 grados.
Más información
```

Para una persona, la primera línea podría ser un título. Para un programa, son tres líneas sin significado explícito. HTML permite expresar esa intención:

```html
<h1>El tiempo en Córdoba</h1>
<p>La temperatura es de 23 grados.</p>
<a href="https://open-meteo.com/">Más información meteorológica</a>
```

Ahora el navegador sabe que hay un encabezado principal, un párrafo y un enlace. También pueden aprovechar esa estructura tecnologías de asistencia, buscadores y otras herramientas.

HTML es un lenguaje **declarativo**: describís los elementos que necesitás. Por sí solo no expresa un algoritmo general como «consultá este servicio, compará los resultados y repetí la operación».

### Contenido, significado y presentación

Consideremos tres decisiones diferentes:

- **Contenido:** el texto «El tiempo en Córdoba».
- **Estructura y significado:** ese texto es el encabezado principal de la página.
- **Presentación:** se dibuja con cierto tamaño, color y espaciado.

`<h1>` expresa la segunda decisión. CSS controla la tercera. No elegimos un encabezado por su tamaño visual: elegimos su nivel por la relación entre las partes del documento.

El navegador incluye estilos predeterminados. Por eso un HTML sin una hoja CSS propia no se ve como texto plano. El autor puede cambiar la presentación conservando el significado.

## 3. Sintaxis y estructura de HTML

### 3.1. Etiquetas, elementos y atributos

```html
<p class="resumen">Hoy hay cielo despejado.</p>
```

| Parte | Nombre | Función |
| --- | --- | --- |
| `<p class="resumen">` | Etiqueta de apertura | Inicia el párrafo y declara un atributo |
| `class="resumen"` | Atributo y valor | Asigna una clase que se puede reutilizar |
| `Hoy hay cielo despejado.` | Contenido | Texto del párrafo |
| `</p>` | Etiqueta de cierre | Termina el párrafo |
| El conjunto completo | Elemento | Unidad de la estructura |

Los atributos se escriben en la apertura. Usaremos nombres de etiquetas en minúscula y valores entre comillas. Las comillas delimitan el valor; no son parte del texto visible.

Una **clase** identifica un grupo reutilizable. Un **id** identifica un elemento y debe ser único dentro del documento:

```html
<p id="estado" class="mensaje destacado">Buscando ciudad…</p>
```

Este párrafo tiene un identificador y dos clases, separadas por un espacio. Las clases no generan un aspecto visual por su nombre: debe existir una regla CSS que las utilice.

### 3.2. Anidamiento y relaciones

```html
<section>
  <h2>Condiciones actuales</h2>
  <p>La temperatura es de <strong>23 °C</strong>.</p>
</section>
```

`section` contiene dos elementos hijos: `h2` y `p`. Son hermanos. `strong` es hijo de `p` y descendiente de `section`. Esta estructura en forma de árbol será fundamental para comprender selectores y DOM.

Las etiquetas se cierran en el orden inverso al que se abrieron:

```html
<!-- Correcto -->
<p>Temperatura <strong>actual</strong>.</p>

<!-- Incorrecto: las etiquetas se cruzan -->
<p>Temperatura <strong>actual.</p></strong>
```

La sangría facilita la lectura, pero no define quién contiene a quién: lo hacen las etiquetas. El navegador intenta recuperarse de HTML incorrecto; que algo «se vea» no demuestra que esté bien estructurado.

### 3.3. Elementos vacíos y atributos booleanos

Algunos elementos, como `img`, `input`, `meta` y `link`, no admiten contenido ni etiqueta de cierre:

```html
<input type="text" required>
<img src="ciudad.jpg" alt="Vista de la plaza principal de Córdoba">
```

En HTML no se escribe `</input>` ni `</img>`. La barra final de la notación `<input />` no es necesaria.

`required`, `disabled` y `hidden` son ejemplos de atributos booleanos: **su presencia los activa**. `disabled="false"` igualmente deshabilita el control; para habilitarlo hay que quitar ese atributo. En JavaScript sí podremos usar la propiedad `elemento.disabled = false`.

### 3.4. Documento mínimo completo

Un documento HTML mínimo, codificado como UTF-8:

```html
<!doctype html>
<html lang="es">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Mi primera página</title>
</head>
<body>
  <h1>Mi primera página del clima</h1>
  <p>Estoy aprendiendo a estructurar contenido.</p>
</body>
</html>
```

| Componente | Explicación |
| --- | --- |
| `<!doctype html>` | Activa el modo de estándares del navegador; no es un elemento visible |
| `html` | Elemento raíz que contiene el documento |
| `lang="es"` | Declara el idioma principal del contenido |
| `head` | Reúne metadatos y referencias a recursos |
| `charset="UTF-8"` | Indica la codificación de caracteres |
| `viewport` | Permite que el ancho de diseño acompañe el dispositivo en móviles |
| `title` | Título del documento, usado en la pestaña y los marcadores |
| `body` | Contiene los elementos de la página |

`head`, `header` y `h1` tienen propósitos distintos. `head` contiene metadatos; `header` organiza una introducción dentro del cuerpo; `h1` es un encabezado del contenido.

Los documentos HTML son archivos de texto, habitualmente con extensión `.html`.

### 3.5. Espacios, comentarios y caracteres especiales

En el flujo de texto normal, varios espacios o saltos de línea del código suelen colapsar visualmente. No se organiza una página agregando espacios repetidos. Para párrafos usamos `p`; para separación visual, CSS. `pre` conserva espacios y saltos cuando realmente forman parte del contenido.

```html
<!-- Este comentario ayuda a quien lee el archivo. -->
<p>La etiqueta &lt;p&gt; representa un párrafo.</p>
<p>HTML &amp; CSS trabajan juntos.</p>
```

`&lt;`, `&gt;` y `&amp;` representan `<`, `>` y `&`. Un comentario no se muestra en la página, pero cualquiera puede verlo al inspeccionar el archivo: no sirve para ocultar secretos.

Referencia de sintaxis: [MDN: estructura de elementos y documentos HTML](https://developer.mozilla.org/en-US/docs/Learn_web_development/Core/Structuring_content/Basic_HTML_syntax).

## 4. Componentes básicos y HTML con significado

### 4.1. Texto y estructura de página

| Elementos | Para qué se usan | Criterio práctico |
| --- | --- | --- |
| `h1` a `h6` | Encabezados de distintos niveles | En este proyecto habrá un `h1`; los apartados principales usarán `h2` |
| `p` | Párrafo | Una idea o unidad de texto |
| `strong`, `em` | Importancia y énfasis | El significado importa más que su aspecto predeterminado |
| `ul`, `ol`, `li` | Listas sin orden o con secuencia | Usá `ol` cuando cambiar el orden cambie el sentido |
| `dl`, `dt`, `dd` | Términos y descripciones o valores | Útiles para «Humedad: 60 %» |
| `header` | Introducción de una página o sección | Puede contener título y descripción |
| `nav` | Grupo de enlaces de navegación | Reservalo para navegación relevante |
| `main` | Contenido principal | Un único `main` visible en esta página |
| `section` | Sección temática | Normalmente tiene un encabezado |
| `article` | Contenido que puede entenderse por sí mismo | Por ejemplo, una noticia |
| `footer` | Información de cierre | Fuentes, autoría o enlaces relacionados |
| `div`, `span` | Agrupaciones sin significado específico | Cuando no hay un elemento semántico adecuado |

Un `div` suele iniciar una caja de bloque y un `span` suele participar en una línea de texto. Eso es comportamiento visual predeterminado, modificable con `display` en CSS; no equivale a su significado.

### 4.2. Enlaces, rutas e imágenes

```html
<a href="https://open-meteo.com/">Visitar Open-Meteo</a>
<a href="acerca.html">Acerca de este proyecto</a>
<a href="#fuentes">Ir a las fuentes</a>

<h2 id="fuentes">Fuentes de los datos</h2>
```

El primer enlace usa una URL absoluta; el segundo busca un archivo relativo a la ubicación del documento; el tercero apunta a un identificador dentro de la página. El texto del enlace debe anticipar el destino: «Documentación de la API» informa más que «clic aquí».

Una imagen de contenido puede agruparse con su descripción mediante `figure` y `figcaption`:

```html
<figure>
  <img src="ciudad.jpg" alt="Edificios alrededor de una plaza arbolada"
    width="640" height="360">
  <figcaption>Una ciudad que podemos consultar.</figcaption>
</figure>
```

El texto `alt` comunica la información visual relevante cuando la imagen no puede verse. Una imagen exclusivamente decorativa puede llevar `alt=""`. `width` y `height` ayudan a reservar espacio; CSS puede adaptar la imagen a su contenedor. La aplicación final no necesita imágenes para funcionar.

### 4.3. Datos tabulares

Una tabla sirve cuando la relación entre filas y columnas es parte del significado:

```html
<table>
  <caption>Temperaturas de práctica, inventadas</caption>
  <thead>
    <tr><th scope="col">Ciudad</th><th scope="col">Temperatura</th></tr>
  </thead>
  <tbody>
    <tr><th scope="row">Córdoba</th><td>23 °C</td></tr>
    <tr><th scope="row">Salta</th><td>20 °C</td></tr>
  </tbody>
</table>
```

`tr` define una fila; `th`, una celda de encabezado; `td`, una celda de datos. No usamos tablas para ubicar el menú al lado del contenido: ese problema de presentación se resuelve con CSS.

### 4.4. Formularios y comportamiento nativo

```html
<form action="index.html" method="get">
  <label for="ciudad">Ciudad</label>
  <input id="ciudad" name="ciudad" type="search" required minlength="2">
  <button type="submit">Buscar</button>
</form>
```

`label` se conecta al campo porque su `for` coincide con el `id`. Al pulsar la etiqueta se enfoca el campo. `name` identifica el dato en un envío: no cumple el mismo papel que `id`. `type="search"` expresa la finalidad del campo. `required` impide un envío normal vacío y `minlength` agrega una restricción de longitud.

El formulario ya sabe reaccionar al botón y al envío con Enter. Si es válido, `method="get"` envía los valores como parámetros de la URL. `action="index.html"` apunta a nuestro documento de práctica; puede recargarlo con `?ciudad=...`. Todavía no hay un servicio que transforme ese nombre en un resultado.

Después JavaScript interceptará el evento `submit` y gestionará la consulta sin navegar a otro documento. No necesita inventar un botón con un `div` ni detectar manualmente cada pulsación de Enter.

Otros controles importantes:

| Elemento o atributo | Función |
| --- | --- |
| `input type="email"` | Campo con semántica y validación básica de correo |
| `input type="number"` | Valor numérico, con restricciones como `min` y `max` |
| `input type="checkbox"` | Elección que puede estar marcada o desmarcada |
| `input type="radio"` | Elección excluyente dentro de un grupo con el mismo `name` |
| `textarea` | Texto de varias líneas |
| `select` y `option` | Selección entre opciones |
| `fieldset` y `legend` | Agrupación de campos con un título |
| `button type="button"` | Botón que no envía automáticamente el formulario |
| `placeholder` | Ejemplo breve dentro del campo; no reemplaza una etiqueta |
| `disabled` | Control deshabilitado; no participa del envío nativo |

La validación del navegador ayuda al usuario, pero no garantiza la validez de los datos en un servidor. Además, `required` sobre un campo de texto no significa «contiene un nombre real»: una cadena de espacios requiere una comprobación adicional.

## 5. CSS: historia y separación de la presentación

CSS significa **Cascading Style Sheets**, hojas de estilo en cascada. Permite declarar cómo deben presentarse los elementos de un documento.

A medida que la Web creció, aumentó la necesidad de controlar tipografías, colores y distribución. Mezclar decisiones visuales dentro del HTML hacía difícil reutilizar diseños y mantener muchas páginas. Håkon Wium Lie presentó una propuesta de hojas de estilo en 1994; Bert Bos se sumó al desarrollo. CSS1 se convirtió en una recomendación de W3C en diciembre de 1996. [W3C: historia de CSS](https://www.w3.org/Style/CSS20/history.html).

Supongamos que cien páginas deben compartir el mismo color de encabezado. Si la decisión está repetida dentro de cada documento, cambiarla exige revisar cien lugares. Si todas enlazan una hoja de estilos, podemos modificar una regla compartida.

La separación también permite cambiar la presentación para una pantalla pequeña o para impresión manteniendo el mismo contenido. No consiste simplemente en tener archivos separados: importa que el HTML describa lo que es cada elemento y que CSS concentre las decisiones visuales.

### Tres maneras de incorporar CSS

**En un atributo**, para un estilo local:

```html
<p style="color: teal;">Temperatura actual</p>
```

**Dentro del documento**, con un elemento `style` en `head`:

```html
<style>
  p { color: teal; }
</style>
```

**En un archivo externo**, nuestra opción para la aplicación:

```html
<link rel="stylesheet" href="styles.css">
```

El elemento `link` referencia la hoja desde `head`. En un archivo CSS se escriben reglas directamente, **sin** etiquetas `<style>`.

Un archivo externo facilita compartir y mantener estilos. El estilo en un atributo puede servir en situaciones puntuales, pero repetirlo por toda la página hace más difíciles los cambios.

## 6. Sintaxis, selectores, cascada e herencia

### 6.1. Anatomía de una regla

```css
.tarjeta {
  color: #173342;
  background-color: white;
  padding: 1rem;
}
```

`.tarjeta` es el **selector**: indica a qué elementos se aplica la regla. Entre llaves está el **bloque de declaraciones**. Cada declaración une una **propiedad** y un **valor** mediante `:`; se separan con `;`.

CSS no dice «recorré cada tarjeta y pintala». Declara una condición: los elementos que coinciden con ese selector reciben esas declaraciones cuando la cascada las determina como ganadoras.

Los comentarios CSS se escriben `/* así */`. Si una propiedad o un valor no son válidos, el navegador suele descartar esa declaración. Una llave faltante puede afectar una región más amplia de la hoja.

### 6.2. Selectores esenciales

| Tipo | Ejemplo | Qué selecciona |
| --- | --- | --- |
| Universal | `*` | Todos los elementos |
| Por elemento | `p` | Todos los párrafos |
| Por clase | `.tarjeta` | Elementos cuya clase incluya `tarjeta` |
| Por identificador | `#estado` | El elemento con ese `id` |
| Por atributo | `input[type="search"]` | Campos cuyo atributo coincida |
| Lista | `h1, h2` | Los elementos que coincidan con cualquiera de esos selectores |
| Descendiente | `.tarjeta p` | Párrafos a cualquier profundidad dentro de una tarjeta |
| Hijo directo | `.tarjeta > p` | Párrafos cuyo padre inmediato sea la tarjeta |
| Hermano siguiente | `label + input` | Un `input` inmediatamente después de un `label` con el mismo padre |
| Pseudoclase | `button:hover` | Botones sobre los que está el puntero |
| Pseudoclase de foco | `input:focus-visible` | Campos cuyo foco el navegador considera que debe verse |
| Pseudoelemento | `p::first-letter` | La primera letra de un párrafo en las condiciones aplicables |

No es lo mismo `.tarjeta .destacado` que `.tarjeta.destacado`. El primero busca un descendiente; el segundo selecciona un mismo elemento que tenga ambas clases.

```html
<section class="tarjeta destacado">
  <p>Primer párrafo.</p>
  <div><p>Segundo párrafo.</p></div>
</section>
```

### 6.3. Cuando dos reglas quieren definir lo mismo

```html
<p class="aviso" id="estado">Buscando ciudad…</p>
```

```css
p { color: navy; }
.aviso { color: green; }
#estado { color: darkred; }
```

En este ejemplo gana el rojo oscuro del selector por identificador. Para entenderlo hay que distinguir **cascada** y **especificidad**.

La cascada resuelve las declaraciones que compiten por una propiedad. Considera, entre otros factores, su origen —navegador, usuario o autor—, importancia, capas y especificidad. En el caso introductorio de **declaraciones normales del autor, sin capas ni estilos en atributos**, comparamos especificidad y, si empatan, orden de aparición.

Podemos leer la especificidad de los selectores básicos con tres columnas:

| Selector | IDs | Clases, atributos y pseudoclases | Elementos y pseudoelementos |
| --- | --- | --- | --- |
| `p` | 0 | 0 | 1 |
| `.aviso` | 0 | 1 | 0 |
| `p.aviso` | 0 | 1 | 1 |
| `#estado` | 1 | 0 | 0 |
| `#estado.aviso` | 1 | 1 | 0 |

Se comparan las columnas de izquierda a derecha. **No se suman como un número decimal**. El selector universal y los combinadores, como `>` o el espacio, no agregan peso por sí mismos.

```css
.aviso { color: green; }
.aviso { color: purple; }
```

Ahora la especificidad empata: gana la declaración que aparece después. Por eso «siempre gana la última regla» es una explicación incompleta.

Los estilos en atributos tienen una prioridad particular dentro de las declaraciones normales del autor. `!important` modifica la etapa de importancia de la cascada; no es un incremento de especificidad. Este proyecto no utiliza `!important`.

### 6.4. Herencia

```css
body {
  color: #173342;
  font-family: system-ui, sans-serif;
}
```

Muchas propiedades de texto se heredan de los ancestros cuando el elemento no obtiene otro valor aplicable. Esto evita repetir la fuente en cada párrafo. En cambio, propiedades como `margin`, `padding` y `border` no se heredan normalmente.

Una declaración aplicada directamente a un hijo no «compite en especificidad» con el color que podría heredar de su padre: la herencia se usa cuando corresponde, después de resolver los valores del propio elemento. Para que los controles sigan la tipografía de la página usaremos explícitamente `font: inherit`.

Referencia para profundizar: [MDN: cascada, especificidad e herencia](https://developer.mozilla.org/en-US/docs/Learn_web_development/Core/Styling_basics/Handling_conflicts).

## 7. Propiedades CSS por categorías

Las propiedades se organizan según la dimensión de presentación que controlan. Una tarjeta permite observar su efecto sobre un contenido concreto:

```html
<section class="tarjeta">
  <h2>Córdoba</h2>
  <p class="temperatura">23 °C</p>
  <p>Dato inventado para practicar estilos.</p>
</section>
```

### 7.1. Valores y unidades: con qué medimos

| Unidad o valor | Qué expresa | Uso inicial |
| --- | --- | --- |
| `px` | Píxel CSS, no necesariamente un píxel físico | Bordes finos |
| `%` | Proporción de una referencia que depende de la propiedad | Ancho relativo al contenedor |
| `rem` | Múltiplo del tamaño de fuente del elemento raíz | Texto, espacios y límites |
| `em` | Relativo a la fuente; en `font-size`, a la del padre | Medidas que acompañan al componente |
| `vw`, `vh` | Porcentaje del ancho o alto del viewport | Tamaños ligados a la ventana |
| `auto` | Valor calculado según la propiedad y el contexto | Márgenes para centrar un bloque limitado |
| `0` | Cero, generalmente sin unidad | Quitar márgenes o bordes |

Si la fuente raíz es de 16 píxeles CSS, `1.5rem` equivale a 24 píxeles CSS. No conviene asumir que todos los usuarios conservan esa configuración. Por eso mantenemos medidas que se adapten al texto.

En móviles, el alto visible cambia cuando aparecen barras del navegador; las unidades `svh`, `lvh` y `dvh` distinguen variantes de ese viewport. Nuestra aplicación deja crecer su contenido y no necesita fijar la altura de la pantalla.

### 7.2. Texto y tipografía: cómo se lee

| Propiedad | Ejemplo | Efecto |
| --- | --- | --- |
| `font-family` | `system-ui, sans-serif` | Familia preferida y alternativa |
| `font-size` | `1.2rem` | Tamaño del texto |
| `font-weight` | `700` | Grosor tipográfico |
| `line-height` | `1.6` | Altura de línea; sin unidad acompaña el tamaño de fuente |
| `text-align` | `center` | Alineación del contenido en línea dentro de la caja |
| `text-decoration` | `underline` | Decoración como subrayado |
| `letter-spacing` | `0.02em` | Separación adicional entre caracteres |
| `overflow-wrap` | `anywhere` | Permite cortar secuencias muy largas para evitar desbordamientos |

```css
body {
  font-family: system-ui, sans-serif;
  font-size: 1rem;
  line-height: 1.6;
}

.temperatura {
  font-size: 3rem;
  font-weight: 700;
  line-height: 1.2;
}
```

El dato principal destaca por tamaño y peso, mientras los párrafos mantienen una altura de línea cómoda. `text-align: center` centra texto y contenido en línea; no es una instrucción universal para centrar cualquier caja.

### 7.3. Colores y superficies: qué se distingue

| Propiedad | Ejemplo | Efecto |
| --- | --- | --- |
| `color` | `#172d39` | Color del texto |
| `background-color` | `#f3f6f8` | Color del fondo |
| `background-image` | `url("fondo.jpg")` | Imagen de fondo decorativa |
| `border` | `1px solid #748591` | Grosor, estilo y color del borde |
| `border-radius` | `0.75rem` | Redondeo de esquinas |
| `box-shadow` | `0 2px 8px #00000020` | Sombra: desplazamientos, desenfoque y color |
| `opacity` | `0.65` | Transparencia de todo el elemento y su contenido |

Podés usar nombres (`white`), valores hexadecimales (`#086b70`) o funciones como `rgb(8 107 112)`. En `#00000020`, los dos últimos dígitos representan transparencia alfa.

```css
.tarjeta {
  color: #172d39;
  background-color: white;
  border: 1px solid #748591;
  border-radius: 0.75rem;
}
```

Un fondo no agrega contenido semántico. Una imagen que comunica información necesita una representación adecuada en HTML, no solamente una imagen decorativa en CSS.

### 7.4. Modelo de caja: cuánto espacio ocupa algo

Cada caja se puede entender en cuatro capas:

```text
┌──────────────────── margin: espacio exterior ────────────────────┐
│   ┌──────────────── border: límite de la caja ────────────────┐   │
│   │   ┌──────────── padding: espacio interior ────────────┐   │   │
│   │   │                  contenido                       │   │   │
│   │   └──────────────────────────────────────────────────┘   │   │
│   └──────────────────────────────────────────────────────────┘   │
└──────────────────────────────────────────────────────────────────┘
```

| Propiedad | Dimensión que controla |
| --- | --- |
| `width`, `height` | Ancho o alto solicitado |
| `min-width`, `min-height` | Tamaño mínimo permitido |
| `max-width`, `max-height` | Límite superior del tamaño |
| `padding` | Espacio entre contenido y borde |
| `margin` | Espacio exterior solicitado |
| `box-sizing` | Partes incluidas en el ancho o alto |
| `overflow` | Tratamiento del contenido que desborda |

Con el modelo inicial `content-box`, `width` define el ancho del contenido:

```css
.tarjeta {
  width: 300px;
  padding: 20px;
  border: 2px solid;
}
```

Su ancho hasta el borde exterior será **300 + 20 + 20 + 2 + 2 = 344 píxeles CSS**, sin contar márgenes. Con `box-sizing: border-box`, los 300 ya incluyen contenido, relleno y bordes: quedan 256 para contenido.

```css
* { box-sizing: border-box; }
```

Esta regla facilita razonar sobre las dimensiones. No agrega márgenes al ancho declarado.

Las abreviaturas de `margin` y `padding` siguen esta lógica:

```css
.tarjeta {
  padding: 1rem;                  /* Los cuatro lados */
  margin: 1rem 2rem;              /* Vertical; horizontal */
  border-width: 1px 2px 3px 4px;   /* Arriba; derecha; abajo; izquierda */
}
```

En bloques del flujo normal, ciertos márgenes verticales pueden **colapsar**: dos márgenes de 20 y 30 píxeles no necesariamente producen 50. `padding` no colapsa de esa forma. Más adelante usaremos `gap` entre elementos de Flexbox y Grid para expresar separación de manera directa.

### 7.5. Flujo normal y visibilidad: cómo se colocan las cajas

El navegador organiza inicialmente el contenido en el **flujo normal**. En nuestra escritura horizontal, elementos de bloque como un párrafo suelen ocupar una línea propia y el ancho disponible; los elementos en línea, como `span`, acompañan el texto.

| Declaración | Comportamiento principal |
| --- | --- |
| `display: block` | Caja de bloque dentro del flujo |
| `display: inline` | Participación en una línea; ancho y alto no se controlan como en un bloque |
| `display: inline-block` | Caja dimensionable que participa en una línea |
| `display: flex` | Organiza los hijos con Flexbox |
| `display: grid` | Organiza los hijos en una cuadrícula |
| `display: none` | No genera caja; normalmente también se omite del árbol de accesibilidad |
| `visibility: hidden` | Oculta la caja visualmente, pero conserva su espacio |

El atributo HTML `hidden` expresa que un elemento no es relevante para el estado actual y normalmente lo oculta. Lo usaremos para resultados todavía inexistentes. Hay que evitar reglas propias de `display` que anulen involuntariamente ese ocultamiento.

No fijes una altura pequeña a una tarjeta con texto variable: un nombre largo, una traducción o el zoom pueden necesitar más espacio. En general, dejá que el contenido determine el alto.

### 7.6. Posicionamiento: cuándo salir del flujo

| Valor de `position` | Uso |
| --- | --- |
| `static` | Posición normal; valor inicial |
| `relative` | Conserva su lugar y puede desplazarse; sirve como referencia para descendientes posicionados |
| `absolute` | Sale del flujo y se ubica respecto de su bloque contenedor; a menudo un ancestro posicionado |
| `fixed` | Sale del flujo; normalmente queda fijado respecto del viewport |
| `sticky` | Conserva espacio en el flujo y puede adherirse a un límite durante el desplazamiento |

`top`, `right`, `bottom` y `left` definen desplazamientos cuando el contexto de posicionamiento los admite. `z-index` participa en el orden de superposición dentro de contextos de apilamiento; un número enorme no garantiza quedar sobre cualquier cosa de la página.

```css
.tarjeta { position: relative; }
.insignia { position: absolute; top: 0.5rem; right: 0.5rem; }
```

### 7.7. Estados e interacción visual

```css
button { cursor: pointer; }
button:hover { background-color: #075257; }
button:disabled { opacity: 0.65; cursor: wait; }
:focus-visible { outline: 3px solid #964e0b; outline-offset: 3px; }
```

Una pseudoclase describe un estado; no agrega un elemento nuevo. El foco identifica qué control recibe la interacción del teclado. El contorno de foco debe verse. Quitar `outline` sin reemplazarlo hace difícil saber dónde se encuentra el usuario.

### 7.8. Variables y movimiento opcional

Las **propiedades personalizadas** permiten nombrar decisiones reutilizables:

```css
:root { --acento: #086b70; }
button { background-color: var(--acento); }
a { color: var(--acento); }
```

`:root` selecciona el elemento raíz; las propiedades personalizadas suelen heredarse. Al cambiar `--acento`, ambos usos se actualizan.

Para una transición breve, declaramos qué propiedad puede cambiar gradualmente:

```css
@media (prefers-reduced-motion: no-preference) {
  button { transition: background-color 150ms ease; }
}
```

`transform` permite trasladar, rotar o escalar visualmente; `transition` interpola cambios; `animation` y `@keyframes` definen secuencias. Son herramientas opcionales. Primero necesitamos una interfaz entendible, y cualquier movimiento debe respetar las preferencias del usuario.

## 8. Distribución y diseño adaptable

### 8.1. Un contenedor que deja respirar al contenido

```css
.contenedor {
  width: 100%;
  max-width: 48rem;
  margin-inline: auto;
  padding: 2rem 1rem;
}
```

En una pantalla chica ocupa el ancho disponible. En una grande deja de crecer al llegar al máximo, evitando líneas excesivamente largas. Los márgenes automáticos en el eje en línea lo centran cuando sobra espacio. `margin-inline` es una propiedad lógica: acompaña la dirección de escritura; en nuestro caso se corresponde con los márgenes izquierdo y derecho.

### 8.2. Flexbox: distribuir en un eje principal

```html
<div class="fila">
  <input aria-label="Ciudad de práctica" type="search">
  <button type="button">Buscar</button>
</div>
```

Este fragmento pequeño usa un nombre accesible para aislar el ejemplo de distribución; en el formulario completo tendremos una etiqueta visible.

```css
.fila {
  display: flex;
  gap: 0.75rem;
  align-items: center;
}

.fila input { flex: 1; min-width: 0; }
.fila button { flex-shrink: 0; }
```

`display: flex` convierte a los hijos directos en elementos flexibles. Con la dirección inicial `row`, el eje principal recorre la fila. `justify-content` distribuye el espacio en ese eje y `align-items` alinea en el transversal. Si cambiamos a `column`, los ejes cambian: no significan siempre horizontal y vertical.

| Propiedad | Ejemplo | Función |
| --- | --- | --- |
| `flex-direction` | `row` o `column` | Dirección del eje principal |
| `gap` | `0.75rem` | Separación entre elementos |
| `justify-content` | `space-between` | Distribución del espacio sobrante en el eje principal |
| `align-items` | `center` o `stretch` | Alineación en el eje transversal |
| `flex-wrap` | `wrap` | Permite más de una línea |
| `flex` | `1` | Abreviatura que aquí permite al campo crecer y encogerse |
| `flex-shrink` | `0` | Impide que ese elemento se reduzca por reparto de espacio |

`min-width: 0` deja que el campo se reduzca cuando su tamaño mínimo automático podría impedirlo. Es útil con campos y contenido largo.

### 8.3. Grid: organizar filas y columnas

```css
.datos {
  display: grid;
  grid-template-columns: repeat(3, minmax(0, 1fr));
  gap: 1rem;
}

.dato-principal { grid-column: 1 / -1; }
```

`repeat(3, ...)` crea tres columnas. `1fr` reparte una fracción del espacio disponible. `minmax(0, 1fr)` permite reducir cada columna hasta cero antes de considerar su contenido; el texto todavía debe poder ajustarse. `grid-column: 1 / -1` hace que el dato principal abarque desde la primera hasta la última línea de la cuadrícula.

Grid es adecuado para las mediciones de nuestra tarjeta; Flexbox para un campo y su botón. La elección depende de la distribución que queremos expresar, no de que una técnica reemplace universalmente a la otra.

### 8.4. Media queries: cambiar una regla cuando hay espacio

```css
.fila { display: flex; flex-direction: column; gap: 0.75rem; }
.datos { display: grid; grid-template-columns: 1fr; gap: 1rem; }

@media (min-width: 40rem) {
  .fila { flex-direction: row; }
  .datos { grid-template-columns: repeat(3, minmax(0, 1fr)); }
}
```

La versión base apila los controles. La consulta de medios activa otra distribución cuando el viewport alcanza el ancho indicado. Es un enfoque **mobile first**: comenzamos por el espacio reducido y agregamos distribución cuando cabe.

El punto de cambio se elige observando el contenido, no buscando un modelo específico de teléfono. El metadato `viewport` del HTML es parte del conjunto; no adapta por sí solo un diseño de ancho fijo.

Para imágenes de contenido, una base útil es:

```css
img { max-width: 100%; height: auto; }
```

## 9. JavaScript y su entorno de ejecución

Hasta ahora el contenido fue escrito por nosotros. Para mostrar datos diferentes según lo que ingrese una persona, necesitamos describir una secuencia de operaciones: leer, validar, buscar, transformar y presentar.

**JavaScript** es un lenguaje de programación. Su núcleo está estandarizado como **ECMAScript**; la primera edición de ECMA-262 se publicó en 1997. Java y JavaScript son lenguajes distintos. [Ecma International: ECMA-262](https://ecma-international.org/publications-and-standards/standards/ecma-262/).

### Lenguaje, motor y entorno no son lo mismo

| Concepto | Responsabilidad | Ejemplos |
| --- | --- | --- |
| Lenguaje | Define valores, expresiones, funciones y reglas de ejecución | `const`, `if`, arreglos, promesas |
| Motor | Ejecuta el código JavaScript | V8, SpiderMonkey, JavaScriptCore |
| Entorno | Proporciona capacidades adicionales al programa | Navegador o un entorno de servidor como Node.js |
| API del navegador | Expone funciones de la plataforma | DOM, eventos, `fetch`, temporizadores |

`document` no es una palabra del lenguaje JavaScript: es un objeto que el navegador proporciona. En un programa de Node.js, por defecto, no existe el documento de una página ni su DOM. Algunos entornos comparten APIs como `fetch`, pero eso no los vuelve idénticos.

En nuestra aplicación, JavaScript se ejecutará **en el navegador del usuario**. El servicio meteorológico corre en servidores externos. No estamos construyendo un servidor de datos propio: consumimos uno existente.

### Carga de un script en el documento

El documento puede referenciar un archivo externo desde `head`:

```html
<script src="app.js" defer></script>
```

En un script clásico externo, `defer` permite descargar el archivo durante el análisis de HTML y ejecutarlo cuando el documento terminó de analizarse. Así podrá encontrar los elementos del cuerpo. Los scripts clásicos con `defer` conservan el orden del documento. `async` tiene otra finalidad: ejecuta cuando está disponible y no garantiza ese orden.

El atributo `defer` no se aplica del mismo modo a un script clásico escrito directamente dentro del elemento. Otra alternativa son los módulos, con `type="module"`, que ya difieren su ejecución por defecto y permiten importar y exportar código. Para empezar usaremos un único archivo clásico externo.

Un mensaje de diagnóstico se escribe con `console.log`:

```js
console.log("El archivo JavaScript se ejecutó.");
```

El mensaje aparece en la consola de las herramientas de desarrollador, no como contenido de la página.

## 10. DOM, eventos y una primera página dinámica

### 10.1. El documento como árbol de objetos

DOM significa **Document Object Model**. Es la representación del documento que las APIs permiten consultar y modificar. Al analizar HTML, el navegador construye nodos: elementos, texto y otros tipos.

```html
<main>
  <h1>El clima</h1>
  <p id="estado">Todavía no hay una consulta.</p>
</main>
```

Una vista simplificada de ese árbol:

```text
document
└── html
    ├── head
    └── body
        └── main
            ├── h1
            │   └── texto: El clima
            └── p#estado
                └── texto: Todavía no hay una consulta.
```

El archivo fuente y el DOM están relacionados, pero no son la misma cosa. El navegador puede corregir estructuras durante el análisis, y JavaScript puede agregar nodos. Por eso «Ver código fuente» y el panel «Elementos» pueden mostrar información diferente. [MDN: DOM](https://developer.mozilla.org/en-US/docs/Web/API/Document_Object_Model).

### 10.2. Buscar y modificar elementos

```js
const estado = document.querySelector("#estado");
estado.textContent = "Estamos preparando la consulta.";
estado.classList.add("destacado");
```

`querySelector` recibe un selector CSS y devuelve el primer elemento que coincide, o `null`. `querySelectorAll` devuelve una colección de coincidencias que podemos recorrer. Un resultado `null` puede deberse al selector, a la inexistencia del elemento o al momento de ejecución del script.

| Operación | Efecto |
| --- | --- |
| `elemento.textContent = "..."` | Cambia el contenido de texto |
| `campo.value` | Lee el valor actual de un control |
| `elemento.classList.add("clase")` | Agrega una clase |
| `elemento.classList.remove("clase")` | Quita una clase |
| `elemento.classList.toggle("clase", condicion)` | Asegura su presencia o ausencia según un booleano |
| `elemento.hidden = true` | Activa su estado oculto |
| `campo.disabled = true` | Deshabilita el control |
| `document.createElement("option")` | Crea un elemento todavía separado del documento |
| `padre.append(hijo)` | Inserta un nodo al final del padre |
| `padre.replaceChildren()` | Quita los nodos hijos |
| `elemento.remove()` | Retira ese elemento del DOM |
| `elemento.focus()` | Lleva el foco a un elemento que lo admite |

Para texto ingresado por usuarios o recibido de una API usaremos `textContent`. `innerHTML` interpreta marcado: insertar texto no confiable con esa propiedad puede convertirlo en contenido activo. No necesitamos esa interpretación para mostrar una ciudad o una temperatura.

### 10.3. Escuchar eventos

Un evento comunica que ocurrió algo: un clic, una modificación de un campo, un envío o la carga de un recurso. `addEventListener` registra una función para reaccionar.

```js
boton.addEventListener("click", () => {
  console.log("Se activó el botón.");
});
```

Aquí `boton` debe ser una referencia obtenida previamente del DOM. Pasamos la función; no escribimos una llamada como segundo argumento. Queremos que se ejecute cuando ocurra el evento.

Muchos eventos se propagan desde el elemento de origen hacia sus ancestros. `evento.target` identifica dónde se originó; `evento.currentTarget`, el elemento cuyo listener se está ejecutando. `preventDefault()` cancela una acción predeterminada cancelable, como navegar al enviar un formulario; **no** detiene por sí mismo la propagación. [MDN: eventos](https://developer.mozilla.org/en-US/docs/Learn_web_development/Core/Scripting/Events).

### 10.4. Primera integración completa sin Internet

El documento del ejemplo contiene un formulario y una región de estado:

```html
<!doctype html>
<html lang="es">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>DOM y eventos</title>
  <script src="dom.js" defer></script>
</head>
<body>
  <h1>Clima de práctica</h1>
  <p>Datos inventados: probá Córdoba o Salta.</p>
  <form id="formulario" action="dom.html" method="get">
    <label for="ciudad-prueba">Ciudad</label>
    <input id="ciudad-prueba" name="ciudad" required minlength="2">
    <button type="submit">Consultar dato de práctica</button>
  </form>
  <p id="mensaje" role="status" aria-live="polite"></p>
</body>
</html>
```

El script conecta el formulario con un catálogo local de datos inventados:

```js
const formulario = document.querySelector("#formulario");
const entrada = document.querySelector("#ciudad-prueba");
const mensaje = document.querySelector("#mensaje");

const datosDePractica = {
  "córdoba": { nombre: "Córdoba", temperatura: 23 },
  "salta": { nombre: "Salta", temperatura: 20 }
};

formulario.addEventListener("submit", (evento) => {
  evento.preventDefault();
  const nombre = entrada.value.trim().toLowerCase();

  if (nombre.length < 2) {
    mensaje.textContent = "Escribí al menos dos caracteres.";
    return;
  }

  // Solo aceptamos propiedades propias de nuestro pequeño catálogo.
  const dato = Object.hasOwn(datosDePractica, nombre)
    ? datosDePractica[nombre]
    : undefined;

  if (!dato) {
    mensaje.textContent = "No hay un dato de práctica para esa ciudad.";
    return;
  }

  mensaje.textContent = `${dato.nombre}: ${dato.temperatura} °C (dato inventado).`;
});
```

`Object.hasOwn` evita utilizar propiedades heredadas como si fueran ciudades del catálogo.

El flujo es el siguiente: el navegador valida las restricciones nativas, emite `submit`, nuestro listener evita la navegación, normaliza la entrada, busca el dato y modifica un nodo de texto. Ninguna de esas modificaciones reescribe el archivo `.html` del disco. Al recargar, se vuelve a comenzar desde el documento original.

`role="status"` y `aria-live="polite"` permiten anunciar cambios a tecnologías de asistencia sin interrumpir de inmediato otras lecturas. No agregan por sí mismos un aspecto visual.

## 11. Asincronía, HTTP, JSON y APIs

### 11.1. De datos locales a un servicio externo

Una **API** es una interfaz mediante la que un programa usa capacidades de otro componente. El DOM es una API del navegador. En este capítulo consumimos una API web: solicitamos datos a un servidor por HTTP.

Necesitamos dos consultas:

```text
Texto: «Córdoba»
       ↓ API de geocodificación
Lista de ubicaciones con nombre, región, país, latitud y longitud
       ↓ elección del usuario
Una ubicación concreta
       ↓ API meteorológica con sus coordenadas
Datos meteorológicos
       ↓ JavaScript transforma y actualiza el DOM
Una tarjeta legible
```

**Geocodificar** es convertir una referencia textual a una ubicación en coordenadas. Una ciudad puede compartir nombre con muchas otras; la selección explícita evita decidir silenciosamente por la persona.

La documentación de Open-Meteo define `/v1/search` para buscar lugares y `/v1/forecast` para consultar condiciones mediante coordenadas. Su geocodificador permite elegir idioma y cantidad de resultados. [API de geocodificación](https://open-meteo.com/en/docs/geocoding-api) y [API meteorológica](https://open-meteo.com/en/docs).

### 11.2. Solicitudes y respuestas

Una solicitud incluye una dirección, un método y, según el caso, encabezados y cuerpo. Usaremos **GET**, destinado a obtener una representación de un recurso. HTTPS agrega protección de la comunicación durante el transporte.

Ejemplo de URL para inspeccionar en el navegador:

```text
https://geocoding-api.open-meteo.com/v1/search?name=Cordoba&count=10&language=es&format=json
```

`?` inicia los parámetros y `&` los separa. Cada par une un nombre y un valor. En código no concatenaremos directamente la entrada del usuario: `URLSearchParams` codifica caracteres especiales, espacios y acentos.

```js
const parametros = new URLSearchParams({ name: "San Miguel de Tucumán", language: "es" });
console.log(parametros.toString());
```

Una respuesta tiene un código de estado, encabezados y un cuerpo. Ejemplos de códigos son 200 para éxito, 400 para una solicitud inválida, 404 para un recurso no encontrado, 429 para demasiadas consultas y 500 para un error interno del servidor.

Una ciudad sin coincidencias no necesariamente produce un error HTTP: puede ser una respuesta exitosa sin resultados. Hay que distinguir **fallo de transporte**, **error HTTP** y **resultado válido pero vacío**.

### 11.3. JSON es un formato de datos

JSON significa JavaScript Object Notation. Es texto estructurado que puede representar objetos, arreglos, cadenas, números, booleanos y `null`. No contiene funciones ni comentarios, y los nombres de propiedades y las cadenas usan comillas dobles.

Ejemplo didáctico reducido, con valores inventados:

```json
{
  "ciudad": "Córdoba",
  "temperatura": 23,
  "unidad": "°C",
  "esEjemplo": true
}
```

No confundas ese texto con un objeto JavaScript ya disponible en memoria. La respuesta viaja como datos que debemos leer y convertir. Tampoco asumimos que la respuesta del servicio use nuestros nombres en español: respetaremos su contrato y mostraremos etiquetas propias en la interfaz.

### 11.4. Promesas y espera sin congelar la página

Una consulta tarda y puede fallar. `fetch()` devuelve una **promesa**, un objeto que representa un resultado futuro: pendiente, cumplido o rechazado.

```js
async function obtenerEjemplo() {
  const respuesta = await fetch(
    "https://geocoding-api.open-meteo.com/v1/search?name=Salta&count=1&language=es"
  );

  if (!respuesta.ok) {
    throw new Error(`Error HTTP ${respuesta.status}`);
  }

  const datos = await respuesta.json();
  console.log(datos);
}

obtenerEjemplo().catch((error) => console.error(error.message));
```

`async` hace que la función devuelva una promesa. `await` suspende la continuación de **esa función asíncrona** hasta que se resuelva la promesa esperada; no congela el navegador. Si la promesa se rechaza, `await` produce una excepción que podemos capturar. `.catch(...)` registra qué hacer ante un rechazo.

Hay dos esperas: obtener la respuesta y leer su cuerpo como JSON. `fetch` no rechaza automáticamente por cada estado HTTP de error; debemos revisar `respuesta.ok`, que indica un estado entre 200 y 299. [MDN: uso de Fetch](https://developer.mozilla.org/en-US/docs/Web/API/Fetch_API/Using_Fetch).

### 11.5. El ciclo de eventos

En el hilo principal de una página, JavaScript ejecuta una tarea a la vez. El navegador coordina entradas, red, temporizadores y oportunidades de dibujado. Cuando una operación asíncrona tiene un resultado, su continuación se programa para ejecutarse cuando corresponde; las continuaciones de promesas se procesan como microtareas.

Una tarea larga que hace cálculos sin ceder puede bloquear la interfaz. Usar `await fetch(...)` permite esperar la red sin mantener ocupado ese hilo. `async` no vuelve automáticamente paralelo cualquier cálculo. [MDN: modelo de ejecución](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Execution_model).

El siguiente ejemplo muestra el orden relativo entre ejecución inmediata, microtareas y temporizadores:

```js
console.log("A");
setTimeout(() => console.log("B"), 0);
Promise.resolve().then(() => console.log("C"));
console.log("D");
```

El resultado es **A, D, C, B**. Primero termina el código actual; luego se procesa la continuación de la promesa; el temporizador se ejecuta en una tarea posterior. Cero milisegundos no significa «ahora mismo».

### 11.6. Errores y limpieza

```js
async function consultar() {
  try {
    // Acá va una operación que puede fallar, posiblemente con await.
  } catch (error) {
    // Informamos el problema de una forma útil.
    console.error(error.message);
  } finally {
    // Liberamos recursos o restablecemos controles.
  }
}
```

`throw new Error("...")` interrumpe el camino normal. `catch` maneja una excepción y `finally` permite ejecutar limpieza tanto si hubo éxito como si hubo fallo. En la app, el botón siempre debe volver a habilitarse.

Usaremos `AbortController` para cancelar una espera de red demasiado larga. Un temporizador pedirá la cancelación después de 12 segundos y `clearTimeout` lo retirará si la operación termina antes. No es una garantía de reloj exacto: la ejecución de temporizadores depende del entorno.

### 11.7. CORS y claves

Los navegadores aplican reglas a las consultas entre orígenes diferentes. **CORS** permite que un servidor indique qué accesos desde otros orígenes admite. El origen combina esquema, host y puerto.

Si una API no permite el acceso desde tu página, agregar `mode: "no-cors"` no te habilita a leer el JSON: normalmente obtendrías una respuesta opaca. La solución debe respetar la configuración del servicio o usar un backend autorizado que actúe como intermediario.

Todo el JavaScript enviado al navegador puede inspeccionarse. Una clave secreta no se protege escondiéndola en `app.js`. El acceso abierto de Open-Meteo evita necesitar una clave en este ejemplo educativo; sus condiciones limitan el servicio gratuito al uso no comercial, incluyen límites de consultas y requieren atribución. La app conserva los créditos. Para otro tipo de publicación hay que consultar sus condiciones vigentes. [Open-Meteo: condiciones](https://open-meteo.com/en/terms) y [licencia de datos](https://open-meteo.com/en/licence).

## 12. Proyecto integrado: estructura y presentación

La integración reúne un documento semántico, una hoja de estilos y cinco bloques de JavaScript. Cada etapa incorpora una responsabilidad al recorrido de búsqueda y consulta.

### Comportamiento de la aplicación

1. La persona escribe una ciudad.
2. La aplicación busca hasta diez coincidencias.
3. La persona distingue las ubicaciones por nombre, región y país.
4. Elige una y activa «Ver clima».
5. La aplicación muestra las condiciones actuales y la hora de los datos en la zona consultada.
6. Durante una consulta se informa el progreso y se impiden envíos simultáneos.
7. Si falta información o hay un problema, aparece un mensaje y se puede reintentar.

| Estado de la aplicación | Qué ve la persona | Qué puede hacer |
| --- | --- | --- |
| Inicial | Campo y explicación | Escribir una ciudad |
| Buscando lugares | Mensaje de carga | Esperar a que termine o alcance el límite de tiempo |
| Sin coincidencias | Mensaje específico | Corregir la búsqueda |
| Lugares disponibles | Lista con región y país | Elegir una ubicación |
| Consultando el tiempo | Mensaje de carga | Esperar |
| Resultado disponible | Mediciones y fecha | Consultar otra ubicación o buscar otra ciudad |
| Error | Explicación del problema | Reintentar |

Esta tabla es parte del diseño del programa. Si solo imaginamos el resultado exitoso, dejamos sin definir qué ocurre durante el resto del recorrido.

### Estructura de archivos

La aplicación se organiza en tres archivos con responsabilidades diferentes:

```text
app-clima/
├── index.html   → estructura y contenido
├── styles.css   → presentación
└── app.js       → comportamiento y acceso a datos
```

El navegador ejecuta JavaScript y obtiene datos de un servicio externo. No hay librerías, compilación ni un servidor de aplicación propio.

### HTML: estructura de la interfaz

El archivo `index.html` define la interfaz completa:

```html
<!doctype html>
<html lang="es">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <meta name="description" content="Buscá una ciudad y consultá sus condiciones meteorológicas actuales.">
  <title>El clima en tu ciudad</title>
  <link rel="stylesheet" href="styles.css">
  <script src="app.js" defer></script>
</head>
<body>
  <main class="contenedor">
    <header>
      <p class="etiqueta">Una ventana al tiempo</p>
      <h1>El clima en tu ciudad</h1>
      <p>Buscá una ciudad, elegí la ubicación y consultá el tiempo actual.</p>
    </header>

    <form id="form-busqueda" class="tarjeta" action="index.html" method="get">
      <fieldset id="campos-busqueda">
        <legend>1. Buscá una ciudad</legend>
        <label for="ciudad">Nombre de la ciudad (obligatorio)</label>
        <p id="ayuda-ciudad" class="ayuda">Escribí al menos 2 caracteres. Por ejemplo: Córdoba.</p>
        <div class="fila">
          <input id="ciudad" name="ciudad" type="search" required
            minlength="2" maxlength="100" placeholder="Córdoba"
            autocomplete="off" aria-describedby="ayuda-ciudad">
          <button type="submit">Buscar ciudad</button>
        </div>
      </fieldset>
    </form>

    <p id="estado" class="estado" role="status" aria-live="polite" aria-atomic="true">
      Ingresá una ciudad para comenzar.
    </p>

    <form id="form-ubicacion" class="tarjeta" action="index.html" method="get" hidden>
      <fieldset id="campos-ubicacion">
        <legend>2. Elegí la ubicación</legend>
        <label for="ubicacion">Ciudades encontradas</label>
        <div class="fila">
          <select id="ubicacion" name="ubicacion" required></select>
          <button type="submit">Ver clima</button>
        </div>
      </fieldset>
    </form>

    <section id="resultado" class="tarjeta" aria-labelledby="nombre-ciudad" hidden>
      <p class="etiqueta">Condiciones actuales</p>
      <h2 id="nombre-ciudad" tabindex="-1"></h2>
      <p id="descripcion"></p>
      <dl class="datos">
        <div class="dato-principal">
          <dt>Temperatura</dt>
          <dd id="temperatura" class="temperatura"></dd>
        </div>
        <div><dt>Sensación térmica</dt><dd id="sensacion"></dd></div>
        <div><dt>Humedad</dt><dd id="humedad"></dd></div>
        <div><dt>Viento</dt><dd id="viento"></dd></div>
      </dl>
      <p class="ayuda">Hora de los datos: <time id="actualizacion"></time>.</p>
      <p class="ayuda">Condiciones estimadas a partir de modelos meteorológicos.</p>
    </section>

    <noscript><p>Activá JavaScript para buscar ciudades y consultar el clima.</p></noscript>

    <footer>
      <p>Datos meteorológicos de <a href="https://open-meteo.com/">Open-Meteo</a>.
        Ubicaciones de <a href="https://www.geonames.org/">GeoNames</a>.
        Datos bajo <a href="https://creativecommons.org/licenses/by/4.0/">CC BY 4.0</a>.</p>
      <p>Proyecto educativo con HTML, CSS y JavaScript.</p>
    </footer>
  </main>
</body>
</html>
```

El documento separa las responsabilidades de la interfaz. El primer formulario captura la búsqueda. El segundo contiene la selección de una ubicación y empieza oculto. El `section` del resultado tiene espacios para los datos y también empieza oculto. La lista `dl` relaciona cada medición con su valor.

Los `id` son los puntos de conexión con JavaScript; las clases se usan principalmente para CSS. El nombre de una clase no controla automáticamente una función ni viceversa. Un cambio de `id` requiere actualizar el selector correspondiente en el script.

`aria-describedby` conecta la ayuda con el campo. `aria-labelledby` da nombre a la sección usando su encabezado. `tabindex="-1"` permite enfocar el título del resultado desde JavaScript sin agregarlo al recorrido habitual de Tab. `aria-atomic="true"` solicita anunciar el mensaje de estado como una unidad.

`noscript` explica la dependencia de JavaScript. Esta aplicación necesita JS para obtener resultados: el HTML ofrece estructura y controles nativos, pero no estamos implementando una alternativa de búsqueda en servidor.

### CSS: presentación de la aplicación

El archivo `styles.css` define los estilos de la aplicación:

```css
/* Base: dimensiones predecibles y colores compartidos. */
* { box-sizing: border-box; }

:root {
  --fondo: #f3f6f8;
  --superficie: #ffffff;
  --texto: #172d39;
  --secundario: #4f6470;
  --acento: #086b70;
  --borde: #748591;
  --error: #a32424;
}

body {
  margin: 0;
  background-color: var(--fondo);
  color: var(--texto);
  font-family: system-ui, sans-serif;
  font-size: 1rem;
  line-height: 1.6;
}

.contenedor {
  width: 100%;
  max-width: 48rem;
  margin-inline: auto;
  padding: 2rem 1rem;
}

header { margin-bottom: 2rem; }
h1, h2 { line-height: 1.2; overflow-wrap: anywhere; }
h1 { font-size: 2.3rem; margin: 0.5rem 0 1rem; }
h2 { font-size: 1.6rem; }

.etiqueta {
  color: var(--acento);
  font-weight: 700;
  margin: 0;
}

.tarjeta {
  background-color: var(--superficie);
  border: 1px solid var(--borde);
  border-radius: 1rem;
  padding: 1.25rem;
  margin-bottom: 1rem;
}

fieldset { border: 0; padding: 0; margin: 0; min-width: 0; }
legend { font-weight: 700; padding: 0; margin-bottom: 1rem; }
label { display: block; font-weight: 600; margin-bottom: 0.35rem; }
.ayuda, footer { color: var(--secundario); font-size: 0.9rem; }
.ayuda { margin: 0.35rem 0 0.75rem; }

.fila { display: flex; flex-direction: column; gap: 0.75rem; }

input, select, button {
  font: inherit;
  min-height: 3rem;
  border-radius: 0.5rem;
  padding: 0.65rem 0.8rem;
}

input, select {
  width: 100%;
  min-width: 0;
  color: var(--texto);
  background-color: var(--superficie);
  border: 1px solid var(--borde);
}

button {
  border: 0;
  background-color: var(--acento);
  color: white;
  font-weight: 700;
  cursor: pointer;
}

button:hover:not(:disabled) { background-color: #075257; }
button:disabled { opacity: 0.65; cursor: wait; }
input:disabled, select:disabled { opacity: 0.7; }
a { color: var(--acento); }

:focus-visible { outline: 3px solid #964e0b; outline-offset: 3px; }
#nombre-ciudad:focus { outline: 3px solid #964e0b; outline-offset: 3px; }

.estado { min-height: 1.6em; margin: 1rem 0; }
.estado.es-error { color: var(--error); font-weight: 600; }

.datos { display: grid; grid-template-columns: 1fr; gap: 1rem; }
.datos > div { padding-top: 0.5rem; border-top: 1px solid #d6dfe4; }
dt { color: var(--secundario); }
dd { margin: 0.2rem 0 0; font-size: 1.2rem; font-weight: 600; }
.temperatura { font-size: 3.2rem; line-height: 1.2; }
.dato-principal { grid-column: 1 / -1; }
footer { margin-top: 2rem; }

/* Primero la pantalla chica; ampliamos cuando hay espacio. */
@media (min-width: 40rem) {
  .fila { flex-direction: row; align-items: stretch; }
  .fila input, .fila select { flex: 1; }
  .fila button { flex-shrink: 0; }
  .datos { grid-template-columns: repeat(3, minmax(0, 1fr)); }
}
```

La hoja se lee en grupos: base, contenedor, tarjetas, formularios, estados, mediciones y adaptación. `font: inherit` hace que los controles sigan la tipografía general. `min-width: 0` permite que los campos se reduzcan dentro de las filas. `:not(:disabled)` evita aplicar el estado de puntero activo a un botón deshabilitado.

La tarjeta exterior no recibe `display: grid`; se lo damos a `.datos`, su lista interna. Así no anulamos accidentalmente el `hidden` del contenedor de resultados.

## 13. Proyecto integrado: JavaScript paso a paso

El archivo `app.js` se compone de los cinco bloques siguientes, en este orden. En conjunto constituyen el comportamiento completo de la aplicación.

Las funciones iniciales preparan operaciones reutilizables; los listeners del último bloque conectan esas operaciones con la interfaz. Que una función esté definida no significa que ya se haya ejecutado.

### 1. Referencias al DOM y estado

Referencias y estado:

```js
// BLOQUE 1: referencias al DOM y estado de la aplicación.
const formBusqueda = document.querySelector("#form-busqueda");
const camposBusqueda = document.querySelector("#campos-busqueda");
const entradaCiudad = document.querySelector("#ciudad");
const estado = document.querySelector("#estado");
const formUbicacion = document.querySelector("#form-ubicacion");
const camposUbicacion = document.querySelector("#campos-ubicacion");
const selectorUbicacion = document.querySelector("#ubicacion");
const resultado = document.querySelector("#resultado");
const nombreCiudad = document.querySelector("#nombre-ciudad");
const descripcion = document.querySelector("#descripcion");
const temperatura = document.querySelector("#temperatura");
const sensacion = document.querySelector("#sensacion");
const humedad = document.querySelector("#humedad");
const viento = document.querySelector("#viento");
const actualizacion = document.querySelector("#actualizacion");

let ciudades = [];
let ocupada = false;
```

Guardamos referencias para no repetir las búsquedas del DOM en cada función. `ciudades` conserva los resultados de la última búsqueda; `ocupada` indica que hay una consulta en curso. Ambas usan `let` porque les asignaremos nuevos valores.

Una referencia declarada con `const` puede apuntar a un elemento cuyo texto cambia: no se reasigna el nombre, se modifica el objeto. Esto relaciona el DOM con lo que aprendimos sobre objetos.

### 2. Operaciones de interfaz

Funciones de interfaz:

```js
// BLOQUE 2: pequeñas operaciones de interfaz.
function mostrarEstado(mensaje, esError = false) {
  estado.textContent = mensaje;
  estado.classList.toggle("es-error", esError);
}

function establecerCarga(valor) {
  ocupada = valor;
  camposBusqueda.disabled = valor;
  camposUbicacion.disabled = valor;
}

function nombreCompleto(ciudad) {
  return [ciudad.name, ciudad.admin1, ciudad.country]
    .filter(Boolean)
    .join(", ");
}

function mostrarCiudades() {
  selectorUbicacion.replaceChildren();

  for (const ciudad of ciudades) {
    const opcion = document.createElement("option");
    opcion.value = String(ciudad.id);
    opcion.textContent = nombreCompleto(ciudad);
    selectorUbicacion.append(opcion);
  }

  formUbicacion.hidden = false;
}
```

`mostrarEstado` concentra los mensajes y su clase visual. El parámetro opcional `esError` permite reutilizarla para estados normales o fallidos. JavaScript decide el estado; CSS define cómo se ve la clase.

`establecerCarga` actualiza la variable de control y deshabilita ambos grupos de campos. Así ninguna búsqueda puede empezar mientras otra ocupa el flujo. El guardado `ocupada` también protege los listeners ante invocaciones repetidas.

`nombreCompleto` arma una cadena a partir de datos que pueden estar incompletos. `.filter(Boolean)` conserva los valores que se interpretan como verdaderos: aquí quita propiedades faltantes y cadenas vacías. `.join(", ")` intercala comas entre los valores restantes.

`mostrarCiudades` vacía las opciones anteriores y crea nodos nuevos. Cada `option` muestra una etiqueta legible y guarda el identificador numérico convertido a cadena. El valor de un `select` se obtiene como texto; esa conversión será importante al encontrar la ciudad elegida.

### 3. Acceso a datos

Funciones de acceso a la red:

```js
// BLOQUE 3: acceso a la red con errores y tiempo límite.
async function pedirJSON(url) {
  const controlador = new AbortController();
  const temporizador = setTimeout(() => controlador.abort(), 12000);

  try {
    const respuesta = await fetch(url, { signal: controlador.signal });

    if (!respuesta.ok) {
      if (respuesta.status === 429) {
        throw new Error("El servicio recibió demasiadas consultas. Esperá un momento y reintentá.");
      }
      throw new Error(`El servicio respondió con un error (${respuesta.status}). Reintentá más tarde.`);
    }

    const datos = await respuesta.json();
    if (datos === null || typeof datos !== "object" || Array.isArray(datos)) {
      throw new Error("El servicio devolvió un formato de datos inesperado.");
    }
    return datos;
  } catch (error) {
    if (error.name === "AbortError") {
      throw new Error("La consulta tardó demasiado. Volvé a intentarlo.");
    }
    if (error instanceof TypeError) {
      throw new Error("No se pudo conectar con el servicio. Revisá tu conexión e intentá de nuevo.");
    }
    if (error instanceof SyntaxError) {
      throw new Error("El servicio devolvió una respuesta que no se pudo leer.");
    }
    throw error;
  } finally {
    clearTimeout(temporizador);
  }
}

async function buscarCiudades(nombre) {
  const parametros = new URLSearchParams({
    name: nombre,
    count: "10",
    language: "es",
    format: "json"
  });
  const datos = await pedirJSON(`https://geocoding-api.open-meteo.com/v1/search?${parametros}`);

  if (datos.error) {
    throw new Error("No se pudo completar la búsqueda de ciudades.");
  }

  const encontradas = datos.results ?? [];
  if (!Array.isArray(encontradas)) {
    throw new Error("El servicio devolvió una lista de ciudades inválida.");
  }

  return encontradas.filter((ciudad) =>
    ciudad && Number.isInteger(ciudad.id) && typeof ciudad.name === "string" &&
    Number.isFinite(ciudad.latitude) && Number.isFinite(ciudad.longitude)
  );
}

async function consultarClima(ciudad) {
  const parametros = new URLSearchParams({
    latitude: String(ciudad.latitude),
    longitude: String(ciudad.longitude),
    current: "temperature_2m,apparent_temperature,relative_humidity_2m,weather_code,wind_speed_10m",
    temperature_unit: "celsius",
    wind_speed_unit: "kmh",
    timezone: "auto",
    timeformat: "unixtime"
  });
  const datos = await pedirJSON(`https://api.open-meteo.com/v1/forecast?${parametros}`);

  if (datos.error || !Number.isFinite(datos.current?.temperature_2m) ||
      !Number.isFinite(datos.current?.time) || typeof datos.timezone !== "string") {
    throw new Error("No hay datos meteorológicos suficientes para esa ubicación.");
  }

  return datos;
}
```

El acceso a los datos tiene tres capas:

| Función | Entrada | Salida o resultado |
| --- | --- | --- |
| `pedirJSON` | Una URL | Promesa de un objeto leído, o un error comprensible |
| `buscarCiudades` | Nombre escrito | Promesa de un arreglo de ubicaciones utilizables |
| `consultarClima` | Una ubicación elegida | Promesa de datos meteorológicos con mínimos comprobados |

La primera función resuelve problemas comunes de transporte. Las otras conocen los parámetros y la forma de datos que necesita cada operación. Ninguna modifica la tarjeta del resultado: eso tendrá su propia función.

`AbortController` crea un controlador y una señal. `fetch` observa esa señal; el temporizador invoca `abort()` si se alcanza el tiempo límite. `instanceof` reconoce clases de errores, como fallos de red o JSON inválido. `finally` limpia el temporizador aun cuando se lanza un error.

La respuesta puede ser JSON válido y aun así tener una forma inesperada. Por eso comprobamos que exista un objeto y que la búsqueda entregue un arreglo. Filtramos ubicaciones sin identificador, nombre o coordenadas utilizables.

Si `results` no está presente, `?? []` permite tratarlo como una colección vacía. En cambio, la ausencia de una temperatura actual o de una marca temporal impide mostrar un resultado completo, por lo que emitimos un error.

Los parámetros meteorológicos solicitan temperatura y sensación en Celsius, humedad, código de condición y viento en km/h. Usamos `timeformat=unixtime` para recibir un instante en segundos, y `timezone=auto` para conocer la zona correspondiente. Las condiciones actuales proceden de modelos meteorológicos; no se presentan como una medición en vivo de una estación. [Contrato de Open-Meteo](https://open-meteo.com/en/docs).

### 4. Presentación de los datos

Funciones de formato y presentación:

```js
// BLOQUE 4: transformar datos en información legible.
function describirClima(codigo) {
  if (codigo === 0) return "Despejado";
  if (codigo === 1) return "Mayormente despejado";
  if (codigo === 2) return "Parcialmente nublado";
  if (codigo === 3) return "Cubierto";
  if ([45, 48].includes(codigo)) return "Niebla";
  if ([51, 53, 55].includes(codigo)) return "Llovizna";
  if ([56, 57].includes(codigo)) return "Llovizna helada";
  if ([61, 63, 65].includes(codigo)) return "Lluvia";
  if ([66, 67].includes(codigo)) return "Lluvia helada";
  if ([71, 73, 75, 77].includes(codigo)) return "Nieve";
  if ([80, 81, 82].includes(codigo)) return "Chaparrones";
  if ([85, 86].includes(codigo)) return "Chaparrones de nieve";
  if (codigo === 95) return "Tormenta";
  if ([96, 99].includes(codigo)) return "Tormenta con granizo";
  return "Condición no disponible";
}

function formatearMedida(valor, unidad) {
  if (!Number.isFinite(valor)) return "No disponible";
  return `${valor.toLocaleString("es-AR", { maximumFractionDigits: 1 })} ${unidad}`;
}

function mostrarClima(ciudad, datos) {
  const actual = datos.current;
  const fecha = new Date(actual.time * 1000);
  const fechaLocal = new Intl.DateTimeFormat("es-AR", {
    dateStyle: "medium",
    timeStyle: "short",
    timeZone: datos.timezone
  }).format(fecha);

  nombreCiudad.textContent = nombreCompleto(ciudad);
  descripcion.textContent = describirClima(actual.weather_code);
  temperatura.textContent = formatearMedida(actual.temperature_2m, "°C");
  sensacion.textContent = formatearMedida(actual.apparent_temperature, "°C");
  humedad.textContent = formatearMedida(actual.relative_humidity_2m, "%");
  viento.textContent = formatearMedida(actual.wind_speed_10m, "km/h");
  actualizacion.dateTime = fecha.toISOString();
  actualizacion.textContent = `${fechaLocal} (${datos.timezone})`;
  resultado.hidden = false;
}
```

La API utiliza códigos meteorológicos. `describirClima` los convierte a textos breves; agrupa algunas intensidades para mantener el ejemplo legible y conserva una alternativa si aparece un código desconocido. No supone que cualquier código diferente de cero signifique lluvia. La tabla oficial está en la [documentación de códigos de Open-Meteo](https://open-meteo.com/en/docs).

`formatearMedida` distingue un número de un valor ausente. `Number.isFinite(0)` es verdadero, de modo que **0 °C se muestra correctamente**. Si falta una medición secundaria aparece «No disponible», sin inventar un cero. `toLocaleString` adapta la escritura del número y limita su parte decimal.

`Date` recibe milisegundos; por eso multiplicamos los segundos por 1000. No sumamos manualmente un desfase horario. `Intl.DateTimeFormat` presenta ese mismo instante usando la zona devuelta por la consulta, aunque la computadora del usuario esté en otro país.

El elemento `time` conserva una representación estándar en `dateTime` y muestra texto localizado. Esa fecha corresponde al dato meteorológico; no es simplemente la hora en que la persona hizo clic.

`mostrarClima` asigna cada valor al nodo correcto y revela el resultado al final. `textContent` permite mostrar los nombres externos como texto. **Mostrar un resultado** es transformar datos en una representación; no requiere reconstruir todo el documento.

### 5. Coordinación de eventos

Listeners de los formularios:

```js
// BLOQUE 5: conectar los formularios con las funciones.
formBusqueda.addEventListener("submit", async (evento) => {
  evento.preventDefault();
  if (ocupada) return;

  const nombre = entradaCiudad.value.trim();
  if (nombre.length < 2) {
    mostrarEstado("Escribí al menos 2 caracteres, sin contar los espacios de los extremos.", true);
    entradaCiudad.focus();
    return;
  }

  establecerCarga(true);
  resultado.hidden = true;
  formUbicacion.hidden = true;
  selectorUbicacion.replaceChildren();
  ciudades = [];
  mostrarEstado("Buscando ciudades…");

  try {
    ciudades = await buscarCiudades(nombre);
    if (ciudades.length === 0) {
      mostrarEstado("No encontramos esa ciudad. Revisá el nombre o probá una ciudad cercana.");
    } else {
      mostrarCiudades();
      mostrarEstado(`Coincidencias: ${ciudades.length}. Elegí una ubicación y presioná Ver clima.`);
    }
  } catch (error) {
    mostrarEstado(error.message, true);
  } finally {
    establecerCarga(false);
    if (ciudades.length > 0) selectorUbicacion.focus();
    else entradaCiudad.focus();
  }
});

selectorUbicacion.addEventListener("change", () => {
  resultado.hidden = true;
  mostrarEstado("Ubicación elegida. Presioná Ver clima para consultar sus datos.");
});

formUbicacion.addEventListener("submit", async (evento) => {
  evento.preventDefault();
  if (ocupada) return;

  const ciudad = ciudades.find((item) => String(item.id) === selectorUbicacion.value);
  if (!ciudad) {
    mostrarEstado("Primero buscá y elegí una ciudad.", true);
    return;
  }

  establecerCarga(true);
  resultado.hidden = true;
  mostrarEstado(`Consultando el clima de ${nombreCompleto(ciudad)}…`);

  try {
    const datos = await consultarClima(ciudad);
    mostrarClima(ciudad, datos);
    mostrarEstado("Consulta completada. Podés elegir otra ubicación o buscar una nueva ciudad.");
  } catch (error) {
    mostrarEstado(error.message, true);
  } finally {
    establecerCarga(false);
    if (!resultado.hidden) nombreCiudad.focus();
    else selectorUbicacion.focus();
  }
});
```

El primer listener valida y busca ubicaciones. Oculta el resultado anterior y limpia la selección, para que una búsqueda nueva no conserve opciones de la anterior. Distingue una colección vacía de un error de red.

El listener de `change` oculta un resultado que ya no corresponde a la ubicación seleccionada. El último listener recupera la ciudad mediante su `id`, consulta el tiempo y muestra la respuesta. Comparamos cadenas porque `selectorUbicacion.value` devuelve texto.

En ambos recorridos `finally` libera los controles. El foco pasa a la selección disponible o al encabezado del resultado; si algo falla, vuelve a un control útil para reintentar. Como se bloquean los dos formularios durante cada consulta, no hay dos respuestas simultáneas intentando reemplazar el mismo resultado. Una versión más avanzada podría permitir nuevas búsquedas y cancelar las anteriores.

## 14. Reconstruir una consulta completa

Volvamos al comportamiento, sin mirar todo el código a la vez:

```text
submit del formulario de búsqueda
  → preventDefault()
  → leer value y aplicar trim()
  → validar longitud
  → activar carga y limpiar datos anteriores
  → await buscarCiudades(nombre)
  → crear opciones o informar que no hay coincidencias
  → finally: desactivar carga

submit del formulario de ubicación
  → preventDefault()
  → encontrar la ciudad por su identificador
  → activar carga
  → await consultarClima(ciudad)
  → transformar valores y actualizar el DOM
  → finally: desactivar carga
```

En una consulta exitosa intervienen las tres tecnologías. HTML aporta el formulario y los espacios de resultado; CSS presenta controles, estados y mediciones; JavaScript conecta eventos, datos y DOM. La solicitud meteorológica se procesa en un servidor externo, y la presentación se actualiza en el navegador.

No estamos guardando las búsquedas en una base de datos ni conservándolas al recargar. Las variables representan el estado de esta ejecución. Persistir una ciudad favorita sería un requisito nuevo que podemos agregar más adelante.

### Cuánto se transfiere y cuándo

No hacemos una solicitud por cada letra escrita. Una búsqueda válida genera una consulta de lugares; cada activación de «Ver clima» genera otra consulta meteorológica. Si hay un error antes de obtener las coordenadas, no iniciamos la consulta del tiempo.

La app envía al geocodificador el nombre que se busca y al servicio meteorológico las coordenadas de la ciudad elegida. No solicita la ubicación del dispositivo. Esa distinción debe poder explicarla quien enseña el proyecto.

## 15. Herramientas de diagnóstico

El DOM, la cascada y las solicitudes de red se pueden observar mediante las herramientas del navegador. Cada panel muestra una parte distinta del comportamiento de la aplicación.

### Paneles del navegador

| Panel | Información disponible | Finalidad |
| --- | --- | --- |
| Elementos o Inspector | DOM, clases, atributos y estilos | Identificar elementos y su estado visible |
| Estilos calculados | Valores aplicados y modelo de caja | Reconocer las declaraciones ganadoras y las dimensiones |
| Consola | Errores y valores de diagnóstico | Localizar fallos de ejecución |
| Red o Network | Solicitudes, estados, tiempos y respuestas | Identificar la comunicación con servicios |
| Vista adaptable | Distintos anchos de viewport | Observar los cambios de distribución |

### Problemas frecuentes y cómo investigar

| Síntoma | Causa probable | Qué revisar |
| --- | --- | --- |
| No aparecen estilos | Ruta incorrecta o archivo sin guardar | `href`, nombre real y solicitud de `styles.css` |
| El formulario recarga después de completar el proyecto | El listener no se registró o hay un error de JS | Carga de `app.js`, consola y `preventDefault` |
| «Cannot read properties of null» | No se encontró un elemento | `id`, selector y `defer` |
| Un resultado continúa oculto | El flujo no llegó al renderizado | Respuesta de red, errores y `hidden` |
| Botones que nunca se habilitan | Falta una salida de estado de carga | Bloques `finally` y temporizador |
| Ciudad correcta, país incorrecto | Se consultó una coincidencia distinta | Opción seleccionada y coordenadas enviadas |
| Hora desplazada | Se interpretó un instante con otra zona | Segundos frente a milisegundos e `Intl` |
| `Failed to fetch` | Problema de red, CORS u otra restricción | Consola y panel de red; no asumir una causa única |
| `Identifier has already been declared` | Se copiaron bloques dos veces | Declaraciones repetidas o ejemplos mezclados |

El diagnóstico relaciona un síntoma observable con su causa en el documento, los estilos, el código o la comunicación de red.

## 16. Glosario breve

| Término | Significado en este tutorial |
| --- | --- |
| Accesibilidad | Posibilidad de percibir, comprender y operar la interfaz con distintas capacidades y herramientas |
| API | Interfaz mediante la que un programa utiliza otro componente |
| Atributo | Información asociada a una etiqueta de apertura HTML |
| Callback | Función que se entrega a otra operación para que la invoque |
| Cascada | Proceso que decide qué declaraciones CSS se aplican |
| Cliente | Programa que realiza una solicitud |
| DOM | Representación del documento mediante nodos y APIs para manipularlos |
| Endpoint | Dirección de una operación o recurso de una API |
| Estado | Datos que describen la situación actual de la aplicación |
| Evento | Notificación de algo ocurrido en el entorno |
| Frontend | Parte de la aplicación con la que interactúa la persona, ejecutada aquí en el navegador |
| Backend | Parte que procesa operaciones en servidores; en este proyecto la ofrece un servicio externo |
| Geocodificación | Obtención de ubicaciones y coordenadas a partir de una referencia textual |
| JSON | Formato de texto para intercambiar datos estructurados |
| Promesa | Representación de un resultado futuro, exitoso o fallido |
| Renderizar | Producir o actualizar una representación visible a partir de contenido o datos |
| Selector | Expresión que identifica elementos, por ejemplo `.tarjeta` |
| Semántica | Significado de los elementos y de sus relaciones |
| Viewport | Área de la ventana usada como referencia para presentar el documento |

## 17. Fuentes

Fuentes originales para la historia, los estándares y las APIs del recorrido.

- Historia de la Web: [CERN](https://home.cern/science/computing/the-birth-of-the-web/) y [componentes de 1990](https://home.cern/world-wide-web-35/).
- Historia de CSS: [W3C](https://www.w3.org/Style/CSS20/history.html).
- HTML: [sintaxis y estructura en MDN](https://developer.mozilla.org/en-US/docs/Learn_web_development/Core/Structuring_content/Basic_HTML_syntax).
- CSS: [cascada](https://developer.mozilla.org/en-US/docs/Learn_web_development/Core/Styling_basics/Handling_conflicts), [modelo de caja](https://developer.mozilla.org/en-US/docs/Learn_web_development/Core/Styling_basics/Box_model), [Flexbox](https://developer.mozilla.org/en-US/docs/Learn_web_development/Core/CSS_layout/Flexbox) y [Grid](https://developer.mozilla.org/en-US/docs/Learn_web_development/Core/CSS_layout/Grids).
- JavaScript: [estándar ECMAScript](https://ecma-international.org/publications-and-standards/standards/ecma-262/) y [modelo de ejecución](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Execution_model).
- APIs del navegador: [DOM](https://developer.mozilla.org/en-US/docs/Web/API/Document_Object_Model), [eventos](https://developer.mozilla.org/en-US/docs/Learn_web_development/Core/Scripting/Events) y [Fetch](https://developer.mozilla.org/en-US/docs/Web/API/Fetch_API/Using_Fetch).
- Servicios del proyecto: [geocodificación de Open-Meteo](https://open-meteo.com/en/docs/geocoding-api), [datos meteorológicos y códigos](https://open-meteo.com/en/docs), [condiciones de uso](https://open-meteo.com/en/terms) y [licencia y atribución](https://open-meteo.com/en/licence).

