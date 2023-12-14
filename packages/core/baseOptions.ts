import { ToStringTypes } from '../shared'
import { BaseOptionsFieldsIntegrationType, BaseOptionsType } from '../types'
import { validateOptionsAndSet } from '../utils'

/**
 * 公用的基础配置项绑定
 *
 * @export
 * @class BaseOptions
 * @implements {BaseOptionsType<O>}
 * @template O
 */
export class BaseOptions<O extends BaseOptionsFieldsIntegrationType = BaseOptionsFieldsIntegrationType> implements BaseOptionsType<O> {
  disabled = false
  appKey = ''
  deviceId = ''
  channel = ''
  appUserId = ''
  salt = ''
  scene = ''
  host = ''
  envType = ''
  debug = false
  constructor() {}
  bindOptions(options: O) {
    const { disabled, appKey, deviceId, channel, appUserId, salt, scene, host, envType, debug } = options
    const sceneString = `${scene}` // 强制转换成string避免有些客户端类型不对
    const optionArr = [
      [disabled, 'disabled', ToStringTypes.String],
      [appKey, 'appKey', ToStringTypes.String],
      [deviceId, 'deviceId', ToStringTypes.String],
      [channel, 'channel', ToStringTypes.String],
      [appUserId, 'appUserId', ToStringTypes.String],
      [salt, 'salt', ToStringTypes.String],
      [sceneString, 'scene', ToStringTypes.String],
      [host, 'host', ToStringTypes.String],
      [envType, 'envType', ToStringTypes.String],
      [debug, 'debug', ToStringTypes.String]
    ]
    validateOptionsAndSet.call(this, optionArr)
  }
}
