import { STORAGE_KEY } from '../constant'
import { ToStringTypes } from '../../../shared'
import { getTimestamp, toStringValidateOption } from '../../../utils'
import { BaseOptionsFieldsIntegrationType, EventDataType } from '../../../types'

/**
 * 用户行为栈存储，实体类
 *
 * @export
 * @class Breadcrumb
 * @template O
 */
export abstract class Breadcrumb<O extends BaseOptionsFieldsIntegrationType = BaseOptionsFieldsIntegrationType> {
  maxBreadcrumbs = 5
  private stack: EventDataType[] = []
  abstract storeSetItemSync(stackKey: string, stack: any)
  abstract storeGetItemSync(stackKey: string): any
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
    this.storeSetItemSync(STORAGE_KEY.eventStack, this.stack)
    return this.stack
  }

  private shift(): boolean {
    const shiftOne = this.stack.shift()
    this.storeSetItemSync(STORAGE_KEY.eventStack, this.stack)
    return shiftOne !== undefined
  }

  clear(): void {
    this.stack = []
    this.storeSetItemSync(STORAGE_KEY.eventStack, [])
  }

  getStack(): EventDataType[] {
    if (this.stack?.length !== 0) {
      return this.stack
    }
    return this.storeGetItemSync(STORAGE_KEY.eventStack) || []
  }

  bindOptions(options: Partial<O> = {}): void {
    const { maxBreadcrumbs } = options
    toStringValidateOption(maxBreadcrumbs, 'maxBreadcrumbs', ToStringTypes.Number) && (this.maxBreadcrumbs = maxBreadcrumbs)
  }
}
