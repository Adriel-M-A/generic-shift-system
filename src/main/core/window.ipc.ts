import { ipcMain, BrowserWindow } from 'electron'

export function setupWindowIPC(mainWindow: BrowserWindow): void {
  // Minimizar
  ipcMain.on('window-minimize', () => {
    mainWindow.minimize()
  })

  // Maximizar / Restaurar
  ipcMain.on('window-maximize', () => {
    if (mainWindow.isMaximized()) {
      mainWindow.unmaximize()
    } else {
      mainWindow.maximize()
    }
  })

  // Cerrar
  ipcMain.on('window-close', () => {
    mainWindow.close()
  })

  // --- Handlers de redimensionado (Opcional, si usas login responsivo) ---
  ipcMain.on('window:set-login-size', () => {
    mainWindow.setSize(400, 600)
    mainWindow.center()
    mainWindow.setResizable(false)
  })

  ipcMain.on('window:set-app-size', () => {
    mainWindow.setSize(1200, 800)
    mainWindow.setResizable(true)
    mainWindow.center()
    mainWindow.maximize()
  })
}
