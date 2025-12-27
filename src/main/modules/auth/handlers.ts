import { ipcMain } from 'electron'
import { authService } from './services/AuthService'
import { userService } from './services/UserService'
import { roleService } from './services/RoleService'
import {
  LoginSchema,
  CreateUserSchema,
  UpdateUserSchema,
  ChangePasswordSchema,
  UpdateRoleSchema
} from './validations'

export function registerAuthHandlers(): void {
  // --- Auth ---
  ipcMain.handle('auth:login', (_, credentials) => {
    const validation = LoginSchema.safeParse(credentials)
    if (!validation.success) throw new Error(validation.error.issues[0].message)

    return authService.login(validation.data.usuario, validation.data.password)
  })

  // --- Usuarios ---
  ipcMain.handle('auth:getUsers', () => ({ success: true, users: userService.getUsers() }))

  ipcMain.handle('auth:createUser', (_, rawData) => {
    const validation = CreateUserSchema.safeParse(rawData)
    if (!validation.success) throw new Error(validation.error.issues[0].message)

    return userService.createUser(validation.data)
  })

  ipcMain.handle('auth:updateUser', (_, { id, data }) => {
    const validation = UpdateUserSchema.safeParse(data)
    if (!validation.success) throw new Error(validation.error.issues[0].message)

    return userService.updateUser(id, validation.data)
  })

  ipcMain.handle('auth:deleteUser', (_, id) => userService.deleteUser(id))

  ipcMain.handle('auth:changePassword', (_, { id, currentPassword, newPassword }) => {
    const validation = ChangePasswordSchema.safeParse({ currentPassword, newPassword })
    if (!validation.success) throw new Error(validation.error.issues[0].message)

    return userService.changePassword(
      id,
      validation.data.currentPassword,
      validation.data.newPassword
    )
  })

  // --- Roles ---
  ipcMain.handle('roles:getAll', () => ({ success: true, roles: roleService.getRoles() }))

  ipcMain.handle('roles:update', (_, { id, label, permissions }) => {
    const validation = UpdateRoleSchema.safeParse({ label, permissions })
    if (!validation.success) throw new Error(validation.error.issues[0].message)

    return roleService.updateRole(id, validation.data.label, validation.data.permissions)
  })
}
