# Segundo parcial — Sistema de ventas y gestión comercial

## Objetivo

Desarrollar una aplicación web que permita gestionar las ventas de un comercio, su catálogo de productos, las existencias y las cuentas corrientes de sus clientes.

El sistema debe integrar estas funciones: al realizar una venta, debe registrar un comprobante, descontar las existencias correspondientes y, si la venta se realiza en cuenta corriente, registrar la deuda del cliente.

La aplicación debe contar con una interfaz clara y profesional, una base de datos persistente y una versión publicada en internet.

## Funcionalidades requeridas

### 1. Ventas y facturación

El sistema debe permitir registrar una venta con los siguientes datos:

- **Cliente:** consumidor final o un cliente registrado. Si la persona no está registrada, debe poder darse de alta durante la venta y seleccionarse sin perder los datos ya cargados.
- **Productos:** uno o más productos del catálogo, indicando la cantidad de cada uno.
- **Detalle:** descripción, cantidad, precio unitario y subtotal de cada producto.
- **Total:** suma de los subtotales.
- **Forma de pago:** contado, tarjeta o cuenta corriente.

Mientras se prepara la venta, se deben poder agregar y quitar productos y modificar sus cantidades. Los subtotales y el total se actualizan con esos cambios.

Antes de confirmar la venta, el sistema debe verificar que haya existencias suficientes de todos los productos. Si falta stock, debe informar el problema y permitir corregir la venta.

Al confirmar una venta, el sistema debe:

1. Registrar un comprobante con un número único, fecha, cliente, detalle, total y forma de pago.
2. Descontar del stock las cantidades vendidas.
3. Si la venta es en cuenta corriente, registrar la deuda en la cuenta del cliente.

La venta en cuenta corriente solo está disponible para clientes registrados. La operación debe ser completa: si la venta no puede confirmarse, no deben quedar descontadas las existencias ni generada la deuda.

El sistema debe permitir consultar el listado de ventas y ver el detalle de cada comprobante. Los datos de una venta registrada deben conservarse tal como eran en ese momento, aunque luego se modifiquen los precios, los nombres de los productos o los datos del cliente.

> **Alcance de la facturación:** el comprobante es una representación interna para este ejercicio. No se requiere integración con ARCA ni emisión de comprobantes fiscales. El pago con tarjeta se registra de manera simulada: no se deben solicitar ni almacenar números de tarjeta.

### 2. Productos y stock

El sistema debe permitir:

- Dar de alta, consultar y modificar productos.
- Buscar productos por nombre o código.
- Registrar para cada producto, como mínimo, código, nombre, precio de venta, stock actual y estado activo o inactivo.
- Registrar entradas y salidas manuales de stock, indicando cantidad y motivo.
- Consultar los movimientos de stock, distinguiendo los ajustes manuales de las ventas.

El código de producto debe ser único, el precio debe ser positivo y las cantidades se manejan en unidades enteras. El stock inicial se registra como una entrada, si es mayor que cero.

Las cantidades de los movimientos deben ser positivas y el stock no puede quedar negativo. Un producto inactivo no debe poder agregarse a nuevas ventas, pero debe seguir apareciendo en los comprobantes anteriores.

### 3. Clientes y cuentas corrientes

El sistema debe permitir dar de alta, consultar y modificar clientes, así como buscarlos por nombre o documento.

Para cada cliente se deben registrar, como mínimo, nombre y apellido o razón social, documento o identificación y algún dato de contacto.

Cada cliente debe tener una cuenta corriente en la que se pueda:

- Consultar el saldo adeudado.
- Ver las ventas realizadas en cuenta corriente.
- Registrar pagos, indicando fecha, importe y una observación opcional.
- Consultar el historial de movimientos.

El saldo se calcula como la suma de las ventas en cuenta corriente menos los pagos registrados. No se deben admitir pagos mayores que el saldo adeudado. Las ventas pagadas de contado o con tarjeta no generan deuda.

### 4. Usuarios y acceso

La aplicación debe requerir inicio de sesión para acceder a sus funciones y permitir cerrar la sesión.

Debe existir un usuario administrador que pueda crear usuarios para operar el sistema. Como mínimo, cada usuario tendrá nombre, nombre de acceso o correo, contraseña y estado activo o inactivo. Un usuario inactivo no podrá iniciar sesión.

La administración de usuarios (consulta, alta, edición y activación o desactivación) está reservada al administrador. Los demás usuarios pueden operar ventas, productos, clientes, stock y pagos. Los permisos deben verificarse en el servidor.

Las contraseñas no deben almacenarse en texto plano. Los datos de acceso necesarios para evaluar el sistema deben estar documentados en la entrega.

### 5. Interfaz

La aplicación debe presentar una estructura integrada, con navegación entre sus módulos. Se sugiere un menú lateral con las siguientes secciones:

- Ventas.
- Productos y stock.
- Clientes y cuentas corrientes.
- Administración de usuarios.

La interfaz debe ser coherente, legible y adaptable a distintos tamaños de pantalla. Debe informar errores y confirmaciones de manera clara, validar los datos ingresados y facilitar las tareas habituales del usuario.

## Alcance del ejercicio

- Una única empresa, un único depósito y una única moneda: pesos argentinos.
- Una sola forma de pago por venta; sin pagos combinados, cuotas, intereses ni asignación de un pago a una factura concreta. Los pagos reducen el saldo global del cliente.
- Sin impuestos, descuentos, devoluciones ni anulación o edición de ventas y pagos confirmados. Los comprobantes y movimientos se conservan como historial.
- La baja de productos y usuarios es lógica (estado inactivo). No se requiere eliminar clientes.
- La distinción básica entre administrador y operador es necesaria. Los roles y permisos configurables, los gráficos y la impresión son mejoras opcionales.
- El mockup ilustra pantallas y flujos con datos ficticios; sus simulaciones no sustituyen la persistencia, la autenticación ni las validaciones del servidor.

## Requerimientos técnicos

- Desarrollar una aplicación web utilizando **JavaScript o TypeScript** y **React**. Se puede utilizar **Next.js** o una solución equivalente que cumpla con los requisitos.
- Implementar la lógica del servidor y el acceso a datos de manera que las validaciones importantes —por ejemplo, la disponibilidad de stock y el registro de la venta— también se realicen en el servidor.
- Utilizar una **base de datos persistente** para productos, clientes, ventas, movimientos de stock, cuentas corrientes y usuarios.
- Organizar el proyecto separando claramente la interfaz, la lógica de la aplicación y el acceso a los datos.
- Publicar la aplicación y su base de datos de manera que el sistema pueda utilizarse desde internet y conserve la información entre sesiones.
- Se pueden utilizar bibliotecas y herramientas como Tailwind CSS, Drizzle y Chart.js cuando resulten apropiadas.

## Entrega

Se debe presentar:

1. El **código fuente completo** del proyecto.
2. Un archivo `README.md` que incluya:
   - Una descripción de la aplicación y las tecnologías utilizadas.
   - Las instrucciones para instalarla y ejecutarla localmente.
   - La configuración necesaria para conectar la base de datos, crear las tablas e inicializar el primer administrador.
   - El enlace a la aplicación publicada.
   - Los datos de acceso para la evaluación.
   - Las funcionalidades implementadas y, si corresponde, las pendientes.
3. La aplicación funcionando tanto en la máquina de desarrollo como en su versión publicada.

La aplicación publicada debe contar con datos de ejemplo suficientes para probar sus principales funciones. Las credenciales privadas y las claves de acceso a servicios no deben incluirse en el código fuente.

## Criterios de evaluación

Se evaluarán especialmente:

- El cumplimiento y funcionamiento de los módulos solicitados.
- La correcta integración entre ventas, stock y cuentas corrientes.
- La persistencia y consistencia de los datos.
- Las validaciones y el manejo de errores.
- La claridad y organización del código.
- La calidad y facilidad de uso de la interfaz.
- La documentación y el funcionamiento de la versión publicada.
- La capacidad de explicar y defender las decisiones tomadas.

## Funcionalidades opcionales

Una vez completados los requisitos principales, se pueden incorporar mejoras como:

- Un panel inicial con indicadores de ventas, productos con stock bajo y saldos pendientes.
- Gráficos de ventas mediante Chart.js.
- Filtros de ventas por fecha, cliente o forma de pago.
- Impresión del comprobante.
- Roles adicionales y permisos configurables.
