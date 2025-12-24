// src/renderer/src/modules/shift/components/YearView.tsx

import { useShifts } from '../hooks/useShifts'
import { cn } from '@lib/utils'

interface YearViewProps {
  year: number
  currentDate: Date | undefined
  onSelectDate: (date: Date) => void
}

export function YearView({ year, currentDate, onSelectDate }: YearViewProps) {
  const { getDailyLoad } = useShifts()

  const months = Array.from({ length: 12 }, (_, i) => i)
  const weekDays = ['D', 'L', 'M', 'X', 'J', 'V', 'S']

  const getLoadColor = (load: number) => {
    if (load > 7) return 'bg-red-500'
    if (load >= 4) return 'bg-orange-500'
    if (load > 0) return 'bg-blue-500'
    return 'bg-transparent'
  }

  return (
    <div className="h-full overflow-y-auto pr-2 pb-2 pt-2 scroll-smooth">
      <div
        className={cn(
          'grid gap-3',
          'grid-cols-1',
          'sm:grid-cols-2',
          'md:grid-cols-1',
          'lg:grid-cols-2',
          'xl:grid-cols-3',
          '2xl:grid-cols-4'
        )}
      >
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
              className="border border-border/40 rounded-lg p-3 bg-card shadow-sm hover:border-border/80 transition-all flex flex-col"
            >
              <h4 className="text-xs font-bold capitalize mb-2 text-primary/80 text-center">
                {monthName}
              </h4>

              <div className="grid grid-cols-7 gap-1 text-[9px] text-muted-foreground mb-1 text-center font-medium opacity-70">
                {weekDays.map((d) => (
                  <span key={d}>{d}</span>
                ))}
              </div>

              <div className="grid grid-cols-7 gap-1 flex-1 content-start">
                {emptySlots.map((i) => (
                  <div key={`empty-${i}`} />
                ))}

                {days.map((day) => {
                  const thisDate = new Date(year, monthIndex, day)
                  const isSelected = currentDate?.toDateString() === thisDate.toDateString()
                  const isToday = new Date().toDateString() === thisDate.toDateString()
                  const load = getDailyLoad(thisDate)

                  return (
                    <button
                      key={day}
                      onClick={() => onSelectDate(thisDate)}
                      title={load > 0 ? `${load} turnos` : undefined}
                      className={cn(
                        'relative flex items-center justify-center rounded-[3px] transition-all outline-none',
                        'h-8 sm:h-auto sm:aspect-square',
                        'hover:bg-muted focus:ring-1 focus:ring-primary/50',
                        isSelected
                          ? 'bg-primary text-primary-foreground font-bold shadow-sm z-10'
                          : 'text-foreground/80',
                        isToday &&
                          !isSelected &&
                          'ring-1 ring-inset ring-primary/40 font-semibold bg-primary/5'
                      )}
                    >
                      <span className="text-[10px] leading-none z-10">{day}</span>

                      {load > 0 && (
                        <div
                          className={cn(
                            'absolute bottom-0 left-0 right-0 h-1 opacity-70',
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
