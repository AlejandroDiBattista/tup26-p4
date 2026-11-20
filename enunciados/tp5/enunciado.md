# Segundo parcial: sistema de gestión comercial

## Consigna

El segundo parcial consiste en desarrollar un sistema comercial completo: facturación, control de stock y cuenta corriente de clientes. El sistema debe cumplir el documento de requerimientos del parcial.

El trabajo se desarrolla en grupos de 3 integrantes, con ayuda de un agente de inteligencia artificial, y se defiende en forma individual. Usar IA está permitido, pero cada integrante tiene que poder explicar y modificar cualquier parte del código entregado.

## Pasos

1. **Formar el grupo.** Armen un grupo de 3 integrantes.
2. **Informar el grupo.** Avisen por WhatsApp quiénes lo forman, con su número de legajo. Por ejemplo: `El grupo 1 lo formamos 55555, 55556 y 55557`.
3. **Desarrollar.** Creen un repositorio en GitHub y desarrollen el sistema con un agente de IA (Claude Code, Codex, OpenCode u otro). Hagan commits a lo largo del desarrollo, no uno solo al final.
4. **Probar en local.** Verifiquen que el sistema funcione en sus computadoras siguiendo los pasos de instalación del README.
5. **Publicar.** Publiquen el sistema en la web con Vercel y la base de datos en Turso, con datos de prueba cargados.
6. **Probar en línea.** Verifiquen el funcionamiento completo sobre la URL pública.
7. **Entregar.** Un representante del grupo envía por WhatsApp la dirección del repositorio de GitHub y la del sitio publicado.

## Defensa

A cada grupo se le asigna un día y una hora. El grupo se presenta completo, con una computadora con el sistema funcionando y en condiciones de modificarlo en el momento.

Cada integrante, por separado:

- responde preguntas sobre el sistema, mostrando en el código dónde está lo que se le pregunta;
- realiza un cambio pequeño pedido en el momento y muestra que funciona.

### Ejemplos de preguntas

**Base de datos**

- ¿Dónde se definen las tablas de la base de datos?
- ¿Dónde se conecta la aplicación con la base de datos? ¿Cómo sabe si usar la base local o la de Turso?
- ¿Cómo se crea una tabla nueva o se agrega un campo? ¿Qué es una migración y dónde están?
- ¿Dónde se cargan los datos de prueba?
- ¿Cómo se guardan los importes? ¿Por qué no se usan números con coma flotante?
- ¿La existencia de un producto se guarda o se calcula? ¿Y el saldo de un cliente?
- ¿Qué tablas se modifican cuando se confirma una factura?

**API REST**

- ¿Dónde se expone la API REST para agregar un producto?
- ¿Qué responde la API si se carga un producto con un código que ya existe?
- ¿Dónde se verifica que el usuario haya iniciado sesión antes de atender un pedido?
- ¿Qué pasa si un vendedor llama directamente a una ruta de administrador? Muéstrenlo.
- ¿Dónde se arma la respuesta de error que devuelve la API?
- ¿Por qué el cliente no envía el precio ni el total al crear una factura?

**Reglas de negocio**

- ¿Dónde se verifica que el stock no quede negativo?
- ¿Qué pasa si dos vendedores venden la última unidad al mismo tiempo?
- ¿Dónde se asegura que una factura se grabe completa o no se grabe nada?
- ¿Dónde se asigna el número de factura? ¿Cómo se evita que queden números salteados?
- Si se cambia el precio de un producto, ¿qué pasa con las facturas ya emitidas? ¿Por qué?
- ¿Dónde se impide vender en cuenta corriente a un consumidor final?
- ¿Dónde se controla el límite de crédito de un cliente?
- ¿Dónde se impide registrar un pago mayor que la deuda?
- ¿Qué hace el sistema cuando se anula una factura?
- ¿Dónde queda registrado cada movimiento de stock?

**Seguridad y permisos**

- ¿En qué parte se ingresa el número de tarjeta de crédito? (Pista: revisen qué datos de la tarjeta se guardan).
- ¿Cómo se guardan las contraseñas?
- ¿Dónde se verifica el rol del usuario? ¿Alcanza con ocultar el botón?
- ¿Dónde está el secreto que firma la sesión? ¿Por qué no está en el repositorio?
- Si se desactiva a un usuario que tiene la sesión abierta, ¿qué pasa?

**Interfaz**

- ¿Dónde se define el panel lateral que comparten todas las pantallas?
- ¿Dónde se da formato a los importes y a las fechas?
- ¿Dónde se validan los datos de un formulario? ¿Se usan las mismas reglas en el servidor?
- ¿Cómo se agrega un producto a la venta usando solo el teclado?
- ¿Qué muestra un listado mientras carga, cuando está vacío o cuando falla?

**Publicación**

- ¿Qué variables de entorno necesita el sistema en producción y dónde se cargan?
- ¿Cómo se crearon las tablas en Turso?
- ¿Cómo se comprueba que el sitio publicado usa la base de Turso y no una local?

**Uso de inteligencia artificial**

- ¿Qué agente usaron y para qué partes del sistema?
- Muestren algo que el agente hizo mal y cómo lo corrigieron.

### Ejemplos de cambios pequeños

- Agregar el campo «marca» a los productos y mostrarlo en el catálogo.
- Agregar «Mercado Pago» como medio de pago de la cuenta corriente.
- Impedir que una venta tenga más de 50 unidades de un mismo producto.
- Exigir que el teléfono de un cliente tenga al menos 8 dígitos, en el formulario y en el servidor.
- Agregar una columna al listado de facturas.
- Cambiar el punto de venta de la numeración a `0002`.


## Definicion del sistema.
- [Funcionalidad](./requerimientos.md)
- [Pantallas](./pantallas.html)
