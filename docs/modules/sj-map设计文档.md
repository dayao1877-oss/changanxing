# sj-map 地图服务模块设计文档

> 文档版本：v1.0
> 创建日期：2026-04-24
> 模块名称：sj-map（地图服务模块）
> 模块编号：SJ-MOD-005

---

## 1. 模块概述

### 1.1 模块描述
sj-map 模块负责长安行系统中的地图相关功能，包括定位记录、地址解析、路径规划、距离计算、打卡记录等。集成高德地图 API。

### 1.2 模块职责
- 定位记录管理（保存司机实时定位）
- 地址解析（经纬度转地址，地址转经纬度）
- 路径规划和距离计算
- 打卡记录管理（司机打卡签到）
- 地图服务集成（高德地图）

### 1.3 依赖关系
- 依赖：Prisma ORM（数据库操作）
- 依赖：sj-auth 模块（身份认证）
- 依赖：高德地图 API
- 关联表：sj_dingwei_jilu、sj_daka_jilu

---

## 2. 功能设计

### 2.1 功能清单

| 功能编号 | 功能名称 | 功能描述 | 优先级 |
|---------|---------|---------|--------|
| SJ-MAP-001 | 保存定位记录 | 保存司机实时定位信息 | 高 |
| SJ-MAP-002 | 查询定位记录 | 查询司机历史定位记录 | 高 |
| SJ-MAP-003 | 地址转经纬度 | 地理编码（地址转坐标） | 高 |
| SJ-MAP-004 | 经纬度转地址 | 逆地理编码（坐标转地址） | 高 |
| SJ-MAP-005 | 路径规划和距离计算 | 计算两点间距离和路线 | 中 |
| SJ-MAP-006 | 打卡记录管理 | 创建和查询打卡记录 | 高 |

---

## 3. 数据结构

### 3.1 使用的数据库表

#### 定位记录表（sj_dingwei_jilu）

| 字段名 | 类型 | 说明 |
|--------|------|------|
| sj_id | BigInt | 主键ID |
| sj_dingdan_id | Int | 关联订单ID |
| sj_siji_id | Int | 关联司机ID |
| sj_jingdu | Decimal | 经度 |
| sj_weidu | Decimal | 纬度 |
| sj_haiba | Decimal | 海拔 |
| sj_sudu | Decimal | 速度 |
| sj_fangxiang | Decimal | 方向/角度 |
| sj_jingdu_zhi | Decimal | 定位精度 |
| sj_dingwei_shijian | DateTime | 定位时间 |
| sj_shangchuan_zhuangtai | Int | 上传状态（0未上传 1已上传） |
| sj_chuangjian_shijian | DateTime | 创建时间 |

#### 打卡记录表（sj_daka_jilu）

| 字段名 | 类型 | 说明 |
|--------|------|------|
| sj_id | Int | 主键ID |
| sj_dingdan_id | Int | 关联订单ID |
| sj_siji_id | Int | 关联司机ID |
| sj_daka_leixing | Int | 打卡类型（1始发地 2途经点 3目的地） |
| sj_tujingdian_xuhao | Int | 途经点序号 |
| sj_weizhi | String | 定位经纬度 |
| sj_dizhi | String | 打卡地址 |
| sj_tupian_lujing | String | 打卡图片路径 |
| sj_daka_shijian | DateTime | 打卡时间 |
| sj_shangchuan_zhuangtai | Int | 上传状态 |
| sj_chuangjian_shijian | DateTime | 创建时间 |

---

## 4. 接口设计

详细API接口文档请参考：[sj-map API文档](./sj-map-API文档.md)

### 4.1 接口清单

| 接口路径 | 方法 | 功能描述 |
|---------|------|---------|
| /api/sj-map/dingwei | POST | 保存定位记录 |
| /api/sj-map/dingwei | GET | 查询定位记录列表 |
| /api/sj-map/daka | POST | 创建打卡记录 |
| /api/sj-map/daka | GET | 查询打卡记录列表 |
| /api/sj-map/geocode | GET | 地理编码（地址转坐标） |
| /api/sj-map/reverse-geocode | GET | 逆地理编码（坐标转地址） |
| /api/sj-map/distance | GET | 计算两点间距离 |

---

## 5. 安全设计

### 5.1 认证要求
所有接口都需要身份认证（携带有效 Token）

### 5.2 数据验证
- 验证经纬度格式
- 必填字段验证
- 限制定位记录频率

---

## 6. 错误码设计

| 错误码 | 错误信息 | 说明 |
|-------|---------|------|
| SJ-MAP-001 | 参数验证失败 | 请求参数不符合要求 |
| SJ-MAP-002 | 地图服务调用失败 | 高德地图API调用失败 |
| SJ-MAP-003 | 定位记录不存在 | 找不到指定的定位记录 |

---

## 7. 测试计划

### 7.1 单元测试
- 定位记录创建和查询测试
- 打卡记录创建和查询测试
- 地址编码和逆编码测试

### 7.2 接口测试
- 按照API文档进行接口测试

---

## 修订记录

| 版本 | 日期 | 修改人 | 说明 |
|------|------|--------|------|
| v1.0 | 2026-04-24 | 技术负责人 | 初始版本 |
