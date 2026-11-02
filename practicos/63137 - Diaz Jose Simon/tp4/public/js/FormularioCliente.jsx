const CAMPOS_CLIENTE = [
  { nombre: 'nombre', etiqueta: 'Nombre' },
  { nombre: 'email', etiqueta: 'Email' },
  { nombre: 'telefono', etiqueta: 'Teléfono' },
  { nombre: 'direccion', etiqueta: 'Dirección' },
];

function tomarCamposCliente(cliente) {
  const datos = {};
  for (const campo of CAMPOS_CLIENTE) {
    datos[campo.nombre] = cliente[campo.nombre] ?? '';
  }
  return datos;
}

function FormularioCliente({ clienteInicial = {}, alGuardar, alCancelar }) {
  const { datos, cambiarCampo } = useFormulario(tomarCamposCliente(clienteInicial));

  function guardar(evento) {
    evento.preventDefault();
    alGuardar(datos);
  }

  function mostrarCampo(campo) {
    return (
      <label key={campo.nombre}>
        {campo.etiqueta}
        <input name={campo.nombre} value={datos[campo.nombre]} onChange={cambiarCampo} />
      </label>
    );
  }

  return (
    <form className="formulario" onSubmit={guardar}>
      {CAMPOS_CLIENTE.map(mostrarCampo)}
      <div className="botones">
        <button type="submit">Guardar</button>
        <button type="button" onClick={alCancelar}>Cancelar</button>
      </div>
    </form>
  );
}
