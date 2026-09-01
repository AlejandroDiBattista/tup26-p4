# 14. Funciones

## Idea central

**Una función convierte una operación en una unidad con nombre, entradas, resultado y contrato.** Cuanto más explícitas sean sus dependencias y más acotada su responsabilidad, más fácil será reutilizarla, probarla y combinarla.

## Definir no es ejecutar

```js
function sumar(a, b) {
  return a + b;
}
```

La declaración crea la función. La llamada la ejecuta:

```js
const resultado = sumar(2, 3); // 5
```

Sin paréntesis obtenemos el valor función:

```js
const operacion = sumar;
operacion(10, 20); // 30
```

Esta separación permite pasar funciones como datos.

## Anatomía de una función

```js
function calcularPrecioFinal(precio, descuento) {
  const rebaja = precio * descuento;
  return precio - rebaja;
}
```

- `calcularPrecioFinal`: nombre;
- `precio`, `descuento`: parámetros;
- cuerpo entre llaves: instrucciones;
- `return`: salida y finalización de la llamada.

Un contrato posible:

```text
precio finito no negativo + descuento entre 0 y 1
→ precio final finito no negativo
```

La sintaxis no expresa todo el contrato; nombres, validaciones, tipos, documentación y pruebas lo completan.

## Parámetros y argumentos

Los parámetros son nombres locales de la definición; los argumentos son valores de una llamada:

```js
function presentar(nombre, edad) {
  return `${nombre} tiene ${edad} años`;
}

presentar("Ana", 20);
```

JavaScript no exige la cantidad exacta:

```js
presentar("Ana");          // edad es undefined
presentar("Ana", 20, 99); // el argumento adicional se ignora
```

Que el lenguaje lo permita no significa que el contrato deba aceptarlo.

## Declaraciones de función

```js
function duplicar(numero) {
  return numero * 2;
}
```

La declaración completa se eleva, por lo que puede llamarse antes en el mismo alcance:

```js
duplicar(5);

function duplicar(numero) {
  return numero * 2;
}
```

Esto permite colocar la función principal antes de detalles auxiliares. No hace falta depender de la elevación si el orden natural ya es claro.

## Expresiones de función

```js
const duplicar = function (numero) {
  return numero * 2;
};
```

La variable sigue las reglas de `const`; no puede usarse antes de la inicialización.

Una expresión puede tener nombre interno:

```js
const factorial = function calcular(n) {
  if (n <= 1) return 1;
  return n * calcular(n - 1);
};
```

El nombre mejora pilas de error y permite recursión sin depender del nombre exterior.

## Funciones flecha

```js
const duplicar = numero => numero * 2;
```

Formas:

```js
const constante = () => 42;
const sumar = (a, b) => a + b;
const procesar = valor => {
  const normalizado = Number(valor);
  return normalizado * 2;
};
```

Para devolver un objeto literal de forma implícita, hacen falta paréntesis:

```js
const crearAlumno = nombre => ({ nombre, activo: true });
```

Sin paréntesis, las llaves se interpretan como cuerpo.

## Flechas y funciones tradicionales no son idénticas

Las flechas:

- no crean su propio `this`;
- no tienen `arguments` propio;
- no pueden llamarse con `new`;
- no tienen `prototype` para instancias;
- no pueden ser generadores.

Son excelentes para callbacks que deben conservar el contexto exterior:

```js
const temporizador = {
  segundos: 0,
  iniciar() {
    setInterval(() => {
      this.segundos += 1;
    }, 1000);
  }
};
```

La flecha usa el `this` de `iniciar`.

Para un método que recibe `this` del objeto, usá sintaxis de método o función tradicional:

```js
const cuenta = {
  saldo: 100,
  depositar(importe) {
    this.saldo += importe;
  }
};
```

## `this` depende de la llamada

En una función tradicional, `this` no queda determinado solo por dónde fue escrita:

```js
const persona = {
  nombre: "Ana",
  saludar() {
    return `Hola, ${this.nombre}`;
  }
};

persona.saludar(); // this es persona
```

Separar el método puede perder el receptor:

```js
const saludar = persona.saludar;
// saludar(); // this es undefined en modo estricto
```

`bind` crea una función con receptor fijado:

```js
const saludarAna = persona.saludar.bind(persona);
```

`call` y `apply` invocan inmediatamente con un `this` elegido:

```js
persona.saludar.call({ nombre: "Luis" });
```

No uses `this` cuando parámetros explícitos harían la dependencia más clara.

## Valores predeterminados

```js
function saludar(nombre, saludo = "Hola") {
  return `${saludo}, ${nombre}`;
}
```

El predeterminado se aplica ante argumento omitido o `undefined`, no `null`. Puede depender de parámetros anteriores:

```js
function crearRango(inicio, fin = inicio, paso = 1) {
  // ...
}
```

La expresión predeterminada se evalúa en cada llamada, lo que evita compartir accidentalmente un array creado allí:

```js
function agregar(valor, lista = []) {
  lista.push(valor);
  return lista;
}
```

Cada llamada sin segundo argumento recibe un array nuevo.

## Parámetros rest

```js
function sumar(...numeros) {
  return numeros.reduce((total, numero) => total + numero, 0);
}

sumar(1, 2, 3); // 6
```

El rest debe ser el último parámetro y siempre es un array. Reemplaza muchos usos del objeto histórico `arguments`.

```js
function registrar(nivel, ...mensajes) {
  console.log(nivel, mensajes.join(" "));
}
```

## `arguments`

Las funciones tradicionales tienen un objeto similar a array:

```js
function cantidadDeArgumentos() {
  return arguments.length;
}
```

No es un array real, aunque es iterable en entornos modernos. Rest ofrece un contrato visible, funciona en flechas y da directamente un array.

## Parámetros desestructurados

```js
function calcularTotal({ precio, cantidad = 1, descuento = 0 }) {
  return precio * cantidad * (1 - descuento);
}
```

La llamada se vuelve descriptiva:

```js
calcularTotal({ precio: 100, descuento: 0.1, cantidad: 2 });
```

También arrays:

```js
function distancia([x1, y1], [x2, y2]) {
  return Math.hypot(x2 - x1, y2 - y1);
}
```

La desestructuración no sustituye la validación. Una entrada `null` falla antes de entrar al cuerpo.

## Pasaje de argumentos: siempre por valor

Con primitivos, la función recibe una copia del valor:

```js
function duplicar(numero) {
  numero *= 2;
}

let cantidad = 3;
duplicar(cantidad);
cantidad; // 3
```

Con objetos, el valor copiado es una referencia. La función puede modificar el mismo objeto:

```js
function cumplirAnios(persona) {
  persona.edad += 1;
}

const ana = { edad: 20 };
cumplirAnios(ana);
ana.edad; // 21
```

Reemplazar la referencia local no reemplaza la exterior:

```js
function reemplazar(persona) {
  persona = { edad: 0 };
}

reemplazar(ana);
ana.edad; // sigue 21
```

Decir “los objetos se pasan por referencia” es una simplificación que confunde este último caso. Se pasa por valor una referencia.

## `return`: resultado y salida

```js
function absoluto(numero) {
  if (numero >= 0) return numero;
  return -numero;
}
```

Una función sin `return`, o con `return;`, devuelve `undefined`.

`console.log` no reemplaza el retorno:

```js
function dobleIncorrecto(n) {
  console.log(n * 2);
}

const valor = dobleIncorrecto(3); // undefined
```

El valor mostrado no puede componerse en otro cálculo.

## Inserción automática después de `return`

Un salto inmediatamente después de `return` puede terminar la sentencia:

```js
function incorrecta() {
  return
  {
    ok: true
  };
}
```

Devuelve `undefined`. La llave del objeto debe comenzar en la misma línea o ir entre paréntesis:

```js
function correcta() {
  return {
    ok: true
  };
}
```

## Devolver varios datos

Un objeto ofrece nombres:

```js
function analizar(numeros) {
  return {
    minimo: Math.min(...numeros),
    maximo: Math.max(...numeros)
  };
}

const { minimo, maximo } = analizar([3, 1, 7]);
```

Un array es adecuado si las posiciones tienen una convención breve y estable:

```js
function cocienteYResto(a, b) {
  return [Math.trunc(a / b), a % b];
}

const [cociente, resto] = cocienteYResto(10, 3);
```

Para contratos públicos, los nombres suelen evolucionar mejor.

## Alcance de función y alcance léxico

```js
const tasa = 0.21;

function conImpuesto(precio) {
  const impuesto = precio * tasa;
  return precio + impuesto;
}
```

La función consulta `tasa` en el lugar donde fue definida, no en el lugar desde donde se llama. Esa es la base de las clausuras.

## Clausuras

```js
function crearMultiplicador(factor) {
  return numero => numero * factor;
}

const duplicar = crearMultiplicador(2);
const triplicar = crearMultiplicador(3);
```

Las funciones devueltas conservan su propio `factor`.

Una clausura puede mantener estado:

```js
function crearContador(inicial = 0) {
  let valor = inicial;

  return {
    incrementar() {
      valor += 1;
      return valor;
    },
    leer() {
      return valor;
    }
  };
}
```

`valor` no es accesible directamente. Cada llamada a `crearContador` crea una variable independiente.

La clausura conserva la variable, no una fotografía:

```js
function ejemplo() {
  let valor = 1;
  const leer = () => valor;
  valor = 2;
  return leer;
}

ejemplo()(); // 2
```

## Clausuras y bucles

`let` crea una vinculación por iteración:

```js
const funciones = [];

for (let i = 0; i < 3; i += 1) {
  funciones.push(() => i);
}

funciones.map(fn => fn()); // [0, 1, 2]
```

Con `var`, todas compartirían la misma variable final y devolverían `3`. Esta diferencia fue una razón importante para adoptar `let`.

## Funciones como valores

```js
const operaciones = {
  sumar: (a, b) => a + b,
  restar: (a, b) => a - b
};

operaciones.sumar(3, 2);
```

Pueden almacenarse en arrays, objetos, mapas y pasarse a otras funciones.

## Callbacks y funciones de orden superior

Una función de orden superior recibe o devuelve funciones:

```js
function aplicar(operacion, a, b) {
  return operacion(a, b);
}

aplicar((a, b) => a * b, 3, 4); // 12
```

El callback puede ejecutarse inmediatamente, varias veces o en el futuro. El contrato debe aclararlo, especialmente si puede ser asincrónico.

## Recursividad

```js
function factorial(n) {
  if (!Number.isInteger(n) || n < 0) {
    throw new RangeError("n debe ser un entero no negativo");
  }

  if (n <= 1) return 1;
  return n * factorial(n - 1);
}
```

Toda recursión necesita caso base y reducción. Para secuencias lineales grandes, un bucle evita límites de pila. El capítulo 16 la aplica a árboles.

## Funciones asincrónicas

Una función `async` siempre devuelve una promesa:

```js
async function cargarUsuario(id) {
  const respuesta = await fetch(`/api/usuarios/${id}`);
  if (!respuesta.ok) throw new Error(`HTTP ${respuesta.status}`);
  return respuesta.json();
}

const usuario = await cargarUsuario(10);
```

Un `return valor` se convierte en una promesa resuelta; un `throw`, en una rechazada. `await` pausa esa función, no todo el proceso.

## Generadores

Una función generadora puede pausar y producir varios valores:

```js
function* rango(inicio, fin) {
  for (let valor = inicio; valor <= fin; valor += 1) {
    yield valor;
  }
}

const iterador = rango(1, 3);
iterador.next(); // { value: 1, done: false }
[...rango(1, 3)]; // [1, 2, 3]
```

El cuerpo no se ejecuta al crear el iterador; avanza bajo demanda. Los generadores asincrónicos combinan `async function*`, `await` y `yield` y se consumen con `for await...of`.

## Diseñar una función productiva

Una buena función:

- tiene un nombre que expresa una acción o cálculo;
- realiza una responsabilidad principal;
- recibe sus dependencias relevantes;
- devuelve datos reutilizables en lugar de solo imprimir;
- no modifica argumentos sin que el contrato lo anuncie;
- valida en el nivel correcto;
- mantiene una interfaz pequeña;
- permite comprobar casos normales, límites y errores.

Ejemplo con dependencia explícita:

```js
function crearServicioDeUsuarios({ repositorio, reloj, generarId }) {
  return {
    async registrar(datos) {
      const usuario = {
        id: generarId(),
        creadoEn: reloj.ahora(),
        ...datos
      };

      await repositorio.guardar(usuario);
      return usuario;
    }
  };
}
```

Las dependencias pueden sustituirse en pruebas sin depender de variables globales.

## Errores frecuentes

- confundir la función con su ejecución;
- olvidar `return`;
- usar una flecha como método esperando un `this` propio;
- mutar un argumento sin avisar;
- depender de demasiados globales;
- crear parámetros opcionales que ocultan errores;
- escribir una función enorme con decisiones y efectos mezclados;
- olvidar `await` o no devolver la promesa;
- usar recursión sin reducción o caso base.

## Práctica guiada

Diseñá un servicio de cotización que reciba funciones para obtener la tasa, registrar eventos y consultar descuentos. Debe devolver una cotización sin imprimirla, validar argumentos, permitir callbacks sin efectos en pruebas y exponer una función especializada mediante clausura. Implementá una versión síncrona y otra asincrónica.

## Para recordar

- Definir una función crea un valor; llamarla ejecuta una nueva invocación.
- Declaraciones, expresiones y flechas comparten capacidades, pero difieren en elevación, `this`, `arguments` y construcción.
- JavaScript pasa todos los argumentos por valor; para objetos, ese valor es una referencia.
- Una clausura conserva acceso al alcance léxico y puede encapsular configuración o estado.
- Una función productiva tiene contrato, dependencias explícitas y resultado comprobable.
