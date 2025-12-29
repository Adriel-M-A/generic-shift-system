import { ipcMain } from 'electron'
import { z } from 'zod'
import { CustomerService } from './service'
import { CustomerSchema, UpdateCustomerSchema } from './validations'

export function registerCustomerHandlers(service: CustomerService) {
  ipcMain.handle('customers:getPaginated', (_, { page, limit, search }) =>
    service.getPaginated(page, limit, search)
  )

  ipcMain.handle('customers:getById', (_, id: number) => service.getById(id))

  ipcMain.handle('customers:create', async (_, data) => {
    try {
      const validated = CustomerSchema.parse(data)
      return service.create(validated)
    } catch (error) {
      if (error instanceof z.ZodError) throw new Error(error.issues[0].message)
      throw error
    }
  })

  ipcMain.handle('customers:update', async (_, id: number, data: any) => {
    try {
      const validated = UpdateCustomerSchema.parse(data)
      return service.update(id, validated)
    } catch (error) {
      if (error instanceof z.ZodError) throw new Error(error.issues[0].message)
      throw error
    }
  })

  ipcMain.handle('customers:delete', (_, id: number) => service.delete(id))
}
