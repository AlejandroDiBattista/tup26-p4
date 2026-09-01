# 1. Del problema al programa

## Idea central

**JavaScript es un lenguaje; para convertirlo en una solución necesita un motor que lo ejecute y un entorno que le permita interactuar con el mundo.** Distinguir esas tres capas evita buena parte de la confusión inicial y permite decidir si un programa debe vivir en el navegador, en Node.js o en ambos.

JavaScript no es “el lenguaje de una etiqueta `<script>`” ni un sinónimo de navegador. Es una especificación con múltiples implementaciones, anfitriones y herramientas. Comprender ese ecosistema permite interpretar correctamente mensajes de error, documentación y decisiones de arquitectura.

## Una tarea concreta antes que un lenguaje

Imaginemos una inscripción a una materia. Recibimos el nombre y la edad de una persona, validamos los datos y producimos una respuesta. El problema existe antes del código:

```text
entrada → reglas → salida
```

JavaScript permite expresar esas reglas:

```js
function evaluarInscripcion({ nombre, edad }) {
  if (!nombre.trim()) return { aceptada: false, motivo: "Falta el nombre" };
  if (edad < 16) return { aceptada: false, motivo: "Edad insuficiente" };

  return { aceptada: true, mensaje: `Bienvenido, ${nombre}` };
}
```

Este pequeño programa ya contiene las piezas que recorreremos en el libro: valores, una estructura de datos, una función, condiciones y un resultado explícito.

## Por qué apareció JavaScript

La Web inicial publicaba documentos enlazados. Cada interacción importante requería pedir una página nueva al servidor. Los navegadores necesitaban un lenguaje pequeño que pudiera reaccionar cerca del usuario: validar un formulario, cambiar contenido y responder a eventos sin recargar todo.

JavaScript fue creado en 1995 dentro de Netscape. Su primer prototipo se desarrolló con enorme rapidez y el lenguaje cambió de nombre durante su lanzamiento. Su nombre final aprovechó la popularidad de Java, pero JavaScript y Java son lenguajes distintos:

- tienen sistemas de tipos y modelos de objetos diferentes;
- se ejecutan mediante plataformas diferentes;
- compartir parte de la sintaxis superficial no vuelve equivalentes sus programas.

La estandarización llegó mediante Ecma International. El estándar se llama **ECMAScript** y JavaScript es su implementación más conocida.

### Una línea de tiempo mínima

- **1995:** nace el lenguaje en el navegador.
- **1997:** se publica la primera edición de ECMAScript.
- **1999:** ECMAScript 3 consolida características que dominaron la Web durante años.
- **2009:** ECMAScript 5 formaliza modo estricto, JSON y métodos modernos de arrays, entre otras mejoras.
- **2015:** ECMAScript 2015 introduce módulos, clases, `let`, `const`, promesas, iteradores, generadores, flechas y una gran actualización del lenguaje.
- **Etapa posterior:** el estándar adopta entregas regulares e incrementales en lugar de esperar muchos años entre grandes versiones.

El lenguaje actual conserva compatibilidad con una enorme cantidad de código antiguo. Esa continuidad explica algunas peculiaridades como `typeof null`, `var` y la igualdad flexible.

## Las tres capas de JavaScript

Cuando decimos “JavaScript”, solemos mezclar tres cosas diferentes:

1. **El lenguaje** define la sintaxis y el comportamiento de valores, objetos, funciones y operadores. Su estándar se llama ECMAScript.
2. **El motor** lee y ejecuta ese código. V8 es un motor usado por Chrome y Node.js; otros entornos pueden utilizar motores diferentes.
3. **El anfitrión** ofrece capacidades externas. El navegador aporta el DOM, eventos y `localStorage`; Node.js aporta archivos, procesos y red.

La especificación ECMAScript define valores como `Map`, `Promise`, `Symbol` y `Array`. Documentos separados definen APIs web como `fetch`, `document` y `setTimeout`. Node.js implementa algunas APIs web y aporta sus propios módulos. Por eso una función puede existir en varios entornos sin pertenecer originalmente al núcleo del lenguaje.

Por eso `document.querySelector()` funciona en una página web pero no es parte del lenguaje, y `readFile()` funciona en Node.js pero no aparece por arte de magia en el navegador.

```js
// Lenguaje: funciona en distintos entornos.
const total = [10, 20, 30].reduce((suma, valor) => suma + valor, 0);

// API del navegador.
document.querySelector("#total").textContent = total;

// API de Node.js.
import { writeFile } from "node:fs/promises";
await writeFile("total.txt", String(total), "utf8");
```

Cuando una API “no existe”, la pregunta productiva es: ¿pertenece al lenguaje, al anfitrión, a una biblioteca instalada o a una versión diferente del entorno?

## Motores y anfitriones diferentes

Entre los motores conocidos están V8, SpiderMonkey y JavaScriptCore. Todos buscan implementar ECMAScript, aunque pueden diferir durante la incorporación de características nuevas, en optimizaciones y en herramientas de diagnóstico.

El mismo motor puede aparecer en anfitriones distintos. V8 ejecuta código dentro de Chrome y también dentro de Node.js, pero Chrome ofrece DOM y Node.js ofrece `node:fs`. Compartir motor no iguala las APIs.

El anfitrión también coordina tareas alrededor del motor. Un bucle de eventos decide cuándo ejecutar callbacks de temporizadores, red o interfaz. JavaScript puede ejecutar una tarea a la vez en un hilo principal y, aun así, coordinar operaciones asincrónicas realizadas por el entorno.

## Del navegador a una plataforma completa

JavaScript nació para agregar comportamiento a páginas web y evolucionó hasta convertirse en un lenguaje de propósito general. Hoy puede participar en toda una aplicación:

- en el **frontend**, responde a la interacción del usuario y presenta información;
- en el **backend**, aplica reglas, protege recursos y accede a datos;
- en herramientas de línea de comandos, automatiza tareas;
- en aplicaciones híbridas, comparte modelos y validaciones entre capas.

El lugar de ejecución importa. El frontend está cerca del usuario, pero su código y sus datos pueden inspeccionarse. Las reglas de seguridad, las credenciales y las decisiones que no deben manipularse pertenecen al servidor.

```text
navegador → solicitud → servidor → datos
     ↑                         ↓
     └──────── respuesta ──────┘
```

La validación del navegador mejora la experiencia; la validación del servidor conserva la integridad del sistema. Una no reemplaza a la otra.

## Frontend: código cerca del usuario

El frontend puede:

- leer eventos de teclado, ratón o tacto;
- modificar la representación de la página;
- validar rápidamente una entrada;
- almacenar preferencias locales;
- solicitar datos a servicios remotos.

Ese código se descarga en el dispositivo del usuario. No debe contener secretos ni ser la única barrera de autorización. Ocultar un botón no impide llamar a la API correspondiente.

## Backend: código cerca de datos y reglas

El backend puede:

- autenticar y autorizar;
- aplicar invariantes del negocio;
- acceder a bases de datos y sistemas internos;
- usar credenciales protegidas;
- coordinar operaciones entre usuarios.

Node.js permite escribir ese backend en JavaScript. Usar el mismo lenguaje en ambos extremos facilita compartir conocimientos y algunos contratos, pero no elimina la frontera de seguridad ni convierte en confiables los datos que cruzan la red.

## Módulos y dependencias

Un programa real se divide en módulos. Los módulos ECMAScript declaran explícitamente qué exportan e importan:

```js
// precios.js
export function calcularTotal(precio, cantidad) {
  return precio * cantidad;
}
```

```js
// aplicacion.js
import { calcularTotal } from "./precios.js";

console.log(calcularTotal(100, 3));
```

El especificador `./precios.js` señala un módulo local. Nombres como `node:path` señalan módulos integrados de Node.js. Otros nombres pueden referirse a paquetes instalados y resueltos por el entorno o una herramienta de construcción.

Los módulos crean límites de nombres, permiten reutilización y vuelven visibles las dependencias. Una importación no garantiza que el código sea seguro o compatible: las dependencias externas también requieren evaluación, versiones y mantenimiento.

## Qué ocurre al ejecutar

Un motor moderno no se limita a interpretar cada línea de la misma manera. Analiza el código, produce una representación ejecutable y puede optimizar las partes que se usan con frecuencia mediante compilación JIT (*just in time*). Si las suposiciones de una optimización dejan de cumplirse, el motor puede descartarla.

De forma conceptual, el recorrido incluye:

1. **lectura y análisis léxico:** el texto se separa en unidades significativas;
2. **análisis sintáctico:** se comprueba la gramática y se construye una representación del programa;
3. **creación de ámbitos:** se preparan declaraciones y vínculos;
4. **ejecución:** un intérprete o código generado realiza las operaciones;
5. **observación y optimización:** las rutas frecuentes pueden compilarse con supuestos más específicos;
6. **desoptimización:** si los supuestos dejan de cumplirse, el motor vuelve a una representación general.

Un error de sintaxis aparece antes de ejecutar el bloque afectado:

```js
// const = 10; // SyntaxError
```

Un error de ejecución surge al alcanzar una operación inválida:

```js
const usuario = null;
// usuario.nombre; // TypeError al ejecutar esta línea
```

Un error lógico no necesariamente lanza nada: el programa corre y produce una respuesta equivocada. Las pruebas y ejemplos son esenciales para detectarlo.

La consecuencia práctica no es “programar para el motor”. Es mantener datos y operaciones comprensibles. Primero se escribe código correcto y medible; la optimización prematura suele aumentar complejidad sin demostrar una mejora.

## Interpretación, compilación y transpilación

Las categorías no son excluyentes. Un motor puede interpretar una representación intermedia y compilar partes durante la misma ejecución. “JavaScript es interpretado” describe una visión histórica incompleta; “JavaScript es compilado” también requiere aclarar cuándo y hacia qué representación.

**Transpilar** suele significar transformar código fuente a otro código fuente de un nivel parecido. Una herramienta puede convertir sintaxis moderna a una forma compatible con entornos antiguos. Eso no agrega automáticamente las APIs que el entorno no posee: una sintaxis puede transformarse, mientras que una funcionalidad ausente necesita un *polyfill* o una estrategia alternativa.

## JavaScript y TypeScript

JavaScript tiene tipado dinámico: una variable no queda asociada para siempre a un tipo, aunque cada valor sí tiene uno.

```js
let resultado = 42;
resultado = "cuarenta y dos"; // válido en JavaScript
```

TypeScript agrega un análisis estático que ayuda a detectar inconsistencias antes de ejecutar:

```ts
let resultado: number = 42;
resultado = "cuarenta y dos"; // error del verificador
```

El navegador y Node.js ejecutan JavaScript. Por eso TypeScript se transforma —habitualmente se dice que se transpila— a JavaScript. Sus tipos mejoran las herramientas y documentan contratos, pero desaparecen en tiempo de ejecución. Los datos que llegan desde un formulario, archivo o red siguen necesitando validación real.

## Dos dimensiones que suelen confundirse

**Estático frente a dinámico** pregunta cuándo se comprueban tipos:

- estático: una herramienta razona antes de ejecutar;
- dinámico: las comprobaciones principales ocurren con valores durante la ejecución.

**Fuerte frente a débil** intenta describir cuánto permite el lenguaje mezclar tipos y qué conversiones realiza. No existe una única escala universal. JavaScript conserva distinciones importantes —no puede sumarse directamente `bigint` y `number`, por ejemplo— y también aplica coerciones que sorprenden:

```js
"5" + 1; // "51"
"5" - 1; // 4
```

En lugar de etiquetarlo con una sola palabra, conviene aprender las reglas concretas de cada operador y convertir en los bordes.

## Los tipos atraviesan fronteras

Un formulario entrega texto:

```js
const edadTexto = formulario.elements.edad.value;
```

El frontend puede convertir y mostrar una advertencia. Al serializar JSON, el número viaja sin información de TypeScript. El backend recibe bytes, interpreta JSON y vuelve a validar:

```js
function validarSolicitud(datos) {
  if (!Number.isSafeInteger(datos.edad) || datos.edad < 0) {
    throw new TypeError("Edad inválida");
  }

  return datos;
}
```

Una anotación como `datos: Solicitud` expresa lo que el desarrollador espera; no transforma una entrada desconocida en una solicitud válida.

## Modo estricto

El modo estricto elimina o convierte en errores varios comportamientos históricos problemáticos:

```js
"use strict";
```

Los módulos ECMAScript son estrictos de forma automática. Entre otros efectos, una asignación a un identificador no declarado lanza error y `this` en una llamada de función simple queda `undefined` en lugar de convertirse en el objeto global.

No reemplaza validación ni estilo, pero ofrece una semántica más segura para código moderno.

## Un método productivo para comenzar

Antes de escribir código, respondé cuatro preguntas:

1. ¿Qué datos entran?
2. ¿Qué resultado debe salir?
3. ¿Qué reglas conectan ambos extremos?
4. ¿Qué puede fallar y cómo lo observaremos?

Agregá dos más cuando la solución cruza entornos:

5. ¿En qué anfitrión se ejecuta cada parte y qué APIs necesita?
6. ¿Qué datos atraviesan una frontera y deben volver a validarse?

Después construí la versión más pequeña que recorra el camino completo. Para la inscripción:

```js
const solicitud = { nombre: "Ada", edad: 20 };
const respuesta = evaluarInscripcion(solicitud);
console.log(respuesta);
```

Recién entonces agregá más reglas. Este recorrido vertical entrega evidencia temprana y reduce el costo de corregir una idea equivocada.

## Leer documentación con el modelo de capas

Ante una API, identificá:

- si está definida por ECMAScript, la Web, Node.js o una biblioteca;
- qué versiones del entorno la implementan;
- si es síncrona, devuelve una promesa o usa callbacks;
- qué tipos acepta y produce;
- qué errores o resultados de ausencia forman parte del contrato.

Este hábito evita copiar ejemplos de un anfitrión a otro sin comprender por qué fallan.

## Práctica de cierre

Escribí una función `cotizarEnvio` que reciba peso, distancia y condición de cliente. Definí primero tres ejemplos de entrada con sus salidas esperadas. Luego decidí qué parte podría ejecutarse en el navegador y qué regla debería verificarse otra vez en el servidor.

## Para recordar

- Lenguaje, motor y anfitrión son capas distintas.
- ECMAScript estandariza el núcleo; las APIs del entorno pertenecen a especificaciones y plataformas adicionales.
- Frontend y backend resuelven responsabilidades diferentes.
- TypeScript comprueba tipos durante el desarrollo; no valida datos externos por sí solo.
- Los motores analizan, ejecutan y pueden optimizar; sintaxis, ejecución y lógica fallan en momentos diferentes.
- Un programa productivo comienza por el contrato de entrada y salida, no por una lista de características del lenguaje.
