import { useState, useEffect } from 'react'
import {
  Plus,
  Search,
  Trash2,
  Loader2,
  ChevronLeft,
  ChevronRight,
  Pencil,
  MoreHorizontal
} from 'lucide-react'
import { Button } from '@ui/button'
import { Input } from '@ui/input'
import { Switch } from '@ui/switch'
import { TableHeader, TableBody, TableHead, TableRow, TableCell } from '@ui/table'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger
} from '@ui/dropdown-menu'
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle
} from '@ui/alert-dialog'

import { useServices } from '../hooks/useServices'
import { ServiceDialog } from '../components/ServiceDialog'

const LIMIT = 15

export default function Servicios() {
  const [search, setSearch] = useState('')
  const [page, setPage] = useState(1)
  const { services, total, isLoading, createService, toggleService, deleteService } = useServices(
    page,
    LIMIT,
    search
  )

  const [isDialogOpen, setIsDialogOpen] = useState(false)
  const [editingService, setEditingService] = useState<{ id: number; nombre: string } | undefined>(
    undefined
  )
  const [deleteId, setDeleteId] = useState<number | null>(null)

  const totalPages = Math.ceil(total / LIMIT) || 1

  useEffect(() => {
    setPage(1)
  }, [search])

  const handleEdit = (service: any) => {
    setEditingService(service)
    setIsDialogOpen(true)
  }

  return (
    <div className="h-full flex flex-col gap-4 p-6 animate-in fade-in duration-300">
      <div className="flex-none flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-3xl font-bold tracking-tight">Servicios</h2>
          <p className="text-muted-foreground mt-1">Configura los servicios que ofreces.</p>
        </div>
      </div>

      <div className="flex-none flex flex-row items-center justify-between gap-4">
        <div className="relative w-full max-w-sm">
          <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder="Buscar servicios..."
            className="pl-9 bg-background h-9"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />
        </div>
        <Button
          onClick={() => {
            setEditingService(undefined)
            setIsDialogOpen(true)
          }}
          className="gap-2 shadow-sm"
        >
          <Plus className="h-4 w-4" />
          <span className="hidden sm:inline">Nuevo Servicio</span>
        </Button>
      </div>

      <div className="flex-1 min-h-0 rounded-md border bg-card overflow-auto">
        <table className="w-full text-sm text-left">
          <TableHeader className="sticky top-0 z-20 bg-card">
            <TableRow className="hover:bg-transparent border-none">
              <TableHead className="h-12 pl-6">Nombre del Servicio</TableHead>
              <TableHead className="h-12 w-[120px]">Estado</TableHead>
              <TableHead className="text-right pr-6 h-12 w-[100px]">Acciones</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {isLoading ? (
              <TableRow>
                <TableCell colSpan={3} className="h-32 text-center">
                  <Loader2 className="animate-spin mx-auto opacity-50" />
                </TableCell>
              </TableRow>
            ) : services.length === 0 ? (
              <TableRow>
                <TableCell colSpan={3} className="h-32 text-center text-muted-foreground">
                  No hay servicios.
                </TableCell>
              </TableRow>
            ) : (
              services.map((s) => (
                <TableRow key={s.id} className="group border-b transition-colors hover:bg-muted/50">
                  <TableCell className="pl-6 py-3 font-medium">{s.nombre}</TableCell>
                  <TableCell className="py-3">
                    <Switch checked={s.activo === 1} onCheckedChange={() => toggleService(s.id)} />
                  </TableCell>
                  <TableCell className="text-right pr-6 py-3">
                    <div className="hidden sm:flex items-center justify-end gap-1">
                      <Button
                        variant="ghost"
                        size="icon"
                        className="h-8 w-8 text-muted-foreground hover:text-primary"
                        onClick={() => handleEdit(s)}
                      >
                        <Pencil className="h-4 w-4" />
                      </Button>
                      <Button
                        variant="ghost"
                        size="icon"
                        className="h-8 w-8 text-muted-foreground hover:text-destructive"
                        onClick={() => setDeleteId(s.id)}
                      >
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </div>
                    <div className="sm:hidden flex justify-end">
                      <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                          <Button variant="ghost" size="icon">
                            <MoreHorizontal />
                          </Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent align="end">
                          <DropdownMenuItem onClick={() => handleEdit(s)}>Editar</DropdownMenuItem>
                          <DropdownMenuItem
                            className="text-destructive"
                            onClick={() => setDeleteId(s.id)}
                          >
                            Eliminar
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

      <div className="flex-none flex items-center justify-between pt-2">
        <p className="text-sm text-muted-foreground">Total: {total} servicios</p>
        <div className="flex items-center gap-2">
          <Button
            variant="outline"
            size="sm"
            onClick={() => setPage((p) => p - 1)}
            disabled={page === 1}
          >
            <ChevronLeft className="w-4 h-4" />
          </Button>
          <span className="text-sm font-medium">
            {page} / {totalPages}
          </span>
          <Button
            variant="outline"
            size="sm"
            onClick={() => setPage((p) => p + 1)}
            disabled={page === totalPages}
          >
            <ChevronRight className="w-4 h-4" />
          </Button>
        </div>
      </div>

      <ServiceDialog
        open={isDialogOpen}
        onOpenChange={setIsDialogOpen}
        service={editingService}
        onSubmit={async (nombre) => {
          if (editingService)
            return await window.api.services.update(editingService.id, nombre).then(() => true)
          return await createService(nombre)
        }}
      />

      <AlertDialog open={!!deleteId} onOpenChange={(open) => !open && setDeleteId(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>¿Eliminar servicio?</AlertDialogTitle>
            <AlertDialogDescription>Esta acción no se puede deshacer.</AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancelar</AlertDialogCancel>
            <AlertDialogAction
              onClick={() => deleteId && deleteService(deleteId)}
              className="bg-destructive text-destructive-foreground"
            >
              Eliminar
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  )
}
