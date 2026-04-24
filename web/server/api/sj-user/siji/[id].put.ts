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
    const {
      sj_xingming,
      sj_shenfenzheng,
      sj_chepaihao,
      sj_ruzhi_shijian,
      sj_beizhu
    } = sj_body

    // 更新司机信息
    const sj_siji = await prisma.sjSiji.update({
      where: { sj_id },
      data: {
        sj_xingming: sj_xingming || sj_exist_siji.sj_xingming,
        sj_shenfenzheng: sj_shenfenzheng !== undefined ? sj_shenfenzheng : sj_exist_siji.sj_shenfenzheng,
        sj_chepaihao: sj_chepaihao !== undefined ? sj_chepaihao : sj_exist_siji.sj_chepaihao,
        sj_ruzhi_shijian: sj_ruzhi_shijian ? new Date(sj_ruzhi_shijian) : sj_exist_siji.sj_ruzhi_shijian,
        sj_beizhu: sj_beizhu !== undefined ? sj_beizhu : sj_exist_siji.sj_beizhu
      }
    })

    return {
      sj_code: 200,
      sj_message: '更新成功',
      sj_data: sj_siji
    }
  } catch (sj_error: any) {
    console.error('sj-user siji update error:', sj_error)
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
