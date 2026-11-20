export const categorias = [
  { id: 'motos', nombre: 'Motos', singular: 'moto', tecla: '1' },
  { id: 'autos', nombre: 'Autos', singular: 'auto', tecla: '2' },
  { id: 'camionetas', nombre: 'Camionetas', singular: 'camioneta', tecla: '3' },
] as const

export type DatosCategoria = typeof categorias[number]
