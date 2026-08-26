# Cuestionario — Fundamentos de la computación digital

Basado en el apunte **Fundamentos de la computación digital**.

## 1. ¿Cuál es la idea central que permite construir comportamientos digitales complejos?

- [x] Combinar 0 y 1 mediante NOT, AND y OR  
- [ ] Usar números decimales y operaciones aritméticas  
- [ ] Disponer de una operación diferente para cada problema  
- [ ] Codificar directamente cada comportamiento en hardware  

---

## 2. ¿Cuántas combinaciones diferentes pueden representarse con n bits?

- [ ] n²  
- [ ] 2n  
- [x] 2^n  
- [ ] n^2  

---

## 3. ¿Cuál es la cantidad mínima de bits necesaria para codificar las 6 caras de un dado?

- [ ] 2 bits  
- [x] 3 bits  
- [ ] 4 bits  
- [ ] 6 bits  

---

## 4. Al codificar un dado de 6 caras con 3 bits, ¿qué ocurre con 110 y 111?

- [ ] Representan obligatoriamente las caras 0 y 7  
- [x] Son códigos que no corresponden a ninguna cara  
- [ ] Producen un error lógico en cualquier circuito  
- [ ] Deben eliminarse físicamente de los bits  

---

## 5. ¿Qué define una tabla de verdad de una función booleana?

- [ ] Solo las entradas para las que la función vale 1  
- [x] Todas las entradas posibles y la salida correspondiente  
- [ ] Las compuertas físicas necesarias para construirla  
- [ ] Una expresión algebraica ya simplificada  

---

## 6. Una función booleana tiene 6 bits de entrada. ¿Cuántas filas tiene su tabla de verdad completa?

- [ ] 12  
- [ ] 32  
- [x] 64  
- [ ] 256  

---

## 7. ¿Cuántas funciones booleanas distintas existen con 2 entradas?

- [ ] 4  
- [ ] 8  
- [x] 16  
- [ ] 256  

---

## 8. ¿Cuándo vale 1 la operación AND entre dos bits a y b?

- [ ] Cuando al menos uno vale 1  
- [x] Solo cuando ambos valen 1  
- [ ] Cuando los bits son diferentes  
- [ ] Solo cuando ambos valen 0  

---

## 9. En la forma canónica disyuntiva, ¿qué filas de la tabla de verdad se utilizan para construir los mintérminos?

- [x] Las filas cuya salida vale 1  
- [ ] Las filas cuya salida vale 0  
- [ ] Solamente la primera y la última fila  
- [ ] Las filas que contienen más unos que ceros  

---

## 10. Para una fila con a=0, b=1 y salida=1, ¿qué mintérmino corresponde?

- [ ] a·b  
- [x] ¬a·b  
- [ ] a·¬b  
- [ ] ¬a·¬b  

---

## 11. ¿Por qué NOT, AND y OR forman un conjunto funcionalmente completo?

- [x] Porque cualquier función booleana puede expresarse combinándolos  
- [ ] Porque son las únicas operaciones que existen en electrónica  
- [ ] Porque toda función necesita exactamente las tres  
- [ ] Porque eliminan la necesidad de usar bits  

---

## 12. ¿Cuál de estas igualdades es una ley de De Morgan?

- [x] ¬(a·b) = ¬a + ¬b  
- [ ] ¬(a·b) = ¬a·¬b  
- [ ] ¬(a+b) = ¬a + ¬b  
- [ ] ¬(a+b) = a·b  

---

## 13. ¿Qué expresa x ⊕ y?

- [ ] Que x e y valen ambos 1  
- [ ] Que al menos uno de los dos vale 1  
- [x] Que x e y son distintos  
- [ ] Que x e y son iguales  

---

## 14. En el ejemplo de dos dados de 4 caras, ganar al sumar 5 termina simplificándose como ¿qué condición?

- [x] (a1 ⊕ b1) · (a0 ⊕ b0)  
- [ ] (a1 · b1) + (a0 · b0)  
- [ ] (a1 + b1) · (a0 + b0)  
- [ ] (a1 ⊕ b1) + (a0 ⊕ b0)  

---

## 15. Con relés, ¿qué configuración física representa un AND?

- [x] Dos contactos en serie  
- [ ] Dos contactos en paralelo  
- [ ] Un contacto normalmente cerrado  
- [ ] Dos contactos desconectados  

---

## 16. ¿Qué valor decimal representa el número binario 1011?

- [ ] 9  
- [ ] 10  
- [x] 11  
- [ ] 13  

---

## 17. En un semisumador con entradas a y b, ¿cuáles son las expresiones de la suma s y del acarreo c?

- [ ] s = a+b; c = a⊕b  
- [x] s = a⊕b; c = a·b  
- [ ] s = a·b; c = a+b  
- [ ] s = ¬a·b; c = a·¬b  

---

## 18. ¿Qué diferencia fundamental tiene un sumador completo respecto de un semisumador?

- [x] Recibe además un acarreo de entrada  
- [ ] Puede sumar números decimales directamente  
- [ ] No necesita producir acarreo de salida  
- [ ] Utiliza únicamente una entrada  

---

## 19. ¿Por qué la multiplicación binaria no requiere una operación lógica fundamental nueva?

- [x] Porque puede construirse con AND, desplazamientos y sumas  
- [ ] Porque multiplicar y sumar son exactamente la misma operación  
- [ ] Porque los productos binarios nunca generan acarreo  
- [ ] Porque solo pueden multiplicarse números de un bit  

---

## 20. ¿Por qué NAND y NOR se denominan compuertas universales?

- [ ] Porque solo sirven para construir NOT  
- [x] Porque cualquiera de ellas, por sí sola, permite construir cualquier función booleana  
- [ ] Porque siempre requieren combinarse entre sí  
- [ ] Porque sustituyen la representación binaria por otra codificación  

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
