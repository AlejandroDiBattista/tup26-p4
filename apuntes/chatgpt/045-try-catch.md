# try...catch en JavaScript, desde primeros principios

**try...catch** existe para resolver un problema muy concreto: hay operaciones que pueden fallar mientras el programa se está ejecutando y queremos decidir qué hacer cuando eso ocurre.

La idea fundamental es:

~~~js
try {
  // Intento hacer algo.
} catch (error) {
  // Si falla, reacciono al problema.
}
~~~

Pero para entenderlo bien conviene empezar antes: por qué existe un error, qué significa lanzar una excepción y cómo cambia el flujo del programa.

---

## 1. Un programa normalmente avanza línea por línea

Supongamos:

~~~js
console.log("A");
console.log("B");
console.log("C");
~~~

La ejecución es:

~~~text
A
B
C
~~~

Conceptualmente:

~~~text
línea 1
   ↓
línea 2
   ↓
línea 3
~~~

Pero ahora:

~~~js
console.log("A");

algoQueNoExiste();

console.log("C");
~~~

JavaScript encuentra la llamada a una función que no está definida y produce un error parecido a:

~~~text
ReferenceError: algoQueNoExiste is not defined
~~~

En ese momento ocurre algo fundamental: **JavaScript deja de ejecutar normalmente ese camino del programa**.

Por lo tanto, la última línea:

~~~js
console.log("C");
~~~

no se ejecuta.

---

## 2. Un error altera el flujo normal

Podemos pensar que existe un camino normal:

~~~text
A
↓
B
↓
C
↓
D
~~~

Pero si C produce un error:

~~~text
A
↓
B
↓
C  💥
~~~

JavaScript ya no continúa hacia D. El error empieza a propagarse buscando algún código que pueda manejarlo.

Ahí aparece **try...catch**.

Una excepción no es simplemente un valor que informa que algo salió mal. También es un mecanismo de control: interrumpe el recorrido normal y transfiere la ejecución a otro lugar.

---

## 3. try significa literalmente «intentá ejecutar esto»

~~~js
try {
  console.log("A");

  algoQueNoExiste();

  console.log("B");
}
~~~

El bloque **try** no evita que ocurra el error.

No significa:

> Ejecutá esto sin errores.

Significa:

> Ejecutá esto normalmente, pero si durante esta ejecución aparece una excepción, dame la oportunidad de manejarla.

El bloque **try** delimita la región de código cuyas excepciones queremos poder capturar.

---

## 4. catch captura la excepción

~~~js
try {
  console.log("A");

  algoQueNoExiste();

  console.log("B");
} catch (error) {
  console.log("Ocurrió un problema");
}

console.log("C");
~~~

Resultado:

~~~text
A
Ocurrió un problema
C
~~~

Observá algo fundamental: B **no se ejecutó**.

Cuando ocurrió el error, JavaScript abandonó inmediatamente el bloque **try**:

~~~text
try
 │
 ├── A
 │
 ├── error 💥
 │
 └── B      ← nunca llega
      │
      ↓
catch
 │
 └── "Ocurrió un problema"
      │
      ↓
C
~~~

Después de ejecutar el **catch**, el programa puede continuar con la instrucción posterior a toda la estructura **try...catch**.

---

## 5. El objeto Error

Normalmente escribimos:

~~~js
catch (error) {
  console.log(error);
}
~~~

La variable **error** recibe aquello que fue lanzado. Cuando JavaScript produce el fallo —o cuando nuestro código lanza un objeto Error— contiene información sobre lo ocurrido.

Por ejemplo:

~~~js
try {
  x();
} catch (error) {
  console.log(error.name);
  console.log(error.message);
}
~~~

Podría imprimir:

~~~text
ReferenceError
x is not defined
~~~

Las propiedades más utilizadas son:

- **name**: nombre o categoría del error.
- **message**: explicación legible del problema.
- **stack**: rastro de las llamadas activas cuando ocurrió; es muy útil para depurar.
- **cause**: causa original opcional, cuando el error fue creado con esa información.

Ejemplo:

~~~js
try {
  x();
} catch (error) {
  console.log(error.name);
  console.log(error.message);
  console.log(error.stack);
}
~~~

El rastro puede verse así:

~~~text
ReferenceError: x is not defined
    at programa.js:4
    at ...
~~~

### No siempre se lanza un objeto Error

JavaScript permite técnicamente lanzar cualquier valor:

~~~js
throw "falló";
throw 404;
throw { motivo: "sin permiso" };
~~~

Por eso un **catch** recibe exactamente lo que se lanzó. Sin embargo, es una buena práctica lanzar instancias de Error o de sus subclases:

~~~js
throw new Error("Falló la operación");
~~~

Así se conservan de forma coherente el mensaje, el tipo y el rastro de la pila.

---

## 6. throw: lanzar una excepción

El concepto central del mecanismo es **throw**:

~~~js
throw new Error("Algo salió mal");
~~~

En cuanto se ejecuta **throw**, se interrumpe el flujo normal del bloque actual.

~~~js
console.log("A");

throw new Error("Problema");

console.log("B");
~~~

B nunca se ejecuta.

**throw** es una instrucción; el valor que aparece después es la información que viaja con la excepción.

También podemos detectar una regla inválida de nuestro propio dominio y lanzar un error:

~~~js
function retirar(saldo, monto) {
  if (monto > saldo) {
    throw new Error("Saldo insuficiente");
  }

  return saldo - monto;
}
~~~

---

## 7. throw y catch son dos caras del mismo mecanismo

~~~js
try {
  throw new Error("No hay conexión");
} catch (error) {
  console.log(error.message);
}
~~~

Resultado:

~~~text
No hay conexión
~~~

Modelo básico:

~~~text
throw
  │
  │ lanza una excepción
  ↓
 busca un catch
  │
  ↓
catch
~~~

Por eso suele decirse que una excepción **sube por la pila de llamadas** hasta encontrar un **catch**.

---

## 8. Un ejemplo más real: dividir

Supongamos esta función:

~~~js
function dividir(a, b) {
  return a / b;
}
~~~

En JavaScript:

~~~js
dividir(10, 0);
~~~

no produce una excepción; devuelve:

~~~text
Infinity
~~~

Pero tal vez, para nuestro programa, dividir por cero sea inválido. Podemos imponer esa regla:

~~~js
function dividir(a, b) {
  if (b === 0) {
    throw new Error("No se puede dividir por cero");
  }

  return a / b;
}
~~~

Quien llama a la función puede decidir cómo responder:

~~~js
try {
  const resultado = dividir(10, 0);
  console.log(resultado);
} catch (error) {
  console.log(error.message);
}
~~~

Resultado:

~~~text
No se puede dividir por cero
~~~

Las excepciones no sirven únicamente para errores internos de JavaScript. También podemos usarlas para señalar situaciones que vuelven imposible completar una operación de nuestra aplicación.

---

## 9. ¿Por qué no simplemente devolver false?

Podríamos escribir:

~~~js
function dividir(a, b) {
  if (b === 0) {
    return false;
  }

  return a / b;
}
~~~

Pero aparece un problema: ¿qué significa **false**?

Podría significar:

- error;
- resultado válido;
- dato faltante;
- permiso denegado;
- cualquier otra cosa.

Una excepción separa claramente:

~~~text
resultado normal
~~~

de:

~~~text
la operación no pudo completarse
~~~

Por ejemplo:

~~~js
function buscarUsuario(id) {
  if (id < 0) {
    throw new Error("ID inválido");
  }

  return { id, nombre: "Ana" };
}
~~~

Entonces quien llama decide:

~~~js
try {
  const usuario = buscarUsuario(-5);
  console.log(usuario);
} catch (error) {
  console.log("No pude obtener el usuario");
}
~~~

Esto no significa que siempre haya que usar excepciones. Para un resultado esperable como «no se encontró ningún usuario», una función también puede devolver **null**, **undefined** o un objeto de resultado explícito. La decisión depende del contrato de la función. Las excepciones son más apropiadas cuando la operación no puede cumplir ese contrato.

---

## 10. La pila de llamadas

Cuando una función llama a otra, JavaScript necesita recordar dónde debe regresar. Esas llamadas pendientes forman la **pila de llamadas** o *call stack*.

~~~js
function c() {
  throw new Error("Problema");
}

function b() {
  c();
}

function a() {
  b();
}

a();
~~~

La pila queda conceptualmente así:

~~~text
a()
 └── b()
      └── c()
~~~

Cuando c lanza el error:

~~~text
a()
 └── b()
      └── c() 💥
~~~

JavaScript busca un **catch**:

1. Primero en c. No hay.
2. Sale de c y sube a b. No hay.
3. Sale de b y sube a a. No hay.
4. Sale de a.
5. Al no encontrar ningún manejador, queda una excepción no capturada.

En un navegador, normalmente se informa en la consola. En Node.js, una excepción síncrona no capturada normalmente hace terminar el proceso.

---

## 11. Podemos atraparla en una capa superior

~~~js
function c() {
  throw new Error("Problema");
}

function b() {
  c();
}

function a() {
  b();
}

try {
  a();
} catch (error) {
  console.log("Capturado:", error.message);
}
~~~

Resultado:

~~~text
Capturado: Problema
~~~

Visualmente:

~~~text
try
 └── a()
      └── b()
           └── c()
                │
                throw
                  ↑
                  │
             no catch
                  ↑
             no catch
                  ↑
             no catch
                  ↑
                try
                  │
                  ↓
                catch
~~~

Este mecanismo permite que una función profunda diga «no puedo continuar» sin necesitar saber quién finalmente va a resolver, registrar o presentar el problema.

---

## 12. Propagación de excepciones

Considerá:

~~~js
function leerConfiguracion() {
  return convertirJSON();
}

function convertirJSON() {
  throw new Error("JSON inválido");
}
~~~

La función **convertirJSON** no tiene que saber si el programa quiere:

- mostrar un mensaje;
- volver a intentar;
- escribir un registro;
- terminar;
- utilizar valores por defecto.

Simplemente informa que no pudo completar su trabajo:

~~~js
throw new Error("JSON inválido");
~~~

Una capa superior decide:

~~~js
try {
  const config = leerConfiguracion();
  console.log(config);
} catch (error) {
  console.log("No se pudo cargar la configuración");
}
~~~

Esta separación de responsabilidades es una de las grandes ventajas de las excepciones:

~~~text
capa profunda  → detecta e informa
capa superior  → decide cómo responder
~~~

---

## 13. Error es una clase

Cuando escribimos:

~~~js
new Error("Algo salió mal");
~~~

estamos creando un objeto:

~~~js
const error = new Error("Algo salió mal");

console.log(typeof error);
console.log(error instanceof Error);
console.log(error.message);
~~~

Resultado:

~~~text
object
true
Algo salió mal
~~~

Crear el objeto no lo lanza:

~~~js
const error = new Error("Algo salió mal");

console.log("El programa continúa");
~~~

Para interrumpir el flujo hay que usar **throw**:

~~~js
throw error;
~~~

La diferencia es:

~~~text
new Error(...)        → construye información sobre un error
throw new Error(...)  → construye esa información y lanza la excepción
~~~

---

## 14. Tipos de Error

JavaScript posee varias clases incorporadas:

- **Error**: error genérico.
- **TypeError**: se usó un valor de una forma incompatible con su tipo.
- **RangeError**: un valor numérico está fuera de un rango permitido.
- **ReferenceError**: se intentó usar una referencia que no existe.
- **SyntaxError**: el texto analizado no respeta la sintaxis esperada.
- **URIError**: uso inválido de ciertas funciones relacionadas con URI.
- **AggregateError**: agrupa varios errores, por ejemplo en algunas operaciones con Promises.

Ejemplos:

~~~js
const nombre = null;
nombre.toUpperCase(); // TypeError
~~~

~~~js
const arreglo = new Array(-1); // RangeError
~~~

~~~js
console.log(variableInexistente); // ReferenceError
~~~

~~~js
JSON.parse("{"); // SyntaxError
~~~

Podemos comprobar el tipo con **instanceof**:

~~~js
try {
  const nombre = null;
  nombre.toUpperCase();
} catch (error) {
  console.log(error instanceof TypeError);
}
~~~

Resultado:

~~~text
true
~~~

---

## 15. Podemos actuar de forma diferente según el error

~~~js
try {
  hacerAlgo();
} catch (error) {
  if (error instanceof TypeError) {
    console.log("Error de tipo");
  } else if (error instanceof RangeError) {
    console.log("Valor fuera de rango");
  } else {
    console.log("Otro error");
  }
}
~~~

Pero hay una regla importante: si el **catch** no sabe manejar un tipo de error, normalmente debe volver a lanzarlo en vez de ocultarlo:

~~~js
try {
  hacerAlgo();
} catch (error) {
  if (error instanceof TypeError) {
    corregirDatos();
  } else {
    throw error;
  }
}
~~~

---

## 16. Errores personalizados

Podemos crear clases que representen problemas específicos de nuestra aplicación:

~~~js
class UsuarioNoEncontradoError extends Error {
  constructor(id) {
    super("No existe el usuario con ID " + id);
    this.name = "UsuarioNoEncontradoError";
    this.id = id;
  }
}
~~~

Luego:

~~~js
function buscarUsuario(id) {
  if (id !== 123) {
    throw new UsuarioNoEncontradoError(id);
  }

  return { id: 123, nombre: "Ana" };
}
~~~

Y al usarla:

~~~js
try {
  buscarUsuario(999);
} catch (error) {
  if (error instanceof UsuarioNoEncontradoError) {
    console.log("Usuario inexistente:", error.id);
  } else {
    throw error;
  }
}
~~~

Un error personalizado permite:

- reconocer el problema con **instanceof**;
- adjuntar datos estructurados, como el ID;
- separar el comportamiento del texto del mensaje;
- evitar tomar decisiones comparando cadenas frágiles.

No conviene escribir:

~~~js
if (error.message === "El usuario no existe") {
  // ...
}
~~~

El mensaje puede cambiar, traducirse o contener detalles. El tipo de error expresa el significado de manera más estable.

### Conservar la causa original

Si una capa agrega contexto, puede conservar la causa:

~~~js
function cargarConfiguracion(texto) {
  try {
    return JSON.parse(texto);
  } catch (error) {
    throw new Error("No se pudo cargar la configuración", {
      cause: error
    });
  }
}
~~~

Así, el nuevo error explica la operación de alto nivel y **error.cause** conserva el fallo original.

---

## 17. finally

Existe un tercer bloque:

~~~js
try {
  // Operación.
} catch (error) {
  // Manejo del error.
} finally {
  // Se ejecuta siempre.
}
~~~

**finally** significa:

> Ejecutá este bloque haya ocurrido un error o no.

Sin error:

~~~js
try {
  console.log("Intentando");
} catch (error) {
  console.log("Error");
} finally {
  console.log("Terminando");
}
~~~

Resultado:

~~~text
Intentando
Terminando
~~~

Con error:

~~~js
try {
  throw new Error("Problema");
} catch (error) {
  console.log("Error");
} finally {
  console.log("Terminando");
}
~~~

Resultado:

~~~text
Error
Terminando
~~~

---

## 18. ¿Para qué sirve finally?

Principalmente, para garantizar una limpieza o restauración:

~~~js
abrirArchivo();

try {
  procesarArchivo();
} finally {
  cerrarArchivo();
}
~~~

Conceptualmente:

~~~text
abrir recurso
      ↓
     try
      │
   trabajar
      ↓
   finally
      │
cerrar recurso
~~~

En JavaScript también puede utilizarse para:

- ocultar un indicador de carga;
- liberar un bloqueo;
- cerrar una conexión;
- restaurar un estado temporal;
- eliminar un manejador que ya no se necesita.

Ejemplo asincrónico:

~~~js
async function guardar() {
  mostrarIndicador();

  try {
    await enviarDatos();
  } finally {
    ocultarIndicador();
  }
}
~~~

Aunque **enviarDatos** falle, el indicador se oculta.

---

## 19. finally se ejecuta incluso con return

~~~js
function ejemplo() {
  try {
    return 10;
  } finally {
    console.log("finally");
  }
}

console.log(ejemplo());
~~~

Resultado:

~~~text
finally
10
~~~

Antes de abandonar la función, JavaScript ejecuta **finally**.

Conviene evitar un **return** dentro de **finally**:

~~~js
function ejemploPeligroso() {
  try {
    return 10;
  } finally {
    return 20;
  }
}
~~~

El resultado será 20: el **return** de **finally** reemplaza al anterior. También puede ocultar una excepción. Por eso **finally** debería concentrarse en la limpieza y no cambiar el resultado de la operación.

---

## 20. finally se ejecuta después de throw

~~~js
function ejemplo() {
  try {
    throw new Error("Problema");
  } finally {
    console.log("Limpiando");
  }
}

ejemplo();
~~~

Primero se imprime:

~~~text
Limpiando
~~~

y después el error continúa propagándose:

~~~text
throw
  ↓
finally
  ↓
el error sigue subiendo
~~~

---

## 21. try...finally sin catch

Esto es válido:

~~~js
try {
  hacerAlgo();
} finally {
  limpiar();
}
~~~

Aquí no queremos resolver el error. Solo queremos garantizar la limpieza.

Si **hacerAlgo** falla:

~~~text
hacerAlgo() 💥
      ↓
limpiar()
      ↓
el error continúa propagándose
~~~

La sintaxis admite estas combinaciones:

~~~text
try + catch
try + finally
try + catch + finally
~~~

Un bloque **try** no puede aparecer solo.

---

## 22. catch sin parámetro

Si no necesitamos conocer el error:

~~~js
try {
  hacerAlgo();
} catch {
  console.log("Falló");
}
~~~

En lugar de:

~~~js
catch (error) {
  // ...
}
~~~

Esto es válido. Sin embargo, si estamos depurando, registrando o decidiendo según el tipo, necesitaremos el parámetro.

---

## 23. Un error común: atrapar demasiado

Esto es tentador:

~~~js
try {
  // 200 líneas de código.
} catch {
  console.log("Algo salió mal");
}
~~~

Pero un bloque tan grande dificulta saber qué operación falló y puede mezclar errores que requieren respuestas diferentes.

Peor todavía:

~~~js
try {
  hacerAlgo();
} catch {
}
~~~

Esto se conoce como «tragarse» la excepción. El programa falló y el código fingió que no pasó nada. Luego puede continuar con un estado inválido y producir un problema mucho más difícil de localizar.

Es preferible:

- mantener el **try** tan pequeño como resulte razonable;
- capturar en una capa que pueda tomar una decisión útil;
- registrar contexto suficiente;
- dejar propagarse lo que no sabemos resolver.

---

## 24. Volver a lanzar el error: rethrow

Supongamos:

~~~js
try {
  procesar();
} catch (error) {
  console.log("Falló el procesamiento");

  throw error;
}
~~~

Primero hacemos algo local —por ejemplo, registrar, agregar contexto o limpiar— y después:

~~~js
throw error;
~~~

permite que otra capa también maneje el problema. Esto se denomina **rethrow** o relanzamiento.

Relanzar el mismo objeto conserva su identidad y su rastro original:

~~~js
throw error;
~~~

Crear otro error puede ser útil si queremos traducir el problema a una abstracción superior, pero conviene conservar la causa:

~~~js
throw new Error("No se pudo preparar el informe", {
  cause: error
});
~~~

---

## 25. Un patrón útil: capturar solo lo que podemos manejar

~~~js
try {
  operacion();
} catch (error) {
  if (puedoResolverlo(error)) {
    resolver(error);
  } else {
    throw error;
  }
}
~~~

La idea es:

> Capturá únicamente aquello que realmente sabés manejar.

«Manejar» puede significar:

- corregir los datos;
- reintentar de forma segura;
- usar un valor alternativo válido;
- transformar el error en una respuesta adecuada;
- informar al usuario y dejar la aplicación en un estado coherente.

Imprimir un mensaje y continuar no siempre equivale a haber manejado el fallo.

---

## 26. try...catch y JSON.parse

Un uso natural en JavaScript:

~~~js
const texto = '{"nombre":"Ana"}';

const persona = JSON.parse(texto);

console.log(persona.nombre);
~~~

Pero si recibimos:

~~~js
const texto = '{"nombre":';
~~~

**JSON.parse** lanza un SyntaxError porque no puede producir un valor válido.

~~~js
function convertirPersona(texto) {
  try {
    return JSON.parse(texto);
  } catch (error) {
    if (error instanceof SyntaxError) {
      console.log("El JSON es inválido");
      return null;
    }

    throw error;
  }
}
~~~

Aquí el **try...catch** es razonable porque estamos llamando a una operación cuyo contrato especifica que un texto inválido genera una excepción.

También podemos agregar contexto y propagar:

~~~js
function convertirPersona(texto) {
  try {
    return JSON.parse(texto);
  } catch (error) {
    throw new Error("No se pudo interpretar la persona", {
      cause: error
    });
  }
}
~~~

---

## 27. La asincronía cambia dónde puede capturarse un error

Consideremos:

~~~js
try {
  setTimeout(() => {
    throw new Error("Boom");
  }, 1000);
} catch (error) {
  console.log("Capturado");
}
~~~

Uno podría esperar que aparezca «Capturado», pero no ocurre.

Cuando se ejecuta el callback de **setTimeout**, el bloque **try** exterior ya terminó:

~~~text
try
 ├── programa el callback
 └── termina

...un segundo después...

callback
 └── throw 💥
~~~

Son ejecuciones separadas. El **catch** solo puede capturar excepciones lanzadas mientras se está ejecutando dinámicamente el código protegido por su **try**.

Para capturar esa excepción síncrona dentro del callback, el **try** debe estar dentro:

~~~js
setTimeout(() => {
  try {
    throw new Error("Boom");
  } catch (error) {
    console.log("Capturado:", error.message);
  }
}, 1000);
~~~

En código moderno, lo habitual es representar el resultado asincrónico con una Promise y manejar su rechazo.

---

## 28. async/await y try...catch

Una función **async** siempre devuelve una Promise. Si dentro devuelve un valor, la Promise se cumple con ese valor. Si lanza una excepción, la Promise se rechaza con ese error.

~~~js
async function obtenerDatos() {
  throw new Error("No se pudieron obtener datos");
}
~~~

Podemos manejarla con **await**:

~~~js
async function main() {
  try {
    await obtenerDatos();
  } catch (error) {
    console.log(error.message);
  }
}

main();
~~~

Resultado:

~~~text
No se pudieron obtener datos
~~~

**await** suspende esa función async hasta que la Promise se resuelva. Si se rechaza, **await** se comporta como si lanzara el motivo del rechazo en ese punto. Por eso el **catch** que rodea al **await** puede capturarlo.

El **await** debe estar dentro del **try**:

~~~js
async function cargar() {
  try {
    const datos = await obtenerDatos();
    console.log(datos);
  } catch (error) {
    console.error("Falló la carga:", error);
  }
}
~~~

### Un detalle importante

Crear una Promise dentro de un **try**, pero no esperarla, no permite capturar su rechazo:

~~~js
async function ejemplo() {
  try {
    obtenerDatos(); // Falta await.
  } catch (error) {
    console.log("Este catch no captura el rechazo");
  }
}
~~~

Debe utilizarse:

~~~js
await obtenerDatos();
~~~

o devolverse la Promise a quien vaya a manejarla:

~~~js
return obtenerDatos();
~~~

---

## 29. El equivalente con Promises

Con **async/await**:

~~~js
async function main() {
  try {
    const datos = await obtenerDatos();
    console.log(datos);
  } catch (error) {
    console.error(error);
  }
}
~~~

Con métodos de Promise:

~~~js
obtenerDatos()
  .then((datos) => {
    console.log(datos);
  })
  .catch((error) => {
    console.error(error);
  });
~~~

Ambos modelan:

~~~text
Promise cumplida  → valor
Promise rechazada → motivo del rechazo
~~~

Además, si una función de **then** lanza un error, la Promise resultante se rechaza y un **catch** posterior puede manejarlo:

~~~js
obtenerDatos()
  .then((datos) => {
    return JSON.parse(datos);
  })
  .catch((error) => {
    console.error("La descarga o la conversión falló:", error);
  });
~~~

El método **finally** de Promise sirve para una limpieza que no depende del resultado:

~~~js
obtenerDatos()
  .then(procesar)
  .catch(mostrarError)
  .finally(ocultarIndicador);
~~~

No hay que mezclar los dos estilos sin necesidad. Una cadena coherente suele ser más fácil de leer y razonar.

---

## 30. fetch tiene una sutileza importante

Esto captura, por ejemplo, un rechazo causado por un problema de red o por una cancelación:

~~~js
try {
  const respuesta = await fetch(url);
} catch (error) {
  console.log("No se pudo realizar la solicitud");
}
~~~

Pero una respuesta HTTP con estado 404, 403 o 500 normalmente **no hace que fetch rechace la Promise**. El servidor respondió correctamente a nivel del protocolo, aunque su respuesta represente un resultado fallido para nuestra aplicación.

Hay que verificar:

~~~js
const respuesta = await fetch(url);

if (!respuesta.ok) {
  throw new Error("HTTP " + respuesta.status);
}
~~~

Ejemplo completo:

~~~js
async function cargarDatos(url) {
  try {
    const respuesta = await fetch(url);

    if (!respuesta.ok) {
      throw new Error("HTTP " + respuesta.status);
    }

    const datos = await respuesta.json();
    return datos;
  } catch (error) {
    console.error("No se pudo obtener la información:", error);
    throw error;
  }
}
~~~

Este único **catch** puede recibir errores diferentes:

- un rechazo de **fetch** por un fallo de red;
- el error HTTP que nuestro código lanzó;
- un SyntaxError de **respuesta.json** si el cuerpo no es JSON válido;
- cualquier bug ocurrido dentro del bloque.

Por eso, en una aplicación real, puede convenir distinguirlos con tipos personalizados o separar las etapas.

---

## 31. Un ejemplo completo con fetch y un error de dominio

~~~js
class ErrorHttp extends Error {
  constructor(status, url) {
    super("La solicitud respondió HTTP " + status);
    this.name = "ErrorHttp";
    this.status = status;
    this.url = url;
  }
}

async function obtenerUsuario(id) {
  const url = "/api/usuarios/" + id;
  const respuesta = await fetch(url);

  if (!respuesta.ok) {
    throw new ErrorHttp(respuesta.status, url);
  }

  return respuesta.json();
}

async function mostrarUsuario(id) {
  try {
    const usuario = await obtenerUsuario(id);
    console.log(usuario.nombre);
  } catch (error) {
    if (error instanceof ErrorHttp && error.status === 404) {
      console.log("El usuario no existe");
      return;
    }

    console.error("No se pudo mostrar el usuario:", error);
    throw error;
  }
}
~~~

Observá la separación:

~~~text
obtenerUsuario()
    │
    ├── sabe detectar que la operación falló
    │
    └── throw
          │
          ↓
mostrarUsuario()
    │
    ├── resuelve el 404 que sí conoce
    │
    └── deja propagarse lo demás
~~~

Esta arquitectura es más importante que memorizar la sintaxis.

---

## 32. Condiciones esperables frente a excepciones

No todo resultado negativo es excepcional.

Por ejemplo:

~~~js
function edadValida(edad) {
  return edad >= 0 && edad <= 130;
}
~~~

Una edad incorrecta en un formulario puede ser una situación perfectamente esperable:

~~~js
if (!edadValida(edad)) {
  console.log("Edad inválida");
}
~~~

No necesitamos lanzar y capturar un error para cada dato que el usuario pueda corregir.

Una primera regla mental útil:

~~~text
condición esperable
        ↓
       if

fallo excepcional de una operación
        ↓
   throw / try / catch
~~~

Ejemplos de condiciones normalmente esperables:

- un campo vacío antes de enviar un formulario;
- una búsqueda sin resultados;
- una opción que el usuario no seleccionó;
- una contraseña que no cumple todavía las reglas mientras se escribe.

Ejemplos que pueden justificar una excepción:

- no se pudo analizar una configuración que debía ser válida;
- se perdió la conexión durante una operación;
- una dependencia devolvió datos que violan su contrato;
- una función recibió un argumento imposible para su contrato interno;
- una operación no puede entregar el resultado prometido.

No es una ley absoluta. La API debe tener un contrato claro y consistente: quien la usa necesita saber qué se devuelve y qué puede lanzar o rechazar.

### Excepción no es sinónimo de bug

Un error puede representar:

- un bug de programación;
- un fallo externo;
- datos corruptos;
- una regla de negocio que impide completar la operación.

Un **catch** no corrige automáticamente un bug. Si oculta un TypeError inesperado y deja continuar el programa, puede empeorar el problema.

---

## 33. No uses excepciones como un if sofisticado

Esto es posible:

~~~js
try {
  if (edad < 18) {
    throw new Error();
  }

  console.log("Mayor");
} catch {
  console.log("Menor");
}
~~~

Pero el flujo normal ya se expresa claramente con:

~~~js
if (edad >= 18) {
  console.log("Mayor");
} else {
  console.log("Menor");
}
~~~

Las excepciones no deberían convertirse en el mecanismo habitual de decisión del programa. Al leer **throw**, debería entenderse que el camino normal de la operación ya no puede continuar.

---

## 34. Buenas prácticas

### 1. Lanzá objetos Error

~~~js
throw new Error("Descripción concreta del problema");
~~~

Esto conserva tipo, mensaje y pila.

### 2. Usá mensajes con contexto

~~~js
throw new Error("No se pudo guardar el pedido " + pedido.id);
~~~

El mensaje debe ayudar a diagnosticar, sin incluir contraseñas, tokens ni otros datos sensibles.

### 3. Usá tipos personalizados para decisiones del programa

~~~js
if (error instanceof UsuarioNoEncontradoError) {
  // Respuesta específica.
}
~~~

No dependas del texto exacto de **message**.

### 4. Mantené pequeño el bloque try

Protegé la operación que puede fallar y evitá mezclar decenas de tareas independientes bajo un único **catch**.

### 5. No ocultes errores desconocidos

~~~js
catch (error) {
  if (puedoManejar(error)) {
    manejar(error);
  } else {
    throw error;
  }
}
~~~

### 6. Agregá contexto sin perder la causa

~~~js
throw new Error("No se pudo importar el archivo", {
  cause: error
});
~~~

### 7. Usá finally para limpieza

No lo uses para cambiar el resultado con **return** o **throw** salvo que sea una decisión deliberada y muy justificada.

### 8. En asincronía, esperá o devolvé la Promise

~~~js
await operacionAsincronica();
~~~

o:

~~~js
return operacionAsincronica();
~~~

Una Promise ignorada también puede producir un rechazo ignorado.

### 9. Con fetch, verificá response.ok

Un estado HTTP fallido no se transforma solo en excepción.

### 10. Separá el mensaje para el usuario del diagnóstico técnico

El usuario quizá necesite:

~~~text
No pudimos guardar los cambios. Intentá nuevamente.
~~~

El registro técnico puede conservar el error, la pila y el contexto necesarios para investigar.

### 11. Documentá el contrato

Si una función puede lanzar tipos concretos de error, quien la utiliza debería poder saberlo. Las excepciones no reemplazan un diseño claro de la API.

---

## 35. La sintaxis completa

La forma general es:

~~~js
try {
  // Código que puede lanzar una excepción.
} catch (error) {
  // Código para manejarla.
} finally {
  // Código que debe ejecutarse siempre.
}
~~~

Podemos lanzar nuestras propias excepciones:

~~~js
throw new Error("Descripción del problema");
~~~

Las partes se relacionan así:

~~~text
try      delimita el código protegido
throw    interrumpe y transporta el fallo
catch    recibe y maneja la excepción
finally  garantiza una acción final
~~~

---

## 36. Modelo mental final

Podemos resumir **try...catch** en este esquema:

~~~text
                   ejecución normal
                         │
                         ↓
                 ┌──────────────┐
                 │     try      │
                 └──────┬───────┘
                        │
             ┌──────────┴──────────┐
             │                     │
           éxito                 throw
             │                     │
             ↓                     ↓
        continúa              busca catch
                                   │
                                   ↓
                            ┌────────────┐
                            │   catch    │
                            └─────┬──────┘
                                  │
                                  ↓
                         continúa ejecución
~~~

Si existe **finally**:

~~~text
              try
               │
        ┌──────┴──────┐
        │             │
      éxito         error
        │             │
        │           catch
        │             │
        └──────┬──────┘
               ↓
            finally
               ↓
            continúa
~~~

Si ninguna función de la pila captura la excepción:

~~~text
función profunda
      │
    throw
      ↑
sale de cada llamada
      ↑
no encuentra catch
      ↑
excepción no capturada
~~~

Y, en asincronía:

~~~text
callback posterior de setTimeout
    ≠
ejecución dinámica del try exterior

Promise rechazada
       │
       ├── await dentro de try → catch
       │
       └── cadena de Promise   → .catch()
~~~

Una forma precisa de explicarlo en una sola frase es:

> **Ejecutá normalmente este código; si durante su ejecución se lanza una excepción, interrumpí ese camino, buscá el catch correspondiente y transferí allí el control junto con la información del fallo.**

Ese concepto de **transferencia del flujo de control** es el corazón de las excepciones.

**try...catch** no es realmente un mecanismo para «detectar errores». Es un mecanismo para cambiar abruptamente el flujo del programa y transportar información sobre un fallo desde el lugar donde se detecta hasta el lugar donde puede manejarse.
