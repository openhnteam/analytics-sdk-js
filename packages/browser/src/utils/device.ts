import { generateUUID } from '../../../utils'
import { STORAGE_KEY } from '../constant/config'
import browserStore from '../store'

export function getDeviceId(appKey: string): string {
  try {
    let deviceId: string = browserStore.getOriginSync(STORAGE_KEY.deviceId + appKey)
    if (!deviceId) {
      deviceId = generateUUID()
      browserStore.setItemSync(STORAGE_KEY.deviceId + appKey, deviceId)
    }

    // 兼容老代码处理, 老代码deviceId有带冒号
    if (deviceId?.indexOf('"') > -1) {
      deviceId = deviceId.replace(/"/g, '')
      browserStore.setItemSync(STORAGE_KEY.deviceId + appKey, deviceId)
    }

    return deviceId
  } catch (error) {
    const deviceId = generateUUID()
    browserStore.setItemSync(STORAGE_KEY.deviceId + appKey, deviceId)
    return deviceId
  }
}

export function getBrowserName(): string {
  let userAgent = navigator.userAgent
  //微信内置浏览器
  if (userAgent.match(/MicroMessenger/i)) {
    return 'pc'
  }
  //QQ内置浏览器
  else if (userAgent.match(/QQ/i)) {
    return 'pc'
  }
  //Chrome
  else if (userAgent.match(/Chrome/i)) {
    return 'pc'
  }
  //Opera
  else if (userAgent.match(/Opera/i)) {
    return 'pc'
  }
  //Firefox
  else if (userAgent.match(/Firefox/i)) {
    return 'pc'
  }
  //Safari
  else if (userAgent.match(/Safari/i)) {
    return 'pc'
  }
  //android
  else if (userAgent.match(/android/i)) {
    return 'Android'
  }
  //iphone
  else if (userAgent.match(/iphone/i)) {
    return 'iOS'
  }
  //ipad
  else if (userAgent.match(/ipad/i)) {
    return 'iOS'
  }
  //IE
  else if ('ActiveXObject' in window) {
    return 'pc'
  } else {
    return ''
  }
}

export function getBrowserOsVersion() {
  try {
    let NV = {
      name: '',
      version: '',
      shell: ''
    }
    const _window: any = window
    let UA = navigator.userAgent.toLowerCase()
    NV.name = !-[1]
      ? 'ie'
      : UA.indexOf('firefox') > 0
      ? 'firefox'
      : UA.indexOf('chrome') > 0
      ? 'chrome'
      : _window.opera
      ? 'opera'
      : _window.openDatabase
      ? 'safari'
      : 'unkonw'
    NV.version =
      NV.name == 'ie'
        ? UA.match(/msie ([\d.]+)/)[1]
        : NV.name == 'firefox'
        ? UA.match(/firefox\/([\d.]+)/)[1]
        : NV.name == 'chrome'
        ? UA.match(/chrome\/([\d.]+)/)[1]
        : NV.name == 'opera'
        ? UA.match(/opera.([\d.]+)/)[1]
        : NV.name == 'safari'
        ? UA.match(/version\/([\d.]+)/)[1]
        : '0'
    NV.shell =
      UA.indexOf('360ee') > -1
        ? '360Jisu'
        : UA.indexOf('360se') > -1
        ? '360Safe'
        : UA.indexOf('se') > -1
        ? 'Sogou'
        : UA.indexOf('aoyou') > -1
        ? 'Aoyou'
        : UA.indexOf('theworld') > -1
        ? 'Theworld'
        : UA.indexOf('worldchrome') > -1
        ? 'TheworldChrome'
        : UA.indexOf('greenbrowser') > -1
        ? 'Green'
        : UA.indexOf('qq') > -1
        ? 'QQ'
        : UA.indexOf('baidu') > -1
        ? 'Baidu'
        : UA.indexOf('edg') > -1
        ? 'Edge'
        : UA.indexOf('firefox') > -1
        ? 'Firefox'
        : UA.indexOf('opr') > -1
        ? 'Opera'
        : UA.indexOf('chrome') > -1
        ? 'Chrome'
        : 'Nnknown'
    return NV.name + parseInt(NV.version)
  } catch (error) {
    return ''
  }
}
