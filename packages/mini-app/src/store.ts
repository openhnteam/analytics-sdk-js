import { uniExample } from './uniExample'

const storeErrorCallback = (message) => {
  console.error('firebird store error:', message)
}

export const getItemSync = (key): any => {
  try {
    return uniExample?.getStorageSync(key)
  } catch (err) {
    storeErrorCallback(err.message)
    return null
  }
}

export const setItemSync = (key, value): any => {
  try {
    uniExample?.setStorageSync(key, value)
  } catch (err) {
    storeErrorCallback(err.message)
    return null
  }
}

export const removeItemSync = (key): any => {
  try {
    uniExample?.removeStorageSync(key)
  } catch (err) {
    storeErrorCallback(err.message)
  }
}

export const getStorageInfoSync = (key): any => {
  try {
    return uniExample?.getStorageInfoSync(key)
  } catch (err) {
    storeErrorCallback(err.message)
  }
}

export default {
  getItemSync,
  setItemSync,
  removeItemSync,
  getStorageInfoSync
}
