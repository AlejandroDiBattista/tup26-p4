import { Client } from '@modelcontextprotocol/sdk/client/index.js';
import { StreamableHTTPClientTransport } from '@modelcontextprotocol/sdk/client/streamableHttp.js';

const url = process.env.MCP_URL ?? 'http://127.0.0.1:3000/mcp';
const cliente = new Client({ name: 'cliente-sdk', version: '1.0.0' });
const transporte = new StreamableHTTPClientTransport(new URL(url));

// El SDK inicializa la conexión y envía la notificación de cliente listo.
console.log(`\nCLIENTE MCP CON SDK\nServidor: ${url}`);
await cliente.connect(transporte);
console.log('\n══════════ CONEXIÓN INICIADA ══════════');

// Descubrir las herramientas que ofrece el servidor.
const herramientas = await cliente.listTools();
console.log('\n══════════ HERRAMIENTAS DISPONIBLES ══════════');
console.log(JSON.stringify(herramientas.tools, null, 2));

// Invocar las mismas herramientas que usa el cliente manual.
const alumno = await cliente.callTool({ name: 'traer', arguments: { id: 1 } });
console.log('\n══════════ TRAER ALUMNO 1 ══════════');
console.log(JSON.stringify(JSON.parse(alumno.content[0].text), null, 2));

const alumnos = await cliente.callTool({ name: 'listar', arguments: { filtro: 'Pérez' } });
console.log('\n══════════ LISTAR ALUMNOS: PÉREZ ══════════');
console.log(JSON.stringify(JSON.parse(alumnos.content[0].text), null, 2));

await cliente.close();
console.log('\nConsulta finalizada.');
