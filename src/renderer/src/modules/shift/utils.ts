import { format } from 'date-fns'
import { es } from 'date-fns/locale'
import { EstadoTurno } from './types'

export function formatDateHeader(date: Date): string {
  return format(date, "EEEE d 'de' MMMM", { locale: es })
}

export function getStatusStyles(status: EstadoTurno) {
  switch (status) {
    case 'completado':
      return {
        badge: 'bg-emerald-500/15 text-emerald-700 border-emerald-500/20 dark:text-emerald-400',
        accent: 'bg-emerald-500'
      }
    case 'cancelado':
      return {
        badge: 'bg-destructive/15 text-destructive border-destructive/20',
        accent: 'bg-destructive'
      }
    case 'ausente':
      return {
        badge: 'bg-amber-500/15 text-amber-700 border-amber-500/20 dark:text-amber-400',
        accent: 'bg-amber-500'
      }
    default:
      return {
        badge:
          'bg-zinc-100 text-zinc-700 border-zinc-200 dark:bg-zinc-800 dark:text-zinc-300 dark:border-zinc-700',
        accent: 'bg-zinc-300 dark:bg-zinc-600'
      }
  }
}

export function getStatusLabel(estado: EstadoTurno): string {
  return estado.charAt(0).toUpperCase() + estado.slice(1)
}
