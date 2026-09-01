# ¿Cómo entregar el trabajo práctico?

## Resumen

- Clonar el repositorio del curso: `github.com/AlejandroDiBattista/tup26-p4`.
- Actualizar el repositorio local desde la rama `main`.
- Crear una rama con el formato `tp-01/nombre-apellido`.
- Implementar la solución en el archivo `sortx.js` ubicado dentro de la carpeta del alumno.
- Probar el programa con Node.js antes de entregarlo.
- Realizar al menos 5 commits parciales con mensajes descriptivos.
- Publicar la rama en GitHub.
- Abrir un Pull Request hacia `main` con el formato `TP 01 - Legajo - Nombre Apellido`.
- Regresar a la rama `main` y actualizar nuevamente el repositorio local.

---

## 1. Clonar o actualizar el repositorio

Se debe trabajar sobre el repositorio actual de Programación IV:

```text
https://github.com/AlejandroDiBattista/tup26-p4
```

Si todavía no está clonado:

> [!TIP]
> GitHub Desktop:  
> **File > Clone repository > URL > Repository URL:** `AlejandroDiBattista/tup26-p4` **> Clone**

Si el repositorio ya está clonado, antes de comenzar hay que volver a `main` y descargar los últimos cambios:

> [!TIP]
> GitHub Desktop:  
> **Current Branch > main > Fetch origin > Pull origin**

---

## 2. Crear la rama del trabajo práctico

Se debe crear una rama nueva con el formato:

```text
tp-01/nombre-apellido
```

Ejemplo:

```text
tp-01/sofia-sanchez
```

> [!TIP]
> GitHub Desktop:  
> **Branch > New Branch > Name:** `tp-01/nombre-apellido` **> Create Branch**

---

## 3. Implementar el programa en JavaScript

Se debe modificar únicamente el archivo `sortx.js` que se encuentra en la carpeta del alumno dentro de `practicos`.

Ejemplo:

```text
practicos/63313 - Sanchez, Sofia/TP1/sortx.js
```

No se debe modificar el archivo del enunciado ubicado en `enunciados/tp1/sortx.js`.

> [!TIP]
> GitHub Desktop:  
> **Repository > Open in Visual Studio Code**

> [!TIP]
> VS Code:  
> **Archivo > Abrir carpeta >** `practicos/63313 - Sanchez, Sofia/TP1/`

---

## 4. Probar la solución con Node.js

El programa está escrito en JavaScript y se ejecuta con Node.js. Para comprobar que Node.js está instalado, abrir una terminal y ejecutar:

```bash
node --version
```

Desde la carpeta `TP1` del alumno se puede probar el programa con:

```bash
node sortx.js --help
node sortx.js empleados.csv salida.csv -b apellido
```

Antes de entregar, se deben probar las opciones y los casos de error indicados en el enunciado del TP.

---

## 5. Realizar commits parciales

Se deben realizar al menos 5 commits durante el desarrollo. Los mensajes tienen que describir claramente el avance realizado.

Ejemplos:

```text
Validar los argumentos de entrada
Agregar lectura del archivo CSV
Implementar ordenamiento por múltiples campos
Controlar errores de formato
Completar ayuda y pruebas manuales
```

Sólo se deben incluir los cambios realizados dentro de la carpeta del trabajo práctico del alumno.

> [!TIP]
> GitHub Desktop:  
> **Changes > Summary:** `Mensaje descriptivo` **> Commit to** `tp-01/nombre-apellido`

---

## 6. Publicar la rama

Después de realizar los commits, se debe publicar la rama en GitHub.

> [!TIP]
> GitHub Desktop:  
> **Repository > Push** o **Publish branch**

---

## 7. Abrir el Pull Request

Se debe abrir un Pull Request hacia la rama `main` con el formato:

```text
TP 01 - Legajo - Nombre Apellido
```

Ejemplo:

```text
TP 01 - 62000 - Sofia Sanchez
```

> [!TIP]
> GitHub Desktop:  
> **Branch > Create Pull Request > Title:** `TP 01 - Legajo - Nombre Apellido` **> Create Pull Request**

Antes de crearlo, verificar que:

- la rama de origen sea `tp-01/nombre-apellido`;
- la rama de destino sea `main`;
- el Pull Request contenga solamente los archivos del trabajo práctico del alumno.

---

## 8. Regresar a `main`

Después de crear el Pull Request, se debe regresar a la rama `main` y actualizar el repositorio local.

> [!TIP]
> GitHub Desktop:  
> **Current Branch > main > Fetch origin > Pull origin**

---

> [!CAUTION]
> **Atención:** no se debe modificar ningún archivo fuera de la carpeta del trabajo práctico del alumno. Cualquier cambio ajeno a esa carpeta puede afectar el trabajo de otros compañeros y no será considerado para la corrección.
