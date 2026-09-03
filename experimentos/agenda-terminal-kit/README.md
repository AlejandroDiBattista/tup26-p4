# Agenda TUI con Terminal Kit

## Requisitos

- Node.js 18 o superior

## Instalación

En una carpeta nueva:

```bash
npm init -y
npm install terminal-kit
```

Copiá `agenda.js` dentro de esa carpeta.

## Ejecución

```bash
node agenda.js
```

La aplicación crea automáticamente un archivo `agenda.json` en la misma carpeta para persistir los contactos.

## Búsqueda flexible

Podés buscar por cualquier combinación de:

- nombre
- teléfono
- email

Ejemplos:

```text
ana
gmail
38144
perez 555
ana gmail
```

La búsqueda:

- ignora mayúsculas/minúsculas
- ignora acentos
- permite varias palabras en cualquier orden
