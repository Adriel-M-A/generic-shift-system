// Definimos los estados posibles para evitar errores de tipeo
export type EstadoTurno = 'pendiente' | 'completado' | 'cancelado' | 'ausente'

// LO QUE RECIBIMOS (Lectura desde DB - snake_case)
export interface Shift {
  id: number
  fecha: string
  hora: string
  cliente: string
  servicio: string
  estado: EstadoTurno
  profesional?: string
  customer_id?: number | null
  created_at?: string
}

// LO QUE ENVIAMOS (Escritura hacia Zod - camelCase)
export interface NewShiftData {
  fecha?: string
  hora: string
  cliente: string
  servicio: string
  customerId?: number
}

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
