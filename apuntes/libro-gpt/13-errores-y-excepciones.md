# 13. Errores y excepciones

## Idea central

**Una excepción representa que una operación no pudo cumplir su contrato; debe capturarse únicamente en la capa que sabe recuperarse, agregar contexto o traducirla.** Los resultados negativos esperables se modelan como datos; los fallos excepcionales se propagan sin perder su causa.

## Un error cambia el flujo normal

```js
const configuracion = JSON.parse(texto);
iniciar(configuracion);
```

Si `JSON.parse` encuentra sintaxis inválida, lanza una excepción. `iniciar` no se ejecuta. La excepción sube por la pila hasta encontrar un `catch` o llegar al entorno de ejecución.

```text
llamada actual → función que llamó → capa superior → entorno
```

Esta propagación evita que cada función intermedia tenga que comprobar y reenviar manualmente el mismo fallo.

## `try...catch`

```js
try {
  const datos = JSON.parse(texto);
  usar(datos);
} catch (error) {
  console.error("No se pudo leer la configuración", error);
}
```

`try` intenta ejecutar el bloque. Si se lanza una excepción síncrona, el control salta al `catch`. Las líneas posteriores al fallo dentro del `try` no se ejecutan.

El parámetro puede omitirse cuando no se necesita:

```js
function esJsonValido(texto) {
  try {
    JSON.parse(texto);
    return true;
  } catch {
    return false;
  }
}
```

No conviertas todo error en `false` si quien llama necesita conocer la causa.

## El objeto `Error`

```js
const error = new Error("No se pudo guardar el pedido");

error.name;    // "Error"
error.message; // mensaje
error.stack;   // pila, dependiente del entorno
```

Lanzá objetos `Error`, no strings:

```js
throw new Error("Falta el archivo de configuración");
```

Una string lanzada puede capturarse, pero no ofrece una interfaz consistente para nombre, pila y causa.

## `throw`: declarar que el contrato no puede cumplirse

```js
function dividir(dividendo, divisor) {
  if (divisor === 0) {
    throw new RangeError("El divisor no puede ser cero");
  }

  return dividendo / divisor;
}
```

En JavaScript numérico, dividir por cero normalmente devuelve `Infinity`. La función decide imponer un contrato más estricto porque su dominio lo necesita.

`throw` acepta cualquier expresión, pero mantener objetos `Error` como convención simplifica el manejo.

## Resultado esperado frente a excepción

Buscar un alumno puede no encontrarlo:

```js
function buscarAlumno(alumnos, legajo) {
  return alumnos.find(alumno => alumno.legajo === legajo) ?? null;
}
```

El resultado `null` es una variante normal. En cambio, recibir un legajo con formato imposible puede romper el contrato:

```js
function buscarAlumno(alumnos, legajo) {
  if (!Number.isSafeInteger(legajo) || legajo <= 0) {
    throw new TypeError("Legajo inválido");
  }

  return alumnos.find(alumno => alumno.legajo === legajo) ?? null;
}
```

Preguntá: ¿quien llama espera decidir con frecuencia sobre este resultado? Si sí, modelalo como dato. ¿La función no puede mantener una garantía que prometía? Una excepción puede ser adecuada.

## Tipos integrados de error

Algunos errores frecuentes:

- `TypeError`: valor u operación de tipo incompatible;
- `RangeError`: valor fuera del rango permitido;
- `ReferenceError`: identificador no disponible;
- `SyntaxError`: texto o código con sintaxis inválida;
- `URIError`: codificación o decodificación URI inválida;
- `AggregateError`: varios errores reunidos.

```js
try {
  const datos = JSON.parse(texto);
} catch (error) {
  if (error instanceof SyntaxError) {
    informarJsonInvalido(error.message);
  } else {
    throw error;
  }
}
```

No dependas solo del texto del mensaje, que puede cambiar o localizarse. Tipos, códigos y propiedades estables son mejores para decisiones.

## La pila de llamadas

```js
function nivelTres() {
  throw new Error("fallo");
}

function nivelDos() {
  nivelTres();
}

function nivelUno() {
  nivelDos();
}

nivelUno();
```

La pila registra cómo se llegó al punto del error. Capturar y crear un error nuevo sin causa puede perder parte de ese diagnóstico.

## Errores personalizados

```js
class SaldoInsuficienteError extends Error {
  constructor({ disponible, requerido }, options) {
    super("El saldo no alcanza para completar la operación", options);
    this.name = "SaldoInsuficienteError";
    this.disponible = disponible;
    this.requerido = requerido;
  }
}
```

```js
function debitar(cuenta, importe) {
  if (cuenta.saldo < importe) {
    throw new SaldoInsuficienteError({
      disponible: cuenta.saldo,
      requerido: importe
    });
  }

  return { ...cuenta, saldo: cuenta.saldo - importe };
}
```

El tipo permite tratar este caso sin analizar una string. Las propiedades ofrecen datos estructurados para interfaz, registro y pruebas.

## Conservar la causa

Una capa puede traducir un error técnico a uno de dominio:

```js
class ConfiguracionError extends Error {
  constructor(mensaje, options) {
    super(mensaje, options);
    this.name = "ConfiguracionError";
  }
}

function interpretarConfiguracion(texto) {
  try {
    return JSON.parse(texto);
  } catch (cause) {
    throw new ConfiguracionError(
      "El archivo de configuración no es válido",
      { cause }
    );
  }
}
```

`error.cause` mantiene el fallo original. Agregar contexto no debería borrar evidencia.

## Capturar solo lo que podemos manejar

Un `try` demasiado amplio no permite saber qué operación produjo el error esperado:

```js
try {
  const datos = JSON.parse(texto);
  const normalizados = normalizar(datos);
  await guardar(normalizados);
  notificar(normalizados);
} catch (error) {
  // ¿falló el JSON, la validación, el disco o la notificación?
}
```

Reducí la zona o distinguí errores por tipo y código. Una captura útil realiza al menos una de estas tareas:

- recupera con una alternativa válida;
- agrega contexto y relanza;
- traduce a un error del dominio;
- registra en una frontera del proceso;
- convierte el error en una respuesta externa apropiada.

Capturar y silenciar deja al programa continuar con un estado posiblemente incompleto.

## Relanzar

```js
try {
  ejecutar();
} catch (error) {
  if (error instanceof ErrorEsperado) {
    recuperar(error);
  } else {
    throw error;
  }
}
```

Usá `throw error`, no `throw new Error(error.message)`, si no necesitás envolverlo; la segunda forma reemplaza identidad y pila.

## `finally`: limpieza garantizada

```js
const recurso = await abrirRecurso();

try {
  await usarRecurso(recurso);
} finally {
  await recurso.close();
}
```

`finally` se ejecuta si el `try` termina normalmente, retorna o lanza. También se ejecuta después de un `catch`.

```js
function ejemplo() {
  try {
    return "resultado";
  } finally {
    console.log("limpieza");
  }
}
```

No retornes desde `finally`: ese retorno puede reemplazar el resultado o silenciar una excepción.

`try...finally` puede usarse sin `catch` para limpiar y dejar que el error continúe.

## Promesas y `async`/`await`

Una promesa rechazada se captura si se espera dentro del `try`:

```js
try {
  const datos = await cargarDatos();
  usar(datos);
} catch (error) {
  manejar(error);
}
```

Crear una promesa sin esperarla permite que el `try` termine antes del rechazo:

```js
try {
  cargarDatos(); // no se espera ni se devuelve
} catch (error) {
  // no captura un rechazo posterior
}
```

Corregí con `await` o devolvé la promesa a quien deba manejarla.

La forma equivalente con promesas:

```js
cargarDatos()
  .then(usar)
  .catch(manejar)
  .finally(limpiar);
```

No mezcles estilos sin una razón clara; una cadena olvidada o un `await` ausente puede producir rechazos no manejados.

## La sutileza de `fetch`

`fetch` rechaza ante fallos de red o cancelación, pero normalmente resuelve ante HTTP 404 o 500. Hay que comprobar el estado:

```js
async function cargarUsuario(id) {
  const respuesta = await fetch(`/api/usuarios/${id}`);

  if (!respuesta.ok) {
    throw new Error(`HTTP ${respuesta.status}`);
  }

  return respuesta.json();
}
```

Una API de aplicación puede traducir estados:

```js
class UsuarioNoEncontradoError extends Error {}

async function cargarUsuario(id) {
  const respuesta = await fetch(`/api/usuarios/${id}`);

  if (respuesta.status === 404) {
    throw new UsuarioNoEncontradoError(`No existe el usuario ${id}`);
  }

  if (!respuesta.ok) {
    throw new Error(`Error del servicio: ${respuesta.status}`);
  }

  return respuesta.json();
}
```

## Errores concurrentes

`Promise.all` rechaza con el primer rechazo observado:

```js
await Promise.all(tareas.map(ejecutar));
```

Las demás tareas no se cancelan automáticamente. Si necesitás conocer todos los resultados:

```js
const resultados = await Promise.allSettled(
  tareas.map(ejecutar)
);
```

Cada elemento indica `fulfilled` con `value` o `rejected` con `reason`. `AggregateError` aparece en APIs como `Promise.any` cuando todas las alternativas fallan.

## Mensaje al usuario y diagnóstico técnico

No expongas automáticamente `error.stack`, rutas, consultas o datos internos. Separá:

```js
registrarError({
  operacion: "crear-pedido",
  pedidoId,
  error
});

const respuesta = {
  ok: false,
  mensaje: "No pudimos completar el pedido. Intentá nuevamente."
};
```

El registro necesita contexto técnico; la interfaz necesita una acción comprensible y un identificador de incidente cuando corresponda.

## No usar excepciones como un `if` sofisticado

Esto oculta una condición esperable:

```js
try {
  if (!hayStock) throw new Error("sin stock");
  reservar();
} catch {
  mostrarSinStock();
}
```

Si `sin stock` es una variante normal, modelala directamente:

```js
function intentarReserva(hayStock) {
  if (!hayStock) return { ok: false, motivo: "sin-stock" };
  return { ok: true };
}
```

Una excepción puede seguir siendo válida si una función inferior prometía reservar y no pudo cumplir; el diseño depende de la capa y el contrato.

## Caso integrador

```js
class PedidoInvalidoError extends Error {
  constructor(mensaje, options) {
    super(mensaje, options);
    this.name = "PedidoInvalidoError";
  }
}

async function procesarPedido(texto) {
  let pedido;

  try {
    pedido = JSON.parse(texto);
  } catch (cause) {
    throw new PedidoInvalidoError("JSON inválido", { cause });
  }

  validarPedido(pedido);

  try {
    const respuesta = await enviarPedido(pedido);

    if (!respuesta.ok) {
      throw new Error(`HTTP ${respuesta.status}`);
    }

    return await respuesta.json();
  } catch (cause) {
    throw new Error(`No se pudo enviar el pedido ${pedido.id}`, { cause });
  }
}
```

Cada `try` tiene un propósito concreto y agrega el contexto disponible en esa etapa.

## Errores frecuentes

- lanzar strings;
- capturar `Error` y continuar sin recuperación;
- envolver un error sin `cause` y perder diagnóstico;
- usar excepciones para decisiones normales;
- poner demasiadas operaciones dentro de un mismo `try`;
- retornar desde `finally`;
- olvidar `await` o no devolver una promesa;
- suponer que `fetch` rechaza ante todos los estados HTTP;
- mostrar detalles internos al usuario final.

## Práctica guiada

Construí un importador de archivos JSON. Debe distinguir archivo inexistente opcional, falta de permisos, JSON inválido, estructura inválida y fallo al guardar. Creá tipos o códigos estables, conservá causas, procesá varios archivos con `Promise.allSettled` y generá un resumen que separe éxitos, errores recuperables y fallos que deben detener el proceso.

## Para recordar

- Una excepción indica que una operación no pudo cumplir su contrato.
- Los casos negativos esperables son datos; los fallos inesperados se propagan.
- Capturá solo donde puedas recuperar, traducir, agregar contexto o registrar.
- Conservá la causa original y usá `finally` para limpieza.
- En asincronía, una promesa solo entra al `try...catch` si se espera o se devuelve correctamente.
