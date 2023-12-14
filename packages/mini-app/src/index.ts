import { BrowserOptionsTypes } from '../../types'
import { MiniAppClient } from './miniAppClient'
import { setUniExample } from './uniExample'

let instance = null

const instanceErrorCallback = () => {
  console.warn('未初始化sdk')
}

function createMiniAppInstance(options: BrowserOptionsTypes = {}) {
  try {
    if (instance && instance instanceof MiniAppClient) {
      return instance
    }
    if (options?.uni) {
      setUniExample(options?.uni)
    } else {
      console.warn('sdk依赖 uni 实例，请传入uni实例')
      return
    }
    instance = new MiniAppClient(options)
    return instance
  } catch (error) {
    console.error('createMiniAppInstance error', error)
  }
}

function trackEvent(data) {
  try {
    if (!instance) {
      instanceErrorCallback()
      return
    }
    return instance.trackEvent(data)
  } catch (error) {
    console.error('trackEvent error', error)
  }
}

function setUser(userId) {
  try {
    if (!instance) {
      instanceErrorCallback()
      return
    }
    return instance.setUser(userId)
  } catch (error) {
    console.error('setUser error', error)
  }
}

function endSession() {
  try {
    if (!instance) {
      instanceErrorCallback()
      return
    }

    return instance.endSession()
  } catch (error) {
    console.error('endSession error', error)
  }
}

function startSession() {
  try {
    if (!instance) {
      instanceErrorCallback()
      return
    }

    return instance.startSession()
  } catch (error) {
    console.error('startSession error', error)
  }
}

export default {
  init: createMiniAppInstance,
  MiniAppClient,
  trackEvent,
  setUser,
  endSession,
  startSession
}
