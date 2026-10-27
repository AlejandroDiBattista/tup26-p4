import { ErrorServicio } from '../services/errores'

export const leerId = (valor: string | undefined) => {
  const id = Number(valor)
  if (!Number.isInteger(id) || id < 1) {
    throw new ErrorServicio(400, 'El id no es válido')
  }
  return id
}
