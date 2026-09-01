# 18. Expresiones regulares

## Idea central

**Una expresión regular describe un conjunto de secuencias de texto; se construye combinando átomos, cantidades, alternativas y posiciones.** Es productiva para buscar, validar formas, extraer y reemplazar patrones locales, pero no sustituye un parser ni valida el significado del dominio.

La forma más segura de diseñarla es progresiva:

```text
ejemplos válidos e inválidos
→ piezas literales
→ clases y cantidades
→ agrupación
→ anclas
→ pruebas y casos límite
```

## Antes de una regex: búsqueda literal

No todo problema de texto necesita un lenguaje de patrones:

```js
texto.includes("error");
texto.startsWith("TUP-");
texto.endsWith(".md");
texto.indexOf(":");
texto.replaceAll(" ", "-");
```

Estas operaciones son claras cuando la secuencia es fija. Usá una regex cuando deben variar caracteres, cantidad, posición o alternativas.

## Crear un objeto `RegExp`

Literal:

```js
const patron = /javascript/i;
```

Constructor:

```js
const patronDinamico = new RegExp("javascript", "i");
```

Ambos producen objetos:

```js
typeof patron;            // "object"
patron instanceof RegExp; // true
```

El literal se analiza al cargar el código y es preferible para un patrón fijo. El constructor permite incorporar datos en tiempo de ejecución, pero las barras invertidas atraviesan primero la sintaxis del string:

```js
const literal = /\d+/u;
const construido = new RegExp("\\d+", "u");
```

## Texto dinámico: escapar antes de interpolar

Si el usuario busca `a.b`, el punto no debería significar “cualquier carácter”. Hay que escapar los metacaracteres:

```js
function escaparRegex(texto) {
  return texto.replace(/[.*+?^${}()|[\]\\]/gu, "\\$&");
}

const termino = "a.b";
const patron = new RegExp(escaparRegex(termino), "giu");
```

El escape depende del contexto. Insertar dentro de una clase `[]` puede exigir reglas diferentes de insertar como patrón general.

## Caracteres literales

```js
/casa/u.test("la casa azul"); // true
```

La regex busca en cualquier posición salvo que agreguemos anclas. Las mayúsculas importan sin el flag `i`.

## Metacaracteres

Tienen significado especial fuera de clases:

```text
. ^ $ * + ? ( ) [ ] { } | \
```

Para buscar uno literalmente, se escapa:

```js
/\./u.test("archivo.txt");
/\?/u.test("¿qué?");
/\\/u.test("C:\\datos");
```

Dentro de `[]`, las reglas cambian: `-`, `]`, `^` y `\` pueden necesitar atención según su posición.

## El punto

`.` coincide con cualquier carácter salvo terminadores de línea en el modo habitual:

```js
/c.sa/u.test("casa"); // true
/c.sa/u.test("cosa"); // true
```

El flag `s` activa *dotAll* y permite incluir saltos:

```js
/inicio.*fin/su.test("inicio\nfin"); // true
```

Una clase negada suele expresar mejor un límite que `.*?`:

```js
/"[^"]*"/u;
```

## Clases de caracteres

```js
/[abc]/u;       // a, b o c
/[0-9]/u;       // dígito ASCII
/[a-zA-Z]/u;    // letra ASCII inglesa
/[^0-9]/u;      // cualquier carácter excepto dígito ASCII
```

El `^` niega solo si aparece al comienzo de la clase. Un guion al final o escapado se interpreta literalmente:

```js
/[A-Z-]/u;
```

Los rangos siguen puntos de código, no categorías lingüísticas completas. `[A-z]` incluye caracteres entre `Z` y `a` que no son letras; no lo uses como abreviatura de ambos alfabetos.

## Clases abreviadas

```text
\d  dígito ASCII
\D  no dígito
\w  letra ASCII, dígito o guion bajo
\W  no carácter de palabra
\s  espacio o separador reconocido
\S  no espacio
```

```js
/\d+/u.test("Legajo 123"); // true
```

`\w` no representa todas las letras Unicode. Para alfabetos generales, usá propiedades Unicode con `u`:

```js
/\p{L}+/u;  // una o más letras Unicode
/\p{N}+/u;  // números Unicode
/\p{Script=Greek}+/u;
```

La negación usa `\P{...}`.

## Cuantificadores

Se aplican al átomo anterior:

```text
x?       cero o una x
x*       cero o más x
x+       una o más x
x{3}     exactamente tres x
x{2,5}   entre dos y cinco x
x{2,}    dos o más x
```

```js
/ab+/u;          // a seguida de una o más b
/(ab)+/u;        // una o más secuencias "ab"
/colou?r/u;      // u opcional
/\d{2,4}/u;      // entre dos y cuatro dígitos
```

`*` y `?` permiten cero coincidencias. Un patrón puede coincidir con la cadena vacía, lo que tiene consecuencias al repetir búsquedas globales.

## Cuantificadores codiciosos y perezosos

Por defecto intentan consumir lo máximo y retroceden si hace falta:

```js
const texto = "<b>uno</b><i>dos</i>";
texto.match(/<.*>/u)?.[0]; // puede abarcar todo
```

Agregar `?` los vuelve perezosos:

```js
texto.match(/<.*?>/u)?.[0]; // "<b>"
```

Para este caso, una clase con límite explícito es más precisa:

```js
texto.match(/<[^>]*>/u)?.[0];
```

Ninguna de estas expresiones convierte a regex en un parser HTML correcto; atributos, comentarios y contenido especial requieren una herramienta estructural.

## Anclas: posiciones, no caracteres

`^` representa el comienzo y `$` el final:

```js
/^hola/u.test("hola mundo"); // true
/mundo$/u.test("hola mundo"); // true
```

Para validar el texto completo:

```js
const legajo = /^\d{5}$/u;

legajo.test("12345");  // true
legajo.test("X12345"); // false
legajo.test("123456"); // false
```

Sin anclas, `/\d{5}/` solo pregunta si existe una subsecuencia de cinco dígitos.

Con flag `m`, `^` y `$` también operan al inicio y final de cada línea. No confundas texto completo con cada línea.

## Frontera de palabra

`\b` coincide entre una posición de palabra y una de no palabra:

```js
/\bgato\b/u.test("un gato negro"); // true
/\bgato\b/u.test("gatopardo");     // false
```

Su idea de “palabra” está vinculada a `\w` y no cubre de manera intuitiva todos los idiomas. Para segmentación lingüística, `Intl.Segmenter` es más apropiado.

## Agrupar

Los paréntesis agrupan una secuencia para aplicar cantidad o alternativas:

```js
/(ab)+/u;
/^(rojo|verde|azul)$/u;
```

Sin grupo:

```js
/rojo|verde$/u;
```

se interpreta como `rojo` en cualquier posición o `verde` al final. Agrupar hace visible el alcance de la alternativa.

## Capturas

Los grupos también guardan la parte coincidente:

```js
const fecha = "28/08/2026";
const coincidencia = fecha.match(/^(\d{2})\/(\d{2})\/(\d{4})$/u);

coincidencia?.[0]; // texto completo
coincidencia?.[1]; // "28"
coincidencia?.[2]; // "08"
coincidencia?.[3]; // "2026"
```

Un grupo no capturante organiza sin agregar una posición:

```js
/(?:https?|ftp):\/\//u;
```

Usalo cuando no necesitarás el contenido del grupo.

## Grupos con nombre

```js
const patronFecha = /^(?<dia>\d{2})\/(?<mes>\d{2})\/(?<anio>\d{4})$/u;
const resultado = "28/08/2026".match(patronFecha);

if (resultado) {
  const { dia, mes, anio } = resultado.groups;
  console.log({ dia, mes, anio });
}
```

Los nombres resisten mejor cambios de orden y documentan la extracción.

## Referencias a capturas

Una referencia posterior exige repetir el mismo texto:

```js
/\b(\p{L}+)\s+\1\b/giu;
```

Con nombre:

```js
/\b(?<palabra>\p{L}+)\s+\k<palabra>\b/giu;
```

Puede detectar palabras consecutivas repetidas. El flag `i` aplica comparación sin distinguir mayúsculas según las reglas del motor.

## Lookahead y lookbehind

Comprueban contexto sin consumirlo.

Lookahead positivo:

```js
/\d+(?=\s*ARS)/u; // número seguido de ARS
```

Lookahead negativo:

```js
/^(?!admin$)[a-z]+$/u; // palabra minúscula excepto admin
```

Lookbehind positivo:

```js
/(?<=\$)\d+(?:\.\d+)?/u; // número precedido por $
```

Lookbehind negativo:

```js
/(?<!\d)-\d+/u; // signo menos no precedido por dígito
```

Son potentes y pueden reducir legibilidad. A veces capturar el contexto y procesarlo después es más portable y fácil de depurar.

## Flags

| Flag | Efecto |
|---|---|
| `g` | todas las coincidencias y uso de `lastIndex` |
| `i` | ignora diferencias de mayúsculas según reglas del motor |
| `m` | anclas por línea |
| `s` | `.` incluye terminadores de línea |
| `u` | semántica Unicode y sintaxis Unicode estricta |
| `y` | coincidencia adherida a `lastIndex` |
| `d` | índices de los rangos coincidentes |

```js
const patron = /hola/giu;
patron.flags;  // "giu" en un orden canónico
patron.global; // true
patron.source; // "hola"
```

El flag `u` debería ser habitual en patrones modernos que procesan texto Unicode.

## `test`

```js
/error/iu.test("ERROR de conexión"); // true
```

Devuelve un booleano. Con `g` o `y`, el objeto conserva `lastIndex`:

```js
const global = /a/g;

global.test("a"); // true; lastIndex pasa a 1
global.test("a"); // false; comienza desde 1
```

Para comprobaciones independientes, evitá `g` o reiniciá deliberadamente el estado.

## `exec`

```js
const patronNumero = /\d+/gu;
const coincidencia = patronNumero.exec("A12 B34");

coincidencia[0]; // "12"
coincidencia.index; // 1
patronNumero.lastIndex; // posición posterior
```

Con `g`, llamadas sucesivas recorren coincidencias. Si el patrón puede coincidir con vacío, asegurá progreso para evitar bucles infinitos en código manual.

## `match` y `matchAll`

Sin `g`, `match` devuelve detalle de la primera coincidencia:

```js
"A12 B34".match(/(?<numero>\d+)/u);
```

Con `g`, devuelve solo textos completos:

```js
"A12 B34".match(/\d+/gu); // ["12", "34"]
```

`matchAll` devuelve un iterador con detalles para cada coincidencia y requiere `g`:

```js
const resultados = [
  ..."A12 B34".matchAll(/(?<numero>\d+)/gu)
];
```

Es la forma cómoda de obtener grupos e índices de todas las apariciones.

## `replace`

Con referencias:

```js
"28/08/2026".replace(
  /^(\d{2})\/(\d{2})\/(\d{4})$/u,
  "$3-$2-$1"
); // "2026-08-28"
```

Con grupos nombrados:

```js
"28/08/2026".replace(
  /^(?<d>\d{2})\/(?<m>\d{2})\/(?<a>\d{4})$/u,
  "$<a>-$<m>-$<d>"
);
```

Con callback:

```js
"precios: 10 y 20".replace(/\d+/gu, texto =>
  String(Number(texto) * 2)
);
```

Sin `g`, solo reemplaza la primera coincidencia.

## `search` y `split`

```js
"abc 123".search(/\d/u); // 4
"uno, dos; tres".split(/\s*[,;]\s*/u);
// ["uno", "dos", "tres"]
```

Si `split` contiene grupos capturantes, los separadores capturados pueden aparecer en el resultado. Usá `(?:...)` si no los necesitás.

## Construir una validación paso a paso

Código `ABC-1234`:

```text
tres letras ASCII mayúsculas → [A-Z]{3}
guion literal                → -
cuatro dígitos ASCII         → \d{4}
texto completo               → ^[A-Z]{3}-\d{4}$
```

```js
const codigo = /^[A-Z]{3}-\d{4}$/u;
```

Casos de prueba:

```js
const casos = new Map([
  ["ABC-1234", true],
  ["abc-1234", false],
  ["AB-1234", false],
  ["ABC-12345", false],
  ["XABC-1234", false]
]);

for (const [texto, esperado] of casos) {
  console.assert(codigo.test(texto) === esperado, texto);
}
```

## Validar forma y luego significado

Esta regex comprueba una fecha con dos dígitos por componente:

```js
/^\d{2}\/\d{2}\/\d{4}$/u;
```

También acepta `99/99/0000`. Después de extraer:

```js
function leerFecha(texto) {
  const match = texto.match(
    /^(?<dia>\d{2})\/(?<mes>\d{2})\/(?<anio>\d{4})$/u
  );

  if (!match) return null;

  const dia = Number(match.groups.dia);
  const mes = Number(match.groups.mes);
  const anio = Number(match.groups.anio);
  const fecha = new Date(Date.UTC(anio, mes - 1, dia));

  const valida =
    fecha.getUTCFullYear() === anio &&
    fecha.getUTCMonth() === mes - 1 &&
    fecha.getUTCDate() === dia;

  return valida ? fecha : null;
}
```

Regex valida forma; el código valida calendario.

## Email: no exagerar

Una comprobación práctica puede detectar errores obvios:

```js
const formaBasica = /^[^\s@]+@[^\s@]+\.[^\s@]+$/u;
```

No prueba que la dirección exista ni cubre necesariamente todas las variantes permitidas por estándares. La verificación real es enviar un mensaje o usar un flujo de confirmación. Ajustá la sintaxis a lo que la aplicación realmente admite, sin prometer validación universal.

## Patrones útiles

Normalizar espacios:

```js
texto.trim().replace(/\s+/gu, " ");
```

Extraer números:

```js
[...texto.matchAll(/[+-]?\d+(?:[.,]\d+)?/gu)]
  .map(match => match[0]);
```

Hashtags Unicode:

```js
[...texto.matchAll(/#(?<etiqueta>[\p{L}\p{N}_]+)/gu)]
  .map(match => match.groups.etiqueta);
```

Hora de 24 horas:

```js
/^(?:[01]\d|2[0-3]):[0-5]\d$/u;
```

Nombre y número:

```js
const linea = /^(?<nombre>\p{L}+(?:[ '\-]\p{L}+)*)\s*:\s*(?<valor>\d+)$/u;
```

El patrón refleja un contrato concreto; no pretende reconocer todos los nombres del mundo.

## Rendimiento y retroceso excesivo

Algunos motores exploran alternativas mediante retroceso. Patrones ambiguos con cuantificadores anidados pueden crecer de forma extrema ante entradas que casi coinciden:

```js
/(a+)+$/u;
```

Con muchas `a` seguidas de un carácter inválido, puede requerir gran cantidad de intentos. Para entradas externas:

- evitá cuantificadores anidados ambiguos;
- usá clases y límites más específicos;
- limitá el tamaño de entrada;
- medí patrones críticos con casos adversos;
- no aceptes patrones arbitrarios de usuarios sin aislamiento y límites.

Una regex corta no es necesariamente barata.

## Regex y autómatas

En su forma teórica, una expresión regular describe un lenguaje regular que puede reconocerse con un autómata finito. JavaScript agrega extensiones como referencias a capturas y lookaround que superan parte de esa definición clásica.

El modelo útil sigue siendo:

```text
estado actual + próximo símbolo → nuevo estado
```

Las anclas restringen posiciones, las clases aceptan conjuntos de símbolos, los cuantificadores repiten transiciones y `|` ofrece caminos alternativos.

## Cuándo no usar regex

No es la herramienta principal para:

- JSON: `JSON.parse`;
- HTML o XML general: parser estructural;
- CSV completo: parser con comillas y saltos;
- código fuente: tokenizador y parser;
- estructuras anidadas arbitrariamente;
- validación semántica de fechas, dominios o identidades.

Puede participar en una fase pequeña, como tokenizar un fragmento o comprobar una forma antes del parser.

## Errores frecuentes

- olvidar anclas al validar el texto completo;
- no escapar texto dinámico;
- confundir `\d` y `\w` con todas las categorías Unicode;
- capturar grupos que solo servían para agrupar;
- usar `g` con `test` y olvidar `lastIndex`;
- esperar grupos detallados de `match` global;
- usar `.*` cuando existe un delimitador específico;
- validar solo forma y asumir significado;
- crear patrones vulnerables a retroceso excesivo;
- usar regex como parser de una gramática anidada.

## Práctica guiada

Procesá líneas con el formato:

```text
APELLIDO, Nombres <correo> [legajo: 12345]
```

1. escribí ejemplos válidos e inválidos;
2. construí el patrón por partes;
3. usá grupos nombrados;
4. aceptá letras Unicode y espacios internos controlados;
5. extraé datos con `matchAll` desde un archivo con varias líneas;
6. validá por separado que el legajo pertenezca al rango esperado;
7. limitá la longitud de cada línea antes de aplicar el patrón.

## Para recordar

- Una regex describe posibilidades; no “entiende” el significado del texto.
- Construí desde átomos, cantidades, grupos y posiciones, guiado por ejemplos.
- Anclas convierten una búsqueda en validación completa; capturas convierten coincidencias en datos.
- Flags y métodos cambian estado y forma del resultado; `g` merece atención especial.
- Regex es excelente para patrones locales y peligrosa cuando reemplaza parsers, validación semántica o límites de seguridad.
