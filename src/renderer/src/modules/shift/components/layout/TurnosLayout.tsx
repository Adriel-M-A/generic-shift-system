// src/renderer/src/modules/shift/components/layout/TurnosLayout.tsx

import { useState } from 'react'
import { Calendar as CalendarIcon, List } from 'lucide-react'
import { Button } from '@ui/button'
import { cn } from '@lib/utils'
import { Turno } from '../../types'
import { CalendarSection } from './CalendarSection'
import { ShiftSection } from './ShiftSection'

interface TurnosLayoutProps {
  date: Date | undefined
  setDate: (date: Date) => void
  shifts: Turno[]
  getDailyLoad: (date: Date) => number
  formatDateHeader: (d: Date) => string
}

type MobileTab = 'calendar' | 'list'

export function TurnosLayout({
  date,
  setDate,
  shifts,
  getDailyLoad,
  formatDateHeader
}: TurnosLayoutProps) {
  const [mobileTab, setMobileTab] = useState<MobileTab>('calendar')

  return (
    <div className="flex-1 flex flex-col min-h-0 gap-4">
      {/* Selector de Vistas (Solo visible en Móvil < md) */}
      <div className="flex md:hidden bg-muted p-1 rounded-lg shrink-0">
        <Button
          variant={mobileTab === 'calendar' ? 'default' : 'ghost'}
          size="sm"
          className="flex-1 gap-2"
          onClick={() => setMobileTab('calendar')}
        >
          <CalendarIcon className="h-4 w-4" /> Calendario
        </Button>
        <Button
          variant={mobileTab === 'list' ? 'default' : 'ghost'}
          size="sm"
          className="flex-1 gap-2"
          onClick={() => setMobileTab('list')}
        >
          <List className="h-4 w-4" /> Agenda
        </Button>
      </div>

      <div className="flex-1 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-12 gap-4 min-h-0">
        {/* Sección Calendario */}
        <div
          className={cn(
            'lg:col-span-7 flex flex-col h-full min-h-0 transition-all',
            // Lógica de visibilidad:
            // En móvil: mostrar solo si el tab es 'calendar'
            // En desktop (md+): mostrar SIEMPRE (block)
            mobileTab === 'calendar' ? 'block' : 'hidden md:block'
          )}
        >
          <CalendarSection date={date} setDate={setDate} getDailyLoad={getDailyLoad} />
        </div>

        {/* Sección Agenda/Turnos */}
        <div
          className={cn(
            'lg:col-span-5 flex flex-col h-full min-h-0 transition-all',
            // Lógica de visibilidad:
            // En móvil: mostrar solo si el tab es 'list'
            // En desktop (md+): mostrar SIEMPRE (block)
            mobileTab === 'list' ? 'block' : 'hidden md:block'
          )}
        >
          <ShiftSection date={date} shifts={shifts} formatDateHeader={formatDateHeader} />
        </div>
      </div>
    </div>
  )
}
