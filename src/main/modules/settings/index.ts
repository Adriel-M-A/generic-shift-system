import { registerSettingsHandlers } from './handlers'

export const settingsModule = {
  init: () => {
    registerSettingsHandlers()
  }
}
