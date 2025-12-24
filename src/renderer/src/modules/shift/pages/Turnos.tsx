import { ShiftHeader } from '../components/ShiftHeader'
import { TurnosLayout } from '../components/layout/TurnosLayout'

export function Turnos() {
  return (
    <div className="flex flex-col h-[calc(100vh-4rem)] gap-4 p-2 animate-in fade-in duration-500">
      <ShiftHeader />
      <TurnosLayout />
    </div>
  )
}
