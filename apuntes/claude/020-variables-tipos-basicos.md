# Variables y tipos básicos en JavaScript

Programación IV: Desarrollo Web — Etapa 1, fundamentos técnicos
Apunte de la segunda clase de JavaScript

La clase pasada vimos de dónde viene JavaScript y por qué es un lenguaje dinámico y débilmente tipado. Hoy bajamos a la práctica. Vamos a ver cómo se guarda un dato, qué tipos de datos existen y qué podés hacer con cada uno.

El orden es a propósito. Primero el recipiente, después el contenido, al final las reglas que JavaScript aplica cuando mezclás contenidos distintos. Esa última parte es la que más problemas causa en producción, y recién tiene sentido cuando ya conocés los tipos uno por uno.

## Qué es una variable

Un programa trabaja con datos que están en la memoria. La memoria son direcciones numéricas, y nadie quiere escribir código pensando en direcciones. Una variable es un nombre que le ponés a un valor para poder referirte a él.

En un lenguaje estático como C#, ese nombre viene con un tipo pegado. `int edad` significa que ahí adentro va a haber un entero y nada más.

En JavaScript no. El nombre no tiene tipo: el tipo lo tiene el valor guardado. La variable es solo una etiqueta que podés mover de un valor a otro.

```javascript
let dato = 42;        // ahora apunta a un número
dato = "cuarenta";    // ahora apunta a un texto
dato = true;          // ahora apunta a un booleano
```

Conviene pensarlo así: la variable no es una caja con un valor adentro, es una flecha que apunta a un valor. Esa imagen se vuelve importante cuando lleguemos a `const`.

## Las tres formas de declarar

JavaScript tiene tres palabras para declarar variables. Existen las tres por razones históricas, y solo dos se usan hoy.

### var, la forma vieja

`var` es la declaración original de 1995. Tiene dos comportamientos que hoy se consideran errores de diseño.

El primero es su alcance: `var` no respeta los bloques, solo las funciones.

```javascript
function ejemplo() {
  if (true) {
    var mensaje = "hola";
  }
  console.log(mensaje); // "hola", la variable sobrevivió al bloque
}
```

El segundo es la elevación, o hoisting. Antes de ejecutar una función, el motor recorre el código y registra todas las declaraciones `var` que encuentra, en cualquier nivel de anidamiento. Las crea al principio con el valor `undefined`. Recién cuando la ejecución llega a la línea original se asigna el valor real.

```javascript
console.log(nombre); // undefined, no falla
var nombre = "Ana";
console.log(nombre); // "Ana"
```

Ese `undefined` silencioso escondió errores durante veinte años. Además `var` permite redeclarar la misma variable sin protestar, así que dos programadores podían pisarse el nombre y no enterarse.

En esta materia no vamos a usar `var`. Lo aprendés para poder leer código viejo, nada más.

### let, la variable que cambia

`let` llegó en ES6 y corrige las dos cosas.

Respeta el bloque. Una variable declarada entre llaves existe solo entre esas llaves.

```javascript
function ejemplo() {
  if (true) {
    let mensaje = "hola";
    console.log(mensaje); // "hola"
  }
  console.log(mensaje); // ReferenceError: mensaje is not defined
}
```

Y no permite usarla antes de declararla. La declaración también se registra al entrar al bloque, pero la variable queda en un estado inaccesible hasta la línea donde la declarás. Ese tramo se llama zona muerta temporal.

```javascript
console.log(nombre); // ReferenceError: no se puede acceder antes de la declaración
let nombre = "Ana";
```

Fallar es mejor que devolver `undefined`. Un error te detiene en la línea del problema; un `undefined` te aparece tres funciones más adelante.

Tampoco podés redeclararla en el mismo alcance:

```javascript
let x = 1;
let x = 2; // SyntaxError
```

### const, la referencia que no se mueve

`const` se comporta igual que `let` en cuanto a alcance y zona muerta, con dos diferencias: tenés que asignarle un valor al declararla y no podés reasignarla después.

```javascript
const PI = 3.14159;
PI = 3; // TypeError: Assignment to constant variable
```

Acá viene el punto que más confunde, y donde sirve la imagen de la flecha. `const` congela la flecha, no lo que hay del otro lado. Si el valor es un objeto o un arreglo, el contenido se puede modificar sin problema.

```javascript
const contacto = { nombre: "Ana" };

contacto.nombre = "Luis";      // válido, modificás el objeto
contacto.email = "l@mail.com"; // válido, agregás una propiedad
contacto = {};                 // TypeError, movés la flecha
```

`const` no significa inmutable. Significa que ese nombre va a apuntar siempre al mismo valor. Si querés inmutabilidad real hay otras herramientas, y las vamos a ver más adelante.

### Cuál usar

La regla de la materia es simple y es la que se usa en la industria:

- declará todo con `const`
- cambiá a `let` solo cuando necesites reasignar
- no uses `var`

No es una manía estilística. Cuando leés `const`, sabés de una que ese nombre no va a cambiar en las próximas cincuenta líneas, y eso es una cosa menos que rastrear.

### Un resumen de las tres

| | var | let | const |
|---|---|---|---|
| Alcance | función | bloque | bloque |
| Antes de declararla | `undefined` | error | error |
| Redeclarar | sí | no | no |
| Reasignar | sí | sí | no |
| Inicialización obligatoria | no | no | sí |

## Alcance y vida de una variable

Ya nombramos el alcance varias veces. Vale la pena ordenarlo, porque es un concepto que vas a usar todos los días.

El alcance de una variable es la región del código donde ese nombre se puede usar. En JavaScript hay tres niveles.

El alcance global es el más externo. Una variable declarada fuera de toda función y de todo bloque se ve desde cualquier parte. Usalo lo menos posible: todo lo global es un nombre que cualquiera puede pisar.

El alcance de función abarca el cuerpo entero de una función, incluidos sus bloques internos. Es el que respeta `var`.

El alcance de bloque es cualquier par de llaves: un `if`, un `for`, un `while` o llaves sueltas. Es el que respetan `let` y `const`.

Los alcances se anidan, y desde adentro se ve hacia afuera pero no al revés:

```javascript
const nivel1 = "global";

function externa() {
  const nivel2 = "función";

  if (true) {
    const nivel3 = "bloque";
    console.log(nivel1, nivel2, nivel3); // ve los tres
  }

  console.log(nivel3); // ReferenceError
}
```

Cuando el motor encuentra un nombre, lo busca en el bloque actual. Si no está, sube al alcance que lo contiene, y así hasta el global. Si no lo encuentra en ningún lado, lanza un `ReferenceError`. Esa búsqueda se llama cadena de alcances.

Si un nombre se repite en dos niveles, gana el más cercano. El de afuera queda tapado, y eso se llama sombreado:

```javascript
const usuario = "Ana";

function saludar() {
  const usuario = "Luis"; // sombrea al de afuera
  console.log(usuario);   // "Luis"
}

saludar();
console.log(usuario);     // "Ana"
```

La vida de una variable es cuánto tiempo ocupa memoria. En general nace cuando la ejecución entra a su alcance y muere cuando sale. No la liberás vos: JavaScript tiene recolección de basura, y el motor libera todo valor al que ya no llegue ninguna referencia.

Hay una excepción que vale anticipar. Si una función interna sigue usando una variable de la función externa, esa variable no se libera aunque la externa haya terminado:

```javascript
function crearContador() {
  let cuenta = 0;
  return () => ++cuenta;
}

const contar = crearContador();
contar(); // 1
contar(); // 2, cuenta sigue viva
```

Eso es una clausura, y le vamos a dedicar una clase entera. Por ahora quedate con que el alcance manda más que el momento de la ejecución.

## Cómo se nombran las variables

### Las reglas del lenguaje

Un nombre válido en JavaScript:

- empieza con una letra, un guion bajo o un signo pesos
- puede seguir con letras, dígitos, guiones bajos o signos pesos
- no puede empezar con un dígito
- no puede ser una palabra reservada del lenguaje, como `let`, `class`, `return` o `function`
- distingue mayúsculas de minúsculas, así que `total` y `Total` son dos variables distintas

El lenguaje acepta caracteres Unicode, o sea que `precioTotalAño` compila. No lo hagas igual: el código se lee y se comparte en inglés técnico, y los acentos traen problemas de codificación en herramientas viejas.

### Las convenciones

Las reglas dicen qué acepta el motor. Las convenciones dicen qué espera leer otra persona, y en un equipo eso pesa más.

| Convención | Se usa para | Ejemplo |
|---|---|---|
| camelCase | variables y funciones | `precioTotal`, `calcularIva` |
| PascalCase | clases y componentes | `Contacto`, `ListaDeContactos` |
| MAYUSCULA_CON_GUIONES | constantes de configuración | `IVA_GENERAL`, `URL_BASE` |

Ojo con esto si venís de C#: allá los métodos y las propiedades públicas van en PascalCase. En JavaScript son camelCase. Escribir `CalcularTotal()` en JavaScript es tan llamativo como escribir `calcularTotal()` en C#.

Más allá del formato, hay costumbres sobre el contenido del nombre:

- las variables son sustantivos: `contacto`, `total`, `usuarioActual`
- las funciones empiezan con verbo: `calcularTotal`, `buscarContacto`, `enviarMail`
- los booleanos se leen como una afirmación: `esValido`, `tieneStock`, `estaActivo`
- las colecciones van en plural: `contactos`, `precios`
- las constantes de configuración en mayúsculas se reservan para valores fijos del programa, no para todo lo declarado con `const`

Y una regla general: el largo del nombre debería crecer con el alcance. Una `i` dentro de un `for` de tres líneas está bien. Una `d` que vive en todo un módulo, no.

```javascript
// Difícil de leer
const d = new Date();
const x = p * 0.21;

// Se explica solo
const fechaEmision = new Date();
const iva = precio * ALICUOTA_IVA;
```

## Los tipos de dato

JavaScript tiene ocho tipos. Siete son primitivos y uno es el objeto.

| Tipo | Para qué sirve | Ejemplo |
|---|---|---|
| `number` | todos los números | `42`, `3.14` |
| `string` | texto | `"hola"` |
| `boolean` | verdadero o falso | `true` |
| `undefined` | una variable sin valor asignado | `undefined` |
| `null` | la ausencia deliberada de valor | `null` |
| `bigint` | enteros más grandes que los que soporta `number` | `9007199254740993n` |
| `symbol` | identificadores únicos, uso avanzado | `Symbol("id")` |
| `object` | todo lo demás: objetos, arreglos, funciones, fechas | `{ a: 1 }`, `[1, 2]` |

Para saber qué tipo tiene un valor está el operador `typeof`:

```javascript
typeof 42;          // "number"
typeof "hola";      // "string"
typeof true;        // "boolean"
typeof undefined;   // "undefined"
typeof 10n;         // "bigint"
typeof Symbol();    // "symbol"
typeof { a: 1 };    // "object"
typeof [1, 2];      // "object"
typeof function(){};// "function"
typeof null;        // "object"  ← el error de 1995
```

Dos filas de esa tabla merecen aclaración. `typeof` de un arreglo devuelve `"object"` porque un arreglo es un objeto; para distinguirlos está `Array.isArray()`. Y `typeof null` devuelve `"object"` por aquel error de la primera implementación que ya no se puede corregir.

### undefined y null no son lo mismo

Los dos representan ausencia, pero con intenciones distintas.

`undefined` es la ausencia por omisión. Lo pone el lenguaje: una variable declarada y no asignada, una propiedad que no existe, un parámetro que no se pasó, una función que no devuelve nada.

`null` es la ausencia deliberada. Lo ponés vos para decir "acá no hay valor y es a propósito".

```javascript
let sinAsignar;
console.log(sinAsignar); // undefined, no lo decidió nadie

let contactoSeleccionado = null; // decidiste que todavía no hay ninguno
```

En una base de datos y en una API, la diferencia importa: `null` viaja como un valor y `undefined` directamente no aparece en el JSON.

### Primitivos y objetos se copian distinto

Este punto genera errores desde el primer día, así que va ahora.

Un valor primitivo se copia por valor. Cada variable tiene su propia copia y son independientes.

```javascript
let a = 10;
let b = a;
b = 20;
console.log(a); // 10
```

Un objeto se copia por referencia. Las dos variables apuntan al mismo objeto en memoria.

```javascript
const original = { nombre: "Ana" };
const copia = original;
copia.nombre = "Luis";
console.log(original.nombre); // "Luis"
```

Es la misma imagen de la flecha. Al asignar copiás la flecha, no lo que hay al final.

Además, los primitivos son inmutables. No podés modificar el número 5 ni la cadena `"hola"`: solo podés crear otro valor y apuntar la variable ahí.

## Booleanos

### Para qué sirven y cómo se escriben

El booleano es el tipo de las decisiones. Tiene dos valores literales y ninguno más:

```javascript
const activo = true;
const eliminado = false;
```

Es el resultado de toda comparación, y lo que evalúan `if`, `while` y el operador ternario.

### Los operadores de comparación

| Operador | Significado |
|---|---|
| `===` | igual en valor y tipo |
| `!==` | distinto en valor o tipo |
| `==` | igual después de convertir |
| `!=` | distinto después de convertir |
| `<` `>` `<=` `>=` | orden |

La regla de la materia ya la dijimos y la repetimos porque es la que más se olvida: usá siempre `===`. `==` convierte antes de comparar y produce resultados que nadie espera. Volvemos sobre eso en la última sección.

### Truthy y falsy

Acá está la primera idea propia de JavaScript.

Cuando ponés un valor donde se espera un booleano, el lenguaje no protesta: lo convierte. Y esa conversión sigue una lista corta y cerrada.

Estos ocho valores se convierten en `false`, y se los llama falsy:

```javascript
false
0
-0
0n
""        // cadena vacía
null
undefined
NaN
```

Todo lo demás se convierte en `true`. Todo, sin excepciones. Incluidas estas tres, que sorprenden a todo el mundo:

```javascript
Boolean("0");     // true, es una cadena con un carácter
Boolean("false"); // true, ídem
Boolean([]);      // true, un arreglo vacío es un objeto
Boolean({});      // true, un objeto vacío también
```

La regla de fondo es esa: cualquier objeto es truthy, esté vacío o no. Si querés saber si un arreglo tiene elementos, preguntá por `.length`, no por el arreglo.

```javascript
if (contactos.length > 0) { /* ... */ }  // correcto
if (contactos) { /* ... */ }             // siempre entra
```

Para convertir a booleano de forma explícita tenés `Boolean(valor)` o el doble negación `!!valor`. Las dos hacen lo mismo; `Boolean()` se lee mejor.

### Los operadores lógicos y el cortocircuito

JavaScript tiene tres operadores lógicos: `&&`, `||` y `!`.

Los dos primeros tienen una particularidad. En la mayoría de los lenguajes devuelven un booleano. En JavaScript devuelven uno de los dos operandos, sin convertirlo.

El `&&` evalúa el izquierdo. Si es falsy, lo devuelve y ni mira el derecho. Si es truthy, devuelve el derecho.

```javascript
true && "hola";   // "hola"
false && "hola";  // false
0 && "hola";      // 0
"a" && "b";       // "b"
```

El `||` hace lo inverso. Si el izquierdo es truthy, lo devuelve y corta. Si no, devuelve el derecho.

```javascript
"Ana" || "Anónimo";  // "Ana"
"" || "Anónimo";     // "Anónimo"
null || "Anónimo";   // "Anónimo"
```

Que corte antes de evaluar el segundo operando se llama cortocircuito, y tiene dos usos muy comunes.

El primero es proteger un acceso que podría fallar:

```javascript
// Si contacto es null, nunca se evalúa contacto.email
if (contacto && contacto.email) {
  enviarMail(contacto.email);
}
```

El segundo es dar un valor por defecto:

```javascript
const nombre = nombreIngresado || "Anónimo";
```

Ese segundo uso tiene una trampa. `||` reemplaza cualquier valor falsy, no solo la ausencia:

```javascript
const cantidad = cantidadIngresada || 1;
// Si el usuario ingresó 0, cantidad queda en 1
```

Para eso está `??`, el operador de coalescencia nula. Solo reemplaza cuando el izquierdo es `null` o `undefined`:

```javascript
const cantidad = cantidadIngresada ?? 1;
// Si el usuario ingresó 0, cantidad queda en 0
```

La regla práctica: si querés cubrir la ausencia de un dato, usá `??`. Usá `||` solo cuando de verdad quieras tratar el `0` y la cadena vacía como si no hubiera dato.

Un pariente cercano es el encadenamiento opcional, `?.`, que corta la expresión si lo de la izquierda es `null` o `undefined`:

```javascript
contacto?.direccion?.ciudad;
// undefined si falta contacto o falta direccion, en vez de fallar
```

Y el ternario, que es la única forma de escribir un `if` que devuelve un valor:

```javascript
const etiqueta = esActivo ? "Activo" : "Inactivo";
```

## Números

### Un solo tipo numérico

En C# elegís entre `int`, `long`, `float`, `decimal` y varios más. En JavaScript hay un solo tipo `number`, y siempre es un número de punto flotante de 64 bits del estándar IEEE 754.

No existe el entero como tipo aparte. `42` y `42.0` son exactamente el mismo valor.

Eso simplifica mucho y trae dos consecuencias que hay que conocer.

La primera es la precisión decimal:

```javascript
0.1 + 0.2;          // 0.30000000000000004
0.1 + 0.2 === 0.3;  // false
```

No es un error de JavaScript. Es cómo funciona el punto flotante binario, y pasa igual con `double` en C# o en Java. Algunos decimales no tienen representación exacta en binario, del mismo modo que un tercio no la tiene en decimal.

Para comparar decimales, comparás la diferencia contra una tolerancia:

```javascript
Math.abs(0.1 + 0.2 - 0.3) < Number.EPSILON; // true
```

Y para plata, no uses punto flotante. La solución habitual es trabajar en centavos con enteros, o usar una biblioteca decimal. Lo vamos a aplicar cuando el CRM maneje importes.

La segunda consecuencia es el rango seguro de los enteros. Un `number` representa exactamente los enteros hasta 2 elevado a 53 menos uno, o sea 9.007.199.254.740.991. Más allá de eso empieza a perder precisión:

```javascript
Number.MAX_SAFE_INTEGER;      // 9007199254740991
9007199254740992 === 9007199254740993; // true, y no debería
```

Para enteros más grandes existe `bigint`, que se escribe con una `n` al final. No se mezcla con `number` en una misma operación.

```javascript
const grande = 9007199254740993n;
grande + 1n;  // 9007199254740994n
grande + 1;   // TypeError
```

### Las formas de escribir un número

```javascript
const decimal     = 255;
const conDecimales= 3.14;
const hexadecimal = 0xff;        // 255
const octal       = 0o377;       // 255
const binario     = 0b11111111;  // 255
const exponencial = 1.5e6;       // 1500000
const muyChico    = 2e-3;        // 0.002
const legible     = 1_000_000;   // 1000000, el guion bajo lo ignora el motor
```

Los separadores de miles con guion bajo son solo para el ojo humano. El valor es el mismo.

### Los tres valores especiales

```javascript
Infinity;   // más grande que cualquier número
-Infinity;
NaN;        // "not a number", el resultado de una operación imposible
```

`Infinity` aparece al dividir por cero, que en JavaScript no lanza excepción:

```javascript
1 / 0;   // Infinity
-1 / 0;  // -Infinity
0 / 0;   // NaN
```

`NaN` tiene una propiedad única en todo el lenguaje: no es igual a sí mismo.

```javascript
NaN === NaN; // false
```

Por eso no lo podés detectar comparando. Se detecta con `Number.isNaN()`:

```javascript
Number.isNaN(NaN);      // true
Number.isNaN("hola");   // false, no es NaN, es una cadena
isNaN("hola");          // true, convierte antes de preguntar
```

Existen las dos funciones. La global `isNaN()` convierte el argumento antes de evaluarlo y por eso da respuestas engañosas. Usá siempre `Number.isNaN()`.

### Operadores aritméticos

| Operador | Operación | Ejemplo |
|---|---|---|
| `+` | suma | `5 + 3` es `8` |
| `-` | resta | `5 - 3` es `2` |
| `*` | multiplicación | `5 * 3` es `15` |
| `/` | división | `5 / 2` es `2.5` |
| `%` | resto | `5 % 2` es `1` |
| `**` | potencia | `5 ** 2` es `25` |

Atención con la división: siempre es real. No existe la división entera del `int` de C#.

```javascript
5 / 2;              // 2.5, no 2
Math.trunc(5 / 2);  // 2, si querés el entero
```

El `%` devuelve el resto y conserva el signo del dividendo, que no es lo mismo que el módulo matemático:

```javascript
7 % 3;   // 1
-7 % 3;  // -1
```

Están también los operadores unarios y los de incremento:

```javascript
const positivo = +"42";  // convierte a número: 42
const negativo = -x;

let n = 5;
n++;   // devuelve 5 y después incrementa
++n;   // incrementa y después devuelve 7
```

La diferencia entre `n++` y `++n` solo importa si usás el resultado en la misma expresión. Si no, escribí el que se lea mejor.

Y los operadores de asignación compuesta, que son abreviaturas:

```javascript
total += 100;  // total = total + 100
total -= 50;
total *= 2;
total /= 4;
total %= 3;
total **= 2;
```

### Precedencia de operadores

Cuando una expresión combina varios operadores, el orden de evaluación no es de izquierda a derecha: cada operador tiene una precedencia.

```javascript
2 + 3 * 4;    // 14, no 20
(2 + 3) * 4;  // 20
```

Esta es la tabla, de mayor a menor precedencia, con lo que vas a usar en esta materia:

| Nivel | Operadores |
|---|---|
| 1 | `()` agrupación |
| 2 | `.` `[]` `()` acceso y llamada |
| 3 | `++` `--` sufijos |
| 4 | `!` `~` `+` `-` unarios, `typeof`, `++` `--` prefijos |
| 5 | `**` |
| 6 | `*` `/` `%` |
| 7 | `+` `-` |
| 8 | `<<` `>>` `>>>` |
| 9 | `<` `>` `<=` `>=` |
| 10 | `==` `!=` `===` `!==` |
| 11 | `&` |
| 12 | `^` |
| 13 | `\|` |
| 14 | `&&` |
| 15 | `\|\|` y `??` |
| 16 | `? :` ternario |
| 17 | `=` `+=` `-=` y demás asignaciones |

Tres cosas que conviene retener de esa tabla.

La primera: los operadores de bits tienen menos precedencia que las comparaciones. Eso rompe la intuición de casi todo el mundo.

```javascript
a & b === c;    // se evalúa como  a & (b === c)
(a & b) === c;  // casi siempre es lo que querías
```

La segunda: `**` se asocia hacia la derecha, al revés de los demás. Y el lenguaje directamente prohíbe combinarlo con un menos unario sin paréntesis, para que no haya ambigüedad.

```javascript
2 ** 3 ** 2;    // 512, se evalúa 2 ** (3 ** 2)
-2 ** 2;        // SyntaxError
(-2) ** 2;      // 4
```

La tercera: `??` no se puede mezclar con `&&` ni con `||` sin paréntesis, por la misma razón.

```javascript
a || b ?? c;     // SyntaxError
(a || b) ?? c;   // válido
```

La regla práctica es esta: sabé la precedencia para leer código ajeno, y escribí paréntesis para que nadie tenga que saberla al leer el tuyo.

### Operadores de bits

Estos operadores trabajan con la representación binaria del número.

| Operador | Operación |
|---|---|
| `&` | y |
| `\|` | o |
| `^` | o exclusivo |
| `~` | negación |
| `<<` | desplazamiento a la izquierda |
| `>>` | desplazamiento a la derecha con signo |
| `>>>` | desplazamiento a la derecha sin signo |

Acá hay una particularidad importante. Los números de JavaScript son de 64 bits con punto flotante, pero estos operadores no trabajan así. Antes de operar, el motor convierte el valor a un entero con signo de 32 bits, opera, y devuelve otro número de 64 bits.

Dos consecuencias. Los decimales se truncan, y los valores que no entran en 32 bits se desbordan:

```javascript
5.9 | 0;          // 5, trunca
2 ** 31 | 0;      // -2147483648, se desborda
```

Vas a ver `| 0` usado como truncamiento rápido en código viejo. Es frágil por lo anterior; usá `Math.trunc()`.

El uso legítimo de estos operadores son las banderas y las máscaras. Cuando tenés muchas opciones de sí o no, podés guardarlas en un solo número:

```javascript
const LECTURA   = 0b001; // 1
const ESCRITURA = 0b010; // 2
const BORRADO   = 0b100; // 4

let permisos = LECTURA | ESCRITURA;   // 0b011, tiene las dos

permisos & ESCRITURA;                 // 2, distinto de 0: la tiene
Boolean(permisos & BORRADO);          // false: no la tiene

permisos |= BORRADO;                  // agregar permiso
permisos &= ~ESCRITURA;               // quitar permiso
permisos ^= LECTURA;                  // alternar permiso
```

El otro uso frecuente son los colores, donde cada componente ocupa 8 bits dentro de un mismo número:

```javascript
const color = 0xff8800;
const rojo  = (color >> 16) & 0xff;  // 255
const verde = (color >> 8) & 0xff;   // 136
const azul  = color & 0xff;          // 0
```

En desarrollo web no vas a usar bits todos los días. Pero aparecen en permisos, en manejo de imágenes y en protocolos binarios, así que conviene reconocerlos.

### La librería estándar de números

Las funciones matemáticas están en dos lugares: el objeto `Math` y el objeto `Number`.

`Math` agrupa las operaciones:

```javascript
Math.round(2.5);    // 3, redondea al entero más cercano
Math.round(-2.5);   // -2, el medio siempre va hacia arriba
Math.floor(2.9);    // 2, hacia abajo
Math.ceil(2.1);     // 3, hacia arriba
Math.trunc(-2.9);   // -2, corta la parte decimal
Math.abs(-5);       // 5
Math.min(3, 1, 2);  // 1
Math.max(3, 1, 2);  // 3
Math.pow(2, 10);    // 1024, equivale a 2 ** 10
Math.sqrt(16);      // 4
Math.random();      // decimal entre 0 y 1, sin llegar al 1
Math.PI;            // 3.141592653589793
```

Un número entero al azar entre dos valores, que es el ejercicio clásico:

```javascript
function entero(min, max) {
  return Math.floor(Math.random() * (max - min + 1)) + min;
}
```

`Number` agrupa las verificaciones y las constantes:

```javascript
Number.isInteger(5.0);      // true
Number.isFinite(1 / 0);     // false
Number.isNaN(NaN);          // true
Number.parseFloat("3.14");  // 3.14
Number.parseInt("42px");    // 42
Number.MAX_SAFE_INTEGER;    // 9007199254740991
Number.EPSILON;             // la menor diferencia representable
```

Y los propios números tienen métodos para mostrarse:

```javascript
const precio = 1234.5678;

precio.toFixed(2);          // "1234.57", devuelve texto
precio.toString(2);         // en binario
(255).toString(16);         // "ff"

precio.toLocaleString("es-AR", {
  style: "currency",
  currency: "ARS",
});                         // "$ 1.234,57"
```

Fijate que `toFixed` devuelve una cadena, no un número. Es un error frecuente seguir operando con el resultado.

## Cadenas

### Para qué sirven y cómo se escriben

Una cadena es texto. Internamente JavaScript la guarda como una secuencia de unidades de 16 bits, en el formato UTF-16.

Hay tres formas de escribirla, y las tres producen el mismo tipo:

```javascript
const simples = 'Hola';
const dobles  = "Hola";
const invertidas = `Hola`;
```

Las comillas simples y dobles son intercambiables. Elegí una y mantenela en todo el proyecto; la mayoría de las herramientas de formato usan comillas dobles. La ventaja de tener dos es poder incluir una dentro de la otra sin escapar:

```javascript
const cita = "Ella dijo 'basta'";
const otra = 'El archivo se llama "datos.csv"';
```

Cuando no hay más remedio, se escapan los caracteres con la barra invertida:

```javascript
"Ella dijo \"basta\"";
"Primera línea\nSegunda línea";  // \n es un salto de línea
"Columna1\tColumna2";            // \t es una tabulación
"C:\\Users\\Ana";                // \\ es una barra invertida
"\u00e1";                        // "á" por su código Unicode
```

### Las comillas invertidas

Las comillas invertidas, o plantillas de texto, llegaron en ES6 y resuelven dos problemas viejos.

El primero es la interpolación. Podés meter cualquier expresión dentro de `${}` y su resultado se convierte a texto:

```javascript
const nombre = "Ana";
const edad = 30;

// Antes
const viejo = "Hola " + nombre + ", tenés " + edad + " años";

// Ahora
const nuevo = `Hola ${nombre}, tenés ${edad} años`;
```

Adentro de `${}` va una expresión completa, no solo un nombre:

```javascript
`Total: ${precio * cantidad}`;
`El año que viene tenés ${edad + 1}`;
`Estado: ${activo ? "Activo" : "Inactivo"}`;
`Nombre: ${contacto?.nombre ?? "sin datos"}`;
```

El segundo problema es el texto de varias líneas. Con comillas normales tenías que concatenar y meter `\n` a mano. Con invertidas, el salto de línea que escribís es el salto que sale:

```javascript
const html = `
  <div class="contacto">
    <h2>${contacto.nombre}</h2>
    <p>${contacto.email}</p>
  </div>
`;
```

Ese uso lo vas a repetir mucho cuando generemos HTML desde JavaScript. Cuidado con una cosa: la indentación que escribís forma parte de la cadena.

### Las cadenas son inmutables

No podés modificar una cadena. Todos los métodos que parecen modificarla en realidad devuelven una nueva:

```javascript
let saludo = "hola";
saludo[0] = "H";           // no hace nada, no falla
console.log(saludo);       // "hola"

saludo = saludo.toUpperCase(); // acá sí, porque reasignás
console.log(saludo);       // "HOLA"
```

### Operadores sobre cadenas

El `+` concatena, y el `+=` acumula:

```javascript
const nombreCompleto = "Ana" + " " + "Pérez";

let lista = "";
lista += "primero, ";
lista += "segundo";
```

Los operadores de orden comparan carácter por carácter según el código UTF-16, no según el alfabeto:

```javascript
"a" < "b";        // true
"Z" < "a";        // true, las mayúsculas van antes en la tabla
"ñ" < "z";        // false, los acentuados van después
"10" < "9";       // true, compara "1" contra "9"
```

Para ordenar texto en español, usá `localeCompare`, que conoce las reglas del idioma:

```javascript
["ñandú", "zorro", "ámbar"].sort((a, b) => a.localeCompare(b, "es"));
// ["ámbar", "ñandú", "zorro"]
```

### La librería estándar de cadenas

| Método | Qué hace | Ejemplo |
|---|---|---|
| `.length` | cantidad de caracteres | `"hola".length` es `4` |
| `.at(i)` | carácter en la posición, acepta negativos | `"hola".at(-1)` es `"a"` |
| `.toUpperCase()` | a mayúsculas | `"HOLA"` |
| `.toLowerCase()` | a minúsculas | `"hola"` |
| `.trim()` | saca espacios de los extremos | `"  a  ".trim()` es `"a"` |
| `.includes(t)` | si contiene el texto | `true` o `false` |
| `.startsWith(t)` | si empieza con el texto | `true` o `false` |
| `.endsWith(t)` | si termina con el texto | `true` o `false` |
| `.indexOf(t)` | posición, o `-1` si no está | `"hola".indexOf("l")` es `2` |
| `.slice(a, b)` | porción, acepta negativos | `"hola".slice(1, 3)` es `"ol"` |
| `.split(sep)` | corta en un arreglo | `"a,b".split(",")` es `["a","b"]` |
| `.replace(a, b)` | reemplaza la primera aparición | |
| `.replaceAll(a, b)` | reemplaza todas | |
| `.repeat(n)` | repite la cadena | `"ab".repeat(2)` es `"abab"` |
| `.padStart(n, c)` | rellena al principio | `"5".padStart(3, "0")` es `"005"` |
| `.padEnd(n, c)` | rellena al final | |

Un caso de uso que vamos a ver la clase que viene, leyendo un CSV:

```javascript
const linea = " Ana Pérez , ana@mail.com , 3814567890 ";

const campos = linea
  .split(",")
  .map((campo) => campo.trim());

// ["Ana Pérez", "ana@mail.com", "3814567890"]
```

Y una advertencia sobre `.length`. Cuenta unidades de 16 bits, no caracteres percibidos. Con texto latino común no vas a notar diferencia, pero con emojis sí:

```javascript
"hola".length;  // 4
"😀".length;    // 2
```

## Conversión de tipos

Llegamos a la parte que explica la mitad de los errores raros de JavaScript. Hay dos formas de convertir: la que pedís vos y la que hace el lenguaje solo.

### Conversión explícita

Es la que controlás. Se hace con funciones y es la que deberías preferir siempre.

A número:

```javascript
Number("42");      // 42
Number("3.14");    // 3.14
Number("");        // 0     ← ojo con este
Number("  ");      // 0     ← y con este
Number("42px");    // NaN
Number(true);      // 1
Number(false);     // 0
Number(null);      // 0     ← ojo
Number(undefined); // NaN
Number([]);        // 0
Number([5]);       // 5
Number([1, 2]);    // NaN
Number({});        // NaN
```

`parseInt` y `parseFloat` son distintos de `Number`. Leen desde el principio hasta donde entienden y descartan el resto:

```javascript
parseInt("42px");     // 42
Number("42px");       // NaN

parseInt("3.9");      // 3, corta en el punto
parseFloat("3.9kg");  // 3.9

parseInt("");         // NaN
Number("");           // 0

parseInt("ff", 16);   // 255, el segundo argumento es la base
```

Usá `Number()` cuando el texto tiene que ser un número completo, y `parseInt()` cuando esperás un número seguido de otra cosa, como `"20px"`.

A texto:

```javascript
String(42);          // "42"
String(true);        // "true"
String(null);        // "null"
String(undefined);   // "undefined"
String([1, 2]);      // "1,2"
String({});          // "[object Object]"

(42).toString();     // "42"
`${42}`;             // "42"
```

Fijate que un objeto se convierte en `"[object Object]"`. Cuando veas eso en pantalla, ya sabés qué pasó: intentaste mostrar un objeto como texto. Para eso está `JSON.stringify()`.

A booleano, con la lista de falsy que ya vimos:

```javascript
Boolean("hola");  // true
Boolean("");      // false
Boolean(0);       // false
!!"hola";         // true
```

### Conversión automática

Es la que hace el motor cuando encuentra tipos que no coinciden. Como JavaScript es débilmente tipado, casi nunca falla: convierte y sigue.

La lógica no es azarosa. El motor mira qué operación estás haciendo y decide a qué tipo convertir.

Con el operador `+` la regla es especial, porque sirve para dos cosas. Si alguno de los dos operandos es una cadena, convierte el otro a cadena y concatena. Si no, convierte los dos a número y suma.

```javascript
"5" + 3;      // "53"   una cadena presente: concatena
"5" + true;   // "5true"
1 + 2 + "3";  // "33"   se evalúa de izquierda a derecha: (1+2) + "3"
"1" + 2 + 3;  // "123"  acá la cadena está primero
```

Con el resto de los operadores aritméticos no hay ambigüedad, así que todo va a número:

```javascript
"5" - 3;    // 2
"5" * "2";  // 10
"10" / "2"; // 5
true + 1;   // 2
null + 1;   // 1
undefined + 1; // NaN
```

Con los operadores de orden, si los dos operandos son cadenas compara texto; si no, convierte a número:

```javascript
"10" < "9";   // true, compara como texto
"10" < 9;     // false, convierte a número
```

En un contexto booleano, o sea dentro de un `if`, un `while`, un `!`, un `&&` o un `||`, se aplica la lista de falsy.

Y dentro de `${}` de una plantilla, todo se convierte a texto.

### El caso de la igualdad débil

El operador `==` tiene sus propias reglas, y son las más enredadas del lenguaje.

Si los tipos coinciden, se comporta como `===`. Si no, convierte según esta tabla:

- `null == undefined` es `true`, y ninguno de los dos es igual a nada más
- número contra cadena: la cadena se convierte a número
- booleano contra cualquier cosa: el booleano se convierte a número
- objeto contra primitivo: el objeto se convierte a primitivo

De ahí salen resultados como estos:

```javascript
1 == "1";        // true
0 == false;      // true
0 == "";         // true
"" == false;     // true
null == 0;       // false, null solo se compara con undefined
null == undefined; // true
[] == false;     // true,  [] → "" → 0, y false → 0
[1] == 1;        // true
```

Y una contradicción aparente que vale la pena entender, porque muestra que son dos algoritmos distintos:

```javascript
null == 0;   // false, por la regla especial de ==
null >= 0;   // true,  los relacionales convierten: Number(null) es 0
```

No hay que memorizar esta tabla. Hay que sacar de acá una sola conclusión: `==` no es confiable, y `===` no tiene ninguna de estas reglas. Usá `===` siempre.

### Las reglas que te llevás

- convertí explícitamente cuando cruces un límite: lo que viene de un formulario, de un archivo o de una API siempre llega como texto
- usá `===` y `!==`
- usá `??` para valores por defecto, no `||`
- desconfiá del `+` cuando alguno de los operandos podría ser texto
- si un cálculo te da `NaN`, buscá hacia atrás cuál fue el primer valor que no era número
- si en pantalla aparece `[object Object]`, convertiste un objeto a texto sin querer

Un caso completo, del tipo que vas a encontrar en la práctica:

```javascript
// Lo que devuelve un formulario HTML siempre es texto
const cantidad = document.querySelector("#cantidad").value; // "3"
const precio = document.querySelector("#precio").value;     // "100"

const totalMal = cantidad * precio;  // 300, funciona de casualidad
const totalPeor = cantidad + precio; // "3100", concatena

// Lo correcto
const totalBien = Number(cantidad) * Number(precio); // 300
```

## Para llevarte de esta clase

- una variable es un nombre que apunta a un valor; el tipo lo tiene el valor, no el nombre
- usá `const` por defecto, `let` cuando necesites reasignar, nunca `var`
- `const` congela la referencia, no el contenido del objeto
- `let` y `const` respetan el bloque y fallan si las usás antes de declararlas
- los primitivos se copian por valor y los objetos por referencia
- hay ocho falsy: `false`, `0`, `-0`, `0n`, `""`, `null`, `undefined` y `NaN`; todo lo demás es truthy, incluidos `[]` y `{}`
- `&&` y `||` devuelven un operando, no un booleano, y cortan la evaluación
- `??` cubre solo `null` y `undefined`; `||` cubre todos los falsy
- hay un solo tipo numérico, de punto flotante: no lo uses para plata
- los operadores de bits trabajan sobre 32 bits con signo, no sobre los 64 del número
- las comillas invertidas te dan interpolación y texto de varias líneas
- las cadenas son inmutables: sus métodos devuelven una cadena nueva
- convertí explícitamente y usá `===`

## Para probar antes de la próxima clase

1. Declará una constante con un objeto que tenga dos propiedades. Modificá una propiedad y después intentá reasignar la constante. Explicá por qué una operación funciona y la otra no.
2. Escribí un `for` con `var` que guarde tres funciones en un arreglo, cada una imprimiendo el índice. Ejecutalas y observá qué imprimen. Repetí el ejercicio con `let` y explicá la diferencia con lo que sabés de alcance.
3. Evaluá `[] == false`, `[] == 0` y `Boolean([])`. Los tres resultados juntos parecen contradictorios; resolvé la contradicción siguiendo la regla que aplica cada operador.
4. Escribí una función que reciba un precio y devuelva el texto formateado como pesos argentinos con dos decimales.
5. Tomá la cadena `"  ana perez ; ANA@MAIL.COM ; 381-456-7890  "` y sacá de ahí un objeto con las propiedades `nombre`, `email` y `telefono`, con el nombre en mayúscula inicial, el email en minúsculas y el teléfono sin guiones.
6. Calculá `0.1 + 0.2 === 0.3` y después escribí una función `sonIguales(a, b)` que compare dos decimales de forma confiable.
