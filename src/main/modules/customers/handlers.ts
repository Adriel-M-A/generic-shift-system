import { ipcMain } from 'electron'
import { CustomerService } from './service'
import { CustomerSchema, UpdateCustomerSchema } from './validations'

export function registerCustomerHandlers(service: CustomerService) {
  ipcMain.handle('customers:getPaginated', (_, params) =>
    service.getPaginated(params.page, params.limit, params.search)
  )

  ipcMain.handle('customers:findByDocument', (_, documento: string) =>
    service.findByDocument(documento)
  )

  ipcMain.handle('customers:create', async (_, data) => {
    try {
      const validated = CustomerSchema.parse(data)
      return service.create(validated)
    } catch (error: any) {
      if (error.code === 'SQLITE_CONSTRAINT_UNIQUE') throw new Error('El documento ya existe')
      throw error
    }
  })

  ipcMain.handle('customers:update', async (_, id: number, data: any) => {
    try {
      const validated = UpdateCustomerSchema.parse(data)
      service.update(id, validated)
    } catch (error: any) {
      throw error
    }
  })

  ipcMain.handle('customers:delete', (_, id: number) => service.delete(id))
}
