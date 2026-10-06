---
name: generar-libro
description: Genera, regenera y valida el libro "Programacion Web" en EPUB 3 y PDF A4 a partir de `apuntes/`. Usar para publicar esta edición, actualizar su documento maestro, informe editorial o paquetes de entrega.
---

# Generar libro

Publicar una única edición coherente de **Programacion Web** desde los Markdown de `apuntes/`, sin alterar el contenido entre el EPUB y el PDF.

Antes de trabajar, leer completa la [especificación editorial y técnica](references/especificacion.md). Luego inspeccionar `00-indice.md`, los archivos enlazados, la portada y cualquier herramienta de publicación existente en el proyecto.

## Flujo esencial

1. Usar `apuntes/00-indice.md` como fuente de verdad para el orden y la jerarquía. Resolver sus enlaces desde `apuntes/` y comprobar que cada destino exista. No ordenar capítulos mediante un listado alfabético del directorio.
2. Aplicar la normalización editorial autorizada antes de convertir: eliminar de las fuentes toda sección de nivel 2 titulada exactamente `Práctica guiada` o `Práctica de cierre`, desde ese encabezado hasta el siguiente encabezado de nivel 2 o el final del archivo. Verificar después que no quede ninguna de esas secciones. No incluir archivos ajenos al índice ni archivos cuyo nombre contenga `(no)`; informar cualquier otra discrepancia.
3. Construir o actualizar `libro-completo.md` y `mapa-de-fuentes.md` de manera reproducible. El documento maestro debe conservar el contenido de los capítulos, no una versión resumida.
4. Ejecutar `node apuntes/publicar.js` para generar el EPUB 3 y el PDF A4 desde el mismo documento maestro y la misma jerarquía. Este es el único publicador del proyecto y contiene tanto la conversión como la validación y el empaquetado.
5. Actualizar `00-informe-editorial.md` con verificaciones y métricas observadas en la ejecución actual.
6. Regenerar los paquetes de fuentes y entrega solo después de que EPUB y PDF hayan sido validados.

## Límites

- Fuera de la eliminación configurada de las secciones de práctica, el proceso de compilación no debe renombrar, renumerar, borrar ni reescribir los capítulos fuente. Cualquier otra corrección editorial requiere que la solicitud actual la incluya y debe realizarse antes de convertir.
- No crear publicadores alternativos ni volver a separar la generación entre varios archivos. `apuntes/publicar.js` debe leer directamente `apuntes/`, respetar `00-indice.md` y no renombrar fuentes.
- No inventar ni conservar cifras históricas de páginas, marcadores o entradas de navegación. Recalcularlas en cada edición.
- No declarar una validación como exitosa sin evidencia verificable. Si falta una herramienta, aplicar controles alternativos y dejar constancia de la limitación.
- No abrir automáticamente el EPUB o el PDF en Books ni en otra aplicación al terminar.
- No modificar ni eliminar los archivos fuente después de completar la conversión.

Al finalizar, informar las rutas de los entregables, las validaciones realizadas, las métricas actuales y cualquier limitación pendiente.
