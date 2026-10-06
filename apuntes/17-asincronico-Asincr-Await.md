# Programación Asincrónica
## `async` / `await` en JavaScript

## 1. El problema

Hay operaciones que tardan: pedir datos a un servidor, leer un archivo, esperar un segundo.
JavaScript tiene **un solo hilo**, así que no puede quedarse parado esperando: si lo hiciera,
la página entera se congela (no responde ningún clic, no se anima nada).

La solución es no esperar bloqueando. La función que pide el dato se **suspende**, el resto
del programa sigue corriendo, y cuando el dato llega la función retoma donde estaba.

Eso es exactamente lo que hacen `async` y `await`.

---

## 2. Las dos palabras

Una **promesa** es un valor que todavía no llegó. Las funciones que tardan no devuelven el
dato: devuelven una promesa de ese dato.

**`await`** espera a que la promesa termine y devuelve el valor.

```js
const respuesta = await fetch("/api/usuarios");
```

**`async`** marca la función que contiene `await`. Sin ella, `await` es un error de sintaxis.

```js
async function cargar() {
  const respuesta = await fetch("/api/usuarios");
  const usuarios = await respuesta.json();
  return usuarios;
}
```

Dos consecuencias, y son todo lo que hay que recordar:

- Una función `async` **siempre devuelve una promesa**. Por eso, para usar su resultado desde
  afuera, también hay que ponerle `await`.
- `await` **no bloquea el programa**: suspende solamente a *esa* función.

```js
const usuarios = await cargar();     // ← el await de afuera
```

> **Regla:** si una función tiene un `await` adentro, va marcada `async`. Si una función es
> `async`, al llamarla le va un `await`. Se contagia hacia arriba.

---

## 3. La forma que se usa siempre

El 90 % del código asincrónico real tiene esta forma:

```js
async function mostrarUsuario(id) {
  const respuesta = await fetch(`/api/usuarios/${id}`);
  const usuario = await respuesta.json();
  document.querySelector("#nombre").textContent = usuario.nombre;
}
```

Dos detalles de `fetch` que hay que saber de memoria:

1. Hacen falta **dos `await`**: el primero espera la respuesta, el segundo espera y convierte
   el cuerpo (`.json()` también devuelve una promesa).
2. **Un 404 no falla.** `fetch` solo rechaza si se cayó la red. Hay que revisar `ok` a mano:

```js
if (!respuesta.ok) throw new Error(`Error ${respuesta.status}`);
```

---

## 4. Errores: `try` / `catch` de siempre

Si la promesa falla, `await` lanza una excepción. Se atrapa como cualquier otra:

```js
async function mostrarUsuario(id) {
  const cartel = document.querySelector("#estado");
  cartel.textContent = "Cargando...";

  try {
    const respuesta = await fetch(`/api/usuarios/${id}`);
    if (!respuesta.ok) throw new Error(`Error ${respuesta.status}`);

    const usuario = await respuesta.json();
    cartel.textContent = usuario.nombre;
  } catch (error) {
    cartel.textContent = `No se pudo cargar: ${error.message}`;
  } finally {
    document.querySelector("#boton").disabled = false;   // siempre se ejecuta
  }
}
```

Un solo `try` cubre todos los `await` que haya adentro.

---

## 5. En paralelo: `Promise.all`

Este es el error más común de todos.

```js
// MAL: 3 segundos
const usuarios  = await obtenerUsuarios();    // 1 s
const productos = await obtenerProductos();   // 1 s
const ventas    = await obtenerVentas();      // 1 s
```

Los tres pedidos son independientes, no hay razón para hacerlos en fila:

```js
// BIEN: 1 segundo
const [usuarios, productos, ventas] = await Promise.all([
  obtenerUsuarios(),
  obtenerProductos(),
  obtenerVentas(),
]);
```

Lo que cambia es *cuándo arranca cada uno*: llamar a la función arranca el trabajo, `await`
solo espera el resultado. Dentro del arreglo, las tres arrancan juntas.

> **Regla:** si un `await` no usa el resultado del `await` anterior, están mal puestos.

`Promise.all` falla entero si falla uno. Si se quiere el resultado de cada uno igual, va
`Promise.allSettled`:

```js
const resultados = await Promise.allSettled([guardarA(), guardarB()]);
// cada uno: { status: "fulfilled", value } | { status: "rejected", reason }
```

---

## 6. `await` dentro de un bucle

**Uno por vez** (cuando importa el orden o cada paso depende del anterior):

```js
for (const id of ids) {
  const usuario = await obtenerUsuario(id);
  console.log(usuario.nombre);
}
```

**Todos juntos** (cuando son independientes, que es lo habitual):

```js
const usuarios = await Promise.all(ids.map(id => obtenerUsuario(id)));
```

**`forEach` no funciona.** Ignora la promesa que devuelve la función, así que no espera nada:

```js
ids.forEach(async (id) => { ... });
console.log("listo");     // ← se imprime primero, sin ningún dato
```

Con `async`: `for...of` o `map` + `Promise.all`. Nunca `forEach`.

---

## 7. Errores frecuentes

| Error | Síntoma | Solución |
|---|---|---|
| Olvidar `await` | Sale `Promise { <pending> }` en vez del valor | Agregar `await` |
| Olvidar el segundo `await` en `fetch` | El cuerpo nunca llega | `await respuesta.json()` |
| `await` en serie sobre cosas independientes | Tarda N veces más | `Promise.all` |
| `forEach` con `async` | El código sigue de largo sin esperar | `for...of` o `map` + `all` |
| No revisar `respuesta.ok` | Un 404 se procesa como dato válido | `if (!respuesta.ok) throw ...` |
| `await` fuera de una función `async` | Error de sintaxis | Marcar la función con `async` |
| Llamar una `async` sin `await` ni `.catch` | El error se pierde en silencio | `await` la llamada |

---

## 8. Resumen

```js
async function tarea() {            // async → devuelve una promesa
  try {
    const a = await pedirA();       // await → espera y devuelve el valor
    const b = await pedirB(a);      // en fila: b necesita a
    const [c, d] = await Promise.all([pedirC(), pedirD()]);   // juntos: independientes
    return { a, b, c, d };
  } catch (error) {                 // cualquier falla cae acá
    console.error(error);
  } finally {
    limpiar();                      // siempre
  }
}

await tarea();                      // se contagia hacia arriba
```
