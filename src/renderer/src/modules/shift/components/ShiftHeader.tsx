import { useState, useEffect } from 'react'
import { Clock } from 'lucide-react'

// Ya no necesitamos recibir currentTime ni formatTime como props
interface ShiftHeaderProps {
  // Mantenemos esta prop por si quieres mostrar la fecha seleccionada del calendario en el título,
  // pero para el reloj usaremos la hora local interna.
  formatDateHeader?: (d: Date) => string
}

export function ShiftHeader({ formatDateHeader }: ShiftHeaderProps) {
  const [currentTime, setCurrentTime] = useState(new Date())

  useEffect(() => {
    // El intervalo vive solo aquí. Si este componente se desmonta, el intervalo muere.
    // Solo este componente se re-renderiza cada segundo.
    const timer = setInterval(() => setCurrentTime(new Date()), 1000)
    return () => clearInterval(timer)
  }, [])

  // Formateadores locales para el reloj
  const formatTime = (d: Date) =>
    d.toLocaleTimeString('es-ES', { hour: '2-digit', minute: '2-digit' })

  const formatDate = (d: Date) =>
    d.toLocaleDateString('es-ES', { weekday: 'long', day: 'numeric', month: 'long' })

  return (
    <div className="flex items-center justify-between bg-card p-4 rounded-xl border border-border/50 shadow-sm shrink-0">
      <div className="flex flex-col gap-1">
        <h1 className="text-2xl font-bold tracking-tight">Gestión de Turnos</h1>
        <p className="text-muted-foreground text-sm hidden sm:block">Panel de control de agenda</p>
      </div>

      <div className="hidden md:flex items-center gap-3 bg-muted/30 px-4 py-2 rounded-lg border border-border/50">
        <Clock className="h-5 w-5 text-primary" />
        <div className="flex flex-col items-end">
          <span className="font-mono text-xl font-bold leading-none">
            {formatTime(currentTime)}
          </span>
          <span className="text-xs text-muted-foreground capitalize">
            {formatDate(currentTime)}
          </span>
        </div>
      </div>
    </div>
  )
}
