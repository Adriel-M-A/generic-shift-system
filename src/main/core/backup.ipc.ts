import { ipcMain, app, dialog } from 'electron'
import { join, basename } from 'path'
import fs from 'fs'
import Database from 'better-sqlite3'
import { db, closeDB, dbPath } from './database'

const backupDir = join(app.getPath('userData'), 'backups')
const configPath = join(app.getPath('userData'), 'backup-config.json')

if (!fs.existsSync(backupDir)) {
  fs.mkdirSync(backupDir)
}

function getAutoBackupConfig() {
  try {
    if (fs.existsSync(configPath)) {
      const data = fs.readFileSync(configPath, 'utf-8')
      return JSON.parse(data)
    }
  } catch (e) {
    return { enabled: false }
  }
  return { enabled: false }
}

async function createBackupImpl(label?: string) {
  const timestamp = new Date().toISOString().replace(/[:.]/g, '-')
  const name = label ? `${label}_${timestamp}.backup` : `auto_${timestamp}.backup`
  const dest = join(backupDir, name)

  await db.backup(dest)

  const files = fs
    .readdirSync(backupDir)
    .filter((f) => f.endsWith('.backup'))
    .map((file) => ({
      name: file,
      time: fs.statSync(join(backupDir, file)).birthtime.getTime()
    }))
    .sort((a, b) => b.time - a.time)

  if (files.length > 10) {
    const toDelete = files.slice(10)
    toDelete.forEach((f) => {
      try {
        fs.unlinkSync(join(backupDir, f.name))
      } catch (e) {
        console.error(e)
      }
    })
  }
}

export async function runAutoBackup() {
  const config = getAutoBackupConfig()
  if (config.enabled) {
    console.log('Ejecutando backup automático al cerrar...')
    try {
      await createBackupImpl('auto_exit')
      console.log('Backup automático completado.')
    } catch (error) {
      console.error('Error en backup automático:', error)
    }
  }
}

export function registerBackupHandlers() {
  ipcMain.handle('backup:list', async () => {
    try {
      const files = fs
        .readdirSync(backupDir)
        .filter((f) => f.endsWith('.backup'))
        .map((file) => {
          const stat = fs.statSync(join(backupDir, file))
          return {
            name: file,
            size: stat.size,
            createdAt: stat.birthtime
          }
        })
        .sort((a, b) => b.createdAt.getTime() - a.createdAt.getTime())

      return { success: true, backups: files, path: backupDir }
    } catch (error) {
      return { success: false, message: 'Error leyendo backups' }
    }
  })

  ipcMain.handle('backup:create', async (_, label) => {
    try {
      await createBackupImpl(label)
      return { success: true }
    } catch (error) {
      console.error(error)
      return { success: false, message: 'Error creando respaldo' }
    }
  })

  ipcMain.handle('backup:restore', async (_, filename) => {
    try {
      const source = join(backupDir, filename)

      try {
        const checkDb = new Database(source, { readonly: true })
        checkDb.pragma('quick_check')
        checkDb.close()
      } catch (e) {
        return { success: false, message: 'El archivo de respaldo está corrupto' }
      }

      closeDB()

      await new Promise((resolve) => setTimeout(resolve, 1000))
      fs.copyFileSync(source, dbPath)

      app.relaunch()
      app.exit(0)

      return { success: true }
    } catch (error) {
      console.error('Error restaurando:', error)
      return { success: false, message: 'Falló la restauración' }
    }
  })

  ipcMain.handle('backup:delete', async (_, filename) => {
    try {
      fs.unlinkSync(join(backupDir, filename))
      return { success: true }
    } catch (error) {
      return { success: false }
    }
  })

  ipcMain.handle('backup:export', async (_, filename) => {
    try {
      const source = join(backupDir, filename)

      const { filePath } = await dialog.showSaveDialog({
        title: 'Exportar Copia de Seguridad',
        defaultPath: filename,
        filters: [{ name: 'Backup Database', extensions: ['backup'] }]
      })

      if (filePath) {
        fs.copyFileSync(source, filePath)
        return { success: true, path: filePath }
      }
      return { success: false, message: 'Cancelado' }
    } catch (error) {
      console.error(error)
      return { success: false, message: 'Error al exportar archivo' }
    }
  })

  ipcMain.handle('backup:import', async () => {
    try {
      const result = await dialog.showOpenDialog({
        title: 'Importar Copia de Seguridad',
        filters: [{ name: 'Backup Database', extensions: ['backup'] }],
        properties: ['openFile']
      })

      if (result.canceled || result.filePaths.length === 0) {
        return { success: false, message: 'Cancelado' }
      }

      const sourcePath = result.filePaths[0]
      const filename = basename(sourcePath)
      const destPath = join(backupDir, filename)

      fs.copyFileSync(sourcePath, destPath)
      return { success: true }
    } catch (error) {
      console.error(error)
      return { success: false, message: 'Error al importar archivo' }
    }
  })

  ipcMain.handle('backup:get-config', () => {
    return getAutoBackupConfig()
  })

  ipcMain.handle('backup:toggle-auto', (_, enabled) => {
    try {
      fs.writeFileSync(configPath, JSON.stringify({ enabled }))
      return { success: true }
    } catch (error) {
      return { success: false }
    }
  })
}
