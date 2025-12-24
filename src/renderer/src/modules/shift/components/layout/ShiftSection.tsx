import { Turno, EstadoTurno } from '../../types'
import { NewShiftData } from '../../hooks/useShifts'
import { ShiftList } from '../ShiftList'

interface ShiftSectionProps {
  date: Date | undefined
  shifts: Turno[]
  formatDateHeader: (d: Date) => string
  changeShiftStatus: (id: number, status: EstadoTurno) => void
  addShift: (data: NewShiftData) => void // <--- Nueva prop
}

export function ShiftSection({
  date,
  shifts,
  formatDateHeader,
  changeShiftStatus,
  addShift // <--- Recibimos
}: ShiftSectionProps) {
  return (
    <div className="flex flex-col h-full min-h-0">
      <ShiftList
        date={date}
        shifts={shifts}
        formatDateHeader={formatDateHeader}
        changeShiftStatus={changeShiftStatus}
        addShift={addShift} // <--- Pasamos a la lista
      />
    </div>
  )
}
