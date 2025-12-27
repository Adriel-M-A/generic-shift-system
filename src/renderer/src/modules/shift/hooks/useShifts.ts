import { useContext } from 'react'
import { toast } from 'sonner'
import { ShiftContext, ShiftContextType } from '../context/ShiftContext'
import { NewShiftData, EstadoTurno } from '../types'
import { parseError } from '@lib/error-utils'

// Re-exportamos para facilitar imports en componentes
export type { NewShiftData }

// Definimos qué devuelve el hook
type UseShiftsReturn = ShiftContextType & {
  createShift: (data: NewShiftData) => Promise<boolean>
  updateStatus: (id: number, estado: EstadoTurno) => Promise<void>
}

export function useShifts(): UseShiftsReturn {
  const context = useContext(ShiftContext)

  if (context === undefined) {
    throw new Error('useShifts debe usarse dentro de un ShiftProvider')
  }

  // Wrapper para crear turno con notificación UI
  const createShift = async (data: NewShiftData): Promise<boolean> => {
    try {
      await context.addShift(data)
      toast.success('Turno agendado correctamente')
      return true
    } catch (error: any) {
      // Usamos nuestra utilidad para mostrar el error limpio de Zod
      toast.error(parseError(error))
      return false
    }
  }

  // Wrapper para actualizar estado con notificación UI
  const updateStatus = async (id: number, estado: EstadoTurno): Promise<void> => {
    try {
      await context.changeShiftStatus(id, estado)
      toast.success('Estado actualizado')
    } catch (error: any) {
      toast.error(parseError(error))
    }
  }

  return {
    ...context,
    createShift,
    updateStatus
  }
}
