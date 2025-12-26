export type ViewMode = 'month' | 'year'
export type EstadoTurno = 'pendiente' | 'completado' | 'cancelado' | 'en_curso'

export interface Turno {
  id: number
  fecha: string
  cliente: string
  servicio: string
  hora: string
  profesional: string
  estado: EstadoTurno
  // --- NUEVOS CAMPOS ---
  customerId?: number | null
  customerData?: {
    documento: string
    telefono?: string
    email?: string
  } | null
}

export interface ShiftStats {
  total: number
  pendientes: number
  completados: number
}

export interface ShiftConfig {
  openingTime: string
  closingTime: string
  interval: number
  // Configuración Visual
  startOfWeek: 'monday' | 'sunday'
  thresholds: {
    low: number
    medium: number
  }
}
