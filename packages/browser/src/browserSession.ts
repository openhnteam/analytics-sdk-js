import { SessionDataType } from '../../types'
import { STORAGE_KEY } from './constant/config'
import { getBrowserName, getBrowserOsVersion } from './utils/device'
import { Event } from '../../core'
import browserStore from './store'
import { EventTypeEnum } from './enum/event'
import { SessionInfo } from '../../types'

const baseMetrics = {
  _device: '',
  _os: '',
  _os_version: '',
  _carrier: '',
  _mccmnc: '',
  _resolution: '',
  _density: 'other',
  _locale: '',
  _app_version: '',
  _platform_version: '',
  _store: '',
  _deep_link: '',
  _device_type: 'mobile',
  _channel: '',
  _scene: ''
}

const SESSION_DURATION = 6 // 心跳的秒数

/**
 * 会话类
 *
 * @export
 * @class Session
 */
export class SessionBrowser extends Event {
  duration = SESSION_DURATION
  checkTimer = null
  lastedCheckTime = Date.now()
  sessionId: string = ''
  sessionTime: string = ''
  sessionStartData: SessionDataType
  metrics: {}
  cacheEnd: string
  cacheEndTimer = null

  constructor(options) {
    super()
    this.bindOptions(options)
    this.initSessionStartData()
  }

  initSessionStartData() {
    this.sessionStartData = {
      begin_session: '1',
      metrics: {
        ...baseMetrics
      }
    }
    this.sessionStartData.metrics = {
      ...baseMetrics,
      _device: navigator?.platform || '',
      _os: getBrowserName(),
      _os_version: getBrowserOsVersion(), // 浏览器名称 + 浏览器版本
      _resolution: `${screen?.height}x${screen?.width}`,
      _locale: navigator?.language || '',
      ...this.metrics
    }
    return this.sessionStartData
  }

  /**
   * 会话开始
   * @returns
   */
  start() {
    // 如果有缓存的未上报的endSession, 则先上报。
    const dataCacheEnd = browserStore.getItemSync(this.cacheEnd)
    if (dataCacheEnd && dataCacheEnd?.cache_end) {
      this.emit(EventTypeEnum.END_CACHE, dataCacheEnd)
    }
    this.lastedCheckTime = Date.now()
    this.startCheck()
    this.emit(EventTypeEnum.START, this.sessionStartData)
  }

  /**
   * 手动初始化会话信息sessionId方法，会话请求完毕后需要执行
   * @param info
   */
  initSessionInfo(info: SessionInfo) {
    this.sessionId = info.session_id
    this.sessionTime = info.session_time
    // 初始化cacheEnd
    this.clearCacheEndInfo()
    this.intervalCacheEndInfo()
  }

  /**
   * 结束会话
   * @returns
   */
  end() {
    const sessionEndData: SessionDataType = {
      end_session: '1',
      session_duration: 0,
      session_id: this.sessionId,
      session_time: this.sessionTime
    }
    sessionEndData.session_duration = parseInt(((Date.now() - this.lastedCheckTime) / 1000).toString())
    if (sessionEndData.session_duration > SESSION_DURATION) {
      // 兜底设置session_duration
      sessionEndData.session_duration = SESSION_DURATION
    }
    this.lastedCheckTime = Date.now()
    this.clearCheckTimer()
    this.clearCacheEndInfo()
    this.emit(EventTypeEnum.END, sessionEndData)
  }

  /**
   * 开始心跳检测
   */
  startCheck() {
    this.clearCheckTimer()
    this.intervalCheck()
  }

  intervalCheck() {
    this.checkTimer = setInterval(() => {
      this.check()
    }, this.duration * 1000)
  }

  /**
   * 定时暂存当初会话信息，用于客户端强制关闭时未来得及发送end session时，补传session信息。
   */
  intervalCacheEndInfo() {
    this.cacheEndTimer = setInterval(() => {
      this.cacheEndInfo()
    }, 5 * 1000)
  }

  cacheEndInfo() {
    type checkEndDataType = SessionDataType & { cache_end: string }
    const checkEndData: checkEndDataType = {
      cache_end: '1',
      end_session: '1',
      session_duration: parseInt(((Date.now() - this.lastedCheckTime) / 1000).toString()),
      session_id: this.sessionId,
      session_time: this.sessionTime
    }
    browserStore.setItemSync(this.cacheEnd, checkEndData)
  }

  clearCacheEndInfo() {
    if (this.cacheEndTimer) {
      clearInterval(this.cacheEndTimer)
      this.cacheEndTimer = null
    }
    browserStore.setItemSync(this.cacheEnd, '')
  }

  /**
   * 心跳检测主函数
   */
  check() {
    const sessionCheckData: SessionDataType = {
      session_id: this.sessionId,
      session_time: this.sessionTime,
      session_duration: parseInt(((Date.now() - this.lastedCheckTime) / 1000).toString())
    }
    if (sessionCheckData.session_duration > SESSION_DURATION) {
      // 兜底设置session_duration
      sessionCheckData.session_duration = SESSION_DURATION
    }
    this.lastedCheckTime = Date.now()
    this.emit(EventTypeEnum.CHECK, sessionCheckData)
  }

  clearCheckTimer() {
    if (this.checkTimer) {
      clearInterval(this.checkTimer)
      this.checkTimer = null
    }
  }

  /**
   * 绑定配置
   * @param options
   */
  bindOptions(options): void {
    const { duration, appVersion, appKey } = options
    this.cacheEnd = STORAGE_KEY.cacheEnd + appKey
    this.duration = duration || this.duration
    this.metrics = {
      ...this.metrics,
      _app_version: appVersion
    }
  }
}
