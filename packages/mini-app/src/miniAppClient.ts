import { Breadcrumb } from './core/breadcrumb'
import { Session } from './core/session'
import { BaseClient } from '../../core'
import { TransportQueue } from './transportQueue'
import { EventDataType, AuthInfoType, BrowserOptionsTypes } from '../../types'
import { MiniAppOptions } from './miniAppOptions'
import { MiniAppTransport } from './miniAppTransport'
import { MiniAppBreadcrumb } from './miniAppBreadcrumb'
import { MiniAppSession } from './miniAppSession'
import { getHashSum256 } from './utils/checksum'
import { getDeviceId } from './utils/device'
import { API_PATH, CLIENT_NAME } from './constant'
import { STORAGE_KEY } from './constant'
import uniStore from './store'
import { EventTypeEnum } from './enum/event'

declare let uni: any

export class MiniAppClient extends BaseClient<BrowserOptionsTypes> {
  options: MiniAppOptions
  eventBreadcrumb: Breadcrumb
  transportQueue: TransportQueue
  transport: MiniAppTransport
  session: Session
  isPageQueueReporting: boolean = false // 判断page 队列是否正在上报
  isInitSDKSuccess: boolean = false // 判断sdk是否初始化成功

  constructor(options: BrowserOptionsTypes) {
    options['deviceId'] = getDeviceId()
    options.channel = CLIENT_NAME
    super(options)
    this.options = new MiniAppOptions(options)
    this.eventBreadcrumb = new MiniAppBreadcrumb(options)
    this.transport = new MiniAppTransport(options)
    this.transportQueue = new TransportQueue(this.transport)
    this.session = new MiniAppSession(options)
    this.init()
  }

  init() {
    if (this.hasAuthStore()) {
      this.isInitSDKSuccess = true
      const authInfoStore = uniStore.getItemSync(STORAGE_KEY.authInfo)
      this.transport.setAuthInfo(authInfoStore)
      this.bindSessionEvent()
      this.startSession()
    } else {
      // 必须要先认证
      this.auth()
        .then((res: any) => {
          const { success, data } = res
          if (success) {
            this.isInitSDKSuccess = true
            const authInfo: AuthInfoType = {
              device_no: data.device_no,
              create_time: data.create_time,
              install_channel: data.install_channel,
              is_new_user: data.is_new_user
            }
            uniStore.setItemSync(STORAGE_KEY.authInfo, authInfo)
            this.setAuthInfo(authInfo)
            this.bindSessionEvent()
            this.startSession()
          } else {
            this.isInitSDKSuccess = false
          }
        })
        .catch((err) => {
          this.isInitSDKSuccess = false
          console.error('auth fail', err)
        })
    }
  }

  hasAuthStore() {
    const authInfoStore = uniStore.getItemSync(STORAGE_KEY.authInfo)
    return authInfoStore?.device_no
  }

  checkAuthStatus() {
    return this.transport.authInfo
  }

  // 认证
  auth() {
    if (uni) {
      const authData = {
        app_key: this.options.appKey,
        device_id: this.options.deviceId,
        install_channel: this.options.channel
      }

      // 加盐校验
      const checksumData = {
        data: getHashSum256(authData, this.options.salt)
      }
      return new Promise((resolve, reject) => {
        this.transport
          .send(checksumData, API_PATH.auth)
          .then((res) => {
            resolve(res)
          })
          .catch((err) => {
            reject(err)
          })
      })
    }
  }

  setAuthInfo(authInfo: AuthInfoType) {
    this.transport.setAuthInfo(authInfo)
  }

  /**
   * 绑定会话事件
   */
  bindSessionEvent() {
    // 初始化的回调事件
    this.session.on(EventTypeEnum.START, (sessionStartData) => {
      const reportData = this.transport.handleTransportData(sessionStartData)
      this.transportQueue.shiftTaskForQueue(reportData, API_PATH.report).then((res: any) => {
        const sessionInfo = {
          session_id: res.session_id,
          session_time: res.session_time
        }
        this.session.initSessionInfo(sessionInfo)
      })
    })

    // 检查心跳的定时任务回调事件
    this.session.on(EventTypeEnum.CHECK, (sessionData) => {
      const reportData = this.transport.handleTransportData(sessionData)
      if (this.checkAuthStatus()) {
        this.trackEventFocus()
        this.transportQueue.shiftTaskForQueue(reportData, API_PATH.report)
      } else {
        // 如果前面auth接口报错，后面上报的时候，需要重新调auth接口
        this.auth()
          .then(() => {
            this.trackEventFocus()
            this.transportQueue.shiftTaskForQueue(reportData, API_PATH.report)
          })
          .catch((error) => {
            console.error('check', error)
          })
      }
    })

    // end session的定时任务回调事件
    this.session.on(EventTypeEnum.END, (sessionData) => {
      const reportData = this.transport.handleTransportData(sessionData)
      if (this.checkAuthStatus()) {
        this.transportQueue.shiftTaskForQueue(reportData, API_PATH.report).then(() => {
          this.transportQueue.clearStoreQueue() // end session 成功清空缓存队列
          this.session.clearCacheEndInfo()
        })
      }
    })

    // end session的定时任务回调事件
    this.session.on(EventTypeEnum.END_CACHE, (sessionData) => {
      let reportData = this.transport.handleTransportData(sessionData)
      this.transportQueue.shiftTaskForQueue(reportData, API_PATH.report).then(() => {
        this.session.clearCacheEndInfo()
        this.transportQueue.clearStoreQueue() // end session 成功清空缓存队列
        this.trackEventFocus()
      })
    })
  }

  /**
   * 开始会话
   */
  startSession() {
    if (this.checkAuthStatus()) {
      this.session.start()
    }
  }

  /**
   * 结束会话
   */
  endSession() {
    this.trackEventFocus()
    this.session.end()
  }

  trackEventFocus() {
    const stacks = this.eventBreadcrumb.getStack()
    if (stacks.length) {
      const report = {
        events: JSON.stringify(stacks)
      }
      const reportData = this.transport.handleTransportData(report)
      this.transportQueue.shiftTaskForQueue(reportData, API_PATH.report).then(() => {
        this.eventBreadcrumb.clear()
      })
    }
  }

  /**
   * 手动上报事件
   * @param eventData
   */
  trackEvent(eventData: EventDataType) {
    if (!this.isInitSDKSuccess) {
      console.warn('sdk初始化失败')
      return
    }
    if (this.eventBreadcrumb.getStack().length < this.eventBreadcrumb.maxBreadcrumbs - 1) {
      this.eventBreadcrumb.push(eventData)
    } else {
      this.eventBreadcrumb.push(eventData)
      const stacks = this.eventBreadcrumb.getStack()
      const report = {
        events: JSON.stringify(stacks)
      }
      const reportData = this.transport.handleTransportData(report)
      this.transportQueue.shiftTaskForQueue(reportData, API_PATH.report).then(() => {
        this.eventBreadcrumb.clear()
      })
    }
  }

  setUser(userId: string) {
    if (!this.isInitSDKSuccess) {
      console.warn('sdk初始化失败')
      return
    }
    uniStore.setItemSync(STORAGE_KEY.appUserId, userId)
    this.options.bindOptions({ appUserId: userId })
    this.transport.bindOptions({ appUserId: userId })
  }
}
