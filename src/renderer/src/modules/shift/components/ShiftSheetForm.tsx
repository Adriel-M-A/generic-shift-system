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
  X,
  Check
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

  const [hour, setHour] = useState(9)
  const [minute, setMinute] = useState(0)
  const [availableServices, setAvailableServices] = useState<string[]>([])
  const [selectedServices, setSelectedServices] = useState<string[]>([])
  const [serviceSearch, setServiceSearch] = useState('')
  const [foundCustomer, setFoundCustomer] = useState<Customer | null>(null)
  const [searchDoc, setSearchDoc] = useState('')
  const [customerData, setCustomerData] = useState({ nombre: '', apellido: '', telefono: '' })

  useEffect(() => {
    if (isSheetOpen) {
      if (editingShift) {
        const [h, m] = editingShift.hora.split(':').map(Number)
        setHour(h)
        setMinute(m)
        setSelectedServices(editingShift.servicio.split(', '))
        setSearchDoc('ID: ' + (editingShift.customer_id || 'Externo'))
        setCustomerData({
          nombre: editingShift.cliente.split(' ')[1] || '',
          apellido: editingShift.cliente.split(' ')[0] || '',
          telefono: ''
        })
      } else {
        const [h, m] = config.openingTime ? config.openingTime.split(':').map(Number) : [9, 0]
        setHour(h)
        setMinute(m)
        setSelectedServices([])
        setSearchDoc('')
        setCustomerData({ nombre: '', apellido: '', telefono: '' })
        setFoundCustomer(null)
      }
    }
  }, [isSheetOpen, editingShift, config.openingTime])

  useEffect(() => {
    async function fetchServices() {
      const data = await window.api.services.getAll()
      setAvailableServices(data.filter((s: any) => s.activo).map((s: any) => s.nombre))
    }
    if (isSheetOpen) fetchServices()
  }, [isSheetOpen])

  useEffect(() => {
    if (!searchDoc || searchDoc.startsWith('ID:') || editingShift) return
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
      } else setFoundCustomer(null)
      setIsSearching(false)
    }, 400)
    return () => clearTimeout(timer)
  }, [searchDoc])

  const handleHourChange = (val: number) => {
    setHour(val > 23 ? 0 : val < 0 ? 23 : val)
  }
  const handleMinuteChange = (val: number) => {
    if (val >= 60) {
      setMinute(0)
      handleHourChange(hour + 1)
    } else if (val < 0) {
      setMinute(59)
      handleHourChange(hour - 1)
    } else setMinute(val)
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
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
    if (success) closeSheet()
    setIsSubmitting(false)
  }

  return (
    <Sheet open={isSheetOpen} onOpenChange={(open) => !open && closeSheet()}>
      <SheetContent className="sm:max-w-md p-0 flex flex-col border-l shadow-2xl">
        <form onSubmit={handleSubmit} className="h-full flex flex-col">
          <div className="p-6 border-b bg-muted/20">
            <SheetTitle className="text-2xl font-black flex items-center gap-2">
              {editingShift ? (
                <Clock className="text-primary" />
              ) : (
                <Plus className="text-primary" />
              )}
              {editingShift ? 'Editar Turno' : 'Nuevo Turno'}
            </SheetTitle>
            <SheetDescription className="font-medium">
              Agenda: {formatDateHeader(currentDate)}
            </SheetDescription>
          </div>
          <ScrollArea className="flex-1 p-6">
            <div className="space-y-8">
              <div className="space-y-4">
                <Label className="text-[10px] font-black uppercase tracking-widest flex items-center gap-2 text-primary">
                  <Clock className="h-3.5 w-3.5" /> 1. Horario
                </Label>
                <div className="flex items-center gap-3">
                  <Input
                    type="number"
                    value={hour}
                    onChange={(e) => handleHourChange(parseInt(e.target.value) || 0)}
                    className="w-16 h-10 text-center font-bold"
                  />
                  <span className="font-bold text-muted-foreground">:</span>
                  <Input
                    type="number"
                    step={config.interval || 1}
                    value={minute}
                    onChange={(e) => handleMinuteChange(parseInt(e.target.value) || 0)}
                    className="w-16 h-10 text-center font-bold"
                  />
                </div>
              </div>
              <div className="space-y-4">
                <Label className="text-[10px] font-black uppercase tracking-widest flex items-center gap-2 text-primary">
                  <Briefcase className="h-3.5 w-3.5" /> 2. Servicios
                </Label>
                <div className="relative" ref={serviceWrapperRef}>
                  <div className="relative">
                    <Search className="absolute left-3 top-3 h-4 w-4 text-muted-foreground/40" />
                    <Input
                      placeholder="Buscar servicios..."
                      value={serviceSearch}
                      onChange={(e) => {
                        setServiceSearch(e.target.value)
                        setIsServiceOpen(true)
                      }}
                      className="pl-9 h-10 font-medium"
                    />
                  </div>
                  {isServiceOpen && (
                    <div className="absolute top-11 left-0 w-full z-50 bg-popover border rounded-md shadow-lg max-h-40 overflow-y-auto">
                      {availableServices
                        .filter((s) => s.toLowerCase().includes(serviceSearch.toLowerCase()))
                        .map((srv) => (
                          <div
                            key={srv}
                            className="px-3 py-2 text-xs hover:bg-accent cursor-pointer font-bold border-b last:border-0"
                            onClick={() => {
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
                <div className="flex flex-wrap gap-1.5 pt-1">
                  {selectedServices.map((srv) => (
                    <Badge
                      key={srv}
                      variant="secondary"
                      className="pl-2 pr-1 py-0.5 gap-1 text-[10px] font-bold"
                    >
                      {srv}{' '}
                      <X
                        className="h-3 w-3 cursor-pointer"
                        onClick={() =>
                          setSelectedServices(selectedServices.filter((s) => s !== srv))
                        }
                      />
                    </Badge>
                  ))}
                </div>
              </div>
              <Separator className="opacity-50" />
              <div className="space-y-4">
                <Label className="text-[10px] font-black uppercase tracking-widest flex items-center gap-2 text-primary">
                  <UserIcon className="h-3.5 w-3.5" /> 3. Cliente
                </Label>
                <div className="space-y-3">
                  <div className="relative">
                    <Input
                      placeholder="DNI..."
                      value={searchDoc}
                      onChange={(e) => setSearchDoc(e.target.value.replace(/[^0-9]/g, ''))}
                      readOnly={!!editingShift}
                      className="h-10 font-bold pr-9"
                    />
                    {isSearching && (
                      <Loader2 className="absolute right-3 top-3 h-4 w-4 animate-spin text-primary" />
                    )}
                  </div>
                  <div className="grid grid-cols-2 gap-2">
                    <Input
                      value={customerData.nombre}
                      onChange={(e) => setCustomerData({ ...customerData, nombre: e.target.value })}
                      readOnly={!!foundCustomer || !!editingShift}
                      placeholder="Nombre"
                      className="h-9 text-xs font-bold"
                    />
                    <Input
                      value={customerData.apellido}
                      onChange={(e) =>
                        setCustomerData({ ...customerData, apellido: e.target.value })
                      }
                      readOnly={!!foundCustomer || !!editingShift}
                      placeholder="Apellido"
                      className="h-9 text-xs font-bold"
                    />
                  </div>
                  {!foundCustomer && !editingShift && searchDoc.length >= 7 && (
                    <p className="text-[9px] text-primary font-bold italic flex items-center gap-1">
                      <UserPlus className="h-3 w-3" /> Nuevo cliente: se registrará al agendar.
                    </p>
                  )}
                </div>
              </div>
            </div>
          </ScrollArea>
          <SheetFooter className="p-6 border-t bg-muted/20">
            <Button
              type="submit"
              className="w-full h-11 font-bold gap-2"
              disabled={selectedServices.length === 0 || isSubmitting}
            >
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
