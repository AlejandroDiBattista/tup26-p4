# Examen integrador de Programación Web

--- 

## Variables, alcance y expresiones

### Nombres con intención

1) 🟢 ¿Qué nombre de variable describe mejor la cantidad de días que faltan para un vencimiento?

- [x] diasHastaVencimiento
- [ ] fechaDeVencimiento
- [ ] diasTranscurridosDelPlazo

> **Explicación:** Un buen nombre dice qué contiene la variable: una cantidad de días hasta un momento concreto. `fechaDeVencimiento` sugiere una fecha, no una cantidad, y `diasTranscurridosDelPlazo` cuenta en el sentido contrario.

---

### Declaración

2) 🟢 Después de ejecutar `let total;`, ¿qué valor tiene `total`?

- [ ] null
- [ ] ReferenceError
- [x] undefined

> **Explicación:** `let` sin inicializador deja la variable en `undefined`. No vale `null` ni `0`, que habría que asignar a mano, y tampoco da ReferenceError, porque la línea de la declaración ya se ejecutó.

---

### Inicialización

3) 🟢 ¿Qué hace la sentencia `const iva = 0.21;`?

- [ ] Declara iva sin valor
- [x] Declara e inicializa iva
- [ ] Reasigna una constante anterior

> **Explicación:** `const iva = 0.21;` hace dos cosas en una sentencia: declara el nombre y le da su valor inicial. Una constante siempre debe inicializarse en la misma línea en que se declara.

---

### Elección de declaración

4) 🟢 Una variable acumula un total que cambia en cada paso de un cálculo. ¿Con qué palabra conviene declararla?

- [ ] const
- [ ] class
- [x] let

> **Explicación:** Un acumulador cambia de valor en cada paso, así que necesita `let`. `const` impide reasignar la variable, y `class` declara una clase, no una variable.

---

### Vínculo constante

5) 🟢 Después de `const pedido = { estado: "nuevo" };`, ¿qué operación está permitida?

- [ ] Reasignar `pedido` a un objeto nuevo
- [x] Modificar `pedido.estado`, porque const fija solo la variable
- [ ] Nada: el objeto queda inmutable

> **Explicación:** `const` impide reasignar la variable `pedido`, pero no congela el objeto al que apunta. Por eso se pueden cambiar sus propiedades. Para impedirlo haría falta `Object.freeze`.

---

### Alcance de var

6) 🟢 Una variable se declara con `var` dentro de un `if`, y ese `if` está dentro de una función. ¿Hasta dónde llega el alcance de la variable?

- [x] A toda la función
- [ ] Solo al bloque if
- [ ] Al módulo que contiene la función

> **Explicación:** `var` tiene alcance de función: ignora las llaves del `if` y queda visible en toda la función que lo contiene, pero no fuera de ella.

---

### Alcance de bloque

7) 🟢 ¿Qué formas de declarar variables quedan limitadas al bloque de llaves de un `if`?

- [x] let y const
- [ ] var y let
- [ ] var, let y const

> **Explicación:** `let` y `const` tienen alcance de bloque: solo existen entre las llaves donde se declaran. `var` ignora esas llaves.

---

### Sombreado

8) 🟢 Fuera de un bloque existe una variable `estado` con el valor `"global"`. Dentro del bloque se declara `const estado = "local"`. ¿Qué valor tiene `estado` dentro del bloque?

- [ ] El estado global
- [ ] undefined
- [x] El estado local

> **Explicación:** Dentro del bloque, la declaración local sombrea a la exterior con el mismo nombre. Se lee `"local"`; al salir del bloque vuelve a verse la variable global.

---

### Zona muerta temporal

9) 🟢 Dentro de un bloque, se lee una variable antes de la línea `const` que la declara. ¿Qué ocurre?

- [ ] Se obtiene undefined
- [x] Se produce ReferenceError
- [ ] Se obtiene su valor futuro

> **Explicación:** Entre el inicio del bloque y la línea de la declaración, una variable `let` o `const` está en la zona muerta temporal. Leerla ahí lanza ReferenceError en lugar de devolver `undefined`.

---

### Elevación de var

10) 🟢 ¿Qué muestra en la consola este código?

```js
console.log(total);
var total = 100;
```

- [x] undefined
- [ ] 100
- [ ] ReferenceError

> **Explicación:** La declaración con `var` se eleva al inicio del alcance, pero la asignación no. Cuando se ejecuta `console.log`, la variable existe y vale `undefined`. Con `let` o `const` sí habría ReferenceError.

---

### Clausura

11) 🟢 Una función exterior declara una variable local y devuelve una función interior que usa esa variable. ¿Qué pasa con la variable cuando la función exterior termina?

- [ ] El dato se libera al terminar la primera función
- [ ] La función devuelta recibe una copia congelada del dato
- [x] La función devuelta sigue accediendo a esa variable local

> **Explicación:** Eso es una clausura: la función devuelta conserva acceso a las variables del alcance donde se creó, aunque la función exterior ya haya terminado. La variable no se libera mientras alguien pueda usarla.

---

### Expresión

12) 🟢 ¿Cuál de estos fragmentos es una expresión, es decir, produce un valor?

- [ ] `if (edad >= 18) 🟢 {}`
- [x] `edad >= 18`
- [ ] `const edad = 18;`

> **Explicación:** Una expresión produce un valor: `edad >= 18` da `true` o `false`. `if` y `const` son sentencias: ejecutan una acción pero no producen un valor que se pueda usar.

---

### Incremento

13) 🟢 Después de ejecutar `let n = 5; const previo = n++;`, ¿cuánto valen `previo` y `n`?

- [x] previo vale 5 y n vale 6
- [ ] previo vale 6 y n vale 6
- [ ] previo vale 5 y n vale 5

> **Explicación:** `n++` es un postincremento: primero devuelve el valor actual (5) 🟢 y después suma 1. Por eso `previo` vale 5 y `n` queda en 6. Con `++n` ambos valdrían 6.

---

## El tipo `boolean`

### Valores booleanos

14) 🟢 ¿Cuáles son los únicos valores del tipo boolean?

- [ ] 1 y 0
- [ ] truthy y falsy
- [x] true y false

> **Explicación:** El tipo boolean tiene exactamente dos valores: `true` y `false`. "Truthy" y "falsy" describen cómo se comportan otros valores en una condición, no son valores booleanos.

---

### Condiciones

15) 🟢 ¿Puede un string no vacío usarse directamente como condición en un `if`?

- [ ] No, se exige un booleano literal
- [x] Sí, se interpreta como truthy
- [ ] Sí, pero se interpreta como false

> **Explicación:** Una condición acepta cualquier valor y lo interpreta como truthy o falsy. Todo string no vacío es truthy, incluso `"false"` o `"0"`.

---

### Falsy

16) 🟢 ¿Cuál de estos valores es falsy?

- [ ] `" "`
- [ ] `"false"`
- [x] `NaN`

> **Explicación:** Los valores falsy son `false`, `0`, `-0`, `0n`, `""`, `null`, `undefined` y `NaN`. Un string con un espacio no está vacío, así que es truthy, igual que `"false"`.

---

### Objetos vacíos

17) 🟢 ¿Qué devuelve `Boolean({})`?

- [ ] false
- [x] true
- [ ] undefined

> **Explicación:** Todo objeto es truthy, aunque esté vacío. `Boolean({})` devuelve `true`. Para saber si un objeto no tiene propiedades hay que mirar, por ejemplo, `Object.keys(obj).length`.

---

### Texto y verdad

18) 🟢 ¿Qué devuelve `Boolean("false")`?

- [x] true, porque el string no está vacío
- [ ] false, porque el texto dice false
- [ ] Lanza TypeError, porque no es un booleano válido

> **Explicación:** `Boolean` no lee el contenido del texto: solo mira si el string está vacío. `"false"` tiene 5 caracteres, así que es truthy y da `true`.

---

### Conversión explícita

19) 🟢 ¿Qué expresión convierte `valor` a booleano de la forma más explícita y clara?

- [ ] `valor == true`
- [x] `Boolean(valor)`
- [ ] `new Boolean(valor)`

> **Explicación:** `Boolean(valor)` expresa la intención sin ambigüedad. `valor == true` compara con coerción numérica y falla con muchos valores truthy, y `new Boolean(valor)` crea un objeto, que siempre es truthy.

---

### Negación

20) 🟢 ¿Qué devuelve `!0`?

- [ ] false
- [ ] 0
- [x] true

> **Explicación:** `!` convierte el valor a booleano y lo invierte. `0` es falsy, así que `!0` da `true`.

---

### Cortocircuito AND

21) 🟢 ¿Qué devuelve `"" && ejecutar()`?

- [x] El string vacío sin llamar a ejecutar
- [ ] El resultado de ejecutar
- [ ] El booleano false después de llamar a ejecutar

> **Explicación:** `&&` devuelve el primer operando falsy sin evaluar el resto. `""` es falsy, así que la expresión devuelve `""` y `ejecutar()` nunca se llama. Esto se conoce como cortocircuito.

---

### Selección AND

22) 🟢 ¿Qué devuelve `"Ana" && 20`?

- [ ] "Ana"
- [x] 20
- [ ] true

> **Explicación:** `&&` no devuelve un booleano sino uno de sus operandos. Si el primero es truthy, devuelve el segundo. `"Ana"` es truthy, así que el resultado es `20`.

---

### Selección OR

23) 🟢 ¿Qué devuelve `0 || false || null`?

- [ ] false
- [ ] true
- [x] null

> **Explicación:** `||` devuelve el primer operando truthy. Si no hay ninguno, devuelve el último. Aquí todos son falsy, así que devuelve `null`.

---

### Predeterminado nulo

24) 🟢 ¿Qué devuelve `0 ?? 1`?

- [x] 0
- [ ] 1
- [ ] null

> **Explicación:** `??` solo reemplaza `null` y `undefined`. `0` es un valor válido para `??`, así que se conserva. Con `||` el resultado habría sido `1`.

---

### Igualdad estricta

25) 🟢 ¿Qué devuelve `5 === "5"`?

- [x] false
- [ ] true
- [ ] undefined

> **Explicación:** `===` compara sin convertir tipos. Un number y un string nunca son estrictamente iguales. Con `==` la comparación daría `true`.

---

### NaN

26) 🟢 ¿Qué expresión comprueba correctamente si `valor` es `NaN`?

- [ ] `valor === NaN`
- [ ] `typeof valor === "NaN"`
- [x] `Number.isNaN(valor)`

> **Explicación:** `NaN` es el único valor que no es igual a sí mismo, así que `valor === NaN` siempre da `false`. `typeof NaN` es `"number"`. `Number.isNaN` es la forma fiable de detectarlo.

---

### De Morgan

27) 🟢 ¿Qué expresión equivale a `!(a && b)`?

- [ ] `!a && !b`
- [x] `!a || !b`
- [ ] `a || b`

> **Explicación:** Es una ley de De Morgan: negar un AND equivale a hacer OR de las negaciones. `!(a && b)` es verdadero cuando al menos uno de los dos es falso.

---

### Precedencia lógica

28) 🟢 ¿Cómo evalúa JavaScript la expresión `esAdmin || esEditor && estaActivo`?

- [ ] `(esAdmin || esEditor) 🟢 && estaActivo`
- [x] `esAdmin || (esEditor && estaActivo)`
- [ ] `!(esAdmin || esEditor) 🟢 && estaActivo`

> **Explicación:** `&&` tiene más precedencia que `||`, así que se evalúa primero, como la multiplicación antes que la suma. Si se quiere otro orden, hay que poner paréntesis.

---

## Los tipos `number` y `bigint`

### Tipo numérico

29) 🟢 ¿Qué tipo representa tanto 42 como 3.5 en JavaScript?

- [x] number
- [ ] bigint
- [ ] integer

> **Explicación:** JavaScript tiene un único tipo `number` para enteros y decimales. No existe un tipo `integer`, y `bigint` es otro tipo, para enteros arbitrariamente grandes con sufijo `n`.

---

### Bases de literales

30) 🟢 ¿Qué valor decimal representa `0b101010`?

- [ ] 101010
- [ ] 52
- [x] 42

> **Explicación:** El prefijo `0b` indica binario. `101010` en base 2 es 32 + 8 + 2 = 42.

---

### Separadores

31) 🟢 ¿Qué valor tiene `46_000_000`?

- [ ] 46000
- [ ] SyntaxError
- [x] 46000000

> **Explicación:** El guion bajo es un separador numérico: solo mejora la lectura y no cambia el valor. `46_000_000` es 46000000 y no produce ningún error.

---

### Resto negativo

32) 🟢 ¿Qué devuelve `-5 % 3` en JavaScript?

- [x] -2
- [ ] 1
- [ ] NaN

> **Explicación:** En JavaScript, `%` es el resto de la división y toma el signo del dividendo. `-5 % 3` da `-2`. El módulo matemático daría 1, pero `%` no es un módulo.

---

### División por cero

33) 🟢 ¿Qué resultado da `1 / 0` en JavaScript?

- [ ] Una excepción de división
- [x] Infinity
- [ ] NaN

> **Explicación:** Con number, dividir un valor positivo por cero da `Infinity`, sin excepción. Solo con bigint la división por cero lanza RangeError.

---

### Cero entre cero

34) 🟢 ¿Qué produce `0 / 0`?

- [ ] Infinity
- [x] NaN
- [ ] 0

> **Explicación:** `0 / 0` no tiene un resultado definido, así que da `NaN`. Un positivo dividido por cero, en cambio, da `Infinity`.

---

### Detección de NaN

35) 🟢 ¿Por qué `Number.isNaN("hola")` es más confiable que `isNaN("hola")` para detectar `NaN`?

- [ ] Convierte el string a número antes de comprobar
- [ ] Devuelve true para cualquier string no numérico
- [x] No convierte el string a número antes de comprobar si es NaN

> **Explicación:** La función global `isNaN` primero convierte a número: `"hola"` se vuelve `NaN` y da `true`. `Number.isNaN` no convierte, así que solo da `true` si el valor ya es `NaN`.

---

### Cero negativo

36) 🟢 ¿Qué devuelve `Object.is(0, -0)`?

- [x] false
- [ ] true
- [ ] TypeError

> **Explicación:** `0 === -0` es `true`, pero `Object.is` distingue ambos ceros y devuelve `false`. También es la única comparación en que `NaN` es igual a `NaN`.

---

### Decimales binarios

37) 🟢 ¿Por qué `0.1 + 0.2` puede no ser exactamente 0.3?

- [ ] Number guarda los decimales con solo dos cifras
- [ ] El motor redondea el resultado a 16 decimales
- [x] Muchos decimales no tienen representación exacta en binario

> **Explicación:** Los números se guardan en binario. Valores como 0,1 o 0,2 no tienen una representación binaria finita, igual que 1/3 en decimal, y se guardan aproximados. La suma arrastra ese error.

---

### Enteros seguros

38) 🟢 ¿Qué comprueba `Number.isSafeInteger(valor)`?

- [ ] Que es un número finito y no NaN
- [x] Que es un entero representable sin pérdida
- [ ] Que el valor entra en un entero de 32 bits

> **Explicación:** Un number representa enteros exactos solo hasta 2^53 − 1. `Number.isSafeInteger` comprueba que el valor sea entero y esté dentro de ese rango, donde no hay pérdida de precisión.

---

### Conversión completa

39) 🟢 ¿Qué devuelve `Number("42px")`?

- [x] NaN
- [ ] 42
- [ ] "42"

> **Explicación:** `Number` exige que todo el texto sea un número válido. `"42px"` contiene letras, así que el resultado es `NaN`.

---

### Lectura de prefijo

40) 🟢 ¿Qué devuelve `parseInt("42px", 10)`?

- [ ] NaN
- [x] 42
- [ ] 0

> **Explicación:** `parseInt` lee dígitos desde el principio y se detiene en el primer carácter que no entiende. Devuelve `42` e ignora `"px"`.

---

### Redondeo negativo

41) 🟢 ¿Qué valores dan `Math.floor(-3.2)` y `Math.trunc(-3.2)`?

- [ ] -3 y -4
- [ ] -3 y -3
- [x] -4 y -3

> **Explicación:** `Math.floor` redondea hacia abajo (hacia menos infinito), así que −3,2 pasa a −4. `Math.trunc` quita los decimales (hacia cero), así que queda −3. Solo difieren con negativos.

---

### Formato de salida

42) 🟢 ¿Qué tipo devuelve `(12.5).toFixed(2)`?

- [x] string
- [ ] number
- [ ] bigint

> **Explicación:** `toFixed` devuelve un string formateado, no un number. `(12.5).toFixed(2)` es `"12.50"`. Para calcular con él habría que volver a convertirlo.

---

### Aritmética bigint

43) 🟢 ¿Qué ocurre con `10n + 2`?

- [ ] Devuelve 12n
- [ ] Devuelve 12 como number
- [x] Lanza TypeError

> **Explicación:** JavaScript no mezcla bigint y number en una operación aritmética: lanza TypeError. Hay que convertir uno de los dos explícitamente, por ejemplo `10n + 2n`.

---

## El tipo `string` y Unicode

### Creación de cadenas

44) 🟢 ¿Qué comillas permiten insertar expresiones dentro de una cadena?

- [x] Las comillas invertidas, con la forma ${expresión}
- [ ] Las comillas simples y dobles
- [ ] Las comillas dobles con ${}

> **Explicación:** Solo las plantillas literales, escritas con comillas invertidas, interpretan `${expresión}`. Con comillas simples o dobles, `${...}` es texto común.

---

### Escapes

45) 🟢 ¿Qué representa `\n` dentro de una cadena JavaScript?

- [ ] Una barra invertida seguida de una n
- [x] Un salto de línea
- [ ] El final de la cadena

> **Explicación:** `\n` es una secuencia de escape: dentro de la cadena representa un único carácter, el salto de línea, no una barra seguida de una n.

---

### Inmutabilidad

46) 🟢 Después de `const s = "casa"; s[0] = "C";`, ¿qué valor tiene `s`?

- [ ] "Casa"
- [x] "casa"
- [ ] "C"

> **Explicación:** Los strings son inmutables. Asignar a `s[0]` no tiene efecto (en modo estricto lanza TypeError) 🟢 y `s` sigue siendo `"casa"`.

---

### Métodos de string

47) 🟢 Si se llama a `original.trim()` sin guardar el resultado, ¿qué pasa con el string `original`?

- [ ] Pierde los espacios en el mismo string
- [ ] Cambia solo si tenía espacios en los extremos
- [x] No cambia; trim devuelve una cadena nueva sin los espacios

> **Explicación:** Ningún método de string modifica el original, porque los strings son inmutables. `trim` devuelve una cadena nueva; hay que guardarla, por ejemplo `texto = texto.trim()`.

---

### Índice final

48) 🟢 ¿Qué devuelve `"JavaScript".at(-1)`?

- [x] "t"
- [ ] "J"
- [ ] undefined

> **Explicación:** `at` acepta índices negativos que cuentan desde el final. `-1` es el último carácter, `"t"`.

---

### Corte

49) 🟢 ¿Qué devuelve `"JavaScript".slice(0, 4)`?

- [ ] "JavaS"
- [x] "Java"
- [ ] "Script"

> **Explicación:** `slice(0, 4)` toma desde el índice 0 hasta el 4 sin incluirlo, es decir, los caracteres 0, 1, 2 y 3: `"Java"`.

---

### Búsqueda literal

50) 🟢 ¿Qué método de string responde directamente si una frase contiene un texto dado?

- [ ] split
- [ ] startsWith
- [x] includes

> **Explicación:** `includes` responde exactamente esa pregunta y devuelve un booleano. `startsWith` solo mira el comienzo, y `split` divide la cadena.

---

### Reemplazos

51) 🟢 ¿Qué devuelve `"uno dos uno".replaceAll("uno", "1")`?

- [x] "1 dos 1"
- [ ] "1 dos uno"
- [ ] "uno dos 1"

> **Explicación:** `replaceAll` reemplaza todas las apariciones. `replace` con un string reemplaza solo la primera.

---

### Separación

52) 🟢 ¿Qué devuelve `"a,b,c".split(",")`?

- [ ] La cadena "abc"
- [ ] Un array con una sola cadena "a,b,c"
- [x] Un array con "a", "b" y "c"

> **Explicación:** `split` divide la cadena en cada separador y devuelve un array con los trozos: `["a", "b", "c"]`.

---

### Conversión a string

53) 🟢 ¿Qué expresión convierte `valor` en texto sin fallar aunque `valor` sea `null`?

- [ ] `valor.toString()`
- [x] `String(valor)`
- [ ] `valor.join()`

> **Explicación:** `String(valor)` funciona con cualquier valor, incluidos `null` y `undefined`. `valor.toString()` lanza TypeError con `null`, porque `null` no tiene métodos.

---

### Unidades UTF-16

54) 🟢 ¿Qué valor tiene `"😀".length`?

- [x] 2 unidades UTF-16
- [ ] 1, porque es un solo carácter visible
- [ ] 4 puntos de código

> **Explicación:** `length` cuenta unidades de código UTF-16, no caracteres visibles. Los emoji están fuera del plano básico y ocupan 2 unidades (un par sustituto).

---

### Recorrido de puntos de código

55) 🟢 ¿Qué produce `Array.from("A😀B")`?

- [ ] ["A", dos mitades de emoji, "B"]
- [ ] ["A😀B"]
- [x] ["A", "😀", "B"]

> **Explicación:** `Array.from` recorre un string por puntos de código, no por unidades UTF-16. Por eso el emoji queda entero en un solo elemento.

---

### Grafemas visibles

56) 🟢 ¿Qué herramienta divide un texto en caracteres tal como los ve una persona (grafemas), incluidos los emoji compuestos?

- [ ] Array.from sobre la cadena
- [x] Intl.Segmenter
- [ ] normalize con la forma NFC

> **Explicación:** `Intl.Segmenter` con granularidad `"grapheme"` divide el texto como lo percibe una persona, incluidos emoji compuestos y letras con acentos combinados. `Array.from` separa puntos de código, que no siempre coinciden con lo que se ve.

---

### Normalización

57) 🟢 Dos cadenas se ven iguales, pero están escritas con distintas secuencias Unicode, por ejemplo «é» como un solo carácter o como «e» más un acento. ¿Qué hay que hacer para poder compararlas?

- [x] Normalizar ambas a NFC
- [ ] Aplicar trim a una sola
- [ ] Comparar sus longitudes UTF-16

> **Explicación:** Una misma letra acentuada puede escribirse como un solo punto de código o como letra más acento combinado. `normalize("NFC")` lleva ambas a la misma forma y así se pueden comparar.

---

### Orden humano

58) 🟢 ¿Qué herramienta ordena alfabéticamente nombres en español respetando la ñ y los acentos?

- [x] Intl.Collator configurado para es
- [ ] El operador menor que sin configuración
- [ ] Comparar la longitud de los strings

> **Explicación:** `Intl.Collator` ordena según las reglas del idioma, por ejemplo la ñ y los acentos del español. `<` compara códigos numéricos de caracteres y ordena mal esos casos.

---

## `undefined`, `null` y la ausencia de datos

### Valor sin asignar

59) 🟢 ¿Qué valor tiene `pendiente` tras `let pendiente;`?

- [ ] null
- [ ] `""` (cadena vacía)
- [x] undefined

> **Explicación:** Una variable declarada con `let` y sin valor queda en `undefined`. `null` y `""` son valores que hay que asignar explícitamente.

---

### Ausencia intencional

60) 🟢 ¿Qué valor se asigna a propósito para indicar que un dato no existe o no tiene valor?

- [ ] undefined
- [x] null
- [ ] NaN

> **Explicación:** `null` expresa una ausencia elegida a propósito por el programa. `undefined` suele indicar que algo nunca se asignó.

---

### Peculiaridad de typeof

61) 🟢 ¿Qué devuelve `typeof null`?

- [ ] "null"
- [ ] "undefined"
- [x] "object"

> **Explicación:** `typeof null` devuelve `"object"` por un error histórico de las primeras versiones de JavaScript que nunca se corrigió para no romper código existente. Para detectar `null` hay que usar `valor === null`.

---

### Falsedad y ausencia

62) 🟢 En un programa, `cantidad` puede valer 0 legítimamente. ¿Por qué `if (!cantidad)` no sirve para detectar que falta el dato?

- [x] Porque también entra cuando cantidad vale 0, que es válido
- [ ] Porque no entra cuando cantidad es undefined
- [ ] Porque `!cantidad` lanza error si falta el dato

> **Explicación:** `!cantidad` es verdadero para cualquier valor falsy, y `0` es falsy. Si 0 es válido, la condición lo trata como si faltara. Conviene preguntar `cantidad == null` o usar `??`.

---

### Coalescencia

63) 🟢 ¿Qué devuelve `false ?? true`?

- [ ] true
- [x] false
- [ ] undefined

> **Explicación:** `??` solo reemplaza `null` y `undefined`. `false` es un valor presente, así que se conserva.

---

### Acceso opcional

64) 🟢 Si `usuario` es null, ¿qué produce `usuario?.direccion?.ciudad`?

- [ ] null
- [x] undefined
- [ ] TypeError

> **Explicación:** El encadenamiento opcional `?.` se detiene al encontrar `null` o `undefined` y devuelve `undefined`, sin lanzar error. Sin `?.`, leer `.direccion` de `null` lanzaría TypeError.

---

### Predeterminado de parámetro

65) 🟢 Con `function f(x = 3) 🟢 { return x; }`, ¿cuándo se aplica el 3?

- [ ] Cuando el argumento es null
- [ ] Cuando el argumento es falsy
- [x] Cuando falta o es undefined

> **Explicación:** El valor predeterminado de un parámetro se aplica solo si el argumento falta o es `undefined`. `null`, `0` o `""` son valores explícitos y se respetan.

---

### Propiedad propia

66) 🟢 ¿Qué diferencia hay entre los objetos `{}` y `{ valor: undefined }`?

- [x] Solo el segundo tiene la propiedad valor como propia
- [ ] Leer .valor da undefined solo en el primero
- [ ] JSON.stringify los convierte en textos distintos

> **Explicación:** Leer `.valor` da `undefined` en ambos casos, así que la lectura no los distingue. `Object.hasOwn` sí: el segundo objeto tiene la propiedad, aunque su valor sea `undefined`.

---

### Huecos de array

67) 🟢 ¿Qué diferencia hay entre `[1, , 3]` y `[1, undefined, 3]` en la posición 1?

- [x] Solo el segundo tiene esa posición presente
- [ ] Solo el primero tiene esa posición presente
- [ ] Ambos tienen exactamente la misma estructura

> **Explicación:** `[1, , 3]` tiene un hueco: la posición 1 no existe. `[1, undefined, 3]` tiene esa posición con el valor `undefined`. Se nota con `1 in array`, que da `false` y `true` respectivamente.

---

### Resultados de búsqueda

68) 🟢 ¿Qué devuelve `[10, 20].indexOf(50)` si no encuentra el valor?

- [ ] undefined
- [ ] null
- [x] -1

> **Explicación:** `indexOf` devuelve el índice encontrado o `-1` si no está. Por eso se compara con `-1` o se usa `includes`.

---

### JSON de objetos

69) 🟢 ¿Qué ocurre con una propiedad cuyo valor es undefined al serializar un objeto con JSON.stringify?

- [ ] Se escribe como null
- [x] Se omite
- [ ] Se escribe como "undefined"

> **Explicación:** `JSON.stringify` omite las propiedades cuyo valor es `undefined`, porque JSON no tiene ese valor. `null`, en cambio, sí se conserva.

---

### Estados etiquetados

70) 🟢 Una función devuelve `null` en tres situaciones distintas: todavía no hay datos, la búsqueda no encontró nada o hubo un error. ¿Qué representación distingue claramente cada caso?

- [x] Un objeto con una propiedad estado que nombre cada caso
- [ ] Un booleano que indique si hubo resultado
- [ ] Distinguir null de undefined para cada caso

> **Explicación:** Un solo valor como `null` no alcanza para distinguir varias situaciones. Un objeto con una propiedad `estado` (por ejemplo `"pendiente"`, `"vacio"` o `"error"`) 🟢 nombra cada caso sin ambigüedad.

---

### Normalización de entrada

71) 🟢 ¿Qué se gana al normalizar (limpiar y dar un formato único a) 🟢 los datos externos apenas se reciben?

- [ ] La entrada deja de requerir validación posterior
- [x] Todo el programa usa datos con la misma forma
- [ ] JSON.stringify conserva los campos undefined

> **Explicación:** Normalizar en la entrada deja los datos siempre con la misma forma: mismos tipos, mismos campos. El resto del código puede confiar en esa forma. Eso no reemplaza la validación: son pasos distintos.

---

## Conversión y coerción de tipos

### Conversión explícita

72) 🟢 ¿Qué expresión convierte `textoCantidad` a número de forma explícita?

- [ ] `textoCantidad * 1`
- [ ] `textoCantidad.valueOf()`
- [x] `Number(textoCantidad)`

> **Explicación:** `Number(textoCantidad)` declara la conversión de forma explícita. `textoCantidad * 1` también convierte, pero de forma implícita (coerción), y `valueOf()` de un string devuelve el mismo string.

---

### Coerción

73) 🟢 ¿Por qué `"6" - 1` produce 5?

- [x] La resta solo opera con números y convierte el string a número
- [ ] La resta concatena y luego convierte a número
- [ ] JavaScript interpreta "6" como un literal numérico

> **Explicación:** La resta solo existe para números, así que JavaScript convierte `"6"` a 6 y calcula 6 − 1. Con `+` sería distinto: `"6" + 1` concatena y da `"61"`.

---

### Borde del sistema

74) 🟢 ¿En qué orden conviene procesar un dato que llega de afuera, como un formulario o un archivo?

- [ ] Convertir, usar y validar al mostrar el resultado
- [x] Normalizar, convertir y validar antes de usarlo
- [ ] Validar el texto crudo y convertir al final

> **Explicación:** El orden seguro es normalizar (limpiar espacios, formato), convertir al tipo correcto y validar, todo antes de usar el dato. Validar al final deja pasar datos incorrectos al resto del programa.

---

### Conversión general a string

75) 🟢 ¿Qué devuelve `String(null)`?

- [ ] null
- [ ] TypeError
- [x] "null"

> **Explicación:** `String(null)` convierte `null` en el texto `"null"`. No lanza error, a diferencia de `null.toString()`.

---

### Cadena vacía numérica

76) 🟢 ¿Qué devuelve `Number("")` y por qué requiere cuidado en un campo obligatorio?

- [x] 0; podría aceptarse una omisión como si fuera un cero
- [ ] NaN; la omisión se detecta sin más control
- [ ] undefined; se distingue fácilmente de cero

> **Explicación:** `Number("")` da `0`, no `NaN`. En un campo obligatorio, un campo vacío pasaría como un cero válido si no se verifica antes que el texto no esté vacío.

---

### Conversión de un array vacío

77) 🟢 ¿Por qué `Number([])` devuelve 0?

- [ ] Number devuelve la longitud del array vacío
- [x] Se convierte primero en "" y luego en 0
- [ ] Un array vacío es falsy y false vale 0

> **Explicación:** Para convertir un objeto a número, JavaScript primero lo pasa a primitivo. Un array vacío se convierte en `""`, y `Number("")` es 0. Además, `[]` es truthy, no falsy.

---

### Conversión completa o parcial

78) 🟢 Para el texto `"42px"`, ¿qué diferencia hay entre `Number` y `parseInt`?

- [ ] Ambos dan `42`
- [ ] `Number` da `42` y `parseInt` da `NaN`
- [x] `Number` da `NaN` y `parseInt` da `42`

> **Explicación:** `Number` exige que todo el texto sea numérico y da `NaN` con `"42px"`. `parseInt` lee dígitos hasta el primer carácter inválido y da `42`.

---

### Texto booleano

79) 🟢 ¿Por qué `Boolean("false")` no sirve para interpretar esa palabra?

- [ ] Devuelve false, pero no reconoce "FALSE"
- [x] Devuelve true: la cadena no está vacía
- [ ] Lanza TypeError al no ser un booleano

> **Explicación:** `Boolean` solo mira si el string está vacío. `"false"` no está vacío, así que da `true`. Para interpretar la palabra hay que compararla, por ejemplo `texto === "true"`.

---

### Conversión a bigint

80) 🟢 Un entero muy grande llega como texto, en la variable `texto`. ¿Cómo se convierte a bigint sin perder dígitos?

- [x] `BigInt(texto)`
- [ ] `BigInt(Number(texto))`
- [ ] `BigInt(parseInt(texto))`

> **Explicación:** Un entero grande en texto puede superar la precisión de number. Pasar primero por `Number` o `parseInt` pierde dígitos antes de llegar a `BigInt`. `BigInt(texto)` convierte sin pérdida.

---

### Contexto numérico

81) 🟢 ¿Qué resultado produce `"8" * "3"`?

- [ ] "83"
- [ ] NaN
- [x] 24

> **Explicación:** `*` solo opera con números, así que convierte ambos strings: 8 × 3 = 24. Solo `+` concatena strings.

---

### Suma y concatenación

82) 🟢 ¿Qué produce `1 + 2 + "3"`?

- [x] "33"
- [ ] "123"
- [ ] 6

> **Explicación:** Se evalúa de izquierda a derecha: `1 + 2` da 3 (número), y después `3 + "3"` concatena y da `"33"`.

---

### Comparación textual

83) 🟢 ¿Por qué `"20" < "3"` puede ser true?

- [ ] Ambos se convierten a número antes de comparar
- [ ] Se compara la longitud de las cadenas
- [x] Ambos son strings y se comparan carácter por carácter

> **Explicación:** Si ambos operandos son strings, `<` los compara carácter por carácter según su código. `"2"` es menor que `"3"`, así que `"20" < "3"` da `true` aunque 20 sea mayor que 3.

---

### Igualdad estricta

84) 🟢 ¿Qué devuelve `0 === false`?

- [ ] true
- [x] false
- [ ] undefined

> **Explicación:** `===` no convierte tipos. `0` es number y `false` es boolean, así que no son estrictamente iguales. Con `==` darían `true`.

---

### Coerción de objetos

85) 🔴 Cuando JavaScript necesita convertir un objeto a un valor primitivo, ¿qué método usa primero si el objeto lo define?

- [x] Symbol.toPrimitive
- [ ] Object.prototype.valueOf
- [ ] toString

> **Explicación:** Si un objeto define `Symbol.toPrimitive`, JavaScript lo usa antes que `valueOf` y `toString` para convertirlo a primitivo.

---

### Parser del dominio

86) 🟢 Un formulario acepta números con coma decimal, como `"3,5"`. ¿Qué hace falta además de llamar a `Number`?

- [ ] Reemplazar la coma por punto y nada más
- [x] Definir el formato aceptado y normalizarlo
- [ ] Usar parseFloat, que ya acepta la coma

> **Explicación:** `Number` no acepta coma decimal: `Number("3,5")` da `NaN` y `parseFloat("3,5")` da 3. Hay que decidir qué formatos se aceptan, normalizarlos (por ejemplo, coma por punto) 🟢 y validar el resultado.

---

## El tipo `symbol` y los protocolos de JavaScript

### Identidad única

87) 🔴 ¿Qué devuelve `Symbol("id") 🔴 === Symbol("id")`?

- [ ] true
- [ ] undefined
- [x] false

> **Explicación:** Cada llamada a `Symbol()` crea un símbolo único, aunque tengan la misma descripción. Por eso nunca son iguales entre sí.

---

### Descripción

88) 🔴 En `Symbol("interno")`, ¿para qué sirve el texto `"interno"`?

- [ ] Hace iguales los símbolos con ese texto
- [ ] Convierte el símbolo en clave string
- [x] Ayuda a depurar; no define identidad

> **Explicación:** La descripción solo sirve para identificarlo al depurar, por ejemplo en la consola. No afecta la identidad: dos símbolos con la misma descripción siguen siendo distintos.

---

### Claves diferentes

89) 🔴 Un objeto tiene la propiedad string `id` y otra bajo `Symbol("id")`. ¿Qué relación guardan?

- [ ] La segunda sobrescribe la primera
- [x] Son claves distintas
- [ ] Ambas se enumeran con el mismo nombre

> **Explicación:** Una clave string y una clave symbol nunca colisionan, aunque la descripción coincida con el texto. El objeto tiene dos propiedades distintas.

---

### Enumeración habitual

90) 🔴 ¿Qué ocurre con una clave symbol al llamar Object.keys sobre un objeto?

- [x] No aparece en el resultado
- [ ] Aparece convertida a string
- [ ] Se elimina del objeto

> **Explicación:** `Object.keys` devuelve solo claves string. Las claves symbol no aparecen, pero siguen en el objeto.

---

### Reflexión

91) 🔴 ¿Qué función devuelve las claves symbol propias de un objeto?

- [ ] Object.getOwnPropertyNames
- [ ] Object.entries
- [x] Object.getOwnPropertySymbols

> **Explicación:** `Object.getOwnPropertySymbols` devuelve las claves symbol propias. `Object.getOwnPropertyNames` y `Object.entries` trabajan solo con claves string.

---

### Copia de símbolo

92) 🔴 ¿Copia `{ ...obj }` las propiedades de `obj` cuya clave es un symbol?

- [ ] No, se omiten las claves symbol
- [x] Sí
- [ ] Solo si la clave se creó con Symbol.for

> **Explicación:** El spread `{ ...obj }` copia todas las propiedades propias enumerables, incluidas las de clave symbol.

---

### Registro global

93) 🔴 ¿Qué devuelve `Symbol.for("curso") 🔴 === Symbol.for("curso")`?

- [x] true
- [ ] false
- [ ] TypeError

> **Explicación:** `Symbol.for` usa un registro global: la primera llamada crea el símbolo y las siguientes con la misma clave devuelven el mismo. Por eso son iguales.

---

### Clave registrada

94) 🔴 ¿Qué devuelve `Symbol.keyFor(s)` si `s` se creó con `Symbol()`, fuera del registro global?

- [ ] Su descripción
- [x] undefined
- [ ] La cadena "local"

> **Explicación:** `Symbol.keyFor` solo encuentra símbolos del registro global, creados con `Symbol.for`. Para un símbolo local creado con `Symbol()` devuelve `undefined`.

---

### Conversión explícita

95) 🔴 ¿Qué expresión convierte un symbol en texto sin lanzar error?

- [x] String(simbolo)
- [ ] "id=" + simbolo
- [ ] Number(simbolo)

> **Explicación:** Un símbolo no se convierte a texto de forma implícita: `"id=" + simbolo` lanza TypeError. La conversión tiene que ser explícita con `String(simbolo)` o leyendo `simbolo.description`.

---

### Protocolo iterable

96) 🔴 ¿Qué símbolo especial debe usar un objeto como nombre de un método para poder recorrerse con `for...of`?

- [ ] Symbol.hasInstance
- [ ] Symbol.toStringTag
- [x] Symbol.iterator

> **Explicación:** `for...of` busca el método `Symbol.iterator` del objeto. Si existe, el objeto es iterable.

---

### Iterador

97) 🔴 El método `Symbol.iterator` de un objeto devuelve un iterador. ¿Qué método debe tener ese iterador?

- [ ] value, que devuelve el elemento actual
- [x] next, que devuelve value y done
- [ ] done, que indica si quedan elementos

> **Explicación:** El iterador debe tener un método `next()` que devuelva objetos `{ value, done }`. `value` es el elemento actual y `done` indica si terminó.

---

### Iteración asincrónica

98) 🔴 ¿Qué símbolo especial busca `for await...of` para recorrer valores que llegan de forma asincrónica?

- [ ] Symbol.isConcatSpreadable
- [ ] Symbol.species
- [x] Symbol.asyncIterator

> **Explicación:** `for await...of` busca primero `Symbol.asyncIterator`, cuyo `next()` devuelve promesas. Así puede consumir valores que llegan con espera.

---

### Coerción personalizada

99) 🔴 ¿Qué tipo de valor debe devolver un método `Symbol.toPrimitive`?

- [x] Un valor primitivo
- [ ] El propio objeto
- [ ] Un string con la descripción

> **Explicación:** `Symbol.toPrimitive` debe devolver un valor primitivo (string, number, etc.). Si devuelve un objeto, JavaScript lanza TypeError.

---

### Etiqueta descriptiva

100) 🔴 Si un objeto define `Symbol.toStringTag`, ¿qué cambia?

- [ ] El nombre que muestra typeof
- [x] El texto de Object.prototype.toString
- [ ] La clave con que lo guarda JSON.stringify

> **Explicación:** `Symbol.toStringTag` define el nombre que aparece en `Object.prototype.toString`, por ejemplo `"[object MiClase]"`. No cambia `typeof` ni la identidad del objeto.

---

### Expansión en concat

101) 🔴 Un objeto tiene índices numéricos y `length`, como un array. ¿Qué símbolo hace que `concat` lo expanda elemento por elemento?

- [ ] Symbol.hasInstance
- [ ] Symbol.keyFor
- [x] Symbol.isConcatSpreadable

> **Explicación:** `Symbol.isConcatSpreadable` en `true` hace que `concat` expanda el objeto como si fuera un array, usando sus índices y su `length`.

---

## Arrays y matrices

### Elección de colección

102) 🟢 ¿Cuándo es un array la mejor estructura para guardar una colección?

- [x] Cuando importan el orden y las posiciones
- [ ] Cuando cada clave es un objeto arbitrario
- [ ] Cuando los duplicados deben desaparecer

> **Explicación:** Un array es adecuado cuando importan el orden y la posición de cada elemento. Para claves arbitrarias conviene un Map, y para eliminar duplicados, un Set.

---

### Creación con un número

103) 🟢 ¿Qué diferencia hay entre `Array.of(3)` y `Array(3)`?

- [x] Array.of(3) 🟢 es [3]; Array(3) 🟢 tiene tres huecos
- [ ] Ambos crean un array con tres huecos vacíos
- [ ] El primero tiene tres huecos; el segundo contiene 3

> **Explicación:** Con un único número, `Array(3)` lo interpreta como longitud y crea un array de 3 huecos. `Array.of(3)` siempre usa sus argumentos como elementos, así que da `[3]`.

---

### Comprobación de tipo

104) 🟢 ¿Qué expresión comprueba de forma confiable si `x` es un array?

- [ ] `typeof x === "array"`
- [ ] `x instanceof Object`
- [x] `Array.isArray(x)`

> **Explicación:** `typeof` devuelve `"object"` para arrays, y `instanceof Object` es verdadero para arrays y objetos por igual. `Array.isArray` es la forma fiable de distinguirlos.

---

### Índice negativo

105) 🟢 Con `const a = ["rojo", "azul"]`, ¿qué devuelve `a.at(-1)`?

- [ ] "rojo"
- [x] "azul"
- [ ] undefined

> **Explicación:** `at(-1)` cuenta desde el final: devuelve el último elemento, `"azul"`.

---

### Cambio de longitud

106) 🟢 ¿Qué ocurre al asignar `a.length = 1` a `a = [1, 2, 3]`?

- [x] Se descartan los elementos 2 y 3 y la longitud pasa a 1
- [ ] Los elementos 2 y 3 quedan ocultos pero existen
- [ ] Lanza TypeError: length es de solo lectura

> **Explicación:** `length` se puede escribir. Asignar un valor menor recorta el array y elimina los elementos sobrantes para siempre.

---

### Huecos

107) 🟢 ¿Qué devuelve `1 in [1, , 3]`?

- [ ] true
- [x] false
- [ ] undefined

> **Explicación:** `in` pregunta si existe el índice, no si hay un valor. En `[1, , 3]` la posición 1 es un hueco: no existe, así que da `false`.

---

### Corte sin mutación

108) 🟢 ¿Qué devuelve `[10, 20, 30, 40].slice(1, 3)`?

- [ ] [20, 30, 40]
- [ ] [10, 20, 30]
- [x] [20, 30]

> **Explicación:** `slice(1, 3)` copia desde el índice 1 hasta el 3 sin incluirlo, es decir, los índices 1 y 2: `[20, 30]`.

---

### Agregar al final

109) 🟢 ¿Qué devuelve `push` al agregar un elemento a un array?

- [ ] El elemento agregado
- [ ] Una copia del array
- [x] La nueva longitud

> **Explicación:** `push` agrega al final, modifica el array y devuelve la nueva longitud, no el elemento ni una copia.

---

### Región modificada

110) 🟢 ¿Qué devuelve `splice` además de modificar el array original?

- [ ] Una copia del array original antes del cambio
- [x] Un array con los elementos eliminados
- [ ] La nueva longitud del array

> **Explicación:** `splice` modifica el array original y devuelve un array con los elementos que eliminó (vacío si no eliminó ninguno).

---

### Búsqueda de NaN

111) 🟢 ¿Qué expresión devuelve `true` porque encuentra `NaN` dentro del array?

- [x] `[NaN].includes(NaN)`
- [ ] `[NaN].indexOf(NaN) 🟢 >= 0`
- [ ] `NaN === NaN`

> **Explicación:** `includes` usa la comparación SameValueZero, que considera `NaN` igual a `NaN`. `indexOf` usa `===`, y como `NaN !== NaN`, nunca lo encuentra.

---

### Resultado de find

112) 🟢 ¿Qué devuelve `find` si ningún elemento cumple la condición?

- [x] undefined
- [ ] -1
- [ ] Un array vacío

> **Explicación:** `find` devuelve el primer elemento que cumple la condición o `undefined` si ninguno la cumple. Quien devuelve `-1` es `findIndex`.

---

### Recorrido por valor

113) 🟢 ¿Qué bucle recorre directamente los valores de un array?

- [ ] for...in
- [x] for...of
- [ ] switch

> **Explicación:** `for...of` recorre los valores. `for...in` recorre nombres de propiedades (los índices como strings) 🟢 y no se recomienda para arrays.

---

### Transformación

114) 🟢 ¿Qué método produce un array nuevo con un resultado por elemento?

- [ ] forEach
- [ ] pop
- [x] map

> **Explicación:** `map` llama a la función una vez por elemento y arma un array nuevo con los resultados. `forEach` no devuelve nada, y `pop` quita el último elemento.

---

### Selección de objetos

115) 🟢 `filter` devuelve un array nuevo con algunos objetos del array original. ¿Qué relación tienen esos objetos con los del original?

- [x] Son los mismos objetos: filter copia solo las referencias
- [ ] Cada objeto se copia en forma superficial
- [ ] Se copian solo los objetos modificados

> **Explicación:** `filter` crea un array nuevo, pero sus elementos son los mismos objetos del original. Modificar un objeto filtrado modifica también el original.

---

### Acumulación vacía

116) 🟢 ¿Por qué conviene pasar un valor inicial a `reduce`?

- [ ] Hace que reduce recorra el array de derecha a izquierda
- [x] Fija el acumulador y cubre el array vacío
- [ ] Evita que el callback reciba el índice

> **Explicación:** Sin valor inicial, `reduce` usa el primer elemento como acumulador y lanza TypeError si el array está vacío. Con valor inicial, el acumulador empieza con un tipo conocido y el array vacío devuelve ese valor.

---

### Efectos con forEach

117) 🟢 ¿Qué devuelve `forEach`?

- [ ] Un array transformado
- [ ] El último elemento
- [x] undefined

> **Explicación:** `forEach` siempre devuelve `undefined`. Sirve para efectos por elemento. Si se necesita un resultado, corresponde `map`, `filter` o `reduce`.

---

### Aplanamiento

118) 🟢 ¿Qué resultado produce el siguiente código?

```js
const datos = [1, [2, [3]]];
datos.flat(2);
```

- [x] Un array plano con 1, 2 y 3
- [ ] Un array con el 3 todavía anidado
- [ ] Un array con el 1 y el 2 anidados

> **Explicación:** `flat(2)` aplana hasta dos niveles de anidamiento. `[1, [2, [3]]]` tiene dos niveles, así que queda `[1, 2, 3]`.

---

### Orden numérico

119) 🟢 ¿Por qué `[2, 10, 1].sort()` no da necesariamente el orden numérico esperado?

- [ ] sort sin comparador ordena de mayor a menor
- [ ] sort ordena según el orden de inserción original
- [x] Sin comparador, sort convierte a string y compara texto

> **Explicación:** Sin comparador, `sort` convierte los elementos a string y los ordena como texto. `"10"` va antes que `"2"` porque `"1"` es menor que `"2"`. Para números hay que usar `sort((a, b) 🟢 => a - b)`.

---

### Copia superficial

120) 🟢 Después de `const copia = [...original]`, donde `original` contiene objetos, ¿qué comparten ambos arrays?

- [ ] El mismo array exterior, con otro nombre
- [x] Las referencias a los objetos internos
- [ ] Nada: los objetos se copian también

> **Explicación:** El spread crea un array exterior nuevo, pero copia las referencias a los objetos, no los objetos. Es una copia superficial: ambos arrays comparten los mismos objetos internos.

---

### Filas de matriz

121) 🟢 ¿Qué problema tiene crear una matriz de 3 × 3 con `Array(3).fill(Array(3).fill(0))`?

- [x] Las tres filas son el mismo array, así que cambiar una cambia todas
- [ ] Las filas quedan con huecos en lugar de ceros
- [ ] Solo la primera fila queda llena de ceros

> **Explicación:** `fill` coloca el mismo valor en todas las posiciones. Aquí ese valor es un único array, así que las tres filas son el mismo objeto: cambiar una celda cambia la columna entera.

---

### Últimos elementos sin mutar

122) 🟢 Para un array con los valores 10, 20, 30, 40 y 50, ¿qué devuelve `slice(-2)`?

- [ ] El array original reducido a 40 y 50
- [x] Un array nuevo con 40 y 50
- [ ] Un array nuevo con 10 y 20

> **Explicación:** `slice(-2)` toma los dos últimos elementos y devuelve un array nuevo. El original no cambia.

---

### Alguno frente a todos

123) 🟢 Para los valores 1, 2 y 3, ¿qué devuelven respectivamente `some(n => n > 2)` y `every(n => n > 2)`?

- [ ] true y true
- [ ] false y false
- [x] true y false

> **Explicación:** `some` es `true` si al menos un elemento cumple (el 3). `every` es `true` solo si todos cumplen, y 1 y 2 no lo hacen.

---

### Ordenar sin mutar

124) 🟢 Tras ejecutar este código, ¿qué ocurre con `original` y `copia`?

```js
const original = [3, 1, 2];
const copia = original.toSorted((a, b) 🟢 => a - b);
```

- [ ] Ambos quedan ordenados de menor a mayor
- [x] original no cambia; copia queda ordenada
- [ ] original queda ordenado; copia no cambia

> **Explicación:** `toSorted` devuelve una copia ordenada y no toca el original. `sort` sí ordena el array en su lugar.

---

### Filas independientes

125) 🟢 ¿Por qué `Array.from({ length: 3 }, () 🟢 => Array(3).fill(0))` evita el problema de las filas compartidas?

- [ ] Todas las filas usan la misma referencia a un único array
- [ ] Convierte la matriz en un objeto sin índices
- [x] La función crea un array nuevo para cada fila

> **Explicación:** `Array.from` llama a la función una vez por fila, y cada llamada crea un array nuevo. Así las filas son independientes.

---

## Objetos, propiedades y referencias

### Elección de objeto

126) 🟢 ¿Qué estructura conviene para representar un alumno con campos fijos, como nombre y legajo?

- [x] Un objeto
- [ ] Un Set
- [ ] Una cadena separada por comas

> **Explicación:** Un objeto agrupa campos con nombre. Un Set guarda valores sin nombre, y una cadena separada por comas obliga a interpretar posiciones.

---

### Claves numéricas

127) 🟢 Si un objeto se crea con `{ 10: "diez" }`, ¿cómo aparece esa clave en `Object.keys`?

- [x] Como el string "10"
- [ ] Como el número 10
- [ ] Como un symbol

> **Explicación:** Las claves de un objeto común siempre son strings (o symbols). La clave `10` se guarda como `"10"`.

---

### Clave dinámica

128) 🟢 Con `const campo = "precio"`, ¿qué expresión lee la propiedad `precio` de `producto` usando la variable?

- [ ] `producto.campo`
- [ ] `producto["campo"]`
- [x] `producto[campo]`

> **Explicación:** Los corchetes evalúan la expresión: `producto[campo]` lee la clave `"precio"`. `producto.campo` y `producto["campo"]` buscan literalmente una clave llamada `"campo"`.

---

### Eliminación

129) 🟢 ¿Qué efecto tiene `delete producto.stock`?

- [ ] La conserva con valor undefined
- [x] Quita la propiedad stock
- [ ] La convierte en null

> **Explicación:** `delete` quita la propiedad del objeto. Después, `"stock" in producto` es `false`. Asignar `undefined`, en cambio, conserva la propiedad.

---

### Propiedad propia

130) 🟢 ¿Qué diferencia hay entre `Object.hasOwn(obj, "x")` y `"x" in obj`?

- [x] in considera propiedades heredadas; hasOwn no
- [ ] hasOwn considera heredadas; in no
- [ ] Ambas revisan también las propiedades heredadas

> **Explicación:** `in` busca en el objeto y en toda su cadena de prototipos. `Object.hasOwn` mira solo las propiedades propias.

---

### Acceso opcional

131) 🟢 `alumno.direccion` puede ser `null` o `undefined`. ¿Qué evita escribir `alumno.direccion?.ciudad`?

- [ ] Validar cualquier campo obligatorio
- [x] Leer ciudad cuando direccion es null o undefined
- [ ] Que ciudad valga undefined si falta

> **Explicación:** Si `direccion` es `null` o `undefined`, `?.` corta la cadena y devuelve `undefined` en lugar de lanzar TypeError al intentar leer `ciudad`.

---

### Propiedades abreviadas

132) 🟢 Con `const nombre = "Ana"`, ¿qué crea `{ nombre }`?

- [ ] Un Set que contiene el string "Ana"
- [ ] Un bloque de código que evalúa nombre
- [x] La propiedad nombre con valor "Ana"

> **Explicación:** Es la forma abreviada de propiedad: `{ nombre }` equivale a `{ nombre: nombre }`. Crea la propiedad `nombre` con el valor de la variable, `"Ana"`.

---

### Método y this

133) 🟢 ¿Por qué no conviene definir con una función flecha un método de objeto que usa `this`?

- [ ] No puede devolver valores
- [x] No tiene this propio
- [ ] Su this es el objeto donde se define

> **Explicación:** Las funciones flecha no tienen `this` propio: usan el del alcance donde se escribieron. Como método de un objeto literal, su `this` no es el objeto.

---

### Claves calculadas

134) 🟢 En un literal de objeto, ¿qué sintaxis usa el contenido de la variable `campo` como nombre de la clave?

- [ ] `{ campo: valor }`
- [ ] `{ "campo": valor }`
- [x] `{ [campo]: valor }`

> **Explicación:** Los corchetes en un literal crean una clave calculada: `{ [campo]: valor }` usa el contenido de la variable como nombre. `{ campo: valor }` crea una clave llamada `"campo"`.

---

### Recorrer pares

135) 🟢 ¿Qué función devuelve pares [clave, valor] de propiedades propias enumerables?

- [x] Object.entries
- [ ] Object.getOwnPropertyNames
- [ ] Object.hasOwn

> **Explicación:** `Object.entries` devuelve un array de pares `[clave, valor]`. `Object.values` devuelve solo los valores, y `Object.hasOwn` responde si existe una clave.

---

### Identidad

136) 🟢 ¿Qué devuelve `({ x: 1 }) 🟢 === ({ x: 1 })`?

- [ ] true, porque sus campos coinciden
- [ ] undefined, porque no se comparan objetos
- [x] false, porque son objetos distintos

> **Explicación:** `===` compara referencias de objetos, no su contenido. Cada literal crea un objeto nuevo, así que son distintos aunque tengan los mismos campos.

---

### Alias

137) 🟢 `a` es un objeto. Después de `const b = a; b.nombre = "Ana";`, ¿qué valor tiene `a.nombre`?

- [ ] El valor anterior, porque b es una copia
- [x] El nuevo valor, porque a y b son el mismo objeto
- [ ] undefined, porque b tomó la propiedad

> **Explicación:** `const b = a` copia la referencia, no el objeto. `a` y `b` apuntan al mismo objeto, así que el cambio se ve desde las dos variables.

---

### Spread superficial

138) 🟢 `original` tiene una propiedad `usuario` que es un objeto. Después de `const copia = { ...original }`, ¿qué comparación da `true`?

- [x] `copia.usuario === original.usuario`
- [ ] `copia === original`
- [ ] `copia.usuario === structuredClone(original.usuario)`

> **Explicación:** El spread copia un solo nivel. `copia.usuario` y `original.usuario` son el mismo objeto. `copia` y `original`, en cambio, son objetos distintos.

---

### Orden de spread

139) 🟢 `base` tiene la propiedad `tema: "claro"`. ¿Qué valor de `tema` tiene el objeto `{ ...base, tema: "oscuro" }`?

- [ ] "claro"
- [x] "oscuro"
- [ ] undefined

> **Explicación:** En un literal, si una clave se repite gana la última. `tema: "oscuro"` aparece después del spread y sobrescribe el valor de `base`.

---

### Destino de assign

140) 🟢 ¿Qué argumento modifica `Object.assign(destino, origen)`?

- [ ] origen
- [ ] Ninguno: devuelve un objeto nuevo
- [x] destino

> **Explicación:** `Object.assign` copia las propiedades de `origen` en `destino`, lo modifica y devuelve ese mismo `destino`. `origen` no cambia.

---

### Copia profunda

141) 🟢 Al copiar un objeto que contiene otros objetos, ¿qué hace `structuredClone` que el spread `{ ...obj }` no hace?

- [x] Puede crear objetos internos nuevos en lugar de compartirlos
- [ ] Copia también las funciones de los objetos
- [ ] Solo copia el primer nivel del objeto

> **Explicación:** `structuredClone` hace una copia profunda: crea objetos internos nuevos. El spread copia solo el primer nivel. `structuredClone` no puede copiar funciones y lanza un error si las encuentra.

---

### Renombre al desestructurar

142) 🟢 Con `const { nombre: nombreCompleto } = persona`, ¿qué variable local se crea?

- [ ] nombre
- [x] nombreCompleto
- [ ] persona.nombreCompleto

> **Explicación:** En `{ nombre: nombreCompleto }`, `nombre` es la propiedad que se lee y `nombreCompleto` es la variable que se crea.

---

### Límite de JSON como clon

143) 🟢 ¿Por qué `JSON.parse(JSON.stringify(obj))` no sirve para clonar cualquier objeto?

- [ ] Copia solo el primer nivel del objeto
- [ ] Modifica el objeto original al serializarlo
- [x] Pierde undefined, funciones y fechas, y falla con ciclos

> **Explicación:** JSON no representa `undefined` ni funciones, que se pierden. Las fechas se convierten en strings, los símbolos desaparecen y los objetos con ciclos hacen fallar `stringify`.

---

### Todas las claves propias

144) 🔴 ¿Qué añade `Reflect.ownKeys(obj)` frente a `Object.keys(obj)`?

- [x] También claves symbol y propiedades no enumerables
- [ ] Las claves heredadas del prototipo
- [ ] Los valores junto con cada clave

> **Explicación:** `Reflect.ownKeys` devuelve todas las claves propias: strings y symbols, enumerables o no. `Object.keys` devuelve solo las claves string enumerables.

---

### Congelación superficial

145) 🟢 Si se aplica `Object.freeze` a un objeto que contiene otro objeto, ¿qué cambio puede seguir siendo posible?

- [x] Modificar el objeto interior, si no se congeló
- [ ] Reasignar una propiedad directa con otro objeto
- [ ] Agregar propiedades directas si no existían antes

> **Explicación:** `Object.freeze` es superficial: congela las propiedades directas del objeto, pero un objeto interior que no se congeló sigue siendo modificable.

---

### Predeterminado al desestructurar

146) 🟢 En `const { idioma = "es" } = configuracion`, ¿cuándo se usa `"es"`?

- [ ] Cuando idioma vale null o undefined
- [ ] Cuando idioma es una cadena vacía
- [x] Cuando la propiedad falta o su valor es undefined

> **Explicación:** El valor predeterminado en la desestructuración se usa solo si la propiedad falta o vale `undefined`. `null` y `""` se respetan.

---

### Pares a objeto

147) 🟢 ¿Qué hace `Object.fromEntries` con una colección de pares clave y valor?

- [ ] Devuelve un Map con esos pares
- [x] Construye un objeto con esos pares como propiedades
- [ ] Devuelve un array de claves

> **Explicación:** `Object.fromEntries` hace lo inverso de `Object.entries`: recibe pares `[clave, valor]` y construye un objeto con ellos.

---

## `Map`, `Set` y colecciones especializadas

### Map dinámico

148) 🟢 ¿Cuándo conviene usar un Map en lugar de un objeto común?

- [ ] Cuando se necesita convertir a JSON directo
- [ ] Cuando importa el orden por posición numérica
- [x] Cuando las claves salen de los datos y pueden ser de cualquier tipo

> **Explicación:** Un Map conviene cuando las claves no se conocen de antemano, se agregan y quitan seguido o no son strings. Para campos fijos y conocidos, un objeto es más claro.

---

### Clave objeto

149) 🟢 ¿Puede un objeto usarse como clave de Map sin convertirse en string?

- [ ] No, Map convierte la clave en string
- [x] Sí
- [ ] Solo si tiene una propiedad id

> **Explicación:** Un Map acepta cualquier valor como clave, incluidos objetos, y los compara por referencia sin convertirlos a string.

---

### Ausencia de clave

150) 🟢 Un Map guarda el valor `undefined` en una clave. ¿Cómo se distingue esa clave de una que no existe?

- [x] Con mapa.has(clave)
- [ ] Con mapa.get(clave) 🟢 === undefined
- [ ] Comparando el tamaño con cero

> **Explicación:** `get` devuelve `undefined` tanto si la clave falta como si el valor guardado es `undefined`. `has` responde si la clave existe.

---

### Orden de Map

151) 🟢 ¿En qué orden recorre pares un Map?

- [ ] En orden alfabético de claves
- [x] En orden de inserción
- [ ] En orden numérico de valores

> **Explicación:** Un Map recuerda el orden en que se insertaron las claves y las recorre en ese orden.

---

### Callback de Map

152) 🟢 ¿En qué orden recibe argumentos el callback de Map.forEach?

- [ ] clave, valor, mapa
- [ ] índice, valor, mapa
- [x] valor, clave, mapa

> **Explicación:** El callback de `Map.forEach` recibe primero el valor y después la clave, igual que el `forEach` de arrays recibe primero el elemento y después el índice.

---

### Índice por clave

153) 🟢 Hay que buscar muchos alumnos por legajo dentro de un array. ¿Qué se gana al armar antes un Map con el legajo como clave?

- [x] Busca por legajo directamente, sin recorrer el array cada vez
- [ ] Ordena los alumnos por número de legajo
- [ ] Evita que haya dos alumnos con el mismo nombre

> **Explicación:** Con un Map indexado por legajo, cada búsqueda es un acceso directo por clave. Buscar en el array obliga a recorrerlo cada vez.

---

### Set y duplicados

154) 🟢 ¿Qué tamaño tiene `new Set(["js", "node", "js"])`?

- [ ] 3
- [ ] 1
- [x] 2

> **Explicación:** Un Set no guarda duplicados. `"js"` aparece dos veces pero se guarda una vez: quedan `"js"` y `"node"`.

---

### Identidad en Set

155) 🟢 ¿Qué valor tiene `new Set([{ id: 1 }, { id: 1 }]).size`?

- [ ] 1
- [x] 2
- [ ] 0

> **Explicación:** Un Set compara objetos por referencia. Dos literales `{id: 1}` son objetos distintos, así que ambos se guardan.

---

### Inserción repetida

156) 🟢 Si se agrega a un Set un valor que ya contiene, ¿qué pasa con ese valor?

- [x] Queda en su lugar original
- [ ] Se mueve al final del Set
- [ ] Se agrega otra copia al final

> **Explicación:** Agregar un valor que ya está no tiene efecto: no se duplica ni cambia de lugar. Conserva la posición de su primera inserción.

---

### Intersección

157) 🟢 ¿Qué contiene la intersección de dos conjuntos?

- [ ] Los valores de uno u otro conjunto
- [x] Solo valores presentes en ambos
- [ ] Valores presentes en exactamente uno

> **Explicación:** La intersección contiene solo los valores presentes en ambos conjuntos. La unión tiene los de cualquiera, y la diferencia simétrica, los que están en uno solo.

---

### Array o Set

158) 🟢 ¿Qué estructura conviene si importan el orden de los elementos y también sus repeticiones?

- [ ] Set
- [ ] WeakSet
- [x] Array

> **Explicación:** Un array conserva el orden y admite repetidos. Un Set y un WeakSet eliminan duplicados.

---

### Copia de Map

159) 🟢 Si los valores de un Map son objetos, ¿qué comparte `new Map(original)` con el Map original?

- [x] Las referencias a esos objetos
- [ ] El mismo Map, con otro nombre
- [ ] Nada: los valores se clonan también

> **Explicación:** `new Map(original)` crea un Map nuevo, pero copia las referencias de los valores. Si son objetos, ambos Map comparten los mismos objetos.

---

### WeakMap

160) 🟢 ¿Qué diferencia principal tiene un WeakMap respecto de un Map?

- [x] No impide que el recolector libere sus claves objeto
- [ ] Permite iterar todas sus claves
- [ ] Acepta claves primitivas y objetos

> **Explicación:** WeakMap no impide que sus claves objeto se liberen de la memoria cuando nadie más las usa. Por eso no se puede recorrer ni tiene `size`, y solo acepta objetos como clave.

---

### WeakSet

161) 🟢 ¿Para qué sirve WeakSet?

- [ ] Guardar valores primitivos sin duplicados
- [x] Marcar objetos sin impedir su liberación
- [ ] Listar objetos en orden de inserción

> **Explicación:** WeakSet sirve para marcar objetos (por ejemplo, "ya procesado") 🟢 sin impedir que se liberen de la memoria. No se puede recorrer y no acepta primitivos.

---

### Conjuntos y pertenencia

162) 🟢 ¿Qué método de Set indica si un valor pertenece al conjunto?

- [ ] set.indexOf(valor)
- [ ] set.get(valor)
- [x] set.has(valor)

> **Explicación:** `has` responde si el valor pertenece al Set. Los Set no tienen `indexOf` ni `get`.

---

## Estructuras de control

### Condición explícita

163) 🟢 ¿Qué hace más legible la condición de un `if` que expresa una regla importante?

- [ ] Un valor truthy sin comparar
- [x] Una condición con nombre que explique la regla
- [ ] Una asignación dentro del if

> **Explicación:** Una condición con nombre, como `const esMayorDeEdad = edad >= 18`, explica la regla de negocio. Un valor truthy sin contexto obliga al lector a deducir la intención.

---

### Dos caminos

164) 🟢 Cada vez que se ejecuta `if (condición) 🟢 { A } else { B }`, ¿qué está garantizado?

- [x] Se ejecuta uno de los dos caminos
- [ ] Se ejecutan A y B en orden
- [ ] No se ejecuta ninguno aunque la condición sea válida

> **Explicación:** `if...else` garantiza que se ejecuta exactamente uno de los dos bloques: si la condición es truthy, A; si no, B.

---

### Rangos else if

165) 🟢 Una cadena de `if...else if` clasifica notas en dos grupos: 8 o más, y 6 o más. ¿Qué condición debe ir primero?

- [ ] La de 6 o más
- [ ] Cualquiera, pues se evalúan ambas ramas
- [x] La de 8 o más

> **Explicación:** En una cadena de `if...else if` se ejecuta la primera rama que se cumple. Una nota de 9 también es "6 o más", así que la condición más exigente tiene que ir primero.

---

### Guarda temprana

166) 🟢 Una función empieza con `if (!pedido) 🟢 return;`. ¿Qué se logra con esa guarda?

- [ ] Hace que todas las condiciones sean globales
- [ ] Obliga a usar switch
- [x] Deja el camino válido con menos anidamiento

> **Explicación:** Una guarda retorna temprano ante el caso inválido. El resto de la función puede suponer que el pedido existe y no necesita anidarse dentro de un `if`.

---

### Anidación útil

167) 🟢 ¿Cuándo conviene anidar dos `if` en lugar de unir las condiciones con `&&`?

- [x] Cuando una decisión solo tiene sentido dentro de la otra
- [ ] Cuando ambas condiciones son independientes y triviales
- [ ] Cuando hay que garantizar que se evalúen las dos condiciones

> **Explicación:** Si la segunda condición solo tiene sentido cuando se cumple la primera, anidarlas refleja esa dependencia. Si son independientes, una expresión combinada suele ser más clara.

---

### Negación compuesta

168) 🟢 ¿Qué equivale a `!(tieneSaldo && hayStock)`?

- [ ] `!tieneSaldo && !hayStock`
- [x] `!tieneSaldo || !hayStock`
- [ ] `tieneSaldo || hayStock`

> **Explicación:** Es la ley de De Morgan: negar un AND equivale a hacer OR de las negaciones. No se puede comprar si falta saldo o si falta stock.

---

### Comparación de switch

169) 🟢 ¿Cómo compara `switch` el valor con cada `case`?

- [ ] Con igualdad flexible (==)
- [x] Con igualdad estricta
- [ ] Con comparación estructural profunda

> **Explicación:** `switch` compara con `===`, sin conversión de tipos. `case 1` no coincide con `"1"`.

---

### Uso de switch

170) 🟢 ¿En qué situación conviene usar `switch`?

- [ ] Clasificar intervalos numéricos solapados
- [ ] Repetir hasta que cambie una condición
- [x] Elegir según códigos fijos de un estado

> **Explicación:** `switch` sirve para elegir entre valores discretos, como códigos de estado. Para intervalos numéricos queda más claro un `if...else if`, y para repetir, un bucle.

---

### Fall-through

171) 🟢 ¿Qué pasa en switch si un case no termina con break, return o throw?

- [x] Sigue ejecutando el case siguiente hasta encontrar un corte
- [ ] Sale del switch al final del case
- [ ] Se produce SyntaxError al analizar el código

> **Explicación:** Sin `break`, `return` o `throw`, la ejecución sigue en el `case` siguiente sin evaluar su condición. Esto se llama fall-through.

---

### Alcance de case

172) 🟢 ¿Para qué sirve encerrar entre llaves el código de cada `case` de un `switch`?

- [x] Para que cada case tenga su propio alcance
- [ ] Para que el break sea opcional en ese case
- [ ] Para que case compare con igualdad flexible

> **Explicación:** Todos los `case` de un `switch` comparten un único alcance de bloque. Si dos declaran `const` con el mismo nombre, hay SyntaxError. Las llaves crean un alcance propio para cada `case`.

---

### Progreso de while

173) 🟢 `intentos` empieza en 0. ¿Qué le falta a `while (intentos < 3) 🟢 { ejecutar(); }` para terminar?

- [ ] Un else que termine el bucle
- [x] Incrementar intentos en el cuerpo
- [ ] Declarar intentos con const

> **Explicación:** La condición depende de `intentos`, pero nada lo cambia dentro del bucle: se repite para siempre. Falta algo como `intentos += 1` en el cuerpo.

---

### Primera ejecución

174) 🟢 ¿Qué bucle ejecuta el cuerpo al menos una vez antes de evaluar su condición?

- [ ] while
- [ ] for clásico
- [x] do...while

> **Explicación:** `do...while` ejecuta el cuerpo primero y evalúa la condición al final, así que corre al menos una vez. `while` evalúa antes de entrar.

---

### Orden de for

175) 🟢 ¿En qué orden se ejecutan las partes de un `for` clásico?

- [x] Inicio, condición, cuerpo, actualización, condición
- [ ] Inicio, condición, actualización, cuerpo, condición
- [ ] Inicio, cuerpo, condición, actualización, cuerpo

> **Explicación:** El `for` clásico inicializa una vez, evalúa la condición, ejecuta el cuerpo, actualiza y vuelve a evaluar la condición. Así hasta que sea falsa.

---

### Valores de iterable

176) 🔴 ¿Qué bucle recorre valores de un array o Set?

- [ ] for...in
- [ ] switch
- [x] for...of

> **Explicación:** `for...of` recorre los valores de cualquier iterable, como arrays, Set, Map o strings.

---

### Propiedades enumerables

177) 🟢 ¿Qué recorre `for...in` sobre un objeto?

- [ ] Los valores de las propiedades propias
- [x] Claves enumerables, también las heredadas
- [ ] Las claves propias, incluidas las symbol

> **Explicación:** `for...in` recorre los nombres de las propiedades enumerables del objeto, incluidas las heredadas del prototipo. No recorre claves symbol.

---

### Salida del bucle

178) 🟢 ¿Qué hace break dentro de un bucle?

- [ ] Salta solo a la vuelta siguiente
- [ ] Reinicia el contador
- [x] Termina el bucle más cercano

> **Explicación:** `break` termina el bucle más cercano que lo contiene. La ejecución sigue después del bucle.

---

### Siguiente vuelta

179) 🟢 ¿Qué hace continue dentro de un bucle?

- [x] Pasa a la vuelta siguiente
- [ ] Termina el bucle más cercano
- [ ] Sale de todos los bucles anidados

> **Explicación:** `continue` saltea el resto de la vuelta actual y pasa a la siguiente. El bucle no termina.

---

### Bucle anidado

180) 🟢 ¿Qué permite `break etiqueta` en bucles anidados?

- [ ] Salir del bucle interior, como un break común
- [x] Salir directamente del bucle que tiene esa etiqueta
- [ ] Volver al comienzo del bucle exterior

> **Explicación:** Una etiqueta nombra un bucle. `break etiqueta` sale directamente de ese bucle, aunque haya otros anidados dentro.

---

### Mutación durante recorrido

181) 🟢 Un bucle recorre un array por índice y elimina elementos con `splice`. ¿Por qué puede saltearse elementos?

- [x] El siguiente se corre al índice actual
- [ ] splice deja un hueco en esa posición
- [ ] splice reordena el resto del array

> **Explicación:** Al eliminar con `splice`, los elementos siguientes se corren una posición hacia atrás. Si el índice avanza igual, el elemento que ocupó el lugar del eliminado queda sin revisar.

---

### Ternario

182) 🟢 ¿Cuándo conviene usar el operador ternario `condición ? a : b`?

- [ ] Al encadenar varias decisiones anidadas
- [ ] Al ejecutar una acción sin valor de retorno
- [x] Al elegir un valor entre dos alternativas de forma breve

> **Explicación:** El ternario es una expresión: elige uno de dos valores en una línea. Anidado o usado para ejecutar acciones, se vuelve difícil de leer.

---

## Errores y excepciones

### Propagación

183) 🟢 Dentro de un bloque, `JSON.parse` lanza un error porque el texto no es JSON válido. ¿Qué pasa con la sentencia siguiente de ese bloque?

- [ ] Se ejecuta con el valor undefined
- [x] No se ejecuta: la excepción corta el bloque y se propaga
- [ ] Se ejecuta y el error se registra en consola

> **Explicación:** Cuando una sentencia lanza, el resto del bloque no se ejecuta. La excepción se propaga hasta un `catch` o, si no lo hay, detiene el programa.

---

### Captura

184) 🟢 Si una sentencia dentro de `try` lanza un error, ¿dónde continúa la ejecución?

- [ ] Al comienzo del try
- [ ] Directo al finally
- [x] Al catch correspondiente

> **Explicación:** Cuando algo lanza dentro de `try`, el control salta de inmediato al `catch`. Después se ejecuta `finally`, si existe.

---

### Objeto Error

185) 🟢 ¿Por qué se recomienda lanzar `new Error(mensaje)` y no una cadena?

- [ ] Permite capturarlo con catch
- [x] Incluye nombre, mensaje y pila
- [ ] Hace que el error no detenga el programa

> **Explicación:** Un objeto `Error` incluye `name`, `message` y `stack` (la pila de llamadas), y puede llevar `cause`. Un string también se puede capturar, pero no trae esa información.

---

### Contrato estricto

186) 🟢 Una función `dividir` no admite divisor cero y, si lo recibe, hace `throw new RangeError(...)`. ¿Qué expresa ese error?

- [x] Que la entrada incumple el contrato de esa función
- [ ] Que JavaScript lanza al dividir un number por cero
- [ ] Que cero se convierte en null

> **Explicación:** `RangeError` indica que un valor está fuera de lo aceptado. JavaScript no lanza nada al dividir un number por cero: da `Infinity`. Si la función prohíbe el cero, es su contrato y debe lanzar ella.

---

### Resultado esperable

187) 🟢 Una función busca un alumno, y que no exista es un resultado habitual. ¿Qué conviene que devuelva si no lo encuentra?

- [ ] Lanzar una excepción al no encontrarlo
- [ ] Un objeto alumno con campos vacíos
- [x] Un resultado documentado como null

> **Explicación:** Si no encontrar es un resultado esperado, devolver `null` (documentado) 🟢 es más claro que lanzar. Las excepciones son para situaciones que la función no puede resolver.

---

### Tipo incompatible

188) 🟢 ¿Qué error lanza JavaScript cuando una operación recibe un valor de un tipo que no corresponde?

- [x] TypeError
- [ ] RangeError
- [ ] URIError

> **Explicación:** TypeError aparece cuando una operación recibe un valor del tipo equivocado, por ejemplo al llamar a algo que no es una función.

---

### Sintaxis de JSON

189) 🟢 ¿Qué error lanza `JSON.parse` si el texto está mal formado?

- [ ] ReferenceError
- [x] SyntaxError
- [ ] AggregateError

> **Explicación:** `JSON.parse` lanza SyntaxError si el texto no es JSON válido.

---

### Error personalizado

190) 🟢 Una función de stock lanza un error que incluye las propiedades `disponible` y `requerido`. ¿Qué ventaja tiene eso?

- [ ] Hace innecesario el mensaje de error
- [x] Permite decidir con datos, no con el texto
- [ ] Hace que el error no necesite capturarse

> **Explicación:** Con propiedades como `disponible` y `requerido`, quien captura el error puede decidir con datos. Extraer esos números del texto del mensaje es frágil.

---

### Causa original

191) 🟢 Se captura un error técnico y se lanza otro, más comprensible para la aplicación. ¿Qué propiedad del nuevo error guarda el error original?

- [ ] stackLength
- [ ] responseText
- [x] cause

> **Explicación:** `cause` guarda el error original: `new Error("mensaje", { cause: error })`. Así se traduce a un error de dominio sin perder el detalle técnico.

---

### Captura acotada

192) 🟢 ¿Por qué conviene evitar un único `try` que envuelva el parseo, la validación, el guardado y la notificación?

- [x] Se vuelve difícil saber qué etapa falló y cómo recuperarse
- [ ] Impide que finally se ejecute
- [ ] Hace más lento el código del try

> **Explicación:** Con un `try` enorme, el `catch` no sabe qué etapa falló y no puede elegir cómo recuperarse. Varios `try` pequeños permiten tratar cada fallo según su causa.

---

### Relanzamiento

193) 🟢 Un `catch` recibe un error que no sabe manejar. ¿Cómo conviene relanzarlo para conservar su tipo y su pila?

- [ ] `throw new Error(error.message)` sin causa
- [x] `throw error`
- [ ] `return false`

> **Explicación:** `throw error` relanza el mismo objeto, con su tipo, su pila y su causa intactos. Crear un `Error` nuevo solo con el mensaje pierde esa información.

---

### Limpieza

194) 🟢 ¿Cuándo se ejecuta el bloque `finally`?

- [x] Siempre: tras un éxito, un return o una excepción del try
- [ ] Solo cuando el try lanza una excepción
- [ ] Solo si el try no terminó con return

> **Explicación:** `finally` se ejecuta siempre al salir del `try`: si terminó bien, si hubo un `return` o si hubo una excepción, capturada o no.

---

### Retorno peligroso

195) 🟢 ¿Qué riesgo tiene escribir `return` dentro de un bloque `finally`?

- [ ] Impide que finally termine de limpiar
- [ ] Relanza la excepción que se había capturado
- [x] Puede tapar el return o el error del try

> **Explicación:** Un `return` dentro de `finally` reemplaza el valor que iba a devolver el `try` y descarta cualquier excepción pendiente, que queda silenciada.

---

### Promesa no esperada

196) 🔴 Dentro de un `try` se llama a una función que devuelve una promesa, sin `await`. Si la promesa se rechaza después, ¿por qué el `catch` no lo captura?

- [ ] catch no puede recibir objetos Promise
- [x] El try ya terminó cuando llega el rechazo
- [ ] El rechazo se convierte en undefined sin error

> **Explicación:** Sin `await`, el `try` termina en cuanto crea la promesa. El rechazo llega más tarde, cuando el `try` ya no está activo. Con `await`, el rechazo se convierte en una excepción dentro del `try`.

---

### Estado HTTP

197) 🔴 Después de `const response = await fetch(url)`, ¿qué hay que comprobar para detectar una respuesta 404?

- [x] response.ok o response.status
- [ ] Si la promesa de fetch fue rechazada
- [ ] Si response.json() 🔴 devuelve null

> **Explicación:** `fetch` solo rechaza ante fallos de red. Un 404 es una respuesta válida: la promesa se resuelve y hay que revisar `response.ok` (falso para 4xx y 5xx) 🔴 o `response.status`.

---

### Errores concurrentes

198) 🔴 ¿Qué devuelve Promise.allSettled cuando algunas tareas fallan?

- [ ] Solo los valores de las tareas exitosas
- [ ] El primer rechazo, como Promise.all
- [x] Un objeto por tarea con su estado: fulfilled o rejected

> **Explicación:** `Promise.allSettled` espera todas las tareas y devuelve un objeto por cada una: `{ status: "fulfilled", value }` o `{ status: "rejected", reason }`. Nunca se rechaza.

---

### Mensaje y diagnóstico

199) 🟢 Si la aplicación falla por un error interno, ¿qué conviene mostrarle a quien la usa?

- [ ] El mensaje técnico original del error
- [x] Un mensaje claro, sin detalles internos
- [ ] El código de error y la pila resumida

> **Explicación:** A la persona usuaria le sirve un mensaje comprensible sobre qué pasó y qué puede hacer. La pila y los detalles técnicos van al registro interno: mostrarlos confunde y puede exponer información sensible.

---

### Variantes normales

200) 🟢 En una tienda, quedarse sin stock es un caso frecuente. ¿Cómo conviene que la función que procesa la compra informe ese caso?

- [ ] Lanzar un Error y capturarlo arriba
- [ ] Devolver undefined sin explicación
- [x] Un resultado con ok false y motivo

> **Explicación:** Si falta de stock es un caso frecuente, forma parte del flujo normal. Devolver un resultado como `{ ok: false, motivo }` lo hace explícito, y las excepciones quedan para lo inesperado.

---

## Funciones

### Definición y llamada

201) 🟢 ¿Qué diferencia hay entre `sumar` y `sumar(2, 3)`?

- [x] Uno nombra la función; el otro la ejecuta con 2 y 3
- [ ] Ambos llaman; el primero sin argumentos
- [ ] El primero es un string con el nombre

> **Explicación:** `sumar` es una referencia a la función: se puede pasar o guardar sin ejecutarla. Los paréntesis la invocan: `sumar(2, 3)` la ejecuta y da el resultado.

---

### Parámetros

202) 🟢 En `function presentar(nombre) 🟢 {}`, ¿qué es `nombre`?

- [ ] Un argumento de la llamada
- [x] Un parámetro de la función
- [ ] Una variable global implícita

> **Explicación:** `nombre` es un parámetro: una variable local que se declara en la definición de la función. El argumento es el valor concreto que se pasa en cada llamada.

---

### Argumento omitido

203) 🟢 Una función se llama sin pasarle un argumento, y ese parámetro no tiene valor predeterminado. ¿Qué valor tiene el parámetro?

- [x] undefined
- [ ] null
- [ ] ReferenceError

> **Explicación:** Un parámetro sin argumento y sin valor predeterminado queda en `undefined`. No se lanza ningún error.

---

### Declaración elevada

204) 🟢 ¿Se puede llamar a `duplicar()` en una línea anterior a su declaración `function duplicar(n) 🟢 {...}`, dentro del mismo alcance?

- [ ] No, lanza ReferenceError
- [ ] Solo si está en modo estricto
- [x] Sí

> **Explicación:** Las declaraciones `function` se elevan completas, con nombre y cuerpo, así que se pueden llamar antes de su línea dentro del mismo alcance.

---

### Expresión en const

205) 🟢 ¿Se puede llamar a una función guardada con `const f = () 🟢 => ...` en una línea anterior a esa declaración?

- [ ] Sí, se eleva igual que una declaración completa
- [x] No, sigue las reglas de const
- [ ] Solo si no recibe argumentos

> **Explicación:** Una función guardada en `const` sigue las reglas de `const`. Antes de la línea está en la zona muerta temporal y usarla lanza ReferenceError.

---

### Objeto desde flecha

206) 🟢 Una función flecha sin llaves debe devolver un objeto literal. ¿Con qué hay que rodear el objeto?

- [ ] Corchetes de array
- [ ] Comillas
- [x] Paréntesis

> **Explicación:** Sin paréntesis, las llaves se interpretan como el cuerpo de la función, no como un objeto. `() 🟢 => ({ a: 1 })` devuelve el objeto.

---

### This de flecha

207) 🟢 Dentro de un método común se define una función flecha. ¿Qué `this` usa la flecha?

- [x] El mismo this que tiene el método que la contiene
- [ ] Uno nuevo creado por la flecha
- [ ] globalThis, en modo no estricto

> **Explicación:** La flecha no crea su propio `this`: toma el del alcance donde se escribió. Dentro de un método, ese `this` es el del método.

---

### Método separado

208) 🟢 Un método usa `this`. ¿Qué puede pasar si se guarda ese método en una variable y se lo llama desde ella?

- [ ] El objeto se clona
- [ ] El método se convierte en generador
- [x] Puede perder el receptor original

> **Explicación:** `this` se decide en cada llamada según lo que está antes del punto. Si se guarda el método en una variable y se llama solo, pierde el objeto y `this` queda `undefined` en modo estricto.

---

### Receptor fijado

209) 🟢 ¿Qué hace `persona.saludar.bind(persona)`?

- [ ] Llama a saludar con this = persona
- [x] Crea una función nueva con this fijado en persona
- [ ] Cambia saludar en el propio objeto

> **Explicación:** `bind` no llama a la función: devuelve una función nueva cuyo `this` queda fijado en `persona`. `call` y `apply`, en cambio, la ejecutan en el momento.

---

### Predeterminado

210) 🟢 Con `function f(x = 3) 🟢 { return x; }`, ¿con qué argumento `f` devuelve 3?

- [x] undefined
- [ ] null
- [ ] `""` (cadena vacía)

> **Explicación:** El valor predeterminado solo se activa con `undefined` u omisión. `null` y `""` son valores explícitos y se respetan.

---

### Rest

211) 🟢 ¿Dónde debe ubicarse `...resto` en la lista de parámetros?

- [ ] Al comienzo
- [x] Al final
- [ ] En cualquier posición

> **Explicación:** El parámetro rest junta los argumentos restantes, así que tiene que ser el último. En otra posición produce SyntaxError.

---

### Arguments

212) 🟢 ¿Qué ventaja tiene el parámetro rest (`...args`) 🟢 frente al objeto `arguments`?

- [ ] Un this propio dentro de las flechas
- [ ] La cantidad de argumentos recibidos
- [x] Un array real de argumentos, también en flechas

> **Explicación:** Rest crea un array real, con `map`, `filter` y los demás métodos. `arguments` no es un array, y las funciones flecha no tienen `arguments` propio.

---

### Parámetro desestructurado

213) 🟢 La función `function f({ a, b }) 🟢 {...}` se llama como `f(null)`. ¿Qué ocurre?

- [x] Lanza TypeError al intentar desestructurar null
- [ ] Usa los valores predeterminados
- [ ] Desestructura un objeto vacío

> **Explicación:** Desestructurar `null` o `undefined` lanza TypeError al entrar a la función, antes de ejecutar el cuerpo. Para evitarlo, se usa un predeterminado: `({ a, b } = {})`.

---

### Primitivo como argumento

214) 🟢 Una función recibe un número y dentro le asigna el doble a su parámetro. ¿Cambia la variable que se pasó como argumento?

- [ ] Sí, porque se pasa por referencia
- [x] No
- [ ] Solo si la función usa return

> **Explicación:** Los números se pasan por valor: el parámetro es una copia. Cambiarlo dentro de la función no afecta la variable exterior.

---

### Referencia copiada

215) 🟢 Una función recibe un objeto y modifica una de sus propiedades. ¿Qué ve después el código que la llamó?

- [x] El cambio, porque ambos apuntan al mismo objeto
- [ ] El objeto sin cambios, porque se copió
- [ ] El cambio, solo si la función lo devuelve

> **Explicación:** Se copia la referencia, no el objeto. La función y quien la llamó apuntan al mismo objeto, así que el cambio de una propiedad se ve desde afuera.

---

### Reasignar parámetro objeto

216) 🟢 Una función recibe un objeto y asigna un objeto nuevo a su parámetro. ¿A qué apunta la variable que se pasó como argumento?

- [ ] Pasa a apuntar al nuevo objeto
- [ ] Se vuelve undefined
- [x] Permanece apuntando al objeto original

> **Explicación:** Reasignar el parámetro solo cambia a qué apunta la variable local. La variable exterior sigue apuntando al objeto original.

---

### Ausencia de return

217) 🟢 ¿Qué devuelve una función que solo hace console.log y no retorna?

- [ ] El texto impreso
- [ ] La última variable local
- [x] undefined

> **Explicación:** Una función sin `return`, o con `return` solo, devuelve `undefined`. `console.log` muestra texto pero no lo devuelve.

---

### Salto tras return

218) 🟢 ¿Qué pasa si se escribe `return` y el objeto literal que se quiere devolver empieza en la línea siguiente?

- [ ] Que el objeto se devuelva normalmente
- [x] Que la función devuelva undefined
- [ ] Que se produzca un SyntaxError

> **Explicación:** La inserción automática de punto y coma pone un `;` después de `return` si la línea termina ahí. La función devuelve `undefined` y el objeto no se evalúa. El `{` tiene que ir en la misma línea que `return`.

---

### Varios resultados

219) 🟢 Una función necesita devolver varios datos. ¿Qué estructura les da nombres claros?

- [x] Un objeto con una propiedad por cada dato
- [ ] Varios return, uno por cada dato
- [ ] Un array con los datos en orden

> **Explicación:** Un objeto nombra cada dato devuelto: `return { total, promedio }`. Un array obliga a recordar qué posición es cada cosa.

---

### Clausura viva

220) 🟢 Una función interior usa una variable exterior, y esa variable cambia después de crear la función. ¿Qué valor ve la función interior?

- [ ] Una copia del valor inicial
- [ ] El valor que tenía al declarar la clausura
- [x] La variable, con su valor actual

> **Explicación:** Una clausura guarda la variable, no una foto de su valor. Si la variable cambia, la función ve el valor actual.

---

### Funciones async

221) 🔴 ¿Qué devuelve siempre una función marcada async?

- [ ] Un valor síncrono sin envoltorio
- [x] Una promesa
- [ ] Un generador

> **Explicación:** Una función `async` siempre devuelve una promesa. Si retorna un valor, la promesa se resuelve con él; si lanza, se rechaza.

---

### Generadores

222) 🔴 ¿Cuándo se ejecuta el código dentro de una función generadora?

- [x] Cuando se llama a next()
- [ ] Al llamar a la función generadora
- [ ] Al declararse la función

> **Explicación:** Llamar a una función generadora no ejecuta su cuerpo: devuelve un iterador. El cuerpo avanza hasta el siguiente `yield` cada vez que se pide un valor, por ejemplo con `next()` o `for...of`.

---

### Alcance léxico

223) 🟢 Una función usa la variable `tasa` sin declararla adentro. ¿Dónde la busca JavaScript?

- [ ] En el objeto desde el que la llamaron
- [ ] En el alcance del lugar donde se la llama
- [x] En los alcances del lugar donde fue definida la función

> **Explicación:** JavaScript usa alcance léxico: una variable libre se busca en los alcances que rodean el lugar donde se escribió la función, no donde se la llama.

---

### Contadores independientes

224) 🟢 `crearContador()` devuelve funciones que modifican una variable local. Si se llama dos veces a `crearContador()`, ¿qué comparten los dos contadores?

- [x] Nada: cada llamada tiene su propio estado
- [ ] El mismo contador, porque la función es única
- [ ] Solo el valor inicial del contador

> **Explicación:** Cada llamada a `crearContador` crea un alcance nuevo con su propia variable. Las funciones de cada llamada comparten su contador, pero no el de la otra.

---

### Clausuras de un bucle

225) 🟢 ¿Qué muestra `funciones.map(fn => fn())` al final de este código?

```js
const funciones = [];
for (let i = 0; i < 3; i += 1) 🟢 {
  funciones.push(() 🟢 => i);
}
```

- [ ] Un array con 3, 3 y 3
- [x] Un array con 0, 1 y 2
- [ ] Un array con 2, 2 y 2

> **Explicación:** `let` en un `for` crea una variable nueva en cada vuelta, así que cada flecha captura su propio `i`: 0, 1 y 2. Con `var` habría una sola variable y las tres verían 3.

---

### Contrato del callback

226) 🟢 Al documentar una función que recibe un callback, ¿qué conviene aclarar?

- [x] Si lo ejecuta enseguida, varias veces o más tarde
- [ ] Que lo ejecuta exactamente una vez y de forma inmediata
- [ ] Que el callback no puede devolver un valor

> **Explicación:** Quien recibe un callback debe decir cuándo y cuántas veces lo llama: en el momento, varias veces o más tarde. De eso depende cómo se escribe el callback.

---

## Programación funcional y pipelines de datos

### Orden superior

227) 🟢 ¿Qué caracteriza a una función de orden superior?

- [ ] Se llama a sí misma
- [x] Recibe o devuelve funciones
- [ ] No tiene efectos secundarios

> **Explicación:** Una función de orden superior recibe funciones como argumento, devuelve funciones o ambas cosas, como `map`, `filter` o una fábrica de funciones.

---

### Pureza

228) 🟢 ¿Qué condiciones cumple una función pura?

- [ ] Mismo resultado, aunque modifique variables externas
- [ ] Ningún efecto externo, aunque cambie el resultado
- [x] Siempre el mismo resultado y ningún efecto externo observable

> **Explicación:** Una función pura siempre devuelve el mismo resultado para las mismas entradas y no produce efectos externos observables (no modifica variables de afuera ni hace entrada o salida).

---

### Dependencia implícita

229) 🟢 Una función que calcula un impuesto lee la variable global `tasaActual`. ¿Por qué eso la vuelve impura?

- [ ] Leer una variable global la modifica
- [ ] Toda multiplicación con decimales es impura
- [x] Su resultado depende de algo externo

> **Explicación:** Si la función lee una variable global, su resultado depende de algo que no está en sus argumentos. Con el mismo argumento puede dar distinto resultado, y eso la hace impura.

---

### Efectos en bordes

230) 🟢 En un programa hecho con funciones puras, ¿dónde conviene ubicar la lectura de archivos y la escritura de resultados?

- [ ] Dentro de cada transformación del pipeline
- [x] En los bordes del programa: al entrar y al salir
- [ ] En una función auxiliar por cada dato

> **Explicación:** Conviene concentrar la entrada y salida (leer archivos, escribir, mostrar) 🟢 en los bordes del programa, y dejar el centro hecho de transformaciones puras, más fáciles de probar.

---

### Actualización inmutable

231) 🟢 ¿En qué se diferencia `{ ...alumno, nota: 8 }` de hacer `alumno.nota = 8`?

- [x] Crea una versión exterior nueva con nota 8
- [ ] Clona profundamente cualquier objeto anidado
- [ ] Borra todas las otras propiedades

> **Explicación:** El spread crea un objeto exterior nuevo con `nota: 8` y deja intacto `alumno`. Es una copia superficial: los objetos anidados siguen compartidos.

---

### Mutación local

232) 🟢 Una función crea un Map dentro de su cuerpo, lo modifica y no toca sus argumentos. ¿Puede ser pura?

- [ ] No, cualquier mutación la vuelve impura
- [ ] Solo si el Map se congela al terminar
- [x] Sí, si no hay efectos visibles afuera

> **Explicación:** La pureza se juzga desde afuera. Si la función crea y modifica su propio Map interno, no toca sus entradas y su resultado depende solo de ellas, sigue siendo pura.

---

### Map

233) 🟢 ¿Cuántos elementos agrega `map` al resultado por cada elemento del array?

- [ ] Cero o una, según el callback
- [x] Una
- [ ] Tantas como devuelva el callback

> **Explicación:** `map` produce exactamente un resultado por cada elemento, así que el array nuevo tiene la misma longitud. Para devolver cero o varios por elemento existe `flatMap`.

---

### Filter

234) 🟢 ¿Qué decide la función que se le pasa a `filter`?

- [x] Si se conserva cada elemento
- [ ] El orden de inserción global
- [ ] La cantidad exacta de llamadas futuras

> **Explicación:** El predicado de `filter` devuelve verdadero o falso para cada elemento: verdadero lo conserva, falso lo descarta.

---

### Reduce

235) 🟢 En `reduce`, ¿qué papel cumple el valor inicial?

- [ ] Es el primer elemento que se procesa
- [x] Es el acumulador de la primera vuelta
- [ ] Es el valor que se devuelve si falla

> **Explicación:** El valor inicial es el acumulador en la primera vuelta. Sin él, `reduce` usa el primer elemento como acumulador y empieza desde el segundo.

---

### Consultas especializadas

236) 🟢 ¿Qué método de array deja de recorrer apenas encuentra un elemento que cumple la condición y devuelve un booleano?

- [ ] every
- [ ] forEach
- [x] some

> **Explicación:** `some` se detiene en cuanto un elemento cumple, porque ya sabe que la respuesta es verdadera. `forEach` recorre todo siempre, y `every` se detiene en el primero que no cumple.

---

### ForEach

237) 🟢 ¿Cuándo es `forEach` el método adecuado?

- [x] Cuando solo importa el efecto por elemento
- [ ] Cuando se necesita un array transformado
- [ ] Cuando hay que cortar el recorrido antes

> **Explicación:** `forEach` comunica que se busca un efecto por elemento (mostrar, guardar) 🟢 y no un resultado. No permite `break` ni devuelve un array.

---

### FlatMap

238) 🟢 ¿Cuántos elementos puede aportar al resultado cada llamada de la función que recibe `flatMap`?

- [x] Cero, uno o varios elementos
- [ ] Exactamente un elemento, como map
- [ ] Un array anidado sin aplanar

> **Explicación:** `flatMap` aplica la función y aplana un nivel. Si la función devuelve `[]`, el elemento desaparece; si devuelve `[a, b]`, aparecen dos.

---

### Orden sin mutación

239) 🟢 ¿Qué método ordena un array devolviendo un array nuevo, sin modificar el original?

- [ ] sort
- [ ] toReversed
- [x] toSorted

> **Explicación:** `toSorted` devuelve un array nuevo ordenado. `sort` ordena el original, y `toReversed` crea una copia invertida, no ordenada.

---

### Pipeline

240) 🟢 ¿Qué hacen, en orden, los pasos `filter`, `map` y `reduce` encadenados?

- [ ] Acumular, ordenar y borrar
- [x] Seleccionar, transformar y acumular
- [ ] Crear un objeto, clonarlo y serializarlo

> **Explicación:** `filter` selecciona los elementos, `map` los transforma y `reduce` los acumula en un único resultado.

---

### Composición

241) 🟢 ¿Qué hace una función `pipe` que recibe varias funciones y las aplica de izquierda a derecha?

- [ ] Ejecuta todas las funciones sobre la entrada original sin relación
- [ ] Vuelve cada función recursiva
- [x] Pasa la salida de una transformación a la siguiente

> **Explicación:** `pipe` encadena funciones de izquierda a derecha: la salida de cada una es la entrada de la siguiente, como una cañería.

---

### Predicado negado

242) 🟢 Si `esImpar = n => !esPar(n)`, ¿qué papel tiene `esPar`?

- [x] Un predicado que se reutiliza
- [ ] Una función de orden superior
- [ ] Un callback que se ejecuta después

> **Explicación:** `esPar` es un predicado (devuelve verdadero o falso) 🟢 que se reutiliza para definir otro por negación. Así la regla vive en un solo lugar.

---

### Evaluación inmediata

243) 🟢 ¿Qué ocurre al ejecutar `array.filter(...).map(...)`?

- [ ] Nada se ejecuta hasta pedir el resultado
- [x] Cada una crea un array intermedio
- [ ] Se combinan en un único recorrido

> **Explicación:** Los métodos de array son ansiosos: `filter` recorre todo y crea un array intermedio, y después `map` recorre ese array y crea otro.

---

### Evaluación diferida

244) 🟢 ¿Qué ventaja tiene usar un generador para producir una secuencia muy grande?

- [ ] Calcular todos los valores por adelantado
- [ ] Ejecutarse en paralelo con el resto
- [x] Producir solo los valores consumidos

> **Explicación:** Un generador produce cada valor solo cuando se lo piden. En una secuencia enorme o infinita, se calculan únicamente los valores que se consumen.

---

### Firma del callback

245) 🟢 ¿Por qué `["10", "10", "10"].map(parseInt)` puede dar resultados inesperados?

- [x] map pasa el índice y parseInt lo usa como base
- [ ] map convierte cada string en número antes
- [ ] parseInt necesita que la base sea un string

> **Explicación:** `map` pasa tres argumentos (elemento, índice y array), y `parseInt` usa el segundo como base. Resulta `parseInt("10", 0)`, `parseInt("10", 1)` y `parseInt("10", 2)`: 10, NaN y 2.

---

### Retorno de flecha

246) 🟢 ¿Qué devuelve la función `n => { n * 2; }` al llamarla?

- [ ] El doble de n
- [x] undefined
- [ ] Un objeto con el doble de n

> **Explicación:** Con llaves, la flecha tiene un cuerpo de bloque y necesita `return`. Sin él devuelve `undefined`. El retorno implícito solo existe sin llaves: `n => n * 2`.

---

## Recursividad y árboles binarios

### Marcos de llamada

247) 🟢 ¿Qué crea cada llamada recursiva para guardar sus parámetros y variables locales?

- [ ] Una variable global nueva
- [x] Un marco propio en la pila
- [ ] Un hilo de ejecución propio

> **Explicación:** Cada llamada, recursiva o no, crea un marco propio en la pila de llamadas, con sus parámetros y variables locales. Por eso las llamadas no se pisan entre sí.

---

### Caso base

248) 🟢 ¿Qué hace el caso base de una función recursiva?

- [x] Resuelve una entrada sin hacer otra llamada
- [ ] Duplica la entrada para la llamada siguiente
- [ ] Ordena los nodos del árbol

> **Explicación:** El caso base resuelve directamente una entrada simple, sin volver a llamar a la función. Sin caso base, la recursión no termina.

---

### Reducción

249) 🟢 Cuando una función recursiva no está en el caso base y se llama a sí misma, ¿qué debe garantizar esa llamada?

- [ ] Reducir el problema a la mitad
- [ ] Hacer al menos dos llamadas
- [x] Acercarse al caso base con una entrada más pequeña

> **Explicación:** Cada llamada recursiva debe trabajar con una entrada más pequeña, que se acerque al caso base. Si no, la recursión es infinita y termina en un desbordamiento de pila.

---

### Combinación

250) 🟢 En `factorial(n) 🟢 = n * factorial(n - 1)`, ¿qué operación combina el resultado de la llamada recursiva?

- [x] La multiplicación por n
- [ ] La lectura de n sin cambio
- [ ] La creación de un array

> **Explicación:** `factorial(n - 1)` resuelve el problema más chico. Multiplicarlo por `n` combina ese resultado y da la solución del problema actual.

---

### Secuencia lineal

251) 🟢 Para sumar un array de millones de elementos, ¿por qué conviene un bucle en lugar de recursión?

- [ ] Permite sumar sin variable acumuladora
- [x] Evita un marco de pila por elemento
- [ ] Recorre el array en orden inverso

> **Explicación:** Cada llamada recursiva ocupa un marco en la pila. Con un array enorme, la pila se desborda (RangeError). Un bucle usa memoria constante.

---

### Estructura anidada

252) 🟢 Un documento tiene secciones que pueden contener otras secciones, sin límite de profundidad. ¿Por qué una función recursiva es adecuada para recorrerlo?

- [ ] Las secciones forman una lista plana
- [ ] La profundidad se conoce de antemano
- [x] Cada sección tiene la misma forma que la sección que la contiene

> **Explicación:** Una sección que contiene secciones es una estructura recursiva: cada parte tiene la misma forma que el todo. Una función recursiva recorre cualquier profundidad con el mismo código.

---

### Nodo vacío

253) 🔴 En un árbol binario, ¿qué indica que un nodo tenga `null` como hijo?

- [x] Un subárbol vacío
- [ ] Un nodo con valor cero
- [ ] Una referencia al padre

> **Explicación:** `null` como hijo indica que ese subárbol está vacío: no hay nodo de ese lado.

---

### Invariante de búsqueda

254) 🔴 En un árbol binario de búsqueda, ¿dónde van los valores menores que el nodo?

- [ ] En la rama que tenga menos nodos
- [x] En su subárbol menor
- [ ] En el subárbol mayor, si hay lugar

> **Explicación:** En un árbol binario de búsqueda, los valores menores que un nodo van a su subárbol menor (izquierdo) 🔴 y los mayores, al mayor (derecho). Esa regla se cumple en cada nodo.

---

### Duplicados

255) 🔴 ¿Por qué hay que decidir una regla para los valores repetidos en un árbol binario de búsqueda?

- [ ] Porque el árbol no admite duplicados
- [ ] Para que el recorrido inorden sea más rápido
- [x] Para que todas las operaciones coincidan

> **Explicación:** Si los duplicados se insertan de un lado pero se buscan del otro, las operaciones no se encuentran. Hay que fijar una sola regla (rechazarlos, mandarlos a un lado o contarlos) 🔴 y aplicarla en todas.

---

### Recorrido inorden

256) 🔴 ¿En qué orden visita los nodos un recorrido inorden de un árbol binario?

- [ ] Nodo, menor, mayor
- [ ] Menor, mayor, nodo
- [x] Menor, nodo, mayor

> **Explicación:** El inorden visita el subárbol menor, después el nodo y después el subárbol mayor. En un árbol de búsqueda, eso da los valores ordenados de menor a mayor.

---

### Preorden

257) 🔴 ¿Qué visita primero un recorrido preorden de un árbol binario?

- [x] El nodo antes de sus hijos
- [ ] La hoja más profunda
- [ ] El subárbol mayor antes de la raíz

> **Explicación:** El preorden procesa cada nodo antes que sus hijos, empezando por la raíz. Sirve, por ejemplo, para copiar un árbol.

---

### Postorden

258) 🔴 ¿Cuándo procesa cada nodo un recorrido postorden de un árbol binario?

- [ ] Antes de ambos hijos
- [x] Después de ambos hijos
- [ ] Entre el hijo menor y el mayor

> **Explicación:** El postorden procesa los dos subárboles primero y el nodo al final. Sirve, por ejemplo, para liberar o calcular algo que depende de los hijos.

---

### Generador de recorrido

259) 🔴 ¿Qué ventaja tiene recorrer un árbol con un generador?

- [ ] Evita toda recursión en el recorrido
- [x] Entrega valores a medida que se piden
- [ ] Recorre el árbol en varios hilos a la vez

> **Explicación:** Un generador entrega cada valor al pedirlo con `yield`. Se puede recorrer el árbol, detenerse antes y nunca construir un array con todos los valores.

---

### Búsqueda dirigida

260) 🔴 Al buscar un valor en un árbol binario de búsqueda, después de compararlo con un nodo, ¿por cuántas ramas se sigue buscando?

- [x] Una rama como máximo
- [ ] Ambas ramas
- [ ] Ninguna aunque el valor difiera

> **Explicación:** En un árbol de búsqueda, la comparación decide un solo lado: menor va a una rama y mayor a la otra. Si el valor es igual, la búsqueda termina.

---

### Inserción mutable

261) 🔴 En una inserción recursiva en un árbol se escribe `nodo.menor = insertar(nodo.menor, valor)`. ¿Por qué se reasigna `nodo.menor`?

- [ ] Para que la raíz pase a ser el nodo menor
- [ ] Para borrar el subárbol menor anterior
- [x] insertar puede devolver un nodo nuevo donde antes había null

> **Explicación:** Cuando la rama está vacía, `insertar(null, valor)` crea y devuelve un nodo nuevo. Reasignar `nodo.menor` engancha ese nodo en el árbol. En los demás casos, devuelve el mismo nodo.

---

### Compartir estructural

262) 🔴 Al insertar un valor en un árbol sin modificar el original (inserción inmutable), ¿qué nodos comparte el árbol nuevo con el anterior?

- [ ] Los del camino de la raíz al nuevo nodo
- [x] Los de ramas que no cambiaron
- [ ] Ninguno, se clona todo

> **Explicación:** En una inserción inmutable se copian solo los nodos del camino desde la raíz hasta el punto de inserción. Las ramas que no cambiaron se comparten con la versión anterior.

---

### Cantidad de nodos

263) 🔴 Si los nodos no guardan ningún contador, ¿qué hace falta para contar los nodos de un árbol?

- [x] Visitar todos los nodos
- [ ] Consultar solo la raíz
- [ ] Consultar solo el mínimo

> **Explicación:** Sin un contador guardado, la única forma de saber cuántos nodos hay es visitarlos todos. El costo crece con la cantidad de nodos.

---

### Mínimo

264) 🔴 ¿Cómo se encuentra el valor mínimo en un árbol binario de búsqueda?

- [ ] Bajando por la rama mayor
- [ ] Comparando todas las hojas
- [x] Bajando por la rama menor

> **Explicación:** El mínimo es el nodo más a la izquierda: se baja siempre por la rama menor hasta que no haya más.

---

### Eliminar nodo hoja

265) 🔴 Al eliminar una hoja de un árbol binario, ¿qué valor ocupa su lugar en el nodo padre?

- [ ] La raíz original
- [ ] Una copia de ambos hijos
- [x] null

> **Explicación:** Una hoja no tiene hijos, así que se reemplaza por `null` en el padre y ese subárbol queda vacío.

---

### Eliminar con dos hijos

266) 🔴 En un árbol binario de búsqueda, ¿cómo puede eliminarse un nodo con dos hijos?

- [x] Reemplazarlo por su sucesor y quitar el sucesor de su rama
- [ ] Subir su hijo mayor a su lugar
- [ ] Reemplazarlo por la raíz del árbol

> **Explicación:** Se reemplaza el valor por el de su sucesor (el mínimo del subárbol mayor), que conserva el orden. Después se elimina el sucesor de su rama, y como no tiene hijo menor, es un caso simple.

---

### Validar orden

267) 🔴 Para verificar que un árbol es de búsqueda, ¿por qué no alcanza con comparar cada nodo con sus hijos directos?

- [ ] Los hijos pueden ser null
- [x] Un ancestro también impone límites
- [ ] El orden también depende de la altura

> **Explicación:** La regla del árbol vale para todo el subárbol, no solo para los hijos directos. Un nieto puede respetar a su padre y violar el límite de un ancestro. Hay que arrastrar el rango permitido.

---

### Equilibrio

268) 🔴 ¿Qué pasa si se insertan valores ya ordenados en un árbol binario de búsqueda que no se balancea?

- [ ] La altura queda logarítmica
- [x] Se forma una cadena y buscar puede requerir n comparaciones
- [ ] El árbol se balancea al insertar

> **Explicación:** Si los valores llegan ordenados, cada uno va siempre al mismo lado. El árbol degenera en una lista y buscar puede recorrer los n nodos.

---

## Programación Asincrónica

### Resultado async

269) 🔴 ¿Qué devuelve siempre una función declarada async, incluso si retorna un valor simple?

- [x] Una promesa
- [ ] Un valor síncrono sin envoltorio
- [ ] Un iterador

> **Explicación:** Una función `async` siempre devuelve una promesa. `return 5` hace que la promesa se resuelva con 5.

---

### Suspensión

270) 🔴 Una función `async` ejecuta `await` sobre una promesa que todavía no se resolvió. ¿Qué se detiene?

- [ ] Todo el hilo de JavaScript
- [ ] La función que llamó a la función async
- [x] El resto de esa función async

> **Explicación:** `await` suspende solo la función `async` donde está. El resto del programa sigue: el hilo queda libre para otros eventos, y la función continúa cuando la promesa se resuelve.

---

### Doble espera

271) 🔴 ¿Por qué se usa `await` dos veces en `const respuesta = await fetch(url); const datos = await respuesta.json();`?

- [ ] El segundo vuelve a pedir el recurso
- [x] Cada operación devuelve su propia promesa
- [ ] json() 🔴 necesita await por ser un método

> **Explicación:** `fetch` devuelve una promesa que se resuelve al llegar las cabeceras. `json()` devuelve otra promesa, que se resuelve al terminar de leer y convertir el cuerpo. Cada una necesita su `await`.

---

### Estado 404

272) 🔴 ¿Qué hay que hacer para que una respuesta 404 de `fetch` se trate como un error?

- [x] Revisar respuesta.ok o el status y lanzar un error
- [ ] Esperar que fetch rechace la promesa
- [ ] Envolver el fetch en try/catch

> **Explicación:** `fetch` no rechaza ante un 404: la promesa se resuelve. Hay que revisar `respuesta.ok` o `status` y lanzar un error explícito. Un `try/catch` solo no alcanza.

---

### Limpieza

273) 🟢 Un botón se deshabilita mientras dura una consulta. ¿En qué bloque conviene volver a habilitarlo, tanto si la consulta sale bien como si falla?

- [ ] catch solamente
- [ ] El primer await
- [x] finally

> **Explicación:** `finally` se ejecuta tanto si la consulta sale bien como si falla. Es el lugar para restablecer el botón o quitar el indicador de carga.

---

### Pedidos independientes

274) 🔴 ¿Cómo se ejecutan al mismo tiempo varias tareas asincrónicas independientes, esperando a que terminen todas?

- [ ] await en cada una, una tras otra
- [ ] Un forEach async sin esperar
- [x] Promise.all sobre sus promesas

> **Explicación:** `Promise.all` recibe promesas ya iniciadas y espera a que terminen todas, así corren al mismo tiempo. Varios `await` seguidos las ejecutan una tras otra.

---

### Bucle asincrónico

275) 🔴 ¿Por qué `array.forEach(async x => { await ... })` no espera a que terminen las operaciones?

- [x] forEach ignora las promesas que recibe
- [ ] forEach no acepta funciones async
- [ ] await dentro de forEach bloquea todo el bucle

> **Explicación:** `forEach` llama a cada callback y descarta lo que devuelve, incluidas las promesas. No espera ninguna. Para esperar, se usa `for...of` con `await` o `Promise.all` con `map`.

---

### Resultados individuales

276) 🔴 Dos tareas independientes pueden fallar y se necesita conocer el resultado de cada una. ¿Qué conviene usar?

- [ ] `Promise.all` y revisar cada posición
- [x] `Promise.allSettled` y revisar cada estado
- [ ] `Promise.race` y esperar la primera

> **Explicación:** `Promise.all` se rechaza con el primer error y se pierden los demás resultados. `Promise.allSettled` espera a todas y dice el estado de cada una.

---

### Fallo en Promise.all

277) 🔴 ¿Qué ocurre si una de las promesas entregadas a `Promise.all` se rechaza?

- [ ] La promesa conjunta resuelve con undefined en esa posición
- [x] La promesa conjunta se rechaza
- [ ] Las demás promesas se cancelan de inmediato

> **Explicación:** `Promise.all` se rechaza apenas una promesa se rechaza, con ese error. Las demás siguen corriendo, pero sus resultados se descartan.

---

### Dependencia entre tareas

278) 🔴 Si `pedirB(a)` necesita el resultado de `pedirA()`, ¿cómo deben esperarse esas operaciones?

- [ ] Iniciar ambas dentro de Promise.all sin pasar el resultado
- [ ] Usar forEach para que B lea el futuro valor de A
- [x] Primero esperar A y luego iniciar B con ese resultado

> **Explicación:** Si B necesita el resultado de A, son dependientes: primero hay que esperar A y después iniciar B con ese dato. `Promise.all` es para operaciones independientes.

---

### Tiempo de pedidos independientes

279) 🔴 Tres pedidos independientes tardan un segundo cada uno. ¿Cuánto tardan aproximadamente en serie y juntos con `Promise.all`?

- [x] Tres segundos en serie y uno juntos
- [ ] Un segundo en serie y tres juntos
- [ ] Tres segundos en ambos casos

> **Explicación:** En serie, cada pedido espera al anterior: 1 + 1 + 1 = 3 segundos. Con `Promise.all` corren juntos y el total es el del más lento, alrededor de 1 segundo.

---

### Excepción de una promesa

280) 🔴 Dentro de un `try`, se hace `await` de una promesa que se rechaza. ¿Qué ocurre?

- [ ] await la convierte en undefined
- [x] El catch la recibe como excepción
- [ ] El error escapa del try por ser asincrónico

> **Explicación:** `await` convierte el rechazo de una promesa en una excepción en esa línea. Si está dentro de un `try`, la captura el `catch`.

---

### Ubicación de await

281) 🔴 Se escribe `await` dentro de una función común y da error. ¿Qué falta?

- [x] Declararla `async`
- [ ] Marcarla como `function*`
- [ ] Agregar `Promise.all` fuera de la función

> **Explicación:** `await` solo se puede usar dentro de una función declarada `async` (o en el nivel superior de un módulo). En una función común es SyntaxError.

---

## Gestión de archivos con Node.js

### Capas de archivo

282) 🟢 ¿Qué secuencia describe las capas que hay entre un archivo guardado y los datos que usa un programa?

- [ ] Extensión, clase CSS y DOM
- [ ] Nombre, variable global y objeto JSON
- [x] Ruta, bytes, codificación, texto y formato

> **Explicación:** Un archivo tiene una ruta. Su contenido son bytes. Una codificación (como UTF-8) 🟢 convierte esos bytes en texto, y ese texto sigue un formato (JSON, CSV). Cada paso puede fallar por separado.

---

### Extensión

283) 🟢 ¿Qué garantiza que un archivo se llame `datos.json`?

- [ ] Que su contenido es JSON válido
- [ ] Que readFile lo devuelve ya parseado como objeto
- [x] Nada: la extensión es solo una pista

> **Explicación:** La extensión es parte del nombre y solo sugiere el formato. El contenido puede estar mal formado, así que `JSON.parse` puede fallar igual.

---

### Entorno de disco

284) 🟢 ¿Qué entorno aporta módulos como `node:fs/promises` para acceder a archivos?

- [x] Node.js
- [ ] El núcleo ECMAScript sin entorno
- [ ] CSS

> **Explicación:** ECMAScript define el lenguaje, pero no el acceso a archivos. Node.js aporta ese acceso con módulos como `node:fs/promises`.

---

### Lectura sin bloqueo

285) 🔴 ¿Qué módulo de Node para archivos se usa directamente con `async` y `await`?

- [ ] readFileSync
- [x] node:fs/promises
- [ ] Un atributo HTML

> **Explicación:** `node:fs/promises` ofrece funciones que devuelven promesas y se usan directamente con `await`. `readFileSync` bloquea y no devuelve promesas.

---

### Sincronía

286) 🟢 ¿Qué problema causa usar `readFileSync` en un servidor que atiende muchas solicitudes?

- [ ] Devuelve una promesa que nadie espera
- [ ] Lee el archivo con otra codificación
- [x] Bloquea el hilo y demora a todas las demás solicitudes

> **Explicación:** Node atiende todas las solicitudes con un solo hilo. `readFileSync` lo bloquea mientras lee, y ninguna otra solicitud avanza hasta que termina.

---

### Módulo ejecutable

287) 🟢 ¿Qué extensión de archivo hace que Node lo trate como módulo ES sin configurar nada en `package.json`?

- [x] .mjs
- [ ] .css
- [ ] .json

> **Explicación:** Node trata los archivos `.mjs` como módulos ES sin necesidad de configurar `"type": "module"` en `package.json`.

---

### Ruta relativa

288) 🟢 `readFile("datos/entrada.txt")` usa una ruta relativa. ¿Desde qué carpeta la resuelve Node?

- [ ] El directorio del módulo
- [x] process.cwd()
- [ ] La carpeta raíz del sistema

> **Explicación:** Una ruta relativa se resuelve desde el directorio de trabajo del proceso, `process.cwd()`, es decir, desde donde se ejecutó el comando, no desde la carpeta del archivo `.js`.

---

### Recurso junto al módulo

289) 🟢 En un módulo ES, ¿qué dato permite armar una ruta relativa a la carpeta del propio archivo?

- [x] import.meta.url
- [ ] process.pid
- [ ] Buffer.byteLength

> **Explicación:** `import.meta.url` da la URL del módulo actual. Con `new URL("datos.txt", import.meta.url)` se arma una ruta relativa al propio archivo.

---

### Unir segmentos

290) 🟢 ¿Qué función une partes de una ruta sin tener que escribir las barras a mano?

- [ ] String.split
- [ ] JSON.parse
- [x] path.join

> **Explicación:** `path.join` une partes de una ruta con el separador correcto del sistema operativo y normaliza barras repetidas.

---

### Crear padres

291) 🟢 ¿Qué logra `mkdir("salidas", { recursive: true })`?

- [ ] Sobrescribir cualquier archivo llamado salidas
- [x] Crear también directorios padres faltantes
- [ ] Vaciar salidas si ya existe

> **Explicación:** Con `recursive: true`, `mkdir` crea también los directorios padre que falten y no falla si el directorio ya existe.

---

### Sobrescritura

292) 🟢 ¿Qué hace writeFile por defecto si el archivo destino ya existe?

- [x] Lo reemplaza
- [ ] Falla con EEXIST
- [ ] Agrega al final

> **Explicación:** Por defecto, `writeFile` usa el flag `"w"`: crea el archivo si no existe y lo reemplaza entero si existe.

---

### Creación exclusiva

293) 🟢 ¿Qué flag de `writeFile` hace que falle si el archivo ya existe, en lugar de reemplazarlo?

- [ ] w
- [x] wx
- [ ] a+

> **Explicación:** El flag `"wx"` escribe solo si el archivo no existe. Si existe, falla con EEXIST. `"w"` sobrescribe y `"a+"` agrega al final.

---

### Agregar texto

294) 🟢 ¿Qué operación añade texto al final sin borrar el contenido previo?

- [ ] writeFile con flag w
- [ ] unlink
- [x] appendFile

> **Explicación:** `appendFile` agrega el texto al final del archivo y conserva lo que ya tenía. Si no existe, lo crea.

---

### Lectura de bytes

295) 🟢 ¿Qué devuelve readFile cuando no se indica codificación?

- [ ] Un string en UTF-8
- [ ] Un objeto JSON parseado
- [x] Un Buffer de bytes

> **Explicación:** Sin codificación, `readFile` devuelve un Buffer con los bytes crudos. Para obtener texto hay que indicar la codificación, por ejemplo `"utf8"`.

---

### Unidades Unicode

296) 🟢 ¿Cuántos bytes ocupa el emoji 😀 en UTF-8, según `Buffer.byteLength`?

- [ ] 2 bytes
- [x] 4 bytes
- [ ] 1 byte

> **Explicación:** En UTF-8, los emoji fuera del plano básico ocupan 4 bytes. En UTF-16 ocupan 2 unidades, por eso `"😀".length` es 2.

---

### Decodificación estricta

297) 🟢 Un `TextDecoder` creado con `{ fatal: true }` recibe bytes que no son UTF-8 válido. ¿Qué hace?

- [x] Lanza un error en lugar de insertar un reemplazo
- [ ] Inserta el carácter de reemplazo
- [ ] Omite los bytes inválidos

> **Explicación:** Por defecto, `TextDecoder` reemplaza los bytes inválidos por el carácter de reemplazo (U+FFFD). Con `fatal: true` lanza un error y el problema no pasa desapercibido.

---

### Fines de línea

298) 🟢 Al leer texto creado en distintos sistemas, ¿qué dos convenciones de fin de línea conviene contemplar?

- [x] LF y CRLF
- [ ] CR y TAB
- [ ] LF y NUL

> **Explicación:** Linux y macOS usan LF (`\n`) 🟢 al final de cada línea, y Windows usa CRLF (`\r\n`). Al separar líneas conviene contemplar ambos, por ejemplo con `/\r?\n/`.

---

### Reemplazo más seguro

299) 🟢 Al reemplazar un archivo importante, ¿qué técnica evita que quede a medio escribir si el programa se corta?

- [ ] Borrar el destino y escribirlo de nuevo
- [ ] Escribir con el flag a sobre el destino
- [x] Escribir un archivo temporal y después renombrarlo

> **Explicación:** Si el proceso se corta mientras escribe el destino, queda un archivo a medias. Escribir en un temporal y renombrarlo reemplaza el archivo de una sola vez, porque `rename` es atómico en el mismo sistema de archivos.

---

### Listar con tipos

300) 🔴 ¿Qué información agrega `readdir` cuando se usa con `{ withFileTypes: true }`?

- [ ] El contenido de cada archivo listado
- [x] Si cada entrada es archivo o carpeta
- [ ] El tamaño y la fecha de cada entrada

> **Explicación:** Con `withFileTypes: true`, `readdir` devuelve objetos Dirent con métodos como `isFile()` e `isDirectory()`, sin necesidad de llamar a `stat` por cada entrada.

---

### Enlaces simbólicos

301) 🔴 ¿Qué diferencia hay entre `stat` y `lstat` cuando la ruta es un enlace simbólico?

- [x] stat sigue el enlace; lstat no
- [ ] lstat sigue el enlace; stat no
- [ ] lstat es la versión síncrona de stat

> **Explicación:** `stat` sigue un enlace simbólico e informa sobre el archivo al que apunta. `lstat` informa sobre el enlace mismo, por ejemplo para saber si es un enlace.

---

### Existencia y carrera

302) 🟢 Un programa quiere leer un archivo solo si existe. ¿Qué forma evita el problema de que el archivo cambie entre la comprobación y la lectura?

- [ ] Llamar access y asumir que nada cambiará
- [ ] Comparar solo la extensión
- [x] Intentar readFile y manejar ENOENT

> **Explicación:** Entre comprobar que existe y leerlo, el archivo puede borrarse o cambiar. Es más seguro intentar la lectura y tratar el error ENOENT si no existe.

---

### Archivo grande

303) 🟢 ¿Cómo se procesa línea por línea un archivo de texto muy grande sin cargarlo entero en memoria?

- [ ] readFile y después split por saltos
- [x] createReadStream combinado con readline
- [ ] readFileSync con encoding utf8

> **Explicación:** `createReadStream` lee el archivo por partes sin cargarlo entero en memoria, y `readline` arma líneas completas a partir de esas partes.

---

### Chunks

304) 🔴 Al leer un archivo con un stream, ¿por qué no conviene tratar cada fragmento (chunk) 🟢 como una línea?

- [ ] Los chunks llegan desordenados
- [x] Un chunk puede cortar una línea
- [ ] Un chunk trae solo un carácter

> **Explicación:** Un stream entrega bloques (chunks) 🟢 de tamaño arbitrario. Un bloque puede terminar en medio de una línea o contener varias. Hay que juntar el texto y separar por saltos de línea.

---

### Copia en flujo

305) 🔴 ¿Qué resuelve `pipeline` al conectar un stream de lectura con uno de escritura?

- [x] Manejo de errores, cierre y contrapresión
- [ ] Lectura y escritura en hilos separados del sistema
- [ ] Carga completa previa para evitar cortes

> **Explicación:** `pipeline` conecta streams, propaga los errores de cualquiera de ellos, cierra todos al terminar o fallar y maneja la contrapresión: frena la lectura si la escritura va más lenta.

---

### Manejador

306) 🟢 Un programa abre un archivo con `open` y obtiene un FileHandle. ¿Dónde conviene cerrarlo para que se cierre aunque falle la lectura?

- [ ] Solo después de un éxito
- [ ] Node lo cierra solo al terminar
- [x] En finally

> **Explicación:** `finally` se ejecuta tanto si la lectura sale bien como si falla. Cerrar el FileHandle ahí evita dejar descriptores abiertos.

---

### JSON válido

307) 🟢 Después de `JSON.parse`, ¿qué falta hacer antes de usar los datos en la aplicación?

- [x] Validar estructura, tipos y rangos
- [ ] Nada, si JSON.parse no lanzó
- [ ] Volver a serializar con stringify

> **Explicación:** `JSON.parse` solo garantiza que el texto es JSON válido. Hay que validar que tenga los campos esperados, con los tipos y rangos correctos, antes de usarlo.

---

### CSV complejo

308) 🟢 ¿Por qué `linea.split(",")` no basta para cualquier CSV?

- [ ] split no acepta una coma como separador
- [ ] split pierde el último campo de la línea
- [x] Puede haber comas dentro de un campo entre comillas

> **Explicación:** En CSV, un campo entre comillas puede contener comas, por ejemplo `"Pérez, Ana"`. `split(",")` lo parte mal. Hace falta un parser que respete las comillas.

---

### Error de permisos

309) 🔴 Al leer un archivo, ¿qué códigos de error distinguen la falta de permisos de una ruta inexistente?

- [ ] ENOENT o EEXIST, frente a EACCES
- [x] EACCES o EPERM, frente a ENOENT
- [ ] EMFILE o EXDEV, frente a ENOTDIR

> **Explicación:** EACCES y EPERM indican falta de permisos. ENOENT indica que la ruta no existe. Distinguirlos permite mostrar el mensaje correcto.

---

### Movimiento entre volúmenes

310) 🔴 Si `rename` falla con `EXDEV` al mover un archivo, ¿qué procedimiento permite completar el movimiento?

- [x] Copiar, verificar la copia y borrar el origen
- [ ] Borrar el origen primero y después copiar el archivo
- [ ] Reintentar rename hasta que funcione

> **Explicación:** EXDEV significa que origen y destino están en distintos volúmenes, y `rename` no puede moverlo. Hay que copiar, verificar la copia y recién después borrar el original, para no perder el archivo si algo falla.

---

### Límite de archivos abiertos

311) 🔴 Si procesar miles de rutas con `Promise.all` causa `EMFILE`, ¿qué enfoque equilibra recursos y rendimiento?

- [ ] Leer todas las rutas en serie, de a una
- [x] Limitar cuántas operaciones corren al mismo tiempo con un pool
- [ ] Convertir todas las rutas a URLs antes de leer

> **Explicación:** Abrir miles de archivos a la vez agota el límite del sistema (EMFILE). Un pool limita cuántas operaciones corren al mismo tiempo: mantiene el paralelismo sin superar ese límite.

---

### Borrado recursivo

312) 🟢 Antes de usar `rm` con `recursive: true`, ¿qué debe comprobarse sobre la ruta?

- [ ] Que tenga una extensión conocida
- [ ] Que sea relativa, así no necesita validarse
- [x] Que esté dentro de una raíz permitida

> **Explicación:** `rm` recursivo borra todo lo que hay debajo de la ruta. Antes hay que resolverla a una ruta absoluta y comprobar que esté dentro de una carpeta permitida, para no borrar algo que no correspondía.

---

## Desarrollo web: del documento a una aplicación del clima

### Internet y Web

313) 🟢 ¿Cuál es la relación entre Internet y la Web?

- [x] La Web funciona sobre Internet
- [ ] Son dos nombres de la misma red
- [ ] Internet funciona sobre la Web

> **Explicación:** Internet es la red que conecta las computadoras. La Web es un servicio más sobre esa red, basado en HTTP y documentos enlazados, como también lo son el correo o los juegos en línea.

---

### Partes de URL

314) 🟢 En `https://ejemplo.com/apuntes/html.html`, ¿qué representa `/apuntes/html.html`?

- [ ] El dominio
- [x] La ruta
- [ ] La consulta

> **Explicación:** En una URL, después del esquema (`https`) 🟢 y el host (`ejemplo.com`) 🟢 viene la ruta, que identifica el recurso dentro del servidor.

---

### Significado HTML

315) 🟢 ¿Qué agrega escribir `<h1>El tiempo</h1>` en lugar de poner el texto sin etiqueta?

- [ ] Solo lo muestra más grande
- [ ] Lo convierte en un enlace
- [x] Le da significado de título

> **Explicación:** HTML describe el significado del contenido. `<h1>` declara que el texto es el título principal. Los navegadores, los lectores de pantalla y los buscadores lo interpretan así.

---

### Jerarquía de encabezados

316) 🟢 ¿Con qué criterio se elige entre `h1` y `h2` para un título?

- [ ] Por el tamaño de letra que se quiere
- [ ] Por la importancia visual del texto
- [x] Por su nivel dentro de la estructura del documento

> **Explicación:** Los niveles de encabezado arman el índice del documento: `h1` es el título principal, `h2` una sección, `h3` una subsección. El tamaño visual se controla con CSS.

---

### Clase e identificador

317) 🟢 ¿Qué diferencia práctica hay entre class e id en HTML?

- [ ] El id se reutiliza; la clase es única
- [x] La clase se reutiliza; el id es único
- [ ] Solo el id puede usarse desde CSS

> **Explicación:** Una clase puede repetirse en muchos elementos, así que sirve para aplicar estilos comunes. Un `id` debe ser único en la página e identifica un solo elemento.

---

### Árbol de elementos

318) 🟢 Si strong está dentro de p y p dentro de section, ¿qué relación tiene strong con section?

- [x] Es descendiente de section
- [ ] Es hijo directo de section
- [ ] Es padre de section

> **Explicación:** `strong` está dentro de `p`, que está dentro de `section`. Es un descendiente de `section`, pero no su hijo directo: el hijo directo es `p`.

---

### Elemento vacío

319) 🟢 ¿Cuál de estos elementos no necesita etiqueta de cierre en HTML?

- [ ] p
- [ ] section
- [x] input

> **Explicación:** `input` es un elemento vacío: no tiene contenido y no lleva etiqueta de cierre. `p` y `section` sí la necesitan.

---

### Atributo booleano

320) 🟢 ¿Qué sucede con `<button disabled="false">` en HTML?

- [ ] Queda habilitado
- [x] Queda deshabilitado
- [ ] Depende del navegador

> **Explicación:** Los atributos booleanos de HTML funcionan por presencia. Si `disabled` está escrito, el botón queda deshabilitado, sin importar su valor, incluso `"false"`.

---

### Modo de estándares

321) 🔴 ¿Para qué sirve `<!doctype html>` al inicio del documento?

- [x] Activa el modo de estándares en el navegador
- [ ] Declara el idioma del documento
- [ ] Carga la hoja de estilos base

> **Explicación:** Sin `<!doctype html>`, el navegador entra en el modo quirks, que imita errores de navegadores antiguos. Con el doctype usa el modo de estándares.

---

### Contenido principal

322) 🟢 ¿Qué elemento semántico identifica el contenido principal de una página?

- [ ] span
- [ ] link
- [x] main

> **Explicación:** `main` marca el contenido principal de la página. Sirve, por ejemplo, para que un lector de pantalla salte directo a él.

---

### Texto alternativo

323) 🟢 ¿Qué debe describir el atributo `alt` de una imagen que aporta información?

- [ ] El título que aparece al pasar el mouse
- [x] Lo que la imagen aporta si no se ve
- [ ] El nombre del archivo de la imagen

> **Explicación:** `alt` reemplaza a la imagen cuando no se puede ver: la lee un lector de pantalla o aparece si la imagen no carga. Debe transmitir lo que la imagen aporta.

---

### Datos tabulares

324) 🟢 ¿Cuándo corresponde usar una tabla (`table`) 🟢 en HTML?

- [x] Cuando los datos son filas y columnas
- [ ] Para ubicar el menú junto al contenido
- [ ] Para alinear campos de un formulario

> **Explicación:** `table` es para datos tabulares, donde fila y columna dan sentido a cada celda. Para ubicar elementos en la página se usa CSS (flexbox o grid).

---

### Etiqueta de campo

325) 🟢 ¿Qué debe coincidir para que `<label for="ciudad">` señale un input?

- [x] El valor for y el id del input
- [ ] El valor for y su class
- [ ] El texto de label y el placeholder

> **Explicación:** El `for` de `label` tiene que coincidir con el `id` del `input`. Así, al hacer clic en la etiqueta se enfoca el campo, y los lectores de pantalla los asocian.

---

### Dato de formulario

326) 🟢 ¿Qué atributo identifica un campo en el envío nativo de un formulario?

- [ ] id
- [x] name
- [ ] class

> **Explicación:** Al enviar un formulario, cada campo viaja como un par `name=valor`. Un campo sin `name` no se envía.

---

### Envío nativo

327) 🟢 ¿Qué ventaja tiene un botón `submit` real frente a un `div` programado para funcionar como botón?

- [ ] Validación del servidor sin programarla
- [ ] Conversión automática a JSON
- [x] Envío con Enter y acceso por teclado

> **Explicación:** Un botón `submit` real envía el formulario con Enter, se puede usar con teclado y lo reconocen los lectores de pantalla. Un `div` con un evento de clic no hace nada de eso por sí solo.

---

### Validación del navegador

328) 🟢 ¿Qué limitación tiene el atributo `required` en un campo de texto?

- [x] No valida que el texto tenga sentido
- [ ] Rechaza cadenas de solo espacios
- [ ] Valida también en el servidor

> **Explicación:** `required` solo exige que el campo no esté vacío: acepta, por ejemplo, un texto de solo espacios. Además, se puede saltear desde el navegador, así que el servidor tiene que validar igual.

---

### Hoja externa

329) 🟢 ¿Qué elemento HTML enlaza una hoja CSS externa desde head?

- [ ] `<script src="styles.css" type="text/css">`
- [x] `<link rel="stylesheet" href="styles.css">`
- [ ] `<style src="styles.css">`

> **Explicación:** Una hoja externa se enlaza con `<link rel="stylesheet" href="...">` dentro de `head`. `<script>` carga JavaScript, y `<style>` contiene CSS escrito en la propia página.

---

### Selector de clase

330) 🟢 ¿Qué selecciona `.tarjeta` en CSS?

- [ ] El elemento con id tarjeta
- [ ] Los elementos <tarjeta> del documento
- [x] Elementos con la clase tarjeta

> **Explicación:** El punto indica clase: `.tarjeta` selecciona los elementos que tienen `tarjeta` entre sus clases. `#tarjeta` seleccionaría por `id`.

---

### Selector compuesto

331) 🟢 ¿Qué selecciona `.tarjeta.destacado`?

- [ ] Un descendiente destacado de tarjeta
- [ ] Elementos con cualquiera de las dos clases
- [x] Un mismo elemento que tiene ambas clases

> **Explicación:** Dos clases seguidas, sin espacio, exigen que un mismo elemento tenga ambas. Con un espacio en el medio, el selector buscaría un descendiente.

---

### Selector descendiente

332) 🟢 ¿Qué selecciona `.tarjeta p`?

- [ ] Solo párrafos que también tienen clase tarjeta
- [x] Párrafos descendientes de un elemento tarjeta
- [ ] Todas las tarjetas que contienen cualquier texto

> **Explicación:** El espacio es el combinador descendiente: `.tarjeta p` selecciona los párrafos que están en cualquier nivel dentro de un elemento con clase `tarjeta`.

---

### Especificidad

333) 🟢 Tres reglas CSS asignan un color distinto al mismo párrafo, con los selectores `#estado`, `.aviso` y `p`. ¿Cuál tiene mayor especificidad?

- [x] `#estado`
- [ ] `.aviso`
- [ ] `p`

> **Explicación:** La especificidad se compara por categorías: los `id` pesan más que las clases, y las clases más que los elementos. `#estado` gana.

---

### Empate de reglas

334) 🟢 Dos reglas CSS asignan la misma propiedad al mismo elemento, con igual especificidad. ¿Cuál se aplica?

- [x] La que aparece después
- [ ] La que tiene el selector más corto
- [ ] La que aparece primero

> **Explicación:** Si dos reglas tienen la misma especificidad, gana la que aparece después en el orden de la cascada.

---

### Herencia

335) 🟢 Si se define en `body`, ¿qué propiedad heredan los párrafos que no tienen un valor propio?

- [ ] margin
- [ ] border-radius
- [x] font-family

> **Explicación:** Las propiedades de texto, como `font-family`, `color` o `line-height`, se heredan. Las de caja, como `margin`, `border` o `border-radius`, no.

---

### Unidad rem

336) 🟢 ¿Respecto de qué se calcula `1.5rem`?

- [ ] Del ancho del viewport
- [x] Del tamaño de fuente del elemento raíz
- [ ] Del tamaño de fuente del elemento padre

> **Explicación:** `rem` es relativo al tamaño de fuente del elemento raíz (`html`). `em` es relativo a la fuente del propio elemento, que suele venir del padre.

---

### Modelo content-box

337) 🔴 Con width 300px, padding 20px por lado y border 2px por lado en content-box, ¿cuál es el ancho hasta el borde?

- [ ] 300px
- [x] 344px
- [ ] 324px

> **Explicación:** En `content-box`, `width` es solo el contenido. Se suman padding y bordes de ambos lados: 300 + 20 + 20 + 2 + 2 = 344px.

---

### Modelo border-box

338) 🔴 Con box-sizing border-box y width 300px, ¿qué incluye ese ancho?

- [ ] Contenido más márgenes exteriores
- [ ] Solo contenido
- [x] Contenido, padding y bordes

> **Explicación:** En `border-box`, `width` incluye contenido, padding y borde. Si el padding crece, el contenido se achica, pero el ancho total sigue siendo 300px.

---

### Ocultamiento

339) 🔴 ¿Qué diferencia hay entre display none y visibility hidden?

- [x] hidden conserva el espacio; none no
- [ ] none conserva el espacio; hidden no
- [ ] Ninguno conserva el espacio ocupado

> **Explicación:** `display: none` quita el elemento del diseño: no genera caja ni ocupa espacio. `visibility: hidden` lo vuelve invisible, pero conserva su espacio.

---

### Foco visible

340) 🟢 ¿Por qué conviene que el estilo `:focus-visible` se vea con claridad?

- [x] Muestra qué control tiene el foco
- [ ] Resalta el control bajo el mouse
- [ ] Indica qué campos son obligatorios

> **Explicación:** `:focus-visible` marca el control que tiene el foco cuando se navega con teclado. Quitarlo deja a esas personas sin saber dónde están.

---

### Propiedad personalizada

341) 🟢 ¿Qué consigue `var(--acento)` en una regla CSS?

- [ ] Lee una variable de JavaScript global
- [x] Usa el valor de la propiedad --acento
- [ ] Define la propiedad --acento

> **Explicación:** `var(--acento)` lee el valor de la propiedad personalizada `--acento`, definida en el elemento o heredada. Cambiarla en un solo lugar cambia todos sus usos.

---

### Eje flexible

342) 🟢 En una fila flex con dirección row, ¿qué propiedad distribuye el espacio sobrante en el eje principal?

- [ ] align-items
- [ ] flex-direction
- [x] justify-content

> **Explicación:** En flexbox, `justify-content` distribuye el espacio sobrante en el eje principal (horizontal con `row`). `align-items` alinea en el eje cruzado.

---

### Columnas de Grid

343) 🟢 ¿Qué expresa `grid-template-columns: repeat(3, 1fr)`?

- [ ] Tres filas de igual altura
- [ ] Tres columnas de 1px cada una
- [x] Tres columnas que reparten el espacio en partes iguales

> **Explicación:** `repeat(3, 1fr)` crea tres columnas, y `1fr` es una fracción del espacio disponible. Las tres reciben partes iguales.

---

### Diseño mobile first

344) 🔴 Un diseño muestra los elementos apilados, pensado primero para móvil. ¿Qué hace una media query con `min-width: 40rem`?

- [x] Aplica desde ese ancho en adelante
- [ ] Aplica por debajo de ese ancho
- [ ] Fija el ancho de la página en 40rem

> **Explicación:** `min-width: 40rem` aplica sus reglas cuando la pantalla mide al menos 40rem. El diseño base, pensado para móvil, se amplía en pantallas grandes.

---

### Entorno del navegador

345) 🟢 ¿Quién aporta el objeto `document` a JavaScript en una página?

- [ ] La sintaxis básica ECMAScript
- [x] El navegador
- [ ] La hoja CSS

> **Explicación:** `document` no es parte del lenguaje JavaScript. Lo aporta el navegador, como parte de las APIs del DOM, igual que `window`.

---

### Carga diferida

346) 🟢 ¿Qué efecto tiene el atributo `defer` en `<script src="app.js" defer>`, ubicado en el `head`?

- [ ] Lo ejecuta apenas termina de descargarse
- [ ] Lo descarga después de analizar el HTML
- [x] Lo ejecuta cuando el navegador terminó de analizar el HTML

> **Explicación:** `defer` descarga el script en paralelo, sin frenar el análisis, y lo ejecuta cuando el HTML terminó de analizarse, respetando el orden de los scripts. `async` lo ejecuta apenas termina de descargarse.

---

### DOM

347) 🟢 ¿Por qué lo que muestra el panel Elementos de las herramientas del navegador puede diferir del archivo HTML original?

- [ ] Elementos muestra una versión minificada
- [x] El DOM se corrige y JavaScript lo cambia
- [ ] CSS reescribe el HTML al aplicar estilos

> **Explicación:** El panel Elementos muestra el DOM vivo. El navegador corrige el HTML mal formado al construirlo (por ejemplo, agrega `tbody`), y JavaScript puede cambiarlo después.

---

### Selección DOM

348) 🟢 ¿Qué devuelve `document.querySelector("#estado")` si no encuentra el elemento?

- [x] null
- [ ] Un elemento vacío
- [ ] undefined

> **Explicación:** `querySelector` devuelve el primer elemento que coincide o `null` si no hay ninguno. Conviene comprobarlo antes de usar el resultado.

---

### Texto externo

349) 🟢 ¿Qué propiedad conviene usar para mostrar en la página un nombre que llegó de una API?

- [ ] innerHTML sin validación
- [x] textContent
- [ ] outerHTML con la respuesta completa

> **Explicación:** `textContent` inserta el dato como texto literal. `innerHTML` lo interpretaría como HTML, y un dato externo con etiquetas podría inyectar código (XSS).

---

### Escucha de evento

350) 🟢 ¿Por qué se escribe `boton.addEventListener("click", manejar)` y no `boton.addEventListener("click", manejar())`?

- [ ] Debe devolver un elemento al registrarse
- [ ] El navegador no acepta callbacks
- [x] Debe ejecutarse cuando ocurra el evento

> **Explicación:** `addEventListener` recibe una función para llamarla cuando ocurra el evento. Escribir `manejador()` la ejecutaría en ese momento y registraría su resultado.

---

### Acción predeterminada

351) 🟢 ¿Qué hace `evento.preventDefault()` en un submit cancelable?

- [x] Cancela el comportamiento nativo de envío
- [ ] Detiene la propagación del evento
- [ ] Vacía los campos del formulario

> **Explicación:** `preventDefault` cancela la acción por defecto del navegador, como enviar el formulario o seguir un enlace. No detiene la propagación: eso es `stopPropagation`.

---

### Origen y listener

352) 🔴 ¿Qué distingue `evento.target` de `evento.currentTarget`?

- [x] target es el origen; currentTarget, el del listener
- [ ] target es el del listener; currentTarget, el origen
- [ ] Son el mismo elemento en todos los casos

> **Explicación:** `target` es el elemento donde se originó el evento, como el botón pulsado. `currentTarget` es el elemento que tiene el listener que se está ejecutando, que puede ser un ancestro.

---

### Geocodificación

353) 🟢 Una app del clima busca ciudades por nombre y muestra una lista de coincidencias para que la persona elija una. ¿Por qué no usa directamente la primera?

- [ ] Porque la API exige elegir una por país
- [x] Para consultar las coordenadas de la ciudad que se quiso buscar
- [ ] Para mostrar el clima de todas a la vez

> **Explicación:** Una ciudad puede compartir el nombre con muchas otras. La app muestra las coincidencias con su región y país para que la persona elija, en lugar de decidir en silencio por ella; cada ubicación tiene sus propias coordenadas.

---

### Parámetros de consulta

354) 🟢 Una app arma la URL de búsqueda con el nombre de una ciudad que tiene espacios y tildes. ¿Qué aporta usar `URLSearchParams`?

- [ ] Traduce el nombre de la ciudad al inglés
- [ ] Garantiza que la red responda
- [x] Codifica correctamente los valores de la query

> **Explicación:** Una URL no admite espacios ni tildes tal cual. `URLSearchParams` los codifica, por ejemplo el espacio como `+` o `%20`, para que el pedido llegue bien.

---

### Estado anterior

355) 🟢 En una app del clima, al empezar una búsqueda nueva se oculta el resultado anterior y se borra la lista de ciudades. ¿Para qué?

- [ ] Para liberar la memoria que usó el navegador
- [ ] Para que la API no reciba dos pedidos
- [x] Para no mostrar datos viejos como actuales

> **Explicación:** Si al empezar una búsqueda nueva siguiera visible el resultado anterior, parecería el actual. Limpiar evita mostrar datos viejos como si fueran de la ciudad nueva.

---

### Cero válido

356) 🟢 Una app valida la temperatura con `Number.isFinite(temperatura)` antes de mostrarla. ¿Qué ventaja tiene esto cuando la temperatura es 0 °C?

- [ ] Descarta 0 por ser un valor falsy
- [x] Acepta 0 como temperatura válida
- [ ] Rechaza temperaturas bajo cero

> **Explicación:** 0 °C es falsy. Una condición como `if (temperatura)` lo trataría como dato faltante. `Number.isFinite(0)` es `true`, así que acepta 0 y rechaza `NaN` o `undefined`.

---

### Instante y unidad

357) 🟢 Una API entrega tiempo Unix en segundos. ¿Qué necesita `new Date` para ese instante?

- [x] Milisegundos, por lo que se multiplica por 1000
- [ ] Segundos sin conversión
- [ ] Una cadena de zona horaria como único argumento

> **Explicación:** `new Date(numero)` espera milisegundos desde 1970, y el tiempo Unix suele venir en segundos. Hay que multiplicar por 1000.

---

### Viewport móvil

358) 🟢 ¿Qué permite `<meta name="viewport" content="width=device-width, initial-scale=1.0">` en una página adaptable?

- [ ] Que el navegador genere las media queries
- [ ] Que la página funcione sin CSS
- [x] Que el ancho de diseño acompañe al dispositivo móvil

> **Explicación:** Sin esa etiqueta, el navegador móvil simula una pantalla de escritorio y achica todo. `width=device-width` hace que el diseño use el ancho real del dispositivo.

---

### Botón sin envío

359) 🟢 Dentro de un formulario, ¿qué tipo de botón se usa para una acción que no debe enviarlo?

- [ ] `type="submit"`
- [x] `type="button"`
- [ ] `type="search"`

> **Explicación:** Dentro de un formulario, un `button` es `type="submit"` por defecto y lo envía. Para una acción que no debe enviarlo hay que indicar `type="button"`.

---

### Imagen decorativa

360) 🟢 Si una imagen es puramente decorativa, ¿qué valor de `alt` indica que no aporta contenido?

- [x] `alt=""`
- [ ] Omitir el atributo alt
- [ ] `alt="imagen decorativa"`

> **Explicación:** `alt=""` indica que la imagen es decorativa y los lectores de pantalla la saltan. Si se omite `alt`, algunos leen el nombre del archivo.

---

### Importancia CSS

361) 🟢 En la cascada de CSS, ¿qué modifica `!important`?

- [ ] El número de identificadores en el selector
- [ ] El orden físico de las reglas en el archivo
- [x] La etapa de importancia de la declaración

> **Explicación:** `!important` pasa la declaración a una etapa de mayor prioridad en la cascada, por encima de las declaraciones normales, sin importar la especificidad ni el orden.

---

### Diagnóstico de red

362) 🟢 Una app muestra `Failed to fetch`. ¿Qué panel del navegador ayuda a revisar solicitudes, estados y tiempos?

- [ ] Elementos o Elements
- [x] Red o Network
- [ ] Aplicación o Application

> **Explicación:** El panel Red (Network) 🟢 lista cada solicitud con su estado, cabeceras, cuerpo y tiempos. Ahí se ve si el pedido salió, qué respondió el servidor o si nunca llegó.

---

## Arrow.js: del contador al inventario

### Estado reactivo

363) 🟢 En Arrow.js, ¿qué hace `reactive({ nombre: "Tornillos", cantidad: 3 })`?

- [x] Hace observables sus propiedades
- [ ] Guarda el objeto en localStorage
- [ ] Convierte el objeto en HTML

> **Explicación:** `reactive` envuelve el objeto para que Arrow detecte cuándo cambian sus propiedades y actualice las partes de la interfaz que las usan.

---

### Lectura reactiva

364) 🟢 En una plantilla de Arrow.js, ¿por qué se escribe `${() 🟢 => producto.cantidad}` en lugar de `${producto.cantidad}`?

- [x] Así Arrow sabe qué actualizar al cambiar
- [ ] Así la plantilla se evalúa una sola vez
- [ ] Así cantidad se convierte en texto

> **Explicación:** Si se inserta el valor, la plantilla lo usa una vez y no se entera de los cambios. Al pasar una función, Arrow registra qué propiedades lee y vuelve a ejecutarla cuando cambian.

---

### Componente

365) 🟢 En un inventario hecho con Arrow.js, `Contador` es un componente que muestra la tarjeta de un producto. ¿Qué recibe y qué devuelve?

- [ ] Recibe una plantilla; devuelve un producto
- [x] Recibe un producto; devuelve una plantilla
- [ ] Recibe un id; devuelve HTML en texto

> **Explicación:** Un componente es una función: recibe datos (un producto) 🟢 y devuelve una plantilla que los muestra (su tarjeta).

---

### Identidad de lista

366) 🟢 En Arrow.js, ¿por qué se escribe `Contador(p).key(p.id)` al mostrar una lista de productos?

- [ ] Ordena la lista por id
- [ ] Reinicia cada contador al filtrar la lista
- [x] Identifica cada producto aunque se mueva

> **Explicación:** `key` le da a cada elemento una identidad estable. Si la lista se reordena o se filtra, Arrow reutiliza el elemento correcto en lugar de confundirlo por su posición.

---

### Binding de campo

367) 🟢 En un buscador hecho con Arrow.js, el campo tiene `.value="${() 🟢 => estado.busqueda}"` y `@input="${e => estado.busqueda = e.target.value}"`. ¿Qué hace cada uno?

- [x] .value muestra el estado; @input lo actualiza
- [ ] @input muestra el estado; .value lo actualiza
- [ ] Ambos actualizan el estado al escribir

> **Explicación:** `.value` enlaza el valor del campo con el estado, y el campo muestra lo que dice el estado. `@input` escucha lo que escribe la persona y actualiza el estado. Juntos forman un enlace en dos sentidos.

---

### Vista filtrada

368) 🟢 En un inventario hecho con Arrow.js, un producto se oculta al filtrar por búsqueda y reaparece al borrar el texto. ¿Por qué conserva su cantidad?

- [ ] Cada búsqueda recrea los productos desde cero
- [x] filter devuelve los mismos objetos del estado
- [ ] Arrow guarda la cantidad en localStorage

> **Explicación:** `filter` no copia los productos: devuelve los mismos objetos del estado. Al reaparecer, se muestra el mismo objeto, con la cantidad que tenía.

---

### Borrador local

369) 🟢 En un inventario hecho con Arrow.js, el componente `Formulario` crea su propio estado `borrador`. ¿Por qué?

- [ ] Para que el inventario cambie en cada tecla
- [ ] Porque Arrow no permite estado fuera de componentes
- [x] Para no tocar el inventario hasta confirmar

> **Explicación:** El borrador guarda lo que se escribe sin tocar el inventario hasta confirmar. Como se crea dentro del componente, cada formulario tiene el suyo.

---

### Dato numérico de input

370) 🟢 ¿Por qué se aplica `Number` a la cantidad que se lee de un campo con `e.target.value`?

- [ ] Arrow convierte todo número en bigint
- [ ] El input devuelve undefined si está vacío
- [x] El valor del campo llega como texto

> **Explicación:** El valor de un `input` siempre llega como string, aunque sea de tipo número. Sin convertirlo, una suma concatenaría texto.

---

### Eliminar por id

371) 🟢 En Arrow.js, ¿qué hace `estado.productos = estado.productos.filter(p => p.id !== id)`?

- [ ] Elimina todos los productos del mismo nombre
- [x] Reemplaza la lista por una sin ese producto
- [ ] Oculta el producto sin cambiar la lista

> **Explicación:** `filter` crea un array nuevo sin el producto con ese `id`, y la asignación reemplaza la lista del estado. Arrow detecta la asignación y actualiza la interfaz.

---

### Persistencia del inventario

372) 🟢 En un inventario de Arrow.js cuyos datos viven solo en memoria, ¿qué pasa con los productos agregados al recargar la página?

- [x] Se pierden y reaparecen los valores iniciales
- [ ] Se restauran desde una base de datos integrada en Arrow
- [ ] Se recuperan desde localStorage

> **Explicación:** El estado vive en la memoria de la página. Al recargar se pierde y la app arranca con los datos iniciales del código. Para conservarlo haría falta guardarlo, por ejemplo en localStorage.

---

### Comunicación del formulario

373) 🟢 En un inventario hecho con Arrow.js, ¿cómo entrega el componente `Formulario` los datos de un producto nuevo a la aplicación?

- [ ] Modifica directamente `estado.productos` mientras se escribe
- [ ] Envía el borrador al CDN de Arrow.js
- [x] Llama a `acciones.onAgregar(datos)` al confirmar

> **Explicación:** El formulario no toca el inventario: al confirmar, llama a la función que recibió (`acciones.onAgregar`) 🟢 con los datos. La aplicación, en `agregar`, asigna el identificador y lo incorpora a `estado.productos`.

---

### Límite inferior del contador

374) 🟢 En una tarjeta hecha con Arrow.js, el botón de restar tiene `disabled="${() 🟢 => producto.cantidad === 0}"`. ¿Qué pasa cuando la cantidad llega a cero?

- [x] Queda deshabilitado mediante una lectura reactiva de la cantidad
- [ ] Se oculta de la tarjeta
- [ ] Sigue restando hasta números negativos

> **Explicación:** El atributo `disabled` del botón depende de una función que lee la cantidad. Cuando llega a 0, Arrow reevalúa la función y deshabilita el botón. Así la cantidad no baja de cero.

---

## Cómo consumir una API REST

### Cliente HTTP

375) 🟢 ¿Cuáles de estos programas pueden actuar como cliente HTTP?

- [ ] Solo un navegador con interfaz gráfica
- [x] Un navegador, curl o fetch desde un programa
- [ ] Un servidor web, pero no curl

> **Explicación:** Un cliente HTTP es cualquier programa que envía pedidos HTTP: un navegador, curl en la terminal o `fetch` desde código.

---

### Pedidos independientes

376) 🟢 HTTP es un protocolo sin estado (stateless). ¿Qué implica eso?

- [ ] El servidor recuerda los pedidos anteriores
- [ ] No se pueden usar cookies ni cabeceras
- [x] Cada pedido debe incluir lo necesario para entenderse solo

> **Explicación:** HTTP no recuerda los pedidos anteriores. Cada pedido tiene que traer todo lo necesario para entenderse, como la autenticación en una cabecera o una cookie.

---

### Fragmento de URL

377) 🟢 En la URL `https://ejemplo.com/usuarios?id=7#perfil`, ¿qué parte no se envía al servidor?

- [x] El fragmento
- [ ] La ruta
- [ ] La cadena de consulta

> **Explicación:** El fragmento (lo que sigue a `#`) 🟢 lo usa solo el navegador, por ejemplo para ir a una sección. No se envía al servidor.

---

### Formato del cuerpo

378) 🟢 ¿Qué cabecera indica que el cuerpo del pedido está en formato JSON?

- [ ] Accept: application/json
- [x] Content-Type: application/json
- [ ] Content-Encoding: application/json

> **Explicación:** `Content-Type` describe el formato del cuerpo que se envía. `Accept` indica qué formato se quiere recibir en la respuesta.

---

### Ruta REST

379) 🟢 En una API REST de usuarios, ¿qué URL representa al usuario con id 7?

- [ ] /obtenerUsuario?id=7 como única forma REST
- [x] /users/7
- [ ] /users#7

> **Explicación:** En REST, la URL nombra el recurso y el método HTTP indica la acción. `/users/7` es el usuario con id 7, y se lee con `GET /users/7`.

---

### Método para leer

380) 🟢 ¿Qué método HTTP se usa normalmente para leer un recurso sin modificarlo?

- [ ] POST
- [ ] DELETE
- [x] GET

> **Explicación:** `GET` pide un recurso sin modificarlo. `POST` crea y `DELETE` borra.

---

### Reemplazo parcial

381) 🟢 ¿Qué diferencia hay entre los métodos `PATCH` y `PUT`?

- [x] PATCH cambia campos; PUT reemplaza todo
- [ ] PUT cambia campos; PATCH reemplaza todo
- [ ] PATCH crea recursos; PUT los modifica

> **Explicación:** `PATCH` modifica solo los campos enviados. `PUT` reemplaza el recurso completo con lo que se envía, y los campos que faltan pueden perderse.

---

### Reintento de POST

382) 🟢 Un `POST` falla por un error de red y se reintenta. ¿Por qué hay que tener cuidado?

- [ ] POST es idempotente, como PUT
- [x] Puede crear el recurso dos veces
- [ ] El servidor rechaza POST repetidos

> **Explicación:** `POST` no es idempotente: repetirlo puede crear otro recurso. Si la respuesta se perdió, el servidor pudo haber creado el recurso igual, y reintentar lo duplicaría.

---

### Creación y sin cuerpo

383) 🟢 ¿Qué significan los códigos HTTP 201 y 204?

- [x] 201 para recurso creado; 204 para éxito sin cuerpo
- [ ] 201 para éxito sin cuerpo; 204 para recurso creado
- [ ] 201 para redirección; 204 para validación fallida

> **Explicación:** 201 Created indica que se creó un recurso. 204 No Content indica éxito sin cuerpo en la respuesta.

---

### Autenticación y permiso

384) 🟢 ¿Qué diferencia hay entre los códigos HTTP 401 y 403?

- [ ] 401: no hay permiso; 403: falta autenticarse
- [ ] 401: servidor caído; 403: recurso movido
- [x] 401: falta autenticarse; 403: no hay permiso

> **Explicación:** 401 significa que falta una autenticación válida: el servidor no sabe quién sos. 403 significa que sabe quién sos pero no tenés permiso.

---

### Límite de consultas

385) 🟢 ¿Qué informa el código HTTP 429?

- [ ] Tiempo de espera agotado
- [ ] Cuerpo JSON inválido
- [x] Demasiadas solicitudes

> **Explicación:** 429 Too Many Requests indica que se superó el límite de pedidos. Hay que esperar, a veces lo que indica la cabecera `Retry-After`, antes de reintentar.

---

### Sintaxis JSON

386) 🟢 ¿Cómo deben escribirse las claves de un objeto en JSON?

- [x] Comillas dobles
- [ ] Comillas simples
- [ ] Ninguna comilla

> **Explicación:** En JSON, las claves siempre van entre comillas dobles. Las comillas simples o las claves sin comillas son válidas en JavaScript, pero no en JSON.

---

### Serialización

387) 🟢 ¿Qué operación convierte un objeto JavaScript en texto JSON para enviarlo?

- [ ] JSON.parse
- [x] JSON.stringify
- [ ] Response.json

> **Explicación:** `JSON.stringify` convierte un valor de JavaScript en texto JSON para enviarlo. `JSON.parse` hace lo inverso.

---

### API de práctica

388) 🟢 JSONPlaceholder es una API de práctica. Se crea un recurso con `POST` y después se lo pide con `GET`. ¿Qué pasa?

- [x] No lo encuentra: el POST se simula y no se guarda
- [ ] Lo encuentra con el id devuelto
- [ ] Lo encuentra hasta que se reinicia

> **Explicación:** JSONPlaceholder es una API de práctica: acepta el POST y responde como si hubiera creado el recurso, pero no guarda nada. Al pedirlo después, el servidor responde 404.

---

### REST Client

389) 🟢 En un archivo `.http` de la extensión REST Client, ¿qué separa un pedido del siguiente?

- [ ] Una etiqueta HTML
- [ ] Un archivo distinto por pedido
- [x] ###

> **Explicación:** En un archivo `.http` de REST Client, `###` separa un pedido del siguiente.

---

### Cabeceras con cURL

390) 🔴 ¿Qué opción de `curl` muestra las cabeceras de la respuesta junto con el cuerpo?

- [ ] -d
- [x] -i
- [ ] -o

> **Explicación:** `curl -i` incluye en la salida el estado y las cabeceras de la respuesta, antes del cuerpo. `-d` envía datos y `-o` guarda la salida en un archivo.

---

### Dos await en fetch

391) 🔴 ¿Qué espera cada uno de estos pasos: `await fetch(url)` y `await respuesta.json()`?

- [ ] Primero el cuerpo; luego su conversión
- [x] Primero las cabeceras; luego el cuerpo
- [ ] Primero la conexión; luego las cabeceras

> **Explicación:** `fetch` se resuelve cuando llegan el estado y las cabeceras, aunque el cuerpo todavía no llegó. `json()` espera el cuerpo completo y lo convierte.

---

### Cuerpo consumido

392) 🟢 Después de `await respuesta.json()`, ¿qué indica `respuesta.bodyUsed`?

- [x] true; el cuerpo ya se consumió
- [ ] false; puede leerse de nuevo sin límite
- [ ] undefined porque Response no tiene cuerpo

> **Explicación:** El cuerpo de una respuesta es un stream que se lee una sola vez. Después de `json()`, `bodyUsed` es `true` y otra lectura lanza un error.

---

### Error HTTP con fetch

393) 🟢 ¿Qué pasa con la promesa de `fetch` si el servidor responde 404?

- [ ] La promesa se rechaza con un error
- [ ] Se resuelve y respuesta.ok es true
- [x] Se resuelve y respuesta.ok es false

> **Explicación:** `fetch` solo rechaza por fallos de red. Un 404 es una respuesta: la promesa se resuelve y `respuesta.ok` es `false`, así que hay que comprobarlo.

---

### Estado en Ink

394) 🟢 Una app de consola hecha con Ink maneja los estados `"pidiendo"`, `"cargando"`, `"mostrando"` y `"error"`. ¿Qué indica el estado `"cargando"`?

- [ ] Que la API ya devolvió el clima
- [x] Que la consulta está en curso y aún no hay respuesta
- [ ] Que la consulta falló y se reintenta

> **Explicación:** La app modela la interfaz como estados: `"pidiendo"`, `"cargando"`, `"mostrando"` y `"error"`, y cada uno dibuja una pantalla distinta. `"cargando"` significa que el pedido está en curso y todavía no hay respuesta.

---

### Formato aceptado

395) 🟢 En un pedido HTTP, ¿qué cabecera expresa el formato de respuesta que acepta el cliente?

- [ ] Content-Length
- [ ] Location
- [x] Accept

> **Explicación:** `Accept` indica qué formatos de respuesta acepta el cliente, por ejemplo `application/json`. `Content-Length` es el tamaño del cuerpo y `Location` señala una URL.

---

### Validación de datos

396) 🟢 Un servidor recibe JSON bien formado, pero un campo no supera la validación. ¿Qué código HTTP representa ese caso?

- [x] 422
- [ ] 304
- [ ] 201

> **Explicación:** 422 Unprocessable Content indica que el cuerpo está bien formado pero no pasa las reglas de validación. Un JSON mal escrito correspondería a 400.

---

### Copia en caché

397) 🟢 ¿Qué comunica un estado HTTP `304 Not Modified`?

- [ ] Que el recurso se movió a otra URL
- [ ] Que el servidor no reconoce el método
- [x] Que la copia en caché sigue valiendo

> **Explicación:** 304 Not Modified responde a un pedido condicional: el recurso no cambió desde la copia en caché del cliente, así que puede seguir usándola sin volver a descargarla.

---

### Query codificada

398) 🔴 ¿Qué aporta `url.searchParams.set("ciudad", nombre)` al construir una URL?

- [x] Codifica el valor para la query, incluso espacios y tildes
- [ ] Convierte el nombre en coordenadas
- [ ] Agrega el valor sin codificar a la URL

> **Explicación:** `searchParams.set` agrega o reemplaza el parámetro y codifica su valor, así los espacios, tildes o símbolos no rompen la URL.

---

### Diálogo de cURL

399) 🔴 En la salida de `curl -v`, ¿qué distinguen las líneas que empiezan con `>` de las que empiezan con `<`?

- [ ] `>` es lo recibido; `<` lo enviado
- [x] `>` es lo enviado; `<` lo recibido
- [ ] `>` son errores; `<` son avisos

> **Explicación:** En `curl -v`, las líneas que empiezan con `>` son lo que curl envía (pedido y cabeceras) 🔴 y las que empiezan con `<` son lo que recibe (estado y cabeceras de la respuesta).

---

### Respuesta sin cuerpo

400) 🟢 Si una respuesta de `fetch` tiene estado `204`, ¿qué debe hacer una función que espera JSON antes de llamar a `respuesta.json()`?

- [x] No llamar a json() 🟢 y devolver null
- [ ] Llamar a json(), que devuelve {}
- [ ] Tratar 204 como un error

> **Explicación:** Un 204 no trae cuerpo, así que `json()` fallaría al intentar leer JSON vacío. Hay que comprobar el estado antes y devolver algo como `null`.
