# sj-jinji 紧急事件模块 API文档

---

## 1. 通用说明

### 1.1 基础路径
`/api/sj-jinji`

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

### 2.1 提交紧急事件
- **方法**：POST
- **路径**：`/api/sj-jinji/chufa`
- **请求体**：
```json
{
  "sj_siji_id": 1,
  "sj_dingdan_id": 1,
  "sj_weizhi": "116.403874,39.915168",
  "sj_tupian_lujing": "/uploads/sos.jpg",
  "sj_luyin_lujing": "/uploads/sos.mp3"
}
```
- **成功响应**：
```json
{
  "sj_code": 200,
  "sj_message": "触发成功",
  "sj_data": {
    "sj_id": 1,
    "sj_siji_id": 1,
    "sj_dingdan_id": 1,
    "sj_chufa_shijian": "2026-04-24T12:44:39.978Z",
    "sj_weizhi": "116.403874,39.915168",
    "sj_tupian_lujing": "/uploads/sos.jpg",
    "sj_luyin_lujing": "/uploads/sos.mp3",
    "sj_jiechu_shijian": null,
    "sj_jiechu_fangshi": null,
    "sj_chuli_ren": null,
    "sj_chuli_jieguo": null,
    "sj_beizhu": null
  }
}
```

---

### 2.2 查询订单紧急事件
- **方法**：GET
- **路径**：`/api/sj-jinji/dingdan/[dingdanId]`
- **路径参数**：dingdanId - 订单ID
- **成功响应**：
```json
{
  "sj_code": 200,
  "sj_message": "查询成功",
  "sj_data": [
    {
      "sj_id": 1,
      "sj_siji_id": 1,
      "sj_dingdan_id": 1,
      "sj_chufa_shijian": "2026-04-24T12:44:39.978Z",
      "sj_weizhi": "116.403874,39.915168",
      "sj_tupian_lujing": "/uploads/sos.jpg",
      "sj_luyin_lujing": "/uploads/sos.mp3",
      "sj_jiechu_shijian": null,
      "sj_jiechu_fangshi": null,
      "sj_chuli_ren": null,
      "sj_chuli_jieguo": null,
      "sj_beizhu": null
    }
  ]
}
```

---

### 2.3 查询司机紧急事件
- **方法**：GET
- **路径**：`/api/sj-jinji/siji/[sijiId]`
- **路径参数**：sijiId - 司机ID
- **成功响应**：
```json
{
  "sj_code": 200,
  "sj_message": "查询成功",
  "sj_data": [
    {
      "sj_id": 1,
      "sj_siji_id": 1,
      "sj_dingdan_id": 1,
      "sj_chufa_shijian": "2026-04-24T12:44:39.978Z",
      "sj_weizhi": "116.403874,39.915168",
      "sj_tupian_lujing": "/uploads/sos.jpg",
      "sj_luyin_lujing": "/uploads/sos.mp3",
      "sj_jiechu_shijian": null,
      "sj_jiechu_fangshi": null,
      "sj_chuli_ren": null,
      "sj_chuli_jieguo": null,
      "sj_beizhu": null
    }
  ]
}
```

---

### 2.4 查询单个紧急事件详情
- **方法**：GET
- **路径**：`/api/sj-jinji/[id]`
- **路径参数**：id - 紧急事件ID
- **成功响应**：
```json
{
  "sj_code": 200,
  "sj_message": "查询成功",
  "sj_data": {
    "sj_id": 1,
    "sj_siji_id": 1,
    "sj_dingdan_id": 1,
    "sj_chufa_shijian": "2026-04-24T12:44:39.978Z",
    "sj_weizhi": "116.403874,39.915168",
    "sj_tupian_lujing": "/uploads/sos.jpg",
    "sj_luyin_lujing": "/uploads/sos.mp3",
    "sj_jiechu_shijian": null,
    "sj_jiechu_fangshi": null,
    "sj_chuli_ren": null,
    "sj_chuli_jieguo": null,
    "sj_beizhu": null
  }
}
```

---

### 2.5 更新处理状态
- **方法**：PATCH
- **路径**：`/api/sj-jinji/[id]/chuli`
- **路径参数**：id - 紧急事件ID
- **请求体**：
```json
{
  "sj_chuli_ren": 1,
  "sj_chuli_jieguo": "已联系司机确认安全",
  "sj_beizhu": "需要进一步跟进"
}
```
- **成功响应**：
```json
{
  "sj_code": 200,
  "sj_message": "更新成功",
  "sj_data": {
    "sj_id": 1,
    "sj_siji_id": 1,
    "sj_dingdan_id": 1,
    "sj_chufa_shijian": "2026-04-24T12:44:39.978Z",
    "sj_weizhi": "116.403874,39.915168",
    "sj_tupian_lujing": "/uploads/sos.jpg",
    "sj_luyin_lujing": "/uploads/sos.mp3",
    "sj_jiechu_shijian": null,
    "sj_jiechu_fangshi": null,
    "sj_chuli_ren": 1,
    "sj_chuli_jieguo": "已联系司机确认安全",
    "sj_beizhu": "需要进一步跟进"
  }
}
```

---

### 2.6 解除紧急事件
- **方法**：PATCH
- **路径**：`/api/sj-jinji/[id]/jiechu`
- **路径参数**：id - 紧急事件ID
- **请求体**：
```json
{
  "sj_jiechu_fangshi": "自动解除",
  "sj_beizhu": "司机主动解除"
}
```
- **成功响应**：
```json
{
  "sj_code": 200,
  "sj_message": "解除成功",
  "sj_data": {
    "sj_id": 1,
    "sj_siji_id": 1,
    "sj_dingdan_id": 1,
    "sj_chufa_shijian": "2026-04-24T12:44:39.978Z",
    "sj_weizhi": "116.403874,39.915168",
    "sj_tupian_lujing": "/uploads/sos.jpg",
    "sj_luyin_lujing": "/uploads/sos.mp3",
    "sj_jiechu_shijian": "2026-04-24T12:45:39.978Z",
    "sj_jiechu_fangshi": "自动解除",
    "sj_chuli_ren": 1,
    "sj_chuli_jieguo": "已联系司机确认安全",
    "sj_beizhu": "司机主动解除"
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
