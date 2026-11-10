# Criterio de diseño: panel de Trama

El panel ayuda a pasar de una vista general de tareas a una acción concreta sin cambiar de pantalla. Primero se reconocen los filtros y las columnas; después, el proyecto y el título de cada tarjeta; por último, sus acciones y responsable.

Los colores suaves provienen de los estados configurables y se usan como orientación, no como única fuente de significado. El feedback del arrastre explica qué movimientos son posibles. Las tarjetas responden sutilmente al foco o al puntero sin interrumpir la lectura.

Como referencia de estructura se consideraron los bloques de panel y navegación de shadcn/ui, adaptados al tablero ya acordado para Trama. En pantallas estrechas, el desplazamiento horizontal preserva el orden y las acciones de todas las columnas.


## El mockup como cuaderno de trabajo — 2026-11-05

La variante `../mockup.html` presenta la herramienta como un boceto de lápiz sobre papel. La letra manuscrita, los trazos dobles y el rayado de grafito sostienen esa idea en navegación, tarjetas, formularios y barras de avance.

La pantalla comienza con un título subrayado y filtros claramente etiquetados. Después aparecen las columnas abiertas y las tarjetas, cuyo contenido tiene prioridad sobre los controles. Al pasar el puntero, una tarjeta se eleva apenas, como una ficha sobre la mesa. Las flechas permiten moverla sin arrastrar. Editar y eliminar permanecen visibles con menor peso visual.

Se tomó como referencia conceptual el enfoque de [bocetos para comunicar interacciones de Balsamiq](https://balsamiq.com/learn/specifying-interaction/). La composición se adaptó al mockup existente y al pedido de una apariencia de lápiz; no se incorporaron recursos visuales externos de esa referencia.

El momento principal es reconocer una tarea y cambiar su estado. Los efectos acompañan esa acción sin retrasarla. Las personas que prefieren movimiento reducido reciben la misma información sin animación. La fuente y las texturas están incorporadas para conservar la apariencia al abrir el archivo sin conexión.
