import { useState, useMemo, useRef, useEffect } from 'react'
import { Plus, Save, Clock, Briefcase, ChevronDown, ChevronUp, Check } from 'lucide-react'
import { Button } from '@ui/button'
import { Input } from '@ui/input'
import { Label } from '@ui/label'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger
} from '@ui/dialog'
import { TimePicker } from '@ui/time-picker'
// 1. IMPORTAMOS EL HOOK
import { useShifts, NewShiftData } from '../hooks/useShifts'
import { cn } from '@lib/utils'

interface ShiftFormProps {
  currentDate: Date | undefined
  onSave: (data: NewShiftData) => void
  formatDateHeader: (d: Date) => string
}

export function ShiftForm({ currentDate, onSave, formatDateHeader }: ShiftFormProps) {
  // 2. OBTENEMOS LA CONFIGURACIÓN GLOBAL
  const { config } = useShifts()

  const [open, setOpen] = useState(false)
  const [isServiceOpen, setIsServiceOpen] = useState(false)
  const serviceWrapperRef = useRef<HTMLDivElement>(null)

  // 3. INICIALIZAMOS CON LA HORA DE APERTURA REAL
  const [time, setTime] = useState(config.openingTime || '09:00')

  // --- NUEVO: Estado para Servicios Dinámicos ---
  const [availableServices, setAvailableServices] = useState<string[]>([])

  // Efecto para actualizar la hora por defecto si cambia la config
  useEffect(() => {
    if (config.openingTime) {
      setTime(config.openingTime)
    }
  }, [config.openingTime])

  // --- NUEVO: Cargar servicios reales al abrir el modal ---
  useEffect(() => {
    async function fetchServices() {
      try {
        const allServices = await window.api.services.getAll()
        // Filtramos solo los activos y mapeamos a string[] para mantener compatibilidad
        const activeServiceNames = allServices
          .filter((s: any) => s.activo === 1)
          .map((s: any) => s.nombre)

        setAvailableServices(activeServiceNames)
      } catch (error) {
        console.error('Error cargando servicios:', error)
      }
    }

    if (open) {
      fetchServices()
    }
  }, [open])

  const [formData, setFormData] = useState<{ cliente: string; servicio: string }>({
    cliente: '',
    servicio: ''
  })

  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (serviceWrapperRef.current && !serviceWrapperRef.current.contains(event.target as Node)) {
        setIsServiceOpen(false)
      }
    }
    if (isServiceOpen) {
      document.addEventListener('mousedown', handleClickOutside)
    }
    return () => document.removeEventListener('mousedown', handleClickOutside)
  }, [isServiceOpen])

  // Usamos availableServices en lugar de la constante
  const filteredServices = useMemo(() => {
    return availableServices.filter((s) =>
      s.toLowerCase().includes(formData.servicio.toLowerCase())
    )
  }, [formData.servicio, availableServices])

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()

    onSave({
      cliente: formData.cliente,
      servicio: formData.servicio,
      hora: time
    })

    setOpen(false)
    setFormData({ cliente: '', servicio: '' })
    setTime(config.openingTime) // Reset a la hora de apertura
    setIsServiceOpen(false)
  }

  const dateStr = currentDate ? formatDateHeader(currentDate) : 'la fecha seleccionada'

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button className="gap-2 shadow-sm bg-primary hover:bg-primary/90 h-9">
          <Plus className="h-4 w-4" />
          <span className="hidden sm:inline">Nuevo Turno</span>
        </Button>
      </DialogTrigger>

      <DialogContent className="sm:max-w-137.5 overflow-visible gap-0 block">
        <form onSubmit={handleSubmit}>
          <DialogHeader className="mb-5 pt-1">
            <DialogTitle className="flex items-center gap-2 text-lg">
              <Plus className="h-5 w-5 text-primary" />
              Crear Nuevo Turno
            </DialogTitle>
            <DialogDescription className="mt-1">
              Agendando para el <span className="font-semibold text-foreground">{dateStr}</span>.
            </DialogDescription>
          </DialogHeader>

          <div className="grid gap-5 py-1">
            {/* 1. SELECCIÓN DE HORARIO CONECTADA */}
            <div className="grid gap-2">
              <Label className="flex items-center gap-2 text-muted-foreground font-medium text-sm">
                <Clock className="h-3.5 w-3.5" /> Horario
              </Label>

              <TimePicker
                value={time}
                onChange={setTime}
                step={config.interval}
                minTime={config.openingTime}
                maxTime={config.closingTime}
              />

              <p className="text-[10px] text-muted-foreground">
                * Turnos cada {config.interval} minutos entre {config.openingTime} y{' '}
                {config.closingTime}.
              </p>
            </div>

            {/* 2. Selección de Servicio (Dinámico) */}
            <div className="grid gap-2 relative z-50" ref={serviceWrapperRef}>
              <Label
                htmlFor="servicio"
                className="flex items-center gap-2 text-muted-foreground font-medium text-sm"
              >
                <Briefcase className="h-3.5 w-3.5" /> Servicio
              </Label>

              <div className="relative">
                <Input
                  id="servicio"
                  placeholder="Escribe o selecciona..."
                  value={formData.servicio}
                  onChange={(e) => {
                    setFormData({ ...formData, servicio: e.target.value })
                    setIsServiceOpen(true)
                  }}
                  onFocus={() => setIsServiceOpen(true)}
                  className="pr-10 h-10"
                  autoComplete="off"
                  required
                />

                <Button
                  type="button"
                  variant="ghost"
                  size="icon"
                  className="absolute right-0 top-0 h-10 w-10 text-muted-foreground hover:text-foreground"
                  onClick={() => setIsServiceOpen(!isServiceOpen)}
                  tabIndex={-1}
                >
                  {isServiceOpen ? (
                    <ChevronUp className="h-4 w-4" />
                  ) : (
                    <ChevronDown className="h-4 w-4" />
                  )}
                </Button>

                {isServiceOpen && (
                  <div className="absolute top-[calc(100%+4px)] left-0 w-full z-50 max-h-50 overflow-y-auto rounded-md border border-border/80 bg-background shadow-lg animate-in fade-in-0 zoom-in-95">
                    {filteredServices.length > 0 ? (
                      <div className="p-1">
                        {filteredServices.map((srv) => (
                          <div
                            key={srv}
                            className={cn(
                              'relative flex select-none items-center rounded-sm px-2 py-2 text-sm outline-none transition-colors hover:bg-accent hover:text-accent-foreground cursor-pointer',
                              formData.servicio === srv &&
                                'bg-accent text-accent-foreground font-medium'
                            )}
                            onClick={() => {
                              setFormData({ ...formData, servicio: srv })
                              setIsServiceOpen(false)
                            }}
                          >
                            <span className="flex-1 truncate">{srv}</span>
                            {formData.servicio === srv && (
                              <Check className="h-3.5 w-3.5 ml-2 text-primary" />
                            )}
                          </div>
                        ))}
                      </div>
                    ) : (
                      <div className="py-4 px-2 text-center text-sm text-muted-foreground bg-background">
                        <span className="block font-medium">"{formData.servicio}"</span>
                        <span className="text-xs opacity-70">No encontrado.</span>
                      </div>
                    )}
                  </div>
                )}
              </div>
            </div>

            {/* 3. Nombre del Cliente */}
            <div className="grid gap-2 relative z-0">
              <Label htmlFor="cliente" className="text-muted-foreground font-medium text-sm">
                Nombre del Cliente
              </Label>
              <Input
                id="cliente"
                placeholder="Ej. Juan Pérez"
                value={formData.cliente}
                onChange={(e) => setFormData({ ...formData, cliente: e.target.value })}
                autoComplete="off"
                className="h-10"
                required
              />
            </div>
          </div>

          <DialogFooter className="mt-6 pt-2">
            <Button
              type="submit"
              className="w-full sm:w-auto h-10 px-6"
              disabled={!formData.cliente || !formData.servicio}
            >
              <Save className="mr-2 h-4 w-4" /> Confirmar Turno
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  )
}
