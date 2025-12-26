import { useState, useEffect } from 'react'
import { toast } from 'sonner'
import {
  Plus,
  Search,
  Pencil,
  Trash2,
  Power,
  ChevronLeft,
  ChevronRight,
  MoreHorizontal,
  Loader2 // Importamos icono de carga
} from 'lucide-react'

import { Button } from '@ui/button'
import { Input } from '@ui/input'
import { Label } from '@ui/label'
import { Badge } from '@ui/badge'
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
  activo: number
}

const ITEMS_PER_PAGE = 15

export function Servicios() {
  const [servicios, setServicios] = useState<Servicio[]>([])
  const [loading, setLoading] = useState(true)
  const [search, setSearch] = useState('')
  const [currentPage, setCurrentPage] = useState(1)

  // --- NUEVO: Estado para bloquear clicks múltiples ---
  // Guardamos un Set con los IDs que se están actualizando en este momento
  const [processingIds, setProcessingIds] = useState<Set<number>>(new Set())

  // Estados UI
  const [isDialogOpen, setIsDialogOpen] = useState(false)
  const [editingId, setEditingId] = useState<number | null>(null)
  const [formData, setFormData] = useState({ nombre: '' })
  const [deleteId, setDeleteId] = useState<number | null>(null)

  // --- CARGAR DATOS ---
  const fetchServicios = async () => {
    try {
      setLoading(true)
      const data = await window.api.services.getAll()
      setServicios(data)
    } catch (error) {
      toast.error('Error al cargar servicios')
      console.error(error)
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    fetchServicios()
  }, [])

  // --- LÓGICA DE ORDENAMIENTO Y FILTRADO ---
  const filteredServicios = servicios
    .filter((s) => s.nombre.toLowerCase().includes(search.toLowerCase()))
    // NUEVO: Ordenamos alfabéticamente siempre
    .sort((a, b) => a.nombre.localeCompare(b.nombre))

  const totalPages = Math.ceil(filteredServicios.length / ITEMS_PER_PAGE) || 1
  const startIndex = (currentPage - 1) * ITEMS_PER_PAGE
  const paginatedServicios = filteredServicios.slice(startIndex, startIndex + ITEMS_PER_PAGE)

  useEffect(() => {
    setCurrentPage(1)
  }, [search])

  // --- HANDLERS ---

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!formData.nombre.trim()) return

    try {
      if (editingId) {
        await window.api.services.update(editingId, formData.nombre)
        toast.success('Servicio actualizado')
      } else {
        await window.api.services.create(formData.nombre)
        toast.success('Servicio creado correctamente')
      }
      fetchServicios()
      closeDialog()
    } catch (error: any) {
      toast.error('Error al guardar: ' + (error.message || 'Desconocido'))
    }
  }

  // --- NUEVA LÓGICA DE TOGGLE ---
  const handleToggleActive = async (id: number) => {
    // 1. Si ya se está procesando este ID, no hacemos nada (evita click spam)
    if (processingIds.has(id)) return

    // 2. Agregamos el ID al Set de procesamiento
    setProcessingIds((prev) => new Set(prev).add(id))

    try {
      await window.api.services.toggle(id)

      // 3. Actualización optimista
      setServicios((prev) =>
        prev.map((s) => (s.id === id ? { ...s, activo: s.activo === 1 ? 0 : 1 } : s))
      )
      toast.success('Estado actualizado')
    } catch (error) {
      toast.error('No se pudo cambiar el estado')
    } finally {
      // 4. Quitamos el ID del Set (liberamos el botón)
      setProcessingIds((prev) => {
        const next = new Set(prev)
        next.delete(id)
        return next
      })
    }
  }

  const handleDelete = async () => {
    if (!deleteId) return
    try {
      await window.api.services.delete(deleteId)
      setServicios((prev) => prev.filter((s) => s.id !== deleteId))
      setDeleteId(null)
      toast.success('Servicio eliminado')

      if (paginatedServicios.length === 1 && currentPage > 1) {
        setCurrentPage((prev) => prev - 1)
      }
    } catch (error) {
      toast.error('Error al eliminar servicio')
    }
  }

  const openEdit = (servicio: Servicio) => {
    setEditingId(servicio.id)
    setFormData({ nombre: servicio.nombre })
    setIsDialogOpen(true)
  }

  const closeDialog = () => {
    setIsDialogOpen(false)
    setEditingId(null)
    setFormData({ nombre: '' })
  }

  return (
    <div className="h-full flex flex-col gap-4 p-6 animate-in fade-in duration-300">
      {/* HEADER */}
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

      {/* BUSCADOR */}
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

      {/* TABLA */}
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
            {loading ? (
              <TableRow>
                <TableCell colSpan={3} className="h-32 text-center text-muted-foreground">
                  <div className="flex items-center justify-center gap-2">
                    <Loader2 className="h-4 w-4 animate-spin" />
                    Cargando servicios...
                  </div>
                </TableCell>
              </TableRow>
            ) : paginatedServicios.length === 0 ? (
              <TableRow>
                <TableCell colSpan={3} className="h-32 text-center">
                  <div className="flex flex-col items-center justify-center text-muted-foreground">
                    <Search className="h-8 w-8 mb-2 opacity-20" />
                    <p>No se encontraron resultados.</p>
                  </div>
                </TableCell>
              </TableRow>
            ) : (
              paginatedServicios.map((servicio) => {
                // Verificamos si este servicio se está procesando
                const isProcessing = processingIds.has(servicio.id)

                return (
                  <TableRow
                    key={servicio.id}
                    className="group border-b transition-colors hover:bg-muted/50"
                  >
                    <TableCell className="font-medium pl-6 py-3">{servicio.nombre}</TableCell>
                    <TableCell className="text-center py-3">
                      <Badge
                        variant="outline"
                        className={cn(
                          'cursor-pointer select-none transition-all border',
                          // Bloqueamos visualmente si está procesando
                          isProcessing && 'opacity-50 cursor-not-allowed',
                          servicio.activo === 1
                            ? 'bg-emerald-50 text-emerald-700 border-emerald-200 hover:bg-emerald-100 hover:border-emerald-300 dark:bg-emerald-950/40 dark:text-emerald-400 dark:border-emerald-800 dark:hover:bg-emerald-900/60'
                            : 'bg-zinc-100 text-zinc-500 border-zinc-200 hover:bg-zinc-200 dark:bg-zinc-900 dark:text-zinc-500 dark:border-zinc-800 dark:hover:bg-zinc-800'
                        )}
                        onClick={() => handleToggleActive(servicio.id)}
                      >
                        {isProcessing ? <Loader2 className="h-3 w-3 animate-spin mr-1" /> : null}
                        {servicio.activo === 1 ? 'Activo' : 'Inactivo'}
                      </Badge>
                    </TableCell>
                    <TableCell className="text-right pr-6 py-3">
                      <div className="hidden sm:flex items-center justify-end gap-1">
                        <Button
                          variant="ghost"
                          size="icon"
                          disabled={isProcessing} // Deshabilitamos acciones mientras procesa
                          className="h-8 w-8 text-muted-foreground hover:text-primary"
                          onClick={() => openEdit(servicio)}
                          title="Editar"
                        >
                          <Pencil className="h-4 w-4" />
                        </Button>
                        <Button
                          variant="ghost"
                          size="icon"
                          disabled={isProcessing}
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
                            <Button variant="ghost" className="h-8 w-8 p-0" disabled={isProcessing}>
                              <MoreHorizontal className="h-4 w-4" />
                            </Button>
                          </DropdownMenuTrigger>
                          <DropdownMenuContent align="end">
                            <DropdownMenuLabel>Acciones</DropdownMenuLabel>
                            <DropdownMenuItem onClick={() => openEdit(servicio)}>
                              <Pencil className="mr-2 h-4 w-4" /> Editar
                            </DropdownMenuItem>
                            <DropdownMenuItem onClick={() => handleToggleActive(servicio.id)}>
                              <Power className="mr-2 h-4 w-4" />
                              {servicio.activo === 1 ? 'Desactivar' : 'Activar'}
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
                )
              })
            )}
          </TableBody>
        </table>
      </div>

      {/* PAGINACIÓN */}
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

      {/* ALERTA BORRADO */}
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
