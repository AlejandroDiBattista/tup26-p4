# JavaScript: qué es, de dónde viene y dónde corre

Programación IV: Desarrollo Web — Etapa 1, fundamentos técnicos
Apunte de la primera clase de JavaScript

Venís de Programación III, donde escribías C# sobre .NET. Ahí el lenguaje y la plataforma se diseñaron juntos, con calma, por un equipo que sabía adónde iba. JavaScript es lo contrario: nació en diez días, para resolver un problema chico, y terminó siendo el lenguaje que corre en cada teléfono, cada navegador y buena parte de los servidores del mundo.

Entender ese origen no es anécdota. Casi todo lo que te va a parecer raro de JavaScript se explica por su historia. Empecemos por ahí.

## De dónde viene JavaScript

### El problema de 1995

En 1995 la web era un montón de documentos. Escribías HTML, el servidor lo mandaba, el navegador lo dibujaba y ahí terminaba todo. Si querías validar que un campo de un formulario no estuviera vacío, tenías que mandar el formulario al servidor, esperar la respuesta y recibir una página nueva que decía "falta el nombre". Cada interacción costaba una ida y vuelta por la red, con módems de 28.800 bits por segundo.

Netscape, la empresa dueña del navegador más usado, quería resolver eso. Necesitaba un lenguaje que corriera dentro del navegador, en la máquina del usuario, para poder reaccionar a lo que la persona hacía sin ir al servidor.

### Diez días de mayo

Netscape contrató a Brendan Eich para escribirlo. La idea original era meter Scheme, un dialecto de Lisp, dentro del navegador. En el camino la empresa cerró un acuerdo con Sun Microsystems, dueña de Java, y la orden cambió: el lenguaje nuevo tenía que parecerse a Java.

Eich escribió el prototipo en diez días, en mayo de 1995. De ahí salió una mezcla poco común:

- la sintaxis de C y Java, con llaves y punto y coma
- las funciones como valores de primera clase, que vienen de Scheme
- los objetos basados en prototipos, que vienen de Self

Esa combinación explica muchas cosas. JavaScript se escribe como Java, pero por dentro piensa como un lenguaje funcional. Los alumnos que esperan encontrar C# con otro nombre chocan justo ahí.

### El nombre

El lenguaje se llamó Mocha, después LiveScript y en diciembre de 1995 pasó a llamarse JavaScript. El cambio fue una decisión de marketing: Java era la tecnología del momento y Netscape quería la asociación.

Java y JavaScript no comparten nada más que las cuatro primeras letras. La confusión sigue viva 30 años después.

### La guerra de navegadores

Microsoft no se quedó mirando. En 1996 hizo ingeniería inversa del lenguaje y sacó JScript en Internet Explorer 3. Era casi igual, pero no del todo, así que el mismo código funcionaba distinto en cada navegador.

Ese fue el problema central de la web durante 15 años. Escribías una página, andaba en Netscape y se rompía en Explorer. La solución de la época era llenar el código de condicionales según el navegador.

### Por qué el lenguaje tiene dos nombres

Sun era dueña de la marca Java, y por lo tanto de JavaScript. Para estandarizar el lenguaje sin pelearse por la marca, Netscape lo llevó en 1996 a ECMA International, un organismo de estandarización. En junio de 1997 salió la primera edición del estándar ECMA-262, con el nombre ECMAScript.

Por eso hoy convive un nombre comercial con un nombre técnico:

- JavaScript es el lenguaje tal como lo conocés y lo nombra todo el mundo
- ECMAScript es el estándar que define qué hace el lenguaje

Cuando alguien dice ES6, ES2015 o ES2022 está hablando de versiones del estándar. Es el mismo lenguaje.

### Los años oscuros

La tercera edición, ES3, salió en 1999 y trajo expresiones regulares y manejo de excepciones. Después el lenguaje se quedó quieto diez años.

La cuarta edición fue un intento ambicioso: clases, módulos, tipado estático opcional. El comité no se puso de acuerdo y en 2008 la abandonó. Vale la pena retener esa idea, porque el tipado estático opcional vuelve más adelante en esta historia con otro nombre.

Mientras tanto la web crecía igual. En 1999 Microsoft agregó a Explorer un objeto llamado XMLHttpRequest para que Outlook Web Access pudiera pedir datos al servidor sin recargar la página. Nadie le dio importancia hasta que Google lo usó en Gmail y en Google Maps. En 2005 alguien le puso nombre a esa técnica, AJAX, y quedó claro que el navegador podía ser algo más que un visor de documentos.

En 2006 apareció jQuery. No era un lenguaje nuevo: era una biblioteca que tapaba las diferencias entre navegadores y hacía tolerable manipular la página. Durante casi una década, aprender JavaScript era en la práctica aprender jQuery.

### 2008: el motor cambia todo

Google lanzó Chrome en septiembre de 2008 con un motor de JavaScript propio llamado V8. V8 no interpretaba el código línea por línea: lo compilaba a código de máquina mientras corría.

El salto de velocidad fue de un orden de magnitud. De golpe se volvió razonable escribir aplicaciones enteras en JavaScript, no ya adornos sobre una página. La competencia respondió y empezó una carrera de rendimiento entre motores que todavía sigue.

En 2009 salió ES5, con modo estricto, soporte de JSON y métodos de arreglos como `map` y `filter`.

### 2009: JavaScript sale del navegador

Ryan Dahl tomó V8, que ya era un motor rápido y estaba disponible como pieza suelta, y lo sacó del navegador. Le agregó una biblioteca para hablar con el sistema operativo y lo llamó Node.js.

Node convirtió a JavaScript en un lenguaje de propósito general. Podías leer archivos, abrir sockets, escribir un servidor HTTP. En 2010 apareció npm, su gestor de paquetes, y con él el ecosistema de bibliotecas más grande que existe hoy.

Ese es el momento en que aparece la idea de full stack: un solo lenguaje del navegador al servidor. Es la premisa de esta materia.

### 2012: TypeScript

Microsoft publicó TypeScript en 2012. Lo diseñó Anders Hejlsberg, el mismo que creó C#, así que no te va a sorprender lo que vas a ver cuando lleguemos ahí.

TypeScript es JavaScript con un sistema de tipos encima. Aquella idea de la fallida cuarta edición, tipado estático opcional, volvió por afuera del estándar.

### 2015: el lenguaje se pone al día

ES6, también llamado ES2015, fue la actualización más grande de la historia del lenguaje: `let` y `const`, funciones flecha, clases, módulos, promesas, plantillas de texto, desestructuración.

Desde entonces el comité publica una versión por año, con los cambios que estén listos. ES2017 trajo `async`/`await`. ES2020 trajo el encadenamiento opcional. Las últimas ediciones agregan mejoras más acotadas, porque el lenguaje ya está maduro.

### Dónde estamos hoy

Node dejó de ser el único entorno del lado del servidor: hoy compiten Deno y Bun, y los proveedores de nube ofrecen entornos livianos que corren JavaScript cerca del usuario. TypeScript se volvió el modo habitual de escribir proyectos grandes. Node incluso ejecuta archivos `.ts` de forma directa, aunque enseguida vamos a ver con qué límite.

Una línea de tiempo para tener a mano:

| Año | Hito |
|---|---|
| 1995 | Brendan Eich escribe el prototipo en Netscape |
| 1996 | Microsoft responde con JScript en Internet Explorer 3 |
| 1997 | Primera edición del estándar ECMA-262 |
| 1999 | ES3: expresiones regulares y excepciones |
| 2005 | AJAX: el navegador pide datos sin recargar la página |
| 2006 | jQuery tapa las diferencias entre navegadores |
| 2008 | Chrome y V8: compilación a código de máquina |
| 2009 | ES5 y Node.js: JavaScript sale del navegador |
| 2012 | TypeScript |
| 2015 | ES6: el lenguaje moderno, y una versión por año |
| 2017 | `async`/`await` |

### Una regla que explica casi todo

El comité que define ECMAScript trabaja con una restricción: no romper la web. Hay miles de millones de páginas publicadas y ninguna se va a corregir. Si un cambio rompe código viejo, no entra.

Por eso JavaScript acumula rarezas en vez de corregirlas. Cuando más adelante veas que `typeof null` devuelve `"object"`, sabé que es un error de 1995 que quedó fijo para siempre. Arreglarlo rompería páginas que hoy funcionan.

## Interpretado, compilado y el punto medio

### Lo único que entiende la máquina

Un procesador ejecuta números: instrucciones binarias propias de su arquitectura. Cualquier lenguaje que escribas, en algún momento, tiene que terminar en esas instrucciones. La pregunta es cuándo pasa eso.

Hay dos respuestas clásicas.

Un lenguaje compilado traduce todo antes de ejecutar. Escribís el código en C, el compilador produce un ejecutable de código de máquina y después lo corrés. La traducción se hace una vez, con todo el tiempo del mundo para optimizar. El costo es que ese binario sirve para una arquitectura y un sistema operativo.

Un lenguaje interpretado no traduce nada por adelantado. Un programa, el intérprete, lee tu código y lo va ejecutando. Empieza al instante y corre en cualquier lado donde exista el intérprete. El costo es la velocidad: el intérprete vuelve a analizar la misma línea cada vez que pasa por ella, y eso dentro de un bucle se paga caro.

### El modelo que ya conocés

.NET no está en ninguno de los dos extremos, y esto ya lo viste en Programación III aunque no le hayas puesto el nombre.

Cuando compilás C#, el compilador no genera código de máquina: genera un lenguaje intermedio, la IL. Ese código intermedio es portable. Recién cuando ejecutás la aplicación, el runtime traduce cada método a código de máquina la primera vez que se lo llama. Esa traducción en el momento de ejecución se llama compilación justo a tiempo, o JIT.

JavaScript llegó al mismo lugar por otro camino.

### Qué hace realmente un motor moderno

Decir que JavaScript es interpretado era cierto hasta 2008. Hoy es una simplificación. Un motor como V8 hace algo bastante más interesante.

Cuando le llega tu código, el motor lo analiza y lo convierte a una representación interna, y de ahí a un bytecode propio. Un intérprete empieza a ejecutar ese bytecode de inmediato, porque en la web lo que importa es que la página responda ya.

Mientras ejecuta, el motor observa. Lleva la cuenta de qué funciones se llaman mucho y con qué tipos de datos. Cuando una función se vuelve frecuente, entra un compilador optimizador que la traduce a código de máquina, aprovechando lo que aprendió.

Ese último punto es la clave. Como el motor vio que una función siempre recibió números, puede generar código de máquina que asume números y saltea todas las verificaciones. El resultado es casi tan rápido como C.

La apuesta tiene un plan de contingencia. Si de repente esa función recibe un texto, la suposición se cae. El motor descarta el código optimizado y vuelve al bytecode. A eso se le llama desoptimización.

### Por qué esto te importa como programador

De acá sale una consecuencia práctica que conviene entender desde el primer día:

```javascript
// El motor ve siempre números y optimiza a fondo
function sumar(a, b) {
  return a + b;
}

for (let i = 0; i < 1000000; i++) {
  sumar(i, i + 1);
}

sumar("hola", "mundo"); // se cae la suposición y hay que desoptimizar
```

Lo mismo pasa con la forma de los objetos. El motor arma internamente una descripción de cada objeto, parecida a una clase, y la reutiliza mientras todos los objetos tengan las mismas propiedades en el mismo orden:

```javascript
// Todos comparten la misma forma interna: el motor accede rapidísimo
const p1 = { nombre: "Ana", edad: 30 };
const p2 = { nombre: "Luis", edad: 25 };

// Esta forma es distinta y obliga al motor a rehacer el trabajo
const p3 = { edad: 40, nombre: "Sol" };
```

La conclusión no es que optimices a mano. Es esta: un código consistente, donde las variables mantienen su tipo y los objetos su forma, corre mucho más rápido. La disciplina que un lenguaje estático te impone, en JavaScript te conviene igual, aunque nadie te obligue.

Con esto ya podés responder con precisión la pregunta del título. JavaScript no se compila por adelantado y no necesita un paso de compilación para ejecutarse: en ese sentido es interpretado. Pero el motor sí compila a código de máquina mientras corre, guiado por lo que observa. Es un lenguaje interpretado con compilación justo a tiempo.

## TypeScript y la transpilación

### Compilar y transpilar

Compilar es traducir de un lenguaje a otro de más bajo nivel: de C# a IL, de C a código de máquina.

Transpilar es traducir entre lenguajes del mismo nivel. El resultado sigue siendo código fuente que una persona puede leer. De TypeScript sale JavaScript, y los dos son lenguajes de alto nivel.

### Qué hace el compilador de TypeScript

TypeScript hace dos trabajos independientes, y confundirlos es el error más común al empezar.

El primero es verificar los tipos. Lee tus anotaciones, deduce las que faltan y te avisa si hay una incoherencia. Ese trabajo produce errores en tu editor y en la terminal.

El segundo es generar el JavaScript. Y ahí hace algo casi decepcionante: borra los tipos.

```typescript
// TypeScript, lo que escribís
interface Contacto {
  nombre: string;
  email: string;
}

function saludar(contacto: Contacto): string {
  return `Hola ${contacto.nombre}`;
}
```

```javascript
// JavaScript, lo que se ejecuta
function saludar(contacto) {
  return `Hola ${contacto.nombre}`;
}
```

La `interface` desapareció por completo. Las anotaciones también. Lo que queda es el JavaScript que habrías escrito igual.

### Los tipos no existen en tiempo de ejecución

Esta es la idea más importante de esta sección, y viene con una diferencia fuerte respecto de C#.

En .NET los tipos viven en el programa que corre. Podés preguntar por el tipo de un objeto en pleno funcionamiento, recorrer sus propiedades y crear instancias por reflexión. El sistema de tipos es parte de la ejecución.

En TypeScript no. Los tipos son andamios: sostienen la obra mientras la construís y se retiran antes de la inauguración. En el momento en que tu código corre, no queda ni rastro de ellos.

De ahí salen dos conclusiones prácticas. La buena: TypeScript no cuesta nada en rendimiento, porque no agrega ni una instrucción. La incómoda: TypeScript no te protege de los datos que entran desde afuera. Volvemos sobre esto al final.

### La otra transpilación

Convertir TypeScript a JavaScript no es el único uso de esta técnica.

Durante años el problema fue otro: escribías JavaScript moderno y tenías que ejecutarlo en navegadores viejos que no lo entendían. Herramientas como Babel resolvían eso transpilando JavaScript nuevo a JavaScript viejo, funciones flecha convertidas en funciones comunes y demás.

Hoy los navegadores se actualizan solos y el problema perdió peso, pero las herramientas quedaron y se volvieron más rápidas. Vas a escuchar nombres como esbuild o swc: hacen el mismo trabajo escritos en lenguajes compilados, y por eso tardan milisegundos donde antes tardaban minutos.

### Una advertencia sobre Node y los archivos .ts

Node hoy ejecuta archivos `.ts` de forma directa. Conviene saber exactamente qué hace: borra los tipos y ejecuta el JavaScript resultante. No los verifica.

O sea que Node acepta sin protestar un archivo TypeScript lleno de errores de tipo. La verificación sigue siendo trabajo del compilador de TypeScript o de tu editor. Ejecutar no es lo mismo que revisar.

## Dónde corre JavaScript

### El lenguaje no sabe hacer nada

Acá hay una idea que suele pasarse por alto y que ordena todo lo demás.

El estándar ECMAScript define el lenguaje: variables, funciones, objetos, clases, promesas, `Math`, `JSON`. Nada más. En el estándar no hay ninguna forma de leer un archivo, mostrar un mensaje, abrir una conexión ni dibujar en la pantalla.

Un JavaScript puro no puede comunicarse con el mundo. Todo lo que interactúa con algo afuera se lo da el entorno que lo hospeda.

Por eso `console.log` no es parte del lenguaje, aunque lo uses todo el tiempo. Lo aporta el entorno.

### El navegador

En el navegador, el entorno es el navegador mismo. Además del motor, te entrega un conjunto de objetos para trabajar con la página y la red:

- `document` y todo el DOM, para leer y modificar la página
- `window`, `localStorage`, `history`
- `fetch`, para pedir datos por HTTP
- `addEventListener`, para reaccionar a lo que hace el usuario

Cada navegador trae su propio motor. Chrome y Edge usan V8, Firefox usa SpiderMonkey y Safari usa JavaScriptCore. Los tres implementan el mismo estándar, así que el lenguaje se comporta igual. Las diferencias que todavía aparecen están en las APIs del entorno, no en el lenguaje.

### Node

Node toma V8 y le arma otro entorno alrededor. No hay `document` ni `window`, porque no hay página. En cambio te da lo que necesita un programa de servidor:

- `fs` para archivos
- `http` para servidores y clientes
- `process` para argumentos, variables de entorno y salida
- acceso al sistema operativo y a la red

Comparemos lo mismo en los dos lados:

```javascript
// Solo en el navegador
document.querySelector("h1").textContent = "Hola";

// Solo en Node
import { readFile } from "node:fs/promises";
const datos = await readFile("contactos.csv", "utf-8");

// En los dos: el lenguaje es el mismo
const contactos = datos.split("\n").map((linea) => linea.split(","));
```

La última línea es la que importa. La lógica es idéntica. Lo que cambia son las herramientas que te presta el entorno.

### Un solo hilo

Node hereda del navegador una decisión de diseño: tu código corre en un solo hilo. No hay hilos ni bloqueos como en C#.

A cambio, ninguna operación de entrada y salida detiene la ejecución. Cuando pedís un archivo o una respuesta HTTP, el trabajo se delega y tu código sigue. Cuando el resultado está listo, un mecanismo llamado bucle de eventos ejecuta el código que quedó esperando.

Ese modelo es la razón por la que Node maneja bien miles de conexiones simultáneas con pocos recursos. Le vamos a dedicar una clase entera; por ahora quedate con la idea.

### El resto del mapa

JavaScript se hospeda en más lugares de los que se suele pensar:

- Deno y Bun, entornos de servidor más nuevos que compiten con Node
- entornos de borde, que corren tu código en servidores repartidos por el mundo, cerca del usuario
- aplicaciones móviles, con React Native
- aplicaciones de escritorio, con Electron
- bases de datos y programas de escritorio que lo usan como lenguaje de extensión

Un mismo lenguaje, muchos entornos. Cuando algo no funciona, la primera pregunta útil casi siempre es la misma: dónde se está ejecutando esto.

## Tipado: estático o dinámico, fuerte o débil

Acá conviene ir despacio, porque son dos preguntas distintas que todo el mundo mezcla.

### Primera pregunta: cuándo se verifican los tipos

Un lenguaje de tipado estático verifica los tipos antes de ejecutar. El compilador conoce el tipo de cada variable y rechaza el programa si encuentra una incoherencia. C#, Java, Go y Rust funcionan así.

```csharp
// C#: esto no compila
int edad = "treinta";
```

Un lenguaje de tipado dinámico verifica los tipos mientras ejecuta. Las variables no tienen tipo: lo tienen los valores. La misma variable puede guardar cualquier cosa en distintos momentos. JavaScript, Python y Ruby funcionan así.

```javascript
// JavaScript: perfectamente válido
let edad = 30;
edad = "treinta";
edad = { años: 30 };
edad = () => 30;
```

### Segunda pregunta: cuánto se permite mezclar

Un lenguaje de tipado fuerte no convierte valores por su cuenta. Si mezclás tipos incompatibles, protesta.

Un lenguaje de tipado débil convierte lo que haga falta para que la operación tenga algún resultado, aunque el resultado no tenga sentido.

Python es dinámico y fuerte, y sirve para ver que los dos ejes son independientes:

```python
# Python: error, se niega a adivinar
"5" + 3
```

```javascript
// JavaScript: sin quejarse
"5" + 3;   // "53"
```

Los cuatro cuadrantes, con ejemplos:

| | Fuerte | Débil |
|---|---|---|
| Estático | C#, Java, Rust | C |
| Dinámico | Python, Ruby | JavaScript, PHP |

JavaScript vive en el rincón más permisivo: dinámico y débil.

### Cómo funciona la conversión implícita

Los ejemplos raros de JavaScript se vuelven predecibles cuando conocés la regla. No es magia ni azar: es un algoritmo, mal elegido pero consistente.

El operador `+` está sobrecargado. Sirve para sumar números y para concatenar textos. Si alguno de los dos operandos es un texto, JavaScript decide que querías concatenar y convierte el otro a texto.

El operador `-` no tiene sentido con textos. Entonces JavaScript convierte los dos operandos a número.

```javascript
"5" + 3;   // "53"  → gana la concatenación
"5" - 3;   // 2     → los dos van a número
"5" * "2"; // 10    → los dos van a número
[] + {};   // "[object Object]"
```

La misma lógica aplica a las comparaciones. El operador `==` convierte antes de comparar; `===` compara sin convertir.

```javascript
1 == "1";    // true
1 === "1";   // false
0 == false;  // true
0 === false; // false
null == undefined;  // true
null === undefined; // false
```

De acá sale la primera regla práctica de la materia: usá siempre `===`. La única excepción razonable es `== null`, que atrapa `null` y `undefined` juntos.

Y una curiosidad que ya anticipamos:

```javascript
typeof null; // "object"
```

Es un error de la implementación original de 1995. Sigue ahí porque corregirlo rompería páginas que hoy funcionan.

### Qué ganás y qué perdés con cada modelo

El tipado dinámico te da velocidad para arrancar. Escribís menos, probás una idea sin declarar nada, escribís funciones que sirven para cualquier cosa que se comporte como corresponde. Para un guion corto, un prototipo o un análisis exploratorio, es una ventaja real.

El precio aparece con el tamaño. Los errores de tipo no se ven hasta que la línea se ejecuta, y a veces esa línea es un caso raro que llega a producción. El editor no sabe qué tiene un objeto, así que no puede autocompletar ni renombrar con seguridad. La única red de contención son las pruebas automatizadas, que tenés que escribir vos.

Mirá este caso, que es el que convence a todo el mundo:

```javascript
function calcularTotal(pedido) {
  return pedido.items.reduce((suma, item) => suma + item.precio, 0);
}
```

Preguntas que el código no responde: ¿qué es un pedido? ¿`items` siempre existe? ¿`precio` es número o texto? Si es texto, `suma + item.precio` concatena y devuelve algo como `"01015"` sin fallar. El error aparece tres pantallas después, cuando alguien intenta mostrar ese total.

El tipado estático invierte el trato. Escribís más al principio y el compilador te contesta antes de ejecutar. Los tipos documentan el código sin que nadie mantenga la documentación. El editor sabe todo, así que autocompleta bien y renombra sin romper nada. Cambiar una función y que el compilador te muestre los quince lugares que hay que tocar es una experiencia que cambia la forma de trabajar en equipo.

El precio es la ceremonia y cierta rigidez. Hay programas correctos que el compilador rechaza porque no logra probar que están bien.

### Por qué JavaScript llegó a TypeScript

Cuando JavaScript servía para validar un formulario, el tipado dinámico era la elección correcta. Nadie iba a montar un sistema de tipos para veinte líneas.

Pero después vino Node, vinieron las aplicaciones de una sola página y de golpe había equipos de veinte personas manteniendo cientos de miles de líneas en un lenguaje sin verificación previa. El modelo dejó de alcanzar.

TypeScript es la respuesta a ese problema, y su diseño está condicionado por una restricción: no se puede cambiar JavaScript. Hay demasiado código escrito. Entonces TypeScript no reemplaza el lenguaje, se le suma como una capa que se verifica antes y se borra después.

Tres consecuencias que se ven en el día a día.

El tipado es gradual. Todo JavaScript válido es TypeScript válido. Podés tipar un archivo y dejar el resto como está, y migrar de a poco.

La inferencia hace casi todo el trabajo. No hace falta anotar cada variable, porque el compilador deduce lo que puede:

```typescript
let nombre = "Ana";        // TypeScript infiere string
nombre = 30;               // error, no compila

const contactos = ["Ana", "Luis"];
contactos.map((c) => c.toUpperCase()); // sabe que c es string
```

El sistema de tipos es estructural, no nominal. Esto es una diferencia grande con C# y conviene tenerla presente. En C#, una clase implementa una interfaz solo si lo declara. En TypeScript alcanza con que la forma coincida:

```typescript
interface Punto {
  x: number;
  y: number;
}

// Nunca se declaró como Punto, pero tiene la forma correcta
const posicion = { x: 10, y: 20 };

function dibujar(p: Punto) {
  console.log(p.x, p.y);
}

dibujar(posicion); // válido
```

### El límite de TypeScript

Volvemos a la idea de que los tipos se borran, porque tiene una consecuencia que causa muchos errores en producción.

TypeScript verifica lo que vos escribís. No puede verificar lo que entra desde afuera.

```typescript
interface Contacto {
  nombre: string;
  email: string;
}

const respuesta = await fetch("/api/contactos");
const contactos: Contacto[] = await respuesta.json();
```

Esa última línea es una promesa que TypeScript te cree sin comprobar nada. `json()` devuelve datos arbitrarios, y vos afirmaste que son un arreglo de contactos. Si el servidor cambió el campo `email` por `correo`, el compilador no se entera y el programa falla al ejecutarse, igual que en JavaScript puro.

Lo mismo pasa con `JSON.parse`, con lo que llega de un formulario, de una base de datos o de un archivo.

La solución es validar en la frontera: revisar los datos externos en el momento en que entran, con código que corre de verdad. Para eso se usan bibliotecas de validación, y lo vamos a ver cuando armemos la API.

Y hay que nombrar la escotilla de escape. El tipo `any` desactiva la verificación:

```typescript
const datos: any = obtenerAlgo();
datos.loQueSea.tampocoExiste(); // TypeScript no dice nada
```

`any` sirve durante una migración. Usado por costumbre, convierte a TypeScript en JavaScript con más ruido.

## Por qué en esta materia empezamos por JavaScript

Podríamos empezar directamente por TypeScript, como hacen muchos cursos. No lo vamos a hacer, por una razón.

TypeScript no es un lenguaje aparte: es JavaScript con verificación previa. Si aprendés TypeScript sin entender qué pasa cuando el código corre, vas a tener un modelo mental equivocado. Vas a creer que los tipos existen en la ejecución, no vas a entender por qué los datos de una API se te escapan del control, y cada error raro va a parecer arbitrario.

Así que primero vamos a entender el lenguaje que se ejecuta. Después le agregamos los tipos y vas a ver, con precisión, qué problema resuelve cada uno.

## Para llevarte de esta clase

- JavaScript nació en 1995 en diez días para validar formularios, y sus rarezas se explican por esa historia y por la regla de no romper la web
- ECMAScript es el nombre del estándar; JavaScript es el nombre del lenguaje
- no necesita compilación previa, pero el motor compila a código de máquina mientras ejecuta, guiado por lo que observa: es interpretado con compilación justo a tiempo
- un código con tipos y formas de objeto consistentes corre más rápido, aunque nadie te obligue a mantenerlo así
- el lenguaje no sabe leer archivos ni dibujar en pantalla: todo eso lo aporta el entorno, sea el navegador o Node
- estático o dinámico responde cuándo se verifican los tipos; fuerte o débil responde cuánto convierte el lenguaje por su cuenta. JavaScript es dinámico y débil
- usá siempre `===`
- TypeScript agrega verificación antes de ejecutar y después borra los tipos: no cuesta rendimiento y no protege de los datos que entran desde afuera

## Para probar antes de la próxima clase

Abrí la consola del navegador con F12 y probá cada expresión. Antes de apretar Enter, escribí qué creés que va a devolver:

1. Evaluá `"5" + 3` y después `"5" - 3`. Explicá la diferencia con la regla de sobrecarga del operador `+`.
2. Evaluá `0.1 + 0.2`. El resultado no es `0.3`; averiguá qué es un número de punto flotante y por qué pasa lo mismo en C#.
3. Evaluá `[] == false` y `[] === false`. Seguí el camino de conversión que aplica cada operador.
4. Evaluá `NaN === NaN` y buscá qué hace `Number.isNaN`.
5. Declará `let x = 5`, después `x = "cinco"`, y en cada paso evaluá `typeof x`.
6. Escribí en la consola `typeof document` y `typeof window`. Después buscá qué devolverían esas mismas expresiones en Node.
