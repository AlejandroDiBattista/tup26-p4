// Errores de negocio: los adaptadores (REST, MCP) los traducen a su formato.
export class ErrorDeNegocio extends Error {}

export class DatosInvalidos extends ErrorDeNegocio {}

export class NoEncontrado extends ErrorDeNegocio {}

export class Conflicto extends ErrorDeNegocio {}
