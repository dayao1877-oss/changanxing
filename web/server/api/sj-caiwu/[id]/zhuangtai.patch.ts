import prisma from '../../../utils/prisma'
import { sjRequireAuth, sjConvertBigInts } from '../../../utils/sj-common'

export default defineEventHandler(async (event) => {
  try {
    await sjRequireAuth(event)
    const { id } = event.context.params
    const sjBody = await readBody(event)
    const { sj_zhuangtai, sj_beizhu } = sjBody

    if (!id || isNaN(Number(id))) {
      setResponseStatus(event,400)
      return { sj_code:400, sj_message:'ID无效', sj_error:'参数错误' }
    }

    const sjCaiwu = await prisma.sjCaiwuJilu.findUnique({ where: { sj_id: Number(id) } })
    if (!sjCaiwu) {
      setResponseStatus(event,404)
      return { sj_code:404, sj_message:'财务记录不存在', sj_error:'找不到记录' }
    }

    const updateData:any = {}
    if (sj_zhuangtai) updateData.sj_zhuangtai = sj_zhuangtai
    if (sj_beizhu) updateData.sj_beizhu = sj_beizhu

    const sjUpdated = await prisma.sjCaiwuJilu.update({ where: { sj_id: Number(id) }, data: updateData })
    const sjResult = sjConvertBigInts(sjUpdated)

    return { sj_code:200, sj_message:'更新成功', sj_data: sjResult }
  } catch (sjError) {
    console.error('sj-caiwu 更新错误:', sjError)
    setResponseStatus(event,500)
    return { sj_code:500, sj_message:'服务器内部错误', sj_error: String(sjError) }
  }
})
