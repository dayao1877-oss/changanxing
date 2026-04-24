import prisma from '../../../utils/prisma';
import { sjRequireAuth, sjConvertBigInts } from '../../../utils/sj-common';

export default defineEventHandler(async (event) => {
  try {
    await sjRequireAuth(event);
    const { dingdanId } = event.context.params;

    if (!dingdanId || isNaN(Number(dingdanId))) {
      setResponseStatus(event, 400);
      return {
        sj_code: 400,
        sj_message: '订单ID无效',
        sj_error: '参数错误'
      };
    }

    const sjDingweiList = await prisma.sjDingweiJilu.findMany({
      where: { sj_dingdan_id: Number(dingdanId) },
      orderBy: { sj_dingwei_shijian: 'asc' }
    });

    const sjResult = sjDingweiList.map(item => sjConvertBigInts(item));

    return {
      sj_code: 200,
      sj_message: '查询成功',
      sj_data: sjResult
    };
  } catch (sjError) {
    console.error('sj-dingwei查询订单定位错误:', sjError);
    setResponseStatus(event, 500);
    return {
      sj_code: 500,
      sj_message: '服务器内部错误',
      sj_error: String(sjError)
    };
  }
});
