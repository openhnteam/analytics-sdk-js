import sha256 from 'crypto-js/sha256'
import { ReportDataType } from '../../../types'
import { qsStringify } from '../../../utils'

export function getHashSum256(data, salt): ReportDataType {
  let dataStr = qsStringify(data)
  dataStr += salt
  const checksum256 = sha256(dataStr).toString()
  return {
    ...data,
    checksum256
  }
}
