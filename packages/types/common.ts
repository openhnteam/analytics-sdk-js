import { SessionInfo } from '../types'

export type voidFun = () => void

export interface IAnyObject {
  [key: string]: any
}

export type TNumStrObj = number | string | object

export interface ICommonData {
  data: IAnyObject
  success: boolean
}

export interface IAuthData {
  device_no: number
  create_time: string
  install_channel: string
}

export interface BrowserStore {
  getItemSync: (key: string) => IAnyObject
  setItemSync: (key: string, value: IAnyObject | string | number | boolean) => void
  removeItemSync: (key: string) => void
}

export interface GetSystemInfoType {
  success: Function
  complete: Function
}
