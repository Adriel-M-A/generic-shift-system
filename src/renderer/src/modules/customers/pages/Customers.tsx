import { useState, useEffect } from 'react'
import {
  Plus,
  Search,
  Pencil,
  Trash2,
  ChevronLeft,
  ChevronRight,
  MoreHorizontal,
  Loader2
} from 'lucide-react'
import { toast } from 'sonner'

import { Button } from '@ui/button'
import { Input } from '@ui/input'
import { TableHeader, TableBody, TableHead, TableRow, TableCell } from '@ui/table'
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

import { useCustomers } from '../hooks/useCustomers'
import { Customer } from '../types'
import { CustomerDialog } from '../components/CustomerDialog'

const ITEMS_PER_PAGE = 15

export default function Customers() {
  const { customers, isLoading, createCustomer, updateCustomer, deleteCustomer } = useCustomers()
  const [search, setSearch] = useState('')
  const [currentPage, setCurrentPage] = useState(1)
  const [isDialogOpen, setIsDialogOpen] = useState(false)
  const [editingCustomer, setEditingCustomer] = useState<Customer | undefined>(undefined)
  const [deleteId, setDeleteId] = useState<string | null>(null)

  const filteredCustomers = customers
    .filter(
      (c) =>
        c.nombre.toLowerCase().includes(search.toLowerCase()) ||
        c.apellido.toLowerCase().includes(search.toLowerCase()) ||
        c.documento.includes(search)
    )
    .sort((a, b) => a.nombre.localeCompare(b.nombre))

  const totalPages = Math.ceil(filteredCustomers.length / ITEMS_PER_PAGE) || 1
  const startIndex = (currentPage - 1) * ITEMS_PER_PAGE
  const paginatedCustomers = filteredCustomers.slice(startIndex, startIndex + ITEMS_PER_PAGE)

  useEffect(() => {
    setCurrentPage(1)
  }, [search])

  const handleEdit = (customer: Customer) => {
    setEditingCustomer(customer)
    setIsDialogOpen(true)
  }

  const handleCreate = () => {
    setEditingCustomer(undefined)
    setIsDialogOpen(true)
  }

  const closeDialog = () => {
    setIsDialogOpen(false)
    setEditingCustomer(undefined)
  }

  const handleDeleteConfirm = async () => {
    if (deleteId) {
      await deleteCustomer(deleteId)
      setDeleteId(null)

      if (paginatedCustomers.length === 1 && currentPage > 1) {
        setCurrentPage((prev) => prev - 1)
      }
    }
  }

  return (
    <div className="h-full flex flex-col gap-4 p-6 animate-in fade-in duration-300">
      {/* HEADER */}
      <div className="flex-none flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-3xl font-bold tracking-tight text-foreground">Clientes</h2>
          <p className="text-muted-foreground mt-1">Gestiona la base de datos de clientes.</p>
        </div>

        <Button onClick={handleCreate} className="gap-2 shadow-sm w-full sm:w-auto">
          <Plus className="h-4 w-4" />
          Nuevo Cliente
        </Button>
      </div>

      {/* BUSCADOR */}
      <div className="flex-none">
        <div className="relative w-full max-w-sm">
          <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
          <Input
            type="search"
            placeholder="Buscar por nombre, documento..."
            className="pl-9 h-9 bg-background"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />
        </div>
      </div>

      {/* TABLA */}
      <div className="flex-1 min-h-0 rounded-md border bg-card overflow-auto">
        <table className="w-full caption-bottom text-sm text-left">
          <TableHeader className="sticky top-0 z-20 bg-card">
            <TableRow className="hover:bg-transparent border-none">
              <TableHead className="h-12 pl-6 w-[150px]">Documento</TableHead>
              <TableHead className="h-12 min-w-[200px]">Nombre Completo</TableHead>
              <TableHead className="h-12 min-w-[150px]">Teléfono</TableHead>
              <TableHead className="h-12 min-w-[200px]">Email</TableHead>
              <TableHead className="text-right pr-6 h-12 w-[120px]">Acciones</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {isLoading ? (
              <TableRow>
                <TableCell colSpan={5} className="h-32 text-center text-muted-foreground">
                  <div className="flex items-center justify-center gap-2">
                    <Loader2 className="h-4 w-4 animate-spin" />
                    Cargando clientes...
                  </div>
                </TableCell>
              </TableRow>
            ) : paginatedCustomers.length === 0 ? (
              <TableRow>
                <TableCell colSpan={5} className="h-32 text-center">
                  <div className="flex flex-col items-center justify-center text-muted-foreground">
                    <Search className="h-8 w-8 mb-2 opacity-20" />
                    <p>No se encontraron resultados.</p>
                  </div>
                </TableCell>
              </TableRow>
            ) : (
              paginatedCustomers.map((customer) => (
                <TableRow
                  key={customer.id}
                  className="group border-b transition-colors hover:bg-muted/50"
                >
                  <TableCell className="pl-6 py-3 font-medium">{customer.documento}</TableCell>
                  <TableCell className="py-3">
                    {customer.nombre} {customer.apellido}
                  </TableCell>
                  <TableCell className="py-3 text-muted-foreground">
                    {customer.telefono || '-'}
                  </TableCell>
                  <TableCell className="py-3 text-muted-foreground">
                    {customer.email || '-'}
                  </TableCell>
                  <TableCell className="text-right pr-6 py-3">
                    {/* Desktop */}
                    <div className="hidden sm:flex items-center justify-end gap-1">
                      <Button
                        variant="ghost"
                        size="icon"
                        className="h-8 w-8 text-muted-foreground hover:text-primary"
                        onClick={() => handleEdit(customer)}
                        title="Editar"
                      >
                        <Pencil className="h-4 w-4" />
                      </Button>
                      <Button
                        variant="ghost"
                        size="icon"
                        className="h-8 w-8 text-muted-foreground hover:text-destructive"
                        onClick={() => setDeleteId(customer.id)}
                        title="Eliminar"
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
                          <DropdownMenuItem onClick={() => handleEdit(customer)}>
                            <Pencil className="mr-2 h-4 w-4" /> Editar
                          </DropdownMenuItem>
                          <DropdownMenuSeparator />
                          <DropdownMenuItem
                            className="text-destructive focus:text-destructive"
                            onClick={() => setDeleteId(customer.id)}
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

      {/* PAGINACIÓN */}
      <div className="flex-none">
        {filteredCustomers.length > 0 && (
          <div className="flex items-center justify-between space-x-2 pt-2">
            <div className="text-sm text-muted-foreground">
              {startIndex + 1}-{Math.min(startIndex + ITEMS_PER_PAGE, filteredCustomers.length)} de{' '}
              {filteredCustomers.length}
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

      {/* DIÁLOGO FORMULARIO */}
      <CustomerDialog
        open={isDialogOpen}
        onOpenChange={(open) => !open && closeDialog()}
        customer={editingCustomer}
        onSubmit={async (data) => {
          let success = false
          if (editingCustomer) {
            success = await updateCustomer(editingCustomer.id, data)
          } else {
            success = await createCustomer(data)
          }
          if (success) closeDialog()
          return success
        }}
      />

      {/* ALERTA BORRADO */}
      <AlertDialog open={!!deleteId} onOpenChange={(open) => !open && setDeleteId(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>¿Eliminar cliente?</AlertDialogTitle>
            <AlertDialogDescription>
              Esta acción eliminará al cliente y todos sus datos asociados permanentemente.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancelar</AlertDialogCancel>
            <AlertDialogAction
              onClick={handleDeleteConfirm}
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
