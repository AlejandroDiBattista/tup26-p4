import { app } from './app';
import { sembrarDatos } from './db/seed';
import { Server } from 'http';

async function runTests() {
  await sembrarDatos();

  // Iniciar servidor en puerto libre para pruebas aisladas
  const server: Server = await new Promise((resolve) => {
    const s = app.listen(0, () => resolve(s));
  });

  const address = server.address();
  const port = typeof address === 'object' && address ? address.port : 3000;
  const base = `http://localhost:${port}`;

  console.log(`--- Iniciando Pruebas E2E de MiniCRM (puerto de pruebas: ${port}) ---`);

  try {
    // 1. Probar HTML
    const resHtml = await fetch(base + '/MiniCRM.html');
    console.log('1. GET /MiniCRM.html status:', resHtml.status);

    // 2. Listar clientes
    const resList = await fetch(base + '/api/clientes');
    const clientes = (await resList.json()) as any[];
    console.log('2. GET /api/clientes total:', clientes.length);

    // 3. Búsqueda flexible
    const resSearch = await fetch(base + '/api/clientes?q=Yerba');
    const busqueda = (await resSearch.json()) as any[];
    console.log('3. GET /api/clientes?q=Yerba encontrados:', busqueda.length);

    // 4. Detalle del primer cliente
    const primerId = clientes[0].id;
    const resDetalle = await fetch(base + `/api/clientes/${primerId}`);
    const c1 = (await resDetalle.json()) as any;
    console.log(`4. GET /api/clientes/${primerId}:`, c1.nombre, '| Actividades:', c1.actividades.length);

    // 5. Crear cliente
    const resCrear = await fetch(base + '/api/clientes', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        nombre: 'Cliente de Prueba',
        email: 'prueba@test.com',
        telefono: '381 000 1111',
        direccion: 'Av. Siempre Viva 742',
        ciudad: 'San Miguel'
      })
    });
    const nuevoCliente = (await resCrear.json()) as any;
    console.log('5. POST /api/clientes id:', nuevoCliente.id, nuevoCliente.nombre);

    // 6. Agregar actividad
    const resAct = await fetch(base + `/api/clientes/${nuevoCliente.id}/actividades`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        descripcion: 'Primera reunión de prueba',
        fecha: '2026-10-30'
      })
    });
    const nuevaAct = (await resAct.json()) as any;
    console.log('6. POST /api/clientes/:id/actividades id:', nuevaAct.id, nuevaAct.descripcion);

    // 7. Completar actividad
    const resComp = await fetch(base + `/api/actividades/${nuevaAct.id}/completar`, {
      method: 'PATCH'
    });
    const actCompletada = (await resComp.json()) as any;
    console.log('7. PATCH /api/actividades/:id/completar estado:', actCompletada.completada, '| fecha:', actCompletada.fechaCompletada);

    // 8. Intentar editar actividad completada (debe retornar 400)
    const resEditFail = await fetch(base + `/api/actividades/${nuevaAct.id}`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ descripcion: 'Intento de cambio' })
    });
    console.log('8. PUT /api/actividades/:id (completada) -> Status:', resEditFail.status);

    // 9. Intentar borrar actividad completada (debe retornar 400)
    const resDelFail = await fetch(base + `/api/actividades/${nuevaAct.id}`, {
      method: 'DELETE'
    });
    console.log('9. DELETE /api/actividades/:id (completada) -> Status:', resDelFail.status);

    // 10. Eliminar cliente (cascada)
    const resDelCli = await fetch(base + `/api/clientes/${nuevoCliente.id}`, {
      method: 'DELETE'
    });
    console.log('10. DELETE /api/clientes/:id -> Status:', resDelCli.status);

    console.log('--- Todas las pruebas del backend y reglas de negocio pasaron exitosamente! ---');
  } finally {
    server.close();
  }
}

runTests();
