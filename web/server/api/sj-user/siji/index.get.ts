import prisma from '../../../utils/prisma'
import { sjRequireAuth } from '../../../utils/sj-common'

export default defineEventHandler(async (event) => {
  try {
    // 验证认证
    await sjRequireAuth(event)

    // 获取查询参数
    const sj_query = getQuery(event)
    const sj_page = parseInt(sj_query.sj_page as string) || 1
    const sj_page_size = parseInt(sj_query.sj_page_size as string) || 10
    const sj_keyword = sj_query.sj_keyword as string
    const sj_zhuangtai = sj_query.sj_zhuangtai ? parseInt(sj_query.sj_zhuangtai as string) : undefined

    // 计算分页
    const sj_skip = (sj_page - 1) * sj_page_size

    // 构建查询条件
    const sj_where: any = {}
    if (sj_keyword) {
      sj_where.OR = [
        { sj_xingming: { contains: sj_keyword } },
        { sj_shouji: { contains: sj_keyword } },
        { sj_bianhao: { contains: sj_keyword } }
      ]
    }
    if (sj_zhuangtai !== undefined) {
      sj_where.sj_zhuangtai = sj_zhuangtai
    }

    // 查询总数和列表
    const [sj_total, sj_list] = await Promise.all([
      prisma.sjSiji.count({ where: sj_where }),
      prisma.sjSiji.findMany({
        where: sj_where,
        skip: sj_skip,
        take: sj_page_size,
        orderBy: { sj_chuangjian_shijian: 'desc' },
        select: {
          sj_id: true,
          sj_bianhao: true,
          sj_xingming: true,
          sj_shouji: true,
          sj_chepaihao: true,
          sj_zhuangtai: true,
          sj_chuangjian_shijian: true
        }
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
    console.error('sj-user siji list error:', sj_error)
    if (sj_error.data?.sj_code) {
      return sj_error.data
    }
    setResponseStatus(event, 500)
    return {
      sj_code: 500,
      sj_message: '服务器内部错误',
      sj_error: 'SJ_INTERNAL_ERROR'
    }
  }
})
