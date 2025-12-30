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
import { Customer, CustomerFormData } from '@shared/types'

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
    formState: { isSubmitting, errors }
  } = useForm<CustomerFormData>()

  useEffect(() => {
    if (open) {
      reset({
        documento: customer?.documento || '',
        nombre: customer?.nombre || '',
        apellido: customer?.apellido || '',
        telefono: customer?.telefono || '',
        email: customer?.email || ''
      })
    }
  }, [customer, open, reset])

  const onFormSubmit = async (data: CustomerFormData) => {
    const success = await onSubmit(data)
    if (success) onOpenChange(false)
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-125">
        <DialogHeader>
          <DialogTitle>{customer ? 'Editar Cliente' : 'Crear Nuevo Cliente'}</DialogTitle>
          <DialogDescription>
            {customer ? 'Modifica los datos del cliente.' : 'Agrega un nuevo cliente.'}
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit(onFormSubmit)} className="space-y-4 py-4">
          <div className="grid gap-2">
            <Label htmlFor="documento">Documento / DNI</Label>
            <Input
              id="documento"
              {...register('documento', { required: 'El documento es obligatorio' })}
              className={errors.documento ? 'border-destructive' : ''}
            />
            {errors.documento && (
              <p className="text-xs text-destructive">{errors.documento.message}</p>
            )}
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="grid gap-2">
              <Label htmlFor="nombre">Nombre</Label>
              <Input
                id="nombre"
                {...register('nombre', { required: 'Obligatorio' })}
                className={errors.nombre ? 'border-destructive' : ''}
              />
            </div>
            <div className="grid gap-2">
              <Label htmlFor="apellido">Apellido</Label>
              <Input
                id="apellido"
                {...register('apellido', { required: 'Obligatorio' })}
                className={errors.apellido ? 'border-destructive' : ''}
              />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="grid gap-2">
              <Label htmlFor="telefono">Teléfono</Label>
              <Input id="telefono" {...register('telefono')} />
            </div>
            <div className="grid gap-2">
              <Label htmlFor="email">Email</Label>
              <Input id="email" type="email" {...register('email')} />
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
