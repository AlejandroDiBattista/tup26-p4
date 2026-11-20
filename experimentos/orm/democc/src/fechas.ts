const zonaHoraria = 'America/Argentina/Tucuman';

/** Fecha de hoy en Tucumán, con formato AAAA-MM-DD. */
export function hoy(): string {
  return new Intl.DateTimeFormat('en-CA', { timeZone: zonaHoraria }).format(new Date());
}

/** Suma (o resta) días a una fecha AAAA-MM-DD. */
export function sumarDias(fecha: string, dias: number): string {
  const resultado = new Date(`${fecha}T00:00:00Z`);
  resultado.setUTCDate(resultado.getUTCDate() + dias);
  return resultado.toISOString().slice(0, 10);
}
