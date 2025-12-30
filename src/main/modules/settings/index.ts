import { getDB } from '../../core/database'
import { initSettingsSchema } from './schema'
import { registerSettingsHandlers } from './handlers'
import { SettingsService } from './service'

export const SettingsModule = {
  init: () => {
    initSettingsSchema()
    const db = getDB()
    const service = new SettingsService(db)
    registerSettingsHandlers(service)
  }
}
