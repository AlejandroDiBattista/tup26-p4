# 2. Variables, alcance y expresiones

## Idea central

**Una variable no es una caja: es un nombre vinculado con un valor durante una parte determinada de la ejecución.** Para escribir programas previsibles conviene crear ese vínculo lo más cerca posible de su uso, preferir `const`, reservar `let` para cambios deliberados y elegir nombres que expresen el papel del dato.

Esta conclusión se sostiene en tres ideas:

1. declaración, inicialización y asignación son momentos diferentes;
2. el alcance determina dónde puede utilizarse un nombre y la vida del dato determina cuánto tiempo existe;
3. una expresión produce un valor, y los operadores determinan cómo se construye ese resultado.

## De un valor anónimo a un dato con propósito

Un programa puede operar directamente sobre literales:

```js
1500 * 3;
```

El cálculo es válido, pero no comunica qué representan esos números. Al darles nombre aparece la intención:

```js
const precioUnitario = 1500;
const cantidad = 3;
const subtotal = precioUnitario * cantidad;
```

Una **declaración** introduce el nombre. La **inicialización** le asigna su primer valor. Una **reasignación** reemplaza posteriormente el valor vinculado.

```js
let total;       // declaración; su valor inicial es undefined
total = 100;     // asignación
total = 150;     // reasignación

const iva = 0.21; // declaración e inicialización juntas
```

`const` exige inicialización inmediata porque el vínculo no podrá cambiar.

## Elegir entre `const`, `let` y `var`

La regla de trabajo es:

1. empezá con `const`;
2. cambiá a `let` solo si la reasignación expresa una evolución real del algoritmo;
3. evitá `var` en código nuevo.

### `const`: el nombre conserva su vínculo

```js
const moneda = "ARS";
// moneda = "USD"; // TypeError
```

`const` no vuelve inmutable el valor referenciado. Si el valor es un objeto, sus propiedades todavía pueden cambiar:

```js
const pedido = { estado: "pendiente", total: 1000 };
pedido.estado = "pagado"; // permitido
```

Lo que no puede hacerse es vincular `pedido` con otro objeto:

```js
// pedido = { estado: "nuevo", total: 0 };
```

Esta diferencia —vínculo constante frente a valor inmutable— será esencial al estudiar arrays y objetos.

### `let`: el cambio forma parte del modelo

```js
let saldo = 10_000;
saldo -= 2_500;
saldo -= 1_000;
```

`let` es apropiado para acumuladores, índices, estados que avanzan y referencias que se reemplazan. Que pueda cambiar no significa que deba hacerlo desde muchos lugares. Cuanto menor sea su alcance, más fácil será reconstruir su historia.

### `var`: una regla histórica diferente

`var` tiene alcance de función, no de bloque, permite redeclaración y su inicialización se comporta de manera diferente durante la elevación:

```js
function ejemplo() {
  if (true) {
    var mensaje = "visible en toda la función";
  }

  console.log(mensaje);
}
```

Con `let` o `const`, `mensaje` solo existiría dentro del `if`. Comprender `var` sigue siendo útil para leer código antiguo, pero rara vez mejora un diseño nuevo.

## Alcance: desde dónde puede verse un nombre

El **alcance léxico** se deduce de la estructura del código. Un bloque interior puede consultar nombres exteriores, pero el exterior no puede consultar los nombres privados del interior.

```js
const recargoGeneral = 0.05;

function cotizar(precio) {
  const subtotal = precio * (1 + recargoGeneral);

  if (subtotal > 10_000) {
    const envio = 0;
    return subtotal + envio;
  }

  return subtotal + 800;
}
```

Aquí aparecen varios niveles:

- `recargoGeneral` está en el alcance exterior;
- `precio` y `subtotal` viven en el alcance de la función;
- `envio` solo existe en el bloque del `if`.

### Alcance global

Un nombre global puede consultarse desde muchas partes. Esa comodidad tiene un costo: cualquier cambio puede afectar a consumidores lejanos. Preferí módulos y parámetros explícitos para compartir datos.

En navegadores, algunas declaraciones globales históricas se reflejan en `globalThis` o `window`, pero no todas lo hacen del mismo modo. En módulos de JavaScript, los nombres del archivo tienen alcance de módulo y no se convierten automáticamente en propiedades globales.

### Alcance de función

Parámetros y declaraciones internas pertenecen a cada llamada:

```js
function sumarImpuesto(precio, tasa) {
  const impuesto = precio * tasa;
  return precio + impuesto;
}

sumarImpuesto(100, 0.21);
sumarImpuesto(200, 0.10);
```

Las dos llamadas crean contextos independientes. El `impuesto` de una no se mezcla con el de la otra.

### Alcance de bloque

`let`, `const` y `class` respetan las llaves de `if`, `for`, `while`, `switch` y bloques sueltos:

```js
for (let indice = 0; indice < 3; indice += 1) {
  const posicionHumana = indice + 1;
  console.log(posicionHumana);
}

// indice y posicionHumana ya no existen aquí
```

## Sombreado: un nombre puede ocultar a otro

Un bloque puede declarar un nombre que ya existe fuera:

```js
const estado = "global";

function informar() {
  const estado = "local";
  return estado;
}
```

Esto es válido y a veces útil, pero puede dificultar la lectura si ambos valores participan en la misma operación. Usá nombres diferentes cuando representen conceptos diferentes.

## Elevación y zona muerta temporal

Las declaraciones se procesan antes de ejecutar el bloque, pero no todas quedan utilizables de la misma forma.

```js
// console.log(total); // ReferenceError
const total = 100;
```

Desde el comienzo del bloque hasta la inicialización, `total` está en la **zona muerta temporal**. No se trata de que el nombre sea desconocido: existe, pero todavía no puede leerse.

Con `var`, la declaración se eleva e inicializa con `undefined`:

```js
console.log(totalHistorico); // undefined
var totalHistorico = 100;
```

Eso puede ocultar el uso prematuro de un dato. Las declaraciones de función completas también se elevan, mientras que una función almacenada en `const` sigue las reglas de `const`.

La práctica más clara es declarar cerca del primer uso y no depender de la elevación para organizar el archivo.

## Vida de un valor y recolección de memoria

El alcance indica dónde puede escribirse un nombre; la **vida** indica durante cuánto tiempo el valor sigue siendo alcanzable. Un valor local suele dejar de ser necesario al terminar la función. El recolector de basura puede liberar su memoria cuando ya no existe ninguna referencia accesible.

Una clausura puede prolongar esa vida:

```js
function crearSecuencia() {
  let siguiente = 1;

  return () => siguiente++;
}

const obtenerId = crearSecuencia();
obtenerId(); // 1
obtenerId(); // 2
```

Aunque `crearSecuencia` terminó, la función devuelta conserva acceso a `siguiente`. Volveremos sobre este mecanismo en el capítulo de funciones.

## Identificadores válidos y nombres útiles

Un identificador puede contener letras Unicode, dígitos, `_` y `$`, pero no puede comenzar con un dígito ni coincidir con una palabra reservada.

```js
const año = 2026;
const _interno = true;
const $elemento = null;
// const 2curso = "A";
```

Las convenciones más habituales son:

- `camelCase` para variables y funciones;
- `PascalCase` para clases y constructores;
- mayúsculas con guiones bajos para constantes verdaderamente globales e inmutables, como `MAX_INTENTOS`.

Un nombre describe el papel, no solo el tipo:

```js
const datos = 15;             // ¿qué datos?
const diasHastaVencimiento = 15; // intención visible
```

Para booleanos funcionan bien prefijos como `es`, `tiene`, `puede` y `debe`. Para funciones, un verbo expresa la acción: `calcularTotal`, `buscarAlumno`, `guardarArchivo`.

## Expresiones y sentencias

Una **expresión** produce un valor:

```js
2 + 3
precio * cantidad
edad >= 18
usuario?.nombre ?? "Anónimo"
```

Una **sentencia** realiza una acción estructural, como declarar, decidir o repetir:

```js
const total = precio * cantidad;

if (total > limite) {
  console.log("Requiere autorización");
}
```

Una expresión puede aparecer dentro de una sentencia. Reconocer esta diferencia ayuda a leer funciones flecha, operadores condicionales y asignaciones.

## Operadores: aridad, precedencia y asociatividad

Un operador puede ser:

- unario: `!activo`, `typeof valor`, `-cantidad`;
- binario: `a + b`, `x === y`;
- ternario: `condicion ? valorA : valorB`.

La **precedencia** indica qué operador se agrupa primero:

```js
2 + 3 * 4; // 14, porque * tiene mayor precedencia
```

La **asociatividad** decide cómo se agrupan operadores del mismo nivel:

```js
10 - 3 - 2; // (10 - 3) - 2 = 5
2 ** 3 ** 2; // 2 ** (3 ** 2) = 512
```

La asignación se asocia desde la derecha:

```js
let a;
let b;
a = b = 10;
```

No conviene convertir estas reglas en un acertijo. Los paréntesis documentan la intención:

```js
const total = (precio * cantidad) - descuento;
const habilitado = esCliente && (tieneSaldo || tieneCredito);
```

## Asignaciones abreviadas e incremento

```js
saldo += deposito;
stock -= vendido;
factor *= 2;
indice += 1;
```

El incremento prefijo cambia y luego devuelve; el sufijo devuelve el valor anterior y luego cambia:

```js
let n = 5;
const anterior = n++; // anterior = 5, n = 6
const actual = ++n;   // n = 7, actual = 7
```

Cuando el valor producido importa, `n += 1` seguido de una lectura explícita suele ser más fácil de entender.

## Un método productivo para revisar variables

Al leer una función, preguntá por cada nombre:

1. ¿Qué representa?
2. ¿Quién puede cambiarlo?
3. ¿Durante cuánto tiempo debe existir?
4. ¿Podría calcularse en lugar de almacenarse?
5. ¿Su unidad está en el nombre o en el contrato?

```js
function calcularDemoraHoras(inicioMs, finMs) {
  const MILISEGUNDOS_POR_HORA = 3_600_000;
  const duracionMs = finMs - inicioMs;
  return duracionMs / MILISEGUNDOS_POR_HORA;
}
```

El nombre evita confundir milisegundos con horas y la constante explica el factor de conversión.

## Errores frecuentes

### Creer que `const` vuelve profundo e inmutable al objeto

`const` evita reasignar la variable; las propiedades siguen siendo modificables.

### Declarar todo al comienzo

Aleja la creación del uso, amplía innecesariamente el alcance y obliga a mantener estados parciales.

### Reutilizar una variable para conceptos distintos

```js
let resultado = leerEntrada();
resultado = Number(resultado);
resultado = resultado * 1.21;
```

Es más claro distinguir `entrada`, `precio` y `precioConIva`.

### Depender de precedencia difícil de reconocer

Aunque el código sea correcto, los paréntesis pueden evitar una revisión lenta o una modificación incorrecta.

## Práctica guiada

Reescribí esta función para reducir alcance, expresar unidades y evitar nombres ambiguos:

```js
function f(x, y) {
  var r;
  r = x * y;
  if (r > 10000) {
    var d = r * 0.1;
    r = r - d;
  }
  return r;
}
```

Después respondé:

- ¿qué nombres pueden ser `const`?
- ¿qué representa cada parámetro?
- ¿el umbral y la tasa pertenecen a la función o deberían llegar como configuración?
- ¿qué ejemplos comprobarían exactamente el límite de `10_000`?

## Para recordar

- Una variable vincula un nombre con un valor dentro de un alcance.
- `const` es la elección inicial; `let` expresa evolución; `var` queda para comprender código histórico.
- Alcance y vida no son lo mismo: una clausura puede mantener vivo un dato local.
- Una expresión produce un valor; los operadores lo construyen según precedencia y asociatividad.
- Los nombres, las unidades y el alcance reducido son herramientas de corrección, no decoración.
