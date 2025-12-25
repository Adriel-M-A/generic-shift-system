import { useMemo, useState } from 'react'
import { Card, CardHeader, CardTitle, CardContent } from '@ui/card'
import { ScrollArea } from '@ui/scroll-area'
import { Badge } from '@ui/badge'
import { Button } from '@ui/button'
import { Separator } from '@ui/separator'
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle
} from '@ui/alert-dialog'
import { Check, Clock, Briefcase, CalendarCheck2, X, RotateCcw } from 'lucide-react'
import { format } from 'date-fns'

import { Turno, EstadoTurno } from '../types'
import { NewShiftData } from '../context/ShiftContext'
import { getStatusColor, getStatusLabel } from '../utils'
import { cn } from '@lib/utils'
import { ShiftForm } from './ShiftForm'

interface ShiftListProps {
  date: Date | undefined
  shifts: Turno[]
  formatDateHeader: (d: Date) => string
  changeShiftStatus: (id: number, status: EstadoTurno) => void
  addShift: (data: NewShiftData) => void
}

export function ShiftList({
  date,
  shifts,
  formatDateHeader,
  changeShiftStatus,
  addShift
}: ShiftListProps) {
  const [shiftToCancel, setShiftToCancel] = useState<number | null>(null)

  const shiftToCancelData = useMemo(() => {
    return shifts.find((s) => s.id === shiftToCancel)
  }, [shifts, shiftToCancel])

  const filteredShifts = useMemo(() => {
    if (!date) return []

    const dateKey = format(date, 'yyyy-MM-dd')

    return shifts
      .filter((s) => {
        const isSameDay = s.fecha === dateKey
        return (
          isSameDay &&
          (s.estado === 'pendiente' || s.estado === 'completado' || s.estado === 'en_curso')
        )
      })
      .sort((a, b) => a.hora.localeCompare(b.hora))
  }, [shifts, date])

  const confirmCancel = () => {
    if (shiftToCancel) {
      changeShiftStatus(shiftToCancel, 'cancelado')
      setShiftToCancel(null)
    }
  }

  return (
    <>
      <Card className="flex flex-col border-border/50 shadow-sm overflow-hidden bg-muted/10 h-full">
        <CardHeader className="pb-3 shrink-0 bg-card border-b z-10 flex flex-row items-center justify-between">
          <div>
            <CardTitle className="text-lg flex items-center gap-2">
              <CalendarCheck2 className="h-5 w-5 text-primary" />
              Agenda del Día
            </CardTitle>
            <p className="text-sm text-muted-foreground capitalize font-medium">
              {date ? formatDateHeader(date) : 'Seleccione una fecha'}
            </p>
          </div>

          <ShiftForm currentDate={date} onSave={addShift} formatDateHeader={formatDateHeader} />
        </CardHeader>

        <CardContent className="flex-1 p-0 min-h-0 overflow-hidden relative">
          <ScrollArea className="h-full">
            <div className="flex flex-col gap-3 p-4">
              {filteredShifts.length === 0 ? (
                <div className="flex flex-col items-center justify-center h-40 text-muted-foreground gap-2">
                  <Clock className="h-10 w-10 opacity-20" />
                  <p className="text-sm">No hay turnos para esta fecha.</p>
                </div>
              ) : (
                filteredShifts.map((turno) => {
                  const isCompleted = turno.estado === 'completado'
                  return (
                    <div
                      key={turno.id}
                      className={cn(
                        'flex flex-col gap-2 p-3 rounded-md border border-border/50 bg-card transition-all',
                        'hover:bg-muted/30 hover:border-primary/20 hover:shadow-sm'
                      )}
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
                          className={cn(
                            'text-[10px] px-2 py-0.5 border shadow-none transition-colors',
                            getStatusColor(turno.estado)
                          )}
                        >
                          {getStatusLabel(turno.estado)}
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

                        <div className="flex items-center gap-1">
                          {isCompleted ? (
                            <Button
                              size="sm"
                              variant="ghost"
                              className="h-7 px-2 text-xs gap-1 text-muted-foreground hover:text-orange-600 hover:bg-orange-500/10"
                              onClick={() => changeShiftStatus(turno.id, 'pendiente')}
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
                                onClick={() => setShiftToCancel(turno.id)}
                                title="Cancelar turno"
                              >
                                <X className="h-3.5 w-3.5" />
                              </Button>

                              <Button
                                size="sm"
                                variant="ghost"
                                className="h-7 px-2 text-xs gap-1 text-muted-foreground hover:text-green-600 hover:bg-green-500/10"
                                onClick={() => changeShiftStatus(turno.id, 'completado')}
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
                })
              )}
            </div>
          </ScrollArea>
        </CardContent>
      </Card>

      <AlertDialog open={!!shiftToCancel} onOpenChange={(open) => !open && setShiftToCancel(null)}>
        <AlertDialogContent className="sm:max-w-106.25">
          <AlertDialogHeader>
            <AlertDialogTitle className="text-red-600 flex items-center gap-2">
              <X className="h-5 w-5" /> Cancelar Turno
            </AlertDialogTitle>
            <AlertDialogDescription>
              ¿Estás seguro que deseas cancelar este turno? Esta acción moverá el turno a
              "Cancelados".
            </AlertDialogDescription>
          </AlertDialogHeader>

          {shiftToCancelData && (
            <div className="bg-muted/40 border border-border/50 rounded-md p-3 text-sm space-y-2 my-1">
              <div className="flex justify-between items-center border-b border-border/30 pb-2">
                <span className="text-muted-foreground">Horario:</span>
                <Badge variant="outline" className="font-mono bg-background">
                  {shiftToCancelData.hora}
                </Badge>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-muted-foreground">Cliente:</span>
                <span className="font-semibold text-foreground">{shiftToCancelData.cliente}</span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-muted-foreground">Servicio:</span>
                <span className="font-medium text-foreground">{shiftToCancelData.servicio}</span>
              </div>
            </div>
          )}

          <AlertDialogFooter className="mt-2">
            <AlertDialogCancel>Mantener turno</AlertDialogCancel>
            <AlertDialogAction
              className="bg-red-600 hover:bg-red-700 text-white border-0"
              onClick={confirmCancel}
            >
              Sí, cancelar
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  )
}
