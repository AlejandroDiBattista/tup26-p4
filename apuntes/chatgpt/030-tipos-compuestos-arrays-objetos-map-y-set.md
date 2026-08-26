# Programación IV — Tipos compuestos en JavaScript

## Arrays, objetos, `Map`, `Set`, referencias y recorridos

Los tipos primitivos permiten representar valores individuales: un número, una cadena, un booleano o una ausencia. Sin embargo, una aplicación rara vez trabaja con datos aislados. Un curso tiene alumnos, un carrito contiene productos y cada producto reúne un nombre, un precio y una categoría.

Para modelar esas relaciones necesitamos **tipos compuestos**: valores capaces de organizar otros valores. En JavaScript, los arrays y los objetos son las estructuras fundamentales. `Map` y `Set` agregan colecciones especializadas para asociaciones clave–valor y conjuntos sin repetidos.

Estas estructuras comparten una característica decisiva: son objetos y se manejan mediante **referencias**. Comprender esa idea permite explicar por qué dos variables pueden modificar la misma colección, por qué una copia con `...` solamente copia un nivel y por qué las actualizaciones inmutables construyen valores nuevos.

Al finalizar este apunte deberíamos poder:

- declarar arrays, acceder a sus elementos y extraer rangos;
- representar tablas mediante arrays de arrays y matrices;
- elegir entre `for`, `for...of`, `for...in` y los métodos de arrays;
- buscar, transformar, filtrar, ordenar y reducir colecciones;
- distinguir métodos mutables de operaciones inmutables;
- explicar identidad, asignación por referencia, copia superficial y copia profunda;
- desestructurar arrays y objetos;
- crear objetos mediante sintaxis literal y acceder a sus propiedades;
- utilizar propiedades abreviadas, métodos abreviados y claves calculadas;
- recorrer las propiedades propias de un objeto;
- utilizar `Map` para asociaciones dinámicas y `Set` para valores únicos.

---

## 1. De un dato individual a una estructura

Supongamos que queremos conservar las notas de un alumno. Con variables individuales podríamos escribir:

```js
const nota1 = 8;
const nota2 = 6;
const nota3 = 9;
```

Esta representación funciona para tres notas conocidas de antemano, pero no expresa que forman una colección. Tampoco permite recorrerlas de manera general.

Un array reúne los valores bajo una misma estructura:

```js
const notas = [8, 6, 9];
```

Ahora supongamos que queremos representar a un alumno. Un nombre, un legajo y una regularidad no son elementos equivalentes ni se identifican naturalmente por una posición. Un objeto permite nombrar cada parte:

```js
const alumno = {
  nombre: "Ana Pérez",
  legajo: 12345,
  regular: true,
  notas: [8, 6, 9],
};
```

Las dos estructuras resuelven problemas diferentes:

- un **array** representa una secuencia ordenada de elementos;
- un **objeto** representa una entidad mediante propiedades con nombre.

Aunque en JavaScript los arrays son técnicamente objetos especializados, conviene elegir la estructura según el significado del dato y no según lo que la sintaxis permite hacer.

---

## 2. Arrays: secuencias ordenadas

Un array es una colección ordenada cuyos elementos se asocian con índices enteros que comienzan en cero.

```js
const lenguajes = ["JavaScript", "TypeScript", "C#"];
```

La relación entre posiciones e índices es:

```text
posición humana:      primera       segunda       tercera
índice:                  0             1             2
valor:              "JavaScript"  "TypeScript"     "C#"
```

Que el primer índice sea cero no es una decisión estética. El índice expresa el desplazamiento desde el comienzo de la colección: el primer elemento se encuentra a cero posiciones del inicio.

### Declaración mediante un literal

La forma habitual de crear un array es el literal delimitado por corchetes:

```js
const vacio = [];
const edades = [19, 22, 21];
const materias = ["Programación IV", "Base de Datos II"];
```

JavaScript permite mezclar tipos:

```js
const mezcla = [42, "hola", true, null];
```

Sin embargo, una colección suele ser más fácil de procesar cuando sus elementos cumplen el mismo contrato conceptual. Un array de notas debería contener notas; un array de alumnos debería contener objetos alumno.

### Otras formas de creación

`Array.of()` construye un array con los argumentos recibidos:

```js
Array.of(3);       // [3]
Array.of(1, 2, 3); // [1, 2, 3]
```

`Array.from()` crea un array a partir de un iterable o de un valor similar a un array:

```js
Array.from("TUP"); // ["T", "U", "P"]

Array.from({ length: 5 }, (_, indice) => indice);
// [0, 1, 2, 3, 4]
```

El constructor `new Array()` existe, pero posee un caso que suele confundir:

```js
new Array(3);    // array con longitud 3 y tres posiciones vacías
Array.of(3);     // [3]
```

Por claridad, se prefieren `[]`, `Array.of()` y `Array.from()` según la intención.

### `length`: cantidad de posiciones

La propiedad `length` indica la longitud:

```js
const notas = [8, 6, 9];

console.log(notas.length); // 3
```

En un array normal y denso, los índices válidos van desde `0` hasta `length - 1`.

---

## 3. Acceso y modificación por índice

Los corchetes permiten leer una posición:

```js
const materias = ["Programación IV", "Base de Datos II", "Inglés II"];

console.log(materias[0]); // "Programación IV"
console.log(materias[1]); // "Base de Datos II"
```

También permiten modificarla:

```js
const estados = ["pendiente", "pendiente", "pendiente"];

estados[1] = "aprobado";

console.log(estados);
// ["pendiente", "aprobado", "pendiente"]
```

Si el índice no existe, la lectura devuelve `undefined`:

```js
const notas = [8, 6, 9];

console.log(notas[10]); // undefined
```

Asignar muy lejos del final crea posiciones vacías, llamadas *holes*:

```js
const valores = [10, 20];
valores[5] = 60;

console.log(valores.length); // 6
// [10, 20, <3 empty items>, 60]
```

Los arrays dispersos tienen comportamientos particulares al recorrerlos. En código de aplicación conviene evitarlos y agregar elementos mediante operaciones explícitas.

### Índices calculados

El índice puede ser cualquier expresión que produzca la posición deseada:

```js
const notas = [8, 6, 9];
const indice = 2;

console.log(notas[indice]);     // 9
console.log(notas[indice - 1]); // 6
```

### Acceso desde el final con `at()`

La sintaxis de corchetes no interpreta índices negativos como posiciones desde el final:

```js
const notas = [8, 6, 9];

notas[-1]; // undefined
```

El método `at()` sí admite índices negativos:

```js
notas.at(0);  // 8
notas.at(-1); // 9
notas.at(-2); // 6
```

La forma tradicional de obtener el último elemento es:

```js
notas[notas.length - 1]; // 9
```

---

## 4. Rangos de elementos

JavaScript no posee una sintaxis especial como `array[inicio:fin]`. El método habitual para extraer un rango es `slice()`.

```js
const letras = ["a", "b", "c", "d", "e"];

const centro = letras.slice(1, 4);

console.log(centro); // ["b", "c", "d"]
console.log(letras); // el original no cambia
```

El índice inicial se incluye y el final se excluye. Esta convención permite calcular la cantidad mediante `fin - inicio`.

```text
slice(1, 4)
      ↑  ↑
   incluye  excluye
```

Variantes frecuentes:

```js
const datos = [10, 20, 30, 40, 50];

datos.slice(2);      // [30, 40, 50]
datos.slice(0, 3);   // [10, 20, 30]
datos.slice(-2);     // [40, 50]
datos.slice(1, -1);  // [20, 30, 40]
datos.slice();       // copia superficial completa
```

No debe confundirse `slice()` con `splice()`:

- `slice(inicio, fin)` extrae una copia y no modifica el original;
- `splice(inicio, cantidad, ...elementos)` elimina o inserta modificando el array original;
- `toSpliced()` ofrece una versión moderna que devuelve un array nuevo.

```js
const original = ["a", "b", "c", "d"];

const nuevo = original.toSpliced(1, 2, "x", "y");

console.log(nuevo);    // ["a", "x", "y", "d"]
console.log(original); // ["a", "b", "c", "d"]
```

---

## 5. Arrays de arrays y matrices

Un elemento de un array puede ser otro array:

```js
const cursos = [
  ["Ana", "Luis", "Marta"],
  ["Pedro", "Julia"],
];
```

El primer índice selecciona el array exterior y el segundo selecciona un elemento interior:

```js
console.log(cursos[0]);    // ["Ana", "Luis", "Marta"]
console.log(cursos[0][1]); // "Luis"
console.log(cursos[1][0]); // "Pedro"
```

### Matrices

Una matriz puede representarse como un array de filas:

```js
const matriz = [
  [1, 2, 3],
  [4, 5, 6],
  [7, 8, 9],
];
```

Se accede mediante `matriz[fila][columna]`:

```js
matriz[0][0]; // 1
matriz[1][2]; // 6
matriz[2][1]; // 8
```

JavaScript no exige que todas las filas tengan la misma longitud. Una matriz rectangular es una convención que el programa debe mantener:

```js
const irregular = [
  [1, 2],
  [3, 4, 5],
];
```

### Crear una matriz sin compartir filas

Esta forma parece crear tres filas independientes, pero no lo hace:

```js
const incorrecta = Array(3).fill(Array(3).fill(0));

incorrecta[0][0] = 9;

console.log(incorrecta);
// [[9, 0, 0], [9, 0, 0], [9, 0, 0]]
```

`fill()` colocó en cada posición una referencia al mismo array interior.

La forma correcta crea una fila nueva para cada posición:

```js
const matriz = Array.from(
  { length: 3 },
  () => Array(3).fill(0)
);

matriz[0][0] = 9;

console.log(matriz);
// [[9, 0, 0], [0, 0, 0], [0, 0, 0]]
```

La función se ejecuta tres veces y construye tres arrays diferentes.

### Recorrer una matriz

Cuando necesitamos índices de fila y columna, un `for` anidado resulta claro:

```js
const matriz = [
  [1, 2, 3],
  [4, 5, 6],
];

for (let fila = 0; fila < matriz.length; fila += 1) {
  for (let columna = 0; columna < matriz[fila].length; columna += 1) {
    console.log(`matriz[${fila}][${columna}] = ${matriz[fila][columna]}`);
  }
}
```

Si solo importan los valores, puede utilizarse `for...of`:

```js
for (const fila of matriz) {
  for (const valor of fila) {
    console.log(valor);
  }
}
```

Una transformación inmutable también puede anidar `map()`:

```js
const duplicada = matriz.map((fila) =>
  fila.map((valor) => valor * 2)
);

// [[2, 4, 6], [8, 10, 12]]
```

---

## 6. Tres formas fundamentales de recorrer

### 6.1 `for` tradicional

El `for` tradicional reúne inicialización, condición y actualización:

```js
const notas = [8, 6, 9];

for (let indice = 0; indice < notas.length; indice += 1) {
  console.log(indice, notas[indice]);
}
```

Es apropiado cuando necesitamos:

- el índice numérico;
- avanzar con un paso diferente de uno;
- recorrer hacia atrás;
- comparar con elementos vecinos;
- controlar con precisión el comienzo y el final.

```js
for (let indice = notas.length - 1; indice >= 0; indice -= 1) {
  console.log(notas[indice]);
}
```

`break` termina el bucle y `continue` salta a la siguiente iteración:

```js
for (let indice = 0; indice < notas.length; indice += 1) {
  if (notas[indice] < 6) {
    continue;
  }

  console.log(`Nota aprobada: ${notas[indice]}`);

  if (notas[indice] === 10) {
    break;
  }
}
```

### 6.2 `for...of`: recorrer valores

`for...of` obtiene los valores producidos por un objeto iterable. Arrays, cadenas, `Map` y `Set` son iterables.

```js
const notas = [8, 6, 9];

for (const nota of notas) {
  console.log(nota);
}
```

Cuando no necesitamos controlar el índice, suele ser la opción imperativa más legible.

Si necesitamos índice y valor, podemos recorrer `entries()` y desestructurar cada par:

```js
for (const [indice, nota] of notas.entries()) {
  console.log(`La nota ${indice + 1} es ${nota}`);
}
```

### 6.3 `for...in`: recorrer nombres de propiedades

`for...in` recorre claves de propiedades enumerables expresadas como cadenas. No recorre directamente los valores.

```js
const alumno = {
  nombre: "Ana",
  legajo: 12345,
  regular: true,
};

for (const propiedad in alumno) {
  console.log(propiedad, alumno[propiedad]);
}
```

Además de propiedades propias, puede recorrer propiedades enumerables heredadas. Para limitarlo a las propiedades del objeto:

```js
for (const propiedad in alumno) {
  if (Object.hasOwn(alumno, propiedad)) {
    console.log(propiedad, alumno[propiedad]);
  }
}
```

No se recomienda `for...in` para arrays:

```js
const notas = [8, 6, 9];

for (const clave in notas) {
  console.log(typeof clave); // "string"
}
```

Puede incluir propiedades adicionales y entrega índices como cadenas. Para arrays se utilizan `for`, `for...of` o métodos como `forEach()`.

### Comparación rápida

| Construcción | Recorre | Uso típico |
|---|---|---|
| `for` | posiciones controladas por el programa | índices, pasos, recorrido inverso |
| `for...of` | valores de un iterable | arrays, `Map`, `Set`, cadenas |
| `for...in` | nombres de propiedades enumerables | inspección de objetos, con cuidado por la herencia |

---

## 7. Operaciones frecuentes sobre arrays

Los métodos de arrays permiten expresar la intención de una operación: agregar, buscar, transformar, seleccionar o resumir.

### Agregar y quitar elementos

Estos métodos modifican el array original:

```js
const nombres = ["Ana", "Luis"];

nombres.push("Marta");     // agrega al final
nombres.pop();              // quita y devuelve el último
nombres.unshift("Pedro");  // agrega al comienzo
nombres.shift();            // quita y devuelve el primero
```

`push()` y `unshift()` devuelven la nueva longitud. `pop()` y `shift()` devuelven el elemento quitado o `undefined` si el array estaba vacío.

`splice()` permite quitar, insertar o reemplazar en cualquier posición, pero también muta:

```js
const letras = ["a", "b", "d"];

letras.splice(2, 0, "c");

console.log(letras); // ["a", "b", "c", "d"]
```

### Buscar y comprobar

```js
const notas = [8, 6, 9, 6];

notas.includes(9);                 // true
notas.indexOf(6);                  // 1
notas.lastIndexOf(6);              // 3
notas.find((nota) => nota < 7);    // 6
notas.findIndex((nota) => nota < 7); // 1
notas.some((nota) => nota === 10); // false
notas.every((nota) => nota >= 6);  // true
```

Las intenciones son diferentes:

- `includes(valor)` pregunta si aparece ese valor;
- `indexOf(valor)` devuelve su primera posición o `-1`;
- `find(predicado)` devuelve el primer elemento que cumple una condición;
- `findIndex(predicado)` devuelve su índice;
- `some(predicado)` pregunta si al menos uno cumple;
- `every(predicado)` pregunta si todos cumplen.

`find()`, `some()` y `every()` pueden terminar antes de recorrer toda la colección cuando ya conocen el resultado.

### Transformar con `map()`

`map()` aplica una función a cada elemento y produce un array nuevo con la misma cantidad de posiciones:

```js
const precios = [1000, 2500, 800];

const preciosConIva = precios.map((precio) => precio * 1.21);

console.log(preciosConIva); // [1210, 3025, 968]
console.log(precios);       // [1000, 2500, 800]
```

La función recibe valor, índice y array:

```js
const etiquetas = precios.map(
  (precio, indice) => `Producto ${indice + 1}: $${precio}`
);
```

Se utiliza `map()` cuando cada elemento de entrada produce un elemento de salida.

### Seleccionar con `filter()`

`filter()` conserva únicamente los elementos para los cuales el predicado devuelve un valor truthy:

```js
const notas = [8, 4, 6, 9, 3];

const aprobadas = notas.filter((nota) => nota >= 6);

console.log(aprobadas); // [8, 6, 9]
console.log(notas);     // no cambia
```

El resultado puede tener desde cero hasta la misma cantidad de elementos que el original.

### Acumular con `reduce()`

`reduce()` combina todos los elementos para obtener un único resultado:

```js
const precios = [1000, 2500, 800];

const total = precios.reduce(
  (acumulado, precio) => acumulado + precio,
  0
);

console.log(total); // 4300
```

Los argumentos importantes son:

```text
reduce(función reductora, valor inicial)
```

En cada paso, la función recibe el acumulador y el elemento actual. Es recomendable proporcionar siempre un valor inicial: hace explícito el tipo del resultado y define qué ocurre con un array vacío.

`reduce()` no es solamente para sumar. Puede construir objetos, mapas o agrupaciones, aunque debe utilizarse cuando esa reducción siga siendo legible.

### Ejecutar efectos con `forEach()`

`forEach()` ejecuta una función por cada elemento y devuelve `undefined`:

```js
const alumnos = ["Ana", "Luis", "Marta"];

alumnos.forEach((alumno, indice) => {
  console.log(`${indice + 1}. ${alumno}`);
});
```

Es apropiado para efectos como mostrar, registrar o enviar información. Si queremos construir un array, `map()` o `filter()` comunican mejor la intención.

Un `return` dentro del callback no termina el `forEach()` completo. Cuando se necesita `break`, suele convenir un `for...of`.

### Aplanar y combinar

```js
const grupos = [["Ana", "Luis"], ["Marta", "Pedro"]];

grupos.flat(); // ["Ana", "Luis", "Marta", "Pedro"]
```

`flat(profundidad)` reduce niveles de anidamiento:

```js
[1, [2, [3]]].flat(1); // [1, 2, [3]]
[1, [2, [3]]].flat(2); // [1, 2, 3]
```

`flatMap()` equivale conceptualmente a transformar y luego aplanar un nivel:

```js
const frases = ["hola mundo", "programación web"];

const palabras = frases.flatMap((frase) => frase.split(" "));
// ["hola", "mundo", "programación", "web"]
```

`concat()` une arrays sin modificar los originales:

```js
const frontend = ["HTML", "CSS"];
const programacion = frontend.concat(["JavaScript"]);

// ["HTML", "CSS", "JavaScript"]
```

La sintaxis de expansión ofrece otra forma:

```js
const programacion = [...frontend, "JavaScript"];
```

### Ordenar e invertir

`sort()` modifica el array y, sin comparador, ordena como cadenas:

```js
const numeros = [10, 2, 1];

numeros.sort();
console.log(numeros); // [1, 10, 2]
```

Para números se proporciona un comparador:

```js
numeros.sort((a, b) => a - b); // ascendente
numeros.sort((a, b) => b - a); // descendente
```

`toSorted()` devuelve una copia ordenada y conserva el original:

```js
const originales = [10, 2, 1];
const ordenados = originales.toSorted((a, b) => a - b);

console.log(ordenados);  // [1, 2, 10]
console.log(originales); // [10, 2, 1]
```

De manera similar:

- `reverse()` muta y `toReversed()` copia;
- `splice()` muta y `toSpliced()` copia;
- asignar `array[indice]` muta y `with(indice, valor)` copia.

```js
const notas = [8, 6, 9];
const corregidas = notas.with(1, 7);

console.log(corregidas); // [8, 7, 9]
console.log(notas);      // [8, 6, 9]
```

---

## 8. Mutación e inmutabilidad

Una operación **mutable** cambia la estructura existente. Una operación **inmutable** conserva la anterior y produce una nueva.

```js
const original = [1, 2, 3];

original.push(4); // mutación
```

```js
const original = [1, 2, 3];
const nuevo = [...original, 4]; // actualización inmutable
```

Ningún enfoque es universalmente correcto. La mutación local puede ser simple y eficiente. La inmutabilidad resulta valiosa cuando:

- necesitamos conservar estados anteriores;
- varias partes del programa comparten una estructura;
- una interfaz detecta cambios comparando referencias;
- queremos que una función no produzca efectos sobre sus argumentos;
- buscamos facilitar razonamiento, pruebas y depuración.

### Tabla práctica

| Intención | Muta | Devuelve una estructura nueva |
|---|---|---|
| agregar al final | `push()` | `[...array, elemento]`, `concat()` |
| agregar al inicio | `unshift()` | `[elemento, ...array]` |
| quitar del final | `pop()` | `slice(0, -1)` |
| quitar del inicio | `shift()` | `slice(1)` |
| insertar o eliminar | `splice()` | `toSpliced()` |
| reemplazar por índice | `array[i] = valor` | `with(i, valor)`, `map()` |
| ordenar | `sort()` | `toSorted()` |
| invertir | `reverse()` | `toReversed()` |
| rellenar | `fill()` | crear con `map()` o `Array.from()` |

### Actualizar un elemento de manera inmutable

```js
const productos = [
  { id: 1, nombre: "Teclado", stock: 5 },
  { id: 2, nombre: "Mouse", stock: 8 },
];

const actualizados = productos.map((producto) =>
  producto.id === 2
    ? { ...producto, stock: producto.stock - 1 }
    : producto
);
```

El array es nuevo. El producto actualizado también es un objeto nuevo. El producto que no cambió conserva su referencia, lo cual evita copiar trabajo innecesario.

---

## 9. Identidad y asignación por referencia

Los primitivos se comparan por su valor:

```js
console.log(5 === 5);         // true
console.log("hola" === "hola"); // true
```

Los objetos y arrays poseen identidad. Dos estructuras separadas no son iguales por contener los mismos datos:

```js
console.log([1, 2] === [1, 2]); // false
console.log({ id: 1 } === { id: 1 }); // false
```

Cada literal crea un objeto diferente.

### Dos variables, una misma estructura

La asignación no copia el array. Copia la referencia:

```js
const originales = [8, 6, 9];
const alias = originales;

alias.push(10);

console.log(originales); // [8, 6, 9, 10]
console.log(alias);       // [8, 6, 9, 10]
console.log(alias === originales); // true
```

No existen dos arrays sincronizados. Existe un solo array alcanzado mediante dos variables.

### Copia superficial de un array

Podemos crear otro array mediante expansión, `slice()` o `Array.from()`:

```js
const original = [1, 2, 3];

const copia1 = [...original];
const copia2 = original.slice();
const copia3 = Array.from(original);

console.log(copia1 === original); // false
```

Agregar a la copia no modifica el array exterior original:

```js
copia1.push(4);

console.log(original); // [1, 2, 3]
console.log(copia1);   // [1, 2, 3, 4]
```

Sin embargo, esas operaciones realizan una **copia superficial**: copian los elementos del primer nivel, no duplican los objetos interiores.

```js
const original = [
  { nombre: "Ana", nota: 8 },
  { nombre: "Luis", nota: 6 },
];

const copia = [...original];

copia[0].nota = 10;

console.log(original[0].nota); // 10
```

Los arrays exteriores son diferentes, pero `original[0]` y `copia[0]` apuntan al mismo objeto.

```text
original ──► [ referencia A, referencia B ]
                         │
copia    ──► [ referencia A, referencia B ]
                         ↓
                  { nombre: "Ana", nota: 10 }
```

### Copia profunda

Una copia profunda crea estructuras nuevas también en los niveles interiores. Cuando los valores son compatibles con el algoritmo de clonación estructurada puede utilizarse `structuredClone()`:

```js
const original = [
  { nombre: "Ana", notas: [8, 9] },
];

const copiaProfunda = structuredClone(original);

copiaProfunda[0].notas.push(10);

console.log(original[0].notas);      // [8, 9]
console.log(copiaProfunda[0].notas); // [8, 9, 10]
```

`structuredClone()` no pertenece al núcleo de ECMAScript: es una API ofrecida por navegadores y otros entornos modernos. Acepta muchos tipos y referencias circulares, pero no puede clonar funciones, elementos del DOM ni cualquier valor arbitrario.

A veces se observa este atajo:

```js
const copia = JSON.parse(JSON.stringify(original));
```

No es una solución general de clonación. JSON pierde o transforma valores como `undefined`, `Date`, `Map`, `Set` y `BigInt`, no admite funciones y falla con referencias circulares.

La mejor pregunta no siempre es “¿cómo copio todo?”. Con frecuencia alcanza con copiar solamente las ramas que la actualización modifica.

---

## 10. Desestructuración de arrays

La desestructuración permite extraer posiciones y vincularlas con nombres:

```js
const coordenadas = [-26.83, -65.20];
const [latitud, longitud] = coordenadas;

console.log(latitud);  // -26.83
console.log(longitud); // -65.20
```

La correspondencia es posicional. El primer nombre recibe el índice `0`, el segundo el índice `1` y así sucesivamente.

### Omitir posiciones

```js
const colores = ["rojo", "verde", "azul"];
const [, segundo] = colores;

console.log(segundo); // "verde"
```

### Valores predeterminados

El valor predeterminado se utiliza cuando la posición contiene `undefined` o no existe:

```js
const [nombre = "Sin nombre", nota = 0] = ["Ana"];

console.log(nombre); // "Ana"
console.log(nota);   // 0
```

No reemplaza `null`, `false`, `0` ni una cadena vacía.

### El resto de los elementos

```js
const [primero, ...restantes] = [10, 20, 30, 40];

console.log(primero);   // 10
console.log(restantes); // [20, 30, 40]
```

El elemento rest debe ser el último y siempre crea un array nuevo.

### Intercambiar variables

```js
let izquierda = "A";
let derecha = "B";

[izquierda, derecha] = [derecha, izquierda];

console.log(izquierda); // "B"
console.log(derecha);   // "A"
```

### Desestructuración anidada

```js
const matriz = [
  [1, 2],
  [3, 4],
];

const [[primero], [, ultimo]] = matriz;

console.log(primero); // 1
console.log(ultimo);  // 4
```

La desestructuración no vuelve profunda a una copia. Si extraemos un objeto o array interior, obtenemos una referencia a ese mismo valor.

---

## 11. Objetos: entidades con propiedades

Un objeto reúne asociaciones entre **claves** y **valores**. Cada asociación se denomina propiedad.

```js
const producto = {
  id: 1,
  nombre: "Teclado",
  precio: 35_000,
  disponible: true,
};
```

Las claves de un objeto son cadenas o símbolos. Cuando escribimos `id` o `precio` sin comillas dentro del literal, JavaScript los interpreta como nombres de propiedades.

Los valores pueden pertenecer a cualquier tipo, incluidos otros objetos, arrays o funciones:

```js
const alumno = {
  nombre: "Ana Pérez",
  contacto: {
    correo: "ana@example.com",
    telefono: null,
  },
  notas: [8, 6, 9],
  saludar() {
    return `Hola, soy ${this.nombre}`;
  },
};
```

Cuando el valor de una propiedad es una función, suele llamarse **método**.

En el ejemplo, una llamada como `alumno.saludar()` hace que `this` se refiera a `alumno`. El valor de `this` depende de la forma en que se invoca la función; ese mecanismo merece un desarrollo específico al estudiar funciones y objetos con mayor profundidad.

### Crear, actualizar y eliminar propiedades

```js
const alumno = {
  nombre: "Ana",
};

alumno.legajo = 12345;  // agrega
alumno.nombre = "Ana Pérez"; // actualiza
delete alumno.legajo;   // elimina
```

Que el objeto haya sido declarado con `const` no impide estas mutaciones. Impide asignar otro objeto a la variable `alumno`.

---

## 12. Acceso con punto y con corchetes

JavaScript ofrece dos sintaxis para acceder a propiedades.

### Notación de punto

```js
const producto = {
  nombre: "Teclado",
  precio: 35_000,
};

console.log(producto.nombre);
console.log(producto.precio);
```

Después del punto se escribe directamente el nombre de la propiedad. Debe tener una forma válida como identificador.

La notación de punto suele preferirse cuando la clave es conocida y fija porque resulta breve y legible.

### Notación de corchetes

```js
console.log(producto["nombre"]);
console.log(producto["precio"]);
```

Dentro de los corchetes se evalúa una expresión. Esto permite claves dinámicas:

```js
const propiedadElegida = "precio";

console.log(producto[propiedadElegida]); // 35000
console.log(producto.propiedadElegida);  // undefined
```

`producto.propiedadElegida` busca literalmente una propiedad llamada `"propiedadElegida"`. `producto[propiedadElegida]` primero evalúa la variable y busca `"precio"`.

Los corchetes también son necesarios para claves que no son identificadores válidos:

```js
const datos = {
  "nombre-completo": "Ana Pérez",
  "código postal": "4000",
};

datos["nombre-completo"];
datos["código postal"];
```

### Propiedades anidadas y encadenamiento opcional

```js
const alumno = {
  nombre: "Ana",
  contacto: {
    correo: "ana@example.com",
  },
};

console.log(alumno.contacto.correo);
```

Si una parte puede faltar, el encadenamiento opcional evita intentar leer sobre `null` o `undefined`:

```js
const telefono = alumno.contacto?.telefono ?? "Sin teléfono";
```

`?.` no reemplaza la validación. Expresa que la ausencia es una posibilidad admitida en ese acceso.

### Comprobar existencia

```js
"nombre" in alumno;              // true, incluye propiedades heredadas
Object.hasOwn(alumno, "nombre"); // true, solo propiedad propia
```

Comparar con `undefined` no siempre distingue ausencia de una propiedad presente cuyo valor es precisamente `undefined`:

```js
const objeto = { dato: undefined };

objeto.dato === undefined;        // true
Object.hasOwn(objeto, "dato");   // true
```

---

## 13. Formas abreviadas de escribir objetos

### Propiedades abreviadas

Cuando una variable y una propiedad deben tener el mismo nombre, puede evitarse la repetición:

```js
const nombre = "Ana";
const legajo = 12345;

const formaCompleta = {
  nombre: nombre,
  legajo: legajo,
};

const formaAbreviada = {
  nombre,
  legajo,
};
```

`{ nombre }` significa “crear una propiedad llamada `nombre` cuyo valor proviene de la variable `nombre`”.

Es muy útil al construir respuestas o parámetros:

```js
function crearAlumno(nombre, legajo) {
  return { nombre, legajo, regular: true };
}
```

### Métodos abreviados

```js
const contador = {
  valor: 0,

  incrementar() {
    this.valor += 1;
  },
};
```

La forma extensa sería `incrementar: function () { ... }`. La forma abreviada comunica con claridad que se trata de un método.

### Claves calculadas

Dentro de un literal, los corchetes permiten calcular el nombre de una propiedad:

```js
const campo = "correo";
const valor = "ana@example.com";

const contacto = {
  [campo]: valor,
};

console.log(contacto.correo); // "ana@example.com"
```

Las claves calculadas son útiles para formularios, agrupaciones y transformaciones dinámicas.

```js
const indice = 2;

const etiquetas = {
  [`campo${indice}`]: "valor",
};

// { campo2: "valor" }
```

### Expansión de propiedades

La sintaxis `...` copia propiedades enumerables propias dentro de otro objeto:

```js
const producto = {
  id: 1,
  nombre: "Teclado",
  precio: 35_000,
};

const actualizado = {
  ...producto,
  precio: 32_000,
};
```

Si una propiedad aparece más de una vez, gana el último valor:

```js
const a = { valor: 1, ...producto };
const b = { ...producto, precio: 32_000 };
```

El orden de las expansiones forma parte del significado.

---

## 14. Funciones frecuentes para objetos

`Object.keys()` devuelve las claves propias, enumerables y de tipo cadena:

```js
const alumno = {
  nombre: "Ana",
  legajo: 12345,
  regular: true,
};

Object.keys(alumno);
// ["nombre", "legajo", "regular"]
```

`Object.values()` devuelve los valores:

```js
Object.values(alumno);
// ["Ana", 12345, true]
```

`Object.entries()` devuelve pares `[clave, valor]`:

```js
Object.entries(alumno);
// [["nombre", "Ana"], ["legajo", 12345], ["regular", true]]
```

Estos métodos permiten utilizar operaciones de arrays:

```js
for (const [clave, valor] of Object.entries(alumno)) {
  console.log(`${clave}: ${valor}`);
}
```

`Object.fromEntries()` realiza la transformación inversa:

```js
const pares = [
  ["tema", "oscuro"],
  ["idioma", "es"],
];

const configuracion = Object.fromEntries(pares);
// { tema: "oscuro", idioma: "es" }
```

Combinadas, estas funciones permiten transformar propiedades de manera inmutable:

```js
const precios = {
  teclado: 35_000,
  mouse: 18_000,
};

const preciosConIva = Object.fromEntries(
  Object.entries(precios).map(([nombre, precio]) => [
    nombre,
    precio * 1.21,
  ])
);
```

Otras funciones importantes son:

```js
Object.hasOwn(alumno, "nombre"); // comprueba propiedad propia

Object.assign({}, alumno, { regular: false });
// copia superficial y combina en el objeto destino

Object.freeze(alumno);
// impide cambios directos en las propiedades del primer nivel
```

`Object.freeze()` es superficial: no congela automáticamente objetos anidados.

Los símbolos no aparecen en `Object.keys()`, `Object.values()` ni `Object.entries()`. Pueden obtenerse mediante `Object.getOwnPropertySymbols()`.

---

## 15. Desestructuración de objetos

La desestructuración de objetos extrae propiedades por nombre, no por posición:

```js
const producto = {
  id: 1,
  nombre: "Teclado",
  precio: 35_000,
};

const { nombre, precio } = producto;

console.log(nombre); // "Teclado"
console.log(precio); // 35000
```

El orden del patrón no importa:

```js
const { precio, nombre } = producto;
```

### Cambiar el nombre local

```js
const { nombre: nombreProducto } = producto;

console.log(nombreProducto); // "Teclado"
```

La propiedad se llama `nombre`; la nueva variable se llama `nombreProducto`.

### Valores predeterminados

```js
const { stock = 0 } = producto;

console.log(stock); // 0
```

El predeterminado se utiliza solamente si la propiedad vale `undefined` o no existe, no si contiene `null`, `false`, `0` o `""`.

### Propiedades restantes

```js
const { id, ...datosEditables } = producto;

console.log(id); // 1
console.log(datosEditables);
// { nombre: "Teclado", precio: 35000 }
```

`datosEditables` es un objeto nuevo con las propiedades enumerables propias restantes. Sus valores interiores continúan siendo copias superficiales.

### Desestructuración anidada

```js
const alumno = {
  nombre: "Ana",
  contacto: {
    correo: "ana@example.com",
  },
};

const {
  nombre,
  contacto: { correo },
} = alumno;
```

Este patrón crea `nombre` y `correo`, pero no crea una variable llamada `contacto`.

### Parámetros desestructurados

Una función puede expresar directamente qué propiedades utiliza:

```js
function mostrarProducto({ nombre, precio, disponible = true }) {
  const estado = disponible ? "disponible" : "sin stock";
  return `${nombre}: $${precio} — ${estado}`;
}
```

Esto resulta claro para objetos pequeños y contratos conocidos. En patrones demasiado profundos puede ser preferible recibir el objeto completo y desestructurarlo en líneas separadas.

---

## 16. Referencias y copias de objetos

La misma regla vista en arrays se aplica a todos los objetos:

```js
const original = { nombre: "Ana", regular: true };
const alias = original;

alias.regular = false;

console.log(original.regular); // false
console.log(alias === original); // true
```

La expansión crea una copia superficial:

```js
const original = {
  nombre: "Ana",
  contacto: {
    correo: "ana@example.com",
  },
};

const copia = { ...original };

console.log(copia === original); // false
console.log(copia.contacto === original.contacto); // true
```

Modificar una propiedad anidada compartida afecta a ambas estructuras:

```js
copia.contacto.correo = "nuevo@example.com";

console.log(original.contacto.correo); // "nuevo@example.com"
```

Para una actualización inmutable de esa rama:

```js
const actualizado = {
  ...original,
  contacto: {
    ...original.contacto,
    correo: "nuevo@example.com",
  },
};
```

Se copian el objeto exterior y el objeto `contacto`, porque ambos cambian en el nuevo estado. No es necesario clonar propiedades que no se modifican.

---

## 17. ¿Objeto o `Map`?

Un objeto puede utilizarse como un diccionario simple:

```js
const preciosPorCodigo = {
  A10: 1000,
  B20: 2500,
};
```

Pero los objetos también modelan entidades con propiedades conocidas. `Map` está diseñado específicamente para una colección dinámica de pares clave–valor.

| Necesidad | Objeto | `Map` |
|---|---|---|
| modelar una entidad con campos conocidos | excelente | poco habitual |
| claves de tipo cadena o símbolo | sí | sí |
| claves de cualquier tipo | no | sí |
| cantidad directa | `Object.keys(obj).length` | `map.size` |
| agregar y quitar frecuentemente | posible | diseñado para ello |
| iteración directa | no es iterable por defecto | sí |
| conversión directa a JSON | natural para datos compatibles | requiere transformación |

Como regla orientativa:

- usar objetos para registros como `alumno`, `producto` o `configuracion`;
- usar `Map` para asociaciones dinámicas donde las claves son datos.

---

## 18. `Map`: pares clave–valor

Un `Map` conserva pares clave–valor en orden de inserción. Cualquier valor, incluso un objeto, puede actuar como clave.

### Crear y cargar

```js
const stockPorCodigo = new Map();

stockPorCodigo.set("A10", 5);
stockPorCodigo.set("B20", 8);
```

`set()` agrega o reemplaza y devuelve el mismo mapa, por lo que puede encadenarse:

```js
const stock = new Map()
  .set("A10", 5)
  .set("B20", 8);
```

También puede inicializarse con un iterable de pares:

```js
const stock = new Map([
  ["A10", 5],
  ["B20", 8],
]);
```

### Operaciones frecuentes

```js
stock.get("A10");    // 5
stock.has("A10");    // true
stock.size;          // 2
stock.delete("B20"); // true si existía
stock.clear();       // elimina todos los pares
```

`get()` devuelve `undefined` cuando la clave no existe. Si `undefined` puede ser un valor almacenado, se utiliza `has()` para distinguir ambos casos.

Las claves se comparan por identidad cuando son objetos:

```js
const clave = { id: 1 };
const mapa = new Map();

mapa.set(clave, "encontrado");

mapa.get(clave);     // "encontrado"
mapa.get({ id: 1 }); // undefined: es otro objeto
```

### Recorrer un `Map`

Cada elemento producido por el iterador es un par `[clave, valor]`. La desestructuración resulta natural:

```js
const precios = new Map([
  ["teclado", 35_000],
  ["mouse", 18_000],
]);

for (const [producto, precio] of precios) {
  console.log(`${producto}: $${precio}`);
}
```

También pueden recorrerse partes específicas:

```js
for (const clave of precios.keys()) {
  console.log(clave);
}

for (const valor of precios.values()) {
  console.log(valor);
}

for (const entrada of precios.entries()) {
  console.log(entrada); // [clave, valor]
}
```

`forEach()` está disponible, aunque el orden de parámetros es `valor, clave`:

```js
precios.forEach((precio, producto) => {
  console.log(`${producto}: $${precio}`);
});
```

### Convertir entre `Map`, arrays y objetos

```js
const entradas = [...precios];
// [["teclado", 35000], ["mouse", 18000]]

const comoObjeto = Object.fromEntries(precios);
// { teclado: 35000, mouse: 18000 }

const nuevamenteMapa = new Map(Object.entries(comoObjeto));
```

La conversión a objeto solo conserva fielmente claves que puedan expresarse adecuadamente como cadenas o símbolos del objeto.

### Actualización inmutable de un `Map`

`set()` muta el mapa. Para conservar el anterior, se crea primero una copia superficial:

```js
const original = new Map([
  ["A10", 5],
]);

const actualizado = new Map(original);
actualizado.set("A10", 4);

console.log(original.get("A10"));   // 5
console.log(actualizado.get("A10")); // 4
```

Los valores interiores siguen compartiendo referencias si son objetos.

---

## 19. `Set`: colecciones sin repetidos

Un `Set` almacena valores únicos y conserva el orden en que fueron agregados por primera vez.

### Crear y operar

```js
const categorias = new Set();

categorias.add("hardware");
categorias.add("software");
categorias.add("hardware");

console.log(categorias.size); // 2
```

El segundo `"hardware"` no crea otra entrada.

Operaciones frecuentes:

```js
categorias.has("hardware");    // true
categorias.delete("software"); // true si existía
categorias.clear();            // elimina todos los valores
```

`add()` devuelve el mismo conjunto y permite encadenar:

```js
const permisos = new Set()
  .add("leer")
  .add("editar");
```

### Eliminar duplicados de un array

```js
const etiquetas = ["web", "js", "web", "backend", "js"];
const unicas = [...new Set(etiquetas)];

console.log(unicas); // ["web", "js", "backend"]
```

El `Set` elimina repeticiones y la expansión vuelve a producir un array.

### Identidad de objetos

Dos objetos con los mismos datos siguen siendo valores diferentes:

```js
const primero = { id: 1 };
const segundo = { id: 1 };

const conjunto = new Set([primero, segundo]);

console.log(conjunto.size); // 2
```

Agregar dos veces la misma referencia sí evita la repetición:

```js
const conjunto = new Set([primero, primero]);
console.log(conjunto.size); // 1
```

Si buscamos unicidad por `id`, debemos guardar los identificadores o construir una asociación apropiada.

### Recorrer un `Set`

```js
const tecnologias = new Set(["HTML", "CSS", "JavaScript"]);

for (const tecnologia of tecnologias) {
  console.log(tecnologia);
}
```

También dispone de `values()`, `keys()`, `entries()` y `forEach()`. En un conjunto, `keys()` y `values()` producen los mismos valores por compatibilidad con la interfaz de `Map`.

### Operaciones de conjuntos

Los entornos modernos incluyen operaciones matemáticas que producen nuevos conjuntos:

```js
const frontend = new Set(["Ana", "Luis", "Marta"]);
const backend = new Set(["Luis", "Pedro"]);

frontend.union(backend);
// Set { "Ana", "Luis", "Marta", "Pedro" }

frontend.intersection(backend);
// Set { "Luis" }

frontend.difference(backend);
// Set { "Ana", "Marta" }

frontend.isSubsetOf(backend); // false
frontend.isDisjointFrom(backend); // false
```

Estas operaciones se incorporaron recientemente y requieren comprobar el entorno objetivo si se trabaja con navegadores antiguos.

Una intersección compatible con entornos anteriores puede expresarse mediante arrays:

```js
const interseccion = new Set(
  [...frontend].filter((persona) => backend.has(persona))
);
```

### Actualización inmutable de un `Set`

`add()`, `delete()` y `clear()` mutan. Para conservar el conjunto anterior:

```js
const original = new Set(["leer"]);
const actualizado = new Set(original);

actualizado.add("editar");

console.log(original);   // Set { "leer" }
console.log(actualizado); // Set { "leer", "editar" }
```

---

## 20. Elegir una estructura

| Estructura | Pregunta que responde | Acceso principal |
|---|---|---|
| Array | “¿Qué valores aparecen en esta secuencia y en qué orden?” | índice numérico |
| Objeto | “¿Cuáles son las características de esta entidad?” | nombre de propiedad |
| `Map` | “¿Qué valor está asociado dinámicamente con esta clave?” | clave de cualquier tipo |
| `Set` | “¿Este valor pertenece al conjunto?” | valor único |

Ejemplos:

```js
// Secuencia ordenada
const notas = [8, 6, 9];

// Entidad con campos conocidos
const alumno = {
  legajo: 12345,
  nombre: "Ana",
};

// Asociación dinámica por identificador
const alumnosPorLegajo = new Map([
  [12345, alumno],
]);

// Pertenencia sin duplicados
const permisos = new Set(["leer", "editar"]);
```

No existe una estructura mejor en abstracto. Existe una estructura que expresa mejor la relación que necesita el dominio.

---

## 21. Caso integrador: un carrito de compras

Un catálogo puede representarse como un array de objetos:

```js
const productos = [
  { id: 1, nombre: "Teclado", precio: 35_000, categoria: "hardware" },
  { id: 2, nombre: "Mouse", precio: 18_000, categoria: "hardware" },
  { id: 3, nombre: "Curso JS", precio: 25_000, categoria: "software" },
];
```

Un `Map` permite encontrar rápidamente un producto por identificador:

```js
const productosPorId = new Map(
  productos.map((producto) => [producto.id, producto])
);
```

Un `Set` permite obtener categorías únicas:

```js
const categorias = new Set(
  productos.map((producto) => producto.categoria)
);

console.log([...categorias]);
// ["hardware", "software"]
```

El carrito puede almacenar líneas con producto y cantidad:

```js
const carrito = [
  { productoId: 1, cantidad: 2 },
  { productoId: 3, cantidad: 1 },
];
```

Podemos construir el detalle mediante `map()`, desestructuración y acceso al mapa:

```js
const detalle = carrito.map(({ productoId, cantidad }) => {
  const producto = productosPorId.get(productoId);

  if (!producto) {
    throw new Error(`No existe el producto ${productoId}`);
  }

  const { nombre, precio } = producto;

  return {
    productoId,
    nombre,
    precioUnitario: precio,
    cantidad,
    subtotal: precio * cantidad,
  };
});
```

Y calcular el total mediante `reduce()`:

```js
const total = detalle.reduce(
  (acumulado, linea) => acumulado + linea.subtotal,
  0
);
```

La actualización inmutable de una cantidad puede hacerse con `map()`:

```js
const carritoActualizado = carrito.map((linea) =>
  linea.productoId === 1
    ? { ...linea, cantidad: linea.cantidad + 1 }
    : linea
);
```

Este ejemplo combina responsabilidades claras:

- array para secuencias de productos y líneas;
- objeto para describir cada entidad;
- `Map` para localizar por clave;
- `Set` para valores únicos;
- desestructuración para extraer datos;
- `map()` para transformar;
- `reduce()` para agregar;
- expansión para actualizar sin mutar.

---

## 22. Errores frecuentes y su explicación

### Esperar que la asignación copie

```js
const copia = original;
```

La asignación crea otra referencia al mismo objeto. No crea una estructura independiente.

### Esperar una copia profunda de `...`

```js
const copia = { ...original };
```

La expansión copia un nivel. Los objetos interiores continúan compartidos.

### Crear una matriz con filas compartidas

```js
Array(3).fill(Array(3).fill(0));
```

Cada posición exterior recibe la misma referencia. Debe crearse cada fila con una función.

### Confundir `slice()` con `splice()`

- `slice()` copia un rango;
- `splice()` modifica el array;
- `toSpliced()` devuelve una versión modificada sin alterar el original.

### Ordenar números sin comparador

```js
[10, 2, 1].sort(); // [1, 10, 2]
```

El orden predeterminado compara representaciones textuales. Para números se utiliza `(a, b) => a - b`.

### Utilizar `map()` solamente para efectos

```js
alumnos.map((alumno) => console.log(alumno));
```

Esto crea un array de `undefined` que no se utiliza. Para efectos corresponde `forEach()` o `for...of`.

### Esperar que `forEach()` admita `break`

Un `return` termina solamente el callback actual. Si se necesita detener el recorrido se utiliza `for...of`, `find()`, `some()` o `every()`, según la intención.

### Utilizar `for...in` para valores de un array

`for...in` entrega nombres de propiedades como cadenas y puede incluir propiedades no indexadas o heredadas. Para valores de un array se utiliza `for...of`.

### Confundir una clave dinámica con su nombre literal

```js
const clave = "precio";

producto.clave;  // busca "clave"
producto[clave]; // busca "precio"
```

### Creer que `Set` elimina objetos con datos repetidos

```js
new Set([{ id: 1 }, { id: 1 }]).size; // 2
```

Los objetos se distinguen por identidad. Para unicidad por `id`, se almacenan identificadores o se construye un `Map`.

---

## 23. Ideas que conviene conservar

1. Un array representa una secuencia ordenada y utiliza índices desde cero.
2. `length` indica la cantidad de posiciones; el último índice habitual es `length - 1`.
3. `slice()` copia un rango incluyendo el inicio y excluyendo el final.
4. Una matriz es un array de arrays y se accede como `matriz[fila][columna]`.
5. `Array.fill()` repite la misma referencia cuando recibe un objeto.
6. `for` ofrece control explícito del índice; `for...of` recorre valores; `for...in` recorre nombres de propiedades.
7. `map()` transforma, `filter()` selecciona y `reduce()` acumula.
8. `forEach()` se utiliza para efectos y devuelve `undefined`.
9. Algunos métodos mutan; otros producen estructuras nuevas. El nombre del método no siempre permite adivinarlo.
10. Arrays y objetos se comparan por identidad, no por contenido.
11. Una asignación copia una referencia; no duplica la estructura.
12. La expansión, `slice()`, `Array.from()` y `Object.assign()` realizan copias superficiales.
13. La desestructuración de arrays es posicional; la de objetos utiliza nombres de propiedades.
14. La notación de punto usa una clave fija; los corchetes permiten una expresión dinámica.
15. `{ nombre }` abrevia `{ nombre: nombre }`.
16. `{ [expresion]: valor }` crea una clave calculada.
17. `Object.keys()`, `Object.values()` y `Object.entries()` trabajan con propiedades propias, enumerables y de clave cadena.
18. `Map` modela asociaciones dinámicas y admite claves de cualquier tipo.
19. `Set` modela pertenencia y conserva valores únicos por identidad.
20. Las actualizaciones inmutables copian la estructura exterior y las ramas interiores que cambian.

---

## 24. Preguntas de repaso

1. ¿Por qué el primer elemento de un array posee índice cero?
2. ¿Qué diferencia existe entre `array[-1]` y `array.at(-1)`?
3. ¿Qué elementos devuelve `slice(1, 4)`?
4. ¿En qué se diferencian `slice()`, `splice()` y `toSpliced()`?
5. ¿Cómo se representa y accede una matriz en JavaScript?
6. ¿Por qué `Array(3).fill([])` comparte el mismo array interior?
7. ¿Cuándo conviene un `for` tradicional en lugar de `for...of`?
8. ¿Qué recorre realmente `for...in`?
9. ¿Qué diferencias conceptuales existen entre `map()`, `filter()` y `reduce()`?
10. ¿Por qué `forEach()` no reemplaza siempre a un bucle?
11. ¿Qué métodos de ordenamiento y reemplazo mutan el array?
12. ¿Qué significa que dos variables compartan una referencia?
13. ¿Por qué `[1, 2] === [1, 2]` devuelve `false`?
14. ¿Qué diferencia hay entre copia superficial y profunda?
15. ¿Cómo se extrae el primer elemento y se agrupan los restantes mediante desestructuración?
16. ¿Cuándo debe utilizarse `objeto[clave]` en lugar de `objeto.clave`?
17. ¿Qué significa la abreviatura `{ nombre, edad }`?
18. ¿Cómo se cambia el nombre de una variable al desestructurar un objeto?
19. ¿Qué diferencia existe entre el operador `in` y `Object.hasOwn()`?
20. ¿Cuándo conviene utilizar `Map` en lugar de un objeto?
21. ¿Cómo compara `Map` una clave que es un objeto?
22. ¿Cómo puede eliminarse la repetición de valores primitivos mediante `Set`?

### Ejercicio 1: procesamiento de notas

Dado el array:

```js
const notas = [8, 4, 10, 6, 3, 9];
```

Obtener sin modificarlo:

1. las notas aprobadas;
2. todas las notas incrementadas en un punto, con máximo `10`;
3. el promedio;
4. la primera nota desaprobada;
5. si existe al menos un `10`;
6. una copia ordenada de mayor a menor.

### Ejercicio 2: matriz

Crear una matriz de `4 × 4` inicializada en cero sin compartir filas. Luego construir otra matriz, sin modificar la primera, que tenga `1` en la diagonal principal.

### Ejercicio 3: actualización de objetos

Dado:

```js
const alumno = {
  legajo: 12345,
  nombre: "Ana",
  contacto: {
    correo: "ana@example.com",
    telefono: null,
  },
  notas: [8, 6, 9],
};
```

Crear un nuevo objeto que:

1. conserve el original sin cambios;
2. actualice el correo;
3. agregue una nota `10`;
4. mantenga el mismo legajo y nombre;
5. permita verificar qué referencias fueron copiadas y cuáles se conservaron.

### Ejercicio 4: índice y categorías

A partir de un array de productos:

1. crear un `Map` que los indexe por `id`;
2. crear un `Set` de categorías únicas;
3. recorrer el mapa mostrando `id`, nombre y precio;
4. convertir el mapa nuevamente en un array de productos;
5. explicar por qué dos objetos con el mismo `id` pueden ser elementos distintos de un `Set`.

---

## Fuentes y lecturas recomendadas

- [Colecciones indexadas y arrays — MDN](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Guide/Indexed_collections)
- [Referencia de `Array` — MDN](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Array)
- [Desestructuración — MDN](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Operators/Destructuring)
- [Bucles e iteración — MDN](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Guide/Loops_and_iteration)
- [`for...of` — MDN](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Statements/for...of)
- [`for...in` — MDN](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Statements/for...in)
- [Trabajo con objetos — MDN](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Guide/Working_with_objects)
- [Inicializadores de objetos — MDN](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Operators/Object_initializer)
- [Sintaxis de expansión — MDN](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Operators/Spread_syntax)
- [Referencia de `Map` — MDN](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Map)
- [Referencia de `Set` — MDN](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Set)
- [Clonación estructurada — MDN](https://developer.mozilla.org/en-US/docs/Web/API/Window/structuredClone)
- [ECMAScript Language Specification — TC39](https://tc39.es/ecma262/)
