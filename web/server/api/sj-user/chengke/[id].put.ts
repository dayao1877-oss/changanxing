import prisma from '../../../utils/prisma'
import { sjRequireAuth } from '../../../utils/sj-common'

export default defineEventHandler(async (event) => {
  try {
    // 验证认证
    await sjRequireAuth(event)

    // 获取ID
    const sj_id = parseInt(event.context.params!.id)
    if (isNaN(sj_id)) {
      setResponseStatus(event, 400)
      return {
        sj_code: 400,
        sj_message: '无效的ID',
        sj_error: 'SJ_USER_001'
      }
    }

    // 检查乘客是否存在
    const sj_exist_chengke = await prisma.sjChengke.findUnique({
      where: { sj_id }
    })
    if (!sj_exist_chengke) {
      setResponseStatus(event, 404)
      return {
        sj_code: 404,
        sj_message: '乘客不存在',
        sj_error: 'SJ_USER_004'
      }
    }

    const sj_body = await readBody(event)
    const { sj_xingming, sj_gongsi_mingcheng, sj_beizhu } = sj_body

    // 更新乘客信息
    const sj_chengke = await prisma.sjChengke.update({
      where: { sj_id },
      data: {
        sj_xingming: sj_xingming || sj_exist_chengke.sj_xingming,
        sj_gongsi_mingcheng: sj_gongsi_mingcheng !== undefined ? sj_gongsi_mingcheng : sj_exist_chengke.sj_gongsi_mingcheng,
        sj_beizhu: sj_beizhu !== undefined ? sj_beizhu : sj_exist_chengke.sj_beizhu
      }
    })

    return {
      sj_code: 200,
      sj_message: '更新成功',
      sj_data: sj_chengke
    }
  } catch (sj_error: any) {
    console.error('sj-user chengke update error:', sj_error)
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
