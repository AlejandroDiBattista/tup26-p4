# API REST de referencia — Sistema de ventas y gestión comercial

Este documento propone una API para implementar las funcionalidades del segundo parcial. Los nombres de rutas y campos pueden adaptarse, siempre que la aplicación cumpla el enunciado. La API es una guía de diseño: no está implementada en el mockup.

## Convenciones

- Las rutas tienen como prefijo `/api`.
- Las solicitudes y respuestas con contenido usan JSON y `Content-Type: application/json`.
- Los identificadores de los ejemplos son enteros. Las fechas y horas se expresan en ISO 8601, por ejemplo `2026-10-29T14:30:00Z`.
- Los importes se representan en **centavos enteros**. Por ejemplo, `650000` equivale a $ 6.500,00. Los nombres de estos campos terminan en `Centavos`.
- Las cantidades de productos y movimientos son números enteros positivos; el stock puede ser cero.
- Los listados devuelven `{ "datos": [...] }`. El parámetro `q` es opcional y permite buscar según los campos indicados en cada recurso.
- Una respuesta exitosa sin contenido usa `204 No Content` y no devuelve JSON.

### Contrato común y permisos

- Todos los endpoints, excepto `POST /api/sesion`, requieren sesión. Solo los administradores pueden usar `/api/usuarios` y `/api/usuarios/:id`; el resto está disponible para cualquier usuario activo.
- Los `PATCH` aceptan un objeto JSON parcial: un campo omitido conserva su valor. `null` solo se admite en campos opcionales, como teléfono y correo. Se valida el objeto resultante, no únicamente los campos enviados.
- Se rechazan con `422` campos desconocidos, campos de solo lectura o tipos incorrectos. El servidor asigna `id`, `usuarioId` (desde la sesión), número de comprobante y fecha de ventas y movimientos. No se acepta stock actualizado directamente ni totales calculados por el cliente.
- En creación, los campos de los ejemplos son obligatorios salvo los identificados como opcionales. `clienteId` debe enviarse como `null` para consumidor final. `observacion`, `telefono` y `correo` pueden omitirse o ser `null`; el cliente debe conservar al menos un contacto.
- Los textos obligatorios no pueden quedar vacíos después de quitar espacios. Importes y cantidades deben ser enteros dentro del rango seguro de la implementación, incluidos los resultados de sumas y multiplicaciones. No se aceptan números decimales en campos en centavos.
- La búsqueda `q` no distingue mayúsculas ni acentos; vacía devuelve todos los registros. El acceso de usuario se normaliza quitando espacios y sin distinguir mayúsculas. El código de producto es único sin distinguir mayúsculas.
- Para este volumen de ejercicio, los listados no requieren paginación. Productos, clientes y usuarios se ordenan por nombre e identificador; ventas y movimientos por fecha e identificador descendentes. `activo` admite `true` y `false`; si se omite, incluye ambos estados.
- Los importes que muestra la interfaz están en pesos: se convierten a centavos antes de llamar la API. Las fechas y horas ingresadas se convierten desde la zona local a ISO 8601 con zona; al mostrarlas se convierten a la zona del comercio.
- `404` se aplica a cualquier identificador referenciado que no exista. `409` se utiliza para acceso o código duplicado y conflictos de stock o saldo; `422`, para otras violaciones de validación. Las respuestas de creación incluyen `Location` con la ruta del recurso cuando exista una ruta de consulta individual.

### Errores

Los errores devuelven un código HTTP apropiado y un cuerpo como el siguiente:

```json
{
  "error": {
    "codigo": "STOCK_INSUFICIENTE",
    "mensaje": "No hay stock suficiente para Café molido 250 g.",
    "detalles": { "productoId": 1, "disponible": 3, "solicitado": 5 }
  }
}
```

| Estado | Uso |
| --- | --- |
| `400 Bad Request` | JSON inválido o solicitud mal formada. |
| `401 Unauthorized` | Falta una sesión válida o las credenciales son incorrectas. |
| `403 Forbidden` | El usuario no tiene permiso para la operación. |
| `404 Not Found` | El recurso no existe. |
| `409 Conflict` | Conflicto con el estado actual, como stock insuficiente o código duplicado. |
| `422 Unprocessable Content` | Datos bien formados que no cumplen las reglas de validación. |
| `500 Internal Server Error` | Error inesperado del servidor; no se deben exponer detalles internos. |

Los nombres de códigos de error incluidos son ejemplos; deben mantenerse consistentes en toda la aplicación.

## Autenticación y usuarios

Las operaciones siguientes requieren una sesión válida, excepto el inicio de sesión. El servidor debe verificar en cada solicitud que el usuario siga activo. En esta propuesta se utiliza una **cookie de sesión** `HttpOnly`, `Secure` en producción y `SameSite=Lax` o más restrictiva. Se debe usar HTTPS en producción y protección CSRF del framework, o una comprobación estricta de origen con una estrategia equivalente; `SameSite` por sí solo no reemplaza esa protección. La sesión debe expirar, invalidarse al cerrar sesión y renovarse al iniciar sesión. La creación y modificación de usuarios está reservada al administrador.

El primer administrador se crea mediante un comando o proceso de inicialización documentado, sin un endpoint de registro público. Su contraseña se configura fuera del repositorio. No se permite desactivar ni quitar el perfil al último administrador activo (`409`).

Las respuestas de usuarios nunca incluyen la contraseña ni su representación almacenada.

### Iniciar sesión

`POST /api/sesion`

```json
{ "acceso": "ana@ejemplo.com", "contrasena": "contraseña-de-ejemplo" }
```

**Respuesta:** `200 OK`, crea la sesión y establece la cookie.

```json
{
  "usuario": {
    "id": 1,
    "nombre": "Ana Martínez",
    "acceso": "ana@ejemplo.com",
    "administrador": true,
    "activo": true
  }
}
```

Si las credenciales no son válidas o el usuario está inactivo, responde `401`.

### Consultar la sesión actual

`GET /api/sesion`

Devuelve `200` con el mismo objeto `usuario` o `401` si no hay sesión válida.

### Cerrar sesión

`DELETE /api/sesion`

Invalida la sesión y responde `204`.

### Listar usuarios

`GET /api/usuarios?q=lucia`

Requiere administrador. La búsqueda puede incluir nombre y acceso.

```json
{
  "datos": [
    { "id": 2, "nombre": "Lucía Pérez", "acceso": "lucia@ejemplo.com", "administrador": false, "activo": true }
  ]
}
```

### Obtener un usuario

`GET /api/usuarios/2`

Requiere administrador. Devuelve `200` con el objeto de usuario o `404`.

### Crear un usuario

`POST /api/usuarios`

Requiere administrador. El acceso debe ser único y la contraseña debe almacenarse mediante un hash seguro para contraseñas.

```json
{
  "nombre": "Lucía Pérez",
  "acceso": "lucia@ejemplo.com",
  "contrasena": "contraseña-de-ejemplo",
  "administrador": false,
  "activo": true
}
```

**Respuesta:** `201 Created`, con el usuario creado sin contraseña. Un acceso duplicado produce `409`.

### Modificar un usuario

`PATCH /api/usuarios/2`

Requiere administrador. Se envían solo los campos a modificar. Los campos editables son `nombre`, `acceso`, `administrador` y `activo`. El cambio y la recuperación de contraseñas quedan fuera de esta API mínima; una ampliación debe invalidar las sesiones afectadas.

```json
{ "nombre": "Lucía Pérez", "activo": false }
```

**Respuesta:** `200 OK`, con el usuario actualizado sin contraseña. La desactivación debe impedir su acceso posterior, incluso si ya tenía una sesión abierta.

## Productos

Un producto incluye `id`, `codigo`, `nombre`, `precioVentaCentavos`, `stockActual` y `activo`. El código debe ser único y el precio de venta, positivo. El stock se modifica mediante movimientos o ventas, no con la edición general del producto.

### Listar productos

`GET /api/productos?q=cafe`

La búsqueda incluye código y nombre. El parámetro opcional `activo=true` permite limitar el listado a productos activos.

```json
{
  "datos": [
    { "id": 1, "codigo": "CAF-001", "nombre": "Café molido 250 g", "precioVentaCentavos": 650000, "stockActual": 24, "activo": true }
  ]
}
```

### Obtener un producto

`GET /api/productos/1`

Devuelve `200` con el producto o `404`.

### Crear un producto

`POST /api/productos`

```json
{
  "codigo": "CAF-001",
  "nombre": "Café molido 250 g",
  "precioVentaCentavos": 650000,
  "stockInicial": 24,
  "activo": true
}
```

**Respuesta:** `201 Created`, con el producto creado. En una única transacción, el servidor crea el producto y registra el stock inicial como un movimiento de entrada cuando es mayor que cero. El stock inicial no puede ser negativo.

### Modificar un producto

`PATCH /api/productos/1`

```json
{ "nombre": "Café molido 250 g", "precioVentaCentavos": 690000, "activo": true }
```

Los únicos campos editables son `codigo`, `nombre`, `precioVentaCentavos` y `activo`. `stockInicial` solo se acepta en la creación.

**Respuesta:** `200 OK`, con el producto actualizado. La desactivación se realiza mediante `activo: false`; el producto permanece en el historial. Las modificaciones no alteran los detalles de ventas anteriores.

## Movimientos de stock

### Consultar movimientos

`GET /api/movimientos-stock?productoId=1`

`productoId` es opcional. Cada movimiento indica su origen; los movimientos de una venta incluyen el identificador de la venta.

```json
{
  "datos": [
    {
      "id": 15,
      "fecha": "2026-10-29T14:30:00Z",
      "productoId": 1,
      "productoNombre": "Café molido 250 g",
      "detalleVentaId": 81,
      "tipo": "SALIDA",
      "cantidad": 2,
      "motivo": "Venta #42",
      "origen": "VENTA",
      "ventaId": 42,
      "usuarioId": 1
    }
  ]
}
```

Para movimientos manuales, `origen` es `MANUAL` y `ventaId` es `null`. La entrada inicial se identifica con origen `INICIAL` y también tiene `ventaId` igual a `null`. El identificador de una venta se obtiene a través de `detalleVentaId`; no hace falta duplicarlo en la tabla de movimientos. `productoNombre` se obtiene del catálogo para mostrar la lista. En un movimiento de origen `VENTA`, producto, cantidad y usuario deben corresponder al detalle y su venta; solo lo crea la operación de venta. `INICIAL` solo lo crea el alta de producto. La API manual solo crea origen `MANUAL` y también puede ajustar productos inactivos.

### Registrar una entrada o salida manual

`POST /api/movimientos-stock`

```json
{ "productoId": 1, "tipo": "ENTRADA", "cantidad": 10, "motivo": "Ingreso de mercadería" }
```

**Respuesta:** `201 Created`, con el movimiento creado y el stock resultante:

```json
{
  "movimiento": { "id": 16, "productoId": 1, "productoNombre": "Café molido 250 g", "detalleVentaId": null, "tipo": "ENTRADA", "cantidad": 10, "motivo": "Ingreso de mercadería", "origen": "MANUAL", "ventaId": null, "usuarioId": 1, "fecha": "2026-10-29T15:00:00Z" },
  "stockActual": 34
}
```

`tipo` admite `ENTRADA` o `SALIDA`. La cantidad debe ser positiva y el motivo obligatorio. Una salida que supere el stock disponible responde `409` y no genera ningún movimiento. El registro y la actualización del stock deben realizarse en una misma transacción.

## Clientes

### Listar clientes

`GET /api/clientes?q=gonzalez`

La búsqueda incluye nombre y documento. Tanto el listado como la consulta individual incluyen `saldoCentavos`, calculado a partir de ventas en cuenta corriente menos pagos. Es un campo de solo lectura, no una columna editable.

```json
{
  "datos": [
    { "id": 7, "nombre": "María González", "documento": "28.456.123", "telefono": null, "correo": "maria@ejemplo.com", "saldoCentavos": 2720000 }
  ]
}
```

### Obtener un cliente

`GET /api/clientes/7`

Devuelve `200` con el cliente o `404`.

### Crear un cliente

`POST /api/clientes`

```json
{ "nombre": "María González", "documento": "28.456.123", "telefono": null, "correo": "maria@ejemplo.com" }
```

**Respuesta:** `201 Created`, con el cliente creado. Se requiere nombre, identificación y al menos un dato de contacto. La respuesta incluye `saldoCentavos: 0`. El cliente recién creado puede seleccionarse en una venta, sin necesidad de reiniciarla.

### Modificar un cliente

`PATCH /api/clientes/7`

```json
{ "telefono": "381 555-0123", "correo": "maria@ejemplo.com" }
```

Los campos editables son `nombre`, `documento`, `telefono` y `correo`.

**Respuesta:** `200 OK`, con el cliente actualizado. Debe conservarse al menos un dato de contacto y no deben modificarse los datos de comprobantes anteriores.

## Ventas y comprobantes

Las formas de pago admitidas son `CONTADO`, `TARJETA` y `CUENTA_CORRIENTE`. Para consumidor final se envía `clienteId: null`. La cuenta corriente requiere un cliente registrado.

### Listar ventas

`GET /api/ventas`

```json
{
  "datos": [
    { "id": 42, "numero": 42, "clienteId": 7, "fecha": "2026-10-29T14:30:00Z", "clienteNombre": "María González", "formaPago": "CUENTA_CORRIENTE", "totalCentavos": 1720000 }
  ]
}
```

Se pueden incorporar filtros por fecha, cliente o forma de pago como mejora opcional.

### Registrar una venta

`POST /api/ventas`

```json
{
  "clienteId": 7,
  "formaPago": "CUENTA_CORRIENTE",
  "productos": [
    { "productoId": 1, "cantidad": 2 },
    { "productoId": 2, "cantidad": 1 }
  ]
}
```

El servidor debe obtener los precios vigentes, calcular los importes, verificar que los productos estén activos y comprobar el stock. No debe confiar en precios o totales enviados por el navegador. Si un mismo producto aparece más de una vez, debe sumar sus cantidades y crear un solo detalle para ese producto antes de comprobar las existencias. Se conservan copias del nombre y documento del cliente y de la descripción y precio del producto; no se reconstruyen desde el catálogo al consultar un comprobante.

En una **única transacción**, debe guardar el comprobante y sus detalles, descontar las existencias y registrar los movimientos de salida. Si cualquier paso falla, no debe quedar aplicada ninguna parte de la operación. Las comprobaciones y actualizaciones de stock deben protegerse frente a ventas simultáneas, por ejemplo mediante una actualización condicional de stock dentro de una transacción que se revierte si no se pudo descontar todo. La deuda aparece al guardar la venta en cuenta corriente: no se inserta otra deuda duplicada. La numeración debe ser única bajo concurrencia; no usar `MAX(numero) + 1` sin protección.

**Respuesta:** `201 Created`, con el comprobante completo, usando el formato de `GET /api/ventas/42` que se muestra a continuación.

Una venta sin productos o con cantidades inválidas responde `422`; un producto inexistente responde `404`; un producto inactivo o stock insuficiente responde `409`. Una cuenta corriente sin cliente responde `422`.

### Consultar el comprobante

`GET /api/ventas/42`

```json
{
  "id": 42,
  "numero": 42,
  "fecha": "2026-10-29T14:30:00Z",
  "usuarioId": 1,
  "clienteId": 7,
  "clienteNombre": "María González",
  "clienteDocumento": "28.456.123",
  "formaPago": "CUENTA_CORRIENTE",
  "productos": [
    { "productoId": 1, "descripcion": "Café molido 250 g", "cantidad": 2, "precioUnitarioCentavos": 650000, "subtotalCentavos": 1300000 },
    { "productoId": 2, "descripcion": "Té en hebras 100 g", "cantidad": 1, "precioUnitarioCentavos": 420000, "subtotalCentavos": 420000 }
  ],
  "totalCentavos": 1720000
}
```

Para consumidor final, `clienteId` es `null`, `clienteNombre` es `"Consumidor final"` y `clienteDocumento` puede ser `null`. El comprobante es interno y no fiscal. La impresión puede realizarse desde la interfaz utilizando estos datos; no requiere un endpoint específico.

## Cuenta corriente y pagos

El saldo se calcula como la suma de ventas en `CUENTA_CORRIENTE` del cliente menos los pagos registrados. Las ventas de contado y tarjeta no forman parte de la cuenta.

### Consultar cuenta corriente

`GET /api/clientes/7/cuenta-corriente`

Devuelve el saldo y los movimientos en orden de fecha descendente. Los importes de los movimientos son positivos; `tipo` indica si aumentan o reducen la deuda.

```json
{
  "clienteId": 7,
  "saldoCentavos": 2720000,
  "movimientos": [
    { "tipo": "VENTA", "fecha": "2026-10-29T14:30:00Z", "ventaId": 42, "numeroComprobante": 42, "importeCentavos": 1720000 },
    { "tipo": "PAGO", "fecha": "2026-10-25T12:00:00Z", "pagoId": 8, "importeCentavos": 500000, "observacion": "Pago parcial" },
    { "tipo": "VENTA", "fecha": "2026-10-20T12:00:00Z", "ventaId": 31, "numeroComprobante": 31, "importeCentavos": 1500000 }
  ]
}
```

La respuesta también puede acompañarse con los datos de `GET /api/clientes/:id` para mostrar nombre y contacto. Un cliente inexistente responde `404`. Un cliente sin movimientos tiene saldo cero y un arreglo vacío.

### Registrar un pago

`POST /api/clientes/7/pagos`

```json
{ "fecha": "2026-10-29T15:00:00Z", "importeCentavos": 500000, "observacion": "Pago parcial" }
```

**Respuesta:** `201 Created`:

```json
{
  "pago": { "id": 9, "clienteId": 7, "usuarioId": 1, "fecha": "2026-10-29T15:00:00Z", "importeCentavos": 500000, "observacion": "Pago parcial" },
  "saldoCentavos": 2220000
}
```

El importe debe ser positivo y no puede superar el saldo adeudado. Una fecha válida es obligatoria y la observación es opcional. Si el pago supera el saldo, responde `409` y no se registra. La comprobación del saldo y el registro deben protegerse frente a pagos simultáneos, bloqueando o serializando las operaciones sobre esa cuenta dentro de una transacción. Una fecha futura no es válida. Esta API registra un pago recibido, no procesa tarjetas ni transferencias.

## Límites y operaciones de interfaz

No hay borrado físico ni edición de ventas, pagos o movimientos confirmados en este alcance. Los cambios de stock se registran como nuevos movimientos con motivo; los productos y usuarios se desactivan. Las búsquedas, los borradores de venta, el cálculo visual de subtotales y la impresión no requieren endpoints adicionales. El servidor vuelve a calcular y validar al confirmar.

La interfaz debe deshabilitar el botón mientras confirma una venta o pago. Tras una respuesta incierta por corte de red, se debe consultar el historial antes de reenviar; para permitir reintentos automáticos seguros se puede incorporar una clave de idempotencia como ampliación.

El panel de ejemplo calcula indicadores sobre los listados recibidos. “Stock bajo” usa un umbral ilustrativo de 3 unidades; no agrega un requisito obligatorio de stock mínimo. Gráficos, filtros avanzados, paginación y roles configurables son ampliaciones.

## Referencias técnicas

- [PATCH y modificaciones parciales — RFC 5789](https://www.rfc-editor.org/rfc/rfc5789).
- [Sesiones — OWASP](https://cheatsheetseries.owasp.org/cheatsheets/Session_Management_Cheat_Sheet.html).
- [Protección CSRF — OWASP](https://cheatsheetseries.owasp.org/cheatsheets/Cross-Site_Request_Forgery_Prevention_Cheat_Sheet.html).

## Resumen de rutas

| Método | Ruta | Función |
| --- | --- | --- |
| `POST` | `/api/sesion` | Iniciar sesión. |
| `GET` | `/api/sesion` | Consultar la sesión actual. |
| `DELETE` | `/api/sesion` | Cerrar sesión. |
| `GET`, `POST` | `/api/usuarios` | Listar y crear usuarios; administrador. |
| `GET`, `PATCH` | `/api/usuarios/:id` | Consultar y modificar un usuario; administrador. |
| `GET`, `POST` | `/api/productos` | Listar y crear productos. |
| `GET`, `PATCH` | `/api/productos/:id` | Consultar y modificar un producto. |
| `GET`, `POST` | `/api/movimientos-stock` | Consultar y registrar movimientos. |
| `GET`, `POST` | `/api/clientes` | Listar y crear clientes. |
| `GET`, `PATCH` | `/api/clientes/:id` | Consultar y modificar un cliente. |
| `GET`, `POST` | `/api/ventas` | Listar y registrar ventas. |
| `GET` | `/api/ventas/:id` | Consultar un comprobante. |
| `GET` | `/api/clientes/:id/cuenta-corriente` | Consultar saldo y movimientos. |
| `POST` | `/api/clientes/:id/pagos` | Registrar un pago. |
