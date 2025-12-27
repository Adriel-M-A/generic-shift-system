import { initCustomersSchema } from './schema'
import { registerCustomerHandlers } from './handlers'

export const CustomersModule = {
  init: () => {
    initCustomersSchema()
    registerCustomerHandlers()
  }
}
