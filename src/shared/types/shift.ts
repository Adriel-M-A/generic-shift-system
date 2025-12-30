export type EstadoTurno = 'pendiente' | 'completado' | 'cancelado' | 'ausente'

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
  updated_at?: string
}

export interface NewShiftData {
  fecha?: string
  hora: string
  cliente: string
  servicio: string[]
  customerId?: number | null
  createCustomer?: {
    nombre: string
    apellido: string
    documento: string
    telefono?: string
  }
}
