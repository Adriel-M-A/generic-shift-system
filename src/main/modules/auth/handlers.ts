import { ipcMain } from 'electron'
import { AuthService } from './service'

export function registerAuthHandlers(): void {
  // Auth & Usuarios
  ipcMain.handle('auth:login', (_, { usuario, password }) => AuthService.login(usuario, password))
  ipcMain.handle('auth:get-users', () => ({ success: true, users: AuthService.getUsers() }))
  ipcMain.handle('auth:create-user', (_, data) => AuthService.createUser(data))
  ipcMain.handle('auth:update-user', (_, { id, data }) => AuthService.updateUser(id, data))
  ipcMain.handle('auth:delete-user', (_, id) => AuthService.deleteUser(id))
  ipcMain.handle('auth:change-password', (_, { id, currentPassword, newPassword }) =>
    AuthService.changePassword(id, currentPassword, newPassword)
  )

  // Roles
  ipcMain.handle('roles:get', () => ({ success: true, roles: AuthService.getRoles() }))
  ipcMain.handle('roles:update', (_, { id, label, permissions }) =>
    AuthService.updateRole(id, label, permissions)
  )
}
