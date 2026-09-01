# 19. Gestión de archivos con Node.js

## Idea central

**Una operación de archivos atraviesa cuatro capas: una ruta identifica el recurso, el sistema entrega bytes, una codificación puede convertirlos en texto y un formato puede transformar ese texto o esos bytes en datos.** Un programa productivo controla cada capa, evita sobrescrituras y eliminaciones accidentales, y elige entre lectura completa, manejadores o streams según el tamaño y la concurrencia.

```text
ruta → archivo → bytes → codificación → texto → formato → datos
```

Confundir capas produce errores como interpretar un PDF con `readFile(..., "utf8")`, asumir que `.json` garantiza JSON válido o creer que una ruta relativa parte del archivo JavaScript.

## Archivo, directorio, ruta y metadatos

- **Archivo:** secuencia de bytes con metadatos.
- **Directorio:** estructura que asocia nombres con entradas del sistema.
- **Ruta:** expresión que permite localizar una entrada.
- **Metadatos:** tamaño, tipo, permisos, fechas y otra información del sistema.

La extensión es parte del nombre. Ayuda a inferir un formato, pero no transforma ni valida el contenido.

```text
datos.json puede contener texto inválido
imagen.jpg puede no ser JPEG
informe.txt puede contener cualquier secuencia de bytes
```

## Node.js como intermediario

El lenguaje JavaScript no define acceso general al disco. Node.js aporta módulos como:

```js
import { readFile } from "node:fs/promises";
import path from "node:path";
```

El navegador restringe el sistema de archivos y ofrece APIs diferentes por seguridad.

## Tres estilos de API

### Promesas

```js
import { readFile } from "node:fs/promises";

const texto = await readFile("datos.txt", "utf8");
```

Es el estilo principal de este capítulo: no bloquea el hilo mientras espera y se integra con `async`/`await`.

### Callbacks

```js
import { readFile } from "node:fs";

readFile("datos.txt", "utf8", (error, texto) => {
  if (error) {
    console.error(error);
    return;
  }

  console.log(texto);
});
```

Sigue presente en APIs y código histórico.

### Sincrónico

```js
import { readFileSync } from "node:fs";

const texto = readFileSync("datos.txt", "utf8");
```

Bloquea el hilo hasta terminar. Puede ser razonable en un script corto, durante el arranque o antes de aceptar trabajo concurrente. En un servidor puede detener todas las solicitudes mientras el disco responde.

## Preparar un módulo ejecutable

Podés usar un archivo `.mjs`:

```bash
node programa.mjs
```

O un proyecto con `package.json`:

```json
{
  "type": "module"
}
```

Entonces los archivos `.js` usan `import`. Los proyectos CommonJS utilizan `require`; no mezcles formatos sin comprender cómo los carga Node.js.

## Rutas relativas y directorio de trabajo

```js
await readFile("datos/entrada.txt", "utf8");
```

La ruta se interpreta desde `process.cwd()`, el directorio de trabajo del proceso:

```js
console.log(process.cwd());
```

No necesariamente coincide con la carpeta del módulo. Puede cambiar según desde dónde se ejecute:

```bash
node herramientas/procesar.mjs
```

## Ruta relativa al módulo

```js
import path from "node:path";
import { fileURLToPath } from "node:url";

const archivoActual = fileURLToPath(import.meta.url);
const directorioActual = path.dirname(archivoActual);
const rutaDatos = path.join(directorioActual, "datos", "entrada.txt");
```

Elegí la base según el contrato:

- `process.cwd()` para una herramienta que trabaja sobre el proyecto invocado;
- `import.meta.url` para recursos ubicados junto al módulo;
- una ruta recibida explícitamente para mayor control y prueba.

## Construir rutas con `node:path`

```js
path.join("datos", "2026", "alumnos.json");
path.resolve("datos", "entrada.txt");
path.dirname(ruta);
path.basename(ruta);
path.extname(ruta);
path.parse(ruta);
path.format({ dir: "/tmp", name: "informe", ext: ".txt" });
```

`join` combina segmentos y normaliza. `resolve` construye una ruta absoluta procesando de derecha a izquierda hasta encontrar una base absoluta o usar el directorio de trabajo.

No concatenes separadores manualmente:

```js
// const ruta = carpeta + "/" + archivo;
const ruta = path.join(carpeta, archivo);
```

## Diferencias entre sistemas

Windows y sistemas tipo Unix difieren en:

- separadores (`\` frente a `/`);
- raíces y letras de unidad;
- sensibilidad habitual a mayúsculas;
- caracteres permitidos;
- permisos y enlaces;
- convenciones de fin de línea.

`path` usa las reglas de la plataforma actual. `path.posix` y `path.win32` permiten manipular expresiones de una plataforma específica cuando se procesa un formato externo.

No cambies mayúsculas ni reemplaces caracteres de una ruta sin conocer el sistema y el contrato.

## Crear directorios

```js
import { mkdir } from "node:fs/promises";

await mkdir("salidas", { recursive: true });
```

Con `recursive`, crea padres faltantes y no falla si el directorio ya existe. Sin esa opción, un padre ausente produce error y una entrada existente puede producir `EEXIST`.

## Escribir texto

```js
import { writeFile } from "node:fs/promises";

await writeFile("salida.txt", "Hola\n", "utf8");
```

Por defecto, `writeFile` crea o reemplaza. Si sobrescribir es peligroso, pedilo de forma explícita:

```js
await writeFile("salida.txt", "Hola\n", {
  encoding: "utf8",
  flag: "wx"
});
```

`wx` crea de manera exclusiva y falla con `EEXIST` si ya existe. Evita la carrera de “comprobar y luego crear”.

Crear un archivo vacío:

```js
await writeFile("vacio.txt", "", { flag: "wx" });
```

## Agregar sin borrar

```js
import { appendFile } from "node:fs/promises";

await appendFile("eventos.log", "inicio\n", "utf8");
```

Varias operaciones concurrentes sobre el mismo archivo no forman automáticamente una transacción. Los límites de atomicidad dependen del sistema, el tamaño y el modo de apertura. Si el orden es esencial, serializá escrituras o utilizá un almacenamiento diseñado para concurrencia.

## Bytes, `Buffer` y texto

Sin codificación, `readFile` devuelve un `Buffer`:

```js
const bytes = await readFile("imagen.png");

Buffer.isBuffer(bytes); // true
bytes.length;           // cantidad de bytes
```

Un `Buffer` es una vista de bytes de Node.js. Puede convertirse:

```js
const texto = bytes.toString("utf8");
const buffer = Buffer.from("mañana", "utf8");
```

Con codificación en `readFile`, Node.js devuelve string:

```js
const texto = await readFile("datos.txt", "utf8");
```

## Unicode no es UTF-8

Unicode asigna puntos de código. UTF-8 define cómo codificarlos en bytes. JavaScript representa strings internamente mediante UTF-16.

```js
const texto = "😀";

texto.length;                     // 2 unidades UTF-16
Buffer.byteLength(texto, "utf8"); // 4 bytes UTF-8
[...texto].length;                // 1 punto de código
```

No supongas un byte por carácter ni que `string.length` mide almacenamiento.

## Codificación incorrecta

Si bytes UTF-8 se decodifican como otra codificación, aparecen caracteres corruptos. No existe una detección universal infalible; varias codificaciones pueden interpretar cualquier byte y producir texto aparentemente válido.

El origen debe declarar el contrato. Para decodificación UTF-8 estricta:

```js
const decodificador = new TextDecoder("utf-8", { fatal: true });
const texto = decodificador.decode(bytes);
```

Con `fatal`, una secuencia inválida lanza en vez de insertar el carácter de reemplazo.

## BOM

Algunos archivos comienzan con una marca de orden de bytes. UTF-8 no la necesita, pero puede incluir `EF BB BF`. Algunas herramientas la eliminan o interpretan; otras la conservan como `U+FEFF` al inicio.

Si el primer encabezado de un CSV o JSON parece tener un carácter invisible, inspeccioná el BOM. No elimines automáticamente cualquier `U+FEFF` interior, porque puede formar parte real del contenido.

## Fines de línea

Convenciones comunes:

```text
Unix/macOS moderno: \n
Windows:             \r\n
```

Para dividir líneas de ambos:

```js
const lineas = texto.split(/\r?\n/u);
```

Eso puede dejar una última línea vacía si el archivo termina con salto. Decidí si representa contenido o solo terminación.

Para escribir con la convención de la plataforma:

```js
import os from "node:os";

const contenido = lineas.join(os.EOL);
```

En repositorios, suele acordarse `\n` independientemente del sistema para reducir diferencias.

## Leer y transformar un archivo pequeño

```js
async function numerarLineas(origen, destino) {
  const texto = await readFile(origen, "utf8");

  const numerado = texto
    .split(/\r?\n/u)
    .map((linea, indice) => `${indice + 1}: ${linea}`)
    .join("\n");

  await writeFile(destino, numerado, {
    encoding: "utf8",
    flag: "wx"
  });
}
```

Es simple y correcto cuando el contenido completo cabe cómodamente en memoria.

## Escritura más segura mediante archivo temporal

Reemplazar un archivo crítico directamente puede dejarlo incompleto si el proceso falla durante la escritura. Un patrón común:

1. escribir un temporal en el mismo directorio;
2. cerrar y, si el nivel de garantía lo exige, sincronizar;
3. renombrar el temporal sobre el destino.

```js
import { rename } from "node:fs/promises";

async function escribirReemplazo(ruta, contenido) {
  const temporal = `${ruta}.tmp-${process.pid}`;

  await writeFile(temporal, contenido, {
    encoding: "utf8",
    flag: "wx"
  });

  await rename(temporal, ruta);
}
```

La atomicidad y reemplazo de `rename` dependen del sistema; debe ocurrir en el mismo volumen. Una implementación robusta también limpia temporales, evita colisiones y considera permisos y sincronización.

## Listar un directorio

```js
import { readdir } from "node:fs/promises";

const nombres = await readdir("datos");
```

Con tipos:

```js
const entradas = await readdir("datos", { withFileTypes: true });

for (const entrada of entradas) {
  if (entrada.isFile()) console.log("archivo", entrada.name);
  if (entrada.isDirectory()) console.log("directorio", entrada.name);
  if (entrada.isSymbolicLink()) console.log("enlace", entrada.name);
}
```

Un `Dirent` evita consultar `stat` para la clasificación básica de cada entrada.

## Metadatos con `stat` y `lstat`

```js
import { stat, lstat } from "node:fs/promises";

const info = await stat(ruta);

info.isFile();
info.isDirectory();
info.size;
info.mtime;
```

`stat` sigue un enlace simbólico; `lstat` informa sobre el enlace mismo. Esta diferencia es importante al recorrer o eliminar árboles, porque seguir enlaces puede salir del directorio esperado o crear ciclos.

Los metadatos pueden cambiar inmediatamente después de consultarlos. No los trates como una garantía permanente.

## Comprobar existencia sin crear una carrera

Esto tiene una ventana:

```text
comprobar → otro proceso cambia el archivo → operar
```

Intentá la operación y manejá el código esperado:

```js
async function leerOpcional(ruta) {
  try {
    return await readFile(ruta, "utf8");
  } catch (error) {
    if (error.code === "ENOENT") return null;
    throw error;
  }
}
```

`access` existe, pero suele servir para diagnósticos o comprobaciones informativas, no para autorizar una operación posterior.

## Códigos de error frecuentes

- `ENOENT`: ruta inexistente;
- `EACCES` o `EPERM`: permiso insuficiente;
- `EEXIST`: ya existe;
- `EISDIR`: se esperaba archivo y era directorio;
- `ENOTDIR`: un segmento no era directorio;
- `ENOTEMPTY`: directorio no vacío;
- `EXDEV`: movimiento entre volúmenes no soportado por `rename`;
- `EMFILE`: demasiados descriptores abiertos.

```js
try {
  await operacion();
} catch (error) {
  if (error.code === "ENOENT") {
    // recuperación específica
  } else {
    throw error;
  }
}
```

No dependas solo del mensaje, que cambia entre plataformas.

## Recorrer directorios recursivamente

```js
async function* recorrer(directorio) {
  const entradas = await readdir(directorio, { withFileTypes: true });

  for (const entrada of entradas) {
    const ruta = path.join(directorio, entrada.name);

    if (entrada.isDirectory()) {
      yield* recorrer(ruta);
    } else if (entrada.isFile()) {
      yield ruta;
    }
  }
}
```

El generador produce a medida que recorre. La política ignora enlaces simbólicos; hay que decidir deliberadamente si seguirlos, detectar ciclos y limitar profundidad.

## Buscar por nombre o extensión

```js
async function buscarMarkdown(raiz) {
  const resultados = [];

  for await (const ruta of recorrer(raiz)) {
    if (path.extname(ruta).toLowerCase() === ".md") {
      resultados.push(ruta);
    }
  }

  return resultados;
}
```

La extensión no valida el contenido, pero puede filtrar candidatos. Para patrones complejos se usan globbers con reglas claras sobre separadores, archivos ocultos y enlaces.

## Buscar texto en archivos pequeños

```js
async function buscarTexto(ruta, patron) {
  const texto = await readFile(ruta, "utf8");

  return texto
    .split(/\r?\n/u)
    .flatMap((linea, indice) =>
      patron.test(linea)
        ? [{ numero: indice + 1, linea }]
        : []
    );
}
```

Si `patron` tiene flag `g`, `test` conserva `lastIndex` y puede alternar resultados. Para comprobar cada línea, eliminá `g`, cloná el patrón apropiadamente o reiniciá su estado.

## Leer archivos grandes por líneas

```js
import { createReadStream } from "node:fs";
import { createInterface } from "node:readline";

async function contarCoincidencias(ruta, patron) {
  const entrada = createReadStream(ruta, { encoding: "utf8" });
  const lineas = createInterface({
    input: entrada,
    crlfDelay: Infinity
  });

  let cantidad = 0;

  for await (const linea of lineas) {
    if (patron.test(linea)) cantidad += 1;
  }

  return cantidad;
}
```

`readline` conserva fragmentos hasta completar una línea y entiende `\r\n` con `crlfDelay: Infinity`.

## Un fragmento de stream no es una línea

Un stream entrega chunks según buffers y disponibilidad, no según límites semánticos:

```text
chunk 1: "primera\nsegu"
chunk 2: "nda\ntercera"
```

Tampoco debe dividirse un carácter UTF-8 manualmente sin un decodificador que conserve bytes incompletos. APIs de texto del stream y `readline` resuelven parte de ese trabajo.

## Copiar con streams y `pipeline`

```js
import { createReadStream, createWriteStream } from "node:fs";
import { pipeline } from "node:stream/promises";

await pipeline(
  createReadStream(origen),
  createWriteStream(destino, { flags: "wx" })
);
```

`pipeline` propaga errores y coordina cierre y contrapresión. Es preferible a conectar eventos manualmente para un flujo lineal.

La **contrapresión** evita que el productor lea mucho más rápido de lo que el consumidor puede escribir o procesar.

## Manejadores de archivo

```js
import { open } from "node:fs/promises";

const archivo = await open(ruta, "r");

try {
  const buffer = Buffer.alloc(100);
  const { bytesRead } = await archivo.read(buffer, 0, 100, 0);
  usar(buffer.subarray(0, bytesRead));
} finally {
  await archivo.close();
}
```

Un `FileHandle` permite lecturas parciales, posiciones explícitas, sincronización y varias operaciones sobre la misma apertura. Siempre debe cerrarse, incluso ante error.

Modos comunes:

- `r`: lectura; debe existir;
- `r+`: lectura y escritura; debe existir;
- `w`: escritura; crea o trunca;
- `wx`: escritura exclusiva;
- `a`: agregar; crea si falta;
- `ax`: agregar de forma exclusiva.

Elegir el modo equivocado puede borrar contenido.

## JSON: sintaxis y estructura

```js
async function leerJson(ruta) {
  const texto = await readFile(ruta, "utf8");
  const datos = JSON.parse(texto);

  if (!datos || typeof datos !== "object" || Array.isArray(datos)) {
    throw new TypeError("Se esperaba un objeto JSON");
  }

  return datos;
}
```

`JSON.parse` comprueba sintaxis. La aplicación debe validar propiedades, tipos, rangos y relaciones.

Escribir:

```js
await writeFile(
  ruta,
  `${JSON.stringify(datos, null, 2)}\n`,
  { encoding: "utf8", flag: "wx" }
);
```

JSON no admite comentarios, comas finales, `undefined`, símbolos, `bigint`, `Map`, `Set` ni referencias cíclicas sin una representación personalizada.

## CSV no es simplemente `split(",")`

Una línea puede contener:

```text
123,"Pérez, Ana","texto con ""comillas"""
```

El formato real permite separadores dentro de comillas, comillas escapadas y a veces saltos dentro de un campo. Usá una biblioteca CSV probada y configurá:

- delimitador;
- codificación;
- encabezados;
- política de filas mal formadas;
- conversión y validación por columna.

Para un formato didáctico deliberadamente simple, documentá que no acepta comillas ni separadores internos.

## Extraer datos de un log

```js
const patron = /^(?<fecha>\S+)\s+(?<nivel>INFO|WARN|ERROR)\s+(?<mensaje>.*)$/u;

function interpretarLinea(linea) {
  const match = linea.match(patron);
  if (!match) return { ok: false, linea };

  return {
    ok: true,
    ...match.groups
  };
}
```

Un parser de línea puede devolver éxitos y errores como datos para que una fila inválida no detenga todo el lote. Los fallos de lectura siguen siendo excepciones de la operación.

## Formatos binarios

PDF, DOCX, imágenes y audio no deben convertirse enteros a UTF-8. Se leen como bytes y se procesan con bibliotecas que entienden su formato.

```js
const contenido = await readFile("informe.pdf");
```

Una firma inicial puede ayudar a detectar un candidato, pero validar un formato completo requiere interpretar su estructura.

## Copiar

```js
import { copyFile, cp } from "node:fs/promises";
import { constants } from "node:fs";

await copyFile(origen, destino);
await copyFile(origen, destino, constants.COPYFILE_EXCL);

await cp(origenDir, destinoDir, {
  recursive: true,
  errorOnExist: true,
  force: false
});
```

Definí si se reemplaza, si se siguen enlaces, qué metadatos se preservan y qué ocurre ante un fallo parcial.

## Renombrar y mover

```js
import { rename } from "node:fs/promises";

await rename(origen, destino);
```

Dentro del mismo sistema de archivos suele ser una operación atómica sobre el nombre. Entre volúmenes puede fallar con `EXDEV`; una estrategia de copiar y eliminar debe contemplar que la copia termine y sea verificable antes de borrar el origen.

## Eliminar

```js
import { unlink, rmdir, rm } from "node:fs/promises";

await unlink(rutaArchivo);
await rmdir(directorioVacio);
await rm(arbol, { recursive: true });
```

La eliminación recursiva es peligrosa. Antes de usarla:

1. resolvé una ruta absoluta;
2. verificá que esté dentro de una raíz permitida;
3. rechazá raíz, carpeta de trabajo y destinos demasiado amplios;
4. ofrecé simulación o papelera cuando sea una herramienta de usuario;
5. registrá exactamente qué se eliminará;
6. tratá enlaces según una política explícita.

No dependas de una variable vacía, glob o concatenación para identificar un destino destructivo.

## Impedir que una ruta escape

```js
function resolverDentroDe(base, entrada) {
  const raiz = path.resolve(base);
  const candidata = path.resolve(raiz, entrada);
  const relativa = path.relative(raiz, candidata);

  if (relativa === "" ||
      relativa.startsWith(`..${path.sep}`) ||
      relativa === ".." ||
      path.isAbsolute(relativa)) {
    throw new Error("Ruta fuera del directorio permitido");
  }

  return candidata;
}
```

La condición `relativa === ""` rechaza la propia raíz si la operación no debe apuntarle. Ajustala si leer la raíz es válido.

Esta comprobación textual no resuelve por sí sola enlaces simbólicos, cambios concurrentes ni diferencias de mayúsculas del sistema. Para entradas hostiles se necesitan controles adicionales y privilegios mínimos.

## Concurrencia y límites

Procesar miles de archivos con `Promise.all` los abre casi simultáneamente y puede producir `EMFILE`:

```js
await Promise.all(rutas.map(procesar));
```

La alternativa secuencial es segura pero puede ser lenta:

```js
for (const ruta of rutas) {
  await procesar(ruta);
}
```

Un pool con concurrencia limitada equilibra recursos y rendimiento. El límite adecuado depende de disco, red, tamaño y operación.

No ejecutes escrituras concurrentes sobre el mismo destino sin coordinación. El orden de finalización puede diferir del orden de inicio.

## Programa integrador: analizar una carpeta

```js
async function analizarCarpeta(raiz) {
  const resumen = {
    archivos: 0,
    bytes: 0,
    lineas: 0,
    errores: []
  };

  for await (const ruta of recorrer(raiz)) {
    try {
      const info = await stat(ruta);
      resumen.archivos += 1;
      resumen.bytes += info.size;

      if (path.extname(ruta).toLowerCase() === ".txt") {
        const texto = await readFile(ruta, "utf8");
        resumen.lineas += texto === ""
          ? 0
          : texto.split(/\r?\n/u).length;
      }
    } catch (error) {
      resumen.errores.push({
        ruta,
        codigo: error.code ?? "DESCONOCIDO",
        mensaje: error.message
      });
    }
  }

  return resumen;
}
```

Esta primera versión prioriza claridad. Para producción habría que decidir tamaño máximo para lectura completa, seguimiento de enlaces, concurrencia, cancelación y política ante errores.

## Criterios para elegir una técnica

| Necesidad | Técnica inicial |
|---|---|
| archivo pequeño completo | `readFile` |
| texto grande por líneas | `createReadStream` + `readline` |
| copiar flujo | `pipeline` |
| leer posiciones específicas | `FileHandle` |
| script corto de arranque | API síncrona, si bloquear es aceptable |
| muchas rutas | iterador y concurrencia limitada |
| crear sin reemplazar | flag exclusivo `x` |
| reemplazar dato crítico | temporal + `rename`, con garantías documentadas |

## Errores frecuentes

- creer que extensión y formato son lo mismo;
- asumir que una ruta relativa parte del módulo;
- concatenar separadores manualmente;
- omitir codificación y esperar string;
- suponer un byte por carácter;
- sobrescribir con `writeFile` sin intención;
- comprobar existencia y luego actuar como si nada pudiera cambiar;
- leer archivos gigantes completos;
- creer que un chunk es una línea;
- dividir cualquier CSV por comas;
- seguir enlaces sin política;
- lanzar concurrencia sin límite;
- capturar y silenciar todos los códigos;
- eliminar recursivamente una ruta no validada.

## Práctica guiada

Construí una herramienta de análisis de apuntes que:

1. reciba una raíz explícita;
2. recorra subdirectorios sin seguir enlaces;
3. procese solo `.md` menores de un límite con `readFile` y mayores por líneas;
4. cuente archivos, bytes, líneas, palabras y encabezados;
5. limite concurrencia;
6. produzca JSON mediante un temporal y reemplazo controlado;
7. tenga modo `--no-clobber`;
8. distinga errores por código sin detener todo el recorrido;
9. rechace cualquier salida fuera de la raíz autorizada.

## Para recordar

- Ruta, bytes, codificación y formato son capas separadas.
- La ruta relativa depende del directorio de trabajo; los recursos del módulo requieren otra base.
- `readFile` simplifica archivos pequeños; streams y manejadores controlan tamaño y acceso parcial.
- Los flags de apertura expresan si crear, truncar, agregar o exigir exclusividad.
- Seguridad y corrección exigen validar rutas, limitar concurrencia y tratar sobrescritura y eliminación como decisiones explícitas.
