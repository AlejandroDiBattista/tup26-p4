# Especificación de diseño — Agenda estilo dashboard

## Referencia

La interfaz toma como referencia un dashboard de viajes: fondo celeste pálido, contenedor elevado, navegación lateral oscura, superficies claras y acentos dorados.

## Objetivo

Presentar una agenda de 20 contactos mediante un esquema maestro–detalle. La lista permite elegir un contacto y el panel principal muestra sus datos en un formulario de consulta.

## Composición

- La página ocupa toda la ventana, con un margen exterior de 34 px en escritorio y 12 px en pantallas pequeñas.
- Fondo general celeste muy claro.
- Dashboard central con una cabecera superior y dos paneles inferiores.
- La cabecera ocupa aproximadamente 88 px y tiene fondo celeste grisáceo.
- Los paneles inferiores mantienen una relación de ancho 1:2:
  - panel izquierdo: un tercio, navegación y lista de contactos;
  - panel derecho: dos tercios, formulario del contacto seleccionado.
- El dashboard tiene esquinas redondeadas y una sombra amplia y suave.
- La lista y el detalle tienen scroll vertical independiente; el cuerpo no se desplaza.

## Paleta

| Elemento | Color |
| --- | --- |
| Fondo de página | `#e7f3f3` |
| Fondo de cabecera y contenedor | `#dfeeed` |
| Panel lateral | `#355454` |
| Hover lateral | `#496868` |
| Panel de detalle | `#edf5f3` |
| Tarjeta del formulario | `#fffefa` |
| Selección y acento | `#d5a622` |
| Texto principal | `#314b4b` |
| Texto claro lateral | `#f7f4e5` |
| Texto secundario | `#779090` |
| Campo | `#f4f8f6` |
| Borde de campo | `#d6e4e1` |

## Tipografía

- Familia principal: `"Trebuchet MS", Arial, sans-serif`.
- Título de cabecera: 1.6 rem, peso normal, con un leve espaciado entre letras.
- Título del detalle: tamaño aproximado de 1.5 rem y color verde petróleo.
- Título de la lista: 0.8 rem, mayúsculas y espaciado de letras de 0.12 em.
- Etiquetas: 0.75 rem, mayúsculas, peso destacado y color secundario.
- Valores de los campos: tamaño heredado, color principal.

## Panel izquierdo: maestro

- Fondo verde petróleo oscuro.
- Encabezado «Contactos (20)» en texto marfil.
- Los 20 nombres se presentan en una lista vertical scrolleable.
- Cada elemento es un botón de ancho completo, transparente en estado normal y con esquinas de 9 px.
- Al pasar el cursor, el botón usa el verde petróleo más claro.
- El contacto seleccionado usa fondo dorado y texto marfil, con peso de fuente mayor.
- Los botones deben seguir siendo navegables con teclado y conservar un foco visible.

## Panel derecho: detalle

- Fondo verde agua muy claro.
- Tarjeta blanca cálida, centrada, con ancho máximo de 680 px, radio de 18 px y sombra discreta.
- Título dinámico con el nombre completo del contacto seleccionado.
- Campos ordenados verticalmente:
  1. Nombre
  2. Apellido
  3. Teléfono
  4. Dirección
- Cada etiqueta aparece arriba de su input.
- Los inputs son de solo lectura, tienen fondo casi blanco, borde fino y radio de 8 px.
- El foco de los inputs usa un contorno dorado.

## Interacción

- Al cargar, se muestra el primer contacto.
- Al seleccionar un nombre, se actualizan el título y los cuatro valores del formulario sin recargar la página.
- Solo un contacto puede estar activo a la vez.
- La lista permanece disponible mientras se consulta el detalle.

## Responsive

Para anchos de hasta 700 px:

- El margen exterior se reduce a 12 px.
- La cabecera pasa a 64 px de alto y reduce su padding.
- El título se reduce a 1.15 rem.
- El panel de detalle usa 14 px de padding.
- La tarjeta del formulario usa 20 px de padding.
- Se conserva la relación 1:2 y el desplazamiento independiente de los paneles.

## Accesibilidad

- Usar elementos semánticos `header`, `main`, `nav`, `section` y `form`.
- Los contactos deben implementarse como botones nativos.
- Cada etiqueta debe estar asociada a su campo mediante `for` e `id`.
- Proporcionar nombres accesibles para los paneles mediante `aria-label`.
- Mantener contraste suficiente entre el texto claro, el panel oscuro y el acento dorado.
- Mostrar estados de foco visibles para navegación con teclado.

## Criterios de aceptación

- La apariencia general recuerda al dashboard de la imagen: celeste, verde petróleo, blanco cálido y dorado.
- La cabecera, el panel izquierdo y el panel derecho ocupan la ventana completa dentro del margen.
- La lista contiene exactamente 20 contactos y es scrolleable.
- El detalle contiene nombre, apellido, teléfono y dirección en inputs con etiquetas superiores.
- La distribución de paneles es 1/3 para la izquierda y 2/3 para la derecha.
- La selección actualiza correctamente el formulario y muestra un único estado activo.
