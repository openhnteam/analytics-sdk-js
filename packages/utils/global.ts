import { EventTypes } from '../shared'
import { Logger } from './logger'
import { variableTypeDetection } from './is'

declare let my: any // TODO: 引入.d.ts

/**
 *FIREBIRD的全局变量
 *
 * @export
 * @interface FirebirdSupport
 */
export interface FirebirdSupport {
  logger: Logger
  replaceFlag: { [key in EventTypes]?: boolean }
  record?: any[]
  // deviceInfo?: DeviceInfo
}

interface FIREBIRDGlobal {
  console?: Console
  __FIREBIRD__?: FirebirdSupport
}

export const isNodeEnv = variableTypeDetection.isProcess(typeof process !== 'undefined' ? process : 0)

export const isWxMiniEnv =
  variableTypeDetection.isObject(typeof wx !== 'undefined' ? wx : 0) &&
  variableTypeDetection.isFunction(typeof App !== 'undefined' ? App : 0)

export const isAlipayMiniEnv =
  variableTypeDetection.isObject(typeof my !== 'undefined' ? my : 0) &&
  variableTypeDetection.isFunction(typeof App !== 'undefined' ? App : 0)

export const isBrowserEnv = variableTypeDetection.isWindow(typeof window !== 'undefined' ? window : 0)
/**
 * 获取全局变量
 *
 * ../returns Global scope object
 */
export function getGlobal<T>() {
  if (isBrowserEnv) return window as unknown as FIREBIRDGlobal & T
  if (isWxMiniEnv) return wx as unknown as FIREBIRDGlobal & T
  if (isAlipayMiniEnv) return my as unknown as FIREBIRDGlobal & T
  // it's true when run e2e
  if (isNodeEnv) return process as unknown as FIREBIRDGlobal & T
}
// whether it is right use &
const _global = getGlobal<Window & WechatMiniprogram.Wx>()
const _support = getGlobalFirebirdSupport()
/**
 * 获取全局变量__FIREBIRD__的引用地址
 *
 * @return {*}  {FirebirdSupport}
 */
function getGlobalFirebirdSupport(): FirebirdSupport {
  _global.__FIREBIRD__ = _global.__FIREBIRD__ || ({} as FirebirdSupport)
  return _global.__FIREBIRD__
}

export { _global, _support }
