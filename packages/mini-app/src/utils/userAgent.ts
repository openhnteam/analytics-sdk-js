import { PlatformEnum } from '../constant'

const getIsWechat = () => {
  try {
    return wx && wx.env ? true : false
  } catch (e) {
    return false
  }
}

const getIsAlipay = () => {
  try {
    return my && my.env ? true : false
  } catch (e) {
    return false
  }
}

export const isWechat = getIsWechat()

export const isAlipay = getIsAlipay()

let _platform: string = ''

if (isAlipay) {
  // 优先判断是不是支付宝环境，貌似支付宝能有wx
  _platform = PlatformEnum.ALIPAY
} else {
  _platform = PlatformEnum.WECHAT
}

export const platform = _platform

let global: any

if (platform === PlatformEnum.ALIPAY) {
  global = my
} else if (platform === PlatformEnum.WECHAT) {
  global = wx
}

export const platformGlobal = global
