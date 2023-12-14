import { BaseClientType, BaseOptionsFieldsIntegrationType, EventDataType } from '../types' // 类型和接口定义
import { logger } from '../utils'
import { BaseTransport } from './baseTransport'

/**
 * 抽象客户端，已实现插件和钩子函数的定义
 * 如果目前的钩子函数满足不了业务，需要在use中额外添加钩子，并在各个端实现
 *
 * @export
 * @abstract
 * @class BaseClient
 * @implements {BaseClientType}
 * @template O
 */
export abstract class BaseClient<
  // 抽象类
  O extends BaseOptionsFieldsIntegrationType = BaseOptionsFieldsIntegrationType
> implements BaseClientType
{
  SDK_NAME: string
  SDK_VERSION: string
  options: BaseOptionsFieldsIntegrationType
  abstract transport: BaseTransport
  constructor(options: O) {
    this.options = options
    logger.bindOptions(!!options.debug)
  }
  getOptions() {
    return this.options
  }

  /**
   * 手动上报方法，每个端需要自己实现
   *
   * @abstract
   * @memberof BaseClient
   */
  abstract trackEvent(data: EventDataType): void
}
