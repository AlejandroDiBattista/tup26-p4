import {prepararBase,client} from './index.js';
await prepararBase(); client.close(); console.log('Base SQLite preparada.');
