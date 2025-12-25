import { useState, useEffect } from 'react'
import {
  Plus,
  Search,
  Pencil,
  Trash2,
  Power,
  ChevronLeft,
  ChevronRight,
  MoreHorizontal
} from 'lucide-react'

import { Button } from '@ui/button'
import { Input } from '@ui/input'
import { Label } from '@ui/label'
import { Badge } from '@ui/badge'
// Importamos solo las partes internas de la tabla para tener control del contenedor
import { TableHeader, TableBody, TableHead, TableRow, TableCell } from '@ui/table'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger
} from '@ui/dialog'
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
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger
} from '@ui/dropdown-menu'
import { cn } from '@lib/utils'

// --- Tipos ---
export interface Servicio {
  id: number
  nombre: string
  activo: boolean
}

// --- Mock Data ---
const MOCK_SERVICIOS: Servicio[] = Array.from({ length: 30 }).map((_, i) => ({
  id: i + 1,
  nombre:
    [
      'Corte de Pelo',
      'Barba',
      'Coloración',
      'Alisado',
      'Peinado',
      'Tratamiento',
      'Manicura',
      'Pedicura',
      'Limpieza Facial',
      'Masaje Capilar'
    ][i % 10] + (i > 9 ? ` ${i + 1}` : ''),
  activo: i % 5 !== 0
}))

const ITEMS_PER_PAGE = 15

export function Servicios() {
  const [servicios, setServicios] = useState<Servicio[]>(MOCK_SERVICIOS)
  const [search, setSearch] = useState('')
  const [currentPage, setCurrentPage] = useState(1)

  // Estados UI
  const [isDialogOpen, setIsDialogOpen] = useState(false)
  const [editingId, setEditingId] = useState<number | null>(null)
  const [formData, setFormData] = useState({ nombre: '' })
  const [deleteId, setDeleteId] = useState<number | null>(null)

  // Filtrado y Paginación
  const filteredServicios = servicios.filter((s) =>
    s.nombre.toLowerCase().includes(search.toLowerCase())
  )

  const totalPages = Math.ceil(filteredServicios.length / ITEMS_PER_PAGE)
  const startIndex = (currentPage - 1) * ITEMS_PER_PAGE
  const paginatedServicios = filteredServicios.slice(startIndex, startIndex + ITEMS_PER_PAGE)

  useEffect(() => {
    setCurrentPage(1)
  }, [search])

  // --- Handlers ---
  const handleSave = (e: React.FormEvent) => {
    e.preventDefault()
    if (editingId) {
      setServicios((prev) =>
        prev.map((s) => (s.id === editingId ? { ...s, nombre: formData.nombre } : s))
      )
    } else {
      const newId = Math.max(...servicios.map((s) => s.id), 0) + 1
      setServicios((prev) => [...prev, { id: newId, nombre: formData.nombre, activo: true }])
    }
    closeDialog()
  }

  const handleEdit = (servicio: Servicio) => {
    setEditingId(servicio.id)
    setFormData({ nombre: servicio.nombre })
    setIsDialogOpen(true)
  }

  const handleDelete = () => {
    if (deleteId) {
      setServicios((prev) => prev.filter((s) => s.id !== deleteId))
      setDeleteId(null)
      if (paginatedServicios.length === 1 && currentPage > 1) {
        setCurrentPage((prev) => prev - 1)
      }
    }
  }

  const handleToggleActive = (id: number) => {
    setServicios((prev) => prev.map((s) => (s.id === id ? { ...s, activo: !s.activo } : s)))
  }

  const closeDialog = () => {
    setIsDialogOpen(false)
    setEditingId(null)
    setFormData({ nombre: '' })
  }

  return (
    <div className="h-full flex flex-col gap-4 p-6 animate-in fade-in duration-300">
      {/* SECCIÓN SUPERIOR (FIJA) */}
      <div className="flex-none flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-3xl font-bold tracking-tight text-foreground">Servicios</h2>
          <p className="text-muted-foreground mt-1">Gestiona el catálogo de servicios.</p>
        </div>

        <Dialog open={isDialogOpen} onOpenChange={(open) => !open && closeDialog()}>
          <DialogTrigger asChild>
            <Button
              onClick={() => setIsDialogOpen(true)}
              className="gap-2 shadow-sm w-full sm:w-auto"
            >
              <Plus className="h-4 w-4" />
              Nuevo Servicio
            </Button>
          </DialogTrigger>
          <DialogContent className="sm:max-w-[425px]">
            <form onSubmit={handleSave}>
              <DialogHeader>
                <DialogTitle>{editingId ? 'Editar Servicio' : 'Crear Nuevo Servicio'}</DialogTitle>
                <DialogDescription>
                  {editingId
                    ? 'Modifica el nombre del servicio seleccionado.'
                    : 'Agrega un nuevo servicio al catálogo general.'}
                </DialogDescription>
              </DialogHeader>
              <div className="grid gap-4 py-4">
                <div className="grid gap-2">
                  <Label htmlFor="nombre">Nombre del Servicio</Label>
                  <Input
                    id="nombre"
                    value={formData.nombre}
                    onChange={(e) => setFormData({ ...formData, nombre: e.target.value })}
                    placeholder="Ej. Corte Clásico"
                    autoComplete="off"
                    autoFocus
                    required
                  />
                </div>
              </div>
              <DialogFooter>
                <Button type="button" variant="outline" onClick={closeDialog}>
                  Cancelar
                </Button>
                <Button type="submit">Guardar</Button>
              </DialogFooter>
            </form>
          </DialogContent>
        </Dialog>
      </div>

      {/* BARRA DE BÚSQUEDA (FIJA) */}
      <div className="flex-none">
        <div className="relative w-full max-w-sm">
          <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
          <Input
            type="search"
            placeholder="Buscar servicio..."
            className="pl-9 h-9 bg-background"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />
        </div>
      </div>

      {/* ÁREA DE LA TABLA (FLEXIBLE CON SCROLL) */}
      {/* Usamos un div manual para el scroll en lugar del componente Table contenedor */}
      <div className="flex-1 min-h-0 rounded-md border bg-card overflow-auto relative">
        <table className="w-full caption-bottom text-sm text-left">
          <TableHeader className="sticky top-0 z-20 bg-card shadow-sm after:content-[''] after:absolute after:bottom-0 after:left-0 after:right-0 after:h-[1px] after:bg-border">
            <TableRow className="hover:bg-transparent border-none">
              <TableHead className="w-[60%] pl-6 min-w-[200px] h-12">Nombre</TableHead>
              <TableHead className="w-[20%] text-center min-w-[100px] h-12">Estado</TableHead>
              <TableHead className="w-[20%] text-right pr-6 min-w-[100px] h-12">Acciones</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {paginatedServicios.length === 0 ? (
              <TableRow>
                <TableCell colSpan={3} className="h-32 text-center">
                  <div className="flex flex-col items-center justify-center text-muted-foreground">
                    <Search className="h-8 w-8 mb-2 opacity-20" />
                    <p>No se encontraron resultados.</p>
                  </div>
                </TableCell>
              </TableRow>
            ) : (
              paginatedServicios.map((servicio) => (
                <TableRow
                  key={servicio.id}
                  className="group border-b transition-colors hover:bg-muted/50"
                >
                  <TableCell className="font-medium pl-6 py-3">{servicio.nombre}</TableCell>
                  <TableCell className="text-center py-3">
                    <Badge
                      variant="outline"
                      className={cn(
                        'cursor-pointer select-none transition-colors border',
                        // LÓGICA DE COLORES MEJORADA (Light & Dark)
                        servicio.activo
                          ? 'bg-emerald-50 text-emerald-700 border-emerald-200 hover:bg-emerald-100 hover:border-emerald-300 dark:bg-emerald-950/40 dark:text-emerald-400 dark:border-emerald-800 dark:hover:bg-emerald-900/60'
                          : 'bg-zinc-100 text-zinc-500 border-zinc-200 hover:bg-zinc-200 dark:bg-zinc-900 dark:text-zinc-500 dark:border-zinc-800 dark:hover:bg-zinc-800'
                      )}
                      onClick={() => handleToggleActive(servicio.id)}
                    >
                      {servicio.activo ? 'Activo' : 'Inactivo'}
                    </Badge>
                  </TableCell>
                  <TableCell className="text-right pr-6 py-3">
                    <div className="hidden sm:flex items-center justify-end gap-1">
                      <Button
                        variant="ghost"
                        size="icon"
                        className="h-8 w-8 text-muted-foreground hover:text-primary"
                        onClick={() => handleEdit(servicio)}
                        title="Editar"
                      >
                        <Pencil className="h-4 w-4" />
                      </Button>
                      <Button
                        variant="ghost"
                        size="icon"
                        className="h-8 w-8 text-muted-foreground hover:text-destructive"
                        onClick={() => setDeleteId(servicio.id)}
                        title="Eliminar"
                      >
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </div>

                    {/* Menú Móvil */}
                    <div className="sm:hidden flex justify-end">
                      <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                          <Button variant="ghost" className="h-8 w-8 p-0">
                            <MoreHorizontal className="h-4 w-4" />
                          </Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent align="end">
                          <DropdownMenuLabel>Acciones</DropdownMenuLabel>
                          <DropdownMenuItem onClick={() => handleEdit(servicio)}>
                            <Pencil className="mr-2 h-4 w-4" /> Editar
                          </DropdownMenuItem>
                          <DropdownMenuItem onClick={() => handleToggleActive(servicio.id)}>
                            <Power className="mr-2 h-4 w-4" />
                            {servicio.activo ? 'Desactivar' : 'Activar'}
                          </DropdownMenuItem>
                          <DropdownMenuSeparator />
                          <DropdownMenuItem
                            className="text-destructive focus:text-destructive"
                            onClick={() => setDeleteId(servicio.id)}
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

      {/* PAGINACIÓN (FIJA AL PIE) */}
      <div className="flex-none">
        {filteredServicios.length > 0 && (
          <div className="flex items-center justify-between space-x-2 pt-2">
            <div className="text-sm text-muted-foreground">
              {startIndex + 1}-{Math.min(startIndex + ITEMS_PER_PAGE, filteredServicios.length)} de{' '}
              {filteredServicios.length}
            </div>
            <div className="flex items-center space-x-2">
              <Button
                variant="outline"
                size="sm"
                onClick={() => setCurrentPage((p) => Math.max(1, p - 1))}
                disabled={currentPage === 1}
              >
                <ChevronLeft className="h-4 w-4" />
              </Button>
              <div className="text-sm font-medium">
                {currentPage} / {totalPages}
              </div>
              <Button
                variant="outline"
                size="sm"
                onClick={() => setCurrentPage((p) => Math.min(totalPages, p + 1))}
                disabled={currentPage === totalPages}
              >
                <ChevronRight className="h-4 w-4" />
              </Button>
            </div>
          </div>
        )}
      </div>

      {/* Alerta de Borrado */}
      <AlertDialog open={!!deleteId} onOpenChange={(open) => !open && setDeleteId(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>¿Eliminar servicio?</AlertDialogTitle>
            <AlertDialogDescription>
              Esta acción eliminará el servicio permanentemente.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancelar</AlertDialogCancel>
            <AlertDialogAction
              onClick={handleDelete}
              className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
            >
              Eliminar
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  )
}
