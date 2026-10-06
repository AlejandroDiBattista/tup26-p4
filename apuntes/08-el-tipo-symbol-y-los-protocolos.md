# 8. El tipo `symbol` y los protocolos de JavaScript

## Idea central

**Un `symbol` representa una identidad única; usado como clave, evita colisiones, y mediante los símbolos conocidos permite que un objeto participe en protocolos internos del lenguaje.** No es una cadena especial ni un mecanismo de privacidad.

Hay dos usos que conviene separar:

1. símbolos creados por la aplicación para obtener claves únicas;
2. símbolos conocidos definidos por JavaScript para personalizar iteración, coerción y otras operaciones.

## Crear una identidad

```js
const id = Symbol();
const idConDescripcion = Symbol("id de alumno");
```

Cada llamada produce un valor diferente:

```js
Symbol("id") === Symbol("id"); // false
```

La descripción es información de depuración, no identidad:

```js
const clave = Symbol("interno");
clave.description; // "interno"
```

No se crea con `new`:

```js
// new Symbol(); // TypeError
```

`typeof` reconoce el tipo:

```js
typeof clave; // "symbol"
```

## Símbolo y string son espacios de claves distintos

Un objeto puede tener una propiedad string y otra symbol con descripciones parecidas:

```js
const ID = Symbol("id");

const alumno = {
  id: "visible",
  [ID]: 123
};

alumno.id;  // "visible"
alumno[ID]; // 123
```

Esto evita que dos módulos elijan accidentalmente el mismo nombre textual:

```js
const METADATOS_MODULO_A = Symbol("metadatos");
const METADATOS_MODULO_B = Symbol("metadatos");
```

Aunque compartan descripción, no colisionan.

## Enumeración y reflexión

Las claves symbol no aparecen en enumeraciones habituales:

```js
Object.keys(alumno);        // ["id"]
Object.entries(alumno);     // [["id", "visible"]]
JSON.stringify(alumno);     // '{"id":"visible"}'
```

Pueden descubrirse:

```js
Object.getOwnPropertySymbols(alumno); // [ID]
Reflect.ownKeys(alumno);              // ["id", ID]
```

Por eso un símbolo reduce interferencias accidentales, pero no oculta información frente a quien posee el objeto. Para privacidad real dentro del lenguaje usá cierres o campos privados de clase.

El spread y `Object.assign` sí copian propiedades symbol propias y enumerables:

```js
const copia = { ...alumno };
copia[ID]; // 123
```

## El registro global con `Symbol.for`

`Symbol.for(clave)` consulta un registro y reutiliza la identidad asociada:

```js
const uno = Symbol.for("universidad.usuario");
const dos = Symbol.for("universidad.usuario");

uno === dos; // true
```

`Symbol.keyFor` recupera la clave de un símbolo registrado:

```js
Symbol.keyFor(uno); // "universidad.usuario"
Symbol.keyFor(Symbol("local")); // undefined
```

Elegí según la coordinación necesaria:

- `Symbol()` para identidad local y aislada;
- `Symbol.for()` para compartir identidad mediante un nombre acordado.

El registro amplía el alcance del acuerdo. Usá prefijos con contexto para evitar que bibliotecas distintas adopten la misma clave por accidente.

## Conversión y límites

La conversión explícita a string funciona:

```js
const marca = Symbol("marca");
String(marca);        // "Symbol(marca)"
marca.toString();     // "Symbol(marca)"
```

La concatenación implícita lanza error:

```js
// "clave=" + marca; // TypeError
```

Un símbolo no se convierte a número y no tiene un orden relacional significativo:

```js
// Number(marca); // TypeError
```

Estas restricciones protegen su función de identidad.

## Símbolos conocidos: acuerdos con el lenguaje

JavaScript expone símbolos estáticos como `Symbol.iterator`. No se crean para una aplicación concreta: son claves compartidas que el motor consulta durante determinadas operaciones.

Un objeto implementa un **protocolo** cuando proporciona la propiedad esperada con el contrato esperado.

## `Symbol.iterator`: hacer un objeto iterable

`for...of`, spread, desestructuración y constructores como `Array.from` consumen iterables.

El protocolo requiere un método que devuelva un iterador. El iterador tiene `next()`, que devuelve objetos `{ value, done }`.

```js
const rango = {
  desde: 3,
  hasta: 5,

  [Symbol.iterator]() {
    let actual = this.desde;
    const fin = this.hasta;

    return {
      next() {
        if (actual <= fin) {
          return { value: actual++, done: false };
        }

        return { value: undefined, done: true };
      }
    };
  }
};

[...rango]; // [3, 4, 5]
```

Un generador implementa el mismo contrato con menos infraestructura:

```js
const rangoSimple = {
  desde: 3,
  hasta: 5,

  *[Symbol.iterator]() {
    for (let n = this.desde; n <= this.hasta; n += 1) {
      yield n;
    }
  }
};
```

Arrays, strings, `Map`, `Set` y muchos objetos de plataforma ya son iterables. Un objeto común no lo es:

```js
// for (const valor of { a: 1 }) {} // TypeError
```

Se puede recorrer `Object.entries(objeto)` porque ese método produce un array iterable.

## Un iterable puede ofrecer recorridos diferentes

La elección de lo que se produce forma parte de la API:

```js
class ListaDeAlumnos {
  #alumnos = [];

  agregar(alumno) {
    this.#alumnos.push(alumno);
  }

  *[Symbol.iterator]() {
    yield* this.#alumnos;
  }
}
```

Podría producir alumnos, ids o pares. El nombre y la documentación deben hacer previsible el recorrido predeterminado.

## `Symbol.asyncIterator`: valores a través del tiempo

Un iterable asincrónico devuelve promesas o usa un generador asincrónico:

```js
const paginas = {
  async *[Symbol.asyncIterator]() {
    let pagina = 1;

    while (true) {
      const resultado = await cargarPagina(pagina);
      if (resultado.items.length === 0) return;

      yield resultado.items;
      pagina += 1;
    }
  }
};

for await (const items of paginas) {
  procesar(items);
}
```

El protocolo expresa una secuencia cuyos elementos requieren espera, como páginas remotas, archivos por fragmentos o eventos.

## `Symbol.toPrimitive`: decidir una coerción

```js
const dinero = {
  centavos: 1250,

  [Symbol.toPrimitive](hint) {
    if (hint === "number") return this.centavos;
    return `$${(this.centavos / 100).toFixed(2)}`;
  }
};

Number(dinero); // 1250
String(dinero); // "$12.50"
```

El método recibe una sugerencia:

- `"number"` para contextos numéricos;
- `"string"` para conversión explícita a string;
- `"default"` para operaciones como `+` o igualdad flexible.

Debe devolver un primitivo; devolver un objeto causa `TypeError`.

La coerción implícita debe ser inequívoca. Para dinero, devolver centavos ante `Number` puede sorprender a quien esperaba unidades monetarias. Métodos `aCentavos()` y `formatear()` suelen ser más explícitos.

## `Symbol.toStringTag`: describir una clase de objeto

```js
const registro = {
  get [Symbol.toStringTag]() {
    return "RegistroDeAlumnos";
  }
};

Object.prototype.toString.call(registro);
// "[object RegistroDeAlumnos]"
```

Muchas APIs integradas usan etiquetas como `Map`, `Set` o `ArrayBuffer`. Es una ayuda descriptiva, no una validación de seguridad.

## `Symbol.hasInstance`: personalizar `instanceof`

```js
class EnteroPositivo {
  static [Symbol.hasInstance](valor) {
    return Number.isInteger(valor) && valor > 0;
  }
}

3 instanceof EnteroPositivo;   // true
-1 instanceof EnteroPositivo;  // false
```

Aunque es posible, una función `esEnteroPositivo(valor)` comunica mejor la intención cuando no existe una relación real de instancias.

## Símbolos vinculados con expresiones regulares

Los métodos de string consultan protocolos:

- `Symbol.match` para `match`;
- `Symbol.matchAll` para `matchAll`;
- `Symbol.replace` para `replace`;
- `Symbol.search` para `search`;
- `Symbol.split` para `split`.

Esto explica por qué esos métodos aceptan objetos `RegExp` y por qué un objeto especializado podría personalizar la operación.

```js
const censor = {
  [Symbol.replace](texto, reemplazo) {
    return texto.replaceAll("secreto", reemplazo);
  }
};

"dato secreto".replace(censor, "***"); // "dato ***"
```

Es una demostración de protocolo; para una operación concreta, una función nombrada puede ser más directa.

## `Symbol.isConcatSpreadable`

`Array.prototype.concat` normalmente expande arrays y conserva otros objetos como una sola posición. Esta clave puede modificar la decisión:

```js
const grupo = {
  0: "a",
  1: "b",
  length: 2,
  [Symbol.isConcatSpreadable]: true
};

[0].concat(grupo); // [0, "a", "b"]
```

El objeto debe tener índices y `length` coherentes con el comportamiento esperado.

## `Symbol.species`

Algunas clases integradas consultan `Symbol.species` para decidir qué constructor utilizar en resultados derivados:

```js
class MiArray extends Array {
  static get [Symbol.species]() {
    return Array;
  }
}

const valores = new MiArray(1, 2, 3);
const dobles = valores.map(x => x * 2);

dobles instanceof MiArray; // false
dobles instanceof Array;   // true
```

Es un mecanismo avanzado de interoperabilidad entre subclases y métodos que crean colecciones.

## `Symbol.unscopables`

Controla qué propiedades quedan excluidas dentro de la sentencia histórica `with`. El modo estricto y los módulos prohíben `with`, por lo que este símbolo existe principalmente para compatibilidad del lenguaje. No debería orientar diseños nuevos.

## Un ejemplo integrador

```js
function crearRegistro() {
  const entradas = new Map();
  const VERSION = Symbol("version interna");

  return {
    [VERSION]: 1,

    guardar(clave, valor) {
      entradas.set(clave, valor);
    },

    obtener(clave) {
      return entradas.get(clave);
    },

    get [Symbol.toStringTag]() {
      return "Registro";
    },

    *[Symbol.iterator]() {
      yield* entradas.entries();
    }
  };
}

const registro = crearRegistro();
registro.guardar("tema", "oscuro");

for (const [clave, valor] of registro) {
  console.log(clave, valor);
}
```

El símbolo local evita colisión, la clausura encapsula el `Map`, la etiqueta mejora la descripción y el iterador integra el objeto con el lenguaje.

## Errores frecuentes

- creer que dos símbolos con la misma descripción son iguales;
- tratar la descripción como una clave recuperable;
- usar símbolos como seguridad o privacidad;
- esperar que `Object.keys` o JSON los incluyan;
- concatenarlos implícitamente con strings;
- implementar un protocolo sin respetar exactamente su contrato;
- personalizar coerción o `instanceof` cuando una función nombrada sería más clara.

## Para recordar

- `Symbol()` crea identidad única; la descripción no participa de la igualdad.
- `Symbol.for()` coordina identidades mediante un registro compartido.
- Una clave symbol evita colisiones y enumeración ordinaria, pero puede descubrirse.
- Los símbolos conocidos son puntos de extensión que implementan protocolos.
- Aprendé primero `Symbol.iterator`; los demás se entienden como variantes del mismo acuerdo entre objeto y lenguaje.
