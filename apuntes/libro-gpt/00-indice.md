# Índice general

## Programar con JavaScript: de los datos a las soluciones

La tesis del libro es que **programar consiste en representar datos, transformarlos mediante reglas explícitas y comprobar que el resultado cumple un contrato**. Los capítulos siguen una progresión: primero el entorno, luego cada tipo de dato, después las estructuras, el control y las funciones, y finalmente las aplicaciones que integran esas herramientas.

Cada capítulo utiliza una estructura inspirada en la pirámide de Minto:

1. presenta la idea central;
2. la divide en conceptos que la sostienen;
3. desarrolla consecuencias, casos límite y ejemplos;
4. cierra con práctica y un resumen operativo.

## Parte I. Entender el lenguaje y sus valores

### 1. [Del problema al programa](01-del-problema-al-programa.md)

Origen y evolución de JavaScript, ECMAScript, lenguaje frente a motor y anfitrión, navegador y Node.js, frontend/backend, módulos, JIT, TypeScript, tipado y fronteras de validación.

### 2. [Variables, alcance y expresiones](02-variables-alcance-y-expresiones.md)

Declaración, inicialización y asignación; `const`, `let` y `var`; alcance global, de función y de bloque; elevación, zona muerta temporal, vida de valores, nombres, operadores, precedencia y asociatividad.

### 3. [El tipo `boolean`](03-el-tipo-boolean.md)

Booleanos, valores *truthy* y *falsy*, conversión, negación, cortocircuito, `&&`, `||`, `??`, comparaciones, igualdad, De Morgan y asignación lógica.

### 4. [Los tipos `number` y `bigint`](04-el-tipo-number-y-bigint.md)

Literales y bases, IEEE 754, precisión decimal, `NaN`, infinitos, cero negativo, enteros seguros, conversión, redondeo, formato, operaciones bit a bit, máscaras y enteros arbitrariamente grandes.

### 5. [El tipo `string` y Unicode](05-el-tipo-string-y-unicode.md)

Literales, escapes, plantillas, inmutabilidad, búsqueda y transformación, unidades UTF-16, puntos de código, grafemas, normalización, comparación lingüística y tagged templates.

### 6. [`undefined`, `null` y la ausencia](06-undefined-null-y-ausencia.md)

Ausencia implícita e intencional, `typeof null`, coalescencia, encadenamiento opcional, parámetros predeterminados, propiedades ausentes, huecos de array, JSON y estados etiquetados.

### 7. [Conversión y coerción](07-conversion-y-coercion.md)

Conversión explícita, contextos de coerción, strings, números, booleanos y `bigint`, regla especial de `+`, comparación flexible y estricta, conversión de objetos y parsers de dominio.

### 8. [El tipo `symbol` y los protocolos](08-el-tipo-symbol-y-los-protocolos.md)

Identidad única, claves symbol, registro global, reflexión, iteración síncrona y asincrónica, conversión a primitivo y símbolos conocidos que personalizan operaciones del lenguaje.

## Parte II. Modelar colecciones y entidades

### 9. [Arrays y matrices](09-arrays-y-matrices.md)

Creación, índices, arrays densos y dispersos, rangos, pilas y colas, búsquedas, recorridos, transformaciones, ordenamiento, referencias, desestructuración y matrices sin filas compartidas.

### 10. [Objetos, propiedades y referencias](10-objetos-y-referencias.md)

Literales, punto y corchetes, claves calculadas, métodos y `this`, existencia y enumeración, identidad, spread, copias, actualización inmutable, desestructuración, congelamiento y JSON.

### 11. [`Map`, `Set` y colecciones especializadas](11-map-set-y-colecciones-especializadas.md)

Asociaciones dinámicas, pertenencia única, índices, frecuencias, agrupación, operaciones de conjuntos, conversiones, criterios de elección, `WeakMap` y `WeakSet`.

## Parte III. Organizar el comportamiento

### 12. [Estructuras de control](12-estructuras-de-control.md)

`if`, `else`, ternario, guardas, condiciones anidadas, `switch`, *fall-through*, `while`, `do...while`, `for`, `for...of`, `for...in`, `break`, `continue` y terminación de bucles.

### 13. [Errores y excepciones](13-errores-y-excepciones.md)

Contratos fallidos frente a resultados esperados, `throw`, tipos de error, propagación, errores personalizados, causas, captura selectiva, `finally`, promesas, `fetch` y concurrencia.

### 14. [Funciones](14-funciones.md)

Declaraciones, expresiones y flechas; parámetros, argumentos, valores predeterminados, rest, desestructuración, pasaje por valor, `return`, `this`, clausuras, callbacks, asincronía y generadores.

### 15. [Programación funcional y pipelines](15-programacion-funcional-y-pipelines.md)

Pureza, efectos, inmutabilidad, núcleo funcional, funciones de orden superior, `map`, `filter`, `reduce`, consultas, composición, equivalencias con LINQ, evaluación inmediata y generadores diferidos.

### 16. [Recursividad y árboles binarios](16-recursividad-y-arboles.md)

Pila de llamadas, caso base y reducción, estructuras recursivas, recorridos, búsqueda, inserción mutable e inmutable, eliminación, validación de invariantes, comparadores, balance y versiones iterativas.

## Parte IV. Aplicar e integrar

### 17. [Fundamentos de computación digital](17-fundamentos-de-computacion-digital.md)

Bits y codificación, funciones booleanas, tablas de verdad, formas normales, completitud funcional, puertas, circuitos combinacionales y secuenciales, binario, sumadores, complemento a dos y máscaras.

### 18. [Expresiones regulares](18-expresiones-regulares.md)

Patrones literales y dinámicos, metacaracteres, clases, Unicode, cuantificadores, anclas, grupos, capturas, referencias, lookaround, flags, métodos, validación, rendimiento y límites frente a parsers.

### 19. [Gestión de archivos con Node.js](19-gestion-de-archivos-con-nodejs.md)

Rutas, bytes, codificación y formato; APIs de promesas, callbacks y síncronas; escritura segura, `Buffer`, Unicode, directorios, metadatos, streams, manejadores, JSON, CSV, copia, movimiento, eliminación, seguridad y concurrencia.

## Apéndices

### A. [Byte Pair Encoding: construir un tokenizador](apendices/100.tokens.md)

Implementación progresiva de BPE desde bytes UTF-8: conteo de pares, fusiones, entrenamiento, codificación, decodificación recursiva, invariantes, persistencia, pruebas, complejidad y experimentos.

### B. [Evaluar expresiones mediante pilas](apendices/110-evaluar-expresion.md)

Uso de una pila, prioridad de operadores y paréntesis para recorrer y evaluar expresiones aritméticas mediante dos estructuras de datos.

## Rutas de lectura

### Primera lectura completa

Seguí los capítulos en orden. Cada parte depende del vocabulario construido en la anterior.

### Para empezar a programar rápidamente

Leé 1, 2, 3, 4, 5, 9, 10, 12 y 14. Después resolvé un programa pequeño antes de continuar.

### Para procesar datos

Leé 5, 7, 9, 10, 11, 15, 18 y 19.

### Para profundizar en modelos del lenguaje

Leé 2, 3, 4, 6, 7, 8, 14 y 16.

### Para realizar el proyecto BPE

Leé primero 4, 5, 9, 11, 14, 16 y 19. Después trabajá el apéndice A ejecutando cada etapa.

## Método de estudio productivo

Para cada capítulo:

1. leé la idea central y explicala con tus palabras;
2. predecí el resultado de los ejemplos antes de ejecutarlos;
3. ejecutá y modificá las entradas;
4. resolvé la práctica guiada sin copiar la solución;
5. escribí al menos un caso límite y un caso de error;
6. aplicá el concepto a un dato propio del curso.

El criterio de avance no es haber leído todas las secciones, sino poder elegir una herramienta, justificarla y verificar el resultado.
