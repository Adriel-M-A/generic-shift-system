import { useState, useEffect } from 'react'
import {
  Plus,
  Search,
  Pencil,
  Trash2,
  ChevronLeft,
  ChevronRight,
  MoreHorizontal,
  Loader2,
  History,
  CalendarDays
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
import { Sheet, SheetContent, SheetDescription, SheetHeader, SheetTitle } from '@ui/sheet'
import { Badge } from '@ui/badge'
import { ScrollArea } from '@ui/scroll-area'

import { useCustomers } from '../hooks/useCustomers'
import { useShifts } from '../../shift/hooks/useShifts'
import { Customer } from '@shared/types/customer'
import { Shift } from '@shared/types/shift'
import { CustomerDialog } from '../components/CustomerDialog'
import { getStatusStyles, getStatusLabel } from '../../shift/utils'

const ITEMS_PER_PAGE = 15

export default function Customers() {
  const [search, setSearch] = useState('')
  const [currentPage, setCurrentPage] = useState(1)
  const { customers, total, isLoading, createCustomer, updateCustomer, deleteCustomer } =
    useCustomers(currentPage, ITEMS_PER_PAGE, search)

  const { getCustomerHistory, jumpToDate } = useShifts()
  const [historyCustomer, setHistoryCustomer] = useState<Customer | null>(null)
  const [history, setHistory] = useState<Shift[]>([])
  const [loadingHistory, setLoadingHistory] = useState(false)

  const [isDialogOpen, setIsDialogOpen] = useState(false)
  const [editingCustomer, setEditingCustomer] = useState<Customer | undefined>(undefined)
  const [deleteId, setDeleteId] = useState<number | null>(null)

  const totalPages = Math.ceil(total / ITEMS_PER_PAGE) || 1

  useEffect(() => {
    setCurrentPage(1)
  }, [search])

  useEffect(() => {
    if (historyCustomer) {
      loadHistory(historyCustomer.id)
    } else {
      setHistory([])
    }
  }, [historyCustomer])

  const loadHistory = async (id: number) => {
    setLoadingHistory(true)
    try {
      const data = await getCustomerHistory(id)
      setHistory(data)
    } finally {
      setLoadingHistory(false)
    }
  }

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
    if (deleteId !== null) {
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
              <TableHead className="h-12 pl-6 w-37.5">Documento</TableHead>
              <TableHead className="h-12 min-w-50">Nombre Completo</TableHead>
              <TableHead className="h-12 min-w-37.5">Teléfono</TableHead>
              <TableHead className="h-12 min-w-50">Email</TableHead>
              <TableHead className="text-right pr-6 h-12 w-32">Acciones</TableHead>
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
                        onClick={() => setHistoryCustomer(customer)}
                        title="Ver Historial"
                      >
                        <History className="h-4 w-4" />
                      </Button>
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
                        onClick={() => setDeleteId(customer.id)}
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
                          <DropdownMenuItem onClick={() => setHistoryCustomer(customer)}>
                            <History className="mr-2 h-4 w-4" /> Historial
                          </DropdownMenuItem>
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

      <Sheet open={!!historyCustomer} onOpenChange={() => setHistoryCustomer(null)}>
        <SheetContent className="sm:max-w-md border-l shadow-2xl p-0 flex flex-col">
          <SheetHeader className="p-6 border-b shrink-0 bg-muted/20">
            <div className="flex items-center gap-3">
              <div className="h-10 w-10 rounded-full bg-primary/10 flex items-center justify-center text-primary">
                <History className="h-5 w-5" />
              </div>
              <div className="text-left">
                <SheetTitle className="text-xl">Historial de Turnos</SheetTitle>
                <SheetDescription className="text-sm font-medium text-foreground/80">
                  {historyCustomer?.nombre} {historyCustomer?.apellido}
                </SheetDescription>
              </div>
            </div>
          </SheetHeader>

          <ScrollArea className="flex-1">
            <div className="p-6 space-y-6">
              {loadingHistory ? (
                <div className="flex items-center justify-center py-10">
                  <Loader2 className="h-6 w-6 animate-spin text-muted-foreground" />
                </div>
              ) : history.length === 0 ? (
                <div className="text-center py-10 text-muted-foreground text-sm">
                  Este cliente aún no tiene turnos registrados.
                </div>
              ) : (
                history.map((h) => {
                  const styles = getStatusStyles(h.estado)
                  return (
                    <div key={h.id} className="relative pl-8 pb-2">
                      <div className="absolute left-0 top-0 bottom-0 w-px bg-border ml-3" />
                      <div
                        className={`absolute left-0 top-1.5 h-6 w-6 rounded-full border-4 border-background shadow-sm ml-0 ${styles.accent.replace('w-1', 'bg-current')}`}
                      />

                      <div className="space-y-2">
                        <div className="flex items-center justify-between">
                          <span className="text-xs font-bold text-muted-foreground uppercase">
                            {h.fecha} - {h.hora}hs
                          </span>
                          <Badge className={`text-[10px] shadow-none ${styles.badge}`}>
                            {getStatusLabel(h.estado)}
                          </Badge>
                        </div>
                        <div className="p-3 rounded-lg border bg-card/50 shadow-none hover:shadow-sm transition-shadow">
                          <p className="font-bold text-sm leading-tight">{h.servicio}</p>
                          <div className="flex items-center gap-2 mt-2">
                            <Button
                              variant="link"
                              className="h-auto p-0 text-xs text-primary gap-1"
                              onClick={() => {
                                jumpToDate(h.fecha)
                                setHistoryCustomer(null)
                              }}
                            >
                              <CalendarDays className="h-3 w-3" /> Ver en agenda
                            </Button>
                          </div>
                        </div>
                      </div>
                    </div>
                  )
                })
              )}
            </div>
          </ScrollArea>
        </SheetContent>
      </Sheet>

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

      <AlertDialog
        open={!!deleteId || deleteId === 0}
        onOpenChange={(open) => !open && setDeleteId(null)}
      >
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
