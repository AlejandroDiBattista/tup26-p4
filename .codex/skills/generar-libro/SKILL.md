---
name: generar-libro
description: Genera, regenera y valida el libro "Pensar en JavaScript" en EPUB 3 y PDF A4 a partir de `apuntes/libro-gpt/`. Usar para publicar esta edición, actualizar su documento maestro, informe editorial o paquetes de entrega; no usar para el publicador general de apuntes ChatGPT/Claude.
---

# Generar libro

Publicar una única edición coherente de **Pensar en JavaScript** desde los Markdown de `apuntes/libro-gpt/`, sin alterar el contenido entre el EPUB y el PDF.

Antes de trabajar, leer completa la [especificación editorial y técnica](references/especificacion.md). Luego inspeccionar `00-indice.md`, los archivos enlazados, la portada y cualquier herramienta de publicación existente en el proyecto.

## Flujo esencial

1. Usar `apuntes/libro-gpt/00-indice.md` como fuente de verdad para el orden y la jerarquía. Resolver sus enlaces y comprobar que cada destino exista. No ordenar capítulos mediante un listado alfabético del directorio.
2. Verificar la coherencia editorial y los enlaces antes de convertir. No incluir archivos ajenos al índice ni archivos cuyo nombre contenga `(no)`; informar toda discrepancia.
3. Construir o actualizar `libro-completo.md` y `mapa-de-fuentes.md` de manera reproducible. El documento maestro debe conservar el contenido de los capítulos, no una versión resumida.
4. Generar el EPUB 3 y el PDF A4 desde el mismo documento maestro y la misma jerarquía. Reutilizar herramientas confiables ya presentes; si hace falta implementar soporte, mantenerlo local y repetible.
5. Actualizar `00-informe-editorial.md` con verificaciones y métricas observadas en la ejecución actual.
6. Regenerar los paquetes de fuentes y entrega solo después de que EPUB y PDF hayan sido validados.

## Límites

- El proceso de compilación no debe renombrar, renumerar, borrar ni reescribir los capítulos fuente. Hacer correcciones editoriales únicamente cuando la solicitud actual las incluya, y siempre antes de convertir.
- No usar `apuntes/publicar.js` sin adaptarlo o envolverlo: su flujo normal recorre carpetas planas y renumera archivos, por lo que no satisface por sí solo el orden canónico ni los apéndices de esta edición.
- No inventar ni conservar cifras históricas de páginas, marcadores o entradas de navegación. Recalcularlas en cada edición.
- No declarar una validación como exitosa sin evidencia verificable. Si falta una herramienta, aplicar controles alternativos y dejar constancia de la limitación.
- No abrir automáticamente el EPUB o el PDF en Books ni en otra aplicación al terminar.
- No modificar ni eliminar los archivos fuente después de completar la conversión.

Al finalizar, informar las rutas de los entregables, las validaciones realizadas, las métricas actuales y cualquier limitación pendiente.
