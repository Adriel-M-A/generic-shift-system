import { ipcMain, dialog, BrowserWindow, app } from 'electron'
import { join } from 'path'
import { existsSync } from 'fs'
import { copyFileSync as fsCopy, statSync } from 'fs'

export function setupBackupSystem(mainWindow: BrowserWindow) {
  const userDataPath = app.getPath('userData')
  const dbPath = join(userDataPath, 'app.db')

  ipcMain.handle('backup:create', async () => {
    try {
      const { canceled, filePath } = await dialog.showSaveDialog(mainWindow, {
        title: 'Guardar Copia de Seguridad',
        defaultPath: `backup-${new Date().toISOString().split('T')[0]}.db`,
        filters: [{ name: 'Database', extensions: ['db'] }]
      })

      if (canceled || !filePath) return { success: false }

      if (existsSync(dbPath)) {
        fsCopy(dbPath, filePath)
        return { success: true, path: filePath }
      }
      return { success: false, error: 'No se encontró la base de datos' }
    } catch (error: any) {
      console.error(error)
      return { success: false, error: error.message }
    }
  })

  ipcMain.handle('backup:restore', async () => {
    try {
      const { canceled, filePaths } = await dialog.showOpenDialog(mainWindow, {
        title: 'Seleccionar Copia de Seguridad',
        filters: [{ name: 'Database', extensions: ['db'] }],
        properties: ['openFile']
      })

      if (canceled || filePaths.length === 0) return { success: false }

      const backupPath = filePaths[0]

      // Validación simple de tamaño
      const stats = statSync(backupPath)
      if (stats.size === 0) return { success: false, error: 'El archivo está vacío' }

      // Reemplazamos la DB actual (requiere reinicio idealmente)
      fsCopy(backupPath, dbPath)

      // Forzamos recarga de la ventana para tomar los nuevos datos
      mainWindow.reload()

      return { success: true }
    } catch (error: any) {
      console.error(error)
      return { success: false, error: error.message }
    }
  })
}
