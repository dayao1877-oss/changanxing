# sj-order 订单管理模块 API 文档

> 文档版本：v1.0
> 创建日期：2026-04-23
> 模块名称：sj-order（订单管理模块）
> 基础路径：/api/sj-order

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

## 1. 订单管理接口

### 1.1 创建订单

**接口路径**：`POST /api/sj-order/dingdan`

**接口描述**：创建新订单

**请求参数**：
```json
{
  "sj_dingdan_hao": "DD202604230001",
  "sj_chengke_id": 1,
  "sj_shifadi_dizhi": "北京市朝阳区XXX",
  "sj_shifadi_weizhi": "116.480881,39.989410",
  "sj_mudedi_dizhi": "北京市海淀区XXX",
  "sj_mudedi_weizhi": "116.310316,39.991561",
  "sj_licheng_zhong": 15.5,
  "sj_jine": 50.00,
  "sj_siji_ticheng": 35.00,
  "sj_laiyuan": 1,
  "sj_beizhu": "备注信息"
}
```

**参数说明**：
| 参数名 | 类型 | 必填 | 说明 |
|--------|------|------|------|
| sj_dingdan_hao | String | 是 | 订单号（唯一） |
| sj_chengke_id | Int | 否 | 乘客ID |
| sj_shifadi_dizhi | String | 否 | 出发地地址 |
| sj_shifadi_weizhi | String | 否 | 出发地经纬度 |
| sj_mudedi_dizhi | String | 否 | 目的地地址 |
| sj_mudedi_weizhi | String | 否 | 目的地经纬度 |
| sj_licheng_zhong | Decimal | 否 | 预计里程 |
| sj_jine | Decimal | 否 | 订单金额 |
| sj_siji_ticheng | Decimal | 否 | 司机提成 |
| sj_laiyuan | Int | 否 | 订单来源 |
| sj_beizhu | String | 否 | 备注 |

**响应示例**：
```json
{
  "sj_code": 200,
  "sj_message": "创建成功",
  "sj_data": {
    "sj_id": 1,
    "sj_dingdan_hao": "DD202604230001",
    "sj_zhuangtai": 0
  }
}
```

---

### 1.2 查询订单列表

**接口路径**：`GET /api/sj-order/dingdan`

**接口描述**：分页查询订单列表，支持筛选

**查询参数**：
| 参数名 | 类型 | 必填 | 默认值 | 说明 |
|--------|------|------|--------|------|
| sj_page | Number | 否 | 1 | 页码 |
| sj_page_size | Number | 否 | 10 | 每页数量 |
| sj_zhuangtai | Number | 否 | | 订单状态筛选 |
| sj_siji_id | Number | 否 | | 司机ID筛选 |
| sj_chengke_id | Number | 否 | | 乘客ID筛选 |

**响应示例**：
```json
{
  "sj_code": 200,
  "sj_message": "查询成功",
  "sj_data": {
    "sj_list": [
      {
        "sj_id": 1,
        "sj_dingdan_hao": "DD202604230001",
        "sj_shifadi_dizhi": "北京市朝阳区XXX",
        "sj_mudedi_dizhi": "北京市海淀区XXX",
        "sj_jine": 50.00,
        "sj_zhuangtai": 0,
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

### 1.3 查询订单详情

**接口路径**：`GET /api/sj-order/dingdan/:id`

**接口描述**：根据ID查询订单详细信息，包含关联的司机和乘客信息

**路径参数**：
| 参数名 | 类型 | 必填 | 说明 |
|--------|------|------|------|
| id | Number | 是 | 订单ID |

**响应示例**：
```json
{
  "sj_code": 200,
  "sj_message": "查询成功",
  "sj_data": {
    "sj_id": 1,
    "sj_dingdan_hao": "DD202604230001",
    "sj_shifadi_dizhi": "北京市朝阳区XXX",
    "sj_mudedi_dizhi": "北京市海淀区XXX",
    "sj_jine": 50.00,
    "sj_zhuangtai": 0,
    "sj_siji": {
      "sj_id": 1,
      "sj_xingming": "张三",
      "sj_chepaihao": "京A12345"
    },
    "sj_chengke": {
      "sj_id": 1,
      "sj_xingming": "王五"
    }
  }
}
```

---

### 1.4 更新订单信息

**接口路径**：`PUT /api/sj-order/dingdan/:id`

**接口描述**：更新订单基本信息

**路径参数**：
| 参数名 | 类型 | 必填 | 说明 |
|--------|------|------|------|
| id | Number | 是 | 订单ID |

**请求体**：
```json
{
  "sj_shifadi_dizhi": "更新后的出发地",
  "sj_jine": 55.00,
  "sj_beizhu": "更新后的备注"
}
```

---

### 1.5 更新订单状态

**接口路径**：`PATCH /api/sj-order/dingdan/:id/status`

**接口描述**：修改订单状态
- 0: 待接单
- 1: 进行中
- 2: 已完成
- 3: 已取消

**路径参数**：
| 参数名 | 类型 | 必填 | 说明 |
|--------|------|------|------|
| id | Number | 是 | 订单ID |

**请求体**：
```json
{
  "sj_zhuangtai": 1
}
```

---

### 1.6 指派司机

**接口路径**：`PATCH /api/sj-order/dingdan/:id/assign`

**接口描述**：将订单指派给特定司机

**路径参数**：
| 参数名 | 类型 | 必填 | 说明 |
|--------|------|------|------|
| id | Number | 是 | 订单ID |

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
| v1.0 | 2026-04-23 | 技术负责人 | 初始版本 |
