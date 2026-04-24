# sj-caiwu 财务记录模块 API文档

---

## 1. 通用说明

### 1.1 基础路径
`/api/sj-caiwu`

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

### 2.1 添加财务记录
- **方法**：POST
- **路径**：`/api/sj-caiwu/tianjia`
- **请求体**：
```json
{
  "sj_dingdan_id": 1,
  "sj_siji_id": 1,
  "sj_chengke_id": 1,
  "sj_jine": 50.00,
  "sj_leixing": "shoukuan",
  "sj_zhuangtai": "wancheng",
  "sj_beizhu": "订单1车费"
}
```
- **成功响应**：
```json
{
  "sj_code": 200,
  "sj_message": "添加成功",
  "sj_data": {
    "sj_id": 1,
    "sj_dingdan_id": 1,
    "sj_siji_id": 1,
    "sj_chengke_id": 1,
    "sj_jine": 50.00,
    "sj_leixing": "shoukuan",
    "sj_zhuangtai": "wancheng",
    "sj_shijian": "2026-04-24T12:00:00.000Z",
    "sj_beizhu": "订单1车费"
  }
}
```

---

### 2.2 查询单个记录详情
- **方法**：GET
- **路径**：`/api/sj-caiwu/[id]`
- **路径参数**：id - 财务记录ID
- **成功响应**：
```json
{
  "sj_code": 200,
  "sj_message": "查询成功",
  "sj_data": {
    "sj_id": 1,
    "sj_dingdan_id": 1,
    "sj_siji_id": 1,
    "sj_chengke_id": 1,
    "sj_jine": 50.00,
    "sj_leixing": "shoukuan",
    "sj_zhuangtai": "wancheng",
    "sj_shijian": "2026-04-24T12:00:00.000Z",
    "sj_beizhu": "订单1车费"
  }
}
```

---

### 2.3 查询订单财务记录
- **方法**：GET
- **路径**：`/api/sj-caiwu/dingdan/[dingdanId]`
- **路径参数**：dingdanId - 订单ID
- **成功响应**：
```json
{
  "sj_code": 200,
  "sj_message": "查询成功",
  "sj_data": [
    {
      "sj_id": 1,
      "sj_dingdan_id": 1,
      "sj_siji_id": 1,
      "sj_chengke_id": 1,
      "sj_jine": 50.00,
      "sj_leixing": "shoukuan",
      "sj_zhuangtai": "wancheng",
      "sj_shijian": "2026-04-24T12:00:00.000Z",
      "sj_beizhu": "订单1车费"
    }
  ]
}
```

---

### 2.4 查询司机财务记录
- **方法**：GET
- **路径**：`/api/sj-caiwu/siji/[sijiId]`
- **路径参数**：sijiId - 司机ID
- **成功响应**：
```json
{
  "sj_code": 200,
  "sj_message": "查询成功",
  "sj_data": [
    {
      "sj_id": 1,
      "sj_dingdan_id": 1,
      "sj_siji_id": 1,
      "sj_chengke_id": 1,
      "sj_jine": 50.00,
      "sj_leixing": "shoukuan",
      "sj_zhuangtai": "wancheng",
      "sj_shijian": "2026-04-24T12:00:00.000Z",
      "sj_beizhu": "订单1车费"
    }
  ]
}
```

---

### 2.5 查询乘客财务记录
- **方法**：GET
- **路径**：`/api/sj-caiwu/chengke/[chengkeId]`
- **路径参数**：chengkeId - 乘客ID
- **成功响应**：
```json
{
  "sj_code": 200,
  "sj_message": "查询成功",
  "sj_data": [
    {
      "sj_id": 1,
      "sj_dingdan_id": 1,
      "sj_siji_id": 1,
      "sj_chengke_id": 1,
      "sj_jine": 50.00,
      "sj_leixing": "shoukuan",
      "sj_zhuangtai": "wancheng",
      "sj_shijian": "2026-04-24T12:00:00.000Z",
      "sj_beizhu": "订单1车费"
    }
  ]
}
```

---

### 2.6 更新状态
- **方法**：PATCH
- **路径**：`/api/sj-caiwu/[id]/zhuangtai`
- **路径参数**：id - 财务记录ID
- **请求体**：
```json
{
  "sj_zhuangtai": "wancheng",
  "sj_beizhu": "已完成"
}
```
- **成功响应**：
```json
{
  "sj_code": 200,
  "sj_message": "更新成功",
  "sj_data": {
    "sj_id": 1,
    "sj_dingdan_id": 1,
    "sj_siji_id": 1,
    "sj_chengke_id": 1,
    "sj_jine": 50.00,
    "sj_leixing": "shoukuan",
    "sj_zhuangtai": "wancheng",
    "sj_shijian": "2026-04-24T12:00:00.000Z",
    "sj_beizhu": "已完成"
  }
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
