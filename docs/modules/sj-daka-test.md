# sj-daka 打卡管理模块 测试文档

---

## 1. 测试环境

- 测试地址：http://localhost:3000
- 数据库：MySQL 8.0（Docker）
- 认证方式：JWT Token

---

## 2. 前置准备

### 2.1 获取管理员Token
首先登录获取Token：
```bash
curl -X POST http://localhost:3000/api/sj-auth/login \
  -H "Content-Type: application/json" \
  -d "{\"sj_zhanghao\":\"admin\",\"sj_mima\":\"123456\"}"
```
复制返回的 `sj_data.sj_token`，后续所有接口都要在Header中携带。

---

## 3. 测试用例

### 3.1 测试：提交打卡 - 始发地
- **接口**：POST /api/sj-daka/tijiao
- **步骤**：
  1. 准备请求参数
  2. 发送请求
  3. 验证响应

```bash
curl -X POST http://localhost:3000/api/sj-daka/tijiao \
  -H "Authorization: Bearer <你的Token>" \
  -H "Content-Type: application/json" \
  -d "{\"sj_dingdan_id\":1,\"sj_daka_leixing\":1,\"sj_weizhi\":\"116.403874,39.915168\",\"sj_dizhi\":\"北京市朝阳区\"}"
```

**期望结果**：sj_code 200，返回打卡记录

---

### 3.2 测试：查询订单的打卡记录
- **接口**：GET /api/sj-daka/dingdan/{dingdanId}
- **步骤**：
  1. 使用上面的订单ID
  2. 发送请求
  3. 验证返回的打卡列表

```bash
curl -X GET http://localhost:3000/api/sj-daka/dingdan/1 \
  -H "Authorization: Bearer <你的Token>"
```

**期望结果**：sj_code 200，返回该订单的所有打卡记录数组

---

### 3.3 测试：查询打卡详情
- **接口**：GET /api/sj-daka/{id}
- **步骤**：
  1. 使用上面返回的打卡ID
  2. 发送请求
  3. 验证返回的打卡详情

```bash
curl -X GET http://localhost:3000/api/sj-daka/1 \
  -H "Authorization: Bearer <你的Token>"
```

**期望结果**：sj_code 200，返回单个打卡记录的详细信息

---

### 3.4 测试：异常测试 - 参数缺失
- **接口**：POST /api/sj-daka/tijiao
- **输入**：缺少必填参数 sj_dingdan_id
- **期望结果**：sj_code 400，错误信息提示参数缺失

```bash
curl -X POST http://localhost:3000/api/sj-daka/tijiao \
  -H "Authorization: Bearer <你的Token>" \
  -H "Content-Type: application/json" \
  -d "{\"sj_daka_leixing\":1}"
```

---

### 3.5 测试：异常测试 - 打卡类型错误
- **接口**：POST /api/sj-daka/tijiao
- **输入**：sj_daka_leixing = 99
- **期望结果**：sj_code 400，提示打卡类型必须是1、2、3

```bash
curl -X POST http://localhost:3000/api/sj-daka/tijiao \
  -H "Authorization: Bearer <你的Token>" \
  -H "Content-Type: application/json" \
  -d "{\"sj_dingdan_id\":1,\"sj_daka_leixing\":99}"
```

---

## 4. 测试结果记录

| 测试用例 | 状态 | 问题/备注 |
|---------|------|----------|
| 3.1 提交打卡始发地 | ✅ | 成功返回打卡记录 |
| 3.2 查询订单打卡记录 | ✅ | 成功返回该订单所有打卡 |
| 3.3 查询打卡详情 | ✅ | 成功返回单个打卡详情 |
| 3.4 参数缺失 | ✅ | 正确返回400错误提示 |
| 3.5 打卡类型错误 | ✅ | 正确返回400错误提示 |

---

## 5. 总结

- 通过率：100%
- 发现问题：无
- 改进建议：无

---

文档版本：v1.0
创建日期：2026-04-24
维护者：技术负责人
