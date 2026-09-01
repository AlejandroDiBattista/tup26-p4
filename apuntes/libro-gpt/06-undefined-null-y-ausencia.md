# 6. `undefined`, `null` y la ausencia de datos

## Idea central

**`undefined` suele indicar que JavaScript o una operación todavía no produjo un valor; `null` suele expresar que la aplicación decidió representar una ausencia.** Ninguno explica por sí solo por qué falta el dato: un programa productivo define el significado, lo valida en los límites y evita propagar estados ambiguos.

La ausencia aparece en propiedades opcionales, búsquedas sin resultado, parámetros omitidos, formularios incompletos y datos externos. Tratarla como parte del contrato es más seguro que esperar a que una operación falle lejos del origen.

## `undefined`: falta de valor asignado o producido

JavaScript utiliza `undefined` en varias situaciones:

```js
let pendiente;
pendiente; // undefined

const persona = {};
persona.telefono; // undefined

function saludar(nombre) {
  return nombre;
}

saludar(); // undefined
```

Una función sin `return` también devuelve `undefined`:

```js
function registrar(mensaje) {
  console.log(mensaje);
}

const resultado = registrar("inicio");
// resultado es undefined
```

Esto distingue un efecto de un resultado reutilizable. Si una función promete producir un valor, todos sus caminos deberían respetar ese contrato o señalar claramente la ausencia.

## `null`: ausencia intencional

`null` se escribe explícitamente:

```js
const usuarioSeleccionado = null;
```

Puede significar “todavía no se seleccionó”, “la relación fue eliminada” o “la búsqueda concluyó y no encontró nada”. El significado pertenece a la aplicación.

```js
function buscarPorLegajo(alumnos, legajo) {
  return alumnos.find(alumno => alumno.legajo === legajo) ?? null;
}
```

Aquí `null` no representa un error: es un resultado posible y documentado.

## Una peculiaridad histórica de `typeof`

```js
typeof undefined; // "undefined"
typeof null;      // "object"
```

El resultado de `typeof null` es una incompatibilidad histórica del lenguaje. No significa que `null` sea un objeto utilizable. Para detectarlo:

```js
valor === null;
```

Para `undefined`:

```js
valor === undefined;
typeof valor === "undefined";
```

La forma con `typeof` también puede consultar un identificador no declarado sin lanzar `ReferenceError`, aunque no debería usarse para ocultar dependencias globales.

## Ausencia no es falsedad

`null` y `undefined` son falsy, pero comparten esa condición con valores válidos como `0`, `false` y `""`:

```js
if (!cantidad) {
  // entra tanto con ausencia como con cero
}
```

Si cero es válido, comprobá el estado que realmente importa:

```js
if (cantidad === null || cantidad === undefined) {
  // falta la cantidad
}
```

La forma `valor == null` detecta exactamente `null` o `undefined` mediante una regla particular de igualdad flexible:

```js
null == undefined; // true
0 == null;         // false
"" == null;        // false
```

Puede ser un modismo útil en equipos que lo acuerdan, pero la versión explícita enseña mejor el contrato.

## Coalescencia nula

`??` usa el valor derecho solo ante `null` o `undefined`:

```js
const cantidad = entrada.cantidad ?? 1;

0 ?? 1;        // 0
false ?? true; // false
"" ?? "N/D";   // ""
null ?? "N/D"; // "N/D"
```

Esto contrasta con `||`, que reemplaza cualquier falsy:

```js
0 || 1; // 1
```

La asignación nula inicializa solo si falta:

```js
config.intentos ??= 3;
```

## Encadenamiento opcional

`?.` detiene una cadena de acceso cuando el valor anterior es nulo:

```js
const ciudad = usuario?.direccion?.ciudad;
```

Si `usuario` o `direccion` es `null`/`undefined`, el resultado es `undefined`. No detiene ante otros falsy:

```js
const longitud = ""?.length; // 0
```

Puede aplicarse a propiedades, índices y llamadas:

```js
config.temas?.[0];
observador?.(evento);
```

Usalo solo cuando la ausencia sea válida. Si una propiedad es obligatoria, el encadenamiento opcional puede ocultar un dato roto y retrasar el error:

```js
// Si cliente es obligatorio, esto podría silenciar el problema.
const nombre = pedido.cliente?.nombre;
```

En ese caso, validá el contrato al ingresar el pedido.

## Parámetros predeterminados

Un valor predeterminado de parámetro se aplica ante `undefined`, no ante `null`:

```js
function saludar(nombre = "Anónimo") {
  return `Hola, ${nombre}`;
}

saludar();          // "Hola, Anónimo"
saludar(undefined); // "Hola, Anónimo"
saludar(null);      // "Hola, null"
```

Si `null` también significa ausencia, normalizalo explícitamente:

```js
function saludar(nombre) {
  const visible = nombre ?? "Anónimo";
  return `Hola, ${visible}`;
}
```

Los valores predeterminados en desestructuración siguen la misma regla:

```js
const { tema = "claro" } = { tema: undefined }; // "claro"
const { idioma = "es" } = { idioma: null };     // null
```

## Propiedad ausente y propiedad con `undefined`

Estos objetos devuelven lo mismo al acceder, pero no tienen la misma estructura:

```js
const ausente = {};
const presente = { valor: undefined };

ausente.valor;  // undefined
presente.valor; // undefined

Object.hasOwn(ausente, "valor");  // false
Object.hasOwn(presente, "valor"); // true
```

Esto importa al aplicar parches, validar campos o recorrer claves.

`in` también considera propiedades heredadas:

```js
"toString" in {}; // true
Object.hasOwn({}, "toString"); // false
```

## Huecos en arrays

Un array puede tener posiciones inexistentes:

```js
const conHueco = [1, , 3];
const conUndefined = [1, undefined, 3];

conHueco[1];       // undefined
conUndefined[1];   // undefined
1 in conHueco;     // false
1 in conUndefined; // true
```

Algunos métodos saltan huecos, otros los materializan o preservan. Para datos de aplicación, preferí arrays densos y representá la ausencia deliberadamente.

## Búsquedas y resultados opcionales

APIs diferentes usan convenciones distintas:

```js
[10, 20].find(valor => valor > 50);      // undefined
[10, 20].indexOf(50);                    // -1
new Map().get("clave");                  // undefined
"texto".match(/numero/);                 // null
```

No supongas una convención universal. Leé el contrato y convertí el resultado a la forma que usa tu dominio:

```js
function buscarConfiguracion(mapa, clave) {
  if (!mapa.has(clave)) return { encontrada: false };
  return { encontrada: true, valor: mapa.get(clave) };
}
```

Este diseño distingue “no existe” de “existe y su valor es `undefined`”.

## JSON, red y bases de datos

JSON tiene `null`, pero no `undefined`:

```js
JSON.stringify({ a: null, b: undefined }); // '{"a":null}'
JSON.stringify([null, undefined]);          // '[null,null]'
```

En objetos, una propiedad `undefined` se omite; en arrays se serializa como `null`. Esto puede cambiar el significado de un parche:

- propiedad ausente: “no modificar”;
- propiedad con `null`: “borrar el valor”;
- propiedad con dato: “reemplazar”.

Cada API debe documentar su convención. Las bases de datos también tienen semánticas propias para `NULL`; no deben trasladarse automáticamente a JavaScript sin decidir el contrato.

## Estados explícitos cuando la ausencia no alcanza

Una única variable con `null` puede mezclar demasiados significados:

```js
let datos = null;
// ¿todavía no se cargaron, no existen o falló la carga?
```

Un estado etiquetado conserva la diferencia:

```js
let consulta = { estado: "pendiente" };

consulta = { estado: "lista", datos: [] };
consulta = { estado: "sin-resultados" };
consulta = { estado: "error", error };
```

Este patrón evita booleanos paralelos contradictorios y permite manejar cada caso de forma exhaustiva.

## Validar y normalizar en el borde

```js
function normalizarPerfil(entrada) {
  if (!entrada || typeof entrada !== "object") {
    throw new TypeError("Se esperaba un perfil");
  }

  const nombre = entrada.nombre?.trim();
  if (!nombre) throw new TypeError("El nombre es obligatorio");

  const telefono = entrada.telefono == null
    ? null
    : String(entrada.telefono).trim();

  return { nombre, telefono };
}
```

Después de normalizar, el núcleo de la aplicación puede asumir que `nombre` es no vacío y `telefono` es string o `null`, sin repetir comprobaciones ambiguas.

## Errores frecuentes

- usar `if (!valor)` para detectar solo ausencia;
- esperar que un parámetro predeterminado reemplace `null`;
- tratar `typeof null === "object"` como una clasificación útil;
- encadenar `?.` sobre propiedades obligatorias y ocultar datos rotos;
- no distinguir propiedad ausente de propiedad presente con `undefined`;
- serializar `undefined` esperando que JSON lo conserve;
- usar `null` para estados diferentes sin una etiqueta adicional.

## Práctica guiada

Diseñá el contrato de una actualización parcial de usuario con `nombre`, `telefono` y `foto`:

- propiedad ausente: conservar el valor anterior;
- `null`: eliminar un dato opcional;
- string: reemplazar después de validar;
- `undefined`: rechazarlo antes de serializar.

Implementá `aplicarParche(usuario, parche)` sin modificar el usuario original y probá la diferencia entre `{}`, `{ telefono: undefined }` y `{ telefono: null }`.

## Para recordar

- `undefined` suele surgir por falta de asignación o resultado; `null` suele ser una ausencia elegida por la aplicación.
- Ambos son falsy, pero no deben confundirse con `0`, `false` o `""`.
- `??`, `?.` y los valores predeterminados tienen reglas precisas y diferentes.
- Propiedad ausente, propiedad `undefined` y hueco de array no son exactamente lo mismo.
- Cuando existen varios tipos de ausencia, un estado etiquetado expresa mejor el proceso.
