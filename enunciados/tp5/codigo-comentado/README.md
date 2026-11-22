# Ferretería El Yunque · Sistema de Gestión Comercial (Segundo Parcial / TP5)

Sistema comercial completo de punto de venta (mostrador) para un comercio minorista: **facturación de ventas**, **control de existencias y movimientos de stock** y **cuenta corriente de clientes con recibos de pago**.

---

## 1. Integrantes y Publicación

- **Alumno:** Germán Ariel García Núñez (Legajo **63204**)
- **Stack:** Next.js 16 (App Router + Route Handlers REST), TypeScript, Tailwind CSS v4, shadcn/ui, Chart.js (`react-chartjs-2`), Drizzle ORM (`drizzle-kit`), SQLite local / libSQL (Turso) en producción y Zod.

---

## 2. Puesta en marcha local

El proyecto levanta de cero con los comandos requeridos en el enunciado:

```bash
pnpm install
cp .env.example .env
pnpm run db:migrate
pnpm run db:seed
pnpm run dev
```

Para verificar en cualquier momento que todos los invariantes de stock y saldos cuadran:

```bash
pnpm run db:verificar
```

---

## 3. Variables de entorno (`.env.example`)

| Variable | Descripción | Ejemplo en Desarrollo | Ejemplo en Producción (Vercel + Turso) |
| :--- | :--- | :--- | :--- |
| `DATABASE_URL` | Dirección de la base SQLite o Turso | `file:./local.db` | `libsql://mostrador-usuario.turso.io` |
| `DATABASE_AUTH_TOKEN` | Token de acceso a Turso | *(vacío)* | `eyJhbGciOiJFZERTQSI...` |
| `SESSION_SECRET` | Secreto que firma la cookie `httpOnly` | Cadena de 32+ caracteres | Cadena aleatoria cargada en Vercel |

---

## 4. Usuarios de prueba por rol

Creados automáticamente por `pnpm run db:seed` (`basedatos/semilla.ts`):

| Rol | Nombre | Email | Contraseña | Permisos |
| :--- | :--- | :--- | :--- | :--- |
| **Administrador** (`admin`) | Laura Méndez | `laura@ferreteria.test` | `admin1234` | Acceso total: ventas, anulación de facturas, catálogo, ingresos/egresos de stock, categorías, clientes, pagos y gestión de usuarios. |
| **Vendedor** (`vendedor`) | Pablo Ruiz | `pablo@ferreteria.test` | `vendedor1234` | Operación de mostrador: emitir y consultar facturas, consultar catálogo, alta/edición de clientes, pagos en cuenta corriente y tablero. |
| **Vendedor** (`vendedor`) | Sofía Castro | `sofia@ferreteria.test` | `vendedor1234` | Operación de mostrador. |

---

## 5. Organización del código y guía para la Defensa

El código está organizado en carpetas con nombres claros en español siguiendo el principio arquitectónico del parcial: **cada regla de negocio vive en un único lugar (la capa de `servicios/`)**:

- **`basedatos/`**:
  - `esquema.ts`: Define las 9 tablas (`usuarios`, `categorias`, `productos`, `movimientos_stock`, `clientes`, `facturas`, `factura_items`, `pagos`, `movimientos_cuenta`). Todos los importes se guardan en **centavos como enteros** para evitar errores de coma flotante.
  - `conexion.ts`: Conecta Drizzle con SQLite local (`file:./local.db`) o con Turso (`libsql://...`) según `DATABASE_URL`.
  - `migraciones/`: Archivos SQL generados por `drizzle-kit`.
  - `semilla.ts`: Carga los usuarios, 6 categorías, 30 productos, 10 clientes y más de 50 facturas en los últimos 30 días llamando a **los mismos servicios** de la aplicación.
- **`esquemas/`**:
  - Esquemas de **Zod** compartidos entre los formularios del cliente y los servicios del servidor (`usuarios.ts`, `productos.ts`, `clientes.ts`, `facturas.ts`). Usan `z.strictObject` para rechazar campos no permitidos (como `existencia` en `PATCH /api/productos/[id]` o el número completo de una tarjeta).
- **`servicios/`**:
  - `stock.ts` (`moverStock`): **Única función que modifica `productos.existencia`**. Ejecuta `UPDATE productos SET existencia = existencia + ? WHERE id = ? AND existencia >= ?` y registra la fila en `movimientos_stock` en la misma transacción.
  - `facturas.ts` (`emitirFactura`, `anularFactura`): Resuelve la venta completa o su anulación en una única transacción `db.transaction(...)`. Congela el precio unitario en `factura_items`, asigna numeración correlativa sin huecos (`0001-00000001`), descuenta stock con `moverStock` y registra el débito en `movimientos_cuenta`.
  - `clientes.ts` (`saldoDeCliente`, `obtenerCuentaCorriente`): Calcula el saldo siempre como `débitos - créditos` desde `movimientos_cuenta`.
  - `pagos.ts` (`registrarPago`): Emite recibos correlativos (`R 0001-00000001`) e impide pagos mayores que la deuda (`422 PAGO_SUPERA_DEUDA`).
  - `autenticacion.ts`, `usuarios.ts`, `categorias.ts`, `productos.ts`, `tablero.ts`.
- **`lib/`**:
  - `formato.ts`: Único módulo que formatea moneda (`$ 12.345,50`), fechas en hora de Argentina (`dd/mm/aaaa`), documentos y numeración de comprobantes.
  - `sesion.ts`: Firma y verifica la cookie `httpOnly` (`SameSite=Lax`) con JWT (`jose`) y consulta el usuario activo en la base de datos en cada pedido.
  - `adaptadores.ts`: Envoltorios `conSesionApi` y `ejecutarAccion` que traducen `ApiError` al formato estándar `{ error: { code, message, details } }`.
- **`app/api/`**: Las 31 rutas REST distribuidas en 23 archivos `route.ts`.
- **`app/(sistema)/` y `componentes/`**: Páginas Server Components armadas con shadcn/ui y primitivas propias (`Pagina`, `Apilar`, `Alinear`, `Grilla`, `Caja`, `Titulo`, `Texto`) sin etiquetas HTML sueltas.
