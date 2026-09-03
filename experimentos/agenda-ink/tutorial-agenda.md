# Tutorial: construir una agenda de terminal con Ink

## La idea principal

Vamos a construir una agenda de contactos que se ejecuta en la terminal. Permitira:

- buscar contactos por legajo, nombre, apellido, telefono o GitHub;
- recorrer los resultados con las flechas;
- crear y editar contactos;
- borrar contactos con confirmacion;
- guardar los datos en `agenda.json`;
- salir con `Esc` desde la busqueda o con `Q` desde la lista.

La herramienta visual que usaremos es **Ink**. Ink permite describir una interfaz de terminal usando componentes y JSX, una sintaxis que se parece a HTML. Para entenderlo no hace falta conocer React de antemano: iremos incorporando solamente las ideas de React que la agenda necesita.

El resultado final queda dividido en cuatro archivos:

```text
agenda-terminal-kit/
├── agenda.jsx       # interfaz, eventos y estado
├── datos.js         # lectura, escritura y operaciones sobre contactos
├── agenda.json      # datos de alumnos persistidos
└── package.json     # dependencias y comando de ejecucion
```

Los contactos se cargan desde `alumnos.md` y se guardan en `agenda.json` con esta estructura:

```js
{
    id: 63409,
    legajo: "63409",
    nombre: "Ulices Mateo",
    apellido: "Acosta",
    telefono: "(381)236-4228",
    github: "AcostaUlices"
}
```

La aplicacion se inicia con:

```bash
npm install
npm run ink
```

## Como leer este tutorial

La explicacion sigue la piramide de Minto:

1. **Respuesta:** que vamos a construir y cual es la arquitectura.
2. **Argumentos:** por que Ink, React y una separacion entre interfaz y datos resuelven el problema.
3. **Evidencia y detalles:** como se implementa cada parte, desde un componente minimo hasta la agenda completa.

---

## 1. Preparar el proyecto

Necesitamos Node.js 18 o superior. El archivo `package.json` contiene las dependencias principales:

```json
{
  "type": "module",
  "scripts": {
    "ink": "tsx agenda.jsx"
  },
  "dependencies": {
    "ink": "^7.1.1",
    "ink-text-input": "^6.0.0",
    "react": "^19.2.8"
  },
  "devDependencies": {
    "tsx": "^4.23.13"
  }
}
```

### Que aporta cada paquete

- `ink`: componentes para construir interfaces de terminal.
- `react`: modelo de componentes y estado que Ink utiliza.
- `ink-text-input`: campo de texto listo para recibir escritura.
- `tsx`: ejecuta archivos `.jsx` y transforma JSX antes de que Node.js los cargue.

La propiedad siguiente es importante:

```json
"type": "module"
```

Indica que los archivos `.js` y `.jsx` usan módulos ECMAScript. Por eso escribimos `import` y `export`, en lugar de `require` y `module.exports`.

---

## 2. Primer programa Ink

Antes de construir una agenda, hagamos una pantalla minima:

```jsx
import React from "react";
import { render, Text } from "ink";

function Saludo() {
    return <Text>Hola desde la terminal</Text>;
}

render(<Saludo />);
```

Hay tres ideas nuevas:

### Componentes

Un componente es una funcion que devuelve una descripcion de la interfaz. Por convencion, su nombre empieza con mayuscula:

```jsx
function Saludo() {
    return <Text>Hola desde la terminal</Text>;
}
```

`Saludo` no imprime directamente. Devuelve un elemento `Text`, e Ink se encarga de dibujarlo.

### JSX

Esto:

```jsx
<Text>Hola desde la terminal</Text>
```

es JSX. Parece una etiqueta HTML, pero representa una llamada a un componente. En Ink usamos componentes de terminal como `Text` y `Box`, no elementos HTML como `div` o `p`.

### Renderizado

La funcion `render` recibe el componente inicial:

```jsx
render(<Saludo />);
```

Desde ese componente se construye el resto del arbol de la interfaz.

---

## 3. Los componentes visuales de Ink

La agenda usa principalmente dos componentes:

```jsx
<Box flexDirection="column">
    <Text bold>AGENDA</Text>
    <Text>Contactos disponibles</Text>
</Box>
```

- `Text` muestra texto.
- `Box` organiza otros componentes.

`Box` usa propiedades parecidas a Flexbox:

```jsx
<Box flexDirection="column" gap={1}>
    <Text>Primera linea</Text>
    <Text>Segunda linea</Text>
</Box>
```

Algunas propiedades que aparecen en la agenda son:

- `flexDirection="column"`: apila los hijos verticalmente.
- `gap={1}`: deja un espacio entre hijos.
- `paddingX={1}`: agrega espacio horizontal interno.
- `width` y `height`: establecen dimensiones.
- `borderStyle="round"`: dibuja un borde.
- `borderColor="cyan"`: cambia el color del borde.
- `backgroundColor="brightCyan"`: pinta el fondo.

Para no repetir el borde de cada panel, la agenda define un componente propio:

```jsx
function Panel({ titulo, activo, ancho, alto, children }) {
    return (
        <Box
            flexDirection="column"
            borderStyle="round"
            borderColor={activo ? "cyan" : "gray"}
            paddingX={1}
            width={ancho}
            height={alto}
        >
            <Text bold>{titulo}</Text>
            <Box marginTop={1} flexDirection="column">
                {children}
            </Box>
        </Box>
    );
}
```

`Panel` recibe datos entre llaves. Esos datos se llaman **props**. Por ejemplo:

```jsx
<Panel titulo="DETALLE" activo ancho="60%" alto={20}>
    <Text>Informacion del contacto</Text>
</Panel>
```

`children` es un prop especial: contiene lo que escribimos entre la apertura y el cierre de `Panel`.

---

## 4. Separar los datos de la interfaz

La interfaz no deberia saber como se abre un archivo ni como se calcula el proximo ID. Esas tareas viven en `datos.js`.

### Modulos ESM y rutas

```js
import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const ARCHIVO = path.join(__dirname, "agenda.json");
```

En CommonJS existian `__filename` y `__dirname` automaticamente. En ESM los calculamos a partir de `import.meta.url`.

### Leer y guardar

```js
function cargarContactos() {
    try {
        return JSON.parse(fs.readFileSync(ARCHIVO, "utf8"));
    } catch {
        return [];
    }
}

function guardarContactos(contactos) {
    fs.writeFileSync(ARCHIVO, `${JSON.stringify(contactos, null, 2)}\n`);
}
```

Si `agenda.json` no existe o tiene un error, `cargarContactos` devuelve un array vacio. `guardarContactos` convierte el array a JSON indentado para que el archivo siga siendo legible.

### Exportar funciones

```js
export {
    cargarContactos,
    filtrarContactos,
    guardarContactos,
    nombreCompleto,
    siguienteId
};
```

Luego `agenda.jsx` puede importarlas:

```jsx
import {
    cargarContactos,
    filtrarContactos,
    guardarContactos,
    nombreCompleto,
    siguienteId
} from "./datos.js";
```

La extension `.js` es necesaria en imports ESM locales.

### Filtrar contactos

La busqueda debe ignorar mayusculas y acentos. Primero normalizamos el texto:

```js
const normalizar = texto => String(texto)
    .toLowerCase()
    .normalize("NFD")
    .replace(/\p{Diacritic}/gu, "");
```

Despues convertimos la consulta en palabras y exigimos que todas aparezcan:

```js
function filtrarContactos(contactos, consulta) {
    const palabras = normalizar(consulta).trim().split(/\s+/);

    if (!palabras[0]) {
        return contactos;
    }

    return contactos.filter(contacto => {
        const texto = normalizar(
            `${contacto.legajo} ${nombreCompleto(contacto)} ${contacto.telefono} ${contacto.github}`
        );

        return palabras.every(palabra => texto.includes(palabra));
    });
}
```

Por ejemplo, `63409 acosta` encuentra un contacto si su legajo y su apellido contienen esas dos palabras, sin importar el orden. También se puede buscar por usuario de GitHub.

---

## 5. El estado: la memoria visible de la interfaz

React llama **estado** a la informacion que puede cambiar y que debe provocar un nuevo dibujo de la interfaz.

En la agenda, el estado principal es:

```jsx
const [contactos, setContactos] = useState(cargarContactos);
const [consulta, setConsulta] = useState("");
const [indice, setIndice] = useState(0);
const [foco, setFoco] = useState("buscar");
const [edicion, setEdicion] = useState(null);
const [borrando, setBorrando] = useState(null);
const [mensaje, setMensaje] = useState("");
```

Cada llamada a `useState` devuelve dos cosas:

```jsx
const [valor, setValor] = useState(valorInicial);
```

- `valor`: el valor actual.
- `setValor`: la funcion para cambiarlo.

Por ejemplo:

```jsx
setConsulta(valor);
setIndice(0);
```

Cuando cambia el estado, React vuelve a ejecutar el componente `Agenda` y Ink actualiza solo lo necesario en la terminal.

Los resultados no necesitan otro estado porque se calculan a partir de datos existentes:

```jsx
const resultados = filtrarContactos(contactos, consulta);
const seleccionado = resultados[indice] ?? null;
```

Es mejor calcular un dato derivado que duplicarlo en otro estado. Asi evitamos que dos variables se contradigan.

---

## 6. La lista maestra

La lista recibe contactos, indice y dimensiones como props:

```jsx
function Lista({ contactos, indice, alto, activa }) {
    const cantidad = Math.max(1, alto - 4);
    const inicio = Math.max(0, Math.min(indice, contactos.length - cantidad));

    return (
        <Panel
            titulo={`CONTACTOS · ${contactos.length}`}
            activo={activa}
            ancho="40%"
            alto={alto}
        >
            {contactos.length === 0 ? (
                <Text dimColor>Sin resultados</Text>
            ) : contactos.slice(inicio, inicio + cantidad).map((contacto, posicion) => {
                const seleccionado = inicio + posicion === indice;

                return (
                    <Box
                        key={contacto.id}
                        width="100%"
                        backgroundColor={seleccionado ? "brightCyan" : undefined}
                    >
                        <Text bold={seleccionado} color={seleccionado ? "black" : undefined}>
                            {seleccionado ? "▶ " : "  "}{nombreCompleto(contacto)}
                        </Text>
                    </Box>
                );
            })}
        </Panel>
    );
}
```

### Recorrer un array en JSX

El metodo `map` transforma cada contacto en una fila visual:

```jsx
contactos.map(contacto => <Text key={contacto.id}>{nombreCompleto(contacto)}</Text>)
```

Cada elemento necesita una `key` estable. Usamos el ID del contacto porque identifica la fila aunque cambie su posicion.

### Mostrar la seleccion

La expresion:

```jsx
const seleccionado = posicion === indice;
```

permite cambiar el aspecto de una sola fila. La fila seleccionada tiene fondo, color, negrita y un marcador `▶`.

`inicio` y `cantidad` limitan las filas visibles. Cuando hay muchos contactos, la lista puede desplazarse sin dibujar todos los elementos de una vez.

---

## 7. El detalle y el formulario

El detalle es un componente presentacional: recibe un contacto y solo lo muestra.

La constante `CAMPOS` define los cinco campos que la agenda muestra y edita:

```jsx
const CAMPOS = [
    ["legajo", "Legajo"],
    ["nombre", "Nombre"],
    ["apellido", "Apellido"],
    ["telefono", "Teléfono"],
    ["github", "GitHub"]
];
```

```jsx
function Detalle({ contacto, alto, activo }) {
    return (
        <Panel titulo="DETALLE" activo={activo} ancho="60%" alto={alto}>
            {contacto ? CAMPOS.map(([clave, etiqueta]) => (
                <Box key={clave} marginBottom={1}>
                    <Box width={11}><Text dimColor>{etiqueta}</Text></Box>
                    <Text>{contacto[clave] || "—"}</Text>
                </Box>
            )) : (
                <Text dimColor>No hay un contacto seleccionado.</Text>
            )}
        </Panel>
    );
}
```

El editor usa otro estado local: `valores`, `campo` y `error`.

```jsx
const [valores, setValores] = useState({
    legajo: contacto?.legajo ?? "",
    nombre: contacto?.nombre ?? "",
    apellido: contacto?.apellido ?? "",
    telefono: contacto?.telefono ?? "",
    github: contacto?.github ?? ""
});
const [campo, setCampo] = useState(0);
const [error, setError] = useState("");
```

El operador `?.` permite acceder a un contacto que puede no existir, y `??` usa una cadena vacia cuando el valor es `null` o `undefined`.

El cursor del formulario se dibuja igual que el de la lista:

```jsx
<Box
    width="100%"
    backgroundColor={indice === campo ? "brightCyan" : undefined}
>
    <Text bold={indice === campo} color={indice === campo ? "black" : undefined}>
        {indice === campo ? "▶" : " "}
    </Text>
    <Text
        bold={indice === campo}
        color={indice === campo ? "black" : undefined}
        dimColor={indice !== campo}
    >
        {etiqueta}
    </Text>
</Box>
```

La expresion condicional decide si se muestra el `TextInput` o el valor guardado:

```jsx
{indice === campo ? (
    <TextInput
        value={valores[clave]}
        color="black"
        onChange={valor => {
            setValores({ ...valores, [clave]: valor });
            setError("");
        }}
    />
) : (
    <Text>{valores[clave] || "—"}</Text>
)}
```

`onChange` recibe lo que escribe la persona y actualiza una copia del objeto. La sintaxis:

```js
{ ...valores, [clave]: valor }
```

conserva los campos anteriores y reemplaza solo el campo editado.

---

## 8. Entrada de teclado con `useInput`

Ink ofrece el hook `useInput` para escuchar las teclas:

```jsx
useInput((entrada, tecla) => {
    if (tecla.upArrow) {
        setCampo(actual => actual - 1);
    }
});
```

- `entrada` contiene caracteres escritos, como `n` o `q`.
- `tecla` contiene teclas especiales, como `return`, `escape`, `upArrow` y `downArrow`.

En el editor, `Tab`, `Enter` y las flechas cambian de campo:

```jsx
useInput((entrada, tecla) => {
    if (tecla.escape) {
        onCancelar();
    } else if (tecla.upArrow || (tecla.tab && tecla.shift)) {
        setCampo(actual => (actual + CAMPOS.length - 1) % CAMPOS.length);
    } else if (tecla.return && campo === CAMPOS.length - 1) {
        guardar();
    } else if (tecla.return || tecla.tab || tecla.downArrow) {
        setCampo(actual => (actual + 1) % CAMPOS.length);
    }
});
```

El operador `%` hace que el cursor vuelva al primer campo después del ultimo y al ultimo después del primero.

En `Agenda` hay un manejador global para salir con `Ctrl+Q`:

```jsx
useInput((entrada, tecla) => {
    if (tecla.ctrl && entrada.toLowerCase() === "q") {
        exit();
    }
});
```

El segundo manejador controla la navegacion normal:

```jsx
useInput((entrada, tecla) => {
    if (foco === "buscar") {
        if (tecla.return || tecla.tab) {
            setFoco("lista");
        } else if (tecla.escape) {
            exit();
        }
        return;
    }

    if (tecla.escape || tecla.tab) {
        setFoco("buscar");
    } else if (tecla.upArrow) {
        mover(-1);
    } else if (tecla.downArrow) {
        mover(1);
    } else if (tecla.return || entrada.toLowerCase() === "e") {
        if (seleccionado) {
            setEdicion(seleccionado);
        }
    } else if (entrada.toLowerCase() === "n") {
        setEdicion({});
    } else if ((entrada.toLowerCase() === "d" || tecla.delete) && seleccionado) {
        setBorrando(seleccionado);
    } else if (entrada.toLowerCase() === "q") {
        exit();
    }
}, { isActive: !ocupado });
```

`isActive: !ocupado` desactiva la navegacion principal cuando hay un formulario o una confirmacion abierta. Asi una tecla no puede modificar la lista mientras se esta editando.

---

## 9. Crear, editar, borrar y persistir

La agenda no guarda directamente desde el formulario. El editor valida los datos y llama a `onGuardar`, que es una prop.

La funcion `guardar` decide si crea o actualiza:

```jsx
function guardar(datos) {
    const esNuevo = edicion.id === undefined;
    const contacto = esNuevo
        ? { id: siguienteId(contactos), ...datos }
        : { ...edicion, ...datos };
    const nuevos = esNuevo
        ? [...contactos, contacto]
        : contactos.map(actual => actual.id === contacto.id ? contacto : actual);

    if (!persistir(nuevos, esNuevo ? "Contacto creado" : "Contacto actualizado")) {
        return;
    }

    setConsulta("");
    setIndice(nuevos.findIndex(actual => actual.id === contacto.id));
    setEdicion(null);
    setFoco("lista");
}
```

Observa que no modificamos `contactos` con `push`. Creamos un array nuevo con `...contactos`. Esta practica facilita que React detecte el cambio.

La persistencia esta concentrada en una funcion:

```jsx
function persistir(nuevos, texto) {
    try {
        guardarContactos(nuevos);
        setContactos(nuevos);
        setMensaje(texto);
        return true;
    } catch {
        setMensaje("No se pudo guardar agenda.json");
        return false;
    }
}
```

El borrado sigue el mismo esquema:

```jsx
function borrar() {
    const nuevos = contactos.filter(contacto => contacto.id !== borrando.id);

    if (!persistir(nuevos, "Contacto eliminado")) {
        return;
    }

    setIndice(0);
    setBorrando(null);
}
```

`filter` crea un array sin el contacto seleccionado. La confirmacion existe para que borrar no sea accidental.

---

## 10. Armar la pantalla principal

El componente `Agenda` decide que panel aparece a la derecha:

```jsx
const detalle = borrando ? (
    <ConfirmarBorrado
        contacto={borrando}
        alto={alto}
        onConfirmar={borrar}
        onCancelar={() => setBorrando(null)}
    />
) : edicion ? (
    <Editor
        key={edicion.id ?? "nuevo"}
        contacto={edicion.id === undefined ? null : edicion}
        alto={alto}
        onGuardar={guardar}
        onCancelar={() => setEdicion(null)}
    />
) : (
    <Detalle contacto={seleccionado} alto={alto} activo={foco === "lista"} />
);
```

La expresion condicional funciona como una pequena maquina de estados:

| Estado | Panel mostrado |
| --- | --- |
| `borrando` contiene un contacto | Confirmacion de borrado |
| `edicion` no es `null` | Formulario |
| ninguno de los anteriores | Detalle |

Finalmente se organizan encabezado, busqueda, lista, detalle y estado:

```jsx
return (
    <Box flexDirection="column" paddingX={1}>
        <Box marginBottom={1}>
            <Text bold color="cyan">AGENDA</Text>
            <Spacer />
            <Text dimColor>{contactos.length} contactos</Text>
        </Box>

        <Box borderStyle="round" paddingX={1} marginBottom={1}>
            <Text bold>Buscar: </Text>
            <TextInput
                value={consulta}
                focus={foco === "buscar" && !ocupado}
                placeholder="legajo, nombre, teléfono o GitHub"
                onChange={valor => {
                    setConsulta(valor);
                    setIndice(0);
                }}
            />
        </Box>

        <Box gap={1}>
            <Lista contactos={resultados} indice={indice} alto={alto} activa={foco === "lista" && !ocupado} />
            {detalle}
        </Box>
    </Box>
);
```

`Spacer` ocupa el espacio disponible y separa el titulo de la cantidad de contactos.

---

## 11. Cargar Ink y React

La agenda carga los paquetes al iniciar:

```jsx
async function iniciar() {
    React = (await import("react")).default;
    const Ink = await import("ink");

    ({ Box, Spacer, Text, render, useApp, useInput, useWindowSize } = Ink);
    ({ useState } = React);
    TextInput = (await import("ink-text-input")).default;

    render(<Agenda />, { alternateScreen: true, exitOnCtrlC: false });
}

iniciar().catch(console.error);
```

Aqui aparecen dos formas de importar:

- `import ... from` se usa para el modulo local `datos.js`.
- `await import(...)` es un import dinamico, util para cargar Ink y React dentro de `iniciar`.

`useApp` aporta `exit`, `useWindowSize` informa las filas disponibles y `render` dibuja la aplicacion. `alternateScreen: true` usa una pantalla alternativa de terminal para que la sesion original quede restaurada al salir.

---

## 12. Probar la agenda

Desde la carpeta `experimentos/agenda-terminal-kit`:

```bash
npm install
npm run ink
```

Prueba este recorrido:

1. Escribe `ana` en la busqueda.
2. Presiona `Tab` o `Enter` para pasar a la lista.
3. Usa `Up` y `Down` para mover el cursor.
4. Presiona `N` para crear un contacto.
5. Completa nombre y apellido; usa `Tab` para cambiar de campo.
6. Presiona `Enter` en el ultimo campo para guardar.
7. Presiona `E` sobre un contacto para editarlo.
8. Presiona `D` y luego `Enter` para borrarlo.
9. Presiona `Esc` en la busqueda para salir.

Despues de guardar, revisa `agenda.json`. Ese archivo contiene el estado persistente de la agenda.

---

## 13. Que aprendimos

La agenda es un ejemplo pequeno pero completo de una interfaz reactiva:

- **Ink** traduce componentes JSX a texto y colores de terminal.
- **React** aporta componentes, props y estado.
- **`useState`** guarda la informacion que cambia durante la ejecucion.
- **`useInput`** conecta teclas con acciones.
- **JSX condicional** permite alternar detalle, edicion y confirmacion.
- **`datos.js`** separa persistencia y busqueda de la interfaz.
- **ESM** organiza los modulos con `import` y `export`.
- **`tsx`** permite ejecutar JSX moderno desde Node.js.

La regla practica para extenderla es sencilla: si una nueva funcion cambia la pantalla, probablemente necesita estado y un componente; si transforma o guarda contactos, probablemente pertenece en `datos.js`.

## Ejercicios sugeridos

1. Agregar un campo `nota` al contacto y mostrarlo en el detalle.
2. Permitir ordenar por apellido.
3. Agregar una tecla para restaurar todos los contactos de ejemplo.
4. Mostrar un mensaje diferente cuando la busqueda no devuelve resultados.
5. Extraer un componente `FilaContacto` para reutilizarlo en la lista y en el editor.
