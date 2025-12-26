import { initSettingsSchema } from './schema'
import { registerSettingsHandlers } from './handlers'

export const settingsModule = {
  init: () => {
    initSettingsSchema()
    registerSettingsHandlers()
  }
}
