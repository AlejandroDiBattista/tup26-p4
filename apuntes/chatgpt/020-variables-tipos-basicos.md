# Programación IV — Variables y tipos básicos de JavaScript

## Nombres, valores, operadores y conversiones

Un programa transforma información. Para poder hacerlo necesita representar valores —un precio, un nombre, una cantidad, una respuesta afirmativa— y necesita conservar algunos de ellos para utilizarlos más adelante.

En JavaScript, cada valor pertenece a un tipo. El número `25`, el texto `"25"` y el booleano `true` son tres valores distintos, con operaciones y significados diferentes. Una variable permite asociar uno de esos valores con un nombre dentro del programa.

En esta clase construiremos esas ideas desde la base. Primero veremos qué es una variable, cómo se declara y durante qué parte del programa existe. Después estudiaremos los tipos primitivos, sus literales, operadores y funciones habituales. Finalmente explicaremos las conversiones explícitas y automáticas que conectan unos tipos con otros.

Al finalizar este apunte deberíamos poder:

- distinguir declaración, inicialización y asignación;
- elegir correctamente entre `const`, `let` y `var`;
- explicar el alcance y la vida de una variable;
- escribir identificadores válidos y nombres expresivos;
- reconocer los siete tipos primitivos de JavaScript;
- representar booleanos, números y cadenas mediante literales;
- utilizar sus operadores y funciones estándar más importantes;
- interpretar expresiones considerando precedencia y asociatividad;
- explicar los valores *truthy* y *falsy* y el cortocircuito lógico;
- realizar conversiones explícitas y anticipar las coerciones automáticas.

---

## 1. De un valor a una variable

El valor `1200` puede representar el precio de un producto. Podríamos escribirlo directamente cada vez que lo necesitamos:

```js
console.log(1200 * 2);
console.log(1200 * 3);
```

Pero el programa no expresa qué significa ese número. Si le damos un nombre, la intención se vuelve visible:

```js
const precioUnitario = 1200;

console.log(precioUnitario * 2);
console.log(precioUnitario * 3);
```

Podemos imaginar una variable como una etiqueta que permite encontrar un valor. En términos más precisos, una declaración crea una **vinculación** entre un identificador y un valor dentro de cierto entorno del programa.

Esta precisión será importante más adelante. Una variable de JavaScript no queda asociada para siempre a un tipo. Si fue declarada con `let`, puede referirse primero a un número y después a un texto:

```js
let respuesta = 42;
respuesta = "cuarenta y dos";
```

Los valores tienen tipos. La variable es el nombre mediante el cual accedemos al valor actual.

### Declarar, inicializar y asignar

Son tres acciones relacionadas, pero no idénticas:

```js
let cantidad;       // declaración
cantidad = 3;       // asignación

let precio = 1500;  // declaración e inicialización
precio = 1800;      // nueva asignación
```

- **Declarar** introduce el nombre en un alcance.
- **Inicializar** le entrega su primer valor.
- **Asignar** cambia el valor al que se encuentra vinculada una variable ya existente.

Una declaración con `let` que no posee inicializador recibe el valor `undefined` cuando su declaración es ejecutada:

```js
let observacion;

console.log(observacion); // undefined
```

Una declaración con `const`, en cambio, debe inicializarse en el mismo momento:

```js
const comision = "4K1";
// const turno; // SyntaxError: falta el inicializador
```

---

## 2. Tres formas de declarar: `const`, `let` y `var`

JavaScript ofrece tres palabras para declarar variables. No son tres maneras intercambiables de escribir lo mismo: difieren en reasignación, alcance, redeclaración e inicialización.

| Característica | `const` | `let` | `var` |
|---|---|---|---|
| Permite reasignar | No | Sí | Sí |
| Exige valor inicial | Sí | No | No |
| Alcance de bloque | Sí | Sí | No |
| Permite redeclarar en el mismo alcance | No | No | Sí |
| Acceso antes de la declaración | Error | Error | `undefined` |
| Uso recomendado en código moderno | Por defecto | Cuando habrá reasignación | Evitar salvo código legado |

### 2.1 `const`: una vinculación que no cambia

`const` impide que el nombre sea asignado a otro valor:

```js
const nombreMateria = "Programación IV";

// nombreMateria = "Laboratorio IV";
// TypeError: no se puede reasignar una constante
```

Esto permite comunicar una decisión: después de inicializar `nombreMateria`, el programa no debería reemplazar su valor.

Por esa razón, la regla práctica es:

> Usar `const` por defecto. Cambiar a `let` solamente cuando la reasignación forme parte del problema.

`const` no vuelve inmutable al valor. Protege la vinculación, no el interior de un objeto:

```js
const alumno = { nombre: "Ana", regular: true };

alumno.regular = false; // permitido: cambia el objeto

// alumno = { nombre: "Luis", regular: true };
// no permitido: intenta reemplazar la vinculación
```

Esta diferencia será desarrollada al estudiar objetos. Por ahora alcanza con recordar que, para valores primitivos —que son inmutables—, una constante tampoco puede “modificar el valor por dentro”.

### 2.2 `let`: una vinculación reasignable

`let` se utiliza cuando el valor asociado al nombre debe cambiar:

```js
let intentosRestantes = 3;

intentosRestantes = intentosRestantes - 1;
intentosRestantes -= 1;
```

Los casos típicos son acumuladores, contadores o estados que evolucionan:

```js
const notas = [8, 6, 9];
let suma = 0;

for (const nota of notas) {
  suma += nota;
}

const promedio = suma / notas.length;
```

`notas` y `promedio` no necesitan ser reasignados, por lo que se declaran con `const`. `suma` sí cambia durante el recorrido y se declara con `let`.

### 2.3 `var`: la declaración histórica

Antes de ECMAScript 2015, `var` era la forma habitual de declarar variables. Sigue siendo parte del lenguaje por compatibilidad, pero sus reglas resultan menos locales y favorecen errores que `let` y `const` evitan.

```js
if (true) {
  var mensaje = "visible fuera del bloque";
}

console.log(mensaje); // funciona
```

Un bloque delimitado por llaves no crea un alcance nuevo para `var`. Si se encuentra dentro de una función, su alcance es toda la función; si se declara en el nivel superior de un script tradicional, posee alcance global.

Además, `var` permite redeclarar el mismo nombre:

```js
var estado = "pendiente";
var estado = "enviado"; // permitido
```

Con `let` o `const`, la redeclaración en el mismo alcance es un error y ayuda a detectar una posible confusión:

```js
let estado = "pendiente";
// let estado = "enviado"; // SyntaxError
```

### Regla de elección

Para código moderno:

1. elegir `const` si el nombre no será reasignado;
2. elegir `let` si la reasignación es necesaria;
3. reconocer `var` para poder leer código existente, pero evitarlo en código nuevo.

La elección no depende de si el valor “es importante”. Depende de si la **vinculación** necesitará cambiar.

---

## 3. Alcance: ¿desde dónde puede utilizarse un nombre?

El **alcance**, o *scope*, es la región del código desde la cual una vinculación resulta accesible.

### Alcance global

Una declaración situada fuera de funciones y bloques pertenece al nivel superior del script o módulo:

```js
const nombreAplicacion = "Gestión Académica";

function mostrarNombre() {
  console.log(nombreAplicacion);
}
```

El uso excesivo de variables globales dificulta saber qué parte del programa puede modificarlas. Los módulos permiten limitar mejor ese alcance.

### Alcance de función

Los parámetros y las variables declaradas dentro de una función no son accesibles desde afuera:

```js
function calcularDoble(numero) {
  const resultado = numero * 2;
  return resultado;
}

console.log(calcularDoble(5)); // 10
// console.log(resultado);     // ReferenceError
```

`numero` y `resultado` pertenecen a la ejecución de `calcularDoble`.

### Alcance de bloque

Un bloque es una región delimitada por llaves. `let` y `const` respetan ese límite:

```js
const usuarioAutenticado = true;

if (usuarioAutenticado) {
  const mensaje = "Bienvenido";
  let segundos = 5;

  console.log(mensaje, segundos); // accesibles
}

// console.log(mensaje); // ReferenceError
// console.log(segundos); // ReferenceError
```

Los bloques de `if`, `for`, `while` y los bloques independientes pueden crear alcances léxicos.

### Alcances anidados y sombreado

Un alcance interno puede utilizar nombres del externo. También puede declarar un nuevo nombre igual, que temporalmente **sombrea** al anterior:

```js
const mensaje = "mensaje exterior";

{
  const mensaje = "mensaje interior";
  console.log(mensaje); // "mensaje interior"
}

console.log(mensaje); // "mensaje exterior"
```

El sombreado es válido, pero puede reducir la claridad. Conviene utilizarlo solamente cuando los dos significados resultan evidentes.

---

## 4. Vida de una variable: ¿durante cuánto tiempo existe?

El alcance responde **dónde** puede usarse un nombre. Su vida responde **durante cuánto tiempo** se conserva la vinculación y, eventualmente, el valor al que hace referencia.

Una vinculación local suele crearse al entrar en su entorno y deja de ser necesaria cuando ese entorno ya no puede alcanzarse. El motor puede recuperar automáticamente la memoria mediante el recolector de basura.

Sin embargo, una función interna puede conservar acceso a variables del entorno donde fue creada. Ese mecanismo se denomina **clausura** o *closure*:

```js
function crearContador() {
  let cuenta = 0;

  return function incrementar() {
    cuenta += 1;
    return cuenta;
  };
}

const siguiente = crearContador();

console.log(siguiente()); // 1
console.log(siguiente()); // 2
```

Aunque `crearContador` terminó, la función `incrementar` todavía puede alcanzar `cuenta`. Por eso esa vinculación continúa viva.

No necesitamos dominar todavía las clausuras. El ejemplo muestra una idea fundamental: la vida de una variable no depende solamente de la línea donde fue declarada, sino de si algún código todavía puede alcanzarla.

---

## 5. Declaraciones anticipadas y zona muerta temporal

Antes de ejecutar las instrucciones de un alcance, el motor registra sus declaraciones. A este comportamiento se lo suele llamar **hoisting**. Sin embargo, `var`, `let` y `const` no quedan utilizables de la misma manera.

Con `var`, el nombre existe desde el inicio del alcance y se inicializa con `undefined`:

```js
console.log(puntaje); // undefined
var puntaje = 10;
```

Una forma conceptual de imaginarlo es:

```js
var puntaje;
console.log(puntaje);
puntaje = 10;
```

Con `let` y `const`, la vinculación también pertenece al alcance desde su comienzo, pero no puede utilizarse antes de la declaración:

```js
// console.log(puntaje); // ReferenceError
let puntaje = 10;
```

La región entre el comienzo del alcance y la inicialización se denomina **zona muerta temporal**, o *Temporal Dead Zone*.

La enseñanza práctica es sencilla:

> Declarar cada nombre cerca de su primer uso y no depender de accesos anteriores a la declaración.

---

## 6. Identificadores y convenciones de nombres

El nombre de una variable es un **identificador**. JavaScript establece reglas sintácticas para decidir qué identificadores son válidos; el equipo establece convenciones para decidir cuáles son claros.

### Reglas del lenguaje

Un identificador habitual puede contener letras, dígitos, `_` y `$`, pero no puede comenzar con un dígito:

```js
const cantidad2 = 10;    // válido
const _resultado = 20;   // válido
const $elemento = null;  // válido

// const 2cantidad = 10; // inválido
```

JavaScript distingue mayúsculas y minúsculas:

```js
const nombre = "Ana";
const Nombre = "Luis";

console.log(nombre === Nombre); // false
```

Los identificadores pueden usar muchos caracteres Unicode:

```js
const año = 2026;
```

Aunque es válido, algunos equipos prefieren limitar los identificadores a caracteres sin tildes para facilitar búsquedas, herramientas e intercambio entre distribuciones de teclado. Lo importante es acordar una convención y aplicarla de manera consistente.

Las palabras reservadas del lenguaje no pueden utilizarse como nombres de variables:

```js
// const const = 3;
// const import = "archivo";
// const if = true;
```

### Convenciones habituales

En JavaScript se utiliza normalmente **camelCase** para variables y funciones:

```js
const cantidadDeAlumnos = 35;
const fechaDeInscripcion = "2026-08-10";

function calcularPromedio() {
  // ...
}
```

El primer término comienza en minúscula y cada término siguiente comienza en mayúscula.

Otras convenciones frecuentes son:

- **PascalCase** para clases: `CuentaBancaria`, `ClientePremium`;
- **MAYUSCULAS_CON_GUIONES_BAJOS** para constantes universales o de configuración: `MAX_INTENTOS`, `IVA_GENERAL`;
- sustantivos para valores: `precio`, `alumno`, `fechaCreacion`;
- verbos para funciones: `calcularTotal`, `buscarCliente`, `enviarMensaje`;
- preguntas para booleanos: `esValido`, `tienePermiso`, `puedeEditar`;
- plurales para colecciones: `alumnos`, `productos`, `mensajes`.

No toda declaración con `const` necesita escribirse en mayúsculas. Una variable local como `const usuario = ...` no representa necesariamente una constante universal. Las mayúsculas se reservan para valores cuyo significado es fijo en todo el dominio o módulo.

### Un nombre debe expresar intención

Compárese:

```js
const p = 1200;
const c = 3;
const t = p * c;
```

con:

```js
const precioUnitario = 1200;
const cantidad = 3;
const total = precioUnitario * cantidad;
```

La segunda versión no necesita un comentario para explicar la operación.

También conviene incluir la unidad cuando puede haber ambigüedad:

```js
const duracionMs = 1500;
const distanciaKm = 12.5;
const precioCentavos = 199_900;
```

Un buen nombre no describe la sintaxis del valor; describe qué representa dentro del problema.

---

## 7. Tipos y valores primitivos

Un tipo agrupa valores que comparten una representación conceptual y un conjunto de operaciones válidas. JavaScript posee siete tipos primitivos y un gran grupo adicional: los objetos.

| Tipo | Utilidad principal | Ejemplo | Resultado de `typeof` |
|---|---|---|---|
| `boolean` | representar verdad o falsedad | `true` | `"boolean"` |
| `number` | representar cantidades enteras o decimales | `42`, `3.14` | `"number"` |
| `bigint` | representar enteros de precisión arbitraria | `9007199254740993n` | `"bigint"` |
| `string` | representar texto | `"Hola"` | `"string"` |
| `undefined` | señalar que no se asignó o no existe un valor | `undefined` | `"undefined"` |
| `null` | representar intencionalmente ausencia de valor | `null` | `"object"` por una particularidad histórica |
| `symbol` | crear identificadores únicos | `Symbol("id")` | `"symbol"` |

Todo lo que no es un valor primitivo es un **objeto**. Los arreglos, las funciones, las fechas y los objetos literales pertenecen a esta categoría general.

### Propiedades de los primitivos

Los valores primitivos son inmutables. Una operación no modifica el valor original: produce otro valor.

```js
const nombre = "ana";
const nombreEnMayusculas = nombre.toUpperCase();

console.log(nombre);              // "ana"
console.log(nombreEnMayusculas);  // "ANA"
```

Aunque una cadena es primitiva, podemos escribir `nombre.toUpperCase()`. JavaScript permite acceder a métodos mediante objetos envoltorio como `String`, `Number` y `Boolean`. Esa ayuda no significa que debamos construir esos envoltorios manualmente:

```js
const correcto = false;
const evitar = new Boolean(false);

console.log(Boolean(correcto)); // false
console.log(Boolean(evitar));   // true: todo objeto es truthy
```

Como regla general, usamos `Boolean()`, `Number()` y `String()` como funciones de conversión, sin `new`.

---

## 8. Expresiones, operadores y precedencia

Una **expresión** es una porción de código que produce un valor:

```js
2 + 3                 // produce 5
precio * cantidad     // produce un número
edad >= 18            // produce un booleano
nombre.toUpperCase()  // produce una cadena
```

Un **operador** combina, transforma o consulta operandos. En `2 + 3`, `+` es el operador y `2` y `3` son sus operandos.

### Precedencia

La precedencia determina cómo se agrupan operadores diferentes cuando no hay paréntesis:

```js
const resultado = 2 + 3 * 4;
console.log(resultado); // 14
```

La multiplicación posee mayor precedencia que la suma, por lo que la expresión se interpreta así:

```js
2 + (3 * 4)
```

Los paréntesis cambian el agrupamiento:

```js
const resultado = (2 + 3) * 4;
console.log(resultado); // 20
```

### Asociatividad

Cuando los operadores poseen la misma precedencia, la asociatividad indica cómo se agrupan:

```js
20 - 5 - 2
// (20 - 5) - 2 = 13: asociatividad de izquierda a derecha

2 ** 3 ** 2
// 2 ** (3 ** 2) = 512: exponenciación de derecha a izquierda
```

La asignación también se agrupa desde la derecha:

```js
let a;
let b;

a = b = 5;
// equivale a: a = (b = 5)
```

### Orden práctico de precedencia

No hace falta memorizar toda la tabla del lenguaje. Conviene reconocer estos grupos, ordenados aproximadamente de mayor a menor precedencia:

| Grupo | Operadores representativos |
|---|---|
| Agrupamiento y acceso | `()`, `obj.prop`, `funcion()` |
| Operadores unarios | `!`, `typeof`, `+x`, `-x`, `~` |
| Exponenciación | `**` |
| Multiplicativos | `*`, `/`, `%` |
| Aditivos | `+`, `-` |
| Desplazamiento de bits | `<<`, `>>`, `>>>` |
| Relacionales | `<`, `<=`, `>`, `>=` |
| Igualdad | `===`, `!==`, `==`, `!=` |
| Bit a bit | `&`, luego `^`, luego `|` |
| AND lógico | `&&` |
| OR lógico y valor nulo | `||`, `??` |
| Condicional | `condicion ? valor1 : valor2` |
| Asignación | `=`, `+=`, `-=`, `*=`, entre otros |

Si la lectura de una expresión exige recordar varios niveles, los paréntesis pueden hacer explícita la intención:

```js
const puedeIngresar = estaActivo && (esDocente || esAlumno);
```

Los paréntesis no son solamente una herramienta matemática. También son documentación.

---

## 9. Booleanos: representar decisiones

El tipo `boolean` posee solamente dos valores:

```js
const activo = true;
const bloqueado = false;
```

Sus literales son `true` y `false`, siempre en minúsculas. Se utilizan para representar condiciones, resultados de comparaciones y estados con dos posibilidades.

Un nombre booleano debería poder leerse como una pregunta:

```js
const esMayorDeEdad = edad >= 18;
const tieneSaldo = saldo > 0;
const puedeComprar = esMayorDeEdad && tieneSaldo;
```

### Operadores de comparación

Las comparaciones producen booleanos:

| Operador | Significado |
|---|---|
| `<` | menor que |
| `<=` | menor o igual que |
| `>` | mayor que |
| `>=` | mayor o igual que |
| `===` | igualdad estricta |
| `!==` | desigualdad estricta |
| `==` | igualdad con conversión automática |
| `!=` | desigualdad con conversión automática |

Para código de aplicación se prefieren `===` y `!==`:

```js
console.log(5 === 5);   // true
console.log(5 === "5"); // false

console.log(5 == "5");  // true: convierte antes de comparar
```

La igualdad estricta no intenta convertir tipos. Esto vuelve la expresión más local y predecible: si comparamos un número, esperamos realmente un número.

### Operadores lógicos

| Operador | Nombre | Idea |
|---|---|---|
| `!a` | NOT | niega la condición |
| `a && b` | AND | ambas condiciones deben ser verdaderas |
| `a \|\| b` | OR | al menos una condición debe ser verdadera |

Cuando los operandos son booleanos, su tabla de verdad es:

| `a` | `b` | `!a` | `a && b` | `a \|\| b` |
|---|---|---|---|---|
| `false` | `false` | `true` | `false` | `false` |
| `false` | `true` | `true` | `false` | `true` |
| `true` | `false` | `false` | `false` | `true` |
| `true` | `true` | `false` | `true` | `true` |

```js
const tieneUsuario = true;
const tieneClave = true;

const puedeIniciarSesion = tieneUsuario && tieneClave;
const necesitaAyuda = !puedeIniciarSesion;
```

`!` tiene mayor precedencia que `&&`, y `&&` tiene mayor precedencia que `||`:

```js
const permitido = esAdministrador || esDocente && estaActivo;

// Se interpreta como:
const permitidoExplicito = esAdministrador || (esDocente && estaActivo);
```

Aunque los resultados coincidan, los paréntesis pueden comunicar mejor la regla de negocio.

### Contextos booleanos

JavaScript permite utilizar cualquier valor donde espera una condición:

```js
if (nombre) {
  console.log("El nombre no está vacío");
}
```

Antes de decidir, convierte conceptualmente el valor a booleano. Los valores que se convierten en `false` se denominan **falsy**. Los demás son **truthy**.

Los valores falsy habituales son:

```js
false
0
-0
0n
""          // cadena vacía
null
undefined
NaN
```

Todo lo demás es truthy, incluyendo valores que a primera vista pueden confundir:

```js
Boolean("false") // true: es una cadena no vacía
Boolean("0")     // true: es una cadena no vacía
Boolean([])      // true: es un objeto
Boolean({})      // true: es un objeto
```

Los navegadores conservan además una excepción histórica y muy particular, `document.all`, que se comporta como falsy. No es un valor que deba utilizarse para diseñar aplicaciones.

Podemos convertir explícitamente mediante `Boolean()` o una doble negación:

```js
const tieneNombre = Boolean(nombre);
const tieneCorreo = !!correo;
```

`Boolean()` suele expresar mejor la intención para quien está aprendiendo. `!!` es una forma idiomática basada en negar dos veces.

Los booleanos no necesitan una gran colección de métodos propios. La mayor parte de su utilidad proviene de las comparaciones, los operadores lógicos y la función de conversión `Boolean()`.

### Evaluación de cortocircuito

`&&` y `||` evalúan de izquierda a derecha y pueden evitar el operando derecho:

```js
const usuario = null;

usuario && console.log(usuario.nombre);
// console.log no se ejecuta porque usuario es falsy
```

Esto se denomina **cortocircuito**. El operando izquierdo ya puede determinar si es necesario continuar.

Además, `&&` y `||` no siempre devuelven `true` o `false`: devuelven uno de sus operandos originales.

```js
console.log("Ana" && "Docente"); // "Docente"
console.log("" && "Docente");    // ""

console.log("" || "Sin nombre");    // "Sin nombre"
console.log("Ana" || "Sin nombre"); // "Ana"
```

Las reglas son:

- `a && b` devuelve el primer operando falsy; si no encuentra ninguno, devuelve el último.
- `a || b` devuelve el primer operando truthy; si no encuentra ninguno, devuelve el último.

El operador de coalescencia nula, `??`, se parece a `||`, pero solo usa el valor alternativo cuando el primero es `null` o `undefined`:

```js
const cantidad = 0;

console.log(cantidad || 10); // 10: 0 es falsy
console.log(cantidad ?? 10); // 0: no es null ni undefined
```

`??` resulta preferible cuando `0`, `false` o `""` son valores válidos.

No se puede mezclar `??` directamente con `&&` o `||` sin paréntesis:

```js
const valor = (entrada || respaldo) ?? valorFinal;
```

---

## 10. Números: cantidades y operaciones

JavaScript posee dos tipos numéricos primitivos:

- `number`, para la mayoría de los cálculos;
- `bigint`, para enteros cuya magnitud o precisión supera el rango entero seguro de `number`.

### 10.1 El tipo `number`

`number` utiliza el formato binario IEEE 754 de doble precisión. El mismo tipo representa enteros, decimales, infinitos y el valor especial `NaN`.

```js
const alumnos = 35;
const temperatura = 21.5;
const saldo = -1500;
```

JavaScript no posee tipos primitivos separados llamados `int`, `float` o `double`. Todos esos literales habituales son valores `number`.

### Formas de escribir literales numéricos

```js
const decimal = 255;
const conDecimales = 3.1416;
const exponencial = 1.5e3;       // 1500
const binario = 0b11111111;      // 255
const octal = 0o377;             // 255
const hexadecimal = 0xff;        // 255
const legible = 1_000_000;       // 1000000
```

Los prefijos indican la base de representación del literal. Una vez creado, el valor no “recuerda” si fue escrito en decimal, binario o hexadecimal: sigue siendo el mismo número.

Los separadores `_` mejoran la lectura y no forman parte del valor.

### Operadores aritméticos

| Operador | Operación | Ejemplo | Resultado |
|---|---|---|---:|
| `+` | suma | `7 + 3` | `10` |
| `-` | resta | `7 - 3` | `4` |
| `*` | multiplicación | `7 * 3` | `21` |
| `/` | división | `7 / 2` | `3.5` |
| `%` | resto | `7 % 3` | `1` |
| `**` | potencia | `2 ** 3` | `8` |
| `++` | incremento | `contador++` | suma uno |
| `--` | decremento | `contador--` | resta uno |

El resto `%` permite, por ejemplo, reconocer números pares:

```js
const numero = 14;
const esPar = numero % 2 === 0;
```

Los operadores de asignación combinada expresan actualización:

```js
let total = 100;

total += 20; // total = total + 20
total *= 2;  // total = total * 2
```

Conviene utilizar `++` y `--` cuando su propósito de contador sea evidente. En expresiones más complejas, sus variantes prefija y sufija pueden producir diferencias difíciles de leer:

```js
let a = 5;
const antes = a++; // antes vale 5; luego a vale 6

let b = 5;
const despues = ++b; // primero b vale 6; despues vale 6
```

### Comparaciones numéricas

```js
const edad = 20;

console.log(edad >= 18); // true
console.log(edad < 65);  // true
console.log(edad === 20); // true
```

Si los operandos poseen tipos distintos, algunos operadores comparativos realizan conversiones. La práctica recomendada es convertir las entradas en la frontera y comparar valores del mismo tipo.

### Valores numéricos especiales

```js
console.log(1 / 0);       // Infinity
console.log(-1 / 0);      // -Infinity
console.log(Number("x")); // NaN
```

`NaN` significa *Not a Number*, pero su tipo sigue siendo `number`:

```js
console.log(typeof NaN); // "number"
```

Además, `NaN` no es igual a sí mismo:

```js
console.log(NaN === NaN);        // false
console.log(Number.isNaN(NaN));  // true
```

Para comprobarlo debe utilizarse `Number.isNaN()`.

### Precisión y enteros seguros

Los decimales se representan en binario y algunos no pueden almacenarse exactamente:

```js
console.log(0.1 + 0.2);         // 0.30000000000000004
console.log(0.1 + 0.2 === 0.3); // false
```

No es un error exclusivo de JavaScript, sino una consecuencia de la representación binaria de punto flotante.

Para cantidades monetarias suele ser conveniente trabajar con la unidad mínima como entero:

```js
const precioCentavos = 199_900;
```

`number` representa exactamente los enteros desde `Number.MIN_SAFE_INTEGER` hasta `Number.MAX_SAFE_INTEGER`:

```js
console.log(Number.MAX_SAFE_INTEGER); // 9007199254740991
```

Fuera de ese rango, dos enteros matemáticamente distintos pueden compartir la misma representación.

### Funciones y métodos numéricos habituales

El objeto estándar `Number` ofrece comprobaciones y conversiones:

```js
Number.isFinite(25);        // true
Number.isInteger(25.0);     // true
Number.isSafeInteger(25);   // true
Number.isNaN(NaN);          // true

Number.parseInt("42", 10);    // 42
Number.parseFloat("3.14");    // 3.14
```

Siempre conviene indicar la base al utilizar `parseInt`:

```js
Number.parseInt("101", 2);  // 5
Number.parseInt("101", 10); // 101
```

Los valores numéricos exponen métodos de formato:

```js
const precio = 1234.567;

precio.toFixed(2);       // "1234.57"
precio.toPrecision(4);   // "1235"
precio.toString(16);     // "4d2.9126e978d5"
```

Estos métodos devuelven cadenas. Formatear no modifica el valor numérico original.

El objeto estándar `Math` reúne operaciones matemáticas:

```js
Math.abs(-8);          // 8
Math.round(3.6);       // 4
Math.floor(3.9);       // 3
Math.ceil(3.1);        // 4
Math.trunc(3.9);       // 3
Math.min(4, 2, 9);     // 2
Math.max(4, 2, 9);     // 9
Math.sqrt(81);         // 9
Math.pow(2, 3);        // 8, equivalente a 2 ** 3
Math.random();         // valor desde 0 inclusive hasta 1 exclusivo
```

`Math.random()` resulta útil para simulaciones o juegos simples, pero no genera aleatoriedad apta para contraseñas, tokens o seguridad.

### 10.2 Operadores orientados a bits

Los operadores bit a bit trabajan con la representación binaria de enteros.

| Operador | Operación |
|---|---|
| `a & b` | AND bit a bit |
| `a \| b` | OR bit a bit |
| `a ^ b` | XOR bit a bit |
| `~a` | NOT bit a bit |
| `a << n` | desplazamiento a la izquierda |
| `a >> n` | desplazamiento a la derecha con signo |
| `a >>> n` | desplazamiento a la derecha sin signo |

Ejemplo con `5` y `3`:

```text
5 = 0101
3 = 0011

5 & 3 = 0001 = 1
5 | 3 = 0111 = 7
5 ^ 3 = 0110 = 6
```

```js
console.log(5 & 3);  // 1
console.log(5 | 3);  // 7
console.log(5 ^ 3);  // 6
console.log(5 << 1); // 10
console.log(5 >> 1); // 2
```

Un uso real consiste en representar banderas o permisos:

```js
const LEER = 1 << 0;      // 001
const EDITAR = 1 << 1;    // 010
const ELIMINAR = 1 << 2;  // 100

const permisos = LEER | EDITAR; // 011
const puedeEditar = (permisos & EDITAR) !== 0;
```

Cuando operan sobre valores `number`, los operadores de bits los convierten a enteros de 32 bits. Por eso no deben utilizarse como atajo general para truncar decimales ni para procesar enteros grandes.

### 10.3 El tipo `bigint`

`bigint` representa enteros de precisión arbitraria. Su literal termina con `n`:

```js
const poblacionEstelar = 9_007_199_254_740_993n;
const otro = BigInt("9007199254740993");
```

No representa decimales:

```js
const cociente = 5n / 2n;
console.log(cociente); // 2n: descarta la parte fraccionaria
```

No se mezclan directamente `number` y `bigint` en operaciones aritméticas:

```js
// 10n + 2; // TypeError
10n + 2n;   // 12n
```

La conversión debe ser explícita y solo debe realizarse después de considerar si puede perder precisión:

```js
BigInt(10); // 10n
Number(10n); // 10
```

`bigint` soporta la mayoría de los operadores aritméticos y de bits, pero no el desplazamiento sin signo `>>>`.

---

## 11. Cadenas: representar texto

El tipo `string` representa secuencias de texto. JavaScript ofrece tres formas habituales de escribir literales de cadena.

### Comillas simples y dobles

```js
const simple = 'Hola';
const doble = "Hola";
```

No existe una diferencia de comportamiento entre ambas. Se elige una convención para el proyecto y se utiliza la otra cuando evita escapes innecesarios:

```js
const frase1 = "La materia se llama 'Programación IV'";
const frase2 = 'El alumno respondió "presente"';
```

También puede escaparse un carácter con `\`:

```js
const mensaje = "Ella dijo: \"Hola\"";
const ruta = "C:\\documentos\\clase";
const dosLineas = "Primera línea\nSegunda línea";
const tabulado = "Nombre\tNota";
```

Algunas secuencias de escape frecuentes son:

| Secuencia | Significado |
|---|---|
| `\n` | nueva línea |
| `\t` | tabulación |
| `\\` | barra invertida |
| `\"` | comilla doble |
| `\'` | comilla simple |

### Comillas invertidas y plantillas literales

Las comillas invertidas —*backticks*— crean plantillas literales:

```js
const nombre = "Ana";
const nota = 9;

const resumen = `${nombre} obtuvo ${nota} puntos`;
```

La construcción `${expresion}` evalúa la expresión, convierte su resultado a texto y lo inserta:

```js
const precio = 1200;
const cantidad = 3;

const detalle = `Total: $${precio * cantidad}`;
// "Total: $3600"
```

Esto se denomina **interpolación**. Suele ser más legible que concatenar muchas partes:

```js
const concatenado = nombre + " obtuvo " + nota + " puntos";
const interpolado = `${nombre} obtuvo ${nota} puntos`;
```

Las plantillas también pueden ocupar varias líneas:

```js
const correo = `Hola, ${nombre}:

Tu inscripción fue confirmada.
Saludos.`;
```

Los saltos y espacios escritos entre los backticks forman parte de la cadena resultante.

### Las cadenas son inmutables

No podemos cambiar un carácter dentro de una cadena existente:

```js
const lenguaje = "javascript";

lenguaje[0] = "J"; // no modifica la cadena

const corregido = "J" + lenguaje.slice(1);
console.log(corregido); // "Javascript"
```

Los métodos crean nuevas cadenas.

### Operadores de cadenas

`+` concatena cuando la operación involucra una cadena:

```js
const nombreCompleto = "Ana" + " " + "Pérez";
```

`+=` concatena y reasigna:

```js
let mensaje = "Hola";
mensaje += ", Ana";
```

Las comparaciones entre cadenas son lexicográficas y sensibles a mayúsculas, minúsculas y Unicode:

```js
console.log("Ana" === "ana"); // false
console.log("20" < "3");      // true: compara como texto
```

La segunda expresión no compara veinte con tres. Compara los caracteres iniciales `"2"` y `"3"`.

### Propiedades y métodos habituales

```js
const materia = "  Programación IV  ";

materia.length;                 // 19, incluye espacios
materia.trim();                 // "Programación IV"
materia.toUpperCase();          // "  PROGRAMACIÓN IV  "
materia.toLowerCase();          // "  programación iv  "
materia.includes("IV");         // true
materia.startsWith("Programa"); // false: comienza con espacios
materia.endsWith("IV");         // false: termina con espacios
```

Para extraer y buscar partes:

```js
const codigo = "TUP-P4-2026";

codigo[0];                // "T"
codigo.at(-1);            // "6"
codigo.indexOf("P4");     // 4
codigo.slice(0, 3);       // "TUP"
codigo.substring(4, 6);   // "P4"
```

Para reemplazar y dividir:

```js
"hola mundo".replace("mundo", "curso");
// "hola curso"

"uno, dos, tres".split(", ");
// ["uno", "dos", "tres"]
```

`replace()` reemplaza la primera coincidencia textual. `replaceAll()` reemplaza todas:

```js
"1-2-3".replaceAll("-", "/"); // "1/2/3"
```

Los métodos pueden encadenarse porque cada uno devuelve un nuevo valor:

```js
const entrada = "  ANA@EJEMPLO.COM ";
const correoNormalizado = entrada.trim().toLowerCase();
```

### Una nota sobre longitud y Unicode

`length` cuenta unidades de código UTF-16, no necesariamente los caracteres que una persona percibe en pantalla:

```js
console.log("😀".length); // 2
```

Para la mayoría de los textos iniciales esto no genera dificultad. En sistemas internacionales, cortar cadenas por índices requiere considerar Unicode con mayor cuidado.

---

## 12. `undefined` y `null`: dos formas de ausencia

Ambos valores expresan que no hay un dato utilizable, pero comunican intenciones diferentes.

### `undefined`

`undefined` suele indicar que un valor todavía no fue asignado, que una propiedad no existe o que una función no devolvió un resultado explícito:

```js
let telefono;
console.log(telefono); // undefined

const alumno = { nombre: "Ana" };
console.log(alumno.telefono); // undefined

function registrar() {
  console.log("Registrado");
}

console.log(registrar()); // undefined
```

Técnicamente, `undefined` es un valor global y no un literal especial de la gramática como `null`, aunque en el uso cotidiano se escribe directamente.

### `null`

`null` representa normalmente una ausencia elegida de manera intencional:

```js
const fechaDeBaja = null;
```

Aquí no olvidamos asignar el dato: afirmamos que el alumno no posee fecha de baja.

Una particularidad histórica es:

```js
console.log(typeof null); // "object"
```

Eso no convierte a `null` en un objeto. Para comprobarlo se utiliza igualdad estricta:

```js
if (fechaDeBaja === null) {
  console.log("El alumno continúa activo");
}
```

`null` y `undefined` se comparan así:

```js
null === undefined; // false
null == undefined;  // true, por la regla especial de igualdad flexible
```

El operador `??` permite tratar ambos como ausencia sin descartar otros valores falsy válidos.

---

## 13. `symbol`: identificadores únicos

Un `symbol` es un valor primitivo único e inmutable. No posee sintaxis literal; se crea mediante `Symbol()`:

```js
const idInterno = Symbol("id");
const otroId = Symbol("id");

console.log(idInterno === otroId); // false
```

La descripción `"id"` ayuda a depurar, pero no determina la identidad. Cada llamada crea un valor diferente.

Su uso principal es actuar como clave de propiedades sin colisionar con otras claves:

```js
const identificador = Symbol("identificador");

const alumno = {
  nombre: "Ana",
  [identificador]: 123,
};
```

Es un tipo básico del lenguaje, aunque aparece con menos frecuencia en los primeros programas. También existen símbolos estándar que permiten personalizar ciertos comportamientos internos de los objetos.

---

## 14. Inspeccionar el tipo con `typeof`

El operador `typeof` devuelve una cadena que describe el tipo general de un valor:

```js
typeof true;          // "boolean"
typeof 42;            // "number"
typeof 42n;           // "bigint"
typeof "hola";        // "string"
typeof undefined;     // "undefined"
typeof Symbol("id");  // "symbol"
typeof {};            // "object"
typeof [];            // "object"
typeof function () {}; // "function"
typeof null;          // "object", particularidad histórica
```

`typeof` distingue bien la mayoría de los primitivos, pero no alcanza para clasificar todos los objetos. Para un arreglo se utiliza:

```js
Array.isArray([]); // true
```

Y para comprobar `null`:

```js
valor === null;
```

---

## 15. Conversiones explícitas

Convertir un tipo significa producir un nuevo valor de otro tipo. Cuando la conversión aparece escrita por el programador es **explícita**.

### Convertir a cadena

```js
String(42);        // "42"
String(true);      // "true"
String(null);      // "null"
String(undefined); // "undefined"
```

Los números también pueden expresarse en otras bases:

```js
const valor = 255;

valor.toString(2);  // "11111111"
valor.toString(16); // "ff"
```

### Convertir a número

```js
Number("42");       // 42
Number("3.14");     // 3.14
Number("");         // 0
Number("   ");      // 0
Number(true);       // 1
Number(false);      // 0
Number(null);       // 0
Number(undefined);  // NaN
Number("42px");     // NaN
```

`Number()` exige que la cadena completa represente un número, aparte de espacios laterales. `Number.parseInt()` y `Number.parseFloat()` pueden leer un prefijo numérico:

```js
Number.parseInt("42px", 10);  // 42
Number.parseFloat("3.14kg");  // 3.14
```

Esa tolerancia puede ser útil al analizar formatos controlados, pero también puede aceptar una entrada que debería rechazarse. La función se elige según la regla del problema.

Una conversión robusta de un campo numérico puede escribirse así:

```js
function convertirCantidad(entrada) {
  const texto = entrada.trim();

  if (texto === "") {
    throw new Error("La cantidad es obligatoria");
  }

  const cantidad = Number(texto);

  if (!Number.isInteger(cantidad) || cantidad < 0) {
    throw new Error("La cantidad debe ser un entero no negativo");
  }

  return cantidad;
}
```

Convertir y validar son pasos distintos: `Number("-2")` convierte correctamente, pero la regla de negocio puede rechazar el resultado.

### Convertir a booleano

```js
Boolean(1);         // true
Boolean(0);         // false
Boolean("hola");    // true
Boolean("");        // false
Boolean("false");   // true
Boolean(null);      // false
```

`Boolean()` no interpreta el significado humano de la palabra `"false"`. Solo aplica la regla de truthy y falsy: toda cadena no vacía es truthy.

### Convertir a `bigint`

```js
BigInt("9007199254740993"); // 9007199254740993n
BigInt(42);                 // 42n
```

Una cadena decimal produce un error porque `bigint` solamente representa enteros:

```js
// BigInt("3.14"); // SyntaxError
```

---

## 16. Coerción: la conversión automática de tipos

JavaScript también convierte valores de manera automática. Esa conversión implícita se denomina **coerción**.

No se trata de decisiones aleatorias del motor. Cada operador y cada contexto poseen reglas definidas por el lenguaje. La dificultad aparece cuando esas reglas no coinciden con la intención del programador.

### 16.1 Contextos booleanos

Las condiciones de `if`, `while`, el operador ternario y los operadores lógicos aplican la conversión booleana:

```js
if ("hola") {
  console.log("Se ejecuta porque la cadena es truthy");
}
```

No cambian el valor original; lo interpretan como condición.

### 16.2 Interpolación y conversión a texto

Una expresión dentro de una plantilla se convierte a cadena:

```js
const cantidad = 3;
const disponible = true;

`${cantidad}`;  // "3"
`${disponible}`; // "true"
```

### 16.3 La regla especial del operador `+`

`+` puede representar suma numérica o concatenación. Después de obtener valores primitivos, si uno de los operandos es una cadena, concatena como texto:

```js
5 + 2;       // 7
"5" + 2;     // "52"
5 + "2";     // "52"
"5" + true;  // "5true"
```

La evaluación ocurre de izquierda a derecha:

```js
1 + 2 + "3"; // "33": primero 1 + 2, después 3 + "3"
"1" + 2 + 3; // "123": la concatenación comienza desde el primer paso
```

Los paréntesis pueden cambiar el resultado:

```js
"Total: " + 2 + 3;   // "Total: 23"
"Total: " + (2 + 3); // "Total: 5"
```

La interpolación suele expresar mejor esta intención:

```js
`Total: ${2 + 3}`; // "Total: 5"
```

### 16.4 Los demás operadores aritméticos

`-`, `*`, `/`, `%` y `**` no concatenan. Intentan convertir sus operandos a valores numéricos compatibles:

```js
"10" - 2; // 8
"10" * 2; // 20
"10" / 2; // 5
"10" ** 2; // 100
```

Si la conversión no produce un número válido, el resultado suele ser `NaN`:

```js
"diez" * 2; // NaN
```

Que una operación “funcione” no demuestra que la entrada poseía el tipo correcto:

```js
const precio = 1200;
const cantidad = "2";

precio * cantidad; // 2400
precio + cantidad; // "12002"
```

La solución es convertir una vez, validar y luego operar con un tipo conocido.

### 16.5 Comparaciones relacionales

Si ambos operandos son cadenas, `<`, `>`, `<=` y `>=` comparan lexicográficamente. En otros casos habituales intentan una comparación numérica:

```js
"20" < "3"; // true: comparación textual
20 < "3";   // false: "3" se convierte a 3
```

Evitar operandos de tipos diferentes vuelve la comparación más fácil de revisar.

### 16.6 Igualdad flexible y estricta

`==` y `!=` aplican un algoritmo de conversión cuando los tipos no coinciden:

```js
0 == false;          // true
"" == 0;             // true
"5" == 5;            // true
null == undefined;  // true
```

`===` y `!==` no convierten:

```js
0 === false;          // false
"" === 0;             // false
"5" === 5;            // false
null === undefined;  // false
```

Por eso la igualdad estricta debe ser la opción habitual. La igualdad flexible posee reglas válidas y deterministas, pero obliga a conocer más información para interpretar una línea.

### 16.7 Coerciones limitadas para `bigint` y `symbol`

JavaScript evita algunas conversiones automáticas que podrían perder información o resultar ambiguas:

```js
// 1n + 1;        // TypeError: mezcla bigint y number
// +1n;           // TypeError: el + unario no admite bigint
// "id: " + Symbol("id"); // TypeError
```

Las conversiones deben hacerse de manera explícita cuando correspondan:

```js
1n + BigInt(1);             // 2n
`id: ${String(Symbol("id"))}`; // "id: Symbol(id)"
```

---

## 17. Una estrategia segura para datos de entrada

Los formularios, parámetros de URL, archivos y cuerpos HTTP llegan frecuentemente como texto o como datos cuya forma no controlamos. Una secuencia saludable es:

```text
entrada externa
      ↓
comprobar presencia y formato
      ↓
convertir explícitamente
      ↓
validar reglas del dominio
      ↓
operar con un valor confiable
```

Ejemplo:

```js
const precioTexto = "1999.50";
const cantidadTexto = "3";

const precio = Number(precioTexto);
const cantidad = Number(cantidadTexto);

if (!Number.isFinite(precio) || precio < 0) {
  throw new Error("Precio inválido");
}

if (!Number.isInteger(cantidad) || cantidad <= 0) {
  throw new Error("Cantidad inválida");
}

const total = precio * cantidad;
```

Esta versión parece más extensa que confiar en la coerción, pero hace visibles las decisiones:

- qué tipos espera el cálculo;
- qué entradas son inválidas;
- en qué punto se realiza la conversión;
- qué condiciones pertenecen al negocio.

TypeScript puede agregar verificación estática alrededor de este código, pero la entrada sigue necesitando validación durante la ejecución.

---

## 18. Errores frecuentes y su explicación

### Confundir `const` con inmutabilidad profunda

```js
const configuracion = { tema: "claro" };
configuracion.tema = "oscuro"; // permitido
```

`const` impide reasignar `configuracion`; no congela el objeto.

### Usar `var` esperando alcance de bloque

```js
if (true) {
  var visible = "también afuera";
}

console.log(visible);
```

`var` posee alcance de función o global, no de bloque.

### Interpretar una cadena no vacía como su significado humano

```js
Boolean("false"); // true
```

La conversión observa si la cadena está vacía, no si contiene la palabra “false”.

### Utilizar `||` cuando cero es válido

```js
const intentos = 0;

const conOr = intentos || 3; // 3
const conNullish = intentos ?? 3; // 0
```

`||` descarta cualquier falsy. `??` reemplaza únicamente `null` o `undefined`.

### Formatear un número y creer que continúa siendo numérico

```js
const precio = 12.5;
const formateado = precio.toFixed(2);

typeof formateado; // "string"
```

`toFixed()` produce texto listo para mostrar.

### Usar `parseInt` sin decidir si se aceptará texto adicional

```js
Number.parseInt("12px", 10); // 12
Number("12px");              // NaN
```

La primera función acepta un prefijo numérico. La segunda exige una representación numérica completa.

### Comparar tipos diferentes con `==`

```js
"0" == false;  // true
"0" === false; // false
```

Convertir primero y comparar después reduce sorpresas.

---

## 19. Ideas que conviene conservar

1. Una variable vincula un nombre con un valor dentro de un alcance.
2. Declarar, inicializar y asignar son operaciones diferentes.
3. `const` evita reasignar la vinculación; no vuelve inmutable a un objeto.
4. `let` se utiliza cuando la reasignación forma parte del problema.
5. `var` posee alcance de función y reglas históricas; se evita en código moderno.
6. El alcance indica dónde puede usarse un nombre; su vida indica cuánto tiempo permanece alcanzable.
7. Los buenos nombres expresan significado y unidad, no solamente el tipo del dato.
8. JavaScript posee siete tipos primitivos: boolean, number, bigint, string, undefined, null y symbol.
9. Los valores primitivos son inmutables.
10. La precedencia determina el agrupamiento de operadores; los paréntesis hacen explícita la intención.
11. Todos los valores son truthy salvo el conjunto específico de valores falsy.
12. `&&`, `||` y `??` evalúan con cortocircuito y devuelven operandos, no necesariamente booleanos.
13. `number` representa enteros y decimales con punto flotante; no todos los decimales son exactos.
14. Los operadores de bits convierten valores `number` a enteros de 32 bits.
15. Las plantillas literales permiten interpolación y cadenas multilínea.
16. `undefined` suele expresar falta de asignación; `null`, ausencia intencional.
17. Una conversión explícita aparece escrita; una coerción es aplicada automáticamente por el contexto.
18. El operador `+` es especial porque puede sumar o concatenar.
19. La igualdad estricta evita conversiones implícitas.
20. Los datos externos deben convertirse y validarse antes de utilizarlos en reglas del sistema.

---

## 20. Preguntas de repaso

1. ¿Qué diferencia existe entre declarar, inicializar y asignar?
2. ¿Por qué se recomienda `const` como primera elección?
3. ¿En qué se diferencian el alcance de `var` y el de `let`?
4. ¿Qué es la zona muerta temporal?
5. ¿Por qué una variable capturada por una clausura puede seguir viva después de terminar una función?
6. ¿Qué reglas debe cumplir un identificador?
7. ¿Qué convención se utiliza habitualmente para variables y funciones?
8. ¿Cuáles son los siete tipos primitivos?
9. ¿Por qué `typeof null` requiere una aclaración?
10. ¿Qué diferencia existe entre precedencia y asociatividad?
11. ¿Cuáles son los valores falsy?
12. ¿Por qué `"false"` es truthy?
13. ¿Qué valor devuelve `"Ana" && "Docente"`?
14. ¿Cuándo conviene `??` en lugar de `||`?
15. ¿Por qué `0.1 + 0.2` no es exactamente `0.3`?
16. ¿Qué sucede con los operandos `number` de una operación bit a bit?
17. ¿Qué diferencias hay entre `number` y `bigint`?
18. ¿Qué permiten las comillas invertidas que no ofrecen directamente las simples o dobles?
19. ¿Qué diferencia conceptual existe entre `undefined` y `null`?
20. ¿Por qué `Number("12px")` y `Number.parseInt("12px", 10)` producen resultados distintos?
21. ¿Cómo decide `+` entre suma y concatenación?
22. ¿Por qué se recomienda `===` en lugar de `==`?

### Ejercicio 1: anticipar valores y tipos

Sin ejecutar el código, completar el valor y el tipo de cada resultado:

```js
const a = 2 + 3 * 4;
const b = (2 + 3) * 4;
const c = "2" + 3;
const d = "10" - 4;
const e = "" || "sin dato";
const f = 0 ?? 10;
const g = Boolean("false");
const h = 5n / 2n;
```

### Ejercicio 2: corregir una entrada

El siguiente programa calcula mal algunos totales:

```js
const precio = "1500.50";
const cantidad = "2";
const descuento = "10";

const subtotal = precio * cantidad;
const total = subtotal - subtotal * descuento / 100;

console.log("Total: $" + total);
```

Reescribirlo para:

1. convertir explícitamente las entradas;
2. rechazar valores no numéricos;
3. exigir una cantidad entera positiva;
4. exigir un descuento entre `0` y `100`;
5. mostrar el resultado con dos decimales mediante una plantilla literal.

### Ejercicio 3: diseñar nombres

Reemplazar los nombres poco expresivos:

```js
const x = 3000;
const y = 5;
const z = 0.21;
const r = x * y * (1 + z);
```

Indicar qué representa cada valor y qué unidad utiliza.

---

## Fuentes y lecturas recomendadas

- [Gramática, declaraciones, tipos y literales — MDN](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Guide/Grammar_and_types)
- [Tipos y estructuras de datos de JavaScript — MDN](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Guide/Data_structures)
- [Gramática léxica e identificadores — MDN](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Lexical_grammar)
- [Precedencia de operadores — MDN](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Operators/Operator_precedence)
- [Expresiones y operadores — MDN](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Guide/Expressions_and_operators)
- [Referencia de `Number` — MDN](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Number)
- [Referencia de `BigInt` — MDN](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/BigInt)
- [Plantillas literales — MDN](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Template_literals)
- [Coerción de tipos — MDN](https://developer.mozilla.org/en-US/docs/Glossary/Type_coercion)
- [ECMAScript Language Specification — TC39](https://tc39.es/ecma262/)
