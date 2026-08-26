# Programación IV — Estructuras de control en JavaScript

## Decisiones, bucles, `switch` y excepciones

Un programa sencillo ejecuta sus instrucciones en el orden en que fueron escritas. Una aplicación real necesita algo más: elegir caminos, repetir tareas, abandonar una operación o transferir el control cuando ocurre un error.

El **flujo de control** es el orden en el que se ejecutan las instrucciones. Las estructuras de control permiten modificar ese orden de manera explícita:

- `if`, `else` y `switch` seleccionan caminos;
- `while`, `do...while` y `for` repiten instrucciones;
- `break` y `continue` alteran una repetición;
- `return` termina una función;
- `throw` interrumpe el flujo normal y propaga una excepción.

En esta clase estudiaremos cada estructura a partir de la pregunta que responde. El objetivo no es solamente aprender la sintaxis, sino poder elegir la forma que haga visible la regla del problema.

Al finalizar este apunte deberíamos poder:

- escribir condiciones simples, encadenadas y anidadas;
- simplificar decisiones mediante expresiones booleanas y guardas;
- distinguir una sentencia `if` del operador ternario;
- construir bucles con `while`, `do...while` y `for`;
- anticipar el orden de evaluación de un bucle;
- utilizar `break` y `continue` sin ocultar la lógica principal;
- explicar el *fall-through* de un `switch`;
- elegir entre `for`, `for...of` y `for...in`;
- lanzar, propagar, capturar y enriquecer excepciones;
- reconocer cuándo una excepción es apropiada y cuándo conviene una decisión normal.

---

## 1. El flujo normal y sus desvíos

En ausencia de estructuras de control, JavaScript ejecuta una sentencia y continúa con la siguiente:

```js
const precio = 1000;
const cantidad = 3;
const total = precio * cantidad;

console.log(total);
```

Podemos representar ese flujo como una línea:

```text
instrucción 1 → instrucción 2 → instrucción 3 → fin
```

Una condición agrega una bifurcación:

```text
                   ┌─ condición verdadera ─► camino A ─┐
inicio ─► decisión ┤                                    ├─► continúa
                   └─ condición falsa ─────► camino B ─┘
```

Un bucle agrega un regreso controlado:

```text
             ┌──────── condición verdadera ◄───────┐
             ↓                                     │
inicio ─► condición ─► cuerpo ─► actualización ────┘
             │
             └──────── condición falsa ─► continúa
```

Una excepción produce una salida abrupta y busca un manejador:

```text
función C ── throw
    ↑ descarta su ejecución pendiente
función B
    ↑ propaga
función A ── catch ─► maneja o vuelve a lanzar
```

Todas estas construcciones responden a la misma pregunta: **¿cuál es la próxima instrucción que debe ejecutarse?**

---

## 2. `if`: ejecutar cuando se cumple una condición

La forma básica es:

```js
if (condicion) {
  // se ejecuta si la condición es truthy
}
```

Ejemplo:

```js
const edad = 20;

if (edad >= 18) {
  console.log("Puede registrarse");
}
```

La condición puede ser cualquier expresión. JavaScript la interpreta en un contexto booleano. Si es truthy, ejecuta el bloque; si es falsy, lo omite.

```js
const nombre = "Ana";

if (nombre) {
  console.log(`Hola, ${nombre}`);
}
```

Aunque las llaves son opcionales para una sola sentencia, utilizarlas siempre evita ambigüedades al modificar el código:

```js
if (edad >= 18) {
  console.log("Puede registrarse");
}
```

### Condiciones expresivas

Una condición debería leerse como una pregunta del dominio:

```js
const tieneEdadPermitida = edad >= 18;
const tieneDocumento = documento !== null;
const puedeRegistrarse = tieneEdadPermitida && tieneDocumento;

if (puedeRegistrarse) {
  registrarUsuario();
}
```

Nombrar una condición compleja puede comunicar mejor la regla y permite depurar cada parte.

No es necesario comparar un booleano con `true`:

```js
if (estaActivo) {
  // ...
}

// Evitar si no existe una razón particular:
if (estaActivo === true) {
  // ...
}
```

La comparación explícita sí puede tener sentido cuando queremos distinguir el booleano `true` de otros valores truthy.

---

## 3. `else`: elegir entre dos caminos

`else` define qué hacer cuando la condición del `if` es falsy:

```js
if (saldo >= importe) {
  console.log("Compra aprobada");
} else {
  console.log("Saldo insuficiente");
}
```

Solamente uno de los dos bloques se ejecuta.

```text
saldo >= importe
      ├─ true  ─► compra aprobada
      └─ false ─► saldo insuficiente
```

`else` no lleva una condición propia. Representa todos los casos que no fueron aceptados por el `if` anterior.

### El operador condicional o ternario

Cuando la decisión produce uno de dos valores, el operador ternario puede ser más directo:

```js
const estado = nota >= 6 ? "aprobado" : "desaprobado";
```

Su forma es:

```text
condición ? valorSiVerdadera : valorSiFalsa
```

La versión con `if...else` necesita una variable reasignable:

```js
let estado;

if (nota >= 6) {
  estado = "aprobado";
} else {
  estado = "desaprobado";
}
```

El ternario es una **expresión**: produce un valor. `if` es una **sentencia**: controla qué bloque se ejecuta.

Conviene utilizar el ternario para una elección breve. Los ternarios anidados suelen esconder la jerarquía de condiciones:

```js
// Difícil de leer
const categoria = nota >= 9
  ? "destacado"
  : nota >= 6
    ? "aprobado"
    : "desaprobado";
```

En ese caso, un encadenamiento o una función con guardas resulta más claro.

---

## 4. Encadenamiento con `else if`

Cuando existen más de dos alternativas excluyentes, las condiciones pueden evaluarse en secuencia:

```js
function clasificarNota(nota) {
  if (nota >= 9) {
    return "destacado";
  } else if (nota >= 6) {
    return "aprobado";
  } else if (nota >= 4) {
    return "recupera";
  } else {
    return "desaprobado";
  }
}
```

JavaScript prueba las condiciones de arriba hacia abajo y ejecuta solamente el primer bloque cuya condición sea truthy.

El orden forma parte del significado. Esta versión está mal ordenada:

```js
if (nota >= 6) {
  return "aprobado";
} else if (nota >= 9) {
  return "destacado"; // nunca se alcanza
}
```

Toda nota mayor o igual que nueve también es mayor o igual que seis. El primer caso la captura antes.

Una cadena `else if` resulta apropiada cuando:

- las alternativas son mutuamente excluyentes;
- existe una prioridad clara;
- solamente debe ejecutarse una rama.

Si varias condiciones independientes pueden cumplirse, deben utilizarse varios `if`:

```js
if (tieneErrores) {
  mostrarErrores();
}

if (tieneAdvertencias) {
  mostrarAdvertencias();
}
```

---

## 5. Condiciones anidadas

Un `if` puede aparecer dentro de otro:

```js
if (usuario !== null) {
  if (usuario.estaActivo) {
    if (usuario.esAdministrador) {
      mostrarPanelDeAdministracion();
    }
  }
}
```

El anidamiento expresa que una pregunta solamente tiene sentido después de responder otra. No es incorrecto por sí mismo, pero demasiados niveles desplazan la lógica principal hacia la derecha y obligan a recordar muchas condiciones.

### Combinar condiciones

Si las condiciones describen una misma decisión, pueden combinarse:

```js
if (
  usuario !== null &&
  usuario.estaActivo &&
  usuario.esAdministrador
) {
  mostrarPanelDeAdministracion();
}
```

El cortocircuito de `&&` evita acceder a `usuario.estaActivo` cuando `usuario` es `null`.

Con encadenamiento opcional:

```js
if (usuario?.estaActivo && usuario.esAdministrador) {
  mostrarPanelDeAdministracion();
}
```

No todo anidamiento puede reemplazarse mecánicamente por `&&`. Si cada nivel tiene un `else` diferente, las ramas representan decisiones distintas y deben conservarse o reorganizarse con cuidado.

### Leyes de De Morgan

Estas equivalencias ayudan a simplificar negaciones:

```text
!(a && b) equivale a !a || !b
!(a || b) equivale a !a && !b
```

Ejemplo:

```js
if (!(esDocente || esAlumno)) {
  rechazarAcceso();
}

// Equivale a:
if (!esDocente && !esAlumno) {
  rechazarAcceso();
}
```

La mejor versión es la que expresa con mayor claridad la regla del dominio.

---

## 6. Guardas y retorno temprano

Una **guarda** verifica al comienzo una condición que impide continuar. Si se cumple, la función termina temprano.

Versión anidada:

```js
function procesarCompra(usuario, carrito) {
  if (usuario !== null) {
    if (usuario.estaActivo) {
      if (carrito.length > 0) {
        return confirmarCompra(usuario, carrito);
      } else {
        return { ok: false, motivo: "carrito vacío" };
      }
    } else {
      return { ok: false, motivo: "usuario inactivo" };
    }
  } else {
    return { ok: false, motivo: "falta usuario" };
  }
}
```

Versión con guardas:

```js
function procesarCompra(usuario, carrito) {
  if (usuario === null) {
    return { ok: false, motivo: "falta usuario" };
  }

  if (!usuario.estaActivo) {
    return { ok: false, motivo: "usuario inactivo" };
  }

  if (carrito.length === 0) {
    return { ok: false, motivo: "carrito vacío" };
  }

  return confirmarCompra(usuario, carrito);
}
```

Las guardas dejan el camino principal al nivel izquierdo y separan cada impedimento.

### Retornar o lanzar

Una guarda puede devolver un resultado esperado:

```js
if (carrito.length === 0) {
  return { ok: false, motivo: "carrito vacío" };
}
```

También puede lanzar una excepción si continuar violaría el contrato de la función:

```js
function calcularPromedio(notas) {
  if (!Array.isArray(notas)) {
    throw new TypeError("notas debe ser un array");
  }

  if (notas.length === 0) {
    throw new RangeError("no se puede promediar un array vacío");
  }

  return notas.reduce((suma, nota) => suma + nota, 0) / notas.length;
}
```

La elección depende del contrato: un resultado de negocio previsible suele devolverse; una imposibilidad para cumplir la operación puede representarse mediante una excepción.

---

## 7. `while`: repetir mientras una condición sea verdadera

La sintaxis es:

```js
while (condicion) {
  // cuerpo
}
```

`while` evalúa la condición antes de cada repetición. Si inicialmente es falsy, el cuerpo no se ejecuta ninguna vez.

```js
let numero = 1;

while (numero <= 5) {
  console.log(numero);
  numero += 1;
}
```

Orden de ejecución:

```text
1. evaluar condición
2. si es falsa, terminar
3. ejecutar cuerpo
4. volver al paso 1
```

### El progreso debe ser visible

Todo bucle necesita una razón para terminar. En el ejemplo, `numero += 1` acerca el estado a la condición de salida.

```js
let numero = 1;

while (numero <= 5) {
  console.log(numero);
  // Falta actualizar numero: bucle infinito
}
```

No todos los bucles avanzan mediante un contador. También pueden consumir una colección o cambiar un estado:

```js
const tareas = ["validar", "guardar", "notificar"];

while (tareas.length > 0) {
  const tarea = tareas.shift();
  console.log(`Procesando: ${tarea}`);
}
```

Esta versión muta la cola. Si la colección original debe conservarse, puede trabajarse sobre una copia.

### Casos apropiados para `while`

`while` resulta natural cuando no sabemos de antemano cuántas repeticiones serán necesarias:

- reintentar hasta alcanzar un límite o tener éxito;
- consumir una cola mientras tenga elementos;
- leer hasta encontrar una marca de finalización;
- repetir un algoritmo hasta que su estado converja;
- mantener un servicio mientras continúe activo.

Ejemplo con cantidad máxima de intentos:

```js
let intentos = 0;
let autenticado = false;

while (intentos < 3 && !autenticado) {
  autenticado = intentarAutenticacion();
  intentos += 1;
}
```

---

## 8. `do...while`: ejecutar al menos una vez

`do...while` evalúa la condición después del cuerpo:

```js
do {
  // cuerpo
} while (condicion);
```

Por eso siempre realiza al menos una iteración:

```js
let pagina = 1;
const totalPaginas = 3;

do {
  console.log(`Procesando página ${pagina}`);
  pagina += 1;
} while (pagina <= totalPaginas);
```

Incluso si la condición inicial fuera falsa, el cuerpo se ejecutaría una vez.

```js
let valor = 10;

do {
  console.log(valor); // 10
} while (valor < 5);
```

`do...while` es útil cuando la primera acción debe ocurrir antes de poder decidir si se repite:

- mostrar un menú y luego evaluar la opción;
- solicitar un dato y luego validarlo;
- ejecutar una operación y decidir si debe reintentarse;
- procesar la primera página antes de saber si existe otra.

La diferencia esencial es:

| Bucle | Momento de la condición | Mínimo de ejecuciones |
|---|---|---:|
| `while` | antes del cuerpo | 0 |
| `do...while` | después del cuerpo | 1 |

---

## 9. `break`: terminar una repetición

`break` abandona inmediatamente el bucle más cercano:

```js
const numeros = [3, 8, -1, 10];

for (const numero of numeros) {
  if (numero < 0) {
    break;
  }

  console.log(numero);
}

// Muestra 3 y 8
```

`-1` actúa como una señal de finalización. El `10` nunca se procesa.

Un bucle deliberadamente infinito puede terminar mediante una guarda y `break`:

```js
let indice = 0;

while (true) {
  if (indice >= datos.length) {
    break;
  }

  procesar(datos[indice]);
  indice += 1;
}
```

Esta forma puede ser válida cuando la condición de salida resulta más clara dentro del cuerpo. Aun así, si puede expresarse con precisión en la cabecera, suele preferirse:

```js
while (indice < datos.length) {
  procesar(datos[indice]);
  indice += 1;
}
```

---

## 10. `continue`: pasar a la siguiente iteración

`continue` omite el resto del cuerpo actual y comienza la próxima iteración:

```js
const valores = [10, null, 20, undefined, 30];
let total = 0;

for (const valor of valores) {
  if (valor === null || valor === undefined) {
    continue;
  }

  total += valor;
}

console.log(total); // 60
```

Puede verse como una guarda dentro del bucle: descarta temprano los elementos que no deben procesarse.

Sin `continue`, el mismo código necesita anidamiento:

```js
for (const valor of valores) {
  if (valor !== null && valor !== undefined) {
    total += valor;
  }
}
```

Ambas versiones son correctas. `continue` resulta útil cuando deja un camino principal simple.

En un `for`, después de `continue` se ejecuta la expresión de actualización y luego se vuelve a evaluar la condición. En un `while`, salta directamente a la condición; por eso debemos asegurarnos de no omitir accidentalmente la actualización:

```js
let indice = 0;

while (indice < valores.length) {
  const valor = valores[indice];
  indice += 1; // actualizar antes de cualquier continue

  if (valor === null) {
    continue;
  }

  procesar(valor);
}
```

### Bucles anidados y etiquetas

Sin una etiqueta, `break` y `continue` afectan solamente al bucle más cercano.

JavaScript admite etiquetas para dirigirlos a un bucle exterior:

```js
busqueda:
for (let fila = 0; fila < matriz.length; fila += 1) {
  for (let columna = 0; columna < matriz[fila].length; columna += 1) {
    if (matriz[fila][columna] === objetivo) {
      console.log(fila, columna);
      break busqueda;
    }
  }
}
```

Las etiquetas existen, pero su uso frecuente puede dificultar la lectura. Extraer la búsqueda a una función y utilizar `return` suele ofrecer una estructura más clara.

---

## 11. `switch`: seleccionar por un valor

`switch` compara una expresión con una serie de casos:

```js
switch (expresion) {
  case valor1:
    // instrucciones
    break;

  case valor2:
    // instrucciones
    break;

  default:
    // si ningún caso coincide
}
```

Ejemplo:

```js
function describirEstado(estado) {
  switch (estado) {
    case "pendiente":
      return "Todavía no fue procesado";

    case "aprobado":
      return "La operación fue aprobada";

    case "rechazado":
      return "La operación fue rechazada";

    default:
      return "Estado desconocido";
  }
}
```

`switch` resulta apropiado cuando una misma expresión se compara contra valores discretos. La comparación es estricta, equivalente en lo esencial a `===`:

```js
const valor = "1";

switch (valor) {
  case 1:
    console.log("número");
    break;

  case "1":
    console.log("cadena"); // coincide
    break;
}
```

`default` es opcional y puede ubicarse en otra posición, aunque escribirlo al final suele ser más claro.

### `break` o `return`

`break` termina el `switch` y continúa después de él:

```js
let mensaje;

switch (estado) {
  case "ok":
    mensaje = "Correcto";
    break;

  default:
    mensaje = "Desconocido";
}

console.log(mensaje);
```

Si el `switch` está dentro de una función y cada caso devuelve un resultado, `return` ya termina la función y no necesita `break`.

---

## 12. *Fall-through*: continuar en el caso siguiente

Si un caso no termina con `break`, `return` o `throw`, la ejecución continúa por las instrucciones del caso siguiente. Este comportamiento se llama **fall-through**.

```js
const nivel = 2;

switch (nivel) {
  case 1:
    console.log("Nivel básico");
    break;

  case 2:
    console.log("Nivel intermedio");
    // Falta break

  case 3:
    console.log("Nivel avanzado");
    break;
}
```

La salida es:

```text
Nivel intermedio
Nivel avanzado
```

Después de encontrar `case 2`, JavaScript no vuelve a comparar `case 3`: simplemente continúa ejecutando sus instrucciones.

### *Fall-through* accidental

La omisión de `break` es una fuente clásica de errores. Cuando no es intencional, cada caso debe finalizar explícitamente.

### *Fall-through* intencional

Puede utilizarse para agrupar varios valores bajo el mismo comportamiento:

```js
switch (dia) {
  case "sábado":
  case "domingo":
    console.log("Fin de semana");
    break;

  default:
    console.log("Día laborable");
}
```

Los primeros casos no tienen instrucciones; todos conducen al mismo bloque.

También puede acumular capacidades:

```js
switch (rol) {
  case "administrador":
    permisos.add("eliminar");
    // continúa intencionalmente

  case "editor":
    permisos.add("editar");
    // continúa intencionalmente

  case "lector":
    permisos.add("leer");
    break;
}
```

Cuando el *fall-through* contiene instrucciones, debe comentarse para dejar claro que no falta un `break`.

### Alcance dentro de `switch`

Todo el `switch` comparte un bloque léxico. Declarar el mismo nombre con `const` en varios casos produce un error, aunque solamente se ejecute uno:

```js
switch (tipo) {
  case "a": {
    const mensaje = "Tipo A";
    console.log(mensaje);
    break;
  }

  case "b": {
    const mensaje = "Tipo B";
    console.log(mensaje);
    break;
  }
}
```

Los bloques adicionales `{}` crean un alcance independiente por caso.

---

## 13. `while` convertido en `for`

Muchos bucles con contador comparten tres partes:

1. inicialización;
2. condición;
3. actualización.

Con `while` aparecen separadas:

```js
let indice = 0;

while (indice < alumnos.length) {
  console.log(alumnos[indice]);
  indice += 1;
}
```

El `for` tradicional las reúne en su cabecera:

```js
for (let indice = 0; indice < alumnos.length; indice += 1) {
  console.log(alumnos[indice]);
}
```

Su forma general es:

```js
for (inicializacion; condicion; actualizacion) {
  // cuerpo
}
```

El orden real es:

```text
1. inicialización                    una sola vez
2. condición                         antes de cada vuelta
3. cuerpo                            si la condición es truthy
4. actualización                     después del cuerpo
5. volver al paso 2
```

### Cuándo elegir `for`

`for` es natural cuando la progresión está controlada por un contador:

```js
for (let numero = 1; numero <= 10; numero += 1) {
  console.log(numero);
}
```

También permite otras progresiones:

```js
for (let par = 0; par <= 20; par += 2) {
  console.log(par);
}

for (let indice = alumnos.length - 1; indice >= 0; indice -= 1) {
  console.log(alumnos[indice]);
}
```

Las tres expresiones son opcionales:

```js
for (;;) {
  if (debeTerminar()) {
    break;
  }
}
```

Esto representa un bucle infinito equivalente a `while (true)`. Debe existir una salida clara dentro del cuerpo.

---

## 14. `for...of`: recorrer valores de un iterable

`for...of` recorre los valores producidos por un iterable:

```js
const notas = [8, 6, 9];

for (const nota of notas) {
  console.log(nota);
}
```

Es apropiado para arrays, cadenas, `Map`, `Set` y otras estructuras iterables.

```js
for (const caracter of "TUP") {
  console.log(caracter);
}
```

Con un `Map`, cada valor iterado es un par `[clave, valor]`:

```js
const stock = new Map([
  ["A10", 5],
  ["B20", 8],
]);

for (const [codigo, cantidad] of stock) {
  console.log(`${codigo}: ${cantidad}`);
}
```

Con un `Set`, recorre cada valor único:

```js
const permisos = new Set(["leer", "editar"]);

for (const permiso of permisos) {
  console.log(permiso);
}
```

Si necesitamos índice y valor de un array:

```js
for (const [indice, nota] of notas.entries()) {
  console.log(indice, nota);
}
```

`break` y `continue` funcionan normalmente en `for...of`.

Un objeto común no es iterable de manera directa:

```js
const alumno = { nombre: "Ana", legajo: 12345 };

// for (const valor of alumno) {} // TypeError
```

Podemos convertir sus propiedades en un iterable mediante `Object.entries()`.

---

## 15. `for...in`: recorrer claves enumerables

`for...in` recorre nombres de propiedades enumerables de un objeto. Las claves obtenidas son cadenas:

```js
const alumno = {
  nombre: "Ana",
  legajo: 12345,
  regular: true,
};

for (const propiedad in alumno) {
  console.log(propiedad, alumno[propiedad]);
}
```

Puede incluir propiedades enumerables heredadas. Para trabajar únicamente con propiedades propias:

```js
for (const propiedad in alumno) {
  if (!Object.hasOwn(alumno, propiedad)) {
    continue;
  }

  console.log(propiedad, alumno[propiedad]);
}
```

En muchos casos resulta más directo combinar `Object.entries()` con `for...of`:

```js
for (const [propiedad, valor] of Object.entries(alumno)) {
  console.log(propiedad, valor);
}
```

No se recomienda `for...in` para arrays porque recorre nombres de propiedades, no solamente valores ni necesariamente únicamente índices:

```js
const notas = [8, 6, 9];
notas.descripcion = "Primer parcial";

for (const clave in notas) {
  console.log(clave);
}

// "0", "1", "2", "descripcion"
```

### Elección rápida

| Estructura | Recorrido habitual |
|---|---|
| array sin necesidad de índice | `for...of` |
| array con control de índice | `for` |
| `Map` o `Set` | `for...of` |
| propiedades propias de objeto | `for...of Object.entries(objeto)` |
| inspección de propiedades enumerables | `for...in`, considerando herencia |

---

## 16. Elegir el bucle apropiado

| Pregunta | Construcción sugerida |
|---|---|
| ¿Se repite mientras cambie un estado y no conocemos la cantidad? | `while` |
| ¿Debe ejecutarse al menos una vez? | `do...while` |
| ¿Existe un contador con inicio, condición y paso? | `for` |
| ¿Queremos cada valor de un iterable? | `for...of` |
| ¿Queremos nombres de propiedades enumerables? | `for...in` |
| ¿Queremos transformar un array completo? | `map()` |
| ¿Queremos seleccionar elementos? | `filter()` |
| ¿Queremos encontrar uno y detenernos? | `find()` o `for...of` |
| ¿Queremos saber si alguno cumple? | `some()` |
| ¿Queremos acumular un resultado? | `reduce()` o un bucle con acumulador |

Los métodos de arrays también controlan la iteración, pero no reemplazan todos los bucles. `for...of` permite `break`, `continue`, `return` desde la función contenedora y `await` de manera secuencial cuando corresponda. `forEach()` no ofrece esas mismas salidas.

---

## 17. Excepciones: una salida abrupta

Una excepción representa que la operación no puede continuar normalmente. Puede ser generada por el lenguaje:

```js
const alumno = null;
console.log(alumno.nombre);
// TypeError
```

O lanzada por nuestro programa:

```js
function dividir(dividendo, divisor) {
  if (divisor === 0) {
    throw new RangeError("El divisor no puede ser cero");
  }

  return dividendo / divisor;
}
```

`throw` termina inmediatamente la ejecución actual. Las instrucciones siguientes no se ejecutan:

```js
throw new Error("No se pudo continuar");
console.log("Esta línea es inalcanzable");
```

JavaScript permite lanzar cualquier valor:

```js
throw "falló";
throw 404;
```

Pero debe preferirse un objeto `Error` o una subclase. Así se conservan propiedades como `name`, `message`, `stack` y `cause`.

### Tipos frecuentes de error

| Tipo | Uso habitual |
|---|---|
| `Error` | error general de la aplicación |
| `TypeError` | valor de un tipo o forma incompatible |
| `RangeError` | valor fuera del rango admitido |
| `ReferenceError` | referencia a un nombre inexistente o inaccesible |
| `SyntaxError` | código o texto analizado con sintaxis inválida |
| `AggregateError` | agrupación de varios errores |

El lenguaje genera algunos de estos errores automáticamente. Nuestro código también puede elegir una clase que comunique el contrato incumplido.

---

## 18. Propagación de excepciones

Cuando una función lanza y no captura una excepción, su ejecución termina y la excepción se propaga a quien la llamó:

```js
function convertirCantidad(texto) {
  const cantidad = Number(texto);

  if (!Number.isInteger(cantidad) || cantidad <= 0) {
    throw new RangeError("Cantidad inválida");
  }

  return cantidad;
}

function crearLinea(datos) {
  const cantidad = convertirCantidad(datos.cantidad);
  return { productoId: datos.productoId, cantidad };
}

function procesarSolicitud(datos) {
  return crearLinea(datos);
}
```

Si `convertirCantidad()` lanza:

1. abandona `convertirCantidad()`;
2. como `crearLinea()` no captura, también la abandona;
3. como `procesarSolicitud()` no captura, continúa propagándose;
4. termina en el primer `catch` apropiado o en el manejador del entorno.

Este proceso suele llamarse **desenrollado de la pila**.

Las excepciones permiten separar el lugar donde se detecta un problema del nivel que sabe cómo responder. Una función profunda puede detectar una cantidad inválida; una ruta HTTP puede decidir devolver una respuesta `400`.

---

## 19. `try...catch`: capturar y manejar

```js
try {
  // operación que puede lanzar
} catch (error) {
  // respuesta a la excepción
}
```

Ejemplo con JSON:

```js
function leerConfiguracion(texto) {
  try {
    return JSON.parse(texto);
  } catch (error) {
    console.error("La configuración no contiene JSON válido");
    return null;
  }
}
```

Si `JSON.parse()` termina normalmente, `catch` se omite. Si lanza, el resto del bloque `try` se abandona y el control pasa a `catch`.

### Capturar solamente lo que podemos manejar

Un `catch` demasiado amplio puede ocultar un error de programación:

```js
try {
  const configuracion = JSON.parse(texto);
  usarConfiguracion(configuracoin); // nombre mal escrito
} catch {
  return null; // también oculta el ReferenceError
}
```

Conviene limitar el `try` o distinguir el tipo:

```js
function parsearConfiguracion(texto) {
  try {
    return JSON.parse(texto);
  } catch (error) {
    if (error instanceof SyntaxError) {
      throw new Error("La configuración tiene formato inválido", {
        cause: error,
      });
    }

    throw error;
  }
}
```

`throw error` vuelve a lanzar una excepción que este nivel no sabe resolver.

### Preservar la causa

Cuando agregamos contexto, la propiedad `cause` conserva el error original:

```js
try {
  conectarBaseDeDatos();
} catch (error) {
  throw new Error("No fue posible iniciar el repositorio de alumnos", {
    cause: error,
  });
}
```

El mensaje superior explica qué operación del dominio falló; `cause` conserva el motivo técnico.

---

## 20. `finally`: ejecutar la limpieza

`finally` se ejecuta antes de salir de la construcción, tanto si hubo una excepción como si no:

```js
const conexion = abrirConexion();

try {
  guardarDatos(conexion);
} catch (error) {
  console.error("No se pudieron guardar los datos", error);
} finally {
  cerrarConexion(conexion);
}
```

Su propósito habitual es liberar recursos o restaurar estado:

- cerrar archivos o conexiones;
- liberar bloqueos;
- detener indicadores de carga;
- restaurar una configuración temporal.

`finally` también se ejecuta antes de completar un `return` o propagar un `throw`:

```js
function ejemplo() {
  try {
    return "resultado";
  } finally {
    console.log("limpieza");
  }
}
```

Debe evitarse `return`, `throw`, `break` o `continue` dentro de `finally`, porque pueden reemplazar una salida o excepción anterior:

```js
function peligroso() {
  try {
    throw new Error("error original");
  } finally {
    return "oculta el error";
  }
}
```

`finally` debería limpiar, no decidir el resultado principal.

---

## 21. Errores personalizados

Una clase de error propia permite distinguir situaciones del dominio sin analizar mensajes:

```js
class StockInsuficienteError extends Error {
  constructor(productoId, solicitado, disponible) {
    super(`Stock insuficiente para el producto ${productoId}`);
    this.name = "StockInsuficienteError";
    this.productoId = productoId;
    this.solicitado = solicitado;
    this.disponible = disponible;
  }
}
```

Puede lanzarse donde se detecta el problema:

```js
function descontarStock(producto, cantidad) {
  if (cantidad > producto.stock) {
    throw new StockInsuficienteError(
      producto.id,
      cantidad,
      producto.stock
    );
  }

  return {
    ...producto,
    stock: producto.stock - cantidad,
  };
}
```

Y manejarse según su tipo:

```js
try {
  const actualizado = descontarStock(producto, cantidad);
  guardar(actualizado);
} catch (error) {
  if (error instanceof StockInsuficienteError) {
    mostrarMensaje(`Solo quedan ${error.disponible} unidades`);
  } else {
    throw error;
  }
}
```

La excepción esperada se traduce a una respuesta del sistema. Cualquier error desconocido vuelve a propagarse.

---

## 22. Excepciones como control de flujo: alcance y límites

Una excepción es una forma de control de flujo porque interrumpe la secuencia, abandona funciones y busca un `catch`. Pero eso no significa que deba utilizarse para cualquier alternativa.

### Decisión esperada

```js
function buscarAlumno(legajo) {
  const alumno = alumnos.find((item) => item.legajo === legajo);
  return alumno ?? null;
}
```

Que una búsqueda no encuentre resultados puede ser una situación normal y representarse con `null`.

### Operación que no puede cumplir su contrato

```js
function obtenerAlumnoObligatorio(legajo) {
  const alumno = alumnos.find((item) => item.legajo === legajo);

  if (!alumno) {
    throw new Error(`No existe el alumno ${legajo}`);
  }

  return alumno;
}
```

Aquí la función promete entregar un alumno. Si no existe, no puede producir un resultado válido.

### Por qué no reemplazar `if` con excepciones

Esta versión utiliza una excepción para una decisión completamente esperada:

```js
try {
  if (!usuario.esAdministrador) {
    throw new Error("no es administrador");
  }

  mostrarPanel();
} catch {
  mostrarInicio();
}
```

Un `if...else` comunica mejor la regla:

```js
if (usuario.esAdministrador) {
  mostrarPanel();
} else {
  mostrarInicio();
}
```

Regla orientativa:

- utilizar condiciones y resultados para alternativas normales del negocio;
- utilizar excepciones cuando una operación no puede cumplir su contrato o falla una dependencia;
- capturar en el nivel que pueda recuperar, traducir o agregar contexto;
- no capturar solamente para ignorar el problema.

---

## 23. Caso integrador: procesar una solicitud de compra

```js
class ValidacionError extends Error {
  constructor(mensaje, campo) {
    super(mensaje);
    this.name = "ValidacionError";
    this.campo = campo;
  }
}

function convertirCantidad(valor) {
  const cantidad = Number(valor);

  if (!Number.isInteger(cantidad) || cantidad <= 0) {
    throw new ValidacionError(
      "La cantidad debe ser un entero positivo",
      "cantidad"
    );
  }

  return cantidad;
}

function calcularCompra(productos, solicitud) {
  if (!solicitud) {
    throw new ValidacionError("Falta la solicitud", "solicitud");
  }

  const cantidad = convertirCantidad(solicitud.cantidad);
  let productoEncontrado = null;

  for (const producto of productos) {
    if (producto.id !== solicitud.productoId) {
      continue;
    }

    productoEncontrado = producto;
    break;
  }

  if (!productoEncontrado) {
    return { ok: false, motivo: "producto inexistente" };
  }

  if (productoEncontrado.stock < cantidad) {
    return { ok: false, motivo: "stock insuficiente" };
  }

  let descuento;

  switch (solicitud.tipoCliente) {
    case "premium":
      descuento = 0.15;
      break;

    case "frecuente":
      descuento = 0.05;
      break;

    default:
      descuento = 0;
  }

  const subtotal = productoEncontrado.precio * cantidad;
  const total = subtotal * (1 - descuento);

  return {
    ok: true,
    producto: productoEncontrado.nombre,
    cantidad,
    total,
  };
}
```

Un nivel exterior puede traducir las excepciones de validación:

```js
function atenderCompra(productos, solicitud) {
  try {
    return calcularCompra(productos, solicitud);
  } catch (error) {
    if (error instanceof ValidacionError) {
      return {
        ok: false,
        motivo: error.message,
        campo: error.campo,
      };
    }

    throw error;
  }
}
```

El ejemplo combina:

- guardas para validar precondiciones;
- excepción para una entrada que viola el contrato;
- `for...of` para recorrer productos;
- `continue` para descartar los que no coinciden;
- `break` después de encontrar el producto;
- `if` para resultados normales del negocio;
- `switch` para valores discretos;
- `try...catch` en el nivel que sabe traducir el error.

---

## 24. Errores frecuentes y su explicación

### Confundir asignación con comparación

```js
if (estado = "activo") {
  // asigna "activo" y la condición resulta truthy
}
```

La comparación estricta es:

```js
if (estado === "activo") {
  // ...
}
```

### Ordenar mal un encadenamiento

Las condiciones más específicas suelen aparecer antes que las generales.

### Anidar todas las condiciones

Las guardas permiten terminar los casos inválidos y mantener visible el camino principal.

### Crear un bucle sin progreso

La condición nunca cambia y el bucle no termina. Debe identificarse qué estado lo acerca a la salida.

### Actualizar después de un `continue` inalcanzable

En un `while`, conviene actualizar antes de una posible salida con `continue` o diseñar la cabecera para que el progreso sea inevitable.

### Olvidar `break` en un `switch`

La ejecución continúa mediante *fall-through*. Si es intencional, debe quedar agrupado o comentado.

### Utilizar `for...in` para valores de un array

`for...in` recorre claves como cadenas y puede incluir propiedades adicionales. `for...of` recorre valores.

### Capturar y silenciar todos los errores

```js
try {
  ejecutar();
} catch {
  // no hace nada
}
```

El sistema pierde la causa y puede continuar en un estado inválido. Debe manejarse, traducirse, registrarse o propagarse.

### Lanzar cadenas

```js
throw "falló";
```

Es legal, pero un objeto `Error` conserva tipo, mensaje, causa y traza.

### Retornar desde `finally`

Puede ocultar un `return` o `throw` anterior. `finally` debe reservarse para limpieza.

---

## 25. Ideas que conviene conservar

1. El flujo de control determina cuál es la próxima instrucción.
2. `if` ejecuta un bloque cuando su condición es truthy; `else` cubre el camino contrario.
3. Una cadena `else if` ejecuta solamente la primera rama verdadera y su orden importa.
4. El anidamiento es válido, pero las guardas suelen hacer más visible el camino principal.
5. El ternario es una expresión apropiada para elegir entre dos valores breves.
6. `while` comprueba antes y puede ejecutar cero veces; `do...while` comprueba después y ejecuta al menos una.
7. Todo bucle necesita una condición de salida y un estado que progrese hacia ella.
8. `break` termina el bucle o `switch` más cercano; `continue` comienza la siguiente iteración.
9. `switch` compara una expresión con casos mediante igualdad estricta.
10. Sin `break`, `return` o `throw`, un caso continúa mediante *fall-through*.
11. El `for` reúne inicialización, condición y actualización.
12. `for...of` recorre valores de iterables; `for...in` recorre nombres de propiedades enumerables.
13. Un objeto común se recorre normalmente con `Object.entries()` y `for...of`.
14. `throw` abandona el flujo normal y propaga una excepción por la pila de llamadas.
15. `catch` debe capturar solamente aquello que puede manejar o traducir.
16. Al volver a lanzar con más contexto, `cause` conserva el error original.
17. `finally` se ejecuta para limpiar tanto en éxito como en error.
18. Las excepciones son control de flujo abrupto, pero no sustituyen condiciones normales.

---

## 26. Preguntas de repaso

1. ¿Qué significa flujo de control?
2. ¿Qué valores puede utilizar una condición de `if`?
3. ¿Cuándo se ejecuta un bloque `else`?
4. ¿Por qué importa el orden de una cadena `else if`?
5. ¿Cuándo conviene un ternario y cuándo un `if...else`?
6. ¿Qué problema de legibilidad resuelven las guardas?
7. ¿Qué diferencia existe entre retornar un resultado inválido y lanzar una excepción?
8. ¿Cuántas veces como mínimo se ejecutan `while` y `do...while`?
9. ¿Qué debe cambiar para que un bucle termine?
10. ¿Qué diferencia existe entre `break` y `continue`?
11. ¿Qué peligro presenta `continue` dentro de un `while`?
12. ¿Cómo afecta un `break` a bucles anidados?
13. ¿Cómo compara `switch` el valor con cada `case`?
14. ¿Qué es el *fall-through* y cuándo puede ser útil?
15. ¿En qué orden se ejecutan las partes de un `for`?
16. ¿Qué diferencia existe entre `for...of` y `for...in`?
17. ¿Por qué un objeto común no puede recorrerse directamente con `for...of`?
18. ¿Qué ocurre con las funciones intermedias cuando una excepción se propaga?
19. ¿Cuándo se ejecuta `finally`?
20. ¿Por qué no debe retornarse desde `finally`?
21. ¿Por qué conviene lanzar objetos `Error` en lugar de cadenas?
22. ¿Cuándo una excepción es preferible a un resultado normal?

### Ejercicio 1: simplificar con guardas

Reescribir con retornos tempranos:

```js
function publicar(articulo, usuario) {
  if (usuario) {
    if (usuario.estaActivo) {
      if (articulo.titulo) {
        if (articulo.contenido) {
          return { ok: true };
        } else {
          return { ok: false, motivo: "falta contenido" };
        }
      } else {
        return { ok: false, motivo: "falta título" };
      }
    } else {
      return { ok: false, motivo: "usuario inactivo" };
    }
  } else {
    return { ok: false, motivo: "falta usuario" };
  }
}
```

### Ejercicio 2: convertir bucles

Convertir este `while` en un `for` equivalente y explicar el orden de ejecución:

```js
let numero = 2;

while (numero <= 20) {
  console.log(numero);
  numero += 2;
}
```

Luego escribir una versión con `for...of` a partir de un array de números.

### Ejercicio 3: `switch` y *fall-through*

Construir una función que reciba un mes y devuelva la cantidad de días. Agrupar mediante *fall-through* los meses con `30` días y contemplar febrero por separado. Rechazar valores desconocidos.

### Ejercicio 4: excepciones

Implementar `convertirNota(valor)` para que:

1. convierta la entrada a número;
2. lance `TypeError` si no produce un número válido;
3. lance `RangeError` si queda fuera de `0` a `10`;
4. devuelva la nota en caso correcto;
5. sea utilizada desde otra función que capture únicamente esos errores esperados y vuelva a lanzar cualquier error desconocido.

---

## Fuentes y lecturas recomendadas

- [Flujo de control y manejo de errores — MDN](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Guide/Control_flow_and_error_handling)
- [`if...else` — MDN](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Statements/if...else)
- [Operador condicional ternario — MDN](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Operators/Conditional_operator)
- [Bucles e iteración — MDN](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Guide/Loops_and_iteration)
- [`switch` y *fall-through* — MDN](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Statements/switch)
- [`for...of` — MDN](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Statements/for...of)
- [`for...in` — MDN](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Statements/for...in)
- [`try...catch...finally` — MDN](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Statements/try...catch)
- [Objeto `Error` — MDN](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Error)
- [Causa de un error — MDN](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Error/cause)
- [ECMAScript Language Specification — TC39](https://tc39.es/ecma262/)

