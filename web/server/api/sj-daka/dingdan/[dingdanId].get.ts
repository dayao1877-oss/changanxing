import prisma from '../../../utils/prisma'
import { sjRequireAuth, sjConvertBigInts } from '../../../utils/sj-common'

export default defineEventHandler(async (event) => {
  try {
    // 1. 身份认证
    await sjRequireAuth(event)

    // 2. 读取路径参数
    const { dingdanId } = event.context.params

    if (!dingdanId || isNaN(Number(dingdanId))) {
      setResponseStatus(event, 400)
      return {
        sj_code: 400,
        sj_message: '订单ID无效',
        sj_error: '参数错误'
      }
    }

    // 3. 查询该订单的所有打卡记录
    const sjDakaList = await prisma.sjDakaJilu.findMany({
      where: { sj_dingdan_id: Number(dingdanId) },
      orderBy: { sj_daka_shijian: 'asc' }
    })

    // 4. 处理BigInt和Date字段
    const sjResult = sjDakaList.map(item => sjConvertBigInts(item))

    return {
      sj_code: 200,
      sj_message: '查询成功',
      sj_data: sjResult
    }
  } catch (sjError) {
    console.error('sj-daka查询订单打卡记录错误:', sjError)
    setResponseStatus(event, 500)
    return {
      sj_code: 500,
      sj_message: '服务器内部错误',
      sj_error: String(sjError)
    }
  }
})
