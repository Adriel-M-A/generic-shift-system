import { useEffect, useState } from 'react'
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@ui/table'
import { Button } from '@ui/button'
import { Badge } from '@ui/badge'
import { Plus, Search, Pencil, Trash2, AlertTriangle, MoreHorizontal, Loader2 } from 'lucide-react'
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
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger
} from '@ui/dropdown-menu'
import { Spinner } from '@ui/spinner'

export function Usuarios() {
  const { user: currentUser } = useAuth()
  const [users, setUsers] = useState<User[]>([])
  const [loading, setLoading] = useState(true)
  const [searchTerm, setSearchTerm] = useState('')

  const [isFormOpen, setIsFormOpen] = useState(false)
  const [editingUser, setEditingUser] = useState<User | null>(null)

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

  const requestDelete = (targetUser: User) => {
    if (targetUser.id === currentUser?.id) {
      toast.error('No puedes eliminar tu propia cuenta')
      return
    }
    setUserToDelete(targetUser)
    setIsDeleteOpen(true)
  }

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

  const getLevelBadge = (level: number) => {
    switch (level) {
      case 1:
        return <Badge variant="default">Admin</Badge>
      case 2:
        return <Badge variant="secondary">Staff</Badge>
      case 3:
        return <Badge variant="outline">Auditor</Badge>
      default:
        return '-'
    }
  }

  return (
    <div className="h-full flex flex-col gap-4 p-6 animate-in fade-in duration-300">
      {/* HEADER - BÚSQUEDA Y BOTÓN EN EL MISMO NIVEL */}
      <div className="flex-none flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div className="relative w-full max-w-sm">
          <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
          <Input
            type="search"
            placeholder="Buscar usuario..."
            className="pl-9 h-9 bg-background"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>

        <Button onClick={handleCreate} className="gap-2 shadow-sm w-full sm:w-auto">
          <Plus className="h-4 w-4" />
          Nuevo Usuario
        </Button>
      </div>

      {/* TABLA */}
      <div className="flex-1 min-h-0 rounded-md border bg-card overflow-auto">
        <table className="w-full caption-bottom text-sm text-left">
          <TableHeader className="sticky top-0 z-20 bg-card">
            <TableRow className="hover:bg-transparent border-none">
              <TableHead className="h-12 pl-6 min-w-[200px]">Nombre Completo</TableHead>
              <TableHead className="h-12 min-w-[150px]">Usuario</TableHead>
              <TableHead className="h-12 min-w-[120px]">Nivel</TableHead>
              <TableHead className="h-12 min-w-[180px]">Última Conexión</TableHead>
              <TableHead className="text-right pr-6 h-12 w-[120px]">Acciones</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {loading ? (
              <TableRow>
                <TableCell colSpan={5} className="h-32 text-center text-muted-foreground">
                  <div className="flex items-center justify-center gap-2">
                    <Loader2 className="h-4 w-4 animate-spin" />
                    Cargando usuarios...
                  </div>
                </TableCell>
              </TableRow>
            ) : filteredUsers.length === 0 ? (
              <TableRow>
                <TableCell colSpan={5} className="h-32 text-center">
                  <div className="flex flex-col items-center justify-center text-muted-foreground">
                    <Search className="h-8 w-8 mb-2 opacity-20" />
                    <p>No se encontraron resultados.</p>
                  </div>
                </TableCell>
              </TableRow>
            ) : (
              filteredUsers.map((user) => (
                <TableRow
                  key={user.id}
                  className="group border-b transition-colors hover:bg-muted/50"
                >
                  <TableCell className="pl-6 py-3 font-medium">
                    {user.nombre} {user.apellido}
                  </TableCell>
                  <TableCell className="py-3 text-muted-foreground">
                    <code className="px-2 py-0.5 rounded bg-muted text-xs font-mono">
                      @{user.usuario}
                    </code>
                  </TableCell>
                  <TableCell className="py-3">{getLevelBadge(user.level)}</TableCell>
                  <TableCell className="py-3 text-muted-foreground text-sm">
                    {user.last_login ? new Date(user.last_login).toLocaleString() : 'Nunca'}
                  </TableCell>
                  <TableCell className="text-right pr-6 py-3">
                    {/* Desktop */}
                    <div className="hidden sm:flex items-center justify-end gap-1">
                      <Button
                        variant="ghost"
                        size="icon"
                        className="h-8 w-8 text-muted-foreground hover:text-primary"
                        onClick={() => handleEdit(user)}
                        title="Editar"
                      >
                        <Pencil className="h-4 w-4" />
                      </Button>
                      <Button
                        variant="ghost"
                        size="icon"
                        className="h-8 w-8 text-muted-foreground hover:text-destructive disabled:opacity-50"
                        onClick={() => requestDelete(user)}
                        disabled={user.id === currentUser?.id}
                        title={user.id === currentUser?.id ? 'No puedes eliminarte' : 'Eliminar'}
                      >
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </div>

                    {/* Mobile */}
                    <div className="sm:hidden flex justify-end">
                      <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                          <Button variant="ghost" className="h-8 w-8 p-0">
                            <MoreHorizontal className="h-4 w-4" />
                          </Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent align="end">
                          <DropdownMenuLabel>Acciones</DropdownMenuLabel>
                          <DropdownMenuItem onClick={() => handleEdit(user)}>
                            <Pencil className="mr-2 h-4 w-4" /> Editar
                          </DropdownMenuItem>
                          <DropdownMenuSeparator />
                          <DropdownMenuItem
                            className="text-destructive focus:text-destructive"
                            onClick={() => requestDelete(user)}
                            disabled={user.id === currentUser?.id}
                          >
                            <Trash2 className="mr-2 h-4 w-4" /> Eliminar
                          </DropdownMenuItem>
                        </DropdownMenuContent>
                      </DropdownMenu>
                    </div>
                  </TableCell>
                </TableRow>
              ))
            )}
          </TableBody>
        </table>
      </div>

      {/* MODAL: FORMULARIO CREAR/EDITAR */}
      <UsuarioForm
        open={isFormOpen}
        onOpenChange={setIsFormOpen}
        userToEdit={editingUser}
        onSuccess={loadUsers}
      />

      {/* MODAL: CONFIRMACIÓN DE ELIMINAR */}
      <Dialog open={isDeleteOpen} onOpenChange={setIsDeleteOpen}>
        <DialogContent>
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
