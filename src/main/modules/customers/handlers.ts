import { ipcMain } from 'electron'
import { customerService } from './service'
import { CustomerSchema } from './validations'

export function registerCustomerHandlers(): void {
  ipcMain.handle('customers:getAll', () => {
    return customerService.getAll()
  })

  ipcMain.handle('customers:create', (_, rawData) => {
    const validation = CustomerSchema.safeParse(rawData)

    if (!validation.success) {
      throw new Error(validation.error.issues[0].message)
    }

    try {
      // @ts-ignore
      return customerService.create(validation.data)
    } catch (error: any) {
      if (error.code === 'SQLITE_CONSTRAINT_UNIQUE') {
        throw new Error('El documento ya existe en la base de datos')
      }
      throw error
    }
  })

  ipcMain.handle('customers:update', (_, id, rawData) => {
    const validation = CustomerSchema.safeParse(rawData)

    if (!validation.success) {
      throw new Error(validation.error.issues[0].message)
    }

    try {
      // @ts-ignore
      return customerService.update(id, validation.data)
    } catch (error: any) {
      if (error.code === 'SQLITE_CONSTRAINT_UNIQUE') {
        throw new Error('El documento ya pertenece a otro cliente')
      }
      throw error
    }
  })

  ipcMain.handle('customers:delete', (_, id) => {
    return customerService.delete(id)
  })
}
