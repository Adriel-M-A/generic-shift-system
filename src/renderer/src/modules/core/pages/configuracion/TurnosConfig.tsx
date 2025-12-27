import { useState, useEffect } from 'react'
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@ui/card'
import { Label } from '@ui/label'
import { Input } from '@ui/input'
import { Button } from '@ui/button'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@ui/select'
import { Checkbox } from '@ui/checkbox'
import { useShifts } from '@shift/hooks/useShifts'
import { Clock, Calendar, ShieldCheck, Eye, Activity } from 'lucide-react'
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

  // Lógica de "empuje" para los umbrales
  const handleLowThresholdChange = (val: number) => {
    let newMedium = localConfig.thresholds.medium

    // Si el nuevo valor de 'Baja' alcanza o supera a 'Media',
    // empujamos 'Media' hacia arriba (siempre +1)
    if (val >= newMedium) {
      newMedium = val + 1
    }

    setLocalConfig({
      ...localConfig,
      thresholds: {
        low: val,
        medium: newMedium
      }
    })
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
            Ajusta los horarios, visibilidad y los indicadores de intensidad del calendario.
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          {/* SECCIÓN 1: HORARIOS E INTERVALO */}
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

          {/* SECCIÓN 2: VISIBILIDAD DE ESTADOS */}
          <div className="space-y-4">
            <div className="flex items-center gap-2">
              <Eye className="h-4 w-4 text-primary" />
              <h3 className="text-sm font-bold uppercase tracking-wider">Visibilidad en Agenda</h3>
            </div>
            <p className="text-xs text-muted-foreground">
              Define qué turnos quieres ver listados en tu panel derecho de la agenda.
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

          <Separator className="bg-border/40" />

          {/* SECCIÓN 3: UMBRALES DE CARGA */}
          <div className="space-y-4">
            <div className="flex items-center gap-2">
              <Activity className="h-4 w-4 text-primary" />
              <h3 className="text-sm font-bold uppercase tracking-wider">Umbrales de Intensidad</h3>
            </div>
            <p className="text-xs text-muted-foreground">
              Configura cuántos turnos definen los colores de intensidad en las celdas del
              calendario.
            </p>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-10 pt-2 px-2">
              {/* Carga Baja */}
              <div className="space-y-3">
                <div className="flex items-center gap-2">
                  <div className="h-3 w-3 rounded-full bg-load-low" />
                  <span className="text-xs font-bold uppercase">Intensidad Baja</span>
                </div>
                <div className="space-y-1.5">
                  <Label className="text-[10px] text-muted-foreground">Máximo de turnos</Label>
                  <Input
                    type="number"
                    min={1}
                    value={localConfig.thresholds.low}
                    onChange={(e) => handleLowThresholdChange(Number(e.target.value))}
                  />
                </div>
                <p className="text-[10px] text-muted-foreground italic opacity-70">
                  Rango: 1 a {localConfig.thresholds.low} turnos.
                </p>
              </div>

              {/* Carga Media */}
              <div className="space-y-3">
                <div className="flex items-center gap-2">
                  <div className="h-3 w-3 rounded-full bg-load-medium" />
                  <span className="text-xs font-bold uppercase">Intensidad Media</span>
                </div>
                <div className="space-y-1.5">
                  <Label className="text-[10px] text-muted-foreground">Máximo de turnos</Label>
                  <Input
                    type="number"
                    min={localConfig.thresholds.low + 1}
                    value={localConfig.thresholds.medium}
                    onChange={(e) =>
                      setLocalConfig({
                        ...localConfig,
                        thresholds: { ...localConfig.thresholds, medium: Number(e.target.value) }
                      })
                    }
                  />
                </div>
                <p className="text-[10px] text-muted-foreground italic opacity-70">
                  Rango: {localConfig.thresholds.low + 1} a {localConfig.thresholds.medium} turnos.
                </p>
              </div>

              {/* Carga Alta */}
              <div className="space-y-3 opacity-80">
                <div className="flex items-center gap-2">
                  <div className="h-3 w-3 rounded-full bg-load-high" />
                  <span className="text-xs font-bold uppercase">Intensidad Alta</span>
                </div>
                <div className="space-y-1.5">
                  <Label className="text-[10px] text-muted-foreground italic">Automático</Label>
                  <Input
                    type="text"
                    disabled
                    value={`> ${localConfig.thresholds.medium}`}
                    className="bg-muted/30 border-dashed"
                  />
                </div>
                <p className="text-[10px] text-muted-foreground italic opacity-70">
                  Rango: Más de {localConfig.thresholds.medium} turnos.
                </p>
              </div>
            </div>
          </div>

          <div className="flex justify-end pt-4">
            <Button onClick={handleSave} disabled={isPending} className="gap-2 px-8">
              <ShieldCheck className="h-4 w-4" />
              {isPending ? 'Guardando...' : 'Guardar Configuración'}
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
