import { useEffect } from 'react'
import { useForm } from 'react-hook-form'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogFooter
} from '@ui/dialog'
import { Button } from '@ui/button'
import { Input } from '@ui/input'
import { Label } from '@ui/label'
import { Customer, CustomerFormData } from '../types'

interface CustomerDialogProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  customer?: Customer
  onSubmit: (data: CustomerFormData) => Promise<boolean>
}

export function CustomerDialog({ open, onOpenChange, customer, onSubmit }: CustomerDialogProps) {
  const {
    register,
    handleSubmit,
    reset,
    setValue,
    formState: { isSubmitting }
  } = useForm<CustomerFormData>()

  useEffect(() => {
    if (customer) {
      setValue('documento', customer.documento)
      setValue('nombre', customer.nombre)
      setValue('apellido', customer.apellido)
      setValue('telefono', customer.telefono || '')
      setValue('email', customer.email || '')
    } else {
      reset({
        documento: '',
        nombre: '',
        apellido: '',
        telefono: '',
        email: ''
      })
    }
  }, [customer, open, reset, setValue])

  const onFormSubmit = async (data: CustomerFormData) => {
    await onSubmit(data)
    // El cierre del modal lo maneja el componente padre si el submit es exitoso
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[500px]">
        <DialogHeader>
          <DialogTitle>{customer ? 'Editar Cliente' : 'Crear Nuevo Cliente'}</DialogTitle>
          <DialogDescription>
            {customer
              ? 'Modifica los datos del cliente seleccionado.'
              : 'Agrega un nuevo cliente a la base de datos.'}
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit(onFormSubmit)}>
          <div className="grid gap-4 py-4">
            <div className="grid gap-2">
              <Label htmlFor="documento">Documento / DNI</Label>
              <Input
                id="documento"
                placeholder="Ej. 12345678"
                autoFocus
                {...register('documento', { required: true })}
              />
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="grid gap-2">
                <Label htmlFor="nombre">Nombre</Label>
                <Input id="nombre" {...register('nombre', { required: true })} />
              </div>
              <div className="grid gap-2">
                <Label htmlFor="apellido">Apellido</Label>
                <Input id="apellido" {...register('apellido', { required: true })} />
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="grid gap-2">
                <Label htmlFor="telefono">Teléfono (Opcional)</Label>
                <Input id="telefono" {...register('telefono')} />
              </div>
              <div className="grid gap-2">
                <Label htmlFor="email">Email (Opcional)</Label>
                <Input id="email" type="email" {...register('email')} />
              </div>
            </div>
          </div>

          <DialogFooter>
            <Button type="button" variant="outline" onClick={() => onOpenChange(false)}>
              Cancelar
            </Button>
            <Button type="submit" disabled={isSubmitting}>
              {isSubmitting ? 'Guardando...' : 'Guardar'}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  )
}
