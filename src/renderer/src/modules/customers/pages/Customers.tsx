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
  const [search, setSearch] = useState('')
  const [currentPage, setCurrentPage] = useState(1)
  const { customers, total, isLoading, createCustomer, updateCustomer, deleteCustomer } =
    useCustomers(currentPage, ITEMS_PER_PAGE, search)

  const [isDialogOpen, setIsDialogOpen] = useState(false)
  const [editingCustomer, setEditingCustomer] = useState<Customer | undefined>(undefined)
  const [deleteId, setDeleteId] = useState<string | null>(null)

  const totalPages = Math.ceil(total / ITEMS_PER_PAGE) || 1

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
    }
  }

  return (
    <div className="h-full flex flex-col gap-4 p-6 animate-in fade-in duration-300">
      <div className="flex-none flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-3xl font-bold tracking-tight text-foreground">Clientes</h2>
          <p className="text-muted-foreground mt-1">Gestiona la base de datos de clientes.</p>
        </div>
      </div>

      <div className="flex-none flex flex-row items-center justify-between gap-4">
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
        <Button onClick={handleCreate} className="gap-2 shadow-sm">
          <Plus className="h-4 w-4" />
          <span className="hidden sm:inline">Nuevo Cliente</span>
        </Button>
      </div>

      <div className="flex-1 min-h-0 rounded-md border bg-card overflow-auto">
        <table className="w-full text-sm text-left">
          <TableHeader className="sticky top-0 z-20 bg-card">
            <TableRow className="hover:bg-transparent border-none">
              <TableHead className="h-12 pl-6 w-[150px]">Documento</TableHead>
              <TableHead className="h-12 min-w-[200px]">Nombre Completo</TableHead>
              <TableHead className="h-12 min-w-[150px]">Teléfono</TableHead>
              <TableHead className="h-12 min-w-[200px]">Email</TableHead>
              <TableHead className="text-right pr-6 h-12 w-[100px]">Acciones</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {isLoading ? (
              <TableRow>
                <TableCell colSpan={5} className="h-32 text-center">
                  <div className="flex items-center justify-center gap-2 text-muted-foreground">
                    <Loader2 className="h-5 w-5 animate-spin opacity-50" />
                    Cargando clientes...
                  </div>
                </TableCell>
              </TableRow>
            ) : customers.length === 0 ? (
              <TableRow>
                <TableCell colSpan={5} className="h-32 text-center">
                  <div className="flex flex-col items-center justify-center text-muted-foreground">
                    <Search className="h-8 w-8 mb-2 opacity-20" />
                    <p>No se encontraron resultados.</p>
                  </div>
                </TableCell>
              </TableRow>
            ) : (
              customers.map((customer) => (
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
                    <div className="hidden sm:flex items-center justify-end gap-1">
                      <Button
                        variant="ghost"
                        size="icon"
                        className="h-8 w-8 text-muted-foreground hover:text-primary"
                        onClick={() => handleEdit(customer)}
                      >
                        <Pencil className="h-4 w-4" />
                      </Button>
                      <Button
                        variant="ghost"
                        size="icon"
                        className="h-8 w-8 text-muted-foreground hover:text-destructive"
                        onClick={() => setDeleteId(customer.id.toString())}
                      >
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </div>

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
                            onClick={() => setDeleteId(customer.id.toString())}
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

      <div className="flex-none flex items-center justify-between pt-2">
        <p className="text-sm text-muted-foreground">Total: {total} clientes</p>
        <div className="flex items-center gap-2">
          <Button
            variant="outline"
            size="sm"
            onClick={() => setCurrentPage((p) => Math.max(1, p - 1))}
            disabled={currentPage === 1}
          >
            <ChevronLeft className="h-4 w-4" />
          </Button>
          <span className="text-sm font-medium">
            {currentPage} / {totalPages}
          </span>
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

      <AlertDialog open={!!deleteId} onOpenChange={(open) => !open && setDeleteId(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>¿Eliminar cliente?</AlertDialogTitle>
            <AlertDialogDescription>
              Esta acción eliminará al cliente permanentemente.
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
