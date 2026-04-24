import prisma from '../../../utils/prisma'
import { sjRequireAuth, sjConvertBigInts } from '../../../utils/sj-common'

export default defineEventHandler(async (event) => {
  try {
    await sjRequireAuth(event)
    const { chengkeId } = event.context.params
    if (!chengkeId || isNaN(Number(chengkeId))) {
      setResponseStatus(event,400)
      return { sj_code: 400, sj_message: '乘客ID无效', sj_error: '参数错误' }
    }
    const sjCaiwuList = await prisma.sjCaiwuJilu.findMany({ where: { sj_chengke_id: Number(chengkeId) }, orderBy: { sj_shijian: 'desc' } })
    const sjResult = sjCaiwuList.map(item => sjConvertBigInts(item))
    return { sj_code: 200, sj_message: '查询成功', sj_data: sjResult }
  } catch (sjError) {
    console.error('sj-caiwu 查询乘客错误:', sjError)
    setResponseStatus(event,500)
    return { sj_code: 500, sj_message: '服务器内部错误', sj_error: String(sjError) }
  }
})
