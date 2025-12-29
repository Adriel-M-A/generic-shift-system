import { useState, useEffect } from 'react'
import { Plus, Search, Trash2, Loader2, ChevronLeft, ChevronRight } from 'lucide-react'
import { Button } from '@ui/button'
import { Input } from '@ui/input'
import { Switch } from '@ui/switch'
import { TableHeader, TableBody, TableHead, TableRow, TableCell } from '@ui/table'
import { useServices } from '../hooks/useServices'

const LIMIT = 10

export default function Servicios() {
  const [search, setSearch] = useState('')
  const [page, setPage] = useState(1)
  const [newServiceName, setNewServiceName] = useState('')

  const { services, total, isLoading, createService, toggleService, deleteService } = useServices(
    page,
    LIMIT,
    search
  )

  const totalPages = Math.ceil(total / LIMIT) || 1

  useEffect(() => {
    setPage(1)
  }, [search])

  const handleCreate = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!newServiceName.trim()) return
    const success = await createService(newServiceName)
    if (success) setNewServiceName('')
  }

  return (
    <div className="p-6 flex flex-col gap-6 h-full">
      <header>
        <h2 className="text-3xl font-bold tracking-tight">Servicios</h2>
        <p className="text-muted-foreground">Configura los servicios que ofreces.</p>
      </header>

      <form onSubmit={handleCreate} className="flex gap-2 max-w-md">
        <Input
          placeholder="Nombre del nuevo servicio..."
          value={newServiceName}
          onChange={(e) => setNewServiceName(e.target.value)}
        />
        <Button type="submit" disabled={!newServiceName.trim()}>
          <Plus className="w-4 h-4 mr-2" /> Agregar
        </Button>
      </form>

      <div className="relative w-full max-w-sm">
        <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
        <Input
          placeholder="Buscar servicios..."
          className="pl-9"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
        />
      </div>

      <div className="flex-1 border rounded-md bg-card overflow-auto">
        <table className="w-full text-sm">
          <TableHeader className="bg-muted/50 sticky top-0 z-10">
            <TableRow>
              <TableHead className="pl-6">Nombre</TableHead>
              <TableHead className="w-[100px]">Estado</TableHead>
              <TableHead className="text-right pr-6 w-[100px]">Acciones</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {isLoading ? (
              <TableRow>
                <TableCell colSpan={3} className="h-32 text-center">
                  <Loader2 className="animate-spin mx-auto" />
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
                <TableRow key={s.id}>
                  <TableCell className="pl-6 font-medium">{s.nombre}</TableCell>
                  <TableCell>
                    <Switch checked={s.activo === 1} onCheckedChange={() => toggleService(s.id)} />
                  </TableCell>
                  <TableCell className="text-right pr-6">
                    <Button
                      variant="ghost"
                      size="icon"
                      onClick={() => deleteService(s.id)}
                      className="text-destructive hover:text-destructive"
                    >
                      <Trash2 className="w-4 h-4" />
                    </Button>
                  </TableCell>
                </TableRow>
              ))
            )}
          </TableBody>
        </table>
      </div>

      <div className="flex items-center justify-between">
        <p className="text-sm text-muted-foreground">
          Mostrando {services.length} de {total} servicios
        </p>
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
    </div>
  )
}
