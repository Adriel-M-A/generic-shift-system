import {
  Check,
  Briefcase,
  X,
  RotateCcw,
  Clock,
  User,
  UserCheck,
  UserX,
  Calendar
} from 'lucide-react'
import { Badge } from '@ui/badge'
import { Button } from '@ui/button'
import { Separator } from '@ui/separator'
import { Shift, EstadoTurno } from '@shared/types/shift'
import { cn } from '@lib/utils'
import { getStatusStyles, getStatusLabel } from '../utils'

interface ShiftCardProps {
  turno: Shift
  onChangeStatus: (id: number, status: EstadoTurno) => void
  onRequestCancel: (id: number) => void
  showDate?: boolean
}

export function ShiftCard({
  turno,
  onChangeStatus,
  onRequestCancel,
  showDate = false
}: ShiftCardProps) {
  const styles = getStatusStyles(turno.estado)
  const isPending = turno.estado === 'pendiente'
  const isRegistered = !!turno.customer_id

  return (
    <div
      className={cn(
        'group relative flex flex-col gap-2 p-3 pl-4 rounded-md border border-border/50 bg-card transition-all',
        'hover:bg-muted/30 hover:border-primary/20 hover:shadow-sm',
        (turno.estado === 'cancelado' || turno.estado === 'ausente') && 'opacity-70'
      )}
    >
      <div
        className={cn(
          'absolute left-0 top-2 bottom-2 w-1 rounded-r-full transition-colors',
          styles.accent
        )}
      />

      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <Badge
            variant="outline"
            className="flex items-center gap-1 font-mono text-xs px-2 py-1 bg-background shadow-none"
          >
            <Clock className="h-3 w-3 text-muted-foreground" />
            {turno.hora}
          </Badge>

          {showDate && (
            <Badge
              variant="secondary"
              className="flex items-center gap-1 text-[10px] px-2 py-1 bg-muted/50 border-transparent font-bold uppercase tracking-tight"
            >
              <Calendar className="h-3 w-3 opacity-70" />
              {turno.fecha}
            </Badge>
          )}
        </div>

        <Badge
          className={cn(
            'text-[10px] px-2 py-0.5 border shadow-none transition-colors uppercase font-bold tracking-wider',
            styles.badge
          )}
        >
          {getStatusLabel(turno.estado)}
        </Badge>
      </div>

      <Separator className="bg-border/40" />

      <div className="flex flex-wrap items-end justify-between gap-y-3 gap-x-2">
        <div className="space-y-1 min-w-0 flex-1">
          <div className="flex items-center gap-2">
            <div className="flex items-center justify-center shrink-0">
              {isRegistered ? (
                <UserCheck className="h-4 w-4 text-emerald-600 dark:text-emerald-500" />
              ) : (
                <User className="h-4 w-4 text-muted-foreground/60" />
              )}
            </div>
            <h3 className="font-bold text-sm text-foreground leading-tight truncate pr-2">
              {turno.cliente}
            </h3>
          </div>

          <div className="flex items-center gap-1.5 text-xs text-muted-foreground pl-6">
            <Briefcase className="h-3 w-3 shrink-0 opacity-70" />
            <span className="truncate italic">{turno.servicio}</span>
          </div>
        </div>

        <div className="flex items-center gap-1.5 ml-auto shrink-0">
          {!isPending ? (
            <Button
              size="sm"
              variant="ghost"
              className="h-8 px-2 text-xs gap-1.5 text-muted-foreground hover:text-primary hover:bg-primary/10"
              onClick={() => onChangeStatus(turno.id, 'pendiente')}
              title="Restablecer a pendiente"
            >
              <RotateCcw className="h-3.5 w-3.5" />
              <span className="hidden sm:inline">Restablecer</span>
            </Button>
          ) : (
            <>
              <Button
                size="sm"
                variant="ghost"
                className="h-8 w-8 p-0 text-muted-foreground hover:text-destructive hover:bg-destructive/10 rounded-full"
                onClick={() => onRequestCancel(turno.id)}
                title="Cancelar turno"
              >
                <X className="h-4 w-4" />
              </Button>

              <Button
                size="sm"
                variant="ghost"
                className="h-8 w-8 p-0 text-muted-foreground hover:text-amber-600 hover:bg-amber-500/10 rounded-full"
                onClick={() => onChangeStatus(turno.id, 'ausente')}
                title="Marcar como Ausente"
              >
                <UserX className="h-4 w-4" />
              </Button>

              <Button
                size="sm"
                variant="outline"
                className="h-8 px-3 text-xs gap-2 border-border/60 hover:border-emerald-500/50 hover:text-emerald-600 hover:bg-emerald-500/5 dark:hover:text-emerald-400"
                onClick={() => onChangeStatus(turno.id, 'completado')}
              >
                <Check className="h-3.5 w-3.5" />
                <span>Completar</span>
              </Button>
            </>
          )}
        </div>
      </div>
    </div>
  )
}
