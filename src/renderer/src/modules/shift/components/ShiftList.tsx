import { Clock } from 'lucide-react'
import { ScrollArea } from '@ui/scroll-area'
import { Shift } from '../types'
import { ShiftCard } from './ShiftCard'
import { useShifts } from '../hooks/useShifts'

interface ShiftListProps {
  onRequestCancel: (id: number) => void
}

export function ShiftList({ onRequestCancel }: ShiftListProps) {
  const { filteredShifts, loading, updateStatus } = useShifts()

  return (
    <ScrollArea className="h-full">
      <div className="flex flex-col gap-3 p-4">
        {loading ? (
          [1, 2, 3].map((i) => (
            <div
              key={i}
              className="h-24 w-full bg-muted/20 animate-pulse rounded-md border border-border/40"
            />
          ))
        ) : filteredShifts.length === 0 ? (
          <div className="flex flex-col items-center justify-center h-40 text-muted-foreground gap-2">
            <Clock className="h-10 w-10 opacity-20" />
            <p className="text-sm">No hay turnos para esta fecha.</p>
          </div>
        ) : (
          filteredShifts.map((turno: Shift) => (
            <ShiftCard
              key={turno.id}
              turno={turno}
              onChangeStatus={updateStatus}
              onRequestCancel={onRequestCancel}
            />
          ))
        )}
      </div>
    </ScrollArea>
  )
}
