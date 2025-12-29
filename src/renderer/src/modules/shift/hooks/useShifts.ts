import { useContext } from 'react'
import { toast } from 'sonner'
import { ShiftContext } from '../context/ShiftContext'
import { NewShiftData, EstadoTurno } from '../types'
import { parseError } from '@lib/error-utils'

export function useShifts() {
  const context = useContext(ShiftContext)

  if (context === undefined) {
    throw new Error('useShifts debe usarse dentro de un ShiftProvider')
  }

  const createShift = async (data: NewShiftData): Promise<boolean> => {
    try {
      await context.addShift(data)
      toast.success('Turno agendado correctamente')
      return true
    } catch (error: any) {
      toast.error(parseError(error))
      return false
    }
  }

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
