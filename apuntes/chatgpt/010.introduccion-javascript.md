# Programación IV — Introducción a JavaScript

## Del lenguaje del navegador a una plataforma full stack

JavaScript está presente en casi todas las aplicaciones web que usamos. Responde cuando hacemos clic en un botón, valida un formulario, actualiza una pantalla sin recargarla y permite construir interfaces completas. Pero su alcance ya no termina en el navegador: también puede recibir solicitudes HTTP, consultar bases de datos, automatizar tareas y ejecutar servicios del lado del servidor.

¿Cómo llegó un lenguaje creado para agregar pequeñas interacciones a una página a ocupar tantos lugares distintos? Para responder esa pregunta conviene comenzar por el problema que le dio origen y separar tres conceptos que suelen confundirse: **el lenguaje**, **el motor que lo ejecuta** y **el entorno que le permite interactuar con el mundo**.

Al finalizar este apunte deberíamos poder:

- explicar por qué surgió JavaScript y reconocer los principales hitos de su evolución;
- distinguir JavaScript, ECMAScript, un motor y un entorno de ejecución;
- comprender por qué decir que JavaScript es solamente “interpretado” resulta incompleto;
- describir, a nivel conceptual, qué hace la compilación justo a tiempo;
- explicar qué agrega TypeScript y qué significa transpilar;
- diferenciar tipado estático de dinámico y coerción fuerte de débil;
- relacionar esas decisiones con el desarrollo web frontend y backend.

---

## 1. La Web antes de JavaScript

En los primeros años de la Web, una página se parecía más a un documento que a una aplicación. El navegador pedía un archivo HTML a un servidor, lo recibía y lo mostraba. Si el usuario quería realizar otra acción, normalmente debía solicitar una página nueva.

HTML podía expresar la **estructura** del documento y, con el tiempo, CSS permitió describir mejor su **presentación**. Faltaba una tercera pieza: una forma de expresar **comportamiento** dentro del navegador.

Imaginemos un formulario de registro en aquella Web. Sin un lenguaje ejecutándose en el navegador, incluso una verificación sencilla —por ejemplo, comprobar que un campo no estuviera vacío— podía requerir este recorrido:

1. el usuario completaba el formulario;
2. el navegador enviaba los datos al servidor;
3. el servidor detectaba el error;
4. el servidor generaba una nueva respuesta;
5. el navegador cargaba otra página para mostrar el mensaje.

La necesidad era concreta: poder reaccionar inmediatamente a lo que ocurría en la página. Hacía falta un lenguaje suficientemente accesible para pequeños programas, integrado al navegador y capaz de responder a eventos como un clic, el envío de un formulario o la carga de un documento.

## 2. El nacimiento y la evolución de JavaScript

JavaScript fue creado en 1995 por Brendan Eich mientras trabajaba en Netscape. Su primera aparición pública estuvo ligada a Netscape Navigator 2. Aunque sus primeros nombres fueron Mocha y luego LiveScript, terminó llamándose JavaScript. El nombre aprovechaba la popularidad de Java en ese momento, pero los dos lenguajes no son versiones uno del otro: tienen modelos, objetivos e historias diferentes.

El éxito de JavaScript produjo rápidamente un nuevo problema. Otros navegadores necesitaban implementar un lenguaje compatible, pero una tecnología controlada por una sola empresa no era una base saludable para toda la Web. Netscape llevó entonces la propuesta a Ecma International. El trabajo de estandarización comenzó en 1996 y la primera edición del estándar **ECMA-262** fue aprobada en junio de 1997.

Aquí aparecen dos nombres que conviene relacionar correctamente:

- **ECMAScript** es el lenguaje definido por el estándar ECMA-262.
- **JavaScript** es el nombre con el que usamos habitualmente una implementación de ese lenguaje y su ecosistema.

En la conversación cotidiana ambos nombres suelen referirse al mismo lenguaje. Sin embargo, “ECMAScript” resulta útil cuando hablamos con precisión de la especificación o de una edición, como ES5 o ES2015.

### Una línea de tiempo mínima

| Año | Hito | Por qué fue importante |
|---:|---|---|
| 1995 | Nace JavaScript en Netscape | Las páginas pueden incorporar comportamiento ejecutado en el navegador. |
| 1997 | Primera edición de ECMA-262 | El lenguaje obtiene una especificación independiente y compartida. |
| 1999 | ECMAScript 3 | Consolida buena parte del JavaScript clásico utilizado durante años. |
| 2005 | Se populariza el enfoque AJAX | Las páginas comienzan a intercambiar datos con el servidor sin recargarse por completo. |
| 2008 | Google publica Chrome y el motor V8 | La competencia entre motores impulsa grandes mejoras de rendimiento. |
| 2009 | ECMAScript 5 y primera versión de Node.js | El lenguaje madura y V8 comienza a utilizarse ampliamente fuera del navegador. |
| 2012 | Microsoft presenta TypeScript | Se agrega verificación estática de tipos sobre JavaScript. |
| 2015 | ECMAScript 2015, también llamado ES6 | Incorpora módulos, clases, promesas, `let`, `const`, funciones flecha y muchas otras mejoras. |
| Desde 2016 | Ediciones anuales de ECMAScript | La evolución pasa a ser gradual y predecible, en lugar de depender de grandes saltos. |

Esta historia muestra una transformación. JavaScript nació para programas pequeños dentro de páginas, pero la Web empezó a exigir aplicaciones cada vez más complejas. Los motores se hicieron más rápidos, el estándar incorporó mejores abstracciones y el ecosistema llevó el lenguaje a nuevos entornos.

---

## 3. ¿Qué significa “ejecutar JavaScript”?

Cuando escribimos este código:

```js
const mensaje = "Hola, Programación IV";
console.log(mensaje.toUpperCase());
```

nosotros vemos texto. El procesador, en cambio, solo puede ejecutar instrucciones de máquina. Entre una cosa y la otra debe existir un traductor.

Tradicionalmente se presentan dos modelos:

- Un **compilador** traduce el programa antes de ejecutarlo y suele producir otro programa o código de máquina.
- Un **intérprete** analiza las instrucciones y las va ejecutando mediante otro programa.

Esta distinción sirve como primera aproximación, pero los motores modernos combinan estrategias. Por eso, afirmar simplemente que “JavaScript es interpretado” deja afuera una parte importante de lo que sucede.

Más precisamente:

> ECMAScript define cómo debe comportarse el lenguaje, pero no obliga a los motores a utilizar una única estrategia de ejecución.

Un motor moderno puede interpretar una representación intermedia y, al mismo tiempo, compilar ciertas partes a código de máquina. V8 —utilizado por Chrome y Node.js— combina un intérprete con compiladores de distintos niveles. Otros motores, como SpiderMonkey de Firefox o JavaScriptCore de Safari, poseen arquitecturas propias con la misma clase de objetivo: comenzar a ejecutar pronto y optimizar lo que realmente lo necesita.

## 4. Compilación justo a tiempo: JIT

**JIT** significa *Just-In-Time*, o compilación justo a tiempo. La idea consiste en compilar durante la ejecución, usando información que solamente puede conocerse mientras el programa está funcionando.

De manera conceptual, el proceso puede verse así:

```text
código fuente
     ↓
análisis sintáctico
     ↓
representación interna / bytecode
     ↓
ejecución y recolección de información
     ↓
optimización de las partes más utilizadas
     ↓
código de máquina especializado
```

Veámoslo desde primeros principios. En JavaScript una misma función puede recibir valores de distintos tipos:

```js
function sumar(a, b) {
  return a + b;
}

sumar(10, 20);       // 30
sumar("Hola, ", "Ana"); // "Hola, Ana"
```

Antes de ejecutar el programa, el motor no siempre puede asumir qué valores recibirá `sumar`. Durante la ejecución, en cambio, puede observar su uso. Si una función se invoca muchas veces con números, el motor puede producir una versión optimizada para ese patrón.

El razonamiento simplificado es el siguiente:

1. **Leer y analizar.** El motor verifica la sintaxis y construye una representación interna del programa.
2. **Comenzar rápidamente.** Genera una forma ejecutable inicial, como bytecode, sin gastar demasiado tiempo en optimizaciones.
3. **Observar.** Mientras el programa corre, registra qué funciones se usan mucho y qué clases de valores reciben.
4. **Optimizar.** Compila las zonas “calientes” a código de máquina más especializado.
5. **Desoptimizar si es necesario.** Si dejan de cumplirse las suposiciones, vuelve a una versión más general sin cambiar el resultado que exige el lenguaje.

Supongamos que esta función procesa miles de precios:

```js
function calcularTotal(precios) {
  let total = 0;

  for (const precio of precios) {
    total += precio;
  }

  return total;
}
```

Si siempre recibe arreglos de números, un motor podría optimizar ese camino. Si más tarde aparece un texto, quizá tenga que abandonar esa optimización. Este comportamiento es una posibilidad interna del motor, no un contrato que el código deba intentar controlar.

La conclusión importante no es memorizar los nombres de cada componente de V8. Es comprender que los motores actuales buscan equilibrar dos necesidades opuestas:

- **iniciar rápido**, sin compilar exhaustivamente todo el programa;
- **ejecutar rápido**, invirtiendo más trabajo en las partes que se repiten.

Por eso resulta más correcto decir:

> JavaScript es un lenguaje cuya implementación moderna suele combinar interpretación y compilación JIT.

---

## 5. TypeScript y la transpilación

A medida que las aplicaciones JavaScript crecieron, también crecieron las relaciones que una persona debía mantener en su cabeza: qué datos recibe una función, qué propiedades tiene un objeto, qué puede devolver una operación y qué partes dependen de ellas.

Consideremos esta función JavaScript:

```js
function aplicarDescuento(precio, porcentaje) {
  return precio - precio * porcentaje / 100;
}
```

El programa no expresa si `precio` debe ser un número, si `porcentaje` puede faltar o qué devuelve la función. Quizá esos contratos estén en la documentación; quizá solo sean un acuerdo implícito del equipo.

TypeScript permite escribirlos en el código:

```ts
function aplicarDescuento(
  precio: number,
  porcentaje: number
): number {
  return precio - precio * porcentaje / 100;
}

aplicarDescuento(10_000, 15);   // correcto
aplicarDescuento("10000", 15);  // error antes de ejecutar
```

TypeScript fue presentado por Microsoft en 2012 para actuar como un **verificador estático de tipos para JavaScript**. Incluye la sintaxis de JavaScript y agrega, entre otras herramientas, anotaciones de tipos, interfaces y tipos genéricos.

Sin embargo, el navegador y Node.js ejecutan JavaScript. Por eso el código TypeScript debe convertirse en JavaScript antes de llegar al entorno de ejecución:

```text
TypeScript (.ts)
   │
   ├── verificación de tipos
   │
   └── emisión / transpilación
                ↓
         JavaScript (.js)
                ↓
       motor de JavaScript
```

Por ejemplo, este código TypeScript:

```ts
const duplicar = (valor: number): number => valor * 2;
```

puede producir un JavaScript equivalente a este:

```js
const duplicar = (valor) => valor * 2;
```

Las anotaciones `: number` desaparecen. Ayudaron durante el desarrollo, pero no existen durante la ejecución.

### ¿Compilar o transpilar?

**Compilar** es traducir un programa a otra representación. **Transpilar** suele utilizarse para un caso más específico: traducir de un lenguaje fuente a otro lenguaje fuente de un nivel semejante. Como TypeScript produce JavaScript, es habitual decir que se transpila.

Las dos palabras no son contradictorias. `tsc` se llama *TypeScript Compiler*, realiza verificación estática y puede emitir JavaScript. En proyectos modernos también es común separar responsabilidades: TypeScript verifica los tipos sin emitir archivos y otra herramienta transforma el código.

La transpilación también permite adaptar JavaScript moderno a entornos más antiguos. Por ejemplo, una herramienta puede transformar cierta sintaxis reciente en otra equivalente que comprenda un navegador anterior. Esto cambia la forma del código, no necesariamente incorpora las APIs que falten; para estas últimas puede ser necesario un *polyfill*.

### Una limitación fundamental

Como los tipos de TypeScript desaparecen, no validan automáticamente los datos que llegan desde fuera del programa:

```ts
type Usuario = {
  id: number;
  nombre: string;
};

const respuesta = await fetch("/api/usuario/1");
const usuario: Usuario = await respuesta.json();
```

La anotación comunica lo que esperamos, pero no obliga al servidor a enviar esa estructura. Los datos provenientes de una API, un formulario, un archivo o una base de datos cruzan una frontera y deben validarse durante la ejecución.

> TypeScript puede detectar inconsistencias en nuestro programa antes de ejecutarlo; no puede convertir una entrada externa no confiable en una entrada correcta.

---

## 6. Lenguaje, motor y entorno de ejecución

Para entender cómo JavaScript puede utilizarse tanto en frontend como en backend, debemos separar tres capas.

### 6.1 El lenguaje

ECMAScript define elementos como:

- valores: números, textos, booleanos, objetos, funciones;
- sintaxis: `if`, `for`, `class`, `import`, funciones flecha;
- reglas: alcance de variables, comparaciones, conversiones;
- objetos estándar: `Array`, `Object`, `Promise`, `Map`, `Math`.

Este código pertenece al lenguaje y puede ejecutarse en distintos entornos:

```js
const notas = [7, 9, 6];
const promedio = notas.reduce((suma, nota) => suma + nota, 0) / notas.length;

console.log(promedio);
```

### 6.2 El motor

El motor implementa la especificación y ejecuta el código. También administra memoria, recolecta objetos que ya no se utilizan y aplica estrategias como JIT.

Algunos motores conocidos son:

- **V8**, usado por Chrome y Node.js;
- **SpiderMonkey**, usado por Firefox;
- **JavaScriptCore**, usado por Safari.

### 6.3 El entorno o anfitrión

El lenguaje por sí solo no sabe qué es una página web, un archivo del disco o una solicitud HTTP. El entorno incorpora esas capacidades mediante APIs.

En un navegador podemos escribir:

```js
const boton = document.querySelector("#guardar");

boton.addEventListener("click", () => {
  document.body.classList.add("guardado");
});
```

`document`, el DOM y los eventos son APIs del navegador; no forman parte del núcleo de ECMAScript.

En Node.js podemos escribir:

```js
import { readFile } from "node:fs/promises";

const contenido = await readFile("alumnos.json", "utf8");
console.log(contenido);
```

El acceso al sistema de archivos es provisto por Node.js. Un navegador común no expone `node:fs` porque su entorno y sus reglas de seguridad son diferentes.

Podemos resumir la relación así:

```text
Aplicación
   ↓ usa
APIs del entorno (DOM, archivos, red, procesos...)
   ↓ se apoya en
Motor de JavaScript (V8, SpiderMonkey, JavaScriptCore...)
   ↓ implementa
ECMAScript
```

Esta separación explica por qué un código puede ser JavaScript válido y, aun así, no funcionar en todos los lugares: quizá dependa de una API que el entorno actual no ofrece.

---

## 7. JavaScript en frontend y backend

### Frontend: código cerca del usuario

En el navegador, JavaScript suele encargarse de:

- responder a eventos del usuario;
- leer y modificar el DOM;
- administrar el estado de la interfaz;
- validar datos para ofrecer una respuesta inmediata;
- pedir o enviar información a un servidor;
- actualizar partes de la pantalla.

```js
const formulario = document.querySelector("#inscripcion");

formulario.addEventListener("submit", async (evento) => {
  evento.preventDefault();

  const datos = new FormData(formulario);

  await fetch("/api/inscripciones", {
    method: "POST",
    body: datos,
  });
});
```

El frontend no debe considerarse una frontera de seguridad. Un usuario puede modificar el código que corre en su navegador o construir manualmente una solicitud. La validación del frontend mejora la experiencia; el backend debe volver a validar todo lo importante.

### Backend: código cerca de los datos y las reglas del sistema

Con la aparición de Node.js, JavaScript obtuvo un entorno ampliamente adoptado fuera del navegador. Node.js utiliza V8 e incorpora APIs para red, archivos, procesos y otras tareas del sistema.

En el backend, JavaScript puede:

- recibir solicitudes HTTP;
- autenticar y autorizar usuarios;
- aplicar reglas de negocio;
- validar entradas no confiables;
- consultar o modificar una base de datos;
- integrarse con otros servicios;
- construir y devolver una respuesta.

```js
import { createServer } from "node:http";

const servidor = createServer((solicitud, respuesta) => {
  respuesta.writeHead(200, { "content-type": "application/json" });
  respuesta.end(JSON.stringify({ mensaje: "Hola desde el backend" }));
});

servidor.listen(3000);
```

Usar el mismo lenguaje en ambos lados facilita compartir conocimientos y, en algunos casos, reglas y tipos. No significa que frontend y backend sean lo mismo: se ejecutan en máquinas diferentes, poseen capacidades diferentes y protegen responsabilidades diferentes.

---

## 8. Tipado estático y tipado dinámico

Un **tipo** representa una categoría de valores y las operaciones que tienen sentido sobre ellos. Sumar números, convertir un texto a mayúsculas o recorrer una colección son operaciones válidas para ciertos tipos y no para otros.

Al comparar sistemas de tipos conviene separar dos preguntas:

1. **¿Cuándo se comprueba la compatibilidad de tipos?** Estático frente a dinámico.
2. **¿Cuánto convierte automáticamente el lenguaje entre tipos?** Más fuerte frente a más débil o coercitivo.

Estas dimensiones están relacionadas, pero no son equivalentes.

### Tipado estático

En un sistema estático, una herramienta analiza los tipos antes de ejecutar el programa. Las variables y expresiones tienen tipos que el analizador puede verificar, ya sea porque los escribimos o porque los infiere.

```ts
let cantidad: number = 3;
cantidad = "tres"; // error de tipos
```

**Ventajas principales:**

- detecta muchas inconsistencias antes de llegar al usuario;
- mejora el autocompletado y la navegación del editor;
- vuelve explícitos los contratos entre partes del sistema;
- brinda más seguridad al cambiar nombres, mover código o refactorizar;
- reduce la cantidad de estados que una persona debe considerar.

**Costos y límites:**

- agrega una etapa de análisis y, a veces, anotaciones;
- requiere aprender el sistema de tipos y resolver sus errores;
- puede introducir complejidad si se modela más de lo necesario;
- no demuestra que el programa sea correcto ni reemplaza las pruebas;
- no valida por sí mismo datos externos durante la ejecución.

### Tipado dinámico

En un sistema dinámico, los valores poseen tipos durante la ejecución y una variable puede referirse a valores de tipos diferentes a lo largo del tiempo.

```js
let resultado = 42;
resultado = "cuarenta y dos";
resultado = { valor: 42 };
```

JavaScript permite las tres asignaciones. Esto no significa que “no tenga tipos”: `42`, `"cuarenta y dos"` y `{ valor: 42 }` pertenecen a categorías diferentes. Significa que la variable `resultado` no queda restringida estáticamente a una de ellas.

Podemos consultar una parte de esa información durante la ejecución:

```js
console.log(typeof 42);                // "number"
console.log(typeof "hola");            // "string"
console.log(typeof true);              // "boolean"
console.log(typeof { nombre: "Ana" }); // "object"
```

**Ventajas principales:**

- permite comenzar con poco código ceremonial;
- resulta flexible para prototipos, scripts y datos cambiantes;
- algunas abstracciones se expresan sin describir previamente todos sus tipos;
- el ciclo inicial de experimentación puede ser muy directo.

**Costos y límites:**

- ciertas incompatibilidades aparecen solamente al ejecutar el camino afectado;
- una función comunica menos sobre lo que espera si no tiene documentación;
- los cambios en sistemas grandes pueden tener consecuencias más difíciles de rastrear;
- el editor y las herramientas deben inferir más información incompleta.

No existe un ganador universal. El valor de cada estrategia depende del tamaño del programa, su vida útil, el equipo y el costo de un error. TypeScript surgió, precisamente, para conservar el modelo de ejecución de JavaScript y sumar comprobaciones estáticas cuando el sistema crece.

---

## 9. Tipado fuerte, tipado débil y coerción

“Fuertemente tipado” y “débilmente tipado” no poseen una definición universal tan precisa como estático y dinámico. Distintos autores clasifican un mismo lenguaje de maneras diferentes. En una introducción, la idea más útil es observar cuánto convierte el lenguaje de forma automática valores de un tipo a otro.

JavaScript realiza numerosas **coerciones implícitas**, por lo que suele describirse como débilmente tipado o, de manera más precisa, como un lenguaje dinámico y coercitivo.

```js
console.log("5" + 1);  // "51"
console.log("5" - 1);  // 4
console.log(false == 0);  // true
console.log(false === 0); // false
```

¿Por qué los dos primeros resultados son diferentes?

- El operador `+` también sirve para concatenar textos. Ante un texto y un número, convierte el número a texto.
- El operador `-` solo representa resta numérica. Por eso intenta convertir `"5"` a número.
- `==` permite conversiones antes de comparar.
- `===` compara sin esa coerción y, como los tipos son distintos, devuelve `false`.

La coerción puede ser cómoda, pero también puede esconder un error. Pensemos en un dato obtenido de un formulario:

```js
const precio = 1200;
const cantidad = "2"; // los campos de texto entregan texto

console.log(precio * cantidad); // 2400
console.log(precio + cantidad); // "12002"
```

El primer resultado puede hacernos creer que los datos eran correctos. El segundo revela que `cantidad` nunca fue convertida de manera intencional.

Una solución más clara explicita la conversión y valida el resultado:

```js
const precio = 1200;
const entrada = "2";
const cantidad = Number(entrada);

if (!Number.isFinite(cantidad) || cantidad <= 0) {
  throw new Error("La cantidad debe ser un número positivo");
}

const total = precio * cantidad;
```

La enseñanza no debería reducirse a “JavaScript convierte tipos y eso está mal”. La coerción forma parte de las reglas del lenguaje. El objetivo es reconocer cuándo ocurre y evitar que una conversión implícita tome una decisión de negocio por nosotros.

Como regla inicial:

- preferir `===` y `!==` para comparar;
- convertir las entradas de manera explícita;
- validar los datos en las fronteras del sistema;
- no confiar en que un resultado aparentemente correcto prueba que el tipo de origen era correcto.

### Las dos dimensiones juntas

| Lenguaje | Momento de comprobación | Tendencia frente a conversiones |
|---|---|---|
| C# / Java | Estático | Generalmente fuerte |
| Python | Dinámico | Generalmente fuerte |
| JavaScript | Dinámico | Coercitivo; suele clasificarse como débil |
| TypeScript | Estático durante el desarrollo | Conserva el comportamiento dinámico de JavaScript al ejecutarse |

La tabla es orientativa, en especial en la segunda columna conceptual. Lo esencial es notar que **dinámico no significa necesariamente débil**: Python es el contraejemplo habitual. Tampoco TypeScript crea un nuevo entorno fuertemente tipado durante la ejecución; después de borrar los tipos, se ejecutan las reglas normales de JavaScript.

---

## 10. De JavaScript a TypeScript: una evolución gradual

TypeScript no reemplaza JavaScript. Se construye sobre él. Un programa JavaScript válido puede ser el punto de partida de una migración en la que los contratos se agregan gradualmente.

Supongamos que una aplicación maneja productos:

```js
function calcularTotal(productos) {
  return productos.reduce(
    (total, producto) => total + producto.precio,
    0
  );
}
```

La función depende de varias suposiciones:

- `productos` debe ser recorrible;
- cada elemento debe tener una propiedad `precio`;
- cada `precio` debería ser numérico;
- la función devolverá un número si todas esas condiciones se cumplen.

TypeScript convierte esas suposiciones en un contrato verificable:

```ts
type Producto = {
  id: number;
  nombre: string;
  precio: number;
};

function calcularTotal(productos: Producto[]): number {
  return productos.reduce(
    (total, producto) => total + producto.precio,
    0
  );
}
```

Ahora el editor puede anticipar propiedades, detectar un nombre mal escrito y avisar si intentamos usar un precio textual. Además, TypeScript infiere muchos tipos: no es necesario anotar cada variable.

```ts
const productos: Producto[] = [
  { id: 1, nombre: "Teclado", precio: 35_000 },
  { id: 2, nombre: "Mouse", precio: 18_000 },
];

const total = calcularTotal(productos);
// TypeScript infiere que total es number.
```

La evolución puede ser gradual:

1. conservar archivos JavaScript existentes;
2. activar comprobaciones sobre ellos y documentar tipos con JSDoc;
3. convertir primero los módulos más importantes a `.ts`;
4. endurecer las reglas a medida que el equipo resuelve los casos anteriores;
5. validar en tiempo de ejecución todas las entradas externas.

Este enfoque explica el éxito de TypeScript en proyectos web grandes: permite incorporar seguridad estática sin abandonar JavaScript, su ecosistema ni sus entornos de ejecución.

---

## 11. Un caso full stack: los tipos atraviesan fronteras

Imaginemos una pantalla que envía un nuevo producto al servidor.

En el navegador, el valor de un campo llega como texto:

```js
const precioIngresado = document.querySelector("#precio").value;
// Por ejemplo: "35000"
```

La interfaz debe convertirlo y ofrecer un mensaje temprano si es inválido. Sin embargo, el servidor no puede confiar en que la solicitud provino de esa interfaz ni en que su validación fue ejecutada.

El recorrido correcto es:

```text
campo de formulario
       ↓ texto
conversión y validación en frontend
       ↓ solicitud HTTP
validación nuevamente en backend
       ↓ dato confiable para esa operación
regla de negocio y persistencia
```

TypeScript puede compartir una descripción como `Producto` entre frontend y backend, y así detectar desacuerdos durante el desarrollo. Aun así, la solicitud HTTP contiene datos de ejecución. El backend debe comprobar que `precio` existe, que es un número finito y que cumple las reglas del negocio.

De aquí surge una regla que acompañará toda la materia:

> Los tipos estáticos describen contratos dentro del programa; la validación protege las fronteras por las que ingresan datos reales.

---

## 12. Ideas que conviene conservar

1. JavaScript surgió para incorporar comportamiento a la Web, pero su uso se expandió mucho más allá de las primeras páginas interactivas.
2. ECMAScript es la especificación estandarizada del lenguaje; JavaScript es el nombre habitual de sus implementaciones y su ecosistema.
3. El estándar define resultados, no una única técnica interna de ejecución.
4. Los motores modernos combinan interpretación, bytecode y compilación JIT; por eso “solo interpretado” es una simplificación insuficiente.
5. El motor ejecuta el lenguaje; el entorno aporta capacidades como DOM, archivos, procesos o red.
6. El navegador y Node.js pueden ejecutar JavaScript, pero ofrecen APIs y responsabilidades diferentes.
7. JavaScript posee tipado dinámico: los valores tienen tipos y las variables pueden referirse a valores de tipos distintos.
8. JavaScript realiza coerciones implícitas; conocerlas y convertir de forma intencional evita resultados sorpresivos.
9. TypeScript verifica tipos antes de ejecutar y luego produce JavaScript. Sus tipos no permanecen en tiempo de ejecución.
10. La verificación estática, la validación en ejecución y las pruebas resuelven problemas diferentes; se complementan.

---

## 13. Preguntas de repaso

1. ¿Qué necesidad de la Web original ayudó a resolver JavaScript?
2. ¿Qué diferencia existe entre JavaScript y ECMAScript?
3. ¿Por qué no es completamente preciso definir JavaScript como un lenguaje interpretado?
4. ¿Qué información puede aprovechar un compilador JIT que un compilador previo a la ejecución todavía no posee?
5. ¿Qué diferencia hay entre un motor y un entorno de ejecución?
6. ¿Por qué `document.querySelector` funciona en el navegador y no forma parte del núcleo de ECMAScript?
7. ¿Qué significa que una variable de JavaScript sea dinámicamente tipada?
8. ¿Por qué tipado dinámico y tipado débil no son sinónimos?
9. ¿Qué resultados producen `"5" + 1` y `"5" - 1`? ¿Qué regla explica la diferencia?
10. ¿Qué agrega TypeScript y qué ocurre con sus tipos antes de ejecutar el programa?
11. ¿Por qué una interfaz TypeScript no alcanza para validar el cuerpo de una solicitud HTTP?
12. ¿Qué responsabilidades pueden compartirse entre frontend y backend y cuáles deben permanecer separadas?

### Ejercicio breve

Analizar el siguiente código sin ejecutarlo:

```js
const cantidad = "3";
const precio = 500;

const subtotal = cantidad * precio;
const descripcion = "Total: $" + cantidad * precio;
const resultado = cantidad + precio;

console.log(subtotal);
console.log(descripcion);
console.log(resultado);
```

Para cada variable:

1. anticipar su valor y su tipo;
2. identificar las coerciones realizadas;
3. reescribir el programa para convertir y validar `cantidad` explícitamente;
4. proponer una versión TypeScript de la operación.

---

## Fuentes y lecturas recomendadas

- [ECMA-262, primera edición (1997)](https://www.ecma-international.org/wp-content/uploads/ECMA-262_1st_edition_june_1997.pdf)
- [Archivo de ediciones de ECMAScript — Ecma International](https://ecma-international.org/publications-and-standards/standards/ecma-262/)
- [JavaScript: historia y definición — MDN](https://developer.mozilla.org/en-US/docs/Glossary/JavaScript)
- [Diez años de V8 — V8](https://v8.dev/blog/10-years)
- [El intérprete Ignition y la compilación JIT — V8](https://v8.dev/blog/ignition-interpreter)
- [Introducción a Node.js — documentación oficial](https://nodejs.org/learn)
- [TypeScript para quien comienza a programar — documentación oficial](https://www.typescriptlang.org/docs/handbook/typescript-from-scratch.html)
- [Manual de TypeScript — documentación oficial](https://www.typescriptlang.org/docs/handbook/intro.html)
