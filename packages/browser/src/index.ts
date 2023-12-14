import { BrowserOptionsTypes } from '../../types'
import { BrowserClient } from './browserClient'
import { isEmpty } from '../../utils'

let instance = null

function createBrowserInstance(options: BrowserOptionsTypes = {}) {
  try {
    if (instance && instance instanceof BrowserClient) {
      return instance
    }
    if (isEmpty(options?.appKey) || isEmpty(options?.salt)) {
      return console.warn('appKey & salt is empty')
    }
    instance = new BrowserClient(options)
    return instance
  } catch (error) {
    console.error('init is error', error)
  }
}

function trackEvent(data) {
  try {
    if (!instance) {
      console.warn('browser no a instance')
      return
    }
    return instance.trackEvent(data)
  } catch (error) {
    console.error('trackEvent is error', error)
  }
}

function setUser(userId: string) {
  try {
    if (!instance) {
      console.warn('browser no a instance')
      return
    }
    return instance.setUser(userId)
  } catch (error) {
    console.error('setUser is error', error)
  }
}

function startSession() {
  try {
    if (!instance) {
      console.warn('browser no a instance')
      return
    }
    return instance.startSession()
  } catch (error) {
    console.error('endSession is error', error)
  }
}

function endSession() {
  try {
    if (!instance) {
      console.warn('browser no a instance')
      return
    }
    return instance.endSession()
  } catch (error) {
    console.error('endSession is error', error)
  }
}

const defaultProvider = {
  init: createBrowserInstance,
  trackEvent,
  setUser,
  endSession,
  startSession
}

export default defaultProvider
