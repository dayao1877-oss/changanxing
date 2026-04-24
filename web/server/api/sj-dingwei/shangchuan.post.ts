import prisma from '../../utils/prisma';
import { sjRequireAuth, sjConvertBigInts } from '../../utils/sj-common';

export default defineEventHandler(async (event) => {
  try {
    await sjRequireAuth(event);
    const sjBody = await readBody(event);
    const {
      sj_dingdan_id,
      sj_siji_id,
      sj_jingdu,
      sj_weidu,
      sj_haiba,
      sj_sudu,
      sj_fangxiang,
      sj_jingdu_zhi,
      sj_dingwei_shijian
    } = sjBody;

    if (!sj_siji_id || !sj_dingwei_shijian) {
      setResponseStatus(event, 400);
      return {
        sj_code: 400,
        sj_message: '司机ID和定位时间必填',
        sj_error: '参数缺失'
      };
    }

    const sjDingwei = await prisma.sjDingweiJilu.create({
      data: {
        sj_dingdan_id: sj_dingdan_id || null,
        sj_siji_id: sj_siji_id,
        sj_jingdu: sj_jingdu || null,
        sj_weidu: sj_weidu || null,
        sj_haiba: sj_haiba || null,
        sj_sudu: sj_sudu || null,
        sj_fangxiang: sj_fangxiang || null,
        sj_jingdu_zhi: sj_jingdu_zhi || null,
        sj_dingwei_shijian: new Date(sj_dingwei_shijian),
        sj_shangchuan_zhuangtai: 1
      }
    });

    const sjResult = sjConvertBigInts(sjDingwei);

    return {
      sj_code: 200,
      sj_message: '上传成功',
      sj_data: sjResult
    };
  } catch (sjError) {
    console.error('sj-dingwei上传定位错误:', sjError);
    setResponseStatus(event, 500);
    return {
      sj_code: 500,
      sj_message: '服务器内部错误',
      sj_error: String(sjError)
    };
  }
});
