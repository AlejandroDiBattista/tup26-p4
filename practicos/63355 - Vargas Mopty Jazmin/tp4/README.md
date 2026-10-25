# MiniCRM — TP4

Proyecto con Node.js, TypeScript, Express, Drizzle ORM y SQLite mediante better-sqlite3.

## Instalación

Usar Node.js 22 o 24 y ejecutar desde esta carpeta. En PowerShell, usar `npm.cmd` para evitar el bloqueo de `npm.ps1`:

```sh
npm.cmd install
```

## Ejecución

Los scripts previstos para ejecutar el servidor son:

```sh
npm.cmd run dev
npm.cmd start
```

`dev` reinicia el servidor al guardar cambios y `start` lo ejecuta una vez.
Ambos requieren `src/servidor.ts`, que se incorporará en el Paso 4.

## Prueba del Paso 1

Después de instalar las dependencias, verificar la instalación y los scripts:

```sh
npm.cmd ls --depth=0
npm.cmd run
```

Deben aparecer las dependencias declaradas y los scripts `dev` y `start`.
En esta etapa todavía no hay servidor, modelo de datos ni endpoints para probar.
