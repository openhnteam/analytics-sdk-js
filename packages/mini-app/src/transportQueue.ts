import { MiniAppTransport } from './miniAppTransport'
import { CircleQueue, variableTypeDetection } from '../../utils'
import { STORAGE_KEY } from './constant'
import uniStore from './store'
import { REPORT_STATUS } from './enum/event'

export class TransportQueue {
  // 上报队列
  capacity = 50
  circleQueue: CircleQueue
  transport: MiniAppTransport
  flushing = false
  constructor(transport) {
    this.circleQueue = new CircleQueue(this.capacity)
    this.transport = transport

    this.loadStoreQueue()
  }

  deleteTaskForQueue(tcpId: string) {
    this.circleQueue.deleteForTcpId(tcpId)
  }

  shiftTaskForQueue(data, url: string) {
    this.circleQueue.unshift(data)
    return new Promise((resolve, reject) => {
      const tcpId = data.tcpId
      this.circleQueue.refreshStatusForTcpId(tcpId, REPORT_STATUS.REPORTING)
      this.transport
        .send(data, url)
        .then((res) => {
          resolve(res.data)
          this.deleteTaskForQueue(tcpId)
          uniStore.setItemSync(STORAGE_KEY.transportQueue, this.circleQueue.getQueue())
        })
        .catch((e) => {
          this.circleQueue.refreshStatusForTcpId(tcpId, REPORT_STATUS.REPORT_FAIL)
          reject(e)
        })
    }).finally(() => {
      uniStore.setItemSync(STORAGE_KEY.transportQueue, this.circleQueue.getQueue())
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
          uniStore.setItemSync(STORAGE_KEY.transportQueue, this.circleQueue.getQueue())
        })
        .catch(() => {
          this.circleQueue.refreshStatusForTcpId(tcpId, REPORT_STATUS.REPORT_FAIL)
        })
      return data
    })
  }

  loadStoreQueue() {
    let queue = uniStore.getItemSync(STORAGE_KEY.transportQueue) || []
    if (queue && variableTypeDetection.isArray(queue) && queue.length) {
      queue = queue.filter((item) => !!item) // 过滤不为空的队列
      this.circleQueue.loadQueue(queue)
    } else {
      this.circleQueue.clear()
      uniStore.setItemSync(STORAGE_KEY.transportQueue, this.circleQueue.getQueue())
    }
  }

  clearStoreQueue() {
    this.circleQueue.clear()
    uniStore.setItemSync(STORAGE_KEY.transportQueue, this.circleQueue.getQueue())
  }
}
