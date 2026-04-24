# sj-jujue 拒绝记录模块 API文档

---

## 1. 通用说明

### 1.1 基础路径
`/api/sj-jujue`

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

### 2.1 提交拒绝记录
- **方法**：POST
- **路径**：`/api/sj-jujue/tijiao`
- **请求体**：
```json
{
  "sj_dingdan_id": 1,
  "sj_siji_id": 1,
  "sj_jujue_yuanyin": "车辆故障",
  "sj_xiangxi_shuoming": "车辆临时出现故障，无法按时接单",
  "sj_weizhi": "116.403874,39.915168"
}
```
- **成功响应**：
```json
{
  "sj_code": 200,
  "sj_message": "提交成功",
  "sj_data": {
    "sj_id": 1,
    "sj_dingdan_id": 1,
    "sj_siji_id": 1,
    "sj_jujue_yuanyin": "车辆故障",
    "sj_xiangxi_shuoming": "车辆临时出现故障，无法按时接单",
    "sj_shijian": "2026-04-24T12:30:00.000Z",
    "sj_weizhi": "116.403874,39.915168",
    "sj_chuli_zhuangtai": 0
  }
}
```

---

### 2.2 查询订单拒绝记录
- **方法**：GET
- **路径**：`/api/sj-jujue/dingdan/{dingdanId}`
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
      ...
    },
    {
      "sj_id": 2,
      "sj_dingdan_id": 1,
      ...
    }
  ]
}
```

---

### 2.3 查询司机拒绝记录
- **方法**：GET
- **路径**：`/api/sj-jujue/siji/{sijiId}`
- **路径参数**：sijiId - 司机ID
- **查询参数**：
  - chuliZhuangtai（可选）：处理状态筛选（0待处理，1已处理）
- **成功响应**：
```json
{
  "sj_code": 200,
  "sj_message": "查询成功",
  "sj_data": [
    {
      "sj_id": 1,
      "sj_siji_id": 1,
      ...
    }
  ]
}
```

---

### 2.4 查询单个拒绝详情
- **方法**：GET
- **路径**：`/api/sj-jujue/{id}`
- **路径参数**：id - 拒绝记录ID
- **成功响应**：
```json
{
  "sj_code": 200,
  "sj_message": "查询成功",
  "sj_data": {
    "sj_id": 1,
    "sj_dingdan_id": 1,
    "sj_siji_id": 1,
    ...
  }
}
```

---

### 2.5 更新处理状态
- **方法**：PATCH
- **路径**：`/api/sj-jujue/{id}/chuli`
- **路径参数**：id - 拒绝记录ID
- **请求体**：
```json
{
  "sj_chuli_zhuangtai": 1
}
```
- **成功响应**：
```json
{
  "sj_code": 200,
  "sj_message": "更新成功",
  "sj_data": {
    "sj_id": 1,
    "sj_chuli_zhuangtai": 1,
    ...
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
