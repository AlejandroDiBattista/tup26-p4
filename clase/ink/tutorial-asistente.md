# Cómo construir un asistente de terminal con Ink

Este tutorial explica, paso a paso, el programa de [asistente.jsx](./asistente.jsx). Al terminar vas a entender cómo conversa con un modelo, cómo le ofrece herramientas para leer y escribir archivos, y cómo muestra las respuestas en la terminal.

La idea central es sencilla: **Ink dibuja la interfaz; la API produce respuestas; nuestro código ejecuta las herramientas**. La API puede *solicitar* una herramienta, pero no lee ni escribe archivos por sí misma.

## 1. Preparar el proyecto

El programa usa React, Ink, los componentes de `@inkjs/ui` y `tsx` para ejecutar JSX con Node.js. Desde `clase/ink`:

```bash
npm install
npm run assistant
```

El script `assistant` de `package.json` ejecuta `node --import tsx asistente.jsx`. Para usar la API, configurá `OPENAI_API_KEY` en el entorno. Por ejemplo, desde `clase/ink`, podés crear un archivo `.env` y cargarlo al ejecutar:

```dotenv
OPENAI_API_KEY=tu_clave
```

```bash
node --env-file=.env --import tsx asistente.jsx
```

El programa usa OpenAI y el modelo `gpt-6-sol`. No pongas una clave real en un archivo que vayas a publicar.

**Importan dos ubicaciones diferentes:** `.env` se busca en `clase/.env`; `AGENTS.md` y los archivos de las herramientas se buscan en el **directorio desde el que ejecutás** el programa (`process.cwd()`). Si seguís los comandos anteriores, ese directorio es `clase/ink`.

## 2. Empezar por una interfaz mínima

Ink permite usar componentes de React dentro de la terminal. El programa importa `Box` para organizar elementos, `Text` para mostrar texto y `Static` para dejar los mensajes anteriores en el historial normal de la terminal. `TextInput` recibe el mensaje del usuario y `Spinner` indica que hay una consulta en curso.

```jsx
import React, {useState} from 'react'
import {render, Box, Static, Text} from 'ink'
import {Spinner, TextInput} from '@inkjs/ui'
```

Al final del archivo, `render(<App />)` monta la interfaz. La función `App` mantiene dos estados:

- `eventos`: mensajes visibles y mensajes internos necesarios para la API.
- `ocupado`: indica si el asistente está esperando una respuesta.

No hace falta guardar otro estado para el historial de la API: se obtiene de los eventos que tienen la propiedad `api`.

## 3. Configurar la API

La URL y el modelo se definen directamente en el código. Node.js proporciona la clave mediante `process.env.OPENAI_API_KEY`, igual que en los ejemplos de `clase/llm`:

```jsx
const URL_API = 'https://api.openai.com/v1/chat/completions'
const MODELO = 'gpt-6-sol'
```

En cada petición, el encabezado `Authorization` usa `process.env.OPENAI_API_KEY`.

## 4. Definir el comportamiento del asistente

El asistente empieza con instrucciones generales: responder en el idioma del usuario y usar herramientas únicamente cuando la tarea requiera archivos. Si existe un `AGENTS.md` en el directorio de trabajo, el programa agrega su contenido a las instrucciones del sistema.

```jsx
const directorioTrabajo = process.cwd()
let instrucciones = ''

try {
    instrucciones = await readFile(resolve(directorioTrabajo, 'AGENTS.md'), 'utf8')
} catch (error) {
    if (error.code !== 'ENOENT') throw error
}
```

`ENOENT` significa que el archivo no existe; en ese caso el asistente sigue siendo general. Podés crear un `AGENTS.md` para darle un rol particular, por ejemplo el de tutor o asistente de programación, sin modificar el código. El archivo se lee **al iniciar** el programa: si lo cambiás, reiniciá el asistente.

## 5. Escribir las funciones que manejan archivos

Las herramientas reales son funciones comunes de JavaScript. La lectura devuelve el contenido del archivo o una cadena vacía si falla. La escritura crea primero las carpetas que falten y después guarda el contenido completo:

```jsx
function leerArchivo({path}) {
    return readFile(resolve(directorioTrabajo, path), 'utf8').catch(() => '')
}

async function escribirArchivo({path, content}) {
    const destino = resolve(directorioTrabajo, path)
    await mkdir(dirname(destino), {recursive: true})
    await writeFile(destino, content, 'utf8')
    return `Archivo escrito correctamente: ${path}`
}
```

`writeFile` **reemplaza** el contenido si el archivo ya existe. Si querés modificar solo una parte, primero hay que leer el archivo y luego escribir su contenido completo con el cambio incorporado.

## 6. Describir esas funciones para el modelo

El modelo necesita saber qué herramientas existen y qué argumentos acepta cada una. El objeto `herramientas` reúne la descripción que verá la API, el verbo que mostrará la interfaz y la función que ejecutará Node.js:

```jsx
const herramientas = {
    read_file: {
        descripcion: 'Lee un archivo de texto.',
        campos: {path: 'Ruta relativa al directorio de trabajo'},
        verbo: 'Leí',
        ejecutar: leerArchivo
    },
    write_file: {
        descripcion: 'Crea o reemplaza un archivo de texto y las carpetas necesarias.',
        campos: {
            path: 'Ruta relativa al directorio de trabajo',
            content: 'Contenido completo del archivo'
        },
        verbo: 'Escribí',
        ejecutar: escribirArchivo
    }
}
```

Las funciones JavaScript no pueden enviarse como JSON a la API. Por eso `describirHerramienta` transforma cada entrada en un esquema con `name`, `description` y `parameters`, mientras que `ejecutar` permanece solo en el proceso local:

```jsx
const herramientasApi = Object.entries(herramientas).map(describirHerramienta)
```

En esta versión, `describirHerramienta` define todos los campos como cadenas obligatorias. Es suficiente para `path` y `content`, los dos argumentos que necesita el programa.

## 7. Hacer una consulta a la API

`consultar(historial)` envía tres piezas importantes: el modelo elegido, las instrucciones del sistema junto con el historial y los esquemas de herramientas.

```jsx
const response = await fetch(`${baseUrl}/chat/completions`, {
    method: 'POST',
    headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${apiKey}`
    },
    body: JSON.stringify({
        model,
        messages: [{role: 'system', content: instruccionesSistema}, ...historial],
        tools: herramientasApi,
        tool_choice: 'auto',
        reasoning_effort: 'none'
    })
})
```

`tool_choice: 'auto'` permite que el modelo responda normalmente o solicite una herramienta. El programa usa `reasoning_effort: 'none'` porque su llamada actual combina function tools con `/chat/completions`; con `gpt-6-luna`, un valor mayor produjo un error de compatibilidad.

La respuesta útil está en `data.choices[0].message`. Puede contener texto final o un arreglo `tool_calls`.

## 8. Repetir mientras haya llamadas a herramientas

La función `responder` implementa el ciclo principal:

1. Llama a `consultar` con el historial actual.
2. Agrega la respuesta del modelo al historial.
3. Si no hay `tool_calls`, muestra el texto y termina.
4. Si hay llamadas, busca cada función en `herramientas`, la ejecuta y agrega el resultado como mensaje con `role: 'tool'`.
5. Vuelve al primer paso para que el modelo pueda usar el resultado.

El enlace entre una solicitud y su resultado es `tool_call_id`:

```jsx
const {name, arguments: datos} = llamada.function
const argumentos = JSON.parse(datos)
const accion = herramientas[name]
const resultado = await accion.ejecutar(argumentos)

historial.push({
    role: 'tool',
    tool_call_id: llamada.id,
    content: resultado
})
```

En el programa completo, la ejecución de la función tiene un `try/catch`: si una herramienta lanza un error, este se convierte en resultado y el modelo puede continuar. `leerArchivo` trata sus fallos de otra manera: devuelve `''`. El ciclo admite hasta ocho respuestas de la API por turno; luego informa que llegó al límite.

## 9. Mostrar la conversación sin duplicar el historial

Cada evento visible puede tener `tipo` y `texto`. Cuando además tiene `api`, ese valor es el mensaje que se enviará a la API en el siguiente turno. Un evento de error de la interfaz puede mostrarse sin agregarse al historial de la API.

```jsx
const [eventos, setEventos] = useState([])
const [ocupado, setOcupado] = useState(false)

const mostrar = evento =>
    setEventos(actuales => [...actuales, evento])

const historial = eventos
    .map(evento => evento.api)
    .filter(Boolean)
```

`Static` imprime los eventos visibles en la terminal. Se colorea la etiqueta de cada rol y se deja el cuerpo del mensaje con el color normal, para facilitar la lectura. `TextInput` se deshabilita mientras `ocupado` es verdadero.

## 10. Seguir un turno completo

Si escribís «Resumí `notas.txt`», ocurre esta secuencia:

```text
Usuario → API → solicitud de read_file("notas.txt")
        → leerArchivo → contenido de notas.txt
        → API → respuesta final
        → terminal
```

Si escribís una pregunta que no requiere archivos, el modelo puede responder en la primera llamada: no se ejecuta ninguna herramienta.

## Para experimentar

- Cambiá las instrucciones de `AGENTS.md` y reiniciá el programa para observar cómo cambia su rol.
- Pedile que lea un archivo de texto y seguí las llamadas que aparecen en la terminal.
- Probá agregar una tercera herramienta: necesita una función local, una entrada en `herramientas` y una descripción de sus argumentos.

La implementación mantiene deliberadamente simples algunas decisiones: las rutas se resuelven desde el directorio actual sin comprobar si salen de él, y `write_file` reemplaza archivos completos. Tené presentes esos comportamientos si adaptás el ejemplo a otros usos.
