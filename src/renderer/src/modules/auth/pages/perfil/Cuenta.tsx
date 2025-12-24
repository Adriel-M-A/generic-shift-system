import { useState } from 'react'
import { useAuth } from '@auth/context/AuthContext'
import { Card, CardContent, CardDescription, CardHeader, CardTitle, CardFooter } from '@ui/card'
import { Avatar, AvatarFallback, AvatarImage } from '@ui/avatar'
import { Label } from '@ui/label'
import { Input } from '@ui/input'
import { Button } from '@ui/button'
import { Separator } from '@ui/separator'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger
} from '@ui/dialog'
import { toast } from 'sonner'
import { Shield, ShieldAlert, Calendar, Clock, Save, X, Pencil, Lock } from 'lucide-react'

export function Cuenta() {
  const { user, isAdmin, updateProfile, changePassword } = useAuth()
  const [isEditing, setIsEditing] = useState(false)

  // Estado para edición de perfil
  const [formData, setFormData] = useState({
    nombre: user?.nombre || '',
    apellido: user?.apellido || '',
    usuario: user?.usuario || ''
  })

  // Estado para cambio de contraseña
  const [passData, setPassData] = useState({ current: '', new: '', confirm: '' })
  const [isPassDialogOpen, setIsPassDialogOpen] = useState(false)

  const memberSince = user?.created_at ? new Date(user.created_at).toLocaleDateString() : 'N/A'

  const lastLogin = user?.last_login ? new Date(user.last_login).toLocaleString() : 'Primera sesión'

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { id, value } = e.target
    setFormData((prev) => ({ ...prev, [id]: value }))
  }

  const handleSave = async () => {
    const success = await updateProfile(formData)
    if (success) {
      toast.success('Perfil actualizado correctamente')
      setIsEditing(false)
    } else {
      toast.error('Error al actualizar. El usuario podría estar ocupado.')
    }
  }

  const handleChangePassword = async () => {
    if (passData.new !== passData.confirm) {
      toast.error('Las contraseñas nuevas no coinciden')
      return
    }
    if (passData.new.length < 4) {
      toast.error('La contraseña es muy corta')
      return
    }

    const result = await changePassword(passData.current, passData.new)
    if (result.success) {
      toast.success('Contraseña actualizada correctamente')
      setIsPassDialogOpen(false)
      setPassData({ current: '', new: '', confirm: '' })
    } else {
      toast.error(result.message || 'Error al actualizar contraseña')
    }
  }

  return (
    <div className="space-y-6 animate-in fade-in duration-500 pb-10">
      {/* TARJETA DE PERFIL PRINCIPAL */}
      <Card className="overflow-hidden border-border/50 shadow-sm">
        <div className="h-24 bg-linear-to-r from-primary/10 to-secondary/30" />
        <CardContent className="relative pt-0">
          <div className="flex flex-col md:flex-row items-start md:items-end gap-4 -mt-12 mb-4 px-2">
            <Avatar className="h-24 w-24 border-4 border-background shadow-lg">
              <AvatarImage src="" />
              <AvatarFallback className="text-2xl font-bold bg-primary text-primary-foreground">
                {user?.nombre?.charAt(0)}
                {user?.apellido?.charAt(0)}
              </AvatarFallback>
            </Avatar>

            <div className="flex-1 space-y-1 mb-2">
              <h2 className="text-2xl font-bold tracking-tight">
                {user?.nombre} {user?.apellido}
              </h2>
              <div className="flex items-center gap-2 text-muted-foreground text-sm">
                <span className="flex items-center gap-1 font-medium text-foreground/80">
                  @{user?.usuario}
                </span>
                <span>•</span>
                <span className="flex items-center gap-1">
                  {isAdmin ? (
                    <Shield className="h-3.5 w-3.5 text-primary" />
                  ) : (
                    <ShieldAlert className="h-3.5 w-3.5" />
                  )}
                  {isAdmin ? 'Administrador' : 'Usuario'}
                </span>
              </div>
            </div>

            {/* Acciones: Editar y Cambiar Contraseña */}
            {isAdmin && !isEditing && (
              <div className="flex gap-2">
                <Dialog open={isPassDialogOpen} onOpenChange={setIsPassDialogOpen}>
                  <DialogTrigger asChild>
                    <Button variant="outline" size="sm" className="gap-2">
                      <Lock className="h-3.5 w-3.5" />
                      Contraseña
                    </Button>
                  </DialogTrigger>
                  <DialogContent>
                    <DialogHeader>
                      <DialogTitle>Cambiar Contraseña</DialogTitle>
                      <DialogDescription>
                        Ingresa tu contraseña actual y la nueva contraseña deseada.
                      </DialogDescription>
                    </DialogHeader>
                    <div className="space-y-4 py-2">
                      <div className="space-y-2">
                        <Label>Contraseña Actual</Label>
                        <Input
                          type="password"
                          value={passData.current}
                          onChange={(e) => setPassData({ ...passData, current: e.target.value })}
                        />
                      </div>
                      <div className="space-y-2">
                        <Label>Nueva Contraseña</Label>
                        <Input
                          type="password"
                          value={passData.new}
                          onChange={(e) => setPassData({ ...passData, new: e.target.value })}
                        />
                      </div>
                      <div className="space-y-2">
                        <Label>Confirmar Nueva Contraseña</Label>
                        <Input
                          type="password"
                          value={passData.confirm}
                          onChange={(e) => setPassData({ ...passData, confirm: e.target.value })}
                        />
                      </div>
                    </div>
                    <DialogFooter>
                      <Button onClick={handleChangePassword}>Actualizar</Button>
                    </DialogFooter>
                  </DialogContent>
                </Dialog>

                <Button
                  onClick={() => setIsEditing(true)}
                  size="sm"
                  variant="default"
                  className="gap-2"
                >
                  <Pencil className="h-3.5 w-3.5" />
                  Editar Perfil
                </Button>
              </div>
            )}
          </div>
        </CardContent>
      </Card>

      <div className="grid gap-6 md:grid-cols-2">
        {/* FORMULARIO DE DATOS */}
        <Card className="shadow-sm border-l-4 border-l-primary/50">
          <CardHeader>
            <CardTitle className="text-lg">Información Personal</CardTitle>
            <CardDescription>
              {isEditing ? 'Edita tus datos de acceso.' : 'Datos identificativos de tu cuenta.'}
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label
                  htmlFor="nombre"
                  className="text-xs uppercase text-muted-foreground font-semibold"
                >
                  Nombre
                </Label>
                {isEditing ? (
                  <Input id="nombre" value={formData.nombre} onChange={handleInputChange} />
                ) : (
                  <div className="px-3 py-2 rounded bg-muted/30 text-foreground h-10 flex items-center cursor-default">
                    {user?.nombre}
                  </div>
                )}
              </div>
              <div className="space-y-2">
                <Label
                  htmlFor="apellido"
                  className="text-xs uppercase text-muted-foreground font-semibold"
                >
                  Apellido
                </Label>
                {isEditing ? (
                  <Input id="apellido" value={formData.apellido} onChange={handleInputChange} />
                ) : (
                  <div className="px-3 py-2 rounded bg-muted/30 text-foreground h-10 flex items-center cursor-default">
                    {user?.apellido}
                  </div>
                )}
              </div>
            </div>

            <div className="space-y-2">
              <Label
                htmlFor="usuario"
                className="text-xs uppercase text-muted-foreground font-semibold"
              >
                Usuario (Login)
              </Label>
              {isEditing ? (
                <Input id="usuario" value={formData.usuario} onChange={handleInputChange} />
              ) : (
                <div className="px-3 py-2 rounded bg-muted/30 text-foreground h-10 flex items-center cursor-default font-mono">
                  @{user?.usuario}
                </div>
              )}
            </div>
          </CardContent>

          {isEditing && (
            <CardFooter className="flex justify-end gap-2 pt-0">
              <Button variant="ghost" onClick={() => setIsEditing(false)} size="sm">
                <X className="h-4 w-4 mr-2" /> Cancelar
              </Button>
              <Button onClick={handleSave} size="sm">
                <Save className="h-4 w-4 mr-2" /> Guardar Cambios
              </Button>
            </CardFooter>
          )}
        </Card>

        {/* TARJETA DE ACTIVIDAD (Sin barra de privilegios) */}
        <Card className="shadow-sm flex flex-col">
          <CardHeader>
            <CardTitle className="text-lg">Actividad de Cuenta</CardTitle>
            <CardDescription>Registro de conexiones y alta.</CardDescription>
          </CardHeader>
          <CardContent className="space-y-6 flex-1">
            <div className="flex items-start gap-4">
              <div className="p-2 rounded-md bg-secondary text-secondary-foreground">
                <Clock className="h-5 w-5" />
              </div>
              <div>
                <p className="text-sm font-medium">Última Conexión</p>
                <p className="text-xs text-muted-foreground mt-0.5">{lastLogin}</p>
              </div>
            </div>

            <Separator />

            <div className="flex items-start gap-4">
              <div className="p-2 rounded-md bg-secondary text-secondary-foreground">
                <Calendar className="h-5 w-5" />
              </div>
              <div>
                <p className="text-sm font-medium">Fecha de Alta</p>
                <p className="text-xs text-muted-foreground mt-0.5">{memberSince}</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
