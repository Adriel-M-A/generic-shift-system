import { initAuthSchema } from './schema'
import { registerAuthHandlers } from './handlers'

export * from './services/AuthService'
export * from './services/UserService'
export * from './services/RoleService'

export const AuthModule = {
  init: () => {
    initAuthSchema()
    registerAuthHandlers()
  }
}
