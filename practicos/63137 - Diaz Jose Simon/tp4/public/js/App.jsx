const SIN_SELECCION = 0;

function App() {
  const [clientes, setClientes] = React.useState([]);
  const [busqueda, setBusqueda] = React.useState('');
  const [idSeleccionado, setIdSeleccionado] = React.useState(SIN_SELECCION);
  const [agregando, setAgregando] = React.useState(false);

  async function buscarClientes() {
    setClientes(await ClientesApi.listar(busqueda));
  }

  function buscarAlCambiarBusqueda() {
    buscarClientes();
  }

  React.useEffect(buscarAlCambiarBusqueda, [busqueda]);

  function seleccionar(id) {
    setAgregando(false);
    setIdSeleccionado(id);
  }

  function empezarAlta() {
    setAgregando(true);
    setIdSeleccionado(SIN_SELECCION);
  }

  function cancelarAlta() {
    setAgregando(false);
  }

  async function agregar(datos) {
    const cliente = await ClientesApi.crear(datos);
    seleccionar(cliente.id);
    await buscarClientes();
  }

  async function quitarSeleccionado() {
    setIdSeleccionado(SIN_SELECCION);
    await buscarClientes();
  }

  function mostrarDetalle() {
    if (agregando) return <FormularioCliente alGuardar={agregar} alCancelar={cancelarAlta} />;
    if (idSeleccionado === SIN_SELECCION) return <p>Seleccioná un cliente</p>;
    return <DetalleCliente id={idSeleccionado} alCambiar={buscarClientes} alEliminar={quitarSeleccionado} />;
  }

  return (
    <>
      <header>MiniCRM</header>
      <main>
        <MaestroClientes
          clientes={clientes}
          busqueda={busqueda}
          alBuscar={setBusqueda}
          idSeleccionado={idSeleccionado}
          alSeleccionar={seleccionar}
          alAgregar={empezarAlta}
        />
        <section className="detalle">{mostrarDetalle()}</section>
      </main>
    </>
  );
}

ReactDOM.createRoot(document.getElementById('raiz')).render(<App />);
