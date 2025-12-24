import { Clock } from 'lucide-react'

interface ShiftHeaderProps {
  currentTime: Date
  formatTime: (d: Date) => string
  formatDateHeader: (d: Date) => string
}

export function ShiftHeader({ currentTime, formatTime, formatDateHeader }: ShiftHeaderProps) {
  return (
    <div className="flex items-center justify-between bg-card p-4 rounded-xl border border-border/50 shadow-sm shrink-0">
      <div>
        <h1 className="text-2xl font-bold tracking-tight">Gestión de Turnos</h1>
        <p className="text-muted-foreground text-sm">Panel de control de agenda</p>
      </div>
      <div className="flex items-center gap-3 bg-muted/30 px-4 py-2 rounded-lg border border-border/50">
        <Clock className="h-5 w-5 text-primary" />
        <div className="flex flex-col items-end">
          <span className="font-mono text-xl font-bold leading-none">
            {formatTime(currentTime)}
          </span>
          <span className="text-xs text-muted-foreground capitalize">
            {formatDateHeader(currentTime)}
          </span>
        </div>
      </div>
    </div>
  )
}
