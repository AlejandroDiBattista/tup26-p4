const CLASE_CLIENTE_SELECCIONADO = 'seleccionado';

function ItemCliente({ cliente, estaSeleccionado, alSeleccionar }) {
  function seleccionar() {
    alSeleccionar(cliente.id);
  }

  return (
    <li className={estaSeleccionado ? CLASE_CLIENTE_SELECCIONADO : ''} onClick={seleccionar}>
      {cliente.nombre}
      <small>{cliente.email}</small>
    </li>
  );
}

function MaestroClientes({ clientes, busqueda, alBuscar, idSeleccionado, alSeleccionar }) {
  function cambiarBusqueda(evento) {
    alBuscar(evento.target.value);
  }

  function mostrarCliente(cliente) {
    return (
      <ItemCliente
        key={cliente.id}
        cliente={cliente}
        estaSeleccionado={cliente.id === idSeleccionado}
        alSeleccionar={alSeleccionar}
      />
    );
  }

  return (
    <section className="maestro">
      <input placeholder="Buscar por cualquier campo..." value={busqueda} onChange={cambiarBusqueda} />
      <ul className="lista">{clientes.map(mostrarCliente)}</ul>
    </section>
  );
}
