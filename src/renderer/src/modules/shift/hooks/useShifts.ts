import { useContext } from 'react'
import { ShiftContext, NewShiftData, ShiftContextType } from '../context/ShiftContext'

// Re-exportamos para facilitar imports en otros lados
export type { NewShiftData }

// Ahora TypeScript sabe explícitamente qué devuelve esta función
export function useShifts(): ShiftContextType {
  const context = useContext(ShiftContext)

  if (context === undefined) {
    throw new Error('useShifts must be used within a ShiftProvider')
  }

  return context
}
