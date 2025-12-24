// src/renderer/src/modules/shifts/components/ShiftList.tsx

import { Card, CardTitle, CardContent } from '@ui/card'
import { Button } from '@ui/button'
import { ScrollArea } from '@ui/scroll-area'
import { Badge } from '@ui/badge'
import { Separator } from '@ui/separator'
import { Plus, Calendar as CalendarIcon, Clock, Briefcase, User } from 'lucide-react'
import { Turno, EstadoTurno } from '../types'

interface ShiftListProps {
  date: Date | undefined
  shifts: Turno[]
  formatDateHeader: (d: Date) => string
}

export function ShiftList({ date, shifts, formatDateHeader }: ShiftListProps) {
  const getStatusColor = (estado: EstadoTurno) => {
    switch (estado) {
      case 'pendiente':
        return 'bg-yellow-500/10 text-yellow-600 border-yellow-200'
      case 'en_curso':
        return 'bg-blue-500/10 text-blue-600 border-blue-200'
      case 'completado':
        return 'bg-green-500/10 text-green-600 border-green-200'
      case 'cancelado':
        return 'bg-red-500/10 text-red-600 border-red-200'
      default:
        return 'bg-gray-100 text-gray-600'
    }
  }

  return (
    <Card className="flex-1 flex flex-col border-border/50 shadow-sm bg-muted/10 overflow-hidden">
      <div className="p-4 border-b bg-card rounded-t-xl flex items-center justify-between shrink-0">
        <div>
          <h2 className="font-bold text-lg">Agenda</h2>
          <p className="text-xs text-muted-foreground capitalize">
            {date ? formatDateHeader(date) : 'Selecciona una fecha'}
          </p>
        </div>
        <Button size="sm" className="gap-2 shadow-sm">
          <Plus className="h-4 w-4" /> Nuevo
        </Button>
      </div>

      <ScrollArea className="flex-1">
        <div className="p-4 space-y-3">
          {shifts.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-10 text-muted-foreground gap-2 opacity-50">
              <CalendarIcon className="h-10 w-10" />
              <p>No hay turnos para este día.</p>
            </div>
          ) : (
            shifts.map((turno) => (
              <div
                key={turno.id}
                className="group flex flex-col gap-2 p-3 rounded-lg border bg-card hover:border-primary/50 transition-all shadow-sm cursor-pointer"
              >
                <div className="flex items-center justify-between">
                  <Badge
                    variant="outline"
                    className="flex items-center gap-1 font-mono text-xs px-2 py-1 bg-background"
                  >
                    <Clock className="h-3 w-3" />
                    {turno.hora}
                  </Badge>
                  <Badge
                    className={`text-[10px] px-2 py-0.5 border-0 shadow-none ${getStatusColor(turno.estado)}`}
                  >
                    {turno.estado.replace('_', ' ').toUpperCase()}
                  </Badge>
                </div>
                <Separator className="bg-border/40" />
                <div className="flex justify-between items-end">
                  <div className="space-y-0.5">
                    <h3 className="font-bold text-sm text-foreground">{turno.cliente}</h3>
                    <div className="flex items-center gap-1 text-xs text-muted-foreground">
                      <Briefcase className="h-3 w-3" />
                      {turno.servicio}
                    </div>
                  </div>
                  <div className="flex items-center gap-1 text-xs font-medium text-muted-foreground bg-muted/50 px-2 py-1 rounded">
                    <User className="h-3 w-3" />
                    {turno.profesional}
                  </div>
                </div>
              </div>
            ))
          )}
        </div>
      </ScrollArea>
    </Card>
  )
}
