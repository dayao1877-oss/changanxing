# sj-user 用户管理模块 测试文档

> 文档版本：v1.0
> 创建日期：2026-04-23
> 模块名称：sj-user（用户管理模块）

---

## 测试前准备

### 前置条件
1. 已完成数据库初始化和Prisma Client生成
2. 已创建测试司机账号（手机号：13800138000，密码：123456）
3. 开发服务器已启动

### 获取认证Token
首先需要登录获取有效的Token：

```bash
curl -X POST http://localhost:3000/api/sj-auth/login \
  -H "Content-Type: application/json" \
  -d '{
    "sj_shouji": "13800138000",
    "sj_mima": "123456"
  }'
```

保存返回的 `sj_token` 值，后续请求需要在 Header 中携带：
```
Authorization: Bearer <token>
```

---

## 测试用例 - 司机管理

### 1. 创建司机 - 成功

**测试编号：** TC-SJ-USER-SJ-001
**测试目标：** 验证可以成功创建新司机

**测试步骤：**
```bash
curl -X POST http://localhost:3000/api/sj-user/siji \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer <token>" \
  -d '{
    "sj_bianhao": "SJ002",
    "sj_xingming": "李四",
    "sj_shouji": "13900139000",
    "sj_mima": "123456",
    "sj_shenfenzheng": "110101199002025678",
    "sj_chepaihao": "京B67890",
    "sj_ruzhi_shijian": "2024-02-01T00:00:00.000Z",
    "sj_beizhu": "测试司机"
  }'
```

**预期结果：**
- 状态码：200
- sj_code: 200
- 返回包含 sj_id、sj_bianhao、sj_xingming、sj_shouji 的 sj_data

---

### 2. 创建司机 - 编号重复

**测试编号：** TC-SJ-USER-SJ-002
**测试目标：** 验证司机编号重复时返回正确错误

**测试步骤：**
```bash
curl -X POST http://localhost:3000/api/sj-user/siji \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer <token>" \
  -d '{
    "sj_bianhao": "SJ001",
    "sj_xingming": "重复编号",
    "sj_shouji": "13999999999",
    "sj_mima": "123456"
  }'
```

**预期结果：**
- 状态码：400
- sj_code: 400
- sj_error: "SJ_USER_002"

---

### 3. 创建司机 - 手机号重复

**测试编号：** TC-SJ-USER-SJ-003
**测试目标：** 验证手机号重复时返回正确错误

**预期结果：**
- 状态码：400
- sj_error: "SJ_USER_003"

---

### 4. 查询司机列表

**测试编号：** TC-SJ-USER-SJ-004
**测试目标：** 验证可以查询司机列表，支持分页和搜索

**测试步骤 - 基础查询：**
```bash
curl -X GET "http://localhost:3000/api/sj-user/siji?sj_page=1&sj_page_size=10" \
  -H "Authorization: Bearer <token>"
```

**测试步骤 - 搜索：**
```bash
curl -X GET "http://localhost:3000/api/sj-user/siji?sj_keyword=张三" \
  -H "Authorization: Bearer <token>"
```

**预期结果：**
- 状态码：200
- sj_data 包含 sj_list、sj_total、sj_page、sj_page_size

---

### 5. 查询司机详情

**测试编号：** TC-SJ-USER-SJ-005
**测试目标：** 验证可以查询单个司机的详细信息

**测试步骤（将 <id> 替换为实际司机ID）：**
```bash
curl -X GET "http://localhost:3000/api/sj-user/siji/<id>" \
  -H "Authorization: Bearer <token>"
```

**预期结果：**
- 状态码：200
- 返回完整的司机信息

---

### 6. 更新司机信息

**测试编号：** TC-SJ-USER-SJ-006
**测试目标：** 验证可以成功更新司机信息

**测试步骤：**
```bash
curl -X PUT "http://localhost:3000/api/sj-user/siji/<id>" \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer <token>" \
  -d '{
    "sj_xingming": "张三（已更新）",
    "sj_beizhu": "更新后的备注"
  }'
```

**预期结果：**
- 状态码：200
- 返回更新后的司机信息

---

### 7. 更新司机状态

**测试编号：** TC-SJ-USER-SJ-007
**测试目标：** 验证可以启用/禁用司机账号

**测试步骤 - 禁用：**
```bash
curl -X PATCH "http://localhost:3000/api/sj-user/siji/<id>/status" \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer <token>" \
  -d '{ "sj_zhuangtai": 0 }'
```

**测试步骤 - 启用：**
```bash
curl -X PATCH "http://localhost:3000/api/sj-user/siji/<id>/status" \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer <token>" \
  -d '{ "sj_zhuangtai": 1 }'
```

---

### 8. 重置司机密码

**测试编号：** TC-SJ-USER-SJ-008
**测试目标：** 验证可以重置司机密码

**测试步骤：**
```bash
curl -X PATCH "http://localhost:3000/api/sj-user/siji/<id>/password" \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer <token>" \
  -d '{ "sj_mima": "newpassword123" }'
```

---

## 测试用例 - 乘客管理

### 9. 创建乘客 - 成功

**测试编号：** TC-SJ-USER-CK-001
**测试目标：** 验证可以成功创建新乘客

**测试步骤：**
```bash
curl -X POST http://localhost:3000/api/sj-user/chengke \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer <token>" \
  -d '{
    "sj_xingming": "王五",
    "sj_shouji": "13700137000",
    "sj_gongsi_mingcheng": "某公司",
    "sj_beizhu": "测试乘客"
  }'
```

**预期结果：**
- 状态码：200
- sj_code: 200
- 返回新创建的乘客信息

---

### 10. 查询乘客列表

**测试编号：** TC-SJ-USER-CK-002
**测试目标：** 验证可以查询乘客列表

**测试步骤：**
```bash
curl -X GET "http://localhost:3000/api/sj-user/chengke?sj_page=1&sj_page_size=10" \
  -H "Authorization: Bearer <token>"
```

---

### 11. 查询乘客详情

**测试编号：** TC-SJ-USER-CK-003
**测试目标：** 验证可以查询单个乘客的详细信息

**测试步骤：**
```bash
curl -X GET "http://localhost:3000/api/sj-user/chengke/<id>" \
  -H "Authorization: Bearer <token>"
```

---

### 12. 更新乘客信息

**测试编号：** TC-SJ-USER-CK-004
**测试目标：** 验证可以成功更新乘客信息

**测试步骤：**
```bash
curl -X PUT "http://localhost:3000/api/sj-user/chengke/<id>" \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer <token>" \
  -d '{
    "sj_xingming": "王五（已更新）",
    "sj_gongsi_mingcheng": "更新后的公司名"
  }'
```

---

## 测试用例 - 认证相关

### 13. 未登录访问接口

**测试编号：** TC-SJ-USER-AUTH-001
**测试目标：** 验证未登录时访问需要认证的接口返回正确错误

**测试步骤：**
```bash
curl -X GET "http://localhost:3000/api/sj-user/siji"
```

**预期结果：**
- 状态码：401
- sj_error: "SJ_AUTH_005"

---

### 14. 使用无效Token访问接口

**测试编号：** TC-SJ-USER-AUTH-002
**测试目标：** 验证无效Token访问时返回正确错误

**测试步骤：**
```bash
curl -X GET "http://localhost:3000/api/sj-user/siji" \
  -H "Authorization: Bearer invalidtoken123"
```

**预期结果：**
- 状态码：401
- sj_error: "SJ_AUTH_003"

---

## 测试执行记录

| 测试用例编号 | 测试用例名称 | 测试结果 | 测试日期 | 测试人员 | 备注 |
|------------|------------|---------|---------|--------|------|
| TC-SJ-USER-SJ-001 | 创建司机 - 成功 | | | | |
| TC-SJ-USER-SJ-002 | 创建司机 - 编号重复 | | | | |
| TC-SJ-USER-SJ-003 | 创建司机 - 手机号重复 | | | | |
| TC-SJ-USER-SJ-004 | 查询司机列表 | | | | |
| TC-SJ-USER-SJ-005 | 查询司机详情 | | | | |
| TC-SJ-USER-SJ-006 | 更新司机信息 | | | | |
| TC-SJ-USER-SJ-007 | 更新司机状态 | | | | |
| TC-SJ-USER-SJ-008 | 重置司机密码 | | | | |
| TC-SJ-USER-CK-001 | 创建乘客 - 成功 | | | | |
| TC-SJ-USER-CK-002 | 查询乘客列表 | | | | |
| TC-SJ-USER-CK-003 | 查询乘客详情 | | | | |
| TC-SJ-USER-CK-004 | 更新乘客信息 | | | | |
| TC-SJ-USER-AUTH-001 | 未登录访问接口 | | | | |
| TC-SJ-USER-AUTH-002 | 使用无效Token访问接口 | | | | |

---

## 测试总结

| 指标 | 数值 |
|------|------|
| 测试用例总数 | 14 |
| 通过数 | |
| 失败数 | |
| 通过率 | |

---

## 修订记录

| 版本 | 日期 | 修改人 | 说明 |
|------|------|--------|------|
| v1.0 | 2026-04-23 | 技术负责人 | 初始版本 |
