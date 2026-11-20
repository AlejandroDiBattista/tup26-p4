class ErrorAplicacion extends Error {
  constructor(mensaje, estado = 400) {
    super(mensaje);
    this.name = "ErrorAplicacion";
    this.estado = estado;
  }
}

module.exports = { ErrorAplicacion };
