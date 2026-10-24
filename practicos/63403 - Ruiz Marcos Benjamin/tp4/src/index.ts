import { db } from './db';

const resultado = await db.run('select 1');
console.log('MiniCRM: conexión a SQLite OK', resultado.rows);
