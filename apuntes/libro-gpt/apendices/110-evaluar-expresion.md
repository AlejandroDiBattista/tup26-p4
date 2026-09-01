# Apéndice B. Evaluar expresiones mediante pilas

## Idea central

**Una expresión aritmética puede evaluarse de izquierda a derecha si se
guardan en pilas los valores y los operadores que todavía no pueden
resolverse.** La prioridad de los operadores determina cuándo se retira una
operación pendiente; los paréntesis funcionan como fronteras que aíslan cada
grupo.

Este apéndice conecta varios conceptos del libro:

- clases y encapsulamiento;
- arrays usados como estructuras de datos;
- recorridos de izquierda a derecha;
- condiciones y ciclos;
- funciones como valores;
- invariantes y validación de entradas.

La implementación es deliberadamente pequeña. Evalúa números positivos o
negativos escritos como literales y los operadores binarios `+`, `-`, `*` y
`/`. No pretende ser un parser completo de JavaScript.

## B.1. El problema: respetar la estructura de la expresión

Evaluar esta expresión estrictamente de izquierda a derecha produce un
resultado incorrecto:

```text
3 + 4 * 2
```

La multiplicación debe resolverse antes que la suma, por lo que el resultado
correcto es `11`, no `14`. Los paréntesis agregan otra regla:

```text
3 + 4 * (2 - 1)  →  7
```

El algoritmo necesita conservar información mientras recorre los tokens:

1. los números se convierten en valores;
2. los operadores quedan pendientes;
3. un operador nuevo puede obligar a resolver el anterior;
4. un paréntesis de cierre resuelve todo el grupo que abrió el paréntesis;
5. al llegar al final se resuelven las operaciones que todavía quedan.

La estructura adecuada para ese comportamiento es una pila: el último
elemento que se guarda es el primero que se retira.

## B.2. Implementar una pila

Una pila expone dos operaciones principales:

- `push`, que agrega un elemento en el tope;
- `pop`, que retira y devuelve el elemento del tope.

También conviene poder consultar el tope sin retirarlo y saber si la pila está
vacía. La clase oculta cómo se representa la estructura: el resto del
programa solo depende de ese contrato.

```js
class Stack {
  constructor(maximo = 20) {
    this.elementos = new Array(maximo);
    this.contador = 0;
  }

  push(elemento) {
    if (this.contador === this.elementos.length) {
      throw new Error("La pila alcanzó su capacidad máxima");
    }

    this.elementos[this.contador] = elemento;
    this.contador += 1;
  }

  pop() {
    if (this.empty) {
      throw new Error("No se puede retirar un elemento de una pila vacía");
    }

    this.contador -= 1;
    const elemento = this.elementos[this.contador];
    this.elementos[this.contador] = undefined;
    return elemento;
  }

  get top() {
    if (this.empty) {
      return undefined;
    }

    return this.elementos[this.contador - 1];
  }

  get empty() {
    return this.contador === 0;
  }
}
```

El contador representa la próxima posición disponible. Por eso también
coincide con la cantidad de elementos almacenados:

```text
elementos: [A, B, C, _, _]
contador:              3
                         ↑ próxima posición disponible
```

En una pila no se accede a un elemento arbitrario. La única entrada válida es
el tope. Esta restricción permite razonar sobre el orden de procesamiento y
mantiene independiente la implementación interna.

## B.3. Dos pilas para una expresión

La evaluación usa dos pilas con responsabilidades diferentes:

| Pila | Contenido |
|---|---|
| `valores` | números y resultados parciales |
| `operadores` | operadores pendientes y paréntesis de apertura |

Cuando se resuelve una operación se retiran tres elementos:

1. el operador;
2. el operando derecho `b`;
3. el operando izquierdo `a`.

Después se calcula `a operador b` y se apila el resultado. El orden es
fundamental: `8 - 3` no es igual que `3 - 8`, y `8 / 2` no es igual que
`2 / 8`.

La tabla de prioridad expresa una regla del dominio, no una propiedad de la
pila:

```js
const prioridad = {
  "+": 1,
  "-": 1,
  "*": 2,
  "/": 2
};
```

## B.4. Recorrer y resolver

Antes de evaluar, la expresión se separa en tokens. Esta versión espera que
los paréntesis estén separados de los números y operadores:

```text
3 + 4 * ( 2 - 1 )
```

La expresión regular `/\s+/u` permite aceptar uno o varios espacios y también
saltos de línea. Los operadores se conservan como strings y los números se
convierten a `number`.

La función `resolver` implementa una única operación pendiente:

```js
function resolver(valores, operadores, operacion) {
  const operador = operadores.pop();
  const b = valores.pop();
  const a = valores.pop();
  valores.push(operacion[operador](a, b));
}
```

El algoritmo completo sigue estas reglas:

- número: se apila en `valores`;
- `(`: se apila en `operadores`;
- `)`: se resuelve hasta encontrar `(` y luego se descarta ese paréntesis;
- operador: se resuelven operadores pendientes de prioridad mayor o igual,
  siempre dentro del grupo actual, y después se apila el operador nuevo;
- fin: se resuelven todos los operadores restantes.

La condición “dentro del grupo actual” es importante. Un paréntesis de apertura
no es un operador y no debe compararse con la tabla de prioridades.

```js
function evaluar(expresion) {
  const texto = expresion.trim();

  if (texto === "") {
    throw new Error("La expresión no puede estar vacía");
  }

  const valores = new Stack();
  const operadores = new Stack();

  const prioridad = {
    "+": 1,
    "-": 1,
    "*": 2,
    "/": 2
  };

  const operacion = {
    "+": (a, b) => a + b,
    "-": (a, b) => a - b,
    "*": (a, b) => a * b,
    "/": (a, b) => a / b
  };

  const tokens = texto.split(/\s+/u).map((token) => {
    return Number.isNaN(Number(token)) ? token : Number(token);
  });

  for (const token of tokens) {
    if (typeof token === "number") {
      valores.push(token);
      continue;
    }

    if (token === "(") {
      operadores.push(token);
      continue;
    }

    if (token === ")") {
      while (!operadores.empty && operadores.top !== "(") {
        resolver(valores, operadores, operacion);
      }

      if (operadores.empty) {
        throw new Error("Hay un paréntesis de cierre sin apertura");
      }

      operadores.pop();
      continue;
    }

    if (!(token in prioridad)) {
      throw new Error(`Token no reconocido: ${token}`);
    }

    while (
      !operadores.empty &&
      operadores.top !== "(" &&
      prioridad[operadores.top] >= prioridad[token]
    ) {
      resolver(valores, operadores, operacion);
    }

    operadores.push(token);
  }

  while (!operadores.empty) {
    if (operadores.top === "(") {
      throw new Error("Hay un paréntesis de apertura sin cierre");
    }

    resolver(valores, operadores, operacion);
  }

  if (valores.contador !== 1) {
    throw new Error("La expresión no tiene una estructura válida");
  }

  return valores.pop();
}

console.log(evaluar("3 + 4 * ( 2 - 1 )"));
// 7
```

El analizador sigue suponiendo que la entrada tiene la forma esperada: un
número, un operador, otro número y así sucesivamente. Las comprobaciones
finales mejoran los mensajes de error, pero no convierten este código en un
parser general.

## B.5. Evaluación paso a paso

Consideremos la expresión:

```text
1 + 2 * ( 3 * 4 + 5 )
```

Sus tokens son:

```js
[1, "+", 2, "*", "(", 3, "*", 4, "+", 5, ")"]
```

En la tabla, la base de cada pila está a la izquierda y el tope está a la
derecha.

| Token | Acción | `valores` | `operadores` |
|---|---|---|---|
| Inicio | Ambas pilas están vacías | `[]` | `[]` |
| `1` | Apilar el número | `[1]` | `[]` |
| `+` | Apilar el operador | `[1]` | `[+]` |
| `2` | Apilar el número | `[1, 2]` | `[+]` |
| `*` | Tiene mayor prioridad; se apila | `[1, 2]` | `[+, *]` |
| `(` | Abrir un grupo | `[1, 2]` | `[+, *, (]` |
| `3` | Apilar el número | `[1, 2, 3]` | `[+, *, (]` |
| `*` | Apilar el operador del grupo | `[1, 2, 3]` | `[+, *, (, *]` |
| `4` | Apilar el número | `[1, 2, 3, 4]` | `[+, *, (, *]` |
| `+` | Resolver `3 * 4 = 12`; apilar `+` | `[1, 2, 12]` | `[+, *, (, +]` |
| `5` | Apilar el número | `[1, 2, 12, 5]` | `[+, *, (, +]` |
| `)` | Resolver `12 + 5 = 17`; retirar `(` | `[1, 2, 17]` | `[+, *]` |
| Fin | Resolver `2 * 17 = 34` | `[1, 34]` | `[+]` |
| Fin | Resolver `1 + 34 = 35` | `[35]` | `[]` |

El único valor restante es el resultado:

```js
evaluar("1 + 2 * ( 3 * 4 + 5 )"); // 35
```

## B.6. Qué queda fuera de esta versión

La implementación sirve para estudiar el mecanismo, pero tiene límites
explícitos:

- los tokens deben estar separados por espacios;
- no distingue entre resta binaria y signo unario;
- no admite funciones como `sin(2)`;
- no incorpora el operador de potencia ni otros operadores;
- no verifica de manera detallada si faltan operandos;
- la capacidad de cada pila es fija.

Por ejemplo, `-3 + 2` no se interpreta como una expresión con signo unario,
porque el primer token debería ser un número. Para soportarlo habría que
agregar una etapa de tokenización y decidir, según el token anterior, si `-`
es un operador binario o parte de un literal negativo.

Separar las etapas ayuda a extender el programa sin mezclar responsabilidades:

```text
texto → tokens → validación → evaluación → resultado
```

La evaluación también puede reemplazarse por el algoritmo de Shunting Yard,
que transforma la expresión infija en una expresión posfija. El enfoque de
este apéndice evita construir esa segunda representación para concentrarse en
el uso de las pilas.

## B.7. Complejidad

Cada token se apila y se retira una cantidad acotada de veces. Por lo tanto,
para `n` tokens:

- el tiempo es `O(n)`;
- el espacio adicional es `O(n)` en el peor caso.

La profundidad de los paréntesis y la cantidad de operadores pendientes son
los principales factores que determinan cuánto ocupan las pilas.

## Práctica guiada

Extendé el evaluador en etapas:

1. agregá el operador de módulo `%`;
2. permití expresiones con espacios irregulares y saltos de línea;
3. validá que cada operador tenga un operando a cada lado;
4. incorporá números decimales y notación científica;
5. soportá el signo unario en expresiones como `-3 * ( 2 + 1 )`;
6. aumentá la capacidad de las pilas a partir de una opción configurable;
7. escribí pruebas para prioridad, asociatividad, paréntesis desbalanceados y
   división por cero;
8. compará el resultado con una implementación independiente para un conjunto
   de expresiones pequeñas.

No uses `eval` como solución de producción. Puede servir como referencia
controlada en una prueba local, pero ejecuta código y no valida que la entrada
sea una expresión aritmética segura.

## Para recordar

- Una pila implementa el comportamiento “último en entrar, primero en salir”.
- `valores` conserva números y resultados parciales; `operadores` conserva
  operaciones pendientes.
- La prioridad determina cuándo resolver un operador.
- Los paréntesis detienen la resolución hasta cerrar el grupo correspondiente.
- En una operación, el segundo valor retirado es el operando izquierdo.
- La tokenización, la validación y la evaluación son responsabilidades
  diferentes.
- La versión presentada es didáctica y debe extenderse antes de aceptar
  entradas generales.
