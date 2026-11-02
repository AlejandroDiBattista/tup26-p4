const RUTA_CLIENTES = '/clientes';

async function pedirApi(ruta, metodo = 'GET', datos) {
  const respuesta = await fetch(`/api${ruta}`, {
    method: metodo,
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(datos),
  });
  const texto = await respuesta.text();
  const contenido = texto ? JSON.parse(texto) : null;
  if (!respuesta.ok) throw new Error(contenido.error);
  return contenido;
}

class ClientesApi {
  static listar(texto) {
    return pedirApi(`${RUTA_CLIENTES}?buscar=${encodeURIComponent(texto)}`);
  }

  static obtener(id) {
    return pedirApi(`${RUTA_CLIENTES}/${id}`);
  }

  static crear(datos) {
    return pedirApi(RUTA_CLIENTES, 'POST', datos);
  }

  static actualizar(id, datos) {
    return pedirApi(`${RUTA_CLIENTES}/${id}`, 'PUT', datos);
  }

  static eliminar(id) {
    return pedirApi(`${RUTA_CLIENTES}/${id}`, 'DELETE');
  }
}
