import { BrowserTransport } from './browserTransport'
import { CircleQueue } from '../../utils'
import { STORAGE_KEY, REPORT_STATUS } from './constant/config'
import browserStore from './store'
import { ICommonData } from '../../types'

export class TransportQueue {
  // 上报队列
  capacity = 50
  circleQueue: CircleQueue
  transport: BrowserTransport

  constructor(transport: BrowserTransport) {
    this.circleQueue = new CircleQueue(this.capacity)
    this.transport = transport
    this.reportHistoricalData()
  }

  /**
   *  上报历史数据
   */
  reportHistoricalData() {
    const storageQueue = JSON.parse(localStorage.getItem(STORAGE_KEY.transportQueue + this.transport.appKey))
    // 将 localStorage 内缓存下来的数据初始化到新的queue上
    if (Array.isArray(storageQueue)) {
      this.circleQueue.setQueue(storageQueue)
    }
  }

  deleteTaskForQueue(tcpId: string) {
    this.circleQueue.deleteForTcpId(tcpId)
  }

  /**
   * @param data
   * @returns
   */
  shiftTaskForQueue(data, url: string) {
    this.circleQueue.unshift(data)
    return new Promise((resolve, reject) => {
      const tcpId = data.tcpId
      this.circleQueue.refreshStatusForTcpId(tcpId, REPORT_STATUS.REPORTING)
      this.transport
        .send(data, url)
        .then((res: ICommonData) => {
          this.deleteTaskForQueue(tcpId)
          resolve(res)
        })
        .catch((e) => {
          this.circleQueue.refreshStatusForTcpId(tcpId, REPORT_STATUS.REPORT_FAIL)
          reject(e)
        })
    }).finally(() => {
      browserStore.setItemSync(STORAGE_KEY.transportQueue + this.transport.appKey, this.circleQueue.getQueue())
      this.clearTaskForQueue(url)
    })
  }

  /**
   * 清空因为网络问题，在发送心跳过程中失败而存留在队列内的任务
   */
  clearTaskForQueue(url: string) {
    const list = this.circleQueue.getQueue() || []
    list.map((data) => {
      if (data.reportStatus === REPORT_STATUS.REPORTING) {
        return data
      }
      const tcpId = data.tcpId
      this.circleQueue.refreshStatusForTcpId(tcpId, REPORT_STATUS.REPORTING)
      this.transport
        .send(data, url)
        .then(() => {
          this.deleteTaskForQueue(tcpId)
          browserStore.setItemSync(STORAGE_KEY.transportQueue + this.transport.appKey, this.circleQueue.getQueue())
        })
        .catch(() => {
          this.circleQueue.refreshStatusForTcpId(tcpId, REPORT_STATUS.REPORT_FAIL)
        })
      return data
    })
  }

  clearStoreQueue() {
    this.circleQueue.clear()
    browserStore.setItemSync(STORAGE_KEY.transportQueue + this.transport.appKey, this.circleQueue.getQueue())
  }
}
