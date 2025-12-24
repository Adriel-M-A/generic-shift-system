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
  Clock
} from 'lucide-react'
import { toast } from 'sonner'
import { useUI } from '@core/context/UIContext'

export default function Backups() {
  const [backups, setBackups] = useState<any[]>([])
  const [loading, setLoading] = useState(false)
  const [backupPath, setBackupPath] = useState('')
  const [autoBackup, setAutoBackup] = useState(false)

  const { setBlocking } = useUI()

  // --- LÓGICA (Igual que antes) ---
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

  // Cálculos de estado
  const lastBackup = backups.length > 0 ? new Date(backups[0].createdAt) : null
  const isHealthy = lastBackup
    ? new Date().getTime() - lastBackup.getTime() < 7 * 24 * 60 * 60 * 1000
    : false

  return (
    <div className="space-y-6 animate-in fade-in duration-500 pb-10">
      {/* 1. HEADER SECCIÓN: Título a la izq, Acciones principales a la derecha */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b pb-4">
        <div>
          <h2 className="text-2xl font-bold tracking-tight">Copias de Seguridad</h2>
          <p className="text-muted-foreground">
            Gestiona la integridad de tus datos y puntos de restauración.
          </p>
        </div>
        <div className="flex items-center gap-2">
          <Button variant="outline" onClick={handleImport} disabled={loading}>
            <Upload className="mr-2 h-4 w-4" />
            Importar Externo
          </Button>
          <Button onClick={handleCreate} disabled={loading}>
            <Save className="mr-2 h-4 w-4" />
            Crear Nuevo Respaldo
          </Button>
        </div>
      </div>

      {/* 2. GRID DE INFORMACIÓN: Separamos Salud vs Configuración */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {/* CARD A: Estado de Salud (Ocupa 2 espacios) */}
        <Card
          className={`md:col-span-2 border-l-4 ${isHealthy ? 'border-l-green-500' : 'border-l-orange-500'}`}
        >
          <CardHeader className="pb-2">
            <CardTitle className="text-lg flex items-center gap-2">
              {isHealthy ? (
                <ShieldCheck className="text-green-600 h-5 w-5" />
              ) : (
                <AlertTriangle className="text-orange-600 h-5 w-5" />
              )}
              Estado del Sistema: {isHealthy ? 'Saludable' : 'Atención Requerida'}
            </CardTitle>
            <CardDescription>
              {backups.length === 0
                ? 'No se han encontrado copias de seguridad recientes.'
                : `Tu última copia de seguridad fue realizada el ${lastBackup?.toLocaleDateString()} a las ${lastBackup?.toLocaleTimeString()}.`}
            </CardDescription>
          </CardHeader>
          <CardContent>
            {isHealthy ? (
              <Badge variant="outline" className="bg-green-50 text-green-700 border-green-200">
                Protegido
              </Badge>
            ) : (
              <Badge variant="outline" className="bg-orange-50 text-orange-700 border-orange-200">
                Riesgo de pérdida de datos
              </Badge>
            )}
          </CardContent>
        </Card>

        {/* CARD B: Ajustes Rápidos */}
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-base">Configuración</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            {/* Toggle Auto Backup */}
            <div className="flex items-start space-x-3 p-3 rounded-md border bg-muted/30">
              <Checkbox
                id="auto-backup"
                checked={autoBackup}
                onCheckedChange={(c) => handleToggleAuto(c as boolean)}
              />
              <div className="grid gap-1.5 leading-none">
                <Label
                  htmlFor="auto-backup"
                  className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70 cursor-pointer"
                >
                  Backup Automático
                </Label>
                <p className="text-xs text-muted-foreground">Al cerrar la aplicación</p>
              </div>
            </div>

            {/* Ruta (Info visual) */}
            <div className="text-xs text-muted-foreground break-all flex gap-2 items-start">
              <FolderOpen className="h-3 w-3 mt-0.5 shrink-0" />
              <span>{backupPath || 'Cargando ruta...'}</span>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* 3. TABLA DE HISTORIAL */}
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <div>
              <CardTitle className="flex items-center gap-2 text-lg">
                <HardDrive className="h-5 w-5 text-gray-500" /> Historial Local
              </CardTitle>
              <CardDescription>Se mantienen las últimas 10 copias automáticamente.</CardDescription>
            </div>
            <Badge variant="secondary" className="hidden sm:flex">
              {backups.length} Archivos
            </Badge>
          </div>
        </CardHeader>
        <CardContent className="p-0">
          <Table>
            <TableHeader>
              <TableRow className="bg-muted/50 hover:bg-muted/50">
                <TableHead className="pl-6">Nombre de Archivo</TableHead>
                <TableHead>Fecha de Creación</TableHead>
                <TableHead>Tamaño</TableHead>
                <TableHead className="text-right pr-6">Acciones</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {backups.length === 0 && (
                <TableRow>
                  <TableCell colSpan={4} className="text-center py-10 text-muted-foreground">
                    <div className="flex flex-col items-center gap-2">
                      <Clock className="h-8 w-8 opacity-20" />
                      <p>No hay copias de seguridad disponibles</p>
                    </div>
                  </TableCell>
                </TableRow>
              )}
              {backups.map((backup) => (
                <TableRow key={backup.name}>
                  <TableCell className="pl-6 font-medium font-mono text-xs text-muted-foreground">
                    {backup.name}
                  </TableCell>
                  <TableCell className="text-sm">
                    {new Date(backup.createdAt).toLocaleString()}
                  </TableCell>
                  <TableCell className="text-sm">
                    {(backup.size / 1024 / 1024).toFixed(2)} MB
                  </TableCell>
                  <TableCell className="text-right pr-6">
                    <div className="flex justify-end gap-1">
                      <Button
                        variant="ghost"
                        size="sm"
                        className="h-8 w-8 p-0"
                        onClick={() => handleExport(backup.name)}
                        title="Exportar a USB"
                        disabled={loading}
                      >
                        <Download className="h-4 w-4 text-blue-500" />
                      </Button>

                      <AlertDialog>
                        <AlertDialogTrigger asChild>
                          <Button
                            variant="ghost"
                            size="sm"
                            className="h-8 w-8 p-0 hover:bg-orange-100 dark:hover:bg-orange-900/20"
                            disabled={loading}
                            title="Restaurar este punto"
                          >
                            <RotateCcw className="h-4 w-4 text-orange-600" />
                          </Button>
                        </AlertDialogTrigger>
                        <AlertDialogContent>
                          <AlertDialogHeader>
                            <AlertDialogTitle>Restauración del Sistema</AlertDialogTitle>
                            <AlertDialogDescription>
                              Vas a volver al estado del:{' '}
                              <b>{new Date(backup.createdAt).toLocaleString()}</b>
                              <br />
                              <br />
                              ⚠️ <b>Advertencia:</b> Todos los datos creados después de esta fecha
                              se eliminarán permanentemente. La aplicación se reiniciará
                              automáticamente.
                            </AlertDialogDescription>
                          </AlertDialogHeader>
                          <AlertDialogFooter>
                            <AlertDialogCancel>Cancelar</AlertDialogCancel>
                            <AlertDialogAction
                              className="bg-orange-600 hover:bg-orange-700 text-white"
                              onClick={() => handleRestore(backup.name)}
                            >
                              Confirmar Restauración
                            </AlertDialogAction>
                          </AlertDialogFooter>
                        </AlertDialogContent>
                      </AlertDialog>

                      <Button
                        variant="ghost"
                        size="sm"
                        className="h-8 w-8 p-0 hover:bg-red-100 dark:hover:bg-red-900/20"
                        onClick={() => handleDelete(backup.name)}
                        disabled={loading}
                        title="Eliminar archivo"
                      >
                        <Trash2 className="h-4 w-4 text-red-500" />
                      </Button>
                    </div>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </CardContent>
      </Card>
    </div>
  )
}
