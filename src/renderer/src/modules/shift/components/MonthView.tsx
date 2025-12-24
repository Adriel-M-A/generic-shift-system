import { useMemo } from 'react'
import { ChevronLeft, ChevronRight } from 'lucide-react'

interface MonthViewProps {
  date: Date
  setDate: (date: Date) => void
  getDailyLoad: (date: Date) => number
}

// 1. Definimos el tipo para los objetos del calendario
interface CalendarSlot {
  day: number | null
}

export function MonthView({ date, setDate, getDailyLoad }: MonthViewProps) {
  const weekDays = ['Domingo', 'Lunes', 'Martes', 'Miércoles', 'Jueves', 'Viernes', 'Sábado']
  const monthName = date.toLocaleDateString('es-ES', { month: 'long', year: 'numeric' })

  const handlePrevMonth = () => {
    setDate(new Date(date.getFullYear(), date.getMonth() - 1, 1))
  }

  const handleNextMonth = () => {
    setDate(new Date(date.getFullYear(), date.getMonth() + 1, 1))
  }

  const calendarData = useMemo(() => {
    const year = date.getFullYear()
    const month = date.getMonth()
    const daysInMonth = new Date(year, month + 1, 0).getDate()
    const startDayIndex = new Date(year, month, 1).getDay()

    // 2. Aquí está la corrección: Tipamos explícitamente el array
    const days: CalendarSlot[] = []

    // Relleno inicial
    for (let i = 0; i < startDayIndex; i++) {
      days.push({ day: null })
    }
    // Días reales
    for (let i = 1; i <= daysInMonth; i++) {
      days.push({ day: i })
    }
    return days
  }, [date])

  const getDayStyles = (load: number, isSelected: boolean, isToday: boolean) => {
    let classes =
      'relative p-2 flex flex-col items-start justify-between border-b border-r transition-all outline-none min-h-[90px] group '

    if (isSelected) {
      classes += 'bg-primary text-primary-foreground z-10 shadow-md ring-1 ring-primary/50 '
    } else {
      if (load > 7) {
        classes +=
          'bg-red-100 text-red-900 hover:bg-red-200 ' +
          'dark:bg-red-900/20 dark:text-red-200 dark:hover:bg-red-900/30 '
      } else if (load >= 4) {
        classes +=
          'bg-orange-100 text-orange-900 hover:bg-orange-200 ' +
          'dark:bg-orange-900/20 dark:text-orange-200 dark:hover:bg-orange-900/30 '
      } else if (load > 0) {
        classes +=
          'bg-blue-100 text-blue-900 hover:bg-blue-200 ' +
          'dark:bg-blue-900/10 dark:text-blue-200 dark:hover:bg-blue-900/20 '
      } else {
        classes += 'bg-card text-foreground ' + 'hover:bg-muted dark:hover:bg-white/5 '
      }
    }

    if (isToday && !isSelected) {
      classes += 'ring-1 ring-inset ring-primary font-semibold '
    }

    return classes
  }

  return (
    <div className="flex flex-col h-full bg-card shadow-sm overflow-hidden">
      <div className="flex items-center justify-between p-3 border-b bg-card">
        <h2 className="text-lg font-semibold capitalize flex items-center gap-2 pl-1">
          {monthName}
        </h2>
        <div className="flex items-center gap-1">
          <button
            onClick={handlePrevMonth}
            className="p-1.5 rounded-md text-muted-foreground hover:text-foreground hover:bg-muted dark:hover:bg-white/10 transition-colors"
          >
            <ChevronLeft className="h-5 w-5" />
          </button>
          <button
            onClick={handleNextMonth}
            className="p-1.5 rounded-md text-muted-foreground hover:text-foreground hover:bg-muted dark:hover:bg-white/10 transition-colors"
          >
            <ChevronRight className="h-5 w-5" />
          </button>
        </div>
      </div>

      <div className="grid grid-cols-7 border-b bg-muted/40 dark:bg-muted/10">
        {weekDays.map((day) => (
          <div
            key={day}
            className="py-2 px-2 text-[10px] sm:text-xs font-medium text-muted-foreground uppercase tracking-wider text-center"
          >
            {day.slice(0, 3)}
          </div>
        ))}
      </div>

      <div className="grid grid-cols-7 flex-1 auto-rows-fr bg-card">
        {calendarData.map((slot, index) => {
          if (slot.day === null) {
            return (
              <div
                key={`empty-${index}`}
                className="bg-muted/5 dark:bg-black/20 border-b border-r border-border/50"
              />
            )
          }

          // TypeScript ahora sabe que slot.day es un número aquí
          const currentDayDate = new Date(date.getFullYear(), date.getMonth(), slot.day)
          const load = getDailyLoad(currentDayDate)

          const isSelected = date.toDateString() === currentDayDate.toDateString()
          const isToday = new Date().toDateString() === currentDayDate.toDateString()

          return (
            <button
              key={slot.day}
              onClick={() => setDate(currentDayDate)}
              className={getDayStyles(load, isSelected, isToday)}
            >
              <span className={`text-sm leading-none ${isToday || isSelected ? 'font-bold' : ''}`}>
                {slot.day}
              </span>

              {load > 0 && (
                <div className="mt-auto w-full text-right">
                  <span
                    className={`
                     text-[10px] font-medium block truncate
                     ${
                       isSelected
                         ? 'text-primary-foreground/90'
                         : 'text-foreground/70 dark:text-foreground/60'
                     }
                   `}
                  >
                    {load} {load === 1 ? 'turno' : 'turnos'}
                  </span>
                </div>
              )}
            </button>
          )
        })}

        {Array.from({ length: (7 - (calendarData.length % 7)) % 7 }).map((_, i) => (
          <div
            key={`fill-${i}`}
            className="bg-muted/5 dark:bg-black/20 border-b border-r border-border/50"
          />
        ))}
      </div>
    </div>
  )
}
