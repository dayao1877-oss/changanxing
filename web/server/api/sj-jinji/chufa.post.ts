import prisma from '../../utils/prisma'
import { sjRequireAuth, sjConvertBigInts } from '../../utils/sj-common'

export default defineEventHandler(async (event) => {
  try {
    await sjRequireAuth(event)

    const sjBody = await readBody(event)
    const {
      sj_siji_id,
      sj_dingdan_id,
      sj_weizhi,
      sj_tupian_lujing,
      sj_luyin_lujing
    } = sjBody

    if (!sj_siji_id) {
      setResponseStatus(event, 400)
      return {
        sj_code: 400,
        sj_message: '司机ID必填',
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

    const sjJinji = await prisma.sjJinjiShijian.create({
      data: {
        sj_siji_id: sj_siji_id,
        sj_dingdan_id: sj_dingdan_id || null,
        sj_chufa_shijian: new Date(),
        sj_weizhi: sj_weizhi || null,
        sj_tupian_lujing: sj_tupian_lujing || null,
        sj_luyin_lujing: sj_luyin_lujing || null
      }
    })

    const sjResult = sjConvertBigInts(sjJinji)

    return {
      sj_code: 200,
      sj_message: '触发成功',
      sj_data: sjResult
    }
  } catch (sjError) {
    console.error('sj-jinji 触发错误:', sjError)
    setResponseStatus(event, 500)
    return {
      sj_code: 500,
      sj_message: '服务器内部错误',
      sj_error: String(sjError)
    }
  }
})
