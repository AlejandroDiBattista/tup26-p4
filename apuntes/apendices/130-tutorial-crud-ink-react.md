# Ink y React: de Hola Mundo a una Lista Editable

Vamos a construir una aplicación de terminal que muestra personas, permite recorrerlas con las flechas y presenta los datos de la persona seleccionada. Cada paso agrega una idea que necesitamos para el siguiente.

Usaremos JavaScript. Hace falta conocer funciones, objetos, arrays e importaciones. Los ejemplos están preparados con Ink 7.1.1, React 19.2.8 y tsx 4.23.13. Ink 7 requiere Node.js 22 o superior.

Las muestras de pantalla debajo de los programas completos corresponden a una terminal de 80 columnas. Se omiten los colores y la salida propia de npm; el indicador `›` permite reconocer la selección. En los ejemplos interactivos se muestra el estado inicial, salvo que se indique otra acción.

## 1. Construir el proyecto mínimo

Abrí una terminal y ejecutá, una línea por vez:

```bash
mkdir personas-ink
cd personas-ink
npm init -y
npm pkg set type=module
npm install ink@7.1.1 react@19.2.8
```

`mkdir` crea la carpeta y `cd` entra en ella. `npm init -y` crea un `package.json` con valores iniciales. Ese archivo describe el proyecto y registra sus dependencias.

`npm pkg set type=module` agrega `"type": "module"` al `package.json`. Así nuestros archivos `.js` pueden usar `import` y `export` como módulos de JavaScript.

Instalamos dos bibliotecas: React nos permite describir la interfaz mediante componentes; Ink lleva esa interfaz a la terminal. Más adelante veremos cómo se reparten el trabajo.

Fijamos las versiones para que el proyecto del tutorial sea reproducible. Conservá también el `package-lock.json` que genera npm.

## 2. Hola Mundo con createElement

Creá un archivo llamado `index.js`:

```js
import { createElement } from 'react';
import { render, Text } from 'ink';

const saludo = createElement(Text, null, 'Hola, mundo');

render(saludo);
```

**Salida en la terminal:**

```text
Hola, mundo
```

Ejecutalo:

```bash
node index.js
```

La terminal mostrará `Hola, mundo`.

Leamos la línea central:

```js
createElement(Text, null, 'Hola, mundo');
```

Su forma general es:

```js
createElement(tipo, propiedades, ...hijos);
```

| Argumento     | En el ejemplo   | Qué representa                             |
| ------------- | --------------- | ------------------------------------------ |
| `tipo`        | `Text`          | El componente que queremos usar.           |
| `propiedades` | `null`          | Su configuración; aquí no pasamos ninguna. |
| `hijos`       | `'Hola, mundo'` | El contenido que colocamos dentro.         |

`createElement` devuelve un objeto que describe un elemento de React. Todavía no escribe en la terminal. `render`, que importamos de Ink, recibe esa descripción y pone en marcha su representación. [Referencia de createElement](https://react.dev/reference/react/createElement).

Podemos configurar el texto pasando un objeto en lugar de `null`:

```js
const saludo = createElement(
  Text,
  { color: 'green', bold: true },
  'Hola, mundo'
);
```

Las propiedades de un componente se suelen llamar **props**. En este caso pedimos texto verde y en negrita.

## 3. Construir una composición

Una aplicación necesita combinar elementos. Agreguemos un título y un subtítulo. Reemplazá todo `index.js` por:

```js
import { createElement } from 'react';
import { render, Box, Text } from 'ink';

const pantalla = createElement(
  Box,
  { flexDirection: 'column' },
  createElement(Text, { bold: true }, 'Personas'),
  createElement(Text, { color: 'gray' }, 'Nuestra primera aplicación')
);

render(pantalla);
```

**Salida en la terminal:**

```text
Personas
Nuestra primera aplicación
```

Ejecutalo otra vez con `node index.js`.

Acá aparece `Box`, el contenedor que organiza los elementos. `flexDirection: 'column'` coloca sus hijos uno debajo del otro. `Text` se ocupa del texto.

La estructura ya se puede describir como un árbol: una caja contiene dos textos. Las llamadas anidadas representan esa relación. Cuando el árbol crezca, vamos a necesitar una forma más cómoda de leerlo.

## 4. Escribir la misma estructura con JSX

JSX es una extensión de la sintaxis de JavaScript que permite escribir elementos mediante etiquetas. Por ejemplo, estas dos expresiones describen lo mismo:

```js
createElement(Text, { color: 'green', bold: true }, 'Hola, mundo');
```

```jsx
<Text color="green" bold>Hola, mundo</Text>
```

La composición anterior queda así:

```jsx
<Box flexDirection="column">
  <Text bold>Personas</Text>
  <Text color="gray">Nuestra primera aplicación</Text>
</Box>
```

Ahora el anidamiento se ve directamente. JSX se transforma en llamadas JavaScript: nosotros escribimos etiquetas y una herramienta realiza la traducción. Con la transformación clásica se producen llamadas a `React.createElement`; las transformaciones modernas también pueden usar funciones de `react/jsx-runtime`. La equivalencia anterior sirve para entender qué estamos describiendo. [JSX en React](https://react.dev/learn/writing-markup-with-jsx), [createElement y JSX](https://react.dev/reference/react/createElement#creating-an-element-without-jsx).

Las reglas que usaremos son pocas:

| Escrito en JSX     | Significado                                        |
| ------------------ | -------------------------------------------------- |
| `color="green"`    | Pasar un string.                                   |
| `width={40}`       | Pasar un número.                                   |
| `bold={true}`      | Pasar un booleano.                                 |
| `bold`             | Abreviatura de `bold={true}`.                      |
| `{persona.nombre}` | Insertar el resultado de una expresión JavaScript. |
| `<Persona />`      | Usar un componente sin contenido hijo.             |

Los componentes propios empiezan con mayúscula. Las etiquetas deben cerrarse y una expresión JSX necesita una raíz que agrupe su contenido; en nuestros ejemplos usaremos `Box`.

## 5. Ejecutar JSX con tsx

Nuestro primer programa era JavaScript que Node podía ejecutar directamente. Ahora incluimos etiquetas JSX y necesitamos transformarlas antes de ejecutarlas.

**JSX es la sintaxis; `tsx` es la herramienta que vamos a usar para ejecutarla.** `tsx` también sirve para TypeScript, pero podemos usarlo con JavaScript y archivos `.jsx`.

Instalalo en el proyecto:

```bash
npm install --save-dev tsx@4.23.13
npm pkg set scripts.start="tsx index.jsx"
```

`--save-dev` lo registra como herramienta de desarrollo. El segundo comando agrega este script al `package.json`:

```json
"scripts": {
  "start": "tsx index.jsx"
}
```

Ese fragmento muestra la propiedad modificada; no reemplaces todo tu `package.json` por él.

Renombrá `index.js` a `index.jsx` desde tu editor y reemplazá su contenido por:

```jsx
import React from 'react';
import { render, Box, Text } from 'ink';

const pantalla = (
  <Box flexDirection="column">
    <Text bold>Personas</Text>
    <Text color="gray">Nuestra primera aplicación</Text>
  </Box>
);

render(pantalla);
```

**Salida en la terminal:**

```text
Personas
Nuestra primera aplicación
```

Ejecutá:

```bash
npm start
```

Cuando ejecutás un script, npm encuentra el comando `tsx` instalado dentro del proyecto. `tsx` transforma el JSX y ejecuta el resultado con Node. No necesitamos generar manualmente otro archivo. [Instalación y ejecución de tsx](https://tsx.hirok.io/getting-started).

Mantenemos `import React from 'react'` para que el ejemplo funcione con la transformación clásica, que usa `React.createElement`. No hace falta agregar una configuración de TypeScript para este tutorial.

A partir de acá todos los programas completos van en `index.jsx` y se ejecutan con `npm start`.

## 6. Qué problema resuelven React e Ink

Imaginá que escribimos una lista con `console.log` y queremos mover una selección con las flechas. Cambiar una variable no cambia las líneas ya impresas. Tendríamos que controlar qué borrar, dónde mover el cursor y qué volver a dibujar.

Ink permite construir interfaces de terminal usando componentes React y distribución con Flexbox. Ofrece piezas como `Text`, `Box` y mecanismos de entrada como `useInput`. [Documentación de Ink](https://github.com/vadimdemedes/ink).

La idea que vamos a aplicar es **describir cómo debe verse la pantalla a partir de los datos actuales**. Si la selección vale `0`, la primera fila se destaca. Si vale `1`, se destaca la segunda. Nuestro código expresa esa relación.

React organiza la interfaz en componentes. En los ejemplos, un componente será una función que recibe datos y devuelve una descripción de la interfaz. Podemos combinar componentes pequeños para construir otros más grandes. [Componentes de React](https://react.dev/learn/your-first-component).

Cuando cambia el estado, React vuelve a ejecutar los componentes que corresponda para calcular la nueva interfaz. El renderizador aplica el resultado al medio de salida: en esta aplicación, Ink lo presenta en la terminal. [Renderizado y actualización](https://react.dev/learn/render-and-commit).

| Pieza   | Responsabilidad en nuestro proyecto                          |
| ------- | ------------------------------------------------------------ |
| Node.js | Ejecutar el programa.                                        |
| React   | Trabajar con componentes y su estado.                        |
| Ink     | Representar la interfaz en la terminal y recibir el teclado. |
| JSX     | Permitirnos escribir la descripción con etiquetas.           |
| tsx     | Transformar el archivo con JSX para ejecutarlo.              |

## 7. Text y Box: las dos piezas visuales básicas

`Text` muestra contenido textual. `Box` organiza componentes. El texto visible debe ir dentro de `Text`; podemos anidar un `Text` en otro para cambiar el estilo de una parte. Un `Box` no va dentro de un `Text`. [Componentes de Ink](https://github.com/vadimdemedes/ink#components).

```jsx
<Text>
  Estado: <Text color="green" bold>activo</Text>
</Text>
```

Las props de `Text` que más vamos a usar son:

| Prop              | Ejemplo                  | Efecto            |
| ----------------- | ------------------------ | ----------------- |
| `color`           | `color="cyan"`           | Color del texto.  |
| `backgroundColor` | `backgroundColor="blue"` | Color de fondo.   |
| `bold`            | `bold`                   | Negrita.          |
| `dimColor`        | `dimColor`               | Atenuar.          |
| `italic`          | `italic`                 | Cursiva.          |
| `underline`       | `underline`              | Subrayado.        |
| `inverse`         | `inverse={seleccionada}` | Invertir colores. |
| `wrap`            | `wrap="truncate-end"`    | Truncar al final. |

La apariencia de los estilos depende del soporte de la terminal. `wrap` actúa cuando el espacio disponible limita el texto.

`Box` usa filas y columnas de terminal. Sus medidas numéricas representan celdas y líneas. Estas son sus props principales:

| Prop             | Ejemplo               | Efecto                         |
| ---------------- | --------------------- | ------------------------------ |
| `flexDirection`  | `"row"` / `"column"`  | Fila / columna.                |
| `gap`            | `gap={1}`             | Separación entre hijos.        |
| `padding`        | `padding={1}`         | Espacio interior.              |
| `paddingX`       | `paddingX={2}`        | Espacio interior horizontal.   |
| `marginTop`      | `marginTop={1}`       | Separación exterior superior.  |
| `width`          | `width={50}`          | Ancho.                         |
| `height`         | `height={8}`          | Alto.                          |
| `borderStyle`    | `borderStyle="round"` | Tipo de borde.                 |
| `borderColor`    | `borderColor="cyan"`  | Color del borde.               |
| `justifyContent` | `"space-between"`     | Distribución en eje principal. |
| `alignItems`     | `"center"`            | Alineación en eje transversal. |
| `flexGrow`       | `flexGrow={1}`        | Ocupar espacio libre.          |

En `row`, el eje principal es horizontal; en `column`, vertical. [Referencia de Box y Text](https://github.com/vadimdemedes/ink#components).

Probemos esas decisiones en un ejemplo propio:

```jsx
<Box
  flexDirection="column"
  borderStyle="round"
  borderColor="cyan"
  paddingX={2}
  width={50}
>
  <Text bold>Personas</Text>
  <Text dimColor>Elegí una persona para ver sus datos</Text>
</Box>
```

Elegimos una columna porque el subtítulo debe aparecer debajo del título. El borde delimita el panel. El espacio interior evita que las letras queden pegadas al borde. Si cambiamos `flexDirection` a `"row"`, ambos textos pasan a distribuirse horizontalmente.

En JSX estas opciones parecen atributos, pero son propiedades que recibe el componente en un objeto. Podemos pensar en ellas como sus parámetros de configuración.

## 8. Nuestro primer componente: la ficha de una persona

Hasta ahora escribimos directamente los elementos. Vamos a darle un nombre a una composición para poder reutilizarla.

Reemplazá todo `index.jsx` por:

```jsx
import React from 'react';
import { render, Box, Text } from 'ink';

const persona = {
  legajo: 101,
  nombre: 'Ana',
  apellido: 'Pérez',
  telefono: '381 555-0101',
  github: 'ana-perez'
};

function Persona({ persona }) {
  return (
    <Box flexDirection="column" borderStyle="round" paddingX={1}>
      <Text bold>{persona.nombre} {persona.apellido}</Text>
      <Text>Legajo: {persona.legajo}</Text>
      <Text>Teléfono: {persona.telefono}</Text>
      <Text>GitHub: {persona.github}</Text>
    </Box>
  );
}

render(<Persona persona={persona} />);
```

**Salida en la terminal:**

```text
╭──────────────────────────────────────────────────────────────────────────────╮
│ Ana Pérez                                                                    │
│ Legajo: 101                                                                  │
│ Teléfono: 381 555-0101                                                       │
│ GitHub: ana-perez                                                            │
╰──────────────────────────────────────────────────────────────────────────────╯
```

`Persona` es un componente propio. Le entregamos un objeto y devuelve una ficha de solo lectura. No modifica los datos recibidos.

En esta expresión:

```jsx
<Persona persona={persona} />
```

`Persona` es el componente; `persona=` es el nombre de la prop y `{persona}` es la variable cuyo valor pasamos. Que la prop y la variable tengan el mismo nombre es una elección nuestra. Podríamos escribir `<Persona persona={alumna} />` si la variable se llamara `alumna`.

La firma utiliza desestructuración:

```js
function Persona({ persona }) {
```

Equivale a recibir el objeto de props y extraer una propiedad:

```js
function Persona(props) {
  const persona = props.persona;
  // Aquí sigue el mismo return.
}
```

Las props transmiten datos del componente padre al hijo. Pueden contener strings, números, objetos y otros valores JavaScript. El componente hijo las trata como datos de lectura. [Props en React](https://react.dev/learn/passing-props-to-a-component).

Podemos volver a relacionarlo con el inicio del tutorial:

```js
createElement(Persona, { persona: persona });
```

Es la descripción equivalente a `<Persona persona={persona} />`. Al usar JSX dejamos que React invoque el componente; no escribimos `Persona(...)` para montarlo.

## 9. Mostrar varias personas con map

Ahora tenemos un componente reutilizable. Para mostrar varias personas necesitamos un array y una transformación: cada objeto se convierte en un elemento `Persona`.

Reemplazá todo `index.jsx` por:

```jsx
import React from 'react';
import { render, Box, Text } from 'ink';

const personas = [
  { legajo: 101, nombre: 'Ana', apellido: 'Pérez', telefono: '381 555-0101', github: 'ana-perez' },
  { legajo: 102, nombre: 'Bruno', apellido: 'Díaz', telefono: '381 555-0102', github: 'bruno-diaz' },
  { legajo: 103, nombre: 'Carla', apellido: 'Ruiz', telefono: '381 555-0103', github: 'carla-ruiz' }
];

function Persona({ persona }) {
  return (
    <Box flexDirection="column" borderStyle="round" paddingX={1}>
      <Text bold>{persona.nombre} {persona.apellido}</Text>
      <Text>Legajo: {persona.legajo}</Text>
      <Text>Teléfono: {persona.telefono}</Text>
      <Text>GitHub: {persona.github}</Text>
    </Box>
  );
}

function App() {
  return (
    <Box flexDirection="column">
      <Text bold>Personas</Text>
      {personas.map(persona => (
        <Persona key={persona.legajo} persona={persona} />
      ))}
    </Box>
  );
}

render(<App />);
```

**Salida en la terminal:**

```text
Personas
╭──────────────────────────────────────────────────────────────────────────────╮
│ Ana Pérez                                                                    │
│ Legajo: 101                                                                  │
│ Teléfono: 381 555-0101                                                       │
│ GitHub: ana-perez                                                            │
╰──────────────────────────────────────────────────────────────────────────────╯
╭──────────────────────────────────────────────────────────────────────────────╮
│ Bruno Díaz                                                                   │
│ Legajo: 102                                                                  │
│ Teléfono: 381 555-0102                                                       │
│ GitHub: bruno-diaz                                                           │
╰──────────────────────────────────────────────────────────────────────────────╯
╭──────────────────────────────────────────────────────────────────────────────╮
│ Carla Ruiz                                                                   │
│ Legajo: 103                                                                  │
│ Teléfono: 381 555-0103                                                       │
│ GitHub: carla-ruiz                                                           │
╰──────────────────────────────────────────────────────────────────────────────╯
```

`map` es un método de los arrays de JavaScript. Ejecuta una función para cada elemento y devuelve un nuevo array con los resultados. Por ejemplo:

```js
const nombres = personas.map(persona => persona.nombre);
// ['Ana', 'Bruno', 'Carla']
```

En nuestra interfaz el resultado es un array de elementos React. Las llaves externas permiten evaluar esa expresión JavaScript dentro del JSX.

Cada elemento de la lista recibe una `key` estable y única entre sus hermanos. Usamos el legajo porque identifica a la persona. React utiliza esa clave para reconocer cada elemento cuando cambia la lista. `key` es especial: no llega al componente como una prop común; los datos siguen entrando mediante `persona`. [Listas y claves en React](https://react.dev/learn/rendering-lists).

## 10. Recordar una selección: por qué necesitamos useState

La lista ya se ve, pero queremos elegir una persona. Para eso podemos guardar la posición seleccionada: `0` para Ana, `1` para Bruno y `2` para Carla.

Podría parecer suficiente declarar esto dentro de `App`:

```js
let seleccion = 0;
```

Pero modificar esa variable no le comunica a React que debe actualizar la pantalla. Además, cuando React vuelva a ejecutar `App`, la declaración volverá a inicializarla en cero. Necesitamos memoria entre ejecuciones y un mecanismo que solicite otra representación. `useState` proporciona ambas cosas. [El estado como memoria del componente](https://react.dev/learn/state-a-components-memory).

Importamos el hook desde React:

```js
import React, { useState } from 'react';
```

Y dentro de `App` escribimos:

```js
const [seleccion, setSeleccion] = useState(0);
```

`useState` devuelve un array de dos elementos. La desestructuración les asigna nombres:

| Parte          | Función en nuestro ejemplo                          |
| -------------- | --------------------------------------------------- |
| `0`            | Valor inicial: empezamos por Ana.                   |
| `seleccion`    | Posición que corresponde a esta ejecución de `App`. |
| `setSeleccion` | Función para solicitar un nuevo valor.              |

Si queremos seleccionar a Bruno:

```js
setSeleccion(1);
```

React conserva ese nuevo estado y vuelve a ejecutar el componente. En esa ejecución `seleccion` vale `1`. El `0` de `useState(0)` solo se usa para inicializar el estado al montar el componente.

¿Por qué podemos escribir `const`? Porque no reasignamos la variable local de esta ejecución. React ejecuta otra vez la función y, en esa nueva ejecución, `useState` devuelve el valor actualizado.

Cuando el siguiente valor depende del anterior, usaremos una función:

```js
setSeleccion(actual => actual + 1);
```

React le pasa el estado pendiente y usa el resultado como siguiente valor. Esto permite encadenar correctamente actualizaciones. El setter no modifica la variable local que ya tenemos: el nuevo valor estará disponible en otro renderizado. [Referencia de useState](https://react.dev/reference/react/useState).

Los hooks como `useState` se llaman en el nivel superior del componente, antes del `return`. No los ponemos dentro de un `if`, un bucle o el manejador de una tecla. Ese orden estable permite a React relacionarlos con su estado.

Esta memoria dura mientras se conserva la instancia del componente. Cerrar el programa y abrirlo de nuevo vuelve a iniciar la selección en cero; guardar datos en un archivo sería otra tarea.

## 11. Conectar el teclado con useInput

`useInput` pertenece a Ink. Le pasamos una función que recibe el texto ingresado y un objeto con información sobre la tecla. Las flechas se consultan con `key.upArrow` y `key.downArrow`; Enter, con `key.return`. [useInput en Ink](https://github.com/vadimdemedes/ink/blob/master/src/hooks/use-input.ts).

Primero definimos una función auxiliar fuera de `App`:

```js
const acotar = (valor, min, max) => Math.max(min, Math.min(max, valor));
```

`acotar` mantiene un valor entre un mínimo y un máximo. La usamos para que la selección siempre sea un índice válido.

Este fragmento va dentro de `App`, después de declarar el estado:

```jsx
useInput((input, key) => {
  if (key.upArrow) {
    setSeleccion(actual => acotar(actual - 1, 0, personas.length - 1));
  }

  if (key.downArrow) {
    setSeleccion(actual => acotar(actual + 1, 0, personas.length - 1));
  }
});
```

`input` sirve para caracteres como `'a'` o `'q'`; en este fragmento solo necesitamos `key`.

Al subir restamos uno y al bajar sumamos uno. En ambos casos, `acotar` limita el resultado al intervalo de `0` a `personas.length - 1`.

Con nuestras tres personas, si estamos en `1` y presionamos abajo, calculamos `acotar(2, 0, 2)` y obtenemos `2`. Si repetimos la tecla, calculamos `acotar(3, 0, 2)` y seguimos en `2`.

La función que recibe `useInput` cambia el estado. La pantalla debe usar ese estado para decidir qué fila resaltar. Esa conexión es lo que falta completar.

## 12. Aplicación completa: lista navegable y ficha de detalle

Vamos a mostrar una lista breve de nombres a la izquierda y la ficha de la persona seleccionada en un panel a la derecha. Mover las flechas cambia la persona seleccionada y actualiza su detalle inmediatamente.

Reemplazá todo `index.jsx` por este programa completo:

```jsx
import React, { useState } from 'react';
import { render, Box, Text, useInput, useApp } from 'ink';

const acotar = (valor, min, max) => Math.max(min, Math.min(max, valor));

const personas = [
  { legajo: 101, nombre: 'Ana', apellido: 'Pérez', telefono: '381 555-0101', github: 'ana-perez' },
  { legajo: 102, nombre: 'Bruno', apellido: 'Díaz', telefono: '381 555-0102', github: 'bruno-diaz' },
  { legajo: 103, nombre: 'Carla', apellido: 'Ruiz', telefono: '381 555-0103', github: 'carla-ruiz' }
];

function Persona({ persona }) {
  return (
    <Box flexDirection="column" borderStyle="round" paddingX={1}>
      <Text bold>{persona.nombre} {persona.apellido}</Text>
      <Text>Legajo: {persona.legajo}</Text>
      <Text>Teléfono: {persona.telefono}</Text>
      <Text>GitHub: {persona.github}</Text>
    </Box>
  );
}

function App() {
  const { exit } = useApp();
  const [seleccion, setSeleccion] = useState(0);

  useInput((input, key) => {
    if (key.escape) exit();

    if (key.upArrow) {
      setSeleccion(actual => acotar(actual - 1, 0, personas.length - 1));
    }

    if (key.downArrow) {
      setSeleccion(actual => acotar(actual + 1, 0, personas.length - 1));
    }
  });

  return (
    <Box flexDirection="column">
      <Text bold color="cyan">Personas</Text>

      <Box flexDirection="row" gap={2} marginTop={1} alignItems="flex-start">
        <Box flexDirection="column" width={26} flexShrink={0} borderStyle="round" paddingX={1}>
          <Box flexDirection="column">
            {personas.map((persona, indice) => (
              <Text key={persona.legajo} inverse={indice === seleccion} wrap="truncate-end">
                {indice === seleccion ? '› ' : '  '}
                {persona.nombre} {persona.apellido}
              </Text>
            ))}
          </Box>
        </Box>
        <Box flexDirection="column" flexGrow={1} minWidth={0}>
          <Persona persona={personas[seleccion]} />
        </Box>
      </Box>

      <Text dimColor>
        {seleccion + 1} de {personas.length}
      </Text>
    </Box>
  );
}

render(<App />);
```

**Pantalla inicial:**

```text
Personas

╭────────────────────────╮  ╭──────────────────────────────────────────────────╮
│ › Ana Pérez            │  │ Ana Pérez                                        │
│   Bruno Díaz           │  │ Legajo: 101                                      │
│   Carla Ruiz           │  │ Teléfono: 381 555-0101                           │
╰────────────────────────╯  │ GitHub: ana-perez                                │
                            ╰──────────────────────────────────────────────────╯
1 de 3
```

Ejecutalo con `npm start` en una terminal interactiva, por ejemplo la terminal integrada de VS Code. La consola de depuración no es el lugar adecuado para recibir estas teclas. Agregamos `useApp`, que devuelve `exit`: llamamos a esa función cuando `key.escape` indica Esc. Ctrl+C también permite salir de manera predeterminada. [Ejecución y salida de Ink](https://github.com/vadimdemedes/ink#app-lifecycle).

El `Box` exterior con `flexDirection="row"` coloca dos columnas una al lado de la otra. Esta estructura se llama **maestro/detalle**: el maestro permite elegir y el detalle muestra la persona elegida. Ambas partes tienen un borde con `borderStyle="round"`. La izquierda reserva `width={26}` celdas y `flexShrink={0}` evita que se comprima. `gap={2}` las separa. La derecha usa `flexGrow={1}` para ocupar el ancho restante; `Persona` dibuja su borde. `alignItems="flex-start"` alinea ambos paneles arriba. Para estos ejemplos, usá una terminal de al menos 80 columnas.

`acotar(valor, min, max)` concentra el cálculo de los límites: tanto al subir como al bajar, el índice queda entre cero y el último elemento. La línea de estado muestra únicamente la posición y el total, por ejemplo `1 de 3`.

`map` ahora recibe dos argumentos: el objeto `persona` y su `indice` dentro del array. Cada fila compara ese índice con la selección:

```jsx
inverse={indice === seleccion}
```

Solo la fila seleccionada recibe `true`. La misma comparación elige entre un indicador y dos espacios:

```jsx
{indice === seleccion ? '› ' : '  '}
```

La ficha recibe directamente el objeto que corresponde al índice actual:

```jsx
<Persona persona={personas[seleccion]} />
```

No necesitamos otro estado para guardar esa persona: podemos obtenerla del array usando la selección. Si guardáramos las dos cosas, tendríamos que mantenerlas sincronizadas.

Sigamos una pulsación concreta. Inicialmente `seleccion` vale `0`, por lo que Ana aparece destacada. Presionamos abajo y el manejador solicita el estado `1`. React vuelve a ejecutar `App`; esta vez la comparación destaca la fila de Bruno y la ficha recibe `personas[1]`. Ink refleja esa descripción en la terminal.

Llamamos a `render(<App />)` una sola vez para iniciar la aplicación. Las siguientes actualizaciones nacen de los cambios de estado. No hay que volver a llamar a `render` desde el manejador de teclado.

El ejemplo usa una lista fija, no vacía y suficientemente corta para entrar en la terminal. En el siguiente paso vamos a conservar esa navegación y agregar desplazamiento para listas más largas.

## 13. Scroll natural: una ventana sobre la lista

Cuando la lista crece, mostrar todas las personas deja de ser práctico. Vamos a reservar cinco filas y mostrar solo las personas que entran en ese espacio. Al presionar las flechas, la selección se mueve dentro de la ventana. La lista se desplaza una fila únicamente cuando la selección intenta salir por arriba o por abajo.

Por ejemplo, empezamos mostrando las personas 1 a 5. Podemos bajar desde la primera hasta la quinta sin mover la lista. Al bajar una vez más, mostramos las personas 2 a 6 y queda seleccionada la sexta. Si ahora subimos, se selecciona la quinta y la ventana sigue mostrando 2 a 6. **El contenido se desplaza cuando hace falta mantener visible la selección.**

Necesitamos recordar dos números:

| Estado      | Qué representa                                             | Valor inicial |
| ----------- | ---------------------------------------------------------- | ------------- |
| `seleccion` | El índice de la persona seleccionada en la lista completa. | `0`           |
| `inicio`    | El índice de la primera persona visible.                   | `0`           |

La selección responde a «¿qué persona elegí?». El inicio responde a «¿qué parte de la lista estoy mirando?». Son datos distintos: podemos seleccionar varias personas sin cambiar el inicio.

### Mostrar una parte con slice

Definimos cuántas filas entran en la ventana:

```js
const FILAS = 5;
```

Y obtenemos las personas visibles:

```js
const visibles = personas.slice(inicio, inicio + FILAS);
```

`slice` devuelve un nuevo array con el intervalo solicitado, sin modificar el original. El primer índice está incluido y el segundo queda excluido: `slice(1, 6)` devuelve las posiciones 1, 2, 3, 4 y 5. Son cinco personas.

Después usamos el mismo `map` que ya conocemos, aplicado a `visibles`. Hay un detalle importante: el índice del `map` vuelve a empezar en cero. Para saber si una fila está seleccionada, sumamos el desplazamiento de la ventana:

```jsx
inverse={inicio + indice === seleccion}
```

Si `inicio` vale `3`, la fila visible `0` corresponde a la persona ubicada en la posición `3` del array completo.

### Actualizar la selección y la ventana juntas

Como ambos números describen la misma vista y se actualizan al navegar, los guardamos en un único objeto de estado:

```jsx
const [vista, setVista] = useState({ seleccion: 0, inicio: 0 });
const { seleccion, inicio } = vista;
```

Seguimos usando `useState`; ahora su valor es un objeto en lugar de un número. La segunda línea extrae sus dos propiedades para que el resto del código se lea con claridad.

La función `mover` recibe `-1` para subir o `1` para bajar:

```js
function mover(paso) {
  setVista(({ seleccion, inicio }) => {
    const siguiente = acotar(seleccion + paso, 0, personas.length - 1);
    let nuevoInicio = inicio;

    if (siguiente < inicio) {
      nuevoInicio = siguiente;
    }

    if (siguiente >= inicio + FILAS) {
      nuevoInicio = siguiente - FILAS + 1;
    }

    return { seleccion: siguiente, inicio: nuevoInicio };
  });
}
```

Primero limitamos `siguiente` para que permanezca dentro del array. Después dejamos `nuevoInicio` igual que antes, salvo que la nueva selección quede fuera de la ventana.

Si está por encima, la nueva selección pasa a ser la primera fila visible. Si está por debajo, calculamos el inicio que la coloca en la última fila visible. Por ejemplo, con cinco filas y la posición `5` seleccionada, el nuevo inicio es `5 - 5 + 1`, es decir, `1`.

La función pasada a `setVista` recibe el estado pendiente, calcula ambos valores y devuelve **un objeto nuevo**. No modifica el objeto anterior. Así, cada movimiento parte de la selección y la ventana correspondientes a ese estado, incluso si se acumulan varias pulsaciones.

### Programa completo con scroll

Reemplazá todo `index.jsx` por este ejemplo. Agregamos personas para que haya más elementos que filas disponibles:

```jsx
import React, { useState } from 'react';
import { render, Box, Text, useInput, useApp } from 'ink';

const acotar = (valor, min, max) => Math.max(min, Math.min(max, valor));

const FILAS = 5;

const personas = [
  { legajo: 101, nombre: 'Ana', apellido: 'Pérez', telefono: '381 555-0101', github: 'ana-perez' },
  { legajo: 102, nombre: 'Bruno', apellido: 'Díaz', telefono: '381 555-0102', github: 'bruno-diaz' },
  { legajo: 103, nombre: 'Carla', apellido: 'Ruiz', telefono: '381 555-0103', github: 'carla-ruiz' },
  { legajo: 104, nombre: 'Diego', apellido: 'López', telefono: '381 555-0104', github: 'diego-lopez' },
  { legajo: 105, nombre: 'Elena', apellido: 'Sosa', telefono: '381 555-0105', github: 'elena-sosa' },
  { legajo: 106, nombre: 'Federico', apellido: 'Paz', telefono: '381 555-0106', github: 'federico-paz' },
  { legajo: 107, nombre: 'Gabriela', apellido: 'Vega', telefono: '381 555-0107', github: 'gabriela-vega' },
  { legajo: 108, nombre: 'Hugo', apellido: 'Ríos', telefono: '381 555-0108', github: 'hugo-rios' }
];

function Persona({ persona }) {
  return (
    <Box flexDirection="column" borderStyle="round" paddingX={1}>
      <Text bold>{persona.nombre} {persona.apellido}</Text>
      <Text>Legajo: {persona.legajo}</Text>
      <Text>Teléfono: {persona.telefono}</Text>
      <Text>GitHub: {persona.github}</Text>
    </Box>
  );
}

function App() {
  const { exit } = useApp();
  const [vista, setVista] = useState({ seleccion: 0, inicio: 0 });
  const { seleccion, inicio } = vista;
  const visibles = personas.slice(inicio, inicio + FILAS);

  function mover(paso) {
    setVista(({ seleccion, inicio }) => {
      const siguiente = acotar(seleccion + paso, 0, personas.length - 1);
      let nuevoInicio = inicio;

      if (siguiente < inicio) {
        nuevoInicio = siguiente;
      }

      if (siguiente >= inicio + FILAS) {
        nuevoInicio = siguiente - FILAS + 1;
      }

      return { seleccion: siguiente, inicio: nuevoInicio };
    });
  }

  useInput((input, key) => {
    if (key.upArrow) mover(-1);
    if (key.downArrow) mover(1);
    if (key.escape) exit();
  });

  return (
    <Box flexDirection="column">
      <Text bold color="cyan">Personas</Text>

      <Box flexDirection="row" gap={2} marginTop={1} alignItems="flex-start">
        <Box flexDirection="column" width={26} flexShrink={0} borderStyle="round" paddingX={1}>
          <Box flexDirection="column" height={FILAS}>
            {visibles.map((persona, indice) => (
              <Text
                key={persona.legajo}
                inverse={inicio + indice === seleccion}
                wrap="truncate-end"
              >
                {inicio + indice === seleccion ? '› ' : '  '}
                {persona.nombre} {persona.apellido}
              </Text>
            ))}
          </Box>
    
        </Box>
        <Box flexDirection="column" flexGrow={1} minWidth={0}>
          <Persona persona={personas[seleccion]} />
        </Box>
      </Box>

      <Text dimColor>
        {seleccion + 1} de {personas.length}
      </Text>
    </Box>
  );
}

render(<App />);
```

**Pantalla inicial:**

```text
Personas

╭────────────────────────╮  ╭──────────────────────────────────────────────────╮
│ › Ana Pérez            │  │ Ana Pérez                                        │
│   Bruno Díaz           │  │ Legajo: 101                                      │
│   Carla Ruiz           │  │ Teléfono: 381 555-0101                           │
│   Diego López          │  │ GitHub: ana-perez                                │
│   Elena Sosa           │  ╰──────────────────────────────────────────────────╯
╰────────────────────────╯
1 de 8
```

**Después de presionar ↓ cinco veces:** Federico queda seleccionado y la ventana muestra las personas 2 a 6. La ficha se actualiza en el panel derecho.

```text
Personas

╭────────────────────────╮  ╭──────────────────────────────────────────────────╮
│   Bruno Díaz           │  │ Federico Paz                                     │
│   Carla Ruiz           │  │ Legajo: 106                                      │
│   Diego López          │  │ Teléfono: 381 555-0106                           │
│   Elena Sosa           │  │ GitHub: federico-paz                             │
│ › Federico Paz         │  ╰──────────────────────────────────────────────────╯
╰────────────────────────╯
6 de 8
```

Ejecutalo con `npm start`. Bajá hasta Federico y luego subí una vez: Elena queda seleccionada, pero la ventana no salta hacia arriba. Seguí bajando hasta Hugo: la selección se detiene al final y la ventana conserva cinco filas. Al volver hacia arriba, el contenido empieza a desplazarse cuando la selección alcanza el borde superior.

`height={FILAS}` reserva un espacio de cinco líneas. `wrap="truncate-end"` hace que un nombre demasiado largo se recorte al final en lugar de ocupar otra línea. Así cada persona ocupa una fila y el detalle mantiene su posición. El recorte y la altura son propiedades de presentación; el desplazamiento lo decidimos con `inicio` y `slice`.

La ficha sigue recibiendo `personas[seleccion]`, porque `seleccion` siempre es un índice de la lista completa. Las claves siguen siendo los legajos: una persona conserva su identidad aunque aparezca en otra fila de la ventana.

Usamos cinco filas para que el mecanismo sea fácil de observar. Podés cambiar `FILAS` por otro entero positivo que entre en tu terminal. El ejemplo supone una lista fija y no vacía; también funciona si contiene menos personas que filas disponibles, dejando libre el espacio restante. Adaptar la ventana automáticamente al tamaño de la terminal sería un paso adicional.

## 14. Incorporar un campo de texto

La aplicación ya permite recorrer personas y consultar sus datos. Ahora vamos a editar los datos de la persona seleccionada.

Enter abre la edición; Tab cambia de campo y Enter aplica el formulario completo. Escape cancela y conserva los datos anteriores.

Para capturar texto vamos a usar un componente de biblioteca. Instalalo en el mismo proyecto:

```bash
npm install ink-text-input@6.0.0
```

Y agregá esta importación:

```jsx
import TextInput from 'ink-text-input';
```

`TextInput` ofrece entrada de texto con cursor y edición. Nos interesan tres props:

| Prop       | Qué recibe   | Para qué sirve                       |
| ---------- | ------------ | ------------------------------------ |
| `value`    | Un string.   | Mostrar el valor actual.             |
| `onChange` | Una función. | Recibir el texto actualizado.        |
| `onSubmit` | Una función. | Recibir el texto al presionar Enter. |

Su uso básico, dentro de un componente, es:

```jsx
const [nombre, setNombre] = useState('Ana');

return (
  <TextInput
    value={nombre}
    onChange={setNombre}
    onSubmit={valor => console.log(valor)}
  />
);
```

Ese `console.log` solo ilustra qué valor recibe `onSubmit`; en la aplicación lo reemplazaremos por una función que actualiza los datos.

`value` y `onChange` forman un circuito: el componente muestra el valor del estado, informa los cambios y recibe el nuevo valor cuando React vuelve a renderizar. A esta forma de uso se la llama **componente controlado**. [Documentación de ink-text-input](https://github.com/vadimdemedes/ink-text-input).

No escribimos nosotros el manejo de cada letra, del retroceso ni del cursor. El componente de biblioteca aporta ese comportamiento; nuestra aplicación decide qué hacer con el texto.

## 15. Editar una persona con un componente Campo

Vamos a editar nombre, apellido, teléfono y GitHub mediante un borrador del objeto completo. El legajo se muestra como dato de lectura y conserva la identidad de la persona.

Cada fila del formulario necesita una etiqueta, un valor y un campo de texto. Creamos `Campo` para reunir esas piezas. Lo definimos en el mismo archivo, fuera de `EditorPersona`, como los demás componentes: así su identidad no cambia cada vez que el editor se renderiza.

```jsx
const CAMPOS = [
  ['nombre', 'Nombre'],
  ['apellido', 'Apellido'],
  ['telefono', 'Teléfono'],
  ['github', 'GitHub']
];

function Campo({ etiqueta, valor, activo, onChange, onSubmit }) {
  return (
    <Box>
      <Box width={12}>
        <Text color={activo ? 'cyan' : undefined}>{etiqueta}:</Text>
      </Box>
      <TextInput
        value={valor}
        focus={activo}
        onChange={onChange}
        onSubmit={onSubmit}
      />
    </Box>
  );
}

function EditorPersona({ persona, onGuardar, onCancelar }) {
  const [borrador, setBorrador] = useState({ ...persona });
  const [campo, setCampo] = useState(0);

  function cambiar(propiedad, valor) {
    setBorrador(actual => ({ ...actual, [propiedad]: valor }));
  }

  useInput((input, key) => {
    if (key.escape) onCancelar();

    if (key.tab) {
      const paso = key.shift ? -1 : 1;
      setCampo(actual => (actual + paso + CAMPOS.length) % CAMPOS.length);
    }
  });

  return (
    <Box flexDirection="column" borderStyle="round" paddingX={1}>
      <Text bold>Editar persona · Legajo {persona.legajo}</Text>

      {CAMPOS.map(([propiedad, etiqueta], indice) => (
        <Campo
          key={propiedad}
          etiqueta={etiqueta}
          valor={borrador[propiedad]}
          activo={indice === campo}
          onChange={valor => cambiar(propiedad, valor)}
          onSubmit={() => onGuardar(borrador)}
        />
      ))}

    </Box>
  );
}
```

`Campo` recibe el valor y las funciones mediante props. `focus={activo}` hace que solo el campo seleccionado reciba la escritura. La etiqueta ocupa doce columnas para alinear los valores. [Propiedades de TextInput](https://github.com/vadimdemedes/ink-text-input#props).

`EditorPersona` conserva dos estados: `borrador`, una copia de la persona, y `campo`, el índice del campo activo. La lista `CAMPOS` describe las propiedades editables y sus etiquetas; `map` construye una fila para cada una.

La función `cambiar` actualiza cualquier propiedad usando el mismo código:

```js
setBorrador(actual => ({ ...actual, [propiedad]: valor }));
```

`...actual` copia las propiedades existentes y `[propiedad]` usa el contenido de esa variable como nombre de la propiedad que se actualiza. Si `propiedad` vale `'telefono'`, se reemplaza el teléfono. Cada cambio produce un objeto nuevo sin modificar la persona original.

Tab avanza y Shift+Tab retrocede. El operador `%` permite volver al primer campo después del último; sumamos `CAMPOS.length` antes de calcular el resto para que retroceder desde cero llegue al último. Las flechas izquierda y derecha quedan disponibles para mover el cursor del texto.

Enter, desde cualquier campo, entrega el borrador completo mediante `onGuardar(borrador)`. Escape llama a `onCancelar()` y descarta la edición.

Fijate en esta prop:

```jsx
onSubmit={() => onGuardar(borrador)}
```

Estamos pasando una función para ejecutarla después. La función adapta el evento del campo: en lugar de guardar únicamente el texto de esa fila, envía el objeto completo.

El editor aparece solo mientras estamos editando. Al cerrarlo se desmonta y desaparece su estado local. Al abrirlo otra vez, comienza con una copia de los datos actuales de la persona.

## 16. Actualizar una persona de forma inmutable

Como los datos pueden cambiar, el array pertenece al estado de `App`:

```jsx
const [personas, setPersonas] = useState(personasIniciales);
```

El editor entrega una persona completa. Guardarla consiste en reemplazar el objeto con el mismo legajo:

```js
function guardar(editada) {
  setPersonas(actuales => actuales.map(persona => (
    persona.legajo === editada.legajo ? editada : persona
  )));
  setEditando(false);
}
```

`map` crea un array nuevo. Cuando coincide el legajo, devuelve el objeto editado; para las demás personas conserva los objetos existentes. El borrador ya contiene todas las propiedades, incluido el legajo que no se podía editar.

Actualizar de forma inmutable significa producir el nuevo estado sin modificar el anterior. El editor crea nuevos objetos al escribir y `guardar` crea el nuevo array al aplicar los cambios. [Actualizar arrays en React](https://react.dev/learn/updating-arrays-in-state).

Después de reemplazar la persona, `setEditando(false)` cierra el formulario. La lista y la ficha reciben los datos actualizados en el siguiente renderizado.

## 17. Decidir qué componente recibe el teclado

Ahora conviven dos usos del teclado. Mientras navegamos, las flechas mueven la selección. Mientras editamos, necesitamos escribir y mover el cursor del campo.

En `App` guardamos si la edición está activa:

```jsx
const [editando, setEditando] = useState(false);
```

En `App` también obtenemos `const { exit } = useApp()` y configuramos el manejador de la lista:

```jsx
useInput((input, key) => {
  if (key.upArrow) mover(-1);
  if (key.downArrow) mover(1);
  if (key.return) setEditando(true);
    if (key.escape) exit();
}, { isActive: !editando });
```

El segundo argumento de `useInput` permite activar o desactivar ese manejador. Con `isActive: !editando`, la lista escucha solo mientras no estamos editando. El hook se sigue llamando en cada renderizado: lo que cambia es su configuración. [Referencia de useInput](https://github.com/vadimdemedes/ink#useinputinputhandler-options).

Para elegir qué mostrar, usamos una expresión condicional en JSX:

```jsx
{editando ? (
  <EditorPersona
    persona={personas[seleccion]}
    onGuardar={guardar}
    onCancelar={() => setEditando(false)}
  />
) : (
  <Persona persona={personas[seleccion]} />
)}
```

Mientras `editando` es `true`, aparece el editor. Cuando es `false`, aparece la ficha de lectura. La lista conserva su selección y su ventana porque esos estados siguen perteneciendo a `App`, que permanece montado.

Esc tiene un significado según el modo: al navegar, `exit()` cierra el programa; al editar, cancela el borrador. El manejador principal está desactivado durante la edición, de modo que cancelar no cierra la aplicación.

Cancelar solo cambia `editando` a `false`. Como el borrador nunca modificó el array, no hay ningún dato que restaurar.

## 18. Programa completo: navegar, desplazar y editar

Este ejemplo conserva la lista a la izquierda, el panel de detalle a la derecha y el scroll y agrega un formulario para editar la persona completa. También extraemos `ListaPersonas` para que el `return` de `App` muestre con claridad las piezas de la interfaz.

Después de instalar `ink-text-input`, reemplazá todo `index.jsx` por:

```jsx
import React, { useState } from 'react';
import { render, Box, Text, useInput, useApp } from 'ink';
import TextInput from 'ink-text-input';

const acotar = (valor, min, max) => Math.max(min, Math.min(max, valor));

const FILAS = 5;

const personasIniciales = [
  { legajo: 101, nombre: 'Ana', apellido: 'Pérez', telefono: '381 555-0101', github: 'ana-perez' },
  { legajo: 102, nombre: 'Bruno', apellido: 'Díaz', telefono: '381 555-0102', github: 'bruno-diaz' },
  { legajo: 103, nombre: 'Carla', apellido: 'Ruiz', telefono: '381 555-0103', github: 'carla-ruiz' },
  { legajo: 104, nombre: 'Diego', apellido: 'López', telefono: '381 555-0104', github: 'diego-lopez' },
  { legajo: 105, nombre: 'Elena', apellido: 'Sosa', telefono: '381 555-0105', github: 'elena-sosa' },
  { legajo: 106, nombre: 'Federico', apellido: 'Paz', telefono: '381 555-0106', github: 'federico-paz' },
  { legajo: 107, nombre: 'Gabriela', apellido: 'Vega', telefono: '381 555-0107', github: 'gabriela-vega' },
  { legajo: 108, nombre: 'Hugo', apellido: 'Ríos', telefono: '381 555-0108', github: 'hugo-rios' }
];

function ListaPersonas({ personas, seleccion, inicio }) {
  const visibles = personas.slice(inicio, inicio + FILAS);

  return (
    <Box flexDirection="column">
      <Box flexDirection="column" height={FILAS}>
        {visibles.map((persona, indice) => (
          <Text
            key={persona.legajo}
            inverse={inicio + indice === seleccion}
            wrap="truncate-end"
          >
            {inicio + indice === seleccion ? '› ' : '  '}
            {persona.nombre} {persona.apellido}
          </Text>
        ))}
      </Box>

    </Box>
  );
}

function Persona({ persona }) {
  return (
    <Box flexDirection="column" borderStyle="round" paddingX={1}>
      <Text bold>{persona.nombre} {persona.apellido}</Text>
      <Text>Legajo: {persona.legajo}</Text>
      <Text>Teléfono: {persona.telefono}</Text>
      <Text>GitHub: {persona.github}</Text>
    </Box>
  );
}

const CAMPOS = [
  ['nombre', 'Nombre'],
  ['apellido', 'Apellido'],
  ['telefono', 'Teléfono'],
  ['github', 'GitHub']
];

function Campo({ etiqueta, valor, activo, onChange, onSubmit }) {
  return (
    <Box>
      <Box width={12}>
        <Text color={activo ? 'cyan' : undefined}>{etiqueta}:</Text>
      </Box>
      <TextInput
        value={valor}
        focus={activo}
        onChange={onChange}
        onSubmit={onSubmit}
      />
    </Box>
  );
}

function EditorPersona({ persona, onGuardar, onCancelar }) {
  const [borrador, setBorrador] = useState({ ...persona });
  const [campo, setCampo] = useState(0);

  function cambiar(propiedad, valor) {
    setBorrador(actual => ({ ...actual, [propiedad]: valor }));
  }

  useInput((input, key) => {
    if (key.escape) onCancelar();

    if (key.tab) {
      const paso = key.shift ? -1 : 1;
      setCampo(actual => (actual + paso + CAMPOS.length) % CAMPOS.length);
    }
  });

  return (
    <Box flexDirection="column" borderStyle="round" paddingX={1}>
      <Text bold>Editar persona · Legajo {persona.legajo}</Text>

      {CAMPOS.map(([propiedad, etiqueta], indice) => (
        <Campo
          key={propiedad}
          etiqueta={etiqueta}
          valor={borrador[propiedad]}
          activo={indice === campo}
          onChange={valor => cambiar(propiedad, valor)}
          onSubmit={() => onGuardar(borrador)}
        />
      ))}

    </Box>
  );
}

function App() {
  const { exit } = useApp();
  const [personas, setPersonas] = useState(personasIniciales);
  const [vista, setVista] = useState({ seleccion: 0, inicio: 0 });
  const [editando, setEditando] = useState(false);
  const { seleccion, inicio } = vista;

  function mover(paso) {
    setVista(({ seleccion, inicio }) => {
      const siguiente = acotar(seleccion + paso, 0, personas.length - 1);
      let nuevoInicio = inicio;

      if (siguiente < inicio) {
        nuevoInicio = siguiente;
      }

      if (siguiente >= inicio + FILAS) {
        nuevoInicio = siguiente - FILAS + 1;
      }

      return { seleccion: siguiente, inicio: nuevoInicio };
    });
  }

  function guardar(editada) {
    setPersonas(actuales => actuales.map(persona => (
      persona.legajo === editada.legajo ? editada : persona
    )));
    setEditando(false);
  }

  useInput((input, key) => {
    if (key.upArrow) mover(-1);
    if (key.downArrow) mover(1);
    if (key.return) setEditando(true);
    if (key.escape) exit();
  }, { isActive: !editando });

  return (
    <Box flexDirection="column">
      <Text bold color="cyan">Personas</Text>

      <Box flexDirection="row" gap={2} marginTop={1} alignItems="flex-start">
        <Box flexDirection="column" width={26} flexShrink={0} borderStyle="round" paddingX={1}>
          <ListaPersonas
            personas={personas}
            seleccion={seleccion}
            inicio={inicio}
          />
        </Box>
        <Box flexDirection="column" flexGrow={1} minWidth={0}>
          {editando ? (
            <EditorPersona
              persona={personas[seleccion]}
              onGuardar={guardar}
              onCancelar={() => setEditando(false)}
            />
          ) : (
            <Persona persona={personas[seleccion]} />
          )}
        </Box>
      </Box>

      <Text dimColor>
        {seleccion + 1} de {personas.length}
      </Text>
    </Box>
  );
}

render(<App />);
```

**Pantalla inicial:**

```text
Personas

╭────────────────────────╮  ╭──────────────────────────────────────────────────╮
│ › Ana Pérez            │  │ Ana Pérez                                        │
│   Bruno Díaz           │  │ Legajo: 101                                      │
│   Carla Ruiz           │  │ Teléfono: 381 555-0101                           │
│   Diego López          │  │ GitHub: ana-perez                                │
│   Elena Sosa           │  ╰──────────────────────────────────────────────────╯
╰────────────────────────╯
1 de 8
```

**Después de presionar Enter:** el panel derecho muestra `EditorPersona`. El campo Nombre tiene el foco; esta muestra de texto omite el cursor y los colores de la terminal.

```text
Personas

╭────────────────────────╮  ╭──────────────────────────────────────────────────╮
│ › Ana Pérez            │  │ Editar persona · Legajo 101                      │
│   Bruno Díaz           │  │ Nombre:     Ana                                  │
│   Carla Ruiz           │  │ Apellido:   Pérez                                │
│   Diego López          │  │ Teléfono:   381 555-0101                         │
│   Elena Sosa           │  │ GitHub:     ana-perez                            │
╰────────────────────────╯  ╰──────────────────────────────────────────────────╯
1 de 8
```

Ejecutá `npm start`. Elegí una persona, presioná Enter y recorré los campos con Tab o Shift+Tab. Modificá los datos y presioná Enter para aplicarlos. La lista y la ficha recibirán la persona actualizada desde el mismo array de estado.

Probá después modificar varios campos y presionar Escape. El editor se cierra y la persona conserva todos los datos anteriores a esa edición.

El estado quedó distribuido según quién lo necesita:

| Estado     | Componente      | Por qué está ahí                                               |
| ---------- | --------------- | -------------------------------------------------------------- |
| `personas` | `App`           | La lista y la ficha necesitan los datos actualizados.          |
| `vista`    | `App`           | La selección debe conservarse al abrir y cerrar el editor.     |
| `editando` | `App`           | Determina qué componente se muestra y qué teclado está activo. |
| `borrador` | `EditorPersona` | Conserva temporalmente la persona editada.                     |
| `campo`    | `EditorPersona` | Determina qué fila del formulario recibe el texto.             |

En este paso, aplicar el cambio actualiza los datos en memoria. Al cerrar el programa, se pierden las modificaciones: todavía no incorporamos la escritura de un archivo.

Como práctica, agregá una propiedad `email` a los datos iniciales y una entrada a `CAMPOS`. El componente `Campo` y la función `cambiar` ya sirven para editarla; podés incorporarla también a la ficha de lectura.
