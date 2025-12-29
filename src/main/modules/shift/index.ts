import { getDB } from '../../core/database'
import { ShiftService } from './service'
import { registerShiftHandlers } from './handlers'
import { initShiftSchema } from './schema'

export const ShiftModule = {
  init: () => {
    const db = getDB()
    const service = new ShiftService(db)

    initShiftSchema()
    registerShiftHandlers(service)
  }
}
