import { ipcMain } from 'electron'
import { SettingsService } from './service'
import { SetSettingSchema, SetManySchema } from './validations'

export function registerSettingsHandlers(service: SettingsService) {
  ipcMain.handle('settings:getAll', () => service.getAll())

  ipcMain.handle('settings:set', (_, rawData) => {
    const validation = SetSettingSchema.safeParse(rawData)
    if (!validation.success) {
      throw new Error(validation.error.issues[0].message)
    }
    return service.set(validation.data.key, String(validation.data.value))
  })

  ipcMain.handle('settings:setMany', (_, rawSettings) => {
    const validation = SetManySchema.safeParse(rawSettings)
    if (!validation.success) {
      throw new Error('Formato de configuración inválido')
    }
    return service.setMany(validation.data as Record<string, string>)
  })
}
