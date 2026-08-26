# Expresiones regulares en JavaScript

Una **expresión regular** es una forma compacta de describir **patrones de texto**.

No sirve solamente para preguntar:

> “¿Este texto es exactamente igual a este otro?”

También permite preguntar cosas como:

- ¿contiene un número?
- ¿empieza con una letra?
- ¿tiene formato de código postal?
- ¿hay una palabra repetida?
- ¿quiero extraer todos los números?
- ¿quiero reemplazar ciertos fragmentos?
- ¿quiero validar una estructura simple?

La idea fundamental es:

> Una expresión regular describe un **conjunto de cadenas posibles**.

Por ejemplo, el patrón:

```regex
\d
```

no describe un texto concreto. Describe cualquiera de estos:

```text
0
1
2
3
4
5
6
7
8
9
```

## 1. El problema que intentan resolver

Supongamos que tenemos:

```js
const texto = "El alumno tiene 27 años";
```

Queremos saber si contiene un número.

Sin expresiones regulares podríamos recorrer carácter por carácter:

```js
function contieneNumero(texto) {
    for (const caracter of texto) {
        if (
            caracter >= "0" &&
            caracter <= "9"
        ) {
            return true;
        }
    }

    return false;
}
```

Funciona, pero estamos expresando un concepto relativamente simple de una manera bastante mecánica.

Con una expresión regular:

```regex
\d
```

podemos decir:

> buscá un dígito.

Entonces:

```js
const texto = "El alumno tiene 27 años";

console.log(/\d/.test(texto));
// true
```

La expresión regular describe **qué buscamos** y no tanto **cómo recorrer el texto para encontrarlo**.

## 2. Cómo se escribe una expresión regular en JavaScript

La forma más común es:

```js
/patron/
```

Por ejemplo:

```js
/ana/
```

Esto busca exactamente la secuencia:

```text
a n a
```

Ejemplo:

```js
const texto = "Me llamo Ana";

console.log(/Ana/.test(texto));
// true
```

Pero:

```js
console.log(/ana/.test(texto));
// false
```

porque por defecto las expresiones regulares distinguen mayúsculas de minúsculas.

## 3. El método `.test()`

Es la operación más sencilla para comenzar.

```js
regex.test(texto)
```

devuelve un booleano:

```js
const patron = /JavaScript/;

console.log(patron.test("Curso de JavaScript"));
// true

console.log(patron.test("Curso de Python"));
// false
```

Conceptualmente:

```text
texto
   │
   ▼
¿contiene algo que coincida con el patrón?
   │
   ├── sí → true
   └── no → false
```

## 4. Caracteres especiales

La barra invertida introduce construcciones especiales.

```text
\d   dígito
\D   no dígito
\w   carácter de palabra
\W   no carácter de palabra
\s   espacio en blanco
\S   no espacio en blanco
```

Ejemplo:

```js
console.log(/\d/.test("abc"));
// false

console.log(/\d/.test("abc7"));
// true
```

## 5. Repeticiones

Los cuantificadores indican cuántas veces puede aparecer algo.

```text
*     cero o más
+     una o más
?     cero o una
{n}   exactamente n
{n,m} entre n y m
{n,}  al menos n
```

### `+`: una o más veces

```regex
\d+
```

significa:

> uno o más dígitos consecutivos.

```js
const texto = "Tengo 27 años";

console.log(texto.match(/\d+/)[0]);
// 27
```

### `*`: cero o más veces

```regex
a*
```

puede coincidir con:

```text
""
"a"
"aa"
"aaa"
```

Por eso `*` puede coincidir incluso con una cadena vacía.

### `?`: opcional

```regex
https?
```

coincide con:

```text
http
https
```

porque la `s` es opcional.

### Cantidades exactas

```regex
\d{4}
```

significa exactamente cuatro dígitos.

```js
console.log(/\d{4}/.test("Año 2026"));
// true
```

También:

```regex
\d{2,4}
```

significa entre dos y cuatro dígitos.

## 6. Clases de caracteres

Los corchetes representan:

> uno de estos caracteres.

```regex
[abc]
```

significa:

```text
a o b o c
```

Ejemplo:

```js
console.log(/[abc]/.test("mesa"));
// true
```

porque aparece una `a`.

### Rangos

```regex
[a-z]
[A-Z]
[0-9]
```

También pueden combinarse:

```regex
[a-zA-Z0-9]
```

### Negar una clase

Dentro de `[]`, `^` al comienzo significa:

> cualquier carácter excepto estos.

```regex
[^0-9]
```

Ejemplo:

```js
console.log(/[^0-9]/.test("12345"));
// false

console.log(/[^0-9]/.test("123A5"));
// true
```

## 7. El punto `.`

El punto significa:

> casi cualquier carácter.

```regex
c.sa
```

puede coincidir con:

```text
casa
cosa
c9sa
c-sa
```

Si queremos buscar un punto literal:

```regex
\.
```

Ejemplo:

```js
console.log(/\.com/.test("ejemplo.com"));
// true
```

## 8. Metacaracteres

Algunos caracteres participan de la sintaxis de las expresiones regulares:

```text
.  *  +  ?  ^  $  (  )  [  ]  {  }  |  \
```

Para buscarlos literalmente suele ser necesario escaparlos:

```regex
\.
\+
\?
\(
\)
```

## 9. Inicio y final de cadena

```text
^   inicio
$   final
```

Por ejemplo:

```regex
^\d+$
```

significa que toda la cadena debe estar formada exclusivamente por números.

```js
console.log(/^\d+$/.test("123"));
// true

console.log(/^\d+$/.test("123abc"));
// false
```

### Buscar vs validar

```js
/\d+/.test("abc123")
// true
```

pregunta si existe un número en algún lugar.

En cambio:

```js
/^\d+$/.test("abc123")
// false
```

pregunta si toda la cadena es numérica.

## 10. Ejemplo: validar un legajo

Supongamos que un legajo tiene exactamente seis dígitos:

```regex
^\d{6}$
```

```js
function legajoValido(legajo) {
    return /^\d{6}$/.test(legajo);
}
```

```js
console.log(legajoValido("123456"));
// true

console.log(legajoValido("12345"));
// false

console.log(legajoValido("A12345"));
// false
```

## 11. Alternativas con `|`

La barra vertical significa:

> una cosa o la otra.

```regex
gato|perro
```

Ejemplo:

```js
const patron = /rojo|verde|azul/;

console.log(patron.test("verde"));
// true
```

## 12. Agrupación con paréntesis

```regex
(ab)+
```

significa repetir `ab` una o más veces.

Coincide con:

```text
ab
abab
ababab
```

En cambio:

```regex
ab+
```

significa una `a` seguida de una o más `b`.

## 13. Flags

Después del cierre `/.../` pueden colocarse opciones:

```js
/ana/i
```

La `i` ignora mayúsculas y minúsculas.

```js
console.log(/ana/i.test("ANA"));
// true
```

Flags importantes:

```text
i   ignore case
g   global
m   multiline
s   dotAll
u   Unicode
```

### El flag `g`

```js
const texto = "10 manzanas, 20 peras y 30 bananas";

console.log(texto.match(/\d+/g));
// ["10", "20", "30"]
```

## 14. Extraer información con `.match()`

```js
const texto = "Juan tiene 25 años";

const resultado = texto.match(/\d+/);

console.log(resultado[0]);
// 25
```

## 15. `.matchAll()`

```js
const texto = "Ana: 20, Juan: 30, Pedro: 40";

const resultados = texto.matchAll(/\w+:\s*\d+/g);

for (const resultado of resultados) {
    console.log(resultado[0]);
}
```

Resultado:

```text
Ana: 20
Juan: 30
Pedro: 40
```

## 16. Grupos de captura

```regex
(\d{2})/(\d{2})/(\d{4})
```

Para:

```text
15/08/2026
```

los grupos son:

```text
grupo 1 → día
grupo 2 → mes
grupo 3 → año
```

```js
const fecha = "15/08/2026";

const resultado =
    fecha.match(/(\d{2})\/(\d{2})\/(\d{4})/);

console.log(resultado[1]); // 15
console.log(resultado[2]); // 08
console.log(resultado[3]); // 2026
```

### Grupos con nombre

```regex
(?<dia>\d{2})/(?<mes>\d{2})/(?<anio>\d{4})
```

```js
const resultado = fecha.match(
    /(?<dia>\d{2})\/(?<mes>\d{2})\/(?<anio>\d{4})/
);

console.log(resultado.groups.dia);
console.log(resultado.groups.mes);
console.log(resultado.groups.anio);
```

## 17. Reemplazar texto con `.replace()`

```js
const telefono = "381-555-1234";

const limpio =
    telefono.replace(/-/g, "");

console.log(limpio);
// 3815551234
```

### Normalizar espacios

```js
const texto = "Ana     Pérez";

const limpio =
    texto.replace(/\s+/g, " ");

console.log(limpio);
// Ana Pérez
```

### Limpiar un teléfono

```js
const telefono = "+54 9 (381) 555-1234";

const limpio =
    telefono.replace(/\D/g, "");

console.log(limpio);
// 5493815551234
```

`\D` significa cualquier carácter que no sea un dígito.

## 18. Dividir texto con `.split()`

```js
const texto = "Ana,Juan;Pedro María";

const nombres =
    texto.split(/[,;\s]+/);

console.log(nombres);
```

Resultado:

```js
["Ana", "Juan", "Pedro", "María"]
```

## 19. Unicode

Una regex como:

```regex
^[A-Za-z]+$
```

no contempla adecuadamente nombres como:

```text
José
María
Ángel
Ñúñez
```

Podemos utilizar propiedades Unicode:

```js
const patron = /^\p{L}+$/u;
```

`\p{L}` significa cualquier carácter Unicode clasificado como letra.

```js
console.log(patron.test("José"));
// true

console.log(patron.test("Ñandú"));
// true
```

## 20. Grupos que no capturan

Si queremos agrupar pero no guardar el resultado:

```regex
(?:...)
```

Ejemplo:

```regex
https?://(?:www\.)?
```

`www.` queda agrupado para hacerlo opcional, pero no se captura.

## 21. Fronteras de palabra

`\b` representa una frontera de palabra.

```regex
\bpan\b
```

Ejemplo:

```js
console.log(/\bpan\b/.test("compro pan"));
// true

console.log(/\bpan\b/.test("pantalla"));
// false
```

## 22. Cuantificadores codiciosos

Los cuantificadores suelen ser **greedy**: consumen todo lo posible.

```js
const html = "<b>uno</b><b>dos</b>";

console.log(
    html.match(/<b>.*<\/b>/)[0]
);
```

Resultado:

```html
<b>uno</b><b>dos</b>
```

Porque `.*` consume todo lo posible.

### Cuantificadores no codiciosos

```regex
.*?
```

consume lo mínimo posible.

```js
console.log(
    html.match(/<b>.*?<\/b>/)[0]
);
```

Resultado:

```html
<b>uno</b>
```

## 23. Lookahead

```regex
\d+(?=€)
```

significa:

> uno o más dígitos seguidos de `€`, pero sin incluir el `€`.

En:

```text
Precio: 100€
```

encuentra:

```text
100
```

## 24. Lookbehind

```regex
(?<=\$)\d+
```

significa:

> uno o más dígitos precedidos por `$`.

En:

```text
Precio: $150
```

encuentra:

```text
150
```

## 25. Crear expresiones regulares dinámicamente

Además del literal:

```js
/ana/i
```

existe:

```js
new RegExp(...)
```

Ejemplo:

```js
const palabra = "JavaScript";

const patron =
    new RegExp(palabra, "i");

console.log(
    patron.test("javascript")
);
// true
```

### Cuidado con las barras invertidas

En un literal:

```js
/\d+/
```

En una cadena:

```js
new RegExp("\\d+")
```

porque la propia cadena de JavaScript también interpreta `\`.

## 26. Ejemplo: encontrar todos los números

```js
const texto =
    "Los valores son 12, 45 y 103";

const numeros =
    texto.match(/\d+/g);

console.log(numeros);
// ["12", "45", "103"]
```

Si queremos números reales:

```js
const numeros =
    texto.match(/\d+/g)
         .map(Number);
```

Resultado:

```js
[12, 45, 103]
```

## 27. Ejemplo: encontrar palabras

Para texto Unicode:

```js
const texto =
    "JavaScript es muy flexible";

const palabras =
    texto.match(/\p{L}+/gu);

console.log(palabras);
```

## 28. Hashtags y menciones

Hashtags:

```regex
#\w+
```

```js
const texto =
    "Curso de #JavaScript y #Web";

console.log(
    texto.match(/#\w+/g)
);
```

Menciones:

```regex
@\w+
```

```js
const texto =
    "Hola @ana, hablá con @juan";

console.log(
    texto.match(/@\w+/g)
);
```

## 29. Detectar palabras repetidas

```js
const texto =
    "Esto es muy muy importante";

const patron =
    /\b(\w+)\s+\1\b/i;

console.log(patron.test(texto));
// true
```

`\1` significa:

> lo mismo que capturó el grupo 1.

## 30. Reorganizar una fecha

De:

```text
15/08/2026
```

a:

```text
2026-08-15
```

```js
const fecha = "15/08/2026";

const resultado = fecha.replace(
    /(\d{2})\/(\d{2})\/(\d{4})/,
    "$3-$2-$1"
);

console.log(resultado);
// 2026-08-15
```

`$1`, `$2` y `$3` hacen referencia a los grupos capturados.

## 31. Validar una hora

Una regex básica:

```regex
^\d{2}:\d{2}$
```

aceptaría incluso:

```text
99:99
```

Una mejor versión:

```regex
^(?:[01]\d|2[0-3]):[0-5]\d$
```

Descomposición:

```text
^
inicio

(?:[01]\d|2[0-3])
hora entre 00 y 23

:
dos puntos

[0-5]\d
minutos entre 00 y 59

$
final
```

## 32. Ejemplo: validar un código

Formato:

```text
ABC-1234
```

Regex:

```regex
^[A-Z]{3}-\d{4}$
```

Si queremos ignorar mayúsculas y minúsculas:

```js
/^[A-Z]{3}-\d{4}$/i
```

## 33. Email: no exagerar

Una validación sencilla:

```regex
^[^\s@]+@[^\s@]+\.[^\s@]+$
```

Sirve para detectar errores evidentes, pero no conviene intentar reproducir toda la especificación formal del correo electrónico mediante una regex gigantesca.

La validación definitiva suele consistir en enviar un correo de confirmación.

## 34. No usar regex para todo

Las expresiones regulares son excelentes para:

- patrones lexicales;
- extraer fragmentos;
- validar estructuras simples;
- reemplazar texto;
- tokenizar formatos sencillos.

No son ideales para estructuras complejas y anidadas, como HTML completo.

Si el problema consiste principalmente en reconocer secuencias de caracteres, regex puede ser excelente.

Si hay una estructura compleja y jerárquica, probablemente necesitemos un parser.

## 35. Pensar una regex como un pequeño lenguaje

Una expresión regular tiene:

### Átomos

```regex
a
\d
[abc]
.
```

### Repetición

```regex
*
+
?
{n}
```

### Composición

```regex
abc
```

significa:

```text
a seguido de b seguido de c
```

### Alternativa

```regex
a|b
```

### Agrupación

```regex
(...)
```

### Posición

```regex
^
$
\b
```

Con unas pocas piezas podemos construir patrones muy ricos.

## 36. De primeros principios: una regex describe posibilidades

Consideremos:

```regex
[AB]\d{2}
```

Podemos interpretarla como:

```text
primer carácter:
    A o B

segundo:
    dígito

tercero:
    dígito
```

Describe:

```text
A00
A01
...
A99

B00
B01
...
B99
```

Una regex es una descripción compacta de un conjunto potencialmente enorme de cadenas.

## 37. Relación con autómatas

Existe una conexión profunda con la teoría de computación.

Una expresión regular representa un **lenguaje regular**.

Por ejemplo:

```regex
ab*
```

describe:

```text
a
ab
abb
abbb
abbbb
...
```

Podemos imaginar una máquina que lee caracteres uno por uno:

```text
inicio
  │
  │ a
  ▼
estado 1
  │
  │ b
  └──────┐
         │
         ▼
      estado 1
```

El nombre “expresión regular” proviene justamente de la teoría de lenguajes regulares.

## 38. Ejemplo integrador

Supongamos líneas como:

```text
Ana Perez;123456;3815551234
Juan Gomez;654321;3814449876
```

Queremos reconocer:

```text
nombre ; legajo ; teléfono
```

Podemos usar:

```regex
^(.+);(\d{6});(\d+)$
```

```js
const linea =
    "Ana Perez;123456;3815551234";

const patron =
    /^(.+);(\d{6});(\d+)$/;

const resultado =
    linea.match(patron);

console.log(resultado[1]);
// Ana Perez

console.log(resultado[2]);
// 123456

console.log(resultado[3]);
// 3815551234
```

Una versión más clara usa grupos con nombre:

```js
const patron =
    /^(?<nombre>.+);(?<legajo>\d{6});(?<telefono>\d+)$/;

const resultado =
    linea.match(patron);

console.log(resultado.groups);
```

Resultado aproximado:

```js
{
    nombre: "Ana Perez",
    legajo: "123456",
    telefono: "3815551234"
}
```

La regex no solamente valida: también **extrae estructura de un texto plano**.

# Tabla de referencia rápida

| Expresión | Significado |
|---|---|
| `abc` | secuencia literal `abc` |
| `.` | cualquier carácter |
| `\d` | dígito |
| `\D` | no dígito |
| `\w` | carácter de palabra |
| `\W` | no carácter de palabra |
| `\s` | espacio |
| `\S` | no espacio |
| `[abc]` | `a`, `b` o `c` |
| `[a-z]` | letra de `a` a `z` |
| `[^abc]` | cualquier carácter salvo `a`, `b`, `c` |
| `*` | cero o más |
| `+` | uno o más |
| `?` | cero o uno |
| `{3}` | exactamente tres |
| `{2,5}` | entre dos y cinco |
| `^` | comienzo |
| `$` | final |
| `\b` | frontera de palabra |
| `a\|b` | `a` o `b` |
| `(abc)` | grupo y captura |
| `(?:abc)` | grupo sin captura |
| `\1` | contenido del primer grupo |
| `(?=...)` | lookahead |
| `(?<=...)` | lookbehind |

# Operaciones principales en JavaScript

## Comprobar

```js
/patron/.test(texto)
```

## Encontrar

```js
texto.match(/patron/)
```

## Encontrar todos

```js
texto.match(/patron/g)
```

o:

```js
texto.matchAll(/patron/g)
```

## Reemplazar

```js
texto.replace(/patron/g, reemplazo)
```

## Separar

```js
texto.split(/patron/)
```

# Idea final

Las expresiones regulares parecen crípticas solamente cuando se intenta leerlas como una cadena de símbolos.

La forma correcta de pensarlas es:

> **una regex es un pequeño lenguaje para describir secuencias de caracteres.**

Con unas pocas ideas:

```text
qué carácter quiero
+
cuántas veces
+
en qué orden
+
entre qué alternativas
+
en qué posición
```

podemos construir la mayoría de las expresiones regulares útiles.

Por ejemplo:

```regex
^[A-Z]{3}-\d{4}$
```

se puede leer como:

```text
inicio
+
3 letras
+
guion
+
4 números
+
final
```

La mejor manera de aprenderlas es **construirlas de izquierda a derecha y traducir cada fragmento a una regla sencilla**.
