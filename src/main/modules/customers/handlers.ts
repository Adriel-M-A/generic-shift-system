import { ipcMain } from 'electron'
import { CustomerService, CustomerData } from './service'

export function registerCustomerHandlers(): void {
  ipcMain.handle('customers:getAll', () => {
    return CustomerService.getAll()
  })

  ipcMain.handle('customers:create', (_, data: CustomerData) => {
    try {
      return CustomerService.create(data)
    } catch (error: any) {
      if (error.code === 'SQLITE_CONSTRAINT_UNIQUE') {
        throw new Error('El documento ya existe en la base de datos')
      }
      throw error
    }
  })

  ipcMain.handle('customers:update', (_, id: string, data: CustomerData) => {
    try {
      return CustomerService.update(id, data)
    } catch (error: any) {
      if (error.code === 'SQLITE_CONSTRAINT_UNIQUE') {
        throw new Error('El documento ya pertenece a otro cliente')
      }
      throw error
    }
  })

  ipcMain.handle('customers:delete', (_, id: string) => {
    return CustomerService.delete(id)
  })
}
