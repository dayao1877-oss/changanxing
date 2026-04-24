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
    const {
      sj_shifadi_dizhi,
      sj_shifadi_weizhi,
      sj_mudedi_dizhi,
      sj_mudedi_weizhi,
      sj_licheng_zhong,
      sj_jine,
      sj_siji_ticheng,
      sj_beizhu
    } = sj_body

    // 更新订单信息
    const sj_dingdan = await prisma.sjDingdan.update({
      where: { sj_id },
      data: {
        sj_shifadi_dizhi: sj_shifadi_dizhi !== undefined ? sj_shifadi_dizhi : sj_exist_dingdan.sj_shifadi_dizhi,
        sj_shifadi_weizhi: sj_shifadi_weizhi !== undefined ? sj_shifadi_weizhi : sj_exist_dingdan.sj_shifadi_weizhi,
        sj_mudedi_dizhi: sj_mudedi_dizhi !== undefined ? sj_mudedi_dizhi : sj_exist_dingdan.sj_mudedi_dizhi,
        sj_mudedi_weizhi: sj_mudedi_weizhi !== undefined ? sj_mudedi_weizhi : sj_exist_dingdan.sj_mudedi_weizhi,
        sj_licheng_zhong: sj_licheng_zhong !== undefined ? sj_licheng_zhong : sj_exist_dingdan.sj_licheng_zhong,
        sj_jine: sj_jine !== undefined ? sj_jine : sj_exist_dingdan.sj_jine,
        sj_siji_ticheng: sj_siji_ticheng !== undefined ? sj_siji_ticheng : sj_exist_dingdan.sj_siji_ticheng,
        sj_beizhu: sj_beizhu !== undefined ? sj_beizhu : sj_exist_dingdan.sj_beizhu
      }
    })

    return {
      sj_code: 200,
      sj_message: "更新成功",
      sj_data: sj_dingdan
    }
  } catch (sj_error: any) {
    console.error("sj-order dingdan update error:", sj_error)
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
