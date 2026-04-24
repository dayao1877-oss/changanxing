# sj-vehicle 车辆管理模块 API 文档

> 文档版本：v1.0
> 创建日期：2026-04-23
> 模块名称：sj-vehicle（车辆管理模块）
> 基础路径：/api/sj-vehicle

---

## 通用说明

### 认证方式
所有接口都需要在请求头中携带有效的 Token：
```
Authorization: Bearer <token>
```

### 统一响应格式

**成功响应**：
```json
{
  "sj_code": 200,
  "sj_message": "操作成功",
  "sj_data": {}
}
```

**分页列表响应**：
```json
{
  "sj_code": 200,
  "sj_message": "查询成功",
  "sj_data": {
    "sj_list": [],
    "sj_total": 100,
    "sj_page": 1,
    "sj_page_size": 10
  }
}
```

---

## 1. 车辆管理接口

### 1.1 创建车辆

**接口路径**：`POST /api/sj-vehicle/cheliang`

**接口描述**：创建新的车辆信息

**请求参数**：
```json
{
  "sj_chepaihao": "京A12345",
  "sj_pinpai": "宝马",
  "sj_xinghao": "5系",
  "sj_yanse": "黑色",
  "sj_nianfen": 2022,
  "sj_zhuangtai": 1,
  "sj_siji_id": 1,
  "sj_beizhu": "备注信息"
}
```

**参数说明**：
| 参数名 | 类型 | 必填 | 说明 |
|--------|------|------|------|
| sj_chepaihao | String | 是 | 车牌号（唯一） |
| sj_pinpai | String | 否 | 品牌 |
| sj_xinghao | String | 否 | 型号 |
| sj_yanse | String | 否 | 颜色 |
| sj_nianfen | Int | 否 | 年份 |
| sj_zhuangtai | Int | 否 | 状态（1启用 0禁用），默认1 |
| sj_siji_id | Int | 否 | 绑定的司机ID |
| sj_beizhu | String | 否 | 备注 |

**响应示例**：
```json
{
  "sj_code": 200,
  "sj_message": "创建成功",
  "sj_data": {
    "sj_id": 1,
    "sj_chepaihao": "京A12345"
  }
}
```

---

### 1.2 查询车辆列表

**接口路径**：`GET /api/sj-vehicle/cheliang`

**接口描述**：分页查询车辆列表，支持筛选

**查询参数**：
| 参数名 | 类型 | 必填 | 默认值 | 说明 |
|--------|------|------|--------|------|
| sj_page | Number | 否 | 1 | 页码 |
| sj_page_size | Number | 否 | 10 | 每页数量 |
| sj_zhuangtai | Number | 否 | | 状态筛选（0禁用 1启用） |
| sj_siji_id | Number | 否 | | 司机ID筛选 |
| sj_keyword | String | 否 | | 关键词搜索（车牌、品牌、型号） |

**响应示例**：
```json
{
  "sj_code": 200,
  "sj_message": "查询成功",
  "sj_data": {
    "sj_list": [
      {
        "sj_id": 1,
        "sj_chepaihao": "京A12345",
        "sj_pinpai": "宝马",
        "sj_xinghao": "5系",
        "sj_yanse": "黑色",
        "sj_zhuangtai": 1,
        "sj_chuangjian_shijian": "2026-04-23T00:00:00.000Z"
      }
    ],
    "sj_total": 1,
    "sj_page": 1,
    "sj_page_size": 10
  }
}
```

---

### 1.3 查询车辆详情

**接口路径**：`GET /api/sj-vehicle/cheliang/:id`

**接口描述**：根据ID查询车辆详细信息，包含关联的司机信息

**路径参数**：
| 参数名 | 类型 | 必填 | 说明 |
|--------|------|------|------|
| id | Number | 是 | 车辆ID |

**响应示例**：
```json
{
  "sj_code": 200,
  "sj_message": "查询成功",
  "sj_data": {
    "sj_id": 1,
    "sj_chepaihao": "京A12345",
    "sj_pinpai": "宝马",
    "sj_xinghao": "5系",
    "sj_yanse": "黑色",
    "sj_nianfen": 2022,
    "sj_zhuangtai": 1,
    "sj_siji": {
      "sj_id": 1,
      "sj_xingming": "张三",
      "sj_shouji": "13800138000"
    }
  }
}
```

---

### 1.4 更新车辆信息

**接口路径**：`PUT /api/sj-vehicle/cheliang/:id`

**接口描述**：更新车辆基本信息

**路径参数**：
| 参数名 | 类型 | 必填 | 说明 |
|--------|------|------|------|
| id | Number | 是 | 车辆ID |

**请求体**：
```json
{
  "sj_pinpai": "奔驰",
  "sj_xinghao": "E级",
  "sj_yanse": "白色",
  "sj_nianfen": 2023,
  "sj_beizhu": "更新后的备注"
}
```

---

### 1.5 删除车辆

**接口路径**：`DELETE /api/sj-vehicle/cheliang/:id`

**接口描述**：删除车辆记录

**路径参数**：
| 参数名 | 类型 | 必填 | 说明 |
|--------|------|------|------|
| id | Number | 是 | 车辆ID |

---

### 1.6 更新车辆状态

**接口路径**：`PATCH /api/sj-vehicle/cheliang/:id/status`

**接口描述**：修改车辆状态

**路径参数**：
| 参数名 | 类型 | 必填 | 说明 |
|--------|------|------|------|
| id | Number | 是 | 车辆ID |

**请求体**：
```json
{
  "sj_zhuangtai": 0
}
```

---

### 1.7 绑定司机

**接口路径**：`PATCH /api/sj-vehicle/cheliang/:id/bind-siji`

**接口描述**：将车辆与司机进行绑定

**路径参数**：
| 参数名 | 类型 | 必填 | 说明 |
|--------|------|------|------|
| id | Number | 是 | 车辆ID |

**请求体**：
```json
{
  "sj_siji_id": 1
}
```

---

## 修订记录

| 版本 | 日期 | 修改人 | 说明 |
|------|------|--------|------|
| v1.0 | 2026-04-23 | 技术负责人 | 初始版本，车辆管理API |
