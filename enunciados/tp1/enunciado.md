# Trabajo Práctico — Herramienta CLI: `sortx`

## Descripción

Desarrollar una herramienta de línea de comandos llamada **`sortx`** que lea
un archivo de texto delimitado, ordene sus filas según los criterios indicados
y escriba el resultado en otro archivo.

La herramienta debe ser un único archivo `sortx.js`, ejecutable con Node.js y
sin dependencias externas.

## Sintaxis

```text
node sortx.js origen destino [-b|--by campo[:tipo[:orden]]]...
      [-d|--delimiter delimitador]
      [-nh|--no-header]
      [-h|--help]
```

Los archivos de origen y destino son obligatorios, excepto cuando se utiliza
`--help`.

## Argumentos

| Posición   | Descripción                                     |
|------------|-------------------------------------------------|
| `origen`   | Archivo delimitado que se desea ordenar.        |
| `destino`  | Archivo donde se guardará el resultado.         |

## Opciones

| Opción larga   | Corta | Descripción                                                               |
|----------------|-------|---------------------------------------------------------------------------|
| `--by`         | `-b`  | Campo por el que ordenar. Se puede repetir.                               |
| `--delimiter`  | `-d`  | Delimitador. El valor predeterminado es `,`. Usar `\t` para tabulación.   |
| `--no-header`  | `-nh` | Indica que el archivo no tiene encabezado.                                |
| `--help`       | `-h`  | Muestra la ayuda y termina.                                               |

## Criterios de ordenamiento

Cada valor de `--by` tiene el formato:

```text
campo[:tipo[:orden]]
```

- **`campo`**: nombre de la columna o índice numérico si no hay encabezado.
- **`tipo`**:
  - `alpha`: comparación alfabética. Es el valor predeterminado.
  - `num`: comparación numérica.
- **`orden`**:
  - `asc`: ascendente. Es el valor predeterminado.
  - `desc`: descendente.

### Ejemplos

| Expresión           | Significado                                             |
|---------------------|---------------------------------------------------------|
| `apellido`          | Orden alfabético ascendente por apellido.               |
| `salario:num`       | Orden numérico ascendente por salario.                  |
| `salario:num:desc`  | Orden numérico descendente por salario.                 |
| `2:num:asc`         | Orden numérico ascendente por la columna de índice 2.   |

## Formato de los archivos

El programa debe admitir archivos delimitados por un único carácter, por
ejemplo:

- CSV separado por comas;
- TSV separado por tabulaciones;
- PSV separado por barras verticales;
- archivos separados por punto y coma.

Los campos entre comillas no están admitidos. Ningún campo puede contener el
delimitador ni un salto de línea.

Todas las filas deben tener la misma cantidad de campos. Si una fila tiene una
cantidad diferente, el programa debe informar un error.

El archivo de destino debe conservar el mismo delimitador utilizado para leer
el archivo de origen.

## Comportamiento esperado

### Con encabezado

De manera predeterminada, la primera fila se considera el encabezado. Esta fila
debe mantenerse al comienzo del archivo de destino y no debe participar del
ordenamiento.

```bash
node sortx.js empleados.csv ordenados.csv -b apellido
```

### Sin encabezado

Con `--no-header`, todas las filas son datos y las columnas se identifican por
su índice desde cero.

```bash
node sortx.js datos.csv ordenados.csv --no-header -b 2:num:desc
```

### Ordenamiento múltiple

Cuando se especifican varios criterios, se aplican en el orden en que aparecen.
El criterio siguiente se utiliza solamente cuando el anterior produce un
empate.

```bash
node sortx.js empleados.csv ordenados.csv \
  -b departamento \
  -b salario:num:desc
```

Este comando ordena alfabéticamente por departamento y, dentro de cada
departamento, por salario de mayor a menor.

### Delimitador personalizado

```bash
node sortx.js datos.tsv ordenados.tsv -d "\t" -b nombre
node sortx.js datos.psv ordenados.psv -d "|" -b nombre
node sortx.js datos.txt ordenados.txt -d ";" -b nombre
```

## Ejemplos de uso

```bash
# Ordenar por apellido
node sortx.js empleados.csv ordenados.csv -b apellido

# Ordenar por salario descendente
node sortx.js empleados.csv salarios.csv -b salario:num:desc

# Utilizar múltiples criterios
node sortx.js empleados.csv resultado.csv \
  -b departamento \
  -b salario:num:desc

# Ordenar un archivo sin encabezado
node sortx.js datos.csv resultado.csv -nh -b 1:alpha:asc

# Mostrar la ayuda
node sortx.js --help
```

## Ejecución en Windows

Se debe tener instalado Node.js. Para comprobarlo, abrir PowerShell o el
símbolo del sistema y ejecutar:

```powershell
node --version
```

Desde la carpeta que contiene `sortx.js`:

```powershell
node .\sortx.js empleados.csv ordenados.csv -b apellido
node .\sortx.js empleados.csv salarios.csv -b salario:num:desc
node .\sortx.js datos.tsv ordenados.tsv -d "`t" -b nombre
node .\sortx.js --help
```

## Diseño requerido

El programa debe organizarse mediante las siguientes funciones:

```text
1. parseArgs      → leer los argumentos y construir la configuración
2. readInput      → leer el archivo de origen
3. parseDelimited → convertir el texto en filas y columnas
4. sortRows       → ordenar las filas
5. serialize      → reconstruir el texto delimitado
6. writeOutput    → escribir el archivo de destino
```

El punto de entrada debe limitarse a invocar estas funciones en orden y manejar
los errores generales.

### Modelo de configuración

```javascript
{
  inputFile: "empleados.csv",
  outputFile: "ordenados.csv",
  delimiter: ",",
  noHeader: false,
  sortFields: [
    { name: "apellido", numeric: false, descending: false }
  ]
}
```

## Manejo de errores

El programa debe informar el error y finalizar con un código distinto de cero
cuando ocurra alguna de estas situaciones:

- falta el archivo de origen o destino;
- se indica una opción desconocida;
- una opción no recibe su valor;
- no se especifica ningún criterio `--by`;
- el delimitador no es un único carácter;
- el archivo de origen no existe o no puede leerse;
- el archivo de destino no puede escribirse;
- las filas tienen diferente cantidad de campos;
- la entrada contiene comillas dobles;
- el campo solicitado no existe;
- un criterio numérico encuentra un valor no numérico.

Cada error debe mostrar un mensaje claro antes de finalizar.

## Archivo de prueba

Crear un archivo `empleados.csv` con este contenido:

```csv
nombre,apellido,edad,salario,departamento
Carlos,García,35,85000,Ingeniería
Ana,Martínez,28,72000,Diseño
Luis,Rodríguez,42,120000,Gerencia
María,López,31,88000,Ingeniería
Pedro,Sánchez,25,65000,Diseño
Laura,González,38,95000,Gerencia
```

## Casos de prueba mínimos

| Comando                                                                      | Resultado esperado                                      |
|------------------------------------------------------------------------------|---------------------------------------------------------|
| `node sortx.js empleados.csv salida.csv -b apellido`                         | Crea `salida.csv` con las filas ordenadas por apellido. |
| `node sortx.js empleados.csv salida.csv -b salario:num:desc`                 | Ordena los salarios de mayor a menor.                   |
| `node sortx.js empleados.csv salida.csv -b departamento -b salario:num:desc` | Ordena por departamento y luego por salario.            |
| `node sortx.js datos.csv salida.csv -nh -b 2:num:desc`                       | Ordena todas las filas usando la columna de índice 2.   |
| `node sortx.js empleados.csv salida.csv -b columnaInexistente`               | Informa un error y termina con código distinto de cero. |
| `node sortx.js empleados.csv`                                                | Informa que falta el archivo de destino.                |
| `node sortx.js --help`                                                       | Muestra la ayuda y termina con código cero.             |

## Entrega

- Un único archivo `sortx.js`.
- Debe ejecutarse con Node.js y sin instalar dependencias.
- Debe recibir obligatoriamente los archivos de origen y destino.

```bash
node sortx.js origen destino [opciones]
```
