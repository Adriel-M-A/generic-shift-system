import { useEffect, useState } from 'react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@ui/card'
import { Button } from '@ui/button'
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@ui/table'
import { Checkbox } from '@ui/checkbox'
import { Label } from '@ui/label'
import { Badge } from '@ui/badge'
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger
} from '@ui/alert-dialog'
import {
  ShieldCheck,
  AlertTriangle,
  Save,
  RotateCcw,
  Trash2,
  HardDrive,
  Download,
  Upload,
  FolderOpen,
  Clock,
  MoreHorizontal,
  Loader2
} from 'lucide-react'
import { toast } from 'sonner'
import { useUI } from '@core/context/UIContext'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger
} from '@ui/dropdown-menu'

export default function Backups() {
  const [backups, setBackups] = useState<any[]>([])
  const [loading, setLoading] = useState(false)
  const [backupPath, setBackupPath] = useState('')
  const [autoBackup, setAutoBackup] = useState(false)

  const { setBlocking } = useUI()

  const fetchBackups = async () => {
    const res = await window.electron.ipcRenderer.invoke('backup:list')
    if (res.success) {
      setBackups(res.backups)
      setBackupPath(res.path)
    }
  }

  const fetchConfig = async () => {
    const config = await window.electron.ipcRenderer.invoke('backup:get-config')
    setAutoBackup(config.enabled)
  }

  useEffect(() => {
    fetchBackups()
    fetchConfig()
  }, [])

  const handleToggleAuto = async (checked: boolean) => {
    setAutoBackup(checked)
    await window.electron.ipcRenderer.invoke('backup:toggle-auto', checked)
    if (checked) toast.success('Respaldo automático activado')
    else toast.info('Respaldo automático desactivado')
  }

  const handleCreate = async () => {
    setLoading(true)
    setBlocking(true, 'Creando copia de seguridad...')
    try {
      await new Promise((r) => setTimeout(r, 100))
      const res = await window.electron.ipcRenderer.invoke('backup:create', 'manual')
      if (res.success) {
        toast.success('Respaldo creado correctamente')
        fetchBackups()
      } else {
        toast.error('Error al crear respaldo')
      }
    } catch (e) {
      toast.error('Error de conexión')
    } finally {
      setLoading(false)
      setBlocking(false)
    }
  }

  const handleRestore = async (filename: string) => {
    setBlocking(true, 'Restaurando sistema. Espere...')
    const res = await window.electron.ipcRenderer.invoke('backup:restore', filename)
    if (!res.success) {
      setBlocking(false)
      toast.error(res.message || 'Error al restaurar')
    }
  }

  const handleDelete = async (filename: string) => {
    setLoading(true)
    await window.electron.ipcRenderer.invoke('backup:delete', filename)
    toast.success('Archivo eliminado')
    fetchBackups()
    setLoading(false)
  }

  const handleExport = async (filename: string) => {
    const res = await window.electron.ipcRenderer.invoke('backup:export', filename)
    if (res.success) {
      toast.success(`Exportado correctamente`)
    } else if (res.message !== 'Cancelado') {
      toast.error('Error al exportar')
    }
  }

  const handleImport = async () => {
    setBlocking(true, 'Importando archivo...')
    try {
      const res = await window.electron.ipcRenderer.invoke('backup:import')
      if (res.success) {
        toast.success('Respaldo importado correctamente')
        fetchBackups()
      } else if (res.message !== 'Cancelado') {
        toast.error('Error al importar')
      }
    } finally {
      setBlocking(false)
    }
  }

  const lastBackup = backups.length > 0 ? new Date(backups[0].createdAt) : null
  const isHealthy = lastBackup
    ? new Date().getTime() - lastBackup.getTime() < 7 * 24 * 60 * 60 * 1000
    : false

  return (
    <div className="space-y-4 animate-in fade-in duration-500">
      {/* HEADER */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div>
          <h2 className="text-2xl font-bold">Copias de Seguridad</h2>
          <p className="text-xs text-muted-foreground">Gestiona tus respaldos</p>
        </div>
        <div className="flex gap-2">
          <Button variant="outline" size="sm" onClick={handleImport} disabled={loading}>
            <Upload className="h-4 w-4 mr-1" />
            Importar
          </Button>
          <Button size="sm" onClick={handleCreate} disabled={loading}>
            <Save className="h-4 w-4 mr-1" />
            Crear respaldo
          </Button>
        </div>
      </div>

      {/* INFO CARDS */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
        {/* Estado */}
        <Card className="border-0 shadow-sm">
          <CardHeader className="pb-2 pt-3">
            <div className="flex items-center gap-2">
              {isHealthy ? (
                <ShieldCheck className="h-4 w-4 text-emerald-600" />
              ) : (
                <AlertTriangle className="h-4 w-4 text-amber-600" />
              )}
              <CardTitle className="text-sm">{isHealthy ? 'Protegido' : 'Revisar'}</CardTitle>
            </div>
          </CardHeader>
          <CardContent className="pb-3">
            <p className="text-xs text-muted-foreground">
              {backups.length === 0
                ? 'Sin respaldos'
                : `${backups.length} copia${backups.length !== 1 ? 's' : ''}`}
            </p>
          </CardContent>
        </Card>

        {/* Último respaldo */}
        <Card className="border-0 shadow-sm">
          <CardHeader className="pb-2 pt-3">
            <div className="flex items-center gap-2">
              <Clock className="h-4 w-4 text-blue-600" />
              <CardTitle className="text-sm">Última copia</CardTitle>
            </div>
          </CardHeader>
          <CardContent className="pb-3">
            <p className="text-xs text-muted-foreground">
              {lastBackup ? lastBackup.toLocaleDateString() : 'Nunca'}
            </p>
          </CardContent>
        </Card>

        {/* Configuración */}
        <Card className="border-0 shadow-sm">
          <CardHeader className="pb-2 pt-3">
            <CardTitle className="text-sm">Automático</CardTitle>
          </CardHeader>
          <CardContent className="pb-3">
            <div className="flex items-center gap-2">
              <Checkbox
                id="auto-backup"
                checked={autoBackup}
                onCheckedChange={(c) => handleToggleAuto(c as boolean)}
              />
              <Label htmlFor="auto-backup" className="text-xs cursor-pointer text-muted-foreground">
                Activado
              </Label>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* TABLA */}
      <Card className="border-0 shadow-sm">
        <CardHeader className="pb-2 pt-3">
          <div className="flex items-center justify-between">
            <CardTitle className="text-sm">Historial</CardTitle>
            {backups.length > 0 && (
              <Badge variant="secondary" className="text-xs">
                {backups.length}
              </Badge>
            )}
          </div>
        </CardHeader>
        <CardContent className="p-0">
          <div className="border rounded-b-md overflow-auto">
            <table className="w-full text-xs">
              <TableHeader className="bg-muted/30">
                <TableRow className="hover:bg-transparent border-none">
                  <TableHead className="h-9 pl-4 font-medium">Archivo</TableHead>
                  <TableHead className="h-9 font-medium">Fecha</TableHead>
                  <TableHead className="h-9 font-medium">Tamaño</TableHead>
                  <TableHead className="text-right pr-4 h-9 font-medium w-20">Acciones</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {loading && backups.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={4} className="h-20 text-center">
                      <Loader2 className="h-3 w-3 animate-spin mx-auto" />
                    </TableCell>
                  </TableRow>
                ) : backups.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={4} className="h-20 text-center text-muted-foreground">
                      Sin respaldos
                    </TableCell>
                  </TableRow>
                ) : (
                  backups.map((backup) => (
                    <TableRow
                      key={backup.name}
                      className="border-b hover:bg-muted/30 transition-colors"
                    >
                      <TableCell className="pl-4 py-2 font-mono">
                        {backup.name.substring(0, 30)}...
                      </TableCell>
                      <TableCell className="py-2 text-muted-foreground">
                        {new Date(backup.createdAt).toLocaleDateString()}
                      </TableCell>
                      <TableCell className="py-2 text-muted-foreground">
                        {(backup.size / 1024 / 1024).toFixed(2)} MB
                      </TableCell>
                      <TableCell className="text-right pr-4 py-2">
                        {/* Desktop */}
                        <div className="hidden sm:flex items-center justify-end gap-1">
                          <Button
                            variant="ghost"
                            size="sm"
                            className="h-7 w-7 p-0"
                            onClick={() => handleExport(backup.name)}
                            disabled={loading}
                            title="Exportar"
                          >
                            <Download className="h-3 w-3" />
                          </Button>

                          <AlertDialog>
                            <AlertDialogTrigger asChild>
                              <Button
                                variant="ghost"
                                size="sm"
                                className="h-7 w-7 p-0"
                                disabled={loading}
                                title="Restaurar"
                              >
                                <RotateCcw className="h-3 w-3" />
                              </Button>
                            </AlertDialogTrigger>
                            <AlertDialogContent className="sm:max-w-sm">
                              <AlertDialogHeader>
                                <AlertDialogTitle className="text-sm">Restaurar</AlertDialogTitle>
                                <AlertDialogDescription className="text-xs">
                                  Volver al {new Date(backup.createdAt).toLocaleString()}
                                  <br />
                                  ⚠️ Los datos posteriores se eliminarán.
                                </AlertDialogDescription>
                              </AlertDialogHeader>
                              <AlertDialogFooter className="gap-2 sm:gap-0">
                                <AlertDialogCancel className="text-xs h-8">
                                  Cancelar
                                </AlertDialogCancel>
                                <AlertDialogAction
                                  className="bg-amber-600 hover:bg-amber-700 text-white text-xs h-8"
                                  onClick={() => handleRestore(backup.name)}
                                >
                                  Restaurar
                                </AlertDialogAction>
                              </AlertDialogFooter>
                            </AlertDialogContent>
                          </AlertDialog>

                          <Button
                            variant="ghost"
                            size="sm"
                            className="h-7 w-7 p-0"
                            onClick={() => handleDelete(backup.name)}
                            disabled={loading}
                            title="Eliminar"
                          >
                            <Trash2 className="h-3 w-3" />
                          </Button>
                        </div>

                        {/* Mobile */}
                        <div className="sm:hidden">
                          <DropdownMenu>
                            <DropdownMenuTrigger asChild>
                              <Button variant="ghost" size="sm" className="h-7 w-7 p-0">
                                <MoreHorizontal className="h-3 w-3" />
                              </Button>
                            </DropdownMenuTrigger>
                            <DropdownMenuContent align="end" className="w-32">
                              <DropdownMenuLabel className="text-xs">Acciones</DropdownMenuLabel>
                              <DropdownMenuItem
                                onClick={() => handleExport(backup.name)}
                                className="text-xs"
                              >
                                <Download className="h-3 w-3 mr-2" /> Exportar
                              </DropdownMenuItem>
                              <DropdownMenuSeparator />
                              <DropdownMenuItem
                                onClick={() => handleRestore(backup.name)}
                                className="text-xs"
                              >
                                <RotateCcw className="h-3 w-3 mr-2" /> Restaurar
                              </DropdownMenuItem>
                              <DropdownMenuSeparator />
                              <DropdownMenuItem
                                onClick={() => handleDelete(backup.name)}
                                className="text-destructive text-xs focus:text-destructive"
                              >
                                <Trash2 className="h-3 w-3 mr-2" /> Eliminar
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
        </CardContent>
      </Card>
    </div>
  )
}
