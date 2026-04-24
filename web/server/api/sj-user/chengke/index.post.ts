import prisma from '../../../utils/prisma'
import { sjRequireAuth } from '../../../utils/sj-common'

export default defineEventHandler(async (event) => {
  try {
    // 验证认证
    await sjRequireAuth(event)

    const sj_body = await readBody(event)
    const { sj_xingming, sj_shouji, sj_gongsi_mingcheng, sj_beizhu } = sj_body

    // 参数验证
    if (!sj_xingming || !sj_shouji) {
      setResponseStatus(event, 400)
      return {
        sj_code: 400,
        sj_message: '姓名和手机号不能为空',
        sj_error: 'SJ_USER_001'
      }
    }

    // 创建乘客
    const sj_chengke = await prisma.sjChengke.create({
      data: {
        sj_xingming,
        sj_shouji,
        sj_gongsi_mingcheng: sj_gongsi_mingcheng || null,
        sj_beizhu: sj_beizhu || null
      }
    })

    return {
      sj_code: 200,
      sj_message: '创建成功',
      sj_data: sj_chengke
    }
  } catch (sj_error: any) {
    console.error('sj-user chengke create error:', sj_error)
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
