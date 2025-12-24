// src/renderer/src/modules/shifts/components/layout/CalendarSection.tsx

import { useState, useMemo } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@ui/card'
import { Button } from '@ui/button'
import { Calendar as CalendarIcon, Maximize, LayoutGrid } from 'lucide-react'
import { MonthView } from '../MonthView'
import { YearView } from '../YearView'

interface CalendarSectionProps {
  date: Date | undefined
  setDate: (date: Date) => void
  getDailyLoad: (date: Date) => number
}

export function CalendarSection({ date, setDate, getDailyLoad }: CalendarSectionProps) {
  const [viewMode, setViewMode] = useState<'month' | 'year'>('month')

  const safeDate = useMemo(() => date || new Date(), [date])

  return (
    <Card className="flex-1 border-border/50 shadow-sm flex flex-col min-h-0 overflow-hidden">
      <CardHeader className="pb-2 shrink-0 flex flex-row items-center justify-between space-y-0">
        <CardTitle className="text-lg flex items-center gap-2">
          <CalendarIcon className="h-5 w-5 text-primary" />
          <span className="truncate">Calendario {safeDate.getFullYear()}</span>
        </CardTitle>

        {/* Vista selector responsivo */}
        <div className="flex items-center gap-1 bg-muted p-1 rounded-md shrink-0">
          <Button
            variant={viewMode === 'month' ? 'secondary' : 'ghost'}
            size="sm"
            className="h-7 px-2 text-xs gap-1"
            onClick={() => setViewMode('month')}
            title="Vista mensual"
          >
            <Maximize className="h-3 w-3" />
            <span className="hidden sm:inline">Mes</span>
          </Button>
          <Button
            variant={viewMode === 'year' ? 'secondary' : 'ghost'}
            size="sm"
            className="h-7 px-2 text-xs gap-1"
            onClick={() => setViewMode('year')}
            title="Vista anual"
          >
            <LayoutGrid className="h-3 w-3" />
            <span className="hidden sm:inline">Año</span>
          </Button>
        </div>
      </CardHeader>

      <CardContent className="flex-1 p-0 min-h-0 overflow-hidden relative">
        {viewMode === 'month' ? (
          <MonthView date={safeDate} setDate={setDate} getDailyLoad={getDailyLoad} />
        ) : (
          <YearView year={safeDate.getFullYear()} currentDate={date} onSelectDate={setDate} />
        )}
      </CardContent>
    </Card>
  )
}
