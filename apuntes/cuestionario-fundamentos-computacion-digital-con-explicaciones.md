# Cuestionario — Fundamentos de la computación digital

Cada pregunta incluye la respuesta correcta y una explicación conceptual.

## 1. ¿Cuál es la idea central que permite construir comportamientos digitales complejos?

A. Combinar 0 y 1 mediante NOT, AND y OR  
B. Usar números decimales y operaciones aritméticas  
C. Disponer de una operación diferente para cada problema  
D. Codificar directamente cada comportamiento en hardware  

**Respuesta correcta:** A

**Explicación:** El apunte muestra que dos símbolos, 0 y 1, y tres operaciones básicas —NOT, AND y OR— son suficientes para expresar cualquier función booleana. La complejidad surge de componer muchas veces unas pocas piezas simples.

---

## 2. ¿Cuántas combinaciones diferentes pueden representarse con n bits?

A. n²  
B. 2n  
C. 2^n  
D. n^2  

**Respuesta correcta:** C

**Explicación:** Cada bit puede tomar dos valores, 0 o 1. Como las elecciones son independientes, con n bits existen 2^n combinaciones posibles.

---

## 3. ¿Cuál es la cantidad mínima de bits necesaria para codificar las 6 caras de un dado?

A. 2 bits  
B. 3 bits  
C. 4 bits  
D. 6 bits  

**Respuesta correcta:** B

**Explicación:** Con 2 bits solo existen 2² = 4 combinaciones. Con 3 bits existen 2³ = 8, suficientes para representar las seis caras. Por eso hacen falta como mínimo 3 bits.

---

## 4. Al codificar un dado de 6 caras con 3 bits, ¿qué ocurre con 110 y 111?

A. Representan obligatoriamente las caras 0 y 7  
B. Son códigos que no corresponden a ninguna cara  
C. Producen un error lógico en cualquier circuito  
D. Deben eliminarse físicamente de los bits  

**Respuesta correcta:** B

**Explicación:** Tres bits ofrecen ocho combinaciones, pero el dado solo tiene seis caras. Por lo tanto, dos códigos quedan sin utilizar. El apunte señala además que esos casos pueden aprovecharse para simplificar una función.

---

## 5. ¿Qué define una tabla de verdad de una función booleana?

A. Solo las entradas para las que la función vale 1  
B. Todas las entradas posibles y la salida correspondiente  
C. Las compuertas físicas necesarias para construirla  
D. Una expresión algebraica ya simplificada  

**Respuesta correcta:** B

**Explicación:** Una tabla de verdad define una función por enumeración: muestra cada combinación posible de entradas y especifica qué salida corresponde a cada una.

---

## 6. Una función booleana tiene 6 bits de entrada. ¿Cuántas filas tiene su tabla de verdad completa?

A. 12  
B. 32  
C. 64  
D. 256  

**Respuesta correcta:** C

**Explicación:** Con n entradas binarias existen 2^n combinaciones. Para 6 bits: 2⁶ = 64. Por eso la tabla completa tiene 64 filas.

---

## 7. ¿Cuántas funciones booleanas distintas existen con 2 entradas?

A. 4  
B. 8  
C. 16  
D. 256  

**Respuesta correcta:** C

**Explicación:** Con 2 entradas hay 2² = 4 filas. Cada una puede tener independientemente salida 0 o 1. Por lo tanto existen 2⁴ = 16 columnas de salida posibles, es decir, 16 funciones distintas.

---

## 8. ¿Cuándo vale 1 la operación AND entre dos bits a y b?

A. Cuando al menos uno vale 1  
B. Solo cuando ambos valen 1  
C. Cuando los bits son diferentes  
D. Solo cuando ambos valen 0  

**Respuesta correcta:** B

**Explicación:** AND representa la conjunción lógica: a·b vale 1 únicamente cuando a=1 y b=1. En los otros tres casos vale 0.

---

## 9. En la forma canónica disyuntiva, ¿qué filas de la tabla de verdad se utilizan para construir los mintérminos?

A. Las filas cuya salida vale 1  
B. Las filas cuya salida vale 0  
C. Solamente la primera y la última fila  
D. Las filas que contienen más unos que ceros  

**Respuesta correcta:** A

**Explicación:** El procedimiento toma cada fila cuya salida es 1 y construye un mintérmino que vale 1 exactamente en esa fila. Luego todos esos mintérminos se unen mediante OR.

---

## 10. Para una fila con a=0, b=1 y salida=1, ¿qué mintérmino corresponde?

A. a·b  
B. ¬a·b  
C. a·¬b  
D. ¬a·¬b  

**Respuesta correcta:** B

**Explicación:** En un mintérmino, una variable se niega si en la fila vale 0 y se deja directa si vale 1. Como a=0 y b=1, resulta ¬a·b.

---

## 11. ¿Por qué NOT, AND y OR forman un conjunto funcionalmente completo?

A. Porque cualquier función booleana puede expresarse combinándolos  
B. Porque son las únicas operaciones que existen en electrónica  
C. Porque toda función necesita exactamente las tres  
D. Porque eliminan la necesidad de usar bits  

**Respuesta correcta:** A

**Explicación:** El método de los mintérminos permite transformar cualquier tabla de verdad en una expresión formada por NOT, AND y OR. Por eso cualquier función booleana puede construirse con esas tres operaciones.

---

## 12. ¿Cuál de estas igualdades es una ley de De Morgan?

A. ¬(a·b) = ¬a + ¬b  
B. ¬(a·b) = ¬a·¬b  
C. ¬(a+b) = ¬a + ¬b  
D. ¬(a+b) = a·b  

**Respuesta correcta:** A

**Explicación:** Una ley de De Morgan establece que negar un AND equivale a hacer OR entre las entradas negadas: ¬(a·b)=¬a+¬b. La otra establece ¬(a+b)=¬a·¬b.

---

## 13. ¿Qué expresa x ⊕ y?

A. Que x e y valen ambos 1  
B. Que al menos uno de los dos vale 1  
C. Que x e y son distintos  
D. Que x e y son iguales  

**Respuesta correcta:** C

**Explicación:** XOR vale 1 cuando sus entradas son diferentes: 0⊕1=1 y 1⊕0=1. Cuando son iguales, 0⊕0 o 1⊕1, vale 0.

---

## 14. En el ejemplo de dos dados de 4 caras, ganar al sumar 5 termina simplificándose como ¿qué condición?

A. (a1 ⊕ b1) · (a0 ⊕ b0)  
B. (a1 · b1) + (a0 · b0)  
C. (a1 + b1) · (a0 + b0)  
D. (a1 ⊕ b1) + (a0 ⊕ b0)  

**Respuesta correcta:** A

**Explicación:** Al simplificar la expresión obtenida de la tabla de verdad aparece un XOR para cada posición de bits. Para ganar, ambos pares de bits deben ser diferentes simultáneamente, por eso los dos XOR se unen mediante AND.

---

## 15. Con relés, ¿qué configuración física representa un AND?

A. Dos contactos en serie  
B. Dos contactos en paralelo  
C. Un contacto normalmente cerrado  
D. Dos contactos desconectados  

**Respuesta correcta:** A

**Explicación:** Dos contactos en serie dejan pasar corriente solamente si ambos están cerrados. Ese comportamiento coincide exactamente con la tabla de verdad de AND.

---

## 16. ¿Qué valor decimal representa el número binario 1011?

A. 9  
B. 10  
C. 11  
D. 13  

**Respuesta correcta:** C

**Explicación:** Cada posición tiene peso potencia de dos: 1011₂ = 1×8 + 0×4 + 1×2 + 1×1 = 11.

---

## 17. En un semisumador con entradas a y b, ¿cuáles son las expresiones de la suma s y del acarreo c?

A. s = a+b; c = a⊕b  
B. s = a⊕b; c = a·b  
C. s = a·b; c = a+b  
D. s = ¬a·b; c = a·¬b  

**Respuesta correcta:** B

**Explicación:** El bit de suma vale 1 cuando a y b son distintos, por eso s=a⊕b. El acarreo aparece únicamente cuando ambos valen 1, por eso c=a·b.

---

## 18. ¿Qué diferencia fundamental tiene un sumador completo respecto de un semisumador?

A. Recibe además un acarreo de entrada  
B. Puede sumar números decimales directamente  
C. No necesita producir acarreo de salida  
D. Utiliza únicamente una entrada  

**Respuesta correcta:** A

**Explicación:** El semisumador suma solamente a y b. El sumador completo incorpora una tercera entrada, cin, que recibe el acarreo proveniente de la columna anterior. Esto permite encadenar sumadores para operar números de muchos bits.

---

## 19. ¿Por qué la multiplicación binaria no requiere una operación lógica fundamental nueva?

A. Porque puede construirse con AND, desplazamientos y sumas  
B. Porque multiplicar y sumar son exactamente la misma operación  
C. Porque los productos binarios nunca generan acarreo  
D. Porque solo pueden multiplicarse números de un bit  

**Respuesta correcta:** A

**Explicación:** En binario, multiplicar por un bit produce 0 o el otro factor. Esos productos parciales pueden obtenerse con AND, desplazarse según su posición y luego sumarse. Por eso no hace falta introducir una operación lógica fundamental nueva.

---

## 20. ¿Por qué NAND y NOR se denominan compuertas universales?

A. Porque solo sirven para construir NOT  
B. Porque cualquiera de ellas, por sí sola, permite construir cualquier función booleana  
C. Porque siempre requieren combinarse entre sí  
D. Porque sustituyen la representación binaria por otra codificación  

**Respuesta correcta:** B

**Explicación:** Con NAND sola pueden construirse NOT, AND y OR; lo mismo ocurre con NOR. Como NOT, AND y OR permiten expresar cualquier función booleana, NAND o NOR por sí solas también permiten construir cualquier circuito lógico.

---

# Clave de respuestas

| Pregunta | Respuesta |
|---:|:---:|
| 1 | A |
| 2 | C |
| 3 | B |
| 4 | B |
| 5 | B |
| 6 | C |
| 7 | C |
| 8 | B |
| 9 | A |
| 10 | B |
| 11 | A |
| 12 | A |
| 13 | C |
| 14 | A |
| 15 | A |
| 16 | C |
| 17 | B |
| 18 | A |
| 19 | A |
| 20 | B |