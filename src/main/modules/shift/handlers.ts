import { ipcMain } from 'electron'
import { shiftService } from './service'
import { servicesService } from './services.service'

export function registerShiftHandlers() {
  // --- TURNOS ---
  ipcMain.handle('shift:create', (_, data) => shiftService.create(data))
  ipcMain.handle('shift:getByDate', (_, fecha) => shiftService.getByDate(fecha))
  ipcMain.handle('shift:getMonthlyLoad', (_, p) => shiftService.getByMonth(p.year, p.month))
  ipcMain.handle('shift:updateStatus', (_, p) => shiftService.updateStatus(p.id, p.estado))

  // --- SERVICIOS (NUEVO) ---
  ipcMain.handle('services:get-all', () => servicesService.getAll())
  ipcMain.handle('services:create', (_, nombre) => servicesService.create(nombre))
  ipcMain.handle('services:update', (_, { id, nombre }) => servicesService.update(id, nombre))
  ipcMain.handle('services:toggle', (_, id) => servicesService.toggleActive(id))
  ipcMain.handle('services:delete', (_, id) => servicesService.delete(id))
}
