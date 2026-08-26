# Funciones en JavaScript, desde primeros principios

Una función es una porción de programa que:

1. tiene un nombre o puede guardarse en una variable;
2. puede recibir datos;
3. ejecuta una serie de instrucciones;
4. puede producir un resultado;
5. puede utilizarse todas las veces que sea necesario.

La forma más sencilla es:

~~~js
function saludar() {
  console.log("Hola");
}

saludar();
~~~

La primera parte **define** la función. La última línea la **llama** o **invoca**.

---

## 1. Antes de las funciones: instrucciones ejecutadas en orden

Un programa básico avanza línea por línea:

~~~js
console.log("Hola, Ana");
console.log("Hola, Luis");
console.log("Hola, Marta");
~~~

Esto funciona, pero repetimos la misma idea. Si el saludo cambia, debemos modificar varias líneas.

Una función permite darle un nombre a ese comportamiento:

~~~js
function saludar(nombre) {
  console.log("Hola, " + nombre);
}

saludar("Ana");
saludar("Luis");
saludar("Marta");
~~~

Ahora la lógica está escrita una sola vez.

---

## 2. Definir no es lo mismo que ejecutar

Al escribir:

~~~js
function saludar() {
  console.log("Hola");
}
~~~

JavaScript registra la función, pero todavía no ejecuta su cuerpo.

Para ejecutarla debemos agregar paréntesis:

~~~js
saludar();
~~~

Modelo mental:

~~~text
function saludar() { ... }
          │
          └── define una función

saludar
   │
   └── referencia a la función

saludar()
   │
   └── ejecuta la función
~~~

Esta diferencia será muy importante cuando estudiemos callbacks.

---

## 3. Anatomía de una función

~~~js
function sumar(a, b) {
  const resultado = a + b;
  return resultado;
}
~~~

Sus partes son:

~~~text
function       palabra que inicia la declaración
sumar          nombre de la función
(a, b)         parámetros
{ ... }        cuerpo
return         entrega el resultado
~~~

Para utilizarla:

~~~js
const total = sumar(3, 4);
console.log(total);
~~~

Resultado:

~~~text
7
~~~

---

## 4. Parámetros y argumentos

Aunque suelen confundirse, no son exactamente lo mismo.

Los **parámetros** son las variables escritas en la definición:

~~~js
function multiplicar(a, b) {
  return a * b;
}
~~~

Aquí **a** y **b** son parámetros.

Los **argumentos** son los valores concretos enviados al llamar:

~~~js
multiplicar(5, 8);
~~~

Aquí 5 y 8 son argumentos.

Durante esa llamada ocurre conceptualmente:

~~~text
a recibe 5
b recibe 8
resultado: 40
~~~

Cada llamada puede usar valores diferentes:

~~~js
multiplicar(2, 3);   // 6
multiplicar(10, 4);  // 40
multiplicar(7, 7);   // 49
~~~

---

## 5. return devuelve un resultado

~~~js
function cuadrado(numero) {
  return numero * numero;
}

const resultado = cuadrado(5);
~~~

La expresión:

~~~js
cuadrado(5)
~~~

se evalúa y se reemplaza conceptualmente por:

~~~js
25
~~~

Por eso podemos usar una llamada dentro de otra expresión:

~~~js
const total = cuadrado(5) + cuadrado(3);
console.log(total); // 34
~~~

---

## 6. return termina inmediatamente la función

~~~js
function clasificarEdad(edad) {
  if (edad < 0) {
    return "Edad inválida";
  }

  if (edad < 18) {
    return "Menor";
  }

  return "Mayor";
}
~~~

En cuanto JavaScript ejecuta un **return**, abandona la función. Ninguna instrucción posterior de esa llamada se ejecuta.

~~~js
function ejemplo() {
  console.log("A");
  return 10;
  console.log("B"); // Nunca se ejecuta.
}
~~~

---

## 7. Una función sin return devuelve undefined

~~~js
function mostrarMensaje() {
  console.log("Hola");
}

const resultado = mostrarMensaje();
console.log(resultado);
~~~

Resultado:

~~~text
Hola
undefined
~~~

La función produjo un efecto visible con **console.log**, pero no devolvió explícitamente ningún valor.

También:

~~~js
return;
~~~

termina la función y devuelve **undefined**.

---

## 8. Mostrar un valor no es devolverlo

Estas funciones no hacen lo mismo:

~~~js
function sumarYMostrar(a, b) {
  console.log(a + b);
}
~~~

~~~js
function sumarYDevolver(a, b) {
  return a + b;
}
~~~

La primera escribe en la consola. La segunda entrega un valor que puede reutilizarse:

~~~js
const total = sumarYDevolver(10, 20);
const doble = total * 2;
~~~

Una regla práctica:

> Si otra parte del programa necesita el resultado, la función debe devolverlo.

---

## 9. Entrada, procesamiento y salida

Una forma útil de pensar una función es:

~~~text
entrada
   ↓
función
   ↓
salida
~~~

Ejemplo:

~~~js
function calcularPrecioFinal(precio, descuento) {
  const rebaja = precio * descuento;
  return precio - rebaja;
}
~~~

~~~text
entradas:      1000 y 0.20
procesamiento: calcula la rebaja
salida:        800
~~~

No todas las funciones tienen entradas ni todas producen una salida explícita, pero este modelo ayuda a diseñarlas.

---

## 10. Variables locales y alcance

Los parámetros y las variables creadas dentro de una función son locales a esa ejecución:

~~~js
function calcular() {
  const resultado = 10 + 20;
  console.log(resultado);
}

calcular();
console.log(resultado); // ReferenceError
~~~

La variable **resultado** solo existe dentro de la función.

~~~text
afuera
  │
  ├── función calcular
  │      └── resultado
  │
  └── resultado no está disponible aquí
~~~

Este límite se denomina **alcance** o *scope*.

---

## 11. Una función puede leer el alcance exterior

~~~js
const impuesto = 0.21;

function calcularTotal(precio) {
  return precio + precio * impuesto;
}
~~~

La función puede leer **impuesto** porque fue declarado en un alcance exterior.

Pero abusar de datos externos vuelve más difícil entender y probar la función. Esta versión expresa mejor sus dependencias:

~~~js
function calcularTotal(precio, impuesto) {
  return precio + precio * impuesto;
}
~~~

Ahora todos los datos necesarios llegan como argumentos.

---

## 12. Cada llamada crea su propio contexto

~~~js
function saludar(nombre) {
  const mensaje = "Hola, " + nombre;
  return mensaje;
}

saludar("Ana");
saludar("Luis");
~~~

Cada ejecución tiene su propio parámetro **nombre** y su propia variable **mensaje**:

~~~text
llamada 1
  nombre  = "Ana"
  mensaje = "Hola, Ana"

llamada 2
  nombre  = "Luis"
  mensaje = "Hola, Luis"
~~~

Las variables de una llamada no se mezclan con las de otra.

---

## 13. La pila de llamadas

Una función puede llamar a otra:

~~~js
function obtenerSubtotal() {
  return 100;
}

function obtenerTotal() {
  const subtotal = obtenerSubtotal();
  return subtotal * 1.21;
}

console.log(obtenerTotal());
~~~

Mientras **obtenerSubtotal** se ejecuta, **obtenerTotal** queda esperando. JavaScript recuerda esas llamadas en la pila:

~~~text
programa principal
  └── obtenerTotal()
        └── obtenerSubtotal()
~~~

Cuando termina la función más profunda, su resultado vuelve a quien la llamó:

~~~text
obtenerSubtotal() devuelve 100
        ↑
obtenerTotal() devuelve 121
        ↑
programa principal
~~~

Esta misma pila permite que una excepción se propague hasta encontrar un **catch**.

---

## 14. Declaraciones de función

La forma clásica es:

~~~js
function restar(a, b) {
  return a - b;
}
~~~

Las declaraciones de función son procesadas antes de ejecutar las instrucciones de su alcance. Por eso normalmente pueden llamarse antes de aparecer en el archivo:

~~~js
console.log(restar(10, 3));

function restar(a, b) {
  return a - b;
}
~~~

Este comportamiento suele describirse como **hoisting**.

Aunque sea válido, colocar la definición en un lugar predecible suele mejorar la lectura.

---

## 15. Expresiones de función

Una función también puede crearse como un valor y guardarse en una variable:

~~~js
const restar = function (a, b) {
  return a - b;
};
~~~

Puede ser anónima porque la variable ya permite acceder a ella:

~~~js
restar(10, 3);
~~~

La variable no puede usarse antes de su inicialización:

~~~js
restar(10, 3); // Error.

const restar = function (a, b) {
  return a - b;
};
~~~

---

## 16. Funciones flecha

Una función flecha es otra sintaxis para crear funciones:

~~~js
const sumar = (a, b) => {
  return a + b;
};
~~~

Si el cuerpo solo devuelve una expresión, puede abreviarse:

~~~js
const sumar = (a, b) => a + b;
~~~

Con un solo parámetro, los paréntesis son opcionales:

~~~js
const doble = numero => numero * 2;
~~~

Sin parámetros, los paréntesis son necesarios:

~~~js
const saludar = () => "Hola";
~~~

Para devolver directamente un objeto hay que envolverlo entre paréntesis:

~~~js
const crearUsuario = nombre => ({
  nombre: nombre,
  activo: true
});
~~~

Sin esos paréntesis, las llaves serían interpretadas como el cuerpo de la función.

---

## 17. Una función flecha no siempre reemplaza a una tradicional

Las funciones flecha:

- no crean su propio valor de **this**;
- no tienen su propio objeto **arguments**;
- no pueden utilizarse como constructor con **new**;
- no son adecuadas como métodos cuando necesitamos un **this** dinámico.

Ejemplo:

~~~js
const persona = {
  nombre: "Ana",

  saludar() {
    console.log("Hola, soy " + this.nombre);
  }
};

persona.saludar();
~~~

Para métodos como este, la sintaxis de método suele expresar mejor la intención.

Las funciones flecha son especialmente cómodas para transformaciones y callbacks:

~~~js
const dobles = [1, 2, 3].map(numero => numero * 2);
~~~

---

## 18. Las funciones son valores

En JavaScript una función puede tratarse como cualquier otro valor. Puede:

- guardarse en una variable;
- colocarse dentro de un objeto o arreglo;
- enviarse como argumento;
- devolverse desde otra función.

~~~js
function saludar() {
  console.log("Hola");
}

const operacion = saludar;

operacion();
~~~

Observá que no escribimos paréntesis al asignar:

~~~js
const operacion = saludar;
~~~

Eso copia la referencia a la función. En cambio:

~~~js
const resultado = saludar();
~~~

ejecuta la función y guarda lo que devuelve.

---

## 19. Callbacks

Un callback es una función que enviamos a otra para que pueda llamarla en el momento apropiado.

~~~js
function ejecutarTresVeces(accion) {
  accion();
  accion();
  accion();
}

function saludar() {
  console.log("Hola");
}

ejecutarTresVeces(saludar);
~~~

Enviamos:

~~~js
saludar
~~~

no:

~~~js
saludar()
~~~

La primera expresión entrega la función. La segunda la ejecuta inmediatamente y entrega su resultado.

Los métodos de arreglos usan callbacks:

~~~js
const numeros = [1, 2, 3, 4];

const dobles = numeros.map(numero => numero * 2);
const pares = numeros.filter(numero => numero % 2 === 0);
const total = numeros.reduce((acumulado, numero) => {
  return acumulado + numero;
}, 0);
~~~

---

## 20. Funciones de orden superior

Una función de orden superior:

- recibe una o más funciones;
- devuelve una función;
- o hace ambas cosas.

~~~js
function aplicarOperacion(a, b, operacion) {
  return operacion(a, b);
}

function sumar(a, b) {
  return a + b;
}

function multiplicar(a, b) {
  return a * b;
}

aplicarOperacion(4, 5, sumar);        // 9
aplicarOperacion(4, 5, multiplicar);  // 20
~~~

La función **aplicarOperacion** concentra el flujo y recibe como dato el comportamiento que debe utilizar.

---

## 21. Funciones que devuelven funciones

~~~js
function crearMultiplicador(factor) {
  return function (numero) {
    return numero * factor;
  };
}

const duplicar = crearMultiplicador(2);
const triplicar = crearMultiplicador(3);

duplicar(10);   // 20
triplicar(10);  // 30
~~~

La llamada **crearMultiplicador(2)** devuelve una nueva función. Esa nueva función recuerda que el factor vale 2.

Esto conduce al concepto de clausura.

---

## 22. Clausuras o closures

Una clausura ocurre cuando una función conserva acceso a las variables del entorno en el que fue creada, incluso después de que la función exterior haya terminado.

~~~js
function crearContador() {
  let valor = 0;

  return function () {
    valor++;
    return valor;
  };
}

const contar = crearContador();

console.log(contar()); // 1
console.log(contar()); // 2
console.log(contar()); // 3
~~~

Aunque **crearContador** ya terminó, la función devuelta sigue teniendo acceso a **valor**.

Modelo:

~~~text
crearContador()
   │
   ├── valor = 0
   │
   └── devuelve una función
             │
             └── conserva acceso a valor
~~~

Las clausuras se utilizan para:

- mantener estado privado;
- crear funciones configuradas;
- construir manejadores de eventos;
- implementar módulos;
- recordar datos entre llamadas.

---

## 23. Métodos y this

Cuando una función pertenece a un objeto, suele llamarse **método**:

~~~js
const cuenta = {
  saldo: 1000,

  depositar(monto) {
    this.saldo += monto;
    return this.saldo;
  }
};

cuenta.depositar(500);
~~~

En esta llamada:

~~~js
cuenta.depositar(500);
~~~

**this** hace referencia a **cuenta**.

El valor de **this** en una función tradicional depende de cómo se llama la función, no únicamente de dónde fue escrita:

~~~js
const depositarSeparado = cuenta.depositar;

depositarSeparado(100);
~~~

Al separar el método del objeto puede perderse el receptor original. Para fijarlo puede usarse **bind**:

~~~js
const depositarSeguro = cuenta.depositar.bind(cuenta);
depositarSeguro(100);
~~~

---

## 24. Argumentos predeterminados

~~~js
function saludar(nombre = "visitante") {
  return "Hola, " + nombre;
}

saludar("Ana"); // "Hola, Ana"
saludar();      // "Hola, visitante"
~~~

El valor predeterminado se aplica cuando el argumento es **undefined** o no fue enviado:

~~~js
saludar(undefined); // Usa "visitante".
saludar(null);      // Usa null, no el valor predeterminado.
~~~

---

## 25. Cantidad variable de argumentos

El parámetro rest reúne los argumentos restantes en un arreglo:

~~~js
function sumarTodos(...numeros) {
  let total = 0;

  for (const numero of numeros) {
    total += numero;
  }

  return total;
}

sumarTodos(1, 2, 3, 4); // 10
~~~

También puede combinarse con parámetros normales:

~~~js
function registrar(nivel, ...mensajes) {
  console.log(nivel, mensajes);
}
~~~

El parámetro rest debe ser el último.

---

## 26. Desestructuración en los parámetros

Si una función necesita varias propiedades de un objeto:

~~~js
function mostrarUsuario(usuario) {
  console.log(usuario.nombre);
  console.log(usuario.edad);
}
~~~

podemos desestructurarlas:

~~~js
function mostrarUsuario({ nombre, edad }) {
  console.log(nombre);
  console.log(edad);
}
~~~

Llamada:

~~~js
mostrarUsuario({
  nombre: "Ana",
  edad: 30
});
~~~

También podemos utilizar valores predeterminados:

~~~js
function crearCuenta({
  nombre,
  activa = true
}) {
  return { nombre, activa };
}
~~~

---

## 27. Valores primitivos y objetos como argumentos

Los argumentos se pasan por valor. En el caso de un objeto, el valor copiado es una referencia al mismo objeto.

Con un número:

~~~js
function aumentar(numero) {
  numero++;
}

let cantidad = 10;
aumentar(cantidad);

console.log(cantidad); // 10
~~~

La función cambia su copia local.

Con un objeto:

~~~js
function activar(usuario) {
  usuario.activo = true;
}

const usuario = {
  nombre: "Ana",
  activo: false
};

activar(usuario);

console.log(usuario.activo); // true
~~~

La referencia copiada apunta al mismo objeto, por eso la mutación es visible afuera.

Si queremos evitarla:

~~~js
function activar(usuario) {
  return {
    ...usuario,
    activo: true
  };
}
~~~

---

## 28. Funciones puras y efectos secundarios

Una función pura:

- para las mismas entradas produce la misma salida;
- no modifica estado exterior;
- no produce efectos observables fuera de su resultado.

~~~js
function sumar(a, b) {
  return a + b;
}
~~~

Una función con efecto secundario:

~~~js
let total = 0;

function agregar(monto) {
  total += monto;
  console.log(total);
}
~~~

Los efectos secundarios no son necesariamente malos: una aplicación necesita mostrar información, guardar datos y comunicarse con servidores. Pero separarlos de los cálculos puros suele hacer el programa más fácil de probar y entender.

~~~js
function calcularTotal(precios) {
  return precios.reduce((total, precio) => total + precio, 0);
}

function mostrarTotal(total) {
  console.log("Total:", total);
}
~~~

---

## 29. Recursividad

Una función recursiva se llama a sí misma:

~~~js
function factorial(numero) {
  if (numero === 0) {
    return 1;
  }

  return numero * factorial(numero - 1);
}

factorial(4); // 24
~~~

Desarrollo:

~~~text
factorial(4)
4 × factorial(3)
4 × 3 × factorial(2)
4 × 3 × 2 × factorial(1)
4 × 3 × 2 × 1 × factorial(0)
4 × 3 × 2 × 1 × 1
24
~~~

Toda recursión necesita un **caso base** que detenga las llamadas:

~~~js
if (numero === 0) {
  return 1;
}
~~~

Sin él, la pila crece hasta producir un RangeError por exceder su capacidad.

---

## 30. Funciones y errores

Una función puede indicar que no puede cumplir su contrato lanzando una excepción:

~~~js
function dividir(a, b) {
  if (b === 0) {
    throw new Error("No se puede dividir por cero");
  }

  return a / b;
}
~~~

Quien llama decide cómo manejarla:

~~~js
try {
  const resultado = dividir(10, 0);
  console.log(resultado);
} catch (error) {
  console.error(error.message);
}
~~~

La excepción se propaga por la pila de llamadas hasta encontrar un **catch**.

---

## 31. Funciones asincrónicas

Una función declarada con **async** siempre devuelve una Promise:

~~~js
async function obtenerNombre() {
  return "Ana";
}

const promesa = obtenerNombre();
~~~

El valor devuelto se convierte en una Promise cumplida.

Podemos esperar el resultado dentro de otra función async:

~~~js
async function main() {
  const nombre = await obtenerNombre();
  console.log(nombre);
}

main();
~~~

Si la función async lanza un error, la Promise se rechaza:

~~~js
async function obtenerDatos() {
  throw new Error("Falló la carga");
}

async function main() {
  try {
    await obtenerDatos();
  } catch (error) {
    console.error(error.message);
  }
}
~~~

---

## 32. Generadores

Una función generadora puede pausar y reanudar su ejecución:

~~~js
function* generarNumeros() {
  yield 1;
  yield 2;
  yield 3;
}

const generador = generarNumeros();

console.log(generador.next());
console.log(generador.next());
console.log(generador.next());
~~~

Cada **yield** entrega un valor y pausa la función hasta la siguiente llamada a **next**.

También puede recorrerse:

~~~js
for (const numero of generarNumeros()) {
  console.log(numero);
}
~~~

Los generadores son una variante especializada; no reemplazan a las funciones normales.

---

## 33. Errores comunes

### Confundir la función con su ejecución

~~~js
boton.addEventListener("click", saludar);
~~~

entrega la función para ejecutarla más tarde.

~~~js
boton.addEventListener("click", saludar());
~~~

la ejecuta inmediatamente y entrega su resultado.

### Olvidar return

~~~js
const doble = numero => {
  numero * 2;
};

console.log(doble(5)); // undefined
~~~

Debe ser:

~~~js
const doble = numero => {
  return numero * 2;
};
~~~

o:

~~~js
const doble = numero => numero * 2;
~~~

### Modificar argumentos sin intención

~~~js
function cambiar(usuario) {
  usuario.nombre = "Otro";
}
~~~

Si se trata de un objeto compartido, esa mutación afecta al exterior.

### Crear funciones demasiado grandes

Una función que valida, calcula, guarda, muestra y registra todo al mismo tiempo resulta difícil de entender y probar.

### Depender de demasiadas variables globales

Las dependencias ocultas vuelven impredecible el resultado. Es preferible recibir los datos necesarios como argumentos.

---

## 34. Buenas prácticas

### Elegí nombres que expresen una acción

~~~js
calcularTotal()
buscarUsuario()
validarCorreo()
guardarPedido()
~~~

### Una función, una responsabilidad principal

Si no puede describirse claramente en una frase breve, quizá haga demasiadas cosas.

### Preferí parámetros explícitos

Las entradas visibles hacen más claro el contrato.

### Devolvé resultados reutilizables

Separá los cálculos de la presentación cuando sea razonable.

### Evitá mutaciones sorpresivas

Si una función modifica un objeto recibido, su nombre o documentación debería dejarlo claro.

### Mantené una interfaz pequeña

Una cantidad excesiva de parámetros puede indicar que conviene usar un objeto:

~~~js
function crearUsuario({
  nombre,
  correo,
  edad,
  activo
}) {
  // ...
}
~~~

### Documentá el contrato

Quien usa la función debería saber:

- qué argumentos espera;
- qué devuelve;
- qué efectos produce;
- qué errores puede lanzar;
- si es síncrona o asincrónica.

---

## 35. Modelo mental final

Una función puede entenderse como una máquina reutilizable:

~~~text
              definición
                 │
                 ↓
        ┌───────────────────┐
        │      función      │
        │                   │
entrada │ parámetros        │
───────→│ instrucciones     │
        │ return            │───────→ salida
        └───────────────────┘
~~~

Cuando la llamamos:

~~~text
1. se evalúan los argumentos
2. los parámetros reciben esos valores
3. se crea un nuevo contexto local
4. se ejecuta el cuerpo
5. return termina la función y entrega un valor
6. la ejecución continúa donde se realizó la llamada
~~~

Una función también es un valor:

~~~text
función
  ├── puede guardarse
  ├── puede enviarse como argumento
  ├── puede devolverse
  └── puede ejecutarse con ()
~~~

La diferencia esencial es:

~~~text
miFuncion    → la función como valor
miFuncion()  → la ejecución de la función
~~~

En una sola frase:

> **Una función es un valor ejecutable que encapsula un comportamiento, puede recibir datos mediante parámetros y puede devolver un resultado a quien la llamó.**

Comprender esa combinación —comportamiento encapsulado, alcance local, llamadas, valores y retorno— es la base para entender callbacks, métodos, clausuras, Promises y gran parte de JavaScript.
