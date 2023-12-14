import { BaseOptions } from '../../core'
import { BrowserOptionsTypes } from '../../types'

export class BrowserOptions extends BaseOptions<BrowserOptionsTypes> {
  constructor(options: BrowserOptionsTypes) {
    super()
    super.bindOptions(options)
  }

  bindOptions(options: BrowserOptionsTypes) {
    super.bindOptions(options)
  }
}
