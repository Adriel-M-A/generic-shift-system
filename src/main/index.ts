import { app, shell, BrowserWindow } from 'electron'
import { join } from 'path'
import { electronApp, optimizer, is } from '@electron-toolkit/utils'
import icon from '../../resources/icon.png?asset'

import { getDB } from './core/database'
import { runMigrations } from './core/migrations'
import { setupBackupSystem } from './core/backup.ipc'
import { setupWindowIPC } from './core/window.ipc'

// Importar Módulos
import { AuthModule } from './modules/auth'
import { ShiftModule } from './modules/shift'
import { SettingsModule } from './modules/settings'
import { CustomersModule } from './modules/customers'
import { ServicesModule } from './modules/services'

function createWindow(): void {
  const mainWindow = new BrowserWindow({
    width: 1200,
    height: 800,
    show: false,
    autoHideMenuBar: true,
    frame: false,
    ...(process.platform === 'linux' ? { icon } : {}),
    webPreferences: {
      preload: join(__dirname, '../preload/index.js'),
      sandbox: false,
      contextIsolation: true
    }
  })

  mainWindow.on('ready-to-show', () => {
    mainWindow.show()
  })

  mainWindow.webContents.setWindowOpenHandler((details) => {
    shell.openExternal(details.url)
    return { action: 'deny' }
  })

  // --- INICIALIZACIÓN ---
  const db = getDB()
  runMigrations(db)

  console.log('Iniciando módulos...')
  AuthModule.init()
  ServicesModule.init()
  CustomersModule.init()
  ShiftModule.init()
  SettingsModule.init()

  // --- SISTEMAS CORE ---
  setupBackupSystem(mainWindow)
  setupWindowIPC(mainWindow) // <--- 2. ACTIVAR LOS BOTONES AQUÍ

  console.log('Cargando URL del Renderer...')

  if (is.dev && process.env['ELECTRON_RENDERER_URL']) {
    mainWindow.loadURL(process.env['ELECTRON_RENDERER_URL'])
  } else {
    mainWindow.loadFile(join(__dirname, '../renderer/index.html'))
  }
}

app.whenReady().then(() => {
  electronApp.setAppUserModelId('com.electron')

  app.on('browser-window-created', (_, window) => {
    optimizer.watchWindowShortcuts(window)
  })

  createWindow()

  app.on('activate', function () {
    if (BrowserWindow.getAllWindows().length === 0) createWindow()
  })
})

app.on('window-all-closed', () => {
  if (process.platform !== 'darwin') {
    app.quit()
  }
})
