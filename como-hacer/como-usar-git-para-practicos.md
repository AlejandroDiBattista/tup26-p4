# Git para realizar los trabajos prácticos

Este tutorial explica los conceptos básicos de Git y cómo aplicarlos al flujo de entrega de Programación IV. Complementa las instrucciones de [cómo entregar un práctico](como-entregar-practico.md).

## Git en un minuto
Git registra la evolución de un proyecto. Permite comparar cambios, recuperar versiones anteriores y desarrollar un trabajo práctico sin modificar directamente la versión principal.
```text
Editar → seleccionar cambios → crear commits → publicar la rama → abrir un Pull Request
```
### Conceptos básicos
- **Repositorio:** carpeta cuyo historial administra Git.
- **Repositorio local:** copia almacenada en tu computadora.
- **Repositorio remoto:** copia compartida en GitHub.
- **Commit:** registro de un avance concreto del trabajo.
- **Rama:** línea de trabajo independiente.
- **`main`:** rama principal; no se utiliza para desarrollar directamente el TP.
- **`origin`:** nombre habitual del repositorio remoto.
- **`pull`:** descarga e incorpora cambios desde GitHub.
- **`push`:** publica en GitHub los commits locales.
- **Pull Request:** solicitud de GitHub para revisar e incorporar una rama a `main`.

## 1. Configurar la identidad de Git
Esta configuración se realiza una sola vez en Git Bash:
```bash
git config --global user.name "Nombre Apellido"
git config --global user.email "correo-usado-en-github@example.com"
```
El nombre y el correo identifican al autor de cada commit.

> [!TIP]
> **En GitHub Desktop:** abrí **File > Options > Git** y completá el nombre y el correo asociados con tu cuenta.

## 2. Clonar el repositorio
Clonar crea una copia local del repositorio y descarga su historial. Esta operación se realiza una sola vez:
```bash
git clone https://github.com/AlejandroDiBattista/tup26-p4.git
cd tup26-p4
git status
```
> [!TIP]
> **En GitHub Desktop:** seleccioná **File > Clone repository > URL**, ingresá `AlejandroDiBattista/tup26-p4`, elegí una carpeta y presioná **Clone**.

## 3. Preparar la rama del práctico
Antes de cada TP, regresá a `main` y descargá los últimos cambios:
```ba
git switch main
git pull --ff-only origin main
```
Después creá una rama con el formato solicitado:
```text
tp-01/nombre-apellido
```
Por ejemplo:
```bash
git switch -c tp-01/sofia-sanchez
```
La rama permite desarrollar el práctico sin alterar `main`.

> [!TIP]
> **En GitHub Desktop:** elegí **Current Branch > main**, presioná **Fetch origin** y luego **Pull origin**. Después seleccioná **Branch > New Branch**, escribí `tp-01/nombre-apellido` y presioná **Create Branch**.

## 4. Desarrollar y probar el práctico
Modificá únicamente los archivos de tu carpeta dentro de `practicos`. Para el TP 1, por ejemplo:
```text
practicos/63313 - Sanchez, Sofia/TP1/sortx.js
```
No modifiques el enunciado de `enunciados/tp1` ni los archivos de otros alumnos.

Revisá frecuentemente el estado del repositorio:
```bash
git status
git diff
```
Probá el programa con Node.js antes de registrarlo:
```bash
node sortx.js --help
node sortx.js empleados.csv salida.csv -b apellido
```
> [!NOTE]
> **En GitHub Desktop:** utilizá **Repository > Open in Visual Studio Code**. La pestaña **Changes** muestra los archivos modificados y sus diferencias. Las pruebas se ejecutan desde la terminal de VS Code o Git Bash.

## 5. Seleccionar cambios y crear commits
Primero seleccioná el archivo que formará parte del próximo commit:
```bash
git add "practicos/63313 - Sanchez, Sofia/TP1/sortx.js"
git diff --staged
```
Reemplazá la ruta por la de tu carpeta. Evitá `git add .` sin revisar, porque puede incluir archivos ajenos al TP.

Después creá un commit con un mensaje que describa el avance:
```bash
git commit -m "Validar los argumentos de entrada"
```
Durante el desarrollo se deben realizar al menos cinco commits parciales. Por ejemplo:
```text
Validar los argumentos de entrada
Agregar lectura del archivo CSV
Implementar ordenamiento por múltiples campos
Controlar errores de formato
Completar ayuda y pruebas manuales
```
Repetí el ciclo **editar → probar → revisar → seleccionar → crear commit**. Podés consultar el historial con:
```bash
git log --oneline -10
```
> [!TIP]
> **En GitHub Desktop:** en **Changes**, marcá solamente los archivos del TP, escribí el mensaje en **Summary** y presioná **Commit to tp-01/nombre-apellido**. La pestaña **History** muestra los commits realizados.

## 6. Publicar la rama y abrir el Pull Request
La primera vez, publicá la rama con:
```bash
git push --set-upstream origin tp-01/sofia-sanchez
```
Los siguientes commits se publican con:
```bash
git push
```
Después abrí un Pull Request hacia `main` con este formato:
```text
TP 01 - Legajo - Nombre Apellido
```
Ejemplo:
```text
TP 01 - 62000 - Sofia Sanchez
```
Antes de crearlo, verificá que contenga únicamente los archivos de tu práctico y al menos cinco commits descriptivos.

> [!TIP]
> **En GitHub Desktop:** presioná **Publish branch** y luego **Branch > Create Pull Request**. En GitHub, comprobá que el destino sea `main`, escribí el título requerido y presioná **Create Pull Request**.

## 7. Realizar correcciones
Si el TP necesita cambios, continuá sobre la misma rama:
```bash
git switch tp-01/sofia-sanchez
git add "ruta/del/archivo-modificado.js"
git commit -m "Corregir validación del archivo de entrada"
git push
```
El Pull Request se actualiza automáticamente. No hace falta crear otro.

> [!TIP]
> **En GitHub Desktop:** elegí la rama del TP en **Current Branch**, realizá el nuevo commit y presioná **Push origin**. El Pull Request existente se actualizará solo.

## 8. Regresar a `main`
Después de entregar, regresá a la rama principal y actualizala:
```bash
git switch main
git pull --ff-only origin main
```
Conservá la rama del TP mientras el Pull Request esté abierto o pueda necesitar correcciones.

> [!TIP]
> **En GitHub Desktop:** seleccioná **Current Branch > main**, presioná **Fetch origin** y luego **Pull origin** si hay cambios.

## Errores que deben evitarse
- Trabajar directamente en `main`.
- Crear la rama sin actualizar primero `main`.
- Modificar archivos fuera de la carpeta del alumno.
- Hacer un único commit al finalizar todo el TP.
- Usar mensajes imprecisos como `cambios`, `prueba` o `final`.
- Ejecutar `git add .` sin revisar qué archivos se seleccionan.
- Olvidar `git push`: un commit local todavía no está publicado.
- Abrir el Pull Request hacia una rama distinta de `main`.

## Lista de control
- [ ] Actualicé `main` antes de crear la rama.
- [ ] La rama tiene el formato `tp-01/nombre-apellido`.
- [ ] Modifiqué únicamente los archivos de mi práctico.
- [ ] Probé el programa con Node.js.
- [ ] Realicé al menos cinco commits descriptivos.
- [ ] Publiqué la rama en GitHub.
- [ ] El Pull Request apunta a `main` y tiene el título solicitado.
- [ ] Regresé a `main` después de entregar.
