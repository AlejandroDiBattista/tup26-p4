# Programación IV

Sistema docente para administrar los alumnos de Programación IV en las
comisiones C1 y C3.

## Funciones

- padrón único de alumnos con una comisión por alumno;
- horarios y aulas por comisión;
- calendario de clases generado desde el horario semanal;
- asistencia presente, ausente o justificada;
- trabajos prácticos compartidos por ambas comisiones;
- estado pendiente, presentado, aprobado o desaprobado por alumno;
- nota opcional de 1 a 10 para los trabajos usados como parciales.

## Desarrollo local

```bash
pnpm install
pnpm migrate:production
pnpm dev
```

Los datos locales se guardan en `data/app.db`. La aplicación requiere una base
persistente y autenticación configurada antes de publicarse.
