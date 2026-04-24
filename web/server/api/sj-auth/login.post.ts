import prisma from '../../utils/prisma'
import { sjVerifyPassword, sjGenerateToken } from '../../utils/sj-auth'

export default defineEventHandler(async (event) => {
  try {
    const sj_body = await readBody(event)
    const { sj_zhanghao, sj_mima } = sj_body

    if (!sj_zhanghao || !sj_mima) {
      setResponseStatus(event, 400)
      return {
        sj_code: 400,
        sj_message: '账号和密码不能为空',
        sj_error: 'SJ_AUTH_001'
      }
    }

    const sj_guanliyuan = await prisma.sjGuanliyuan.findUnique({
      where: { sj_zhanghao }
    })

    if (!sj_guanliyuan) {
      setResponseStatus(event, 401)
      return {
        sj_code: 401,
        sj_message: '账号或密码错误',
        sj_error: 'SJ_AUTH_001'
      }
    }

    const sj_password_valid = await sjVerifyPassword(sj_mima, sj_guanliyuan.sj_mima)
    if (!sj_password_valid) {
      setResponseStatus(event, 401)
      return {
        sj_code: 401,
        sj_message: '账号或密码错误',
        sj_error: 'SJ_AUTH_001'
      }
    }

    if (sj_guanliyuan.sj_zhuangtai !== 1) {
      setResponseStatus(event, 403)
      return {
        sj_code: 403,
        sj_message: '账号已被禁用',
        sj_error: 'SJ_AUTH_002'
      }
    }

    const sj_token = sjGenerateToken({
      sj_guanliyuan_id: sj_guanliyuan.sj_id,
      sj_zhanghao: sj_guanliyuan.sj_zhanghao,
      sj_xingming: sj_guanliyuan.sj_xingming,
      sj_zhuangtai: sj_guanliyuan.sj_zhuangtai
    })

    return {
      sj_code: 200,
      sj_message: '登录成功',
      sj_data: {
        sj_token,
        sj_guanliyuan: {
          sj_id: sj_guanliyuan.sj_id,
          sj_zhanghao: sj_guanliyuan.sj_zhanghao,
          sj_xingming: sj_guanliyuan.sj_xingming,
          sj_shouji: sj_guanliyuan.sj_shouji,
          sj_zhuangtai: sj_guanliyuan.sj_zhuangtai
        }
      }
    }
  } catch (sj_error) {
    console.error('sj-auth login error:', sj_error)
    setResponseStatus(event, 500)
    return {
      sj_code: 500,
      sj_message: '服务器内部错误',
      sj_error: 'SJ_INTERNAL_ERROR'
    }
  }
})
