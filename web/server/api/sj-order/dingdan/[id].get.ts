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
        sj_message: "无效的ID",
        sj_error: "SJ_ORDER_001"
      }
    }

    // 查询订单详情，包含关联的司机和乘客
    const sj_dingdan = await prisma.sjDingdan.findUnique({
      where: { sj_id },
      include: {
        sj_siji: {
          select: {
            sj_id: true,
            sj_xingming: true,
            sj_chepaihao: true
          }
        },
        sj_chengke: {
          select: {
            sj_id: true,
            sj_xingming: true
          }
        }
      }
    })

    if (!sj_dingdan) {
      setResponseStatus(event, 404)
      return {
        sj_code: 404,
        sj_message: "订单不存在",
        sj_error: "SJ_ORDER_003"
      }
    }

    return {
      sj_code: 200,
      sj_message: "查询成功",
      sj_data: sj_dingdan
    }
  } catch (sj_error: any) {
    console.error("sj-order dingdan detail error:", sj_error)
    if (sj_error.data?.sj_code) {
      return sj_error.data
    }
    setResponseStatus(event, 500)
    return {
      sj_code: 500,
      sj_message: "服务器内部错误",
      sj_error: "SJ_INTERNAL_ERROR"
    }
  }
})
