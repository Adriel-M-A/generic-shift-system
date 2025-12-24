import { registerShiftHandlers } from './handlers'

export const shiftModule = {
  init: () => {
    registerShiftHandlers()
  }
}
