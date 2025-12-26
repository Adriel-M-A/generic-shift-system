import { Clock } from 'lucide-react'
import { ScrollArea } from '@ui/scroll-area'
import { Turno, EstadoTurno } from '../types'
import { ShiftCard } from './ShiftCard'

interface ShiftListProps {
  shifts: Turno[]
  loading?: boolean // Nuevo
  onChangeStatus: (id: number, status: EstadoTurno) => void
  onRequestCancel: (id: number) => void
}

export function ShiftList({ shifts, loading, onChangeStatus, onRequestCancel }: ShiftListProps) {
  return (
    <ScrollArea className="h-full">
      <div className="flex flex-col gap-3 p-4">
        {loading ? (
          // Skeleton Loader Simple
          [1, 2, 3].map((i) => (
            <div
              key={i}
              className="h-24 w-full bg-muted/20 animate-pulse rounded-md border border-border/40"
            />
          ))
        ) : shifts.length === 0 ? (
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
