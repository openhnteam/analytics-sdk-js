export interface AuthInfoType {
  device_no: number
  create_time: string
  install_channel: string
  is_new_user?: string
}
export interface SessionInfo {
  session_id: string
  session_time: string
}

export interface TransportDataType {
  data?: ReportDataType
}

export interface BaseReportDataType {
  app_key: string
  sdk_version: string
  sdk_name: string
  device_id: string
  scene?: string
  timestamp: number | string
}

export interface SessionDataType extends Partial<SessionInfo> {
  begin_session?: string
  metrics?: any
  session_duration?: number
  end_session?: string
}

export interface EventDataType {
  key?: string
  segmentation?: string
  timestamp?: number
}

export interface CheckSumDataType {
  checksum256: string
}

export interface ReportDataType extends BaseReportDataType, SessionDataType, CheckSumDataType {
  events?: String
  app_user_id?: string
}
