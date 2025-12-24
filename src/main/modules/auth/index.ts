import { registerAuthHandlers } from './handlers'

export const AuthModule = {
  name: 'auth',
  register: () => registerAuthHandlers()
}
