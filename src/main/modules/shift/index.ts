import { registerShiftHandlers } from './handlers'
import { initShiftSchema } from './schema'

export const shiftModule = {
  init: () => {
    initShiftSchema()
    registerShiftHandlers()
  }
}
