import { BaseClient } from '../../core'
import { Breadcrumb } from './core/breadcrumb'
import { SessionBrowser } from './browserSession'
import { TransportQueue } from './transportQueue'
import { EventDataType, AuthInfoType, BrowserOptionsTypes, IAuthData, SessionInfo } from '../../types'
import { BrowserOptions } from './browserOptions'
import { BrowserTransport } from './browserTransport'
import { getDeviceId } from './utils/device'
import { getHashSum256 } from './utils/checksum'
import { API_PATH, CLIENT_NAME, STORAGE_KEY } from './constant/config'
import browserStore from './store'
import { EventTypeEnum } from './enum/event'

export class BrowserClient extends BaseClient<BrowserOptionsTypes> {
  options: BrowserOptions
  eventBreadcrumb: Breadcrumb
  transportQueue: TransportQueue
  transport: BrowserTransport
  session: SessionBrowser
  constructor(options: BrowserOptionsTypes) {
    options.deviceId = getDeviceId(options.appKey) // 生成deviceId。根据deviceId 来去进行上报
    options.channel = CLIENT_NAME
    super(options)
    this.options = new BrowserOptions(options)
    this.eventBreadcrumb = new Breadcrumb(options)
    this.transport = new BrowserTransport(options)
    this.transportQueue = new TransportQueue(this.transport)
    this.session = new SessionBrowser(options)
    this.init()
  }

  init() {
    try {
      this.bindSessionEvent()
      // 在上报之前需要进行认证
      if (this.hasAuthStore()) {
        const authInfoStore = browserStore.getOriginSync(STORAGE_KEY.authInfo + this.options.appKey)
        this.transport.setAuthInfo(authInfoStore)
        this.startSession()
      } else {
        this.auth()
          .then(() => {
            this.startSession()
          })
          .catch((err) => {
            console.error('auth', err)
            // 无论auth 接口是成功还是失败，都要开始心跳的检测
            this.session.startCheck()
          })
      }
    } catch (error) {
      console.error('init', error)
    }
  }

  hasAuthStore() {
    const authInfoStore = browserStore.getOriginSync(STORAGE_KEY.authInfo + this.options.appKey)
    return !!authInfoStore?.device_no
  }

  checkAuthStatus() {
    // 需要认证通过才能进行上报，有可能上报过程中localstroage里面的东西被清除掉
    return this.transport.authInfo
  }

  // 认证
  auth() {
    const authData = {
      app_key: this.options.appKey,
      device_id: this.options.deviceId,
      install_channel: this.options.channel
    }

    // 加盐校验
    const checksumData = getHashSum256(authData, this.options.salt)
    return new Promise((resolve, reject) => {
      const url = this.options.host + API_PATH.auth
      this.transport
        .post(checksumData, url)
        .then((response: IAuthData) => {
          const authInfo: AuthInfoType = {
            device_no: response.device_no,
            create_time: response.create_time,
            install_channel: response.install_channel
          }
          // 对认证的信息进行全局存储，每次都需要去进行获取
          browserStore.setItemSync(STORAGE_KEY.authInfo + this.options.appKey, authInfo)
          this.setAuthInfo(authInfo)
          resolve(response)
        })
        .catch((error) => {
          reject(error)
        })
    })
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
      this.transportQueue.shiftTaskForQueue(reportData, API_PATH.report).then((res: SessionInfo) => {
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
        this.transportQueue.shiftTaskForQueue(reportData, API_PATH.report)
        this.trackEventFocus()
      } else {
        // 如果前面auth接口报错，后面上报的时候，需要重新调auth接口
        this.auth()
          .then(() => {
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
      })
      this.trackEventFocus()
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
      this.transportQueue.shiftTaskForQueue(reportData, API_PATH.report).then((res) => {
        this.eventBreadcrumb.clear()
      })
    }
  }

  /**
   * 手动上报事件
   * @param eventData
   */
  trackEvent(eventData: EventDataType) {
    this.eventBreadcrumb.push(eventData)
    const stackLength = this.eventBreadcrumb?.getStack()?.length || 0
    if (stackLength >= this.eventBreadcrumb.maxBreadcrumbs) {
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

  setUser(userId) {
    if (!userId) {
      return
    }
    browserStore.setItemSync(STORAGE_KEY.appUserId + this.options.appKey, userId)
    this.options.bindOptions({ appUserId: userId })
    this.transport.bindOptions({ appUserId: userId })
  }
}
