import { useContext } from 'react'
import { toast } from 'sonner'
import { ShiftContext, NewShiftData } from '../context/ShiftContext'

// Exportamos NewShiftData para que los formularios lo usen
export type { NewShiftData }

export function useShifts() {
  const context = useContext(ShiftContext)

  if (context === undefined) {
    throw new Error('useShifts must be used within a ShiftProvider')
  }

  // Wrapper para mantener compatibilidad y manejar notificaciones UI
  const createShift = async (data: NewShiftData) => {
    try {
      await context.addShift(data)
      toast.success('Turno agendado correctamente')
      return true
    } catch (error) {
      toast.error('Error al crear el turno')
      return false
    }
  }

  // Wrapper para actualizar estado con notificación
  const updateStatus = async (id: number, estado: any) => {
    try {
      await context.changeShiftStatus(id, estado)
      toast.success('Estado actualizado')
    } catch (error) {
      toast.error('No se pudo actualizar el estado')
    }
  }

  return {
    ...context,
    createShift,
    updateStatus
  }
}
