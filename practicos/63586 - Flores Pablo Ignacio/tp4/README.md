# TP4: MiniCRM

Mini CRM para gestionar clientes y sus actividades, con Node.js, TypeScript, Drizzle y SQLite.
Incluye una API REST (Express) y una interfaz web en React (`public/MiniCRM.html`).

**Alumno:** Ignacio Flores · Legajo 63586

## Instalación y ejecución

Requiere Node.js 20 o superior.

```bash
npm install
npm run dev      # http://localhost:3000
```

La base `minicrm.sqlite` se crea sola al iniciar y se siembra con 10 clientes de ejemplo si está vacía.
También se puede sembrar a mano con `npm run seed` (no duplica datos si se repite).

Otros comandos:

| Comando | Qué hace |
| --- | --- |
| `npm test` | Revisa los tipos y corre las pruebas del servicio (base en memoria) |
| `npm run build` / `npm start` | Compila a `dist/` y ejecuta la versión compilada |

Variables opcionales: `PORT` (por defecto 3000) y `DB_FILE` (por defecto `minicrm.sqlite`).

## Estructura

```
src/db/           esquema Drizzle, conexión SQLite y creación de tablas
src/servicio/     clase Clientes (reglas de negocio) y errores
src/controladores/  traducen HTTP a llamadas al servicio
src/routers/      rutas de Express
src/seed.ts       datos de ejemplo
src/prueba.ts     pruebas del servicio
public/MiniCRM.html  interfaz (React 18 + JSX embebido + CSS, desde CDN con versiones fijas)
```

## Reglas de negocio (en el servicio)

- Nombre y apellido obligatorios; email válido y único.
- Se normalizan al guardar: nombres en formato "Nombre Apellido", email en minúsculas y teléfono solo con dígitos.
- La búsqueda `q` busca texto parcial en cualquier campo (sin distinguir mayúsculas ni acentos).
  También se puede filtrar por un campo concreto (`?localidad=yerba`); los criterios se combinan.
- Una actividad se completa guardando su fecha de finalización. Una actividad completada
  no se puede editar ni borrar (error 409). Al borrar un cliente se borran sus actividades.

## API REST

| Método y ruta | Descripción |
| --- | --- |
| `GET /api/clientes?q=texto&campo=valor` | Lista/busca clientes |
| `POST /api/clientes` | Crea un cliente |
| `GET /api/clientes/:id` | Cliente con sus actividades |
| `PUT /api/clientes/:id` | Actualiza un cliente |
| `DELETE /api/clientes/:id` | Elimina un cliente (204) |
| `GET /api/clientes/:clienteId/actividades` | Lista las actividades |
| `POST /api/clientes/:clienteId/actividades` | Crea una actividad (`descripcion`, `fechaCompromiso` opcional `AAAA-MM-DD`) |
| `PUT /api/clientes/:clienteId/actividades/:id` | Edita una actividad pendiente |
| `POST /api/clientes/:clienteId/actividades/:id/completar` | Marca la actividad como completada |
| `DELETE /api/clientes/:clienteId/actividades/:id` | Borra una actividad pendiente (204) |

Los errores devuelven `{ "error": "mensaje" }` con estado 400 (datos inválidos), 404 (no existe) o 409 (conflicto).

## Interfaz

Pantalla de maestro y detalle que ocupa la ventana sin desplazamiento de página: el listado de clientes y
cada grupo de actividades tienen scroll interno.

- Búsqueda en vivo por cualquier campo.
- Ficha del cliente con alta y edición en el mismo detalle, y eliminación.
- Subformulario para agregar o editar actividades.
- «Compromisos» (sin fecha, luego vencidos, luego actuales y futuros) y «Actividades completadas».
  Al tildar un compromiso se completa; las completadas no tienen opciones de edición ni borrado.
