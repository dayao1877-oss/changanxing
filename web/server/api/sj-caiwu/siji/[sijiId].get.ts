import prisma from '../../../utils/prisma'
import { sjRequireAuth, sjConvertBigInts } from '../../../utils/sj-common'

export default defineEventHandler(async (event) => {
  try {
    await sjRequireAuth(event)
    const { sijiId } = event.context.params
    if (!sijiId || isNaN(Number(sijiId))) {
      setResponseStatus(event,400)
      return { sj_code: 400, sj_message: '司机ID无效', sj_error: '参数错误' }
    }
    const sjCaiwuList = await prisma.sjCaiwuJilu.findMany({ where: { sj_siji_id: Number(sijiId) }, orderBy: { sj_shijian: 'desc' } })
    const sjResult = sjCaiwuList.map(item => sjConvertBigInts(item))
    return { sj_code:200, sj_message:'查询成功', sj_data: sjResult }
  } catch (sjError) {
    console.error('sj-caiwu 查询司机错误:', sjError)
    setResponseStatus(event,500)
    return { sj_code:500, sj_message:'服务器内部错误', sj_error:String(sjError) }
  }
})
