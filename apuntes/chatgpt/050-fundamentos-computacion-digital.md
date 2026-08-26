Fundamentos de la computación digital

1. Una idea sorprendentemente simple

Una computadora puede realizar tareas extraordinariamente complejas:

* procesar textos e imágenes,
* ejecutar videojuegos,
* realizar cálculos científicos,
* reproducir música,
* comunicarse por Internet,
* ejecutar sistemas de inteligencia artificial.

Sin embargo, toda esa complejidad puede construirse a partir de elementos extremadamente simples.

La idea central que vamos a estudiar es:

Comportamientos complejos pueden construirse combinando una gran cantidad de operaciones extremadamente simples.

Para comprender cómo es posible, necesitamos tres ideas fundamentales:

1. representar información mediante valores discretos;
2. realizar operaciones lógicas sobre esos valores;
3. combinar operaciones simples para construir operaciones más complejas.

⸻

2. La representación binaria

La forma más sencilla de representar información consiste en distinguir solamente entre dos estados.

Podemos llamarlos:

0   1

Pero también podrían representar:

falso       verdadero
apagado     encendido
no          sí
abierto     cerrado
0 V         5 V

Lo importante no es qué significado físico tengan esos estados.

Lo importante es que podamos distinguirlos claramente.

A cada unidad de información que puede tomar uno de dos valores la llamamos bit.

⸻

3. Codificar información

Los bits no tienen significado por sí mismos.

Nosotros decidimos qué representan.

Por ejemplo, imaginemos un dado.

Tiene seis resultados posibles:

1
2
3
4
5
6

Con un solo bit podemos representar solamente dos posibilidades.

Con dos bits:

00
01
10
11

podemos representar cuatro.

Con tres bits tenemos ocho combinaciones:

000
001
010
011
100
101
110
111

Por lo tanto, tres bits son suficientes para codificar las seis caras de un dado.

Por ejemplo:

Dado	Binario
1	001
2	010
3	011
4	100
5	101
6	110

Las combinaciones 000 y 111 simplemente pueden quedar sin utilizar.

Esto muestra una idea importante:

Una secuencia de bits puede representar información que originalmente no tiene nada de “binaria”.

Puede representar números, letras, colores, sonidos, posiciones de un juego o cualquier otra cosa que podamos codificar.

⸻

4. De representar información a procesarla

Supongamos ahora que tiramos dos dados.

Cada dado puede representarse mediante tres bits:

A = a2 a1 a0
B = b2 b1 b0

Queremos construir un sistema que responda una pregunta muy sencilla:

¿Los dos dados suman 7?

La salida también puede representarse mediante un bit:

0 → no gané
1 → gané

Tenemos entonces una función:

f(A, B) → {0, 1}

Por ejemplo:

1 + 6 → 1
2 + 5 → 1
3 + 4 → 1
4 + 3 → 1
5 + 2 → 1
6 + 1 → 1

mientras que:

1 + 1 → 0
2 + 2 → 0
3 + 2 → 0
...

Aquí aparece una idea fundamental de la computación digital:

Un cálculo puede entenderse como una función que transforma una combinación de bits de entrada en bits de salida.

⸻

5. Funciones booleanas

Cuando las variables solamente pueden tomar los valores 0 y 1, podemos trabajar con el álgebra de Boole.

Sus operaciones fundamentales pueden expresarse mediante tres operadores muy sencillos:

NOT
AND
OR

NOT

NOT invierte un valor.

A	NOT A
0	1
1	0

Podemos escribir:

¬A

⸻

AND

AND produce 1 solamente cuando ambas entradas son 1.

A	B	A AND B
0	0	0
0	1	0
1	0	0
1	1	1

Podemos escribir:

A ∧ B

⸻

OR

OR produce 1 cuando al menos una entrada es 1.

A	B	A OR B
0	0	0
0	1	1
1	0	1
1	1	1

Podemos escribir:

A ∨ B

⸻

6. Construir comportamientos complejos

La potencia de estas operaciones aparece cuando comenzamos a combinarlas.

Por ejemplo:

(A AND B) OR (NOT C)

es decir:

(A ∧ B) ∨ ¬C

Ya no estamos realizando una única operación elemental.

Estamos construyendo una función más compleja utilizando funciones más sencillas.

Este principio puede repetirse tantas veces como sea necesario:

operaciones simples
        ↓
combinaciones
        ↓
funciones más complejas
        ↓
combinaciones de funciones
        ↓
sistemas todavía más complejos

Esta composición es una de las ideas esenciales de la computación.

⸻

7. La tabla de verdad

Una función booleana puede describirse completamente mediante una tabla de verdad.

Si tenemos dos entradas:

A B

existen solamente cuatro combinaciones posibles:

00
01
10
11

Por ejemplo, imaginemos una función cualquiera:

A	B	F
0	0	0
0	1	1
1	0	1
1	1	0

La tabla no necesita explicar cómo calculamos F.

Simplemente enumera qué resultado debe producir para cada entrada posible.

Por eso podemos pensar una tabla de verdad como una definición por enumeración de una función.

⸻

8. De una tabla de verdad a una expresión lógica

Aquí aparece un resultado particularmente importante.

Podemos convertir cualquier tabla de verdad en una expresión construida solamente con NOT, AND y OR.

Veamos el procedimiento.

Tomemos nuevamente:

A	B	F
0	0	0
0	1	1
1	0	1
1	1	0

Nos interesan las filas donde:

F = 1

La primera es:

A = 0
B = 1

Queremos construir una expresión que sea verdadera exactamente para esa combinación.

Como A debe ser cero, lo negamos:

NOT A

Como B debe ser uno, lo dejamos como está.

Entonces:

(NOT A) AND B

es decir:

¬A ∧ B

⸻

La otra fila verdadera es:

A = 1
B = 0

Por lo tanto:

A AND (NOT B)

o:

A ∧ ¬B

Finalmente queremos aceptar una combinación O la otra:

((NOT A) AND B)
OR
(A AND (NOT B))

Matemáticamente:

(¬A ∧ B) ∨ (A ∧ ¬B)

Acabamos de obtener una expresión lógica directamente a partir de la tabla.

⸻

9. El procedimiento general: forma normal disyuntiva

El procedimiento anterior se conoce como Forma Normal Disyuntiva (FND) o suma de productos.

El algoritmo conceptual es muy sencillo:

Paso 1

Buscar todas las filas donde:

salida = 1

Paso 2

Para cada una de esas filas, construir una expresión AND.

Para cada variable:

si aparece 1 → usar la variable
si aparece 0 → usar NOT variable

Por ejemplo, la fila:

A = 1
B = 0
C = 1

produce:

A AND (NOT B) AND C

Paso 3

Unir todas esas expresiones mediante OR.

Es decir:

fila1 OR fila2 OR fila3 OR ...

El resultado es una expresión que reproduce exactamente la tabla de verdad original.

⸻

10. Una consecuencia fundamental

Este procedimiento demuestra algo muy poderoso.

Si podemos describir un comportamiento mediante una tabla de verdad, entonces podemos construirlo utilizando:

NOT
AND
OR

Por lo tanto:

NOT, AND y OR son suficientes para expresar cualquier función booleana.

No significa que la expresión obtenida sea siempre la más pequeña o eficiente.

Significa algo más fundamental:

siempre podemos construirla.

⸻

11. Álgebra de Boole

Las expresiones booleanas forman un álgebra.

Por lo tanto, podemos transformarlas utilizando reglas matemáticas.

Por ejemplo, existen propiedades semejantes a las del álgebra convencional.

Distributividad

A AND (B OR C)

puede distribuirse:

(A AND B) OR (A AND C)

También podemos realizar el proceso inverso y factorizar:

(A AND B) OR (A AND C)

como:

A AND (B OR C)

Esto permite simplificar expresiones y, eventualmente, construir circuitos más sencillos.

⸻

12. Leyes de De Morgan

Dos transformaciones particularmente importantes son las leyes de De Morgan:

NOT (A AND B)
=
(NOT A) OR (NOT B)

y:

NOT (A OR B)
=
(NOT A) AND (NOT B)

En símbolos:

¬(A ∧ B) = ¬A ∨ ¬B
¬(A ∨ B) = ¬A ∧ ¬B

Estas leyes permiten transformar unas operaciones lógicas en otras y serán especialmente importantes cuando estudiemos compuertas universales.

⸻

13. De las matemáticas a un mecanismo físico

Hasta aquí todo podría parecer simplemente matemática.

Pero podemos construir dispositivos físicos que implementen estas operaciones.

Necesitamos algún elemento que permita que una señal controle a otra.

Históricamente esto puede realizarse mediante relés.

Un relé puede pensarse, de manera simplificada, como:

un interruptor controlado eléctricamente.

Una señal eléctrica decide si otro circuito queda abierto o cerrado.

⸻

14. Construir AND mediante interruptores

Imaginemos dos interruptores conectados en serie:

+ ----[ A ]----[ B ]---- 💡 ---- -

La corriente solamente puede circular si:

A está cerrado
Y
B está cerrado

Por lo tanto:

serie → AND

Su comportamiento es:

A	B	Lámpara
0	0	0
0	1	0
1	0	0
1	1	1

Es exactamente la tabla de verdad de AND.

⸻

15. Construir OR mediante interruptores

Ahora conectemos los interruptores en paralelo:

      +---[ A ]---+
+ ----+           +---- 💡 ---- -
      +---[ B ]---+

Existe corriente si está cerrado:

A
O
B

Por lo tanto:

paralelo → OR

Nuevamente obtenemos físicamente la misma función que habíamos definido matemáticamente.

⸻

16. De relés a computadoras

Una vez que podemos construir físicamente:

NOT
AND
OR

podemos construir combinaciones de ellas.

Y como vimos anteriormente:

NOT + AND + OR

permiten construir cualquier función booleana.

Por lo tanto podemos pasar de:

Álgebra de Boole
        ↓
expresiones lógicas
        ↓
compuertas
        ↓
circuitos
        ↓
sistemas digitales

Los primeros computadores electromecánicos utilizaron relés.

Posteriormente se utilizaron válvulas de vacío y finalmente transistores.

La tecnología física cambió radicalmente.

La lógica fundamental permaneció.

⸻

17. Representar números en binario

Hasta ahora utilizamos 0 y 1 principalmente como valores lógicos.

Pero también podemos utilizarlos para representar números.

Nuestro sistema decimal utiliza potencias de 10.

Por ejemplo:

583

significa:

5 × 100 + 8 × 10 + 3 × 1

o:

5 × 10² + 8 × 10¹ + 3 × 10⁰

El sistema binario utiliza exactamente la misma idea, pero con potencias de 2.

Por ejemplo:

1011₂

significa:

1 × 2³ +
0 × 2² +
1 × 2¹ +
1 × 2⁰

es decir:

8 + 0 + 2 + 1 = 11

Por lo tanto:

1011₂ = 11₁₀

No estamos utilizando una matemática diferente.

Simplemente cambiamos la base de representación.

⸻

18. Sumar números binarios

La suma binaria funciona de manera completamente análoga a la suma decimal.

En decimal sabemos que:

9 + 1 = 10

Escribimos 0 y llevamos 1 a la siguiente columna.

En binario ocurre lo mismo cuando superamos el mayor dígito disponible:

0 + 0 = 0
0 + 1 = 1
1 + 0 = 1
1 + 1 = 10

Por ejemplo:

   101
 + 011
 -----
  1000

Es exactamente el mismo procedimiento que aprendimos para sumar números decimales.

⸻

19. El sumador como función lógica

Ahora podemos conectar dos partes de nuestra explicación.

La suma de dos bits puede describirse mediante una tabla de verdad.

A	B	Suma	Acarreo
0	0	0	0
0	1	1	0
1	0	1	0
1	1	0	1

Tenemos dos entradas:

A
B

y dos salidas:

S = suma
C = acarreo

Cada salida es simplemente una función booleana.

Por lo tanto podemos obtener expresiones para ambas.

Para la suma:

S = (NOT A AND B) OR (A AND NOT B)

Para el acarreo:

C = A AND B

Este circuito se denomina medio sumador (half adder).

Aquí aparece una conexión crucial:

La aritmética puede construirse utilizando lógica booleana.

⸻

20. Multiplicación binaria

La multiplicación también funciona de manera análoga a la multiplicación decimal.

Pero resulta incluso más sencilla porque solamente existen dos dígitos.

Las reglas elementales son:

0 × 0 = 0
0 × 1 = 0
1 × 0 = 0
1 × 1 = 1

Por lo tanto, multiplicar un número por un bit significa esencialmente decidir entre:

0

o:

el mismo número

A partir de operaciones elementales de este tipo, desplazamientos y sumas podemos construir multiplicadores binarios.

Otra vez aparece el mismo principio:

operaciones elementales
        ↓
combinación
        ↓
operaciones aritméticas complejas

⸻

21. ¿Necesitamos realmente tres compuertas?

Hasta ahora dijimos que podemos construir cualquier función utilizando:

NOT
AND
OR

Pero podemos ir todavía más lejos.

Existe una operación llamada NAND:

NAND = NOT AND

Su tabla es:

A	B	A NAND B
0	0	1
0	1	1
1	0	1
1	1	0

Sorprendentemente:

NAND por sí sola es suficiente para construir cualquier función booleana.

⸻

22. Construir NOT con NAND

Si conectamos las dos entradas:

A NAND A

obtenemos:

NOT A

porque:

A NAND A
=
NOT (A AND A)
=
NOT A
``