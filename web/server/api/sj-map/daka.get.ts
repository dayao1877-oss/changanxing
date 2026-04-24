import prisma from '../../utils/prisma'
import { sjRequireAuth } from '../../utils/sj-common'

export default defineEventHandler(async (event) => {
  try {
    await sjRequireAuth(event)
    const sjQuery = getQuery(event)

    const sjSijiId = sjQuery.sj_siji_id ? parseInt(sjQuery.sj_siji_id as string) : undefined
    const sjDingdanId = sjQuery.sj_dingdan_id ? parseInt(sjQuery.sj_dingdan_id as string) : undefined
    const sjPage = parseInt(sjQuery.sj_page as string) || 1
    const sjPageSize = parseInt(sjQuery.sj_page_size as string) || 20

    const sjSkip = (sjPage - 1) * sjPageSize
    const sjWhere: any = {}

    if (sjSijiId !== undefined) {
      sjWhere.sj_siji_id = sjSijiId
    }
    if (sjDingdanId !== undefined) {
      sjWhere.sj_dingdan_id = sjDingdanId
    }

    const [sjTotal, sjList] = await Promise.all([
      prisma.sjDakaJilu.count({ where: sjWhere }),
      prisma.sjDakaJilu.findMany({
        where: sjWhere,
        skip: sjSkip,
        take: sjPageSize,
        orderBy: { sj_daka_shijian: 'desc' },
        include: {
          sj_siji: {
            select: { sj_id: true, sj_xingming: true, sj_shouji: true }
          }
        }
      })
    ])

    return {
      sj_code: 200,
      sj_message: '查询成功',
      sj_data: {
        sj_list: sjList,
        sj_total: sjTotal,
        sj_page: sjPage,
        sj_page_size: sjPageSize
      }
    }
  } catch (sjError: any) {
    if (sjError.data?.sj_code) {
      return sjError.data
    }
    console.error('查询打卡记录错误:', sjError)
    setResponseStatus(event, 500)
    return {
      sj_code: 500,
      sj_message: '服务器内部错误',
      sj_error: 'SJ-INTERNAL-ERROR'
    }
  }
})
