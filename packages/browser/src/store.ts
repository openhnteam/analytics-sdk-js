export const getItemSync = (key, expectReturnType = 'object') => {
  const defaultExpectValue = {
    object: '{}',
    string: '""',
    array: '[]'
  }
  const value = localStorage.getItem(key) || defaultExpectValue[expectReturnType]
  try {
    return JSON.parse(value)
  } catch (err) {
    console.error('getItemSync', err)
    return null
  }
}

/**
 * 兼容老数据逻辑：老数据使用的key，现在需要根据appkey进行数据隔离，但是不希望重新生成新的用户数据
 * @param key
 * @param originKey
 * @returns
 */
export const getOriginSync = (key: string) => {
  try {
    let val = localStorage.getItem(key)
    return JSON.parse(val)
  } catch (err) {
    console.error('getOriginSync', err)
    return null
  }
}

export const setItemSync = (key, value) => {
  try {
    localStorage.setItem(key, JSON.stringify(value))
    return value
  } catch (err) {
    console.error('setItemSync', err)
    return null
  }
}

export const removeItemSync = (key) => {
  try {
    localStorage.removeItem(key)
  } catch (err) {
    console.error('removeItemSync', err)
  }
}

export default {
  getItemSync,
  setItemSync,
  removeItemSync,
  getOriginSync
}
