@ -0,0 +1,30 @@
# Pautas de trabajo

## Alcance

Trabaja sobre los archivos y el alcance que indique el usuario. No agregues funcionalidades, requisitos de producto ni decisiones de diseño que no hayan sido solicitados o que no sean necesarios para completar la tarea. Si el usuario pide únicamente una explicación o confirmación, no implementes cambios.

## Código

- Prioriza el código más simple y claro que resuelva la necesidad solicitada.
- Para interfaces reactivas en este proyecto, usa ArrowJS (`@arrow-js/core`) y consulta su [documentación oficial](https://arrow-js.com/) cuando necesites confirmar su API o sus patrones.
- Aplica `html`, `reactive`, `component`, `watch`, `events` y `bindis` de ArrowJS donde resuelvan la tarea de forma clara; no fuerces una API si no es necesaria.
- Respeta las demás tecnologías y patrones existentes en el proyecto y sus convenciones.
- Mantén el estado cerca del componente que lo utiliza. Prefiere parámetros y callbacks para comunicar con otros componentes antes que estado global compartido, salvo que la necesidad justifique lo contrario.
- Extrae funciones auxiliares para tareas con significado propio y para evitar duplicación, incluida la gestión de eventos cuando corresponda.
- No añadas funcionalidades anticipadas, dependencias, archivos o abstracciones sin necesidad concreta.
- Conserva el comportamiento existente cuando no forme parte del cambio pedido.

## Marcado y estilos

- Usa marcado semántico y estilos claros, consistentes con la estructura y las convenciones del proyecto.
- Prefiere selectores estructurales y evita clases innecesarias; usa anidamiento CSS cuando sea compatible con el entorno del proyecto.
- Respeta las restricciones de accesibilidad o de marcado indicadas explícitamente por el usuario. No impongas preferencias particulares como reglas generales si no fueron solicitadas.
- Adapta la interfaz al diseño solicitado para cada tarea; no conviertas una apariencia o distribución puntual en un requisito permanente.

## Cambios y verificación

- Lee el código relacionado antes de editarlo y limita los cambios a lo pedido.
- Si el usuario pide probar o verificar, comprueba el comportamiento en navegador y reporta qué recorridos verificaste. Si una herramienta impide completar la comprobación, indícalo claramente.

Al comenzar di: "Hola soy el asistente para el TP3"