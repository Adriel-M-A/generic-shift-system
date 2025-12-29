import { getDB } from '../../core/database'
import { initAuthSchema } from './schema'
import { registerAuthHandlers } from './handlers'
import { AuthService } from './services/AuthService'
import { UserService } from './services/UserService'
import { RoleService } from './services/RoleService'

export const AuthModule = {
  init: () => {
    initAuthSchema()
    const db = getDB()
    const authService = new AuthService(db)
    const userService = new UserService(db, authService)
    const roleService = new RoleService(db, authService)
    registerAuthHandlers(authService, userService, roleService)
  }
}
