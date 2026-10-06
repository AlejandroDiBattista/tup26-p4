# Un carrito de compras con la API REST

Este apunte muestra cómo modelar un carrito de compras como recurso REST. Usa lo que ya armamos para la agenda: Express, Drizzle y SQLite.

Implementamos 6 operaciones:

- crear un carrito
- ver un carrito con su total
- agregar un producto o cambiar su cantidad
- quitar un producto
- vaciar el carrito
- confirmar la compra

No implementamos clientes, productos ni proveedores. Donde hace falta el precio de un producto, usamos un catálogo mínimo que ocupa el lugar del módulo de productos.

El carrito es un buen ejemplo porque tiene algo que la agenda no tenía: estado. Un carrito abierto acepta cambios. Uno confirmado, no. Buena parte del diseño consiste en hacer cumplir esa regla.

## Diseñar los recursos

Hay 2 recursos. El carrito, y los ítems que contiene. Un ítem es un producto con una cantidad, y solo existe dentro de un carrito. Por eso su ruta cuelga de la del carrito.

| Método | Ruta | Qué hace | Si sale bien |
|---|---|---|---|
| POST | `/carritos` | crea un carrito vacío | 201 y el carrito |
| GET | `/carritos/7` | trae el carrito con ítems y total | 200 y el carrito |
| PUT | `/carritos/7/items/3` | pone el producto 3 con la cantidad indicada | 200 y el carrito |
| DELETE | `/carritos/7/items/3` | quita el producto 3 | 200 y el carrito |
| DELETE | `/carritos/7/items` | vacía el carrito | 200 y el carrito |
| POST | `/carritos/7/confirmacion` | confirma la compra | 200 y el carrito |

Todas las operaciones sobre ítems devuelven el carrito completo, con el total recalculado. El frontend lo necesita después de cada cambio, y así se ahorra un `GET`.

El producto se identifica en la ruta: `/items/3`. Dentro de un carrito no puede haber 2 ítems del mismo producto. Si el cliente pide 3 unidades, es un ítem con cantidad 3, no 3 ítems. Por eso el id del producto alcanza para identificar al ítem.

### Agregar con PUT y no con POST

La forma intuitiva de agregar un producto es `POST /carritos/7/items` con `{"productoId": 3}`, sumando una unidad cada vez. Tiene un problema: `POST` no es idempotente. Si la persona hace doble clic, o si la conexión se corta y el navegador reintenta, el carrito termina con unidades de más.

Con `PUT /carritos/7/items/3` y `{"cantidad": 2}`, el cliente no dice "sumá uno", dice "el producto 3 tiene que quedar con 2 unidades". Enviarlo una vez o 5 veces deja el mismo resultado. El mismo pedido sirve para agregar un producto nuevo y para cambiar la cantidad de uno que ya está.

El costo es que el frontend tiene que saber la cantidad actual para pedir la siguiente. Como cada respuesta trae el carrito completo, ya la tiene.

### Confirmar es un cambio de estado

Confirmar no es crear, modificar ni borrar datos sueltos. Es una transición: el carrito pasa de abierto a confirmado, y en el camino hay que revisar reglas y congelar precios.

Hay 2 formas habituales de expresarlo:

- `PATCH /carritos/7` con `{"estado": "confirmado"}`, que trata la confirmación como un cambio de campo
- `POST /carritos/7/confirmacion`, que trata la confirmación como algo que se crea

Elegimos la segunda. Con `PATCH`, el cliente podría enviar también `{"estado": "abierto"}` para reabrir un carrito confirmado, y habría que prohibirlo aparte. Con `POST /confirmacion`, la única transición posible es la que la ruta nombra. Además, `POST` comunica que la operación tiene efectos más allá de cambiar un campo.

Vas a ver también rutas como `POST /carritos/7/confirmar`, con un verbo. Funcionan, pero rompen la convención de que las URL son sustantivos. `confirmacion` mantiene la convención.

## Estados y reglas

El carrito tiene 2 estados: `abierto` y `confirmado`. Las reglas son estas:

- un carrito se crea abierto
- solo un carrito abierto acepta agregar, quitar o vaciar
- solo se puede confirmar un carrito abierto que tenga al menos un ítem
- al confirmar, se guarda el precio de cada producto en ese momento
- un carrito confirmado no vuelve a abrirse

Cada regla rota tiene su código de estado:

| Situación | Código |
|---|---|
| el id no es un entero positivo, o la cantidad no lo es | 400 |
| el carrito no existe, o el producto no existe | 404 |
| el carrito ya está confirmado | 409 |
| se intenta confirmar un carrito vacío | 409 |

El 409 significa conflicto con el estado actual del recurso. El pedido está bien formado, pero el carrito no está en condiciones de aceptarlo.

## El modelo de datos

Usamos 2 tablas: una para los carritos y otra para los ítems.

```text
carritos                           carrito_items
┌────┬────────────┬────────┐      ┌────────────┬─────────────┬──────────┬─────────────────┐
│ id │ estado     │ creado │      │ carrito_id │ producto_id │ cantidad │ precio_unitario │
├────┼────────────┼────────┤      ├────────────┼─────────────┼──────────┼─────────────────┤
│  7 │ abierto    │ ...    │      │          7 │           1 │        2 │ NULL            │
│  8 │ confirmado │ ...    │      │          8 │           2 │        3 │ 89900           │
└────┴────────────┴────────┘      └────────────┴─────────────┴──────────┴─────────────────┘
```

La clave primaria de `carrito_items` está formada por 2 columnas: `carrito_id` y `producto_id`. Se llama clave compuesta. Hace que la base rechace un segundo ítem del mismo producto en el mismo carrito, que es justo la regla que buscamos.

### Los precios en centavos

Los precios se guardan como enteros, en centavos: `150000` son $1.500,00. Los números con decimales de JavaScript no representan exactamente valores como 0,1. Al sumar muchos precios aparecen errores de redondeo, y con dinero no son aceptables. Con enteros, las sumas son exactas.

### El precio se congela al confirmar

Mientras el carrito está abierto, `precio_unitario` queda en `NULL` y el total se calcula con el precio actual del catálogo. Si el precio de un producto cambia, el carrito abierto lo refleja.

Al confirmar, guardamos en cada ítem el precio de ese momento. A partir de ahí, aunque el catálogo cambie, la compra confirmada mantiene el precio que la persona aceptó.

El precio nunca viene del cliente. Si la API aceptara `{"cantidad": 2, "precio": 1}`, cualquiera podría comprar por un peso. El cliente dice qué producto y cuántas unidades; el servidor decide cuánto cuesta.

## El esquema con Drizzle

Agregamos las 2 tablas a `src/db/esquema.js`, debajo de `contactos`:

```js
// src/db/esquema.js
import { sqliteTable, integer, text, primaryKey } from 'drizzle-orm/sqlite-core';
import { sql } from 'drizzle-orm';

// ...contactos queda igual...

export const carritos = sqliteTable('carritos', {
  id: integer('id').primaryKey(),
  estado: text('estado', { enum: ['abierto', 'confirmado'] }).notNull().default('abierto'),
  creado: text('creado').notNull().default(sql`CURRENT_TIMESTAMP`),
  confirmado: text('confirmado'),
});

export const carritoItems = sqliteTable(
  'carrito_items',
  {
    carritoId: integer('carrito_id').notNull().references(() => carritos.id),
    productoId: integer('producto_id').notNull(),
    cantidad: integer('cantidad').notNull(),
    precioUnitario: integer('precio_unitario'),
  },
  tabla => [primaryKey({ columns: [tabla.carritoId, tabla.productoId] })],
);
```

Hay 4 cosas nuevas respecto de `contactos`:

- `enum` en `estado` le dice a Drizzle qué textos son válidos, y lo usa para avisar en el editor si escribís otro valor; la base sigue guardando texto
- `default` define el valor que la base pone si no le pasamos uno; `` sql`CURRENT_TIMESTAMP` `` es la fecha y hora del momento, calculada por la base
- `references` declara que `carrito_id` apunta a un carrito
- el tercer argumento de `sqliteTable` recibe las columnas y devuelve restricciones de la tabla, como la clave primaria compuesta

`producto_id` no tiene `references` porque no tenemos tabla de productos. Cuando exista, se agrega y se genera otra migración.

Generá y aplicá la migración:

```bash
npm run db:generate -- --name crear_carritos
npm run db:migrate
```

```sql
-- drizzle/0001_crear_carritos.sql (fragmento)
CREATE TABLE `carrito_items` (
	`carrito_id` integer NOT NULL,
	`producto_id` integer NOT NULL,
	`cantidad` integer NOT NULL,
	`precio_unitario` integer,
	PRIMARY KEY(`carrito_id`, `producto_id`),
	FOREIGN KEY (`carrito_id`) REFERENCES `carritos`(`id`) ON UPDATE no action ON DELETE no action
);
```

## El catálogo sustituto

El repositorio necesita saber si un producto existe y cuánto cuesta. En un sistema real, esa pregunta la responde el módulo de productos. Acá la responde un módulo mínimo con 3 precios fijos:

```js
// src/catalogo.js
// Ocupa el lugar del módulo de productos, que no implementamos acá.
// Precios en centavos: 150000 son $1.500,00.
const PRECIOS = new Map([
  [1, 150000],
  [2, 89900],
  [3, 4500],
]);

export async function precioDe(productoId) {
  return PRECIOS.get(productoId) ?? null;
}
```

`precioDe` es asíncrona aunque no lo necesite. Así tiene la misma forma que tendrá cuando consulte la base, y el repositorio de carritos no cambia el día que la reemplacemos.

## El repositorio de carritos

### Exigir un carrito abierto

Casi todas las operaciones empiezan igual: buscar el carrito, verificar que exista y que esté abierto. Lo resolvemos con una función:

```js
// src/carritos.repositorio.js
import { eq, and, sql } from 'drizzle-orm';
import { db } from './db/index.js';
import { carritos, carritoItems } from './db/esquema.js';
import { precioDe } from './catalogo.js';
import { ErrorHttp } from './errores.js';

async function exigirAbierto(tx, id) {
  const [carrito] = await tx.select().from(carritos).where(eq(carritos.id, id));
  if (!carrito) throw new ErrorHttp(404, 'Carrito inexistente');
  if (carrito.estado !== 'abierto') {
    throw new ErrorHttp(409, 'El carrito ya está confirmado');
  }
  return carrito;
}
```

`exigirAbierto` recibe `tx`, la transacción en curso, en lugar de usar `db`. Enseguida vemos por qué.

### Crear

```js
export async function crear() {
  const [carrito] = await db.insert(carritos).values({}).returning();
  return { ...carrito, items: [], total: 0 };
}
```

`values({})` inserta una fila sin datos: la base completa `id`, `estado` y `creado` con sus valores por defecto. Un carrito recién creado no tiene ítems, así que armamos la respuesta sin consultar.

### Ver el carrito con su total

```js
export async function obtener(id) {
  const [carrito] = await db.select().from(carritos).where(eq(carritos.id, id));
  if (!carrito) return null;

  const filas = await db.select().from(carritoItems).where(eq(carritoItems.carritoId, id));
  const items = await Promise.all(filas.map(async fila => {
    const precioUnitario = fila.precioUnitario ?? await precioDe(fila.productoId);
    return {
      productoId: fila.productoId,
      cantidad: fila.cantidad,
      precioUnitario,
      subtotal: precioUnitario * fila.cantidad,
    };
  }));
  const total = items.reduce((suma, item) => suma + item.subtotal, 0);

  return { ...carrito, items, total };
}
```

El total no se guarda en la base: se calcula cada vez. Un dato que se puede calcular a partir de otros y además se guarda, tarde o temprano queda desactualizado.

`fila.precioUnitario ?? await precioDe(...)` aplica la regla de los precios. Si el ítem tiene precio congelado, se usa ese. Si no, el del catálogo.

`Promise.all` espera a que terminen todas las consultas de precio, que se hacen en paralelo.

### Agregar o cambiar la cantidad

```js
export async function ponerItem(carritoId, productoId, cantidad) {
  if (await precioDe(productoId) === null) {
    throw new ErrorHttp(404, 'Producto inexistente');
  }
  await db.transaction(async tx => {
    await exigirAbierto(tx, carritoId);
    await tx
      .insert(carritoItems)
      .values({ carritoId, productoId, cantidad })
      .onConflictDoUpdate({
        target: [carritoItems.carritoId, carritoItems.productoId],
        set: { cantidad },
      });
  });
  return obtener(carritoId);
}
```

`onConflictDoUpdate` resuelve en una sola instrucción el "agregar o cambiar". Intenta insertar el ítem. Si ya existe uno con la misma clave compuesta, en lugar de fallar, actualiza la cantidad. El SQL que genera es `INSERT ... ON CONFLICT (carrito_id, producto_id) DO UPDATE SET cantidad = ?`. Esta forma de escribir se suele llamar upsert, por update e insert.

### Por qué una transacción

Entre verificar que el carrito está abierto y escribir el ítem pasa un instante. Si en ese instante otro pedido confirma el carrito, terminaríamos agregando un ítem a una compra ya confirmada.

`db.transaction` agrupa las instrucciones: la base las ejecuta como una unidad y no deja que otra escritura se meta en el medio. Si cualquier paso lanza un error, como el `ErrorHttp` de `exigirAbierto`, la base deshace todo lo hecho dentro de la transacción y el error sigue su camino hasta el manejador de errores.

Por eso `exigirAbierto` recibe `tx`. Las consultas tienen que hacerse a través de la transacción para quedar dentro de ella.

### Quitar y vaciar

```js
export async function quitarItem(carritoId, productoId) {
  await db.transaction(async tx => {
    await exigirAbierto(tx, carritoId);
    await tx
      .delete(carritoItems)
      .where(and(
        eq(carritoItems.carritoId, carritoId),
        eq(carritoItems.productoId, productoId),
      ));
  });
  return obtener(carritoId);
}

export async function vaciar(carritoId) {
  await db.transaction(async tx => {
    await exigirAbierto(tx, carritoId);
    await tx.delete(carritoItems).where(eq(carritoItems.carritoId, carritoId));
  });
  return obtener(carritoId);
}
```

`and` combina 2 condiciones: el ítem tiene que ser de este carrito y de este producto.

Quitar un producto que no está en el carrito no es un error: responde 200 con el carrito como estaba. `DELETE` es idempotente; lo que importa es que, después del pedido, el producto no esté. Vaciar un carrito ya vacío, lo mismo.

Vaciar borra los ítems, no el carrito. El carrito sigue existiendo, abierto y con el mismo id, listo para recibir productos.

### Confirmar

```js
export async function confirmar(carritoId) {
  await db.transaction(async tx => {
    await exigirAbierto(tx, carritoId);

    const filas = await tx
      .select()
      .from(carritoItems)
      .where(eq(carritoItems.carritoId, carritoId));
    if (filas.length === 0) {
      throw new ErrorHttp(409, 'No se puede confirmar un carrito vacío');
    }

    for (const fila of filas) {
      await tx
        .update(carritoItems)
        .set({ precioUnitario: await precioDe(fila.productoId) })
        .where(and(
          eq(carritoItems.carritoId, carritoId),
          eq(carritoItems.productoId, fila.productoId),
        ));
    }

    await tx
      .update(carritos)
      .set({ estado: 'confirmado', confirmado: sql`CURRENT_TIMESTAMP` })
      .where(eq(carritos.id, carritoId));
  });
  return obtener(carritoId);
}
```

Acá la transacción importa más que en ningún otro lado. Confirmar son varios pasos: congelar el precio de cada ítem y cambiar el estado. Si el proceso falla en el medio, no puede quedar un carrito con algunos precios congelados y otros no, o con todos congelados pero todavía abierto. La transacción garantiza que pasan todos los pasos o ninguno.

En un sistema real, este es el lugar donde también se descontaría el stock y se crearía el pedido, dentro de la misma transacción.

## Las rutas

Las rutas solo leen la entrada, llaman al repositorio y responden. Todas las reglas viven en el repositorio.

```js
// src/carritos.rutas.js
import { Router } from 'express';
import * as repositorio from './carritos.repositorio.js';
import { ErrorHttp } from './errores.js';

export const rutasCarritos = Router();

function leerEntero(valor, nombre) {
  const numero = Number(valor);
  if (!Number.isInteger(numero) || numero <= 0) {
    throw new ErrorHttp(400, `${nombre} debe ser un entero positivo`);
  }
  return numero;
}

function leerIds(req) {
  return {
    carritoId: leerEntero(req.params.id, 'El id del carrito'),
    productoId: req.params.productoId
      ? leerEntero(req.params.productoId, 'El id del producto')
      : undefined,
  };
}

rutasCarritos.post('/', async (req, res) => {
  const carrito = await repositorio.crear();
  res.status(201).location(`/carritos/${carrito.id}`).json(carrito);
});

rutasCarritos.get('/:id', async (req, res) => {
  const { carritoId } = leerIds(req);
  const carrito = await repositorio.obtener(carritoId);
  if (!carrito) throw new ErrorHttp(404, 'Carrito inexistente');
  res.json(carrito);
});

rutasCarritos.put('/:id/items/:productoId', async (req, res) => {
  const { carritoId, productoId } = leerIds(req);
  const cantidad = leerEntero(req.body?.cantidad, 'La cantidad');
  res.json(await repositorio.ponerItem(carritoId, productoId, cantidad));
});

rutasCarritos.delete('/:id/items/:productoId', async (req, res) => {
  const { carritoId, productoId } = leerIds(req);
  res.json(await repositorio.quitarItem(carritoId, productoId));
});

rutasCarritos.delete('/:id/items', async (req, res) => {
  const { carritoId } = leerIds(req);
  res.json(await repositorio.vaciar(carritoId));
});

rutasCarritos.post('/:id/confirmacion', async (req, res) => {
  const { carritoId } = leerIds(req);
  res.json(await repositorio.confirmar(carritoId));
});
```

`req.body?.cantidad` usa encadenamiento opcional porque, en Express 5, `req.body` es `undefined` si el pedido no trae cuerpo JSON. En ese caso `cantidad` queda `undefined`, `Number(undefined)` es `NaN` y la respuesta es 400.

La cantidad cero no se acepta. Para sacar un producto está `DELETE`. Si `PUT` con cantidad cero también lo sacara, habría 2 formas de hacer lo mismo.

Para montarlas, una línea en `app.js`:

```js
// src/app.js
import { rutasCarritos } from './carritos.rutas.js';

app.use('/carritos', rutasCarritos);
```

Va junto a `app.use('/contactos', rutasContactos)`, antes de `rutaInexistente`.

## Probar el recorrido completo

```bash
# Crear
curl -i -X POST http://localhost:3000/carritos
```

```text
HTTP/1.1 201 Created
Location: /carritos/1

{"id":1,"estado":"abierto","creado":"2026-10-04 21:31:58","confirmado":null,"items":[],"total":0}
```

```bash
# 2 unidades del producto 1 y 4 del producto 3
curl -X PUT http://localhost:3000/carritos/1/items/1 \
  -H "Content-Type: application/json" -d '{"cantidad":2}'
curl -X PUT http://localhost:3000/carritos/1/items/3 \
  -H "Content-Type: application/json" -d '{"cantidad":4}'
```

La respuesta del segundo pedido, sin los campos de fecha:

```json
{
  "id": 1,
  "estado": "abierto",
  "items": [
    { "productoId": 1, "cantidad": 2, "precioUnitario": 150000, "subtotal": 300000 },
    { "productoId": 3, "cantidad": 4, "precioUnitario": 4500, "subtotal": 18000 }
  ],
  "total": 318000
}
```

Si repetís el primer `PUT`, el producto 1 sigue con 2 unidades: el pedido es idempotente.

```bash
# Quitar el producto 3
curl -X DELETE http://localhost:3000/carritos/1/items/3

# Confirmar
curl -X POST http://localhost:3000/carritos/1/confirmacion
```

```json
{
  "id": 1,
  "estado": "confirmado",
  "confirmado": "2026-10-04 21:32:10",
  "items": [
    { "productoId": 1, "cantidad": 2, "precioUnitario": 150000, "subtotal": 300000 }
  ],
  "total": 300000
}
```

Después de confirmar, cualquier cambio responde 409:

```bash
curl -X PUT http://localhost:3000/carritos/1/items/2 \
  -H "Content-Type: application/json" -d '{"cantidad":1}'
```

```json
{ "error": "El carrito ya está confirmado" }
```

El registro de la terminal muestra el recorrido de códigos de estado de una prueba completa:

```text
POST /carritos → 201
PUT /carritos/1/items/1 → 200
PUT /carritos/1/items/99 → 404
PUT /carritos/1/items/1 → 400
DELETE /carritos/1/items/3 → 200
POST /carritos/2/confirmacion → 409
DELETE /carritos/1/items → 200
POST /carritos/1/confirmacion → 200
PUT /carritos/1/items/1 → 409
```

En orden, esos pedidos son: crear, agregar, un producto inexistente, una cantidad cero, quitar, confirmar un carrito vacío, vaciar, confirmar y modificar un carrito confirmado.

## Lo que queda afuera

Este ejemplo deja de lado varias cosas que un carrito real necesita.

La primera es de quién es el carrito. Hoy cualquiera que conozca el id puede modificarlo. Con autenticación, cada carrito tendría un dueño, y la API verificaría que quien hace el pedido es ese dueño.

La segunda es el stock. Confirmar debería verificar que hay unidades disponibles y descontarlas, dentro de la misma transacción.

La tercera es el abandono. Los carritos abiertos que nadie confirma se acumulan. Se suele agregar una fecha de última modificación y borrar o archivar los que llevan días sin cambios.

La cuarta es el pedido. En muchos sistemas, confirmar no cambia el estado del carrito: crea un recurso nuevo, el pedido, con su propio ciclo de estados (pagado, enviado, entregado). El carrito queda solo como borrador de compra.

Las 4 se agregan sin cambiar la forma de la API: siguen siendo los mismos recursos, con más reglas en el repositorio.
