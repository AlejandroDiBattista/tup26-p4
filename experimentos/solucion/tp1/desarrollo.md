# Desarrollo de `sortx`

Este tutorial explica la solución de [`enunciado.md`](./enunciado.md)
implementada en [`desarrollo.js`](./desarrollo.js). El programa lee un archivo
delimitado, ordena sus filas y escribe el resultado en otro archivo.

Durante el desarrollo se ejecuta así:

```bash
node desarrollo.js origen destino [opciones]
```

La entrega debe llamarse `sortx.js`; por eso la ayuda incluida en el programa
usa ese nombre.

## 1. Diseño general

La solución es un pipeline de seis etapas:

| Etapa | Recibe | Produce |
|---|---|---|
| `parseArgs` | argumentos de la terminal | configuración |
| `readInput` | ruta de origen | texto UTF-8 |
| `parseDelimited` | texto y opciones de formato | encabezado y filas |
| `sortRows` | filas y criterios | las mismas filas, ordenadas |
| `serialize` | encabezado y filas | texto delimitado |
| `writeOutput` | texto y ruta de destino | archivo de salida |

Cada función tiene una sola responsabilidad y lanza un error cuando no puede
cumplir su contrato. El punto de entrada conecta las etapas y decide cómo
mostrar esos errores.

Se agrega una única función auxiliar, `parseSortField`, para interpretar cada
valor de `--by`. Así `parseArgs` se ocupa de la terminal y no de los detalles
internos de un criterio.

### Representación elegida

El archivo:

```csv
nombre,edad
Ana,30
Luis,20
```

se representa como:

```javascript
{
  headers: ["nombre", "edad"],
  rows: [
    ["Ana", "30"],
    ["Luis", "20"]
  ]
}
```

Las filas son arrays porque las columnas tienen posición. Todos los valores se
conservan como strings; una columna solo se convierte temporalmente con
`Number` cuando su criterio es numérico. Esto evita modificar, por ejemplo,
códigos con ceros iniciales.

La configuración también usa un objeto simple:

```javascript
{
  inputFile: "empleados.csv",
  outputFile: "ordenados.csv",
  delimiter: ",",
  noHeader: false,
  sortFields: [
    { name: "salario", numeric: true, descending: true }
  ],
  help: false
}
```

## 2. Dependencias y ayuda

Solo se importan operaciones del módulo estándar `node:fs`:

```javascript
import { readFileSync, writeFileSync } from "node:fs";
```

Son sincrónicas por una decisión didáctica: esta herramienta hace una lectura,
una transformación y una escritura antes de terminar. El flujo queda igual al
pipeline anterior, sin agregar promesas. Como consecuencia, el archivo completo
debe caber en memoria y el proceso queda bloqueado durante la entrada y salida;
no es un diseño para archivos enormes ni para un servidor.

La constante `HELP` mantiene el texto de ayuda junto al comportamiento que
documenta. Se imprime en la salida estándar y no se mezcla con los errores.

## 3. Interpretar la línea de comandos

Node.js incluye el ejecutable y el script en `process.argv`. La aplicación
descarta esos dos elementos:

```javascript
parseArgs(process.argv.slice(2));
```

### 3.1 Convertir un criterio

Cada `--by` tiene esta forma:

```text
campo[:tipo[:orden]]
```

| Parte | Valor predeterminado | Valores admitidos |
|---|---|---|
| `campo` | ninguno | nombre o índice |
| `tipo` | `alpha` | `alpha`, `num` |
| `orden` | `asc` | `asc`, `desc` |

`parseSortField` separa el texto con `split(":")`, valida entre una y tres
partes y devuelve booleanos que el comparador puede usar directamente:

```javascript
return {
  name: name,
  numeric: type === "num",
  descending: order === "desc"
};
```

Por ejemplo:

| Entrada | Interpretación |
|---|---|
| `apellido` | texto ascendente |
| `edad:num` | número ascendente |
| `salario:num:desc` | número descendente |

Los valores predeterminados se aplican cuando una parte se omite, no cuando se
deja vacía. Por eso `edad::desc` y `edad:num:` son errores. También se rechazan
un campo vacío, más de tres partes, un tipo distinto de `alpha` o `num` y un
orden distinto de `asc` o `desc`.

### 3.2 Recorrer los argumentos

`parseArgs` parte de los valores predeterminados, recorre `args` con un índice
y guarda por separado los argumentos posicionales:

```javascript
const files = [];
let i = 0;

while (i < args.length) {
  const argument = args[i];
  // Procesar argument y, si corresponde, también args[i + 1].
  i = i + 1;
}
```

El índice permite que `--by` y `--delimiter` consuman el elemento siguiente.
Antes de consumirlo se comprueba que exista.

El comportamiento exacto de cada opción es:

| Opción | Decisión |
|---|---|
| `-h`, `--help` | marca `help` y devuelve la configuración inmediatamente; no exige archivos ni `--by` |
| `-nh`, `--no-header` | marca que todas las filas son datos |
| `-b`, `--by` | agrega un criterio; puede repetirse y conserva el orden escrito |
| `-d`, `--delimiter` | reemplaza la coma predeterminada |

El delimitador debe tener longitud `1`. Como una tabulación es incómoda de
escribir, el texto literal `\t` se convierte en `"\t"` antes de validar. En una
terminal POSIX puede usarse `-d "\t"`; en PowerShell, ``-d "`t"`` entrega una
tabulación real y también es válido.

Todo argumento no reconocido que comienza con `-` es una opción desconocida.
Los demás se agregan a `files`, de modo que las opciones pueden aparecer antes,
entre o después de los dos nombres de archivo.

Al finalizar, `parseArgs` exige exactamente dos archivos y al menos un
criterio. Informa por separado origen ausente, destino ausente, archivos de más
y ausencia de `--by`. Finalmente asigna:

```javascript
config.inputFile = files[0];
config.outputFile = files[1];
```

Esta interfaz no implementa `--opcion=valor` ni el separador `--`. Tampoco
permite usar como nombre posicional uno que comience con `-`.

## 4. Leer y convertir la entrada

### 4.1 `readInput`: obtener texto UTF-8

```javascript
function readInput(inputFile) {
  try {
    return readFileSync(inputFile, "utf8");
  } catch (error) {
    throw new Error(`No se pudo leer ${inputFile}: ${error.message}`);
  }
}
```

La codificación evita recibir un `Buffer`. El `try/catch` conserva el mensaje
del sistema y agrega el nombre del origen.

### 4.2 `parseDelimited`: formar una tabla rectangular

La implementación no es un parser CSV completo. Rechaza cualquier comilla
doble porque, si la aceptara, también tendría que interpretar delimitadores,
comillas y saltos de línea escapados dentro de un campo:

```javascript
if (text.includes('"')) {
  throw new Error("La entrada contiene comillas dobles, que no están admitidas");
}
```

Luego reconoce `\r\n`, `\n` y la variante histórica `\r`:

```javascript
const lines = text.split(/\r\n|\n|\r/);
```

`split` produce un string vacío cuando el archivo termina con un salto. Se
elimina exactamente ese último elemento. Una línea vacía interna, o un segundo
salto vacío al final, permanece como registro y participa de las validaciones.

Cada línea se divide con `line.split(delimiter)`. No existe escape: un campo no
puede contener el delimitador ni un salto de línea. Después se exige que todos
los registros tengan la misma cantidad de campos que el primero.

Finalmente se decide qué hacer con la primera fila:

```javascript
if (noHeader) {
  return { headers: null, rows: records };
}

const headers = records[0];
const rows = records.slice(1);
return { headers: headers, rows: rows };
```

`headers === null` identifica sin ambigüedad el modo `--no-header`; de lo
contrario, el primer registro nunca participa del ordenamiento.

Un texto completamente vacío se convierte en cero filas y cero columnas. El
parseo puede representarlo, pero una ejecución normal terminará luego con
`Campo inexistente`: la CLI exige un criterio y no hay ninguna columna a la
que aplicarlo. En cambio, un archivo que solo contiene un encabezado sí puede
ordenarse por uno de sus nombres y conservar ese encabezado.

## 5. Preparar y ordenar las filas

`sortRows` realiza tres tareas en orden: resolver columnas, validar números y
ordenar. Preparar todo antes de llamar a `sort` evita que el comparador también
tenga que validar.

### 5.1 Resolver cada columna una sola vez

Con encabezado, el nombre se busca con `headers.indexOf`. La coincidencia es
exacta y distingue mayúsculas; si un nombre está repetido se usa su primera
aparición.

Sin encabezado, `field.name` se convierte con `Number` y debe resultar en un
entero dentro del rango disponible:

```javascript
if (headers === null) {
  index = Number(field.name);
} else {
  index = headers.indexOf(field.name);
}

if (!Number.isInteger(index) || index < 0 || index >= fieldCount) {
  throw new Error(`Campo inexistente: ${field.name}`);
}
```

Por lo tanto, un criterio como `2` es un índice únicamente con `--no-header`.
Cuando hay encabezado busca literalmente una columna llamada `2`.

El resultado se guarda en `preparedFields` junto con `numeric` y
`descending`. Así la búsqueda de columnas no se repite por cada par de filas.

### 5.2 Validar todos los números

Antes de modificar el array se recorren todas las celdas de cada criterio
numérico:

```javascript
if (value.trim() === "" || Number.isNaN(Number(value))) {
  throw new Error(`Valor no numérico en el campo ${field.name}: ${value}`);
}
```

Se rechazan strings vacíos, espacios solos y cualquier texto para el que
`Number` produzca `NaN`. La definición numérica es exactamente la de `Number`
de JavaScript: admite, por ejemplo, espacios alrededor, decimales y notación
exponencial; no usa una expresión regular ni aritmética de precisión arbitraria.

### 5.3 Comparar por prioridad

El comparador recorre los criterios en el orden recibido:

```javascript
rows.sort(function (left, right) {
  for (const field of preparedFields) {
    const leftValue = left[field.index];
    const rightValue = right[field.index];
    let result;

    if (field.numeric) {
      result = Number(leftValue) - Number(rightValue);
    } else {
      result = leftValue.localeCompare(rightValue);
    }

    if (result !== 0) {
      return field.descending ? -result : result;
    }
  }

  return 0;
});
```

La resta da el orden numérico. `localeCompare` da el orden textual de la
configuración regional disponible en Node.js; la solución no fija reglas
propias para acentos ni mayúsculas.

Un criterio posterior solo se consulta si el anterior empata. Si todos
empatan, el comparador devuelve `0` y el orden estable de `Array.sort` conserva
el orden relativo original.

`sort` modifica `rows` en el lugar. Es intencional: la versión sin ordenar no
vuelve a usarse. `sortRows` devuelve ese mismo array para que el pipeline siga
siendo legible.

## 6. Reconstruir y escribir la salida

### 6.1 `serialize`: volver a texto

`serialize` agrega primero el encabezado, si existe y no está vacío, y después
las filas. Cada registro usa el mismo delimitador de entrada:

```javascript
let text = "";
for (const record of records) {
  text = text + record.join(delimiter) + "\n";
}
return text;
```

La salida usa siempre `\n`, aunque la entrada tuviera `\r\n` o `\r`, y todo
resultado no vacío termina con un salto de línea. Para cero registros devuelve
el string vacío. No se aplican escapes porque el formato admitido ya excluye
comillas, delimitadores y saltos dentro de los campos.

La concatenación prioriza una implementación fácil de seguir. Igual que la
lectura sincrónica, supone archivos que pueden mantenerse completos en memoria.

### 6.2 `writeOutput`: crear o reemplazar el destino

```javascript
function writeOutput(text, outputFile) {
  try {
    writeFileSync(outputFile, text, "utf8");
  } catch (error) {
    throw new Error(`No se pudo escribir ${outputFile}: ${error.message}`);
  }
}
```

La escritura crea el archivo si no existe y reemplaza su contenido si existe,
sin pedir confirmación. Se escribe directamente: no se usa un archivo temporal
ni un reemplazo atómico. El error agrega la ruta de destino al mensaje del
sistema.

## 7. Coordinar las seis etapas

El punto de entrada refleja el pipeline completo:

```javascript
try {
  const config = parseArgs(process.argv.slice(2));

  if (config.help) {
    process.stdout.write(HELP);
  } else {
    const input = readInput(config.inputFile);
    const data = parseDelimited(input, config.delimiter, config.noHeader);
    const sortedRows = sortRows(data.rows, data.headers, config.sortFields);
    const output = serialize(data.headers, sortedRows, config.delimiter);
    writeOutput(output, config.outputFile);
  }
} catch (error) {
  console.error(`Error: ${error.message}`);
  process.exitCode = 1;
}
```

`--help` evita todas las operaciones sobre archivos. En una ejecución correcta
no se imprime un mensaje de éxito y Node.js termina con código `0`. Cualquier
error de las etapas llega al único `catch`, se muestra en la salida de error con
el prefijo `Error:` y establece el código de salida `1`.

Usar `process.exitCode` permite que Node.js termine normalmente después de
vaciar sus salidas, en vez de interrumpir el proceso dentro de cada función.

## 8. Recorrido de un ejemplo

Con este archivo:

```csv
nombre,departamento,salario
Ana,Diseño,72000
Carlos,Ingeniería,85000
María,Ingeniería,88000
Pedro,Diseño,65000
```

y este comando:

```bash
node sortx.js empleados.csv ordenados.csv -b departamento -b salario:num:desc
```

ocurre lo siguiente:

1. `parseArgs` conserva los criterios `departamento` y `salario` en ese orden.
2. `readInput` obtiene un único string UTF-8.
3. `parseDelimited` separa el encabezado de las cuatro filas.
4. `sortRows` resuelve los índices `1` y `2`, valida todos los salarios y
   ordena primero por departamento y luego por salario descendente.
5. `serialize` reconstruye el CSV con `\n`.
6. `writeOutput` crea o reemplaza `ordenados.csv`.

El resultado es:

```csv
nombre,departamento,salario
Ana,Diseño,72000
Pedro,Diseño,65000
María,Ingeniería,88000
Carlos,Ingeniería,85000
```

## 9. Verificación mínima

Desde `enunciados/tp1`, probar la interfaz pública:

```bash
# Ayuda: no requiere archivos ni criterio.
node desarrollo.js --help

# Texto ascendente con encabezado.
node desarrollo.js empleados.csv salida.csv -b apellido

# Número descendente.
node desarrollo.js empleados.csv salida.csv -b salario:num:desc

# Varios criterios, en orden de prioridad.
node desarrollo.js empleados.csv salida.csv \
  -b departamento \
  -b salario:num:desc

# Sin encabezado: la tercera columna tiene índice 2.
node desarrollo.js datos.csv salida.csv -nh -b 2:num:desc

# Otro delimitador.
node desarrollo.js datos.tsv salida.tsv -d "\t" -b nombre
```

También deben comprobarse los errores exigidos por el enunciado: argumento u
opción faltante, opción desconocida, criterio inválido, delimitador de longitud
distinta de uno, archivo ilegible, destino no escribible, comillas dobles,
filas no rectangulares, campo inexistente y valor no numérico.

## 10. Alcance de la solución

Las decisiones centrales quedan resumidas así:

| Decisión | Consecuencia |
|---|---|
| seis funciones y un auxiliar | cada etapa tiene un contrato pequeño y los errores se detectan cerca de su causa |
| arrays de strings | se conserva el contenido original y las columnas se acceden por índice |
| lectura y escritura sincrónicas | el flujo es lineal, pero bloquea y mantiene el archivo completo en memoria |
| formato delimitado sin comillas | el parser puede usar `split`; no es un parser CSV general |
| validación previa al ordenamiento | el comparador solo compara datos ya preparados |
| `localeCompare` y `Number` | se usan las reglas nativas de JavaScript para texto y números |
| ordenamiento en el lugar | no se crea una copia que la aplicación no necesita |
| mismo delimitador y saltos `\n` | se conserva el separador de campos, pero se normalizan los saltos de línea |
| escritura directa | el destino se crea o sobrescribe; no hay confirmación ni reemplazo atómico |
| un único `catch` | todos los errores tienen el mismo formato y código de salida |

Estas elecciones cumplen el alcance didáctico del práctico. Soportar CSV con
comillas, archivos mayores que la memoria, reglas de orden configurables o
escritura atómica requeriría cambiar el diseño, no solamente agregar una
condición aislada.
