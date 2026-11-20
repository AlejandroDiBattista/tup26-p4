import { ErrorValidacion } from "./errores";

const espacios = (s: string) => s.trim().replace(/\s+/g, " ");

/** Los datos pueden venir de la API sin tipar: se exige texto. */
function esTexto(s: unknown): asserts s is string {
  if (typeof s !== "string") throw new ErrorValidacion(`Valor inválido: se esperaba texto y llegó ${JSON.stringify(s)}`);
}

const conectores = new Set(["de", "del", "la", "las", "los", "y"]);

/** "  juan   CARLOS " -> "Juan Carlos"; "san miguel DE tucumán" -> "San Miguel de Tucumán" */
export function normalizarNombre(s: string): string {
  return espacios(s)
    .toLocaleLowerCase("es")
    .split(" ")
    .map((palabra, i) =>
      i > 0 && conectores.has(palabra)
        ? palabra
        : palabra.replace(/(^|['-])(\p{L})/gu, (_, sep: string, letra: string) => sep + letra.toLocaleUpperCase("es")),
    )
    .join(" ");
}

/** Texto para comparar en búsquedas: minúsculas y sin acentos ("Tucumán" -> "tucuman"). */
export function plegar(s: string): string {
  return s.normalize("NFD").replace(/\p{M}/gu, "").toLowerCase().trim();
}

/** " Ana.Perez@Mail.COM " -> "ana.perez@mail.com" */
export function normalizarEmail(s: string): string {
  return s.trim().toLowerCase();
}

/** "+54 (381) 555-1234" -> "+543815551234". Vacío -> null. */
export function normalizarTelefono(s: string | null | undefined): string | null {
  if (s == null) return null;
  esTexto(s);
  if (!s.trim()) return null;
  const limpio = s.trim();
  const digitos = limpio.replace(/\D/g, "");
  if (!digitos) return null;
  return (limpio.startsWith("+") ? "+" : "") + digitos;
}

/** Texto opcional: recorta espacios; vacío -> null. */
export function normalizarTexto(s: string | null | undefined): string | null {
  if (s == null) return null;
  esTexto(s);
  const t = espacios(s);
  return t || null;
}

/** Fecha opcional "YYYY-MM-DD"; vacío -> null. */
export function normalizarFecha(s: string | null | undefined): string | null {
  if (s == null) return null;
  esTexto(s);
  if (!s.trim()) return null;
  const f = s.trim().slice(0, 10);
  const d = new Date(`${f}T00:00:00Z`);
  if (!/^\d{4}-\d{2}-\d{2}$/.test(f) || Number.isNaN(d.getTime()) || d.toISOString().slice(0, 10) !== f) {
    throw new ErrorValidacion(`Fecha inválida: "${s}" (formato esperado YYYY-MM-DD)`);
  }
  return f;
}

/** Fecha local de hoy en formato "YYYY-MM-DD". */
export function hoy(): string {
  const d = new Date();
  return new Date(d.getTime() - d.getTimezoneOffset() * 60_000).toISOString().slice(0, 10);
}

export function requerido(valor: string | null | undefined, campo: string): string {
  const t = normalizarTexto(valor);
  if (!t) throw new ErrorValidacion(`El campo "${campo}" es obligatorio`);
  return t;
}

export function validarEmail(email: string): string {
  if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) throw new ErrorValidacion(`Email inválido: "${email}"`);
  return email;
}
