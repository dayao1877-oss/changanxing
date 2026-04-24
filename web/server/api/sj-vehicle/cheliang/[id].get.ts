import prisma from '../../../utils/prisma'
import { sjRequireAuth } from '../../../utils/sj-common'

export default defineEventHandler(async (event) => {
  try {
    await sjRequireAuth(event)
    const sj_id = parseInt(event.context.params!.id)
    if (isNaN(sj_id)) {
      setResponseStatus(event, 400)
      return { sj_code: 400, sj_message: '无效的ID', sj_error: 'SJ-VEHICLE-001' }
    }

    const sj_cheliang = await prisma.sjCheliang.findUnique({
      where: { sj_id },
      include: { sj_siji: { select: { sj_id: true, sj_xingming: true, sj_shouji: true } } }
    })

    if (!sj_cheliang) {
      setResponseStatus(event, 404)
      return { sj_code: 404, sj_message: '车辆不存在', sj_error: 'SJ-VEHICLE-003' }
    }

    return { sj_code: 200, sj_message: '查询成功', sj_data: sj_cheliang }
  } catch (sj_error: any) {
    if (sj_error.data?.sj_code) {
      return sj_error.data
    }
    setResponseStatus(event, 500)
    return { sj_code: 500, sj_message: '服务器内部错误', sj_error: 'SJ-INTERNAL-ERROR' }
  }
})
