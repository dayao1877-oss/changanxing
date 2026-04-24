import prisma from '../../utils/prisma'
import { sjRequireAuth, sjConvertBigInts } from '../../utils/sj-common'

export default defineEventHandler(async (event) => {
  try {
    // 1. 身份认证
    const sjGuanliyuan = await sjRequireAuth(event)

    // 2. 读取请求体
    const sjBody = await readBody(event)
    const {
      sj_dingdan_id,
      sj_daka_leixing,
      sj_tujingdian_xuhao,
      sj_weizhi,
      sj_dizhi,
      sj_tupian_lujing
    } = sjBody

    // 3. 参数校验
    if (!sj_dingdan_id || !sj_daka_leixing) {
      setResponseStatus(event, 400)
      return {
        sj_code: 400,
        sj_message: '订单ID和打卡类型必填',
        sj_error: '参数缺失'
      }
    }

    if (![1, 2, 3].includes(sj_daka_leixing)) {
      setResponseStatus(event, 400)
      return {
        sj_code: 400,
        sj_message: '打卡类型必须是1（始发地）、2（途径点）或3（目的地）',
        sj_error: '参数错误'
      }
    }

    if (sj_daka_leixing === 2 && !sj_tujingdian_xuhao) {
      setResponseStatus(event, 400)
      return {
        sj_code: 400,
        sj_message: '途径点打卡必须填写途径点序号',
        sj_error: '参数缺失'
      }
    }

    // 4. 查询订单，验证订单存在
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

    // 5. 创建打卡记录
    const sjDakaJilu = await prisma.sjDakaJilu.create({
      data: {
        sj_dingdan_id: sj_dingdan_id,
        sj_siji_id: sjDingdan.sj_siji_id || 0,
        sj_daka_leixing: sj_daka_leixing,
        sj_tujingdian_xuhao: sj_tujingdian_xuhao || null,
        sj_weizhi: sj_weizhi || null,
        sj_dizhi: sj_dizhi || null,
        sj_tupian_lujing: sj_tupian_lujing || null,
        sj_daka_shijian: new Date(),
        sj_shangchuan_zhuangtai: 1
      }
    })

    // 6. 处理BigInt和Date字段
    const sjResult = sjConvertBigInts(sjDakaJilu)

    return {
      sj_code: 200,
      sj_message: '打卡成功',
      sj_data: sjResult
    }
  } catch (sjError) {
    console.error('sj-daka提交打卡错误:', sjError)
    setResponseStatus(event, 500)
    return {
      sj_code: 500,
      sj_message: '服务器内部错误',
      sj_error: String(sjError)
    }
  }
})
