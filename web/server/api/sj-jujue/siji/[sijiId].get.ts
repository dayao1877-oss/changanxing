import prisma from '../../../utils/prisma'
import { sjRequireAuth, sjConvertBigInts } from '../../../utils/sj-common'

export default defineEventHandler(async (event) => {
  try {
    await sjRequireAuth(event)

    const { sijiId } = event.context.params
    const query = getQuery(event)
    const chuliZhuangtai = query.chuliZhuangtai

    if (!sijiId || isNaN(Number(sijiId))) {
      setResponseStatus(event, 400)
      return {
        sj_code: 400,
        sj_message: '司机ID无效',
        sj_error: '参数错误'
      }
    }

    const whereCondition: any = { sj_siji_id: Number(sijiId) }
    
    if (chuliZhuangtai !== undefined && chuliZhuangtai !== null) {
      const zhuangtai = Number(chuliZhuangtai)
      if (!isNaN(zhuangtai) && [0, 1].includes(zhuangtai)) {
        whereCondition.sj_chuli_zhuangtai = zhuangtai
      }
    }

    const sjJujueList = await prisma.sjJujueJilu.findMany({
      where: whereCondition,
      orderBy: { sj_shijian: 'desc' }
    })

    const sjResult = sjJujueList.map(item => sjConvertBigInts(item))

    return {
      sj_code: 200,
      sj_message: '查询成功',
      sj_data: sjResult
    }
  } catch (sjError) {
    console.error('sj-jujue查询司机拒绝记录错误:', sjError)
    setResponseStatus(event, 500)
    return {
      sj_code: 500,
      sj_message: '服务器内部错误',
      sj_error: String(sjError)
    }
  }
})
