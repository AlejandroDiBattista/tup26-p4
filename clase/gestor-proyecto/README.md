# Trama · Gestión de proyectos

Aplicación web para administrar proyectos, responsables y tareas en un tablero Kanban. Está desarrollada con React, TypeScript, Vite, React Router, Tailwind CSS y componentes shadcn/ui. La aplicación invoca las herramientas del servidor MCP, que utiliza JSON Server para guardar los cambios en `db.json`.

## Requisitos

Node.js 22.12 o superior y npm.

## Ejecutar en desarrollo

En una terminal, instalar las dependencias y comenzar el servidor de datos:

```bash
npm install
npm run server
```

En otra terminal, iniciar el MCP:

```bash
npm run mcp
```

En una tercera terminal, iniciar la aplicación:

```bash
npm run dev
```

Abrir la dirección que muestre Vite, normalmente `http://localhost:5173`. La web se conecta al MCP en `http://127.0.0.1:43182/mcp`, y este se conecta a JSON Server en `http://127.0.0.1:43181`. Para modificar estas direcciones, configurá `VITE_MCP_URL` para Vite y `TRAMA_API_URL` para el proceso MCP, respectivamente. Las operaciones modifican `db.json`; hacé una copia si necesitás conservar los datos de ejemplo.

Para usar el asistente flotante, iniciá además, en otra terminal con `OPENAI_API_KEY` disponible en el entorno:

```bash
npm run assistant
```

El asistente envía la conversación a OpenAI y usa las herramientas del MCP de Trama para consultar y efectuar cambios. Las solicitudes a OpenAI pueden generar consumo de API. La clave permanece en el proceso local del asistente; no se incluye en la aplicación web. Por defecto usa `gpt-6-luna`, configurable con `TRAMA_AI_MODEL`. Su servidor escucha en `127.0.0.1:43183`; se puede cambiar el puerto con `TRAMA_ASSISTANT_PORT` y la dirección del cliente con `VITE_ASSISTANT_URL`. Si Vite usa un origen distinto de los puertos 5173 o 5175, configurá `TRAMA_WEB_ORIGINS` también en el proceso del asistente. Para conectar otro servidor MCP, usá `TRAMA_MCP_URL`.

## Uso

El panel permite buscar tareas en vivo y combinar filtros por proyecto y responsable. Una tarea puede quedar sin responsable solo en el primer estado; para avanzar debe tener uno asignado. Se mueve con las flechas o arrastrándola a una columna contigua, en ambos sentidos; una tarea sin responsable puede volver directamente al primer estado. Desde la navegación se administran los estados, proyectos y responsables y se consulta el tablero de cada proyecto. Al eliminar un proyecto también se eliminan sus tareas, previa confirmación; un responsable con tareas asignadas no puede eliminarse hasta que se reasignen o queden sin asignar cuando corresponda.

En Estados se pueden agregar, renombrar y ordenar las columnas. El primer estado se asigna a las tareas nuevas y el último se considera finalizado en el avance; no se pueden eliminar estados con tareas.

JSON Server es una simulación para desarrollo: no proporciona autenticación ni transacciones. La versión utilizada escucha en todas las interfaces de red aunque se indique `--host`, por lo que debe usarse solo en una red de confianza. Si falla una eliminación en cascada, la aplicación informa que pudo quedar incompleta y vuelve a consultar los datos disponibles.

## Comprobaciones

```bash
npm run build
npm run check:assistant
npm run lint
npm run format:check
```

Para volver a aplicar el formato del proyecto, ejecutar `npm run format`.

El archivo `mockup.html` es una maqueta autocontenida anterior a la aplicación y utiliza datos guardados en el navegador. `seguimiento.html` muestra el seguimiento de esta implementación.

## Servidor MCP por HTTP

Trama incluye un servidor MCP por **Streamable HTTP** para que un cliente compatible consulte y administre proyectos, responsables, tareas y estados. Usa el mismo módulo de operaciones y validaciones que la aplicación.

Iniciá JSON Server y, en otra terminal, el servidor MCP:

```bash
npm run server
npm run mcp
```

Configurá el cliente MCP con la URL `http://127.0.0.1:43182/mcp`. La forma exacta de registrar una URL depende del cliente. Este endpoint utiliza el protocolo MCP: no es una página web ni una API REST convencional. Se puede definir otro puerto con `TRAMA_MCP_PORT` y otro JSON Server con `TRAMA_API_URL` al iniciar el servidor.

Para inspeccionar las herramientas desde una interfaz web, iniciá MCP Inspector en otra terminal con `npm run mcp:inspector`. En la página que abre, conectá el servidor de Trama y elegí una herramienta. Las herramientas de escritura modifican `db.json`.

El servidor escucha únicamente en `127.0.0.1`, no tiene autenticación y está pensado para clientes locales; no lo expongas a Internet ni a otras máquinas sin agregar autenticación y protección adecuadas. Acepta solicitudes web de `localhost` y `127.0.0.1` en los puertos 5173 y 5175. Si Vite usa otro origen, indicá `TRAMA_WEB_ORIGINS` al iniciar el MCP, con una lista de orígenes separados por comas. Valida los encabezados Host y Origin para rechazar orígenes ajenos. La aplicación web y otros clientes MCP no reciben actualizaciones en tiempo real: recargá la página después de un cambio hecho por otro cliente.

Las herramientas permiten listar y filtrar tareas, consultar proyectos con su avance, y crear, editar o eliminar proyectos, responsables, tareas y estados. Eliminar un proyecto elimina también sus tareas. Las tareas se crean en el primer estado; fuera de ese estado requieren responsable. Los cambios de estado son entre estados contiguos, salvo que una tarea sin responsable puede volver directamente al primero. El último estado se considera finalizado. Cambiar el orden o agregar un estado al final puede alterar qué tareas cuentan como finalizadas.

JSON Server no valida estas reglas si se accede directamente a su API, no ofrece transacciones ni coordina escrituras simultáneas entre la web y otros procesos MCP. Evitá modificar el mismo registro simultáneamente desde clientes distintos. La aplicación web no recibe actualizaciones en tiempo real: recargá la página para ver cambios hechos desde el MCP.

Para comprobar el MCP con datos temporales aislados:

```bash
npm run check:mcp
npm run test:mcp
```
