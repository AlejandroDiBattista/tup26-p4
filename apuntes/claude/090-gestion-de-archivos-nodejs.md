# Gestión de archivos en Node.js

Tutorial desde primeros principios: qué es un archivo, cómo lo lee y escribe un programa, cómo se codifica el texto y cómo buscar, copiar, renombrar, listar y extraer información.

El mismo código corre en Windows, macOS y Linux. Node esconde casi todas las diferencias, pero no todas. Cuando queda una diferencia real, aparece marcada como nota entre sistemas.

Los ejemplos necesitan Node 22 o superior y módulos ES: archivos `.mjs`, o `"type": "module"` en el `package.json`.

---

## Parte 1: qué es un archivo

### Un archivo es una secuencia de bytes

Un archivo es eso y nada más: una tira de bytes numerados desde 0. El sistema operativo no sabe si son un poema, una foto o un programa. Solo sabe cuántos bytes hay y dónde están.

Esto vale igual en los tres sistemas. Todo lo demás que asociamos con un archivo vive afuera del archivo:

- el nombre vive en la carpeta que lo contiene
- el tamaño, las fechas y los permisos viven en un registro de metadatos aparte
- el tipo no existe para el sistema: la extensión es una convención

Cada sistema le pone otro nombre a ese registro de metadatos. Linux y macOS lo llaman inodo. NTFS, el sistema de archivos de Windows, lo llama entrada de la tabla maestra de archivos. La idea es la misma en los tres: contenido por un lado, ficha de datos por otro.

### Una carpeta es una tabla de nombres

Una carpeta también es un archivo, pero con contenido reglamentado: una tabla que asocia nombres con registros de metadatos.

```
carpeta
  "apunte.txt"  →  registro 4021
  "foto.png"    →  registro 4022
  "sub"         →  registro 4023 (que es otra carpeta)
```

De acá salen tres conclusiones que después explican el comportamiento de las funciones de Node:

- renombrar es barato: cambiás una fila de la tabla, no movés bytes
- un mismo contenido puede tener varios nombres, llamados enlaces duros, que existen en los tres sistemas
- borrar un nombre no borra los bytes mientras quede otro nombre apuntando al mismo registro

### Primera diferencia entre sistemas: archivos abiertos

Qué pasa si borrás un archivo que otro programa tiene abierto:

- en Linux y macOS el nombre desaparece de la tabla, pero los bytes siguen vivos hasta que el último programa cierre el archivo
- en Windows la operación falla, con el código `EBUSY` o `EPERM`, porque el sistema bloquea el archivo mientras está abierto

Esto también afecta a renombrar y a mover. Es la causa número uno de scripts que andan en la notebook del docente con macOS y fallan en la máquina del alumno con Windows. La regla práctica: cerrá siempre lo que abrís, con `finally`.

### La extensión es una convención, casi

Para leer y escribir, la extensión no significa nada: podés guardar una imagen en `notas.txt` y Node la escribe sin quejarse.

Nota entre sistemas: lo que hace ejecutable a un archivo cambia. En Linux y macOS es un permiso del registro de metadatos. En Windows lo decide la extensión: `.exe`, `.bat`, `.ps1`. Por eso en Windows la extensión pesa más que en el resto.

### No existe el archivo de texto

Un archivo de texto es un archivo binario cuyos bytes decidimos interpretar como caracteres, con una tabla de conversión que llamamos codificación. Si te equivocás de tabla, leés otra cosa. Lo vemos en la parte 4.

---

## Parte 2: nombres y rutas

Acá nace la mayoría de los errores que aparecen solo en un sistema. Conviene verlo antes de escribir código.

### Mayúsculas y minúsculas

- Linux distingue: `Datos.txt` y `datos.txt` son dos archivos distintos
- Windows no distingue, pero conserva lo que escribiste
- macOS, con el formato APFS de fábrica, tampoco distingue, aunque se puede formatear un disco para que sí

El síntoma típico: un proyecto anda en tu máquina y falla al subirlo a un servidor Linux, porque el código pide `Config.json` y el archivo se llama `config.json`.

La regla: escribí el nombre siempre igual y nunca uses las mayúsculas para diferenciar dos archivos.

### Caracteres que no podés usar

- Windows prohíbe `< > : " / \ | ? *` y los caracteres de control, no admite nombres terminados en punto o en espacio, y reserva palabras completas como `CON`, `PRN`, `AUX`, `NUL`, `COM1` a `COM9` y `LPT1` a `LPT9`
- Linux y macOS solo prohíben la barra `/` y el byte nulo

Si generás nombres a partir de datos, y muchas veces vas a hacerlo, limpialos con el criterio más estricto de los tres:

```js
const RESERVADOS = /^(con|prn|aux|nul|com[1-9]|lpt[1-9])(\..*)?$/i;

export function nombreSeguro(nombre) {
  let limpio = nombre
    .replace(/[<>:"/\\|?*\u0000-\u001f]/g, '_')   // prohibidos en Windows
    .replace(/[. ]+$/, '');                       // punto o espacio final
  if (RESERVADOS.test(limpio)) limpio = `_${limpio}`;
  return limpio.slice(0, 120) || '_';
}

nombreSeguro('reporte 12/03/2026: ventas');   // 'reporte 12_03_2026_ ventas'
```

Un ejemplo típico: una fecha con barras en el nombre del archivo crea carpetas sin querer en Linux y falla en Windows.

### Largo máximo

- Windows corta en 260 caracteres la ruta completa, salvo que el sistema tenga activadas las rutas largas
- Linux permite 255 bytes por nombre y unos 4096 por ruta
- macOS permite 255 caracteres por nombre

La regla: no anides carpetas muy profundas ni armes nombres larguísimos. Un límite propio de 120 caracteres por nombre te deja tranquilo en los tres.

### Acentos y normalización

Unicode permite escribir `é` de dos formas: como un carácter único, llamado forma NFC, o como una `e` seguida de una tilde combinante, llamada forma NFD.

```js
const nfc = 'José'.normalize('NFC');
const nfd = 'José'.normalize('NFD');
console.log(nfc === nfd);            // false
console.log(nfc.length, nfd.length); // 4 5
```

Se ven idénticos en pantalla y son strings distintos. macOS históricamente guarda los nombres en NFD, así que un nombre leído con `readdir` puede no coincidir con el mismo nombre escrito a mano en tu código.

La regla: normalizá los dos lados antes de comparar.

```js
const igual = (a, b) => a.normalize('NFC') === b.normalize('NFC');
```

### Archivos ocultos

En Linux y macOS un archivo está oculto si su nombre empieza con punto. En Windows es un atributo del registro de metadatos, que Node no expone. Si filtrás ocultos, filtrá por el punto inicial y asumí que en Windows el filtro es aproximado.

---

## Parte 3: rutas con el módulo path

Las rutas son texto, y ahí siguen los errores. Usá siempre el módulo `path` en lugar de concatenar con `+`.

```js
import path from 'node:path';

path.join('datos', 'sub', 'b.txt');   // 'datos/sub/b.txt' o 'datos\sub\b.txt'
path.resolve('datos', 'a.txt');       // ruta absoluta desde el directorio actual
path.basename('/tmp/a.txt');          // 'a.txt'
path.basename('/tmp/a.txt', '.txt');  // 'a'
path.extname('a.txt');                // '.txt'
path.dirname('datos/a.txt');          // 'datos'
path.parse('C:\\Users\\ale\\a.txt');  // { root, dir, base, ext, name }
```

`path` decide solo el separador correcto según dónde corra el programa. Esa es toda la portabilidad que necesitás en el 90% de los casos.

### Qué significa absoluta en cada sistema

- en Linux y macOS una ruta absoluta empieza con `/`, y hay una sola raíz
- en Windows empieza con una letra de unidad, `C:\`, y cada unidad tiene su raíz
- Windows también admite rutas de red, llamadas UNC, con la forma `\\servidor\recurso\archivo.txt`

Por eso en Windows existen rutas raras que en el resto no: `C:archivo.txt` es relativa al directorio actual de la unidad C.

### Probar rutas de otro sistema

`path` trae dos versiones completas, y podés usarlas desde cualquier máquina. Sirven para las pruebas y para mostrar en clase cómo se ve la otra plataforma:

```js
import path from 'node:path';

path.win32.join('datos', 'sub', 'b.txt');   // 'datos\sub\b.txt'
path.posix.join('datos', 'sub', 'b.txt');   // 'datos/sub/b.txt'
path.win32.sep;                             // '\'
path.posix.sep;                             // '/'
```

Nunca uses `path.posix` para tocar el disco. Es para manipular texto de rutas que sabés que son de estilo Unix, como las de una URL o las de un archivo zip.

### Nunca escribas rutas fijas

Cambialas por funciones que devuelven lo correcto en cada sistema:

| En vez de | Usá |
|---|---|
| `'/tmp'` | `os.tmpdir()` |
| `'/home/ale'` o `'C:\\Users\\ale'` | `os.homedir()` |
| `'carpeta/sub'` | `path.join('carpeta', 'sub')` |
| `ruta.split('/')` | `ruta.split(path.sep)` |
| `__dirname` en módulos ES | `import.meta.dirname` |

```js
import os from 'node:os';
import path from 'node:path';

const temporal = path.join(os.tmpdir(), 'mi-app', 'cache.json');
const plantilla = path.join(import.meta.dirname, 'plantillas', 'factura.html');
```

Una ruta relativa se resuelve contra la carpeta desde donde ejecutaste el programa, no contra el archivo donde está el código. `import.meta.dirname` te da la carpeta del módulo actual y viaja bien entre sistemas.

### Rutas y URLs

Una URL de tipo `file:` siempre usa barras hacia adelante, aun en Windows. Convertí en lugar de recortar texto:

```js
import { fileURLToPath, pathToFileURL } from 'node:url';

const ruta = fileURLToPath(import.meta.url);       // ruta del sistema
const url = pathToFileURL('C:\\datos\\a.txt');     // file:///C:/datos/a.txt
```

### Rutas seguras

Si la ruta viene del usuario, `..` te saca de la carpeta permitida. Validá el resultado, no la entrada:

```js
import path from 'node:path';

export function rutaSegura(base, entradaDelUsuario) {
  const raiz = path.resolve(base);
  const destino = path.resolve(raiz, entradaDelUsuario);
  if (destino !== raiz && !destino.startsWith(raiz + path.sep)) {
    throw new Error('Ruta fuera de la carpeta permitida');
  }
  return destino;
}
```

Comparar con `path.sep` en vez de con `/` es lo que hace que la validación también sirva en Windows.

---

## Parte 4: cómo habla un programa con el disco

### Las cuatro operaciones básicas

Por debajo de cualquier lenguaje hay cuatro pedidos al sistema operativo: abrir, leer, escribir y cerrar. Cambian los nombres internos, no la idea. Linux y macOS los llaman `open`, `read`, `write` y `close`. Windows los llama `CreateFile`, `ReadFile`, `WriteFile` y `CloseHandle`.

Al abrir, el sistema te devuelve una referencia: un número entero en Linux y macOS, un identificador en Windows. Node envuelve las dos cosas en un mismo objeto y las llama descriptor.

El descriptor tiene un cursor de posición. Cada lectura o escritura lo adelanta. Podés moverlo si querés leer el medio de un archivo sin leer el principio.

Este ejemplo hace exactamente eso y no usa ningún atajo:

```js
import { open } from 'node:fs/promises';

const archivo = await open('datos/a.txt', 'r');   // abrir
try {
  const buffer = Buffer.alloc(4);                 // caja de 4 bytes vacía
  const { bytesRead } = await archivo.read(buffer, 0, 4, 5);
  //                                        ↑    ↑  ↑  ↑
  //                              dónde guardar  │  │  posición en el archivo
  //                                 desde qué offset │
  //                                       cuántos bytes leer
  console.log(bytesRead, buffer.toString('utf8'));
} finally {
  await archivo.close();                          // cerrar siempre
}
```

Si el archivo contiene `hola\nmundo\n`, la salida es `4 mund`. Empezó en el byte 5 y trajo 4 bytes.

Ese `finally` no es adorno. En Windows, mientras el descriptor esté abierto, nadie puede borrar ni renombrar el archivo.

Todo lo que sigue en este tutorial es azúcar sobre estas cuatro operaciones.

### Las tres APIs de fs

Node ofrece el mismo conjunto de funciones en tres presentaciones:

| Forma | Cómo se importa | Cuándo usarla |
|---|---|---|
| Promesas | `import { readFile } from 'node:fs/promises'` | siempre que puedas |
| Callbacks | `import { readFile } from 'node:fs'` | código viejo o APIs de streams |
| Sincrónica | `import { readFileSync } from 'node:fs'` | scripts cortos y arranque de un programa |

La versión sincrónica frena el único hilo de JavaScript hasta que el disco responde. En un script de línea de comandos no importa. En un servidor, una lectura sincrónica de 200 milisegundos deja a todos los clientes esperando.

Usá siempre el prefijo `node:` al importar. Deja claro que es un módulo del runtime y no un paquete de npm.

---

## Parte 5: bytes y texto

### Buffer, el arreglo de bytes de Node

`Buffer` es la representación de bytes crudos en Node. Es un arreglo de enteros de 0 a 255, y se comporta igual en los tres sistemas.

```js
const b = Buffer.from('ñandú', 'utf8');
console.log(b);              // <Buffer c3 b1 61 6e 64 c3 ba>
console.log(b.length);       // 7 bytes
console.log('ñandú'.length); // 5 caracteres
```

Si leés un archivo sin indicar codificación, Node te devuelve un `Buffer`. Si indicás una, te devuelve un string ya decodificado.

```js
import { readFile } from 'node:fs/promises';

const crudo = await readFile('datos/a.txt');           // Buffer
const texto = await readFile('datos/a.txt', 'utf8');   // string
```

### Las codificaciones que vas a encontrar

Una codificación es una tabla que asigna números a caracteres, más una regla para escribir esos números como bytes.

| Codificación | Bytes por carácter | Alcance |
|---|---|---|
| ASCII | 1 | 128 caracteres, sin acentos ni eñe |
| Latin-1 (ISO-8859-1, `latin1`) | 1 | 256 caracteres, alcanza para el español |
| Windows-1252 | 1 | Latin-1 más comillas y guiones tipográficos |
| UTF-8 | 1 a 4 | todo Unicode, compatible con ASCII |
| UTF-16 | 2 o 4 | todo Unicode, es el formato interno de los strings de JavaScript |

UTF-8 ganó porque los primeros 128 caracteres ocupan un byte y coinciden con ASCII. Un archivo en inglés pesa lo mismo que antes, y aun así podés escribir 中文 o 🙂.

Nota entre sistemas: macOS y Linux escriben UTF-8 de fábrica. Windows todavía arrastra Windows-1252 en varias herramientas, entre ellas Excel al exportar CSV. Por eso los archivos con `Ã±` casi siempre vienen de una máquina con Windows.

### Qué pasa si te equivocás de tabla

```js
const bytes = Buffer.from('ñ', 'utf8');   // <Buffer c3 b1>
console.log(bytes.toString('latin1'));    // Ã±
```

Eso es el mojibake: el texto ilegible que sale de leer bytes con la tabla equivocada. La palabra viene del japonés 文字化け y significa algo parecido a caracteres transformados.

Se reconoce por el patrón. Casi siempre aparece una `Ã` de más:

- `Ã±` donde iba `ñ`
- `Ã©` donde iba `é`
- `â€œ` donde iba una comilla tipográfica

El motivo es directo. En UTF-8 las letras acentuadas del español empiezan con el byte `C3`, y ese byte, leído como Latin-1, es la letra `Ã`. El segundo byte aporta el símbolo raro que sigue.

Los bytes están bien; la tabla de lectura está mal. Nunca lo arregles reemplazando texto: volvé a leer con la codificación correcta.

Node decodifica de forma nativa `utf8`, `utf16le`, `latin1`, `ascii`, `base64` y `hex`. Para el resto usá `TextDecoder`, que acepta todas las codificaciones estándar:

```js
import { readFile } from 'node:fs/promises';

const bytes = await readFile('datos/exportado.csv');
const texto = new TextDecoder('windows-1252').decode(bytes);
```

Guardá siempre en UTF-8. Es la única decisión que evita este problema para siempre.

### Longitud: bytes, unidades de código y caracteres

Tres números distintos para la misma cadena:

```js
const cara = '🙂';
console.log(cara.length);              // 2  unidades UTF-16
console.log([...cara].length);         // 1  carácter real
console.log(Buffer.byteLength(cara));  // 4  bytes en UTF-8
```

Si vas a cortar texto, recorrelo con el spread o con `Intl.Segmenter`. `slice` sobre índices puede partir un carácter al medio.

### El BOM

Algunas herramientas de Windows escriben tres bytes al principio del archivo, `EF BB BF`, para anunciar que viene UTF-8. Node no los saca solo, así que aparecen como un carácter invisible al principio del string y rompen el primer encabezado de tu CSV.

```js
function sinBOM(texto) {
  return texto.charCodeAt(0) === 0xfeff ? texto.slice(1) : texto;
}
```

Al revés, Excel en Windows suele necesitar ese BOM para abrir un CSV en UTF-8 sin romper los acentos. Si generás archivos para Excel, escribilo a propósito.

### Fin de línea

Es la diferencia entre sistemas más vieja y más molesta:

- Linux y macOS terminan la línea con un byte, `\n`
- Windows usa dos, `\r\n`

Si partís un texto con `split('\n')`, en Windows te queda un `\r` colgado al final de cada línea. La comparación `linea === 'ok'` falla y no se ve por qué.

```js
const lineas = texto.split(/\r?\n/);   // sirve en los tres sistemas
```

Para escribir tenés dos criterios válidos. Si el archivo lo lee una persona en su máquina, usá `os.EOL`, que devuelve el separador local. Si el archivo lo lee otro programa, usá siempre `\n`: los tres sistemas lo entienden.

Nota entre sistemas: Git también participa. Con `core.autocrlf` activado convierte los finales de línea al guardar y al traer. Si ves un archivo entero marcado como modificado sin haberlo tocado, es eso.

### Decodificar de a pedazos

Si leés un archivo grande por partes, un carácter UTF-8 de varios bytes puede quedar partido entre dos pedazos. La solución es un decodificador con estado:

```js
const bytes = Buffer.from('ñandú');

// mal: cada pedazo se decodifica por su cuenta
const d1 = new TextDecoder();
console.log(d1.decode(bytes.subarray(0, 1)));   // carácter roto

// bien: el decodificador recuerda el byte incompleto
const d2 = new TextDecoder();
let salida = d2.decode(bytes.subarray(0, 1), { stream: true });
salida += d2.decode(bytes.subarray(1), { stream: true });
console.log(salida);                            // ñandú
```

Cuando usás `createReadStream(ruta, 'utf8')` o `readline`, Node ya hace esto por vos.

### La consola

Si el texto se ve bien en el archivo y mal en la terminal, el problema es la terminal, no tu código. En la consola vieja de Windows revisá la página de códigos con `chcp`; `chcp 65001` la pone en UTF-8. Windows Terminal y PowerShell 7 ya vienen bien de fábrica.

---

## Parte 6: crear y escribir

### Escribir un archivo entero

```js
import { writeFile, appendFile, mkdir } from 'node:fs/promises';
import path from 'node:path';

await mkdir('salida', { recursive: true });         // crea la carpeta y sus padres
await writeFile(path.join('salida', 'notas.txt'), 'primera línea\n', 'utf8');
await appendFile(path.join('salida', 'notas.txt'), 'segunda línea\n', 'utf8');
```

`writeFile` crea el archivo si no existe y lo vacía si existe. `recursive: true` en `mkdir` no falla si la carpeta ya está.

### Los flags de apertura

El flag decide qué pasa con lo que ya hay. Vale para `open`, `writeFile` y `createWriteStream`, y se comporta igual en los tres sistemas:

| Flag | Qué hace |
|---|---|
| `r` | solo lectura, falla si no existe |
| `w` | escritura, crea o vacía |
| `wx` | escritura, falla si ya existe |
| `a` | agrega al final, crea si no existe |
| `ax` | agrega, falla si ya existe |
| `r+` | lectura y escritura, falla si no existe |
| `w+` | lectura y escritura, crea o vacía |

```js
// crear un archivo solo si no existe, sin pisar nada
try {
  await writeFile('salida/config.json', '{}', { flag: 'wx' });
} catch (err) {
  if (err.code !== 'EEXIST') throw err;
}
```

### Muchas escrituras seguidas

Abrí una vez y escribí muchas veces. Cada llamada a `appendFile` abre y cierra el archivo, así que dentro de un bucle es costosa.

```js
import { open } from 'node:fs/promises';

const archivo = await open('salida/log.txt', 'a');
try {
  for (let i = 0; i < 1000; i++) {
    await archivo.write(`línea ${i}\n`);
  }
} finally {
  await archivo.close();
}
```

Para volúmenes grandes conviene un stream, que además maneja la contrapresión cuando el disco no da abasto:

```js
import { createWriteStream } from 'node:fs';
import { Readable } from 'node:stream';
import { pipeline } from 'node:stream/promises';

function* generar() {
  for (let i = 0; i < 1_000_000; i++) yield `línea ${i}\n`;
}

await pipeline(Readable.from(generar()), createWriteStream('salida/grande.txt'));
```

### Escritura atómica

Si el programa se corta a la mitad de un `writeFile`, el archivo queda truncado. Para que nunca pase, escribís en un temporal y renombrás. El renombre dentro del mismo disco reemplaza el destino de una sola vez: quien lea, lee la versión vieja o la nueva, nunca una mezcla.

```js
import { open, rename } from 'node:fs/promises';

export async function escribirAtomico(ruta, contenido) {
  const temporal = `${ruta}.${process.pid}.tmp`;
  const archivo = await open(temporal, 'wx');
  try {
    await archivo.writeFile(contenido, 'utf8');
    await archivo.sync();          // fuerza el volcado del cache a disco
  } finally {
    await archivo.close();         // en Windows, sin esto el rename falla
  }
  await rename(temporal, ruta);
}
```

Nota entre sistemas: en Windows el renombre falla si el destino está abierto por otro programa, incluido el antivirus, que abre los archivos nuevos para revisarlos. Es un error transitorio, así que se resuelve reintentando:

```js
async function renombrarConReintento(origen, destino, intentos = 5) {
  for (let i = 0; i < intentos; i++) {
    try {
      return await rename(origen, destino);
    } catch (err) {
      if (!['EBUSY', 'EPERM', 'EACCES'].includes(err.code) || i === intentos - 1) throw err;
      await new Promise(r => setTimeout(r, 50 * 2 ** i));
    }
  }
}
```

Escribí siempre el temporal en la misma carpeta que el destino. Si lo ponés en `os.tmpdir()`, es probable que quede en otro disco y el renombre falle con `EXDEV`.

---

## Parte 7: leer

### Leer todo de una vez

```js
import { readFile } from 'node:fs/promises';

const texto = await readFile('datos/a.txt', 'utf8');
```

Es la forma más simple y sirve para archivos chicos. Tiene dos límites duros, iguales en los tres sistemas:

- el archivo entero entra en memoria, así que 2 GB de archivo son 2 GB de RAM
- un string de JavaScript no puede pasar de 512 MiB, y arriba de eso `readFile` con codificación tira un error

### Leer línea por línea

Es la forma correcta para logs, CSV y cualquier archivo que no sepas cuánto pesa. La memoria usada es la de una línea.

```js
import { createReadStream } from 'node:fs';
import { createInterface } from 'node:readline';

const rl = createInterface({
  input: createReadStream('datos/log.txt', 'utf8'),
  crlfDelay: Infinity          // trata \r\n como un solo corte
});

let numero = 0;
for await (const linea of rl) {
  numero++;
  if (linea.includes('error')) console.log(`${numero}: ${linea}`);
}
```

`crlfDelay: Infinity` es lo que hace que este código lea igual un archivo escrito en Windows y uno escrito en Linux. Ponelo siempre.

### Leer de a bloques

Cuando el archivo no es texto, o cuando querés controlar el tamaño del bloque:

```js
import { createReadStream } from 'node:fs';

let bytes = 0;
for await (const bloque of createReadStream('datos/foto.png', { highWaterMark: 64 * 1024 })) {
  bytes += bloque.length;      // bloque es un Buffer
}
console.log(bytes);
```

### Leer un pedazo puntual

Ya lo viste en la parte 4: `archivo.read(buffer, offset, largo, posicion)`. Sirve para leer solo la cabecera de un archivo sin abrirlo entero, como hacemos en la parte 11 con el PNG.

---

## Parte 8: listar carpetas

### Listado simple

```js
import { readdir } from 'node:fs/promises';

console.log(await readdir('datos'));                       // ['a.txt', 'sub']
console.log(await readdir('datos', { recursive: true }));   // incluye 'sub/b.txt'
```

Nota entre sistemas: el orden de `readdir` no está garantizado y cambia entre sistemas de archivos. Windows suele devolver alfabético, Linux devuelve el orden interno de la tabla. Si el orden importa, ordenalo vos.

```js
const nombres = (await readdir('datos')).sort((a, b) => a.localeCompare(b, 'es'));
```

### Listado con tipo

`withFileTypes` devuelve objetos `Dirent` en lugar de nombres. Evita un `stat` por entrada, que es la parte cara.

```js
import { readdir } from 'node:fs/promises';

for (const entrada of await readdir('datos', { withFileTypes: true })) {
  console.log(entrada.name, entrada.isDirectory() ? 'carpeta' : 'archivo');
}
```

### Recorrido propio

Un generador asincrónico te da control total, te deja podar ramas y no acumula todo el árbol en memoria:

```js
import { readdir } from 'node:fs/promises';
import path from 'node:path';

export async function* recorrer(dir, omitir = new Set(['node_modules', '.git'])) {
  for (const entrada of await readdir(dir, { withFileTypes: true })) {
    const ruta = path.join(dir, entrada.name);
    if (entrada.isDirectory()) {
      if (omitir.has(entrada.name)) continue;
      yield* recorrer(ruta, omitir);
    } else if (entrada.isFile()) {
      yield ruta;
    }
  }
}

for await (const ruta of recorrer('.')) console.log(ruta);
```

Preguntá `isFile()` en vez de suponer. Una carpeta puede contener enlaces simbólicos, sockets y dispositivos, y esas entradas rompen cualquier lectura ingenua.

Nota entre sistemas: los tres tienen enlaces simbólicos, pero en Windows crearlos requiere permisos especiales o el modo de desarrollador. Además, los accesos directos `.lnk` de Windows no son enlaces para el sistema de archivos: son archivos comunes que solo el Explorador interpreta. Node los ve como lo que son, archivos de datos.

---

## Parte 9: buscar

Hay tres formas de buscar, según por qué preguntás.

### Buscar por nombre

Node trae `glob` desde la versión 22. Devuelve un iterador asincrónico, así que empieza a producir resultados antes de terminar el recorrido.

```js
import { glob } from 'node:fs/promises';

for await (const ruta of glob('**/*.txt', { cwd: 'datos', exclude: ['**/*.tmp'] })) {
  console.log(ruta);
}
```

Los comodines son los del shell:

- `*` cualquier cosa menos el separador de carpetas
- `**` cualquier cosa, incluidas carpetas
- `?` un carácter
- `{a,b}` una alternativa

Los patrones se escriben siempre con la barra `/`, también en Windows. Es una convención de los globs, no una ruta del sistema. Las rutas que devuelve, en cambio, sí son del sistema: armalas y compará con `path`, nunca con texto.

### Buscar por contenido

Un grep casero, línea por línea, que funciona con archivos de cualquier tamaño:

```js
import { createReadStream } from 'node:fs';
import { createInterface } from 'node:readline';

export async function buscarEnArchivo(ruta, patron) {
  const rl = createInterface({
    input: createReadStream(ruta, 'utf8'),
    crlfDelay: Infinity
  });
  const hallazgos = [];
  let numero = 0;
  for await (const linea of rl) {
    numero++;
    if (patron.test ? patron.test(linea) : linea.includes(patron)) {
      hallazgos.push({ ruta, numero, linea });
    }
  }
  return hallazgos;
}
```

Combinalo con el generador `recorrer` y tenés un buscador de proyecto completo en 20 líneas.

### Buscar por metadatos

```js
import { stat } from 'node:fs/promises';

const haceUnaSemana = Date.now() - 7 * 24 * 60 * 60 * 1000;

for await (const ruta of recorrer('.')) {
  const info = await stat(ruta);
  if (info.size > 1_000_000 && info.mtimeMs > haceUnaSemana) {
    console.log(ruta, info.size);
  }
}
```

### Buscar duplicados

Dos archivos con el mismo hash tienen, a todo fin práctico, el mismo contenido. El hash se calcula por stream, así que no importa el tamaño:

```js
import { createReadStream } from 'node:fs';
import { createHash } from 'node:crypto';
import { pipeline } from 'node:stream/promises';

async function hashDe(ruta) {
  const hash = createHash('sha256');
  await pipeline(createReadStream(ruta), hash);
  return hash.digest('hex');
}

const porHash = new Map();
for await (const ruta of recorrer('.')) {
  const h = await hashDe(ruta);
  porHash.set(h, [...(porHash.get(h) ?? []), ruta]);
}
for (const [h, rutas] of porHash) {
  if (rutas.length > 1) console.log('duplicados:', rutas);
}
```

Un truco para acelerarlo: comparar primero el tamaño con `stat`, que es casi gratis, y calcular el hash solo para los que coinciden.

---

## Parte 10: copiar, mover, renombrar y borrar

### Copiar

```js
import { copyFile, cp } from 'node:fs/promises';
import { constants } from 'node:fs';

await copyFile('datos/a.txt', 'salida/a.txt');
await copyFile('datos/a.txt', 'salida/a.txt', constants.COPYFILE_EXCL);  // falla si existe
await cp('datos', 'respaldo', { recursive: true });                      // carpeta entera
```

Al copiar se copian los bytes y las fechas, no siempre los permisos. En Windows los permisos son listas de control de acceso que no tienen equivalente en el modelo de Unix, así que el destino hereda los de su carpeta.

### Renombrar y mover

Son la misma operación: cambiar la entrada de nombre en la tabla de la carpeta. Por eso mover dentro del mismo disco es instantáneo aunque el archivo pese 4 GB.

```js
import { rename, copyFile, unlink } from 'node:fs/promises';

await rename('salida/viejo.txt', 'salida/nuevo.txt');
```

Cruzar de disco es otra cosa: ahí no hay una tabla común y `rename` falla con `EXDEV`. Pasa al mover de `C:` a `D:` en Windows, a un disco externo en macOS, o entre particiones en Linux. Y también al usar Docker, donde cada volumen es otro sistema de archivos.

```js
export async function mover(origen, destino) {
  try {
    await rename(origen, destino);
  } catch (err) {
    if (err.code !== 'EXDEV') throw err;
    await copyFile(origen, destino);
    await unlink(origen);
  }
}
```

Dos advertencias más. `rename` pisa el destino sin avisar si ya existe. Y en Windows falla si el origen o el destino están abiertos, con `EBUSY` o `EPERM`: usá el reintento de la parte 6.

### Borrar

```js
import { rm, unlink } from 'node:fs/promises';

await unlink('salida/a.txt');                              // un archivo
await rm('salida/temp', { recursive: true, force: true }); // carpeta, sin fallar si no está
```

`force: true` significa "no me avises si no existe". Es cómodo y peligroso: se come el `ENOENT` que te habría avisado de un error de tipeo en la ruta.

Nota entre sistemas: borrar no manda a la papelera en ninguno de los tres. La papelera la implementa el explorador de archivos, no el sistema. Si querés ese comportamiento, mové a una carpeta propia o usá una librería como `trash`.

### No preguntes si existe

Esto parece razonable y está mal:

```js
if (existsSync(ruta)) {
  const texto = await readFile(ruta, 'utf8');   // puede fallar igual
}
```

Entre la pregunta y la respuesta, otro proceso pudo borrar el archivo. Es una condición de carrera clásica, llamada TOCTOU. La forma correcta es intentar la operación y manejar el error:

```js
try {
  const texto = await readFile(ruta, 'utf8');
} catch (err) {
  if (err.code !== 'ENOENT') throw err;
  // el archivo no está: usá un valor por defecto
}
```

---

## Parte 11: extraer información

### Metadatos con stat

```js
import { stat } from 'node:fs/promises';

const info = await stat('datos/a.txt');
console.log(info.size);          // bytes, confiable en los tres sistemas
console.log(info.mtime);         // última modificación del contenido (Date)
console.log(info.birthtime);     // fecha de creación
console.log(info.isFile(), info.isDirectory(), info.isSymbolicLink());
```

Notas entre sistemas sobre estos campos:

- `size` y `mtime` funcionan igual en todos lados
- `birthtime` es real en Windows y macOS; en Linux depende del sistema de archivos y a veces devuelve la fecha del último cambio de metadatos
- la precisión del reloj cambia: NTFS guarda hasta 100 nanosegundos, otros sistemas redondean al segundo, así que no compares fechas por igualdad exacta

Sobre los permisos, `info.mode` es un número pensado para el modelo de Unix:

```js
console.log((info.mode & 0o777).toString(8));   // 644, 755, y así
```

En Linux y macOS eso es exacto. En Windows, Node informa un valor aproximado que solo distingue si el archivo es de solo lectura. Por eso `chmod` en Windows apenas cambia ese atributo y no hace nada más. Si tu programa necesita permisos finos en Windows, el módulo `fs` no alcanza.

`stat` sigue los enlaces simbólicos y te informa del destino. `lstat` te informa del enlace en sí. Si recorrés árboles, usá `lstat` para no entrar en bucles infinitos con enlaces circulares.

### Estadísticas de texto

```js
import { createReadStream } from 'node:fs';
import { createInterface } from 'node:readline';

export async function contar(ruta) {
  const rl = createInterface({
    input: createReadStream(ruta, 'utf8'),
    crlfDelay: Infinity
  });
  let lineas = 0, palabras = 0, caracteres = 0;
  for await (const linea of rl) {
    lineas++;
    caracteres += [...linea].length;
    if (linea.trim()) palabras += linea.trim().split(/\s+/).length;
  }
  return { lineas, palabras, caracteres };
}
```

El conteo de caracteres no coincide con el tamaño en bytes que informa `stat`, por dos razones: los acentos ocupan 2 bytes en UTF-8 y los saltos de línea ocupan 2 en Windows. Es un buen ejercicio para hacer visible la codificación.

### Saber qué es un archivo de verdad

La extensión miente. El contenido no. Casi todos los formatos empiezan con una firma de pocos bytes, llamada número mágico, que es la misma en cualquier sistema:

```js
import { open } from 'node:fs/promises';

const FIRMAS = [
  { tipo: 'png',  bytes: [0x89, 0x50, 0x4e, 0x47] },   // .PNG
  { tipo: 'jpg',  bytes: [0xff, 0xd8, 0xff] },
  { tipo: 'gif',  bytes: [0x47, 0x49, 0x46, 0x38] },   // GIF8
  { tipo: 'pdf',  bytes: [0x25, 0x50, 0x44, 0x46] },   // %PDF
  { tipo: 'zip',  bytes: [0x50, 0x4b, 0x03, 0x04] }    // PK, también docx, xlsx y jar
];

export async function tipoReal(ruta) {
  const archivo = await open(ruta, 'r');
  try {
    const cabecera = Buffer.alloc(8);
    await archivo.read(cabecera, 0, 8, 0);
    for (const { tipo, bytes } of FIRMAS) {
      if (cabecera.subarray(0, bytes.length).equals(Buffer.from(bytes))) return tipo;
    }
    return 'desconocido';
  } finally {
    await archivo.close();
  }
}
```

Un paso más: el ancho y el alto de un PNG están en la cabecera, en los bytes 16 a 23, como enteros de 4 bytes con el más significativo primero.

```js
export async function medidasPNG(ruta) {
  const archivo = await open(ruta, 'r');
  try {
    const cabecera = Buffer.alloc(24);
    await archivo.read(cabecera, 0, 24, 0);
    return { ancho: cabecera.readUInt32BE(16), alto: cabecera.readUInt32BE(20) };
  } finally {
    await archivo.close();
  }
}
```

Leíste 24 bytes de un archivo de 8 MB y obtuviste el dato. Eso es lo que hacen por dentro las librerías de metadatos.

El orden de los bytes, llamado endianness, es del formato, no de la máquina. PNG guarda el byte más significativo primero y por eso se lee con `readUInt32BE` en cualquier sistema. Otros formatos, como BMP, guardan al revés y se leen con `readUInt32LE`.

### Formatos de datos

JSON entero, cuando el archivo entra en memoria:

```js
const config = JSON.parse(await readFile('config.json', 'utf8'));
```

NDJSON, un objeto JSON por línea, que es el formato correcto para archivos grandes:

```js
for await (const linea of rl) {
  if (!linea.trim()) continue;
  const registro = JSON.parse(linea);
}
```

CSV a mano, solo si el archivo es simple y lo controlás vos:

```js
const [encabezado, ...filas] = texto.trim().split(/\r?\n/);
const columnas = encabezado.split(',');
const datos = filas.map(fila => Object.fromEntries(
  fila.split(',').map((valor, i) => [columnas[i], valor])
));
```

Esto se rompe con comillas, comas dentro de un campo y saltos de línea dentro de una celda. Se rompe todavía más con un CSV exportado por Excel en español, que usa punto y coma como separador y viene en Windows-1252. Para CSV real usá una librería probada, como `csv-parse` o `papaparse`. Es un buen ejercicio para mostrarle a un alumno por qué existen esas librerías.

---

## Parte 12: errores

Node normaliza los errores del sistema operativo. Windows devuelve sus propios números, pero la propiedad `code` que ves en JavaScript es la misma en los tres sistemas. Ramificá por `code`, nunca por el texto del mensaje ni por `errno`, que sí cambia.

| Código | Qué pasó |
|---|---|
| `ENOENT` | la ruta no existe |
| `EEXIST` | ya existe y pediste no pisar |
| `EACCES` | no tenés permiso |
| `EPERM` | operación no permitida, en Windows suele ser un archivo abierto o de solo lectura |
| `EBUSY` | el archivo está en uso, casi siempre en Windows |
| `EISDIR` | es una carpeta y esperabas un archivo |
| `ENOTDIR` | un tramo de la ruta no es una carpeta |
| `ENOTEMPTY` | la carpeta tiene contenido |
| `EMFILE` | demasiados archivos abiertos a la vez |
| `ENOSPC` | no queda espacio en el disco |
| `EXDEV` | quisiste renombrar entre dos discos |
| `ENAMETOOLONG` | el nombre o la ruta pasa el límite del sistema |

```js
try {
  await readFile(ruta, 'utf8');
} catch (err) {
  if (err.code === 'ENOENT') return null;
  if (err.code === 'EACCES') throw new Error(`Sin permiso para leer ${ruta}`);
  throw err;
}
```

### Cuidado con la concurrencia

Esto revienta con `EMFILE` cuando hay muchos archivos, porque abre todos a la vez:

```js
const contenidos = await Promise.all(rutas.map(r => readFile(r, 'utf8')));
```

El sistema limita cuántos archivos puede tener abiertos un proceso. El límite es más bajo en macOS que en Linux, así que este error aparece antes en una Mac. Procesá en lotes:

```js
async function enLotes(items, tamano, tarea) {
  const salida = [];
  for (let i = 0; i < items.length; i += tamano) {
    salida.push(...await Promise.all(items.slice(i, i + tamano).map(tarea)));
  }
  return salida;
}

const contenidos = await enLotes(rutas, 50, r => readFile(r, 'utf8'));
```

---

## Parte 13: vigilar cambios

```js
import { watch } from 'node:fs/promises';

const ac = new AbortController();
setTimeout(() => ac.abort(), 60_000);

try {
  for await (const evento of watch('datos', { recursive: true, signal: ac.signal })) {
    console.log(evento.eventType, evento.filename);
  }
} catch (err) {
  if (err.name !== 'AbortError') throw err;
}
```

Es la parte de `fs` donde los sistemas más se diferencian, porque cada uno tiene su propio mecanismo: `ReadDirectoryChangesW` en Windows, FSEvents en macOS e inotify en Linux.

| Aspecto | Windows | macOS | Linux |
|---|---|---|---|
| `recursive` | nativo | nativo | desde Node 20, armado sobre vigilancias simples |
| Nombre del archivo en el evento | sí | sí | sí, no siempre en subcarpetas |
| Eventos repetidos por un guardado | frecuentes | frecuentes | frecuentes |
| Límite propio | ninguno visible | descriptores abiertos | `max_user_watches` del kernel |

Tres advertencias antes de construir algo encima:

- un solo guardado puede disparar 2 o 3 eventos, porque el editor escribe un temporal y renombra
- los nombres pueden llegar en NFD desde macOS: normalizá antes de comparar
- vigilar un árbol grande en Linux puede agotar el límite del kernel y fallar con `ENOSPC`

Si lo necesitás en serio, agregá un retardo antirrebote de 100 milisegundos o usá `chokidar`, que normaliza todo esto.

---

## Diferencias entre sistemas, resumen

| Tema | Windows | macOS | Linux |
|---|---|---|---|
| Separador de rutas | `\` | `/` | `/` |
| Raíz | una por unidad, `C:\` | única, `/` | única, `/` |
| Mayúsculas en nombres | no distingue | no distingue por defecto | distingue |
| Caracteres prohibidos | `< > : " / \ | ? *` y control | `/` y nulo | `/` y nulo |
| Nombres reservados | `CON`, `NUL`, `COM1`, y así | ninguno | ninguno |
| Largo de ruta | 260 salvo configuración | 1024 | 4096 |
| Fin de línea | `\r\n` | `\n` | `\n` |
| Codificación habitual | UTF-8 y Windows-1252 | UTF-8 | UTF-8 |
| Normalización de nombres | NFC | suele guardar NFD | tal cual se escribió |
| Borrar o renombrar lo abierto | falla | permitido | permitido |
| Permisos en `stat().mode` | solo lectura o escritura | modelo Unix completo | modelo Unix completo |
| Fecha de creación | sí | sí | depende del sistema de archivos |
| `watch` recursivo | nativo | nativo | desde Node 20 |

---

## Reglas para código que corre en los tres

1. Armá rutas con `path.join` y `path.resolve`, nunca con `+` ni con barras escritas a mano.
2. Reemplazá las rutas fijas por `os.tmpdir()`, `os.homedir()` e `import.meta.dirname`.
3. Leé y escribí siempre en UTF-8, y decodificá lo ajeno con `TextDecoder`.
4. Cortá líneas con `/\r?\n/` y usá `crlfDelay: Infinity` en `readline`.
5. Escribí `\n` en los archivos que lee otro programa, y `os.EOL` en los que lee una persona.
6. Cerrá cada archivo que abras, dentro de un `finally`.
7. Ramificá por `err.code`, nunca por el mensaje del error.
8. Reintentá ante `EBUSY`, `EPERM` y `EACCES` al renombrar o borrar.
9. Normalizá los nombres con `normalize('NFC')` antes de compararlos.
10. Limpiá los nombres generados con el criterio de Windows, que es el más estricto.
11. Ordená vos el resultado de `readdir` si el orden importa.
12. Probá alguna vez en otro sistema, o al menos en el mismo con Docker.

---

## Ejercicios

1. Escribí un script que reciba una carpeta y muestre los 10 archivos más pesados, con tamaño en KB y fecha de modificación.
2. Escribí un contador de líneas, palabras y caracteres que funcione con un archivo de 5 GB sin agotar la memoria, y explicá por qué el conteo no coincide con el tamaño que informa `stat`.
3. Tomá un CSV exportado por Excel en Windows-1252, con punto y coma como separador, y convertilo a UTF-8 separado por comas.
4. Escribí un buscador de texto que recorra un árbol de carpetas, omita `node_modules` y muestre archivo, número de línea y contenido.
5. Escribí un detector de duplicados que compare primero por tamaño y solo calcule el hash cuando dos archivos pesan igual.
6. Escribí una función `guardarConRespaldo` que renombre el archivo anterior a `.bak` antes de escribir el nuevo, de forma atómica y con reintentos.
7. Escribí un script que detecte archivos con la extensión cambiada, comparando la extensión con el número mágico.
8. Escribí un validador que reciba una lista de nombres y avise cuáles fallarían en Windows y por qué.
9. Escribí un organizador que mueva archivos a carpetas por año y mes de modificación, y que resuelva el caso de mover entre dos discos.

---

## Resumen

| Tarea | Función |
|---|---|
| leer todo | `readFile(ruta, 'utf8')` |
| leer por líneas | `readline` sobre `createReadStream` |
| leer un pedazo | `handle.read(buffer, offset, largo, posicion)` |
| escribir | `writeFile`, `appendFile` |
| escribir sin riesgo | temporal con `wx`, `sync` y `rename` |
| crear carpeta | `mkdir(ruta, { recursive: true })` |
| listar | `readdir(ruta, { withFileTypes: true })` |
| buscar por nombre | `glob('**/*.txt')` |
| buscar por contenido | recorrer y filtrar línea por línea |
| copiar | `copyFile`, `cp` con `recursive` |
| mover o renombrar | `rename`, con respaldo para `EXDEV` |
| borrar | `unlink`, `rm` con `recursive` |
| metadatos | `stat`, `lstat` |
| rutas | `path.join`, `path.resolve`, `path.extname` |
| carpetas del sistema | `os.tmpdir()`, `os.homedir()` |

Cuatro ideas para llevarte:

- un archivo son bytes, y esa idea es idéntica en Windows, macOS y Linux
- el texto es una interpretación de esos bytes y siempre necesita una codificación explícita
- las diferencias entre sistemas no están en leer y escribir, sino en cómo se nombran las rutas, cómo terminan las líneas y qué se puede hacer con un archivo abierto
- no preguntes si algo existe: intentá la operación y manejá el `code` del error

Una aclaración final: nada de esto corre en el navegador. Una página web solo accede a los archivos que el usuario elige con un `input type="file"`, o a través de la API File System Access, y siempre con permiso explícito. El acceso libre al disco es propio de Node, en cualquiera de los tres sistemas.
