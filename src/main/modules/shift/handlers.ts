import { ipcMain } from 'electron'
import { shiftService } from './service'

export function registerShiftHandlers() {
  ipcMain.handle('shift:create', (_, data) => shiftService.create(data))
  ipcMain.handle('shift:getByDate', (_, fecha) => shiftService.getByDate(fecha))
  ipcMain.handle('shift:getMonthlyLoad', (_, p) => shiftService.getByMonth(p.year, p.month))
  ipcMain.handle('shift:getYearlyLoad', (_, year) => shiftService.getByYear(year))
  ipcMain.handle('shift:updateStatus', (_, p) => shiftService.updateStatus(p.id, p.estado))
}
