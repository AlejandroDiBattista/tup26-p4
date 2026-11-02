# Auditoría de interfaz

**Alcance:** pantalla de conteo, cronómetro, resultados, distribución y navegación de sesiones. Revisión de los componentes y CSS, más inspección del árbol de accesibilidad en Chrome en `http://192.168.100.115:5173/`. No se modificó la aplicación ni se recorrieron flujos que alteraran el muestreo.

## Veredicto de anti patrones

**Aprobado, con una observación.** No aparecen degradados decorativos, vidrio esmerilado, brillos ni elementos de marketing genéricos. La repetición de los contadores en una grilla tiene una razón funcional. Los tonos por categoría refuerzan la relación entre cada contador y su segmento de distribución. La tipografía de sistema y el patrón de tarjetas son convencionales, pero no hacen que esta pantalla operativa parezca claramente generada por una plantilla.

## Resumen ejecutivo

Se encontraron **6 hallazgos**: 1 alto, 4 medios y 1 bajo. No se identificaron bloqueos críticos.

Los puntos principales son el contraste insuficiente de algunos valores numéricos sobre sus fondos pastel, el posible desborde de las etiquetas en anchos intermedios y botones de navegación más pequeños que el tamaño táctil recomendado. El árbol de accesibilidad sí expone nombres para los botones principales y la barra de progreso.

**Evaluación general: 7/10.** La pantalla tiene una jerarquía clara y utiliza estilos compartidos; requiere ajustes de contraste y adaptación a tamaños intermedios antes de considerarla robusta para uso prolongado en campo.

## Hallazgos detallados

### Alto

#### 1. Algunos números de los contadores no alcanzan contraste AA

- **Ubicación:** [Contador.css](/Users/adibattista/Documents/GitHub/tup26-p4/clase/vite/src/components/Contador.css:29), colores definidos en `src/store/slices/contadoresSlice.ts`.
- **Categoría:** Accesibilidad / tema.
- **Descripción:** Los valores toman el color saturado de su categoría sobre un fondo con una mezcla pastel del mismo color. Una estimación de contraste para esa mezcla en tema claro da aproximadamente 2.60:1 para Colectivos, 2.69:1 para Bicicletas y 2.98:1 para Tractores. Como los valores son texto grande, el mínimo AA es 3:1; estos tres quedan por debajo o ligeramente por debajo.
- **Impacto:** La cifra es el dato principal de cada control. Personas con baja visión o pantallas con poco brillo pueden tener dificultad para leerla.
- **WCAG:** 1.4.3 Contraste mínimo (AA).
- **Recomendación:** Medir las combinaciones finales en navegador y oscurecer los colores de texto que no lleguen a 3:1, manteniendo los colores actuales de las barras. Repetir la medición en tema oscuro.
- **Comando sugerido:** `/normalize` o `/harden`.

### Medios

#### 2. Riesgo de que las etiquetas se desborden en anchos de tablet

- **Ubicación:** [Listar.css](/Users/adibattista/Documents/GitHub/tup26-p4/clase/vite/src/components/Listar.css:63) y [Contador.css](/Users/adibattista/Documents/GitHub/tup26-p4/clase/vite/src/components/Contador.css:1).
- **Categoría:** Diseño adaptable.
- **Descripción:** La grilla conserva dos columnas hasta 560 px. En anchos apenas superiores, cada contador puede quedar cerca de 250 px, pero reserva 4em para el icono, 5.5em para el número, dos espacios y padding antes de asignar ancho a la etiqueta. Nombres como “Camionetas” pueden exceder la columna restante.
- **Impacto:** La etiqueta puede montarse sobre el icono o la cifra y dificultar identificar el tipo de vehículo durante el registro.
- **Estándar:** Reflujo de contenido, WCAG 1.4.10 (AA).
- **Recomendación:** Probar la grilla en 600, 700 y 800 px; adelantar el cambio a una columna o reducir de manera fluida las columnas laterales y la tipografía.
- **Comando sugerido:** `/adapt`.

#### 3. Los botones de sesión son pequeños para uso táctil

- **Ubicación:** [Sesiones.css](/Users/adibattista/Documents/GitHub/tup26-p4/clase/vite/src/components/Sesiones.css:102).
- **Categoría:** Accesibilidad / diseño adaptable.
- **Descripción:** Cada flecha y el botón de inicio miden 2rem por lado: aproximadamente 32–36 px según el tamaño base aplicado. Están agrupados y tienen etiquetas accesibles, pero no alcanzan los 44 px recomendados para una interacción cómoda con el dedo.
- **Impacto:** En un teléfono, una persona puede tocar la acción vecina o tener dificultad para navegar mientras observa el tránsito.
- **Estándar:** Recomendación de objetivo táctil de 44 × 44 px; WCAG 2.2, 2.5.8 permite objetivos menores bajo ciertas condiciones, por lo que este punto es de comodidad, no una infracción confirmada.
- **Recomendación:** Aumentar el área interactiva a 44 px sin agrandar necesariamente el icono visible.
- **Comando sugerido:** `/adapt` o `/polish`.

#### 4. Los contadores deshabilitados no explican el motivo junto a la lista

- **Ubicación:** [Contador.tsx](/Users/adibattista/Documents/GitHub/tup26-p4/clase/vite/src/components/Contador.tsx:18).
- **Categoría:** Accesibilidad / claridad de interacción.
- **Descripción:** Cuando el cronómetro está pausado o detenido, el navegador expone correctamente los contadores como deshabilitados. La explicación aparece en otra zona de la página y solo para guardar o recorrer sesiones; no explica por qué los botones de conteo no responden.
- **Impacto:** Una persona que llega directamente a la lista puede interpretar que los controles están rotos, especialmente si no ve el estado del cronómetro.
- **Recomendación:** Asociar el estado del cronómetro con los contadores y mostrar una indicación breve próxima a la lista, por ejemplo “Prendé el cronómetro para contar”.
- **Comando sugerido:** `/clarify`.

#### 5. El cronómetro repinta el componente cien veces por segundo

- **Ubicación:** [Cronometro.tsx](/Users/adibattista/Documents/GitHub/tup26-p4/clase/vite/src/components/Cronometro.tsx:28).
- **Categoría:** Rendimiento.
- **Descripción:** El intervalo actualiza Zustand cada 10 ms y vuelve a renderizar el cronómetro cien veces por segundo. La interfaz muestra centésimas, pero la actualización continua y la transición de ancho de la barra con esa frecuencia consumen trabajo repetido.
- **Impacto:** En teléfonos de menor rendimiento o durante observaciones largas puede aumentar el uso de CPU y batería; la transición de la barra puede quedar reiniciándose continuamente.
- **Recomendación:** Alinear la frecuencia de actualización visual con la resolución realmente necesaria para mostrar centésimas y evitar transiciones de ancho que compitan con cada actualización.
- **Comando sugerido:** `/optimize`.

**Seguimiento (26-10-2026): corregido.** El intervalo se redujo de 10 ms a 50 ms, es decir, de 100 a 20 actualizaciones por segundo. El flujo ahora selecciona segundos enteros, por lo que `Listar` recalcula una vez por segundo. El build de producción pasó. El JS minificado pasó de 230.92 a 230.94 kB (gzip: 72.19 a 72.20 kB); el cambio se centra en el trabajo de ejecución, no en el tamaño descargado. La reducción de renders se deduce de las frecuencias de actualización en el código; no se midió con React Profiler ni se comparó CPU en un dispositivo.

### Bajo

#### 6. La vista previa de sesión no se identifica claramente como tal

- **Ubicación:** [Listar.tsx](/Users/adibattista/Documents/GitHub/tup26-p4/clase/vite/src/components/Listar.tsx:16) y [Sesiones.tsx](/Users/adibattista/Documents/GitHub/tup26-p4/clase/vite/src/components/Sesiones.tsx:16).
- **Categoría:** Claridad / accesibilidad.
- **Descripción:** Al seleccionar una sesión se reemplazan visualmente los valores actuales por los de la vista previa y se bloquean los controles. El nombre seleccionado aparece al pie, pero el cronómetro y la lista no indican que los valores sean una vista previa. El botón ⌂ tiene nombre accesible y tooltip, aunque su función no se expresa en el propio rótulo visual.
- **Impacto:** Al volver la mirada a los contadores, puede no ser evidente que los números visibles pertenecen a una sesión guardada.
- **Recomendación:** Mostrar una etiqueta visible y discreta de “Vista previa: [nombre]” junto al cronómetro o cerca del encabezado; conservar el nombre accesible del botón de retorno.
- **Comando sugerido:** `/clarify`.

## Patrones y observaciones sistémicas

- Los colores de categoría también se usan como color de texto. El fondo pastel reduce el contraste de algunos tonos; conviene distinguir los colores decorativos de los colores usados para cifras.
- Los controles de navegación se diseñaron para ser compactos y quedaron por debajo del tamaño táctil cómodo.
- La interfaz cambia entre datos actuales y una sesión previsualizada, pero el estado de vista previa no se comunica junto a los datos que cambia.
- Hay reglas de estilos de la plantilla inicial en [index.css](/Users/adibattista/Documents/GitHub/tup26-p4/clase/vite/src/index.css:10) (`--social-bg`, `--shadow` y `#social`) que no participan de esta interfaz. No afectan el funcionamiento, pero agregan estilos ajenos a la pantalla.

## Aspectos positivos

- Los contadores usan botones nativos con nombres accesibles que incluyen etiqueta y valor.
- Los botones de sesión tienen `aria-label`, `title` y estados deshabilitados coherentes con el cronómetro.
- La barra de tiempo expone `progressbar`, límites y valor actual para tecnologías de asistencia.
- Los campos de nombre tienen etiqueta asociada y límite de longitud.
- Los colores de segmentos conservan una relación directa con las categorías, y el diseño no depende exclusivamente del color porque los contadores también muestran texto e iconos.
- La grilla pasa a una columna en móviles angostos y el contenido usa anchos fluidos.
- Los contadores incluyen un indicador `:focus-visible` explícito para navegación por teclado.

## Recomendaciones por prioridad

1. **Inmediato:** ajustar y volver a medir el contraste de los valores de Colectivos, Bicicletas y Tractores en ambos temas.
2. **Próximo:** verificar el ancho de las etiquetas entre 560 y 850 px; ampliar el área táctil de los tres botones de sesión.
3. **Después:** explicar junto a la lista por qué los contadores están deshabilitados y marcar visiblemente el modo de vista previa.
4. **Optimización:** reducir actualizaciones visuales innecesarias del cronómetro y limpiar reglas de la plantilla que ya no se usan.

## Comandos sugeridos

- `/normalize`: revisar contraste de las cifras sin cambiar la paleta de las barras.
- `/adapt`: corregir el comportamiento en tablet y ampliar objetivos táctiles.
- `/clarify`: comunicar los estados de conteo y vista previa.
- `/optimize`: ajustar el ciclo de actualización del cronómetro.
- `/polish`: retirar estilos heredados y hacer el pase final de consistencia.

## Límites de esta auditoría

La estimación de contraste de los números se calculó sobre la mezcla pastel declarada en CSS y debe confirmarse con los colores computados del navegador y el tema oscuro. La inspección de Chrome fue de solo lectura; no se alteró el cronómetro ni los conteos. No se midieron métricas de rendimiento con un perfilador ni se recorrieron tamaños de ventana con pruebas visuales automatizadas.

## Seguimiento del rediseño visual (26-10-2026)

- Se ajustó la grilla a una columna hasta 820 px para conservar espacio para las etiquetas.
- Los botones de navegación de sesiones ahora tienen al menos 44 px de alto.
- Los números de categoría mezclan su tono con el color de texto principal para elevar el contraste; una estimación sobre fondo blanco da un mínimo aproximado de 4.6:1. Falta confirmar el contraste computado sobre las superficies translúcidas en los temas claro y oscuro.
- El desenfoque se limita al panel y superficies principales; no se aplica por separado a cada contador ni a cada icono.
- `npm run build` pasó tras el rediseño. No se perfiló el uso de CPU ni se automatizó una captura visual de tamaños de pantalla.

## Seguimiento del cronómetro (26-10-2026)

El cronómetro pasó a mostrar décimas (`mm:ss.d`) y a actualizarse cada 100 ms. La acción del store conserva el residuo entre ticks, así que el tiempo no se acorta al redondear la presentación. `Listar` continúa observando segundos enteros para el flujo.

La marca violeta se reemplazó por azul en los temas claro y oscuro y en los metadatos/icono del navegador. Los tonos por categoría de contadores y distribución se mantuvieron.

Los colores renderizados de los segmentos de distribución ahora se suavizan mezclando cada color de categoría con blanco; los colores originales del store siguen disponibles para los contadores.
