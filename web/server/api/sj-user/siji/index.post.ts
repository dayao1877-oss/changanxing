import prisma from '../../../utils/prisma'
import { sjEncryptPassword } from '../../../utils/sj-auth'
import { sjRequireAuth } from '../../../utils/sj-common'

export default defineEventHandler(async (event) => {
  try {
    // 验证认证
    await sjRequireAuth(event)

    const sj_body = await readBody(event)
    const {
      sj_bianhao,
      sj_xingming,
      sj_shouji,
      sj_mima,
      sj_shenfenzheng,
      sj_chepaihao,
      sj_ruzhi_shijian,
      sj_beizhu
    } = sj_body

    // 参数验证
    if (!sj_bianhao || !sj_xingming || !sj_shouji || !sj_mima) {
      setResponseStatus(event, 400)
      return {
        sj_code: 400,
        sj_message: '司机编号、姓名、手机号和密码不能为空',
        sj_error: 'SJ_USER_001'
      }
    }

    // 检查司机编号是否已存在
    const sj_exist_bianhao = await prisma.sjSiji.findUnique({
      where: { sj_bianhao }
    })
    if (sj_exist_bianhao) {
      setResponseStatus(event, 400)
      return {
        sj_code: 400,
        sj_message: '司机编号已存在',
        sj_error: 'SJ_USER_002'
      }
    }

    // 检查手机号是否已存在
    const sj_exist_shouji = await prisma.sjSiji.findUnique({
      where: { sj_shouji }
    })
    if (sj_exist_shouji) {
      setResponseStatus(event, 400)
      return {
        sj_code: 400,
        sj_message: '手机号已存在',
        sj_error: 'SJ_USER_003'
      }
    }

    // 加密密码
    const sj_hashed_password = await sjEncryptPassword(sj_mima)

    // 创建司机
    const sj_siji = await prisma.sjSiji.create({
      data: {
        sj_bianhao,
        sj_xingming,
        sj_shouji,
        sj_mima: sj_hashed_password,
        sj_shenfenzheng: sj_shenfenzheng || null,
        sj_chepaihao: sj_chepaihao || null,
        sj_zhuangtai: 1,
        sj_ruzhi_shijian: sj_ruzhi_shijian ? new Date(sj_ruzhi_shijian) : null,
        sj_beizhu: sj_beizhu || null
      }
    })

    return {
      sj_code: 200,
      sj_message: '创建成功',
      sj_data: {
        sj_id: sj_siji.sj_id,
        sj_bianhao: sj_siji.sj_bianhao,
        sj_xingming: sj_siji.sj_xingming,
        sj_shouji: sj_siji.sj_shouji
      }
    }
  } catch (sj_error: any) {
    console.error('sj-user siji create error:', sj_error)
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
