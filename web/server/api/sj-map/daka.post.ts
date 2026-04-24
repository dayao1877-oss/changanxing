import prisma from '../../utils/prisma'
import { sjRequireAuth } from '../../utils/sj-common'

export default defineEventHandler(async (event) => {
  try {
    await sjRequireAuth(event)
    const sjBody = await readBody(event)

    const {
      sj_siji_id,
      sj_dingdan_id,
      sj_daka_leixing,
      sj_tujingdian_xuhao,
      sj_weizhi,
      sj_dizhi,
      sj_tupian_lujing,
      sj_daka_shijian
    } = sjBody

    // 必填参数验证
    if (!sj_siji_id || !sj_dingdan_id || !sj_daka_leixing || !sj_weizhi || !sj_daka_shijian) {
      setResponseStatus(event, 400)
      return {
        sj_code: 400,
        sj_message: '必填参数缺失',
        sj_error: 'SJ-MAP-001'
      }
    }

    // 创建打卡记录
    const sjDaka = await prisma.sjDakaJilu.create({
      data: {
        sj_siji_id,
        sj_dingdan_id,
        sj_daka_leixing,
        sj_tujingdian_xuhao,
        sj_weizhi,
        sj_dizhi,
        sj_tupian_lujing,
        sj_daka_shijian: new Date(sj_daka_shijian),
        sj_shangchuan_zhuangtai: 1
      }
    })

    return {
      sj_code: 200,
      sj_message: '打卡成功',
      sj_data: sjDaka
    }
  } catch (sjError: any) {
    if (sjError.data?.sj_code) {
      return sjError.data
    }
    console.error('创建打卡记录错误:', sjError)
    setResponseStatus(event, 500)
    return {
      sj_code: 500,
      sj_message: '服务器内部错误',
      sj_error: 'SJ-INTERNAL-ERROR'
    }
  }
})
