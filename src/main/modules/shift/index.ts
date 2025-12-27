import { registerShiftHandlers } from './handlers'
import { initShiftSchema } from './schema'

export const ShiftModule = {
  init: () => {
    initShiftSchema()
    registerShiftHandlers()
  }
}
