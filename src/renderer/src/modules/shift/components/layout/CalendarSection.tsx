import { useMemo } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@ui/card'
import { Button } from '@ui/button'
import {
  Calendar as CalendarIcon,
  Maximize,
  LayoutGrid,
  ChevronLeft,
  ChevronRight
} from 'lucide-react'
import { MonthView } from '../MonthView'
import { YearView } from '../YearView'
import { cn } from '@lib/utils'
import { useShifts } from '../../hooks/useShifts'

interface CalendarSectionProps {
  date: Date | undefined
  setDate: (date: Date) => void
}

export function CalendarSection({ date, setDate }: CalendarSectionProps) {
  const { view, changeView } = useShifts()
  const safeDate = useMemo(() => date || new Date(), [date])

  const handlePrevYear = () => {
    const newDate = new Date(safeDate)
    newDate.setFullYear(safeDate.getFullYear() - 1)
    setDate(newDate)
  }

  const handleNextYear = () => {
    const newDate = new Date(safeDate)
    newDate.setFullYear(safeDate.getFullYear() + 1)
    setDate(newDate)
  }

  const handleMonthDoubleClick = (monthIndex: number) => {
    const newDate = new Date(safeDate)
    newDate.setMonth(monthIndex)
    setDate(newDate)
    changeView('month')
  }

  return (
    <Card className="flex flex-col border-border/50 shadow-sm overflow-hidden bg-muted/10 h-full">
      <CardHeader className="shrink-0 bg-card border-b z-10 p-3 h-15 flex justify-center">
        <div className="grid grid-cols-2 lg:grid-cols-3 items-center w-full">
          <div className="hidden lg:flex items-center gap-2 justify-start">
            <CardTitle className="text-lg flex items-center gap-2">
              <CalendarIcon className="h-5 w-5 text-primary" /> Agenda
            </CardTitle>
          </div>

          <div className="flex items-center justify-start lg:justify-center">
            <div className="flex items-center bg-muted/30 rounded-md border border-border/40 overflow-hidden shadow-sm group">
              <Button
                variant="ghost"
                size="icon"
                className="h-8 w-8 rounded-none"
                onClick={handlePrevYear}
              >
                <ChevronLeft className="h-4 w-4 opacity-70 group-hover:opacity-100" />
              </Button>
              <span className="text-sm font-bold px-3 min-w-16 text-center select-none text-foreground/90 group-hover:text-primary">
                {safeDate.getFullYear()}
              </span>
              <Button
                variant="ghost"
                size="icon"
                className="h-8 w-8 rounded-none"
                onClick={handleNextYear}
              >
                <ChevronRight className="h-4 w-4 opacity-70 group-hover:opacity-100" />
              </Button>
            </div>
          </div>

          <div className="flex items-center justify-end">
            <div className="flex items-center gap-1 bg-muted/50 p-1 rounded-md border border-transparent hover:border-border/40">
              <Button
                variant={view === 'month' ? 'secondary' : 'ghost'}
                size="sm"
                className={cn(
                  'h-7 px-2 text-xs gap-1',
                  view === 'month' && 'bg-background shadow-sm text-primary font-medium'
                )}
                onClick={() => changeView('month')}
              >
                <Maximize className="h-3.5 w-3.5" /> <span className="hidden sm:inline">Mes</span>
              </Button>
              <Button
                variant={view === 'year' ? 'secondary' : 'ghost'}
                size="sm"
                className={cn(
                  'h-7 px-2 text-xs gap-1',
                  view === 'year' && 'bg-background shadow-sm text-primary font-medium'
                )}
                onClick={() => changeView('year')}
              >
                <LayoutGrid className="h-3.5 w-3.5" /> <span className="hidden sm:inline">Año</span>
              </Button>
            </div>
          </div>
        </div>
      </CardHeader>

      <CardContent className="flex-1 p-0 min-h-0 relative bg-background overflow-hidden">
        {view === 'month' ? (
          <MonthView currentDate={safeDate} onDateChange={setDate} />
        ) : (
          <YearView
            year={safeDate.getFullYear()}
            currentDate={date}
            onSelectDate={setDate}
            onMonthDoubleClick={handleMonthDoubleClick}
          />
        )}
      </CardContent>
    </Card>
  )
}
