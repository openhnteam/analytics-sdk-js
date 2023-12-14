import { ToStringTypes } from '../../shared'
import { getHashSum256 } from './utils/checksum'
import { xhrAdapter } from './utils/xhr'
import { toStringValidateOption, generateUUID, qsStringify } from '../../utils'
import { BaseTransport } from '../../core'
import { ReportDataType, BrowserOptionsTypes, IAnyObject, ICommonData } from '../../types'
import { REPORT_STATUS } from './constant/config'
import * as packageJson from '../package.json'
const SDK_VERSION = packageJson?.version || '1.0.0'

export class BrowserTransport extends BaseTransport<BrowserOptionsTypes> {
  configReportXhr: unknown
  constructor(options: BrowserOptionsTypes) {
    super()
    super.bindOptions(options)
    this.bindOptions(options)
  }

  post(data: IAnyObject, url: string) {
    return new Promise((resolve, reject) => {
      const params = qsStringify(data)
      xhrAdapter({
        url,
        data: params,
        method: 'POST',
        headers: {
          'Content-Type': 'application/x-www-form-urlencoded'
        }
      })
        .then((response: ICommonData) => {
          if (response.success) {
            resolve(response.data)
          } else {
            reject(response)
          }
        })
        .catch((error) => {
          reject(error)
        })
    })
  }

  navigatorPost(data: IAnyObject, url: string) {
    return fetch(url, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/x-www-form-urlencoded'
      },
      body: qsStringify(data),
      keepalive: true
    })
  }

  navigatorToServer(data: IAnyObject, url: string) {
    return this.navigatorPost(data.data, url)
  }

  sendNavigator(data: IAnyObject) {
    const host = this.host
    if (!host) {
      console.error('host is empty,pass in when initializing please')
      return
    }
    return this.navigatorToServer(data, host)
  }

  sendToServer(data: IAnyObject, url: string) {
    return this.post(data.data, url)
  }

  /**
   * 处理数据格式化, 包括加authInfo, salt, checksum256
   * @param data
   * @returns
   */
  handleTransportData(data: Partial<ReportDataType>) {
    const baseData = this.getBaseData()
    const checkData = {
      ...baseData,
      ...this.authInfo,
      ...data,
      app_user_id: this.appUserId,
      sdk_version: SDK_VERSION,
      sdk_name: 'browser'
    }
    if (data.begin_session) {
      delete checkData.session_id
      delete checkData.session_time
    }
    if (checkData.metrics) {
      checkData.metrics._scene = this.scene
      checkData.metrics = JSON.stringify(checkData.metrics)
    }
    const checksumData = getHashSum256(checkData, this.salt)
    return {
      data: checksumData,
      tcpId: generateUUID(),
      reportStatus: REPORT_STATUS.NOT_REPORT
    }
  }

  bindOptions(options: BrowserOptionsTypes) {
    super.bindOptions(options)
    if (options?.appUserId) {
      return
    }
    const { configReportXhr, appUserId } = options
    toStringValidateOption(configReportXhr, 'configReportXhr', ToStringTypes.Function) && (this.configReportXhr = configReportXhr)
    toStringValidateOption(appUserId || '', 'appUserId', ToStringTypes.String) && (this.appUserId = appUserId || '')
  }
}
