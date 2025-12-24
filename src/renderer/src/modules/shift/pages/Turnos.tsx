import { ShiftHeader } from '../components/ShiftHeader'
import { TurnosLayout } from '../components/layout/TurnosLayout'
import { ShiftProvider } from '../context/ShiftContext'

export function Turnos() {
  // Nota: Ya no llamamos a useShifts() aquí.
  // La lógica ahora vive dentro del Provider.

  return (
    <ShiftProvider>
      <div className="flex flex-col h-[calc(100vh-4rem)] gap-4 p-2 animate-in fade-in duration-500">
        <ShiftHeader />

        {/* TurnosLayout ya no necesita recibir props gigantes. 
            Se conectará internamente al Contexto. */}
        <TurnosLayout />
      </div>
    </ShiftProvider>
  )
}
