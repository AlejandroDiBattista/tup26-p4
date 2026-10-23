import { databaseConfig } from '../config.js';
import { connect } from './connection.js';
import { sembrar } from './seed.js';

const connection = connect(databaseConfig());

try {
  await sembrar(connection.db);
  console.log('Carga inicial completa (sin duplicados).');
} finally {
  connection.close();
}
