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
      return await service.create(validated)
    } catch (error) {
      if (error instanceof z.ZodError) throw new Error(error.issues[0].message)
      throw error
    }
  })

  ipcMain.handle('shift:getByDate', async (_, date: string) => {
    try {
      DateParamSchema.parse(date)
      return await service.getByDate(date)
    } catch (error) {
      if (error instanceof z.ZodError) throw new Error(error.issues[0].message)
      throw error
    }
  })

  ipcMain.handle('shift:getMonthlyLoad', async (_, params) => {
    try {
      const validated = MonthlyLoadSchema.parse(params)
      return await service.getMonthlyLoad(validated)
    } catch (error) {
      if (error instanceof z.ZodError) throw new Error(error.issues[0].message)
      throw error
    }
  })

  ipcMain.handle('shift:getInitialData', async (_, params) => {
    try {
      const validated = InitialDataSchema.parse(params)
      return await service.getInitialData(validated)
    } catch (error) {
      if (error instanceof z.ZodError) throw new Error(error.issues[0].message)
      throw error
    }
  })

  ipcMain.handle('shift:getYearlyLoad', async (_, year: number) => {
    try {
      YearlyLoadSchema.parse(year)
      return await service.getYearlyLoad(year)
    } catch (error) {
      if (error instanceof z.ZodError) throw new Error(error.issues[0].message)
      throw error
    }
  })

  ipcMain.handle('shift:updateStatus', async (_, params) => {
    try {
      const validated = UpdateStatusSchema.parse(params)
      return await service.updateStatus(validated.id, validated.estado)
    } catch (error) {
      if (error instanceof z.ZodError) throw new Error(error.issues[0].message)
      throw error
    }
  })
}
