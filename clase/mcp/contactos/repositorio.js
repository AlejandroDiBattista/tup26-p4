import { readFileSync, writeFileSync, renameSync, rmSync } from 'node:fs';
import { randomUUID } from 'node:crypto';
import { fileURLToPath } from 'node:url';
import { z } from 'zod';
import { contacto, datosContacto, cambiosContacto, idContacto } from './esquemas.js';

// El repositorio es independiente de MCP y concentra el acceso al JSON.
export class RepositorioContactos {
  constructor(archivo = new URL('./contactos.json', import.meta.url)) {
    this.archivo = archivo instanceof URL ? fileURLToPath(archivo) : archivo;
  }

  leer() {
    let texto;
    try {
      texto = readFileSync(this.archivo, 'utf8');
    } catch (error) {
      if (error.code === 'ENOENT') return [];
      throw error;
    }
    // Un archivo inválido produce un error; nunca se reemplaza por una lista vacía.
    const contactos = z.array(contacto).parse(JSON.parse(texto));
    if (new Set(contactos.map(contacto => contacto.id)).size !== contactos.length) {
      throw new Error('El archivo contiene IDs de contactos repetidos');
    }
    return contactos;
  }

  guardar(contactos) {
    const temporal = `${this.archivo}.${randomUUID()}.tmp`;
    try {
      writeFileSync(temporal, JSON.stringify(contactos, null, 2) + '\n', { flag: 'wx' });
      // Reemplazar el archivo completo evita dejar un JSON escrito a medias.
      renameSync(temporal, this.archivo);
    } finally {
      rmSync(temporal, { force: true });
    }
  }

  listar(filtro = '') {
    const texto = filtro.trim().toLocaleLowerCase('es');
    return this.leer().filter(contacto => Object.values(contacto).some(
      valor => String(valor).toLocaleLowerCase('es').includes(texto)
    ));
  }

  traer(id) {
    idContacto.parse(id);
    const contacto = this.leer().find(contacto => contacto.id === id);
    if (!contacto) throw new Error(`No existe un contacto con ID ${id}`);
    return contacto;
  }

  agregar(datos) {
    const nuevosDatos = datosContacto.parse(datos);
    const contactos = this.leer();
    const id = contactos.reduce((mayor, contacto) => Math.max(mayor, contacto.id), 0) + 1;
    const nuevo = contacto.parse({ id, ...nuevosDatos });
    contactos.push(nuevo);
    this.guardar(contactos);
    return nuevo;
  }

  actualizar(id, datos) {
    idContacto.parse(id);
    const cambios = cambiosContacto.parse(datos);
    const contactos = this.leer();
    const indice = contactos.findIndex(contacto => contacto.id === id);
    if (indice === -1) throw new Error(`No existe un contacto con ID ${id}`);
    contactos[indice] = contacto.parse({ ...contactos[indice], ...cambios });
    this.guardar(contactos);
    return contactos[indice];
  }

  eliminar(id) {
    idContacto.parse(id);
    const contactos = this.leer();
    const indice = contactos.findIndex(contacto => contacto.id === id);
    if (indice === -1) throw new Error(`No existe un contacto con ID ${id}`);
    const [eliminado] = contactos.splice(indice, 1);
    this.guardar(contactos);
    return eliminado;
  }
}
