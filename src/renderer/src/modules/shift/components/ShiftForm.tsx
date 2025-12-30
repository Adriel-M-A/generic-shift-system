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
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger
} from '@ui/dialog'
import { Separator } from '@ui/separator'
import { useShifts } from '../hooks/useShifts'
import { cn } from '@lib/utils'
import { Customer } from '@shared/types/customer'
import { formatDateHeader } from '../utils'
import { Badge } from '@ui/badge'

export function ShiftForm() {
  const { currentDate, config, createShift } = useShifts()
  const [open, setOpen] = useState(false)
  const [isServiceOpen, setIsServiceOpen] = useState(false)
  const serviceWrapperRef = useRef<HTMLDivElement>(null)
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [isSearching, setIsSearching] = useState(false)

  // Horario (Restaurada lógica original)
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

  useEffect(() => {
    if (config.openingTime && open) {
      const [h, m] = config.openingTime.split(':')
      setHour(parseInt(h))
      setMinute(parseInt(m))
    }
  }, [config.openingTime, open])

  useEffect(() => {
    async function fetchServices() {
      const data = await window.api.services.getAll()
      setAvailableServices(data.map((s: any) => s.nombre))
    }
    if (open) fetchServices()
  }, [open])

  // LÓGICA DE TIEMPO CONTINUO (Restaurada)
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

  useEffect(() => {
    if (!searchDoc) {
      setFoundCustomer(null)
      setCustomerData({ nombre: '', apellido: '', telefono: '' })
      return
    }
    const timer = setTimeout(async () => {
      setIsSearching(true)
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
      setIsSearching(false)
    }, 400)
    return () => clearTimeout(timer)
  }, [searchDoc])

  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (serviceWrapperRef.current && !serviceWrapperRef.current.contains(event.target as Node))
        setIsServiceOpen(false)
    }
    document.addEventListener('mousedown', handleClickOutside)
    return () => document.removeEventListener('mousedown', handleClickOutside)
  }, [])

  const removeService = (srv: string) =>
    setSelectedServices(selectedServices.filter((s) => s !== srv))

  const isClientValid =
    foundCustomer ||
    (customerData.nombre.trim().length > 0 && customerData.apellido.trim().length > 0)

  const canSubmit =
    isClientValid && selectedServices.length > 0 && searchDoc.length > 0 && !isSubmitting

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!canSubmit) return
    setIsSubmitting(true)

    const finalTime = `${hour.toString().padStart(2, '0')}:${minute.toString().padStart(2, '0')}`

    // Ahora enviamos los datos compatibles con el nuevo tipo NewShiftData
    const success = await createShift({
      fecha: currentDate.toISOString().split('T')[0],
      hora: finalTime,
      cliente: `${customerData.apellido} ${customerData.nombre}`,
      servicio: selectedServices, // Array de strings
      customerId: foundCustomer?.id || undefined,
      createCustomer: !foundCustomer ? { ...customerData, documento: searchDoc } : undefined
    })

    if (success) {
      setOpen(false)
      setSelectedServices([])
      setSearchDoc('')
      setCustomerData({ nombre: '', apellido: '', telefono: '' })
    }
    setIsSubmitting(false)
  }

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button className="gap-2 shadow-sm bg-primary h-9 font-semibold">
          <Plus className="h-4 w-4" /> Nuevo Turno
        </Button>
      </DialogTrigger>

      <DialogContent className="sm:max-w-200 p-0 overflow-visible block border-none shadow-2xl">
        <form onSubmit={handleSubmit}>
          <div className="p-10">
            <DialogHeader className="mb-12">
              <DialogTitle className="flex items-center gap-3 text-3xl font-extrabold tracking-tight text-foreground">
                <Plus className="h-7 w-7 text-primary" /> Crear Nuevo Turno
              </DialogTitle>
              <DialogDescription className="text-sm text-muted-foreground">
                Agenda para el{' '}
                <span className="font-bold text-foreground underline decoration-primary/40 decoration-2">
                  {formatDateHeader(currentDate)}
                </span>
              </DialogDescription>
            </DialogHeader>

            <div className="flex flex-col md:flex-row gap-10 items-stretch">
              <div className="flex-1 space-y-10">
                <div className="space-y-4">
                  <Label className="text-xs font-black uppercase text-foreground tracking-[0.15em] flex items-center gap-2">
                    <Clock className="h-4 w-4 text-primary" /> 1. Definir Horario
                  </Label>
                  <div className="flex items-center gap-4">
                    <div className="flex flex-col items-center gap-1.5">
                      <Input
                        type="number"
                        value={hour}
                        onChange={(e) => handleHourChange(parseInt(e.target.value) || 0)}
                        className="w-20 h-12 text-center text-xl font-bold border-muted-foreground/30 [&::-webkit-inner-spin-button]:opacity-100 [&::-webkit-outer-spin-button]:opacity-100"
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
                        className="w-20 h-12 text-center text-xl font-bold border-muted-foreground/30 [&::-webkit-inner-spin-button]:opacity-100 [&::-webkit-outer-spin-button]:opacity-100"
                      />
                      <span className="text-[9px] font-bold text-muted-foreground uppercase tracking-wider">
                        Minutos
                      </span>
                    </div>
                  </div>
                </div>

                <div className="space-y-4" ref={serviceWrapperRef}>
                  <Label className="text-xs font-black uppercase text-foreground tracking-[0.15em] flex items-center gap-2">
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
                      <div className="absolute top-[calc(100%+6px)] left-0 w-full z-100 bg-background border border-muted-foreground/20 rounded-xl shadow-2xl max-h-48 overflow-y-auto animate-in fade-in-0 zoom-in-95">
                        {availableServices
                          .filter((s) => s.toLowerCase().includes(serviceSearch.toLowerCase()))
                          .map((srv) => (
                            <div
                              key={srv}
                              className="px-4 py-3 text-sm hover:bg-accent cursor-pointer border-b last:border-0 font-semibold"
                              onClick={(e) => {
                                e.stopPropagation()
                                if (!selectedServices.includes(srv))
                                  setSelectedServices([...selectedServices, srv])
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
                        {srv}{' '}
                        <button type="button" onClick={() => removeService(srv)}>
                          <X className="h-3 w-3 text-muted-foreground hover:text-destructive" />
                        </button>
                      </Badge>
                    ))}
                  </div>
                </div>
              </div>

              <Separator
                orientation="vertical"
                className="hidden md:block h-auto bg-muted-foreground/10"
              />

              <div className="flex-1 space-y-6">
                <Label className="text-xs font-black uppercase text-foreground tracking-[0.15em] flex items-center gap-2">
                  <UserIcon className="h-4 w-4 text-primary" /> 3. Cliente
                </Label>
                <div className="space-y-4">
                  <div className="space-y-1.5">
                    <Label className="text-[11px] font-bold text-foreground/70 ml-1">
                      Documento
                    </Label>
                    <div className="relative">
                      <Input
                        placeholder="DNI..."
                        value={searchDoc}
                        onChange={(e) => setSearchDoc(e.target.value.replace(/[^0-9]/g, ''))}
                        className="pl-9 h-11 border-muted-foreground/30 font-bold"
                      />
                      {isSearching ? (
                        <Loader2 className="absolute left-3 top-3.5 h-4 w-4 animate-spin text-primary" />
                      ) : (
                        <Search className="absolute left-3 top-3.5 h-4 w-4 text-muted-foreground/30" />
                      )}
                    </div>
                  </div>
                  <div className="grid grid-cols-2 gap-4">
                    <Input
                      value={customerData.nombre}
                      onChange={(e) => setCustomerData({ ...customerData, nombre: e.target.value })}
                      readOnly={!!foundCustomer}
                      placeholder="Nombre"
                      className={cn('h-10 font-bold', foundCustomer && 'bg-muted border-none')}
                      required
                    />
                    <Input
                      value={customerData.apellido}
                      onChange={(e) =>
                        setCustomerData({ ...customerData, apellido: e.target.value })
                      }
                      readOnly={!!foundCustomer}
                      placeholder="Apellido"
                      className={cn('h-10 font-bold', foundCustomer && 'bg-muted border-none')}
                      required
                    />
                  </div>
                  <Input
                    value={customerData.telefono}
                    onChange={(e) => setCustomerData({ ...customerData, telefono: e.target.value })}
                    readOnly={!!foundCustomer}
                    placeholder="Teléfono"
                    className={cn('h-10 font-bold', foundCustomer && 'bg-muted border-none')}
                  />
                  {!foundCustomer && searchDoc.length >= 7 && (
                    <span className="text-[10px] text-primary font-bold lowercase italic leading-none pt-1 flex items-center gap-1">
                      <UserPlus className="h-3 w-3" /> cliente nuevo: se registrará automáticamente.
                    </span>
                  )}
                </div>
              </div>
            </div>
          </div>
          <DialogFooter className="p-8 border-t bg-muted/5">
            <Button
              type="submit"
              className="w-full h-12 text-base font-bold gap-3 shadow-lg"
              disabled={!canSubmit}
            >
              {isSubmitting ? (
                <Loader2 className="h-5 w-5 animate-spin" />
              ) : (
                <Save className="h-4 w-4" />
              )}{' '}
              AGENDAR TURNO
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  )
}
