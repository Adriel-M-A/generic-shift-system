import { useEffect, useState } from 'react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@ui/card'
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@ui/table'
import { Button } from '@ui/button'
import { Badge } from '@ui/badge'
import { Avatar, AvatarFallback, AvatarImage } from '@ui/avatar'
import { Plus, Search, Shield, ShieldAlert, Eye, Pencil, Trash2, AlertTriangle } from 'lucide-react'
import { Input } from '@ui/input'
import { User, useAuth } from '@auth/context/AuthContext'
import { toast } from 'sonner'
import { UsuarioForm } from '@auth/components/UsuarioForm'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle
} from '@ui/dialog'
import { Spinner } from '@ui/spinner'

export function Usuarios() {
  const { user: currentUser } = useAuth()
  const [users, setUsers] = useState<User[]>([])
  const [loading, setLoading] = useState(true)
  const [searchTerm, setSearchTerm] = useState('')

  // Estados para Formulario (Crear/Editar)
  const [isFormOpen, setIsFormOpen] = useState(false)
  const [editingUser, setEditingUser] = useState<User | null>(null)

  // Estados para Confirmación de Eliminación
  const [isDeleteOpen, setIsDeleteOpen] = useState(false)
  const [userToDelete, setUserToDelete] = useState<User | null>(null)
  const [isDeleting, setIsDeleting] = useState(false)

  useEffect(() => {
    loadUsers()
  }, [])

  const loadUsers = async () => {
    try {
      const result = await window.api.auth.getUsers()
      if (result.success) {
        setUsers(result.users)
      } else {
        toast.error('No se pudieron cargar los usuarios')
      }
    } catch (error) {
      toast.error('Error de conexión')
    } finally {
      setLoading(false)
    }
  }

  const handleCreate = () => {
    setEditingUser(null)
    setIsFormOpen(true)
  }

  const handleEdit = (user: User) => {
    setEditingUser(user)
    setIsFormOpen(true)
  }

  // PASO 1: Abrir el diálogo de confirmación (No borra todavía)
  const requestDelete = (targetUser: User) => {
    if (targetUser.id === currentUser?.id) {
      toast.error('No puedes eliminar tu propia cuenta')
      return
    }
    setUserToDelete(targetUser)
    setIsDeleteOpen(true)
  }

  // PASO 2: Ejecutar el borrado real
  const confirmDelete = async () => {
    if (!userToDelete) return

    setIsDeleting(true)
    try {
      const result = await window.api.auth.deleteUser(userToDelete.id)

      if (result.success) {
        toast.success('Usuario eliminado correctamente')
        loadUsers()
        setIsDeleteOpen(false)
        setUserToDelete(null)
      } else {
        toast.error(result.message || 'Error al eliminar')
      }
    } catch (error) {
      toast.error('Error de comunicación')
    } finally {
      setIsDeleting(false)
    }
  }

  const filteredUsers = users.filter(
    (u) =>
      u.nombre.toLowerCase().includes(searchTerm.toLowerCase()) ||
      u.apellido.toLowerCase().includes(searchTerm.toLowerCase()) ||
      u.usuario.toLowerCase().includes(searchTerm.toLowerCase())
  )

  return (
    <div className="space-y-4 animate-in fade-in duration-500">
      <div className="flex items-center justify-between gap-4">
        <div className="relative flex-1 max-w-sm">
          <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder="Buscar..."
            className="pl-9 bg-background"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>
        <Button className="gap-2 shadow-sm" onClick={handleCreate}>
          <Plus className="h-4 w-4" />
          Nuevo Usuario
        </Button>
      </div>

      <Card className="shadow-sm border-border/50">
        <CardHeader className="pb-3">
          <CardTitle className="text-lg font-bold">Directorio de Usuarios</CardTitle>
          <CardDescription>Gestión de cuentas y niveles de acceso.</CardDescription>
        </CardHeader>
        <CardContent className="p-0">
          <Table>
            <TableHeader>
              <TableRow className="bg-muted/50 hover:bg-muted/50">
                <TableHead className="w-12.5"></TableHead>
                <TableHead>Nombre Completo</TableHead>
                <TableHead>Usuario</TableHead>
                <TableHead>Nivel</TableHead>
                <TableHead>Última Conexión</TableHead>
                <TableHead className="text-right pr-6">Acciones</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {loading ? (
                <TableRow>
                  <TableCell colSpan={6} className="h-24 text-center text-muted-foreground">
                    Cargando...
                  </TableCell>
                </TableRow>
              ) : filteredUsers.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={6} className="h-24 text-center text-muted-foreground">
                    No se encontraron usuarios.
                  </TableCell>
                </TableRow>
              ) : (
                filteredUsers.map((user) => (
                  <TableRow key={user.id} className="hover:bg-muted/30 transition-colors">
                    <TableCell className="pl-4">
                      <Avatar className="h-8 w-8 border border-border">
                        <AvatarImage src="" />
                        <AvatarFallback className="text-[10px] font-bold bg-secondary text-secondary-foreground">
                          {user.nombre.charAt(0)}
                          {user.apellido.charAt(0)}
                        </AvatarFallback>
                      </Avatar>
                    </TableCell>

                    <TableCell className="font-medium text-foreground">
                      {user.nombre} {user.apellido}
                    </TableCell>

                    <TableCell>
                      <code className="px-2 py-0.5 rounded bg-muted text-xs font-mono text-foreground">
                        @{user.usuario}
                      </code>
                    </TableCell>

                    <TableCell>
                      {user.level === 1 && (
                        <Badge
                          variant="default"
                          className="gap-1 pl-1 pr-2 bg-primary/10 text-primary hover:bg-primary/20 border-0 shadow-none"
                        >
                          <Shield className="h-3 w-3" /> Admin
                        </Badge>
                      )}
                      {user.level === 2 && (
                        <Badge
                          variant="secondary"
                          className="gap-1 pl-1 pr-2 bg-orange-500/10 text-orange-600 hover:bg-orange-500/20 border-0"
                        >
                          <ShieldAlert className="h-3 w-3" /> Staff
                        </Badge>
                      )}
                      {user.level === 3 && (
                        <Badge
                          variant="outline"
                          className="gap-1 pl-1 pr-2 border-dashed text-muted-foreground"
                        >
                          <Eye className="h-3 w-3" /> Auditor
                        </Badge>
                      )}
                    </TableCell>

                    <TableCell className="text-xs text-muted-foreground">
                      {user.last_login ? new Date(user.last_login).toLocaleString() : 'Nunca'}
                    </TableCell>

                    <TableCell className="text-right pr-4">
                      <div className="flex items-center justify-end gap-1">
                        <Button
                          variant="ghost"
                          size="icon"
                          className="h-8 w-8 text-muted-foreground hover:text-primary hover:bg-primary/10 transition-colors"
                          title="Editar"
                          onClick={() => handleEdit(user)}
                        >
                          <Pencil className="h-4 w-4" />
                        </Button>

                        <Button
                          variant="ghost"
                          size="icon"
                          className="h-8 w-8 text-muted-foreground hover:text-destructive hover:bg-destructive/10 transition-colors disabled:opacity-30"
                          title={user.id === currentUser?.id ? 'No puedes eliminarte' : 'Eliminar'}
                          disabled={user.id === currentUser?.id}
                          // AQUÍ LLAMAMOS A LA FUNCIÓN DE SOLICITUD
                          onClick={() => requestDelete(user)}
                        >
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      </div>
                    </TableCell>
                  </TableRow>
                ))
              )}
            </TableBody>
          </Table>
        </CardContent>
      </Card>

      {/* MODAL 1: FORMULARIO CREAR/EDITAR */}
      <UsuarioForm
        open={isFormOpen}
        onOpenChange={setIsFormOpen}
        userToEdit={editingUser}
        onSuccess={loadUsers}
      />

      {/* MODAL 2: CONFIRMACIÓN DE ELIMINAR */}
      <Dialog open={isDeleteOpen} onOpenChange={setIsDeleteOpen}>
        <DialogContent className="sm:max-w-100">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2 text-destructive">
              <AlertTriangle className="h-5 w-5" />
              Confirmar Eliminación
            </DialogTitle>
            <DialogDescription className="pt-2">
              ¿Estás seguro de que quieres eliminar al usuario{' '}
              <span className="font-bold text-foreground">@{userToDelete?.usuario}</span>?
              <br />
              <br />
              Esta acción es permanente y no se puede deshacer.
            </DialogDescription>
          </DialogHeader>
          <DialogFooter className="gap-2 sm:gap-0">
            <Button variant="ghost" onClick={() => setIsDeleteOpen(false)} disabled={isDeleting}>
              Cancelar
            </Button>
            <Button
              variant="destructive"
              onClick={confirmDelete}
              disabled={isDeleting}
              className="gap-2"
            >
              {isDeleting ? <Spinner className="text-white" /> : <Trash2 className="h-4 w-4" />}
              Eliminar Usuario
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  )
}
