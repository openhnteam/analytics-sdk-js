// 循环队列实现
export class CircleQueue {
  capacity?: number
  headPoint?: number
  tailPoint?: number
  length?: number
  queue?: any[]
  constructor(capacity) {
    this.capacity = capacity || 50
    this.headPoint = 0
    this.tailPoint = 0
    this.length = 0
    this.queue = []
  }

  clear() {
    this.headPoint = 0
    this.tailPoint = 0
    this.length = 0
    this.queue = []
  }

  destroy() {
    this.queue = null
  }

  push(element: any) {
    if (this.isFull()) return
    this.queue.push(element)
    this.length = this.queue.length
    this.tailPoint = ++this.tailPoint % this.capacity
    return this.length
  }

  unshift(element: any) {
    if (this.isFull()) return
    this.queue.unshift(element)
    this.length = this.queue.length
    this.tailPoint = ++this.tailPoint % this.capacity
    return this.length
  }

  shift() {
    if (this.isEmpty()) return
    this.queue.shift()
    this.length = this.queue.length
    this.headPoint = ++this.headPoint % this.capacity
  }

  deleteForTcpId(tcpId: string) {
    this.queue = this.queue.filter((item) => item.tcpId !== tcpId)
  }

  refreshStatusForTcpId(tcpId: string, status: string) {
    this.queue = this.queue.map((item) => {
      if (item.tcpId === tcpId) {
        item.reportStatus = status
      }
      return item
    })
  }

  deleteIndex(index: number, num: number = 1) {
    if (this.isEmpty()) return
    this.queue.splice(index, num)
    this.length = this.queue.length
    this.headPoint = ++this.headPoint % this.capacity
  }

  isFull(): boolean {
    return this.length === this.capacity
  }

  isEmpty(): boolean {
    return this.length === 0
  }

  travel(cb) {
    // 遍历队列
    for (let i = 0; i < this.length + this.headPoint; i++) {
      cb && cb(this.queue[i % this.capacity])
    }
  }

  getQueue() {
    return this.queue
  }

  setQueue(list: Array<any>) {
    this.queue = [...list]
    this.length = this.queue.length
  }

  loadQueue(queue) {
    this.queue = queue
    this.length = queue.length
    this.headPoint = 0
    this.tailPoint = queue.length % this.capacity
  }
}
