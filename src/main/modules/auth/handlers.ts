import { ipcMain } from 'electron'
import { authService } from './service'

export function registerAuthHandlers(): void {
  ipcMain.handle('auth:login', (_, { usuario, password }) => authService.login(usuario, password))
  ipcMain.handle('auth:getUsers', () => ({ success: true, users: authService.getUsers() }))
  ipcMain.handle('auth:createUser', (_, data) => authService.createUser(data))
  ipcMain.handle('auth:updateUser', (_, { id, data }) => authService.updateUser(id, data))
  ipcMain.handle('auth:deleteUser', (_, id) => authService.deleteUser(id))
  ipcMain.handle('auth:changePassword', (_, { id, currentPassword, newPassword }) =>
    authService.changePassword(id, currentPassword, newPassword)
  )

  // Roles
  ipcMain.handle('roles:getAll', () => ({ success: true, roles: authService.getRoles() }))
  ipcMain.handle('roles:update', (_, { id, label, permissions }) =>
    authService.updateRole(id, label, permissions)
  )
}
