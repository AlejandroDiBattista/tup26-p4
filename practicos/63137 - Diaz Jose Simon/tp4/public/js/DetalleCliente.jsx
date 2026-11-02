function DetalleCliente({ id, alCambiar, alEliminar }) {
  const [cliente, setCliente] = React.useState(null);
  const [editando, setEditando] = React.useState(false);

  async function cargarCliente() {
    setCliente(await ClientesApi.obtener(id));
  }

  function cargarAlCambiarCliente() {
    setEditando(false);
    cargarCliente();
  }

  React.useEffect(cargarAlCambiarCliente, [id]);

  function empezarEdicion() {
    setEditando(true);
  }

  function cancelarEdicion() {
    setEditando(false);
  }

  async function guardar(datos) {
    await ClientesApi.actualizar(id, datos);
    setEditando(false);
    await cargarCliente();
    alCambiar();
  }

  async function eliminar() {
    if (!confirm(`¿Eliminar a ${cliente.nombre}?`)) return;
    await ClientesApi.eliminar(id);
    alEliminar();
  }

  if (!cliente) return null;

  if (editando) {
    return <FormularioCliente clienteInicial={cliente} alGuardar={guardar} alCancelar={cancelarEdicion} />;
  }

  return (
    <div className="ficha">
      <h2>{cliente.nombre}</h2>
      <p>{cliente.email}</p>
      <p>{cliente.telefono}</p>
      <p>{cliente.direccion}</p>
      <div className="botones">
        <button type="button" onClick={empezarEdicion}>Editar</button>
        <button type="button" className="peligro" onClick={eliminar}>Eliminar</button>
      </div>
      <SeccionActividades clienteId={id} actividades={cliente.actividades} alCambiar={cargarCliente} />
    </div>
  );
}
