import { _global } from './global'

export class Queue {
  // 缓冲请求队列
  private readonly micro: Promise<void>
  private stack: any[] = []
  private isFlushing = false
  constructor() {
    // if (!('Promise' in _global)) return
    this.micro = Promise.resolve()
  }
  addTask(fn: () => void): void {
    if (typeof fn !== 'function') return
    // if (!('Promise' in _global)) {
    //   fn()
    //   return
    // }
    this.stack.push(fn)
    if (!this.isFlushing) {
      this.isFlushing = true
      this.micro.then(() => this.flushStack()) // 放入微任务执行，避免影响主任务
    }
  }
  clear() {
    this.stack = []
  }

  getStack() {
    return this.stack
  }

  flushStack(): void {
    const temp = this.stack.slice(0)
    this.stack.length = 0
    this.isFlushing = false
    for (const fn of temp) {
      fn()
    }
  }
  // rollup queue
}
