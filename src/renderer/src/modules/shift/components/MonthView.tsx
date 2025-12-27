import { useMemo } from 'react'
import { ChevronLeft, ChevronRight } from 'lucide-react'
import { cn } from '@lib/utils'
import { useShifts } from '../hooks/useShifts'

interface MonthViewProps {
  currentDate: Date
  onDateChange: (date: Date) => void
}

export function MonthView({ currentDate, onDateChange }: MonthViewProps) {
  const { config, getDailyLoad } = useShifts()

  const weekDays = useMemo(() => {
    return config.startOfWeek === 'monday'
      ? ['Lun', 'Mar', 'Mié', 'Jue', 'Vie', 'Sáb', 'Dom']
      : ['Dom', 'Lun', 'Mar', 'Mié', 'Jue', 'Vie', 'Sáb']
  }, [config.startOfWeek])

  const monthName = currentDate.toLocaleDateString('es-ES', {
    month: 'long',
    year: 'numeric'
  })

  const handlePrevMonth = () => {
    onDateChange(new Date(currentDate.getFullYear(), currentDate.getMonth() - 1, 1))
  }

  const handleNextMonth = () => {
    onDateChange(new Date(currentDate.getFullYear(), currentDate.getMonth() + 1, 1))
  }

  const calendarData = useMemo(() => {
    const year = currentDate.getFullYear()
    const month = currentDate.getMonth()
    const daysInMonth = new Date(year, month + 1, 0).getDate()
    const startDay = new Date(year, month, 1).getDay()

    let startDayIndex = startDay
    if (config.startOfWeek === 'monday') {
      startDayIndex = startDay === 0 ? 6 : startDay - 1
    }

    const days: { day: number | null }[] = []
    for (let i = 0; i < startDayIndex; i++) {
      days.push({ day: null })
    }
    for (let i = 1; i <= daysInMonth; i++) {
      days.push({ day: i })
    }
    return days
  }, [currentDate, config.startOfWeek])

  const getLoadColor = (load: number) => {
    const { low, medium } = config.thresholds
    if (load > medium) return 'bg-load-high'
    if (load > low) return 'bg-load-medium'
    if (load > 0) return 'bg-load-low'
    return 'bg-transparent'
  }

  return (
    <div className="flex flex-col h-full bg-card shadow-sm min-h-0">
      <div className="flex items-center justify-between p-3 border-b bg-card shrink-0">
        <h2 className="text-lg font-semibold capitalize pl-1">{monthName}</h2>
        <div className="flex items-center gap-1">
          <button
            onClick={handlePrevMonth}
            className="p-1.5 rounded-md text-muted-foreground hover:bg-muted"
          >
            <ChevronLeft className="h-5 w-5" />
          </button>
          <button
            onClick={handleNextMonth}
            className="p-1.5 rounded-md text-muted-foreground hover:bg-muted"
          >
            <ChevronRight className="h-5 w-5" />
          </button>
        </div>
      </div>

      <div className="flex-1 overflow-y-auto">
        <div className="p-2">
          <div className="grid grid-cols-7 gap-1 border-b bg-muted/40 mb-1">
            {weekDays.map((day) => (
              <div
                key={day}
                className="py-2 text-[10px] sm:text-xs font-medium text-muted-foreground uppercase text-center"
              >
                {day}
              </div>
            ))}
          </div>

          <div className="grid grid-cols-7 gap-1 auto-rows-min">
            {calendarData.map((slot, index) => {
              if (slot.day === null) return <div key={`empty-${index}`} className="aspect-square" />

              const currentDayDate = new Date(
                currentDate.getFullYear(),
                currentDate.getMonth(),
                slot.day
              )
              const load = getDailyLoad(currentDayDate)
              const isSelected = currentDate.toDateString() === currentDayDate.toDateString()
              const isToday = new Date().toDateString() === currentDayDate.toDateString()

              return (
                <button
                  key={slot.day}
                  onClick={() => onDateChange(currentDayDate)}
                  className={cn(
                    'aspect-square rounded-md p-1 sm:p-2 relative flex flex-col items-start justify-between transition-all group bg-card border border-border/40',
                    isSelected && 'ring-2 ring-primary z-10',
                    isToday && !isSelected && 'ring-1 ring-primary/50 bg-primary/5'
                  )}
                >
                  <span
                    className={cn('text-xs sm:text-sm', (isToday || isSelected) && 'font-bold')}
                  >
                    {slot.day}
                  </span>

                  {load > 0 && (
                    <>
                      <div className="mt-auto w-full text-right hidden lg:block pb-1">
                        <span className="text-[10px] font-medium text-foreground/70">
                          {load} {load === 1 ? 'turno' : 'turnos'}
                        </span>
                      </div>
                      <div
                        className={cn(
                          'absolute bottom-0 left-0 right-0 h-1 opacity-60',
                          getLoadColor(load)
                        )}
                      />
                    </>
                  )}
                </button>
              )
            })}
          </div>
        </div>
      </div>
    </div>
  )
}
