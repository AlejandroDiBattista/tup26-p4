---
name: crear-fotos
description: Genera y distribuye retratos profesionales de alumnos, preservando identidad y vestimenta, evitando duplicados y publicando cada JPG en la carpeta de su legajo. Usar al crear, actualizar u organizar las fotos de alumnos del proyecto.
---

# Crear fotos

Genera únicamente los retratos pendientes mediante el script incluido. Usa `./fotos` como origen, `./output/imagegen` como área transitoria y `./practicos/<legajo> - <nombre>/<legajo>.jpg` como destino final.

## Flujo

1. Desde la raíz del proyecto, ejecutar primero el modo de planificación. Este informa tanto generaciones pendientes como retratos ya generados que deben organizarse:

   ```bash
   python .codex/skills/crear-fotos/scripts/procesar_fotos.py
   ```

2. Si la solicitud actual es únicamente revisar, auditar o listar pendientes, informar el resultado de la planificación y detenerse sin generar ni mover imágenes.

3. Si la solicitud es crear, procesar o actualizar retratos, considerar esa solicitud autorización para ejecutar el plan sin pedir otra confirmación. El mismo comando genera solo las fotos pendientes y, al terminar, convierte los retratos con legajo a JPG y los mueve a la carpeta del alumno:

   ```bash
   python .codex/skills/crear-fotos/scripts/procesar_fotos.py --execute
   ```

   Si no hay generaciones pendientes pero sí retratos por organizar, el script evita la API y realiza únicamente la organización. Las autorizaciones técnicas que exija la plataforma deben solicitarse mediante la herramienta correspondiente; no convertirlas en una segunda consulta conversacional.

   Cuando la solicitud se limite a ordenar archivos ya presentes en `output/imagegen`, planificar y ejecutar sin recorrer ni generar las fuentes:

   ```bash
   python .codex/skills/crear-fotos/scripts/procesar_fotos.py --organize-only
   python .codex/skills/crear-fotos/scripts/procesar_fotos.py --organize-only --execute
   ```

4. Revisar visualmente cada JPG recién creado en la carpeta del alumno. Comprobar identidad, dirección de la mirada, expresión distendida sin rigidez y con una sonrisa leve o apenas insinuada, encuadre, anteojos, cabello, vello facial y fidelidad de la vestimenta original.

5. Informar cuántos retratos fueron generados, organizados, omitidos o quedaron sin destino. Si no existe exactamente una carpeta cuyo nombre comience con el legajo, conservar el retrato en `output/imagegen` e informar el caso sin inventar una ubicación.

## Invariantes

- Nunca volver a generar, sobrescribir ni reemplazar un retrato existente, incluido el JPG final de la carpeta del alumno.
- Nunca usar `--force` ni invocar el generador por fuera del script para este lote.
- La ejecución automática se limita a los pendientes de `./fotos` detectados en la planificación de la misma tarea. No amplía el permiso a otras carpetas, reprocesamientos ni reemplazos.
- El script omite un destino existente y también una foto cuyo contenido ya figure en `.crear-fotos-manifest.json`, aunque haya sido renombrada. Al mover el resultado final, actualiza el manifiesto a la nueva ruta.
- Para rehacer una imagen existente se necesita una solicitud explícita del usuario y una decisión separada sobre cómo conservar el resultado anterior.
- Mantener intactas las fotos originales.
- Tratar `output/imagegen` como área transitoria: convertir y eliminar el PNG transitorio solo después de crear correctamente el JPG final. Ignorar recursos que no sigan el nombre `<legajo>-carnet.<extensión>`.
- Evitar trabajo innecesario: si no hay fotos pendientes no invocar la API; si el JPG final existe no convertir, mover ni sobrescribir; si falta la carpeta del legajo conservar el archivo transitorio.
- Preservar la ropa y los accesorios visibles de la foto original. No sustituirlos, profesionalizarlos, recolorearlos ni simplificarlos. Si el nuevo encuadre necesita completar una parte recortada, extender la misma prenda respetando su material, color, costuras y diseño.

La API crea transitoriamente `<nombre-original>-carnet.png` en formato vertical 768×1024 y calidad `low`. El script lo publica como `<legajo>.jpg` dentro de la carpeta del alumno, conservando las dimensiones y usando una conversión JPEG de alta calidad. El retrato debe tener fondo gris suave, luz frontal equilibrada, cabeza y hombros centrados, mirada al frente y expresión distendida, natural y cercana, con una sonrisa leve o apenas insinuada. La identidad, los rasgos reales y la vestimenta original tienen prioridad sobre el embellecimiento.

El prompt estable de transformación está en [references/carnet-prompt.txt](references/carnet-prompt.txt) y el script lo aplica automáticamente.
