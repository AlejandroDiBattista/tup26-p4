import assert from 'node:assert/strict';
import { db, sqlite } from './index.js';
import { Clientes } from '../services/clientes.js';

const nombres = [
  'Ana García', 'Bruno López', 'Carla Pérez', 'Diego Ruiz', 'Elena Torres',
  'Federico Díaz', 'Gabriela Soto', 'Hugo Romero', 'Inés Castro', 'Javier Medina',
  'Laura Herrera', 'Martín Silva', 'Natalia Acosta', 'Oscar Molina', 'Paula Ríos',
  'Ramiro Vega', 'Sofía Navarro', 'Tomás Cabrera', 'Valentina Suárez', 'Walter Fernández',
];
const ciudades = ['San Miguel de Tucumán', 'Yerba Buena', 'Tafí Viejo', 'Concepción'];
const calles = ['San Martín', 'Belgrano', 'Rivadavia', 'Mitre', 'Sarmiento'];

try {
  const agregados = db.transaction(() => {
    const existentes = new Set(Clientes.listar().map(cliente => cliente.email));
    let cantidad = 0;
    for (const [indice, nombre] of nombres.entries()) {
      const email = `cliente.prueba.${indice + 1}@example.com`;
      if (existentes.has(email)) continue;
      Clientes.crear({
        nombre, email, telefono: `381000${String(indice + 1).padStart(4, '0')}`,
        direccion: `${calles[indice % calles.length]} ${100 + indice * 25}`,
        ciudad: ciudades[indice % ciudades.length],
      });
      cantidad++;
    }
    const emails = new Set(Clientes.listar().map(cliente => cliente.email));
    assert.ok(nombres.every((_, indice) => emails.has(`cliente.prueba.${indice + 1}@example.com`)),
      'Deben estar presentes los 20 clientes de prueba.');
    return cantidad;
  });
  console.log(`${agregados} clientes de prueba agregados. Los clientes existentes se conservaron.`);
} finally {
  sqlite.close();
}
