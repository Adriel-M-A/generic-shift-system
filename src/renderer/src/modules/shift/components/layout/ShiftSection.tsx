import { Turno, EstadoTurno } from '../../types'
import { ShiftList } from '../ShiftList'

interface ShiftSectionProps {
  date: Date | undefined
  shifts: Turno[]
  formatDateHeader: (d: Date) => string
  changeShiftStatus: (id: number, status: EstadoTurno) => void
}

export function ShiftSection({
  date,
  shifts,
  formatDateHeader,
  changeShiftStatus
}: ShiftSectionProps) {
  return (
    <div className="flex flex-col h-full min-h-0">
      <ShiftList
        date={date}
        shifts={shifts}
        formatDateHeader={formatDateHeader}
        changeShiftStatus={changeShiftStatus}
      />
    </div>
  )
}
