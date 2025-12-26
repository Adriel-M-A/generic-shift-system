import { initAuthSchema } from './schema'
import { registerAuthHandlers } from './handlers'

export const AuthModule = {
  init: () => {
    initAuthSchema()
    registerAuthHandlers()
  }
}
