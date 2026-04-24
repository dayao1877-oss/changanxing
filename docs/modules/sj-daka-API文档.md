# sj-daka 打卡管理模块 API文档

---

## 1. 通用说明

### 1.1 基础路径
`/api/sj-daka`

### 1.2 认证方式
所有接口都需要在请求头中携带JWT Token：
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

### 2.1 提交打卡
- **方法**：POST
- **路径**：`/api/sj-daka/tijiao`
- **请求头**：
  ```
  Authorization: Bearer <token>
  Content-Type: application/json
  ```
- **请求参数**：
  ```json
  {
    "sj_dingdan_id": 1,
    "sj_daka_leixing": 1,
    "sj_tujingdian_xuhao": null,
    "sj_weizhi": "116.403874,39.915168",
    "sj_dizhi": "北京市朝阳区",
    "sj_tupian_lujing": null
  }
  ```
- **参数说明**：
  | 字段 | 类型 | 必填 | 说明 |
  |------|------|-----|------|
  | sj_dingdan_id | Int | ✅ | 订单ID |
  | sj_daka_leixing | Int | ✅ | 打卡类型：1-始发地，2-途径点，3-目的地 |
  | sj_tujingdian_xuhao | Int | ❌ | 途径点序号（sj_daka_leixing=2时必填） |
  | sj_weizhi | String | ❌ | 经纬度坐标 |
  | sj_dizhi | String | ❌ | 详细地址 |
  | sj_tupian_lujing | String | ❌ | 照片路径（后续支持上传） |

- **成功响应**：
  ```json
  {
    "sj_code": 200,
    "sj_message": "打卡成功",
    "sj_data": {
      "sj_id": 1,
      "sj_dingdan_id": 1,
      "sj_siji_id": 1,
      "sj_daka_leixing": 1,
      "sj_tujingdian_xuhao": null,
      "sj_weizhi": "116.403874,39.915168",
      "sj_dizhi": "北京市朝阳区",
      "sj_tupian_lujing": null,
      "sj_daka_shijian": "2026-04-24T10:30:00.000Z",
      "sj_shangchuan_zhuangtai": 1
    }
  }
  ```

---

### 2.2 查询订单的打卡记录
- **方法**：GET
- **路径**：`/api/sj-daka/dingdan/{dingdanId}`
- **请求头**：
  ```
  Authorization: Bearer <token>
  ```
- **路径参数**：
  | 字段 | 类型 | 必填 | 说明 |
  |------|------|-----|------|
  | dingdanId | Int | ✅ | 订单ID |

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
        "sj_daka_leixing": 1,
        "sj_tujingdian_xuhao": null,
        "sj_weizhi": "116.403874,39.915168",
        "sj_dizhi": "北京市朝阳区",
        "sj_tupian_lujing": null,
        "sj_daka_shijian": "2026-04-24T10:30:00.000Z",
        "sj_shangchuan_zhuangtai": 1
      }
    ]
  }
  ```

---

### 2.3 查询打卡详情
- **方法**：GET
- **路径**：`/api/sj-daka/{id}`
- **请求头**：
  ```
  Authorization: Bearer <token>
  ```
- **路径参数**：
  | 字段 | 类型 | 必填 | 说明 |
  |------|------|-----|------|
  | id | Int | ✅ | 打卡记录ID |

- **成功响应**：
  ```json
  {
    "sj_code": 200,
    "sj_message": "查询成功",
    "sj_data": {
      "sj_id": 1,
      "sj_dingdan_id": 1,
      "sj_siji_id": 1,
      "sj_daka_leixing": 1,
      "sj_tujingdian_xuhao": null,
      "sj_weizhi": "116.403874,39.915168",
      "sj_dizhi": "北京市朝阳区",
      "sj_tupian_lujing": null,
      "sj_daka_shijian": "2026-04-24T10:30:00.000Z",
      "sj_shangchuan_zhuangtai": 1
    }
  }
  ```

---

## 3. 错误响应格式

```json
{
  "sj_code": 400,
  "sj_message": "参数错误",
  "sj_error": "详细错误信息"
}
```

---

文档版本：v1.0
创建日期：2026-04-24
维护者：技术负责人
