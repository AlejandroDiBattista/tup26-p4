import { ErrorServicio } from './errores.js';
import type { NuevoCliente, NuevaActividad } from './db/schema.js';

const espacios = (valor: string) => valor.normalize('NFC').trim().replace(/\s+/g, ' ');

export function normalizarCliente(datos: Partial<Omit<NuevoCliente, 'id'>>) {
  const resultado: Partial<Omit<NuevoCliente, 'id'>> = {};
  for (const campo of ['nombre', 'apellido', 'domicilio', 'localidad'] as const) {
    const valor = datos[campo];
    if (valor === undefined) continue;
    if (campo === 'nombre' || campo === 'apellido') {
      if (!valor?.trim()) throw new ErrorServicio(`${campo} es obligatorio.`);
      resultado[campo] = espacios(valor).toLocaleLowerCase('es-AR')
        .replace(/(^|[\s'-])\p{L}/gu, (letra) => letra.toLocaleUpperCase('es-AR'));
    } else {
      resultado[campo] = valor ? espacios(valor) || null : null;
    }
  }
  if (datos.email !== undefined) {
    const email = datos.email.trim().toLowerCase();
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) throw new ErrorServicio('Email inválido. Ingresá una dirección como nombre@ejemplo.com.');
    resultado.email = email;
  }
  if (datos.telefono !== undefined) {
    const telefono = datos.telefono?.trim() ?? '';
    if (telefono && !/^\+?[\d\s().-]+$/.test(telefono)) throw new ErrorServicio('Teléfono inválido. Usá números; podés incluir +, espacios, guiones o paréntesis.');
    const digitos = telefono.replace(/\D/g, '');
    if (telefono && !digitos) throw new ErrorServicio('Teléfono inválido. Usá números; podés incluir +, espacios, guiones o paréntesis.');
    resultado.telefono = digitos ? (telefono.startsWith('+') ? '+' : '') + digitos : null;
  }
  return resultado;
}

export function normalizarActividad(datos: Partial<Pick<NuevaActividad, 'descripcion' | 'fechaCompromiso' | 'fechaFinalizacion'>>) {
  const resultado: typeof datos = {};
  if (datos.descripcion !== undefined) {
    if (!datos.descripcion.trim()) throw new ErrorServicio('La descripción es obligatoria.');
    resultado.descripcion = espacios(datos.descripcion);
  }
  for (const campo of ['fechaCompromiso', 'fechaFinalizacion'] as const) {
    const fecha = datos[campo];
    if (fecha === undefined) continue;
    if (fecha !== null && (!/^\d{4}-\d{2}-\d{2}$/.test(fecha)
      || Number.isNaN(Date.parse(fecha)) || new Date(fecha).toISOString().slice(0, 10) !== fecha)) {
      throw new ErrorServicio(`${campo} debe ser una fecha válida YYYY-MM-DD o null.`);
    }
    resultado[campo] = fecha;
  }
  return resultado;
}
