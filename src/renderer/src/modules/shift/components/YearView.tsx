import { useShifts } from '../hooks/useShifts'

interface YearViewProps {
  year: number
  currentDate: Date | undefined
  onSelectDate: (date: Date) => void
}

export function YearView({ year, currentDate, onSelectDate }: YearViewProps) {
  // Reutilizamos la lógica de carga para los colores en la vista anual
  const { getDailyLoad } = useShifts()
  const months = Array.from({ length: 12 }, (_, i) => i)
  const weekDays = ['D', 'L', 'M', 'X', 'J', 'V', 'S']

  return (
    <div className="grid grid-cols-3 sm:grid-cols-4 gap-4 h-full overflow-y-auto pr-2 pb-2">
      {months.map((monthIndex) => {
        const date = new Date(year, monthIndex, 1)
        const monthName = date.toLocaleDateString('es-ES', { month: 'long' })
        const daysInMonth = new Date(year, monthIndex + 1, 0).getDate()
        const startDay = new Date(year, monthIndex, 1).getDay()

        const days = Array.from({ length: daysInMonth }, (_, i) => i + 1)
        const emptySlots = Array.from({ length: startDay }, (_, i) => i)

        return (
          <div
            key={monthIndex}
            className="border rounded-md p-2 text-center bg-card shadow-sm hover:border-primary/50 transition-colors flex flex-col"
          >
            <h4 className="text-xs font-bold capitalize mb-2 text-primary">{monthName}</h4>
            <div className="grid grid-cols-7 gap-0.5 text-[8px] text-muted-foreground mb-1">
              {weekDays.map((d) => (
                <span key={d}>{d}</span>
              ))}
            </div>
            <div className="grid grid-cols-7 gap-0.5 text-[10px] flex-1 content-start">
              {emptySlots.map((i) => (
                <div key={`empty-${i}`} />
              ))}
              {days.map((day) => {
                const thisDate = new Date(year, monthIndex, day)
                const isSelected = currentDate?.toDateString() === thisDate.toDateString()
                const isToday = new Date().toDateString() === thisDate.toDateString()

                // Lógica de colores duplicada aquí para mantener consistencia
                const load = getDailyLoad(thisDate)
                const borderClass =
                  load > 7
                    ? 'border-red-500'
                    : load >= 4
                      ? 'border-orange-400'
                      : 'border-transparent'

                return (
                  <button
                    key={day}
                    onClick={() => onSelectDate(thisDate)}
                    className={`
                      aspect-square flex items-center justify-center rounded-xs transition-all border-b-[3px]
                      ${borderClass}
                      ${isSelected ? 'bg-primary text-primary-foreground font-bold border-primary!' : 'hover:bg-muted'}
                      ${isToday && !isSelected ? 'text-primary font-bold ring-1 ring-inset ring-primary/30' : ''}
                    `}
                    title={`${load} turnos`}
                  >
                    {day}
                  </button>
                )
              })}
            </div>
          </div>
        )
      })}
    </div>
  )
}
