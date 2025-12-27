import { useState } from 'react'
import { Calendar as CalendarIcon, List } from 'lucide-react'
import { Button } from '@ui/button'
import { cn } from '@lib/utils'

import { useShifts } from '../hooks/useShifts'
import { ShiftHeader } from '../components/ShiftHeader'
import { CalendarSection } from '../components/layout/CalendarSection'
import { ShiftSection } from '../components/layout/ShiftSection'

type MobileTab = 'calendar' | 'list'

export default function Turnos() {
  const {
    currentDate: date,
    setCurrentDate: setDate,
    shifts,
    getDailyLoad,
    formatDateHeader,
    changeShiftStatus,
    loading
  } = useShifts()

  const [mobileTab, setMobileTab] = useState<MobileTab>('calendar')

  return (
    <div className="flex flex-col gap-4 animate-in fade-in duration-500 h-full p-6">
      <ShiftHeader />

      <div className="flex-1 min-h-0 flex flex-col gap-3">
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

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-12 gap-4 flex-1 min-h-0 overflow-hidden">
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
              loading={loading}
              formatDateHeader={formatDateHeader}
              changeShiftStatus={changeShiftStatus}
            />
          </div>
        </div>
      </div>
    </div>
  )
}
