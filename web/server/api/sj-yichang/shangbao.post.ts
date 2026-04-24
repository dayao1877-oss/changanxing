import prisma from '../../utils/prisma'
import { sjRequireAuth, sjConvertBigInts } from '../../utils/sj-common'

export default defineEventHandler(async (event) => {
  try {
    await sjRequireAuth(event)

    const sjBody = await readBody(event)
    const {
      sj_dingdan_id,
      sj_siji_id,
      sj_yichang_leixing,
      sj_xiangxi_miaoshu,
      sj_tupian_lujing,
      sj_weizhi
    } = sjBody

    if (!sj_siji_id || !sj_yichang_leixing || !sj_xiangxi_miaoshu) {
      setResponseStatus(event, 400)
      return {
        sj_code: 400,
        sj_message: '司机ID、异常类型和详细描述必填',
        sj_error: '参数缺失'
      }
    }

    if (sj_dingdan_id) {
      const sjDingdan = await prisma.sjDingdan.findUnique({
        where: { sj_id: sj_dingdan_id }
      })
      if (!sjDingdan) {
        setResponseStatus(event, 404)
        return {
          sj_code: 404,
          sj_message: '订单不存在',
          sj_error: '找不到订单'
        }
      }
    }

    const sjSiji = await prisma.sjSiji.findUnique({
      where: { sj_id: sj_siji_id }
    })

    if (!sjSiji) {
      setResponseStatus(event, 404)
      return {
        sj_code: 404,
        sj_message: '司机不存在',
        sj_error: '找不到司机'
      }
    }

    const sjYichang = await prisma.sjYichangShangbao.create({
      data: {
        sj_dingdan_id: sj_dingdan_id || null,
        sj_siji_id: sj_siji_id,
        sj_yichang_leixing: sj_yichang_leixing,
        sj_xiangxi_miaoshu: sj_xiangxi_miaoshu,
        sj_tupian_lujing: sj_tupian_lujing || null,
        sj_weizhi: sj_weizhi || null,
        sj_shangbao_shijian: new Date(),
        sj_chuli_zhuangtai: 0
      }
    })

    const sjResult = sjConvertBigInts(sjYichang)

    return {
      sj_code: 200,
      sj_message: '上报成功',
      sj_data: sjResult
    }
  } catch (sjError) {
    console.error('sj-yichang提交错误:', sjError)
    setResponseStatus(event, 500)
    return {
      sj_code: 500,
      sj_message: '服务器内部错误',
      sj_error: String(sjError)
    }
  }
})
