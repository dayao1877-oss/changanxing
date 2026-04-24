import prisma from '../../utils/prisma'
import { sjRequireAuth, sjConvertBigInts } from '../../utils/sj-common'

export default defineEventHandler(async (event) => {
  try {
    await sjRequireAuth(event)
    const sjBody = await readBody(event)
    const { sj_mokuai, sj_caozuo, sj_caozuozhe_id, sj_ip, sj_shuju } = sjBody

    if (!sj_mokuai || !sj_caozuo) {
      setResponseStatus(event,400)
      return { sj_code:400, sj_message:'模块名和操作必填', sj_error:'参数缺失' }
    }

    const sjCaozuo = await prisma.sjCaozuoRizhi.create({
      data: {
        sj_mokuai: sj_mokuai,
        sj_caozuo: sj_caozuo,
        sj_caozuozhe_id: sj_caozuozhe_id || null,
        sj_ip: sj_ip || null,
        sj_shijian: new Date(),
        sj_shuju: sj_shuju || null
      }
    })

    const sjResult = sjConvertBigInts(sjCaozuo)
    return { sj_code:200, sj_message:'添加成功', sj_data: sjResult }
  } catch (sjError) {
    console.error('sj-caozuo 添加错误:', sjError)
    setResponseStatus(event,500)
    return { sj_code:500, sj_message:'服务器内部错误', sj_error: String(sjError) }
  }
})
