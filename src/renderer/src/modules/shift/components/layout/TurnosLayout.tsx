import { useState } from 'react'
import { Calendar as CalendarIcon, List } from 'lucide-react'
import { Button } from '@ui/button'
import { cn } from '@lib/utils'
import { CalendarSection } from './CalendarSection'
import { ShiftSection } from './ShiftSection'
import { useShifts } from '../../hooks/useShifts'

type MobileTab = 'calendar' | 'list'

export function TurnosLayout() {
  // Consumimos los datos directamente del contexto
  const { date, setDate, shifts, getDailyLoad, formatDateHeader, changeShiftStatus, addShift } =
    useShifts()

  const [mobileTab, setMobileTab] = useState<MobileTab>('calendar')

  return (
    <div className="flex flex-col h-full min-h-0 gap-3">
      {/* ... (La barra de botones móvil sigue igual) ... */}
      <div className="flex md:hidden bg-muted/50 p-1 rounded-lg shrink-0 border border-border/50">
        <Button
          variant={mobileTab === 'calendar' ? 'default' : 'ghost'}
          size="sm"
          className="flex-1 gap-2 h-8"
          onClick={() => setMobileTab('calendar')}
        >
          <CalendarIcon className="h-3.5 w-3.5" /> Calendario
        </Button>
        <Button
          variant={mobileTab === 'list' ? 'default' : 'ghost'}
          size="sm"
          className="flex-1 gap-2 h-8"
          onClick={() => setMobileTab('list')}
        >
          <List className="h-3.5 w-3.5" /> Agenda
        </Button>
      </div>

      <div className="flex-1 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-12 gap-4 min-h-0 overflow-hidden">
        <div
          className={cn(
            'lg:col-span-7 flex flex-col h-full min-h-0 overflow-hidden transition-all',
            mobileTab === 'calendar' ? 'flex' : 'hidden md:flex'
          )}
        >
          <CalendarSection date={date} setDate={setDate} getDailyLoad={getDailyLoad} />
        </div>

        <div
          className={cn(
            'lg:col-span-5 flex flex-col h-full min-h-0 overflow-hidden transition-all',
            mobileTab === 'list' ? 'flex' : 'hidden md:flex'
          )}
        >
          <ShiftSection
            date={date}
            shifts={shifts}
            formatDateHeader={formatDateHeader}
            changeShiftStatus={changeShiftStatus}
            addShift={addShift}
          />
        </div>
      </div>
    </div>
  )
}
