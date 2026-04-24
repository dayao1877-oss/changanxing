import prisma from '../../utils/prisma'
import { sjRequireAuth, sjConvertBigInts } from '../../utils/sj-common'

export default defineEventHandler(async (event) => {
  try {
    await sjRequireAuth(event)
    const sjBody = await readBody(event)

    const {
      sj_siji_id,
      sj_dingdan_id,
      sj_jingdu,
      sj_weidu,
      sj_haiba,
      sj_sudu,
      sj_fangxiang,
      sj_jingdu_zhi,
      sj_dingwei_shijian
    } = sjBody

    // 必填参数验证
    if (!sj_siji_id || sj_jingdu === undefined || sj_weidu === undefined || !sj_dingwei_shijian) {
      setResponseStatus(event, 400)
      return {
        sj_code: 400,
        sj_message: '必填参数缺失',
        sj_error: 'SJ-MAP-001'
      }
    }

    // 创建定位记录
    const sjDingwei = await prisma.sjDingweiJilu.create({
      data: {
        sj_siji_id,
        sj_dingdan_id,
        sj_jingdu,
        sj_weidu,
        sj_haiba,
        sj_sudu,
        sj_fangxiang,
        sj_jingdu_zhi,
        sj_dingwei_shijian: new Date(sj_dingwei_shijian),
        sj_shangchuan_zhuangtai: 1
      }
    })

    // 使用通用函数处理 BigInt
    return {
      sj_code: 200,
      sj_message: '保存成功',
      sj_data: sjConvertBigInts(sjDingwei)
    }
  } catch (sjError: any) {
    if (sjError.data?.sj_code) {
      return sjError.data
    }
    console.error('保存定位记录错误:', sjError)
    setResponseStatus(event, 500)
    return {
      sj_code: 500,
      sj_message: '服务器内部错误',
      sj_error: 'SJ-INTERNAL-ERROR'
    }
  }
})
