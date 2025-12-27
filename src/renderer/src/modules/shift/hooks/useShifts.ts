import { useContext } from 'react'
import { toast } from 'sonner'
import { ShiftContext, NewShiftData, ShiftContextType } from '../context/ShiftContext'
import { EstadoTurno } from '../types'

// Exportamos NewShiftData para que los formularios lo usen
export type { NewShiftData }

// Definimos explícitamente qué devuelve el hook:
// Todo lo que tiene el Contexto + las funciones extra (createShift, updateStatus)
type UseShiftsReturn = ShiftContextType & {
  createShift: (data: NewShiftData) => Promise<boolean>
  updateStatus: (id: number, estado: EstadoTurno) => Promise<void>
}

export function useShifts(): UseShiftsReturn {
  const context = useContext(ShiftContext)

  if (context === undefined) {
    throw new Error('useShifts must be used within a ShiftProvider')
  }

  // Wrapper para mantener compatibilidad y manejar notificaciones UI
  const createShift = async (data: NewShiftData): Promise<boolean> => {
    try {
      await context.addShift(data)
      toast.success('Turno agendado correctamente')
      return true
    } catch (error) {
      console.error(error)
      toast.error('Error al crear el turno')
      return false
    }
  }

  // Wrapper para actualizar estado con notificación
  const updateStatus = async (id: number, estado: EstadoTurno): Promise<void> => {
    try {
      await context.changeShiftStatus(id, estado)
      toast.success('Estado actualizado')
    } catch (error) {
      console.error(error)
      toast.error('No se pudo actualizar el estado')
    }
  }

  return {
    ...context,
    createShift,
    updateStatus
  }
}
