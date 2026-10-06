Quiero que actues como generador de preguntas de examen multiple choice a partir de apuntes en Markdown.

Tarea:
- Lee los siguientes archivos fuente: {{archivos_fuente}}
- Genera un unico archivo Markdown en la carpeta /examenes. Numeralo en secuencia y crea un nombre descriptivo, por ejemplo `05-examen-terminal-git.md`.
- Las preguntas deben salir exclusivamente del contenido de esos apuntes. No inventes temas externos ni agregues conocimiento que no aparezca en el material.
La preguntas deben ser autocontenidas, es decir, deben incluir toda la información necesaria para responderlas sin necesidad de consultar el material. Sin embargo, el contenido de las preguntas debe estar basado en los apuntes.

Objetivo pedagogico:
- Crear preguntas de examen claras, cortas y utiles para alumnos.
- Mezclar preguntas conceptuales con preguntas de lectura de codigo cuando tenga sentido.
- Mantener dificultad media, con algunas preguntas mas directas y otras que exijan interpretar ejemplos.

Formato obligatorio del archivo de salida:
- Agrupa las preguntas por archivo fuente.
- Para todo el archivo usa un encabezado `#` con el titulo general del examen, por ejemplo `Examen de Terminal, Git y JS`.
- Para cada grupo usa un encabezado `##` con el titulo del tema, tomado del `#` principal del archivo fuente.
- Para cada pregunta usa un encabezado `###` breve que nombre el subtema.
- Debajo del `###` escribe la pregunta numerada en forma corrida: `1)`, `2)`, `3)`, etc.
- Si una pregunta necesita codigo, usa bloques fenced, por ejemplo:
  ```js
  let x = 10;
  ```
- Las opciones deben escribirse exactamente asi:
  - [ ] opcion incorrecta
  - [x] opcion correcta
  - [ ] opcion incorrecta

- Debe haber exactamente 3 opciones por pregunta.
- Debe haber exactamente 1 respuesta correcta por pregunta.
- Entre preguntas usa un separador `---`.

Reglas obligatorias:
- Mezcla la posicion de la respuesta correcta. No la pongas siempre en la primera, segunda o tercera opcion.
- Evita patrones repetitivos en el orden de respuestas correctas.
- Las opciones incorrectas deben ser plausibles, no absurdas.
- No repitas la misma pregunta con redaccion distinta.
- No repitas literalmente largos fragmentos del apunte.
- Usa un espanol claro y simple.
- Respeta tildes y signos de pregunta cuando correspondan.
- Si el material incluye Bash, Git o C#, mantene el formateo adecuado de comandos, tipos y bloques de codigo.

Cantidad:
- Genera aproximadamente 10 preguntas por temas.
- Reparti las preguntas de forma razonable entre los archivos fuente.

Validaciones antes de terminar:
- Verifica que todas las preguntas esten numeradas de corrido.
- Verifica que cada pregunta tenga 3 opciones.
- Verifica que cada pregunta tenga 1 sola opcion marcada con `[x]`.
- Verifica que los grupos `##` correspondan a los titulos reales de los apuntes.
- Verifica que las respuestas correctas queden distribuidas en posiciones variadas.
- Verifica que la pregunta no haga referencia a la fuente de la pregunta, sino que sea autocontenida.
