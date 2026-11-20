# MiniCRM: secuencia de prompts para generarlo usando IA

## 1. Crear el proyecto

```text
Crea un proyecto con Node.js, TypeScript, Drizzle y SQLite local en desarrollo y en Turso en produccion. 

Prioriza codigo modular minimalista, simple y legible. 

Agrega un README.md con instrucciones de instalación, ejecución y pruebas.
```

## 2. Definir el modelo

```text
Define clientes con id, nombre, apellido, email único y teléfono opcional. Cada cliente compone sus actividades: id, descripción, fecha opcional, fecha de compromiso opcional y fecha de finalización opcional.

Los clientes tiene asociados actividades. Las actividades tiene descripcion, fecha comprometida opcional, fecha ejecucion, 

Crear la base de datos y sembrala con 10 clientes ficticios con actividades completadas y compromisos sin fecha, vencidos y futuros. Evita duplicar datos al repetir la carga.
```

## 3. Implementar el servicio

```text
Implementa la funcionalidad en un módulo de servicio con una clase Clientes y métodos estáticos: CRUD que permita la busqueda flexible por cualquier campo.

Incluye en el mismo CRUD de actividades, considera completa las tareas con fecha de ejecucion. Considera vencido lo anterior a hoy. Las completadas no se pueden editar ni borrar individualmente.

Normaliza nombres, emails y teléfonos al guardar. Usa los tipos inferidos de Drizzle.
```

## 4. Exponer la API REST

```text
Expone el servicio con Express. 
Separa controladores y routers; deja las reglas de negocio en el servicio.

Publica /api/clientes y sus actividades bajo /api/clientes/:clienteId/actividades, incluyendo una operación para completarlas. 
```

## 5. Crear la página básica

```text
Crea public/clientes.html: una página html autocontenida con React, JSX embebido y CSS, cargando las bibliotecas desde CDN con versiones fijas. 

Configura Babel explícitamente con runtime classic para usar React global.

Lista los clientes consultando la API REST y sirve la página con Express. 
Usa una estética minimalista cuidada. 

Crea extensamentes componentes para layout, ingreso de datos, mostrar, listar y editar entidades.
```

## 6. Convertirla en maestro y detalle

```text
Organiza la página como maestro y detalle. 

El maestro incluye búsqueda en vivo por cualquier campo; seleccionar un cliente muestra su ficha y sus actividades de solo lectura.

Muestra el id como #123 arriba a la derecha del detalle. Ocupa la altura de la ventana como una app, con scroll interno en el maestro y las actividades. Mantén visibles la búsqueda y la ficha.
```

## 7. Agregar alta y edición de clientes

```text
Agrega «Agregar» y «Editar». Ambos usan un formulario en el detalle, con nombre y apellido en la primera fila, email y teléfono en la segunda, y botones Guardar y Cancelar debajo.

Guarda mediante la API y actualiza el maestro y la ficha. 
```

## 8. Presentar compromisos y actividades

```text
Separa las actividades en «Compromisos» y luego «Actividades completadas». Ordena los compromisos primero sin fecha, después vencidos y finalmente con fecha actual o futura; dentro de los grupos con fecha, ordena de forma ascendente.

Cada fila muestra un check a la izquierda, descripción y debajo la fecha de compromiso si está pendiente o la de finalización si está completada. Indica cuando no tiene compromiso. 

Los mensajes de grupos vacíos deben ocupar el mínimo espacio vertical.
```

## 9. Gestionar compromisos desde el detalle

```text
Al marcar el check de un compromiso, complétalo mediante la API y muévelo al grupo de completadas.

Justo después de la ficha agrega un subformulario con borde redondeado de puntos: descripción, fecha de compromiso opcional y botones con iconos para guardar o cancelar, todo en una línea y sin etiquetas visibles.

Agrega iconos de editar y borrar a los pendientes. Editar carga sus datos en ese mismo subformulario. Tras guardar, actualiza el listado; cancelar limpia el ingreso. Las completadas permanecen inalterables. Incluye nombres accesibles para campos e iconos.
```

## 10. Exponer la funcionalidad como MCP

```text
Agrega un servidor MCP en /mcp con el SDK oficial y transporte Streamable HTTP. Expone como herramientas la funcionalidad del servicio de clientes y sus actividades, con esquemas de entrada y errores claros.

Reutiliza el mismo servicio y la misma base de datos que REST, respetando la composición y las restricciones de actividades completadas. Documenta cómo conectarse.
```

## 11. Crear la versión de la página con MCP

```text
Crea public/clientes-mcp.html con la misma interfaz y comportamiento que clientes.html, pero reemplaza las llamadas REST por llamadas a las herramientas MCP.

Implementa la inicialización y las llamadas MCP sobre HTTP desde el navegador. Conserva ambas páginas para comparar y documenta sus URLs. Ambas deben trabajar con los mismos datos.
```

## 12. Informe final.

```text
Al terminar instala librerias, crea los datos, inicializa los servidores y abri ambas paginas generadas.

Luego has un informe final con la cantidad de lineas de codigo generada (excepto libreria y configuracion) e indica el tiempo total de desarrollo.
```