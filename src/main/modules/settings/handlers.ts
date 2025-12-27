import { ipcMain } from 'electron'
import { settingsService } from './service'
import { SetSettingSchema, SetManySchema } from './validations'

export function registerSettingsHandlers() {
  ipcMain.handle('settings:getAll', () => settingsService.getAll())

  ipcMain.handle('settings:set', (_, rawData) => {
    const validation = SetSettingSchema.safeParse(rawData)

    if (!validation.success) {
      throw new Error(validation.error.issues[0].message)
    }

    // Convertimos el valor a string explícitamente para asegurar compatibilidad con la DB
    return settingsService.set(validation.data.key, String(validation.data.value))
  })

  ipcMain.handle('settings:setMany', (_, rawSettings) => {
    const validation = SetManySchema.safeParse(rawSettings)

    if (!validation.success) {
      throw new Error('Formato de configuración inválido')
    }

    // El servicio ya hace el String(value) internamente
    // @ts-ignore
    return settingsService.setMany(validation.data)
  })
}
