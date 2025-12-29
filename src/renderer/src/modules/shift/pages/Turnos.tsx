import { CalendarSection } from '../components/layout/CalendarSection'
import { ShiftSection } from '../components/layout/ShiftSection'

export default function Turnos() {
  return (
    <div className="grid grid-cols-12 gap-4 h-[calc(100vh-(--spacing(16)))] overflow-hidden p-4">
      <div className="col-span-12 lg:col-span-8 h-full min-h-0">
        <CalendarSection />
      </div>

      <div className="col-span-12 lg:col-span-4 h-full min-h-0">
        <ShiftSection />
      </div>
    </div>
  )
}
