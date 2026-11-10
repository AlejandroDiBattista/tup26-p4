import type { Responsable } from './types'

// Combina el nombre y el apellido sin alterar los registros anteriores.
export function nombreCompleto(persona: Pick<Responsable, 'nombre' | 'apellido'>) {
  return [persona.nombre, persona.apellido].filter(Boolean).join(' ')
}

// Separa de forma inicial los nombres guardados antes de tener un campo de apellido.
export function separarNombre(persona: Responsable) {
  if (persona.apellido !== undefined) {
    return { nombre: persona.nombre, apellido: persona.apellido }
  }

  const partes = persona.nombre.trim().split(/\s+/)
  const apellido = partes.length > 1 ? partes.pop()! : ''
  return { nombre: partes.join(' '), apellido }
}
