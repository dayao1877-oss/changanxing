# sj-dingwei 定位管理模块 API文档

---

## 1. 通用说明

### 1.1 基础路径
`/api/sj-dingwei`

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

### 2.1 上传单个定位
- **方法**：POST
- **路径**：`/api/sj-dingwei/shangchuan`
- **请求体**：
```json
{
  "sj_dingdan_id": 1,
  "sj_siji_id": 1,
  "sj_jingdu": 116.403874,
  "sj_weidu": 39.915168,
  "sj_haiba": 50.5,
  "sj_sudu": 60.0,
  "sj_fangxiang": 90.0,
  "sj_jingdu_zhi": 10.0,
  "sj_dingwei_shijian": "2026-04-24T12:30:00.000Z"
}
```
- **成功响应**：
```json
{
  "sj_code": 200,
  "sj_message": "上传成功",
  "sj_data": {
    "sj_id": "1",
    "sj_dingdan_id": 1,
    "sj_siji_id": 1,
    "sj_jingdu": 116.403874,
    "sj_weidu": 39.915168,
    ...
  }
}
```

---

### 2.2 批量上传定位
- **方法**：POST
- **路径**：`/api/sj-dingwei/piliang`
- **请求体**：
```json
{
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
}
```
- **成功响应**：
```json
{
  "sj_code": 200,
  "sj_message": "批量上传成功",
  "sj_data": {
    "sj_tiaoshu": 2,
    "sj_list": [ ... ]
  }
}
```

---

### 2.3 查询订单定位记录
- **方法**：GET
- **路径**：`/api/sj-dingwei/dingdan/{dingdanId}`
- **参数**：dingdanId - 订单ID
- **请求头**：Authorization
- **成功响应**：
```json
{
  "sj_code": 200,
  "sj_message": "查询成功",
  "sj_data": [
    { "sj_id": "1", ... },
    { "sj_id": "2", ... }
  ]
}
```

---

### 2.4 查询司机定位记录（按时间筛选）
- **方法**：GET
- **路径**：`/api/sj-dingwei/siji/{sijiId}?startTime=...&endTime=...`
- **路径参数**：sijiId - 司机ID
- **查询参数**：
  - startTime（可选）：开始时间
  - endTime（可选）：结束时间
- **成功响应**：
```json
{
  "sj_code": 200,
  "sj_message": "查询成功",
  "sj_data": [
    { "sj_id": "1", ... }
  ]
}
```

---

### 2.5 查询单个定位详情
- **方法**：GET
- **路径**：`/api/sj-dingwei/{id}`
- **路径参数**：id - 定位记录ID
- **成功响应**：
```json
{
  "sj_code": 200,
  "sj_message": "查询成功",
  "sj_data": { ... }
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
