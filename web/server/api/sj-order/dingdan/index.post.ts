import prisma from '../../../utils/prisma'
import { sjRequireAuth } from '../../../utils/sj-common'

export default defineEventHandler(async (event) => {
  try {
    // 验证认证
    await sjRequireAuth(event)

    const sj_body = await readBody(event)
    const {
      sj_dingdan_hao,
      sj_chengke_id,
      sj_shifadi_dizhi,
      sj_shifadi_weizhi,
      sj_mudedi_dizhi,
      sj_mudedi_weizhi,
      sj_tujingdian,
      sj_licheng_zhong,
      sj_jine,
      sj_siji_ticheng,
      sj_laiyuan = 1,
      sj_beizhu
    } = sj_body

    // 参数验证
    if (!sj_dingdan_hao) {
      setResponseStatus(event, 400)
      return {
        sj_code: 400,
        sj_message: "订单号不能为空",
        sj_error: "SJ_ORDER_001"
      }
    }

    // 检查订单号是否已存在
    const sj_exist_dingdan = await prisma.sjDingdan.findUnique({
      where: { sj_dingdan_hao }
    })
    if (sj_exist_dingdan) {
      setResponseStatus(event, 400)
      return {
        sj_code: 400,
        sj_message: "订单号已存在",
        sj_error: "SJ_ORDER_002"
      }
    }

    // 创建订单
    const sj_dingdan = await prisma.sjDingdan.create({
      data: {
        sj_dingdan_hao,
        sj_chengke_id: sj_chengke_id || null,
        sj_shifadi_dizhi: sj_shifadi_dizhi || null,
        sj_shifadi_weizhi: sj_shifadi_weizhi || null,
        sj_mudedi_dizhi: sj_mudedi_dizhi || null,
        sj_mudedi_weizhi: sj_mudedi_weizhi || null,
        sj_tujingdian: sj_tujingdian || null,
        sj_licheng_zhong: sj_licheng_zhong || null,
        sj_jine: sj_jine || null,
        sj_siji_ticheng: sj_siji_ticheng || null,
        sj_zhuangtai: 0, // 默认待接单
        sj_laiyuan,
        sj_beizhu: sj_beizhu || null
      }
    })

    return {
      sj_code: 200,
      sj_message: "创建成功",
      sj_data: {
        sj_id: sj_dingdan.sj_id,
        sj_dingdan_hao: sj_dingdan.sj_dingdan_hao,
        sj_zhuangtai: sj_dingdan.sj_zhuangtai
      }
    }
  } catch (sj_error: any) {
    console.error("sj-order dingdan create error:", sj_error)
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
