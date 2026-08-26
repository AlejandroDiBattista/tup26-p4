# Expresiones regulares en JavaScript

Programación IV: Desarrollo Web — Etapa 1, fundamentos técnicos
Apunte complementario de la unidad de JavaScript

Hasta ahora, cuando buscaste algo dentro de un texto, buscaste un contenido exacto. `texto.includes("hola")` pregunta si esas cuatro letras están ahí.

Pero casi todo lo que necesitás en una aplicación web no tiene contenido exacto. Un email no es una cadena concreta: es cualquier cadena con arroba en el medio y un punto después. Un teléfono no es un número fijo: es cualquier secuencia de dígitos con espacios, guiones y paréntesis salpicados. Una fecha, un CUIT, un código postal, un nombre de archivo, todos son lo mismo: una forma, no un valor.

Las expresiones regulares son el lenguaje para describir formas. Este apunte arranca por qué son y de dónde salen, después cómo se escriben, y termina en recetas que vas a copiar y pegar en el proyecto de la materia.

## Qué es una expresión regular

Una expresión regular describe un conjunto de cadenas.

Esa es toda la definición y conviene tomársela literal. La expresión `/ab/` no es una instrucción para buscar. Es el nombre de un conjunto que tiene un solo elemento, la cadena `"ab"`. La expresión `/ab*/` nombra un conjunto infinito: `"a"`, `"ab"`, `"abb"`, `"abbb"` y así para siempre.

Cuando escribís `patron.test(texto)` no le estás pidiendo al motor que busque. Le estás preguntando si el texto pertenece al conjunto que describe el patrón.

Ese cambio de perspectiva ayuda cuando una expresión no anda. La pregunta deja de ser "por qué no encuentra lo que quiero" y pasa a ser "qué conjunto describí realmente", que casi siempre resulta ser más grande de lo que pensabas.

## Las tres operaciones que lo generan todo

Un conjunto de cadenas se construye con tres operaciones, y solo tres. Todo lo demás que vas a ver en este apunte es abreviatura.

La primera es la concatenación. Si ponés dos patrones uno al lado del otro, describís las cadenas que tienen el primero seguido del segundo:

```js
/ab/.test("ab"); // true
```

La segunda es la alternancia. La barra vertical describe la unión de dos conjuntos, o sea las cadenas que están en uno o en el otro:

```js
/gato|perro/.test("perro"); // true
```

La tercera es la repetición. El asterisco describe cero o más copias de lo que tiene a la izquierda:

```js
/ab*/.test("a"); // true
/ab*/.test("abbb"); // true
```

Con esas tres se puede describir cualquier conjunto regular. El resto de la sintaxis existe para no escribir tanto:

- `a+` es lo mismo que `aa*`
- `a?` es lo mismo que `(a|)`
- `[abc]` es lo mismo que `(a|b|c)`
- `a{2,3}` es lo mismo que `(aa|aaa)`
- `\d` es lo mismo que `[0-9]`, que a su vez es `(0|1|2|3|4|5|6|7|8|9)`

Nada de eso agrega poder. Agrega comodidad. Si alguna vez te perdés en un patrón, traducilo mentalmente a estas tres operaciones y vuelve a tener sentido.

## La máquina que las ejecuta

Un motor de expresiones regulares es, en su forma pura, un autómata finito. Lee el texto de izquierda a derecha, un carácter por vez, y lo único que recuerda es en qué estado está. La cantidad de estados es fija y se decide cuando se compila el patrón.

De ahí sale la consecuencia más importante y la que más se ignora: una expresión regular no puede contar.

No tiene una memoria que crezca, así que no puede llevar la cuenta de cuántos paréntesis abrió para exigir que se cierren todos. No puede verificar que un HTML esté bien anidado. No puede validar una expresión aritmética con paréntesis adentro de paréntesis.

Cuando alguien te diga que las expresiones regulares no sirven para parsear HTML, esta es la razón técnica. No es una opinión de estilo: HTML anidado no es un lenguaje regular, así que ninguna expresión regular lo describe.

Ahora, el motor de JavaScript no es un autómata finito puro. Tiene funciones que se salen de la teoría, como las retrorreferencias y las miradas, y las implementa con retroceso: prueba un camino, y si falla, vuelve atrás y prueba otro. Guardate ese dato, porque al final del apunte explica por qué un patrón de tres líneas puede colgar un servidor.

## Cómo se escribe una en JavaScript

Hay dos formas. La literal va entre barras y se compila cuando el motor lee el archivo:

```js
const patron = /\d+/g;
```

La otra usa el constructor y recibe una cadena, así que se compila en tiempo de ejecución:

```js
const patron = new RegExp("\\d+", "g");
```

Fijate la doble barra invertida. En la cadena, `"\\d"` produce los dos caracteres `\d`, que son los que el motor necesita. Es la fuente de errores más común con el constructor.

La regla para elegir es simple: si el patrón es fijo, usá la forma literal, que se lee mejor y se compila una sola vez. Usá el constructor solo cuando el patrón se arme en tiempo de ejecución, por ejemplo a partir de lo que el usuario escribió en un buscador.

Y si armás un patrón con texto del usuario, escapalo antes. Si no, un usuario que busca `precio (final)` te rompe la aplicación, porque los paréntesis significan otra cosa:

```js
function escapar(texto) {
  return texto.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
}

const patron = new RegExp(escapar(loQueEscribio), "gi");
```

Las versiones nuevas del lenguaje traen `RegExp.escape`, que hace lo mismo. Mientras no puedas contar con ella en todos los navegadores que te interesan, dejá la función de arriba.

## Los métodos que las usan

Antes de la sintaxis conviene saber quién las ejecuta, porque la mitad de los problemas vienen de elegir mal el método.

| Llamada | Qué devuelve |
|---|---|
| `patron.test(texto)` | `true` o `false` |
| `texto.search(patron)` | la posición de la primera coincidencia, o `-1` |
| `texto.match(patron)` | sin `g`, la primera coincidencia con sus grupos; con `g`, un arreglo de textos sin grupos |
| `texto.matchAll(patron)` | un iterador con todas las coincidencias y sus grupos, y exige la bandera `g` |
| `texto.replace(patron, r)` | el texto con la primera coincidencia reemplazada, o todas si el patrón lleva `g` |
| `texto.replaceAll(patron, r)` | el texto con todas reemplazadas, y exige `g` si el patrón es una expresión regular |
| `texto.split(patron)` | un arreglo de partes |
| `patron.exec(texto)` | la próxima coincidencia, o `null`, avanzando entre llamadas si lleva `g` |

Para preguntar si algo cumple una forma, usá `test`. Para sacar datos, usá `matchAll`. Ese par cubre casi todo:

```js
const texto = "Pedidos: 12, 7 y 340 unidades";

/\d+/.test(texto); // true

[...texto.matchAll(/\d+/g)].map((c) => Number(c[0]));
// [12, 7, 340]
```

Cada coincidencia que devuelve `matchAll` o `exec` es un arreglo con extras. La posición `0` tiene el texto completo que coincidió, las siguientes tienen los grupos, y además trae `index` con la posición y `groups` con los grupos nombrados.

## Literales y escapes

Casi todos los caracteres se representan a sí mismos. La letra `a` describe la letra `a`.

Los que no lo hacen son los metacaracteres, que tienen significado propio:

```
. * + ? ^ $ | \ ( ) [ ] { }
```

Para describir uno de esos caracteres tal cual, ponele una barra invertida adelante:

```js
/3\.14/.test("3.14"); // true
/3.14/.test("3x14"); // true, porque el punto significa "cualquier carácter"
```

El segundo caso es el error clásico. Un punto sin escapar acepta cualquier cosa, así que un patrón para validar precios acepta basura sin que te enteres.

## Clases de caracteres

Los corchetes describen un carácter que puede ser cualquiera de los que están adentro:

```js
/[aeiou]/.test("ritmo"); // false
/gr[ia]s/.test("gris"); // true
```

Adentro de los corchetes podés usar rangos con guion, y podés negar todo el conjunto poniendo `^` al principio:

```js
/[a-z]/; // una minúscula de la a a la z
/[0-9a-fA-F]/; // un dígito hexadecimal
/[^0-9]/; // cualquier cosa que no sea un dígito
```

Adentro de los corchetes casi ningún metacarácter conserva su significado. El punto es un punto y el asterisco es un asterisco. Solo hay que cuidar cuatro: el `]` que cierra, la barra invertida, el `^` cuando va primero y el guion cuando queda entre dos caracteres.

## Los atajos y una advertencia sobre el español

Hay abreviaturas para las clases más usadas:

| Atajo | Qué describe | Equivale a |
|---|---|---|
| `\d` | un dígito | `[0-9]` |
| `\D` | cualquier cosa menos un dígito | `[^0-9]` |
| `\w` | un carácter de palabra | `[A-Za-z0-9_]` |
| `\W` | lo contrario de `\w` | `[^A-Za-z0-9_]` |
| `\s` | un espacio en blanco | espacio, tabulación, salto de línea |
| `\S` | lo contrario de `\s` | |
| `.` | cualquier carácter menos el salto de línea | |

Mirá con atención la definición de `\w`. Son las letras del inglés. No incluye la eñe ni las vocales acentuadas:

```js
"Muñoz".match(/\w+/)[0]; // "Mu"
"José".match(/\w+/)[0]; // "Jos"
```

Esto es una fuente de bugs enorme en cualquier aplicación en castellano, y aparece cuando ya está en producción y un cliente se llama Peña. La solución es pedir letras de verdad con una propiedad Unicode, que necesita la bandera `u`:

```js
"Muñoz".match(/\p{L}+/u)[0]; // "Muñoz"
"José".match(/\p{L}+/u)[0]; // "José"
```

Tomá `\p{L}` como el reemplazo por omisión de `\w` en todo lo que escribas para usuarios hispanohablantes.

## Cuantificadores

Un cuantificador dice cuántas veces se repite lo que tiene a la izquierda:

| Cuantificador | Cuántas veces |
|---|---|
| `*` | cero o más |
| `+` | una o más |
| `?` | cero o una |
| `{3}` | exactamente 3 |
| `{2,}` | 2 o más |
| `{2,4}` | entre 2 y 4 |

Se aplican al elemento inmediatamente anterior, que puede ser un carácter, una clase o un grupo entero:

```js
/ho+la/.test("hoooola"); // true
/[0-9]{4}/.test("2026"); // true
/(ja)+/.test("jajaja"); // true
```

El error frecuente es olvidar el grupo. `/ja+/` describe una jota seguida de varias aes, no varias risas.

## Codicia y pereza

Por omisión, un cuantificador es codicioso: se lleva todo lo que puede y recién después devuelve lo mínimo necesario para que el resto del patrón encaje.

```js
const html = "<b>hola</b> <i>chau</i>";

html.match(/<.+>/)[0]; // "<b>hola</b> <i>chau</i>"
```

Eso sorprende la primera vez. Pediste algo entre `<` y `>`, y te devolvió desde el primer `<` hasta el último `>`, porque el punto también acepta esos caracteres y el `+` agarró todo.

Agregando un signo de pregunta después del cuantificador lo volvés perezoso: toma lo mínimo y crece solo si hace falta.

```js
html.match(/<.+?>/)[0]; // "<b>"
```

La regla práctica es que cuando extraés algo delimitado, casi siempre querés la versión perezosa. La alternativa, muchas veces mejor, es prohibir el delimitador dentro de la parte que capturás:

```js
html.match(/<[^>]+>/)[0]; // "<b>"
```

Esta última es más rápida que la perezosa, porque no necesita retroceder. Volvemos sobre eso al final.

## Anclas y límites de palabra

Un patrón por omisión puede coincidir en cualquier parte del texto. Las anclas lo atan a una posición:

- `^` marca el principio del texto
- `$` marca el final del texto
- `\b` marca un límite de palabra
- `\B` marca la ausencia de un límite de palabra

La diferencia entre validar y buscar es exactamente esta:

```js
/\d{4}/.test("abc 2026 xyz"); // true, encontró 4 dígitos en el medio
/^\d{4}$/.test("abc 2026 xyz"); // false
/^\d{4}$/.test("2026"); // true
```

Cuando validás un campo de formulario, anclá siempre con `^` y `$`. Sin anclas, `/\d{4}/` acepta cualquier basura que contenga cuatro dígitos en algún lado.

Los límites de palabra sirven para buscar palabras enteras:

```js
"la casa y la casona".match(/\bcasa\b/g); // ["casa"]
"la casa y la casona".match(/casa/g); // ["casa", "casa"]
```

Un `\b` no consume ningún carácter. Solo afirma que en esa posición cambia de un carácter de palabra a uno que no lo es. Y como se define en términos de `\w`, arrastra el mismo problema con la eñe.

## Alternancia y grupos

La barra vertical separa alternativas, y tiene la precedencia más baja de toda la sintaxis. Eso confunde:

```js
/^gato|perro$/; // "empieza con gato" o "termina con perro"
/^(gato|perro)$/; // exactamente "gato" o exactamente "perro"
```

Casi siempre querés la segunda. Los paréntesis limitan el alcance de la alternancia, igual que en aritmética.

Los paréntesis hacen dos cosas a la vez: agrupan y capturan. Si solo necesitás agrupar, usá un grupo sin captura, que se escribe con `(?:`:

```js
/(?:ja)+/; // agrupa, no captura
```

No es solo cosmética. Con muchos grupos, los que no capturan hacen que el motor trabaje menos y que la numeración de los que sí capturan no se corra cada vez que agregás un paréntesis.

## Grupos de captura y grupos nombrados

Un grupo que captura guarda la parte del texto que coincidió, para que la puedas leer después:

```js
const patron = /(\d{2})\/(\d{2})\/(\d{4})/;
const c = "Vence el 15/08/2026".match(patron);

c[0]; // "15/08/2026"
c[1]; // "15"
c[2]; // "08"
c[3]; // "2026"
```

Depender de los números es frágil: agregás un paréntesis al principio y se corren todos. Poneles nombre:

```js
const patron = /(?<dia>\d{2})\/(?<mes>\d{2})\/(?<anio>\d{4})/;
const { groups } = "Vence el 15/08/2026".match(patron);

groups.dia; // "15"
groups.anio; // "2026"
```

La sintaxis `(?<nombre>...)` es la misma de C#, así que esto ya lo vieron con `System.Text.RegularExpressions`.

Los grupos nombrados se combinan muy bien con la desestructuración que vimos en tipos compuestos:

```js
const {
  groups: { dia, mes, anio },
} = "15/08/2026".match(patron);
```

## Retrorreferencias

Una retrorreferencia exige que algo que ya apareció vuelva a aparecer igual. Se escribe `\1` para el primer grupo, o `\k<nombre>` si el grupo tiene nombre:

```js
/(\w)\1/.test("casa"); // false
/(\w)\1/.test("carro"); // true, la doble erre
```

El uso práctico más común es detectar palabras repetidas al corregir un texto:

```js
const patron = /\b(\p{L}+)\s+\1\b/giu;

"esto tiene tiene un error".match(patron); // ["tiene tiene"]
```

Acá se rompe la teoría, dicho sea de paso. Un autómata finito no puede recordar una palabra de largo arbitrario para compararla después. Las retrorreferencias son una de las funciones que sacan al motor del terreno regular y lo obligan a retroceder.

## Miradas hacia adelante y hacia atrás

Una mirada verifica una condición sin consumir texto. Son cuatro:

| Sintaxis | Qué exige |
|---|---|
| `(?=...)` | que lo que sigue coincida |
| `(?!...)` | que lo que sigue no coincida |
| `(?<=...)` | que lo anterior coincida |
| `(?<!...)` | que lo anterior no coincida |

La palabra clave es "sin consumir". Después de una mirada, el motor sigue parado en el mismo lugar donde estaba.

Eso permite exigir varias condiciones sobre el mismo texto a la vez, que es el caso de uso estrella:

```js
const fuerte = /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[^\w\s]).{10,}$/;

fuerte.test("hola1234"); // false
fuerte.test("HolaMundo1!"); // true
```

Leelo de izquierda a derecha, parado en el principio del texto. Exige que en algún lugar más adelante haya una minúscula. Volvé al principio. Exige que haya una mayúscula. Volvé al principio. Y así con el dígito y con el símbolo. Recién al final consume el texto y le pide 10 caracteres o más.

Sin miradas habría que escribir todas las combinaciones de orden posibles, que son muchísimas.

Las miradas hacia atrás sirven para extraer sin arrastrar el contexto:

```js
"El total es $1500".match(/(?<=\$)\d+/)[0]; // "1500"
```

El signo peso no queda en el resultado, porque nunca se consumió.

## Las banderas

Las banderas van después de la barra final y cambian cómo se aplica el patrón:

| Bandera | Qué hace |
|---|---|
| `g` | busca todas las coincidencias, no solo la primera |
| `i` | ignora mayúsculas y minúsculas |
| `m` | hace que `^` y `$` valgan por línea y no por texto entero |
| `s` | hace que el punto también acepte el salto de línea |
| `u` | interpreta el patrón por puntos de código Unicode y habilita `\p{...}` |
| `v` | como `u`, y además permite operaciones de conjuntos entre clases |
| `y` | obliga a que la coincidencia empiece justo en `lastIndex` |
| `d` | agrega las posiciones de inicio y fin de cada grupo |

La bandera `m` es la que hace posible procesar un archivo de texto línea por línea con un solo patrón:

```js
const log = `GET /api/contactos 200 12ms
POST /api/contactos 201 34ms
GET /api/contactos/7 404 3ms`;

const patron =
  /^(?<metodo>GET|POST|PUT|DELETE) (?<ruta>\S+) (?<estado>\d{3}) (?<ms>\d+)ms$/gm;

for (const { groups } of log.matchAll(patron)) {
  if (groups.estado.startsWith("4")) console.log(groups.ruta);
}
// /api/contactos/7
```

## La trampa de la bandera g

Una expresión regular con `g` guarda estado. La propiedad `lastIndex` recuerda dónde terminó la última búsqueda, y la próxima llamada arranca desde ahí.

Con `matchAll` eso es invisible y funciona bien. Con `test` en un bucle produce uno de los bugs más desconcertantes del lenguaje:

```js
const patron = /a/g;

patron.test("a"); // true
patron.test("a"); // false
patron.test("a"); // true
```

El mismo texto, el mismo patrón, y el resultado alterna. La primera llamada encuentra la `a` y deja `lastIndex` en 1. La segunda arranca en la posición 1, no encuentra nada, devuelve `false` y reinicia `lastIndex` en 0.

Hay tres formas de evitarlo:

- no le pongas `g` a un patrón que vas a usar con `test`, porque `test` no la necesita
- creá el patrón adentro de la función, así cada llamada arranca con uno nuevo
- si tenés que reusarlo, poné `patron.lastIndex = 0` antes de cada uso

La primera es la buena. Reservá `g` para `matchAll`, `replace` y `replaceAll`.

## Reemplazar

El segundo argumento de `replace` puede ser un texto con marcadores especiales:

| Marcador | Qué inserta |
|---|---|
| `$&` | todo el texto que coincidió |
| `$1`, `$2` | el grupo número 1, 2 |
| `$<nombre>` | el grupo nombrado |
| `` $` `` | lo que había antes de la coincidencia |
| `$'` | lo que había después |
| `$$` | un signo peso literal |

Convertir una fecha de formato argentino a formato ISO se resuelve en una línea:

```js
"15/08/2026".replace(
  /^(?<dia>\d{2})\/(?<mes>\d{2})\/(?<anio>\d{4})$/,
  "$<anio>-$<mes>-$<dia>",
);
// "2026-08-15"
```

Cuando el reemplazo necesita lógica, pasá una función. Recibe el texto completo, después cada grupo, después la posición, el texto original y, si hay grupos nombrados, un objeto con ellos:

```js
const precios = "Camisa $1500, pantalón $2300";

precios.replace(/\$(\d+)/g, (todo, monto) => {
  const conIva = Math.round(Number(monto) * 1.21);
  return `$${conIva}`;
});
// "Camisa $1815, pantalón $2783"
```

La función se llama una vez por coincidencia. Es la puerta para hacer cualquier cosa que el patrón solo no puede.

## Unicode

Sin la bandera `u`, el motor trabaja de a unidades de 16 bits, y los caracteres que necesitan más de una se parten al medio:

```js
"café ☕".match(/./gu).length; // 6
```

Con `u` habilitás además las propiedades Unicode, que son mucho más expresivas que los atajos clásicos:

- `\p{L}` cualquier letra
- `\p{Lu}` una letra mayúscula
- `\p{N}` cualquier dígito, incluidos los de otros alfabetos
- `\p{P}` un signo de puntuación
- `\p{Script=Latin}` una letra del alfabeto latino

Poné `u` por costumbre en todo patrón nuevo. Casi nunca molesta y evita sorpresas con nombres, emojis y texto pegado desde Word.

## Recetas para el proyecto de la materia

Estas son las que vas a usar en la agenda de contactos.

Validar un email sin volverse loco. La expresión completa del estándar tiene miles de caracteres y no vale la pena. Esta alcanza, porque el que valida de verdad es el mail de confirmación que le mandás después:

```js
const esEmail = (valor) => /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(valor.trim());
```

Dejar un teléfono en dígitos, sin importar cómo lo hayan escrito:

```js
const soloDigitos = (tel) => tel.replace(/\D+/g, "");

soloDigitos("+54 (381) 155-123456"); // "54381155123456"
```

Validar un CUIT por su forma, antes de verificar el dígito verificador:

```js
const formaDeCuit = /^\d{2}-\d{8}-\d$/;
```

Convertir un nombre en un identificador para la URL:

```js
function aSlug(texto) {
  return texto
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "");
}

aSlug("Café Martínez — Sucursal Yerba Buena");
// "cafe-martinez-sucursal-yerba-buena"
```

El truco de las dos primeras líneas merece explicación. `normalize("NFD")` separa cada letra acentuada en dos caracteres, la letra pelada y el acento. El rango `[\u0300-\u036f]` son justamente los acentos, así que el `replace` los borra y queda la letra sola.

Separar un contacto pegado desde un mail:

```js
const patron = /^(?<nombre>[^<]+?)\s*<(?<email>[^>]+)>$/;

const { groups } = "Ada Lovelace <ada@ejemplo.com>".match(patron);
groups.nombre; // "Ada Lovelace"
groups.email; // "ada@ejemplo.com"
```

Resaltar el término buscado en una lista de resultados:

```js
function resaltar(texto, busqueda) {
  const patron = new RegExp(escapar(busqueda), "gi");
  return texto.replace(patron, "<mark>$&</mark>");
}
```

Acordate de escapar también el HTML del texto antes de insertarlo en la página. Resaltar no te exime de eso, y lo vamos a ver en la unidad de seguridad.

## El costo escondido: el retroceso catastrófico

Probá esto en la consola, pero guardá lo que estés haciendo:

```js
const patron = /^(a+)+$/;

patron.test("aaaaaaaaaaaaaaaaaaaaaaaaaaaaa!");
```

El navegador se congela. No es un error del patrón: la respuesta correcta es `false`, y el motor la va a dar, pero después de probar todos los caminos posibles.

La causa es la ambigüedad. El texto tiene 29 aes, y el patrón pide grupos de una o más aes, repetidos una o más veces. Hay una cantidad exponencial de formas de repartir esas aes en grupos, y como el signo de exclamación final hace fallar todas, el motor las prueba una por una antes de rendirse.

Esto tiene nombre propio en seguridad: se llama ReDoS, y es un ataque de denegación de servicio. Si tu servidor valida con un patrón así lo que escribe un usuario, alcanza con un formulario bien elegido para clavar el proceso. Y como Node atiende todo en un solo hilo, se clava para todos los usuarios a la vez.

Tres reglas para no caerte:

- desconfiá de un cuantificador adentro de un grupo que también tiene cuantificador, como `(a+)+` o `(\d*)*`
- desconfiá de alternativas que aceptan lo mismo, como `(a|aa)+`, porque generan la misma ambigüedad
- preferí prohibir un carácter a permitir cualquiera, o sea `[^>]+` en vez de `.+?`

Acá hay una diferencia con C# que conviene marcar. .NET te da un tiempo máximo por búsqueda y un modo sin retroceso, así que podés protegerte desde afuera. JavaScript no tiene nada de eso: no hay tiempo límite, ni grupos atómicos, ni cuantificadores posesivos. La única defensa es el patrón que escribiste, y validar el largo de la entrada antes de aplicarlo.

## Cuándo no usar una expresión regular

Son la herramienta equivocada más seguido de lo que parece.

No las uses para HTML ni XML. Ya vimos por qué: el anidamiento no es regular. En el navegador tenés `DOMParser`, y en el servidor hay librerías.

No las uses para CSV de verdad. Un CSV puede tener comas adentro de comillas, y comillas escapadas adentro de comillas. Cada vez que parcheés el patrón va a aparecer un caso nuevo.

No las uses cuando el lenguaje ya trae un analizador. Para una dirección web está la clase `URL`, que te da el dominio, la ruta y los parámetros ya separados y bien decodificados. Para fechas está `Date` y está `Intl`.

Y no las uses cuando una operación de cadenas alcanza. `texto.includes("hola")` se entiende de un vistazo y `/hola/.test(texto)` no agrega nada.

La regla es que una expresión regular gana cuando el patrón tiene variabilidad. Si estás buscando algo fijo, buscalo con los métodos de cadena.

## Cómo depurarlas

Tres hábitos que ahorran horas.

Construilas de a poco. Empezá con la parte más chica que puedas probar, verificá que ande, y recién ahí agregale la siguiente. Un patrón de 60 caracteres escrito de un tirón no hay forma de arreglarlo.

Usá una herramienta que las explique. En regex101.com pegás el patrón y el texto, y te muestra qué hizo cada parte y cuántos pasos le llevó. Ese contador de pasos es la mejor alarma temprana de un retroceso catastrófico.

Y escribí tests. Una expresión regular es exactamente la clase de código que parece andar hasta que llega un dato raro. Poné los casos que tienen que dar verdadero, los que tienen que dar falso, y sobre todo los del borde: el vacío, el que tiene acentos y el que es larguísimo.

JavaScript no tiene una bandera para escribir patrones en varias líneas con comentarios, como sí la tiene C#. Cuando uno se te vaya de largo, armalo por partes con nombres que se entiendan:

```js
const dia = "(?<dia>\\d{2})";
const mes = "(?<mes>\\d{2})";
const anio = "(?<anio>\\d{4})";

const fecha = new RegExp(`^${dia}/${mes}/${anio}$`);
```

## Chuleta

| Símbolo | Qué significa |
|---|---|
| `.` | cualquier carácter menos el salto de línea |
| `\d` `\w` `\s` | dígito, carácter de palabra, espacio |
| `\D` `\W` `\S` | los tres anteriores negados |
| `\p{L}` | una letra de cualquier idioma, con la bandera `u` |
| `[abc]` `[^abc]` | uno de esos, ninguno de esos |
| `[a-z]` | un rango |
| `*` `+` `?` | cero o más, una o más, cero o una |
| `{2}` `{2,}` `{2,4}` | exactamente, al menos, entre |
| `*?` `+?` | las versiones perezosas |
| `^` `$` | principio y final |
| `\b` | límite de palabra |
| `\|` | alternativa |
| `(...)` | grupo que captura |
| `(?:...)` | grupo que no captura |
| `(?<n>...)` | grupo nombrado |
| `\1` `\k<n>` | retrorreferencia |
| `(?=...)` `(?!...)` | mirada adelante, positiva y negativa |
| `(?<=...)` `(?<!...)` | mirada atrás, positiva y negativa |

## Ejercicios

1. Escribí un patrón que valide un código postal argentino con el formato de una letra, cuatro dígitos y tres letras, como `T4000ABC`. Anclalo y probalo con un valor válido, uno con menos dígitos y uno que tenga el código correcto en el medio de otro texto.
2. Extraé todos los precios de este texto y devolvé la suma: `"Camisa $1500, pantalón $2300, medias $450"`.
3. Escribí una función `nombrePropio(texto)` que ponga en mayúscula la primera letra de cada palabra usando `replace` con una función. Tiene que funcionar con `"maría de los ángeles peña"`.
4. Explicá sin ejecutar por qué `/^\d{2}-\d{8}-\d$/.test("20-12345678-9 y algo más")` devuelve `false`, y qué devolvería el mismo patrón sin el `$`.
5. Dado un texto con líneas del formato `apellido, nombre: email`, escribí un patrón con grupos nombrados y armá con `matchAll` un arreglo de objetos con las tres propiedades.
6. Mirá este patrón para validar un identificador: `/^([a-z]+[0-9]*)+$/`. Encontrá la ambigüedad, explicá por qué se cuelga con una entrada larga que termina en un guion, y reescribilo sin el problema.
7. Escribí dos patrones que hagan lo mismo, uno con cuantificador perezoso y otro con clase negada, para extraer el contenido entre comillas dobles. Probá cuál de los dos hace menos pasos en regex101.
