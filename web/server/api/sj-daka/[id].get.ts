import prisma from '../../utils/prisma'
import { sjRequireAuth, sjConvertBigInts } from '../../utils/sj-common'

export default defineEventHandler(async (event) => {
  try {
    // 1. 身份认证
    await sjRequireAuth(event)

    // 2. 读取路径参数
    const { id } = event.context.params

    if (!id || isNaN(Number(id))) {
      setResponseStatus(event, 400)
      return {
        sj_code: 400,
        sj_message: '打卡记录ID无效',
        sj_error: '参数错误'
      }
    }

    // 3. 查询打卡记录
    const sjDakaJilu = await prisma.sjDakaJilu.findUnique({
      where: { sj_id: Number(id) }
    })

    if (!sjDakaJilu) {
      setResponseStatus(event, 404)
      return {
        sj_code: 404,
        sj_message: '打卡记录不存在',
        sj_error: '找不到记录'
      }
    }

    // 4. 处理BigInt和Date字段
    const sjResult = sjConvertBigInts(sjDakaJilu)

    return {
      sj_code: 200,
      sj_message: '查询成功',
      sj_data: sjResult
    }
  } catch (sjError) {
    console.error('sj-daka查询打卡详情错误:', sjError)
    setResponseStatus(event, 500)
    return {
      sj_code: 500,
      sj_message: '服务器内部错误',
      sj_error: String(sjError)
    }
  }
})
