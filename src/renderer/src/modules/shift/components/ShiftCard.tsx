import { Check, Briefcase, X, RotateCcw, Clock, User, UserCheck } from 'lucide-react'
import { Badge } from '@ui/badge'
import { Button } from '@ui/button'
import { Separator } from '@ui/separator'
import { Turno, EstadoTurno } from '../types'
import { cn } from '@lib/utils'

// Helper simple para colores
const getStatusColor = (status: string) => {
  switch (status) {
    case 'completado':
      return 'bg-emerald-500/15 text-emerald-700 border-emerald-500/20'
    case 'cancelado':
      return 'bg-destructive/15 text-destructive border-destructive/20'
    case 'en_curso':
      return 'bg-blue-500/15 text-blue-700 border-blue-500/20'
    default:
      return 'bg-zinc-100 text-zinc-700 border-zinc-200'
  }
}
const getStatusLabel = (s: string) => s.replace('_', ' ')

interface ShiftCardProps {
  turno: Turno
  onChangeStatus: (id: number, status: EstadoTurno) => void
  onRequestCancel: (id: number) => void
}

export function ShiftCard({ turno, onChangeStatus, onRequestCancel }: ShiftCardProps) {
  const isCompleted = turno.estado === 'completado'
  const isRegistered = !!turno.customerId

  return (
    <div
      className={cn(
        'flex flex-col gap-2 p-3 rounded-md border border-border/50 bg-card transition-all',
        'hover:bg-muted/30 hover:border-primary/20 hover:shadow-sm'
      )}
    >
      {/* Cabecera: Hora y Estado */}
      <div className="flex items-center justify-between">
        <Badge
          variant="outline"
          className="flex items-center gap-1 font-mono text-xs px-2 py-1 bg-background"
        >
          <Clock className="h-3 w-3" />
          {turno.hora}
        </Badge>

        <Badge
          className={cn(
            'text-[10px] px-2 py-0.5 border shadow-none transition-colors uppercase',
            getStatusColor(turno.estado)
          )}
        >
          {getStatusLabel(turno.estado)}
        </Badge>
      </div>

      <Separator className="bg-border/40" />

      <div className="flex flex-wrap items-end justify-between gap-y-3 gap-x-2">
        {/* Datos del cliente */}
        <div className="space-y-0.5 min-w-30">
          <div className="flex items-center gap-1.5">
            {/* CORRECCIÓN: Envolvemos el ícono en un div para usar 'title' */}
            <div
              title={isRegistered ? 'Cliente Registrado' : 'Cliente Manual'}
              className="flex items-center justify-center cursor-help"
            >
              {isRegistered ? (
                <UserCheck className="h-3.5 w-3.5 text-emerald-600" />
              ) : (
                <User className="h-3.5 w-3.5 text-muted-foreground" />
              )}
            </div>

            <h3 className="font-bold text-sm text-foreground leading-tight truncate">
              {turno.cliente}
            </h3>
          </div>

          <div className="flex items-center gap-1 text-xs text-muted-foreground pl-5">
            <Briefcase className="h-3 w-3 shrink-0" />
            <span className="truncate">{turno.servicio}</span>
          </div>
        </div>

        {/* Acciones (Botones) */}
        <div className="flex items-center gap-1 ml-auto">
          {isCompleted ? (
            <Button
              size="sm"
              variant="ghost"
              className="h-7 px-2 text-xs gap-1 text-muted-foreground hover:text-orange-600 hover:bg-orange-500/10"
              onClick={() => onChangeStatus(turno.id, 'pendiente')}
              title="Volver a pendiente"
            >
              <RotateCcw className="h-3.5 w-3.5" />
              <span className="hidden sm:inline">Deshacer</span>
            </Button>
          ) : (
            <>
              <Button
                size="sm"
                variant="ghost"
                className="h-7 w-7 p-0 text-muted-foreground hover:text-red-600 hover:bg-red-500/10 rounded-full"
                onClick={() => onRequestCancel(turno.id)}
                title="Cancelar turno"
              >
                <X className="h-3.5 w-3.5" />
              </Button>

              <Button
                size="sm"
                variant="ghost"
                className="h-7 px-2 text-xs gap-1 text-muted-foreground hover:text-green-600 hover:bg-green-500/10"
                onClick={() => onChangeStatus(turno.id, 'completado')}
                title="Marcar como completado"
              >
                <div className="h-4 w-4 rounded-full border border-current flex items-center justify-center">
                  <Check className="h-2.5 w-2.5 opacity-0 hover:opacity-100" />
                </div>
                <span className="hidden sm:inline">Completar</span>
              </Button>
            </>
          )}
        </div>
      </div>
    </div>
  )
}
