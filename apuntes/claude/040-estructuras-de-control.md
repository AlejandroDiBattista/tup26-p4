# Estructuras de control

Programación IV: Desarrollo Web — Etapa 1, fundamentos técnicos
Apunte de la cuarta clase de JavaScript

Hasta acá los programas que escribimos se ejecutan de arriba abajo, una línea después de la otra. Con eso solo se puede hacer muy poco. Un programa útil tiene que poder decidir y tiene que poder repetir.

Hay un resultado clásico de 1966, el teorema del programa estructurado, que dice algo fuerte: cualquier algoritmo que se pueda escribir se puede expresar combinando tres esquemas.

La secuencia, que es hacer una cosa después de la otra. La selección, que es elegir entre caminos. Y la iteración, que es repetir mientras se cumpla una condición.

Todo lo que veas hoy es alguna forma de esos tres. Las estructuras que trae el lenguaje no agregan poder de cómputo, agregan legibilidad. Por eso, cuando dudes entre dos formas de escribir algo, el criterio casi siempre es cuál se entiende mejor.

Al final vamos a ver las excepciones, que son el único mecanismo de la clase de hoy que rompe el flujo normal y salta de un lugar a otro.

## El if

### La forma básica

```javascript
if (saldo > 0) {
  console.log("Hay saldo disponible");
}
```

La condición se evalúa y se convierte a booleano. Ojo con eso, porque es la lista de falsy de la segunda clase la que decide, no una comparación:

```javascript
if (nombre) { }           // entra si nombre no es "", null, undefined
if (contactos.length) { } // entra si el arreglo tiene elementos
if (cantidad) { }         // NO entra si cantidad vale 0
```

Ese último caso es la trampa de siempre. Si el cero es un valor válido, compará explícitamente:

```javascript
if (cantidad !== undefined) { }
if (cantidad != null) { }   // cubre null y undefined juntos
```

Las llaves son opcionales cuando hay una sola instrucción. Ponelas igual, siempre.

```javascript
// Válido, pero no lo hagas
if (esValido) guardar();

// Así
if (esValido) {
  guardar();
}
```

No es una manía. En 2014 Apple tuvo una falla grave de seguridad en la verificación de certificados: una línea duplicada por error quedó fuera de un `if` sin llaves, y el código de validación dejó de ejecutarse. El compilador no vio nada raro. Las llaves cuestan dos caracteres.

### else y el encadenamiento

`else` cubre el caso contrario:

```javascript
if (saldo > 0) {
  habilitarCompra();
} else {
  mostrarAviso();
}
```

Y acá hay algo que conviene entender bien, porque después explica varias cosas: `else if` no existe como palabra del lenguaje. Lo que existe es un `if` dentro del `else`, y como el `else` admite una sola instrucción, se pueden omitir sus llaves.

```javascript
// Lo que escribís
if (a) {
  uno();
} else if (b) {
  dos();
} else {
  tres();
}

// Lo que el lenguaje ve
if (a) {
  uno();
} else {
  if (b) {
    dos();
  } else {
    tres();
  }
}
```

De ahí sale la propiedad más importante de una cadena de `else if`: las condiciones se evalúan en orden y en cuanto una da verdadero, el resto ni se mira.

```javascript
function categoria(edad) {
  if (edad < 13) {
    return "niño";
  } else if (edad < 18) {
    return "adolescente";
  } else if (edad < 65) {
    return "adulto";
  } else {
    return "adulto mayor";
  }
}
```

Fijate que la segunda condición no necesita escribir `edad >= 13`. Si llegó ahí es porque la primera falló, así que ya lo sabe. Escribir la condición completa sería redundante y además invitaría a que las dos se desincronicen cuando alguien cambie un número.

La contracara es que el orden importa. Si ponés la condición más general primero, las siguientes quedan muertas:

```javascript
// Mal: nunca llega a los otros casos
if (edad < 65) {
  return "adulto";
} else if (edad < 18) {
  return "adolescente";  // inalcanzable
}
```

Regla: ordená de la condición más específica a la más general.

### El anidamiento y su costo

Un `if` puede contener otro `if`. El problema es que cada nivel suma indentación y suma cosas para recordar mientras leés.

```javascript
function procesarPedido(pedido) {
  if (pedido != null) {
    if (pedido.items.length > 0) {
      if (pedido.cliente.activo) {
        if (hayStock(pedido.items)) {
          confirmar(pedido);
        } else {
          return "sin stock";
        }
      } else {
        return "cliente inactivo";
      }
    } else {
      return "pedido vacío";
    }
  } else {
    return "pedido inexistente";
  }
}
```

Cuando llegás a `confirmar(pedido)`, que es lo único que de verdad hace esta función, tenés cuatro condiciones abiertas en la cabeza. Y los `else` que explican cada caso quedan lejísimos de la condición que los provocó.

Esa forma se conoce como flecha o pirámide, por el dibujo que hace el código contra el margen.

### Las guardas

La solución es invertir el orden. En vez de anidar el camino correcto adentro de las condiciones, chequeás lo que puede salir mal y salís de inmediato.

```javascript
function procesarPedido(pedido) {
  if (pedido == null) return "pedido inexistente";
  if (pedido.items.length === 0) return "pedido vacío";
  if (!pedido.cliente.activo) return "cliente inactivo";
  if (!hayStock(pedido.items)) return "sin stock";

  confirmar(pedido);
}
```

Es el mismo algoritmo. Cambió la forma y cambió todo lo demás.

Cada condición está pegada a su consecuencia, así que se lee de a una y se olvida. No hay indentación. El camino correcto queda al final, sin condiciones encima. Y agregar una validación nueva es agregar una línea, no reacomodar un bloque.

Esas condiciones de salida temprana se llaman guardas o cláusulas de guarda. Es probablemente el hábito que más mejora la legibilidad del código, y no cuesta nada adoptarlo.

Dos aclaraciones. Necesitás estar dentro de una función para poder usar `return`; dentro de un bucle el equivalente es `continue` o `break`. Y si el bloque no tiene salida posible, no hay guarda que valga: ahí conviene extraer el interior a otra función.

### Simplificaciones frecuentes

Hay varias formas de escribir un `if` que se pueden acortar sin perder claridad.

No compares booleanos con `true`:

```javascript
if (esValido === true) { }  // redundante
if (esValido) { }           // así
```

No armes un `if` para devolver un booleano:

```javascript
// Innecesario
function esMayor(edad) {
  if (edad >= 18) {
    return true;
  } else {
    return false;
  }
}

// La condición ya es el resultado
function esMayor(edad) {
  return edad >= 18;
}
```

Para asignar uno de dos valores, el ternario:

```javascript
// Con if
let etiqueta;
if (activo) {
  etiqueta = "Activo";
} else {
  etiqueta = "Inactivo";
}

// Con ternario
const etiqueta = activo ? "Activo" : "Inactivo";
```

El ternario gana porque además te deja usar `const`. Lo que no conviene es encadenarlos: tres ternarios anidados son ilegibles y para eso está el `else if`.

Para valores por defecto y accesos protegidos, lo que ya vimos:

```javascript
// En vez de if
const nombre = nombreIngresado ?? "Anónimo";
const ciudad = contacto?.direccion?.ciudad;
```

Y cuando la cadena de `else if` compara siempre lo mismo contra valores fijos, conviene reemplazarla por una tabla:

```javascript
// Cadena larga
function traducirEstado(estado) {
  if (estado === "pending") return "Pendiente";
  else if (estado === "paid") return "Pagado";
  else if (estado === "shipped") return "Enviado";
  else if (estado === "cancelled") return "Cancelado";
  else return "Desconocido";
}

// Tabla de despacho
const ESTADOS = {
  pending: "Pendiente",
  paid: "Pagado",
  shipped: "Enviado",
  cancelled: "Cancelado",
};

function traducirEstado(estado) {
  return ESTADOS[estado] ?? "Desconocido";
}
```

La segunda versión es datos en vez de código. Agregar un estado es agregar una línea a un objeto, y ese objeto lo podés mover a un archivo de configuración, exportarlo o recorrerlo. Cuando la cadena de condiciones es toda del tipo "si vale esto, entonces aquello", casi siempre conviene esta forma.

## El while

### La forma básica

```javascript
while (condicion) {
  // se repite mientras la condición sea verdadera
}
```

El `while` evalúa la condición antes de cada vuelta. Si es falsa desde el principio, el cuerpo no se ejecuta ni una vez.

Todo bucle necesita tres cosas, aunque el `while` no te obligue a escribirlas juntas: algo que inicialice, una condición y algo que avance hacia el final. Si falta el avance, el bucle no termina más.

```javascript
let i = 0;              // inicialización
while (i < 5) {         // condición
  console.log(i);
  i++;                  // avance
}
```

### Cuándo usar while

El `while` es la elección natural cuando no sabés de antemano cuántas vueltas van a ser.

Procesar una cola hasta vaciarla:

```javascript
const pendientes = [tarea1, tarea2, tarea3];

while (pendientes.length > 0) {
  const tarea = pendientes.shift();
  ejecutar(tarea);
  // ejecutar puede agregar tareas nuevas a la cola
}
```

Reintentar hasta que salga bien o se agoten los intentos:

```javascript
let intentos = 0;
let resultado = null;

while (resultado === null && intentos < 3) {
  resultado = intentarConexion();
  intentos++;
}
```

Avanzar por una estructura hasta llegar al final, como recorrer una lista enlazada o subir por un árbol:

```javascript
let elemento = nodoInicial;

while (elemento !== null) {
  procesar(elemento);
  elemento = elemento.siguiente;
}
```

Y los algoritmos que reducen un valor en cada vuelta:

```javascript
// Dígitos de un número
let n = 12345;
let suma = 0;

while (n > 0) {
  suma += n % 10;
  n = Math.floor(n / 10);
}
// suma = 15
```

### El bucle infinito

Si la condición nunca se vuelve falsa, el programa se cuelga. En el navegador, la pestaña deja de responder, porque JavaScript corre en un solo hilo y ese hilo está ocupado.

```javascript
let i = 0;
while (i < 5) {
  console.log(i);
  // falta i++, no termina nunca
}
```

Antes de escribir un `while`, preguntate qué línea hace que la condición se acerque a ser falsa. Si no la podés señalar, todavía no está terminado.

Hay un caso donde el bucle infinito es intencional: cuando la salida está adentro, con un `break`.

```javascript
while (true) {
  const linea = leerSiguiente();
  if (linea === null) break;
  procesar(linea);
}
```

Es legítimo, pero cada `break` que agregues suma una salida más que rastrear. Con más de dos, conviene replantear la condición.

### El do while

La variante `do while` evalúa la condición al final, así que el cuerpo se ejecuta al menos una vez.

```javascript
do {
  // se ejecuta siempre, mínimo una vez
} while (condicion);
```

Fijate el punto y coma final, que en el `while` común no va.

Sirve cuando la primera vuelta es obligatoria porque de ella sale el dato que evalúa la condición. El caso típico es pedir algo hasta que sea válido:

```javascript
let opcion;

do {
  opcion = mostrarMenu();
} while (!OPCIONES_VALIDAS.includes(opcion));
```

Con un `while` común habría que repetir la lectura antes del bucle:

```javascript
let opcion = mostrarMenu();   // duplicado
while (!OPCIONES_VALIDAS.includes(opcion)) {
  opcion = mostrarMenu();     // duplicado
}
```

Esa duplicación es la señal de que corresponde un `do while`.

Otro caso son los reintentos con espera creciente, donde el primer intento se hace siempre:

```javascript
let espera = 100;
let exito = false;
let intentos = 0;

do {
  exito = intentar();
  if (!exito) {
    esperar(espera);
    espera *= 2;
    intentos++;
  }
} while (!exito && intentos < 5);
```

En la práctica el `do while` se usa poco. Reconocerlo alcanza; forzarlo donde no corresponde no.

### break y continue

`break` corta el bucle y sigue después de él. `continue` abandona la vuelta actual y pasa a la siguiente.

```javascript
// break: buscar y salir
for (const contacto of contactos) {
  if (contacto.id === buscado) {
    encontrado = contacto;
    break;   // no tiene sentido seguir
  }
}

// continue: saltear los que no interesan
for (const linea of lineas) {
  if (linea.trim() === "") continue;
  if (linea.startsWith("#")) continue;
  procesar(linea);
}
```

Ese uso de `continue` es la versión de las guardas dentro de un bucle: en vez de meter todo el cuerpo adentro de un `if`, descartás lo que no sirve y seguís.

Los dos afectan solo al bucle más interno. Cuando hay bucles anidados y querés salir de los dos, JavaScript tiene etiquetas:

```javascript
buscar:
for (let fila = 0; fila < matriz.length; fila++) {
  for (let col = 0; col < matriz[fila].length; col++) {
    if (matriz[fila][col] === objetivo) {
      posicion = [fila, col];
      break buscar;   // sale de los dos bucles
    }
  }
}
```

Existen, y hay que saber leerlas. Pero antes de usarlas, mirá si no conviene extraer la búsqueda a una función y salir con `return`, que se entiende sin explicación:

```javascript
function buscarEnMatriz(matriz, objetivo) {
  for (let fila = 0; fila < matriz.length; fila++) {
    for (let col = 0; col < matriz[fila].length; col++) {
      if (matriz[fila][col] === objetivo) return [fila, col];
    }
  }
  return null;
}
```

Y recordá que `forEach` no acepta `break` ni `continue`. Si necesitás cortar, usá `for...of` o los métodos que ya cortan solos, como `find` y `some`.

## El switch

### La forma básica

`switch` compara un valor contra varias opciones fijas.

```javascript
switch (estado) {
  case "pending":
    mostrar("Pendiente");
    break;
  case "paid":
    mostrar("Pagado");
    break;
  case "shipped":
    mostrar("Enviado");
    break;
  default:
    mostrar("Desconocido");
}
```

La comparación es estricta, con `===`. No convierte tipos, así que el `1` del `case` no coincide con el `"1"` que llega:

```javascript
switch ("1") {
  case 1:
    console.log("nunca entra acá");
    break;
}
```

`default` cubre lo que no coincidió con ningún caso. Puede ir en cualquier posición, pero ponelo al final, porque es donde todo el mundo lo busca.

### El fallthrough

Acá está lo que distingue al `switch` de una cadena de `if`, y lo que más problemas causa.

El `switch` no elige un bloque: elige un punto de entrada. Una vez que encuentra el caso que coincide, empieza a ejecutar desde ahí y sigue de largo por los casos siguientes hasta que encuentre un `break` o se termine el `switch`.

Esa continuación se llama fallthrough, o caída.

```javascript
switch (2) {
  case 1:
    console.log("uno");
  case 2:
    console.log("dos");     // entra acá
  case 3:
    console.log("tres");    // y también ejecuta esto
  case 4:
    console.log("cuatro");  // y esto
}
// Imprime: dos, tres, cuatro
```

Por eso el `break` no es decoración. Olvidarlo es el error clásico del `switch`, y es difícil de detectar porque el código sigue funcionando: solo hace de más.

Ahora bien, el fallthrough tiene un uso deliberado y muy útil. Cuando varios casos comparten el mismo tratamiento, los apilás sin cuerpo:

```javascript
switch (dia) {
  case "sábado":
  case "domingo":
    return "fin de semana";
  case "lunes":
  case "martes":
  case "miércoles":
  case "jueves":
  case "viernes":
    return "día hábil";
  default:
    return "día inválido";
}
```

Los primeros dos casos no tienen cuerpo, así que caen al siguiente. Es la forma de escribir "o esto o aquello" en un `switch`, y es la razón por la que el lenguaje mantiene este comportamiento.

Cuando la caída es intencional pero el caso sí tiene cuerpo, dejá un comentario. Es una convención que además reconocen las herramientas de análisis:

```javascript
switch (nivel) {
  case "admin":
    permisos.push("borrar");
  // fallthrough intencional
  case "editor":
    permisos.push("editar");
  // fallthrough intencional
  case "lector":
    permisos.push("leer");
    break;
}
```

Ese ejemplo aprovecha la caída para acumular permisos: un admin termina con los tres.

### El alcance dentro del switch

Todos los `case` comparten un mismo bloque. Eso trae un problema al declarar variables:

```javascript
switch (tipo) {
  case "a":
    let x = 1;   // SyntaxError al llegar al siguiente
    break;
  case "b":
    let x = 2;   // redeclaración en el mismo alcance
    break;
}
```

La solución son llaves propias para el caso:

```javascript
switch (tipo) {
  case "a": {
    let x = 1;
    break;
  }
  case "b": {
    let x = 2;
    break;
  }
}
```

### Cuándo usar switch

Usalo cuando compares un mismo valor contra varias constantes y quieras agrupar casos. Con tres o cuatro opciones se lee mejor que la cadena de `else if`.

Vas a encontrar también este truco para manejar rangos:

```javascript
switch (true) {
  case edad < 13: return "niño";
  case edad < 18: return "adolescente";
  default: return "adulto";
}
```

Funciona, porque cada `case` se compara con `true`. Pero es una forma indirecta de escribir un `else if`, y se entiende menos. Preferí el `else if`.

Y si el `switch` solo mapea valores a valores, sin lógica, volvé a la tabla de despacho que vimos con el `if`. El objeto es más corto y no tiene `break` que olvidar.

## El for

### Las tres partes

El `for` junta en una línea las tres partes que en el `while` estaban desparramadas.

```javascript
for (inicializacion; condicion; avance) {
  // cuerpo
}
```

Y esa es exactamente la equivalencia entre los dos. Todo `for` se puede escribir como `while`:

```javascript
// for
for (let i = 0; i < 5; i++) {
  console.log(i);
}

// el mismo while
let i = 0;
while (i < 5) {
  console.log(i);
  i++;
}
```

El orden de ejecución es este: la inicialización corre una sola vez, antes de todo. Después se evalúa la condición; si es falsa, termina. Si es verdadera, corre el cuerpo, después el avance, y vuelve a la condición.

Las tres partes son opcionales. Si las sacás todas, queda un bucle infinito:

```javascript
for (;;) {
  // equivalente a while (true)
}
```

Y se pueden manejar varias variables con la coma:

```javascript
for (let i = 0, j = arr.length - 1; i < j; i++, j--) {
  [arr[i], arr[j]] = [arr[j], arr[i]];   // invierte el arreglo
}
```

### Cuándo for y cuándo while

La diferencia no es técnica, es de comunicación. Las tres partes del `for` están juntas y a la vista, así que quien lee sabe de entrada cuántas vueltas serán y cómo avanza.

Usá `for` cuando la inicialización, la condición y el avance hablen de lo mismo, típicamente un contador o un índice. Usá `while` cuando el avance dependa de algo que pasa adentro del cuerpo, o cuando no haya contador.

```javascript
// for: el índice manda
for (let i = 0; i < contactos.length; i++) { }

// while: el avance depende de lo que se lea
while ((linea = leer()) !== null) { }
```

### El for of

Recorre los valores de cualquier cosa iterable. Es el que vas a usar casi siempre.

```javascript
for (const contacto of contactos) {
  console.log(contacto.nombre);
}
```

Iterable significa que la estructura sabe entregar sus elementos de a uno. Son iterables los arreglos, las cadenas, los `Set`, los `Map` y el resultado de `Object.entries()`. Los objetos comunes no.

```javascript
for (const letra of "hola") { }
for (const valor of new Set([1, 2, 3])) { }
for (const [clave, valor] of new Map()) { }
for (const [clave, valor] of Object.entries(config)) { }
for (const [i, valor] of arreglo.entries()) { }
```

Acepta `break` y `continue`, que es lo que lo diferencia de `forEach`.

### El for in

Recorre las claves de un objeto. Ya vimos la clase pasada por qué no hay que usarlo con arreglos: entrega las claves como texto, incluye propiedades agregadas y saltea los huecos.

```javascript
for (const clave in configuracion) {
  console.log(clave, configuracion[clave]);
}
```

Además recorre las propiedades heredadas por la cadena de prototipos, que es un tema que veremos más adelante. Si querés solo las propias:

```javascript
for (const clave in objeto) {
  if (!Object.hasOwn(objeto, clave)) continue;
  // ...
}
```

En la práctica, casi siempre conviene `Object.entries()` con `for...of`, que no tiene ninguno de estos problemas.

### Un resumen de todos los bucles

| Estructura | Recorre | Cortás con `break` | Usalo para |
|---|---|---|---|
| `while` | mientras se cumpla algo | sí | cantidad de vueltas desconocida |
| `do while` | ídem, mínimo una vez | sí | cuando la primera vuelta es obligatoria |
| `for` | un contador | sí | índices, saltos, recorridos al revés |
| `for...of` | valores de un iterable | sí | recorrer colecciones |
| `for...in` | claves de un objeto | sí | propiedades de un objeto |
| `.forEach()` | valores, con función | no | aplicar algo a cada elemento |

## Las excepciones

### El problema que resuelven

Una función tiene un contrato: recibe algo y devuelve algo. La pregunta es qué hace cuando no puede cumplirlo.

Una opción es devolver un valor especial. Es lo que hace buena parte de la biblioteca estándar: `indexOf` devuelve `-1`, `find` devuelve `undefined`, `Number("abc")` devuelve `NaN`.

Esa opción tiene dos problemas. El primero es que se puede ignorar en silencio: nada te obliga a chequear el `-1`, y si no lo hacés el programa sigue con un valor equivocado. El segundo es que si el error tiene que llegar tres niveles más arriba, cada nivel intermedio tiene que recibirlo y reenviarlo, contaminando funciones que no tienen nada que ver.

La excepción resuelve las dos cosas. Interrumpe la ejecución en el punto del problema y sube por la pila de llamadas hasta que alguien la atrape. Si nadie la atrapa, el programa se detiene y muestra el error.

O sea que es un salto: rompe el flujo estructurado a propósito, y por eso hay que usarla con criterio.

### Lanzar

```javascript
function retirar(cuenta, monto) {
  if (monto <= 0) {
    throw new Error("El monto debe ser positivo");
  }
  if (monto > cuenta.saldo) {
    throw new Error("Saldo insuficiente");
  }
  cuenta.saldo -= monto;
}
```

En JavaScript podés lanzar cualquier valor, no solo errores. Es una libertad que no deberías usar:

```javascript
throw "algo salió mal";        // válido pero malo
throw new Error("algo salió mal"); // así
```

La diferencia es que un `Error` trae el nombre, el mensaje y la traza de la pila, que es la lista de funciones por las que pasó. Sin eso, depurar se vuelve adivinanza.

El lenguaje trae varios tipos de error, y los motores los usan para sus propias fallas:

| Tipo | Cuándo aparece |
|---|---|
| `Error` | el genérico, y la base de los demás |
| `TypeError` | una operación sobre un tipo que no corresponde |
| `RangeError` | un valor fuera del rango permitido |
| `ReferenceError` | una variable que no existe |
| `SyntaxError` | código mal escrito, o `JSON.parse` con texto inválido |

Un objeto de error tiene estas propiedades:

```javascript
const error = new Error("Saldo insuficiente");

error.name;     // "Error"
error.message;  // "Saldo insuficiente"
error.stack;    // el recorrido de llamadas
```

### Atrapar

```javascript
try {
  retirar(cuenta, 5000);
  console.log("Retiro exitoso");
} catch (error) {
  console.error("No se pudo retirar:", error.message);
} finally {
  cerrarSesion();
}
```

El bloque `try` contiene el código que puede fallar. Si se lanza algo, la ejecución salta al `catch` de inmediato: las líneas que quedaban en el `try` no se ejecutan.

El `finally` corre siempre, haya error o no, y también si el `try` tiene un `return`. Sirve para liberar lo que haya que liberar: cerrar una conexión, apagar un indicador de carga, destrabar un botón.

```javascript
function cargarDatos() {
  mostrarCargando(true);
  try {
    return leerDatos();
  } catch (error) {
    registrar(error);
    return null;
  } finally {
    mostrarCargando(false);   // pase lo que pase
  }
}
```

Si no te interesa el objeto del error, podés omitirlo:

```javascript
try {
  JSON.parse(texto);
} catch {
  return null;
}
```

### Distinguir tipos de error

Un `catch` atrapa todo lo que pase por ahí, así que muchas veces hay que ver qué llegó:

```javascript
try {
  procesar(datos);
} catch (error) {
  if (error instanceof SyntaxError) {
    avisar("El archivo está mal formado");
  } else if (error instanceof RangeError) {
    avisar("Un valor está fuera de rango");
  } else {
    throw error;   // no es mío, que suba
  }
}
```

Esa última línea importa. Si no sabés manejar un error, relanzalo. Atrapar todo y no hacer nada es la forma más eficaz de esconder un problema.

### Errores propios

Podés definir tus propios tipos extendiendo `Error`. Sirve para que quien atrapa pueda distinguir y para llevar datos extra:

```javascript
class ErrorDeValidacion extends Error {
  constructor(campo, mensaje) {
    super(mensaje);
    this.name = "ErrorDeValidacion";
    this.campo = campo;
  }
}

function validarContacto(contacto) {
  if (!contacto.email) {
    throw new ErrorDeValidacion("email", "El email es obligatorio");
  }
  if (!contacto.email.includes("@")) {
    throw new ErrorDeValidacion("email", "El email no es válido");
  }
}

try {
  validarContacto(datos);
} catch (error) {
  if (error instanceof ErrorDeValidacion) {
    marcarCampo(error.campo, error.message);
  } else {
    throw error;
  }
}
```

Cuando atrapás un error y lanzás otro, conservá el original con `cause`. Si no, perdés la causa real:

```javascript
try {
  await guardarEnBase(contacto);
} catch (error) {
  throw new Error("No se pudo guardar el contacto", { cause: error });
}
```

### Cuándo no usar excepciones

Acá está el criterio que da nombre a esta sección, y conviene tenerlo claro.

Una excepción es cara y rompe el flujo. Justifica ese costo cuando el problema es realmente excepcional: algo que no debería pasar, o que la función no puede resolver ni describir con un valor de retorno.

Cuando la falla es parte del funcionamiento normal, devolvé un valor.

```javascript
// Mal: que un contacto no exista es lo más común del mundo
function buscarContacto(id) {
  const c = contactos.find((c) => c.id === id);
  if (!c) throw new Error("No encontrado");
  return c;
}

// Bien
function buscarContacto(id) {
  return contactos.find((c) => c.id === id) ?? null;
}
```

Una prueba práctica: si quien llama a tu función va a tener que envolverla en un `try` siempre, entonces eso no era una excepción, era un resultado posible.

Lo mismo con la validación de un formulario. Que el usuario escriba mal un email es lo esperable, no algo excepcional. Devolvé la lista de problemas:

```javascript
function validar(contacto) {
  const errores = [];
  if (!contacto.nombre) errores.push({ campo: "nombre", mensaje: "Obligatorio" });
  if (!contacto.email) errores.push({ campo: "email", mensaje: "Obligatorio" });
  return errores;   // vacío si está todo bien
}
```

Otra forma habitual es devolver un objeto que describa el resultado, con éxito o con error:

```javascript
function convertirAFecha(texto) {
  const fecha = new Date(texto);
  if (Number.isNaN(fecha.getTime())) {
    return { ok: false, error: "Fecha inválida" };
  }
  return { ok: true, valor: fecha };
}

const resultado = convertirAFecha(entrada);
if (!resultado.ok) {
  mostrarError(resultado.error);
  return;
}
usarFecha(resultado.valor);
```

Ese patrón hace visible el error en la firma de la función. Nadie se lo puede olvidar, porque para llegar al valor tiene que pasar por el chequeo.

Resumiendo el criterio:

| Situación | Qué corresponde |
|---|---|
| Un contacto no existe | devolver `null` |
| Un formulario tiene campos vacíos | devolver la lista de errores |
| Un texto no se puede convertir | devolver un resultado con `ok` |
| El servidor no responde | lanzar |
| Un archivo de configuración está corrupto | lanzar |
| Un parámetro rompe una condición que nunca debería romperse | lanzar |

### Errores frecuentes al usar excepciones

El `catch` vacío es el peor de todos. Silencia el problema y deja el programa en un estado inconsistente, sin que nadie se entere:

```javascript
try {
  guardar(datos);
} catch (e) {
  // ← nunca dejes esto vacío
}
```

Si de verdad querés ignorar el error, escribí un comentario que diga por qué. Si no lo podés justificar, no lo ignores.

El `try` gigante es el otro. Si el bloque tiene cuarenta líneas y algo falla, no sabés qué falló:

```javascript
// Difícil de diagnosticar
try {
  const datos = leer();
  const validos = validar(datos);
  const guardados = guardar(validos);
  notificar(guardados);
} catch (error) {
  console.error("algo falló");
}
```

Envolvé el tramo más chico posible, y en cada `catch` decí de qué se trata.

Por último, una advertencia sobre lo que viene. En código asincrónico, un `try` común no atrapa lo que falla dentro de una promesa ni dentro de una función que se ejecuta más tarde:

```javascript
try {
  setTimeout(() => { throw new Error("no lo atrapa nadie"); }, 100);
} catch (error) {
  // nunca entra acá
}
```

La razón es que para cuando la función interna se ejecuta, el `try` ya terminó. Lo vamos a ver en detalle cuando lleguemos a promesas y a `async`.

## Para llevarte de esta clase

- todo se construye con secuencia, selección e iteración; el resto es legibilidad
- poné llaves siempre, aunque el `if` tenga una sola línea
- `else if` es un `if` dentro del `else`: se evalúa en orden y la primera condición verdadera gana
- ordená las condiciones de la más específica a la más general
- reemplazá el anidamiento profundo por guardas que salgan temprano
- cuando la cadena de `if` solo mapea valores, usá un objeto como tabla de despacho
- `while` cuando no sabés cuántas vueltas; `do while` cuando la primera es obligatoria
- todo `for` es un `while` con las tres partes juntas
- `switch` compara con `===` y elige un punto de entrada, no un bloque: sin `break` sigue de largo
- el fallthrough sin cuerpo es la forma correcta de agrupar casos
- `for...of` para colecciones, `for...in` para objetos, `forEach` cuando no necesites cortar
- lanzá excepciones solo para lo excepcional; para lo esperable, devolvé un valor
- nunca dejes un `catch` vacío, y si no sabés manejar un error, relanzalo

## Para probar antes de la próxima clase

1. Tomá una función con tres niveles de `if` anidados y reescribila con guardas. Contá las líneas y los niveles de indentación de cada versión.
2. Escribí una cadena de seis `else if` que traduzca códigos de estado a texto, y después reescribila como tabla de despacho.
3. Escribí un `switch` que devuelva la cantidad de días de un mes, agrupando los casos con fallthrough. Después agregale el caso de febrero en año bisiesto.
4. Convertí a `while` este `for`: `for (let i = 10; i > 0; i -= 2)`. Después convertí a `for` un `while` que recorra un arreglo salteando los elementos nulos.
5. Escribí una función `buscarEnMatriz` que devuelva la posición de un valor. Resolvela primero con etiquetas y `break`, después con `return`, y decidí cuál dejarías en el proyecto.
6. Escribí `convertirANumero(texto)` en dos versiones: una que lance una excepción y otra que devuelva `{ ok, valor, error }`. Escribí el código que las usa y compará cuál obliga a manejar el error.
