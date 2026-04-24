# sj-caozuo 操作日志模块 API文档

---

## 1. 通用说明

### 1.1 基础路径
`/api/sj-caozuo`

### 1.2 认证方式
所有接口都需要在Header中携带JWT Token：
```
Authorization: Bearer <token>
```

### 1.3 统一响应格式
```json
{
  "sj_code": 200,
  "sj_message": "success",
  "sj_data": {}
}
```

---

## 2. 接口详细说明

### 2.1 添加操作日志
- **方法**：POST
- **路径**：`/api/sj-caozuo/tianjia`
- **请求体**：
```json
{
  "sj_mokuai": "用户管理",
  "sj_caozuo": "添加用户",
  "sj_caozuozhe_id": 1,
  "sj_ip": "192.168.1.1",
  "sj_shuju": "{\"sj_zhanghao\":\"test\"}"
}
```
- **成功响应**：
```json
{
  "sj_code": 200,
  "sj_message": "添加成功",
  "sj_data": {
    "sj_id": 1,
    "sj_mokuai": "用户管理",
    "sj_caozuo": "添加用户",
    "sj_caozuozhe_id": 1,
    "sj_ip": "192.168.1.1",
    "sj_shijian": "2026-04-24T12:00:00.000Z",
    "sj_shuju": "{\"sj_zhanghao\":\"test\"}"
  }
}
```

---

### 2.2 查询单个操作日志
- **方法**：GET
- **路径**：`/api/sj-caozuo/[id]`
- **路径参数**：id - 操作日志ID
- **成功响应**：
```json
{
  "sj_code": 200,
  "sj_message": "查询成功",
  "sj_data": {
    "sj_id": 1,
    "sj_mokuai": "用户管理",
    "sj_caozuo": "添加用户",
    "sj_caozuozhe_id": 1,
    "sj_ip": "192.168.1.1",
    "sj_shijian": "2026-04-24T12:00:00.000Z",
    "sj_shuju": "{\"sj_zhanghao\":\"test\"}"
  }
}
```

---

### 2.3 查询模块的操作日志
- **方法**：GET
- **路径**：`/api/sj-caozuo/mokuai/[mokuaiName]`
- **路径参数**：mokuaiName - 模块名（URL编码）
- **成功响应**：
```json
{
  "sj_code": 200,
  "sj_message": "查询成功",
  "sj_data": [
    {
      "sj_id": 1,
      "sj_mokuai": "用户管理",
      "sj_caozuo": "添加用户",
      "sj_caozuozhe_id": 1,
      "sj_ip": "192.168.1.1",
      "sj_shijian": "2026-04-24T12:00:00.000Z",
      "sj_shuju": "{\"sj_zhanghao\":\"test\"}"
    }
  ]
}
```

---

### 2.4 查询操作者的操作日志
- **方法**：GET
- **路径**：`/api/sj-caozuo/caozuozhe/[caozuozheId]`
- **路径参数**：caozuozheId - 操作者ID
- **成功响应**：
```json
{
  "sj_code": 200,
  "sj_message": "查询成功",
  "sj_data": [
    {
      "sj_id": 1,
      "sj_mokuai": "用户管理",
      "sj_caozuo": "添加用户",
      "sj_caozuozhe_id": 1,
      "sj_ip": "192.168.1.1",
      "sj_shijian": "2026-04-24T12:00:00.000Z",
      "sj_shuju": "{\"sj_zhanghao\":\"test\"}"
    }
  ]
}
```

---

### 2.5 查询时间段的操作日志
- **方法**：GET
- **路径**：`/api/sj-caozuo/shijian`
- **查询参数**：
  - start - 开始时间（ISO 8601格式）
  - end - 结束时间（ISO 8601格式）
- **成功响应**：
```json
{
  "sj_code": 200,
  "sj_message": "查询成功",
  "sj_data": [
    {
      "sj_id": 1,
      "sj_mokuai": "用户管理",
      "sj_caozuo": "添加用户",
      "sj_caozuozhe_id": 1,
      "sj_ip": "192.168.1.1",
      "sj_shijian": "2026-04-24T12:00:00.000Z",
      "sj_shuju": "{\"sj_zhanghao\":\"test\"}"
    }
  ]
}
```

---

## 3. 错误码
| 错误码 | 说明 |
|-------|------|
| 400 | 参数错误 |
| 401 | 未授权 |
| 404 | 资源不存在 |
| 500 | 服务器内部错误 |

---

文档版本：v1.0
创建日期：2026-04-24
维护者：技术负责人
