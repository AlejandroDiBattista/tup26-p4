# Una agenda de terminal con React e Ink

Un tutorial para construir un **CRUD de contactos** componiendo componentes de biblioteca. La aplicación permite buscar en caliente, seleccionar personas en una lista maestra y ver sus datos en un panel de detalle. Al crear o editar, ese mismo panel muestra un formulario. Los contactos se conservan en JSON y **el legajo es su identificador único**.

Para seguirlo alcanza con conocer funciones, objetos, arrays y módulos de JavaScript. Todo el código, la configuración y los datos necesarios están incluidos aquí.

## 1. React: describir una interfaz a partir de datos

React es una biblioteca para construir interfaces mediante **componentes**: piezas reutilizables que reciben información y describen qué mostrar. Una aplicación se forma combinando esas piezas, unas dentro de otras. [Conceptos de React](https://react.dev/learn/describing-the-ui).

La idea central es que la interfaz depende de los datos actuales. Si cambia la persona seleccionada, cambia la ficha; si cambia la búsqueda, cambia la lista.

En lugar de indicarle a cada parte de la pantalla cómo corregirse después de una acción, describimos cómo debe verse con el estado actual. React vuelve a calcular esa descripción cuando corresponde. A este enfoque se lo llama **declarativo**.

### Componentes, props y estado

| Concepto | Qué representa | Ejemplo en la agenda |
| --- | --- | --- |
| Componente | Una pieza de interfaz | Lista, buscador, ficha o formulario |
| Props | Información que recibe una pieza | El contacto que debe mostrar una ficha |
| Estado | Información que se conserva entre renderizados | Texto buscado o legajo seleccionado |
| Evento | Una acción a la que responde el programa | Cambió el texto o se envió un formulario |
| Renderizado | Calcular la descripción de la interfaz | Obtener la lista y la ficha correspondientes |

Las props pueden ser textos, objetos, arrays o funciones. Un padre entrega datos a sus hijos y les pasa funciones para que comuniquen acciones. Por ejemplo, la lista recibe contactos y una función a la que llama cuando cambia la selección.

El estado no es cualquier variable. React debe conservarlo entre ejecuciones del componente y saber cuándo cambia. `useState` ofrece ese mecanismo: devuelve un valor y una función para actualizarlo.

### JSX: una forma de escribir componentes

Este fragmento muestra una ficha mínima:

```jsxfunction Ficha({contacto}) {
  return <Text>{contacto.apellido}, {contacto.nombre}</Text>;
}
```

Sin JSX, el mismo componente puede escribirse usando `React.createElement`:

```js
function Ficha({contacto}) {
  return React.createElement(
    Text,
    null,
    contacto.apellido,
    ', ',
    contacto.nombre
  );
}
```

`Ficha` es una función que recibe props. `{contacto}` usa desestructuración. La expresión entre etiquetas es **JSX**; las llaves permiten incluir JavaScript dentro de esa descripción. `<Text>` será un componente de Ink.

JSX no es una cadena de texto ni obliga a usar HTML. Una herramienta lo transforma en llamadas de JavaScript que crean elementos de React. Por convención, los nombres de componentes comienzan con mayúscula.

### Qué ocurre después de una acción

Supongamos que el buscador contiene `an` y agregamos una `a`:

1. El campo informa el nuevo texto, `ana`, mediante una función recibida por props.
2. Esa función actualiza el estado de búsqueda.
3. React vuelve a ejecutar el componente que calcula los resultados.
4. Sus hijos reciben las nuevas coincidencias y el contacto seleccionado.
5. El renderizador actualiza la presentación.

Los componentes deben describir la interfaz sin modificar datos externos durante el render. Las operaciones como guardar un archivo se ejecutan al responder a una acción.

React conserva el estado según la identidad y posición de los componentes. Si un componente se desmonta, pierde su estado local. Usaremos ese comportamiento para descartar el borrador al cancelar un formulario.

## 2. Ink: llevar React a una terminal

React necesita un **renderizador** que transforme sus elementos en una interfaz concreta. En el navegador se usa React DOM; **Ink es un renderizador de React para la terminal**. Los mismos conceptos de componentes, props y estado se aplican en ambos casos. [Documentación de Ink](https://github.com/vadimdemedes/ink).

Nuestra aplicación es un proceso de Node.js que escucha el teclado y presenta texto, colores, bordes y paneles. Es una **TUI**: una interfaz de usuario de terminal. Sus dimensiones se miden en columnas y filas, no en píxeles.

### Las piezas básicas

| Elemento | Responsabilidad |
| --- | --- |
| `Text` | Mostrar texto y aplicar estilos como color o negrita |
| `Box` | Distribuir componentes en filas o columnas |
| `render` | Montar la aplicación en la terminal |
| `useInput` | Responder a teclas dentro de un componente |

Ink distribuye las cajas mediante un modelo basado en Flexbox. Para esta agenda basta con unas pocas props:

```jsx
<Box flexDirection="row">
  <Box width="30%"><Text>Maestro</Text></Box>
  <Box width="70%"><Text>Detalle</Text></Box>
</Box>
```

`flexDirection="row"` coloca elementos uno al lado del otro; `"column"` los apila. `borderStyle="round"` dibuja un borde y `paddingX={1}` agrega espacio interior horizontal. El texto visible se coloca dentro de `Text`.

`render` se llama al iniciar. Después, las actualizaciones de estado provocan nuevos renderizados; no llamamos a `render` por cada tecla ni imprimimos toda la pantalla manualmente.

### Componer con bibliotecas

Ink proporciona la base. Otros paquetes ofrecen controles listos para integrar:

| Paquete | Componente | Qué aporta |
| --- | --- | --- |
| `ink-text-input` | `TextInput` | Edición de texto y cursor |
| `ink-select-input` | `SelectInput` | Lista navegable, indicador y desplazamiento |
| `ink-form` | `Form` | Campos, borrador, navegación y envío de formulario |

Nuestro trabajo será **adaptar datos y conectar eventos**. Las bibliotecas administran la interacción de sus controles; la agenda decide qué contacto está seleccionado, qué operaciones son válidas y cuándo persistirlas.

Usar un componente externo requiere entender su contrato: qué props acepta, qué estado conserva y qué eventos produce. [TextInput](https://github.com/vadimdemedes/ink-text-input), [SelectInput](https://github.com/vadimdemedes/ink-select-input), [Form](https://github.com/lukasbach/ink-form).

## 3. Crear el proyecto

Necesitás Node.js 22 o posterior, npm y una terminal interactiva. Para mostrar el formulario cómodamente, usá una ventana de aproximadamente **120 columnas y 40 filas**. En VS Code ejecutá el programa en **Terminal**, no en el panel Salida.

```bash
node --version
npm --version
mkdir agenda-ink
cd agenda-ink
```

Creá `package.json` con este contenido:

```json
{
  "name": "agenda-ink",
  "version": "1.0.0",
  "private": true,
  "type": "module",
  "scripts": {"start": "tsx app.jsx"},
  "dependencies": {
    "react": "19.2.0",
    "ink": "7.1.1",
    "ink-text-input": "6.0.0",
    "ink-select-input": "6.2.0",
    "ink-form": "2.0.2"
  },
  "devDependencies": {"tsx": "4.23.13"},
  "overrides": {"ink-form": {"ink-select-input": "6.2.0"}}
}
```

Instalá:

```bash
npm install
```

Estas versiones fueron comprobadas juntas. El `override` hace que `ink-form` use el mismo `ink-select-input@6.2.0` que la agenda: su dependencia original apunta a una versión con requisitos anteriores de React e Ink.

`tsx` ejecuta nuestro JavaScript con JSX; no hace falta escribir TypeScript. `type: "module"` habilita módulos ES en los archivos `.js`.

Conservá `package-lock.json`. Para instalar el mismo proyecto en otra computadora, usá `npm ci

> **Tip:** Para pedirle a Codex que configure el proyecto, no hace falta dictarle cada archivo ni repetir los pasos del tutorial. Dale el tutorial como especificación, indicá el resultado esperado y pedile que inspeccione y verifique su trabajo.

```text
Configurá este proyecto como una aplicación Node para React e Ink. 
Instalá las librerías: `ink-text-input`, `ink-select-input` e `ink-form`. 

### Primer componente ejecutable

Creá `app.jsx`:

```jsx
import React from 'react';
import {render, Text} from 'ink';

function App() {
  return <Text color="cyan" bold>Agenda de contactos</Text>;
}

render(<App />);
```

Ejecutá desde la carpeta del proyecto:

```bash
npm start
```

Este ejemplo puede mostrar el título y terminar: todavía no escucha el teclado. `<App />` usa nuestro componente; `Text` viene de una biblioteca. Ambos se componen con la misma sintaxis.

### Agregar estado y eventos

Reemplazá `app.jsx` por este ejemplo breve:

```jsx
import React, {useState} from 'react';
import {render, Box, Text, useInput} from 'ink';

function App() {
  const [numero, setNumero] = useState(0);

  useInput((input, key) => {
    if (key.upArrow) setNumero(actual => actual + 1);
    if (key.downArrow) setNumero(actual => actual - 1);
  });

  return (
    <Box flexDirection="column">
      <Text>Número: {numero}</Text>
      <Text dimColor>↑ / ↓: cambiar · Ctrl+C: salir</Text>
    </Box>
  );
}

render(<App />);
```

`useState(0)` establece el valor inicial. `setNumero` solicita un cambio y React vuelve a calcular la interfaz. `actual => actual + 1` calcula el próximo valor a partir del anterior.

Una variable local como `let numero = 0` se crearía otra vez al ejecutar el componente; cambiarla tampoco notificaría a React. El setter conserva el dato y solicita la actualización. No cambia de inmediato la variable del manejador que ya se está ejecutando. [Estado en React](https://react.dev/learn/state-a-components-memory).

`useState` y `useInput` son **hooks**. Se llaman en el nivel superior de un componente, fuera de condiciones, bucles y manejadores. Para desactivar un `useInput` se cambia su opción `isActive`, conservando la llamada al hook.

## 4. Los datos: el legajo es la identidad

Cada contacto tiene exactamente cinco campos:

| Campo | Tipo | Regla |
| --- | --- | --- |
| `nombre` | String | Obligatorio |
| `apellido` | String | Obligatorio |
| `legajo` | String | Obligatorio, único e identificador del contacto |
| `telefono` | String | Opcional |
| `github` | String | Opcional; nombre de usuario |

El legajo es texto para conservar ceros iniciales: `"00123"`. No hay una propiedad `id` adicional. Para seleccionar, modificar y eliminar buscaremos por `legajo`.

Se permite corregir el legajo al editar. Para hacerlo hay que recordar el **legajo anterior**, localizar ese registro y reemplazarlo por el contacto nuevo. Si el legajo nuevo ya pertenece a otro contacto, rechazamos el cambio.

Creá `contactos.json` con estos datos ficticios:

```json
[
  {
    "nombre": "Ana",
    "apellido": "Torres",
    "legajo": "00123",
    "telefono": "381 555-0101",
    "github": "ana-torres-demo"
  },
  {
    "nombre": "Bruno",
    "apellido": "Díaz",
    "legajo": "00124",
    "telefono": "381 555-0102",
    "github": "bruno-diaz-demo"
  },
  {
    "nombre": "Carla",
    "apellido": "Núñez",
    "legajo": "00125",
    "telefono": "381 555-0103",
    "github": "carla-nunez-demo"
  }
]
```

Para empezar con una agenda vacía, el contenido del archivo debe ser `[]`.

### Archivos de la aplicación

| Archivo | Responsabilidad |
| --- | --- |
| `contactos.json` | Guardar los datos |
| `archivo.js` | Leer y escribir JSON |
| `componentes.jsx` | Integrar controles externos y mostrar el detalle |
| `app.jsx` | Coordinar estado, búsqueda y CRUD |

## 5. Leer y escribir JSON con lo mínimo

Creá `archivo.js` completo:

```js
import {readFileSync, writeFileSync} from 'node:fs';

export function cargarContactos() {
  return JSON.parse(readFileSync('contactos.json', 'utf8'));
}

export function guardarContactos(contactos) {
  writeFileSync('contactos.json', JSON.stringify(contactos, null, 2));
}
```

La lectura hace dos cosas: `readFileSync` obtiene texto y `JSON.parse` lo convierte en un array de objetos.

La escritura hace el recorrido inverso: `JSON.stringify` convierte los objetos en texto y `writeFileSync` reemplaza el contenido del archivo. `null, 2` aplica una sangría de dos espacios para que el JSON sea legible. [Archivos en Node.js](https://nodejs.org/api/fs.html).

El nombre relativo `contactos.json` se resuelve desde la carpeta donde corre el proceso. Por eso ejecutamos `npm start` dentro de `agenda-ink`.

**Supuesto del ejemplo:** el archivo existe y contiene un array válido, con los cinco campos como strings y legajos únicos. El JSON incluido cumple ese formato. Las funciones leen y escriben directamente; un error de lectura o de sintaxis se comunica como una excepción.

Usamos operaciones sincrónicas porque trabajamos con un archivo local pequeño. Cargamos al iniciar y guardamos después de cada alta, modificación o baja completada. Escribir una letra en el buscador o en un borrador no escribe el archivo.

## 6. Cómo se hace un CRUD inmutable

**Inmutable** significa que una operación construye el nuevo estado sin modificar el estado anterior. No prohíbe que la aplicación cambie: cambia reemplazando valores, en lugar de alterar objetos que ya estaban en uso.

En React tratamos los arrays y objetos del estado como valores de solo lectura. Esto hace explícito qué cambió y evita que dos partes del programa alteren accidentalmente el mismo objeto. [Actualizar arrays en estado](https://react.dev/learn/updating-arrays-in-state).

### Un ejemplo completo, paso a paso

Partimos de este array:

```js
const contactos = [{
  nombre: 'Ana',
  apellido: 'Torres',
  legajo: '00123',
  telefono: '381 555-0101',
  github: 'ana-torres-demo'
}];
```

**Create — agregar.** Construimos un array que contiene los elementos existentes y el nuevo:

```js
const nuevo = {
  nombre: 'Bruno',
  apellido: 'Díaz',
  legajo: '00124',
  telefono: '',
  github: ''
};

const conAlta = [...contactos, nuevo];
```

`conAlta` tiene dos contactos; `contactos` sigue teniendo uno. `...contactos` incorpora sus elementos al array nuevo. La comprobación de legajo repetido se realiza antes de aceptar el alta.

**Read — consultar.** Leer no requiere cambiar el array:

```js
const encontrado = conAlta.find(c => c.legajo === '00123');
const coincidencias = conAlta.filter(c => c.apellido.includes('Torres'));
```

`find` devuelve el objeto encontrado o `undefined`. `filter` construye un array con coincidencias. Los objetos encontrados siguen siendo referencias a los originales: para editarlos, crearemos copias.

**Update — reemplazar.** Creamos el objeto actualizado y luego un array que lo sustituya en la posición correspondiente:

```js
const actualizado = {...encontrado, telefono: '381 555-9999'};
const conCambio = conAlta.map(c =>
  c.legajo === encontrado.legajo ? actualizado : c
);
```

Hay dos niveles: `{...encontrado, telefono: ...}` crea un objeto nuevo; `map` crea un array nuevo. Los contactos que no cambian pueden conservar sus objetos. No necesitamos clonar todo el árbol de datos.

Si corregimos también el legajo, comparamos con el anterior:

```js
const legajoAnterior = '00123';
const corregido = {...actualizado, legajo: '00999'};
const conLegajoCorregido = conCambio.map(c =>
  c.legajo === legajoAnterior ? corregido : c
);
```

La regla es encontrar por la clave anterior y reemplazar por el objeto completo con la clave nueva, después de verificar que no esté ocupada.

**Delete — excluir.** Creamos un array que conserve a los demás:

```js
const sinAna = conLegajoCorregido.filter(c => c.legajo !== '00999');
```

`sinAna` contiene solamente a Bruno. Los arrays anteriores no fueron alterados.

### Por qué no basta con copiar el array

Este fragmento **sí modifica un objeto compartido**:

```js
const copia = [...contactos];
copia[0].telefono = 'otro'; // También afecta al objeto dentro de contactos.
```

El array es nuevo, pero sus elementos siguen apuntando a los mismos objetos. Para cambiar un contacto debemos crear también su objeto nuevo, como hicimos con `actualizado`.

Además, `const` impide reasignar una variable; no vuelve inmutable el objeto al que apunta. Las copias con `...` son superficiales. En nuestra agenda todos los campos son strings, por lo que copiar el contacto es suficiente. [Actualizar objetos en estado](https://react.dev/learn/updating-objects-in-state).

### Conectar el resultado con React y JSON

En la aplicación, cada operación calcula un array `proximos`. Luego hacemos:

```js
guardarContactos(proximos);
setContactos(proximos);
```

Primero intentamos escribir; después actualizamos el estado visible. La función `persistir` del código final captura errores de escritura y los muestra. Si la escritura falla, no anuncia éxito ni actualiza el estado aceptado.

El cálculo del array es la parte inmutable; la escritura del archivo es un efecto externo deliberado. La ejecutamos en el manejador de la acción, no durante el render ni dentro de una función actualizadora de estado.

## 7. Integrar los componentes externos

Creá `componentes.jsx` con este contenido completo:

```jsx
import React from 'react';
import {Box, Text, useInput} from 'ink';
import TextInput from 'ink-text-input';
import SelectInput from 'ink-select-input';
import {Form} from 'ink-form';

export function Buscador({valor, onCambiar, activo}) {
  return (
    <Box>
      <Text color={activo ? 'cyan' : undefined}>Buscar: </Text>
      <TextInput
        value={valor}
        onChange={onCambiar}
        focus={activo}
        placeholder="Nombre, apellido, legajo, teléfono o GitHub"
      />
    </Box>
  );
}

export function Lista({items, legajoSeleccionado, onElegir, activa}) {
  if (items.length === 0) return <Text dimColor>Sin coincidencias</Text>;

  return (
    <SelectInput
      items={items.map(contacto => ({
        label: `${contacto.apellido}, ${contacto.nombre}`,
        value: contacto.legajo
      }))}
      initialIndex={Math.max(0, items.findIndex(c => c.legajo === legajoSeleccionado))}
      limit={8}
      isFocused={activa}
      onHighlight={item => onElegir(item.value)}
    />
  );
}

export function Detalle({contacto}) {
  if (!contacto) return <Text dimColor>No hay un contacto seleccionado.</Text>;

  return (
    <Box flexDirection="column">
      <Text bold color="cyan">Detalle</Text>
      <Text>Nombre: {contacto.nombre}</Text>
      <Text>Apellido: {contacto.apellido}</Text>
      <Text>Legajo: {contacto.legajo}</Text>
      <Text>Teléfono: {contacto.telefono || '—'}</Text>
      <Text>GitHub: {contacto.github || '—'}</Text>
    </Box>
  );
}

export const campos = [
  {name: 'nombre', label: 'Nombre', required: true},
  {name: 'apellido', label: 'Apellido', required: true},
  {name: 'legajo', label: 'Legajo', required: true},
  {name: 'telefono', label: 'Teléfono'},
  {name: 'github', label: 'GitHub'}
];

export function Formulario({contacto, onGuardar, onCancelar}) {
  useInput((input, key) => {
    if (key.ctrl && input === 'x') onCancelar();
  });

  return (
    <Form
      form={{
        title: contacto.legajo ? 'Editar contacto' : 'Nuevo contacto',
        sections: [{
          title: 'Datos del contacto',
          fields: campos.map(campo => ({
            ...campo,
            type: 'string',
            initialValue: contacto[campo.name] ?? ''
          }))
        }]
      }}
      onSubmit={onGuardar}
    />
  );
}
```

### El buscador: una entrada controlada

`TextInput` recibe `value` y llama a `onChange` cuando se edita. Nuestro componente traduce esas props a `valor` y `onCambiar`.

El texto de búsqueda vive en `App` porque cada cambio debe recalcular los resultados. `focus` establece si el campo escucha el teclado. La biblioteca administra cursor, letras y retroceso; nuestra aplicación interpreta el texto.

Pasamos la función que debe ejecutarse, como `onChange={onCambiar}`. Una expresión como `onChange={setBusqueda('Ana')}` la ejecutaría durante el render, en lugar de esperar un evento.

### El maestro: adaptar los contactos a opciones

El selector espera opciones con `label` y `value`. Las construimos con `map`:

```js
{
  label: `${contacto.apellido}, ${contacto.nombre}`,
  value: contacto.legajo
}
```

`label` es presentación; `value` identifica al contacto. Al omitir una `key` específica en las opciones, el selector usa `value` para identificar sus filas. Así el legajo también distingue los elementos de la lista.

| Prop de `SelectInput` | Uso |
| --- | --- |
| `items` | Opciones que debe mostrar |
| `initialIndex` | Posición elegida al montarse |
| `limit={8}` | Hasta ocho filas visibles, con desplazamiento |
| `isFocused` | Habilitar o deshabilitar el teclado |
| `onHighlight` | Informar el contacto destacado al navegar |

`onHighlight` actualiza el detalle mientras recorremos la lista. `onSelect` corresponde a confirmar una opción; este ejemplo usa `e` para abrir la edición y no necesita ese evento. La navegación circular y el desplazamiento los resuelve la biblioteca. [Props del selector](https://github.com/vadimdemedes/ink-select-input#props).

### El detalle: una pieza específica de la agenda

`Detalle` recibe un contacto y muestra sus campos. Si no hay seleccionado, devuelve un mensaje. Un componente propio puede ser pequeño: aquí la presentación de cinco datos no requiere otra dependencia.

### El formulario: describir campos

`campos` define nombres internos, etiquetas y obligatoriedad. El `map` agrega `type: 'string'` y el valor inicial de cada campo.

`Form` conserva un borrador y administra los editores y el foco. Usamos su modo **no controlado**: damos valores iniciales y recibimos el resultado por `onSubmit`. El buscador, en cambio, es controlado porque necesitamos su valor en cada edición. [Contrato de Form](https://lukasbach.github.io/ink-form/interfaces/FormProps.html).

La biblioteca impide enviar si faltan campos requeridos. La agenda además recorta espacios y verifica que el legajo no esté repetido: esas reglas pertenecen a nuestros datos.

`onSubmit={onGuardar}` conecta directamente el evento de la biblioteca con la función que recibe un objeto de cinco campos. El legajo viaja dentro de ese objeto; no se genera otro identificador.

### Interacción del formulario

`ink-form` edita un campo por vez. Al abrirlo, pulsá Tab para enfocar el primero. Enter abre un campo y otro Enter acepta su valor en el borrador. El botón **Submit form** envía el contacto completo.

Escape descarta la edición del campo abierto. Nuestro adaptador agrega **Ctrl+X** para cancelar todo el formulario. Al volver al detalle, el formulario se desmonta y pierde su borrador. Hasta que se envíe y se guarde correctamente, los contactos aceptados permanecen intactos.

Las ayudas internas de esta biblioteca están en inglés. Su funcionamiento y sus teclas forman parte del componente que estamos incorporando.

## 8. Decidir qué estado necesita la agenda

Antes de conectar la pantalla, identifiquemos los datos que cambian:

| Estado de `App` | Para qué se conserva |
| --- | --- |
| `contactos` | Colección aceptada |
| `busqueda` | Texto del filtro |
| `legajoSeleccionado` | Identidad de la persona elegida |
| `modo` | Consulta, nuevo o editar |
| `foco` | Lista o buscador |
| `mensaje` | Resultado o error de una operación |

Los contactos filtrados, el objeto seleccionado y si estamos editando **se calculan** a partir de esos valores. No necesitan otro estado que haya que sincronizar. [Diseñar el estado en React](https://react.dev/learn/thinking-in-react).

El formulario conserva su borrador internamente. El selector conserva su posición y ventana visible. Aunque ese estado no aparezca en `App`, debemos entenderlo para coordinar las piezas.

### Filtro, identidad y selección

`initialIndex` solo determina la selección al montar el selector. Para reiniciarlo cuando cambia la búsqueda o el conjunto de legajos, calcularemos una clave:

```js
const claveLista = JSON.stringify([busqueda, filtrados.map(c => c.legajo)]);
```

`key={claveLista}` hace que React monte otra instancia de la lista cuando esa clave cambia. La instancia nueva toma el `initialIndex` que corresponde al legajo seleccionado, o al primer resultado.

No incluimos el legajo seleccionado en la clave: navegar no debe reiniciar la lista a cada pulsación. Usamos `key` para expresar cuándo queremos conservar o reiniciar el estado de un componente. [Identidad y estado en React](https://react.dev/learn/preserving-and-resetting-state).

### Una parte activa del teclado por tarea

Mientras se escribe en el buscador, el selector queda inactivo. Mientras se edita un formulario, tanto el buscador como el selector y los comandos de consulta quedan inactivos.

`App` mantiene su llamada a `useInput`, pero le pasa `{isActive: !editando}`. Cada biblioteca recibe su prop de foco. Así una letra del apellido no se interpreta como un comando de eliminación.

## 9. El CRUD completo

Con `contactos.json`, `archivo.js` y `componentes.jsx` creados, reemplazá `app.jsx` por este archivo completo:

```jsx
import React, {useState} from 'react';
import {render, Box, Text, useInput} from 'ink';
import {cargarContactos, guardarContactos} from './archivo.js';
import {Buscador, Lista, Detalle, Formulario} from './componentes.jsx';

const vacio = {nombre: '', apellido: '', legajo: '', telefono: '', github: ''};

function normalizar(texto) {
  return texto.normalize('NFD').replace(/[\u0300-\u036f]/g, '').toLowerCase();
}

function App({iniciales}) {
  const [contactos, setContactos] = useState(iniciales);
  const [busqueda, setBusqueda] = useState('');
  const [legajoSeleccionado, setLegajoSeleccionado] = useState(null);
  const [modo, setModo] = useState('consulta');
  const [foco, setFoco] = useState('lista');
  const [mensaje, setMensaje] = useState('');

  const editando = modo !== 'consulta';
  const texto = normalizar(busqueda.trim());
  const filtrados = contactos.filter(contacto =>
    ['nombre', 'apellido', 'legajo', 'telefono', 'github'].some(campo =>
      normalizar(contacto[campo]).includes(texto)
    )
  );
  const seleccionado = filtrados.find(c => c.legajo === legajoSeleccionado) ?? filtrados[0];
  const claveLista = JSON.stringify([busqueda, filtrados.map(c => c.legajo)]);

  function cambiarBusqueda(valor) {
    setBusqueda(valor);
    setLegajoSeleccionado(null);
    setMensaje('');
  }

  function abrirFormulario(nuevoModo) {
    setModo(nuevoModo);
    setMensaje('');
  }

  function cancelar() {
    setModo('consulta');
    setMensaje('Operación cancelada.');
  }

  function persistir(proximos) {
    try {
      guardarContactos(proximos);
      setContactos(proximos);
      return true;
    } catch (error) {
      setMensaje(`No se pudo guardar: ${error.message}`);
      return false;
    }
  }

  function guardar(borrador) {
    const contacto = {...borrador};
    for (const campo of Object.keys(vacio)) contacto[campo] = contacto[campo].trim();

    if (!contacto.nombre || !contacto.apellido || !contacto.legajo) {
      setMensaje('Completá nombre, apellido y legajo.');
      return;
    }
    const esNuevo = modo === 'nuevo';
    const legajoAnterior = esNuevo ? null : seleccionado.legajo;
    if (contactos.some(c => c.legajo === contacto.legajo && c.legajo !== legajoAnterior)) {
      setMensaje('Ya existe un contacto con ese legajo.');
      return;
    }

    const proximos = esNuevo
      ? [...contactos, contacto]
      : contactos.map(c => c.legajo === legajoAnterior ? contacto : c);

    if (!persistir(proximos)) return;
    setBusqueda('');
    setLegajoSeleccionado(contacto.legajo);
    setModo('consulta');
    setMensaje(esNuevo ? 'Contacto creado y guardado.' : 'Contacto actualizado y guardado.');
  }

  function eliminar() {
    if (!seleccionado) return;
    const proximos = contactos.filter(c => c.legajo !== seleccionado.legajo);
    if (!persistir(proximos)) return;
    setLegajoSeleccionado(null);
    setMensaje('Contacto eliminado y JSON actualizado.');
  }

  useInput((input, key) => {
    if (key.escape) {
      cambiarBusqueda('');
      setFoco('lista');
      return;
    }
    if (key.tab) {
      setFoco(actual => actual === 'lista' ? 'buscar' : 'lista');
      return;
    }
    if (foco === 'buscar') {
      if (key.return) setFoco('lista');
      return;
    }
    if (input === '/') setFoco('buscar');
    if (input === 'n') abrirFormulario('nuevo');
    if (input === 'e' && seleccionado) abrirFormulario('editar');
    if (input === 'd') eliminar();
  }, {isActive: !editando});

  return (
    <Box flexDirection="column">
      <Text bold color="cyan">AGENDA · {editando ? 'formulario' : foco}</Text>
      <Buscador
        valor={busqueda}
        onCambiar={cambiarBusqueda}
        activo={!editando && foco === 'buscar'}
      />
      <Box flexDirection="row" height={editando ? 28 : undefined}>
        <Box width="30%" flexDirection="column" borderStyle="round" paddingX={1}>
          <Text bold>Contactos</Text>
          <Lista
            key={claveLista}
            items={filtrados}
            legajoSeleccionado={seleccionado?.legajo}
            onElegir={setLegajoSeleccionado}
            activa={!editando && foco === 'lista'}
          />
        </Box>
        <Box width="70%" flexDirection="column" borderStyle="round" paddingX={1}>
          {editando ? (
            <Formulario
              contacto={modo === 'nuevo' ? vacio : seleccionado}
              onGuardar={guardar}
              onCancelar={cancelar}
            />
          ) : <Detalle contacto={seleccionado} />}
        </Box>
      </Box>
      <Text dimColor>
        {filtrados.length} de {contactos.length} contactos
        {' · '}Archivo: contactos.json
      </Text>
      <Text color="yellow" wrap="truncate">{mensaje || ' '}</Text>
      <Text dimColor>
        {editando ? 'Tab / ↑ ↓: campo · Enter: editar o aceptar campo · Submit form: guardar' : foco === 'buscar'
          ? 'Escribí para filtrar · Enter: lista · Esc: limpiar'
          : 'n: nuevo · e: editar · d: eliminar · /: buscar · ↑ ↓: elegir'}
      </Text>
      <Text dimColor>{editando
        ? 'Esc: deshacer campo · Ctrl+X: cancelar formulario · Ctrl+C: salir'
        : 'Tab: lista / búsqueda · Esc: limpiar · Ctrl+C: salir'}</Text>
    </Box>
  );
}

render(<App iniciales={cargarContactos()} />);
```

### Leer el flujo principal

Al iniciar, `cargarContactos()` obtiene el array y se lo pasa a `App`. La prop `iniciales` sirve para inicializar el estado; las operaciones posteriores usan `contactos`.

Cada edición del buscador cambia `busqueda`, reinicia la selección y recalcula `filtrados`. La búsqueda ignora mayúsculas y diacríticos, incluyendo la equivalencia entre `ñ` y `n`. Si el legajo elegido no aparece en los resultados, mostramos el primero. Si no hay resultados, mostramos el estado vacío.

Al pulsar `n` o `e`, cambia `modo`. El panel derecho monta `Formulario` con campos vacíos o con el contacto seleccionado. La lista permanece visible y no cambia de selección mientras se edita.

### Guardar un contacto

`guardar` recibe el borrador y crea una copia. Recorta espacios exteriores y comprueba obligatorios y unicidad del legajo.

En un alta, `legajoAnterior` es `null`: ningún contacto existente puede tener el legajo propuesto. En una edición, el legajo anterior identifica al registro que estamos reemplazando. Este registro se excluye del control de duplicados.

Después se aplica el CRUD inmutable: `[...]` agrega o `map` reemplaza. `persistir` intenta escribir el array y después lo asigna al estado. Si funciona, se limpia la búsqueda, se selecciona el legajo guardado y vuelve el detalle. El mismo flujo admite corregir el legajo.

### Eliminar un contacto

`eliminar` usa `filter` para excluir el legajo seleccionado. Tras guardar, conserva el filtro y reinicia la selección al primer resultado disponible. Si se elimina el último contacto, el array y el JSON quedan vacíos.

La eliminación es directa, con un mensaje de resultado en la pantalla. El foco en la lista es lo que habilita ese comando.

### Renderizado condicional

Esta elección es la que transforma el detalle en formulario:

```jsx
{editando ? (
  <Formulario contacto={contacto} onGuardar={guardar} onCancelar={cancelar} />
) : (
  <Detalle contacto={seleccionado} />
)}
```

Es un fragmento explicativo; el archivo completo calcula el contacto del formulario según el modo. La estructura exterior del panel se conserva y cambia el componente que contiene.

Reservamos 28 filas para el panel durante la edición para que entren el formulario, sus bordes y sus ayudas. Los mensajes de aplicación quedan debajo.

## 10. Usar y comprobar la aplicación

Ejecutá desde `agenda-ink`:

```bash
npm start
```

| Contexto | Tecla | Acción |
| --- | --- | --- |
| Lista | `↑` / `↓` | Recorrer; después del último vuelve al primero |
| Lista | `n` | Crear |
| Lista | `e` | Editar seleccionado |
| Lista | `d` | Eliminar seleccionado |
| Lista | `/` | Activar búsqueda |
| Búsqueda | Escribir | Filtrar en caliente |
| Búsqueda | `Enter` | Volver a la lista conservando filtro |
| Consulta | `Tab` | Alternar lista y búsqueda |
| Consulta | `Esc` | Limpiar filtro y volver a la lista |
| Formulario, campo cerrado | `Tab`, `Shift+Tab`, `↑` o `↓` | Recorrer campos y botón de envío |
| Campo seleccionado | `Enter` | Abrir el editor |
| Campo abierto | `Enter` | Aceptar el campo en el borrador |
| Campo abierto | `Esc` | Descartar la edición de ese campo |
| Botón Submit form | `Enter` | Enviar y guardar el contacto |
| Formulario | `Ctrl+X` | Cancelar el formulario completo |
| Aplicación | `Ctrl+C` | Salir |

El código fue comprobado con Node.js 24.19.0 y las versiones incluidas. Estas pruebas permiten verificar el funcionamiento:

| Prueba | Resultado esperado |
| --- | --- |
| Crear un contacto con legajo `00007` | Se conserva exactamente ese texto |
| Crear otro con `00007` | Rechaza el duplicado |
| Editar nombre y teléfono | Reemplaza los datos del mismo legajo |
| Cambiar el legajo a uno libre | Desaparece la clave anterior y se selecciona la nueva |
| Cambiar el legajo al de otro contacto | Rechaza el cambio y mantiene abierto el formulario |
| Aceptar un campo y cancelar con Ctrl+X | No cambia la colección ni se guarda el borrador |
| Buscar por apellido, legajo, teléfono o GitHub | Lista y detalle coinciden con el resultado |
| Buscar un texto inexistente | Presenta una lista y un detalle vacíos |
| Escribir `n`, `e` o `d` en el buscador | Son texto, no operaciones del CRUD |
| Eliminar desde un filtro | Elimina solo al seleccionado |
| Eliminar el último | JSON `[]`; se puede volver a crear |
| Cerrar y volver a abrir | Recupera los cambios guardados |

También conviene probar más de ocho contactos para observar el desplazamiento y cambiar una búsqueda sin alterar sus coincidencias para comprobar el reinicio de selección.

Para inspeccionar la persistencia, abrí `contactos.json` después de una operación. Cada guardado reemplaza el array completo. Si querés editar ese archivo a mano, cerrá primero la agenda y respetá el formato de los datos.

## 11. Extender el ejemplo

Estas propuestas mantienen el mismo modelo de componentes y datos:

- **Búsqueda por varias palabras:** separar términos y exigir que todos coincidan en alguno de los campos usando `every` y `some`.
- **Ordenación por apellido y nombre:** ordenar una copia con `toSorted`, conservando el legajo como identidad.
- **Deshacer una baja:** conservar el array anterior y restaurarlo mediante el mismo guardado JSON.
- **Validación de GitHub:** acordar un formato para el usuario y mostrar un mensaje si no se cumple.
- **Importación:** leer otro JSON, detectar legajos repetidos y definir si se rechazan o actualizan.
- **Otro almacenamiento:** conservar los componentes y reemplazar las funciones de `archivo.js` por acceso a una base de datos.

Si agregás propiedades que también sean objetos, revisá las copias: habrá que copiar los niveles que se modifiquen, no solamente el objeto exterior.

## 12. Trabajo práctico

Construí una agenda con estos cinco campos y el legajo como identificador. Usá `TextInput`, `SelectInput` y `Form` como componentes externos esenciales.

La aplicación debe permitir crear, consultar, buscar, editar y eliminar; usar el panel de detalle como formulario; impedir legajos repetidos; descartar borradores al cancelar y persistir cada operación completada en JSON.

Agregá dos extensiones:

1. Búsqueda por varias palabras, que pueden coincidir en campos distintos.
2. Una operación de deshacer la última eliminación, implementada mediante reemplazo inmutable del array.

Entregá fuentes, `package.json`, `package-lock.json`, un JSON de contactos ficticios y un README con ejecución, teclas y supuestos. No incluyas `node_modules`.

Explicá brevemente:

- Qué responsabilidad cumple React y cuál cumple Ink.
- Qué resuelve cada biblioteca externa y cómo recibe sus eventos la aplicación.
- Qué datos son estado y cuáles se calculan.
- Cómo se conserva la coherencia cuando se modifica un legajo.
- Por qué las operaciones de alta, modificación y baja son inmutables.
- Cuándo se escribe el archivo y qué ocurre al cancelar un formulario.

**Criterio de finalización:** las operaciones funcionan tanto con varios contactos como con un array vacío, la ficha coincide con la selección y los cambios aceptados se recuperan al volver a abrir la aplicación.
