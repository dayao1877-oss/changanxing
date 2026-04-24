import prisma from '../../../utils/prisma';
import { sjRequireAuth, sjConvertBigInts } from '../../../utils/sj-common';

export default defineEventHandler(async (event) => {
  try {
    await sjRequireAuth(event);
    const { sijiId } = event.context.params;
    const query = getQuery(event);
    const { startTime, endTime } = query;

    if (!sijiId || isNaN(Number(sijiId))) {
      setResponseStatus(event, 400);
      return {
        sj_code: 400,
        sj_message: '司机ID无效',
        sj_error: '参数错误'
      };
    }

    const where: any = { sj_siji_id: Number(sijiId) };
    if (startTime || endTime) {
      where.sj_dingwei_shijian = {};
      if (startTime) where.sj_dingwei_shijian.gte = new Date(startTime);
      if (endTime) where.sj_dingwei_shijian.lte = new Date(endTime);
    }

    const sjDingweiList = await prisma.sjDingweiJilu.findMany({
      where: where,
      orderBy: { sj_dingwei_shijian: 'asc' }
    });

    const sjResult = sjDingweiList.map(item => sjConvertBigInts(item));

    return {
      sj_code: 200,
      sj_message: '查询成功',
      sj_data: sjResult
    };
  } catch (sjError) {
    console.error('sj-dingwei查询司机定位错误:', sjError);
    setResponseStatus(event, 500);
    return {
      sj_code: 500,
      sj_message: '服务器内部错误',
      sj_error: String(sjError)
    };
  }
});
