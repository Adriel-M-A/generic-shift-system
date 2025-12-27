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
import { useShifts, NewShiftData } from '../hooks/useShifts'
import { cn } from '@lib/utils'
import { Customer } from '@customers/types'

interface ShiftFormProps {
  currentDate: Date | undefined
  formatDateHeader: (d: Date) => string
  onSave?: (data: NewShiftData) => void
}

export function ShiftForm({ currentDate, formatDateHeader, onSave }: ShiftFormProps) {
  const { config, createShift } = useShifts()
  const [open, setOpen] = useState(false)
  const [isServiceOpen, setIsServiceOpen] = useState(false)
  const serviceWrapperRef = useRef<HTMLDivElement>(null)
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [time, setTime] = useState(config.openingTime || '09:00')
  const [availableServices, setAvailableServices] = useState<string[]>([])
  const [customers, setCustomers] = useState<Customer[]>([])
  const [searchDoc, setSearchDoc] = useState('')
  const [formData, setFormData] = useState({ cliente: '', servicio: '' })

  useEffect(() => {
    if (config.openingTime) setTime(config.openingTime)
  }, [config.openingTime])

  useEffect(() => {
    async function fetchData() {
      try {
        const [servicesData, customersData] = await Promise.all([
          window.api.services.getAll(),
          window.api.customers.getAll()
        ])
        setAvailableServices(
          servicesData.filter((s: any) => s.activo === 1).map((s: any) => s.nombre)
        )
        setCustomers(customersData)
      } catch (error) {
        console.error(error)
      }
    }
    if (open) fetchData()
  }, [open])

  const foundCustomer = useMemo(() => {
    if (!searchDoc) return null
    return customers.find((c) => c.documento === searchDoc)
  }, [searchDoc, customers])

  useEffect(() => {
    if (foundCustomer) {
      setFormData((prev) => ({
        ...prev,
        cliente: `${foundCustomer.apellido} ${foundCustomer.nombre}`
      }))
    } else if (searchDoc === '') {
      setFormData((prev) => ({ ...prev, cliente: '' }))
    }
  }, [foundCustomer, searchDoc])

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsSubmitting(true)
    const data: NewShiftData = {
      cliente: formData.cliente,
      servicio: formData.servicio,
      hora: time,
      customerId: foundCustomer ? foundCustomer.id : undefined
    }
    const success = await createShift(data)
    setIsSubmitting(false)
    if (success) {
      if (onSave) onSave(data)
      setOpen(false)
      setFormData({ cliente: '', servicio: '' })
      setSearchDoc('')
      setTime(config.openingTime)
    }
  }

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
              <Plus className="h-5 w-5 text-primary" /> Crear Nuevo Turno
            </DialogTitle>
            <DialogDescription className="mt-1">
              Agendando para{' '}
              <span className="font-semibold text-foreground">
                {currentDate ? formatDateHeader(currentDate) : 'hoy'}
              </span>
            </DialogDescription>
          </DialogHeader>
          <div className="grid gap-5 py-1">
            <div className="grid gap-2">
              <Label className="flex items-center gap-2 text-muted-foreground text-sm">
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
            <div className="grid gap-2 relative z-50">
              <Label className="flex items-center gap-2 text-muted-foreground text-sm">
                <Briefcase className="h-3.5 w-3.5" /> Servicio
              </Label>
              <Input
                placeholder="Selecciona servicio..."
                value={formData.servicio}
                onChange={(e) => setFormData({ ...formData, servicio: e.target.value })}
                required
              />
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div className="grid gap-2">
                <Label className="flex items-center gap-2 text-muted-foreground text-sm">
                  <Search className="h-3.5 w-3.5" /> DNI
                </Label>
                <Input
                  placeholder="Buscar..."
                  value={searchDoc}
                  onChange={(e) => setSearchDoc(e.target.value.replace(/[^0-9]/g, ''))}
                />
              </div>
              <div className="grid gap-2">
                <Label className="flex items-center gap-2 text-muted-foreground text-sm">
                  <UserIcon className="h-3.5 w-3.5" /> Nombre
                </Label>
                <Input
                  value={formData.cliente}
                  onChange={(e) => setFormData({ ...formData, cliente: e.target.value })}
                  readOnly={!!foundCustomer}
                />
              </div>
            </div>
          </div>
          <DialogFooter className="mt-6">
            <Button
              type="submit"
              className="w-full h-10"
              disabled={!formData.cliente || isSubmitting}
            >
              {isSubmitting ? 'Guardando...' : 'Confirmar Turno'}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  )
}
