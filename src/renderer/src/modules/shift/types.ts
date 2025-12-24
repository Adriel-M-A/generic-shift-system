export type ViewMode = 'month' | 'year'
export type EstadoTurno = 'pendiente' | 'completado' | 'cancelado' | 'en_curso'

export interface Turno {
  id: number
  cliente: string
  servicio: string
  hora: string
  profesional: string
  estado: EstadoTurno
}

export interface ShiftStats {
  total: number
  pendientes: number
  completados: number
}
