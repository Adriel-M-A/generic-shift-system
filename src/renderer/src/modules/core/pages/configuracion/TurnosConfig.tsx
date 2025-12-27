import { useState, useEffect } from 'react'
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@ui/card'
import { Label } from '@ui/label'
import { Input } from '@ui/input'
import { Button } from '@ui/button'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@ui/select'
import { Checkbox } from '@ui/checkbox'
import { useShifts } from '@shift/hooks/useShifts'
import { Clock, Calendar, ShieldCheck, Eye } from 'lucide-react'
import { Separator } from '@ui/separator'

export default function TurnosConfig() {
  const { config, updateConfig } = useShifts()
  const [localConfig, setLocalConfig] = useState(config)
  const [isPending, setIsPending] = useState(false)

  useEffect(() => {
    if (config) {
      setLocalConfig(config)
    }
  }, [config])

  const handleSave = async () => {
    setIsPending(true)
    try {
      await updateConfig(localConfig)
    } finally {
      setIsPending(false)
    }
  }

  if (!localConfig) return null

  return (
    <div className="space-y-6">
      <Card className="border-border/50 shadow-sm">
        <CardHeader>
          <div className="flex items-center gap-2">
            <Calendar className="h-5 w-5 text-primary" />
            <CardTitle>Configuración de Agenda</CardTitle>
          </div>
          <CardDescription>
            Ajusta los horarios y la visibilidad de los turnos en el sistema.
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="space-y-2">
              <Label className="text-xs font-bold uppercase text-muted-foreground">
                Hora de Apertura
              </Label>
              <div className="relative">
                <Clock className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                <Input
                  type="time"
                  className="pl-9"
                  value={localConfig.openingTime}
                  onChange={(e) => setLocalConfig({ ...localConfig, openingTime: e.target.value })}
                />
              </div>
            </div>

            <div className="space-y-2">
              <Label className="text-xs font-bold uppercase text-muted-foreground">
                Hora de Cierre
              </Label>
              <div className="relative">
                <Clock className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                <Input
                  type="time"
                  className="pl-9"
                  value={localConfig.closingTime}
                  onChange={(e) => setLocalConfig({ ...localConfig, closingTime: e.target.value })}
                />
              </div>
            </div>

            <div className="space-y-2">
              <Label className="text-xs font-bold uppercase text-muted-foreground">
                Intervalo (Minutos)
              </Label>
              <Select
                value={String(localConfig.interval)}
                onValueChange={(val) => setLocalConfig({ ...localConfig, interval: Number(val) })}
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="15">15 minutos</SelectItem>
                  <SelectItem value="30">30 minutos</SelectItem>
                  <SelectItem value="45">45 minutos</SelectItem>
                  <SelectItem value="60">1 hora</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>

          <Separator className="bg-border/40" />

          <div className="space-y-4">
            <div className="flex items-center gap-2">
              <Eye className="h-4 w-4 text-primary" />
              <h3 className="text-sm font-bold uppercase tracking-wider">Visibilidad en Agenda</h3>
            </div>
            <p className="text-xs text-muted-foreground">
              Selecciona qué estados deseas visualizar en la lista diaria de turnos.
            </p>

            <div className="grid grid-cols-2 md:grid-cols-4 gap-4 pt-2">
              <div className="flex items-center space-x-2 bg-muted/30 p-3 rounded-md border border-transparent opacity-80">
                <Checkbox id="vis-pendiente" checked disabled />
                <Label htmlFor="vis-pendiente" className="text-sm cursor-default">
                  Pendientes
                </Label>
              </div>

              <div className="flex items-center space-x-2 p-3 rounded-md border border-border/50 hover:bg-muted/20 transition-colors">
                <Checkbox
                  id="vis-completado"
                  checked={localConfig.showCompleted}
                  onCheckedChange={(checked) =>
                    setLocalConfig({ ...localConfig, showCompleted: !!checked })
                  }
                />
                <Label htmlFor="vis-completado" className="text-sm cursor-pointer">
                  Completados
                </Label>
              </div>

              <div className="flex items-center space-x-2 p-3 rounded-md border border-border/50 hover:bg-muted/20 transition-colors">
                <Checkbox
                  id="vis-ausente"
                  checked={localConfig.showAbsent}
                  onCheckedChange={(checked) =>
                    setLocalConfig({ ...localConfig, showAbsent: !!checked })
                  }
                />
                <Label htmlFor="vis-ausente" className="text-sm cursor-pointer">
                  Ausentes
                </Label>
              </div>

              <div className="flex items-center space-x-2 p-3 rounded-md border border-border/50 hover:bg-muted/20 transition-colors">
                <Checkbox
                  id="vis-cancelado"
                  checked={localConfig.showCancelled}
                  onCheckedChange={(checked) =>
                    setLocalConfig({ ...localConfig, showCancelled: !!checked })
                  }
                />
                <Label htmlFor="vis-cancelado" className="text-sm cursor-pointer">
                  Cancelados
                </Label>
              </div>
            </div>
          </div>

          <div className="flex justify-end pt-4">
            <Button onClick={handleSave} disabled={isPending} className="gap-2">
              <ShieldCheck className="h-4 w-4" />
              {isPending ? 'Guardando...' : 'Guardar Cambios'}
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
