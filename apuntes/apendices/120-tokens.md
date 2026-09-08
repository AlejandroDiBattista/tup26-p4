# Apéndice A. Byte Pair Encoding: construir un tokenizador

## Idea central

**Byte Pair Encoding (BPE) convierte texto en una secuencia de tokens al comenzar con unidades universales y aprender, en orden, fusiones de pares frecuentes.** El modelo aprendido no es solo un diccionario: es una lista ordenada de reglas que debe aplicarse de la misma forma al codificar y deshacerse al decodificar.

Este apéndice integra conceptos del libro:

- strings, Unicode y UTF-8;
- arrays, `Map` y conteos;
- funciones puras y clases;
- recursividad;
- archivos JSON;
- invariantes y pruebas.

La implementación es didáctica. Permite comprender el mecanismo, observarlo y experimentar; no intenta reemplazar un tokenizador de producción.

## A.1. El problema: convertir texto en números

Los modelos y muchos algoritmos numéricos no operan directamente sobre palabras visibles. Necesitan identificadores:

```text
"hola mundo" → [391, 82, 1042]
```

La conversión debe resolver requisitos en tensión:

1. representar cualquier texto;
2. no crear un vocabulario imposible de mantener;
3. producir secuencias razonablemente cortas;
4. ser reversible o conservar la información necesaria;
5. aplicar exactamente el mismo modelo durante entrenamiento e inferencia.

## A.2. Por qué no usar solo palabras

Un token por palabra parece natural:

```text
"casa" → 1
"casas" → 2
"casita" → 3
```

Pero aparecen:

- formas flexionadas;
- errores de escritura;
- nombres propios;
- URLs, código y números;
- idiomas diferentes;
- palabras que no estaban en el corpus.

Un vocabulario de palabras crece mucho y todavía necesita un token desconocido.

## A.3. Por qué no usar solo caracteres o bytes

Unidades pequeñas representan cualquier texto, pero alargan la secuencia. Una palabra frecuente se repite como varios pasos en lugar de una unidad reutilizable.

BPE busca un compromiso:

```text
unidades pequeñas universales
+ composiciones frecuentes aprendidas
= cobertura completa con secuencias más compactas
```

## A.4. Texto, puntos de código y UTF-8

Un string JavaScript usa unidades UTF-16. Para obtener una base finita y universal, esta implementación lo codifica como UTF-8:

```js
const encoder = new TextEncoder();
const decoder = new TextDecoder("utf-8", { fatal: true });

const bytes = [...encoder.encode("mañana")];
const recuperado = decoder.decode(Uint8Array.from(bytes));
```

Cada byte es un entero entre `0` y `255`. Por lo tanto, los ids base son:

```text
0, 1, 2, ... 255
```

Un byte no equivale a un carácter. `ñ` ocupa más de un byte en UTF-8 y un emoji suele ocupar cuatro. BPE puede aprender a fusionar esos bytes si aparecen con frecuencia.

## A.5. Qué es un token

En este modelo, un token es un id que representa:

- un byte base; o
- la concatenación de dos tokens anteriores.

```text
token 256 = token 97 + token 110
```

Si `97` representa `a` y `110` representa `n` en UTF-8/ASCII, el nuevo token representa `an`.

Una regla posterior puede usar el token `256`:

```text
token 257 = token 98 + token 256  → "ban"
```

El vocabulario forma un grafo de composiciones dirigido hacia unidades anteriores.

## A.6. La idea del entrenamiento

Dada una secuencia:

```text
banana banana
```

la convertimos en bytes y repetimos:

1. contar pares adyacentes;
2. elegir el más frecuente;
3. asignarle un id nuevo;
4. reemplazar todas sus apariciones no superpuestas;
5. guardar la regla;
6. volver a contar sobre la secuencia resultante.

El proceso se detiene al alcanzar un número máximo de fusiones o cuando ningún par alcanza la frecuencia mínima.

## A.7. Contar pares

Una clave de texto permite usar `Map`:

```js
function clavePar(izquierda, derecha) {
  return `${izquierda},${derecha}`;
}

function contarPares(ids) {
  const conteos = new Map();

  for (let indice = 0; indice < ids.length - 1; indice += 1) {
    const clave = clavePar(ids[indice], ids[indice + 1]);
    conteos.set(clave, (conteos.get(clave) ?? 0) + 1);
  }

  return conteos;
}
```

Para:

```text
[1, 2, 1, 2, 3]
```

cuenta:

```text
(1,2) → 2
(2,1) → 1
(2,3) → 1
```

La representación de clave es suficiente para ids enteros. Una implementación optimizada podría evitar crear strings en cada par.

## A.8. Elegir el par más frecuente

```js
function parMasFrecuente(ids) {
  const conteos = contarPares(ids);
  let mejorPar = null;
  let mejorFrecuencia = 0;

  for (const [clave, frecuencia] of conteos) {
    if (frecuencia > mejorFrecuencia) {
      mejorPar = clave.split(",").map(Number);
      mejorFrecuencia = frecuencia;
    }
  }

  return mejorPar === null
    ? null
    : { par: mejorPar, frecuencia: mejorFrecuencia };
}
```

El desempate es determinista: `Map` conserva el orden de primera inserción y solo reemplazamos al encontrar una frecuencia estrictamente mayor. Por lo tanto, gana el par que apareció primero entre los máximos.

La política de desempate forma parte del modelo. Otra implementación que elija distinto aprenderá reglas diferentes aunque use el mismo corpus.

## A.9. Fusionar sin superposición

```js
function fusionar(ids, [izquierda, derecha], nuevoId) {
  const resultado = [];

  for (let indice = 0; indice < ids.length;) {
    const coincide =
      ids[indice] === izquierda &&
      ids[indice + 1] === derecha;

    if (coincide) {
      resultado.push(nuevoId);
      indice += 2;
    } else {
      resultado.push(ids[indice]);
      indice += 1;
    }
  }

  return resultado;
}
```

```js
fusionar([1, 2, 1, 2, 1], [1, 2], 256);
// [256, 256, 1]
```

El índice avanza dos posiciones ante una fusión. Así las coincidencias no se superponen.

Para `[1, 1, 1]` y el par `[1, 1]`, el resultado es `[256, 1]`, no una fusión doble que reutilice el elemento central.

## A.10. Representar una regla

```js
const regla = {
  izquierda: 97,
  derecha: 110,
  id: 256
};
```

El id nuevo será `256 + cantidadDeFusiones`. La lista queda contigua y ordenada. Una regla solo puede referirse a bytes o a tokens creados antes.

Invariantes:

```text
id >= 256
izquierda < id
derecha < id
id de la regla en posición i = 256 + i
```

Estos invariantes permiten localizar una regla mediante `fusiones[id - 256]` y garantizan que la expansión recursiva termina.

## A.11. Clase completa

```js
class BPE {
  constructor() {
    this.fusiones = [];
  }

  train(texto, maximoFusiones = 100, frecuenciaMinima = 2) {
    if (!Number.isSafeInteger(maximoFusiones) || maximoFusiones < 0) {
      throw new RangeError("maximoFusiones debe ser no negativo");
    }

    if (!Number.isSafeInteger(frecuenciaMinima) || frecuenciaMinima < 2) {
      throw new RangeError("frecuenciaMinima debe ser al menos 2");
    }

    let ids = [...new TextEncoder().encode(texto)];
    this.fusiones = [];

    for (let paso = 0; paso < maximoFusiones; paso += 1) {
      const candidato = parMasFrecuente(ids);

      if (!candidato || candidato.frecuencia < frecuenciaMinima) break;

      const id = 256 + this.fusiones.length;
      const [izquierda, derecha] = candidato.par;

      this.fusiones.push({ izquierda, derecha, id });
      ids = fusionar(ids, candidato.par, id);
    }

    return ids;
  }

  encode(texto) {
    let ids = [...new TextEncoder().encode(texto)];

    for (const regla of this.fusiones) {
      ids = fusionar(
        ids,
        [regla.izquierda, regla.derecha],
        regla.id
      );
    }

    return ids;
  }

  decode(ids) {
    const bytes = [];

    for (const id of ids) {
      bytes.push(...this.#expandir(id));
    }

    return new TextDecoder("utf-8", { fatal: true })
      .decode(Uint8Array.from(bytes));
  }

  #expandir(id) {
    if (!Number.isSafeInteger(id) || id < 0) {
      throw new RangeError(`Token inválido: ${id}`);
    }

    if (id < 256) return [id];

    const regla = this.fusiones[id - 256];

    if (!regla || regla.id !== id) {
      throw new RangeError(`Token desconocido: ${id}`);
    }

    return [
      ...this.#expandir(regla.izquierda),
      ...this.#expandir(regla.derecha)
    ];
  }
}
```

## A.12. Entrenamiento paso a paso

```js
function entrenarConTraza(texto, maximoFusiones = 10) {
  let ids = [...new TextEncoder().encode(texto)];
  const reglas = [];

  for (let paso = 0; paso < maximoFusiones; paso += 1) {
    const candidato = parMasFrecuente(ids);
    if (!candidato || candidato.frecuencia < 2) break;

    const id = 256 + reglas.length;
    const antes = ids.length;

    ids = fusionar(ids, candidato.par, id);
    reglas.push({
      id,
      izquierda: candidato.par[0],
      derecha: candidato.par[1]
    });

    console.log({
      paso: paso + 1,
      par: candidato.par,
      frecuencia: candidato.frecuencia,
      antes,
      despues: ids.length,
      id
    });
  }

  return { ids, reglas };
}
```

La traza permite observar que una fusión frecuente reduce la longitud y que los conteos deben recalcularse después de cada cambio.

## A.13. Por qué el orden importa

Supongamos:

```text
256 = (97, 110)    → "an"
257 = (98, 256)   → "ban"
258 = (257, 256)  → "banan"
```

La regla `257` no puede aplicarse antes de crear `256`. Ordenar las reglas por frecuencia, texto o ids internos cambiaría la tokenización.

`encode` debe recorrer exactamente en el orden aprendido. Guardar solo un diccionario de bytes finales sin las prioridades no siempre permite reconstruir esa conducta.

## A.14. Decodificación recursiva

Un token base devuelve un byte. Un token compuesto expande sus dos hijos:

```text
expandir(258)
→ expandir(257) + expandir(256)
→ expandir(98) + expandir(256) + expandir(97) + expandir(110)
→ bytes originales
```

El caso base es `id < 256`. El invariante “cada regla referencia tokens anteriores” impide ciclos y garantiza terminación.

Una implementación más eficiente puede precalcular la secuencia de bytes de cada regla al cargar el modelo y evitar expandir repetidamente.

## A.15. La propiedad fundamental

Para cualquier string que pueda codificarse como UTF-8:

```text
decode(encode(texto)) === texto
```

```js
const bpe = new BPE();
bpe.train("banana banana mañana mañana 😀😀", 50);

for (const texto of [
  "",
  "banana",
  "mañana",
  "😀 banana",
  "texto nunca visto"
]) {
  const ids = bpe.encode(texto);
  const recuperado = bpe.decode(ids);

  console.assert(recuperado === texto, {
    texto,
    ids,
    recuperado
  });
}
```

Un texto no visto sigue siendo representable porque los 256 tokens base cubren cualquier secuencia de bytes. Tal vez use más tokens, pero no necesita un token desconocido.

## A.16. Otras propiedades para comprobar

```js
function validarModelo(bpe) {
  for (let indice = 0; indice < bpe.fusiones.length; indice += 1) {
    const regla = bpe.fusiones[indice];
    const idEsperado = 256 + indice;

    if (regla.id !== idEsperado) {
      throw new Error(`Id fuera de secuencia: ${regla.id}`);
    }

    if (regla.izquierda >= regla.id || regla.derecha >= regla.id) {
      throw new Error(`Referencia futura en token ${regla.id}`);
    }
  }
}
```

También:

- entrenar con texto vacío no crea reglas;
- ninguna fusión aumenta la longitud;
- una regla aprendida tiene frecuencia inicial al menos igual al mínimo;
- ids desconocidos se rechazan;
- entrenar de nuevo reinicia el modelo;
- mismo corpus, límites y desempate producen las mismas reglas.

## A.17. Guardar el modelo

```js
import { writeFile } from "node:fs/promises";

async function guardarModelo(ruta, bpe) {
  validarModelo(bpe);

  const datos = {
    version: 1,
    algoritmo: "bpe-didactico",
    base: "utf-8-bytes",
    fusiones: bpe.fusiones
  };

  await writeFile(
    ruta,
    `${JSON.stringify(datos, null, 2)}\n`,
    { encoding: "utf8", flag: "wx" }
  );
}
```

`version`, algoritmo y base evitan interpretar silenciosamente un modelo con convenciones diferentes.

## A.18. Cargar y validar

```js
import { readFile } from "node:fs/promises";

async function cargarModelo(ruta) {
  const datos = JSON.parse(await readFile(ruta, "utf8"));

  if (datos.version !== 1 ||
      datos.algoritmo !== "bpe-didactico" ||
      datos.base !== "utf-8-bytes" ||
      !Array.isArray(datos.fusiones)) {
    throw new TypeError("Modelo BPE incompatible");
  }

  const bpe = new BPE();
  bpe.fusiones = datos.fusiones.map((regla, indice) => {
    const id = 256 + indice;

    if (!regla ||
        regla.id !== id ||
        !Number.isSafeInteger(regla.izquierda) ||
        !Number.isSafeInteger(regla.derecha) ||
        regla.izquierda < 0 ||
        regla.derecha < 0 ||
        regla.izquierda >= id ||
        regla.derecha >= id) {
      throw new TypeError(`Regla inválida en la posición ${indice}`);
    }

    return {
      izquierda: regla.izquierda,
      derecha: regla.derecha,
      id
    };
  });

  validarModelo(bpe);
  return bpe;
}
```

No basta con comprobar que `fusiones` sea un array. Los archivos externos no son confiables y una referencia futura podría crear una expansión inválida.

## A.19. Medir la tokenización

```js
function estadisticas(bpe, texto) {
  const bytes = new TextEncoder().encode(texto).length;
  const tokens = bpe.encode(texto).length;

  return {
    bytes,
    tokens,
    bytesPorToken: tokens === 0 ? 0 : bytes / tokens
  };
}
```

Más bytes por token indica una secuencia más corta para ese texto, pero no es una métrica completa de calidad. También importan tamaño del vocabulario, distribución, idioma, preprocesamiento y costo del modelo.

Compará corpus:

- repetitivo;
- prosa natural;
- código fuente;
- texto con emoji;
- texto de un dominio diferente al entrenamiento.

## A.20. Complejidad de la versión didáctica

En cada fusión:

1. se recorre la secuencia para contar;
2. se recorre el mapa para elegir;
3. se recorre la secuencia para fusionar.

Con muchas fusiones y un corpus grande, repetir estos recorridos es costoso. `encode` también recorre el texto una vez por regla, incluso si una regla no aparece.

Tokenizadores de producción usan índices, estructuras de prioridad, pretokenización y algoritmos especializados. La versión didáctica privilegia que cada paso sea visible y verificable.

## A.21. Decisiones simplificadas

Este apéndice omite o fija:

- normalización Unicode;
- tratamiento especial de espacios;
- división inicial en palabras o fragmentos;
- tokens reservados;
- límites de vocabulario basados en frecuencia y tamaño;
- entrenamiento sobre varios documentos sin permitir fusiones entre límites;
- desempates compatibles con modelos externos;
- codificación optimizada;
- procesamiento distribuido;
- límites ante archivos o modelos hostiles.

Cada decisión cambia los tokens. Dos implementaciones llamadas BPE no son necesariamente compatibles.

## A.22. Separar documentos

Concatenar corpus permite que un par cruce el final de un documento y el inicio del siguiente. Si eso no tiene significado, se necesita una frontera que no pueda fusionarse o contar pares documento por documento.

Una estrategia didáctica:

```js
function contarParesEnDocumentos(documentos) {
  const total = new Map();

  for (const ids of documentos) {
    for (const [clave, cantidad] of contarPares(ids)) {
      total.set(clave, (total.get(clave) ?? 0) + cantidad);
    }
  }

  return total;
}
```

Después de elegir una regla, se fusiona dentro de cada documento por separado.

## A.23. Tokens especiales

Un sistema puede reservar ids para comienzo, fin, relleno o separación. No deben confundirse con bytes ni generarse accidentalmente mediante fusiones.

Una organización posible:

```text
0..255       bytes
256..N       fusiones
N+1...       especiales registrados en el modelo
```

Otra reserva ids especiales antes de las fusiones. Lo importante es que el formato documente rangos y que codificador y decodificador compartan la convención.

## A.24. Experimentos productivos

1. Mostrá en cada paso el par, su representación en bytes y la reducción lograda.
2. Cambiá el criterio de desempate y compará modelos.
3. Entrená con `banana banana` y dibujá el árbol de cada token compuesto.
4. Compará NFC y NFD para palabras con acentos.
5. Evitá fusiones entre documentos.
6. Agregá tokens especiales sin colisionar ids.
7. Precalculá bytes por token al cargar.
8. Limitá profundidad y tamaño durante la validación de modelos externos.
9. Escribí pruebas generativas de ida y vuelta con strings aleatorios.
10. Medí dónde se consume el tiempo antes de optimizar.

## A.25. Modelo mental final

```text
ENTRENAR
texto
→ bytes
→ contar pares
→ elegir par
→ crear token
→ fusionar
→ repetir
→ guardar reglas ordenadas

CODIFICAR
texto
→ bytes
→ aplicar reglas en orden
→ ids

DECODIFICAR
ids
→ expandir tokens hasta bytes
→ decodificar UTF-8
→ texto
```

## Para recordar

- Los bytes ofrecen cobertura universal; las fusiones aprenden unidades frecuentes.
- Una regla crea un token a partir de dos tokens anteriores.
- El orden y el desempate son parte del modelo.
- La expansión recursiva termina gracias al orden de ids y referencias.
- `decode(encode(texto)) === texto` es la propiedad central, pero no la única validación necesaria.
- Comprender primero la versión simple permite reconocer qué optimizan y qué convenciones agregan los tokenizadores reales.
