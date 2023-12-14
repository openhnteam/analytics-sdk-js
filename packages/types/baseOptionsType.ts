import { TransportDataType } from '.'

export interface BaseOptionsType<O extends BaseOptionsFieldsIntegrationType> extends BaseOptionsFieldsIntegrationType {
  bindOptions(options: O): void
}

export interface BrowserOptionsTypes extends BaseOptionsFieldsIntegrationType, BrowserOptionsHooksType {}

export interface BrowserOptionsHooksType {
  /**
   * 钩子函数，配置发送到服务端的xhr
   * 可以对当前xhr实例做一些配置：xhr.setRequestHeader()、xhr.withCredentials
   *
   * @param {XMLHttpRequest} xhr XMLHttpRequest的实例
   * @param {*} reportData 上报的数据
   * @memberof UniAppOptionsHooksType
   */
  configReportXhr?(xhr: XMLHttpRequest, reportData: any): void
}

export type BaseOptionsFieldsIntegrationType = BaseOptionsFieldsType & BaseOptionsHooksType

export interface BaseOptionsFieldsType {
  disabled?: boolean
  /**
   * 用户id
   */
  appUserId?: string
  /**
   * default is ''(empty string),it mean that every project has a unique key
   */
  appKey?: string
  /**
   * default is ''(empty string),it mean that every project has a unique key
   */
  appVersion?: string
  /**
   * 上报参数校验的盐值
   */
  salt?: string
  /**
   * 场景值
   */
  scene?: string | number
  /**
   *
   */
  channel?: string
  /**
   * 数据上报的host
   */
  host?: string
  /**
   * uniapp 的实例，如果是uniapp开发就需要传
   */
  uni?: any
  /**
   * 数据上报的环境
   */
  envType?: string
  /**
   * 数据上报的域名
   */
  dns?: string
  /**
   * 设备id
   */
  deviceId?: string
  /**
   * default is closed,it will be print in Console when set true
   */
  debug?: boolean
  /**
   * defaul value is 20,it will be 100 if value more than 100.it mean breadcrumb stack length
   */
  maxBreadcrumbs?: number
  /**
   *
   */
  maxDuplicateCount?: number
}

export interface BaseOptionsHooksType {
  /**
   * 钩子函数:在每次发送事件前会调用
   *
   * @param {TransportDataType} event 上报的数据格式
   * @return {*}  {(Promise<TransportDataType | null | CANCEL> | TransportDataType | any | CANCEL | null)} 如果返回 null | undefined | boolean 时，将忽略本次上传
   * @memberof BaseOptionsHooksType
   */
  beforeDataReport?(event: TransportDataType): Promise<TransportDataType | null> | TransportDataType | any | null
}
