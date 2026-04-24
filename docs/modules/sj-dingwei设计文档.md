# sj-dingwei 定位管理模块 设计文档

---

## 1. 模块概述

### 1.1 功能描述
定位记录管理，支持司机实时定位上传、定位记录查询、轨迹回放。

### 1.2 技术依赖
- 数据库：sj_dingwei_jilu表
- 认证：sj-auth JWT Token
- 工具函数：sj-common（sjRequireAuth、sjConvertBigInts）

---

## 2. 数据结构

### 2.1 定位记录实体

| 字段名 | 类型 | 必填 | 说明 |
|------|------|-----|------|
| sj_id | BigInt | ✅ | 主键ID |
| sj_dingdan_id | Int | ❌ | 关联的订单ID |
| sj_siji_id | Int | ✅ | 司机ID |
| sj_jingdu | Decimal | ❌ | 经度 |
| sj_weidu | Decimal | ❌ | 纬度 |
| sj_haiba | Decimal | ❌ | 海拔 |
| sj_sudu | Decimal | ❌ | 速度 |
| sj_fangxiang | Decimal | ❌ | 方向 |
| sj_jingdu_zhi | Decimal | ❌ | 精度 |
| sj_dingwei_shijian | DateTime | ✅ | 定位时间 |
| sj_shangchuan_zhuangtai | Int | ✅ | 上传状态（0-待上传，1-已上传） |

---

## 3. 功能设计

### 3.1 功能列表
1. **上传定位** - 司机上传单个定位记录
2. **批量上传定位** - 司机批量上传多个定位记录（离线恢复）
3. **查询订单定位记录** - 查询某个订单的所有定位轨迹
4. **查询司机定位记录** - 查询某个司机的定位记录（按时间筛选）
5. **查询定位详情** - 查询单个定位记录详情

### 3.2 业务规则
- 每个定位记录关联一个订单或司机
- 定位时间不能为空
- 支持批量操作（最多100条/次）

---

## 4. 模块接口

| 接口名 | 方法 | 路径 | 说明 |
|------|------|-----|------|
| 上传定位 | POST | /api/sj-dingwei/shangchuan | 上传单个定位 |
| 批量上传 | POST | /api/sj-dingwei/piliang | 批量上传定位 |
| 查询订单定位 | GET | /api/sj-dingwei/dingdan/{dingdanId} | 查询订单轨迹 |
| 查询司机定位 | GET | /api/sj-dingwei/siji/{sijiId}?startTime=...&endTime=... | 查询司机按时间筛选 |
| 查询详情 | GET | /api/sj-dingwei/{id} | 查询单个定位详情 |

---

## 5. 响应格式

统一响应格式：
```json
{
  "sj_code": 200,
  "sj_message": "success",
  "sj_data": {}
}
```

---

## 6. 错误码定义

| 错误码 | 说明 |
|-------|------|
| 400 | 请求参数错误 |
| 401 | 未授权 |
| 403 | 禁止访问 |
| 404 | 资源不存在 |
| 500 | 服务器内部错误 |

---

文档版本：v1.0
创建日期：2026-04-24
维护者：技术负责人
