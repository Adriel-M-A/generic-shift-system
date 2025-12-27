import { registerSettingsHandlers } from './handlers'
import { initSettingsSchema } from './schema'

export const SettingsModule = {
  init: () => {
    initSettingsSchema()
    registerSettingsHandlers()
  }
}
