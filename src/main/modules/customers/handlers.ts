import { ipcMain } from 'electron'
import { customerService, CustomerData } from './service'

export function registerCustomerHandlers(): void {
  ipcMain.handle('customers:getAll', () => {
    return customerService.getAll()
  })

  ipcMain.handle('customers:create', (_, data: CustomerData) => {
    try {
      return customerService.create(data)
    } catch (error: any) {
      if (error.code === 'SQLITE_CONSTRAINT_UNIQUE') {
        throw new Error('El documento ya existe en la base de datos')
      }
      throw error
    }
  })

  ipcMain.handle('customers:update', (_, id: string | number, data: CustomerData) => {
    try {
      return customerService.update(id, data)
    } catch (error: any) {
      if (error.code === 'SQLITE_CONSTRAINT_UNIQUE') {
        throw new Error('El documento ya pertenece a otro cliente')
      }
      throw error
    }
  })

  ipcMain.handle('customers:delete', (_, id: string | number) => {
    return customerService.delete(id)
  })
}
