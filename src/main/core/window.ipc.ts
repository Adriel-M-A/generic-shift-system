import { ipcMain, BrowserWindow } from 'electron'

export function registerWindowHandlers(mainWindow: BrowserWindow): void {
  // --- Controles Básicos ---
  ipcMain.on('window-minimize', () => {
    mainWindow.minimize()
  })

  ipcMain.on('window-maximize', () => {
    if (mainWindow.isMaximized()) {
      mainWindow.unmaximize()
    } else {
      mainWindow.maximize()
    }
  })

  ipcMain.on('window-close', () => {
    mainWindow.close()
  })

  // --- Manejo Dinámico de Tamaños ---

  // Modo Login: Tamaño fijo y pequeño
  ipcMain.on('window:set-login-size', () => {
    // 1. Permitimos redimensión temporalmente para aplicar cambios
    mainWindow.setResizable(true)

    // 2. Quitamos el estado maximizado si veníamos de la App
    if (mainWindow.isMaximized()) {
      mainWindow.unmaximize()
    }

    // 3. Importante: Primero quitamos los mínimos/máximos previos de la App
    // para que no bloqueen el nuevo tamaño pequeño
    mainWindow.setMinimumSize(0, 0)
    mainWindow.setMaximumSize(10000, 10000)

    // 4. Aplicamos el tamaño de login
    mainWindow.setSize(400, 550)

    // 5. Ahora sí, bloqueamos el tamaño para que sea fijo
    mainWindow.setMinimumSize(400, 550)
    mainWindow.setMaximumSize(400, 550)
    mainWindow.setResizable(false)

    // 6. Centramos la ventana en la pantalla
    mainWindow.center()
  })

  // Modo App: Tamaño grande y flexible
  ipcMain.on('window:set-app-size', () => {
    // 1. Desbloqueamos la ventana
    mainWindow.setResizable(true)

    // 2. Quitamos los límites estrictos del login
    // Ponemos un máximo enorme para permitir maximizar
    mainWindow.setMaximumSize(10000, 10000)

    // 3. Establecemos el mínimo de la App (proporcional al contenido)
    // Esto evita que el usuario la haga más pequeña que 800x600
    mainWindow.setMinimumSize(800, 600)

    // 4. Maximizar por defecto al entrar
    mainWindow.maximize()
  })
}
