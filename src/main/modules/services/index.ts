import { initServicesSchema } from './schema'
import { registerServicesHandlers } from './handlers'

export const ServicesModule = {
  init: () => {
    initServicesSchema()
    registerServicesHandlers()
  }
}
