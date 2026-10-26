const { useEffect, useState } = React;
const { createRoot } = ReactDOM;

const esMcp = location.pathname.includes('mcp');

function App() {
  const [clientes, setClientes] = useState([]);
  const [cliente, setCliente] = useState(null);
  const [actividades, setActividades] = useState([]);
  const [busqueda, setBusqueda] = useState('');
  const [edicionCliente, setEdicionCliente] = useState(null);
  const [edicionActividad, setEdicionActividad] = useState(null);
  const [error, setError] = useState('');
  const [cargando, setCargando] = useState(true);

  async function pedirApi(url, opciones = {}) {
    const respuesta = await fetch(url, {
      ...opciones,
      headers: { 'Content-Type': 'application/json', ...opciones.headers },
    });
    const datos = await respuesta.json();
    if (!respuesta.ok)
      throw Error(datos.error || 'No se pudo completar la operación.');
    return datos;
  }

  async function herramienta(nombre, argumentos = {}) {
    const respuesta = await fetch('/mcp', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Accept: 'application/json, text/event-stream',
      },
      body: JSON.stringify({
        jsonrpc: '2.0',
        id: crypto.randomUUID(),
        method: 'tools/call',
        params: { name: nombre, arguments: argumentos },
      }),
    });
    const texto = await respuesta.text();
    const linea = texto.split('\n').find((parte) => parte.startsWith('data: '));
    const mensaje = JSON.parse(linea ? linea.slice(6) : texto);
    if (mensaje.error) throw Error(mensaje.error.message);
    const resultado = mensaje.result;
    if (resultado?.isError)
      throw Error(resultado.content?.[0]?.text || 'Error del servidor MCP.');
    return JSON.parse(resultado.content?.[0]?.text || 'null');
  }

  const ejecutar = (nombre, argumentos, url, opciones) =>
    esMcp ? herramienta(nombre, argumentos) : pedirApi(url, opciones);

  async function cargarClientes(texto = busqueda) {
    setCargando(true);
    try {
      const datos = esMcp
        ? await herramienta(
            texto ? 'clientes_buscar' : 'clientes_listar',
            texto ? { texto } : {},
          )
        : await pedirApi(
            '/api/clientes' + (texto ? `?q=${encodeURIComponent(texto)}` : ''),
          );
      const lista = Array.isArray(datos) ? datos : datos ? [datos] : [];
      setClientes(lista);
      if (cliente)
        setCliente(lista.find((actual) => actual.id === cliente.id) || null);
    } catch (e) {
      setError(e.message);
    } finally {
      setCargando(false);
    }
  }

  async function cargarActividades(actual = cliente) {
    if (!actual) return;
    try {
      const datos = esMcp
        ? await herramienta('actividades_listar', { clienteId: actual.id })
        : await pedirApi(`/api/clientes/${actual.id}/actividades`);
      setActividades(datos);
    } catch (e) {
      setError(e.message);
    }
  }

  useEffect(() => {
    cargarClientes('');
  }, []);
  useEffect(() => {
    if (cliente) cargarActividades(cliente);
    else setActividades([]);
  }, [cliente]);
  useEffect(() => {
    const temporizador = setTimeout(() => cargarClientes(busqueda), 180);
    return () => clearTimeout(temporizador);
  }, [busqueda]);

  async function guardarCliente(evento) {
    evento.preventDefault();
    setError('');
    const datos = Object.fromEntries(new FormData(evento.currentTarget));
    const id = edicionCliente?.id;
    try {
      const guardado = await ejecutar(
        id ? 'clientes_actualizar' : 'clientes_crear',
        id ? { id, ...datos } : { ...datos, telefono: datos.telefono || null },
        id ? `/api/clientes/${id}` : '/api/clientes',
        { method: id ? 'PUT' : 'POST', body: JSON.stringify(datos) },
      );
      setEdicionCliente(null);
      await cargarClientes();
      setCliente(guardado);
    } catch (e) {
      setError(e.message);
    }
  }

  async function guardarActividad(evento) {
    evento.preventDefault();
    setError('');
    const datos = Object.fromEntries(new FormData(evento.currentTarget));
    const id = edicionActividad?.id;
    const argumentos = id
      ? { clienteId: cliente.id, id, ...datos }
      : {
          clienteId: cliente.id,
          ...datos,
          fechaCompromiso: datos.fechaCompromiso || null,
        };
    try {
      await ejecutar(
        id ? 'actividades_actualizar' : 'actividades_crear',
        argumentos,
        `/api/clientes/${cliente.id}/actividades${id ? `/${id}` : ''}`,
        { method: id ? 'PUT' : 'POST', body: JSON.stringify(datos) },
      );
      setEdicionActividad(null);
      await cargarActividades();
    } catch (e) {
      setError(e.message);
    }
  }

  async function cambiarActividad(id, accion) {
    setError('');
    try {
      const url = `/api/clientes/${cliente.id}/actividades/${id}`;
      await ejecutar(
        `actividades_${accion}`,
        { clienteId: cliente.id, id },
        accion === 'completar' ? `${url}/completar` : url,
        { method: accion === 'completar' ? 'POST' : 'DELETE' },
      );
      await cargarActividades();
    } catch (e) {
      setError(e.message);
    }
  }

  const pendiente = (actividad) => !actividad.fechaFinalizacion;
  const hoy = new Intl.DateTimeFormat('sv-SE', {
    timeZone: 'America/Argentina/Tucuman',
  }).format(new Date());
  const pendientes = actividades.filter(pendiente).sort((a, b) => {
    const grupo = (x) =>
      !x.fechaCompromiso ? 0 : x.fechaCompromiso < hoy ? 1 : 2;
    return (
      grupo(a) - grupo(b) ||
      (a.fechaCompromiso || '').localeCompare(b.fechaCompromiso || '')
    );
  });
  const completadas = actividades.filter((actividad) => !pendiente(actividad));
  const etiquetaFecha = (actividad) =>
    actividad.fechaFinalizacion
      ? `Completada ${new Date(actividad.fechaFinalizacion).toLocaleString('es-AR')}`
      : actividad.fechaCompromiso
        ? `Compromiso ${actividad.fechaCompromiso}`
        : 'Sin compromiso';

  function filaActividad(actividad) {
    return (
      <div className="activity" key={actividad.id}>
        <input
          type="checkbox"
          checked={!pendiente(actividad)}
          disabled={!pendiente(actividad)}
          aria-label={`Completar ${actividad.descripcion}`}
          onChange={() => cambiarActividad(actividad.id, 'completar')}
        />
        <div>
          <strong>{actividad.descripcion}</strong>
          <small>{etiquetaFecha(actividad)}</small>
        </div>
        {pendiente(actividad) && (
          <div className="activityTools">
            <button
              aria-label={`Editar ${actividad.descripcion}`}
              title="Editar"
              onClick={() => setEdicionActividad(actividad)}
            >
              ✎
            </button>
            <button
              aria-label={`Borrar ${actividad.descripcion}`}
              title="Borrar"
              onClick={() => cambiarActividad(actividad.id, 'eliminar')}
            >
              ×
            </button>
          </div>
        )}
      </div>
    );
  }

  return (
    <main className="app">
      <aside className="panel master">
        <p className="brand">Lazo · gestión de clientes</p>
        <h1>Clientes</h1>
        <input
          className="search"
          value={busqueda}
          onChange={(evento) => setBusqueda(evento.target.value)}
          placeholder="Buscar en cualquier campo…"
          aria-label="Buscar clientes"
        />
        <div className="list">
          {cargando ? (
            <p className="loading">Cargando…</p>
          ) : clientes.length ? (
            clientes.map((item) => (
              <button
                key={item.id}
                className={`person ${cliente?.id === item.id ? 'active' : ''}`}
                onClick={() => {
                  setCliente(item);
                  setEdicionCliente(null);
                }}
              >
                <strong>
                  {item.apellido}, {item.nombre}
                </strong>
                <small>{item.email}</small>
              </button>
            ))
          ) : (
            <p className="empty">No hay clientes para mostrar.</p>
          )}
        </div>
      </aside>
      <section className="panel detail">
        {cliente ? (
          <>
            <header className="detailHead">
              <span className="eyebrow">Ficha de cliente</span>
              <span className="id">#{cliente.id}</span>
              <h2>
                {cliente.nombre} {cliente.apellido}
              </h2>
              <div className="email">
                {cliente.email}
                {cliente.telefono ? ` · ${cliente.telefono}` : ''}
              </div>
              <div className="actions">
                <button
                  className="button"
                  onClick={() => setEdicionCliente(cliente)}
                >
                  Editar
                </button>
                <button
                  className="button"
                  onClick={() => setEdicionCliente({})}
                >
                  Agregar cliente
                </button>
              </div>
            </header>
            <div className="content">
              {error && (
                <div className="notice" role="alert">
                  {error}
                </div>
              )}
              {edicionCliente && (
                <form className="form" onSubmit={guardarCliente}>
                  <input
                    name="nombre"
                    placeholder="Nombre"
                    defaultValue={edicionCliente.nombre || ''}
                    required
                    aria-label="Nombre"
                  />
                  <input
                    name="apellido"
                    placeholder="Apellido"
                    defaultValue={edicionCliente.apellido || ''}
                    required
                    aria-label="Apellido"
                  />
                  <input
                    className="wide"
                    name="email"
                    type="email"
                    placeholder="Email"
                    defaultValue={edicionCliente.email || ''}
                    required
                    aria-label="Email"
                  />
                  <input
                    className="wide"
                    name="telefono"
                    placeholder="Teléfono"
                    defaultValue={edicionCliente.telefono || ''}
                    aria-label="Teléfono"
                  />
                  <div className="formButtons">
                    <button className="button primary">Guardar</button>
                    <button
                      type="button"
                      className="button"
                      onClick={() => setEdicionCliente(null)}
                    >
                      Cancelar
                    </button>
                  </div>
                </form>
              )}
              {!edicionCliente && (
                <form className="inline" onSubmit={guardarActividad}>
                  <input
                    name="descripcion"
                    placeholder="Nueva actividad…"
                    defaultValue={edicionActividad?.descripcion || ''}
                    required
                    aria-label="Descripción de actividad"
                  />
                  <input
                    type="date"
                    name="fechaCompromiso"
                    defaultValue={edicionActividad?.fechaCompromiso || ''}
                    aria-label="Fecha de compromiso"
                  />
                  <button
                    className="button primary icon"
                    aria-label="Guardar actividad"
                    title="Guardar"
                  >
                    ✓
                  </button>
                  <button
                    type="button"
                    className="button icon"
                    aria-label="Cancelar edición"
                    title="Cancelar"
                    onClick={() => setEdicionActividad(null)}
                  >
                    ×
                  </button>
                </form>
              )}
              <h3 className="sectionTitle">Compromisos</h3>
              {pendientes.length ? (
                pendientes.map(filaActividad)
              ) : (
                <p className="empty">Sin compromisos pendientes.</p>
              )}
              <h3 className="sectionTitle">Actividades completadas</h3>
              {completadas.length ? (
                completadas.map(filaActividad)
              ) : (
                <p className="empty">Sin actividades completadas.</p>
              )}
            </div>
          </>
        ) : (
          <p className="loading">Seleccioná un cliente para ver su ficha.</p>
        )}
      </section>
    </main>
  );
}

createRoot(document.getElementById('root')).render(<App />);
