# 5. El tipo `string` y Unicode

## Idea central

**Un string es una secuencia inmutable de unidades UTF-16, no una lista perfecta de letras visibles.** Para procesar texto correctamente hay que elegir la unidad adecuada —unidad de código, punto de código o grafema—, normalizar cuando corresponda y separar comparación técnica de orden lingüístico.

Esta idea explica por qué el texto cotidiano parece sencillo hasta que aparecen acentos combinados, alfabetos diferentes o emoji.

## Crear cadenas

JavaScript admite comillas simples, dobles y plantillas literales:

```js
const simple = 'Hola';
const doble = "Hola";
const nombre = "Ana";
const plantilla = `Hola, ${nombre}`;
```

Las comillas simples y dobles tienen el mismo comportamiento. Elegí una convención y dejá que una herramienta de formato la aplique.

Las secuencias de escape representan caracteres especiales:

```js
const linea = "primera\nsegunda";
const tabulado = "nombre\tedad";
const comillas = "Dijo: \"hola\"";
const barra = "C:\\datos\\archivo.txt";
```

También pueden escribirse puntos de código:

```js
const letra = "\u0041";       // A
const emoji = "\u{1F600}";    // 😀; requiere llaves por superar FFFF
```

## Plantillas literales

Las comillas invertidas permiten interpolar expresiones y escribir varias líneas:

```js
const producto = "teclado";
const precio = 25000;

const mensaje = `${producto.toUpperCase()}: $${precio}`;
```

Dentro de `${...}` puede aparecer cualquier expresión, pero una plantilla muy compleja pierde legibilidad. Calculá primero las decisiones importantes:

```js
const precioFormateado = formatoMoneda.format(precio);
const mensaje = `${producto}: ${precioFormateado}`;
```

Las plantillas preservan saltos y espacios de la fuente:

```js
const bloque = `línea 1
línea 2`;
```

## Los strings son inmutables

No se puede cambiar una posición:

```js
const palabra = "casa";
palabra[0] = "C"; // no modifica el string
```

Cada método produce un nuevo valor:

```js
const original = "  JavaScript  ";
const limpio = original.trim();
const mayusculas = limpio.toUpperCase();

original;   // "  JavaScript  "
limpio;     // "JavaScript"
mayusculas; // "JAVASCRIPT"
```

Una variable `let` puede vincularse después con otra cadena, pero ninguna de las cadenas fue modificada internamente.

## Longitud y acceso por índice

```js
const texto = "JavaScript";
texto.length; // 10
texto[0];     // "J"
texto.at(-1); // "t"
```

Los índices y `length` operan sobre **unidades de código UTF-16**. Para texto ASCII y muchos caracteres del alfabeto latino, una unidad coincide con lo que esperamos. No es una garantía general.

`charAt` es una API histórica:

```js
texto.charAt(0); // "J"
texto[99];       // undefined
texto.charAt(99); // ""
```

`codePointAt` obtiene el punto de código que comienza en una posición:

```js
"😀".codePointAt(0); // 128512
String.fromCodePoint(128512); // "😀"
```

## Extraer partes

`slice(inicio, fin)` usa un fin exclusivo y acepta índices negativos:

```js
const lenguaje = "JavaScript";
lenguaje.slice(0, 4);  // "Java"
lenguaje.slice(4);     // "Script"
lenguaje.slice(-6);    // "Script"
```

`substring` también usa fin exclusivo, pero transforma negativos en cero e intercambia los argumentos si están invertidos. `substr` es histórica y debe evitarse en código nuevo. `slice` ofrece el modelo más coherente con arrays.

Recordá que cortar por índices UTF-16 puede dividir un carácter compuesto o un emoji.

## Buscar contenido literal

```js
const frase = "Aprender JavaScript con práctica";

frase.includes("JavaScript"); // true
frase.startsWith("Aprender"); // true
frase.endsWith("práctica");   // true
frase.indexOf("JavaScript");  // 9
frase.lastIndexOf("a");       // última posición o -1
```

Estas operaciones son preferibles a una expresión regular cuando la búsqueda es exacta. Comunican mejor la intención y no introducen metacaracteres.

## Transformar y normalizar la forma

```js
"  hola  ".trim();
"hola".toUpperCase();
"HOLA".toLowerCase();
"7".padStart(3, "0"); // "007"
"x".repeat(4);        // "xxxx"
```

`trimStart` y `trimEnd` actúan sobre un solo extremo. Los cambios de mayúsculas pueden depender del idioma:

```js
"istanbul".toLocaleUpperCase("tr");
```

No uses `toLowerCase` como sustituto automático de todas las reglas de identidad. Nombres de usuario, rutas, correos y textos humanos tienen contratos diferentes.

## Reemplazar y separar

```js
"uno dos uno".replace("uno", "1");    // "1 dos uno"
"uno dos uno".replaceAll("uno", "1"); // "1 dos 1"
"a,b,c".split(",");                    // ["a", "b", "c"]
```

`replace` acepta strings o expresiones regulares y también una función de reemplazo. `split` no es un parser de formatos complejos: un CSV con comillas y comas internas necesita reglas adicionales o una biblioteca.

Para unir un array:

```js
["Ana", "Luis", "Sofía"].join(" | ");
```

## Concatenación y coerción

El operador `+` suma números o concatena si aparece una cadena:

```js
1 + 2;       // 3
"1" + 2;     // "12"
1 + 2 + "3"; // "33"
"1" + 2 + 3; // "123"
```

La evaluación ocurre de izquierda a derecha. Para mensajes, una plantilla evita depender de esa regla:

```js
const mensaje = `Total: ${1 + 2}`;
```

La conversión explícita es `String(valor)`:

```js
String(42);        // "42"
String(true);      // "true"
String(null);      // "null"
String(undefined); // "undefined"
```

`valor.toString()` requiere que el valor no sea `null` ni `undefined`. `String` es más seguro para una conversión general.

## Tres unidades diferentes de texto

Consideremos:

```js
const emoji = "😀";
```

Visualmente es un símbolo, Unicode le asigna un punto de código y UTF-16 lo almacena con dos unidades sustitutas:

```js
emoji.length;      // 2 unidades UTF-16
[...emoji].length; // 1 punto de código
```

Ahora consideremos una `á` formada por `a` y un acento combinante:

```js
const combinada = "a\u0301";
[...combinada].length; // 2 puntos de código
```

Una persona ve una sola letra. Por lo tanto:

```text
unidad UTF-16 ≠ punto de código ≠ grafema visible
```

Un emoji familiar también reúne varios puntos de código mediante selectores y uniones:

```js
const familia = "👨‍👩‍👧‍👦";
familia.length > 1;      // true
[...familia].length > 1; // true
```

## Recorrer puntos de código

Un bucle por índice puede separar pares sustitutos:

```js
for (let i = 0; i < "A😀B".length; i += 1) {
  console.log("A😀B"[i]);
}
```

`for...of` usa el iterador de strings y conserva puntos de código:

```js
for (const caracter of "A😀B") {
  console.log(caracter); // A, 😀, B
}
```

El spread y `Array.from` aplican el mismo protocolo:

```js
[..."A😀B"];          // ["A", "😀", "B"]
Array.from("A😀B");    // ["A", "😀", "B"]
```

## Recorrer grafemas con `Intl.Segmenter`

Cuando la unidad es lo que percibe la persona —por ejemplo, limitar un nombre visible—, usá segmentación de grafemas:

```js
const segmentador = new Intl.Segmenter("es", {
  granularity: "grapheme"
});

function grafemas(texto) {
  return [...segmentador.segment(texto)]
    .map(parte => parte.segment);
}

grafemas("a\u0301👨‍👩‍👧‍👦").length; // 2
```

`Intl.Segmenter` también puede segmentar palabras y oraciones según reglas lingüísticas. Su disponibilidad depende del entorno y de los datos internacionales incluidos.

## Normalización Unicode

Dos cadenas pueden verse iguales y contener secuencias distintas:

```js
const compuesta = "á";
const descompuesta = "a\u0301";

compuesta === descompuesta; // false
```

Normalizar las lleva a una forma acordada:

```js
compuesta.normalize("NFC") === descompuesta.normalize("NFC"); // true
```

Formas principales:

- `NFC`: composición canónica, frecuente para almacenar y comparar;
- `NFD`: descomposición canónica;
- `NFKC` y `NFKD`: incluyen equivalencias de compatibilidad y pueden cambiar distinciones visuales significativas.

Normalizar es una decisión del dominio. No elimina automáticamente acentos ni resuelve todas las equivalencias de identidad.

## Comparación técnica y comparación humana

La igualdad estricta compara secuencias exactas de unidades:

```js
"Ana" === "ana"; // false
```

Los operadores `<` y `>` producen un orden lexicográfico por unidades de código:

```js
["2", "10"].toSorted(); // ["10", "2"]
```

Para ordenar números almacenados como texto, convertí o proporcioná un comparador numérico:

```js
["2", "10"].toSorted((a, b) => Number(a) - Number(b));
```

Para texto humano:

```js
const collator = new Intl.Collator("es", {
  sensitivity: "base",
  numeric: true
});

const ordenados = nombres.toSorted(collator.compare);
```

`sensitivity: "base"` puede ignorar diferencias de mayúsculas y acentos para comparar, según el idioma. No transforma el texto almacenado.

## Tagged templates

Una función puede recibir las partes literales y los valores interpolados:

```js
function inspeccionar(partes, ...valores) {
  return { partes, valores };
}

const usuario = "Ana";
const resultado = inspeccionar`Hola ${usuario}, tenés ${3} mensajes`;
```

Las plantillas etiquetadas permiten construir DSL, sanitizar salidas o parametrizar consultas. La seguridad depende de que la función trate cada contexto correctamente; no alcanza con “escapar todo” de una sola manera.

`String.raw` devuelve las barras como fueron escritas:

```js
String.raw`C:\usuarios\ana`; // "C:\\usuarios\\ana" como contenido visible escapado
```

Es útil para ejemplos de regex y rutas, aunque `node:path` sigue siendo la herramienta adecuada para construir rutas reales.

## Errores frecuentes

- usar `length` como cantidad universal de caracteres visibles;
- cortar por índice y dejar un emoji o acento partido;
- ordenar texto humano con `<` o `sort()` sin comparador;
- convertir a minúsculas sin decidir idioma y reglas de identidad;
- concatenar números y strings esperando suma;
- intentar interpretar CSV, HTML o lenguajes anidados con operaciones de texto demasiado simples;
- normalizar o quitar acentos sin conservar el original cuando tiene valor.

## Para recordar

- Los strings son inmutables y sus índices trabajan con UTF-16.
- `for...of` recorre puntos de código; `Intl.Segmenter` puede recorrer grafemas.
- Normalización, cambio de mayúsculas y comparación lingüística resuelven problemas diferentes.
- Las plantillas literales expresan interpolación; las tagged templates permiten crear protocolos de procesamiento.
- Al procesar texto, primero definí qué unidad y qué equivalencia necesita el usuario.
