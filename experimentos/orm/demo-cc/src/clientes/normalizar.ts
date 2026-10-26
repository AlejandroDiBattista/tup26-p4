import { ErrorValidacion } from "./errores.js";

const espacios = (s: string) => s.trim().replace(/\s+/g, " ");

export const nombre = (s: string) =>
  espacios(s).toLowerCase().replace(/(^|[\s'-])\p{L}/gu, (m) => m.toUpperCase());

export const email = (s: string) => s.trim().toLowerCase();

// Deja solo dígitos, conservando un "+" inicial: "+54 (341) 555-0101" -> "+543415550101"
export const telefono = (s: string) => {
  const t = s.trim();
  return (t.startsWith("+") ? "+" : "") + t.replace(/\D/g, "");
};

export const texto = (s: string) => espacios(s);

// Opcionales: vacío o null se guardan como null.
export const opcional = (s: string | null | undefined, fn: (v: string) => string = texto) =>
  s == null ? null : fn(s) || null;

const ISO = /^\d{4}-\d{2}-\d{2}$/;
export const fecha = (s: string) => {
  if (typeof s !== "string" || !ISO.test(s) || Number.isNaN(Date.parse(s))) throw new ErrorValidacion(`Fecha inválida: ${s} (use YYYY-MM-DD)`);
  return s;
};

export const hoy = () => new Date().toLocaleDateString("sv"); // YYYY-MM-DD local
