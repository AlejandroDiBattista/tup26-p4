# Diseño de «Un React en miniatura»

Esta guía se aplica únicamente a `apuntes/mini-react-presentacion.html`.

## Propósito

Una presentación para explicar programación con un proyector de baja resolución. El contenido, los ejemplos y la demo tienen prioridad sobre la decoración. Todo vive dentro del HTML y funciona sin conexión.

## Referencia visual

Se toman de [IBM Design Language — Typography basics](https://www.ibm.com/design/language/typography/type-basics/) la alineación consistente, una jerarquía tipográfica clara y el uso contenido del énfasis. Se adapta esa dirección a una clase, con una paleta más cálida y tipografías del sistema.

## Color

| Uso | Color |
| --- | --- |
| Fondo de lectura | `#f8f6ef` |
| Texto principal | `#183431` |
| Texto secundario | `#46645d` |
| Acento verde | `#125c55` |
| Portada y navegación | `#183e39` |
| Énfasis sobre fondo oscuro | `#e6f2c5` |
| Código | `#ecf0e9` |
| Notas | `#f8e8d6`, borde `#a94427` |
| Líneas de código destacadas | `#f3dfa0` |

Los colores de motos, autos y camionetas se repiten en diagramas, ranuras y demo. Los efectos usan también bordes discontinuos o texto explícito: su significado no depende solo del color.

## Tipografía y distribución

- Títulos: Iowan Old Style, Charter, Palatino y Georgia. Lectura: Avenir Next, Segoe UI, Arial y sans-serif. Código: ui-monospace, Menlo y Consolas. Las tres funciones tienen variables propias y compartidas por todas las diapositivas.
- A 800 × 600, títulos de 33,6 px, cuerpo de 28,8 px y código de 20 px. Los ejemplos cortos y largos usan exactamente la misma letra; las comparaciones en dos columnas también.
- Código con interlineado de 1,25, relleno uniforme y una columna de numeración de ancho fijo. Las palabras reservadas y llamadas destacan con color y peso.
- Una diapositiva mantiene el título fuera del área ajustable. La navegación ocupa una franja inferior estable.
- La escala se adapta al tamaño de la pantalla. La portada y los separadores usan una escala mayor; los textos y ejemplos mantienen sus tamaños comunes entre diapositivas.
- Los comentarios y expresiones largos se distribuyen en varias líneas. Todas las líneas de código, incluidas las vacías, conservan el mismo alto.
- Cada bloque se numera desde 1. Los números se generan en una columna independiente, se excluyen de la selección y están ocultos para los lectores de pantalla.
- El ejemplo de la interfaz de `App` se divide en dos diapositivas, conservando su orden y código.
- Tablas con cabecera verde, separadores discretos y filas alternadas. Notas con un borde lateral cálido.

## Interacción y accesibilidad

- Flechas, Page Up / Page Down, Home / End, espacio y gestos táctiles para navegar; F para pantalla completa.
- Botones con nombres accesibles, foco visible y límites de navegación deshabilitados.
- El número de diapositiva se anuncia mediante una región accesible.
- Transiciones breves, de 160–180 ms. `prefers-reduced-motion` elimina las animaciones y transiciones.
- La demo permite desactivar el resaltado de cada render.

## Comprobación

Se recorrieron las 75 diapositivas a 800 × 600. Todos los bloques de código tienen la misma fuente de 20 px, numeración consecutiva desde 1 y contenido sin recortes. Los textos normales comparten una base de 28,8 px. El framework y la lógica de la demo permanecen idénticos al archivo de entrada. No se agregaron recursos externos.
