export type ViewMode = 'day' | 'week' | 'month' | 'year'

export type EstadoTurno = 'pendiente' | 'finalizado' | 'cancelado' | 'en_curso'

export interface Turno {
  id: number
  cliente: string
  fecha: string // YYYY-MM-DD
  hora: string // HH:mm
  servicio: string
  customer_id?: number
  profesional?: string
  estado: EstadoTurno
  created_at?: string
}

export interface ShiftStats {
  total: number
  pendientes: number
  completados: number
}

// AGREGADO: showFinishedShifts
export interface ShiftConfig {
  openingTime: string
  closingTime: string
  interval: number
  startOfWeek: 'monday' | 'sunday'
  showFinishedShifts: boolean
  thresholds: {
    low: number
    medium: number
  }
}

export interface NewShiftData {
  cliente: string
  servicio: string
  hora: string
  fecha?: string
  customerId?: number
}
