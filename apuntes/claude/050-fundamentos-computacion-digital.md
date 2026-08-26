# Fundamentos de la computación digital

Apunte de clase

## La idea central

Con dos símbolos y tres operaciones se puede construir cualquier comportamiento que sepamos describir con precisión.

Los dos símbolos son 0 y 1. Las tres operaciones son NOT, AND y OR. Todo lo demás (números, texto, imágenes, sumas, productos, decisiones, un procesador entero) sale de combinar esas piezas.

El recorrido de la clase tiene cuatro pasos:

- codificar cualquier información con ceros y unos
- describir el comportamiento deseado como una función de esos bits
- convertir esa descripción en una expresión con NOT, AND y OR
- construir esa expresión con dispositivos físicos

## Codificar la información en binario

Un bit tiene 2 valores posibles. Con n bits hay 2^n combinaciones, así que alcanza con elegir una combinación distinta para cada cosa que queramos representar.

Ejemplo del dado. Un dado tiene 6 caras. Con 2 bits solo llegamos a 4 combinaciones, así que necesitamos 3 bits, que dan 8:

| Cara | Código |
|---|---|
| 1 | 000 |
| 2 | 001 |
| 3 | 010 |
| 4 | 011 |
| 5 | 100 |
| 6 | 101 |

Sobran dos códigos, 110 y 111, que no corresponden a ninguna cara. Más adelante sirven: como nunca se van a dar, podemos elegir la salida que más nos convenga para simplificar el circuito.

La codificación es arbitraria. Podríamos haber asignado los códigos en cualquier orden. Elegimos este porque coincide con la numeración binaria y después nos deja hacer cuentas.

Lo mismo vale para cualquier otra cosa: letras, colores, notas musicales, píxeles. Codificar es solo ponerse de acuerdo en una tabla.

## Funciones booleanas y tablas de verdad

Una función booleana toma n bits de entrada y devuelve un bit de salida. Como hay una cantidad finita de entradas posibles, la podemos definir por enumeración: escribimos las 2^n combinaciones y al lado la salida que queremos. Eso es una tabla de verdad.

Ejemplo de los dos dados. Tiramos dos dados y queremos una función que valga 1 cuando la suma da 7:

- entradas: 3 bits del primer dado y 3 del segundo, 6 bits en total
- filas de la tabla: 2^6 = 64
- filas con salida 1: las 6 combinaciones que suman 7, es decir 1 y 6, 2 y 5, 3 y 4, 4 y 3, 5 y 2, 6 y 1

La tabla de verdad es una definición perfecta, pero no explica nada ni se puede construir directamente. Además crece rápido: cada entrada nueva duplica la cantidad de filas.

Vale la pena ver cuánta variedad hay acá. Con n entradas, cada tabla se distingue por su columna de salida, que tiene 2^n casilleros. Entonces hay 2^(2^n) funciones distintas. Con 2 entradas son 16. Con 3, son 256. Con 6 entradas, como en los dados, hay unos 1,8 × 10^19 comportamientos posibles. Todos ellos se arman con NOT, AND y OR.

## Los tres operadores básicos

Notación: escribimos ¬a para la negación, a · b para la conjunción y a + b para la disyunción. Los símbolos de producto y suma no son casuales, como se ve más abajo.

NOT invierte el valor:

| a | ¬a |
|---|---|
| 0 | 1 |
| 1 | 0 |

AND vale 1 solo si las dos entradas valen 1:

| a | b | a · b |
|---|---|---|
| 0 | 0 | 0 |
| 0 | 1 | 0 |
| 1 | 0 | 0 |
| 1 | 1 | 1 |

OR vale 1 si al menos una entrada vale 1:

| a | b | a + b |
|---|---|---|
| 0 | 0 | 0 |
| 0 | 1 | 1 |
| 1 | 0 | 1 |
| 1 | 1 | 1 |

Leídos en castellano: "no", "y", "o". Son los conectivos con los que ya razonamos todos los días.

## De la tabla de verdad a la expresión

Existe un método mecánico para pasar de cualquier tabla de verdad a una expresión con NOT, AND y OR. Se llama forma canónica disyuntiva. También se la conoce como suma de productos canónica o desarrollo en mintérminos.

El método tiene tres pasos.

1. Mirá solo las filas donde la salida vale 1. Las filas con salida 0 se ignoran.
2. Por cada una de esas filas escribí un AND de todas las variables, negando las que en esa fila valen 0 y dejando tal cual las que valen 1. Ese producto se llama mintérmino.
3. Uní todos los mintérminos con OR.

Por qué funciona. Cada mintérmino vale 1 en una sola fila de la tabla, justamente la fila que lo generó, y vale 0 en todas las demás. Al unirlos con OR, la expresión completa vale 1 exactamente en las filas que elegimos y en ninguna otra.

De acá sale un resultado importante: NOT, AND y OR alcanzan para expresar cualquier función booleana, sin excepción. Se dice que forman un conjunto funcionalmente completo. No hay comportamiento digital, por complicado que sea, que necesite un cuarto operador.

Hay un método espejo, la forma canónica conjuntiva, que mira las filas con salida 0, arma una suma por cada una negando las variables que valen 1, y une todo con AND. Conviene cuando los ceros son pocos.

## Ejemplo completo con dados de 4 caras

El caso de los dos dados de 6 caras necesita una tabla de 64 filas, incómoda para el pizarrón. Con dados de 4 caras la cuenta es la misma y entra en 16 filas. Ganamos si la suma da 5.

Cada dado necesita 2 bits. Codificamos 1 como 00, 2 como 01, 3 como 10 y 4 como 11. Llamamos a1 a0 a los bits del primer dado y b1 b0 a los del segundo.

| a1 | a0 | b1 | b0 | A | B | A+B | gané |
|---|---|---|---|---|---|---|---|
| 0 | 0 | 0 | 0 | 1 | 1 | 2 | 0 |
| 0 | 0 | 0 | 1 | 1 | 2 | 3 | 0 |
| 0 | 0 | 1 | 0 | 1 | 3 | 4 | 0 |
| 0 | 0 | 1 | 1 | 1 | 4 | 5 | 1 |
| 0 | 1 | 0 | 0 | 2 | 1 | 3 | 0 |
| 0 | 1 | 0 | 1 | 2 | 2 | 4 | 0 |
| 0 | 1 | 1 | 0 | 2 | 3 | 5 | 1 |
| 0 | 1 | 1 | 1 | 2 | 4 | 6 | 0 |
| 1 | 0 | 0 | 0 | 3 | 1 | 4 | 0 |
| 1 | 0 | 0 | 1 | 3 | 2 | 5 | 1 |
| 1 | 0 | 1 | 0 | 3 | 3 | 6 | 0 |
| 1 | 0 | 1 | 1 | 3 | 4 | 7 | 0 |
| 1 | 1 | 0 | 0 | 4 | 1 | 5 | 1 |
| 1 | 1 | 0 | 1 | 4 | 2 | 6 | 0 |
| 1 | 1 | 1 | 0 | 4 | 3 | 7 | 0 |
| 1 | 1 | 1 | 1 | 4 | 4 | 8 | 0 |

Aplicamos el método a las 4 filas que valen 1:

```
gané = ¬a1·¬a0·b1·b0 + ¬a1·a0·b1·¬b0 + a1·¬a0·¬b1·b0 + a1·a0·¬b1·¬b0
```

Son 4 productos de 4 literales cada uno. Funciona, pero es caro: mucha compuerta para algo que intuitivamente es simple. Acá entra el álgebra.

## El álgebra de Boole

Las expresiones booleanas se pueden manipular con reglas, igual que las expresiones numéricas. Eso permite reescribir una función en una forma equivalente más corta, o sea con menos compuertas.

Leyes básicas, cada una con su versión dual:

| Ley | Con AND | Con OR |
|---|---|---|
| Identidad | a · 1 = a | a + 0 = a |
| Anulación | a · 0 = 0 | a + 1 = 1 |
| Idempotencia | a · a = a | a + a = a |
| Complemento | a · ¬a = 0 | a + ¬a = 1 |
| Conmutativa | a · b = b · a | a + b = b + a |
| Asociativa | (a·b)·c = a·(b·c) | (a+b)+c = a+(b+c) |
| Distributiva | a·(b+c) = a·b + a·c | a + b·c = (a+b)·(a+c) |
| Absorción | a · (a+b) = a | a + a·b = a |
| De Morgan | ¬(a·b) = ¬a + ¬b | ¬(a+b) = ¬a · ¬b |

Y la doble negación: ¬¬a = a.

La distributiva del AND sobre el OR es la que ya conocemos de la aritmética, y por eso llamamos producto al AND y suma al OR. La otra distributiva, la del OR sobre el AND, no tiene análogo con números: 2 + 3 × 4 no es (2+3) × (2+4). En el álgebra de Boole sí vale, y es una herramienta de simplificación muy potente.

Volvamos al ejemplo. Agrupamos el primer término con el segundo, que comparten ¬a1·b1, y el tercero con el cuarto, que comparten a1·¬b1:

```
gané = ¬a1·b1·(¬a0·b0 + a0·¬b0) + a1·¬b1·(¬a0·b0 + a0·¬b0)
```

Ahora el paréntesis es común a los dos sumandos, así que lo sacamos como factor:

```
gané = (¬a1·b1 + a1·¬b1) · (¬a0·b0 + a0·¬b0)
```

La expresión ¬x·y + x·¬y vale 1 cuando x e y son distintos. Es tan frecuente que tiene nombre propio, XOR, y se escribe x ⊕ y. Entonces:

```
gané = (a1 ⊕ b1) · (a0 ⊕ b0)
```

Pasamos de 4 productos de 4 literales a dos XOR y un AND. Y el resultado se lee en castellano: ganamos cuando los dos códigos difieren en todos sus bits. Tiene sentido, porque sumar 5 con dados de 4 caras significa que un dado tiene que dar exactamente lo que le falta al otro.

La tabla de verdad enumera, el álgebra explica. Ese es el salto.

## Las leyes de De Morgan

Las dos leyes de De Morgan merecen párrafo aparte porque las vamos a usar todo el tiempo:

```
¬(a · b) = ¬a + ¬b
¬(a + b) = ¬a · ¬b
```

En palabras: negar un AND es lo mismo que hacer un OR de las partes negadas, y viceversa. "No es cierto que ambas cosas pasen" equivale a "alguna de las dos no pasa".

Sirven para tres cosas:

- mover las negaciones hacia adentro o hacia afuera de una expresión
- convertir cualquier expresión con AND en una con OR, y al revés
- justificar que NAND y NOR alcanzan solas para todo, como vemos al final

## Del papel al circuito

Todo lo anterior es matemática. El paso decisivo es que se puede construir con materia.

Necesitamos un dispositivo que deje pasar o corte la corriente según una señal de control. El relé es el ejemplo más fácil de ver: una bobina que, al recibir corriente, atrae un contacto y cierra o abre el circuito. Es un interruptor manejado por otra señal, no por una mano.

Con eso, las tres operaciones son configuraciones de cableado:

- AND: dos contactos en serie. La corriente llega al final solo si ambos están cerrados.
- OR: dos contactos en paralelo. Alcanza con que uno esté cerrado.
- NOT: un contacto normalmente cerrado, que se abre cuando la bobina recibe señal.

Como AND, OR y NOT alcanzan para cualquier función, y cada uno se puede armar con relés, se sigue que cualquier función booleana se puede construir físicamente. Ese fue el resultado de la tesis de maestría de Claude Shannon en 1937: la conexión entre el álgebra de Boole, de 1854, y los circuitos de conmutación.

El relé después se reemplazó por la válvula, y la válvula por el transistor. El dispositivo cambió, la velocidad cambió en varios órdenes de magnitud, el álgebra es la misma. Un procesador actual es esta idea repetida decenas de miles de millones de veces.

Al circuito que implementa una operación básica lo llamamos compuerta.

## Números en base 2

Hasta acá los bits eran códigos arbitrarios. Si elegimos la codificación con cuidado, además podemos calcular.

En base 10 cada posición vale 10 veces más que la anterior, y usamos 10 dígitos. En base 2 cada posición vale 2 veces más que la anterior, y usamos 2 dígitos. Es la misma idea con otro tamaño de paquete.

```
1011 en base 2 = 1×8 + 0×4 + 1×2 + 1×1 = 11 en base 10
```

Con n bits representamos los números de 0 a 2^n - 1. Con 8 bits, de 0 a 255. Con 32 bits, más de 4 mil millones.

La conversión al revés se hace dividiendo por 2 y anotando los restos de abajo hacia arriba. Es el mismo procedimiento que usaríamos en decimal dividiendo por 10.

## Suma binaria

Sumamos como en la escuela: columna por columna, de derecha a izquierda, arrastrando el acarreo. La única diferencia es que la tabla de sumar tiene 4 entradas en vez de 100:

```
0 + 0 = 0
0 + 1 = 1
1 + 0 = 1
1 + 1 = 10   (escribo 0 y llevo 1)
```

Escribamos la tabla de verdad de una columna, sin acarreo de entrada, con s como el bit de resultado y c como el acarreo que sale:

| a | b | s | c |
|---|---|---|---|
| 0 | 0 | 0 | 0 |
| 0 | 1 | 1 | 0 |
| 1 | 0 | 1 | 0 |
| 1 | 1 | 0 | 1 |

Aplicando el método de los mintérminos a cada columna de salida:

```
s = ¬a·b + a·¬b = a ⊕ b
c = a · b
```

Eso es todo: un XOR y un AND. Se lo llama semisumador. Aparece el mismo XOR que apareció en el ejemplo de los dados, lo cual no sorprende, porque preguntar si dos bits difieren y sumarlos sin acarreo son la misma pregunta.

Para las columnas del medio hace falta también recibir el acarreo de la columna anterior. Con tres entradas, a, b y cin, la deducción es igual y da:

```
s = a ⊕ b ⊕ cin
cout = a·b + cin·(a ⊕ b)
```

Esto es el sumador completo. El acarreo sale cuando los dos bits valen 1, o cuando venía un acarreo y al menos uno de los bits lo propaga.

Para sumar números de 4 bits ponemos 4 sumadores completos en fila y conectamos cada acarreo de salida con el de entrada del siguiente. Para 64 bits, lo mismo con 64. La estructura no cambia, solo se repite.

## Producto binario

También se calcula como en la escuela, y sale más fácil que en decimal. Multiplicamos por cada dígito del segundo factor y sumamos los productos parciales desplazados.

La ventaja es que en base 2 no hay tabla de multiplicar. Cada dígito es 0 o 1, así que cada producto parcial es 0 o el primer factor tal cual, corrido tantas posiciones como indique la posición del dígito.

```
    1011      (11)
  ×  110       (6)
  -------
    0000       1011 × 0
   1011        1011 × 1, corrido 1
  1011         1011 × 1, corrido 2
  -------
  1000010     (66)
```

Un producto parcial se obtiene con un AND, un desplazamiento es solo cablear las señales corridas de lugar, y sumar ya sabemos hacerlo. Así que multiplicar no necesita nada nuevo: es AND más suma.

## NAND y NOR, compuertas universales

En la práctica se usa un juego todavía más chico. NAND es un AND negado, y NOR es un OR negado:

| a | b | a NAND b | a NOR b |
|---|---|---|---|
| 0 | 0 | 1 | 1 |
| 0 | 1 | 1 | 0 |
| 1 | 0 | 1 | 0 |
| 1 | 1 | 0 | 0 |

Con NAND sola se arman las tres operaciones básicas:

```
¬a     = a NAND a
a · b  = ¬(a NAND b) = (a NAND b) NAND (a NAND b)
a + b  = ¬a NAND ¬b  = (a NAND a) NAND (b NAND b)
```

La última línea es De Morgan aplicada: ¬(¬a · ¬b) = a + b.

Con NOR pasa lo mismo, en espejo:

```
¬a     = a NOR a
a + b  = (a NOR b) NOR (a NOR b)
a · b  = (a NOR a) NOR (b NOR b)
```

Por eso se las llama compuertas universales. Cada una alcanza, sola, para construir cualquier circuito digital.

Que sean negadas no es un capricho. En la tecnología con la que se fabrican los chips, la compuerta natural es la negada: el AND se construye como un NAND seguido de un inversor. Fabricar todo con NAND usa menos transistores y simplifica el proceso.

## Resumen

El camino completo, en una línea por paso:

- cualquier información se codifica con ceros y unos, eligiendo una tabla de equivalencias
- cualquier comportamiento se describe como una función que va de bits a bits
- cualquier función se puede escribir por enumeración en una tabla de verdad
- cualquier tabla de verdad se convierte en una expresión con NOT, AND y OR, por el método de los mintérminos
- cualquier expresión se puede simplificar con el álgebra de Boole
- cualquier expresión se puede construir con dispositivos físicos, porque serie es AND, paralelo es OR y un contacto invertido es NOT
- alcanza incluso con una sola compuerta, NAND o NOR

De ahí salen los números, la suma, el producto y, subiendo capas, todo lo demás. La riqueza no viene de tener muchas piezas, sino de componer pocas piezas muchas veces.

## Para pensar

1. Escribí la tabla de verdad de la función que indica si un dado de 6 caras sacó un número par. Deducí la expresión y simplificala.
2. Los códigos 110 y 111 no corresponden a ninguna cara del dado. Elegí para esas filas la salida que más te convenga y mostrá cuánto se acorta la expresión del ejercicio anterior.
3. Construí un XOR usando solo compuertas NAND. ¿Cuántas necesitás?
4. Verificá las dos leyes de De Morgan armando las tablas de verdad de los dos lados de cada igualdad.
5. Diseñá un circuito que compare dos números de 2 bits y devuelva 1 si son iguales. Compará tu solución con la del ejemplo de los dados.
