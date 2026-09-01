# 7. Conversión y coerción de tipos

## Idea central

**Los datos externos deben convertirse y validarse explícitamente una vez; dentro del programa conviene operar con tipos estables y evitar que la coerción decida reglas del dominio.** La coerción automática es parte de JavaScript y puede ser útil, pero resulta segura solo cuando conocemos qué conversión aplica cada contexto.

## Conversión explícita y coerción implícita

Una conversión explícita aparece en el código:

```js
const cantidad = Number(textoCantidad);
const etiqueta = String(numeroPedido);
const presente = Boolean(valor);
```

Una coerción ocurre porque una operación necesita otro tipo:

```js
"Total: " + 10; // convierte 10 a string
"6" - 1;        // convierte "6" a number
if (valor) {}   // convierte valor a boolean
```

La coerción no es aleatoria. Sigue algoritmos definidos por ECMAScript. El problema práctico aparece cuando el lector o la aplicación esperaban otro significado.

## Los bordes del sistema

Formularios, variables de entorno, argumentos de terminal, CSV y muchos atributos HTML llegan como texto. JSON conserva más tipos, pero sigue siendo una entrada no confiable.

```text
entrada externa → normalización → conversión → validación → dato interno
```

Ejemplo:

```js
function leerPuerto(texto) {
  const limpio = texto.trim();

  if (!/^\d+$/u.test(limpio)) {
    throw new TypeError("El puerto debe contener solo dígitos");
  }

  const puerto = Number(limpio);

  if (!Number.isInteger(puerto) || puerto < 1 || puerto > 65535) {
    throw new RangeError("El puerto debe estar entre 1 y 65535");
  }

  return puerto;
}
```

La regex decide la forma aceptada; `Number` convierte; la condición valida el rango del dominio.

## Convertir a string

```js
String(42);        // "42"
String(true);      // "true"
String(null);      // "null"
String(undefined); // "undefined"
String(10n);       // "10"
String(Symbol("x")); // "Symbol(x)"
```

Las plantillas y la concatenación también convierten muchos valores:

```js
`${42}`;      // "42"
"valor=" + 42; // "valor=42"
```

`valor.toString()` no funciona con `null` o `undefined` y puede aceptar una base para números:

```js
(255).toString(16); // "ff"
```

Los objetos usan protocolos de conversión que veremos más adelante: `Symbol.toPrimitive`, `valueOf` y `toString`.

## Convertir a número

`Number` intenta convertir el valor completo:

```js
Number("42");       // 42
Number("  42  ");   // 42
Number("");         // 0
Number(" ");        // 0
Number("3.14");     // 3.14
Number("3.14px");   // NaN
Number(true);       // 1
Number(false);      // 0
Number(null);       // 0
Number(undefined);  // NaN
```

Arrays y objetos producen resultados menos intuitivos debido a la conversión previa a primitivo:

```js
Number([]);      // 0, porque [] se convierte en ""
Number([5]);     // 5, porque [5] se convierte en "5"
Number([1, 2]);  // NaN
Number({});      // NaN
```

Estos casos sirven para comprender el lenguaje, no para diseñar validaciones.

El `+` unario aplica conversión numérica:

```js
+"5"; // 5
```

No acepta `bigint` y es menos explícito que `Number`.

### `parseInt` y `parseFloat`

```js
parseInt("42px", 10); // 42
parseInt("101", 2);   // 5
parseFloat("3.5kg");  // 3.5
```

Se detienen al encontrar un carácter inválido. Eso puede ser correcto para un formato deliberado y peligroso para una entrada que debería ser completamente numérica.

```js
Number("12abc");       // NaN
parseInt("12abc", 10); // 12
```

## Convertir a booleano

`Boolean` devuelve `false` solo para los valores falsy:

```js
Boolean(0);         // false
Boolean("");        // false
Boolean(null);      // false
Boolean(undefined); // false
Boolean(NaN);       // false
Boolean("false");   // true
Boolean([]);        // true
```

No uses `Boolean(texto)` para interpretar palabras como `"sí"`, `"no"`, `"true"` o `"false"`. Eso exige un parser del dominio.

## Convertir a `bigint`

```js
BigInt("9007199254740993"); // 9007199254740993n
BigInt(42);                 // 42n
BigInt(true);               // 1n
```

No acepta decimales no enteros ni texto decimal con punto:

```js
// BigInt(3.5);   // RangeError
// BigInt("3.5"); // SyntaxError
```

Convertir primero un entero grande a `number` puede perder precisión antes de llegar a `BigInt`. Convertí directamente desde el string.

## Contextos de coerción

Una forma productiva de entender el lenguaje es reconocer el tipo que exige cada contexto.

### Contexto booleano

```js
if (valor) {}
while (valor) {}
valor ? a : b;
!valor;
valor && otro;
valor || otro;
```

### Contexto numérico

La mayoría de los operadores aritméticos convierten a número:

```js
"8" - "3"; // 5
"8" * "3"; // 24
"8" / 2;   // 4
"8" ** 2;  // 64
```

Si aparece un `bigint`, ambos operandos deben terminar siendo `bigint` para la aritmética correspondiente.

### Contexto de string

Plantillas, `String` y concatenación cuando `+` elige texto:

```js
`id:${123}`; // "id:123"
```

### Contexto de propiedad

Las claves comunes de objeto se convierten en strings; los símbolos permanecen símbolos:

```js
const objeto = {};
objeto[10] = "diez";
Object.keys(objeto); // ["10"]
```

## La regla especial de `+`

`+` puede sumar o concatenar. De forma simplificada:

1. convierte objetos a primitivos;
2. si alguno de los primitivos es string, concatena como strings;
3. en caso contrario, realiza suma numérica compatible.

```js
1 + 2;       // 3
"1" + 2;     // "12"
1 + "2";     // "12"
1 + 2 + "3"; // "33"
"1" + 2 + 3; // "123"
```

La evaluación es de izquierda a derecha. Los paréntesis cambian el primer resultado:

```js
"Total: " + (1 + 2); // "Total: 3"
```

`Symbol` no se concatena implícitamente:

```js
const id = Symbol("id");
String(id); // "Symbol(id)"
// "id=" + id; // TypeError
```

## Comparaciones relacionales

Con dos strings, `<` compara lexicográficamente:

```js
"20" < "3"; // true
```

Con tipos diferentes, normalmente hay conversión numérica:

```js
"20" < 3; // false
```

Los resultados con `NaN` son falsos:

```js
NaN < 3;  // false
NaN >= 3; // false
```

Convertí y validá antes de ordenar valores que llegan como strings.

## Igualdad flexible: por qué sorprende

`==` intenta acercar tipos mediante reglas específicas:

```js
0 == false;        // true
"" == false;       // true
"0" == false;      // true
null == undefined; // true
[] == "";          // true
[0] == 0;          // true
```

Cada resultado puede explicarse, pero obliga a reconstruir varias conversiones. La igualdad estricta evita esa fase:

```js
0 === false;  // false
"0" === false; // false
```

Usá `===` y `!==` por defecto. Si elegís `==` para un caso específico, documentá la intención y mantené la expresión local.

## Conversión de objetos a primitivos

Cuando una operación necesita un primitivo, un objeto puede participar mediante:

1. `Symbol.toPrimitive`, si existe;
2. `valueOf` y `toString`, en un orden que depende de la sugerencia de tipo.

```js
const temperatura = {
  celsius: 25,
  valueOf() {
    return this.celsius;
  },
  toString() {
    return `${this.celsius} °C`;
  }
};

Number(temperatura); // 25
String(temperatura); // "25 °C"
```

Personalizar coerción puede hacer una API elegante o misteriosa. Métodos explícitos como `aCentavos()` y `formatear()` suelen ser mejores cuando existen varias interpretaciones legítimas.

## Diseñar parsers del dominio

Una conversión del lenguaje no decide formatos culturales:

```js
Number("1,5"); // NaN
```

Si la aplicación acepta coma decimal, debe normalizar bajo un contrato claro y rechazar mezclas ambiguas:

```js
function leerDecimalEs(texto) {
  const limpio = texto.trim();

  if (!/^[+-]?\d+(?:,\d+)?$/u.test(limpio)) {
    throw new TypeError("Formato decimal inválido");
  }

  const numero = Number(limpio.replace(",", "."));
  if (!Number.isFinite(numero)) {
    throw new RangeError("Número fuera de rango");
  }

  return numero;
}
```

El separador de miles requiere aún más cuidado: `"1.234"` puede significar mil doscientos treinta y cuatro o uno con fracción.

## Un pipeline de entrada completo

```js
function normalizarProducto(entrada) {
  if (!entrada || typeof entrada !== "object") {
    throw new TypeError("Se esperaba un producto");
  }

  const nombre = String(entrada.nombre ?? "").trim();
  if (nombre === "") throw new TypeError("Falta el nombre");

  const precio = Number(entrada.precio);
  if (!Number.isFinite(precio) || precio < 0) {
    throw new RangeError("Precio inválido");
  }

  const stock = Number(entrada.stock);
  if (!Number.isSafeInteger(stock) || stock < 0) {
    throw new RangeError("Stock inválido");
  }

  const activo = leerBooleano(String(entrada.activo));

  return { nombre, precio, stock, activo };
}

function leerBooleano(texto) {
  const valor = texto.trim().toLowerCase();
  if (valor === "true") return true;
  if (valor === "false") return false;
  throw new TypeError("Activo debe ser true o false");
}
```

Después de este límite, ningún cálculo necesita adivinar tipos.

## Errores frecuentes

- convertir una cadena vacía con `Number` y aceptar cero sin querer;
- usar `parseInt` y tolerar basura posterior;
- interpretar `"false"` con `Boolean`;
- comparar números almacenados como strings;
- depender de `+` sin saber si suma o concatena;
- convertir un entero grande a `number` antes de `BigInt`;
- personalizar la coerción de un objeto cuando métodos nombrados serían más claros.

## Práctica guiada

Recibí desde un CSV las columnas `legajo`, `edad`, `promedio`, `regular` y `observaciones`. Diseñá parsers independientes para cada campo, conservá `legajo` como string, aceptá promedio con coma decimal, interpretá el booleano mediante una lista cerrada y representá observaciones vacías como `null`. Devolvé errores con el número de fila y el nombre de la columna.

## Para recordar

- Convertir cambia la representación; validar comprueba el contrato. Son pasos diferentes.
- La coerción depende del contexto: booleano, numérico, string o clave de propiedad.
- `+` es especial porque puede sumar o concatenar.
- La igualdad flexible añade reglas de conversión; la estricta conserva los tipos.
- Un sistema productivo normaliza entradas una vez y trabaja internamente con datos estables.
