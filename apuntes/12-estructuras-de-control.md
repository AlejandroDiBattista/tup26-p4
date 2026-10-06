# 12. Estructuras de control

## Idea central

**Una estructura de control debe mostrar por qué el programa toma un camino y cómo garantiza que una repetición termina.** Las guardas mantienen visible el caso normal, cada bucle hace explícito su progreso y `switch` se reserva para seleccionar entre valores discretos.

## Del flujo lineal a una decisión

Sin estructuras de control, las instrucciones se ejecutan de arriba hacia abajo:

```js
const subtotal = precio * cantidad;
const impuesto = subtotal * 0.21;
const total = subtotal + impuesto;
```

Una condición introduce un desvío:

```js
if (cantidad > stock) {
  console.log("No hay stock suficiente");
}
```

JavaScript interpreta la expresión entre paréntesis en contexto booleano. Para reglas importantes, una comparación explícita comunica mejor el motivo que un valor truthy ambiguo.

## `if`: ejecutar bajo una condición

```js
if (nota >= 6) {
  estado = "aprobado";
}
```

Las llaves son recomendables incluso con una sola sentencia. Evitan errores al agregar una segunda línea y hacen visible el bloque.

Una condición puede tener nombre:

```js
const alcanzaAprobacion = nota >= 6;

if (alcanzaAprobacion) {
  estado = "aprobado";
}
```

No crees una variable por cada comparación trivial; hacelo cuando el nombre explica una regla.

## `else`: dos caminos excluyentes

```js
if (stock >= cantidad) {
  confirmarPedido();
} else {
  informarFaltante();
}
```

El operador condicional produce un valor:

```js
const estado = stock >= cantidad ? "disponible" : "agotado";
```

Es apropiado para una selección breve. Ternarios anidados suelen ser difíciles de leer:

```js
const categoria = nota >= 8
  ? "promoción"
  : nota >= 6
    ? "aprobación"
    : "desaprobación";
```

Un `if` con retornos puede expresar mejor esa clasificación.

## Encadenar rangos con `else if`

```js
function categoria(nota) {
  if (nota >= 8) {
    return "promoción";
  } else if (nota >= 6) {
    return "aprobación";
  } else {
    return "desaprobación";
  }
}
```

Las condiciones se evalúan en orden y solo se ejecuta la primera verdadera. Por eso los rangos deben colocarse de más restrictivo a más general.

Este orden es incorrecto:

```js
function categoriaIncorrecta(nota) {
  if (nota >= 6) return "aprobación";
  if (nota >= 8) return "promoción"; // nunca se alcanza para 8 o más
  return "desaprobación";
}
```

## Guardas y retorno temprano

Una guarda elimina un caso que impide continuar:

```js
function procesarPedido(pedido) {
  if (!pedido) return { ok: false, error: "Pedido ausente" };
  if (pedido.items.length === 0) {
    return { ok: false, error: "Carrito vacío" };
  }
  if (!pedido.cliente) {
    return { ok: false, error: "Falta el cliente" };
  }

  const total = calcularTotal(pedido.items);
  return { ok: true, total };
}
```

Sin guardas, el camino válido quedaría dentro de varios niveles. El retorno temprano reduce el estado mental necesario: después de cada guarda sabemos qué condición ya se cumple.

Una guarda puede devolver un resultado esperado o lanzar un error si se rompió el contrato. El capítulo siguiente desarrolla esa diferencia.

## Condiciones anidadas

El anidamiento es útil cuando una decisión solo tiene sentido dentro de otra:

```js
if (usuario.estaAutenticado) {
  if (usuario.esAdmin) {
    mostrarPanelAdministrativo();
  }
}
```

Puede combinarse:

```js
if (usuario.estaAutenticado && usuario.esAdmin) {
  mostrarPanelAdministrativo();
}
```

No toda anidación debe aplanarse. Si las ramas representan pasos jerárquicos con acciones diferentes, conservar la estructura puede ser más claro.

## Negar condiciones compuestas

Las leyes de De Morgan ayudan a escribir guardas:

```text
!(a && b) = !a || !b
!(a || b) = !a && !b
```

```js
function validarCompra(tieneSaldo, hayStock) {
  if (!tieneSaldo || !hayStock) {
    return { ok: false };
  }

  return { ok: true };
}
```

equivale a rechazar cuando no se cumple `tieneSaldo && hayStock`.

## `switch`: seleccionar por un mismo valor

```js
function etiquetaEstado(estado) {
  switch (estado) {
    case "P":
      return "Pendiente";
    case "A":
      return "Aprobado";
    case "R":
      return "Rechazado";
    default:
      return "Desconocido";
  }
}
```

`switch` compara el valor con cada `case` usando igualdad estricta. Es apropiado para códigos, comandos, estados o variantes discretas. Para rangos y condiciones heterogéneas, `if` comunica mejor.

## `break`, `return` y *fall-through*

Si un caso no termina con `break`, `return` o `throw`, la ejecución continúa en el siguiente:

```js
function tipoDeDia(dia) {
  switch (dia) {
    case "sábado":
    case "domingo":
      return "fin de semana";
    default:
      return "día hábil";
  }
}
```

Aquí el *fall-through* agrupa dos entradas. Cuando sea intencional pero no tan evidente, agregá un comentario. El olvido accidental de `break` puede ejecutar lógica de otro caso.

## Alcance dentro de `switch`

Los `case` no crean bloques independientes. Dos declaraciones con el mismo nombre pueden colisionar:

```js
switch (tipo) {
  case "usuario": {
    const resultado = cargarUsuario();
    usar(resultado);
    break;
  }
  case "curso": {
    const resultado = cargarCurso();
    usar(resultado);
    break;
  }
}
```

Las llaves crean un alcance por caso.

## Repetir: elegir el bucle por la pregunta

La elección práctica:

- `for...of`: recorrer valores de una colección iterable;
- `for`: controlar índice, rango o paso;
- `while`: repetir hasta que cambie una condición;
- `do...while`: ejecutar primero y decidir después;
- métodos de array: producir una transformación declarativa.

## `while`: repetir mientras se cumpla

```js
let saldo = 1000;

while (saldo >= 250) {
  saldo -= 250;
}
```

Antes de ejecutar, identificá:

1. estado inicial: `saldo = 1000`;
2. condición: `saldo >= 250`;
3. progreso: en cada vuelta baja `250`;
4. estado de salida: `saldo < 250`.

Un bucle infinito suele perder el progreso:

```js
let intentos = 0;

while (intentos < 3) {
  ejecutar();
  // falta intentos += 1
}
```

Los bucles infinitos pueden ser deliberados en servidores o consumidores de eventos, pero necesitan un mecanismo externo de cancelación, espera y manejo de fallos.

## `do...while`: al menos una ejecución

```js
let entrada;

do {
  entrada = solicitarEntrada();
} while (!esValida(entrada));
```

Es apropiado para menús, reintentos interactivos o procesos donde la primera acción debe ocurrir antes de evaluar. No lo uses si el cuerpo podría ser inválido desde el inicio.

## `for`: inicio, condición y actualización

```js
for (let indice = 0; indice < 5; indice += 1) {
  console.log(indice);
}
```

El orden real es:

```text
inicialización
→ condición
→ cuerpo
→ actualización
→ condición...
```

Un `while` equivalente:

```js
let indice = 0;

while (indice < 5) {
  console.log(indice);
  indice += 1;
}
```

Elegí `for` cuando esas tres piezas pertenecen a la misma idea de recorrido.

### Recorrer hacia atrás y con paso

```js
for (let i = valores.length - 1; i >= 0; i -= 1) {
  console.log(valores[i]);
}

for (let par = 0; par <= 10; par += 2) {
  console.log(par);
}
```

Los límites y el operador (`<` frente a `<=`) merecen pruebas en el primer y último elemento.

## `for...of`: valores de un iterable

```js
for (const alumno of alumnos) {
  console.log(alumno.nombre);
}
```

Funciona con arrays, strings, `Map`, `Set`, generadores y objetos que implementan `Symbol.iterator`.

Para `Map`:

```js
for (const [clave, valor] of mapa) {
  console.log(clave, valor);
}
```

Para índices de un array:

```js
for (const [indice, alumno] of alumnos.entries()) {
  console.log(indice, alumno.nombre);
}
```

## `for...in`: nombres de propiedades

```js
for (const clave in objeto) {
  if (Object.hasOwn(objeto, clave)) {
    console.log(clave, objeto[clave]);
  }
}
```

Incluye propiedades enumerables heredadas, por eso suele requerir `Object.hasOwn`. Para objetos comunes, `Object.keys`, `values` o `entries` y `for...of` son más explícitos. No uses `for...in` para valores de arrays.

## `break`: terminar el bucle

```js
let encontrado = null;

for (const alumno of alumnos) {
  if (alumno.legajo === buscado) {
    encontrado = alumno;
    break;
  }
}
```

Para este caso concreto, `find` expresa mejor el resultado. `break` es útil cuando el recorrido incluye lógica que no cabe naturalmente en un método de colección.

## `continue`: saltar a la siguiente vuelta

```js
for (const linea of lineas) {
  if (linea.trim() === "") continue;
  procesar(linea);
}
```

En un `while`, verificá que `continue` no salte la actualización:

```js
let i = 0;

while (i < valores.length) {
  const valor = valores[i];
  i += 1; // progreso antes de cualquier continue

  if (valor == null) continue;
  procesar(valor);
}
```

## Bucles anidados y etiquetas

`break` termina el bucle más cercano. Una etiqueta puede señalar uno exterior:

```js
buscar:
for (let fila = 0; fila < matriz.length; fila += 1) {
  for (let columna = 0; columna < matriz[fila].length; columna += 1) {
    if (matriz[fila][columna] === objetivo) {
      break buscar;
    }
  }
}
```

Las etiquetas son válidas y poco frecuentes. Muchas veces una función con `return` permite una salida más clara y devuelve el resultado encontrado.

## Evitar modificar una colección durante el recorrido

Quitar elementos mientras se avanza puede saltar posiciones:

```js
for (let i = 0; i < valores.length; i += 1) {
  if (valores[i] < 0) valores.splice(i, 1);
}
```

Después de `splice`, el siguiente elemento ocupa el índice actual, pero `i` avanza. Alternativas:

```js
const noNegativos = valores.filter(valor => valor >= 0);
```

o recorrer hacia atrás cuando la mutación sea necesaria.

## Caso integrador: procesar un lote

```js
function procesarLineas(lineas) {
  const resultados = [];

  for (const [numero, lineaOriginal] of lineas.entries()) {
    const linea = lineaOriginal.trim();

    if (linea === "") continue;
    if (linea === "FIN") break;

    const separador = linea.indexOf(":");

    if (separador === -1) {
      resultados.push({
        linea: numero + 1,
        ok: false,
        error: "Falta el separador"
      });
      continue;
    }

    resultados.push({
      linea: numero + 1,
      ok: true,
      clave: linea.slice(0, separador).trim(),
      valor: linea.slice(separador + 1).trim()
    });
  }

  return resultados;
}
```

El bucle muestra los tres desvíos: ignorar, terminar o procesar. Los resultados negativos esperados se conservan como datos.

## Errores frecuentes

- confundir asignación `=` con comparación `===`;
- ordenar mal condiciones que representan rangos;
- anidar todas las reglas en lugar de usar guardas;
- olvidar `break` en un `switch`;
- crear un `while` sin progreso;
- colocar el progreso después de un `continue` posible;
- usar `for...in` para valores de array;
- modificar un array hacia adelante y saltar elementos;
- usar un ternario anidado para lógica con varias decisiones.

## Para recordar

- Las guardas eliminan casos inválidos y dejan visible el camino principal.
- `if` expresa condiciones generales; `switch`, variantes discretas de un mismo valor.
- Todo bucle necesita estado inicial, condición, progreso y salida.
- `for...of` recorre valores; `for...in`, propiedades enumerables.
- `break` y `continue` deben simplificar el recorrido, no ocultar su terminación.
