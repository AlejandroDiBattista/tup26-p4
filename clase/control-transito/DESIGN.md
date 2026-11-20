# Diseño de la interfaz

Referencia del sistema visual actual de la app de conteo de tránsito. Los estilos están implementados en `src/index.css`, `src/App.css` y en los CSS de `src/components/`.

## Intención

La interfaz es una herramienta de registro que se usa mientras se observa el tránsito. La prioridad es encontrar rápido el control correcto y leer cuentas y tiempo de un vistazo.

La dirección visual combina superficies translúcidas inspiradas en Liquid Glass con una marca azul sobria. Los colores propios de cada vehículo identifican los contadores; la distribución usa versiones pastel de esos mismos tonos. El diseño evita que los efectos decorativos compitan con la tarea.

## Paleta y tokens

Los valores base se declaran en `:root` en `src/index.css`. El tema oscuro reemplaza los tokens con `prefers-color-scheme: dark`.

| Token             | Claro                                 | Oscuro                | Uso                                |
| :---------------- | :-----------------------------------: | :-------------------: | :--------------------------------- |
| `--bg`            | `#f0f4fa`                           | `#10151e`           | Fondo de página                    |
| `--text`          | `#596576`                           | `#b1bfd2`           | Texto secundario                   |
| `--text-h`        | `#1d2736`                           | `#f0f5ff`           | Texto principal y títulos          |
| `--border`        | `#dfe6f0`                           | `#303c4d`           | Separadores y elementos de fondo   |
| `--accent`        | `oklch(52% 0.16 255)`                 | `oklch(76% 0.13 255)` | Marca, foco, progreso y resultados |
| `--accent-bg`     | Mezcla del acento al 9% con el fondo  | Mezcla al 16%         | Fondos azules suaves               |
| `--accent-border` | Mezcla del acento al 30% con el borde | Mezcla al 42%         | Bordes de controles destacados     |

Los colores por vehículo se definen en `src/store/slices/contadoresSlice.ts`. Se conservan allí en sus tonos originales para los contadores; el componente `Listar` los aclara al renderizar la barra porcentual.

Los componentes comparten tokens de espaciado (`--space-1` a `--space-5`), radios (`--radius-control`, `--radius-card`, `--radius-surface` y `--radius-pill`) y sombras (`--shadow-card`, `--shadow-control`, `--shadow-control-hover` y `--shadow-track`). Las sombras cambian entre temas y usan un matiz azul neutro. El estado de borrado usa los tokens semánticos `--danger-text`, `--danger-bg` y `--danger-border`, también adaptados al tema.

## Superficies Liquid Glass

| Token                   | Claro         | Oscuro                |
| :---------------------- | :-----------: | :-------------------: |
| `--glass-panel-solid`   | Blanco        | `#1b2330`           |
| `--glass-panel`         | Blanco al 62% | `rgb(31 41 56 / 72%)` |
| `--glass-surface-solid` | Blanco        | `#252f3e`           |
| `--glass-surface`       | Blanco al 52% | Blanco al 7%          |
| `--glass-stroke`        | Blanco al 82% | Blanco al 14%         |
| `--glass-highlight`     | Blanco al 76% | Blanco al 9%          |

El fondo ambiental usa manchas radiales azules de baja intensidad. El panel principal tiene una línea de reflejo superior, bordes finos y sombra amplia. El cronómetro, los resultados y el navegador de sesiones reciben superficies elevadas. El desenfoque se limita a esas superficies y al campo de nombre; los ocho contadores no crean capas de desenfoque individuales.

Cada superficie tiene un fondo sólido de respaldo. `backdrop-filter` se agrega con `@supports`; si no está disponible, la interfaz conserva su jerarquía con fondos opacos. Los metadatos de `index.html` coordinan el color de la barra del navegador con el tema.

## Tipografía y jerarquía

- Cuerpo y encabezados usan la tipografía del sistema (`system-ui`, `Segoe UI` o Roboto según la plataforma).
- El título principal escala con el ancho de pantalla y se alinea a la izquierda.
- Las etiquetas de vehículo son grandes; los emojis y las cuentas ocupan columnas reservadas para mantener la alineación.
- El cronómetro usa una fuente monoespaciada y cifras tabulares para que el ancho no cambie mientras corre.
- Total y flujo se muestran juntos, con la etiqueta arriba y el valor debajo.

## Composición y componentes

### Contadores

`Contador` es un botón de tres columnas: icono, etiqueta y cuenta. Su fondo toma un 9% del color del vehículo y su cifra mezcla el color de categoría con el texto principal para conservar contraste. El contador se habilita solo mientras corre el cronómetro; una vista previa de sesión también lo bloquea.

### Cronómetro y progreso

`Cronometro` muestra `mm:ss.d`, controles de icono y una barra de cinco minutos. Las marcas sutiles aparecen cada diez segundos y las más fuertes cada minuto. Al completar la observación aparece una confirmación breve.

### Resultados y distribución

`Resultado` presenta Total y Flujo en una misma superficie. Debajo, `Listar` genera segmentos según la proporción de cada vehículo. Cada segmento mezcla su color original al 56% con blanco, y muestra el emoji superpuesto en una cápsula translúcida.

### Sesiones

`Sesiones` queda al pie de la pantalla. El campo permite guardar el muestreo cuando el cronómetro está detenido. La fila compacta contiene el nombre, posición y acciones para recorrer, volver a los datos actuales o borrar la sesión mostrada.

## Interacción y movimiento

- Los botones muestran respuesta al pasar el cursor y al presionar, con movimiento corto de traslación o escala.
- Los mensajes de guardado, borrado y finalización duran poco y no detienen el flujo de conteo.
- Las animaciones se desactivan cuando el sistema indica `prefers-reduced-motion: reduce`.
- Con movimiento reducido se eliminan también las transformaciones de hover y presión.
- Los controles de icono tienen nombres accesibles y usan el estado nativo deshabilitado; cuando corresponde, la interfaz muestra una explicación contextual.

## Adaptación y accesibilidad

- El panel tiene un ancho máximo de `64rem` y padding fluido.
- La lista pasa de dos columnas a una hasta 820 px; el documento admite anchos desde 320 px.
- Los botones de sesión tienen un área táctil mínima de 44 px.
- Los botones de conteo y navegación tienen nombres accesibles; los cambios de estado importantes usan `role="status"`.
- El foco de teclado tiene un contorno visible. El modo de colores forzados usa colores del sistema y quita desenfoques y sombras.
- Los emojis complementan las etiquetas y no son el único medio para identificar vehículos.

## Pautas para cambios futuros

1. Reutilizar los tokens de tema antes de introducir colores nuevos. Reservar `--accent` para la marca azul y dejar los colores de vehículo para sus categorías.
2. Mantener texto y cifras legibles sobre superficies translúcidas; revisar los temas claro y oscuro.
3. Aplicar desenfoque solo donde ayude a distinguir capas. Evitar repetirlo en cada tarjeta o icono.
4. Mantener las proporciones y etiquetas de la barra comprensibles aunque los tonos se suavicen.
5. Comprobar el diseño en pantalla angosta, con teclado y con movimiento reducido cuando un cambio afecte esos comportamientos.
