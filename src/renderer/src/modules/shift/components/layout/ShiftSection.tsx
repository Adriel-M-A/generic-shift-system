import { useMemo, useState } from 'react'
import { format } from 'date-fns'
import { es } from 'date-fns/locale'
import { CalendarCheck2, X } from 'lucide-react'
import { Card, CardHeader, CardTitle, CardContent } from '@ui/card'
import { Badge } from '@ui/badge'
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

import { Shift, EstadoTurno } from '../../types'
import { useShifts } from '../../hooks/useShifts'
import { ShiftList } from '../ShiftList'
import { ShiftForm } from '../ShiftForm'

interface ShiftSectionProps {
  date: Date | undefined
  shifts: Shift[]
  loading?: boolean
  formatDateHeader?: (d: Date) => string // La hacemos opcional para el fallback
  changeShiftStatus: (id: number, status: EstadoTurno) => void
}

export function ShiftSection({
  date,
  shifts,
  loading,
  formatDateHeader,
  changeShiftStatus
}: ShiftSectionProps) {
  const { config } = useShifts()
  const [shiftToCancel, setShiftToCancel] = useState<number | null>(null)

  // Fallback de formateo por si la función no viene del padre
  const displayDate = useMemo(() => {
    if (!date) return 'Seleccione una fecha'
    if (typeof formatDateHeader === 'function') return formatDateHeader(date)
    return format(date, "EEEE d 'de' MMMM", { locale: es })
  }, [date, formatDateHeader])

  const filteredShifts = useMemo(() => {
    if (!date || !shifts) return []
    const dateKey = format(date, 'yyyy-MM-dd')

    return shifts
      .filter((s) => {
        const isSameDay = s.fecha === dateKey
        if (!isSameDay) return false
        if (!config) return s.estado === 'pendiente'

        return (
          s.estado === 'pendiente' ||
          (s.estado === 'completado' && config.showCompleted) ||
          (s.estado === 'cancelado' && config.showCancelled) ||
          (s.estado === 'ausente' && config.showAbsent)
        )
      })
      .sort((a, b) => a.hora.localeCompare(b.hora))
  }, [shifts, date, config])

  const shiftToCancelData = useMemo(() => {
    return shifts.find((s) => s.id === shiftToCancel)
  }, [shifts, shiftToCancel])

  const confirmCancel = () => {
    if (shiftToCancel) {
      changeShiftStatus(shiftToCancel, 'cancelado')
      setShiftToCancel(null)
    }
  }

  return (
    <>
      <Card className="flex flex-col border-border/50 shadow-sm overflow-hidden bg-muted/10 h-full">
        <CardHeader className="pb-3 shrink-0 bg-card border-b z-10">
          <div className="flex flex-wrap items-center justify-between gap-y-3 gap-x-4">
            <div className="space-y-1 min-w-0">
              <CardTitle className="text-lg flex items-center gap-2 whitespace-nowrap">
                <CalendarCheck2 className="h-5 w-5 text-primary shrink-0" />
                Agenda del Día
              </CardTitle>
              <p className="text-sm text-muted-foreground capitalize font-medium truncate">
                {displayDate}
              </p>
            </div>

            <div className="shrink-0">
              <ShiftForm
                currentDate={date}
                formatDateHeader={
                  formatDateHeader || ((d) => format(d, "EEEE d 'de' MMMM", { locale: es }))
                }
              />
            </div>
          </div>
        </CardHeader>

        <CardContent className="flex-1 p-0 min-h-0 overflow-hidden relative">
          <ShiftList
            shifts={filteredShifts}
            loading={loading}
            onChangeStatus={changeShiftStatus}
            onRequestCancel={setShiftToCancel}
          />
        </CardContent>
      </Card>

      <AlertDialog open={!!shiftToCancel} onOpenChange={(open) => !open && setShiftToCancel(null)}>
        <AlertDialogContent className="sm:max-w-[425px]">
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
