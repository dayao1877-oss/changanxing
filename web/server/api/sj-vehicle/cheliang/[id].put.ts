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

    const sj_exist = await prisma.sjCheliang.findUnique({ where: { sj_id } })
    if (!sj_exist) {
      setResponseStatus(event, 404)
      return { sj_code: 404, sj_message: '车辆不存在', sj_error: 'SJ-VEHICLE-003' }
    }

    const sj_body = await readBody(event)
    const {
      sj_pinpai,
      sj_xinghao,
      sj_yanse,
      sj_nianfen,
      sj_siji_id,
      sj_beizhu
    } = sj_body

    const sj_cheliang = await prisma.sjCheliang.update({
      where: { sj_id },
      data: {
        sj_pinpai: sj_pinpai !== undefined ? sj_pinpai : sj_exist.sj_pinpai,
        sj_xinghao: sj_xinghao !== undefined ? sj_xinghao : sj_exist.sj_xinghao,
        sj_yanse: sj_yanse !== undefined ? sj_yanse : sj_exist.sj_yanse,
        sj_nianfen: sj_nianfen !== undefined ? sj_nianfen : sj_exist.sj_nianfen,
        sj_siji_id: sj_siji_id !== undefined ? sj_siji_id : sj_exist.sj_siji_id,
        sj_beizhu: sj_beizhu !== undefined ? sj_beizhu : sj_exist.sj_beizhu
      }
    })

    return { sj_code: 200, sj_message: '更新成功', sj_data: sj_cheliang }
  } catch (sj_error: any) {
    if (sj_error.data?.sj_code) {
      return sj_error.data
    }
    setResponseStatus(event, 500)
    return { sj_code: 500, sj_message: '服务器内部错误', sj_error: 'SJ-INTERNAL-ERROR' }
  }
})
