import prisma from '../../utils/prisma'
import { sjExtractTokenFromHeader, sjGetGuanliyuanFromToken } from '../../utils/sj-auth'

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

    return {
      sj_code: 200,
      sj_message: '获取成功',
      sj_data: {
        sj_id: sj_guanliyuan.sj_id,
        sj_zhanghao: sj_guanliyuan.sj_zhanghao,
        sj_xingming: sj_guanliyuan.sj_xingming,
        sj_shouji: sj_guanliyuan.sj_shouji,
        sj_zhuangtai: sj_guanliyuan.sj_zhuangtai,
        sj_chuangjian_shijian: sj_guanliyuan.sj_chuangjian_shijian
      }
    }
  } catch (sj_error) {
    console.error('sj-auth me error:', sj_error)
    setResponseStatus(event, 500)
    return {
      sj_code: 500,
      sj_message: '服务器内部错误',
      sj_error: 'SJ_INTERNAL_ERROR'
    }
  }
})
