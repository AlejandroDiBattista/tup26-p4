const API = 'http://localhost:3000/api';

let fallas = 0;

async function pedir(metodo: string, ruta: string, datos?: unknown) {
  const respuesta = await fetch(API + ruta, {
    method: metodo,
    headers: { 'Content-Type': 'application/json' },
    body: datos === undefined ? undefined : JSON.stringify(datos),
  });

  const texto = await respuesta.text();
  return { estado: respuesta.status, cuerpo: texto ? JSON.parse(texto) : null };
}

function revisar(titulo: string, esperado: number, obtenido: number, detalle = '') {
  const ok = esperado === obtenido;
  if (!ok) fallas++;
  console.log(`${ok ? '✅' : '❌'} ${titulo}: ${obtenido} (esperaba ${esperado}) ${detalle}`);
}

console.log('--- Clientes ---');

const alta = await pedir('POST', '/clientes', {
  nombre: 'Zoe Prueba',
  email: 'zoe@prueba.com',
  ciudad: 'Tucumán',
});
revisar('Crear cliente', 201, alta.estado, `id=${alta.cuerpo?.id}`);

const id = alta.cuerpo.id;

const sinNombre = await pedir('POST', '/clientes', { email: 'x@x.com' });
revisar('Crear sin nombre', 400, sinNombre.estado, `"${sinNombre.cuerpo?.error}"`);

const leido = await pedir('GET', `/clientes/${id}`);
revisar('Obtener cliente', 200, leido.estado, `nombre="${leido.cuerpo?.nombre}"`);

const editado = await pedir('PUT', `/clientes/${id}`, { ciudad: 'Yerba Buena' });
revisar('Editar cliente', 200, editado.estado, `ciudad="${editado.cuerpo?.ciudad}"`);

const buscado = await pedir('GET', '/clientes?q=zoe');
revisar('Buscar "zoe"', 200, buscado.estado, `encontrados=${buscado.cuerpo?.length}`);

console.log('\n--- Actividades ---');

const actividad = await pedir('POST', `/clientes/${id}/actividades`, {
  descripcion: 'Llamar para presentarse',
  fecha: '2026-10-30',
});
revisar('Crear actividad', 201, actividad.estado, `id=${actividad.cuerpo?.id}`);

const idAct = actividad.cuerpo.id;

const editadaAct = await pedir('PUT', `/actividades/${idAct}`, {
  descripcion: 'Llamar y enviar catálogo',
});
revisar('Editar actividad', 200, editadaAct.estado, `"${editadaAct.cuerpo?.descripcion}"`);

const completada = await pedir('POST', `/actividades/${idAct}/completar`);
revisar('Completar actividad', 200, completada.estado, `completadaEl=${completada.cuerpo?.completadaEl}`);

console.log('\n--- Reglas de negocio ---');

const editarCompletada = await pedir('PUT', `/actividades/${idAct}`, { descripcion: 'No debería poder' });
revisar('Editar una completada', 409, editarCompletada.estado, `"${editarCompletada.cuerpo?.error}"`);

const borrarCompletada = await pedir('DELETE', `/actividades/${idAct}`);
revisar('Borrar una completada', 409, borrarCompletada.estado, `"${borrarCompletada.cuerpo?.error}"`);

const recompletar = await pedir('POST', `/actividades/${idAct}/completar`);
revisar('Completar dos veces', 409, recompletar.estado, `"${recompletar.cuerpo?.error}"`);

console.log('\n--- Borrado en cascada ---');

const borrado = await pedir('DELETE', `/clientes/${id}`);
revisar('Eliminar cliente', 204, borrado.estado);

const yaNoEsta = await pedir('GET', `/clientes/${id}`);
revisar('El cliente ya no existe', 404, yaNoEsta.estado);

const actHuerfana = await pedir('PUT', `/actividades/${idAct}`, { descripcion: 'x' });
revisar('Su actividad tampoco', 404, actHuerfana.estado);

console.log(`\n${fallas === 0 ? '✅ Todas las pruebas pasaron.' : `❌ ${fallas} prueba(s) fallaron.`}`);

export {};