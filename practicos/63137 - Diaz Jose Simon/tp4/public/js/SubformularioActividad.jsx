const ACTIVIDAD_VACIA = { descripcion: '', fecha: '' };
const TITULO_ALTA_ACTIVIDAD = 'Agregar actividad';
const TITULO_EDICION_ACTIVIDAD = 'Editar actividad';

function SubformularioActividad({ actividad, alGuardar, alCancelar }) {
  const estaEditando = Boolean(actividad);
  const valoresIniciales = estaEditando
    ? { descripcion: actividad.descripcion, fecha: actividad.fecha }
    : ACTIVIDAD_VACIA;
  const { datos, cambiarCampo, reiniciar } = useFormulario(valoresIniciales);

  async function guardar(evento) {
    evento.preventDefault();
    await alGuardar(datos);
    reiniciar();
  }

  function cancelar() {
    reiniciar();
    alCancelar();
  }

  return (
    <form className="subformulario" onSubmit={guardar}>
      <h3>{estaEditando ? TITULO_EDICION_ACTIVIDAD : TITULO_ALTA_ACTIVIDAD}</h3>
      <div className="botones">
        <input
          name="descripcion"
          placeholder="Descripción de la actividad"
          value={datos.descripcion}
          onChange={cambiarCampo}
          required
        />
        <input name="fecha" type="date" value={datos.fecha} onChange={cambiarCampo} />
        <button type="submit">Guardar</button>
        <button type="button" onClick={cancelar}>Cancelar</button>
      </div>
    </form>
  );
}
