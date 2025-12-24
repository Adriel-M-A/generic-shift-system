import { useMemo } from 'react'
import { ChevronLeft, ChevronRight } from 'lucide-react'
import { cn } from '@lib/utils'

interface MonthViewProps {
  date: Date
  setDate: (date: Date) => void
  getDailyLoad: (date: Date) => number
}

interface CalendarSlot {
  day: number | null
}

export function MonthView({ date, setDate, getDailyLoad }: MonthViewProps) {
  const weekDays = ['Dom', 'Lun', 'Mar', 'Mié', 'Jue', 'Vie', 'Sáb']
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

    const days: CalendarSlot[] = []

    for (let i = 0; i < startDayIndex; i++) {
      days.push({ day: null })
    }
    for (let i = 1; i <= daysInMonth; i++) {
      days.push({ day: i })
    }
    return days
  }, [date])

  const getLoadColor = (load: number) => {
    if (load > 7) return 'bg-load-high text-white'
    if (load >= 4) return 'bg-load-medium text-stone-900'
    if (load > 0) return 'bg-load-low text-white'
    return 'bg-transparent'
  }
  // -----------------------------------------------

  const getDayClasses = (isSelected: boolean, isToday: boolean) => {
    return cn(
      'relative flex flex-col items-start justify-between transition-all outline-none group bg-card text-foreground hover:bg-muted/50 overflow-hidden border border-border/40',
      isSelected && 'ring-2 ring-primary z-10',
      isToday && !isSelected && 'ring-1 ring-inset ring-primary/50 font-semibold bg-primary/5'
    )
  }

  return (
    <div className="flex flex-col h-full bg-card shadow-sm overflow-hidden">
      <div className="flex items-center justify-between p-3 border-b bg-card shrink-0">
        <h2 className="text-lg font-semibold capitalize flex items-center gap-2 pl-1">
          {monthName}
        </h2>
        <div className="flex items-center gap-1">
          <button
            onClick={handlePrevMonth}
            className="p-1.5 rounded-md text-muted-foreground hover:text-foreground hover:bg-muted transition-colors"
          >
            <ChevronLeft className="h-5 w-5" />
          </button>
          <button
            onClick={handleNextMonth}
            className="p-1.5 rounded-md text-muted-foreground hover:text-foreground hover:bg-muted transition-colors"
          >
            <ChevronRight className="h-5 w-5" />
          </button>
        </div>
      </div>

      <div className="grid grid-cols-7 border-b bg-muted/40 shrink-0">
        {weekDays.map((day) => (
          <div
            key={day}
            className="py-2 text-[10px] sm:text-xs font-medium text-muted-foreground uppercase tracking-wider text-center"
          >
            {day}
          </div>
        ))}
      </div>

      <div className="flex-1 overflow-y-auto p-2">
        <div className="grid grid-cols-7 gap-1 auto-rows-min">
          {calendarData.map((slot, index) => {
            if (slot.day === null) {
              return <div key={`empty-${index}`} className="aspect-square" />
            }

            const currentDayDate = new Date(date.getFullYear(), date.getMonth(), slot.day)
            const load = getDailyLoad(currentDayDate)
            const isSelected = date.toDateString() === currentDayDate.toDateString()
            const isToday = new Date().toDateString() === currentDayDate.toDateString()

            return (
              <button
                key={slot.day}
                onClick={() => setDate(currentDayDate)}
                className={cn(
                  'aspect-square rounded-md p-1 sm:p-2',
                  getDayClasses(isSelected, isToday)
                )}
              >
                <div className="w-full flex justify-between items-start">
                  <span
                    className={cn(
                      'text-xs sm:text-sm leading-none',
                      (isToday || isSelected) && 'font-bold'
                    )}
                  >
                    {slot.day}
                  </span>
                </div>

                {load > 0 && (
                  <div className="mt-auto w-full text-right hidden lg:block pb-1">
                    <span className="text-[10px] font-medium block truncate text-foreground/70">
                      {load} {load === 1 ? 'turno' : 'turnos'}
                    </span>
                  </div>
                )}

                {load > 0 && (
                  <div
                    className={cn(
                      'absolute bottom-0 left-0 right-0 h-1 opacity-60',
                      getLoadColor(load)
                    )}
                  />
                )}
              </button>
            )
          })}
        </div>
      </div>
    </div>
  )
}
