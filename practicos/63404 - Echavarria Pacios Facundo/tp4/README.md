# TP4 · MiniCRM

Aplicación local con Node.js, TypeScript, Express, Drizzle, SQLite y React. Requiere Node.js 22 y acceso a Internet para cargar React y Babel desde CDN.

## Instalación y ejecución

Desde esta carpeta, en PowerShell:

```powershell
npm.cmd install
npm.cmd run db:migrate
npm.cmd run db:seed
npm.cmd run dev
```

Abrir <http://localhost:3000>. Para ejecutar sin modo observación: `npm.cmd start`. El servidor escucha únicamente en la máquina local.

`npm.cmd run db:seed` carga 20 clientes ficticios con emails de `example.com`. Es opcional y puede repetirse sin duplicarlos ni modificar clientes existentes. Los datos de SQLite no se incluyen en Git; este comando permite recrear los ejemplos al descargar la entrega.

## Verificación

```powershell
npm.cmd run typecheck
npm.cmd test
```

Las pruebas aplican las migraciones en una base temporal, verifican la API por HTTP y eliminan únicamente sus propios datos de prueba.

## Estructura y persistencia

- `src/db`: esquema Drizzle, conexión y ejecución de migraciones.
- `src/services`: clase `Clientes` con consultas, validaciones y reglas de negocio.
- `src/controllers` y `src/routes`: adaptación HTTP y rutas REST.
- `public/MiniCRM.html`: React y JSX embebido, CSS y llamadas a la API.
- `drizzle`: migraciones versionadas. Después de cambiar el esquema, ejecutar `npm.cmd run db:generate` y `npm.cmd run db:migrate`.

Los datos se guardan en `data/minicrm.sqlite`, excluida de Git. Las migraciones no se ejecutan automáticamente al iniciar. Para cambiar la ubicación, definir `DATABASE_PATH`; para cambiar el puerto, definir `PORT` antes de iniciar. Hacer copia de la base con el servidor detenido antes de eliminar datos o modificar el esquema.

## Uso y API

El listado permite buscar por ID, nombre, email, teléfono, dirección o ciudad, sin distinguir mayúsculas. Seleccionar un cliente muestra su ficha y sus actividades. Los formularios de alta y edición aparecen en el detalle; los de actividades, dentro de la ficha. Las listas tienen desplazamiento interno.

Nombre y descripción son obligatorios. Los otros campos del cliente son opcionales. La fecha de una actividad puede omitirse o enviarse como `null`; si se informa debe ser una fecha real `YYYY-MM-DD`. Los `PUT` reemplazan los campos editables: los opcionales omitidos se vacían.

| Método | Ruta | Resultado |
|---|---|---|
| GET | `/api/clientes?q=texto` | Clientes; búsqueda vacía lista todos |
| GET | `/api/clientes/:id` | Ficha con `actividades` |
| POST | `/api/clientes` | Crear cliente |
| PUT | `/api/clientes/:id` | Editar cliente |
| DELETE | `/api/clientes/:id` | Eliminar cliente y todas sus actividades |
| POST | `/api/clientes/:id/actividades` | Crear actividad |
| PUT | `/api/clientes/:id/actividades/:actividadId` | Editar pendiente |
| PATCH | `/api/clientes/:id/actividades/:actividadId/completar` | Completar; cuerpo vacío o `{}` |
| DELETE | `/api/clientes/:id/actividades/:actividadId` | Eliminar pendiente |

Cliente: `{ nombre, email, telefono, direccion, ciudad }`. Actividad: `{ descripcion, fecha }`. Los IDs y la fecha de finalización los genera el servidor. Las altas devuelven `201`, los borrados `204`; los errores tienen formato `{ "error": "mensaje" }`, con estado `400`, `404`, `409` o `500` según corresponda.

Una actividad completada no puede editarse, eliminarse individualmente ni reabrirse. Completarla nuevamente mantiene su fecha original. Eliminar el cliente también elimina su historial, previa confirmación en la interfaz.

La aplicación no incluye autenticación y está pensada para uso local. La búsqueda recorre los clientes en memoria, suficiente para este trabajo práctico; no incluye los textos de sus actividades.
