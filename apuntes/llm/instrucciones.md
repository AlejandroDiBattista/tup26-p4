# Demostraciones: el modelo de lenguaje como función

Los 40 programas corresponden a las cuatro familias del [apunte 33](../33-modelo-como-funcion.md).
Cada archivo importa la biblioteca `demo/llm.js`, contiene la instrucción del apunte y datos ficticios de ejemplo, hace una llamada al modelo e imprime un título, la entrada y el resultado.

## Instalar y ejecutar

Se necesita Node.js 22 o posterior y pnpm.

Desde la raíz del repositorio:

```bash
cd apuntes/llm
pnpm install
pnpm demo T1
```

También se puede ejecutar directamente con Node:

```bash
node demo/T1.js
node demo/R3.js
node demo/G1.js
node demo/J1.js
```

O desde la raíz del repositorio, sin cambiar de carpeta:

```bash
node apuntes/llm/demo/T1.js
```

Para listar las familias y recordar el uso:

```bash
pnpm demo
```

## Configuración

La biblioteca carga, en este orden, `demo/.env`, `apuntes/llm/.env` y el `.env` de la raíz del repositorio. Las variables ya definidas en la terminal tienen prioridad y no se sobrescriben. Se reutiliza la `OPENAI_API_KEY` existente; no se copia ni se incluye ninguna clave en los programas.

Si querés una configuración propia para estas demos:

```bash
cp .env.example .env
```

Las variables son las del apunte:

- `LLM_URL`: dirección base del proveedor. Por defecto, `https://api.openai.com/v1`.
- `LLM_KEY`: clave del proveedor. Si no está definida, usa `OPENAI_API_KEY`.
- `LLM_MODEL`: modelo. Si no está definido, usa `OPENAI_MODEL` o, en su ausencia, `gpt-6-luna`.

Los archivos `.env` están excluidos de Git. Para otro proveedor, configurá las tres variables `LLM_*` y verificá que soporte Chat Completions y, para los casos que devuelven JSON, `response_format: { type: 'json_object' }`.

Cada ejecución hace una llamada real al proveedor, con su costo y tiempo de respuesta. Los ejemplos se ejecutan de a uno y no envían mensajes ni modifican el CRM.

## Cómo leer cada programa

1. Importa `pedir` desde `./llm.js`. Esa biblioteca importa el SDK `openai` y expone la misma función que presenta el apunte.
2. Imprime el código y el título de la demostración.
3. Declara `instruccion` y `datos` en el propio archivo, para que puedan modificarse durante la clase.
4. Muestra los datos de entrada y llama a `pedir(instruccion, datos)`.
5. Imprime el resultado. Si la salida es JSON, pide el modo JSON, aplica `JSON.parse` y la muestra con sangría.

Los prompts conservan el texto del apunte. Las respuestas pueden variar entre ejecuciones. Un JSON válido no garantiza que estén todos los campos esperados; estas demos muestran la respuesta en consola y no la guardan en una base de datos.

## Programas

| Archivo | Familia | Demostración | Resultado |
| --- | --- | --- | --- |
| [T1.js](demo/T1.js) | Transformar | Traducir un correo | Texto |
| [T2.js](demo/T2.js) | Transformar | Traducir los textos de la interfaz | JSON |
| [T3.js](demo/T3.js) | Transformar | Corregir una nota | Texto |
| [T4.js](demo/T4.js) | Transformar | Pasar una nota interna a un correo formal | Texto |
| [T5.js](demo/T5.js) | Transformar | Pasar un texto técnico a lenguaje llano | Texto |
| [T6.js](demo/T6.js) | Transformar | Normalizar teléfonos | Texto |
| [T7.js](demo/T7.js) | Transformar | Normalizar direcciones | JSON |
| [T8.js](demo/T8.js) | Transformar | Acortar para WhatsApp | Texto |
| [T9.js](demo/T9.js) | Transformar | Ocultar datos personales | Texto |
| [T10.js](demo/T10.js) | Transformar | Convertir una búsqueda en un filtro | JSON |
| [R1.js](demo/R1.js) | Reducir | Resumir un correo largo | Texto |
| [R2.js](demo/R2.js) | Reducir | Resumir el historial antes de una llamada | Texto |
| [R3.js](demo/R3.js) | Reducir | Extraer un contacto de un correo | JSON |
| [R4.js](demo/R4.js) | Reducir | Extraer los ítems de un pedido | JSON |
| [R5.js](demo/R5.js) | Reducir | Clasificar un correo | Texto |
| [R6.js](demo/R6.js) | Reducir | Detectar urgencia | Texto |
| [R7.js](demo/R7.js) | Reducir | Extraer tareas de una minuta | JSON |
| [R8.js](demo/R8.js) | Reducir | Titular una nota | Texto |
| [R9.js](demo/R9.js) | Reducir | Etiquetar | JSON |
| [R10.js](demo/R10.js) | Reducir | Extraer fechas y montos de un contrato | JSON |
| [G1.js](demo/G1.js) | Generar | Aviso de deuda | Texto |
| [G2.js](demo/G2.js) | Generar | Personalizar una plantilla | Texto |
| [G3.js](demo/G3.js) | Generar | Responder una consulta frecuente | Texto |
| [G4.js](demo/G4.js) | Generar | Descripción de un producto | Texto |
| [G5.js](demo/G5.js) | Generar | Mensaje de seguimiento | Texto |
| [G6.js](demo/G6.js) | Generar | Variantes de un asunto | JSON |
| [G7.js](demo/G7.js) | Generar | Clientes de prueba | JSON |
| [G8.js](demo/G8.js) | Generar | Reclamos de prueba | JSON |
| [G9.js](demo/G9.js) | Generar | Preguntas frecuentes a partir de un manual | Texto |
| [G10.js](demo/G10.js) | Generar | Texto de ayuda de una pantalla | JSON |
| [J1.js](demo/J1.js) | Juzgar | Detectar duplicados | JSON |
| [J2.js](demo/J2.js) | Juzgar | Comparar dos presupuestos | Texto |
| [J3.js](demo/J3.js) | Juzgar | Verificar una respuesta contra la política | JSON |
| [J4.js](demo/J4.js) | Juzgar | Verificar que un resumen sea fiel | JSON |
| [J5.js](demo/J5.js) | Juzgar | Detectar datos faltantes en un pedido | JSON |
| [J6.js](demo/J6.js) | Juzgar | Calificar un posible cliente | JSON |
| [J7.js](demo/J7.js) | Juzgar | Detectar contradicciones | Texto |
| [J8.js](demo/J8.js) | Juzgar | Decidir si interviene una persona | JSON |
| [J9.js](demo/J9.js) | Juzgar | Evaluar una respuesta de atención | JSON |
| [J10.js](demo/J10.js) | Juzgar | Verificar si un documento responde una pregunta | JSON |

## Ejercicios de la clase

- Ejecutá `R3.js` varias veces con el mismo correo y compará las respuestas.
- Quitá el teléfono del correo de `R3.js`: el resultado debería poner `null`, sin inventarlo.
- Cambiá el pedido de `J5.js` y agregá una fecha de entrega; comprobá cómo cambia la lista de datos faltantes.
- Cambiá la política de `G3.js` por una que no indique el plazo y observá la respuesta prevista por el prompt.

## Si falla una ejecución

- Si falta una clave, definí `LLM_KEY` u `OPENAI_API_KEY` en el entorno o en alguno de los `.env` indicados.
- `401`: la clave no es válida. `429`: se alcanzó un límite de pedidos o de crédito.
- `404` con `model_not_found`: elegí en `LLM_MODEL` un modelo habilitado para tu cuenta.
- Si el proveedor rechaza `response_format`, elegí uno que soporte modo JSON o adaptá esa opción según su documentación.
- Si `JSON.parse` falla o una respuesta trae datos equivocados, revisá la salida y el prompt. Es parte de los límites que se trabajan en el apunte.
