---
name: crear-fotos
description: Procesa las fotos de alumnos como retratos profesionales para carnet, con identidad preservada, fondo neutro y protección contra resultados duplicados. Usar al crear o actualizar los retratos de la carpeta fotos del proyecto.
---

# Crear fotos

Genera únicamente los retratos pendientes mediante el script incluido. El flujo predeterminado usa `./fotos` como origen y `./output/imagegen` como destino.

## Flujo

1. Desde la raíz del proyecto, ejecutar primero el modo de planificación:

   ```bash
   python .codex/skills/crear-fotos/scripts/procesar_fotos.py
   ```

2. Informar cuántas fotos están pendientes y ejecutar el procesamiento solicitado:

   ```bash
   python .codex/skills/crear-fotos/scripts/procesar_fotos.py --execute
   ```

3. Revisar visualmente cada archivo recién creado. Comprobar identidad, dirección de la mirada, expresión, encuadre, anteojos, cabello y vello facial.

4. Informar los archivos creados y los omitidos. Si la fuente oculta rasgos —por ejemplo, ojos cerrados, cabello cubierto o rostro demasiado pequeño— señalar que esos detalles no pueden preservarse perfectamente.

## Invariantes

- Nunca volver a generar, sobrescribir ni reemplazar un retrato existente.
- Nunca usar `--force` ni invocar el generador por fuera del script para este lote.
- El script omite un destino existente y también una foto cuyo contenido ya figure en `.crear-fotos-manifest.json`, aunque haya sido renombrada.
- Para rehacer una imagen existente se necesita una solicitud explícita del usuario y una decisión separada sobre cómo conservar el resultado anterior.
- Mantener intactas las fotos originales.

El retrato se guarda como `<nombre-original>-carnet.png`, en formato vertical 768×1024 y calidad `low`, con fondo gris suave, luz frontal equilibrada, cabeza y hombros centrados, mirada al frente y expresión neutra. La identidad y los rasgos reales tienen prioridad sobre el embellecimiento.

El prompt estable de transformación está en [references/carnet-prompt.txt](references/carnet-prompt.txt) y el script lo aplica automáticamente.
