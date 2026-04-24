# sj-dingwei 定位管理模块 测试文档

---

## 1. 测试环境

- 测试地址：http://localhost:3000
- 数据库：MySQL 8.0
- 认证方式：JWT Token

---

## 2. 前置准备

### 2.1 获取Token
登录获取token：
```bash
curl -X POST http://localhost:3000/api/sj-auth/login \
  -H "Content-Type: application/json" \
  -d "{\"sj_zhanghao\":\"admin\",\"sj_mima\":\"123456\"}"
```
复制返回的 sj_data.sj_token。

---

## 3. 测试用例

### 3.1 上传单个定位
- **接口**：POST /api/sj-dingwei/shangchuan
- **请求**：
```bash
curl -X POST http://localhost:3000/api/sj-dingwei/shangchuan \
  -H "Authorization: Bearer <你的token> \
  -H "Content-Type: application/json" \
  -d '{
    "sj_dingdan_id": 1,
    "sj_siji_id": 1,
    "sj_jingdu": 116.403874,
    "sj_weidu": 39.915168,
    "sj_haiba": 50.5,
    "sj_sudu": 60.0,
    "sj_fangxiang": 90.0,
  "sj_jingdu_zhi": 10.0,
  "sj_dingwei_shijian": "2026-04-24T12:30:00.000Z"
  }'
```
- **预期结果**：sj_code:200，返回定位记录

---

### 3.2 批量上传定位
- **接口**：POST /api/sj-dingwei/piliang
- **请求**：
```bash
curl -X POST http://localhost:3000/api/sj-dingwei/piliang \
  -H "Authorization: Bearer <你的token> \
  -H "Content-Type: application/json" \
  -d '{
    "sj_list": [
      {
        "sj_dingdan_id": 1,
        "sj_siji_id": 1,
        "sj_jingdu": 116.403874,
        "sj_weidu": 39.915168,
        "sj_dingwei_shijian": "2026-04-24T12:30:00.000Z"
      },
      {
        "sj_dingdan_id": 1,
        "sj_siji_id": 1,
        "sj_jingdu": 116.403974,
        "sj_weidu": 39.915268,
        "sj_dingwei_shijian": "2026-04-24T12:30:30.000Z"
      }
    ]
  }'
```
- **预期结果**：sj_code:200，批量成功

---

### 3.3 查询订单定位记录
- **接口**：GET /api/sj-dingwei/dingdan/1
- **请求**：
```bash
curl -X GET http://localhost:3000/api/sj-dingwei/dingdan/1 \
  -H "Authorization: Bearer <你的token>"
```
- **预期结果**：返回订单轨迹数组

---

### 3.4 查询司机定位记录
- **接口**：GET /api/sj-dingwei/siji/1
- **请求**：
```bash
curl -X GET http://localhost:3000/api/sj-dingwei/siji/1 \
  -H "Authorization: Bearer <你的token>"
```
- **预期结果**：返回司机定位记录数组

---

### 3.5 查询单个定位详情
- **接口**：GET /api/sj-dingwei/{id}
- **请求**（把{id}替换成上面返回的sj_id）：
```bash
curl -X GET http://localhost:3000/api/sj-dingwei/{id} \
  -H "Authorization: Bearer <你的token>"
```
- **预期结果**：返回单个定位详情

---

### 3.6 异常测试
- 3.6.1 参数缺失
  - 预期返回400
- 3.6.2 批量超过100条
  - 预期返回400

---

## 4. 测试结果记录

| 测试用例 | 状态 | 问题/备注 |
|---------|------|---------|
| 3.1 上传单个定位 | ✅ | 成功上传定位记录 |
| 3.2 批量上传定位 | ✅ | 成功批量上传2条定位记录 |
| 3.3 查询订单定位 | ✅ | 成功查询订单1的所有定位记录 |
| 3.4 查询司机定位 | ✅ | 成功查询司机1的所有定位记录（包含时间筛选） |
| 3.5 查询单个详情 | ✅ | 成功查询定位ID=5的详细信息 |
| 3.6 异常测试 | ✅ | 缺少定位时间时返回400错误码 |

---

## 5. 总结

- 通过率：100%
- 发现问题：
  1. 之前发现定位模块的字段名不一致，设计文档使用`sj_jingduzhi`而数据库和Prisma使用`sj_jingdu_zhi`，已统一修正为`sj_jingdu_zhi`
  2. 之前`siji/[sijiId].get.ts`的导入路径错误，多了一级`../`，已修正
- 改进建议：所有字段、API、代码统一使用拼音且`sj`开头的规范，保持文档与代码一致

---

文档版本：v1.0
创建日期：2026-04-24
维护者：技术负责人
