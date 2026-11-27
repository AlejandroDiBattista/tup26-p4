---
name: resolver-trabajo-practico
description: Resolver y entregar trabajos prácticos de Programación IV del repositorio tup26-p4 para un alumno identificado por nombre o legajo. Usar cuando el usuario pida hacer, responder, implementar o completar un TP de un estudiante.
---

# Resolver un trabajo práctico de Programación IV

Completar el trabajo solicitado siguiendo el enunciado vigente y las reglas de entrega del curso. La persona usuaria debe indicar el número de TP y un alumno; no inferir identidad a partir de nombres parecidos.

## 1. Identificar el trabajo y al alumno

1. Confirmar que se está en la raíz del repositorio `tup26-p4` y leer las instrucciones aplicables: `AGENTS.md` de la raíz, `como-hacer/como-entregar-practico.md`, cualquier guía de entorno necesaria, `enunciados/tpN/` y sus instrucciones locales.
2. Buscar al alumno en `alumnos.md` y `sistema/alumnos.md` si corresponde. Usar el legajo como identificador estable. Si no hay coincidencia única, detener los cambios y pedir nombre completo o legajo. No exponer teléfonos ni otros datos personales.
3. Localizar `practicos/<legajo> - <nombre>/tpN/`. Si falta la carpeta, averiguar si el curso prevé generarla/copiarla desde `enunciados/tpN`; conservar archivos existentes y no sobrescribir trabajo del alumno.
4. Leer el enunciado completo, incluidos imágenes, documentos enlazados, datos de ejemplo, archivos iniciales y las instrucciones `AGENTS.md` de cada carpeta afectada. Las reglas específicas del TP complementan las generales.
5. Separar claramente requisitos obligatorios, entregables y criterios de evaluación. No agregar funcionalidades ajenas al enunciado.

## 2. Proteger el repositorio y el trabajo del alumno

1. Revisar `git status --short --branch`, rama, remotos, historial reciente y diferencias antes de editar.
2. Mantener intactos los cambios preexistentes del usuario. No usar `reset`, `clean`, `stash`, checkout destructivo ni sobrescribir archivos existentes.
3. Respetar el límite de archivos definido por el docente y las instrucciones del TP. No modificar el enunciado fuente ni carpetas de otros alumnos.
4. Si la guía exige rama, commits o Pull Request, cumplir esos requisitos dentro del alcance autorizado. No publicar, hacer push ni crear PR si falta autorización clara para esa acción externa; en ese caso, dejar el resultado local listo y explicar el paso pendiente.

## 3. Implementar y explicar

1. Inspeccionar el proyecto entregado antes de elegir arquitectura o dependencias. Reutilizar su estructura y herramientas; para proyectos JavaScript nuevos, respetar las reglas de gestores del repositorio.
2. Trazar cada requisito hasta archivos y comportamientos concretos; implementar el trabajo completo dentro de la carpeta del alumno.
3. Priorizar código legible para estudiantes y decisiones que puedan explicar en una defensa. Comentar contratos y decisiones no obvias, sin llenar el código de comentarios redundantes.
4. No resolver la consigna mediante resultados simulados, datos inventados o pantallas que no estén conectadas al comportamiento requerido.
5. Si la entrega requiere documentación, incluir cómo ejecutar, probar y explicar las partes centrales, con los supuestos y límites reales.

## 4. Verificar la entrega

1. Elegir verificaciones que correspondan al lenguaje y al enunciado: pruebas existentes, compilación, lint, ejecución y casos límite. No ejecutar acciones que puedan modificar datos reales del alumno sin protegerlos.
2. Comparar cada criterio del enunciado con evidencia observable. Corregir fallos encontrados y repetir las verificaciones pertinentes.
3. Revisar `git diff` y el staging para confirmar que solo incluyan archivos permitidos del TP del alumno. No incluir otros cambios locales.
4. Si se solicitan commits, hacerlos pequeños y descriptivos, sin reescribir historia preexistente. Si se solicita publicación, confirmar que rama y contenido sean los correctos antes de hacer push o abrir el PR.
5. Al terminar, informar archivos modificados, requisitos cubiertos, verificaciones realizadas y cualquier limitación o paso de entrega pendiente. No declarar completadas acciones externas que no se hayan confirmado.

## Reglas de decisión

- Si el alumno o el TP son ambiguos, pedir únicamente el dato que falta antes de editar.
- Si el repositorio no contiene la fuente necesaria, mostrar qué se buscó y pedir la fuente faltante; no sustituirla por conocimiento supuesto.
- Si el directorio del alumno ya contiene trabajo, ampliar ese trabajo en lugar de reemplazarlo.
- La autorización para implementar no autoriza por sí sola a enviar mensajes, publicar datos personales o realizar acciones externas no solicitadas.
