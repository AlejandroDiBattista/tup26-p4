# 11. `Map`, `Set` y colecciones especializadas

## Idea central

**`Map` modela asociaciones dinámicas y `Set` modela pertenencia sin repetidos.** Ambos aceptan valores de cualquier tipo, preservan el orden de inserción y ofrecen una API de colección más explícita que un objeto o un array usados fuera de su propósito.

La elección se resume así:

```text
entidad con campos conocidos → Object
secuencia ordenada           → Array
clave dinámica → valor       → Map
pertenencia única            → Set
```

## `Map`: pares clave–valor

```js
const alumnosPorLegajo = new Map();

alumnosPorLegajo.set(101, { nombre: "Ana" });
alumnosPorLegajo.set(102, { nombre: "Luis" });
```

Operaciones fundamentales:

```js
alumnosPorLegajo.get(101); // { nombre: "Ana" }
alumnosPorLegajo.has(103); // false
alumnosPorLegajo.size;     // 2
alumnosPorLegajo.delete(102); // true si existía
alumnosPorLegajo.clear();     // elimina todos
```

`set` devuelve el propio mapa, por lo que puede encadenarse:

```js
const estados = new Map()
  .set("P", "pendiente")
  .set("A", "aprobado");
```

## Crear un `Map` desde pares

```js
const mapa = new Map([
  ["tema", "oscuro"],
  ["idioma", "es"]
]);
```

Cada elemento exterior debe ser iterable con al menos dos posiciones. `Object.entries` permite convertir un objeto con claves string:

```js
const desdeObjeto = new Map(Object.entries({ a: 1, b: 2 }));
```

La conversión inversa funciona si las claves pueden convertirse apropiadamente en propiedades:

```js
const objeto = Object.fromEntries(desdeObjeto);
```

Si las claves son objetos, la conversión a objeto común pierde su identidad como claves y no es equivalente.

## Claves de cualquier tipo

```js
const porObjeto = new Map();
const boton = { id: "guardar" };

porObjeto.set(boton, { clicks: 0 });
porObjeto.get(boton); // funciona con la misma referencia
porObjeto.get({ id: "guardar" }); // undefined
```

La igualdad de claves sigue una comparación de identidad para objetos y una semántica similar a `SameValueZero` para primitivos. `NaN` puede funcionar como clave y `0`/`-0` se consideran la misma.

## Ausencia y valores `undefined`

`get` devuelve `undefined` tanto cuando falta la clave como cuando su valor es `undefined`:

```js
const mapa = new Map([["presente", undefined]]);

mapa.get("presente"); // undefined
mapa.get("ausente");  // undefined
```

Usá `has` para distinguir:

```js
mapa.has("presente"); // true
mapa.has("ausente");  // false
```

## Recorrer un `Map`

El iterador predeterminado produce pares en orden de inserción:

```js
for (const [clave, valor] of estados) {
  console.log(clave, valor);
}
```

También existen:

```js
estados.keys();
estados.values();
estados.entries();
```

Los tres devuelven iteradores, no arrays. Se pueden materializar:

```js
const claves = [...estados.keys()];
```

`forEach` usa el orden `(valor, clave, mapa)`, diferente al orden visual de los pares:

```js
estados.forEach((valor, clave) => {
  console.log(clave, valor);
});
```

## Patrones productivos con `Map`

### Crear un índice

```js
const porLegajo = new Map(
  alumnos.map(alumno => [alumno.legajo, alumno])
);
```

Una búsqueda pasa de recorrer el array a consultar por clave. El costo de construir el índice se justifica cuando habrá muchas búsquedas o actualizaciones.

### Contar frecuencias

```js
function contar(valores) {
  const frecuencias = new Map();

  for (const valor of valores) {
    frecuencias.set(valor, (frecuencias.get(valor) ?? 0) + 1);
  }

  return frecuencias;
}
```

### Agrupar

```js
function agruparPor(valores, obtenerClave) {
  const grupos = new Map();

  for (const valor of valores) {
    const clave = obtenerClave(valor);
    const grupo = grupos.get(clave) ?? [];
    grupo.push(valor);
    grupos.set(clave, grupo);
  }

  return grupos;
}
```

El array local se muta dentro de la función, pero el estado queda encapsulado y se devuelve al final. Este uso controlado puede ser más eficiente que copiar cada grupo en cada iteración.

## Actualización inmutable de un `Map`

```js
const actualizado = new Map(original);
actualizado.set(clave, valor);
```

La estructura exterior es nueva, pero claves y valores internos mantienen sus referencias. Igual que con arrays y objetos, se trata de una copia superficial.

## `Set`: valores únicos

```js
const etiquetas = new Set(["js", "node", "js"]);

etiquetas.size;       // 2
etiquetas.add("web");
etiquetas.has("node"); // true
etiquetas.delete("js");
etiquetas.clear();
```

`add` devuelve el propio conjunto y puede encadenarse.

Un `Set` mantiene el orden de la primera inserción. Agregar nuevamente un valor no lo mueve.

## Eliminar duplicados

```js
const unicos = [...new Set([1, 2, 2, 3, 1])];
// [1, 2, 3]
```

Con objetos, la unicidad usa identidad:

```js
const a = { id: 1 };
const b = { id: 1 };

new Set([a, b]).size; // 2
new Set([a, a]).size; // 1
```

Para deduplicar por una propiedad, indexá por esa clave:

```js
const porId = new Map(items.map(item => [item.id, item]));
const unicosPorId = [...porId.values()];
```

Decidí qué aparición gana. El ejemplo conserva la última para cada id.

## Recorrer un `Set`

```js
for (const etiqueta of etiquetas) {
  console.log(etiqueta);
}
```

`values()` y `keys()` son equivalentes por compatibilidad con `Map`. `entries()` produce pares `[valor, valor]`.

## Operaciones de conjuntos

Podemos expresar unión, intersección, diferencia y diferencia simétrica de forma portable:

```js
function union(a, b) {
  return new Set([...a, ...b]);
}

function interseccion(a, b) {
  return new Set([...a].filter(valor => b.has(valor)));
}

function diferencia(a, b) {
  return new Set([...a].filter(valor => !b.has(valor)));
}

function diferenciaSimetrica(a, b) {
  return union(diferencia(a, b), diferencia(b, a));
}
```

Para elegir qué conjunto recorrer en una intersección grande, conviene usar el más pequeño.

Subconjunto:

```js
function esSubconjunto(a, b) {
  return [...a].every(valor => b.has(valor));
}
```

## Actualización inmutable de un `Set`

```js
const actualizado = new Set(original);
actualizado.add(nuevoValor);
```

La copia conserva referencias a objetos internos. Si los objetos se modifican, ambos conjuntos observan el cambio.

## Elegir entre objeto y `Map`

Preferí un objeto cuando:

- representa una entidad con campos conocidos;
- necesitás notación literal y desestructuración;
- el formato natural de intercambio es JSON;
- las claves son nombres de propiedades.

Preferí `Map` cuando:

- las claves nacen de los datos;
- no son solo strings o símbolos;
- consultás `size`, agregás y eliminás con frecuencia;
- querés iteración directa de pares;
- necesitás distinguir claramente la colección de una entidad.

No elijas solo por una afirmación genérica de rendimiento. Medí si el volumen realmente lo exige; la semántica correcta suele ser el criterio principal.

## Elegir entre array y `Set`

Preferí array cuando:

- importan posición y duplicados;
- transformás toda la secuencia;
- necesitás índices y rangos.

Preferí `Set` cuando:

- la pregunta principal es pertenencia;
- los duplicados no tienen significado;
- agregás y quitás miembros.

Un `Set` no reemplaza un array para ordenar, acceder por índice o representar varias apariciones.

## `WeakMap`: asociar datos sin retener las claves

`WeakMap` acepta objetos y símbolos no registrados como claves. No impide que una clave objeto sea recolectada si no queda otra referencia fuerte:

```js
const metadatos = new WeakMap();

let elemento = { id: 1 };
metadatos.set(elemento, { seleccionado: true });
metadatos.get(elemento); // { seleccionado: true }

elemento = null;
// La entrada podrá desaparecer cuando el recolector lo determine.
```

No es iterable y no tiene `size`, porque exponer sus claves impediría una semántica previsible de recolección. Sirve para metadatos privados, cachés ligados a la vida de objetos y asociaciones que no deben prolongar esa vida.

## `WeakSet`: marcar objetos sin retenerlos

```js
const procesados = new WeakSet();
const tarea = {};

procesados.add(tarea);
procesados.has(tarea); // true
```

Comparte las limitaciones de no enumeración y claves débiles. Es adecuado para registrar pertenencia de objetos mientras esos objetos existan.

## Caso integrador: inscripciones

```js
function indexarInscripciones(inscripciones) {
  const porLegajo = new Map();
  const cursos = new Set();
  const duplicados = new Set();

  for (const inscripcion of inscripciones) {
    const { legajo, curso } = inscripcion;

    if (porLegajo.has(legajo)) duplicados.add(legajo);
    porLegajo.set(legajo, { ...inscripcion });
    cursos.add(curso);
  }

  return {
    porLegajo,
    cursos,
    duplicados,
    cantidadUnica: porLegajo.size
  };
}
```

El contrato decide que la última inscripción reemplaza a las anteriores y conserva una lista de legajos repetidos para informar el problema.

## Errores frecuentes

- usar `get` sin `has` cuando `undefined` es un valor posible;
- convertir un `Map` con claves objeto a un objeto común y esperar equivalencia;
- creer que `Set` elimina objetos con contenido igual;
- usar un objeto como diccionario dinámico sin considerar prototipos y tipos de clave;
- usar `Map` para una entidad fija y perder claridad de campos;
- esperar que una copia de `Map` o `Set` clone sus valores;
- intentar enumerar `WeakMap` o depender del momento de recolección.

## Para recordar

- `Map` expresa asociaciones dinámicas; `Set`, pertenencia única.
- Ambos preservan inserción y comparan objetos por identidad.
- `has` distingue ausencia de un valor `undefined` almacenado.
- Las conversiones con arrays y objetos son útiles, pero no siempre conservan la semántica de las claves.
- `WeakMap` y `WeakSet` vinculan información con la vida de objetos sin volverla enumerable.
