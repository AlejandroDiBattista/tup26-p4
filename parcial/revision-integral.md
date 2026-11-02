# Revisión integral — Segundo parcial

## Dictamen

El alcance definido es adecuado para un proyecto integrador de ventas, stock y cuenta corriente. El modelo de siete entidades de negocio alcanza para ese alcance, y la API cubre las operaciones obligatorias. Se corrigieron omisiones en el contrato y se ampliaron las simulaciones del mockup para representar los recorridos principales.

El HTML integrado es la referencia de entrega. El mockup no implementa una aplicación real: no autentica, no llama a la API, no persiste, no modifica saldos ni existencias. Las pruebas del prototipo no certifican transacciones, permisos o concurrencia de una implementación futura.

## Cobertura contrastada

| Funcionalidad | Mockup | API | Datos y reglas |
| --- | --- | --- | --- |
| Acceso y cierre de sesión | Pantalla de acceso y salida simulada | POST, GET y DELETE /api/sesion | Usuario activo; almacén de sesiones del framework |
| Administración de usuarios | Lista, alta y edición con perfil y estado | GET/POST usuarios; GET/PATCH usuario | Acceso único, hash de contraseña, administrador |
| Catálogo | Lista, búsqueda, alta, edición y desactivación | GET/POST productos; GET/PATCH producto | Producto, código único, precio positivo |
| Stock | Lista, formulario de entrada/salida y validación de disponibilidad | GET/POST movimientos-stock | Movimiento, origen, cantidad; stock actualizado atómicamente |
| Clientes | Lista, búsqueda, alta, edición | GET/POST clientes; GET/PATCH cliente | Cliente y al menos un contacto |
| Preparación de venta | Agregar, quitar y cambiar cantidades; total calculado | GET productos y clientes; borrador local | Solo productos activos y cantidades enteras |
| Cliente durante la venta | Alta temporal y selección sin perder el borrador | POST clientes y luego POST ventas | cliente_id opcional; cuenta corriente exige cliente |
| Confirmación y comprobante | Confirmación simulada; detalles históricos e impresión | POST ventas; GET ventas y venta | Venta, detalles y movimientos en una transacción |
| Cuenta corriente | Cuenta de los tres clientes; caso sin deuda | GET cliente/cuenta-corriente | Saldo derivado de ventas a crédito menos pagos |
| Pago | Formulario para el cliente seleccionado; límite según su saldo | POST cliente/pagos | Pago positivo; serializar validación y registro |

## Correcciones realizadas en esta revisión

- Se agregó el acceso simulado y se completó la preparación del borrador de venta, que antes era una tabla fija.
- Se reemplazaron los mensajes de cuenta corriente de dos clientes por vistas con datos y estado vacío. El pago usa el cliente y saldo seleccionados; se deshabilita cuando no hay deuda.
- El alta de cliente desde una venta selecciona temporalmente al nuevo cliente sin perder los productos.
- La salida manual valida el stock de ejemplo; la búsqueda de productos y clientes ignora acentos.
- Se documentaron permisos de toda la API, campos de PATCH, campos asignados por el servidor, fechas con zona, validación y normalización de búsquedas.
- El listado y detalle de clientes incluyen el saldo calculado que necesita la interfaz. Los movimientos incluyen nombre de producto y referencia al detalle de venta.
- Se definieron inicialización del administrador, protección de sesiones y CSRF, y el rechazo de desactivar al último administrador activo.
- Se alinearon los importes del modelo con los centavos enteros de la API. Se documentaron claves, unicidad, estados, origen del stock y restricciones entre registros.
- Se aclararon los límites del parcial: una empresa, depósito y moneda; sin pagos mixtos, anulación, devoluciones ni edición de operaciones confirmadas. Los roles configurables son opcionales; administrador y operador son la distinción básica.
- Se mantuvieron sincronizados el enunciado y la API en Markdown con su contenido dentro del HTML.

## Casos de aceptación para evaluar la implementación real

1. Crear un producto con 5 unidades; vender 2 y comprobar stock 3, un comprobante y su salida de stock.
2. Intentar vender 4 de las 3 restantes: rechazar sin guardar venta, deuda ni movimientos parciales.
3. Enviar dos ventas concurrentes que excedan juntas el stock: solo deben completarse las que puedan descontarlo sin dejarlo negativo.
4. Crear un cliente mientras se prepara una venta y continuar con los mismos productos.
5. Vender en cuenta corriente y registrar un pago parcial; comprobar saldo y cronología. Rechazar un pago excesivo y dos pagos concurrentes que superen juntos el saldo.
6. Cambiar el precio o nombre del producto y los datos del cliente: el comprobante anterior debe conservar sus datos.
7. Desactivar un producto: desaparece de las opciones de nueva venta, pero sigue en el historial.
8. Un operador no puede administrar usuarios aunque llame directamente a la API. Un usuario inactivo no puede seguir usando su sesión.
9. Cerrar sesión e intentar una operación protegida: debe responder 401. Reiniciar el servidor y comprobar que los datos de negocio permanecen.
10. Verificar el flujo en la aplicación local y publicada, con HTTPS y base persistente en producción.

## Límites del prototipo y decisiones docentes pendientes

La confirmación de formularios solo muestra mensajes; salvo el borrador y el cliente temporal de una venta, no altera las listas. La impresión depende del diálogo del navegador. La creación del administrador, la base de datos, los permisos y las transacciones deben implementarse en el proyecto del alumno.

Todavía deben definirse la fecha, modalidad individual o grupal, política de uso de IA y ponderación de la evaluación. No se agregaron fechas ni porcentajes inventados.

## Verificación realizada

- Se analizaron los destinos de navegación y los identificadores del HTML: sin destinos inexistentes ni IDs duplicados.
- Los 21 ejemplos JSON son válidos y coinciden entre la documentación Markdown y la sección API del HTML.
- Se comprobaron por cálculo los subtotales y totales de las tres ventas de ejemplo y los saldos de las tres cuentas.
- Se validó la sintaxis JavaScript de los dos HTML.
- En el navegador: agregar unidades actualiza el total; dar de alta un cliente desde la venta conserva el borrador y habilita cuenta corriente; un cliente sin deuda no permite abrir un pago; el formulario del otro cliente usa su saldo correcto y rechaza importes superiores; una salida de 4 unidades con stock 3 muestra el error correspondiente.
- Se revisó la pantalla de acceso y la vista de venta en escritorio y ancho móvil; se corrigió un desbordamiento del selector y la distribución de la tabla. No se observaron errores de consola durante los recorridos comprobados.
- Se sincronizó también el HTML de mockup independiente con las pantallas del archivo integrado.

No se ejecutaron pruebas de backend porque no existe una implementación de la API en este material. Tampoco se hizo una impresión física ni una prueba en dispositivo móvil real.

Para las convenciones HTTP y de sesión se contrastaron [RFC 5789](https://www.rfc-editor.org/rfc/rfc5789), la [guía de sesiones de OWASP](https://cheatsheetseries.owasp.org/cheatsheets/Session_Management_Cheat_Sheet.html) y la [guía CSRF de OWASP](https://cheatsheetseries.owasp.org/cheatsheets/Cross-Site_Request_Forgery_Prevention_Cheat_Sheet.html).
