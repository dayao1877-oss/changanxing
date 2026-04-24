import prisma from '../../../utils/prisma'
import { sjRequireAuth, sjConvertBigInts } from '../../../utils/sj-common'

export default defineEventHandler(async (event) => {
  try {
    await sjRequireAuth(event)
    const { mokuaiName } = event.context.params
    if (!mokuaiName) {
      setResponseStatus(event,400)
      return { sj_code:400, sj_message:'模块名无效', sj_error:'参数错误' }
    }
    const sjCaozuoList = await prisma.sjCaozuoRizhi.findMany({ where: { sj_mokuai: mokuaiName }, orderBy: { sj_shijian: 'desc' } })
    const sjResult = sjCaozuoList.map(item => sjConvertBigInts(item))
    return { sj_code:200, sj_message:'查询成功', sj_data: sjResult }
  } catch (sjError) {
    console.error('sj-caozuo 查询模块错误:', sjError)
    setResponseStatus(event,500)
    return { sj_code:500, sj_message:'服务器内部错误', sj_error: String(sjError) }
  }
})
