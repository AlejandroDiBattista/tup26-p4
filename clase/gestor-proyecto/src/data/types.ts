export type EstadoTarea = string

export interface Estado {
  id: string
  nombre: string
  color?: string
}

export interface Proyecto {
  id: string
  nombre: string
  descripcion: string
}

export interface Responsable {
  id: string
  nombre: string
  apellido?: string
  contacto: string
}

export interface Tarea {
  id: string
  titulo: string
  descripcion: string
  estado: EstadoTarea
  proyecto_id: string
  responsable_id: string | null
}

export type NuevoProyecto = Omit<Proyecto, 'id'>
export type NuevoResponsable = Omit<Responsable, 'id' | 'apellido'> & { apellido: string }
export type NuevaTarea = Omit<Tarea, 'id' | 'estado'>
