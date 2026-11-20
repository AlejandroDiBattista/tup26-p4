import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

console.log('\n======================================================');
console.log('       VERIFICACIÓN AUTOMÁTICA DEL TP4 (MiniCRM)');
console.log('======================================================\n');

let errores = 0;
function assert(cond, mensaje) {
  if (cond) {
    console.log(`  ✓ ${mensaje}`);
  } else {
    console.error(`  ✗ ERROR: ${mensaje}`);
    errores++;
  }
}

async function run() {
  // 1. Verificación de archivos requeridos
  console.log('[1/5] Verificación de estructura de archivos:');
  const archivosRequeridos = [
    'package.json',
    'tsconfig.json',
    'src/db/schema.ts',
    'src/db/connection.ts',
    'src/db/seed.ts',
    'src/services/clientes.service.ts',
    'src/controllers/clientes.controller.ts',
    'src/routes/clientes.routes.ts',
    'src/server.ts',
    'public/MiniCRM.html',
    'README.md',
  ];

  for (const archivo of archivosRequeridos) {
    const existe = fs.existsSync(path.join(__dirname, archivo));
    assert(existe, `Archivo ${archivo} presente`);
  }

  // 2. Verificación de public/MiniCRM.html
  console.log('\n[2/5] Verificación de public/MiniCRM.html:');
  const html = fs.readFileSync(path.join(__dirname, 'public/MiniCRM.html'), 'utf8');
  assert(html.includes('react@18.2.0'), 'Importa React 18 desde CDN');
  assert(html.includes('react-dom@18.2.0'), 'Importa ReactDOM 18 desde CDN');
  assert(html.includes('@babel/standalone'), 'Importa Babel standalone');
  assert(html.includes('type="text/babel"'), 'Contiene bloque JSX embebido para Babel');
  assert(html.includes('overflow: hidden'), 'Layout estilo App sin desplazamiento general');
  assert(html.includes('MiniCRM'), 'Presenta el título de la aplicación MiniCRM');

  // 3. Probar lógica del servicio Clientes y Reglas de Negocio
  console.log('\n[3/5] Verificación de Capa de Negocio (Clientes Service):');
  const { initDb } = await import('./src/db/connection.js');
  const { seed } = await import('./src/db/seed.js');
  const { Clientes } = await import('./src/services/clientes.service.js');

  await initDb();
  await seed();

  const clientesIniciales = await Clientes.listar();
  assert(clientesIniciales.length >= 10, `Base sembrada correctamente (${clientesIniciales.length} clientes encontrados)`);

  // Búsqueda flexible
  const resultadoBusqueda = await Clientes.listar('martinez');
  assert(resultadoBusqueda.length > 0, `Búsqueda flexible insensible por apellido: encontró ${resultadoBusqueda.length}`);

  const resultadoCiudad = await Clientes.listar('Yerba Buena');
  assert(resultadoCiudad.length > 0, `Búsqueda flexible por localidad: encontró ${resultadoCiudad.length}`);

  // Normalización al crear cliente
  const nuevoCliente = await Clientes.crear({
    nombre: '   carlos   alberto   ',
    apellido: '  gomez   ',
    email: ' CARLOS.GOMEZ@GMAIL.COM  ',
    telefono: ' 381-1234567 ',
    localidad: ' San Miguel de Tucumán ',
    domicilio: ' Laprida 100 '
  });

  assert(nuevoCliente.nombre === 'Carlos Alberto', `Nombre normalizado: "${nuevoCliente.nombre}"`);
  assert(nuevoCliente.apellido === 'Gomez', `Apellido normalizado: "${nuevoCliente.apellido}"`);
  assert(nuevoCliente.email === 'carlos.gomez@gmail.com', `Email normalizado en minúsculas: "${nuevoCliente.email}"`);

  // CRUD de actividades y Reglas de negocio
  console.log('\n[4/5] Reglas de Negocio de Actividades:');
  const act1 = await Clientes.crearActividad(nuevoCliente.id, {
    descripcion: 'Actividad sin fecha',
    fechaCompromiso: null
  });
  assert(act1.id > 0, 'Creación de actividad sin fecha');

  const act2 = await Clientes.crearActividad(nuevoCliente.id, {
    descripcion: 'Actividad vencida',
    fechaCompromiso: '2020-01-01'
  });
  assert(act2.estaVencida === true, 'Cálculo de actividad vencida correcto');

  // Completar actividad
  const completada = await Clientes.completarActividad(nuevoCliente.id, act1.id);
  assert(completada.estaCompletada === true && completada.fechaFinalizacion !== null, 'Completar actividad asigna fecha de finalización');

  // Regla de negocio: Las completadas NO se pueden editar
  let errorEdicion = false;
  try {
    await Clientes.actualizarActividad(nuevoCliente.id, act1.id, { descripcion: 'Cambio no permitido' });
  } catch (err) {
    errorEdicion = true;
  }
  assert(errorEdicion, 'Regla de negocio: Prohibida la edición de actividades completadas');

  // Regla de negocio: Las completadas NO se pueden borrar individualmente
  let errorBorrado = false;
  try {
    await Clientes.borrarActividad(nuevoCliente.id, act1.id);
  } catch (err) {
    errorBorrado = true;
  }
  assert(errorBorrado, 'Regla de negocio: Prohibido borrar individualmente actividades completadas');

  // Eliminar cliente en cascada
  const eliminado = await Clientes.eliminar(nuevoCliente.id);
  assert(eliminado === true, 'Eliminación en cascada de cliente exitosa');
  const checkEliminado = await Clientes.obtenerPorId(nuevoCliente.id);
  assert(checkEliminado === null, 'El cliente ya no existe en la base de datos');

  // 5. Verificación de la API REST y Servidor Express
  console.log('\n[5/5] Verificación de Servidor Express y Rutas:');
  const { app } = await import('./src/server.js');
  const server = app.listen(3099, async () => {
    try {
      const resHtml = await fetch('http://localhost:3099/MiniCRM.html');
      assert(resHtml.status === 200, 'Servidor responde 200 OK para /MiniCRM.html');

      const resApi = await fetch('http://localhost:3099/api/clientes');
      const json = await resApi.json();
      assert(resApi.status === 200 && Array.isArray(json), `API REST GET /api/clientes responde array (${json.length} elementos)`);

      server.close(async () => {
        try {
          const { client } = await import('./src/db/connection.js');
          client.close();
        } catch (_) {}

        console.log('\n======================================================');
        if (errores === 0) {
          console.log('   🎉 ¡TODAS LAS PRUEBAS PASARON CON ÉXITO! (100%)');
        } else {
          console.log(`   ⚠ SE ENCONTRARON ${errores} ERRORES`);
        }
        console.log('======================================================\n');
        process.exitCode = errores === 0 ? 0 : 1;
      });
    } catch (err) {
      console.error('Error durante petición fetch:', err);
      server.close(() => {
        process.exitCode = 1;
      });
    }
  });
}

run().catch((err) => {
  console.error('Error no capturado:', err);
  process.exitCode = 1;
});

