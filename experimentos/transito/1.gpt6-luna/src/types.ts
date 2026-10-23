export type Vehicle = "motos" | "autos" | "camionetas"

export type VehicleCounts = Record<Vehicle, number>

export const initialCounts: VehicleCounts = { motos: 0, autos: 0, camionetas: 0 }
