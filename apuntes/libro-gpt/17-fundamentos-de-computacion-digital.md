# 17. Fundamentos de computación digital

## Idea central

**Una computadora representa información con estados discretos y construye cálculos complejos al componer operaciones lógicas simples.** Los bits adquieren significado mediante una codificación; las funciones booleanas transforman entradas en salidas; las puertas y circuitos implementan físicamente esas funciones.

Este modelo conecta el nivel físico con las operaciones bit a bit de un lenguaje y muestra una idea que atraviesa toda la programación:

```text
componentes simples + composición + capas de abstracción
→ sistemas complejos
```

## Dos estados distinguibles

Una computadora física trabaja con señales continuas, pero diseña rangos que interpreta como estados discretos. Podemos nombrarlos:

```text
0 / 1
falso / verdadero
apagado / encendido
bajo / alto
```

Lo importante no es que exista exactamente cero o cinco voltios, sino que el circuito pueda distinguir con margen dos regiones. Esa separación aporta tolerancia frente a pequeñas variaciones y ruido.

Un **bit** es una unidad capaz de representar una de dos alternativas.

## Un bit no tiene significado por sí solo

El patrón `1` podría significar:

- una respuesta afirmativa;
- un píxel encendido;
- que una puerta está abierta;
- el permiso de lectura;
- la cifra uno en un número binario.

La interpretación depende del convenio. Programar siempre incluye diseñar representaciones.

## Cantidad de combinaciones

Con un bit existen dos combinaciones. Con dos:

```text
00
01
10
11
```

Con `n` bits existen `2ⁿ` patrones. Tres bits ofrecen ocho estados:

```text
000 001 010 011 100 101 110 111
```

Un dado necesita seis estados, por lo que tres bits alcanzan:

| Cara | Código posible |
|---:|:---|
| 1 | `001` |
| 2 | `010` |
| 3 | `011` |
| 4 | `100` |
| 5 | `101` |
| 6 | `110` |

`000` y `111` pueden quedar reservados. Esto ilustra dos decisiones:

1. la cantidad de bits determina la capacidad;
2. el formato decide qué significa cada patrón y qué estados son inválidos.

## Cuántos bits hacen falta

Para representar `k` estados necesitamos el menor `n` que cumpla:

```text
2ⁿ ≥ k
```

Ejemplos:

- 2 estados → 1 bit;
- 6 estados → 3 bits;
- 256 estados → 8 bits;
- 1000 estados → 10 bits, porque `2¹⁰ = 1024`.

No todos los patrones deben utilizarse. Los sobrantes pueden reservarse para errores, extensiones o control.

## Del dato al cálculo

Supongamos dos dados codificados con tres bits cada uno. Queremos responder si suman siete. El sistema recibe seis bits y produce uno:

```text
f(A, B) → {0, 1}
```

```text
1 + 6 → 1
2 + 5 → 1
3 + 4 → 1
1 + 1 → 0
2 + 2 → 0
```

Un cálculo digital puede entenderse como una función que transforma un patrón de entrada en otro de salida. El número de entradas posibles puede ser enorme, pero la idea es la misma.

## Funciones booleanas

Cuando cada variable vale `0` o `1`, usamos álgebra de Boole.

### NOT

Invierte un bit:

| A | NOT A |
|---:|---:|
| 0 | 1 |
| 1 | 0 |

Se escribe `¬A`.

### AND

Solo vale uno si ambas entradas valen uno:

| A | B | A AND B |
|---:|---:|---:|
| 0 | 0 | 0 |
| 0 | 1 | 0 |
| 1 | 0 | 0 |
| 1 | 1 | 1 |

Se escribe `A ∧ B`.

### OR

Vale uno si al menos una entrada vale uno:

| A | B | A OR B |
|---:|---:|---:|
| 0 | 0 | 0 |
| 0 | 1 | 1 |
| 1 | 0 | 1 |
| 1 | 1 | 1 |

Se escribe `A ∨ B`.

### XOR

Vale uno cuando las entradas son diferentes:

| A | B | A XOR B |
|---:|---:|---:|
| 0 | 0 | 0 |
| 0 | 1 | 1 |
| 1 | 0 | 1 |
| 1 | 1 | 0 |

XOR es útil en suma binaria, paridad, alternancia y cifrados elementales.

## Componer operaciones

```text
(A AND B) OR (NOT C)
```

equivale a:

```text
(A ∧ B) ∨ ¬C
```

La salida de una operación se convierte en entrada de otra. Este principio se repite:

```text
puertas → bloques aritméticos → procesadores → computadoras
funciones → módulos → aplicaciones → sistemas
```

La abstracción permite usar un bloque por lo que hace sin reconstruir todos sus componentes cada vez.

## Tabla de verdad

Una tabla enumera todas las entradas y la salida. Para dos variables tiene cuatro filas:

| A | B | f(A, B) |
|---:|---:|---:|
| 0 | 0 | 0 |
| 0 | 1 | 1 |
| 1 | 0 | 1 |
| 1 | 1 | 0 |

Esta tabla describe XOR completamente. Para `n` entradas habrá `2ⁿ` filas.

Una expresión permite calcular sin almacenar toda la tabla; la tabla permite especificar y verificar la expresión.

## Construir una expresión desde una tabla

Supongamos que una función vale uno en estas filas:

```text
A=0, B=1
A=1, B=0
```

Cada fila verdadera produce un término AND que fija todos los valores:

```text
(NOT A AND B)
(A AND NOT B)
```

Unimos los términos con OR:

```text
(¬A ∧ B) ∨ (A ∧ ¬B)
```

Esta es una **forma normal disyuntiva**: un OR de términos AND. Permite construir una expresión para cualquier tabla booleana finita, aunque no siempre sea la forma mínima.

## Simplificar expresiones

Algunas identidades:

```text
A AND 1 = A
A AND 0 = 0
A OR 0 = A
A OR 1 = 1
A AND A = A
A OR A = A
A AND NOT A = 0
A OR NOT A = 1
```

Distributividad:

```text
A AND (B OR C) = (A AND B) OR (A AND C)
A OR (B AND C) = (A OR B) AND (A OR C)
```

Leyes de De Morgan:

```text
NOT (A AND B) = (NOT A) OR (NOT B)
NOT (A OR B)  = (NOT A) AND (NOT B)
```

Estas leyes sirven en circuitos, condiciones de programas y consultas.

## NAND y NOR: completitud funcional

NAND es NOT de AND. NOR es NOT de OR.

Con solo puertas NAND puede construirse NOT, AND y OR; por lo tanto, cualquier función booleana. Lo mismo ocurre con NOR.

Por ejemplo, con NAND:

```text
NOT A = A NAND A
AND(A, B) = NOT(A NAND B)
```

La **completitud funcional** muestra que una colección mínima de operaciones puede construir todas las demás. En ingeniería, reducir tipos de componentes puede simplificar fabricación, aunque los diseños reales equilibran velocidad, consumo y cantidad de transistores.

## Implementación física

Una puerta lógica puede construirse con transistores usados como interruptores controlados. Los detalles eléctricos incluyen tiempos de propagación, consumo, capacidad, ruido y niveles de tensión.

Desde el nivel lógico, abstraemos esos detalles:

```text
entrada 0/1 → puerta → salida 0/1
```

La salida no cambia instantáneamente. Todo circuito tiene retardo. En sistemas sincronizados, un reloj coordina cuándo se considera estable el nuevo estado.

## Circuitos combinacionales y secuenciales

Un circuito **combinacional** produce salida según la entrada actual:

```text
salida = f(entrada actual)
```

Ejemplos: sumadores, comparadores, multiplexores.

Un circuito **secuencial** también depende del estado anterior:

```text
salida y próximo estado = f(entrada, estado actual)
```

Registros, contadores y memoria requieren almacenar estado. Esta diferencia se parece a una función pura frente a un objeto o proceso con memoria.

## Números binarios posicionales

En decimal, cada posición pesa una potencia de diez. En binario, una potencia de dos:

```text
10110₂
= 1×2⁴ + 0×2³ + 1×2² + 1×2¹ + 0×2⁰
= 16 + 4 + 2
= 22₁₀
```

En JavaScript:

```js
0b10110; // 22
(22).toString(2); // "10110"
```

## Suma binaria

Reglas de un bit:

```text
0 + 0 = 0, acarreo 0
0 + 1 = 1, acarreo 0
1 + 0 = 1, acarreo 0
1 + 1 = 0, acarreo 1
```

La suma del bit es XOR y el acarreo es AND.

## Medio sumador

Entradas `A` y `B`; salidas `S` y `C`:

```text
S = A XOR B
C = A AND B
```

| A | B | Suma | Acarreo |
|---:|---:|---:|---:|
| 0 | 0 | 0 | 0 |
| 0 | 1 | 1 | 0 |
| 1 | 0 | 1 | 0 |
| 1 | 1 | 0 | 1 |

Se llama “medio” porque no recibe un acarreo anterior.

## Sumador completo

Para sumar varios bits, cada posición —salvo la primera— recibe `Cin`, el acarreo previo:

```text
S = A XOR B XOR Cin
Cout = (A AND B) OR (Cin AND (A XOR B))
```

Al encadenar sumadores completos se construye un sumador de varios bits. El acarreo se propaga de una posición a la siguiente; diseños más avanzados aceleran esa propagación.

## Representar enteros con signo

Una representación común es complemento a dos. Con un ancho fijo de `n` bits:

- el bit más significativo participa del signo;
- el rango es `-2ⁿ⁻¹` a `2ⁿ⁻¹ - 1`;
- negar consiste en invertir y sumar uno.

Con 8 bits:

```text
5   = 00000101
-5  = 11111011
```

El ancho fijo es esencial. El patrón no tiene un valor con signo independiente del número de bits.

Los operadores bitwise de `number` en JavaScript trabajan con enteros de 32 bits con signo, salvo `>>>`, que interpreta el desplazamiento sin signo.

## Overflow

Con un ancho fijo, una suma puede necesitar un bit adicional. Si se descarta, el resultado “da la vuelta”. Para enteros sin signo de `n` bits, la aritmética se comporta módulo `2ⁿ`.

JavaScript `number` no es un entero fijo de 32 bits para la aritmética normal, pero las operaciones bitwise sí convierten a 32 bits. Typed arrays como `Uint8Array` también aplican rangos de ancho fijo al almacenar.

## Bytes, palabras y memoria

Ocho bits forman un byte, capaz de 256 patrones. La memoria se organiza en bytes direccionables y los procesadores operan también sobre grupos mayores llamados palabras.

Un mismo conjunto de bytes puede interpretarse como:

- entero;
- número de punto flotante;
- instrucción;
- parte de un texto UTF-8;
- canales de un color;
- muestra de audio.

Otra vez, la representación y el contexto dan significado.

## Máscaras de bits en JavaScript

Cada posición representa una opción:

```js
const LEER = 1 << 0;      // 0001
const CREAR = 1 << 1;     // 0010
const EDITAR = 1 << 2;    // 0100
const BORRAR = 1 << 3;    // 1000
```

Activar con OR:

```js
let permisos = LEER | CREAR;
```

Consultar con AND:

```js
function tiene(permisos, permiso) {
  return (permisos & permiso) !== 0;
}
```

Apagar:

```js
permisos &= ~CREAR;
```

Alternar con XOR:

```js
permisos ^= EDITAR;
```

Presentar:

```js
permisos.toString(2).padStart(4, "0");
```

## Operadores lógicos y bitwise no son equivalentes

```js
5 && 2; // 2, selección por truthiness
5 & 2;  // 0, AND bit a bit

5 || 2; // 5
5 | 2;  // 7
```

`&&` y `||` preservan operandos y cortocircuitan. `&` y `|` convierten a enteros y siempre evalúan ambos lados.

## Del circuito al software productivo

Comprender bits ayuda a:

- interpretar codificaciones y formatos binarios;
- diseñar flags y protocolos;
- razonar sobre rangos y overflow;
- entender por qué texto, imagen y números son interpretaciones de bytes;
- reconocer que una interfaz simple puede ocultar muchas capas.

No significa reemplazar automáticamente estructuras legibles por máscaras. La representación de bajo nivel se justifica cuando hay interoperabilidad, almacenamiento compacto o una operación bitwise real.

## Práctica guiada

1. Construí la tabla de verdad de una alarma que se active si una puerta está abierta y el sistema está armado, o si se presiona el botón de emergencia.
2. Derivá una expresión en forma normal disyuntiva y simplificala.
3. Implementala con booleanos JavaScript.
4. Diseñá una máscara de cuatro permisos y funciones para activar, consultar, apagar y alternar.
5. Simulá un sumador completo y verificá sus ocho combinaciones de entrada.

## Para recordar

- `n` bits ofrecen `2ⁿ` patrones; la codificación asigna significado.
- Una función booleana puede especificarse con tabla de verdad y construirse mediante composición.
- NOT, AND y OR son una base; NAND o NOR por sí solas también son completas.
- La suma binaria surge de XOR, AND y propagación de acarreo.
- Bits, bytes y señales son la base; las capas de abstracción permiten trabajar productivamente por encima de ella.
