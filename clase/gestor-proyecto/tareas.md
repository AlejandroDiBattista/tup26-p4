# Plan de trabajo: gestión de proyectos

Realizar las tareas en el orden en que aparecen; los códigos identifican cada tarea de forma estable. Cada una incluye una comprobación que debe superarse antes de continuar. La aplicación debe utilizar JSON Server y `db.json`; el mockup autocontenido sirve como referencia visual y funcional, pero no reemplaza la conexión al servidor.

## Preparación y datos

- [ ] **T01 — Preparar el proyecto.** Crear la estructura inicial y configurar la ejecución local de la aplicación. **Verificar:** la aplicación inicia y abre en el navegador.
- [ ] **T02 — Definir los modelos.** Representar proyectos, responsables y tareas con los campos y relaciones del enunciado. **Verificar:** una tarea puede vincularse a un proyecto y tener un responsable opcional.
- [ ] **T03 — Preparar JSON Server.** Configurar el servidor simulado con el archivo `db.json` existente y sus colecciones de proyectos, responsables y tareas. **Verificar:** el servidor responde con los cinco proyectos y las 25 tareas de ejemplo.
- [ ] **T04 — Validar los datos.** Definir los campos obligatorios y aceptar únicamente los tres estados previstos para las tareas. **Verificar:** se rechazan datos obligatorios vacíos y estados inválidos.

## Proyectos

- [ ] **T05 — Listar proyectos.** Mostrar los proyectos guardados y un mensaje cuando no haya ninguno. **Verificar:** la lista refleja los datos almacenados y el caso vacío se muestra correctamente.
- [ ] **T06 — Crear proyectos.** Incorporar un formulario para registrar nombre y descripción. **Verificar:** un proyecto válido aparece en la lista y se rechaza uno sin nombre.
- [ ] **T07 — Editar proyectos.** Permitir modificar los datos de un proyecto existente. **Verificar:** los cambios aparecen en la lista y persisten al recargar.
- [ ] **T08 — Eliminar proyectos.** Solicitar confirmación y eliminar el proyecto junto con sus tareas. **Verificar:** cancelar conserva los datos; confirmar elimina el proyecto y sus tareas sin afectar otros proyectos.

## Responsables

- [ ] **T09 — Listar responsables.** Mostrar los responsables guardados y un mensaje cuando la lista esté vacía. **Verificar:** se ven los nombres y datos de contacto registrados.
- [ ] **T10 — Crear responsables.** Incorporar un formulario para registrar nombre y contacto. **Verificar:** un responsable válido aparece en la lista y se rechaza uno sin nombre.
- [ ] **T11 — Editar responsables.** Permitir modificar el nombre y el contacto. **Verificar:** los cambios se muestran y persisten al recargar.
- [ ] **T12 — Eliminar responsables.** Impedir la eliminación mientras tengan tareas asignadas e indicar cómo resolverlo. **Verificar:** se bloquea la eliminación de un responsable con tareas y se permite eliminar uno sin asignaciones, previa confirmación.
- [ ] **T13 — Consultar tareas por responsable.** Mostrar las tareas asignadas a cada persona e identificar el proyecto y estado de cada una. **Verificar:** se muestran solo sus tareas y se informa cuando no tiene asignaciones.

## Tareas

- [ ] **T14 — Mostrar tareas de un proyecto.** Presentar las tareas asociadas al proyecto seleccionado, con título, estado y responsable. **Verificar:** no aparecen tareas de otros proyectos y se contempla la lista vacía.
- [ ] **T15 — Crear tareas.** Permitir registrar título y descripción dentro de un proyecto; iniciar la tarea en estado pendiente y permitir dejarla sin responsable. **Verificar:** la tarea aparece en el proyecto correcto y se rechaza si falta el título.
- [ ] **T16 — Editar tareas.** Permitir modificar el título y la descripción de una tarea. **Verificar:** los cambios se muestran en el proyecto y persisten al recargar.
- [ ] **T17 — Asignar responsables.** Permitir asignar, cambiar o quitar el responsable de una tarea. **Verificar:** la asignación se actualiza en la tarea y en las consultas por responsable.
- [ ] **T18 — Cambiar el estado con flechas.** Agregar en la cabecera de cada tarjeta flechas para mover la tarea al estado anterior o siguiente, sin ofrecer movimientos fuera de los extremos. **Verificar:** las flechas cambian la columna y el estado persiste en JSON Server al recargar; pueden usarse con teclado.
- [ ] **T19 — Eliminar tareas.** Permitir eliminar una tarea previa confirmación. **Verificar:** cancelar la conserva; confirmar la quita del proyecto y de la consulta del responsable.

## Panel central y cierre

- [ ] **T20 — Crear el panel central.** Mostrar las tareas de todos los proyectos en tres columnas Kanban: pendiente, en desarrollo y finalizada. Cada tarjeta debe identificar la tarea, el proyecto y su responsable. **Verificar:** cada tarea aparece en la columna correcta y se informa cuando una columna está vacía.
- [ ] **T21 — Filtrar el tablero por proyecto.** Incorporar un filtro que permita elegir un proyecto o mostrar todos. **Verificar:** solo aparecen tareas del proyecto seleccionado y al quitar el filtro vuelven a mostrarse todas.
- [ ] **T22 — Filtrar el tablero por responsable.** Incorporar un filtro por responsable, con opciones para mostrar todos o solo tareas sin asignar. **Verificar:** el filtro funciona junto con el de proyecto y muestra resultados correctos en las tres columnas.

## Interacción del tablero y conexión

- [ ] **T27 — Buscar tareas en vivo.** Filtrar el tablero mientras se escribe, considerando el título y la descripción de la tarea, el proyecto y el responsable. **Verificar:** los resultados cambian sin enviar un formulario y la búsqueda se combina con ambos filtros.
- [ ] **T28 — Arrastrar tareas entre columnas.** Permitir soltar una tarjeta en cualquiera de las tres columnas y guardar su nuevo estado. **Verificar:** al soltarla se actualiza la columna y el cambio permanece después de recargar; las flechas siguen disponibles como alternativa con teclado.
- [ ] **T29 — Mostrar el Kanban de un proyecto.** Presentar sus tareas en las mismas tres columnas, con flechas y arrastre. **Verificar:** no aparecen tareas de otros proyectos y los cambios se reflejan también en el panel central.
- [ ] **T30 — Conectar las operaciones al servidor.** Leer y guardar proyectos, responsables y tareas mediante JSON Server, incluyendo las asignaciones y los cambios de estado. **Verificar:** crear, editar y eliminar se refleja en el servidor y persiste tras reiniciar la aplicación y el servidor.
- [ ] **T31 — Informar errores de conexión.** Mostrar un mensaje claro cuando no se puedan cargar o guardar datos. **Verificar:** al detener JSON Server, la aplicación comunica el problema y no presenta cambios fallidos como guardados.
- [ ] **T32 — Aplicar el diseño del mockup.** Usar `mockup.html` como referencia para la navegación, las tarjetas y los controles de estilo shadcn. **Verificar:** el panel central muestra solamente el tablero de tareas, su búsqueda y sus filtros, sin resumen de trabajo ni filtro por estado.

## Cierre

- [ ] **T23 — Revisar mensajes y validaciones.** Informar los resultados de las operaciones y los errores de forma clara. **Verificar:** se entiende qué ocurrió y cómo corregir un dato inválido o una eliminación bloqueada.
- [ ] **T24 — Adaptar la interfaz.** Ajustar la presentación y los controles para computadoras y dispositivos móviles. **Verificar:** las funciones principales pueden usarse en ambos tamaños sin contenido inaccesible.
- [ ] **T25 — Probar el recorrido completo.** Crear responsables, proyectos y tareas; asignarlas, cambiar sus estados y comprobar el tablero, sus filtros y la persistencia. **Verificar:** los datos y estados siguen siendo correctos tras cerrar y volver a abrir la aplicación.
- [ ] **T26 — Documentar la ejecución.** Escribir las instrucciones necesarias para instalar, iniciar y utilizar la aplicación. **Verificar:** siguiendo esas instrucciones se puede poner en marcha y completar el recorrido principal.
