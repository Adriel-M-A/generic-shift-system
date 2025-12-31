import { useState, useRef, useEffect } from 'react'
import {
  Plus,
  Save,
  Clock,
  Briefcase,
  ChevronDown,
  ChevronUp,
  Search,
  User as UserIcon,
  Loader2,
  UserPlus,
  X
} from 'lucide-react'
import { Button } from '@ui/button'
import { Input } from '@ui/input'
import { Label } from '@ui/label'
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetDescription,
  SheetFooter
} from '@ui/sheet'
import { Separator } from '@ui/separator'
import { ScrollArea } from '@ui/scroll-area'
import { Badge } from '@ui/badge'
import { useShifts } from '../hooks/useShifts'
import { cn } from '@lib/utils'
import { Customer } from '@shared/types/customer'
import { formatDateHeader } from '../utils'

export function ShiftSheetForm() {
  const { currentDate, config, createShift, updateShift, isSheetOpen, closeSheet, editingShift } =
    useShifts()
  const [isServiceOpen, setIsServiceOpen] = useState(false)
  const serviceWrapperRef = useRef<HTMLDivElement>(null)
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [isSearching, setIsSearching] = useState(false)

  // Horario
  const [hour, setHour] = useState(9)
  const [minute, setMinute] = useState(0)

  // Servicios
  const [availableServices, setAvailableServices] = useState<string[]>([])
  const [selectedServices, setSelectedServices] = useState<string[]>([])
  const [serviceSearch, setServiceSearch] = useState('')

  // Cliente
  const [foundCustomer, setFoundCustomer] = useState<Customer | null>(null)
  const [searchDoc, setSearchDoc] = useState('')
  const [customerData, setCustomerData] = useState({ nombre: '', apellido: '', telefono: '' })

  // Inicializar formulario cuando se abre la sheet
  useEffect(() => {
    if (!isSheetOpen) return

    if (editingShift) {
      // Modo edición: cargar datos del turno
      const [h, m] = editingShift.hora.split(':').map(Number)
      setHour(h)
      setMinute(m)

      // Parsear servicios correctamente (pueden estar separados por comas o ser un array)
      const services = Array.isArray(editingShift.servicio)
        ? editingShift.servicio
        : editingShift.servicio.split(',').map((s: string) => s.trim())
      setSelectedServices(services)

      // Parsear cliente (formato: "Apellido Nombre")
      const [apellido, nombre] = editingShift.cliente.split(' ')
      setCustomerData({
        nombre: nombre || '',
        apellido: apellido || '',
        telefono: ''
      })

      // Si existe customer_id, simular búsqueda encontrada
      if (editingShift.customer_id) {
        setFoundCustomer({
          id: editingShift.customer_id,
          nombre: nombre || '',
          apellido: apellido || '',
          telefono: ''
        } as Customer)
        setSearchDoc(editingShift.customer_id.toString())
      } else {
        setSearchDoc('')
        setFoundCustomer(null)
      }
    } else {
      // Modo creación: resetear formulario
      const [h, m] = config.openingTime ? config.openingTime.split(':').map(Number) : [9, 0]
      setHour(h)
      setMinute(m)
      setSelectedServices([])
      setSearchDoc('')
      setCustomerData({ nombre: '', apellido: '', telefono: '' })
      setFoundCustomer(null)
    }
  }, [isSheetOpen, editingShift, config.openingTime])

  // Cargar servicios disponibles
  useEffect(() => {
    async function fetchServices() {
      const data = await window.api.services.getAll()
      setAvailableServices(data.filter((s: any) => s.activo).map((s: any) => s.nombre))
    }
    if (isSheetOpen) fetchServices()
  }, [isSheetOpen])

  // Buscar cliente por documento (solo en modo creación)
  useEffect(() => {
    if (!searchDoc || editingShift) {
      setFoundCustomer(null)
      return
    }

    const timer = setTimeout(async () => {
      setIsSearching(true)
      try {
        const customer = await window.api.customers.findByDocument(searchDoc)
        if (customer) {
          setFoundCustomer(customer)
          setCustomerData({
            nombre: customer.nombre,
            apellido: customer.apellido,
            telefono: customer.telefono || ''
          })
        } else {
          setFoundCustomer(null)
        }
      } catch (error) {
        setFoundCustomer(null)
      }
      setIsSearching(false)
    }, 400)

    return () => clearTimeout(timer)
  }, [searchDoc, editingShift])

  // Cerrar dropdown de servicios al hacer click afuera
  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (serviceWrapperRef.current && !serviceWrapperRef.current.contains(event.target as Node)) {
        setIsServiceOpen(false)
      }
    }
    document.addEventListener('mousedown', handleClickOutside)
    return () => document.removeEventListener('mousedown', handleClickOutside)
  }, [])

  // Lógica de tiempo continuo
  const handleHourChange = (val: number) => {
    if (val > 23) setHour(0)
    else if (val < 0) setHour(23)
    else setHour(val)
  }

  const handleMinuteChange = (val: number) => {
    if (val >= 60) {
      setMinute(0)
      handleHourChange(hour + 1)
    } else if (val < 0) {
      setMinute(59)
      handleHourChange(hour - 1)
    } else {
      setMinute(val)
    }
  }

  const removeService = (srv: string) => {
    setSelectedServices(selectedServices.filter((s) => s !== srv))
  }

  const isClientValid =
    foundCustomer ||
    (customerData.nombre.trim().length > 0 && customerData.apellido.trim().length > 0)

  const canSubmit =
    isClientValid &&
    selectedServices.length > 0 &&
    (editingShift ? true : searchDoc.length > 0) &&
    !isSubmitting

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!canSubmit) return

    setIsSubmitting(true)
    const finalTime = `${hour.toString().padStart(2, '0')}:${minute.toString().padStart(2, '0')}`

    const data = {
      fecha: editingShift ? editingShift.fecha : currentDate.toISOString().split('T')[0],
      hora: finalTime,
      cliente: `${customerData.apellido} ${customerData.nombre}`,
      servicio: selectedServices,
      customerId: foundCustomer?.id || editingShift?.customer_id || undefined,
      createCustomer:
        !foundCustomer && !editingShift ? { ...customerData, documento: searchDoc } : undefined
    }

    const success = editingShift
      ? await updateShift(editingShift.id, data)
      : await createShift(data)

    if (success) {
      closeSheet()
    }

    setIsSubmitting(false)
  }

  return (
    <Sheet open={isSheetOpen} onOpenChange={(open) => !open && closeSheet()}>
      <SheetContent className="sm:max-w-md p-0 flex flex-col border-l shadow-2xl">
        <form onSubmit={handleSubmit} className="h-full flex flex-col">
          <div className="p-6 border-b bg-muted/20">
            <SheetTitle className="text-2xl font-black flex items-center gap-2">
              {editingShift ? (
                <Clock className="h-6 w-6 text-primary" />
              ) : (
                <Plus className="h-6 w-6 text-primary" />
              )}
              {editingShift ? 'Editar Turno' : 'Nuevo Turno'}
            </SheetTitle>
            <SheetDescription className="font-medium mt-1">
              Agenda: {formatDateHeader(currentDate)}
            </SheetDescription>
          </div>

          <ScrollArea className="flex-1 p-6">
            <div className="space-y-8 pr-4">
              {/* Horario */}
              <div className="space-y-4">
                <Label className="text-xs font-black uppercase tracking-widest flex items-center gap-2 text-foreground">
                  <Clock className="h-4 w-4 text-primary" /> 1. Definir Horario
                </Label>
                <div className="flex items-center gap-4">
                  <div className="flex flex-col items-center gap-1.5">
                    <Input
                      type="number"
                      value={hour}
                      onChange={(e) => handleHourChange(parseInt(e.target.value) || 0)}
                      className="w-20 h-12 text-center text-lg font-bold border-muted-foreground/30 [&::-webkit-inner-spin-button]:opacity-100 [&::-webkit-outer-spin-button]:opacity-100"
                    />
                    <span className="text-[9px] font-bold text-muted-foreground uppercase tracking-wider">
                      Horas
                    </span>
                  </div>
                  <span className="text-2xl font-bold text-muted-foreground/30 mb-6">:</span>
                  <div className="flex flex-col items-center gap-1.5">
                    <Input
                      type="number"
                      step={config.interval || 1}
                      value={minute}
                      onChange={(e) => handleMinuteChange(parseInt(e.target.value) || 0)}
                      className="w-20 h-12 text-center text-lg font-bold border-muted-foreground/30 [&::-webkit-inner-spin-button]:opacity-100 [&::-webkit-outer-spin-button]:opacity-100"
                    />
                    <span className="text-[9px] font-bold text-muted-foreground uppercase tracking-wider">
                      Minutos
                    </span>
                  </div>
                </div>
              </div>

              {/* Servicios */}
              <div className="space-y-4" ref={serviceWrapperRef}>
                <Label className="text-xs font-black uppercase tracking-widest flex items-center gap-2 text-foreground">
                  <Briefcase className="h-4 w-4 text-primary" /> 2. Servicios
                </Label>

                <div
                  className={cn(
                    'relative cursor-pointer border rounded-lg bg-background transition-all h-11 flex items-center px-3 shadow-sm',
                    isServiceOpen
                      ? 'ring-2 ring-primary/30 border-primary'
                      : 'border-muted-foreground/30 hover:border-primary/50'
                  )}
                  onClick={() => setIsServiceOpen(!isServiceOpen)}
                >
                  <Search className="h-4 w-4 mr-2 text-muted-foreground/40" />
                  <input
                    placeholder="Buscar y agregar..."
                    value={serviceSearch}
                    onChange={(e) => {
                      setServiceSearch(e.target.value)
                      setIsServiceOpen(true)
                    }}
                    onClick={(e) => e.stopPropagation()}
                    className="flex-1 bg-transparent outline-none text-sm font-medium"
                  />
                  {isServiceOpen ? (
                    <ChevronUp className="h-4 w-4 text-primary" />
                  ) : (
                    <ChevronDown className="h-4 w-4 text-muted-foreground/60" />
                  )}

                  {isServiceOpen && (
                    <div className="absolute top-[calc(100%+6px)] left-0 w-full z-50 bg-background border border-muted-foreground/20 rounded-xl shadow-2xl max-h-48 overflow-y-auto animate-in fade-in-0 zoom-in-95">
                      {availableServices
                        .filter((s) => s.toLowerCase().includes(serviceSearch.toLowerCase()))
                        .map((srv) => (
                          <div
                            key={srv}
                            className="px-4 py-3 text-sm hover:bg-accent cursor-pointer border-b last:border-0 font-semibold"
                            onClick={(e) => {
                              e.stopPropagation()
                              if (!selectedServices.includes(srv)) {
                                setSelectedServices([...selectedServices, srv])
                              }
                              setIsServiceOpen(false)
                              setServiceSearch('')
                            }}
                          >
                            {srv}
                          </div>
                        ))}
                    </div>
                  )}
                </div>

                <div className="max-h-20.5 overflow-y-auto p-2 rounded-lg bg-muted/20 border border-dashed border-muted-foreground/10 flex flex-wrap gap-2">
                  {selectedServices.map((srv) => (
                    <Badge
                      key={srv}
                      variant="secondary"
                      className="pl-3 pr-1.5 py-1 gap-2 bg-background border-primary/20 shadow-sm text-foreground font-bold"
                    >
                      {srv}
                      <button
                        type="button"
                        onClick={() => removeService(srv)}
                        className="hover:opacity-70"
                      >
                        <X className="h-3 w-3 text-muted-foreground hover:text-destructive" />
                      </button>
                    </Badge>
                  ))}
                </div>
              </div>

              <Separator className="opacity-50" />

              {/* Cliente */}
              <div className="space-y-4">
                <Label className="text-xs font-black uppercase tracking-widest flex items-center gap-2 text-foreground">
                  <UserIcon className="h-4 w-4 text-primary" /> 3. Cliente
                </Label>

                <div className="space-y-4">
                  {/* Documento */}
                  <div className="space-y-1.5">
                    <Label className="text-[11px] font-bold text-foreground/70 ml-1">
                      Documento
                    </Label>
                    <div className="relative">
                      <Input
                        placeholder="DNI..."
                        value={searchDoc}
                        onChange={(e) => setSearchDoc(e.target.value.replace(/[^0-9]/g, ''))}
                        readOnly={!!editingShift}
                        className={cn(
                          'pl-9 h-11 border-muted-foreground/30 font-bold',
                          editingShift && 'bg-muted border-none cursor-not-allowed'
                        )}
                      />
                      {isSearching ? (
                        <Loader2 className="absolute left-3 top-3.5 h-4 w-4 animate-spin text-primary" />
                      ) : (
                        <Search className="absolute left-3 top-3.5 h-4 w-4 text-muted-foreground/30" />
                      )}
                    </div>
                  </div>

                  {/* Nombre y Apellido */}
                  <div className="grid grid-cols-2 gap-3">
                    <div className="space-y-1.5">
                      <Label className="text-[11px] font-bold text-foreground/70 ml-1">
                        Nombre
                      </Label>
                      <Input
                        value={customerData.nombre}
                        onChange={(e) =>
                          setCustomerData({ ...customerData, nombre: e.target.value })
                        }
                        readOnly={!!foundCustomer || !!editingShift}
                        placeholder="Nombre"
                        className={cn(
                          'h-10 font-bold text-sm',
                          (foundCustomer || editingShift) &&
                            'bg-muted border-none cursor-not-allowed'
                        )}
                      />
                    </div>
                    <div className="space-y-1.5">
                      <Label className="text-[11px] font-bold text-foreground/70 ml-1">
                        Apellido
                      </Label>
                      <Input
                        value={customerData.apellido}
                        onChange={(e) =>
                          setCustomerData({ ...customerData, apellido: e.target.value })
                        }
                        readOnly={!!foundCustomer || !!editingShift}
                        placeholder="Apellido"
                        className={cn(
                          'h-10 font-bold text-sm',
                          (foundCustomer || editingShift) &&
                            'bg-muted border-none cursor-not-allowed'
                        )}
                      />
                    </div>
                  </div>

                  {/* Teléfono */}
                  <div className="space-y-1.5">
                    <Label className="text-[11px] font-bold text-foreground/70 ml-1">
                      Teléfono (opcional)
                    </Label>
                    <Input
                      value={customerData.telefono}
                      onChange={(e) =>
                        setCustomerData({ ...customerData, telefono: e.target.value })
                      }
                      readOnly={!!foundCustomer || !!editingShift}
                      placeholder="Teléfono"
                      className={cn(
                        'h-10 font-bold text-sm',
                        (foundCustomer || editingShift) && 'bg-muted border-none cursor-not-allowed'
                      )}
                    />
                  </div>

                  {/* Mensaje de cliente nuevo */}
                  {!foundCustomer && !editingShift && searchDoc.length >= 7 && (
                    <p className="text-[10px] text-primary font-bold italic flex items-center gap-1 pt-2">
                      <UserPlus className="h-3 w-3" /> Cliente nuevo: se registrará automáticamente
                    </p>
                  )}
                </div>
              </div>
            </div>
          </ScrollArea>

          <SheetFooter className="p-6 border-t bg-muted/20 shrink-0">
            <Button type="submit" className="w-full h-11 font-bold gap-2" disabled={!canSubmit}>
              {isSubmitting ? (
                <Loader2 className="h-4 w-4 animate-spin" />
              ) : (
                <Save className="h-4 w-4" />
              )}
              {editingShift ? 'GUARDAR CAMBIOS' : 'AGENDAR TURNO'}
            </Button>
          </SheetFooter>
        </form>
      </SheetContent>
    </Sheet>
  )
}
