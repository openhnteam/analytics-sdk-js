export const STORE_SCOPT_PREFIX = 'firebird'
export const STORE_VERSION_PREFIX = `_3.0.2` // 缓存的key手动维护， 避免更新SDK导致devcieId更新，最初上线版本为3.0.2
export const STORE_PREFIX = STORE_SCOPT_PREFIX + STORE_VERSION_PREFIX

export const STORAGE_KEY = {
  deviceId: `${STORE_PREFIX}_device_id`,
  appUserId: `${STORE_PREFIX}_app_user_id`,
  authInfo: `${STORE_PREFIX}_authinfo`,
  transportQueue: `${STORE_PREFIX}_queue`,
  cacheEnd: `${STORE_PREFIX}_cache_end`,
  eventStack: `${STORE_PREFIX}_event_stack`
}

export const STORAGE_KEY_ALIAS = {
  appUserId: `_app_user_id`,
  authInfo: `_authinfo`,
  transportQueue: `_queue`,
  cacheEnd: `_cache_end`,
  eventStack: `_event_stack`
}

export const CLIENT_NAME = 'MiniApp'

export const API_PATH = {
  auth: '/app/init',
  report: '/app/i'
}

export const enum PlatformEnum {
  ALIPAY = 'alipay',
  WECHAT = 'wechat'
}
