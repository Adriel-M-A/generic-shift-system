import { ipcMain } from 'electron'
import { ServicesService } from './service'
import { ServiceNameSchema } from './validations'

export function registerServicesHandlers(service: ServicesService) {
  ipcMain.handle('services:getAll', () => service.getAll())

  ipcMain.handle('services:create', (_, nombre) => {
    const validation = ServiceNameSchema.safeParse(nombre)
    if (!validation.success) {
      throw new Error(validation.error.issues[0].message)
    }
    try {
      return service.create(validation.data)
    } catch (error: any) {
      if (error.code === 'SQLITE_CONSTRAINT_UNIQUE') {
        throw new Error('Ya existe un servicio con este nombre')
      }
      throw error
    }
  })

  ipcMain.handle('services:update', (_, { id, nombre }) => {
    const validation = ServiceNameSchema.safeParse(nombre)
    if (!validation.success) {
      throw new Error(validation.error.issues[0].message)
    }
    try {
      return service.update(id, validation.data)
    } catch (error: any) {
      if (error.code === 'SQLITE_CONSTRAINT_UNIQUE') {
        throw new Error('Ya existe otro servicio con este nombre')
      }
      throw error
    }
  })

  ipcMain.handle('services:toggle', (_, id) => service.toggleActive(id))
  ipcMain.handle('services:delete', (_, id) => service.delete(id))
}
