import { useShifts } from '../hooks/useShifts'
import { ShiftHeader } from '../components/ShiftHeader'
import { TurnosLayout } from '../components/layout/TurnosLayout'

export function Turnos() {
  const { date, setDate, currentTime, shifts, getDailyLoad, formatTime, formatDateHeader } =
    useShifts()

  return (
    <div className="flex flex-col h-[calc(100vh-4rem)] gap-4 p-2 animate-in fade-in duration-500">
      <ShiftHeader
        currentTime={currentTime}
        formatTime={formatTime}
        formatDateHeader={formatDateHeader}
      />

      <TurnosLayout
        date={date}
        setDate={setDate}
        shifts={shifts}
        getDailyLoad={getDailyLoad}
        formatDateHeader={formatDateHeader}
      />
    </div>
  )
}
