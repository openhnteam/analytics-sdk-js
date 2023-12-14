
import { variableTypeDetection } from './is'

export function sortObjByKey<T = object>(obj: T): T {
  return Object.keys(obj)
    .sort()
    .reduce((total, key) => {
      if (variableTypeDetection.isObject(obj[key])) {
        total[key] = sortObjByKey(obj[key])
      } else {
        total[key] = obj[key]
      }
      return total
    }, {}) as T
}

/**
 * sort object keys
 * ../param reason promise.reject
 */
export function stringToObjAndOrder(reason: string) {
  try {
    if (/\{.*\}/.test(reason)) {
      let obj = JSON.parse(reason)
      obj = sortObjByKey(obj)
      return JSON.stringify(obj)
    }
    return reason
  } catch (error) {
    return reason
  }
}

/**
 *
 * 获取去掉query后的地主
 * @export
 * @param {string} url 地址
 * @return {*}  {string}
 * @example http://.../project?id=1#a => http://.../project  http://.../id/123=> http://.../id/{param}
 */
export function getRealPath(url: string): string {
  return url
    .replace(/[?#].*$/, '')
    .replace(/\/(\d+)\//g, '/{param}/$1')
    .replace(/\/\d+([/]*$)/g, '/{param}$1')
}

/**
 *
 * @param url
 */
export function getFlutterRealOrigin(url: string): string {
  // for apple
  return removeHashPath(getFlutterRealPath(url))
}

/**
 * 获取flutter的原始地址：每个用户的文件夹hash不同
 * @param url
 */
export function getFlutterRealPath(url: string): string {
  // for apple
  return url.replace(/(\S+)(\/Documents\/)(\S*)/, `$3`)
}

export function removeHashPath(url: string): string {
  return url.replace(/(\S+)(\/#\/)(\S*)/, `$1`)
}

/**
 * 根据字符串生成hashcode
 *
 * @export
 * @param {string} str
 * @return {*}  {number} 可为正数和负数
 */
export function hashCode(str: string): number {
  let hash = 0
  if (str.length == 0) return hash
  for (let i = 0; i < str.length; i++) {
    const char = str.charCodeAt(i)
    hash = (hash << 5) - hash + char
    hash = hash & hash
  }
  return hash
}
