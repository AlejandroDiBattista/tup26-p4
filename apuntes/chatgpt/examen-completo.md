# Examen completo

---

# Examen de fundamentos de JavaScript y computación digital

## Introducción a JavaScript

---

### Origen del lenguaje

1) ¿Qué necesidad de la Web original motivó la creación de JavaScript?

☐ Definir la presentación visual de las páginas sin utilizar CSS.
☑ Incorporar comportamiento en el navegador y responder inmediatamente a eventos del usuario.
☐ Reemplazar los servidores web por programas ejecutados únicamente en el cliente.

---

### JavaScript y ECMAScript

2) ¿Cuál es la relación correcta entre ECMAScript y JavaScript?

☑ ECMAScript es la especificación estandarizada y JavaScript es el nombre habitual de sus implementaciones y ecosistema.
☐ JavaScript es la especificación y ECMAScript es un motor exclusivo de los navegadores.
☐ Son dos lenguajes incompatibles que solamente comparten una sintaxis parecida.

---

### Ejecución moderna

3) ¿Por qué resulta incompleto afirmar que JavaScript es solamente interpretado?

☐ Porque ECMAScript exige que todo el programa se compile antes de iniciarse.
☐ Porque los navegadores convierten siempre JavaScript en TypeScript antes de ejecutarlo.
☑ Porque los motores modernos combinan interpretación, representaciones intermedias y compilación JIT.

---

### Compilación JIT

4) ¿Qué información puede aprovechar un compilador JIT durante la ejecución?

☐ Únicamente los comentarios y nombres de variables escritos por el programador.
☑ Qué funciones se usan con frecuencia y qué clases de valores reciben habitualmente.
☐ Las futuras entradas del usuario antes de que sean proporcionadas al programa.

---

### TypeScript y transpilación

5) ¿Qué ocurre con las anotaciones de tipos de TypeScript al producir JavaScript?

☐ Permanecen en el archivo y el motor las verifica en cada operación.
☐ Se convierten automáticamente en validaciones para formularios y respuestas HTTP.
☑ Desaparecen durante la transpilación después de ayudar a verificar el programa.

---

### Lenguaje, motor y entorno

6) ¿Qué capa proporciona capacidades como el DOM en un navegador o el sistema de archivos en Node.js?

☑ El entorno de ejecución o anfitrión.
☐ La sintaxis central de ECMAScript.
☐ El verificador estático de TypeScript.

---

### APIs del navegador

7) ¿Por qué `document.querySelector()` no está disponible normalmente en Node.js?

☐ Porque Node.js solo admite JavaScript anterior a ECMAScript 2015.
☑ Porque `document` y el DOM son APIs provistas por el navegador, no por el núcleo del lenguaje.
☐ Porque V8 no puede ejecutar funciones relacionadas con eventos.

---

### Frontend y seguridad

8) ¿Cuál es la responsabilidad correcta al validar datos en una aplicación web?

☑ El frontend puede mejorar la experiencia, pero el backend debe validar nuevamente los datos importantes.
☐ Si el frontend valida un formulario, el backend puede confiar completamente en la solicitud recibida.
☐ La validación debe realizarse solo en el navegador para evitar duplicar reglas.

---

### Sistemas de tipos

9) ¿Qué distingue al tipado dinámico de la coerción de tipos?

☐ El tipado dinámico obliga a convertir todo valor manualmente y la coerción impide cambiarlo.
☐ Son dos nombres equivalentes para describir que un lenguaje no posee tipos.
☑ El tipado dinámico indica cuándo se controlan los tipos; la coerción describe conversiones automáticas entre ellos.

---

### Fronteras de datos

10) ¿Por qué una interfaz TypeScript no basta para confiar en una respuesta recibida mediante `fetch()`?

☑ Porque los tipos estáticos no verifican automáticamente la forma real de los datos externos durante la ejecución.
☐ Porque `fetch()` elimina todas las propiedades cuyos valores son numéricos.
☐ Porque TypeScript solamente puede describir datos creados dentro del navegador.

---

## Variables y tipos básicos

---

### Constantes y mutación

11) ¿Qué demuestra este código?

```js
const alumno = { nombre: "Ana", regular: true };
alumno.regular = false;
```

☐ Que una declaración `const` convierte el objeto en un valor primitivo.
☐ Que el código produce siempre un `TypeError` al cambiar una propiedad.
☑ Que `const` impide reasignar la vinculación, pero no vuelve inmutable el interior del objeto.

---

### Alcance de bloque

12) ¿Qué sucede al intentar usar `mensaje` después del bloque?

```js
if (true) {
  let mensaje = "Hola";
}

console.log(mensaje);
```

☐ Se imprime `undefined` porque `let` se eleva inicializada.
☑ Se produce un `ReferenceError` porque `let` posee alcance de bloque.
☐ Se imprime `"Hola"` porque todos los bloques comparten el alcance global.

---

### Zona muerta temporal

13) ¿Qué describe la zona muerta temporal de una declaración con `let` o `const`?

☑ El período desde el inicio del alcance hasta la inicialización, durante el cual no puede accederse a la vinculación.
☐ El tiempo posterior a la última asignación, cuando el valor se convierte en `null`.
☐ El intervalo en el que una variable declarada con `var` conserva el valor `undefined`.

---

### Identificadores expresivos

14) ¿Cuál es el nombre más apropiado para una variable que guarda una duración medida en milisegundos?

☐ `d`
☐ `valorNumero`
☑ `duracionMs`

---

### Tipos primitivos

15) ¿Cuál lista contiene únicamente los siete tipos primitivos de JavaScript?

☑ `boolean`, `number`, `bigint`, `string`, `undefined`, `null` y `symbol`.
☐ `boolean`, `integer`, `float`, `string`, `array`, `null` y `object`.
☐ `number`, `string`, `array`, `object`, `map`, `set` y `function`.

---

### Precedencia de operadores

16) ¿Qué valor se asigna a `resultado`?

```js
const resultado = 2 + 3 * 4;
```

☐ `20`, porque la suma siempre se evalúa primero.
☑ `14`, porque la multiplicación tiene mayor precedencia que la suma.
☐ `24`, porque todos los operadores se aplican de derecha a izquierda.

---

### Coalescencia nula

17) ¿Qué valores se obtienen?

```js
const cantidad = 0;
const a = cantidad || 10;
const b = cantidad ?? 10;
```

☐ `a` vale `0` y `b` vale `10`.
☑ `a` vale `10` y `b` vale `0`.
☐ Tanto `a` como `b` valen `10`.

---

### Operador `typeof`

18) ¿Cuál es la interpretación correcta de `typeof null`?

☐ Devuelve `"null"`, como ocurre con todos los primitivos.
☐ Devuelve `"undefined"` porque representa ausencia de valor.
☑ Devuelve `"object"` por una particularidad histórica, aunque `null` no sea un objeto.

---

### Conversión numérica

19) ¿Qué diferencia existe entre estas conversiones?

```js
Number("12px");
Number.parseInt("12px", 10);
```

☑ `Number()` produce `NaN` y `parseInt()` produce `12` al aceptar un prefijo numérico.
☐ Ambas producen `12` porque ignoran cualquier texto posterior.
☐ `Number()` produce `12` y `parseInt()` produce `NaN` porque exige convertir toda la cadena.

---

### Formato de números

20) ¿Cuál es el tipo del resultado de `(12.5).toFixed(2)`?

☐ `number`, porque conserva dos decimales exactos.
☑ `string`, porque `toFixed()` produce texto formateado.
☐ `bigint`, porque elimina el error de punto flotante.

---

## El tipo booleano

---

### Valores falsy

21) ¿Cuál de estos grupos contiene solamente valores falsy?

☑ `0`, `""`, `null`, `undefined` y `NaN`.
☐ `"0"`, `[]`, `{}`, `false` y `1`.
☐ `"false"`, `-1`, `0n`, `[]` y `null`.

---

### Valores truthy

22) ¿Cuál afirmación es correcta?

☐ Una cadena es falsy cuando contiene la palabra `"false"`.
☐ Los arrays y objetos vacíos son falsy porque no contienen elementos.
☑ `"false"`, `"0"`, `[]` y `{}` son valores truthy.

---

### Truthy no significa `true`

23) ¿Qué resultados producen estas expresiones?

```js
"Hola" === true;
Boolean("Hola");
```

☐ Ambas producen `true`.
☑ La primera produce `false` y la segunda produce `true`.
☐ La primera produce `true` y la segunda produce `false`.

---

### Doble negación

24) ¿Para qué se utiliza habitualmente `!!valor`?

☑ Para convertir un valor a su booleano equivalente mediante dos negaciones.
☐ Para comprobar que un valor es estrictamente distinto de `false`.
☐ Para transformar cualquier valor falsy en el número `0`.

---

### AND y cortocircuito

25) ¿Qué devuelve `10 && 0 && 30`?

☐ `30`, porque `&&` siempre devuelve el último operando.
☑ `0`, porque es el primer valor falsy y la evaluación se detiene allí.
☐ `false`, porque `&&` convierte siempre su resultado a booleano.

---

### AND con operandos truthy

26) ¿Qué devuelve `"Ana" && 25 && "Hola"`?

☐ `true`, porque todos los operandos son truthy.
☐ `"Ana"`, porque `&&` devuelve el primer truthy.
☑ `"Hola"`, porque no aparece ningún falsy y se devuelve el último operando.

---

### OR y selección de valores

27) ¿Qué devuelve `"" || null || "Juan" || "Pedro"`?

☑ `"Juan"`, porque es el primer valor truthy.
☐ `"Pedro"`, porque `||` evalúa siempre todos los operandos.
☐ `true`, porque el resultado lógico de la expresión es verdadero.

---

### OR sin valores truthy

28) ¿Qué devuelve `0 || "" || null`?

☐ `false`, porque todos los operandos son falsy.
☑ `null`, porque al no encontrar un truthy se devuelve el último operando.
☐ `0`, porque `||` devuelve siempre el primer operando.

---

### Efectos evitados

29) ¿Qué ocurre en este código?

```js
function prueba() {
  console.log("Se ejecutó");
  return true;
}

false && prueba();
```

☐ `prueba()` se ejecuta y luego la expresión devuelve `false`.
☐ Se produce un error porque `false` no es una función.
☑ `prueba()` no se ejecuta debido al cortocircuito de `&&`.

---

### Operandos como resultado

30) ¿Por qué `nombreIngresado || "Anónimo"` puede utilizarse para elegir un valor?

☐ Porque `||` convierte ambos operandos a cadenas antes de compararlos.
☐ Porque `||` devuelve siempre el operando derecho sin evaluar el izquierdo.
☑ Porque `||` devuelve el primer operando truthy o, si no existe, el último.

---

## Tipos compuestos: arrays, objetos, Map y Set

---

### Elegir una estructura

31) ¿Qué estructura expresa mejor una secuencia ordenada de notas?

☐ Un objeto cuyas claves deban inventarse para cada posición.
☑ Un array, porque organiza elementos por índices y conserva su orden.
☐ Un `Set`, porque cada nota debe ser necesariamente diferente.

---

### Acceso desde el final

32) ¿Qué devuelve `[8, 6, 9].at(-1)`?

☑ `9`, porque `at()` interpreta `-1` como la última posición.
☐ `undefined`, porque ningún acceso de JavaScript admite índices negativos.
☐ `8`, porque `-1` se convierte automáticamente en el índice cero.

---

### Rangos con `slice()`

33) ¿Qué produce `['a', 'b', 'c', 'd'].slice(1, 3)`?

☐ `['a', 'b', 'c']`, porque el índice inicial se excluye.
☐ `['b', 'c', 'd']`, porque el índice final se incluye.
☑ `['b', 'c']`, porque incluye el inicio, excluye el final y no muta el original.

---

### Matrices y referencias compartidas

34) ¿Por qué esta matriz no posee filas independientes?

```js
const matriz = Array(3).fill(Array(3).fill(0));
```

☐ Porque `fill()` solamente admite valores primitivos.
☐ Porque el array exterior comienza en el índice uno.
☑ Porque cada posición exterior recibe una referencia al mismo array interior.

---

### Transformar, filtrar y reducir

35) ¿Cuál asociación entre método e intención es correcta?

☐ `map()` selecciona elementos, `filter()` acumula y `reduce()` ordena.
☑ `map()` transforma, `filter()` selecciona y `reduce()` acumula un resultado.
☐ `map()` muta siempre el original, `filter()` lo vacía y `reduce()` lo copia.

---

### Ordenamiento numérico

36) ¿Cómo se obtiene un orden numérico ascendente con `sort()`?

☑ `numeros.sort((a, b) => a - b)`
☐ `numeros.sort()`
☐ `numeros.sort((a, b) => a + b)`

---

### Identidad de objetos

37) ¿Por qué `[1, 2] === [1, 2]` devuelve `false`?

☐ Porque los arrays nunca pueden compararse con `===`.
☑ Porque cada literal crea un objeto distinto y la comparación considera su identidad.
☐ Porque los elementos numéricos se convierten a cadenas antes de comparar.

---

### Copia superficial

38) ¿Qué sucede después de ejecutar este código?

```js
const original = [{ nota: 8 }];
const copia = [...original];
copia[0].nota = 10;
```

☐ `original[0].nota` sigue valiendo `8` porque `...` clona todos los niveles.
☐ Se produce un error porque la expansión solo funciona con primitivos.
☑ `original[0].nota` vale `10` porque ambas estructuras comparten el objeto interior.

---

### Propiedades dinámicas

39) Si `const clave = "precio"`, ¿cómo se accede al valor de esa propiedad dinámica?

☑ `producto[clave]`
☐ `producto.clave`
☐ `producto->clave`

---

### Colecciones especializadas

40) ¿Cuál elección representa mejor las responsabilidades de `Map` y `Set`?

☑ `Map` asocia claves con valores y `Set` conserva valores únicos por identidad.
☐ `Map` solo almacena índices numéricos y `Set` admite valores duplicados.
☐ `Map` modela exclusivamente entidades fijas y `Set` reemplaza cualquier array ordenado.

---

## Estructuras de control

---

### Orden de decisiones

41) ¿Por qué está mal ordenado este encadenamiento?

```js
if (nota >= 6) {
  return "aprobado";
} else if (nota >= 9) {
  return "destacado";
}
```

☐ Porque `else if` no puede comparar números.
☐ Porque las condiciones deben escribirse siempre de menor a mayor.
☑ Porque toda nota mayor o igual que 9 ya fue capturada por la primera condición.

---

### Operador ternario

42) ¿Cuándo resulta apropiado el operador ternario?

☐ Para ejecutar varias ramas extensas con efectos diferentes.
☑ Para elegir de manera breve entre dos valores a partir de una condición.
☐ Para reemplazar cualquier bucle cuya condición produzca un booleano.

---

### Guardas

43) ¿Qué ventaja principal ofrecen los retornos tempranos o guardas?

☑ Separan los impedimentos y mantienen visible el camino principal de la función.
☐ Garantizan que ninguna función pueda lanzar excepciones.
☐ Permiten eliminar todas las condiciones booleanas del programa.

---

### `while` y `do...while`

44) ¿Cuál diferencia es correcta?

☐ Ambos evalúan después del cuerpo y se ejecutan al menos una vez.
☑ `while` puede ejecutarse cero veces; `do...while` ejecuta el cuerpo al menos una vez.
☐ `do...while` no admite una condición de salida.

---

### Progreso y `continue`

45) ¿Por qué conviene actualizar el índice antes de un posible `continue` dentro de un `while`?

☑ Para evitar saltar la actualización y crear un bucle que no progresa.
☐ Para hacer que `continue` termine definitivamente el bucle.
☐ Para impedir que la condición vuelva a evaluarse.

---

### `switch` y fall-through

46) ¿Qué ocurre cuando un `case` coincidente no termina con `break`, `return` ni `throw`?

☐ `switch` vuelve a comparar desde el primer `case`.
☐ Se ejecuta automáticamente el bloque `default` y termina.
☑ La ejecución continúa por el caso siguiente mediante fall-through.

---

### Orden de un `for`

47) ¿Cuál es el orden de ejecución de un `for` tradicional?

☐ Condición, actualización, inicialización, cuerpo.
☐ Inicialización, cuerpo, actualización, condición.
☑ Inicialización una vez; luego condición, cuerpo, actualización y nueva condición.

---

### `for...of` y `for...in`

48) ¿Cuál comparación es correcta?

☑ `for...of` recorre valores de iterables y `for...in` recorre nombres de propiedades enumerables.
☐ `for...of` recorre únicamente claves y `for...in` recorre únicamente valores.
☐ Ambos recorridos son equivalentes para arrays, objetos, `Map` y `Set`.

---

### Propagación de excepciones

49) ¿Qué sucede si una función lanza una excepción y ninguna función intermedia la captura?

☐ La excepción se convierte automáticamente en `null` y la ejecución continúa.
☑ Se abandonan las ejecuciones pendientes hasta encontrar un `catch` o llegar al manejador del entorno.
☐ Solo termina la función que ejecutó `throw`; sus llamadoras continúan normalmente.

---

### Limpieza con `finally`

50) ¿Por qué debe evitarse un `return` dentro de `finally`?

☐ Porque impide que `finally` se ejecute cuando no hubo errores.
☑ Porque puede reemplazar un resultado o incluso ocultar una excepción anterior.
☐ Porque transforma cualquier objeto retornado en una cadena.

---

## Fundamentos de la computación digital

---

### El bit

51) ¿Qué es un bit en el modelo de computación digital presentado?

☑ Una unidad de información capaz de tomar uno de dos estados distinguibles.
☐ Un número decimal que siempre representa una cantidad entre cero y nueve.
☐ Una compuerta física que realiza simultáneamente AND, OR y NOT.

---

### Cantidad de combinaciones

52) ¿Cuántas combinaciones distintas pueden representarse con tres bits?

☐ Tres combinaciones.
☐ Seis combinaciones.
☑ Ocho combinaciones.

---

### Cálculo como función

53) ¿Cómo puede entenderse conceptualmente un cálculo digital?

☐ Como una secuencia sin entradas que siempre produce el mismo texto.
☑ Como una función que transforma combinaciones de bits de entrada en bits de salida.
☐ Como una operación que elimina la necesidad de codificar información.

---

### Operación AND

54) ¿Cuándo produce `1` la operación booleana AND?

☑ Únicamente cuando ambas entradas valen `1`.
☐ Cuando al menos una de las entradas vale `1`.
☐ Cuando las dos entradas tienen valores diferentes.

---

### Forma normal disyuntiva

55) ¿Cuál es el procedimiento correcto para construir una expresión desde una tabla mediante FND?

☐ Tomar las filas con salida `0`, unir sus variables con OR y luego negar todo.
☐ Sumar aritméticamente todas las entradas y descartar el acarreo.
☑ Crear un término AND por cada fila con salida `1` y unir esos términos mediante OR.

---

### Completitud funcional

56) ¿Qué consecuencia se obtiene al convertir cualquier tabla de verdad mediante NOT, AND y OR?

☐ Que toda expresión resultante será necesariamente la más pequeña posible.
☑ Que esas operaciones son suficientes para expresar cualquier función booleana.
☐ Que los circuitos físicos dejan de necesitar señales binarias.

---

### Leyes de De Morgan

57) ¿Cuál expresión equivale a `NOT (A AND B)`?

☑ `(NOT A) OR (NOT B)`
☐ `(NOT A) AND (NOT B)`
☐ `A OR B`

---

### Implementación física

58) ¿Qué operación lógica modelan dos interruptores conectados en serie?

☐ OR, porque basta con cerrar cualquiera de ellos.
☑ AND, porque la corriente circula solamente si ambos están cerrados.
☐ NOT, porque cada interruptor invierte el estado del otro.

---

### Representación binaria

59) ¿Cuál es el valor decimal de `1011₂`?

☐ `9`
☐ `10`
☑ `11`

---

### Medio sumador

60) En un medio sumador de dos bits, ¿qué expresiones describen la suma y el acarreo?

☐ La suma es `A OR B` y el acarreo es `NOT A`.
☐ La suma es `A AND B` y el acarreo es `A OR B`.
☑ La suma es verdadera cuando los bits difieren y el acarreo es `A AND B`.

---

## El tipo number y las operaciones bit a bit

---

### Representación numérica

61) ¿Cuál afirmación describe correctamente al tipo `number`?

☐ Se divide en los tipos separados `int`, `float` y `double` dentro del lenguaje.
☑ Representa enteros y decimales normalmente mediante IEEE 754 de 64 bits.
☐ Almacena todos los números reales con precisión matemática ilimitada.

---

### Literales en distintas bases

62) ¿Qué relación existe entre `42`, `0b101010`, `0o52` y `0x2A`?

☑ Son distintas formas literales de escribir el mismo valor numérico.
☐ Producen cuatro tipos numéricos diferentes.
☐ Solo el literal decimal puede utilizarse en operaciones aritméticas.

---

### Coerción con `+`

63) ¿Qué devuelve `"10" + 2`?

☐ `12`, porque todo operador aritmético convierte cadenas a números.
☐ `NaN`, porque no pueden combinarse operandos de tipos diferentes.
☑ `"102"`, porque `+` también concatena y convierte el número a texto.

---

### `Number()` y `parseInt()`

64) Al analizar una cadena que incluye una unidad, ¿qué resultados producen estas conversiones?

```js
Number("123px");
parseInt("123px", 10);
```

☐ Ambas producen `123`.
☑ La primera produce `NaN` y la segunda produce `123`.
☐ La primera produce `123` y la segunda produce `NaN`.

---

### El valor `NaN`

65) ¿Cuál es la forma apropiada de detectar el valor especial `NaN`?

☐ Comprobar `x === NaN`, porque `NaN` es igual a sí mismo.
☐ Comprobar `typeof x === "NaN"`.
☑ Utilizar `Number.isNaN(x)`, teniendo en cuenta que `typeof NaN` es `"number"`.

---

### Incremento prefijo y sufijo

66) ¿Qué valores quedan en `a` y `x`?

```js
let x = 10;
const a = x++;
```

☑ `a` vale `10` y luego `x` vale `11`.
☐ Tanto `a` como `x` valen `11` antes de terminar la asignación.
☐ `a` vale `11` y `x` conserva el valor `10`.

---

### Potencia y precedencia

67) ¿Qué valor produce `2 ** 3 * 4`?

☐ `4096`, porque la multiplicación se agrupa dentro del exponente.
☑ `32`, porque primero se calcula `2 ** 3` y luego se multiplica por `4`.
☐ `24`, porque todos los operadores poseen la misma precedencia.

---

### Conversión bitwise

68) ¿Por qué `-12.9 | 0` no debe confundirse con `Math.floor(-12.9)`?

☐ Porque `| 0` redondea al entero más cercano y `floor()` conserva decimales.
☐ Porque ambos producen siempre el mismo resultado pero tienen distinta sintaxis.
☑ Porque la operación bitwise convierte al dominio de enteros de 32 bits y trunca hacia cero, mientras `floor()` produce `-13`.

---

### Máscaras de permisos

69) ¿Qué operadores se utilizan respectivamente para activar y consultar una bandera de permisos?

☑ OR (`|`) para activar y AND (`&`) para consultar.
☐ AND (`&`) para activar y XOR (`^`) para consultar.
☐ NOT (`~`) para activar y desplazamiento (`>>`) para consultar.

---

### Alternar bits

70) ¿Qué operación permite alternar una bandera, encendiéndola si estaba apagada y apagándola si estaba encendida?

☑ XOR con la máscara correspondiente: `permisos ^= BANDERA`.
☐ OR con la máscara negada: `permisos |= ~BANDERA`.
☐ AND con la propia máscara: `permisos &= BANDERA`.

---
