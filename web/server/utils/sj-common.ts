import prisma from './prisma'
import { sjExtractTokenFromHeader, sjGetGuanliyuanFromToken } from './sj-auth'

/**
 * 通用 BigInt 和 Date 处理函数
 * 将对象中的所有 BigInt 字段转为字符串，Date 转为 ISO 字符串
 */
export function sjConvertBigInts(obj: any): any {
  if (obj === null || obj === undefined) {
    return obj
  }
  if (typeof obj === 'bigint') {
    return obj.toString()
  }
  if (obj instanceof Date) {
    return obj.toISOString()
  }
  if (Array.isArray(obj)) {
    return obj.map(sjConvertBigInts)
  }
  if (typeof obj === 'object') {
    const newObj: any = {}
    for (const key in obj) {
      newObj[key] = sjConvertBigInts(obj[key])
    }
    return newObj
  }
  return obj
}

/**
 * 验证请求是否已认证（管理员认证）
 * @param event H3事件对象
 * @returns 认证通过返回管理员信息，失败抛出错误
 */
export async function sjRequireAuth(event: any) {
  const sj_authorization = getHeader(event, 'authorization')
  const sj_token = sjExtractTokenFromHeader(sj_authorization)
  
  if (!sj_token) {
    setResponseStatus(event, 401)
    throw createError({
      statusCode: 401,
      statusMessage: '未登录',
      data: {
        sj_code: 401,
        sj_message: '未登录',
        sj_error: 'SJ_AUTH_005'
      }
    })
  }

  const sj_guanliyuan = await sjGetGuanliyuanFromToken(sj_token)
  if (!sj_guanliyuan) {
    setResponseStatus(event, 401)
    throw createError({
      statusCode: 401,
      statusMessage: 'Token无效或已过期',
      data: {
        sj_code: 401,
        sj_message: 'Token无效',
        sj_error: 'SJ_AUTH_003'
      }
    })
  }

  return sj_guanliyuan
}
