import { sjRequireAuth } from '../../utils/sj-common'
import { sjReverseGeocode } from '../../utils/sj-map'

export default defineEventHandler(async (event) => {
  try {
    await sjRequireAuth(event)
    const sjQuery = getQuery(event)

    const sjJingdu = sjQuery.sj_jingdu as string
    const sjWeidu = sjQuery.sj_weidu as string

    if (!sjJingdu || !sjWeidu) {
      setResponseStatus(event, 400)
      return {
        sj_code: 400,
        sj_message: '经纬度不能为空',
        sj_error: 'SJ-MAP-001'
      }
    }

    return await sjReverseGeocode(sjJingdu, sjWeidu)
  } catch (sjError: any) {
    if (sjError.data?.sj_code) {
      return sjError.data
    }
    console.error('逆地理编码错误:', sjError)
    setResponseStatus(event, 500)
    return {
      sj_code: 500,
      sj_message: '服务器内部错误',
      sj_error: 'SJ-INTERNAL-ERROR'
    }
  }
})
