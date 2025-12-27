import { registerSettingsHandlers } from './handlers'
import { initSettingsSchema } from './schema'

export function initSettingsModule() {
  initSettingsSchema()
  registerSettingsHandlers()
}
