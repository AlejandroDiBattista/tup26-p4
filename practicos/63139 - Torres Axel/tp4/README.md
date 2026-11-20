# TP 4 · MiniCRM

**Axel Torres — Legajo 63139 — Programación IV**

Aplicación para administrar clientes y sus actividades. Implementada con Node.js, TypeScript, Express, Drizzle ORM y SQLite. La interfaz está en `public/MiniCRM.html`, con React, JSX y CSS embebidos, y bibliotecas de CDN con versiones fijas.

## Inicio rápido

Requisitos: **Node.js 22 o superior**, npm y conexión a Internet para instalar dependencias y cargar las bibliotecas de la interfaz. No hace falta instalar SQLite por separado.

Si ya tenés clonado el repositorio, desde su carpeta ejecutá:

```bash
git fetch origin
git switch tp-04/axel-torres
cd "practicos/63139 - Torres Axel/tp4"
npm ci
npm run db:seed
npm start
```

Si todavía no lo tenés:

```bash
git clone --branch tp-04/axel-torres https://github.com/AlejandroDiBattista/tup26-p4.git
cd "tup26-p4/practicos/63139 - Torres Axel/tp4"
npm ci
npm run db:seed
npm start
```

Abrí **http://localhost:3000/MiniCRM.html**. Para detener el servidor, presioná `Ctrl+C` en la terminal.

La base `data/minicrm.db` y sus tablas se crean automáticamente mediante las migraciones de Drizzle al iniciar. Los datos persisten aunque cierres el servidor o el navegador. `npm run db:seed` es opcional: carga diez clientes ficticios con actividades pendientes, vencidas, sin fecha y completadas. Repetirlo no duplica los clientes de ejemplo ni sus actividades; si borraste uno de esos clientes, vuelve a crearlo. Para empezar vacío, omití ese comando.

## Uso

1. Buscá por nombre, apellido, email, teléfono, domicilio, localidad o ID. La búsqueda ignora mayúsculas y tildes y permite combinar palabras de distintos campos.
2. Seleccioná un cliente para consultar su ficha y actividades.
3. Usá **Agregar** o **Editar** para abrir el formulario dentro del detalle. Nombre, apellido y email son obligatorios.
4. Agregá una actividad con el subformulario bajo la ficha. La fecha de compromiso es opcional. El lápiz carga una actividad pendiente en ese mismo formulario.
5. Marcá el casillero de un compromiso para completarlo. La fecha de finalización se registra en el servidor. Las actividades completadas quedan de solo lectura.
6. La papelera elimina actividades pendientes, previa confirmación. **Eliminar** en la ficha borra el cliente y todas sus actividades, también previa confirmación.

Los compromisos se ordenan sin fecha primero y después por fecha ascendente: vencidos antes de actuales/futuros. Las completadas muestran las más recientes primero. La fecha de compromiso se guarda como fecha de calendario; la finalización, como instante ISO. El indicador «Vencido» compara con el día local del navegador.

La lista de clientes y la zona de actividades tienen desplazamiento interno. En celular, la selección abre el detalle y el botón **Clientes** permite volver. Los controles tienen nombres accesibles y se pueden usar con teclado. Al cambiar de cliente con cambios sin guardar se solicita confirmación.

## Comandos

| Comando | Función |
| --- | --- |
| `npm start` | Iniciar con TypeScript mediante tsx. |
| `npm run dev` | Reiniciar automáticamente al modificar el servidor. |
| `npm run check` | Verificar los tipos de TypeScript. |
| `npm test` | Ejecutar pruebas de integración sobre una base temporal. |
| `npm run build` | Compilar el servidor en `dist/`. |
| `npm run start:prod` | Ejecutar el servidor compilado, después de build. |
| `npm run db:seed` | Cargar ejemplos sin duplicarlos. |
| `npm run db:generate` | Generar una nueva migración después de cambiar el esquema. |

Variables de entorno opcionales: `PORT` (por defecto `3000`) y `DB_FILE` (por defecto `data/minicrm.db`, relativo a la carpeta del TP). No se necesita un archivo `.env`. El servidor escucha únicamente en `127.0.0.1`; es una aplicación local de práctica sin autenticación.

## Organización

```text
public/MiniCRM.html           Interfaz React, servicios fetch, JSX y CSS
src/db/schema.ts             Tablas y tipos inferidos de Drizzle
src/db/index.ts              Conexión SQLite y aplicación de migraciones
src/db/seed.ts               Datos ficticios opcionales
src/services/clientes.ts     Clase Clientes con métodos estáticos
src/services/validacion.ts   Validaciones y errores de negocio
src/controllers/clientes.ts  Adaptación entre HTTP y el servicio
src/routes/clientes.ts       Rutas REST
src/app.ts                  Express, archivos estáticos y manejo de errores
src/server.ts               Inicio y cierre del servidor
drizzle/                    Migraciones versionadas
tests/api.test.ts            Pruebas HTTP, persistencia y reglas de negocio
```

La clase `Clientes` concentra el CRUD, la búsqueda, las validaciones y las restricciones de actividades. Los controladores solo reciben la solicitud y devuelven la respuesta. La base usa una relación uno a muchos con clave foránea y borrado en cascada. La búsqueda se hace en memoria sobre los clientes obtenidos con Drizzle, una decisión simple para el volumen de este TP que permite comparar tildes correctamente.

Los nombres y domicilios se guardan sin espacios sobrantes, los emails en minúsculas y los teléfonos sin separadores. La validación del servidor funciona independientemente del formulario. No se permite finalizar actividades mediante una edición común; debe usarse la operación de completar.

## API REST

Base: `http://localhost:3000/api/clientes`. Los cuerpos son JSON. Las respuestas de error tienen forma `{ "error": "Descripción" }`.

| Método | Ruta | Resultado |
| --- | --- | --- |
| GET | `/api/clientes?q=texto` | Clientes filtrados. |
| GET | `/api/clientes/:clienteId` | Ficha y actividades. |
| POST | `/api/clientes` | Crear cliente (201). |
| PUT / PATCH | `/api/clientes/:clienteId` | Actualizar campos del cliente (200). |
| DELETE | `/api/clientes/:clienteId` | Eliminar cliente y actividades (204). |
| GET | `/api/clientes/:clienteId/actividades` | Actividades ordenadas. |
| GET | `/api/clientes/:clienteId/actividades/:actividadId` | Obtener una actividad. |
| POST | `/api/clientes/:clienteId/actividades` | Agregar actividad pendiente (201). |
| PUT / PATCH | `/api/clientes/:clienteId/actividades/:actividadId` | Editar actividad pendiente (200). |
| PATCH | `/api/clientes/:clienteId/actividades/:actividadId/completar` | Registrar finalización (200). |
| DELETE | `/api/clientes/:clienteId/actividades/:actividadId` | Eliminar actividad pendiente (204). |

Cliente de ejemplo:

```json
{
  "nombre": "Ana",
  "apellido": "García",
  "email": "ana@example.com",
  "telefono": "+54 381 5550123",
  "domicilio": "San Martín 450",
  "localidad": "Yerba Buena"
}
```

Actividad de ejemplo:

```json
{ "descripcion": "Enviar presupuesto", "fechaCompromiso": "2026-10-24" }
```

Los campos opcionales se pueden vaciar con `null` o cadena vacía. Las fechas de compromiso aceptan `AAAA-MM-DD` y se verifica que existan. Los identificadores deben ser enteros positivos. Se devuelve 400 por datos inválidos, 404 por recursos inexistentes o actividades de otro cliente, y 409 al intentar editar o borrar individualmente una actividad completada. Completar otra vez la misma actividad conserva su fecha original.

## Comprobación

```bash
npm run check
npm test
npm run build
```

Las pruebas cubren CRUD, búsqueda por campos y sin tildes, normalización, errores, fechas inválidas y bisiestas, orden de actividades, pertenencia al cliente, inmutabilidad del historial, borrado en cascada, persistencia entre procesos, carga de ejemplos repetible y publicación de la página. Se usa una base temporal distinta de `data/minicrm.db`.

Para comprobar la interfaz: creá y editá un cliente, agregá un compromiso, modificá su descripción y fecha, completalo, recargá la página y verificá que siga completado y sin botones de edición/borrado. Probá también una búsqueda, la confirmación de eliminación y el botón de regreso en celular.

El enunciado original se conserva en `enunciado.md`; `minicrm.jpg` contiene la referencia visual de la cátedra. No se agregaron Turso ni MCP: son extensiones del ejemplo de clase y no requisitos del TP.
