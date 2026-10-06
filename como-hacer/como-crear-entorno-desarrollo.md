# Cómo configurar el entorno de desarrollo con JavaScript y Node.js

## 1. Instalar Visual Studio Code

Instalá [Visual Studio Code](https://code.visualstudio.com/) o el editor de texto que prefieras.

> **¿Por qué?** El editor es la herramienta donde vas a escribir, organizar, ejecutar y depurar el código del curso. VS Code integra estas tareas en una sola aplicación.

VS Code ya incluye soporte para JavaScript, resaltado de sintaxis, depuración y una terminal integrada. No es necesario instalar una extensión para comenzar.

## 2. Instalar Node.js

Descargá e instalá la versión **LTS** de [Node.js](https://nodejs.org/en/download). La instalación también incluye `npm`, el administrador de paquetes de Node.js.

> **¿Por qué?** Node.js permite ejecutar JavaScript fuera del navegador. También proporciona las herramientas necesarias para instalar bibliotecas y desarrollar aplicaciones web desde la terminal.

Después de instalarlo, cerrá y volvé a abrir la terminal. Verificá la instalación con:
```ba
node --version
npm --version
```
Ambos comandos deben mostrar un número de versión.

## 3. Instalar Git y Git Bash

En Windows, descargá e instalá [Git for Windows](https://git-scm.com/install/windows). El instalador incluye **Git Bash**, una terminal preparada para utilizar Git y comandos habituales de Unix.

> **¿Por qué?** Git registra la evolución del proyecto y permite recuperar versiones anteriores. Git Bash proporciona una terminal común para ejecutar Git y los comandos utilizados en las actividades.

Durante la instalación podés conservar las opciones predeterminadas. Al finalizar, abrí **Git Bash** desde el menú Inicio y verificá la instalación:
```bash
git --version
```
También podés abrir Git Bash dentro de una carpeta mediante el menú contextual **Git Bash Here**.

## 4. Crear una cuenta de GitHub
Si todavía no tenés una cuenta, registrate en [GitHub](https://github.com/).

> **¿Por qué?** GitHub aloja el repositorio del curso y permite guardar proyectos en línea, compartir cambios y acceder al código desde diferentes computadoras.

## 5. Instalar GitHub Desktop
[GitHub Desktop](https://desktop.github.com/) permite clonar repositorios y trabajar con Git mediante una interfaz gráfica.

> **¿Por qué?** GitHub Desktop facilita las operaciones más habituales de Git mediante botones y pantallas, lo que ayuda a visualizar los cambios mientras aprendés a trabajar con repositorios.

Para instalarlo:
1. Descargá GitHub Desktop desde su sitio oficial.
2. Ejecutá el instalador y esperá a que finalice.
3. Abrí la aplicación e iniciá sesión con tu cuenta de GitHub.
4. Comprobá que tu nombre y correo sean correctos en la configuración de Git.

GitHub Desktop es una alternativa gráfica a Git Bash. Podés utilizar cualquiera de las dos herramientas para trabajar con el repositorio del curso.

## 6. Clonar el repositorio del curso
Podés clonarlo con GitHub Desktop o ejecutar estos comandos:

> **¿Por qué?** Clonar crea una copia completa del repositorio en tu computadora y la conecta con GitHub, para que puedas recibir actualizaciones y registrar tu trabajo.
```bash
git clone https://github.com/AlejandroDiBattista/tup26-p4.git
cd tup26-p4
code .
```
Si el comando `code` no está disponible, abrí VS Code y seleccioná **Archivo → Abrir carpeta**.

## 7. Comprobar que Node.js funciona

Creá un archivo llamado `hola.js` con este contenido:

> **¿Por qué?** Esta prueba confirma que Node.js está instalado correctamente, que la terminal puede encontrarlo y que ya podés ejecutar programas JavaScript.
```javascript
console.log("¡Hola, JavaScript!");
```
Ejecutalo desde la terminal:
```bash
node hola.js
```
La terminal debe mostrar:
```text
¡Hola, JavaScript!
```

## 8. Instalar dependencias de un proyecto
Algunos proyectos incluyen un archivo `package.json`. En ese caso, ingresá primero en la carpeta que contiene ese archivo y ejecutá:

> **¿Por qué?** Las dependencias son bibliotecas que el proyecto necesita pero que no se guardan directamente en el repositorio. `npm install` descarga las versiones declaradas en `package.json`.
```bash
npm install
```
No ejecutes `npm install` en una carpeta que no tenga `package.json`.