function App() {
  const [clientes, setClientes] = React.useState([]);
  const [busqueda, setBusqueda] = React.useState('');
  const [idSeleccionado, setIdSeleccionado] = React.useState(0);

  React.useEffect(() => {
    async function buscarClientes() {
      setClientes(await pedirApi(`${RUTA_CLIENTES}?buscar=${encodeURIComponent(busqueda)}`));
    }
    buscarClientes();
  }, [busqueda]);

  return (
    <>
      <header>MiniCRM</header>
      <main>
        <MaestroClientes
          clientes={clientes}
          busqueda={busqueda}
          alBuscar={setBusqueda}
          idSeleccionado={idSeleccionado}
          alSeleccionar={setIdSeleccionado}
        />
        <section className="detalle">Seleccioná un cliente</section>
      </main>
    </>
  );
}

ReactDOM.createRoot(document.getElementById('raiz')).render(<App />);
