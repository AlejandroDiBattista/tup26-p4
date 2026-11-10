# Inventario del proyecto

Corte: 3 de noviembre de 2026, antes de la solicitud de este inventario. Se incluyen el chat principal y sus cuatro agentes; el consumo posterior a ese corte no está incluido.

## Líneas actuales

Son líneas físicas de los archivos actuales, incluidas líneas en blanco y comentarios. No incluyen dependencias, compilación ni el archivo de bloqueo de paquetes. Los componentes shadcn están incluidos en el código de interfaz.

| Área | Archivos | Líneas |
| --- | ---: | ---: |
| Aplicación React y estilos en src (raíz) | 4 | 412 |
| Administración | 7 | 971 |
| Tablero Kanban | 2 | 458 |
| Navegación y paleta | 3 | 379 |
| Componentes de interfaz, incluidos shadcn | 6 | 698 |
| Datos y acceso a la API | 4 | 303 |
| Hooks | 9 | 481 |
| Utilidades compartidas | 1 | 6 |
| **Total de src** | **36** | **3.708** |

Otros archivos del proyecto:

| Archivo | Líneas |
| --- | ---: |
| [Mockup HTML](mockup.html) | 1.562 |
| [Panel de seguimiento HTML](seguimiento.html) | 286 |
| [Datos de JSON Server](db.json) | 283 |
| [Enunciado](enunciado.md) | 43 |
| [Plan de tareas](tareas.md) | 56 |
| [README](README.md) | 44 |
| [Entrada HTML](index.html) | 12 |
| [Pautas de diseño](docs/design-guideline.md) | 21 |
| [Historia de diseño](docs/design-story.md) | 7 |

No se puede atribuir con precisión una cantidad de líneas a cada pedido: no hay historial Git ni instantáneas completas por cambio. Las líneas actuales incluyen modificaciones posteriores y no equivalen a líneas generadas durante el trabajo.

## Tokens por intervención

Valores registrados, no una estimación. «En caché» es una parte de «Entrada», no se suma de nuevo. La salida incluye los tokens de razonamiento registrados. Un turno puede agrupar varios pedidos enviados mientras se trabajaba, por lo que no se desglosan artificialmente.

| Nº | Tarea o intervención | Entrada | De entrada, en caché | Salida |
| ---: | --- | ---: | ---: | ---: |
| 01 | Enunciado inicial | 129.434 | 95.360 | 1.003 |
| 02 | Enunciado narrativo y estructura de datos | 69.631 | 69.120 | 338 |
| 03 | Diagrama entidad-relación | 70.364 | 69.888 | 442 |
| 04 | Plan de trabajo y tareas atómicas | 109.196 | 108.160 | 1.538 |
| 05 | Datos de ejemplo para JSON Server | 77.340 | 76.928 | 2.135 |
| 06 | Mockup HTML inicial | 424.202 | 402.944 | 8.727 |
| 07 | Mockup: tablero Kanban | 207.606 | 206.592 | 1.711 |
| 08 | Mockup: panel central | 141.468 | 141.056 | 423 |
| 09 | Mockup: filtros y búsqueda viva | 215.863 | 214.656 | 1.628 |
| 10 | Mockup: quitar resumen | 146.897 | 146.560 | 404 |
| 11 | Mockup: flechas y arrastrar y soltar | 224.056 | 222.848 | 1.608 |
| 12 | Mockup: quitar filtro por estado | 152.351 | 151.680 | 198 |
| 13 | Actualizar enunciado y tareas | 314.243 | 311.936 | 1.861 |
| 14 | Instalación de MCP de shadcn | 420.847 | 414.592 | 428 |
| 15 | Instalación de la skill Impeccable | 908.351 | 900.096 | 1.468 |
| 16 | Desarrollo React, agentes y panel de seguimiento | 20.671.647 | 20.543.360 | 42.563 |
| 17 | Seguimiento y selectores shadcn | 6.326.305 | 6.295.680 | 5.421 |
| 18 | Movimientos contiguos y asignación desde el panel | 5.675.536 | 5.643.008 | 5.818 |
| 19 | Estados configurables | 5.253.880 | 5.232.512 | 8.238 |
| 20 | Orden y colores de estados; ajustes de tarjetas | 6.294.819 | 6.262.400 | 4.955 |
| 21 | Confirmación con nombre de tarea | 2.705.377 | 2.695.552 | 1.022 |
| 22 | Formato, indentación y comentarios del código | 5.736.330 | 5.717.760 | 6.609 |
| 23 | Consulta sobre tokens y costo de API | 5.067.799 | 5.047.424 | 3.800 |
| 24 | Desglose solicitado de tokens por tarea | 1.775.645 | 1.767.552 | 3.303 |
| 25 | Consulta de costo aproximado | 360.609 | 360.448 | 58 |
| 26 | Consulta sobre costo de agentes | 2.180.997 | 2.174.592 | 805 |
| 27 | Diseño del panel principal y corrección de borde | 18.843.429 | 18.716.288 | 15.621 |
| 28 | Nombre y apellido, iconos y búsquedas de administración | 4.653.400 | 4.600.448 | 10.169 |
| 29 | Alineación de filtros del panel | 1.425.508 | 1.410.304 | 1.197 |
| 30 | Indicadores de arrastre y ubicación en la tarjeta | 1.574.743 | 1.561.728 | 1.716 |
| 31 | Efecto visual al pasar el mouse | 756.559 | 752.896 | 1.388 |
| 32 | Paleta de comandos y atajo Ctrl/⌘ K | 3.878.276 | 3.846.272 | 4.965 |
| 33 | Aspecto de paleta y componentes shadcn | 5.194.320 | 5.162.752 | 6.336 |
| 34 | Atajos para proyectos, tareas y responsables | 3.432.128 | 3.418.240 | 3.183 |
| 35 | Mostrar Ctrl o ⌘ según plataforma | 1.683.807 | 1.674.240 | 1.454 |
| 36 | Búsqueda por categoría y bloqueo de cambio de proyecto | 9.041.961 | 9.003.904 | 8.971 |
| 37 | Proyecto como texto y selector de estado shadcn | 2.379.412 | 2.370.432 | 1.544 |
| | **Total, incluidos agentes** | **118.524.336** | **117.790.208** | **163.048** |

Entrada no cacheada: **734.128**. Entrada más salida: **118.687.384** tokens.

La tarea 16 incluye el trabajo del agente principal y estos cuatro agentes, que no se vuelven a sumar al total:

| Agente | Entrada | De entrada, en caché | Salida |
| --- | ---: | ---: | ---: |
| Datos | 2.034.856 | 2.025.216 | 5.346 |
| Kanban | 1.112.412 | 1.104.768 | 4.327 |
| Administración | 2.184.943 | 2.174.464 | 8.274 |
| Revisión | 5.403.152 | 5.374.464 | 8.157 |

Los valores de entrada suman todas las llamadas al modelo. Cada llamada puede volver a incluir parte del contexto de la conversación; por eso no representan el tamaño del código ni palabras únicas. La mayor parte de esa entrada fue atendida desde la caché. El registro indica el modelo `gpt-6.1-terra`; estas cifras son uso registrado, no una factura de API.
