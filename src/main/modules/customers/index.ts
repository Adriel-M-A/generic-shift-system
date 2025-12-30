import { getDB } from '../../core/database'
import { initCustomersSchema } from './schema'
import { registerCustomerHandlers } from './handlers'
import { CustomerService } from './service'

export const CustomersModule = {
  init: () => {
    initCustomersSchema()
    const db = getDB()
    const service = new CustomerService(db)
    registerCustomerHandlers(service)
  }
}
