import { useMemo, useState } from 'react'
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

import { useShifts } from '../../hooks/useShifts'
import { ShiftList } from '../ShiftList'
import { ShiftForm } from '../ShiftForm'
import { formatDateHeader } from '../../utils'

export function ShiftSection() {
  const { currentDate, shifts, updateStatus } = useShifts()
  const [shiftToCancel, setShiftToCancel] = useState<number | null>(null)

  const shiftToCancelData = useMemo(() => {
    return shifts.find((s) => s.id === shiftToCancel)
  }, [shifts, shiftToCancel])

  const confirmCancel = () => {
    if (shiftToCancel) {
      updateStatus(shiftToCancel, 'cancelado')
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
                {formatDateHeader(currentDate)}
              </p>
            </div>

            <div className="shrink-0">
              <ShiftForm />
            </div>
          </div>
        </CardHeader>

        <CardContent className="flex-1 p-0 min-h-0 overflow-hidden relative">
          <ShiftList onRequestCancel={setShiftToCancel} />
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
