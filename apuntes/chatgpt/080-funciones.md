# Funciones en JavaScript

Una función es una pieza de código que podemos **definir una vez y ejecutar todas las veces que necesitemos**.

La idea más elemental es:

```text
datos de entrada
       ↓
    función
       ↓
resultado de salida
```

Por ejemplo, una función que recibe dos números y devuelve su suma:

```js
function sumar(a, b) {
    return a + b;
}
```

Para utilizarla, la invocamos:

```js
const resultado = sumar(4, 7);

console.log(resultado); // 11
```

En este ejemplo:

- `sumar` es el nombre de la función;
- `a` y `b` son sus parámetros;
- `4` y `7` son los argumentos enviados;
- `return a + b` produce el resultado;
- `resultado` recibe el valor retornado.

## 1. ¿Por qué necesitamos funciones?

Sin funciones podríamos escribir:

```js
const resultado1 = 4 + 7;
const resultado2 = 10 + 20;
const resultado3 = 100 + 50;
```

Pero si la operación fuera más compleja, terminaríamos repitiendo mucho código.

Una función permite darle nombre a una operación:

```js
function calcularPrecioFinal(precio, descuento) {
    const rebaja = precio * descuento / 100;

    return precio - rebaja;
}
```

Entonces podemos reutilizarla:

```js
console.log(calcularPrecioFinal(1000, 10)); // 900
console.log(calcularPrecioFinal(500, 20));  // 400
console.log(calcularPrecioFinal(800, 5));   // 760
```

La función separa dos cosas:

```text
qué operación queremos realizar
              ↓
calcularPrecioFinal

con qué datos queremos realizarla
              ↓
1000 y 10
```

## 2. Definir una función no es ejecutarla

Cuando escribimos:

```js
function saludar() {
    console.log("Hola");
}
```

estamos **definiendo** la función.

El código interno todavía no se ejecutó.

Para ejecutarla debemos usar paréntesis:

```js
saludar();
```

La diferencia es fundamental:

```js
saludar
```

representa la función como valor.

En cambio:

```js
saludar()
```

ejecuta la función.

Ejemplo:

```js
console.log(saludar);
// [Function: saludar]

console.log(saludar());
// ejecuta la función
```

Los paréntesis significan:

> Invocá esta función ahora.

## 3. Función clásica declarada

La forma tradicional de declarar una función es:

```js
function nombre(parametros) {
    instrucciones;

    return resultado;
}
```

Ejemplo:

```js
function multiplicar(a, b) {
    return a * b;
}
```

Uso:

```js
const resultado = multiplicar(6, 7);

console.log(resultado); // 42
```

Esta forma se denomina habitualmente **function declaration** o declaración de función.

### Las declaraciones de función son elevadas

JavaScript permite invocar una función declarada antes de su aparición textual:

```js
console.log(sumar(3, 4)); // 7

function sumar(a, b) {
    return a + b;
}
```

Esto ocurre porque las declaraciones de función participan del mecanismo llamado **hoisting**.

Conceptualmente, JavaScript conoce la declaración antes de comenzar a ejecutar el bloque:

```text
1. Registrar la función sumar
2. Ejecutar el programa
```

Esto no significa que el código se mueva literalmente, pero es un buen primer modelo mental.

## 4. Expresiones de función

Una función también puede crearse como un valor y almacenarse en una variable:

```js
const restar = function(a, b) {
    return a - b;
};
```

Uso:

```js
console.log(restar(10, 3)); // 7
```

Aquí tenemos una función anónima:

```js
function(a, b) {
    return a - b;
}
```

que se almacena en la constante:

```js
restar
```

Podemos pensarlo así:

```text
restar
   │
   ▼
función
```

La función es un valor, igual que un número, una cadena o un objeto.

### Diferencia con la declaración clásica

Esto funciona:

```js
console.log(sumar(2, 3));

function sumar(a, b) {
    return a + b;
}
```

Pero esto no funciona:

```js
console.log(restar(5, 2));

const restar = function(a, b) {
    return a - b;
};
```

La variable `restar` no puede usarse antes de su inicialización.

### Expresión de función con nombre

Una expresión también puede tener un nombre interno:

```js
const factorial = function calcularFactorial(n) {
    if (n <= 1) {
        return 1;
    }

    return n * calcularFactorial(n - 1);
};
```

Uso:

```js
console.log(factorial(5)); // 120
```

El nombre interno puede ser útil para:

- recursividad;
- mensajes de error;
- depuración.

## 5. Funciones flecha

Las funciones flecha, o **arrow functions**, son una forma más compacta de escribir funciones.

La versión completa sería:

```js
const sumar = (a, b) => {
    return a + b;
};
```

Equivale, para este caso sencillo, a:

```js
const sumar = function(a, b) {
    return a + b;
};
```

Uso:

```js
console.log(sumar(4, 5)); // 9
```

La flecha:

```text
=>
```

separa los parámetros del cuerpo de la función.

```text
parámetros => resultado
```

## 6. Abreviaturas de las funciones flecha

Las funciones flecha poseen varias abreviaturas. Conviene aprenderlas gradualmente.

### Forma completa

```js
const doble = (numero) => {
    return numero * 2;
};
```

### Un solo parámetro: pueden omitirse los paréntesis

```js
const doble = numero => {
    return numero * 2;
};
```

Las siguientes dos funciones son equivalentes:

```js
const doble1 = (numero) => {
    return numero * 2;
};

const doble2 = numero => {
    return numero * 2;
};
```

Los paréntesis solamente pueden omitirse cuando existe **exactamente un parámetro simple**.

### Una sola expresión: puede omitirse `return`

```js
const doble = numero => numero * 2;
```

Esto significa:

```js
const doble = numero => {
    return numero * 2;
};
```

La forma:

```js
numero => numero * 2
```

se denomina retorno implícito.

### Sin parámetros

Cuando no hay parámetros, los paréntesis son obligatorios:

```js
const obtenerSaludo = () => "Hola";
```

Uso:

```js
console.log(obtenerSaludo()); // Hola
```

### Varios parámetros

Con varios parámetros, los paréntesis también son obligatorios:

```js
const sumar = (a, b) => a + b;
```

No podemos escribir:

```js
const sumar = a, b => a + b;
```

Eso es sintácticamente incorrecto.

### Retornar un objeto

Queremos hacer esto:

```js
const crearPersona = nombre => {
    return {
        nombre: nombre,
        activo: true
    };
};
```

Podríamos intentar abreviarlo así:

```js
const crearPersona = nombre => {
    nombre: nombre,
    activo: true
};
```

Pero no funciona como esperamos, porque JavaScript interpreta las llaves como el cuerpo de la función.

Para retornar un objeto de manera implícita debemos envolverlo entre paréntesis:

```js
const crearPersona = nombre => ({
    nombre: nombre,
    activo: true
});
```

Con abreviatura de propiedad:

```js
const crearPersona = nombre => ({
    nombre,
    activo: true
});
```

Uso:

```js
console.log(crearPersona("Ana"));
```

Resultado:

```js
{
    nombre: "Ana",
    activo: true
}
```

La regla para recordar es:

```js
x => ({ valor: x })
```

Los paréntesis indican que las llaves pertenecen a un objeto y no al cuerpo de la función.

## 7. Resumen de abreviaturas

Estas funciones son equivalentes:

```js
const cuadrado = function(numero) {
    return numero * numero;
};
```

```js
const cuadrado = (numero) => {
    return numero * numero;
};
```

```js
const cuadrado = numero => {
    return numero * numero;
};
```

```js
const cuadrado = numero => numero * numero;
```

La última es la más compacta, pero no siempre es la más clara.

La brevedad es útil cuando la operación es sencilla:

```js
const esPar = numero => numero % 2 === 0;
```

Para operaciones más largas conviene conservar el bloque:

```js
const calcularPrecio = (precio, descuento, impuesto) => {
    const rebaja = precio * descuento / 100;
    const precioRebajado = precio - rebaja;
    const recargo = precioRebajado * impuesto / 100;

    return precioRebajado + recargo;
};
```

El objetivo no es ganar un campeonato mundial de eliminación de caracteres. El objetivo es que el código se entienda.

## 8. Diferencias entre una función clásica y una función flecha

Las funciones flecha no son solamente una abreviatura. Tienen diferencias de comportamiento.

### Las funciones flecha no tienen su propio `this`

En una función clásica, el valor de `this` depende de cómo se invoque la función.

```js
const persona = {
    nombre: "Ana",

    saludar: function() {
        console.log(`Hola, soy ${this.nombre}`);
    }
};

persona.saludar();
// Hola, soy Ana
```

También podemos usar la sintaxis abreviada de método:

```js
const persona = {
    nombre: "Ana",

    saludar() {
        console.log(`Hola, soy ${this.nombre}`);
    }
};
```

En cambio, una función flecha captura el `this` del entorno exterior.

Por eso no suele convenir usar una flecha como método principal de un objeto:

```js
const persona = {
    nombre: "Ana",

    saludar: () => {
        console.log(this.nombre);
    }
};
```

Ese `this` no representa necesariamente a `persona`.

### Las flechas son útiles dentro de métodos

```js
const persona = {
    nombre: "Ana",

    saludarMasTarde() {
        setTimeout(() => {
            console.log(`Hola, soy ${this.nombre}`);
        }, 1000);
    }
};
```

La flecha captura el `this` del método `saludarMasTarde`.

Conceptualmente:

```text
saludarMasTarde()
       │
       └── this representa persona
                  │
                  ▼
           función flecha
           conserva ese this
```

### Las funciones flecha no tienen `arguments`

Una función clásica posee un objeto especial llamado `arguments`:

```js
function mostrarArgumentos() {
    console.log(arguments);
}

mostrarArgumentos(10, 20, 30);
```

Una función flecha no tiene su propio `arguments`.

En código moderno se prefieren los parámetros rest:

```js
const mostrarArgumentos = (...valores) => {
    console.log(valores);
};
```

### Las funciones flecha no pueden utilizarse como constructor

Una función clásica puede utilizarse con `new`:

```js
function Persona(nombre) {
    this.nombre = nombre;
}

const ana = new Persona("Ana");
```

Una función flecha no puede:

```js
const Persona = nombre => {
    this.nombre = nombre;
};

const ana = new Persona("Ana");
// TypeError
```

Para constructores modernos normalmente usamos clases:

```js
class Persona {
    constructor(nombre) {
        this.nombre = nombre;
    }
}
```

## 9. Parámetros y argumentos

Es importante distinguir estos conceptos.

En la definición:

```js
function sumar(a, b) {
    return a + b;
}
```

`a` y `b` son **parámetros**.

En la llamada:

```js
sumar(10, 20);
```

`10` y `20` son **argumentos**.

```text
definición:
sumar(a, b)
      ↑  ↑
 parámetros

invocación:
sumar(10, 20)
      ↑   ↑
 argumentos
```

## 10. JavaScript no exige la cantidad exacta de argumentos

Podemos declarar:

```js
function mostrar(a, b) {
    console.log(a);
    console.log(b);
}
```

Y llamarla con un solo argumento:

```js
mostrar(10);
```

Resultado:

```text
10
undefined
```

Los parámetros faltantes reciben `undefined`.

También podemos enviar argumentos adicionales:

```js
mostrar(10, 20, 30, 40);
```

La función utiliza `10` y `20`. Los demás argumentos no se asignan a parámetros declarados.

JavaScript no controla automáticamente la cantidad de argumentos como lo haría un lenguaje con una firma estricta.

## 11. Parámetros con valores predeterminados

Podemos asignar un valor predeterminado:

```js
function saludar(nombre = "invitado") {
    return `Hola, ${nombre}`;
}
```

```js
console.log(saludar("Ana"));
// Hola, Ana

console.log(saludar());
// Hola, invitado
```

El valor predeterminado se utiliza cuando el argumento es `undefined`:

```js
console.log(saludar(undefined));
// Hola, invitado
```

Pero no cuando es `null`:

```js
console.log(saludar(null));
// Hola, null
```

Esto sucede porque `null` es un valor enviado explícitamente.

### Los valores predeterminados pueden depender de parámetros anteriores

```js
function crearRango(desde, hasta = desde + 10) {
    return {
        desde,
        hasta
    };
}
```

```js
console.log(crearRango(5));
// { desde: 5, hasta: 15 }

console.log(crearRango(5, 20));
// { desde: 5, hasta: 20 }
```

## 12. Parámetros rest

Un parámetro rest permite recibir una cantidad variable de argumentos:

```js
function sumarTodos(...numeros) {
    let total = 0;

    for (const numero of numeros) {
        total += numero;
    }

    return total;
}
```

Uso:

```js
console.log(sumarTodos(1, 2));
// 3

console.log(sumarTodos(1, 2, 3, 4, 5));
// 15
```

El parámetro:

```js
...numeros
```

reúne los argumentos restantes en un array.

```text
sumarTodos(10, 20, 30)
             │   │   │
             └───┴───┴──→ [10, 20, 30]
```

El parámetro rest debe aparecer al final:

```js
function registrar(nombre, ...telefonos) {
    console.log(nombre);
    console.log(telefonos);
}
```

```js
registrar(
    "Ana",
    "3815551111",
    "3815552222"
);
```

Resultado:

```js
"Ana"
["3815551111", "3815552222"]
```

## 13. Parámetros mediante desestructuración

Si una función necesita muchos datos relacionados, puede recibir un objeto:

```js
function registrarAlumno(alumno) {
    console.log(alumno.nombre);
    console.log(alumno.legajo);
    console.log(alumno.telefono);
}
```

Podemos desestructurarlo directamente en los parámetros:

```js
function registrarAlumno({
    nombre,
    legajo,
    telefono
}) {
    console.log(nombre);
    console.log(legajo);
    console.log(telefono);
}
```

Uso:

```js
registrarAlumno({
    nombre: "Ana Pérez",
    legajo: "123456",
    telefono: "3815551234"
});
```

Esto tiene una ventaja importante: los argumentos tienen nombre.

Compárese:

```js
registrarAlumno(
    "Ana Pérez",
    "123456",
    "3815551234",
    true,
    8
);
```

con:

```js
registrarAlumno({
    nombre: "Ana Pérez",
    legajo: "123456",
    telefono: "3815551234",
    activo: true,
    nota: 8
});
```

La segunda forma es mucho más fácil de interpretar.

### Desestructuración con valores predeterminados

```js
function crearUsuario({
    nombre,
    activo = true,
    rol = "usuario"
}) {
    return {
        nombre,
        activo,
        rol
    };
}
```

```js
console.log(
    crearUsuario({
        nombre: "Ana"
    })
);
```

Resultado:

```js
{
    nombre: "Ana",
    activo: true,
    rol: "usuario"
}
```

### Desestructuración de arrays

También puede desestructurarse un array:

```js
function calcularDistancia([x1, y1], [x2, y2]) {
    const diferenciaX = x2 - x1;
    const diferenciaY = y2 - y1;

    return Math.sqrt(
        diferenciaX ** 2 +
        diferenciaY ** 2
    );
}
```

Uso:

```js
console.log(
    calcularDistancia(
        [0, 0],
        [3, 4]
    )
);
// 5
```

## 14. ¿Los parámetros se pasan por valor o por referencia?

JavaScript pasa todos los argumentos **por valor**.

Pero cuando enviamos un objeto, el valor copiado es una referencia al objeto.

### Con valores primitivos

```js
function cambiar(numero) {
    numero = 100;
}

let valor = 10;

cambiar(valor);

console.log(valor); // 10
```

La función recibió una copia del número.

```text
valor → 10

cambiar recibe otra variable:
numero → 10
```

Modificar `numero` no modifica `valor`.

### Con objetos

```js
function cambiarNombre(persona) {
    persona.nombre = "María";
}

const persona = {
    nombre: "Ana"
};

cambiarNombre(persona);

console.log(persona.nombre);
// María
```

La función recibió una copia de la referencia, pero ambas referencias apuntan al mismo objeto:

```text
persona ───────┐
               ▼
          { nombre: "Ana" }
               ▲
parámetro ─────┘
```

Por eso una mutación realizada sobre el objeto es visible fuera de la función.

### Reemplazar la referencia no reemplaza la variable exterior

```js
function reemplazarPersona(persona) {
    persona = {
        nombre: "María"
    };
}

const persona = {
    nombre: "Ana"
};

reemplazarPersona(persona);

console.log(persona.nombre);
// Ana
```

La función solamente reemplazó su copia local de la referencia.

La descripción precisa es:

> JavaScript pasa todo por valor. En el caso de los objetos, el valor pasado es una referencia al objeto.

## 15. Retorno de valores

La instrucción `return` cumple dos funciones:

1. termina inmediatamente la ejecución de la función;
2. entrega un valor al código que la invocó.

```js
function cuadrado(numero) {
    return numero * numero;
}
```

```js
const resultado = cuadrado(5);

console.log(resultado); // 25
```

### `return` termina la función

```js
function clasificarEdad(edad) {
    if (edad < 0) {
        return "Edad inválida";
    }

    if (edad < 18) {
        return "Menor";
    }

    return "Adulto";
}
```

Cuando JavaScript encuentra un `return`, no continúa ejecutando las instrucciones siguientes de esa función.

### Una función sin `return` devuelve `undefined`

```js
function saludar(nombre) {
    console.log(`Hola, ${nombre}`);
}
```

```js
const resultado = saludar("Ana");

console.log(resultado);
// undefined
```

La función produce un efecto visible, pero no retorna explícitamente ningún valor.

Conceptualmente, JavaScript actúa como si existiera:

```js
function saludar(nombre) {
    console.log(`Hola, ${nombre}`);

    return undefined;
}
```

## 16. Retornar varios valores

Una función solamente puede ejecutar un `return`, pero ese valor puede ser un objeto o un array que contenga varios datos.

### Mediante un objeto

```js
function dividir(dividendo, divisor) {
    return {
        cociente: Math.trunc(dividendo / divisor),
        resto: dividendo % divisor
    };
}
```

```js
const resultado = dividir(17, 5);

console.log(resultado.cociente); // 3
console.log(resultado.resto);    // 2
```

También podemos desestructurar:

```js
const { cociente, resto } = dividir(17, 5);

console.log(cociente);
console.log(resto);
```

### Mediante un array

```js
function minimoYMaximo(numeros) {
    return [
        Math.min(...numeros),
        Math.max(...numeros)
    ];
}
```

```js
const [minimo, maximo] =
    minimoYMaximo([5, 2, 9, 3]);

console.log(minimo); // 2
console.log(maximo); // 9
```

Los objetos son preferibles cuando cada resultado tiene un significado claro. Los arrays son apropiados cuando importa principalmente la posición.

## 17. Cuidado con el salto de línea después de `return`

Esto es incorrecto:

```js
function crearResultado() {
    return
    {
        correcto: true
    };
}
```

JavaScript puede interpretarlo como:

```js
function crearResultado() {
    return;

    {
        correcto: true
    }
}
```

La función devuelve `undefined`.

Debe escribirse:

```js
function crearResultado() {
    return {
        correcto: true
    };
}
```

La regla práctica es sencilla:

> No coloques un salto de línea inmediatamente después de `return`.

## 18. Alcance de las variables

El **alcance**, o *scope*, indica en qué parte del programa puede utilizarse una variable.

Una variable no existe necesariamente en todo el programa.

Existen principalmente:

- alcance global;
- alcance de función;
- alcance de bloque;
- alcance léxico.

## 19. Alcance global

Una variable declarada fuera de todas las funciones y bloques pertenece al ámbito exterior:

```js
const nombreAplicacion = "Gestor de alumnos";

function mostrarNombre() {
    console.log(nombreAplicacion);
}

mostrarNombre();
```

La función puede leer una variable de su entorno exterior.

Pero conviene evitar llenar el ámbito global de variables, porque distintas partes del programa pueden interferir entre sí.

## 20. Alcance de función

Los parámetros y las variables declaradas dentro de una función solamente existen dentro de ella:

```js
function calcular() {
    const subtotal = 100;
    const impuesto = 21;

    return subtotal + subtotal * impuesto / 100;
}
```

Esto no funciona:

```js
console.log(subtotal);
// ReferenceError
```

`subtotal` pertenece al ámbito de `calcular`.

Podemos imaginar que la función crea una pequeña región privada:

```text
┌──────────────────────────────┐
│ calcular                     │
│                              │
│ subtotal                     │
│ impuesto                     │
│                              │
└──────────────────────────────┘
```

Al terminar la llamada, esas variables locales dejan de ser accesibles, salvo que alguna clausura las conserve.

## 21. Alcance de bloque

Las variables declaradas con `let` y `const` respetan los bloques:

```js
if (true) {
    const mensaje = "Hola";
    let contador = 0;

    console.log(mensaje);
}

console.log(mensaje);
// ReferenceError
```

Un bloque está delimitado por llaves:

```js
{
    // bloque
}
```

Esto se aplica a:

- `if`;
- `for`;
- `while`;
- bloques independientes;
- funciones.

## 22. `var` tiene alcance de función

`var` no respeta el alcance de bloque de la misma manera que `let` y `const`:

```js
function ejemplo() {
    if (true) {
        var numero = 10;
    }

    console.log(numero); // 10
}
```

En cambio:

```js
function ejemplo() {
    if (true) {
        let numero = 10;
    }

    console.log(numero);
    // ReferenceError
}
```

Por eso, en JavaScript moderno, normalmente se utilizan:

```js
const
let
```

y se evita `var`, salvo que exista una razón específica.

## 23. Alcance léxico

JavaScript utiliza **alcance léxico**.

Esto significa que el ámbito de una función se determina por el lugar donde fue escrita, no por el lugar desde el cual fue invocada.

```js
const valor = "global";

function exterior() {
    const valor = "exterior";

    function interior() {
        console.log(valor);
    }

    interior();
}

exterior();
```

Resultado:

```text
exterior
```

La función `interior` encuentra la variable `valor` en el entorno donde fue definida.

La búsqueda conceptual es:

```text
¿existe valor dentro de interior?
              │
              └── no
                  │
                  ▼
¿existe valor en exterior?
              │
              └── sí → "exterior"
```

Si tampoco existiera allí, continuaría buscando hacia afuera.

## 24. Ocultamiento de variables

Una variable interior puede ocultar temporalmente una variable exterior con el mismo nombre:

```js
const mensaje = "mensaje global";

function mostrar() {
    const mensaje = "mensaje local";

    console.log(mensaje);
}

mostrar();
// mensaje local

console.log(mensaje);
// mensaje global
```

Las dos variables son distintas:

```text
ámbito global:
mensaje → "mensaje global"

ámbito de mostrar:
mensaje → "mensaje local"
```

Este fenómeno se conoce como **shadowing** u ocultamiento.

## 25. Clausuras

Una **clausura**, o *closure*, aparece cuando una función conserva acceso a las variables del entorno donde fue creada, incluso después de que la función exterior haya terminado.

Comencemos con un ejemplo sencillo:

```js
function crearSumador(cantidad) {
    return numero => numero + cantidad;
}
```

Uso:

```js
const sumar10 = crearSumador(10);
const sumar100 = crearSumador(100);

console.log(sumar10(5));   // 15
console.log(sumar100(5));  // 105
```

¿Qué ocurrió?

Al ejecutar:

```js
const sumar10 = crearSumador(10);
```

la función exterior recibe:

```text
cantidad = 10
```

y retorna:

```js
numero => numero + cantidad
```

Esa función interior conserva acceso a `cantidad`.

```text
sumar10
   │
   ▼
numero => numero + cantidad
                    │
                    └── cantidad = 10
```

La llamada a `crearSumador` ya terminó, pero la variable `cantidad` continúa disponible para la función retornada.

Eso es una clausura.

## 26. Las clausuras conservan estado

Podemos construir un contador privado:

```js
function crearContador(inicial = 0) {
    let valor = inicial;

    return function() {
        valor++;

        return valor;
    };
}
```

Uso:

```js
const contador = crearContador();

console.log(contador()); // 1
console.log(contador()); // 2
console.log(contador()); // 3
```

La variable `valor` no es global.

Tampoco puede modificarse directamente desde afuera.

Pero la función retornada conserva acceso a ella:

```text
crearContador()
       │
       ├── valor = 0
       │
       └── retorna función
                   │
                   ▼
              contador()
                   │
                   └── conserva acceso a valor
```

### Un objeto con operaciones privadas

```js
function crearContador(inicial = 0) {
    let valor = inicial;

    return {
        incrementar() {
            valor++;
        },

        decrementar() {
            valor--;
        },

        obtenerValor() {
            return valor;
        }
    };
}
```

Uso:

```js
const contador = crearContador(10);

contador.incrementar();
contador.incrementar();
contador.decrementar();

console.log(contador.obtenerValor());
// 11
```

No podemos hacer:

```js
contador.valor = 100;
```

porque `valor` no es una propiedad del objeto. Es una variable local conservada por las funciones.

La clausura permite obtener una forma de encapsulamiento:

```text
valor privado
    │
    ├── incrementar
    ├── decrementar
    └── obtenerValor
```

## 27. La clausura conserva la variable, no una fotografía

```js
function crearFunciones() {
    let valor = 10;

    const leer = () => valor;
    const cambiar = nuevoValor => {
        valor = nuevoValor;
    };

    return {
        leer,
        cambiar
    };
}
```

```js
const estado = crearFunciones();

console.log(estado.leer()); // 10

estado.cambiar(50);

console.log(estado.leer()); // 50
```

Las funciones comparten la misma variable `valor`.

No conservaron una copia fija de su valor inicial.

## 28. Clausuras y bucles

Este ejemplo clásico utiliza `var`:

```js
const funciones = [];

for (var i = 0; i < 3; i++) {
    funciones.push(() => i);
}

console.log(funciones[0]()); // 3
console.log(funciones[1]()); // 3
console.log(funciones[2]()); // 3
```

Las tres funciones conservan acceso a la misma variable `i`.

Cuando se ejecutan, el bucle ya terminó y `i` vale `3`.

Con `let`:

```js
const funciones = [];

for (let i = 0; i < 3; i++) {
    funciones.push(() => i);
}

console.log(funciones[0]()); // 0
console.log(funciones[1]()); // 1
console.log(funciones[2]()); // 2
```

`let` crea una vinculación diferente para cada iteración.

## 29. Las funciones son valores

En JavaScript, las funciones son **ciudadanos de primera clase**.

Eso significa que pueden:

- almacenarse en variables;
- guardarse en arrays;
- colocarse en objetos;
- enviarse como argumento;
- retornarse desde otra función.

### Almacenar funciones

```js
const sumar = (a, b) => a + b;
```

### Guardar funciones en un array

```js
const operaciones = [
    (a, b) => a + b,
    (a, b) => a - b,
    (a, b) => a * b
];
```

```js
console.log(operaciones[0](10, 5)); // 15
console.log(operaciones[1](10, 5)); // 5
console.log(operaciones[2](10, 5)); // 50
```

### Guardar funciones en un objeto

```js
const operaciones = {
    sumar: (a, b) => a + b,
    restar: (a, b) => a - b,
    multiplicar: (a, b) => a * b
};
```

```js
console.log(operaciones.sumar(4, 7));
// 11
```

## 30. Funciones de orden superior

Una función de orden superior es una función que cumple al menos una de estas condiciones:

1. recibe una función como argumento;
2. retorna una función.

Por ejemplo:

```js
function aplicarOperacion(numero, operacion) {
    return operacion(numero);
}
```

La función `aplicarOperacion` recibe otra función:

```js
const doble = numero => numero * 2;
const cuadrado = numero => numero ** 2;

console.log(aplicarOperacion(5, doble));
// 10

console.log(aplicarOperacion(5, cuadrado));
// 25
```

También podemos enviar la función directamente:

```js
console.log(
    aplicarOperacion(
        5,
        numero => numero + 100
    )
);
// 105
```

## 31. Callback

Una función enviada a otra función suele denominarse **callback**.

```js
function procesar(valor, callback) {
    return callback(valor);
}
```

Aquí:

```js
valor => valor * 2
```

es el callback:

```js
procesar(
    10,
    valor => valor * 2
);
```

El nombre no implica necesariamente asincronía. Un callback es simplemente una función que entregamos para que otra función decida cuándo y cómo ejecutarla.

## 32. Funciones que retornan funciones

```js
function multiplicarPor(factor) {
    return numero => numero * factor;
}
```

```js
const duplicar = multiplicarPor(2);
const triplicar = multiplicarPor(3);

console.log(duplicar(10));   // 20
console.log(triplicar(10));  // 30
```

`multiplicarPor` es de orden superior porque retorna una función.

También utiliza una clausura, porque la función retornada conserva el parámetro `factor`.

```text
multiplicarPor(3)
        │
        └── retorna numero => numero * factor
                                        │
                                        └── factor = 3
```

Las funciones de orden superior y las clausuras suelen trabajar juntas.

## 33. Composición de funciones

Podemos crear una función que combine otras funciones:

```js
function componer(f, g) {
    return valor => f(g(valor));
}
```

Ejemplo:

```js
const duplicar = numero => numero * 2;
const sumarUno = numero => numero + 1;

const duplicarYSumarUno =
    componer(sumarUno, duplicar);

console.log(duplicarYSumarUno(5));
// 11
```

El orden es:

```text
5
↓
duplicar
↓
10
↓
sumarUno
↓
11
```

Esto permite construir operaciones complejas combinando transformaciones pequeñas.

## 34. Funciones de orden superior sobre arrays

Los arrays de JavaScript incluyen varias funciones de orden superior.

Las más importantes son:

```text
map
filter
reduce
find
some
every
sort
flatMap
forEach
```

Estas funciones reciben callbacks y permiten expresar operaciones sobre colecciones.

## 35. `map`: transformar cada elemento

Supongamos:

```js
const numeros = [1, 2, 3, 4];
```

Queremos obtener el doble de cada número.

Con un bucle:

```js
const dobles = [];

for (const numero of numeros) {
    dobles.push(numero * 2);
}
```

Con `map`:

```js
const dobles =
    numeros.map(numero => numero * 2);
```

Resultado:

```js
[2, 4, 6, 8]
```

`map` significa:

> Por cada elemento de entrada, producir un elemento de salida.

```text
[1, 2, 3, 4]
 │  │  │  │
 ▼  ▼  ▼  ▼
×2 ×2 ×2 ×2
 │  │  │  │
 ▼  ▼  ▼  ▼
[2, 4, 6, 8]
```

El array resultante tiene la misma cantidad de elementos.

### Transformar objetos

```js
const alumnos = [
    {
        nombre: "Ana",
        nota: 8
    },
    {
        nombre: "Juan",
        nota: 5
    },
    {
        nombre: "María",
        nota: 9
    }
];
```

Podemos obtener solamente los nombres:

```js
const nombres =
    alumnos.map(alumno => alumno.nombre);
```

Resultado:

```js
["Ana", "Juan", "María"]
```

También podemos crear objetos nuevos:

```js
const resumen = alumnos.map(alumno => ({
    nombre: alumno.nombre,
    aprobado: alumno.nota >= 6
}));
```

Resultado:

```js
[
    {
        nombre: "Ana",
        aprobado: true
    },
    {
        nombre: "Juan",
        aprobado: false
    },
    {
        nombre: "María",
        aprobado: true
    }
]
```

## 36. Cómo podríamos construir nuestro propio `map`

```js
function mapear(array, transformar) {
    const resultado = [];

    for (let indice = 0; indice < array.length; indice++) {
        const elementoTransformado = transformar(
            array[indice],
            indice,
            array
        );

        resultado.push(elementoTransformado);
    }

    return resultado;
}
```

Uso:

```js
const numeros = [1, 2, 3];

const dobles = mapear(
    numeros,
    numero => numero * 2
);

console.log(dobles);
// [2, 4, 6]
```

Esto muestra qué hace `map` conceptualmente:

```text
para cada elemento:
    llamar a transformar(elemento)
    guardar el resultado
```

## 37. `filter`: seleccionar elementos

`filter` conserva solamente los elementos que cumplen una condición.

```js
const numeros = [1, 2, 3, 4, 5, 6];

const pares =
    numeros.filter(numero => numero % 2 === 0);
```

Resultado:

```js
[2, 4, 6]
```

El callback debe producir un valor booleano:

```text
1 → false → descartar
2 → true  → conservar
3 → false → descartar
4 → true  → conservar
```

### Filtrar objetos

```js
const aprobados =
    alumnos.filter(alumno => alumno.nota >= 6);
```

Resultado:

```js
[
    {
        nombre: "Ana",
        nota: 8
    },
    {
        nombre: "María",
        nota: 9
    }
]
```

### Construir nuestro propio `filter`

```js
function filtrar(array, condicion) {
    const resultado = [];

    for (let indice = 0; indice < array.length; indice++) {
        const elemento = array[indice];

        if (condicion(elemento, indice, array)) {
            resultado.push(elemento);
        }
    }

    return resultado;
}
```

Uso:

```js
const pares = filtrar(
    [1, 2, 3, 4, 5, 6],
    numero => numero % 2 === 0
);
```

## 38. `reduce`: acumular un resultado

`reduce` recorre una colección y mantiene un acumulador.

Ejemplo: sumar números.

```js
const numeros = [10, 20, 30];

const total = numeros.reduce(
    (acumulador, numero) => acumulador + numero,
    0
);
```

Resultado:

```text
60
```

Paso por paso:

```text
acumulador inicial = 0

0  + 10 = 10
10 + 20 = 30
30 + 30 = 60
```

La estructura es:

```js
array.reduce(
    (acumulador, elemento) => nuevoAcumulador,
    valorInicial
);
```

### Construir nuestro propio `reduce`

```js
function reducir(array, combinar, valorInicial) {
    let acumulador = valorInicial;

    for (let indice = 0; indice < array.length; indice++) {
        acumulador = combinar(
            acumulador,
            array[indice],
            indice,
            array
        );
    }

    return acumulador;
}
```

Uso:

```js
const total = reducir(
    [10, 20, 30],
    (acumulador, numero) =>
        acumulador + numero,
    0
);
```

### `reduce` puede producir cualquier tipo de resultado

No tiene que devolver necesariamente un número.

```js
const personas = [
    {
        nombre: "Ana",
        curso: "C1"
    },
    {
        nombre: "Juan",
        curso: "C3"
    },
    {
        nombre: "María",
        curso: "C1"
    }
];
```

```js
const porCurso = personas.reduce(
    (grupos, persona) => {
        const curso = persona.curso;

        if (!grupos[curso]) {
            grupos[curso] = [];
        }

        grupos[curso].push(persona);

        return grupos;
    },
    {}
);
```

Resultado:

```js
{
    C1: [
        {
            nombre: "Ana",
            curso: "C1"
        },
        {
            nombre: "María",
            curso: "C1"
        }
    ],

    C3: [
        {
            nombre: "Juan",
            curso: "C3"
        }
    ]
}
```

## 39. `find`: encontrar el primer elemento

```js
const alumno = alumnos.find(
    alumno => alumno.nombre === "Juan"
);
```

Devuelve el primer elemento que cumple la condición.

Si no encuentra ninguno, retorna:

```js
undefined
```

## 40. `some`: comprobar si alguno cumple

```js
const hayDesaprobados =
    alumnos.some(alumno => alumno.nota < 6);
```

Resultado:

```js
true
```

`some` termina apenas encuentra un elemento que cumple la condición.

Conceptualmente:

```text
¿existe al menos uno?
```

## 41. `every`: comprobar si todos cumplen

```js
const todosAprobaron =
    alumnos.every(alumno => alumno.nota >= 6);
```

Conceptualmente:

```text
¿todos cumplen?
```

`every` termina apenas encuentra un elemento que no cumple la condición.

## 42. `forEach`: ejecutar una acción

```js
alumnos.forEach(alumno => {
    console.log(alumno.nombre);
});
```

`forEach` se utiliza principalmente para producir efectos:

- imprimir;
- modificar una interfaz;
- registrar información;
- enviar datos.

No crea un nuevo array útil.

```js
const resultado = alumnos.forEach(
    alumno => alumno.nombre
);

console.log(resultado);
// undefined
```

Cuando buscamos transformar una colección, normalmente corresponde utilizar `map`, no `forEach`.

## 43. `flatMap`: transformar y aplanar

```js
const alumnos = [
    {
        nombre: "Ana",
        temas: ["JavaScript", "HTML"]
    },
    {
        nombre: "Juan",
        temas: ["CSS", "JavaScript"]
    }
];
```

Con `map`:

```js
const temas =
    alumnos.map(alumno => alumno.temas);
```

Resultado:

```js
[
    ["JavaScript", "HTML"],
    ["CSS", "JavaScript"]
]
```

Con `flatMap`:

```js
const temas =
    alumnos.flatMap(alumno => alumno.temas);
```

Resultado:

```js
[
    "JavaScript",
    "HTML",
    "CSS",
    "JavaScript"
]
```

`flatMap` equivale aproximadamente a:

```js
alumnos
    .map(alumno => alumno.temas)
    .flat();
```

## 44. Ordenar elementos

`sort` recibe una función de comparación:

```js
const numeros = [20, 3, 100, 8];

numeros.sort((a, b) => a - b);

console.log(numeros);
// [3, 8, 20, 100]
```

La función compara dos elementos:

```text
resultado negativo → a antes que b
resultado positivo → b antes que a
resultado cero     → equivalentes para el orden
```

Para ordenar en forma descendente:

```js
numeros.sort((a, b) => b - a);
```

### `sort` modifica el array original

```js
const originales = [3, 1, 2];

const ordenados = originales.sort(
    (a, b) => a - b
);

console.log(originales);
// [1, 2, 3]
```

Para evitarlo:

```js
const ordenados = [...originales].sort(
    (a, b) => a - b
);
```

La copia se ordena y el array original se conserva.

### Ordenar objetos

```js
const ordenadosPorNota = [...alumnos].sort(
    (a, b) => b.nota - a.nota
);
```

Por nombre:

```js
const ordenadosPorNombre = [...alumnos].sort(
    (a, b) =>
        a.nombre.localeCompare(b.nombre)
);
```

## 45. Encadenamiento: comportamiento similar a LINQ

Como muchos métodos retornan arrays, podemos encadenarlos:

```js
const resultado = alumnos
    .filter(alumno => alumno.nota >= 6)
    .map(alumno => ({
        nombre: alumno.nombre,
        nota: alumno.nota
    }))
    .sort((a, b) => b.nota - a.nota);
```

La lectura es:

```text
alumnos
   ↓
conservar los aprobados
   ↓
proyectar nombre y nota
   ↓
ordenar por nota descendente
```

Esto es muy parecido a una consulta LINQ:

```csharp
var resultado = alumnos
    .Where(alumno => alumno.Nota >= 6)
    .Select(alumno => new
    {
        alumno.Nombre,
        alumno.Nota
    })
    .OrderByDescending(alumno => alumno.Nota)
    .ToList();
```

En JavaScript:

```js
const resultado = alumnos
    .filter(alumno => alumno.nota >= 6)
    .map(alumno => ({
        nombre: alumno.nombre,
        nota: alumno.nota
    }))
    .sort((a, b) => b.nota - a.nota);
```

## 46. Ejemplo práctico completo

```js
const alumnos = [
    {
        nombre: "Ana",
        curso: "C1",
        nota: 9,
        asistencia: 0.95,
        temas: ["JavaScript", "HTML"]
    },
    {
        nombre: "Juan",
        curso: "C1",
        nota: 5,
        asistencia: 0.80,
        temas: ["JavaScript", "CSS"]
    },
    {
        nombre: "María",
        curso: "C3",
        nota: 8,
        asistencia: 0.70,
        temas: ["React", "JavaScript"]
    },
    {
        nombre: "Pedro",
        curso: "C3",
        nota: 7,
        asistencia: 0.90,
        temas: ["React", "Next.js"]
    }
];
```

Queremos:

1. conservar solamente alumnos aprobados;
2. exigir al menos 75 % de asistencia;
3. quedarnos con nombre, curso y nota;
4. ordenar por nota descendente.

```js
const regularesAprobados = alumnos
    .filter(alumno =>
        alumno.nota >= 6 &&
        alumno.asistencia >= 0.75
    )
    .map(alumno => ({
        nombre: alumno.nombre,
        curso: alumno.curso,
        nota: alumno.nota
    }))
    .sort((a, b) => b.nota - a.nota);
```

Resultado:

```js
[
    {
        nombre: "Ana",
        curso: "C1",
        nota: 9
    },
    {
        nombre: "Pedro",
        curso: "C3",
        nota: 7
    }
]
```

Cada paso recibe el resultado del anterior:

```text
alumnos originales
       │
       ▼
filter
       │
       ▼
alumnos aprobados y regulares
       │
       ▼
map
       │
       ▼
objetos con nombre, curso y nota
       │
       ▼
sort
       │
       ▼
resultado ordenado
```

## 47. Equivalencias aproximadas entre LINQ y JavaScript

| LINQ | JavaScript | Propósito |
|---|---|---|
| `Where` | `filter` | conservar elementos |
| `Select` | `map` | transformar elementos |
| `SelectMany` | `flatMap` | transformar y aplanar |
| `Aggregate` | `reduce` | acumular |
| `Any` | `some` | comprobar si alguno cumple |
| `All` | `every` | comprobar si todos cumplen |
| `FirstOrDefault` | `find` | encontrar el primero |
| `OrderBy` | `sort` con comparador | ordenar |
| `OrderByDescending` | `sort` inverso | ordenar descendente |
| `Count` | `length` o `filter().length` | contar |
| `Contains` | `includes` | comprobar existencia |
| `Skip` | `slice` | omitir elementos |
| `Take` | `slice` | tomar elementos |
| `Distinct` | `Set` | eliminar repetidos |
| `Sum` | `reduce` | sumar |
| `GroupBy` | `reduce` | agrupar |

## 48. Ejemplos de equivalencias

### `Where`

LINQ:

```csharp
alumnos.Where(a => a.Nota >= 6);
```

JavaScript:

```js
alumnos.filter(a => a.nota >= 6);
```

### `Select`

LINQ:

```csharp
alumnos.Select(a => a.Nombre);
```

JavaScript:

```js
alumnos.map(a => a.nombre);
```

### `Any`

LINQ:

```csharp
alumnos.Any(a => a.Nota == 10);
```

JavaScript:

```js
alumnos.some(a => a.nota === 10);
```

### `All`

LINQ:

```csharp
alumnos.All(a => a.Asistencia >= 0.75);
```

JavaScript:

```js
alumnos.every(
    a => a.asistencia >= 0.75
);
```

### `FirstOrDefault`

LINQ:

```csharp
alumnos.FirstOrDefault(
    a => a.Nombre == "Ana"
);
```

JavaScript:

```js
alumnos.find(
    a => a.nombre === "Ana"
);
```

JavaScript devuelve `undefined` cuando no encuentra el elemento.

### `Sum`

LINQ:

```csharp
alumnos.Sum(a => a.Nota);
```

JavaScript:

```js
const suma = alumnos.reduce(
    (total, alumno) =>
        total + alumno.nota,
    0
);
```

### Promedio

```js
const promedio =
    alumnos.reduce(
        (total, alumno) =>
            total + alumno.nota,
        0
    ) / alumnos.length;
```

Para un array vacío conviene controlar el caso:

```js
const promedio = alumnos.length === 0
    ? 0
    : alumnos.reduce(
        (total, alumno) =>
            total + alumno.nota,
        0
    ) / alumnos.length;
```

### `Skip` y `Take`

LINQ:

```csharp
elementos
    .Skip(10)
    .Take(5);
```

JavaScript:

```js
elementos.slice(10, 15);
```

### `Distinct`

```js
const valores = [
    "JS",
    "HTML",
    "JS",
    "CSS",
    "HTML"
];

const distintos = [...new Set(valores)];
```

Resultado:

```js
["JS", "HTML", "CSS"]
```

### `SelectMany` y `Distinct`

Queremos todos los temas cursados, sin repetición:

```js
const temas = [
    ...new Set(
        alumnos.flatMap(
            alumno => alumno.temas
        )
    )
];
```

Resultado:

```js
[
    "JavaScript",
    "HTML",
    "CSS",
    "React",
    "Next.js"
]
```

## 49. Los callbacks reciben más de un argumento

Métodos como `map`, `filter` y `forEach` llaman al callback con:

```text
elemento
índice
array completo
```

Ejemplo:

```js
const letras = ["A", "B", "C"];

letras.forEach(
    (letra, indice, array) => {
        console.log(
            letra,
            indice,
            array
        );
    }
);
```

Por eso podemos usar el índice:

```js
const nombres = ["Ana", "Juan", "María"];

const numerados = nombres.map(
    (nombre, indice) =>
        `${indice + 1}. ${nombre}`
);
```

Resultado:

```js
[
    "1. Ana",
    "2. Juan",
    "3. María"
]
```

## 50. Error frecuente: olvidar `return` en una flecha con llaves

Esto no funciona como se espera:

```js
const numeros = [1, 2, 3];

const dobles = numeros.map(numero => {
    numero * 2;
});

console.log(dobles);
// [undefined, undefined, undefined]
```

Al usar llaves desaparece el retorno implícito.

Debe escribirse:

```js
const dobles = numeros.map(numero => {
    return numero * 2;
});
```

O:

```js
const dobles =
    numeros.map(numero => numero * 2);
```

## 51. Las funciones usadas en pipelines deberían ser claras

Podemos escribir:

```js
const resultado = alumnos
    .filter(a => a.nota >= 6)
    .map(a => a.nombre);
```

También podemos nombrar las operaciones:

```js
const estaAprobado =
    alumno => alumno.nota >= 6;

const obtenerNombre =
    alumno => alumno.nombre;

const resultado = alumnos
    .filter(estaAprobado)
    .map(obtenerNombre);
```

Esto permite leer:

```text
filtrar usando estaAprobado
transformar usando obtenerNombre
```

Nombrar callbacks es especialmente útil cuando:

- la condición es compleja;
- se utiliza en varios lugares;
- queremos probarla por separado;
- su nombre explica mejor la intención.

## 52. Funciones puras y efectos secundarios

Una función pura:

1. para los mismos argumentos produce siempre el mismo resultado;
2. no modifica datos externos.

Ejemplo puro:

```js
function sumar(a, b) {
    return a + b;
}
```

Otro ejemplo puro:

```js
function aplicarDescuento(
    precio,
    porcentaje
) {
    return precio -
        precio * porcentaje / 100;
}
```

Una función con efecto secundario:

```js
let total = 0;

function agregar(valor) {
    total += valor;
}
```

`agregar` modifica una variable exterior.

Los callbacks de `map`, `filter` y `reduce` suelen ser más fáciles de razonar cuando son puros:

```js
const dobles =
    numeros.map(numero => numero * 2);
```

## 53. Diferencia importante con LINQ: ejecución inmediata

Los métodos de arrays como:

```js
filter
map
reduce
```

se ejecutan inmediatamente.

```js
const resultado = alumnos
    .filter(alumno => {
        console.log("filtrando", alumno.nombre);

        return alumno.nota >= 6;
    })
    .map(alumno => {
        console.log("transformando", alumno.nombre);

        return alumno.nombre;
    });
```

Primero se ejecuta completamente `filter` y genera un array.

Luego `map` recorre ese nuevo array.

```text
array original
    ↓ filter completo
array intermedio
    ↓ map completo
array final
```

En cambio, LINQ sobre `IEnumerable<T>` suele utilizar ejecución diferida: la consulta se ejecuta al enumerarla.

Por eso el comportamiento es parecido, pero no idéntico.

## 54. Intermedios y costo de las cadenas

Esta expresión:

```js
const resultado = numeros
    .filter(numero => numero % 2 === 0)
    .map(numero => numero ** 2);
```

crea normalmente:

1. un array intermedio con los pares;
2. un array final con sus cuadrados.

Para colecciones normales esto suele ser perfectamente razonable y muy claro.

Si la cantidad de datos fuera enorme, podríamos evitar el array intermedio con un único bucle:

```js
const resultado = [];

for (const numero of numeros) {
    if (numero % 2 === 0) {
        resultado.push(numero ** 2);
    }
}
```

La cadena es más declarativa:

```text
filtrar pares
↓
elevar al cuadrado
```

El bucle puede ser más eficiente en casos extremos, pero mezcla ambas operaciones.

Primero conviene elegir claridad. Después, si existe un problema medido, se optimiza.

## 55. Una implementación más parecida a LINQ diferido

JavaScript posee iteradores y generadores, con los que podemos construir operaciones perezosas.

### `where`

```js
function* where(iterable, condicion) {
    for (const elemento of iterable) {
        if (condicion(elemento)) {
            yield elemento;
        }
    }
}
```

### `select`

```js
function* select(iterable, transformar) {
    for (const elemento of iterable) {
        yield transformar(elemento);
    }
}
```

### `take`

```js
function* take(iterable, cantidad) {
    let tomados = 0;

    for (const elemento of iterable) {
        if (tomados >= cantidad) {
            return;
        }

        yield elemento;
        tomados++;
    }
}
```

Ahora podemos crear una fuente infinita:

```js
function* naturales() {
    let numero = 1;

    while (true) {
        yield numero;
        numero++;
    }
}
```

Y construir una consulta:

```js
const pares = where(
    naturales(),
    numero => numero % 2 === 0
);

const cuadrados = select(
    pares,
    numero => numero ** 2
);

const primerosCinco = take(
    cuadrados,
    5
);

console.log([...primerosCinco]);
```

Resultado:

```js
[4, 16, 36, 64, 100]
```

La fuente es infinita, pero solamente se generan los valores necesarios.

```text
naturales
   ↓
where: solamente pares
   ↓
select: elevar al cuadrado
   ↓
take: detenerse después de 5
```

Esto se aproxima más al funcionamiento diferido de `IEnumerable<T>`.

También muestra cómo se relacionan varios conceptos:

- funciones de orden superior;
- callbacks;
- funciones generadoras;
- iteradores;
- clausuras;
- composición de operaciones.

## 56. Modelo mental de `map`, `filter` y `reduce`

Estas tres operaciones cubren una enorme cantidad de casos.

### `map`

```text
muchos elementos
       ↓
misma cantidad de elementos transformados
```

```js
[1, 2, 3]
    .map(x => x * 2)

// [2, 4, 6]
```

### `filter`

```text
muchos elementos
       ↓
algunos de esos mismos elementos
```

```js
[1, 2, 3, 4]
    .filter(x => x % 2 === 0)

// [2, 4]
```

### `reduce`

```text
muchos elementos
       ↓
un resultado acumulado
```

```js
[1, 2, 3, 4]
    .reduce(
        (total, x) => total + x,
        0
    )

// 10
```

En forma resumida:

```text
map     → transformar
filter  → seleccionar
reduce  → acumular
```

## 57. Ejemplo integrador final

```js
const ventas = [
    {
        producto: "Teclado",
        categoria: "Periféricos",
        precio: 50,
        cantidad: 2
    },
    {
        producto: "Mouse",
        categoria: "Periféricos",
        precio: 20,
        cantidad: 5
    },
    {
        producto: "Monitor",
        categoria: "Pantallas",
        precio: 300,
        cantidad: 1
    },
    {
        producto: "Webcam",
        categoria: "Periféricos",
        precio: 80,
        cantidad: 0
    }
];
```

Queremos:

1. conservar productos vendidos;
2. calcular el importe de cada producto;
3. ordenar por importe descendente;
4. calcular el total general.

### Detalle de ventas

```js
const detalle = ventas
    .filter(venta => venta.cantidad > 0)
    .map(venta => ({
        producto: venta.producto,
        categoria: venta.categoria,
        importe:
            venta.precio * venta.cantidad
    }))
    .sort(
        (a, b) => b.importe - a.importe
    );
```

Resultado:

```js
[
    {
        producto: "Monitor",
        categoria: "Pantallas",
        importe: 300
    },
    {
        producto: "Teclado",
        categoria: "Periféricos",
        importe: 100
    },
    {
        producto: "Mouse",
        categoria: "Periféricos",
        importe: 100
    }
]
```

### Total general

```js
const total = detalle.reduce(
    (acumulador, venta) =>
        acumulador + venta.importe,
    0
);

console.log(total);
// 500
```

La consulta completa expresa claramente la intención:

```text
ventas
  ↓
quedarse con las que tienen cantidad
  ↓
convertir cada venta en un importe
  ↓
ordenar por importe
  ↓
sumar los importes
```

# Resumen

Una función relaciona entradas con una salida:

```text
argumentos
    ↓
función
    ↓
valor retornado
```

Las funciones clásicas se escriben con:

```js
function sumar(a, b) {
    return a + b;
}
```

Las funciones flecha permiten formas compactas:

```js
const sumar = (a, b) => a + b;
```

Los parámetros pueden incluir:

```js
function ejemplo(
    obligatorio,
    predeterminado = 10,
    ...restantes
) {
    // ...
}
```

El alcance indica dónde existe una variable:

```text
global
función
bloque
entorno léxico
```

Una clausura permite que una función conserve acceso a su entorno:

```js
function multiplicarPor(factor) {
    return numero => numero * factor;
}
```

Las funciones de orden superior reciben o retornan funciones:

```js
function aplicar(valor, operacion) {
    return operacion(valor);
}
```

Finalmente, los métodos de arrays permiten trabajar de una forma parecida a LINQ:

```js
const resultado = elementos
    .filter(condicion)
    .map(transformacion)
    .sort(comparacion)
    .reduce(acumulacion, inicial);
```

La idea más importante es que una función no es solamente un bloque reutilizable. En JavaScript, una función también es un **valor que puede almacenarse, combinarse, enviarse y retornarse**. Esa característica es la base de los callbacks, las clausuras, las funciones de orden superior y las consultas encadenadas sobre colecciones.
