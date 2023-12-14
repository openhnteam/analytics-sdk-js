import { logger, Queue, isEmpty, validateOptionsAndSet } from '../utils'
import { ToStringTypes } from '../shared'
import { AuthInfoType, BaseOptionsFieldsIntegrationType, ReportDataType, BaseReportDataType, TransportDataType } from '../types'

/**
 * 传输数据抽象类
 *
 * @export
 * @abstract
 * @class BaseTransport
 * @template O
 */
export abstract class BaseTransport<O extends BaseOptionsFieldsIntegrationType = BaseOptionsFieldsIntegrationType> {
  appKey = ''
  salt = ''
  host = ''
  deviceId = ''
  scene = ''
  appUserId = ''
  authInfo: AuthInfoType
  queue: Queue
  beforeDataReport: Promise<TransportDataType | null | undefined | boolean> | TransportDataType | any | null | undefined | boolean = null
  constructor() {
    this.queue = new Queue()
  }

  /**
   * 绑定配置项
   *
   * @param {Partial<O>} [options={}]
   * @memberof BaseTransport
   */
  bindOptions(options: Partial<O> = {}): void {
    const { host, beforeDataReport, appKey, salt, deviceId, scene, appUserId } = options
    const sceneString = `${scene}` // 强制转换成string避免有些客户端类型不对
    const optionArr = [
      [appKey, 'appKey', ToStringTypes.String],
      [salt, 'salt', ToStringTypes.String],
      [host, 'host', ToStringTypes.String],
      [deviceId, 'deviceId', ToStringTypes.String],
      [sceneString, 'scene', ToStringTypes.String],
      [appUserId, 'appUserId', ToStringTypes.String],
      [beforeDataReport, 'beforeDataReport', ToStringTypes.Function]
    ]
    validateOptionsAndSet.call(this, optionArr)
  }

  /**
   * 获取SKD基础信息
   * @returns
   */
  getBaseData() {
    const baseData: BaseReportDataType = {
      app_key: this.appKey,
      sdk_version: '',
      sdk_name: '',
      device_id: this.deviceId,
      timestamp: Date.now()
    }
    return baseData
  }

  setAuthInfo(authInfo: AuthInfoType) {
    this.authInfo = authInfo
  }

  /**
   * 发送数据到服务端
   *
   * @param {*} data
   * @return {*}
   * @memberof BaseTransport
   */
  send(data: any, url: string) {
    const host = this.host + url
    if (isEmpty(host)) {
      logger.error('host is empty,pass in when initializing please')
      return
    }
    return this.sendToServer(data, host)
  }

  /**
   * post方式，子类需要重写
   *
   * @abstract
   * @param {(TransportDataType | any)} data
   * @param {string} url
   * @memberof BaseTransport
   */
  abstract post(data: TransportDataType | any, url: string)
  /**
   * 最终上报到服务器的方法，需要子类重写
   *
   * @abstract
   * @param {(TransportDataType | any)} data
   * @param {string} url
   * @memberof BaseTransport
   */
  abstract sendToServer(data: TransportDataType | any, url: string) // TODO: 返回类型约束
  /**
   * 封装上报数据的格式
   *
   * @abstract
   * @param {ReportDataType} data
   * @return {TransportDataType}  {TransportDataType}
   * @memberof BaseTransport
   */
  abstract handleTransportData(data: ReportDataType): TransportDataType
}
