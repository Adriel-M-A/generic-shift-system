// src/renderer/src/modules/shifts/components/layout/ShiftSection.tsx

import { Turno } from '../../types'
import { ShiftList } from '../ShiftList'

interface ShiftSectionProps {
  date: Date | undefined
  shifts: Turno[]
  formatDateHeader: (d: Date) => string
}

export function ShiftSection({ date, shifts, formatDateHeader }: ShiftSectionProps) {
  return (
    <div className="flex flex-col h-full min-h-0">
      <ShiftList date={date} shifts={shifts} formatDateHeader={formatDateHeader} />
    </div>
  )
}
