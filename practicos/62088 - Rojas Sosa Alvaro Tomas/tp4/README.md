# MiniCRM — TP4

Gestión de clientes y sus actividades. Node.js + TypeScript + Drizzle + SQLite en el backend,
API REST con Express, y una interfaz web en un único archivo con React cargado desde CDN.

## Cómo ejecutarlo

```bash
npm install
npm start
```

Después abrir **http://localhost:3000/MiniCRM.html**

La base `minicrm.db` viene incluida con datos de ejemplo. Para regenerarla desde cero:

```bash
npm run seed
```

La carga borra lo anterior antes de insertar, así que repetirla no duplica datos.

> El proyecto no incluye `package-lock.json` a propósito. Con el lockfile fijado, `npm install`
> en una máquina limpia intentaba compilar `better-sqlite3` desde el código fuente (y pedía
> Python y herramientas de Visual Studio). Resolviendo las dependencias sin lockfile, npm baja
> el binario ya compilado y la instalación funciona sin pedir nada.

## Estructura

```
src/
  db/
    schema.ts       tablas clientes y actividades (Drizzle)
    index.ts        conexión SQLite, creación de tablas y función sin_acentos()
    seed.ts         10 clientes con actividades en todos los estados
  services/
    normalizar.ts   limpieza de nombres, emails, teléfonos y fechas
    clientes.ts     clase Clientes, métodos estáticos, búsqueda por cualquier campo
    actividades.ts  clase Actividades, reglas de negocio y orden de compromisos
  controllers/      traducen HTTP a llamadas al servicio
  routes/           definición de endpoints
  index.ts          servidor Express
public/
  MiniCRM.html      interfaz completa (React + JSX + CSS)
```

Las reglas de negocio viven en los servicios. Los controladores solo traducen entre HTTP y el
servicio, y los routers solo declaran las rutas.

## Modelo

**Cliente**: `id`, `nombre`, `apellido` y `email` obligatorios (el email es único);
`telefono`, `domicilio` y `localidad` opcionales.

**Actividad**: pertenece a un cliente (1:n, se borra con él). Tiene `descripcion`,
`fechaCompromiso` opcional y `fechaFinalizacion`.

No hay un campo "completada": **una actividad está completada cuando tiene fecha de
finalización**. Está vencida cuando sigue pendiente y su fecha de compromiso ya pasó.

Las fechas se guardan como texto ISO (`aaaa-mm-dd`), que es lo que entrega un
`<input type="date">` y ordena bien alfabéticamente, sin problemas de husos horarios.

## API REST

| Método | Ruta | Qué hace |
|---|---|---|
| `GET` | `/api/clientes?q=texto` | Lista clientes; `q` busca en cualquier campo |
| `GET` | `/api/clientes/:id` | Un cliente |
| `POST` | `/api/clientes` | Crea un cliente |
| `PUT` | `/api/clientes/:id` | Actualiza un cliente |
| `DELETE` | `/api/clientes/:id` | Elimina un cliente y sus actividades |
| `GET` | `/api/clientes/:id/actividades` | Actividades del cliente, ya ordenadas |
| `POST` | `/api/clientes/:id/actividades` | Crea una actividad |
| `PUT` | `/api/actividades/:id` | Edita una actividad |
| `PATCH` | `/api/actividades/:id/completar` | Le pone la fecha de finalización |
| `DELETE` | `/api/actividades/:id` | Elimina una actividad |

## Reglas de negocio

- `nombre`, `apellido` y `email` son obligatorios; el email no se puede repetir.
- Al guardar se normaliza: nombres y apellidos en Title Case, email en minúsculas,
  teléfono solo con dígitos. Los campos opcionales vacíos se guardan como `null`.
- La descripción de la actividad es obligatoria; la fecha de compromiso es opcional.
- Una actividad **completada** no se puede editar ni eliminar: la API responde `409`.
- Al eliminar un cliente se eliminan también sus actividades.

## Orden de los compromisos

Primero los que **no tienen fecha**, después los **vencidos** y al final los de **hoy en
adelante**. Dentro de los grupos con fecha, de la más antigua a la más reciente. Las
completadas van en su propia lista, de la finalización más reciente a la más antigua.

## Búsqueda

`sin_acentos()` es una función registrada en SQLite que pasa a minúsculas y quita las tildes.
Gracias a eso, buscar `garcia` encuentra a `García` y viceversa. Busca en nombre, apellido,
nombre completo, email, teléfono, domicilio, localidad e id.
