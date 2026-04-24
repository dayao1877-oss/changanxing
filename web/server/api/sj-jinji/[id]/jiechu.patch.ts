import prisma from '../../../utils/prisma'
import { sjRequireAuth, sjConvertBigInts } from '../../../utils/sj-common'

export default defineEventHandler(async (event) => {
  try {
    await sjRequireAuth(event)

    const { id } = event.context.params
    const sjBody = await readBody(event)
    const { sj_jiechu_fangshi, sj_beizhu } = sjBody

    if (!id || isNaN(Number(id))) {
      setResponseStatus(event, 400)
      return {
        sj_code: 400,
        sj_message: '紧急事件ID无效',
        sj_error: '参数错误'
      }
    }

    const sjJinji = await prisma.sjJinjiShijian.findUnique({
      where: { sj_id: Number(id) }
    })

    if (!sjJinji) {
      setResponseStatus(event, 404)
      return {
        sj_code: 404,
        sj_message: '紧急事件不存在',
        sj_error: '找不到记录'
      }
    }

    const updateData: any = {
      sj_jiechu_shijian: new Date()
    }

    if (sj_jiechu_fangshi !== undefined) {
      updateData.sj_jiechu_fangshi = sj_jiechu_fangshi
    }

    if (sj_beizhu !== undefined) {
      updateData.sj_beizhu = sj_beizhu
    }

    const sjUpdated = await prisma.sjJinjiShijian.update({
      where: { sj_id: Number(id) },
      data: updateData
    })

    const sjResult = sjConvertBigInts(sjUpdated)

    return {
      sj_code: 200,
      sj_message: '解除成功',
      sj_data: sjResult
    }
  } catch (sjError) {
    console.error('sj-jinji解除紧急事件错误:', sjError)
    setResponseStatus(event, 500)
    return {
      sj_code: 500,
      sj_message: '服务器内部错误',
      sj_error: String(sjError)
    }
  }
})
