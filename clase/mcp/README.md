# Servidores MCP de alumnos y contactos

## CRUD de contactos con JSON

Ejecutar desde esta carpeta con Node.js 22 o superior:

```sh
pnpm install
pnpm contactos
```

El servidor de contactos queda disponible en **http://127.0.0.1:3001/mcp** por Streamable HTTP. Para elegir otro puerto: `PORT=3030 pnpm contactos`. Finaliza con Ctrl+C.

El código sigue el ejemplo de [FastMCP](https://github.com/punkpeye/fastmcp) instalado en esta carpeta y usa su implementación de MCP con inicialización, compatible con la revisión 2025-11-25. Los contactos se guardan en `contactos/contactos.json`; incluye dos contactos ficticios. Cada contacto tiene `id`, `nombre`, `telefono` y `email`. Los tres campos de texto son obligatorios al agregar; el teléfono se guarda como texto y el email debe tener formato válido.

| Herramienta | Argumentos | Resultado |
| --- | --- | --- |
| `agregar_contacto` | `nombre`, `telefono`, `email` | Contacto creado con ID automático |
| `listar_contactos` | `filtro` opcional | Lista completa o coincidencias parciales en cualquier campo |
| `traer_contacto` | `id` | Contacto encontrado |
| `actualizar_contacto` | `id`, `datos` con uno o más campos | Contacto actualizado; conserva los campos omitidos |
| `eliminar_contacto` | `id` | Contacto eliminado |

Ejemplos de argumentos para invocar las herramientas desde un cliente MCP:

```json
{"nombre":"María López","telefono":"3815550103","email":"maria@example.com"}
```

```json
{"id":3,"datos":{"telefono":"3815550199"}}
```

Para conectar un cliente que admita esta configuración HTTP:

```json
{
  "mcpServers": {
    "contactos": {
      "type": "http",
      "url": "http://127.0.0.1:3001/mcp"
    }
  }
}
```

El formato exacto de configuración depende del cliente. La dirección es local a esta computadora.

`contactos/repositorio.js` contiene la clase `RepositorioContactos`, independiente de MCP, con los métodos `agregar`, `listar`, `traer`, `actualizar` y `eliminar`. Lee el archivo en cada operación y persiste las modificaciones mediante un archivo temporal y su reemplazo. Las operaciones son síncronas para evitar que dos solicitudes del mismo proceso sobrescriban cambios. Usar un solo proceso por archivo JSON. El ID se calcula como el mayor ID existente más uno, por lo que puede reutilizar el último ID si ese contacto se eliminó.

`contactos/mcp.js` registra las herramientas y `contactos/server.js` inicia el transporte HTTP. `contactos/esquemas.js` comparte las validaciones entre el servidor y el repositorio. Los errores de validación y los IDs inexistentes se devuelven como errores MCP. Un JSON inválido produce un error y se conserva para poder corregirlo.

Para usar otro archivo: `CONTACTOS_ARCHIVO=/ruta/contactos.json pnpm contactos`. La carpeta debe existir; si falta el archivo, la primera alta lo crea. Sin esa variable, la ruta predeterminada se resuelve respecto al repositorio, independientemente del directorio desde donde se ejecute Node.

Para verificar el CRUD, la persistencia, las validaciones y las llamadas MCP con un cliente real por HTTP:

```sh
pnpm probar:contactos
```

Las pruebas usan archivos temporales y no modifican los contactos de ejemplo.

## MCP manual de alumnos por HTTP

Servidor MCP de ejemplo, implementado manualmente con Express y Node.js 22 o superior. Los datos están en `alumnos.json` y las funciones `traer` y `listar` en `alumnos.js`.

## Ejecutar

```sh
pnpm install
pnpm start
```

El servidor escucha en `http://127.0.0.1:3000/mcp`. Para elegir otro puerto: `PORT=3030 pnpm start`. Finaliza con Ctrl+C.

Para ejecutar la versión con el SDK oficial en lugar de la manual:

```sh
pnpm sdk
```

Ambas usan el puerto 3000 por defecto, por lo que se ejecutan una a la vez. Para probarlas simultáneamente, usar por ejemplo `PORT=3001 pnpm sdk`.

## Probar el servidor y el cliente manuales

Para ejecutar todo junto desde esta carpeta:

```sh
pnpm probar
```

El comando inicia el servidor manual en el puerto 3000, espera un segundo y ejecuta el cliente. El servidor queda ejecutándose después de que termina el cliente.

Si el puerto 3000 está ocupado, se puede usar otro indicando ambas direcciones:

```sh
PORT=3001 MCP_URL=http://127.0.0.1:3001/mcp pnpm probar
```

Para observarlos en terminales separadas:

1. Abrir una terminal en esta carpeta, instalar las dependencias e iniciar el servidor manual:

   ```sh
   pnpm install
   pnpm start
   ```

   Dejar esta terminal abierta. El servidor queda esperando consultas en `http://127.0.0.1:3000/mcp`.

2. Abrir otra terminal en la misma carpeta y ejecutar el cliente manual:

   ```sh
   pnpm cliente
   ```

3. Observar en la segunda terminal los resultados de cada etapa. En `manual/cliente.js` se pueden ver los mensajes MCP que se envían:

   - `initialize`: el servidor informa su versión y capacidades.
   - `notifications/initialized`: el cliente avisa que está listo; recibe HTTP 202 sin cuerpo.
   - `tools/list`: el servidor describe `traer` y `listar`.
   - `tools/call`: `traer` busca el alumno con ID 1 y `listar` busca alumnos que contienen `Pérez`.

   Con los datos de ejemplo, `traer` devuelve a Ana y `listar` encuentra a Ana y Diego. El cliente convierte el texto JSON de `content` para mostrar los datos de forma legible.

4. Para terminar, volver a la primera terminal y presionar Ctrl+C.

Para probar con la versión SDK, iniciar `pnpm sdk` en lugar de `pnpm start`. Para otro puerto se puede indicar la dirección al cliente, por ejemplo: `MCP_URL=http://127.0.0.1:3001/mcp pnpm cliente`.

El cliente es un ejemplo didáctico para estos servidores sin sesiones, que responden con JSON. No implementa respuestas SSE ni todas las funciones de un cliente MCP completo.

## Probar el cliente con SDK

Con cualquiera de los servidores en ejecución (`pnpm start` o `pnpm sdk`), abrir otra terminal y ejecutar:

```sh
pnpm cliente:sdk
```

`sdk/cliente.js` realiza las mismas consultas que el cliente manual: descubre las herramientas, trae el alumno 1 y busca `Pérez`. El SDK se ocupa de inicializar la conexión y enviar los mensajes MCP. Para otro puerto, usar por ejemplo `MCP_URL=http://127.0.0.1:3001/mcp pnpm cliente:sdk`.

## Conectar un cliente MCP

### Servidor con FastMCP

Para ejecutar la misma funcionalidad con FastMCP para Node.js:

```sh
pnpm fastmcp
```

El servidor `fastmcp/server.js` expone `traer` y `listar` en `http://127.0.0.1:3000/mcp`, usando el mismo repositorio `alumnos.js`. En otra terminal, se puede consultar con `pnpm probar:sdk`. Las versiones comparten el puerto predeterminado; para usar otro, iniciar `PORT=3001 pnpm fastmcp` y conectar con `MCP_URL=http://127.0.0.1:3001/mcp pnpm probar:sdk`.

Con el servidor en ejecución, configurar una conexión **Streamable HTTP** a `http://127.0.0.1:3000/mcp`. Algunos clientes admiten este formato:

```json
{
  "mcpServers": {
    "alumnos": {
      "type": "http",
      "url": "http://127.0.0.1:3000/mcp"
    }
  }
}
```

El formato exacto depende del cliente. La URL está disponible en la misma computadora.

## Probar con curl

También se pueden ejecutar las mismas consultas desde `manual/prueba.http` con un cliente compatible con archivos `.http`, como la extensión REST Client de VS Code. Iniciar primero el servidor y enviar las solicitudes en orden.

Inicializar la conexión:

```sh
curl http://127.0.0.1:3000/mcp \
  -H 'Content-Type: application/json' \
  -H 'Accept: application/json, text/event-stream' \
  -d '{"jsonrpc":"2.0","id":1,"method":"initialize","params":{"protocolVersion":"2025-11-25","capabilities":{},"clientInfo":{"name":"prueba","version":"1.0.0"}}}'
```

Notificar que el cliente está listo (respuesta HTTP 202 sin cuerpo):

```sh
curl -i http://127.0.0.1:3000/mcp \
  -H 'Content-Type: application/json' \
  -H 'Accept: application/json, text/event-stream' \
  -H 'MCP-Protocol-Version: 2025-11-25' \
  -d '{"jsonrpc":"2.0","method":"notifications/initialized"}'
```

Consultar un alumno:

```sh
curl http://127.0.0.1:3000/mcp \
  -H 'Content-Type: application/json' \
  -H 'Accept: application/json, text/event-stream' \
  -H 'MCP-Protocol-Version: 2025-11-25' \
  -d '{"jsonrpc":"2.0","id":2,"method":"tools/call","params":{"name":"traer","arguments":{"id":1}}}'
```

Para buscar alumnos, reemplazar el cuerpo por:

```json
{"jsonrpc":"2.0","id":3,"method":"tools/call","params":{"name":"listar","arguments":{"filtro":"Pérez"}}}
```

El filtro es opcional y busca coincidencias parciales sin distinguir mayúsculas; los acentos se comparan literalmente. Con `"arguments": {}` lista todos. `traer` devuelve `null` si no encuentra el ID. El archivo de datos se lee en cada consulta.

## Implementación

El servidor `manual/server.js` muestra el recorrido básico MCP 2025-11-25: `initialize`, `ping`, `tools/list` y `tools/call`. Usa HTTP sin sesiones y responde a POST con JSON; GET devuelve 405 porque no ofrece flujo SSE. Escucha solo en la interfaz local. Es una demostración de camino feliz: omite validaciones y manejo de errores necesarios para producción. El acceso al archivo y las consultas están en `alumnos.js`, compartido con la versión SDK.

En `sdk/server.js`, el SDK oficial maneja el protocolo y el transporte. Las herramientas se registran con `registerTool` y sus argumentos se describen con Zod. El servidor y el transporte se crean por cada solicitud HTTP, sin sesiones; ambas versiones usan el mismo repositorio de alumnos. El cliente `manual/cliente.js` muestra el intercambio usando `fetch`.

Referencia: [transporte Streamable HTTP de MCP](https://modelcontextprotocol.io/specification/2025-11-25/basic/transports).
