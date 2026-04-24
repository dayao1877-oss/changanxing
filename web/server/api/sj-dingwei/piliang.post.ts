import prisma from '../../utils/prisma';
import { sjRequireAuth, sjConvertBigInts } from '../../utils/sj-common';

export default defineEventHandler(async (event) => {
  try {
    await sjRequireAuth(event);
    const sjBody = await readBody(event);
    const { sj_list } = sjBody;

    if (!sj_list || !Array.isArray(sj_list) || sj_list.length === 0) {
      setResponseStatus(event, 400);
      return {
        sj_code: 400,
        sj_message: '定位列表不能为空',
        sj_error: '参数缺失'
      };
    }

    if (sj_list.length > 100) {
      setResponseStatus(event, 400);
      return {
        sj_code: 400,
        sj_message: '单次最多上传100条',
        sj_error: '参数错误'
      };
    }

    const sjDingweiList = [];
    for (let i = 0; i < sj_list.length; i++) {
      const item = sj_list[i];
      const sjDingwei = await prisma.sjDingweiJilu.create({
        data: {
          sj_dingdan_id: item.sj_dingdan_id || null,
          sj_siji_id: item.sj_siji_id,
          sj_jingdu: item.sj_jingdu || null,
          sj_weidu: item.sj_weidu || null,
          sj_haiba: item.sj_haiba || null,
          sj_sudu: item.sj_sudu || null,
          sj_fangxiang: item.sj_fangxiang || null,
          sj_jingdu_zhi: item.sj_jingdu_zhi || null,
          sj_dingwei_shijian: new Date(item.sj_dingwei_shijian),
          sj_shangchuan_zhuangtai: 1
        }
      });
      sjDingweiList.push(sjDingwei);
    }

    const sjResult = sjDingweiList.map(item => sjConvertBigInts(item));

    return {
      sj_code: 200,
      sj_message: '批量上传成功',
      sj_data: {
        sj_tiaoshu: sj_list.length,
        sj_list: sjResult
      }
    };
  } catch (sjError) {
    console.error('sj-dingwei批量上传错误:', sjError);
    setResponseStatus(event, 500);
    return {
      sj_code: 500,
      sj_message: '服务器内部错误',
      sj_error: String(sjError)
    };
  }
});
