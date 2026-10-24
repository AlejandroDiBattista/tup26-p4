import { db } from './db';

const clientes = await db.query.clientes.findMany({ with: { actividades: true } });
console.log(`MiniCRM: ${clientes.length} clientes en la base`);
