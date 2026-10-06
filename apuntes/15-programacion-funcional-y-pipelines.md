# 15. Programación funcional y pipelines de datos

## Idea central

**La programación funcional organiza una solución como composición de transformaciones, favorece datos inmutables y concentra los efectos en los bordes.** En JavaScript no es una obligación de pureza absoluta: es un conjunto de herramientas para reducir estados implícitos y volver comprobable cada paso.

## Funciones como datos

La base es que una función puede almacenarse, pasarse y devolverse:

```js
const duplicar = numero => numero * 2;

function aplicar(funcion, valor) {
  return funcion(valor);
}

aplicar(duplicar, 5); // 10
```

Una función que recibe o devuelve funciones es de orden superior:

```js
function mayorQue(limite) {
  return valor => valor > limite;
}

const mayorQueDiez = mayorQue(10);
```

Las funciones especializadas conservan configuración mediante clausuras.

## Pureza: misma entrada, mismo resultado

Una función pura:

1. devuelve el mismo resultado para las mismas entradas;
2. no cambia estado observable fuera de ella.

```js
function calcularIva(precio, tasa) {
  return precio * tasa;
}
```

Esta función depende de estado externo y produce resultados diferentes con la misma entrada:

```js
let tasaActual = 0.21;

function calcularIvaImplicito(precio) {
  return precio * tasaActual;
}
```

Pasar la tasa vuelve visible la dependencia.

Otros efectos incluyen:

- modificar argumentos o variables globales;
- escribir archivos o bases de datos;
- enviar una solicitud;
- leer el reloj o generar azar;
- imprimir;
- lanzar una excepción observable.

Los efectos no son malos: una aplicación debe interactuar con el mundo. El objetivo es saber dónde ocurren.

## Núcleo funcional, bordes imperativos

```js
const texto = await readFile(ruta, "utf8"); // efecto de entrada
const datos = JSON.parse(texto);             // transformación, puede fallar
const resumen = resumir(datos);              // núcleo puro
await writeFile(salida, JSON.stringify(resumen)); // efecto de salida
```

El núcleo puro puede probarse con valores en memoria. Los bordes son responsables de recursos, errores e integración.

## Inmutabilidad

En lugar de cambiar un valor compartido, se produce una nueva versión:

```js
const alumno = { nombre: "Ana", nota: 7 };

const actualizado = {
  ...alumno,
  nota: 8
};
```

Con arrays:

```js
const numeros = [1, 2, 3];
const conCuatro = [...numeros, 4];
const dobles = numeros.map(numero => numero * 2);
```

La inmutabilidad aporta:

- historial de estados más fácil de reconstruir;
- menos interferencia entre consumidores;
- comparación por identidad para detectar cambios;
- pruebas sin preparación y limpieza compartida.

No exige clonar profundamente todo. Se copia el camino modificado y se comparten ramas que nadie mutará.

## Mutación local controlada

Esta función es pura desde afuera aunque use un acumulador mutable local:

```js
function indexarPorId(items) {
  const indice = new Map();

  for (const item of items) {
    indice.set(item.id, item);
  }

  return indice;
}
```

La pureza observable importa más que prohibir toda asignación interna. Para la misma entrada y sin mutarla, devuelve un mapa equivalente y no cambia estado exterior.

## `map`: una salida por entrada

```js
const preciosConIva = precios.map(precio => precio * 1.21);
```

Con objetos:

```js
const alumnosConEstado = alumnos.map(alumno => ({
  ...alumno,
  estado: alumno.nota >= 6 ? "aprobado" : "desaprobado"
}));
```

Una implementación didáctica:

```js
function map(valores, transformar) {
  const resultado = [];

  for (let i = 0; i < valores.length; i += 1) {
    resultado.push(transformar(valores[i], i, valores));
  }

  return resultado;
}
```

El contrato garantiza orden y cantidad, no que el callback sea puro.

## `filter`: conservar lo que cumple

```js
const mayores = alumnos.filter(alumno => alumno.edad >= 18);
```

Implementación:

```js
function filter(valores, predicado) {
  const resultado = [];

  for (let i = 0; i < valores.length; i += 1) {
    const valor = valores[i];
    if (predicado(valor, i, valores)) resultado.push(valor);
  }

  return resultado;
}
```

El predicado se interpreta en contexto booleano. Para reglas críticas, devolvé un booleano claro.

## `reduce`: acumular cualquier estructura

Suma:

```js
const total = importes.reduce(
  (suma, importe) => suma + importe,
  0
);
```

Conteo por categoría:

```js
const conteos = productos.reduce((mapa, producto) => {
  const anterior = mapa.get(producto.categoria) ?? 0;
  mapa.set(producto.categoria, anterior + 1);
  return mapa;
}, new Map());
```

Implementación didáctica:

```js
function reduce(valores, combinar, inicial) {
  let acumulador = inicial;

  for (let i = 0; i < valores.length; i += 1) {
    acumulador = combinar(acumulador, valores[i], i, valores);
  }

  return acumulador;
}
```

`reduce` es poderoso y puede ocultar intención. Si el acumulador tiene muchas mutaciones y bifurcaciones, un bucle y variables nombradas pueden ser más fáciles de mantener.

## Consultas especializadas

```js
alumnos.find(alumno => alumno.legajo === 10);
alumnos.findIndex(alumno => alumno.legajo === 10);
alumnos.some(alumno => alumno.nota >= 8);
alumnos.every(alumno => alumno.asistencia >= 75);
```

`some` se detiene al primer `true`; `every`, al primer `false`. Son preferibles a reducir booleanos porque expresan la pregunta y permiten cortocircuito.

## `forEach`: efecto, no transformación

```js
alumnos.forEach(alumno => registrar(alumno));
```

Usalo cuando el objetivo sea ejecutar un efecto por elemento. Si necesitás un array, `map`; si necesitás control de `break` o `await` secuencial, `for...of`.

## `flatMap`: transformar a cero, uno o varios elementos

```js
const materias = alumnos.flatMap(alumno => alumno.materias);
```

Puede filtrar y transformar en un paso:

```js
const errores = filas.flatMap((fila, indice) => {
  const error = validar(fila);
  return error ? [{ fila: indice + 1, error }] : [];
});
```

Solo aplana un nivel.

## Ordenar sin mutar

```js
const porNota = alumnos.toSorted((a, b) => a.nota - b.nota);
```

Para varios criterios:

```js
const porCursoYNombre = alumnos.toSorted((a, b) => {
  const porCurso = a.curso.localeCompare(b.curso, "es");
  if (porCurso !== 0) return porCurso;
  return a.nombre.localeCompare(b.nombre, "es");
});
```

Un comparador debe ser coherente: comparar el mismo par debe mantener el sentido, y elementos equivalentes deben producir cero.

## Encadenar un pipeline

```js
const totalDeAprobados = alumnos
  .filter(alumno => alumno.nota >= 6)
  .map(alumno => alumno.nota)
  .reduce((suma, nota) => suma + nota, 0);
```

Se lee como una secuencia:

```text
seleccionar → transformar → acumular
```

Cada etapa debería tener una responsabilidad. Si el callback es complejo, nombralo:

```js
const estaAprobado = alumno => alumno.nota >= 6;
const obtenerNota = alumno => alumno.nota;
const sumar = (a, b) => a + b;

const total = alumnos
  .filter(estaAprobado)
  .map(obtenerNota)
  .reduce(sumar, 0);
```

No extraigas una función si el nombre no agrega información y solo obliga a saltar por el archivo.

## Composición de funciones

```js
const recortar = texto => texto.trim();
const minusculas = texto => texto.toLowerCase();
const quitarEspacios = texto => texto.replaceAll(" ", "-");

const slug = texto => quitarEspacios(minusculas(recortar(texto)));
```

Una utilidad de composición de izquierda a derecha:

```js
const pipe = (...funciones) => valor =>
  funciones.reduce((actual, funcion) => funcion(actual), valor);

const crearSlug = pipe(recortar, minusculas, quitarEspacios);
```

Para funciones con errores, asincronía o varios parámetros, una utilidad demasiado genérica puede ocultar el flujo. La composición explícita sigue siendo válida.

## Negar y especializar predicados

```js
const negar = predicado => valor => !predicado(valor);

const esPar = numero => numero % 2 === 0;
const esImpar = negar(esPar);
```

Combinar:

```js
const y = (...predicados) => valor =>
  predicados.every(predicado => predicado(valor));

const esAdulto = persona => persona.edad >= 18;
const estaActivo = persona => persona.activo;
const puedeIngresar = y(esAdulto, estaActivo);
```

Mantené estas abstracciones si el vocabulario del dominio las vuelve legibles.

## Equivalencias aproximadas con LINQ

Para quien viene de C#:

| LINQ | JavaScript |
|---|---|
| `Where` | `filter` |
| `Select` | `map` |
| `Aggregate` | `reduce` |
| `Any` | `some` |
| `All` | `every` |
| `FirstOrDefault` | `find` con `undefined` |
| `SelectMany` | `flatMap` |
| `Skip` | `slice(inicio)` |
| `Take` | `slice(0, cantidad)` |
| `Distinct` | `new Set(valores)` |
| `OrderBy` | `toSorted(comparador)` |

Ejemplos:

```js
const suma = numeros.reduce((a, b) => a + b, 0);

const promedio = numeros.length === 0
  ? null
  : suma / numeros.length;

const pagina = items.slice(desde, desde + cantidad);

const distintos = [...new Set(valores)];
```

Las equivalencias son semánticas, no idénticas. LINQ sobre `IEnumerable` suele ser diferido; los métodos de arrays de JavaScript son inmediatos.

## Evaluación inmediata y arrays intermedios

```js
const resultado = datos
  .filter(condicion)
  .map(transformacion)
  .slice(0, 10);
```

`filter` recorre y crea un array; `map` vuelve a recorrer y crea otro; `slice` crea un tercero. Para colecciones habituales, el costo puede ser irrelevante y la claridad valiosa.

Si una medición demuestra un problema, un solo bucle evita intermedios:

```js
const resultado = [];

for (const dato of datos) {
  if (!condicion(dato)) continue;
  resultado.push(transformacion(dato));
  if (resultado.length === 10) break;
}
```

La versión también deja de recorrer al obtener diez resultados, algo que el pipeline de arrays no logra antes de filtrar y mapear todo.

## Evaluación diferida con generadores

```js
function* filtrar(iterable, predicado) {
  for (const valor of iterable) {
    if (predicado(valor)) yield valor;
  }
}

function* transformar(iterable, funcion) {
  for (const valor of iterable) {
    yield funcion(valor);
  }
}

function* tomar(iterable, cantidad) {
  if (cantidad <= 0) return;

  let usados = 0;
  for (const valor of iterable) {
    yield valor;
    usados += 1;
    if (usados === cantidad) return;
  }
}
```

```js
const pares = filtrar(rango(1, 1_000_000), n => n % 2 === 0);
const cuadrados = transformar(pares, n => n * n);
const primeros = [...tomar(cuadrados, 5)];
```

Solo se producen los valores consumidos. La evaluación diferida agrega complejidad; usala para secuencias grandes, infinitas o costosas, no como ritual.

## Callbacks reciben más de un argumento

```js
["10", "10", "10"].map(parseInt);
```

Puede producir `[10, NaN, 2]` porque `map` pasa `(valor, indice)` y `parseInt` interpreta el segundo argumento como base.

```js
["10", "10", "10"].map(texto => parseInt(texto, 10));
```

No pases una función existente como callback sin comprobar que su firma sea compatible.

## Flechas y `return`

```js
const correcto = numeros.map(numero => numero * 2);

const tambienCorrecto = numeros.map(numero => {
  return numero * 2;
});

const incorrecto = numeros.map(numero => {
  numero * 2;
}); // [undefined, ...]
```

Las llaves eliminan el retorno implícito.

## Caso integrador

```js
function resumirVentas(ventas) {
  const validas = ventas.filter(venta =>
    Number.isFinite(venta.precio) &&
    Number.isSafeInteger(venta.cantidad) &&
    venta.cantidad > 0
  );

  const detalle = validas.map(venta => ({
    id: venta.id,
    vendedor: venta.vendedor,
    total: venta.precio * venta.cantidad
  }));

  const totalGeneral = detalle.reduce(
    (suma, venta) => suma + venta.total,
    0
  );

  const porVendedor = detalle.reduce((mapa, venta) => {
    mapa.set(
      venta.vendedor,
      (mapa.get(venta.vendedor) ?? 0) + venta.total
    );
    return mapa;
  }, new Map());

  return {
    validas: detalle,
    descartadas: ventas.length - validas.length,
    totalGeneral,
    porVendedor
  };
}
```

Las etapas separan validación, proyección y agregación. La mutación del `Map` es local y no cambia la entrada.

## Errores frecuentes

- llamar “pura” a una función que lee reloj, azar o estado global;
- copiar solo el array y luego mutar objetos compartidos;
- usar `reduce` para cualquier problema aunque oculte la intención;
- olvidar `return` en una flecha con llaves;
- pasar callbacks con una firma incompatible, como `parseInt` directo a `map`;
- suponer evaluación diferida en métodos de array;
- construir muchos intermedios en una ruta medida como crítica;
- intentar eliminar todos los efectos en lugar de aislarlos.

## Para recordar

- Pureza e inmutabilidad reducen dependencias y cambios invisibles.
- Los efectos son necesarios; concentrarlos en los bordes vuelve comprobable el núcleo.
- `map`, `filter`, `reduce`, `find`, `some` y `every` responden preguntas diferentes.
- Los métodos de array son inmediatos; generadores y otros iterables permiten evaluación diferida.
- Elegí la abstracción más clara y optimizá después de medir.
