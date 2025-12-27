import { useShifts } from '../hooks/useShifts'
import { cn } from '@lib/utils'

interface YearViewProps {
  year: number
  currentDate: Date | undefined
  onSelectDate: (date: Date) => void
  onMonthDoubleClick: (monthIndex: number) => void
}

export function YearView({ year, currentDate, onSelectDate, onMonthDoubleClick }: YearViewProps) {
  const { getDailyLoad, config } = useShifts()

  const months = Array.from({ length: 12 }, (_, i) => i)
  const weekDays =
    config.startOfWeek === 'monday'
      ? ['L', 'M', 'X', 'J', 'V', 'S', 'D']
      : ['D', 'L', 'M', 'X', 'J', 'V', 'S']

  const getLoadColor = (load: number) => {
    const { low, medium } = config.thresholds
    if (load > medium) return 'bg-load-high'
    if (load > low) return 'bg-load-medium'
    if (load > 0) return 'bg-load-low'
    return 'bg-transparent'
  }

  return (
    <div className="h-full overflow-y-auto p-3">
      <div className="grid gap-4 grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
        {months.map((monthIndex) => {
          const firstDayOfMonth = new Date(year, monthIndex, 1)
          const monthName = firstDayOfMonth.toLocaleDateString('es-ES', { month: 'long' })
          const daysInMonth = new Date(year, monthIndex + 1, 0).getDate()
          const startDay = firstDayOfMonth.getDay()

          let emptySlotsCount = startDay
          if (config.startOfWeek === 'monday') {
            emptySlotsCount = startDay === 0 ? 6 : startDay - 1
          }

          return (
            <div
              key={monthIndex}
              onDoubleClick={() => onMonthDoubleClick(monthIndex)}
              className="border border-border/40 rounded-lg p-3 bg-card shadow-sm hover:bg-muted/10 transition-all cursor-pointer"
            >
              <h4 className="text-xs font-bold capitalize mb-2 text-primary/80 text-center">
                {monthName}
              </h4>
              <div className="grid grid-cols-7 gap-1 text-[9px] text-muted-foreground mb-1 text-center font-medium">
                {weekDays.map((d) => (
                  <span key={d}>{d}</span>
                ))}
              </div>
              <div className="grid grid-cols-7 gap-1">
                {Array.from({ length: emptySlotsCount }).map((_, i) => (
                  <div key={`empty-${i}`} />
                ))}
                {Array.from({ length: daysInMonth }).map((_, i) => {
                  const day = i + 1
                  const thisDate = new Date(year, monthIndex, day)
                  const load = getDailyLoad(thisDate)
                  const isSelected = currentDate?.toDateString() === thisDate.toDateString()
                  const isToday = new Date().toDateString() === thisDate.toDateString()

                  return (
                    <button
                      key={day}
                      onClick={(e) => {
                        e.stopPropagation()
                        onSelectDate(thisDate)
                      }}
                      className={cn(
                        'relative aspect-square flex items-center justify-center rounded-sm text-[10px] transition-all',
                        isSelected
                          ? 'bg-primary text-primary-foreground font-bold'
                          : 'text-foreground/80 hover:bg-muted',
                        isToday && !isSelected && 'ring-1 ring-primary/40 bg-primary/5'
                      )}
                    >
                      {day}
                      {load > 0 && (
                        <div
                          className={cn(
                            'absolute bottom-0 left-0 right-0 h-0.5 opacity-70',
                            getLoadColor(load)
                          )}
                        />
                      )}
                    </button>
                  )
                })}
              </div>
            </div>
          )
        })}
      </div>
    </div>
  )
}
