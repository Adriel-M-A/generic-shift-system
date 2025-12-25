import { Clock } from 'lucide-react'
import { ScrollArea } from '@ui/scroll-area'
import { Turno, EstadoTurno } from '../types'
import { ShiftCard } from './ShiftCard'

interface ShiftListProps {
  shifts: Turno[]
  onChangeStatus: (id: number, status: EstadoTurno) => void
  onRequestCancel: (id: number) => void
}

export function ShiftList({ shifts, onChangeStatus, onRequestCancel }: ShiftListProps) {
  return (
    <ScrollArea className="h-full">
      <div className="flex flex-col gap-3 p-4">
        {shifts.length === 0 ? (
          <div className="flex flex-col items-center justify-center h-40 text-muted-foreground gap-2">
            <Clock className="h-10 w-10 opacity-20" />
            <p className="text-sm">No hay turnos para esta fecha.</p>
          </div>
        ) : (
          shifts.map((turno) => (
            <ShiftCard
              key={turno.id}
              turno={turno}
              onChangeStatus={onChangeStatus}
              onRequestCancel={onRequestCancel}
            />
          ))
        )}
      </div>
    </ScrollArea>
  )
}
