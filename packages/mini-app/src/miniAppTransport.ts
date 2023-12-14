import { ToStringTypes } from '../../shared'
import { getHashSum256 } from './utils/checksum'
import { toStringValidateOption, qsStringify } from '../../utils'
import { BaseTransport } from '../../core'
import { ReportDataType, BrowserOptionsTypes } from '../../types'
import { uniExample } from './uniExample'
import * as packageJson from '../package.json'
const SDK_VERSION = packageJson?.version || '1.0.0'

export class MiniAppTransport extends BaseTransport<BrowserOptionsTypes> {
  configReportXhr: unknown
  constructor(options: BrowserOptionsTypes) {
    super()
    super.bindOptions(options)
    this.bindOptions(options)
  }

  post(data: any, url: string) {
    return new Promise((resolve, reject) => {
      uniExample?.request({
        url: url,
        data: qsStringify(data),
        header: {
          'Content-Type': 'application/x-www-form-urlencoded'
        },
        method: 'post',
        complete: (res) => {
          resolve(res.data)
        },
        fail: (err) => {
          reject(err)
        }
      })
    })
  }

  sendToServer(data: any, url: string) {
    return this.post(data.data, url)
  }

  // 处理数据格式化, 包括加authInfo, salt, checksum256
  handleTransportData(data: Partial<ReportDataType>) {
    const baseData = this.getBaseData()
    const checkData = {
      ...baseData,
      ...this.authInfo,
      ...data,
      app_user_id: this.appUserId,
      sdk_version: SDK_VERSION,
      sdk_name: 'mini-app'
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
      data: checksumData
    }
  }

  bindOptions(options: BrowserOptionsTypes) {
    super.bindOptions(options)
    const { configReportXhr, appUserId } = options
    toStringValidateOption(configReportXhr, 'configReportXhr', ToStringTypes.Function) && (this.configReportXhr = configReportXhr)
    toStringValidateOption(appUserId, 'appUserId', ToStringTypes.String) && (this.appUserId = appUserId)
  }
}
