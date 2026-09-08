# Desarrollo del editor de CSV

Este tutorial explica las decisiones de diseño de [`csv.jsx`](./csv.jsx) y cómo
se conectan sus partes. Sigue el enfoque de
[`desarrollo.md` del TP1](../tp1/desarrollo.md): presentar un problema, mostrar
el código que lo resuelve y explicar las consecuencias de la elección.

## 1. Diseño general: una aplicación que responde a eventos

El editor debe permanecer abierto mientras el usuario navega, modifica valores
y guarda archivos. Por eso el programa organiza su trabajo alrededor de un
estado y de las acciones que lo cambian.

```text
Tecla o confirmación → acción → cambio de estado → actualización de pantalla
```

La lectura y escritura quedan en funciones independientes. `App` coordina las
acciones y conserva los datos compartidos. Los componentes visuales reciben
esos datos mediante propiedades y construyen la pantalla con Ink.

```javascript
import React, {useState} from 'react';
import {render, Box, Text, useInput, useApp} from 'ink';
import {readFile, writeFile} from 'node:fs/promises';
import {TextInput} from '@inkjs/ui';
import {basename} from 'node:path';
```

`useState` permite conservar información entre renderizados. Ink aporta la
organización visual (`Box`), el texto (`Text`), el teclado (`useInput`) y la
salida de la aplicación (`useApp`). Se delega la escritura interactiva a
`TextInput` para no implementar manualmente el cursor, el borrado y la
confirmación de cada campo.

## 2. Representar una tabla con arreglos de strings

El archivo:

```csv
nombre,edad
Ana,25
Luis,30
```

se transforma en:

```javascript
{
    titulos: ['nombre', 'edad'],
    registros: [
        ['Ana', '25'],
        ['Luis', '30']
    ]
}
```

Las filas son arreglos porque la navegación identifica cada celda por su
posición: `datos[fila][columna]`. Esto permite trabajar con cualquier cabecera
sin escribir propiedades específicas como `empleado.edad`. También conserva
el orden de las columnas y permite representar títulos repetidos.

La cabecera se guarda por separado para que no participe de la edición de
celdas ni del ordenamiento de los registros.

Los valores permanecen como strings. Convertir toda columna aparentemente
numérica al leer alteraría datos como `00123`. El editor conserva ese texto en
memoria y aplica el formato numérico únicamente al dibujar la celda. La vista
puede mostrar `123`, pero guardar sin editar conserva `00123`.

## 3. Leer el CSV con el formato mínimo del enunciado

El práctico admite cabecera, campos separados por comas y un registro por
línea. Los campos no contienen comas, comillas ni saltos internos. Esa
restricción permite resolver la lectura con `split`:

```javascript
async function leerCSV(archivo) {
    const [titulos, ...registros] = (await readFile(archivo, 'utf8'))
        .replace(/\r/g, '')
        .replace(/\n$/, '')
        .split('\n')
        .map(linea => linea.split(','));

    return {titulos, registros};
}
```

La codificación `utf8` hace que `readFile` entregue texto. `await` espera la
lectura antes de aplicar las transformaciones. Se usan operaciones asincrónicas
para que la espera del sistema de archivos no bloquee el hilo de JavaScript;
la división del contenido en arreglos sí se realiza sincrónicamente y el
archivo completo queda en memoria.

Las transformaciones tienen motivos concretos:

| Operación | Motivo |
| --- | --- |
| `.replace(/\r/g, '')` | Quitar el retorno de carro de los saltos `\r\n`. |
| `.replace(/\n$/, '')` | Evitar una fila vacía artificial por un salto final. |
| `.split('\n')` | Obtener las líneas. |
| `.map(linea => linea.split(','))` | Convertir cada línea en campos. |
| `[titulos, ...registros]` | Separar la primera fila de los datos. |

No se usa `trim()` sobre todo el archivo porque también eliminaría espacios
que podrían pertenecer al primer o último campo. Se elimina exactamente un
salto final; una línea vacía interna o un segundo salto final permanecen.

Esta función supone que el archivo cumple el formato. No comprueba filas de
igual longitud ni rechaza comillas. Tampoco interpreta archivos que usan solo
`\r` para separar registros: elimina esos caracteres. Un archivo completamente
vacío produce `titulos: ['']` y cero registros, no una tabla sin columnas.

## 4. Guardar como operación inversa

Para escribir, se reconstruye el mismo modelo de líneas y campos:

```javascript
async function escribirCSV(archivo, titulos, registros) {
    const csv = [titulos, ...registros]
        .map(registro => registro.join(','))
        .join('\n');

    await writeFile(archivo, csv, 'utf8');
}
```

El primer `join` reúne los campos de una fila; el segundo reúne las filas.
Agregar los títulos al principio evita tratarlos con una lógica de escritura
diferente. No se agregan escapes porque el formato admitido no los necesita.

La salida usa `\n` y no agrega un salto después del último registro. Por lo
tanto, preserva los campos, pero puede cambiar los saltos de línea del archivo
original. `writeFile` crea o reemplaza el destino directamente.

Las funciones de archivos dejan que los errores lleguen al código que las
llama. La interfaz es quien sabe dónde mostrar el mensaje y si debe mantener
abierto el pedido de nombre.

## 5. Abrir el argumento antes de mostrar la interfaz

Hay dos formas de elegir el archivo: pasarlo al iniciar o escribir su nombre
dentro de la aplicación. La primera se resuelve una sola vez, fuera de `App`:

```javascript
const archivoInicial = process.argv[2] ?? '';
let inicial = {titulos: [], registros: []};
let errorInicial = '';
if (archivoInicial) {
    try {
        inicial = await leerCSV(archivoInicial);
    } catch (error) {
        errorInicial = error.message;
    }
}
```

Node.js reserva las dos primeras posiciones de `process.argv` para el ejecutable
y el script. La tercera contiene el nombre recibido. `?? ''` establece un texto
vacío cuando no existe ese argumento.

Leer antes de `render` permite iniciar con los datos disponibles y evita
repetir la lectura cada vez que React ejecuta `App`. La contrapartida es que la
pantalla aparece después de terminar ese intento inicial; no hay una pantalla
de carga durante esa espera. El `await` de nivel superior se usa en un módulo ES.

Si falla, se conserva el error para mostrarlo y se permite elegir otro archivo.
No se termina el proceso por un nombre inicial incorrecto.

## 6. Elegir qué información necesita estado

`App` concentra lo que comparten la tabla, la entrada y el pie:

```javascript
const [archivo, setArchivo] = useState(errorInicial ? '' : archivoInicial);
const [titulos, setTitulos] = useState(inicial.titulos);
const [datos, setDatos] = useState(inicial.registros);
const [modo, setModo] = useState(!archivoInicial || errorInicial ? 'abrir' : null);
const [mensaje, setMensaje] = useState(errorInicial);
const [hayError, setHayError] = useState(Boolean(errorInicial));
const [fila, setFila] = useState(0);
const [columna, setColumna] = useState(0);
```

Se guarda la posición seleccionada, pero no una copia del valor seleccionado.
Este se obtiene de los datos:

```javascript
valor={datos[fila]?.[columna] ?? ''}
```

Así, después de editar u ordenar no hay que sincronizar un segundo estado con
el valor de la celda. `?.` y `??` permiten mostrar un texto vacío cuando todavía
no existe esa posición.

El modo se representa con un único valor:

| `modo` | Qué está haciendo el usuario |
| --- | --- |
| `null` | Navegar o elegir un comando. |
| `'abrir'` | Escribir el nombre de un archivo de entrada. |
| `'guardar'` | Escribir el nombre del destino. |
| `'editar'` | Modificar el texto de una celda. |

Usar un solo modo evita combinaciones contradictorias que serían posibles con
tres booleanos independientes, como abrir y editar simultáneamente.

## 7. Separar la pantalla en componentes

La composición principal refleja las cuatro zonas de la interfaz. Este es un
esquema abreviado de su estructura:

```jsx
<Pantalla>
    <Encabezado archivo={archivo} filas={datos.length} columnas={titulos.length} />
    <Entrada archivo={archivo} valor={datos[fila]?.[columna] ?? ''}
        modo={modo}
        onSubmit={modo === 'editar' ? actualizarCelda : seleccionarArchivo} />
    <Tabla titulos={titulos} datos={datos} fila={fila} columna={columna} />
    <Pie mensaje={mensaje} hayError={hayError} modo={modo}
        fila={datos.length ? fila + 1 : 0}
        columna={titulos.length ? columna + 1 : 0} />
</Pantalla>
```

La separación permite cambiar el dibujo de una celda sin tocar la lectura de
archivos, o cambiar los mensajes sin modificar el desplazamiento de la tabla.
`App` pasa funciones como propiedades para que los componentes informen una
confirmación sin hacerse responsables de los datos globales.

`Pantalla` usa `flexDirection="column"` para apilar las zonas. El encabezado y
el pie distribuyen sus extremos con `justifyContent="space-between"`. Las
partes variables pueden reducirse y truncarse; los contadores usan
`flexShrink={0}` para conservar espacio.

`basename(archivo)` muestra solamente el nombre en el encabezado. El estado
conserva la ruta completa porque las operaciones de archivos la necesitan.
Los colores se concentran en `COLORES`, de modo que éxito, error y selección
mantengan el mismo significado en toda la pantalla.

## 8. Resolver el formato una sola vez en `Celda`

Todas las celdas necesitan un ancho fijo, alineación y una forma de destacar la
selección. Esa lógica se concentra en un componente reutilizable:

```javascript
const contenido = String(valor ?? '');
const texto = (derecha && !encabezado && contenido.trim()
    ? formatoNumero.format(contenido.trim())
    : contenido).slice(0, ancho);
```

Primero se obtiene texto, luego se aplica formato si corresponde y finalmente
se recorta al ancho disponible. Para ocupar siempre ese ancho se completa con
espacios:

```jsx
{derecha ? texto.padStart(ancho) : texto.padEnd(ancho)}
```

`padStart` alinea a la derecha; `padEnd`, a la izquierda. Esto mantiene las
columnas alineadas aunque sus valores tengan longitudes distintas.

Se distinguen dos señales: `seleccionada` identifica la celda que se editará y
`activa` destaca su número de fila o su título de columna. El fondo blanco de
la celda seleccionada tiene prioridad sobre los demás estilos.

### Detectar columnas numéricas para dibujarlas

La decisión se toma mirando todos los valores no vacíos de cada columna:

```javascript
const numericas = titulos.map((_, c) => {
    const valores = datos.map(registro => (registro[c] ?? '').trim()).filter(Boolean);
    return valores.length > 0 && valores.every(valor =>
        /^[+-]?(?:\d+(?:\.\d*)?|\.\d+)(?:e[+-]?\d+)?$/i.test(valor)
    );
});
```

`every` evita clasificar la columna por una única fila. `valores.length > 0`
evita que una columna vacía se considere numérica, dado que `every` devuelve
`true` para un arreglo vacío.

La expresión admite signo opcional, decimales con punto y exponente, como `-12`,
`3.5`, `.5` o `2e3`. No acepta números ya formateados con separadores locales.
`Intl.NumberFormat('es-AR')` se encarga de la presentación posterior.

Esta detección se recalcula al renderizar `Tabla`. Es simple y refleja las
ediciones inmediatamente, pero recorre los datos aunque solo se haya movido el
cursor. Además, determina la presentación; el ordenamiento tiene su propio
comparador, explicado más adelante.

## 9. Separar selección y ventana visible

La celda seleccionada pertenece a la tabla completa. La ventana visible indica
qué parte cabe en pantalla. Son datos distintos: moverse una fila no debería
desplazar toda la vista si la nueva celda ya estaba visible.

Los tamaños se fijan a partir de la terminal al iniciar:

```javascript
const ANCHO = 20;
const ANCHO_NUMERICO = 12;
const NUMERO = 6;
const SEPARACION = 2;
const FILAS = Math.max(1, (process.stdout.rows || 24) - 11);
const ESPACIO_COLUMNAS = Math.max(1, (process.stdout.columns || 80) - NUMERO - 4 - SEPARACION);
```

Se reserva espacio para el marco, las demás zonas y los números de fila. Los
valores `24` y `80` son alternativas cuando no se informan dimensiones.
`Math.max(1, ...)` evita una capacidad nula o negativa; no garantiza que toda
la interfaz quepa en una terminal extremadamente pequeña.

### 9.1 Desplazamiento vertical

`Tabla` conserva el inicio de la vista y lo ajusta cuando la selección sale de
sus bordes:

```javascript
const [vista, setVista] = useState({fila: 0, columna: 0});

const inicioFila = fila < vista.fila ? fila
    : fila >= vista.fila + FILAS ? fila - FILAS + 1
    : vista.fila;

const filasVisibles = datos.slice(inicioFila, inicioFila + FILAS);
```

Si caben cinco filas y el inicio es `0`, se ven los índices `0` a `4`. Moverse
al índice `3` conserva la ventana. Moverse al `5` cambia el inicio a
`5 - 5 + 1 = 1`, por lo que se ven los índices `1` a `5`. Al subir por encima
del inicio, la selección pasa a ser la primera fila visible.

### 9.2 Desplazamiento horizontal

Las columnas tienen anchos diferentes. No alcanza con decidir que siempre se
muestren tres: hay que sumar sus anchos y separaciones.

```javascript
const anchos = numericas.map(numerica => numerica ? ANCHO_NUMERICO : ANCHO);
let inicioColumna = Math.min(vista.columna, columna);
let ocupado = anchos.slice(inicioColumna, columna + 1)
    .reduce((total, ancho) => total + ancho + SEPARACION, -SEPARACION);

while (ocupado > ESPACIO_COLUMNAS && inicioColumna < columna) {
    ocupado -= anchos[inicioColumna] + SEPARACION;
    inicioColumna++;
}
```

El cálculo incluye desde el inicio hasta la selección. El acumulador comienza
en `-SEPARACION` porque entre `n` columnas hay `n - 1` separaciones. Si sobra
ancho ocupado, se quitan columnas de la izquierda hasta incluir la seleccionada
dentro del espacio disponible, siempre que su propio ancho quepa.

Después se agregan columnas a la derecha mientras entren:

```javascript
let finColumna = columna + 1;
while (finColumna < titulos.length && ocupado + SEPARACION + anchos[finColumna] <= ESPACIO_COLUMNAS) {
    ocupado += SEPARACION + anchos[finColumna];
    finColumna++;
}
```

El inicio calculado se guarda solamente si cambió:

```javascript
if (inicioFila !== vista.fila || inicioColumna !== vista.columna) {
    setVista({fila: inicioFila, columna: inicioColumna});
}
```

Es una actualización condicional del estado del propio componente durante su
renderizado. La condición permite que el siguiente renderizado se estabilice;
una llamada incondicional volvería a provocar actualizaciones continuamente.

Al recortar las columnas se conserva su índice original:

```javascript
const columnas = titulos.slice(inicioColumna, finColumna).map((titulo, c) => ({
    indice: inicioColumna + c,
    titulo,
    ancho: anchos[inicioColumna + c],
    numerica: numericas[inicioColumna + c],
}));
```

Esto es necesario porque la primera columna visible puede ser la quinta del
archivo. Usar el índice local `c` para acceder al registro mostraría un campo
equivocado después de desplazar la vista.

## 10. Reutilizar la entrada mediante modos

Abrir, guardar y editar requieren escribir un texto y confirmarlo. Se usa un
solo componente y se cambia su etiqueta y valor inicial:

```javascript
const etiquetas = {abrir: 'Abrir', guardar: 'Guardar', editar: 'Editar'};
const inicial = modo === 'abrir' ? '' : modo === 'guardar' ? archivo : valor;
```

Abrir comienza vacío para pedir otro archivo. Guardar propone el nombre actual,
pero permite reemplazarlo. Editar parte del texto original de la celda, no del
número formateado para la tabla.

```jsx
<TextInput
    key={modo}
    defaultValue={inicial}
    placeholder={modo === 'editar' ? 'Escribí el nuevo valor…' : 'archivo.csv'}
    onSubmit={onSubmit}
/>
```

`defaultValue` inicializa el campo; su texto en edición queda a cargo de
`TextInput`. `key={modo}` hace que React cree una instancia nueva si cambia el
modo, evitando reutilizar el texto interno de otra operación. Cuando se vuelve
a navegación, la entrada se desmonta y en su lugar aparece el valor seleccionado.

La confirmación se conecta desde `App`:

```jsx
onSubmit={modo === 'editar' ? actualizarCelda : seleccionarArchivo}
```

Por eso `Entrada` no necesita saber cómo escribir un archivo ni cómo copiar una
fila: solamente recoge texto y llama a la función recibida.

## 11. Procesar el teclado en un orden deliberado

El mismo carácter puede ser un comando o parte de un texto. Por ejemplo, `a`
abre un archivo al navegar, pero debe escribirse normalmente dentro de `datos.csv`.
El orden de las condiciones resuelve esa diferencia:

```javascript
if (key.escape) {
    if (modo) {
        setModo(null);
    } else {
        exit();
    }
    return;
}
if (modo) {
    return;
}
```

**Esc** se procesa antes de salir por modo, para permitir cancelar una entrada.
Los demás comandos se ignoran durante el ingreso de texto y quedan a cargo de
`TextInput`. Al cancelar una edición, todavía no se llamó a `actualizarCelda`,
por lo que no hay un cambio que deshacer.

Al navegar se normalizan las letras para aceptar mayúsculas y minúsculas:

```javascript
const comando = tecla.toLowerCase();
if (!key.ctrl && (comando === 'a' || comando === 'g')) {
    if (comando === 'g' && !archivo) return;
    setModo(comando === 'a' ? 'abrir' : 'guardar');
    return;
}
```

La condición de `ctrl` evita interpretar esas combinaciones como comandos
simples. El guardado exige un archivo abierto; la apertura está disponible
aunque todavía no haya datos.

Las flechas actualizan índices con límites. Por ejemplo:

```javascript
if (key.upArrow)
    setFila(f => Math.max(0, f - 1));

if (key.downArrow)
    setFila(f => Math.max(0, Math.min(datos.length - 1, f + 1)));
```

Se usan actualizaciones funcionales porque la posición nueva depende de la
anterior. El límite inferior es cero y el superior es la última fila. El
`Math.max` exterior conserva cero incluso cuando no hay registros.

Finalmente se activan edición y ordenamiento:

```javascript
if (key.return && datos.length) setModo('editar');
if (tecla === '<' || tecla === '+') ordenar(1);
if (tecla === '>' || tecla === '-') ordenar(-1);
```

`+` y `-` son alternativas adicionales de esta implementación. La ayuda visible
muestra los comandos principales `<` y `>`.

## 12. Editar copiando solo lo que cambia

Modificar directamente `datos[fila][columna]` alteraría los arreglos que
pertenecen al estado actual. La solución crea nuevas referencias para la tabla
y para la fila modificada:

```javascript
function actualizarCelda(valor) {
    const nuevos = [...datos];
    nuevos[fila] = [...datos[fila]];
    nuevos[fila][columna] = valor;

    setDatos(nuevos);
    setModo(null);
}
```

La primera copia es superficial: el arreglo exterior es nuevo, pero sus filas
siguen siendo las mismas. Por eso hace falta copiar también `datos[fila]`
antes de asignar la celda. Las otras filas se comparten porque no se modifican.

Ejemplo: al reemplazar la edad de Ana por `26`, se crea una nueva fila
`['Ana', '26']`; la fila de Luis se conserva. No se necesita clonar toda la
tabla en profundidad para cambiar un string.

El cambio queda en memoria. Se separa edición de guardado para permitir varias
modificaciones antes de escribir el archivo o elegir otro nombre de destino.

## 13. Ordenar sin modificar el arreglo anterior

`sort` modifica el arreglo sobre el que se ejecuta. Como los datos pertenecen
al estado de React, primero se copia el arreglo exterior:

```javascript
function ordenar(sentido) {
    const ordenados = [...datos].sort((a, b) =>
        sentido * (a[columna] ?? '').localeCompare(
            b[columna] ?? '', 'es', {numeric: true}
        )
    );

    setDatos(ordenados);
    setFila(0);
}
```

Aquí basta una copia: se cambia el orden de las filas, pero ninguna celda.
La cabecera está en otro arreglo y no entra en la comparación.

El comparador consulta solamente la columna seleccionada. `localeCompare`
usa reglas del idioma español y `{numeric: true}` compara secuencias de dígitos
por su valor, de modo que `2` se ubique antes que `10`. Se obtiene una comparación
natural con una misma operación para texto y dígitos.

Esta elección tiene un límite: no es una resta de números convertidos con
`Number`. No garantiza orden matemático para negativos, decimales o exponentes.
La expresión regular de presentación no cambia este comparador.

`sentido` vale `1` para ascendente y `-1` para descendente. Multiplicar invierte
el signo del resultado sin duplicar la función. `setFila(0)` lleva la selección
al comienzo del resultado; la aplicación no intenta seguir al mismo registro
después de ordenarlo.

## 14. Confirmar archivos y conservar la posibilidad de corregir errores

`seleccionarArchivo` reúne las operaciones que parten de un nombre confirmado.
Primero valida que haya algo escrito:

```javascript
if (!nombre.trim()) {
    setMensaje('Ingresá el nombre del archivo.');
    setHayError(true);
    return;
}
```

`trim()` se usa para la comprobación. La ruta enviada al sistema sigue siendo
`nombre`, de modo que no se eliminan espacios de un nombre no vacío.

La parte central distingue abrir de guardar:

```javascript
try {
    if (modo === 'abrir') {
        const contenido = await leerCSV(nombre);
        setTitulos(contenido.titulos);
        setDatos(contenido.registros);
        setFila(0);
        setColumna(0);
        setMensaje(`Abierto: ${nombre}`);
    } else {
        await escribirCSV(nombre, titulos, datos);
        setMensaje(`Guardado: ${nombre}`);
    }
    setArchivo(nombre);
    setHayError(false);
    setModo(null);
} catch (error) {
    setMensaje(error.message);
    setHayError(true);
}
```

Al abrir, los datos se reemplazan después de que la lectura termina bien. Si
falla, la tabla anterior permanece. Reiniciar ambos índices evita conservar
una posición que no exista en el archivo nuevo.

Al guardar, el mensaje de éxito aparece después de `await escribirCSV`. En
ambas operaciones se actualiza el nombre y se vuelve a navegación solamente
al completar la operación. El `catch` conserva el modo para que el usuario
pueda corregir el nombre y reintentar.

El pie muestra el mensaje con color de éxito o error. Al llegar la siguiente
entrada de teclado se limpia el mensaje para recuperar la ayuda de comandos.
No se agrega un temporizador ni un estado de carga; durante una operación
asincrónica no se bloquean nuevas confirmaciones.

## 15. Recorrido completo de una edición

Con el CSV del comienzo, una sesión puede seguir estos pasos:

| Acción | Cambio interno | Resultado visible |
| --- | --- | --- |
| Iniciar con el archivo como argumento | Se cargan títulos y registros; `modo` queda en `null`. | Tabla con Ana seleccionada. |
| Presionar flecha derecha | `columna` pasa de `0` a `1`. | Se selecciona `25`. |
| Presionar Enter | `modo` pasa a `'editar'`. | Entrada inicializada con `25`. |
| Reemplazar por `26` y confirmar | Se copia la tabla y la fila; se actualiza la celda. | Ana tiene edad `26` en memoria. |
| Presionar G | `modo` pasa a `'guardar'`. | Se solicita el destino con el nombre actual como propuesta. |
| Escribir otro nombre y confirmar | Se serializan y escriben los datos. | Mensaje de guardado y nuevo nombre en el encabezado. |

El destino contiene:

```csv
nombre,edad
Ana,26
Luis,30
```

La última línea del programa pone en marcha este recorrido:

```jsx
render(<App />);
```

Desde ese momento, la interfaz se actualiza a partir del estado y las acciones
registradas por los componentes.

## 16. Verificación y alcance

Estas son pruebas manuales propuestas para comprobar las decisiones anteriores:

| Prueba | Qué permite comprobar |
| --- | --- |
| Abrir mediante argumento y luego mediante A. | Las dos formas de carga y el pedido de nombre. |
| Ingresar un nombre inexistente. | El error queda en pantalla y permite reintentar. |
| Recorrer una tabla mayor que la terminal. | La selección mantiene sus índices y la ventana se desplaza. |
| Escribir `a` y `g` durante una edición. | Las letras se ingresan sin activar comandos. |
| Editar y cancelar con Esc. | El dato original sigue intacto. |
| Editar, guardar con otro nombre y reabrir. | La modificación llega al archivo elegido. |
| Ordenar valores `2`, `10` y `20` en ambos sentidos. | La comparación natural y la inversión del orden. |
| Abrir un archivo con solo cabecera. | No se habilita la edición de una fila inexistente. |

Las decisiones mantienen el alcance acotado del práctico. Se conserva todo el
archivo en memoria, se suponen filas rectangulares y campos compatibles con el
CSV simple, y no se impide introducir una coma durante una edición. Agregar esa
coma produciría un campo adicional al volver a leer el archivo.

Tampoco hay seguimiento de cambios pendientes, confirmación al sobrescribir o
salir, escritura mediante reemplazo atómico ni recálculo de dimensiones al
redimensionar la terminal. Estas capacidades requerirían ampliar el estado,
las validaciones o el manejo de eventos de la solución actual.
