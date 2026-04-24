import prisma from '../../../utils/prisma'
import { sjRequireAuth, sjConvertBigInts } from '../../../utils/sj-common'

export default defineEventHandler(async (event) => {
  try {
    // 1. 身份认证
    await sjRequireAuth(event)

    // 2. 读取路径参数和请求体
    const { id } = event.context.params
    const sjBody = await readBody(event)
    const { sj_chuli_zhuangtai } = sjBody

    if (!id || isNaN(Number(id))) {
      setResponseStatus(event, 400)
      return {
        sj_code: 400,
        sj_message: '拒绝记录ID无效',
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

    if (![0, 1].includes(sj_chuli_zhuangtai)) {
      setResponseStatus(event, 400)
      return {
        sj_code: 400,
        sj_message: '处理状态必须是0或1',
        sj_error: '参数错误'
      }
    }

    // 3. 查询拒绝记录
    const sjJujueJilu = await prisma.sjJujueJilu.findUnique({
      where: { sj_id: Number(id) }
    })

    if (!sjJujueJilu) {
      setResponseStatus(event, 404)
      return {
        sj_code: 404,
        sj_message: '拒绝记录不存在',
        sj_error: '找不到记录'
      }
    }

    // 4. 更新处理状态
    const sjUpdatedJilu = await prisma.sjJujueJilu.update({
      where: { sj_id: Number(id) },
      data: {
        sj_chuli_zhuangtai: sj_chuli_zhuangtai
      }
    })

    // 5. 处理BigInt和Date字段
    const sjResult = sjConvertBigInts(sjUpdatedJilu)

    return {
      sj_code: 200,
      sj_message: '更新成功',
      sj_data: sjResult
    }
  } catch (sjError) {
    console.error('sj-jujue更新处理状态错误:', sjError)
    setResponseStatus(event, 500)
    return {
      sj_code: 500,
      sj_message: '服务器内部错误',
      sj_error: String(sjError)
    }
  }
})
