import { format } from 'date-fns'
import { es } from 'date-fns/locale'
import { EstadoTurno } from './types'

/**
 * Formatea una fecha para el encabezado (Ej: "lunes 24 de diciembre")
 */
export function formatDateHeader(date: Date): string {
  // 'EEEE' = día semana completo, 'd' = día mes, 'MMMM' = mes completo
  return format(date, "EEEE d 'de' MMMM", { locale: es })
}

/**
 * Retorna las clases de Tailwind según el estado del turno
 */
export function getStatusColor(estado: EstadoTurno): string {
  switch (estado) {
    case 'pendiente':
      return 'bg-yellow-500/10 text-yellow-600 border-yellow-200 hover:bg-yellow-500/20'
    case 'en_curso':
      return 'bg-blue-500/10 text-blue-600 border-blue-200 hover:bg-blue-500/20'
    case 'completado':
      return 'bg-green-500/10 text-green-600 border-green-200 hover:bg-green-500/20'
    case 'cancelado':
      return 'bg-red-500/10 text-red-600 border-red-200 hover:bg-red-500/20'
    default:
      return 'bg-gray-100 text-gray-600'
  }
}

/**
 * Retorna una etiqueta legible para el estado
 */
export function getStatusLabel(estado: EstadoTurno): string {
  return estado.replace('_', ' ').toUpperCase()
}
