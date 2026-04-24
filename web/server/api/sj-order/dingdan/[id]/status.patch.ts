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
    const { sj_zhuangtai } = sj_body

    if (sj_zhuangtai === undefined || ![0, 1, 2, 3].includes(sj_zhuangtai)) {
      setResponseStatus(event, 400)
      return {
        sj_code: 400,
        sj_message: "无效的状态值",
        sj_error: "SJ_ORDER_001"
      }
    }

    // 构建更新数据
    const sj_update_data: any = { sj_zhuangtai }
    // 如果状态变为进行中，设置开始时间
    if (sj_zhuangtai === 1) {
      sj_update_data.sj_kaishi_shijian = new Date()
    }
    // 如果状态变为已完成，设置完成时间
    if (sj_zhuangtai === 2) {
      sj_update_data.sj_wancheng_shijian = new Date()
    }

    // 更新订单状态
    const sj_dingdan = await prisma.sjDingdan.update({
      where: { sj_id },
      data: sj_update_data
    })

    return {
      sj_code: 200,
      sj_message: "状态更新成功",
      sj_data: {
        sj_id: sj_dingdan.sj_id,
        sj_zhuangtai: sj_dingdan.sj_zhuangtai
      }
    }
  } catch (sj_error: any) {
    console.error("sj-order dingdan status error:", sj_error)
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
