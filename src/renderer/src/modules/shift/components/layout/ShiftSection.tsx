import { Turno, EstadoTurno } from '../../types'
import { NewShiftData } from '../../hooks/useShifts'
import { ShiftList } from '../ShiftList'

interface ShiftSectionProps {
  date: Date | undefined
  shifts: Turno[]
  formatDateHeader: (d: Date) => string
  changeShiftStatus: (id: number, status: EstadoTurno) => void
  addShift: (data: NewShiftData) => void
}

export function ShiftSection({
  date,
  shifts,
  formatDateHeader,
  changeShiftStatus,
  addShift
}: ShiftSectionProps) {
  return (
    <div className="flex flex-col min-h-0 h-full">
      <ShiftList
        date={date}
        shifts={shifts}
        formatDateHeader={formatDateHeader}
        changeShiftStatus={changeShiftStatus}
        addShift={addShift}
      />
    </div>
  )
}
