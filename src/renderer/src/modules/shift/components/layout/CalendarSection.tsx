import { useState, useMemo } from 'react'
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

interface CalendarSectionProps {
  date: Date | undefined
  setDate: (date: Date) => void
  getDailyLoad: (date: Date) => number
}

export function CalendarSection({ date, setDate, getDailyLoad }: CalendarSectionProps) {
  const [viewMode, setViewMode] = useState<'month' | 'year'>('month')

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
    setViewMode('month')
  }

  return (
    <Card className="flex flex-col border-border/50 shadow-sm overflow-hidden h-full">
      <CardHeader className="relative h-14 flex flex-row items-center justify-between space-y-0 border-b bg-card z-10 px-4 py-0">
        <CardTitle className="text-lg flex items-center gap-2 text-primary/80">
          <CalendarIcon className="h-5 w-5" />
          <span className="hidden sm:inline text-foreground font-semibold tracking-tight">
            Calendario
          </span>
        </CardTitle>

        <div className="absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2">
          <div className="flex items-center bg-muted/30 rounded-md border border-border/40 overflow-hidden shadow-sm transition-all duration-200 hover:border-primary/40 hover:bg-muted/60 hover:shadow-md group">
            <Button
              variant="ghost"
              size="icon"
              className="h-7 w-7 rounded-none hover:bg-background hover:text-primary transition-colors"
              onClick={handlePrevYear}
              title="Año anterior"
            >
              <ChevronLeft className="h-3.5 w-3.5 opacity-70 group-hover:opacity-100" />
            </Button>

            <span className="text-sm font-bold px-3 tabular-nums text-center min-w-14 select-none cursor-default text-foreground/90 group-hover:text-primary transition-colors">
              {safeDate.getFullYear()}
            </span>

            <Button
              variant="ghost"
              size="icon"
              className="h-7 w-7 rounded-none hover:bg-background hover:text-primary transition-colors"
              onClick={handleNextYear}
              title="Año siguiente"
            >
              <ChevronRight className="h-3.5 w-3.5 opacity-70 group-hover:opacity-100" />
            </Button>
          </div>
        </div>

        <div className="flex items-center gap-1 bg-muted/50 p-1 rounded-md shrink-0 border border-transparent hover:border-border/40 transition-all">
          <Button
            variant={viewMode === 'month' ? 'secondary' : 'ghost'}
            size="sm"
            className={cn(
              'h-7 px-2 text-xs gap-1 transition-all',
              viewMode === 'month' && 'bg-background shadow-sm text-primary font-medium'
            )}
            onClick={() => setViewMode('month')}
            title="Vista mensual"
          >
            <Maximize className="h-3 w-3" />
            <span className="hidden sm:inline">Mes</span>
          </Button>
          <Button
            variant={viewMode === 'year' ? 'secondary' : 'ghost'}
            size="sm"
            className={cn(
              'h-7 px-2 text-xs gap-1 transition-all',
              viewMode === 'year' && 'bg-background shadow-sm text-primary font-medium'
            )}
            onClick={() => setViewMode('year')}
            title="Vista anual"
          >
            <LayoutGrid className="h-3 w-3" />
            <span className="hidden sm:inline">Año</span>
          </Button>
        </div>
      </CardHeader>

      <CardContent className="flex-1 p-0 min-h-0 relative bg-background overflow-hidden">
        {viewMode === 'month' ? (
          <MonthView date={safeDate} setDate={setDate} getDailyLoad={getDailyLoad} />
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
