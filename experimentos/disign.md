# Especificación de diseño — Agenda de contactos

## Objetivo

Crear una agenda de ejemplo con 20 contactos ficticios y navegación maestro–detalle. La implementación de referencia es [demo.html](demo.html), con HTML, CSS embebido y JavaScript nativo, sin dependencias externas.

## Dirección visual

Inspirada en la imagen de referencia de TimeFrame: superficie lavanda, paneles redondeados, tarjetas claras, tipografía suave y acentos verde lima. La composición debe sentirse tranquila, espaciosa y legible.

## Estructura y distribución

- Fondo general gris claro y contenedor lavanda centrado, de hasta 1280 px de ancho.
- La aplicación ocupa la altura de la ventana, descontando el margen exterior.
- Cabecera con marca «Mi agenda», título «Tus contactos», subtítulo «Las personas, siempre cerca.» y contador «20 contactos» en una cápsula oscura.
- Debajo, dos columnas: lista a la izquierda con 1/3 del espacio y detalle a la derecha con 2/3, descontando la separación de 22 px.
- Ambos paneles completan la altura disponible bajo la cabecera.
- Cada panel tiene desplazamiento vertical independiente cuando su contenido excede la altura. La página no se desplaza y la cabecera permanece visible.
- El perfil y los campos se desplazan juntos dentro del panel derecho.

## Paleta

| Uso | Color |
| --- | --- |
| Fondo de página | `#f3f3f2` |
| Contenedor principal | `#a29dc9` |
| Panel de contactos | `#918bb8` |
| Panel de detalle y texto claro | `#fffefa` |
| Selección y avatar principal | `#d0fa73` |
| Texto principal | `#32253f` |
| Cápsula del contador y foco | `#443052` |
| Hover de contactos | `#a6a0c8` |
| Texto secundario | `#756a87` |
| Etiquetas | `#746a84` |
| Fondo de campos | `#f6f5f9` |
| Bordes de campos | `#e8e5ef` |
| Separador del perfil | `#eeecf2` |

## Tipografía y formas

- Familia: `"Avenir Next", Avenir, "Trebuchet MS", sans-serif`.
- Título de página: tamaño fluido de 25 a 36 px, peso 600.
- Nombre en el detalle: tamaño fluido de 22 a 30 px, peso 600.
- Nombres en la lista: 14 px; etiquetas: 12 px; valores: 16 px.
- Contenedor: radio de 30 px y sombra `0 30px 55px #332c4326`.
- Paneles: radio de 25 px; filas: 15 px; campos: 12 px.
- Padding exterior: `clamp(12px, 4vw, 64px)`; interior del contenedor: `clamp(16px, 3vw, 40px)`.
- Perfil y formulario: padding de 32 px. Campos separados por 28 px, con 10 px entre etiqueta y valor.

## Maestro: lista de contactos

- Título «Todos los contactos» y 20 botones en una lista vertical.
- Cada botón muestra iniciales en un círculo de 34 px y el nombre y apellido completos.
- Estado normal: fondo transparente y texto claro sobre lavanda.
- Hover: fondo lavanda más claro.
- Seleccionado: fondo lima, texto oscuro y peso 600.
- Foco de teclado: contorno oscuro de 3 px.
- Los nombres largos pueden partirse en varias líneas.

## Detalle del contacto

- Superficie clara con un bloque de perfil y un formulario de consulta debajo.
- Perfil: avatar de iniciales de 70 × 70 px con fondo lima, nombre completo y texto «Información de contacto».
- Tres campos verticales: Nombre, Apellido y Teléfono.
- Cada etiqueta aparece arriba de su valor y está asociada al campo mediante `for` e `id`.
- Los campos son de solo lectura; permiten enfocar y copiar valores. El teléfono utiliza `type="tel"`.

## Datos e interacción

- Cada contacto contiene `nombre`, `apellido` y `telefono`, todos como cadenas de texto.
- Los datos ficticios están definidos en un arreglo local de JavaScript.
- Al cargar, se selecciona el primer contacto: Ana García, teléfono `381 555-0101`.
- Al pulsar un contacto, se actualizan inmediatamente las iniciales, el título y los tres campos del detalle, sin recargar la página.
- Solo un contacto puede estar seleccionado a la vez; su botón expone `aria-pressed="true"`.
- Alcance actual: consulta y selección. No incluye edición, altas, bajas, búsqueda ni persistencia.

## Adaptación a pantallas pequeñas

Hasta 600 px de ancho:

- Mantener las dos columnas y la relación 1:2.
- Reducir el padding del contenedor a 16 px y su radio a 20 px.
- Reducir la separación entre paneles a 10 px.
- Ocultar únicamente las iniciales de la lista; conservar nombres y apellidos.
- Reducir el texto de la lista a 12 px y el padding de perfil y formulario a `20px 14px`.
- Mantener el desplazamiento independiente y los campos dentro del ancho de su panel.

## Accesibilidad y movimiento

- Documento en español, con `header`, `main`, `nav` y una sección de detalle identificada.
- Contactos implementados como botones nativos, utilizables con Tab, Enter y Espacio.
- Detalle enfocable para permitir desplazamiento por teclado.
- Nombre seleccionado con `aria-live="polite"`; iniciales decorativas con `aria-hidden="true"`.
- Indicadores visibles de foco en botones, panel derecho y campos.
- Transiciones de color de 150 ms, desactivadas con `prefers-reduced-motion: reduce`.

## Criterios de aceptación

- Se muestran exactamente 20 contactos con nombre, apellido y teléfono.
- El primer contacto aparece seleccionado al abrir la página.
- Seleccionar cualquier contacto actualiza todos sus datos y deja una única fila activa.
- Las etiquetas se muestran encima de los valores, en campos de solo lectura.
- La lista y el detalle se desplazan por separado cuando desbordan, sin mover la cabecera.
- Se conserva la distribución 1/3–2/3 tanto en escritorio como en pantallas pequeñas.
- La apariencia utiliza la paleta lavanda, blanco cálido y lima definida en esta especificación.
- La página funciona localmente con los estilos y el script incluidos en el mismo HTML.
