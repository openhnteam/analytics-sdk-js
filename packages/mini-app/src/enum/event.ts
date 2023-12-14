export const enum EventTypeEnum {
  START = 'start',
  CHECK = 'check',
  END = 'end',
  END_CACHE = 'endCache'
}

/**
 * tcp包上报情况
 */
export const enum REPORT_STATUS {
  NOT_REPORT = 'NOT_REPORT', // 未上报
  REPORTING = 'REPORTING', // 上报中
  REPORT_FAIL = 'REPORT_FAIL' // 上报失败
}
