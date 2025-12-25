import { ShiftHeader } from '../components/ShiftHeader'
import { TurnosLayout } from '../components/layout/TurnosLayout'

export function Turnos() {
  return (
    <div className="flex flex-col gap-4 animate-in fade-in duration-500 h-full">
      <ShiftHeader />
      <div className="flex-1 min-h-0">
        <TurnosLayout />
      </div>
    </div>
  )
}
