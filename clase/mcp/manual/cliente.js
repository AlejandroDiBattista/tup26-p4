// Cliente MCP manual: cada mensaje se envía mediante un POST HTTP.
const url = process.env.MCP_URL ?? 'http://127.0.0.1:3000/mcp';
const version = '2025-11-25';

async function enviar(mensaje) {
  const respuesta = await fetch(url, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Accept': 'application/json, text/event-stream',
      'MCP-Protocol-Version': version
    },
    body: JSON.stringify(mensaje)
  });

  // Las notificaciones no reciben una respuesta JSON.
  if (respuesta.status === 202) return;
  return await respuesta.json();
}

// Inicializar la conexión y avisar que el cliente está listo.
console.log(`\nCLIENTE MCP MANUAL\nServidor: ${url}`);
await enviar({
  jsonrpc: '2.0', id: 1, 
  method: 'initialize',
  params: {
    protocolVersion: version,
    capabilities: {},
    clientInfo: { name: 'cliente-manual', version: '1.0.0' }
  }
});
await enviar({ jsonrpc: '2.0', method: 'notifications/initialized' });
console.log('\n══════════ CONEXIÓN INICIADA ══════════');

// Descubrir las herramientas del servidor.
const herramientas = await enviar({ jsonrpc: '2.0', id: 2, method: 'tools/list' });
console.log('\n══════════ HERRAMIENTAS DISPONIBLES ══════════');
console.log(JSON.stringify(herramientas.result.tools, null, 2));

// Invocar las herramientas con sus argumentos.
const alumno = await enviar({
  jsonrpc: '2.0', id: 3, method: 'tools/call',
  params: { name: 'traer', arguments: { id: 1 } }
});
console.log('\n══════════ TRAER ALUMNO 1 ══════════');
console.log(JSON.stringify(JSON.parse(alumno.result.content[0].text), null, 2));

const alumnos = await enviar({
  jsonrpc: '2.0', id: 4, method: 'tools/call',
  params: { name: 'listar', arguments: { filtro: 'Pérez' } }
});
console.log('\n══════════ LISTAR ALUMNOS: PÉREZ ══════════');
console.log(JSON.stringify(JSON.parse(alumnos.result.content[0].text), null, 2));

console.log('\nConsulta finalizada.');
