import { ipcMain } from 'electron'
import { settingsService } from './service'

export function registerSettingsHandlers() {
  ipcMain.handle('settings:getAll', () => settingsService.getAll())
  ipcMain.handle('settings:set', (_, { key, value }) => settingsService.set(key, value))
  ipcMain.handle('settings:setMany', (_, settings) => settingsService.setMany(settings))
}
