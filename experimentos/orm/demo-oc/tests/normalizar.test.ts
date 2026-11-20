import { describe, expect, it } from "vitest";
import {
  normalizarBusqueda,
  normalizarEmail,
  normalizarNombre,
  normalizarOpcional,
  normalizarTelefono,
  recortar,
} from "../src/servicios/normalizar.js";

describe("normalización", () => {
  it("recorta y colapsa espacios", () => {
    expect(recortar("  Calle   Mitre \n 567 ")).toBe("Calle Mitre 567");
  });

  it("pone nombres y apellidos en Title Case", () => {
    expect(normalizarNombre("  ana   GÓMEZ ")).toBe("Ana Gómez");
    expect(normalizarNombre("juan carlos de la cruz")).toBe("Juan Carlos De La Cruz");
    expect(normalizarNombre("o'brien")).toBe("O'Brien");
  });

  it("pasa los emails a minúsculas", () => {
    expect(normalizarEmail("  Ana.Gomez@Example.COM ")).toBe("ana.gomez@example.com");
  });

  it("deja los teléfonos solo con dígitos", () => {
    expect(normalizarTelefono("+54 11 5555-1001")).toBe("+541155551001");
    expect(normalizarTelefono("(011) 5555-1001")).toBe("01155551001");
    expect(normalizarTelefono("+54 (11) 5555.1001")).toBe("+541155551001");
  });

  it("guarda los opcionales vacíos como null", () => {
    expect(normalizarOpcional("   ", recortar)).toBeNull();
    expect(normalizarOpcional("", normalizarTelefono)).toBeNull();
    expect(normalizarOpcional(null, recortar)).toBeNull();
    expect(normalizarOpcional(undefined, recortar)).toBeNull();
    expect(normalizarOpcional(" Rosario ", recortar)).toBe("Rosario");
  });

  it("normaliza el término de búsqueda", () => {
    expect(normalizarBusqueda("  GÓMEZ ")).toBe("gómez");
  });
});
