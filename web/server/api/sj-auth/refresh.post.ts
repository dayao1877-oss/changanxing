import prisma from '../../utils/prisma'
import { sjExtractTokenFromHeader, sjGetGuanliyuanFromToken, sjGenerateToken } from '../../utils/sj-auth'

export default defineEventHandler(async (event) => {
  try {
    const sj_authorization = getHeader(event, 'authorization')
    const sj_token = sjExtractTokenFromHeader(sj_authorization)

    if (!sj_token) {
      setResponseStatus(event, 401)
      return {
        sj_code: 401,
        sj_message: '未登录',
        sj_error: 'SJ_AUTH_005'
      }
    }

    const sj_guanliyuan = await sjGetGuanliyuanFromToken(sj_token)
    if (!sj_guanliyuan) {
      setResponseStatus(event, 401)
      return {
        sj_code: 401,
        sj_message: 'Token无效',
        sj_error: 'SJ_AUTH_003'
      }
    }

    const sj_new_token = sjGenerateToken({
      sj_guanliyuan_id: sj_guanliyuan.sj_id,
      sj_zhanghao: sj_guanliyuan.sj_zhanghao,
      sj_xingming: sj_guanliyuan.sj_xingming,
      sj_zhuangtai: sj_guanliyuan.sj_zhuangtai
    })

    return {
      sj_code: 200,
      sj_message: '刷新成功',
      sj_data: {
        sj_token: sj_new_token
      }
    }
  } catch (sj_error) {
    console.error('sj-auth refresh error:', sj_error)
    setResponseStatus(event, 500)
    return {
      sj_code: 500,
      sj_message: '服务器内部错误',
      sj_error: 'SJ_INTERNAL_ERROR'
    }
  }
})
