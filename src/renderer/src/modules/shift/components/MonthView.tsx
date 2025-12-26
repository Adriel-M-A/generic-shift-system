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

  // --- CORRECCIÓN: Usando tus variables de main.css ---
  const getLoadColor = (load: number) => {
    const { low, medium } = config.thresholds
    // Nota: Tailwind v4 mapea automáticamente --color-load-high a bg-load-high
    if (load > medium) return 'bg-load-high text-white'
    if (load > low) return 'bg-load-medium text-stone-900' // Texto oscuro para contraste con amarillo
    if (load > 0) return 'bg-load-low text-white'
    return 'bg-transparent'
  }

  const getDayClasses = (isSelected: boolean, isToday: boolean) => {
    return cn(
      'relative flex flex-col items-start justify-between transition-all outline-none group bg-card text-foreground hover:bg-muted/50 overflow-hidden border border-border/40',
      isSelected && 'ring-2 ring-primary z-10',
      isToday && !isSelected && 'ring-1 ring-inset ring-primary/50 font-semibold bg-primary/5'
    )
  }

  return (
    <div className="flex flex-col h-full bg-card shadow-sm min-h-0">
      {/* Header superior */}
      <div className="flex items-center justify-between p-3 border-b bg-card shrink-0">
        <h2 className="text-lg font-semibold capitalize pl-1">{monthName}</h2>

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

      {/* Calendario */}
      <div className="flex-1 overflow-y-auto">
        <div className="p-2">
          {/* Días de la semana */}
          <div className="grid grid-cols-7 gap-1 border-b bg-muted/40 mb-1">
            {weekDays.map((day) => (
              <div
                key={day}
                className="py-2 text-[10px] sm:text-xs font-medium text-muted-foreground uppercase tracking-wider text-center"
              >
                {day}
              </div>
            ))}
          </div>

          {/* Grilla de días */}
          <div className="grid grid-cols-7 gap-1 auto-rows-min">
            {calendarData.map((slot, index) => {
              if (slot.day === null) {
                return <div key={`empty-${index}`} className="aspect-square" />
              }

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

                  {/* Texto de cantidad de turnos */}
                  {load > 0 && (
                    <div className="mt-auto w-full text-right hidden lg:block pb-1">
                      <span className="text-[10px] font-medium block truncate text-foreground/70">
                        {load} {load === 1 ? 'turno' : 'turnos'}
                      </span>
                    </div>
                  )}

                  {/* BARRA INFERIOR DE CARGA (Usando tus colores) */}
                  {load > 0 && (
                    <div
                      className={cn(
                        'absolute bottom-0 left-0 right-0 h-1 opacity-60',
                        getLoadColor(load).split(' ')[0] // Solo tomamos la clase de background (ej: bg-load-high)
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
