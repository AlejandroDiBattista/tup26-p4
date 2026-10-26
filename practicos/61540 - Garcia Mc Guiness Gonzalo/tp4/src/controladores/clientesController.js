const { Clientes } = require("../servicios/Clientes");

async function listar(request, response) {
  response.json(await Clientes.obtenerTodos(request.query.busqueda));
}

async function obtener(request, response) {
  response.json(await Clientes.obtenerPorId(request.params.id));
}

async function crear(request, response) {
  response.status(201).json(await Clientes.crear(request.body));
}

async function actualizar(request, response) {
  response.json(
    await Clientes.actualizar(request.params.id, request.body),
  );
}

async function eliminar(request, response) {
  await Clientes.eliminar(request.params.id);
  response.status(204).end();
}

async function listarActividades(request, response) {
  response.json(await Clientes.obtenerActividades(request.params.id));
}

async function crearActividad(request, response) {
  response
    .status(201)
    .json(await Clientes.crearActividad(request.params.id, request.body));
}

module.exports = {
  actualizar,
  crear,
  crearActividad,
  eliminar,
  listar,
  listarActividades,
  obtener,
};
