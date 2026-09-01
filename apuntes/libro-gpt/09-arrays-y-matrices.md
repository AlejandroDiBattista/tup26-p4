# 9. Arrays y matrices

## Idea central

**Un array representa una secuencia ordenada y mutable; elegir la operación adecuada depende de si queremos consultar, transformar o cambiar esa secuencia.** La productividad aparece cuando distinguimos métodos mutantes de no mutantes, evitamos arrays dispersos y controlamos las referencias compartidas en estructuras anidadas.

## Cuándo elegir un array

Un array es adecuado cuando:

- el orden importa;
- cada elemento ocupa una posición;
- se recorrerá la colección completa o por rangos;
- pueden existir valores repetidos;
- las operaciones principales son agregar, filtrar, ordenar o transformar.

```js
const notas = [8, 6, 10, 7];
```

Si la operación dominante es encontrar un elemento por una clave estable, un `Map` o un índice auxiliar puede ser más apropiado que recorrer siempre el array.

## Crear arrays

El literal es la forma habitual:

```js
const vacio = [];
const lenguajes = ["JavaScript", "C#", "Python"];
const mezcla = [1, "dos", true, null];
```

JavaScript permite mezclar tipos, pero una colección homogénea suele ser más fácil de procesar y documentar.

`Array.of` crea un array con sus argumentos:

```js
Array.of(3);       // [3]
Array.of(1, 2, 3); // [1, 2, 3]
```

Esto contrasta con el constructor de un solo número:

```js
Array(3); // array con longitud 3 y tres huecos
```

`Array.from` convierte iterables o estructuras similares a arrays y puede transformar al mismo tiempo:

```js
Array.from("A😀B"); // ["A", "😀", "B"]
Array.from({ length: 5 }, (_, indice) => indice + 1);
// [1, 2, 3, 4, 5]
```

`Array.isArray` distingue arrays de otros objetos:

```js
Array.isArray([]); // true
typeof [];         // "object"
```

## Índices y `length`

Los índices enteros comienzan en cero:

```js
const colores = ["rojo", "verde", "azul"];

colores[0];     // "rojo"
colores[2];     // "azul"
colores[99];    // undefined
colores.length; // 3
```

`at` admite posiciones negativas:

```js
colores.at(-1); // "azul"
colores.at(-2); // "verde"
```

Asignar una posición modifica el array:

```js
colores[1] = "amarillo";
```

`length` no es solo una propiedad informativa. Reducirla elimina elementos; ampliarla crea huecos:

```js
const valores = [1, 2, 3];
valores.length = 1; // [1]
valores.length = 4; // [1, <3 huecos>]
```

No uses esta capacidad como operación cotidiana. Métodos con nombres expresan mejor la intención.

## Arrays densos y dispersos

Un hueco es una posición inexistente, diferente de una posición con `undefined`:

```js
const disperso = [1, , 3];
const explicito = [1, undefined, 3];

1 in disperso; // false
1 in explicito; // true
```

Algunos métodos como `map` saltan los huecos; `for...of` produce `undefined` para ellos. Estas diferencias dificultan el razonamiento. Preferí arrays densos creados con valores explícitos.

## Extraer rangos con `slice`

`slice(inicio, fin)` devuelve un nuevo array y no incluye `fin`:

```js
const valores = [10, 20, 30, 40, 50];

valores.slice(1, 4); // [20, 30, 40]
valores.slice(2);    // [30, 40, 50]
valores.slice(-2);   // [40, 50]
valores.slice();     // copia superficial
```

Los elementos no se clonan. Si son objetos, ambas colecciones contienen las mismas referencias.

## Agregar y quitar en los extremos

Estos métodos modifican el array:

```js
const cola = ["a", "b"];

cola.push("c");   // agrega al final; devuelve nueva longitud
cola.pop();       // quita y devuelve el último
cola.unshift("z"); // agrega al comienzo
cola.shift();     // quita y devuelve el primero
```

`push` y `pop` permiten una pila LIFO. `push` y `shift` permiten una cola FIFO, aunque quitar del comienzo obliga a reindexar elementos y no escala bien para colas enormes.

## `splice`: cambiar una región

`splice(inicio, cantidad, ...nuevos)` modifica el original y devuelve lo eliminado:

```js
const letras = ["a", "b", "c", "d"];
const eliminadas = letras.splice(1, 2, "x", "y");

letras;     // ["a", "x", "y", "d"]
eliminadas; // ["b", "c"]
```

No lo confundas con `slice`. Si querés una variante sin mutación para reemplazar una posición:

```js
const indice = 1;
const nuevo = [
  ...letras.slice(0, indice),
  "reemplazo",
  ...letras.slice(indice + 1)
];
```

## Buscar y comprobar

```js
const numeros = [10, 20, 30, 20];

numeros.includes(20);        // true
numeros.indexOf(20);         // 1
numeros.lastIndexOf(20);     // 3
numeros.find(n => n > 15);   // 20
numeros.findIndex(n => n > 15); // 1
numeros.some(n => n < 0);    // false
numeros.every(n => n > 0);   // true
```

`includes` puede encontrar `NaN`, mientras que `indexOf` no:

```js
[NaN].includes(NaN); // true
[NaN].indexOf(NaN);  // -1
```

`find` devuelve `undefined` si no hay resultado. Si los elementos pueden ser literalmente `undefined`, usá `findIndex` o un resultado etiquetado para distinguir los casos.

## Tres formas fundamentales de recorrer

### `for` tradicional

Permite controlar índice, dirección y paso:

```js
for (let indice = 0; indice < numeros.length; indice += 1) {
  console.log(indice, numeros[indice]);
}
```

Es la mejor opción cuando el índice participa en el algoritmo o el recorrido no es lineal.

### `for...of`

Recorre valores:

```js
for (const numero of numeros) {
  console.log(numero);
}
```

Para índice y valor:

```js
for (const [indice, numero] of numeros.entries()) {
  console.log(indice, numero);
}
```

### `for...in`

Recorre nombres de propiedades enumerables, incluidos los heredados. No es la herramienta para valores de arrays:

```js
for (const clave in numeros) {
  console.log(clave); // strings como "0", "1"...
}
```

Una propiedad adicional o una modificación del prototipo puede aparecer en el recorrido. Usá `for...of` o métodos de array.

## Transformar con `map`

`map` produce un nuevo array con un resultado por elemento:

```js
const dobles = numeros.map(numero => numero * 2);
```

El callback recibe valor, índice y array original:

```js
const etiquetas = numeros.map(
  (numero, indice) => `${indice + 1}: ${numero}`
);
```

No uses `map` solo para efectos si descartás su resultado. Para imprimir, enviar o registrar, `for...of` o `forEach` comunica mejor.

## Seleccionar con `filter`

```js
const aprobados = alumnos.filter(alumno => alumno.nota >= 6);
```

El callback se interpreta como condición. El array resultante conserva referencias a los mismos objetos seleccionados; no los clona.

## Acumular con `reduce`

`reduce` combina elementos en un acumulador:

```js
const suma = numeros.reduce(
  (acumulado, numero) => acumulado + numero,
  0
);
```

El valor inicial define el tipo y cubre el array vacío. Sin valor inicial, el primer elemento se usa como acumulador y un array vacío lanza `TypeError`.

Puede construir objetos, mapas o agrupaciones, aunque un bucle puede ser más legible si el acumulador tiene muchas reglas:

```js
const porEstado = pedidos.reduce((grupos, pedido) => {
  const lista = grupos[pedido.estado] ?? [];

  return {
    ...grupos,
    [pedido.estado]: [...lista, pedido]
  };
}, {});
```

Crear copias en cada iteración puede ser costoso. La inmutabilidad es una herramienta, no una obligación de producir el algoritmo menos eficiente. Un acumulador local mutable que no escapa puede ser claro y seguro.

## Efectos con `forEach`

```js
alumnos.forEach(alumno => console.log(alumno.nombre));
```

`forEach` siempre devuelve `undefined`, no admite `break` ni `continue`, y no espera automáticamente callbacks asincrónicos:

```js
// No espera en secuencia:
archivos.forEach(async archivo => {
  await procesar(archivo);
});
```

Para esperar en orden:

```js
for (const archivo of archivos) {
  await procesar(archivo);
}
```

Para concurrencia deliberada:

```js
await Promise.all(archivos.map(procesar));
```

## Aplanar y combinar

```js
[[1, 2], [3, 4]].flat();      // [1, 2, 3, 4]
[1, [2, [3]]].flat(2);        // [1, 2, 3]
[1, 2].flatMap(n => [n, n]);  // [1, 1, 2, 2]
[1, 2].concat([3, 4]);        // [1, 2, 3, 4]
```

El spread también combina:

```js
const combinado = [...a, ...b];
```

`flat` solo aplana hasta la profundidad indicada y conserva las referencias de los valores internos.

## Ordenar e invertir

`sort` modifica el array y, sin comparador, convierte a string:

```js
[2, 10, 1].sort(); // [1, 10, 2]
```

Para números:

```js
numeros.sort((a, b) => a - b);
```

El comparador debe devolver un valor negativo, cero o positivo. Para objetos:

```js
alumnos.sort((a, b) => a.nota - b.nota);
```

Las variantes no mutantes son `toSorted`, `toReversed` y `toSpliced`:

```js
const ordenados = numeros.toSorted((a, b) => a - b);
const invertidos = numeros.toReversed();
```

Para nombres humanos, usá `Intl.Collator`.

## Referencias y copias superficiales

```js
const original = [{ valor: 1 }];
const alias = original;
const copia = [...original];

alias === original; // true
copia === original; // false
copia[0] === original[0]; // true
```

La copia tiene otra estructura exterior, pero comparte los objetos internos. Para actualizar un elemento sin modificar el original:

```js
const actualizado = original.map((item, indice) =>
  indice === 0 ? { ...item, valor: 2 } : item
);
```

## Desestructuración

```js
const [primero, segundo] = numeros;
const [cabeza, ...cola] = numeros;
const [, omitidoElPrimero, tercero = 0] = numeros;
```

Permite intercambiar variables:

```js
let izquierda = "A";
let derecha = "B";
[izquierda, derecha] = [derecha, izquierda];
```

También puede anidarse, pero demasiada profundidad hace frágil el código frente a cambios de forma.

## Matrices y filas compartidas

Una matriz es un array de arrays:

```js
const matriz = [
  [1, 2, 3],
  [4, 5, 6]
];

matriz[1][2]; // 6
```

No crees todas las filas con la misma referencia:

```js
const incorrecta = Array(3).fill(Array(3).fill(0));
incorrecta[0][0] = 1;
// cambia la primera columna de todas las filas
```

Creá una fila por iteración:

```js
const correcta = Array.from(
  { length: 3 },
  () => Array(3).fill(0)
);
```

Recorrido:

```js
for (let fila = 0; fila < correcta.length; fila += 1) {
  for (let columna = 0; columna < correcta[fila].length; columna += 1) {
    console.log(correcta[fila][columna]);
  }
}
```

No todas las filas tienen que medir lo mismo; si el algoritmo exige una matriz rectangular, validalo.

## Caso integrador: estadísticas de notas

```js
function resumirNotas(notas) {
  if (!Array.isArray(notas) || notas.length === 0) {
    throw new TypeError("Se necesita al menos una nota");
  }

  const invalidas = notas.filter(
    nota => !Number.isFinite(nota) || nota < 0 || nota > 10
  );

  if (invalidas.length > 0) {
    throw new RangeError(`Notas inválidas: ${invalidas.join(", ")}`);
  }

  const suma = notas.reduce((total, nota) => total + nota, 0);

  return {
    cantidad: notas.length,
    promedio: suma / notas.length,
    minima: Math.min(...notas),
    maxima: Math.max(...notas),
    aprobadas: notas.filter(nota => nota >= 6).length,
    ordenadas: notas.toSorted((a, b) => a - b)
  };
}
```

La entrada se valida una vez, los resultados tienen nombres y el array original no cambia.

## Errores frecuentes

- confundir `slice` con `splice`;
- ordenar números sin comparador;
- usar `for...in` para valores;
- esperar que spread clone objetos internos;
- crear matrices con filas compartidas;
- usar `map` para efectos o `forEach` con `await` esperando secuencia;
- omitir el valor inicial de `reduce` sin considerar el array vacío;
- crear huecos mediante índices lejanos o cambios de `length`.

## Práctica guiada

Recibí una matriz de calificaciones donde cada fila representa un alumno. Validá que sea rectangular, calculá promedio por alumno y por evaluación, encontrá máximos y construí una matriz normalizada sin modificar la original. Probá una fila vacía, distinta cantidad de columnas, `NaN` y un array con huecos.

## Para recordar

- Un array es una secuencia ordenada; sus métodos expresan consultas, transformaciones o mutaciones.
- `slice`, `map`, `filter` y `toSorted` producen arrays nuevos; muchos otros modifican el original.
- Las copias son superficiales salvo que se copie explícitamente cada nivel necesario.
- Evitá arrays dispersos y matrices con referencias de fila compartidas.
- Elegí el recorrido según la tarea: índice, valor, transformación, acumulación o efecto.
