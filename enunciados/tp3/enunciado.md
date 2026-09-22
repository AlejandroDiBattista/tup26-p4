# TP3 — Agenda reactiva

## Objetivo

Desarrollar una aplicación web de agenda para administrar alumnos. Debe permitir consultar, buscar, agregar, editar, marcar como favorito y eliminar registros. Los datos deben persistirse utilizando `localStorage`, de modo que los cambios se conserven al recargar la página.

La aplicación debe implementarse en un único archivo autocontenido llamado `agenda.html`, con HTML, CSS y JavaScript incluidos. Como framework de interfaz reactiva se debe utilizar [ArrowJS](https://arrow-js.com/).

## Datos y persistencia

- Los datos iniciales se deben cargar desde [`./alumnos.json`](./alumnos.json).
- Luego de la carga inicial, los datos deben persistirse en `localStorage`.
- Al recargar la página, se deben recuperar los datos guardados.
- Si no existe información en `localStorage`, se deben usar los datos de `alumnos.json` y crear el almacenamiento local.
- Las altas, modificaciones, eliminaciones y cambios de favorito deben quedar persistidos.

Cada alumno contiene, como mínimo: `id`, `apellido`, `nombre`, `legajo`, `comision`, `telefono`, `github` y `favorito`.

## Funcionalidad solicitada

### Mostrar la agenda

Mostrar los alumnos en tarjetas de presentación con apellido, nombre, teléfono, usuario de GitHub, comisión, legajo y un control para marcar o desmarcar favoritos.

Los favoritos deben aparecer primero. Dentro de cada grupo, ordenar alfabéticamente por apellido y luego por nombre, sin distinguir mayúsculas ni acentos. La disposición debe adaptarse a distintos anchos de pantalla.

### Buscar alumnos

Incorporar un campo de búsqueda en vivo. La lista debe actualizarse mientras se escribe y mostrar los alumnos que coincidan con el texto buscado. Si no hay coincidencias, informar que no hay alumnos para mostrar.

### Marcar favoritos

El control de favorito debe alternar el estado del alumno sin perder los demás datos. Cada cambio debe actualizar el orden de la lista y persistirse en `localStorage`.
### Agregar un alumno

Incluir un botón **Agregar** que abra un diálogo con un formulario para ingresar apellido, nombre, legajo, comisión, teléfono y usuario de GitHub. Al guardar, validar los datos, crear un identificador, incorporar el alumno, cerrar el diálogo y persistir los cambios.

### Editar y eliminar un alumno

Al seleccionar una tarjeta, abrir un diálogo de edición con los datos actuales. El formulario debe permitir modificar los datos, guardar, cancelar o eliminar el alumno.

La opción **Eliminar** solo debe estar visible durante la edición de un alumno existente; no debe aparecer al agregar uno nuevo.

La eliminación debe quitar el alumno de la lista y de `localStorage`. Cancelar no debe modificar los datos.


## Requisitos técnicos

- Usar Arrow.js para el estado reactivo, las plantillas y la actualización de la interfaz.
- Entregar un único archivo `agenda.html` autocontenido.
- No depender de archivos JavaScript o CSS propios separados.
- Se puede cargar `alumnos.json` mediante `import` cuando la aplicación se ejecute desde un servidor HTTP local.
- Mantener separados el estado, las funciones de actualización y la representación de la interfaz.
- La interfaz debe ser usable con teclado: las tarjetas deben poder enfocarse, `Enter` debe abrir la edición y la barra espaciadora debe alternar el favorito.
- Usar marcado semántico (`main`, `header`, `section`, `article`, `address`, `footer`, `dialog` y `form`).
- Organizar el CSS por componente, utilizando selectores estructurales y reglas anidadas de CSS Nesting.

### Pantallas de referencia

Las siguientes pantallas muestran el diseño visual esperado para la agenda y el formulario de edición. La distribución, jerarquía, proporciones generales, tarjetas, grilla, buscador y diálogo deben respetarse; los colores y tipografías pueden aproximarse si el resultado conserva la misma composición.


| Vista general                                  | Edición de un alumno                           |
| :--------------------------------------------: | :--------------------------------------------: | 
| ![Vista general de la agenda](mostrar.png)     | ![Diálogo de edición de un alumno](editar.png) |


## Entrega

Entregar `agenda.html` funcionando y, si fuera necesario, una breve instrucción para servir la carpeta mediante HTTP y cargar `alumnos.json`.

## Fecha de entrega

> [!IMPORTANT]
> La entrega debe realizarse hasta el **lunes 28 de septiembre de 2026, inclusive**.
