import prisma from '../../utils/prisma'
import { sjRequireAuth, sjConvertBigInts } from '../../utils/sj-common'

export default defineEventHandler(async (event) => {
  try {
    await sjRequireAuth(event)

    const { id } = event.context.params

    if (!id || isNaN(Number(id))) {
      setResponseStatus(event, 400)
      return {
        sj_code: 400,
        sj_message: '异常记录ID无效',
        sj_error: '参数错误'
      }
    }

    const sjYichang = await prisma.sjYichangShangbao.findUnique({
      where: { sj_id: Number(id) }
    })

    if (!sjYichang) {
      setResponseStatus(event, 404)
      return {
        sj_code: 404,
        sj_message: '异常记录不存在',
        sj_error: '找不到记录'
      }
    }

    const sjResult = sjConvertBigInts(sjYichang)

    return {
      sj_code: 200,
      sj_message: '查询成功',
      sj_data: sjResult
    }
  } catch (sjError) {
    console.error('sj-yichang查询详情错误:', sjError)
    setResponseStatus(event, 500)
    return {
      sj_code: 500,
      sj_message: '服务器内部错误',
      sj_error: String(sjError)
    }
  }
})
