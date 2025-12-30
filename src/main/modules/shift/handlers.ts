import { ipcMain } from 'electron'
import { z } from 'zod'
import { ShiftService } from './service'
import {
  CreateShiftSchema,
  DateParamSchema,
  MonthlyLoadSchema,
  InitialDataSchema,
  YearlyLoadSchema,
  UpdateStatusSchema
} from './validations'

export function registerShiftHandlers(service: ShiftService) {
  ipcMain.handle('shift:create', async (_, data) => {
    try {
      const validated = CreateShiftSchema.parse(data)
      return service.create(validated)
    } catch (error) {
      if (error instanceof z.ZodError) throw new Error(error.issues[0].message)
      throw error
    }
  })

  ipcMain.handle('shift:getByDate', (_, date: string) => {
    DateParamSchema.parse(date)
    return service.getByDate(date)
  })

  ipcMain.handle('shift:getMonthlyLoad', (_, params) => {
    const validated = MonthlyLoadSchema.parse(params)
    return service.getMonthlyLoad(validated)
  })

  ipcMain.handle('shift:getInitialData', (_, params) => {
    const validated = InitialDataSchema.parse(params)
    return service.getInitialData(validated)
  })

  ipcMain.handle('shift:getYearlyLoad', (_, year: number) => {
    YearlyLoadSchema.parse(year)
    return service.getYearlyLoad(year)
  })

  ipcMain.handle('shift:updateStatus', (_, params) => {
    const validated = UpdateStatusSchema.parse(params)
    return service.updateStatus(validated.id, validated.estado)
  })
}
