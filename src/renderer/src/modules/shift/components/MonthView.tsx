import { useMemo } from 'react'
import { ChevronLeft, ChevronRight } from 'lucide-react'
import { cn } from '@lib/utils'
import { useShifts } from '../hooks/useShifts'

interface CalendarSlot {
  day: number
  date: Date
  isCurrentMonth: boolean
}

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
    const firstDayOfMonth = new Date(year, month, 1)
    const lastDayOfPrevMonth = new Date(year, month, 0).getDate()

    let startDayIndex = firstDayOfMonth.getDay()
    if (config.startOfWeek === 'monday') {
      startDayIndex = startDayIndex === 0 ? 6 : startDayIndex - 1
    }

    const days: CalendarSlot[] = []

    for (let i = startDayIndex; i > 0; i--) {
      days.push({
        day: lastDayOfPrevMonth - i + 1,
        date: new Date(year, month - 1, lastDayOfPrevMonth - i + 1),
        isCurrentMonth: false
      })
    }

    const daysInMonth = new Date(year, month + 1, 0).getDate()
    for (let i = 1; i <= daysInMonth; i++) {
      days.push({
        day: i,
        date: new Date(year, month, i),
        isCurrentMonth: true
      })
    }

    const remainingSlots = 42 - days.length
    for (let i = 1; i <= remainingSlots; i++) {
      days.push({
        day: i,
        date: new Date(year, month + 1, i),
        isCurrentMonth: false
      })
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
      {/* Header - shrink-0 para que mantenga su tamaño */}
      <div className="flex items-center justify-between p-3 border-b bg-card shrink-0">
        <h2 className="text-lg font-semibold capitalize pl-1">{monthName}</h2>
        <div className="flex items-center gap-1">
          <button
            onClick={handlePrevMonth}
            className="p-1.5 rounded-md text-muted-foreground hover:bg-muted hover:text-foreground transition-colors"
          >
            <ChevronLeft className="h-5 w-5" />
          </button>
          <button
            onClick={handleNextMonth}
            className="p-1.5 rounded-md text-muted-foreground hover:bg-muted hover:text-foreground transition-colors"
          >
            <ChevronRight className="h-5 w-5" />
          </button>
        </div>
      </div>

      {/* Contenedor del Calendario */}
      <div className="flex-1 overflow-y-auto scrollbar-thin overflow-x-hidden p-2">
        {/* Centramos la grilla horizontalmente y limitamos su ancho máximo para evitar estiramientos exagerados */}
        <div className="max-w-4xl mx-auto flex flex-col">
          {/* Días de la semana */}
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

          {/* Grilla de días con aspect-square */}
          <div className="grid grid-cols-7 gap-1">
            {calendarData.map((slot, index) => {
              const load = getDailyLoad(slot.date)
              const isSelected = currentDate.toDateString() === slot.date.toDateString()
              const isToday = new Date().toDateString() === slot.date.toDateString()

              return (
                <button
                  key={`${slot.date.getTime()}-${index}`}
                  onClick={() => onDateChange(slot.date)}
                  className={cn(
                    'aspect-square rounded-md p-1 sm:p-2 relative flex flex-col items-start justify-between transition-all group outline-none',
                    'border border-border/40 w-full',
                    slot.isCurrentMonth
                      ? 'bg-card text-foreground'
                      : 'bg-muted/30 text-muted-foreground/50',
                    'hover:bg-muted/80 hover:border-primary/40 hover:shadow-sm cursor-pointer',
                    isSelected && 'ring-2 ring-primary z-10 bg-primary/5 border-primary/50',
                    isToday && !isSelected && 'ring-1 ring-primary/30 bg-primary/5 font-semibold'
                  )}
                >
                  <div className="w-full flex justify-between items-start">
                    <span
                      className={cn(
                        'text-xs sm:text-sm',
                        (isToday || isSelected) && 'font-bold text-primary',
                        !slot.isCurrentMonth && 'opacity-60'
                      )}
                    >
                      {slot.day}
                    </span>
                  </div>

                  {/* Texto de turnos (solo si hay espacio suficiente) */}
                  {load > 0 && (
                    <div className="mt-auto w-full text-right hidden lg:block pb-1 overflow-hidden">
                      <span
                        className={cn(
                          'text-[9px] font-medium block truncate transition-colors',
                          slot.isCurrentMonth
                            ? 'text-foreground/60 group-hover:text-primary'
                            : 'text-muted-foreground/40'
                        )}
                      >
                        {load} {load === 1 ? 't' : 't'}
                      </span>
                    </div>
                  )}

                  {/* Barra de carga */}
                  {load > 0 && (
                    <div
                      className={cn(
                        'absolute bottom-0 left-0 right-0 h-1 transition-opacity',
                        slot.isCurrentMonth ? 'opacity-70 group-hover:opacity-100' : 'opacity-30',
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
    </div>
  )
}
