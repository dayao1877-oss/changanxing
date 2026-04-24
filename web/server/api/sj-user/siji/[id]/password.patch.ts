import prisma from '../../../../utils/prisma'
import { sjEncryptPassword } from '../../../../utils/sj-auth'
import { sjRequireAuth } from '../../../../utils/sj-common'

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

    // 检查司机是否存在
    const sj_exist_siji = await prisma.sjSiji.findUnique({
      where: { sj_id }
    })
    if (!sj_exist_siji) {
      setResponseStatus(event, 404)
      return {
        sj_code: 404,
        sj_message: '司机不存在',
        sj_error: 'SJ_USER_004'
      }
    }

    const sj_body = await readBody(event)
    const { sj_mima } = sj_body

    if (!sj_mima) {
      setResponseStatus(event, 400)
      return {
        sj_code: 400,
        sj_message: '新密码不能为空',
        sj_error: 'SJ_USER_001'
      }
    }

    // 加密新密码
    const sj_hashed_password = await sjEncryptPassword(sj_mima)

    // 更新密码
    await prisma.sjSiji.update({
      where: { sj_id },
      data: { sj_mima: sj_hashed_password }
    })

    return {
      sj_code: 200,
      sj_message: '密码重置成功',
      sj_data: null
    }
  } catch (sj_error: any) {
    console.error('sj-user siji password error:', sj_error)
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
