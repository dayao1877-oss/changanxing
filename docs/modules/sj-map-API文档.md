# sj-map 地图服务模块 API 文档

> 文档版本：v1.0
> 创建日期：2026-04-24
> 模块名称：sj-map（地图服务模块）
> 基础路径：/api/sj-map

---

## 通用说明

### 认证方式
所有接口都需要在请求头中携带有效 Token：
```
Authorization: Bearer <token>
```

### 统一响应格式
```json
{
  "sj_code": 200,
  "sj_message": "操作成功",
  "sj_data": {}
}
```

---

## 1. 定位记录接口

### 1.1 保存定位记录

**接口路径**：`POST /api/sj-map/dingwei`

**接口描述**：保存司机实时定位信息

**请求参数**：
```json
{
  "sj_siji_id": 1,
  "sj_dingdan_id": 1,
  "sj_jingdu": 116.480881,
  "sj_weidu": 39.98941,
  "sj_haiba": 50.5,
  "sj_sudu": 60.5,
  "sj_fangxiang": 180,
  "sj_jingdu_zhi": 10,
  "sj_dingwei_shijian": "2026-04-24T12:00:00.000Z"
}
```

**参数说明**：
| 参数名 | 类型 | 必填 | 说明 |
|--------|------|------|
| sj_siji_id | Int | 是 | 司机ID |
| sj_dingdan_id | Int | 否 | 关联订单ID |
| sj_jingdu | Decimal | 是 | 经度 |
| sj_weidu | Decimal | 是 | 纬度 |
| sj_haiba | Decimal | 否 | 海拔 |
| sj_sudu | Decimal | 否 | 速度（km/h） |
| sj_fangxiang | Decimal | 否 | 方向/角度（0-360） |
| sj_jingdu_zhi | Decimal | 否 | 定位精度（米） |
| sj_dingwei_shijian | DateTime | 是 | 定位时间 |

---

### 1.2 查询定位记录列表

**接口路径**：`GET /api/sj-map/dingwei`

**接口描述**：分页查询定位记录

**查询参数**：
| 参数名 | 类型 | 必填 | 默认 |
|--------|------|------|------|
| sj_siji_id | Int | 否 | 司机ID筛选 |
| sj_dingdan_id | Int | 否 | 订单ID筛选 |
| sj_page | Int | 否 | 1 |
| sj_page_size | Int | 否 | 20 |

---

## 2. 打卡记录接口

### 2.1 创建打卡记录

**接口路径**：`POST /api/sj-map/daka`

**接口描述**：创建打卡记录

**请求参数**：
```json
{
  "sj_siji_id": 1,
  "sj_dingdan_id": 1,
  "sj_daka_leixing": 1,
  "sj_tujingdian_xuhao": 1,
  "sj_weizhi": "116.480881,39.98941",
  "sj_dizhi": "北京市朝阳区",
  "sj_tupian_lujing": "/uploads/daka/xxx.jpg",
  "sj_daka_shijian": "2026-04-24T12:00:00.000Z"
}
```

**参数说明**：
| 参数名 | 类型 | 必填 | 说明 |
|--------|------|------|
| sj_siji_id | Int | 是 | 司机ID |
| sj_dingdan_id | Int | 是 | 订单ID |
| sj_daka_leixing | Int | 是 | 打卡类型（1始发地 2途经点 3目的地 |
| sj_tujingdian_xuhao | Int | 否 | 途经点序号 |
| sj_weizhi | String | 是 | 定位经纬度 |
| sj_dizhi | String | 否 | 打卡地址 |
| sj_tupian_lujing | String | 否 | 打卡图片路径 |
| sj_daka_shijian | DateTime | 是 | 打卡时间 |

---

### 2.2 查询打卡记录列表

**接口路径**：`GET /api/sj-map/daka`

**接口描述**：分页查询打卡记录

**查询参数**：
| 参数名 | 类型 | 必填 | 默认 |
|--------|------|------|------|
| sj_siji_id | Int | 否 | 司机ID筛选 |
| sj_dingdan_id | Int | 否 | 订单ID筛选 |
| sj_page | Int | 否 | 1 |
| sj_page_size | Int | 否 | 20 |

---

## 3. 地图服务接口

### 3.1 地理编码（地址转坐标）

**接口路径**：`GET /api/sj-map/geocode`

**接口描述**：将地址转换为经纬度坐标

**查询参数**：
| 参数名 | 类型 | 必填 | 说明 |
|--------|------|------|
| sj_address | String | 是 | 地址 |
| sj_city | String | 否 | 指定城市 |

---

### 3.2 逆地理编码（坐标转地址）

**接口路径**：`GET /api/sj-map/reverse-geocode`

**接口描述**：将经纬度坐标转换为地址

**查询参数**：
| 参数名 | 类型 | 必填 | 说明 |
|--------|------|------|
| sj_jingdu | String | 是 | 经度 |
| sj_weidu | String | 是 | 纬度 |

---

### 3.3 计算两点间距离

**接口路径**：`GET /api/sj-map/distance`

**接口描述**：计算两点间的直线距离或驾驶距离

**查询参数**：
| 参数名 | 类型 | 必填 | 说明 |
|--------|------|------|
| sj_jingdu1 | String | 是 | 起点经度 |
| sj_weidu1 | String | 是 | 起点纬度 |
| sj_jingdu2 | String | 是 | 终点经度 |
| sj_weidu2 | String | 是 | 终点纬度 |
| sj_type | String | 否 | 类型（straight直线 driving驾车） |

---

## 修订记录

| 版本 | 日期 | 修改人 | 说明 |
|------|------|--------|------|
| v1.0 | 2026-04-24 | 技术负责人 | 初始版本 |
