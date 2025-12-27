import { useState, useEffect } from 'react'
import { useShifts } from '@shift/hooks/useShifts' // Ruta corregida
import { ShiftConfig } from '@shift/types' // Ruta corregida
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@ui/card'
import { Label } from '@ui/label'
import { Input } from '@ui/input'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@ui/select'
import { Switch } from '@ui/switch'
import { Button } from '@ui/button'
import { Save, RotateCcw, Clock, Eye, BarChart3 } from 'lucide-react'
import { toast } from 'sonner'

export default function TurnosConfig() {
  const { config, updateConfig } = useShifts()

  // Estado local para buffer de cambios
  const [localConfig, setLocalConfig] = useState<ShiftConfig>(config)
  const [hasChanges, setHasChanges] = useState(false)
  const [isSaving, setIsSaving] = useState(false)

  useEffect(() => {
    setLocalConfig(config)
  }, [config])

  useEffect(() => {
    const isDifferent = JSON.stringify(localConfig) !== JSON.stringify(config)
    setHasChanges(isDifferent)
  }, [localConfig, config])

  // --- HANDLERS ---
  const handleChange = (key: keyof ShiftConfig, value: any) => {
    setLocalConfig((prev) => ({ ...prev, [key]: value }))
  }

  const handleThresholdChange = (key: 'low' | 'medium', value: string) => {
    const numValue = parseInt(value) || 0
    setLocalConfig((prev) => ({
      ...prev,
      thresholds: { ...prev.thresholds, [key]: numValue }
    }))
  }

  const handleSave = async () => {
    setIsSaving(true)
    try {
      await updateConfig(localConfig)
      toast.success('Configuración guardada correctamente')
      setHasChanges(false)
    } catch (error) {
      toast.error('Error al guardar')
    } finally {
      setIsSaving(false)
    }
  }

  const handleReset = () => {
    setLocalConfig(config)
    setHasChanges(false)
    toast.info('Cambios revertidos')
  }

  return (
    <div className="space-y-6">
      {/* GRID PRINCIPAL */}
      <div className="grid grid-cols-1 xl:grid-cols-3 gap-6">
        {/* TARJETA 1: HORARIOS (Todo en una fila) */}
        <Card className="xl:col-span-2">
          <CardHeader className="pb-4">
            <div className="flex items-center gap-2">
              <Clock className="h-5 w-5 text-primary" />
              <CardTitle className="text-base">Horarios de Atención</CardTitle>
            </div>
            <CardDescription>Define la franja horaria y la duración de los turnos.</CardDescription>
          </CardHeader>
          <CardContent>
            {/* Flex container para poner los 3 elementos en fila */}
            <div className="flex flex-col sm:flex-row gap-6 items-end">
              <div className="space-y-2 flex-1 min-w-[120px]">
                <Label>Apertura</Label>
                <Input
                  type="time"
                  value={localConfig.openingTime}
                  onChange={(e) => handleChange('openingTime', e.target.value)}
                />
              </div>

              <div className="space-y-2 flex-1 min-w-[120px]">
                <Label>Cierre</Label>
                <Input
                  type="time"
                  value={localConfig.closingTime}
                  onChange={(e) => handleChange('closingTime', e.target.value)}
                />
              </div>

              <div className="space-y-2 flex-1 min-w-[140px]">
                <Label>Intervalo</Label>
                <Select
                  value={localConfig.interval.toString()}
                  onValueChange={(val) => handleChange('interval', parseInt(val))}
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
            </div>
          </CardContent>
        </Card>

        {/* TARJETA 2: VISUALIZACIÓN */}
        <Card>
          <CardHeader className="pb-4">
            <div className="flex items-center gap-2">
              <Eye className="h-5 w-5 text-primary" />
              <CardTitle className="text-base">Visualización</CardTitle>
            </div>
            <CardDescription>Preferencias del calendario.</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex items-center justify-between">
              <Label className="font-normal">Inicio de semana</Label>
              <Select
                value={localConfig.startOfWeek}
                onValueChange={(val) => handleChange('startOfWeek', val)}
              >
                <SelectTrigger className="w-[110px] h-8 text-xs">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="monday">Lunes</SelectItem>
                  <SelectItem value="sunday">Domingo</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="flex items-center justify-between pt-2">
              <div className="space-y-0.5">
                <Label className="text-sm">Ver Historial</Label>
                <p className="text-[10px] text-muted-foreground">Turnos pasados</p>
              </div>
              <Switch
                className="scale-90"
                checked={localConfig.showFinishedShifts}
                onCheckedChange={(checked) => handleChange('showFinishedShifts', checked)}
              />
            </div>
          </CardContent>
        </Card>

        {/* TARJETA 3: INDICADORES (Todo en una fila) */}
        <Card className="xl:col-span-3">
          <CardHeader className="pb-4">
            <div className="flex items-center gap-2">
              <BarChart3 className="h-5 w-5 text-primary" />
              <CardTitle className="text-base">Indicadores de Demanda</CardTitle>
            </div>
            <CardDescription>Umbrales de turnos diarios para el mapa de calor.</CardDescription>
          </CardHeader>
          <CardContent>
            {/* Flex container para poner los niveles en fila */}
            <div className="flex flex-col sm:flex-row gap-8 items-start sm:items-end">
              {/* Nivel Bajo */}
              <div className="space-y-2 flex-1 w-full sm:w-auto">
                <div className="flex items-center gap-2">
                  <div className="h-2.5 w-2.5 rounded-full bg-green-500 shadow-sm" />
                  <Label>Nivel Bajo (Verde)</Label>
                </div>
                <div className="flex items-center gap-2">
                  <Input
                    type="number"
                    min="1"
                    className="font-mono"
                    value={localConfig.thresholds.low}
                    onChange={(e) => handleThresholdChange('low', e.target.value)}
                  />
                  <span className="text-xs text-muted-foreground whitespace-nowrap">turnos</span>
                </div>
              </div>

              {/* Nivel Medio */}
              <div className="space-y-2 flex-1 w-full sm:w-auto">
                <div className="flex items-center gap-2">
                  <div className="h-2.5 w-2.5 rounded-full bg-yellow-500 shadow-sm" />
                  <Label>Nivel Medio (Amarillo)</Label>
                </div>
                <div className="flex items-center gap-2">
                  <Input
                    type="number"
                    min={localConfig.thresholds.low + 1}
                    className="font-mono"
                    value={localConfig.thresholds.medium}
                    onChange={(e) => handleThresholdChange('medium', e.target.value)}
                  />
                  <span className="text-xs text-muted-foreground whitespace-nowrap">turnos</span>
                </div>
              </div>

              <div className="pb-3 text-xs text-muted-foreground hidden sm:block">
                * Valores superiores serán Rojo.
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* BOTONES DE ACCIÓN */}
      <div className="flex items-center justify-end gap-3 pt-4 border-t mt-4">
        {hasChanges && (
          <Button variant="ghost" onClick={handleReset} disabled={isSaving}>
            <RotateCcw className="mr-2 h-4 w-4" />
            Revertir
          </Button>
        )}
        <Button onClick={handleSave} disabled={!hasChanges || isSaving}>
          <Save className="mr-2 h-4 w-4" />
          {isSaving ? 'Guardando...' : 'Guardar Cambios'}
        </Button>
      </div>
    </div>
  )
}
