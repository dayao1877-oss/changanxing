import prisma from '../../../utils/prisma'
import { sjRequireAuth } from '../../../utils/sj-common'

export default defineEventHandler(async (event) => {
  try {
    await sjRequireAuth(event)
    const sj_body = await readBody(event)
    const {
      sj_chepaihao,
      sj_pinpai,
      sj_xinghao,
      sj_yanse,
      sj_nianfen,
      sj_zhuangtai = 1,
      sj_siji_id,
      sj_beizhu
    } = sj_body

    if (!sj_chepaihao) {
      setResponseStatus(event, 400)
      return { sj_code: 400, sj_message: '车牌号不能为空', sj_error: 'SJ-VEHICLE-001' }
    }

    const sj_exist = await prisma.sjCheliang.findUnique({
      where: { sj_chepaihao }
    })
    if (sj_exist) {
      setResponseStatus(event, 400)
      return { sj_code: 400, sj_message: '车牌号已存在', sj_error: 'SJ-VEHICLE-002' }
    }

    const sj_cheliang = await prisma.sjCheliang.create({
      data: {
        sj_chepaihao,
        sj_pinpai,
        sj_xinghao,
        sj_yanse,
        sj_nianfen,
        sj_zhuangtai,
        sj_siji_id,
        sj_beizhu
      }
    })

    return {
      sj_code: 200,
      sj_message: '创建成功',
      sj_data: {
        sj_id: sj_cheliang.sj_id,
        sj_chepaihao: sj_cheliang.sj_chepaihao
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
