# Diseño del explorador de alumnos

Ejemplo didáctico de React e Ink. Estética editorial sobria adaptada a caracteres de terminal.

## Paleta y jerarquía

- Fondo oscuro: `#151b23`; texto: `#e6ecf3`.
- Azul `#85b4f0`: títulos, selección y borde activo.
- Ámbar `#e0b67b`: instrucciones de teclado.
- Texto secundario `#a4afbe`; borde inactivo `#6c7989`.
- Contraste calculado sobre el fondo: texto 14.56:1, secundario 7.79:1, azul 8.07:1, ámbar 9.19:1. La reproducción depende del soporte de color de la terminal.

## Estructura

Lista y ficha de 50 columnas, separadas por una columna. Se necesitan 101 columnas para ver ambas completas. La tipografía la controla la terminal; negrita para títulos y nombre seleccionado.

Cabecera y pie con margen horizontal de una columna y separación vertical de una fila. Lista con columnas alineadas: indicador, legajo, nombre flexible y comisión. Los nombres largos se truncan solo en la lista; la ficha los muestra completos.

Ficha con etiquetas de 15 columnas. Una fila separa identificación y contacto. Bordes redondeados y misma paleta en ambas vistas.

## Interacción y accesibilidad

Flechas para recorrer sin dar vuelta; scroll únicamente al salir del área visible. Enter abre la ficha; Enter o Esc vuelve conservando posición. El indicador `›` acompaña el color de selección. La ficha mantiene los datos originales del JSON sin interpretar sus estados.

Renderizado incremental, sin animaciones, para responder al teclado con claridad. La evaluación en terminal comprueba alineación, truncado, espaciado y navegación; no sustituye una prueba con usuarios.
