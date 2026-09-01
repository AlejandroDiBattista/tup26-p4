---
name: crear-fotos
description: Procesa las fotos de alumnos como retratos profesionales para carnet, preservando identidad y vestimenta original, con fondo neutro y protección contra resultados duplicados. Usar al crear o actualizar los retratos de la carpeta fotos del proyecto.
---

# Crear fotos

Genera únicamente los retratos pendientes mediante el script incluido. El flujo predeterminado usa `./fotos` como origen y `./output/imagegen` como destino.

## Flujo

1. Desde la raíz del proyecto, ejecutar primero el modo de planificación:

   ```bash
   python .codex/skills/crear-fotos/scripts/procesar_fotos.py
   ```

2. Si la solicitud actual es únicamente revisar, auditar o listar pendientes, informar el resultado de la planificación y detenerse sin generar imágenes.

3. Si la solicitud es crear, procesar o actualizar los retratos, considerar esa solicitud autorización para procesar exclusivamente las fotos pendientes detectadas en `./fotos`. Si hay pendientes, ejecutar inmediatamente el procesamiento, sin pedir una confirmación conversacional adicional:

   ```bash
   python .codex/skills/crear-fotos/scripts/procesar_fotos.py --execute
   ```

   Si no hay pendientes, informar el estado y finalizar. No ejecutar `--execute` sin necesidad. Las autorizaciones o permisos técnicos que exija la plataforma deben solicitarse mediante la herramienta correspondiente; no convertirlos en una segunda consulta conversacional sobre si se desea continuar.

4. Revisar visualmente cada archivo recién creado. Comprobar identidad, dirección de la mirada, expresión distendida sin rigidez y con una sonrisa leve o apenas insinuada, encuadre, anteojos, cabello, vello facial y fidelidad de la vestimenta original: tipo de prenda, colores, cuello, estampados, logotipos y accesorios visibles.

5. Informar los archivos creados y los omitidos. Si la fuente oculta rasgos —por ejemplo, ojos cerrados, cabello cubierto o rostro demasiado pequeño— señalar que esos detalles no pueden preservarse perfectamente.

## Invariantes

- Nunca volver a generar, sobrescribir ni reemplazar un retrato existente.
- Nunca usar `--force` ni invocar el generador por fuera del script para este lote.
- La ejecución automática se limita a los pendientes de `./fotos` detectados en la planificación de la misma tarea. No amplía el permiso a otras carpetas, reprocesamientos ni reemplazos.
- El script omite un destino existente y también una foto cuyo contenido ya figure en `.crear-fotos-manifest.json`, aunque haya sido renombrada.
- Para rehacer una imagen existente se necesita una solicitud explícita del usuario y una decisión separada sobre cómo conservar el resultado anterior.
- Mantener intactas las fotos originales.
- Preservar la ropa y los accesorios visibles de la foto original. No sustituirlos, profesionalizarlos, recolorearlos ni simplificarlos. Si el nuevo encuadre necesita completar una parte recortada, extender la misma prenda respetando su material, color, costuras y diseño.

El retrato se guarda como `<nombre-original>-carnet.png`, en formato vertical 768×1024 y calidad `low`, con fondo gris suave, luz frontal equilibrada, cabeza y hombros centrados, mirada al frente y expresión distendida, natural y cercana, con una sonrisa leve o apenas insinuada. Evitar tanto la rigidez de una foto de documento como una sonrisa amplia o forzada. La identidad, los rasgos reales y la vestimenta original tienen prioridad sobre el embellecimiento.

El prompt estable de transformación está en [references/carnet-prompt.txt](references/carnet-prompt.txt) y el script lo aplica automáticamente.
