import { ipcMain } from 'electron'
import { servicesService } from './service'

export function registerServicesHandlers() {
  ipcMain.handle('services:get-all', () => servicesService.getAll())
  ipcMain.handle('services:create', (_, nombre) => servicesService.create(nombre))
  ipcMain.handle('services:update', (_, { id, nombre }) => servicesService.update(id, nombre))
  ipcMain.handle('services:toggle', (_, id) => servicesService.toggleActive(id))
  ipcMain.handle('services:delete', (_, id) => servicesService.delete(id))
}
