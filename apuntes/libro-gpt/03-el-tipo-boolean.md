# 3. El tipo `boolean`

## Idea central

**JavaScript permite usar cualquier valor como condición, pero una condición verdadera no implica que su resultado sea el booleano `true`.** Para evitar errores hay que distinguir booleanos de valores *truthy* y *falsy*, y recordar que `&&` y `||` seleccionan operandos mediante cortocircuito.

Esta distinción permite usar los operadores lógicos de forma productiva sin confundir validación, ausencia y selección de valores.

## Dos valores para representar una decisión

El tipo `boolean` tiene solo dos valores:

```js
true
false
```

Las comparaciones producen booleanos:

```js
10 > 3;            // true
5 === "5";         // false
"ana" !== "Ana";  // true
```

Un nombre booleano debería permitir leer la condición como una frase:

```js
const esMayorDeEdad = edad >= 18;
const tieneCupo = inscriptos < capacidad;
const puedeIngresar = esMayorDeEdad && tieneCupo;
```

Guardar una condición intermedia no es obligatorio, pero puede volver explícita la regla del dominio.

## Una condición no exige un booleano

`if`, `while`, el operador ternario y los operadores lógicos aceptan cualquier valor. Antes de decidir, JavaScript lo interpreta en contexto booleano:

```js
if (nombre) {
  console.log(`Hola, ${nombre}`);
}
```

`nombre` puede ser un string. El lenguaje aplica conceptualmente `Boolean(nombre)`.

## La lista completa de valores *falsy*

Los valores cuya conversión booleana da `false` son:

```js
false
0
-0
0n
""
null
undefined
NaN
```

En navegadores existe una excepción histórica muy especializada: `document.all` también se comporta como falsy. No debe utilizarse para lógica de aplicación.

Todos los demás valores son *truthy*. Algunos sorprenden:

```js
Boolean("false"); // true: es una cadena no vacía
Boolean("0");     // true
Boolean([]);      // true
Boolean({});      // true
Boolean(-1);      // true
```

Truthy no significa “verdadero según el significado humano”. Solo significa que la conversión definida por el lenguaje produce `true`.

## Conversión explícita

La forma descriptiva es `Boolean`:

```js
Boolean(1);     // true
Boolean(0);     // false
Boolean("ok");  // true
Boolean("");    // false
```

La doble negación produce el mismo resultado:

```js
!!"ok"; // true
!!0;    // false
```

La primera `!` convierte e invierte; la segunda vuelve a invertir. `Boolean(valor)` suele comunicar mejor la intención en código didáctico y de negocio; `!!valor` es una abreviatura común que conviene reconocer.

## Negación con `!`

`!` siempre devuelve un booleano:

```js
!"texto"; // false
!0;       // true
```

Una condición negativa puede resultar más difícil de leer, especialmente si se combina con nombres negativos:

```js
if (!usuario.noEstaBloqueado) {
  // doble negación conceptual
}
```

Preferí nombres afirmativos:

```js
function puedeContinuar(usuario) {
  if (usuario.estaBloqueado) return false;
  return true;
}
```

## `&&`: avanzar mientras los valores sean *truthy*

El operador AND evalúa de izquierda a derecha:

1. si encuentra un valor falsy, lo devuelve y se detiene;
2. si todos son truthy, devuelve el último.

```js
true && true;          // true
"Ana" && 20;           // 20
"" && ejecutar();      // ""; ejecutar no se llama
1 && "ok" && { id: 1 }; // { id: 1 }
```

Este comportamiento se llama **cortocircuito**. Permite proteger una operación:

```js
const ciudad = usuario && usuario.direccion && usuario.direccion.ciudad;
```

Hoy suele ser más claro usar encadenamiento opcional:

```js
const ciudad = usuario?.direccion?.ciudad;
```

`&&` también puede ejecutar condicionalmente un efecto:

```js
estaListo && iniciar();
```

La forma con `if` suele ser preferible si el efecto es importante o si el lector podría confundir el resultado:

```js
if (estaListo) iniciar();
```

## `||`: buscar el primer valor *truthy*

OR también evalúa de izquierda a derecha:

1. devuelve el primer operando truthy;
2. si ninguno lo es, devuelve el último falsy.

```js
"Ana" || "Anónimo";       // "Ana"
"" || "Anónimo";          // "Anónimo"
0 || false || null;       // null
configuracionA || configuracionB || configuracionBase;
```

Durante años se utilizó para valores predeterminados:

```js
const cantidad = entrada || 1;
```

Pero reemplaza cualquier falsy. Si `0` es una cantidad válida, el resultado será incorrecto.

## `??`: ausencia nula, no falsedad

La coalescencia nula devuelve el operando derecho solo cuando el izquierdo es `null` o `undefined`:

```js
0 ?? 1;          // 0
false ?? true;   // false
"" ?? "texto";   // ""
null ?? "texto"; // "texto"
```

Regla práctica:

- usá `||` cuando querés reemplazar cualquier valor falsy;
- usá `??` cuando solo querés reemplazar ausencia.

JavaScript exige paréntesis al mezclar directamente `??` con `&&` o `||`, porque la intención puede ser ambigua:

```js
const valor = (preferido || alternativo) ?? predeterminado;
```

## Los operadores lógicos conservan valores

La simetría ayuda a recordarlos:

```text
a && b → primer falsy; si no existe, último valor
a || b → primer truthy; si no existe, último valor
```

No son funciones que siempre produzcan `true` o `false`; son operadores de control y selección. Si la API necesita un booleano real, convertí el resultado:

```js
const tieneNombre = Boolean(usuario.nombre);
```

## Comparaciones y orden

Los operadores relacionales producen booleanos:

```js
3 < 10;
10 >= 10;
"Ana" < "Luis";
```

Con operandos del mismo tipo numérico, el sentido suele ser evidente. Con strings, la comparación sigue unidades de código, no el orden lingüístico humano. Con tipos diferentes puede haber coerción numérica:

```js
"10" < 2; // false; "10" se convierte en 10
```

Convertí entradas antes de comparar y usá `Intl.Collator` para orden alfabético destinado a personas.

## Igualdad estricta y flexible

La igualdad estricta no convierte tipos:

```js
5 === 5;   // true
5 === "5"; // false
```

La igualdad flexible aplica reglas de coerción:

```js
5 == "5";       // true
false == 0;     // true
null == undefined; // true
```

La regla general es usar `===` y `!==`. La comparación `valor == null` es un modismo deliberado que detecta `null` o `undefined`, pero `valor === null || valor === undefined` es más explícito para quien está aprendiendo.

`NaN` es diferente de todos los valores, incluso de sí mismo:

```js
NaN === NaN;          // false
Number.isNaN(NaN);    // true
```

`Object.is` distingue casos especiales:

```js
Object.is(NaN, NaN); // true
Object.is(0, -0);    // false
```

## Combinar condiciones

Una regla puede construirse con condiciones pequeñas:

```js
const tieneEdadValida = edad >= 18;
const tieneDocumentacion = Boolean(dni && constancia);
const noEstaSuspendido = !estaSuspendido;

const puedeInscribirse =
  tieneEdadValida &&
  tieneDocumentacion &&
  noEstaSuspendido;
```

Los saltos de línea y nombres intermedios permiten revisar cada parte. No es necesario comprimir una regla compleja en una sola expresión.

## Leyes de De Morgan

Al negar una condición compuesta:

```text
!(a && b) equivale a !a || !b
!(a || b) equivale a !a && !b
```

Ejemplo:

```js
const noPuedeComprar = !(tieneSaldo && hayStock);
const equivalente = !tieneSaldo || !hayStock;
```

Estas leyes ayudan a transformar condiciones y escribir guardas tempranas.

## Precedencia y paréntesis

En las operaciones habituales:

```text
! se evalúa antes que &&
&& se evalúa antes que ||
|| se evalúa antes que el ternario
```

```js
const acceso = esAdmin || esEditor && estaActivo;
// equivale a: esAdmin || (esEditor && estaActivo)
```

Aunque conozcas la precedencia, agregá paréntesis si representan una regla conceptual:

```js
const acceso = esAdmin || (esEditor && estaActivo);
```

## Asignación lógica

Los operadores de asignación lógica actualizan solo cuando corresponde:

```js
config.tema ||= "claro";       // si tema es falsy
config.intentos ??= 3;         // si es null o undefined
sesion.activa &&= verificar(); // si activa es truthy
```

Son útiles, pero conservan las mismas reglas de `||`, `??` y `&&`. Antes de usarlos, decidí qué valores son válidos en el dominio.

## Errores frecuentes

### Interpretar una cadena como su significado humano

```js
Boolean("false"); // true
```

Para una entrada textual, definí un parser:

```js
function leerBooleano(texto) {
  const normalizado = texto.trim().toLowerCase();
  if (normalizado === "true") return true;
  if (normalizado === "false") return false;
  throw new TypeError("Se esperaba true o false");
}
```

### Usar `||` cuando cero, vacío o `false` son válidos

Usá `??` si solo querés cubrir ausencia.

### Esperar que `&&` produzca un booleano

`usuario && usuario.nombre` puede devolver `null`, `undefined`, `""` o el nombre. Convertí si el contrato exige `boolean`.

### Ocultar demasiado en una expresión

Una cadena larga de cortocircuitos puede ser compacta y difícil de depurar. Separá reglas y efectos.

## Práctica guiada

Implementá `puedePublicar(usuario, articulo)` con estas reglas:

- el usuario debe existir y estar activo;
- debe ser autor del artículo o administrador;
- el título no puede estar vacío;
- un número de versión igual a `0` es válido;
- si la versión está ausente, usar `1`.

Devolvé `{ permitido, version, motivos }`. Probá entradas con `null`, `""`, `0`, `false` y objetos vacíos. Explicá en cada caso por qué corresponde `Boolean`, `&&`, `||` o `??`.

## Para recordar

- Solo `true` y `false` son booleanos; todos los valores tienen una interpretación booleana.
- La lista de falsy es pequeña y cerrada; arrays y objetos vacíos son truthy.
- `&&` devuelve el primer falsy o el último valor; `||`, el primer truthy o el último.
- `??` trata únicamente `null` y `undefined` como ausencia.
- Las condiciones importantes merecen nombres, paréntesis y un contrato booleano explícito.
