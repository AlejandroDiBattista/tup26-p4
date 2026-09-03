# Agenda TUI con Ink

## Requisitos

- Node.js 18 o superior

## Instalación

En esta carpeta:

```bash
npm install
```

## Ejecución

```bash
npm run ink
```

La aplicación crea automáticamente un archivo `agenda.json` en la misma carpeta para persistir los contactos.

## Búsqueda flexible

Podés buscar por cualquier combinación de:

- legajo
- nombre y apellido
- teléfono
- usuario de GitHub

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
