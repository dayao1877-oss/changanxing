import prisma from '../../utils/prisma'
import { sjRequireAuth, sjConvertBigInts } from '../../utils/sj-common'

export default defineEventHandler(async (event) => {
  try {
    await sjRequireAuth(event)
    const query = getQuery(event)
    const { start, end } = query

    if (!start || !end) {
      setResponseStatus(event,400)
      return { sj_code:400, sj_message:'开始和结束时间必填', sj_error:'参数缺失' }
    }

    const sjCaozuoList = await prisma.sjCaozuoRizhi.findMany({
      where: {
        sj_shijian: { gte: new Date(start as string), lte: new Date(end as string) }
      },
      orderBy: { sj_shijian: 'desc' }
    })

    const sjResult = sjCaozuoList.map(item => sjConvertBigInts(item))
    return { sj_code:200, sj_message:'查询成功', sj_data: sjResult }
  } catch (sjError) {
    console.error('sj-caozuo 查询时间段错误:', sjError)
    setResponseStatus(event,500)
    return { sj_code:500, sj_message:'服务器内部错误', sj_error: String(sjError) }
  }
})
