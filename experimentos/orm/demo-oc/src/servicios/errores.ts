/**
 * Errores de dominio. El servicio no sabe nada de HTTP: solo distingue estos
 * tres casos, y la capa API es la que los traduce a códigos de estado.
 */
export class ErrorDeDominio extends Error {}

/** El recurso no existe (o no pertenece al cliente indicado). */
export class NoEncontrado extends ErrorDeDominio {}

/** Choca con un dato existente, por ejemplo un email duplicado. */
export class Conflicto extends ErrorDeDominio {}

/** El estado actual del recurso no permite la operación. */
export class ReglaDeNegocio extends ErrorDeDominio {}
