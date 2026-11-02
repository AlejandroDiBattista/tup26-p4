function useFormulario(valoresIniciales) {
  const [datos, setDatos] = React.useState(valoresIniciales);

  function cambiarCampo(evento) {
    setDatos({ ...datos, [evento.target.name]: evento.target.value });
  }

  function reiniciar() {
    setDatos(valoresIniciales);
  }

  return { datos, cambiarCampo, reiniciar };
}
