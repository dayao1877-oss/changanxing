# sj-auth 认证授权模块 API 文档

> 文档版本：v1.0
> 创建日期：2026-04-23
> 模块名称：sj-auth（认证授权模块）
> 基础路径：/api/sj-auth

---

## 通用说明

### 认证方式
需要认证的接口需在请求头中携带：
```
Authorization: Bearer {token}
```

### 统一响应格式

#### 成功响应
```json
{
  "sj_code": 200,
  "sj_message": "操作成功",
  "sj_data": {}
}
```

#### 错误响应
```json
{
  "sj_code": 400,
  "sj_message": "错误信息",
  "sj_error": "SJ_AUTH_001"
}
```

---

## 接口详情

### 1. 司机登录

**接口路径：** `POST /api/sj-auth/login`

**接口描述：** 司机使用手机号和密码登录系统

**请求参数：**
```json
{
  "sj_shouji": "13800138000",
  "sj_mima": "123456"
}
```

**参数说明：**
| 参数名 | 类型 | 必填 | 说明 |
|-------|------|------|------|
| sj_shouji | string | 是 | 手机号 |
| sj_mima | string | 是 | 密码 |

**响应示例：**
```json
{
  "sj_code": 200,
  "sj_message": "登录成功",
  "sj_data": {
    "sj_token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
    "sj_siji": {
      "sj_id": 1,
      "sj_bianhao": "SJ001",
      "sj_xingming": "张三",
      "sj_shouji": "13800138000",
      "sj_zhuangtai": 1
    }
  }
}
```

**错误码：**
| 错误码 | 说明 |
|-------|------|
| SJ_AUTH_001 | 手机号或密码错误 |
| SJ_AUTH_002 | 账号已被禁用 |

---

### 2. 刷新Token

**接口路径：** `POST /api/sj-auth/refresh`

**接口描述：** 刷新过期前的Token

**请求头：**
```
Authorization: Bearer {token}
```

**响应示例：**
```json
{
  "sj_code": 200,
  "sj_message": "刷新成功",
  "sj_data": {
    "sj_token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."
  }
}
```

**错误码：**
| 错误码 | 说明 |
|-------|------|
| SJ_AUTH_003 | Token无效 |
| SJ_AUTH_004 | Token已过期 |

---

### 3. 司机登出

**接口路径：** `POST /api/sj-auth/logout`

**接口描述：** 司机退出登录

**请求头：**
```
Authorization: Bearer {token}
```

**响应示例：**
```json
{
  "sj_code": 200,
  "sj_message": "登出成功",
  "sj_data": null
}
```

---

### 4. 获取当前用户信息

**接口路径：** `GET /api/sj-auth/me`

**接口描述：** 获取当前登录司机的信息

**请求头：**
```
Authorization: Bearer {token}
```

**响应示例：**
```json
{
  "sj_code": 200,
  "sj_message": "获取成功",
  "sj_data": {
    "sj_id": 1,
    "sj_bianhao": "SJ001",
    "sj_xingming": "张三",
    "sj_shouji": "13800138000",
    "sj_shenfenzheng": "110101199001011234",
    "sj_chepaihao": "京A12345",
    "sj_zhuangtai": 1,
    "sj_ruzhi_shijian": "2024-01-01T00:00:00.000Z",
    "sj_chuangjian_shijian": "2024-01-01T00:00:00.000Z"
  }
}
```

**错误码：**
| 错误码 | 说明 |
|-------|------|
| SJ_AUTH_003 | Token无效 |
| SJ_AUTH_004 | Token已过期 |
| SJ_AUTH_005 | 未登录 |

---

## 测试用例

### 测试用例1：登录成功
- 准备：确保数据库中存在手机号为13800138000的司机
- 操作：调用登录接口，传入正确的手机号和密码
- 预期：返回200状态码和Token

### 测试用例2：登录失败（密码错误）
- 操作：调用登录接口，传入正确的手机号和错误的密码
- 预期：返回错误码SJ_AUTH_001

### 测试用例3：登录失败（账号禁用）
- 准备：将司机状态设置为0（禁用）
- 操作：调用登录接口
- 预期：返回错误码SJ_AUTH_002

### 测试用例4：获取当前用户信息
- 准备：先登录获取有效Token
- 操作：使用Token调用获取当前用户信息接口
- 预期：返回司机的详细信息

### 测试用例5：Token验证失败
- 操作：使用无效的Token调用需要认证的接口
- 预期：返回错误码SJ_AUTH_003或SJ_AUTH_005

---

## 修订记录

| 版本 | 日期 | 修改人 | 说明 |
|------|------|--------|------|
| v1.0 | 2026-04-23 | 技术负责人 | 初始版本 |
