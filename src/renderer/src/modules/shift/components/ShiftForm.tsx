import { useState, useMemo, useRef, useEffect } from 'react'
import { Plus, Save, Clock, Briefcase, ChevronDown, ChevronUp, Check, Minus } from 'lucide-react'
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
import { NewShiftData } from '../hooks/useShifts'
import { cn } from '@lib/utils'

const SERVICIOS_SUGERIDOS = [
  'Corte de Pelo',
  'Corte y Barba',
  'Coloración',
  'Alisado',
  'Tratamiento',
  'Peinado',
  'Manicura',
  'Pedicura',
  'Masaje',
  'Limpieza Facial',
  'Consultoría'
]

interface ShiftFormProps {
  currentDate: Date | undefined
  onSave: (data: NewShiftData) => void
  formatDateHeader: (d: Date) => string
}

export function ShiftForm({ currentDate, onSave, formatDateHeader }: ShiftFormProps) {
  const [open, setOpen] = useState(false)
  const [isServiceOpen, setIsServiceOpen] = useState(false)
  const serviceWrapperRef = useRef<HTMLDivElement>(null)

  const [hour, setHour] = useState('09')
  const [minute, setMinute] = useState('00')

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

  const filteredServices = useMemo(() => {
    return SERVICIOS_SUGERIDOS.filter((s) =>
      s.toLowerCase().includes(formData.servicio.toLowerCase())
    )
  }, [formData.servicio])

  const pad = (n: string | number) => n.toString().padStart(2, '0')

  // --- LÓGICA DE BOTONES ---
  const adjustHour = (amount: number) => {
    let val = parseInt(hour) + amount
    if (isNaN(val)) val = 9 // Valor por defecto si está vacío

    // Ciclo 0-23
    if (val > 23) val = 0
    if (val < 0) val = 23

    setHour(val.toString())
  }

  const adjustMinute = (amount: number) => {
    let val = parseInt(minute) + amount * 5
    if (isNaN(val)) val = 0

    // Ciclo 0-55
    if (val > 55) val = 0
    if (val < 0) val = 55

    setMinute(val.toString())
  }
  // -------------------------

  const handleHourChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    let val = parseInt(e.target.value)
    if (isNaN(val)) return setHour('')
    if (val < 0) val = 0
    if (val > 23) val = 23
    setHour(val.toString())
  }

  const handleMinuteChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    let val = parseInt(e.target.value)
    if (isNaN(val)) return setMinute('')
    if (val < 0) val = 0
    if (val > 59) val = 55
    setMinute(val.toString())
  }

  const handleBlurTime = () => {
    setHour((prev) => (prev === '' ? '09' : pad(prev)))
    setMinute((prev) => (prev === '' ? '00' : pad(prev)))
  }

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    const finalTime = `${pad(hour)}:${pad(minute)}`

    onSave({
      cliente: formData.cliente,
      servicio: formData.servicio,
      hora: finalTime
    })

    setOpen(false)
    setFormData({ cliente: '', servicio: '' })
    setHour('09')
    setMinute('00')
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
            {/* 1. Selección de Horario con Botones Personalizados */}
            <div className="grid gap-2">
              <Label className="flex items-center gap-2 text-muted-foreground font-medium text-sm">
                <Clock className="h-3.5 w-3.5" /> Horario
              </Label>

              <div className="flex items-center gap-4">
                {/* HORA */}
                <div className="flex items-center flex-1 gap-1">
                  <Button
                    type="button"
                    variant="outline"
                    size="icon"
                    className="h-10 w-9 shrink-0"
                    onClick={() => adjustHour(-1)}
                    tabIndex={-1}
                  >
                    <Minus className="h-3.5 w-3.5" />
                  </Button>

                  <div className="relative flex-1">
                    <Input
                      type="number"
                      min={0}
                      max={23}
                      value={hour}
                      onChange={handleHourChange}
                      onBlur={handleBlurTime}
                      className="text-center font-mono text-lg h-10 px-2"
                      placeholder="HH"
                    />
                    {/* Texto 'hs' superpuesto */}
                    <span className="absolute right-2 top-1/2 -translate-y-1/2 text-xs text-muted-foreground pointer-events-none bg-background pl-1">
                      hs
                    </span>
                  </div>

                  <Button
                    type="button"
                    variant="outline"
                    size="icon"
                    className="h-10 w-9 shrink-0"
                    onClick={() => adjustHour(1)}
                    tabIndex={-1}
                  >
                    <Plus className="h-3.5 w-3.5" />
                  </Button>
                </div>

                <span className="text-xl font-bold text-muted-foreground/30 pb-1">:</span>

                {/* MINUTOS */}
                <div className="flex items-center flex-1 gap-1">
                  <Button
                    type="button"
                    variant="outline"
                    size="icon"
                    className="h-10 w-9 shrink-0"
                    onClick={() => adjustMinute(-1)}
                    tabIndex={-1}
                  >
                    <Minus className="h-3.5 w-3.5" />
                  </Button>

                  <div className="relative flex-1">
                    <Input
                      type="number"
                      min={0}
                      max={59}
                      step={5}
                      value={minute}
                      onChange={handleMinuteChange}
                      onBlur={handleBlurTime}
                      className="text-center font-mono text-lg h-10 px-2"
                      placeholder="MM"
                    />
                    <span className="absolute right-2 top-1/2 -translate-y-1/2 text-xs text-muted-foreground pointer-events-none bg-background pl-1">
                      min
                    </span>
                  </div>

                  <Button
                    type="button"
                    variant="outline"
                    size="icon"
                    className="h-10 w-9 shrink-0"
                    onClick={() => adjustMinute(1)}
                    tabIndex={-1}
                  >
                    <Plus className="h-3.5 w-3.5" />
                  </Button>
                </div>
              </div>
            </div>

            {/* 2. Selección de Servicio */}
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
