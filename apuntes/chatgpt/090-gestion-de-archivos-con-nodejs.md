# Gestión de archivos con JavaScript y Node.js

Un archivo parece algo sencillo: tiene un nombre, lo abrimos, guardamos información y lo cerramos. Sin embargo, para programar correctamente con archivos conviene construir primero un modelo mental preciso.

En este capítulo vamos a aprender, desde los primeros principios, a:

- comprender qué es un archivo y qué es una ruta;
- crear directorios y archivos;
- leer, escribir y agregar contenido;
- entender el texto, Unicode y las codificaciones;
- listar, buscar, copiar, mover y renombrar archivos;
- consultar sus metadatos;
- extraer información de TXT, JSON, CSV y registros de eventos;
- procesar archivos grandes sin cargarlos completos en memoria;
- manejar errores y evitar pérdidas accidentales de información.

Los ejemplos usan JavaScript ejecutado con Node.js y, salvo que se indique lo contrario, la API asíncrona basada en promesas.

---

## 1. El modelo más elemental: un archivo contiene bytes

Una computadora almacena información como secuencias de bits:

```text
0 1 1 0 0 0 01 ...
```

Normalmente agrupamos esos bits de ocho en ocho. Cada grupo forma un **byte**:

```text
8 bits = 1 byte
```

Un archivo puede pensarse, en una primera aproximación, como una secuencia ordenada de bytes guardada en un dispositivo:

```text
archivo
  ├── byte 0
  ├── byte 1
  ├── byte 2
  └── ...
```

Los bytes, por sí solos, no dicen qué representan. La misma secuencia podría interpretarse como:

- texto;
- una imagen;
- audio;
- un documento PDF;
- un programa ejecutable;
- datos comprimidos.

El **formato** establece cómo interpretar esos bytes.

### La extensión no transforma el contenido

El nombre `foto.jpg` sugiere que el archivo contiene una imagen JPEG, pero la extensión es solamente parte del nombre.

Si renombramos:

```text
foto.jpg → foto.txt
```

los bytes internos no cambian. El archivo continúa conteniendo una imagen, aunque ahora su nombre resulte engañoso.

Esta diferencia será importante:

```text
nombre y extensión  → orientan sobre el contenido
bytes del archivo   → son el contenido real
```

---

## 2. Archivo, directorio, ruta y metadatos

Un sistema de archivos organiza la información mediante varios conceptos relacionados, pero distintos.

### Archivo

Contiene una secuencia de bytes.

### Directorio

Contiene entradas que relacionan nombres con archivos u otros directorios. Coloquialmente también lo llamamos **carpeta**.

```text
curso/
├── alumnos.txt
├── notas.json
└── entregas/
    └── trabajo-01.txt
```

### Ruta

Es una descripción de la ubicación de una entrada dentro del sistema de archivos:

```text
curso/entregas/trabajo-01.txt
```

### Metadatos

Son datos acerca del archivo, por ejemplo:

- tamaño;
- fechas de modificación y acceso;
- permisos;
- tipo de entrada;
- propietario, según el sistema operativo.

El nombre no forma parte de los bytes almacenados dentro del archivo. El directorio relaciona ese nombre con la entrada correspondiente.

Por eso **renombrar** un archivo normalmente no implica reescribir todo su contenido.

---

## 3. Node.js como intermediario

JavaScript, por sí solo, no define una operación universal para abrir un archivo del disco. Node.js ofrece módulos que hablan con el sistema operativo.

Los principales son:

```text
node:fs            operaciones con archivos y directorios
node:fs/promises   las mismas ideas usando promesas
node:path          construcción y análisis de rutas
node:readline      lectura de texto línea por línea
node:buffer        manipulación explícita de bytes
```

Usaremos especialmente:

```js
import * as fs from "node:fs/promises";
import path from "node:path";
```

El prefijo `node:` deja claro que estamos importando un módulo incorporado en Node.js y no un paquete descargado.

### Tres estilos de API

Muchas operaciones del módulo `fs` tienen tres variantes.

#### Asíncrona con promesas

```js
import { readFile } from "node:fs/promises";

const texto = await readFile("mensaje.txt", "utf8");
```

Será nuestro estilo principal: no bloquea el hilo de JavaScript mientras Node.js espera la operación y se combina bien con `async` y `await`.

#### Asíncrona con callback

```js
import { readFile } from "node:fs";

readFile("mensaje.txt", "utf8", (error, texto) => {
    if (error) {
        console.error(error);
        return;
    }

    console.log(texto);
});
```

Es común en código antiguo y en algunas interfaces basadas en eventos.

#### Síncrona

```js
import { readFileSync } from "node:fs";

const texto = readFileSync("mensaje.txt", "utf8");
```

Detiene la ejecución hasta terminar. Puede ser razonable en un script muy pequeño, durante el inicio de un programa o en una herramienta que realiza una única tarea. En un servidor puede impedir que se atiendan otras solicitudes mientras espera al disco.

---

## 4. Preparar un proyecto mínimo

Creemos un directorio y un archivo `package.json`:

```text
archivos-node/
└── package.json
```

Contenido de `package.json`:

```json
{
    "type": "module"
}
```

La propiedad `"type": "module"` permite usar `import` y `export` en archivos con extensión `.js`.

Ahora podemos crear `inicio.js`:

```js
import { writeFile } from "node:fs/promises";

await writeFile("saludo.txt", "Hola desde Node.js\n", "utf8");

console.log("Archivo creado");
```

Y ejecutarlo:

```bash
node inicio.js
```

También podríamos usar la extensión `.mjs` sin crear el `package.json`.

---

## 5. Rutas relativas y absolutas

Una operación necesita saber **dónde** está el archivo.

### Ruta relativa

```text
datos/alumnos.txt
```

Se interpreta a partir del directorio de trabajo actual del proceso.

Podemos consultarlo con:

```js
console.log(process.cwd());
```

`cwd` significa *current working directory*.

Si ejecutamos el mismo programa desde dos directorios diferentes, una misma ruta relativa puede señalar lugares diferentes.

### Ruta absoluta

Describe una ubicación desde la raíz del sistema:

```text
/home/ana/proyecto/datos/alumnos.txt
```

En Windows podría verse así:

```text
C:\Users\Ana\proyecto\datos\alumnos.txt
```

### Construir rutas con `node:path`

No conviene concatenar separadores manualmente:

```js
// Frágil
const ruta = directorio + "/" + nombre;
```

Es preferible:

```js
import path from "node:path";

const ruta = path.join("datos", "alumnos", "ana.txt");

console.log(ruta);
```

`path.join()` utiliza las convenciones del sistema operativo y normaliza separadores.

### Resolver una ruta absoluta

```js
import path from "node:path";

const rutaAbsoluta = path.resolve("datos", "alumnos.txt");

console.log(rutaAbsoluta);
```

`path.resolve()` parte del directorio de trabajo, salvo que encuentre antes una ruta absoluta.

### Obtener partes de una ruta

```js
import path from "node:path";

const ruta = "/curso/datos/alumnos.csv";

console.log(path.basename(ruta)); // alumnos.csv
console.log(path.extname(ruta));  // .csv
console.log(path.dirname(ruta));  // /curso/datos
console.log(path.parse(ruta));
```

`path.parse()` devuelve un objeto semejante a este:

```js
const partes = {
    root: "/",
    dir: "/curso/datos",
    base: "alumnos.csv",
    ext: ".csv",
    name: "alumnos"
};
```

---

## 6. Crear directorios

Usamos `mkdir`:

```js
import { mkdir } from "node:fs/promises";

await mkdir("datos");
```

Esto falla si `datos` ya existe o si falta algún directorio intermedio.

Para crear toda la cadena necesaria y no fallar si ya existe:

```js
import { mkdir } from "node:fs/promises";

await mkdir("datos/2026/agosto", { recursive: true });
```

Modelo mental:

```text
mkdir("a/b/c", { recursive: true })
          │
          ├── crea a si falta
          ├── crea b si falta
          └── crea c si falta
```

---

## 7. Crear y escribir un archivo de texto

La operación más directa es `writeFile`:

```js
import { writeFile } from "node:fs/promises";

await writeFile(
    "mensaje.txt",
    "Primera línea\nSegunda línea\n",
    "utf8"
);
```

Si `mensaje.txt` no existe, se crea. Si ya existe, su contenido se reemplaza.

La cadena contiene saltos de línea representados por `\n`:

```text
Primera línea
Segunda línea
```

### Evitar sobrescribir un archivo existente

La opción `flag: "wx"` significa: abrir para escritura, pero fallar si el archivo ya existe.

```js
import { writeFile } from "node:fs/promises";

await writeFile(
    "configuracion.txt",
    "modo=desarrollo\n",
    {
        encoding: "utf8",
        flag: "wx"
    }
);
```

Las banderas más habituales al escribir son:

| Bandera | Significado práctico |
|---|---|
| `"w"` | Escribe desde cero; crea o reemplaza |
| `"wx"` | Escribe desde cero; falla si ya existe |
| `"a"` | Agrega al final; crea si no existe |
| `"ax"` | Agrega; falla si ya existe |

`writeFile` usa `"w"` por defecto.

---

## 8. Agregar contenido sin borrar lo anterior

`appendFile` agrega bytes al final:

```js
import { appendFile } from "node:fs/promises";

await appendFile(
    "eventos.log",
    "El programa comenzó\n",
    "utf8"
);
```

Podemos llamarlo varias veces:

```js
import { appendFile } from "node:fs/promises";

await appendFile("eventos.log", "Inicio\n", "utf8");
await appendFile("eventos.log", "Alumno creado\n", "utf8");
await appendFile("eventos.log", "Fin\n", "utf8");
```

Resultado:

```text
Inicio
Alumno creado
Fin
```

La diferencia esencial es:

```text
writeFile  → reemplaza el contenido
appendFile → conserva lo anterior y agrega al final
```

---

## 9. Leer un archivo completo

Usamos `readFile`:

```js
import { readFile } from "node:fs/promises";

const contenido = await readFile("mensaje.txt", "utf8");

console.log(contenido);
```

Al indicar `"utf8"`, pedimos que los bytes se **decodifiquen** y el resultado sea un `string` de JavaScript.

Si omitimos la codificación:

```js
import { readFile } from "node:fs/promises";

const contenido = await readFile("mensaje.txt");

console.log(contenido);
```

obtenemos un `Buffer`, es decir, una representación de los bytes:

```text
<Buffer 48 6f 6c 61 ...>
```

Podemos decodificarlo después:

```js
const bytes = await readFile("mensaje.txt");
const texto = bytes.toString("utf8");

console.log(texto);
```

Esta distinción es fundamental:

```text
readFile(ruta)         → Buffer, bytes
readFile(ruta, "utf8") → string, texto decodificado
```

---

## 10. Texto, Unicode y codificación

Un archivo no contiene “letras” directamente: contiene bytes. Para guardar texto necesitamos una regla que relacione caracteres y bytes. Esa regla es una **codificación de caracteres**.

### Unicode

Unicode asigna un número llamado **punto de código** a una enorme cantidad de caracteres.

Ejemplos conceptuales:

```text
A   → U+0041
ñ   → U+00F1
€   → U+20AC
😀  → U+1F600
```

Unicode define qué número representa cada carácter. Una codificación como UTF-8 define cómo expresar esos números mediante bytes.

### UTF-8

UTF-8 usa una cantidad variable de bytes:

```text
carácter ASCII común       → 1 byte
muchos caracteres latinos → 2 bytes
otros caracteres          → 3 bytes
muchos emojis             → 4 bytes
```

Podemos observarlo:

```js
console.log(Buffer.from("A", "utf8"));
console.log(Buffer.from("ñ", "utf8"));
console.log(Buffer.from("😀", "utf8"));

console.log(Buffer.byteLength("A", "utf8"));  // 1
console.log(Buffer.byteLength("ñ", "utf8"));  // 2
console.log(Buffer.byteLength("😀", "utf8")); // 4
```

Por eso no debemos suponer que “un carácter ocupa un byte”.

Tampoco debemos confundir bytes, unidades internas de JavaScript y caracteres visibles:

```js
const ejemplo = "😀";

console.log(Buffer.byteLength(ejemplo, "utf8")); // 4 bytes UTF-8
console.log(ejemplo.length);                     // 2 unidades UTF-16
console.log(Array.from(ejemplo).length);         // 1 punto de código
```

JavaScript representa internamente sus strings mediante unidades de código UTF-16. `Array.from()` recorre puntos de código completos, pero incluso un punto de código no siempre equivale a un símbolo percibido por una persona: ciertos acentos y emojis se construyen combinando varios. Por eso toda medición debe aclarar qué unidad está contando.

### Codificar y decodificar

```text
string de JavaScript
        │
        │ codificar como UTF-8
        ▼
      bytes
        │
        │ decodificar como UTF-8
        ▼
string de JavaScript
```

En código:

```js
const textoOriginal = "Tucumán 😀";

const bytes = Buffer.from(textoOriginal, "utf8");
const textoRecuperado = bytes.toString("utf8");

console.log(bytes);
console.log(textoRecuperado);
```

### ¿Qué ocurre si usamos la codificación equivocada?

Si los bytes fueron producidos con una codificación y los interpretamos con otra, aparecen caracteres incorrectos:

```text
información correcta → bytes → interpretación incorrecta → texto dañado
```

Los textos como `JosÃ©` suelen ser síntoma de una codificación mal interpretada.

### Codificaciones disponibles en Node.js

Node.js reconoce, entre otras:

- `utf8` o `utf-8`;
- `utf16le`;
- `latin1`;
- `ascii` por compatibilidad;
- `base64`, `base64url` y `hex` para representar bytes mediante texto.

Para archivos de texto nuevos, UTF-8 es normalmente la elección apropiada.

### UTF-8 no guarda necesariamente una marca inicial

Algunos archivos comienzan con una marca llamada **BOM**. UTF-8 no la necesita, pero ciertas herramientas la agregan. Si aparece como primer carácter después de leer JSON o CSV, podemos retirarla:

```js
const sinBOM = texto.replace(/^\uFEFF/, "");
```

### Saltos de línea

Los sistemas han usado diferentes secuencias para separar líneas:

```text
Linux y macOS actuales → LF   → \n
Windows                → CRLF → \r\n
macOS clásico          → CR   → \r
```

Para dividir texto procedente de distintas plataformas:

```js
const lineas = texto.split(/\r\n|\n|\r/);
```

Para escribir con el separador propio del sistema actual:

```js
import { EOL } from "node:os";

const texto = ["uno", "dos", "tres"].join(EOL);
```

En formatos intercambiados entre sistemas suele ser más simple elegir `\n` de manera consistente.

---

## 11. Transformar texto y volver a guardarlo

La secuencia general es:

```text
leer → decodificar → transformar → codificar → escribir
```

Ejemplo: convertir un archivo a mayúsculas.

```js
import { readFile, writeFile } from "node:fs/promises";

const texto = await readFile("entrada.txt", "utf8");
const transformado = texto.toLocaleUpperCase("es");

await writeFile("salida.txt", transformado, "utf8");
```

Ejemplo: reemplazar una palabra:

```js
const texto = await readFile("entrada.txt", "utf8");
const transformado = texto.replaceAll("alumno", "estudiante");

await writeFile("salida.txt", transformado, "utf8");
```

Leer y escribir el mismo archivo es válido:

```js
const texto = await readFile("entrada.txt", "utf8");
const transformado = texto.trim() + "\n";

await writeFile("entrada.txt", transformado, "utf8");
```

Pero si el proceso falla durante la escritura podríamos dejar el archivo incompleto. Cuando el dato es importante, es más seguro escribir primero un archivo temporal y luego renombrarlo:

```js
import { rename, writeFile } from "node:fs/promises";

await writeFile("entrada.txt.tmp", transformado, "utf8");
await rename("entrada.txt.tmp", "entrada.txt");
```

Conviene que el temporal esté en el mismo directorio que el destino. La política exacta para reemplazar un archivo existente puede variar entre sistemas, por lo que una aplicación crítica debe probar el comportamiento en las plataformas que admite.

---

## 12. Listar el contenido de un directorio

`readdir` devuelve los nombres de las entradas:

```js
import { readdir } from "node:fs/promises";

const nombres = await readdir("datos");

for (const nombre of nombres) {
    console.log(nombre);
}
```

Para distinguir archivos de directorios usamos `withFileTypes`:

```js
import { readdir } from "node:fs/promises";

const entradas = await readdir("datos", {
    withFileTypes: true
});

for (const entrada of entradas) {
    if (entrada.isDirectory()) {
        console.log(`[DIR]  ${entrada.name}`);
    } else if (entrada.isFile()) {
        console.log(`[FILE] ${entrada.name}`);
    } else {
        console.log(`[OTRO] ${entrada.name}`);
    }
}
```

Cada elemento es un `Dirent`. Entre otros métodos, ofrece:

```text
isFile()          ¿es un archivo común?
isDirectory()     ¿es un directorio?
isSymbolicLink()  ¿es un enlace simbólico?
```

### Listar solamente archivos `.txt`

```js
import { readdir } from "node:fs/promises";
import path from "node:path";

const entradas = await readdir("datos", {
    withFileTypes: true
});

const archivosTxt = entradas
    .filter((entrada) => entrada.isFile())
    .filter((entrada) => path.extname(entrada.name).toLowerCase() === ".txt")
    .map((entrada) => entrada.name);

console.log(archivosTxt);
```

---

## 13. Recorrer subdirectorios

Para buscar en todo un árbol necesitamos recorrer cada subdirectorio.

```js
import { readdir } from "node:fs/promises";
import path from "node:path";

async function listarArchivos(directorio) {
    const resultados = [];

    const entradas = await readdir(directorio, {
        withFileTypes: true
    });

    for (const entrada of entradas) {
        const rutaCompleta = path.join(directorio, entrada.name);

        if (entrada.isDirectory()) {
            const archivosInternos = await listarArchivos(rutaCompleta);
            resultados.push(...archivosInternos);
        } else if (entrada.isFile()) {
            resultados.push(rutaCompleta);
        }
    }

    return resultados;
}

const archivos = await listarArchivos("datos");

console.log(archivos);
```

La función es recursiva:

```text
visitar directorio
    │
    ├── si encuentra archivo → guardarlo
    │
    └── si encuentra directorio → visitar ese directorio
```

Este ejemplo ignora enlaces simbólicos. Es una decisión deliberada: seguirlos sin cuidado podría producir ciclos o salir del árbol esperado.

---

## 14. Consultar información de un archivo

`stat` obtiene metadatos:

```js
import { stat } from "node:fs/promises";

const informacion = await stat("mensaje.txt");

console.log("Tamaño:", informacion.size, "bytes");
console.log("Modificado:", informacion.mtime);
console.log("Es archivo:", informacion.isFile());
console.log("Es directorio:", informacion.isDirectory());
```

Algunas propiedades útiles:

| Propiedad | Significado |
|---|---|
| `size` | Tamaño en bytes |
| `mtime` | Última modificación del contenido o metadatos relacionados |
| `atime` | Último acceso, si el sistema lo registra |
| `birthtime` | Fecha de creación cuando el sistema puede proporcionarla |

No todos los sistemas de archivos mantienen todas las fechas con la misma precisión o semántica. No conviene tratarlas como verdades universales.

### `stat` y `lstat`

Si la ruta es un enlace simbólico:

- `stat()` informa sobre el destino del enlace;
- `lstat()` informa sobre el enlace mismo.

```js
import { lstat } from "node:fs/promises";

const informacion = await lstat("acceso-directo");

console.log(informacion.isSymbolicLink());
```

---

## 15. Comprobar si una ruta existe

Podemos intentar acceder:

```js
import { access } from "node:fs/promises";

async function existe(ruta) {
    try {
        await access(ruta);
        return true;
    } catch {
        return false;
    }
}
```

Uso:

```js
if (await existe("mensaje.txt")) {
    console.log("Existe");
}
```

Sin embargo, no siempre conviene preguntar primero y operar después:

```text
1. comprobar que existe
2. otro proceso lo elimina
3. intentar leerlo
```

El estado puede cambiar entre los pasos. Cuando lo que realmente queremos es leer, suele ser mejor intentar leer y manejar el posible error:

```js
import { readFile } from "node:fs/promises";

try {
    const texto = await readFile("mensaje.txt", "utf8");
    console.log(texto);
} catch (error) {
    if (error.code === "ENOENT") {
        console.log("El archivo no existe");
    } else {
        throw error;
    }
}
```

---

## 16. Buscar archivos por nombre

Combinamos el recorrido recursivo con una condición:

```js
import { readdir } from "node:fs/promises";
import path from "node:path";

async function buscarPorNombre(directorio, fragmento) {
    const coincidencias = [];
    const buscado = fragmento.toLocaleLowerCase("es");

    const entradas = await readdir(directorio, {
        withFileTypes: true
    });

    for (const entrada of entradas) {
        const rutaCompleta = path.join(directorio, entrada.name);

        if (entrada.isDirectory()) {
            const internas = await buscarPorNombre(rutaCompleta, fragmento);
            coincidencias.push(...internas);
        } else if (
            entrada.isFile() &&
            entrada.name.toLocaleLowerCase("es").includes(buscado)
        ) {
            coincidencias.push(rutaCompleta);
        }
    }

    return coincidencias;
}

const resultados = await buscarPorNombre("datos", "alumno");

console.log(resultados);
```

Esto busca una parte literal del nombre. Para patrones más sofisticados podríamos usar una expresión regular.

---

## 17. Buscar texto dentro de archivos

Buscar por contenido requiere:

```text
encontrar archivos → leerlos como texto → comparar el contenido
```

```js
import { readFile, readdir } from "node:fs/promises";
import path from "node:path";

async function buscarEnTextos(directorio, textoBuscado) {
    const coincidencias = [];
    const buscado = textoBuscado.toLocaleLowerCase("es");

    const entradas = await readdir(directorio, {
        withFileTypes: true
    });

    for (const entrada of entradas) {
        const rutaCompleta = path.join(directorio, entrada.name);

        if (entrada.isDirectory()) {
            const internas = await buscarEnTextos(rutaCompleta, textoBuscado);
            coincidencias.push(...internas);
            continue;
        }

        const esTexto = entrada.isFile() &&
            path.extname(entrada.name).toLowerCase() === ".txt";

        if (!esTexto) {
            continue;
        }

        const contenido = await readFile(rutaCompleta, "utf8");

        if (contenido.toLocaleLowerCase("es").includes(buscado)) {
            coincidencias.push(rutaCompleta);
        }
    }

    return coincidencias;
}

console.log(await buscarEnTextos("datos", "javascript"));
```

Filtramos por extensión porque intentar decodificar indiscriminadamente imágenes, ejecutables o archivos comprimidos no constituye una búsqueda de texto confiable.

### Informar número y contenido de cada línea coincidente

```js
import { readFile } from "node:fs/promises";

async function buscarLineas(ruta, textoBuscado) {
    const contenido = await readFile(ruta, "utf8");
    const lineas = contenido.split(/\r\n|\n|\r/);
    const buscado = textoBuscado.toLocaleLowerCase("es");

    return lineas
        .map((texto, indice) => ({
            numero: indice + 1,
            texto
        }))
        .filter((linea) =>
            linea.texto.toLocaleLowerCase("es").includes(buscado)
        );
}

console.log(await buscarLineas("mensaje.txt", "node"));
```

`indice + 1` convierte el índice de un arreglo, que empieza en cero, en un número de línea para personas, que normalmente empieza en uno.

---

## 18. Copiar archivos y directorios

### Copiar un archivo

```js
import { copyFile } from "node:fs/promises";

await copyFile("original.txt", "copia.txt");
```

Por defecto, si el destino existe puede ser reemplazado.

Para impedirlo:

```js
import { constants } from "node:fs";
import { copyFile } from "node:fs/promises";

await copyFile(
    "original.txt",
    "copia.txt",
    constants.COPYFILE_EXCL
);
```

### Copiar un directorio completo

```js
import { cp } from "node:fs/promises";

await cp("datos", "respaldo/datos", {
    recursive: true
});
```

Algunas opciones útiles de `cp` son:

```js
await cp("datos", "respaldo/datos", {
    recursive: true,
    force: false,
    errorOnExist: true,
    preserveTimestamps: true
});
```

La combinación exacta depende de la política deseada: reemplazar, omitir o fallar cuando el destino ya existe.

---

## 19. Renombrar y mover

Usamos `rename`:

```js
import { rename } from "node:fs/promises";

await rename("borrador.txt", "informe.txt");
```

Si cambiamos también el directorio, estamos moviendo la entrada:

```js
await rename(
    "pendientes/informe.txt",
    "terminados/informe.txt"
);
```

Renombrar y mover dentro de un mismo sistema de archivos son, conceptualmente, variaciones de la misma operación: cambiar la ruta con la que se encuentra la entrada.

El directorio de destino debe existir:

```js
import { mkdir, rename } from "node:fs/promises";

await mkdir("terminados", { recursive: true });
await rename(
    "pendientes/informe.txt",
    "terminados/informe.txt"
);
```

Mover entre dispositivos o sistemas de archivos diferentes puede fallar con `EXDEV`. En ese caso se necesita una estrategia de copiar, verificar y luego eliminar el origen.

---

## 20. Eliminar archivos y directorios

Eliminar es una operación destructiva. Debemos validar cuidadosamente la ruta.

### Eliminar un archivo

```js
import { unlink } from "node:fs/promises";

await unlink("temporal.txt");
```

### Eliminar un directorio vacío

```js
import { rmdir } from "node:fs/promises";

await rmdir("directorio-vacio");
```

### Eliminar un árbol completo

```js
import { rm } from "node:fs/promises";

await rm("temporales", {
    recursive: true,
    force: true
});
```

`recursive: true` amplía mucho el alcance de la operación. Antes de usarlo, conviene resolver e inspeccionar la ruta y nunca aplicarlo a una ruta vacía o no confiable.

---

## 21. Extraer información de un texto

Una vez leído, el contenido es un `string`. Podemos usar las operaciones habituales de JavaScript.

### Contar líneas

```js
import { readFile } from "node:fs/promises";

function contarLineas(texto) {
    if (texto.length === 0) {
        return 0;
    }

    const partes = texto.split(/\r\n|\n|\r/);
    const terminaConSalto = /(?:\r\n|\n|\r)$/.test(texto);

    return partes.length - (terminaConSalto ? 1 : 0);
}

const texto = await readFile("informe.txt", "utf8");

console.log("Cantidad:", contarLineas(texto));
```

Aquí adoptamos una convención explícita: el archivo vacío tiene cero líneas y el salto final termina la última línea, pero no crea una línea adicional. Otras herramientas pueden definir el conteo de otra manera; lo importante es conocer y documentar la regla elegida.

### Contar palabras Unicode

```js
function extraerPalabras(texto) {
    return texto.match(/[\p{L}\p{N}]+/gu) ?? [];
}

const palabras = extraerPalabras(texto);

console.log("Palabras:", palabras.length);
```

`\p{L}` representa letras Unicode y `\p{N}` representa números Unicode. La bandera `u` activa el tratamiento Unicode.

La definición de “palabra” depende del problema. Este patrón es útil como aproximación, pero no reemplaza un segmentador lingüístico en todos los idiomas.

### Contar apariciones

```js
function contarApariciones(texto, palabra) {
    const palabras = texto.match(/[\p{L}\p{N}]+/gu) ?? [];
    const buscada = palabra.toLocaleLowerCase("es");

    return palabras.filter(
        (actual) => actual.toLocaleLowerCase("es") === buscada
    ).length;
}

console.log(contarApariciones(texto, "JavaScript"));
```

### Obtener números

```js
const texto = "Ana obtuvo 8, Juan 10 y Sol 7";
const coincidencias = texto.match(/\d+/g) ?? [];
const numeros = coincidencias.map(Number);

console.log(numeros); // [8, 10, 7]
```

---

## 22. Extraer datos de JSON

JSON es texto con una gramática específica.

Archivo `alumnos.json`:

```json
[
    { "nombre": "Ana", "nota": 8 },
    { "nombre": "Luis", "nota": 6 },
    { "nombre": "Sol", "nota": 10 }
]
```

Lectura:

```js
import { readFile } from "node:fs/promises";

const texto = await readFile("alumnos.json", "utf8");
const alumnos = JSON.parse(texto.replace(/^\uFEFF/, ""));

const aprobados = alumnos.filter((alumno) => alumno.nota >= 6);
const promedio = alumnos.reduce(
    (acumulado, alumno) => acumulado + alumno.nota,
    0
) / alumnos.length;

console.log(aprobados);
console.log(promedio);
```

`JSON.parse()` convierte texto JSON en valores de JavaScript.

Para guardar datos:

```js
import { writeFile } from "node:fs/promises";

const alumnos = [
    { nombre: "Ana", nota: 8 },
    { nombre: "Luis", nota: 6 }
];

const texto = JSON.stringify(alumnos, null, 4) + "\n";

await writeFile("alumnos.json", texto, "utf8");
```

`JSON.stringify()` convierte valores compatibles de JavaScript en texto JSON. Los argumentos `null, 4` agregan sangría para facilitar la lectura humana.

### Validar la estructura además de la sintaxis

Que el JSON sea válido no significa que contenga los datos esperados:

```js
if (!Array.isArray(alumnos)) {
    throw new TypeError("Se esperaba un arreglo de alumnos");
}

for (const alumno of alumnos) {
    if (
        typeof alumno.nombre !== "string" ||
        typeof alumno.nota !== "number"
    ) {
        throw new TypeError("Alumno inválido");
    }
}
```

Hay dos preguntas diferentes:

```text
¿el texto respeta la gramática JSON?     → JSON.parse
¿los datos tienen la forma que necesito? → validación
```

---

## 23. Extraer datos de un CSV sencillo

Archivo `alumnos.csv`:

```csv
nombre,nota
Ana,8
Luis,6
Sol,10
```

Si controlamos el formato y sabemos que ningún campo contiene comas, comillas o saltos de línea, podemos hacer un análisis elemental:

```js
import { readFile } from "node:fs/promises";

const texto = await readFile("alumnos.csv", "utf8");
const lineas = texto
    .replace(/^\uFEFF/, "")
    .trim()
    .split(/\r\n|\n|\r/);

const [encabezado, ...filas] = lineas;

if (encabezado !== "nombre,nota") {
    throw new Error("Encabezado CSV inesperado");
}

const alumnos = filas.map((fila) => {
    const [nombre, notaTexto] = fila.split(",");

    return {
        nombre,
        nota: Number(notaTexto)
    };
});

console.log(alumnos);
```

Pero un CSV real puede contener:

```csv
"Pérez, Ana",8
"Texto con ""comillas""",9
```

En esos casos, `split(",")` es incorrecto. Para archivos CSV generales conviene usar una biblioteca que implemente correctamente la variante del formato que recibimos.

---

## 24. Extraer información de un registro de eventos

Supongamos este archivo `servidor.log`:

```text
2026-08-24 INFO servidor iniciado
2026-08-24 ERROR conexión rechazada
2026-08-24 INFO reintento
```

Podemos extraer fecha, nivel y mensaje con una expresión regular:

```js
import { readFile } from "node:fs/promises";

const texto = await readFile("servidor.log", "utf8");
const lineas = texto.split(/\r\n|\n|\r/);

const patron = /^(\d{4}-\d{2}-\d{2}) (INFO|WARN|ERROR) (.+)$/;

const eventos = [];

for (const linea of lineas) {
    const coincidencia = linea.match(patron);

    if (!coincidencia) {
        continue;
    }

    const [, fecha, nivel, mensaje] = coincidencia;

    eventos.push({ fecha, nivel, mensaje });
}

const errores = eventos.filter(
    (evento) => evento.nivel === "ERROR"
);

console.log(errores);
```

La expresión regular no “comprende” el archivo: describe la estructura que esperamos encontrar.

---

## 25. Leer archivos grandes con streams

`readFile` carga el archivo completo en memoria:

```text
disco → archivo completo en RAM → procesamiento
```

Es cómodo para archivos pequeños y medianos. Para un archivo de varios gigabytes puede ser imposible o innecesario.

Un **stream** entrega fragmentos a medida que están disponibles:

```text
disco → fragmento → procesar
      → fragmento → procesar
      → fragmento → procesar
```

### Leer línea por línea

```js
import { createReadStream } from "node:fs";
import { createInterface } from "node:readline";

const flujo = createReadStream("servidor.log", {
    encoding: "utf8"
});

const lineas = createInterface({
    input: flujo,
    crlfDelay: Infinity
});

let cantidadErrores = 0;

for await (const linea of lineas) {
    if (linea.includes(" ERROR ")) {
        cantidadErrores++;
    }
}

console.log({ cantidadErrores });
```

`crlfDelay: Infinity` hace que `\r\n` sea tratado como un solo salto de línea.

La memoria utilizada ya no crece proporcionalmente al tamaño total del archivo.

### Copiar con streams

Para una copia sencilla es preferible `copyFile`. Los streams son útiles cuando también queremos transformar o inspeccionar el contenido durante el recorrido.

```js
import { createReadStream, createWriteStream } from "node:fs";
import { pipeline } from "node:stream/promises";

await pipeline(
    createReadStream("origen.bin"),
    createWriteStream("destino.bin")
);
```

`pipeline` conecta los flujos, propaga errores y espera que el proceso termine.

---

## 26. Abrir un archivo mediante un descriptor

Las funciones de alto nivel abren, operan y cierran el archivo por nosotros. También podemos abrirlo explícitamente:

```js
import { open } from "node:fs/promises";

const archivo = await open("mensaje.txt", "r");

try {
    const contenido = await archivo.readFile("utf8");
    console.log(contenido);
} finally {
    await archivo.close();
}
```

El sistema operativo mantiene un recurso abierto y Node.js lo representa mediante un `FileHandle`. Debemos cerrarlo incluso si ocurre un error. Por eso se utiliza `finally`.

Abrir explícitamente resulta útil cuando necesitamos varias operaciones sobre el mismo archivo o control de bajo nivel sobre posiciones y fragmentos.

---

## 27. Errores habituales

Las operaciones pueden fallar por muchas razones:

- la ruta no existe;
- el proceso no tiene permiso;
- una parte de la ruta no es un directorio;
- el destino ya existe;
- el disco está lleno;
- el archivo está siendo utilizado o bloqueado;
- se intenta mover entre sistemas de archivos diferentes;
- la ruta es demasiado larga para alguna capa del sistema.

Node.js entrega objetos de error que suelen incluir una propiedad `code`.

| Código | Significado habitual |
|---|---|
| `ENOENT` | No existe la ruta |
| `EACCES` | Acceso denegado |
| `EEXIST` | El destino ya existe |
| `EISDIR` | Se esperaba un archivo, pero era un directorio |
| `ENOTDIR` | Una parte que debía ser directorio no lo es |
| `ENOSPC` | No queda espacio disponible |
| `EXDEV` | La operación cruza sistemas de archivos |

Ejemplo:

```js
import { readFile } from "node:fs/promises";

try {
    const contenido = await readFile("config.json", "utf8");
    console.log(contenido);
} catch (error) {
    switch (error.code) {
        case "ENOENT":
            console.error("No se encontró config.json");
            break;

        case "EACCES":
            console.error("No hay permiso para leer config.json");
            break;

        default:
            throw error;
    }
}
```

No conviene ocultar todos los errores con un `catch` vacío. Si no sabemos resolver uno, debemos volver a lanzarlo o finalizar informando el problema.

---

## 28. Operaciones secuenciales y concurrentes

Con `await`, estas escrituras ocurren una después de otra:

```js
await writeFile("a.txt", "A", "utf8");
await writeFile("b.txt", "B", "utf8");
await writeFile("c.txt", "C", "utf8");
```

Si son independientes, podemos iniciarlas juntas:

```js
await Promise.all([
    writeFile("a.txt", "A", "utf8"),
    writeFile("b.txt", "B", "utf8"),
    writeFile("c.txt", "C", "utf8")
]);
```

No debemos lanzar varias modificaciones concurrentes sobre el mismo archivo sin diseñar cómo se coordinarán:

```js
// Resultado no confiable: compiten por el mismo destino.
await Promise.all([
    writeFile("resultado.txt", "uno", "utf8"),
    writeFile("resultado.txt", "dos", "utf8")
]);
```

El sistema de archivos no convierte automáticamente una secuencia lógica de varias operaciones en una transacción.

---

## 29. Seguridad de las rutas

Si un usuario controla una parte de la ruta, podría intentar salir del directorio permitido:

```text
../../archivo-secreto.txt
```

Esto se conoce como **path traversal** o recorrido de rutas.

Una estrategia básica es resolver la ruta y verificar que permanezca dentro del directorio autorizado:

```js
import path from "node:path";

function resolverDentroDe(base, entrada) {
    const baseAbsoluta = path.resolve(base);
    const candidata = path.resolve(baseAbsoluta, entrada);
    const relativa = path.relative(baseAbsoluta, candidata);

    const saleDeLaBase =
        relativa === ".." ||
        relativa.startsWith(`..${path.sep}`) ||
        path.isAbsolute(relativa);

    if (saleDeLaBase) {
        throw new Error("La ruta sale del directorio permitido");
    }

    return candidata;
}

console.log(resolverDentroDe("datos", "alumnos/ana.txt"));
```

En aplicaciones expuestas a usuarios también hay que definir políticas sobre enlaces simbólicos, permisos, nombres permitidos, tipos de archivo y tamaños máximos.

---

## 30. Programa integrador: analizador de textos

El siguiente programa reúne varias ideas. Recorre un directorio, encuentra archivos `.txt`, obtiene sus metadatos y calcula líneas, palabras y caracteres.

Archivo `analizar-textos.js`:

```js
import { readFile, readdir, stat } from "node:fs/promises";
import path from "node:path";

function contarLineas(texto) {
    if (texto.length === 0) {
        return 0;
    }

    const partes = texto.split(/\r\n|\n|\r/);
    const terminaConSalto = /(?:\r\n|\n|\r)$/.test(texto);

    return partes.length - (terminaConSalto ? 1 : 0);
}

function contarPalabras(texto) {
    return (texto.match(/[\p{L}\p{N}]+/gu) ?? []).length;
}

async function encontrarTextos(directorio) {
    const rutas = [];
    const entradas = await readdir(directorio, {
        withFileTypes: true
    });

    for (const entrada of entradas) {
        const ruta = path.join(directorio, entrada.name);

        if (entrada.isDirectory()) {
            rutas.push(...await encontrarTextos(ruta));
        } else if (
            entrada.isFile() &&
            path.extname(entrada.name).toLowerCase() === ".txt"
        ) {
            rutas.push(ruta);
        }
    }

    return rutas;
}

async function analizarArchivo(ruta) {
    const [texto, metadatos] = await Promise.all([
        readFile(ruta, "utf8"),
        stat(ruta)
    ]);

    return {
        ruta,
        bytes: metadatos.size,
        puntosDeCodigo: Array.from(texto).length,
        lineas: contarLineas(texto),
        palabras: contarPalabras(texto),
        modificado: metadatos.mtime.toISOString()
    };
}

const directorio = process.argv[2] ?? ".";

try {
    const rutas = await encontrarTextos(directorio);
    const informes = [];

    for (const ruta of rutas) {
        informes.push(await analizarArchivo(ruta));
    }

    console.table(informes);
} catch (error) {
    console.error(`No se pudo analizar: ${error.message}`);
    process.exitCode = 1;
}
```

Ejecución:

```bash
node analizar-textos.js datos
```

### Qué integra este programa

```text
argumento de la terminal
          │
          ▼
recorrido recursivo del directorio
          │
          ▼
selección de archivos .txt
          │
          ▼
lectura de contenido + metadatos
          │
          ▼
extracción de información
          │
          ▼
tabla de resultados
```

`process.argv[2]` representa el primer argumento escrito después del nombre del programa. Si no se proporciona, se usa `"."`, que representa el directorio actual.

---

## 31. Criterios para elegir una técnica

| Necesidad | Herramienta apropiada |
|---|---|
| Leer un archivo pequeño como texto | `readFile(ruta, "utf8")` |
| Obtener los bytes sin interpretarlos | `readFile(ruta)` |
| Reemplazar o crear contenido | `writeFile` |
| Agregar al final | `appendFile` |
| Crear directorios intermedios | `mkdir(..., { recursive: true })` |
| Listar una carpeta | `readdir` |
| Obtener tamaño y fechas | `stat` |
| Copiar un archivo | `copyFile` |
| Copiar un árbol | `cp(..., { recursive: true })` |
| Mover o cambiar el nombre | `rename` |
| Procesar un archivo grande por líneas | `createReadStream` + `readline` |
| Conectar lectura y escritura por fragmentos | `pipeline` |
| Realizar varias operaciones sobre una apertura | `open` y `FileHandle` |

---

## 32. Errores conceptuales frecuentes

### Confundir extensión con formato

Cambiar `.jpg` por `.txt` no convierte una imagen en texto.

### Omitir la codificación al esperar texto

```js
const datos = await readFile("archivo.txt");
```

devuelve bytes. Si queremos un string UTF-8:

```js
const texto = await readFile("archivo.txt", "utf8");
```

### Suponer que un carácter ocupa un byte

En UTF-8, `A`, `ñ` y `😀` ocupan cantidades diferentes de bytes.

### Suponer que una ruta relativa parte del archivo JavaScript

Normalmente parte de `process.cwd()`, el directorio de trabajo del proceso.

### Sobrescribir sin querer

`writeFile` reemplaza el contenido existente. Si eso no está permitido, debemos usar la bandera `wx` o verificar la política de destino.

### Cargar archivos enormes con `readFile`

Para procesamiento secuencial de archivos grandes debemos preferir streams.

### Dividir cualquier CSV con una coma

Los campos CSV pueden contener comas, comillas y saltos de línea. Un formato general necesita un analizador correcto.

### Ignorar errores

Un `catch` vacío transforma fallos reales en resultados silenciosamente incorrectos.

### Mezclar operaciones concurrentes sobre el mismo archivo

El orden final puede no ser el que imaginamos y pueden perderse datos.

---

## 33. Ejercicios propuestos

### Ejercicio 1: diario

Crear un programa que reciba una frase y la agregue a `diario.txt` con la fecha actual.

### Ejercicio 2: contador

Leer un archivo y mostrar:

- bytes;
- caracteres;
- palabras;
- líneas.

Comparar `Buffer.byteLength(texto, "utf8")` con `texto.length` y explicar por qué pueden diferir.

### Ejercicio 3: buscador

Recorrer un directorio y mostrar cada archivo `.md` que contenga una palabra dada, incluyendo los números de línea coincidentes.

### Ejercicio 4: respaldo

Copiar todos los `.txt` de un directorio a una carpeta `respaldo`, creándola si no existe. No reemplazar archivos existentes.

### Ejercicio 5: notas

Leer un JSON con alumnos y notas. Generar otro JSON que contenga:

- cantidad de alumnos;
- promedio;
- nota máxima;
- alumnos aprobados.

### Ejercicio 6: registros grandes

Procesar un archivo de eventos línea por línea y contar cuántos registros hay de cada nivel: `INFO`, `WARN` y `ERROR`.

### Ejercicio 7: organizador

Listar los archivos de un directorio y moverlos a subdirectorios según su extensión:

```text
imagenes/
textos/
json/
otros/
```

Antes de mover, resolver las rutas y evitar reemplazar destinos existentes.

---

## 34. Síntesis final

La gestión de archivos se vuelve más clara si mantenemos separadas estas capas:

```text
1. El sistema de archivos organiza nombres, rutas y metadatos.
2. Un archivo contiene bytes.
3. Un formato indica cómo interpretar esos bytes.
4. Una codificación relaciona texto y bytes.
5. Node.js solicita las operaciones al sistema operativo.
6. Nuestro programa transforma los datos y decide cómo manejar errores.
```

El recorrido típico de un programa es:

```text
construir ruta
      ↓
abrir o solicitar operación
      ↓
leer bytes
      ↓
decodificar si son texto
      ↓
buscar, validar o transformar
      ↓
codificar
      ↓
escribir, copiar o mover
      ↓
manejar el resultado o el error
```

La idea más importante es que un archivo no es, en esencia, “un documento de texto” ni “una imagen”. Es una secuencia de bytes a la que damos significado mediante convenciones. A partir de ese modelo, operaciones como leer, escribir, buscar o extraer información dejan de ser acciones misteriosas y se convierten en transformaciones bien definidas.

## Referencias oficiales

- [Sistema de archivos (`node:fs`)](https://nodejs.org/api/fs.html)
- [Rutas (`node:path`)](https://nodejs.org/api/path.html)
- [Buffers y codificaciones](https://nodejs.org/api/buffer.html)
- [Lectura línea por línea (`node:readline`)](https://nodejs.org/api/readline.html)
- [Streams](https://nodejs.org/api/stream.html)
