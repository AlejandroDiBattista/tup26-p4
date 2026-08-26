# El tipo `Symbol` en JavaScript

`Symbol` es un tipo primitivo de JavaScript cuyo objetivo principal es crear **identificadores únicos**.

Aunque dos símbolos tengan la misma descripción, siguen siendo distintos:

```js
const a = Symbol("id");
const b = Symbol("id");

console.log(a === b); // false
```

La cadena `"id"` es solamente una descripción útil para depuración. No define la identidad del símbolo.

## 1. Crear símbolos

Se crean con la función `Symbol()`:

```js
const id = Symbol();
const nombre = Symbol("nombre");
```

Podemos inspeccionarlos:

```js
console.log(typeof id);            // "symbol"
console.log(nombre);               // Symbol(nombre)
console.log(nombre.description);   // "nombre"
```

`Symbol` es uno de los tipos primitivos de JavaScript:

```text
undefined
null
boolean
number
bigint
string
symbol
```

y, por supuesto, también existe el tipo `object`.

## 2. ¿Para qué sirve un símbolo?

Principalmente para crear **claves de propiedades que no colisionen con otras propiedades**.

```js
const id = Symbol("id");

const persona = {
    nombre: "Ana",
    [id]: 1234
};

console.log(persona.nombre); // Ana
console.log(persona[id]);    // 1234
```

Los corchetes indican que usamos el valor almacenado en `id` como clave.

## 3. Una propiedad Symbol no es una propiedad String

```js
const id = Symbol("id");

const persona = {
    id: 10,
    [id]: 20
};

console.log(persona.id);  // 10
console.log(persona[id]); // 20
```

Conceptualmente:

```text
persona
│
├── "id"       → 10
│
└── Symbol(id) → 20
```

Son claves completamente diferentes.

## 4. El problema que resuelve

Supongamos que una biblioteca recibe objetos creados por otra parte del programa y quiere agregar información interna:

```js
function procesar(usuario) {
    usuario.estadoInterno = "procesado";
}
```

Podría haber una colisión:

```js
const usuario = {
    nombre: "Ana",
    estadoInterno: "otra cosa"
};
```

Con un símbolo:

```js
const estadoInterno = Symbol("estadoInterno");

function procesar(usuario) {
    usuario[estadoInterno] = "procesado";
}
```

Ahora ambas propiedades pueden coexistir.

## 5. Los símbolos son únicos

```js
Symbol("x") === Symbol("x")
```

da:

```js
false
```

Cada llamada crea un símbolo distinto, aunque la descripción sea la misma.

## 6. Registro global: `Symbol.for()`

JavaScript dispone de un registro global de símbolos:

```js
const a = Symbol.for("usuario");
const b = Symbol.for("usuario");

console.log(a === b); // true
```

`Symbol.for()` busca primero si ya existe un símbolo con esa clave. Si existe, lo devuelve. Si no existe, lo crea.

### `Symbol()` versus `Symbol.for()`

```js
const a = Symbol("x");
const b = Symbol("x");

console.log(a === b); // false
```

pero:

```js
const a = Symbol.for("x");
const b = Symbol.for("x");

console.log(a === b); // true
```

## 7. `Symbol.keyFor()`

Permite recuperar la clave de un símbolo creado mediante `Symbol.for()`:

```js
const s = Symbol.for("usuario");

console.log(Symbol.keyFor(s));
// "usuario"
```

Pero:

```js
const s = Symbol("usuario");

console.log(Symbol.keyFor(s));
// undefined
```

porque ese símbolo no pertenece al registro global.

## 8. Las propiedades Symbol no aparecen normalmente al enumerar

```js
const secreto = Symbol("secreto");

const usuario = {
    nombre: "Ana",
    edad: 25,
    [secreto]: 123
};
```

```js
console.log(Object.keys(usuario));
// ["nombre", "edad"]
```

Tampoco aparecen en un `for...in`.

Eso no significa que sean privadas. Podemos obtenerlas con:

```js
Object.getOwnPropertySymbols(usuario);
```

## 9. `Symbol` no es un mecanismo de seguridad

Una propiedad Symbol puede descubrirse:

```js
const symbols = Object.getOwnPropertySymbols(usuario);
```

Por eso `Symbol` sirve para:

- evitar colisiones;
- agregar metadatos;
- implementar protocolos internos;
- personalizar comportamiento de objetos.

No sirve para proteger información secreta.

# 10. Los símbolos especiales de JavaScript

JavaScript define una serie de símbolos especiales denominados **Well-known Symbols**.

Entre los principales:

```js
Symbol.iterator
Symbol.asyncIterator
Symbol.toPrimitive
Symbol.toStringTag
Symbol.hasInstance
Symbol.match
Symbol.replace
Symbol.search
Symbol.split
Symbol.species
Symbol.isConcatSpreadable
Symbol.unscopables
```

Estos símbolos permiten que los objetos participen de protocolos internos del lenguaje.

## 11. `Symbol.iterator`

Determina cómo se recorre un objeto.

Cuando escribimos:

```js
for (const x of objeto) {
    // ...
}
```

JavaScript busca:

```js
objeto[Symbol.iterator]
```

Ejemplo:

```js
const numeros = {
    desde: 1,
    hasta: 5,

    [Symbol.iterator]() {
        let actual = this.desde;
        const hasta = this.hasta;

        return {
            next() {
                if (actual <= hasta) {
                    return {
                        value: actual++,
                        done: false
                    };
                }

                return {
                    done: true
                };
            }
        };
    }
};
```

Ahora:

```js
for (const n of numeros) {
    console.log(n);
}
```

imprime:

```text
1
2
3
4
5
```

Conceptualmente:

```text
objeto
   │
   ▼
objeto[Symbol.iterator]()
   │
   ▼
iterator
   │
   ▼
next()
   │
   ├── { value: ..., done: false }
   ├── { value: ..., done: false }
   └── { done: true }
```

## 12. Por qué los arrays funcionan con `for...of`

Los arrays implementan:

```js
Array.prototype[Symbol.iterator]
```

Por eso pueden recorrerse con `for...of`, spread y destructuring.

```js
const numeros = [10, 20, 30];

const iterador = numeros[Symbol.iterator]();

console.log(iterador.next());
console.log(iterador.next());
console.log(iterador.next());
console.log(iterador.next());
```

## 13. `Symbol.asyncIterator`

Es el equivalente asincrónico de `Symbol.iterator`.

Se usa con:

```js
for await (const elemento of fuente) {
    // ...
}
```

Ejemplo:

```js
const fuente = {
    async *[Symbol.asyncIterator]() {
        yield 10;
        yield 20;
        yield 30;
    }
};

for await (const x of fuente) {
    console.log(x);
}
```

## 14. `Symbol.toPrimitive`

Permite controlar cómo un objeto se convierte en un valor primitivo.

```js
const producto = {
    nombre: "Monitor",
    precio: 500,

    [Symbol.toPrimitive](hint) {
        if (hint === "number") {
            return this.precio;
        }

        return this.nombre;
    }
};
```

```js
console.log(+producto);      // 500
console.log(`${producto}`); // Monitor
```

El parámetro `hint` puede ser, según el contexto:

```text
"number"
"string"
"default"
```

## 15. Relación con la coerción de tipos

Cuando JavaScript necesita convertir un objeto a un valor primitivo puede consultar:

```js
objeto[Symbol.toPrimitive]
```

Conceptualmente:

```text
objeto
   │
   ▼
Symbol.toPrimitive
   │
   ▼
primitivo
   │
   ▼
operación
```

Por eso este símbolo permite intervenir en la coerción implícita.

## 16. `Symbol.toStringTag`

Permite personalizar la identificación de un objeto:

```js
const usuario = {
    [Symbol.toStringTag]: "Usuario"
};

console.log(
    Object.prototype.toString.call(usuario)
);
```

Resultado:

```text
[object Usuario]
```

## 17. `Symbol.hasInstance`

Permite personalizar el comportamiento del operador `instanceof`.

```js
class Adulto {
    static [Symbol.hasInstance](objeto) {
        return objeto.edad >= 18;
    }
}

const ana = {
    edad: 25
};

console.log(ana instanceof Adulto);
// true
```

Conceptualmente:

```text
ana instanceof Adulto
        │
        ▼
Adulto[Symbol.hasInstance](ana)
```

## 18. Símbolos vinculados con expresiones regulares

Los principales son:

```js
Symbol.match
Symbol.replace
Symbol.search
Symbol.split
```

Permiten personalizar cómo un objeto participa en operaciones como:

```js
texto.match(objeto)
texto.replace(objeto, ...)
texto.search(objeto)
texto.split(objeto)
```

Ejemplo:

```js
const buscador = {
    [Symbol.match](texto) {
        return texto.includes("JavaScript");
    }
};

console.log(
    "Me gusta JavaScript".match(buscador)
);
```

## 19. `Symbol.isConcatSpreadable`

Controla si un objeto se expande al utilizar `Array.prototype.concat()`.

```js
const objeto = {
    0: "A",
    1: "B",
    length: 2,

    [Symbol.isConcatSpreadable]: true
};

const resultado = [1, 2].concat(objeto);

console.log(resultado);
// [1, 2, "A", "B"]
```

## 20. `Symbol.species`

Permite controlar qué constructor se utiliza cuando una operación crea objetos derivados.

```js
class MiArray extends Array {
    static get [Symbol.species]() {
        return Array;
    }
}
```

Es un mecanismo avanzado y poco frecuente en código cotidiano.

## 21. `Symbol.unscopables`

Está relacionado con `with` y permite indicar qué propiedades no deben quedar disponibles dentro de ese bloque.

Como `with` está desaconsejado y no puede utilizarse en modo estricto, este símbolo tiene principalmente interés histórico.

## 22. Los símbolos más importantes para aprender

### Fundamentales

```js
Symbol.iterator
Symbol.asyncIterator
Symbol.toPrimitive
Symbol.toStringTag
```

### Para entender mecanismos internos

```js
Symbol.hasInstance
Symbol.match
Symbol.replace
Symbol.search
Symbol.split
```

### Más especializados

```js
Symbol.species
Symbol.isConcatSpreadable
Symbol.unscopables
```

## 23. Una forma poderosa de entender `Symbol`

La idea profunda no es solamente que `Symbol` genera claves únicas.

Los símbolos permiten que JavaScript tenga **protocolos sin depender de nombres de propiedades comunes**.

Si el lenguaje hubiera usado:

```js
objeto.iterator()
```

podría entrar en conflicto con un método del usuario llamado `iterator`.

En cambio usa:

```js
objeto[Symbol.iterator]()
```

Ese identificador pertenece al protocolo del lenguaje y no colisiona con:

```js
objeto.iterator
```

## 24. `Symbol` como mecanismo de protocolo

Podemos pensar un objeto así:

```text
┌────────────────────────────┐
│ objeto                     │
├────────────────────────────┤
│ propiedades normales       │
│                            │
│ nombre                     │
│ edad                       │
│ imprimir                   │
├────────────────────────────┤
│ protocolos especiales      │
│                            │
│ [Symbol.iterator]          │
│ [Symbol.toPrimitive]       │
│ [Symbol.toStringTag]       │
│ ...                        │
└────────────────────────────┘
```

Las propiedades normales describen los datos y comportamientos de nuestra aplicación.

Los Well-known Symbols permiten decirle al lenguaje:

> Cuando quieras hacer determinada operación conmigo, hacela de esta manera.

## 25. Ejemplo integrador

```js
class Rango {
    constructor(desde, hasta) {
        this.desde = desde;
        this.hasta = hasta;
    }

    *[Symbol.iterator]() {
        for (
            let n = this.desde;
            n <= this.hasta;
            n++
        ) {
            yield n;
        }
    }

    [Symbol.toPrimitive](hint) {
        if (hint === "number") {
            return this.hasta - this.desde + 1;
        }

        return `${this.desde}..${this.hasta}`;
    }

    get [Symbol.toStringTag]() {
        return "Rango";
    }
}
```

```js
const rango = new Rango(3, 6);
```

Podemos recorrerlo:

```js
for (const n of rango) {
    console.log(n);
}
```

Convertirlo a número:

```js
console.log(+rango);
// 4
```

Convertirlo a texto:

```js
console.log(`${rango}`);
// 3..6
```

E inspeccionarlo:

```js
console.log(
    Object.prototype.toString.call(rango)
);
// [object Rango]
```

# Idea para recordar

`Symbol` tiene dos usos relacionados pero diferentes.

Primero:

```js
const id = Symbol("id");
```

nos da una **clave única**, útil para evitar colisiones.

Segundo, los símbolos especiales como:

```js
Symbol.iterator
Symbol.toPrimitive
Symbol.hasInstance
```

actúan como **ganchos del lenguaje**.

Los Well-known Symbols constituyen un mecanismo mediante el cual los objetos pueden participar y personalizar protocolos internos de JavaScript.
