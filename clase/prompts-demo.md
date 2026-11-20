# MiniCRM: secuencia de prompts para generarlo usando IA

## Implementacion full-stack (Frontend en react y backend en Node.js con Express, Drizzle y SQLite)

### 1. Crear el proyecto

```text
Crea un proyecto con Node.js, TypeScript, Drizzle y SQLite local en desarrollo y en Turso en produccion. 

Prioriza codigo modular minimalista, simple y legible. 

Agrega un README.md con instrucciones de instalación, ejecución y pruebas.  
  
Haz extrictamete lo que te pida, no anticipes funcionalidad. 
```
> Configuramos el proyecto

### 2. Definir el modelo

```text
Define `clientes` con una lista de `actividades` (Componente 1:n).

Los clientes tienen: id, nombre, apellido e email, opcionalmente domicilio, localidad y teléfono.
Las actividades tienen: id, descripción, y opcionalmente fecha de compromiso y finalización.
- La fecha de compromiso puede ser nula, indicando que no tiene fecha. 
- La fecha de finalización solo se llena al completar la actividad.

Crear la base de datos y sembrala con 10 clientes ficticios con actividades completadas y pendientes (incluso sin fecha)

Evita duplicar datos al repetir la carga.
```
> Creamos el modelo y la base de datos (Capa de datos)

### 3. Implementar el servicio

```text
Implementa la funcionalidad en un módulo de servicio con una clase Clientes y métodos estáticos: CRUD que permita la busqueda flexible por cualquier campo.

Incluye en el mismo CRUD de actividades, considera completa las tareas con fecha de ejecucion. Considera vencido lo anterior a hoy. Las completadas no se pueden editar ni borrar individualmente.

Normaliza nombres, emails y teléfonos al guardar. Usa los tipos inferidos de Drizzle.
```
> Implementamos el servicio (Capa de negocio)
### 4. Exponer la API REST

```text
Expone el servicio como un API REST usando Express. 
Separa controladores y routers; deja las reglas de negocio en el servicio.

Publica /api/clientes y sus actividades bajo /api/clientes/:clienteId/actividades, incluyendo una operación para completarlas. 
```

> Exponemos la API REST (Capa de presentación)

### 5. Crear la página básica

```text
Crea public/microcrm.html: una página html autocontenida con React, JSX embebido y CSS, cargando las bibliotecas desde CDN con versiones fijas. 

Configura Babel explícitamente con runtime classic para usar React global.

Lista los clientes consultando la API REST (mediante funciones de servicios) y sirve la página con Express

Usa una estética minimalista cuidada. (No uses librerías de componentes ni frameworks de CSS, solo React y CSS puro.)

Crea componentes reutilizables para layout, formulario, ingreso de datos, botones, iconos. Asi como para mostrar, listar y editar entidades para mantener el código limpio y modular.
```

> Creamos la página básica y la conectamos con la API REST

### 6. Convertirla en maestro y detalle

```text
Organiza la página como maestro y detalle. 

El maestro incluye búsqueda en vivo por cualquier campo; seleccionar un cliente muestra su ficha y sus actividades de solo lectura.

Muestra el id como #123 arriba a la derecha del detalle. Ocupa la altura de la ventana como una app, con scroll interno en el maestro y las actividades. Mantén visibles la búsqueda y la ficha.
```

> Convertimos la página en maestro y detalle

### 7. Agregar alta y edición de clientes

```text
Agrega «Agregar» y «Editar». Ambos usan un formulario en el detalle, con nombre y apellido en la primera fila, email y teléfono en la segunda, domicilio y localidad en la tercera, y botones Guardar y Cancelar debajo.

Guarda mediante la API y actualiza el maestro y la ficha. 
```

> Agregamos alta y edición de clientes

### 8. Presentar compromisos y actividades

```text
Separa las actividades en «Compromisos» y luego «Actividades completadas». Ordena los compromisos primero sin fecha, después vencidos y finalmente con fecha actual o futura; dentro de los grupos con fecha, ordena de forma ascendente.

Cada fila muestra un check a la izquierda, descripción y debajo la fecha de compromiso si está pendiente o la de finalización si está completada. Indica cuando no tiene compromiso. 

Los mensajes de grupos vacíos deben ocupar el mínimo espacio vertical.
```

> Presentamos compromisos y actividades

### 9. Gestionar compromisos desde el detalle

```text
Al marcar el check de un compromiso, complétalo mediante la API y muévelo al grupo de completadas.

Justo debajo de la ficha agregar un subformulario con borde de puntos redondeado: descripción, fecha de compromiso opcional y botones con iconos para guardar o cancelar, todo en una línea y sin etiquetas visibles. Guardar y Cancelar limpian el formulario y actualizan la lista de compromisos.

Agrega iconos de editar y borrar a los pendientes. 
Editar carga sus datos en el subformulario. Tras guardar, actualiza el listado; Las completadas permanecen inalterables. Incluye nombres accesibles para campos e iconos.
```

> Gestionamos compromisos desde el detalle

### 10. Informe final.

```text
Has un informe final con la cantidad de lineas de codigo generada (excepto libreria y configuracion) e indica el tiempo neto de desarrollo.
```

# EXTRA: Interface para IA

### 11. Exponer la funcionalidad como MCP

Exponer la funcionalidad como MCP

```text
Agrega un servidor MCP en /mcp con el SDK oficial y transporte Streamable HTTP. Expone como herramientas la funcionalidad del servicio de clientes y sus actividades, con esquemas de entrada y errores claros.

Reutiliza el mismo servicio y la misma base de datos que REST, respetando la composición y las restricciones de actividades completadas. Documenta cómo conectarse.
```

### 12. Crear la versión de la página con MCP

```text
Agregar a la página la posibilidad de conectarse al MCP que acabamos de implementar (en un modulo aparte embebido) y usarlo como alternativa a la API REST. (Seleccionable) 

Mantener la misma funcionalidad y estética. Documentar cómo conectarse.
```

