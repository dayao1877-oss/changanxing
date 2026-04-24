import { sjRequireAuth } from '../../utils/sj-common'
import { sjCalculateDrivingDistance, sjCalculateStraightDistance } from '../../utils/sj-map'

export default defineEventHandler(async (event) => {
  try {
    await sjRequireAuth(event)
    const sjQuery = getQuery(event)

    const sjJingdu1 = sjQuery.sj_jingdu1 as string
    const sjWeidu1 = sjQuery.sj_weidu1 as string
    const sjJingdu2 = sjQuery.sj_jingdu2 as string
    const sjWeidu2 = sjQuery.sj_weidu2 as string
    const sjType = (sjQuery.sj_type as string) || 'straight'

    // 必填参数验证
    if (!sjJingdu1 || !sjWeidu1 || !sjJingdu2 || !sjWeidu2) {
      setResponseStatus(event, 400)
      return {
        sj_code: 400,
        sj_message: '起点和终点坐标不能为空',
        sj_error: 'SJ-MAP-001'
      }
    }

    if (sjType === 'driving') {
      // 调用高德地图驾车距离计算
      return await sjCalculateDrivingDistance(sjJingdu1, sjWeidu1, sjJingdu2, sjWeidu2)
    } else {
      // 直线距离计算
      return sjCalculateStraightDistance(
        parseFloat(sjJingdu1),
        parseFloat(sjWeidu1),
        parseFloat(sjJingdu2),
        parseFloat(sjWeidu2)
      )
    }
  } catch (sjError: any) {
    if (sjError.data?.sj_code) {
      return sjError.data
    }
    console.error('距离计算错误:', sjError)
    setResponseStatus(event, 500)
    return {
      sj_code: 500,
      sj_message: '服务器内部错误',
      sj_error: 'SJ-INTERNAL-ERROR'
    }
  }
})
