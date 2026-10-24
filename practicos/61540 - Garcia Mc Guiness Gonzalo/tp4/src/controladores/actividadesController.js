const { Clientes } = require("../servicios/Clientes");

async function actualizar(request, response) {
  response.json(
    await Clientes.actualizarActividad(request.params.id, request.body),
  );
}

async function completar(request, response) {
  response.json(await Clientes.completarActividad(request.params.id));
}

async function eliminar(request, response) {
  await Clientes.eliminarActividad(request.params.id);
  response.status(204).end();
}

module.exports = { actualizar, completar, eliminar };
