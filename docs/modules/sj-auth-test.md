# sj-auth 认证授权模块 测试文档

> 文档版本：v1.0
> 创建日期：2026-04-23
> 模块名称：sj-auth（认证授权模块）

---

## 测试前准备

### 1. 环境配置

复制 `.env.example` 为 `.env` 并配置数据库连接：

```env
DATABASE_URL="mysql://用户名:密码@localhost:3306/siji_db"
JWT_SECRET="sj-jwt-secret-key-change-in-production"
AMAP_KEY="***************************"
```

### 2. 数据库初始化

```bash
# 生成Prisma Client
cd web
npx prisma generate

# 执行数据库迁移（需要先创建数据库）
npx prisma db push
```

### 3. 创建测试数据

```bash
# 运行测试数据脚本
npx tsx server/scripts/seed-test-siji.ts
```

测试账号信息：
- 手机号：13800138000
- 密码：123456

### 4. 启动开发服务器

```bash
npm run dev
```

服务地址：http://localhost:3000

---

## 测试用例

### 测试用例 1：登录成功

**测试编号**：TC-SJ-AUTH-001

**测试目的**：验证使用正确的手机号和密码可以成功登录

**前置条件**：
- 数据库中存在测试司机账号（13800138000）

**测试步骤**：
1. 发送POST请求到 `/api/sj-auth/login`
2. 请求体：
```json
{
  "sj_shouji": "13800138000",
  "sj_mima": "123456"
}
```

**预期结果**：
- 状态码：200
- 返回包含 `sj_token` 和 `sj_siji` 信息
- `sj_code` 为 200
- `sj_message` 为 "登录成功"

**实际结果**：待测试

**测试状态**：待执行

---

### 测试用例 2：登录失败 - 密码错误

**测试编号**：TC-SJ-AUTH-002

**测试目的**：验证使用错误的密码无法登录

**前置条件**：无

**测试步骤**：
1. 发送POST请求到 `/api/sj-auth/login`
2. 请求体：
```json
{
  "sj_shouji": "13800138000",
  "sj_mima": "wrongpassword"
}
```

**预期结果**：
- 状态码：401
- `sj_code` 为 401
- `sj_message` 为 "手机号或密码错误"
- `sj_error` 为 "SJ_AUTH_001"

**实际结果**：待测试

**测试状态**：待执行

---

### 测试用例 3：登录失败 - 账号不存在

**测试编号**：TC-SJ-AUTH-003

**测试目的**：验证使用不存在的手机号无法登录

**前置条件**：无

**测试步骤**：
1. 发送POST请求到 `/api/sj-auth/login`
2. 请求体：
```json
{
  "sj_shouji": "99999999999",
  "sj_mima": "123456"
}
```

**预期结果**：
- 状态码：401
- `sj_code` 为 401
- `sj_message` 为 "手机号或密码错误"
- `sj_error` 为 "SJ_AUTH_001"

**实际结果**：待测试

**测试状态**：待执行

---

### 测试用例 4：登录失败 - 参数缺失

**测试编号**：TC-SJ-AUTH-004

**测试目的**：验证缺少必填参数时返回正确的错误

**前置条件**：无

**测试步骤**：
1. 发送POST请求到 `/api/sj-auth/login`
2. 请求体：
```json
{}
```

**预期结果**：
- 状态码：400
- `sj_code` 为 400
- `sj_message` 为 "手机号和密码不能为空"

**实际结果**：待测试

**测试状态**：待执行

---

### 测试用例 5：获取当前用户信息 - 成功

**测试编号**：TC-SJ-AUTH-005

**测试目的**：验证使用有效的Token可以获取当前用户信息

**前置条件**：
- 已通过TC-SJ-AUTH-001获取到有效的Token

**测试步骤**：
1. 发送GET请求到 `/api/sj-auth/me`
2. 请求头：
```
Authorization: Bearer <有效Token>
```

**预期结果**：
- 状态码：200
- `sj_code` 为 200
- `sj_message` 为 "获取成功"
- `sj_data` 包含司机的详细信息

**实际结果**：待测试

**测试状态**：待执行

---

### 测试用例 6：获取当前用户信息 - 未登录

**测试编号**：TC-SJ-AUTH-006

**测试目的**：验证未携带Token时返回正确的错误

**前置条件**：无

**测试步骤**：
1. 发送GET请求到 `/api/sj-auth/me`
2. 不携带Authorization请求头

**预期结果**：
- 状态码：401
- `sj_code` 为 401
- `sj_message` 为 "未登录"
- `sj_error` 为 "SJ_AUTH_005"

**实际结果**：待测试

**测试状态**：待执行

---

### 测试用例 7：获取当前用户信息 - Token无效

**测试编号**：TC-SJ-AUTH-007

**测试目的**：验证使用无效Token时返回正确的错误

**前置条件**：无

**测试步骤**：
1. 发送GET请求到 `/api/sj-auth/me`
2. 请求头：
```
Authorization: Bearer invalid_token
```

**预期结果**：
- 状态码：401
- `sj_code` 为 401
- `sj_message` 为 "Token无效"
- `sj_error` 为 "SJ_AUTH_003"

**实际结果**：待测试

**测试状态**：待执行

---

### 测试用例 8：刷新Token - 成功

**测试编号**：TC-SJ-AUTH-008

**测试目的**：验证使用有效的Token可以刷新Token

**前置条件**：
- 已通过TC-SJ-AUTH-001获取到有效的Token

**测试步骤**：
1. 发送POST请求到 `/api/sj-auth/refresh`
2. 请求头：
```
Authorization: Bearer <有效Token>
```

**预期结果**：
- 状态码：200
- `sj_code` 为 200
- `sj_message` 为 "刷新成功"
- `sj_data` 包含新的Token

**实际结果**：待测试

**测试状态**：待执行

---

### 测试用例 9：司机登出

**测试编号**：TC-SJ-AUTH-009

**测试目的**：验证登出接口正常工作

**前置条件**：无

**测试步骤**：
1. 发送POST请求到 `/api/sj-auth/logout`

**预期结果**：
- 状态码：200
- `sj_code` 为 200
- `sj_message` 为 "登出成功"

**实际结果**：待测试

**测试状态**：待执行

---

## 测试工具推荐

### 使用curl测试

```bash
# 登录
curl -X POST http://localhost:3000/api/sj-auth/login \
  -H "Content-Type: application/json" \
  -d '{"sj_shouji":"13800138000","sj_mima":"123456"}'

# 获取当前用户信息（替换为实际的Token）
curl -X GET http://localhost:3000/api/sj-auth/me \
  -H "Authorization: Bearer <your_token>"
```

### 使用Postman/ApiPost测试

1. 创建新的Collection
2. 添加上述测试用例到Collection
3. 设置环境变量保存Token
4. 批量执行测试

---

## 测试报告模板

### 测试执行记录

| 测试用例编号 | 测试用例名称 | 测试结果 | 测试日期 | 测试人员 | 备注 |
|------------|------------|---------|---------|--------|------|
| TC-SJ-AUTH-001 | 登录成功 | | | | |
| TC-SJ-AUTH-002 | 登录失败 - 密码错误 | | | | |
| TC-SJ-AUTH-003 | 登录失败 - 账号不存在 | | | | |
| TC-SJ-AUTH-004 | 登录失败 - 参数缺失 | | | | |
| TC-SJ-AUTH-005 | 获取当前用户信息 - 成功 | | | | |
| TC-SJ-AUTH-006 | 获取当前用户信息 - 未登录 | | | | |
| TC-SJ-AUTH-007 | 获取当前用户信息 - Token无效 | | | | |
| TC-SJ-AUTH-008 | 刷新Token - 成功 | | | | |
| TC-SJ-AUTH-009 | 司机登出 | | | | |

### 测试总结

- 测试用例总数：9
- 通过：
- 失败：
- 通过率：

---

## 修订记录

| 版本 | 日期 | 修改人 | 说明 |
|------|------|--------|------|
| v1.0 | 2026-04-23 | 技术负责人 | 初始版本 |
