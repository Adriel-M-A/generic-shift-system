import { format } from 'date-fns'
import { es } from 'date-fns/locale'
import { useShifts } from '../hooks/useShifts'
import { CalendarSection } from '../components/layout/CalendarSection'
import { ShiftSection } from '../components/layout/ShiftSection'

export default function Turnos() {
  const { currentDate, changeDate, shifts, loading, changeShiftStatus } = useShifts()

  // Definimos la función de formateo aquí
  const formatDateHeader = (date: Date) => {
    return format(date, "EEEE d 'de' MMMM", { locale: es })
  }

  return (
    <div className="grid grid-cols-12 gap-4 h-[calc(100vh-theme(spacing.16))] overflow-hidden p-4">
      <div className="col-span-12 lg:col-span-8 h-full min-h-0">
        <CalendarSection date={currentDate} setDate={changeDate} />
      </div>

      <div className="col-span-12 lg:col-span-4 h-full min-h-0">
        <ShiftSection
          date={currentDate}
          shifts={shifts}
          loading={loading}
          formatDateHeader={formatDateHeader} // <--- Asegúrate de pasarla aquí
          changeShiftStatus={changeShiftStatus}
        />
      </div>
    </div>
  )
}
