import { ToStringTypes } from '../../../shared'
import { getTimestamp, toStringValidateOption } from '../../../utils'
import { BaseOptionsFieldsIntegrationType, EventDataType } from '../../../types'
import { STORAGE_KEY } from '../constant/config'
import browserStore from '../store'

/**
 * 用户行为栈存储，实体类
 *
 * @export
 * @class Breadcrumb
 * @template O
 */
export class Breadcrumb<O extends BaseOptionsFieldsIntegrationType = BaseOptionsFieldsIntegrationType> {
  maxBreadcrumbs = 5
  appKey: string = ''
  private stack: EventDataType[] = []
  constructor(options: Partial<O> = {}) {
    this.bindOptions(options)
  }
  /**
   * 添加用户行为栈
   *
   * @param {EventDataType} data
   * @memberof Breadcrumb
   */
  push(data: EventDataType): EventDataType[] {
    return this.immediatePush(data)
  }

  private immediatePush(data: EventDataType): EventDataType[] {
    data.timestamp || (data.timestamp = getTimestamp())
    if (this.stack.length >= this.maxBreadcrumbs) {
      this.shift()
    }
    this.stack.push(data)
    // make sure xhr fetch is behind button click
    this.stack.sort((a, b) => a.timestamp - b.timestamp)
    // logger.log(this.stack)
    browserStore.setItemSync(STORAGE_KEY.eventStack + this.appKey, this.stack)
    return this.stack
  }

  private shift(): boolean {
    const shiftOne = this.stack.shift()
    browserStore.setItemSync(STORAGE_KEY.eventStack + this.appKey, this.stack)
    return shiftOne !== undefined
  }

  clear(): void {
    this.stack = []
    browserStore.setItemSync(STORAGE_KEY.eventStack + this.appKey, [])
  }

  getStack(): EventDataType[] {
    return browserStore.getItemSync(STORAGE_KEY.eventStack + this.appKey) || []
  }

  bindOptions(options: Partial<O> = {}): void {
    const { maxBreadcrumbs, appKey } = options
    toStringValidateOption(maxBreadcrumbs, 'maxBreadcrumbs', ToStringTypes.Number) && (this.maxBreadcrumbs = maxBreadcrumbs)
    toStringValidateOption(appKey, 'appKey', ToStringTypes.String) && (this.appKey = appKey)
  }
}
