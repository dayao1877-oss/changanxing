import prisma from '../../../utils/prisma'
import { sjRequireAuth } from '../../../utils/sj-common'

export default defineEventHandler(async (event) => {
  try {
    await sjRequireAuth(event)
    const sj_query = getQuery(event)
    const sj_page = parseInt(sj_query.sj_page as string) || 1
    const sj_page_size = parseInt(sj_query.sj_page_size as string) || 10
    const sj_zhuangtai = sj_query.sj_zhuangtai ? parseInt(sj_query.sj_zhuangtai as string) : undefined
    const sj_siji_id = sj_query.sj_siji_id ? parseInt(sj_query.sj_siji_id as string) : undefined
    const sj_keyword = sj_query.sj_keyword as string | undefined

    const sj_skip = (sj_page - 1) * sj_page_size
    const sj_where: any = {}

    if (sj_zhuangtai !== undefined) {
      sj_where.sj_zhuangtai = sj_zhuangtai
    }
    if (sj_siji_id !== undefined) {
      sj_where.sj_siji_id = sj_siji_id
    }
    if (sj_keyword) {
      sj_where.OR = [
        { sj_chepaihao: { contains: sj_keyword } },
        { sj_pinpai: { contains: sj_keyword } },
        { sj_xinghao: { contains: sj_keyword } }
      ]
    }

    const [sj_total, sj_list] = await Promise.all([
      prisma.sjCheliang.count({ where: sj_where }),
      prisma.sjCheliang.findMany({
        where: sj_where,
        skip: sj_skip,
        take: sj_page_size,
        orderBy: { sj_chuangjian_shijian: 'desc' },
        include: { sj_siji: { select: { sj_id: true, sj_xingming: true, sj_shouji: true } } }
      })
    ])

    return {
      sj_code: 200,
      sj_message: '查询成功',
      sj_data: {
        sj_list,
        sj_total,
        sj_page,
        sj_page_size
      }
    }
  } catch (sj_error: any) {
    if (sj_error.data?.sj_code) {
      return sj_error.data
    }
    setResponseStatus(event, 500)
    return { sj_code: 500, sj_message: '服务器内部错误', sj_error: 'SJ-INTERNAL-ERROR' }
  }
})
