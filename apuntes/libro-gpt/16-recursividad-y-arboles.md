# 16. Recursividad y árboles binarios

## Idea central

**La recursividad resulta natural cuando un problema contiene versiones más pequeñas de sí mismo.** Para que sea correcta, cada llamada debe acercarse a un caso base; para que sea productiva, la forma de la función debe reflejar la estructura de los datos y mantener explícitas sus invariantes.

Los árboles son el ejemplo central: cada nodo contiene un valor y referencias a subárboles que obedecen la misma definición.

## Qué ocurre en una llamada recursiva

Una función puede llamarse a sí misma:

```js
function cuentaRegresiva(numero) {
  if (numero < 0) return;

  console.log(numero);
  cuentaRegresiva(numero - 1);
}
```

Cada llamada crea un marco en la pila con sus parámetros y variables locales. La llamada actual queda suspendida hasta que termine la siguiente.

```text
cuentaRegresiva(2)
  cuentaRegresiva(1)
    cuentaRegresiva(0)
      cuentaRegresiva(-1) → termina
```

La pila tiene un límite. Una recursión sin fin o con demasiada profundidad produce un error de tamaño máximo de pila.

## Las tres preguntas obligatorias

Antes de escribir una función recursiva:

1. **Caso base:** ¿qué entrada puedo resolver sin otra llamada?
2. **Reducción:** ¿cómo garantizo que la siguiente entrada es más pequeña o más cercana al final?
3. **Combinación:** ¿cómo se integra el resultado pequeño en la respuesta actual?

Factorial:

```js
function factorial(n) {
  if (!Number.isSafeInteger(n) || n < 0) {
    throw new RangeError("n debe ser un entero no negativo");
  }

  if (n <= 1) return 1;
  return n * factorial(n - 1);
}
```

- caso base: `0!` y `1!` valen `1`;
- reducción: `n - 1`;
- combinación: multiplicar `n` por el resultado menor.

## Recursión sobre una secuencia

```js
function sumar(numeros, indice = 0) {
  if (indice === numeros.length) return 0;
  return numeros[indice] + sumar(numeros, indice + 1);
}
```

Funciona, pero un bucle es más directo y no consume un marco por elemento:

```js
function sumarIterativo(numeros) {
  let total = 0;

  for (const numero of numeros) {
    total += numero;
  }

  return total;
}
```

La recursividad no es “mejor” por ser más abstracta. Es especialmente útil cuando la estructura de la entrada también es recursiva.

## Estructuras anidadas

```js
const documento = {
  titulo: "Curso",
  secciones: [
    {
      titulo: "Unidad 1",
      secciones: [
        { titulo: "Tema 1", secciones: [] }
      ]
    }
  ]
};
```

Cada sección contiene secciones. Una función puede aplicar la misma operación en cada nivel:

```js
function contarSecciones(seccion) {
  return 1 + seccion.secciones.reduce(
    (total, hija) => total + contarSecciones(hija),
    0
  );
}
```

El array vacío funciona como base implícita: su suma adicional es cero.

## Definir un nodo binario

```js
function Nodo(valor, menor = null, mayor = null) {
  return { valor, menor, mayor };
}
```

Un nodo tiene como máximo dos hijos. `null` representa un subárbol vacío.

```js
const raiz = Nodo(
  20,
  Nodo(15, Nodo(10)),
  Nodo(30, Nodo(25))
);
```

```text
        20
       /  \
     15    30
    /     /
   10    25
```

## El invariante de un árbol binario de búsqueda

Para cada nodo:

- todos los valores del subárbol `menor` se comparan antes que el valor del nodo;
- todos los valores del subárbol `mayor` se comparan después;
- ambos subárboles cumplen la misma regla.

Hay que decidir qué hacer con duplicados:

- rechazarlos;
- ubicarlos siempre en una rama;
- almacenar una frecuencia;
- permitir varios registros bajo la misma clave.

Sin una política consistente, buscar, insertar y eliminar dejarán de concordar.

## Recorrido inorden

```js
function recorrerEnOrden(nodo, resultado = []) {
  if (nodo === null) return resultado;

  recorrerEnOrden(nodo.menor, resultado);
  resultado.push(nodo.valor);
  recorrerEnOrden(nodo.mayor, resultado);

  return resultado;
}

recorrerEnOrden(raiz); // [10, 15, 20, 25, 30]
```

El caso base es el árbol vacío. El orden es:

```text
subárbol menor → nodo → subárbol mayor
```

En un árbol de búsqueda válido, produce los valores ordenados.

## Preorden y postorden

Preorden procesa el nodo antes de sus hijos:

```js
function preorden(nodo, resultado = []) {
  if (nodo === null) return resultado;

  resultado.push(nodo.valor);
  preorden(nodo.menor, resultado);
  preorden(nodo.mayor, resultado);
  return resultado;
}
```

Es útil para copiar o serializar conservando la raíz antes de las ramas.

Postorden procesa hijos antes del nodo:

```js
function postorden(nodo, resultado = []) {
  if (nodo === null) return resultado;

  postorden(nodo.menor, resultado);
  postorden(nodo.mayor, resultado);
  resultado.push(nodo.valor);
  return resultado;
}
```

Sirve cuando el resultado del padre depende de ambos hijos o cuando se liberan estructuras desde las hojas.

## Recorridos como generadores

Un generador evita construir un array completo y permite cortar el consumo:

```js
function* valoresEnOrden(nodo) {
  if (nodo === null) return;

  yield* valoresEnOrden(nodo.menor);
  yield nodo.valor;
  yield* valoresEnOrden(nodo.mayor);
}

for (const valor of valoresEnOrden(raiz)) {
  console.log(valor);
}
```

La recursión sigue creando marcos por profundidad, pero los valores se producen de manera diferida.

## Buscar descartando una rama

```js
function compararNumeros(a, b) {
  return a - b;
}

function buscar(nodo, valor, comparar = compararNumeros) {
  if (nodo === null) return null;

  const orden = comparar(valor, nodo.valor);

  if (orden === 0) return nodo.valor;

  return orden < 0
    ? buscar(nodo.menor, valor, comparar)
    : buscar(nodo.mayor, valor, comparar);
}
```

Cada comparación elige una sola rama. En un árbol equilibrado con `n` nodos, la profundidad típica es proporcional a `log₂(n)`. En el peor caso puede ser `n`.

Versión iterativa:

```js
function buscarIterativo(raiz, valor, comparar = compararNumeros) {
  let actual = raiz;

  while (actual !== null) {
    const orden = comparar(valor, actual.valor);

    if (orden === 0) return actual.valor;
    actual = orden < 0 ? actual.menor : actual.mayor;
  }

  return null;
}
```

La versión iterativa mantiene profundidad constante en la pila y refleja que solo seguimos un camino.

## Insertar modificando el árbol

```js
function insertarMutable(nodo, valor, comparar = compararNumeros) {
  if (nodo === null) return Nodo(valor);

  if (comparar(valor, nodo.valor) < 0) {
    nodo.menor = insertarMutable(nodo.menor, valor, comparar);
  } else {
    nodo.mayor = insertarMutable(nodo.mayor, valor, comparar);
  }

  return nodo;
}
```

Es importante reasignar la rama al resultado recursivo: cuando llega a `null`, la llamada devuelve el nuevo nodo.

```js
let arbol = null;

for (const valor of [20, 15, 10, 30, 25]) {
  arbol = insertarMutable(arbol, valor);
}
```

Si el árbol estaba vacío, también hay que reasignar la raíz.

## Insertar sin modificar la versión anterior

```js
function insertar(nodo, valor, comparar = compararNumeros) {
  if (nodo === null) return Nodo(valor);

  if (comparar(valor, nodo.valor) < 0) {
    return {
      ...nodo,
      menor: insertar(nodo.menor, valor, comparar)
    };
  }

  return {
    ...nodo,
    mayor: insertar(nodo.mayor, valor, comparar)
  };
}
```

Solo se copian los nodos del camino. El otro subárbol se comparte porque no cambia:

```js
const nuevo = insertar(raiz, 12);

nuevo !== raiz;                    // true
nuevo.mayor === raiz.mayor;        // true, rama compartida
nuevo.menor !== raiz.menor;        // true, camino modificado
```

Este **compartir estructural** permite conservar versiones sin clonar todo el árbol.

## Altura y cantidad

```js
function cantidad(nodo) {
  if (nodo === null) return 0;
  return 1 + cantidad(nodo.menor) + cantidad(nodo.mayor);
}

function altura(nodo) {
  if (nodo === null) return 0;
  return 1 + Math.max(altura(nodo.menor), altura(nodo.mayor));
}
```

Ambas funciones deben visitar todos los nodos: su costo es lineal en la cantidad de elementos. La profundidad de la recursión depende de la altura.

## Mínimo y máximo

El menor valor está en la rama izquierda más profunda:

```js
function minimo(nodo) {
  if (nodo === null) return null;

  let actual = nodo;
  while (actual.menor !== null) actual = actual.menor;
  return actual.valor;
}
```

El máximo sigue la rama derecha. Estas operaciones aprovechan el invariante y no necesitan recorrer todo.

## Eliminar un valor

La eliminación tiene tres casos:

1. nodo hoja: devolver `null`;
2. un solo hijo: devolver ese hijo;
3. dos hijos: reemplazar por un sucesor y eliminar ese sucesor de su rama original.

```js
function eliminar(nodo, valor, comparar = compararNumeros) {
  if (nodo === null) return null;

  const orden = comparar(valor, nodo.valor);

  if (orden < 0) {
    return { ...nodo, menor: eliminar(nodo.menor, valor, comparar) };
  }

  if (orden > 0) {
    return { ...nodo, mayor: eliminar(nodo.mayor, valor, comparar) };
  }

  if (nodo.menor === null) return nodo.mayor;
  if (nodo.mayor === null) return nodo.menor;

  const sucesor = minimo(nodo.mayor);

  return {
    valor: sucesor,
    menor: nodo.menor,
    mayor: eliminar(nodo.mayor, sucesor, comparar)
  };
}
```

Esta versión supone que la política de duplicados y el comparador hacen identificable el sucesor. Para registros con claves no únicas, el contrato debe precisar qué elimina.

## Validar el invariante

No alcanza con comparar cada nodo solo con sus hijos. Un valor puede violar un límite heredado desde un ancestro:

```js
function esArbolDeBusqueda(
  nodo,
  comparar = compararNumeros,
  minimoPermitido = null,
  maximoPermitido = null
) {
  if (nodo === null) return true;

  if (minimoPermitido !== null &&
      comparar(nodo.valor, minimoPermitido) < 0) {
    return false;
  }

  if (maximoPermitido !== null &&
      comparar(nodo.valor, maximoPermitido) >= 0) {
    return false;
  }

  return esArbolDeBusqueda(
    nodo.menor,
    comparar,
    minimoPermitido,
    nodo.valor
  ) && esArbolDeBusqueda(
    nodo.mayor,
    comparar,
    nodo.valor,
    maximoPermitido
  );
}
```

La función adopta la política “menores a la izquierda y mayores o iguales a la derecha”. Los límites deben adaptarse a la política real y a claves que puedan coincidir con los centinelas; una implementación genérica puede usar indicadores separados en lugar de `null`.

## Comparadores y datos compuestos

```js
const compararPorLegajo = (a, b) => a.legajo - b.legajo;

let alumnos = null;
alumnos = insertar(alumnos, { legajo: 20, nombre: "Ana" }, compararPorLegajo);
alumnos = insertar(alumnos, { legajo: 10, nombre: "Luis" }, compararPorLegajo);
```

Buscar requiere un valor comparable:

```js
buscar(alumnos, { legajo: 10 }, compararPorLegajo);
```

El comparador debe ser consistente y definir un orden total apropiado. Si dos registros tienen el mismo legajo, el árbol necesita una política de duplicados.

## Encapsular el árbol

```js
function crearArbol(comparar = compararNumeros) {
  let raiz = null;

  return {
    insertar(valor) {
      raiz = insertar(raiz, valor, comparar);
      return this;
    },

    buscar(valor) {
      return buscar(raiz, valor, comparar);
    },

    eliminar(valor) {
      raiz = eliminar(raiz, valor, comparar);
      return this;
    },

    valores() {
      return [...valoresEnOrden(raiz)];
    },

    get cantidad() {
      return cantidad(raiz);
    }
  };
}
```

La clausura conserva la raíz y garantiza que todas las operaciones usan el mismo comparador.

## Equilibrio y complejidad

Insertar valores ya ordenados crea una cadena:

```text
10
  \
   20
     \
      30
```

La búsqueda pierde la ventaja y cuesta hasta `n` comparaciones. Un orden mezclado puede producir una altura cercana a `log₂(n)`.

Árboles AVL y rojo-negro realizan rotaciones para mantener balance. Implementarlos excede este capítulo, pero dejan una lección: la complejidad prometida depende de mantener no solo el orden, sino también una forma suficientemente equilibrada.

Para muchos programas JavaScript, `Map` es la estructura productiva para búsquedas por clave. Implementar un árbol es valioso para comprender recursividad, invariantes, orden y complejidad; se elige en producción cuando sus capacidades específicas justifican el costo.

## Recorridos iterativos con pila

Para árboles de profundidad externa o potencialmente enorme, una pila explícita evita desbordar la pila de llamadas:

```js
function inordenIterativo(raiz) {
  const resultado = [];
  const pendientes = [];
  let actual = raiz;

  while (actual !== null || pendientes.length > 0) {
    while (actual !== null) {
      pendientes.push(actual);
      actual = actual.menor;
    }

    actual = pendientes.pop();
    resultado.push(actual.valor);
    actual = actual.mayor;
  }

  return resultado;
}
```

La estructura explícita reproduce los marcos que la recursión guardaba implícitamente.

## Depurar una recursión

Registrá entrada, profundidad y caso base:

```js
function buscarConTraza(nodo, valor, profundidad = 0) {
  console.log({ profundidad, actual: nodo?.valor ?? null });

  if (nodo === null || nodo.valor === valor) return nodo;

  return valor < nodo.valor
    ? buscarConTraza(nodo.menor, valor, profundidad + 1)
    : buscarConTraza(nodo.mayor, valor, profundidad + 1);
}
```

Probá:

- estructura vacía;
- un nodo;
- valor en la raíz;
- valor en cada rama;
- valor ausente;
- árbol degenerado;
- duplicados según la política elegida.

## Errores frecuentes

- no definir caso base;
- hacer una llamada que no reduce el problema;
- olvidar retornar el resultado recursivo;
- no reasignar una rama después de insertar o eliminar;
- mezclar políticas de duplicados;
- verificar solo padres e hijos y no límites de ancestros;
- asumir búsqueda logarítmica sin controlar equilibrio;
- usar recursión profunda con entrada externa no limitada.

## Práctica guiada

Implementá un árbol de alumnos ordenado por legajo con inserción, búsqueda, eliminación, altura, cantidad y recorrido iterable. Rechazá duplicados de manera explícita. Generá dos árboles con los legajos `1` a `1000`: uno en orden y otro mezclado. Compará altura, cantidad de pasos y comportamiento de la versión recursiva frente a la iterativa.

## Para recordar

- Recursión correcta significa caso base, reducción y combinación.
- La estructura recursiva de un árbol se refleja en la función que lo recorre.
- Un árbol de búsqueda necesita una política de orden y duplicados compartida por todas sus operaciones.
- Inmutabilidad puede lograrse copiando el camino y compartiendo ramas no modificadas.
- El equilibrio determina si buscar cuesta aproximadamente `log n` o se degrada a `n`.
