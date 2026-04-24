import prisma from '../../../utils/prisma'
import { sjRequireAuth, sjConvertBigInts } from '../../../utils/sj-common'

export default defineEventHandler(async (event) => {
  try {
    await sjRequireAuth(event)

    const { id } = event.context.params
    const sjBody = await readBody(event)
    const { sj_chuli_zhuangtai, sj_chuli_fangan, sj_beizhu } = sjBody

    if (!id || isNaN(Number(id))) {
      setResponseStatus(event, 400)
      return {
        sj_code: 400,
        sj_message: '异常记录ID无效',
        sj_error: '参数错误'
      }
    }

    if (sj_chuli_zhuangtai === undefined || sj_chuli_zhuangtai === null) {
      setResponseStatus(event, 400)
      return {
        sj_code: 400,
        sj_message: '处理状态必填',
        sj_error: '参数缺失'
      }
    }

    if (![0, 1, 2].includes(sj_chuli_zhuangtai)) {
      setResponseStatus(event, 400)
      return {
        sj_code: 400,
        sj_message: '处理状态必须是0、1或2',
        sj_error: '参数错误'
      }
    }

    const sjYichang = await prisma.sjYichangShangbao.findUnique({
      where: { sj_id: Number(id) }
    })

    if (!sjYichang) {
      setResponseStatus(event, 404)
      return {
        sj_code: 404,
        sj_message: '异常记录不存在',
        sj_error: '找不到记录'
      }
    }

    const updateData: any = {
      sj_chuli_zhuangtai: sj_chuli_zhuangtai
    }

    if (sj_chuli_fangan !== undefined) {
      updateData.sj_chuli_fangan = sj_chuli_fangan
    }

    if (sj_beizhu !== undefined) {
      updateData.sj_beizhu = sj_beizhu
    }

    if (sj_chuli_zhuangtai === 2) {
      updateData.sj_chuli_shijian = new Date()
    }

    const sjUpdated = await prisma.sjYichangShangbao.update({
      where: { sj_id: Number(id) },
      data: updateData
    })

    const sjResult = sjConvertBigInts(sjUpdated)

    return {
      sj_code: 200,
      sj_message: '更新成功',
      sj_data: sjResult
    }
  } catch (sjError) {
    console.error('sj-yichang更新处理状态错误:', sjError)
    setResponseStatus(event, 500)
    return {
      sj_code: 500,
      sj_message: '服务器内部错误',
      sj_error: String(sjError)
    }
  }
})
