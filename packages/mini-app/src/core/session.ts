import { SessionDataType, SessionInfo, GetSystemInfoType } from '../../../types'
import { STORAGE_KEY } from '../constant'
import { Event } from '../../../core'
import { EventTypeEnum } from '../enum/event'

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

/**
 * 会话类
 *
 * @export
 * @class Session
 */
export abstract class Session extends Event {
  duration = 25
  transport = null
  checkTimer = null
  lastedCheckTime = Date.now()
  sessionId = ''
  sessionTime = ''
  sessionStartData: SessionDataType
  metrics: {}
  started = false
  cacheEndTimer = null
  cacheEndHolder = false

  abstract storeSetItemSync(stackKey: string, stack: any)
  abstract storeGetItemSync(stackKey: string): any

  abstract getSystemInfo(systemInfoOptions: GetSystemInfoType)
  constructor(options) {
    super()
    this.bindOptions(options)
  }

  /**
   * 会话开始
   * @returns
   */
  start() {
    if (this.started) {
      return
    }
    this.started = true
    // 如果有缓存的未上报的endSession, 则先上报。
    const dataCacheEnd = this.storeGetItemSync(STORAGE_KEY.cacheEnd)
    if (dataCacheEnd && dataCacheEnd.cache_end) {
      this.cacheEndHolder = true
      this.emit(EventTypeEnum.END_CACHE, dataCacheEnd)
    }
    this.sessionStartData = {
      begin_session: '1',
      metrics: baseMetrics
    }
    this.getSystemInfo({
      success: (systemInfo) => {
        if (!systemInfo) return
        this.sessionStartData.metrics = {
          ...baseMetrics,
          _device: systemInfo.model,
          _os: systemInfo.platform,
          _os_version: systemInfo.system,
          _resolution: systemInfo.screen
            ? `${systemInfo.screen.height}x${systemInfo.screen.width}`
            : `${systemInfo.screenHeight}x${systemInfo.screenWidth}`,
          _locale: systemInfo.language,
          _platform_version: systemInfo.version,
          _channel: systemInfo.app,
          ...this.metrics
        }
      },
      complete: () => {
        // 不管metrics是否获取成功都开始会话，避免堵塞
        this.lastedCheckTime = Date.now()
        this.startCheck()
        this.emit(EventTypeEnum.START, this.sessionStartData)
      }
    })
  }

  /**
   * 手动初始化会话信息sessionId方法，会话请求完毕后需要执行
   * @param info
   */
  initSessionInfo(info) {
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
    if (!this.started) {
      return
    }
    const sessionEndData: SessionDataType = {
      end_session: '1',
      session_duration: 0
    }
    sessionEndData.session_duration = parseInt(((Date.now() - this.lastedCheckTime) / 1000).toString())
    if (sessionEndData.session_duration > 25) {
      // 兜底设置session_duration
      sessionEndData.session_duration = 25
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
   * 心跳检测主函数
   */
  check() {
    const sessionCheckData: SessionDataType = {
      session_id: this.sessionId,
      session_time: this.sessionTime,
      session_duration: parseInt(((Date.now() - this.lastedCheckTime) / 1000).toString())
    }

    if (parseInt(`${sessionCheckData.session_duration}`) > 25) {
      // 兜底设置session_duration
      sessionCheckData.session_duration = 25
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
   * 定时暂存当初会话信息，用于客户端强制关闭时未来得及发送end session时，补传session信息。
   */
  intervalCacheEndInfo() {
    this.cacheEndTimer = setInterval(() => {
      this.cacheEndInfo()
    }, 5 * 1000)
  }

  cacheEndInfo() {
    type checkEndDataType = SessionInfo & SessionDataType & { cache_end: string }
    const checkEndData: checkEndDataType = {
      cache_end: '1',
      end_session: '1',
      session_duration: parseInt(((Date.now() - this.lastedCheckTime) / 1000).toString()),
      session_id: this.sessionId,
      session_time: this.sessionTime
    }
    this.storeSetItemSync(STORAGE_KEY.cacheEnd, checkEndData)
  }

  clearCacheEndInfo() {
    if (this.cacheEndTimer) {
      clearInterval(this.cacheEndTimer)
      this.cacheEndTimer = null
    }
    this.storeSetItemSync(STORAGE_KEY.cacheEnd, '')
  }

  clearCacheEndHolder() {
    this.cacheEndHolder = false
  }

  /**
   * 绑定配置
   * @param options
   */
  bindOptions(options): void {
    const { duration, appVersion } = options
    this.duration = duration || this.duration
    this.metrics = {
      ...this.metrics,
      _app_version: appVersion
    }
  }
}
