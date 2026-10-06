# Programación IV

Sistema docente para administrar los alumnos de Programación IV en las
comisiones C1 y C3.

## Funciones

- padrón único de alumnos con una comisión por alumno;
- horarios y aulas por comisión;
- calendario de clases generado desde el horario semanal;
- asistencia presente, ausente o justificada;
- trabajos prácticos compartidos por ambas comisiones;
- estado pendiente, error, falla o presentado por alumno;
- nota opcional de 1 a 10 para los trabajos usados como parciales.
- normalización e incorporación automática de entregas desde Trabajos prácticos → Acciones → Bajar TP.
- comprobación de TP3 para los alumnos filtrados: al menos 100 líneas agregadas
  en `tp3/agenda.html` respecto de `enunciados/tp3/agenda.html`.

## Desarrollo local

```bash
pnpm install
pnpm migrate:production
pnpm dev
```

Los datos locales se guardan en `data/app.db`. La aplicación requiere una base
persistente y autenticación configurada antes de publicarse.

El conector OpenAI usa `gpt-6.1-sol` como modelo predeterminado. Se configura en
**Ajustes → Overview → Default model** y reutiliza la credencial de OpenAI
existente. El catálogo de esta app incluye el modelo tanto en el selector como
en el motor que ejecuta el agente, mediante `server/agent/openai-model.ts`.

Seleccionando TP3, **Acciones → Comprobar TP3** cuenta las líneas agregadas por
diff contra el archivo original del enunciado. Marca presentado al alcanzar
100 líneas agregadas y pendiente si falta el archivo o no alcanza ese mínimo.
El detalle muestra la cantidad por alumno. No ejecuta las entregas y conserva
el estado anterior ante fallos técnicos. También reconoce las entregas subidas
en `tp3/tp3/agenda.html`, aunque la plantilla exterior siga sin cambios, y
muestra la ruta que comprobó. Lee los archivos directamente en el servidor,
sin iniciar otro runtime por alumno. Los fallos se indican junto al total de
estados actualizados.

“Bajar TP” usa el repositorio de `origin` del checkout que contiene el
sistema. Revisa todos los PR abiertos sin aplicar los filtros de TP o comisión.
Omite borradores. Solo procesa cuando todos los archivos (incluidas las
rutas anteriores de archivos renombrados) están bajo una misma carpeta
`practicos/Legajo - Nombre/tpN`. Toma TP y legajo de esa ruta y apellido y nombre
del padrón del docente, conservando sus acentos. El formato es
`TP 01 - Legajo - Apellido Nombre`; los casos ambiguos se omiten y se muestran
en el detalle. Comprueba que el autor del PR coincida con la cuenta GitHub del
alumno en el padrón; si no está registrada o no coincide, omite la entrega.
Después de normalizar el título, hace merge automático usando el SHA del commit
revisado y un método habilitado en el repositorio. También incorpora entregas
que ya tienen el título correcto. Verifica título y merge leyendo el PR de nuevo.
Los conflictos, cambios concurrentes o reglas de protección que impidan el
merge se muestran en el detalle, sin impedir revisar los demás PR.

Al finalizar descarga la rama por defecto en la copia local que leen los controles
de presentado, incluso si no hay PR abiertos. Requiere estar en esa rama y admite
solo fast-forward: conserva cambios locales y reporta conflictos o divergencias
sin usar reset, stash ni merges forzados. La pantalla muestra si la descarga se
completó o si el control seguirá leyendo una copia desactualizada.

Configurá `GITHUB_TOKEN` en los secretos del usuario con permiso **Pull requests:
lectura y escritura** y **Contents: lectura y escritura** para el repositorio.
En desarrollo, la sesión automática
local del docente también puede usar una sesión existente de `gh auth login`
desde loopback. Las sesiones de otros usuarios y producción usan sus propios
secretos. Se necesita el checkout Git con `origin` disponible en el servidor,
igual que los directorios usados por las acciones de publicación.

Para revisar sin renombrar, hacer merge ni descargar, el agente puede ejecutar `bajar-tp` con
`dryRun=true`.
