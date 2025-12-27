import { ipcMain } from 'electron'
import { servicesService } from './service'
import { ServiceNameSchema } from './validations'

export function registerServicesHandlers() {
  ipcMain.handle('services:getAll', () => servicesService.getAll())

  ipcMain.handle('services:create', (_, nombre) => {
    // Validamos el string directo
    const validation = ServiceNameSchema.safeParse(nombre)

    if (!validation.success) {
      throw new Error(validation.error.issues[0].message)
    }

    try {
      return servicesService.create(validation.data)
    } catch (error: any) {
      if (error.code === 'SQLITE_CONSTRAINT_UNIQUE') {
        throw new Error('Ya existe un servicio con este nombre')
      }
      throw error
    }
  })

  ipcMain.handle('services:update', (_, { id, nombre }) => {
    // Validamos solo el nombre que viene dentro del objeto
    const validation = ServiceNameSchema.safeParse(nombre)

    if (!validation.success) {
      throw new Error(validation.error.issues[0].message)
    }

    try {
      return servicesService.update(id, validation.data)
    } catch (error: any) {
      if (error.code === 'SQLITE_CONSTRAINT_UNIQUE') {
        throw new Error('Ya existe otro servicio con este nombre')
      }
      throw error
    }
  })

  ipcMain.handle('services:toggle', (_, id) => servicesService.toggleActive(id))

  ipcMain.handle('services:delete', (_, id) => servicesService.delete(id))
}
