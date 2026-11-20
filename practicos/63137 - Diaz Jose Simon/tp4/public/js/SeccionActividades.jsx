const SIN_FECHA = 'Sin fecha';
const CLAVE_ACTIVIDAD_NUEVA = 0;

function estaPendiente(actividad) {
  return !actividad.completada;
}

function estaCompletada(actividad) {
  return actividad.completada;
}

function ItemCompromiso({ actividad, alCompletar, alEditar, alEliminar }) {
  function completar() {
    alCompletar(actividad.id);
  }

  function editar() {
    alEditar(actividad);
  }

  function eliminar() {
    alEliminar(actividad.id);
  }

  return (
    <li>
      <input type="checkbox" checked={false} onChange={completar} />
      <span>
        {actividad.descripcion}
        <small>{actividad.fecha || SIN_FECHA}</small>
      </span>
      <button type="button" onClick={editar}>Editar</button>
      <button type="button" className="peligro" onClick={eliminar}>Eliminar</button>
    </li>
  );
}

function ItemCompletada({ actividad }) {
  return (
    <li className="completada">
      <input type="checkbox" checked disabled />
      <span>
        {actividad.descripcion}
        <small>{actividad.fecha || SIN_FECHA}</small>
      </span>
    </li>
  );
}

function SeccionActividades({ clienteId, actividades, alCambiar }) {
  const [actividadEnEdicion, setActividadEnEdicion] = React.useState(null);
  const claveSubformulario = actividadEnEdicion ? actividadEnEdicion.id : CLAVE_ACTIVIDAD_NUEVA;

  async function guardar(datos) {
    if (actividadEnEdicion) {
      await ActividadesApi.actualizar(actividadEnEdicion.id, datos);
    } else {
      await ActividadesApi.crear(clienteId, datos);
    }
    setActividadEnEdicion(null);
    await alCambiar();
  }

  function cancelarEdicion() {
    setActividadEnEdicion(null);
  }

  async function completar(id) {
    await ActividadesApi.completar(id);
    await alCambiar();
  }

  async function eliminar(id) {
    await ActividadesApi.eliminar(id);
    await alCambiar();
  }

  function mostrarCompromiso(actividad) {
    return (
      <ItemCompromiso
        key={actividad.id}
        actividad={actividad}
        alCompletar={completar}
        alEditar={setActividadEnEdicion}
        alEliminar={eliminar}
      />
    );
  }

  function mostrarCompletada(actividad) {
    return <ItemCompletada key={actividad.id} actividad={actividad} />;
  }

  return (
    <>
      <SubformularioActividad
        key={claveSubformulario}
        actividad={actividadEnEdicion}
        alGuardar={guardar}
        alCancelar={cancelarEdicion}
      />
      <div className="actividades">
        <h3>Compromisos</h3>
        <ul className="lista-actividades">{actividades.filter(estaPendiente).map(mostrarCompromiso)}</ul>
        <h3>Actividades completadas</h3>
        <ul className="lista-actividades">{actividades.filter(estaCompletada).map(mostrarCompletada)}</ul>
      </div>
    </>
  );
}
