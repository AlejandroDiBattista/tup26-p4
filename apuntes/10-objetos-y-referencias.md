# 10. Objetos, propiedades y referencias

## Idea central

**Un objeto reúne propiedades para representar una entidad, y las variables que lo contienen guardan referencias a esa entidad.** Para usar objetos con seguridad hay que distinguir clave de valor, identidad de contenido y copia superficial de copia profunda.

## Cuándo elegir un objeto

Un objeto es una buena representación cuando un dato tiene campos conocidos con significados diferentes:

```js
const alumno = {
  legajo: 12345,
  nombre: "Ana",
  regular: true
};
```

El orden de las propiedades no suele ser la operación principal. Consultamos por nombre, no por posición. Si las claves son datos dinámicos o de cualquier tipo, `Map` puede expresar mejor la colección.

## Crear objetos

El literal es la forma habitual:

```js
const vacio = {};

const producto = {
  codigo: "TEC-01",
  descripcion: "Teclado",
  precio: 25000
};
```

Las claves literales se interpretan como strings, salvo las calculadas con símbolos:

```js
const ejemplo = {
  10: "diez",
  "con espacios": true
};

Object.keys(ejemplo); // ["10", "con espacios"]
```

## Punto y corchetes

La notación de punto requiere un identificador conocido al escribir el programa:

```js
producto.precio;
producto.precio = 26000;
```

Los corchetes evalúan una expresión y permiten claves dinámicas:

```js
const campo = "precio";
producto[campo]; // 26000

producto["con espacios"] = "valor";
```

No confundas:

```js
producto.campo;  // busca literalmente "campo"
producto[campo]; // busca el valor de la variable campo
```

## Crear, actualizar y eliminar propiedades

```js
producto.stock = 10;
producto.precio = 27000;
delete producto.stock;
```

`delete` elimina la propiedad, no asigna `undefined`. En objetos con una forma estable, agregar y quitar campos constantemente puede complicar el contrato. A veces conviene conservar una propiedad opcional con `null`, si ese es el modelo acordado.

## Existencia de propiedades

```js
Object.hasOwn(producto, "precio"); // true
"precio" in producto;              // true
```

`in` considera la cadena de prototipos; `Object.hasOwn` solo las propiedades propias.

Leer una propiedad ausente devuelve `undefined`:

```js
producto.categoria; // undefined
```

Para acceso anidado opcional:

```js
const ciudad = alumno.direccion?.ciudad ?? "Sin informar";
```

No uses `?.` para ocultar una propiedad obligatoria. Validá la entidad al construirla o recibirla.

## Formas abreviadas

Si nombre de variable y propiedad coinciden:

```js
const nombre = "Ana";
const edad = 20;
const persona = { nombre, edad };
```

Los métodos tienen sintaxis abreviada:

```js
const contador = {
  valor: 0,
  incrementar() {
    this.valor += 1;
    return this.valor;
  }
};
```

Una función flecha no crea su propio `this` y no debe usarse como reemplazo automático de un método:

```js
const incorrecto = {
  valor: 1,
  leer: () => this.valor
};
```

## Claves calculadas

```js
const prefijo = "nota";
const indice = 1;

const registro = {
  [`${prefijo}${indice}`]: 8
};
```

Las claves calculadas son útiles al construir índices o adaptar datos, pero una proliferación de campos dinámicos puede indicar que corresponde un `Map` o una colección anidada.

## Recorrer propiedades

```js
Object.keys(producto);    // claves string propias y enumerables
Object.values(producto);  // valores
Object.entries(producto); // pares [clave, valor]
```

```js
for (const [clave, valor] of Object.entries(producto)) {
  console.log(clave, valor);
}
```

`Reflect.ownKeys` también incluye símbolos y claves no enumerables. La enumerabilidad y los descriptores son mecanismos avanzados; para modelos comunes, los literales producen propiedades propias, enumerables, modificables y configurables.

## Orden de propiedades

JavaScript define un orden de enumeración: índices enteros válidos primero en orden numérico, luego strings en orden de inserción y finalmente símbolos en orden de inserción. Aun así, un objeto modela campos, no una secuencia. Si el orden es esencial para la operación, usá un array o `Map`.

## Identidad y asignación por referencia

```js
const original = { nombre: "Ana" };
const alias = original;

alias.nombre = "Beatriz";
original.nombre; // "Beatriz"
```

Ambas variables contienen una referencia al mismo objeto.

La igualdad compara identidad:

```js
({ x: 1 }) === ({ x: 1 }); // false

const a = { x: 1 };
const b = a;
a === b; // true
```

JavaScript no incluye una igualdad profunda general porque “mismo contenido” depende del dominio: ¿importa el orden de arrays?, ¿los prototipos?, ¿fechas?, ¿símbolos?, ¿ciclos?

## Copia superficial con spread

```js
const copia = { ...original };
copia === original; // false
```

El spread copia propiedades propias y enumerables, incluidas claves symbol, pero solo una capa:

```js
const configuracion = {
  tema: "claro",
  usuario: { nombre: "Ana" }
};

const copia = { ...configuracion };
copia.usuario === configuracion.usuario; // true
```

Modificar `copia.usuario.nombre` también afecta al original.

Para una actualización anidada sin mutar:

```js
const actualizada = {
  ...configuracion,
  usuario: {
    ...configuracion.usuario,
    nombre: "Beatriz"
  }
};
```

Solo se copian las ramas que cambian; las demás pueden compartirse de manera segura si no se mutan.

## Precedencia del spread

Las propiedades posteriores reemplazan anteriores:

```js
const base = { tema: "claro", idioma: "es" };

const configuracion = {
  ...base,
  tema: "oscuro"
};
```

El orden inverso perdería el valor personalizado:

```js
const incorrecta = {
  tema: "oscuro",
  ...base // vuelve a "claro"
};
```

## `Object.assign`

```js
const combinado = Object.assign({}, base, { tema: "oscuro" });
```

El primer argumento es el destino y se modifica. El spread suele ser más legible para crear un objeto nuevo. Ambos realizan copia superficial y activan getters al leer valores del origen.

## Copia profunda con `structuredClone`

```js
const clon = structuredClone(configuracion);
clon.usuario === configuracion.usuario; // false
```

Puede clonar muchos valores integrados, referencias repetidas y estructuras cíclicas. No clona funciones, símbolos como valores ni todos los objetos de plataforma, y los prototipos personalizados no necesariamente se conservan como espera una clase.

No copies profundamente por rutina. Puede ser costoso y esconder un diseño con demasiado estado compartido. Copiá según el límite que realmente necesite aislamiento.

El truco `JSON.parse(JSON.stringify(objeto))` pierde `undefined`, símbolos, `bigint`, fechas como objetos, `Map`, `Set`, valores no finitos y ciclos. No es un clon general.

## Desestructuración

```js
const { nombre, edad } = persona;
```

Renombrar una variable local:

```js
const { nombre: nombreCompleto } = persona;
```

Valor predeterminado ante `undefined`:

```js
const { idioma = "es" } = configuracion;
```

Resto de propiedades:

```js
const { id, ...datosEditables } = alumno;
```

Anidada:

```js
const {
  direccion: { ciudad }
} = alumno;
```

La desestructuración anidada falla si `direccion` falta. Se puede proporcionar un objeto predeterminado:

```js
const { direccion: { ciudad } = {} } = alumno;
```

Pero `ciudad` quedará `undefined`; si es obligatoria, corresponde validar.

## Parámetros desestructurados

```js
function presentar({ nombre, edad = 0 }) {
  return `${nombre} tiene ${edad} años`;
}
```

Para permitir una llamada sin argumento:

```js
function configurar({ tema = "claro" } = {}) {
  return { tema };
}
```

Esta forma es cómoda para opciones, pero puede esconder que falta una entidad obligatoria. No agregues `= {}` automáticamente a todos los parámetros.

## Métodos estáticos útiles

```js
Object.fromEntries([
  ["nombre", "Ana"],
  ["edad", 20]
]);

Object.freeze(producto);
Object.seal(producto);
Object.preventExtensions(producto);
```

`freeze` impide cambios en las propiedades directas, pero es superficial:

```js
const congelado = Object.freeze({ interior: { valor: 1 } });
congelado.interior.valor = 2; // el objeto interior no está congelado
```

En modo estricto, algunas modificaciones prohibidas lanzan error; en otros contextos pueden fallar silenciosamente. La inmutabilidad por convención y una arquitectura clara siguen siendo necesarias.

## JSON como formato, no como objeto JavaScript completo

```js
const texto = JSON.stringify(producto);
const recuperado = JSON.parse(texto);
```

JSON admite objetos, arrays, strings, números finitos, booleanos y `null`. No conserva métodos, prototipos, `undefined`, símbolos, `Map`, `Set`, `bigint` ni referencias compartidas. Al leer, validá de nuevo la estructura.

## Caso integrador: actualizar un perfil

```js
function actualizarPerfil(perfil, cambios) {
  if (!Object.hasOwn(cambios, "nombre") &&
      !Object.hasOwn(cambios, "preferencias")) {
    return perfil;
  }

  const actualizado = { ...perfil };

  if (Object.hasOwn(cambios, "nombre")) {
    const nombre = cambios.nombre.trim();
    if (!nombre) throw new TypeError("Nombre vacío");
    actualizado.nombre = nombre;
  }

  if (Object.hasOwn(cambios, "preferencias")) {
    actualizado.preferencias = {
      ...perfil.preferencias,
      ...cambios.preferencias
    };
  }

  return actualizado;
}
```

La función distingue propiedades ausentes, valida los cambios y copia solamente los niveles modificados.

## Errores frecuentes

- creer que asignar copia el objeto;
- comparar contenido con `===`;
- esperar copia profunda de spread u `Object.assign`;
- poner una clave dinámica con punto y leer literalmente otro campo;
- invertir el orden de los spreads;
- desestructurar un camino opcional sin valor predeterminado o validación;
- usar JSON como clon universal;
- creer que `freeze` congela todo el grafo.

## Para recordar

- Un objeto representa campos nombrados; una variable guarda una referencia a él.
- Punto sirve para claves conocidas; corchetes, para claves calculadas.
- Identidad no equivale a igualdad de contenido.
- Spread, `Object.assign` y `freeze` actúan superficialmente.
- La actualización inmutable copia el camino modificado y puede compartir el resto.
