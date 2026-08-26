# Funciones en JavaScript

Programación IV: Desarrollo Web — Etapa 1, fundamentos técnicos
Apunte de la quinta clase de JavaScript

Hasta ahora escribimos instrucciones que se ejecutan de arriba abajo. Guardamos datos en variables, los recorrimos con bucles y decidimos con `if`. Con eso alcanza para resolver un problema, pero no para escribir un programa.

El problema aparece cuando el mismo cálculo se repite en tres lugares con pequeñas diferencias. Podés copiarlo tres veces, y entonces cada corrección hay que hacerla tres veces, y tarde o temprano una se olvida.

Una función resuelve eso de dos maneras a la vez. Le pone un nombre a un cálculo, así que podés invocarlo en vez de repetirlo. Y separa lo que es fijo de lo que varía, así que un solo cálculo sirve para muchos casos.

Este apunte arranca por ahí, pero no termina ahí. En JavaScript una función es además un valor como cualquier otro, y esa idea es la base de todo lo que viene después: las clausuras, las funciones de orden superior y la forma de trabajar con colecciones que vas a usar en el resto de la materia.

## Del código repetido a la función

Mirá este código:

```js
const precioCamisa = 1500;
const totalCamisa = precioCamisa + precioCamisa * 0.21;

const precioPantalon = 2300;
const totalPantalon = precioPantalon + precioPantalon * 0.21;
```

Hay una idea repetida: sumar el impuesto. Lo que cambia entre los dos casos es un solo dato.

Una función captura la idea y deja afuera el dato:

```js
function conIva(precio) {
  return precio + precio * 0.21;
}

conIva(1500); // 1815
conIva(2300); // 2783
```

Eso que quedó afuera se llama parámetro. Es el agujero que dejaste en el cálculo para que quien lo use lo llene.

Fijate qué ganaste. Si mañana el impuesto cambia, lo cambiás en un lugar. Si el cálculo tiene un error, el error está en un lugar. Y el nombre `conIva` explica la intención, cosa que la fórmula suelta no hacía.

## Una función es un valor

Acá viene el primer principio del que cuelga todo el resto.

En JavaScript, una función no es una construcción especial del lenguaje que solo se puede declarar y llamar. Es un valor, del mismo modo que `42` es un valor y `"hola"` es un valor.

Eso significa que podés hacer con una función todo lo que hacés con cualquier otro dato:

```js
const doble = function (n) {
  return n * 2;
};

typeof doble; // "function"

const alias = doble; // guardarla en otra variable
alias(21); // 42

const operaciones = [doble, conIva]; // meterla en un arreglo
operaciones[0](21); // 42

const calculadora = { doble }; // meterla en un objeto
calculadora.doble(21); // 42
```

Volvé al modelo mental de la clase de variables: la variable no es una caja, es una flecha que apunta a un valor. Con las funciones vale igual. `doble` es una flecha que apunta a una función, y `alias` es otra flecha que apunta a la misma función. No se copió nada.

Que una función sea un valor no es un detalle de escritura. Es lo que permite que una función reciba a otra como argumento, o que devuelva una función nueva. En muchos lenguajes eso hay que habilitarlo con alguna construcción especial. Acá no hace falta ninguna, porque la función ya es un dato.

Guardá esta idea, porque las dos secciones más importantes del apunte, clausuras y orden superior, son consecuencias directas de ella.

## Las tres formas de escribir una función

Hay tres formas, y la diferencia entre ellas no es de estilo.

La declaración es la clásica:

```js
function sumar(a, b) {
  return a + b;
}
```

La expresión guarda una función anónima en una variable:

```js
const sumar = function (a, b) {
  return a + b;
};
```

Y la expresión con nombre le pone un nombre a la función, además del nombre de la variable:

```js
const sumar = function sumarDosNumeros(a, b) {
  return a + b;
};
```

Ese nombre interno sirve para dos cosas: aparece en los mensajes de error, que se vuelven mucho más legibles, y permite que la función se llame a sí misma aunque después cambies la variable.

La cuarta forma, la flecha, tiene su propia sección porque no es solo otra sintaxis.

## Por qué una anda antes de estar escrita

Probá esto:

```js
saludar("Ada"); // "Hola, Ada"

function saludar(nombre) {
  console.log(`Hola, ${nombre}`);
}
```

Y después probá esto:

```js
despedir("Ada"); // ReferenceError

const despedir = function (nombre) {
  console.log(`Chau, ${nombre}`);
};
```

La diferencia es el izado, que ya vimos con `var`, `let` y `const`. Antes de ejecutar un bloque, el motor lo recorre y registra lo que hay adentro.

Las declaraciones de función se registran completas, con su cuerpo incluido. Por eso podés llamarlas desde arriba.

Las expresiones no. Ahí lo que se registra es la variable, con las reglas de `const`: existe pero no se puede tocar hasta que la ejecución pasa por su línea.

En la práctica esto no cambia mucho si ordenás el código de forma razonable. Conviene conocerlo porque explica un error que de otro modo parece imposible.

## La forma flecha

La flecha es una sintaxis más corta para escribir una función, y se convirtió en la forma habitual de pasar una función como argumento.

Empecemos por la versión completa, que es igual a una expresión de función con otra escritura:

```js
const sumar = (a, b) => {
  return a + b;
};
```

A partir de ahí vienen las abreviaturas, y conviene verlas una por una porque se combinan.

Si el cuerpo es una sola expresión, sacás las llaves y el `return`. El valor de la expresión se devuelve solo:

```js
const sumar = (a, b) => a + b;
```

Si hay un solo parámetro, podés sacar los paréntesis:

```js
const doble = (n) => n * 2;
const doble = n => n * 2; // las dos son válidas
```

Muchos equipos escriben siempre los paréntesis por consistencia, y porque TypeScript los va a necesitar cuando le pongas el tipo al parámetro. Nosotros vamos a usarlos siempre.

Si no hay parámetros, los paréntesis vacíos son obligatorios:

```js
const ahora = () => new Date();
```

Y acá está la trampa que a todos les pasa una vez. Si querés devolver un objeto literal con la forma corta, tenés que envolverlo en paréntesis:

```js
const crear = (nombre) => { nombre: nombre }; // devuelve undefined
const crear = (nombre) => ({ nombre: nombre }); // correcto
```

La razón es que las llaves son ambiguas. En el primer caso el motor las lee como el cuerpo de la función, no como un objeto. Los paréntesis le sacan la duda.

Las flechas se pueden encadenar, lo que hace que una función devuelva otra con muy poca ceremonia:

```js
const multiplicar = (a) => (b) => a * b;
```

Eso se lee "dame un `a` y te devuelvo una función que espera un `b`". Volvemos sobre ese patrón al final.

## Lo que la flecha no tiene

Una flecha no es solo azúcar sintáctica. Le faltan cosas a propósito.

No tiene `this` propio. Usa el del lugar donde fue escrita.

No tiene `arguments`.

No se puede usar con `new`, así que no sirve como constructor.

De esas tres, la primera es la que importa, y es la razón por la que las flechas se inventaron. Vamos a verla en detalle en la clase de objetos, pero la situación es esta:

```js
const contador = {
  cuenta: 0,

  arrancarMal() {
    setInterval(function () {
      this.cuenta++; // this no es el contador
    }, 1000);
  },

  arrancarBien() {
    setInterval(() => {
      this.cuenta++; // this sigue siendo el contador
    }, 1000);
  },
};
```

Una función clásica recibe su `this` de cómo la llaman, y a la función que le pasás a `setInterval` la llama el temporizador. Una flecha no tiene `this` propio, así que usa el de afuera, que es el que vos esperabas.

La regla práctica, mientras tanto: usá flechas para funciones que pasás como argumento, y funciones clásicas o métodos para las que son parte de un objeto.

## El alcance de las variables

El alcance de una variable es la parte del código donde ese nombre significa algo.

JavaScript usa alcance léxico, que también se llama estático. Quiere decir que el alcance se decide por dónde está escrito el código, y no por quién llama a quién en tiempo de ejecución. Podés determinar el alcance de cada variable mirando el archivo, sin ejecutarlo.

Hay tres niveles.

El alcance global es el de las variables declaradas fuera de todo. Existen en todo el programa.

El alcance de función es el de las variables declaradas con `var`. Viven en la función entera, sin importar en qué bloque las declaraste.

El alcance de bloque es el de `let` y `const`. Viven entre las llaves donde fueron declaradas.

```js
function ejemplo() {
  if (true) {
    var conVar = "vivo en toda la función";
    let conLet = "vivo solo en este bloque";
  }

  console.log(conVar); // funciona
  console.log(conLet); // ReferenceError
}
```

Por eso usamos `const` por omisión y `let` cuando hace falta reasignar. `var` quedó para leer código viejo.

## La cadena de alcances

Cuando el motor encuentra un nombre, lo busca primero en el bloque actual. Si no está, sale al bloque de afuera. Si tampoco está, sigue saliendo hasta llegar al alcance global. Si ahí tampoco está, tira `ReferenceError`.

```js
const iva = 0.21; // global

function facturar(precio) {
  const descuento = 0.1; // alcance de la función

  if (precio > 1000) {
    const extra = 0.05; // alcance del bloque
    return precio * (1 + iva) * (1 - descuento - extra);
  }

  return precio * (1 + iva) * (1 - descuento);
}
```

Adentro del `if` se ven las tres. Afuera del `if` ya no se ve `extra`. Afuera de la función solo se ve `iva`.

La búsqueda va siempre hacia afuera, nunca hacia adentro. Una función no puede ver las variables locales de otra función, aunque la llame.

Si un nombre se repite en dos niveles, gana el más cercano y el de afuera queda tapado:

```js
const nombre = "global";

function saludar() {
  const nombre = "local";
  console.log(nombre); // "local"
}
```

Eso se llama sombreado. No es un error, pero conviene evitarlo cuando confunde.

## La clausura

Ahora juntá dos cosas que ya sabemos. Una función es un valor, así que puede sobrevivir al lugar donde nació. Y el alcance es léxico, así que la función sabe qué variables la rodeaban cuando se escribió.

La pregunta es qué pasa cuando la función sale de ahí y esas variables, en teoría, ya deberían haber desaparecido.

```js
function contador() {
  let cuenta = 0;

  return () => ++cuenta;
}

const siguiente = contador();

siguiente(); // 1
siguiente(); // 2
siguiente(); // 3
```

La función `contador` terminó de ejecutarse en la primera línea de uso. Su variable `cuenta` debería haberse ido con ella. Sin embargo sigue viva, y encima recuerda su valor entre llamadas.

Eso es una clausura: una función junto con el entorno donde fue creada.

El mecanismo es más simple de lo que parece. Mientras exista una referencia a la función interna, el entorno que esa función necesita no se puede liberar. No es magia ni una excepción a las reglas: es la consecuencia de que el alcance sea léxico y de que las funciones sean valores.

Y cada llamada crea un entorno nuevo:

```js
const a = contador();
const b = contador();

a(); // 1
a(); // 2
b(); // 1
```

`a` y `b` no comparten nada. Son dos clausuras distintas sobre dos variables `cuenta` distintas.

## Para qué sirve una clausura

Tres usos que vas a escribir en la materia.

El primero es guardar estado privado. Las variables de la clausura no se pueden tocar desde afuera, porque no hay ningún nombre que las alcance:

```js
function crearAgenda() {
  const contactos = [];

  return {
    agregar(contacto) {
      contactos.push(contacto);
      return contactos.length;
    },

    listar() {
      return [...contactos];
    },
  };
}

const agenda = crearAgenda();
agenda.agregar({ nombre: "Ada" });
agenda.listar(); // [{ nombre: "Ada" }]
agenda.contactos; // undefined
```

Esto es encapsulamiento, y lo conseguiste sin clases ni ninguna sintaxis especial. La variable es inalcanzable porque no existe, fuera de la función, ningún nombre que llegue hasta ella. Fijate el detalle de `listar`, que devuelve una copia: si devolviera el arreglo original, cualquiera podría modificarlo desde afuera y la privacidad sería falsa.

El segundo es fabricar funciones configuradas:

```js
function conImpuesto(tasa) {
  return (precio) => precio * (1 + tasa);
}

const conIva = conImpuesto(0.21);
const conIngresosBrutos = conImpuesto(0.035);

conIva(1000); // 1210
```

La tasa queda fija adentro de la función devuelta. No hay que pasarla en cada llamada.

El tercero es recordar resultados para no recalcularlos:

```js
function memorizar(fn) {
  const cache = new Map();

  return (arg) => {
    if (!cache.has(arg)) cache.set(arg, fn(arg));
    return cache.get(arg);
  };
}
```

El `Map` que vimos en tipos compuestos vive en la clausura. Cada función memorizada tiene el suyo.

## El bucle que devuelve tres veces lo mismo

Este es el bug de clausuras más famoso, y sirve para entender el mecanismo por el lado del error:

```js
const acciones = [];

for (var i = 0; i < 3; i++) {
  acciones.push(() => console.log(i));
}

acciones[0](); // 3
acciones[1](); // 3
acciones[2](); // 3
```

Uno espera 0, 1 y 2. Salen tres treses.

La causa es el alcance de `var`. Hay una sola variable `i` para toda la función, así que las tres flechas capturaron la misma variable, no tres copias de su valor. Cuando se ejecutan, el bucle ya terminó y esa única `i` vale 3.

Cambiá `var` por `let` y anda:

```js
for (let i = 0; i < 3; i++) {
  acciones.push(() => console.log(i));
}
// 0, 1, 2
```

`let` crea una variable nueva en cada vuelta del bucle, así que cada flecha captura la suya. Esta es la razón concreta por la que dejamos `var` atrás, y muestra que una clausura captura variables, no valores.

## Cómo recibe los parámetros

JavaScript no controla la cantidad de argumentos. Si faltan, los parámetros que sobran valen `undefined`. Si sobran, se ignoran:

```js
function saludar(nombre, saludo) {
  return `${saludo}, ${nombre}`;
}

saludar("Ada"); // "undefined, Ada"
saludar("Ada", "Hola", "de más"); // "Hola, Ada"
```

Nada te avisa. No hay ningún control que compare la llamada con la declaración, ni cuando escribís el código ni cuando se ejecuta. Contemplar los argumentos que faltan es responsabilidad tuya.

Para eso están los valores por omisión:

```js
function saludar(nombre, saludo = "Hola") {
  return `${saludo}, ${nombre}`;
}

saludar("Ada"); // "Hola, Ada"
```

El valor por omisión se evalúa en cada llamada, no una sola vez al definir la función. Por eso este código es seguro y devuelve una lista nueva siempre:

```js
function agregar(item, lista = []) {
  lista.push(item);
  return lista;
}
```

Y como se evalúa en el momento, un parámetro puede usar a los anteriores:

```js
function rango(desde, hasta = desde + 10) {
  return [desde, hasta];
}

rango(5); // [5, 15]
```

Cuando la cantidad de argumentos es variable, juntalos con el resto:

```js
function sumar(...numeros) {
  return numeros.reduce((total, n) => total + n, 0);
}

sumar(1, 2, 3, 4); // 10
```

`...numeros` es un arreglo de verdad, con todos sus métodos. Va siempre último y solo puede haber uno por función.

Vas a encontrar `arguments` en código viejo, que es un objeto parecido a un arreglo con todos los argumentos. No lo uses: no es un arreglo, y las flechas no lo tienen.

## Parámetros con nombre

Una función con cinco parámetros es una función que nadie puede llamar sin mirar la firma:

```js
crearContacto("Ada", "ada@ejemplo.com", true, false, "clientes");
```

Nadie sabe qué significan ese `true` y ese `false`, y para averiguarlo hay que ir a leer la declaración. JavaScript no permite nombrar los argumentos en la llamada, pero combinando la desestructuración con los valores por omisión se consigue el mismo efecto:

```js
function crearContacto({
  nombre,
  email,
  activo = true,
  favorito = false,
  etiqueta = "general",
} = {}) {
  return { nombre, email, activo, favorito, etiqueta };
}

crearContacto({
  nombre: "Ada",
  email: "ada@ejemplo.com",
  favorito: true,
});
```

Ahora la llamada se lee sola, el orden dejó de importar y agregar una opción nueva no rompe el código existente.

El `= {}` del final es importante: permite llamar a la función sin argumentos. Sin él, `crearContacto()` intentaría desestructurar `undefined` y tiraría un error.

Este patrón es el que vas a ver en casi todas las librerías modernas, y conviene adoptarlo apenas una función pasa de 3 parámetros. Vale la pena mirarlo despacio, porque es exactamente la sintaxis con la que vas a escribir componentes cuando lleguemos a React.

## Cómo funciona la desestructuración en un parámetro

Estas dos funciones hacen lo mismo:

```js
function mostrar(contacto) {
  const nombre = contacto.nombre;
  const email = contacto.email;
  console.log(`${nombre}: ${email}`);
}

function mostrar({ nombre, email }) {
  console.log(`${nombre}: ${email}`);
}
```

La segunda ahorra dos líneas, pero lo importante es entender qué son esas llaves, porque confunden la primera vez.

Las llaves en la lista de parámetros no crean un objeto. Son un patrón que describe la forma del objeto que va a llegar, y le dice al motor qué propiedades sacar y con qué nombre guardarlas. Los nombres de adentro tienen que coincidir con los de las propiedades.

La función sigue recibiendo un solo argumento. La desestructuración no convierte un objeto en varios parámetros: solo desarma el objeto apenas entra.

## Renombrar, valores por omisión y anidamiento

Podés guardar una propiedad con otro nombre. A la izquierda va la propiedad que llega, a la derecha el nombre local que querés usar:

```js
function mostrar({ nombre: nombreCompleto, email: correo }) {
  console.log(nombreCompleto, correo);
}
```

Se lee al revés de lo que uno espera, y es la parte que más cuesta. Sirve cuando el nombre que llega es feo, o cuando choca con una variable que ya tenés.

Cada propiedad puede tener su valor por omisión:

```js
function mostrar({ nombre, activo = true, etiqueta = "general" }) {}
```

Ese valor entra en juego solo si la propiedad es `undefined`. Con `null`, con `0` o con una cadena vacía no se aplica, porque esos son valores presentes:

```js
mostrar({ nombre: "Ada", activo: null }); // activo queda en null
```

Si el objeto tiene objetos adentro, el patrón se anida igual:

```js
function enviar({ asunto, destinatario: { nombre, email } }) {
  console.log(`${asunto} para ${nombre} <${email}>`);
}
```

Acá hay dos trampas. La primera es que eso no crea ninguna variable `destinatario`: al ponerle dos puntos, `destinatario` pasa a ser el camino, no el destino. Si necesitás las dos cosas, nombralo dos veces:

```js
function enviar({ destinatario, destinatario: { email } }) {}
```

La segunda es que si `destinatario` no viene, el patrón intenta desarmar `undefined` y la función explota. Se cubre con un valor por omisión en el nivel de adentro:

```js
function enviar({ destinatario: { email } = {} }) {}
```

Esa es la misma idea del `= {}` que pusimos al final del patrón completo, aplicada un nivel más abajo.

## Juntar el resto de las propiedades

Dentro de un patrón de objeto, los tres puntos juntan todo lo que no nombraste en un objeto nuevo:

```js
function crearBoton({ texto, alHacerClic, ...resto }) {
  console.log(texto); // "Guardar"
  console.log(resto); // { tipo: "submit", ancho: "100%" }
}

crearBoton({
  texto: "Guardar",
  alHacerClic: guardar,
  tipo: "submit",
  ancho: "100%",
});
```

Es la misma sintaxis de los parámetros rest, pero adentro del patrón. Sirve para tomar las propiedades que te interesan y pasar el resto a otro lado sin enumerarlas.

## Desestructurar arreglos en los parámetros

Los arreglos se desarman igual, pero con corchetes y por posición en vez de por nombre:

```js
function distancia([x1, y1], [x2, y2]) {
  return Math.hypot(x2 - x1, y2 - y1);
}

distancia([0, 0], [3, 4]); // 5
```

También admite valores por omisión, saltear posiciones con una coma de más y juntar el resto:

```js
function podio([oro, , bronce = "vacante", ...resto]) {}
```

Se usa menos que la de objetos, con una excepción enorme que vemos ahora mismo.

## La sintaxis que vas a usar en React

Un componente de React es una función. Recibe un solo objeto con todo lo que le pasaron desde afuera, y a ese objeto se lo llama props por convención.

Sin desestructurar, se ve así:

```js
function Boton(props) {
  return <button onClick={props.alHacerClic}>{props.texto}</button>;
}
```

Y desestructurando el parámetro, así:

```js
function Boton({ texto, alHacerClic }) {
  return <button onClick={alHacerClic}>{texto}</button>;
}
```

No mires todavía la sintaxis de las etiquetas, que la vemos entera en la unidad de React. Mirá solo la lista de parámetros, que es lo que ya sabés leer.

Las dos versiones funcionan, y la segunda es la que vas a encontrar en todos lados. La razón no es que ahorre teclas: es que la lista de parámetros pasa a ser la documentación del componente. Leés la primera línea y sabés qué acepta.

Con valores por omisión, esa primera línea dice todavía más:

```js
function Boton({
  texto,
  alHacerClic,
  variante = "primario",
  deshabilitado = false,
}) {}
```

Ahí queda escrito, en un solo lugar, qué es obligatorio y qué es opcional con su valor por omisión.

React usa además una propiedad especial llamada `children`, que contiene lo que haya entre la etiqueta de apertura y la de cierre:

```js
function Tarjeta({ titulo, children }) {
  return (
    <section>
      <h2>{titulo}</h2>
      {children}
    </section>
  );
}
```

Y el resto de las propiedades es el mecanismo con el que un componente propio reenvía a la etiqueta de adentro todo lo que no le interesa a él:

```js
function Entrada({ etiqueta, ...resto }) {
  return (
    <label>
      {etiqueta}
      <input {...resto} />
    </label>
  );
}

<Entrada etiqueta="Email" type="email" required placeholder="tu@correo.com" />;
```

Mirá las dos apariciones de los tres puntos, porque son las dos caras de la misma idea. En el parámetro juntan lo que no nombraste. En la etiqueta lo reparten de nuevo, propiedad por propiedad, sobre el `input`. El componente se ocupa de la etiqueta visible y deja pasar `type`, `required` y `placeholder` sin saber que existían.

Falta una pieza, y es la desestructuración de arreglos:

```js
const [contactos, setContactos] = useState([]);
```

`useState` devuelve un arreglo de dos elementos: el valor actual y la función que lo cambia. La desestructuración les pone nombre a los dos en una línea.

Y acá se ve por qué devuelve un arreglo y no un objeto. Como la desestructuración de arreglos es por posición, vos elegís los nombres. En un mismo componente podés escribir `useState` cinco veces y llamar a cada par como corresponda. Con un objeto habría que renombrar las mismas dos propiedades en cada llamada.

## Cómo se pasan los argumentos

JavaScript pasa siempre una copia del valor. Lo que confunde es que en los objetos el valor es la flecha, no el objeto.

Con primitivos, la función trabaja sobre una copia y afuera no cambia nada:

```js
function incrementar(n) {
  n++;
  return n;
}

let cuenta = 5;
incrementar(cuenta); // 6
cuenta; // 5
```

Con objetos, la función recibe una flecha nueva que apunta al mismo objeto. Si modificás el objeto, el cambio se ve afuera:

```js
function activar(contacto) {
  contacto.activo = true;
}

const ada = { nombre: "Ada", activo: false };
activar(ada);
ada.activo; // true
```

Pero si reasignás el parámetro, solo estás moviendo tu propia flecha, y afuera no pasa nada:

```js
function reemplazar(contacto) {
  contacto = { nombre: "Otro" };
}

reemplazar(ada);
ada.nombre; // "Ada"
```

Es la misma distinción entre mutar y reasignar que vimos con `const` y con la copia de arreglos. Vale igual acá.

La consecuencia práctica: una función que modifica los objetos que recibe es más difícil de razonar. Cuando puedas, devolvé un objeto nuevo en vez de tocar el que te dieron.

## Cómo devuelve valores

Una función devuelve un valor con `return`. Si no hay `return`, o si hay un `return` pelado, devuelve `undefined`:

```js
function sinNada() {}
sinNada(); // undefined
```

`return` corta la ejecución en el acto. Eso habilita el estilo de guardas que vimos en estructuras de control:

```js
function descuento(cliente) {
  if (!cliente) return 0;
  if (!cliente.activo) return 0;
  if (cliente.compras < 3) return 0;

  return 0.15;
}
```

Cada caso raro se resuelve y se sale. Lo que queda al final es el caso normal, sin anidamiento.

Hay una trampa con el punto y coma automático. Esto devuelve `undefined`:

```js
function crear() {
  return
  {
    ok: true;
  }
}
```

El motor inserta un punto y coma después del `return`, porque `return` no puede tener un salto de línea antes de su valor. La llave se queda sola y nunca se ejecuta. Poné siempre el valor en la misma línea que el `return`.

Para devolver varios valores hay dos caminos. Con un objeto, si los datos tienen nombre propio:

```js
function analizar(texto) {
  return {
    palabras: texto.split(/\s+/).length,
    caracteres: texto.length,
  };
}

const { palabras, caracteres } = analizar("hola mundo");
```

Con un arreglo, si el orden es lo natural y quien lo recibe va a querer renombrarlos:

```js
function dividir(a, b) {
  return [Math.floor(a / b), a % b];
}

const [cociente, resto] = dividir(17, 5);
```

En los dos casos, la desestructuración del otro lado es lo que hace que se lea bien.

## Las funciones de orden superior

Una función de orden superior es una función que recibe funciones como argumento, devuelve una función, o las dos cosas.

No es una categoría especial del lenguaje. Es lo que pasa naturalmente cuando las funciones son valores: si podés pasar un número, podés pasar una función.

El caso de recibirlas es el más común. Lo venís usando sin darle nombre:

```js
[3, 1, 2].sort((a, b) => a - b);
boton.addEventListener("click", () => console.log("clic"));
setTimeout(() => console.log("después"), 1000);
```

En los tres casos, la función que pasás describe qué hacer, y la función de orden superior decide cuándo y cuántas veces hacerlo. Esa división de trabajo es la idea central.

El caso de devolverlas ya lo vimos con las clausuras. Sirve para configurar una función antes de usarla:

```js
const porCampo = (campo) => (a, b) => a[campo].localeCompare(b[campo]);

contactos.sort(porCampo("nombre"));
contactos.sort(porCampo("ciudad"));
```

Y las dos cosas juntas dan los envoltorios, que agregan comportamiento a una función sin tocarla:

```js
function conTiempo(fn) {
  return (...args) => {
    const inicio = performance.now();
    const resultado = fn(...args);
    console.log(`${fn.name} tardó ${(performance.now() - inicio).toFixed(1)}ms`);
    return resultado;
  };
}

const buscarConTiempo = conTiempo(buscarContactos);
```

La función original no se enteró de nada. Este patrón es el que usan por dentro los middleware de Express, que vamos a ver más adelante.

## Las colecciones como una cadena de pasos

Los arreglos traen una familia de métodos que reciben una función. Todos siguen la misma idea: vos escribís qué hacer con un elemento, y el método se encarga de recorrer.

Tres cubren casi todo, y el resto son variantes.

`filter` selecciona. Recibe una función que responde sí o no, y devuelve un arreglo con los elementos que dijeron que sí.

`map` transforma. Recibe una función que convierte un elemento en otra cosa, y devuelve un arreglo del mismo largo con los resultados.

`reduce` resume. Recibe una función que combina lo acumulado con el elemento siguiente, y devuelve un solo valor.

Tomemos estos datos:

```js
const contactos = [
  { nombre: "Ada Lovelace", ciudad: "Tucumán", compras: 5, activo: true },
  { nombre: "Grace Hopper", ciudad: "Salta", compras: 2, activo: true },
  { nombre: "Alan Turing", ciudad: "Tucumán", compras: 8, activo: false },
  { nombre: "Edsger Dijkstra", ciudad: "Salta", compras: 1, activo: true },
];
```

Como cada método devuelve un arreglo, se pueden encadenar. Cada eslabón recibe lo que devolvió el anterior:

```js
const resultado = contactos
  .filter((c) => c.activo)
  .toSorted((a, b) => a.nombre.localeCompare(b.nombre))
  .map((c) => c.nombre);

// ["Ada Lovelace", "Edsger Dijkstra", "Grace Hopper"]
```

Eso se lee como una receta de arriba abajo: quedate con los activos, ordenalos por nombre, quedate solo con el nombre. Escribí la misma consulta con un bucle, un `if` adentro y un arreglo auxiliar, y vas a ver por qué esta forma se impuso.

Dos detalles del ejemplo. `toSorted` devuelve un arreglo nuevo, mientras que `sort` ordena el original en el lugar. Y `localeCompare` es lo que ordena bien los acentos y la eñe, cosa que comparar con `<` no hace.

## La familia completa

| Método | Qué hace | Qué devuelve |
|---|---|---|
| `filter` | se queda con los que cumplen una condición | un arreglo |
| `map` | transforma cada elemento | un arreglo del mismo largo |
| `flatMap` | transforma cada elemento y aplana un nivel | un arreglo |
| `reduce` | combina todos los elementos en un solo valor | lo que devuelvas |
| `toSorted` | ordena según un comparador | un arreglo nuevo |
| `toReversed` | invierte el orden | un arreglo nuevo |
| `find` | busca el primero que cumple | el elemento, o `undefined` |
| `findIndex` | busca la posición del primero que cumple | un número, o `-1` |
| `some` | pregunta si al menos uno cumple | `true` o `false` |
| `every` | pregunta si todos cumplen | `true` o `false` |
| `includes` | pregunta si un valor está | `true` o `false` |
| `slice` | corta un tramo | un arreglo |
| `at` | devuelve el elemento de una posición, y acepta negativos | el elemento |
| `Object.groupBy` | agrupa según una clave calculada | un objeto de arreglos |

Algunos en acción:

```js
// sumar una propiedad de todos
contactos.reduce((total, c) => total + c.compras, 0); // 16

// agrupar por ciudad
Object.groupBy(contactos, (c) => c.ciudad);
// { Tucumán: [...], Salta: [...] }

// quedarse con las ciudades sin repetir
[...new Set(contactos.map((c) => c.ciudad))]; // ["Tucumán", "Salta"]

// preguntar por el conjunto entero
contactos.some((c) => c.compras > 5); // true
contactos.every((c) => c.activo); // false
```

`reduce` es el que más cuesta al principio, así que vale detenerse. Su función recibe dos cosas: lo acumulado hasta ahora y el elemento actual. Lo que esa función devuelve pasa a ser lo acumulado de la vuelta siguiente. El segundo argumento de `reduce`, ese `0` del ejemplo, es el valor inicial del acumulador. No lo omitas nunca: sin él, un arreglo vacío tira error.

## Cada paso arma un arreglo nuevo

Estos métodos hacen su trabajo en el momento. `filter` no anota la condición para aplicarla más tarde: recorre el arreglo entero, arma uno nuevo y lo devuelve.

En una cadena, eso significa un recorrido completo por eslabón:

```js
contactos
  .filter((c) => c.activo)
  .map((c) => c.nombre)
  .filter((n) => n.startsWith("A"));
```

Ese código recorre tres veces y crea dos arreglos intermedios que se usan una vez y se tiran.

Con cuatro contactos no importa. Con cuatro millones sí, y ahí hay dos salidas. Una es hacer todo el trabajo en un solo `reduce`. La otra es usar un generador, que produce un valor por vez, recién cuando se lo piden:

```js
function* soloActivos(items) {
  for (const item of items) {
    if (item.activo) yield item;
  }
}

for (const contacto of soloActivos(contactos)) {
  console.log(contacto.nombre);
}
```

Ahí no se arma ningún arreglo intermedio. Cada contacto se produce y se consume antes de que se calcule el siguiente. El generador funciona en el `for...of` gracias al `Symbol.iterator` que vimos en el apunte de símbolos.

Una aclaración más, que va a importar cuando lleguemos a bases de datos: todos estos métodos trabajan sobre datos que ya están en memoria. Filtrar del lado del servidor va a ser una decisión que escribas en la consulta. `filter` no puede hacerlo por vos, porque para filtrar necesita que los datos hayan viajado enteros hasta acá.

## Cuándo encadenar y cuándo no

El encadenamiento se lee muy bien mientras cada paso tenga un propósito claro. Tres o cuatro eslabones está bien. Diez, no.

Cuando una cadena se vuelve difícil de seguir, cortala en variables con nombre:

```js
const activos = contactos.filter((c) => c.activo);
const deTucuman = activos.filter((c) => c.ciudad === "Tucumán");
const nombres = deTucuman.map((c) => c.nombre);
```

Los nombres intermedios documentan lo que pasa mejor que cualquier comentario.

Y una recomendación que vale para todas estas funciones: la función que le pasás no debería modificar nada de afuera. `map` existe para transformar, no para provocar efectos. Si adentro de un `map` estás escribiendo en otro arreglo o tocando el DOM, lo que necesitás es un `for...of`.

## Ejercicios

1. Escribí `promedio(...numeros)` con parámetros rest, que devuelva 0 si no recibe ninguno. Resolvela con `reduce`.
2. Convertí estas tres funciones a la forma flecha con la abreviatura más corta posible que siga siendo legible: una que suma dos números, una que devuelve un objeto con el nombre recibido, y una sin parámetros que devuelve la fecha de hoy.
3. Escribí `crearRegistro()` que devuelva un objeto con los métodos `anotar(mensaje)` y `verTodo()`, donde el arreglo de mensajes sea inaccesible desde afuera. Demostrá con código que no se puede tocar.
4. Explicá sin ejecutar qué imprime este código y por qué: `const fns = []; for (var i = 0; i < 3; i++) fns.push(() => i); console.log(fns.map((f) => f()));`. Después arreglalo de dos maneras distintas.
5. Escribí `configurarSaludo({ saludo = "Hola", signo = "!" } = {})` que devuelva una función que saluda a un nombre. Usala para crear un saludo formal y uno informal.
6. Con el arreglo de contactos del apunte, escribí en una sola cadena la consulta que devuelve, para cada ciudad, la suma de compras de sus contactos activos.
7. Escribí `unaSolaVez(fn)`, una función de orden superior que devuelva una función que ejecuta a `fn` la primera vez y en las siguientes devuelve el resultado guardado, sin volver a ejecutarla.
