import prisma from '../../../../utils/prisma'
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
        sj_message: "无效的ID",
        sj_error: "SJ_ORDER_001"
      }
    }

    // 检查订单是否存在
    const sj_exist_dingdan = await prisma.sjDingdan.findUnique({
      where: { sj_id }
    })
    if (!sj_exist_dingdan) {
      setResponseStatus(event, 404)
      return {
        sj_code: 404,
        sj_message: "订单不存在",
        sj_error: "SJ_ORDER_003"
      }
    }

    const sj_body = await readBody(event)
    const { sj_siji_id } = sj_body

    if (sj_siji_id === undefined || isNaN(sj_siji_id)) {
      setResponseStatus(event, 400)
      return {
        sj_code: 400,
        sj_message: "司机ID不能为空",
        sj_error: "SJ_ORDER_001"
      }
    }

    // 检查司机是否存在
    const sj_exist_siji = await prisma.sjSiji.findUnique({
      where: { sj_id: sj_siji_id }
    })
    if (!sj_exist_siji) {
      setResponseStatus(event, 400)
      return {
        sj_code: 400,
        sj_message: "司机不存在",
        sj_error: "SJ_ORDER_004"
      }
    }

    // 指派司机
    const sj_dingdan = await prisma.sjDingdan.update({
      where: { sj_id },
      data: {
        sj_siji_id
      }
    })

    return {
      sj_code: 200,
      sj_message: "司机指派成功",
      sj_data: {
        sj_id: sj_dingdan.sj_id,
        sj_siji_id: sj_dingdan.sj_siji_id
      }
    }
  } catch (sj_error: any) {
    console.error("sj-order dingdan assign error:", sj_error)
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
