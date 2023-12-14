import { BrowserEventTypes } from './browser'
import { WxEventTypes } from './wx'

/**
 * 所有重写事件类型整合
 */
export type EventTypes = BrowserEventTypes | WxEventTypes | BaseEventTypes

export const FirebirdLog = 'Firebird.log'
export const FirebirdLogEmptyMsg = 'empty.msg'
export const FirebirdLogEmptyTag = 'empty.tag'

export const enum BaseEventTypes {
  VUE = 'vue'
}

export const enum HttpTypes {
  XHR = 'xhr',
  FETCH = 'fetch'
}

export const enum MethodTypes {
  Get = 'GET',
  Post = 'POST',
  Put = 'PUT',
  Delete = 'DELETE'
}

export const enum HTTP_CODE {
  BAD_REQUEST = 400,
  UNAUTHORIZED = 401,
  INTERNAL_EXCEPTION = 500
}

export const enum ToStringTypes {
  String = 'String',
  Number = 'Number',
  Boolean = 'Boolean',
  RegExp = 'RegExp',
  Null = 'Null',
  Undefined = 'Undefined',
  Symbol = 'Symbol',
  Object = 'Object',
  Array = 'Array',
  process = 'process',
  Window = 'Window',
  Function = 'Function'
}

export const ERROR_TYPE_RE = /^(?:[Uu]ncaught (?:exception: )?)?(?:((?:Eval|Internal|Range|Reference|Syntax|Type|URI|)Error): )?(.*)$/
const globalVar = {
  isLogAddBreadcrumb: true,
  crossOriginThreshold: 1000
}

export const Silent = 'silent'
export { globalVar }
