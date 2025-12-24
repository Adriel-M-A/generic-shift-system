// src/renderer/src/modules/core/pages/configuracion/TurnosConfig.tsx

import { useState } from 'react'
import { Save, Clock, CalendarDays, ArrowRight, BarChart3, Info } from 'lucide-react'
import { Button } from '@ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@ui/card'
import { Label } from '@ui/label'
import { Input } from '@ui/input'
import { RadioGroup, RadioGroupItem } from '@ui/radio-group'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@ui/select'
import { Separator } from '@ui/separator'

export function TurnosConfig() {
  const [config, setConfig] = useState({
    startOfWeek: 'monday',
    openingTime: '08:00',
    closingTime: '20:00',
    timeStep: '15',
    thresholds: {
      low: 5,
      medium: 10
    }
  })

  const handleSave = () => {
    console.log('Guardando configuración completa:', config)
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
              defaultValue={config.startOfWeek}
              onValueChange={(val) => setConfig({ ...config, startOfWeek: val })}
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

      {/* 2. GESTIÓN DE HORARIOS */}
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
            {/* Columna Izq: Rango */}
            <div className="space-y-5">
              <div className="flex items-center gap-2 pb-1 border-b border-border/40">
                <h3 className="font-semibold text-sm text-foreground">Rango Operativo</h3>
              </div>
              <div className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label
                      htmlFor="opening-time"
                      className="text-xs text-muted-foreground uppercase tracking-wide font-semibold"
                    >
                      Apertura
                    </Label>
                    <Input
                      id="opening-time"
                      type="time"
                      value={config.openingTime}
                      onChange={(e) => setConfig({ ...config, openingTime: e.target.value })}
                      className="w-full font-mono text-base bg-background border-input shadow-sm focus:border-primary cursor-pointer"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label
                      htmlFor="closing-time"
                      className="text-xs text-muted-foreground uppercase tracking-wide font-semibold"
                    >
                      Cierre
                    </Label>
                    <Input
                      id="closing-time"
                      type="time"
                      value={config.closingTime}
                      onChange={(e) => setConfig({ ...config, closingTime: e.target.value })}
                      className="w-full font-mono text-base bg-background border-input shadow-sm focus:border-primary cursor-pointer"
                    />
                  </div>
                </div>
                <div className="bg-muted/30 p-3 rounded-md border border-border/50 flex gap-3 text-sm text-muted-foreground">
                  <Info className="h-4 w-4 shrink-0 mt-0.5" />
                  <span className="text-xs leading-relaxed">
                    Los usuarios no podrán crear turnos fuera de este rango horario.
                  </span>
                </div>
              </div>
            </div>

            {/* Columna Der: Intervalos */}
            <div className="space-y-5 relative">
              <div className="hidden lg:block absolute -left-6 top-2 bottom-2 w-px bg-border/50"></div>
              <div className="flex items-center gap-2 pb-1 border-b border-border/40">
                <h3 className="font-semibold text-sm text-foreground">Frecuencia de Turnos</h3>
              </div>
              <div className="space-y-4">
                <div className="space-y-2">
                  <Label className="text-xs text-muted-foreground uppercase tracking-wide font-semibold">
                    Duración de bloque (Minutos)
                  </Label>
                  <Select
                    value={config.timeStep}
                    onValueChange={(val) => setConfig({ ...config, timeStep: val })}
                  >
                    <SelectTrigger className="w-full bg-background shadow-sm border-input">
                      <SelectValue placeholder="Seleccionar intervalo" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="1">1 min (Libre)</SelectItem>
                      <SelectItem value="5">5 min</SelectItem>
                      <SelectItem value="10">10 min</SelectItem>
                      <SelectItem value="15">15 min (Estándar)</SelectItem>
                      <SelectItem value="20">20 min</SelectItem>
                      <SelectItem value="30">30 min (Media hora)</SelectItem>
                      <SelectItem value="60">60 min (1 hora)</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div className="bg-muted/30 p-3 rounded-md border border-border/50 flex gap-3 text-sm text-muted-foreground">
                  <Clock className="h-4 w-4 shrink-0 mt-0.5" />
                  <span className="text-xs leading-relaxed">
                    Determina el salto de tiempo en los controles (+ / -) al agendar un nuevo turno.
                  </span>
                </div>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* 3. INDICADORES DE DEMANDA (COLORES ACTUALIZADOS) */}
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
            {/* Baja (VERDE - load-low) */}
            <div className="flex flex-col gap-3 p-4 rounded-lg border border-border/40 bg-card hover:bg-accent/5 transition-colors">
              <div className="flex items-center gap-2">
                <div className="h-3 w-3 rounded-full bg-load-low ring-2 ring-load-low/30"></div>
                <Label className="font-semibold text-sm">Demanda Baja</Label>
              </div>
              <div className="flex items-center gap-2">
                <span className="text-sm text-muted-foreground">Hasta</span>
                <Input
                  type="number"
                  className="h-8 w-16 text-center font-mono bg-background"
                  value={config.thresholds.low}
                  onChange={(e) =>
                    setConfig({
                      ...config,
                      thresholds: { ...config.thresholds, low: parseInt(e.target.value) || 0 }
                    })
                  }
                />
                <span className="text-sm text-muted-foreground">turnos</span>
              </div>
              <p className="text-[10px] text-muted-foreground mt-1">
                Correspondiente al color verde en el calendario.
              </p>
            </div>

            {/* Media (AMARILLO - load-medium) */}
            <div className="flex flex-col gap-3 p-4 rounded-lg border border-border/40 bg-card hover:bg-accent/5 transition-colors">
              <div className="flex items-center gap-2">
                <div className="h-3 w-3 rounded-full bg-load-medium ring-2 ring-load-medium/30"></div>
                <Label className="font-semibold text-sm">Demanda Media</Label>
              </div>
              <div className="flex items-center gap-2">
                <span className="text-sm text-muted-foreground">Hasta</span>
                <Input
                  type="number"
                  className="h-8 w-16 text-center font-mono bg-background"
                  value={config.thresholds.medium}
                  onChange={(e) =>
                    setConfig({
                      ...config,
                      thresholds: { ...config.thresholds, medium: parseInt(e.target.value) || 0 }
                    })
                  }
                />
                <span className="text-sm text-muted-foreground">turnos</span>
              </div>
              <p className="text-[10px] text-muted-foreground mt-1">
                Correspondiente al color amarillo en el calendario.
              </p>
            </div>

            {/* Alta (ROJO - load-high) */}
            <div className="flex flex-col gap-3 p-4 rounded-lg border border-border/40 bg-card hover:bg-accent/5 transition-colors">
              <div className="flex items-center gap-2">
                <div className="h-3 w-3 rounded-full bg-load-high ring-2 ring-load-high/30"></div>
                <Label className="font-semibold text-sm">Demanda Alta</Label>
              </div>
              <div className="flex items-center gap-2">
                <span className="text-sm text-muted-foreground">Más de</span>
                <div className="h-8 w-16 flex items-center justify-center font-mono font-bold text-foreground bg-muted/50 rounded border border-border/50">
                  {config.thresholds.medium}
                </div>
                <span className="text-sm text-muted-foreground">turnos</span>
              </div>
              <p className="text-[10px] text-muted-foreground mt-1">
                Correspondiente al color rojo en el calendario.
              </p>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* FOOTER */}
      <div className="flex justify-end pt-2">
        <Button onClick={handleSave} className="gap-2 px-8 shadow-sm" size="lg">
          <Save className="h-4 w-4" /> Guardar Configuración
        </Button>
      </div>
    </div>
  )
}
