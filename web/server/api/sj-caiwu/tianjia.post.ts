import prisma from '../../utils/prisma'
import { sjRequireAuth, sjConvertBigInts } from '../../utils/sj-common'

export default defineEventHandler(async (event) => {
  try {
    await sjRequireAuth(event)

    const sjBody = await readBody(event)
    const {
      sj_dingdan_id, sj_siji_id, sj_chengke_id, sj_jine, sj_leixing, sj_zhuangtai, sj_beizhu
    } = sjBody

    if (!sj_jine || !sj_leixing) {
      setResponseStatus(event, 400)
      return { sj_code: 400, sj_message: '金额和类型必填', sj_error: '参数缺失' }
    }

    const sjCaiwu = await prisma.sjCaiwuJilu.create({
      data: {
        sj_dingdan_id: sj_dingdan_id || null,
        sj_siji_id: sj_siji_id || null,
        sj_chengke_id: sj_chengke_id || null,
        sj_jine: sj_jine,
        sj_leixing: sj_leixing,
        sj_zhuangtai: sj_zhuangtai || 'wancheng',
        sj_shijian: new Date(),
        sj_beizhu: sj_beizhu || null
      }
    })
    const sjResult = sjConvertBigInts(sjCaiwu)
    return { sj_code: 200, sj_message: '添加成功', sj_data: sjResult }
  } catch (sjError) {
    console.error('sj-caiwu 添加错误:', sjError)
    setResponseStatus(event, 500)
    return { sj_code: 500, sj_message: '服务器内部错误', sj_error: String(sjError) }
  }
})
