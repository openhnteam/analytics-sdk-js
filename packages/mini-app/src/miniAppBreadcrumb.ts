import { Breadcrumb } from './core/breadcrumb'
import { BaseOptionsFieldsIntegrationType } from '../../types'
import uniStore from './store'

export class MiniAppBreadcrumb extends Breadcrumb<BaseOptionsFieldsIntegrationType> {
  constructor(options: BaseOptionsFieldsIntegrationType) {
    super()
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
}
