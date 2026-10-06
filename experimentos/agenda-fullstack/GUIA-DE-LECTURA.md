# Cómo recorrer el código en clase

## Primera idea: un mismo contacto tiene tres representaciones

**En la base:** una fila de `contactos` y varias filas de `direcciones`.
**En la API:** un objeto con un arreglo `direcciones`.
**En la interfaz:** un resumen en el maestro y un borrador editable en el detalle.

Las funciones que convierten entre esas representaciones están nombradas y
separadas. La clase puede seguirlas sin comenzar por la configuración del servidor.

## 1. Empezar por el esquema del backend

Abrir `server.mjs`, sección **1. Modelo relacional**.

`contactos` y `direcciones` describen tablas; no contienen sus filas. Detenerse en
`direcciones.contactoId`: expresa qué padre tiene cada hija. La clave foránea
protege la relación, mientras que `onDelete: 'cascade'` define qué pasa al borrar
un contacto.

No introducir todavía la función que crea las tablas ni la configuración de CORS.
Se pueden revisar cuando el grupo ya entienda el recorrido de los datos.

## 2. Leer un contacto completo

Buscar `obtenerContacto(db, id)` en la sección **2. Persistencia**.

La función consulta primero el padre, devuelve `null` si no existe, consulta luego
sus direcciones y arma el objeto anidado. El último paso hace visible la diferencia
entre la representación relacional y la representación de la API:

```js
return { ...contacto, direcciones: direccionesDelContacto };
```

La función no conoce solicitudes HTTP, códigos de respuesta ni objetos de Express.
Es la ruta la que traduce un resultado inexistente a un error `404`.

## 3. Leer la ruta HTTP que usa esa operación

Buscar `registrarRutasDeContactos` y comenzar por `GET /api/contactos/:id`.

```text
solicitud.params.id
        ↓
validarId
        ↓
obtenerContacto
        ↓
exigirContactoExistente
        ↓
respuesta.json
```

Después mirar el listado. La ruta `GET /api/contactos` valida el filtro y llama a
`buscarContactos`. No incluye la consulta SQL dentro del manejador de Express.

## 4. Mirar el frontend sin recorrer la biblioteca

Abrir `lectura/frontend.js`. Es una copia extraída del bloque `codigo-agenda` de
`index.html`, no un archivo adicional que el navegador necesite descargar.

| Sección | Pregunta que responde |
|---|---|
| Configuración y estado | ¿Qué información mantiene la pantalla? |
| Cliente REST | ¿Cómo pide o envía datos al servidor? |
| Acciones del maestro | ¿Qué pasa al escribir, seleccionar o crear un borrador? |
| Acciones del detalle | ¿Qué pasa al editar, guardar, cancelar o eliminar? |
| Vistas | ¿Cómo se representa el estado con Arrow.js? |
| Inicio | ¿Cómo se monta la pantalla y se carga la primera lista? |

`estado.contactos` alimenta el maestro. `estado.contactoEnEdicion` alimenta el
formulario. `estado.contactoOriginal` conserva una copia independiente para
cancelar cambios. No hay un objeto ambiguo llamado `s` ni un contacto llamado `c`.

## 5. Entender el cliente REST

`apiContactos` ofrece cinco operaciones con nombres del dominio:

```js
apiContactos.listar(textoBusqueda);
apiContactos.obtener(id);
apiContactos.crear(datos);
apiContactos.actualizar(id, datos);
apiContactos.eliminar(id);
```

Todas delegan en `solicitarJson`. Esa función concentra `fetch`, la serialización,
la lectura de la respuesta y los errores HTTP. También contempla `204`: no intenta
interpretar como JSON un cuerpo que no existe.

Abrir el panel «Ver comunicación REST» mientras se ejecuta cada acción permite
comparar el código con los mensajes intercambiados.

## 6. Seguir una creación de extremo a extremo

```text
+ Nuevo
  → nuevoContacto()
  → crearContactoVacio()
  → mostrarContacto()

Escribir y agregar direcciones
  → actualizarCampoContacto() / agregarDireccion()
  → cambia el borrador; todavía no hay una escritura HTTP

Guardar
  → guardarContacto()
  → extraerDatosEditables()
  → apiContactos.crear()
  → solicitarJson(): POST /api/contactos

Servidor
  → validarContacto()
  → crearContacto()
  → transacción: insertar padre e insertar hijas
  → obtenerContacto()
  → respuesta 201 con el recurso completo

Navegador
  → mostrarContacto(contactoGuardado)
  → cargarContactos(false)
```

El `false` del último paso evita que el GET de refresco reemplace la traza del POST.
No cambia qué se consulta ni dónde se buscan los datos.

## 7. Contrastar crear y actualizar

`crearContacto` inserta el padre y sus direcciones. `actualizarContacto` actualiza
el padre y reemplaza la colección de hijas. Se dejaron como dos funciones distintas:
para estudiar el CRUD no es necesario descifrar una operación genérica con ramas
ocultas para todos los casos.

En ambos casos se comparte `insertarDirecciones`. Las operaciones se ejecutan dentro
de una transacción síncrona: si falla una inserción hija, se revierten las escrituras
de esa transacción. La suite incluye un fallo SQL deliberado para comprobarlo.

**Experimento:** guardar dos direcciones, quitar una y volver a guardar. Examinar el
PUT: contiene la colección completa deseada, no una orden aislada de borrar una fila.

## 8. Leer las vistas como una composición

Empezar por `vistaAplicacion`, después `vistaMaestro` y `vistaFormulario`.

```text
vistaAplicacion
  ├── vistaMensajes
  ├── vistaMaestro
  │     └── vistaContacto, por cada resultado
  ├── vistaDetalle
  │     └── vistaFormulario
  │           ├── vistaEncabezadoDetalle
  │           ├── vistaDatosPersonales
  │           ├── vistaDirecciones
  │           │     └── vistaDireccion, por cada hija
  │           └── vistaAcciones
  └── vistaComunicacionRest
```

Las vistas producen plantillas. Los eventos llaman a acciones. Las acciones
actualizan el estado y, cuando corresponde, usan el cliente REST.

En Arrow.js, una interpolación directa representa un valor; una función permite
seguir los cambios reactivos. Comparar:

```js
html`<p>${contacto.nombre}</p>`;
html`<p>${() => estado.contactoEnEdicion?.nombre ?? ''}</p>`;
```

Las vistas del formulario leen el borrador vigente desde `estado`, para no quedar
vinculadas a un contacto anterior después de cambiar la selección o cancelar.

Las direcciones tienen una `claveLocal` para identificar sus filas visuales mientras
se edita. No es la clave primaria de SQLite y `extraerDatosEditables` no la envía al
servidor. La identidad de la fila no depende de su posición en el arreglo.

## 9. Revisar búsqueda y errores después del CRUD

`alEscribirBusqueda` programa una consulta. `cargarContactos` numera cada búsqueda
para no mostrar una respuesta antigua que llegó tarde. Las coincidencias las decide
el servidor; el navegador no filtra una copia completa de la agenda.

En el backend, `crearFiltroDeBusqueda` separa la coincidencia en datos personales
de la coincidencia en una dirección. `EXISTS` permite buscar por una hija sin
reducir el total de direcciones que devuelve el resumen del contacto.

Probar después un email inválido, una respuesta de error y Cancelar. Distinguir los
controles del navegador de la validación del servidor: la interfaz no es una
frontera de confianza.

## 10. Terminar por la infraestructura

Ahora sí recorrer las secciones finales de `server.mjs`: CORS local, control del
cuerpo JSON, manejo de errores, creación inicial de las tablas, ejemplos y arranque.

Los comentarios `#region` permiten ubicar las secciones y plegarlas en editores que
los admitan. La descripción de Drizzle y el SQL inicial no son dos operaciones CRUD:
uno describe el esquema para consultar; el otro crea físicamente las tablas nuevas.

Para una evolución del esquema en un proyecto real, el siguiente tema son las
migraciones. Para esta clase no hace falta agregar capas arquitectónicas ni dividir
la aplicación en decenas de archivos.
