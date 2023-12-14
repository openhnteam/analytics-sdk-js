import { Session } from './core/session'
import { BaseOptionsFieldsIntegrationType } from '../../types'
import uniStore from './store'
import { platformGlobal } from './utils/userAgent'

export class MiniAppSession extends Session {
  constructor(options: BaseOptionsFieldsIntegrationType) {
    super(options)
    super.bindOptions(options)
  }

  bindOptions(options: BaseOptionsFieldsIntegrationType) {
    super.bindOptions(options)
  }

  storeSetItemSync(stackKey: string, stack) {
    uniStore.setItemSync(stackKey, stack)
  }

  storeGetItemSync(stackKey: string): any {
    return uniStore.getItemSync(stackKey)
  }

  getSystemInfo(options): any {
    return platformGlobal.getSystemInfo(options)
  }
}
