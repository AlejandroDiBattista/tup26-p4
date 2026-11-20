export class ErrorServicio extends Error {
  constructor(public status: number, message: string) {
    super(message);
  }
}

export function objeto(valor: unknown): Record<string, unknown> {
  if (!valor || typeof valor !== 'object' || Array.isArray(valor)) {
    throw new ErrorServicio(400, 'Se esperaba un objeto JSON.');
  }
  return valor as Record<string, unknown>;
}

export function texto(valor: unknown, campo: string, maximo: number, obligatorio = false): string | null {
  if (valor == null) {
    if (obligatorio) throw new ErrorServicio(400, `${campo} es obligatorio.`);
    return null;
  }
  if (typeof valor !== 'string') throw new ErrorServicio(400, `${campo} debe ser texto.`);
  const limpio = valor.trim().replace(/\s+/g, ' ');
  if (obligatorio && !limpio) throw new ErrorServicio(400, `${campo} es obligatorio.`);
  if (limpio.length > maximo) throw new ErrorServicio(400, `${campo}: máximo ${maximo} caracteres.`);
  return limpio || null;
}

export function idValido(valor: unknown): number {
  if (!/^[1-9]\d*$/.test(String(valor)) || !Number.isSafeInteger(Number(valor))) {
    throw new ErrorServicio(400, 'El identificador debe ser un entero positivo.');
  }
  return Number(valor);
}

export function fechaValida(valor: unknown): string | null {
  if (valor == null || valor === '') return null;
  if (typeof valor !== 'string' || !/^\d{4}-\d{2}-\d{2}$/.test(valor)) {
    throw new ErrorServicio(400, 'La fecha debe tener formato AAAA-MM-DD.');
  }
  const fecha = new Date(`${valor}T12:00:00Z`);
  if (valor < '0001-01-01' || Number.isNaN(fecha.getTime()) || fecha.toISOString().slice(0, 10) !== valor) {
    throw new ErrorServicio(400, 'La fecha no existe.');
  }
  return valor;
}

export function normalizarBusqueda(valor: unknown): string {
  return String(valor ?? '').normalize('NFD').replace(/[\u0300-\u036f]/g, '').toLocaleLowerCase('es');
}
