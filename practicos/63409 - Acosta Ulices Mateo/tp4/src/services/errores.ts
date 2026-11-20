// Errores de negocio que lanza el servicio. La API los traduce a códigos HTTP.
export class NoEncontrado extends Error {}
export class NoPermitido extends Error {}
