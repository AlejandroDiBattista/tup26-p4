# Tipos compuestos: arreglos y objetos

Programación IV: Desarrollo Web — Etapa 1, fundamentos técnicos
Apunte de la tercera clase de JavaScript

Hasta acá trabajamos con valores sueltos: un número, un texto, un booleano. Un programa real no maneja un contacto, maneja la agenda entera. Necesitamos agrupar.

Hay dos formas de agrupar datos, y la diferencia entre ellas es la pregunta que cada una responde.

Si los elementos son todos lo mismo y lo que importa es el orden, los guardás por posición. Eso es un arreglo, y la pregunta que responde es "cuál es el tercero".

Si los elementos son partes distintas de una misma cosa, los guardás por nombre. Eso es un objeto, y la pregunta que responde es "cuál es el email".

En la práctica se combinan todo el tiempo. Una agenda es un arreglo de objetos, y cada objeto puede tener adentro otro arreglo. Al final de la clase vamos a sumar dos estructuras más, `Set` y `Map`, que resuelven casos donde el arreglo y el objeto quedan cortos.

## Arreglos

### Qué es un arreglo en JavaScript

Un arreglo es una colección ordenada de valores, numerados desde cero.

Si venís de C#, hay dos diferencias que cambian la forma de trabajar. El arreglo de JavaScript no tiene tamaño fijo: crece y se achica mientras el programa corre. Y no tiene un tipo de elemento: podés mezclar lo que quieras.

```javascript
const mezcla = [1, "dos", true, null, { a: 1 }, [2, 3]];
```

Que puedas mezclar no significa que convenga. Un arreglo con elementos de un solo tipo se lee mejor, y además el motor lo ejecuta más rápido, por lo que vimos en la primera clase sobre las suposiciones que hace el compilador optimizador.

Por dentro, un arreglo es un objeto cuyas claves son números. Eso explica que `typeof [1, 2]` devuelva `"object"`, y que para distinguirlo haya un método aparte:

```javascript
Array.isArray([1, 2]); // true
Array.isArray("hola"); // false
```

### Cómo se declara

La forma normal es el literal, con corchetes:

```javascript
const vacio = [];
const numeros = [1, 2, 3];
const nombres = ["Ana", "Luis", "Sol"];
```

Hay otras formas, que sirven para casos puntuales:

```javascript
new Array(5);                  // arreglo de largo 5, con 5 huecos vacíos
new Array(5).fill(0);          // [0, 0, 0, 0, 0]
Array.of(5);                   // [5], un solo elemento
Array.from("hola");            // ["h", "o", "l", "a"]
Array.from({ length: 5 }, (_, i) => i);       // [0, 1, 2, 3, 4]
Array.from({ length: 5 }, (_, i) => i * 10);  // [0, 10, 20, 30, 40]
```

`new Array(5)` merece una advertencia. No crea cinco ceros: crea cinco huecos, que se comportan distinto de `undefined` en varios métodos. Si necesitás un arreglo iniciado, agregale siempre `.fill()`.

Notá también que declaramos con `const` y aun así vamos a agregar elementos. Es lo que vimos la clase pasada: `const` congela la referencia, no el contenido.

```javascript
const numeros = [1, 2, 3];
numeros.push(4);   // válido
numeros = [];      // TypeError
```

### Cómo se accede a los elementos

Con corchetes y el índice, que empieza en cero:

```javascript
const nombres = ["Ana", "Luis", "Sol"];

nombres[0];                  // "Ana"
nombres[2];                  // "Sol"
nombres.length;              // 3
nombres[nombres.length - 1]; // "Sol", el último
nombres.at(-1);              // "Sol", más corto
nombres.at(-2);              // "Luis"
```

`at()` acepta índices negativos y cuenta desde el final. Es más legible que la resta.

Un índice fuera de rango no lanza error: devuelve `undefined`.

```javascript
nombres[99]; // undefined
```

Esa es una diferencia grande con C#, donde tendrías una excepción. Acá el programa sigue con un `undefined` adentro, y el error aparece más adelante, en otro lugar. Es la misma lógica del tipado débil que vimos en la primera clase: JavaScript prefiere seguir antes que detenerse.

Escribir fuera de rango tampoco falla. Extiende el arreglo y deja huecos en el medio:

```javascript
const a = [1, 2, 3];
a[6] = 7;
console.log(a);        // [1, 2, 3, <3 huecos>, 7]
console.log(a.length); // 7
```

Y `length` se puede escribir, cosa poco común:

```javascript
const b = [1, 2, 3, 4, 5];
b.length = 2;
console.log(b); // [1, 2]
```

Truncar con `length` funciona, pero es poco claro para quien lee. Preferí `b.splice(2)` o directamente crear otro arreglo.

### Arreglos de arreglos y matrices

Un elemento de un arreglo puede ser cualquier valor, incluido otro arreglo. Con eso alcanza para representar una matriz.

```javascript
const matriz = [
  [1, 2, 3],
  [4, 5, 6],
  [7, 8, 9],
];

matriz[0];       // [1, 2, 3], la primera fila
matriz[1][2];    // 6, fila 1, columna 2
matriz.length;   // 3, cantidad de filas
matriz[0].length;// 3, cantidad de columnas de la primera fila
```

JavaScript no tiene matrices verdaderas como el `int[,]` de C#. Lo que tiene son arreglos de arreglos, y eso implica que las filas son independientes: nada garantiza que todas midan lo mismo.

Para crear una matriz vacía de un tamaño dado hay una trampa que cae todos los años:

```javascript
// Mal: las tres filas son el mismo arreglo
const mala = new Array(3).fill([0, 0, 0]);
mala[0][0] = 99;
console.log(mala); // [[99,0,0], [99,0,0], [99,0,0]]
```

`fill` guarda el mismo valor en las tres posiciones, y ese valor es una referencia. Las tres filas apuntan al mismo arreglo. La forma correcta crea una fila nueva por vez:

```javascript
const buena = Array.from({ length: 3 }, () => new Array(3).fill(0));
buena[0][0] = 99;
console.log(buena); // [[99,0,0], [0,0,0], [0,0,0]]
```

Guardá este ejemplo, porque es la primera aparición de un problema que va a volver varias veces hoy: copiar un contenedor no copia lo que hay adentro.

Para recorrer una matriz, dos bucles anidados:

```javascript
for (let fila = 0; fila < matriz.length; fila++) {
  for (let col = 0; col < matriz[fila].length; col++) {
    console.log(`[${fila}][${col}] = ${matriz[fila][col]}`);
  }
}
```

### Rangos y porciones

Para sacar un tramo del arreglo está `slice`. Recibe la posición inicial y la final, y la final no se incluye.

```javascript
const letras = ["a", "b", "c", "d", "e"];

letras.slice(1, 3);   // ["b", "c"]
letras.slice(2);      // ["c", "d", "e"], desde la 2 hasta el final
letras.slice(-2);     // ["d", "e"], las dos últimas
letras.slice();       // copia del arreglo completo
```

`slice` no toca el arreglo original: devuelve uno nuevo.

Su primo `splice` hace lo contrario: modifica el arreglo y devuelve lo que sacó. Sirve para eliminar e insertar en el medio.

```javascript
const dias = ["lun", "mar", "mié", "jue"];

dias.splice(1, 2);              // devuelve ["mar", "mié"]
console.log(dias);              // ["lun", "jue"], quedó modificado

dias.splice(1, 0, "mar", "mié"); // inserta sin eliminar nada
console.log(dias);               // ["lun", "mar", "mié", "jue"]
```

Los nombres se parecen y hacen cosas opuestas. Una forma de recordarlo: `slice` corta una rebanada y te la lleva, `splice` opera sobre el original.

Para buscar dentro del arreglo:

```javascript
const nombres = ["Ana", "Luis", "Sol"];

nombres.indexOf("Luis");     // 1
nombres.indexOf("Pedro");    // -1, no está
nombres.includes("Sol");     // true
nombres.lastIndexOf("Ana");  // 0, busca desde el final
```

`indexOf` compara con `===`, así que sirve para primitivos pero no para buscar objetos por contenido. Para eso están `find` y `findIndex`, que vemos enseguida.

Para unir arreglos:

```javascript
const a = [1, 2];
const b = [3, 4];

a.concat(b);   // [1, 2, 3, 4]
[...a, ...b];  // [1, 2, 3, 4], la forma moderna
[0, ...a, 5];  // [0, 1, 2, 5], podés intercalar
```

Los tres puntos son el operador de propagación. Desarma el arreglo en sus elementos sueltos. Lo vas a usar mucho hoy.

## Los tres for

Antes de seguir con las operaciones sobre arreglos, hay que ver cómo se recorren. JavaScript tiene tres bucles `for` y elegir mal es una fuente clásica de errores.

### El for tradicional

Es el de C, con contador propio:

```javascript
const nombres = ["Ana", "Luis", "Sol"];

for (let i = 0; i < nombres.length; i++) {
  console.log(i, nombres[i]);
}
```

Te da control total: podés ir de a dos, ir para atrás, empezar en el medio, saltear. Usalo cuando el índice sea parte del problema.

```javascript
for (let i = nombres.length - 1; i >= 0; i--) { /* al revés */ }
for (let i = 0; i < nombres.length; i += 2) { /* de a dos */ }
```

Declarar el contador con `let` y no con `var` importa. Con `let` cada vuelta tiene su propia copia de `i`, y eso cambia el comportamiento cuando adentro del bucle creás funciones. Es el ejercicio que quedó de la clase pasada.

### El for of

Recorre los valores, sin índice. Es el que vas a usar casi siempre:

```javascript
for (const nombre of nombres) {
  console.log(nombre);
}
```

Se lee mejor, no te podés equivocar con los límites y no hay riesgo de salirte del rango. Si necesitás el índice, pedilo con `entries()`:

```javascript
for (const [i, nombre] of nombres.entries()) {
  console.log(`${i + 1}. ${nombre}`);
}
```

Ese `[i, nombre]` es desestructuración, y la vemos en detalle más abajo.

`for...of` funciona sobre cualquier cosa iterable: arreglos, cadenas, `Set`, `Map` y los resultados de `Object.entries()`. No funciona sobre objetos comunes.

```javascript
for (const letra of "hola") {
  console.log(letra); // h, o, l, a
}
```

Admite `break` y `continue`, así que podés cortar antes de terminar.

### El for in

Recorre las claves de un objeto. Este es el que hay que usar con cuidado.

```javascript
const contacto = { nombre: "Ana", email: "ana@mail.com" };

for (const clave in contacto) {
  console.log(clave, contacto[clave]);
}
// nombre ana@mail.com... no: nombre Ana, email ana@mail.com
```

Sobre un arreglo también funciona, pero está mal usarlo ahí, por tres motivos.

Devuelve las claves como texto, no como número:

```javascript
const numeros = [10, 20, 30];

for (const i in numeros) {
  console.log(i, typeof i);   // "0" string, "1" string, "2" string
  console.log(i + 1);         // "01", "11", "21", concatena
}
```

Recorre cualquier propiedad que alguien le haya agregado al arreglo, no solo los elementos. Y salta los huecos de los arreglos incompletos.

La regla es corta: `for...in` para objetos, `for...of` para arreglos. Si te acordás de una sola cosa de esta sección, que sea esa.

### Cuál usar

| Bucle | Recorre | Usalo para |
|---|---|---|
| `for` clásico | índices que controlás vos | saltear, ir al revés, cortar por índice |
| `for...of` | valores | recorrer arreglos, cadenas, `Set` y `Map` |
| `for...in` | claves | recorrer las propiedades de un objeto |
| `.forEach()` | valores, con función | transformar cada elemento sin cortar |

`forEach` tiene una limitación que conviene saber: no acepta `break`. Si necesitás cortar antes, usá `for...of`.

```javascript
nombres.forEach((nombre, indice) => {
  console.log(indice, nombre);
});
```

## Operaciones clásicas sobre arreglos

Acá aparece la forma de trabajar propia de JavaScript. En vez de escribir un bucle y acumular a mano, describís la transformación y el lenguaje la aplica.

### map, transformar cada elemento

Devuelve un arreglo nuevo, del mismo largo, con cada elemento transformado.

```javascript
const precios = [100, 200, 300];

const conIva = precios.map((precio) => precio * 1.21);
// [121, 242, 363]

const contactos = [
  { nombre: "Ana", email: "ana@mail.com" },
  { nombre: "Luis", email: "luis@mail.com" },
];

const soloNombres = contactos.map((c) => c.nombre);
// ["Ana", "Luis"]
```

### filter, quedarse con algunos

Devuelve un arreglo nuevo, más corto o igual, con los elementos que cumplen la condición.

```javascript
const numeros = [1, 2, 3, 4, 5, 6];

numeros.filter((n) => n % 2 === 0);   // [2, 4, 6]

contactos.filter((c) => c.email.endsWith("@mail.com"));
```

### reduce, obtener un solo valor

Es el más general de los tres y el que más cuesta al principio, así que vale explicarlo desde el principio.

`reduce` recorre el arreglo llevando un acumulador. En cada vuelta le pasás el acumulador y el elemento actual, y devolvés el acumulador nuevo. Al final te queda ese acumulador.

```javascript
const precios = [100, 200, 300];

const total = precios.reduce((acumulado, precio) => acumulado + precio, 0);
// 600
```

El `0` del final es el valor inicial del acumulador. Paso a paso: empieza en 0, suma 100 y queda 100, suma 200 y queda 300, suma 300 y queda 600.

El acumulador no tiene que ser un número. Puede ser cualquier cosa, y ahí `reduce` muestra su alcance:

```javascript
// Contar apariciones
const palabras = ["a", "b", "a", "c", "a"];

const conteo = palabras.reduce((acc, palabra) => {
  acc[palabra] = (acc[palabra] ?? 0) + 1;
  return acc;
}, {});
// { a: 3, b: 1, c: 1 }

// Agrupar por una propiedad
const porCiudad = contactos.reduce((acc, c) => {
  (acc[c.ciudad] ??= []).push(c);
  return acc;
}, {});
```

Si el acumulador te queda difícil de seguir, escribí un `for...of`. Un `reduce` ilegible no es mejor que un bucle claro.

### Búsqueda y verificación

```javascript
const contactos = [
  { id: 1, nombre: "Ana", activo: true },
  { id: 2, nombre: "Luis", activo: false },
];

contactos.find((c) => c.id === 2);        // el objeto de Luis
contactos.findIndex((c) => c.id === 2);   // 1
contactos.some((c) => c.activo);          // true, hay al menos uno
contactos.every((c) => c.activo);         // false, no todos
```

`find` devuelve `undefined` si no encuentra nada, así que conviene chequear antes de usar el resultado.

### Ordenar

`sort` tiene dos particularidades que hay que conocer.

La primera es que modifica el arreglo original.

La segunda es que, sin argumentos, convierte todo a texto y ordena alfabéticamente. Con números eso da resultados equivocados:

```javascript
const numeros = [10, 9, 1, 100];

numeros.sort();           // [1, 10, 100, 9]  ← ordenó como texto
numeros.sort((a, b) => a - b);  // [1, 9, 10, 100]
numeros.sort((a, b) => b - a);  // [100, 10, 9, 1]
```

La función que le pasás recibe dos elementos y devuelve un número: negativo si el primero va antes, positivo si va después, cero si da igual.

Para texto en español, usá `localeCompare`, como vimos con las cadenas:

```javascript
contactos.sort((a, b) => a.nombre.localeCompare(b.nombre, "es"));
```

### Otras funciones habituales

```javascript
[1, 2, 3].join(" - ");        // "1 - 2 - 3"
[1, 2, 3].reverse();          // [3, 2, 1], modifica el original
[[1, 2], [3, [4]]].flat();    // [1, 2, 3, [4]], un nivel
[[1, 2], [3, [4]]].flat(2);   // [1, 2, 3, 4]
["a b", "c d"].flatMap((s) => s.split(" ")); // ["a","b","c","d"]
```

### Se encadenan

La virtud de estos métodos es que cada uno devuelve un arreglo, así que se enganchan uno detrás de otro:

```javascript
const totalActivos = contactos
  .filter((c) => c.activo)
  .map((c) => c.saldo)
  .reduce((total, saldo) => total + saldo, 0);
```

Se lee de arriba abajo como una frase: filtrar los activos, quedarse con el saldo, sumar. Comparalo con la versión con bucle y vas a ver por qué esta forma se impuso.

## Mutar o no mutar

Los métodos de arreglo se dividen en dos grupos, y confundirlos causa errores difíciles de encontrar.

| Modifican el original | Devuelven uno nuevo |
|---|---|
| `push`, `pop` | `map`, `filter`, `reduce` |
| `shift`, `unshift` | `slice`, `concat` |
| `splice` | `toSpliced` |
| `sort` | `toSorted` |
| `reverse` | `toReversed` |
| `fill` | `with` |

Los cuatro de la derecha con nombre en infinitivo (`toSorted`, `toReversed`, `toSpliced`, `with`) son recientes, de 2023. Hacen lo mismo que su par de la izquierda pero sin tocar el original.

```javascript
const original = [3, 1, 2];

const ordenadoMal = original.sort();     // modificó original
const ordenadoBien = original.toSorted(); // original queda igual
```

### Cómo se hacen las operaciones en forma inmutable

Trabajar sin modificar el original tiene ventajas concretas. Si nadie modifica un arreglo, nadie puede romperlo desde otra parte del programa. Comparar si algo cambió se reduce a comparar dos referencias. Y React, que vamos a ver más adelante, directamente depende de esto para saber cuándo redibujar la pantalla.

Estas son las cuatro operaciones básicas en las dos formas:

```javascript
const contactos = [{ id: 1, nombre: "Ana" }, { id: 2, nombre: "Luis" }];

// Agregar
contactos.push(nuevo);                       // muta
const conNuevo = [...contactos, nuevo];      // inmutable
const alPrincipio = [nuevo, ...contactos];   // inmutable

// Eliminar
contactos.splice(1, 1);                              // muta
const sinLuis = contactos.filter((c) => c.id !== 2); // inmutable

// Actualizar uno
contactos[0].nombre = "Ana María";           // muta
const actualizados = contactos.map((c) =>
  c.id === 1 ? { ...c, nombre: "Ana María" } : c
);                                            // inmutable

// Reemplazar por posición
const reemplazado = contactos.with(0, otroContacto); // inmutable
```

Fijate el patrón de la actualización: `map` recorre todo, y para el elemento que querés cambiar devolvés un objeto nuevo con las propiedades del viejo más el cambio. Para los demás devolvés el mismo objeto. Ese patrón lo vas a escribir cien veces en esta materia.

## Referencia y copia

Retomamos algo de la clase pasada, porque con arreglos se vuelve más grave.

Asignar un arreglo a otra variable no lo copia. Copia la flecha:

```javascript
const a = [1, 2, 3];
const b = a;

b.push(4);
console.log(a); // [1, 2, 3, 4], cambió también
console.log(a === b); // true, es el mismo arreglo
```

Para copiar de verdad hay tres formas equivalentes:

```javascript
const copia1 = [...a];
const copia2 = a.slice();
const copia3 = Array.from(a);

copia1.push(99);
console.log(a); // sin cambios
```

Pero atención, porque acá aparece otra vez el problema de la matriz. Estas tres formas hacen una copia superficial: copian el arreglo de afuera, no lo que hay adentro.

```javascript
const contactos = [{ nombre: "Ana" }, { nombre: "Luis" }];
const copia = [...contactos];

copia.push({ nombre: "Sol" });
console.log(contactos.length); // 2, el arreglo externo es otro

copia[0].nombre = "Ana María";
console.log(contactos[0].nombre); // "Ana María", el objeto es el mismo
```

El arreglo se duplicó. Los objetos de adentro, no: las dos listas apuntan a los mismos objetos.

Para una copia profunda, donde nada se comparta, está `structuredClone`:

```javascript
const copiaProfunda = structuredClone(contactos);
copiaProfunda[0].nombre = "Ana María";
console.log(contactos[0].nombre); // "Ana", intacto
```

Vas a ver también este truco en código viejo:

```javascript
const copia = JSON.parse(JSON.stringify(contactos));
```

Funciona, pero pierde por el camino las fechas, las funciones, los `undefined` y falla con referencias circulares. Usá `structuredClone`.

La comparación sigue la misma lógica. `===` sobre arreglos compara referencias, no contenido:

```javascript
[1, 2] === [1, 2];  // false, son dos arreglos distintos
```

Para comparar contenido tenés que recorrer, o comparar sus representaciones en texto si el caso es simple.

## Desestructuración de arreglos

Desestructurar es sacar valores de una estructura y ponerlos en variables sueltas, en una sola línea.

```javascript
const coordenadas = [10, 20, 30];

// Sin desestructurar
const x1 = coordenadas[0];
const y1 = coordenadas[1];

// Desestructurando
const [x, y, z] = coordenadas;
```

Las variables se asignan por posición, no por nombre. Podés saltear posiciones dejando el lugar vacío:

```javascript
const [, , tercero] = coordenadas; // 30
```

Podés juntar el resto en un arreglo con los tres puntos:

```javascript
const [primero, ...resto] = [1, 2, 3, 4, 5];
// primero = 1, resto = [2, 3, 4, 5]
```

Podés poner valores por defecto para cuando falte un elemento:

```javascript
const [a = 0, b = 0, c = 0] = [10, 20];
// a = 10, b = 20, c = 0
```

Funciona con estructuras anidadas, lo que sirve para matrices:

```javascript
const matriz = [[1, 2], [3, 4]];
const [[a1, a2], [b1, b2]] = matriz;
// a1=1, a2=2, b1=3, b2=4
```

Sirve para intercambiar dos variables sin una tercera:

```javascript
let x = 1;
let y = 2;
[x, y] = [y, x];
// x = 2, y = 1
```

Y aparece constantemente en los bucles y en los parámetros de funciones:

```javascript
for (const [indice, nombre] of nombres.entries()) { /* ... */ }

function distancia([x1, y1], [x2, y2]) {
  return Math.hypot(x2 - x1, y2 - y1);
}

distancia([0, 0], [3, 4]); // 5
```

## Objetos

### Qué es un objeto

Un objeto agrupa valores y les pone nombre. Cada par de nombre y valor es una propiedad.

```javascript
const contacto = {
  nombre: "Ana Pérez",
  email: "ana@mail.com",
  edad: 30,
  activo: true,
};
```

El nombre de la propiedad, o clave, siempre es texto. El valor puede ser cualquier cosa, incluidos otros objetos, arreglos y funciones.

Una aclaración para quien viene de C#: esto no es una instancia de una clase. Es un objeto suelto, creado en el momento, sin ninguna definición previa. JavaScript también tiene clases, pero la mayoría de los objetos que vas a manejar en desarrollo web nacen así, como literales o como resultado de leer un JSON.

Los objetos se anidan sin límite:

```javascript
const contacto = {
  nombre: "Ana",
  direccion: {
    calle: "Rivadavia 123",
    ciudad: "Tucumán",
  },
  telefonos: ["3814567890", "3811234567"],
};
```

### El punto y los corchetes

Hay dos formas de acceder a una propiedad.

La sintaxis de punto es la habitual:

```javascript
contacto.nombre;             // "Ana"
contacto.direccion.ciudad;   // "Tucumán"
contacto.telefonos[0];       // "3814567890"
```

La sintaxis de corchetes usa la clave como texto:

```javascript
contacto["nombre"];   // "Ana"
```

Con una clave fija son equivalentes y siempre se prefiere el punto. Pero hay tres casos en que los corchetes son obligatorios.

Cuando la clave no es un identificador válido:

```javascript
const config = {
  "api-key": "abc123",
  "max intentos": 3,
};

config["api-key"];  // única forma
config.api-key;     // error de sintaxis, lo lee como una resta
```

Cuando la clave está en una variable:

```javascript
const campo = "email";

contacto[campo];   // "ana@mail.com"
contacto.campo;    // undefined, busca una propiedad llamada "campo"
```

Y cuando la clave se calcula en el momento:

```javascript
for (const campo of ["nombre", "email"]) {
  console.log(`${campo}: ${contacto[campo]}`);
}
```

Esa diferencia entre `contacto[campo]` y `contacto.campo` es el error más común del tema. El punto toma lo que escribiste literalmente; los corchetes evalúan la expresión.

### Agregar, modificar y eliminar

Los objetos son abiertos: agregás propiedades cuando querés.

```javascript
const contacto = { nombre: "Ana" };

contacto.email = "ana@mail.com";  // agrega
contacto.nombre = "Ana María";    // modifica
delete contacto.email;            // elimina
```

Pedir una propiedad que no existe devuelve `undefined`, sin error:

```javascript
contacto.telefono; // undefined
```

Y pedir una propiedad de algo que es `undefined` sí falla:

```javascript
contacto.direccion.ciudad; // TypeError si no hay direccion
contacto.direccion?.ciudad; // undefined, sin fallar
```

Para preguntar si una propiedad existe:

```javascript
"nombre" in contacto;              // true
Object.hasOwn(contacto, "nombre"); // true, solo propiedades propias
contacto.nombre !== undefined;     // sirve, salvo que valga undefined
```

### Las formas abreviadas

Hay tres atajos de sintaxis que aparecen en todo el código moderno.

El primero es la abreviatura de propiedad. Cuando la clave y la variable se llaman igual, escribís el nombre una sola vez:

```javascript
const nombre = "Ana";
const email = "ana@mail.com";

// Forma larga
const contacto = { nombre: nombre, email: email };

// Forma abreviada
const contacto = { nombre, email };
```

Es exactamente lo mismo. Lo vas a ver a la salida de casi toda función que arme un objeto.

El segundo es la abreviatura de método. Si el valor es una función, podés omitir `function` y los dos puntos:

```javascript
// Forma larga
const agenda = {
  contactos: [],
  agregar: function (c) { this.contactos.push(c); },
};

// Forma abreviada
const agenda = {
  contactos: [],
  agregar(c) { this.contactos.push(c); },
};
```

El tercero son las claves calculadas. Con corchetes dentro del literal, la clave sale de una expresión:

```javascript
const campo = "email";
const valor = "ana@mail.com";

const objeto = { [campo]: valor };
// { email: "ana@mail.com" }

// Útil para construir objetos dinámicos
function crearFiltro(campo, valor) {
  return { [campo]: valor, [`${campo}Exacto`]: true };
}
```

Y el operador de propagación, que ya usamos con arreglos, también funciona con objetos:

```javascript
const base = { nombre: "Ana", activo: true };

const copia = { ...base };
const conEmail = { ...base, email: "ana@mail.com" };
const modificado = { ...base, nombre: "Ana María" };
```

El orden importa: lo que va después pisa lo que va antes.

```javascript
{ ...base, activo: false };  // activo queda en false
{ activo: false, ...base };  // activo vuelve a true
```

Combinando dos objetos:

```javascript
const porDefecto = { pagina: 1, orden: "nombre", limite: 10 };
const delUsuario = { limite: 50 };

const opciones = { ...porDefecto, ...delUsuario };
// { pagina: 1, orden: "nombre", limite: 50 }
```

Ese patrón de valores por defecto más valores del usuario lo vas a usar en cada función de configuración que escribas.

### Desestructuración de objetos

Igual que con arreglos, pero por nombre en vez de por posición.

```javascript
const contacto = { nombre: "Ana", email: "ana@mail.com", edad: 30 };

const { nombre, email } = contacto;
// nombre = "Ana", email = "ana@mail.com"
```

El orden no importa y podés tomar solo lo que necesitás.

Para usar otro nombre de variable, con dos puntos:

```javascript
const { nombre: nombreContacto, email: correo } = contacto;
```

Valores por defecto para lo que falte:

```javascript
const { nombre, telefono = "sin teléfono" } = contacto;
```

Se puede combinar todo:

```javascript
const { nombre: n = "Anónimo", ciudad = "Tucumán" } = contacto;
```

Anidada, para llegar a propiedades internas:

```javascript
const contacto = {
  nombre: "Ana",
  direccion: { calle: "Rivadavia 123", ciudad: "Tucumán" },
};

const { direccion: { ciudad } } = contacto;
// ciudad = "Tucumán", y direccion no queda como variable
```

Y el resto, que junta lo que no nombraste:

```javascript
const { nombre, ...otrosDatos } = contacto;
// nombre = "Ana"
// otrosDatos = { email: ..., edad: ... }
```

Ese último uso sirve para sacar una propiedad de un objeto sin modificarlo:

```javascript
const { password, ...contactoPublico } = usuario;
// contactoPublico tiene todo menos password
```

El lugar donde más se usa la desestructuración es en los parámetros de las funciones:

```javascript
// Sin desestructurar: hay que recordar el orden
function crearContacto(nombre, email, edad, activo) { /* ... */ }
crearContacto("Ana", "ana@mail.com", 30, true);

// Desestructurando: los argumentos se nombran
function crearContacto({ nombre, email, edad = 0, activo = true }) {
  return { nombre, email, edad, activo };
}

crearContacto({ email: "ana@mail.com", nombre: "Ana" });
```

La segunda versión no depende del orden, documenta qué recibe y permite valores por defecto. Es la forma habitual cuando una función tiene más de tres parámetros.

### Recorrer un objeto

Un objeto no es iterable, así que `for...of` no funciona directamente sobre él. Hay dos caminos.

El primero es `for...in`, que ya vimos:

```javascript
for (const clave in contacto) {
  console.log(clave, contacto[clave]);
}
```

El segundo, más recomendable, es convertir el objeto en un arreglo y recorrerlo con las herramientas que ya conocés:

```javascript
Object.keys(contacto);    // ["nombre", "email", "edad"]
Object.values(contacto);  // ["Ana", "ana@mail.com", 30]
Object.entries(contacto); // [["nombre","Ana"], ["email","ana@mail.com"], ...]
```

Con `entries` y desestructuración queda muy legible:

```javascript
for (const [clave, valor] of Object.entries(contacto)) {
  console.log(`${clave}: ${valor}`);
}
```

Y como son arreglos, podés encadenar métodos:

```javascript
// Quedarse con las propiedades que tienen valor
const limpio = Object.fromEntries(
  Object.entries(contacto).filter(([, valor]) => valor != null)
);
```

`Object.fromEntries` es el camino inverso: de arreglo de pares a objeto.

### Otras funciones frecuentes

```javascript
Object.assign({}, a, b);   // combina, forma anterior al spread
Object.freeze(contacto);   // impide modificarlo
JSON.stringify(contacto);  // objeto a texto
JSON.parse(texto);         // texto a objeto
```

`JSON.stringify` es la forma de mostrar un objeto legible en consola, en vez del `[object Object]` que vimos la clase pasada:

```javascript
console.log(JSON.stringify(contacto, null, 2)); // con sangría de 2
```

Y la comparación funciona como con los arreglos: `===` compara referencias.

```javascript
{ a: 1 } === { a: 1 };  // false
```

## Set

Un `Set` es una colección de valores sin repetidos y sin claves. Responde una sola pregunta: si un valor está o no está.

```javascript
const etiquetas = new Set();

etiquetas.add("cliente");
etiquetas.add("activo");
etiquetas.add("cliente");   // ignorado, ya estaba

etiquetas.size;             // 2
etiquetas.has("activo");    // true
etiquetas.delete("activo"); // true, lo eliminó
etiquetas.clear();          // vacía todo
```

Se puede crear desde un arreglo, y de ahí sale su uso más frecuente:

```javascript
const numeros = [1, 2, 2, 3, 3, 3];

const sinRepetir = [...new Set(numeros)]; // [1, 2, 3]
```

Es iterable, así que se recorre con `for...of` y mantiene el orden en que agregaste los elementos:

```javascript
for (const etiqueta of etiquetas) {
  console.log(etiqueta);
}
```

Dos detalles a tener en cuenta.

La comparación es por identidad, igual que `===`, con una excepción: `NaN` sí se considera igual a sí mismo dentro de un `Set`. Y como los objetos se comparan por referencia, dos objetos con el mismo contenido son dos elementos distintos:

```javascript
const s = new Set();
s.add({ a: 1 });
s.add({ a: 1 });
s.size; // 2
```

Comparado con un arreglo, `Set` gana cuando la pregunta es la pertenencia. Buscar en un arreglo con `includes` recorre todos los elementos; en un `Set` es prácticamente instantáneo, sin importar el tamaño.

## Map

Un `Map` guarda pares de clave y valor, como un objeto, pero con tres diferencias importantes.

```javascript
const contactosPorId = new Map();

contactosPorId.set(1, { nombre: "Ana" });
contactosPorId.set(2, { nombre: "Luis" });

contactosPorId.get(1);      // { nombre: "Ana" }
contactosPorId.has(2);      // true
contactosPorId.delete(2);   // true
contactosPorId.size;        // 1
contactosPorId.clear();
```

La primera diferencia es que la clave puede ser cualquier valor, no solo texto. Números, booleanos, objetos, funciones.

```javascript
const m = new Map();
m.set(1, "número uno");
m.set("1", "texto uno");
m.get(1);    // "número uno", son claves distintas
```

En un objeto común, `obj[1]` y `obj["1"]` son la misma propiedad, porque las claves siempre se convierten a texto.

La segunda es que `size` te da la cantidad directamente, sin tener que pedir `Object.keys().length`.

La tercera es que es iterable y conserva el orden de inserción:

```javascript
for (const [clave, valor] of contactosPorId) {
  console.log(clave, valor);
}

contactosPorId.keys();     // iterador de claves
contactosPorId.values();   // iterador de valores
contactosPorId.entries();  // iterador de pares
[...contactosPorId];       // [[1, {...}], [2, {...}]]
```

Se puede crear desde un arreglo de pares, lo que lo conecta con `Object.entries`:

```javascript
const desdeObjeto = new Map(Object.entries({ a: 1, b: 2 }));
const deVueltaAObjeto = Object.fromEntries(desdeObjeto);
```

Un uso típico es indexar una lista para poder buscar rápido:

```javascript
const contactos = [
  { id: 1, nombre: "Ana" },
  { id: 2, nombre: "Luis" },
];

const indice = new Map(contactos.map((c) => [c.id, c]));

indice.get(2); // acceso directo, sin recorrer el arreglo
```

Y contar frecuencias, la versión con `Map` del ejemplo de `reduce`:

```javascript
const conteo = new Map();

for (const palabra of palabras) {
  conteo.set(palabra, (conteo.get(palabra) ?? 0) + 1);
}
```

### Objeto o Map

| | Objeto | Map |
|---|---|---|
| Claves | texto y símbolos | cualquier valor |
| Cantidad | `Object.keys().length` | `.size` |
| Orden | números primero, después inserción | inserción siempre |
| Iterable | no, hay que convertirlo | sí |
| Se convierte a JSON | sí | no directamente |
| Altas y bajas frecuentes | más lento | más rápido |

La regla práctica: usá un objeto cuando represente una entidad con propiedades conocidas, como un contacto. Usá un `Map` cuando sea un diccionario con claves que cambian durante la ejecución.

## Cuándo usar cada estructura

| Estructura | Usala cuando |
|---|---|
| Arreglo | los elementos son del mismo tipo y el orden importa |
| Objeto | son propiedades distintas de una misma entidad |
| Set | solo te importa si un valor está, y no querés repetidos |
| Map | necesitás un diccionario con claves dinámicas o no textuales |

## Para llevarte de esta clase

- el arreglo agrupa por posición y el objeto por nombre
- un índice fuera de rango devuelve `undefined` en vez de fallar
- no hay matrices verdaderas: son arreglos de arreglos, y `fill` con un arreglo comparte la misma referencia en todas las filas
- `slice` devuelve una porción nueva, `splice` modifica el original
- `for...of` para arreglos, `for...in` para objetos, `for` clásico cuando el índice importa
- `map`, `filter` y `reduce` devuelven algo nuevo; `push`, `sort` y `reverse` modifican
- `sort` sin comparador ordena como texto
- asignar copia la referencia; `[...a]` copia el arreglo pero no los objetos de adentro; `structuredClone` copia todo
- la desestructuración toma por posición en arreglos y por nombre en objetos
- usá corchetes cuando la clave esté en una variable o se calcule
- `{ nombre }` es lo mismo que `{ nombre: nombre }`
- `Set` para valores únicos, `Map` para diccionarios con claves de cualquier tipo

## Para probar antes de la próxima clase

1. Creá una matriz de 3 por 3 llena de ceros usando `new Array(3).fill([...])` y otra usando `Array.from`. Modificá el elemento `[0][0]` en las dos y explicá la diferencia.
2. Partiendo de un arreglo de contactos, escribí en una sola cadena de métodos el listado de los emails de los contactos activos, ordenados alfabéticamente.
3. Escribí dos versiones de "agregar un contacto a la agenda": una que modifique el arreglo y otra inmutable. Verificá con `===` que la segunda devuelve un arreglo distinto.
4. Copiá un arreglo de objetos con el operador de propagación, modificá una propiedad de un objeto de la copia y comprobá qué pasó con el original. Después repetilo con `structuredClone`.
5. Escribí una función que reciba un objeto de configuración con desestructuración y valores por defecto, y devuelva la configuración completa.
6. Dado un arreglo de contactos con una propiedad `ciudad`, armá un `Map` que asocie cada ciudad con el arreglo de contactos de esa ciudad. Después resolvelo de nuevo con `reduce` y un objeto, y comparalos.
