import { useEffect } from 'react'
import { useForm } from 'react-hook-form'
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from '@ui/dialog'
import { Button } from '@ui/button'
import { Input } from '@ui/input'
import { Label } from '@ui/label'

interface ServiceForm {
  nombre: string
}

interface Props {
  open: boolean
  onOpenChange: (open: boolean) => void
  service?: { id: number; nombre: string }
  onSubmit: (nombre: string) => Promise<boolean>
}

export function ServiceDialog({ open, onOpenChange, service, onSubmit }: Props) {
  const {
    register,
    handleSubmit,
    reset,
    formState: { errors, isSubmitting }
  } = useForm<ServiceForm>()

  useEffect(() => {
    if (open) {
      reset({ nombre: service?.nombre || '' })
    }
  }, [open, service, reset])

  const handleProcess = async (data: ServiceForm) => {
    const success = await onSubmit(data.nombre)
    if (success) {
      onOpenChange(false)
    }
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle>{service ? 'Editar Servicio' : 'Nuevo Servicio'}</DialogTitle>
        </DialogHeader>

        <form onSubmit={handleSubmit(handleProcess)} className="space-y-4 py-4">
          <div className="space-y-2">
            <Label htmlFor="nombre">Nombre del Servicio</Label>
            <Input
              id="nombre"
              placeholder="Ej: Corte de Cabello"
              {...register('nombre', {
                required: 'El nombre es obligatorio',
                minLength: { value: 2, message: 'El nombre debe tener al menos 2 caracteres' }
              })}
              className={errors.nombre ? 'border-destructive' : ''}
            />
            {errors.nombre && <p className="text-xs text-destructive">{errors.nombre.message}</p>}
          </div>

          <DialogFooter className="pt-4">
            <Button
              type="button"
              variant="outline"
              onClick={() => onOpenChange(false)}
              disabled={isSubmitting}
            >
              Cancelar
            </Button>
            <Button type="submit" disabled={isSubmitting}>
              {service ? 'Guardar Cambios' : 'Crear Servicio'}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  )
}
