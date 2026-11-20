# Programación IV: Desarrollo Web · 29 de octubre de 2026 · Alejandro Di Battista

## 2º parcial - Sistema de gestión comercial

> **Fecha de entrega**: Domingo 22 de noviembre de 2026, 23:59 hs

Este documento reúne el enunciado (secciones 1 a 9), las pautas arquitectónicas (sección 10), la especificación de la API REST (sección 11) y los entregables (sección 12).

## 1. Objetivo

Cada equipo desarrolla y publica un sistema de gestión comercial para un comercio minorista: factura ventas, controla las existencias del catálogo y lleva la cuenta corriente de los clientes. El parcial integra lo visto en la materia: interfaz con [React](https://react.dev/) , [ShadCN](https://ui.shadcn.com/) para los componentes, [Tailwind](https://tailwindcss.com/) para la presentacion, lógica de servidor y acceso a datos con [Next.js](https://nextjs.org/), base de datos relacional con [Drizzle](https://orm.drizzle.team/) y despliegue en la nube usando [Vercel](https://vercel.com/) para la App y [Turso](https://turso.tech/) para la base de datos.  

Al terminar, el alumno debe demostrar que puede:

- modelar un dominio real en tablas y relaciones, y mantener la consistencia de los datos: el stock y los saldos siempre cuadran;
- construir una aplicación full stack con autenticación y permisos por rol;
- resolver una operación compuesta, como confirmar una factura, en una transacción atómica;
- entregar un producto con aspecto profesional, funcionando en su máquina y publicado en internet;
- explicar y modificar cualquier parte de su propio código.

**Modalidad:** grupos de 3 integrantes. 

## 2. Descripción general y alcance

El sistema lo usa el personal de un comercio de un solo local. El vendedor arma la venta en el mostrador, identifica al comprador, elige la forma de pago y emite la factura; el sistema verifica y descuenta el stock en el mismo acto. Si la venta es en cuenta corriente, la deuda queda registrada en el saldo del cliente, que luego cancela con pagos.

**Dentro del alcance**

- Facturación de ventas a consumidor final o a cliente registrado, con alta del cliente en el momento.
- Catálogo de productos con existencias, ingresos y egresos manuales de stock e historial de movimientos.
- Clientes con cuenta corriente: saldo, movimientos y registro de pagos.
- Usuarios con roles, inicio de sesión y permisos.
- Tablero de inicio con indicadores y gráficos.

**Fuera del alcance**

- Factura electrónica ante ARCA: el comprobante es interno y no tiene validez fiscal.
- Discriminación de IVA: los precios son finales, con impuestos incluidos.
- Cobro real con tarjeta o integración con pasarelas de pago.
- Compras a proveedores, varias sucursales y listas de precios: la reposición se carga como ingreso manual de stock.

## 3. Usuarios y roles

El sistema tiene dos roles. El administrador puede todo; el vendedor opera el mostrador pero no toca la configuración, el stock ni las anulaciones. Los permisos se verifican en el servidor, no solo ocultando botones.

| Acción                               | Administrador | Vendedor |
| ------------------------------------ | ------------- | -------- |
| Emitir facturas y consultarlas       | Sí            | Sí       |
| Anular facturas                      | Sí            | No       |
| Consultar catálogo y existencias     | Sí            | Sí       |
| Alta, edición y baja de productos    | Sí            | No       |
| Ingresos y egresos manuales de stock | Sí            | No       |
| Alta y edición de clientes           | Sí            | Sí       |
| Registrar pagos en cuenta corriente  | Sí            | Sí       |
| Ver el tablero de inicio             | Sí            | Sí       |
| Gestionar usuarios                   | Sí            | No       |

## 4. Estructura de la aplicación

La aplicación tiene un panel lateral fijo con cinco módulos; arriba, una barra con el usuario conectado y el botón de salir. Los nombres de la tabla son los recomendados: «Existencias» queda como pestaña dentro de Productos y «Cuenta corriente» como pestaña dentro de la ficha de cada cliente.

| Módulo    | Pantallas                                                                              | Ruta sugerida                                            | Rol                            |
| --------- | -------------------------------------------------------------------------------------- | -------------------------------------------------------- | ------------------------------ |
| Inicio    | Tablero con indicadores y gráficos                                                     | `/`                                                      | Ambos                          |
| Ventas    | Nueva venta · Facturas · Detalle de factura                                            | `/ventas/nueva`, `/ventas`, `/ventas/[id]`               | Ambos                          |
| Productos | Catálogo · Ficha del producto con movimientos · Ingreso y egreso de stock · Categorías | `/productos`, `/productos/[id]`, `/productos/categorias` | Ambos (edición: administrador) |
| Clientes  | Listado · Ficha con cuenta corriente · Registrar pago · Saldos                         | `/clientes`, `/clientes/[id]`, `/clientes/saldos`        | Ambos                          |
| Usuarios  | Listado · Alta y edición                                                               | `/usuarios`                                              | Administrador                  |

Además: `/login` como única página pública y `/perfil` para que cada usuario cambie su contraseña.

**Organización de páginas y rutas.** La aplicación debe utilizar el App Router de Next.js y su sistema de enrutamiento basado en archivos. Las páginas principales de cada módulo deben tener rutas propias y compartir, mediante un layout, la estructura general del sistema: panel lateral y barra superior. La página de inicio de sesión queda fuera de ese diseño.

Las funcionalidades del servidor deben estar disponibles a través de una API REST, implementada con Route Handlers de Next.js y especificada en la sección 11. Las rutas indicadas en este enunciado son orientativas y pueden adaptarse si se conserva la organización por módulos. Los formularios o acciones breves pueden abrirse en ventanas modales cuando resulte conveniente.

## 5. Requerimientos funcionales

Cada requerimiento tiene un código para poder citarlo en la corrección y en el README.

### Ventas

- **RF-V1 Nueva venta.** Una sola pantalla con tres partes: comprador, ítems y forma de pago. El total se recalcula en cada cambio.
- **RF-V2 Comprador.** Por defecto es *Consumidor final* y no pide datos. El vendedor puede buscar un cliente registrado por nombre o documento, o darlo de alta en el momento desde un formulario modal, sin perder la venta en curso.
- **RF-V3 Ítems.** Se busca el producto por código o descripción y se indica la cantidad. Cada renglón muestra descripción, cantidad, precio unitario y subtotal, y se puede modificar o quitar. Agregar un producto que ya está suma la cantidad al renglón existente.
- **RF-V4 Control de existencia.** Al agregar o cambiar una cantidad se muestra la existencia disponible y no se permite superarla.
- **RF-V5 Forma de pago.** Una por factura:
  - *Contado:* se ingresa el monto recibido y se muestra el vuelto.
  - *Tarjeta:* débito o crédito, marca y últimos 4 dígitos. Nunca se pide ni se guarda el número completo.
  - *Cuenta corriente:* solo para un cliente registrado y habilitado; respeta su límite de crédito.
- **RF-V6 Confirmación.** Al confirmar, el servidor vuelve a verificar el stock, asigna el número, descuenta las existencias y, si corresponde, registra el débito en la cuenta corriente. Todo en una única transacción: o se graba todo o nada.
- **RF-V7 Comprobante.** Vista imprimible con datos del comercio, número, fecha y hora, vendedor, datos del comprador, detalle, total y forma de pago.
- **RF-V8 Listado de facturas.** Filtros por rango de fechas, cliente, forma de pago y vendedor; búsqueda por número; paginado.
- **RF-V9 Anulación.** Solo el administrador, con motivo obligatorio. Reingresa el stock y, si fue en cuenta corriente, registra un crédito. La factura queda visible con estado *Anulada*.

### Productos y existencias

- **RF-P1 Catálogo.** Listado paginado con código, descripción, categoría, precio y existencia. Búsqueda por código o descripción, filtro por categoría y marca visible para los productos bajo el stock mínimo.
- **RF-P2 Alta y edición.** Código único, descripción, categoría, precio de venta y stock mínimo. La existencia no se edita a mano: el stock inicial se carga como un ingreso.
- **RF-P3 Baja.** Lógica: el producto queda inactivo y deja de ofrecerse en ventas, pero conserva su historial.
- **RF-P4 Ingreso de stock.** Cantidad y motivo, por ejemplo *Reposición* o *Stock inicial*.
- **RF-P5 Egreso de stock.** Cantidad y motivo obligatorio, por ejemplo *Rotura*, *Vencimiento* o *Ajuste de inventario*. No puede dejar la existencia en negativo.
- **RF-P6 Movimientos.** En la ficha del producto: fecha, tipo, cantidad, existencia resultante, usuario y referencia a la factura cuando la hay.
- **RF-P7 Categorías.** Alta, edición y baja simples.

### Clientes y cuenta corriente

- **RF-C1 Listado.** Búsqueda por nombre o documento, con el saldo de cada cliente.
- **RF-C2 Alta y edición.** Tipo y número de documento (DNI o CUIT, único), nombre o razón social, domicilio, teléfono, email, habilitado para cuenta corriente y límite de crédito opcional.
- **RF-C3 Ficha.** Datos del cliente, saldo actual y últimas facturas.
- **RF-C4 Cuenta corriente.** Movimientos en orden cronológico: débitos por ventas, créditos por pagos y anulaciones, con el saldo acumulado en cada renglón.
- **RF-C5 Registrar pago.** Importe, medio (efectivo, transferencia o tarjeta) y observación. Genera un recibo numerado e imprimible.
- **RF-C6 Saldos.** Clientes con deuda, ordenados de mayor a menor, con el total adeudado.
- **RF-C7 Baja.** Lógica, como en productos.

### Usuarios y acceso

- **RF-U1 Sesión.** Inicio con email y contraseña; cierre de sesión.
- **RF-U2 Protección.** Toda página y toda operación del servidor exige sesión válida, salvo `/login`.
- **RF-U3 Primer administrador.** Lo crea el script de datos iniciales.
- **RF-U4 Gestión.** El administrador da de alta, edita y desactiva usuarios y les asigna rol. Un usuario desactivado no puede entrar.
- **RF-U5 Contraseñas.** El administrador puede restablecerlas; cada usuario puede cambiar la suya.

### Inicio

- **RF-T1 Indicadores.** Ventas del día y del mes (cantidad e importe), total adeudado en cuentas corrientes y cantidad de productos bajo el mínimo.
- **RF-T2 Gráficos.** Ventas diarias de los últimos 30 días y ventas del mes por forma de pago.
- **RF-T3 Más vendidos.** Los 5 productos más vendidos del mes, por cantidad.

## 6. Reglas de negocio

Estas reglas se validan en el servidor; la interfaz puede adelantarlas para dar mejor experiencia, pero no las reemplaza.

1. **La existencia nunca es negativa.** Se controla al cargar el ítem y otra vez al confirmar. Si dos vendedores venden la última unidad al mismo tiempo, solo una factura se confirma.
2. **Todo cambio de stock deja un movimiento.** Venta, anulación, ingreso y egreso graban un movimiento en la misma transacción que actualiza la existencia. La suma de movimientos de un producto debe dar su existencia.
3. **El precio se congela.** La factura guarda el precio unitario del momento; cambiar el precio del catálogo no altera facturas emitidas.
4. **Numeración correlativa y sin huecos.** Formato `0001-00000001` (punto de venta y número). El número se asigna al confirmar, no al empezar la venta. Los recibos de pago tienen su propia numeración.
5. **Una factura confirmada no se modifica.** Solo se anula, y la anulación revierte stock y saldo.
6. **Consumidor final no compra en cuenta corriente.** Para vender a cuenta, el comprador debe ser un cliente registrado y habilitado.
7. **Saldo del cliente = débitos − créditos.** Si el cliente tiene límite de crédito, una venta a cuenta no puede dejar el saldo por encima de ese límite.
8. **Un pago no supera la deuda.** No se admiten saldos a favor.
9. **De la tarjeta solo se guardan tipo, marca y últimos 4 dígitos.**
10. **Importes exactos.** Se guardan en centavos como enteros (o como decimal), nunca como coma flotante. Se muestran en pesos con formato argentino: `$ 12.345,50`.
11. **Trazabilidad.** Facturas, movimientos de stock y pagos registran usuario y fecha y hora.
12. **Bajas lógicas.** Productos, clientes y usuarios con historial se desactivan; nunca se borran.


## 7. Modelo de datos mínimo

Es el piso, no el techo: pueden agregar tablas o campos si los justifican. Todas las tablas llevan `id` y fecha de creación; los importes van en centavos.

| Tabla                | Campos principales                                                                                                             | Relaciones y notas                                                              |
| -------------------- | ------------------------------------------------------------------------------------------------------------------------------ | ------------------------------------------------------------------------------- |
| `usuarios`           | email (único), nombre, hash de contraseña, rol, activo                                                                         | Rol: `admin` o `vendedor`                                                       |
| `categorias`         | nombre (único), activa                                                                                                         |                                                                                 |
| `productos`          | código (único), descripción, precio, existencia, stock mínimo, activo                                                          | Pertenece a una categoría                                                       |
| `movimientos_stock`  | tipo, cantidad (con signo), existencia resultante, motivo, fecha                                                               | Producto, usuario y factura opcional. Tipos: venta, anulación, ingreso, egreso  |
| `clientes`           | tipo y número de documento (único), nombre, domicilio, teléfono, email, cuenta corriente habilitada, límite de crédito, activo |                                                                                 |
| `facturas`           | punto de venta, número, fecha, total, forma de pago, datos de tarjeta, monto recibido, estado, motivo de anulación             | Cliente opcional (nulo = consumidor final) y usuario. Estado: emitida o anulada |
| `factura_items`      | cantidad, precio unitario, subtotal, descripción                                                                               | Factura y producto. La descripción se copia del catálogo                        |
| `pagos`              | número de recibo, fecha, importe, medio, observación                                                                           | Cliente y usuario                                                               |
| `movimientos_cuenta` | tipo, importe, fecha, descripción                                                                                              | Cliente y factura o pago de origen. Tipos: débito o crédito                     |

La existencia del producto y el saldo del cliente pueden guardarse como campo calculado o derivarse de sus movimientos; en ambos casos deben coincidir siempre.

## 8. Requerimientos de interfaz y calidad

La aplicación debe verse y comportarse como un producto que se le entregaría a un cliente.

**Pantallas de referencia.** Las pantallas proporcionadas son exclusivamente una referencia del contenido y la funcionalidad esperados. La interfaz debe desarrollarse con shadcn/ui y Tailwind CSS, respetando los datos, las operaciones y los flujos indicados, sin copiar el formato ni el diseño visual de las pantallas de referencia. Cada equipo debe proponer una presentación propia, profesional y consistente.

- **Aspecto profesional y consistente.** Mismos colores, tipografía, botones y espaciado en todas las pantallas. Panel lateral con el módulo activo resaltado.
- **Adaptable.** Usable desde 360 px de ancho; en pantallas chicas el panel lateral se colapsa en un menú.
- **Estados completos.** Cada listado contempla carga, vacío y error. Cada operación confirma su resultado con un aviso.
- **Validación en ambos lados.** Mensajes de error junto al campo; las mismas reglas se validan en el servidor.
- **Confirmación de acciones irreversibles.** Anular, dar de baja, desactivar.
- **Venta ágil.** La pantalla de nueva venta se puede operar con teclado: buscar, agregar con Enter, pasar al pago.
- **Formatos locales.** Moneda `$ 12.345,50`, fechas `dd/mm/aaaa` y hora de Argentina.
- **Seguridad.** Contraseñas con hash (bcrypt o argon2), sesión en cookie `httpOnly`, permisos verificados en el servidor y secretos solo en variables de entorno, nunca en el repositorio.
- **Datos de prueba.** El script de datos iniciales carga al menos 2 usuarios (uno por rol), 5 categorías, 30 productos, 10 clientes y 50 facturas repartidas en los últimos 30 días, para que el tablero muestre información desde el primer arranque.

## 9. Requerimientos técnicos

La aplicación es full stack en Next.js y usa las mismas herramientas de la cursada. Lo obligatorio no se reemplaza; lo sugerido puede cambiarse si se justifica en el README.

| Capa                    | Tecnología                                                                        | Carácter    |
| ----------------------- | --------------------------------------------------------------------------------- | ----------- |
| Lenguaje                | TypeScript                                                                        | Obligatorio |
| Framework               | Next.js con App Router y enrutamiento basado en archivos                          | Obligatorio |
| API                     | REST, implementada con Route Handlers de Next.js                                  | Obligatorio |
| Estilos                 | Tailwind CSS                                                                      | Obligatorio |
| Componentes de interfaz | shadcn/ui                                                                         | Obligatorio |
| Gráficos                | Chart.js (con `react-chartjs-2`)                                                  | Obligatorio |
| Base de datos           | SQLite en desarrollo; libSQL remota (Turso) en producción                         | Obligatorio |
| Acceso a datos          | Drizzle ORM, con migraciones de `drizzle-kit`                                     | Obligatorio |
| Validación              | Zod, compartiendo esquemas entre cliente y servidor                               | Sugerido    |
| Autenticación           | Auth.js con credenciales, o sesión propia en cookie firmada                       | Sugerido    |
| Hosting                 | Vercel                                                                            | Obligatorio |
| Control de versiones    | Git y GitHub, con commits a lo largo del desarrollo                               | Obligatorio |

**API REST.** Las operaciones del sistema se exponen mediante rutas bajo `/api`, definidas con archivos `route.ts` y los métodos HTTP correspondientes. Por ejemplo, `/api/productos` para listar y crear productos, y `/api/productos/[id]` para consultar, modificar o dar de baja un producto. Las páginas interactivas consumen la API; cada operación valida en el servidor la sesión, los permisos y las reglas de negocio que correspondan. El detalle de cada ruta está en la sección 11 y la organización del código, en la sección 10.

**Puesta en marcha local.** El proyecto debe levantar con estos comandos, sin pasos manuales adicionales:

```bash
pnpm install
cp .env.example .env
pnpm run db:migrate
pnpm run db:seed
pnpm run dev
```

**Publicación.** La aplicación debe estar publicada en Vercel, accesible mediante una URL pública y conectada a una base de datos alojada en Turso, con datos de prueba cargados. Vercel y Turso tienen planes gratuitos que alcanzan para un proyecto académico; el de Vercel es solo para uso personal y no comercial, lo que aplica a este caso.

**Uso de IA.** Se permite usar asistentes de IA. La condición es la de la defensa: cada integrante debe poder explicar y modificar cualquier parte del código entregado.

Fuentes: [planes de Turso](https://turso.tech/pricing.md) · [plan Hobby de Vercel](https://zplatform.ai/guides/is-vercel-free/)

## 10. Pautas arquitectónicas

La aplicación se organiza en capas. El principio que ordena todo es uno solo: **cada regla de negocio vive en un único lugar, la capa de servicios.** Las demás capas son adaptadores finos que no deciden, no calculan y no validan reglas.


### 10.1 Capas y responsabilidades

| Capa | Qué hace | Qué no hace |
| --- | --- | --- |
| Acceso a datos | Define el esquema, las migraciones y la conexión | No contiene reglas de negocio |
| Servicios | Valida la entrada, verifica el rol, aplica las reglas, abre las transacciones y devuelve los datos con la forma pública de la API | No conoce HTTP, cookies ni componentes |
| Adaptadores | Exigen sesión, leen parámetros y cuerpo, llaman a un servicio y traducen el resultado o el error | No repiten validaciones ni reglas |
| Interfaz | Muestra datos, adelanta validaciones y avisa resultados | No reemplaza ningún control del servidor |

### 10.2 Servicios

- Un módulo por parte del dominio: autenticación, usuarios, categorías, productos, stock, clientes, pagos, facturas y tablero.
- Cada función recibe el **usuario autenticado** y los **datos sin validar**, y sigue siempre el mismo orden: valida con el esquema, verifica el permiso, aplica las reglas y devuelve el resultado.
- Toda operación que toca más de una tabla se resuelve en **una transacción**: o se graba todo o nada.
- Cada invariante crítico pasa por **una única función**. La existencia de un producto solo cambia en `moverStock()`, que actualiza con una condición (`WHERE existencia >= ?`) y graba el movimiento en la misma transacción. Ventas, anulaciones, ingresos y egresos la llaman; ninguna modifica la existencia por su cuenta.
- Los valores derivados tienen una sola fuente de verdad: el saldo del cliente sale de sus movimientos de cuenta.
- Cada función lleva un comentario que cita el requerimiento o la regla que implementa (por ejemplo, RF-V6 o regla 2).

### 10.3 Adaptadores: API REST y Server Actions

- **Route Handlers.** Un envoltorio común exige la sesión, resuelve los parámetros, lee el JSON y convierte cualquier error al formato estándar de la sección 11.1. Con eso, cada ruta queda en pocas líneas: llamar al servicio y responder.
- **Server Actions.** Un envoltorio equivalente devuelve `{ ok, data }` o `{ ok: false, error }` en lugar de lanzar, para que el formulario muestre el error junto al campo.
- Rutas y acciones llaman a **los mismos servicios**. Si la misma lógica aparece en dos adaptadores, se mueve al servicio.

### 10.4 Validación y errores

- Los esquemas de Zod están en un módulo compartido: el servidor los usa para validar y los formularios para adelantar los mismos mensajes.
- Los esquemas de edición rechazan los campos no previstos. Así se cumple, sin código extra, que `existencia` no se acepte en un `PATCH` y que el número completo de una tarjeta se rechace.
- Los servicios lanzan una única clase de error, `ApiError(status, code, message, details)`, con los códigos de la sección 11.8. Un error inesperado se registra en el servidor y nunca llega al cliente con su detalle.

### 10.5 Sesión y permisos

- El usuario se resuelve contra la base de datos **en cada pedido**: un usuario desactivado o con otro rol pierde el acceso de inmediato, aunque conserve la cookie.
- La protección tiene tres barreras: el proxy de Next.js redirige al login si falta la cookie firmada, cada página vuelve a comprobar que haya un usuario válido y **cada servicio verifica el rol**.
- Ocultar un botón es una ayuda visual. El permiso lo decide siempre el servicio, que responde `403` aunque se llame a la API directamente.

### 10.6 Interfaz

- Las páginas de lectura son Server Components que llaman a los servicios. Búsqueda, filtros y paginado viven en la URL, de modo que un listado se puede recargar y compartir.
- Los componentes interactivos son Client Components chicos. Las mutaciones usan Server Actions; la búsqueda en vivo y la confirmación de la venta consumen la API REST.
- Un hook común resuelve los formularios: errores por campo (primero los de Zod, después los del servidor), estado de envío y aviso del resultado.
- Las pantallas se arman con componentes de shadcn/ui, primitivas de maquetación propias (apilar, alinear, grilla, texto, título) y componentes del dominio. **Las páginas no llevan etiquetas HTML sueltas**, y todo el estilo se escribe con clases de Tailwind.
- Lo que se repite se resuelve una vez: encabezado de página, estados de carga, vacío y error, confirmación de acciones irreversibles, campo con etiqueta y error, campo de importe, insignias de estado y paginador.
- Los formatos (moneda, fecha, hora, documento, numeración) están en un único módulo; los componentes no formatean por su cuenta.

### 10.7 Datos iniciales

El script de datos iniciales crea las facturas y los pagos **con los mismos servicios** que usa la aplicación. De ese modo el stock, los saldos y la numeración de los datos de prueba cumplen todas las reglas, y el script sirve además como prueba de los servicios.

### 10.8 Lista de control

En la defensa se verifica que:

1. Ninguna ruta ni Server Action contiene reglas de negocio: solo llaman a un servicio.
2. Un vendedor que llama directamente a una ruta de administrador recibe `403`.
3. Una operación compuesta que falla a mitad de camino no deja datos parciales.
4. Dos ventas simultáneas de la última unidad terminan con una sola factura confirmada.
5. La existencia de cada producto coincide con la suma de sus movimientos, y el saldo de cada cliente con sus débitos menos sus créditos.
6. El mismo esquema de Zod valida en el formulario y en el servidor.
7. Cada integrante ubica en el código dónde vive una regla dada y puede modificarla en un solo lugar.

## 11. API REST

### 11.1 Convenciones

La API vive bajo `/api`, habla JSON y la implementan Route Handlers de Next.js. Todas las reglas de negocio de la sección 6 se validan en el servidor, aunque la interfaz las adelante.

- **Formato.** Cuerpos y respuestas en JSON (`Content-Type: application/json`), con nombres de campo en camelCase.
- **Sesión.** El login deja una cookie `httpOnly` y `SameSite=Lax`. Toda ruta exige sesión salvo `POST /api/auth/login`; sin ella responde `401`.
- **Roles.** `admin` o `vendedor`. Una ruta marcada *admin* responde `403` al vendedor.
- **Importes.** Siempre enteros en centavos: `1250000` son $ 12.500,00. La API nunca devuelve importes con decimales.
- **Fechas.** Texto ISO 8601 en UTC, por ejemplo `2026-10-29T18:24:00Z`. Los filtros por día (`desde`, `hasta`) usan `AAAA-MM-DD` y se interpretan en hora de Argentina.
- **Identificadores.** Enteros. El número de factura es aparte del `id`.
- **Bajas lógicas.** No hay `DELETE` para registros con historial: se envía `PATCH` con `"activo": false`.
- **Precios desde el servidor.** Al facturar, el cliente manda productos y cantidades; precios, subtotales y total los calcula el servidor.

**Paginación.** Los listados aceptan `page` (desde 1) y `pageSize` (por defecto 20, máximo 100) y responden:

```json
{
  "data": [],
  "page": 1,
  "pageSize": 20,
  "total": 137
}
```

**Errores.** Toda respuesta de error tiene la misma forma. `details` es opcional y lleva el detalle por campo o por producto:

```json
{
  "error": {
    "code": "VALIDACION",
    "message": "Hay campos con errores.",
    "details": [{ "campo": "codigo", "mensaje": "Es obligatorio." }]
  }
}
```

### 11.2 Resumen de endpoints

Son 31 rutas. La columna Requerimiento remite a los códigos de la sección 5.

| Método | Ruta | Rol | Requerimiento |
| --- | --- | --- | --- |
| POST | `/api/auth/login` | Público | RF-U1 |
| POST | `/api/auth/logout` | Ambos | RF-U1 |
| GET | `/api/auth/me` | Ambos | RF-U2 |
| PUT | `/api/auth/password` | Ambos | RF-U5 |
| GET | `/api/usuarios` | Admin | RF-U4 |
| POST | `/api/usuarios` | Admin | RF-U4 |
| PATCH | `/api/usuarios/{id}` | Admin | RF-U4 |
| POST | `/api/usuarios/{id}/reset-password` | Admin | RF-U5 |
| GET | `/api/categorias` | Ambos | RF-P7 |
| POST | `/api/categorias` | Admin | RF-P7 |
| PATCH | `/api/categorias/{id}` | Admin | RF-P7 |
| GET | `/api/productos` | Ambos | RF-P1 |
| GET | `/api/productos/{id}` | Ambos | RF-P1 |
| POST | `/api/productos` | Admin | RF-P2 |
| PATCH | `/api/productos/{id}` | Admin | RF-P2, RF-P3 |
| GET | `/api/productos/{id}/movimientos` | Ambos | RF-P6 |
| POST | `/api/productos/{id}/movimientos` | Admin | RF-P4, RF-P5 |
| GET | `/api/movimientos-stock` | Ambos | RF-P6 |
| GET | `/api/clientes` | Ambos | RF-C1, RF-C6 |
| GET | `/api/clientes/{id}` | Ambos | RF-C3 |
| POST | `/api/clientes` | Ambos | RF-C2, RF-V2 |
| PATCH | `/api/clientes/{id}` | Ambos | RF-C2, RF-C7 |
| GET | `/api/clientes/{id}/cuenta` | Ambos | RF-C4 |
| POST | `/api/clientes/{id}/pagos` | Ambos | RF-C5 |
| GET | `/api/pagos/{id}` | Ambos | RF-C5 |
| GET | `/api/facturas` | Ambos | RF-V8 |
| GET | `/api/facturas/{id}` | Ambos | RF-V7 |
| GET | `/api/facturas/proximo-numero` | Ambos | RF-V1 |
| POST | `/api/facturas` | Ambos | RF-V1 a RF-V6 |
| POST | `/api/facturas/{id}/anulacion` | Admin | RF-V9 |
| GET | `/api/tablero` | Ambos | RF-T1 a RF-T3 |

### 11.3 Autenticación y usuarios

La sesión se abre con email y contraseña y queda en una cookie; un usuario desactivado no puede entrar.

#### POST /api/auth/login

```json
{ "email": "laura@ferreteria.test", "password": "••••••••" }
```

`200` con el usuario y la cookie de sesión en `Set-Cookie`. `401 CREDENCIALES_INVALIDAS` si el email no existe, la contraseña no coincide o el usuario está inactivo: el mensaje es el mismo en los tres casos.

```json
{ "id": 1, "nombre": "Laura Méndez", "email": "laura@ferreteria.test", "rol": "admin" }
```

#### Resto de la sesión

| Ruta | Cuerpo | Respuesta |
| --- | --- | --- |
| `POST /api/auth/logout` | — | `204`; borra la cookie |
| `GET /api/auth/me` | — | `200` con el usuario conectado; `401` sin sesión |
| `PUT /api/auth/password` | `actual`, `nueva` (mínimo 8 caracteres) | `204`; `422 CONTRASENA_ACTUAL_INCORRECTA` |

#### Usuarios (admin)

| Ruta | Cuerpo o parámetros | Respuesta |
| --- | --- | --- |
| `GET /api/usuarios` | `q`, `activo`, paginación | Lista paginada, sin el hash de contraseña |
| `POST /api/usuarios` | `nombre`, `email`, `rol`, `password` temporal | `201` con el usuario; `409 EMAIL_DUPLICADO` |
| `PATCH /api/usuarios/{id}` | Cualquiera de `nombre`, `email`, `rol`, `activo` | `200`; `422 OPERACION_SOBRE_SI_MISMO` si un admin intenta desactivarse o quitarse el rol |
| `POST /api/usuarios/{id}/reset-password` | — | `200` con `{ "passwordTemporal": "…" }`, mostrada una sola vez |

### 11.4 Productos, categorías y stock

La existencia de un producto solo cambia por movimientos: ventas, anulaciones, ingresos y egresos. Por eso `existencia` no se acepta en `POST` ni en `PATCH`.

#### Producto

```json
{
  "id": 1,
  "codigo": "HE-001",
  "descripcion": "Martillo carpintero 500 g",
  "categoria": { "id": 1, "nombre": "Herramientas" },
  "precio": 1250000,
  "existencia": 24,
  "stockMinimo": 5,
  "bajoMinimo": false,
  "activo": true
}
```

| Ruta | Cuerpo o parámetros | Respuesta |
| --- | --- | --- |
| `GET /api/productos` | `q` (código o descripción), `categoriaId`, `bajoMinimo=true`, `activo` (por defecto `true`; el admin puede pedir `todos`), paginación | Lista paginada |
| `GET /api/productos/{id}` | — | El producto; `404` |
| `POST /api/productos` | `codigo`, `descripcion`, `categoriaId`, `precio`, `stockMinimo`, `stockInicial` opcional | `201`; `409 CODIGO_DUPLICADO`. Si hay `stockInicial`, crea un movimiento de ingreso con motivo *Stock inicial* |
| `PATCH /api/productos/{id}` | Cualquiera de `codigo`, `descripcion`, `categoriaId`, `precio`, `stockMinimo`, `activo` | `200`; `409 CODIGO_DUPLICADO`; `422` si llega `existencia` |
| `GET /api/categorias` | — | Todas las categorías activas, sin paginar |
| `POST /api/categorias` | `nombre` | `201`; `409 NOMBRE_DUPLICADO` |
| `PATCH /api/categorias/{id}` | `nombre`, `activa` | `200`; `409 CATEGORIA_EN_USO` si se desactiva con productos activos |

#### POST /api/productos/{id}/movimientos (admin)

Registra un ingreso o un egreso manual. Actualiza la existencia y graba el movimiento en la misma transacción.

```json
{ "tipo": "egreso", "cantidad": 2, "motivo": "Rotura", "observacion": "Caída en depósito" }
```

- `tipo`: `ingreso` o `egreso`. `cantidad`: entero mayor que cero; el signo lo pone el servidor.
- `motivo`: para ingresos, *Reposición*, *Stock inicial* o *Devolución de cliente*; para egresos, *Rotura*, *Vencimiento*, *Ajuste de inventario* o *Uso interno*.
- `201` con el movimiento y la existencia resultante. `409 STOCK_INSUFICIENTE` si un egreso dejaría la existencia en negativo.

```json
{
  "id": 812,
  "producto": { "id": 1, "codigo": "HE-001" },
  "tipo": "egreso",
  "cantidad": -2,
  "existenciaResultante": 22,
  "motivo": "Rotura",
  "referencia": null,
  "usuario": { "id": 1, "nombre": "Laura Méndez" },
  "fecha": "2026-10-29T18:40:00Z"
}
```

#### Consultas de movimientos

`GET /api/productos/{id}/movimientos` devuelve el historial de un producto, del más nuevo al más viejo. `GET /api/movimientos-stock` devuelve el de todos, con filtros `productoId`, `tipo`, `desde` y `hasta`. Ambos paginan. En los movimientos de venta y anulación, `referencia` trae `{ "facturaId": 1233, "numero": "0001-00001233" }`.

### 11.5 Clientes, cuenta corriente y pagos

El saldo de un cliente es débitos menos créditos de su cuenta corriente; la API lo devuelve calculado y nunca lo acepta como dato.

#### Cliente

```json
{
  "id": 1,
  "tipoDoc": "DNI",
  "nroDoc": "28.456.123",
  "nombre": "Mariana López",
  "domicilio": "Las Heras 455",
  "telefono": "381 455-2210",
  "email": "mariana.lopez@correo.test",
  "cuentaCorriente": true,
  "limiteCredito": 40000000,
  "saldo": 1440000,
  "disponible": 38560000,
  "activo": true
}
```

`limiteCredito` y `disponible` valen `null` cuando el cliente no tiene límite.

| Ruta | Cuerpo o parámetros | Respuesta |
| --- | --- | --- |
| `GET /api/clientes` | `q` (nombre o número de documento, sin importar puntos ni guiones), `conDeuda=true`, `orden=saldo` o `nombre`, paginación | Lista paginada con `saldo`. Con `conDeuda=true` agrega `totalAdeudado` junto a la paginación |
| `GET /api/clientes/{id}` | — | El cliente y sus 6 últimas facturas en `ultimasFacturas` |
| `POST /api/clientes` | `tipoDoc`, `nroDoc`, `nombre`, y opcionales `domicilio`, `telefono`, `email`, `cuentaCorriente`, `limiteCredito` | `201`; `409 DOCUMENTO_DUPLICADO`. Es la misma ruta que usa el alta rápida desde Nueva venta |
| `PATCH /api/clientes/{id}` | Cualquier campo del alta, más `activo` | `200`; `422 SALDO_PENDIENTE` si se desactiva o se le quita la cuenta corriente con saldo distinto de cero |

#### GET /api/clientes/{id}/cuenta

Movimientos en orden cronológico con el saldo acumulado en cada renglón. Acepta `desde` y `hasta`; si `desde` corta el historial, `saldoAnterior` trae lo acumulado hasta ese día.

```json
{
  "cliente": { "id": 1, "nombre": "Mariana López" },
  "saldoAnterior": 0,
  "movimientos": [
    { "fecha": "2026-10-24T15:10:00Z", "tipo": "debito", "importe": 960000, "descripcion": "Factura 0001-00001223", "facturaId": 1223, "pagoId": null, "saldo": 960000 },
    { "fecha": "2026-10-25T12:00:00Z", "tipo": "credito", "importe": 500000, "descripcion": "Recibo R 0001-00000340", "facturaId": null, "pagoId": 340, "saldo": 460000 }
  ],
  "saldo": 460000
}
```

#### POST /api/clientes/{id}/pagos

Registra un pago a cuenta. Graba el pago con su número de recibo y el crédito en la cuenta corriente en una sola transacción.

```json
{ "importe": 500000, "medio": "transferencia", "observacion": "Pago parcial" }
```

- `medio`: `efectivo`, `transferencia` o `tarjeta_debito`.
- `201` con el recibo y el saldo nuevo del cliente.
- `422 PAGO_SUPERA_DEUDA` si `importe` es mayor que el saldo. `422 CUENTA_CORRIENTE_NO_HABILITADA` si el cliente no la tiene.

```json
{
  "id": 341,
  "numeroRecibo": "R 0001-00000341",
  "fecha": "2026-10-29T18:50:00Z",
  "cliente": { "id": 1, "nombre": "Mariana López" },
  "importe": 500000,
  "medio": "transferencia",
  "usuario": { "id": 2, "nombre": "Pablo Ruiz" },
  "saldoCliente": 940000
}
```

`GET /api/pagos/{id}` devuelve el mismo objeto, para reimprimir el recibo.

### 11.6 Facturas

Emitir una factura es una sola llamada que el servidor resuelve en una transacción: o se graban factura, renglones, stock y cuenta corriente, o no se graba nada.

#### POST /api/facturas

El cuerpo lleva el comprador, los productos con sus cantidades y la forma de pago. No lleva precios ni totales.

```json
{
  "clienteId": 1,
  "items": [
    { "productoId": 4, "cantidad": 1 },
    { "productoId": 1, "cantidad": 1 }
  ],
  "pago": { "forma": "cuenta_corriente" }
}
```

- `clienteId`: `null` para consumidor final.
- `items`: al menos uno, sin productos repetidos, cantidades enteras mayores que cero.
- `pago.forma`: `contado`, `tarjeta` o `cuenta_corriente`, con estos datos extra:
  - *contado*: `montoRecibido` opcional; si falta, se toma el total.
  - *tarjeta*: `tarjeta.tipo` (`debito` o `credito`), `tarjeta.marca` y `tarjeta.ultimos4` (exactamente 4 dígitos). Un campo con el número completo se rechaza con `422`.
  - *cuenta\_corriente*: sin datos extra.

**Lo que hace el servidor, en orden, dentro de la transacción:**

1. Valida el cuerpo y que los productos existan y estén activos.
2. Si hay cliente, verifica que esté activo; si el pago es en cuenta corriente, que la tenga habilitada.
3. Lee la existencia de cada producto y comprueba que alcance para la cantidad pedida.
4. Toma el precio actual de cada producto, calcula subtotales y total.
5. Si el pago es de contado, comprueba que `montoRecibido` cubra el total. Si es en cuenta corriente, que el saldo nuevo no supere el límite.
6. Asigna el próximo número correlativo.
7. Graba la factura y sus renglones, con descripción y precio copiados del catálogo.
8. Descuenta la existencia de cada producto y graba un movimiento de venta por renglón.
9. Si es en cuenta corriente, graba el débito en la cuenta del cliente.

Los pasos 3 y 8 deben ser atómicos frente a otra venta simultánea. Una forma simple en SQLite es descontar con una condición, `UPDATE productos SET existencia = existencia - ? WHERE id = ? AND existencia >= ?`, y abortar la transacción si no se modificó ninguna fila.

**Respuesta `201`:**

```json
{
  "id": 1233,
  "puntoVenta": 1,
  "numero": 1233,
  "numeroFormateado": "0001-00001233",
  "fecha": "2026-10-29T18:24:00Z",
  "estado": "emitida",
  "cliente": { "id": 1, "nombre": "Mariana López", "tipoDoc": "DNI", "nroDoc": "28.456.123", "domicilio": "Las Heras 455" },
  "vendedor": { "id": 1, "nombre": "Laura Méndez" },
  "items": [
    { "productoId": 4, "codigo": "EL-001", "descripcion": "Cinta aisladora 20 m", "cantidad": 1, "precioUnitario": 190000, "subtotal": 190000 },
    { "productoId": 1, "codigo": "HE-001", "descripcion": "Martillo carpintero 500 g", "cantidad": 1, "precioUnitario": 1250000, "subtotal": 1250000 }
  ],
  "total": 1440000,
  "pago": { "forma": "cuenta_corriente" },
  "saldoCliente": 1440000
}
```

Para contado, `pago` trae `montoRecibido` y `vuelto`; para tarjeta, `tarjeta` con tipo, marca y últimos 4 dígitos. `saldoCliente` aparece solo en ventas a cuenta corriente.

**Errores propios de esta ruta:**

| Código HTTP | `code` | Cuándo |
| --- | --- | --- |
| 409 | `STOCK_INSUFICIENTE` | Falta existencia. `details` lista `productoId`, `solicitado` y `disponible` por cada producto que falla |
| 422 | `PRODUCTO_INACTIVO` | Un producto está dado de baja |
| 422 | `CUENTA_CORRIENTE_NO_HABILITADA` | Pago a cuenta sin cliente o con un cliente que no la tiene |
| 422 | `LIMITE_CREDITO_EXCEDIDO` | El saldo nuevo supera el límite. `details` trae `saldoActual`, `limite` y `excedente` |
| 422 | `MONTO_INSUFICIENTE` | El monto recibido no cubre el total |

#### Consulta

| Ruta | Parámetros | Respuesta |
| --- | --- | --- |
| `GET /api/facturas` | `q` (número o nombre del cliente), `desde`, `hasta`, `clienteId`, `vendedorId`, `forma`, `estado`, paginación | Lista paginada, de la más nueva a la más vieja, sin renglones. Agrega `totalEmitido`: la suma de las emitidas que cumplen el filtro |
| `GET /api/facturas/{id}` | — | La factura completa, como la respuesta de emisión. Si está anulada, suma `anulacion` con fecha, usuario y motivo |
| `GET /api/facturas/proximo-numero` | — | `{ "numeroFormateado": "0001-00001234" }`. Es solo informativo: el número real se asigna al confirmar |

#### POST /api/facturas/{id}/anulacion (admin)

```json
{ "motivo": "Error en la carga de cantidades" }
```

En una transacción: marca la factura como anulada, reingresa la existencia de cada renglón con un movimiento de anulación y, si fue a cuenta corriente, graba un crédito por el total. Responde `200` con la factura actualizada. `409 FACTURA_ANULADA` si ya estaba anulada; `422 VALIDACION` si falta el motivo. La factura nunca se borra.

### 11.7 Tablero

`GET /api/tablero` devuelve en una sola respuesta todo lo que muestra la pantalla de inicio. Solo cuenta facturas emitidas; el día y el mes se calculan en hora de Argentina.

```json
{
  "hoy": { "cantidad": 3, "importe": 7500000 },
  "mes": { "cantidad": 49, "importe": 223590000, "ticketPromedio": 4563061 },
  "cuentasCorrientes": { "totalAdeudado": 6465000, "clientesConSaldo": 3 },
  "bajoMinimo": { "cantidad": 4 },
  "ventasDiarias": [
    { "fecha": "2026-09-30", "importe": 10900000 },
    { "fecha": "2026-10-01", "importe": 0 }
  ],
  "porFormaDePago": [
    { "forma": "contado", "importe": 127435000 },
    { "forma": "tarjeta", "importe": 79890000 },
    { "forma": "cuenta_corriente", "importe": 16265000 }
  ],
  "masVendidos": [
    { "productoId": 5, "codigo": "EL-002", "descripcion": "Lámpara LED 12 W", "unidades": 31, "importe": 9920000 }
  ]
}
```

- `ventasDiarias` trae siempre 30 elementos, del más viejo a hoy, con `0` en los días sin ventas: así el gráfico de Chart.js no tiene huecos.
- `porFormaDePago` y `masVendidos` (5 elementos, por unidades) son del mes en curso.
- La lista de productos para reponer sale de `GET /api/productos?bajoMinimo=true`.

### 11.8 Códigos de error

El código HTTP dice qué clase de problema hubo; `error.code` dice cuál, para que la interfaz muestre un mensaje preciso.

| HTTP | `code` | Significado |
| --- | --- | --- |
| 400 | `JSON_INVALIDO` | El cuerpo no es JSON válido |
| 401 | `NO_AUTENTICADO` | Falta la sesión o venció |
| 401 | `CREDENCIALES_INVALIDAS` | Login rechazado |
| 403 | `SIN_PERMISO` | El rol no alcanza para esta ruta |
| 404 | `NO_ENCONTRADO` | El recurso no existe |
| 409 | `CODIGO_DUPLICADO` | Código de producto repetido |
| 409 | `DOCUMENTO_DUPLICADO` | Documento de cliente repetido |
| 409 | `EMAIL_DUPLICADO` | Email de usuario repetido |
| 409 | `NOMBRE_DUPLICADO` | Nombre de categoría repetido |
| 409 | `CATEGORIA_EN_USO` | Categoría con productos activos |
| 409 | `STOCK_INSUFICIENTE` | Venta o egreso que dejaría existencia negativa |
| 409 | `FACTURA_ANULADA` | La factura ya estaba anulada |
| 422 | `VALIDACION` | Campos faltantes o inválidos; `details` por campo |
| 422 | `PRODUCTO_INACTIVO` | Venta de un producto dado de baja |
| 422 | `CUENTA_CORRIENTE_NO_HABILITADA` | Venta o pago a cuenta no permitido |
| 422 | `LIMITE_CREDITO_EXCEDIDO` | La venta supera el límite del cliente |
| 422 | `MONTO_INSUFICIENTE` | El monto recibido no cubre el total |
| 422 | `PAGO_SUPERA_DEUDA` | El pago es mayor que el saldo |
| 422 | `SALDO_PENDIENTE` | Baja o cambio de un cliente con saldo |
| 422 | `CONTRASENA_ACTUAL_INCORRECTA` | Cambio de contraseña rechazado |
| 422 | `OPERACION_SOBRE_SI_MISMO` | Un admin intenta desactivarse o quitarse el rol |
| 500 | `ERROR_INTERNO` | Falla inesperada; el detalle va al log del servidor, nunca a la respuesta |

Criterio: `409` cuando el pedido choca con el estado actual de los datos; `422` cuando el pedido está bien formado pero rompe una regla de negocio.

### 11.9 Implementación en Next.js

Cada ruta es un archivo `route.ts` dentro de `app/api`, que exporta una función por método (`GET`, `POST`, `PATCH`, `PUT`). Los segmentos fijos, como `proximo-numero`, tienen prioridad sobre `[id]`.

```text
app/api/
├── auth/
│   ├── login/route.ts
│   ├── logout/route.ts
│   ├── me/route.ts
│   └── password/route.ts
├── usuarios/
│   ├── route.ts
│   └── [id]/
│       ├── route.ts
│       └── reset-password/route.ts
├── categorias/
│   ├── route.ts
│   └── [id]/route.ts
├── productos/
│   ├── route.ts
│   └── [id]/
│       ├── route.ts
│       └── movimientos/route.ts
├── movimientos-stock/route.ts
├── clientes/
│   ├── route.ts
│   └── [id]/
│       ├── route.ts
│       ├── cuenta/route.ts
│       └── pagos/route.ts
├── pagos/[id]/route.ts
├── facturas/
│   ├── route.ts
│   ├── proximo-numero/route.ts
│   └── [id]/
│       ├── route.ts
│       └── anulacion/route.ts
└── tablero/route.ts
```

Lo común a las 31 rutas (sesión, errores, esquemas y servicios) se concentra como indica la sección 10: las rutas solo llaman al servicio y responden.

## 12. Entregables, hitos y defensa

El sistema se construye en cuatro hitos, en este orden, porque cada uno se apoya en el anterior: no hay ventas sin productos ni cuenta corriente sin clientes. Cada hito se muestra funcionando en clase antes de pasar al siguiente.

1. **Base y productos.** Proyecto creado y publicado, panel lateral, inicio de sesión, usuarios y roles, catálogo, categorías y movimientos de stock (RF-U, RF-P).
2. **Clientes.** Alta y ficha de clientes, cuenta corriente y registro de pagos con recibo (RF-C).
3. **Ventas.** Nueva venta completa con las tres formas de pago, comprobante, listado y anulación (RF-V).
4. **Cierre.** Tablero con gráficos (RF-T), datos de prueba completos, revisión de interfaz y README final.

**Entrega final**

- Enlace al repositorio de GitHub con el código fuente y el historial de commits.
- URL pública de la aplicación funcionando en Vercel y conectada a la base de datos alojada en Turso, con datos de prueba cargados.
- README con: descripción, integrantes, URL pública, pasos de instalación, variables de entorno (archivo `.env.example`), usuarios de prueba por rol

**Defensa**

- Demostración en vivo de 10 minutos sobre la URL pública: venta a consumidor final con efectivo, venta a un cliente nuevo en cuenta corriente, pago de ese cliente y anulación de una factura, verificando stock y saldo después de cada paso.
- Preguntas sobre el código a cada integrante por separado, incluida la lista de control de la sección 10.8.
- Un cambio pequeño pedido en el momento, por ejemplo un campo nuevo o una regla de validación, hecho en la máquina del alumno.
