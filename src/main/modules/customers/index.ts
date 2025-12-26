import { createCustomerTable } from './schema'
import { registerCustomerHandlers } from './handlers'

export const CustomersModule = {
  init: () => {
    createCustomerTable()
    registerCustomerHandlers()
  }
}
