export const CLIENT_NAME = 'Browser'

export const STORE_PREFIX = 'FIRE_BIRD_'

export const STORAGE_KEY = {
  deviceId: `${STORE_PREFIX}DEVICE_ID`,
  appUserId: `${STORE_PREFIX}APP_USER_ID`,
  authInfo: `${STORE_PREFIX}AUTH_INFO`,
  transportQueue: `${STORE_PREFIX}QUEUE`,
  cacheEnd: `${STORE_PREFIX}CACHE_END`,
  eventStack: `${STORE_PREFIX}EVENT_STACK`
}

export const API_PATH = {
  auth: '/app/init',
  report: '/app/i',
  log: '/app/log'
}

/**
 * tcp包上报情况
 */
export const enum REPORT_STATUS {
  NOT_REPORT = 'NOT_REPORT', // 未上报
  REPORTING = 'REPORTING', // 上报中
  REPORT_FAIL = 'REPORT_FAIL',  // 上报失败
}