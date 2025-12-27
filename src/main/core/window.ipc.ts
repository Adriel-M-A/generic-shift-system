import { ipcMain, BrowserWindow } from 'electron'

export function setupWindowIPC(mainWindow: BrowserWindow): void {
  ipcMain.on('window:minimize', () => {
    mainWindow.minimize()
  })

  ipcMain.on('window:maximize', () => {
    if (mainWindow.isMaximized()) {
      mainWindow.unmaximize()
    } else {
      mainWindow.maximize()
    }
  })

  ipcMain.on('window:close', () => {
    mainWindow.close()
  })

  ipcMain.on('window:setLoginSize', () => {
    mainWindow.setSize(400, 600)
    mainWindow.center()
    mainWindow.setResizable(false)
  })

  ipcMain.on('window:setAppSize', () => {
    mainWindow.setSize(1200, 800)
    mainWindow.setResizable(true)
    mainWindow.center()
    mainWindow.maximize()
  })
}
