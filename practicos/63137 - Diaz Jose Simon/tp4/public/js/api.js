const RUTA_CLIENTES = '/clientes';
const RUTA_ACTIVIDADES = '/actividades';
const PREFIJO_API = '/api';
const ACCION_COMPLETAR = '/completar';

async function pedirApi(ruta, metodo = 'GET', datos) {
  const respuesta = await fetch(`${PREFIJO_API}${ruta}`, {
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

class ActividadesApi {
  static crear(clienteId, datos) {
    return pedirApi(`${RUTA_CLIENTES}/${clienteId}${RUTA_ACTIVIDADES}`, 'POST', datos);
  }

  static actualizar(id, datos) {
    return pedirApi(`${RUTA_ACTIVIDADES}/${id}`, 'PUT', datos);
  }

  static completar(id) {
    return pedirApi(`${RUTA_ACTIVIDADES}/${id}${ACCION_COMPLETAR}`, 'PATCH');
  }

  static eliminar(id) {
    return pedirApi(`${RUTA_ACTIVIDADES}/${id}`, 'DELETE');
  }
}
