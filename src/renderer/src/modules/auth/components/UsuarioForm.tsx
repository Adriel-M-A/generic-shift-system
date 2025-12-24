import { useEffect } from 'react'
import { useForm } from 'react-hook-form'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle
} from '@ui/dialog'
import { Button } from '@ui/button'
import { Input } from '@ui/input'
import { Spinner } from '@ui/spinner'
import { toast } from 'sonner'
import { User } from '../context/AuthContext'
import { Shield, ShieldAlert, Eye, Save } from 'lucide-react'

interface UsuarioFormProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  userToEdit: User | null
  onSuccess: () => void
}

export function UsuarioForm({ open, onOpenChange, userToEdit, onSuccess }: UsuarioFormProps) {
  const isEditing = !!userToEdit

  const {
    register,
    handleSubmit,
    reset,
    setValue,
    watch,
    formState: { errors, isSubmitting }
  } = useForm({
    defaultValues: {
      nombre: '',
      apellido: '',
      usuario: '',
      password: '',
      level: 2
    }
  })

  const currentLevel = watch('level')

  useEffect(() => {
    if (open) {
      if (userToEdit) {
        reset({
          nombre: userToEdit.nombre,
          apellido: userToEdit.apellido,
          usuario: userToEdit.usuario,
          password: '', // Siempre vacía al abrir edición
          level: userToEdit.level
        })
      } else {
        reset({
          nombre: '',
          apellido: '',
          usuario: '',
          password: '',
          level: 2
        })
      }
    }
  }, [open, userToEdit, reset])

  const onSubmit = async (data: any) => {
    try {
      let result

      if (isEditing) {
        // En edición, si el password está vacío, lo borramos del objeto para que el backend sepa que no hay cambio
        const updateData = { ...data }
        if (!updateData.password || updateData.password.trim() === '') {
          delete updateData.password
        }

        result = await window.api.auth.updateUser(userToEdit.id, updateData)
      } else {
        result = await window.api.auth.createUser(data)
      }

      if (result.success) {
        toast.success(isEditing ? 'Usuario actualizado' : 'Usuario creado correctamente')
        onSuccess()
        onOpenChange(false)
      } else {
        toast.error(result.message || 'Error en la operación')
      }
    } catch (error) {
      toast.error('Error de comunicación con el sistema')
    }
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-125">
        <DialogHeader>
          <DialogTitle>{isEditing ? 'Editar Usuario' : 'Nuevo Usuario'}</DialogTitle>
          <DialogDescription>
            {isEditing
              ? 'Modifica los datos, contraseña o nivel de acceso.'
              : 'Ingresa los datos para registrar un nuevo miembro.'}
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit(onSubmit)} className="space-y-4 py-2">
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <span className="text-xs font-medium uppercase text-muted-foreground">Nombre</span>
              <Input {...register('nombre', { required: true })} placeholder="Ej. Juan" />
              {errors.nombre && <span className="text-xs text-destructive">Requerido</span>}
            </div>
            <div className="space-y-2">
              <span className="text-xs font-medium uppercase text-muted-foreground">Apellido</span>
              <Input {...register('apellido', { required: true })} placeholder="Ej. Pérez" />
            </div>
          </div>

          <div className="space-y-2">
            <span className="text-xs font-medium uppercase text-muted-foreground">
              Usuario (Login)
            </span>
            <Input {...register('usuario', { required: true })} placeholder="usuario.sistema" />
          </div>

          {/* CAMPO DE CONTRASEÑA MEJORADO */}
          <div className="space-y-2">
            <div className="flex justify-between">
              <span className="text-xs font-medium uppercase text-muted-foreground">
                Contraseña
              </span>
              {isEditing && (
                <span className="text-[10px] text-primary/80 italic">
                  Opcional: Dejar vacía para no cambiar
                </span>
              )}
            </div>
            <Input
              {...register('password', { required: !isEditing, minLength: 4 })}
              type="password"
              placeholder={isEditing ? '•••••••• (Sin cambios)' : '••••••••'}
            />
            {errors.password && (
              <span className="text-xs text-destructive">Mínimo 4 caracteres</span>
            )}
          </div>

          {/* SELECTOR DE 3 NIVELES */}
          <div className="space-y-2 pt-2">
            <span className="text-xs font-medium uppercase text-muted-foreground block mb-2">
              Nivel de Acceso
            </span>
            <div className="grid grid-cols-3 gap-2">
              {/* Nivel 1: Admin */}
              <div
                onClick={() => setValue('level', 1)}
                className={`
                  cursor-pointer rounded-lg border p-2 flex flex-col items-center gap-2 transition-all text-center
                  ${
                    currentLevel === 1
                      ? 'border-primary bg-primary/10 ring-1 ring-primary'
                      : 'border-border hover:bg-secondary/50'
                  }
                `}
              >
                <Shield
                  className={`h-4 w-4 ${currentLevel === 1 ? 'text-primary' : 'text-muted-foreground'}`}
                />
                <span
                  className={`text-[10px] font-bold uppercase ${currentLevel === 1 ? 'text-primary' : 'text-muted-foreground'}`}
                >
                  Admin
                </span>
              </div>

              {/* Nivel 2: Operador */}
              <div
                onClick={() => setValue('level', 2)}
                className={`
                  cursor-pointer rounded-lg border p-2 flex flex-col items-center gap-2 transition-all text-center
                  ${
                    currentLevel === 2
                      ? 'border-primary bg-primary/10 ring-1 ring-primary'
                      : 'border-border hover:bg-secondary/50'
                  }
                `}
              >
                <ShieldAlert
                  className={`h-4 w-4 ${currentLevel === 2 ? 'text-primary' : 'text-muted-foreground'}`}
                />
                <span
                  className={`text-[10px] font-bold uppercase ${currentLevel === 2 ? 'text-primary' : 'text-muted-foreground'}`}
                >
                  Staff
                </span>
              </div>

              {/* Nivel 3: Auditor/Invitado */}
              <div
                onClick={() => setValue('level', 3)}
                className={`
                  cursor-pointer rounded-lg border p-2 flex flex-col items-center gap-2 transition-all text-center
                  ${
                    currentLevel === 3
                      ? 'border-primary bg-primary/10 ring-1 ring-primary'
                      : 'border-border hover:bg-secondary/50'
                  }
                `}
              >
                <Eye
                  className={`h-4 w-4 ${currentLevel === 3 ? 'text-primary' : 'text-muted-foreground'}`}
                />
                <span
                  className={`text-[10px] font-bold uppercase ${currentLevel === 3 ? 'text-primary' : 'text-muted-foreground'}`}
                >
                  Auditor
                </span>
              </div>
            </div>
          </div>

          <DialogFooter className="pt-4">
            <Button type="button" variant="ghost" onClick={() => onOpenChange(false)}>
              Cancelar
            </Button>
            <Button type="submit" disabled={isSubmitting} className="gap-2">
              {isSubmitting ? <Spinner className="h-4 w-4" /> : <Save className="h-4 w-4" />}
              {isEditing ? 'Guardar Cambios' : 'Crear Usuario'}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  )
}
