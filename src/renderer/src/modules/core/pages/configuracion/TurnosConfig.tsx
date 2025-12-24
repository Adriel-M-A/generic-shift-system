import { useState, useEffect } from 'react'
import { Save, Clock, CalendarDays, BarChart3, Info, AlertCircle } from 'lucide-react'
import { Button } from '@ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@ui/card'
import { Label } from '@ui/label'
import { Input } from '@ui/input'
import { RadioGroup, RadioGroupItem } from '@ui/radio-group'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@ui/select'
import { useShifts } from '../../../shift/hooks/useShifts'
import { toast } from 'sonner'

export function TurnosConfig() {
  // 1. Obtenemos la configuración REAL y la función para actualizar
  const { config, updateConfig } = useShifts()

  // 2. Estado local temporal para la edición (para no guardar en cada tecla que tocas en los inputs numéricos)
  const [visualSettings, setVisualSettings] = useState({
    startOfWeek: 'monday',
    thresholds: {
      low: 5,
      medium: 10
    }
  })

  // 3. EFECTO CLAVE: Sincronizar el estado local con lo que viene de la Base de Datos al cargar
  useEffect(() => {
    setVisualSettings({
      startOfWeek: config.startOfWeek || 'monday',
      thresholds: {
        low: config.thresholds?.low ?? 5,
        medium: config.thresholds?.medium ?? 10
      }
    })
  }, [config.startOfWeek, config.thresholds]) // Se ejecuta cuando el contexto termina de cargar la BD

  // 4. Guardar cambios en la Base de Datos
  const handleSave = async () => {
    try {
      await updateConfig({
        startOfWeek: visualSettings.startOfWeek as 'monday' | 'sunday',
        thresholds: visualSettings.thresholds
      })
      toast.success('Configuración guardada y aplicada')
    } catch (error) {
      toast.error('Error al guardar la configuración')
    }
  }

  return (
    <div className="space-y-6 animate-in fade-in duration-500 pb-10">
      {/* 1. PREFERENCIAS CALENDARIO */}
      <Card>
        <CardHeader>
          <div className="flex items-center gap-2">
            <CalendarDays className="h-5 w-5 text-primary" />
            <CardTitle>Visualización del Calendario</CardTitle>
          </div>
          <CardDescription>Define cómo se estructura la vista mensual y semanal.</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-3">
            <Label className="text-base font-medium">Inicio de la semana</Label>
            <RadioGroup
              value={visualSettings.startOfWeek}
              onValueChange={(val) => setVisualSettings({ ...visualSettings, startOfWeek: val })}
              className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-2"
            >
              <div>
                <RadioGroupItem value="monday" id="monday" className="peer sr-only" />
                <Label
                  htmlFor="monday"
                  className="flex flex-col items-center justify-between rounded-md border-2 border-muted bg-popover p-4 hover:bg-accent hover:text-accent-foreground peer-data-[state=checked]:border-primary peer-data-[state=checked]:bg-primary/5 cursor-pointer transition-all shadow-sm"
                >
                  <span className="text-lg font-bold mb-1">Lunes</span>
                  <span className="text-xs text-muted-foreground text-center">
                    Semana laboral estándar
                  </span>
                </Label>
              </div>
              <div>
                <RadioGroupItem value="sunday" id="sunday" className="peer sr-only" />
                <Label
                  htmlFor="sunday"
                  className="flex flex-col items-center justify-between rounded-md border-2 border-muted bg-popover p-4 hover:bg-accent hover:text-accent-foreground peer-data-[state=checked]:border-primary peer-data-[state=checked]:bg-primary/5 cursor-pointer transition-all shadow-sm"
                >
                  <span className="text-lg font-bold mb-1">Domingo</span>
                  <span className="text-xs text-muted-foreground text-center">
                    Formato tradicional internacional
                  </span>
                </Label>
              </div>
            </RadioGroup>
          </div>
        </CardContent>
      </Card>

      {/* 2. GESTIÓN DE HORARIOS (Estos se guardan directo porque usan el updateConfig inline, pero está bien así) */}
      <Card>
        <CardHeader>
          <div className="flex items-center gap-2">
            <Clock className="h-5 w-5 text-primary" />
            <CardTitle>Horarios de Atención</CardTitle>
          </div>
          <CardDescription>
            Define los límites operativos y la frecuencia de los turnos.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 lg:gap-12">
            <div className="space-y-5">
              <div className="flex items-center gap-2 pb-1 border-b border-border/40">
                <h3 className="font-semibold text-sm text-foreground">Rango Operativo</h3>
              </div>
              <div className="space-y-4">
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label className="text-xs text-muted-foreground uppercase tracking-wide font-semibold">
                      Apertura
                    </Label>
                    <Input
                      type="time"
                      value={config.openingTime}
                      onChange={(e) => updateConfig({ openingTime: e.target.value })}
                      className="cursor-pointer"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label className="text-xs text-muted-foreground uppercase tracking-wide font-semibold">
                      Cierre
                    </Label>
                    <Input
                      type="time"
                      value={config.closingTime}
                      onChange={(e) => updateConfig({ closingTime: e.target.value })}
                      className="cursor-pointer"
                    />
                  </div>
                </div>
                <div className="bg-muted/30 p-3 rounded-md border border-border/50 flex gap-3 text-sm text-muted-foreground">
                  <Info className="h-4 w-4 shrink-0 mt-0.5" />
                  <span className="text-xs leading-relaxed">
                    Estos cambios se guardan automáticamente.
                  </span>
                </div>
              </div>
            </div>

            <div className="space-y-5 relative">
              <div className="hidden lg:block absolute -left-6 top-2 bottom-2 w-px bg-border/50"></div>
              <div className="flex items-center gap-2 pb-1 border-b border-border/40">
                <h3 className="font-semibold text-sm text-foreground">Frecuencia</h3>
              </div>
              <div className="space-y-4">
                <div className="space-y-2">
                  <Label className="text-xs text-muted-foreground uppercase tracking-wide font-semibold">
                    Bloque (Minutos)
                  </Label>
                  <Select
                    value={config.interval.toString()}
                    onValueChange={(val) => updateConfig({ interval: parseInt(val) })}
                  >
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="15">15 min</SelectItem>
                      <SelectItem value="20">20 min</SelectItem>
                      <SelectItem value="30">30 min</SelectItem>
                      <SelectItem value="45">45 min</SelectItem>
                      <SelectItem value="60">60 min</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div className="bg-muted/30 p-3 rounded-md border border-border/50 flex gap-3 text-sm text-muted-foreground">
                  <AlertCircle className="h-4 w-4 shrink-0 mt-0.5" />
                  <span className="text-xs leading-relaxed">Define los bloques de la agenda.</span>
                </div>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* 3. INDICADORES DE DEMANDA */}
      <Card>
        <CardHeader>
          <div className="flex items-center gap-2">
            <BarChart3 className="h-5 w-5 text-primary" />
            <CardTitle>Indicadores de Demanda</CardTitle>
          </div>
          <CardDescription>
            Configura los umbrales numéricos para los colores del mapa de calor.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-6">
            {/* Baja */}
            <div className="flex flex-col gap-3 p-4 rounded-lg border border-border/40 bg-card">
              <div className="flex items-center gap-2">
                <div className="h-3 w-3 rounded-full bg-green-500 ring-2 ring-green-500/30"></div>
                <Label className="font-semibold text-sm">Demanda Baja</Label>
              </div>
              <div className="flex items-center gap-2">
                <span className="text-sm text-muted-foreground">Hasta</span>
                <Input
                  type="number"
                  className="h-8 w-16 text-center font-mono"
                  value={visualSettings.thresholds.low}
                  onChange={(e) =>
                    setVisualSettings({
                      ...visualSettings,
                      thresholds: {
                        ...visualSettings.thresholds,
                        low: parseInt(e.target.value) || 0
                      }
                    })
                  }
                />
                <span className="text-sm text-muted-foreground">turnos</span>
              </div>
            </div>

            {/* Media */}
            <div className="flex flex-col gap-3 p-4 rounded-lg border border-border/40 bg-card">
              <div className="flex items-center gap-2">
                <div className="h-3 w-3 rounded-full bg-yellow-500 ring-2 ring-yellow-500/30"></div>
                <Label className="font-semibold text-sm">Demanda Media</Label>
              </div>
              <div className="flex items-center gap-2">
                <span className="text-sm text-muted-foreground">Hasta</span>
                <Input
                  type="number"
                  className="h-8 w-16 text-center font-mono"
                  value={visualSettings.thresholds.medium}
                  onChange={(e) =>
                    setVisualSettings({
                      ...visualSettings,
                      thresholds: {
                        ...visualSettings.thresholds,
                        medium: parseInt(e.target.value) || 0
                      }
                    })
                  }
                />
                <span className="text-sm text-muted-foreground">turnos</span>
              </div>
            </div>

            {/* Alta */}
            <div className="flex flex-col gap-3 p-4 rounded-lg border border-border/40 bg-card">
              <div className="flex items-center gap-2">
                <div className="h-3 w-3 rounded-full bg-red-500 ring-2 ring-red-500/30"></div>
                <Label className="font-semibold text-sm">Demanda Alta</Label>
              </div>
              <div className="flex items-center gap-2">
                <span className="text-sm text-muted-foreground">Más de</span>
                <div className="h-8 w-16 flex items-center justify-center font-mono font-bold bg-muted/50 rounded border border-border/50">
                  {visualSettings.thresholds.medium}
                </div>
                <span className="text-sm text-muted-foreground">turnos</span>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* FOOTER */}
      <div className="flex justify-end pt-2">
        <Button onClick={handleSave} className="gap-2 px-8 shadow-sm" size="lg">
          <Save className="h-4 w-4" /> Guardar Todo
        </Button>
      </div>
    </div>
  )
}
