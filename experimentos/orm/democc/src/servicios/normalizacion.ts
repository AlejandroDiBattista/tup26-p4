import { DatosInvalidos } from './errores';

const vacio = (valor: unknown) => valor === undefined || valor === null || valor === '';

/** Texto obligatorio, sin espacios sobrantes. */
export function normalizarTexto(valor: unknown, campo: string): string {
  if (typeof valor !== 'string' || !valor.trim()) {
    throw new DatosInvalidos(`El campo ${campo} es obligatorio.`);
  }
  return valor.trim().replace(/\s+/g, ' ');
}

/** "maría  JOSÉ" → "María José". */
export function normalizarNombre(valor: unknown, campo: string): string {
  return normalizarTexto(valor, campo)
    .toLocaleLowerCase('es-AR')
    .replace(/(^|[\s'-])(\p{L})/gu, (_, separador, letra) => separador + letra.toLocaleUpperCase('es-AR'));
}

/** "  Ana@Mail.COM " → "ana@mail.com". */
export function normalizarEmail(valor: unknown): string {
  const email = normalizarTexto(valor, 'email').toLowerCase();
  if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
    throw new DatosInvalidos(`El email "${email}" no es válido.`);
  }
  return email;
}

/**
 * Teléfono argentino en formato E.164: +54 y 10 dígitos (código de área y número).
 * Los celulares llevan un 9 después del 54: "0381 15-512-3456" → "+5493815123456".
 */
export function normalizarTelefono(valor: unknown): string | null {
  if (vacio(valor)) return null;
  if (typeof valor !== 'string') throw new DatosInvalidos('El teléfono debe ser un texto.');

  let digitos = valor.replace(/\D/g, '');
  let celular = false;

  if (digitos.startsWith('00')) digitos = digitos.slice(2);
  if (digitos.startsWith('54')) digitos = digitos.slice(2);
  if (digitos.startsWith('9')) {
    celular = true;
    digitos = digitos.slice(1);
  }
  if (digitos.startsWith('0')) digitos = digitos.slice(1);

  // El 15 de los celulares va después del código de área (de 2, 3 o 4 dígitos).
  if (digitos.length === 12) {
    const largoArea = [2, 3, 4].find((largo) => digitos.slice(largo, largo + 2) === '15');
    if (largoArea) {
      digitos = digitos.slice(0, largoArea) + digitos.slice(largoArea + 2);
      celular = true;
    }
  }

  if (digitos.length !== 10) {
    throw new DatosInvalidos(`El teléfono "${valor}" no es válido: debe incluir el código de área.`);
  }
  return `+54${celular ? '9' : ''}${digitos}`;
}

/** Fecha de calendario opcional con formato AAAA-MM-DD. */
export function normalizarFecha(valor: unknown, campo: string): string | null {
  if (vacio(valor)) return null;
  const fecha = typeof valor === 'string' ? valor.trim() : '';
  const tiempo = Date.parse(`${fecha}T00:00:00Z`);
  // La conversión de ida y vuelta descarta fechas inexistentes como 2026-02-30.
  const valida = /^\d{4}-\d{2}-\d{2}$/.test(fecha) && !Number.isNaN(tiempo) &&
    new Date(tiempo).toISOString().startsWith(fecha);
  if (!valida) {
    throw new DatosInvalidos(`El campo ${campo} debe ser una fecha válida con formato AAAA-MM-DD.`);
  }
  return fecha;
}
