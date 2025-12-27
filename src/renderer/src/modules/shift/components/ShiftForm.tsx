import { useState, useMemo, useRef, useEffect } from 'react'
import {
  Plus,
  Save,
  Clock,
  Briefcase,
  ChevronDown,
  ChevronUp,
  Check,
  Search,
  User as UserIcon
} from 'lucide-react'
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
import { useShifts } from '../hooks/useShifts'
import { cn } from '@lib/utils'
import { Customer } from '@customers/types'

interface ShiftFormProps {
  currentDate: Date | undefined
  formatDateHeader: (d: Date) => string
}

export function ShiftForm({ currentDate, formatDateHeader }: ShiftFormProps) {
  const { config, createShift } = useShifts()

  const [open, setOpen] = useState(false)
  const [isServiceOpen, setIsServiceOpen] = useState(false)
  const serviceWrapperRef = useRef<HTMLDivElement>(null)
  const [isSubmitting, setIsSubmitting] = useState(false)

  const [time, setTime] = useState(config.openingTime || '09:00')
  const [availableServices, setAvailableServices] = useState<string[]>([])
  const [customers, setCustomers] = useState<Customer[]>([]) // Tipado correcto

  const [searchDoc, setSearchDoc] = useState('')
  const [formData, setFormData] = useState<{ cliente: string; servicio: string }>({
    cliente: '',
    servicio: ''
  })

  // Sincronizar hora inicial con configuración
  useEffect(() => {
    if (config.openingTime) setTime(config.openingTime)
  }, [config.openingTime])

  // Cargar datos al abrir el modal
  useEffect(() => {
    async function fetchData() {
      try {
        const [servicesData, customersData] = await Promise.all([
          window.api.services.getAll(),
          window.api.customers.getAll()
        ])

        const activeServiceNames = servicesData
          .filter((s: any) => s.activo === 1)
          .map((s: any) => s.nombre)
        setAvailableServices(activeServiceNames)
        setCustomers(customersData)
      } catch (error) {
        console.error('Error cargando datos:', error)
      }
    }

    if (open) fetchData()
  }, [open])

  // Buscar cliente automáticamente
  const foundCustomer = useMemo(() => {
    if (!searchDoc) return null
    return customers.find((c) => c.documento === searchDoc)
  }, [searchDoc, customers])

  // Autocompletar nombre si se encuentra cliente
  useEffect(() => {
    if (foundCustomer) {
      setFormData((prev) => ({
        ...prev,
        cliente: `${foundCustomer.apellido} ${foundCustomer.nombre}`
      }))
    } else {
      // Solo limpiamos si el usuario no ha escrito nada manual
      if (searchDoc === '') {
        setFormData((prev) => ({ ...prev, cliente: '' }))
      }
    }
  }, [foundCustomer, searchDoc])

  // Cerrar dropdown de servicios al hacer click fuera
  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (serviceWrapperRef.current && !serviceWrapperRef.current.contains(event.target as Node)) {
        setIsServiceOpen(false)
      }
    }
    if (isServiceOpen) document.addEventListener('mousedown', handleClickOutside)
    return () => document.removeEventListener('mousedown', handleClickOutside)
  }, [isServiceOpen])

  const filteredServices = useMemo(() => {
    return availableServices.filter((s) =>
      s.toLowerCase().includes(formData.servicio.toLowerCase())
    )
  }, [formData.servicio, availableServices])

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsSubmitting(true)

    const success = await createShift({
      cliente: formData.cliente,
      servicio: formData.servicio,
      hora: time,
      // AQUÍ ESTÁ LA CLAVE: Enviamos el ID si existe
      customerId: foundCustomer ? foundCustomer.id : undefined
    })

    setIsSubmitting(false)

    if (success) {
      setOpen(false)
      // Resetear formulario
      setFormData({ cliente: '', servicio: '' })
      setSearchDoc('')
      setTime(config.openingTime)
      setIsServiceOpen(false)
    }
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

      <DialogContent
        className="sm:max-w-137.5 overflow-visible gap-0 block"
        onOpenAutoFocus={(e) => e.preventDefault()}
      >
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
            {/* HORARIO */}
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
            </div>

            {/* SERVICIO (Autocompletado) */}
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

            {/* CLIENTE (Buscador DNI + Nombre) */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="grid gap-2">
                <Label
                  htmlFor="searchDoc"
                  className="flex items-center gap-2 text-muted-foreground font-medium text-sm"
                >
                  <Search className="h-3.5 w-3.5" /> Documento
                </Label>
                <div className="relative">
                  <Input
                    id="searchDoc"
                    placeholder="Buscar DNI..."
                    value={searchDoc}
                    onChange={(e) => setSearchDoc(e.target.value.replace(/[^0-9]/g, ''))}
                    className="h-10 pl-9"
                    autoComplete="off"
                    maxLength={15}
                  />
                  <Search className="absolute left-3 top-3 h-4 w-4 text-muted-foreground opacity-50" />
                </div>
              </div>

              <div className="grid gap-2">
                <Label
                  htmlFor="cliente"
                  className="flex items-center gap-2 text-muted-foreground font-medium text-sm"
                >
                  <UserIcon className="h-3.5 w-3.5" /> Nombre del Cliente
                </Label>
                <div className="relative">
                  <Input
                    id="cliente"
                    placeholder={searchDoc ? 'No encontrado' : 'Buscar documento...'}
                    value={formData.cliente}
                    onChange={(e) => setFormData({ ...formData, cliente: e.target.value })}
                    // Si encontramos cliente, bloqueamos la edición manual del nombre para forzar consistencia
                    readOnly={!!foundCustomer}
                    className={cn(
                      'h-10 pl-9',
                      foundCustomer
                        ? 'bg-emerald-50/50 text-foreground border-emerald-200 focus-visible:ring-emerald-500/30'
                        : 'bg-background'
                    )}
                  />
                  {foundCustomer ? (
                    <Check className="absolute left-3 top-3 h-4 w-4 text-emerald-500" />
                  ) : (
                    <UserIcon className="absolute left-3 top-3 h-4 w-4 text-muted-foreground opacity-50" />
                  )}
                </div>
              </div>
            </div>

            {!foundCustomer && searchDoc.length > 2 && (
              <p className="text-[11px] text-muted-foreground -mt-2">
                * Cliente no registrado. Se guardará solo con el nombre.
              </p>
            )}
          </div>

          <DialogFooter className="mt-6 pt-2">
            <Button
              type="submit"
              className="w-full sm:w-auto h-10 px-6"
              disabled={!formData.cliente || !formData.servicio || isSubmitting}
            >
              {isSubmitting ? (
                'Guardando...'
              ) : (
                <>
                  <Save className="mr-2 h-4 w-4" /> Confirmar Turno
                </>
              )}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  )
}
