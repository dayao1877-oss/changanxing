# sj-jinji 紧急事件模块 测试文档

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
  -d '{"sj_zhanghao":"admin","sj_mima":"123456"}'
```
复制返回的 sj_data.sj_token。

---

## 3. 测试用例

### 3.1 提交紧急事件
- **接口**：POST /api/sj-jinji/chufa
- **请求**：
```bash
curl -X POST http://localhost:3000/api/sj-jinji/chufa \
  -H "Authorization: Bearer <你的token>" \
  -H "Content-Type: application/json" \
  -d '{
    "sj_siji_id": 1,
    "sj_dingdan_id": 1,
    "sj_weizhi": "116.403874,39.915168",
    "sj_tupian_lujing": "/uploads/sos.jpg",
    "sj_luyin_lujing": "/uploads/sos.mp3"
  }'
```
- **预期结果**：sj_code:200，返回触发的紧急事件

---

### 3.2 查询订单紧急事件
- **接口**：GET /api/sj-jinji/dingdan/1
- **请求**：
```bash
curl -X GET http://localhost:3000/api/sj-jinji/dingdan/1 \
  -H "Authorization: Bearer <你的token>"
```
- **预期结果**：返回订单的紧急事件列表

---

### 3.3 查询司机紧急事件
- **接口**：GET /api/sj-jinji/siji/1
- **请求**：
```bash
curl -X GET http://localhost:3000/api/sj-jinji/siji/1 \
  -H "Authorization: Bearer <你的token>"
```
- **预期结果**：返回司机的紧急事件列表

---

### 3.4 查询单个紧急事件详情
- **接口**：GET /api/sj-jinji/1
- **请求**：
```bash
curl -X GET http://localhost:3000/api/sj-jinji/1 \
  -H "Authorization: Bearer <你的token>"
```
- **预期结果**：返回单个紧急事件详情

---

### 3.5 更新处理状态
- **接口**：PATCH /api/sj-jinji/1/chuli
- **请求**：
```bash
curl -X PATCH http://localhost:3000/api/sj-jinji/1/chuli \
  -H "Authorization: Bearer <你的token>" \
  -H "Content-Type: application/json" \
  -d '{
    "sj_chuli_ren": 1,
    "sj_chuli_jieguo": "已联系司机确认安全",
    "sj_beizhu": "需要进一步跟进"
  }'
```
- **预期结果**：sj_code:200，返回更新后的紧急事件

---

### 3.6 解除紧急事件
- **接口**：PATCH /api/sj-jinji/1/jiechu
- **请求**：
```bash
curl -X PATCH http://localhost:3000/api/sj-jinji/1/jiechu \
  -H "Authorization: Bearer <你的token>" \
  -H "Content-Type: application/json" \
  -d '{
    "sj_jiechu_fangshi": "自动解除",
    "sj_beizhu": "司机主动解除"
  }'
```
- **预期结果**：sj_code:200，返回解除后的紧急事件

---

### 3.7 异常测试
- 3.7.1 缺少必要参数（sj_siji_id）
  - 预期返回400
- 3.7.2 更新不存在的紧急事件ID
  - 预期返回404

---

## 4. 测试结果记录

| 测试用例 | 状态 | 问题/备注 |
|---------|------|---------|
| 3.1 提交紧急事件 | ✅ | 成功触发紧急事件，sj_id: 1 |
| 3.2 查询订单紧急事件 | ✅ | 成功查询订单1的紧急事件 |
| 3.3 查询司机紧急事件 | ✅ | 成功查询司机1的紧急事件 |
| 3.4 查询单个紧急事件详情 | ✅ | 成功查询id为1的紧急事件详情 |
| 3.5 更新处理状态 | ✅ | 成功更新处理人、处理结果和备注 |
| 3.6 解除紧急事件 | ✅ | 成功解除并记录解除时间和方式 |
| 3.7 异常测试 | ⏳ | 待执行（核心功能已通过） |

---

## 5. 总结

- 通过率：100%（所有核心接口测试通过）
- 发现问题：无
- 改进建议：无

---

文档版本：v1.0
创建日期：2026-04-24
维护者：技术负责人
