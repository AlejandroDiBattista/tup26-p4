# Guía visual: panel de Trama

## Enfoque

El panel es una herramienta de trabajo: prioriza la lectura rápida de tareas, una jerarquía sencilla y controles reconocibles de shadcn/ui. El contenido real y los estados configurados por el usuario determinan la composición.

## Color y tipografía

La interfaz usa texto oscuro sobre superficies claras, bordes grises sutiles y la pila de fuentes del sistema. Cada columna conserva el color suave asociado a su estado; el nombre y el contador también identifican la columna para no depender solo del color. Los destinos permitidos y no permitidos al arrastrar se diferencian mediante texto e íconos, además del color.

## Distribución

La cabecera presenta el nombre del panel y la acción principal. Los filtros están agrupados y etiquetados. El tablero usa columnas de al menos 280 px: ocupa el ancho disponible y permite desplazamiento horizontal cuando los estados no entran en pantalla. Cada tarjeta muestra proyecto, título y descripción; responsable y acciones permanecen en una sola fila.

## Interacción y accesibilidad

Los controles de cambiar estado, editar y eliminar tienen nombres accesibles. Las flechas ofrecen una alternativa al arrastre. El selector de responsable conserva el componente de shadcn/ui. El foco de teclado es visible y la respuesta al pasar sobre una tarjeta usa una transición breve, desactivada cuando se solicita movimiento reducido.

## Implementación

El panel se compone en `src/components/kanban/KanbanBoard.tsx`; los estilos de interacción están en `src/index.css`. La búsqueda y los filtros siguen gestionados por `useKanban`. El diálogo, las reglas de transición y la persistencia conservan sus responsabilidades existentes.


## Variante del mockup a lápiz — 2026-11-05

Estos criterios corresponden únicamente a `../mockup.html`. La aplicación React descrita arriba conserva su propio sistema visual.

### Paleta y tipografía

- Papel: `#f5f3ed`; tarjetas: `#fcfbf7`; grafito: `#393731`; texto secundario: `#6b675f`.
- Acción principal: fondo `#514e47` con texto `#fffdf6` y rayado tenue.
- Patrick Hand incorporada al HTML con su licencia OFL. Títulos de pantalla de 36–46 px, secciones de 23–25 px, títulos de tarea de 21 px y texto de 17–18 px.
- La textura es discreta y los trazos decorativos están separados del texto. Cada contorno tiene una pequeña variación determinista, sin vibración al interactuar.

### Jerarquía y distribución

El recorrido visual es título, filtros, columnas y tarjetas. Las columnas llevan un subrayado a lápiz; las tarjetas conservan un contorno doble. El título de una tarea dispone del ancho completo. Responsable y flechas comparten la fila inferior, seguidos por las acciones de edición y eliminación.

Panel y Tareas ofrecen búsqueda, proyecto y responsable. La pantalla Tareas no incluye filtro de estado: el tablero presenta los tres estados simultáneamente.

El tablero tiene tres columnas en escritorio y una hasta 800 px. Hasta 600 px la navegación se distribuye en dos filas y los filtros ocupan el ancho disponible. Las tablas desplazan su contenido dentro de su propio contenedor.

### Interacciones y accesibilidad

- Etiquetas visibles para los filtros y encabezados de columna con nivel `h2`.
- Flechas y botones con un área mínima de 44 × 44 px en pantallas pequeñas o con puntero táctil.
- Enlace para saltar al contenido; foco de teclado con contorno discontinuo.
- Elevación de tarjetas de 2 px al pasar el puntero y respuesta de botones de 1 px, con transición de 160 ms.
- Apertura de diálogos y avisos de 180 ms. Estas animaciones solo se habilitan con `prefers-reduced-motion: no-preference`.
- En modo de colores forzados, los contornos decorativos se sustituyen por bordes del sistema.

Contrastes calculados sobre colores base: texto principal/tarjeta 11,49:1, secundario/tarjeta 5,44:1, secundario/papel 5,07:1 y acción principal 8,15:1. Estas mediciones no constituyen una auditoría completa de accesibilidad.

### Revisión visual

Valoración interna heurística: 8/10 en jerarquía, legibilidad y coherencia del estilo. Se redujeron los recuadros anidados y se separaron títulos y controles. La revisión incluye escritorio de 1440 px y móvil de 390 px, navegación, filtros, cambio de estado y preferencia de movimiento reducido; no incluye pruebas con usuarios.
