# 4. Los tipos `number` y `bigint`

## Idea central

**`number` sirve para la mayoría de los cálculos, pero no representa todos los decimales ni todos los enteros con exactitud; `bigint` representa enteros arbitrariamente grandes, aunque no puede mezclarse libremente con `number`.** La elección correcta depende de la precisión, el rango y las operaciones del dominio.

Para trabajar con números de forma segura hay que separar cuatro preguntas:

1. ¿cómo se escribe o se convierte la entrada?
2. ¿qué puede representar el tipo?
3. ¿qué operación y precisión exige el problema?
4. ¿cómo se presenta el resultado sin confundir formato con dato?

## Un único tipo para enteros y decimales

En JavaScript, `number` utiliza el formato IEEE 754 de doble precisión. El mismo tipo representa:

```js
42
-7
3.14159
1.5e6
Infinity
NaN
```

No existe un tipo entero pequeño separado. Un valor puede ser entero desde el punto de vista matemático y seguir almacenado como `number`.

```js
Number.isInteger(42);   // true
Number.isInteger(42.5); // false
```

## Literales y bases

```js
const decimal = 42;
const binario = 0b101010;
const octal = 0o52;
const hexadecimal = 0x2a;

decimal === binario;     // true
binario === hexadecimal; // true
```

La base cambia cómo escribimos el literal, no el valor matemático. Los separadores numéricos mejoran la lectura:

```js
const poblacion = 46_000_000;
const mascara = 0b1111_0000;
```

La notación exponencial expresa escalas grandes o pequeñas:

```js
1e3;   // 1000
2.5e-3; // 0.0025
```

## Operaciones aritméticas

```js
10 + 3;  // 13
10 - 3;  // 7
10 * 3;  // 30
10 / 3;  // 3.333...
10 % 3;  // 1
2 ** 3;  // 8
```

El operador `%` produce el resto, no un módulo matemático siempre positivo:

```js
-5 % 3; // -2
```

Para normalizar un valor cíclico:

```js
function modulo(valor, base) {
  return ((valor % base) + base) % base;
}

modulo(-1, 7); // 6
```

La exponenciación se asocia desde la derecha:

```js
2 ** 3 ** 2; // 2 ** (3 ** 2) = 512
```

JavaScript exige paréntesis para una base unaria negativa:

```js
(-2) ** 2; // 4
-(2 ** 2); // -4
```

## División y valores especiales

Dividir por cero no lanza una excepción en `number`:

```js
1 / 0;   // Infinity
-1 / 0;  // -Infinity
0 / 0;   // NaN
```

`NaN` significa que una operación numérica no produjo un número válido. Sigue perteneciendo al tipo `number`:

```js
typeof NaN; // "number"
```

No se compara consigo mismo:

```js
NaN === NaN; // false
```

Para detectarlo usá `Number.isNaN`, no la función global `isNaN`, que primero convierte:

```js
Number.isNaN(NaN);    // true
Number.isNaN("hola"); // false
isNaN("hola");        // true, porque Number("hola") es NaN
```

`Number.isFinite` comprueba que un valor ya numérico sea finito:

```js
Number.isFinite(10);       // true
Number.isFinite(Infinity); // false
Number.isFinite("10");     // false
```

## El cero negativo

IEEE 754 distingue `0` de `-0`, aunque la igualdad estricta los considera iguales:

```js
0 === -0;           // true
Object.is(0, -0);   // false
1 / 0;              // Infinity
1 / -0;             // -Infinity
```

En la mayoría de las aplicaciones no importa. Puede ser relevante en cálculos que conservan dirección o signo al aproximarse a cero.

## Los decimales no siempre caben exactamente

Muchos decimales finitos en base diez son periódicos en base dos:

```js
0.1 + 0.2; // 0.30000000000000004
```

No es un error exclusivo de JavaScript, sino una consecuencia de la representación finita. No compares cálculos decimales esperando siempre igualdad exacta:

```js
function casiIguales(a, b, tolerancia = Number.EPSILON) {
  return Math.abs(a - b) <= tolerancia * Math.max(1, Math.abs(a), Math.abs(b));
}
```

`Number.EPSILON` es la distancia entre `1` y el siguiente número representable, no una tolerancia universal. El dominio debe definir una tolerancia coherente con su escala.

### Dinero

Para dinero simple, suele ser más seguro guardar unidades mínimas enteras:

```js
const precioCentavos = 19_99;
const cantidad = 3;
const totalCentavos = precioCentavos * cantidad;
```

Esto no resuelve por sí solo porcentajes, redondeos legales, monedas con distinta cantidad de decimales ni importes gigantes. Sistemas financieros serios suelen usar enteros con reglas explícitas o bibliotecas decimales.

## Enteros seguros

`number` representa exactamente enteros entre:

```js
Number.MIN_SAFE_INTEGER;
Number.MAX_SAFE_INTEGER; // 9007199254740991
```

Fuera de ese rango, enteros diferentes pueden volverse indistinguibles:

```js
const limite = Number.MAX_SAFE_INTEGER;
limite + 1 === limite + 2; // true
```

Comprobá entradas que deban ser enteros exactos:

```js
Number.isSafeInteger(123); // true
```

Identificadores numéricos largos —tarjetas, códigos, documentos— muchas veces no son cantidades. Guardarlos como strings conserva ceros iniciales y evita operaciones sin sentido.

## Convertir a `number`

`Number` exige que toda la cadena represente un número, ignorando espacios exteriores:

```js
Number("42");      // 42
Number(" 42 ");    // 42
Number("");        // 0
Number("42px");    // NaN
Number(null);      // 0
Number(undefined); // NaN
```

El caso de la cadena vacía exige validación previa si el campo es obligatorio.

El `+` unario también convierte, pero es menos descriptivo:

```js
+"42"; // 42
```

`parseInt` y `parseFloat` leen un prefijo válido:

```js
parseInt("42px", 10);  // 42
parseFloat("3.14kg");  // 3.14
```

Esto es útil cuando el contrato acepta unidades posteriores; es peligroso si esperamos que toda la entrada sea numérica. Indicá siempre la base de `parseInt` cuando el formato la conozca:

```js
parseInt("1010", 2); // 10
```

Para convertir otras bases a texto:

```js
(42).toString(2);  // "101010"
(42).toString(16); // "2a"
```

## Redondear y truncar

```js
Math.floor(3.8); // 3, hacia -Infinity
Math.ceil(3.2);  // 4, hacia +Infinity
Math.round(3.5); // 4
Math.trunc(3.8); // 3, elimina la fracción
```

Con negativos, `floor` y `trunc` difieren:

```js
Math.floor(-3.2); // -4
Math.trunc(-3.2); // -3
```

Otros métodos frecuentes:

```js
Math.abs(-10);       // 10
Math.min(3, 7, 1);   // 1
Math.max(3, 7, 1);   // 7
Math.sqrt(81);       // 9
Math.random();       // valor en [0, 1)
```

Para un entero aleatorio uniforme entre `min` y `max`, inclusive:

```js
function enteroAleatorio(min, max) {
  return Math.floor(Math.random() * (max - min + 1)) + min;
}
```

`Math.random` no es apropiado para seguridad, claves ni sorteos auditables.

## Formatear no es calcular

`toFixed` devuelve una cadena:

```js
const texto = (12.5).toFixed(2); // "12.50"
typeof texto;                    // "string"
```

No sigas calculando sobre ese resultado sin una conversión deliberada. Para presentar números según idioma y moneda:

```js
const formato = new Intl.NumberFormat("es-AR", {
  style: "currency",
  currency: "ARS"
});

formato.format(1234.5);
```

El valor interno sigue siendo numérico; el formato pertenece al borde de salida.

## Operadores bit a bit

Los operadores bitwise de `number` convierten los operandos a enteros de 32 bits con signo:

```js
0b1100 & 0b1010; // 0b1000, AND
0b1100 | 0b1010; // 0b1110, OR
0b1100 ^ 0b1010; // 0b0110, XOR
~0;              // -1
```

Los desplazamientos son:

```js
1 << 3;   // 8
8 >> 1;   // 4, conserva el signo
-1 >>> 1; // desplaza rellenando con ceros
```

La conversión a 32 bits puede truncar valores grandes y descartar fracciones:

```js
5.9 | 0; // 5, pero no debe usarse como sustituto general de Math.trunc
```

### Máscaras de opciones

```js
const LEER = 1 << 0;
const ESCRIBIR = 1 << 1;
const BORRAR = 1 << 2;

let permisos = LEER | ESCRIBIR;            // activar
const puedeLeer = (permisos & LEER) !== 0; // consultar
permisos &= ~ESCRIBIR;                     // apagar
permisos ^= BORRAR;                        // alternar
```

Una máscara es compacta e interoperable. En lógica de negocio, un `Set` de nombres puede ser más legible. Elegí según la representación externa y las operaciones necesarias.

## `bigint`: enteros sin el límite seguro de `number`

Un literal termina en `n`:

```js
const poblacionGalactica = 9_007_199_254_740_993n;
const convertido = BigInt("9007199254740993");
```

Soporta aritmética entera:

```js
10n + 2n;  // 12n
10n * 2n;  // 20n
10n ** 3n; // 1000n
10n / 3n;  // 3n: descarta la fracción
```

No puede mezclarse directamente con `number`:

```js
// 10n + 2; // TypeError
10n + BigInt(2); // 12n
```

La conversión debe ser consciente del rango. Convertir un `bigint` enorme a `number` puede perder precisión; convertir un decimal no entero a `bigint` lanza error.

```js
BigInt(42);   // 42n
// BigInt(4.2); // RangeError
```

Las comparaciones relacionales permiten mezclar ambos tipos en ciertos casos:

```js
10n < 11; // true
```

La igualdad estricta conserva la diferencia:

```js
10n === 10; // false
```

`Math` no acepta `bigint`, el operador `>>>` no está disponible y `JSON.stringify` no lo serializa por defecto:

```js
// JSON.stringify({ valor: 10n }); // TypeError
```

Un formato externo debe decidir cómo representarlo, normalmente como string, y cómo reconstruirlo.

## Validar una entrada numérica

```js
function leerCantidad(texto) {
  const limpio = texto.trim();

  if (limpio === "") {
    throw new TypeError("La cantidad es obligatoria");
  }

  const cantidad = Number(limpio);

  if (!Number.isSafeInteger(cantidad) || cantidad < 0) {
    throw new RangeError("La cantidad debe ser un entero seguro no negativo");
  }

  return cantidad;
}
```

La validación separa presencia, conversión, clase de número y rango del dominio. El resto del programa puede trabajar con una garantía más fuerte.

## Errores frecuentes

- esperar exactitud decimal sin definir tolerancia o redondeo;
- usar `parseInt` cuando el texto completo debería ser válido;
- considerar `NaN` mediante igualdad;
- confundir `toFixed` con una operación numérica;
- guardar identificadores largos como cantidades;
- usar bitwise sobre valores que necesitan más de 32 bits;
- mezclar `number` y `bigint` sin una conversión justificada.

## Para recordar

- `number` es punto flotante de doble precisión: tiene valores especiales, errores decimales y un rango entero seguro.
- Convertir, validar, calcular y formatear son etapas distintas.
- Los operadores bitwise de `number` trabajan sobre enteros de 32 bits.
- `bigint` amplía los enteros, pero pierde fracciones, compatibilidad con `Math` y serialización JSON directa.
- La precisión correcta es una decisión del dominio, no un detalle que pueda dejarse implícito.
