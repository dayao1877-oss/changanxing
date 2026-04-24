import { sjRequireAuth } from '../../utils/sj-common'
import { sjGeocode } from '../../utils/sj-map'

export default defineEventHandler(async (event) => {
  try {
    await sjRequireAuth(event)
    const sjQuery = getQuery(event)

    const sjAddress = sjQuery.sj_address as string
    const sjCity = sjQuery.sj_city as string

    if (!sjAddress) {
      setResponseStatus(event, 400)
      return {
        sj_code: 400,
        sj_message: '地址不能为空',
        sj_error: 'SJ-MAP-001'
      }
    }

    return await sjGeocode(sjAddress, sjCity)
  } catch (sjError: any) {
    if (sjError.data?.sj_code) {
      return sjError.data
    }
    console.error('地理编码错误:', sjError)
    setResponseStatus(event, 500)
    return {
      sj_code: 500,
      sj_message: '服务器内部错误',
      sj_error: 'SJ-INTERNAL-ERROR'
    }
  }
})
