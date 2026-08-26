# El tipo symbol en JavaScript

Programación IV: Desarrollo Web — Etapa 1, fundamentos técnicos
Apunte complementario de la unidad de JavaScript

Cuando vimos los tipos básicos dejamos uno afuera. Los seis que ya conocés guardan un dato: un número guarda una cantidad, una cadena guarda texto, un booleano guarda una respuesta. El séptimo no guarda ningún dato. Guarda una identidad.

Ese es `symbol`, y este apunte trata sobre dos cosas. Primero, qué problema resuelve un valor que no vale por su contenido sino por ser él mismo. Segundo, los símbolos especiales, que son el mecanismo con el que JavaScript te deja modificar el comportamiento del propio lenguaje.

Guardá esta idea para el final, porque es la conclusión: los símbolos especiales son lo más parecido que tiene JavaScript a las interfaces de C#.

## El problema que resuelve

Supongamos que escribís una librería de caché. Recibís objetos de otra persona y necesitás marcarlos con un identificador interno.

```js
const usuario = { nombre: "Ada", email: "ada@ejemplo.com" };

usuario.id = 42; // tu marca interna
```

El código funciona hasta que alguien te pasa un objeto que ya tiene un `id`. Ahí lo pisás. Y aunque elijas un nombre más raro, como `__cacheId__`, seguís apostando a que nadie más eligió el mismo.

El problema de fondo es que las claves de un objeto son cadenas, y dos cadenas iguales son la misma clave. No hay forma de fabricar un nombre y garantizar que sea tuyo.

Salvo que el nombre no sea una cadena:

```js
const idCache = Symbol("idCache");

usuario[idCache] = 42;
```

Ahora la clave no es el texto "idCache". Es un valor único que existe en tu módulo. Nadie puede escribirlo por accidente, porque no se puede escribir: solo se puede tener una referencia a él.

## Crear un símbolo

Un símbolo se crea llamando a la función `Symbol`:

```js
const s1 = Symbol();
const s2 = Symbol("descripción para depurar");

typeof s2; // "symbol"
s2.description; // "descripción para depurar"
s2.toString(); // "Symbol(descripción para depurar)"
```

La descripción es opcional y sirve solo para leer mejor los mensajes de error y la consola. No participa de la identidad:

```js
Symbol("id") === Symbol("id"); // false
```

Esas son dos llamadas, así que son dos símbolos distintos, aunque digan lo mismo. Un símbolo solo es igual a sí mismo.

No se usa `new`:

```js
new Symbol(); // TypeError: Symbol is not a constructor
```

Es un primitivo, no un objeto, igual que un número o un booleano. La diferencia es que no hay literal para escribirlo. No existe algo como `42` o `"hola"` para los símbolos. La única forma de obtener uno es llamar a la función y guardar el resultado.

Acordate del modelo mental de la clase de variables: la variable no es una caja, es una flecha que apunta a un valor. Con los símbolos eso se vuelve literal. El valor no tiene contenido que mirar, así que lo único que existe es la flecha. Si perdés la referencia, perdiste el símbolo para siempre.

## No se convierte solo a texto

Este es el punto donde el tipo sorprende:

```js
const s = Symbol("hola");

console.log("valor: " + s); // TypeError
console.log(`valor: ${s}`); // TypeError

console.log(String(s)); // "Symbol(hola)"
console.log(s.toString()); // "Symbol(hola)"
console.log(s); // funciona: console.log no concatena
```

Es el único primitivo que se niega a la conversión implícita a cadena. Y es a propósito.

Pensá qué pasaría si se convirtiera solo. Escribís `objeto["" + miSimbolo]` por descuido y en vez de un error obtenés una propiedad con la clave `"Symbol(hola)"`, que es una cadena común y corriente. Perdiste la unicidad sin enterarte. El lenguaje prefiere gritar.

La conversión explícita con `String` sí funciona, porque ahí estás diciendo que sabés lo que hacés. La conversión a número no funciona nunca:

```js
Number(s); // TypeError
Boolean(s); // true, todos los símbolos son truthy
```

## Discretos, no privados

En JavaScript solo hay dos tipos de clave de propiedad: cadenas y símbolos. Los índices numéricos de un arreglo también son cadenas por debajo.

Un símbolo se usa como clave con la sintaxis de índice, y también dentro de un literal de objeto entre corchetes:

```js
const interno = Symbol("interno");

const config = {
  host: "localhost",
  puerto: 5432,
  [interno]: "esto no se serializa",
};

config[interno]; // "esto no se serializa"
```

Las propiedades con clave de símbolo son invisibles para casi todos los recorridos:

```js
for (const clave in config) console.log(clave); // host, puerto
Object.keys(config); // ["host", "puerto"]
JSON.stringify(config); // {"host":"localhost","puerto":5432}
```

Pero no están escondidas. Quien las busque, las encuentra:

```js
Object.getOwnPropertySymbols(config); // [Symbol(interno)]
Reflect.ownKeys(config); // ["host", "puerto", Symbol(interno)]
```

De ahí el título de la sección. Un símbolo no te da privacidad: te da discreción. Si lo que querés es que un campo sea inaccesible desde afuera, usá campos privados de clase con `#`, que sí son inalcanzables.

Hay una excepción que sorprende y conviene tener presente: la copia sí los arrastra.

```js
const copia = { ...config };
Object.getOwnPropertySymbols(copia); // [Symbol(interno)]
```

Tanto el operador de propagación como `Object.assign` copian las propiedades de símbolo propias y enumerables. Solo la serialización las ignora.

## El registro global de símbolos

A veces necesitás lo contrario de la unicidad: que dos partes del sistema obtengan el mismo símbolo sin compartir una variable. Para eso está el registro global.

```js
const a = Symbol.for("agenda.id");
const b = Symbol.for("agenda.id");

a === b; // true
Symbol.keyFor(a); // "agenda.id"
Symbol.keyFor(Symbol("agenda.id")); // undefined
```

`Symbol.for` busca la clave en un registro global y devuelve el símbolo existente, o crea uno nuevo si no está. `Symbol.keyFor` hace el camino inverso, y devuelve `undefined` si el símbolo no vino del registro.

Sirve cuando dos copias de la misma librería conviven en un proyecto, o cuando una página y un iframe tienen que ponerse de acuerdo. La convención es prefijar la clave con el nombre del paquete, porque el registro es global de verdad y ahí las colisiones vuelven a existir.

## Los símbolos especiales

Hasta acá los símbolos servían para que vos evitaras colisiones. Ahora viene el uso que justifica el tipo.

JavaScript tiene un puñado de símbolos ya creados, guardados como propiedades de la función `Symbol`. Se llaman símbolos bien conocidos. Cada uno marca un punto donde el lenguaje pregunta antes de actuar. Si tu objeto tiene una propiedad con ese símbolo, el motor la usa en vez de su comportamiento por omisión.

Acá está el paralelo con lo que ya saben de Programación III. En C#, para que un objeto se pueda recorrer con `foreach`, implementás `IEnumerable<T>`. Para que se pueda liberar con `using`, implementás `IDisposable`. El compilador reconoce la interfaz y habilita la sintaxis.

JavaScript no tiene interfaces. Lo que tiene son símbolos bien conocidos. Implementar `Symbol.iterator` es lo que en C# sería implementar `IEnumerable<T>`: la sintaxis del lenguaje empieza a funcionar sobre tu objeto.

Antes de ES6 esto se hacía con nombres mágicos, como `toString` y `valueOf`. El problema es evidente: si tu objeto necesitaba una propiedad llamada `toString` para otra cosa, estabas en problemas. Los símbolos resolvieron eso de raíz.

## Symbol.iterator

Es el más importante de todos, y ya lo venís usando sin saberlo.

```js
const rango = {
  desde: 1,
  hasta: 5,

  [Symbol.iterator]() {
    let actual = this.desde;
    const hasta = this.hasta;

    return {
      next: () =>
        actual <= hasta
          ? { value: actual++, done: false }
          : { value: undefined, done: true },
    };
  },
};
```

Con eso, un objeto cualquiera pasa a funcionar en todos los lugares donde esperabas un arreglo:

```js
for (const n of rango) console.log(n); // 1 2 3 4 5

[...rango]; // [1, 2, 3, 4, 5]
Array.from(rango); // [1, 2, 3, 4, 5]
Math.max(...rango); // 5

const [primero, segundo] = rango; // 1, 2
```

El contrato es simple. El método devuelve un objeto con un método `next`, y cada llamada a `next` devuelve un objeto con `value` y `done`. Nada más.

Con un generador queda mucho más corto, porque el generador arma ese objeto por vos:

```js
const rango = {
  desde: 1,
  hasta: 5,

  *[Symbol.iterator]() {
    for (let n = this.desde; n <= this.hasta; n++) yield n;
  },
};
```

Ahora mirá para atrás. Los arreglos, las cadenas, los `Set` y los `Map` que vimos en la clase de tipos compuestos se recorren con `for...of` porque todos traen `Symbol.iterator` implementado. No es una regla del `for...of`: es una propiedad de esos objetos.

Y por eso `for...in` no sirve para lo mismo. `for...in` recorre las claves de un objeto y no consulta ningún símbolo. Son dos mecanismos distintos que se parecen en la sintaxis.

## Symbol.asyncIterator

La versión asincrónica del mismo contrato. El método devuelve promesas en lugar de valores, y se recorre con `for await`:

```js
const cuentaRegresiva = {
  async *[Symbol.asyncIterator]() {
    for (let n = 3; n > 0; n--) {
      await new Promise((listo) => setTimeout(listo, 1000));
      yield n;
    }
  },
};

for await (const n of cuentaRegresiva) console.log(n); // 3, 2, 1
```

Lo vas a volver a ver cuando trabajemos con respuestas HTTP que llegan de a pedazos. Un cuerpo de respuesta se lee así.

## Symbol.toPrimitive

Este conecta directo con la clase de conversión de tipos. Cuando JavaScript necesita un primitivo y le diste un objeto, primero consulta este símbolo.

```js
class Dinero {
  constructor(monto, moneda) {
    this.monto = monto;
    this.moneda = moneda;
  }

  [Symbol.toPrimitive](contexto) {
    if (contexto === "number") return this.monto;
    return `${this.moneda} ${this.monto.toFixed(2)}`;
  }
}

const precio = new Dinero(1500, "ARS");

+precio; // 1500
precio * 2; // 3000
`${precio}`; // "ARS 1500.00"
precio + ""; // "ARS 1500.00"
```

El parámetro que recibe el método dice para qué se está pidiendo la conversión, y tiene tres valores posibles:

- `"number"` cuando la operación es aritmética, como `+valor`, `valor * 2` o una comparación con `<`
- `"string"` cuando se necesita texto, como en una interpolación o en `String(valor)`
- `"default"` cuando el operador acepta cualquiera de los dos, que en la práctica es el `+` binario y el `==`

Sin este símbolo, el motor usa `valueOf` y `toString` en un orden que depende del contexto. Con él, no hay ambigüedad: `Symbol.toPrimitive` le gana a los dos.

Si venís de C#, esto es una conversión implícita definida por el usuario, con la diferencia de que acá el mismo método atiende todos los destinos y se entera del contexto por parámetro.

## Symbol.toStringTag

Define la etiqueta que aparece en la representación interna de un objeto:

```js
Object.prototype.toString.call([]); // "[object Array]"
Object.prototype.toString.call(new Map()); // "[object Map]"

class Agenda {
  get [Symbol.toStringTag]() {
    return "Agenda";
  }
}

Object.prototype.toString.call(new Agenda()); // "[object Agenda]"
String(new Agenda()); // "[object Agenda]"
```

Es el mecanismo detrás del viejo truco de usar `Object.prototype.toString.call(valor)` para distinguir tipos que `typeof` no distingue, porque `typeof` devuelve `"object"` para un arreglo, una fecha y un mapa por igual.

## Symbol.hasInstance

Redefine qué contesta `instanceof`:

```js
class Par {
  static [Symbol.hasInstance](valor) {
    return typeof valor === "number" && valor % 2 === 0;
  }
}

4 instanceof Par; // true
7 instanceof Par; // false
```

Fijate que `4` no es un objeto y nunca fue construido con `Par`. Normalmente `instanceof` recorre la cadena de prototipos, pero acá esa pregunta la contestás vos. Es como poder redefinir el operador `is` de C#.

Usalo con cuidado. Un `instanceof` que miente es difícil de depurar justamente porque nadie sospecha del operador.

## Symbol.dispose

Es el más nuevo y el que más les va a sonar. Marca cómo se libera un recurso cuando sale de alcance, y se combina con la declaración `using`:

```js
class Conexion {
  constructor(nombre) {
    this.nombre = nombre;
    console.log("abro", nombre);
  }

  [Symbol.dispose]() {
    console.log("cierro", this.nombre);
  }
}

function consultar() {
  using conexion = new Conexion("agenda");
  // ... trabajo con la conexión
} // acá se llama solo a Symbol.dispose
```

Es `IDisposable` con `using`, tal cual lo vieron en C#, y llega quince años más tarde. También existe `Symbol.asyncDispose`, que se usa con `await using` para liberaciones que devuelven una promesa.

Es reciente: funciona en Node 24 y en los navegadores actuales, pero todavía no lo vas a encontrar en código viejo.

## Los que quedan

Los demás símbolos bien conocidos aparecen poco en código de aplicación, pero conviene saber qué operación intercepta cada uno:

| Símbolo | Qué operación intercepta |
|---|---|
| `Symbol.iterator` | `for...of`, propagación, desestructuración |
| `Symbol.asyncIterator` | `for await...of` |
| `Symbol.toPrimitive` | conversión a número o a cadena |
| `Symbol.toStringTag` | `Object.prototype.toString` |
| `Symbol.hasInstance` | `instanceof` |
| `Symbol.dispose` | `using` |
| `Symbol.asyncDispose` | `await using` |
| `Symbol.species` | qué constructor usan `map`, `filter` y `slice` |
| `Symbol.isConcatSpreadable` | si `concat` aplana el valor |
| `Symbol.match` | `String.prototype.match` |
| `Symbol.matchAll` | `String.prototype.matchAll` |
| `Symbol.replace` | `String.prototype.replace` |
| `Symbol.search` | `String.prototype.search` |
| `Symbol.split` | `String.prototype.split` |
| `Symbol.unscopables` | qué nombres ignora la sentencia `with` |

El resto de esta sección los explica uno por uno. No hace falta que los memorices: alcanza con que los reconozcas cuando aparezcan en el código de una librería.

### Symbol.species

Decide qué constructor usan los métodos que devuelven una colección nueva. En un arreglo son `map`, `filter`, `slice`, `splice` y `concat`. En una promesa son `then`, `catch` y `finally`.

El problema aparece cuando extendés un tipo del lenguaje:

```js
class Registro extends Array {}

const r = Registro.from([1, 2, 3]);

r instanceof Registro; // true
r.map((n) => n * 2) instanceof Registro; // true
```

Por omisión, `map` construye el resultado con el constructor del objeto original, así que te devuelve un `Registro` y no un arreglo común. Casi siempre es lo que querés. A veces no, porque tu constructor pide argumentos que `map` no le va a pasar, o porque el resultado ya no es un registro sino una lista de números.

`Symbol.species` te deja cambiar esa decisión, y se declara como un getter estático:

```js
class Registro extends Array {
  static get [Symbol.species]() {
    return Array;
  }
}

const r = Registro.from([1, 2, 3]);

r instanceof Registro; // true
r.map((n) => n * 2) instanceof Registro; // false
r.map((n) => n * 2) instanceof Array; // true
```

El objeto original sigue siendo un `Registro`. Lo que cambió es el tipo de las copias que produce.

Es el símbolo menos querido de la lista. Complica los motores, casi nadie lo usa, y hubo propuestas en el comité para sacarlo del lenguaje. Sigue ahí porque quitarlo rompería código existente.

### Symbol.isConcatSpreadable

Controla si `concat` aplana un valor o lo agrega entero. La regla por omisión mira si el valor es un arreglo:

```js
[1, 2].concat([3, 4]); // [1, 2, 3, 4]  lo aplana
[1, 2].concat("34"); // [1, 2, "34"]  lo agrega entero
```

Este símbolo invierte cada caso. Un arreglo que no quiere aplanarse:

```js
const bloque = [3, 4];
bloque[Symbol.isConcatSpreadable] = false;

[1, 2].concat(bloque); // [1, 2, [3, 4]]
```

Y un objeto que no es un arreglo pero quiere comportarse como uno:

```js
const falsoArreglo = {
  0: "a",
  1: "b",
  length: 2,
  [Symbol.isConcatSpreadable]: true,
};

["inicio"].concat(falsoArreglo); // ["inicio", "a", "b"]
```

Para que el segundo caso funcione, el objeto necesita la propiedad `length` y claves numéricas, porque `concat` recorre de `0` a `length - 1`.

Ojo con el alcance: este símbolo solo lo consulta `concat`. Ni `flat`, ni el operador de propagación, ni `for...of` lo miran.

### Los cinco símbolos de expresiones regulares

Empecemos con una pregunta que parece tonta. Cuando escribís `"a1b2".split(/\d/)`, quién hace el trabajo.

La respuesta intuitiva es que lo hace `split`, y que las expresiones regulares son un caso especial contemplado adentro del método. La respuesta real es la contraria: `split` delega.

`String.prototype.split` recibe el separador y antes de hacer nada le pregunta si tiene un método en `Symbol.split`. Si lo tiene, lo llama y devuelve lo que ese método devuelva. Solo si no lo tiene, aplica el algoritmo de separar por texto.

Por eso funciona con expresiones regulares: `RegExp.prototype` implementa `Symbol.split`. La expresión regular no es un caso especial dentro de `split`, es un objeto que implementa el símbolo. Y como el símbolo es público, cualquier objeto tuyo puede hacer lo mismo.

Los cinco métodos de `String` que delegan así son estos:

| Llamada | Símbolo que consulta | Qué recibe | Qué debe devolver |
|---|---|---|---|
| `texto.match(x)` | `x[Symbol.match]` | el texto | las coincidencias o `null` |
| `texto.matchAll(x)` | `x[Symbol.matchAll]` | el texto | un iterador de coincidencias |
| `texto.replace(x, r)` | `x[Symbol.replace]` | el texto y el reemplazo | el texto resultante |
| `texto.search(x)` | `x[Symbol.search]` | el texto | el índice, o `-1` |
| `texto.split(x, n)` | `x[Symbol.split]` | el texto y el límite | un arreglo |

Un ejemplo que resuelve algo real. Separar por varios caracteres a la vez es incómodo con una expresión regular cuando los separadores vienen en tiempo de ejecución, porque hay que escaparlos. Con `Symbol.split` armás un objeto que lo hace:

```js
class Separadores {
  constructor(...caracteres) {
    this.caracteres = caracteres;
  }

  [Symbol.split](texto) {
    let partes = [texto];

    for (const caracter of this.caracteres) {
      partes = partes.flatMap((parte) => parte.split(caracter));
    }

    return partes.filter((parte) => parte !== "");
  }
}

"uno,dos;tres|cuatro".split(new Separadores(",", ";", "|"));
// ["uno", "dos", "tres", "cuatro"]
```

El objeto no es una expresión regular, no hereda de `RegExp` y no tiene nada que ver con ella. Encaja igual, porque el contrato es el símbolo y no el tipo. Esto es exactamente lo mismo que pasaba con `Symbol.iterator`, y es la idea que se repite en todo el apunte.

`Symbol.match` tiene además un segundo trabajo, y es el que explica un error raro. Los métodos `startsWith`, `endsWith` e `includes` se niegan a recibir una expresión regular:

```js
"decí hola".startsWith(/hola/); // TypeError
```

Para averiguar si el argumento es una expresión regular, el lenguaje no mira el tipo: mira si tiene `Symbol.match`. Así que se puede engañar:

```js
const re = /hola/;
re[Symbol.match] = false;

"decí hola".startsWith(re); // false, y ya no lanza error
"/hola/".startsWith(re); // true
```

Al desactivar el símbolo, el objeto deja de ser reconocido como expresión regular, y `startsWith` lo convierte a texto: compara contra la cadena `"/hola/"`. Es una curiosidad, no una técnica. Sirve para entender que en JavaScript los tipos del lenguaje se reconocen por lo que implementan, no por lo que son.

### Symbol.unscopables

Este es el único de la lista que no vas a usar nunca, y aun así vale la pena por lo que enseña.

Declara qué propiedades de un objeto quedan afuera cuando ese objeto entra en un bloque `with`. La sentencia `with` mete las propiedades de un objeto en el alcance del bloque, está prohibida en modo estricto, y como los módulos son siempre estrictos, en la práctica ya no existe.

El problema que resolvió fue de compatibilidad. Cuando ES6 agregó métodos nuevos a `Array.prototype`, como `includes`, `values` o `keys`, había páginas en producción con código así:

```js
const includes = "soy una variable externa";
const numeros = [1, 2, 3];

with (numeros) {
  console.log(includes);
}
```

Antes de ES6 ese `includes` se resolvía a la variable externa, porque los arreglos no tenían un método con ese nombre. El día que el método existió, el mismo código pasó a resolverse al método y las páginas se rompieron.

La solución fue una lista de excepciones publicada en el propio prototipo:

```js
Array.prototype[Symbol.unscopables];
// { at: true, copyWithin: true, entries: true, fill: true,
//   find: true, findIndex: true, flat: true, flatMap: true,
//   includes: true, keys: true, values: true, ... }
```

Con esa lista, `with` saltea esos nombres y el ejemplo de arriba vuelve a imprimir la variable externa.

Guardá el caso como ejemplo de la primera clase, cuando hablamos de que JavaScript no puede romper la web. Agregar un método a un prototipo del lenguaje parece gratis y no lo es. El comité tuvo que inventar un símbolo entero para poder agregar `includes` a los arreglos sin voltear sitios que ya andaban.

## El tipo symbol en TypeScript

Cuando pasemos a TypeScript vas a encontrar dos tipos, y la diferencia importa:

```ts
let cualquiera: symbol = Symbol();

const CLAVE: unique symbol = Symbol("clave");
```

El tipo `symbol` describe a cualquier símbolo. El tipo `unique symbol` describe a uno en particular, y es el único que podés usar como clave en la declaración de un tipo:

```ts
interface Config {
  host: string;
  [CLAVE]: string;
}
```

`unique symbol` solo se puede declarar con `const` y asignando directamente `Symbol()` o `Symbol.for()`. La razón es que TypeScript necesita poder rastrear ese símbolo hasta una única declaración, y una variable reasignable no le da esa garantía.

## Cuándo usarlo

Usá símbolos para tres cosas:

- implementar un símbolo bien conocido, que es de lejos el caso más frecuente
- agregar metadatos a objetos que no son tuyos, sin riesgo de pisar nada
- guardar estado interno que no querés que aparezca en el JSON

Evitalos para otras tres:

- privacidad real, porque `Object.getOwnPropertySymbols` los expone y los campos `#` no
- valores que tengan que sobrevivir a `JSON.stringify` o a `structuredClone`, porque no sobreviven
- enumeraciones, donde un objeto congelado con `Object.freeze` o un tipo de TypeScript rinde más

La prueba rápida es preguntarte si el valor tiene que cruzar la frontera del proceso. Si va a viajar por la red o a guardarse en disco, un símbolo es la herramienta equivocada, porque su identidad vive solo en la memoria de este programa.

## Ejercicios

1. Escribí un objeto `semana` que se pueda recorrer con `for...of` y devuelva los siete días. Resolvelo primero con un objeto iterador escrito a mano y después con un generador.
2. Explicá sin ejecutar qué imprime `console.log(Symbol("a") === Symbol("a"))` y qué imprime `console.log(Symbol.for("a") === Symbol.for("a"))`.
3. Agregá a un objeto una propiedad con clave de símbolo y comprobá con código que no aparece en `Object.keys`, que no aparece en `JSON.stringify` y que sí aparece en la copia hecha con propagación.
4. Escribí una clase `Temperatura` que devuelva los grados como número y una cadena con el símbolo de grado como texto, usando `Symbol.toPrimitive`. Probala con `+t` y con una interpolación.
5. Escribí una clase `Vocal` que haga que `"a" instanceof Vocal` devuelva `true` y `"b" instanceof Vocal` devuelva `false`.
6. Tomás encuentra este código y no entiende por qué falla: `const s = Symbol("x"); console.log("El símbolo es " + s);`. Explicale qué pasa, por qué el lenguaje lo decidió así y cómo se arregla.
