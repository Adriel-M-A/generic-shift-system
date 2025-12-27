import { ipcMain } from 'electron'
import { shiftService } from './service'
import {
  CreateShiftSchema,
  DateParamSchema,
  MonthlyLoadSchema,
  YearlyLoadSchema,
  UpdateStatusSchema
} from './validations'

export function registerShiftHandlers() {
  ipcMain.handle('shift:create', (_, rawData) => {
    const validation = CreateShiftSchema.safeParse(rawData)
    if (!validation.success) throw new Error(validation.error.issues[0].message)

    return shiftService.create(validation.data)
  })

  ipcMain.handle('shift:getByDate', (_, date) => {
    const validation = DateParamSchema.safeParse(date)
    if (!validation.success) throw new Error(validation.error.issues[0].message)

    return shiftService.getByDate(validation.data)
  })

  ipcMain.handle('shift:getMonthlyLoad', (_, params) => {
    const validation = MonthlyLoadSchema.safeParse(params)
    if (!validation.success) throw new Error(validation.error.issues[0].message)

    return shiftService.getByMonth(validation.data.year, validation.data.month)
  })

  ipcMain.handle('shift:getYearlyLoad', (_, year) => {
    const validation = YearlyLoadSchema.safeParse(year)
    if (!validation.success) throw new Error(validation.error.issues[0].message)

    return shiftService.getByYear(validation.data)
  })

  ipcMain.handle('shift:updateStatus', (_, params) => {
    const validation = UpdateStatusSchema.safeParse(params)
    if (!validation.success) throw new Error(validation.error.issues[0].message)

    return shiftService.updateStatus(validation.data.id, validation.data.estado)
  })
}
