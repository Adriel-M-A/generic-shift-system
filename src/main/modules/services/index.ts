import { getDB } from '../../core/database'
import { initServicesSchema } from './schema'
import { registerServicesHandlers } from './handlers'
import { ServicesService } from './service'

export const ServicesModule = {
  init: () => {
    initServicesSchema()
    const db = getDB()
    const service = new ServicesService(db)
    registerServicesHandlers(service)
  }
}
