import { generateUUID } from '../../../utils'
import { STORAGE_KEY } from '../constant'
import uniStore from '../store'

export function getDeviceId(): string {
  let deviceId: string = uniStore.getItemSync(STORAGE_KEY.deviceId)
  console.log(deviceId)
  if (!deviceId) {
    deviceId = generateUUID()
    uniStore.setItemSync(STORAGE_KEY.deviceId, deviceId)
  }

  if (deviceId && deviceId.indexOf('"') > -1) {
    // 兼容老代码处理
    deviceId = deviceId.replace(/"/g, '')
    uniStore.setItemSync(STORAGE_KEY.deviceId, deviceId)
  }

  return deviceId
}
