import { useForm } from 'react-hook-form'
import { useNavigate } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'
import { Button } from '@ui/button'
import { Input } from '@ui/input'
import { Spinner } from '@ui/spinner'
import { toast } from 'sonner'
import { ShieldCheck, NotebookPen } from 'lucide-react'

export default function Login() {
  const { login } = useAuth()
  const navigate = useNavigate()

  const {
    register,
    handleSubmit,
    formState: { isSubmitting, errors }
  } = useForm({
    defaultValues: {
      usuario: '',
      password: ''
    }
  })

  const onSubmit = async (data) => {
    try {
      const result = await login(data.usuario, data.password)

      if (result.success) {
        toast.success('Acceso autorizado')
        navigate('/turnos', { replace: true })
      } else {
        // Esto mostrará "Usuario o contraseña incorrectos" gracias al mapeo en AuthContext
        toast.error(result.message || 'Credenciales inválidas')
      }
    } catch (error) {
      // Esto solo se ejecutará si hay un fallo de red o error de código grave
      toast.error('Error de comunicación con el servidor')
    }
  }

  return (
    <div className="flex h-full w-full flex-col bg-background select-none overflow-hidden">
      <div className="flex flex-col items-center justify-center flex-1 px-8 pt-4">
        <div className="mb-6 flex flex-col items-center animate-in fade-in slide-in-from-top-4 duration-1000">
          <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-primary shadow-[0_0_20px_rgba(var(--primary),0.3)]">
            <NotebookPen className="h-8 w-8 text-primary-foreground" />
          </div>
          <h2 className="mt-4 text-xl font-bold tracking-tight text-foreground">Bienvenido</h2>
          <p className="text-[11px] font-medium text-muted-foreground uppercase tracking-[0.2em] mt-1">
            Gestión de Acceso
          </p>
        </div>

        <form
          onSubmit={handleSubmit(onSubmit)}
          className={`w-full space-y-5 animate-in fade-in zoom-in duration-700 transition-opacity ${
            isSubmitting ? 'opacity-60 pointer-events-none' : 'opacity-100'
          }`}
        >
          <div className="space-y-1.5">
            <label className="text-[11px] font-semibold text-muted-foreground uppercase ml-1">
              Usuario
            </label>
            <Input
              {...register('usuario', { required: true })}
              placeholder="Ingresa tu usuario"
              disabled={isSubmitting}
              className={`h-11 bg-secondary/30 border-input transition-all ${
                errors.usuario ? 'border-destructive' : ''
              }`}
            />
          </div>

          <div className="space-y-1.5">
            <label className="text-[11px] font-semibold text-muted-foreground uppercase ml-1">
              Contraseña
            </label>
            <Input
              {...register('password', { required: true })}
              type="password"
              placeholder="••••••••"
              disabled={isSubmitting}
              className={`h-11 bg-secondary/30 border-input transition-all ${
                errors.password ? 'border-destructive' : ''
              }`}
            />
          </div>

          <Button
            type="submit"
            disabled={isSubmitting}
            className="h-11 w-full font-bold text-sm tracking-wide bg-primary shadow-lg active:scale-[0.97] transition-all relative overflow-hidden"
          >
            {isSubmitting ? (
              <div className="flex items-center justify-center gap-2">
                <Spinner className="h-4 w-4 animate-spin" />
                <span>VERIFICANDO...</span>
              </div>
            ) : (
              <div className="flex items-center justify-center gap-2">
                <span>INICIAR SESIÓN</span>
                <ShieldCheck className="h-4 w-4" />
              </div>
            )}
          </Button>
        </form>
      </div>

      <div className="p-6 flex flex-col items-center opacity-30">
        <div className="w-12 h-[1px] bg-border mb-3" />
        <span className="text-[9px] font-medium text-muted-foreground uppercase tracking-widest">
          Terminal v1.0
        </span>
      </div>
    </div>
  )
}
