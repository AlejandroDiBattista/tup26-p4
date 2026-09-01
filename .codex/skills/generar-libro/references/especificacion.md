# Especificación de publicación de «Pensar en JavaScript»

Esta referencia fija los requisitos recuperados del chat editorial del libro y los concreta para este proyecto.

## Convenciones del proyecto

- Raíz de fuentes: `apuntes/libro-gpt/`
- Índice canónico: `apuntes/libro-gpt/00-indice.md`
- Portada predeterminada: `apuntes/portada.jpg`
- Documento maestro: `apuntes/libro-gpt/libro-completo.md`
- Mapa de procedencia: `apuntes/libro-gpt/mapa-de-fuentes.md`
- Informe editorial: `apuntes/libro-gpt/00-informe-editorial.md`
- EPUB: `apuntes/Pensar-en-JavaScript.epub`
- PDF: `apuntes/Pensar-en-JavaScript.pdf`
- Fuentes: `apuntes/Pensar-en-JavaScript-fuentes.zip`
- Entrega: `apuntes/Entrega-Pensar-en-JavaScript.zip`

Si el repositorio ya mantiene una ubicación equivalente y claramente vigente, conservar esa convención en vez de crear duplicados, y documentarla en el informe.

Metadatos predeterminados:

- título: `Pensar en JavaScript`;
- subtítulo: `De los datos a las soluciones`;
- autor: `Ing. Alejandro Di Battista`;
- idioma: `es-AR`;
- materia: `Programación IV`.

## Selección y orden del contenido

Interpretar `00-indice.md` como un manifiesto editorial, no como un archivo más para ordenar alfabéticamente.

1. Extraer las partes o bloques principales en su orden de aparición.
2. Dentro de cada bloque, resolver los enlaces Markdown a capítulos, material complementario, apéndices y referencias técnicas.
3. Incorporar prefacio e introducción cuando estén declarados por el índice.
4. Incluir cada fuente una sola vez y registrar su relación con el documento maestro en `mapa-de-fuentes.md`.
5. Excluir `README.md`, archivos generados, informes, cuestionarios y cualquier archivo cuyo nombre contenga `(no)`.
6. Tratar como error editorial un enlace roto, una fuente repetida, un capítulo esperado sin enlace o un archivo `(no)` enlazado. No resolver estas diferencias silenciosamente.

El índice visible de las ediciones debe derivarse de esta jerarquía. Las descripciones, rutas de lectura y notas de trabajo presentes en `00-indice.md` no se convierten automáticamente en capítulos salvo que el propio índice las declare como contenido del libro.

## Criterios editoriales

Las dos ediciones deben compartir exactamente el mismo cuerpo editorial:

- español argentino moderado y vocabulario técnico estándar;
- tono universitario directo;
- continuidad de libro, sin rastros de prompts, pedidos a una IA o respuestas independientes;
- ausencia de ejercicios, cuestionarios e instrucciones editoriales dentro de la edición publicada;
- progresión general desde motivación y modelo conceptual hacia mecanismos concretos y consecuencias prácticas;
- variedad estructural razonable: no imponer a todos los capítulos una plantilla mecánica idéntica.

En una tarea de solo publicación, no reescribir silenciosamente capítulos para corregir incumplimientos: registrar los hallazgos y detener la entrega final si afectan los requisitos. Cuando la solicitud incluya edición, aplicar las correcciones antes de construir el documento maestro.

## Documento maestro y mapa de fuentes

`libro-completo.md` es la representación completa y ordenada que alimenta ambos formatos. Debe:

- incluir página de título y metadatos editoriales;
- conservar el texto, tablas, listas, código, Unicode, diagramas de texto y enlaces de los capítulos;
- establecer límites de parte y capítulo inequívocos;
- normalizar enlaces internos para que sigan siendo válidos después de combinar las fuentes;
- evitar títulos duplicados producidos por la concatenación;
- ser regenerable sin duplicar contenido en ejecuciones sucesivas.

`mapa-de-fuentes.md` debe registrar, al menos, el orden, bloque, título y ruta de cada fuente incluida. No debe sustituir al índice canónico.

## EPUB 3

Generar `Pensar-en-JavaScript.epub` con:

- contenedor EPUB 3 íntegro;
- idioma `es-AR` y metadatos de título, subtítulo y autor;
- portada identificada semánticamente;
- página de título;
- tabla de contenidos navegable;
- saltos apropiados entre partes y capítulos;
- enlaces internos válidos;
- representación correcta de código, tablas, listas, Unicode y diagramas de texto.

La navegación admite como máximo dos niveles:

1. partes o bloques principales;
2. capítulos, material complementario, apéndices y referencias técnicas.

No agregar a la navegación los subtítulos internos de cada capítulo.

Validar, como mínimo:

- integridad ZIP y presencia de `mimetype`, `META-INF/container.xml` y paquete OPF;
- declaración EPUB 3 y `es-AR`;
- correspondencia entre manifiesto, columna vertebral, navegación y recursos físicos;
- portada y metadatos;
- profundidad máxima de dos niveles;
- destinos de enlaces y caracteres Unicode.

Usar EPUBCheck cuando esté disponible. Si no lo está, efectuar controles estructurales equivalentes y registrar esa limitación; abrir el archivo en una aplicación no reemplaza la validación.

## PDF

Generar `Pensar-en-JavaScript.pdf` en A4, apto para lectura digital e impresión, con:

- portada y página de título;
- índice navegable;
- texto seleccionable;
- numeración de páginas;
- encabezados y pies discretos;
- saltos apropiados entre partes y capítulos;
- marcadores con la misma jerarquía de dos niveles que el EPUB;
- bloques de código monoespaciados, con buen contraste, indentación conservada y ajuste dentro de los márgenes.

Evitar títulos huérfanos, páginas casi vacías, tablas partidas de forma ilegible, figuras o código desbordados y cortes absurdos dentro de un bloque.

Validar, como mínimo:

- tamaño A4 y número real de páginas;
- presencia y jerarquía de marcadores;
- texto extraíble y seleccionable;
- enlaces y destinos internos;
- renderizado visual de portada, índice, una apertura de parte, capítulos con tablas y capítulos con código;
- ausencia de páginas en blanco inesperadas, recortes y desbordamientos.

La inspección visual debe realizarse sobre páginas renderizadas, no solo sobre el HTML intermedio.

## Correspondencia entre formatos

Comparar `00-indice.md`, `libro-completo.md`, EPUB y PDF. Deben coincidir en:

- bloques y capítulos incluidos;
- orden;
- títulos;
- profundidad de navegación y marcadores;
- contenido sustantivo.

Las diferencias propias del formato —paginación, estilos o separación de archivos XHTML— no deben alterar el contenido.

## Informe editorial

Actualizar `00-informe-editorial.md` con fecha de generación, herramientas y versiones utilizadas, lista ordenada de fuentes, archivos producidos y resultados concretos de cada validación. Registrar métricas actuales, entre ellas:

- cantidad de fuentes y capítulos;
- entradas de navegación del EPUB;
- páginas y marcadores del PDF;
- enlaces comprobados y errores encontrados.

Las cifras de ediciones anteriores son antecedentes, nunca criterios de aceptación.

## Paquetes

Crear primero un área temporal de empaquetado para evitar incluir archivos accidentales.

`Pensar-en-JavaScript-fuentes.zip` debe contener las fuentes Markdown, portada, documento maestro, mapa de fuentes, informe editorial y los recursos o scripts de publicación necesarios para reproducir la edición.

`Entrega-Pensar-en-JavaScript.zip` debe contener, como mínimo:

- `Pensar-en-JavaScript.epub`;
- `Pensar-en-JavaScript.pdf`;
- `Pensar-en-JavaScript-fuentes.zip`;
- `mapa-de-fuentes.md`;
- `00-informe-editorial.md`.

Verificar el listado e integridad de ambos ZIP antes de informar la finalización. No alterar los capítulos fuente durante el empaquetado.
